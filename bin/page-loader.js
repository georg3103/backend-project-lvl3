#!/usr/bin/env node
const commander = require('commander');
const { version } = require('../package.json');

const downloadPage = require('../index.js');

commander
  .version(version)
  .description('The utility for downloading page from the web')
  .arguments('<url> <output>')
  .action((url, output) => {
    downloadPage(url, output)
      .then(() => {
        console.log('page is loaded');
        process.exit(0);
      })
      .catch((err) => {
        console.error('Download completed with error:', err);
        process.exit(1);
      });
  })
  .parse(process.argv);
