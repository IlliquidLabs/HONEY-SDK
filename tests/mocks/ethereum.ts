export function getWeb3(nodeEndpoint) {
    return {
        currentProvider: {
            constructor: {
                name: 'WebsocketProvider'
            },
            connection: {
                close: function() {
                }
            }
        },
        eth: {
            net: {
                getNetworkType: function () {
                    return 'dummy';
                }
            },
            Contract: function(abi, address) {
               return {
                    methods: {
                        addressOf: function(id) {
                            return {
                                call: function() {
                                    return '0x0000000000000000000000000000000000000000';
                                }
                            };
                        },
                        aggregate: function(calls, strict) {
                            return {
                                call: function() {
                                    return [0, []];
                                }
                            };
                        },
                        getConvertibleTokens: function() {
                            return {
                                call: function() {
                                    return [];
                                }
                            };
                        }
                    }
                };
            }
        }
    };
}

export function setConverterVersionGetter(ethereum, versions) {
    ethereum.web3 = {
        ...ethereum.web3,
        eth: {
            Contract: function(abi, address) {
                return {
                    methods: {
                        version: function() {
                            return {
                                call: function() {
                                    return versions.shift();
                                }
                            };
                        }
                    }
                };
            }
        }
    };
}

export function setConverterEventsGetter(ethereum, logs, events) {
    ethereum.web3 = {
        ...ethereum.web3,
        eth: {
            getBlock: function(number) {
                if (number == 'latest')
                    number = Number.MAX_SAFE_INTEGER;
                return {number: number, timestamp: number};
            },
            getPastLogs: function({address: address, topics: [topic0], fromBlock: fromBlock, toBlock: toBlock}) {
                return logs.filter(log => fromBlock <= log.blockNumber && log.blockNumber <= toBlock);
            },
            Contract: function(abi, address) {
                return {
                    getPastEvents: function(eventName, {fromBlock: fromBlock, toBlock: toBlock}) {
                        return events.filter(event => fromBlock <= event.blockNumber && event.blockNumber <= toBlock);
                    },
                    methods: {
                        decimals: function() {
                            return {
                                call: function() {
                                    return '18';
                                }
                            };
                        }
                    }
                };
            }
        }
    };
}

export function setRatesGetter(ethereum, rates) {
    ethereum.bancorNetwork.methods.getReturnByPath = function(path, amount) {
        return {
            encodeABI: function() {
                return '';
            }
        };
    };
    ethereum.multicallContract.methods.aggregate = function(calls, strict) {
        return {
            call: function() {
                return [0, rates.map(rate => ({success: true, data: '0x' + rate.toString(16).padStart(64, '0')}))];
            }
        };
    };
}
