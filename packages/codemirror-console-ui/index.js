"use strict";
var attachToElement = require("./components/mirror-console-component");
var codeBlocks = document.querySelectorAll(".executable");
for (var i = 0; i < codeBlocks.length; i++) {
    var codeBlock = codeBlocks[i];
    var code = codeBlock.getElementsByTagName("code")[0];
    if (!code) {
        continue
    }
    attachToElement(codeBlock, code.textContent);
}