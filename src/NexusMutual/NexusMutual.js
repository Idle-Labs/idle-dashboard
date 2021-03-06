import ExtLink from '../ExtLink/ExtLink';
import IconBox from '../IconBox/IconBox';
import React, { Component } from 'react';
import FlexLoader from '../FlexLoader/FlexLoader';
// import NXMaster from '../abis/nexus/NXMaster.json';
import RoundButton from '../RoundButton/RoundButton';
import FunctionsUtil from '../utilities/FunctionsUtil';
import ButtonLoader from '../ButtonLoader/ButtonLoader';
import AssetSelector from '../AssetSelector/AssetSelector';
import DashboardCard from '../DashboardCard/DashboardCard';
import CardIconButton from '../CardIconButton/CardIconButton';
import GenericSelector from '../GenericSelector/GenericSelector';
import SendTxWithBalance from '../SendTxWithBalance/SendTxWithBalance';
import ExecuteTransaction from '../ExecuteTransaction/ExecuteTransaction';
import { Flex, Box, Text, Input, Link, Progress, Icon, Tooltip } from "rimble-ui";

class NexusMutual extends Component {

  state = {
    step:1,
    quote:null,
    steps:{
      1:'Get Quote',
      2:'Buy Cover'
    },
    periodOptions:{
      30:{
        label:'30d'
      },
      60:{
        label:'60d'
      },
      90:{
        label:'90d'
      },
      365:{
        label:'1y'
      }
    },
    coverId:null,
    claimId:null,
    capacity:null,
    loading:false,
    coverCost:null,
    amountValue:'',
    periodValue:'',
    yearlyCost:null,
    maxCapacity:null,
    amountValid:true,
    periodValid:true,
    tokenConfig:null,
    tokenBalance:null,
    selectedToken:null,
    claimableCovers:[],
    tokenApproved:false,
    selectedPeriod:null,
    maxPriceWithFee:null,
    transactionParams:[],
    transactionValue:null,
    yieldTokenBalance:null,
    selectedUnderlying:null,
    selectedAction:'deposit',
    yieldTokenApproved:false,
    claimButtonDisabled:false,
    selectedCoverToClaim:null,
    defaultClaimableCover:null,
    selectedUnderlyingConfig:null
  };

  // Utils
  functionsUtil = null;

  loadUtils(){
    if (this.functionsUtil){
      this.functionsUtil.setProps(this.props);
    } else {
      this.functionsUtil = new FunctionsUtil(this.props);
    }
  }

  async componentWillMount(){
    this.loadUtils();
    this.loadContracts();
  }

  async loadContracts(){
    const claimableCovers = [];
    const nexusMutualCoverages = await this.functionsUtil.getNexusMutualCoverages(this.props.account);
    nexusMutualCoverages.forEach( coverage => {
      if (coverage.incident){
        claimableCovers.push(coverage);
      }
    });

    const validClaimableCoverFromParam = this.props.urlParams.param3 ? claimableCovers.find( cover => parseInt(cover.value) === parseInt(this.props.urlParams.param3) ) : null;

    const defaultClaimableCover = claimableCovers.length>0 ? claimableCovers[0] : null;
    const selectedCoverToClaim = validClaimableCoverFromParam ? validClaimableCoverFromParam : defaultClaimableCover || null;

    this.setState({
      claimableCovers,
      selectedCoverToClaim,
      defaultClaimableCover
    });

    const selectedAction = ['deposit','claim'].includes(this.props.urlParams.param2) ? this.props.urlParams.param2 : this.state.selectedAction;
    const paramIsValidToken = this.props.urlParams.param3 && Object.keys(this.props.toolProps.availableTokens).includes(this.props.urlParams.param3);
    const selectedToken = paramIsValidToken ? this.props.urlParams.param3 : Object.keys(this.props.toolProps.availableTokens)[0];

    this.setSelectedAction(selectedAction);
    this.changeSelectedToken(selectedToken);
    // console.log('coverBoughtEvents',coverBoughtEvents,'claimSubmittedEvents',claimSubmittedEvents,'claimableCovers',claimableCovers);
  }

