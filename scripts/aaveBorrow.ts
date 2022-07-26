/*
AAVE docs: https://docs.aave.com/developers/v/2.0/
*/

import { getWeth } from './getWeth'
import { ethers, getNamedAccounts } from 'hardhat'
import { BigNumber, Contract } from 'ethers'

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

	// 2.2 Deposit into the lending pool
	console.log('Depositing into lending pool...')
	await lendingPool.deposit(wethTokenAddress, MyAmount, deployer, 0) //https://github.com/aave/protocol-v2/blob/master/contracts/protocol/lendingpool/LendingPool.sol
	console.log("Deposited into lending pool")


	/*
	3. Borrow from the lending pool
	*/

	let {
		totalCollateralETH,
		totalDebtETH,
		availableBorrowsETH, // 16500000000000000  1.65ETH (16 zeros) 
	} = await getBorrowUserData(lendingPool, deployer)

	const daiPrice = await getDaiPrice() // 659265426057138 (18 zeros)
	const reciprocalOfDaiPrice = 1 / daiPrice.toNumber() // how much 1 DAI is worth in ETH
	const amountDaiToBorrow = availableBorrowsETH.toString() * 0.95 * reciprocalOfDaiPrice // borrow 95% of available borrows and multiply by reciprocal of dai price (95% of 1.65ETH)
	console.log("amountDaiToBorrow in DAI: ", amountDaiToBorrow) //24.040847005161808 -> 2404 DAI (16 zeros / 18 zeros -> should be more 2 zeros of the result)  
	const amountDAIToBorrowWei = ethers.utils.parseEther(amountDaiToBorrow.toString())
	console.log("amountDAIToBorrowWei wei: ", amountDAIToBorrowWei.toString()) //24040847005161808000

	const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F" // DAI token address of mainet
	await borrowDai(daiTokenAddress, lendingPool, amountDAIToBorrowWei, deployer)

	// check borrow data after borrowing successfully.
	await getBorrowUserData(lendingPool, deployer)

	/* 
	4. Repay from the lending pool
	*/
	await repay(amountDAIToBorrowWei, daiTokenAddress, lendingPool, deployer)
	// check borrow data after repaying successfully.
	await getBorrowUserData(lendingPool, deployer)
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

async function getBorrowUserData(lendingPool: Contract, account: string) {
	const {totalCollateralETH, totalDebtETH, availableBorrowsETH} = await lendingPool.getUserAccountData(account)
	console.log("Call getBorrowUserData (Extra 16 zeros)")
	console.log({
		totalCollateralETH: totalCollateralETH.toString(), // worth of ETH deposited. 2ETH
		totalDebtETH: totalDebtETH.toString(), // worth of ETH borrowed. 0ETH 00.825000108970848 (DAI price 0.000684031821851005)
		availableBorrowsETH: availableBorrowsETH.toString(), // amount of ETH that can be borrowed. 1.65ETH 16500000000000000
	})

	return {
		totalCollateralETH,
		totalDebtETH,
		availableBorrowsETH,
	}
}

async function getDaiPrice() {
	const daiEthPriceFeed = await ethers.getContractAt(
		"AggregatorV3Interface",
		"0x773616E4d11A78F511299002da57A0a94577F1f4",
	) // not connect to the account cause we dont have to make any transactions

	const price = (await daiEthPriceFeed.latestRoundData())[1]

	console.log("DAI/ETH price is: ", price.toString()) //659265426057138  -> 1 DAI = (659265426057138 / 10^18) = 0.000659265426057138 ETH
	// -> 1 ETH = (1 / 0.000659265426057138) = 1533,7 DAI

	return price
}

async function borrowDai(
	daiAddress: string,
	lendingPool: Contract,
	amountDaiToBorrowWei: BigNumber,
	account: string
) {
	const borrowTx = await lendingPool.borrow(daiAddress, amountDaiToBorrowWei, 1, 0, account)
	await borrowTx.wait(1)
	console.log('borrowTx.hash: ', borrowTx.hash)
	console.log("Borrowed DAI successfully!")
}

async function repay(amount: BigNumber, daiAddress: string, lendingPool: Contract, account: string) {
	console.log("start repay")
	await approveErc20(daiAddress, lendingPool.address, amount, account)

	const repayTx = await lendingPool.repay(daiAddress, amount,1, account)
	await repayTx.wait(1)
	console.log('repayTx.hash: ', repayTx.hash)
	console.log("Repaid DAI successfully!")
}


main()
	.then(() => process.exit(0))
	.catch(err => {
		console.error(err)
		process.exit(1)
	})
