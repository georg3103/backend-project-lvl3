#!/usr/bin/env node

import pageLoader from '../index';

console.log(pageLoader(Number(process.argv[process.argv.length - 1])));
