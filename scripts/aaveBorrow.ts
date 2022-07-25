import { AMOUNT3, getWeth } from './getWeth'
import { ethers, getNamedAccounts } from 'hardhat'
import { BigNumber } from 'ethers'

async function main() {
	// the protocol treats everything as an ERC20 token
	const MyAmount = await getWeth()
	const { deployer } = await getNamedAccounts()

	/* Now depositing into aave
		We need to interact with aave protocol, so we need address and abi

		Lending Pool Address Provider:
			-	Documentation: 
					https://docs.aave.com/developers/v/2.0/the-core-protocol/addresses-provider
					https://docs.aave.com/developers/v/2.0/deployed-contracts/deployed-contracts 
			-	Contract address: 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
			-	abi: https://docs.aave.com/developers/v/2.0/the-core-protocol/addresses-provider/ilendingpooladdressesprovider

		Lending Pool:
			-	Documentation:
					https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool
					https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool/ilendingpool
			-	Contract address:  function getLendingPool() external view returns (address); FROM ILendingPoolAddressesProvider
			-	abi: https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool/ilendingpool
			-	The lending pool contract: https://github.com/aave/protocol-v2/blob/master/contracts/protocol/lendingpool/LendingPool.sol
	*/

	// 1. Get the lending pool contract address
	const lendingPool = await getLendingPool(deployer)
	// console.log("lendingPool in main: ", lendingPool)
	console.log('lendingPool.address in main: ', lendingPool.address) // https://etherscan.io/address/0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9#code

	/* 
	2. Deposit into the lending pool 
	*/

	// 2.1 Approve the aave contract to deposit
	const wethTokenAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // WETH token address of mainet
	await approveErc20(wethTokenAddress, lendingPool.address, MyAmount, deployer)

	console.log('Depositing into lending pool...')
	await lendingPool.deposit(wethTokenAddress, MyAmount, deployer, 0) //https://github.com/aave/protocol-v2/blob/master/contracts/protocol/lendingpool/LendingPool.sol
	console.log("Deposited into lending pool")
}	

async function getLendingPool(deployer: string) {
	const getLendingPoolAddressesProvider = await ethers.getContractAt(
		'ILendingPoolAddressesProvider',
		'0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5',
		deployer
	)

	const lendingPoolAddress = await getLendingPoolAddressesProvider.getLendingPool()

	const lendingPool = await ethers.getContractAt(
		'ILendingPool',
		lendingPoolAddress,
		deployer
	)

	return lendingPool
}

async function approveErc20(
	erc20Address: string,
	spenderAddress: string,
	amountToSpend: BigNumber,
	account: string
) {
	console.log("start approve erc20")
	console.log({
		erc20Address,
		spenderAddress,
		amountToSpend,
		account,
	})
	console.log("prove erc20 in progress...")
	const erc20Token = await ethers.getContractAt("IERC20", erc20Address, account)

	const tx = await erc20Token.approve(spenderAddress, amountToSpend)
	
	await tx.wait(1)

	console.log('tx.hash: ', tx.hash)

	console.log("Approved ERC20 token")
}

main()
	.then(() => process.exit(0))
	.catch(err => {
		console.error(err)
		process.exit(1)
	})
