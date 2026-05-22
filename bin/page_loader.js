#!/usr/bin/env node

import main  from '../src/download_page.js';



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