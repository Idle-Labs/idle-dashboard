import React, { Component } from 'react';
import FlexLoader from '../FlexLoader/FlexLoader';
import { Flex, Card, Icon, Text } from 'rimble-ui';
import FunctionsUtil from '../utilities/FunctionsUtil';
import DashboardMenu from '../DashboardMenu/DashboardMenu';

// Import page components
import Stats from '../Stats/Stats';
import Utils from '../Utils/Utils';
import AssetPage from '../AssetPage/AssetPage';
import RoundButton from '../RoundButton/RoundButton';
import Swipeable from '../utilities/components/Swipeable';
import BetaModal from "../utilities/components/BetaModal";
import DashboardCard from '../DashboardCard/DashboardCard';
import CurveStrategy from '../CurveStrategy/CurveStrategy';
import PolygonModal from "../utilities/components/PolygonModal";
import WelcomeModal from "../utilities/components/WelcomeModal";
import TooltipModal from "../utilities/components/TooltipModal";
import MigrateModal from "../utilities/components/MigrateModal";
import UpgradeModal from "../utilities/components/UpgradeModal";
import DashboardHeader from '../DashboardHeader/DashboardHeader';
import RiskAdjustedModal from "../utilities/components/RiskAdjustedModal";

class Dashboard extends Component {
  state = {
    menu:[],
    baseRoute:null,
    clickEvent:null,
    activeModal:null,
    menuOpened:false,
    currentRoute:null,
    pageComponent:null,
    currentSection:null,
    currentNetwork:null,
    selectedSection:null,
    tokensToMigrate:null,
    showResetButton:false,
    selectedSubsection:null,
    pageComponentProps:null,
    oldIdleTokensToMigrate:null,
    protocolsTokensBalances:null,
  };

  timeoutId = null;

  // Utils
  functionsUtil = null;
  loadUtils(){
    if (this.functionsUtil){
      this.functionsUtil.setProps(this.props);
    } else {
      this.functionsUtil = new FunctionsUtil(this.props);
    }

    window.functionsUtil = this.functionsUtil;
  }

  async loadMenu() {
    const extraicons=this.functionsUtil.getGlobalConfig(['extraicons']);
    const baseRoute = this.functionsUtil.getGlobalConfig(['dashboard','baseRoute']);

    const menu = [];
    const currentNetwork = this.functionsUtil.getCurrentNetwork();

    const strategies = this.functionsUtil.getGlobalConfig(['strategies']);
    Object.keys(strategies).filter( s => ( !strategies[s].comingSoon && (!strategies[s].enabledEnvs.length || strategies[s].enabledEnvs.includes(this.props.currentEnv)) ) ).forEach(strategy => {
      const strategyInfo = strategies[strategy];
      const imageInfo=extraicons[strategy];
      menu.push({
        submenu:[],
        color:'#fff',
        selected:false,
        image:imageInfo.icon,
        label:strategyInfo.title,
        bgColor:strategyInfo.color,
        route:baseRoute+'/'+strategy,
        visible:strategyInfo.visible,
        imageDark:imageInfo.iconDark,
        component:strategyInfo.component,
        imageInactive:imageInfo.iconInactive,
        imageInactiveDark:imageInfo.iconInactiveDark
      });
    });
    

    const curveConfig = this.functionsUtil.getGlobalConfig(['curve']);

    // Add Curve
    if (curveConfig.enabled){
      const curveParams = Object.assign({
        submenu:[],
        selected:false,
        component:CurveStrategy,
      },curveConfig.params);

      menu.push(curveParams);
    }

    // Add Stake
    const stakeConfig = this.functionsUtil.getGlobalConfig(['tools','stake']);
    if (stakeConfig.enabled && (!stakeConfig.availableNetworks || stakeConfig.availableNetworks.includes(currentNetwork.id))){
      menu.push(
        {
          submenu:[],
          label:'Stake',
          selected:false,
          color:'dark-gray',
          route:'/dashboard/stake',
          image:extraicons['stake'].icon,
          imageDark:extraicons['stake'].iconDark,
          bgColor:this.props.theme.colors.primary,
          imageInactive:extraicons['stake'].iconInactive,
          imageInactiveDark:extraicons['stake'].iconInactiveDark,
          component:Utils,
          componentProps:{
            showBreadCrumb:false,
            toolProps:stakeConfig.props,
            selectedSubsection:stakeConfig
          },
        }
      );
    }

    const statsInfo = this.functionsUtil.getGlobalConfig(['stats']);
    if (!statsInfo.availableNetworks || statsInfo.availableNetworks.includes(currentNetwork.id)){
      menu.push(
        {
          submenu:[],
          label:'Stats',
          selected:false,
          component:Stats,
          bgColor:'#21f36b',
          color:'dark-gray',
          route:'/dashboard/stats',
          image:extraicons['stats'].icon,
          imageDark:extraicons['stats'].iconDark,
          imageInactive:extraicons['stats'].iconInactive,
          imageInactiveDark:extraicons['stats'].iconInactiveDark,
        }
      );
    }
    
    // Add tools
    menu.push(
      {
        label:'Tools',
        selected:false,
        component:Utils,
        color:'dark-gray',
        route:'/dashboard/tools',
        image:extraicons['tools'].icon,
        imageDark:extraicons['tools'].iconDark,
        bgColor:this.props.theme.colors.primary,
        imageInactive:extraicons['tools'].iconInactive,
        imageInactiveDark:extraicons['tools'].iconInactiveDark,
        submenu:Object.values(this.functionsUtil.getGlobalConfig(['tools'])).filter( tool => (tool.enabled && (!tool.availableNetworks || tool.availableNetworks.includes(currentNetwork.id))) )
      }
    );

    // Add Forum
    menu.push(
      {
        submenu:[],
        mobile:false,
        label:'Forum',
        selected:false,
        component:null,
        color:'dark-gray',
        bgColor:'#ff0000',
        isExternalLink:true,
        image:extraicons['forum'].icon,
        imageDark:extraicons['forum'].iconDark,
        imageInactive:extraicons['forum'].iconInactive,
        imageInactiveDark:extraicons['forum'].iconInactiveDark,
        route:this.functionsUtil.getGlobalConfig(['forumURL'])
      }
    );

    await this.setState({
      menu,
      currentNetwork
    });
  }

