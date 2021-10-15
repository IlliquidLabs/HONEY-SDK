export declare const ContractRegistry: {
    constant: boolean;
    inputs: {
        name: string;
        type: string;
    }[];
    name: string;
    outputs: {
        name: string;
        type: string;
    }[];
    payable: boolean;
    stateMutability: string;
    type: string;
}[];
export declare const HoneyProtocol: {
    constant: boolean;
    inputs: {
        name: string;
        type: string;
    }[];
    name: string;
    outputs: {
        name: string;
        type: string;
    }[];
    payable: boolean;
    stateMutability: string;
    type: string;
}[];
export declare const HoneyConverterRegistry: {
    constant: boolean;
    inputs: {
        name: string;
        type: string;
    }[];
    name: string;
    outputs: {
        name: string;
        type: string;
    }[];
    payable: boolean;
    stateMutability: string;
    type: string;
}[];
export declare const ERC20Token: {
    constant: boolean;
    inputs: any[];
    name: string;
    outputs: {
        name: string;
        type: string;
    }[];
    payable: boolean;
    stateMutability: string;
    type: string;
}[];
export declare const MulticallContract: {
    constant: boolean;
    inputs: ({
        components: {
            internalType: string;
            name: string;
            type: string;
        }[];
        internalType: string;
        name: string;
        type: string;
    } | {
        internalType: string;
        name: string;
        type: string;
        components?: undefined;
    })[];
    name: string;
    outputs: ({
        internalType: string;
        name: string;
        type: string;
        components?: undefined;
    } | {
        components: {
            internalType: string;
            name: string;
            type: string;
        }[];
        internalType: string;
        name: string;
        type: string;
    })[];
    payable: boolean;
    stateMutability: string;
    type: string;
}[];
export declare const ConversionEventLegacy: {
    anonymous: boolean;
    inputs: {
        indexed: boolean;
        name: string;
        type: string;
    }[];
    name: string;
    type: string;
}[];
export declare const TokenRateEventLegacy: {
    anonymous: boolean;
    inputs: {
        indexed: boolean;
        name: string;
        type: string;
    }[];
    name: string;
    type: string;
}[];