  async getPoolCapacity(selectedUnderlying,tokenConfig){
    const requiredNetwork = this.functionsUtil.getGlobalConfig(['network','requiredNetwork']);
    const baseEndpoint = this.functionsUtil.getGlobalConfig(['network','providers','nexus','endpoints',requiredNetwork]);
    const response = await this.functionsUtil.makeRequest(`${baseEndpoint}contracts/${tokenConfig.address}/capacity`);
    if (response && response.data){
      const capacity = response.data;
      // console.log('getPoolCapacity',capacity);
      const maxCapacity = capacity && capacity[`capacity${selectedUnderlying}`] ? this.functionsUtil.fixTokenDecimals(capacity[`capacity${selectedUnderlying}`],tokenConfig.decimals) : this.functionsUtil.BNify(0);
      return maxCapacity;
    }
    return false;
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();

    const selectedTokenChanged = prevState.selectedToken !== this.state.selectedToken;
    const selectedUnderlyingChanged = prevState.selectedUnderlying !== this.state.selectedUnderlying;
    if (selectedTokenChanged || selectedUnderlyingChanged){
      this.loadTokenData();
    }
  }

  async loadTokenData(){

    const isETH = this.state.selectedToken === 'ETH';
    const selectedUnderlyingConfig = this.state.tokenConfig.underlying[this.state.selectedUnderlying];

    // Init Underlying Contract
    await Promise.all([
      this.props.initContract(this.state.tokenConfig.token, this.state.tokenConfig.realAddress, this.state.tokenConfig.abi),
      this.props.initContract(selectedUnderlyingConfig.name, selectedUnderlyingConfig.address, selectedUnderlyingConfig.abi)
    ]);

    let [
      maxCapacity,
      yieldTokenBalance,
      yieldTokenApproved,
      tokenApproved,
      tokenBalance
    ] = await Promise.all([
      this.getPoolCapacity(this.state.selectedUnderlying,this.state.tokenConfig),
      this.functionsUtil.getTokenBalance(this.state.tokenConfig.token,this.props.account),
      this.functionsUtil.checkTokenApproved(this.state.selectedToken,this.props.contractInfo.address,this.props.account),
      this.functionsUtil.checkTokenApproved(selectedUnderlyingConfig.name,this.props.contractInfo.address,this.props.account),
      isETH ? this.functionsUtil.getETHBalance(this.props.account,false) : this.functionsUtil.getTokenBalance(selectedUnderlyingConfig.name,this.props.account,false),
    ]);

    tokenBalance = tokenBalance || this.functionsUtil.BNify(0);
    yieldTokenBalance = yieldTokenBalance || this.functionsUtil.BNify(0);

    this.setState({
      maxCapacity,
      tokenBalance,
      tokenApproved,
      yieldTokenBalance,
      yieldTokenApproved,
      selectedUnderlyingConfig
    });
  }

  async changeSelectedToken(selectedToken){
    const periodValue = '';
    const amountValue = '';
    const tokenConfig = this.props.toolProps.availableTokens[selectedToken];
    const selectedUnderlying = Object.keys(tokenConfig.underlying)[0];

    this.setState({
      amountValue,
      periodValue,
      tokenConfig,
      selectedToken,
      selectedUnderlying
    });
  }

  changeSelectedUnderlying(selectedUnderlying){
    this.setState({
      selectedUnderlying
    });
  }

  setMaxCoverAmount(){
    const amountValue = this.state.maxCapacity.toFixed();
    this.changeAmount({
      target:{
        value:amountValue
      }
    });
  }

  changeAmount = (e) => {
    const amountValue = e.target.value.length && !isNaN(e.target.value) ? Math.floor(e.target.value) : '';
    const amountValid = this.functionsUtil.BNify(amountValue).gt(0) && this.functionsUtil.BNify(amountValue).lte(this.state.maxCapacity);
    this.setState({
      amountValue,
      amountValid
    });
  }

  changePeriod = (e) => {
    const periodValue = e.target.value.length && !isNaN(e.target.value) ? e.target.value : '';
    const periodValid = parseInt(periodValue)>=30 && parseInt(periodValue)<=365;
    this.setState({
      periodValue,
      periodValid,
      selectedPeriod:null
    });
  }

  selectPeriod = (selectedPeriod) => {
    this.changePeriod({
      target:{
        value:selectedPeriod
      }
    });
  }

