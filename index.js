import {
  downloadFile,
  findOtherLinks,
  makePathsToStore,
  createDirs,
  updateStats,
  stats,
  storeFileContent,
} from './utils.js';

function spider(link, nesting, spiderCb, queue) {
  updateStats(link);

  /* ściąganie pliku */
  downloadFile(link, downloadingFinishedCb);

  function downloadingFinishedCb(body) {
    storeFileContent(link, body);
  }
}
const base = 'http://localhost:8080';
const finalCb = () => {
  console.log('Operation finished.');
  console.log(stats);
};
spider(base, 2, finalCb);
