"use strict";
const CodeMirror = require("codemirror");
const { createContextEval } = require("./context-eval");
require("codemirror/mode/javascript/javascript");

function MirrorConsole() {
    this.editor = this.createEditor();
    /**
     * @type {undefined | ReturnType<import("./context-eval").createContextEval> }
     */
    this.runningEvalContext = undefined;
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
    if (this.runningEvalContext) {
        this.runningEvalContext.remove();
    }
    Object.freeze(this);
};
/**
 * @param {object} context
 * @param {{ type: "module" | "script" }} [options]
 * @returns {Promise<unknown>}
 */
MirrorConsole.prototype.runInContext = async function (context, options = {}) {
    if (this.runningEvalContext) {
        this.runningEvalContext.remove(); // remove previous context at first
    }
    const jsCode = this.editor.getValue();
    this.runningEvalContext = createContextEval();
    return this.runningEvalContext.run(jsCode, context, options);
};
module.exports = MirrorConsole;
