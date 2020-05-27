# Thread-reader-reader

Helps converting Twitter threads to stand-alone articles by extracting them to simple HTML. Relies on the [Thread reader](https://threadreaderapp.com) third-party app.

## Installation

1. Make sure you have Node and NPM installed.
2. Install the command globally
   ```
   npm i -g thread-reader-reader
   ```

## Usage

1. Submit the first tweet of a Twitter thread to [Thread reader](https://threadreaderapp.com)
2. Get the resulting URL (Should look like https://threadreaderapp.com/thread/1241364682084093953.html)
3. Run the CLI program with the following command:

    ```
    thread-reader-reader <thread_reader_url>
    ```
4. The result will be written to the standard output.

Tweets will be output in `<p>` divs, and images and videos will be wrapped in a `<figure>` tag following the paragraph of the tweet they appear in.

### Downloading resources

By default, original image and video urls will be kept, meaning links will still use the resources stored on Twitter servers.

Instead, you can download these resources locally by adding a path to a local directory as second parameter.

```
thread-reader-reader <thread_reader_url> [directory_to_store_files]
```

In that case, the urls to images and videos will be rewritten with the same path as relative url, replacing Twitter urls.

You can change this relative url by specifying a third parameter.

```
thread-reader-reader <thread_reader_url> [directory_to_store_files] [relative_url_path]
```

That way, it's easy to adapt to how your destination website stores content.

### Full example

Command:

```
thread-reader-reader https://threadreaderapp.com/thread/1241364682084093953.html aquatint-files /public/images/aquatint-files > aquatint-article.html
```

Result:

 - The extracted thread HTML will be written to the `aquatint-article.html` file.
 - In this HTML, urls to images and videos will use `/public/images/aquatint-files` as prefix.
 - Image and video files will be downloaded and stored in the `aquatint-files` directory, ready to be uploaded on your server, in the directory corresponding to `/public/images/aquatint-files`.


## As a lib

You can also use the `parser.js` file as a separate lib.

The `getTweets` function takes a DOM element as input (JSDom or real DOM will work), basically the document of a Thread Reader page and will return an array of objects:

```js
{
    tweetHTML,  // inner markup of the tweet text, including links 
    images,     // array of { url } objects
    videos      // array of { poster, sources: [{ type, src }] } objects
}
```