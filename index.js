import got from 'got';
import url from 'url';
import path from 'path';
import mkdirp from 'mkdirp';
import fs from 'fs';
import cheerio from 'cheerio';

const concurrency = 4;
let running = 1;
//let completed = 0;
let globalNumberOfLinks = 0;
let nextCount = 0;

const stats = {
  third: 0,
  second: 0,
  first: 0,
  pases: 0
};
function spider(link, nesting, spiderCb) {
  stats.pases += 1;
  if (link.includes('third/')) {
    stats.third += 1;
  } else if (link.includes('second/')) {
    stats.second += 1;
  } else {
    stats.first += 1;
  }

  if (nesting < 0) {
    console.log('too deep exit');
    return spiderCb && spiderCb();
  }

  /* Nazwy i ścieżki do zpaisania plików */
  const myURL = new url.URL(link);
  const storeFileName = 'index.html';
  const pageName = myURL.hostname;
  const storeDir = myURL.pathname;

  try {
    const pathToCreate = path.join(pageName, storeDir);
    mkdirp.sync(pathToCreate);
  } catch(err) {}

  /* ściąganie pliku */
  (async function downloadAFile() {
    const response = await got(link);
    console.log(link);
    downloadingFinishedCb(response.body, link);
  })();

  function downloadingFinishedCb(body) {
    const pathToStore = path.join(pageName, storeDir, storeFileName);
    //console.log({ pathToStore });
    fs.writeFileSync(pathToStore, body);
    const linksInResponse = findOtherLinks(myURL, body);
    const linksCount = linksInResponse.length;

    /*
    if (linksInResponse.length === 0) {
      return spiderCb && spiderCb();
    }
    */
    //console.log(`links count ${linksCount}`);
    linksInResponse.LINK = link;
    if (linksCount > 0) {
      running--;
      next(linksInResponse, 0, 0, nesting);
    } else {
      spiderCb();
    }
  }

  function next(nestedLinks, idx, completed, nesting) {
    //console.log(`downloadedLink = ${nestedLinks.LINK}, idx = ${idx}, completed = ${completed}, running = ${running}`)
    while (running < concurrency && idx < nestedLinks.length) {
      const nextLink = nestedLinks[idx++];
      if (nextLink.endsWith('second/1/third/2') || nextLink.endsWith('second/2/third/2')) {
        debugger;
      }

      function spideringFromNextFinished() {
        //console.log(`nextCb running ${running}`)
        if (++completed === nestedLinks.length) {
          //console.log(`completed = ${nestedLinks.LINK}`);
          return spiderCb && spiderCb();
        }
        running--;
        console.log(idx, nesting);
        next(nestedLinks, idx, completed, nesting);
      }
      const bindedFn = spideringFromNextFinished.bind({idx});
      spider(
        nextLink,
        nesting - 1,
        bindedFn
        //spideringFromNextFinished
      );
      running++;
    }
    nextCount++;
  }

}
const base = 'http://localhost:8080';
const finalCb = () => {
  console.log('Operation finished.');
  console.log(stats);
};
spider(base, 2, finalCb);

function findOtherLinks(baseUrl, body) {
  const $ = cheerio.load(body);
  const a = $('a');
  //console.log(a);
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
