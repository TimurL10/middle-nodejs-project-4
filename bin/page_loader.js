#!/usr/bin/env node

import main  from '../src/download_page.js';
import { Command } from 'commander';


/*
const args = process.argv.slice(2);
let url;
let path_to_save;

if (args[0] === '-o') {
  path_to_save = args[1];
  url = args[2];
} else {
  url = args[0];
}

main(url, path_to_save)
.catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  });

*/
const program = new Command();

program
  .name('page-loader')
  .description('Download page and local resources')
  .version('1.0.0')
  .option('-o, --output <dir>', 'output directory', process.cwd())
  .argument('<url>')
  .action((url, options) => {
    main(url, options.output)
      .then((dataDirPath) => {
        console.log(dataDirPath);
      })
      .catch((error) => {
        console.error(`Error: ${error.message}`);
        process.exit(1);
      });
  });

program.parse();
