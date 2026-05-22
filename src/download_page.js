import debug from 'debug';
import { createRequire } from 'node:module';
import Listr from 'listr';

const require = createRequire(import.meta.url);

require('axios-debug-log/enable');

debug.enable('page-loader,page-loader:*,axios');

const log = debug('page-loader');

const axios = require('axios').default;

//import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import * as fs from 'fs/promises';
import * as path from 'node:path';
import * as cheerio from 'cheerio';

import { fileURLToPath } from 'node:url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


//https://ru.hexlet.io/courses


function create_name(file_name) {
  try {
    const url = new URL(file_name);

    const ext = path.extname(url.pathname);

    const pathname = ext
      ? url.pathname.slice(0, -ext.length)
      : url.pathname;

    return `${url.hostname}${pathname}`
      .replace(/\./g, '-')
      .replace(/\//g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 115);
  } catch (e) {
    throw new Error(`${new Date().toISOString()} create_name() ${e.message}`, { cause: e });
  }
}

export function get_page (url) {

  return axios({
        method: 'get',
        url: url,
        responseType: 'text'
    })
    .then((res) => res.data)
    .catch((e) => {
      const status = e.response?.status;
      const statusText = e.response?.statusText;
      throw new Error(`${new Date().toISOString()} get_page() failed for ${url}: ${status || ''} ${statusText || ''} ${e.message}`, { cause: e });
    })  
}


export function write_page_to_file (text,file_name,path_to_save=null) {
    let _path_to_save;
    if (!path_to_save)
        _path_to_save = __dirname;
    else 
      _path_to_save = path_to_save;

    let new_file_name = create_name(file_name) + '.html';
    new_file_name = path.join(_path_to_save,new_file_name);

    return fs.writeFile(new_file_name,text, 'utf-8').then(() => new_file_name)
    .catch((e) => {
      throw new Error(`${new Date().toISOString()} write_page_to_file() ${e.message}`, { cause: e });
    });    
}


function create_directory(path_to_save,dir_name) { 
  if (!dir_name)
    return;

  let new_path = path.join(path_to_save,create_name(dir_name)+'_files');

  return fs.access(new_path)
  .then(() => new_path)
  .catch(() => {
    return fs.mkdir(new_path, { recursive: true })
      .then(() => new_path)
      .catch((e) => {
        throw new Error(`${new Date().toISOString()} create_directory() ${e.message}`, { cause: e });
    }); 
  });       
}

function is_local_resource(item, page_url) {
  const source_host = new URL(item, page_url).hostname;
  const target_host = new URL(page_url).hostname;

  return source_host === target_host;
}


export function save_page_data(html_path,_url,path_to_save=null) {
  let _path_to_save;
  if (!path_to_save)
       _path_to_save = __dirname;
  else 
    _path_to_save = path_to_save;

  return fs.readFile(html_path,'utf-8').then((html) => { 
   
    return create_directory(_path_to_save,_url).then((new_dir_name) => {
      const $ = cheerio.load(html);
      const target_host = new URL(_url).hostname;

      const img_src_arr = $('img')
      .map((index, element) => $(element).attr('src'))
      .get()
      .filter(Boolean)
      .filter((item) => is_local_resource(item, _url));

      const links_href_arr = $('link[href]')
      .map((index, element) => $(element).attr('href'))
      .get()
      .filter(Boolean)
      .filter((item) => is_local_resource(item, _url));

      const scripts_src_arr = $('script[src]')
      .map((index, element) => $(element).attr('src'))
      .get()
      .filter(Boolean)
      .filter((item) => is_local_resource(item, _url));

      let promises1 = links_href_arr.map((item) => {
      const image_url = new URL(item, _url).href;
      const html_dir = path.dirname(html_path);

      const resource_ext = path.extname(new URL(image_url).pathname) || '.html';

      const new_file_name = path.join(
        new_dir_name,
        create_name(image_url) + resource_ext,
      );

      const relative_file_name = path.relative(html_dir, new_file_name);
      html = html.replace(item, relative_file_name);

      return axios({
        method: 'get',
        url: image_url,
        responseType: 'arraybuffer',
      })
        .then((res) => fs.writeFile(new_file_name, res.data))
        .then(() => new_file_name)
        .catch((e) => {
          const status = e.response?.status;
          const statusText = e.response?.statusText;

          throw new Error(
            `${new Date().toISOString()} save_page_data() failed for ${image_url}: ${status || ''} ${statusText || ''} ${e.message}`,
              { cause: e },
            );
          });
      });

      let promises2 = scripts_src_arr.map((item) => {
        const image_url = new URL(item, _url).href;
        const html_dir = path.dirname(html_path);
        const new_file_name = path.join(
          new_dir_name,
          create_name(image_url) + path.extname(new URL(image_url).pathname),
        );
        const relative_file_name = path.relative(html_dir, new_file_name);
        html = html.replace(item,relative_file_name);
        return axios({
            method: 'get',
            url: image_url,
            responseType: 'arraybuffer'
        })
        .then((res) => {return fs.writeFile(new_file_name,res.data)})
        .then(() => new_file_name)
        .catch((e) => {
            const status = e.response?.status;
            const statusText = e.response?.statusText;
            throw new Error(`${new Date().toISOString()} save_page_data() failed for ${image_url}: ${status || ''} ${statusText || ''} ${e.message}`, { cause: e });
          }) 
        })

      let promises = img_src_arr.map((item) => {
        const image_url = new URL(item, _url).href;
        const html_dir = path.dirname(html_path);
        const new_file_name = path.join(
          new_dir_name,
          create_name(image_url) + path.extname(new URL(image_url).pathname),
        );
        const relative_file_name = path.relative(html_dir, new_file_name);
        html = html.replace(item,relative_file_name);
        return axios({
            method: 'get',
            url: image_url,
            responseType: 'arraybuffer'
        })
        .then((res) => {return fs.writeFile(new_file_name,res.data)})
        .then(() => new_file_name)          
        .catch((e) => {
            const status = e.response?.status;
            const statusText = e.response?.statusText;
            throw new Error(`${new Date().toISOString()} save_page_data() failed for ${image_url}, status: ${status || ''}, statusText: ${statusText || ''} errorText: ${e.message}`, { cause: e });
          }) 
        })
      let all_promises = [...promises,...promises1,...promises2 ];    
      return Promise.all(all_promises).then(() => ({text:html,f_path:html_path}));
    }) 
  })
  .catch((e) => {
    throw e
    });
}


//  https://ru.hexlet.io/courses

function main(url, path_to_save = null) {
  log('start download_page.js');

  if (!url) {
    return Promise.reject(new Error('url you entered is wrong'));
  }

  const tasks = new Listr([
    {
      title: 'Download page',
      task: (ctx) => {
        return get_page(url)
          .then((data) => {
            ctx.data = data;
          });
      },
    },
    {
      title: 'Save page to file',
      task: (ctx) => {
        return write_page_to_file(ctx.data, url, path_to_save)
          .then((htmlPath) => {
            ctx.htmlPath = htmlPath;
          });
      },
    },
    {
      title: 'Download page resources',
      task: (ctx) => {
        return save_page_data(ctx.htmlPath, url, path_to_save)
          .then((html) => {
            ctx.html = html;
          });
      },
    },
    {
      title: 'Update html file',
      task: (ctx) => {
        return fs.writeFile(ctx.html.f_path, ctx.html.text, 'utf-8');
      },
    },
  ]);

  return tasks.run()
    .finally(() => {
      log('end download_page.js');
    });
}


export default main;
