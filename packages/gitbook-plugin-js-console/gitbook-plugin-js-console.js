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
        console: {
            process: function(block) {
                if (this.output.name !== "website") {
                    return '';
                }
                return '<a class="gitbook-plugin-js-console" aria-hidden="true"></a>';
            }
        }
    }
};
