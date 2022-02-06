"use strict";
var attachToElement = window.ConsoleUI.attachToElement;
var codeBlocks = document.querySelectorAll(".executable");
for (let i = 0; i < codeBlocks.length; i++) {
    const codeBlock = codeBlocks[i];
    const code = codeBlock.getElementsByTagName("code")[0];
    if (!code) {
        continue;
    }
    attachToElement(codeBlock, codeBlocks.textContent);
}
