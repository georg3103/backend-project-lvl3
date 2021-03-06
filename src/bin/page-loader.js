#!/usr/bin/env node
import commander from 'commander';
import { version } from '../../package.json';

import downloadPage from '..';

commander
  .version(version)
  .description('The utility for downloading page from the web')
  .arguments('<url>')
  .option('--output [path]', 'Output path', process.cwd())
  .action((url, cmd) => {
    downloadPage(url, cmd.output)
      .then(() => {
        console.log(`Page has been successfully downloaded to ${cmd.output}`);
      })
      .catch((err) => {
        console.error('Download completed with error:', err);
        process.exit(1);
      });
  })
  .parse(process.argv);
