// LICENSE : MIT
"use strict";
import { attachToElement } from "codemirror-console-ui/components/mirror-console-component.js";

(function () {
    require("./style.css");
    var matchSelector = ".gitbook-plugin-js-console";

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

    function filterClosedJSConsole(element) {
        var text = element.textContent;
        var trimmedText = text.trim();
        return trimmedText === "js-console" || trimmedText === "js-console:closed";
    }

    function filterOpenJSConsole(element) {
        var text = element.textContent;
        return text.trim() === "js-console:open";
    }

    /**
     * <!-- js-console -->
     * <!-- js-console:{ "type": "module"} -->
     * @param {string} comment
     * @returns {{ state: "open" | "closed", scrollIntoView: boolean, type: "module" | "script" | "AsyncFunction" }}
     */
    function parseComment(comment) {
        const CONSOLE_METADATA = /js-console:({[^}]+})/;
        const DEFAULT_VALUE = {
            state: "closed",
            scrollIntoView: false,
            type: "script"
        };
        if (comment === "js-console") {
            return DEFAULT_VALUE;
        }
        const optionString = comment.match(CONSOLE_METADATA);
        if (!optionString) {
            return DEFAULT_VALUE;
        }
        try {
            const json = JSON.parse(optionString[1]);
            return {
                ...DEFAULT_VALUE,
                ...json
            };
        } catch (error) {
            throw new Error(`Can not parsed the metadata.

js-console:{ ... } should be json string.

Actual: ${optionString}
`);
        }
    }

    function updateCodeBlocs() {
        var insertPoints = document.querySelectorAll(matchSelector);
        var commentNodes = findComments(document);
        var getCommentNextPreNode = function (prevNode, nextNode, nextNextNode) {
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
        (function () {
            for (var i = 0; i < insertPoints.length; i++) {
                var button = insertPoints[i];
                var isOpen = button.classList.contains("open");
                var targetNode = button.parentNode;
                var prevNode = targetNode.previousElementSibling;
                var nextNode = targetNode.nextElementSibling;
                var nextNextNode = nextNode && nextNode.nextElementSibling;
                var replaceNode = getCommentNextPreNode(prevNode, nextNode, nextNextNode);
                if (replaceNode) {
                    if (isOpen) {
                        replaceCodeWithConsole(replaceNode, {
                            state: "open",
                            scrollIntoView: false
                        });
                    } else {
                        replaceCodeWithConsole(replaceNode, {
                            state: "closed",
                            scrollIntoView: false
                        });
                    }
                }
            }
        })();
        // <!-- js-console -->
        (function () {
            commentNodes
                .filter((commentNode) => {
                    return commentNode.textContent.trim().startsWith("js-console");
                })
                .map((commentNode) => {
                    return {
                        commentNode,
                        options: parseComment(commentNode.textContent.trim())
                    };
                })
                .forEach(({ commentNode, options }) => {
                    var targetNode = commentNode;
                    var prevNode = targetNode.previousElementSibling;
                    var nextNode = targetNode.nextElementSibling;
                    var nextNextNode = nextNode && nextNode.nextElementSibling;
                    var replaceNode = getCommentNextPreNode(prevNode, nextNode, nextNextNode);
                    if (replaceNode) {
                        replaceCodeWithConsole(replaceNode, options);
                    }
                });
        })();
    }

    window.gitbook.events.bind("page.change", function () {
        updateCodeBlocs();
    });

    function replaceCodeWithConsole(codeBlock, options) {
        var codes = codeBlock.getElementsByTagName("code");
        if (!codes || codes.length === 0) {
            return;
        }
        var code = codes[0];
        attachToElement(codeBlock, code.textContent, options);
    }
})();
