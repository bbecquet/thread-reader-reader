const fetch = require('node-fetch');
const fs = require('fs-extra');
const path = require('path');

const resourceBaseName = url => path.basename(new URL(url).pathname);
const rewriteUrl = urlPath => url => path.join(urlPath, resourceBaseName(url));

function download(url, destPath) {
  return fetch(url)
    .then(response => response.buffer())
    .then(buffer => fs.outputFile(destPath, buffer));
}

function downloadResources(urls, localPath) {
  return Promise.all(urls.map(async url =>
    download(url, path.join(localPath, resourceBaseName(url)))
  ));
}

if (typeof exports === 'object' && typeof module !== 'undefined') {
  exports.downloadResources = downloadResources;
  exports.rewriteUrl = rewriteUrl;
}