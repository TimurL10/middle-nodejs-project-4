#!/usr/bin/env node

import { main } from '../src/download_page.js';


const url = process.argv[2];


main(url)
.catch((error) => {
    console.error(error.message);
    process.exit(1);
  });