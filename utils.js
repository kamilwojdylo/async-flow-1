import url from 'url';
import cheerio from 'cheerio';
import got from 'got';
import path from 'path';
import mkdirp from 'mkdirp';
import fs from 'fs';

const stats = {
  third: 0,
  second: 0,
  first: 0,
  pases: 0
};

function downloadFile(link, downloadingFinishedCb) {
  (async function downloadAFile() {
    const response = await got(link);
    console.log(`down: ${link}`);
    downloadingFinishedCb(response.body, link);
  })();
}

function findOtherLinks(link, body) {
  const baseUrl = new url.URL(link);
  const $ = cheerio.load(body);
  const a = $('a');
  let links = Array(a.length);
  for (let i = 0; i < a.length; i += 1) {
    links[i] = a[i].attribs.href;
  }
  links = links
    .map(link => {
      const linkUrl = url.parse(link);
      if (linkUrl.hostname === null) {
        //link = link.substr(1);
        return `${baseUrl.href}${link}`;
      }
      if (linkUrl.hostname !== baseUrl.hostname) {
        return null;
      }
      return link;
    })
    .filter(link => link !== null)
  ;
  return links;
}

function storeFileContent(link, body) {
    const { storeFileName, pageName, storeDir } = makePathsToStore(link);
    createDirs(pageName, storeDir);
    fs.writeFileSync(path.join(pageName, storeDir, storeFileName), body);
}

function makePathsToStore(link) {
  const myURL = new url.URL(link);
  const storeFileName = 'index.html';
  const pageName = myURL.hostname;
  const storeDir = myURL.pathname;

  return {
    myURL,
    storeFileName,
    pageName,
    storeDir
  };
};

function createDirs(pageName, storeDir) {
  try {
    const pathToCreate = path.join(pageName, storeDir);
    mkdirp.sync(pathToCreate);
  } catch(err) {
    console.error(err)
  }
}

function updateStats(link) {
  stats.pases += 1;
  if (link.includes('third/')) {
    stats.third += 1;
  } else if (link.includes('second/')) {
    stats.second += 1;
  } else {
    stats.first += 1;
  }
}

export {
  downloadFile,
  findOtherLinks,
  makePathsToStore,
  createDirs,
  updateStats,
  stats,
  storeFileContent,
};
