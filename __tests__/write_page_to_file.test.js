import { test, expect } from '@jest/globals';
import nock from 'nock';
import {write_page_to_file} from '../src/download_page.js';
import * as fs from 'fs/promises';

test('check write_file', async() => {
    let test_path = 'C:\\temp\\';
    let file_name = 'https://ru.hexlet.io/courses';
    let target_path = await  write_page_to_file('test text',file_name,test_path);   

    let stats = await fs.stat('C:\\temp\\ru_hexlet_io_courses.html');
    expect (stats.size).toBeGreaterThan(1);
})

test('check file name and save path', async() => {
    let test_path = 'C:\\temp\\';
    let file_name = 'https://ru.hexlet.io/courses';
    let target_path = await  write_page_to_file('test text',file_name,test_path);
    expect(target_path).toBe('C:\\temp\\ru_hexlet_io_courses.html');    
})