  resetModal = () => {
    this.setState({
      activeModal: null
    });
  }

  openTooltipModal = (modalTitle,modalContent) => {

    this.functionsUtil.sendGoogleAnalyticsEvent({
      eventCategory: 'UI',
      eventAction: modalTitle,
      eventLabel: 'TooltipModal'
    });

    this.setState({
      modalTitle,
      modalContent
    },() => {
      this.setActiveModal('tooltip');
    })
  }

  setActiveModal = (activeModal) => {
    this.setState({
      activeModal
    });
  }

  async loadParams() {
    const { match: { params } } = this.props;

    const baseRoute = this.functionsUtil.getGlobalConfig(['dashboard','baseRoute']);
    let currentRoute = baseRoute;

    let pageComponent = null;
    let selectedToken = null;
    let currentSection = null;
    let selectedStrategy = null;
    let pageComponentProps = null;

    // Set strategy
    if (params.section){
      currentSection = params.section;
      const param1 = params.param1;
      const param2 = params.param2;

      const section_is_strategy = Object.keys(this.props.availableStrategies).includes(currentSection.toLowerCase());
      const param1_is_strategy = param1 && Object.keys(this.props.availableStrategies).includes(param1.toLowerCase());

      if (section_is_strategy || param1_is_strategy){

        if (!section_is_strategy){
          currentRoute += '/'+currentSection;
        }

        selectedStrategy = section_is_strategy ? currentSection : param1;
        currentRoute += '/'+selectedStrategy;

        // Set token
        const param1_is_token = param1 && Object.keys(this.props.availableStrategies[selectedStrategy]).includes(param1.toUpperCase());
        const param2_is_token = param2 && Object.keys(this.props.availableStrategies[selectedStrategy]).includes(param2.toUpperCase());
        if (param1_is_token || param2_is_token){
          selectedToken = param1_is_token ? param1.toUpperCase() : param2.toUpperCase();
          currentRoute += '/'+selectedToken;

          if (section_is_strategy){
            pageComponent = AssetPage;
          }
        }
      } else {
        currentRoute += '/'+params.section;

        if (params.param1 && params.param1.length){
          currentRoute += '/'+params.param1;
        }

        // if (params.param2 && params.param2.length){
        //   currentRoute += '/'+params.param2;
        // }
      }
    }

    const menu = this.state.menu;

    let selectedSection = null;
    let selectedSubsection = null;

    menu.forEach(m => {
      m.selected = false;
      const sectionRoute = baseRoute+'/'+params.section;
      if (currentRoute.toLowerCase() === m.route.toLowerCase() || ( !m.submenu.length && m.route.toLowerCase() === sectionRoute.toLowerCase() )){
        m.selected = true;
        if (pageComponent === null){
          pageComponent = m.component;
          pageComponentProps = m.componentProps;
        }
      } else if (m.submenu.length) {
        m.submenu.forEach(subm => {
          subm.selected = false;
          const submRoute = m.route+'/'+subm.route;
          if (submRoute.toLowerCase() === currentRoute.toLowerCase()){
            m.selected = true;
            subm.selected = true;

            // Set component, if null use parent
            if (pageComponent === null){
              if (subm.component){
                pageComponent = subm.component;
                pageComponentProps = m.componentProps;
              } else {
                pageComponent = m.component;
                pageComponentProps = m.componentProps;
              }
            }
          }

          // Set selected subsection
          if (subm.selected){
            selectedSubsection = subm;
          }

        });
      }

      // Set selected section
      if (m.selected){
        selectedSection = m;
      }
    });

    // console.log('pageComponent',params,pageComponent);

    // Exit if no strategy and token selected
    if (!pageComponent){
      return this.goToSection('/',false);
    }

    // console.log('loadParams',selectedStrategy,selectedToken);
    await this.props.setStrategyToken(selectedStrategy,selectedToken);
    
    // Send GA pageview
    this.functionsUtil.sendGoogleAnalyticsPageview(currentRoute);

    const newState = {
      menu,
      params,
      baseRoute,
      currentRoute,
      pageComponent,
      currentSection,
      selectedSection,
      pageComponentProps,
      selectedSubsection
    };

    await this.setState(newState);

    return newState;
  }

