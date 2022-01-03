"use strict";
const { contextEval } = require("./context-eval");
const CodeMirror = require("codemirror");
require("codemirror/mode/javascript/javascript");

function MirrorConsole() {
    this.editor = this.createEditor();
}

MirrorConsole.prototype.createEditor = function () {
    this.textareaHolder = document.createElement("div");
    this.textarea = document.createElement("textarea");
    this.textareaHolder.appendChild(this.textarea);
    return CodeMirror.fromTextArea(this.textarea);
};
MirrorConsole.prototype.setText = function (value) {
    this.editor.setValue(value);
};
MirrorConsole.prototype.getText = function () {
    return this.editor.getValue();
};
MirrorConsole.prototype.swapWithElement = function (element) {
    this.originalElemenet = element;
    element.parentNode.replaceChild(this.textareaHolder, element);
    this.editor.refresh();
};
MirrorConsole.prototype.destroy = function () {
    if (this.originalElemenet == null) {
        throw new Error("Haven't `originalElement` : You have to call #swapWithElement before call this");
    }
    this.textareaHolder.parentNode.replaceChild(this.originalElemenet, this.textareaHolder);
    this.originalElemenet = null;
    this.textarea = null;
    this.textareaHolder = null;
    this.editor = null;
    if (this.removeContextEval) {
        this.removeContextEval();
    }
    Object.freeze(this);
};
/**
 * @param context
 * @param {{ type: "module" | "script" }} [options]
 * @returns {Promise<unknown>}
 */
MirrorConsole.prototype.runInContext = async function (context, options = {}) {
    const jsCode = this.editor.getValue();
    const { remove, result } = await contextEval(jsCode, context, options);
    this.removeContextEval = remove;
    return result;
};
module.exports = MirrorConsole;
