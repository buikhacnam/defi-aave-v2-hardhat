import { getWeth } from './getWeth'
import { getNamedAccounts } from 'hardhat'

async function main() {
	// the protocol treats everything as an ERC20 token
	await getWeth()
	const { deployer } = await getNamedAccounts()

	/* Now depositing into aave
		We need to interact with aave protocol, so we need address and abi
	*/
}

main()
	.then(() => process.exit(0))
	.catch(err => {
		console.error(err)
		process.exit(1)
	})
