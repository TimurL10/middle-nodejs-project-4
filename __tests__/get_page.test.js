import { test, expect } from '@jest/globals';
import nock from 'nock';
import {get_page} from '../src/download_page.js';

test('downloads html page', async () => {
  const html = '<html><body><h1>Courses</h1></body></html>';

  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, html, {
      'Content-Type': 'text/html',
    });

  const data = await get_page('https://ru.hexlet.io/courses');

  expect(data).toBe(html);
});


