"use strict";
var MirrorConsole = require("codemirror-console");
function getDOMFromTemplate(template) {
    var div = document.createElement("div");
    div.innerHTML = template();
    return div;
}
function intendMirrorConsole(element) {
    var mirror = new MirrorConsole;
    var codeMirror = mirror.editor;
    codeMirror.setOption("lineNumbers", true);
    mirror.setText(element.textContent);
    var node = getDOMFromTemplate(require("./mirror-console-component.hbs"));
    var logArea = node.querySelector(".mirror-console-log");
    var consoleMock = {
        log: function () {
            var args = Array.prototype.slice.call(arguments);
            var div = document.createElement("div");
            div.className = "mirror-console-log-row mirror-console-log-normal";
            div.appendChild(document.createTextNode(args.join(",")));
            logArea.appendChild(div);
        },
        error: function () {
            var args = Array.prototype.slice.call(arguments);
            var div = document.createElement("div");
            div.className = "mirror-console-log-row mirror-console-log-error";
            div.appendChild(document.createTextNode(args.join(",")));
            logArea.appendChild(div);
        }
    }
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
        firstTouch(element);
    });
}
function firstTouch(element) {
    var parentNode = element.parentNode;
    var node = getDOMFromTemplate(require("./mirror-console-inject-div.hbs"));
    node.querySelector("#mirror-console-run-button").addEventListener("click", function editAndRun() {
        intendMirrorConsole(element);
        parentNode.removeChild(node);
    });
    if (element.nextSibling === null) {
        parentNode.appendChild(node);
    } else {
        parentNode.insertBefore(node, element.nextSibling);
    }
}
module.exports = function (element) {
    firstTouch(element);
}