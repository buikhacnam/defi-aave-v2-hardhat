// Weth stands for Wrapped Ether.

// in here we will build a script that deposit our tokens to the Weth contract.
// Rinkeby Weth contract: https://rinkeby.etherscan.io/token/0xc778417e063141139fce010982780140aa0cd5ab#writeContract
// Mainnet Weth contract: https://etherscan.io/token/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2#writeContract

//https://weth.io/

import { getNamedAccounts, ethers } from 'hardhat'

const AMOUNT = ethers.utils.parseEther('0.02')
export async function getWeth() {

    const { deployer } = await getNamedAccounts()
    console.log("deployer in getWeth: ", deployer)
    // How call the deposit function of the Weth contract???
    // you need abi and contract address of the Weth contract

    // Weth contract mainet: 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2

    /*
    In order to run this, we have to fork the mainnet and run as a local hardhat node
    that pretending to be a mainnet node.
    Read more here: https://hardhat.org/hardhat-network/docs/guides/forking-other-networks

    
    *NOTE that forking doesnt download the whole blockchain to our local setup
    But any time we reference an address, we make an API call (alchemyapi) to the ethereum node and ask for the contract we need.

    And you need to update the hardhat.config.ts file to use the fork in the hardhat network:

    	hardhat: {
			chainId: 31337,
			forking: {
				url: process.env.MAINET_RPC_URL!
			}
		}

    */

    const iWeth = await ethers.getContractAt('IWeth', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', deployer)
    console.log("iWeth in getWeth: ", iWeth)

    const tx = await iWeth.deposit({value: AMOUNT})
    console.log("tx in getWeth: ", tx)

    await tx.wait(1)
    const wethBalance = await iWeth.balanceOf(deployer)
    console.log("wethBalance in getWeth: ", wethBalance.toString()) //20000000000000000 -> 0.02 ETH
}   
