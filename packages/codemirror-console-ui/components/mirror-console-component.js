"use strict";
var MirrorConsole = require("codemirror-console");
var merge = require("lodash.merge");
var userContext = {};
function getDOMFromTemplate(template) {
    var div = document.createElement("div");
    div.innerHTML = template;
    return div;
}
function intendMirrorConsole(element, defalutText) {
    var mirror = new MirrorConsole();
    var codeMirror = mirror.editor;
    codeMirror.setOption("lineNumbers", true);
    mirror.setText(defalutText || "");
    mirror.textareaHolder.className = "mirror-console-wrapper"
    var node = getDOMFromTemplate(require("./mirror-console-component.hbs")());
    var logArea = node.querySelector(".mirror-console-log");

    function printConsole(args, className) {
        var div = document.createElement("div");
        div.className = className;
        div.appendChild(document.createTextNode(args.join(",")));
        logArea.appendChild(div);
    }

    var consoleMock = {
        log: function () {
            printConsole(Array.prototype.slice.call(arguments), "mirror-console-log-row mirror-console-log-normal");
        },
        info: function () {
            printConsole(Array.prototype.slice.call(arguments), "mirror-console-log-row mirror-console-log-info");
        },
        warn: function () {
            printConsole(Array.prototype.slice.call(arguments), "mirror-console-log-row mirror-console-log-warn");
        },
        error: function () {
            printConsole(Array.prototype.slice.call(arguments), "mirror-console-log-row mirror-console-log-error");
        }
    }
    mirror.swapWithElement(element);
    mirror.textareaHolder.appendChild(node);

    runCode();

    function runCode() {
        var context = { console: consoleMock };
        var runContext = merge(context, userContext);
        mirror.runInContext(runContext, function (error) {
            if (error) {
                consoleMock.error(error);
            }
        });
    }

    node.querySelector("#mirror-console-run-button").addEventListener("click", function runJS() {
        runCode();
    });
    node.querySelector("#mirror-console-clear-button").addEventListener("click", function clearLog() {
        var range = document.createRange();
        range.selectNodeContents(node.querySelector(".mirror-console-log"));
        range.deleteContents();
    });
    node.querySelector("#mirror-console-exit-button").addEventListener("click", function clearLog() {
        mirror.destroy();
        attachToElement(element, defalutText);
    });

    return mirror;
}
function attachToElement(element, defalutText) {
    var parentNode = element.parentNode;
    var template = require("./mirror-console-inject-button.hbs");
    var divNode = getDOMFromTemplate(template());
    divNode.className = "mirror-console-attach-button-wrapper"
    divNode.querySelector("#mirror-console-run-button").addEventListener("click", function editAndRun() {
        var mirror = intendMirrorConsole(element, defalutText);
        mirror.textareaHolder.scrollIntoView(true);
        parentNode.removeChild(divNode);
    });
    if (element.nextSibling === null) {
        parentNode.appendChild(divNode);
    } else {
        parentNode.insertBefore(divNode, element.nextSibling);
    }
}
module.exports = attachToElement;
module.exports.setUserContext = function (context) {
    userContext = context;
}