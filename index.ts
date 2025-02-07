import fs from 'fs';
import pybconfig from './pybconfig.json';
import parseArguments from './util/argumentParser';

const args = parseArguments(process.argv.slice(2));

console.log(pybconfig);
console.log(args);

const config = { ...pybconfig, ...args };

console.log(config);

// console.log(fs.readdirSync(config.inFolder));