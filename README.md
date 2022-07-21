# Weth (Wrapped Ether)

### What is the Weth contract?
This website explains the Weth contract: 
https://weth.io/

See it on the blockchain: 
Rinkeby Weth contract: https://rinkeby.etherscan.io/token/0xc778417e063141139fce010982780140aa0cd5ab#writeContract
Mainnet Weth contract: https://etherscan.io/token/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2#writeContract

### Use the Weth mainet Contract in the Hardhat network

Create the IWeth interface: `contracts/interfaces/IWeth.sol`

Deploy it to the hardhat network: 
```
yarn hardhat deloy
```
Fork the mainnet and deposit some Eth to the Weth contract and check the balance (all explanation with in the file): `scripts/getWeth.ts`





# Some common command lines

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
GAS_REPORT=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```
