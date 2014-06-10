"use strict";
var vm = require('vm');
var CodeMirror = require("codemirror");
require('codemirror/mode/javascript/javascript');
function MirrorConsole() {
    this.editor = this.createEditor();
}
MirrorConsole.prototype.createEditor = function () {
    this.textareaHolder = document.createElement("div");
    this.textarea = document.createElement("textarea");
    this.textareaHolder.appendChild(this.textarea);
    return CodeMirror.fromTextArea(this.textarea);
}
MirrorConsole.prototype.setText = function (value) {
    this.editor.setValue(value);
}
MirrorConsole.prototype.getText = function (value) {
    return this.editor.getValue();
}
MirrorConsole.prototype.swapWithElement = function (element) {
    this.originalElemenet = element;
    element.parentNode.replaceChild(this.textareaHolder, element)
    this.editor.refresh();
}
MirrorConsole.prototype.destroy = function (element) {
    if (this.originalElemenet == null) {
        throw new Error("Haven't `originalElemenet` : You have to call #swapWithElement before call this");
    }
    this.textareaHolder.parentNode.replaceChild(this.originalElemenet, this.textareaHolder);
    this.originalElemenet = null;
}
MirrorConsole.prototype.runInContext = function (context, callback) {
    var jsCode = this.editor.getValue();
    var res;
    try {
        res = vm.runInNewContext(jsCode, context);
        callback(null, res);
    } catch (error) {
        callback(error, res);
    }

}
module.exports = MirrorConsole;