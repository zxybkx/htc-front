const path = require('path');
const fs = require('fs');

const htcConfig = require('./htcpkg.json');

if (typeof process.env.CI_NODE_TOTAL === 'undefined') {
  process.env.CI_NODE_TOTAL = 1;
  process.env.CI_NODE_INDEX = 1;
}

const packageList = htcConfig.packages.map(item => item.name);


const ciNodeTotal = +(process.env.CI_NODE_TOTAL || 1);
const ciNodeIndex = +(process.env.CI_NODE_INDEX || 1);
const buildPackageList = packageList.filter((_, index) => index % ciNodeTotal === ciNodeIndex - 1);

console.log(buildPackageList.join(','));
