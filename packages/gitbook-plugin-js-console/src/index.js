// LICENSE : MIT
"use strict";

(function() {
    require("codemirror-console-ui/components/mirror-console-compoenent.css");
    require("codemirror/lib/codemirror.css");
    require("./style.css");
    var consoleUI = require("codemirror-console-ui");

    function updateCodeBlocs() {
        var buttons = document.querySelectorAll(".gitbook-plugin-js-console");
        for (var i = 0; i < buttons.length; i++) {
            var button = buttons[i];
            var p = button.parentNode;
            var prevNode = p.previousElementSibling;
            var nextNode = p.nextElementSibling;
            if (prevNode && prevNode.nodeName === "PRE") {
                replaceCodeWithConsole(prevNode);
            }
            if (nextNode && nextNode.nodeName === "PRE") {
                replaceCodeWithConsole(nextNode);
            }
        }
    }

    window.gitbook.events.bind("page.change", function() {
        updateCodeBlocs();
    });
    function replaceCodeWithConsole(codeBlock) {
        var codes = codeBlock.getElementsByTagName("code");
        if (!codes || codes.length === 0) {
            return;
        }
        var code = codes[0];
        consoleUI(codeBlock, code.textContent);
    }

})();
