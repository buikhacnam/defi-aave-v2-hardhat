import { getWeth } from './getWeth'
import { ethers, getNamedAccounts } from 'hardhat'

async function main() {
	// the protocol treats everything as an ERC20 token
	await getWeth()
	const { deployer } = await getNamedAccounts()

	/* Now depositing into aave
		We need to interact with aave protocol, so we need address and abi

		Lending Pool Address Provider:
			Documentation: 
				https://docs.aave.com/developers/v/2.0/the-core-protocol/addresses-provider
				https://docs.aave.com/developers/v/2.0/deployed-contracts/deployed-contracts 
			Contract address: 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
			abi: https://docs.aave.com/developers/v/2.0/the-core-protocol/addresses-provider/ilendingpooladdressesprovider

		Lending Pool:
			Documentation:
				https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool
				https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool/ilendingpool
			Contract address:  function getLendingPool() external view returns (address); FROM ILendingPoolAddressesProvider
			abi: https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool/ilendingpool
	*/

	const lendingPool = await getLendingPool(deployer)
	// console.log("lendingPool in main: ", lendingPool)
	console.log("lendingPool.address in main: ", lendingPool.address) // https://etherscan.io/address/0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9#code
}

async function getLendingPool(deployer: string) {
	const getLendingPoolAddressesProvider = await ethers.getContractAt(
		'ILendingPoolAddressesProvider',
		'0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5',
		deployer
	)
	
	const lendingPoolAddress = await getLendingPoolAddressesProvider.getLendingPool()

	const lendingPool = await ethers.getContractAt('ILendingPool', lendingPoolAddress, deployer)

	return lendingPool
}

main()
	.then(() => process.exit(0))
	.catch(err => {
		console.error(err)
		process.exit(1)
	})
