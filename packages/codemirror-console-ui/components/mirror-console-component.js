"use strict";
var MirrorConsole = require("codemirror-console");
var merge = require("lodash.merge");
// https://github.com/kchapelier/in-browser-language
var browserLanguage = require('in-browser-language');
var userLang = browserLanguage.pick(['en', 'ja', 'zh'], 'en');
var localize = require("./localize");
var localization = require("./localization");
var newElement = require('new-element');
var fs = require('fs');

// context
var userContext = {};
function intendMirrorConsole(element, defaultsText) {
    var mirror = new MirrorConsole();
    var codeMirror = mirror.editor;
    codeMirror.setOption("lineNumbers", true);
    mirror.setText(defaultsText || "");
    mirror.textareaHolder.className = "mirror-console-wrapper";
    var html = fs.readFileSync(__dirname + "/mirror-console-component.hbs", "utf8");
    var node = newElement(html, localize(localization, userLang));
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
    };

    var runCode = function () {
        var context = {console: consoleMock};
        var runContext = merge(context, userContext);
        mirror.runInContext(runContext, function (error) {
            if (error) {
                consoleMock.error(error);
            }
        });
    };

    mirror.swapWithElement(element);
    mirror.textareaHolder.appendChild(node);
    // execute js in context
    runCode();

    node.querySelector(".mirror-console-run").addEventListener("click", function runJS() {
        runCode();
    });
    node.querySelector(".mirror-console-clear").addEventListener("click", function clearLog() {
        var range = document.createRange();
        range.selectNodeContents(node.querySelector(".mirror-console-log"));
        range.deleteContents();
    });
    node.querySelector(".mirror-console-exit").addEventListener("click", function exitConsole() {
        mirror.destroy();
        attachToElement(element, defaultsText);
    });

    return mirror;
}
function attachToElement(element, defaultsText) {
    var parentNode = element.parentNode;
    var html = fs.readFileSync(__dirname + "/mirror-console-inject-button.hbs", "utf8");
    var divNode = newElement(html, localize(localization, userLang));
    divNode.className = "mirror-console-attach-button-wrapper";
    divNode.querySelector(".mirror-console-run").addEventListener("click", function editAndRun() {
        var mirror = intendMirrorConsole(element, defaultsText);
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
};