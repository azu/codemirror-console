"use strict";
var assert = require("power-assert");
var MirrorConsole = require("../lib/mirror-console");
describe("mirror-console", function() {
    var mirrorConsole;
    var sandbox; // fixture area
    beforeEach(function() {
        mirrorConsole = new MirrorConsole();
        sandbox = document.createElement("div");
        document.body.appendChild(sandbox);
    });
    afterEach(function() {
        document.body.removeChild(sandbox);
    });
    context("When new initialized", function() {
        it("has editor property", function() {
            assert(mirrorConsole.editor);
        });
        it("create new editor each time", function() {
            var newConsole = new MirrorConsole();
            assert(mirrorConsole.editor !== newConsole.editor);
        });
    });
    describe("#setText", function() {
        it("should set text to editor", function() {
            mirrorConsole.setText("text");
            assert(mirrorConsole.getText() === "text");
        });
    });
    describe("#swapWithElement", function() {
        var div;
        beforeEach(function() {
            div = document.createElement("div");
            sandbox.appendChild(div);
        });
        context("when before swap", function() {
            it("has not `originalElement`", function() {
                assert(!mirrorConsole.originalElemenet);
            });
        });
        context("when swaped element", function() {
            beforeEach(function() {
                mirrorConsole.swapWithElement(div);
            });
            it("should swap element", function() {
                assert(mirrorConsole.originalElemenet);
                assert(mirrorConsole.originalElemenet === div);
            });
        });
    });
    describe("#destroy", function() {
        var div;
        beforeEach(function() {
            div = document.createElement("div");
            sandbox.appendChild(div);
        });
        context("when before swap", function() {
            it("has not `originalElement`", function() {
                assert.throws(function() {
                    mirrorConsole.destroy();
                }, Error);
            });
        });
        context("when swapped element", function() {
            beforeEach(function() {
                mirrorConsole.swapWithElement(div);
            });
            it("should sandbox restore original", function() {
                mirrorConsole.destroy();
                var actual = sandbox.firstChild.nodeName;
                var expected = div.nodeName;
                assert(sandbox.firstChild === div);
            });
            it("should destroy originalElement", function() {
                mirrorConsole.destroy();
                assert(!mirrorConsole.originalElemenet);
            });
        });
    });
    describe("#runInContext", function() {
        var div;
        beforeEach(function() {
            div = document.createElement("div");
            sandbox.appendChild(div);
        });
        afterEach(function() {
            mirrorConsole.destroy();
        });
        context("when text is empty", function() {
            beforeEach(function() {
                mirrorConsole.swapWithElement(div);
            });
            it("should result null", function(done) {
                mirrorConsole.runInContext({}, function(error, result) {
                    assert(error == null);
                    assert(result == null);
                    done();
                });
            });
        });
        context("when error", function() {
            beforeEach(function() {
                mirrorConsole.swapWithElement(div);
            });
            it("should use context value", function(done) {
                mirrorConsole.setText("throw new Error('in error');");
                mirrorConsole.runInContext({}, function(error, result) {
                    assert(error.message === "in error");
                    done();
                });
            });
        });
        context("when has context", function() {
            it("should use context value", function(done) {
                var context = {
                    a: "outer"
                };
                mirrorConsole.swapWithElement(div);
                mirrorConsole.setText("a;");
                mirrorConsole.runInContext(context, function(error, result) {
                    assert(result == "outer");
                    done();
                });
            });
            it("should call context function", function(done) {
                var context = {
                    log: function(text) {
                        assert(text === "test");
                    }
                };
                mirrorConsole.swapWithElement(div);
                mirrorConsole.setText("log('test')");
                mirrorConsole.runInContext(context, function(error, result) {
                    done(error);
                });
            });
            it("should handle async call", function(done) {
                var context = {
                    log: function(text) {
                        assert(text === "async");
                        done();
                    }
                };
                mirrorConsole.swapWithElement(div);
                mirrorConsole.setText("setTimeout(function(){ log('async'); }, 0);");
                mirrorConsole.runInContext(context, function(error, result) {});
            });
        });
    });
});
