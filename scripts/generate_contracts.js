/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-sync */
const fs = require('fs');
const path = require('path');

function initContract(pathFromNodeModule, contractName) {
    const file = fs.readFileSync(path.resolve(__dirname, `../node_modules/${pathFromNodeModule}`), 'utf-8');
    const JsonFile = JSON.parse(file);
    fs.writeFile(`./src/blockchains/ethereum/contracts/${contractName}.ts`, `export const ${contractName} = ${JSON.stringify(JsonFile)}`, 'utf8', () => console.log(`Done making contract ${contractName}`));
    return JsonFile;
}

function initContracts() {
    initContract('honey-contracts/solidity/build/ERC20Token.abi', 'ERC20Token');
    initContract('honey-contracts/solidity/build/HoneyConverter.abi', 'HoneyConverter');
    initContract('honey-contracts/solidity/build/ContractRegistry.abi', 'ContractRegistry');
    initContract('honey-contracts/solidity/build/HoneyConverterRegistry.abi', 'HoneyConverterRegistry');
    initContract('honey-contracts/solidity/build/SmartToken.abi', 'SmartToken');
}

initContracts();
