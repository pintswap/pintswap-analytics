#!/usr/bin/env node

const { ethers } = require('ethers');
const { logger } = require('../lib/logger');

const provider = new ethers.InfuraProvider('mainnet');

const { runAnalytics } = require('../lib/analytics');

(async () => {
  const unsubscribe = runAnalytics(provider, 'latest');
  logger.info('started process');
})().catch((err) => logger.error(err));
  
