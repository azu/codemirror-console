// LICENSE : MIT
"use strict";
module.exports = {
    book: {
        assets: './assets',
        js: [
            'console-ui.js'
        ]
    },
    blocks: {
        "console": {
            process: function(block) {
                return '<button class="gitbook-plugin-js-console">コンソールを開く</button>';
            }
        }
    }
};
