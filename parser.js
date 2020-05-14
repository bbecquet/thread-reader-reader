const queryDOM = element => selector => Array.from(element.querySelectorAll(selector));

const getImageData = img => ({
  url: queryDOM(img)('img')[0].getAttribute('data-src')
});

function parseTweet(tweet) {
  const $tweet = queryDOM(tweet);

  const images = $tweet('.entity-image').map(getImageData);
  const videosHTML = $tweet('.entity-video').map(video => video.innerHTML);

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