  componentWillUnmount(){
    if (this.timeoutId){
      window.clearTimeout(this.timeoutId);
    }
  }

  async componentWillMount() {

    this.props.setCurrentSection('dashboard');

    this.loadUtils();
    await this.loadMenu();
    this.loadParams();
  }

  async componentDidMount() {

    this.timeoutId = window.setTimeout(() => {
      if (!this.props.accountInizialized || !this.props.contractsInitialized){
        this.setState({
          showResetButton:true
        });
      }
    },20000);

    if (!this.props.web3){
      return this.props.initWeb3();
    } else if (!this.props.accountInizialized){
      return this.props.initAccount();
    } else if (!this.props.contractsInitialized){
      return this.props.initializeContracts();
    }

    this.loadUtils();
    await this.loadMenu();
    this.loadParams();

    const viewOnly = this.props.connectorName === 'custom';
    if (!viewOnly){
      this.checkModals();
    }
  }

  async componentDidUpdate(prevProps,prevState) {

    this.loadUtils();

    const prevParams = prevProps.match.params;
    const params = this.props.match.params;

    const isMobileChanged = prevProps.isMobile !== this.props.isMobile;
    if (isMobileChanged){
      this.setState({
        menuOpened:false
      });
    }

    if (JSON.stringify(prevParams) !== JSON.stringify(params)){
      await this.setState({
        pageComponent:null
      }, () => {
        this.loadParams();
      });
    }

    const requiredNetworkChanged = JSON.stringify(prevProps.network.required) !== JSON.stringify(this.props.network.required);
    const networkChanged = (!prevProps.networkInitialized && this.props.networkInitialized) || requiredNetworkChanged;
    if (networkChanged){
      await this.loadMenu();
      this.loadParams();
    }

    const viewOnly = this.props.connectorName === 'custom';
    const accountChanged = prevProps.account !== this.props.account;
    const strategyChanged = this.props.selectedStrategy && prevProps.selectedStrategy !== this.props.selectedStrategy;
    const availableTokensChanged = JSON.stringify(prevProps.availableTokens) !== JSON.stringify(this.props.availableTokens);
    const accountInizialized = this.props.accountInizialized && prevProps.accountInizialized !== this.props.accountInizialized;
    const contractsInitialized = this.props.contractsInitialized && prevProps.contractsInitialized !== this.props.contractsInitialized;

    if (!viewOnly && (networkChanged || accountChanged || accountInizialized || contractsInitialized || strategyChanged || availableTokensChanged)){
      this.checkModals();
    }
  }

  async checkModals(){

    if (this.props.selectedToken || !this.props.accountInizialized || !this.props.contractsInitialized || !this.props.availableStrategies || !this.props.availableTokens){
      return null;
    }

    await this.checkRiskAdjusted();
    await this.checkPolygonModal();
    await this.checkBetaApproval();
    await this.checkTokensToMigrate();
    await this.checkWelcomeModal();
    await this.checkProtocolsTokensBalances();
  }

