import ERC20 from '../contracts/ERC20.json';
import IdleCDO from '../contracts/IdleCDO.json';
import IdleStrategy from '../contracts/IdleStrategy.json';
import IdleCDOTrancheRewards from '../contracts/IdleCDOTrancheRewards.json';
const availableTranches = {
  idle:{
    DAI:{
      token:'DAI',
      decimals:18,
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
          address:'0x9c3bC87693c65E740d8B2d5F0820E04A61D8375B'
        },
        label:'idleDAI AA',
        blockNumber:13054628,
        name:'IdleCDO_AA_idleDAIYield',
        token:'IdleCDO_AA_idleDAIYield',
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
          address:'0x4473bc90118b18be890af42d793b5252c4dc382d'
        },
        label:'idleDAI BB',
        blockNumber:13054628,
        name:'IdleCDO_BB_idleDAIYield',
        token:'IdleCDO_BB_idleDAIYield',
        address:'0x730348a54bA58F64295154F0662A08Cbde1225c2'
      }
    }
  }
  /*
  yearn:{
  	DAI:{
  	  junior:{
  	    address:'0x000000000000000000000000000000000000'
  	  },
  	  senior:{
  	    address:'0x000000000000000000000000000000000000'
  	  }
  	}
  }
  */
};
export default availableTranches;