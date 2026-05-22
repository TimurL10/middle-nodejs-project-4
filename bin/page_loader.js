#!/usr/bin/env node

import { main } from '../src/download_page.js';




const url;
const path_to_save;

if (args[0] === '-o') {
  path_to_save = args[1];
  url = args[2];
} else {
  url = args[0];
}

main(url, path_to_save = null)
.catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  });