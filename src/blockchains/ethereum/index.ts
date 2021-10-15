import Web3 from 'web3';
import * as abis from './abis';
import * as helpers from '../../helpers';
import * as converterEvents from './converter_events';
import * as converterVersion from './converter_version';
import { timestampToBlockNumber } from './timestamp_to_block_number';
import { Blockchain, BlockchainType, Converter, ConversionEvent, TokenRateEvent, Token } from '../../types';

const CONTRACT_ADDRESSES = {
    main: {
        registry: '0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4',
        multicall: '0x5Eb3fa2DFECdDe21C950813C665E9364fa609bD2',
        anchorToken: '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C',
        pivotTokens: [
            '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C',
            '0x309627af60F0926daa6041B8279484312f2bf060'
        ],
        nonStandardTokenDecimals: {
            '0xE0B7927c4aF23765Cb51314A0E0521A9645F0E2A': '9',
            '0xbdEB4b83251Fb146687fa19D1C660F99411eefe3': '18',
            '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE': '18'
        }
    },
    ropsten: {
        registry: '0xA6DB4B0963C37Bc959CbC0a874B5bDDf2250f26F',
        multicall: '0xf3ad7e31b052ff96566eedd218a823430e74b406',
        anchorToken: '0xF35cCfbcE1228014F66809EDaFCDB836BFE388f5',
        pivotTokens: [
            '0xF35cCfbcE1228014F66809EDaFCDB836BFE388f5'
        ],
        nonStandardTokenDecimals: {
        }
    },
    dummy: {
        registry: '0x0000000000000000000000000000000000000000',
        multicall: '0x0000000000000000000000000000000000000000',
        anchorToken: '0x0000000000000000000000000000000000000000',
        pivotTokens: [
        ],
        nonStandardTokenDecimals: {
        }
    }
};

export class Ethereum implements Blockchain {
    web3: Web3;
    contractAddresses: object;
    networkType: string;
    HoneyProtocol: Web3.eth.Contract;
    converterRegistry: Web3.eth.Contract;
    multicallContract: Web3.eth.Contract;
    decimals: object;
    graph: object;
    trees: object;
    getPathsFunc: (sourceToken: string, targetToken: string) => string[][];

    static async create(nodeEndpoint: string | Object): Promise<Ethereum> {
        const ethereum = new Ethereum();
        ethereum.web3 = getWeb3(nodeEndpoint);
        ethereum.contractAddresses = CONTRACT_ADDRESSES;
        ethereum.networkType = await ethereum.web3.eth.net.getNetworkType();
        const contractRegistry = new ethereum.web3.eth.Contract(abis.ContractRegistry, getContractAddresses(ethereum).registry);
        const HoneyProtocolAddress = await contractRegistry.methods.addressOf(Web3.utils.asciiToHex('HoneyProtocol')).call();
        const converterRegistryAddress = await contractRegistry.methods.addressOf(Web3.utils.asciiToHex('BancorConverterRegistry')).call();
        ethereum.HoneyProtocol = new ethereum.web3.eth.Contract(abis.HoneyProtocol, HoneyProtocolAddress);
        ethereum.converterRegistry = new ethereum.web3.eth.Contract(abis.BancorConverterRegistry, converterRegistryAddress);
        ethereum.multicallContract = new ethereum.web3.eth.Contract(abis.MulticallContract, getContractAddresses(ethereum).multicall);
        ethereum.decimals = {...ethereum.contractAddresses[ethereum.networkType].nonStandardTokenDecimals};
        ethereum.getPathsFunc = ethereum.getSomePathsFunc;
        return ethereum;
    }

    static async destroy(ethereum: Ethereum): Promise<void> {
        if (ethereum.web3.currentProvider.disconnect)
            ethereum.web3.currentProvider.disconnect();
    }

    async refresh(): Promise<void> {
        this.graph = getGraph(await getTokens(this));
        this.trees = getTrees(this.graph, getContractAddresses(this).pivotTokens);
    }

    getAnchorToken(): Token {
        return {blockchainType: BlockchainType.Ethereum, blockchainId: getContractAddresses(this).anchorToken};
    }

    async getPaths(sourceToken: Token, targetToken: Token): Promise<Token[][]> {
        const sourceAddress = Web3.utils.toChecksumAddress(sourceToken.blockchainId);
        const targetAddress = Web3.utils.toChecksumAddress(targetToken.blockchainId);
        const addressPaths = this.getPathsFunc(sourceAddress, targetAddress);
        return addressPaths.map(addressPath => addressPath.map(address => ({blockchainType: BlockchainType.Ethereum, blockchainId: address})));
    }

