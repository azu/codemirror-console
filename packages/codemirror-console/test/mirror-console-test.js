"use strict";
const assert = require("assert");
const MirrorConsole = require("../lib/mirror-console");
describe("mirror-console", function () {
    var mirrorConsole;
    var sandbox; // fixture area
    beforeEach(function () {
        mirrorConsole = new MirrorConsole();
        sandbox = document.createElement("div");
        document.body.appendChild(sandbox);
    });
    afterEach(function () {
        document.body.removeChild(sandbox);
    });
    context("When new initialized", function () {
        it("has editor property", function () {
            assert(mirrorConsole.editor);
        });
        it("create new editor each time", function () {
            var newConsole = new MirrorConsole();
            assert(mirrorConsole.editor !== newConsole.editor);
        });
    });
    describe("#setText", function () {
        it("should set text to editor", function () {
            mirrorConsole.setText("text");
            assert(mirrorConsole.getText() === "text");
        });
    });
    describe("#swapWithElement", function () {
        var div;
        beforeEach(function () {
            div = document.createElement("div");
            sandbox.appendChild(div);
        });
        context("when before swap", function () {
            it("has not `originalElement`", function () {
                assert(!mirrorConsole.originalElemenet);
            });
        });
        context("when swaped element", function () {
            beforeEach(function () {
                mirrorConsole.swapWithElement(div);
            });
            it("should swap element", function () {
                assert(mirrorConsole.originalElemenet);
                assert(mirrorConsole.originalElemenet === div);
            });
        });
    });
    describe("#destroy", function () {
        var div;
        beforeEach(function () {
            div = document.createElement("div");
            sandbox.appendChild(div);
        });
        context("when before swap", function () {
            it("has not `originalElement`", function () {
                assert.throws(function () {
                    mirrorConsole.destroy();
                }, Error);
            });
        });
        context("when swapped element", function () {
            beforeEach(function () {
                mirrorConsole.swapWithElement(div);
            });
            it("should sandbox restore original", function () {
                mirrorConsole.destroy();
                var actual = sandbox.firstChild.nodeName;
                var expected = div.nodeName;
                assert(sandbox.firstChild === div);
            });
            it("should destroy originalElement", function () {
                mirrorConsole.destroy();
                assert(!mirrorConsole.originalElemenet);
            });
        });
    });
    describe("#runInContext", function () {
        var div;
        beforeEach(function () {
            div = document.createElement("div");
            sandbox.appendChild(div);
        });
        afterEach(function () {
            mirrorConsole.destroy();
        });
        context("when text is empty", function () {
            beforeEach(function () {
                mirrorConsole.swapWithElement(div);
            });
            it("should result null", function () {
                return mirrorConsole.runInContext({}).then((result) => {
                    assert.strictEqual(result, undefined);
                });
            });
        });
        context("when has text", function () {
            beforeEach(function () {
                mirrorConsole.swapWithElement(div);
            });
            it("should return the result", function () {
                mirrorConsole.setText("1+1");
                return mirrorConsole.runInContext({}).then((result) => {
                    assert.strictEqual(result, 2);
                });
            });
        });
        context("when error", function () {
            beforeEach(function () {
                mirrorConsole.swapWithElement(div);
            });
            it("should use context value", function () {
                mirrorConsole.setText("throw new Error('in error');");
                return mirrorConsole.runInContext({}).catch((error) => {
                    assert.strictEqual(error.message, "in error");
                });
            });
        });
        context("scenario testing", function () {
            beforeEach(function () {
                mirrorConsole.swapWithElement(div);
            });
            it("success → success", async function () {
                mirrorConsole.setText("1 + 1");
                const result1 = await mirrorConsole.runInContext({});
                assert.strictEqual(result1, 2);
                mirrorConsole.setText(`"string" + "2"`);
                const result2 = await mirrorConsole.runInContext({});
                assert.strictEqual(result2, "string2");
            });

            it("success → error", async function () {
                mirrorConsole.setText("1 + 1");
                const result1 = await mirrorConsole.runInContext({});
                assert.strictEqual(result1, 2);
                mirrorConsole.setText("throw new Error('in error');");
                const result2 = await mirrorConsole.runInContext({}).catch((error) => "ERROR");
                assert.strictEqual(result2, "ERROR");
            });
            it("error → error", async function () {
                mirrorConsole.setText("throw new Error('error 1');");
                const result1 = await mirrorConsole.runInContext({}).catch((error) => error.message);
                assert.strictEqual(result1, "error 1");
                mirrorConsole.setText("throw new Error('error 2');");
                const result2 = await mirrorConsole.runInContext({}).catch((error) => error.message);
                assert.strictEqual(result2, "error 2");
            });
            it("error → success", async function () {
                mirrorConsole.setText("throw new Error('in error');");
                const result1 = await mirrorConsole.runInContext({}).catch((error) => "ERROR");
                assert.strictEqual(result1, "ERROR");
                mirrorConsole.setText("1 + 1");
                const result2 = await mirrorConsole.runInContext({});
                assert.strictEqual(result2, 2);
            });
        });
        context("when has context", function () {
            it("should use context value", function () {
                var context = {
                    a: "outer"
                };
                mirrorConsole.swapWithElement(div);
                mirrorConsole.setText("a;");
                return mirrorConsole.runInContext(context).then((result) => {
                    assert.strictEqual(result, "outer");
                });
            });
            it("should call context function", function () {
                var context = {
                    log: function (text) {
                        assert(text === "test");
                    }
                };
                mirrorConsole.swapWithElement(div);
                mirrorConsole.setText("log('test')");
                return mirrorConsole.runInContext(context);
            });
            it("should handle async call", async function () {
                let shouldBeCalled = false;
                const context = {
                    log: function (text) {
                        shouldBeCalled = true;
                        assert(text === "async");
                    }
                };
                mirrorConsole.swapWithElement(div);
                mirrorConsole.setText("setTimeout(function(){ log('async'); }, 0);");
                await mirrorConsole.runInContext(context);
                await new Promise((resolve) => setTimeout(resolve, 100));
                assert.ok(shouldBeCalled);
            });
        });
        context("when type:module", function () {
            it("allow to execute Top-Level await", async function () {
                let shouldBeCalled = false;
                const context = {
                    log: function (text) {
                        shouldBeCalled = true;
                        assert(text === "async");
                    }
                };
                mirrorConsole.swapWithElement(div);
                mirrorConsole.setText("await new Promise((resolve) => setTimeout(resolve, 0));log('async');");
                await mirrorConsole.runInContext(context, {
                    type: "module"
                });
                await new Promise((resolve) => setTimeout(resolve, 100));
                assert.ok(shouldBeCalled);
            });
            it("always return undefined.[TODO] It is limitation", async function () {
                mirrorConsole.swapWithElement(div);
                mirrorConsole.setText("1;");
                const result = await mirrorConsole.runInContext(context, {
                    type: "module"
                });
                assert.strictEqual(result, undefined);
            });
            it("should reject when parse error", async function () {
                mirrorConsole.swapWithElement(div);
                mirrorConsole.setText("AS+++++@@@@;");
                return mirrorConsole
                    .runInContext(context, {
                        type: "module"
                    })
                    .then(() => assert.fail("should not resolve"))
                    .catch((error) => {
                        assert.ok(error instanceof Error);
                    });
            });
        });
        it("should return promise object when completion is promise", () => {
            mirrorConsole.swapWithElement(div);
            mirrorConsole.setText("new Promise((resolve) => resolve());");
            return mirrorConsole.runInContext({}).then((result) => {
                assert.strictEqual(result, undefined);
            });
        });
    });
});
