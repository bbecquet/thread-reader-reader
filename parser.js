const queryDOM = element => selector => Array.from(element.querySelectorAll(selector));

const getImageData = img => ({
  url: queryDOM(img)('img')[0].getAttribute('data-src')
});

const getVideoData = video => {
  const sources = queryDOM(video)('source');
  return {
    poster: queryDOM(video)('video')[0].getAttribute('poster'),
    sources: sources.map(source => ({
      src: source.getAttribute('src'),
      type: source.getAttribute('type'),
    }))
  }
};

function parseTweet(tweet) {
  const $tweet = queryDOM(tweet);

  const images = $tweet('.entity-image').map(getImageData);
  const videosHTML = $tweet('.entity-video').map(getVideoData);

  // Clean stuff. /!\ Modify the original node.
  const ignoreSelector = ['.row', '.entity-image', '.entity-video', '.tw-permalink'].join(',');
  $tweet(ignoreSelector).forEach(child => child.remove());
  $tweet('a.entity-url').forEach(child => {
    child.removeAttribute('data-preview');
    child.removeAttribute('class');
  });
  const tweetHTML = tweet.innerHTML; 

  return { tweetHTML, images, videosHTML };
}

function getTweets(threadReaderDoc) {
  return queryDOM(threadReaderDoc)('.t-main .content-tweet').map(parseTweet);
}

if (typeof exports === 'object' && typeof module !== 'undefined') {
  exports.getTweets = getTweets;
}