    /**
     * @param tokenPaths paths to get rates for
     * @param tokenAmounts input amounts to get rates for
     * @returns The rates for each path in order, grouped by input amounts in order
     */
    async getRates(tokenPaths: Token[][], tokenAmounts: string[]): Promise<string[][]> {
        const addressPaths = tokenPaths.map(tokenPath => tokenPath.map(token => Web3.utils.toChecksumAddress(token.blockchainId)));
        const sourceDecimals = await getDecimals(this, addressPaths[0][0]);
        const targetDecimals = await getDecimals(this, addressPaths[0].slice(-1)[0]);
        const tokenRatesPerAmount = await getRatesSafe(this, addressPaths, tokenAmounts.map(tokenAmount => helpers.toWei(tokenAmount, sourceDecimals)));
        return tokenRatesPerAmount.map(tokenRates => tokenRates.map(tokenRate => helpers.fromWei(tokenRate, targetDecimals)));
    }

    async getConverterVersion(converter: Converter): Promise<string> {
        return (await converterVersion.get(this.web3, converter.blockchainId)).value;
    }

    async getConversionEvents(token: Token, fromBlock: number, toBlock: number): Promise<ConversionEvent[]> {
        return await converterEvents.getConversionEvents(this.web3, this.decimals, token.blockchainId, fromBlock, toBlock);
    }

    async getConversionEventsByTimestamp(token: Token, fromTimestamp: number, toTimestamp: number): Promise<ConversionEvent[]> {
        const fromBlock = await timestampToBlockNumber(this.web3, fromTimestamp);
        const toBlock = await timestampToBlockNumber(this.web3, toTimestamp);
        return await converterEvents.getConversionEvents(this.web3, this.decimals, token.blockchainId, fromBlock, toBlock);
    }

    async getTokenRateEvents(token: Token, fromBlock: number, toBlock: number): Promise<TokenRateEvent[]> {
        return await converterEvents.getTokenRateEvents(this.web3, this.decimals, token.blockchainId, fromBlock, toBlock);
    }

    async getTokenRateEventsByTimestamp(token: Token, fromTimestamp: number, toTimestamp: number): Promise<TokenRateEvent[]> {
        const fromBlock = await timestampToBlockNumber(this.web3, fromTimestamp);
        const toBlock = await timestampToBlockNumber(this.web3, toTimestamp);
        return await converterEvents.getTokenRateEvents(this.web3, this.decimals, token.blockchainId, fromBlock, toBlock);
    }

    getAllPathsFunc(sourceToken: string, targetToken: string): string[][] {
        const paths = [];
        const tokens = [Web3.utils.toChecksumAddress(sourceToken)];
        const destToken = Web3.utils.toChecksumAddress(targetToken);
        getAllPathsRecursive(paths, this.graph, tokens, destToken);
        return paths;
    }

    getSomePathsFunc(sourceToken: string, targetToken: string): string[][] {
        const commonTokens = this.graph[sourceToken].filter(token => this.graph[targetToken].includes(token));
        const paths = commonTokens.map(commonToken => [sourceToken, commonToken, targetToken]);
        const pivotTokens = getContractAddresses(this).pivotTokens;
        for (const pivotToken1 of pivotTokens) {
            for (const pivotToken2 of pivotTokens) {
                const sourcePath = getOnePathRecursive(this.trees[pivotToken1], sourceToken);
                const middlePath = getOnePathRecursive(this.trees[pivotToken2], pivotToken1);
                const targetPath = getOnePathRecursive(this.trees[pivotToken2], targetToken);
                paths.push(getMergedPath(sourcePath.concat(middlePath.slice(1)), targetPath));
            }
        }
        return Array.from(new Set<string>(paths.map(path => path.join(',')))).map(path => path.split(','));
    }
}

export const getWeb3 = function(nodeEndpoint) {
    const web3 = new Web3();
    web3.setProvider(nodeEndpoint);
    return web3;
};

export const getContractAddresses = function(ethereum) {
    if (ethereum.contractAddresses[ethereum.networkType])
        return ethereum.contractAddresses[ethereum.networkType];
    throw new Error(ethereum.networkType + ' network not supported');
};

export const getDecimals = async function(ethereum, token) {
    if (ethereum.decimals[token] == undefined) {
        try {
            const tokenContract = new ethereum.web3.eth.Contract(abis.ERC20Token, token);
            ethereum.decimals[token] = await tokenContract.methods.decimals().call();
        }
        catch {
            // falling back to 18 decimals
            ethereum.decimals[token] = 18;
        }
    }
    return ethereum.decimals[token];
};

async function getRatesSafe(ethereum, paths, amounts) {
    try {
        return await getRates(ethereum, paths, amounts);
    }
    catch (error) {
        if (paths.length > 1) {
            const mid = paths.length >> 1;
            const arr1 = await getRatesSafe(ethereum, paths.slice(0, mid), amounts);
            const arr2 = await getRatesSafe(ethereum, paths.slice(mid, paths.length), amounts);
            return Array(amounts.length).fill([]).map((_, i) => [...arr1[i], ...arr2[i]]);
        }
        return Array(amounts.length).fill(Array(paths.length).fill('0'));
    }
}