  async checkRiskAdjusted(){
    const isRiskAdjusted = this.props.selectedStrategy === 'risk';
    if (isRiskAdjusted){
      const activeModal = 'risk';
      if (activeModal !== this.state.activeModal){
        await this.setState({
          activeModal
        });
        return activeModal;
      }
    }
  }

  async checkPolygonModal(){
    const isPolygon = this.state.currentNetwork.provider === 'polygon';
    const isPolygonApproved = this.functionsUtil.getStoredItem('polygonApproved',false,false);

    console.log('checkPolygonModal',this.state.currentNetwork,isPolygon);

    // Show Beta Warning modal
    if (isPolygon && !isPolygonApproved){
      const activeModal = 'polygon';
      if (activeModal !== this.state.activeModal){
        await this.setState({
          activeModal
        });
        return activeModal;
      }
    }
  }

  async checkBetaApproval(){
    const isOriginUrl = this.functionsUtil.checkUrlOrigin();
    const isBetaApproved = this.functionsUtil.getStoredItem('betaApproved',false,false);

    // Show Beta Warning modal
    if (!isOriginUrl && !isBetaApproved){
      const activeModal = 'beta';
      if (activeModal !== this.state.activeModal){
        await this.setState({
          activeModal
        });
        return activeModal;
      }
    }
  }

  async checkTokensToMigrate(){

    const showUpgradeModal = this.functionsUtil.getStoredItem('dontShowUpgradeModal',false,null) !== null ? false : true;
    if (this.props.selectedToken || !showUpgradeModal || !this.props.availableTokens || this.state.activeModal !== null){
      return null;
    }

    const tokensToMigrate = await this.functionsUtil.getTokensToMigrate();
    const oldIdleTokensToMigrate = await this.functionsUtil.getProtocolsTokensBalances('idle');

    // console.log('tokensToMigrate',tokensToMigrate);
    
    if ((tokensToMigrate && Object.keys(tokensToMigrate).length>0) || (oldIdleTokensToMigrate && Object.keys(oldIdleTokensToMigrate).length>0)){
      const activeModal = 'upgrade';
      if (activeModal !== this.state.activeModal){
        await this.setState({
          activeModal,
          tokensToMigrate,
          oldIdleTokensToMigrate
        });

        return activeModal;
      }
    }

    return null;
  }

  async checkWelcomeModal(){
    if (!this.props.account || !this.props.accountInizialized || !this.props.contractsInitialized){
      return null;
    }

    // Show welcome modal
    if (this.props.account && this.state.activeModal === null){
      let welcomeIsOpen = false;

      const welcomeModalProps = this.functionsUtil.getGlobalConfig(['modals','welcome']);

      if (welcomeModalProps.enabled && localStorage){

        // Check the last login of the wallet
        const currTime = new Date().getTime();
        const walletAddress = this.props.account.toLowerCase();
        let lastLogin = localStorage.getItem('lastLogin') ? JSON.parse(localStorage.getItem('lastLogin')) : {};

        // First login
        if (!lastLogin[walletAddress]){
          lastLogin[walletAddress] = {
            'signedUp':false,
            'lastTime':currTime
          };
          welcomeIsOpen = true;
        // User didn't sign up
        } else if (!lastLogin[walletAddress].signedUp) {
          const lastTime = parseInt(lastLogin[walletAddress].lastTime);
          const timeFromLastLogin = (currTime-lastTime)/1000;
          welcomeIsOpen = timeFromLastLogin>=welcomeModalProps.frequency; // 1 day since last login
        }

        if (welcomeIsOpen){
          lastLogin[walletAddress].lastTime = currTime;
          this.functionsUtil.setLocalStorage('lastLogin',JSON.stringify(lastLogin));
        }
      }

      const activeModal = welcomeIsOpen ? 'welcome' : this.state.activeModal;
      if (this.state.activeModal !== activeModal){
        await this.setState({
          activeModal
        });

        return activeModal;
      }
    }

    return null;
  }

