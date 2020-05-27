const fetch = require('node-fetch');
const emojis = require('node-emoji');
const getTweets = require('./parser').getTweets;
const JSDOM = require('jsdom').JSDOM;
const fs = require('fs-extra');
const path = require('path');

const [,, threadReaderUrl, rsrcDirPath, rsrcUrlPath] = process.argv;

function processDocument(document, { extractResources = false, resourcesUrlPath = '.' }) {
  const resources = [];
  const urlTransformer = extractResources ? rewriteUrl(resourcesUrlPath) : id;
  const html = getTweets(document)
    .map(({ tweetHTML, images, videos }) => {
      const tags = [ `<p>${emojis.strip(tweetHTML)}</p>` ];
      if (images.length > 0) {
        if (extractResources) {
          images.forEach(img => resources.push(img.url));
        }
        tags.push(`<figure style="display:flex">
          ${images.map(imageToHtml(urlTransformer)).join('')}
        </figure>`);
      }
      if (videos) {
        if (extractResources) {
          videos.forEach(video => {
            resources.push(video.poster);
            video.sources.forEach(source => resources.push(source.src));
          });
        }
        tags.push(`<figure>${videos.map(videoToHtml(urlTransformer)).join('')}</figure>`);
      }
      return tags;
    })
    .reduce((acc, tweetParts) => acc.concat(tweetParts), []) // alternative for missing .flat
    .join('');

  return { html, resources };
}

function download(url, destPath) {
  return fetch(url)
    .then(response => response.buffer())
    .then(buffer => fs.outputFile(destPath, buffer));
}

function downloadResources(urls, localPath) {
  return Promise.all(urls.map(async url => {
    console.log(`Downloading ${url}…`);
    return download(url, path.join(localPath, resourceBaseName(url)));
  }));
}

const id = x => x;
const resourceBaseName = url => path.basename(new URL(url).pathname);
const rewriteUrl = urlPath => url => path.join(urlPath, resourceBaseName(url));

const imageToHtml = urlTransformer => ({ url }) => 
  `<a class="media-link" href="${urlTransformer(url)}">
    <img class="media" loading="lazy" src="${urlTransformer(url)}" alt="" />
  </a>`;

const videoToHtml = urlTransformer => ({ poster, sources }) => {
  const types = sources.map(({ src, type }) => `<source src="${urlTransformer(src)}" type="${type}" />`);
  return `<video controls="" poster="${urlTransformer(poster)}">
    ${types.join('')}
    <img alt="" src="${urlTransformer(poster)}" />
  </video>`;
}

fetch(threadReaderUrl)
  .then(response => response.text())
  .then(html => new JSDOM(html).window.document)
  .then(doc => processDocument(doc, { extractResources: rsrcDirPath, resourcesUrlPath: rsrcUrlPath || rsrcDirPath }))
  .then(async ({ html, resources }) => {
    await downloadResources(resources, rsrcDirPath);
    return html;
  })
  .then(console.log);