export const getRates = async function(ethereum, paths, amounts): Promise<string[][]> {
    const calls = amounts.map(amount => 
        paths.map(path => [ethereum.HoneyProtocol._address, ethereum.HoneyProtocol.methods.getReturnByPath(path, amount).encodeABI()])
    ).reduce((array, val) => array.concat(val), []);

    const [blockNumber, returnData] = await ethereum.multicallContract.methods.aggregate(calls, false).call();
    return Array(amounts.length).fill('0').map((_, i) => {
        const _returnData = returnData.slice(i * paths.length, i * paths.length + paths.length)
        return _returnData.map(item => item.success ? Web3.utils.toBN(item.data.substr(0, 66)).toString() : '0');
    });
}

export const getTokens = async function(ethereum) {
    const convertibleTokens = await ethereum.converterRegistry.methods.getConvertibleTokens().call();
    const calls = convertibleTokens.map(convertibleToken => [ethereum.converterRegistry._address, ethereum.converterRegistry.methods.getConvertibleTokenSmartTokens(convertibleToken).encodeABI()]);
    const [blockNumber, returnData] = await ethereum.multicallContract.methods.aggregate(calls, true).call();
    const smartTokenLists = returnData.map(item => Array.from(Array((item.data.length - 130) / 64).keys()).map(n => Web3.utils.toChecksumAddress(item.data.substr(64 * n + 154, 40))));
    return convertibleTokens.reduce((obj, item, index) => ({...obj, [item]: smartTokenLists[index]}), {});
};

function getGraph(tokens) {
    const graph = {};

    const smartTokens = {};

    for (const convertibleToken in tokens) {
        for (const smartToken of tokens[convertibleToken]) {
            if (smartTokens[smartToken] == undefined)
                smartTokens[smartToken] = [convertibleToken];
            else
                smartTokens[smartToken].push(convertibleToken);
        }
    }

    for (const smartToken in smartTokens) {
        for (const convertibleToken of smartTokens[smartToken]) {
            updateGraph(graph, smartToken, [smartToken, convertibleToken]);
            updateGraph(graph, convertibleToken, [smartToken, smartToken]);
        }
    }

    for (const smartToken in smartTokens) {
        for (const sourceToken of smartTokens[smartToken]) {
            for (const targetToken of smartTokens[smartToken]) {
                if (sourceToken != targetToken)
                    updateGraph(graph, sourceToken, [smartToken, targetToken]);
            }
        }
    }

    return graph;
}

function getTrees(graph, pivotTokens) {
    const trees = {};

    for (const pivotToken of pivotTokens)
        trees[pivotToken] = getTree(graph, pivotToken);

    return trees;
}

function updateGraph(graph, key, value) {
    if (graph[key] == undefined)
        graph[key] = [value];
    else
        graph[key].push(value);
}

function getTree(graph, root) {
    const tree = {[root]: []};
    const queue = [root];
    while (queue.length > 0) {
        const dst = queue.shift();
        for (const src of graph[dst].filter(src => tree[src[1]] === undefined)) {
            tree[src[1]] = [src[0], dst];
            queue.push(src[1]);
        }
    }
    return tree;
}

function getAllPathsRecursive(paths, graph, tokens, destToken) {
    const prevToken = tokens[tokens.length - 1];
    if (prevToken == destToken)
        paths.push(tokens);
    else for (const pair of graph[prevToken].filter(pair => !tokens.includes(pair[1])))
        getAllPathsRecursive(paths, graph, [...tokens, ...pair], destToken);
}

function getOnePathRecursive(tree, token) {
    if (tree[token].length > 0)
        return [token, tree[token][0], ...getOnePathRecursive(tree, tree[token][1])];
    return [token];
}

function getMergedPath(sourcePath, targetPath) {
    if (sourcePath.length > 0 && targetPath.length > 0) {
        let i = sourcePath.length - 1;
        let j = targetPath.length - 1;
        while (i >= 0 && j >= 0 && sourcePath[i] == targetPath[j]) {
            i--;
            j--;
        }

        const path = [];
        for (let m = 0; m <= i + 1; m++)
            path.push(sourcePath[m]);
        for (let n = j; n >= 0; n--)
            path.push(targetPath[n]);

        let length = 0;
        for (let p = 0; p < path.length; p += 1) {
            for (let q = p + 2; q < path.length - p % 2; q += 2) {
                if (path[p] == path[q])
                    p = q;
            }
            path[length++] = path[p];
        }

        return path.slice(0, length);
    }

    return [];
}
