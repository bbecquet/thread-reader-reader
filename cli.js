#!/usr/bin/env node
const fetch = require('node-fetch');
const emojis = require('node-emoji');
const getTweets = require('./parser').getTweets;
const JSDOM = require('jsdom').JSDOM;
const { rewriteUrl, downloadResources } = require('./resourceManager');

const [,, threadReaderUrl, rsrcDirPath, rsrcUrlPath] = process.argv;

function processDocument(document, { extractResources = false, resourcesUrlPath = '.' }) {
  const resources = [];
  const urlTransformer = extractResources ? rewriteUrl(resourcesUrlPath) : x => x;
  const html = getTweets(document)
    .map(({ tweetHTML, images, videos }) => {
      const imagesHTML = images.map(img => {
        if (extractResources) {
          resources.push(img.url);
        }
        return imageToHtml(urlTransformer)(img);
      });
      const videosHTML = videos.map(video => {
        if (extractResources) {
          resources.push(video.poster);
          video.sources.forEach(source => resources.push(source.src));
        }
        return videoToHtml(urlTransformer)(video);
      });
      return { tweetHTML: emojis.strip(tweetHTML), imagesHTML, videosHTML };
    })
    .map(({ tweetHTML, imagesHTML, videosHTML }) => {
      const tags = [ `<p>${tweetHTML}</p>` ];
      if (imagesHTML.length > 0) { tags.push(`<figure style="display:flex">${imagesHTML.join('')}</figure>`); }
      if (videosHTML.length > 0) { tags.push(`<figure>${videosHTML.join('')}</figure>`); }
      return tags;
    })
    .reduce((acc, tweetParts) => acc.concat(tweetParts), []) // alternative for missing .flat
    .join('');

  return { html, resources };
}

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
  .then(doc => processDocument(doc, {
    extractResources: !!rsrcDirPath,
    resourcesUrlPath: rsrcUrlPath || rsrcDirPath
  }))
  .then(async ({ html, resources }) => {
    await downloadResources(resources, rsrcDirPath);
    return html;
  })
  .then(console.log);
