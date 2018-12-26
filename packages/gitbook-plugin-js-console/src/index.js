// LICENSE : MIT
"use strict";

(function() {
    require("codemirror-console-ui/components/mirror-console-compoenent.css");
    require("codemirror/lib/codemirror.css");
    require("./style.css");
    var consoleUI = require("codemirror-console-ui");
    var matchSelector = ".gitbook-plugin-js-console";
    var matchCommentText = "js-console";

    function findComments(element) {
        var arr = [];
        for (var i = 0; i < element.childNodes.length; i++) {
            var node = element.childNodes[i];
            if (node.nodeType === 8) {
                arr.push(node);
            } else {
                arr.push.apply(arr, findComments(node));
            }
        }
        return arr;
    }

    function filterJSConsole(element) {
        const text = element.textContent;
        return text.trim() === matchCommentText;
    }

    function updateCodeBlocs() {
        var insertPoints = document.querySelectorAll(matchSelector);
        var commentNodes = findComments(document).filter(filterJSConsole);
        var matchNode = function(prevNode, nextNode, nextNextNode) {
            if (prevNode && prevNode.nodeName === "PRE") {
                return prevNode;
            }
            if (nextNode && nextNode.nodeName === "PRE") {
                return nextNode;
            } else if (nextNextNode && nextNextNode.nodeName === "PRE") {
                // some plugin fallback
                // for https://github.com/azu/gitbook-plugin-include-codeblock
                return nextNextNode;
            }
            return null;
        };
        // .gitbook-plugin-js-console
        (function() {
            for (var i = 0; i < insertPoints.length; i++) {
                var button = insertPoints[i];
                var targetNode = button.parentNode;
                var prevNode = targetNode.previousElementSibling;
                var nextNode = targetNode.nextElementSibling;
                var nextNextNode = nextNode && nextNode.nextElementSibling;
                var replaceNode = matchNode(prevNode, nextNode, nextNextNode);
                if (replaceNode) {
                    replaceCodeWithConsole(replaceNode);
                }
            }
        })();
        // <!-- js-console -->
        (function() {
            for (var i = 0; i < commentNodes.length; i++) {
                var targetNode = commentNodes[i];
                var prevNode = targetNode.previousElementSibling;
                var nextNode = targetNode.nextElementSibling;
                var nextNextNode = nextNode && nextNode.nextElementSibling;
                var replaceNode = matchNode(prevNode, nextNode, nextNextNode);
                if (replaceNode) {
                    replaceCodeWithConsole(replaceNode);
                }
            }
        })();
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
