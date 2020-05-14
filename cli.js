const fetch = require('node-fetch');
const emojis = require('node-emoji');
const getTweets = require('./parser').getTweets;

const [,, threadReaderUrl] = process.argv;

function processHTML(html) {
    return getTweets(html)
        .map(({ tweetHTML, videoHTML, images }) => {
            const tags = [ `<p>${emojis.strip(tweetHTML)}</p>` ];
            if (images.length > 0) {
                tags.push(`<figure style="display:flex">${images.map(imageToHtml).join('')}</figure>`);
            }
            if (videoHTML) {
                tags.push(`<figure>${videoHTML}</figure>`);
            }
            return tags;
        })
        .reduce((acc, tweetParts) => acc.concat(tweetParts), []) // alternative for missing .flat
        .join('');
}

const imageToHtml = ({ url }) => 
    `<a class="media-link" href="${url}"><img class="media" loading="lazy" src="${url}" alt="" /></a>`;

fetch(threadReaderUrl)
    .then(response => response.text())
    .then(processHTML)
    .then(console.log);
