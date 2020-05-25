const fetch = require('node-fetch');
const emojis = require('node-emoji');
const getTweets = require('./parser').getTweets;
const JSDOM = require('jsdom').JSDOM;

const [,, threadReaderUrl] = process.argv;

function processDocument(document) {
  return getTweets(document)
    .map(({ tweetHTML, videosHTML, images }) => {
      const tags = [ `<p>${emojis.strip(tweetHTML)}</p>` ];
      if (images.length > 0) {
        tags.push(`<figure style="display:flex">${images.map(imageToHtml).join('')}</figure>`);
      }
      if (videosHTML) {
        tags.push(`<figure>${videosHTML.map(videoToHtml).join('')}</figure>`);
      }
      return tags;
    })
    .reduce((acc, tweetParts) => acc.concat(tweetParts), []) // alternative for missing .flat
    .join('');
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
  .then(console.log);
