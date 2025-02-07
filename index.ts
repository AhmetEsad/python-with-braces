import pybconfig from './pybconfig.json';
import parseArguments from './util/argumentParser';
import lexer from './lexer';

const args = parseArguments(process.argv.slice(2));
const config = { ...pybconfig, ...args };
lexer(config);