  async checkProtocolsTokensBalances() {

    if (!this.props.account || !this.props.accountInizialized || !this.props.contractsInitialized){
      return null;
    }

    // Show migration modal if no other modals are opened
    const migrateModalEnabled = this.functionsUtil.getGlobalConfig(['modals','migrate','enabled']);
    const showMigrateModal = this.functionsUtil.getStoredItem('dontShowMigrateModal',false,null) !== null ? false : true;

    if (this.state.activeModal === null && migrateModalEnabled && showMigrateModal && !this.state.protocolsTokensBalances){
      const protocolsTokensBalances = await this.functionsUtil.getProtocolsTokensBalances();
      const activeModal = protocolsTokensBalances && Object.keys(protocolsTokensBalances).length>0 ? 'migrate' : null;
      const newState = {
        activeModal,
        protocolsTokensBalances
      };
      await this.setState(newState);
      return activeModal;
    }

    return null;
  }

  goToSection(section,isDashboard=true){

    // Remove dashboard route
    if (isDashboard){
      section = section.replace(this.state.baseRoute +'/','');
    }

    const newRoute = isDashboard ? this.state.baseRoute +'/' + section : section;
    window.location.hash=newRoute;

    // Send GA event
    this.functionsUtil.sendGoogleAnalyticsEvent({
      eventCategory: 'UI',
      eventAction: 'goToSection',
      eventLabel: newRoute
    });

    window.scrollTo(0, 0);
  }

  logout = async () => {
    this.props.setConnector('Infura','Infura');
    await this.props.initWeb3('Infura');
  }

  changeToken(selectedToken){
    selectedToken = selectedToken.toUpperCase();
    if (Object.keys(this.props.availableTokens).includes(selectedToken)){
      const routeParts = [];

      // Add section
      if (this.state.currentSection.toLowerCase() !== this.props.selectedStrategy.toLowerCase()){
        routeParts.push(this.state.currentSection);
      }

      // Add strategy
      routeParts.push(this.props.selectedStrategy); 

      // Add token
      routeParts.push(selectedToken);

      this.goToSection(routeParts.join('/'));
    }
  }

  propagateClickEvent(clickEvent){
    this.setState({
      clickEvent:clickEvent.target
    });
  }

  setMenu(menuOpened){
    this.setState({
      menuOpened
    });
  }

  toggleMenu(){
    const menuOpened = !this.state.menuOpened;
    this.setMenu(menuOpened);
  }

  swipeCallback(eventData){
    // console.log('swipeCallback',eventData);
    if (eventData.dir === 'Right'){
      this.setMenu(true);
    } else if (eventData.dir === 'Left'){
      this.setMenu(false);
    }
  }

