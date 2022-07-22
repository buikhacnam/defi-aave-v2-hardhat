# Weth (Wrapped Ether)

### What is the Weth contract?
This website explains the Weth contract: 
https://weth.io/

See it on the blockchain: 

Rinkeby Weth contract: https://rinkeby.etherscan.io/token/0xc778417e063141139fce010982780140aa0cd5ab#writeContract

Mainnet Weth contract: https://etherscan.io/token/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2#writeContract

### Use the Weth mainet Contract in the Hardhat network

Create the IWeth interface: `contracts/interfaces/IWeth.sol`

Get the abi of IWeth: 
```
yarn hardhat compile
```
Fork the mainnet and deposit some Eth to the Weth contract and check the balance (all explanation with in the file): `scripts/getWeth.ts`


# aave v2 

### Get the The LendingPool contract

Check the getLendingPool function in `scripts/aaveBorrow.ts`


# Some common command lines

```shell
npx hardhat help
npx hardhat test
GAS_REPORT=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts

yarn hardhat compile
yarn hardhat run scripts/aaveBorrow.ts
```
