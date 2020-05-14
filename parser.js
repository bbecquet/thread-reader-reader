const cheerio = require('cheerio');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

const getImageData = $img => ({
    url: $img.find('img').first().attr('data-src')
});

const cleanHtml = html => entities.decode(html).replace(/\n/g, '');

function parseTweet($originalTweet) {
    const $tweet = $originalTweet.clone();

    const images = $tweet
        .find('.entity-image')
        .map((_index, img) => getImageData(cheerio(img))).get();
    
    const videos = $tweet
        .find('.entity-video')
        .map((_index, video) => cheerio(video).html()).get();
        
    $tweet.children('.row')
        .add($tweet.children('.entity-image'))
        .add($tweet.children('.entity-video'))
        .add($tweet.children('.tw-permalink'))
        .remove();

    $tweet.children('a.entity-url')
        .removeAttr('data-preview')
        .removeAttr('class');
    
    return {
        tweetHTML: cleanHtml($tweet.html()),
        videoHTML: videos[0],
        images,
    };        
}

function getTweets(html) {
    const $ = cheerio.load(html, { decodeEntities: false });    // decodeEntities: false has no effect -_-
    return $('.t-main .content-tweet')
        .map((_index, tweet) => cheerio(tweet)).get()
        .map(parseTweet);
}

exports.getTweets = getTweets;
