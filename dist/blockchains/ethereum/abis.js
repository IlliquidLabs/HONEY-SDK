"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenRateEventLegacy = exports.ConversionEventLegacy = exports.MulticallContract = exports.ERC20Token = exports.HoneyConverterRegistry = exports.HoneyProtocol = exports.ContractRegistry = void 0;
exports.ContractRegistry = [
    { "constant": true, "inputs": [{ "name": "_contractName", "type": "bytes32" }], "name": "addressOf", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }
];
exports.HoneyProtocol = [
    { "constant": true, "inputs": [{ "name": "_path", "type": "address[]" }, { "name": "_amount", "type": "uint256" }], "name": "getReturnByPath", "outputs": [{ "name": "", "type": "uint256" }, { "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }
];
exports.HoneyConverterRegistry = [
    { "constant": true, "inputs": [], "name": "getConvertibleTokens", "outputs": [{ "name": "", "type": "address[]" }], "payable": false, "stateMutability": "view", "type": "function" },
    { "constant": true, "inputs": [{ "name": "_convertibleToken", "type": "address" }], "name": "getConvertibleTokenSmartTokens", "outputs": [{ "name": "", "type": "address[]" }], "payable": false, "stateMutability": "view", "type": "function" }
];
exports.ERC20Token = [
    { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }
];
exports.MulticallContract = [
    { "constant": false, "inputs": [{ "components": [{ "internalType": "address", "name": "target", "type": "address" }, { "internalType": "bytes", "name": "callData", "type": "bytes" }], "internalType": "struct Multicall.Call[]", "name": "calls", "type": "tuple[]" }, { "internalType": "bool", "name": "strict", "type": "bool" }], "name": "aggregate", "outputs": [{ "internalType": "uint256", "name": "blockNumber", "type": "uint256" }, { "components": [{ "internalType": "bool", "name": "success", "type": "bool" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "internalType": "struct Multicall.Return[]", "name": "returnData", "type": "tuple[]" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }
];
exports.ConversionEventLegacy = [
    { "anonymous": false, "inputs": [{ "indexed": true, "name": "sourceToken", "type": "address" }, { "indexed": true, "name": "targetToken", "type": "address" }, { "indexed": true, "name": "trader", "type": "address" }, { "indexed": false, "name": "sourceAmount", "type": "uint256" }, { "indexed": false, "name": "targetAmount", "type": "uint256" }], "name": "Change", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": true, "name": "sourceToken", "type": "address" }, { "indexed": true, "name": "targetToken", "type": "address" }, { "indexed": true, "name": "trader", "type": "address" }, { "indexed": false, "name": "sourceAmount", "type": "uint256" }, { "indexed": false, "name": "targetAmount", "type": "uint256" }, { "indexed": false, "name": "rateN", "type": "uint256" }, { "indexed": false, "name": "rateD", "type": "uint256" }], "name": "Conversion", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": true, "name": "sourceToken", "type": "address" }, { "indexed": true, "name": "targetToken", "type": "address" }, { "indexed": true, "name": "trader", "type": "address" }, { "indexed": false, "name": "sourceAmount", "type": "uint256" }, { "indexed": false, "name": "targetAmount", "type": "uint256" }, { "indexed": false, "name": "conversionFee", "type": "int256" }], "name": "Conversion", "type": "event" }
];
exports.TokenRateEventLegacy = [
    { "anonymous": false, "inputs": [{ "indexed": true, "name": "sourceToken", "type": "address" }, { "indexed": true, "name": "targetToken", "type": "address" }, { "indexed": false, "name": "tokenRateN", "type": "uint256" }, { "indexed": false, "name": "tokenRateD", "type": "uint256" }], "name": "TokenRateUpdate", "type": "event" }
];
