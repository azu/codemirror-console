# codemirror-console-ui

Web UI Components of [codemirror-console](https://github.com/azu/codemirror-console "codemirror-console").

![img](http://monosnap.com/image/jeIGR8EHA2o0CaK0wfI4R3k7tuk4sN.png)

## Installation

``` sh
npm install codemirror-console-ui
```

## Usage

See [reusable components - substack/browserify-handbook](https://github.com/substack/browserify-handbook#reusable-components " reusable components")

Please use with browserify + [brfs](https://github.com/substack/brfs "brfs") or webpack.

```
browserify -t brfs app.js
```

And import codemirror css like this:

```
<link rel="stylesheet" href="node_modules/codemirror/lib/codemirror.css">
```

## How to custom Localization?

If you want to custom locale, please add translated text to [components/localization.js](components/localization.js).

1. Add translated text to [components/localization.js](components/localization.js)
2. Add lang(like "en", "ja") to [components/mirror-console-component.js](components/mirror-console-component.js)

## UseCase

- http://azu.github.io/promises-book/
- https://asciidwango.github.io/js-primer/
    - via GitBook plugin - [azu/gitbook-plugin-js-console](https://github.com/azu/gitbook-plugin-js-console "azu/gitbook-plugin-js-console: GitBook plugin that provide interactive JavaScript console")

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT
