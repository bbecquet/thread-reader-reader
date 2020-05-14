# Thread-reader-reader

Helps converting Twitter threads to real articles by extracting them to simple HTML. Relies on the [Thread reader](https://threadreaderapp.com) third-party app.

## Installation

1. Make sure you have Node and NPM installed.
2. Download the code and run `npm i` in the folder to install the dependency

## Usage

1. Submit the first tweet of a Twitter thread to [Thread reader](https://threadreaderapp.com)
2. Get the resulting URL (Should look like https://threadreaderapp.com/thread/1241364682084093953.html)
3. Run the CLI program with the following command:

    ```
    node cli.js <thread_reader_url>
    ```
4. The result will be written to the standard output.

By default, tweets will be output in `<p>` divs, and images and videos will be wrapped in a `<figure>` tag. Just modify the `cli.js` file to your needs.

## As a lib

You can also use the `parser.js` file as a separate lib.

The `getTweets` function takes a DOM element as input (JSDom or real DOM will work), basically the document of a Thread Reader page and will return an array of objects:

```js
{
    tweetHTML,  // inner markup of the tweet text, including links 
    images,     // array of { url } objects
    videosHTML  // array of HTML <video> markup
}
```