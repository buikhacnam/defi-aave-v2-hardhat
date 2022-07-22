import * as dotenv from 'dotenv'

import { HardhatUserConfig } from 'hardhat/config'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import 'hardhat-gas-reporter'
import 'solidity-coverage'
import 'hardhat-deploy'
import 'hardhat-contract-sizer'

dotenv.config()

interface NamedAccounts {
	namedAccounts: any
}

type config = HardhatUserConfig & NamedAccounts

const config: config  = {
	solidity: {
		compilers: [{ version: '0.8.8' }, {version: '0.4.19'}, {version: '0.6.6'}, {version: '0.6.12'}],
	},
	networks: {
		rinkeby: {
			url: process.env.RINKEBY_RPC_URL || '',
			accounts:
				process.env.METAMASK_RINKEBY_PRIVATE_KEY !== undefined
					? [process.env.METAMASK_RINKEBY_PRIVATE_KEY]
					: [],
			chainId: 4,
		},
		// localhost: {
		// 	url: 'http://127.0.0.1:8545',
		// 	chainId: 31337,
		// 	// accounts: hardhat localhost node will pick up the first account
		// },
		hardhat: {
			chainId: 31337,
			forking: {
				url: process.env.MAINET_RPC_URL!
			}
		}
	},
	gasReporter: {
		enabled: process.env.REPORT_GAS !== undefined,
		currency: 'USD',
	},
	etherscan: {
		apiKey: process.env.ETHERSCAN_API_KEY,
	},
	namedAccounts: {
		deployer: {
			default: 0, // here this will by default take the first account as deployer
			4: 0, // similarly on rinkeby it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
			// 31337: 1
		},

		// you can have multiples deployers, for example:
		player: {
			default: 1,
		},
	},
	mocha: {
		timeout: 100000000,
	},
}

export default config
