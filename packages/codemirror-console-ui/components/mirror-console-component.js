"use strict";
var MirrorConsole = require("codemirror-console");
function createConsole() {
    var template = require("./mirror-console-component.hbs");
    var div = document.createElement("div");
    div.innerHTML = template();
    return div;
}
module.exports = function (element) {
    var mirror = new MirrorConsole;
    mirror.setText(element.textContent);
    var node = createConsole();
    var consoleMock = {
        log: function () {
            var args = Array.prototype.slice.call(arguments);
            var logArea = node.querySelector(".mirror-console-log");
            var div = document.createElement("div");
            div.className = "mirror-console-log-row"
            div.appendChild(document.createTextNode(args.join(",")));
            logArea.appendChild(div);
        }
    }
    mirror.swapWithElement(element);
    mirror.textareaHolder.appendChild(node);
    node.querySelector("#mirror-console-run-button").addEventListener("click", function runJS() {
        mirror.runInContext({ console: consoleMock }, function (error) {
            if (error) {
                console.error(error);
            }
        });
    });
    node.querySelector("#mirror-console-clear-button").addEventListener("click", function clearLog() {
        var range = document.createRange();
        range.selectNodeContents(node.querySelector(".mirror-console-log"));
        range.deleteContents();
    });
}