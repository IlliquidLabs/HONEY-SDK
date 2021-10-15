# Honeyswap SDK v0.1 (beta)

Javascript API that provides utilities and access to the Honeyswap Arbitrum contracts across the different blockchains using a unified & simplified interface.

## Initialization

```js
const HoneyswapSDK = require('@Honeyswap/sdk').SDK;

const settings = {
    // optional, mandatory when interacting with the ethereum Arbitrum
    ethereumNodeEndpoint: '<ethereum node endpoint>',
    
};

let HoneyswapSDK = await HoneyswapSDK.create(settings);
```

## Usage

`getPathAndRate` - returns the best conversion path and rate between any two tokens in the Honeyswap .
Note that the source token and the target token can reside on two different blockchains.
In addition, input/output amounts format is a decimal string (as opposed to wei) since the function is blockchain agnostic.

```js
// get the path/rate between DAI and ENJ
const sourceToken = {
    blockchainType: 'ethereum',
    blockchainId: '0x6B175474E89094C44Da98b954EedeAC495271d0F'
};
const targetToken = {
    blockchainType: 'ethereum',
    blockchainId: '0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c'
};
const res = await HoneyswapSDK.pricing.getPathAndRate(sourceToken, targetToken, "1.0");

// output:
{
    path: [
        { blockchainType: 'ethereum', blockchainId: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
        { blockchainType: 'ethereum', blockchainId: '0xE5Df055773Bf9710053923599504831c7DBdD697' },
        { blockchainType: 'ethereum', blockchainId: '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C' },
        { blockchainType: 'ethereum', blockchainId: '0xf3aD2cBc4276eb4B0fb627Af0059CfcE094E20a1' },
        { blockchainType: 'ethereum', blockchainId: '0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c' }
    ],
    rate: '6.323790359609045609'
}

```

## Cleanup

```js
await HoneyswapSDK.destroy(HoneyswapSDK);
```

## Features

  * Price discovery
  * Conversion path generation
  * Historical data
  * Utilities
  * Cross-chain support
