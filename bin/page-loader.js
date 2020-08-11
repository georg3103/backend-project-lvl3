#!/usr/bin/env node
import commander from 'commander';
import { version } from '../package.json';

import downloadPage from '../index';

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
