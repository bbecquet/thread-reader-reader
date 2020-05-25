const fetch = require('node-fetch');
const emojis = require('node-emoji');
const getTweets = require('./parser').getTweets;
const JSDOM = require('jsdom').JSDOM;
const util = require('util')
const fs = require('fs')
const streamPipeline = util.promisify(require('stream').pipeline)

const [,, threadReaderUrl] = process.argv;

async function download(url, localPath) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
  await streamPipeline(response.body, fs.createWriteStream(localPath));
}

function processDocument(document) {
  const resources = [];
  const html = getTweets(document)
    .map(({ tweetHTML, videos, images }) => {
      const tags = [ `<p>${emojis.strip(tweetHTML)}</p>` ];
      if (images.length > 0) {
        images.forEach(image => resources.push(image));
        tags.push(`<figure style="display:flex">${images.map(imageToHtml).join('')}</figure>`);
      }
      if (videos) {
        tags.push(`<figure>${videos.map(videoToHtml).join('')}</figure>`);
      }
      return tags;
    })
    .reduce((acc, tweetParts) => acc.concat(tweetParts), []) // alternative for missing .flat
    .join('');

  return { html, resources };
}


async function downloadResources(resources) {
  resources.forEach(async ({ url }, index) => {
    console.log(`Downloading ${url}…`);
    await download(url, `./${index}.jpg`);
  });
}


const imageToHtml = ({ url }) => 
  `<a class="media-link" href="${url}"><img class="media" loading="lazy" src="${url}" alt="" /></a>`;

const videoToHtml = ({ poster, sources }) => {
  const types = sources.map(({ src, type }) => `<source src="${src}" type="${type}" />`);
  return `<video controls="" poster="${poster}">
    ${types.join('')}
    <img alt="" src="${poster}" />
  </video>`;
}

fetch(threadReaderUrl)
  .then(response => response.text())
  .then(html => new JSDOM(html).window.document)
  .then(processDocument)
  .then(({ html, resources }) => {
//    console.log(resources)
    downloadResources(resources);
    return html;
  });
  // .then(console.log);
