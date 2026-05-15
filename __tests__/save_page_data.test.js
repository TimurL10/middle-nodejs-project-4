import { test, expect } from '@jest/globals';
import nock from 'nock';
import {save_page_data} from '../src/download_page.js';
import * as fs from 'fs/promises';
import * as path from 'node:path';


let url = 'https://ru.hexlet.io/courses';

async function fileExists(dirPath, fileName) {
        const filePath = path.join(dirPath, fileName);

        return fs.access(filePath)
            .then(() => true)
            .catch(() => false);
        }

test('check image saved',async () => {
    let current_path = process.cwd();
    let html = await save_page_data(path.join(current_path,'..','__fixtures__/save_images.html'),url,path.join(current_path,'..','__fixtures__'));
    expect(await fileExists(path.join(current_path,'..','__fixtures__/ru_hexlet_io_courses_files'),'ru_hexlet_io_vite_assets_hexlet_ru_og_logo-BTQJlhfA_png.png')).toBe(true);

});

test('check html replaced',async () => {
    let current_path = process.cwd();
    let html = await save_page_data(path.join(current_path,'..','__fixtures__/save_images.html'),url,path.join(current_path,'..','__fixtures__/'));
    await fs.writeFile(html.f_path,html.text, 'utf-8');

    const actual = await fs.readFile(path.join(current_path,'..','__fixtures__/save_images.html'), 'utf-8');
    const expected = await fs.readFile(path.join(current_path,'..','__fixtures__/save_images_target.html'), 'utf-8');

    expect(actual).toBe(expected);   

});