  async getQuote() {

    this.setState({
      loading:true
    });

    // Setup your cover data.
    const coverData = {
      period: this.state.periodValue, // days
      coverAmount: this.state.amountValue, // ETH in units not wei
      currency: this.state.selectedUnderlying,
      contractAddress: this.state.tokenConfig.address, // the contract you will be buying cover for
      asset: this.state.tokenConfig.underlying[this.state.selectedUnderlying].address
    };

    // URL to request a quote for.
    // const quoteURL = 'https://api.nexusmutual.io/v1/quote?' +
    const requiredNetwork = this.functionsUtil.getGlobalConfig(['network','requiredNetwork']);
    const baseEndpoint = this.functionsUtil.getGlobalConfig(['network','providers','nexus','endpoints',requiredNetwork]);
    const quoteURL = `${baseEndpoint}quote?coverAmount=${coverData.coverAmount}&currency=${coverData.currency}&period=${coverData.period}&contractAddress=${coverData.contractAddress}`;

    const response = await this.functionsUtil.makeRequest(quoteURL);

    const quote = response && response.data ? response.data : null;

    if (!quote){
      this.setState({
        loading:false
      });
      return false;
    }

    // encode the signature result in the data field
    const data = this.props.web3.eth.abi.encodeParameters(
      ['uint', 'uint', 'uint', 'uint', 'uint8', 'bytes32', 'bytes32'],
      [quote.price, quote.priceInNXM, quote.expiresAt, quote.generatedAt, quote.v, quote.r, quote.s],
    );

    const COVER_TYPE = this.functionsUtil.toBN(0);
    const feePercentage = await this.functionsUtil.genericContractCall(this.props.contractInfo.name,'feePercentage');
    const basePrice = this.functionsUtil.toBN(quote.price);
    const priceWithFee = basePrice.mul(this.functionsUtil.toBN(feePercentage)).divn(10000).add(basePrice);
    const amountInWei = this.functionsUtil.toWei(coverData.coverAmount.toString());
    const maxPriceWithFee = priceWithFee;
    const coverCost = this.functionsUtil.fixTokenDecimals(maxPriceWithFee,this.state.tokenConfig.decimals);
    const yearlyCost = coverCost.div(this.state.amountValue).times(365).div(this.state.periodValue).times(100);

    // console.log('coverCost',maxPriceWithFee,coverCost.toFixed(),this.state.amountValue.toFixed(),this.state.periodValue,yearlyCost.toFixed());

    const transactionParams = [
      coverData.contractAddress,
      coverData.asset,
      amountInWei,
      coverData.period,
      COVER_TYPE,
      maxPriceWithFee,
      data
    ];

    const transactionValue = this.state.selectedUnderlying === 'ETH' ? priceWithFee : null;

    // console.log(feePercentage,transactionParams,transactionValue,quote);

    // debugger;

    const step = 2;
    const loading = false;

    this.setState({
      step,
      quote,
      loading,
      coverCost,
      yearlyCost,
      maxPriceWithFee,
      transactionValue,
      transactionParams
    });
  }

  approveSucceeded = (tx) => {
    const tokenApproved = true;
    this.setState({
      tokenApproved
    });
  }

  yieldTokenApproveSucceeded = (tx) => {
    const yieldTokenApproved = true;
    this.setState({
      yieldTokenApproved
    });
  }

  claimInputChange = (amount) => {
    const normalizedAmount = this.functionsUtil.normalizeTokenAmount(amount,this.state.tokenConfig.decimals);
    const claimButtonDisabled = this.functionsUtil.BNify(amount).lte(0) || this.functionsUtil.BNify(normalizedAmount).gt(this.state.selectedCoverToClaim.coveredTokenAmount);
    this.setState({
      claimButtonDisabled
    });
  }

  getClaimTransactionParams = (coveredTokenAmount) => {
    return {
      methodName:'claimTokens',
      methodParams:[this.state.selectedCoverToClaim.value,this.state.selectedCoverToClaim.incident.id,coveredTokenAmount,this.state.tokenConfig.realAddress]
    };
  }

  claimTransactionSucceeded = (tx) => {
    // const claimId = this.functionsUtil.getGlobalConfig(['txReceipt','events','ClaimSubmitted','returnValues','claimId'],tx);
    // this.setState({
    //   claimId
    // });
    this.loadContracts();
  }

  buyCoverTransactionSucceeded = (tx) => {
    const coverId = this.functionsUtil.getGlobalConfig(['txReceipt','events','CoverBought','returnValues','coverId'],tx);
    this.setState({
      coverId
    });
  }

  setSelectedAction(selectedAction){
    if (selectedAction !== this.state.selectedAction){
      this.setState({
        selectedAction
      });
    }
  }

  selectCoverToClaim(coverId){
    const selectedCoverToClaim = this.state.selectedCoverToClaim ? this.state.claimableCovers.find( cover => parseInt(cover.value) === coverId ) : null;
    console.log('selectCoverToClaim',selectedCoverToClaim);
    this.setState({
      selectedCoverToClaim
    });
  }

