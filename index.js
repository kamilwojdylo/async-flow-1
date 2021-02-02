import { TaskQueue } from './taskQueue.js';
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
    const linksInResponse = findOtherLinks(link, body);
    const linksCount = linksInResponse.length;

    if (linksCount > 0 && nesting > 0) {
      linksInResponse.forEach(link => {
        queue.pushTask((done) => {
          spider(link, nesting - 1, done, queue);
        });
      });
    }
    spiderCb();
  }
}
const base = 'http://localhost:8080';
const finalCb = () => {
  console.log('Operation finished.');
  console.log(stats);
};
const queue = new TaskQueue(2);
queue.on('error', console.error);
queue.on('empty', finalCb);
queue.pushTask((done) => {
  spider(base, 2, done, queue);
});
