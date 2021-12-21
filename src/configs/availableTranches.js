import ERC20 from '../contracts/ERC20.json';
import IdleCDO from '../contracts/IdleCDO.json';
import IdleStrategy from '../contracts/IdleStrategy.json';
import IdleCDOTrancheRewards from '../contracts/IdleCDOTrancheRewards.json';
const availableTranches = {
  idle:{
    DAI:{
      token:'DAI',
      decimals:18,
      limit:1700000,
      protocol:'idle',
      blockNumber:13054628,
      address:'0x6b175474e89094c44da98b954eedeac495271d0f',
      CDO:{
        abi:IdleCDO,
        decimals:18,
        name:'IdleCDO_idleDAIYield',
        address:'0xd0DbcD556cA22d3f3c142e9a3220053FD7a247BC'
      },
      Strategy:{
        abi:IdleStrategy,
        name:'IdleStrategy_idleDAIYield'
      },
      AA:{
        abi:ERC20,
        decimals:18,
        tranche:'AA',
        functions:{
          stake:'stake',
          unstake:'unstake',
          deposit:'depositAA',
          withdraw:'withdrawAA'
        },
        CDORewards:{
          decimals:18,
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_idleDAIYield_AA',
          address:'0x9c3bC87693c65E740d8B2d5F0820E04A61D8375B',
          stakingRewards:[
            {
              token:'IDLE',
              enabled:true,
              address:'0x875773784Af8135eA0ef43b5a374AaD105c5D39e'
            }
          ]
        },
        label:'idleDAI AA',
        blockNumber:13054628,
        name:'AA_idleDAIYield',
        token:'AA_idleDAIYield',
        address:'0xE9ada97bDB86d827ecbaACCa63eBcD8201D8b12E'
      },
      BB:{
        abi:ERC20,
        decimals:18,
        tranche:'BB',
        functions:{
          stake:'stake',
          unstake:'unstake',
          deposit:'depositBB',
          withdraw:'withdrawBB'
        },
        CDORewards:{
          decimals:18,
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_idleDAIYield_BB',
          address:'0x4473bc90118b18be890af42d793b5252c4dc382d',
          stakingRewards:[
            {
              token:'IDLE',
              enabled:false,
              address:'0x875773784Af8135eA0ef43b5a374AaD105c5D39e'
            }
          ]
        },
        label:'idleDAI BB',
        blockNumber:13054628,
        name:'BB_idleDAIYield',
        token:'BB_idleDAIYield',
        address:'0x730348a54bA58F64295154F0662A08Cbde1225c2'
      }
    },
    FEI:{
      token:'FEI',
      decimals:18,
      limit:1700000,
      protocol:'idle',
      blockNumber:13575397,
      address:'0x956f47f50a910163d8bf957cf5846d573e7f87ca',
      CDO:{
        abi:IdleCDO,
        decimals:18,
        name:'IdleCDO_idleFEIYield',
        address:'0x77648a2661687ef3b05214d824503f6717311596'
      },
      Strategy:{
        abi:IdleStrategy,
        name:'IdleStrategy_idleFEIYield'
      },
      AA:{
        abi:ERC20,
        decimals:18,
        tranche:'AA',
        functions:{
          stake:'stake',
          unstake:'unstake',
          deposit:'depositAA',
          withdraw:'withdrawAA'
        },
        CDORewards:{
          decimals:18,
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_idleFEIYield_AA',
          address:'0x8fcD21253AaA7E228531291cC6f644d13B3cF0Ba',
          stakingRewards:[
            {
              token:'IDLE',
              enabled:true,
              address:'0x875773784Af8135eA0ef43b5a374AaD105c5D39e'
            }
          ]
        },
        label:'idleFEI AA',
        blockNumber:13575397,
        name:'AA_idleFEIYield',
        token:'AA_idleFEIYield',
        address:'0x9cE3a740Df498646939BcBb213A66BBFa1440af6'
      },
      BB:{
        abi:ERC20,
        decimals:18,
        tranche:'BB',
        functions:{
          stake:'stake',
          unstake:'unstake',
          deposit:'depositBB',
          withdraw:'withdrawBB'
        },
        CDORewards:{
          decimals:18,
          stakingRewards:[],
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_idleFEIYield_BB',
          address:'0x0000000000000000000000000000000000000000'
        },
        label:'idleFEI BB',
        blockNumber:13575397,
        name:'BB_idleFEIYield',
        token:'BB_idleFEIYield',
        address:'0x2490D810BF6429264397Ba721A488b0C439aA745'
      }
    }
  },
  lido:{
    stETH:{
      abi:ERC20,
      decimals:18,
      token:'stETH',
      limit:1700000,
      protocol:'lido',
      blockNumber:13776954,
      address:'0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
      CDO:{
        abi:IdleCDO,
        decimals:18,
        name:'IdleCDO_lido_stETH',
        address:'0x34dcd573c5de4672c8248cd12a99f875ca112ad8'
      },
      Strategy:{
        abi:IdleStrategy,
        name:'IdleStrategy_lido_stETH'
      },
      AA:{
        abi:ERC20,
        decimals:18,
        tranche:'AA',
        functions:{
          stake:'stake',
          unstake:'unstake',
          deposit:'depositAA',
          withdraw:'withdrawAA'
        },
        CDORewards:{
          decimals:18,
          stakingRewards:[],
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_lido_stETH_AA',
          address:'0x0000000000000000000000000000000000000000'
        },
        blockNumber:13776954,
        name:'AA_lido_stETH',
        token:'AA_lido_stETH',
        label:'lido stETH AA',
        address:'0x2688fc68c4eac90d9e5e1b94776cf14eade8d877'
      },
      BB:{
        abi:ERC20,
        decimals:18,
        tranche:'BB',
        functions:{
          stake:'stake',
          unstake:'unstake',
          deposit:'depositBB',
          withdraw:'withdrawBB'
        },
        CDORewards:{
          decimals:18,
          stakingRewards:[],
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_lido_stETH_BB',
          address:'0x0000000000000000000000000000000000000000'
        },
        blockNumber:13776954,
        name:'BB_lido_stETH',
        token:'BB_lido_stETH',
        label:'lido stETH BB',
        address:'0x3a52fa30c33caf05faee0f9c5dfe5fd5fe8b3978'
      }
    }
  },
  convex:{
    FRAX3CRV:{
      abi:ERC20,
      decimals:18,
      limit:1700000,
      token:'FRAX3CRV',
      protocol:'convex',
      blockNumber:13812864,
      autoFarming:['CVX','CRV'],
      address:'0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B',
      CDO:{
        abi:IdleCDO,
        decimals:18,
        name:'IdleCDO_convex_frax3crv',
        address:'0x4ccaf1392a17203edab55a1f2af3079a8ac513e7'
      },
      Strategy:{
        abi:IdleStrategy,
        name:'IdleStrategy_convex_frax3crv'
      },
      AA:{
        abi:ERC20,
        decimals:18,
        tranche:'AA',
        functions:{
          stake:'stake',
          unstake:'unstake',
          deposit:'depositAA',
          withdraw:'withdrawAA'
        },
        CDORewards:{
          decimals:18,
          stakingRewards:[],
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_convex_frax3crv_AA',
          address:'0x0000000000000000000000000000000000000000'
        },
        blockNumber:13812864,
        name:'AA_convex_frax3crv',
        token:'AA_convex_frax3crv',
        label:'convex frax3crv AA',
        address:'0x15794da4dcf34e674c18bbfaf4a67ff6189690f5'
      },
      BB:{
        abi:ERC20,
        decimals:18,
        tranche:'BB',
        functions:{
          stake:'stake',
          unstake:'unstake',
          deposit:'depositBB',
          withdraw:'withdrawBB'
        },
        CDORewards:{
          decimals:18,
          stakingRewards:[],
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_convex_frax3crv_BB',
          address:'0x0000000000000000000000000000000000000000'
        },
        blockNumber:13812864,
        name:'BB_convex_frax3crv',
        token:'BB_convex_frax3crv',
        label:'convex frax3crv BB',
        address:'0x18cf59480d8c16856701f66028444546b7041307'
      }
    },
    MIM3CRV:{
      abi:ERC20,
      decimals:18,
      limit:1700000,
      token:'MIM3CRV',
      protocol:'convex',
      blockNumber:13848124,
      autoFarming:['CVX','CRV'],
      address:'0x5a6A4D54456819380173272A5E8E9B9904BdF41B',
      CDO:{
        abi:IdleCDO,
        decimals:18,
        name:'IdleCDO_convex_mim3crv',
        address:'0x151e89e117728ac6c93aae94c621358b0ebd1866'
      },
      Strategy:{
        abi:IdleStrategy,
        name:'IdleStrategy_convex_mim3crv'
      },
      AA:{
        abi:ERC20,
        decimals:18,
        tranche:'AA',
        functions:{
          stake:'stake',
          unstake:'unstake',
          deposit:'depositAA',
          withdraw:'withdrawAA'
        },
        CDORewards:{
          decimals:18,
          stakingRewards:[],
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_convex_mim3crv_AA',
          address:'0x0000000000000000000000000000000000000000'
        },
        blockNumber:13848124,
        name:'AA_convex_mim3crv',
        token:'AA_convex_mim3crv',
        label:'convex mim3crv AA',
        address:'0xFC96989b3Df087C96C806318436B16e44c697102'
      },
      BB:{
        abi:ERC20,
        decimals:18,
        tranche:'BB',
        functions:{
          stake:'stake',
          unstake:'unstake',
          deposit:'depositBB',
          withdraw:'withdrawBB'
        },
        CDORewards:{
          decimals:18,
          stakingRewards:[],
          abi:IdleCDOTrancheRewards,
          name:'IdleCDOTrancheRewards_convex_mim3crv_BB',
          address:'0x0000000000000000000000000000000000000000'
        },
        blockNumber:13848124,
        name:'BB_convex_mim3crv',
        token:'BB_convex_mim3crv',
        label:'convex mim3crv BB',
        address:'0x5346217536852CD30A5266647ccBB6f73449Cbd1'
      }
    }
  }
};
export default availableTranches;