  reset(){
    const step = 1;
    const quote = null;
    const coverId = null;
    const periodValue = '';
    const amountValue = '';
    const transactionParams = [];
    this.setState({
      step,
      quote,
      coverId,
      periodValue,
      amountValue,
      transactionParams
    });
  }

  render() {
    return (
      <Flex
        width={1}
        mt={[2,3]}
        alignItems={'center'}
        flexDirection={'column'}
        justifyContent={'center'}
      >
        <Flex
          mb={3}
          width={[1,0.36]}
          flexDirection={'column'}
        >
          <Box
            mb={2}
            width={1}
          >
            <Text mb={1}>
              Choose action:
            </Text>
            <Flex
              alignItems={'center'}
              flexDirection={'row'}
              justifyContent={'space-between'}
            >
              <CardIconButton
                {...this.props}
                cardProps={{
                  px:3,
                  py:2,
                  width:0.49
                }}
                textProps={{
                  fontSize:[1,2]
                }}
                icon={'Security'}
                iconColor={'deposit'}
                text={'Buy Coverage'}
                iconBgColor={'#ced6ff'}
                isActive={ this.state.selectedAction === 'deposit' }
                handleClick={ e => this.setSelectedAction('deposit') }
              />
              <CardIconButton
                {...this.props}
                cardProps={{
                  px:3,
                  py:2,
                  width:0.49
                }}
                textProps={{
                  fontSize:[1,2]
                }}
                icon={'FileUpload'}
                iconColor={'redeem'}
                text={'Claim Tokens'}
                iconBgColor={'#ceeff6'}
                isActive={ this.state.selectedAction === 'claim' }
                handleClick={ e => this.setSelectedAction('claim') }
              />
            </Flex>
          </Box>
          {
            this.state.selectedAction === 'deposit' &&
              <IconBox
                cardProps={{
                  py:2,
                  px:3,
                  my:2,
                  width:1,
                }}
                isActive={true}
                isInteractive={false}
                icon={'LightbulbOutline'}
                iconProps={{
                  color:'flashColor'
                }}
                textProps={{
                  color:'flashColor'
                }}
                text={`If your yield bearing token de-pegs in value by more than 10%, claim up to 90% of your loss by swapping your yield bearing token for a claim payment.`}
              >
                <ExtLink
                  ml={1}
                  fontWeight={500}
                  color={'primary'}
                  fontSize={'15px'}
                  hoverColor={'primary'}
                  href={'https://nexusmutual.io/pages/YieldTokenCoverv1.0.pdf'}
                >
                  <Flex
                    alignItems={'center'}
                    flexDirection={'row'}
                    justifyContent={'center'}
                  >
                    Read More
                    <Icon
                      ml={1}
                      size={'0.9em'}
                      color={'primary'}
                      name={'OpenInNew'}
                    />
                    .
                  </Flex>
                </ExtLink>
              </IconBox>
          }
          {
            this.state.selectedAction === 'deposit' ? (
              <Flex
                width={1}
                alignItems={'center'}
                flexDirection={'column'}
                justifyContent={'center'}
              >
                <Flex
                  mb={1}
                  width={1}
                  flexDirection={'row'}
                  justifyContent={'space-between'}
                >
                  {
                    Object.keys(this.state.steps).map( stepIndex => (
                      <Link
                        style={{
                          flexBasis:'0',
                          flex:'1 1 0px',
                          textDecoration:'none',
                          cursor:this.state.step>=stepIndex ? 'pointer' : 'default'
                        }}
                        fontSize={2}
                        textAlign={'center'}
                        key={`step_${stepIndex}`}
                        color={ this.state.step>=stepIndex ? 'primary' : 'cellText' }
                        hoverColor={ this.state.step>=stepIndex ? 'primary' : 'cellText' }
                        activeColor={ this.state.step>=stepIndex ? 'primary' : 'cellText' }
                      >
                        {this.state.steps[stepIndex]}
                      </Link>
                    ) )
                  }
                </Flex>
                <Flex
                  mb={2}
                  width={1}
                  flexDirection={'column'}
                >
                  <Progress
                    style={{
                      width:'100%',
                      height:'15px'
                    }}
                    value={(1/Object.keys(this.state.steps).length)*this.state.step}
                  />
                </Flex>
                {
                  !this.state.selectedToken || !this.state.tokenBalance ? (
                    <FlexLoader
                      flexProps={{
                        mt:2,
                        flexDirection:'row'
                      }}
                      loaderProps={{
                        size:'25px',
                      }}
                      textProps={{
                        ml:2
                      }}
                      text={'Loading assets...'}
                    />
                  ) : this.state.coverId ? (
                    <Flex
                      width={1}
                      alignItems={'center'}
                      flexDirection={'column'}
                      justifyContent={'center'}
                    >
                      <IconBox
                        cardProps={{
                          mt:1,
                        }}
                        icon={'DoneAll'}
                        iconProps={{
                          color:this.props.theme.colors.transactions.status.completed
                        }}
                        text={`You have successfully bought your Cover! Your Cover ID is <strong>${this.state.coverId}</strong>`}
                      />
                      <Link
                        mt={2}
                        color={'link'}
                        hoverColor={'primary'}
                        onClick={this.reset.bind(this)}
                      >
                        Get New Quote
                      </Link>
                    </Flex>
                  ) : !this.state.quote ? (
                    <Flex
                      width={1}
                      alignItems={'stretch'}
                      flexDirection={'column'}
                      justifyContent={'center'}
                    >
                      <Box
                        width={1}
                      >
                        <Text mb={1}>
                          Select Token to Cover:
                        </Text>
                        <AssetSelector
                          {...this.props}
                          id={'token-from'}
                          showBalance={false}
                          isSearchable={false}
                          selectedToken={this.state.selectedToken}
                          onChange={this.changeSelectedToken.bind(this)}
                          availableTokens={this.props.toolProps.availableTokens}
                        />
                      </Box>
                      <Box
                        mt={2}
                        width={1}
                      >
                        <Flex
                          mb={1}
                          alignItems={'center'}
                          flexDirection={'row'}
                        >
                          <Text>
                            Select Payment Asset:
                          </Text>
                          <Tooltip
                            placement={'top'}
                            message={`This is the asset that you will use as payment method for the coverage premium`}
                          >
                            <Icon
                              ml={1}
                              size={'1em'}
                              name={"Info"}
                              color={'cellTitle'}
                            />
                          </Tooltip>
                        </Flex>
                        <AssetSelector
                          {...this.props}
                          showBalance={false}
                          selectedToken={this.state.selectedUnderlying}
                          onChange={this.changeSelectedUnderlying.bind(this)}
                          availableTokens={this.state.tokenConfig.underlying}
                        />
                      </Box>
                      {
                        this.functionsUtil.BNify(this.state.maxCapacity).gt(0) ? (
                          <Box
                            width={1}
                          >
                            <Box
                              mt={2}
                              width={1}
                            >
                              <Text
                                mb={1}
                              >
                                How much do you want to cover?
                              </Text>
                              <Input
                                min={0}
                                step={1}
                                width={'100%'}
                                type={"number"}
                                required={true}
                                height={'3.4em'}
                                borderRadius={2}
                                fontWeight={500}
                                borderColor={'cardBorder'}
                                backgroundColor={'cardBg'}
                                boxShadow={'none !important'}
                                value={this.state.amountValue}
                                onChange={this.changeAmount.bind(this)}
                                border={`1px solid ${this.props.theme.colors.divider}`}
                                placeholder={`Insert ${this.state.selectedUnderlying.toUpperCase()} amount`}
                              />
                              <Flex
                                width={1}
                                maxWidth={'100%'}
                                alignItems={'center'}
                                flexDirection={'row'}
                                justifyContent={'flex-end'}
                              >
                                <Link
                                  mt={1}
                                  fontSize={1}
                                  fontWeight={3}
                                  color={'dark-gray'}
                                  textAlign={'right'}
                                  hoverColor={'copyColor'}
                                  onClick={ (e) => this.setMaxCoverAmount() }
                                  style={{
                                    maxWidth:'100%',
                                    overflow:'hidden',
                                    whiteSpace:'nowrap',
                                    textOverflow:'ellipsis'
                                  }}
                                >
                                  Max Available: {this.state.maxCapacity.toFixed(this.props.isMobile ? 2 : 4)} {this.state.selectedUnderlying}
                                </Link>
                              </Flex>
                            </Box>
                            <Box
                              mt={2}
                              width={1}
                            >
                              <Text
                                mb={1}
                              >
                                For how many days?
                              </Text>
                              <Input
                                min={0}
                                width={'100%'}
                                type={"number"}
                                required={true}
                                height={'3.4em'}
                                borderRadius={2}
                                fontWeight={500}
                                borderWidth={'1px'}
                                borderStyle={'solid'}
                                backgroundColor={'cardBg'}
                                boxShadow={'none !important'}
                                value={this.state.periodValue}
                                placeholder={'Insert days of coverage'}
                                onChange={this.changePeriod.bind(this)}
                                borderColor={this.state.periodValid ? 'cardBorder' : 'red'}
                              />
                              {
                                !this.state.periodValid && (
                                  <Text
                                    my={1}
                                    fontSize={2}
                                    color={'red'}
                                  >
                                    Enter a period between 30 and 365 days!
                                  </Text>
                                )
                              }
                              <Flex
                                mt={2}
                                alignItems={'center'}
                                flexDirection={'row'}
                                justifyContent={'space-between'}
                              >
                                {
                                  Object.keys(this.state.periodOptions).map( period => {
                                    const periodInfo = this.state.periodOptions[period];
                                    const isActive = this.state.selectedPeriod===period;
                                    const width = (1/Object.keys(this.state.periodOptions).length)-0.01;
                                    return (
                                      <DashboardCard
                                        cardProps={{
                                          p:2,
                                          width:width,
                                        }}
                                        isActive={isActive}
                                        isInteractive={true}
                                        key={`coverPeriod_${period}`}
                                        handleClick={e => this.selectPeriod(period)}
                                      >
                                        <Text
                                          fontSize={2}
                                          fontWeight={3}
                                          textAlign={'center'}
                                          color={this.props.isActive ? 'copyColor' : 'legend'}
                                        >
                                          {periodInfo.label}
                                        </Text>
                                      </DashboardCard>
                                    );
                                  })
                                }
                              </Flex>
                            </Box>
                            <Flex
                              mt={2}
                              width={1}
                              justifyContent={'center'}
                            >
                              <ButtonLoader
                                buttonProps={{
                                  my:2,
                                  mx:[0, 2],
                                  size:'medium',
                                  disabled:(!this.state.amountValid || !this.state.selectedUnderlying || !this.state.periodValue || !this.state.periodValid)
                                }}
                                buttonText={'GET QUOTE'}
                                isLoading={this.state.loading}
                                handleClick={ e => this.getQuote(e) }
                              />
                            </Flex>
                          </Box>
                        ) : (
                          <IconBox
                            cardProps={{
                              mt:3
                            }}
                            icon={'MoneyOff'}
                            iconProps={{
                              color:'cellText'
                            }}
                            text={`Coverage for ${this.state.selectedToken} is not available at the moment.`}
                          />
                        )
                      }
                    </Flex>
                  ) : (
                    <Flex
                      width={1}
                      alignItems={'stretch'}
                      flexDirection={'column'}
                      justifyContent={'center'}
                    >
                      <Text
                        mb={2}
                        fontSize={3}
                        fontWeight={3}
                        color={'primary'}
                      >
                        Cover Summary:
                      </Text>
                      <DashboardCard
                        cardProps={{
                          py:2,
                          mb:2,
                          px:3
                        }}
                        isActive={false}
                        isInteractive={false}
                      >
                        <Text
                          mb={1}
                          fontSize={1}
                          fontWeight={2}
                          color={'cellText'}
                        >
                          Protocol:
                        </Text>
                        <Text
                          mb={2}
                          fontSize={2}
                          fontWeight={3}
                          color={'primary'}
                        >
                          Idle Finance
                        </Text>
                        <Text
                          mb={1}
                          fontSize={1}
                          fontWeight={2}
                          color={'cellText'}
                        >
                          Yield Token:
                        </Text>
                        <Text
                          mb={2}
                          fontSize={2}
                          fontWeight={3}
                          color={'primary'}
                        >
                          {this.state.selectedToken}
                        </Text>
                        <Text
                          mb={1}
                          fontSize={1}
                          fontWeight={2}
                          color={'cellText'}
                        >
                          Cover Amount:
                        </Text>
                        <Text
                          mb={2}
                          fontSize={2}
                          fontWeight={3}
                          color={'primary'}
                        >
                          {this.state.amountValue} {this.state.selectedUnderlying}
                        </Text>
                        <Text
                          mb={1}
                          fontSize={1}
                          fontWeight={2}
                          color={'cellText'}
                        >
                          Cover Period:
                        </Text>
                        <Text
                          mb={2}
                          fontSize={2}
                          fontWeight={3}
                          color={'primary'}
                        >
                          {this.state.periodValue} days
                        </Text>
                        <Text
                          mb={1}
                          fontSize={1}
                          fontWeight={2}
                          color={'cellText'}
                        >
                          Cover Price:
                        </Text>
                        <Text
                          mb={2}
                          fontSize={2}
                          fontWeight={3}
                          color={'primary'}
                        >
                          {this.state.coverCost.toFixed(6)} {this.state.selectedUnderlying}
                        </Text>
                        <Text
                          mb={1}
                          fontSize={1}
                          fontWeight={2}
                          color={'cellText'}
                        >
                          Yearly Cost:
                        </Text>
                        <Text
                          mb={2}
                          fontSize={2}
                          fontWeight={3}
                          color={'primary'}
                        >
                          {this.state.yearlyCost.toFixed(2)}%
                        </Text>
                      </DashboardCard>
                      <Flex
                        mt={2}
                        width={1}
                        alignItems={'center'}
                        flexDirection={'column'}
                        justifyContent={'center'}
                      >
                        {
                          this.functionsUtil.BNify(this.state.tokenBalance).lt(this.functionsUtil.BNify(this.state.quote.price)) ? (
                            <DashboardCard
                              cardProps={{
                                p:3,
                                mb:3
                              }}
                            >
                              <Flex
                                width={1}
                                alignItems={'center'}
                                flexDirection={'column'}
                                justifyContent={'center'}
                              >
                                <Icon
                                  size={'2em'}
                                  name={'MoneyOff'}
                                  color={'cellText'}
                                />
                                <Text
                                  mt={1}
                                  fontSize={2}
                                  color={'cellText'}
                                  textAlign={'center'}
                                >
                                  You don't have enough {this.state.selectedUnderlying} in your wallet.
                                </Text>
                                <Link
                                  mt={1}
                                  color={'link'}
                                  hoverColor={'primary'}
                                  onClick={this.reset.bind(this)}
                                >
                                  Get New Quote
                                </Link>
                              </Flex>
                            </DashboardCard>
                          ) : !this.state.tokenApproved ? (
                            <DashboardCard
                              cardProps={{
                                p:3,
                                mb:3
                              }}
                            >
                              <Flex
                                width={1}
                                alignItems={'center'}
                                flexDirection={'column'}
                                justifyContent={'center'}
                              >
                                <Icon
                                  size={'2em'}
                                  name={'MoneyOff'}
                                  color={'cellText'}
                                />
                                <Text
                                  mb={2}
                                  fontSize={2}
                                  color={'cellText'}
                                  textAlign={'center'}
                                >
                                  To buy the coverage you need to approve the Smart-Contract.
                                </Text>
                                <ExecuteTransaction
                                  {...this.props}
                                  parentProps={{
                                    width:1,
                                    alignItems:'center',
                                    justifyContent:'center'
                                  }}
                                  Component={RoundButton}
                                  componentProps={{
                                    buttonProps:{
                                      size:'medium',
                                      width:[1,1/2],
                                    },
                                    value:'Approve',
                                  }}
                                  action={'Approve'}
                                  methodName={'approve'}
                                  callback={this.approveSucceeded.bind(this)}
                                  contractName={this.state.selectedUnderlyingConfig.name}
                                  params={[this.props.contractInfo.address,this.props.web3.utils.toTwosComplement('-1')]}
                                />
                                <Link
                                  mt={1}
                                  color={'link'}
                                  hoverColor={'primary'}
                                  onClick={this.reset.bind(this)}
                                >
                                  Get New Quote
                                </Link>
                              </Flex>
                            </DashboardCard>
                          ) : (
                            <Flex
                              width={1}
                              alignItems={'center'}
                              flexDirection={'column'}
                              justifyContent={'center'}
                            >
                              <ExecuteTransaction
                                {...this.props}
                                parentProps={{
                                  width:1,
                                  alignItems:'center',
                                  justifyContent:'center'
                                }}
                                Component={RoundButton}
                                componentProps={{
                                  buttonProps:{
                                    size:'medium',
                                    width:[1,1/2],
                                    disabled:this.state.buttonDisabled
                                  },
                                  value:'Buy Coverage',
                                }}
                                action={'Buy Coverage'}
                                methodName={'buyCover'}
                                value={this.state.transactionValue}
                                params={this.state.transactionParams}
                                contractName={this.props.contractInfo.name}
                                callback={this.buyCoverTransactionSucceeded.bind(this)}
                              />
                              <Link
                                mt={1}
                                color={'link'}
                                hoverColor={'primary'}
                                onClick={this.reset.bind(this)}
                              >
                                Get New Quote
                              </Link>
                            </Flex>
                          )
                        }
                      </Flex>
                    </Flex>
                  )
                }
              </Flex>
            ) : this.state.selectedAction === 'claim' && (
              <Box
                width={1}
              >
                {
                  this.state.claimableCovers.length>0 ? (
                    <Flex
                      width={1}
                      alignItems={'stretch'}
                      flexDirection={'column'}
                      justifyContent={'center'}
                    >
                      <Text mb={1}>
                        Select Cover:
                      </Text>
                      <GenericSelector
                        {...this.props}
                        isSearchable={false}
                        name={'claimable_covers'}
                        options={this.state.claimableCovers}
                        onChange={this.selectCoverToClaim.bind(this)}
                        defaultValue={this.state.defaultClaimableCover}
                      />
                      {
                        this.state.selectedCoverToClaim.claimId ? (
                          <IconBox
                            cardProps={{
                              mt:2,
                            }}
                            icon={'DoneAll'}
                            iconProps={{
                              color:this.props.theme.colors.transactions.status.completed
                            }}
                            text={`You've successfully claimed <strong>${this.state.selectedCoverToClaim.claimedAmount.toFixed(4)} ${this.state.selectedCoverToClaim.coverAsset}</strong> for this Cover!`}
                          />
                        ) : (
                          <Flex
                            width={1}
                            alignItems={'center'}
                            flexDirection={'column'}
                            justifyContent={'center'}
                          >
                            <DashboardCard
                              cardProps={{
                                p:3,
                                mt:3,
                                mb:1
                              }}
                            >
                              <Flex
                                width={1}
                                alignItems={'center'}
                                flexDirection={'column'}
                                justifyContent={'center'}
                              >
                                <Icon
                                  size={'2em'}
                                  color={'cellText'}
                                  name={'FileUpload'}
                                />
                                <Text
                                  fontSize={2}
                                  color={'cellText'}
                                  textAlign={'center'}
                                >
                                  You can Claim up to <strong>{this.state.selectedCoverToClaim.claimableAmount.toFixed(4)} {this.state.selectedCoverToClaim.coverAsset}</strong> for this Cover!
                                </Text>
                                <Text
                                  fontSize={1}
                                  color={'alert'}
                                  textAlign={'center'}
                                >
                                  Keep in mind that the cover becomes inactive once any amount of tokens are claimed.
                                </Text>
                              </Flex>
                            </DashboardCard>
                            <SendTxWithBalance
                              error={null}
                              {...this.props}
                              permitEnabled={false}
                              approveEnabled={true}
                              action={'Claim Token'}
                              tokenConfig={this.state.tokenConfig}
                              contractInfo={this.props.contractInfo}
                              buttonDisabled={this.state.claimButtonDisabled}
                              callback={this.claimTransactionSucceeded.bind(this)}
                              changeInputCallback={this.claimInputChange.bind(this)}
                              contractApproved={this.yieldTokenApproveSucceeded.bind(this)}
                              getTransactionParams={this.getClaimTransactionParams.bind(this)}
                              approveDescription={'To claim your tokens you need to approve the Smart-Contract.'}
                              tokenBalance={this.functionsUtil.BNify(this.state.yieldTokenBalance).gt(this.state.selectedCoverToClaim.claimableAmount) ? this.state.selectedCoverToClaim.claimableAmount : this.state.yieldTokenBalance }
                            >
                              <DashboardCard
                                cardProps={{
                                  p:3,
                                  mt:2
                                }}
                              >
                                <Flex
                                  alignItems={'center'}
                                  flexDirection={'column'}
                                >
                                  <Icon
                                    name={'MoneyOff'}
                                    color={'cellText'}
                                    size={this.props.isMobile ? '1.8em' : '2.3em'}
                                  />
                                  <Text
                                    mt={1}
                                    fontSize={2}
                                    color={'cellText'}
                                    textAlign={'center'}
                                  >
                                    You don't have any {this.state.selectedToken} in your wallet.
                                  </Text>
                                </Flex>
                              </DashboardCard>
                            </SendTxWithBalance>
                          </Flex>
                        )
                      }
                    </Flex>
                  ) : (
                    <IconBox
                      cardProps={{
                        mt:1,
                      }}
                      icon={'Warning'}
                      iconProps={{
                        color:'cellText'
                      }}
                      text={`You cannot submit any Claim for your Covers.`}
                    />
                  )
                }
              </Box>
            )
          }
        </Flex>
      </Flex>
    );
  }
}

export default NexusMutual;
