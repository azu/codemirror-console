// LICENSE : MIT
"use strict";
module.exports.initialize = function() {
    var consoleUI = require("codemirror-console-ui");
    var codeBlocks = document.querySelectorAll("gitbook-plugin-js-console + pre");
    for (var i = 0; i < codeBlocks.length; i++) {
        var codeBlock = codeBlocks[i];
        var code = codeBlock.getElementsByTagName("code")[0];
        if (!code) {
            continue
        }
        consoleUI(codeBlock, code.textContent);
    }
};