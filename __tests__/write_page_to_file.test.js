import { test, expect } from '@jest/globals';
import nock from 'nock';
import {write_page_to_file} from '../src/download_page.js';
import * as fs from 'fs/promises';

import * as path from 'node:path';
import { fileURLToPath } from 'node:url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('check write_file', async() => {
    let test_path = path.join(__dirname,'..','__fixtures__');
    let file_name = 'https://ru.hexlet.io/courses';
    let target_path = await  write_page_to_file('test text',file_name,test_path);   

    let stats = await fs.stat(path.join(test_path,'ru-hexlet-io-courses.html'));
    expect (stats.size).toBeGreaterThan(1);
})

test('check file name and save path', async() => {
    let test_path = path.join(__dirname,'..','__fixtures__');
    let file_name = 'https://ru.hexlet.io/courses';
    let target_path = await  write_page_to_file('test text',file_name,test_path);
    expect(target_path).toBe(path.join(test_path,'ru-hexlet-io-courses.html'));    
})