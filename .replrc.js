var { ethers } = require('ethers');
var provider = new ethers.InfuraProvider('mainnet');

var getUncle = (hash) => provider.send('eth_getUncle
