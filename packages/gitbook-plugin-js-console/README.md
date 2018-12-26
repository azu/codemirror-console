# gitbook-plugin-js-console

GitBook plugin that provide interactive JavaScript console.

![ss](https://monosnap.com/file/nqF69gxFUpkJXWzl4Vt06kfZqoVpbC.png)

- [azu/codemirror-console-ui: UI Components of codemirror-console.](https://github.com/azu/codemirror-console-ui)

## Install

Install with [npm](https://www.npmjs.com/):

    npm install gitbook-plugin-js-console

## Usage

put "js-console" to your `book.json`

```json
{
  "gitbook": ">=3.0.0",
  "plugins": [
    "js-console"
  ]
}
```

And add `<!-- js-console -->` or `class="gitbook-plugin-js-console"` node before/after of CodeBlock.

    <!-- js-console -->
    ```js
    1 + 2;
    ```

See [example](./example/)

## Changelog

See [Releases page](https://github.com/azu/gitbook-plugin-js-console/releases).

## Running tests

Install devDependencies and Run `npm test`:

    npm i -d && npm test

## Contributing

Pull requests and stars are always welcome.

For bugs and feature requests, [please create an issue](https://github.com/azu/gitbook-plugin-js-console/issues).

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

- [github/azu](https://github.com/azu)
- [twitter/azu_re](https://twitter.com/azu_re)

## License

MIT © azu
