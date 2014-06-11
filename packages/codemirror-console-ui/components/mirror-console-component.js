"use strict";
var MirrorConsole = require("codemirror-console");
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
    consoleMock.info = consoleMock.log.bind(consoleMock);
    mirror.swapWithElement(element);
    mirror.textareaHolder.appendChild(node);

    runCode();

    function runCode() {
        mirror.runInContext({ console: consoleMock }, function (error) {
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
}
function attachToElement(element, defalutText) {
    var parentNode = element.parentNode;
    var template = require("./mirror-console-inject-button.hbs");
    var node = getDOMFromTemplate(template());
    node.querySelector("#mirror-console-run-button").addEventListener("click", function editAndRun() {
        intendMirrorConsole(element, defalutText);
        parentNode.removeChild(node);
    });
    if (element.nextSibling === null) {
        parentNode.appendChild(node);
    } else {
        parentNode.insertBefore(node, element.nextSibling);
    }
}
module.exports = attachToElement;