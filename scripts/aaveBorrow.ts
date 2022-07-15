async function main() {
    // the protocol treats everything as an ERC20 token
}

main()
	.then(() => process.exit(0))
	.catch(err => {
		console.error(err)
		process.exit(1)
	})