  render() {

    const PageComponent = this.state.pageComponent ? this.state.pageComponent : null;
    return (
      <Swipeable
        callback={this.swipeCallback.bind(this)}
      >
        <Flex
          height={'100vh'}
          position={'fixed'}
          flexDirection={'row'}
          className={this.props.themeMode}
          backgroundColor={['dashboardBg','white']}
          width={this.props.isMobile && this.state.menuOpened ? '180vw' : '100vw'}
          /*onClick={ e => this.propagateClickEvent(e) }*/
        >
          {
            (!this.props.isMobile || this.state.menuOpened) && (
              <Flex
                bottom={0}
                zIndex={99999}
                width={['80vw',1/6]}
                position={'relative'}
                flexDirection={'column'}
              >
                <Card
                  p={3}
                  border={0}
                  width={'auto'}
                  height={'100vh'}
                  backgroundColor={'menuBg'}
                  borderColor={this.props.theme.colors.menuRightBorder}
                  borderRight={`1px solid ${this.props.theme.colors.menuRightBorder}`}
                  >
                  <DashboardMenu
                    {...this.props}
                    menu={this.state.menu}
                    closeMenu={e => this.setMenu(false)}
                  />
                </Card>
              </Flex>
            )
          }
          <Flex
            py={3}
            mb={0}
            px={[3,5]}
            width={['100vw',5/6]}
            style={{
              overflowY:'scroll',
              overflowX:'hidden'
            }}
            height={['100vh','auto']}
            flexDirection={'columns'}
            backgroundColor={'dashboardBg'}
          >
            {
              !this.props.accountInizialized || !this.props.contractsInitialized || !PageComponent ? (
                <Flex
                  width={1}
                  minHeight={'50vg'}
                  alignItems={'center'}
                  flexDirection={'column'}
                  justifyContent={'center'}
                >
                  {
                    !this.props.network.isCorrectNetwork ? (
                      <DashboardCard
                        cardProps={{
                          p:3,
                          mt:3,
                          width:[1,0.35]
                        }}
                      >
                        <Flex
                          alignItems={'center'}
                          flexDirection={'column'}
                        >
                          <Icon
                            size={'2.3em'}
                            name={'Warning'}
                            color={'cellText'}
                          />
                          <Text
                            mt={2}
                            fontSize={2}
                            color={'cellText'}
                            textAlign={'center'}
                          >
                            The <strong>{this.functionsUtil.capitalize(this.props.network.current.name)} Network</strong> is not supported, please switch to the correct network.
                          </Text>
                        </Flex>
                      </DashboardCard>
                    ) : !this.state.showResetButton ? (
                      <FlexLoader
                        textProps={{
                          textSize:4,
                          fontWeight:2
                        }}
                        loaderProps={{
                          mb:3,
                          size:'40px'
                        }}
                        flexProps={{
                          my:3,
                          flexDirection:'column'
                        }}
                        text={ !this.props.accountInizialized ? 'Loading account...' : ( !this.props.contractsInitialized ? 'Loading contracts...' : 'Loading assets...' )}
                      />
                    ) : (
                      <DashboardCard
                        cardProps={{
                          p:3,
                          mt:3,
                          width:[1,0.35]
                        }}
                      >
                        <Flex
                          alignItems={'center'}
                          flexDirection={'column'}
                        >
                          <Icon
                            size={'2.3em'}
                            name={'Warning'}
                            color={'cellText'}
                          />
                          <Text
                            mt={2}
                            fontSize={2}
                            color={'cellText'}
                            textAlign={'center'}
                          >
                            Idle can't connect to your wallet!<br />Make sure that your wallet is unlocked and try again.
                          </Text>
                          <RoundButton
                            buttonProps={{
                              mt:3,
                              width:[1,1/2]
                            }}
                            handleClick={this.logout.bind(this)}
                          >
                            Logout
                          </RoundButton>
                        </Flex>
                      </DashboardCard>
                    )
                  }
                </Flex>
              ) : (
                <Flex
                  width={1}
                  flexDirection={'column'}
                >
                  <DashboardHeader
                    menuOpened={this.state.menuOpened}
                    clickEvent={this.state.clickEvent}
                    toggleMenu={this.toggleMenu.bind(this)}
                    goToSection={this.goToSection.bind(this)}
                    {...this.props}
                  />
                  {
                    PageComponent &&
                      <PageComponent
                        {...this.props}
                        match={{ params:{} }}
                        urlParams={this.state.params}
                        changeToken={this.changeToken.bind(this)}
                        goToSection={this.goToSection.bind(this)}
                        selectedSection={this.state.selectedSection}
                        selectedSubsection={this.state.selectedSubsection}
                        openTooltipModal={this.openTooltipModal.bind(this)}
                        {...this.state.pageComponentProps}
                        />
                  }
                </Flex>
              )
            }
          </Flex>
          {
            this.state.currentNetwork && 
              <PolygonModal
                closeModal={this.resetModal}
                goToSection={this.goToSection.bind(this)}
                currentNetwork={this.state.currentNetwork}
                isOpen={this.state.activeModal === 'polygon'}
              />
          }
          <BetaModal
            closeModal={this.resetModal}
            isOpen={this.state.activeModal === 'beta'}
          />
          <RiskAdjustedModal
            closeModal={this.resetModal}
            isOpen={this.state.activeModal === 'risk'}
          />
          <UpgradeModal
            {...this.props}
            closeModal={this.resetModal}
            goToSection={this.goToSection.bind(this)}
            tokensToMigrate={this.state.tokensToMigrate}
            isOpen={this.state.activeModal === 'upgrade'}
            oldIdleTokensToMigrate={this.state.oldIdleTokensToMigrate}
          />
          <MigrateModal
            {...this.props}
            closeModal={this.resetModal}
            goToSection={this.goToSection.bind(this)}
            isOpen={this.state.activeModal === 'migrate'}
            protocolsTokensBalances={this.state.protocolsTokensBalances}
          />
          <TooltipModal
            closeModal={this.resetModal}
            title={this.state.modalTitle}
            content={this.state.modalContent}
            isOpen={this.state.activeModal === 'tooltip'}
          />
          <WelcomeModal
            closeModal={this.resetModal}
            account={this.props.account}
            simpleID={this.props.simpleID}
            network={this.props.network.current}
            tokenName={this.props.selectedToken}
            initSimpleID={this.props.initSimpleID}
            baseTokenName={this.props.selectedToken}
            isOpen={this.state.activeModal === 'welcome'}
          />
        </Flex>
      </Swipeable>
    );
  }
}

export default Dashboard;