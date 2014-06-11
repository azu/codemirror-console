(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// hbsfy compiled Handlebars template
var Handlebars = require('hbsfy/runtime');
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class=\"mirror-console-command\">\n    <button class=\"mirror-console-button mirror-console-run\" id=\"mirror-console-run-button\">実行</button>\n    <button class=\"mirror-console-button mirror-console-clear\" id=\"mirror-console-clear-button\">ログをクリア</button>\n    <button class=\"mirror-console-button mirror-console-exit\" id=\"mirror-console-exit-button\">終了</button>\n</div>\n<div class=\"mirror-console-log\">\n</div>";
  });

},{"hbsfy/runtime":17}],2:[function(require,module,exports){
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
},{"./mirror-console-component.hbs":1,"./mirror-console-inject-button.hbs":3,"codemirror-console":5}],3:[function(require,module,exports){
// hbsfy compiled Handlebars template
var Handlebars = require('hbsfy/runtime');
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<button class=\"mirror-console-button mirror-console-run\" id=\"mirror-console-run-button\">実行</button>";
  });

},{"hbsfy/runtime":17}],4:[function(require,module,exports){
"use strict";
var attachToElement = require("./components/mirror-console-component");
var content = document.querySelector(".content");
attachToElement(content, content.textContent);

},{"./components/mirror-console-component":2}],5:[function(require,module,exports){
"use strict";
var EvalContext = require("context-eval");
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
    this.textarea = null;
    this.textareaHolder = null;
    this.editor = null;
    if (this.evalContext) {
        this.evalContext.destroy();
    }
    Object.freeze(this);
}
MirrorConsole.prototype.runInContext = function (context, callback) {
    if (this.evalContext) {
        this.evalContext.destroy();
    }
    this.evalContext = new EvalContext(context, this.textareaHolder);
    var jsCode = this.editor.getValue();
    var res;
    try {
        res = this.evalContext.evaluate(jsCode);
        callback(null, res);
    } catch (error) {
        callback(error, res);
    }

}
module.exports = MirrorConsole;
},{"codemirror":8,"codemirror/mode/javascript/javascript":9,"context-eval":6}],6:[function(require,module,exports){
if (!(typeof window !== "undefined" && window !== null)) {
  // Will do this dance so the require isn't parsed for browserify etc.
  var moduleName = './lib/context-node';
  module.exports = require(moduleName);
} else {
  module.exports = require('./lib/context-browser');
}

},{"./lib/context-browser":7}],7:[function(require,module,exports){
function Context(sandbox, parentElement) {
  this.iframe = document.createElement('iframe');
  this.iframe.style.display = 'none';
  parentElement = parentElement || document.body;
  parentElement.appendChild(this.iframe);
  var win = this.iframe.contentWindow;
  sandbox = sandbox || {};
  Object.keys(sandbox).forEach(function (key) {
    win[key] = sandbox[key];
  });
}

Context.prototype.evaluate = function (code) {
  return this.iframe.contentWindow.eval(code);
};

Context.prototype.destroy = function () {
  if (this.iframe) {
    this.iframe.parentNode.removeChild(this.iframe);
    this.iframe = null;
  }
};

module.exports = Context;
},{}],8:[function(require,module,exports){
// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

// This is CodeMirror (http://codemirror.net), a code editor
// implemented in JavaScript on top of the browser's DOM.
//
// You can find some technical background for some of the code below
// at http://marijnhaverbeke.nl/blog/#cm-internals .

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    module.exports = mod();
  else if (typeof define == "function" && define.amd) // AMD
    return define([], mod);
  else // Plain browser env
    this.CodeMirror = mod();
})(function() {
  "use strict";

  // BROWSER SNIFFING

  // Kludges for bugs and behavior differences that can't be feature
  // detected are enabled based on userAgent etc sniffing.

  var gecko = /gecko\/\d/i.test(navigator.userAgent);
  // ie_uptoN means Internet Explorer version N or lower
  var ie_upto10 = /MSIE \d/.test(navigator.userAgent);
  var ie_upto7 = ie_upto10 && (document.documentMode == null || document.documentMode < 8);
  var ie_upto8 = ie_upto10 && (document.documentMode == null || document.documentMode < 9);
  var ie_upto9 = ie_upto10 && (document.documentMode == null || document.documentMode < 10);
  var ie_11up = /Trident\/([7-9]|\d{2,})\./.test(navigator.userAgent);
  var ie = ie_upto10 || ie_11up;
  var webkit = /WebKit\//.test(navigator.userAgent);
  var qtwebkit = webkit && /Qt\/\d+\.\d+/.test(navigator.userAgent);
  var chrome = /Chrome\//.test(navigator.userAgent);
  var presto = /Opera\//.test(navigator.userAgent);
  var safari = /Apple Computer/.test(navigator.vendor);
  var khtml = /KHTML\//.test(navigator.userAgent);
  var mac_geMountainLion = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(navigator.userAgent);
  var phantom = /PhantomJS/.test(navigator.userAgent);

  var ios = /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent);
  // This is woefully incomplete. Suggestions for alternative methods welcome.
  var mobile = ios || /Android|webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(navigator.userAgent);
  var mac = ios || /Mac/.test(navigator.platform);
  var windows = /win/i.test(navigator.platform);

  var presto_version = presto && navigator.userAgent.match(/Version\/(\d*\.\d*)/);
  if (presto_version) presto_version = Number(presto_version[1]);
  if (presto_version && presto_version >= 15) { presto = false; webkit = true; }
  // Some browsers use the wrong event properties to signal cmd/ctrl on OS X
  var flipCtrlCmd = mac && (qtwebkit || presto && (presto_version == null || presto_version < 12.11));
  var captureRightClick = gecko || (ie && !ie_upto8);

  // Optimize some code when these features are not used.
  var sawReadOnlySpans = false, sawCollapsedSpans = false;

  // EDITOR CONSTRUCTOR

  // A CodeMirror instance represents an editor. This is the object
  // that user code is usually dealing with.

  function CodeMirror(place, options) {
    if (!(this instanceof CodeMirror)) return new CodeMirror(place, options);

    this.options = options = options || {};
    // Determine effective options based on given values and defaults.
    copyObj(defaults, options, false);
    setGuttersForLineNumbers(options);

    var doc = options.value;
    if (typeof doc == "string") doc = new Doc(doc, options.mode);
    this.doc = doc;

    var display = this.display = new Display(place, doc);
    display.wrapper.CodeMirror = this;
    updateGutters(this);
    themeChanged(this);
    if (options.lineWrapping)
      this.display.wrapper.className += " CodeMirror-wrap";
    if (options.autofocus && !mobile) focusInput(this);

    this.state = {
      keyMaps: [],  // stores maps added by addKeyMap
      overlays: [], // highlighting overlays, as added by addOverlay
      modeGen: 0,   // bumped when mode/overlay changes, used to invalidate highlighting info
      overwrite: false, focused: false,
      suppressEdits: false, // used to disable editing during key handlers when in readOnly mode
      pasteIncoming: false, cutIncoming: false, // help recognize paste/cut edits in readInput
      draggingText: false,
      highlight: new Delayed() // stores highlight worker timeout
    };

    // Override magic textarea content restore that IE sometimes does
    // on our hidden textarea on reload
    if (ie_upto10) setTimeout(bind(resetInput, this, true), 20);

    registerEventHandlers(this);
    ensureGlobalHandlers();

    var cm = this;
    runInOp(this, function() {
      cm.curOp.forceUpdate = true;
      attachDoc(cm, doc);

      if ((options.autofocus && !mobile) || activeElt() == display.input)
        setTimeout(bind(onFocus, cm), 20);
      else
        onBlur(cm);

      for (var opt in optionHandlers) if (optionHandlers.hasOwnProperty(opt))
        optionHandlers[opt](cm, options[opt], Init);
      for (var i = 0; i < initHooks.length; ++i) initHooks[i](cm);
    });
  }

  // DISPLAY CONSTRUCTOR

  // The display handles the DOM integration, both for input reading
  // and content drawing. It holds references to DOM nodes and
  // display-related state.

  function Display(place, doc) {
    var d = this;

    // The semihidden textarea that is focused when the editor is
    // focused, and receives input.
    var input = d.input = elt("textarea", null, null, "position: absolute; padding: 0; width: 1px; height: 1em; outline: none");
    // The textarea is kept positioned near the cursor to prevent the
    // fact that it'll be scrolled into view on input from scrolling
    // our fake cursor out of view. On webkit, when wrap=off, paste is
    // very slow. So make the area wide instead.
    if (webkit) input.style.width = "1000px";
    else input.setAttribute("wrap", "off");
    // If border: 0; -- iOS fails to open keyboard (issue #1287)
    if (ios) input.style.border = "1px solid black";
    input.setAttribute("autocorrect", "off"); input.setAttribute("autocapitalize", "off"); input.setAttribute("spellcheck", "false");

    // Wraps and hides input textarea
    d.inputDiv = elt("div", [input], null, "overflow: hidden; position: relative; width: 3px; height: 0px;");
    // The fake scrollbar elements.
    d.scrollbarH = elt("div", [elt("div", null, null, "height: 100%; min-height: 1px")], "CodeMirror-hscrollbar");
    d.scrollbarV = elt("div", [elt("div", null, null, "min-width: 1px")], "CodeMirror-vscrollbar");
    // Covers bottom-right square when both scrollbars are present.
    d.scrollbarFiller = elt("div", null, "CodeMirror-scrollbar-filler");
    // Covers bottom of gutter when coverGutterNextToScrollbar is on
    // and h scrollbar is present.
    d.gutterFiller = elt("div", null, "CodeMirror-gutter-filler");
    // Will contain the actual code, positioned to cover the viewport.
    d.lineDiv = elt("div", null, "CodeMirror-code");
    // Elements are added to these to represent selection and cursors.
    d.selectionDiv = elt("div", null, null, "position: relative; z-index: 1");
    d.cursorDiv = elt("div", null, "CodeMirror-cursors");
    // A visibility: hidden element used to find the size of things.
    d.measure = elt("div", null, "CodeMirror-measure");
    // When lines outside of the viewport are measured, they are drawn in this.
    d.lineMeasure = elt("div", null, "CodeMirror-measure");
    // Wraps everything that needs to exist inside the vertically-padded coordinate system
    d.lineSpace = elt("div", [d.measure, d.lineMeasure, d.selectionDiv, d.cursorDiv, d.lineDiv],
                      null, "position: relative; outline: none");
    // Moved around its parent to cover visible view.
    d.mover = elt("div", [elt("div", [d.lineSpace], "CodeMirror-lines")], null, "position: relative");
    // Set to the height of the document, allowing scrolling.
    d.sizer = elt("div", [d.mover], "CodeMirror-sizer");
    // Behavior of elts with overflow: auto and padding is
    // inconsistent across browsers. This is used to ensure the
    // scrollable area is big enough.
    d.heightForcer = elt("div", null, null, "position: absolute; height: " + scrollerCutOff + "px; width: 1px;");
    // Will contain the gutters, if any.
    d.gutters = elt("div", null, "CodeMirror-gutters");
    d.lineGutter = null;
    // Actual scrollable element.
    d.scroller = elt("div", [d.sizer, d.heightForcer, d.gutters], "CodeMirror-scroll");
    d.scroller.setAttribute("tabIndex", "-1");
    // The element in which the editor lives.
    d.wrapper = elt("div", [d.inputDiv, d.scrollbarH, d.scrollbarV,
                            d.scrollbarFiller, d.gutterFiller, d.scroller], "CodeMirror");

    // Work around IE7 z-index bug (not perfect, hence IE7 not really being supported)
    if (ie_upto7) { d.gutters.style.zIndex = -1; d.scroller.style.paddingRight = 0; }
    // Needed to hide big blue blinking cursor on Mobile Safari
    if (ios) input.style.width = "0px";
    if (!webkit) d.scroller.draggable = true;
    // Needed to handle Tab key in KHTML
    if (khtml) { d.inputDiv.style.height = "1px"; d.inputDiv.style.position = "absolute"; }
    // Need to set a minimum width to see the scrollbar on IE7 (but must not set it on IE8).
    if (ie_upto7) d.scrollbarH.style.minHeight = d.scrollbarV.style.minWidth = "18px";

    if (place.appendChild) place.appendChild(d.wrapper);
    else place(d.wrapper);

    // Current rendered range (may be bigger than the view window).
    d.viewFrom = d.viewTo = doc.first;
    // Information about the rendered lines.
    d.view = [];
    // Holds info about a single rendered line when it was rendered
    // for measurement, while not in view.
    d.externalMeasured = null;
    // Empty space (in pixels) above the view
    d.viewOffset = 0;
    d.lastSizeC = 0;
    d.updateLineNumbers = null;

    // Used to only resize the line number gutter when necessary (when
    // the amount of lines crosses a boundary that makes its width change)
    d.lineNumWidth = d.lineNumInnerWidth = d.lineNumChars = null;
    // See readInput and resetInput
    d.prevInput = "";
    // Set to true when a non-horizontal-scrolling line widget is
    // added. As an optimization, line widget aligning is skipped when
    // this is false.
    d.alignWidgets = false;
    // Flag that indicates whether we expect input to appear real soon
    // now (after some event like 'keypress' or 'input') and are
    // polling intensively.
    d.pollingFast = false;
    // Self-resetting timeout for the poller
    d.poll = new Delayed();

    d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null;

    // Tracks when resetInput has punted to just putting a short
    // string into the textarea instead of the full selection.
    d.inaccurateSelection = false;

    // Tracks the maximum line length so that the horizontal scrollbar
    // can be kept static when scrolling.
    d.maxLine = null;
    d.maxLineLength = 0;
    d.maxLineChanged = false;

    // Used for measuring wheel scrolling granularity
    d.wheelDX = d.wheelDY = d.wheelStartX = d.wheelStartY = null;

    // True when shift is held down.
    d.shift = false;

    // Used to track whether anything happened since the context menu
    // was opened.
    d.selForContextMenu = null;
  }

  // STATE UPDATES

  // Used to get the editor into a consistent state again when options change.

  function loadMode(cm) {
    cm.doc.mode = CodeMirror.getMode(cm.options, cm.doc.modeOption);
    resetModeState(cm);
  }

  function resetModeState(cm) {
    cm.doc.iter(function(line) {
      if (line.stateAfter) line.stateAfter = null;
      if (line.styles) line.styles = null;
    });
    cm.doc.frontier = cm.doc.first;
    startWorker(cm, 100);
    cm.state.modeGen++;
    if (cm.curOp) regChange(cm);
  }

  function wrappingChanged(cm) {
    if (cm.options.lineWrapping) {
      addClass(cm.display.wrapper, "CodeMirror-wrap");
      cm.display.sizer.style.minWidth = "";
    } else {
      rmClass(cm.display.wrapper, "CodeMirror-wrap");
      findMaxLine(cm);
    }
    estimateLineHeights(cm);
    regChange(cm);
    clearCaches(cm);
    setTimeout(function(){updateScrollbars(cm);}, 100);
  }

  // Returns a function that estimates the height of a line, to use as
  // first approximation until the line becomes visible (and is thus
  // properly measurable).
  function estimateHeight(cm) {
    var th = textHeight(cm.display), wrapping = cm.options.lineWrapping;
    var perLine = wrapping && Math.max(5, cm.display.scroller.clientWidth / charWidth(cm.display) - 3);
    return function(line) {
      if (lineIsHidden(cm.doc, line)) return 0;

      var widgetsHeight = 0;
      if (line.widgets) for (var i = 0; i < line.widgets.length; i++) {
        if (line.widgets[i].height) widgetsHeight += line.widgets[i].height;
      }

      if (wrapping)
        return widgetsHeight + (Math.ceil(line.text.length / perLine) || 1) * th;
      else
        return widgetsHeight + th;
    };
  }

  function estimateLineHeights(cm) {
    var doc = cm.doc, est = estimateHeight(cm);
    doc.iter(function(line) {
      var estHeight = est(line);
      if (estHeight != line.height) updateLineHeight(line, estHeight);
    });
  }

  function keyMapChanged(cm) {
    var map = keyMap[cm.options.keyMap], style = map.style;
    cm.display.wrapper.className = cm.display.wrapper.className.replace(/\s*cm-keymap-\S+/g, "") +
      (style ? " cm-keymap-" + style : "");
  }

  function themeChanged(cm) {
    cm.display.wrapper.className = cm.display.wrapper.className.replace(/\s*cm-s-\S+/g, "") +
      cm.options.theme.replace(/(^|\s)\s*/g, " cm-s-");
    clearCaches(cm);
  }

  function guttersChanged(cm) {
    updateGutters(cm);
    regChange(cm);
    setTimeout(function(){alignHorizontally(cm);}, 20);
  }

  // Rebuild the gutter elements, ensure the margin to the left of the
  // code matches their width.
  function updateGutters(cm) {
    var gutters = cm.display.gutters, specs = cm.options.gutters;
    removeChildren(gutters);
    for (var i = 0; i < specs.length; ++i) {
      var gutterClass = specs[i];
      var gElt = gutters.appendChild(elt("div", null, "CodeMirror-gutter " + gutterClass));
      if (gutterClass == "CodeMirror-linenumbers") {
        cm.display.lineGutter = gElt;
        gElt.style.width = (cm.display.lineNumWidth || 1) + "px";
      }
    }
    gutters.style.display = i ? "" : "none";
    updateGutterSpace(cm);
  }

  function updateGutterSpace(cm) {
    var width = cm.display.gutters.offsetWidth;
    cm.display.sizer.style.marginLeft = width + "px";
    cm.display.scrollbarH.style.left = cm.options.fixedGutter ? width + "px" : 0;
  }

  // Compute the character length of a line, taking into account
  // collapsed ranges (see markText) that might hide parts, and join
  // other lines onto it.
  function lineLength(line) {
    if (line.height == 0) return 0;
    var len = line.text.length, merged, cur = line;
    while (merged = collapsedSpanAtStart(cur)) {
      var found = merged.find(0, true);
      cur = found.from.line;
      len += found.from.ch - found.to.ch;
    }
    cur = line;
    while (merged = collapsedSpanAtEnd(cur)) {
      var found = merged.find(0, true);
      len -= cur.text.length - found.from.ch;
      cur = found.to.line;
      len += cur.text.length - found.to.ch;
    }
    return len;
  }

  // Find the longest line in the document.
  function findMaxLine(cm) {
    var d = cm.display, doc = cm.doc;
    d.maxLine = getLine(doc, doc.first);
    d.maxLineLength = lineLength(d.maxLine);
    d.maxLineChanged = true;
    doc.iter(function(line) {
      var len = lineLength(line);
      if (len > d.maxLineLength) {
        d.maxLineLength = len;
        d.maxLine = line;
      }
    });
  }

  // Make sure the gutters options contains the element
  // "CodeMirror-linenumbers" when the lineNumbers option is true.
  function setGuttersForLineNumbers(options) {
    var found = indexOf(options.gutters, "CodeMirror-linenumbers");
    if (found == -1 && options.lineNumbers) {
      options.gutters = options.gutters.concat(["CodeMirror-linenumbers"]);
    } else if (found > -1 && !options.lineNumbers) {
      options.gutters = options.gutters.slice(0);
      options.gutters.splice(found, 1);
    }
  }

  // SCROLLBARS

  // Prepare DOM reads needed to update the scrollbars. Done in one
  // shot to minimize update/measure roundtrips.
  function measureForScrollbars(cm) {
    var scroll = cm.display.scroller;
    return {
      clientHeight: scroll.clientHeight,
      barHeight: cm.display.scrollbarV.clientHeight,
      scrollWidth: scroll.scrollWidth, clientWidth: scroll.clientWidth,
      barWidth: cm.display.scrollbarH.clientWidth,
      docHeight: Math.round(cm.doc.height + paddingVert(cm.display))
    };
  }

  // Re-synchronize the fake scrollbars with the actual size of the
  // content.
  function updateScrollbars(cm, measure) {
    if (!measure) measure = measureForScrollbars(cm);
    var d = cm.display;
    var scrollHeight = measure.docHeight + scrollerCutOff;
    var needsH = measure.scrollWidth > measure.clientWidth;
    var needsV = scrollHeight > measure.clientHeight;
    if (needsV) {
      d.scrollbarV.style.display = "block";
      d.scrollbarV.style.bottom = needsH ? scrollbarWidth(d.measure) + "px" : "0";
      // A bug in IE8 can cause this value to be negative, so guard it.
      d.scrollbarV.firstChild.style.height =
        Math.max(0, scrollHeight - measure.clientHeight + (measure.barHeight || d.scrollbarV.clientHeight)) + "px";
    } else {
      d.scrollbarV.style.display = "";
      d.scrollbarV.firstChild.style.height = "0";
    }
    if (needsH) {
      d.scrollbarH.style.display = "block";
      d.scrollbarH.style.right = needsV ? scrollbarWidth(d.measure) + "px" : "0";
      d.scrollbarH.firstChild.style.width =
        (measure.scrollWidth - measure.clientWidth + (measure.barWidth || d.scrollbarH.clientWidth)) + "px";
    } else {
      d.scrollbarH.style.display = "";
      d.scrollbarH.firstChild.style.width = "0";
    }
    if (needsH && needsV) {
      d.scrollbarFiller.style.display = "block";
      d.scrollbarFiller.style.height = d.scrollbarFiller.style.width = scrollbarWidth(d.measure) + "px";
    } else d.scrollbarFiller.style.display = "";
    if (needsH && cm.options.coverGutterNextToScrollbar && cm.options.fixedGutter) {
      d.gutterFiller.style.display = "block";
      d.gutterFiller.style.height = scrollbarWidth(d.measure) + "px";
      d.gutterFiller.style.width = d.gutters.offsetWidth + "px";
    } else d.gutterFiller.style.display = "";

    if (!cm.state.checkedOverlayScrollbar && measure.clientHeight > 0) {
      if (scrollbarWidth(d.measure) === 0) {
        var w = mac && !mac_geMountainLion ? "12px" : "18px";
        d.scrollbarV.style.minWidth = d.scrollbarH.style.minHeight = w;
        var barMouseDown = function(e) {
          if (e_target(e) != d.scrollbarV && e_target(e) != d.scrollbarH)
            operation(cm, onMouseDown)(e);
        };
        on(d.scrollbarV, "mousedown", barMouseDown);
        on(d.scrollbarH, "mousedown", barMouseDown);
      }
      cm.state.checkedOverlayScrollbar = true;
    }
  }

  // Compute the lines that are visible in a given viewport (defaults
  // the the current scroll position). viewPort may contain top,
  // height, and ensure (see op.scrollToPos) properties.
  function visibleLines(display, doc, viewPort) {
    var top = viewPort && viewPort.top != null ? Math.max(0, viewPort.top) : display.scroller.scrollTop;
    top = Math.floor(top - paddingTop(display));
    var bottom = viewPort && viewPort.bottom != null ? viewPort.bottom : top + display.wrapper.clientHeight;

    var from = lineAtHeight(doc, top), to = lineAtHeight(doc, bottom);
    // Ensure is a {from: {line, ch}, to: {line, ch}} object, and
    // forces those lines into the viewport (if possible).
    if (viewPort && viewPort.ensure) {
      var ensureFrom = viewPort.ensure.from.line, ensureTo = viewPort.ensure.to.line;
      if (ensureFrom < from)
        return {from: ensureFrom,
                to: lineAtHeight(doc, heightAtLine(getLine(doc, ensureFrom)) + display.wrapper.clientHeight)};
      if (Math.min(ensureTo, doc.lastLine()) >= to)
        return {from: lineAtHeight(doc, heightAtLine(getLine(doc, ensureTo)) - display.wrapper.clientHeight),
                to: ensureTo};
    }
    return {from: from, to: Math.max(to, from + 1)};
  }

  // LINE NUMBERS

  // Re-align line numbers and gutter marks to compensate for
  // horizontal scrolling.
  function alignHorizontally(cm) {
    var display = cm.display, view = display.view;
    if (!display.alignWidgets && (!display.gutters.firstChild || !cm.options.fixedGutter)) return;
    var comp = compensateForHScroll(display) - display.scroller.scrollLeft + cm.doc.scrollLeft;
    var gutterW = display.gutters.offsetWidth, left = comp + "px";
    for (var i = 0; i < view.length; i++) if (!view[i].hidden) {
      if (cm.options.fixedGutter && view[i].gutter)
        view[i].gutter.style.left = left;
      var align = view[i].alignable;
      if (align) for (var j = 0; j < align.length; j++)
        align[j].style.left = left;
    }
    if (cm.options.fixedGutter)
      display.gutters.style.left = (comp + gutterW) + "px";
  }

  // Used to ensure that the line number gutter is still the right
  // size for the current document size. Returns true when an update
  // is needed.
  function maybeUpdateLineNumberWidth(cm) {
    if (!cm.options.lineNumbers) return false;
    var doc = cm.doc, last = lineNumberFor(cm.options, doc.first + doc.size - 1), display = cm.display;
    if (last.length != display.lineNumChars) {
      var test = display.measure.appendChild(elt("div", [elt("div", last)],
                                                 "CodeMirror-linenumber CodeMirror-gutter-elt"));
      var innerW = test.firstChild.offsetWidth, padding = test.offsetWidth - innerW;
      display.lineGutter.style.width = "";
      display.lineNumInnerWidth = Math.max(innerW, display.lineGutter.offsetWidth - padding);
      display.lineNumWidth = display.lineNumInnerWidth + padding;
      display.lineNumChars = display.lineNumInnerWidth ? last.length : -1;
      display.lineGutter.style.width = display.lineNumWidth + "px";
      updateGutterSpace(cm);
      return true;
    }
    return false;
  }

  function lineNumberFor(options, i) {
    return String(options.lineNumberFormatter(i + options.firstLineNumber));
  }

  // Computes display.scroller.scrollLeft + display.gutters.offsetWidth,
  // but using getBoundingClientRect to get a sub-pixel-accurate
  // result.
  function compensateForHScroll(display) {
    return display.scroller.getBoundingClientRect().left - display.sizer.getBoundingClientRect().left;
  }

  // DISPLAY DRAWING

  // Updates the display, selection, and scrollbars, using the
  // information in display.view to find out which nodes are no longer
  // up-to-date. Tries to bail out early when no changes are needed,
  // unless forced is true.
  // Returns true if an actual update happened, false otherwise.
  function updateDisplay(cm, viewPort, forced) {
    var oldFrom = cm.display.viewFrom, oldTo = cm.display.viewTo, updated;
    var visible = visibleLines(cm.display, cm.doc, viewPort);
    for (var first = true;; first = false) {
      var oldWidth = cm.display.scroller.clientWidth;
      if (!updateDisplayInner(cm, visible, forced)) break;
      updated = true;

      // If the max line changed since it was last measured, measure it,
      // and ensure the document's width matches it.
      if (cm.display.maxLineChanged && !cm.options.lineWrapping)
        adjustContentWidth(cm);

      var barMeasure = measureForScrollbars(cm);
      updateSelection(cm);
      setDocumentHeight(cm, barMeasure);
      updateScrollbars(cm, barMeasure);
      if (webkit && cm.options.lineWrapping)
        checkForWebkitWidthBug(cm, barMeasure); // (Issue #2420)
      if (first && cm.options.lineWrapping && oldWidth != cm.display.scroller.clientWidth) {
        forced = true;
        continue;
      }
      forced = false;

      // Clip forced viewport to actual scrollable area.
      if (viewPort && viewPort.top != null)
        viewPort = {top: Math.min(barMeasure.docHeight - scrollerCutOff - barMeasure.clientHeight, viewPort.top)};
      // Updated line heights might result in the drawn area not
      // actually covering the viewport. Keep looping until it does.
      visible = visibleLines(cm.display, cm.doc, viewPort);
      if (visible.from >= cm.display.viewFrom && visible.to <= cm.display.viewTo)
        break;
    }

    cm.display.updateLineNumbers = null;
    if (updated) {
      signalLater(cm, "update", cm);
      if (cm.display.viewFrom != oldFrom || cm.display.viewTo != oldTo)
        signalLater(cm, "viewportChange", cm, cm.display.viewFrom, cm.display.viewTo);
    }
    return updated;
  }

  // Does the actual updating of the line display. Bails out
  // (returning false) when there is nothing to be done and forced is
  // false.
  function updateDisplayInner(cm, visible, forced) {
    var display = cm.display, doc = cm.doc;
    if (!display.wrapper.offsetWidth) {
      resetView(cm);
      return;
    }

    // Bail out if the visible area is already rendered and nothing changed.
    if (!forced && visible.from >= display.viewFrom && visible.to <= display.viewTo &&
        countDirtyView(cm) == 0)
      return;

    if (maybeUpdateLineNumberWidth(cm))
      resetView(cm);
    var dims = getDimensions(cm);

    // Compute a suitable new viewport (from & to)
    var end = doc.first + doc.size;
    var from = Math.max(visible.from - cm.options.viewportMargin, doc.first);
    var to = Math.min(end, visible.to + cm.options.viewportMargin);
    if (display.viewFrom < from && from - display.viewFrom < 20) from = Math.max(doc.first, display.viewFrom);
    if (display.viewTo > to && display.viewTo - to < 20) to = Math.min(end, display.viewTo);
    if (sawCollapsedSpans) {
      from = visualLineNo(cm.doc, from);
      to = visualLineEndNo(cm.doc, to);
    }

    var different = from != display.viewFrom || to != display.viewTo ||
      display.lastSizeC != display.wrapper.clientHeight;
    adjustView(cm, from, to);

    display.viewOffset = heightAtLine(getLine(cm.doc, display.viewFrom));
    // Position the mover div to align with the current scroll position
    cm.display.mover.style.top = display.viewOffset + "px";

    var toUpdate = countDirtyView(cm);
    if (!different && toUpdate == 0 && !forced) return;

    // For big changes, we hide the enclosing element during the
    // update, since that speeds up the operations on most browsers.
    var focused = activeElt();
    if (toUpdate > 4) display.lineDiv.style.display = "none";
    patchDisplay(cm, display.updateLineNumbers, dims);
    if (toUpdate > 4) display.lineDiv.style.display = "";
    // There might have been a widget with a focused element that got
    // hidden or updated, if so re-focus it.
    if (focused && activeElt() != focused && focused.offsetHeight) focused.focus();

    // Prevent selection and cursors from interfering with the scroll
    // width.
    removeChildren(display.cursorDiv);
    removeChildren(display.selectionDiv);

    if (different) {
      display.lastSizeC = display.wrapper.clientHeight;
      startWorker(cm, 400);
    }

    updateHeightsInViewport(cm);

    return true;
  }

  function adjustContentWidth(cm) {
    var display = cm.display;
    var width = measureChar(cm, display.maxLine, display.maxLine.text.length).left;
    display.maxLineChanged = false;
    var minWidth = Math.max(0, width + 3);
    var maxScrollLeft = Math.max(0, display.sizer.offsetLeft + minWidth + scrollerCutOff - display.scroller.clientWidth);
    display.sizer.style.minWidth = minWidth + "px";
    if (maxScrollLeft < cm.doc.scrollLeft)
      setScrollLeft(cm, Math.min(display.scroller.scrollLeft, maxScrollLeft), true);
  }

  function setDocumentHeight(cm, measure) {
    cm.display.sizer.style.minHeight = cm.display.heightForcer.style.top = measure.docHeight + "px";
    cm.display.gutters.style.height = Math.max(measure.docHeight, measure.clientHeight - scrollerCutOff) + "px";
  }

  function checkForWebkitWidthBug(cm, measure) {
    // Work around Webkit bug where it sometimes reserves space for a
    // non-existing phantom scrollbar in the scroller (Issue #2420)
    if (cm.display.sizer.offsetWidth + cm.display.gutters.offsetWidth < cm.display.scroller.clientWidth - 1) {
      cm.display.sizer.style.minHeight = cm.display.heightForcer.style.top = "0px";
      cm.display.gutters.style.height = measure.docHeight + "px";
    }
  }

  // Read the actual heights of the rendered lines, and update their
  // stored heights to match.
  function updateHeightsInViewport(cm) {
    var display = cm.display;
    var prevBottom = display.lineDiv.offsetTop;
    for (var i = 0; i < display.view.length; i++) {
      var cur = display.view[i], height;
      if (cur.hidden) continue;
      if (ie_upto7) {
        var bot = cur.node.offsetTop + cur.node.offsetHeight;
        height = bot - prevBottom;
        prevBottom = bot;
      } else {
        var box = cur.node.getBoundingClientRect();
        height = box.bottom - box.top;
      }
      var diff = cur.line.height - height;
      if (height < 2) height = textHeight(display);
      if (diff > .001 || diff < -.001) {
        updateLineHeight(cur.line, height);
        updateWidgetHeight(cur.line);
        if (cur.rest) for (var j = 0; j < cur.rest.length; j++)
          updateWidgetHeight(cur.rest[j]);
      }
    }
  }

  // Read and store the height of line widgets associated with the
  // given line.
  function updateWidgetHeight(line) {
    if (line.widgets) for (var i = 0; i < line.widgets.length; ++i)
      line.widgets[i].height = line.widgets[i].node.offsetHeight;
  }

  // Do a bulk-read of the DOM positions and sizes needed to draw the
  // view, so that we don't interleave reading and writing to the DOM.
  function getDimensions(cm) {
    var d = cm.display, left = {}, width = {};
    for (var n = d.gutters.firstChild, i = 0; n; n = n.nextSibling, ++i) {
      left[cm.options.gutters[i]] = n.offsetLeft;
      width[cm.options.gutters[i]] = n.offsetWidth;
    }
    return {fixedPos: compensateForHScroll(d),
            gutterTotalWidth: d.gutters.offsetWidth,
            gutterLeft: left,
            gutterWidth: width,
            wrapperWidth: d.wrapper.clientWidth};
  }

  // Sync the actual display DOM structure with display.view, removing
  // nodes for lines that are no longer in view, and creating the ones
  // that are not there yet, and updating the ones that are out of
  // date.
  function patchDisplay(cm, updateNumbersFrom, dims) {
    var display = cm.display, lineNumbers = cm.options.lineNumbers;
    var container = display.lineDiv, cur = container.firstChild;

    function rm(node) {
      var next = node.nextSibling;
      // Works around a throw-scroll bug in OS X Webkit
      if (webkit && mac && cm.display.currentWheelTarget == node)
        node.style.display = "none";
      else
        node.parentNode.removeChild(node);
      return next;
    }

    var view = display.view, lineN = display.viewFrom;
    // Loop over the elements in the view, syncing cur (the DOM nodes
    // in display.lineDiv) with the view as we go.
    for (var i = 0; i < view.length; i++) {
      var lineView = view[i];
      if (lineView.hidden) {
      } else if (!lineView.node) { // Not drawn yet
        var node = buildLineElement(cm, lineView, lineN, dims);
        container.insertBefore(node, cur);
      } else { // Already drawn
        while (cur != lineView.node) cur = rm(cur);
        var updateNumber = lineNumbers && updateNumbersFrom != null &&
          updateNumbersFrom <= lineN && lineView.lineNumber;
        if (lineView.changes) {
          if (indexOf(lineView.changes, "gutter") > -1) updateNumber = false;
          updateLineForChanges(cm, lineView, lineN, dims);
        }
        if (updateNumber) {
          removeChildren(lineView.lineNumber);
          lineView.lineNumber.appendChild(document.createTextNode(lineNumberFor(cm.options, lineN)));
        }
        cur = lineView.node.nextSibling;
      }
      lineN += lineView.size;
    }
    while (cur) cur = rm(cur);
  }

  // When an aspect of a line changes, a string is added to
  // lineView.changes. This updates the relevant part of the line's
  // DOM structure.
  function updateLineForChanges(cm, lineView, lineN, dims) {
    for (var j = 0; j < lineView.changes.length; j++) {
      var type = lineView.changes[j];
      if (type == "text") updateLineText(cm, lineView);
      else if (type == "gutter") updateLineGutter(cm, lineView, lineN, dims);
      else if (type == "class") updateLineClasses(lineView);
      else if (type == "widget") updateLineWidgets(lineView, dims);
    }
    lineView.changes = null;
  }

  // Lines with gutter elements, widgets or a background class need to
  // be wrapped, and have the extra elements added to the wrapper div
  function ensureLineWrapped(lineView) {
    if (lineView.node == lineView.text) {
      lineView.node = elt("div", null, null, "position: relative");
      if (lineView.text.parentNode)
        lineView.text.parentNode.replaceChild(lineView.node, lineView.text);
      lineView.node.appendChild(lineView.text);
      if (ie_upto7) lineView.node.style.zIndex = 2;
    }
    return lineView.node;
  }

  function updateLineBackground(lineView) {
    var cls = lineView.bgClass ? lineView.bgClass + " " + (lineView.line.bgClass || "") : lineView.line.bgClass;
    if (cls) cls += " CodeMirror-linebackground";
    if (lineView.background) {
      if (cls) lineView.background.className = cls;
      else { lineView.background.parentNode.removeChild(lineView.background); lineView.background = null; }
    } else if (cls) {
      var wrap = ensureLineWrapped(lineView);
      lineView.background = wrap.insertBefore(elt("div", null, cls), wrap.firstChild);
    }
  }

  // Wrapper around buildLineContent which will reuse the structure
  // in display.externalMeasured when possible.
  function getLineContent(cm, lineView) {
    var ext = cm.display.externalMeasured;
    if (ext && ext.line == lineView.line) {
      cm.display.externalMeasured = null;
      lineView.measure = ext.measure;
      return ext.built;
    }
    return buildLineContent(cm, lineView);
  }

  // Redraw the line's text. Interacts with the background and text
  // classes because the mode may output tokens that influence these
  // classes.
  function updateLineText(cm, lineView) {
    var cls = lineView.text.className;
    var built = getLineContent(cm, lineView);
    if (lineView.text == lineView.node) lineView.node = built.pre;
    lineView.text.parentNode.replaceChild(built.pre, lineView.text);
    lineView.text = built.pre;
    if (built.bgClass != lineView.bgClass || built.textClass != lineView.textClass) {
      lineView.bgClass = built.bgClass;
      lineView.textClass = built.textClass;
      updateLineClasses(lineView);
    } else if (cls) {
      lineView.text.className = cls;
    }
  }

  function updateLineClasses(lineView) {
    updateLineBackground(lineView);
    if (lineView.line.wrapClass)
      ensureLineWrapped(lineView).className = lineView.line.wrapClass;
    else if (lineView.node != lineView.text)
      lineView.node.className = "";
    var textClass = lineView.textClass ? lineView.textClass + " " + (lineView.line.textClass || "") : lineView.line.textClass;
    lineView.text.className = textClass || "";
  }

  function updateLineGutter(cm, lineView, lineN, dims) {
    if (lineView.gutter) {
      lineView.node.removeChild(lineView.gutter);
      lineView.gutter = null;
    }
    var markers = lineView.line.gutterMarkers;
    if (cm.options.lineNumbers || markers) {
      var wrap = ensureLineWrapped(lineView);
      var gutterWrap = lineView.gutter =
        wrap.insertBefore(elt("div", null, "CodeMirror-gutter-wrapper", "position: absolute; left: " +
                              (cm.options.fixedGutter ? dims.fixedPos : -dims.gutterTotalWidth) + "px"),
                          lineView.text);
      if (cm.options.lineNumbers && (!markers || !markers["CodeMirror-linenumbers"]))
        lineView.lineNumber = gutterWrap.appendChild(
          elt("div", lineNumberFor(cm.options, lineN),
              "CodeMirror-linenumber CodeMirror-gutter-elt",
              "left: " + dims.gutterLeft["CodeMirror-linenumbers"] + "px; width: "
              + cm.display.lineNumInnerWidth + "px"));
      if (markers) for (var k = 0; k < cm.options.gutters.length; ++k) {
        var id = cm.options.gutters[k], found = markers.hasOwnProperty(id) && markers[id];
        if (found)
          gutterWrap.appendChild(elt("div", [found], "CodeMirror-gutter-elt", "left: " +
                                     dims.gutterLeft[id] + "px; width: " + dims.gutterWidth[id] + "px"));
      }
    }
  }

  function updateLineWidgets(lineView, dims) {
    if (lineView.alignable) lineView.alignable = null;
    for (var node = lineView.node.firstChild, next; node; node = next) {
      var next = node.nextSibling;
      if (node.className == "CodeMirror-linewidget")
        lineView.node.removeChild(node);
    }
    insertLineWidgets(lineView, dims);
  }

  // Build a line's DOM representation from scratch
  function buildLineElement(cm, lineView, lineN, dims) {
    var built = getLineContent(cm, lineView);
    lineView.text = lineView.node = built.pre;
    if (built.bgClass) lineView.bgClass = built.bgClass;
    if (built.textClass) lineView.textClass = built.textClass;

    updateLineClasses(lineView);
    updateLineGutter(cm, lineView, lineN, dims);
    insertLineWidgets(lineView, dims);
    return lineView.node;
  }

  // A lineView may contain multiple logical lines (when merged by
  // collapsed spans). The widgets for all of them need to be drawn.
  function insertLineWidgets(lineView, dims) {
    insertLineWidgetsFor(lineView.line, lineView, dims, true);
    if (lineView.rest) for (var i = 0; i < lineView.rest.length; i++)
      insertLineWidgetsFor(lineView.rest[i], lineView, dims, false);
  }

  function insertLineWidgetsFor(line, lineView, dims, allowAbove) {
    if (!line.widgets) return;
    var wrap = ensureLineWrapped(lineView);
    for (var i = 0, ws = line.widgets; i < ws.length; ++i) {
      var widget = ws[i], node = elt("div", [widget.node], "CodeMirror-linewidget");
      if (!widget.handleMouseEvents) node.ignoreEvents = true;
      positionLineWidget(widget, node, lineView, dims);
      if (allowAbove && widget.above)
        wrap.insertBefore(node, lineView.gutter || lineView.text);
      else
        wrap.appendChild(node);
      signalLater(widget, "redraw");
    }
  }

  function positionLineWidget(widget, node, lineView, dims) {
    if (widget.noHScroll) {
      (lineView.alignable || (lineView.alignable = [])).push(node);
      var width = dims.wrapperWidth;
      node.style.left = dims.fixedPos + "px";
      if (!widget.coverGutter) {
        width -= dims.gutterTotalWidth;
        node.style.paddingLeft = dims.gutterTotalWidth + "px";
      }
      node.style.width = width + "px";
    }
    if (widget.coverGutter) {
      node.style.zIndex = 5;
      node.style.position = "relative";
      if (!widget.noHScroll) node.style.marginLeft = -dims.gutterTotalWidth + "px";
    }
  }

  // POSITION OBJECT

  // A Pos instance represents a position within the text.
  var Pos = CodeMirror.Pos = function(line, ch) {
    if (!(this instanceof Pos)) return new Pos(line, ch);
    this.line = line; this.ch = ch;
  };

  // Compare two positions, return 0 if they are the same, a negative
  // number when a is less, and a positive number otherwise.
  var cmp = CodeMirror.cmpPos = function(a, b) { return a.line - b.line || a.ch - b.ch; };

  function copyPos(x) {return Pos(x.line, x.ch);}
  function maxPos(a, b) { return cmp(a, b) < 0 ? b : a; }
  function minPos(a, b) { return cmp(a, b) < 0 ? a : b; }

  // SELECTION / CURSOR

  // Selection objects are immutable. A new one is created every time
  // the selection changes. A selection is one or more non-overlapping
  // (and non-touching) ranges, sorted, and an integer that indicates
  // which one is the primary selection (the one that's scrolled into
  // view, that getCursor returns, etc).
  function Selection(ranges, primIndex) {
    this.ranges = ranges;
    this.primIndex = primIndex;
  }

  Selection.prototype = {
    primary: function() { return this.ranges[this.primIndex]; },
    equals: function(other) {
      if (other == this) return true;
      if (other.primIndex != this.primIndex || other.ranges.length != this.ranges.length) return false;
      for (var i = 0; i < this.ranges.length; i++) {
        var here = this.ranges[i], there = other.ranges[i];
        if (cmp(here.anchor, there.anchor) != 0 || cmp(here.head, there.head) != 0) return false;
      }
      return true;
    },
    deepCopy: function() {
      for (var out = [], i = 0; i < this.ranges.length; i++)
        out[i] = new Range(copyPos(this.ranges[i].anchor), copyPos(this.ranges[i].head));
      return new Selection(out, this.primIndex);
    },
    somethingSelected: function() {
      for (var i = 0; i < this.ranges.length; i++)
        if (!this.ranges[i].empty()) return true;
      return false;
    },
    contains: function(pos, end) {
      if (!end) end = pos;
      for (var i = 0; i < this.ranges.length; i++) {
        var range = this.ranges[i];
        if (cmp(end, range.from()) >= 0 && cmp(pos, range.to()) <= 0)
          return i;
      }
      return -1;
    }
  };

  function Range(anchor, head) {
    this.anchor = anchor; this.head = head;
  }

  Range.prototype = {
    from: function() { return minPos(this.anchor, this.head); },
    to: function() { return maxPos(this.anchor, this.head); },
    empty: function() {
      return this.head.line == this.anchor.line && this.head.ch == this.anchor.ch;
    }
  };

  // Take an unsorted, potentially overlapping set of ranges, and
  // build a selection out of it. 'Consumes' ranges array (modifying
  // it).
  function normalizeSelection(ranges, primIndex) {
    var prim = ranges[primIndex];
    ranges.sort(function(a, b) { return cmp(a.from(), b.from()); });
    primIndex = indexOf(ranges, prim);
    for (var i = 1; i < ranges.length; i++) {
      var cur = ranges[i], prev = ranges[i - 1];
      if (cmp(prev.to(), cur.from()) >= 0) {
        var from = minPos(prev.from(), cur.from()), to = maxPos(prev.to(), cur.to());
        var inv = prev.empty() ? cur.from() == cur.head : prev.from() == prev.head;
        if (i <= primIndex) --primIndex;
        ranges.splice(--i, 2, new Range(inv ? to : from, inv ? from : to));
      }
    }
    return new Selection(ranges, primIndex);
  }

  function simpleSelection(anchor, head) {
    return new Selection([new Range(anchor, head || anchor)], 0);
  }

  // Most of the external API clips given positions to make sure they
  // actually exist within the document.
  function clipLine(doc, n) {return Math.max(doc.first, Math.min(n, doc.first + doc.size - 1));}
  function clipPos(doc, pos) {
    if (pos.line < doc.first) return Pos(doc.first, 0);
    var last = doc.first + doc.size - 1;
    if (pos.line > last) return Pos(last, getLine(doc, last).text.length);
    return clipToLen(pos, getLine(doc, pos.line).text.length);
  }
  function clipToLen(pos, linelen) {
    var ch = pos.ch;
    if (ch == null || ch > linelen) return Pos(pos.line, linelen);
    else if (ch < 0) return Pos(pos.line, 0);
    else return pos;
  }
  function isLine(doc, l) {return l >= doc.first && l < doc.first + doc.size;}
  function clipPosArray(doc, array) {
    for (var out = [], i = 0; i < array.length; i++) out[i] = clipPos(doc, array[i]);
    return out;
  }

  // SELECTION UPDATES

  // The 'scroll' parameter given to many of these indicated whether
  // the new cursor position should be scrolled into view after
  // modifying the selection.

  // If shift is held or the extend flag is set, extends a range to
  // include a given position (and optionally a second position).
  // Otherwise, simply returns the range between the given positions.
  // Used for cursor motion and such.
  function extendRange(doc, range, head, other) {
    if (doc.cm && doc.cm.display.shift || doc.extend) {
      var anchor = range.anchor;
      if (other) {
        var posBefore = cmp(head, anchor) < 0;
        if (posBefore != (cmp(other, anchor) < 0)) {
          anchor = head;
          head = other;
        } else if (posBefore != (cmp(head, other) < 0)) {
          head = other;
        }
      }
      return new Range(anchor, head);
    } else {
      return new Range(other || head, head);
    }
  }

  // Extend the primary selection range, discard the rest.
  function extendSelection(doc, head, other, options) {
    setSelection(doc, new Selection([extendRange(doc, doc.sel.primary(), head, other)], 0), options);
  }

  // Extend all selections (pos is an array of selections with length
  // equal the number of selections)
  function extendSelections(doc, heads, options) {
    for (var out = [], i = 0; i < doc.sel.ranges.length; i++)
      out[i] = extendRange(doc, doc.sel.ranges[i], heads[i], null);
    var newSel = normalizeSelection(out, doc.sel.primIndex);
    setSelection(doc, newSel, options);
  }

  // Updates a single range in the selection.
  function replaceOneSelection(doc, i, range, options) {
    var ranges = doc.sel.ranges.slice(0);
    ranges[i] = range;
    setSelection(doc, normalizeSelection(ranges, doc.sel.primIndex), options);
  }

  // Reset the selection to a single range.
  function setSimpleSelection(doc, anchor, head, options) {
    setSelection(doc, simpleSelection(anchor, head), options);
  }

  // Give beforeSelectionChange handlers a change to influence a
  // selection update.
  function filterSelectionChange(doc, sel) {
    var obj = {
      ranges: sel.ranges,
      update: function(ranges) {
        this.ranges = [];
        for (var i = 0; i < ranges.length; i++)
          this.ranges[i] = new Range(clipPos(doc, ranges[i].anchor),
                                     clipPos(doc, ranges[i].head));
      }
    };
    signal(doc, "beforeSelectionChange", doc, obj);
    if (doc.cm) signal(doc.cm, "beforeSelectionChange", doc.cm, obj);
    if (obj.ranges != sel.ranges) return normalizeSelection(obj.ranges, obj.ranges.length - 1);
    else return sel;
  }

  function setSelectionReplaceHistory(doc, sel, options) {
    var done = doc.history.done, last = lst(done);
    if (last && last.ranges) {
      done[done.length - 1] = sel;
      setSelectionNoUndo(doc, sel, options);
    } else {
      setSelection(doc, sel, options);
    }
  }

  // Set a new selection.
  function setSelection(doc, sel, options) {
    setSelectionNoUndo(doc, sel, options);
    addSelectionToHistory(doc, doc.sel, doc.cm ? doc.cm.curOp.id : NaN, options);
  }

  function setSelectionNoUndo(doc, sel, options) {
    if (hasHandler(doc, "beforeSelectionChange") || doc.cm && hasHandler(doc.cm, "beforeSelectionChange"))
      sel = filterSelectionChange(doc, sel);

    var bias = options && options.bias ||
      (cmp(sel.primary().head, doc.sel.primary().head) < 0 ? -1 : 1);
    setSelectionInner(doc, skipAtomicInSelection(doc, sel, bias, true));

    if (!(options && options.scroll === false) && doc.cm)
      ensureCursorVisible(doc.cm);
  }

  function setSelectionInner(doc, sel) {
    if (sel.equals(doc.sel)) return;

    doc.sel = sel;

    if (doc.cm) {
      doc.cm.curOp.updateInput = doc.cm.curOp.selectionChanged = true;
      signalCursorActivity(doc.cm);
    }
    signalLater(doc, "cursorActivity", doc);
  }

  // Verify that the selection does not partially select any atomic
  // marked ranges.
  function reCheckSelection(doc) {
    setSelectionInner(doc, skipAtomicInSelection(doc, doc.sel, null, false), sel_dontScroll);
  }

  // Return a selection that does not partially select any atomic
  // ranges.
  function skipAtomicInSelection(doc, sel, bias, mayClear) {
    var out;
    for (var i = 0; i < sel.ranges.length; i++) {
      var range = sel.ranges[i];
      var newAnchor = skipAtomic(doc, range.anchor, bias, mayClear);
      var newHead = skipAtomic(doc, range.head, bias, mayClear);
      if (out || newAnchor != range.anchor || newHead != range.head) {
        if (!out) out = sel.ranges.slice(0, i);
        out[i] = new Range(newAnchor, newHead);
      }
    }
    return out ? normalizeSelection(out, sel.primIndex) : sel;
  }

  // Ensure a given position is not inside an atomic range.
  function skipAtomic(doc, pos, bias, mayClear) {
    var flipped = false, curPos = pos;
    var dir = bias || 1;
    doc.cantEdit = false;
    search: for (;;) {
      var line = getLine(doc, curPos.line);
      if (line.markedSpans) {
        for (var i = 0; i < line.markedSpans.length; ++i) {
          var sp = line.markedSpans[i], m = sp.marker;
          if ((sp.from == null || (m.inclusiveLeft ? sp.from <= curPos.ch : sp.from < curPos.ch)) &&
              (sp.to == null || (m.inclusiveRight ? sp.to >= curPos.ch : sp.to > curPos.ch))) {
            if (mayClear) {
              signal(m, "beforeCursorEnter");
              if (m.explicitlyCleared) {
                if (!line.markedSpans) break;
                else {--i; continue;}
              }
            }
            if (!m.atomic) continue;
            var newPos = m.find(dir < 0 ? -1 : 1);
            if (cmp(newPos, curPos) == 0) {
              newPos.ch += dir;
              if (newPos.ch < 0) {
                if (newPos.line > doc.first) newPos = clipPos(doc, Pos(newPos.line - 1));
                else newPos = null;
              } else if (newPos.ch > line.text.length) {
                if (newPos.line < doc.first + doc.size - 1) newPos = Pos(newPos.line + 1, 0);
                else newPos = null;
              }
              if (!newPos) {
                if (flipped) {
                  // Driven in a corner -- no valid cursor position found at all
                  // -- try again *with* clearing, if we didn't already
                  if (!mayClear) return skipAtomic(doc, pos, bias, true);
                  // Otherwise, turn off editing until further notice, and return the start of the doc
                  doc.cantEdit = true;
                  return Pos(doc.first, 0);
                }
                flipped = true; newPos = pos; dir = -dir;
              }
            }
            curPos = newPos;
            continue search;
          }
        }
      }
      return curPos;
    }
  }

  // SELECTION DRAWING

  // Redraw the selection and/or cursor
  function updateSelection(cm) {
    var display = cm.display, doc = cm.doc;
    var curFragment = document.createDocumentFragment();
    var selFragment = document.createDocumentFragment();

    for (var i = 0; i < doc.sel.ranges.length; i++) {
      var range = doc.sel.ranges[i];
      var collapsed = range.empty();
      if (collapsed || cm.options.showCursorWhenSelecting)
        drawSelectionCursor(cm, range, curFragment);
      if (!collapsed)
        drawSelectionRange(cm, range, selFragment);
    }

    // Move the hidden textarea near the cursor to prevent scrolling artifacts
    if (cm.options.moveInputWithCursor) {
      var headPos = cursorCoords(cm, doc.sel.primary().head, "div");
      var wrapOff = display.wrapper.getBoundingClientRect(), lineOff = display.lineDiv.getBoundingClientRect();
      var top = Math.max(0, Math.min(display.wrapper.clientHeight - 10,
                                     headPos.top + lineOff.top - wrapOff.top));
      var left = Math.max(0, Math.min(display.wrapper.clientWidth - 10,
                                      headPos.left + lineOff.left - wrapOff.left));
      display.inputDiv.style.top = top + "px";
      display.inputDiv.style.left = left + "px";
    }

    removeChildrenAndAdd(display.cursorDiv, curFragment);
    removeChildrenAndAdd(display.selectionDiv, selFragment);
  }

  // Draws a cursor for the given range
  function drawSelectionCursor(cm, range, output) {
    var pos = cursorCoords(cm, range.head, "div");

    var cursor = output.appendChild(elt("div", "\u00a0", "CodeMirror-cursor"));
    cursor.style.left = pos.left + "px";
    cursor.style.top = pos.top + "px";
    cursor.style.height = Math.max(0, pos.bottom - pos.top) * cm.options.cursorHeight + "px";

    if (pos.other) {
      // Secondary cursor, shown when on a 'jump' in bi-directional text
      var otherCursor = output.appendChild(elt("div", "\u00a0", "CodeMirror-cursor CodeMirror-secondarycursor"));
      otherCursor.style.display = "";
      otherCursor.style.left = pos.other.left + "px";
      otherCursor.style.top = pos.other.top + "px";
      otherCursor.style.height = (pos.other.bottom - pos.other.top) * .85 + "px";
    }
  }

  // Draws the given range as a highlighted selection
  function drawSelectionRange(cm, range, output) {
    var display = cm.display, doc = cm.doc;
    var fragment = document.createDocumentFragment();
    var padding = paddingH(cm.display), leftSide = padding.left, rightSide = display.lineSpace.offsetWidth - padding.right;

    function add(left, top, width, bottom) {
      if (top < 0) top = 0;
      top = Math.round(top);
      bottom = Math.round(bottom);
      fragment.appendChild(elt("div", null, "CodeMirror-selected", "position: absolute; left: " + left +
                               "px; top: " + top + "px; width: " + (width == null ? rightSide - left : width) +
                               "px; height: " + (bottom - top) + "px"));
    }

    function drawForLine(line, fromArg, toArg) {
      var lineObj = getLine(doc, line);
      var lineLen = lineObj.text.length;
      var start, end;
      function coords(ch, bias) {
        return charCoords(cm, Pos(line, ch), "div", lineObj, bias);
      }

      iterateBidiSections(getOrder(lineObj), fromArg || 0, toArg == null ? lineLen : toArg, function(from, to, dir) {
        var leftPos = coords(from, "left"), rightPos, left, right;
        if (from == to) {
          rightPos = leftPos;
          left = right = leftPos.left;
        } else {
          rightPos = coords(to - 1, "right");
          if (dir == "rtl") { var tmp = leftPos; leftPos = rightPos; rightPos = tmp; }
          left = leftPos.left;
          right = rightPos.right;
        }
        if (fromArg == null && from == 0) left = leftSide;
        if (rightPos.top - leftPos.top > 3) { // Different lines, draw top part
          add(left, leftPos.top, null, leftPos.bottom);
          left = leftSide;
          if (leftPos.bottom < rightPos.top) add(left, leftPos.bottom, null, rightPos.top);
        }
        if (toArg == null && to == lineLen) right = rightSide;
        if (!start || leftPos.top < start.top || leftPos.top == start.top && leftPos.left < start.left)
          start = leftPos;
        if (!end || rightPos.bottom > end.bottom || rightPos.bottom == end.bottom && rightPos.right > end.right)
          end = rightPos;
        if (left < leftSide + 1) left = leftSide;
        add(left, rightPos.top, right - left, rightPos.bottom);
      });
      return {start: start, end: end};
    }

    var sFrom = range.from(), sTo = range.to();
    if (sFrom.line == sTo.line) {
      drawForLine(sFrom.line, sFrom.ch, sTo.ch);
    } else {
      var fromLine = getLine(doc, sFrom.line), toLine = getLine(doc, sTo.line);
      var singleVLine = visualLine(fromLine) == visualLine(toLine);
      var leftEnd = drawForLine(sFrom.line, sFrom.ch, singleVLine ? fromLine.text.length + 1 : null).end;
      var rightStart = drawForLine(sTo.line, singleVLine ? 0 : null, sTo.ch).start;
      if (singleVLine) {
        if (leftEnd.top < rightStart.top - 2) {
          add(leftEnd.right, leftEnd.top, null, leftEnd.bottom);
          add(leftSide, rightStart.top, rightStart.left, rightStart.bottom);
        } else {
          add(leftEnd.right, leftEnd.top, rightStart.left - leftEnd.right, leftEnd.bottom);
        }
      }
      if (leftEnd.bottom < rightStart.top)
        add(leftSide, leftEnd.bottom, null, rightStart.top);
    }

    output.appendChild(fragment);
  }

  // Cursor-blinking
  function restartBlink(cm) {
    if (!cm.state.focused) return;
    var display = cm.display;
    clearInterval(display.blinker);
    var on = true;
    display.cursorDiv.style.visibility = "";
    if (cm.options.cursorBlinkRate > 0)
      display.blinker = setInterval(function() {
        display.cursorDiv.style.visibility = (on = !on) ? "" : "hidden";
      }, cm.options.cursorBlinkRate);
  }

  // HIGHLIGHT WORKER

  function startWorker(cm, time) {
    if (cm.doc.mode.startState && cm.doc.frontier < cm.display.viewTo)
      cm.state.highlight.set(time, bind(highlightWorker, cm));
  }

  function highlightWorker(cm) {
    var doc = cm.doc;
    if (doc.frontier < doc.first) doc.frontier = doc.first;
    if (doc.frontier >= cm.display.viewTo) return;
    var end = +new Date + cm.options.workTime;
    var state = copyState(doc.mode, getStateBefore(cm, doc.frontier));

    runInOp(cm, function() {
    doc.iter(doc.frontier, Math.min(doc.first + doc.size, cm.display.viewTo + 500), function(line) {
      if (doc.frontier >= cm.display.viewFrom) { // Visible
        var oldStyles = line.styles;
        var highlighted = highlightLine(cm, line, state, true);
        line.styles = highlighted.styles;
        if (highlighted.classes) line.styleClasses = highlighted.classes;
        else if (line.styleClasses) line.styleClasses = null;
        var ischange = !oldStyles || oldStyles.length != line.styles.length;
        for (var i = 0; !ischange && i < oldStyles.length; ++i) ischange = oldStyles[i] != line.styles[i];
        if (ischange) regLineChange(cm, doc.frontier, "text");
        line.stateAfter = copyState(doc.mode, state);
      } else {
        processLine(cm, line.text, state);
        line.stateAfter = doc.frontier % 5 == 0 ? copyState(doc.mode, state) : null;
      }
      ++doc.frontier;
      if (+new Date > end) {
        startWorker(cm, cm.options.workDelay);
        return true;
      }
    });
    });
  }

  // Finds the line to start with when starting a parse. Tries to
  // find a line with a stateAfter, so that it can start with a
  // valid state. If that fails, it returns the line with the
  // smallest indentation, which tends to need the least context to
  // parse correctly.
  function findStartLine(cm, n, precise) {
    var minindent, minline, doc = cm.doc;
    var lim = precise ? -1 : n - (cm.doc.mode.innerMode ? 1000 : 100);
    for (var search = n; search > lim; --search) {
      if (search <= doc.first) return doc.first;
      var line = getLine(doc, search - 1);
      if (line.stateAfter && (!precise || search <= doc.frontier)) return search;
      var indented = countColumn(line.text, null, cm.options.tabSize);
      if (minline == null || minindent > indented) {
        minline = search - 1;
        minindent = indented;
      }
    }
    return minline;
  }

  function getStateBefore(cm, n, precise) {
    var doc = cm.doc, display = cm.display;
    if (!doc.mode.startState) return true;
    var pos = findStartLine(cm, n, precise), state = pos > doc.first && getLine(doc, pos-1).stateAfter;
    if (!state) state = startState(doc.mode);
    else state = copyState(doc.mode, state);
    doc.iter(pos, n, function(line) {
      processLine(cm, line.text, state);
      var save = pos == n - 1 || pos % 5 == 0 || pos >= display.viewFrom && pos < display.viewTo;
      line.stateAfter = save ? copyState(doc.mode, state) : null;
      ++pos;
    });
    if (precise) doc.frontier = pos;
    return state;
  }

  // POSITION MEASUREMENT

  function paddingTop(display) {return display.lineSpace.offsetTop;}
  function paddingVert(display) {return display.mover.offsetHeight - display.lineSpace.offsetHeight;}
  function paddingH(display) {
    if (display.cachedPaddingH) return display.cachedPaddingH;
    var e = removeChildrenAndAdd(display.measure, elt("pre", "x"));
    var style = window.getComputedStyle ? window.getComputedStyle(e) : e.currentStyle;
    var data = {left: parseInt(style.paddingLeft), right: parseInt(style.paddingRight)};
    if (!isNaN(data.left) && !isNaN(data.right)) display.cachedPaddingH = data;
    return data;
  }

  // Ensure the lineView.wrapping.heights array is populated. This is
  // an array of bottom offsets for the lines that make up a drawn
  // line. When lineWrapping is on, there might be more than one
  // height.
  function ensureLineHeights(cm, lineView, rect) {
    var wrapping = cm.options.lineWrapping;
    var curWidth = wrapping && cm.display.scroller.clientWidth;
    if (!lineView.measure.heights || wrapping && lineView.measure.width != curWidth) {
      var heights = lineView.measure.heights = [];
      if (wrapping) {
        lineView.measure.width = curWidth;
        var rects = lineView.text.firstChild.getClientRects();
        for (var i = 0; i < rects.length - 1; i++) {
          var cur = rects[i], next = rects[i + 1];
          if (Math.abs(cur.bottom - next.bottom) > 2)
            heights.push((cur.bottom + next.top) / 2 - rect.top);
        }
      }
      heights.push(rect.bottom - rect.top);
    }
  }

  // Find a line map (mapping character offsets to text nodes) and a
  // measurement cache for the given line number. (A line view might
  // contain multiple lines when collapsed ranges are present.)
  function mapFromLineView(lineView, line, lineN) {
    if (lineView.line == line)
      return {map: lineView.measure.map, cache: lineView.measure.cache};
    for (var i = 0; i < lineView.rest.length; i++)
      if (lineView.rest[i] == line)
        return {map: lineView.measure.maps[i], cache: lineView.measure.caches[i]};
    for (var i = 0; i < lineView.rest.length; i++)
      if (lineNo(lineView.rest[i]) > lineN)
        return {map: lineView.measure.maps[i], cache: lineView.measure.caches[i], before: true};
  }

  // Render a line into the hidden node display.externalMeasured. Used
  // when measurement is needed for a line that's not in the viewport.
  function updateExternalMeasurement(cm, line) {
    line = visualLine(line);
    var lineN = lineNo(line);
    var view = cm.display.externalMeasured = new LineView(cm.doc, line, lineN);
    view.lineN = lineN;
    var built = view.built = buildLineContent(cm, view);
    view.text = built.pre;
    removeChildrenAndAdd(cm.display.lineMeasure, built.pre);
    return view;
  }

  // Get a {top, bottom, left, right} box (in line-local coordinates)
  // for a given character.
  function measureChar(cm, line, ch, bias) {
    return measureCharPrepared(cm, prepareMeasureForLine(cm, line), ch, bias);
  }

  // Find a line view that corresponds to the given line number.
  function findViewForLine(cm, lineN) {
    if (lineN >= cm.display.viewFrom && lineN < cm.display.viewTo)
      return cm.display.view[findViewIndex(cm, lineN)];
    var ext = cm.display.externalMeasured;
    if (ext && lineN >= ext.lineN && lineN < ext.lineN + ext.size)
      return ext;
  }

  // Measurement can be split in two steps, the set-up work that
  // applies to the whole line, and the measurement of the actual
  // character. Functions like coordsChar, that need to do a lot of
  // measurements in a row, can thus ensure that the set-up work is
  // only done once.
  function prepareMeasureForLine(cm, line) {
    var lineN = lineNo(line);
    var view = findViewForLine(cm, lineN);
    if (view && !view.text)
      view = null;
    else if (view && view.changes)
      updateLineForChanges(cm, view, lineN, getDimensions(cm));
    if (!view)
      view = updateExternalMeasurement(cm, line);

    var info = mapFromLineView(view, line, lineN);
    return {
      line: line, view: view, rect: null,
      map: info.map, cache: info.cache, before: info.before,
      hasHeights: false
    };
  }

  // Given a prepared measurement object, measures the position of an
  // actual character (or fetches it from the cache).
  function measureCharPrepared(cm, prepared, ch, bias) {
    if (prepared.before) ch = -1;
    var key = ch + (bias || ""), found;
    if (prepared.cache.hasOwnProperty(key)) {
      found = prepared.cache[key];
    } else {
      if (!prepared.rect)
        prepared.rect = prepared.view.text.getBoundingClientRect();
      if (!prepared.hasHeights) {
        ensureLineHeights(cm, prepared.view, prepared.rect);
        prepared.hasHeights = true;
      }
      found = measureCharInner(cm, prepared, ch, bias);
      if (!found.bogus) prepared.cache[key] = found;
    }
    return {left: found.left, right: found.right, top: found.top, bottom: found.bottom};
  }

  var nullRect = {left: 0, right: 0, top: 0, bottom: 0};

  function measureCharInner(cm, prepared, ch, bias) {
    var map = prepared.map;

    var node, start, end, collapse;
    // First, search the line map for the text node corresponding to,
    // or closest to, the target character.
    for (var i = 0; i < map.length; i += 3) {
      var mStart = map[i], mEnd = map[i + 1];
      if (ch < mStart) {
        start = 0; end = 1;
        collapse = "left";
      } else if (ch < mEnd) {
        start = ch - mStart;
        end = start + 1;
      } else if (i == map.length - 3 || ch == mEnd && map[i + 3] > ch) {
        end = mEnd - mStart;
        start = end - 1;
        if (ch >= mEnd) collapse = "right";
      }
      if (start != null) {
        node = map[i + 2];
        if (mStart == mEnd && bias == (node.insertLeft ? "left" : "right"))
          collapse = bias;
        if (bias == "left" && start == 0)
          while (i && map[i - 2] == map[i - 3] && map[i - 1].insertLeft) {
            node = map[(i -= 3) + 2];
            collapse = "left";
          }
        if (bias == "right" && start == mEnd - mStart)
          while (i < map.length - 3 && map[i + 3] == map[i + 4] && !map[i + 5].insertLeft) {
            node = map[(i += 3) + 2];
            collapse = "right";
          }
        break;
      }
    }

    var rect;
    if (node.nodeType == 3) { // If it is a text node, use a range to retrieve the coordinates.
      while (start && isExtendingChar(prepared.line.text.charAt(mStart + start))) --start;
      while (mStart + end < mEnd && isExtendingChar(prepared.line.text.charAt(mStart + end))) ++end;
      if (ie_upto8 && start == 0 && end == mEnd - mStart) {
        rect = node.parentNode.getBoundingClientRect();
      } else if (ie && cm.options.lineWrapping) {
        var rects = range(node, start, end).getClientRects();
        if (rects.length)
          rect = rects[bias == "right" ? rects.length - 1 : 0];
        else
          rect = nullRect;
      } else {
        rect = range(node, start, end).getBoundingClientRect() || nullRect;
      }
    } else { // If it is a widget, simply get the box for the whole widget.
      if (start > 0) collapse = bias = "right";
      var rects;
      if (cm.options.lineWrapping && (rects = node.getClientRects()).length > 1)
        rect = rects[bias == "right" ? rects.length - 1 : 0];
      else
        rect = node.getBoundingClientRect();
    }
    if (ie_upto8 && !start && (!rect || !rect.left && !rect.right)) {
      var rSpan = node.parentNode.getClientRects()[0];
      if (rSpan)
        rect = {left: rSpan.left, right: rSpan.left + charWidth(cm.display), top: rSpan.top, bottom: rSpan.bottom};
      else
        rect = nullRect;
    }

    var top, bot = (rect.bottom + rect.top) / 2 - prepared.rect.top;
    var heights = prepared.view.measure.heights;
    for (var i = 0; i < heights.length - 1; i++)
      if (bot < heights[i]) break;
    top = i ? heights[i - 1] : 0; bot = heights[i];
    var result = {left: (collapse == "right" ? rect.right : rect.left) - prepared.rect.left,
                  right: (collapse == "left" ? rect.left : rect.right) - prepared.rect.left,
                  top: top, bottom: bot};
    if (!rect.left && !rect.right) result.bogus = true;
    return result;
  }

  function clearLineMeasurementCacheFor(lineView) {
    if (lineView.measure) {
      lineView.measure.cache = {};
      lineView.measure.heights = null;
      if (lineView.rest) for (var i = 0; i < lineView.rest.length; i++)
        lineView.measure.caches[i] = {};
    }
  }

  function clearLineMeasurementCache(cm) {
    cm.display.externalMeasure = null;
    removeChildren(cm.display.lineMeasure);
    for (var i = 0; i < cm.display.view.length; i++)
      clearLineMeasurementCacheFor(cm.display.view[i]);
  }

  function clearCaches(cm) {
    clearLineMeasurementCache(cm);
    cm.display.cachedCharWidth = cm.display.cachedTextHeight = cm.display.cachedPaddingH = null;
    if (!cm.options.lineWrapping) cm.display.maxLineChanged = true;
    cm.display.lineNumChars = null;
  }

  function pageScrollX() { return window.pageXOffset || (document.documentElement || document.body).scrollLeft; }
  function pageScrollY() { return window.pageYOffset || (document.documentElement || document.body).scrollTop; }

  // Converts a {top, bottom, left, right} box from line-local
  // coordinates into another coordinate system. Context may be one of
  // "line", "div" (display.lineDiv), "local"/null (editor), or "page".
  function intoCoordSystem(cm, lineObj, rect, context) {
    if (lineObj.widgets) for (var i = 0; i < lineObj.widgets.length; ++i) if (lineObj.widgets[i].above) {
      var size = widgetHeight(lineObj.widgets[i]);
      rect.top += size; rect.bottom += size;
    }
    if (context == "line") return rect;
    if (!context) context = "local";
    var yOff = heightAtLine(lineObj);
    if (context == "local") yOff += paddingTop(cm.display);
    else yOff -= cm.display.viewOffset;
    if (context == "page" || context == "window") {
      var lOff = cm.display.lineSpace.getBoundingClientRect();
      yOff += lOff.top + (context == "window" ? 0 : pageScrollY());
      var xOff = lOff.left + (context == "window" ? 0 : pageScrollX());
      rect.left += xOff; rect.right += xOff;
    }
    rect.top += yOff; rect.bottom += yOff;
    return rect;
  }

  // Coverts a box from "div" coords to another coordinate system.
  // Context may be "window", "page", "div", or "local"/null.
  function fromCoordSystem(cm, coords, context) {
    if (context == "div") return coords;
    var left = coords.left, top = coords.top;
    // First move into "page" coordinate system
    if (context == "page") {
      left -= pageScrollX();
      top -= pageScrollY();
    } else if (context == "local" || !context) {
      var localBox = cm.display.sizer.getBoundingClientRect();
      left += localBox.left;
      top += localBox.top;
    }

    var lineSpaceBox = cm.display.lineSpace.getBoundingClientRect();
    return {left: left - lineSpaceBox.left, top: top - lineSpaceBox.top};
  }

  function charCoords(cm, pos, context, lineObj, bias) {
    if (!lineObj) lineObj = getLine(cm.doc, pos.line);
    return intoCoordSystem(cm, lineObj, measureChar(cm, lineObj, pos.ch, bias), context);
  }

  // Returns a box for a given cursor position, which may have an
  // 'other' property containing the position of the secondary cursor
  // on a bidi boundary.
  function cursorCoords(cm, pos, context, lineObj, preparedMeasure) {
    lineObj = lineObj || getLine(cm.doc, pos.line);
    if (!preparedMeasure) preparedMeasure = prepareMeasureForLine(cm, lineObj);
    function get(ch, right) {
      var m = measureCharPrepared(cm, preparedMeasure, ch, right ? "right" : "left");
      if (right) m.left = m.right; else m.right = m.left;
      return intoCoordSystem(cm, lineObj, m, context);
    }
    function getBidi(ch, partPos) {
      var part = order[partPos], right = part.level % 2;
      if (ch == bidiLeft(part) && partPos && part.level < order[partPos - 1].level) {
        part = order[--partPos];
        ch = bidiRight(part) - (part.level % 2 ? 0 : 1);
        right = true;
      } else if (ch == bidiRight(part) && partPos < order.length - 1 && part.level < order[partPos + 1].level) {
        part = order[++partPos];
        ch = bidiLeft(part) - part.level % 2;
        right = false;
      }
      if (right && ch == part.to && ch > part.from) return get(ch - 1);
      return get(ch, right);
    }
    var order = getOrder(lineObj), ch = pos.ch;
    if (!order) return get(ch);
    var partPos = getBidiPartAt(order, ch);
    var val = getBidi(ch, partPos);
    if (bidiOther != null) val.other = getBidi(ch, bidiOther);
    return val;
  }

  // Used to cheaply estimate the coordinates for a position. Used for
  // intermediate scroll updates.
  function estimateCoords(cm, pos) {
    var left = 0, pos = clipPos(cm.doc, pos);
    if (!cm.options.lineWrapping) left = charWidth(cm.display) * pos.ch;
    var lineObj = getLine(cm.doc, pos.line);
    var top = heightAtLine(lineObj) + paddingTop(cm.display);
    return {left: left, right: left, top: top, bottom: top + lineObj.height};
  }

  // Positions returned by coordsChar contain some extra information.
  // xRel is the relative x position of the input coordinates compared
  // to the found position (so xRel > 0 means the coordinates are to
  // the right of the character position, for example). When outside
  // is true, that means the coordinates lie outside the line's
  // vertical range.
  function PosWithInfo(line, ch, outside, xRel) {
    var pos = Pos(line, ch);
    pos.xRel = xRel;
    if (outside) pos.outside = true;
    return pos;
  }

  // Compute the character position closest to the given coordinates.
  // Input must be lineSpace-local ("div" coordinate system).
  function coordsChar(cm, x, y) {
    var doc = cm.doc;
    y += cm.display.viewOffset;
    if (y < 0) return PosWithInfo(doc.first, 0, true, -1);
    var lineN = lineAtHeight(doc, y), last = doc.first + doc.size - 1;
    if (lineN > last)
      return PosWithInfo(doc.first + doc.size - 1, getLine(doc, last).text.length, true, 1);
    if (x < 0) x = 0;

    var lineObj = getLine(doc, lineN);
    for (;;) {
      var found = coordsCharInner(cm, lineObj, lineN, x, y);
      var merged = collapsedSpanAtEnd(lineObj);
      var mergedPos = merged && merged.find(0, true);
      if (merged && (found.ch > mergedPos.from.ch || found.ch == mergedPos.from.ch && found.xRel > 0))
        lineN = lineNo(lineObj = mergedPos.to.line);
      else
        return found;
    }
  }

  function coordsCharInner(cm, lineObj, lineNo, x, y) {
    var innerOff = y - heightAtLine(lineObj);
    var wrongLine = false, adjust = 2 * cm.display.wrapper.clientWidth;
    var preparedMeasure = prepareMeasureForLine(cm, lineObj);

    function getX(ch) {
      var sp = cursorCoords(cm, Pos(lineNo, ch), "line", lineObj, preparedMeasure);
      wrongLine = true;
      if (innerOff > sp.bottom) return sp.left - adjust;
      else if (innerOff < sp.top) return sp.left + adjust;
      else wrongLine = false;
      return sp.left;
    }

    var bidi = getOrder(lineObj), dist = lineObj.text.length;
    var from = lineLeft(lineObj), to = lineRight(lineObj);
    var fromX = getX(from), fromOutside = wrongLine, toX = getX(to), toOutside = wrongLine;

    if (x > toX) return PosWithInfo(lineNo, to, toOutside, 1);
    // Do a binary search between these bounds.
    for (;;) {
      if (bidi ? to == from || to == moveVisually(lineObj, from, 1) : to - from <= 1) {
        var ch = x < fromX || x - fromX <= toX - x ? from : to;
        var xDiff = x - (ch == from ? fromX : toX);
        while (isExtendingChar(lineObj.text.charAt(ch))) ++ch;
        var pos = PosWithInfo(lineNo, ch, ch == from ? fromOutside : toOutside,
                              xDiff < -1 ? -1 : xDiff > 1 ? 1 : 0);
        return pos;
      }
      var step = Math.ceil(dist / 2), middle = from + step;
      if (bidi) {
        middle = from;
        for (var i = 0; i < step; ++i) middle = moveVisually(lineObj, middle, 1);
      }
      var middleX = getX(middle);
      if (middleX > x) {to = middle; toX = middleX; if (toOutside = wrongLine) toX += 1000; dist = step;}
      else {from = middle; fromX = middleX; fromOutside = wrongLine; dist -= step;}
    }
  }

  var measureText;
  // Compute the default text height.
  function textHeight(display) {
    if (display.cachedTextHeight != null) return display.cachedTextHeight;
    if (measureText == null) {
      measureText = elt("pre");
      // Measure a bunch of lines, for browsers that compute
      // fractional heights.
      for (var i = 0; i < 49; ++i) {
        measureText.appendChild(document.createTextNode("x"));
        measureText.appendChild(elt("br"));
      }
      measureText.appendChild(document.createTextNode("x"));
    }
    removeChildrenAndAdd(display.measure, measureText);
    var height = measureText.offsetHeight / 50;
    if (height > 3) display.cachedTextHeight = height;
    removeChildren(display.measure);
    return height || 1;
  }

  // Compute the default character width.
  function charWidth(display) {
    if (display.cachedCharWidth != null) return display.cachedCharWidth;
    var anchor = elt("span", "xxxxxxxxxx");
    var pre = elt("pre", [anchor]);
    removeChildrenAndAdd(display.measure, pre);
    var rect = anchor.getBoundingClientRect(), width = (rect.right - rect.left) / 10;
    if (width > 2) display.cachedCharWidth = width;
    return width || 10;
  }

  // OPERATIONS

  // Operations are used to wrap a series of changes to the editor
  // state in such a way that each change won't have to update the
  // cursor and display (which would be awkward, slow, and
  // error-prone). Instead, display updates are batched and then all
  // combined and executed at once.

  var nextOpId = 0;
  // Start a new operation.
  function startOperation(cm) {
    cm.curOp = {
      viewChanged: false,      // Flag that indicates that lines might need to be redrawn
      startHeight: cm.doc.height, // Used to detect need to update scrollbar
      forceUpdate: false,      // Used to force a redraw
      updateInput: null,       // Whether to reset the input textarea
      typing: false,           // Whether this reset should be careful to leave existing text (for compositing)
      changeObjs: null,        // Accumulated changes, for firing change events
      cursorActivityHandlers: null, // Set of handlers to fire cursorActivity on
      selectionChanged: false, // Whether the selection needs to be redrawn
      updateMaxLine: false,    // Set when the widest line needs to be determined anew
      scrollLeft: null, scrollTop: null, // Intermediate scroll position, not pushed to DOM yet
      scrollToPos: null,       // Used to scroll to a specific position
      id: ++nextOpId           // Unique ID
    };
    if (!delayedCallbackDepth++) delayedCallbacks = [];
  }

  // Finish an operation, updating the display and signalling delayed events
  function endOperation(cm) {
    var op = cm.curOp, doc = cm.doc, display = cm.display;
    cm.curOp = null;

    if (op.updateMaxLine) findMaxLine(cm);

    // If it looks like an update might be needed, call updateDisplay
    if (op.viewChanged || op.forceUpdate || op.scrollTop != null ||
        op.scrollToPos && (op.scrollToPos.from.line < display.viewFrom ||
                           op.scrollToPos.to.line >= display.viewTo) ||
        display.maxLineChanged && cm.options.lineWrapping) {
      var updated = updateDisplay(cm, {top: op.scrollTop, ensure: op.scrollToPos}, op.forceUpdate);
      if (cm.display.scroller.offsetHeight) cm.doc.scrollTop = cm.display.scroller.scrollTop;
    }
    // If no update was run, but the selection changed, redraw that.
    if (!updated && op.selectionChanged) updateSelection(cm);
    if (!updated && op.startHeight != cm.doc.height) updateScrollbars(cm);

    // Abort mouse wheel delta measurement, when scrolling explicitly
    if (display.wheelStartX != null && (op.scrollTop != null || op.scrollLeft != null || op.scrollToPos))
      display.wheelStartX = display.wheelStartY = null;

    // Propagate the scroll position to the actual DOM scroller
    if (op.scrollTop != null && display.scroller.scrollTop != op.scrollTop) {
      var top = Math.max(0, Math.min(display.scroller.scrollHeight - display.scroller.clientHeight, op.scrollTop));
      display.scroller.scrollTop = display.scrollbarV.scrollTop = doc.scrollTop = top;
    }
    if (op.scrollLeft != null && display.scroller.scrollLeft != op.scrollLeft) {
      var left = Math.max(0, Math.min(display.scroller.scrollWidth - display.scroller.clientWidth, op.scrollLeft));
      display.scroller.scrollLeft = display.scrollbarH.scrollLeft = doc.scrollLeft = left;
      alignHorizontally(cm);
    }
    // If we need to scroll a specific position into view, do so.
    if (op.scrollToPos) {
      var coords = scrollPosIntoView(cm, clipPos(cm.doc, op.scrollToPos.from),
                                     clipPos(cm.doc, op.scrollToPos.to), op.scrollToPos.margin);
      if (op.scrollToPos.isCursor && cm.state.focused) maybeScrollWindow(cm, coords);
    }

    if (op.selectionChanged) restartBlink(cm);

    if (cm.state.focused && op.updateInput)
      resetInput(cm, op.typing);

    // Fire events for markers that are hidden/unidden by editing or
    // undoing
    var hidden = op.maybeHiddenMarkers, unhidden = op.maybeUnhiddenMarkers;
    if (hidden) for (var i = 0; i < hidden.length; ++i)
      if (!hidden[i].lines.length) signal(hidden[i], "hide");
    if (unhidden) for (var i = 0; i < unhidden.length; ++i)
      if (unhidden[i].lines.length) signal(unhidden[i], "unhide");

    var delayed;
    if (!--delayedCallbackDepth) {
      delayed = delayedCallbacks;
      delayedCallbacks = null;
    }
    // Fire change events, and delayed event handlers
    if (op.changeObjs)
      signal(cm, "changes", cm, op.changeObjs);
    if (delayed) for (var i = 0; i < delayed.length; ++i) delayed[i]();
    if (op.cursorActivityHandlers)
      for (var i = 0; i < op.cursorActivityHandlers.length; i++)
        op.cursorActivityHandlers[i](cm);
  }

  // Run the given function in an operation
  function runInOp(cm, f) {
    if (cm.curOp) return f();
    startOperation(cm);
    try { return f(); }
    finally { endOperation(cm); }
  }
  // Wraps a function in an operation. Returns the wrapped function.
  function operation(cm, f) {
    return function() {
      if (cm.curOp) return f.apply(cm, arguments);
      startOperation(cm);
      try { return f.apply(cm, arguments); }
      finally { endOperation(cm); }
    };
  }
  // Used to add methods to editor and doc instances, wrapping them in
  // operations.
  function methodOp(f) {
    return function() {
      if (this.curOp) return f.apply(this, arguments);
      startOperation(this);
      try { return f.apply(this, arguments); }
      finally { endOperation(this); }
    };
  }
  function docMethodOp(f) {
    return function() {
      var cm = this.cm;
      if (!cm || cm.curOp) return f.apply(this, arguments);
      startOperation(cm);
      try { return f.apply(this, arguments); }
      finally { endOperation(cm); }
    };
  }

  // VIEW TRACKING

  // These objects are used to represent the visible (currently drawn)
  // part of the document. A LineView may correspond to multiple
  // logical lines, if those are connected by collapsed ranges.
  function LineView(doc, line, lineN) {
    // The starting line
    this.line = line;
    // Continuing lines, if any
    this.rest = visualLineContinued(line);
    // Number of logical lines in this visual line
    this.size = this.rest ? lineNo(lst(this.rest)) - lineN + 1 : 1;
    this.node = this.text = null;
    this.hidden = lineIsHidden(doc, line);
  }

  // Create a range of LineView objects for the given lines.
  function buildViewArray(cm, from, to) {
    var array = [], nextPos;
    for (var pos = from; pos < to; pos = nextPos) {
      var view = new LineView(cm.doc, getLine(cm.doc, pos), pos);
      nextPos = pos + view.size;
      array.push(view);
    }
    return array;
  }

  // Updates the display.view data structure for a given change to the
  // document. From and to are in pre-change coordinates. Lendiff is
  // the amount of lines added or subtracted by the change. This is
  // used for changes that span multiple lines, or change the way
  // lines are divided into visual lines. regLineChange (below)
  // registers single-line changes.
  function regChange(cm, from, to, lendiff) {
    if (from == null) from = cm.doc.first;
    if (to == null) to = cm.doc.first + cm.doc.size;
    if (!lendiff) lendiff = 0;

    var display = cm.display;
    if (lendiff && to < display.viewTo &&
        (display.updateLineNumbers == null || display.updateLineNumbers > from))
      display.updateLineNumbers = from;

    cm.curOp.viewChanged = true;

    if (from >= display.viewTo) { // Change after
      if (sawCollapsedSpans && visualLineNo(cm.doc, from) < display.viewTo)
        resetView(cm);
    } else if (to <= display.viewFrom) { // Change before
      if (sawCollapsedSpans && visualLineEndNo(cm.doc, to + lendiff) > display.viewFrom) {
        resetView(cm);
      } else {
        display.viewFrom += lendiff;
        display.viewTo += lendiff;
      }
    } else if (from <= display.viewFrom && to >= display.viewTo) { // Full overlap
      resetView(cm);
    } else if (from <= display.viewFrom) { // Top overlap
      var cut = viewCuttingPoint(cm, to, to + lendiff, 1);
      if (cut) {
        display.view = display.view.slice(cut.index);
        display.viewFrom = cut.lineN;
        display.viewTo += lendiff;
      } else {
        resetView(cm);
      }
    } else if (to >= display.viewTo) { // Bottom overlap
      var cut = viewCuttingPoint(cm, from, from, -1);
      if (cut) {
        display.view = display.view.slice(0, cut.index);
        display.viewTo = cut.lineN;
      } else {
        resetView(cm);
      }
    } else { // Gap in the middle
      var cutTop = viewCuttingPoint(cm, from, from, -1);
      var cutBot = viewCuttingPoint(cm, to, to + lendiff, 1);
      if (cutTop && cutBot) {
        display.view = display.view.slice(0, cutTop.index)
          .concat(buildViewArray(cm, cutTop.lineN, cutBot.lineN))
          .concat(display.view.slice(cutBot.index));
        display.viewTo += lendiff;
      } else {
        resetView(cm);
      }
    }

    var ext = display.externalMeasured;
    if (ext) {
      if (to < ext.lineN)
        ext.lineN += lendiff;
      else if (from < ext.lineN + ext.size)
        display.externalMeasured = null;
    }
  }

  // Register a change to a single line. Type must be one of "text",
  // "gutter", "class", "widget"
  function regLineChange(cm, line, type) {
    cm.curOp.viewChanged = true;
    var display = cm.display, ext = cm.display.externalMeasured;
    if (ext && line >= ext.lineN && line < ext.lineN + ext.size)
      display.externalMeasured = null;

    if (line < display.viewFrom || line >= display.viewTo) return;
    var lineView = display.view[findViewIndex(cm, line)];
    if (lineView.node == null) return;
    var arr = lineView.changes || (lineView.changes = []);
    if (indexOf(arr, type) == -1) arr.push(type);
  }

  // Clear the view.
  function resetView(cm) {
    cm.display.viewFrom = cm.display.viewTo = cm.doc.first;
    cm.display.view = [];
    cm.display.viewOffset = 0;
  }

  // Find the view element corresponding to a given line. Return null
  // when the line isn't visible.
  function findViewIndex(cm, n) {
    if (n >= cm.display.viewTo) return null;
    n -= cm.display.viewFrom;
    if (n < 0) return null;
    var view = cm.display.view;
    for (var i = 0; i < view.length; i++) {
      n -= view[i].size;
      if (n < 0) return i;
    }
  }

  function viewCuttingPoint(cm, oldN, newN, dir) {
    var index = findViewIndex(cm, oldN), diff, view = cm.display.view;
    if (!sawCollapsedSpans || newN == cm.doc.first + cm.doc.size)
      return {index: index, lineN: newN};
    for (var i = 0, n = cm.display.viewFrom; i < index; i++)
      n += view[i].size;
    if (n != oldN) {
      if (dir > 0) {
        if (index == view.length - 1) return null;
        diff = (n + view[index].size) - oldN;
        index++;
      } else {
        diff = n - oldN;
      }
      oldN += diff; newN += diff;
    }
    while (visualLineNo(cm.doc, newN) != newN) {
      if (index == (dir < 0 ? 0 : view.length - 1)) return null;
      newN += dir * view[index - (dir < 0 ? 1 : 0)].size;
      index += dir;
    }
    return {index: index, lineN: newN};
  }

  // Force the view to cover a given range, adding empty view element
  // or clipping off existing ones as needed.
  function adjustView(cm, from, to) {
    var display = cm.display, view = display.view;
    if (view.length == 0 || from >= display.viewTo || to <= display.viewFrom) {
      display.view = buildViewArray(cm, from, to);
      display.viewFrom = from;
    } else {
      if (display.viewFrom > from)
        display.view = buildViewArray(cm, from, display.viewFrom).concat(display.view);
      else if (display.viewFrom < from)
        display.view = display.view.slice(findViewIndex(cm, from));
      display.viewFrom = from;
      if (display.viewTo < to)
        display.view = display.view.concat(buildViewArray(cm, display.viewTo, to));
      else if (display.viewTo > to)
        display.view = display.view.slice(0, findViewIndex(cm, to));
    }
    display.viewTo = to;
  }

  // Count the number of lines in the view whose DOM representation is
  // out of date (or nonexistent).
  function countDirtyView(cm) {
    var view = cm.display.view, dirty = 0;
    for (var i = 0; i < view.length; i++) {
      var lineView = view[i];
      if (!lineView.hidden && (!lineView.node || lineView.changes)) ++dirty;
    }
    return dirty;
  }

  // INPUT HANDLING

  // Poll for input changes, using the normal rate of polling. This
  // runs as long as the editor is focused.
  function slowPoll(cm) {
    if (cm.display.pollingFast) return;
    cm.display.poll.set(cm.options.pollInterval, function() {
      readInput(cm);
      if (cm.state.focused) slowPoll(cm);
    });
  }

  // When an event has just come in that is likely to add or change
  // something in the input textarea, we poll faster, to ensure that
  // the change appears on the screen quickly.
  function fastPoll(cm) {
    var missed = false;
    cm.display.pollingFast = true;
    function p() {
      var changed = readInput(cm);
      if (!changed && !missed) {missed = true; cm.display.poll.set(60, p);}
      else {cm.display.pollingFast = false; slowPoll(cm);}
    }
    cm.display.poll.set(20, p);
  }

  // Read input from the textarea, and update the document to match.
  // When something is selected, it is present in the textarea, and
  // selected (unless it is huge, in which case a placeholder is
  // used). When nothing is selected, the cursor sits after previously
  // seen text (can be empty), which is stored in prevInput (we must
  // not reset the textarea when typing, because that breaks IME).
  function readInput(cm) {
    var input = cm.display.input, prevInput = cm.display.prevInput, doc = cm.doc;
    // Since this is called a *lot*, try to bail out as cheaply as
    // possible when it is clear that nothing happened. hasSelection
    // will be the case when there is a lot of text in the textarea,
    // in which case reading its value would be expensive.
    if (!cm.state.focused || (hasSelection(input) && !prevInput) || isReadOnly(cm) || cm.options.disableInput)
      return false;
    // See paste handler for more on the fakedLastChar kludge
    if (cm.state.pasteIncoming && cm.state.fakedLastChar) {
      input.value = input.value.substring(0, input.value.length - 1);
      cm.state.fakedLastChar = false;
    }
    var text = input.value;
    // If nothing changed, bail.
    if (text == prevInput && !cm.somethingSelected()) return false;
    // Work around nonsensical selection resetting in IE9/10
    if (ie && !ie_upto8 && cm.display.inputHasSelection === text) {
      resetInput(cm);
      return false;
    }

    var withOp = !cm.curOp;
    if (withOp) startOperation(cm);
    cm.display.shift = false;

    if (text.charCodeAt(0) == 0x200b && doc.sel == cm.display.selForContextMenu && !prevInput)
      prevInput = "\u200b";
    // Find the part of the input that is actually new
    var same = 0, l = Math.min(prevInput.length, text.length);
    while (same < l && prevInput.charCodeAt(same) == text.charCodeAt(same)) ++same;
    var inserted = text.slice(same), textLines = splitLines(inserted);

    // When pasing N lines into N selections, insert one line per selection
    var multiPaste = cm.state.pasteIncoming && textLines.length > 1 && doc.sel.ranges.length == textLines.length;

    // Normal behavior is to insert the new text into every selection
    for (var i = doc.sel.ranges.length - 1; i >= 0; i--) {
      var range = doc.sel.ranges[i];
      var from = range.from(), to = range.to();
      // Handle deletion
      if (same < prevInput.length)
        from = Pos(from.line, from.ch - (prevInput.length - same));
      // Handle overwrite
      else if (cm.state.overwrite && range.empty() && !cm.state.pasteIncoming)
        to = Pos(to.line, Math.min(getLine(doc, to.line).text.length, to.ch + lst(textLines).length));
      var updateInput = cm.curOp.updateInput;
      var changeEvent = {from: from, to: to, text: multiPaste ? [textLines[i]] : textLines,
                         origin: cm.state.pasteIncoming ? "paste" : cm.state.cutIncoming ? "cut" : "+input"};
      makeChange(cm.doc, changeEvent);
      signalLater(cm, "inputRead", cm, changeEvent);
      // When an 'electric' character is inserted, immediately trigger a reindent
      if (inserted && !cm.state.pasteIncoming && cm.options.electricChars &&
          cm.options.smartIndent && range.head.ch < 100 &&
          (!i || doc.sel.ranges[i - 1].head.line != range.head.line)) {
        var mode = cm.getModeAt(range.head);
        if (mode.electricChars) {
          for (var j = 0; j < mode.electricChars.length; j++)
            if (inserted.indexOf(mode.electricChars.charAt(j)) > -1) {
              indentLine(cm, range.head.line, "smart");
              break;
            }
        } else if (mode.electricInput) {
          var end = changeEnd(changeEvent);
          if (mode.electricInput.test(getLine(doc, end.line).text.slice(0, end.ch)))
            indentLine(cm, range.head.line, "smart");
        }
      }
    }
    ensureCursorVisible(cm);
    cm.curOp.updateInput = updateInput;
    cm.curOp.typing = true;

    // Don't leave long text in the textarea, since it makes further polling slow
    if (text.length > 1000 || text.indexOf("\n") > -1) input.value = cm.display.prevInput = "";
    else cm.display.prevInput = text;
    if (withOp) endOperation(cm);
    cm.state.pasteIncoming = cm.state.cutIncoming = false;
    return true;
  }

  // Reset the input to correspond to the selection (or to be empty,
  // when not typing and nothing is selected)
  function resetInput(cm, typing) {
    var minimal, selected, doc = cm.doc;
    if (cm.somethingSelected()) {
      cm.display.prevInput = "";
      var range = doc.sel.primary();
      minimal = hasCopyEvent &&
        (range.to().line - range.from().line > 100 || (selected = cm.getSelection()).length > 1000);
      var content = minimal ? "-" : selected || cm.getSelection();
      cm.display.input.value = content;
      if (cm.state.focused) selectInput(cm.display.input);
      if (ie && !ie_upto8) cm.display.inputHasSelection = content;
    } else if (!typing) {
      cm.display.prevInput = cm.display.input.value = "";
      if (ie && !ie_upto8) cm.display.inputHasSelection = null;
    }
    cm.display.inaccurateSelection = minimal;
  }

  function focusInput(cm) {
    if (cm.options.readOnly != "nocursor" && (!mobile || activeElt() != cm.display.input))
      cm.display.input.focus();
  }

  function ensureFocus(cm) {
    if (!cm.state.focused) { focusInput(cm); onFocus(cm); }
  }

  function isReadOnly(cm) {
    return cm.options.readOnly || cm.doc.cantEdit;
  }

  // EVENT HANDLERS

  // Attach the necessary event handlers when initializing the editor
  function registerEventHandlers(cm) {
    var d = cm.display;
    on(d.scroller, "mousedown", operation(cm, onMouseDown));
    // Older IE's will not fire a second mousedown for a double click
    if (ie_upto10)
      on(d.scroller, "dblclick", operation(cm, function(e) {
        if (signalDOMEvent(cm, e)) return;
        var pos = posFromMouse(cm, e);
        if (!pos || clickInGutter(cm, e) || eventInWidget(cm.display, e)) return;
        e_preventDefault(e);
        var word = findWordAt(cm, pos);
        extendSelection(cm.doc, word.anchor, word.head);
      }));
    else
      on(d.scroller, "dblclick", function(e) { signalDOMEvent(cm, e) || e_preventDefault(e); });
    // Prevent normal selection in the editor (we handle our own)
    on(d.lineSpace, "selectstart", function(e) {
      if (!eventInWidget(d, e)) e_preventDefault(e);
    });
    // Some browsers fire contextmenu *after* opening the menu, at
    // which point we can't mess with it anymore. Context menu is
    // handled in onMouseDown for these browsers.
    if (!captureRightClick) on(d.scroller, "contextmenu", function(e) {onContextMenu(cm, e);});

    // Sync scrolling between fake scrollbars and real scrollable
    // area, ensure viewport is updated when scrolling.
    on(d.scroller, "scroll", function() {
      if (d.scroller.clientHeight) {
        setScrollTop(cm, d.scroller.scrollTop);
        setScrollLeft(cm, d.scroller.scrollLeft, true);
        signal(cm, "scroll", cm);
      }
    });
    on(d.scrollbarV, "scroll", function() {
      if (d.scroller.clientHeight) setScrollTop(cm, d.scrollbarV.scrollTop);
    });
    on(d.scrollbarH, "scroll", function() {
      if (d.scroller.clientHeight) setScrollLeft(cm, d.scrollbarH.scrollLeft);
    });

    // Listen to wheel events in order to try and update the viewport on time.
    on(d.scroller, "mousewheel", function(e){onScrollWheel(cm, e);});
    on(d.scroller, "DOMMouseScroll", function(e){onScrollWheel(cm, e);});

    // Prevent clicks in the scrollbars from killing focus
    function reFocus() { if (cm.state.focused) setTimeout(bind(focusInput, cm), 0); }
    on(d.scrollbarH, "mousedown", reFocus);
    on(d.scrollbarV, "mousedown", reFocus);
    // Prevent wrapper from ever scrolling
    on(d.wrapper, "scroll", function() { d.wrapper.scrollTop = d.wrapper.scrollLeft = 0; });

    on(d.input, "keyup", operation(cm, onKeyUp));
    on(d.input, "input", function() {
      if (ie && !ie_upto8 && cm.display.inputHasSelection) cm.display.inputHasSelection = null;
      fastPoll(cm);
    });
    on(d.input, "keydown", operation(cm, onKeyDown));
    on(d.input, "keypress", operation(cm, onKeyPress));
    on(d.input, "focus", bind(onFocus, cm));
    on(d.input, "blur", bind(onBlur, cm));

    function drag_(e) {
      if (!signalDOMEvent(cm, e)) e_stop(e);
    }
    if (cm.options.dragDrop) {
      on(d.scroller, "dragstart", function(e){onDragStart(cm, e);});
      on(d.scroller, "dragenter", drag_);
      on(d.scroller, "dragover", drag_);
      on(d.scroller, "drop", operation(cm, onDrop));
    }
    on(d.scroller, "paste", function(e) {
      if (eventInWidget(d, e)) return;
      cm.state.pasteIncoming = true;
      focusInput(cm);
      fastPoll(cm);
    });
    on(d.input, "paste", function() {
      // Workaround for webkit bug https://bugs.webkit.org/show_bug.cgi?id=90206
      // Add a char to the end of textarea before paste occur so that
      // selection doesn't span to the end of textarea.
      if (webkit && !cm.state.fakedLastChar && !(new Date - cm.state.lastMiddleDown < 200)) {
        var start = d.input.selectionStart, end = d.input.selectionEnd;
        d.input.value += "$";
        d.input.selectionStart = start;
        d.input.selectionEnd = end;
        cm.state.fakedLastChar = true;
      }
      cm.state.pasteIncoming = true;
      fastPoll(cm);
    });

    function prepareCopyCut(e) {
      if (cm.somethingSelected()) {
        if (d.inaccurateSelection) {
          d.prevInput = "";
          d.inaccurateSelection = false;
          d.input.value = cm.getSelection();
          selectInput(d.input);
        }
      } else {
        var text = "", ranges = [];
        for (var i = 0; i < cm.doc.sel.ranges.length; i++) {
          var line = cm.doc.sel.ranges[i].head.line;
          var lineRange = {anchor: Pos(line, 0), head: Pos(line + 1, 0)};
          ranges.push(lineRange);
          text += cm.getRange(lineRange.anchor, lineRange.head);
        }
        if (e.type == "cut") {
          cm.setSelections(ranges, null, sel_dontScroll);
        } else {
          d.prevInput = "";
          d.input.value = text;
          selectInput(d.input);
        }
      }
      if (e.type == "cut") cm.state.cutIncoming = true;
    }
    on(d.input, "cut", prepareCopyCut);
    on(d.input, "copy", prepareCopyCut);

    // Needed to handle Tab key in KHTML
    if (khtml) on(d.sizer, "mouseup", function() {
      if (activeElt() == d.input) d.input.blur();
      focusInput(cm);
    });
  }

  // Called when the window resizes
  function onResize(cm) {
    // Might be a text scaling operation, clear size caches.
    var d = cm.display;
    d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null;
    cm.setSize();
  }

  // MOUSE EVENTS

  // Return true when the given mouse event happened in a widget
  function eventInWidget(display, e) {
    for (var n = e_target(e); n != display.wrapper; n = n.parentNode) {
      if (!n || n.ignoreEvents || n.parentNode == display.sizer && n != display.mover) return true;
    }
  }

  // Given a mouse event, find the corresponding position. If liberal
  // is false, it checks whether a gutter or scrollbar was clicked,
  // and returns null if it was. forRect is used by rectangular
  // selections, and tries to estimate a character position even for
  // coordinates beyond the right of the text.
  function posFromMouse(cm, e, liberal, forRect) {
    var display = cm.display;
    if (!liberal) {
      var target = e_target(e);
      if (target == display.scrollbarH || target == display.scrollbarV ||
          target == display.scrollbarFiller || target == display.gutterFiller) return null;
    }
    var x, y, space = display.lineSpace.getBoundingClientRect();
    // Fails unpredictably on IE[67] when mouse is dragged around quickly.
    try { x = e.clientX - space.left; y = e.clientY - space.top; }
    catch (e) { return null; }
    var coords = coordsChar(cm, x, y), line;
    if (forRect && coords.xRel == 1 && (line = getLine(cm.doc, coords.line).text).length == coords.ch) {
      var colDiff = countColumn(line, line.length, cm.options.tabSize) - line.length;
      coords = Pos(coords.line, Math.max(0, Math.round((x - paddingH(cm.display).left) / charWidth(cm.display)) - colDiff));
    }
    return coords;
  }

  // A mouse down can be a single click, double click, triple click,
  // start of selection drag, start of text drag, new cursor
  // (ctrl-click), rectangle drag (alt-drag), or xwin
  // middle-click-paste. Or it might be a click on something we should
  // not interfere with, such as a scrollbar or widget.
  function onMouseDown(e) {
    if (signalDOMEvent(this, e)) return;
    var cm = this, display = cm.display;
    display.shift = e.shiftKey;

    if (eventInWidget(display, e)) {
      if (!webkit) {
        // Briefly turn off draggability, to allow widgets to do
        // normal dragging things.
        display.scroller.draggable = false;
        setTimeout(function(){display.scroller.draggable = true;}, 100);
      }
      return;
    }
    if (clickInGutter(cm, e)) return;
    var start = posFromMouse(cm, e);
    window.focus();

    switch (e_button(e)) {
    case 1:
      if (start)
        leftButtonDown(cm, e, start);
      else if (e_target(e) == display.scroller)
        e_preventDefault(e);
      break;
    case 2:
      if (webkit) cm.state.lastMiddleDown = +new Date;
      if (start) extendSelection(cm.doc, start);
      setTimeout(bind(focusInput, cm), 20);
      e_preventDefault(e);
      break;
    case 3:
      if (captureRightClick) onContextMenu(cm, e);
      break;
    }
  }

  var lastClick, lastDoubleClick;
  function leftButtonDown(cm, e, start) {
    setTimeout(bind(ensureFocus, cm), 0);

    var now = +new Date, type;
    if (lastDoubleClick && lastDoubleClick.time > now - 400 && cmp(lastDoubleClick.pos, start) == 0) {
      type = "triple";
    } else if (lastClick && lastClick.time > now - 400 && cmp(lastClick.pos, start) == 0) {
      type = "double";
      lastDoubleClick = {time: now, pos: start};
    } else {
      type = "single";
      lastClick = {time: now, pos: start};
    }

    var sel = cm.doc.sel, modifier = mac ? e.metaKey : e.ctrlKey;
    if (cm.options.dragDrop && dragAndDrop && !isReadOnly(cm) &&
        type == "single" && sel.contains(start) > -1 && sel.somethingSelected())
      leftButtonStartDrag(cm, e, start, modifier);
    else
      leftButtonSelect(cm, e, start, type, modifier);
  }

  // Start a text drag. When it ends, see if any dragging actually
  // happen, and treat as a click if it didn't.
  function leftButtonStartDrag(cm, e, start, modifier) {
    var display = cm.display;
    var dragEnd = operation(cm, function(e2) {
      if (webkit) display.scroller.draggable = false;
      cm.state.draggingText = false;
      off(document, "mouseup", dragEnd);
      off(display.scroller, "drop", dragEnd);
      if (Math.abs(e.clientX - e2.clientX) + Math.abs(e.clientY - e2.clientY) < 10) {
        e_preventDefault(e2);
        if (!modifier)
          extendSelection(cm.doc, start);
        focusInput(cm);
        // Work around unexplainable focus problem in IE9 (#2127)
        if (ie_upto10 && !ie_upto8)
          setTimeout(function() {document.body.focus(); focusInput(cm);}, 20);
      }
    });
    // Let the drag handler handle this.
    if (webkit) display.scroller.draggable = true;
    cm.state.draggingText = dragEnd;
    // IE's approach to draggable
    if (display.scroller.dragDrop) display.scroller.dragDrop();
    on(document, "mouseup", dragEnd);
    on(display.scroller, "drop", dragEnd);
  }

  // Normal selection, as opposed to text dragging.
  function leftButtonSelect(cm, e, start, type, addNew) {
    var display = cm.display, doc = cm.doc;
    e_preventDefault(e);

    var ourRange, ourIndex, startSel = doc.sel;
    if (addNew && !e.shiftKey) {
      ourIndex = doc.sel.contains(start);
      if (ourIndex > -1)
        ourRange = doc.sel.ranges[ourIndex];
      else
        ourRange = new Range(start, start);
    } else {
      ourRange = doc.sel.primary();
    }

    if (e.altKey) {
      type = "rect";
      if (!addNew) ourRange = new Range(start, start);
      start = posFromMouse(cm, e, true, true);
      ourIndex = -1;
    } else if (type == "double") {
      var word = findWordAt(cm, start);
      if (cm.display.shift || doc.extend)
        ourRange = extendRange(doc, ourRange, word.anchor, word.head);
      else
        ourRange = word;
    } else if (type == "triple") {
      var line = new Range(Pos(start.line, 0), clipPos(doc, Pos(start.line + 1, 0)));
      if (cm.display.shift || doc.extend)
        ourRange = extendRange(doc, ourRange, line.anchor, line.head);
      else
        ourRange = line;
    } else {
      ourRange = extendRange(doc, ourRange, start);
    }

    if (!addNew) {
      ourIndex = 0;
      setSelection(doc, new Selection([ourRange], 0), sel_mouse);
      startSel = doc.sel;
    } else if (ourIndex > -1) {
      replaceOneSelection(doc, ourIndex, ourRange, sel_mouse);
    } else {
      ourIndex = doc.sel.ranges.length;
      setSelection(doc, normalizeSelection(doc.sel.ranges.concat([ourRange]), ourIndex),
                   {scroll: false, origin: "*mouse"});
    }

    var lastPos = start;
    function extendTo(pos) {
      if (cmp(lastPos, pos) == 0) return;
      lastPos = pos;

      if (type == "rect") {
        var ranges = [], tabSize = cm.options.tabSize;
        var startCol = countColumn(getLine(doc, start.line).text, start.ch, tabSize);
        var posCol = countColumn(getLine(doc, pos.line).text, pos.ch, tabSize);
        var left = Math.min(startCol, posCol), right = Math.max(startCol, posCol);
        for (var line = Math.min(start.line, pos.line), end = Math.min(cm.lastLine(), Math.max(start.line, pos.line));
             line <= end; line++) {
          var text = getLine(doc, line).text, leftPos = findColumn(text, left, tabSize);
          if (left == right)
            ranges.push(new Range(Pos(line, leftPos), Pos(line, leftPos)));
          else if (text.length > leftPos)
            ranges.push(new Range(Pos(line, leftPos), Pos(line, findColumn(text, right, tabSize))));
        }
        if (!ranges.length) ranges.push(new Range(start, start));
        setSelection(doc, normalizeSelection(startSel.ranges.slice(0, ourIndex).concat(ranges), ourIndex),
                     {origin: "*mouse", scroll: false});
        cm.scrollIntoView(pos);
      } else {
        var oldRange = ourRange;
        var anchor = oldRange.anchor, head = pos;
        if (type != "single") {
          if (type == "double")
            var range = findWordAt(cm, pos);
          else
            var range = new Range(Pos(pos.line, 0), clipPos(doc, Pos(pos.line + 1, 0)));
          if (cmp(range.anchor, anchor) > 0) {
            head = range.head;
            anchor = minPos(oldRange.from(), range.anchor);
          } else {
            head = range.anchor;
            anchor = maxPos(oldRange.to(), range.head);
          }
        }
        var ranges = startSel.ranges.slice(0);
        ranges[ourIndex] = new Range(clipPos(doc, anchor), head);
        setSelection(doc, normalizeSelection(ranges, ourIndex), sel_mouse);
      }
    }

    var editorSize = display.wrapper.getBoundingClientRect();
    // Used to ensure timeout re-tries don't fire when another extend
    // happened in the meantime (clearTimeout isn't reliable -- at
    // least on Chrome, the timeouts still happen even when cleared,
    // if the clear happens after their scheduled firing time).
    var counter = 0;

    function extend(e) {
      var curCount = ++counter;
      var cur = posFromMouse(cm, e, true, type == "rect");
      if (!cur) return;
      if (cmp(cur, lastPos) != 0) {
        ensureFocus(cm);
        extendTo(cur);
        var visible = visibleLines(display, doc);
        if (cur.line >= visible.to || cur.line < visible.from)
          setTimeout(operation(cm, function(){if (counter == curCount) extend(e);}), 150);
      } else {
        var outside = e.clientY < editorSize.top ? -20 : e.clientY > editorSize.bottom ? 20 : 0;
        if (outside) setTimeout(operation(cm, function() {
          if (counter != curCount) return;
          display.scroller.scrollTop += outside;
          extend(e);
        }), 50);
      }
    }

    function done(e) {
      counter = Infinity;
      e_preventDefault(e);
      focusInput(cm);
      off(document, "mousemove", move);
      off(document, "mouseup", up);
      doc.history.lastSelOrigin = null;
    }

    var move = operation(cm, function(e) {
      if ((ie && !ie_upto9) ?  !e.buttons : !e_button(e)) done(e);
      else extend(e);
    });
    var up = operation(cm, done);
    on(document, "mousemove", move);
    on(document, "mouseup", up);
  }

  // Determines whether an event happened in the gutter, and fires the
  // handlers for the corresponding event.
  function gutterEvent(cm, e, type, prevent, signalfn) {
    try { var mX = e.clientX, mY = e.clientY; }
    catch(e) { return false; }
    if (mX >= Math.floor(cm.display.gutters.getBoundingClientRect().right)) return false;
    if (prevent) e_preventDefault(e);

    var display = cm.display;
    var lineBox = display.lineDiv.getBoundingClientRect();

    if (mY > lineBox.bottom || !hasHandler(cm, type)) return e_defaultPrevented(e);
    mY -= lineBox.top - display.viewOffset;

    for (var i = 0; i < cm.options.gutters.length; ++i) {
      var g = display.gutters.childNodes[i];
      if (g && g.getBoundingClientRect().right >= mX) {
        var line = lineAtHeight(cm.doc, mY);
        var gutter = cm.options.gutters[i];
        signalfn(cm, type, cm, line, gutter, e);
        return e_defaultPrevented(e);
      }
    }
  }

  function clickInGutter(cm, e) {
    return gutterEvent(cm, e, "gutterClick", true, signalLater);
  }

  // Kludge to work around strange IE behavior where it'll sometimes
  // re-fire a series of drag-related events right after the drop (#1551)
  var lastDrop = 0;

  function onDrop(e) {
    var cm = this;
    if (signalDOMEvent(cm, e) || eventInWidget(cm.display, e))
      return;
    e_preventDefault(e);
    if (ie) lastDrop = +new Date;
    var pos = posFromMouse(cm, e, true), files = e.dataTransfer.files;
    if (!pos || isReadOnly(cm)) return;
    // Might be a file drop, in which case we simply extract the text
    // and insert it.
    if (files && files.length && window.FileReader && window.File) {
      var n = files.length, text = Array(n), read = 0;
      var loadFile = function(file, i) {
        var reader = new FileReader;
        reader.onload = operation(cm, function() {
          text[i] = reader.result;
          if (++read == n) {
            pos = clipPos(cm.doc, pos);
            var change = {from: pos, to: pos, text: splitLines(text.join("\n")), origin: "paste"};
            makeChange(cm.doc, change);
            setSelectionReplaceHistory(cm.doc, simpleSelection(pos, changeEnd(change)));
          }
        });
        reader.readAsText(file);
      };
      for (var i = 0; i < n; ++i) loadFile(files[i], i);
    } else { // Normal drop
      // Don't do a replace if the drop happened inside of the selected text.
      if (cm.state.draggingText && cm.doc.sel.contains(pos) > -1) {
        cm.state.draggingText(e);
        // Ensure the editor is re-focused
        setTimeout(bind(focusInput, cm), 20);
        return;
      }
      try {
        var text = e.dataTransfer.getData("Text");
        if (text) {
          if (cm.state.draggingText && !(mac ? e.metaKey : e.ctrlKey))
            var selected = cm.listSelections();
          setSelectionNoUndo(cm.doc, simpleSelection(pos, pos));
          if (selected) for (var i = 0; i < selected.length; ++i)
            replaceRange(cm.doc, "", selected[i].anchor, selected[i].head, "drag");
          cm.replaceSelection(text, "around", "paste");
          focusInput(cm);
        }
      }
      catch(e){}
    }
  }

  function onDragStart(cm, e) {
    if (ie && (!cm.state.draggingText || +new Date - lastDrop < 100)) { e_stop(e); return; }
    if (signalDOMEvent(cm, e) || eventInWidget(cm.display, e)) return;

    e.dataTransfer.setData("Text", cm.getSelection());

    // Use dummy image instead of default browsers image.
    // Recent Safari (~6.0.2) have a tendency to segfault when this happens, so we don't do it there.
    if (e.dataTransfer.setDragImage && !safari) {
      var img = elt("img", null, null, "position: fixed; left: 0; top: 0;");
      img.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
      if (presto) {
        img.width = img.height = 1;
        cm.display.wrapper.appendChild(img);
        // Force a relayout, or Opera won't use our image for some obscure reason
        img._top = img.offsetTop;
      }
      e.dataTransfer.setDragImage(img, 0, 0);
      if (presto) img.parentNode.removeChild(img);
    }
  }

  // SCROLL EVENTS

  // Sync the scrollable area and scrollbars, ensure the viewport
  // covers the visible area.
  function setScrollTop(cm, val) {
    if (Math.abs(cm.doc.scrollTop - val) < 2) return;
    cm.doc.scrollTop = val;
    if (!gecko) updateDisplay(cm, {top: val});
    if (cm.display.scroller.scrollTop != val) cm.display.scroller.scrollTop = val;
    if (cm.display.scrollbarV.scrollTop != val) cm.display.scrollbarV.scrollTop = val;
    if (gecko) updateDisplay(cm);
    startWorker(cm, 100);
  }
  // Sync scroller and scrollbar, ensure the gutter elements are
  // aligned.
  function setScrollLeft(cm, val, isScroller) {
    if (isScroller ? val == cm.doc.scrollLeft : Math.abs(cm.doc.scrollLeft - val) < 2) return;
    val = Math.min(val, cm.display.scroller.scrollWidth - cm.display.scroller.clientWidth);
    cm.doc.scrollLeft = val;
    alignHorizontally(cm);
    if (cm.display.scroller.scrollLeft != val) cm.display.scroller.scrollLeft = val;
    if (cm.display.scrollbarH.scrollLeft != val) cm.display.scrollbarH.scrollLeft = val;
  }

  // Since the delta values reported on mouse wheel events are
  // unstandardized between browsers and even browser versions, and
  // generally horribly unpredictable, this code starts by measuring
  // the scroll effect that the first few mouse wheel events have,
  // and, from that, detects the way it can convert deltas to pixel
  // offsets afterwards.
  //
  // The reason we want to know the amount a wheel event will scroll
  // is that it gives us a chance to update the display before the
  // actual scrolling happens, reducing flickering.

  var wheelSamples = 0, wheelPixelsPerUnit = null;
  // Fill in a browser-detected starting value on browsers where we
  // know one. These don't have to be accurate -- the result of them
  // being wrong would just be a slight flicker on the first wheel
  // scroll (if it is large enough).
  if (ie) wheelPixelsPerUnit = -.53;
  else if (gecko) wheelPixelsPerUnit = 15;
  else if (chrome) wheelPixelsPerUnit = -.7;
  else if (safari) wheelPixelsPerUnit = -1/3;

  function onScrollWheel(cm, e) {
    var dx = e.wheelDeltaX, dy = e.wheelDeltaY;
    if (dx == null && e.detail && e.axis == e.HORIZONTAL_AXIS) dx = e.detail;
    if (dy == null && e.detail && e.axis == e.VERTICAL_AXIS) dy = e.detail;
    else if (dy == null) dy = e.wheelDelta;

    var display = cm.display, scroll = display.scroller;
    // Quit if there's nothing to scroll here
    if (!(dx && scroll.scrollWidth > scroll.clientWidth ||
          dy && scroll.scrollHeight > scroll.clientHeight)) return;

    // Webkit browsers on OS X abort momentum scrolls when the target
    // of the scroll event is removed from the scrollable element.
    // This hack (see related code in patchDisplay) makes sure the
    // element is kept around.
    if (dy && mac && webkit) {
      outer: for (var cur = e.target, view = display.view; cur != scroll; cur = cur.parentNode) {
        for (var i = 0; i < view.length; i++) {
          if (view[i].node == cur) {
            cm.display.currentWheelTarget = cur;
            break outer;
          }
        }
      }
    }

    // On some browsers, horizontal scrolling will cause redraws to
    // happen before the gutter has been realigned, causing it to
    // wriggle around in a most unseemly way. When we have an
    // estimated pixels/delta value, we just handle horizontal
    // scrolling entirely here. It'll be slightly off from native, but
    // better than glitching out.
    if (dx && !gecko && !presto && wheelPixelsPerUnit != null) {
      if (dy)
        setScrollTop(cm, Math.max(0, Math.min(scroll.scrollTop + dy * wheelPixelsPerUnit, scroll.scrollHeight - scroll.clientHeight)));
      setScrollLeft(cm, Math.max(0, Math.min(scroll.scrollLeft + dx * wheelPixelsPerUnit, scroll.scrollWidth - scroll.clientWidth)));
      e_preventDefault(e);
      display.wheelStartX = null; // Abort measurement, if in progress
      return;
    }

    // 'Project' the visible viewport to cover the area that is being
    // scrolled into view (if we know enough to estimate it).
    if (dy && wheelPixelsPerUnit != null) {
      var pixels = dy * wheelPixelsPerUnit;
      var top = cm.doc.scrollTop, bot = top + display.wrapper.clientHeight;
      if (pixels < 0) top = Math.max(0, top + pixels - 50);
      else bot = Math.min(cm.doc.height, bot + pixels + 50);
      updateDisplay(cm, {top: top, bottom: bot});
    }

    if (wheelSamples < 20) {
      if (display.wheelStartX == null) {
        display.wheelStartX = scroll.scrollLeft; display.wheelStartY = scroll.scrollTop;
        display.wheelDX = dx; display.wheelDY = dy;
        setTimeout(function() {
          if (display.wheelStartX == null) return;
          var movedX = scroll.scrollLeft - display.wheelStartX;
          var movedY = scroll.scrollTop - display.wheelStartY;
          var sample = (movedY && display.wheelDY && movedY / display.wheelDY) ||
            (movedX && display.wheelDX && movedX / display.wheelDX);
          display.wheelStartX = display.wheelStartY = null;
          if (!sample) return;
          wheelPixelsPerUnit = (wheelPixelsPerUnit * wheelSamples + sample) / (wheelSamples + 1);
          ++wheelSamples;
        }, 200);
      } else {
        display.wheelDX += dx; display.wheelDY += dy;
      }
    }
  }

  // KEY EVENTS

  // Run a handler that was bound to a key.
  function doHandleBinding(cm, bound, dropShift) {
    if (typeof bound == "string") {
      bound = commands[bound];
      if (!bound) return false;
    }
    // Ensure previous input has been read, so that the handler sees a
    // consistent view of the document
    if (cm.display.pollingFast && readInput(cm)) cm.display.pollingFast = false;
    var prevShift = cm.display.shift, done = false;
    try {
      if (isReadOnly(cm)) cm.state.suppressEdits = true;
      if (dropShift) cm.display.shift = false;
      done = bound(cm) != Pass;
    } finally {
      cm.display.shift = prevShift;
      cm.state.suppressEdits = false;
    }
    return done;
  }

  // Collect the currently active keymaps.
  function allKeyMaps(cm) {
    var maps = cm.state.keyMaps.slice(0);
    if (cm.options.extraKeys) maps.push(cm.options.extraKeys);
    maps.push(cm.options.keyMap);
    return maps;
  }

  var maybeTransition;
  // Handle a key from the keydown event.
  function handleKeyBinding(cm, e) {
    // Handle automatic keymap transitions
    var startMap = getKeyMap(cm.options.keyMap), next = startMap.auto;
    clearTimeout(maybeTransition);
    if (next && !isModifierKey(e)) maybeTransition = setTimeout(function() {
      if (getKeyMap(cm.options.keyMap) == startMap) {
        cm.options.keyMap = (next.call ? next.call(null, cm) : next);
        keyMapChanged(cm);
      }
    }, 50);

    var name = keyName(e, true), handled = false;
    if (!name) return false;
    var keymaps = allKeyMaps(cm);

    if (e.shiftKey) {
      // First try to resolve full name (including 'Shift-'). Failing
      // that, see if there is a cursor-motion command (starting with
      // 'go') bound to the keyname without 'Shift-'.
      handled = lookupKey("Shift-" + name, keymaps, function(b) {return doHandleBinding(cm, b, true);})
             || lookupKey(name, keymaps, function(b) {
                  if (typeof b == "string" ? /^go[A-Z]/.test(b) : b.motion)
                    return doHandleBinding(cm, b);
                });
    } else {
      handled = lookupKey(name, keymaps, function(b) { return doHandleBinding(cm, b); });
    }

    if (handled) {
      e_preventDefault(e);
      restartBlink(cm);
      signalLater(cm, "keyHandled", cm, name, e);
    }
    return handled;
  }

  // Handle a key from the keypress event
  function handleCharBinding(cm, e, ch) {
    var handled = lookupKey("'" + ch + "'", allKeyMaps(cm),
                            function(b) { return doHandleBinding(cm, b, true); });
    if (handled) {
      e_preventDefault(e);
      restartBlink(cm);
      signalLater(cm, "keyHandled", cm, "'" + ch + "'", e);
    }
    return handled;
  }

  var lastStoppedKey = null;
  function onKeyDown(e) {
    var cm = this;
    ensureFocus(cm);
    if (signalDOMEvent(cm, e)) return;
    // IE does strange things with escape.
    if (ie_upto10 && e.keyCode == 27) e.returnValue = false;
    var code = e.keyCode;
    cm.display.shift = code == 16 || e.shiftKey;
    var handled = handleKeyBinding(cm, e);
    if (presto) {
      lastStoppedKey = handled ? code : null;
      // Opera has no cut event... we try to at least catch the key combo
      if (!handled && code == 88 && !hasCopyEvent && (mac ? e.metaKey : e.ctrlKey))
        cm.replaceSelection("", null, "cut");
    }

    // Turn mouse into crosshair when Alt is held on Mac.
    if (code == 18 && !/\bCodeMirror-crosshair\b/.test(cm.display.lineDiv.className))
      showCrossHair(cm);
  }

  function showCrossHair(cm) {
    var lineDiv = cm.display.lineDiv;
    addClass(lineDiv, "CodeMirror-crosshair");

    function up(e) {
      if (e.keyCode == 18 || !e.altKey) {
        rmClass(lineDiv, "CodeMirror-crosshair");
        off(document, "keyup", up);
        off(document, "mouseover", up);
      }
    }
    on(document, "keyup", up);
    on(document, "mouseover", up);
  }

  function onKeyUp(e) {
    if (signalDOMEvent(this, e)) return;
    if (e.keyCode == 16) this.doc.sel.shift = false;
  }

  function onKeyPress(e) {
    var cm = this;
    if (signalDOMEvent(cm, e)) return;
    var keyCode = e.keyCode, charCode = e.charCode;
    if (presto && keyCode == lastStoppedKey) {lastStoppedKey = null; e_preventDefault(e); return;}
    if (((presto && (!e.which || e.which < 10)) || khtml) && handleKeyBinding(cm, e)) return;
    var ch = String.fromCharCode(charCode == null ? keyCode : charCode);
    if (handleCharBinding(cm, e, ch)) return;
    if (ie && !ie_upto8) cm.display.inputHasSelection = null;
    fastPoll(cm);
  }

  // FOCUS/BLUR EVENTS

  function onFocus(cm) {
    if (cm.options.readOnly == "nocursor") return;
    if (!cm.state.focused) {
      signal(cm, "focus", cm);
      cm.state.focused = true;
      addClass(cm.display.wrapper, "CodeMirror-focused");
      // The prevInput test prevents this from firing when a context
      // menu is closed (since the resetInput would kill the
      // select-all detection hack)
      if (!cm.curOp && cm.display.selForContextMenu != cm.doc.sel) {
        resetInput(cm);
        if (webkit) setTimeout(bind(resetInput, cm, true), 0); // Issue #1730
      }
    }
    slowPoll(cm);
    restartBlink(cm);
  }
  function onBlur(cm) {
    if (cm.state.focused) {
      signal(cm, "blur", cm);
      cm.state.focused = false;
      rmClass(cm.display.wrapper, "CodeMirror-focused");
    }
    clearInterval(cm.display.blinker);
    setTimeout(function() {if (!cm.state.focused) cm.display.shift = false;}, 150);
  }

  // CONTEXT MENU HANDLING

  // To make the context menu work, we need to briefly unhide the
  // textarea (making it as unobtrusive as possible) to let the
  // right-click take effect on it.
  function onContextMenu(cm, e) {
    if (signalDOMEvent(cm, e, "contextmenu")) return;
    var display = cm.display;
    if (eventInWidget(display, e) || contextMenuInGutter(cm, e)) return;

    var pos = posFromMouse(cm, e), scrollPos = display.scroller.scrollTop;
    if (!pos || presto) return; // Opera is difficult.

    // Reset the current text selection only if the click is done outside of the selection
    // and 'resetSelectionOnContextMenu' option is true.
    var reset = cm.options.resetSelectionOnContextMenu;
    if (reset && cm.doc.sel.contains(pos) == -1)
      operation(cm, setSelection)(cm.doc, simpleSelection(pos), sel_dontScroll);

    var oldCSS = display.input.style.cssText;
    display.inputDiv.style.position = "absolute";
    display.input.style.cssText = "position: fixed; width: 30px; height: 30px; top: " + (e.clientY - 5) +
      "px; left: " + (e.clientX - 5) + "px; z-index: 1000; background: " +
      (ie ? "rgba(255, 255, 255, .05)" : "transparent") +
      "; outline: none; border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);";
    focusInput(cm);
    resetInput(cm);
    // Adds "Select all" to context menu in FF
    if (!cm.somethingSelected()) display.input.value = display.prevInput = " ";
    display.selForContextMenu = cm.doc.sel;
    clearTimeout(display.detectingSelectAll);

    // Select-all will be greyed out if there's nothing to select, so
    // this adds a zero-width space so that we can later check whether
    // it got selected.
    function prepareSelectAllHack() {
      if (display.input.selectionStart != null) {
        var selected = cm.somethingSelected();
        var extval = display.input.value = "\u200b" + (selected ? display.input.value : "");
        display.prevInput = selected ? "" : "\u200b";
        display.input.selectionStart = 1; display.input.selectionEnd = extval.length;
        // Re-set this, in case some other handler touched the
        // selection in the meantime.
        display.selForContextMenu = cm.doc.sel;
      }
    }
    function rehide() {
      display.inputDiv.style.position = "relative";
      display.input.style.cssText = oldCSS;
      if (ie_upto8) display.scrollbarV.scrollTop = display.scroller.scrollTop = scrollPos;
      slowPoll(cm);

      // Try to detect the user choosing select-all
      if (display.input.selectionStart != null) {
        if (!ie || ie_upto8) prepareSelectAllHack();
        var i = 0, poll = function() {
          if (display.selForContextMenu == cm.doc.sel && display.input.selectionStart == 0)
            operation(cm, commands.selectAll)(cm);
          else if (i++ < 10) display.detectingSelectAll = setTimeout(poll, 500);
          else resetInput(cm);
        };
        display.detectingSelectAll = setTimeout(poll, 200);
      }
    }

    if (ie && !ie_upto8) prepareSelectAllHack();
    if (captureRightClick) {
      e_stop(e);
      var mouseup = function() {
        off(window, "mouseup", mouseup);
        setTimeout(rehide, 20);
      };
      on(window, "mouseup", mouseup);
    } else {
      setTimeout(rehide, 50);
    }
  }

  function contextMenuInGutter(cm, e) {
    if (!hasHandler(cm, "gutterContextMenu")) return false;
    return gutterEvent(cm, e, "gutterContextMenu", false, signal);
  }

  // UPDATING

  // Compute the position of the end of a change (its 'to' property
  // refers to the pre-change end).
  var changeEnd = CodeMirror.changeEnd = function(change) {
    if (!change.text) return change.to;
    return Pos(change.from.line + change.text.length - 1,
               lst(change.text).length + (change.text.length == 1 ? change.from.ch : 0));
  };

  // Adjust a position to refer to the post-change position of the
  // same text, or the end of the change if the change covers it.
  function adjustForChange(pos, change) {
    if (cmp(pos, change.from) < 0) return pos;
    if (cmp(pos, change.to) <= 0) return changeEnd(change);

    var line = pos.line + change.text.length - (change.to.line - change.from.line) - 1, ch = pos.ch;
    if (pos.line == change.to.line) ch += changeEnd(change).ch - change.to.ch;
    return Pos(line, ch);
  }

  function computeSelAfterChange(doc, change) {
    var out = [];
    for (var i = 0; i < doc.sel.ranges.length; i++) {
      var range = doc.sel.ranges[i];
      out.push(new Range(adjustForChange(range.anchor, change),
                         adjustForChange(range.head, change)));
    }
    return normalizeSelection(out, doc.sel.primIndex);
  }

  function offsetPos(pos, old, nw) {
    if (pos.line == old.line)
      return Pos(nw.line, pos.ch - old.ch + nw.ch);
    else
      return Pos(nw.line + (pos.line - old.line), pos.ch);
  }

  // Used by replaceSelections to allow moving the selection to the
  // start or around the replaced test. Hint may be "start" or "around".
  function computeReplacedSel(doc, changes, hint) {
    var out = [];
    var oldPrev = Pos(doc.first, 0), newPrev = oldPrev;
    for (var i = 0; i < changes.length; i++) {
      var change = changes[i];
      var from = offsetPos(change.from, oldPrev, newPrev);
      var to = offsetPos(changeEnd(change), oldPrev, newPrev);
      oldPrev = change.to;
      newPrev = to;
      if (hint == "around") {
        var range = doc.sel.ranges[i], inv = cmp(range.head, range.anchor) < 0;
        out[i] = new Range(inv ? to : from, inv ? from : to);
      } else {
        out[i] = new Range(from, from);
      }
    }
    return new Selection(out, doc.sel.primIndex);
  }

  // Allow "beforeChange" event handlers to influence a change
  function filterChange(doc, change, update) {
    var obj = {
      canceled: false,
      from: change.from,
      to: change.to,
      text: change.text,
      origin: change.origin,
      cancel: function() { this.canceled = true; }
    };
    if (update) obj.update = function(from, to, text, origin) {
      if (from) this.from = clipPos(doc, from);
      if (to) this.to = clipPos(doc, to);
      if (text) this.text = text;
      if (origin !== undefined) this.origin = origin;
    };
    signal(doc, "beforeChange", doc, obj);
    if (doc.cm) signal(doc.cm, "beforeChange", doc.cm, obj);

    if (obj.canceled) return null;
    return {from: obj.from, to: obj.to, text: obj.text, origin: obj.origin};
  }

  // Apply a change to a document, and add it to the document's
  // history, and propagating it to all linked documents.
  function makeChange(doc, change, ignoreReadOnly) {
    if (doc.cm) {
      if (!doc.cm.curOp) return operation(doc.cm, makeChange)(doc, change, ignoreReadOnly);
      if (doc.cm.state.suppressEdits) return;
    }

    if (hasHandler(doc, "beforeChange") || doc.cm && hasHandler(doc.cm, "beforeChange")) {
      change = filterChange(doc, change, true);
      if (!change) return;
    }

    // Possibly split or suppress the update based on the presence
    // of read-only spans in its range.
    var split = sawReadOnlySpans && !ignoreReadOnly && removeReadOnlyRanges(doc, change.from, change.to);
    if (split) {
      for (var i = split.length - 1; i >= 0; --i)
        makeChangeInner(doc, {from: split[i].from, to: split[i].to, text: i ? [""] : change.text});
    } else {
      makeChangeInner(doc, change);
    }
  }

  function makeChangeInner(doc, change) {
    if (change.text.length == 1 && change.text[0] == "" && cmp(change.from, change.to) == 0) return;
    var selAfter = computeSelAfterChange(doc, change);
    addChangeToHistory(doc, change, selAfter, doc.cm ? doc.cm.curOp.id : NaN);

    makeChangeSingleDoc(doc, change, selAfter, stretchSpansOverChange(doc, change));
    var rebased = [];

    linkedDocs(doc, function(doc, sharedHist) {
      if (!sharedHist && indexOf(rebased, doc.history) == -1) {
        rebaseHist(doc.history, change);
        rebased.push(doc.history);
      }
      makeChangeSingleDoc(doc, change, null, stretchSpansOverChange(doc, change));
    });
  }

  // Revert a change stored in a document's history.
  function makeChangeFromHistory(doc, type, allowSelectionOnly) {
    if (doc.cm && doc.cm.state.suppressEdits) return;

    var hist = doc.history, event, selAfter = doc.sel;
    var source = type == "undo" ? hist.done : hist.undone, dest = type == "undo" ? hist.undone : hist.done;

    // Verify that there is a useable event (so that ctrl-z won't
    // needlessly clear selection events)
    for (var i = 0; i < source.length; i++) {
      event = source[i];
      if (allowSelectionOnly ? event.ranges && !event.equals(doc.sel) : !event.ranges)
        break;
    }
    if (i == source.length) return;
    hist.lastOrigin = hist.lastSelOrigin = null;

    for (;;) {
      event = source.pop();
      if (event.ranges) {
        pushSelectionToHistory(event, dest);
        if (allowSelectionOnly && !event.equals(doc.sel)) {
          setSelection(doc, event, {clearRedo: false});
          return;
        }
        selAfter = event;
      }
      else break;
    }

    // Build up a reverse change object to add to the opposite history
    // stack (redo when undoing, and vice versa).
    var antiChanges = [];
    pushSelectionToHistory(selAfter, dest);
    dest.push({changes: antiChanges, generation: hist.generation});
    hist.generation = event.generation || ++hist.maxGeneration;

    var filter = hasHandler(doc, "beforeChange") || doc.cm && hasHandler(doc.cm, "beforeChange");

    for (var i = event.changes.length - 1; i >= 0; --i) {
      var change = event.changes[i];
      change.origin = type;
      if (filter && !filterChange(doc, change, false)) {
        source.length = 0;
        return;
      }

      antiChanges.push(historyChangeFromChange(doc, change));

      var after = i ? computeSelAfterChange(doc, change, null) : lst(source);
      makeChangeSingleDoc(doc, change, after, mergeOldSpans(doc, change));
      if (!i && doc.cm) doc.cm.scrollIntoView(change);
      var rebased = [];

      // Propagate to the linked documents
      linkedDocs(doc, function(doc, sharedHist) {
        if (!sharedHist && indexOf(rebased, doc.history) == -1) {
          rebaseHist(doc.history, change);
          rebased.push(doc.history);
        }
        makeChangeSingleDoc(doc, change, null, mergeOldSpans(doc, change));
      });
    }
  }

  // Sub-views need their line numbers shifted when text is added
  // above or below them in the parent document.
  function shiftDoc(doc, distance) {
    if (distance == 0) return;
    doc.first += distance;
    doc.sel = new Selection(map(doc.sel.ranges, function(range) {
      return new Range(Pos(range.anchor.line + distance, range.anchor.ch),
                       Pos(range.head.line + distance, range.head.ch));
    }), doc.sel.primIndex);
    if (doc.cm) {
      regChange(doc.cm, doc.first, doc.first - distance, distance);
      for (var d = doc.cm.display, l = d.viewFrom; l < d.viewTo; l++)
        regLineChange(doc.cm, l, "gutter");
    }
  }

  // More lower-level change function, handling only a single document
  // (not linked ones).
  function makeChangeSingleDoc(doc, change, selAfter, spans) {
    if (doc.cm && !doc.cm.curOp)
      return operation(doc.cm, makeChangeSingleDoc)(doc, change, selAfter, spans);

    if (change.to.line < doc.first) {
      shiftDoc(doc, change.text.length - 1 - (change.to.line - change.from.line));
      return;
    }
    if (change.from.line > doc.lastLine()) return;

    // Clip the change to the size of this doc
    if (change.from.line < doc.first) {
      var shift = change.text.length - 1 - (doc.first - change.from.line);
      shiftDoc(doc, shift);
      change = {from: Pos(doc.first, 0), to: Pos(change.to.line + shift, change.to.ch),
                text: [lst(change.text)], origin: change.origin};
    }
    var last = doc.lastLine();
    if (change.to.line > last) {
      change = {from: change.from, to: Pos(last, getLine(doc, last).text.length),
                text: [change.text[0]], origin: change.origin};
    }

    change.removed = getBetween(doc, change.from, change.to);

    if (!selAfter) selAfter = computeSelAfterChange(doc, change, null);
    if (doc.cm) makeChangeSingleDocInEditor(doc.cm, change, spans);
    else updateDoc(doc, change, spans);
    setSelectionNoUndo(doc, selAfter, sel_dontScroll);
  }

  // Handle the interaction of a change to a document with the editor
  // that this document is part of.
  function makeChangeSingleDocInEditor(cm, change, spans) {
    var doc = cm.doc, display = cm.display, from = change.from, to = change.to;

    var recomputeMaxLength = false, checkWidthStart = from.line;
    if (!cm.options.lineWrapping) {
      checkWidthStart = lineNo(visualLine(getLine(doc, from.line)));
      doc.iter(checkWidthStart, to.line + 1, function(line) {
        if (line == display.maxLine) {
          recomputeMaxLength = true;
          return true;
        }
      });
    }

    if (doc.sel.contains(change.from, change.to) > -1)
      signalCursorActivity(cm);

    updateDoc(doc, change, spans, estimateHeight(cm));

    if (!cm.options.lineWrapping) {
      doc.iter(checkWidthStart, from.line + change.text.length, function(line) {
        var len = lineLength(line);
        if (len > display.maxLineLength) {
          display.maxLine = line;
          display.maxLineLength = len;
          display.maxLineChanged = true;
          recomputeMaxLength = false;
        }
      });
      if (recomputeMaxLength) cm.curOp.updateMaxLine = true;
    }

    // Adjust frontier, schedule worker
    doc.frontier = Math.min(doc.frontier, from.line);
    startWorker(cm, 400);

    var lendiff = change.text.length - (to.line - from.line) - 1;
    // Remember that these lines changed, for updating the display
    if (from.line == to.line && change.text.length == 1 && !isWholeLineUpdate(cm.doc, change))
      regLineChange(cm, from.line, "text");
    else
      regChange(cm, from.line, to.line + 1, lendiff);

    var changesHandler = hasHandler(cm, "changes"), changeHandler = hasHandler(cm, "change");
    if (changeHandler || changesHandler) {
      var obj = {
        from: from, to: to,
        text: change.text,
        removed: change.removed,
        origin: change.origin
      };
      if (changeHandler) signalLater(cm, "change", cm, obj);
      if (changesHandler) (cm.curOp.changeObjs || (cm.curOp.changeObjs = [])).push(obj);
    }
    cm.display.selForContextMenu = null;
  }

  function replaceRange(doc, code, from, to, origin) {
    if (!to) to = from;
    if (cmp(to, from) < 0) { var tmp = to; to = from; from = tmp; }
    if (typeof code == "string") code = splitLines(code);
    makeChange(doc, {from: from, to: to, text: code, origin: origin});
  }

  // SCROLLING THINGS INTO VIEW

  // If an editor sits on the top or bottom of the window, partially
  // scrolled out of view, this ensures that the cursor is visible.
  function maybeScrollWindow(cm, coords) {
    var display = cm.display, box = display.sizer.getBoundingClientRect(), doScroll = null;
    if (coords.top + box.top < 0) doScroll = true;
    else if (coords.bottom + box.top > (window.innerHeight || document.documentElement.clientHeight)) doScroll = false;
    if (doScroll != null && !phantom) {
      var scrollNode = elt("div", "\u200b", null, "position: absolute; top: " +
                           (coords.top - display.viewOffset - paddingTop(cm.display)) + "px; height: " +
                           (coords.bottom - coords.top + scrollerCutOff) + "px; left: " +
                           coords.left + "px; width: 2px;");
      cm.display.lineSpace.appendChild(scrollNode);
      scrollNode.scrollIntoView(doScroll);
      cm.display.lineSpace.removeChild(scrollNode);
    }
  }

  // Scroll a given position into view (immediately), verifying that
  // it actually became visible (as line heights are accurately
  // measured, the position of something may 'drift' during drawing).
  function scrollPosIntoView(cm, pos, end, margin) {
    if (margin == null) margin = 0;
    for (;;) {
      var changed = false, coords = cursorCoords(cm, pos);
      var endCoords = !end || end == pos ? coords : cursorCoords(cm, end);
      var scrollPos = calculateScrollPos(cm, Math.min(coords.left, endCoords.left),
                                         Math.min(coords.top, endCoords.top) - margin,
                                         Math.max(coords.left, endCoords.left),
                                         Math.max(coords.bottom, endCoords.bottom) + margin);
      var startTop = cm.doc.scrollTop, startLeft = cm.doc.scrollLeft;
      if (scrollPos.scrollTop != null) {
        setScrollTop(cm, scrollPos.scrollTop);
        if (Math.abs(cm.doc.scrollTop - startTop) > 1) changed = true;
      }
      if (scrollPos.scrollLeft != null) {
        setScrollLeft(cm, scrollPos.scrollLeft);
        if (Math.abs(cm.doc.scrollLeft - startLeft) > 1) changed = true;
      }
      if (!changed) return coords;
    }
  }

  // Scroll a given set of coordinates into view (immediately).
  function scrollIntoView(cm, x1, y1, x2, y2) {
    var scrollPos = calculateScrollPos(cm, x1, y1, x2, y2);
    if (scrollPos.scrollTop != null) setScrollTop(cm, scrollPos.scrollTop);
    if (scrollPos.scrollLeft != null) setScrollLeft(cm, scrollPos.scrollLeft);
  }

  // Calculate a new scroll position needed to scroll the given
  // rectangle into view. Returns an object with scrollTop and
  // scrollLeft properties. When these are undefined, the
  // vertical/horizontal position does not need to be adjusted.
  function calculateScrollPos(cm, x1, y1, x2, y2) {
    var display = cm.display, snapMargin = textHeight(cm.display);
    if (y1 < 0) y1 = 0;
    var screentop = cm.curOp && cm.curOp.scrollTop != null ? cm.curOp.scrollTop : display.scroller.scrollTop;
    var screen = display.scroller.clientHeight - scrollerCutOff, result = {};
    var docBottom = cm.doc.height + paddingVert(display);
    var atTop = y1 < snapMargin, atBottom = y2 > docBottom - snapMargin;
    if (y1 < screentop) {
      result.scrollTop = atTop ? 0 : y1;
    } else if (y2 > screentop + screen) {
      var newTop = Math.min(y1, (atBottom ? docBottom : y2) - screen);
      if (newTop != screentop) result.scrollTop = newTop;
    }

    var screenleft = cm.curOp && cm.curOp.scrollLeft != null ? cm.curOp.scrollLeft : display.scroller.scrollLeft;
    var screenw = display.scroller.clientWidth - scrollerCutOff;
    x1 += display.gutters.offsetWidth; x2 += display.gutters.offsetWidth;
    var gutterw = display.gutters.offsetWidth;
    var atLeft = x1 < gutterw + 10;
    if (x1 < screenleft + gutterw || atLeft) {
      if (atLeft) x1 = 0;
      result.scrollLeft = Math.max(0, x1 - 10 - gutterw);
    } else if (x2 > screenw + screenleft - 3) {
      result.scrollLeft = x2 + 10 - screenw;
    }
    return result;
  }

  // Store a relative adjustment to the scroll position in the current
  // operation (to be applied when the operation finishes).
  function addToScrollPos(cm, left, top) {
    if (left != null || top != null) resolveScrollToPos(cm);
    if (left != null)
      cm.curOp.scrollLeft = (cm.curOp.scrollLeft == null ? cm.doc.scrollLeft : cm.curOp.scrollLeft) + left;
    if (top != null)
      cm.curOp.scrollTop = (cm.curOp.scrollTop == null ? cm.doc.scrollTop : cm.curOp.scrollTop) + top;
  }

  // Make sure that at the end of the operation the current cursor is
  // shown.
  function ensureCursorVisible(cm) {
    resolveScrollToPos(cm);
    var cur = cm.getCursor(), from = cur, to = cur;
    if (!cm.options.lineWrapping) {
      from = cur.ch ? Pos(cur.line, cur.ch - 1) : cur;
      to = Pos(cur.line, cur.ch + 1);
    }
    cm.curOp.scrollToPos = {from: from, to: to, margin: cm.options.cursorScrollMargin, isCursor: true};
  }

  // When an operation has its scrollToPos property set, and another
  // scroll action is applied before the end of the operation, this
  // 'simulates' scrolling that position into view in a cheap way, so
  // that the effect of intermediate scroll commands is not ignored.
  function resolveScrollToPos(cm) {
    var range = cm.curOp.scrollToPos;
    if (range) {
      cm.curOp.scrollToPos = null;
      var from = estimateCoords(cm, range.from), to = estimateCoords(cm, range.to);
      var sPos = calculateScrollPos(cm, Math.min(from.left, to.left),
                                    Math.min(from.top, to.top) - range.margin,
                                    Math.max(from.right, to.right),
                                    Math.max(from.bottom, to.bottom) + range.margin);
      cm.scrollTo(sPos.scrollLeft, sPos.scrollTop);
    }
  }

  // API UTILITIES

  // Indent the given line. The how parameter can be "smart",
  // "add"/null, "subtract", or "prev". When aggressive is false
  // (typically set to true for forced single-line indents), empty
  // lines are not indented, and places where the mode returns Pass
  // are left alone.
  function indentLine(cm, n, how, aggressive) {
    var doc = cm.doc, state;
    if (how == null) how = "add";
    if (how == "smart") {
      // Fall back to "prev" when the mode doesn't have an indentation
      // method.
      if (!cm.doc.mode.indent) how = "prev";
      else state = getStateBefore(cm, n);
    }

    var tabSize = cm.options.tabSize;
    var line = getLine(doc, n), curSpace = countColumn(line.text, null, tabSize);
    if (line.stateAfter) line.stateAfter = null;
    var curSpaceString = line.text.match(/^\s*/)[0], indentation;
    if (!aggressive && !/\S/.test(line.text)) {
      indentation = 0;
      how = "not";
    } else if (how == "smart") {
      indentation = cm.doc.mode.indent(state, line.text.slice(curSpaceString.length), line.text);
      if (indentation == Pass) {
        if (!aggressive) return;
        how = "prev";
      }
    }
    if (how == "prev") {
      if (n > doc.first) indentation = countColumn(getLine(doc, n-1).text, null, tabSize);
      else indentation = 0;
    } else if (how == "add") {
      indentation = curSpace + cm.options.indentUnit;
    } else if (how == "subtract") {
      indentation = curSpace - cm.options.indentUnit;
    } else if (typeof how == "number") {
      indentation = curSpace + how;
    }
    indentation = Math.max(0, indentation);

    var indentString = "", pos = 0;
    if (cm.options.indentWithTabs)
      for (var i = Math.floor(indentation / tabSize); i; --i) {pos += tabSize; indentString += "\t";}
    if (pos < indentation) indentString += spaceStr(indentation - pos);

    if (indentString != curSpaceString) {
      replaceRange(cm.doc, indentString, Pos(n, 0), Pos(n, curSpaceString.length), "+input");
    } else {
      // Ensure that, if the cursor was in the whitespace at the start
      // of the line, it is moved to the end of that space.
      for (var i = 0; i < doc.sel.ranges.length; i++) {
        var range = doc.sel.ranges[i];
        if (range.head.line == n && range.head.ch < curSpaceString.length) {
          var pos = Pos(n, curSpaceString.length);
          replaceOneSelection(doc, i, new Range(pos, pos));
          break;
        }
      }
    }
    line.stateAfter = null;
  }

  // Utility for applying a change to a line by handle or number,
  // returning the number and optionally registering the line as
  // changed.
  function changeLine(cm, handle, changeType, op) {
    var no = handle, line = handle, doc = cm.doc;
    if (typeof handle == "number") line = getLine(doc, clipLine(doc, handle));
    else no = lineNo(handle);
    if (no == null) return null;
    if (op(line, no)) regLineChange(cm, no, changeType);
    return line;
  }

  // Helper for deleting text near the selection(s), used to implement
  // backspace, delete, and similar functionality.
  function deleteNearSelection(cm, compute) {
    var ranges = cm.doc.sel.ranges, kill = [];
    // Build up a set of ranges to kill first, merging overlapping
    // ranges.
    for (var i = 0; i < ranges.length; i++) {
      var toKill = compute(ranges[i]);
      while (kill.length && cmp(toKill.from, lst(kill).to) <= 0) {
        var replaced = kill.pop();
        if (cmp(replaced.from, toKill.from) < 0) {
          toKill.from = replaced.from;
          break;
        }
      }
      kill.push(toKill);
    }
    // Next, remove those actual ranges.
    runInOp(cm, function() {
      for (var i = kill.length - 1; i >= 0; i--)
        replaceRange(cm.doc, "", kill[i].from, kill[i].to, "+delete");
      ensureCursorVisible(cm);
    });
  }

  // Used for horizontal relative motion. Dir is -1 or 1 (left or
  // right), unit can be "char", "column" (like char, but doesn't
  // cross line boundaries), "word" (across next word), or "group" (to
  // the start of next group of word or non-word-non-whitespace
  // chars). The visually param controls whether, in right-to-left
  // text, direction 1 means to move towards the next index in the
  // string, or towards the character to the right of the current
  // position. The resulting position will have a hitSide=true
  // property if it reached the end of the document.
  function findPosH(doc, pos, dir, unit, visually) {
    var line = pos.line, ch = pos.ch, origDir = dir;
    var lineObj = getLine(doc, line);
    var possible = true;
    function findNextLine() {
      var l = line + dir;
      if (l < doc.first || l >= doc.first + doc.size) return (possible = false);
      line = l;
      return lineObj = getLine(doc, l);
    }
    function moveOnce(boundToLine) {
      var next = (visually ? moveVisually : moveLogically)(lineObj, ch, dir, true);
      if (next == null) {
        if (!boundToLine && findNextLine()) {
          if (visually) ch = (dir < 0 ? lineRight : lineLeft)(lineObj);
          else ch = dir < 0 ? lineObj.text.length : 0;
        } else return (possible = false);
      } else ch = next;
      return true;
    }

    if (unit == "char") moveOnce();
    else if (unit == "column") moveOnce(true);
    else if (unit == "word" || unit == "group") {
      var sawType = null, group = unit == "group";
      var helper = doc.cm && doc.cm.getHelper(pos, "wordChars");
      for (var first = true;; first = false) {
        if (dir < 0 && !moveOnce(!first)) break;
        var cur = lineObj.text.charAt(ch) || "\n";
        var type = isWordChar(cur, helper) ? "w"
          : group && cur == "\n" ? "n"
          : !group || /\s/.test(cur) ? null
          : "p";
        if (group && !first && !type) type = "s";
        if (sawType && sawType != type) {
          if (dir < 0) {dir = 1; moveOnce();}
          break;
        }

        if (type) sawType = type;
        if (dir > 0 && !moveOnce(!first)) break;
      }
    }
    var result = skipAtomic(doc, Pos(line, ch), origDir, true);
    if (!possible) result.hitSide = true;
    return result;
  }

  // For relative vertical movement. Dir may be -1 or 1. Unit can be
  // "page" or "line". The resulting position will have a hitSide=true
  // property if it reached the end of the document.
  function findPosV(cm, pos, dir, unit) {
    var doc = cm.doc, x = pos.left, y;
    if (unit == "page") {
      var pageSize = Math.min(cm.display.wrapper.clientHeight, window.innerHeight || document.documentElement.clientHeight);
      y = pos.top + dir * (pageSize - (dir < 0 ? 1.5 : .5) * textHeight(cm.display));
    } else if (unit == "line") {
      y = dir > 0 ? pos.bottom + 3 : pos.top - 3;
    }
    for (;;) {
      var target = coordsChar(cm, x, y);
      if (!target.outside) break;
      if (dir < 0 ? y <= 0 : y >= doc.height) { target.hitSide = true; break; }
      y += dir * 5;
    }
    return target;
  }

  // Find the word at the given position (as returned by coordsChar).
  function findWordAt(cm, pos) {
    var doc = cm.doc, line = getLine(doc, pos.line).text;
    var start = pos.ch, end = pos.ch;
    if (line) {
      var helper = cm.getHelper(pos, "wordChars");
      if ((pos.xRel < 0 || end == line.length) && start) --start; else ++end;
      var startChar = line.charAt(start);
      var check = isWordChar(startChar, helper)
        ? function(ch) { return isWordChar(ch, helper); }
        : /\s/.test(startChar) ? function(ch) {return /\s/.test(ch);}
        : function(ch) {return !/\s/.test(ch) && !isWordChar(ch);};
      while (start > 0 && check(line.charAt(start - 1))) --start;
      while (end < line.length && check(line.charAt(end))) ++end;
    }
    return new Range(Pos(pos.line, start), Pos(pos.line, end));
  }

  // EDITOR METHODS

  // The publicly visible API. Note that methodOp(f) means
  // 'wrap f in an operation, performed on its `this` parameter'.

  // This is not the complete set of editor methods. Most of the
  // methods defined on the Doc type are also injected into
  // CodeMirror.prototype, for backwards compatibility and
  // convenience.

  CodeMirror.prototype = {
    constructor: CodeMirror,
    focus: function(){window.focus(); focusInput(this); fastPoll(this);},

    setOption: function(option, value) {
      var options = this.options, old = options[option];
      if (options[option] == value && option != "mode") return;
      options[option] = value;
      if (optionHandlers.hasOwnProperty(option))
        operation(this, optionHandlers[option])(this, value, old);
    },

    getOption: function(option) {return this.options[option];},
    getDoc: function() {return this.doc;},

    addKeyMap: function(map, bottom) {
      this.state.keyMaps[bottom ? "push" : "unshift"](map);
    },
    removeKeyMap: function(map) {
      var maps = this.state.keyMaps;
      for (var i = 0; i < maps.length; ++i)
        if (maps[i] == map || (typeof maps[i] != "string" && maps[i].name == map)) {
          maps.splice(i, 1);
          return true;
        }
    },

    addOverlay: methodOp(function(spec, options) {
      var mode = spec.token ? spec : CodeMirror.getMode(this.options, spec);
      if (mode.startState) throw new Error("Overlays may not be stateful.");
      this.state.overlays.push({mode: mode, modeSpec: spec, opaque: options && options.opaque});
      this.state.modeGen++;
      regChange(this);
    }),
    removeOverlay: methodOp(function(spec) {
      var overlays = this.state.overlays;
      for (var i = 0; i < overlays.length; ++i) {
        var cur = overlays[i].modeSpec;
        if (cur == spec || typeof spec == "string" && cur.name == spec) {
          overlays.splice(i, 1);
          this.state.modeGen++;
          regChange(this);
          return;
        }
      }
    }),

    indentLine: methodOp(function(n, dir, aggressive) {
      if (typeof dir != "string" && typeof dir != "number") {
        if (dir == null) dir = this.options.smartIndent ? "smart" : "prev";
        else dir = dir ? "add" : "subtract";
      }
      if (isLine(this.doc, n)) indentLine(this, n, dir, aggressive);
    }),
    indentSelection: methodOp(function(how) {
      var ranges = this.doc.sel.ranges, end = -1;
      for (var i = 0; i < ranges.length; i++) {
        var range = ranges[i];
        if (!range.empty()) {
          var start = Math.max(end, range.from().line);
          var to = range.to();
          end = Math.min(this.lastLine(), to.line - (to.ch ? 0 : 1)) + 1;
          for (var j = start; j < end; ++j)
            indentLine(this, j, how);
        } else if (range.head.line > end) {
          indentLine(this, range.head.line, how, true);
          end = range.head.line;
          if (i == this.doc.sel.primIndex) ensureCursorVisible(this);
        }
      }
    }),

    // Fetch the parser token for a given character. Useful for hacks
    // that want to inspect the mode state (say, for completion).
    getTokenAt: function(pos, precise) {
      var doc = this.doc;
      pos = clipPos(doc, pos);
      var state = getStateBefore(this, pos.line, precise), mode = this.doc.mode;
      var line = getLine(doc, pos.line);
      var stream = new StringStream(line.text, this.options.tabSize);
      while (stream.pos < pos.ch && !stream.eol()) {
        stream.start = stream.pos;
        var style = readToken(mode, stream, state);
      }
      return {start: stream.start,
              end: stream.pos,
              string: stream.current(),
              type: style || null,
              state: state};
    },

    getTokenTypeAt: function(pos) {
      pos = clipPos(this.doc, pos);
      var styles = getLineStyles(this, getLine(this.doc, pos.line));
      var before = 0, after = (styles.length - 1) / 2, ch = pos.ch;
      var type;
      if (ch == 0) type = styles[2];
      else for (;;) {
        var mid = (before + after) >> 1;
        if ((mid ? styles[mid * 2 - 1] : 0) >= ch) after = mid;
        else if (styles[mid * 2 + 1] < ch) before = mid + 1;
        else { type = styles[mid * 2 + 2]; break; }
      }
      var cut = type ? type.indexOf("cm-overlay ") : -1;
      return cut < 0 ? type : cut == 0 ? null : type.slice(0, cut - 1);
    },

    getModeAt: function(pos) {
      var mode = this.doc.mode;
      if (!mode.innerMode) return mode;
      return CodeMirror.innerMode(mode, this.getTokenAt(pos).state).mode;
    },

    getHelper: function(pos, type) {
      return this.getHelpers(pos, type)[0];
    },

    getHelpers: function(pos, type) {
      var found = [];
      if (!helpers.hasOwnProperty(type)) return helpers;
      var help = helpers[type], mode = this.getModeAt(pos);
      if (typeof mode[type] == "string") {
        if (help[mode[type]]) found.push(help[mode[type]]);
      } else if (mode[type]) {
        for (var i = 0; i < mode[type].length; i++) {
          var val = help[mode[type][i]];
          if (val) found.push(val);
        }
      } else if (mode.helperType && help[mode.helperType]) {
        found.push(help[mode.helperType]);
      } else if (help[mode.name]) {
        found.push(help[mode.name]);
      }
      for (var i = 0; i < help._global.length; i++) {
        var cur = help._global[i];
        if (cur.pred(mode, this) && indexOf(found, cur.val) == -1)
          found.push(cur.val);
      }
      return found;
    },

    getStateAfter: function(line, precise) {
      var doc = this.doc;
      line = clipLine(doc, line == null ? doc.first + doc.size - 1: line);
      return getStateBefore(this, line + 1, precise);
    },

    cursorCoords: function(start, mode) {
      var pos, range = this.doc.sel.primary();
      if (start == null) pos = range.head;
      else if (typeof start == "object") pos = clipPos(this.doc, start);
      else pos = start ? range.from() : range.to();
      return cursorCoords(this, pos, mode || "page");
    },

    charCoords: function(pos, mode) {
      return charCoords(this, clipPos(this.doc, pos), mode || "page");
    },

    coordsChar: function(coords, mode) {
      coords = fromCoordSystem(this, coords, mode || "page");
      return coordsChar(this, coords.left, coords.top);
    },

    lineAtHeight: function(height, mode) {
      height = fromCoordSystem(this, {top: height, left: 0}, mode || "page").top;
      return lineAtHeight(this.doc, height + this.display.viewOffset);
    },
    heightAtLine: function(line, mode) {
      var end = false, last = this.doc.first + this.doc.size - 1;
      if (line < this.doc.first) line = this.doc.first;
      else if (line > last) { line = last; end = true; }
      var lineObj = getLine(this.doc, line);
      return intoCoordSystem(this, lineObj, {top: 0, left: 0}, mode || "page").top +
        (end ? this.doc.height - heightAtLine(lineObj) : 0);
    },

    defaultTextHeight: function() { return textHeight(this.display); },
    defaultCharWidth: function() { return charWidth(this.display); },

    setGutterMarker: methodOp(function(line, gutterID, value) {
      return changeLine(this, line, "gutter", function(line) {
        var markers = line.gutterMarkers || (line.gutterMarkers = {});
        markers[gutterID] = value;
        if (!value && isEmpty(markers)) line.gutterMarkers = null;
        return true;
      });
    }),

    clearGutter: methodOp(function(gutterID) {
      var cm = this, doc = cm.doc, i = doc.first;
      doc.iter(function(line) {
        if (line.gutterMarkers && line.gutterMarkers[gutterID]) {
          line.gutterMarkers[gutterID] = null;
          regLineChange(cm, i, "gutter");
          if (isEmpty(line.gutterMarkers)) line.gutterMarkers = null;
        }
        ++i;
      });
    }),

    addLineClass: methodOp(function(handle, where, cls) {
      return changeLine(this, handle, "class", function(line) {
        var prop = where == "text" ? "textClass" : where == "background" ? "bgClass" : "wrapClass";
        if (!line[prop]) line[prop] = cls;
        else if (new RegExp("(?:^|\\s)" + cls + "(?:$|\\s)").test(line[prop])) return false;
        else line[prop] += " " + cls;
        return true;
      });
    }),

    removeLineClass: methodOp(function(handle, where, cls) {
      return changeLine(this, handle, "class", function(line) {
        var prop = where == "text" ? "textClass" : where == "background" ? "bgClass" : "wrapClass";
        var cur = line[prop];
        if (!cur) return false;
        else if (cls == null) line[prop] = null;
        else {
          var found = cur.match(new RegExp("(?:^|\\s+)" + cls + "(?:$|\\s+)"));
          if (!found) return false;
          var end = found.index + found[0].length;
          line[prop] = cur.slice(0, found.index) + (!found.index || end == cur.length ? "" : " ") + cur.slice(end) || null;
        }
        return true;
      });
    }),

    addLineWidget: methodOp(function(handle, node, options) {
      return addLineWidget(this, handle, node, options);
    }),

    removeLineWidget: function(widget) { widget.clear(); },

    lineInfo: function(line) {
      if (typeof line == "number") {
        if (!isLine(this.doc, line)) return null;
        var n = line;
        line = getLine(this.doc, line);
        if (!line) return null;
      } else {
        var n = lineNo(line);
        if (n == null) return null;
      }
      return {line: n, handle: line, text: line.text, gutterMarkers: line.gutterMarkers,
              textClass: line.textClass, bgClass: line.bgClass, wrapClass: line.wrapClass,
              widgets: line.widgets};
    },

    getViewport: function() { return {from: this.display.viewFrom, to: this.display.viewTo};},

    addWidget: function(pos, node, scroll, vert, horiz) {
      var display = this.display;
      pos = cursorCoords(this, clipPos(this.doc, pos));
      var top = pos.bottom, left = pos.left;
      node.style.position = "absolute";
      display.sizer.appendChild(node);
      if (vert == "over") {
        top = pos.top;
      } else if (vert == "above" || vert == "near") {
        var vspace = Math.max(display.wrapper.clientHeight, this.doc.height),
        hspace = Math.max(display.sizer.clientWidth, display.lineSpace.clientWidth);
        // Default to positioning above (if specified and possible); otherwise default to positioning below
        if ((vert == 'above' || pos.bottom + node.offsetHeight > vspace) && pos.top > node.offsetHeight)
          top = pos.top - node.offsetHeight;
        else if (pos.bottom + node.offsetHeight <= vspace)
          top = pos.bottom;
        if (left + node.offsetWidth > hspace)
          left = hspace - node.offsetWidth;
      }
      node.style.top = top + "px";
      node.style.left = node.style.right = "";
      if (horiz == "right") {
        left = display.sizer.clientWidth - node.offsetWidth;
        node.style.right = "0px";
      } else {
        if (horiz == "left") left = 0;
        else if (horiz == "middle") left = (display.sizer.clientWidth - node.offsetWidth) / 2;
        node.style.left = left + "px";
      }
      if (scroll)
        scrollIntoView(this, left, top, left + node.offsetWidth, top + node.offsetHeight);
    },

    triggerOnKeyDown: methodOp(onKeyDown),
    triggerOnKeyPress: methodOp(onKeyPress),
    triggerOnKeyUp: methodOp(onKeyUp),

    execCommand: function(cmd) {
      if (commands.hasOwnProperty(cmd))
        return commands[cmd](this);
    },

    findPosH: function(from, amount, unit, visually) {
      var dir = 1;
      if (amount < 0) { dir = -1; amount = -amount; }
      for (var i = 0, cur = clipPos(this.doc, from); i < amount; ++i) {
        cur = findPosH(this.doc, cur, dir, unit, visually);
        if (cur.hitSide) break;
      }
      return cur;
    },

    moveH: methodOp(function(dir, unit) {
      var cm = this;
      cm.extendSelectionsBy(function(range) {
        if (cm.display.shift || cm.doc.extend || range.empty())
          return findPosH(cm.doc, range.head, dir, unit, cm.options.rtlMoveVisually);
        else
          return dir < 0 ? range.from() : range.to();
      }, sel_move);
    }),

    deleteH: methodOp(function(dir, unit) {
      var sel = this.doc.sel, doc = this.doc;
      if (sel.somethingSelected())
        doc.replaceSelection("", null, "+delete");
      else
        deleteNearSelection(this, function(range) {
          var other = findPosH(doc, range.head, dir, unit, false);
          return dir < 0 ? {from: other, to: range.head} : {from: range.head, to: other};
        });
    }),

    findPosV: function(from, amount, unit, goalColumn) {
      var dir = 1, x = goalColumn;
      if (amount < 0) { dir = -1; amount = -amount; }
      for (var i = 0, cur = clipPos(this.doc, from); i < amount; ++i) {
        var coords = cursorCoords(this, cur, "div");
        if (x == null) x = coords.left;
        else coords.left = x;
        cur = findPosV(this, coords, dir, unit);
        if (cur.hitSide) break;
      }
      return cur;
    },

    moveV: methodOp(function(dir, unit) {
      var cm = this, doc = this.doc, goals = [];
      var collapse = !cm.display.shift && !doc.extend && doc.sel.somethingSelected();
      doc.extendSelectionsBy(function(range) {
        if (collapse)
          return dir < 0 ? range.from() : range.to();
        var headPos = cursorCoords(cm, range.head, "div");
        if (range.goalColumn != null) headPos.left = range.goalColumn;
        goals.push(headPos.left);
        var pos = findPosV(cm, headPos, dir, unit);
        if (unit == "page" && range == doc.sel.primary())
          addToScrollPos(cm, null, charCoords(cm, pos, "div").top - headPos.top);
        return pos;
      }, sel_move);
      if (goals.length) for (var i = 0; i < doc.sel.ranges.length; i++)
        doc.sel.ranges[i].goalColumn = goals[i];
    }),

    toggleOverwrite: function(value) {
      if (value != null && value == this.state.overwrite) return;
      if (this.state.overwrite = !this.state.overwrite)
        addClass(this.display.cursorDiv, "CodeMirror-overwrite");
      else
        rmClass(this.display.cursorDiv, "CodeMirror-overwrite");

      signal(this, "overwriteToggle", this, this.state.overwrite);
    },
    hasFocus: function() { return activeElt() == this.display.input; },

    scrollTo: methodOp(function(x, y) {
      if (x != null || y != null) resolveScrollToPos(this);
      if (x != null) this.curOp.scrollLeft = x;
      if (y != null) this.curOp.scrollTop = y;
    }),
    getScrollInfo: function() {
      var scroller = this.display.scroller, co = scrollerCutOff;
      return {left: scroller.scrollLeft, top: scroller.scrollTop,
              height: scroller.scrollHeight - co, width: scroller.scrollWidth - co,
              clientHeight: scroller.clientHeight - co, clientWidth: scroller.clientWidth - co};
    },

    scrollIntoView: methodOp(function(range, margin) {
      if (range == null) {
        range = {from: this.doc.sel.primary().head, to: null};
        if (margin == null) margin = this.options.cursorScrollMargin;
      } else if (typeof range == "number") {
        range = {from: Pos(range, 0), to: null};
      } else if (range.from == null) {
        range = {from: range, to: null};
      }
      if (!range.to) range.to = range.from;
      range.margin = margin || 0;

      if (range.from.line != null) {
        resolveScrollToPos(this);
        this.curOp.scrollToPos = range;
      } else {
        var sPos = calculateScrollPos(this, Math.min(range.from.left, range.to.left),
                                      Math.min(range.from.top, range.to.top) - range.margin,
                                      Math.max(range.from.right, range.to.right),
                                      Math.max(range.from.bottom, range.to.bottom) + range.margin);
        this.scrollTo(sPos.scrollLeft, sPos.scrollTop);
      }
    }),

    setSize: methodOp(function(width, height) {
      function interpret(val) {
        return typeof val == "number" || /^\d+$/.test(String(val)) ? val + "px" : val;
      }
      if (width != null) this.display.wrapper.style.width = interpret(width);
      if (height != null) this.display.wrapper.style.height = interpret(height);
      if (this.options.lineWrapping) clearLineMeasurementCache(this);
      this.curOp.forceUpdate = true;
      signal(this, "refresh", this);
    }),

    operation: function(f){return runInOp(this, f);},

    refresh: methodOp(function() {
      var oldHeight = this.display.cachedTextHeight;
      regChange(this);
      this.curOp.forceUpdate = true;
      clearCaches(this);
      this.scrollTo(this.doc.scrollLeft, this.doc.scrollTop);
      updateGutterSpace(this);
      if (oldHeight == null || Math.abs(oldHeight - textHeight(this.display)) > .5)
        estimateLineHeights(this);
      signal(this, "refresh", this);
    }),

    swapDoc: methodOp(function(doc) {
      var old = this.doc;
      old.cm = null;
      attachDoc(this, doc);
      clearCaches(this);
      resetInput(this);
      this.scrollTo(doc.scrollLeft, doc.scrollTop);
      signalLater(this, "swapDoc", this, old);
      return old;
    }),

    getInputField: function(){return this.display.input;},
    getWrapperElement: function(){return this.display.wrapper;},
    getScrollerElement: function(){return this.display.scroller;},
    getGutterElement: function(){return this.display.gutters;}
  };
  eventMixin(CodeMirror);

  // OPTION DEFAULTS

  // The default configuration options.
  var defaults = CodeMirror.defaults = {};
  // Functions to run when options are changed.
  var optionHandlers = CodeMirror.optionHandlers = {};

  function option(name, deflt, handle, notOnInit) {
    CodeMirror.defaults[name] = deflt;
    if (handle) optionHandlers[name] =
      notOnInit ? function(cm, val, old) {if (old != Init) handle(cm, val, old);} : handle;
  }

  // Passed to option handlers when there is no old value.
  var Init = CodeMirror.Init = {toString: function(){return "CodeMirror.Init";}};

  // These two are, on init, called from the constructor because they
  // have to be initialized before the editor can start at all.
  option("value", "", function(cm, val) {
    cm.setValue(val);
  }, true);
  option("mode", null, function(cm, val) {
    cm.doc.modeOption = val;
    loadMode(cm);
  }, true);

  option("indentUnit", 2, loadMode, true);
  option("indentWithTabs", false);
  option("smartIndent", true);
  option("tabSize", 4, function(cm) {
    resetModeState(cm);
    clearCaches(cm);
    regChange(cm);
  }, true);
  option("specialChars", /[\t\u0000-\u0019\u00ad\u200b\u2028\u2029\ufeff]/g, function(cm, val) {
    cm.options.specialChars = new RegExp(val.source + (val.test("\t") ? "" : "|\t"), "g");
    cm.refresh();
  }, true);
  option("specialCharPlaceholder", defaultSpecialCharPlaceholder, function(cm) {cm.refresh();}, true);
  option("electricChars", true);
  option("rtlMoveVisually", !windows);
  option("wholeLineUpdateBefore", true);

  option("theme", "default", function(cm) {
    themeChanged(cm);
    guttersChanged(cm);
  }, true);
  option("keyMap", "default", keyMapChanged);
  option("extraKeys", null);

  option("lineWrapping", false, wrappingChanged, true);
  option("gutters", [], function(cm) {
    setGuttersForLineNumbers(cm.options);
    guttersChanged(cm);
  }, true);
  option("fixedGutter", true, function(cm, val) {
    cm.display.gutters.style.left = val ? compensateForHScroll(cm.display) + "px" : "0";
    cm.refresh();
  }, true);
  option("coverGutterNextToScrollbar", false, updateScrollbars, true);
  option("lineNumbers", false, function(cm) {
    setGuttersForLineNumbers(cm.options);
    guttersChanged(cm);
  }, true);
  option("firstLineNumber", 1, guttersChanged, true);
  option("lineNumberFormatter", function(integer) {return integer;}, guttersChanged, true);
  option("showCursorWhenSelecting", false, updateSelection, true);

  option("resetSelectionOnContextMenu", true);

  option("readOnly", false, function(cm, val) {
    if (val == "nocursor") {
      onBlur(cm);
      cm.display.input.blur();
      cm.display.disabled = true;
    } else {
      cm.display.disabled = false;
      if (!val) resetInput(cm);
    }
  });
  option("disableInput", false, function(cm, val) {if (!val) resetInput(cm);}, true);
  option("dragDrop", true);

  option("cursorBlinkRate", 530);
  option("cursorScrollMargin", 0);
  option("cursorHeight", 1);
  option("workTime", 100);
  option("workDelay", 100);
  option("flattenSpans", true, resetModeState, true);
  option("addModeClass", false, resetModeState, true);
  option("pollInterval", 100);
  option("undoDepth", 200, function(cm, val){cm.doc.history.undoDepth = val;});
  option("historyEventDelay", 1250);
  option("viewportMargin", 10, function(cm){cm.refresh();}, true);
  option("maxHighlightLength", 10000, resetModeState, true);
  option("moveInputWithCursor", true, function(cm, val) {
    if (!val) cm.display.inputDiv.style.top = cm.display.inputDiv.style.left = 0;
  });

  option("tabindex", null, function(cm, val) {
    cm.display.input.tabIndex = val || "";
  });
  option("autofocus", null);

  // MODE DEFINITION AND QUERYING

  // Known modes, by name and by MIME
  var modes = CodeMirror.modes = {}, mimeModes = CodeMirror.mimeModes = {};

  // Extra arguments are stored as the mode's dependencies, which is
  // used by (legacy) mechanisms like loadmode.js to automatically
  // load a mode. (Preferred mechanism is the require/define calls.)
  CodeMirror.defineMode = function(name, mode) {
    if (!CodeMirror.defaults.mode && name != "null") CodeMirror.defaults.mode = name;
    if (arguments.length > 2) {
      mode.dependencies = [];
      for (var i = 2; i < arguments.length; ++i) mode.dependencies.push(arguments[i]);
    }
    modes[name] = mode;
  };

  CodeMirror.defineMIME = function(mime, spec) {
    mimeModes[mime] = spec;
  };

  // Given a MIME type, a {name, ...options} config object, or a name
  // string, return a mode config object.
  CodeMirror.resolveMode = function(spec) {
    if (typeof spec == "string" && mimeModes.hasOwnProperty(spec)) {
      spec = mimeModes[spec];
    } else if (spec && typeof spec.name == "string" && mimeModes.hasOwnProperty(spec.name)) {
      var found = mimeModes[spec.name];
      if (typeof found == "string") found = {name: found};
      spec = createObj(found, spec);
      spec.name = found.name;
    } else if (typeof spec == "string" && /^[\w\-]+\/[\w\-]+\+xml$/.test(spec)) {
      return CodeMirror.resolveMode("application/xml");
    }
    if (typeof spec == "string") return {name: spec};
    else return spec || {name: "null"};
  };

  // Given a mode spec (anything that resolveMode accepts), find and
  // initialize an actual mode object.
  CodeMirror.getMode = function(options, spec) {
    var spec = CodeMirror.resolveMode(spec);
    var mfactory = modes[spec.name];
    if (!mfactory) return CodeMirror.getMode(options, "text/plain");
    var modeObj = mfactory(options, spec);
    if (modeExtensions.hasOwnProperty(spec.name)) {
      var exts = modeExtensions[spec.name];
      for (var prop in exts) {
        if (!exts.hasOwnProperty(prop)) continue;
        if (modeObj.hasOwnProperty(prop)) modeObj["_" + prop] = modeObj[prop];
        modeObj[prop] = exts[prop];
      }
    }
    modeObj.name = spec.name;
    if (spec.helperType) modeObj.helperType = spec.helperType;
    if (spec.modeProps) for (var prop in spec.modeProps)
      modeObj[prop] = spec.modeProps[prop];

    return modeObj;
  };

  // Minimal default mode.
  CodeMirror.defineMode("null", function() {
    return {token: function(stream) {stream.skipToEnd();}};
  });
  CodeMirror.defineMIME("text/plain", "null");

  // This can be used to attach properties to mode objects from
  // outside the actual mode definition.
  var modeExtensions = CodeMirror.modeExtensions = {};
  CodeMirror.extendMode = function(mode, properties) {
    var exts = modeExtensions.hasOwnProperty(mode) ? modeExtensions[mode] : (modeExtensions[mode] = {});
    copyObj(properties, exts);
  };

  // EXTENSIONS

  CodeMirror.defineExtension = function(name, func) {
    CodeMirror.prototype[name] = func;
  };
  CodeMirror.defineDocExtension = function(name, func) {
    Doc.prototype[name] = func;
  };
  CodeMirror.defineOption = option;

  var initHooks = [];
  CodeMirror.defineInitHook = function(f) {initHooks.push(f);};

  var helpers = CodeMirror.helpers = {};
  CodeMirror.registerHelper = function(type, name, value) {
    if (!helpers.hasOwnProperty(type)) helpers[type] = CodeMirror[type] = {_global: []};
    helpers[type][name] = value;
  };
  CodeMirror.registerGlobalHelper = function(type, name, predicate, value) {
    CodeMirror.registerHelper(type, name, value);
    helpers[type]._global.push({pred: predicate, val: value});
  };

  // MODE STATE HANDLING

  // Utility functions for working with state. Exported because nested
  // modes need to do this for their inner modes.

  var copyState = CodeMirror.copyState = function(mode, state) {
    if (state === true) return state;
    if (mode.copyState) return mode.copyState(state);
    var nstate = {};
    for (var n in state) {
      var val = state[n];
      if (val instanceof Array) val = val.concat([]);
      nstate[n] = val;
    }
    return nstate;
  };

  var startState = CodeMirror.startState = function(mode, a1, a2) {
    return mode.startState ? mode.startState(a1, a2) : true;
  };

  // Given a mode and a state (for that mode), find the inner mode and
  // state at the position that the state refers to.
  CodeMirror.innerMode = function(mode, state) {
    while (mode.innerMode) {
      var info = mode.innerMode(state);
      if (!info || info.mode == mode) break;
      state = info.state;
      mode = info.mode;
    }
    return info || {mode: mode, state: state};
  };

  // STANDARD COMMANDS

  // Commands are parameter-less actions that can be performed on an
  // editor, mostly used for keybindings.
  var commands = CodeMirror.commands = {
    selectAll: function(cm) {cm.setSelection(Pos(cm.firstLine(), 0), Pos(cm.lastLine()), sel_dontScroll);},
    singleSelection: function(cm) {
      cm.setSelection(cm.getCursor("anchor"), cm.getCursor("head"), sel_dontScroll);
    },
    killLine: function(cm) {
      deleteNearSelection(cm, function(range) {
        if (range.empty()) {
          var len = getLine(cm.doc, range.head.line).text.length;
          if (range.head.ch == len && range.head.line < cm.lastLine())
            return {from: range.head, to: Pos(range.head.line + 1, 0)};
          else
            return {from: range.head, to: Pos(range.head.line, len)};
        } else {
          return {from: range.from(), to: range.to()};
        }
      });
    },
    deleteLine: function(cm) {
      deleteNearSelection(cm, function(range) {
        return {from: Pos(range.from().line, 0),
                to: clipPos(cm.doc, Pos(range.to().line + 1, 0))};
      });
    },
    delLineLeft: function(cm) {
      deleteNearSelection(cm, function(range) {
        return {from: Pos(range.from().line, 0), to: range.from()};
      });
    },
    undo: function(cm) {cm.undo();},
    redo: function(cm) {cm.redo();},
    undoSelection: function(cm) {cm.undoSelection();},
    redoSelection: function(cm) {cm.redoSelection();},
    goDocStart: function(cm) {cm.extendSelection(Pos(cm.firstLine(), 0));},
    goDocEnd: function(cm) {cm.extendSelection(Pos(cm.lastLine()));},
    goLineStart: function(cm) {
      cm.extendSelectionsBy(function(range) { return lineStart(cm, range.head.line); }, sel_move);
    },
    goLineStartSmart: function(cm) {
      cm.extendSelectionsBy(function(range) {
        var start = lineStart(cm, range.head.line);
        var line = cm.getLineHandle(start.line);
        var order = getOrder(line);
        if (!order || order[0].level == 0) {
          var firstNonWS = Math.max(0, line.text.search(/\S/));
          var inWS = range.head.line == start.line && range.head.ch <= firstNonWS && range.head.ch;
          return Pos(start.line, inWS ? 0 : firstNonWS);
        }
        return start;
      }, sel_move);
    },
    goLineEnd: function(cm) {
      cm.extendSelectionsBy(function(range) { return lineEnd(cm, range.head.line); }, sel_move);
    },
    goLineRight: function(cm) {
      cm.extendSelectionsBy(function(range) {
        var top = cm.charCoords(range.head, "div").top + 5;
        return cm.coordsChar({left: cm.display.lineDiv.offsetWidth + 100, top: top}, "div");
      }, sel_move);
    },
    goLineLeft: function(cm) {
      cm.extendSelectionsBy(function(range) {
        var top = cm.charCoords(range.head, "div").top + 5;
        return cm.coordsChar({left: 0, top: top}, "div");
      }, sel_move);
    },
    goLineUp: function(cm) {cm.moveV(-1, "line");},
    goLineDown: function(cm) {cm.moveV(1, "line");},
    goPageUp: function(cm) {cm.moveV(-1, "page");},
    goPageDown: function(cm) {cm.moveV(1, "page");},
    goCharLeft: function(cm) {cm.moveH(-1, "char");},
    goCharRight: function(cm) {cm.moveH(1, "char");},
    goColumnLeft: function(cm) {cm.moveH(-1, "column");},
    goColumnRight: function(cm) {cm.moveH(1, "column");},
    goWordLeft: function(cm) {cm.moveH(-1, "word");},
    goGroupRight: function(cm) {cm.moveH(1, "group");},
    goGroupLeft: function(cm) {cm.moveH(-1, "group");},
    goWordRight: function(cm) {cm.moveH(1, "word");},
    delCharBefore: function(cm) {cm.deleteH(-1, "char");},
    delCharAfter: function(cm) {cm.deleteH(1, "char");},
    delWordBefore: function(cm) {cm.deleteH(-1, "word");},
    delWordAfter: function(cm) {cm.deleteH(1, "word");},
    delGroupBefore: function(cm) {cm.deleteH(-1, "group");},
    delGroupAfter: function(cm) {cm.deleteH(1, "group");},
    indentAuto: function(cm) {cm.indentSelection("smart");},
    indentMore: function(cm) {cm.indentSelection("add");},
    indentLess: function(cm) {cm.indentSelection("subtract");},
    insertTab: function(cm) {cm.replaceSelection("\t");},
    insertSoftTab: function(cm) {
      var spaces = [], ranges = cm.listSelections(), tabSize = cm.options.tabSize;
      for (var i = 0; i < ranges.length; i++) {
        var pos = ranges[i].from();
        var col = countColumn(cm.getLine(pos.line), pos.ch, tabSize);
        spaces.push(new Array(tabSize - col % tabSize + 1).join(" "));
      }
      cm.replaceSelections(spaces);
    },
    defaultTab: function(cm) {
      if (cm.somethingSelected()) cm.indentSelection("add");
      else cm.execCommand("insertTab");
    },
    transposeChars: function(cm) {
      runInOp(cm, function() {
        var ranges = cm.listSelections(), newSel = [];
        for (var i = 0; i < ranges.length; i++) {
          var cur = ranges[i].head, line = getLine(cm.doc, cur.line).text;
          if (line) {
            if (cur.ch == line.length) cur = new Pos(cur.line, cur.ch - 1);
            if (cur.ch > 0) {
              cur = new Pos(cur.line, cur.ch + 1);
              cm.replaceRange(line.charAt(cur.ch - 1) + line.charAt(cur.ch - 2),
                              Pos(cur.line, cur.ch - 2), cur, "+transpose");
            } else if (cur.line > cm.doc.first) {
              var prev = getLine(cm.doc, cur.line - 1).text;
              if (prev)
                cm.replaceRange(line.charAt(0) + "\n" + prev.charAt(prev.length - 1),
                                Pos(cur.line - 1, prev.length - 1), Pos(cur.line, 1), "+transpose");
            }
          }
          newSel.push(new Range(cur, cur));
        }
        cm.setSelections(newSel);
      });
    },
    newlineAndIndent: function(cm) {
      runInOp(cm, function() {
        var len = cm.listSelections().length;
        for (var i = 0; i < len; i++) {
          var range = cm.listSelections()[i];
          cm.replaceRange("\n", range.anchor, range.head, "+input");
          cm.indentLine(range.from().line + 1, null, true);
          ensureCursorVisible(cm);
        }
      });
    },
    toggleOverwrite: function(cm) {cm.toggleOverwrite();}
  };

  // STANDARD KEYMAPS

  var keyMap = CodeMirror.keyMap = {};
  keyMap.basic = {
    "Left": "goCharLeft", "Right": "goCharRight", "Up": "goLineUp", "Down": "goLineDown",
    "End": "goLineEnd", "Home": "goLineStartSmart", "PageUp": "goPageUp", "PageDown": "goPageDown",
    "Delete": "delCharAfter", "Backspace": "delCharBefore", "Shift-Backspace": "delCharBefore",
    "Tab": "defaultTab", "Shift-Tab": "indentAuto",
    "Enter": "newlineAndIndent", "Insert": "toggleOverwrite",
    "Esc": "singleSelection"
  };
  // Note that the save and find-related commands aren't defined by
  // default. User code or addons can define them. Unknown commands
  // are simply ignored.
  keyMap.pcDefault = {
    "Ctrl-A": "selectAll", "Ctrl-D": "deleteLine", "Ctrl-Z": "undo", "Shift-Ctrl-Z": "redo", "Ctrl-Y": "redo",
    "Ctrl-Home": "goDocStart", "Ctrl-Up": "goDocStart", "Ctrl-End": "goDocEnd", "Ctrl-Down": "goDocEnd",
    "Ctrl-Left": "goGroupLeft", "Ctrl-Right": "goGroupRight", "Alt-Left": "goLineStart", "Alt-Right": "goLineEnd",
    "Ctrl-Backspace": "delGroupBefore", "Ctrl-Delete": "delGroupAfter", "Ctrl-S": "save", "Ctrl-F": "find",
    "Ctrl-G": "findNext", "Shift-Ctrl-G": "findPrev", "Shift-Ctrl-F": "replace", "Shift-Ctrl-R": "replaceAll",
    "Ctrl-[": "indentLess", "Ctrl-]": "indentMore",
    "Ctrl-U": "undoSelection", "Shift-Ctrl-U": "redoSelection", "Alt-U": "redoSelection",
    fallthrough: "basic"
  };
  keyMap.macDefault = {
    "Cmd-A": "selectAll", "Cmd-D": "deleteLine", "Cmd-Z": "undo", "Shift-Cmd-Z": "redo", "Cmd-Y": "redo",
    "Cmd-Up": "goDocStart", "Cmd-End": "goDocEnd", "Cmd-Down": "goDocEnd", "Alt-Left": "goGroupLeft",
    "Alt-Right": "goGroupRight", "Cmd-Left": "goLineStart", "Cmd-Right": "goLineEnd", "Alt-Backspace": "delGroupBefore",
    "Ctrl-Alt-Backspace": "delGroupAfter", "Alt-Delete": "delGroupAfter", "Cmd-S": "save", "Cmd-F": "find",
    "Cmd-G": "findNext", "Shift-Cmd-G": "findPrev", "Cmd-Alt-F": "replace", "Shift-Cmd-Alt-F": "replaceAll",
    "Cmd-[": "indentLess", "Cmd-]": "indentMore", "Cmd-Backspace": "delLineLeft",
    "Cmd-U": "undoSelection", "Shift-Cmd-U": "redoSelection",
    fallthrough: ["basic", "emacsy"]
  };
  // Very basic readline/emacs-style bindings, which are standard on Mac.
  keyMap.emacsy = {
    "Ctrl-F": "goCharRight", "Ctrl-B": "goCharLeft", "Ctrl-P": "goLineUp", "Ctrl-N": "goLineDown",
    "Alt-F": "goWordRight", "Alt-B": "goWordLeft", "Ctrl-A": "goLineStart", "Ctrl-E": "goLineEnd",
    "Ctrl-V": "goPageDown", "Shift-Ctrl-V": "goPageUp", "Ctrl-D": "delCharAfter", "Ctrl-H": "delCharBefore",
    "Alt-D": "delWordAfter", "Alt-Backspace": "delWordBefore", "Ctrl-K": "killLine", "Ctrl-T": "transposeChars"
  };
  keyMap["default"] = mac ? keyMap.macDefault : keyMap.pcDefault;

  // KEYMAP DISPATCH

  function getKeyMap(val) {
    if (typeof val == "string") return keyMap[val];
    else return val;
  }

  // Given an array of keymaps and a key name, call handle on any
  // bindings found, until that returns a truthy value, at which point
  // we consider the key handled. Implements things like binding a key
  // to false stopping further handling and keymap fallthrough.
  var lookupKey = CodeMirror.lookupKey = function(name, maps, handle) {
    function lookup(map) {
      map = getKeyMap(map);
      var found = map[name];
      if (found === false) return "stop";
      if (found != null && handle(found)) return true;
      if (map.nofallthrough) return "stop";

      var fallthrough = map.fallthrough;
      if (fallthrough == null) return false;
      if (Object.prototype.toString.call(fallthrough) != "[object Array]")
        return lookup(fallthrough);
      for (var i = 0; i < fallthrough.length; ++i) {
        var done = lookup(fallthrough[i]);
        if (done) return done;
      }
      return false;
    }

    for (var i = 0; i < maps.length; ++i) {
      var done = lookup(maps[i]);
      if (done) return done != "stop";
    }
  };

  // Modifier key presses don't count as 'real' key presses for the
  // purpose of keymap fallthrough.
  var isModifierKey = CodeMirror.isModifierKey = function(event) {
    var name = keyNames[event.keyCode];
    return name == "Ctrl" || name == "Alt" || name == "Shift" || name == "Mod";
  };

  // Look up the name of a key as indicated by an event object.
  var keyName = CodeMirror.keyName = function(event, noShift) {
    if (presto && event.keyCode == 34 && event["char"]) return false;
    var name = keyNames[event.keyCode];
    if (name == null || event.altGraphKey) return false;
    if (event.altKey) name = "Alt-" + name;
    if (flipCtrlCmd ? event.metaKey : event.ctrlKey) name = "Ctrl-" + name;
    if (flipCtrlCmd ? event.ctrlKey : event.metaKey) name = "Cmd-" + name;
    if (!noShift && event.shiftKey) name = "Shift-" + name;
    return name;
  };

  // FROMTEXTAREA

  CodeMirror.fromTextArea = function(textarea, options) {
    if (!options) options = {};
    options.value = textarea.value;
    if (!options.tabindex && textarea.tabindex)
      options.tabindex = textarea.tabindex;
    if (!options.placeholder && textarea.placeholder)
      options.placeholder = textarea.placeholder;
    // Set autofocus to true if this textarea is focused, or if it has
    // autofocus and no other element is focused.
    if (options.autofocus == null) {
      var hasFocus = activeElt();
      options.autofocus = hasFocus == textarea ||
        textarea.getAttribute("autofocus") != null && hasFocus == document.body;
    }

    function save() {textarea.value = cm.getValue();}
    if (textarea.form) {
      on(textarea.form, "submit", save);
      // Deplorable hack to make the submit method do the right thing.
      if (!options.leaveSubmitMethodAlone) {
        var form = textarea.form, realSubmit = form.submit;
        try {
          var wrappedSubmit = form.submit = function() {
            save();
            form.submit = realSubmit;
            form.submit();
            form.submit = wrappedSubmit;
          };
        } catch(e) {}
      }
    }

    textarea.style.display = "none";
    var cm = CodeMirror(function(node) {
      textarea.parentNode.insertBefore(node, textarea.nextSibling);
    }, options);
    cm.save = save;
    cm.getTextArea = function() { return textarea; };
    cm.toTextArea = function() {
      save();
      textarea.parentNode.removeChild(cm.getWrapperElement());
      textarea.style.display = "";
      if (textarea.form) {
        off(textarea.form, "submit", save);
        if (typeof textarea.form.submit == "function")
          textarea.form.submit = realSubmit;
      }
    };
    return cm;
  };

  // STRING STREAM

  // Fed to the mode parsers, provides helper functions to make
  // parsers more succinct.

  var StringStream = CodeMirror.StringStream = function(string, tabSize) {
    this.pos = this.start = 0;
    this.string = string;
    this.tabSize = tabSize || 8;
    this.lastColumnPos = this.lastColumnValue = 0;
    this.lineStart = 0;
  };

  StringStream.prototype = {
    eol: function() {return this.pos >= this.string.length;},
    sol: function() {return this.pos == this.lineStart;},
    peek: function() {return this.string.charAt(this.pos) || undefined;},
    next: function() {
      if (this.pos < this.string.length)
        return this.string.charAt(this.pos++);
    },
    eat: function(match) {
      var ch = this.string.charAt(this.pos);
      if (typeof match == "string") var ok = ch == match;
      else var ok = ch && (match.test ? match.test(ch) : match(ch));
      if (ok) {++this.pos; return ch;}
    },
    eatWhile: function(match) {
      var start = this.pos;
      while (this.eat(match)){}
      return this.pos > start;
    },
    eatSpace: function() {
      var start = this.pos;
      while (/[\s\u00a0]/.test(this.string.charAt(this.pos))) ++this.pos;
      return this.pos > start;
    },
    skipToEnd: function() {this.pos = this.string.length;},
    skipTo: function(ch) {
      var found = this.string.indexOf(ch, this.pos);
      if (found > -1) {this.pos = found; return true;}
    },
    backUp: function(n) {this.pos -= n;},
    column: function() {
      if (this.lastColumnPos < this.start) {
        this.lastColumnValue = countColumn(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue);
        this.lastColumnPos = this.start;
      }
      return this.lastColumnValue - (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0);
    },
    indentation: function() {
      return countColumn(this.string, null, this.tabSize) -
        (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0);
    },
    match: function(pattern, consume, caseInsensitive) {
      if (typeof pattern == "string") {
        var cased = function(str) {return caseInsensitive ? str.toLowerCase() : str;};
        var substr = this.string.substr(this.pos, pattern.length);
        if (cased(substr) == cased(pattern)) {
          if (consume !== false) this.pos += pattern.length;
          return true;
        }
      } else {
        var match = this.string.slice(this.pos).match(pattern);
        if (match && match.index > 0) return null;
        if (match && consume !== false) this.pos += match[0].length;
        return match;
      }
    },
    current: function(){return this.string.slice(this.start, this.pos);},
    hideFirstChars: function(n, inner) {
      this.lineStart += n;
      try { return inner(); }
      finally { this.lineStart -= n; }
    }
  };

  // TEXTMARKERS

  // Created with markText and setBookmark methods. A TextMarker is a
  // handle that can be used to clear or find a marked position in the
  // document. Line objects hold arrays (markedSpans) containing
  // {from, to, marker} object pointing to such marker objects, and
  // indicating that such a marker is present on that line. Multiple
  // lines may point to the same marker when it spans across lines.
  // The spans will have null for their from/to properties when the
  // marker continues beyond the start/end of the line. Markers have
  // links back to the lines they currently touch.

  var TextMarker = CodeMirror.TextMarker = function(doc, type) {
    this.lines = [];
    this.type = type;
    this.doc = doc;
  };
  eventMixin(TextMarker);

  // Clear the marker.
  TextMarker.prototype.clear = function() {
    if (this.explicitlyCleared) return;
    var cm = this.doc.cm, withOp = cm && !cm.curOp;
    if (withOp) startOperation(cm);
    if (hasHandler(this, "clear")) {
      var found = this.find();
      if (found) signalLater(this, "clear", found.from, found.to);
    }
    var min = null, max = null;
    for (var i = 0; i < this.lines.length; ++i) {
      var line = this.lines[i];
      var span = getMarkedSpanFor(line.markedSpans, this);
      if (cm && !this.collapsed) regLineChange(cm, lineNo(line), "text");
      else if (cm) {
        if (span.to != null) max = lineNo(line);
        if (span.from != null) min = lineNo(line);
      }
      line.markedSpans = removeMarkedSpan(line.markedSpans, span);
      if (span.from == null && this.collapsed && !lineIsHidden(this.doc, line) && cm)
        updateLineHeight(line, textHeight(cm.display));
    }
    if (cm && this.collapsed && !cm.options.lineWrapping) for (var i = 0; i < this.lines.length; ++i) {
      var visual = visualLine(this.lines[i]), len = lineLength(visual);
      if (len > cm.display.maxLineLength) {
        cm.display.maxLine = visual;
        cm.display.maxLineLength = len;
        cm.display.maxLineChanged = true;
      }
    }

    if (min != null && cm && this.collapsed) regChange(cm, min, max + 1);
    this.lines.length = 0;
    this.explicitlyCleared = true;
    if (this.atomic && this.doc.cantEdit) {
      this.doc.cantEdit = false;
      if (cm) reCheckSelection(cm.doc);
    }
    if (cm) signalLater(cm, "markerCleared", cm, this);
    if (withOp) endOperation(cm);
    if (this.parent) this.parent.clear();
  };

  // Find the position of the marker in the document. Returns a {from,
  // to} object by default. Side can be passed to get a specific side
  // -- 0 (both), -1 (left), or 1 (right). When lineObj is true, the
  // Pos objects returned contain a line object, rather than a line
  // number (used to prevent looking up the same line twice).
  TextMarker.prototype.find = function(side, lineObj) {
    if (side == null && this.type == "bookmark") side = 1;
    var from, to;
    for (var i = 0; i < this.lines.length; ++i) {
      var line = this.lines[i];
      var span = getMarkedSpanFor(line.markedSpans, this);
      if (span.from != null) {
        from = Pos(lineObj ? line : lineNo(line), span.from);
        if (side == -1) return from;
      }
      if (span.to != null) {
        to = Pos(lineObj ? line : lineNo(line), span.to);
        if (side == 1) return to;
      }
    }
    return from && {from: from, to: to};
  };

  // Signals that the marker's widget changed, and surrounding layout
  // should be recomputed.
  TextMarker.prototype.changed = function() {
    var pos = this.find(-1, true), widget = this, cm = this.doc.cm;
    if (!pos || !cm) return;
    runInOp(cm, function() {
      var line = pos.line, lineN = lineNo(pos.line);
      var view = findViewForLine(cm, lineN);
      if (view) {
        clearLineMeasurementCacheFor(view);
        cm.curOp.selectionChanged = cm.curOp.forceUpdate = true;
      }
      cm.curOp.updateMaxLine = true;
      if (!lineIsHidden(widget.doc, line) && widget.height != null) {
        var oldHeight = widget.height;
        widget.height = null;
        var dHeight = widgetHeight(widget) - oldHeight;
        if (dHeight)
          updateLineHeight(line, line.height + dHeight);
      }
    });
  };

  TextMarker.prototype.attachLine = function(line) {
    if (!this.lines.length && this.doc.cm) {
      var op = this.doc.cm.curOp;
      if (!op.maybeHiddenMarkers || indexOf(op.maybeHiddenMarkers, this) == -1)
        (op.maybeUnhiddenMarkers || (op.maybeUnhiddenMarkers = [])).push(this);
    }
    this.lines.push(line);
  };
  TextMarker.prototype.detachLine = function(line) {
    this.lines.splice(indexOf(this.lines, line), 1);
    if (!this.lines.length && this.doc.cm) {
      var op = this.doc.cm.curOp;
      (op.maybeHiddenMarkers || (op.maybeHiddenMarkers = [])).push(this);
    }
  };

  // Collapsed markers have unique ids, in order to be able to order
  // them, which is needed for uniquely determining an outer marker
  // when they overlap (they may nest, but not partially overlap).
  var nextMarkerId = 0;

  // Create a marker, wire it up to the right lines, and
  function markText(doc, from, to, options, type) {
    // Shared markers (across linked documents) are handled separately
    // (markTextShared will call out to this again, once per
    // document).
    if (options && options.shared) return markTextShared(doc, from, to, options, type);
    // Ensure we are in an operation.
    if (doc.cm && !doc.cm.curOp) return operation(doc.cm, markText)(doc, from, to, options, type);

    var marker = new TextMarker(doc, type), diff = cmp(from, to);
    if (options) copyObj(options, marker, false);
    // Don't connect empty markers unless clearWhenEmpty is false
    if (diff > 0 || diff == 0 && marker.clearWhenEmpty !== false)
      return marker;
    if (marker.replacedWith) {
      // Showing up as a widget implies collapsed (widget replaces text)
      marker.collapsed = true;
      marker.widgetNode = elt("span", [marker.replacedWith], "CodeMirror-widget");
      if (!options.handleMouseEvents) marker.widgetNode.ignoreEvents = true;
      if (options.insertLeft) marker.widgetNode.insertLeft = true;
    }
    if (marker.collapsed) {
      if (conflictingCollapsedRange(doc, from.line, from, to, marker) ||
          from.line != to.line && conflictingCollapsedRange(doc, to.line, from, to, marker))
        throw new Error("Inserting collapsed marker partially overlapping an existing one");
      sawCollapsedSpans = true;
    }

    if (marker.addToHistory)
      addChangeToHistory(doc, {from: from, to: to, origin: "markText"}, doc.sel, NaN);

    var curLine = from.line, cm = doc.cm, updateMaxLine;
    doc.iter(curLine, to.line + 1, function(line) {
      if (cm && marker.collapsed && !cm.options.lineWrapping && visualLine(line) == cm.display.maxLine)
        updateMaxLine = true;
      if (marker.collapsed && curLine != from.line) updateLineHeight(line, 0);
      addMarkedSpan(line, new MarkedSpan(marker,
                                         curLine == from.line ? from.ch : null,
                                         curLine == to.line ? to.ch : null));
      ++curLine;
    });
    // lineIsHidden depends on the presence of the spans, so needs a second pass
    if (marker.collapsed) doc.iter(from.line, to.line + 1, function(line) {
      if (lineIsHidden(doc, line)) updateLineHeight(line, 0);
    });

    if (marker.clearOnEnter) on(marker, "beforeCursorEnter", function() { marker.clear(); });

    if (marker.readOnly) {
      sawReadOnlySpans = true;
      if (doc.history.done.length || doc.history.undone.length)
        doc.clearHistory();
    }
    if (marker.collapsed) {
      marker.id = ++nextMarkerId;
      marker.atomic = true;
    }
    if (cm) {
      // Sync editor state
      if (updateMaxLine) cm.curOp.updateMaxLine = true;
      if (marker.collapsed)
        regChange(cm, from.line, to.line + 1);
      else if (marker.className || marker.title || marker.startStyle || marker.endStyle)
        for (var i = from.line; i <= to.line; i++) regLineChange(cm, i, "text");
      if (marker.atomic) reCheckSelection(cm.doc);
      signalLater(cm, "markerAdded", cm, marker);
    }
    return marker;
  }

  // SHARED TEXTMARKERS

  // A shared marker spans multiple linked documents. It is
  // implemented as a meta-marker-object controlling multiple normal
  // markers.
  var SharedTextMarker = CodeMirror.SharedTextMarker = function(markers, primary) {
    this.markers = markers;
    this.primary = primary;
    for (var i = 0; i < markers.length; ++i)
      markers[i].parent = this;
  };
  eventMixin(SharedTextMarker);

  SharedTextMarker.prototype.clear = function() {
    if (this.explicitlyCleared) return;
    this.explicitlyCleared = true;
    for (var i = 0; i < this.markers.length; ++i)
      this.markers[i].clear();
    signalLater(this, "clear");
  };
  SharedTextMarker.prototype.find = function(side, lineObj) {
    return this.primary.find(side, lineObj);
  };

  function markTextShared(doc, from, to, options, type) {
    options = copyObj(options);
    options.shared = false;
    var markers = [markText(doc, from, to, options, type)], primary = markers[0];
    var widget = options.widgetNode;
    linkedDocs(doc, function(doc) {
      if (widget) options.widgetNode = widget.cloneNode(true);
      markers.push(markText(doc, clipPos(doc, from), clipPos(doc, to), options, type));
      for (var i = 0; i < doc.linked.length; ++i)
        if (doc.linked[i].isParent) return;
      primary = lst(markers);
    });
    return new SharedTextMarker(markers, primary);
  }

  function findSharedMarkers(doc) {
    return doc.findMarks(Pos(doc.first, 0), doc.clipPos(Pos(doc.lastLine())),
                         function(m) { return m.parent; });
  }

  function copySharedMarkers(doc, markers) {
    for (var i = 0; i < markers.length; i++) {
      var marker = markers[i], pos = marker.find();
      var mFrom = doc.clipPos(pos.from), mTo = doc.clipPos(pos.to);
      if (cmp(mFrom, mTo)) {
        var subMark = markText(doc, mFrom, mTo, marker.primary, marker.primary.type);
        marker.markers.push(subMark);
        subMark.parent = marker;
      }
    }
  }

  function detachSharedMarkers(markers) {
    for (var i = 0; i < markers.length; i++) {
      var marker = markers[i], linked = [marker.primary.doc];;
      linkedDocs(marker.primary.doc, function(d) { linked.push(d); });
      for (var j = 0; j < marker.markers.length; j++) {
        var subMarker = marker.markers[j];
        if (indexOf(linked, subMarker.doc) == -1) {
          subMarker.parent = null;
          marker.markers.splice(j--, 1);
        }
      }
    }
  }

  // TEXTMARKER SPANS

  function MarkedSpan(marker, from, to) {
    this.marker = marker;
    this.from = from; this.to = to;
  }

  // Search an array of spans for a span matching the given marker.
  function getMarkedSpanFor(spans, marker) {
    if (spans) for (var i = 0; i < spans.length; ++i) {
      var span = spans[i];
      if (span.marker == marker) return span;
    }
  }
  // Remove a span from an array, returning undefined if no spans are
  // left (we don't store arrays for lines without spans).
  function removeMarkedSpan(spans, span) {
    for (var r, i = 0; i < spans.length; ++i)
      if (spans[i] != span) (r || (r = [])).push(spans[i]);
    return r;
  }
  // Add a span to a line.
  function addMarkedSpan(line, span) {
    line.markedSpans = line.markedSpans ? line.markedSpans.concat([span]) : [span];
    span.marker.attachLine(line);
  }

  // Used for the algorithm that adjusts markers for a change in the
  // document. These functions cut an array of spans at a given
  // character position, returning an array of remaining chunks (or
  // undefined if nothing remains).
  function markedSpansBefore(old, startCh, isInsert) {
    if (old) for (var i = 0, nw; i < old.length; ++i) {
      var span = old[i], marker = span.marker;
      var startsBefore = span.from == null || (marker.inclusiveLeft ? span.from <= startCh : span.from < startCh);
      if (startsBefore || span.from == startCh && marker.type == "bookmark" && (!isInsert || !span.marker.insertLeft)) {
        var endsAfter = span.to == null || (marker.inclusiveRight ? span.to >= startCh : span.to > startCh);
        (nw || (nw = [])).push(new MarkedSpan(marker, span.from, endsAfter ? null : span.to));
      }
    }
    return nw;
  }
  function markedSpansAfter(old, endCh, isInsert) {
    if (old) for (var i = 0, nw; i < old.length; ++i) {
      var span = old[i], marker = span.marker;
      var endsAfter = span.to == null || (marker.inclusiveRight ? span.to >= endCh : span.to > endCh);
      if (endsAfter || span.from == endCh && marker.type == "bookmark" && (!isInsert || span.marker.insertLeft)) {
        var startsBefore = span.from == null || (marker.inclusiveLeft ? span.from <= endCh : span.from < endCh);
        (nw || (nw = [])).push(new MarkedSpan(marker, startsBefore ? null : span.from - endCh,
                                              span.to == null ? null : span.to - endCh));
      }
    }
    return nw;
  }

  // Given a change object, compute the new set of marker spans that
  // cover the line in which the change took place. Removes spans
  // entirely within the change, reconnects spans belonging to the
  // same marker that appear on both sides of the change, and cuts off
  // spans partially within the change. Returns an array of span
  // arrays with one element for each line in (after) the change.
  function stretchSpansOverChange(doc, change) {
    var oldFirst = isLine(doc, change.from.line) && getLine(doc, change.from.line).markedSpans;
    var oldLast = isLine(doc, change.to.line) && getLine(doc, change.to.line).markedSpans;
    if (!oldFirst && !oldLast) return null;

    var startCh = change.from.ch, endCh = change.to.ch, isInsert = cmp(change.from, change.to) == 0;
    // Get the spans that 'stick out' on both sides
    var first = markedSpansBefore(oldFirst, startCh, isInsert);
    var last = markedSpansAfter(oldLast, endCh, isInsert);

    // Next, merge those two ends
    var sameLine = change.text.length == 1, offset = lst(change.text).length + (sameLine ? startCh : 0);
    if (first) {
      // Fix up .to properties of first
      for (var i = 0; i < first.length; ++i) {
        var span = first[i];
        if (span.to == null) {
          var found = getMarkedSpanFor(last, span.marker);
          if (!found) span.to = startCh;
          else if (sameLine) span.to = found.to == null ? null : found.to + offset;
        }
      }
    }
    if (last) {
      // Fix up .from in last (or move them into first in case of sameLine)
      for (var i = 0; i < last.length; ++i) {
        var span = last[i];
        if (span.to != null) span.to += offset;
        if (span.from == null) {
          var found = getMarkedSpanFor(first, span.marker);
          if (!found) {
            span.from = offset;
            if (sameLine) (first || (first = [])).push(span);
          }
        } else {
          span.from += offset;
          if (sameLine) (first || (first = [])).push(span);
        }
      }
    }
    // Make sure we didn't create any zero-length spans
    if (first) first = clearEmptySpans(first);
    if (last && last != first) last = clearEmptySpans(last);

    var newMarkers = [first];
    if (!sameLine) {
      // Fill gap with whole-line-spans
      var gap = change.text.length - 2, gapMarkers;
      if (gap > 0 && first)
        for (var i = 0; i < first.length; ++i)
          if (first[i].to == null)
            (gapMarkers || (gapMarkers = [])).push(new MarkedSpan(first[i].marker, null, null));
      for (var i = 0; i < gap; ++i)
        newMarkers.push(gapMarkers);
      newMarkers.push(last);
    }
    return newMarkers;
  }

  // Remove spans that are empty and don't have a clearWhenEmpty
  // option of false.
  function clearEmptySpans(spans) {
    for (var i = 0; i < spans.length; ++i) {
      var span = spans[i];
      if (span.from != null && span.from == span.to && span.marker.clearWhenEmpty !== false)
        spans.splice(i--, 1);
    }
    if (!spans.length) return null;
    return spans;
  }

  // Used for un/re-doing changes from the history. Combines the
  // result of computing the existing spans with the set of spans that
  // existed in the history (so that deleting around a span and then
  // undoing brings back the span).
  function mergeOldSpans(doc, change) {
    var old = getOldSpans(doc, change);
    var stretched = stretchSpansOverChange(doc, change);
    if (!old) return stretched;
    if (!stretched) return old;

    for (var i = 0; i < old.length; ++i) {
      var oldCur = old[i], stretchCur = stretched[i];
      if (oldCur && stretchCur) {
        spans: for (var j = 0; j < stretchCur.length; ++j) {
          var span = stretchCur[j];
          for (var k = 0; k < oldCur.length; ++k)
            if (oldCur[k].marker == span.marker) continue spans;
          oldCur.push(span);
        }
      } else if (stretchCur) {
        old[i] = stretchCur;
      }
    }
    return old;
  }

  // Used to 'clip' out readOnly ranges when making a change.
  function removeReadOnlyRanges(doc, from, to) {
    var markers = null;
    doc.iter(from.line, to.line + 1, function(line) {
      if (line.markedSpans) for (var i = 0; i < line.markedSpans.length; ++i) {
        var mark = line.markedSpans[i].marker;
        if (mark.readOnly && (!markers || indexOf(markers, mark) == -1))
          (markers || (markers = [])).push(mark);
      }
    });
    if (!markers) return null;
    var parts = [{from: from, to: to}];
    for (var i = 0; i < markers.length; ++i) {
      var mk = markers[i], m = mk.find(0);
      for (var j = 0; j < parts.length; ++j) {
        var p = parts[j];
        if (cmp(p.to, m.from) < 0 || cmp(p.from, m.to) > 0) continue;
        var newParts = [j, 1], dfrom = cmp(p.from, m.from), dto = cmp(p.to, m.to);
        if (dfrom < 0 || !mk.inclusiveLeft && !dfrom)
          newParts.push({from: p.from, to: m.from});
        if (dto > 0 || !mk.inclusiveRight && !dto)
          newParts.push({from: m.to, to: p.to});
        parts.splice.apply(parts, newParts);
        j += newParts.length - 1;
      }
    }
    return parts;
  }

  // Connect or disconnect spans from a line.
  function detachMarkedSpans(line) {
    var spans = line.markedSpans;
    if (!spans) return;
    for (var i = 0; i < spans.length; ++i)
      spans[i].marker.detachLine(line);
    line.markedSpans = null;
  }
  function attachMarkedSpans(line, spans) {
    if (!spans) return;
    for (var i = 0; i < spans.length; ++i)
      spans[i].marker.attachLine(line);
    line.markedSpans = spans;
  }

  // Helpers used when computing which overlapping collapsed span
  // counts as the larger one.
  function extraLeft(marker) { return marker.inclusiveLeft ? -1 : 0; }
  function extraRight(marker) { return marker.inclusiveRight ? 1 : 0; }

  // Returns a number indicating which of two overlapping collapsed
  // spans is larger (and thus includes the other). Falls back to
  // comparing ids when the spans cover exactly the same range.
  function compareCollapsedMarkers(a, b) {
    var lenDiff = a.lines.length - b.lines.length;
    if (lenDiff != 0) return lenDiff;
    var aPos = a.find(), bPos = b.find();
    var fromCmp = cmp(aPos.from, bPos.from) || extraLeft(a) - extraLeft(b);
    if (fromCmp) return -fromCmp;
    var toCmp = cmp(aPos.to, bPos.to) || extraRight(a) - extraRight(b);
    if (toCmp) return toCmp;
    return b.id - a.id;
  }

  // Find out whether a line ends or starts in a collapsed span. If
  // so, return the marker for that span.
  function collapsedSpanAtSide(line, start) {
    var sps = sawCollapsedSpans && line.markedSpans, found;
    if (sps) for (var sp, i = 0; i < sps.length; ++i) {
      sp = sps[i];
      if (sp.marker.collapsed && (start ? sp.from : sp.to) == null &&
          (!found || compareCollapsedMarkers(found, sp.marker) < 0))
        found = sp.marker;
    }
    return found;
  }
  function collapsedSpanAtStart(line) { return collapsedSpanAtSide(line, true); }
  function collapsedSpanAtEnd(line) { return collapsedSpanAtSide(line, false); }

  // Test whether there exists a collapsed span that partially
  // overlaps (covers the start or end, but not both) of a new span.
  // Such overlap is not allowed.
  function conflictingCollapsedRange(doc, lineNo, from, to, marker) {
    var line = getLine(doc, lineNo);
    var sps = sawCollapsedSpans && line.markedSpans;
    if (sps) for (var i = 0; i < sps.length; ++i) {
      var sp = sps[i];
      if (!sp.marker.collapsed) continue;
      var found = sp.marker.find(0);
      var fromCmp = cmp(found.from, from) || extraLeft(sp.marker) - extraLeft(marker);
      var toCmp = cmp(found.to, to) || extraRight(sp.marker) - extraRight(marker);
      if (fromCmp >= 0 && toCmp <= 0 || fromCmp <= 0 && toCmp >= 0) continue;
      if (fromCmp <= 0 && (cmp(found.to, from) || extraRight(sp.marker) - extraLeft(marker)) > 0 ||
          fromCmp >= 0 && (cmp(found.from, to) || extraLeft(sp.marker) - extraRight(marker)) < 0)
        return true;
    }
  }

  // A visual line is a line as drawn on the screen. Folding, for
  // example, can cause multiple logical lines to appear on the same
  // visual line. This finds the start of the visual line that the
  // given line is part of (usually that is the line itself).
  function visualLine(line) {
    var merged;
    while (merged = collapsedSpanAtStart(line))
      line = merged.find(-1, true).line;
    return line;
  }

  // Returns an array of logical lines that continue the visual line
  // started by the argument, or undefined if there are no such lines.
  function visualLineContinued(line) {
    var merged, lines;
    while (merged = collapsedSpanAtEnd(line)) {
      line = merged.find(1, true).line;
      (lines || (lines = [])).push(line);
    }
    return lines;
  }

  // Get the line number of the start of the visual line that the
  // given line number is part of.
  function visualLineNo(doc, lineN) {
    var line = getLine(doc, lineN), vis = visualLine(line);
    if (line == vis) return lineN;
    return lineNo(vis);
  }
  // Get the line number of the start of the next visual line after
  // the given line.
  function visualLineEndNo(doc, lineN) {
    if (lineN > doc.lastLine()) return lineN;
    var line = getLine(doc, lineN), merged;
    if (!lineIsHidden(doc, line)) return lineN;
    while (merged = collapsedSpanAtEnd(line))
      line = merged.find(1, true).line;
    return lineNo(line) + 1;
  }

  // Compute whether a line is hidden. Lines count as hidden when they
  // are part of a visual line that starts with another line, or when
  // they are entirely covered by collapsed, non-widget span.
  function lineIsHidden(doc, line) {
    var sps = sawCollapsedSpans && line.markedSpans;
    if (sps) for (var sp, i = 0; i < sps.length; ++i) {
      sp = sps[i];
      if (!sp.marker.collapsed) continue;
      if (sp.from == null) return true;
      if (sp.marker.widgetNode) continue;
      if (sp.from == 0 && sp.marker.inclusiveLeft && lineIsHiddenInner(doc, line, sp))
        return true;
    }
  }
  function lineIsHiddenInner(doc, line, span) {
    if (span.to == null) {
      var end = span.marker.find(1, true);
      return lineIsHiddenInner(doc, end.line, getMarkedSpanFor(end.line.markedSpans, span.marker));
    }
    if (span.marker.inclusiveRight && span.to == line.text.length)
      return true;
    for (var sp, i = 0; i < line.markedSpans.length; ++i) {
      sp = line.markedSpans[i];
      if (sp.marker.collapsed && !sp.marker.widgetNode && sp.from == span.to &&
          (sp.to == null || sp.to != span.from) &&
          (sp.marker.inclusiveLeft || span.marker.inclusiveRight) &&
          lineIsHiddenInner(doc, line, sp)) return true;
    }
  }

  // LINE WIDGETS

  // Line widgets are block elements displayed above or below a line.

  var LineWidget = CodeMirror.LineWidget = function(cm, node, options) {
    if (options) for (var opt in options) if (options.hasOwnProperty(opt))
      this[opt] = options[opt];
    this.cm = cm;
    this.node = node;
  };
  eventMixin(LineWidget);

  function adjustScrollWhenAboveVisible(cm, line, diff) {
    if (heightAtLine(line) < ((cm.curOp && cm.curOp.scrollTop) || cm.doc.scrollTop))
      addToScrollPos(cm, null, diff);
  }

  LineWidget.prototype.clear = function() {
    var cm = this.cm, ws = this.line.widgets, line = this.line, no = lineNo(line);
    if (no == null || !ws) return;
    for (var i = 0; i < ws.length; ++i) if (ws[i] == this) ws.splice(i--, 1);
    if (!ws.length) line.widgets = null;
    var height = widgetHeight(this);
    runInOp(cm, function() {
      adjustScrollWhenAboveVisible(cm, line, -height);
      regLineChange(cm, no, "widget");
      updateLineHeight(line, Math.max(0, line.height - height));
    });
  };
  LineWidget.prototype.changed = function() {
    var oldH = this.height, cm = this.cm, line = this.line;
    this.height = null;
    var diff = widgetHeight(this) - oldH;
    if (!diff) return;
    runInOp(cm, function() {
      cm.curOp.forceUpdate = true;
      adjustScrollWhenAboveVisible(cm, line, diff);
      updateLineHeight(line, line.height + diff);
    });
  };

  function widgetHeight(widget) {
    if (widget.height != null) return widget.height;
    if (!contains(document.body, widget.node))
      removeChildrenAndAdd(widget.cm.display.measure, elt("div", [widget.node], null, "position: relative"));
    return widget.height = widget.node.offsetHeight;
  }

  function addLineWidget(cm, handle, node, options) {
    var widget = new LineWidget(cm, node, options);
    if (widget.noHScroll) cm.display.alignWidgets = true;
    changeLine(cm, handle, "widget", function(line) {
      var widgets = line.widgets || (line.widgets = []);
      if (widget.insertAt == null) widgets.push(widget);
      else widgets.splice(Math.min(widgets.length - 1, Math.max(0, widget.insertAt)), 0, widget);
      widget.line = line;
      if (!lineIsHidden(cm.doc, line)) {
        var aboveVisible = heightAtLine(line) < cm.doc.scrollTop;
        updateLineHeight(line, line.height + widgetHeight(widget));
        if (aboveVisible) addToScrollPos(cm, null, widget.height);
        cm.curOp.forceUpdate = true;
      }
      return true;
    });
    return widget;
  }

  // LINE DATA STRUCTURE

  // Line objects. These hold state related to a line, including
  // highlighting info (the styles array).
  var Line = CodeMirror.Line = function(text, markedSpans, estimateHeight) {
    this.text = text;
    attachMarkedSpans(this, markedSpans);
    this.height = estimateHeight ? estimateHeight(this) : 1;
  };
  eventMixin(Line);
  Line.prototype.lineNo = function() { return lineNo(this); };

  // Change the content (text, markers) of a line. Automatically
  // invalidates cached information and tries to re-estimate the
  // line's height.
  function updateLine(line, text, markedSpans, estimateHeight) {
    line.text = text;
    if (line.stateAfter) line.stateAfter = null;
    if (line.styles) line.styles = null;
    if (line.order != null) line.order = null;
    detachMarkedSpans(line);
    attachMarkedSpans(line, markedSpans);
    var estHeight = estimateHeight ? estimateHeight(line) : 1;
    if (estHeight != line.height) updateLineHeight(line, estHeight);
  }

  // Detach a line from the document tree and its markers.
  function cleanUpLine(line) {
    line.parent = null;
    detachMarkedSpans(line);
  }

  function extractLineClasses(type, output) {
    if (type) for (;;) {
      var lineClass = type.match(/(?:^|\s+)line-(background-)?(\S+)/);
      if (!lineClass) break;
      type = type.slice(0, lineClass.index) + type.slice(lineClass.index + lineClass[0].length);
      var prop = lineClass[1] ? "bgClass" : "textClass";
      if (output[prop] == null)
        output[prop] = lineClass[2];
      else if (!(new RegExp("(?:^|\s)" + lineClass[2] + "(?:$|\s)")).test(output[prop]))
        output[prop] += " " + lineClass[2];
    }
    return type;
  }

  function callBlankLine(mode, state) {
    if (mode.blankLine) return mode.blankLine(state);
    if (!mode.innerMode) return;
    var inner = CodeMirror.innerMode(mode, state);
    if (inner.mode.blankLine) return inner.mode.blankLine(inner.state);
  }

  function readToken(mode, stream, state) {
    for (var i = 0; i < 10; i++) {
      var style = mode.token(stream, state);
      if (stream.pos > stream.start) return style;
    }
    throw new Error("Mode " + mode.name + " failed to advance stream.");
  }

  // Run the given mode's parser over a line, calling f for each token.
  function runMode(cm, text, mode, state, f, lineClasses, forceToEnd) {
    var flattenSpans = mode.flattenSpans;
    if (flattenSpans == null) flattenSpans = cm.options.flattenSpans;
    var curStart = 0, curStyle = null;
    var stream = new StringStream(text, cm.options.tabSize), style;
    if (text == "") extractLineClasses(callBlankLine(mode, state), lineClasses);
    while (!stream.eol()) {
      if (stream.pos > cm.options.maxHighlightLength) {
        flattenSpans = false;
        if (forceToEnd) processLine(cm, text, state, stream.pos);
        stream.pos = text.length;
        style = null;
      } else {
        style = extractLineClasses(readToken(mode, stream, state), lineClasses);
      }
      if (cm.options.addModeClass) {
        var mName = CodeMirror.innerMode(mode, state).mode.name;
        if (mName) style = "m-" + (style ? mName + " " + style : mName);
      }
      if (!flattenSpans || curStyle != style) {
        if (curStart < stream.start) f(stream.start, curStyle);
        curStart = stream.start; curStyle = style;
      }
      stream.start = stream.pos;
    }
    while (curStart < stream.pos) {
      // Webkit seems to refuse to render text nodes longer than 57444 characters
      var pos = Math.min(stream.pos, curStart + 50000);
      f(pos, curStyle);
      curStart = pos;
    }
  }

  // Compute a style array (an array starting with a mode generation
  // -- for invalidation -- followed by pairs of end positions and
  // style strings), which is used to highlight the tokens on the
  // line.
  function highlightLine(cm, line, state, forceToEnd) {
    // A styles array always starts with a number identifying the
    // mode/overlays that it is based on (for easy invalidation).
    var st = [cm.state.modeGen], lineClasses = {};
    // Compute the base array of styles
    runMode(cm, line.text, cm.doc.mode, state, function(end, style) {
      st.push(end, style);
    }, lineClasses, forceToEnd);

    // Run overlays, adjust style array.
    for (var o = 0; o < cm.state.overlays.length; ++o) {
      var overlay = cm.state.overlays[o], i = 1, at = 0;
      runMode(cm, line.text, overlay.mode, true, function(end, style) {
        var start = i;
        // Ensure there's a token end at the current position, and that i points at it
        while (at < end) {
          var i_end = st[i];
          if (i_end > end)
            st.splice(i, 1, end, st[i+1], i_end);
          i += 2;
          at = Math.min(end, i_end);
        }
        if (!style) return;
        if (overlay.opaque) {
          st.splice(start, i - start, end, "cm-overlay " + style);
          i = start + 2;
        } else {
          for (; start < i; start += 2) {
            var cur = st[start+1];
            st[start+1] = (cur ? cur + " " : "") + "cm-overlay " + style;
          }
        }
      }, lineClasses);
    }

    return {styles: st, classes: lineClasses.bgClass || lineClasses.textClass ? lineClasses : null};
  }

  function getLineStyles(cm, line) {
    if (!line.styles || line.styles[0] != cm.state.modeGen) {
      var result = highlightLine(cm, line, line.stateAfter = getStateBefore(cm, lineNo(line)));
      line.styles = result.styles;
      if (result.classes) line.styleClasses = result.classes;
      else if (line.styleClasses) line.styleClasses = null;
    }
    return line.styles;
  }

  // Lightweight form of highlight -- proceed over this line and
  // update state, but don't save a style array. Used for lines that
  // aren't currently visible.
  function processLine(cm, text, state, startAt) {
    var mode = cm.doc.mode;
    var stream = new StringStream(text, cm.options.tabSize);
    stream.start = stream.pos = startAt || 0;
    if (text == "") callBlankLine(mode, state);
    while (!stream.eol() && stream.pos <= cm.options.maxHighlightLength) {
      readToken(mode, stream, state);
      stream.start = stream.pos;
    }
  }

  // Convert a style as returned by a mode (either null, or a string
  // containing one or more styles) to a CSS style. This is cached,
  // and also looks for line-wide styles.
  var styleToClassCache = {}, styleToClassCacheWithMode = {};
  function interpretTokenStyle(style, options) {
    if (!style || /^\s*$/.test(style)) return null;
    var cache = options.addModeClass ? styleToClassCacheWithMode : styleToClassCache;
    return cache[style] ||
      (cache[style] = style.replace(/\S+/g, "cm-$&"));
  }

  // Render the DOM representation of the text of a line. Also builds
  // up a 'line map', which points at the DOM nodes that represent
  // specific stretches of text, and is used by the measuring code.
  // The returned object contains the DOM node, this map, and
  // information about line-wide styles that were set by the mode.
  function buildLineContent(cm, lineView) {
    // The padding-right forces the element to have a 'border', which
    // is needed on Webkit to be able to get line-level bounding
    // rectangles for it (in measureChar).
    var content = elt("span", null, null, webkit ? "padding-right: .1px" : null);
    var builder = {pre: elt("pre", [content]), content: content, col: 0, pos: 0, cm: cm};
    lineView.measure = {};

    // Iterate over the logical lines that make up this visual line.
    for (var i = 0; i <= (lineView.rest ? lineView.rest.length : 0); i++) {
      var line = i ? lineView.rest[i - 1] : lineView.line, order;
      builder.pos = 0;
      builder.addToken = buildToken;
      // Optionally wire in some hacks into the token-rendering
      // algorithm, to deal with browser quirks.
      if ((ie || webkit) && cm.getOption("lineWrapping"))
        builder.addToken = buildTokenSplitSpaces(builder.addToken);
      if (hasBadBidiRects(cm.display.measure) && (order = getOrder(line)))
        builder.addToken = buildTokenBadBidi(builder.addToken, order);
      builder.map = [];
      insertLineContent(line, builder, getLineStyles(cm, line));
      if (line.styleClasses) {
        if (line.styleClasses.bgClass)
          builder.bgClass = joinClasses(line.styleClasses.bgClass, builder.bgClass || "");
        if (line.styleClasses.textClass)
          builder.textClass = joinClasses(line.styleClasses.textClass, builder.textClass || "");
      }

      // Ensure at least a single node is present, for measuring.
      if (builder.map.length == 0)
        builder.map.push(0, 0, builder.content.appendChild(zeroWidthElement(cm.display.measure)));

      // Store the map and a cache object for the current logical line
      if (i == 0) {
        lineView.measure.map = builder.map;
        lineView.measure.cache = {};
      } else {
        (lineView.measure.maps || (lineView.measure.maps = [])).push(builder.map);
        (lineView.measure.caches || (lineView.measure.caches = [])).push({});
      }
    }

    signal(cm, "renderLine", cm, lineView.line, builder.pre);
    if (builder.pre.className)
      builder.textClass = joinClasses(builder.pre.className, builder.textClass || "");
    return builder;
  }

  function defaultSpecialCharPlaceholder(ch) {
    var token = elt("span", "\u2022", "cm-invalidchar");
    token.title = "\\u" + ch.charCodeAt(0).toString(16);
    return token;
  }

  // Build up the DOM representation for a single token, and add it to
  // the line map. Takes care to render special characters separately.
  function buildToken(builder, text, style, startStyle, endStyle, title) {
    if (!text) return;
    var special = builder.cm.options.specialChars, mustWrap = false;
    if (!special.test(text)) {
      builder.col += text.length;
      var content = document.createTextNode(text);
      builder.map.push(builder.pos, builder.pos + text.length, content);
      if (ie_upto8) mustWrap = true;
      builder.pos += text.length;
    } else {
      var content = document.createDocumentFragment(), pos = 0;
      while (true) {
        special.lastIndex = pos;
        var m = special.exec(text);
        var skipped = m ? m.index - pos : text.length - pos;
        if (skipped) {
          var txt = document.createTextNode(text.slice(pos, pos + skipped));
          if (ie_upto8) content.appendChild(elt("span", [txt]));
          else content.appendChild(txt);
          builder.map.push(builder.pos, builder.pos + skipped, txt);
          builder.col += skipped;
          builder.pos += skipped;
        }
        if (!m) break;
        pos += skipped + 1;
        if (m[0] == "\t") {
          var tabSize = builder.cm.options.tabSize, tabWidth = tabSize - builder.col % tabSize;
          var txt = content.appendChild(elt("span", spaceStr(tabWidth), "cm-tab"));
          builder.col += tabWidth;
        } else {
          var txt = builder.cm.options.specialCharPlaceholder(m[0]);
          if (ie_upto8) content.appendChild(elt("span", [txt]));
          else content.appendChild(txt);
          builder.col += 1;
        }
        builder.map.push(builder.pos, builder.pos + 1, txt);
        builder.pos++;
      }
    }
    if (style || startStyle || endStyle || mustWrap) {
      var fullStyle = style || "";
      if (startStyle) fullStyle += startStyle;
      if (endStyle) fullStyle += endStyle;
      var token = elt("span", [content], fullStyle);
      if (title) token.title = title;
      return builder.content.appendChild(token);
    }
    builder.content.appendChild(content);
  }

  function buildTokenSplitSpaces(inner) {
    function split(old) {
      var out = " ";
      for (var i = 0; i < old.length - 2; ++i) out += i % 2 ? " " : "\u00a0";
      out += " ";
      return out;
    }
    return function(builder, text, style, startStyle, endStyle, title) {
      inner(builder, text.replace(/ {3,}/g, split), style, startStyle, endStyle, title);
    };
  }

  // Work around nonsense dimensions being reported for stretches of
  // right-to-left text.
  function buildTokenBadBidi(inner, order) {
    return function(builder, text, style, startStyle, endStyle, title) {
      style = style ? style + " cm-force-border" : "cm-force-border";
      var start = builder.pos, end = start + text.length;
      for (;;) {
        // Find the part that overlaps with the start of this text
        for (var i = 0; i < order.length; i++) {
          var part = order[i];
          if (part.to > start && part.from <= start) break;
        }
        if (part.to >= end) return inner(builder, text, style, startStyle, endStyle, title);
        inner(builder, text.slice(0, part.to - start), style, startStyle, null, title);
        startStyle = null;
        text = text.slice(part.to - start);
        start = part.to;
      }
    };
  }

  function buildCollapsedSpan(builder, size, marker, ignoreWidget) {
    var widget = !ignoreWidget && marker.widgetNode;
    if (widget) {
      builder.map.push(builder.pos, builder.pos + size, widget);
      builder.content.appendChild(widget);
    }
    builder.pos += size;
  }

  // Outputs a number of spans to make up a line, taking highlighting
  // and marked text into account.
  function insertLineContent(line, builder, styles) {
    var spans = line.markedSpans, allText = line.text, at = 0;
    if (!spans) {
      for (var i = 1; i < styles.length; i+=2)
        builder.addToken(builder, allText.slice(at, at = styles[i]), interpretTokenStyle(styles[i+1], builder.cm.options));
      return;
    }

    var len = allText.length, pos = 0, i = 1, text = "", style;
    var nextChange = 0, spanStyle, spanEndStyle, spanStartStyle, title, collapsed;
    for (;;) {
      if (nextChange == pos) { // Update current marker set
        spanStyle = spanEndStyle = spanStartStyle = title = "";
        collapsed = null; nextChange = Infinity;
        var foundBookmarks = [];
        for (var j = 0; j < spans.length; ++j) {
          var sp = spans[j], m = sp.marker;
          if (sp.from <= pos && (sp.to == null || sp.to > pos)) {
            if (sp.to != null && nextChange > sp.to) { nextChange = sp.to; spanEndStyle = ""; }
            if (m.className) spanStyle += " " + m.className;
            if (m.startStyle && sp.from == pos) spanStartStyle += " " + m.startStyle;
            if (m.endStyle && sp.to == nextChange) spanEndStyle += " " + m.endStyle;
            if (m.title && !title) title = m.title;
            if (m.collapsed && (!collapsed || compareCollapsedMarkers(collapsed.marker, m) < 0))
              collapsed = sp;
          } else if (sp.from > pos && nextChange > sp.from) {
            nextChange = sp.from;
          }
          if (m.type == "bookmark" && sp.from == pos && m.widgetNode) foundBookmarks.push(m);
        }
        if (collapsed && (collapsed.from || 0) == pos) {
          buildCollapsedSpan(builder, (collapsed.to == null ? len + 1 : collapsed.to) - pos,
                             collapsed.marker, collapsed.from == null);
          if (collapsed.to == null) return;
        }
        if (!collapsed && foundBookmarks.length) for (var j = 0; j < foundBookmarks.length; ++j)
          buildCollapsedSpan(builder, 0, foundBookmarks[j]);
      }
      if (pos >= len) break;

      var upto = Math.min(len, nextChange);
      while (true) {
        if (text) {
          var end = pos + text.length;
          if (!collapsed) {
            var tokenText = end > upto ? text.slice(0, upto - pos) : text;
            builder.addToken(builder, tokenText, style ? style + spanStyle : spanStyle,
                             spanStartStyle, pos + tokenText.length == nextChange ? spanEndStyle : "", title);
          }
          if (end >= upto) {text = text.slice(upto - pos); pos = upto; break;}
          pos = end;
          spanStartStyle = "";
        }
        text = allText.slice(at, at = styles[i++]);
        style = interpretTokenStyle(styles[i++], builder.cm.options);
      }
    }
  }

  // DOCUMENT DATA STRUCTURE

  // By default, updates that start and end at the beginning of a line
  // are treated specially, in order to make the association of line
  // widgets and marker elements with the text behave more intuitive.
  function isWholeLineUpdate(doc, change) {
    return change.from.ch == 0 && change.to.ch == 0 && lst(change.text) == "" &&
      (!doc.cm || doc.cm.options.wholeLineUpdateBefore);
  }

  // Perform a change on the document data structure.
  function updateDoc(doc, change, markedSpans, estimateHeight) {
    function spansFor(n) {return markedSpans ? markedSpans[n] : null;}
    function update(line, text, spans) {
      updateLine(line, text, spans, estimateHeight);
      signalLater(line, "change", line, change);
    }

    var from = change.from, to = change.to, text = change.text;
    var firstLine = getLine(doc, from.line), lastLine = getLine(doc, to.line);
    var lastText = lst(text), lastSpans = spansFor(text.length - 1), nlines = to.line - from.line;

    // Adjust the line structure
    if (isWholeLineUpdate(doc, change)) {
      // This is a whole-line replace. Treated specially to make
      // sure line objects move the way they are supposed to.
      for (var i = 0, added = []; i < text.length - 1; ++i)
        added.push(new Line(text[i], spansFor(i), estimateHeight));
      update(lastLine, lastLine.text, lastSpans);
      if (nlines) doc.remove(from.line, nlines);
      if (added.length) doc.insert(from.line, added);
    } else if (firstLine == lastLine) {
      if (text.length == 1) {
        update(firstLine, firstLine.text.slice(0, from.ch) + lastText + firstLine.text.slice(to.ch), lastSpans);
      } else {
        for (var added = [], i = 1; i < text.length - 1; ++i)
          added.push(new Line(text[i], spansFor(i), estimateHeight));
        added.push(new Line(lastText + firstLine.text.slice(to.ch), lastSpans, estimateHeight));
        update(firstLine, firstLine.text.slice(0, from.ch) + text[0], spansFor(0));
        doc.insert(from.line + 1, added);
      }
    } else if (text.length == 1) {
      update(firstLine, firstLine.text.slice(0, from.ch) + text[0] + lastLine.text.slice(to.ch), spansFor(0));
      doc.remove(from.line + 1, nlines);
    } else {
      update(firstLine, firstLine.text.slice(0, from.ch) + text[0], spansFor(0));
      update(lastLine, lastText + lastLine.text.slice(to.ch), lastSpans);
      for (var i = 1, added = []; i < text.length - 1; ++i)
        added.push(new Line(text[i], spansFor(i), estimateHeight));
      if (nlines > 1) doc.remove(from.line + 1, nlines - 1);
      doc.insert(from.line + 1, added);
    }

    signalLater(doc, "change", doc, change);
  }

  // The document is represented as a BTree consisting of leaves, with
  // chunk of lines in them, and branches, with up to ten leaves or
  // other branch nodes below them. The top node is always a branch
  // node, and is the document object itself (meaning it has
  // additional methods and properties).
  //
  // All nodes have parent links. The tree is used both to go from
  // line numbers to line objects, and to go from objects to numbers.
  // It also indexes by height, and is used to convert between height
  // and line object, and to find the total height of the document.
  //
  // See also http://marijnhaverbeke.nl/blog/codemirror-line-tree.html

  function LeafChunk(lines) {
    this.lines = lines;
    this.parent = null;
    for (var i = 0, height = 0; i < lines.length; ++i) {
      lines[i].parent = this;
      height += lines[i].height;
    }
    this.height = height;
  }

  LeafChunk.prototype = {
    chunkSize: function() { return this.lines.length; },
    // Remove the n lines at offset 'at'.
    removeInner: function(at, n) {
      for (var i = at, e = at + n; i < e; ++i) {
        var line = this.lines[i];
        this.height -= line.height;
        cleanUpLine(line);
        signalLater(line, "delete");
      }
      this.lines.splice(at, n);
    },
    // Helper used to collapse a small branch into a single leaf.
    collapse: function(lines) {
      lines.push.apply(lines, this.lines);
    },
    // Insert the given array of lines at offset 'at', count them as
    // having the given height.
    insertInner: function(at, lines, height) {
      this.height += height;
      this.lines = this.lines.slice(0, at).concat(lines).concat(this.lines.slice(at));
      for (var i = 0; i < lines.length; ++i) lines[i].parent = this;
    },
    // Used to iterate over a part of the tree.
    iterN: function(at, n, op) {
      for (var e = at + n; at < e; ++at)
        if (op(this.lines[at])) return true;
    }
  };

  function BranchChunk(children) {
    this.children = children;
    var size = 0, height = 0;
    for (var i = 0; i < children.length; ++i) {
      var ch = children[i];
      size += ch.chunkSize(); height += ch.height;
      ch.parent = this;
    }
    this.size = size;
    this.height = height;
    this.parent = null;
  }

  BranchChunk.prototype = {
    chunkSize: function() { return this.size; },
    removeInner: function(at, n) {
      this.size -= n;
      for (var i = 0; i < this.children.length; ++i) {
        var child = this.children[i], sz = child.chunkSize();
        if (at < sz) {
          var rm = Math.min(n, sz - at), oldHeight = child.height;
          child.removeInner(at, rm);
          this.height -= oldHeight - child.height;
          if (sz == rm) { this.children.splice(i--, 1); child.parent = null; }
          if ((n -= rm) == 0) break;
          at = 0;
        } else at -= sz;
      }
      // If the result is smaller than 25 lines, ensure that it is a
      // single leaf node.
      if (this.size - n < 25 &&
          (this.children.length > 1 || !(this.children[0] instanceof LeafChunk))) {
        var lines = [];
        this.collapse(lines);
        this.children = [new LeafChunk(lines)];
        this.children[0].parent = this;
      }
    },
    collapse: function(lines) {
      for (var i = 0; i < this.children.length; ++i) this.children[i].collapse(lines);
    },
    insertInner: function(at, lines, height) {
      this.size += lines.length;
      this.height += height;
      for (var i = 0; i < this.children.length; ++i) {
        var child = this.children[i], sz = child.chunkSize();
        if (at <= sz) {
          child.insertInner(at, lines, height);
          if (child.lines && child.lines.length > 50) {
            while (child.lines.length > 50) {
              var spilled = child.lines.splice(child.lines.length - 25, 25);
              var newleaf = new LeafChunk(spilled);
              child.height -= newleaf.height;
              this.children.splice(i + 1, 0, newleaf);
              newleaf.parent = this;
            }
            this.maybeSpill();
          }
          break;
        }
        at -= sz;
      }
    },
    // When a node has grown, check whether it should be split.
    maybeSpill: function() {
      if (this.children.length <= 10) return;
      var me = this;
      do {
        var spilled = me.children.splice(me.children.length - 5, 5);
        var sibling = new BranchChunk(spilled);
        if (!me.parent) { // Become the parent node
          var copy = new BranchChunk(me.children);
          copy.parent = me;
          me.children = [copy, sibling];
          me = copy;
        } else {
          me.size -= sibling.size;
          me.height -= sibling.height;
          var myIndex = indexOf(me.parent.children, me);
          me.parent.children.splice(myIndex + 1, 0, sibling);
        }
        sibling.parent = me.parent;
      } while (me.children.length > 10);
      me.parent.maybeSpill();
    },
    iterN: function(at, n, op) {
      for (var i = 0; i < this.children.length; ++i) {
        var child = this.children[i], sz = child.chunkSize();
        if (at < sz) {
          var used = Math.min(n, sz - at);
          if (child.iterN(at, used, op)) return true;
          if ((n -= used) == 0) break;
          at = 0;
        } else at -= sz;
      }
    }
  };

  var nextDocId = 0;
  var Doc = CodeMirror.Doc = function(text, mode, firstLine) {
    if (!(this instanceof Doc)) return new Doc(text, mode, firstLine);
    if (firstLine == null) firstLine = 0;

    BranchChunk.call(this, [new LeafChunk([new Line("", null)])]);
    this.first = firstLine;
    this.scrollTop = this.scrollLeft = 0;
    this.cantEdit = false;
    this.cleanGeneration = 1;
    this.frontier = firstLine;
    var start = Pos(firstLine, 0);
    this.sel = simpleSelection(start);
    this.history = new History(null);
    this.id = ++nextDocId;
    this.modeOption = mode;

    if (typeof text == "string") text = splitLines(text);
    updateDoc(this, {from: start, to: start, text: text});
    setSelection(this, simpleSelection(start), sel_dontScroll);
  };

  Doc.prototype = createObj(BranchChunk.prototype, {
    constructor: Doc,
    // Iterate over the document. Supports two forms -- with only one
    // argument, it calls that for each line in the document. With
    // three, it iterates over the range given by the first two (with
    // the second being non-inclusive).
    iter: function(from, to, op) {
      if (op) this.iterN(from - this.first, to - from, op);
      else this.iterN(this.first, this.first + this.size, from);
    },

    // Non-public interface for adding and removing lines.
    insert: function(at, lines) {
      var height = 0;
      for (var i = 0; i < lines.length; ++i) height += lines[i].height;
      this.insertInner(at - this.first, lines, height);
    },
    remove: function(at, n) { this.removeInner(at - this.first, n); },

    // From here, the methods are part of the public interface. Most
    // are also available from CodeMirror (editor) instances.

    getValue: function(lineSep) {
      var lines = getLines(this, this.first, this.first + this.size);
      if (lineSep === false) return lines;
      return lines.join(lineSep || "\n");
    },
    setValue: docMethodOp(function(code) {
      var top = Pos(this.first, 0), last = this.first + this.size - 1;
      makeChange(this, {from: top, to: Pos(last, getLine(this, last).text.length),
                        text: splitLines(code), origin: "setValue"}, true);
      setSelection(this, simpleSelection(top));
    }),
    replaceRange: function(code, from, to, origin) {
      from = clipPos(this, from);
      to = to ? clipPos(this, to) : from;
      replaceRange(this, code, from, to, origin);
    },
    getRange: function(from, to, lineSep) {
      var lines = getBetween(this, clipPos(this, from), clipPos(this, to));
      if (lineSep === false) return lines;
      return lines.join(lineSep || "\n");
    },

    getLine: function(line) {var l = this.getLineHandle(line); return l && l.text;},

    getLineHandle: function(line) {if (isLine(this, line)) return getLine(this, line);},
    getLineNumber: function(line) {return lineNo(line);},

    getLineHandleVisualStart: function(line) {
      if (typeof line == "number") line = getLine(this, line);
      return visualLine(line);
    },

    lineCount: function() {return this.size;},
    firstLine: function() {return this.first;},
    lastLine: function() {return this.first + this.size - 1;},

    clipPos: function(pos) {return clipPos(this, pos);},

    getCursor: function(start) {
      var range = this.sel.primary(), pos;
      if (start == null || start == "head") pos = range.head;
      else if (start == "anchor") pos = range.anchor;
      else if (start == "end" || start == "to" || start === false) pos = range.to();
      else pos = range.from();
      return pos;
    },
    listSelections: function() { return this.sel.ranges; },
    somethingSelected: function() {return this.sel.somethingSelected();},

    setCursor: docMethodOp(function(line, ch, options) {
      setSimpleSelection(this, clipPos(this, typeof line == "number" ? Pos(line, ch || 0) : line), null, options);
    }),
    setSelection: docMethodOp(function(anchor, head, options) {
      setSimpleSelection(this, clipPos(this, anchor), clipPos(this, head || anchor), options);
    }),
    extendSelection: docMethodOp(function(head, other, options) {
      extendSelection(this, clipPos(this, head), other && clipPos(this, other), options);
    }),
    extendSelections: docMethodOp(function(heads, options) {
      extendSelections(this, clipPosArray(this, heads, options));
    }),
    extendSelectionsBy: docMethodOp(function(f, options) {
      extendSelections(this, map(this.sel.ranges, f), options);
    }),
    setSelections: docMethodOp(function(ranges, primary, options) {
      if (!ranges.length) return;
      for (var i = 0, out = []; i < ranges.length; i++)
        out[i] = new Range(clipPos(this, ranges[i].anchor),
                           clipPos(this, ranges[i].head));
      if (primary == null) primary = Math.min(ranges.length - 1, this.sel.primIndex);
      setSelection(this, normalizeSelection(out, primary), options);
    }),
    addSelection: docMethodOp(function(anchor, head, options) {
      var ranges = this.sel.ranges.slice(0);
      ranges.push(new Range(clipPos(this, anchor), clipPos(this, head || anchor)));
      setSelection(this, normalizeSelection(ranges, ranges.length - 1), options);
    }),

    getSelection: function(lineSep) {
      var ranges = this.sel.ranges, lines;
      for (var i = 0; i < ranges.length; i++) {
        var sel = getBetween(this, ranges[i].from(), ranges[i].to());
        lines = lines ? lines.concat(sel) : sel;
      }
      if (lineSep === false) return lines;
      else return lines.join(lineSep || "\n");
    },
    getSelections: function(lineSep) {
      var parts = [], ranges = this.sel.ranges;
      for (var i = 0; i < ranges.length; i++) {
        var sel = getBetween(this, ranges[i].from(), ranges[i].to());
        if (lineSep !== false) sel = sel.join(lineSep || "\n");
        parts[i] = sel;
      }
      return parts;
    },
    replaceSelection: function(code, collapse, origin) {
      var dup = [];
      for (var i = 0; i < this.sel.ranges.length; i++)
        dup[i] = code;
      this.replaceSelections(dup, collapse, origin || "+input");
    },
    replaceSelections: docMethodOp(function(code, collapse, origin) {
      var changes = [], sel = this.sel;
      for (var i = 0; i < sel.ranges.length; i++) {
        var range = sel.ranges[i];
        changes[i] = {from: range.from(), to: range.to(), text: splitLines(code[i]), origin: origin};
      }
      var newSel = collapse && collapse != "end" && computeReplacedSel(this, changes, collapse);
      for (var i = changes.length - 1; i >= 0; i--)
        makeChange(this, changes[i]);
      if (newSel) setSelectionReplaceHistory(this, newSel);
      else if (this.cm) ensureCursorVisible(this.cm);
    }),
    undo: docMethodOp(function() {makeChangeFromHistory(this, "undo");}),
    redo: docMethodOp(function() {makeChangeFromHistory(this, "redo");}),
    undoSelection: docMethodOp(function() {makeChangeFromHistory(this, "undo", true);}),
    redoSelection: docMethodOp(function() {makeChangeFromHistory(this, "redo", true);}),

    setExtending: function(val) {this.extend = val;},
    getExtending: function() {return this.extend;},

    historySize: function() {
      var hist = this.history, done = 0, undone = 0;
      for (var i = 0; i < hist.done.length; i++) if (!hist.done[i].ranges) ++done;
      for (var i = 0; i < hist.undone.length; i++) if (!hist.undone[i].ranges) ++undone;
      return {undo: done, redo: undone};
    },
    clearHistory: function() {this.history = new History(this.history.maxGeneration);},

    markClean: function() {
      this.cleanGeneration = this.changeGeneration(true);
    },
    changeGeneration: function(forceSplit) {
      if (forceSplit)
        this.history.lastOp = this.history.lastOrigin = null;
      return this.history.generation;
    },
    isClean: function (gen) {
      return this.history.generation == (gen || this.cleanGeneration);
    },

    getHistory: function() {
      return {done: copyHistoryArray(this.history.done),
              undone: copyHistoryArray(this.history.undone)};
    },
    setHistory: function(histData) {
      var hist = this.history = new History(this.history.maxGeneration);
      hist.done = copyHistoryArray(histData.done.slice(0), null, true);
      hist.undone = copyHistoryArray(histData.undone.slice(0), null, true);
    },

    markText: function(from, to, options) {
      return markText(this, clipPos(this, from), clipPos(this, to), options, "range");
    },
    setBookmark: function(pos, options) {
      var realOpts = {replacedWith: options && (options.nodeType == null ? options.widget : options),
                      insertLeft: options && options.insertLeft,
                      clearWhenEmpty: false, shared: options && options.shared};
      pos = clipPos(this, pos);
      return markText(this, pos, pos, realOpts, "bookmark");
    },
    findMarksAt: function(pos) {
      pos = clipPos(this, pos);
      var markers = [], spans = getLine(this, pos.line).markedSpans;
      if (spans) for (var i = 0; i < spans.length; ++i) {
        var span = spans[i];
        if ((span.from == null || span.from <= pos.ch) &&
            (span.to == null || span.to >= pos.ch))
          markers.push(span.marker.parent || span.marker);
      }
      return markers;
    },
    findMarks: function(from, to, filter) {
      from = clipPos(this, from); to = clipPos(this, to);
      var found = [], lineNo = from.line;
      this.iter(from.line, to.line + 1, function(line) {
        var spans = line.markedSpans;
        if (spans) for (var i = 0; i < spans.length; i++) {
          var span = spans[i];
          if (!(lineNo == from.line && from.ch > span.to ||
                span.from == null && lineNo != from.line||
                lineNo == to.line && span.from > to.ch) &&
              (!filter || filter(span.marker)))
            found.push(span.marker.parent || span.marker);
        }
        ++lineNo;
      });
      return found;
    },
    getAllMarks: function() {
      var markers = [];
      this.iter(function(line) {
        var sps = line.markedSpans;
        if (sps) for (var i = 0; i < sps.length; ++i)
          if (sps[i].from != null) markers.push(sps[i].marker);
      });
      return markers;
    },

    posFromIndex: function(off) {
      var ch, lineNo = this.first;
      this.iter(function(line) {
        var sz = line.text.length + 1;
        if (sz > off) { ch = off; return true; }
        off -= sz;
        ++lineNo;
      });
      return clipPos(this, Pos(lineNo, ch));
    },
    indexFromPos: function (coords) {
      coords = clipPos(this, coords);
      var index = coords.ch;
      if (coords.line < this.first || coords.ch < 0) return 0;
      this.iter(this.first, coords.line, function (line) {
        index += line.text.length + 1;
      });
      return index;
    },

    copy: function(copyHistory) {
      var doc = new Doc(getLines(this, this.first, this.first + this.size), this.modeOption, this.first);
      doc.scrollTop = this.scrollTop; doc.scrollLeft = this.scrollLeft;
      doc.sel = this.sel;
      doc.extend = false;
      if (copyHistory) {
        doc.history.undoDepth = this.history.undoDepth;
        doc.setHistory(this.getHistory());
      }
      return doc;
    },

    linkedDoc: function(options) {
      if (!options) options = {};
      var from = this.first, to = this.first + this.size;
      if (options.from != null && options.from > from) from = options.from;
      if (options.to != null && options.to < to) to = options.to;
      var copy = new Doc(getLines(this, from, to), options.mode || this.modeOption, from);
      if (options.sharedHist) copy.history = this.history;
      (this.linked || (this.linked = [])).push({doc: copy, sharedHist: options.sharedHist});
      copy.linked = [{doc: this, isParent: true, sharedHist: options.sharedHist}];
      copySharedMarkers(copy, findSharedMarkers(this));
      return copy;
    },
    unlinkDoc: function(other) {
      if (other instanceof CodeMirror) other = other.doc;
      if (this.linked) for (var i = 0; i < this.linked.length; ++i) {
        var link = this.linked[i];
        if (link.doc != other) continue;
        this.linked.splice(i, 1);
        other.unlinkDoc(this);
        detachSharedMarkers(findSharedMarkers(this));
        break;
      }
      // If the histories were shared, split them again
      if (other.history == this.history) {
        var splitIds = [other.id];
        linkedDocs(other, function(doc) {splitIds.push(doc.id);}, true);
        other.history = new History(null);
        other.history.done = copyHistoryArray(this.history.done, splitIds);
        other.history.undone = copyHistoryArray(this.history.undone, splitIds);
      }
    },
    iterLinkedDocs: function(f) {linkedDocs(this, f);},

    getMode: function() {return this.mode;},
    getEditor: function() {return this.cm;}
  });

  // Public alias.
  Doc.prototype.eachLine = Doc.prototype.iter;

  // Set up methods on CodeMirror's prototype to redirect to the editor's document.
  var dontDelegate = "iter insert remove copy getEditor".split(" ");
  for (var prop in Doc.prototype) if (Doc.prototype.hasOwnProperty(prop) && indexOf(dontDelegate, prop) < 0)
    CodeMirror.prototype[prop] = (function(method) {
      return function() {return method.apply(this.doc, arguments);};
    })(Doc.prototype[prop]);

  eventMixin(Doc);

  // Call f for all linked documents.
  function linkedDocs(doc, f, sharedHistOnly) {
    function propagate(doc, skip, sharedHist) {
      if (doc.linked) for (var i = 0; i < doc.linked.length; ++i) {
        var rel = doc.linked[i];
        if (rel.doc == skip) continue;
        var shared = sharedHist && rel.sharedHist;
        if (sharedHistOnly && !shared) continue;
        f(rel.doc, shared);
        propagate(rel.doc, doc, shared);
      }
    }
    propagate(doc, null, true);
  }

  // Attach a document to an editor.
  function attachDoc(cm, doc) {
    if (doc.cm) throw new Error("This document is already in use.");
    cm.doc = doc;
    doc.cm = cm;
    estimateLineHeights(cm);
    loadMode(cm);
    if (!cm.options.lineWrapping) findMaxLine(cm);
    cm.options.mode = doc.modeOption;
    regChange(cm);
  }

  // LINE UTILITIES

  // Find the line object corresponding to the given line number.
  function getLine(doc, n) {
    n -= doc.first;
    if (n < 0 || n >= doc.size) throw new Error("There is no line " + (n + doc.first) + " in the document.");
    for (var chunk = doc; !chunk.lines;) {
      for (var i = 0;; ++i) {
        var child = chunk.children[i], sz = child.chunkSize();
        if (n < sz) { chunk = child; break; }
        n -= sz;
      }
    }
    return chunk.lines[n];
  }

  // Get the part of a document between two positions, as an array of
  // strings.
  function getBetween(doc, start, end) {
    var out = [], n = start.line;
    doc.iter(start.line, end.line + 1, function(line) {
      var text = line.text;
      if (n == end.line) text = text.slice(0, end.ch);
      if (n == start.line) text = text.slice(start.ch);
      out.push(text);
      ++n;
    });
    return out;
  }
  // Get the lines between from and to, as array of strings.
  function getLines(doc, from, to) {
    var out = [];
    doc.iter(from, to, function(line) { out.push(line.text); });
    return out;
  }

  // Update the height of a line, propagating the height change
  // upwards to parent nodes.
  function updateLineHeight(line, height) {
    var diff = height - line.height;
    if (diff) for (var n = line; n; n = n.parent) n.height += diff;
  }

  // Given a line object, find its line number by walking up through
  // its parent links.
  function lineNo(line) {
    if (line.parent == null) return null;
    var cur = line.parent, no = indexOf(cur.lines, line);
    for (var chunk = cur.parent; chunk; cur = chunk, chunk = chunk.parent) {
      for (var i = 0;; ++i) {
        if (chunk.children[i] == cur) break;
        no += chunk.children[i].chunkSize();
      }
    }
    return no + cur.first;
  }

  // Find the line at the given vertical position, using the height
  // information in the document tree.
  function lineAtHeight(chunk, h) {
    var n = chunk.first;
    outer: do {
      for (var i = 0; i < chunk.children.length; ++i) {
        var child = chunk.children[i], ch = child.height;
        if (h < ch) { chunk = child; continue outer; }
        h -= ch;
        n += child.chunkSize();
      }
      return n;
    } while (!chunk.lines);
    for (var i = 0; i < chunk.lines.length; ++i) {
      var line = chunk.lines[i], lh = line.height;
      if (h < lh) break;
      h -= lh;
    }
    return n + i;
  }


  // Find the height above the given line.
  function heightAtLine(lineObj) {
    lineObj = visualLine(lineObj);

    var h = 0, chunk = lineObj.parent;
    for (var i = 0; i < chunk.lines.length; ++i) {
      var line = chunk.lines[i];
      if (line == lineObj) break;
      else h += line.height;
    }
    for (var p = chunk.parent; p; chunk = p, p = chunk.parent) {
      for (var i = 0; i < p.children.length; ++i) {
        var cur = p.children[i];
        if (cur == chunk) break;
        else h += cur.height;
      }
    }
    return h;
  }

  // Get the bidi ordering for the given line (and cache it). Returns
  // false for lines that are fully left-to-right, and an array of
  // BidiSpan objects otherwise.
  function getOrder(line) {
    var order = line.order;
    if (order == null) order = line.order = bidiOrdering(line.text);
    return order;
  }

  // HISTORY

  function History(startGen) {
    // Arrays of change events and selections. Doing something adds an
    // event to done and clears undo. Undoing moves events from done
    // to undone, redoing moves them in the other direction.
    this.done = []; this.undone = [];
    this.undoDepth = Infinity;
    // Used to track when changes can be merged into a single undo
    // event
    this.lastModTime = this.lastSelTime = 0;
    this.lastOp = null;
    this.lastOrigin = this.lastSelOrigin = null;
    // Used by the isClean() method
    this.generation = this.maxGeneration = startGen || 1;
  }

  // Create a history change event from an updateDoc-style change
  // object.
  function historyChangeFromChange(doc, change) {
    var histChange = {from: copyPos(change.from), to: changeEnd(change), text: getBetween(doc, change.from, change.to)};
    attachLocalSpans(doc, histChange, change.from.line, change.to.line + 1);
    linkedDocs(doc, function(doc) {attachLocalSpans(doc, histChange, change.from.line, change.to.line + 1);}, true);
    return histChange;
  }

  // Pop all selection events off the end of a history array. Stop at
  // a change event.
  function clearSelectionEvents(array) {
    while (array.length) {
      var last = lst(array);
      if (last.ranges) array.pop();
      else break;
    }
  }

  // Find the top change event in the history. Pop off selection
  // events that are in the way.
  function lastChangeEvent(hist, force) {
    if (force) {
      clearSelectionEvents(hist.done);
      return lst(hist.done);
    } else if (hist.done.length && !lst(hist.done).ranges) {
      return lst(hist.done);
    } else if (hist.done.length > 1 && !hist.done[hist.done.length - 2].ranges) {
      hist.done.pop();
      return lst(hist.done);
    }
  }

  // Register a change in the history. Merges changes that are within
  // a single operation, ore are close together with an origin that
  // allows merging (starting with "+") into a single event.
  function addChangeToHistory(doc, change, selAfter, opId) {
    var hist = doc.history;
    hist.undone.length = 0;
    var time = +new Date, cur;

    if ((hist.lastOp == opId ||
         hist.lastOrigin == change.origin && change.origin &&
         ((change.origin.charAt(0) == "+" && doc.cm && hist.lastModTime > time - doc.cm.options.historyEventDelay) ||
          change.origin.charAt(0) == "*")) &&
        (cur = lastChangeEvent(hist, hist.lastOp == opId))) {
      // Merge this change into the last event
      var last = lst(cur.changes);
      if (cmp(change.from, change.to) == 0 && cmp(change.from, last.to) == 0) {
        // Optimized case for simple insertion -- don't want to add
        // new changesets for every character typed
        last.to = changeEnd(change);
      } else {
        // Add new sub-event
        cur.changes.push(historyChangeFromChange(doc, change));
      }
    } else {
      // Can not be merged, start a new event.
      var before = lst(hist.done);
      if (!before || !before.ranges)
        pushSelectionToHistory(doc.sel, hist.done);
      cur = {changes: [historyChangeFromChange(doc, change)],
             generation: hist.generation};
      hist.done.push(cur);
      while (hist.done.length > hist.undoDepth) {
        hist.done.shift();
        if (!hist.done[0].ranges) hist.done.shift();
      }
    }
    hist.done.push(selAfter);
    hist.generation = ++hist.maxGeneration;
    hist.lastModTime = hist.lastSelTime = time;
    hist.lastOp = opId;
    hist.lastOrigin = hist.lastSelOrigin = change.origin;

    if (!last) signal(doc, "historyAdded");
  }

  function selectionEventCanBeMerged(doc, origin, prev, sel) {
    var ch = origin.charAt(0);
    return ch == "*" ||
      ch == "+" &&
      prev.ranges.length == sel.ranges.length &&
      prev.somethingSelected() == sel.somethingSelected() &&
      new Date - doc.history.lastSelTime <= (doc.cm ? doc.cm.options.historyEventDelay : 500);
  }

  // Called whenever the selection changes, sets the new selection as
  // the pending selection in the history, and pushes the old pending
  // selection into the 'done' array when it was significantly
  // different (in number of selected ranges, emptiness, or time).
  function addSelectionToHistory(doc, sel, opId, options) {
    var hist = doc.history, origin = options && options.origin;

    // A new event is started when the previous origin does not match
    // the current, or the origins don't allow matching. Origins
    // starting with * are always merged, those starting with + are
    // merged when similar and close together in time.
    if (opId == hist.lastOp ||
        (origin && hist.lastSelOrigin == origin &&
         (hist.lastModTime == hist.lastSelTime && hist.lastOrigin == origin ||
          selectionEventCanBeMerged(doc, origin, lst(hist.done), sel))))
      hist.done[hist.done.length - 1] = sel;
    else
      pushSelectionToHistory(sel, hist.done);

    hist.lastSelTime = +new Date;
    hist.lastSelOrigin = origin;
    hist.lastOp = opId;
    if (options && options.clearRedo !== false)
      clearSelectionEvents(hist.undone);
  }

  function pushSelectionToHistory(sel, dest) {
    var top = lst(dest);
    if (!(top && top.ranges && top.equals(sel)))
      dest.push(sel);
  }

  // Used to store marked span information in the history.
  function attachLocalSpans(doc, change, from, to) {
    var existing = change["spans_" + doc.id], n = 0;
    doc.iter(Math.max(doc.first, from), Math.min(doc.first + doc.size, to), function(line) {
      if (line.markedSpans)
        (existing || (existing = change["spans_" + doc.id] = {}))[n] = line.markedSpans;
      ++n;
    });
  }

  // When un/re-doing restores text containing marked spans, those
  // that have been explicitly cleared should not be restored.
  function removeClearedSpans(spans) {
    if (!spans) return null;
    for (var i = 0, out; i < spans.length; ++i) {
      if (spans[i].marker.explicitlyCleared) { if (!out) out = spans.slice(0, i); }
      else if (out) out.push(spans[i]);
    }
    return !out ? spans : out.length ? out : null;
  }

  // Retrieve and filter the old marked spans stored in a change event.
  function getOldSpans(doc, change) {
    var found = change["spans_" + doc.id];
    if (!found) return null;
    for (var i = 0, nw = []; i < change.text.length; ++i)
      nw.push(removeClearedSpans(found[i]));
    return nw;
  }

  // Used both to provide a JSON-safe object in .getHistory, and, when
  // detaching a document, to split the history in two
  function copyHistoryArray(events, newGroup, instantiateSel) {
    for (var i = 0, copy = []; i < events.length; ++i) {
      var event = events[i];
      if (event.ranges) {
        copy.push(instantiateSel ? Selection.prototype.deepCopy.call(event) : event);
        continue;
      }
      var changes = event.changes, newChanges = [];
      copy.push({changes: newChanges});
      for (var j = 0; j < changes.length; ++j) {
        var change = changes[j], m;
        newChanges.push({from: change.from, to: change.to, text: change.text});
        if (newGroup) for (var prop in change) if (m = prop.match(/^spans_(\d+)$/)) {
          if (indexOf(newGroup, Number(m[1])) > -1) {
            lst(newChanges)[prop] = change[prop];
            delete change[prop];
          }
        }
      }
    }
    return copy;
  }

  // Rebasing/resetting history to deal with externally-sourced changes

  function rebaseHistSelSingle(pos, from, to, diff) {
    if (to < pos.line) {
      pos.line += diff;
    } else if (from < pos.line) {
      pos.line = from;
      pos.ch = 0;
    }
  }

  // Tries to rebase an array of history events given a change in the
  // document. If the change touches the same lines as the event, the
  // event, and everything 'behind' it, is discarded. If the change is
  // before the event, the event's positions are updated. Uses a
  // copy-on-write scheme for the positions, to avoid having to
  // reallocate them all on every rebase, but also avoid problems with
  // shared position objects being unsafely updated.
  function rebaseHistArray(array, from, to, diff) {
    for (var i = 0; i < array.length; ++i) {
      var sub = array[i], ok = true;
      if (sub.ranges) {
        if (!sub.copied) { sub = array[i] = sub.deepCopy(); sub.copied = true; }
        for (var j = 0; j < sub.ranges.length; j++) {
          rebaseHistSelSingle(sub.ranges[j].anchor, from, to, diff);
          rebaseHistSelSingle(sub.ranges[j].head, from, to, diff);
        }
        continue;
      }
      for (var j = 0; j < sub.changes.length; ++j) {
        var cur = sub.changes[j];
        if (to < cur.from.line) {
          cur.from = Pos(cur.from.line + diff, cur.from.ch);
          cur.to = Pos(cur.to.line + diff, cur.to.ch);
        } else if (from <= cur.to.line) {
          ok = false;
          break;
        }
      }
      if (!ok) {
        array.splice(0, i + 1);
        i = 0;
      }
    }
  }

  function rebaseHist(hist, change) {
    var from = change.from.line, to = change.to.line, diff = change.text.length - (to - from) - 1;
    rebaseHistArray(hist.done, from, to, diff);
    rebaseHistArray(hist.undone, from, to, diff);
  }

  // EVENT UTILITIES

  // Due to the fact that we still support jurassic IE versions, some
  // compatibility wrappers are needed.

  var e_preventDefault = CodeMirror.e_preventDefault = function(e) {
    if (e.preventDefault) e.preventDefault();
    else e.returnValue = false;
  };
  var e_stopPropagation = CodeMirror.e_stopPropagation = function(e) {
    if (e.stopPropagation) e.stopPropagation();
    else e.cancelBubble = true;
  };
  function e_defaultPrevented(e) {
    return e.defaultPrevented != null ? e.defaultPrevented : e.returnValue == false;
  }
  var e_stop = CodeMirror.e_stop = function(e) {e_preventDefault(e); e_stopPropagation(e);};

  function e_target(e) {return e.target || e.srcElement;}
  function e_button(e) {
    var b = e.which;
    if (b == null) {
      if (e.button & 1) b = 1;
      else if (e.button & 2) b = 3;
      else if (e.button & 4) b = 2;
    }
    if (mac && e.ctrlKey && b == 1) b = 3;
    return b;
  }

  // EVENT HANDLING

  // Lightweight event framework. on/off also work on DOM nodes,
  // registering native DOM handlers.

  var on = CodeMirror.on = function(emitter, type, f) {
    if (emitter.addEventListener)
      emitter.addEventListener(type, f, false);
    else if (emitter.attachEvent)
      emitter.attachEvent("on" + type, f);
    else {
      var map = emitter._handlers || (emitter._handlers = {});
      var arr = map[type] || (map[type] = []);
      arr.push(f);
    }
  };

  var off = CodeMirror.off = function(emitter, type, f) {
    if (emitter.removeEventListener)
      emitter.removeEventListener(type, f, false);
    else if (emitter.detachEvent)
      emitter.detachEvent("on" + type, f);
    else {
      var arr = emitter._handlers && emitter._handlers[type];
      if (!arr) return;
      for (var i = 0; i < arr.length; ++i)
        if (arr[i] == f) { arr.splice(i, 1); break; }
    }
  };

  var signal = CodeMirror.signal = function(emitter, type /*, values...*/) {
    var arr = emitter._handlers && emitter._handlers[type];
    if (!arr) return;
    var args = Array.prototype.slice.call(arguments, 2);
    for (var i = 0; i < arr.length; ++i) arr[i].apply(null, args);
  };

  // Often, we want to signal events at a point where we are in the
  // middle of some work, but don't want the handler to start calling
  // other methods on the editor, which might be in an inconsistent
  // state or simply not expect any other events to happen.
  // signalLater looks whether there are any handlers, and schedules
  // them to be executed when the last operation ends, or, if no
  // operation is active, when a timeout fires.
  var delayedCallbacks, delayedCallbackDepth = 0;
  function signalLater(emitter, type /*, values...*/) {
    var arr = emitter._handlers && emitter._handlers[type];
    if (!arr) return;
    var args = Array.prototype.slice.call(arguments, 2);
    if (!delayedCallbacks) {
      ++delayedCallbackDepth;
      delayedCallbacks = [];
      setTimeout(fireDelayed, 0);
    }
    function bnd(f) {return function(){f.apply(null, args);};};
    for (var i = 0; i < arr.length; ++i)
      delayedCallbacks.push(bnd(arr[i]));
  }

  function fireDelayed() {
    --delayedCallbackDepth;
    var delayed = delayedCallbacks;
    delayedCallbacks = null;
    for (var i = 0; i < delayed.length; ++i) delayed[i]();
  }

  // The DOM events that CodeMirror handles can be overridden by
  // registering a (non-DOM) handler on the editor for the event name,
  // and preventDefault-ing the event in that handler.
  function signalDOMEvent(cm, e, override) {
    signal(cm, override || e.type, cm, e);
    return e_defaultPrevented(e) || e.codemirrorIgnore;
  }

  function signalCursorActivity(cm) {
    var arr = cm._handlers && cm._handlers.cursorActivity;
    if (!arr) return;
    var set = cm.curOp.cursorActivityHandlers || (cm.curOp.cursorActivityHandlers = []);
    for (var i = 0; i < arr.length; ++i) if (indexOf(set, arr[i]) == -1)
      set.push(arr[i]);
  }

  function hasHandler(emitter, type) {
    var arr = emitter._handlers && emitter._handlers[type];
    return arr && arr.length > 0;
  }

  // Add on and off methods to a constructor's prototype, to make
  // registering events on such objects more convenient.
  function eventMixin(ctor) {
    ctor.prototype.on = function(type, f) {on(this, type, f);};
    ctor.prototype.off = function(type, f) {off(this, type, f);};
  }

  // MISC UTILITIES

  // Number of pixels added to scroller and sizer to hide scrollbar
  var scrollerCutOff = 30;

  // Returned or thrown by various protocols to signal 'I'm not
  // handling this'.
  var Pass = CodeMirror.Pass = {toString: function(){return "CodeMirror.Pass";}};

  // Reused option objects for setSelection & friends
  var sel_dontScroll = {scroll: false}, sel_mouse = {origin: "*mouse"}, sel_move = {origin: "+move"};

  function Delayed() {this.id = null;}
  Delayed.prototype.set = function(ms, f) {
    clearTimeout(this.id);
    this.id = setTimeout(f, ms);
  };

  // Counts the column offset in a string, taking tabs into account.
  // Used mostly to find indentation.
  var countColumn = CodeMirror.countColumn = function(string, end, tabSize, startIndex, startValue) {
    if (end == null) {
      end = string.search(/[^\s\u00a0]/);
      if (end == -1) end = string.length;
    }
    for (var i = startIndex || 0, n = startValue || 0;;) {
      var nextTab = string.indexOf("\t", i);
      if (nextTab < 0 || nextTab >= end)
        return n + (end - i);
      n += nextTab - i;
      n += tabSize - (n % tabSize);
      i = nextTab + 1;
    }
  };

  // The inverse of countColumn -- find the offset that corresponds to
  // a particular column.
  function findColumn(string, goal, tabSize) {
    for (var pos = 0, col = 0;;) {
      var nextTab = string.indexOf("\t", pos);
      if (nextTab == -1) nextTab = string.length;
      var skipped = nextTab - pos;
      if (nextTab == string.length || col + skipped >= goal)
        return pos + Math.min(skipped, goal - col);
      col += nextTab - pos;
      col += tabSize - (col % tabSize);
      pos = nextTab + 1;
      if (col >= goal) return pos;
    }
  }

  var spaceStrs = [""];
  function spaceStr(n) {
    while (spaceStrs.length <= n)
      spaceStrs.push(lst(spaceStrs) + " ");
    return spaceStrs[n];
  }

  function lst(arr) { return arr[arr.length-1]; }

  var selectInput = function(node) { node.select(); };
  if (ios) // Mobile Safari apparently has a bug where select() is broken.
    selectInput = function(node) { node.selectionStart = 0; node.selectionEnd = node.value.length; };
  else if (ie) // Suppress mysterious IE10 errors
    selectInput = function(node) { try { node.select(); } catch(_e) {} };

  function indexOf(array, elt) {
    for (var i = 0; i < array.length; ++i)
      if (array[i] == elt) return i;
    return -1;
  }
  if ([].indexOf) indexOf = function(array, elt) { return array.indexOf(elt); };
  function map(array, f) {
    var out = [];
    for (var i = 0; i < array.length; i++) out[i] = f(array[i], i);
    return out;
  }
  if ([].map) map = function(array, f) { return array.map(f); };

  function createObj(base, props) {
    var inst;
    if (Object.create) {
      inst = Object.create(base);
    } else {
      var ctor = function() {};
      ctor.prototype = base;
      inst = new ctor();
    }
    if (props) copyObj(props, inst);
    return inst;
  };

  function copyObj(obj, target, overwrite) {
    if (!target) target = {};
    for (var prop in obj)
      if (obj.hasOwnProperty(prop) && (overwrite !== false || !target.hasOwnProperty(prop)))
        target[prop] = obj[prop];
    return target;
  }

  function bind(f) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function(){return f.apply(null, args);};
  }

  var nonASCIISingleCaseWordChar = /[\u00df\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
  var isWordCharBasic = CodeMirror.isWordChar = function(ch) {
    return /\w/.test(ch) || ch > "\x80" &&
      (ch.toUpperCase() != ch.toLowerCase() || nonASCIISingleCaseWordChar.test(ch));
  };
  function isWordChar(ch, helper) {
    if (!helper) return isWordCharBasic(ch);
    if (helper.source.indexOf("\\w") > -1 && isWordCharBasic(ch)) return true;
    return helper.test(ch);
  }

  function isEmpty(obj) {
    for (var n in obj) if (obj.hasOwnProperty(n) && obj[n]) return false;
    return true;
  }

  // Extending unicode characters. A series of a non-extending char +
  // any number of extending chars is treated as a single unit as far
  // as editing and measuring is concerned. This is not fully correct,
  // since some scripts/fonts/browsers also treat other configurations
  // of code points as a group.
  var extendingChars = /[\u0300-\u036f\u0483-\u0489\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u065e\u0670\u06d6-\u06dc\u06de-\u06e4\u06e7\u06e8\u06ea-\u06ed\u0711\u0730-\u074a\u07a6-\u07b0\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0900-\u0902\u093c\u0941-\u0948\u094d\u0951-\u0955\u0962\u0963\u0981\u09bc\u09be\u09c1-\u09c4\u09cd\u09d7\u09e2\u09e3\u0a01\u0a02\u0a3c\u0a41\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a70\u0a71\u0a75\u0a81\u0a82\u0abc\u0ac1-\u0ac5\u0ac7\u0ac8\u0acd\u0ae2\u0ae3\u0b01\u0b3c\u0b3e\u0b3f\u0b41-\u0b44\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b82\u0bbe\u0bc0\u0bcd\u0bd7\u0c3e-\u0c40\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0cbc\u0cbf\u0cc2\u0cc6\u0ccc\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0d3e\u0d41-\u0d44\u0d4d\u0d57\u0d62\u0d63\u0dca\u0dcf\u0dd2-\u0dd4\u0dd6\u0ddf\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0f18\u0f19\u0f35\u0f37\u0f39\u0f71-\u0f7e\u0f80-\u0f84\u0f86\u0f87\u0f90-\u0f97\u0f99-\u0fbc\u0fc6\u102d-\u1030\u1032-\u1037\u1039\u103a\u103d\u103e\u1058\u1059\u105e-\u1060\u1071-\u1074\u1082\u1085\u1086\u108d\u109d\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b7-\u17bd\u17c6\u17c9-\u17d3\u17dd\u180b-\u180d\u18a9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193b\u1a17\u1a18\u1a56\u1a58-\u1a5e\u1a60\u1a62\u1a65-\u1a6c\u1a73-\u1a7c\u1a7f\u1b00-\u1b03\u1b34\u1b36-\u1b3a\u1b3c\u1b42\u1b6b-\u1b73\u1b80\u1b81\u1ba2-\u1ba5\u1ba8\u1ba9\u1c2c-\u1c33\u1c36\u1c37\u1cd0-\u1cd2\u1cd4-\u1ce0\u1ce2-\u1ce8\u1ced\u1dc0-\u1de6\u1dfd-\u1dff\u200c\u200d\u20d0-\u20f0\u2cef-\u2cf1\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua66f-\ua672\ua67c\ua67d\ua6f0\ua6f1\ua802\ua806\ua80b\ua825\ua826\ua8c4\ua8e0-\ua8f1\ua926-\ua92d\ua947-\ua951\ua980-\ua982\ua9b3\ua9b6-\ua9b9\ua9bc\uaa29-\uaa2e\uaa31\uaa32\uaa35\uaa36\uaa43\uaa4c\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uabe5\uabe8\uabed\udc00-\udfff\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\uff9e\uff9f]/;
  function isExtendingChar(ch) { return ch.charCodeAt(0) >= 768 && extendingChars.test(ch); }

  // DOM UTILITIES

  function elt(tag, content, className, style) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (style) e.style.cssText = style;
    if (typeof content == "string") e.appendChild(document.createTextNode(content));
    else if (content) for (var i = 0; i < content.length; ++i) e.appendChild(content[i]);
    return e;
  }

  var range;
  if (document.createRange) range = function(node, start, end) {
    var r = document.createRange();
    r.setEnd(node, end);
    r.setStart(node, start);
    return r;
  };
  else range = function(node, start, end) {
    var r = document.body.createTextRange();
    r.moveToElementText(node.parentNode);
    r.collapse(true);
    r.moveEnd("character", end);
    r.moveStart("character", start);
    return r;
  };

  function removeChildren(e) {
    for (var count = e.childNodes.length; count > 0; --count)
      e.removeChild(e.firstChild);
    return e;
  }

  function removeChildrenAndAdd(parent, e) {
    return removeChildren(parent).appendChild(e);
  }

  function contains(parent, child) {
    if (parent.contains)
      return parent.contains(child);
    while (child = child.parentNode)
      if (child == parent) return true;
  }

  function activeElt() { return document.activeElement; }
  // Older versions of IE throws unspecified error when touching
  // document.activeElement in some cases (during loading, in iframe)
  if (ie_upto10) activeElt = function() {
    try { return document.activeElement; }
    catch(e) { return document.body; }
  };

  function classTest(cls) { return new RegExp("\\b" + cls + "\\b\\s*"); }
  function rmClass(node, cls) {
    var test = classTest(cls);
    if (test.test(node.className)) node.className = node.className.replace(test, "");
  }
  function addClass(node, cls) {
    if (!classTest(cls).test(node.className)) node.className += " " + cls;
  }
  function joinClasses(a, b) {
    var as = a.split(" ");
    for (var i = 0; i < as.length; i++)
      if (as[i] && !classTest(as[i]).test(b)) b += " " + as[i];
    return b;
  }

  // WINDOW-WIDE EVENTS

  // These must be handled carefully, because naively registering a
  // handler for each editor will cause the editors to never be
  // garbage collected.

  function forEachCodeMirror(f) {
    if (!document.body.getElementsByClassName) return;
    var byClass = document.body.getElementsByClassName("CodeMirror");
    for (var i = 0; i < byClass.length; i++) {
      var cm = byClass[i].CodeMirror;
      if (cm) f(cm);
    }
  }

  var globalsRegistered = false;
  function ensureGlobalHandlers() {
    if (globalsRegistered) return;
    registerGlobalHandlers();
    globalsRegistered = true;
  }
  function registerGlobalHandlers() {
    // When the window resizes, we need to refresh active editors.
    var resizeTimer;
    on(window, "resize", function() {
      if (resizeTimer == null) resizeTimer = setTimeout(function() {
        resizeTimer = null;
        knownScrollbarWidth = null;
        forEachCodeMirror(onResize);
      }, 100);
    });
    // When the window loses focus, we want to show the editor as blurred
    on(window, "blur", function() {
      forEachCodeMirror(onBlur);
    });
  }

  // FEATURE DETECTION

  // Detect drag-and-drop
  var dragAndDrop = function() {
    // There is *some* kind of drag-and-drop support in IE6-8, but I
    // couldn't get it to work yet.
    if (ie_upto8) return false;
    var div = elt('div');
    return "draggable" in div || "dragDrop" in div;
  }();

  var knownScrollbarWidth;
  function scrollbarWidth(measure) {
    if (knownScrollbarWidth != null) return knownScrollbarWidth;
    var test = elt("div", null, null, "width: 50px; height: 50px; overflow-x: scroll");
    removeChildrenAndAdd(measure, test);
    if (test.offsetWidth)
      knownScrollbarWidth = test.offsetHeight - test.clientHeight;
    return knownScrollbarWidth || 0;
  }

  var zwspSupported;
  function zeroWidthElement(measure) {
    if (zwspSupported == null) {
      var test = elt("span", "\u200b");
      removeChildrenAndAdd(measure, elt("span", [test, document.createTextNode("x")]));
      if (measure.firstChild.offsetHeight != 0)
        zwspSupported = test.offsetWidth <= 1 && test.offsetHeight > 2 && !ie_upto7;
    }
    if (zwspSupported) return elt("span", "\u200b");
    else return elt("span", "\u00a0", null, "display: inline-block; width: 1px; margin-right: -1px");
  }

  // Feature-detect IE's crummy client rect reporting for bidi text
  var badBidiRects;
  function hasBadBidiRects(measure) {
    if (badBidiRects != null) return badBidiRects;
    var txt = removeChildrenAndAdd(measure, document.createTextNode("A\u062eA"));
    var r0 = range(txt, 0, 1).getBoundingClientRect();
    if (r0.left == r0.right) return false;
    var r1 = range(txt, 1, 2).getBoundingClientRect();
    return badBidiRects = (r1.right - r0.right < 3);
  }

  // See if "".split is the broken IE version, if so, provide an
  // alternative way to split lines.
  var splitLines = CodeMirror.splitLines = "\n\nb".split(/\n/).length != 3 ? function(string) {
    var pos = 0, result = [], l = string.length;
    while (pos <= l) {
      var nl = string.indexOf("\n", pos);
      if (nl == -1) nl = string.length;
      var line = string.slice(pos, string.charAt(nl - 1) == "\r" ? nl - 1 : nl);
      var rt = line.indexOf("\r");
      if (rt != -1) {
        result.push(line.slice(0, rt));
        pos += rt + 1;
      } else {
        result.push(line);
        pos = nl + 1;
      }
    }
    return result;
  } : function(string){return string.split(/\r\n?|\n/);};

  var hasSelection = window.getSelection ? function(te) {
    try { return te.selectionStart != te.selectionEnd; }
    catch(e) { return false; }
  } : function(te) {
    try {var range = te.ownerDocument.selection.createRange();}
    catch(e) {}
    if (!range || range.parentElement() != te) return false;
    return range.compareEndPoints("StartToEnd", range) != 0;
  };

  var hasCopyEvent = (function() {
    var e = elt("div");
    if ("oncopy" in e) return true;
    e.setAttribute("oncopy", "return;");
    return typeof e.oncopy == "function";
  })();

  // KEY NAMES

  var keyNames = {3: "Enter", 8: "Backspace", 9: "Tab", 13: "Enter", 16: "Shift", 17: "Ctrl", 18: "Alt",
                  19: "Pause", 20: "CapsLock", 27: "Esc", 32: "Space", 33: "PageUp", 34: "PageDown", 35: "End",
                  36: "Home", 37: "Left", 38: "Up", 39: "Right", 40: "Down", 44: "PrintScrn", 45: "Insert",
                  46: "Delete", 59: ";", 61: "=", 91: "Mod", 92: "Mod", 93: "Mod", 107: "=", 109: "-", 127: "Delete",
                  173: "-", 186: ";", 187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`", 219: "[", 220: "\\",
                  221: "]", 222: "'", 63232: "Up", 63233: "Down", 63234: "Left", 63235: "Right", 63272: "Delete",
                  63273: "Home", 63275: "End", 63276: "PageUp", 63277: "PageDown", 63302: "Insert"};
  CodeMirror.keyNames = keyNames;
  (function() {
    // Number keys
    for (var i = 0; i < 10; i++) keyNames[i + 48] = keyNames[i + 96] = String(i);
    // Alphabetic keys
    for (var i = 65; i <= 90; i++) keyNames[i] = String.fromCharCode(i);
    // Function keys
    for (var i = 1; i <= 12; i++) keyNames[i + 111] = keyNames[i + 63235] = "F" + i;
  })();

  // BIDI HELPERS

  function iterateBidiSections(order, from, to, f) {
    if (!order) return f(from, to, "ltr");
    var found = false;
    for (var i = 0; i < order.length; ++i) {
      var part = order[i];
      if (part.from < to && part.to > from || from == to && part.to == from) {
        f(Math.max(part.from, from), Math.min(part.to, to), part.level == 1 ? "rtl" : "ltr");
        found = true;
      }
    }
    if (!found) f(from, to, "ltr");
  }

  function bidiLeft(part) { return part.level % 2 ? part.to : part.from; }
  function bidiRight(part) { return part.level % 2 ? part.from : part.to; }

  function lineLeft(line) { var order = getOrder(line); return order ? bidiLeft(order[0]) : 0; }
  function lineRight(line) {
    var order = getOrder(line);
    if (!order) return line.text.length;
    return bidiRight(lst(order));
  }

  function lineStart(cm, lineN) {
    var line = getLine(cm.doc, lineN);
    var visual = visualLine(line);
    if (visual != line) lineN = lineNo(visual);
    var order = getOrder(visual);
    var ch = !order ? 0 : order[0].level % 2 ? lineRight(visual) : lineLeft(visual);
    return Pos(lineN, ch);
  }
  function lineEnd(cm, lineN) {
    var merged, line = getLine(cm.doc, lineN);
    while (merged = collapsedSpanAtEnd(line)) {
      line = merged.find(1, true).line;
      lineN = null;
    }
    var order = getOrder(line);
    var ch = !order ? line.text.length : order[0].level % 2 ? lineLeft(line) : lineRight(line);
    return Pos(lineN == null ? lineNo(line) : lineN, ch);
  }

  function compareBidiLevel(order, a, b) {
    var linedir = order[0].level;
    if (a == linedir) return true;
    if (b == linedir) return false;
    return a < b;
  }
  var bidiOther;
  function getBidiPartAt(order, pos) {
    bidiOther = null;
    for (var i = 0, found; i < order.length; ++i) {
      var cur = order[i];
      if (cur.from < pos && cur.to > pos) return i;
      if ((cur.from == pos || cur.to == pos)) {
        if (found == null) {
          found = i;
        } else if (compareBidiLevel(order, cur.level, order[found].level)) {
          if (cur.from != cur.to) bidiOther = found;
          return i;
        } else {
          if (cur.from != cur.to) bidiOther = i;
          return found;
        }
      }
    }
    return found;
  }

  function moveInLine(line, pos, dir, byUnit) {
    if (!byUnit) return pos + dir;
    do pos += dir;
    while (pos > 0 && isExtendingChar(line.text.charAt(pos)));
    return pos;
  }

  // This is needed in order to move 'visually' through bi-directional
  // text -- i.e., pressing left should make the cursor go left, even
  // when in RTL text. The tricky part is the 'jumps', where RTL and
  // LTR text touch each other. This often requires the cursor offset
  // to move more than one unit, in order to visually move one unit.
  function moveVisually(line, start, dir, byUnit) {
    var bidi = getOrder(line);
    if (!bidi) return moveLogically(line, start, dir, byUnit);
    var pos = getBidiPartAt(bidi, start), part = bidi[pos];
    var target = moveInLine(line, start, part.level % 2 ? -dir : dir, byUnit);

    for (;;) {
      if (target > part.from && target < part.to) return target;
      if (target == part.from || target == part.to) {
        if (getBidiPartAt(bidi, target) == pos) return target;
        part = bidi[pos += dir];
        return (dir > 0) == part.level % 2 ? part.to : part.from;
      } else {
        part = bidi[pos += dir];
        if (!part) return null;
        if ((dir > 0) == part.level % 2)
          target = moveInLine(line, part.to, -1, byUnit);
        else
          target = moveInLine(line, part.from, 1, byUnit);
      }
    }
  }

  function moveLogically(line, start, dir, byUnit) {
    var target = start + dir;
    if (byUnit) while (target > 0 && isExtendingChar(line.text.charAt(target))) target += dir;
    return target < 0 || target > line.text.length ? null : target;
  }

  // Bidirectional ordering algorithm
  // See http://unicode.org/reports/tr9/tr9-13.html for the algorithm
  // that this (partially) implements.

  // One-char codes used for character types:
  // L (L):   Left-to-Right
  // R (R):   Right-to-Left
  // r (AL):  Right-to-Left Arabic
  // 1 (EN):  European Number
  // + (ES):  European Number Separator
  // % (ET):  European Number Terminator
  // n (AN):  Arabic Number
  // , (CS):  Common Number Separator
  // m (NSM): Non-Spacing Mark
  // b (BN):  Boundary Neutral
  // s (B):   Paragraph Separator
  // t (S):   Segment Separator
  // w (WS):  Whitespace
  // N (ON):  Other Neutrals

  // Returns null if characters are ordered as they appear
  // (left-to-right), or an array of sections ({from, to, level}
  // objects) in the order in which they occur visually.
  var bidiOrdering = (function() {
    // Character types for codepoints 0 to 0xff
    var lowTypes = "bbbbbbbbbtstwsbbbbbbbbbbbbbbssstwNN%%%NNNNNN,N,N1111111111NNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNbbbbbbsbbbbbbbbbbbbbbbbbbbbbbbbbb,N%%%%NNNNLNNNNN%%11NLNNN1LNNNNNLLLLLLLLLLLLLLLLLLLLLLLNLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLN";
    // Character types for codepoints 0x600 to 0x6ff
    var arabicTypes = "rrrrrrrrrrrr,rNNmmmmmmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmrrrrrrrnnnnnnnnnn%nnrrrmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmmmmmmNmmmm";
    function charType(code) {
      if (code <= 0xf7) return lowTypes.charAt(code);
      else if (0x590 <= code && code <= 0x5f4) return "R";
      else if (0x600 <= code && code <= 0x6ed) return arabicTypes.charAt(code - 0x600);
      else if (0x6ee <= code && code <= 0x8ac) return "r";
      else if (0x2000 <= code && code <= 0x200b) return "w";
      else if (code == 0x200c) return "b";
      else return "L";
    }

    var bidiRE = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
    var isNeutral = /[stwN]/, isStrong = /[LRr]/, countsAsLeft = /[Lb1n]/, countsAsNum = /[1n]/;
    // Browsers seem to always treat the boundaries of block elements as being L.
    var outerType = "L";

    function BidiSpan(level, from, to) {
      this.level = level;
      this.from = from; this.to = to;
    }

    return function(str) {
      if (!bidiRE.test(str)) return false;
      var len = str.length, types = [];
      for (var i = 0, type; i < len; ++i)
        types.push(type = charType(str.charCodeAt(i)));

      // W1. Examine each non-spacing mark (NSM) in the level run, and
      // change the type of the NSM to the type of the previous
      // character. If the NSM is at the start of the level run, it will
      // get the type of sor.
      for (var i = 0, prev = outerType; i < len; ++i) {
        var type = types[i];
        if (type == "m") types[i] = prev;
        else prev = type;
      }

      // W2. Search backwards from each instance of a European number
      // until the first strong type (R, L, AL, or sor) is found. If an
      // AL is found, change the type of the European number to Arabic
      // number.
      // W3. Change all ALs to R.
      for (var i = 0, cur = outerType; i < len; ++i) {
        var type = types[i];
        if (type == "1" && cur == "r") types[i] = "n";
        else if (isStrong.test(type)) { cur = type; if (type == "r") types[i] = "R"; }
      }

      // W4. A single European separator between two European numbers
      // changes to a European number. A single common separator between
      // two numbers of the same type changes to that type.
      for (var i = 1, prev = types[0]; i < len - 1; ++i) {
        var type = types[i];
        if (type == "+" && prev == "1" && types[i+1] == "1") types[i] = "1";
        else if (type == "," && prev == types[i+1] &&
                 (prev == "1" || prev == "n")) types[i] = prev;
        prev = type;
      }

      // W5. A sequence of European terminators adjacent to European
      // numbers changes to all European numbers.
      // W6. Otherwise, separators and terminators change to Other
      // Neutral.
      for (var i = 0; i < len; ++i) {
        var type = types[i];
        if (type == ",") types[i] = "N";
        else if (type == "%") {
          for (var end = i + 1; end < len && types[end] == "%"; ++end) {}
          var replace = (i && types[i-1] == "!") || (end < len && types[end] == "1") ? "1" : "N";
          for (var j = i; j < end; ++j) types[j] = replace;
          i = end - 1;
        }
      }

      // W7. Search backwards from each instance of a European number
      // until the first strong type (R, L, or sor) is found. If an L is
      // found, then change the type of the European number to L.
      for (var i = 0, cur = outerType; i < len; ++i) {
        var type = types[i];
        if (cur == "L" && type == "1") types[i] = "L";
        else if (isStrong.test(type)) cur = type;
      }

      // N1. A sequence of neutrals takes the direction of the
      // surrounding strong text if the text on both sides has the same
      // direction. European and Arabic numbers act as if they were R in
      // terms of their influence on neutrals. Start-of-level-run (sor)
      // and end-of-level-run (eor) are used at level run boundaries.
      // N2. Any remaining neutrals take the embedding direction.
      for (var i = 0; i < len; ++i) {
        if (isNeutral.test(types[i])) {
          for (var end = i + 1; end < len && isNeutral.test(types[end]); ++end) {}
          var before = (i ? types[i-1] : outerType) == "L";
          var after = (end < len ? types[end] : outerType) == "L";
          var replace = before || after ? "L" : "R";
          for (var j = i; j < end; ++j) types[j] = replace;
          i = end - 1;
        }
      }

      // Here we depart from the documented algorithm, in order to avoid
      // building up an actual levels array. Since there are only three
      // levels (0, 1, 2) in an implementation that doesn't take
      // explicit embedding into account, we can build up the order on
      // the fly, without following the level-based algorithm.
      var order = [], m;
      for (var i = 0; i < len;) {
        if (countsAsLeft.test(types[i])) {
          var start = i;
          for (++i; i < len && countsAsLeft.test(types[i]); ++i) {}
          order.push(new BidiSpan(0, start, i));
        } else {
          var pos = i, at = order.length;
          for (++i; i < len && types[i] != "L"; ++i) {}
          for (var j = pos; j < i;) {
            if (countsAsNum.test(types[j])) {
              if (pos < j) order.splice(at, 0, new BidiSpan(1, pos, j));
              var nstart = j;
              for (++j; j < i && countsAsNum.test(types[j]); ++j) {}
              order.splice(at, 0, new BidiSpan(2, nstart, j));
              pos = j;
            } else ++j;
          }
          if (pos < i) order.splice(at, 0, new BidiSpan(1, pos, i));
        }
      }
      if (order[0].level == 1 && (m = str.match(/^\s+/))) {
        order[0].from = m[0].length;
        order.unshift(new BidiSpan(0, 0, m[0].length));
      }
      if (lst(order).level == 1 && (m = str.match(/\s+$/))) {
        lst(order).to -= m[0].length;
        order.push(new BidiSpan(0, len - m[0].length, len));
      }
      if (order[0].level != lst(order).level)
        order.push(new BidiSpan(order[0].level, len, len));

      return order;
    };
  })();

  // THE END

  CodeMirror.version = "4.2.0";

  return CodeMirror;
});

},{}],9:[function(require,module,exports){
// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

// TODO actually recognize syntax of TypeScript constructs

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("javascript", function(config, parserConfig) {
  var indentUnit = config.indentUnit;
  var statementIndent = parserConfig.statementIndent;
  var jsonldMode = parserConfig.jsonld;
  var jsonMode = parserConfig.json || jsonldMode;
  var isTS = parserConfig.typescript;

  // Tokenizer

  var keywords = function(){
    function kw(type) {return {type: type, style: "keyword"};}
    var A = kw("keyword a"), B = kw("keyword b"), C = kw("keyword c");
    var operator = kw("operator"), atom = {type: "atom", style: "atom"};

    var jsKeywords = {
      "if": kw("if"), "while": A, "with": A, "else": B, "do": B, "try": B, "finally": B,
      "return": C, "break": C, "continue": C, "new": C, "delete": C, "throw": C, "debugger": C,
      "var": kw("var"), "const": kw("var"), "let": kw("var"),
      "function": kw("function"), "catch": kw("catch"),
      "for": kw("for"), "switch": kw("switch"), "case": kw("case"), "default": kw("default"),
      "in": operator, "typeof": operator, "instanceof": operator,
      "true": atom, "false": atom, "null": atom, "undefined": atom, "NaN": atom, "Infinity": atom,
      "this": kw("this"), "module": kw("module"), "class": kw("class"), "super": kw("atom"),
      "yield": C, "export": kw("export"), "import": kw("import"), "extends": C
    };

    // Extend the 'normal' keywords with the TypeScript language extensions
    if (isTS) {
      var type = {type: "variable", style: "variable-3"};
      var tsKeywords = {
        // object-like things
        "interface": kw("interface"),
        "extends": kw("extends"),
        "constructor": kw("constructor"),

        // scope modifiers
        "public": kw("public"),
        "private": kw("private"),
        "protected": kw("protected"),
        "static": kw("static"),

        // types
        "string": type, "number": type, "bool": type, "any": type
      };

      for (var attr in tsKeywords) {
        jsKeywords[attr] = tsKeywords[attr];
      }
    }

    return jsKeywords;
  }();

  var isOperatorChar = /[+\-*&%=<>!?|~^]/;
  var isJsonldKeyword = /^@(context|id|value|language|type|container|list|set|reverse|index|base|vocab|graph)"/;

  function readRegexp(stream) {
    var escaped = false, next, inSet = false;
    while ((next = stream.next()) != null) {
      if (!escaped) {
        if (next == "/" && !inSet) return;
        if (next == "[") inSet = true;
        else if (inSet && next == "]") inSet = false;
      }
      escaped = !escaped && next == "\\";
    }
  }

  // Used as scratch variables to communicate multiple values without
  // consing up tons of objects.
  var type, content;
  function ret(tp, style, cont) {
    type = tp; content = cont;
    return style;
  }
  function tokenBase(stream, state) {
    var ch = stream.next();
    if (ch == '"' || ch == "'") {
      state.tokenize = tokenString(ch);
      return state.tokenize(stream, state);
    } else if (ch == "." && stream.match(/^\d+(?:[eE][+\-]?\d+)?/)) {
      return ret("number", "number");
    } else if (ch == "." && stream.match("..")) {
      return ret("spread", "meta");
    } else if (/[\[\]{}\(\),;\:\.]/.test(ch)) {
      return ret(ch);
    } else if (ch == "=" && stream.eat(">")) {
      return ret("=>", "operator");
    } else if (ch == "0" && stream.eat(/x/i)) {
      stream.eatWhile(/[\da-f]/i);
      return ret("number", "number");
    } else if (/\d/.test(ch)) {
      stream.match(/^\d*(?:\.\d*)?(?:[eE][+\-]?\d+)?/);
      return ret("number", "number");
    } else if (ch == "/") {
      if (stream.eat("*")) {
        state.tokenize = tokenComment;
        return tokenComment(stream, state);
      } else if (stream.eat("/")) {
        stream.skipToEnd();
        return ret("comment", "comment");
      } else if (state.lastType == "operator" || state.lastType == "keyword c" ||
               state.lastType == "sof" || /^[\[{}\(,;:]$/.test(state.lastType)) {
        readRegexp(stream);
        stream.eatWhile(/[gimy]/); // 'y' is "sticky" option in Mozilla
        return ret("regexp", "string-2");
      } else {
        stream.eatWhile(isOperatorChar);
        return ret("operator", "operator", stream.current());
      }
    } else if (ch == "`") {
      state.tokenize = tokenQuasi;
      return tokenQuasi(stream, state);
    } else if (ch == "#") {
      stream.skipToEnd();
      return ret("error", "error");
    } else if (isOperatorChar.test(ch)) {
      stream.eatWhile(isOperatorChar);
      return ret("operator", "operator", stream.current());
    } else {
      stream.eatWhile(/[\w\$_]/);
      var word = stream.current(), known = keywords.propertyIsEnumerable(word) && keywords[word];
      return (known && state.lastType != ".") ? ret(known.type, known.style, word) :
                     ret("variable", "variable", word);
    }
  }

  function tokenString(quote) {
    return function(stream, state) {
      var escaped = false, next;
      if (jsonldMode && stream.peek() == "@" && stream.match(isJsonldKeyword)){
        state.tokenize = tokenBase;
        return ret("jsonld-keyword", "meta");
      }
      while ((next = stream.next()) != null) {
        if (next == quote && !escaped) break;
        escaped = !escaped && next == "\\";
      }
      if (!escaped) state.tokenize = tokenBase;
      return ret("string", "string");
    };
  }

  function tokenComment(stream, state) {
    var maybeEnd = false, ch;
    while (ch = stream.next()) {
      if (ch == "/" && maybeEnd) {
        state.tokenize = tokenBase;
        break;
      }
      maybeEnd = (ch == "*");
    }
    return ret("comment", "comment");
  }

  function tokenQuasi(stream, state) {
    var escaped = false, next;
    while ((next = stream.next()) != null) {
      if (!escaped && (next == "`" || next == "$" && stream.eat("{"))) {
        state.tokenize = tokenBase;
        break;
      }
      escaped = !escaped && next == "\\";
    }
    return ret("quasi", "string-2", stream.current());
  }

  var brackets = "([{}])";
  // This is a crude lookahead trick to try and notice that we're
  // parsing the argument patterns for a fat-arrow function before we
  // actually hit the arrow token. It only works if the arrow is on
  // the same line as the arguments and there's no strange noise
  // (comments) in between. Fallback is to only notice when we hit the
  // arrow, and not declare the arguments as locals for the arrow
  // body.
  function findFatArrow(stream, state) {
    if (state.fatArrowAt) state.fatArrowAt = null;
    var arrow = stream.string.indexOf("=>", stream.start);
    if (arrow < 0) return;

    var depth = 0, sawSomething = false;
    for (var pos = arrow - 1; pos >= 0; --pos) {
      var ch = stream.string.charAt(pos);
      var bracket = brackets.indexOf(ch);
      if (bracket >= 0 && bracket < 3) {
        if (!depth) { ++pos; break; }
        if (--depth == 0) break;
      } else if (bracket >= 3 && bracket < 6) {
        ++depth;
      } else if (/[$\w]/.test(ch)) {
        sawSomething = true;
      } else if (sawSomething && !depth) {
        ++pos;
        break;
      }
    }
    if (sawSomething && !depth) state.fatArrowAt = pos;
  }

  // Parser

  var atomicTypes = {"atom": true, "number": true, "variable": true, "string": true, "regexp": true, "this": true, "jsonld-keyword": true};

  function JSLexical(indented, column, type, align, prev, info) {
    this.indented = indented;
    this.column = column;
    this.type = type;
    this.prev = prev;
    this.info = info;
    if (align != null) this.align = align;
  }

  function inScope(state, varname) {
    for (var v = state.localVars; v; v = v.next)
      if (v.name == varname) return true;
    for (var cx = state.context; cx; cx = cx.prev) {
      for (var v = cx.vars; v; v = v.next)
        if (v.name == varname) return true;
    }
  }

  function parseJS(state, style, type, content, stream) {
    var cc = state.cc;
    // Communicate our context to the combinators.
    // (Less wasteful than consing up a hundred closures on every call.)
    cx.state = state; cx.stream = stream; cx.marked = null, cx.cc = cc;

    if (!state.lexical.hasOwnProperty("align"))
      state.lexical.align = true;

    while(true) {
      var combinator = cc.length ? cc.pop() : jsonMode ? expression : statement;
      if (combinator(type, content)) {
        while(cc.length && cc[cc.length - 1].lex)
          cc.pop()();
        if (cx.marked) return cx.marked;
        if (type == "variable" && inScope(state, content)) return "variable-2";
        return style;
      }
    }
  }

  // Combinator utils

  var cx = {state: null, column: null, marked: null, cc: null};
  function pass() {
    for (var i = arguments.length - 1; i >= 0; i--) cx.cc.push(arguments[i]);
  }
  function cont() {
    pass.apply(null, arguments);
    return true;
  }
  function register(varname) {
    function inList(list) {
      for (var v = list; v; v = v.next)
        if (v.name == varname) return true;
      return false;
    }
    var state = cx.state;
    if (state.context) {
      cx.marked = "def";
      if (inList(state.localVars)) return;
      state.localVars = {name: varname, next: state.localVars};
    } else {
      if (inList(state.globalVars)) return;
      if (parserConfig.globalVars)
        state.globalVars = {name: varname, next: state.globalVars};
    }
  }

  // Combinators

  var defaultVars = {name: "this", next: {name: "arguments"}};
  function pushcontext() {
    cx.state.context = {prev: cx.state.context, vars: cx.state.localVars};
    cx.state.localVars = defaultVars;
  }
  function popcontext() {
    cx.state.localVars = cx.state.context.vars;
    cx.state.context = cx.state.context.prev;
  }
  function pushlex(type, info) {
    var result = function() {
      var state = cx.state, indent = state.indented;
      if (state.lexical.type == "stat") indent = state.lexical.indented;
      state.lexical = new JSLexical(indent, cx.stream.column(), type, null, state.lexical, info);
    };
    result.lex = true;
    return result;
  }
  function poplex() {
    var state = cx.state;
    if (state.lexical.prev) {
      if (state.lexical.type == ")")
        state.indented = state.lexical.indented;
      state.lexical = state.lexical.prev;
    }
  }
  poplex.lex = true;

  function expect(wanted) {
    function exp(type) {
      if (type == wanted) return cont();
      else if (wanted == ";") return pass();
      else return cont(exp);
    };
    return exp;
  }

  function statement(type, value) {
    if (type == "var") return cont(pushlex("vardef", value.length), vardef, expect(";"), poplex);
    if (type == "keyword a") return cont(pushlex("form"), expression, statement, poplex);
    if (type == "keyword b") return cont(pushlex("form"), statement, poplex);
    if (type == "{") return cont(pushlex("}"), block, poplex);
    if (type == ";") return cont();
    if (type == "if") {
      if (cx.state.lexical.info == "else" && cx.state.cc[cx.state.cc.length - 1] == poplex)
        cx.state.cc.pop()();
      return cont(pushlex("form"), expression, statement, poplex, maybeelse);
    }
    if (type == "function") return cont(functiondef);
    if (type == "for") return cont(pushlex("form"), forspec, statement, poplex);
    if (type == "variable") return cont(pushlex("stat"), maybelabel);
    if (type == "switch") return cont(pushlex("form"), expression, pushlex("}", "switch"), expect("{"),
                                      block, poplex, poplex);
    if (type == "case") return cont(expression, expect(":"));
    if (type == "default") return cont(expect(":"));
    if (type == "catch") return cont(pushlex("form"), pushcontext, expect("("), funarg, expect(")"),
                                     statement, poplex, popcontext);
    if (type == "module") return cont(pushlex("form"), pushcontext, afterModule, popcontext, poplex);
    if (type == "class") return cont(pushlex("form"), className, objlit, poplex);
    if (type == "export") return cont(pushlex("form"), afterExport, poplex);
    if (type == "import") return cont(pushlex("form"), afterImport, poplex);
    return pass(pushlex("stat"), expression, expect(";"), poplex);
  }
  function expression(type) {
    return expressionInner(type, false);
  }
  function expressionNoComma(type) {
    return expressionInner(type, true);
  }
  function expressionInner(type, noComma) {
    if (cx.state.fatArrowAt == cx.stream.start) {
      var body = noComma ? arrowBodyNoComma : arrowBody;
      if (type == "(") return cont(pushcontext, pushlex(")"), commasep(pattern, ")"), poplex, expect("=>"), body, popcontext);
      else if (type == "variable") return pass(pushcontext, pattern, expect("=>"), body, popcontext);
    }

    var maybeop = noComma ? maybeoperatorNoComma : maybeoperatorComma;
    if (atomicTypes.hasOwnProperty(type)) return cont(maybeop);
    if (type == "function") return cont(functiondef, maybeop);
    if (type == "keyword c") return cont(noComma ? maybeexpressionNoComma : maybeexpression);
    if (type == "(") return cont(pushlex(")"), maybeexpression, comprehension, expect(")"), poplex, maybeop);
    if (type == "operator" || type == "spread") return cont(noComma ? expressionNoComma : expression);
    if (type == "[") return cont(pushlex("]"), arrayLiteral, poplex, maybeop);
    if (type == "{") return contCommasep(objprop, "}", null, maybeop);
    if (type == "quasi") { return pass(quasi, maybeop); }
    return cont();
  }
  function maybeexpression(type) {
    if (type.match(/[;\}\)\],]/)) return pass();
    return pass(expression);
  }
  function maybeexpressionNoComma(type) {
    if (type.match(/[;\}\)\],]/)) return pass();
    return pass(expressionNoComma);
  }

  function maybeoperatorComma(type, value) {
    if (type == ",") return cont(expression);
    return maybeoperatorNoComma(type, value, false);
  }
  function maybeoperatorNoComma(type, value, noComma) {
    var me = noComma == false ? maybeoperatorComma : maybeoperatorNoComma;
    var expr = noComma == false ? expression : expressionNoComma;
    if (value == "=>") return cont(pushcontext, noComma ? arrowBodyNoComma : arrowBody, popcontext);
    if (type == "operator") {
      if (/\+\+|--/.test(value)) return cont(me);
      if (value == "?") return cont(expression, expect(":"), expr);
      return cont(expr);
    }
    if (type == "quasi") { return pass(quasi, me); }
    if (type == ";") return;
    if (type == "(") return contCommasep(expressionNoComma, ")", "call", me);
    if (type == ".") return cont(property, me);
    if (type == "[") return cont(pushlex("]"), maybeexpression, expect("]"), poplex, me);
  }
  function quasi(type, value) {
    if (type != "quasi") return pass();
    if (value.slice(value.length - 2) != "${") return cont(quasi);
    return cont(expression, continueQuasi);
  }
  function continueQuasi(type) {
    if (type == "}") {
      cx.marked = "string-2";
      cx.state.tokenize = tokenQuasi;
      return cont(quasi);
    }
  }
  function arrowBody(type) {
    findFatArrow(cx.stream, cx.state);
    if (type == "{") return pass(statement);
    return pass(expression);
  }
  function arrowBodyNoComma(type) {
    findFatArrow(cx.stream, cx.state);
    if (type == "{") return pass(statement);
    return pass(expressionNoComma);
  }
  function maybelabel(type) {
    if (type == ":") return cont(poplex, statement);
    return pass(maybeoperatorComma, expect(";"), poplex);
  }
  function property(type) {
    if (type == "variable") {cx.marked = "property"; return cont();}
  }
  function objprop(type, value) {
    if (type == "variable") {
      cx.marked = "property";
      if (value == "get" || value == "set") return cont(getterSetter);
    } else if (type == "number" || type == "string") {
      cx.marked = jsonldMode ? "property" : (type + " property");
    } else if (type == "[") {
      return cont(expression, expect("]"), afterprop);
    }
    if (atomicTypes.hasOwnProperty(type)) return cont(afterprop);
  }
  function getterSetter(type) {
    if (type != "variable") return pass(afterprop);
    cx.marked = "property";
    return cont(functiondef);
  }
  function afterprop(type) {
    if (type == ":") return cont(expressionNoComma);
    if (type == "(") return pass(functiondef);
  }
  function commasep(what, end) {
    function proceed(type) {
      if (type == ",") {
        var lex = cx.state.lexical;
        if (lex.info == "call") lex.pos = (lex.pos || 0) + 1;
        return cont(what, proceed);
      }
      if (type == end) return cont();
      return cont(expect(end));
    }
    return function(type) {
      if (type == end) return cont();
      return pass(what, proceed);
    };
  }
  function contCommasep(what, end, info) {
    for (var i = 3; i < arguments.length; i++)
      cx.cc.push(arguments[i]);
    return cont(pushlex(end, info), commasep(what, end), poplex);
  }
  function block(type) {
    if (type == "}") return cont();
    return pass(statement, block);
  }
  function maybetype(type) {
    if (isTS && type == ":") return cont(typedef);
  }
  function typedef(type) {
    if (type == "variable"){cx.marked = "variable-3"; return cont();}
  }
  function vardef() {
    return pass(pattern, maybetype, maybeAssign, vardefCont);
  }
  function pattern(type, value) {
    if (type == "variable") { register(value); return cont(); }
    if (type == "[") return contCommasep(pattern, "]");
    if (type == "{") return contCommasep(proppattern, "}");
  }
  function proppattern(type, value) {
    if (type == "variable" && !cx.stream.match(/^\s*:/, false)) {
      register(value);
      return cont(maybeAssign);
    }
    if (type == "variable") cx.marked = "property";
    return cont(expect(":"), pattern, maybeAssign);
  }
  function maybeAssign(_type, value) {
    if (value == "=") return cont(expressionNoComma);
  }
  function vardefCont(type) {
    if (type == ",") return cont(vardef);
  }
  function maybeelse(type, value) {
    if (type == "keyword b" && value == "else") return cont(pushlex("form", "else"), statement, poplex);
  }
  function forspec(type) {
    if (type == "(") return cont(pushlex(")"), forspec1, expect(")"), poplex);
  }
  function forspec1(type) {
    if (type == "var") return cont(vardef, expect(";"), forspec2);
    if (type == ";") return cont(forspec2);
    if (type == "variable") return cont(formaybeinof);
    return pass(expression, expect(";"), forspec2);
  }
  function formaybeinof(_type, value) {
    if (value == "in" || value == "of") { cx.marked = "keyword"; return cont(expression); }
    return cont(maybeoperatorComma, forspec2);
  }
  function forspec2(type, value) {
    if (type == ";") return cont(forspec3);
    if (value == "in" || value == "of") { cx.marked = "keyword"; return cont(expression); }
    return pass(expression, expect(";"), forspec3);
  }
  function forspec3(type) {
    if (type != ")") cont(expression);
  }
  function functiondef(type, value) {
    if (value == "*") {cx.marked = "keyword"; return cont(functiondef);}
    if (type == "variable") {register(value); return cont(functiondef);}
    if (type == "(") return cont(pushcontext, pushlex(")"), commasep(funarg, ")"), poplex, statement, popcontext);
  }
  function funarg(type) {
    if (type == "spread") return cont(funarg);
    return pass(pattern, maybetype);
  }
  function className(type, value) {
    if (type == "variable") {register(value); return cont(classNameAfter);}
  }
  function classNameAfter(_type, value) {
    if (value == "extends") return cont(expression);
  }
  function objlit(type) {
    if (type == "{") return contCommasep(objprop, "}");
  }
  function afterModule(type, value) {
    if (type == "string") return cont(statement);
    if (type == "variable") { register(value); return cont(maybeFrom); }
  }
  function afterExport(_type, value) {
    if (value == "*") { cx.marked = "keyword"; return cont(maybeFrom, expect(";")); }
    if (value == "default") { cx.marked = "keyword"; return cont(expression, expect(";")); }
    return pass(statement);
  }
  function afterImport(type) {
    if (type == "string") return cont();
    return pass(importSpec, maybeFrom);
  }
  function importSpec(type, value) {
    if (type == "{") return contCommasep(importSpec, "}");
    if (type == "variable") register(value);
    return cont();
  }
  function maybeFrom(_type, value) {
    if (value == "from") { cx.marked = "keyword"; return cont(expression); }
  }
  function arrayLiteral(type) {
    if (type == "]") return cont();
    return pass(expressionNoComma, maybeArrayComprehension);
  }
  function maybeArrayComprehension(type) {
    if (type == "for") return pass(comprehension, expect("]"));
    if (type == ",") return cont(commasep(expressionNoComma, "]"));
    return pass(commasep(expressionNoComma, "]"));
  }
  function comprehension(type) {
    if (type == "for") return cont(forspec, comprehension);
    if (type == "if") return cont(expression, comprehension);
  }

  // Interface

  return {
    startState: function(basecolumn) {
      var state = {
        tokenize: tokenBase,
        lastType: "sof",
        cc: [],
        lexical: new JSLexical((basecolumn || 0) - indentUnit, 0, "block", false),
        localVars: parserConfig.localVars,
        context: parserConfig.localVars && {vars: parserConfig.localVars},
        indented: 0
      };
      if (parserConfig.globalVars && typeof parserConfig.globalVars == "object")
        state.globalVars = parserConfig.globalVars;
      return state;
    },

    token: function(stream, state) {
      if (stream.sol()) {
        if (!state.lexical.hasOwnProperty("align"))
          state.lexical.align = false;
        state.indented = stream.indentation();
        findFatArrow(stream, state);
      }
      if (state.tokenize != tokenComment && stream.eatSpace()) return null;
      var style = state.tokenize(stream, state);
      if (type == "comment") return style;
      state.lastType = type == "operator" && (content == "++" || content == "--") ? "incdec" : type;
      return parseJS(state, style, type, content, stream);
    },

    indent: function(state, textAfter) {
      if (state.tokenize == tokenComment) return CodeMirror.Pass;
      if (state.tokenize != tokenBase) return 0;
      var firstChar = textAfter && textAfter.charAt(0), lexical = state.lexical;
      // Kludge to prevent 'maybelse' from blocking lexical scope pops
      if (!/^\s*else\b/.test(textAfter)) for (var i = state.cc.length - 1; i >= 0; --i) {
        var c = state.cc[i];
        if (c == poplex) lexical = lexical.prev;
        else if (c != maybeelse) break;
      }
      if (lexical.type == "stat" && firstChar == "}") lexical = lexical.prev;
      if (statementIndent && lexical.type == ")" && lexical.prev.type == "stat")
        lexical = lexical.prev;
      var type = lexical.type, closing = firstChar == type;

      if (type == "vardef") return lexical.indented + (state.lastType == "operator" || state.lastType == "," ? lexical.info + 1 : 0);
      else if (type == "form" && firstChar == "{") return lexical.indented;
      else if (type == "form") return lexical.indented + indentUnit;
      else if (type == "stat")
        return lexical.indented + (state.lastType == "operator" || state.lastType == "," ? statementIndent || indentUnit : 0);
      else if (lexical.info == "switch" && !closing && parserConfig.doubleIndentSwitch != false)
        return lexical.indented + (/^(?:case|default)\b/.test(textAfter) ? indentUnit : 2 * indentUnit);
      else if (lexical.align) return lexical.column + (closing ? 0 : 1);
      else return lexical.indented + (closing ? 0 : indentUnit);
    },

    electricChars: ":{}",
    blockCommentStart: jsonMode ? null : "/*",
    blockCommentEnd: jsonMode ? null : "*/",
    lineComment: jsonMode ? null : "//",
    fold: "brace",

    helperType: jsonMode ? "json" : "javascript",
    jsonldMode: jsonldMode,
    jsonMode: jsonMode
  };
});

CodeMirror.registerHelper("wordChars", "javascript", /[\\w$]/);

CodeMirror.defineMIME("text/javascript", "javascript");
CodeMirror.defineMIME("text/ecmascript", "javascript");
CodeMirror.defineMIME("application/javascript", "javascript");
CodeMirror.defineMIME("application/ecmascript", "javascript");
CodeMirror.defineMIME("application/json", {name: "javascript", json: true});
CodeMirror.defineMIME("application/x-json", {name: "javascript", json: true});
CodeMirror.defineMIME("application/ld+json", {name: "javascript", jsonld: true});
CodeMirror.defineMIME("text/typescript", { name: "javascript", typescript: true });
CodeMirror.defineMIME("application/typescript", { name: "javascript", typescript: true });

});

},{"../../lib/codemirror":8}],10:[function(require,module,exports){
"use strict";
/*globals Handlebars: true */
var base = require("./handlebars/base");

// Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)
var SafeString = require("./handlebars/safe-string")["default"];
var Exception = require("./handlebars/exception")["default"];
var Utils = require("./handlebars/utils");
var runtime = require("./handlebars/runtime");

// For compatibility and usage outside of module systems, make the Handlebars object a namespace
var create = function() {
  var hb = new base.HandlebarsEnvironment();

  Utils.extend(hb, base);
  hb.SafeString = SafeString;
  hb.Exception = Exception;
  hb.Utils = Utils;

  hb.VM = runtime;
  hb.template = function(spec) {
    return runtime.template(spec, hb);
  };

  return hb;
};

var Handlebars = create();
Handlebars.create = create;

exports["default"] = Handlebars;
},{"./handlebars/base":11,"./handlebars/exception":12,"./handlebars/runtime":13,"./handlebars/safe-string":14,"./handlebars/utils":15}],11:[function(require,module,exports){
"use strict";
var Utils = require("./utils");
var Exception = require("./exception")["default"];

var VERSION = "1.3.0";
exports.VERSION = VERSION;var COMPILER_REVISION = 4;
exports.COMPILER_REVISION = COMPILER_REVISION;
var REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '>= 1.0.0'
};
exports.REVISION_CHANGES = REVISION_CHANGES;
var isArray = Utils.isArray,
    isFunction = Utils.isFunction,
    toString = Utils.toString,
    objectType = '[object Object]';

function HandlebarsEnvironment(helpers, partials) {
  this.helpers = helpers || {};
  this.partials = partials || {};

  registerDefaultHelpers(this);
}

exports.HandlebarsEnvironment = HandlebarsEnvironment;HandlebarsEnvironment.prototype = {
  constructor: HandlebarsEnvironment,

  logger: logger,
  log: log,

  registerHelper: function(name, fn, inverse) {
    if (toString.call(name) === objectType) {
      if (inverse || fn) { throw new Exception('Arg not supported with multiple helpers'); }
      Utils.extend(this.helpers, name);
    } else {
      if (inverse) { fn.not = inverse; }
      this.helpers[name] = fn;
    }
  },

  registerPartial: function(name, str) {
    if (toString.call(name) === objectType) {
      Utils.extend(this.partials,  name);
    } else {
      this.partials[name] = str;
    }
  }
};

function registerDefaultHelpers(instance) {
  instance.registerHelper('helperMissing', function(arg) {
    if(arguments.length === 2) {
      return undefined;
    } else {
      throw new Exception("Missing helper: '" + arg + "'");
    }
  });

  instance.registerHelper('blockHelperMissing', function(context, options) {
    var inverse = options.inverse || function() {}, fn = options.fn;

    if (isFunction(context)) { context = context.call(this); }

    if(context === true) {
      return fn(this);
    } else if(context === false || context == null) {
      return inverse(this);
    } else if (isArray(context)) {
      if(context.length > 0) {
        return instance.helpers.each(context, options);
      } else {
        return inverse(this);
      }
    } else {
      return fn(context);
    }
  });

  instance.registerHelper('each', function(context, options) {
    var fn = options.fn, inverse = options.inverse;
    var i = 0, ret = "", data;

    if (isFunction(context)) { context = context.call(this); }

    if (options.data) {
      data = createFrame(options.data);
    }

    if(context && typeof context === 'object') {
      if (isArray(context)) {
        for(var j = context.length; i<j; i++) {
          if (data) {
            data.index = i;
            data.first = (i === 0);
            data.last  = (i === (context.length-1));
          }
          ret = ret + fn(context[i], { data: data });
        }
      } else {
        for(var key in context) {
          if(context.hasOwnProperty(key)) {
            if(data) { 
              data.key = key; 
              data.index = i;
              data.first = (i === 0);
            }
            ret = ret + fn(context[key], {data: data});
            i++;
          }
        }
      }
    }

    if(i === 0){
      ret = inverse(this);
    }

    return ret;
  });

  instance.registerHelper('if', function(conditional, options) {
    if (isFunction(conditional)) { conditional = conditional.call(this); }

    // Default behavior is to render the positive path if the value is truthy and not empty.
    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
    if ((!options.hash.includeZero && !conditional) || Utils.isEmpty(conditional)) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  });

  instance.registerHelper('unless', function(conditional, options) {
    return instance.helpers['if'].call(this, conditional, {fn: options.inverse, inverse: options.fn, hash: options.hash});
  });

  instance.registerHelper('with', function(context, options) {
    if (isFunction(context)) { context = context.call(this); }

    if (!Utils.isEmpty(context)) return options.fn(context);
  });

  instance.registerHelper('log', function(context, options) {
    var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
    instance.log(level, context);
  });
}

var logger = {
  methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

  // State enum
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  level: 3,

  // can be overridden in the host environment
  log: function(level, obj) {
    if (logger.level <= level) {
      var method = logger.methodMap[level];
      if (typeof console !== 'undefined' && console[method]) {
        console[method].call(console, obj);
      }
    }
  }
};
exports.logger = logger;
function log(level, obj) { logger.log(level, obj); }

exports.log = log;var createFrame = function(object) {
  var obj = {};
  Utils.extend(obj, object);
  return obj;
};
exports.createFrame = createFrame;
},{"./exception":12,"./utils":15}],12:[function(require,module,exports){
"use strict";

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

function Exception(message, node) {
  var line;
  if (node && node.firstLine) {
    line = node.firstLine;

    message += ' - ' + line + ':' + node.firstColumn;
  }

  var tmp = Error.prototype.constructor.call(this, message);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }

  if (line) {
    this.lineNumber = line;
    this.column = node.firstColumn;
  }
}

Exception.prototype = new Error();

exports["default"] = Exception;
},{}],13:[function(require,module,exports){
"use strict";
var Utils = require("./utils");
var Exception = require("./exception")["default"];
var COMPILER_REVISION = require("./base").COMPILER_REVISION;
var REVISION_CHANGES = require("./base").REVISION_CHANGES;

function checkRevision(compilerInfo) {
  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
      currentRevision = COMPILER_REVISION;

  if (compilerRevision !== currentRevision) {
    if (compilerRevision < currentRevision) {
      var runtimeVersions = REVISION_CHANGES[currentRevision],
          compilerVersions = REVISION_CHANGES[compilerRevision];
      throw new Exception("Template was precompiled with an older version of Handlebars than the current runtime. "+
            "Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+").");
    } else {
      // Use the embedded version info since the runtime doesn't know about this revision yet
      throw new Exception("Template was precompiled with a newer version of Handlebars than the current runtime. "+
            "Please update your runtime to a newer version ("+compilerInfo[1]+").");
    }
  }
}

exports.checkRevision = checkRevision;// TODO: Remove this line and break up compilePartial

function template(templateSpec, env) {
  if (!env) {
    throw new Exception("No environment passed to template");
  }

  // Note: Using env.VM references rather than local var references throughout this section to allow
  // for external users to override these as psuedo-supported APIs.
  var invokePartialWrapper = function(partial, name, context, helpers, partials, data) {
    var result = env.VM.invokePartial.apply(this, arguments);
    if (result != null) { return result; }

    if (env.compile) {
      var options = { helpers: helpers, partials: partials, data: data };
      partials[name] = env.compile(partial, { data: data !== undefined }, env);
      return partials[name](context, options);
    } else {
      throw new Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
    }
  };

  // Just add water
  var container = {
    escapeExpression: Utils.escapeExpression,
    invokePartial: invokePartialWrapper,
    programs: [],
    program: function(i, fn, data) {
      var programWrapper = this.programs[i];
      if(data) {
        programWrapper = program(i, fn, data);
      } else if (!programWrapper) {
        programWrapper = this.programs[i] = program(i, fn);
      }
      return programWrapper;
    },
    merge: function(param, common) {
      var ret = param || common;

      if (param && common && (param !== common)) {
        ret = {};
        Utils.extend(ret, common);
        Utils.extend(ret, param);
      }
      return ret;
    },
    programWithDepth: env.VM.programWithDepth,
    noop: env.VM.noop,
    compilerInfo: null
  };

  return function(context, options) {
    options = options || {};
    var namespace = options.partial ? options : env,
        helpers,
        partials;

    if (!options.partial) {
      helpers = options.helpers;
      partials = options.partials;
    }
    var result = templateSpec.call(
          container,
          namespace, context,
          helpers,
          partials,
          options.data);

    if (!options.partial) {
      env.VM.checkRevision(container.compilerInfo);
    }

    return result;
  };
}

exports.template = template;function programWithDepth(i, fn, data /*, $depth */) {
  var args = Array.prototype.slice.call(arguments, 3);

  var prog = function(context, options) {
    options = options || {};

    return fn.apply(this, [context, options.data || data].concat(args));
  };
  prog.program = i;
  prog.depth = args.length;
  return prog;
}

exports.programWithDepth = programWithDepth;function program(i, fn, data) {
  var prog = function(context, options) {
    options = options || {};

    return fn(context, options.data || data);
  };
  prog.program = i;
  prog.depth = 0;
  return prog;
}

exports.program = program;function invokePartial(partial, name, context, helpers, partials, data) {
  var options = { partial: true, helpers: helpers, partials: partials, data: data };

  if(partial === undefined) {
    throw new Exception("The partial " + name + " could not be found");
  } else if(partial instanceof Function) {
    return partial(context, options);
  }
}

exports.invokePartial = invokePartial;function noop() { return ""; }

exports.noop = noop;
},{"./base":11,"./exception":12,"./utils":15}],14:[function(require,module,exports){
"use strict";
// Build out our basic SafeString type
function SafeString(string) {
  this.string = string;
}

SafeString.prototype.toString = function() {
  return "" + this.string;
};

exports["default"] = SafeString;
},{}],15:[function(require,module,exports){
"use strict";
/*jshint -W004 */
var SafeString = require("./safe-string")["default"];

var escape = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "`": "&#x60;"
};

var badChars = /[&<>"'`]/g;
var possible = /[&<>"'`]/;

function escapeChar(chr) {
  return escape[chr] || "&amp;";
}

function extend(obj, value) {
  for(var key in value) {
    if(Object.prototype.hasOwnProperty.call(value, key)) {
      obj[key] = value[key];
    }
  }
}

exports.extend = extend;var toString = Object.prototype.toString;
exports.toString = toString;
// Sourced from lodash
// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
var isFunction = function(value) {
  return typeof value === 'function';
};
// fallback for older versions of Chrome and Safari
if (isFunction(/x/)) {
  isFunction = function(value) {
    return typeof value === 'function' && toString.call(value) === '[object Function]';
  };
}
var isFunction;
exports.isFunction = isFunction;
var isArray = Array.isArray || function(value) {
  return (value && typeof value === 'object') ? toString.call(value) === '[object Array]' : false;
};
exports.isArray = isArray;

function escapeExpression(string) {
  // don't escape SafeStrings, since they're already safe
  if (string instanceof SafeString) {
    return string.toString();
  } else if (!string && string !== 0) {
    return "";
  }

  // Force a string conversion as this will be done by the append regardless and
  // the regex test will do this transparently behind the scenes, causing issues if
  // an object's to string has escaped characters in it.
  string = "" + string;

  if(!possible.test(string)) { return string; }
  return string.replace(badChars, escapeChar);
}

exports.escapeExpression = escapeExpression;function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  } else if (isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}

exports.isEmpty = isEmpty;
},{"./safe-string":14}],16:[function(require,module,exports){
// Create a simple path alias to allow browserify to resolve
// the runtime on a supported path.
module.exports = require('./dist/cjs/handlebars.runtime');

},{"./dist/cjs/handlebars.runtime":10}],17:[function(require,module,exports){
module.exports = require("handlebars/runtime")["default"];

},{"handlebars/runtime":16}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYXp1Ly5ub2RlYnJldy9ub2RlL3YwLjEwLjI4L2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9henUvRHJvcGJveC93b3Jrc3BhY2UvSmF2YVNjcmlwdC9jb2RlbWlycm9yLWNvbnNvbGUtdWkvY29tcG9uZW50cy9taXJyb3ItY29uc29sZS1jb21wb25lbnQuaGJzIiwiL1VzZXJzL2F6dS9Ecm9wYm94L3dvcmtzcGFjZS9KYXZhU2NyaXB0L2NvZGVtaXJyb3ItY29uc29sZS11aS9jb21wb25lbnRzL21pcnJvci1jb25zb2xlLWNvbXBvbmVudC5qcyIsIi9Vc2Vycy9henUvRHJvcGJveC93b3Jrc3BhY2UvSmF2YVNjcmlwdC9jb2RlbWlycm9yLWNvbnNvbGUtdWkvY29tcG9uZW50cy9taXJyb3ItY29uc29sZS1pbmplY3QtYnV0dG9uLmhicyIsIi9Vc2Vycy9henUvRHJvcGJveC93b3Jrc3BhY2UvSmF2YVNjcmlwdC9jb2RlbWlycm9yLWNvbnNvbGUtdWkvaW5kZXguanMiLCIvVXNlcnMvYXp1L0Ryb3Bib3gvd29ya3NwYWNlL0phdmFTY3JpcHQvY29kZW1pcnJvci1jb25zb2xlLXVpL25vZGVfbW9kdWxlcy9jb2RlbWlycm9yLWNvbnNvbGUvbGliL21pcnJvci1jb25zb2xlLmpzIiwiL1VzZXJzL2F6dS9Ecm9wYm94L3dvcmtzcGFjZS9KYXZhU2NyaXB0L2NvZGVtaXJyb3ItY29uc29sZS11aS9ub2RlX21vZHVsZXMvY29kZW1pcnJvci1jb25zb2xlL25vZGVfbW9kdWxlcy9jb250ZXh0LWV2YWwvaW5kZXguanMiLCIvVXNlcnMvYXp1L0Ryb3Bib3gvd29ya3NwYWNlL0phdmFTY3JpcHQvY29kZW1pcnJvci1jb25zb2xlLXVpL25vZGVfbW9kdWxlcy9jb2RlbWlycm9yLWNvbnNvbGUvbm9kZV9tb2R1bGVzL2NvbnRleHQtZXZhbC9saWIvY29udGV4dC1icm93c2VyLmpzIiwiL1VzZXJzL2F6dS9Ecm9wYm94L3dvcmtzcGFjZS9KYXZhU2NyaXB0L2NvZGVtaXJyb3ItY29uc29sZS11aS9ub2RlX21vZHVsZXMvY29kZW1pcnJvci9saWIvY29kZW1pcnJvci5qcyIsIi9Vc2Vycy9henUvRHJvcGJveC93b3Jrc3BhY2UvSmF2YVNjcmlwdC9jb2RlbWlycm9yLWNvbnNvbGUtdWkvbm9kZV9tb2R1bGVzL2NvZGVtaXJyb3IvbW9kZS9qYXZhc2NyaXB0L2phdmFzY3JpcHQuanMiLCIvVXNlcnMvYXp1L0Ryb3Bib3gvd29ya3NwYWNlL0phdmFTY3JpcHQvY29kZW1pcnJvci1jb25zb2xlLXVpL25vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMucnVudGltZS5qcyIsIi9Vc2Vycy9henUvRHJvcGJveC93b3Jrc3BhY2UvSmF2YVNjcmlwdC9jb2RlbWlycm9yLWNvbnNvbGUtdWkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvZGlzdC9janMvaGFuZGxlYmFycy9iYXNlLmpzIiwiL1VzZXJzL2F6dS9Ecm9wYm94L3dvcmtzcGFjZS9KYXZhU2NyaXB0L2NvZGVtaXJyb3ItY29uc29sZS11aS9ub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2V4Y2VwdGlvbi5qcyIsIi9Vc2Vycy9henUvRHJvcGJveC93b3Jrc3BhY2UvSmF2YVNjcmlwdC9jb2RlbWlycm9yLWNvbnNvbGUtdWkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvZGlzdC9janMvaGFuZGxlYmFycy9ydW50aW1lLmpzIiwiL1VzZXJzL2F6dS9Ecm9wYm94L3dvcmtzcGFjZS9KYXZhU2NyaXB0L2NvZGVtaXJyb3ItY29uc29sZS11aS9ub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3NhZmUtc3RyaW5nLmpzIiwiL1VzZXJzL2F6dS9Ecm9wYm94L3dvcmtzcGFjZS9KYXZhU2NyaXB0L2NvZGVtaXJyb3ItY29uc29sZS11aS9ub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3V0aWxzLmpzIiwiL1VzZXJzL2F6dS9Ecm9wYm94L3dvcmtzcGFjZS9KYXZhU2NyaXB0L2NvZGVtaXJyb3ItY29uc29sZS11aS9ub2RlX21vZHVsZXMvaGFuZGxlYmFycy9ydW50aW1lLmpzIiwiL1VzZXJzL2F6dS9Ecm9wYm94L3dvcmtzcGFjZS9KYXZhU2NyaXB0L2NvZGVtaXJyb3ItY29uc29sZS11aS9ub2RlX21vZHVsZXMvaGJzZnkvcnVudGltZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2o3T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdnBCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFycyA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJtaXJyb3ItY29uc29sZS1jb21tYW5kXFxcIj5cXG4gICAgPGJ1dHRvbiBjbGFzcz1cXFwibWlycm9yLWNvbnNvbGUtYnV0dG9uIG1pcnJvci1jb25zb2xlLXJ1blxcXCIgaWQ9XFxcIm1pcnJvci1jb25zb2xlLXJ1bi1idXR0b25cXFwiPuWun+ihjDwvYnV0dG9uPlxcbiAgICA8YnV0dG9uIGNsYXNzPVxcXCJtaXJyb3ItY29uc29sZS1idXR0b24gbWlycm9yLWNvbnNvbGUtY2xlYXJcXFwiIGlkPVxcXCJtaXJyb3ItY29uc29sZS1jbGVhci1idXR0b25cXFwiPuODreOCsOOCkuOCr+ODquOCojwvYnV0dG9uPlxcbiAgICA8YnV0dG9uIGNsYXNzPVxcXCJtaXJyb3ItY29uc29sZS1idXR0b24gbWlycm9yLWNvbnNvbGUtZXhpdFxcXCIgaWQ9XFxcIm1pcnJvci1jb25zb2xlLWV4aXQtYnV0dG9uXFxcIj7ntYLkuoY8L2J1dHRvbj5cXG48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJtaXJyb3ItY29uc29sZS1sb2dcXFwiPlxcbjwvZGl2PlwiO1xuICB9KTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIE1pcnJvckNvbnNvbGUgPSByZXF1aXJlKFwiY29kZW1pcnJvci1jb25zb2xlXCIpO1xuZnVuY3Rpb24gZ2V0RE9NRnJvbVRlbXBsYXRlKHRlbXBsYXRlKSB7XG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgZGl2LmlubmVySFRNTCA9IHRlbXBsYXRlO1xuICAgIHJldHVybiBkaXY7XG59XG5mdW5jdGlvbiBpbnRlbmRNaXJyb3JDb25zb2xlKGVsZW1lbnQsIGRlZmFsdXRUZXh0KSB7XG4gICAgdmFyIG1pcnJvciA9IG5ldyBNaXJyb3JDb25zb2xlKCk7XG4gICAgdmFyIGNvZGVNaXJyb3IgPSBtaXJyb3IuZWRpdG9yO1xuICAgIGNvZGVNaXJyb3Iuc2V0T3B0aW9uKFwibGluZU51bWJlcnNcIiwgdHJ1ZSk7XG4gICAgbWlycm9yLnNldFRleHQoZGVmYWx1dFRleHQgfHwgXCJcIik7XG4gICAgbWlycm9yLnRleHRhcmVhSG9sZGVyLmNsYXNzTmFtZSA9IFwibWlycm9yLWNvbnNvbGUtd3JhcHBlclwiXG4gICAgdmFyIG5vZGUgPSBnZXRET01Gcm9tVGVtcGxhdGUocmVxdWlyZShcIi4vbWlycm9yLWNvbnNvbGUtY29tcG9uZW50Lmhic1wiKSgpKTtcbiAgICB2YXIgbG9nQXJlYSA9IG5vZGUucXVlcnlTZWxlY3RvcihcIi5taXJyb3ItY29uc29sZS1sb2dcIik7XG5cbiAgICBmdW5jdGlvbiBwcmludENvbnNvbGUoYXJncywgY2xhc3NOYW1lKSB7XG4gICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBkaXYuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYXJncy5qb2luKFwiLFwiKSkpO1xuICAgICAgICBsb2dBcmVhLmFwcGVuZENoaWxkKGRpdik7XG4gICAgfVxuICAgIHZhciBjb25zb2xlTW9jayA9IHtcbiAgICAgICAgbG9nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBwcmludENvbnNvbGUoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSwgXCJtaXJyb3ItY29uc29sZS1sb2ctcm93IG1pcnJvci1jb25zb2xlLWxvZy1ub3JtYWxcIik7XG4gICAgICAgIH0sXG4gICAgICAgIGluZm86IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHByaW50Q29uc29sZShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLCBcIm1pcnJvci1jb25zb2xlLWxvZy1yb3cgbWlycm9yLWNvbnNvbGUtbG9nLWluZm9cIik7XG4gICAgICAgIH0sXG4gICAgICAgIHdhcm46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHByaW50Q29uc29sZShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLCBcIm1pcnJvci1jb25zb2xlLWxvZy1yb3cgbWlycm9yLWNvbnNvbGUtbG9nLXdhcm5cIik7XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBwcmludENvbnNvbGUoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSwgXCJtaXJyb3ItY29uc29sZS1sb2ctcm93IG1pcnJvci1jb25zb2xlLWxvZy1lcnJvclwiKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zb2xlTW9jay5pbmZvID0gY29uc29sZU1vY2subG9nLmJpbmQoY29uc29sZU1vY2spO1xuICAgIG1pcnJvci5zd2FwV2l0aEVsZW1lbnQoZWxlbWVudCk7XG4gICAgbWlycm9yLnRleHRhcmVhSG9sZGVyLmFwcGVuZENoaWxkKG5vZGUpO1xuXG4gICAgcnVuQ29kZSgpO1xuXG4gICAgZnVuY3Rpb24gcnVuQ29kZSgpIHtcbiAgICAgICAgbWlycm9yLnJ1bkluQ29udGV4dCh7IGNvbnNvbGU6IGNvbnNvbGVNb2NrIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZU1vY2suZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBub2RlLnF1ZXJ5U2VsZWN0b3IoXCIjbWlycm9yLWNvbnNvbGUtcnVuLWJ1dHRvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gcnVuSlMoKSB7XG4gICAgICAgIHJ1bkNvZGUoKTtcbiAgICB9KTtcbiAgICBub2RlLnF1ZXJ5U2VsZWN0b3IoXCIjbWlycm9yLWNvbnNvbGUtY2xlYXItYnV0dG9uXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiBjbGVhckxvZygpIHtcbiAgICAgICAgdmFyIHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKG5vZGUucXVlcnlTZWxlY3RvcihcIi5taXJyb3ItY29uc29sZS1sb2dcIikpO1xuICAgICAgICByYW5nZS5kZWxldGVDb250ZW50cygpO1xuICAgIH0pO1xuICAgIG5vZGUucXVlcnlTZWxlY3RvcihcIiNtaXJyb3ItY29uc29sZS1leGl0LWJ1dHRvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gY2xlYXJMb2coKSB7XG4gICAgICAgIG1pcnJvci5kZXN0cm95KCk7XG4gICAgICAgIGF0dGFjaFRvRWxlbWVudChlbGVtZW50LCBkZWZhbHV0VGV4dCk7XG4gICAgfSk7XG59XG5mdW5jdGlvbiBhdHRhY2hUb0VsZW1lbnQoZWxlbWVudCwgZGVmYWx1dFRleHQpIHtcbiAgICB2YXIgcGFyZW50Tm9kZSA9IGVsZW1lbnQucGFyZW50Tm9kZTtcbiAgICB2YXIgdGVtcGxhdGUgPSByZXF1aXJlKFwiLi9taXJyb3ItY29uc29sZS1pbmplY3QtYnV0dG9uLmhic1wiKTtcbiAgICB2YXIgbm9kZSA9IGdldERPTUZyb21UZW1wbGF0ZSh0ZW1wbGF0ZSgpKTtcbiAgICBub2RlLnF1ZXJ5U2VsZWN0b3IoXCIjbWlycm9yLWNvbnNvbGUtcnVuLWJ1dHRvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gZWRpdEFuZFJ1bigpIHtcbiAgICAgICAgaW50ZW5kTWlycm9yQ29uc29sZShlbGVtZW50LCBkZWZhbHV0VGV4dCk7XG4gICAgICAgIHBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgfSk7XG4gICAgaWYgKGVsZW1lbnQubmV4dFNpYmxpbmcgPT09IG51bGwpIHtcbiAgICAgICAgcGFyZW50Tm9kZS5hcHBlbmRDaGlsZChub2RlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBwYXJlbnROb2RlLmluc2VydEJlZm9yZShub2RlLCBlbGVtZW50Lm5leHRTaWJsaW5nKTtcbiAgICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IGF0dGFjaFRvRWxlbWVudDsiLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFycyA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8YnV0dG9uIGNsYXNzPVxcXCJtaXJyb3ItY29uc29sZS1idXR0b24gbWlycm9yLWNvbnNvbGUtcnVuXFxcIiBpZD1cXFwibWlycm9yLWNvbnNvbGUtcnVuLWJ1dHRvblxcXCI+5a6f6KGMPC9idXR0b24+XCI7XG4gIH0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgYXR0YWNoVG9FbGVtZW50ID0gcmVxdWlyZShcIi4vY29tcG9uZW50cy9taXJyb3ItY29uc29sZS1jb21wb25lbnRcIik7XG52YXIgY29udGVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKTtcbmF0dGFjaFRvRWxlbWVudChjb250ZW50LCBjb250ZW50LnRleHRDb250ZW50KTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIEV2YWxDb250ZXh0ID0gcmVxdWlyZShcImNvbnRleHQtZXZhbFwiKTtcbnZhciBDb2RlTWlycm9yID0gcmVxdWlyZShcImNvZGVtaXJyb3JcIik7XG5yZXF1aXJlKCdjb2RlbWlycm9yL21vZGUvamF2YXNjcmlwdC9qYXZhc2NyaXB0Jyk7XG5mdW5jdGlvbiBNaXJyb3JDb25zb2xlKCkge1xuICAgIHRoaXMuZWRpdG9yID0gdGhpcy5jcmVhdGVFZGl0b3IoKTtcbn1cbk1pcnJvckNvbnNvbGUucHJvdG90eXBlLmNyZWF0ZUVkaXRvciA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnRleHRhcmVhSG9sZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICB0aGlzLnRleHRhcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRleHRhcmVhXCIpO1xuICAgIHRoaXMudGV4dGFyZWFIb2xkZXIuYXBwZW5kQ2hpbGQodGhpcy50ZXh0YXJlYSk7XG4gICAgcmV0dXJuIENvZGVNaXJyb3IuZnJvbVRleHRBcmVhKHRoaXMudGV4dGFyZWEpO1xufVxuTWlycm9yQ29uc29sZS5wcm90b3R5cGUuc2V0VGV4dCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHRoaXMuZWRpdG9yLnNldFZhbHVlKHZhbHVlKTtcbn1cbk1pcnJvckNvbnNvbGUucHJvdG90eXBlLmdldFRleHQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IuZ2V0VmFsdWUoKTtcbn1cbk1pcnJvckNvbnNvbGUucHJvdG90eXBlLnN3YXBXaXRoRWxlbWVudCA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgdGhpcy5vcmlnaW5hbEVsZW1lbmV0ID0gZWxlbWVudDtcbiAgICBlbGVtZW50LnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHRoaXMudGV4dGFyZWFIb2xkZXIsIGVsZW1lbnQpXG4gICAgdGhpcy5lZGl0b3IucmVmcmVzaCgpO1xufVxuTWlycm9yQ29uc29sZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgaWYgKHRoaXMub3JpZ2luYWxFbGVtZW5ldCA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkhhdmVuJ3QgYG9yaWdpbmFsRWxlbWVuZXRgIDogWW91IGhhdmUgdG8gY2FsbCAjc3dhcFdpdGhFbGVtZW50IGJlZm9yZSBjYWxsIHRoaXNcIik7XG4gICAgfVxuICAgIHRoaXMudGV4dGFyZWFIb2xkZXIucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQodGhpcy5vcmlnaW5hbEVsZW1lbmV0LCB0aGlzLnRleHRhcmVhSG9sZGVyKTtcbiAgICB0aGlzLm9yaWdpbmFsRWxlbWVuZXQgPSBudWxsO1xuICAgIHRoaXMudGV4dGFyZWEgPSBudWxsO1xuICAgIHRoaXMudGV4dGFyZWFIb2xkZXIgPSBudWxsO1xuICAgIHRoaXMuZWRpdG9yID0gbnVsbDtcbiAgICBpZiAodGhpcy5ldmFsQ29udGV4dCkge1xuICAgICAgICB0aGlzLmV2YWxDb250ZXh0LmRlc3Ryb3koKTtcbiAgICB9XG4gICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcbn1cbk1pcnJvckNvbnNvbGUucHJvdG90eXBlLnJ1bkluQ29udGV4dCA9IGZ1bmN0aW9uIChjb250ZXh0LCBjYWxsYmFjaykge1xuICAgIGlmICh0aGlzLmV2YWxDb250ZXh0KSB7XG4gICAgICAgIHRoaXMuZXZhbENvbnRleHQuZGVzdHJveSgpO1xuICAgIH1cbiAgICB0aGlzLmV2YWxDb250ZXh0ID0gbmV3IEV2YWxDb250ZXh0KGNvbnRleHQsIHRoaXMudGV4dGFyZWFIb2xkZXIpO1xuICAgIHZhciBqc0NvZGUgPSB0aGlzLmVkaXRvci5nZXRWYWx1ZSgpO1xuICAgIHZhciByZXM7XG4gICAgdHJ5IHtcbiAgICAgICAgcmVzID0gdGhpcy5ldmFsQ29udGV4dC5ldmFsdWF0ZShqc0NvZGUpO1xuICAgICAgICBjYWxsYmFjayhudWxsLCByZXMpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNhbGxiYWNrKGVycm9yLCByZXMpO1xuICAgIH1cblxufVxubW9kdWxlLmV4cG9ydHMgPSBNaXJyb3JDb25zb2xlOyIsImlmICghKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiYgd2luZG93ICE9PSBudWxsKSkge1xuICAvLyBXaWxsIGRvIHRoaXMgZGFuY2Ugc28gdGhlIHJlcXVpcmUgaXNuJ3QgcGFyc2VkIGZvciBicm93c2VyaWZ5IGV0Yy5cbiAgdmFyIG1vZHVsZU5hbWUgPSAnLi9saWIvY29udGV4dC1ub2RlJztcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKG1vZHVsZU5hbWUpO1xufSBlbHNlIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9jb250ZXh0LWJyb3dzZXInKTtcbn1cbiIsImZ1bmN0aW9uIENvbnRleHQoc2FuZGJveCwgcGFyZW50RWxlbWVudCkge1xuICB0aGlzLmlmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICB0aGlzLmlmcmFtZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICBwYXJlbnRFbGVtZW50ID0gcGFyZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xuICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuaWZyYW1lKTtcbiAgdmFyIHdpbiA9IHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3c7XG4gIHNhbmRib3ggPSBzYW5kYm94IHx8IHt9O1xuICBPYmplY3Qua2V5cyhzYW5kYm94KS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICB3aW5ba2V5XSA9IHNhbmRib3hba2V5XTtcbiAgfSk7XG59XG5cbkNvbnRleHQucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKGNvZGUpIHtcbiAgcmV0dXJuIHRoaXMuaWZyYW1lLmNvbnRlbnRXaW5kb3cuZXZhbChjb2RlKTtcbn07XG5cbkNvbnRleHQucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLmlmcmFtZSkge1xuICAgIHRoaXMuaWZyYW1lLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5pZnJhbWUpO1xuICAgIHRoaXMuaWZyYW1lID0gbnVsbDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb250ZXh0OyIsIi8vIENvZGVNaXJyb3IsIGNvcHlyaWdodCAoYykgYnkgTWFyaWpuIEhhdmVyYmVrZSBhbmQgb3RoZXJzXG4vLyBEaXN0cmlidXRlZCB1bmRlciBhbiBNSVQgbGljZW5zZTogaHR0cDovL2NvZGVtaXJyb3IubmV0L0xJQ0VOU0VcblxuLy8gVGhpcyBpcyBDb2RlTWlycm9yIChodHRwOi8vY29kZW1pcnJvci5uZXQpLCBhIGNvZGUgZWRpdG9yXG4vLyBpbXBsZW1lbnRlZCBpbiBKYXZhU2NyaXB0IG9uIHRvcCBvZiB0aGUgYnJvd3NlcidzIERPTS5cbi8vXG4vLyBZb3UgY2FuIGZpbmQgc29tZSB0ZWNobmljYWwgYmFja2dyb3VuZCBmb3Igc29tZSBvZiB0aGUgY29kZSBiZWxvd1xuLy8gYXQgaHR0cDovL21hcmlqbmhhdmVyYmVrZS5ubC9ibG9nLyNjbS1pbnRlcm5hbHMgLlxuXG4oZnVuY3Rpb24obW9kKSB7XG4gIGlmICh0eXBlb2YgZXhwb3J0cyA9PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUgPT0gXCJvYmplY3RcIikgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IG1vZCgpO1xuICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSAvLyBBTURcbiAgICByZXR1cm4gZGVmaW5lKFtdLCBtb2QpO1xuICBlbHNlIC8vIFBsYWluIGJyb3dzZXIgZW52XG4gICAgdGhpcy5Db2RlTWlycm9yID0gbW9kKCk7XG59KShmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gQlJPV1NFUiBTTklGRklOR1xuXG4gIC8vIEtsdWRnZXMgZm9yIGJ1Z3MgYW5kIGJlaGF2aW9yIGRpZmZlcmVuY2VzIHRoYXQgY2FuJ3QgYmUgZmVhdHVyZVxuICAvLyBkZXRlY3RlZCBhcmUgZW5hYmxlZCBiYXNlZCBvbiB1c2VyQWdlbnQgZXRjIHNuaWZmaW5nLlxuXG4gIHZhciBnZWNrbyA9IC9nZWNrb1xcL1xcZC9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gIC8vIGllX3VwdG9OIG1lYW5zIEludGVybmV0IEV4cGxvcmVyIHZlcnNpb24gTiBvciBsb3dlclxuICB2YXIgaWVfdXB0bzEwID0gL01TSUUgXFxkLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICB2YXIgaWVfdXB0bzcgPSBpZV91cHRvMTAgJiYgKGRvY3VtZW50LmRvY3VtZW50TW9kZSA9PSBudWxsIHx8IGRvY3VtZW50LmRvY3VtZW50TW9kZSA8IDgpO1xuICB2YXIgaWVfdXB0bzggPSBpZV91cHRvMTAgJiYgKGRvY3VtZW50LmRvY3VtZW50TW9kZSA9PSBudWxsIHx8IGRvY3VtZW50LmRvY3VtZW50TW9kZSA8IDkpO1xuICB2YXIgaWVfdXB0bzkgPSBpZV91cHRvMTAgJiYgKGRvY3VtZW50LmRvY3VtZW50TW9kZSA9PSBudWxsIHx8IGRvY3VtZW50LmRvY3VtZW50TW9kZSA8IDEwKTtcbiAgdmFyIGllXzExdXAgPSAvVHJpZGVudFxcLyhbNy05XXxcXGR7Mix9KVxcLi8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgdmFyIGllID0gaWVfdXB0bzEwIHx8IGllXzExdXA7XG4gIHZhciB3ZWJraXQgPSAvV2ViS2l0XFwvLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICB2YXIgcXR3ZWJraXQgPSB3ZWJraXQgJiYgL1F0XFwvXFxkK1xcLlxcZCsvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gIHZhciBjaHJvbWUgPSAvQ2hyb21lXFwvLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICB2YXIgcHJlc3RvID0gL09wZXJhXFwvLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICB2YXIgc2FmYXJpID0gL0FwcGxlIENvbXB1dGVyLy50ZXN0KG5hdmlnYXRvci52ZW5kb3IpO1xuICB2YXIga2h0bWwgPSAvS0hUTUxcXC8vLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gIHZhciBtYWNfZ2VNb3VudGFpbkxpb24gPSAvTWFjIE9TIFggMVxcZFxcRChbOC05XXxcXGRcXGQpXFxELy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICB2YXIgcGhhbnRvbSA9IC9QaGFudG9tSlMvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG5cbiAgdmFyIGlvcyA9IC9BcHBsZVdlYktpdC8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSAmJiAvTW9iaWxlXFwvXFx3Ky8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgLy8gVGhpcyBpcyB3b2VmdWxseSBpbmNvbXBsZXRlLiBTdWdnZXN0aW9ucyBmb3IgYWx0ZXJuYXRpdmUgbWV0aG9kcyB3ZWxjb21lLlxuICB2YXIgbW9iaWxlID0gaW9zIHx8IC9BbmRyb2lkfHdlYk9TfEJsYWNrQmVycnl8T3BlcmEgTWluaXxPcGVyYSBNb2JpfElFTW9iaWxlL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgdmFyIG1hYyA9IGlvcyB8fCAvTWFjLy50ZXN0KG5hdmlnYXRvci5wbGF0Zm9ybSk7XG4gIHZhciB3aW5kb3dzID0gL3dpbi9pLnRlc3QobmF2aWdhdG9yLnBsYXRmb3JtKTtcblxuICB2YXIgcHJlc3RvX3ZlcnNpb24gPSBwcmVzdG8gJiYgbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvVmVyc2lvblxcLyhcXGQqXFwuXFxkKikvKTtcbiAgaWYgKHByZXN0b192ZXJzaW9uKSBwcmVzdG9fdmVyc2lvbiA9IE51bWJlcihwcmVzdG9fdmVyc2lvblsxXSk7XG4gIGlmIChwcmVzdG9fdmVyc2lvbiAmJiBwcmVzdG9fdmVyc2lvbiA+PSAxNSkgeyBwcmVzdG8gPSBmYWxzZTsgd2Via2l0ID0gdHJ1ZTsgfVxuICAvLyBTb21lIGJyb3dzZXJzIHVzZSB0aGUgd3JvbmcgZXZlbnQgcHJvcGVydGllcyB0byBzaWduYWwgY21kL2N0cmwgb24gT1MgWFxuICB2YXIgZmxpcEN0cmxDbWQgPSBtYWMgJiYgKHF0d2Via2l0IHx8IHByZXN0byAmJiAocHJlc3RvX3ZlcnNpb24gPT0gbnVsbCB8fCBwcmVzdG9fdmVyc2lvbiA8IDEyLjExKSk7XG4gIHZhciBjYXB0dXJlUmlnaHRDbGljayA9IGdlY2tvIHx8IChpZSAmJiAhaWVfdXB0bzgpO1xuXG4gIC8vIE9wdGltaXplIHNvbWUgY29kZSB3aGVuIHRoZXNlIGZlYXR1cmVzIGFyZSBub3QgdXNlZC5cbiAgdmFyIHNhd1JlYWRPbmx5U3BhbnMgPSBmYWxzZSwgc2F3Q29sbGFwc2VkU3BhbnMgPSBmYWxzZTtcblxuICAvLyBFRElUT1IgQ09OU1RSVUNUT1JcblxuICAvLyBBIENvZGVNaXJyb3IgaW5zdGFuY2UgcmVwcmVzZW50cyBhbiBlZGl0b3IuIFRoaXMgaXMgdGhlIG9iamVjdFxuICAvLyB0aGF0IHVzZXIgY29kZSBpcyB1c3VhbGx5IGRlYWxpbmcgd2l0aC5cblxuICBmdW5jdGlvbiBDb2RlTWlycm9yKHBsYWNlLCBvcHRpb25zKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIENvZGVNaXJyb3IpKSByZXR1cm4gbmV3IENvZGVNaXJyb3IocGxhY2UsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgLy8gRGV0ZXJtaW5lIGVmZmVjdGl2ZSBvcHRpb25zIGJhc2VkIG9uIGdpdmVuIHZhbHVlcyBhbmQgZGVmYXVsdHMuXG4gICAgY29weU9iaihkZWZhdWx0cywgb3B0aW9ucywgZmFsc2UpO1xuICAgIHNldEd1dHRlcnNGb3JMaW5lTnVtYmVycyhvcHRpb25zKTtcblxuICAgIHZhciBkb2MgPSBvcHRpb25zLnZhbHVlO1xuICAgIGlmICh0eXBlb2YgZG9jID09IFwic3RyaW5nXCIpIGRvYyA9IG5ldyBEb2MoZG9jLCBvcHRpb25zLm1vZGUpO1xuICAgIHRoaXMuZG9jID0gZG9jO1xuXG4gICAgdmFyIGRpc3BsYXkgPSB0aGlzLmRpc3BsYXkgPSBuZXcgRGlzcGxheShwbGFjZSwgZG9jKTtcbiAgICBkaXNwbGF5LndyYXBwZXIuQ29kZU1pcnJvciA9IHRoaXM7XG4gICAgdXBkYXRlR3V0dGVycyh0aGlzKTtcbiAgICB0aGVtZUNoYW5nZWQodGhpcyk7XG4gICAgaWYgKG9wdGlvbnMubGluZVdyYXBwaW5nKVxuICAgICAgdGhpcy5kaXNwbGF5LndyYXBwZXIuY2xhc3NOYW1lICs9IFwiIENvZGVNaXJyb3Itd3JhcFwiO1xuICAgIGlmIChvcHRpb25zLmF1dG9mb2N1cyAmJiAhbW9iaWxlKSBmb2N1c0lucHV0KHRoaXMpO1xuXG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGtleU1hcHM6IFtdLCAgLy8gc3RvcmVzIG1hcHMgYWRkZWQgYnkgYWRkS2V5TWFwXG4gICAgICBvdmVybGF5czogW10sIC8vIGhpZ2hsaWdodGluZyBvdmVybGF5cywgYXMgYWRkZWQgYnkgYWRkT3ZlcmxheVxuICAgICAgbW9kZUdlbjogMCwgICAvLyBidW1wZWQgd2hlbiBtb2RlL292ZXJsYXkgY2hhbmdlcywgdXNlZCB0byBpbnZhbGlkYXRlIGhpZ2hsaWdodGluZyBpbmZvXG4gICAgICBvdmVyd3JpdGU6IGZhbHNlLCBmb2N1c2VkOiBmYWxzZSxcbiAgICAgIHN1cHByZXNzRWRpdHM6IGZhbHNlLCAvLyB1c2VkIHRvIGRpc2FibGUgZWRpdGluZyBkdXJpbmcga2V5IGhhbmRsZXJzIHdoZW4gaW4gcmVhZE9ubHkgbW9kZVxuICAgICAgcGFzdGVJbmNvbWluZzogZmFsc2UsIGN1dEluY29taW5nOiBmYWxzZSwgLy8gaGVscCByZWNvZ25pemUgcGFzdGUvY3V0IGVkaXRzIGluIHJlYWRJbnB1dFxuICAgICAgZHJhZ2dpbmdUZXh0OiBmYWxzZSxcbiAgICAgIGhpZ2hsaWdodDogbmV3IERlbGF5ZWQoKSAvLyBzdG9yZXMgaGlnaGxpZ2h0IHdvcmtlciB0aW1lb3V0XG4gICAgfTtcblxuICAgIC8vIE92ZXJyaWRlIG1hZ2ljIHRleHRhcmVhIGNvbnRlbnQgcmVzdG9yZSB0aGF0IElFIHNvbWV0aW1lcyBkb2VzXG4gICAgLy8gb24gb3VyIGhpZGRlbiB0ZXh0YXJlYSBvbiByZWxvYWRcbiAgICBpZiAoaWVfdXB0bzEwKSBzZXRUaW1lb3V0KGJpbmQocmVzZXRJbnB1dCwgdGhpcywgdHJ1ZSksIDIwKTtcblxuICAgIHJlZ2lzdGVyRXZlbnRIYW5kbGVycyh0aGlzKTtcbiAgICBlbnN1cmVHbG9iYWxIYW5kbGVycygpO1xuXG4gICAgdmFyIGNtID0gdGhpcztcbiAgICBydW5Jbk9wKHRoaXMsIGZ1bmN0aW9uKCkge1xuICAgICAgY20uY3VyT3AuZm9yY2VVcGRhdGUgPSB0cnVlO1xuICAgICAgYXR0YWNoRG9jKGNtLCBkb2MpO1xuXG4gICAgICBpZiAoKG9wdGlvbnMuYXV0b2ZvY3VzICYmICFtb2JpbGUpIHx8IGFjdGl2ZUVsdCgpID09IGRpc3BsYXkuaW5wdXQpXG4gICAgICAgIHNldFRpbWVvdXQoYmluZChvbkZvY3VzLCBjbSksIDIwKTtcbiAgICAgIGVsc2VcbiAgICAgICAgb25CbHVyKGNtKTtcblxuICAgICAgZm9yICh2YXIgb3B0IGluIG9wdGlvbkhhbmRsZXJzKSBpZiAob3B0aW9uSGFuZGxlcnMuaGFzT3duUHJvcGVydHkob3B0KSlcbiAgICAgICAgb3B0aW9uSGFuZGxlcnNbb3B0XShjbSwgb3B0aW9uc1tvcHRdLCBJbml0KTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5pdEhvb2tzLmxlbmd0aDsgKytpKSBpbml0SG9va3NbaV0oY20pO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gRElTUExBWSBDT05TVFJVQ1RPUlxuXG4gIC8vIFRoZSBkaXNwbGF5IGhhbmRsZXMgdGhlIERPTSBpbnRlZ3JhdGlvbiwgYm90aCBmb3IgaW5wdXQgcmVhZGluZ1xuICAvLyBhbmQgY29udGVudCBkcmF3aW5nLiBJdCBob2xkcyByZWZlcmVuY2VzIHRvIERPTSBub2RlcyBhbmRcbiAgLy8gZGlzcGxheS1yZWxhdGVkIHN0YXRlLlxuXG4gIGZ1bmN0aW9uIERpc3BsYXkocGxhY2UsIGRvYykge1xuICAgIHZhciBkID0gdGhpcztcblxuICAgIC8vIFRoZSBzZW1paGlkZGVuIHRleHRhcmVhIHRoYXQgaXMgZm9jdXNlZCB3aGVuIHRoZSBlZGl0b3IgaXNcbiAgICAvLyBmb2N1c2VkLCBhbmQgcmVjZWl2ZXMgaW5wdXQuXG4gICAgdmFyIGlucHV0ID0gZC5pbnB1dCA9IGVsdChcInRleHRhcmVhXCIsIG51bGwsIG51bGwsIFwicG9zaXRpb246IGFic29sdXRlOyBwYWRkaW5nOiAwOyB3aWR0aDogMXB4OyBoZWlnaHQ6IDFlbTsgb3V0bGluZTogbm9uZVwiKTtcbiAgICAvLyBUaGUgdGV4dGFyZWEgaXMga2VwdCBwb3NpdGlvbmVkIG5lYXIgdGhlIGN1cnNvciB0byBwcmV2ZW50IHRoZVxuICAgIC8vIGZhY3QgdGhhdCBpdCdsbCBiZSBzY3JvbGxlZCBpbnRvIHZpZXcgb24gaW5wdXQgZnJvbSBzY3JvbGxpbmdcbiAgICAvLyBvdXIgZmFrZSBjdXJzb3Igb3V0IG9mIHZpZXcuIE9uIHdlYmtpdCwgd2hlbiB3cmFwPW9mZiwgcGFzdGUgaXNcbiAgICAvLyB2ZXJ5IHNsb3cuIFNvIG1ha2UgdGhlIGFyZWEgd2lkZSBpbnN0ZWFkLlxuICAgIGlmICh3ZWJraXQpIGlucHV0LnN0eWxlLndpZHRoID0gXCIxMDAwcHhcIjtcbiAgICBlbHNlIGlucHV0LnNldEF0dHJpYnV0ZShcIndyYXBcIiwgXCJvZmZcIik7XG4gICAgLy8gSWYgYm9yZGVyOiAwOyAtLSBpT1MgZmFpbHMgdG8gb3BlbiBrZXlib2FyZCAoaXNzdWUgIzEyODcpXG4gICAgaWYgKGlvcykgaW5wdXQuc3R5bGUuYm9yZGVyID0gXCIxcHggc29saWQgYmxhY2tcIjtcbiAgICBpbnB1dC5zZXRBdHRyaWJ1dGUoXCJhdXRvY29ycmVjdFwiLCBcIm9mZlwiKTsgaW5wdXQuc2V0QXR0cmlidXRlKFwiYXV0b2NhcGl0YWxpemVcIiwgXCJvZmZcIik7IGlucHV0LnNldEF0dHJpYnV0ZShcInNwZWxsY2hlY2tcIiwgXCJmYWxzZVwiKTtcblxuICAgIC8vIFdyYXBzIGFuZCBoaWRlcyBpbnB1dCB0ZXh0YXJlYVxuICAgIGQuaW5wdXREaXYgPSBlbHQoXCJkaXZcIiwgW2lucHV0XSwgbnVsbCwgXCJvdmVyZmxvdzogaGlkZGVuOyBwb3NpdGlvbjogcmVsYXRpdmU7IHdpZHRoOiAzcHg7IGhlaWdodDogMHB4O1wiKTtcbiAgICAvLyBUaGUgZmFrZSBzY3JvbGxiYXIgZWxlbWVudHMuXG4gICAgZC5zY3JvbGxiYXJIID0gZWx0KFwiZGl2XCIsIFtlbHQoXCJkaXZcIiwgbnVsbCwgbnVsbCwgXCJoZWlnaHQ6IDEwMCU7IG1pbi1oZWlnaHQ6IDFweFwiKV0sIFwiQ29kZU1pcnJvci1oc2Nyb2xsYmFyXCIpO1xuICAgIGQuc2Nyb2xsYmFyViA9IGVsdChcImRpdlwiLCBbZWx0KFwiZGl2XCIsIG51bGwsIG51bGwsIFwibWluLXdpZHRoOiAxcHhcIildLCBcIkNvZGVNaXJyb3ItdnNjcm9sbGJhclwiKTtcbiAgICAvLyBDb3ZlcnMgYm90dG9tLXJpZ2h0IHNxdWFyZSB3aGVuIGJvdGggc2Nyb2xsYmFycyBhcmUgcHJlc2VudC5cbiAgICBkLnNjcm9sbGJhckZpbGxlciA9IGVsdChcImRpdlwiLCBudWxsLCBcIkNvZGVNaXJyb3Itc2Nyb2xsYmFyLWZpbGxlclwiKTtcbiAgICAvLyBDb3ZlcnMgYm90dG9tIG9mIGd1dHRlciB3aGVuIGNvdmVyR3V0dGVyTmV4dFRvU2Nyb2xsYmFyIGlzIG9uXG4gICAgLy8gYW5kIGggc2Nyb2xsYmFyIGlzIHByZXNlbnQuXG4gICAgZC5ndXR0ZXJGaWxsZXIgPSBlbHQoXCJkaXZcIiwgbnVsbCwgXCJDb2RlTWlycm9yLWd1dHRlci1maWxsZXJcIik7XG4gICAgLy8gV2lsbCBjb250YWluIHRoZSBhY3R1YWwgY29kZSwgcG9zaXRpb25lZCB0byBjb3ZlciB0aGUgdmlld3BvcnQuXG4gICAgZC5saW5lRGl2ID0gZWx0KFwiZGl2XCIsIG51bGwsIFwiQ29kZU1pcnJvci1jb2RlXCIpO1xuICAgIC8vIEVsZW1lbnRzIGFyZSBhZGRlZCB0byB0aGVzZSB0byByZXByZXNlbnQgc2VsZWN0aW9uIGFuZCBjdXJzb3JzLlxuICAgIGQuc2VsZWN0aW9uRGl2ID0gZWx0KFwiZGl2XCIsIG51bGwsIG51bGwsIFwicG9zaXRpb246IHJlbGF0aXZlOyB6LWluZGV4OiAxXCIpO1xuICAgIGQuY3Vyc29yRGl2ID0gZWx0KFwiZGl2XCIsIG51bGwsIFwiQ29kZU1pcnJvci1jdXJzb3JzXCIpO1xuICAgIC8vIEEgdmlzaWJpbGl0eTogaGlkZGVuIGVsZW1lbnQgdXNlZCB0byBmaW5kIHRoZSBzaXplIG9mIHRoaW5ncy5cbiAgICBkLm1lYXN1cmUgPSBlbHQoXCJkaXZcIiwgbnVsbCwgXCJDb2RlTWlycm9yLW1lYXN1cmVcIik7XG4gICAgLy8gV2hlbiBsaW5lcyBvdXRzaWRlIG9mIHRoZSB2aWV3cG9ydCBhcmUgbWVhc3VyZWQsIHRoZXkgYXJlIGRyYXduIGluIHRoaXMuXG4gICAgZC5saW5lTWVhc3VyZSA9IGVsdChcImRpdlwiLCBudWxsLCBcIkNvZGVNaXJyb3ItbWVhc3VyZVwiKTtcbiAgICAvLyBXcmFwcyBldmVyeXRoaW5nIHRoYXQgbmVlZHMgdG8gZXhpc3QgaW5zaWRlIHRoZSB2ZXJ0aWNhbGx5LXBhZGRlZCBjb29yZGluYXRlIHN5c3RlbVxuICAgIGQubGluZVNwYWNlID0gZWx0KFwiZGl2XCIsIFtkLm1lYXN1cmUsIGQubGluZU1lYXN1cmUsIGQuc2VsZWN0aW9uRGl2LCBkLmN1cnNvckRpdiwgZC5saW5lRGl2XSxcbiAgICAgICAgICAgICAgICAgICAgICBudWxsLCBcInBvc2l0aW9uOiByZWxhdGl2ZTsgb3V0bGluZTogbm9uZVwiKTtcbiAgICAvLyBNb3ZlZCBhcm91bmQgaXRzIHBhcmVudCB0byBjb3ZlciB2aXNpYmxlIHZpZXcuXG4gICAgZC5tb3ZlciA9IGVsdChcImRpdlwiLCBbZWx0KFwiZGl2XCIsIFtkLmxpbmVTcGFjZV0sIFwiQ29kZU1pcnJvci1saW5lc1wiKV0sIG51bGwsIFwicG9zaXRpb246IHJlbGF0aXZlXCIpO1xuICAgIC8vIFNldCB0byB0aGUgaGVpZ2h0IG9mIHRoZSBkb2N1bWVudCwgYWxsb3dpbmcgc2Nyb2xsaW5nLlxuICAgIGQuc2l6ZXIgPSBlbHQoXCJkaXZcIiwgW2QubW92ZXJdLCBcIkNvZGVNaXJyb3Itc2l6ZXJcIik7XG4gICAgLy8gQmVoYXZpb3Igb2YgZWx0cyB3aXRoIG92ZXJmbG93OiBhdXRvIGFuZCBwYWRkaW5nIGlzXG4gICAgLy8gaW5jb25zaXN0ZW50IGFjcm9zcyBicm93c2Vycy4gVGhpcyBpcyB1c2VkIHRvIGVuc3VyZSB0aGVcbiAgICAvLyBzY3JvbGxhYmxlIGFyZWEgaXMgYmlnIGVub3VnaC5cbiAgICBkLmhlaWdodEZvcmNlciA9IGVsdChcImRpdlwiLCBudWxsLCBudWxsLCBcInBvc2l0aW9uOiBhYnNvbHV0ZTsgaGVpZ2h0OiBcIiArIHNjcm9sbGVyQ3V0T2ZmICsgXCJweDsgd2lkdGg6IDFweDtcIik7XG4gICAgLy8gV2lsbCBjb250YWluIHRoZSBndXR0ZXJzLCBpZiBhbnkuXG4gICAgZC5ndXR0ZXJzID0gZWx0KFwiZGl2XCIsIG51bGwsIFwiQ29kZU1pcnJvci1ndXR0ZXJzXCIpO1xuICAgIGQubGluZUd1dHRlciA9IG51bGw7XG4gICAgLy8gQWN0dWFsIHNjcm9sbGFibGUgZWxlbWVudC5cbiAgICBkLnNjcm9sbGVyID0gZWx0KFwiZGl2XCIsIFtkLnNpemVyLCBkLmhlaWdodEZvcmNlciwgZC5ndXR0ZXJzXSwgXCJDb2RlTWlycm9yLXNjcm9sbFwiKTtcbiAgICBkLnNjcm9sbGVyLnNldEF0dHJpYnV0ZShcInRhYkluZGV4XCIsIFwiLTFcIik7XG4gICAgLy8gVGhlIGVsZW1lbnQgaW4gd2hpY2ggdGhlIGVkaXRvciBsaXZlcy5cbiAgICBkLndyYXBwZXIgPSBlbHQoXCJkaXZcIiwgW2QuaW5wdXREaXYsIGQuc2Nyb2xsYmFySCwgZC5zY3JvbGxiYXJWLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQuc2Nyb2xsYmFyRmlsbGVyLCBkLmd1dHRlckZpbGxlciwgZC5zY3JvbGxlcl0sIFwiQ29kZU1pcnJvclwiKTtcblxuICAgIC8vIFdvcmsgYXJvdW5kIElFNyB6LWluZGV4IGJ1ZyAobm90IHBlcmZlY3QsIGhlbmNlIElFNyBub3QgcmVhbGx5IGJlaW5nIHN1cHBvcnRlZClcbiAgICBpZiAoaWVfdXB0bzcpIHsgZC5ndXR0ZXJzLnN0eWxlLnpJbmRleCA9IC0xOyBkLnNjcm9sbGVyLnN0eWxlLnBhZGRpbmdSaWdodCA9IDA7IH1cbiAgICAvLyBOZWVkZWQgdG8gaGlkZSBiaWcgYmx1ZSBibGlua2luZyBjdXJzb3Igb24gTW9iaWxlIFNhZmFyaVxuICAgIGlmIChpb3MpIGlucHV0LnN0eWxlLndpZHRoID0gXCIwcHhcIjtcbiAgICBpZiAoIXdlYmtpdCkgZC5zY3JvbGxlci5kcmFnZ2FibGUgPSB0cnVlO1xuICAgIC8vIE5lZWRlZCB0byBoYW5kbGUgVGFiIGtleSBpbiBLSFRNTFxuICAgIGlmIChraHRtbCkgeyBkLmlucHV0RGl2LnN0eWxlLmhlaWdodCA9IFwiMXB4XCI7IGQuaW5wdXREaXYuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7IH1cbiAgICAvLyBOZWVkIHRvIHNldCBhIG1pbmltdW0gd2lkdGggdG8gc2VlIHRoZSBzY3JvbGxiYXIgb24gSUU3IChidXQgbXVzdCBub3Qgc2V0IGl0IG9uIElFOCkuXG4gICAgaWYgKGllX3VwdG83KSBkLnNjcm9sbGJhckguc3R5bGUubWluSGVpZ2h0ID0gZC5zY3JvbGxiYXJWLnN0eWxlLm1pbldpZHRoID0gXCIxOHB4XCI7XG5cbiAgICBpZiAocGxhY2UuYXBwZW5kQ2hpbGQpIHBsYWNlLmFwcGVuZENoaWxkKGQud3JhcHBlcik7XG4gICAgZWxzZSBwbGFjZShkLndyYXBwZXIpO1xuXG4gICAgLy8gQ3VycmVudCByZW5kZXJlZCByYW5nZSAobWF5IGJlIGJpZ2dlciB0aGFuIHRoZSB2aWV3IHdpbmRvdykuXG4gICAgZC52aWV3RnJvbSA9IGQudmlld1RvID0gZG9jLmZpcnN0O1xuICAgIC8vIEluZm9ybWF0aW9uIGFib3V0IHRoZSByZW5kZXJlZCBsaW5lcy5cbiAgICBkLnZpZXcgPSBbXTtcbiAgICAvLyBIb2xkcyBpbmZvIGFib3V0IGEgc2luZ2xlIHJlbmRlcmVkIGxpbmUgd2hlbiBpdCB3YXMgcmVuZGVyZWRcbiAgICAvLyBmb3IgbWVhc3VyZW1lbnQsIHdoaWxlIG5vdCBpbiB2aWV3LlxuICAgIGQuZXh0ZXJuYWxNZWFzdXJlZCA9IG51bGw7XG4gICAgLy8gRW1wdHkgc3BhY2UgKGluIHBpeGVscykgYWJvdmUgdGhlIHZpZXdcbiAgICBkLnZpZXdPZmZzZXQgPSAwO1xuICAgIGQubGFzdFNpemVDID0gMDtcbiAgICBkLnVwZGF0ZUxpbmVOdW1iZXJzID0gbnVsbDtcblxuICAgIC8vIFVzZWQgdG8gb25seSByZXNpemUgdGhlIGxpbmUgbnVtYmVyIGd1dHRlciB3aGVuIG5lY2Vzc2FyeSAod2hlblxuICAgIC8vIHRoZSBhbW91bnQgb2YgbGluZXMgY3Jvc3NlcyBhIGJvdW5kYXJ5IHRoYXQgbWFrZXMgaXRzIHdpZHRoIGNoYW5nZSlcbiAgICBkLmxpbmVOdW1XaWR0aCA9IGQubGluZU51bUlubmVyV2lkdGggPSBkLmxpbmVOdW1DaGFycyA9IG51bGw7XG4gICAgLy8gU2VlIHJlYWRJbnB1dCBhbmQgcmVzZXRJbnB1dFxuICAgIGQucHJldklucHV0ID0gXCJcIjtcbiAgICAvLyBTZXQgdG8gdHJ1ZSB3aGVuIGEgbm9uLWhvcml6b250YWwtc2Nyb2xsaW5nIGxpbmUgd2lkZ2V0IGlzXG4gICAgLy8gYWRkZWQuIEFzIGFuIG9wdGltaXphdGlvbiwgbGluZSB3aWRnZXQgYWxpZ25pbmcgaXMgc2tpcHBlZCB3aGVuXG4gICAgLy8gdGhpcyBpcyBmYWxzZS5cbiAgICBkLmFsaWduV2lkZ2V0cyA9IGZhbHNlO1xuICAgIC8vIEZsYWcgdGhhdCBpbmRpY2F0ZXMgd2hldGhlciB3ZSBleHBlY3QgaW5wdXQgdG8gYXBwZWFyIHJlYWwgc29vblxuICAgIC8vIG5vdyAoYWZ0ZXIgc29tZSBldmVudCBsaWtlICdrZXlwcmVzcycgb3IgJ2lucHV0JykgYW5kIGFyZVxuICAgIC8vIHBvbGxpbmcgaW50ZW5zaXZlbHkuXG4gICAgZC5wb2xsaW5nRmFzdCA9IGZhbHNlO1xuICAgIC8vIFNlbGYtcmVzZXR0aW5nIHRpbWVvdXQgZm9yIHRoZSBwb2xsZXJcbiAgICBkLnBvbGwgPSBuZXcgRGVsYXllZCgpO1xuXG4gICAgZC5jYWNoZWRDaGFyV2lkdGggPSBkLmNhY2hlZFRleHRIZWlnaHQgPSBkLmNhY2hlZFBhZGRpbmdIID0gbnVsbDtcblxuICAgIC8vIFRyYWNrcyB3aGVuIHJlc2V0SW5wdXQgaGFzIHB1bnRlZCB0byBqdXN0IHB1dHRpbmcgYSBzaG9ydFxuICAgIC8vIHN0cmluZyBpbnRvIHRoZSB0ZXh0YXJlYSBpbnN0ZWFkIG9mIHRoZSBmdWxsIHNlbGVjdGlvbi5cbiAgICBkLmluYWNjdXJhdGVTZWxlY3Rpb24gPSBmYWxzZTtcblxuICAgIC8vIFRyYWNrcyB0aGUgbWF4aW11bSBsaW5lIGxlbmd0aCBzbyB0aGF0IHRoZSBob3Jpem9udGFsIHNjcm9sbGJhclxuICAgIC8vIGNhbiBiZSBrZXB0IHN0YXRpYyB3aGVuIHNjcm9sbGluZy5cbiAgICBkLm1heExpbmUgPSBudWxsO1xuICAgIGQubWF4TGluZUxlbmd0aCA9IDA7XG4gICAgZC5tYXhMaW5lQ2hhbmdlZCA9IGZhbHNlO1xuXG4gICAgLy8gVXNlZCBmb3IgbWVhc3VyaW5nIHdoZWVsIHNjcm9sbGluZyBncmFudWxhcml0eVxuICAgIGQud2hlZWxEWCA9IGQud2hlZWxEWSA9IGQud2hlZWxTdGFydFggPSBkLndoZWVsU3RhcnRZID0gbnVsbDtcblxuICAgIC8vIFRydWUgd2hlbiBzaGlmdCBpcyBoZWxkIGRvd24uXG4gICAgZC5zaGlmdCA9IGZhbHNlO1xuXG4gICAgLy8gVXNlZCB0byB0cmFjayB3aGV0aGVyIGFueXRoaW5nIGhhcHBlbmVkIHNpbmNlIHRoZSBjb250ZXh0IG1lbnVcbiAgICAvLyB3YXMgb3BlbmVkLlxuICAgIGQuc2VsRm9yQ29udGV4dE1lbnUgPSBudWxsO1xuICB9XG5cbiAgLy8gU1RBVEUgVVBEQVRFU1xuXG4gIC8vIFVzZWQgdG8gZ2V0IHRoZSBlZGl0b3IgaW50byBhIGNvbnNpc3RlbnQgc3RhdGUgYWdhaW4gd2hlbiBvcHRpb25zIGNoYW5nZS5cblxuICBmdW5jdGlvbiBsb2FkTW9kZShjbSkge1xuICAgIGNtLmRvYy5tb2RlID0gQ29kZU1pcnJvci5nZXRNb2RlKGNtLm9wdGlvbnMsIGNtLmRvYy5tb2RlT3B0aW9uKTtcbiAgICByZXNldE1vZGVTdGF0ZShjbSk7XG4gIH1cblxuICBmdW5jdGlvbiByZXNldE1vZGVTdGF0ZShjbSkge1xuICAgIGNtLmRvYy5pdGVyKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIGlmIChsaW5lLnN0YXRlQWZ0ZXIpIGxpbmUuc3RhdGVBZnRlciA9IG51bGw7XG4gICAgICBpZiAobGluZS5zdHlsZXMpIGxpbmUuc3R5bGVzID0gbnVsbDtcbiAgICB9KTtcbiAgICBjbS5kb2MuZnJvbnRpZXIgPSBjbS5kb2MuZmlyc3Q7XG4gICAgc3RhcnRXb3JrZXIoY20sIDEwMCk7XG4gICAgY20uc3RhdGUubW9kZUdlbisrO1xuICAgIGlmIChjbS5jdXJPcCkgcmVnQ2hhbmdlKGNtKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHdyYXBwaW5nQ2hhbmdlZChjbSkge1xuICAgIGlmIChjbS5vcHRpb25zLmxpbmVXcmFwcGluZykge1xuICAgICAgYWRkQ2xhc3MoY20uZGlzcGxheS53cmFwcGVyLCBcIkNvZGVNaXJyb3Itd3JhcFwiKTtcbiAgICAgIGNtLmRpc3BsYXkuc2l6ZXIuc3R5bGUubWluV2lkdGggPSBcIlwiO1xuICAgIH0gZWxzZSB7XG4gICAgICBybUNsYXNzKGNtLmRpc3BsYXkud3JhcHBlciwgXCJDb2RlTWlycm9yLXdyYXBcIik7XG4gICAgICBmaW5kTWF4TGluZShjbSk7XG4gICAgfVxuICAgIGVzdGltYXRlTGluZUhlaWdodHMoY20pO1xuICAgIHJlZ0NoYW5nZShjbSk7XG4gICAgY2xlYXJDYWNoZXMoY20pO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXt1cGRhdGVTY3JvbGxiYXJzKGNtKTt9LCAxMDApO1xuICB9XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgZXN0aW1hdGVzIHRoZSBoZWlnaHQgb2YgYSBsaW5lLCB0byB1c2UgYXNcbiAgLy8gZmlyc3QgYXBwcm94aW1hdGlvbiB1bnRpbCB0aGUgbGluZSBiZWNvbWVzIHZpc2libGUgKGFuZCBpcyB0aHVzXG4gIC8vIHByb3Blcmx5IG1lYXN1cmFibGUpLlxuICBmdW5jdGlvbiBlc3RpbWF0ZUhlaWdodChjbSkge1xuICAgIHZhciB0aCA9IHRleHRIZWlnaHQoY20uZGlzcGxheSksIHdyYXBwaW5nID0gY20ub3B0aW9ucy5saW5lV3JhcHBpbmc7XG4gICAgdmFyIHBlckxpbmUgPSB3cmFwcGluZyAmJiBNYXRoLm1heCg1LCBjbS5kaXNwbGF5LnNjcm9sbGVyLmNsaWVudFdpZHRoIC8gY2hhcldpZHRoKGNtLmRpc3BsYXkpIC0gMyk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIGlmIChsaW5lSXNIaWRkZW4oY20uZG9jLCBsaW5lKSkgcmV0dXJuIDA7XG5cbiAgICAgIHZhciB3aWRnZXRzSGVpZ2h0ID0gMDtcbiAgICAgIGlmIChsaW5lLndpZGdldHMpIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZS53aWRnZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChsaW5lLndpZGdldHNbaV0uaGVpZ2h0KSB3aWRnZXRzSGVpZ2h0ICs9IGxpbmUud2lkZ2V0c1tpXS5oZWlnaHQ7XG4gICAgICB9XG5cbiAgICAgIGlmICh3cmFwcGluZylcbiAgICAgICAgcmV0dXJuIHdpZGdldHNIZWlnaHQgKyAoTWF0aC5jZWlsKGxpbmUudGV4dC5sZW5ndGggLyBwZXJMaW5lKSB8fCAxKSAqIHRoO1xuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gd2lkZ2V0c0hlaWdodCArIHRoO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBlc3RpbWF0ZUxpbmVIZWlnaHRzKGNtKSB7XG4gICAgdmFyIGRvYyA9IGNtLmRvYywgZXN0ID0gZXN0aW1hdGVIZWlnaHQoY20pO1xuICAgIGRvYy5pdGVyKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIHZhciBlc3RIZWlnaHQgPSBlc3QobGluZSk7XG4gICAgICBpZiAoZXN0SGVpZ2h0ICE9IGxpbmUuaGVpZ2h0KSB1cGRhdGVMaW5lSGVpZ2h0KGxpbmUsIGVzdEhlaWdodCk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBrZXlNYXBDaGFuZ2VkKGNtKSB7XG4gICAgdmFyIG1hcCA9IGtleU1hcFtjbS5vcHRpb25zLmtleU1hcF0sIHN0eWxlID0gbWFwLnN0eWxlO1xuICAgIGNtLmRpc3BsYXkud3JhcHBlci5jbGFzc05hbWUgPSBjbS5kaXNwbGF5LndyYXBwZXIuY2xhc3NOYW1lLnJlcGxhY2UoL1xccypjbS1rZXltYXAtXFxTKy9nLCBcIlwiKSArXG4gICAgICAoc3R5bGUgPyBcIiBjbS1rZXltYXAtXCIgKyBzdHlsZSA6IFwiXCIpO1xuICB9XG5cbiAgZnVuY3Rpb24gdGhlbWVDaGFuZ2VkKGNtKSB7XG4gICAgY20uZGlzcGxheS53cmFwcGVyLmNsYXNzTmFtZSA9IGNtLmRpc3BsYXkud3JhcHBlci5jbGFzc05hbWUucmVwbGFjZSgvXFxzKmNtLXMtXFxTKy9nLCBcIlwiKSArXG4gICAgICBjbS5vcHRpb25zLnRoZW1lLnJlcGxhY2UoLyhefFxccylcXHMqL2csIFwiIGNtLXMtXCIpO1xuICAgIGNsZWFyQ2FjaGVzKGNtKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGd1dHRlcnNDaGFuZ2VkKGNtKSB7XG4gICAgdXBkYXRlR3V0dGVycyhjbSk7XG4gICAgcmVnQ2hhbmdlKGNtKTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7YWxpZ25Ib3Jpem9udGFsbHkoY20pO30sIDIwKTtcbiAgfVxuXG4gIC8vIFJlYnVpbGQgdGhlIGd1dHRlciBlbGVtZW50cywgZW5zdXJlIHRoZSBtYXJnaW4gdG8gdGhlIGxlZnQgb2YgdGhlXG4gIC8vIGNvZGUgbWF0Y2hlcyB0aGVpciB3aWR0aC5cbiAgZnVuY3Rpb24gdXBkYXRlR3V0dGVycyhjbSkge1xuICAgIHZhciBndXR0ZXJzID0gY20uZGlzcGxheS5ndXR0ZXJzLCBzcGVjcyA9IGNtLm9wdGlvbnMuZ3V0dGVycztcbiAgICByZW1vdmVDaGlsZHJlbihndXR0ZXJzKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNwZWNzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgZ3V0dGVyQ2xhc3MgPSBzcGVjc1tpXTtcbiAgICAgIHZhciBnRWx0ID0gZ3V0dGVycy5hcHBlbmRDaGlsZChlbHQoXCJkaXZcIiwgbnVsbCwgXCJDb2RlTWlycm9yLWd1dHRlciBcIiArIGd1dHRlckNsYXNzKSk7XG4gICAgICBpZiAoZ3V0dGVyQ2xhc3MgPT0gXCJDb2RlTWlycm9yLWxpbmVudW1iZXJzXCIpIHtcbiAgICAgICAgY20uZGlzcGxheS5saW5lR3V0dGVyID0gZ0VsdDtcbiAgICAgICAgZ0VsdC5zdHlsZS53aWR0aCA9IChjbS5kaXNwbGF5LmxpbmVOdW1XaWR0aCB8fCAxKSArIFwicHhcIjtcbiAgICAgIH1cbiAgICB9XG4gICAgZ3V0dGVycy5zdHlsZS5kaXNwbGF5ID0gaSA/IFwiXCIgOiBcIm5vbmVcIjtcbiAgICB1cGRhdGVHdXR0ZXJTcGFjZShjbSk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVHdXR0ZXJTcGFjZShjbSkge1xuICAgIHZhciB3aWR0aCA9IGNtLmRpc3BsYXkuZ3V0dGVycy5vZmZzZXRXaWR0aDtcbiAgICBjbS5kaXNwbGF5LnNpemVyLnN0eWxlLm1hcmdpbkxlZnQgPSB3aWR0aCArIFwicHhcIjtcbiAgICBjbS5kaXNwbGF5LnNjcm9sbGJhckguc3R5bGUubGVmdCA9IGNtLm9wdGlvbnMuZml4ZWRHdXR0ZXIgPyB3aWR0aCArIFwicHhcIiA6IDA7XG4gIH1cblxuICAvLyBDb21wdXRlIHRoZSBjaGFyYWN0ZXIgbGVuZ3RoIG9mIGEgbGluZSwgdGFraW5nIGludG8gYWNjb3VudFxuICAvLyBjb2xsYXBzZWQgcmFuZ2VzIChzZWUgbWFya1RleHQpIHRoYXQgbWlnaHQgaGlkZSBwYXJ0cywgYW5kIGpvaW5cbiAgLy8gb3RoZXIgbGluZXMgb250byBpdC5cbiAgZnVuY3Rpb24gbGluZUxlbmd0aChsaW5lKSB7XG4gICAgaWYgKGxpbmUuaGVpZ2h0ID09IDApIHJldHVybiAwO1xuICAgIHZhciBsZW4gPSBsaW5lLnRleHQubGVuZ3RoLCBtZXJnZWQsIGN1ciA9IGxpbmU7XG4gICAgd2hpbGUgKG1lcmdlZCA9IGNvbGxhcHNlZFNwYW5BdFN0YXJ0KGN1cikpIHtcbiAgICAgIHZhciBmb3VuZCA9IG1lcmdlZC5maW5kKDAsIHRydWUpO1xuICAgICAgY3VyID0gZm91bmQuZnJvbS5saW5lO1xuICAgICAgbGVuICs9IGZvdW5kLmZyb20uY2ggLSBmb3VuZC50by5jaDtcbiAgICB9XG4gICAgY3VyID0gbGluZTtcbiAgICB3aGlsZSAobWVyZ2VkID0gY29sbGFwc2VkU3BhbkF0RW5kKGN1cikpIHtcbiAgICAgIHZhciBmb3VuZCA9IG1lcmdlZC5maW5kKDAsIHRydWUpO1xuICAgICAgbGVuIC09IGN1ci50ZXh0Lmxlbmd0aCAtIGZvdW5kLmZyb20uY2g7XG4gICAgICBjdXIgPSBmb3VuZC50by5saW5lO1xuICAgICAgbGVuICs9IGN1ci50ZXh0Lmxlbmd0aCAtIGZvdW5kLnRvLmNoO1xuICAgIH1cbiAgICByZXR1cm4gbGVuO1xuICB9XG5cbiAgLy8gRmluZCB0aGUgbG9uZ2VzdCBsaW5lIGluIHRoZSBkb2N1bWVudC5cbiAgZnVuY3Rpb24gZmluZE1heExpbmUoY20pIHtcbiAgICB2YXIgZCA9IGNtLmRpc3BsYXksIGRvYyA9IGNtLmRvYztcbiAgICBkLm1heExpbmUgPSBnZXRMaW5lKGRvYywgZG9jLmZpcnN0KTtcbiAgICBkLm1heExpbmVMZW5ndGggPSBsaW5lTGVuZ3RoKGQubWF4TGluZSk7XG4gICAgZC5tYXhMaW5lQ2hhbmdlZCA9IHRydWU7XG4gICAgZG9jLml0ZXIoZnVuY3Rpb24obGluZSkge1xuICAgICAgdmFyIGxlbiA9IGxpbmVMZW5ndGgobGluZSk7XG4gICAgICBpZiAobGVuID4gZC5tYXhMaW5lTGVuZ3RoKSB7XG4gICAgICAgIGQubWF4TGluZUxlbmd0aCA9IGxlbjtcbiAgICAgICAgZC5tYXhMaW5lID0gbGluZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8vIE1ha2Ugc3VyZSB0aGUgZ3V0dGVycyBvcHRpb25zIGNvbnRhaW5zIHRoZSBlbGVtZW50XG4gIC8vIFwiQ29kZU1pcnJvci1saW5lbnVtYmVyc1wiIHdoZW4gdGhlIGxpbmVOdW1iZXJzIG9wdGlvbiBpcyB0cnVlLlxuICBmdW5jdGlvbiBzZXRHdXR0ZXJzRm9yTGluZU51bWJlcnMob3B0aW9ucykge1xuICAgIHZhciBmb3VuZCA9IGluZGV4T2Yob3B0aW9ucy5ndXR0ZXJzLCBcIkNvZGVNaXJyb3ItbGluZW51bWJlcnNcIik7XG4gICAgaWYgKGZvdW5kID09IC0xICYmIG9wdGlvbnMubGluZU51bWJlcnMpIHtcbiAgICAgIG9wdGlvbnMuZ3V0dGVycyA9IG9wdGlvbnMuZ3V0dGVycy5jb25jYXQoW1wiQ29kZU1pcnJvci1saW5lbnVtYmVyc1wiXSk7XG4gICAgfSBlbHNlIGlmIChmb3VuZCA+IC0xICYmICFvcHRpb25zLmxpbmVOdW1iZXJzKSB7XG4gICAgICBvcHRpb25zLmd1dHRlcnMgPSBvcHRpb25zLmd1dHRlcnMuc2xpY2UoMCk7XG4gICAgICBvcHRpb25zLmd1dHRlcnMuc3BsaWNlKGZvdW5kLCAxKTtcbiAgICB9XG4gIH1cblxuICAvLyBTQ1JPTExCQVJTXG5cbiAgLy8gUHJlcGFyZSBET00gcmVhZHMgbmVlZGVkIHRvIHVwZGF0ZSB0aGUgc2Nyb2xsYmFycy4gRG9uZSBpbiBvbmVcbiAgLy8gc2hvdCB0byBtaW5pbWl6ZSB1cGRhdGUvbWVhc3VyZSByb3VuZHRyaXBzLlxuICBmdW5jdGlvbiBtZWFzdXJlRm9yU2Nyb2xsYmFycyhjbSkge1xuICAgIHZhciBzY3JvbGwgPSBjbS5kaXNwbGF5LnNjcm9sbGVyO1xuICAgIHJldHVybiB7XG4gICAgICBjbGllbnRIZWlnaHQ6IHNjcm9sbC5jbGllbnRIZWlnaHQsXG4gICAgICBiYXJIZWlnaHQ6IGNtLmRpc3BsYXkuc2Nyb2xsYmFyVi5jbGllbnRIZWlnaHQsXG4gICAgICBzY3JvbGxXaWR0aDogc2Nyb2xsLnNjcm9sbFdpZHRoLCBjbGllbnRXaWR0aDogc2Nyb2xsLmNsaWVudFdpZHRoLFxuICAgICAgYmFyV2lkdGg6IGNtLmRpc3BsYXkuc2Nyb2xsYmFySC5jbGllbnRXaWR0aCxcbiAgICAgIGRvY0hlaWdodDogTWF0aC5yb3VuZChjbS5kb2MuaGVpZ2h0ICsgcGFkZGluZ1ZlcnQoY20uZGlzcGxheSkpXG4gICAgfTtcbiAgfVxuXG4gIC8vIFJlLXN5bmNocm9uaXplIHRoZSBmYWtlIHNjcm9sbGJhcnMgd2l0aCB0aGUgYWN0dWFsIHNpemUgb2YgdGhlXG4gIC8vIGNvbnRlbnQuXG4gIGZ1bmN0aW9uIHVwZGF0ZVNjcm9sbGJhcnMoY20sIG1lYXN1cmUpIHtcbiAgICBpZiAoIW1lYXN1cmUpIG1lYXN1cmUgPSBtZWFzdXJlRm9yU2Nyb2xsYmFycyhjbSk7XG4gICAgdmFyIGQgPSBjbS5kaXNwbGF5O1xuICAgIHZhciBzY3JvbGxIZWlnaHQgPSBtZWFzdXJlLmRvY0hlaWdodCArIHNjcm9sbGVyQ3V0T2ZmO1xuICAgIHZhciBuZWVkc0ggPSBtZWFzdXJlLnNjcm9sbFdpZHRoID4gbWVhc3VyZS5jbGllbnRXaWR0aDtcbiAgICB2YXIgbmVlZHNWID0gc2Nyb2xsSGVpZ2h0ID4gbWVhc3VyZS5jbGllbnRIZWlnaHQ7XG4gICAgaWYgKG5lZWRzVikge1xuICAgICAgZC5zY3JvbGxiYXJWLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICBkLnNjcm9sbGJhclYuc3R5bGUuYm90dG9tID0gbmVlZHNIID8gc2Nyb2xsYmFyV2lkdGgoZC5tZWFzdXJlKSArIFwicHhcIiA6IFwiMFwiO1xuICAgICAgLy8gQSBidWcgaW4gSUU4IGNhbiBjYXVzZSB0aGlzIHZhbHVlIHRvIGJlIG5lZ2F0aXZlLCBzbyBndWFyZCBpdC5cbiAgICAgIGQuc2Nyb2xsYmFyVi5maXJzdENoaWxkLnN0eWxlLmhlaWdodCA9XG4gICAgICAgIE1hdGgubWF4KDAsIHNjcm9sbEhlaWdodCAtIG1lYXN1cmUuY2xpZW50SGVpZ2h0ICsgKG1lYXN1cmUuYmFySGVpZ2h0IHx8IGQuc2Nyb2xsYmFyVi5jbGllbnRIZWlnaHQpKSArIFwicHhcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgZC5zY3JvbGxiYXJWLnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xuICAgICAgZC5zY3JvbGxiYXJWLmZpcnN0Q2hpbGQuc3R5bGUuaGVpZ2h0ID0gXCIwXCI7XG4gICAgfVxuICAgIGlmIChuZWVkc0gpIHtcbiAgICAgIGQuc2Nyb2xsYmFySC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgZC5zY3JvbGxiYXJILnN0eWxlLnJpZ2h0ID0gbmVlZHNWID8gc2Nyb2xsYmFyV2lkdGgoZC5tZWFzdXJlKSArIFwicHhcIiA6IFwiMFwiO1xuICAgICAgZC5zY3JvbGxiYXJILmZpcnN0Q2hpbGQuc3R5bGUud2lkdGggPVxuICAgICAgICAobWVhc3VyZS5zY3JvbGxXaWR0aCAtIG1lYXN1cmUuY2xpZW50V2lkdGggKyAobWVhc3VyZS5iYXJXaWR0aCB8fCBkLnNjcm9sbGJhckguY2xpZW50V2lkdGgpKSArIFwicHhcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgZC5zY3JvbGxiYXJILnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xuICAgICAgZC5zY3JvbGxiYXJILmZpcnN0Q2hpbGQuc3R5bGUud2lkdGggPSBcIjBcIjtcbiAgICB9XG4gICAgaWYgKG5lZWRzSCAmJiBuZWVkc1YpIHtcbiAgICAgIGQuc2Nyb2xsYmFyRmlsbGVyLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICBkLnNjcm9sbGJhckZpbGxlci5zdHlsZS5oZWlnaHQgPSBkLnNjcm9sbGJhckZpbGxlci5zdHlsZS53aWR0aCA9IHNjcm9sbGJhcldpZHRoKGQubWVhc3VyZSkgKyBcInB4XCI7XG4gICAgfSBlbHNlIGQuc2Nyb2xsYmFyRmlsbGVyLnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xuICAgIGlmIChuZWVkc0ggJiYgY20ub3B0aW9ucy5jb3Zlckd1dHRlck5leHRUb1Njcm9sbGJhciAmJiBjbS5vcHRpb25zLmZpeGVkR3V0dGVyKSB7XG4gICAgICBkLmd1dHRlckZpbGxlci5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgZC5ndXR0ZXJGaWxsZXIuc3R5bGUuaGVpZ2h0ID0gc2Nyb2xsYmFyV2lkdGgoZC5tZWFzdXJlKSArIFwicHhcIjtcbiAgICAgIGQuZ3V0dGVyRmlsbGVyLnN0eWxlLndpZHRoID0gZC5ndXR0ZXJzLm9mZnNldFdpZHRoICsgXCJweFwiO1xuICAgIH0gZWxzZSBkLmd1dHRlckZpbGxlci5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcblxuICAgIGlmICghY20uc3RhdGUuY2hlY2tlZE92ZXJsYXlTY3JvbGxiYXIgJiYgbWVhc3VyZS5jbGllbnRIZWlnaHQgPiAwKSB7XG4gICAgICBpZiAoc2Nyb2xsYmFyV2lkdGgoZC5tZWFzdXJlKSA9PT0gMCkge1xuICAgICAgICB2YXIgdyA9IG1hYyAmJiAhbWFjX2dlTW91bnRhaW5MaW9uID8gXCIxMnB4XCIgOiBcIjE4cHhcIjtcbiAgICAgICAgZC5zY3JvbGxiYXJWLnN0eWxlLm1pbldpZHRoID0gZC5zY3JvbGxiYXJILnN0eWxlLm1pbkhlaWdodCA9IHc7XG4gICAgICAgIHZhciBiYXJNb3VzZURvd24gPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgaWYgKGVfdGFyZ2V0KGUpICE9IGQuc2Nyb2xsYmFyViAmJiBlX3RhcmdldChlKSAhPSBkLnNjcm9sbGJhckgpXG4gICAgICAgICAgICBvcGVyYXRpb24oY20sIG9uTW91c2VEb3duKShlKTtcbiAgICAgICAgfTtcbiAgICAgICAgb24oZC5zY3JvbGxiYXJWLCBcIm1vdXNlZG93blwiLCBiYXJNb3VzZURvd24pO1xuICAgICAgICBvbihkLnNjcm9sbGJhckgsIFwibW91c2Vkb3duXCIsIGJhck1vdXNlRG93bik7XG4gICAgICB9XG4gICAgICBjbS5zdGF0ZS5jaGVja2VkT3ZlcmxheVNjcm9sbGJhciA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgLy8gQ29tcHV0ZSB0aGUgbGluZXMgdGhhdCBhcmUgdmlzaWJsZSBpbiBhIGdpdmVuIHZpZXdwb3J0IChkZWZhdWx0c1xuICAvLyB0aGUgdGhlIGN1cnJlbnQgc2Nyb2xsIHBvc2l0aW9uKS4gdmlld1BvcnQgbWF5IGNvbnRhaW4gdG9wLFxuICAvLyBoZWlnaHQsIGFuZCBlbnN1cmUgKHNlZSBvcC5zY3JvbGxUb1BvcykgcHJvcGVydGllcy5cbiAgZnVuY3Rpb24gdmlzaWJsZUxpbmVzKGRpc3BsYXksIGRvYywgdmlld1BvcnQpIHtcbiAgICB2YXIgdG9wID0gdmlld1BvcnQgJiYgdmlld1BvcnQudG9wICE9IG51bGwgPyBNYXRoLm1heCgwLCB2aWV3UG9ydC50b3ApIDogZGlzcGxheS5zY3JvbGxlci5zY3JvbGxUb3A7XG4gICAgdG9wID0gTWF0aC5mbG9vcih0b3AgLSBwYWRkaW5nVG9wKGRpc3BsYXkpKTtcbiAgICB2YXIgYm90dG9tID0gdmlld1BvcnQgJiYgdmlld1BvcnQuYm90dG9tICE9IG51bGwgPyB2aWV3UG9ydC5ib3R0b20gOiB0b3AgKyBkaXNwbGF5LndyYXBwZXIuY2xpZW50SGVpZ2h0O1xuXG4gICAgdmFyIGZyb20gPSBsaW5lQXRIZWlnaHQoZG9jLCB0b3ApLCB0byA9IGxpbmVBdEhlaWdodChkb2MsIGJvdHRvbSk7XG4gICAgLy8gRW5zdXJlIGlzIGEge2Zyb206IHtsaW5lLCBjaH0sIHRvOiB7bGluZSwgY2h9fSBvYmplY3QsIGFuZFxuICAgIC8vIGZvcmNlcyB0aG9zZSBsaW5lcyBpbnRvIHRoZSB2aWV3cG9ydCAoaWYgcG9zc2libGUpLlxuICAgIGlmICh2aWV3UG9ydCAmJiB2aWV3UG9ydC5lbnN1cmUpIHtcbiAgICAgIHZhciBlbnN1cmVGcm9tID0gdmlld1BvcnQuZW5zdXJlLmZyb20ubGluZSwgZW5zdXJlVG8gPSB2aWV3UG9ydC5lbnN1cmUudG8ubGluZTtcbiAgICAgIGlmIChlbnN1cmVGcm9tIDwgZnJvbSlcbiAgICAgICAgcmV0dXJuIHtmcm9tOiBlbnN1cmVGcm9tLFxuICAgICAgICAgICAgICAgIHRvOiBsaW5lQXRIZWlnaHQoZG9jLCBoZWlnaHRBdExpbmUoZ2V0TGluZShkb2MsIGVuc3VyZUZyb20pKSArIGRpc3BsYXkud3JhcHBlci5jbGllbnRIZWlnaHQpfTtcbiAgICAgIGlmIChNYXRoLm1pbihlbnN1cmVUbywgZG9jLmxhc3RMaW5lKCkpID49IHRvKVxuICAgICAgICByZXR1cm4ge2Zyb206IGxpbmVBdEhlaWdodChkb2MsIGhlaWdodEF0TGluZShnZXRMaW5lKGRvYywgZW5zdXJlVG8pKSAtIGRpc3BsYXkud3JhcHBlci5jbGllbnRIZWlnaHQpLFxuICAgICAgICAgICAgICAgIHRvOiBlbnN1cmVUb307XG4gICAgfVxuICAgIHJldHVybiB7ZnJvbTogZnJvbSwgdG86IE1hdGgubWF4KHRvLCBmcm9tICsgMSl9O1xuICB9XG5cbiAgLy8gTElORSBOVU1CRVJTXG5cbiAgLy8gUmUtYWxpZ24gbGluZSBudW1iZXJzIGFuZCBndXR0ZXIgbWFya3MgdG8gY29tcGVuc2F0ZSBmb3JcbiAgLy8gaG9yaXpvbnRhbCBzY3JvbGxpbmcuXG4gIGZ1bmN0aW9uIGFsaWduSG9yaXpvbnRhbGx5KGNtKSB7XG4gICAgdmFyIGRpc3BsYXkgPSBjbS5kaXNwbGF5LCB2aWV3ID0gZGlzcGxheS52aWV3O1xuICAgIGlmICghZGlzcGxheS5hbGlnbldpZGdldHMgJiYgKCFkaXNwbGF5Lmd1dHRlcnMuZmlyc3RDaGlsZCB8fCAhY20ub3B0aW9ucy5maXhlZEd1dHRlcikpIHJldHVybjtcbiAgICB2YXIgY29tcCA9IGNvbXBlbnNhdGVGb3JIU2Nyb2xsKGRpc3BsYXkpIC0gZGlzcGxheS5zY3JvbGxlci5zY3JvbGxMZWZ0ICsgY20uZG9jLnNjcm9sbExlZnQ7XG4gICAgdmFyIGd1dHRlclcgPSBkaXNwbGF5Lmd1dHRlcnMub2Zmc2V0V2lkdGgsIGxlZnQgPSBjb21wICsgXCJweFwiO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmlldy5sZW5ndGg7IGkrKykgaWYgKCF2aWV3W2ldLmhpZGRlbikge1xuICAgICAgaWYgKGNtLm9wdGlvbnMuZml4ZWRHdXR0ZXIgJiYgdmlld1tpXS5ndXR0ZXIpXG4gICAgICAgIHZpZXdbaV0uZ3V0dGVyLnN0eWxlLmxlZnQgPSBsZWZ0O1xuICAgICAgdmFyIGFsaWduID0gdmlld1tpXS5hbGlnbmFibGU7XG4gICAgICBpZiAoYWxpZ24pIGZvciAodmFyIGogPSAwOyBqIDwgYWxpZ24ubGVuZ3RoOyBqKyspXG4gICAgICAgIGFsaWduW2pdLnN0eWxlLmxlZnQgPSBsZWZ0O1xuICAgIH1cbiAgICBpZiAoY20ub3B0aW9ucy5maXhlZEd1dHRlcilcbiAgICAgIGRpc3BsYXkuZ3V0dGVycy5zdHlsZS5sZWZ0ID0gKGNvbXAgKyBndXR0ZXJXKSArIFwicHhcIjtcbiAgfVxuXG4gIC8vIFVzZWQgdG8gZW5zdXJlIHRoYXQgdGhlIGxpbmUgbnVtYmVyIGd1dHRlciBpcyBzdGlsbCB0aGUgcmlnaHRcbiAgLy8gc2l6ZSBmb3IgdGhlIGN1cnJlbnQgZG9jdW1lbnQgc2l6ZS4gUmV0dXJucyB0cnVlIHdoZW4gYW4gdXBkYXRlXG4gIC8vIGlzIG5lZWRlZC5cbiAgZnVuY3Rpb24gbWF5YmVVcGRhdGVMaW5lTnVtYmVyV2lkdGgoY20pIHtcbiAgICBpZiAoIWNtLm9wdGlvbnMubGluZU51bWJlcnMpIHJldHVybiBmYWxzZTtcbiAgICB2YXIgZG9jID0gY20uZG9jLCBsYXN0ID0gbGluZU51bWJlckZvcihjbS5vcHRpb25zLCBkb2MuZmlyc3QgKyBkb2Muc2l6ZSAtIDEpLCBkaXNwbGF5ID0gY20uZGlzcGxheTtcbiAgICBpZiAobGFzdC5sZW5ndGggIT0gZGlzcGxheS5saW5lTnVtQ2hhcnMpIHtcbiAgICAgIHZhciB0ZXN0ID0gZGlzcGxheS5tZWFzdXJlLmFwcGVuZENoaWxkKGVsdChcImRpdlwiLCBbZWx0KFwiZGl2XCIsIGxhc3QpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkNvZGVNaXJyb3ItbGluZW51bWJlciBDb2RlTWlycm9yLWd1dHRlci1lbHRcIikpO1xuICAgICAgdmFyIGlubmVyVyA9IHRlc3QuZmlyc3RDaGlsZC5vZmZzZXRXaWR0aCwgcGFkZGluZyA9IHRlc3Qub2Zmc2V0V2lkdGggLSBpbm5lclc7XG4gICAgICBkaXNwbGF5LmxpbmVHdXR0ZXIuc3R5bGUud2lkdGggPSBcIlwiO1xuICAgICAgZGlzcGxheS5saW5lTnVtSW5uZXJXaWR0aCA9IE1hdGgubWF4KGlubmVyVywgZGlzcGxheS5saW5lR3V0dGVyLm9mZnNldFdpZHRoIC0gcGFkZGluZyk7XG4gICAgICBkaXNwbGF5LmxpbmVOdW1XaWR0aCA9IGRpc3BsYXkubGluZU51bUlubmVyV2lkdGggKyBwYWRkaW5nO1xuICAgICAgZGlzcGxheS5saW5lTnVtQ2hhcnMgPSBkaXNwbGF5LmxpbmVOdW1Jbm5lcldpZHRoID8gbGFzdC5sZW5ndGggOiAtMTtcbiAgICAgIGRpc3BsYXkubGluZUd1dHRlci5zdHlsZS53aWR0aCA9IGRpc3BsYXkubGluZU51bVdpZHRoICsgXCJweFwiO1xuICAgICAgdXBkYXRlR3V0dGVyU3BhY2UoY20pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxpbmVOdW1iZXJGb3Iob3B0aW9ucywgaSkge1xuICAgIHJldHVybiBTdHJpbmcob3B0aW9ucy5saW5lTnVtYmVyRm9ybWF0dGVyKGkgKyBvcHRpb25zLmZpcnN0TGluZU51bWJlcikpO1xuICB9XG5cbiAgLy8gQ29tcHV0ZXMgZGlzcGxheS5zY3JvbGxlci5zY3JvbGxMZWZ0ICsgZGlzcGxheS5ndXR0ZXJzLm9mZnNldFdpZHRoLFxuICAvLyBidXQgdXNpbmcgZ2V0Qm91bmRpbmdDbGllbnRSZWN0IHRvIGdldCBhIHN1Yi1waXhlbC1hY2N1cmF0ZVxuICAvLyByZXN1bHQuXG4gIGZ1bmN0aW9uIGNvbXBlbnNhdGVGb3JIU2Nyb2xsKGRpc3BsYXkpIHtcbiAgICByZXR1cm4gZGlzcGxheS5zY3JvbGxlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0IC0gZGlzcGxheS5zaXplci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0O1xuICB9XG5cbiAgLy8gRElTUExBWSBEUkFXSU5HXG5cbiAgLy8gVXBkYXRlcyB0aGUgZGlzcGxheSwgc2VsZWN0aW9uLCBhbmQgc2Nyb2xsYmFycywgdXNpbmcgdGhlXG4gIC8vIGluZm9ybWF0aW9uIGluIGRpc3BsYXkudmlldyB0byBmaW5kIG91dCB3aGljaCBub2RlcyBhcmUgbm8gbG9uZ2VyXG4gIC8vIHVwLXRvLWRhdGUuIFRyaWVzIHRvIGJhaWwgb3V0IGVhcmx5IHdoZW4gbm8gY2hhbmdlcyBhcmUgbmVlZGVkLFxuICAvLyB1bmxlc3MgZm9yY2VkIGlzIHRydWUuXG4gIC8vIFJldHVybnMgdHJ1ZSBpZiBhbiBhY3R1YWwgdXBkYXRlIGhhcHBlbmVkLCBmYWxzZSBvdGhlcndpc2UuXG4gIGZ1bmN0aW9uIHVwZGF0ZURpc3BsYXkoY20sIHZpZXdQb3J0LCBmb3JjZWQpIHtcbiAgICB2YXIgb2xkRnJvbSA9IGNtLmRpc3BsYXkudmlld0Zyb20sIG9sZFRvID0gY20uZGlzcGxheS52aWV3VG8sIHVwZGF0ZWQ7XG4gICAgdmFyIHZpc2libGUgPSB2aXNpYmxlTGluZXMoY20uZGlzcGxheSwgY20uZG9jLCB2aWV3UG9ydCk7XG4gICAgZm9yICh2YXIgZmlyc3QgPSB0cnVlOzsgZmlyc3QgPSBmYWxzZSkge1xuICAgICAgdmFyIG9sZFdpZHRoID0gY20uZGlzcGxheS5zY3JvbGxlci5jbGllbnRXaWR0aDtcbiAgICAgIGlmICghdXBkYXRlRGlzcGxheUlubmVyKGNtLCB2aXNpYmxlLCBmb3JjZWQpKSBicmVhaztcbiAgICAgIHVwZGF0ZWQgPSB0cnVlO1xuXG4gICAgICAvLyBJZiB0aGUgbWF4IGxpbmUgY2hhbmdlZCBzaW5jZSBpdCB3YXMgbGFzdCBtZWFzdXJlZCwgbWVhc3VyZSBpdCxcbiAgICAgIC8vIGFuZCBlbnN1cmUgdGhlIGRvY3VtZW50J3Mgd2lkdGggbWF0Y2hlcyBpdC5cbiAgICAgIGlmIChjbS5kaXNwbGF5Lm1heExpbmVDaGFuZ2VkICYmICFjbS5vcHRpb25zLmxpbmVXcmFwcGluZylcbiAgICAgICAgYWRqdXN0Q29udGVudFdpZHRoKGNtKTtcblxuICAgICAgdmFyIGJhck1lYXN1cmUgPSBtZWFzdXJlRm9yU2Nyb2xsYmFycyhjbSk7XG4gICAgICB1cGRhdGVTZWxlY3Rpb24oY20pO1xuICAgICAgc2V0RG9jdW1lbnRIZWlnaHQoY20sIGJhck1lYXN1cmUpO1xuICAgICAgdXBkYXRlU2Nyb2xsYmFycyhjbSwgYmFyTWVhc3VyZSk7XG4gICAgICBpZiAod2Via2l0ICYmIGNtLm9wdGlvbnMubGluZVdyYXBwaW5nKVxuICAgICAgICBjaGVja0ZvcldlYmtpdFdpZHRoQnVnKGNtLCBiYXJNZWFzdXJlKTsgLy8gKElzc3VlICMyNDIwKVxuICAgICAgaWYgKGZpcnN0ICYmIGNtLm9wdGlvbnMubGluZVdyYXBwaW5nICYmIG9sZFdpZHRoICE9IGNtLmRpc3BsYXkuc2Nyb2xsZXIuY2xpZW50V2lkdGgpIHtcbiAgICAgICAgZm9yY2VkID0gdHJ1ZTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBmb3JjZWQgPSBmYWxzZTtcblxuICAgICAgLy8gQ2xpcCBmb3JjZWQgdmlld3BvcnQgdG8gYWN0dWFsIHNjcm9sbGFibGUgYXJlYS5cbiAgICAgIGlmICh2aWV3UG9ydCAmJiB2aWV3UG9ydC50b3AgIT0gbnVsbClcbiAgICAgICAgdmlld1BvcnQgPSB7dG9wOiBNYXRoLm1pbihiYXJNZWFzdXJlLmRvY0hlaWdodCAtIHNjcm9sbGVyQ3V0T2ZmIC0gYmFyTWVhc3VyZS5jbGllbnRIZWlnaHQsIHZpZXdQb3J0LnRvcCl9O1xuICAgICAgLy8gVXBkYXRlZCBsaW5lIGhlaWdodHMgbWlnaHQgcmVzdWx0IGluIHRoZSBkcmF3biBhcmVhIG5vdFxuICAgICAgLy8gYWN0dWFsbHkgY292ZXJpbmcgdGhlIHZpZXdwb3J0LiBLZWVwIGxvb3BpbmcgdW50aWwgaXQgZG9lcy5cbiAgICAgIHZpc2libGUgPSB2aXNpYmxlTGluZXMoY20uZGlzcGxheSwgY20uZG9jLCB2aWV3UG9ydCk7XG4gICAgICBpZiAodmlzaWJsZS5mcm9tID49IGNtLmRpc3BsYXkudmlld0Zyb20gJiYgdmlzaWJsZS50byA8PSBjbS5kaXNwbGF5LnZpZXdUbylcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgY20uZGlzcGxheS51cGRhdGVMaW5lTnVtYmVycyA9IG51bGw7XG4gICAgaWYgKHVwZGF0ZWQpIHtcbiAgICAgIHNpZ25hbExhdGVyKGNtLCBcInVwZGF0ZVwiLCBjbSk7XG4gICAgICBpZiAoY20uZGlzcGxheS52aWV3RnJvbSAhPSBvbGRGcm9tIHx8IGNtLmRpc3BsYXkudmlld1RvICE9IG9sZFRvKVxuICAgICAgICBzaWduYWxMYXRlcihjbSwgXCJ2aWV3cG9ydENoYW5nZVwiLCBjbSwgY20uZGlzcGxheS52aWV3RnJvbSwgY20uZGlzcGxheS52aWV3VG8pO1xuICAgIH1cbiAgICByZXR1cm4gdXBkYXRlZDtcbiAgfVxuXG4gIC8vIERvZXMgdGhlIGFjdHVhbCB1cGRhdGluZyBvZiB0aGUgbGluZSBkaXNwbGF5LiBCYWlscyBvdXRcbiAgLy8gKHJldHVybmluZyBmYWxzZSkgd2hlbiB0aGVyZSBpcyBub3RoaW5nIHRvIGJlIGRvbmUgYW5kIGZvcmNlZCBpc1xuICAvLyBmYWxzZS5cbiAgZnVuY3Rpb24gdXBkYXRlRGlzcGxheUlubmVyKGNtLCB2aXNpYmxlLCBmb3JjZWQpIHtcbiAgICB2YXIgZGlzcGxheSA9IGNtLmRpc3BsYXksIGRvYyA9IGNtLmRvYztcbiAgICBpZiAoIWRpc3BsYXkud3JhcHBlci5vZmZzZXRXaWR0aCkge1xuICAgICAgcmVzZXRWaWV3KGNtKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBCYWlsIG91dCBpZiB0aGUgdmlzaWJsZSBhcmVhIGlzIGFscmVhZHkgcmVuZGVyZWQgYW5kIG5vdGhpbmcgY2hhbmdlZC5cbiAgICBpZiAoIWZvcmNlZCAmJiB2aXNpYmxlLmZyb20gPj0gZGlzcGxheS52aWV3RnJvbSAmJiB2aXNpYmxlLnRvIDw9IGRpc3BsYXkudmlld1RvICYmXG4gICAgICAgIGNvdW50RGlydHlWaWV3KGNtKSA9PSAwKVxuICAgICAgcmV0dXJuO1xuXG4gICAgaWYgKG1heWJlVXBkYXRlTGluZU51bWJlcldpZHRoKGNtKSlcbiAgICAgIHJlc2V0VmlldyhjbSk7XG4gICAgdmFyIGRpbXMgPSBnZXREaW1lbnNpb25zKGNtKTtcblxuICAgIC8vIENvbXB1dGUgYSBzdWl0YWJsZSBuZXcgdmlld3BvcnQgKGZyb20gJiB0bylcbiAgICB2YXIgZW5kID0gZG9jLmZpcnN0ICsgZG9jLnNpemU7XG4gICAgdmFyIGZyb20gPSBNYXRoLm1heCh2aXNpYmxlLmZyb20gLSBjbS5vcHRpb25zLnZpZXdwb3J0TWFyZ2luLCBkb2MuZmlyc3QpO1xuICAgIHZhciB0byA9IE1hdGgubWluKGVuZCwgdmlzaWJsZS50byArIGNtLm9wdGlvbnMudmlld3BvcnRNYXJnaW4pO1xuICAgIGlmIChkaXNwbGF5LnZpZXdGcm9tIDwgZnJvbSAmJiBmcm9tIC0gZGlzcGxheS52aWV3RnJvbSA8IDIwKSBmcm9tID0gTWF0aC5tYXgoZG9jLmZpcnN0LCBkaXNwbGF5LnZpZXdGcm9tKTtcbiAgICBpZiAoZGlzcGxheS52aWV3VG8gPiB0byAmJiBkaXNwbGF5LnZpZXdUbyAtIHRvIDwgMjApIHRvID0gTWF0aC5taW4oZW5kLCBkaXNwbGF5LnZpZXdUbyk7XG4gICAgaWYgKHNhd0NvbGxhcHNlZFNwYW5zKSB7XG4gICAgICBmcm9tID0gdmlzdWFsTGluZU5vKGNtLmRvYywgZnJvbSk7XG4gICAgICB0byA9IHZpc3VhbExpbmVFbmRObyhjbS5kb2MsIHRvKTtcbiAgICB9XG5cbiAgICB2YXIgZGlmZmVyZW50ID0gZnJvbSAhPSBkaXNwbGF5LnZpZXdGcm9tIHx8IHRvICE9IGRpc3BsYXkudmlld1RvIHx8XG4gICAgICBkaXNwbGF5Lmxhc3RTaXplQyAhPSBkaXNwbGF5LndyYXBwZXIuY2xpZW50SGVpZ2h0O1xuICAgIGFkanVzdFZpZXcoY20sIGZyb20sIHRvKTtcblxuICAgIGRpc3BsYXkudmlld09mZnNldCA9IGhlaWdodEF0TGluZShnZXRMaW5lKGNtLmRvYywgZGlzcGxheS52aWV3RnJvbSkpO1xuICAgIC8vIFBvc2l0aW9uIHRoZSBtb3ZlciBkaXYgdG8gYWxpZ24gd2l0aCB0aGUgY3VycmVudCBzY3JvbGwgcG9zaXRpb25cbiAgICBjbS5kaXNwbGF5Lm1vdmVyLnN0eWxlLnRvcCA9IGRpc3BsYXkudmlld09mZnNldCArIFwicHhcIjtcblxuICAgIHZhciB0b1VwZGF0ZSA9IGNvdW50RGlydHlWaWV3KGNtKTtcbiAgICBpZiAoIWRpZmZlcmVudCAmJiB0b1VwZGF0ZSA9PSAwICYmICFmb3JjZWQpIHJldHVybjtcblxuICAgIC8vIEZvciBiaWcgY2hhbmdlcywgd2UgaGlkZSB0aGUgZW5jbG9zaW5nIGVsZW1lbnQgZHVyaW5nIHRoZVxuICAgIC8vIHVwZGF0ZSwgc2luY2UgdGhhdCBzcGVlZHMgdXAgdGhlIG9wZXJhdGlvbnMgb24gbW9zdCBicm93c2Vycy5cbiAgICB2YXIgZm9jdXNlZCA9IGFjdGl2ZUVsdCgpO1xuICAgIGlmICh0b1VwZGF0ZSA+IDQpIGRpc3BsYXkubGluZURpdi5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgcGF0Y2hEaXNwbGF5KGNtLCBkaXNwbGF5LnVwZGF0ZUxpbmVOdW1iZXJzLCBkaW1zKTtcbiAgICBpZiAodG9VcGRhdGUgPiA0KSBkaXNwbGF5LmxpbmVEaXYuc3R5bGUuZGlzcGxheSA9IFwiXCI7XG4gICAgLy8gVGhlcmUgbWlnaHQgaGF2ZSBiZWVuIGEgd2lkZ2V0IHdpdGggYSBmb2N1c2VkIGVsZW1lbnQgdGhhdCBnb3RcbiAgICAvLyBoaWRkZW4gb3IgdXBkYXRlZCwgaWYgc28gcmUtZm9jdXMgaXQuXG4gICAgaWYgKGZvY3VzZWQgJiYgYWN0aXZlRWx0KCkgIT0gZm9jdXNlZCAmJiBmb2N1c2VkLm9mZnNldEhlaWdodCkgZm9jdXNlZC5mb2N1cygpO1xuXG4gICAgLy8gUHJldmVudCBzZWxlY3Rpb24gYW5kIGN1cnNvcnMgZnJvbSBpbnRlcmZlcmluZyB3aXRoIHRoZSBzY3JvbGxcbiAgICAvLyB3aWR0aC5cbiAgICByZW1vdmVDaGlsZHJlbihkaXNwbGF5LmN1cnNvckRpdik7XG4gICAgcmVtb3ZlQ2hpbGRyZW4oZGlzcGxheS5zZWxlY3Rpb25EaXYpO1xuXG4gICAgaWYgKGRpZmZlcmVudCkge1xuICAgICAgZGlzcGxheS5sYXN0U2l6ZUMgPSBkaXNwbGF5LndyYXBwZXIuY2xpZW50SGVpZ2h0O1xuICAgICAgc3RhcnRXb3JrZXIoY20sIDQwMCk7XG4gICAgfVxuXG4gICAgdXBkYXRlSGVpZ2h0c0luVmlld3BvcnQoY20pO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBmdW5jdGlvbiBhZGp1c3RDb250ZW50V2lkdGgoY20pIHtcbiAgICB2YXIgZGlzcGxheSA9IGNtLmRpc3BsYXk7XG4gICAgdmFyIHdpZHRoID0gbWVhc3VyZUNoYXIoY20sIGRpc3BsYXkubWF4TGluZSwgZGlzcGxheS5tYXhMaW5lLnRleHQubGVuZ3RoKS5sZWZ0O1xuICAgIGRpc3BsYXkubWF4TGluZUNoYW5nZWQgPSBmYWxzZTtcbiAgICB2YXIgbWluV2lkdGggPSBNYXRoLm1heCgwLCB3aWR0aCArIDMpO1xuICAgIHZhciBtYXhTY3JvbGxMZWZ0ID0gTWF0aC5tYXgoMCwgZGlzcGxheS5zaXplci5vZmZzZXRMZWZ0ICsgbWluV2lkdGggKyBzY3JvbGxlckN1dE9mZiAtIGRpc3BsYXkuc2Nyb2xsZXIuY2xpZW50V2lkdGgpO1xuICAgIGRpc3BsYXkuc2l6ZXIuc3R5bGUubWluV2lkdGggPSBtaW5XaWR0aCArIFwicHhcIjtcbiAgICBpZiAobWF4U2Nyb2xsTGVmdCA8IGNtLmRvYy5zY3JvbGxMZWZ0KVxuICAgICAgc2V0U2Nyb2xsTGVmdChjbSwgTWF0aC5taW4oZGlzcGxheS5zY3JvbGxlci5zY3JvbGxMZWZ0LCBtYXhTY3JvbGxMZWZ0KSwgdHJ1ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBzZXREb2N1bWVudEhlaWdodChjbSwgbWVhc3VyZSkge1xuICAgIGNtLmRpc3BsYXkuc2l6ZXIuc3R5bGUubWluSGVpZ2h0ID0gY20uZGlzcGxheS5oZWlnaHRGb3JjZXIuc3R5bGUudG9wID0gbWVhc3VyZS5kb2NIZWlnaHQgKyBcInB4XCI7XG4gICAgY20uZGlzcGxheS5ndXR0ZXJzLnN0eWxlLmhlaWdodCA9IE1hdGgubWF4KG1lYXN1cmUuZG9jSGVpZ2h0LCBtZWFzdXJlLmNsaWVudEhlaWdodCAtIHNjcm9sbGVyQ3V0T2ZmKSArIFwicHhcIjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNoZWNrRm9yV2Via2l0V2lkdGhCdWcoY20sIG1lYXN1cmUpIHtcbiAgICAvLyBXb3JrIGFyb3VuZCBXZWJraXQgYnVnIHdoZXJlIGl0IHNvbWV0aW1lcyByZXNlcnZlcyBzcGFjZSBmb3IgYVxuICAgIC8vIG5vbi1leGlzdGluZyBwaGFudG9tIHNjcm9sbGJhciBpbiB0aGUgc2Nyb2xsZXIgKElzc3VlICMyNDIwKVxuICAgIGlmIChjbS5kaXNwbGF5LnNpemVyLm9mZnNldFdpZHRoICsgY20uZGlzcGxheS5ndXR0ZXJzLm9mZnNldFdpZHRoIDwgY20uZGlzcGxheS5zY3JvbGxlci5jbGllbnRXaWR0aCAtIDEpIHtcbiAgICAgIGNtLmRpc3BsYXkuc2l6ZXIuc3R5bGUubWluSGVpZ2h0ID0gY20uZGlzcGxheS5oZWlnaHRGb3JjZXIuc3R5bGUudG9wID0gXCIwcHhcIjtcbiAgICAgIGNtLmRpc3BsYXkuZ3V0dGVycy5zdHlsZS5oZWlnaHQgPSBtZWFzdXJlLmRvY0hlaWdodCArIFwicHhcIjtcbiAgICB9XG4gIH1cblxuICAvLyBSZWFkIHRoZSBhY3R1YWwgaGVpZ2h0cyBvZiB0aGUgcmVuZGVyZWQgbGluZXMsIGFuZCB1cGRhdGUgdGhlaXJcbiAgLy8gc3RvcmVkIGhlaWdodHMgdG8gbWF0Y2guXG4gIGZ1bmN0aW9uIHVwZGF0ZUhlaWdodHNJblZpZXdwb3J0KGNtKSB7XG4gICAgdmFyIGRpc3BsYXkgPSBjbS5kaXNwbGF5O1xuICAgIHZhciBwcmV2Qm90dG9tID0gZGlzcGxheS5saW5lRGl2Lm9mZnNldFRvcDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRpc3BsYXkudmlldy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGN1ciA9IGRpc3BsYXkudmlld1tpXSwgaGVpZ2h0O1xuICAgICAgaWYgKGN1ci5oaWRkZW4pIGNvbnRpbnVlO1xuICAgICAgaWYgKGllX3VwdG83KSB7XG4gICAgICAgIHZhciBib3QgPSBjdXIubm9kZS5vZmZzZXRUb3AgKyBjdXIubm9kZS5vZmZzZXRIZWlnaHQ7XG4gICAgICAgIGhlaWdodCA9IGJvdCAtIHByZXZCb3R0b207XG4gICAgICAgIHByZXZCb3R0b20gPSBib3Q7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgYm94ID0gY3VyLm5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGhlaWdodCA9IGJveC5ib3R0b20gLSBib3gudG9wO1xuICAgICAgfVxuICAgICAgdmFyIGRpZmYgPSBjdXIubGluZS5oZWlnaHQgLSBoZWlnaHQ7XG4gICAgICBpZiAoaGVpZ2h0IDwgMikgaGVpZ2h0ID0gdGV4dEhlaWdodChkaXNwbGF5KTtcbiAgICAgIGlmIChkaWZmID4gLjAwMSB8fCBkaWZmIDwgLS4wMDEpIHtcbiAgICAgICAgdXBkYXRlTGluZUhlaWdodChjdXIubGluZSwgaGVpZ2h0KTtcbiAgICAgICAgdXBkYXRlV2lkZ2V0SGVpZ2h0KGN1ci5saW5lKTtcbiAgICAgICAgaWYgKGN1ci5yZXN0KSBmb3IgKHZhciBqID0gMDsgaiA8IGN1ci5yZXN0Lmxlbmd0aDsgaisrKVxuICAgICAgICAgIHVwZGF0ZVdpZGdldEhlaWdodChjdXIucmVzdFtqXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gUmVhZCBhbmQgc3RvcmUgdGhlIGhlaWdodCBvZiBsaW5lIHdpZGdldHMgYXNzb2NpYXRlZCB3aXRoIHRoZVxuICAvLyBnaXZlbiBsaW5lLlxuICBmdW5jdGlvbiB1cGRhdGVXaWRnZXRIZWlnaHQobGluZSkge1xuICAgIGlmIChsaW5lLndpZGdldHMpIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZS53aWRnZXRzLmxlbmd0aDsgKytpKVxuICAgICAgbGluZS53aWRnZXRzW2ldLmhlaWdodCA9IGxpbmUud2lkZ2V0c1tpXS5ub2RlLm9mZnNldEhlaWdodDtcbiAgfVxuXG4gIC8vIERvIGEgYnVsay1yZWFkIG9mIHRoZSBET00gcG9zaXRpb25zIGFuZCBzaXplcyBuZWVkZWQgdG8gZHJhdyB0aGVcbiAgLy8gdmlldywgc28gdGhhdCB3ZSBkb24ndCBpbnRlcmxlYXZlIHJlYWRpbmcgYW5kIHdyaXRpbmcgdG8gdGhlIERPTS5cbiAgZnVuY3Rpb24gZ2V0RGltZW5zaW9ucyhjbSkge1xuICAgIHZhciBkID0gY20uZGlzcGxheSwgbGVmdCA9IHt9LCB3aWR0aCA9IHt9O1xuICAgIGZvciAodmFyIG4gPSBkLmd1dHRlcnMuZmlyc3RDaGlsZCwgaSA9IDA7IG47IG4gPSBuLm5leHRTaWJsaW5nLCArK2kpIHtcbiAgICAgIGxlZnRbY20ub3B0aW9ucy5ndXR0ZXJzW2ldXSA9IG4ub2Zmc2V0TGVmdDtcbiAgICAgIHdpZHRoW2NtLm9wdGlvbnMuZ3V0dGVyc1tpXV0gPSBuLm9mZnNldFdpZHRoO1xuICAgIH1cbiAgICByZXR1cm4ge2ZpeGVkUG9zOiBjb21wZW5zYXRlRm9ySFNjcm9sbChkKSxcbiAgICAgICAgICAgIGd1dHRlclRvdGFsV2lkdGg6IGQuZ3V0dGVycy5vZmZzZXRXaWR0aCxcbiAgICAgICAgICAgIGd1dHRlckxlZnQ6IGxlZnQsXG4gICAgICAgICAgICBndXR0ZXJXaWR0aDogd2lkdGgsXG4gICAgICAgICAgICB3cmFwcGVyV2lkdGg6IGQud3JhcHBlci5jbGllbnRXaWR0aH07XG4gIH1cblxuICAvLyBTeW5jIHRoZSBhY3R1YWwgZGlzcGxheSBET00gc3RydWN0dXJlIHdpdGggZGlzcGxheS52aWV3LCByZW1vdmluZ1xuICAvLyBub2RlcyBmb3IgbGluZXMgdGhhdCBhcmUgbm8gbG9uZ2VyIGluIHZpZXcsIGFuZCBjcmVhdGluZyB0aGUgb25lc1xuICAvLyB0aGF0IGFyZSBub3QgdGhlcmUgeWV0LCBhbmQgdXBkYXRpbmcgdGhlIG9uZXMgdGhhdCBhcmUgb3V0IG9mXG4gIC8vIGRhdGUuXG4gIGZ1bmN0aW9uIHBhdGNoRGlzcGxheShjbSwgdXBkYXRlTnVtYmVyc0Zyb20sIGRpbXMpIHtcbiAgICB2YXIgZGlzcGxheSA9IGNtLmRpc3BsYXksIGxpbmVOdW1iZXJzID0gY20ub3B0aW9ucy5saW5lTnVtYmVycztcbiAgICB2YXIgY29udGFpbmVyID0gZGlzcGxheS5saW5lRGl2LCBjdXIgPSBjb250YWluZXIuZmlyc3RDaGlsZDtcblxuICAgIGZ1bmN0aW9uIHJtKG5vZGUpIHtcbiAgICAgIHZhciBuZXh0ID0gbm9kZS5uZXh0U2libGluZztcbiAgICAgIC8vIFdvcmtzIGFyb3VuZCBhIHRocm93LXNjcm9sbCBidWcgaW4gT1MgWCBXZWJraXRcbiAgICAgIGlmICh3ZWJraXQgJiYgbWFjICYmIGNtLmRpc3BsYXkuY3VycmVudFdoZWVsVGFyZ2V0ID09IG5vZGUpXG4gICAgICAgIG5vZGUuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgZWxzZVxuICAgICAgICBub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgICByZXR1cm4gbmV4dDtcbiAgICB9XG5cbiAgICB2YXIgdmlldyA9IGRpc3BsYXkudmlldywgbGluZU4gPSBkaXNwbGF5LnZpZXdGcm9tO1xuICAgIC8vIExvb3Agb3ZlciB0aGUgZWxlbWVudHMgaW4gdGhlIHZpZXcsIHN5bmNpbmcgY3VyICh0aGUgRE9NIG5vZGVzXG4gICAgLy8gaW4gZGlzcGxheS5saW5lRGl2KSB3aXRoIHRoZSB2aWV3IGFzIHdlIGdvLlxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmlldy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGxpbmVWaWV3ID0gdmlld1tpXTtcbiAgICAgIGlmIChsaW5lVmlldy5oaWRkZW4pIHtcbiAgICAgIH0gZWxzZSBpZiAoIWxpbmVWaWV3Lm5vZGUpIHsgLy8gTm90IGRyYXduIHlldFxuICAgICAgICB2YXIgbm9kZSA9IGJ1aWxkTGluZUVsZW1lbnQoY20sIGxpbmVWaWV3LCBsaW5lTiwgZGltcyk7XG4gICAgICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUobm9kZSwgY3VyKTtcbiAgICAgIH0gZWxzZSB7IC8vIEFscmVhZHkgZHJhd25cbiAgICAgICAgd2hpbGUgKGN1ciAhPSBsaW5lVmlldy5ub2RlKSBjdXIgPSBybShjdXIpO1xuICAgICAgICB2YXIgdXBkYXRlTnVtYmVyID0gbGluZU51bWJlcnMgJiYgdXBkYXRlTnVtYmVyc0Zyb20gIT0gbnVsbCAmJlxuICAgICAgICAgIHVwZGF0ZU51bWJlcnNGcm9tIDw9IGxpbmVOICYmIGxpbmVWaWV3LmxpbmVOdW1iZXI7XG4gICAgICAgIGlmIChsaW5lVmlldy5jaGFuZ2VzKSB7XG4gICAgICAgICAgaWYgKGluZGV4T2YobGluZVZpZXcuY2hhbmdlcywgXCJndXR0ZXJcIikgPiAtMSkgdXBkYXRlTnVtYmVyID0gZmFsc2U7XG4gICAgICAgICAgdXBkYXRlTGluZUZvckNoYW5nZXMoY20sIGxpbmVWaWV3LCBsaW5lTiwgZGltcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVwZGF0ZU51bWJlcikge1xuICAgICAgICAgIHJlbW92ZUNoaWxkcmVuKGxpbmVWaWV3LmxpbmVOdW1iZXIpO1xuICAgICAgICAgIGxpbmVWaWV3LmxpbmVOdW1iZXIuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobGluZU51bWJlckZvcihjbS5vcHRpb25zLCBsaW5lTikpKTtcbiAgICAgICAgfVxuICAgICAgICBjdXIgPSBsaW5lVmlldy5ub2RlLm5leHRTaWJsaW5nO1xuICAgICAgfVxuICAgICAgbGluZU4gKz0gbGluZVZpZXcuc2l6ZTtcbiAgICB9XG4gICAgd2hpbGUgKGN1cikgY3VyID0gcm0oY3VyKTtcbiAgfVxuXG4gIC8vIFdoZW4gYW4gYXNwZWN0IG9mIGEgbGluZSBjaGFuZ2VzLCBhIHN0cmluZyBpcyBhZGRlZCB0b1xuICAvLyBsaW5lVmlldy5jaGFuZ2VzLiBUaGlzIHVwZGF0ZXMgdGhlIHJlbGV2YW50IHBhcnQgb2YgdGhlIGxpbmUnc1xuICAvLyBET00gc3RydWN0dXJlLlxuICBmdW5jdGlvbiB1cGRhdGVMaW5lRm9yQ2hhbmdlcyhjbSwgbGluZVZpZXcsIGxpbmVOLCBkaW1zKSB7XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBsaW5lVmlldy5jaGFuZ2VzLmxlbmd0aDsgaisrKSB7XG4gICAgICB2YXIgdHlwZSA9IGxpbmVWaWV3LmNoYW5nZXNbal07XG4gICAgICBpZiAodHlwZSA9PSBcInRleHRcIikgdXBkYXRlTGluZVRleHQoY20sIGxpbmVWaWV3KTtcbiAgICAgIGVsc2UgaWYgKHR5cGUgPT0gXCJndXR0ZXJcIikgdXBkYXRlTGluZUd1dHRlcihjbSwgbGluZVZpZXcsIGxpbmVOLCBkaW1zKTtcbiAgICAgIGVsc2UgaWYgKHR5cGUgPT0gXCJjbGFzc1wiKSB1cGRhdGVMaW5lQ2xhc3NlcyhsaW5lVmlldyk7XG4gICAgICBlbHNlIGlmICh0eXBlID09IFwid2lkZ2V0XCIpIHVwZGF0ZUxpbmVXaWRnZXRzKGxpbmVWaWV3LCBkaW1zKTtcbiAgICB9XG4gICAgbGluZVZpZXcuY2hhbmdlcyA9IG51bGw7XG4gIH1cblxuICAvLyBMaW5lcyB3aXRoIGd1dHRlciBlbGVtZW50cywgd2lkZ2V0cyBvciBhIGJhY2tncm91bmQgY2xhc3MgbmVlZCB0b1xuICAvLyBiZSB3cmFwcGVkLCBhbmQgaGF2ZSB0aGUgZXh0cmEgZWxlbWVudHMgYWRkZWQgdG8gdGhlIHdyYXBwZXIgZGl2XG4gIGZ1bmN0aW9uIGVuc3VyZUxpbmVXcmFwcGVkKGxpbmVWaWV3KSB7XG4gICAgaWYgKGxpbmVWaWV3Lm5vZGUgPT0gbGluZVZpZXcudGV4dCkge1xuICAgICAgbGluZVZpZXcubm9kZSA9IGVsdChcImRpdlwiLCBudWxsLCBudWxsLCBcInBvc2l0aW9uOiByZWxhdGl2ZVwiKTtcbiAgICAgIGlmIChsaW5lVmlldy50ZXh0LnBhcmVudE5vZGUpXG4gICAgICAgIGxpbmVWaWV3LnRleHQucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQobGluZVZpZXcubm9kZSwgbGluZVZpZXcudGV4dCk7XG4gICAgICBsaW5lVmlldy5ub2RlLmFwcGVuZENoaWxkKGxpbmVWaWV3LnRleHQpO1xuICAgICAgaWYgKGllX3VwdG83KSBsaW5lVmlldy5ub2RlLnN0eWxlLnpJbmRleCA9IDI7XG4gICAgfVxuICAgIHJldHVybiBsaW5lVmlldy5ub2RlO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlTGluZUJhY2tncm91bmQobGluZVZpZXcpIHtcbiAgICB2YXIgY2xzID0gbGluZVZpZXcuYmdDbGFzcyA/IGxpbmVWaWV3LmJnQ2xhc3MgKyBcIiBcIiArIChsaW5lVmlldy5saW5lLmJnQ2xhc3MgfHwgXCJcIikgOiBsaW5lVmlldy5saW5lLmJnQ2xhc3M7XG4gICAgaWYgKGNscykgY2xzICs9IFwiIENvZGVNaXJyb3ItbGluZWJhY2tncm91bmRcIjtcbiAgICBpZiAobGluZVZpZXcuYmFja2dyb3VuZCkge1xuICAgICAgaWYgKGNscykgbGluZVZpZXcuYmFja2dyb3VuZC5jbGFzc05hbWUgPSBjbHM7XG4gICAgICBlbHNlIHsgbGluZVZpZXcuYmFja2dyb3VuZC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGxpbmVWaWV3LmJhY2tncm91bmQpOyBsaW5lVmlldy5iYWNrZ3JvdW5kID0gbnVsbDsgfVxuICAgIH0gZWxzZSBpZiAoY2xzKSB7XG4gICAgICB2YXIgd3JhcCA9IGVuc3VyZUxpbmVXcmFwcGVkKGxpbmVWaWV3KTtcbiAgICAgIGxpbmVWaWV3LmJhY2tncm91bmQgPSB3cmFwLmluc2VydEJlZm9yZShlbHQoXCJkaXZcIiwgbnVsbCwgY2xzKSwgd3JhcC5maXJzdENoaWxkKTtcbiAgICB9XG4gIH1cblxuICAvLyBXcmFwcGVyIGFyb3VuZCBidWlsZExpbmVDb250ZW50IHdoaWNoIHdpbGwgcmV1c2UgdGhlIHN0cnVjdHVyZVxuICAvLyBpbiBkaXNwbGF5LmV4dGVybmFsTWVhc3VyZWQgd2hlbiBwb3NzaWJsZS5cbiAgZnVuY3Rpb24gZ2V0TGluZUNvbnRlbnQoY20sIGxpbmVWaWV3KSB7XG4gICAgdmFyIGV4dCA9IGNtLmRpc3BsYXkuZXh0ZXJuYWxNZWFzdXJlZDtcbiAgICBpZiAoZXh0ICYmIGV4dC5saW5lID09IGxpbmVWaWV3LmxpbmUpIHtcbiAgICAgIGNtLmRpc3BsYXkuZXh0ZXJuYWxNZWFzdXJlZCA9IG51bGw7XG4gICAgICBsaW5lVmlldy5tZWFzdXJlID0gZXh0Lm1lYXN1cmU7XG4gICAgICByZXR1cm4gZXh0LmJ1aWx0O1xuICAgIH1cbiAgICByZXR1cm4gYnVpbGRMaW5lQ29udGVudChjbSwgbGluZVZpZXcpO1xuICB9XG5cbiAgLy8gUmVkcmF3IHRoZSBsaW5lJ3MgdGV4dC4gSW50ZXJhY3RzIHdpdGggdGhlIGJhY2tncm91bmQgYW5kIHRleHRcbiAgLy8gY2xhc3NlcyBiZWNhdXNlIHRoZSBtb2RlIG1heSBvdXRwdXQgdG9rZW5zIHRoYXQgaW5mbHVlbmNlIHRoZXNlXG4gIC8vIGNsYXNzZXMuXG4gIGZ1bmN0aW9uIHVwZGF0ZUxpbmVUZXh0KGNtLCBsaW5lVmlldykge1xuICAgIHZhciBjbHMgPSBsaW5lVmlldy50ZXh0LmNsYXNzTmFtZTtcbiAgICB2YXIgYnVpbHQgPSBnZXRMaW5lQ29udGVudChjbSwgbGluZVZpZXcpO1xuICAgIGlmIChsaW5lVmlldy50ZXh0ID09IGxpbmVWaWV3Lm5vZGUpIGxpbmVWaWV3Lm5vZGUgPSBidWlsdC5wcmU7XG4gICAgbGluZVZpZXcudGV4dC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChidWlsdC5wcmUsIGxpbmVWaWV3LnRleHQpO1xuICAgIGxpbmVWaWV3LnRleHQgPSBidWlsdC5wcmU7XG4gICAgaWYgKGJ1aWx0LmJnQ2xhc3MgIT0gbGluZVZpZXcuYmdDbGFzcyB8fCBidWlsdC50ZXh0Q2xhc3MgIT0gbGluZVZpZXcudGV4dENsYXNzKSB7XG4gICAgICBsaW5lVmlldy5iZ0NsYXNzID0gYnVpbHQuYmdDbGFzcztcbiAgICAgIGxpbmVWaWV3LnRleHRDbGFzcyA9IGJ1aWx0LnRleHRDbGFzcztcbiAgICAgIHVwZGF0ZUxpbmVDbGFzc2VzKGxpbmVWaWV3KTtcbiAgICB9IGVsc2UgaWYgKGNscykge1xuICAgICAgbGluZVZpZXcudGV4dC5jbGFzc05hbWUgPSBjbHM7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlTGluZUNsYXNzZXMobGluZVZpZXcpIHtcbiAgICB1cGRhdGVMaW5lQmFja2dyb3VuZChsaW5lVmlldyk7XG4gICAgaWYgKGxpbmVWaWV3LmxpbmUud3JhcENsYXNzKVxuICAgICAgZW5zdXJlTGluZVdyYXBwZWQobGluZVZpZXcpLmNsYXNzTmFtZSA9IGxpbmVWaWV3LmxpbmUud3JhcENsYXNzO1xuICAgIGVsc2UgaWYgKGxpbmVWaWV3Lm5vZGUgIT0gbGluZVZpZXcudGV4dClcbiAgICAgIGxpbmVWaWV3Lm5vZGUuY2xhc3NOYW1lID0gXCJcIjtcbiAgICB2YXIgdGV4dENsYXNzID0gbGluZVZpZXcudGV4dENsYXNzID8gbGluZVZpZXcudGV4dENsYXNzICsgXCIgXCIgKyAobGluZVZpZXcubGluZS50ZXh0Q2xhc3MgfHwgXCJcIikgOiBsaW5lVmlldy5saW5lLnRleHRDbGFzcztcbiAgICBsaW5lVmlldy50ZXh0LmNsYXNzTmFtZSA9IHRleHRDbGFzcyB8fCBcIlwiO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlTGluZUd1dHRlcihjbSwgbGluZVZpZXcsIGxpbmVOLCBkaW1zKSB7XG4gICAgaWYgKGxpbmVWaWV3Lmd1dHRlcikge1xuICAgICAgbGluZVZpZXcubm9kZS5yZW1vdmVDaGlsZChsaW5lVmlldy5ndXR0ZXIpO1xuICAgICAgbGluZVZpZXcuZ3V0dGVyID0gbnVsbDtcbiAgICB9XG4gICAgdmFyIG1hcmtlcnMgPSBsaW5lVmlldy5saW5lLmd1dHRlck1hcmtlcnM7XG4gICAgaWYgKGNtLm9wdGlvbnMubGluZU51bWJlcnMgfHwgbWFya2Vycykge1xuICAgICAgdmFyIHdyYXAgPSBlbnN1cmVMaW5lV3JhcHBlZChsaW5lVmlldyk7XG4gICAgICB2YXIgZ3V0dGVyV3JhcCA9IGxpbmVWaWV3Lmd1dHRlciA9XG4gICAgICAgIHdyYXAuaW5zZXJ0QmVmb3JlKGVsdChcImRpdlwiLCBudWxsLCBcIkNvZGVNaXJyb3ItZ3V0dGVyLXdyYXBwZXJcIiwgXCJwb3NpdGlvbjogYWJzb2x1dGU7IGxlZnQ6IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjbS5vcHRpb25zLmZpeGVkR3V0dGVyID8gZGltcy5maXhlZFBvcyA6IC1kaW1zLmd1dHRlclRvdGFsV2lkdGgpICsgXCJweFwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZVZpZXcudGV4dCk7XG4gICAgICBpZiAoY20ub3B0aW9ucy5saW5lTnVtYmVycyAmJiAoIW1hcmtlcnMgfHwgIW1hcmtlcnNbXCJDb2RlTWlycm9yLWxpbmVudW1iZXJzXCJdKSlcbiAgICAgICAgbGluZVZpZXcubGluZU51bWJlciA9IGd1dHRlcldyYXAuYXBwZW5kQ2hpbGQoXG4gICAgICAgICAgZWx0KFwiZGl2XCIsIGxpbmVOdW1iZXJGb3IoY20ub3B0aW9ucywgbGluZU4pLFxuICAgICAgICAgICAgICBcIkNvZGVNaXJyb3ItbGluZW51bWJlciBDb2RlTWlycm9yLWd1dHRlci1lbHRcIixcbiAgICAgICAgICAgICAgXCJsZWZ0OiBcIiArIGRpbXMuZ3V0dGVyTGVmdFtcIkNvZGVNaXJyb3ItbGluZW51bWJlcnNcIl0gKyBcInB4OyB3aWR0aDogXCJcbiAgICAgICAgICAgICAgKyBjbS5kaXNwbGF5LmxpbmVOdW1Jbm5lcldpZHRoICsgXCJweFwiKSk7XG4gICAgICBpZiAobWFya2VycykgZm9yICh2YXIgayA9IDA7IGsgPCBjbS5vcHRpb25zLmd1dHRlcnMubGVuZ3RoOyArK2spIHtcbiAgICAgICAgdmFyIGlkID0gY20ub3B0aW9ucy5ndXR0ZXJzW2tdLCBmb3VuZCA9IG1hcmtlcnMuaGFzT3duUHJvcGVydHkoaWQpICYmIG1hcmtlcnNbaWRdO1xuICAgICAgICBpZiAoZm91bmQpXG4gICAgICAgICAgZ3V0dGVyV3JhcC5hcHBlbmRDaGlsZChlbHQoXCJkaXZcIiwgW2ZvdW5kXSwgXCJDb2RlTWlycm9yLWd1dHRlci1lbHRcIiwgXCJsZWZ0OiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGltcy5ndXR0ZXJMZWZ0W2lkXSArIFwicHg7IHdpZHRoOiBcIiArIGRpbXMuZ3V0dGVyV2lkdGhbaWRdICsgXCJweFwiKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlTGluZVdpZGdldHMobGluZVZpZXcsIGRpbXMpIHtcbiAgICBpZiAobGluZVZpZXcuYWxpZ25hYmxlKSBsaW5lVmlldy5hbGlnbmFibGUgPSBudWxsO1xuICAgIGZvciAodmFyIG5vZGUgPSBsaW5lVmlldy5ub2RlLmZpcnN0Q2hpbGQsIG5leHQ7IG5vZGU7IG5vZGUgPSBuZXh0KSB7XG4gICAgICB2YXIgbmV4dCA9IG5vZGUubmV4dFNpYmxpbmc7XG4gICAgICBpZiAobm9kZS5jbGFzc05hbWUgPT0gXCJDb2RlTWlycm9yLWxpbmV3aWRnZXRcIilcbiAgICAgICAgbGluZVZpZXcubm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICB9XG4gICAgaW5zZXJ0TGluZVdpZGdldHMobGluZVZpZXcsIGRpbXMpO1xuICB9XG5cbiAgLy8gQnVpbGQgYSBsaW5lJ3MgRE9NIHJlcHJlc2VudGF0aW9uIGZyb20gc2NyYXRjaFxuICBmdW5jdGlvbiBidWlsZExpbmVFbGVtZW50KGNtLCBsaW5lVmlldywgbGluZU4sIGRpbXMpIHtcbiAgICB2YXIgYnVpbHQgPSBnZXRMaW5lQ29udGVudChjbSwgbGluZVZpZXcpO1xuICAgIGxpbmVWaWV3LnRleHQgPSBsaW5lVmlldy5ub2RlID0gYnVpbHQucHJlO1xuICAgIGlmIChidWlsdC5iZ0NsYXNzKSBsaW5lVmlldy5iZ0NsYXNzID0gYnVpbHQuYmdDbGFzcztcbiAgICBpZiAoYnVpbHQudGV4dENsYXNzKSBsaW5lVmlldy50ZXh0Q2xhc3MgPSBidWlsdC50ZXh0Q2xhc3M7XG5cbiAgICB1cGRhdGVMaW5lQ2xhc3NlcyhsaW5lVmlldyk7XG4gICAgdXBkYXRlTGluZUd1dHRlcihjbSwgbGluZVZpZXcsIGxpbmVOLCBkaW1zKTtcbiAgICBpbnNlcnRMaW5lV2lkZ2V0cyhsaW5lVmlldywgZGltcyk7XG4gICAgcmV0dXJuIGxpbmVWaWV3Lm5vZGU7XG4gIH1cblxuICAvLyBBIGxpbmVWaWV3IG1heSBjb250YWluIG11bHRpcGxlIGxvZ2ljYWwgbGluZXMgKHdoZW4gbWVyZ2VkIGJ5XG4gIC8vIGNvbGxhcHNlZCBzcGFucykuIFRoZSB3aWRnZXRzIGZvciBhbGwgb2YgdGhlbSBuZWVkIHRvIGJlIGRyYXduLlxuICBmdW5jdGlvbiBpbnNlcnRMaW5lV2lkZ2V0cyhsaW5lVmlldywgZGltcykge1xuICAgIGluc2VydExpbmVXaWRnZXRzRm9yKGxpbmVWaWV3LmxpbmUsIGxpbmVWaWV3LCBkaW1zLCB0cnVlKTtcbiAgICBpZiAobGluZVZpZXcucmVzdCkgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lVmlldy5yZXN0Lmxlbmd0aDsgaSsrKVxuICAgICAgaW5zZXJ0TGluZVdpZGdldHNGb3IobGluZVZpZXcucmVzdFtpXSwgbGluZVZpZXcsIGRpbXMsIGZhbHNlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluc2VydExpbmVXaWRnZXRzRm9yKGxpbmUsIGxpbmVWaWV3LCBkaW1zLCBhbGxvd0Fib3ZlKSB7XG4gICAgaWYgKCFsaW5lLndpZGdldHMpIHJldHVybjtcbiAgICB2YXIgd3JhcCA9IGVuc3VyZUxpbmVXcmFwcGVkKGxpbmVWaWV3KTtcbiAgICBmb3IgKHZhciBpID0gMCwgd3MgPSBsaW5lLndpZGdldHM7IGkgPCB3cy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHdpZGdldCA9IHdzW2ldLCBub2RlID0gZWx0KFwiZGl2XCIsIFt3aWRnZXQubm9kZV0sIFwiQ29kZU1pcnJvci1saW5ld2lkZ2V0XCIpO1xuICAgICAgaWYgKCF3aWRnZXQuaGFuZGxlTW91c2VFdmVudHMpIG5vZGUuaWdub3JlRXZlbnRzID0gdHJ1ZTtcbiAgICAgIHBvc2l0aW9uTGluZVdpZGdldCh3aWRnZXQsIG5vZGUsIGxpbmVWaWV3LCBkaW1zKTtcbiAgICAgIGlmIChhbGxvd0Fib3ZlICYmIHdpZGdldC5hYm92ZSlcbiAgICAgICAgd3JhcC5pbnNlcnRCZWZvcmUobm9kZSwgbGluZVZpZXcuZ3V0dGVyIHx8IGxpbmVWaWV3LnRleHQpO1xuICAgICAgZWxzZVxuICAgICAgICB3cmFwLmFwcGVuZENoaWxkKG5vZGUpO1xuICAgICAgc2lnbmFsTGF0ZXIod2lkZ2V0LCBcInJlZHJhd1wiKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwb3NpdGlvbkxpbmVXaWRnZXQod2lkZ2V0LCBub2RlLCBsaW5lVmlldywgZGltcykge1xuICAgIGlmICh3aWRnZXQubm9IU2Nyb2xsKSB7XG4gICAgICAobGluZVZpZXcuYWxpZ25hYmxlIHx8IChsaW5lVmlldy5hbGlnbmFibGUgPSBbXSkpLnB1c2gobm9kZSk7XG4gICAgICB2YXIgd2lkdGggPSBkaW1zLndyYXBwZXJXaWR0aDtcbiAgICAgIG5vZGUuc3R5bGUubGVmdCA9IGRpbXMuZml4ZWRQb3MgKyBcInB4XCI7XG4gICAgICBpZiAoIXdpZGdldC5jb3Zlckd1dHRlcikge1xuICAgICAgICB3aWR0aCAtPSBkaW1zLmd1dHRlclRvdGFsV2lkdGg7XG4gICAgICAgIG5vZGUuc3R5bGUucGFkZGluZ0xlZnQgPSBkaW1zLmd1dHRlclRvdGFsV2lkdGggKyBcInB4XCI7XG4gICAgICB9XG4gICAgICBub2RlLnN0eWxlLndpZHRoID0gd2lkdGggKyBcInB4XCI7XG4gICAgfVxuICAgIGlmICh3aWRnZXQuY292ZXJHdXR0ZXIpIHtcbiAgICAgIG5vZGUuc3R5bGUuekluZGV4ID0gNTtcbiAgICAgIG5vZGUuc3R5bGUucG9zaXRpb24gPSBcInJlbGF0aXZlXCI7XG4gICAgICBpZiAoIXdpZGdldC5ub0hTY3JvbGwpIG5vZGUuc3R5bGUubWFyZ2luTGVmdCA9IC1kaW1zLmd1dHRlclRvdGFsV2lkdGggKyBcInB4XCI7XG4gICAgfVxuICB9XG5cbiAgLy8gUE9TSVRJT04gT0JKRUNUXG5cbiAgLy8gQSBQb3MgaW5zdGFuY2UgcmVwcmVzZW50cyBhIHBvc2l0aW9uIHdpdGhpbiB0aGUgdGV4dC5cbiAgdmFyIFBvcyA9IENvZGVNaXJyb3IuUG9zID0gZnVuY3Rpb24obGluZSwgY2gpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgUG9zKSkgcmV0dXJuIG5ldyBQb3MobGluZSwgY2gpO1xuICAgIHRoaXMubGluZSA9IGxpbmU7IHRoaXMuY2ggPSBjaDtcbiAgfTtcblxuICAvLyBDb21wYXJlIHR3byBwb3NpdGlvbnMsIHJldHVybiAwIGlmIHRoZXkgYXJlIHRoZSBzYW1lLCBhIG5lZ2F0aXZlXG4gIC8vIG51bWJlciB3aGVuIGEgaXMgbGVzcywgYW5kIGEgcG9zaXRpdmUgbnVtYmVyIG90aGVyd2lzZS5cbiAgdmFyIGNtcCA9IENvZGVNaXJyb3IuY21wUG9zID0gZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gYS5saW5lIC0gYi5saW5lIHx8IGEuY2ggLSBiLmNoOyB9O1xuXG4gIGZ1bmN0aW9uIGNvcHlQb3MoeCkge3JldHVybiBQb3MoeC5saW5lLCB4LmNoKTt9XG4gIGZ1bmN0aW9uIG1heFBvcyhhLCBiKSB7IHJldHVybiBjbXAoYSwgYikgPCAwID8gYiA6IGE7IH1cbiAgZnVuY3Rpb24gbWluUG9zKGEsIGIpIHsgcmV0dXJuIGNtcChhLCBiKSA8IDAgPyBhIDogYjsgfVxuXG4gIC8vIFNFTEVDVElPTiAvIENVUlNPUlxuXG4gIC8vIFNlbGVjdGlvbiBvYmplY3RzIGFyZSBpbW11dGFibGUuIEEgbmV3IG9uZSBpcyBjcmVhdGVkIGV2ZXJ5IHRpbWVcbiAgLy8gdGhlIHNlbGVjdGlvbiBjaGFuZ2VzLiBBIHNlbGVjdGlvbiBpcyBvbmUgb3IgbW9yZSBub24tb3ZlcmxhcHBpbmdcbiAgLy8gKGFuZCBub24tdG91Y2hpbmcpIHJhbmdlcywgc29ydGVkLCBhbmQgYW4gaW50ZWdlciB0aGF0IGluZGljYXRlc1xuICAvLyB3aGljaCBvbmUgaXMgdGhlIHByaW1hcnkgc2VsZWN0aW9uICh0aGUgb25lIHRoYXQncyBzY3JvbGxlZCBpbnRvXG4gIC8vIHZpZXcsIHRoYXQgZ2V0Q3Vyc29yIHJldHVybnMsIGV0YykuXG4gIGZ1bmN0aW9uIFNlbGVjdGlvbihyYW5nZXMsIHByaW1JbmRleCkge1xuICAgIHRoaXMucmFuZ2VzID0gcmFuZ2VzO1xuICAgIHRoaXMucHJpbUluZGV4ID0gcHJpbUluZGV4O1xuICB9XG5cbiAgU2VsZWN0aW9uLnByb3RvdHlwZSA9IHtcbiAgICBwcmltYXJ5OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMucmFuZ2VzW3RoaXMucHJpbUluZGV4XTsgfSxcbiAgICBlcXVhbHM6IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICBpZiAob3RoZXIgPT0gdGhpcykgcmV0dXJuIHRydWU7XG4gICAgICBpZiAob3RoZXIucHJpbUluZGV4ICE9IHRoaXMucHJpbUluZGV4IHx8IG90aGVyLnJhbmdlcy5sZW5ndGggIT0gdGhpcy5yYW5nZXMubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBoZXJlID0gdGhpcy5yYW5nZXNbaV0sIHRoZXJlID0gb3RoZXIucmFuZ2VzW2ldO1xuICAgICAgICBpZiAoY21wKGhlcmUuYW5jaG9yLCB0aGVyZS5hbmNob3IpICE9IDAgfHwgY21wKGhlcmUuaGVhZCwgdGhlcmUuaGVhZCkgIT0gMCkgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBkZWVwQ29weTogZnVuY3Rpb24oKSB7XG4gICAgICBmb3IgKHZhciBvdXQgPSBbXSwgaSA9IDA7IGkgPCB0aGlzLnJhbmdlcy5sZW5ndGg7IGkrKylcbiAgICAgICAgb3V0W2ldID0gbmV3IFJhbmdlKGNvcHlQb3ModGhpcy5yYW5nZXNbaV0uYW5jaG9yKSwgY29weVBvcyh0aGlzLnJhbmdlc1tpXS5oZWFkKSk7XG4gICAgICByZXR1cm4gbmV3IFNlbGVjdGlvbihvdXQsIHRoaXMucHJpbUluZGV4KTtcbiAgICB9LFxuICAgIHNvbWV0aGluZ1NlbGVjdGVkOiBmdW5jdGlvbigpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5yYW5nZXMubGVuZ3RoOyBpKyspXG4gICAgICAgIGlmICghdGhpcy5yYW5nZXNbaV0uZW1wdHkoKSkgcmV0dXJuIHRydWU7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcbiAgICBjb250YWluczogZnVuY3Rpb24ocG9zLCBlbmQpIHtcbiAgICAgIGlmICghZW5kKSBlbmQgPSBwb3M7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciByYW5nZSA9IHRoaXMucmFuZ2VzW2ldO1xuICAgICAgICBpZiAoY21wKGVuZCwgcmFuZ2UuZnJvbSgpKSA+PSAwICYmIGNtcChwb3MsIHJhbmdlLnRvKCkpIDw9IDApXG4gICAgICAgICAgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIFJhbmdlKGFuY2hvciwgaGVhZCkge1xuICAgIHRoaXMuYW5jaG9yID0gYW5jaG9yOyB0aGlzLmhlYWQgPSBoZWFkO1xuICB9XG5cbiAgUmFuZ2UucHJvdG90eXBlID0ge1xuICAgIGZyb206IGZ1bmN0aW9uKCkgeyByZXR1cm4gbWluUG9zKHRoaXMuYW5jaG9yLCB0aGlzLmhlYWQpOyB9LFxuICAgIHRvOiBmdW5jdGlvbigpIHsgcmV0dXJuIG1heFBvcyh0aGlzLmFuY2hvciwgdGhpcy5oZWFkKTsgfSxcbiAgICBlbXB0eTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5oZWFkLmxpbmUgPT0gdGhpcy5hbmNob3IubGluZSAmJiB0aGlzLmhlYWQuY2ggPT0gdGhpcy5hbmNob3IuY2g7XG4gICAgfVxuICB9O1xuXG4gIC8vIFRha2UgYW4gdW5zb3J0ZWQsIHBvdGVudGlhbGx5IG92ZXJsYXBwaW5nIHNldCBvZiByYW5nZXMsIGFuZFxuICAvLyBidWlsZCBhIHNlbGVjdGlvbiBvdXQgb2YgaXQuICdDb25zdW1lcycgcmFuZ2VzIGFycmF5IChtb2RpZnlpbmdcbiAgLy8gaXQpLlxuICBmdW5jdGlvbiBub3JtYWxpemVTZWxlY3Rpb24ocmFuZ2VzLCBwcmltSW5kZXgpIHtcbiAgICB2YXIgcHJpbSA9IHJhbmdlc1twcmltSW5kZXhdO1xuICAgIHJhbmdlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHsgcmV0dXJuIGNtcChhLmZyb20oKSwgYi5mcm9tKCkpOyB9KTtcbiAgICBwcmltSW5kZXggPSBpbmRleE9mKHJhbmdlcywgcHJpbSk7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCByYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBjdXIgPSByYW5nZXNbaV0sIHByZXYgPSByYW5nZXNbaSAtIDFdO1xuICAgICAgaWYgKGNtcChwcmV2LnRvKCksIGN1ci5mcm9tKCkpID49IDApIHtcbiAgICAgICAgdmFyIGZyb20gPSBtaW5Qb3MocHJldi5mcm9tKCksIGN1ci5mcm9tKCkpLCB0byA9IG1heFBvcyhwcmV2LnRvKCksIGN1ci50bygpKTtcbiAgICAgICAgdmFyIGludiA9IHByZXYuZW1wdHkoKSA/IGN1ci5mcm9tKCkgPT0gY3VyLmhlYWQgOiBwcmV2LmZyb20oKSA9PSBwcmV2LmhlYWQ7XG4gICAgICAgIGlmIChpIDw9IHByaW1JbmRleCkgLS1wcmltSW5kZXg7XG4gICAgICAgIHJhbmdlcy5zcGxpY2UoLS1pLCAyLCBuZXcgUmFuZ2UoaW52ID8gdG8gOiBmcm9tLCBpbnYgPyBmcm9tIDogdG8pKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBTZWxlY3Rpb24ocmFuZ2VzLCBwcmltSW5kZXgpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2ltcGxlU2VsZWN0aW9uKGFuY2hvciwgaGVhZCkge1xuICAgIHJldHVybiBuZXcgU2VsZWN0aW9uKFtuZXcgUmFuZ2UoYW5jaG9yLCBoZWFkIHx8IGFuY2hvcildLCAwKTtcbiAgfVxuXG4gIC8vIE1vc3Qgb2YgdGhlIGV4dGVybmFsIEFQSSBjbGlwcyBnaXZlbiBwb3NpdGlvbnMgdG8gbWFrZSBzdXJlIHRoZXlcbiAgLy8gYWN0dWFsbHkgZXhpc3Qgd2l0aGluIHRoZSBkb2N1bWVudC5cbiAgZnVuY3Rpb24gY2xpcExpbmUoZG9jLCBuKSB7cmV0dXJuIE1hdGgubWF4KGRvYy5maXJzdCwgTWF0aC5taW4obiwgZG9jLmZpcnN0ICsgZG9jLnNpemUgLSAxKSk7fVxuICBmdW5jdGlvbiBjbGlwUG9zKGRvYywgcG9zKSB7XG4gICAgaWYgKHBvcy5saW5lIDwgZG9jLmZpcnN0KSByZXR1cm4gUG9zKGRvYy5maXJzdCwgMCk7XG4gICAgdmFyIGxhc3QgPSBkb2MuZmlyc3QgKyBkb2Muc2l6ZSAtIDE7XG4gICAgaWYgKHBvcy5saW5lID4gbGFzdCkgcmV0dXJuIFBvcyhsYXN0LCBnZXRMaW5lKGRvYywgbGFzdCkudGV4dC5sZW5ndGgpO1xuICAgIHJldHVybiBjbGlwVG9MZW4ocG9zLCBnZXRMaW5lKGRvYywgcG9zLmxpbmUpLnRleHQubGVuZ3RoKTtcbiAgfVxuICBmdW5jdGlvbiBjbGlwVG9MZW4ocG9zLCBsaW5lbGVuKSB7XG4gICAgdmFyIGNoID0gcG9zLmNoO1xuICAgIGlmIChjaCA9PSBudWxsIHx8IGNoID4gbGluZWxlbikgcmV0dXJuIFBvcyhwb3MubGluZSwgbGluZWxlbik7XG4gICAgZWxzZSBpZiAoY2ggPCAwKSByZXR1cm4gUG9zKHBvcy5saW5lLCAwKTtcbiAgICBlbHNlIHJldHVybiBwb3M7XG4gIH1cbiAgZnVuY3Rpb24gaXNMaW5lKGRvYywgbCkge3JldHVybiBsID49IGRvYy5maXJzdCAmJiBsIDwgZG9jLmZpcnN0ICsgZG9jLnNpemU7fVxuICBmdW5jdGlvbiBjbGlwUG9zQXJyYXkoZG9jLCBhcnJheSkge1xuICAgIGZvciAodmFyIG91dCA9IFtdLCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSBvdXRbaV0gPSBjbGlwUG9zKGRvYywgYXJyYXlbaV0pO1xuICAgIHJldHVybiBvdXQ7XG4gIH1cblxuICAvLyBTRUxFQ1RJT04gVVBEQVRFU1xuXG4gIC8vIFRoZSAnc2Nyb2xsJyBwYXJhbWV0ZXIgZ2l2ZW4gdG8gbWFueSBvZiB0aGVzZSBpbmRpY2F0ZWQgd2hldGhlclxuICAvLyB0aGUgbmV3IGN1cnNvciBwb3NpdGlvbiBzaG91bGQgYmUgc2Nyb2xsZWQgaW50byB2aWV3IGFmdGVyXG4gIC8vIG1vZGlmeWluZyB0aGUgc2VsZWN0aW9uLlxuXG4gIC8vIElmIHNoaWZ0IGlzIGhlbGQgb3IgdGhlIGV4dGVuZCBmbGFnIGlzIHNldCwgZXh0ZW5kcyBhIHJhbmdlIHRvXG4gIC8vIGluY2x1ZGUgYSBnaXZlbiBwb3NpdGlvbiAoYW5kIG9wdGlvbmFsbHkgYSBzZWNvbmQgcG9zaXRpb24pLlxuICAvLyBPdGhlcndpc2UsIHNpbXBseSByZXR1cm5zIHRoZSByYW5nZSBiZXR3ZWVuIHRoZSBnaXZlbiBwb3NpdGlvbnMuXG4gIC8vIFVzZWQgZm9yIGN1cnNvciBtb3Rpb24gYW5kIHN1Y2guXG4gIGZ1bmN0aW9uIGV4dGVuZFJhbmdlKGRvYywgcmFuZ2UsIGhlYWQsIG90aGVyKSB7XG4gICAgaWYgKGRvYy5jbSAmJiBkb2MuY20uZGlzcGxheS5zaGlmdCB8fCBkb2MuZXh0ZW5kKSB7XG4gICAgICB2YXIgYW5jaG9yID0gcmFuZ2UuYW5jaG9yO1xuICAgICAgaWYgKG90aGVyKSB7XG4gICAgICAgIHZhciBwb3NCZWZvcmUgPSBjbXAoaGVhZCwgYW5jaG9yKSA8IDA7XG4gICAgICAgIGlmIChwb3NCZWZvcmUgIT0gKGNtcChvdGhlciwgYW5jaG9yKSA8IDApKSB7XG4gICAgICAgICAgYW5jaG9yID0gaGVhZDtcbiAgICAgICAgICBoZWFkID0gb3RoZXI7XG4gICAgICAgIH0gZWxzZSBpZiAocG9zQmVmb3JlICE9IChjbXAoaGVhZCwgb3RoZXIpIDwgMCkpIHtcbiAgICAgICAgICBoZWFkID0gb3RoZXI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgUmFuZ2UoYW5jaG9yLCBoZWFkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBSYW5nZShvdGhlciB8fCBoZWFkLCBoZWFkKTtcbiAgICB9XG4gIH1cblxuICAvLyBFeHRlbmQgdGhlIHByaW1hcnkgc2VsZWN0aW9uIHJhbmdlLCBkaXNjYXJkIHRoZSByZXN0LlxuICBmdW5jdGlvbiBleHRlbmRTZWxlY3Rpb24oZG9jLCBoZWFkLCBvdGhlciwgb3B0aW9ucykge1xuICAgIHNldFNlbGVjdGlvbihkb2MsIG5ldyBTZWxlY3Rpb24oW2V4dGVuZFJhbmdlKGRvYywgZG9jLnNlbC5wcmltYXJ5KCksIGhlYWQsIG90aGVyKV0sIDApLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8vIEV4dGVuZCBhbGwgc2VsZWN0aW9ucyAocG9zIGlzIGFuIGFycmF5IG9mIHNlbGVjdGlvbnMgd2l0aCBsZW5ndGhcbiAgLy8gZXF1YWwgdGhlIG51bWJlciBvZiBzZWxlY3Rpb25zKVxuICBmdW5jdGlvbiBleHRlbmRTZWxlY3Rpb25zKGRvYywgaGVhZHMsIG9wdGlvbnMpIHtcbiAgICBmb3IgKHZhciBvdXQgPSBbXSwgaSA9IDA7IGkgPCBkb2Muc2VsLnJhbmdlcy5sZW5ndGg7IGkrKylcbiAgICAgIG91dFtpXSA9IGV4dGVuZFJhbmdlKGRvYywgZG9jLnNlbC5yYW5nZXNbaV0sIGhlYWRzW2ldLCBudWxsKTtcbiAgICB2YXIgbmV3U2VsID0gbm9ybWFsaXplU2VsZWN0aW9uKG91dCwgZG9jLnNlbC5wcmltSW5kZXgpO1xuICAgIHNldFNlbGVjdGlvbihkb2MsIG5ld1NlbCwgb3B0aW9ucyk7XG4gIH1cblxuICAvLyBVcGRhdGVzIGEgc2luZ2xlIHJhbmdlIGluIHRoZSBzZWxlY3Rpb24uXG4gIGZ1bmN0aW9uIHJlcGxhY2VPbmVTZWxlY3Rpb24oZG9jLCBpLCByYW5nZSwgb3B0aW9ucykge1xuICAgIHZhciByYW5nZXMgPSBkb2Muc2VsLnJhbmdlcy5zbGljZSgwKTtcbiAgICByYW5nZXNbaV0gPSByYW5nZTtcbiAgICBzZXRTZWxlY3Rpb24oZG9jLCBub3JtYWxpemVTZWxlY3Rpb24ocmFuZ2VzLCBkb2Muc2VsLnByaW1JbmRleCksIG9wdGlvbnMpO1xuICB9XG5cbiAgLy8gUmVzZXQgdGhlIHNlbGVjdGlvbiB0byBhIHNpbmdsZSByYW5nZS5cbiAgZnVuY3Rpb24gc2V0U2ltcGxlU2VsZWN0aW9uKGRvYywgYW5jaG9yLCBoZWFkLCBvcHRpb25zKSB7XG4gICAgc2V0U2VsZWN0aW9uKGRvYywgc2ltcGxlU2VsZWN0aW9uKGFuY2hvciwgaGVhZCksIG9wdGlvbnMpO1xuICB9XG5cbiAgLy8gR2l2ZSBiZWZvcmVTZWxlY3Rpb25DaGFuZ2UgaGFuZGxlcnMgYSBjaGFuZ2UgdG8gaW5mbHVlbmNlIGFcbiAgLy8gc2VsZWN0aW9uIHVwZGF0ZS5cbiAgZnVuY3Rpb24gZmlsdGVyU2VsZWN0aW9uQ2hhbmdlKGRvYywgc2VsKSB7XG4gICAgdmFyIG9iaiA9IHtcbiAgICAgIHJhbmdlczogc2VsLnJhbmdlcyxcbiAgICAgIHVwZGF0ZTogZnVuY3Rpb24ocmFuZ2VzKSB7XG4gICAgICAgIHRoaXMucmFuZ2VzID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFuZ2VzLmxlbmd0aDsgaSsrKVxuICAgICAgICAgIHRoaXMucmFuZ2VzW2ldID0gbmV3IFJhbmdlKGNsaXBQb3MoZG9jLCByYW5nZXNbaV0uYW5jaG9yKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGlwUG9zKGRvYywgcmFuZ2VzW2ldLmhlYWQpKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHNpZ25hbChkb2MsIFwiYmVmb3JlU2VsZWN0aW9uQ2hhbmdlXCIsIGRvYywgb2JqKTtcbiAgICBpZiAoZG9jLmNtKSBzaWduYWwoZG9jLmNtLCBcImJlZm9yZVNlbGVjdGlvbkNoYW5nZVwiLCBkb2MuY20sIG9iaik7XG4gICAgaWYgKG9iai5yYW5nZXMgIT0gc2VsLnJhbmdlcykgcmV0dXJuIG5vcm1hbGl6ZVNlbGVjdGlvbihvYmoucmFuZ2VzLCBvYmoucmFuZ2VzLmxlbmd0aCAtIDEpO1xuICAgIGVsc2UgcmV0dXJuIHNlbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldFNlbGVjdGlvblJlcGxhY2VIaXN0b3J5KGRvYywgc2VsLCBvcHRpb25zKSB7XG4gICAgdmFyIGRvbmUgPSBkb2MuaGlzdG9yeS5kb25lLCBsYXN0ID0gbHN0KGRvbmUpO1xuICAgIGlmIChsYXN0ICYmIGxhc3QucmFuZ2VzKSB7XG4gICAgICBkb25lW2RvbmUubGVuZ3RoIC0gMV0gPSBzZWw7XG4gICAgICBzZXRTZWxlY3Rpb25Ob1VuZG8oZG9jLCBzZWwsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXRTZWxlY3Rpb24oZG9jLCBzZWwsIG9wdGlvbnMpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFNldCBhIG5ldyBzZWxlY3Rpb24uXG4gIGZ1bmN0aW9uIHNldFNlbGVjdGlvbihkb2MsIHNlbCwgb3B0aW9ucykge1xuICAgIHNldFNlbGVjdGlvbk5vVW5kbyhkb2MsIHNlbCwgb3B0aW9ucyk7XG4gICAgYWRkU2VsZWN0aW9uVG9IaXN0b3J5KGRvYywgZG9jLnNlbCwgZG9jLmNtID8gZG9jLmNtLmN1ck9wLmlkIDogTmFOLCBvcHRpb25zKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldFNlbGVjdGlvbk5vVW5kbyhkb2MsIHNlbCwgb3B0aW9ucykge1xuICAgIGlmIChoYXNIYW5kbGVyKGRvYywgXCJiZWZvcmVTZWxlY3Rpb25DaGFuZ2VcIikgfHwgZG9jLmNtICYmIGhhc0hhbmRsZXIoZG9jLmNtLCBcImJlZm9yZVNlbGVjdGlvbkNoYW5nZVwiKSlcbiAgICAgIHNlbCA9IGZpbHRlclNlbGVjdGlvbkNoYW5nZShkb2MsIHNlbCk7XG5cbiAgICB2YXIgYmlhcyA9IG9wdGlvbnMgJiYgb3B0aW9ucy5iaWFzIHx8XG4gICAgICAoY21wKHNlbC5wcmltYXJ5KCkuaGVhZCwgZG9jLnNlbC5wcmltYXJ5KCkuaGVhZCkgPCAwID8gLTEgOiAxKTtcbiAgICBzZXRTZWxlY3Rpb25Jbm5lcihkb2MsIHNraXBBdG9taWNJblNlbGVjdGlvbihkb2MsIHNlbCwgYmlhcywgdHJ1ZSkpO1xuXG4gICAgaWYgKCEob3B0aW9ucyAmJiBvcHRpb25zLnNjcm9sbCA9PT0gZmFsc2UpICYmIGRvYy5jbSlcbiAgICAgIGVuc3VyZUN1cnNvclZpc2libGUoZG9jLmNtKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldFNlbGVjdGlvbklubmVyKGRvYywgc2VsKSB7XG4gICAgaWYgKHNlbC5lcXVhbHMoZG9jLnNlbCkpIHJldHVybjtcblxuICAgIGRvYy5zZWwgPSBzZWw7XG5cbiAgICBpZiAoZG9jLmNtKSB7XG4gICAgICBkb2MuY20uY3VyT3AudXBkYXRlSW5wdXQgPSBkb2MuY20uY3VyT3Auc2VsZWN0aW9uQ2hhbmdlZCA9IHRydWU7XG4gICAgICBzaWduYWxDdXJzb3JBY3Rpdml0eShkb2MuY20pO1xuICAgIH1cbiAgICBzaWduYWxMYXRlcihkb2MsIFwiY3Vyc29yQWN0aXZpdHlcIiwgZG9jKTtcbiAgfVxuXG4gIC8vIFZlcmlmeSB0aGF0IHRoZSBzZWxlY3Rpb24gZG9lcyBub3QgcGFydGlhbGx5IHNlbGVjdCBhbnkgYXRvbWljXG4gIC8vIG1hcmtlZCByYW5nZXMuXG4gIGZ1bmN0aW9uIHJlQ2hlY2tTZWxlY3Rpb24oZG9jKSB7XG4gICAgc2V0U2VsZWN0aW9uSW5uZXIoZG9jLCBza2lwQXRvbWljSW5TZWxlY3Rpb24oZG9jLCBkb2Muc2VsLCBudWxsLCBmYWxzZSksIHNlbF9kb250U2Nyb2xsKTtcbiAgfVxuXG4gIC8vIFJldHVybiBhIHNlbGVjdGlvbiB0aGF0IGRvZXMgbm90IHBhcnRpYWxseSBzZWxlY3QgYW55IGF0b21pY1xuICAvLyByYW5nZXMuXG4gIGZ1bmN0aW9uIHNraXBBdG9taWNJblNlbGVjdGlvbihkb2MsIHNlbCwgYmlhcywgbWF5Q2xlYXIpIHtcbiAgICB2YXIgb3V0O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsLnJhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHJhbmdlID0gc2VsLnJhbmdlc1tpXTtcbiAgICAgIHZhciBuZXdBbmNob3IgPSBza2lwQXRvbWljKGRvYywgcmFuZ2UuYW5jaG9yLCBiaWFzLCBtYXlDbGVhcik7XG4gICAgICB2YXIgbmV3SGVhZCA9IHNraXBBdG9taWMoZG9jLCByYW5nZS5oZWFkLCBiaWFzLCBtYXlDbGVhcik7XG4gICAgICBpZiAob3V0IHx8IG5ld0FuY2hvciAhPSByYW5nZS5hbmNob3IgfHwgbmV3SGVhZCAhPSByYW5nZS5oZWFkKSB7XG4gICAgICAgIGlmICghb3V0KSBvdXQgPSBzZWwucmFuZ2VzLnNsaWNlKDAsIGkpO1xuICAgICAgICBvdXRbaV0gPSBuZXcgUmFuZ2UobmV3QW5jaG9yLCBuZXdIZWFkKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dCA/IG5vcm1hbGl6ZVNlbGVjdGlvbihvdXQsIHNlbC5wcmltSW5kZXgpIDogc2VsO1xuICB9XG5cbiAgLy8gRW5zdXJlIGEgZ2l2ZW4gcG9zaXRpb24gaXMgbm90IGluc2lkZSBhbiBhdG9taWMgcmFuZ2UuXG4gIGZ1bmN0aW9uIHNraXBBdG9taWMoZG9jLCBwb3MsIGJpYXMsIG1heUNsZWFyKSB7XG4gICAgdmFyIGZsaXBwZWQgPSBmYWxzZSwgY3VyUG9zID0gcG9zO1xuICAgIHZhciBkaXIgPSBiaWFzIHx8IDE7XG4gICAgZG9jLmNhbnRFZGl0ID0gZmFsc2U7XG4gICAgc2VhcmNoOiBmb3IgKDs7KSB7XG4gICAgICB2YXIgbGluZSA9IGdldExpbmUoZG9jLCBjdXJQb3MubGluZSk7XG4gICAgICBpZiAobGluZS5tYXJrZWRTcGFucykge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmUubWFya2VkU3BhbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICB2YXIgc3AgPSBsaW5lLm1hcmtlZFNwYW5zW2ldLCBtID0gc3AubWFya2VyO1xuICAgICAgICAgIGlmICgoc3AuZnJvbSA9PSBudWxsIHx8IChtLmluY2x1c2l2ZUxlZnQgPyBzcC5mcm9tIDw9IGN1clBvcy5jaCA6IHNwLmZyb20gPCBjdXJQb3MuY2gpKSAmJlxuICAgICAgICAgICAgICAoc3AudG8gPT0gbnVsbCB8fCAobS5pbmNsdXNpdmVSaWdodCA/IHNwLnRvID49IGN1clBvcy5jaCA6IHNwLnRvID4gY3VyUG9zLmNoKSkpIHtcbiAgICAgICAgICAgIGlmIChtYXlDbGVhcikge1xuICAgICAgICAgICAgICBzaWduYWwobSwgXCJiZWZvcmVDdXJzb3JFbnRlclwiKTtcbiAgICAgICAgICAgICAgaWYgKG0uZXhwbGljaXRseUNsZWFyZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWxpbmUubWFya2VkU3BhbnMpIGJyZWFrO1xuICAgICAgICAgICAgICAgIGVsc2Ugey0taTsgY29udGludWU7fVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIW0uYXRvbWljKSBjb250aW51ZTtcbiAgICAgICAgICAgIHZhciBuZXdQb3MgPSBtLmZpbmQoZGlyIDwgMCA/IC0xIDogMSk7XG4gICAgICAgICAgICBpZiAoY21wKG5ld1BvcywgY3VyUG9zKSA9PSAwKSB7XG4gICAgICAgICAgICAgIG5ld1Bvcy5jaCArPSBkaXI7XG4gICAgICAgICAgICAgIGlmIChuZXdQb3MuY2ggPCAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5ld1Bvcy5saW5lID4gZG9jLmZpcnN0KSBuZXdQb3MgPSBjbGlwUG9zKGRvYywgUG9zKG5ld1Bvcy5saW5lIC0gMSkpO1xuICAgICAgICAgICAgICAgIGVsc2UgbmV3UG9zID0gbnVsbDtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdQb3MuY2ggPiBsaW5lLnRleHQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5ld1Bvcy5saW5lIDwgZG9jLmZpcnN0ICsgZG9jLnNpemUgLSAxKSBuZXdQb3MgPSBQb3MobmV3UG9zLmxpbmUgKyAxLCAwKTtcbiAgICAgICAgICAgICAgICBlbHNlIG5ld1BvcyA9IG51bGw7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKCFuZXdQb3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoZmxpcHBlZCkge1xuICAgICAgICAgICAgICAgICAgLy8gRHJpdmVuIGluIGEgY29ybmVyIC0tIG5vIHZhbGlkIGN1cnNvciBwb3NpdGlvbiBmb3VuZCBhdCBhbGxcbiAgICAgICAgICAgICAgICAgIC8vIC0tIHRyeSBhZ2FpbiAqd2l0aCogY2xlYXJpbmcsIGlmIHdlIGRpZG4ndCBhbHJlYWR5XG4gICAgICAgICAgICAgICAgICBpZiAoIW1heUNsZWFyKSByZXR1cm4gc2tpcEF0b21pYyhkb2MsIHBvcywgYmlhcywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAvLyBPdGhlcndpc2UsIHR1cm4gb2ZmIGVkaXRpbmcgdW50aWwgZnVydGhlciBub3RpY2UsIGFuZCByZXR1cm4gdGhlIHN0YXJ0IG9mIHRoZSBkb2NcbiAgICAgICAgICAgICAgICAgIGRvYy5jYW50RWRpdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gUG9zKGRvYy5maXJzdCwgMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZsaXBwZWQgPSB0cnVlOyBuZXdQb3MgPSBwb3M7IGRpciA9IC1kaXI7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGN1clBvcyA9IG5ld1BvcztcbiAgICAgICAgICAgIGNvbnRpbnVlIHNlYXJjaDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBjdXJQb3M7XG4gICAgfVxuICB9XG5cbiAgLy8gU0VMRUNUSU9OIERSQVdJTkdcblxuICAvLyBSZWRyYXcgdGhlIHNlbGVjdGlvbiBhbmQvb3IgY3Vyc29yXG4gIGZ1bmN0aW9uIHVwZGF0ZVNlbGVjdGlvbihjbSkge1xuICAgIHZhciBkaXNwbGF5ID0gY20uZGlzcGxheSwgZG9jID0gY20uZG9jO1xuICAgIHZhciBjdXJGcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICB2YXIgc2VsRnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRvYy5zZWwucmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcmFuZ2UgPSBkb2Muc2VsLnJhbmdlc1tpXTtcbiAgICAgIHZhciBjb2xsYXBzZWQgPSByYW5nZS5lbXB0eSgpO1xuICAgICAgaWYgKGNvbGxhcHNlZCB8fCBjbS5vcHRpb25zLnNob3dDdXJzb3JXaGVuU2VsZWN0aW5nKVxuICAgICAgICBkcmF3U2VsZWN0aW9uQ3Vyc29yKGNtLCByYW5nZSwgY3VyRnJhZ21lbnQpO1xuICAgICAgaWYgKCFjb2xsYXBzZWQpXG4gICAgICAgIGRyYXdTZWxlY3Rpb25SYW5nZShjbSwgcmFuZ2UsIHNlbEZyYWdtZW50KTtcbiAgICB9XG5cbiAgICAvLyBNb3ZlIHRoZSBoaWRkZW4gdGV4dGFyZWEgbmVhciB0aGUgY3Vyc29yIHRvIHByZXZlbnQgc2Nyb2xsaW5nIGFydGlmYWN0c1xuICAgIGlmIChjbS5vcHRpb25zLm1vdmVJbnB1dFdpdGhDdXJzb3IpIHtcbiAgICAgIHZhciBoZWFkUG9zID0gY3Vyc29yQ29vcmRzKGNtLCBkb2Muc2VsLnByaW1hcnkoKS5oZWFkLCBcImRpdlwiKTtcbiAgICAgIHZhciB3cmFwT2ZmID0gZGlzcGxheS53cmFwcGVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLCBsaW5lT2ZmID0gZGlzcGxheS5saW5lRGl2LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgdmFyIHRvcCA9IE1hdGgubWF4KDAsIE1hdGgubWluKGRpc3BsYXkud3JhcHBlci5jbGllbnRIZWlnaHQgLSAxMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkUG9zLnRvcCArIGxpbmVPZmYudG9wIC0gd3JhcE9mZi50b3ApKTtcbiAgICAgIHZhciBsZWZ0ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oZGlzcGxheS53cmFwcGVyLmNsaWVudFdpZHRoIC0gMTAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRQb3MubGVmdCArIGxpbmVPZmYubGVmdCAtIHdyYXBPZmYubGVmdCkpO1xuICAgICAgZGlzcGxheS5pbnB1dERpdi5zdHlsZS50b3AgPSB0b3AgKyBcInB4XCI7XG4gICAgICBkaXNwbGF5LmlucHV0RGl2LnN0eWxlLmxlZnQgPSBsZWZ0ICsgXCJweFwiO1xuICAgIH1cblxuICAgIHJlbW92ZUNoaWxkcmVuQW5kQWRkKGRpc3BsYXkuY3Vyc29yRGl2LCBjdXJGcmFnbWVudCk7XG4gICAgcmVtb3ZlQ2hpbGRyZW5BbmRBZGQoZGlzcGxheS5zZWxlY3Rpb25EaXYsIHNlbEZyYWdtZW50KTtcbiAgfVxuXG4gIC8vIERyYXdzIGEgY3Vyc29yIGZvciB0aGUgZ2l2ZW4gcmFuZ2VcbiAgZnVuY3Rpb24gZHJhd1NlbGVjdGlvbkN1cnNvcihjbSwgcmFuZ2UsIG91dHB1dCkge1xuICAgIHZhciBwb3MgPSBjdXJzb3JDb29yZHMoY20sIHJhbmdlLmhlYWQsIFwiZGl2XCIpO1xuXG4gICAgdmFyIGN1cnNvciA9IG91dHB1dC5hcHBlbmRDaGlsZChlbHQoXCJkaXZcIiwgXCJcXHUwMGEwXCIsIFwiQ29kZU1pcnJvci1jdXJzb3JcIikpO1xuICAgIGN1cnNvci5zdHlsZS5sZWZ0ID0gcG9zLmxlZnQgKyBcInB4XCI7XG4gICAgY3Vyc29yLnN0eWxlLnRvcCA9IHBvcy50b3AgKyBcInB4XCI7XG4gICAgY3Vyc29yLnN0eWxlLmhlaWdodCA9IE1hdGgubWF4KDAsIHBvcy5ib3R0b20gLSBwb3MudG9wKSAqIGNtLm9wdGlvbnMuY3Vyc29ySGVpZ2h0ICsgXCJweFwiO1xuXG4gICAgaWYgKHBvcy5vdGhlcikge1xuICAgICAgLy8gU2Vjb25kYXJ5IGN1cnNvciwgc2hvd24gd2hlbiBvbiBhICdqdW1wJyBpbiBiaS1kaXJlY3Rpb25hbCB0ZXh0XG4gICAgICB2YXIgb3RoZXJDdXJzb3IgPSBvdXRwdXQuYXBwZW5kQ2hpbGQoZWx0KFwiZGl2XCIsIFwiXFx1MDBhMFwiLCBcIkNvZGVNaXJyb3ItY3Vyc29yIENvZGVNaXJyb3Itc2Vjb25kYXJ5Y3Vyc29yXCIpKTtcbiAgICAgIG90aGVyQ3Vyc29yLnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xuICAgICAgb3RoZXJDdXJzb3Iuc3R5bGUubGVmdCA9IHBvcy5vdGhlci5sZWZ0ICsgXCJweFwiO1xuICAgICAgb3RoZXJDdXJzb3Iuc3R5bGUudG9wID0gcG9zLm90aGVyLnRvcCArIFwicHhcIjtcbiAgICAgIG90aGVyQ3Vyc29yLnN0eWxlLmhlaWdodCA9IChwb3Mub3RoZXIuYm90dG9tIC0gcG9zLm90aGVyLnRvcCkgKiAuODUgKyBcInB4XCI7XG4gICAgfVxuICB9XG5cbiAgLy8gRHJhd3MgdGhlIGdpdmVuIHJhbmdlIGFzIGEgaGlnaGxpZ2h0ZWQgc2VsZWN0aW9uXG4gIGZ1bmN0aW9uIGRyYXdTZWxlY3Rpb25SYW5nZShjbSwgcmFuZ2UsIG91dHB1dCkge1xuICAgIHZhciBkaXNwbGF5ID0gY20uZGlzcGxheSwgZG9jID0gY20uZG9jO1xuICAgIHZhciBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICB2YXIgcGFkZGluZyA9IHBhZGRpbmdIKGNtLmRpc3BsYXkpLCBsZWZ0U2lkZSA9IHBhZGRpbmcubGVmdCwgcmlnaHRTaWRlID0gZGlzcGxheS5saW5lU3BhY2Uub2Zmc2V0V2lkdGggLSBwYWRkaW5nLnJpZ2h0O1xuXG4gICAgZnVuY3Rpb24gYWRkKGxlZnQsIHRvcCwgd2lkdGgsIGJvdHRvbSkge1xuICAgICAgaWYgKHRvcCA8IDApIHRvcCA9IDA7XG4gICAgICB0b3AgPSBNYXRoLnJvdW5kKHRvcCk7XG4gICAgICBib3R0b20gPSBNYXRoLnJvdW5kKGJvdHRvbSk7XG4gICAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChlbHQoXCJkaXZcIiwgbnVsbCwgXCJDb2RlTWlycm9yLXNlbGVjdGVkXCIsIFwicG9zaXRpb246IGFic29sdXRlOyBsZWZ0OiBcIiArIGxlZnQgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicHg7IHRvcDogXCIgKyB0b3AgKyBcInB4OyB3aWR0aDogXCIgKyAod2lkdGggPT0gbnVsbCA/IHJpZ2h0U2lkZSAtIGxlZnQgOiB3aWR0aCkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicHg7IGhlaWdodDogXCIgKyAoYm90dG9tIC0gdG9wKSArIFwicHhcIikpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyYXdGb3JMaW5lKGxpbmUsIGZyb21BcmcsIHRvQXJnKSB7XG4gICAgICB2YXIgbGluZU9iaiA9IGdldExpbmUoZG9jLCBsaW5lKTtcbiAgICAgIHZhciBsaW5lTGVuID0gbGluZU9iai50ZXh0Lmxlbmd0aDtcbiAgICAgIHZhciBzdGFydCwgZW5kO1xuICAgICAgZnVuY3Rpb24gY29vcmRzKGNoLCBiaWFzKSB7XG4gICAgICAgIHJldHVybiBjaGFyQ29vcmRzKGNtLCBQb3MobGluZSwgY2gpLCBcImRpdlwiLCBsaW5lT2JqLCBiaWFzKTtcbiAgICAgIH1cblxuICAgICAgaXRlcmF0ZUJpZGlTZWN0aW9ucyhnZXRPcmRlcihsaW5lT2JqKSwgZnJvbUFyZyB8fCAwLCB0b0FyZyA9PSBudWxsID8gbGluZUxlbiA6IHRvQXJnLCBmdW5jdGlvbihmcm9tLCB0bywgZGlyKSB7XG4gICAgICAgIHZhciBsZWZ0UG9zID0gY29vcmRzKGZyb20sIFwibGVmdFwiKSwgcmlnaHRQb3MsIGxlZnQsIHJpZ2h0O1xuICAgICAgICBpZiAoZnJvbSA9PSB0bykge1xuICAgICAgICAgIHJpZ2h0UG9zID0gbGVmdFBvcztcbiAgICAgICAgICBsZWZ0ID0gcmlnaHQgPSBsZWZ0UG9zLmxlZnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmlnaHRQb3MgPSBjb29yZHModG8gLSAxLCBcInJpZ2h0XCIpO1xuICAgICAgICAgIGlmIChkaXIgPT0gXCJydGxcIikgeyB2YXIgdG1wID0gbGVmdFBvczsgbGVmdFBvcyA9IHJpZ2h0UG9zOyByaWdodFBvcyA9IHRtcDsgfVxuICAgICAgICAgIGxlZnQgPSBsZWZ0UG9zLmxlZnQ7XG4gICAgICAgICAgcmlnaHQgPSByaWdodFBvcy5yaWdodDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZnJvbUFyZyA9PSBudWxsICYmIGZyb20gPT0gMCkgbGVmdCA9IGxlZnRTaWRlO1xuICAgICAgICBpZiAocmlnaHRQb3MudG9wIC0gbGVmdFBvcy50b3AgPiAzKSB7IC8vIERpZmZlcmVudCBsaW5lcywgZHJhdyB0b3AgcGFydFxuICAgICAgICAgIGFkZChsZWZ0LCBsZWZ0UG9zLnRvcCwgbnVsbCwgbGVmdFBvcy5ib3R0b20pO1xuICAgICAgICAgIGxlZnQgPSBsZWZ0U2lkZTtcbiAgICAgICAgICBpZiAobGVmdFBvcy5ib3R0b20gPCByaWdodFBvcy50b3ApIGFkZChsZWZ0LCBsZWZ0UG9zLmJvdHRvbSwgbnVsbCwgcmlnaHRQb3MudG9wKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodG9BcmcgPT0gbnVsbCAmJiB0byA9PSBsaW5lTGVuKSByaWdodCA9IHJpZ2h0U2lkZTtcbiAgICAgICAgaWYgKCFzdGFydCB8fCBsZWZ0UG9zLnRvcCA8IHN0YXJ0LnRvcCB8fCBsZWZ0UG9zLnRvcCA9PSBzdGFydC50b3AgJiYgbGVmdFBvcy5sZWZ0IDwgc3RhcnQubGVmdClcbiAgICAgICAgICBzdGFydCA9IGxlZnRQb3M7XG4gICAgICAgIGlmICghZW5kIHx8IHJpZ2h0UG9zLmJvdHRvbSA+IGVuZC5ib3R0b20gfHwgcmlnaHRQb3MuYm90dG9tID09IGVuZC5ib3R0b20gJiYgcmlnaHRQb3MucmlnaHQgPiBlbmQucmlnaHQpXG4gICAgICAgICAgZW5kID0gcmlnaHRQb3M7XG4gICAgICAgIGlmIChsZWZ0IDwgbGVmdFNpZGUgKyAxKSBsZWZ0ID0gbGVmdFNpZGU7XG4gICAgICAgIGFkZChsZWZ0LCByaWdodFBvcy50b3AsIHJpZ2h0IC0gbGVmdCwgcmlnaHRQb3MuYm90dG9tKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHtzdGFydDogc3RhcnQsIGVuZDogZW5kfTtcbiAgICB9XG5cbiAgICB2YXIgc0Zyb20gPSByYW5nZS5mcm9tKCksIHNUbyA9IHJhbmdlLnRvKCk7XG4gICAgaWYgKHNGcm9tLmxpbmUgPT0gc1RvLmxpbmUpIHtcbiAgICAgIGRyYXdGb3JMaW5lKHNGcm9tLmxpbmUsIHNGcm9tLmNoLCBzVG8uY2gpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZnJvbUxpbmUgPSBnZXRMaW5lKGRvYywgc0Zyb20ubGluZSksIHRvTGluZSA9IGdldExpbmUoZG9jLCBzVG8ubGluZSk7XG4gICAgICB2YXIgc2luZ2xlVkxpbmUgPSB2aXN1YWxMaW5lKGZyb21MaW5lKSA9PSB2aXN1YWxMaW5lKHRvTGluZSk7XG4gICAgICB2YXIgbGVmdEVuZCA9IGRyYXdGb3JMaW5lKHNGcm9tLmxpbmUsIHNGcm9tLmNoLCBzaW5nbGVWTGluZSA/IGZyb21MaW5lLnRleHQubGVuZ3RoICsgMSA6IG51bGwpLmVuZDtcbiAgICAgIHZhciByaWdodFN0YXJ0ID0gZHJhd0ZvckxpbmUoc1RvLmxpbmUsIHNpbmdsZVZMaW5lID8gMCA6IG51bGwsIHNUby5jaCkuc3RhcnQ7XG4gICAgICBpZiAoc2luZ2xlVkxpbmUpIHtcbiAgICAgICAgaWYgKGxlZnRFbmQudG9wIDwgcmlnaHRTdGFydC50b3AgLSAyKSB7XG4gICAgICAgICAgYWRkKGxlZnRFbmQucmlnaHQsIGxlZnRFbmQudG9wLCBudWxsLCBsZWZ0RW5kLmJvdHRvbSk7XG4gICAgICAgICAgYWRkKGxlZnRTaWRlLCByaWdodFN0YXJ0LnRvcCwgcmlnaHRTdGFydC5sZWZ0LCByaWdodFN0YXJ0LmJvdHRvbSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYWRkKGxlZnRFbmQucmlnaHQsIGxlZnRFbmQudG9wLCByaWdodFN0YXJ0LmxlZnQgLSBsZWZ0RW5kLnJpZ2h0LCBsZWZ0RW5kLmJvdHRvbSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChsZWZ0RW5kLmJvdHRvbSA8IHJpZ2h0U3RhcnQudG9wKVxuICAgICAgICBhZGQobGVmdFNpZGUsIGxlZnRFbmQuYm90dG9tLCBudWxsLCByaWdodFN0YXJ0LnRvcCk7XG4gICAgfVxuXG4gICAgb3V0cHV0LmFwcGVuZENoaWxkKGZyYWdtZW50KTtcbiAgfVxuXG4gIC8vIEN1cnNvci1ibGlua2luZ1xuICBmdW5jdGlvbiByZXN0YXJ0QmxpbmsoY20pIHtcbiAgICBpZiAoIWNtLnN0YXRlLmZvY3VzZWQpIHJldHVybjtcbiAgICB2YXIgZGlzcGxheSA9IGNtLmRpc3BsYXk7XG4gICAgY2xlYXJJbnRlcnZhbChkaXNwbGF5LmJsaW5rZXIpO1xuICAgIHZhciBvbiA9IHRydWU7XG4gICAgZGlzcGxheS5jdXJzb3JEaXYuc3R5bGUudmlzaWJpbGl0eSA9IFwiXCI7XG4gICAgaWYgKGNtLm9wdGlvbnMuY3Vyc29yQmxpbmtSYXRlID4gMClcbiAgICAgIGRpc3BsYXkuYmxpbmtlciA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgICBkaXNwbGF5LmN1cnNvckRpdi5zdHlsZS52aXNpYmlsaXR5ID0gKG9uID0gIW9uKSA/IFwiXCIgOiBcImhpZGRlblwiO1xuICAgICAgfSwgY20ub3B0aW9ucy5jdXJzb3JCbGlua1JhdGUpO1xuICB9XG5cbiAgLy8gSElHSExJR0hUIFdPUktFUlxuXG4gIGZ1bmN0aW9uIHN0YXJ0V29ya2VyKGNtLCB0aW1lKSB7XG4gICAgaWYgKGNtLmRvYy5tb2RlLnN0YXJ0U3RhdGUgJiYgY20uZG9jLmZyb250aWVyIDwgY20uZGlzcGxheS52aWV3VG8pXG4gICAgICBjbS5zdGF0ZS5oaWdobGlnaHQuc2V0KHRpbWUsIGJpbmQoaGlnaGxpZ2h0V29ya2VyLCBjbSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gaGlnaGxpZ2h0V29ya2VyKGNtKSB7XG4gICAgdmFyIGRvYyA9IGNtLmRvYztcbiAgICBpZiAoZG9jLmZyb250aWVyIDwgZG9jLmZpcnN0KSBkb2MuZnJvbnRpZXIgPSBkb2MuZmlyc3Q7XG4gICAgaWYgKGRvYy5mcm9udGllciA+PSBjbS5kaXNwbGF5LnZpZXdUbykgcmV0dXJuO1xuICAgIHZhciBlbmQgPSArbmV3IERhdGUgKyBjbS5vcHRpb25zLndvcmtUaW1lO1xuICAgIHZhciBzdGF0ZSA9IGNvcHlTdGF0ZShkb2MubW9kZSwgZ2V0U3RhdGVCZWZvcmUoY20sIGRvYy5mcm9udGllcikpO1xuXG4gICAgcnVuSW5PcChjbSwgZnVuY3Rpb24oKSB7XG4gICAgZG9jLml0ZXIoZG9jLmZyb250aWVyLCBNYXRoLm1pbihkb2MuZmlyc3QgKyBkb2Muc2l6ZSwgY20uZGlzcGxheS52aWV3VG8gKyA1MDApLCBmdW5jdGlvbihsaW5lKSB7XG4gICAgICBpZiAoZG9jLmZyb250aWVyID49IGNtLmRpc3BsYXkudmlld0Zyb20pIHsgLy8gVmlzaWJsZVxuICAgICAgICB2YXIgb2xkU3R5bGVzID0gbGluZS5zdHlsZXM7XG4gICAgICAgIHZhciBoaWdobGlnaHRlZCA9IGhpZ2hsaWdodExpbmUoY20sIGxpbmUsIHN0YXRlLCB0cnVlKTtcbiAgICAgICAgbGluZS5zdHlsZXMgPSBoaWdobGlnaHRlZC5zdHlsZXM7XG4gICAgICAgIGlmIChoaWdobGlnaHRlZC5jbGFzc2VzKSBsaW5lLnN0eWxlQ2xhc3NlcyA9IGhpZ2hsaWdodGVkLmNsYXNzZXM7XG4gICAgICAgIGVsc2UgaWYgKGxpbmUuc3R5bGVDbGFzc2VzKSBsaW5lLnN0eWxlQ2xhc3NlcyA9IG51bGw7XG4gICAgICAgIHZhciBpc2NoYW5nZSA9ICFvbGRTdHlsZXMgfHwgb2xkU3R5bGVzLmxlbmd0aCAhPSBsaW5lLnN0eWxlcy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyAhaXNjaGFuZ2UgJiYgaSA8IG9sZFN0eWxlcy5sZW5ndGg7ICsraSkgaXNjaGFuZ2UgPSBvbGRTdHlsZXNbaV0gIT0gbGluZS5zdHlsZXNbaV07XG4gICAgICAgIGlmIChpc2NoYW5nZSkgcmVnTGluZUNoYW5nZShjbSwgZG9jLmZyb250aWVyLCBcInRleHRcIik7XG4gICAgICAgIGxpbmUuc3RhdGVBZnRlciA9IGNvcHlTdGF0ZShkb2MubW9kZSwgc3RhdGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvY2Vzc0xpbmUoY20sIGxpbmUudGV4dCwgc3RhdGUpO1xuICAgICAgICBsaW5lLnN0YXRlQWZ0ZXIgPSBkb2MuZnJvbnRpZXIgJSA1ID09IDAgPyBjb3B5U3RhdGUoZG9jLm1vZGUsIHN0YXRlKSA6IG51bGw7XG4gICAgICB9XG4gICAgICArK2RvYy5mcm9udGllcjtcbiAgICAgIGlmICgrbmV3IERhdGUgPiBlbmQpIHtcbiAgICAgICAgc3RhcnRXb3JrZXIoY20sIGNtLm9wdGlvbnMud29ya0RlbGF5KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBGaW5kcyB0aGUgbGluZSB0byBzdGFydCB3aXRoIHdoZW4gc3RhcnRpbmcgYSBwYXJzZS4gVHJpZXMgdG9cbiAgLy8gZmluZCBhIGxpbmUgd2l0aCBhIHN0YXRlQWZ0ZXIsIHNvIHRoYXQgaXQgY2FuIHN0YXJ0IHdpdGggYVxuICAvLyB2YWxpZCBzdGF0ZS4gSWYgdGhhdCBmYWlscywgaXQgcmV0dXJucyB0aGUgbGluZSB3aXRoIHRoZVxuICAvLyBzbWFsbGVzdCBpbmRlbnRhdGlvbiwgd2hpY2ggdGVuZHMgdG8gbmVlZCB0aGUgbGVhc3QgY29udGV4dCB0b1xuICAvLyBwYXJzZSBjb3JyZWN0bHkuXG4gIGZ1bmN0aW9uIGZpbmRTdGFydExpbmUoY20sIG4sIHByZWNpc2UpIHtcbiAgICB2YXIgbWluaW5kZW50LCBtaW5saW5lLCBkb2MgPSBjbS5kb2M7XG4gICAgdmFyIGxpbSA9IHByZWNpc2UgPyAtMSA6IG4gLSAoY20uZG9jLm1vZGUuaW5uZXJNb2RlID8gMTAwMCA6IDEwMCk7XG4gICAgZm9yICh2YXIgc2VhcmNoID0gbjsgc2VhcmNoID4gbGltOyAtLXNlYXJjaCkge1xuICAgICAgaWYgKHNlYXJjaCA8PSBkb2MuZmlyc3QpIHJldHVybiBkb2MuZmlyc3Q7XG4gICAgICB2YXIgbGluZSA9IGdldExpbmUoZG9jLCBzZWFyY2ggLSAxKTtcbiAgICAgIGlmIChsaW5lLnN0YXRlQWZ0ZXIgJiYgKCFwcmVjaXNlIHx8IHNlYXJjaCA8PSBkb2MuZnJvbnRpZXIpKSByZXR1cm4gc2VhcmNoO1xuICAgICAgdmFyIGluZGVudGVkID0gY291bnRDb2x1bW4obGluZS50ZXh0LCBudWxsLCBjbS5vcHRpb25zLnRhYlNpemUpO1xuICAgICAgaWYgKG1pbmxpbmUgPT0gbnVsbCB8fCBtaW5pbmRlbnQgPiBpbmRlbnRlZCkge1xuICAgICAgICBtaW5saW5lID0gc2VhcmNoIC0gMTtcbiAgICAgICAgbWluaW5kZW50ID0gaW5kZW50ZWQ7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtaW5saW5lO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0U3RhdGVCZWZvcmUoY20sIG4sIHByZWNpc2UpIHtcbiAgICB2YXIgZG9jID0gY20uZG9jLCBkaXNwbGF5ID0gY20uZGlzcGxheTtcbiAgICBpZiAoIWRvYy5tb2RlLnN0YXJ0U3RhdGUpIHJldHVybiB0cnVlO1xuICAgIHZhciBwb3MgPSBmaW5kU3RhcnRMaW5lKGNtLCBuLCBwcmVjaXNlKSwgc3RhdGUgPSBwb3MgPiBkb2MuZmlyc3QgJiYgZ2V0TGluZShkb2MsIHBvcy0xKS5zdGF0ZUFmdGVyO1xuICAgIGlmICghc3RhdGUpIHN0YXRlID0gc3RhcnRTdGF0ZShkb2MubW9kZSk7XG4gICAgZWxzZSBzdGF0ZSA9IGNvcHlTdGF0ZShkb2MubW9kZSwgc3RhdGUpO1xuICAgIGRvYy5pdGVyKHBvcywgbiwgZnVuY3Rpb24obGluZSkge1xuICAgICAgcHJvY2Vzc0xpbmUoY20sIGxpbmUudGV4dCwgc3RhdGUpO1xuICAgICAgdmFyIHNhdmUgPSBwb3MgPT0gbiAtIDEgfHwgcG9zICUgNSA9PSAwIHx8IHBvcyA+PSBkaXNwbGF5LnZpZXdGcm9tICYmIHBvcyA8IGRpc3BsYXkudmlld1RvO1xuICAgICAgbGluZS5zdGF0ZUFmdGVyID0gc2F2ZSA/IGNvcHlTdGF0ZShkb2MubW9kZSwgc3RhdGUpIDogbnVsbDtcbiAgICAgICsrcG9zO1xuICAgIH0pO1xuICAgIGlmIChwcmVjaXNlKSBkb2MuZnJvbnRpZXIgPSBwb3M7XG4gICAgcmV0dXJuIHN0YXRlO1xuICB9XG5cbiAgLy8gUE9TSVRJT04gTUVBU1VSRU1FTlRcblxuICBmdW5jdGlvbiBwYWRkaW5nVG9wKGRpc3BsYXkpIHtyZXR1cm4gZGlzcGxheS5saW5lU3BhY2Uub2Zmc2V0VG9wO31cbiAgZnVuY3Rpb24gcGFkZGluZ1ZlcnQoZGlzcGxheSkge3JldHVybiBkaXNwbGF5Lm1vdmVyLm9mZnNldEhlaWdodCAtIGRpc3BsYXkubGluZVNwYWNlLm9mZnNldEhlaWdodDt9XG4gIGZ1bmN0aW9uIHBhZGRpbmdIKGRpc3BsYXkpIHtcbiAgICBpZiAoZGlzcGxheS5jYWNoZWRQYWRkaW5nSCkgcmV0dXJuIGRpc3BsYXkuY2FjaGVkUGFkZGluZ0g7XG4gICAgdmFyIGUgPSByZW1vdmVDaGlsZHJlbkFuZEFkZChkaXNwbGF5Lm1lYXN1cmUsIGVsdChcInByZVwiLCBcInhcIikpO1xuICAgIHZhciBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlID8gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZSkgOiBlLmN1cnJlbnRTdHlsZTtcbiAgICB2YXIgZGF0YSA9IHtsZWZ0OiBwYXJzZUludChzdHlsZS5wYWRkaW5nTGVmdCksIHJpZ2h0OiBwYXJzZUludChzdHlsZS5wYWRkaW5nUmlnaHQpfTtcbiAgICBpZiAoIWlzTmFOKGRhdGEubGVmdCkgJiYgIWlzTmFOKGRhdGEucmlnaHQpKSBkaXNwbGF5LmNhY2hlZFBhZGRpbmdIID0gZGF0YTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIC8vIEVuc3VyZSB0aGUgbGluZVZpZXcud3JhcHBpbmcuaGVpZ2h0cyBhcnJheSBpcyBwb3B1bGF0ZWQuIFRoaXMgaXNcbiAgLy8gYW4gYXJyYXkgb2YgYm90dG9tIG9mZnNldHMgZm9yIHRoZSBsaW5lcyB0aGF0IG1ha2UgdXAgYSBkcmF3blxuICAvLyBsaW5lLiBXaGVuIGxpbmVXcmFwcGluZyBpcyBvbiwgdGhlcmUgbWlnaHQgYmUgbW9yZSB0aGFuIG9uZVxuICAvLyBoZWlnaHQuXG4gIGZ1bmN0aW9uIGVuc3VyZUxpbmVIZWlnaHRzKGNtLCBsaW5lVmlldywgcmVjdCkge1xuICAgIHZhciB3cmFwcGluZyA9IGNtLm9wdGlvbnMubGluZVdyYXBwaW5nO1xuICAgIHZhciBjdXJXaWR0aCA9IHdyYXBwaW5nICYmIGNtLmRpc3BsYXkuc2Nyb2xsZXIuY2xpZW50V2lkdGg7XG4gICAgaWYgKCFsaW5lVmlldy5tZWFzdXJlLmhlaWdodHMgfHwgd3JhcHBpbmcgJiYgbGluZVZpZXcubWVhc3VyZS53aWR0aCAhPSBjdXJXaWR0aCkge1xuICAgICAgdmFyIGhlaWdodHMgPSBsaW5lVmlldy5tZWFzdXJlLmhlaWdodHMgPSBbXTtcbiAgICAgIGlmICh3cmFwcGluZykge1xuICAgICAgICBsaW5lVmlldy5tZWFzdXJlLndpZHRoID0gY3VyV2lkdGg7XG4gICAgICAgIHZhciByZWN0cyA9IGxpbmVWaWV3LnRleHQuZmlyc3RDaGlsZC5nZXRDbGllbnRSZWN0cygpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlY3RzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICAgIHZhciBjdXIgPSByZWN0c1tpXSwgbmV4dCA9IHJlY3RzW2kgKyAxXTtcbiAgICAgICAgICBpZiAoTWF0aC5hYnMoY3VyLmJvdHRvbSAtIG5leHQuYm90dG9tKSA+IDIpXG4gICAgICAgICAgICBoZWlnaHRzLnB1c2goKGN1ci5ib3R0b20gKyBuZXh0LnRvcCkgLyAyIC0gcmVjdC50b3ApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBoZWlnaHRzLnB1c2gocmVjdC5ib3R0b20gLSByZWN0LnRvcCk7XG4gICAgfVxuICB9XG5cbiAgLy8gRmluZCBhIGxpbmUgbWFwIChtYXBwaW5nIGNoYXJhY3RlciBvZmZzZXRzIHRvIHRleHQgbm9kZXMpIGFuZCBhXG4gIC8vIG1lYXN1cmVtZW50IGNhY2hlIGZvciB0aGUgZ2l2ZW4gbGluZSBudW1iZXIuIChBIGxpbmUgdmlldyBtaWdodFxuICAvLyBjb250YWluIG11bHRpcGxlIGxpbmVzIHdoZW4gY29sbGFwc2VkIHJhbmdlcyBhcmUgcHJlc2VudC4pXG4gIGZ1bmN0aW9uIG1hcEZyb21MaW5lVmlldyhsaW5lVmlldywgbGluZSwgbGluZU4pIHtcbiAgICBpZiAobGluZVZpZXcubGluZSA9PSBsaW5lKVxuICAgICAgcmV0dXJuIHttYXA6IGxpbmVWaWV3Lm1lYXN1cmUubWFwLCBjYWNoZTogbGluZVZpZXcubWVhc3VyZS5jYWNoZX07XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lVmlldy5yZXN0Lmxlbmd0aDsgaSsrKVxuICAgICAgaWYgKGxpbmVWaWV3LnJlc3RbaV0gPT0gbGluZSlcbiAgICAgICAgcmV0dXJuIHttYXA6IGxpbmVWaWV3Lm1lYXN1cmUubWFwc1tpXSwgY2FjaGU6IGxpbmVWaWV3Lm1lYXN1cmUuY2FjaGVzW2ldfTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVWaWV3LnJlc3QubGVuZ3RoOyBpKyspXG4gICAgICBpZiAobGluZU5vKGxpbmVWaWV3LnJlc3RbaV0pID4gbGluZU4pXG4gICAgICAgIHJldHVybiB7bWFwOiBsaW5lVmlldy5tZWFzdXJlLm1hcHNbaV0sIGNhY2hlOiBsaW5lVmlldy5tZWFzdXJlLmNhY2hlc1tpXSwgYmVmb3JlOiB0cnVlfTtcbiAgfVxuXG4gIC8vIFJlbmRlciBhIGxpbmUgaW50byB0aGUgaGlkZGVuIG5vZGUgZGlzcGxheS5leHRlcm5hbE1lYXN1cmVkLiBVc2VkXG4gIC8vIHdoZW4gbWVhc3VyZW1lbnQgaXMgbmVlZGVkIGZvciBhIGxpbmUgdGhhdCdzIG5vdCBpbiB0aGUgdmlld3BvcnQuXG4gIGZ1bmN0aW9uIHVwZGF0ZUV4dGVybmFsTWVhc3VyZW1lbnQoY20sIGxpbmUpIHtcbiAgICBsaW5lID0gdmlzdWFsTGluZShsaW5lKTtcbiAgICB2YXIgbGluZU4gPSBsaW5lTm8obGluZSk7XG4gICAgdmFyIHZpZXcgPSBjbS5kaXNwbGF5LmV4dGVybmFsTWVhc3VyZWQgPSBuZXcgTGluZVZpZXcoY20uZG9jLCBsaW5lLCBsaW5lTik7XG4gICAgdmlldy5saW5lTiA9IGxpbmVOO1xuICAgIHZhciBidWlsdCA9IHZpZXcuYnVpbHQgPSBidWlsZExpbmVDb250ZW50KGNtLCB2aWV3KTtcbiAgICB2aWV3LnRleHQgPSBidWlsdC5wcmU7XG4gICAgcmVtb3ZlQ2hpbGRyZW5BbmRBZGQoY20uZGlzcGxheS5saW5lTWVhc3VyZSwgYnVpbHQucHJlKTtcbiAgICByZXR1cm4gdmlldztcbiAgfVxuXG4gIC8vIEdldCBhIHt0b3AsIGJvdHRvbSwgbGVmdCwgcmlnaHR9IGJveCAoaW4gbGluZS1sb2NhbCBjb29yZGluYXRlcylcbiAgLy8gZm9yIGEgZ2l2ZW4gY2hhcmFjdGVyLlxuICBmdW5jdGlvbiBtZWFzdXJlQ2hhcihjbSwgbGluZSwgY2gsIGJpYXMpIHtcbiAgICByZXR1cm4gbWVhc3VyZUNoYXJQcmVwYXJlZChjbSwgcHJlcGFyZU1lYXN1cmVGb3JMaW5lKGNtLCBsaW5lKSwgY2gsIGJpYXMpO1xuICB9XG5cbiAgLy8gRmluZCBhIGxpbmUgdmlldyB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSBnaXZlbiBsaW5lIG51bWJlci5cbiAgZnVuY3Rpb24gZmluZFZpZXdGb3JMaW5lKGNtLCBsaW5lTikge1xuICAgIGlmIChsaW5lTiA+PSBjbS5kaXNwbGF5LnZpZXdGcm9tICYmIGxpbmVOIDwgY20uZGlzcGxheS52aWV3VG8pXG4gICAgICByZXR1cm4gY20uZGlzcGxheS52aWV3W2ZpbmRWaWV3SW5kZXgoY20sIGxpbmVOKV07XG4gICAgdmFyIGV4dCA9IGNtLmRpc3BsYXkuZXh0ZXJuYWxNZWFzdXJlZDtcbiAgICBpZiAoZXh0ICYmIGxpbmVOID49IGV4dC5saW5lTiAmJiBsaW5lTiA8IGV4dC5saW5lTiArIGV4dC5zaXplKVxuICAgICAgcmV0dXJuIGV4dDtcbiAgfVxuXG4gIC8vIE1lYXN1cmVtZW50IGNhbiBiZSBzcGxpdCBpbiB0d28gc3RlcHMsIHRoZSBzZXQtdXAgd29yayB0aGF0XG4gIC8vIGFwcGxpZXMgdG8gdGhlIHdob2xlIGxpbmUsIGFuZCB0aGUgbWVhc3VyZW1lbnQgb2YgdGhlIGFjdHVhbFxuICAvLyBjaGFyYWN0ZXIuIEZ1bmN0aW9ucyBsaWtlIGNvb3Jkc0NoYXIsIHRoYXQgbmVlZCB0byBkbyBhIGxvdCBvZlxuICAvLyBtZWFzdXJlbWVudHMgaW4gYSByb3csIGNhbiB0aHVzIGVuc3VyZSB0aGF0IHRoZSBzZXQtdXAgd29yayBpc1xuICAvLyBvbmx5IGRvbmUgb25jZS5cbiAgZnVuY3Rpb24gcHJlcGFyZU1lYXN1cmVGb3JMaW5lKGNtLCBsaW5lKSB7XG4gICAgdmFyIGxpbmVOID0gbGluZU5vKGxpbmUpO1xuICAgIHZhciB2aWV3ID0gZmluZFZpZXdGb3JMaW5lKGNtLCBsaW5lTik7XG4gICAgaWYgKHZpZXcgJiYgIXZpZXcudGV4dClcbiAgICAgIHZpZXcgPSBudWxsO1xuICAgIGVsc2UgaWYgKHZpZXcgJiYgdmlldy5jaGFuZ2VzKVxuICAgICAgdXBkYXRlTGluZUZvckNoYW5nZXMoY20sIHZpZXcsIGxpbmVOLCBnZXREaW1lbnNpb25zKGNtKSk7XG4gICAgaWYgKCF2aWV3KVxuICAgICAgdmlldyA9IHVwZGF0ZUV4dGVybmFsTWVhc3VyZW1lbnQoY20sIGxpbmUpO1xuXG4gICAgdmFyIGluZm8gPSBtYXBGcm9tTGluZVZpZXcodmlldywgbGluZSwgbGluZU4pO1xuICAgIHJldHVybiB7XG4gICAgICBsaW5lOiBsaW5lLCB2aWV3OiB2aWV3LCByZWN0OiBudWxsLFxuICAgICAgbWFwOiBpbmZvLm1hcCwgY2FjaGU6IGluZm8uY2FjaGUsIGJlZm9yZTogaW5mby5iZWZvcmUsXG4gICAgICBoYXNIZWlnaHRzOiBmYWxzZVxuICAgIH07XG4gIH1cblxuICAvLyBHaXZlbiBhIHByZXBhcmVkIG1lYXN1cmVtZW50IG9iamVjdCwgbWVhc3VyZXMgdGhlIHBvc2l0aW9uIG9mIGFuXG4gIC8vIGFjdHVhbCBjaGFyYWN0ZXIgKG9yIGZldGNoZXMgaXQgZnJvbSB0aGUgY2FjaGUpLlxuICBmdW5jdGlvbiBtZWFzdXJlQ2hhclByZXBhcmVkKGNtLCBwcmVwYXJlZCwgY2gsIGJpYXMpIHtcbiAgICBpZiAocHJlcGFyZWQuYmVmb3JlKSBjaCA9IC0xO1xuICAgIHZhciBrZXkgPSBjaCArIChiaWFzIHx8IFwiXCIpLCBmb3VuZDtcbiAgICBpZiAocHJlcGFyZWQuY2FjaGUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgZm91bmQgPSBwcmVwYXJlZC5jYWNoZVtrZXldO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXByZXBhcmVkLnJlY3QpXG4gICAgICAgIHByZXBhcmVkLnJlY3QgPSBwcmVwYXJlZC52aWV3LnRleHQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICBpZiAoIXByZXBhcmVkLmhhc0hlaWdodHMpIHtcbiAgICAgICAgZW5zdXJlTGluZUhlaWdodHMoY20sIHByZXBhcmVkLnZpZXcsIHByZXBhcmVkLnJlY3QpO1xuICAgICAgICBwcmVwYXJlZC5oYXNIZWlnaHRzID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGZvdW5kID0gbWVhc3VyZUNoYXJJbm5lcihjbSwgcHJlcGFyZWQsIGNoLCBiaWFzKTtcbiAgICAgIGlmICghZm91bmQuYm9ndXMpIHByZXBhcmVkLmNhY2hlW2tleV0gPSBmb3VuZDtcbiAgICB9XG4gICAgcmV0dXJuIHtsZWZ0OiBmb3VuZC5sZWZ0LCByaWdodDogZm91bmQucmlnaHQsIHRvcDogZm91bmQudG9wLCBib3R0b206IGZvdW5kLmJvdHRvbX07XG4gIH1cblxuICB2YXIgbnVsbFJlY3QgPSB7bGVmdDogMCwgcmlnaHQ6IDAsIHRvcDogMCwgYm90dG9tOiAwfTtcblxuICBmdW5jdGlvbiBtZWFzdXJlQ2hhcklubmVyKGNtLCBwcmVwYXJlZCwgY2gsIGJpYXMpIHtcbiAgICB2YXIgbWFwID0gcHJlcGFyZWQubWFwO1xuXG4gICAgdmFyIG5vZGUsIHN0YXJ0LCBlbmQsIGNvbGxhcHNlO1xuICAgIC8vIEZpcnN0LCBzZWFyY2ggdGhlIGxpbmUgbWFwIGZvciB0aGUgdGV4dCBub2RlIGNvcnJlc3BvbmRpbmcgdG8sXG4gICAgLy8gb3IgY2xvc2VzdCB0bywgdGhlIHRhcmdldCBjaGFyYWN0ZXIuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXAubGVuZ3RoOyBpICs9IDMpIHtcbiAgICAgIHZhciBtU3RhcnQgPSBtYXBbaV0sIG1FbmQgPSBtYXBbaSArIDFdO1xuICAgICAgaWYgKGNoIDwgbVN0YXJ0KSB7XG4gICAgICAgIHN0YXJ0ID0gMDsgZW5kID0gMTtcbiAgICAgICAgY29sbGFwc2UgPSBcImxlZnRcIjtcbiAgICAgIH0gZWxzZSBpZiAoY2ggPCBtRW5kKSB7XG4gICAgICAgIHN0YXJ0ID0gY2ggLSBtU3RhcnQ7XG4gICAgICAgIGVuZCA9IHN0YXJ0ICsgMTtcbiAgICAgIH0gZWxzZSBpZiAoaSA9PSBtYXAubGVuZ3RoIC0gMyB8fCBjaCA9PSBtRW5kICYmIG1hcFtpICsgM10gPiBjaCkge1xuICAgICAgICBlbmQgPSBtRW5kIC0gbVN0YXJ0O1xuICAgICAgICBzdGFydCA9IGVuZCAtIDE7XG4gICAgICAgIGlmIChjaCA+PSBtRW5kKSBjb2xsYXBzZSA9IFwicmlnaHRcIjtcbiAgICAgIH1cbiAgICAgIGlmIChzdGFydCAhPSBudWxsKSB7XG4gICAgICAgIG5vZGUgPSBtYXBbaSArIDJdO1xuICAgICAgICBpZiAobVN0YXJ0ID09IG1FbmQgJiYgYmlhcyA9PSAobm9kZS5pbnNlcnRMZWZ0ID8gXCJsZWZ0XCIgOiBcInJpZ2h0XCIpKVxuICAgICAgICAgIGNvbGxhcHNlID0gYmlhcztcbiAgICAgICAgaWYgKGJpYXMgPT0gXCJsZWZ0XCIgJiYgc3RhcnQgPT0gMClcbiAgICAgICAgICB3aGlsZSAoaSAmJiBtYXBbaSAtIDJdID09IG1hcFtpIC0gM10gJiYgbWFwW2kgLSAxXS5pbnNlcnRMZWZ0KSB7XG4gICAgICAgICAgICBub2RlID0gbWFwWyhpIC09IDMpICsgMl07XG4gICAgICAgICAgICBjb2xsYXBzZSA9IFwibGVmdFwiO1xuICAgICAgICAgIH1cbiAgICAgICAgaWYgKGJpYXMgPT0gXCJyaWdodFwiICYmIHN0YXJ0ID09IG1FbmQgLSBtU3RhcnQpXG4gICAgICAgICAgd2hpbGUgKGkgPCBtYXAubGVuZ3RoIC0gMyAmJiBtYXBbaSArIDNdID09IG1hcFtpICsgNF0gJiYgIW1hcFtpICsgNV0uaW5zZXJ0TGVmdCkge1xuICAgICAgICAgICAgbm9kZSA9IG1hcFsoaSArPSAzKSArIDJdO1xuICAgICAgICAgICAgY29sbGFwc2UgPSBcInJpZ2h0XCI7XG4gICAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcmVjdDtcbiAgICBpZiAobm9kZS5ub2RlVHlwZSA9PSAzKSB7IC8vIElmIGl0IGlzIGEgdGV4dCBub2RlLCB1c2UgYSByYW5nZSB0byByZXRyaWV2ZSB0aGUgY29vcmRpbmF0ZXMuXG4gICAgICB3aGlsZSAoc3RhcnQgJiYgaXNFeHRlbmRpbmdDaGFyKHByZXBhcmVkLmxpbmUudGV4dC5jaGFyQXQobVN0YXJ0ICsgc3RhcnQpKSkgLS1zdGFydDtcbiAgICAgIHdoaWxlIChtU3RhcnQgKyBlbmQgPCBtRW5kICYmIGlzRXh0ZW5kaW5nQ2hhcihwcmVwYXJlZC5saW5lLnRleHQuY2hhckF0KG1TdGFydCArIGVuZCkpKSArK2VuZDtcbiAgICAgIGlmIChpZV91cHRvOCAmJiBzdGFydCA9PSAwICYmIGVuZCA9PSBtRW5kIC0gbVN0YXJ0KSB7XG4gICAgICAgIHJlY3QgPSBub2RlLnBhcmVudE5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICB9IGVsc2UgaWYgKGllICYmIGNtLm9wdGlvbnMubGluZVdyYXBwaW5nKSB7XG4gICAgICAgIHZhciByZWN0cyA9IHJhbmdlKG5vZGUsIHN0YXJ0LCBlbmQpLmdldENsaWVudFJlY3RzKCk7XG4gICAgICAgIGlmIChyZWN0cy5sZW5ndGgpXG4gICAgICAgICAgcmVjdCA9IHJlY3RzW2JpYXMgPT0gXCJyaWdodFwiID8gcmVjdHMubGVuZ3RoIC0gMSA6IDBdO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcmVjdCA9IG51bGxSZWN0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVjdCA9IHJhbmdlKG5vZGUsIHN0YXJ0LCBlbmQpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpIHx8IG51bGxSZWN0O1xuICAgICAgfVxuICAgIH0gZWxzZSB7IC8vIElmIGl0IGlzIGEgd2lkZ2V0LCBzaW1wbHkgZ2V0IHRoZSBib3ggZm9yIHRoZSB3aG9sZSB3aWRnZXQuXG4gICAgICBpZiAoc3RhcnQgPiAwKSBjb2xsYXBzZSA9IGJpYXMgPSBcInJpZ2h0XCI7XG4gICAgICB2YXIgcmVjdHM7XG4gICAgICBpZiAoY20ub3B0aW9ucy5saW5lV3JhcHBpbmcgJiYgKHJlY3RzID0gbm9kZS5nZXRDbGllbnRSZWN0cygpKS5sZW5ndGggPiAxKVxuICAgICAgICByZWN0ID0gcmVjdHNbYmlhcyA9PSBcInJpZ2h0XCIgPyByZWN0cy5sZW5ndGggLSAxIDogMF07XG4gICAgICBlbHNlXG4gICAgICAgIHJlY3QgPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIH1cbiAgICBpZiAoaWVfdXB0bzggJiYgIXN0YXJ0ICYmICghcmVjdCB8fCAhcmVjdC5sZWZ0ICYmICFyZWN0LnJpZ2h0KSkge1xuICAgICAgdmFyIHJTcGFuID0gbm9kZS5wYXJlbnROb2RlLmdldENsaWVudFJlY3RzKClbMF07XG4gICAgICBpZiAoclNwYW4pXG4gICAgICAgIHJlY3QgPSB7bGVmdDogclNwYW4ubGVmdCwgcmlnaHQ6IHJTcGFuLmxlZnQgKyBjaGFyV2lkdGgoY20uZGlzcGxheSksIHRvcDogclNwYW4udG9wLCBib3R0b206IHJTcGFuLmJvdHRvbX07XG4gICAgICBlbHNlXG4gICAgICAgIHJlY3QgPSBudWxsUmVjdDtcbiAgICB9XG5cbiAgICB2YXIgdG9wLCBib3QgPSAocmVjdC5ib3R0b20gKyByZWN0LnRvcCkgLyAyIC0gcHJlcGFyZWQucmVjdC50b3A7XG4gICAgdmFyIGhlaWdodHMgPSBwcmVwYXJlZC52aWV3Lm1lYXN1cmUuaGVpZ2h0cztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhlaWdodHMubGVuZ3RoIC0gMTsgaSsrKVxuICAgICAgaWYgKGJvdCA8IGhlaWdodHNbaV0pIGJyZWFrO1xuICAgIHRvcCA9IGkgPyBoZWlnaHRzW2kgLSAxXSA6IDA7IGJvdCA9IGhlaWdodHNbaV07XG4gICAgdmFyIHJlc3VsdCA9IHtsZWZ0OiAoY29sbGFwc2UgPT0gXCJyaWdodFwiID8gcmVjdC5yaWdodCA6IHJlY3QubGVmdCkgLSBwcmVwYXJlZC5yZWN0LmxlZnQsXG4gICAgICAgICAgICAgICAgICByaWdodDogKGNvbGxhcHNlID09IFwibGVmdFwiID8gcmVjdC5sZWZ0IDogcmVjdC5yaWdodCkgLSBwcmVwYXJlZC5yZWN0LmxlZnQsXG4gICAgICAgICAgICAgICAgICB0b3A6IHRvcCwgYm90dG9tOiBib3R9O1xuICAgIGlmICghcmVjdC5sZWZ0ICYmICFyZWN0LnJpZ2h0KSByZXN1bHQuYm9ndXMgPSB0cnVlO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBjbGVhckxpbmVNZWFzdXJlbWVudENhY2hlRm9yKGxpbmVWaWV3KSB7XG4gICAgaWYgKGxpbmVWaWV3Lm1lYXN1cmUpIHtcbiAgICAgIGxpbmVWaWV3Lm1lYXN1cmUuY2FjaGUgPSB7fTtcbiAgICAgIGxpbmVWaWV3Lm1lYXN1cmUuaGVpZ2h0cyA9IG51bGw7XG4gICAgICBpZiAobGluZVZpZXcucmVzdCkgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lVmlldy5yZXN0Lmxlbmd0aDsgaSsrKVxuICAgICAgICBsaW5lVmlldy5tZWFzdXJlLmNhY2hlc1tpXSA9IHt9O1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNsZWFyTGluZU1lYXN1cmVtZW50Q2FjaGUoY20pIHtcbiAgICBjbS5kaXNwbGF5LmV4dGVybmFsTWVhc3VyZSA9IG51bGw7XG4gICAgcmVtb3ZlQ2hpbGRyZW4oY20uZGlzcGxheS5saW5lTWVhc3VyZSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbS5kaXNwbGF5LnZpZXcubGVuZ3RoOyBpKyspXG4gICAgICBjbGVhckxpbmVNZWFzdXJlbWVudENhY2hlRm9yKGNtLmRpc3BsYXkudmlld1tpXSk7XG4gIH1cblxuICBmdW5jdGlvbiBjbGVhckNhY2hlcyhjbSkge1xuICAgIGNsZWFyTGluZU1lYXN1cmVtZW50Q2FjaGUoY20pO1xuICAgIGNtLmRpc3BsYXkuY2FjaGVkQ2hhcldpZHRoID0gY20uZGlzcGxheS5jYWNoZWRUZXh0SGVpZ2h0ID0gY20uZGlzcGxheS5jYWNoZWRQYWRkaW5nSCA9IG51bGw7XG4gICAgaWYgKCFjbS5vcHRpb25zLmxpbmVXcmFwcGluZykgY20uZGlzcGxheS5tYXhMaW5lQ2hhbmdlZCA9IHRydWU7XG4gICAgY20uZGlzcGxheS5saW5lTnVtQ2hhcnMgPSBudWxsO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFnZVNjcm9sbFgoKSB7IHJldHVybiB3aW5kb3cucGFnZVhPZmZzZXQgfHwgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5KS5zY3JvbGxMZWZ0OyB9XG4gIGZ1bmN0aW9uIHBhZ2VTY3JvbGxZKCkgeyByZXR1cm4gd2luZG93LnBhZ2VZT2Zmc2V0IHx8IChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keSkuc2Nyb2xsVG9wOyB9XG5cbiAgLy8gQ29udmVydHMgYSB7dG9wLCBib3R0b20sIGxlZnQsIHJpZ2h0fSBib3ggZnJvbSBsaW5lLWxvY2FsXG4gIC8vIGNvb3JkaW5hdGVzIGludG8gYW5vdGhlciBjb29yZGluYXRlIHN5c3RlbS4gQ29udGV4dCBtYXkgYmUgb25lIG9mXG4gIC8vIFwibGluZVwiLCBcImRpdlwiIChkaXNwbGF5LmxpbmVEaXYpLCBcImxvY2FsXCIvbnVsbCAoZWRpdG9yKSwgb3IgXCJwYWdlXCIuXG4gIGZ1bmN0aW9uIGludG9Db29yZFN5c3RlbShjbSwgbGluZU9iaiwgcmVjdCwgY29udGV4dCkge1xuICAgIGlmIChsaW5lT2JqLndpZGdldHMpIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZU9iai53aWRnZXRzLmxlbmd0aDsgKytpKSBpZiAobGluZU9iai53aWRnZXRzW2ldLmFib3ZlKSB7XG4gICAgICB2YXIgc2l6ZSA9IHdpZGdldEhlaWdodChsaW5lT2JqLndpZGdldHNbaV0pO1xuICAgICAgcmVjdC50b3AgKz0gc2l6ZTsgcmVjdC5ib3R0b20gKz0gc2l6ZTtcbiAgICB9XG4gICAgaWYgKGNvbnRleHQgPT0gXCJsaW5lXCIpIHJldHVybiByZWN0O1xuICAgIGlmICghY29udGV4dCkgY29udGV4dCA9IFwibG9jYWxcIjtcbiAgICB2YXIgeU9mZiA9IGhlaWdodEF0TGluZShsaW5lT2JqKTtcbiAgICBpZiAoY29udGV4dCA9PSBcImxvY2FsXCIpIHlPZmYgKz0gcGFkZGluZ1RvcChjbS5kaXNwbGF5KTtcbiAgICBlbHNlIHlPZmYgLT0gY20uZGlzcGxheS52aWV3T2Zmc2V0O1xuICAgIGlmIChjb250ZXh0ID09IFwicGFnZVwiIHx8IGNvbnRleHQgPT0gXCJ3aW5kb3dcIikge1xuICAgICAgdmFyIGxPZmYgPSBjbS5kaXNwbGF5LmxpbmVTcGFjZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIHlPZmYgKz0gbE9mZi50b3AgKyAoY29udGV4dCA9PSBcIndpbmRvd1wiID8gMCA6IHBhZ2VTY3JvbGxZKCkpO1xuICAgICAgdmFyIHhPZmYgPSBsT2ZmLmxlZnQgKyAoY29udGV4dCA9PSBcIndpbmRvd1wiID8gMCA6IHBhZ2VTY3JvbGxYKCkpO1xuICAgICAgcmVjdC5sZWZ0ICs9IHhPZmY7IHJlY3QucmlnaHQgKz0geE9mZjtcbiAgICB9XG4gICAgcmVjdC50b3AgKz0geU9mZjsgcmVjdC5ib3R0b20gKz0geU9mZjtcbiAgICByZXR1cm4gcmVjdDtcbiAgfVxuXG4gIC8vIENvdmVydHMgYSBib3ggZnJvbSBcImRpdlwiIGNvb3JkcyB0byBhbm90aGVyIGNvb3JkaW5hdGUgc3lzdGVtLlxuICAvLyBDb250ZXh0IG1heSBiZSBcIndpbmRvd1wiLCBcInBhZ2VcIiwgXCJkaXZcIiwgb3IgXCJsb2NhbFwiL251bGwuXG4gIGZ1bmN0aW9uIGZyb21Db29yZFN5c3RlbShjbSwgY29vcmRzLCBjb250ZXh0KSB7XG4gICAgaWYgKGNvbnRleHQgPT0gXCJkaXZcIikgcmV0dXJuIGNvb3JkcztcbiAgICB2YXIgbGVmdCA9IGNvb3Jkcy5sZWZ0LCB0b3AgPSBjb29yZHMudG9wO1xuICAgIC8vIEZpcnN0IG1vdmUgaW50byBcInBhZ2VcIiBjb29yZGluYXRlIHN5c3RlbVxuICAgIGlmIChjb250ZXh0ID09IFwicGFnZVwiKSB7XG4gICAgICBsZWZ0IC09IHBhZ2VTY3JvbGxYKCk7XG4gICAgICB0b3AgLT0gcGFnZVNjcm9sbFkoKTtcbiAgICB9IGVsc2UgaWYgKGNvbnRleHQgPT0gXCJsb2NhbFwiIHx8ICFjb250ZXh0KSB7XG4gICAgICB2YXIgbG9jYWxCb3ggPSBjbS5kaXNwbGF5LnNpemVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgbGVmdCArPSBsb2NhbEJveC5sZWZ0O1xuICAgICAgdG9wICs9IGxvY2FsQm94LnRvcDtcbiAgICB9XG5cbiAgICB2YXIgbGluZVNwYWNlQm94ID0gY20uZGlzcGxheS5saW5lU3BhY2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgcmV0dXJuIHtsZWZ0OiBsZWZ0IC0gbGluZVNwYWNlQm94LmxlZnQsIHRvcDogdG9wIC0gbGluZVNwYWNlQm94LnRvcH07XG4gIH1cblxuICBmdW5jdGlvbiBjaGFyQ29vcmRzKGNtLCBwb3MsIGNvbnRleHQsIGxpbmVPYmosIGJpYXMpIHtcbiAgICBpZiAoIWxpbmVPYmopIGxpbmVPYmogPSBnZXRMaW5lKGNtLmRvYywgcG9zLmxpbmUpO1xuICAgIHJldHVybiBpbnRvQ29vcmRTeXN0ZW0oY20sIGxpbmVPYmosIG1lYXN1cmVDaGFyKGNtLCBsaW5lT2JqLCBwb3MuY2gsIGJpYXMpLCBjb250ZXh0KTtcbiAgfVxuXG4gIC8vIFJldHVybnMgYSBib3ggZm9yIGEgZ2l2ZW4gY3Vyc29yIHBvc2l0aW9uLCB3aGljaCBtYXkgaGF2ZSBhblxuICAvLyAnb3RoZXInIHByb3BlcnR5IGNvbnRhaW5pbmcgdGhlIHBvc2l0aW9uIG9mIHRoZSBzZWNvbmRhcnkgY3Vyc29yXG4gIC8vIG9uIGEgYmlkaSBib3VuZGFyeS5cbiAgZnVuY3Rpb24gY3Vyc29yQ29vcmRzKGNtLCBwb3MsIGNvbnRleHQsIGxpbmVPYmosIHByZXBhcmVkTWVhc3VyZSkge1xuICAgIGxpbmVPYmogPSBsaW5lT2JqIHx8IGdldExpbmUoY20uZG9jLCBwb3MubGluZSk7XG4gICAgaWYgKCFwcmVwYXJlZE1lYXN1cmUpIHByZXBhcmVkTWVhc3VyZSA9IHByZXBhcmVNZWFzdXJlRm9yTGluZShjbSwgbGluZU9iaik7XG4gICAgZnVuY3Rpb24gZ2V0KGNoLCByaWdodCkge1xuICAgICAgdmFyIG0gPSBtZWFzdXJlQ2hhclByZXBhcmVkKGNtLCBwcmVwYXJlZE1lYXN1cmUsIGNoLCByaWdodCA/IFwicmlnaHRcIiA6IFwibGVmdFwiKTtcbiAgICAgIGlmIChyaWdodCkgbS5sZWZ0ID0gbS5yaWdodDsgZWxzZSBtLnJpZ2h0ID0gbS5sZWZ0O1xuICAgICAgcmV0dXJuIGludG9Db29yZFN5c3RlbShjbSwgbGluZU9iaiwgbSwgY29udGV4dCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdldEJpZGkoY2gsIHBhcnRQb3MpIHtcbiAgICAgIHZhciBwYXJ0ID0gb3JkZXJbcGFydFBvc10sIHJpZ2h0ID0gcGFydC5sZXZlbCAlIDI7XG4gICAgICBpZiAoY2ggPT0gYmlkaUxlZnQocGFydCkgJiYgcGFydFBvcyAmJiBwYXJ0LmxldmVsIDwgb3JkZXJbcGFydFBvcyAtIDFdLmxldmVsKSB7XG4gICAgICAgIHBhcnQgPSBvcmRlclstLXBhcnRQb3NdO1xuICAgICAgICBjaCA9IGJpZGlSaWdodChwYXJ0KSAtIChwYXJ0LmxldmVsICUgMiA/IDAgOiAxKTtcbiAgICAgICAgcmlnaHQgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChjaCA9PSBiaWRpUmlnaHQocGFydCkgJiYgcGFydFBvcyA8IG9yZGVyLmxlbmd0aCAtIDEgJiYgcGFydC5sZXZlbCA8IG9yZGVyW3BhcnRQb3MgKyAxXS5sZXZlbCkge1xuICAgICAgICBwYXJ0ID0gb3JkZXJbKytwYXJ0UG9zXTtcbiAgICAgICAgY2ggPSBiaWRpTGVmdChwYXJ0KSAtIHBhcnQubGV2ZWwgJSAyO1xuICAgICAgICByaWdodCA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKHJpZ2h0ICYmIGNoID09IHBhcnQudG8gJiYgY2ggPiBwYXJ0LmZyb20pIHJldHVybiBnZXQoY2ggLSAxKTtcbiAgICAgIHJldHVybiBnZXQoY2gsIHJpZ2h0KTtcbiAgICB9XG4gICAgdmFyIG9yZGVyID0gZ2V0T3JkZXIobGluZU9iaiksIGNoID0gcG9zLmNoO1xuICAgIGlmICghb3JkZXIpIHJldHVybiBnZXQoY2gpO1xuICAgIHZhciBwYXJ0UG9zID0gZ2V0QmlkaVBhcnRBdChvcmRlciwgY2gpO1xuICAgIHZhciB2YWwgPSBnZXRCaWRpKGNoLCBwYXJ0UG9zKTtcbiAgICBpZiAoYmlkaU90aGVyICE9IG51bGwpIHZhbC5vdGhlciA9IGdldEJpZGkoY2gsIGJpZGlPdGhlcik7XG4gICAgcmV0dXJuIHZhbDtcbiAgfVxuXG4gIC8vIFVzZWQgdG8gY2hlYXBseSBlc3RpbWF0ZSB0aGUgY29vcmRpbmF0ZXMgZm9yIGEgcG9zaXRpb24uIFVzZWQgZm9yXG4gIC8vIGludGVybWVkaWF0ZSBzY3JvbGwgdXBkYXRlcy5cbiAgZnVuY3Rpb24gZXN0aW1hdGVDb29yZHMoY20sIHBvcykge1xuICAgIHZhciBsZWZ0ID0gMCwgcG9zID0gY2xpcFBvcyhjbS5kb2MsIHBvcyk7XG4gICAgaWYgKCFjbS5vcHRpb25zLmxpbmVXcmFwcGluZykgbGVmdCA9IGNoYXJXaWR0aChjbS5kaXNwbGF5KSAqIHBvcy5jaDtcbiAgICB2YXIgbGluZU9iaiA9IGdldExpbmUoY20uZG9jLCBwb3MubGluZSk7XG4gICAgdmFyIHRvcCA9IGhlaWdodEF0TGluZShsaW5lT2JqKSArIHBhZGRpbmdUb3AoY20uZGlzcGxheSk7XG4gICAgcmV0dXJuIHtsZWZ0OiBsZWZ0LCByaWdodDogbGVmdCwgdG9wOiB0b3AsIGJvdHRvbTogdG9wICsgbGluZU9iai5oZWlnaHR9O1xuICB9XG5cbiAgLy8gUG9zaXRpb25zIHJldHVybmVkIGJ5IGNvb3Jkc0NoYXIgY29udGFpbiBzb21lIGV4dHJhIGluZm9ybWF0aW9uLlxuICAvLyB4UmVsIGlzIHRoZSByZWxhdGl2ZSB4IHBvc2l0aW9uIG9mIHRoZSBpbnB1dCBjb29yZGluYXRlcyBjb21wYXJlZFxuICAvLyB0byB0aGUgZm91bmQgcG9zaXRpb24gKHNvIHhSZWwgPiAwIG1lYW5zIHRoZSBjb29yZGluYXRlcyBhcmUgdG9cbiAgLy8gdGhlIHJpZ2h0IG9mIHRoZSBjaGFyYWN0ZXIgcG9zaXRpb24sIGZvciBleGFtcGxlKS4gV2hlbiBvdXRzaWRlXG4gIC8vIGlzIHRydWUsIHRoYXQgbWVhbnMgdGhlIGNvb3JkaW5hdGVzIGxpZSBvdXRzaWRlIHRoZSBsaW5lJ3NcbiAgLy8gdmVydGljYWwgcmFuZ2UuXG4gIGZ1bmN0aW9uIFBvc1dpdGhJbmZvKGxpbmUsIGNoLCBvdXRzaWRlLCB4UmVsKSB7XG4gICAgdmFyIHBvcyA9IFBvcyhsaW5lLCBjaCk7XG4gICAgcG9zLnhSZWwgPSB4UmVsO1xuICAgIGlmIChvdXRzaWRlKSBwb3Mub3V0c2lkZSA9IHRydWU7XG4gICAgcmV0dXJuIHBvcztcbiAgfVxuXG4gIC8vIENvbXB1dGUgdGhlIGNoYXJhY3RlciBwb3NpdGlvbiBjbG9zZXN0IHRvIHRoZSBnaXZlbiBjb29yZGluYXRlcy5cbiAgLy8gSW5wdXQgbXVzdCBiZSBsaW5lU3BhY2UtbG9jYWwgKFwiZGl2XCIgY29vcmRpbmF0ZSBzeXN0ZW0pLlxuICBmdW5jdGlvbiBjb29yZHNDaGFyKGNtLCB4LCB5KSB7XG4gICAgdmFyIGRvYyA9IGNtLmRvYztcbiAgICB5ICs9IGNtLmRpc3BsYXkudmlld09mZnNldDtcbiAgICBpZiAoeSA8IDApIHJldHVybiBQb3NXaXRoSW5mbyhkb2MuZmlyc3QsIDAsIHRydWUsIC0xKTtcbiAgICB2YXIgbGluZU4gPSBsaW5lQXRIZWlnaHQoZG9jLCB5KSwgbGFzdCA9IGRvYy5maXJzdCArIGRvYy5zaXplIC0gMTtcbiAgICBpZiAobGluZU4gPiBsYXN0KVxuICAgICAgcmV0dXJuIFBvc1dpdGhJbmZvKGRvYy5maXJzdCArIGRvYy5zaXplIC0gMSwgZ2V0TGluZShkb2MsIGxhc3QpLnRleHQubGVuZ3RoLCB0cnVlLCAxKTtcbiAgICBpZiAoeCA8IDApIHggPSAwO1xuXG4gICAgdmFyIGxpbmVPYmogPSBnZXRMaW5lKGRvYywgbGluZU4pO1xuICAgIGZvciAoOzspIHtcbiAgICAgIHZhciBmb3VuZCA9IGNvb3Jkc0NoYXJJbm5lcihjbSwgbGluZU9iaiwgbGluZU4sIHgsIHkpO1xuICAgICAgdmFyIG1lcmdlZCA9IGNvbGxhcHNlZFNwYW5BdEVuZChsaW5lT2JqKTtcbiAgICAgIHZhciBtZXJnZWRQb3MgPSBtZXJnZWQgJiYgbWVyZ2VkLmZpbmQoMCwgdHJ1ZSk7XG4gICAgICBpZiAobWVyZ2VkICYmIChmb3VuZC5jaCA+IG1lcmdlZFBvcy5mcm9tLmNoIHx8IGZvdW5kLmNoID09IG1lcmdlZFBvcy5mcm9tLmNoICYmIGZvdW5kLnhSZWwgPiAwKSlcbiAgICAgICAgbGluZU4gPSBsaW5lTm8obGluZU9iaiA9IG1lcmdlZFBvcy50by5saW5lKTtcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNvb3Jkc0NoYXJJbm5lcihjbSwgbGluZU9iaiwgbGluZU5vLCB4LCB5KSB7XG4gICAgdmFyIGlubmVyT2ZmID0geSAtIGhlaWdodEF0TGluZShsaW5lT2JqKTtcbiAgICB2YXIgd3JvbmdMaW5lID0gZmFsc2UsIGFkanVzdCA9IDIgKiBjbS5kaXNwbGF5LndyYXBwZXIuY2xpZW50V2lkdGg7XG4gICAgdmFyIHByZXBhcmVkTWVhc3VyZSA9IHByZXBhcmVNZWFzdXJlRm9yTGluZShjbSwgbGluZU9iaik7XG5cbiAgICBmdW5jdGlvbiBnZXRYKGNoKSB7XG4gICAgICB2YXIgc3AgPSBjdXJzb3JDb29yZHMoY20sIFBvcyhsaW5lTm8sIGNoKSwgXCJsaW5lXCIsIGxpbmVPYmosIHByZXBhcmVkTWVhc3VyZSk7XG4gICAgICB3cm9uZ0xpbmUgPSB0cnVlO1xuICAgICAgaWYgKGlubmVyT2ZmID4gc3AuYm90dG9tKSByZXR1cm4gc3AubGVmdCAtIGFkanVzdDtcbiAgICAgIGVsc2UgaWYgKGlubmVyT2ZmIDwgc3AudG9wKSByZXR1cm4gc3AubGVmdCArIGFkanVzdDtcbiAgICAgIGVsc2Ugd3JvbmdMaW5lID0gZmFsc2U7XG4gICAgICByZXR1cm4gc3AubGVmdDtcbiAgICB9XG5cbiAgICB2YXIgYmlkaSA9IGdldE9yZGVyKGxpbmVPYmopLCBkaXN0ID0gbGluZU9iai50ZXh0Lmxlbmd0aDtcbiAgICB2YXIgZnJvbSA9IGxpbmVMZWZ0KGxpbmVPYmopLCB0byA9IGxpbmVSaWdodChsaW5lT2JqKTtcbiAgICB2YXIgZnJvbVggPSBnZXRYKGZyb20pLCBmcm9tT3V0c2lkZSA9IHdyb25nTGluZSwgdG9YID0gZ2V0WCh0byksIHRvT3V0c2lkZSA9IHdyb25nTGluZTtcblxuICAgIGlmICh4ID4gdG9YKSByZXR1cm4gUG9zV2l0aEluZm8obGluZU5vLCB0bywgdG9PdXRzaWRlLCAxKTtcbiAgICAvLyBEbyBhIGJpbmFyeSBzZWFyY2ggYmV0d2VlbiB0aGVzZSBib3VuZHMuXG4gICAgZm9yICg7Oykge1xuICAgICAgaWYgKGJpZGkgPyB0byA9PSBmcm9tIHx8IHRvID09IG1vdmVWaXN1YWxseShsaW5lT2JqLCBmcm9tLCAxKSA6IHRvIC0gZnJvbSA8PSAxKSB7XG4gICAgICAgIHZhciBjaCA9IHggPCBmcm9tWCB8fCB4IC0gZnJvbVggPD0gdG9YIC0geCA/IGZyb20gOiB0bztcbiAgICAgICAgdmFyIHhEaWZmID0geCAtIChjaCA9PSBmcm9tID8gZnJvbVggOiB0b1gpO1xuICAgICAgICB3aGlsZSAoaXNFeHRlbmRpbmdDaGFyKGxpbmVPYmoudGV4dC5jaGFyQXQoY2gpKSkgKytjaDtcbiAgICAgICAgdmFyIHBvcyA9IFBvc1dpdGhJbmZvKGxpbmVObywgY2gsIGNoID09IGZyb20gPyBmcm9tT3V0c2lkZSA6IHRvT3V0c2lkZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhEaWZmIDwgLTEgPyAtMSA6IHhEaWZmID4gMSA/IDEgOiAwKTtcbiAgICAgICAgcmV0dXJuIHBvcztcbiAgICAgIH1cbiAgICAgIHZhciBzdGVwID0gTWF0aC5jZWlsKGRpc3QgLyAyKSwgbWlkZGxlID0gZnJvbSArIHN0ZXA7XG4gICAgICBpZiAoYmlkaSkge1xuICAgICAgICBtaWRkbGUgPSBmcm9tO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ZXA7ICsraSkgbWlkZGxlID0gbW92ZVZpc3VhbGx5KGxpbmVPYmosIG1pZGRsZSwgMSk7XG4gICAgICB9XG4gICAgICB2YXIgbWlkZGxlWCA9IGdldFgobWlkZGxlKTtcbiAgICAgIGlmIChtaWRkbGVYID4geCkge3RvID0gbWlkZGxlOyB0b1ggPSBtaWRkbGVYOyBpZiAodG9PdXRzaWRlID0gd3JvbmdMaW5lKSB0b1ggKz0gMTAwMDsgZGlzdCA9IHN0ZXA7fVxuICAgICAgZWxzZSB7ZnJvbSA9IG1pZGRsZTsgZnJvbVggPSBtaWRkbGVYOyBmcm9tT3V0c2lkZSA9IHdyb25nTGluZTsgZGlzdCAtPSBzdGVwO31cbiAgICB9XG4gIH1cblxuICB2YXIgbWVhc3VyZVRleHQ7XG4gIC8vIENvbXB1dGUgdGhlIGRlZmF1bHQgdGV4dCBoZWlnaHQuXG4gIGZ1bmN0aW9uIHRleHRIZWlnaHQoZGlzcGxheSkge1xuICAgIGlmIChkaXNwbGF5LmNhY2hlZFRleHRIZWlnaHQgIT0gbnVsbCkgcmV0dXJuIGRpc3BsYXkuY2FjaGVkVGV4dEhlaWdodDtcbiAgICBpZiAobWVhc3VyZVRleHQgPT0gbnVsbCkge1xuICAgICAgbWVhc3VyZVRleHQgPSBlbHQoXCJwcmVcIik7XG4gICAgICAvLyBNZWFzdXJlIGEgYnVuY2ggb2YgbGluZXMsIGZvciBicm93c2VycyB0aGF0IGNvbXB1dGVcbiAgICAgIC8vIGZyYWN0aW9uYWwgaGVpZ2h0cy5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDk7ICsraSkge1xuICAgICAgICBtZWFzdXJlVGV4dC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcInhcIikpO1xuICAgICAgICBtZWFzdXJlVGV4dC5hcHBlbmRDaGlsZChlbHQoXCJiclwiKSk7XG4gICAgICB9XG4gICAgICBtZWFzdXJlVGV4dC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcInhcIikpO1xuICAgIH1cbiAgICByZW1vdmVDaGlsZHJlbkFuZEFkZChkaXNwbGF5Lm1lYXN1cmUsIG1lYXN1cmVUZXh0KTtcbiAgICB2YXIgaGVpZ2h0ID0gbWVhc3VyZVRleHQub2Zmc2V0SGVpZ2h0IC8gNTA7XG4gICAgaWYgKGhlaWdodCA+IDMpIGRpc3BsYXkuY2FjaGVkVGV4dEhlaWdodCA9IGhlaWdodDtcbiAgICByZW1vdmVDaGlsZHJlbihkaXNwbGF5Lm1lYXN1cmUpO1xuICAgIHJldHVybiBoZWlnaHQgfHwgMTtcbiAgfVxuXG4gIC8vIENvbXB1dGUgdGhlIGRlZmF1bHQgY2hhcmFjdGVyIHdpZHRoLlxuICBmdW5jdGlvbiBjaGFyV2lkdGgoZGlzcGxheSkge1xuICAgIGlmIChkaXNwbGF5LmNhY2hlZENoYXJXaWR0aCAhPSBudWxsKSByZXR1cm4gZGlzcGxheS5jYWNoZWRDaGFyV2lkdGg7XG4gICAgdmFyIGFuY2hvciA9IGVsdChcInNwYW5cIiwgXCJ4eHh4eHh4eHh4XCIpO1xuICAgIHZhciBwcmUgPSBlbHQoXCJwcmVcIiwgW2FuY2hvcl0pO1xuICAgIHJlbW92ZUNoaWxkcmVuQW5kQWRkKGRpc3BsYXkubWVhc3VyZSwgcHJlKTtcbiAgICB2YXIgcmVjdCA9IGFuY2hvci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSwgd2lkdGggPSAocmVjdC5yaWdodCAtIHJlY3QubGVmdCkgLyAxMDtcbiAgICBpZiAod2lkdGggPiAyKSBkaXNwbGF5LmNhY2hlZENoYXJXaWR0aCA9IHdpZHRoO1xuICAgIHJldHVybiB3aWR0aCB8fCAxMDtcbiAgfVxuXG4gIC8vIE9QRVJBVElPTlNcblxuICAvLyBPcGVyYXRpb25zIGFyZSB1c2VkIHRvIHdyYXAgYSBzZXJpZXMgb2YgY2hhbmdlcyB0byB0aGUgZWRpdG9yXG4gIC8vIHN0YXRlIGluIHN1Y2ggYSB3YXkgdGhhdCBlYWNoIGNoYW5nZSB3b24ndCBoYXZlIHRvIHVwZGF0ZSB0aGVcbiAgLy8gY3Vyc29yIGFuZCBkaXNwbGF5ICh3aGljaCB3b3VsZCBiZSBhd2t3YXJkLCBzbG93LCBhbmRcbiAgLy8gZXJyb3ItcHJvbmUpLiBJbnN0ZWFkLCBkaXNwbGF5IHVwZGF0ZXMgYXJlIGJhdGNoZWQgYW5kIHRoZW4gYWxsXG4gIC8vIGNvbWJpbmVkIGFuZCBleGVjdXRlZCBhdCBvbmNlLlxuXG4gIHZhciBuZXh0T3BJZCA9IDA7XG4gIC8vIFN0YXJ0IGEgbmV3IG9wZXJhdGlvbi5cbiAgZnVuY3Rpb24gc3RhcnRPcGVyYXRpb24oY20pIHtcbiAgICBjbS5jdXJPcCA9IHtcbiAgICAgIHZpZXdDaGFuZ2VkOiBmYWxzZSwgICAgICAvLyBGbGFnIHRoYXQgaW5kaWNhdGVzIHRoYXQgbGluZXMgbWlnaHQgbmVlZCB0byBiZSByZWRyYXduXG4gICAgICBzdGFydEhlaWdodDogY20uZG9jLmhlaWdodCwgLy8gVXNlZCB0byBkZXRlY3QgbmVlZCB0byB1cGRhdGUgc2Nyb2xsYmFyXG4gICAgICBmb3JjZVVwZGF0ZTogZmFsc2UsICAgICAgLy8gVXNlZCB0byBmb3JjZSBhIHJlZHJhd1xuICAgICAgdXBkYXRlSW5wdXQ6IG51bGwsICAgICAgIC8vIFdoZXRoZXIgdG8gcmVzZXQgdGhlIGlucHV0IHRleHRhcmVhXG4gICAgICB0eXBpbmc6IGZhbHNlLCAgICAgICAgICAgLy8gV2hldGhlciB0aGlzIHJlc2V0IHNob3VsZCBiZSBjYXJlZnVsIHRvIGxlYXZlIGV4aXN0aW5nIHRleHQgKGZvciBjb21wb3NpdGluZylcbiAgICAgIGNoYW5nZU9ianM6IG51bGwsICAgICAgICAvLyBBY2N1bXVsYXRlZCBjaGFuZ2VzLCBmb3IgZmlyaW5nIGNoYW5nZSBldmVudHNcbiAgICAgIGN1cnNvckFjdGl2aXR5SGFuZGxlcnM6IG51bGwsIC8vIFNldCBvZiBoYW5kbGVycyB0byBmaXJlIGN1cnNvckFjdGl2aXR5IG9uXG4gICAgICBzZWxlY3Rpb25DaGFuZ2VkOiBmYWxzZSwgLy8gV2hldGhlciB0aGUgc2VsZWN0aW9uIG5lZWRzIHRvIGJlIHJlZHJhd25cbiAgICAgIHVwZGF0ZU1heExpbmU6IGZhbHNlLCAgICAvLyBTZXQgd2hlbiB0aGUgd2lkZXN0IGxpbmUgbmVlZHMgdG8gYmUgZGV0ZXJtaW5lZCBhbmV3XG4gICAgICBzY3JvbGxMZWZ0OiBudWxsLCBzY3JvbGxUb3A6IG51bGwsIC8vIEludGVybWVkaWF0ZSBzY3JvbGwgcG9zaXRpb24sIG5vdCBwdXNoZWQgdG8gRE9NIHlldFxuICAgICAgc2Nyb2xsVG9Qb3M6IG51bGwsICAgICAgIC8vIFVzZWQgdG8gc2Nyb2xsIHRvIGEgc3BlY2lmaWMgcG9zaXRpb25cbiAgICAgIGlkOiArK25leHRPcElkICAgICAgICAgICAvLyBVbmlxdWUgSURcbiAgICB9O1xuICAgIGlmICghZGVsYXllZENhbGxiYWNrRGVwdGgrKykgZGVsYXllZENhbGxiYWNrcyA9IFtdO1xuICB9XG5cbiAgLy8gRmluaXNoIGFuIG9wZXJhdGlvbiwgdXBkYXRpbmcgdGhlIGRpc3BsYXkgYW5kIHNpZ25hbGxpbmcgZGVsYXllZCBldmVudHNcbiAgZnVuY3Rpb24gZW5kT3BlcmF0aW9uKGNtKSB7XG4gICAgdmFyIG9wID0gY20uY3VyT3AsIGRvYyA9IGNtLmRvYywgZGlzcGxheSA9IGNtLmRpc3BsYXk7XG4gICAgY20uY3VyT3AgPSBudWxsO1xuXG4gICAgaWYgKG9wLnVwZGF0ZU1heExpbmUpIGZpbmRNYXhMaW5lKGNtKTtcblxuICAgIC8vIElmIGl0IGxvb2tzIGxpa2UgYW4gdXBkYXRlIG1pZ2h0IGJlIG5lZWRlZCwgY2FsbCB1cGRhdGVEaXNwbGF5XG4gICAgaWYgKG9wLnZpZXdDaGFuZ2VkIHx8IG9wLmZvcmNlVXBkYXRlIHx8IG9wLnNjcm9sbFRvcCAhPSBudWxsIHx8XG4gICAgICAgIG9wLnNjcm9sbFRvUG9zICYmIChvcC5zY3JvbGxUb1Bvcy5mcm9tLmxpbmUgPCBkaXNwbGF5LnZpZXdGcm9tIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBvcC5zY3JvbGxUb1Bvcy50by5saW5lID49IGRpc3BsYXkudmlld1RvKSB8fFxuICAgICAgICBkaXNwbGF5Lm1heExpbmVDaGFuZ2VkICYmIGNtLm9wdGlvbnMubGluZVdyYXBwaW5nKSB7XG4gICAgICB2YXIgdXBkYXRlZCA9IHVwZGF0ZURpc3BsYXkoY20sIHt0b3A6IG9wLnNjcm9sbFRvcCwgZW5zdXJlOiBvcC5zY3JvbGxUb1Bvc30sIG9wLmZvcmNlVXBkYXRlKTtcbiAgICAgIGlmIChjbS5kaXNwbGF5LnNjcm9sbGVyLm9mZnNldEhlaWdodCkgY20uZG9jLnNjcm9sbFRvcCA9IGNtLmRpc3BsYXkuc2Nyb2xsZXIuc2Nyb2xsVG9wO1xuICAgIH1cbiAgICAvLyBJZiBubyB1cGRhdGUgd2FzIHJ1biwgYnV0IHRoZSBzZWxlY3Rpb24gY2hhbmdlZCwgcmVkcmF3IHRoYXQuXG4gICAgaWYgKCF1cGRhdGVkICYmIG9wLnNlbGVjdGlvbkNoYW5nZWQpIHVwZGF0ZVNlbGVjdGlvbihjbSk7XG4gICAgaWYgKCF1cGRhdGVkICYmIG9wLnN0YXJ0SGVpZ2h0ICE9IGNtLmRvYy5oZWlnaHQpIHVwZGF0ZVNjcm9sbGJhcnMoY20pO1xuXG4gICAgLy8gQWJvcnQgbW91c2Ugd2hlZWwgZGVsdGEgbWVhc3VyZW1lbnQsIHdoZW4gc2Nyb2xsaW5nIGV4cGxpY2l0bHlcbiAgICBpZiAoZGlzcGxheS53aGVlbFN0YXJ0WCAhPSBudWxsICYmIChvcC5zY3JvbGxUb3AgIT0gbnVsbCB8fCBvcC5zY3JvbGxMZWZ0ICE9IG51bGwgfHwgb3Auc2Nyb2xsVG9Qb3MpKVxuICAgICAgZGlzcGxheS53aGVlbFN0YXJ0WCA9IGRpc3BsYXkud2hlZWxTdGFydFkgPSBudWxsO1xuXG4gICAgLy8gUHJvcGFnYXRlIHRoZSBzY3JvbGwgcG9zaXRpb24gdG8gdGhlIGFjdHVhbCBET00gc2Nyb2xsZXJcbiAgICBpZiAob3Auc2Nyb2xsVG9wICE9IG51bGwgJiYgZGlzcGxheS5zY3JvbGxlci5zY3JvbGxUb3AgIT0gb3Auc2Nyb2xsVG9wKSB7XG4gICAgICB2YXIgdG9wID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oZGlzcGxheS5zY3JvbGxlci5zY3JvbGxIZWlnaHQgLSBkaXNwbGF5LnNjcm9sbGVyLmNsaWVudEhlaWdodCwgb3Auc2Nyb2xsVG9wKSk7XG4gICAgICBkaXNwbGF5LnNjcm9sbGVyLnNjcm9sbFRvcCA9IGRpc3BsYXkuc2Nyb2xsYmFyVi5zY3JvbGxUb3AgPSBkb2Muc2Nyb2xsVG9wID0gdG9wO1xuICAgIH1cbiAgICBpZiAob3Auc2Nyb2xsTGVmdCAhPSBudWxsICYmIGRpc3BsYXkuc2Nyb2xsZXIuc2Nyb2xsTGVmdCAhPSBvcC5zY3JvbGxMZWZ0KSB7XG4gICAgICB2YXIgbGVmdCA9IE1hdGgubWF4KDAsIE1hdGgubWluKGRpc3BsYXkuc2Nyb2xsZXIuc2Nyb2xsV2lkdGggLSBkaXNwbGF5LnNjcm9sbGVyLmNsaWVudFdpZHRoLCBvcC5zY3JvbGxMZWZ0KSk7XG4gICAgICBkaXNwbGF5LnNjcm9sbGVyLnNjcm9sbExlZnQgPSBkaXNwbGF5LnNjcm9sbGJhckguc2Nyb2xsTGVmdCA9IGRvYy5zY3JvbGxMZWZ0ID0gbGVmdDtcbiAgICAgIGFsaWduSG9yaXpvbnRhbGx5KGNtKTtcbiAgICB9XG4gICAgLy8gSWYgd2UgbmVlZCB0byBzY3JvbGwgYSBzcGVjaWZpYyBwb3NpdGlvbiBpbnRvIHZpZXcsIGRvIHNvLlxuICAgIGlmIChvcC5zY3JvbGxUb1Bvcykge1xuICAgICAgdmFyIGNvb3JkcyA9IHNjcm9sbFBvc0ludG9WaWV3KGNtLCBjbGlwUG9zKGNtLmRvYywgb3Auc2Nyb2xsVG9Qb3MuZnJvbSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpcFBvcyhjbS5kb2MsIG9wLnNjcm9sbFRvUG9zLnRvKSwgb3Auc2Nyb2xsVG9Qb3MubWFyZ2luKTtcbiAgICAgIGlmIChvcC5zY3JvbGxUb1Bvcy5pc0N1cnNvciAmJiBjbS5zdGF0ZS5mb2N1c2VkKSBtYXliZVNjcm9sbFdpbmRvdyhjbSwgY29vcmRzKTtcbiAgICB9XG5cbiAgICBpZiAob3Auc2VsZWN0aW9uQ2hhbmdlZCkgcmVzdGFydEJsaW5rKGNtKTtcblxuICAgIGlmIChjbS5zdGF0ZS5mb2N1c2VkICYmIG9wLnVwZGF0ZUlucHV0KVxuICAgICAgcmVzZXRJbnB1dChjbSwgb3AudHlwaW5nKTtcblxuICAgIC8vIEZpcmUgZXZlbnRzIGZvciBtYXJrZXJzIHRoYXQgYXJlIGhpZGRlbi91bmlkZGVuIGJ5IGVkaXRpbmcgb3JcbiAgICAvLyB1bmRvaW5nXG4gICAgdmFyIGhpZGRlbiA9IG9wLm1heWJlSGlkZGVuTWFya2VycywgdW5oaWRkZW4gPSBvcC5tYXliZVVuaGlkZGVuTWFya2VycztcbiAgICBpZiAoaGlkZGVuKSBmb3IgKHZhciBpID0gMDsgaSA8IGhpZGRlbi5sZW5ndGg7ICsraSlcbiAgICAgIGlmICghaGlkZGVuW2ldLmxpbmVzLmxlbmd0aCkgc2lnbmFsKGhpZGRlbltpXSwgXCJoaWRlXCIpO1xuICAgIGlmICh1bmhpZGRlbikgZm9yICh2YXIgaSA9IDA7IGkgPCB1bmhpZGRlbi5sZW5ndGg7ICsraSlcbiAgICAgIGlmICh1bmhpZGRlbltpXS5saW5lcy5sZW5ndGgpIHNpZ25hbCh1bmhpZGRlbltpXSwgXCJ1bmhpZGVcIik7XG5cbiAgICB2YXIgZGVsYXllZDtcbiAgICBpZiAoIS0tZGVsYXllZENhbGxiYWNrRGVwdGgpIHtcbiAgICAgIGRlbGF5ZWQgPSBkZWxheWVkQ2FsbGJhY2tzO1xuICAgICAgZGVsYXllZENhbGxiYWNrcyA9IG51bGw7XG4gICAgfVxuICAgIC8vIEZpcmUgY2hhbmdlIGV2ZW50cywgYW5kIGRlbGF5ZWQgZXZlbnQgaGFuZGxlcnNcbiAgICBpZiAob3AuY2hhbmdlT2JqcylcbiAgICAgIHNpZ25hbChjbSwgXCJjaGFuZ2VzXCIsIGNtLCBvcC5jaGFuZ2VPYmpzKTtcbiAgICBpZiAoZGVsYXllZCkgZm9yICh2YXIgaSA9IDA7IGkgPCBkZWxheWVkLmxlbmd0aDsgKytpKSBkZWxheWVkW2ldKCk7XG4gICAgaWYgKG9wLmN1cnNvckFjdGl2aXR5SGFuZGxlcnMpXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9wLmN1cnNvckFjdGl2aXR5SGFuZGxlcnMubGVuZ3RoOyBpKyspXG4gICAgICAgIG9wLmN1cnNvckFjdGl2aXR5SGFuZGxlcnNbaV0oY20pO1xuICB9XG5cbiAgLy8gUnVuIHRoZSBnaXZlbiBmdW5jdGlvbiBpbiBhbiBvcGVyYXRpb25cbiAgZnVuY3Rpb24gcnVuSW5PcChjbSwgZikge1xuICAgIGlmIChjbS5jdXJPcCkgcmV0dXJuIGYoKTtcbiAgICBzdGFydE9wZXJhdGlvbihjbSk7XG4gICAgdHJ5IHsgcmV0dXJuIGYoKTsgfVxuICAgIGZpbmFsbHkgeyBlbmRPcGVyYXRpb24oY20pOyB9XG4gIH1cbiAgLy8gV3JhcHMgYSBmdW5jdGlvbiBpbiBhbiBvcGVyYXRpb24uIFJldHVybnMgdGhlIHdyYXBwZWQgZnVuY3Rpb24uXG4gIGZ1bmN0aW9uIG9wZXJhdGlvbihjbSwgZikge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChjbS5jdXJPcCkgcmV0dXJuIGYuYXBwbHkoY20sIGFyZ3VtZW50cyk7XG4gICAgICBzdGFydE9wZXJhdGlvbihjbSk7XG4gICAgICB0cnkgeyByZXR1cm4gZi5hcHBseShjbSwgYXJndW1lbnRzKTsgfVxuICAgICAgZmluYWxseSB7IGVuZE9wZXJhdGlvbihjbSk7IH1cbiAgICB9O1xuICB9XG4gIC8vIFVzZWQgdG8gYWRkIG1ldGhvZHMgdG8gZWRpdG9yIGFuZCBkb2MgaW5zdGFuY2VzLCB3cmFwcGluZyB0aGVtIGluXG4gIC8vIG9wZXJhdGlvbnMuXG4gIGZ1bmN0aW9uIG1ldGhvZE9wKGYpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5jdXJPcCkgcmV0dXJuIGYuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHN0YXJ0T3BlcmF0aW9uKHRoaXMpO1xuICAgICAgdHJ5IHsgcmV0dXJuIGYuYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfVxuICAgICAgZmluYWxseSB7IGVuZE9wZXJhdGlvbih0aGlzKTsgfVxuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZG9jTWV0aG9kT3AoZikge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjbSA9IHRoaXMuY207XG4gICAgICBpZiAoIWNtIHx8IGNtLmN1ck9wKSByZXR1cm4gZi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgc3RhcnRPcGVyYXRpb24oY20pO1xuICAgICAgdHJ5IHsgcmV0dXJuIGYuYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfVxuICAgICAgZmluYWxseSB7IGVuZE9wZXJhdGlvbihjbSk7IH1cbiAgICB9O1xuICB9XG5cbiAgLy8gVklFVyBUUkFDS0lOR1xuXG4gIC8vIFRoZXNlIG9iamVjdHMgYXJlIHVzZWQgdG8gcmVwcmVzZW50IHRoZSB2aXNpYmxlIChjdXJyZW50bHkgZHJhd24pXG4gIC8vIHBhcnQgb2YgdGhlIGRvY3VtZW50LiBBIExpbmVWaWV3IG1heSBjb3JyZXNwb25kIHRvIG11bHRpcGxlXG4gIC8vIGxvZ2ljYWwgbGluZXMsIGlmIHRob3NlIGFyZSBjb25uZWN0ZWQgYnkgY29sbGFwc2VkIHJhbmdlcy5cbiAgZnVuY3Rpb24gTGluZVZpZXcoZG9jLCBsaW5lLCBsaW5lTikge1xuICAgIC8vIFRoZSBzdGFydGluZyBsaW5lXG4gICAgdGhpcy5saW5lID0gbGluZTtcbiAgICAvLyBDb250aW51aW5nIGxpbmVzLCBpZiBhbnlcbiAgICB0aGlzLnJlc3QgPSB2aXN1YWxMaW5lQ29udGludWVkKGxpbmUpO1xuICAgIC8vIE51bWJlciBvZiBsb2dpY2FsIGxpbmVzIGluIHRoaXMgdmlzdWFsIGxpbmVcbiAgICB0aGlzLnNpemUgPSB0aGlzLnJlc3QgPyBsaW5lTm8obHN0KHRoaXMucmVzdCkpIC0gbGluZU4gKyAxIDogMTtcbiAgICB0aGlzLm5vZGUgPSB0aGlzLnRleHQgPSBudWxsO1xuICAgIHRoaXMuaGlkZGVuID0gbGluZUlzSGlkZGVuKGRvYywgbGluZSk7XG4gIH1cblxuICAvLyBDcmVhdGUgYSByYW5nZSBvZiBMaW5lVmlldyBvYmplY3RzIGZvciB0aGUgZ2l2ZW4gbGluZXMuXG4gIGZ1bmN0aW9uIGJ1aWxkVmlld0FycmF5KGNtLCBmcm9tLCB0bykge1xuICAgIHZhciBhcnJheSA9IFtdLCBuZXh0UG9zO1xuICAgIGZvciAodmFyIHBvcyA9IGZyb207IHBvcyA8IHRvOyBwb3MgPSBuZXh0UG9zKSB7XG4gICAgICB2YXIgdmlldyA9IG5ldyBMaW5lVmlldyhjbS5kb2MsIGdldExpbmUoY20uZG9jLCBwb3MpLCBwb3MpO1xuICAgICAgbmV4dFBvcyA9IHBvcyArIHZpZXcuc2l6ZTtcbiAgICAgIGFycmF5LnB1c2godmlldyk7XG4gICAgfVxuICAgIHJldHVybiBhcnJheTtcbiAgfVxuXG4gIC8vIFVwZGF0ZXMgdGhlIGRpc3BsYXkudmlldyBkYXRhIHN0cnVjdHVyZSBmb3IgYSBnaXZlbiBjaGFuZ2UgdG8gdGhlXG4gIC8vIGRvY3VtZW50LiBGcm9tIGFuZCB0byBhcmUgaW4gcHJlLWNoYW5nZSBjb29yZGluYXRlcy4gTGVuZGlmZiBpc1xuICAvLyB0aGUgYW1vdW50IG9mIGxpbmVzIGFkZGVkIG9yIHN1YnRyYWN0ZWQgYnkgdGhlIGNoYW5nZS4gVGhpcyBpc1xuICAvLyB1c2VkIGZvciBjaGFuZ2VzIHRoYXQgc3BhbiBtdWx0aXBsZSBsaW5lcywgb3IgY2hhbmdlIHRoZSB3YXlcbiAgLy8gbGluZXMgYXJlIGRpdmlkZWQgaW50byB2aXN1YWwgbGluZXMuIHJlZ0xpbmVDaGFuZ2UgKGJlbG93KVxuICAvLyByZWdpc3RlcnMgc2luZ2xlLWxpbmUgY2hhbmdlcy5cbiAgZnVuY3Rpb24gcmVnQ2hhbmdlKGNtLCBmcm9tLCB0bywgbGVuZGlmZikge1xuICAgIGlmIChmcm9tID09IG51bGwpIGZyb20gPSBjbS5kb2MuZmlyc3Q7XG4gICAgaWYgKHRvID09IG51bGwpIHRvID0gY20uZG9jLmZpcnN0ICsgY20uZG9jLnNpemU7XG4gICAgaWYgKCFsZW5kaWZmKSBsZW5kaWZmID0gMDtcblxuICAgIHZhciBkaXNwbGF5ID0gY20uZGlzcGxheTtcbiAgICBpZiAobGVuZGlmZiAmJiB0byA8IGRpc3BsYXkudmlld1RvICYmXG4gICAgICAgIChkaXNwbGF5LnVwZGF0ZUxpbmVOdW1iZXJzID09IG51bGwgfHwgZGlzcGxheS51cGRhdGVMaW5lTnVtYmVycyA+IGZyb20pKVxuICAgICAgZGlzcGxheS51cGRhdGVMaW5lTnVtYmVycyA9IGZyb207XG5cbiAgICBjbS5jdXJPcC52aWV3Q2hhbmdlZCA9IHRydWU7XG5cbiAgICBpZiAoZnJvbSA+PSBkaXNwbGF5LnZpZXdUbykgeyAvLyBDaGFuZ2UgYWZ0ZXJcbiAgICAgIGlmIChzYXdDb2xsYXBzZWRTcGFucyAmJiB2aXN1YWxMaW5lTm8oY20uZG9jLCBmcm9tKSA8IGRpc3BsYXkudmlld1RvKVxuICAgICAgICByZXNldFZpZXcoY20pO1xuICAgIH0gZWxzZSBpZiAodG8gPD0gZGlzcGxheS52aWV3RnJvbSkgeyAvLyBDaGFuZ2UgYmVmb3JlXG4gICAgICBpZiAoc2F3Q29sbGFwc2VkU3BhbnMgJiYgdmlzdWFsTGluZUVuZE5vKGNtLmRvYywgdG8gKyBsZW5kaWZmKSA+IGRpc3BsYXkudmlld0Zyb20pIHtcbiAgICAgICAgcmVzZXRWaWV3KGNtKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRpc3BsYXkudmlld0Zyb20gKz0gbGVuZGlmZjtcbiAgICAgICAgZGlzcGxheS52aWV3VG8gKz0gbGVuZGlmZjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGZyb20gPD0gZGlzcGxheS52aWV3RnJvbSAmJiB0byA+PSBkaXNwbGF5LnZpZXdUbykgeyAvLyBGdWxsIG92ZXJsYXBcbiAgICAgIHJlc2V0VmlldyhjbSk7XG4gICAgfSBlbHNlIGlmIChmcm9tIDw9IGRpc3BsYXkudmlld0Zyb20pIHsgLy8gVG9wIG92ZXJsYXBcbiAgICAgIHZhciBjdXQgPSB2aWV3Q3V0dGluZ1BvaW50KGNtLCB0bywgdG8gKyBsZW5kaWZmLCAxKTtcbiAgICAgIGlmIChjdXQpIHtcbiAgICAgICAgZGlzcGxheS52aWV3ID0gZGlzcGxheS52aWV3LnNsaWNlKGN1dC5pbmRleCk7XG4gICAgICAgIGRpc3BsYXkudmlld0Zyb20gPSBjdXQubGluZU47XG4gICAgICAgIGRpc3BsYXkudmlld1RvICs9IGxlbmRpZmY7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNldFZpZXcoY20pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodG8gPj0gZGlzcGxheS52aWV3VG8pIHsgLy8gQm90dG9tIG92ZXJsYXBcbiAgICAgIHZhciBjdXQgPSB2aWV3Q3V0dGluZ1BvaW50KGNtLCBmcm9tLCBmcm9tLCAtMSk7XG4gICAgICBpZiAoY3V0KSB7XG4gICAgICAgIGRpc3BsYXkudmlldyA9IGRpc3BsYXkudmlldy5zbGljZSgwLCBjdXQuaW5kZXgpO1xuICAgICAgICBkaXNwbGF5LnZpZXdUbyA9IGN1dC5saW5lTjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc2V0VmlldyhjbSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHsgLy8gR2FwIGluIHRoZSBtaWRkbGVcbiAgICAgIHZhciBjdXRUb3AgPSB2aWV3Q3V0dGluZ1BvaW50KGNtLCBmcm9tLCBmcm9tLCAtMSk7XG4gICAgICB2YXIgY3V0Qm90ID0gdmlld0N1dHRpbmdQb2ludChjbSwgdG8sIHRvICsgbGVuZGlmZiwgMSk7XG4gICAgICBpZiAoY3V0VG9wICYmIGN1dEJvdCkge1xuICAgICAgICBkaXNwbGF5LnZpZXcgPSBkaXNwbGF5LnZpZXcuc2xpY2UoMCwgY3V0VG9wLmluZGV4KVxuICAgICAgICAgIC5jb25jYXQoYnVpbGRWaWV3QXJyYXkoY20sIGN1dFRvcC5saW5lTiwgY3V0Qm90LmxpbmVOKSlcbiAgICAgICAgICAuY29uY2F0KGRpc3BsYXkudmlldy5zbGljZShjdXRCb3QuaW5kZXgpKTtcbiAgICAgICAgZGlzcGxheS52aWV3VG8gKz0gbGVuZGlmZjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc2V0VmlldyhjbSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGV4dCA9IGRpc3BsYXkuZXh0ZXJuYWxNZWFzdXJlZDtcbiAgICBpZiAoZXh0KSB7XG4gICAgICBpZiAodG8gPCBleHQubGluZU4pXG4gICAgICAgIGV4dC5saW5lTiArPSBsZW5kaWZmO1xuICAgICAgZWxzZSBpZiAoZnJvbSA8IGV4dC5saW5lTiArIGV4dC5zaXplKVxuICAgICAgICBkaXNwbGF5LmV4dGVybmFsTWVhc3VyZWQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8vIFJlZ2lzdGVyIGEgY2hhbmdlIHRvIGEgc2luZ2xlIGxpbmUuIFR5cGUgbXVzdCBiZSBvbmUgb2YgXCJ0ZXh0XCIsXG4gIC8vIFwiZ3V0dGVyXCIsIFwiY2xhc3NcIiwgXCJ3aWRnZXRcIlxuICBmdW5jdGlvbiByZWdMaW5lQ2hhbmdlKGNtLCBsaW5lLCB0eXBlKSB7XG4gICAgY20uY3VyT3Audmlld0NoYW5nZWQgPSB0cnVlO1xuICAgIHZhciBkaXNwbGF5ID0gY20uZGlzcGxheSwgZXh0ID0gY20uZGlzcGxheS5leHRlcm5hbE1lYXN1cmVkO1xuICAgIGlmIChleHQgJiYgbGluZSA+PSBleHQubGluZU4gJiYgbGluZSA8IGV4dC5saW5lTiArIGV4dC5zaXplKVxuICAgICAgZGlzcGxheS5leHRlcm5hbE1lYXN1cmVkID0gbnVsbDtcblxuICAgIGlmIChsaW5lIDwgZGlzcGxheS52aWV3RnJvbSB8fCBsaW5lID49IGRpc3BsYXkudmlld1RvKSByZXR1cm47XG4gICAgdmFyIGxpbmVWaWV3ID0gZGlzcGxheS52aWV3W2ZpbmRWaWV3SW5kZXgoY20sIGxpbmUpXTtcbiAgICBpZiAobGluZVZpZXcubm9kZSA9PSBudWxsKSByZXR1cm47XG4gICAgdmFyIGFyciA9IGxpbmVWaWV3LmNoYW5nZXMgfHwgKGxpbmVWaWV3LmNoYW5nZXMgPSBbXSk7XG4gICAgaWYgKGluZGV4T2YoYXJyLCB0eXBlKSA9PSAtMSkgYXJyLnB1c2godHlwZSk7XG4gIH1cblxuICAvLyBDbGVhciB0aGUgdmlldy5cbiAgZnVuY3Rpb24gcmVzZXRWaWV3KGNtKSB7XG4gICAgY20uZGlzcGxheS52aWV3RnJvbSA9IGNtLmRpc3BsYXkudmlld1RvID0gY20uZG9jLmZpcnN0O1xuICAgIGNtLmRpc3BsYXkudmlldyA9IFtdO1xuICAgIGNtLmRpc3BsYXkudmlld09mZnNldCA9IDA7XG4gIH1cblxuICAvLyBGaW5kIHRoZSB2aWV3IGVsZW1lbnQgY29ycmVzcG9uZGluZyB0byBhIGdpdmVuIGxpbmUuIFJldHVybiBudWxsXG4gIC8vIHdoZW4gdGhlIGxpbmUgaXNuJ3QgdmlzaWJsZS5cbiAgZnVuY3Rpb24gZmluZFZpZXdJbmRleChjbSwgbikge1xuICAgIGlmIChuID49IGNtLmRpc3BsYXkudmlld1RvKSByZXR1cm4gbnVsbDtcbiAgICBuIC09IGNtLmRpc3BsYXkudmlld0Zyb207XG4gICAgaWYgKG4gPCAwKSByZXR1cm4gbnVsbDtcbiAgICB2YXIgdmlldyA9IGNtLmRpc3BsYXkudmlldztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZpZXcubGVuZ3RoOyBpKyspIHtcbiAgICAgIG4gLT0gdmlld1tpXS5zaXplO1xuICAgICAgaWYgKG4gPCAwKSByZXR1cm4gaTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB2aWV3Q3V0dGluZ1BvaW50KGNtLCBvbGROLCBuZXdOLCBkaXIpIHtcbiAgICB2YXIgaW5kZXggPSBmaW5kVmlld0luZGV4KGNtLCBvbGROKSwgZGlmZiwgdmlldyA9IGNtLmRpc3BsYXkudmlldztcbiAgICBpZiAoIXNhd0NvbGxhcHNlZFNwYW5zIHx8IG5ld04gPT0gY20uZG9jLmZpcnN0ICsgY20uZG9jLnNpemUpXG4gICAgICByZXR1cm4ge2luZGV4OiBpbmRleCwgbGluZU46IG5ld059O1xuICAgIGZvciAodmFyIGkgPSAwLCBuID0gY20uZGlzcGxheS52aWV3RnJvbTsgaSA8IGluZGV4OyBpKyspXG4gICAgICBuICs9IHZpZXdbaV0uc2l6ZTtcbiAgICBpZiAobiAhPSBvbGROKSB7XG4gICAgICBpZiAoZGlyID4gMCkge1xuICAgICAgICBpZiAoaW5kZXggPT0gdmlldy5sZW5ndGggLSAxKSByZXR1cm4gbnVsbDtcbiAgICAgICAgZGlmZiA9IChuICsgdmlld1tpbmRleF0uc2l6ZSkgLSBvbGROO1xuICAgICAgICBpbmRleCsrO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGlmZiA9IG4gLSBvbGROO1xuICAgICAgfVxuICAgICAgb2xkTiArPSBkaWZmOyBuZXdOICs9IGRpZmY7XG4gICAgfVxuICAgIHdoaWxlICh2aXN1YWxMaW5lTm8oY20uZG9jLCBuZXdOKSAhPSBuZXdOKSB7XG4gICAgICBpZiAoaW5kZXggPT0gKGRpciA8IDAgPyAwIDogdmlldy5sZW5ndGggLSAxKSkgcmV0dXJuIG51bGw7XG4gICAgICBuZXdOICs9IGRpciAqIHZpZXdbaW5kZXggLSAoZGlyIDwgMCA/IDEgOiAwKV0uc2l6ZTtcbiAgICAgIGluZGV4ICs9IGRpcjtcbiAgICB9XG4gICAgcmV0dXJuIHtpbmRleDogaW5kZXgsIGxpbmVOOiBuZXdOfTtcbiAgfVxuXG4gIC8vIEZvcmNlIHRoZSB2aWV3IHRvIGNvdmVyIGEgZ2l2ZW4gcmFuZ2UsIGFkZGluZyBlbXB0eSB2aWV3IGVsZW1lbnRcbiAgLy8gb3IgY2xpcHBpbmcgb2ZmIGV4aXN0aW5nIG9uZXMgYXMgbmVlZGVkLlxuICBmdW5jdGlvbiBhZGp1c3RWaWV3KGNtLCBmcm9tLCB0bykge1xuICAgIHZhciBkaXNwbGF5ID0gY20uZGlzcGxheSwgdmlldyA9IGRpc3BsYXkudmlldztcbiAgICBpZiAodmlldy5sZW5ndGggPT0gMCB8fCBmcm9tID49IGRpc3BsYXkudmlld1RvIHx8IHRvIDw9IGRpc3BsYXkudmlld0Zyb20pIHtcbiAgICAgIGRpc3BsYXkudmlldyA9IGJ1aWxkVmlld0FycmF5KGNtLCBmcm9tLCB0byk7XG4gICAgICBkaXNwbGF5LnZpZXdGcm9tID0gZnJvbTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGRpc3BsYXkudmlld0Zyb20gPiBmcm9tKVxuICAgICAgICBkaXNwbGF5LnZpZXcgPSBidWlsZFZpZXdBcnJheShjbSwgZnJvbSwgZGlzcGxheS52aWV3RnJvbSkuY29uY2F0KGRpc3BsYXkudmlldyk7XG4gICAgICBlbHNlIGlmIChkaXNwbGF5LnZpZXdGcm9tIDwgZnJvbSlcbiAgICAgICAgZGlzcGxheS52aWV3ID0gZGlzcGxheS52aWV3LnNsaWNlKGZpbmRWaWV3SW5kZXgoY20sIGZyb20pKTtcbiAgICAgIGRpc3BsYXkudmlld0Zyb20gPSBmcm9tO1xuICAgICAgaWYgKGRpc3BsYXkudmlld1RvIDwgdG8pXG4gICAgICAgIGRpc3BsYXkudmlldyA9IGRpc3BsYXkudmlldy5jb25jYXQoYnVpbGRWaWV3QXJyYXkoY20sIGRpc3BsYXkudmlld1RvLCB0bykpO1xuICAgICAgZWxzZSBpZiAoZGlzcGxheS52aWV3VG8gPiB0bylcbiAgICAgICAgZGlzcGxheS52aWV3ID0gZGlzcGxheS52aWV3LnNsaWNlKDAsIGZpbmRWaWV3SW5kZXgoY20sIHRvKSk7XG4gICAgfVxuICAgIGRpc3BsYXkudmlld1RvID0gdG87XG4gIH1cblxuICAvLyBDb3VudCB0aGUgbnVtYmVyIG9mIGxpbmVzIGluIHRoZSB2aWV3IHdob3NlIERPTSByZXByZXNlbnRhdGlvbiBpc1xuICAvLyBvdXQgb2YgZGF0ZSAob3Igbm9uZXhpc3RlbnQpLlxuICBmdW5jdGlvbiBjb3VudERpcnR5VmlldyhjbSkge1xuICAgIHZhciB2aWV3ID0gY20uZGlzcGxheS52aWV3LCBkaXJ0eSA9IDA7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2aWV3Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbGluZVZpZXcgPSB2aWV3W2ldO1xuICAgICAgaWYgKCFsaW5lVmlldy5oaWRkZW4gJiYgKCFsaW5lVmlldy5ub2RlIHx8IGxpbmVWaWV3LmNoYW5nZXMpKSArK2RpcnR5O1xuICAgIH1cbiAgICByZXR1cm4gZGlydHk7XG4gIH1cblxuICAvLyBJTlBVVCBIQU5ETElOR1xuXG4gIC8vIFBvbGwgZm9yIGlucHV0IGNoYW5nZXMsIHVzaW5nIHRoZSBub3JtYWwgcmF0ZSBvZiBwb2xsaW5nLiBUaGlzXG4gIC8vIHJ1bnMgYXMgbG9uZyBhcyB0aGUgZWRpdG9yIGlzIGZvY3VzZWQuXG4gIGZ1bmN0aW9uIHNsb3dQb2xsKGNtKSB7XG4gICAgaWYgKGNtLmRpc3BsYXkucG9sbGluZ0Zhc3QpIHJldHVybjtcbiAgICBjbS5kaXNwbGF5LnBvbGwuc2V0KGNtLm9wdGlvbnMucG9sbEludGVydmFsLCBmdW5jdGlvbigpIHtcbiAgICAgIHJlYWRJbnB1dChjbSk7XG4gICAgICBpZiAoY20uc3RhdGUuZm9jdXNlZCkgc2xvd1BvbGwoY20pO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gV2hlbiBhbiBldmVudCBoYXMganVzdCBjb21lIGluIHRoYXQgaXMgbGlrZWx5IHRvIGFkZCBvciBjaGFuZ2VcbiAgLy8gc29tZXRoaW5nIGluIHRoZSBpbnB1dCB0ZXh0YXJlYSwgd2UgcG9sbCBmYXN0ZXIsIHRvIGVuc3VyZSB0aGF0XG4gIC8vIHRoZSBjaGFuZ2UgYXBwZWFycyBvbiB0aGUgc2NyZWVuIHF1aWNrbHkuXG4gIGZ1bmN0aW9uIGZhc3RQb2xsKGNtKSB7XG4gICAgdmFyIG1pc3NlZCA9IGZhbHNlO1xuICAgIGNtLmRpc3BsYXkucG9sbGluZ0Zhc3QgPSB0cnVlO1xuICAgIGZ1bmN0aW9uIHAoKSB7XG4gICAgICB2YXIgY2hhbmdlZCA9IHJlYWRJbnB1dChjbSk7XG4gICAgICBpZiAoIWNoYW5nZWQgJiYgIW1pc3NlZCkge21pc3NlZCA9IHRydWU7IGNtLmRpc3BsYXkucG9sbC5zZXQoNjAsIHApO31cbiAgICAgIGVsc2Uge2NtLmRpc3BsYXkucG9sbGluZ0Zhc3QgPSBmYWxzZTsgc2xvd1BvbGwoY20pO31cbiAgICB9XG4gICAgY20uZGlzcGxheS5wb2xsLnNldCgyMCwgcCk7XG4gIH1cblxuICAvLyBSZWFkIGlucHV0IGZyb20gdGhlIHRleHRhcmVhLCBhbmQgdXBkYXRlIHRoZSBkb2N1bWVudCB0byBtYXRjaC5cbiAgLy8gV2hlbiBzb21ldGhpbmcgaXMgc2VsZWN0ZWQsIGl0IGlzIHByZXNlbnQgaW4gdGhlIHRleHRhcmVhLCBhbmRcbiAgLy8gc2VsZWN0ZWQgKHVubGVzcyBpdCBpcyBodWdlLCBpbiB3aGljaCBjYXNlIGEgcGxhY2Vob2xkZXIgaXNcbiAgLy8gdXNlZCkuIFdoZW4gbm90aGluZyBpcyBzZWxlY3RlZCwgdGhlIGN1cnNvciBzaXRzIGFmdGVyIHByZXZpb3VzbHlcbiAgLy8gc2VlbiB0ZXh0IChjYW4gYmUgZW1wdHkpLCB3aGljaCBpcyBzdG9yZWQgaW4gcHJldklucHV0ICh3ZSBtdXN0XG4gIC8vIG5vdCByZXNldCB0aGUgdGV4dGFyZWEgd2hlbiB0eXBpbmcsIGJlY2F1c2UgdGhhdCBicmVha3MgSU1FKS5cbiAgZnVuY3Rpb24gcmVhZElucHV0KGNtKSB7XG4gICAgdmFyIGlucHV0ID0gY20uZGlzcGxheS5pbnB1dCwgcHJldklucHV0ID0gY20uZGlzcGxheS5wcmV2SW5wdXQsIGRvYyA9IGNtLmRvYztcbiAgICAvLyBTaW5jZSB0aGlzIGlzIGNhbGxlZCBhICpsb3QqLCB0cnkgdG8gYmFpbCBvdXQgYXMgY2hlYXBseSBhc1xuICAgIC8vIHBvc3NpYmxlIHdoZW4gaXQgaXMgY2xlYXIgdGhhdCBub3RoaW5nIGhhcHBlbmVkLiBoYXNTZWxlY3Rpb25cbiAgICAvLyB3aWxsIGJlIHRoZSBjYXNlIHdoZW4gdGhlcmUgaXMgYSBsb3Qgb2YgdGV4dCBpbiB0aGUgdGV4dGFyZWEsXG4gICAgLy8gaW4gd2hpY2ggY2FzZSByZWFkaW5nIGl0cyB2YWx1ZSB3b3VsZCBiZSBleHBlbnNpdmUuXG4gICAgaWYgKCFjbS5zdGF0ZS5mb2N1c2VkIHx8IChoYXNTZWxlY3Rpb24oaW5wdXQpICYmICFwcmV2SW5wdXQpIHx8IGlzUmVhZE9ubHkoY20pIHx8IGNtLm9wdGlvbnMuZGlzYWJsZUlucHV0KVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIC8vIFNlZSBwYXN0ZSBoYW5kbGVyIGZvciBtb3JlIG9uIHRoZSBmYWtlZExhc3RDaGFyIGtsdWRnZVxuICAgIGlmIChjbS5zdGF0ZS5wYXN0ZUluY29taW5nICYmIGNtLnN0YXRlLmZha2VkTGFzdENoYXIpIHtcbiAgICAgIGlucHV0LnZhbHVlID0gaW5wdXQudmFsdWUuc3Vic3RyaW5nKDAsIGlucHV0LnZhbHVlLmxlbmd0aCAtIDEpO1xuICAgICAgY20uc3RhdGUuZmFrZWRMYXN0Q2hhciA9IGZhbHNlO1xuICAgIH1cbiAgICB2YXIgdGV4dCA9IGlucHV0LnZhbHVlO1xuICAgIC8vIElmIG5vdGhpbmcgY2hhbmdlZCwgYmFpbC5cbiAgICBpZiAodGV4dCA9PSBwcmV2SW5wdXQgJiYgIWNtLnNvbWV0aGluZ1NlbGVjdGVkKCkpIHJldHVybiBmYWxzZTtcbiAgICAvLyBXb3JrIGFyb3VuZCBub25zZW5zaWNhbCBzZWxlY3Rpb24gcmVzZXR0aW5nIGluIElFOS8xMFxuICAgIGlmIChpZSAmJiAhaWVfdXB0bzggJiYgY20uZGlzcGxheS5pbnB1dEhhc1NlbGVjdGlvbiA9PT0gdGV4dCkge1xuICAgICAgcmVzZXRJbnB1dChjbSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIHdpdGhPcCA9ICFjbS5jdXJPcDtcbiAgICBpZiAod2l0aE9wKSBzdGFydE9wZXJhdGlvbihjbSk7XG4gICAgY20uZGlzcGxheS5zaGlmdCA9IGZhbHNlO1xuXG4gICAgaWYgKHRleHQuY2hhckNvZGVBdCgwKSA9PSAweDIwMGIgJiYgZG9jLnNlbCA9PSBjbS5kaXNwbGF5LnNlbEZvckNvbnRleHRNZW51ICYmICFwcmV2SW5wdXQpXG4gICAgICBwcmV2SW5wdXQgPSBcIlxcdTIwMGJcIjtcbiAgICAvLyBGaW5kIHRoZSBwYXJ0IG9mIHRoZSBpbnB1dCB0aGF0IGlzIGFjdHVhbGx5IG5ld1xuICAgIHZhciBzYW1lID0gMCwgbCA9IE1hdGgubWluKHByZXZJbnB1dC5sZW5ndGgsIHRleHQubGVuZ3RoKTtcbiAgICB3aGlsZSAoc2FtZSA8IGwgJiYgcHJldklucHV0LmNoYXJDb2RlQXQoc2FtZSkgPT0gdGV4dC5jaGFyQ29kZUF0KHNhbWUpKSArK3NhbWU7XG4gICAgdmFyIGluc2VydGVkID0gdGV4dC5zbGljZShzYW1lKSwgdGV4dExpbmVzID0gc3BsaXRMaW5lcyhpbnNlcnRlZCk7XG5cbiAgICAvLyBXaGVuIHBhc2luZyBOIGxpbmVzIGludG8gTiBzZWxlY3Rpb25zLCBpbnNlcnQgb25lIGxpbmUgcGVyIHNlbGVjdGlvblxuICAgIHZhciBtdWx0aVBhc3RlID0gY20uc3RhdGUucGFzdGVJbmNvbWluZyAmJiB0ZXh0TGluZXMubGVuZ3RoID4gMSAmJiBkb2Muc2VsLnJhbmdlcy5sZW5ndGggPT0gdGV4dExpbmVzLmxlbmd0aDtcblxuICAgIC8vIE5vcm1hbCBiZWhhdmlvciBpcyB0byBpbnNlcnQgdGhlIG5ldyB0ZXh0IGludG8gZXZlcnkgc2VsZWN0aW9uXG4gICAgZm9yICh2YXIgaSA9IGRvYy5zZWwucmFuZ2VzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICB2YXIgcmFuZ2UgPSBkb2Muc2VsLnJhbmdlc1tpXTtcbiAgICAgIHZhciBmcm9tID0gcmFuZ2UuZnJvbSgpLCB0byA9IHJhbmdlLnRvKCk7XG4gICAgICAvLyBIYW5kbGUgZGVsZXRpb25cbiAgICAgIGlmIChzYW1lIDwgcHJldklucHV0Lmxlbmd0aClcbiAgICAgICAgZnJvbSA9IFBvcyhmcm9tLmxpbmUsIGZyb20uY2ggLSAocHJldklucHV0Lmxlbmd0aCAtIHNhbWUpKTtcbiAgICAgIC8vIEhhbmRsZSBvdmVyd3JpdGVcbiAgICAgIGVsc2UgaWYgKGNtLnN0YXRlLm92ZXJ3cml0ZSAmJiByYW5nZS5lbXB0eSgpICYmICFjbS5zdGF0ZS5wYXN0ZUluY29taW5nKVxuICAgICAgICB0byA9IFBvcyh0by5saW5lLCBNYXRoLm1pbihnZXRMaW5lKGRvYywgdG8ubGluZSkudGV4dC5sZW5ndGgsIHRvLmNoICsgbHN0KHRleHRMaW5lcykubGVuZ3RoKSk7XG4gICAgICB2YXIgdXBkYXRlSW5wdXQgPSBjbS5jdXJPcC51cGRhdGVJbnB1dDtcbiAgICAgIHZhciBjaGFuZ2VFdmVudCA9IHtmcm9tOiBmcm9tLCB0bzogdG8sIHRleHQ6IG11bHRpUGFzdGUgPyBbdGV4dExpbmVzW2ldXSA6IHRleHRMaW5lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW46IGNtLnN0YXRlLnBhc3RlSW5jb21pbmcgPyBcInBhc3RlXCIgOiBjbS5zdGF0ZS5jdXRJbmNvbWluZyA/IFwiY3V0XCIgOiBcIitpbnB1dFwifTtcbiAgICAgIG1ha2VDaGFuZ2UoY20uZG9jLCBjaGFuZ2VFdmVudCk7XG4gICAgICBzaWduYWxMYXRlcihjbSwgXCJpbnB1dFJlYWRcIiwgY20sIGNoYW5nZUV2ZW50KTtcbiAgICAgIC8vIFdoZW4gYW4gJ2VsZWN0cmljJyBjaGFyYWN0ZXIgaXMgaW5zZXJ0ZWQsIGltbWVkaWF0ZWx5IHRyaWdnZXIgYSByZWluZGVudFxuICAgICAgaWYgKGluc2VydGVkICYmICFjbS5zdGF0ZS5wYXN0ZUluY29taW5nICYmIGNtLm9wdGlvbnMuZWxlY3RyaWNDaGFycyAmJlxuICAgICAgICAgIGNtLm9wdGlvbnMuc21hcnRJbmRlbnQgJiYgcmFuZ2UuaGVhZC5jaCA8IDEwMCAmJlxuICAgICAgICAgICghaSB8fCBkb2Muc2VsLnJhbmdlc1tpIC0gMV0uaGVhZC5saW5lICE9IHJhbmdlLmhlYWQubGluZSkpIHtcbiAgICAgICAgdmFyIG1vZGUgPSBjbS5nZXRNb2RlQXQocmFuZ2UuaGVhZCk7XG4gICAgICAgIGlmIChtb2RlLmVsZWN0cmljQ2hhcnMpIHtcbiAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG1vZGUuZWxlY3RyaWNDaGFycy5sZW5ndGg7IGorKylcbiAgICAgICAgICAgIGlmIChpbnNlcnRlZC5pbmRleE9mKG1vZGUuZWxlY3RyaWNDaGFycy5jaGFyQXQoaikpID4gLTEpIHtcbiAgICAgICAgICAgICAgaW5kZW50TGluZShjbSwgcmFuZ2UuaGVhZC5saW5lLCBcInNtYXJ0XCIpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChtb2RlLmVsZWN0cmljSW5wdXQpIHtcbiAgICAgICAgICB2YXIgZW5kID0gY2hhbmdlRW5kKGNoYW5nZUV2ZW50KTtcbiAgICAgICAgICBpZiAobW9kZS5lbGVjdHJpY0lucHV0LnRlc3QoZ2V0TGluZShkb2MsIGVuZC5saW5lKS50ZXh0LnNsaWNlKDAsIGVuZC5jaCkpKVxuICAgICAgICAgICAgaW5kZW50TGluZShjbSwgcmFuZ2UuaGVhZC5saW5lLCBcInNtYXJ0XCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGVuc3VyZUN1cnNvclZpc2libGUoY20pO1xuICAgIGNtLmN1ck9wLnVwZGF0ZUlucHV0ID0gdXBkYXRlSW5wdXQ7XG4gICAgY20uY3VyT3AudHlwaW5nID0gdHJ1ZTtcblxuICAgIC8vIERvbid0IGxlYXZlIGxvbmcgdGV4dCBpbiB0aGUgdGV4dGFyZWEsIHNpbmNlIGl0IG1ha2VzIGZ1cnRoZXIgcG9sbGluZyBzbG93XG4gICAgaWYgKHRleHQubGVuZ3RoID4gMTAwMCB8fCB0ZXh0LmluZGV4T2YoXCJcXG5cIikgPiAtMSkgaW5wdXQudmFsdWUgPSBjbS5kaXNwbGF5LnByZXZJbnB1dCA9IFwiXCI7XG4gICAgZWxzZSBjbS5kaXNwbGF5LnByZXZJbnB1dCA9IHRleHQ7XG4gICAgaWYgKHdpdGhPcCkgZW5kT3BlcmF0aW9uKGNtKTtcbiAgICBjbS5zdGF0ZS5wYXN0ZUluY29taW5nID0gY20uc3RhdGUuY3V0SW5jb21pbmcgPSBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIFJlc2V0IHRoZSBpbnB1dCB0byBjb3JyZXNwb25kIHRvIHRoZSBzZWxlY3Rpb24gKG9yIHRvIGJlIGVtcHR5LFxuICAvLyB3aGVuIG5vdCB0eXBpbmcgYW5kIG5vdGhpbmcgaXMgc2VsZWN0ZWQpXG4gIGZ1bmN0aW9uIHJlc2V0SW5wdXQoY20sIHR5cGluZykge1xuICAgIHZhciBtaW5pbWFsLCBzZWxlY3RlZCwgZG9jID0gY20uZG9jO1xuICAgIGlmIChjbS5zb21ldGhpbmdTZWxlY3RlZCgpKSB7XG4gICAgICBjbS5kaXNwbGF5LnByZXZJbnB1dCA9IFwiXCI7XG4gICAgICB2YXIgcmFuZ2UgPSBkb2Muc2VsLnByaW1hcnkoKTtcbiAgICAgIG1pbmltYWwgPSBoYXNDb3B5RXZlbnQgJiZcbiAgICAgICAgKHJhbmdlLnRvKCkubGluZSAtIHJhbmdlLmZyb20oKS5saW5lID4gMTAwIHx8IChzZWxlY3RlZCA9IGNtLmdldFNlbGVjdGlvbigpKS5sZW5ndGggPiAxMDAwKTtcbiAgICAgIHZhciBjb250ZW50ID0gbWluaW1hbCA/IFwiLVwiIDogc2VsZWN0ZWQgfHwgY20uZ2V0U2VsZWN0aW9uKCk7XG4gICAgICBjbS5kaXNwbGF5LmlucHV0LnZhbHVlID0gY29udGVudDtcbiAgICAgIGlmIChjbS5zdGF0ZS5mb2N1c2VkKSBzZWxlY3RJbnB1dChjbS5kaXNwbGF5LmlucHV0KTtcbiAgICAgIGlmIChpZSAmJiAhaWVfdXB0bzgpIGNtLmRpc3BsYXkuaW5wdXRIYXNTZWxlY3Rpb24gPSBjb250ZW50O1xuICAgIH0gZWxzZSBpZiAoIXR5cGluZykge1xuICAgICAgY20uZGlzcGxheS5wcmV2SW5wdXQgPSBjbS5kaXNwbGF5LmlucHV0LnZhbHVlID0gXCJcIjtcbiAgICAgIGlmIChpZSAmJiAhaWVfdXB0bzgpIGNtLmRpc3BsYXkuaW5wdXRIYXNTZWxlY3Rpb24gPSBudWxsO1xuICAgIH1cbiAgICBjbS5kaXNwbGF5LmluYWNjdXJhdGVTZWxlY3Rpb24gPSBtaW5pbWFsO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9jdXNJbnB1dChjbSkge1xuICAgIGlmIChjbS5vcHRpb25zLnJlYWRPbmx5ICE9IFwibm9jdXJzb3JcIiAmJiAoIW1vYmlsZSB8fCBhY3RpdmVFbHQoKSAhPSBjbS5kaXNwbGF5LmlucHV0KSlcbiAgICAgIGNtLmRpc3BsYXkuaW5wdXQuZm9jdXMoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVuc3VyZUZvY3VzKGNtKSB7XG4gICAgaWYgKCFjbS5zdGF0ZS5mb2N1c2VkKSB7IGZvY3VzSW5wdXQoY20pOyBvbkZvY3VzKGNtKTsgfVxuICB9XG5cbiAgZnVuY3Rpb24gaXNSZWFkT25seShjbSkge1xuICAgIHJldHVybiBjbS5vcHRpb25zLnJlYWRPbmx5IHx8IGNtLmRvYy5jYW50RWRpdDtcbiAgfVxuXG4gIC8vIEVWRU5UIEhBTkRMRVJTXG5cbiAgLy8gQXR0YWNoIHRoZSBuZWNlc3NhcnkgZXZlbnQgaGFuZGxlcnMgd2hlbiBpbml0aWFsaXppbmcgdGhlIGVkaXRvclxuICBmdW5jdGlvbiByZWdpc3RlckV2ZW50SGFuZGxlcnMoY20pIHtcbiAgICB2YXIgZCA9IGNtLmRpc3BsYXk7XG4gICAgb24oZC5zY3JvbGxlciwgXCJtb3VzZWRvd25cIiwgb3BlcmF0aW9uKGNtLCBvbk1vdXNlRG93bikpO1xuICAgIC8vIE9sZGVyIElFJ3Mgd2lsbCBub3QgZmlyZSBhIHNlY29uZCBtb3VzZWRvd24gZm9yIGEgZG91YmxlIGNsaWNrXG4gICAgaWYgKGllX3VwdG8xMClcbiAgICAgIG9uKGQuc2Nyb2xsZXIsIFwiZGJsY2xpY2tcIiwgb3BlcmF0aW9uKGNtLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmIChzaWduYWxET01FdmVudChjbSwgZSkpIHJldHVybjtcbiAgICAgICAgdmFyIHBvcyA9IHBvc0Zyb21Nb3VzZShjbSwgZSk7XG4gICAgICAgIGlmICghcG9zIHx8IGNsaWNrSW5HdXR0ZXIoY20sIGUpIHx8IGV2ZW50SW5XaWRnZXQoY20uZGlzcGxheSwgZSkpIHJldHVybjtcbiAgICAgICAgZV9wcmV2ZW50RGVmYXVsdChlKTtcbiAgICAgICAgdmFyIHdvcmQgPSBmaW5kV29yZEF0KGNtLCBwb3MpO1xuICAgICAgICBleHRlbmRTZWxlY3Rpb24oY20uZG9jLCB3b3JkLmFuY2hvciwgd29yZC5oZWFkKTtcbiAgICAgIH0pKTtcbiAgICBlbHNlXG4gICAgICBvbihkLnNjcm9sbGVyLCBcImRibGNsaWNrXCIsIGZ1bmN0aW9uKGUpIHsgc2lnbmFsRE9NRXZlbnQoY20sIGUpIHx8IGVfcHJldmVudERlZmF1bHQoZSk7IH0pO1xuICAgIC8vIFByZXZlbnQgbm9ybWFsIHNlbGVjdGlvbiBpbiB0aGUgZWRpdG9yICh3ZSBoYW5kbGUgb3VyIG93bilcbiAgICBvbihkLmxpbmVTcGFjZSwgXCJzZWxlY3RzdGFydFwiLCBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAoIWV2ZW50SW5XaWRnZXQoZCwgZSkpIGVfcHJldmVudERlZmF1bHQoZSk7XG4gICAgfSk7XG4gICAgLy8gU29tZSBicm93c2VycyBmaXJlIGNvbnRleHRtZW51ICphZnRlciogb3BlbmluZyB0aGUgbWVudSwgYXRcbiAgICAvLyB3aGljaCBwb2ludCB3ZSBjYW4ndCBtZXNzIHdpdGggaXQgYW55bW9yZS4gQ29udGV4dCBtZW51IGlzXG4gICAgLy8gaGFuZGxlZCBpbiBvbk1vdXNlRG93biBmb3IgdGhlc2UgYnJvd3NlcnMuXG4gICAgaWYgKCFjYXB0dXJlUmlnaHRDbGljaykgb24oZC5zY3JvbGxlciwgXCJjb250ZXh0bWVudVwiLCBmdW5jdGlvbihlKSB7b25Db250ZXh0TWVudShjbSwgZSk7fSk7XG5cbiAgICAvLyBTeW5jIHNjcm9sbGluZyBiZXR3ZWVuIGZha2Ugc2Nyb2xsYmFycyBhbmQgcmVhbCBzY3JvbGxhYmxlXG4gICAgLy8gYXJlYSwgZW5zdXJlIHZpZXdwb3J0IGlzIHVwZGF0ZWQgd2hlbiBzY3JvbGxpbmcuXG4gICAgb24oZC5zY3JvbGxlciwgXCJzY3JvbGxcIiwgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoZC5zY3JvbGxlci5jbGllbnRIZWlnaHQpIHtcbiAgICAgICAgc2V0U2Nyb2xsVG9wKGNtLCBkLnNjcm9sbGVyLnNjcm9sbFRvcCk7XG4gICAgICAgIHNldFNjcm9sbExlZnQoY20sIGQuc2Nyb2xsZXIuc2Nyb2xsTGVmdCwgdHJ1ZSk7XG4gICAgICAgIHNpZ25hbChjbSwgXCJzY3JvbGxcIiwgY20pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIG9uKGQuc2Nyb2xsYmFyViwgXCJzY3JvbGxcIiwgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoZC5zY3JvbGxlci5jbGllbnRIZWlnaHQpIHNldFNjcm9sbFRvcChjbSwgZC5zY3JvbGxiYXJWLnNjcm9sbFRvcCk7XG4gICAgfSk7XG4gICAgb24oZC5zY3JvbGxiYXJILCBcInNjcm9sbFwiLCBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChkLnNjcm9sbGVyLmNsaWVudEhlaWdodCkgc2V0U2Nyb2xsTGVmdChjbSwgZC5zY3JvbGxiYXJILnNjcm9sbExlZnQpO1xuICAgIH0pO1xuXG4gICAgLy8gTGlzdGVuIHRvIHdoZWVsIGV2ZW50cyBpbiBvcmRlciB0byB0cnkgYW5kIHVwZGF0ZSB0aGUgdmlld3BvcnQgb24gdGltZS5cbiAgICBvbihkLnNjcm9sbGVyLCBcIm1vdXNld2hlZWxcIiwgZnVuY3Rpb24oZSl7b25TY3JvbGxXaGVlbChjbSwgZSk7fSk7XG4gICAgb24oZC5zY3JvbGxlciwgXCJET01Nb3VzZVNjcm9sbFwiLCBmdW5jdGlvbihlKXtvblNjcm9sbFdoZWVsKGNtLCBlKTt9KTtcblxuICAgIC8vIFByZXZlbnQgY2xpY2tzIGluIHRoZSBzY3JvbGxiYXJzIGZyb20ga2lsbGluZyBmb2N1c1xuICAgIGZ1bmN0aW9uIHJlRm9jdXMoKSB7IGlmIChjbS5zdGF0ZS5mb2N1c2VkKSBzZXRUaW1lb3V0KGJpbmQoZm9jdXNJbnB1dCwgY20pLCAwKTsgfVxuICAgIG9uKGQuc2Nyb2xsYmFySCwgXCJtb3VzZWRvd25cIiwgcmVGb2N1cyk7XG4gICAgb24oZC5zY3JvbGxiYXJWLCBcIm1vdXNlZG93blwiLCByZUZvY3VzKTtcbiAgICAvLyBQcmV2ZW50IHdyYXBwZXIgZnJvbSBldmVyIHNjcm9sbGluZ1xuICAgIG9uKGQud3JhcHBlciwgXCJzY3JvbGxcIiwgZnVuY3Rpb24oKSB7IGQud3JhcHBlci5zY3JvbGxUb3AgPSBkLndyYXBwZXIuc2Nyb2xsTGVmdCA9IDA7IH0pO1xuXG4gICAgb24oZC5pbnB1dCwgXCJrZXl1cFwiLCBvcGVyYXRpb24oY20sIG9uS2V5VXApKTtcbiAgICBvbihkLmlucHV0LCBcImlucHV0XCIsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGllICYmICFpZV91cHRvOCAmJiBjbS5kaXNwbGF5LmlucHV0SGFzU2VsZWN0aW9uKSBjbS5kaXNwbGF5LmlucHV0SGFzU2VsZWN0aW9uID0gbnVsbDtcbiAgICAgIGZhc3RQb2xsKGNtKTtcbiAgICB9KTtcbiAgICBvbihkLmlucHV0LCBcImtleWRvd25cIiwgb3BlcmF0aW9uKGNtLCBvbktleURvd24pKTtcbiAgICBvbihkLmlucHV0LCBcImtleXByZXNzXCIsIG9wZXJhdGlvbihjbSwgb25LZXlQcmVzcykpO1xuICAgIG9uKGQuaW5wdXQsIFwiZm9jdXNcIiwgYmluZChvbkZvY3VzLCBjbSkpO1xuICAgIG9uKGQuaW5wdXQsIFwiYmx1clwiLCBiaW5kKG9uQmx1ciwgY20pKTtcblxuICAgIGZ1bmN0aW9uIGRyYWdfKGUpIHtcbiAgICAgIGlmICghc2lnbmFsRE9NRXZlbnQoY20sIGUpKSBlX3N0b3AoZSk7XG4gICAgfVxuICAgIGlmIChjbS5vcHRpb25zLmRyYWdEcm9wKSB7XG4gICAgICBvbihkLnNjcm9sbGVyLCBcImRyYWdzdGFydFwiLCBmdW5jdGlvbihlKXtvbkRyYWdTdGFydChjbSwgZSk7fSk7XG4gICAgICBvbihkLnNjcm9sbGVyLCBcImRyYWdlbnRlclwiLCBkcmFnXyk7XG4gICAgICBvbihkLnNjcm9sbGVyLCBcImRyYWdvdmVyXCIsIGRyYWdfKTtcbiAgICAgIG9uKGQuc2Nyb2xsZXIsIFwiZHJvcFwiLCBvcGVyYXRpb24oY20sIG9uRHJvcCkpO1xuICAgIH1cbiAgICBvbihkLnNjcm9sbGVyLCBcInBhc3RlXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmIChldmVudEluV2lkZ2V0KGQsIGUpKSByZXR1cm47XG4gICAgICBjbS5zdGF0ZS5wYXN0ZUluY29taW5nID0gdHJ1ZTtcbiAgICAgIGZvY3VzSW5wdXQoY20pO1xuICAgICAgZmFzdFBvbGwoY20pO1xuICAgIH0pO1xuICAgIG9uKGQuaW5wdXQsIFwicGFzdGVcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAvLyBXb3JrYXJvdW5kIGZvciB3ZWJraXQgYnVnIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD05MDIwNlxuICAgICAgLy8gQWRkIGEgY2hhciB0byB0aGUgZW5kIG9mIHRleHRhcmVhIGJlZm9yZSBwYXN0ZSBvY2N1ciBzbyB0aGF0XG4gICAgICAvLyBzZWxlY3Rpb24gZG9lc24ndCBzcGFuIHRvIHRoZSBlbmQgb2YgdGV4dGFyZWEuXG4gICAgICBpZiAod2Via2l0ICYmICFjbS5zdGF0ZS5mYWtlZExhc3RDaGFyICYmICEobmV3IERhdGUgLSBjbS5zdGF0ZS5sYXN0TWlkZGxlRG93biA8IDIwMCkpIHtcbiAgICAgICAgdmFyIHN0YXJ0ID0gZC5pbnB1dC5zZWxlY3Rpb25TdGFydCwgZW5kID0gZC5pbnB1dC5zZWxlY3Rpb25FbmQ7XG4gICAgICAgIGQuaW5wdXQudmFsdWUgKz0gXCIkXCI7XG4gICAgICAgIGQuaW5wdXQuc2VsZWN0aW9uU3RhcnQgPSBzdGFydDtcbiAgICAgICAgZC5pbnB1dC5zZWxlY3Rpb25FbmQgPSBlbmQ7XG4gICAgICAgIGNtLnN0YXRlLmZha2VkTGFzdENoYXIgPSB0cnVlO1xuICAgICAgfVxuICAgICAgY20uc3RhdGUucGFzdGVJbmNvbWluZyA9IHRydWU7XG4gICAgICBmYXN0UG9sbChjbSk7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBwcmVwYXJlQ29weUN1dChlKSB7XG4gICAgICBpZiAoY20uc29tZXRoaW5nU2VsZWN0ZWQoKSkge1xuICAgICAgICBpZiAoZC5pbmFjY3VyYXRlU2VsZWN0aW9uKSB7XG4gICAgICAgICAgZC5wcmV2SW5wdXQgPSBcIlwiO1xuICAgICAgICAgIGQuaW5hY2N1cmF0ZVNlbGVjdGlvbiA9IGZhbHNlO1xuICAgICAgICAgIGQuaW5wdXQudmFsdWUgPSBjbS5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgICBzZWxlY3RJbnB1dChkLmlucHV0KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHRleHQgPSBcIlwiLCByYW5nZXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbS5kb2Muc2VsLnJhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBsaW5lID0gY20uZG9jLnNlbC5yYW5nZXNbaV0uaGVhZC5saW5lO1xuICAgICAgICAgIHZhciBsaW5lUmFuZ2UgPSB7YW5jaG9yOiBQb3MobGluZSwgMCksIGhlYWQ6IFBvcyhsaW5lICsgMSwgMCl9O1xuICAgICAgICAgIHJhbmdlcy5wdXNoKGxpbmVSYW5nZSk7XG4gICAgICAgICAgdGV4dCArPSBjbS5nZXRSYW5nZShsaW5lUmFuZ2UuYW5jaG9yLCBsaW5lUmFuZ2UuaGVhZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGUudHlwZSA9PSBcImN1dFwiKSB7XG4gICAgICAgICAgY20uc2V0U2VsZWN0aW9ucyhyYW5nZXMsIG51bGwsIHNlbF9kb250U2Nyb2xsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkLnByZXZJbnB1dCA9IFwiXCI7XG4gICAgICAgICAgZC5pbnB1dC52YWx1ZSA9IHRleHQ7XG4gICAgICAgICAgc2VsZWN0SW5wdXQoZC5pbnB1dCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChlLnR5cGUgPT0gXCJjdXRcIikgY20uc3RhdGUuY3V0SW5jb21pbmcgPSB0cnVlO1xuICAgIH1cbiAgICBvbihkLmlucHV0LCBcImN1dFwiLCBwcmVwYXJlQ29weUN1dCk7XG4gICAgb24oZC5pbnB1dCwgXCJjb3B5XCIsIHByZXBhcmVDb3B5Q3V0KTtcblxuICAgIC8vIE5lZWRlZCB0byBoYW5kbGUgVGFiIGtleSBpbiBLSFRNTFxuICAgIGlmIChraHRtbCkgb24oZC5zaXplciwgXCJtb3VzZXVwXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGFjdGl2ZUVsdCgpID09IGQuaW5wdXQpIGQuaW5wdXQuYmx1cigpO1xuICAgICAgZm9jdXNJbnB1dChjbSk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBDYWxsZWQgd2hlbiB0aGUgd2luZG93IHJlc2l6ZXNcbiAgZnVuY3Rpb24gb25SZXNpemUoY20pIHtcbiAgICAvLyBNaWdodCBiZSBhIHRleHQgc2NhbGluZyBvcGVyYXRpb24sIGNsZWFyIHNpemUgY2FjaGVzLlxuICAgIHZhciBkID0gY20uZGlzcGxheTtcbiAgICBkLmNhY2hlZENoYXJXaWR0aCA9IGQuY2FjaGVkVGV4dEhlaWdodCA9IGQuY2FjaGVkUGFkZGluZ0ggPSBudWxsO1xuICAgIGNtLnNldFNpemUoKTtcbiAgfVxuXG4gIC8vIE1PVVNFIEVWRU5UU1xuXG4gIC8vIFJldHVybiB0cnVlIHdoZW4gdGhlIGdpdmVuIG1vdXNlIGV2ZW50IGhhcHBlbmVkIGluIGEgd2lkZ2V0XG4gIGZ1bmN0aW9uIGV2ZW50SW5XaWRnZXQoZGlzcGxheSwgZSkge1xuICAgIGZvciAodmFyIG4gPSBlX3RhcmdldChlKTsgbiAhPSBkaXNwbGF5LndyYXBwZXI7IG4gPSBuLnBhcmVudE5vZGUpIHtcbiAgICAgIGlmICghbiB8fCBuLmlnbm9yZUV2ZW50cyB8fCBuLnBhcmVudE5vZGUgPT0gZGlzcGxheS5zaXplciAmJiBuICE9IGRpc3BsYXkubW92ZXIpIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIC8vIEdpdmVuIGEgbW91c2UgZXZlbnQsIGZpbmQgdGhlIGNvcnJlc3BvbmRpbmcgcG9zaXRpb24uIElmIGxpYmVyYWxcbiAgLy8gaXMgZmFsc2UsIGl0IGNoZWNrcyB3aGV0aGVyIGEgZ3V0dGVyIG9yIHNjcm9sbGJhciB3YXMgY2xpY2tlZCxcbiAgLy8gYW5kIHJldHVybnMgbnVsbCBpZiBpdCB3YXMuIGZvclJlY3QgaXMgdXNlZCBieSByZWN0YW5ndWxhclxuICAvLyBzZWxlY3Rpb25zLCBhbmQgdHJpZXMgdG8gZXN0aW1hdGUgYSBjaGFyYWN0ZXIgcG9zaXRpb24gZXZlbiBmb3JcbiAgLy8gY29vcmRpbmF0ZXMgYmV5b25kIHRoZSByaWdodCBvZiB0aGUgdGV4dC5cbiAgZnVuY3Rpb24gcG9zRnJvbU1vdXNlKGNtLCBlLCBsaWJlcmFsLCBmb3JSZWN0KSB7XG4gICAgdmFyIGRpc3BsYXkgPSBjbS5kaXNwbGF5O1xuICAgIGlmICghbGliZXJhbCkge1xuICAgICAgdmFyIHRhcmdldCA9IGVfdGFyZ2V0KGUpO1xuICAgICAgaWYgKHRhcmdldCA9PSBkaXNwbGF5LnNjcm9sbGJhckggfHwgdGFyZ2V0ID09IGRpc3BsYXkuc2Nyb2xsYmFyViB8fFxuICAgICAgICAgIHRhcmdldCA9PSBkaXNwbGF5LnNjcm9sbGJhckZpbGxlciB8fCB0YXJnZXQgPT0gZGlzcGxheS5ndXR0ZXJGaWxsZXIpIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB2YXIgeCwgeSwgc3BhY2UgPSBkaXNwbGF5LmxpbmVTcGFjZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAvLyBGYWlscyB1bnByZWRpY3RhYmx5IG9uIElFWzY3XSB3aGVuIG1vdXNlIGlzIGRyYWdnZWQgYXJvdW5kIHF1aWNrbHkuXG4gICAgdHJ5IHsgeCA9IGUuY2xpZW50WCAtIHNwYWNlLmxlZnQ7IHkgPSBlLmNsaWVudFkgLSBzcGFjZS50b3A7IH1cbiAgICBjYXRjaCAoZSkgeyByZXR1cm4gbnVsbDsgfVxuICAgIHZhciBjb29yZHMgPSBjb29yZHNDaGFyKGNtLCB4LCB5KSwgbGluZTtcbiAgICBpZiAoZm9yUmVjdCAmJiBjb29yZHMueFJlbCA9PSAxICYmIChsaW5lID0gZ2V0TGluZShjbS5kb2MsIGNvb3Jkcy5saW5lKS50ZXh0KS5sZW5ndGggPT0gY29vcmRzLmNoKSB7XG4gICAgICB2YXIgY29sRGlmZiA9IGNvdW50Q29sdW1uKGxpbmUsIGxpbmUubGVuZ3RoLCBjbS5vcHRpb25zLnRhYlNpemUpIC0gbGluZS5sZW5ndGg7XG4gICAgICBjb29yZHMgPSBQb3MoY29vcmRzLmxpbmUsIE1hdGgubWF4KDAsIE1hdGgucm91bmQoKHggLSBwYWRkaW5nSChjbS5kaXNwbGF5KS5sZWZ0KSAvIGNoYXJXaWR0aChjbS5kaXNwbGF5KSkgLSBjb2xEaWZmKSk7XG4gICAgfVxuICAgIHJldHVybiBjb29yZHM7XG4gIH1cblxuICAvLyBBIG1vdXNlIGRvd24gY2FuIGJlIGEgc2luZ2xlIGNsaWNrLCBkb3VibGUgY2xpY2ssIHRyaXBsZSBjbGljayxcbiAgLy8gc3RhcnQgb2Ygc2VsZWN0aW9uIGRyYWcsIHN0YXJ0IG9mIHRleHQgZHJhZywgbmV3IGN1cnNvclxuICAvLyAoY3RybC1jbGljayksIHJlY3RhbmdsZSBkcmFnIChhbHQtZHJhZyksIG9yIHh3aW5cbiAgLy8gbWlkZGxlLWNsaWNrLXBhc3RlLiBPciBpdCBtaWdodCBiZSBhIGNsaWNrIG9uIHNvbWV0aGluZyB3ZSBzaG91bGRcbiAgLy8gbm90IGludGVyZmVyZSB3aXRoLCBzdWNoIGFzIGEgc2Nyb2xsYmFyIG9yIHdpZGdldC5cbiAgZnVuY3Rpb24gb25Nb3VzZURvd24oZSkge1xuICAgIGlmIChzaWduYWxET01FdmVudCh0aGlzLCBlKSkgcmV0dXJuO1xuICAgIHZhciBjbSA9IHRoaXMsIGRpc3BsYXkgPSBjbS5kaXNwbGF5O1xuICAgIGRpc3BsYXkuc2hpZnQgPSBlLnNoaWZ0S2V5O1xuXG4gICAgaWYgKGV2ZW50SW5XaWRnZXQoZGlzcGxheSwgZSkpIHtcbiAgICAgIGlmICghd2Via2l0KSB7XG4gICAgICAgIC8vIEJyaWVmbHkgdHVybiBvZmYgZHJhZ2dhYmlsaXR5LCB0byBhbGxvdyB3aWRnZXRzIHRvIGRvXG4gICAgICAgIC8vIG5vcm1hbCBkcmFnZ2luZyB0aGluZ3MuXG4gICAgICAgIGRpc3BsYXkuc2Nyb2xsZXIuZHJhZ2dhYmxlID0gZmFsc2U7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtkaXNwbGF5LnNjcm9sbGVyLmRyYWdnYWJsZSA9IHRydWU7fSwgMTAwKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGNsaWNrSW5HdXR0ZXIoY20sIGUpKSByZXR1cm47XG4gICAgdmFyIHN0YXJ0ID0gcG9zRnJvbU1vdXNlKGNtLCBlKTtcbiAgICB3aW5kb3cuZm9jdXMoKTtcblxuICAgIHN3aXRjaCAoZV9idXR0b24oZSkpIHtcbiAgICBjYXNlIDE6XG4gICAgICBpZiAoc3RhcnQpXG4gICAgICAgIGxlZnRCdXR0b25Eb3duKGNtLCBlLCBzdGFydCk7XG4gICAgICBlbHNlIGlmIChlX3RhcmdldChlKSA9PSBkaXNwbGF5LnNjcm9sbGVyKVxuICAgICAgICBlX3ByZXZlbnREZWZhdWx0KGUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAyOlxuICAgICAgaWYgKHdlYmtpdCkgY20uc3RhdGUubGFzdE1pZGRsZURvd24gPSArbmV3IERhdGU7XG4gICAgICBpZiAoc3RhcnQpIGV4dGVuZFNlbGVjdGlvbihjbS5kb2MsIHN0YXJ0KTtcbiAgICAgIHNldFRpbWVvdXQoYmluZChmb2N1c0lucHV0LCBjbSksIDIwKTtcbiAgICAgIGVfcHJldmVudERlZmF1bHQoZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDM6XG4gICAgICBpZiAoY2FwdHVyZVJpZ2h0Q2xpY2spIG9uQ29udGV4dE1lbnUoY20sIGUpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdmFyIGxhc3RDbGljaywgbGFzdERvdWJsZUNsaWNrO1xuICBmdW5jdGlvbiBsZWZ0QnV0dG9uRG93bihjbSwgZSwgc3RhcnQpIHtcbiAgICBzZXRUaW1lb3V0KGJpbmQoZW5zdXJlRm9jdXMsIGNtKSwgMCk7XG5cbiAgICB2YXIgbm93ID0gK25ldyBEYXRlLCB0eXBlO1xuICAgIGlmIChsYXN0RG91YmxlQ2xpY2sgJiYgbGFzdERvdWJsZUNsaWNrLnRpbWUgPiBub3cgLSA0MDAgJiYgY21wKGxhc3REb3VibGVDbGljay5wb3MsIHN0YXJ0KSA9PSAwKSB7XG4gICAgICB0eXBlID0gXCJ0cmlwbGVcIjtcbiAgICB9IGVsc2UgaWYgKGxhc3RDbGljayAmJiBsYXN0Q2xpY2sudGltZSA+IG5vdyAtIDQwMCAmJiBjbXAobGFzdENsaWNrLnBvcywgc3RhcnQpID09IDApIHtcbiAgICAgIHR5cGUgPSBcImRvdWJsZVwiO1xuICAgICAgbGFzdERvdWJsZUNsaWNrID0ge3RpbWU6IG5vdywgcG9zOiBzdGFydH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHR5cGUgPSBcInNpbmdsZVwiO1xuICAgICAgbGFzdENsaWNrID0ge3RpbWU6IG5vdywgcG9zOiBzdGFydH07XG4gICAgfVxuXG4gICAgdmFyIHNlbCA9IGNtLmRvYy5zZWwsIG1vZGlmaWVyID0gbWFjID8gZS5tZXRhS2V5IDogZS5jdHJsS2V5O1xuICAgIGlmIChjbS5vcHRpb25zLmRyYWdEcm9wICYmIGRyYWdBbmREcm9wICYmICFpc1JlYWRPbmx5KGNtKSAmJlxuICAgICAgICB0eXBlID09IFwic2luZ2xlXCIgJiYgc2VsLmNvbnRhaW5zKHN0YXJ0KSA+IC0xICYmIHNlbC5zb21ldGhpbmdTZWxlY3RlZCgpKVxuICAgICAgbGVmdEJ1dHRvblN0YXJ0RHJhZyhjbSwgZSwgc3RhcnQsIG1vZGlmaWVyKTtcbiAgICBlbHNlXG4gICAgICBsZWZ0QnV0dG9uU2VsZWN0KGNtLCBlLCBzdGFydCwgdHlwZSwgbW9kaWZpZXIpO1xuICB9XG5cbiAgLy8gU3RhcnQgYSB0ZXh0IGRyYWcuIFdoZW4gaXQgZW5kcywgc2VlIGlmIGFueSBkcmFnZ2luZyBhY3R1YWxseVxuICAvLyBoYXBwZW4sIGFuZCB0cmVhdCBhcyBhIGNsaWNrIGlmIGl0IGRpZG4ndC5cbiAgZnVuY3Rpb24gbGVmdEJ1dHRvblN0YXJ0RHJhZyhjbSwgZSwgc3RhcnQsIG1vZGlmaWVyKSB7XG4gICAgdmFyIGRpc3BsYXkgPSBjbS5kaXNwbGF5O1xuICAgIHZhciBkcmFnRW5kID0gb3BlcmF0aW9uKGNtLCBmdW5jdGlvbihlMikge1xuICAgICAgaWYgKHdlYmtpdCkgZGlzcGxheS5zY3JvbGxlci5kcmFnZ2FibGUgPSBmYWxzZTtcbiAgICAgIGNtLnN0YXRlLmRyYWdnaW5nVGV4dCA9IGZhbHNlO1xuICAgICAgb2ZmKGRvY3VtZW50LCBcIm1vdXNldXBcIiwgZHJhZ0VuZCk7XG4gICAgICBvZmYoZGlzcGxheS5zY3JvbGxlciwgXCJkcm9wXCIsIGRyYWdFbmQpO1xuICAgICAgaWYgKE1hdGguYWJzKGUuY2xpZW50WCAtIGUyLmNsaWVudFgpICsgTWF0aC5hYnMoZS5jbGllbnRZIC0gZTIuY2xpZW50WSkgPCAxMCkge1xuICAgICAgICBlX3ByZXZlbnREZWZhdWx0KGUyKTtcbiAgICAgICAgaWYgKCFtb2RpZmllcilcbiAgICAgICAgICBleHRlbmRTZWxlY3Rpb24oY20uZG9jLCBzdGFydCk7XG4gICAgICAgIGZvY3VzSW5wdXQoY20pO1xuICAgICAgICAvLyBXb3JrIGFyb3VuZCB1bmV4cGxhaW5hYmxlIGZvY3VzIHByb2JsZW0gaW4gSUU5ICgjMjEyNylcbiAgICAgICAgaWYgKGllX3VwdG8xMCAmJiAhaWVfdXB0bzgpXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtkb2N1bWVudC5ib2R5LmZvY3VzKCk7IGZvY3VzSW5wdXQoY20pO30sIDIwKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICAvLyBMZXQgdGhlIGRyYWcgaGFuZGxlciBoYW5kbGUgdGhpcy5cbiAgICBpZiAod2Via2l0KSBkaXNwbGF5LnNjcm9sbGVyLmRyYWdnYWJsZSA9IHRydWU7XG4gICAgY20uc3RhdGUuZHJhZ2dpbmdUZXh0ID0gZHJhZ0VuZDtcbiAgICAvLyBJRSdzIGFwcHJvYWNoIHRvIGRyYWdnYWJsZVxuICAgIGlmIChkaXNwbGF5LnNjcm9sbGVyLmRyYWdEcm9wKSBkaXNwbGF5LnNjcm9sbGVyLmRyYWdEcm9wKCk7XG4gICAgb24oZG9jdW1lbnQsIFwibW91c2V1cFwiLCBkcmFnRW5kKTtcbiAgICBvbihkaXNwbGF5LnNjcm9sbGVyLCBcImRyb3BcIiwgZHJhZ0VuZCk7XG4gIH1cblxuICAvLyBOb3JtYWwgc2VsZWN0aW9uLCBhcyBvcHBvc2VkIHRvIHRleHQgZHJhZ2dpbmcuXG4gIGZ1bmN0aW9uIGxlZnRCdXR0b25TZWxlY3QoY20sIGUsIHN0YXJ0LCB0eXBlLCBhZGROZXcpIHtcbiAgICB2YXIgZGlzcGxheSA9IGNtLmRpc3BsYXksIGRvYyA9IGNtLmRvYztcbiAgICBlX3ByZXZlbnREZWZhdWx0KGUpO1xuXG4gICAgdmFyIG91clJhbmdlLCBvdXJJbmRleCwgc3RhcnRTZWwgPSBkb2Muc2VsO1xuICAgIGlmIChhZGROZXcgJiYgIWUuc2hpZnRLZXkpIHtcbiAgICAgIG91ckluZGV4ID0gZG9jLnNlbC5jb250YWlucyhzdGFydCk7XG4gICAgICBpZiAob3VySW5kZXggPiAtMSlcbiAgICAgICAgb3VyUmFuZ2UgPSBkb2Muc2VsLnJhbmdlc1tvdXJJbmRleF07XG4gICAgICBlbHNlXG4gICAgICAgIG91clJhbmdlID0gbmV3IFJhbmdlKHN0YXJ0LCBzdGFydCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91clJhbmdlID0gZG9jLnNlbC5wcmltYXJ5KCk7XG4gICAgfVxuXG4gICAgaWYgKGUuYWx0S2V5KSB7XG4gICAgICB0eXBlID0gXCJyZWN0XCI7XG4gICAgICBpZiAoIWFkZE5ldykgb3VyUmFuZ2UgPSBuZXcgUmFuZ2Uoc3RhcnQsIHN0YXJ0KTtcbiAgICAgIHN0YXJ0ID0gcG9zRnJvbU1vdXNlKGNtLCBlLCB0cnVlLCB0cnVlKTtcbiAgICAgIG91ckluZGV4ID0gLTE7XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFwiZG91YmxlXCIpIHtcbiAgICAgIHZhciB3b3JkID0gZmluZFdvcmRBdChjbSwgc3RhcnQpO1xuICAgICAgaWYgKGNtLmRpc3BsYXkuc2hpZnQgfHwgZG9jLmV4dGVuZClcbiAgICAgICAgb3VyUmFuZ2UgPSBleHRlbmRSYW5nZShkb2MsIG91clJhbmdlLCB3b3JkLmFuY2hvciwgd29yZC5oZWFkKTtcbiAgICAgIGVsc2VcbiAgICAgICAgb3VyUmFuZ2UgPSB3b3JkO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcInRyaXBsZVwiKSB7XG4gICAgICB2YXIgbGluZSA9IG5ldyBSYW5nZShQb3Moc3RhcnQubGluZSwgMCksIGNsaXBQb3MoZG9jLCBQb3Moc3RhcnQubGluZSArIDEsIDApKSk7XG4gICAgICBpZiAoY20uZGlzcGxheS5zaGlmdCB8fCBkb2MuZXh0ZW5kKVxuICAgICAgICBvdXJSYW5nZSA9IGV4dGVuZFJhbmdlKGRvYywgb3VyUmFuZ2UsIGxpbmUuYW5jaG9yLCBsaW5lLmhlYWQpO1xuICAgICAgZWxzZVxuICAgICAgICBvdXJSYW5nZSA9IGxpbmU7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91clJhbmdlID0gZXh0ZW5kUmFuZ2UoZG9jLCBvdXJSYW5nZSwgc3RhcnQpO1xuICAgIH1cblxuICAgIGlmICghYWRkTmV3KSB7XG4gICAgICBvdXJJbmRleCA9IDA7XG4gICAgICBzZXRTZWxlY3Rpb24oZG9jLCBuZXcgU2VsZWN0aW9uKFtvdXJSYW5nZV0sIDApLCBzZWxfbW91c2UpO1xuICAgICAgc3RhcnRTZWwgPSBkb2Muc2VsO1xuICAgIH0gZWxzZSBpZiAob3VySW5kZXggPiAtMSkge1xuICAgICAgcmVwbGFjZU9uZVNlbGVjdGlvbihkb2MsIG91ckluZGV4LCBvdXJSYW5nZSwgc2VsX21vdXNlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3VySW5kZXggPSBkb2Muc2VsLnJhbmdlcy5sZW5ndGg7XG4gICAgICBzZXRTZWxlY3Rpb24oZG9jLCBub3JtYWxpemVTZWxlY3Rpb24oZG9jLnNlbC5yYW5nZXMuY29uY2F0KFtvdXJSYW5nZV0pLCBvdXJJbmRleCksXG4gICAgICAgICAgICAgICAgICAge3Njcm9sbDogZmFsc2UsIG9yaWdpbjogXCIqbW91c2VcIn0pO1xuICAgIH1cblxuICAgIHZhciBsYXN0UG9zID0gc3RhcnQ7XG4gICAgZnVuY3Rpb24gZXh0ZW5kVG8ocG9zKSB7XG4gICAgICBpZiAoY21wKGxhc3RQb3MsIHBvcykgPT0gMCkgcmV0dXJuO1xuICAgICAgbGFzdFBvcyA9IHBvcztcblxuICAgICAgaWYgKHR5cGUgPT0gXCJyZWN0XCIpIHtcbiAgICAgICAgdmFyIHJhbmdlcyA9IFtdLCB0YWJTaXplID0gY20ub3B0aW9ucy50YWJTaXplO1xuICAgICAgICB2YXIgc3RhcnRDb2wgPSBjb3VudENvbHVtbihnZXRMaW5lKGRvYywgc3RhcnQubGluZSkudGV4dCwgc3RhcnQuY2gsIHRhYlNpemUpO1xuICAgICAgICB2YXIgcG9zQ29sID0gY291bnRDb2x1bW4oZ2V0TGluZShkb2MsIHBvcy5saW5lKS50ZXh0LCBwb3MuY2gsIHRhYlNpemUpO1xuICAgICAgICB2YXIgbGVmdCA9IE1hdGgubWluKHN0YXJ0Q29sLCBwb3NDb2wpLCByaWdodCA9IE1hdGgubWF4KHN0YXJ0Q29sLCBwb3NDb2wpO1xuICAgICAgICBmb3IgKHZhciBsaW5lID0gTWF0aC5taW4oc3RhcnQubGluZSwgcG9zLmxpbmUpLCBlbmQgPSBNYXRoLm1pbihjbS5sYXN0TGluZSgpLCBNYXRoLm1heChzdGFydC5saW5lLCBwb3MubGluZSkpO1xuICAgICAgICAgICAgIGxpbmUgPD0gZW5kOyBsaW5lKyspIHtcbiAgICAgICAgICB2YXIgdGV4dCA9IGdldExpbmUoZG9jLCBsaW5lKS50ZXh0LCBsZWZ0UG9zID0gZmluZENvbHVtbih0ZXh0LCBsZWZ0LCB0YWJTaXplKTtcbiAgICAgICAgICBpZiAobGVmdCA9PSByaWdodClcbiAgICAgICAgICAgIHJhbmdlcy5wdXNoKG5ldyBSYW5nZShQb3MobGluZSwgbGVmdFBvcyksIFBvcyhsaW5lLCBsZWZ0UG9zKSkpO1xuICAgICAgICAgIGVsc2UgaWYgKHRleHQubGVuZ3RoID4gbGVmdFBvcylcbiAgICAgICAgICAgIHJhbmdlcy5wdXNoKG5ldyBSYW5nZShQb3MobGluZSwgbGVmdFBvcyksIFBvcyhsaW5lLCBmaW5kQ29sdW1uKHRleHQsIHJpZ2h0LCB0YWJTaXplKSkpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXJhbmdlcy5sZW5ndGgpIHJhbmdlcy5wdXNoKG5ldyBSYW5nZShzdGFydCwgc3RhcnQpKTtcbiAgICAgICAgc2V0U2VsZWN0aW9uKGRvYywgbm9ybWFsaXplU2VsZWN0aW9uKHN0YXJ0U2VsLnJhbmdlcy5zbGljZSgwLCBvdXJJbmRleCkuY29uY2F0KHJhbmdlcyksIG91ckluZGV4KSxcbiAgICAgICAgICAgICAgICAgICAgIHtvcmlnaW46IFwiKm1vdXNlXCIsIHNjcm9sbDogZmFsc2V9KTtcbiAgICAgICAgY20uc2Nyb2xsSW50b1ZpZXcocG9zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBvbGRSYW5nZSA9IG91clJhbmdlO1xuICAgICAgICB2YXIgYW5jaG9yID0gb2xkUmFuZ2UuYW5jaG9yLCBoZWFkID0gcG9zO1xuICAgICAgICBpZiAodHlwZSAhPSBcInNpbmdsZVwiKSB7XG4gICAgICAgICAgaWYgKHR5cGUgPT0gXCJkb3VibGVcIilcbiAgICAgICAgICAgIHZhciByYW5nZSA9IGZpbmRXb3JkQXQoY20sIHBvcyk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgdmFyIHJhbmdlID0gbmV3IFJhbmdlKFBvcyhwb3MubGluZSwgMCksIGNsaXBQb3MoZG9jLCBQb3MocG9zLmxpbmUgKyAxLCAwKSkpO1xuICAgICAgICAgIGlmIChjbXAocmFuZ2UuYW5jaG9yLCBhbmNob3IpID4gMCkge1xuICAgICAgICAgICAgaGVhZCA9IHJhbmdlLmhlYWQ7XG4gICAgICAgICAgICBhbmNob3IgPSBtaW5Qb3Mob2xkUmFuZ2UuZnJvbSgpLCByYW5nZS5hbmNob3IpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoZWFkID0gcmFuZ2UuYW5jaG9yO1xuICAgICAgICAgICAgYW5jaG9yID0gbWF4UG9zKG9sZFJhbmdlLnRvKCksIHJhbmdlLmhlYWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgcmFuZ2VzID0gc3RhcnRTZWwucmFuZ2VzLnNsaWNlKDApO1xuICAgICAgICByYW5nZXNbb3VySW5kZXhdID0gbmV3IFJhbmdlKGNsaXBQb3MoZG9jLCBhbmNob3IpLCBoZWFkKTtcbiAgICAgICAgc2V0U2VsZWN0aW9uKGRvYywgbm9ybWFsaXplU2VsZWN0aW9uKHJhbmdlcywgb3VySW5kZXgpLCBzZWxfbW91c2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBlZGl0b3JTaXplID0gZGlzcGxheS53cmFwcGVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIC8vIFVzZWQgdG8gZW5zdXJlIHRpbWVvdXQgcmUtdHJpZXMgZG9uJ3QgZmlyZSB3aGVuIGFub3RoZXIgZXh0ZW5kXG4gICAgLy8gaGFwcGVuZWQgaW4gdGhlIG1lYW50aW1lIChjbGVhclRpbWVvdXQgaXNuJ3QgcmVsaWFibGUgLS0gYXRcbiAgICAvLyBsZWFzdCBvbiBDaHJvbWUsIHRoZSB0aW1lb3V0cyBzdGlsbCBoYXBwZW4gZXZlbiB3aGVuIGNsZWFyZWQsXG4gICAgLy8gaWYgdGhlIGNsZWFyIGhhcHBlbnMgYWZ0ZXIgdGhlaXIgc2NoZWR1bGVkIGZpcmluZyB0aW1lKS5cbiAgICB2YXIgY291bnRlciA9IDA7XG5cbiAgICBmdW5jdGlvbiBleHRlbmQoZSkge1xuICAgICAgdmFyIGN1ckNvdW50ID0gKytjb3VudGVyO1xuICAgICAgdmFyIGN1ciA9IHBvc0Zyb21Nb3VzZShjbSwgZSwgdHJ1ZSwgdHlwZSA9PSBcInJlY3RcIik7XG4gICAgICBpZiAoIWN1cikgcmV0dXJuO1xuICAgICAgaWYgKGNtcChjdXIsIGxhc3RQb3MpICE9IDApIHtcbiAgICAgICAgZW5zdXJlRm9jdXMoY20pO1xuICAgICAgICBleHRlbmRUbyhjdXIpO1xuICAgICAgICB2YXIgdmlzaWJsZSA9IHZpc2libGVMaW5lcyhkaXNwbGF5LCBkb2MpO1xuICAgICAgICBpZiAoY3VyLmxpbmUgPj0gdmlzaWJsZS50byB8fCBjdXIubGluZSA8IHZpc2libGUuZnJvbSlcbiAgICAgICAgICBzZXRUaW1lb3V0KG9wZXJhdGlvbihjbSwgZnVuY3Rpb24oKXtpZiAoY291bnRlciA9PSBjdXJDb3VudCkgZXh0ZW5kKGUpO30pLCAxNTApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIG91dHNpZGUgPSBlLmNsaWVudFkgPCBlZGl0b3JTaXplLnRvcCA/IC0yMCA6IGUuY2xpZW50WSA+IGVkaXRvclNpemUuYm90dG9tID8gMjAgOiAwO1xuICAgICAgICBpZiAob3V0c2lkZSkgc2V0VGltZW91dChvcGVyYXRpb24oY20sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmIChjb3VudGVyICE9IGN1ckNvdW50KSByZXR1cm47XG4gICAgICAgICAgZGlzcGxheS5zY3JvbGxlci5zY3JvbGxUb3AgKz0gb3V0c2lkZTtcbiAgICAgICAgICBleHRlbmQoZSk7XG4gICAgICAgIH0pLCA1MCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZG9uZShlKSB7XG4gICAgICBjb3VudGVyID0gSW5maW5pdHk7XG4gICAgICBlX3ByZXZlbnREZWZhdWx0KGUpO1xuICAgICAgZm9jdXNJbnB1dChjbSk7XG4gICAgICBvZmYoZG9jdW1lbnQsIFwibW91c2Vtb3ZlXCIsIG1vdmUpO1xuICAgICAgb2ZmKGRvY3VtZW50LCBcIm1vdXNldXBcIiwgdXApO1xuICAgICAgZG9jLmhpc3RvcnkubGFzdFNlbE9yaWdpbiA9IG51bGw7XG4gICAgfVxuXG4gICAgdmFyIG1vdmUgPSBvcGVyYXRpb24oY20sIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmICgoaWUgJiYgIWllX3VwdG85KSA/ICAhZS5idXR0b25zIDogIWVfYnV0dG9uKGUpKSBkb25lKGUpO1xuICAgICAgZWxzZSBleHRlbmQoZSk7XG4gICAgfSk7XG4gICAgdmFyIHVwID0gb3BlcmF0aW9uKGNtLCBkb25lKTtcbiAgICBvbihkb2N1bWVudCwgXCJtb3VzZW1vdmVcIiwgbW92ZSk7XG4gICAgb24oZG9jdW1lbnQsIFwibW91c2V1cFwiLCB1cCk7XG4gIH1cblxuICAvLyBEZXRlcm1pbmVzIHdoZXRoZXIgYW4gZXZlbnQgaGFwcGVuZWQgaW4gdGhlIGd1dHRlciwgYW5kIGZpcmVzIHRoZVxuICAvLyBoYW5kbGVycyBmb3IgdGhlIGNvcnJlc3BvbmRpbmcgZXZlbnQuXG4gIGZ1bmN0aW9uIGd1dHRlckV2ZW50KGNtLCBlLCB0eXBlLCBwcmV2ZW50LCBzaWduYWxmbikge1xuICAgIHRyeSB7IHZhciBtWCA9IGUuY2xpZW50WCwgbVkgPSBlLmNsaWVudFk7IH1cbiAgICBjYXRjaChlKSB7IHJldHVybiBmYWxzZTsgfVxuICAgIGlmIChtWCA+PSBNYXRoLmZsb29yKGNtLmRpc3BsYXkuZ3V0dGVycy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5yaWdodCkpIHJldHVybiBmYWxzZTtcbiAgICBpZiAocHJldmVudCkgZV9wcmV2ZW50RGVmYXVsdChlKTtcblxuICAgIHZhciBkaXNwbGF5ID0gY20uZGlzcGxheTtcbiAgICB2YXIgbGluZUJveCA9IGRpc3BsYXkubGluZURpdi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgIGlmIChtWSA+IGxpbmVCb3guYm90dG9tIHx8ICFoYXNIYW5kbGVyKGNtLCB0eXBlKSkgcmV0dXJuIGVfZGVmYXVsdFByZXZlbnRlZChlKTtcbiAgICBtWSAtPSBsaW5lQm94LnRvcCAtIGRpc3BsYXkudmlld09mZnNldDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY20ub3B0aW9ucy5ndXR0ZXJzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgZyA9IGRpc3BsYXkuZ3V0dGVycy5jaGlsZE5vZGVzW2ldO1xuICAgICAgaWYgKGcgJiYgZy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5yaWdodCA+PSBtWCkge1xuICAgICAgICB2YXIgbGluZSA9IGxpbmVBdEhlaWdodChjbS5kb2MsIG1ZKTtcbiAgICAgICAgdmFyIGd1dHRlciA9IGNtLm9wdGlvbnMuZ3V0dGVyc1tpXTtcbiAgICAgICAgc2lnbmFsZm4oY20sIHR5cGUsIGNtLCBsaW5lLCBndXR0ZXIsIGUpO1xuICAgICAgICByZXR1cm4gZV9kZWZhdWx0UHJldmVudGVkKGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNsaWNrSW5HdXR0ZXIoY20sIGUpIHtcbiAgICByZXR1cm4gZ3V0dGVyRXZlbnQoY20sIGUsIFwiZ3V0dGVyQ2xpY2tcIiwgdHJ1ZSwgc2lnbmFsTGF0ZXIpO1xuICB9XG5cbiAgLy8gS2x1ZGdlIHRvIHdvcmsgYXJvdW5kIHN0cmFuZ2UgSUUgYmVoYXZpb3Igd2hlcmUgaXQnbGwgc29tZXRpbWVzXG4gIC8vIHJlLWZpcmUgYSBzZXJpZXMgb2YgZHJhZy1yZWxhdGVkIGV2ZW50cyByaWdodCBhZnRlciB0aGUgZHJvcCAoIzE1NTEpXG4gIHZhciBsYXN0RHJvcCA9IDA7XG5cbiAgZnVuY3Rpb24gb25Ecm9wKGUpIHtcbiAgICB2YXIgY20gPSB0aGlzO1xuICAgIGlmIChzaWduYWxET01FdmVudChjbSwgZSkgfHwgZXZlbnRJbldpZGdldChjbS5kaXNwbGF5LCBlKSlcbiAgICAgIHJldHVybjtcbiAgICBlX3ByZXZlbnREZWZhdWx0KGUpO1xuICAgIGlmIChpZSkgbGFzdERyb3AgPSArbmV3IERhdGU7XG4gICAgdmFyIHBvcyA9IHBvc0Zyb21Nb3VzZShjbSwgZSwgdHJ1ZSksIGZpbGVzID0gZS5kYXRhVHJhbnNmZXIuZmlsZXM7XG4gICAgaWYgKCFwb3MgfHwgaXNSZWFkT25seShjbSkpIHJldHVybjtcbiAgICAvLyBNaWdodCBiZSBhIGZpbGUgZHJvcCwgaW4gd2hpY2ggY2FzZSB3ZSBzaW1wbHkgZXh0cmFjdCB0aGUgdGV4dFxuICAgIC8vIGFuZCBpbnNlcnQgaXQuXG4gICAgaWYgKGZpbGVzICYmIGZpbGVzLmxlbmd0aCAmJiB3aW5kb3cuRmlsZVJlYWRlciAmJiB3aW5kb3cuRmlsZSkge1xuICAgICAgdmFyIG4gPSBmaWxlcy5sZW5ndGgsIHRleHQgPSBBcnJheShuKSwgcmVhZCA9IDA7XG4gICAgICB2YXIgbG9hZEZpbGUgPSBmdW5jdGlvbihmaWxlLCBpKSB7XG4gICAgICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcjtcbiAgICAgICAgcmVhZGVyLm9ubG9hZCA9IG9wZXJhdGlvbihjbSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGV4dFtpXSA9IHJlYWRlci5yZXN1bHQ7XG4gICAgICAgICAgaWYgKCsrcmVhZCA9PSBuKSB7XG4gICAgICAgICAgICBwb3MgPSBjbGlwUG9zKGNtLmRvYywgcG9zKTtcbiAgICAgICAgICAgIHZhciBjaGFuZ2UgPSB7ZnJvbTogcG9zLCB0bzogcG9zLCB0ZXh0OiBzcGxpdExpbmVzKHRleHQuam9pbihcIlxcblwiKSksIG9yaWdpbjogXCJwYXN0ZVwifTtcbiAgICAgICAgICAgIG1ha2VDaGFuZ2UoY20uZG9jLCBjaGFuZ2UpO1xuICAgICAgICAgICAgc2V0U2VsZWN0aW9uUmVwbGFjZUhpc3RvcnkoY20uZG9jLCBzaW1wbGVTZWxlY3Rpb24ocG9zLCBjaGFuZ2VFbmQoY2hhbmdlKSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJlYWRlci5yZWFkQXNUZXh0KGZpbGUpO1xuICAgICAgfTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgKytpKSBsb2FkRmlsZShmaWxlc1tpXSwgaSk7XG4gICAgfSBlbHNlIHsgLy8gTm9ybWFsIGRyb3BcbiAgICAgIC8vIERvbid0IGRvIGEgcmVwbGFjZSBpZiB0aGUgZHJvcCBoYXBwZW5lZCBpbnNpZGUgb2YgdGhlIHNlbGVjdGVkIHRleHQuXG4gICAgICBpZiAoY20uc3RhdGUuZHJhZ2dpbmdUZXh0ICYmIGNtLmRvYy5zZWwuY29udGFpbnMocG9zKSA+IC0xKSB7XG4gICAgICAgIGNtLnN0YXRlLmRyYWdnaW5nVGV4dChlKTtcbiAgICAgICAgLy8gRW5zdXJlIHRoZSBlZGl0b3IgaXMgcmUtZm9jdXNlZFxuICAgICAgICBzZXRUaW1lb3V0KGJpbmQoZm9jdXNJbnB1dCwgY20pLCAyMCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciB0ZXh0ID0gZS5kYXRhVHJhbnNmZXIuZ2V0RGF0YShcIlRleHRcIik7XG4gICAgICAgIGlmICh0ZXh0KSB7XG4gICAgICAgICAgaWYgKGNtLnN0YXRlLmRyYWdnaW5nVGV4dCAmJiAhKG1hYyA/IGUubWV0YUtleSA6IGUuY3RybEtleSkpXG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSBjbS5saXN0U2VsZWN0aW9ucygpO1xuICAgICAgICAgIHNldFNlbGVjdGlvbk5vVW5kbyhjbS5kb2MsIHNpbXBsZVNlbGVjdGlvbihwb3MsIHBvcykpO1xuICAgICAgICAgIGlmIChzZWxlY3RlZCkgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWxlY3RlZC5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgIHJlcGxhY2VSYW5nZShjbS5kb2MsIFwiXCIsIHNlbGVjdGVkW2ldLmFuY2hvciwgc2VsZWN0ZWRbaV0uaGVhZCwgXCJkcmFnXCIpO1xuICAgICAgICAgIGNtLnJlcGxhY2VTZWxlY3Rpb24odGV4dCwgXCJhcm91bmRcIiwgXCJwYXN0ZVwiKTtcbiAgICAgICAgICBmb2N1c0lucHV0KGNtKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY2F0Y2goZSl7fVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uRHJhZ1N0YXJ0KGNtLCBlKSB7XG4gICAgaWYgKGllICYmICghY20uc3RhdGUuZHJhZ2dpbmdUZXh0IHx8ICtuZXcgRGF0ZSAtIGxhc3REcm9wIDwgMTAwKSkgeyBlX3N0b3AoZSk7IHJldHVybjsgfVxuICAgIGlmIChzaWduYWxET01FdmVudChjbSwgZSkgfHwgZXZlbnRJbldpZGdldChjbS5kaXNwbGF5LCBlKSkgcmV0dXJuO1xuXG4gICAgZS5kYXRhVHJhbnNmZXIuc2V0RGF0YShcIlRleHRcIiwgY20uZ2V0U2VsZWN0aW9uKCkpO1xuXG4gICAgLy8gVXNlIGR1bW15IGltYWdlIGluc3RlYWQgb2YgZGVmYXVsdCBicm93c2VycyBpbWFnZS5cbiAgICAvLyBSZWNlbnQgU2FmYXJpICh+Ni4wLjIpIGhhdmUgYSB0ZW5kZW5jeSB0byBzZWdmYXVsdCB3aGVuIHRoaXMgaGFwcGVucywgc28gd2UgZG9uJ3QgZG8gaXQgdGhlcmUuXG4gICAgaWYgKGUuZGF0YVRyYW5zZmVyLnNldERyYWdJbWFnZSAmJiAhc2FmYXJpKSB7XG4gICAgICB2YXIgaW1nID0gZWx0KFwiaW1nXCIsIG51bGwsIG51bGwsIFwicG9zaXRpb246IGZpeGVkOyBsZWZ0OiAwOyB0b3A6IDA7XCIpO1xuICAgICAgaW1nLnNyYyA9IFwiZGF0YTppbWFnZS9naWY7YmFzZTY0LFIwbEdPRGxoQVFBQkFBQUFBQ0g1QkFFS0FBRUFMQUFBQUFBQkFBRUFBQUlDVEFFQU93PT1cIjtcbiAgICAgIGlmIChwcmVzdG8pIHtcbiAgICAgICAgaW1nLndpZHRoID0gaW1nLmhlaWdodCA9IDE7XG4gICAgICAgIGNtLmRpc3BsYXkud3JhcHBlci5hcHBlbmRDaGlsZChpbWcpO1xuICAgICAgICAvLyBGb3JjZSBhIHJlbGF5b3V0LCBvciBPcGVyYSB3b24ndCB1c2Ugb3VyIGltYWdlIGZvciBzb21lIG9ic2N1cmUgcmVhc29uXG4gICAgICAgIGltZy5fdG9wID0gaW1nLm9mZnNldFRvcDtcbiAgICAgIH1cbiAgICAgIGUuZGF0YVRyYW5zZmVyLnNldERyYWdJbWFnZShpbWcsIDAsIDApO1xuICAgICAgaWYgKHByZXN0bykgaW1nLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoaW1nKTtcbiAgICB9XG4gIH1cblxuICAvLyBTQ1JPTEwgRVZFTlRTXG5cbiAgLy8gU3luYyB0aGUgc2Nyb2xsYWJsZSBhcmVhIGFuZCBzY3JvbGxiYXJzLCBlbnN1cmUgdGhlIHZpZXdwb3J0XG4gIC8vIGNvdmVycyB0aGUgdmlzaWJsZSBhcmVhLlxuICBmdW5jdGlvbiBzZXRTY3JvbGxUb3AoY20sIHZhbCkge1xuICAgIGlmIChNYXRoLmFicyhjbS5kb2Muc2Nyb2xsVG9wIC0gdmFsKSA8IDIpIHJldHVybjtcbiAgICBjbS5kb2Muc2Nyb2xsVG9wID0gdmFsO1xuICAgIGlmICghZ2Vja28pIHVwZGF0ZURpc3BsYXkoY20sIHt0b3A6IHZhbH0pO1xuICAgIGlmIChjbS5kaXNwbGF5LnNjcm9sbGVyLnNjcm9sbFRvcCAhPSB2YWwpIGNtLmRpc3BsYXkuc2Nyb2xsZXIuc2Nyb2xsVG9wID0gdmFsO1xuICAgIGlmIChjbS5kaXNwbGF5LnNjcm9sbGJhclYuc2Nyb2xsVG9wICE9IHZhbCkgY20uZGlzcGxheS5zY3JvbGxiYXJWLnNjcm9sbFRvcCA9IHZhbDtcbiAgICBpZiAoZ2Vja28pIHVwZGF0ZURpc3BsYXkoY20pO1xuICAgIHN0YXJ0V29ya2VyKGNtLCAxMDApO1xuICB9XG4gIC8vIFN5bmMgc2Nyb2xsZXIgYW5kIHNjcm9sbGJhciwgZW5zdXJlIHRoZSBndXR0ZXIgZWxlbWVudHMgYXJlXG4gIC8vIGFsaWduZWQuXG4gIGZ1bmN0aW9uIHNldFNjcm9sbExlZnQoY20sIHZhbCwgaXNTY3JvbGxlcikge1xuICAgIGlmIChpc1Njcm9sbGVyID8gdmFsID09IGNtLmRvYy5zY3JvbGxMZWZ0IDogTWF0aC5hYnMoY20uZG9jLnNjcm9sbExlZnQgLSB2YWwpIDwgMikgcmV0dXJuO1xuICAgIHZhbCA9IE1hdGgubWluKHZhbCwgY20uZGlzcGxheS5zY3JvbGxlci5zY3JvbGxXaWR0aCAtIGNtLmRpc3BsYXkuc2Nyb2xsZXIuY2xpZW50V2lkdGgpO1xuICAgIGNtLmRvYy5zY3JvbGxMZWZ0ID0gdmFsO1xuICAgIGFsaWduSG9yaXpvbnRhbGx5KGNtKTtcbiAgICBpZiAoY20uZGlzcGxheS5zY3JvbGxlci5zY3JvbGxMZWZ0ICE9IHZhbCkgY20uZGlzcGxheS5zY3JvbGxlci5zY3JvbGxMZWZ0ID0gdmFsO1xuICAgIGlmIChjbS5kaXNwbGF5LnNjcm9sbGJhckguc2Nyb2xsTGVmdCAhPSB2YWwpIGNtLmRpc3BsYXkuc2Nyb2xsYmFySC5zY3JvbGxMZWZ0ID0gdmFsO1xuICB9XG5cbiAgLy8gU2luY2UgdGhlIGRlbHRhIHZhbHVlcyByZXBvcnRlZCBvbiBtb3VzZSB3aGVlbCBldmVudHMgYXJlXG4gIC8vIHVuc3RhbmRhcmRpemVkIGJldHdlZW4gYnJvd3NlcnMgYW5kIGV2ZW4gYnJvd3NlciB2ZXJzaW9ucywgYW5kXG4gIC8vIGdlbmVyYWxseSBob3JyaWJseSB1bnByZWRpY3RhYmxlLCB0aGlzIGNvZGUgc3RhcnRzIGJ5IG1lYXN1cmluZ1xuICAvLyB0aGUgc2Nyb2xsIGVmZmVjdCB0aGF0IHRoZSBmaXJzdCBmZXcgbW91c2Ugd2hlZWwgZXZlbnRzIGhhdmUsXG4gIC8vIGFuZCwgZnJvbSB0aGF0LCBkZXRlY3RzIHRoZSB3YXkgaXQgY2FuIGNvbnZlcnQgZGVsdGFzIHRvIHBpeGVsXG4gIC8vIG9mZnNldHMgYWZ0ZXJ3YXJkcy5cbiAgLy9cbiAgLy8gVGhlIHJlYXNvbiB3ZSB3YW50IHRvIGtub3cgdGhlIGFtb3VudCBhIHdoZWVsIGV2ZW50IHdpbGwgc2Nyb2xsXG4gIC8vIGlzIHRoYXQgaXQgZ2l2ZXMgdXMgYSBjaGFuY2UgdG8gdXBkYXRlIHRoZSBkaXNwbGF5IGJlZm9yZSB0aGVcbiAgLy8gYWN0dWFsIHNjcm9sbGluZyBoYXBwZW5zLCByZWR1Y2luZyBmbGlja2VyaW5nLlxuXG4gIHZhciB3aGVlbFNhbXBsZXMgPSAwLCB3aGVlbFBpeGVsc1BlclVuaXQgPSBudWxsO1xuICAvLyBGaWxsIGluIGEgYnJvd3Nlci1kZXRlY3RlZCBzdGFydGluZyB2YWx1ZSBvbiBicm93c2VycyB3aGVyZSB3ZVxuICAvLyBrbm93IG9uZS4gVGhlc2UgZG9uJ3QgaGF2ZSB0byBiZSBhY2N1cmF0ZSAtLSB0aGUgcmVzdWx0IG9mIHRoZW1cbiAgLy8gYmVpbmcgd3Jvbmcgd291bGQganVzdCBiZSBhIHNsaWdodCBmbGlja2VyIG9uIHRoZSBmaXJzdCB3aGVlbFxuICAvLyBzY3JvbGwgKGlmIGl0IGlzIGxhcmdlIGVub3VnaCkuXG4gIGlmIChpZSkgd2hlZWxQaXhlbHNQZXJVbml0ID0gLS41MztcbiAgZWxzZSBpZiAoZ2Vja28pIHdoZWVsUGl4ZWxzUGVyVW5pdCA9IDE1O1xuICBlbHNlIGlmIChjaHJvbWUpIHdoZWVsUGl4ZWxzUGVyVW5pdCA9IC0uNztcbiAgZWxzZSBpZiAoc2FmYXJpKSB3aGVlbFBpeGVsc1BlclVuaXQgPSAtMS8zO1xuXG4gIGZ1bmN0aW9uIG9uU2Nyb2xsV2hlZWwoY20sIGUpIHtcbiAgICB2YXIgZHggPSBlLndoZWVsRGVsdGFYLCBkeSA9IGUud2hlZWxEZWx0YVk7XG4gICAgaWYgKGR4ID09IG51bGwgJiYgZS5kZXRhaWwgJiYgZS5heGlzID09IGUuSE9SSVpPTlRBTF9BWElTKSBkeCA9IGUuZGV0YWlsO1xuICAgIGlmIChkeSA9PSBudWxsICYmIGUuZGV0YWlsICYmIGUuYXhpcyA9PSBlLlZFUlRJQ0FMX0FYSVMpIGR5ID0gZS5kZXRhaWw7XG4gICAgZWxzZSBpZiAoZHkgPT0gbnVsbCkgZHkgPSBlLndoZWVsRGVsdGE7XG5cbiAgICB2YXIgZGlzcGxheSA9IGNtLmRpc3BsYXksIHNjcm9sbCA9IGRpc3BsYXkuc2Nyb2xsZXI7XG4gICAgLy8gUXVpdCBpZiB0aGVyZSdzIG5vdGhpbmcgdG8gc2Nyb2xsIGhlcmVcbiAgICBpZiAoIShkeCAmJiBzY3JvbGwuc2Nyb2xsV2lkdGggPiBzY3JvbGwuY2xpZW50V2lkdGggfHxcbiAgICAgICAgICBkeSAmJiBzY3JvbGwuc2Nyb2xsSGVpZ2h0ID4gc2Nyb2xsLmNsaWVudEhlaWdodCkpIHJldHVybjtcblxuICAgIC8vIFdlYmtpdCBicm93c2VycyBvbiBPUyBYIGFib3J0IG1vbWVudHVtIHNjcm9sbHMgd2hlbiB0aGUgdGFyZ2V0XG4gICAgLy8gb2YgdGhlIHNjcm9sbCBldmVudCBpcyByZW1vdmVkIGZyb20gdGhlIHNjcm9sbGFibGUgZWxlbWVudC5cbiAgICAvLyBUaGlzIGhhY2sgKHNlZSByZWxhdGVkIGNvZGUgaW4gcGF0Y2hEaXNwbGF5KSBtYWtlcyBzdXJlIHRoZVxuICAgIC8vIGVsZW1lbnQgaXMga2VwdCBhcm91bmQuXG4gICAgaWYgKGR5ICYmIG1hYyAmJiB3ZWJraXQpIHtcbiAgICAgIG91dGVyOiBmb3IgKHZhciBjdXIgPSBlLnRhcmdldCwgdmlldyA9IGRpc3BsYXkudmlldzsgY3VyICE9IHNjcm9sbDsgY3VyID0gY3VyLnBhcmVudE5vZGUpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2aWV3Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKHZpZXdbaV0ubm9kZSA9PSBjdXIpIHtcbiAgICAgICAgICAgIGNtLmRpc3BsYXkuY3VycmVudFdoZWVsVGFyZ2V0ID0gY3VyO1xuICAgICAgICAgICAgYnJlYWsgb3V0ZXI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gT24gc29tZSBicm93c2VycywgaG9yaXpvbnRhbCBzY3JvbGxpbmcgd2lsbCBjYXVzZSByZWRyYXdzIHRvXG4gICAgLy8gaGFwcGVuIGJlZm9yZSB0aGUgZ3V0dGVyIGhhcyBiZWVuIHJlYWxpZ25lZCwgY2F1c2luZyBpdCB0b1xuICAgIC8vIHdyaWdnbGUgYXJvdW5kIGluIGEgbW9zdCB1bnNlZW1seSB3YXkuIFdoZW4gd2UgaGF2ZSBhblxuICAgIC8vIGVzdGltYXRlZCBwaXhlbHMvZGVsdGEgdmFsdWUsIHdlIGp1c3QgaGFuZGxlIGhvcml6b250YWxcbiAgICAvLyBzY3JvbGxpbmcgZW50aXJlbHkgaGVyZS4gSXQnbGwgYmUgc2xpZ2h0bHkgb2ZmIGZyb20gbmF0aXZlLCBidXRcbiAgICAvLyBiZXR0ZXIgdGhhbiBnbGl0Y2hpbmcgb3V0LlxuICAgIGlmIChkeCAmJiAhZ2Vja28gJiYgIXByZXN0byAmJiB3aGVlbFBpeGVsc1BlclVuaXQgIT0gbnVsbCkge1xuICAgICAgaWYgKGR5KVxuICAgICAgICBzZXRTY3JvbGxUb3AoY20sIE1hdGgubWF4KDAsIE1hdGgubWluKHNjcm9sbC5zY3JvbGxUb3AgKyBkeSAqIHdoZWVsUGl4ZWxzUGVyVW5pdCwgc2Nyb2xsLnNjcm9sbEhlaWdodCAtIHNjcm9sbC5jbGllbnRIZWlnaHQpKSk7XG4gICAgICBzZXRTY3JvbGxMZWZ0KGNtLCBNYXRoLm1heCgwLCBNYXRoLm1pbihzY3JvbGwuc2Nyb2xsTGVmdCArIGR4ICogd2hlZWxQaXhlbHNQZXJVbml0LCBzY3JvbGwuc2Nyb2xsV2lkdGggLSBzY3JvbGwuY2xpZW50V2lkdGgpKSk7XG4gICAgICBlX3ByZXZlbnREZWZhdWx0KGUpO1xuICAgICAgZGlzcGxheS53aGVlbFN0YXJ0WCA9IG51bGw7IC8vIEFib3J0IG1lYXN1cmVtZW50LCBpZiBpbiBwcm9ncmVzc1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vICdQcm9qZWN0JyB0aGUgdmlzaWJsZSB2aWV3cG9ydCB0byBjb3ZlciB0aGUgYXJlYSB0aGF0IGlzIGJlaW5nXG4gICAgLy8gc2Nyb2xsZWQgaW50byB2aWV3IChpZiB3ZSBrbm93IGVub3VnaCB0byBlc3RpbWF0ZSBpdCkuXG4gICAgaWYgKGR5ICYmIHdoZWVsUGl4ZWxzUGVyVW5pdCAhPSBudWxsKSB7XG4gICAgICB2YXIgcGl4ZWxzID0gZHkgKiB3aGVlbFBpeGVsc1BlclVuaXQ7XG4gICAgICB2YXIgdG9wID0gY20uZG9jLnNjcm9sbFRvcCwgYm90ID0gdG9wICsgZGlzcGxheS53cmFwcGVyLmNsaWVudEhlaWdodDtcbiAgICAgIGlmIChwaXhlbHMgPCAwKSB0b3AgPSBNYXRoLm1heCgwLCB0b3AgKyBwaXhlbHMgLSA1MCk7XG4gICAgICBlbHNlIGJvdCA9IE1hdGgubWluKGNtLmRvYy5oZWlnaHQsIGJvdCArIHBpeGVscyArIDUwKTtcbiAgICAgIHVwZGF0ZURpc3BsYXkoY20sIHt0b3A6IHRvcCwgYm90dG9tOiBib3R9KTtcbiAgICB9XG5cbiAgICBpZiAod2hlZWxTYW1wbGVzIDwgMjApIHtcbiAgICAgIGlmIChkaXNwbGF5LndoZWVsU3RhcnRYID09IG51bGwpIHtcbiAgICAgICAgZGlzcGxheS53aGVlbFN0YXJ0WCA9IHNjcm9sbC5zY3JvbGxMZWZ0OyBkaXNwbGF5LndoZWVsU3RhcnRZID0gc2Nyb2xsLnNjcm9sbFRvcDtcbiAgICAgICAgZGlzcGxheS53aGVlbERYID0gZHg7IGRpc3BsYXkud2hlZWxEWSA9IGR5O1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmIChkaXNwbGF5LndoZWVsU3RhcnRYID09IG51bGwpIHJldHVybjtcbiAgICAgICAgICB2YXIgbW92ZWRYID0gc2Nyb2xsLnNjcm9sbExlZnQgLSBkaXNwbGF5LndoZWVsU3RhcnRYO1xuICAgICAgICAgIHZhciBtb3ZlZFkgPSBzY3JvbGwuc2Nyb2xsVG9wIC0gZGlzcGxheS53aGVlbFN0YXJ0WTtcbiAgICAgICAgICB2YXIgc2FtcGxlID0gKG1vdmVkWSAmJiBkaXNwbGF5LndoZWVsRFkgJiYgbW92ZWRZIC8gZGlzcGxheS53aGVlbERZKSB8fFxuICAgICAgICAgICAgKG1vdmVkWCAmJiBkaXNwbGF5LndoZWVsRFggJiYgbW92ZWRYIC8gZGlzcGxheS53aGVlbERYKTtcbiAgICAgICAgICBkaXNwbGF5LndoZWVsU3RhcnRYID0gZGlzcGxheS53aGVlbFN0YXJ0WSA9IG51bGw7XG4gICAgICAgICAgaWYgKCFzYW1wbGUpIHJldHVybjtcbiAgICAgICAgICB3aGVlbFBpeGVsc1BlclVuaXQgPSAod2hlZWxQaXhlbHNQZXJVbml0ICogd2hlZWxTYW1wbGVzICsgc2FtcGxlKSAvICh3aGVlbFNhbXBsZXMgKyAxKTtcbiAgICAgICAgICArK3doZWVsU2FtcGxlcztcbiAgICAgICAgfSwgMjAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRpc3BsYXkud2hlZWxEWCArPSBkeDsgZGlzcGxheS53aGVlbERZICs9IGR5O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIEtFWSBFVkVOVFNcblxuICAvLyBSdW4gYSBoYW5kbGVyIHRoYXQgd2FzIGJvdW5kIHRvIGEga2V5LlxuICBmdW5jdGlvbiBkb0hhbmRsZUJpbmRpbmcoY20sIGJvdW5kLCBkcm9wU2hpZnQpIHtcbiAgICBpZiAodHlwZW9mIGJvdW5kID09IFwic3RyaW5nXCIpIHtcbiAgICAgIGJvdW5kID0gY29tbWFuZHNbYm91bmRdO1xuICAgICAgaWYgKCFib3VuZCkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBFbnN1cmUgcHJldmlvdXMgaW5wdXQgaGFzIGJlZW4gcmVhZCwgc28gdGhhdCB0aGUgaGFuZGxlciBzZWVzIGFcbiAgICAvLyBjb25zaXN0ZW50IHZpZXcgb2YgdGhlIGRvY3VtZW50XG4gICAgaWYgKGNtLmRpc3BsYXkucG9sbGluZ0Zhc3QgJiYgcmVhZElucHV0KGNtKSkgY20uZGlzcGxheS5wb2xsaW5nRmFzdCA9IGZhbHNlO1xuICAgIHZhciBwcmV2U2hpZnQgPSBjbS5kaXNwbGF5LnNoaWZ0LCBkb25lID0gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChpc1JlYWRPbmx5KGNtKSkgY20uc3RhdGUuc3VwcHJlc3NFZGl0cyA9IHRydWU7XG4gICAgICBpZiAoZHJvcFNoaWZ0KSBjbS5kaXNwbGF5LnNoaWZ0ID0gZmFsc2U7XG4gICAgICBkb25lID0gYm91bmQoY20pICE9IFBhc3M7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGNtLmRpc3BsYXkuc2hpZnQgPSBwcmV2U2hpZnQ7XG4gICAgICBjbS5zdGF0ZS5zdXBwcmVzc0VkaXRzID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBkb25lO1xuICB9XG5cbiAgLy8gQ29sbGVjdCB0aGUgY3VycmVudGx5IGFjdGl2ZSBrZXltYXBzLlxuICBmdW5jdGlvbiBhbGxLZXlNYXBzKGNtKSB7XG4gICAgdmFyIG1hcHMgPSBjbS5zdGF0ZS5rZXlNYXBzLnNsaWNlKDApO1xuICAgIGlmIChjbS5vcHRpb25zLmV4dHJhS2V5cykgbWFwcy5wdXNoKGNtLm9wdGlvbnMuZXh0cmFLZXlzKTtcbiAgICBtYXBzLnB1c2goY20ub3B0aW9ucy5rZXlNYXApO1xuICAgIHJldHVybiBtYXBzO1xuICB9XG5cbiAgdmFyIG1heWJlVHJhbnNpdGlvbjtcbiAgLy8gSGFuZGxlIGEga2V5IGZyb20gdGhlIGtleWRvd24gZXZlbnQuXG4gIGZ1bmN0aW9uIGhhbmRsZUtleUJpbmRpbmcoY20sIGUpIHtcbiAgICAvLyBIYW5kbGUgYXV0b21hdGljIGtleW1hcCB0cmFuc2l0aW9uc1xuICAgIHZhciBzdGFydE1hcCA9IGdldEtleU1hcChjbS5vcHRpb25zLmtleU1hcCksIG5leHQgPSBzdGFydE1hcC5hdXRvO1xuICAgIGNsZWFyVGltZW91dChtYXliZVRyYW5zaXRpb24pO1xuICAgIGlmIChuZXh0ICYmICFpc01vZGlmaWVyS2V5KGUpKSBtYXliZVRyYW5zaXRpb24gPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGdldEtleU1hcChjbS5vcHRpb25zLmtleU1hcCkgPT0gc3RhcnRNYXApIHtcbiAgICAgICAgY20ub3B0aW9ucy5rZXlNYXAgPSAobmV4dC5jYWxsID8gbmV4dC5jYWxsKG51bGwsIGNtKSA6IG5leHQpO1xuICAgICAgICBrZXlNYXBDaGFuZ2VkKGNtKTtcbiAgICAgIH1cbiAgICB9LCA1MCk7XG5cbiAgICB2YXIgbmFtZSA9IGtleU5hbWUoZSwgdHJ1ZSksIGhhbmRsZWQgPSBmYWxzZTtcbiAgICBpZiAoIW5hbWUpIHJldHVybiBmYWxzZTtcbiAgICB2YXIga2V5bWFwcyA9IGFsbEtleU1hcHMoY20pO1xuXG4gICAgaWYgKGUuc2hpZnRLZXkpIHtcbiAgICAgIC8vIEZpcnN0IHRyeSB0byByZXNvbHZlIGZ1bGwgbmFtZSAoaW5jbHVkaW5nICdTaGlmdC0nKS4gRmFpbGluZ1xuICAgICAgLy8gdGhhdCwgc2VlIGlmIHRoZXJlIGlzIGEgY3Vyc29yLW1vdGlvbiBjb21tYW5kIChzdGFydGluZyB3aXRoXG4gICAgICAvLyAnZ28nKSBib3VuZCB0byB0aGUga2V5bmFtZSB3aXRob3V0ICdTaGlmdC0nLlxuICAgICAgaGFuZGxlZCA9IGxvb2t1cEtleShcIlNoaWZ0LVwiICsgbmFtZSwga2V5bWFwcywgZnVuY3Rpb24oYikge3JldHVybiBkb0hhbmRsZUJpbmRpbmcoY20sIGIsIHRydWUpO30pXG4gICAgICAgICAgICAgfHwgbG9va3VwS2V5KG5hbWUsIGtleW1hcHMsIGZ1bmN0aW9uKGIpIHtcbiAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYiA9PSBcInN0cmluZ1wiID8gL15nb1tBLVpdLy50ZXN0KGIpIDogYi5tb3Rpb24pXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkb0hhbmRsZUJpbmRpbmcoY20sIGIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBoYW5kbGVkID0gbG9va3VwS2V5KG5hbWUsIGtleW1hcHMsIGZ1bmN0aW9uKGIpIHsgcmV0dXJuIGRvSGFuZGxlQmluZGluZyhjbSwgYik7IH0pO1xuICAgIH1cblxuICAgIGlmIChoYW5kbGVkKSB7XG4gICAgICBlX3ByZXZlbnREZWZhdWx0KGUpO1xuICAgICAgcmVzdGFydEJsaW5rKGNtKTtcbiAgICAgIHNpZ25hbExhdGVyKGNtLCBcImtleUhhbmRsZWRcIiwgY20sIG5hbWUsIGUpO1xuICAgIH1cbiAgICByZXR1cm4gaGFuZGxlZDtcbiAgfVxuXG4gIC8vIEhhbmRsZSBhIGtleSBmcm9tIHRoZSBrZXlwcmVzcyBldmVudFxuICBmdW5jdGlvbiBoYW5kbGVDaGFyQmluZGluZyhjbSwgZSwgY2gpIHtcbiAgICB2YXIgaGFuZGxlZCA9IGxvb2t1cEtleShcIidcIiArIGNoICsgXCInXCIsIGFsbEtleU1hcHMoY20pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGIpIHsgcmV0dXJuIGRvSGFuZGxlQmluZGluZyhjbSwgYiwgdHJ1ZSk7IH0pO1xuICAgIGlmIChoYW5kbGVkKSB7XG4gICAgICBlX3ByZXZlbnREZWZhdWx0KGUpO1xuICAgICAgcmVzdGFydEJsaW5rKGNtKTtcbiAgICAgIHNpZ25hbExhdGVyKGNtLCBcImtleUhhbmRsZWRcIiwgY20sIFwiJ1wiICsgY2ggKyBcIidcIiwgZSk7XG4gICAgfVxuICAgIHJldHVybiBoYW5kbGVkO1xuICB9XG5cbiAgdmFyIGxhc3RTdG9wcGVkS2V5ID0gbnVsbDtcbiAgZnVuY3Rpb24gb25LZXlEb3duKGUpIHtcbiAgICB2YXIgY20gPSB0aGlzO1xuICAgIGVuc3VyZUZvY3VzKGNtKTtcbiAgICBpZiAoc2lnbmFsRE9NRXZlbnQoY20sIGUpKSByZXR1cm47XG4gICAgLy8gSUUgZG9lcyBzdHJhbmdlIHRoaW5ncyB3aXRoIGVzY2FwZS5cbiAgICBpZiAoaWVfdXB0bzEwICYmIGUua2V5Q29kZSA9PSAyNykgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICAgIHZhciBjb2RlID0gZS5rZXlDb2RlO1xuICAgIGNtLmRpc3BsYXkuc2hpZnQgPSBjb2RlID09IDE2IHx8IGUuc2hpZnRLZXk7XG4gICAgdmFyIGhhbmRsZWQgPSBoYW5kbGVLZXlCaW5kaW5nKGNtLCBlKTtcbiAgICBpZiAocHJlc3RvKSB7XG4gICAgICBsYXN0U3RvcHBlZEtleSA9IGhhbmRsZWQgPyBjb2RlIDogbnVsbDtcbiAgICAgIC8vIE9wZXJhIGhhcyBubyBjdXQgZXZlbnQuLi4gd2UgdHJ5IHRvIGF0IGxlYXN0IGNhdGNoIHRoZSBrZXkgY29tYm9cbiAgICAgIGlmICghaGFuZGxlZCAmJiBjb2RlID09IDg4ICYmICFoYXNDb3B5RXZlbnQgJiYgKG1hYyA/IGUubWV0YUtleSA6IGUuY3RybEtleSkpXG4gICAgICAgIGNtLnJlcGxhY2VTZWxlY3Rpb24oXCJcIiwgbnVsbCwgXCJjdXRcIik7XG4gICAgfVxuXG4gICAgLy8gVHVybiBtb3VzZSBpbnRvIGNyb3NzaGFpciB3aGVuIEFsdCBpcyBoZWxkIG9uIE1hYy5cbiAgICBpZiAoY29kZSA9PSAxOCAmJiAhL1xcYkNvZGVNaXJyb3ItY3Jvc3NoYWlyXFxiLy50ZXN0KGNtLmRpc3BsYXkubGluZURpdi5jbGFzc05hbWUpKVxuICAgICAgc2hvd0Nyb3NzSGFpcihjbSk7XG4gIH1cblxuICBmdW5jdGlvbiBzaG93Q3Jvc3NIYWlyKGNtKSB7XG4gICAgdmFyIGxpbmVEaXYgPSBjbS5kaXNwbGF5LmxpbmVEaXY7XG4gICAgYWRkQ2xhc3MobGluZURpdiwgXCJDb2RlTWlycm9yLWNyb3NzaGFpclwiKTtcblxuICAgIGZ1bmN0aW9uIHVwKGUpIHtcbiAgICAgIGlmIChlLmtleUNvZGUgPT0gMTggfHwgIWUuYWx0S2V5KSB7XG4gICAgICAgIHJtQ2xhc3MobGluZURpdiwgXCJDb2RlTWlycm9yLWNyb3NzaGFpclwiKTtcbiAgICAgICAgb2ZmKGRvY3VtZW50LCBcImtleXVwXCIsIHVwKTtcbiAgICAgICAgb2ZmKGRvY3VtZW50LCBcIm1vdXNlb3ZlclwiLCB1cCk7XG4gICAgICB9XG4gICAgfVxuICAgIG9uKGRvY3VtZW50LCBcImtleXVwXCIsIHVwKTtcbiAgICBvbihkb2N1bWVudCwgXCJtb3VzZW92ZXJcIiwgdXApO1xuICB9XG5cbiAgZnVuY3Rpb24gb25LZXlVcChlKSB7XG4gICAgaWYgKHNpZ25hbERPTUV2ZW50KHRoaXMsIGUpKSByZXR1cm47XG4gICAgaWYgKGUua2V5Q29kZSA9PSAxNikgdGhpcy5kb2Muc2VsLnNoaWZ0ID0gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBvbktleVByZXNzKGUpIHtcbiAgICB2YXIgY20gPSB0aGlzO1xuICAgIGlmIChzaWduYWxET01FdmVudChjbSwgZSkpIHJldHVybjtcbiAgICB2YXIga2V5Q29kZSA9IGUua2V5Q29kZSwgY2hhckNvZGUgPSBlLmNoYXJDb2RlO1xuICAgIGlmIChwcmVzdG8gJiYga2V5Q29kZSA9PSBsYXN0U3RvcHBlZEtleSkge2xhc3RTdG9wcGVkS2V5ID0gbnVsbDsgZV9wcmV2ZW50RGVmYXVsdChlKTsgcmV0dXJuO31cbiAgICBpZiAoKChwcmVzdG8gJiYgKCFlLndoaWNoIHx8IGUud2hpY2ggPCAxMCkpIHx8IGtodG1sKSAmJiBoYW5kbGVLZXlCaW5kaW5nKGNtLCBlKSkgcmV0dXJuO1xuICAgIHZhciBjaCA9IFN0cmluZy5mcm9tQ2hhckNvZGUoY2hhckNvZGUgPT0gbnVsbCA/IGtleUNvZGUgOiBjaGFyQ29kZSk7XG4gICAgaWYgKGhhbmRsZUNoYXJCaW5kaW5nKGNtLCBlLCBjaCkpIHJldHVybjtcbiAgICBpZiAoaWUgJiYgIWllX3VwdG84KSBjbS5kaXNwbGF5LmlucHV0SGFzU2VsZWN0aW9uID0gbnVsbDtcbiAgICBmYXN0UG9sbChjbSk7XG4gIH1cblxuICAvLyBGT0NVUy9CTFVSIEVWRU5UU1xuXG4gIGZ1bmN0aW9uIG9uRm9jdXMoY20pIHtcbiAgICBpZiAoY20ub3B0aW9ucy5yZWFkT25seSA9PSBcIm5vY3Vyc29yXCIpIHJldHVybjtcbiAgICBpZiAoIWNtLnN0YXRlLmZvY3VzZWQpIHtcbiAgICAgIHNpZ25hbChjbSwgXCJmb2N1c1wiLCBjbSk7XG4gICAgICBjbS5zdGF0ZS5mb2N1c2VkID0gdHJ1ZTtcbiAgICAgIGFkZENsYXNzKGNtLmRpc3BsYXkud3JhcHBlciwgXCJDb2RlTWlycm9yLWZvY3VzZWRcIik7XG4gICAgICAvLyBUaGUgcHJldklucHV0IHRlc3QgcHJldmVudHMgdGhpcyBmcm9tIGZpcmluZyB3aGVuIGEgY29udGV4dFxuICAgICAgLy8gbWVudSBpcyBjbG9zZWQgKHNpbmNlIHRoZSByZXNldElucHV0IHdvdWxkIGtpbGwgdGhlXG4gICAgICAvLyBzZWxlY3QtYWxsIGRldGVjdGlvbiBoYWNrKVxuICAgICAgaWYgKCFjbS5jdXJPcCAmJiBjbS5kaXNwbGF5LnNlbEZvckNvbnRleHRNZW51ICE9IGNtLmRvYy5zZWwpIHtcbiAgICAgICAgcmVzZXRJbnB1dChjbSk7XG4gICAgICAgIGlmICh3ZWJraXQpIHNldFRpbWVvdXQoYmluZChyZXNldElucHV0LCBjbSwgdHJ1ZSksIDApOyAvLyBJc3N1ZSAjMTczMFxuICAgICAgfVxuICAgIH1cbiAgICBzbG93UG9sbChjbSk7XG4gICAgcmVzdGFydEJsaW5rKGNtKTtcbiAgfVxuICBmdW5jdGlvbiBvbkJsdXIoY20pIHtcbiAgICBpZiAoY20uc3RhdGUuZm9jdXNlZCkge1xuICAgICAgc2lnbmFsKGNtLCBcImJsdXJcIiwgY20pO1xuICAgICAgY20uc3RhdGUuZm9jdXNlZCA9IGZhbHNlO1xuICAgICAgcm1DbGFzcyhjbS5kaXNwbGF5LndyYXBwZXIsIFwiQ29kZU1pcnJvci1mb2N1c2VkXCIpO1xuICAgIH1cbiAgICBjbGVhckludGVydmFsKGNtLmRpc3BsYXkuYmxpbmtlcik7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtpZiAoIWNtLnN0YXRlLmZvY3VzZWQpIGNtLmRpc3BsYXkuc2hpZnQgPSBmYWxzZTt9LCAxNTApO1xuICB9XG5cbiAgLy8gQ09OVEVYVCBNRU5VIEhBTkRMSU5HXG5cbiAgLy8gVG8gbWFrZSB0aGUgY29udGV4dCBtZW51IHdvcmssIHdlIG5lZWQgdG8gYnJpZWZseSB1bmhpZGUgdGhlXG4gIC8vIHRleHRhcmVhIChtYWtpbmcgaXQgYXMgdW5vYnRydXNpdmUgYXMgcG9zc2libGUpIHRvIGxldCB0aGVcbiAgLy8gcmlnaHQtY2xpY2sgdGFrZSBlZmZlY3Qgb24gaXQuXG4gIGZ1bmN0aW9uIG9uQ29udGV4dE1lbnUoY20sIGUpIHtcbiAgICBpZiAoc2lnbmFsRE9NRXZlbnQoY20sIGUsIFwiY29udGV4dG1lbnVcIikpIHJldHVybjtcbiAgICB2YXIgZGlzcGxheSA9IGNtLmRpc3BsYXk7XG4gICAgaWYgKGV2ZW50SW5XaWRnZXQoZGlzcGxheSwgZSkgfHwgY29udGV4dE1lbnVJbkd1dHRlcihjbSwgZSkpIHJldHVybjtcblxuICAgIHZhciBwb3MgPSBwb3NGcm9tTW91c2UoY20sIGUpLCBzY3JvbGxQb3MgPSBkaXNwbGF5LnNjcm9sbGVyLnNjcm9sbFRvcDtcbiAgICBpZiAoIXBvcyB8fCBwcmVzdG8pIHJldHVybjsgLy8gT3BlcmEgaXMgZGlmZmljdWx0LlxuXG4gICAgLy8gUmVzZXQgdGhlIGN1cnJlbnQgdGV4dCBzZWxlY3Rpb24gb25seSBpZiB0aGUgY2xpY2sgaXMgZG9uZSBvdXRzaWRlIG9mIHRoZSBzZWxlY3Rpb25cbiAgICAvLyBhbmQgJ3Jlc2V0U2VsZWN0aW9uT25Db250ZXh0TWVudScgb3B0aW9uIGlzIHRydWUuXG4gICAgdmFyIHJlc2V0ID0gY20ub3B0aW9ucy5yZXNldFNlbGVjdGlvbk9uQ29udGV4dE1lbnU7XG4gICAgaWYgKHJlc2V0ICYmIGNtLmRvYy5zZWwuY29udGFpbnMocG9zKSA9PSAtMSlcbiAgICAgIG9wZXJhdGlvbihjbSwgc2V0U2VsZWN0aW9uKShjbS5kb2MsIHNpbXBsZVNlbGVjdGlvbihwb3MpLCBzZWxfZG9udFNjcm9sbCk7XG5cbiAgICB2YXIgb2xkQ1NTID0gZGlzcGxheS5pbnB1dC5zdHlsZS5jc3NUZXh0O1xuICAgIGRpc3BsYXkuaW5wdXREaXYuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgZGlzcGxheS5pbnB1dC5zdHlsZS5jc3NUZXh0ID0gXCJwb3NpdGlvbjogZml4ZWQ7IHdpZHRoOiAzMHB4OyBoZWlnaHQ6IDMwcHg7IHRvcDogXCIgKyAoZS5jbGllbnRZIC0gNSkgK1xuICAgICAgXCJweDsgbGVmdDogXCIgKyAoZS5jbGllbnRYIC0gNSkgKyBcInB4OyB6LWluZGV4OiAxMDAwOyBiYWNrZ3JvdW5kOiBcIiArXG4gICAgICAoaWUgPyBcInJnYmEoMjU1LCAyNTUsIDI1NSwgLjA1KVwiIDogXCJ0cmFuc3BhcmVudFwiKSArXG4gICAgICBcIjsgb3V0bGluZTogbm9uZTsgYm9yZGVyLXdpZHRoOiAwOyBvdXRsaW5lOiBub25lOyBvdmVyZmxvdzogaGlkZGVuOyBvcGFjaXR5OiAuMDU7IGZpbHRlcjogYWxwaGEob3BhY2l0eT01KTtcIjtcbiAgICBmb2N1c0lucHV0KGNtKTtcbiAgICByZXNldElucHV0KGNtKTtcbiAgICAvLyBBZGRzIFwiU2VsZWN0IGFsbFwiIHRvIGNvbnRleHQgbWVudSBpbiBGRlxuICAgIGlmICghY20uc29tZXRoaW5nU2VsZWN0ZWQoKSkgZGlzcGxheS5pbnB1dC52YWx1ZSA9IGRpc3BsYXkucHJldklucHV0ID0gXCIgXCI7XG4gICAgZGlzcGxheS5zZWxGb3JDb250ZXh0TWVudSA9IGNtLmRvYy5zZWw7XG4gICAgY2xlYXJUaW1lb3V0KGRpc3BsYXkuZGV0ZWN0aW5nU2VsZWN0QWxsKTtcblxuICAgIC8vIFNlbGVjdC1hbGwgd2lsbCBiZSBncmV5ZWQgb3V0IGlmIHRoZXJlJ3Mgbm90aGluZyB0byBzZWxlY3QsIHNvXG4gICAgLy8gdGhpcyBhZGRzIGEgemVyby13aWR0aCBzcGFjZSBzbyB0aGF0IHdlIGNhbiBsYXRlciBjaGVjayB3aGV0aGVyXG4gICAgLy8gaXQgZ290IHNlbGVjdGVkLlxuICAgIGZ1bmN0aW9uIHByZXBhcmVTZWxlY3RBbGxIYWNrKCkge1xuICAgICAgaWYgKGRpc3BsYXkuaW5wdXQuc2VsZWN0aW9uU3RhcnQgIT0gbnVsbCkge1xuICAgICAgICB2YXIgc2VsZWN0ZWQgPSBjbS5zb21ldGhpbmdTZWxlY3RlZCgpO1xuICAgICAgICB2YXIgZXh0dmFsID0gZGlzcGxheS5pbnB1dC52YWx1ZSA9IFwiXFx1MjAwYlwiICsgKHNlbGVjdGVkID8gZGlzcGxheS5pbnB1dC52YWx1ZSA6IFwiXCIpO1xuICAgICAgICBkaXNwbGF5LnByZXZJbnB1dCA9IHNlbGVjdGVkID8gXCJcIiA6IFwiXFx1MjAwYlwiO1xuICAgICAgICBkaXNwbGF5LmlucHV0LnNlbGVjdGlvblN0YXJ0ID0gMTsgZGlzcGxheS5pbnB1dC5zZWxlY3Rpb25FbmQgPSBleHR2YWwubGVuZ3RoO1xuICAgICAgICAvLyBSZS1zZXQgdGhpcywgaW4gY2FzZSBzb21lIG90aGVyIGhhbmRsZXIgdG91Y2hlZCB0aGVcbiAgICAgICAgLy8gc2VsZWN0aW9uIGluIHRoZSBtZWFudGltZS5cbiAgICAgICAgZGlzcGxheS5zZWxGb3JDb250ZXh0TWVudSA9IGNtLmRvYy5zZWw7XG4gICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlaGlkZSgpIHtcbiAgICAgIGRpc3BsYXkuaW5wdXREaXYuc3R5bGUucG9zaXRpb24gPSBcInJlbGF0aXZlXCI7XG4gICAgICBkaXNwbGF5LmlucHV0LnN0eWxlLmNzc1RleHQgPSBvbGRDU1M7XG4gICAgICBpZiAoaWVfdXB0bzgpIGRpc3BsYXkuc2Nyb2xsYmFyVi5zY3JvbGxUb3AgPSBkaXNwbGF5LnNjcm9sbGVyLnNjcm9sbFRvcCA9IHNjcm9sbFBvcztcbiAgICAgIHNsb3dQb2xsKGNtKTtcblxuICAgICAgLy8gVHJ5IHRvIGRldGVjdCB0aGUgdXNlciBjaG9vc2luZyBzZWxlY3QtYWxsXG4gICAgICBpZiAoZGlzcGxheS5pbnB1dC5zZWxlY3Rpb25TdGFydCAhPSBudWxsKSB7XG4gICAgICAgIGlmICghaWUgfHwgaWVfdXB0bzgpIHByZXBhcmVTZWxlY3RBbGxIYWNrKCk7XG4gICAgICAgIHZhciBpID0gMCwgcG9sbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmIChkaXNwbGF5LnNlbEZvckNvbnRleHRNZW51ID09IGNtLmRvYy5zZWwgJiYgZGlzcGxheS5pbnB1dC5zZWxlY3Rpb25TdGFydCA9PSAwKVxuICAgICAgICAgICAgb3BlcmF0aW9uKGNtLCBjb21tYW5kcy5zZWxlY3RBbGwpKGNtKTtcbiAgICAgICAgICBlbHNlIGlmIChpKysgPCAxMCkgZGlzcGxheS5kZXRlY3RpbmdTZWxlY3RBbGwgPSBzZXRUaW1lb3V0KHBvbGwsIDUwMCk7XG4gICAgICAgICAgZWxzZSByZXNldElucHV0KGNtKTtcbiAgICAgICAgfTtcbiAgICAgICAgZGlzcGxheS5kZXRlY3RpbmdTZWxlY3RBbGwgPSBzZXRUaW1lb3V0KHBvbGwsIDIwMCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGllICYmICFpZV91cHRvOCkgcHJlcGFyZVNlbGVjdEFsbEhhY2soKTtcbiAgICBpZiAoY2FwdHVyZVJpZ2h0Q2xpY2spIHtcbiAgICAgIGVfc3RvcChlKTtcbiAgICAgIHZhciBtb3VzZXVwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIG9mZih3aW5kb3csIFwibW91c2V1cFwiLCBtb3VzZXVwKTtcbiAgICAgICAgc2V0VGltZW91dChyZWhpZGUsIDIwKTtcbiAgICAgIH07XG4gICAgICBvbih3aW5kb3csIFwibW91c2V1cFwiLCBtb3VzZXVwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0VGltZW91dChyZWhpZGUsIDUwKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjb250ZXh0TWVudUluR3V0dGVyKGNtLCBlKSB7XG4gICAgaWYgKCFoYXNIYW5kbGVyKGNtLCBcImd1dHRlckNvbnRleHRNZW51XCIpKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIGd1dHRlckV2ZW50KGNtLCBlLCBcImd1dHRlckNvbnRleHRNZW51XCIsIGZhbHNlLCBzaWduYWwpO1xuICB9XG5cbiAgLy8gVVBEQVRJTkdcblxuICAvLyBDb21wdXRlIHRoZSBwb3NpdGlvbiBvZiB0aGUgZW5kIG9mIGEgY2hhbmdlIChpdHMgJ3RvJyBwcm9wZXJ0eVxuICAvLyByZWZlcnMgdG8gdGhlIHByZS1jaGFuZ2UgZW5kKS5cbiAgdmFyIGNoYW5nZUVuZCA9IENvZGVNaXJyb3IuY2hhbmdlRW5kID0gZnVuY3Rpb24oY2hhbmdlKSB7XG4gICAgaWYgKCFjaGFuZ2UudGV4dCkgcmV0dXJuIGNoYW5nZS50bztcbiAgICByZXR1cm4gUG9zKGNoYW5nZS5mcm9tLmxpbmUgKyBjaGFuZ2UudGV4dC5sZW5ndGggLSAxLFxuICAgICAgICAgICAgICAgbHN0KGNoYW5nZS50ZXh0KS5sZW5ndGggKyAoY2hhbmdlLnRleHQubGVuZ3RoID09IDEgPyBjaGFuZ2UuZnJvbS5jaCA6IDApKTtcbiAgfTtcblxuICAvLyBBZGp1c3QgYSBwb3NpdGlvbiB0byByZWZlciB0byB0aGUgcG9zdC1jaGFuZ2UgcG9zaXRpb24gb2YgdGhlXG4gIC8vIHNhbWUgdGV4dCwgb3IgdGhlIGVuZCBvZiB0aGUgY2hhbmdlIGlmIHRoZSBjaGFuZ2UgY292ZXJzIGl0LlxuICBmdW5jdGlvbiBhZGp1c3RGb3JDaGFuZ2UocG9zLCBjaGFuZ2UpIHtcbiAgICBpZiAoY21wKHBvcywgY2hhbmdlLmZyb20pIDwgMCkgcmV0dXJuIHBvcztcbiAgICBpZiAoY21wKHBvcywgY2hhbmdlLnRvKSA8PSAwKSByZXR1cm4gY2hhbmdlRW5kKGNoYW5nZSk7XG5cbiAgICB2YXIgbGluZSA9IHBvcy5saW5lICsgY2hhbmdlLnRleHQubGVuZ3RoIC0gKGNoYW5nZS50by5saW5lIC0gY2hhbmdlLmZyb20ubGluZSkgLSAxLCBjaCA9IHBvcy5jaDtcbiAgICBpZiAocG9zLmxpbmUgPT0gY2hhbmdlLnRvLmxpbmUpIGNoICs9IGNoYW5nZUVuZChjaGFuZ2UpLmNoIC0gY2hhbmdlLnRvLmNoO1xuICAgIHJldHVybiBQb3MobGluZSwgY2gpO1xuICB9XG5cbiAgZnVuY3Rpb24gY29tcHV0ZVNlbEFmdGVyQ2hhbmdlKGRvYywgY2hhbmdlKSB7XG4gICAgdmFyIG91dCA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZG9jLnNlbC5yYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciByYW5nZSA9IGRvYy5zZWwucmFuZ2VzW2ldO1xuICAgICAgb3V0LnB1c2gobmV3IFJhbmdlKGFkanVzdEZvckNoYW5nZShyYW5nZS5hbmNob3IsIGNoYW5nZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgYWRqdXN0Rm9yQ2hhbmdlKHJhbmdlLmhlYWQsIGNoYW5nZSkpKTtcbiAgICB9XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVNlbGVjdGlvbihvdXQsIGRvYy5zZWwucHJpbUluZGV4KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9mZnNldFBvcyhwb3MsIG9sZCwgbncpIHtcbiAgICBpZiAocG9zLmxpbmUgPT0gb2xkLmxpbmUpXG4gICAgICByZXR1cm4gUG9zKG53LmxpbmUsIHBvcy5jaCAtIG9sZC5jaCArIG53LmNoKTtcbiAgICBlbHNlXG4gICAgICByZXR1cm4gUG9zKG53LmxpbmUgKyAocG9zLmxpbmUgLSBvbGQubGluZSksIHBvcy5jaCk7XG4gIH1cblxuICAvLyBVc2VkIGJ5IHJlcGxhY2VTZWxlY3Rpb25zIHRvIGFsbG93IG1vdmluZyB0aGUgc2VsZWN0aW9uIHRvIHRoZVxuICAvLyBzdGFydCBvciBhcm91bmQgdGhlIHJlcGxhY2VkIHRlc3QuIEhpbnQgbWF5IGJlIFwic3RhcnRcIiBvciBcImFyb3VuZFwiLlxuICBmdW5jdGlvbiBjb21wdXRlUmVwbGFjZWRTZWwoZG9jLCBjaGFuZ2VzLCBoaW50KSB7XG4gICAgdmFyIG91dCA9IFtdO1xuICAgIHZhciBvbGRQcmV2ID0gUG9zKGRvYy5maXJzdCwgMCksIG5ld1ByZXYgPSBvbGRQcmV2O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGNoYW5nZSA9IGNoYW5nZXNbaV07XG4gICAgICB2YXIgZnJvbSA9IG9mZnNldFBvcyhjaGFuZ2UuZnJvbSwgb2xkUHJldiwgbmV3UHJldik7XG4gICAgICB2YXIgdG8gPSBvZmZzZXRQb3MoY2hhbmdlRW5kKGNoYW5nZSksIG9sZFByZXYsIG5ld1ByZXYpO1xuICAgICAgb2xkUHJldiA9IGNoYW5nZS50bztcbiAgICAgIG5ld1ByZXYgPSB0bztcbiAgICAgIGlmIChoaW50ID09IFwiYXJvdW5kXCIpIHtcbiAgICAgICAgdmFyIHJhbmdlID0gZG9jLnNlbC5yYW5nZXNbaV0sIGludiA9IGNtcChyYW5nZS5oZWFkLCByYW5nZS5hbmNob3IpIDwgMDtcbiAgICAgICAgb3V0W2ldID0gbmV3IFJhbmdlKGludiA/IHRvIDogZnJvbSwgaW52ID8gZnJvbSA6IHRvKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG91dFtpXSA9IG5ldyBSYW5nZShmcm9tLCBmcm9tKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBTZWxlY3Rpb24ob3V0LCBkb2Muc2VsLnByaW1JbmRleCk7XG4gIH1cblxuICAvLyBBbGxvdyBcImJlZm9yZUNoYW5nZVwiIGV2ZW50IGhhbmRsZXJzIHRvIGluZmx1ZW5jZSBhIGNoYW5nZVxuICBmdW5jdGlvbiBmaWx0ZXJDaGFuZ2UoZG9jLCBjaGFuZ2UsIHVwZGF0ZSkge1xuICAgIHZhciBvYmogPSB7XG4gICAgICBjYW5jZWxlZDogZmFsc2UsXG4gICAgICBmcm9tOiBjaGFuZ2UuZnJvbSxcbiAgICAgIHRvOiBjaGFuZ2UudG8sXG4gICAgICB0ZXh0OiBjaGFuZ2UudGV4dCxcbiAgICAgIG9yaWdpbjogY2hhbmdlLm9yaWdpbixcbiAgICAgIGNhbmNlbDogZnVuY3Rpb24oKSB7IHRoaXMuY2FuY2VsZWQgPSB0cnVlOyB9XG4gICAgfTtcbiAgICBpZiAodXBkYXRlKSBvYmoudXBkYXRlID0gZnVuY3Rpb24oZnJvbSwgdG8sIHRleHQsIG9yaWdpbikge1xuICAgICAgaWYgKGZyb20pIHRoaXMuZnJvbSA9IGNsaXBQb3MoZG9jLCBmcm9tKTtcbiAgICAgIGlmICh0bykgdGhpcy50byA9IGNsaXBQb3MoZG9jLCB0byk7XG4gICAgICBpZiAodGV4dCkgdGhpcy50ZXh0ID0gdGV4dDtcbiAgICAgIGlmIChvcmlnaW4gIT09IHVuZGVmaW5lZCkgdGhpcy5vcmlnaW4gPSBvcmlnaW47XG4gICAgfTtcbiAgICBzaWduYWwoZG9jLCBcImJlZm9yZUNoYW5nZVwiLCBkb2MsIG9iaik7XG4gICAgaWYgKGRvYy5jbSkgc2lnbmFsKGRvYy5jbSwgXCJiZWZvcmVDaGFuZ2VcIiwgZG9jLmNtLCBvYmopO1xuXG4gICAgaWYgKG9iai5jYW5jZWxlZCkgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIHtmcm9tOiBvYmouZnJvbSwgdG86IG9iai50bywgdGV4dDogb2JqLnRleHQsIG9yaWdpbjogb2JqLm9yaWdpbn07XG4gIH1cblxuICAvLyBBcHBseSBhIGNoYW5nZSB0byBhIGRvY3VtZW50LCBhbmQgYWRkIGl0IHRvIHRoZSBkb2N1bWVudCdzXG4gIC8vIGhpc3RvcnksIGFuZCBwcm9wYWdhdGluZyBpdCB0byBhbGwgbGlua2VkIGRvY3VtZW50cy5cbiAgZnVuY3Rpb24gbWFrZUNoYW5nZShkb2MsIGNoYW5nZSwgaWdub3JlUmVhZE9ubHkpIHtcbiAgICBpZiAoZG9jLmNtKSB7XG4gICAgICBpZiAoIWRvYy5jbS5jdXJPcCkgcmV0dXJuIG9wZXJhdGlvbihkb2MuY20sIG1ha2VDaGFuZ2UpKGRvYywgY2hhbmdlLCBpZ25vcmVSZWFkT25seSk7XG4gICAgICBpZiAoZG9jLmNtLnN0YXRlLnN1cHByZXNzRWRpdHMpIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoaGFzSGFuZGxlcihkb2MsIFwiYmVmb3JlQ2hhbmdlXCIpIHx8IGRvYy5jbSAmJiBoYXNIYW5kbGVyKGRvYy5jbSwgXCJiZWZvcmVDaGFuZ2VcIikpIHtcbiAgICAgIGNoYW5nZSA9IGZpbHRlckNoYW5nZShkb2MsIGNoYW5nZSwgdHJ1ZSk7XG4gICAgICBpZiAoIWNoYW5nZSkgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFBvc3NpYmx5IHNwbGl0IG9yIHN1cHByZXNzIHRoZSB1cGRhdGUgYmFzZWQgb24gdGhlIHByZXNlbmNlXG4gICAgLy8gb2YgcmVhZC1vbmx5IHNwYW5zIGluIGl0cyByYW5nZS5cbiAgICB2YXIgc3BsaXQgPSBzYXdSZWFkT25seVNwYW5zICYmICFpZ25vcmVSZWFkT25seSAmJiByZW1vdmVSZWFkT25seVJhbmdlcyhkb2MsIGNoYW5nZS5mcm9tLCBjaGFuZ2UudG8pO1xuICAgIGlmIChzcGxpdCkge1xuICAgICAgZm9yICh2YXIgaSA9IHNwbGl0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKVxuICAgICAgICBtYWtlQ2hhbmdlSW5uZXIoZG9jLCB7ZnJvbTogc3BsaXRbaV0uZnJvbSwgdG86IHNwbGl0W2ldLnRvLCB0ZXh0OiBpID8gW1wiXCJdIDogY2hhbmdlLnRleHR9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWFrZUNoYW5nZUlubmVyKGRvYywgY2hhbmdlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBtYWtlQ2hhbmdlSW5uZXIoZG9jLCBjaGFuZ2UpIHtcbiAgICBpZiAoY2hhbmdlLnRleHQubGVuZ3RoID09IDEgJiYgY2hhbmdlLnRleHRbMF0gPT0gXCJcIiAmJiBjbXAoY2hhbmdlLmZyb20sIGNoYW5nZS50bykgPT0gMCkgcmV0dXJuO1xuICAgIHZhciBzZWxBZnRlciA9IGNvbXB1dGVTZWxBZnRlckNoYW5nZShkb2MsIGNoYW5nZSk7XG4gICAgYWRkQ2hhbmdlVG9IaXN0b3J5KGRvYywgY2hhbmdlLCBzZWxBZnRlciwgZG9jLmNtID8gZG9jLmNtLmN1ck9wLmlkIDogTmFOKTtcblxuICAgIG1ha2VDaGFuZ2VTaW5nbGVEb2MoZG9jLCBjaGFuZ2UsIHNlbEFmdGVyLCBzdHJldGNoU3BhbnNPdmVyQ2hhbmdlKGRvYywgY2hhbmdlKSk7XG4gICAgdmFyIHJlYmFzZWQgPSBbXTtcblxuICAgIGxpbmtlZERvY3MoZG9jLCBmdW5jdGlvbihkb2MsIHNoYXJlZEhpc3QpIHtcbiAgICAgIGlmICghc2hhcmVkSGlzdCAmJiBpbmRleE9mKHJlYmFzZWQsIGRvYy5oaXN0b3J5KSA9PSAtMSkge1xuICAgICAgICByZWJhc2VIaXN0KGRvYy5oaXN0b3J5LCBjaGFuZ2UpO1xuICAgICAgICByZWJhc2VkLnB1c2goZG9jLmhpc3RvcnkpO1xuICAgICAgfVxuICAgICAgbWFrZUNoYW5nZVNpbmdsZURvYyhkb2MsIGNoYW5nZSwgbnVsbCwgc3RyZXRjaFNwYW5zT3ZlckNoYW5nZShkb2MsIGNoYW5nZSkpO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gUmV2ZXJ0IGEgY2hhbmdlIHN0b3JlZCBpbiBhIGRvY3VtZW50J3MgaGlzdG9yeS5cbiAgZnVuY3Rpb24gbWFrZUNoYW5nZUZyb21IaXN0b3J5KGRvYywgdHlwZSwgYWxsb3dTZWxlY3Rpb25Pbmx5KSB7XG4gICAgaWYgKGRvYy5jbSAmJiBkb2MuY20uc3RhdGUuc3VwcHJlc3NFZGl0cykgcmV0dXJuO1xuXG4gICAgdmFyIGhpc3QgPSBkb2MuaGlzdG9yeSwgZXZlbnQsIHNlbEFmdGVyID0gZG9jLnNlbDtcbiAgICB2YXIgc291cmNlID0gdHlwZSA9PSBcInVuZG9cIiA/IGhpc3QuZG9uZSA6IGhpc3QudW5kb25lLCBkZXN0ID0gdHlwZSA9PSBcInVuZG9cIiA/IGhpc3QudW5kb25lIDogaGlzdC5kb25lO1xuXG4gICAgLy8gVmVyaWZ5IHRoYXQgdGhlcmUgaXMgYSB1c2VhYmxlIGV2ZW50IChzbyB0aGF0IGN0cmwteiB3b24ndFxuICAgIC8vIG5lZWRsZXNzbHkgY2xlYXIgc2VsZWN0aW9uIGV2ZW50cylcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNvdXJjZS5sZW5ndGg7IGkrKykge1xuICAgICAgZXZlbnQgPSBzb3VyY2VbaV07XG4gICAgICBpZiAoYWxsb3dTZWxlY3Rpb25Pbmx5ID8gZXZlbnQucmFuZ2VzICYmICFldmVudC5lcXVhbHMoZG9jLnNlbCkgOiAhZXZlbnQucmFuZ2VzKVxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKGkgPT0gc291cmNlLmxlbmd0aCkgcmV0dXJuO1xuICAgIGhpc3QubGFzdE9yaWdpbiA9IGhpc3QubGFzdFNlbE9yaWdpbiA9IG51bGw7XG5cbiAgICBmb3IgKDs7KSB7XG4gICAgICBldmVudCA9IHNvdXJjZS5wb3AoKTtcbiAgICAgIGlmIChldmVudC5yYW5nZXMpIHtcbiAgICAgICAgcHVzaFNlbGVjdGlvblRvSGlzdG9yeShldmVudCwgZGVzdCk7XG4gICAgICAgIGlmIChhbGxvd1NlbGVjdGlvbk9ubHkgJiYgIWV2ZW50LmVxdWFscyhkb2Muc2VsKSkge1xuICAgICAgICAgIHNldFNlbGVjdGlvbihkb2MsIGV2ZW50LCB7Y2xlYXJSZWRvOiBmYWxzZX0pO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzZWxBZnRlciA9IGV2ZW50O1xuICAgICAgfVxuICAgICAgZWxzZSBicmVhaztcbiAgICB9XG5cbiAgICAvLyBCdWlsZCB1cCBhIHJldmVyc2UgY2hhbmdlIG9iamVjdCB0byBhZGQgdG8gdGhlIG9wcG9zaXRlIGhpc3RvcnlcbiAgICAvLyBzdGFjayAocmVkbyB3aGVuIHVuZG9pbmcsIGFuZCB2aWNlIHZlcnNhKS5cbiAgICB2YXIgYW50aUNoYW5nZXMgPSBbXTtcbiAgICBwdXNoU2VsZWN0aW9uVG9IaXN0b3J5KHNlbEFmdGVyLCBkZXN0KTtcbiAgICBkZXN0LnB1c2goe2NoYW5nZXM6IGFudGlDaGFuZ2VzLCBnZW5lcmF0aW9uOiBoaXN0LmdlbmVyYXRpb259KTtcbiAgICBoaXN0LmdlbmVyYXRpb24gPSBldmVudC5nZW5lcmF0aW9uIHx8ICsraGlzdC5tYXhHZW5lcmF0aW9uO1xuXG4gICAgdmFyIGZpbHRlciA9IGhhc0hhbmRsZXIoZG9jLCBcImJlZm9yZUNoYW5nZVwiKSB8fCBkb2MuY20gJiYgaGFzSGFuZGxlcihkb2MuY20sIFwiYmVmb3JlQ2hhbmdlXCIpO1xuXG4gICAgZm9yICh2YXIgaSA9IGV2ZW50LmNoYW5nZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgIHZhciBjaGFuZ2UgPSBldmVudC5jaGFuZ2VzW2ldO1xuICAgICAgY2hhbmdlLm9yaWdpbiA9IHR5cGU7XG4gICAgICBpZiAoZmlsdGVyICYmICFmaWx0ZXJDaGFuZ2UoZG9jLCBjaGFuZ2UsIGZhbHNlKSkge1xuICAgICAgICBzb3VyY2UubGVuZ3RoID0gMDtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBhbnRpQ2hhbmdlcy5wdXNoKGhpc3RvcnlDaGFuZ2VGcm9tQ2hhbmdlKGRvYywgY2hhbmdlKSk7XG5cbiAgICAgIHZhciBhZnRlciA9IGkgPyBjb21wdXRlU2VsQWZ0ZXJDaGFuZ2UoZG9jLCBjaGFuZ2UsIG51bGwpIDogbHN0KHNvdXJjZSk7XG4gICAgICBtYWtlQ2hhbmdlU2luZ2xlRG9jKGRvYywgY2hhbmdlLCBhZnRlciwgbWVyZ2VPbGRTcGFucyhkb2MsIGNoYW5nZSkpO1xuICAgICAgaWYgKCFpICYmIGRvYy5jbSkgZG9jLmNtLnNjcm9sbEludG9WaWV3KGNoYW5nZSk7XG4gICAgICB2YXIgcmViYXNlZCA9IFtdO1xuXG4gICAgICAvLyBQcm9wYWdhdGUgdG8gdGhlIGxpbmtlZCBkb2N1bWVudHNcbiAgICAgIGxpbmtlZERvY3MoZG9jLCBmdW5jdGlvbihkb2MsIHNoYXJlZEhpc3QpIHtcbiAgICAgICAgaWYgKCFzaGFyZWRIaXN0ICYmIGluZGV4T2YocmViYXNlZCwgZG9jLmhpc3RvcnkpID09IC0xKSB7XG4gICAgICAgICAgcmViYXNlSGlzdChkb2MuaGlzdG9yeSwgY2hhbmdlKTtcbiAgICAgICAgICByZWJhc2VkLnB1c2goZG9jLmhpc3RvcnkpO1xuICAgICAgICB9XG4gICAgICAgIG1ha2VDaGFuZ2VTaW5nbGVEb2MoZG9jLCBjaGFuZ2UsIG51bGwsIG1lcmdlT2xkU3BhbnMoZG9jLCBjaGFuZ2UpKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIFN1Yi12aWV3cyBuZWVkIHRoZWlyIGxpbmUgbnVtYmVycyBzaGlmdGVkIHdoZW4gdGV4dCBpcyBhZGRlZFxuICAvLyBhYm92ZSBvciBiZWxvdyB0aGVtIGluIHRoZSBwYXJlbnQgZG9jdW1lbnQuXG4gIGZ1bmN0aW9uIHNoaWZ0RG9jKGRvYywgZGlzdGFuY2UpIHtcbiAgICBpZiAoZGlzdGFuY2UgPT0gMCkgcmV0dXJuO1xuICAgIGRvYy5maXJzdCArPSBkaXN0YW5jZTtcbiAgICBkb2Muc2VsID0gbmV3IFNlbGVjdGlvbihtYXAoZG9jLnNlbC5yYW5nZXMsIGZ1bmN0aW9uKHJhbmdlKSB7XG4gICAgICByZXR1cm4gbmV3IFJhbmdlKFBvcyhyYW5nZS5hbmNob3IubGluZSArIGRpc3RhbmNlLCByYW5nZS5hbmNob3IuY2gpLFxuICAgICAgICAgICAgICAgICAgICAgICBQb3MocmFuZ2UuaGVhZC5saW5lICsgZGlzdGFuY2UsIHJhbmdlLmhlYWQuY2gpKTtcbiAgICB9KSwgZG9jLnNlbC5wcmltSW5kZXgpO1xuICAgIGlmIChkb2MuY20pIHtcbiAgICAgIHJlZ0NoYW5nZShkb2MuY20sIGRvYy5maXJzdCwgZG9jLmZpcnN0IC0gZGlzdGFuY2UsIGRpc3RhbmNlKTtcbiAgICAgIGZvciAodmFyIGQgPSBkb2MuY20uZGlzcGxheSwgbCA9IGQudmlld0Zyb207IGwgPCBkLnZpZXdUbzsgbCsrKVxuICAgICAgICByZWdMaW5lQ2hhbmdlKGRvYy5jbSwgbCwgXCJndXR0ZXJcIik7XG4gICAgfVxuICB9XG5cbiAgLy8gTW9yZSBsb3dlci1sZXZlbCBjaGFuZ2UgZnVuY3Rpb24sIGhhbmRsaW5nIG9ubHkgYSBzaW5nbGUgZG9jdW1lbnRcbiAgLy8gKG5vdCBsaW5rZWQgb25lcykuXG4gIGZ1bmN0aW9uIG1ha2VDaGFuZ2VTaW5nbGVEb2MoZG9jLCBjaGFuZ2UsIHNlbEFmdGVyLCBzcGFucykge1xuICAgIGlmIChkb2MuY20gJiYgIWRvYy5jbS5jdXJPcClcbiAgICAgIHJldHVybiBvcGVyYXRpb24oZG9jLmNtLCBtYWtlQ2hhbmdlU2luZ2xlRG9jKShkb2MsIGNoYW5nZSwgc2VsQWZ0ZXIsIHNwYW5zKTtcblxuICAgIGlmIChjaGFuZ2UudG8ubGluZSA8IGRvYy5maXJzdCkge1xuICAgICAgc2hpZnREb2MoZG9jLCBjaGFuZ2UudGV4dC5sZW5ndGggLSAxIC0gKGNoYW5nZS50by5saW5lIC0gY2hhbmdlLmZyb20ubGluZSkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoY2hhbmdlLmZyb20ubGluZSA+IGRvYy5sYXN0TGluZSgpKSByZXR1cm47XG5cbiAgICAvLyBDbGlwIHRoZSBjaGFuZ2UgdG8gdGhlIHNpemUgb2YgdGhpcyBkb2NcbiAgICBpZiAoY2hhbmdlLmZyb20ubGluZSA8IGRvYy5maXJzdCkge1xuICAgICAgdmFyIHNoaWZ0ID0gY2hhbmdlLnRleHQubGVuZ3RoIC0gMSAtIChkb2MuZmlyc3QgLSBjaGFuZ2UuZnJvbS5saW5lKTtcbiAgICAgIHNoaWZ0RG9jKGRvYywgc2hpZnQpO1xuICAgICAgY2hhbmdlID0ge2Zyb206IFBvcyhkb2MuZmlyc3QsIDApLCB0bzogUG9zKGNoYW5nZS50by5saW5lICsgc2hpZnQsIGNoYW5nZS50by5jaCksXG4gICAgICAgICAgICAgICAgdGV4dDogW2xzdChjaGFuZ2UudGV4dCldLCBvcmlnaW46IGNoYW5nZS5vcmlnaW59O1xuICAgIH1cbiAgICB2YXIgbGFzdCA9IGRvYy5sYXN0TGluZSgpO1xuICAgIGlmIChjaGFuZ2UudG8ubGluZSA+IGxhc3QpIHtcbiAgICAgIGNoYW5nZSA9IHtmcm9tOiBjaGFuZ2UuZnJvbSwgdG86IFBvcyhsYXN0LCBnZXRMaW5lKGRvYywgbGFzdCkudGV4dC5sZW5ndGgpLFxuICAgICAgICAgICAgICAgIHRleHQ6IFtjaGFuZ2UudGV4dFswXV0sIG9yaWdpbjogY2hhbmdlLm9yaWdpbn07XG4gICAgfVxuXG4gICAgY2hhbmdlLnJlbW92ZWQgPSBnZXRCZXR3ZWVuKGRvYywgY2hhbmdlLmZyb20sIGNoYW5nZS50byk7XG5cbiAgICBpZiAoIXNlbEFmdGVyKSBzZWxBZnRlciA9IGNvbXB1dGVTZWxBZnRlckNoYW5nZShkb2MsIGNoYW5nZSwgbnVsbCk7XG4gICAgaWYgKGRvYy5jbSkgbWFrZUNoYW5nZVNpbmdsZURvY0luRWRpdG9yKGRvYy5jbSwgY2hhbmdlLCBzcGFucyk7XG4gICAgZWxzZSB1cGRhdGVEb2MoZG9jLCBjaGFuZ2UsIHNwYW5zKTtcbiAgICBzZXRTZWxlY3Rpb25Ob1VuZG8oZG9jLCBzZWxBZnRlciwgc2VsX2RvbnRTY3JvbGwpO1xuICB9XG5cbiAgLy8gSGFuZGxlIHRoZSBpbnRlcmFjdGlvbiBvZiBhIGNoYW5nZSB0byBhIGRvY3VtZW50IHdpdGggdGhlIGVkaXRvclxuICAvLyB0aGF0IHRoaXMgZG9jdW1lbnQgaXMgcGFydCBvZi5cbiAgZnVuY3Rpb24gbWFrZUNoYW5nZVNpbmdsZURvY0luRWRpdG9yKGNtLCBjaGFuZ2UsIHNwYW5zKSB7XG4gICAgdmFyIGRvYyA9IGNtLmRvYywgZGlzcGxheSA9IGNtLmRpc3BsYXksIGZyb20gPSBjaGFuZ2UuZnJvbSwgdG8gPSBjaGFuZ2UudG87XG5cbiAgICB2YXIgcmVjb21wdXRlTWF4TGVuZ3RoID0gZmFsc2UsIGNoZWNrV2lkdGhTdGFydCA9IGZyb20ubGluZTtcbiAgICBpZiAoIWNtLm9wdGlvbnMubGluZVdyYXBwaW5nKSB7XG4gICAgICBjaGVja1dpZHRoU3RhcnQgPSBsaW5lTm8odmlzdWFsTGluZShnZXRMaW5lKGRvYywgZnJvbS5saW5lKSkpO1xuICAgICAgZG9jLml0ZXIoY2hlY2tXaWR0aFN0YXJ0LCB0by5saW5lICsgMSwgZnVuY3Rpb24obGluZSkge1xuICAgICAgICBpZiAobGluZSA9PSBkaXNwbGF5Lm1heExpbmUpIHtcbiAgICAgICAgICByZWNvbXB1dGVNYXhMZW5ndGggPSB0cnVlO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoZG9jLnNlbC5jb250YWlucyhjaGFuZ2UuZnJvbSwgY2hhbmdlLnRvKSA+IC0xKVxuICAgICAgc2lnbmFsQ3Vyc29yQWN0aXZpdHkoY20pO1xuXG4gICAgdXBkYXRlRG9jKGRvYywgY2hhbmdlLCBzcGFucywgZXN0aW1hdGVIZWlnaHQoY20pKTtcblxuICAgIGlmICghY20ub3B0aW9ucy5saW5lV3JhcHBpbmcpIHtcbiAgICAgIGRvYy5pdGVyKGNoZWNrV2lkdGhTdGFydCwgZnJvbS5saW5lICsgY2hhbmdlLnRleHQubGVuZ3RoLCBmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgIHZhciBsZW4gPSBsaW5lTGVuZ3RoKGxpbmUpO1xuICAgICAgICBpZiAobGVuID4gZGlzcGxheS5tYXhMaW5lTGVuZ3RoKSB7XG4gICAgICAgICAgZGlzcGxheS5tYXhMaW5lID0gbGluZTtcbiAgICAgICAgICBkaXNwbGF5Lm1heExpbmVMZW5ndGggPSBsZW47XG4gICAgICAgICAgZGlzcGxheS5tYXhMaW5lQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgcmVjb21wdXRlTWF4TGVuZ3RoID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKHJlY29tcHV0ZU1heExlbmd0aCkgY20uY3VyT3AudXBkYXRlTWF4TGluZSA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gQWRqdXN0IGZyb250aWVyLCBzY2hlZHVsZSB3b3JrZXJcbiAgICBkb2MuZnJvbnRpZXIgPSBNYXRoLm1pbihkb2MuZnJvbnRpZXIsIGZyb20ubGluZSk7XG4gICAgc3RhcnRXb3JrZXIoY20sIDQwMCk7XG5cbiAgICB2YXIgbGVuZGlmZiA9IGNoYW5nZS50ZXh0Lmxlbmd0aCAtICh0by5saW5lIC0gZnJvbS5saW5lKSAtIDE7XG4gICAgLy8gUmVtZW1iZXIgdGhhdCB0aGVzZSBsaW5lcyBjaGFuZ2VkLCBmb3IgdXBkYXRpbmcgdGhlIGRpc3BsYXlcbiAgICBpZiAoZnJvbS5saW5lID09IHRvLmxpbmUgJiYgY2hhbmdlLnRleHQubGVuZ3RoID09IDEgJiYgIWlzV2hvbGVMaW5lVXBkYXRlKGNtLmRvYywgY2hhbmdlKSlcbiAgICAgIHJlZ0xpbmVDaGFuZ2UoY20sIGZyb20ubGluZSwgXCJ0ZXh0XCIpO1xuICAgIGVsc2VcbiAgICAgIHJlZ0NoYW5nZShjbSwgZnJvbS5saW5lLCB0by5saW5lICsgMSwgbGVuZGlmZik7XG5cbiAgICB2YXIgY2hhbmdlc0hhbmRsZXIgPSBoYXNIYW5kbGVyKGNtLCBcImNoYW5nZXNcIiksIGNoYW5nZUhhbmRsZXIgPSBoYXNIYW5kbGVyKGNtLCBcImNoYW5nZVwiKTtcbiAgICBpZiAoY2hhbmdlSGFuZGxlciB8fCBjaGFuZ2VzSGFuZGxlcikge1xuICAgICAgdmFyIG9iaiA9IHtcbiAgICAgICAgZnJvbTogZnJvbSwgdG86IHRvLFxuICAgICAgICB0ZXh0OiBjaGFuZ2UudGV4dCxcbiAgICAgICAgcmVtb3ZlZDogY2hhbmdlLnJlbW92ZWQsXG4gICAgICAgIG9yaWdpbjogY2hhbmdlLm9yaWdpblxuICAgICAgfTtcbiAgICAgIGlmIChjaGFuZ2VIYW5kbGVyKSBzaWduYWxMYXRlcihjbSwgXCJjaGFuZ2VcIiwgY20sIG9iaik7XG4gICAgICBpZiAoY2hhbmdlc0hhbmRsZXIpIChjbS5jdXJPcC5jaGFuZ2VPYmpzIHx8IChjbS5jdXJPcC5jaGFuZ2VPYmpzID0gW10pKS5wdXNoKG9iaik7XG4gICAgfVxuICAgIGNtLmRpc3BsYXkuc2VsRm9yQ29udGV4dE1lbnUgPSBudWxsO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVwbGFjZVJhbmdlKGRvYywgY29kZSwgZnJvbSwgdG8sIG9yaWdpbikge1xuICAgIGlmICghdG8pIHRvID0gZnJvbTtcbiAgICBpZiAoY21wKHRvLCBmcm9tKSA8IDApIHsgdmFyIHRtcCA9IHRvOyB0byA9IGZyb207IGZyb20gPSB0bXA7IH1cbiAgICBpZiAodHlwZW9mIGNvZGUgPT0gXCJzdHJpbmdcIikgY29kZSA9IHNwbGl0TGluZXMoY29kZSk7XG4gICAgbWFrZUNoYW5nZShkb2MsIHtmcm9tOiBmcm9tLCB0bzogdG8sIHRleHQ6IGNvZGUsIG9yaWdpbjogb3JpZ2lufSk7XG4gIH1cblxuICAvLyBTQ1JPTExJTkcgVEhJTkdTIElOVE8gVklFV1xuXG4gIC8vIElmIGFuIGVkaXRvciBzaXRzIG9uIHRoZSB0b3Agb3IgYm90dG9tIG9mIHRoZSB3aW5kb3csIHBhcnRpYWxseVxuICAvLyBzY3JvbGxlZCBvdXQgb2YgdmlldywgdGhpcyBlbnN1cmVzIHRoYXQgdGhlIGN1cnNvciBpcyB2aXNpYmxlLlxuICBmdW5jdGlvbiBtYXliZVNjcm9sbFdpbmRvdyhjbSwgY29vcmRzKSB7XG4gICAgdmFyIGRpc3BsYXkgPSBjbS5kaXNwbGF5LCBib3ggPSBkaXNwbGF5LnNpemVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLCBkb1Njcm9sbCA9IG51bGw7XG4gICAgaWYgKGNvb3Jkcy50b3AgKyBib3gudG9wIDwgMCkgZG9TY3JvbGwgPSB0cnVlO1xuICAgIGVsc2UgaWYgKGNvb3Jkcy5ib3R0b20gKyBib3gudG9wID4gKHdpbmRvdy5pbm5lckhlaWdodCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0KSkgZG9TY3JvbGwgPSBmYWxzZTtcbiAgICBpZiAoZG9TY3JvbGwgIT0gbnVsbCAmJiAhcGhhbnRvbSkge1xuICAgICAgdmFyIHNjcm9sbE5vZGUgPSBlbHQoXCJkaXZcIiwgXCJcXHUyMDBiXCIsIG51bGwsIFwicG9zaXRpb246IGFic29sdXRlOyB0b3A6IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIChjb29yZHMudG9wIC0gZGlzcGxheS52aWV3T2Zmc2V0IC0gcGFkZGluZ1RvcChjbS5kaXNwbGF5KSkgKyBcInB4OyBoZWlnaHQ6IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIChjb29yZHMuYm90dG9tIC0gY29vcmRzLnRvcCArIHNjcm9sbGVyQ3V0T2ZmKSArIFwicHg7IGxlZnQ6IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3Jkcy5sZWZ0ICsgXCJweDsgd2lkdGg6IDJweDtcIik7XG4gICAgICBjbS5kaXNwbGF5LmxpbmVTcGFjZS5hcHBlbmRDaGlsZChzY3JvbGxOb2RlKTtcbiAgICAgIHNjcm9sbE5vZGUuc2Nyb2xsSW50b1ZpZXcoZG9TY3JvbGwpO1xuICAgICAgY20uZGlzcGxheS5saW5lU3BhY2UucmVtb3ZlQ2hpbGQoc2Nyb2xsTm9kZSk7XG4gICAgfVxuICB9XG5cbiAgLy8gU2Nyb2xsIGEgZ2l2ZW4gcG9zaXRpb24gaW50byB2aWV3IChpbW1lZGlhdGVseSksIHZlcmlmeWluZyB0aGF0XG4gIC8vIGl0IGFjdHVhbGx5IGJlY2FtZSB2aXNpYmxlIChhcyBsaW5lIGhlaWdodHMgYXJlIGFjY3VyYXRlbHlcbiAgLy8gbWVhc3VyZWQsIHRoZSBwb3NpdGlvbiBvZiBzb21ldGhpbmcgbWF5ICdkcmlmdCcgZHVyaW5nIGRyYXdpbmcpLlxuICBmdW5jdGlvbiBzY3JvbGxQb3NJbnRvVmlldyhjbSwgcG9zLCBlbmQsIG1hcmdpbikge1xuICAgIGlmIChtYXJnaW4gPT0gbnVsbCkgbWFyZ2luID0gMDtcbiAgICBmb3IgKDs7KSB7XG4gICAgICB2YXIgY2hhbmdlZCA9IGZhbHNlLCBjb29yZHMgPSBjdXJzb3JDb29yZHMoY20sIHBvcyk7XG4gICAgICB2YXIgZW5kQ29vcmRzID0gIWVuZCB8fCBlbmQgPT0gcG9zID8gY29vcmRzIDogY3Vyc29yQ29vcmRzKGNtLCBlbmQpO1xuICAgICAgdmFyIHNjcm9sbFBvcyA9IGNhbGN1bGF0ZVNjcm9sbFBvcyhjbSwgTWF0aC5taW4oY29vcmRzLmxlZnQsIGVuZENvb3Jkcy5sZWZ0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5taW4oY29vcmRzLnRvcCwgZW5kQ29vcmRzLnRvcCkgLSBtYXJnaW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGgubWF4KGNvb3Jkcy5sZWZ0LCBlbmRDb29yZHMubGVmdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGgubWF4KGNvb3Jkcy5ib3R0b20sIGVuZENvb3Jkcy5ib3R0b20pICsgbWFyZ2luKTtcbiAgICAgIHZhciBzdGFydFRvcCA9IGNtLmRvYy5zY3JvbGxUb3AsIHN0YXJ0TGVmdCA9IGNtLmRvYy5zY3JvbGxMZWZ0O1xuICAgICAgaWYgKHNjcm9sbFBvcy5zY3JvbGxUb3AgIT0gbnVsbCkge1xuICAgICAgICBzZXRTY3JvbGxUb3AoY20sIHNjcm9sbFBvcy5zY3JvbGxUb3ApO1xuICAgICAgICBpZiAoTWF0aC5hYnMoY20uZG9jLnNjcm9sbFRvcCAtIHN0YXJ0VG9wKSA+IDEpIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKHNjcm9sbFBvcy5zY3JvbGxMZWZ0ICE9IG51bGwpIHtcbiAgICAgICAgc2V0U2Nyb2xsTGVmdChjbSwgc2Nyb2xsUG9zLnNjcm9sbExlZnQpO1xuICAgICAgICBpZiAoTWF0aC5hYnMoY20uZG9jLnNjcm9sbExlZnQgLSBzdGFydExlZnQpID4gMSkgY2hhbmdlZCA9IHRydWU7XG4gICAgICB9XG4gICAgICBpZiAoIWNoYW5nZWQpIHJldHVybiBjb29yZHM7XG4gICAgfVxuICB9XG5cbiAgLy8gU2Nyb2xsIGEgZ2l2ZW4gc2V0IG9mIGNvb3JkaW5hdGVzIGludG8gdmlldyAoaW1tZWRpYXRlbHkpLlxuICBmdW5jdGlvbiBzY3JvbGxJbnRvVmlldyhjbSwgeDEsIHkxLCB4MiwgeTIpIHtcbiAgICB2YXIgc2Nyb2xsUG9zID0gY2FsY3VsYXRlU2Nyb2xsUG9zKGNtLCB4MSwgeTEsIHgyLCB5Mik7XG4gICAgaWYgKHNjcm9sbFBvcy5zY3JvbGxUb3AgIT0gbnVsbCkgc2V0U2Nyb2xsVG9wKGNtLCBzY3JvbGxQb3Muc2Nyb2xsVG9wKTtcbiAgICBpZiAoc2Nyb2xsUG9zLnNjcm9sbExlZnQgIT0gbnVsbCkgc2V0U2Nyb2xsTGVmdChjbSwgc2Nyb2xsUG9zLnNjcm9sbExlZnQpO1xuICB9XG5cbiAgLy8gQ2FsY3VsYXRlIGEgbmV3IHNjcm9sbCBwb3NpdGlvbiBuZWVkZWQgdG8gc2Nyb2xsIHRoZSBnaXZlblxuICAvLyByZWN0YW5nbGUgaW50byB2aWV3LiBSZXR1cm5zIGFuIG9iamVjdCB3aXRoIHNjcm9sbFRvcCBhbmRcbiAgLy8gc2Nyb2xsTGVmdCBwcm9wZXJ0aWVzLiBXaGVuIHRoZXNlIGFyZSB1bmRlZmluZWQsIHRoZVxuICAvLyB2ZXJ0aWNhbC9ob3Jpem9udGFsIHBvc2l0aW9uIGRvZXMgbm90IG5lZWQgdG8gYmUgYWRqdXN0ZWQuXG4gIGZ1bmN0aW9uIGNhbGN1bGF0ZVNjcm9sbFBvcyhjbSwgeDEsIHkxLCB4MiwgeTIpIHtcbiAgICB2YXIgZGlzcGxheSA9IGNtLmRpc3BsYXksIHNuYXBNYXJnaW4gPSB0ZXh0SGVpZ2h0KGNtLmRpc3BsYXkpO1xuICAgIGlmICh5MSA8IDApIHkxID0gMDtcbiAgICB2YXIgc2NyZWVudG9wID0gY20uY3VyT3AgJiYgY20uY3VyT3Auc2Nyb2xsVG9wICE9IG51bGwgPyBjbS5jdXJPcC5zY3JvbGxUb3AgOiBkaXNwbGF5LnNjcm9sbGVyLnNjcm9sbFRvcDtcbiAgICB2YXIgc2NyZWVuID0gZGlzcGxheS5zY3JvbGxlci5jbGllbnRIZWlnaHQgLSBzY3JvbGxlckN1dE9mZiwgcmVzdWx0ID0ge307XG4gICAgdmFyIGRvY0JvdHRvbSA9IGNtLmRvYy5oZWlnaHQgKyBwYWRkaW5nVmVydChkaXNwbGF5KTtcbiAgICB2YXIgYXRUb3AgPSB5MSA8IHNuYXBNYXJnaW4sIGF0Qm90dG9tID0geTIgPiBkb2NCb3R0b20gLSBzbmFwTWFyZ2luO1xuICAgIGlmICh5MSA8IHNjcmVlbnRvcCkge1xuICAgICAgcmVzdWx0LnNjcm9sbFRvcCA9IGF0VG9wID8gMCA6IHkxO1xuICAgIH0gZWxzZSBpZiAoeTIgPiBzY3JlZW50b3AgKyBzY3JlZW4pIHtcbiAgICAgIHZhciBuZXdUb3AgPSBNYXRoLm1pbih5MSwgKGF0Qm90dG9tID8gZG9jQm90dG9tIDogeTIpIC0gc2NyZWVuKTtcbiAgICAgIGlmIChuZXdUb3AgIT0gc2NyZWVudG9wKSByZXN1bHQuc2Nyb2xsVG9wID0gbmV3VG9wO1xuICAgIH1cblxuICAgIHZhciBzY3JlZW5sZWZ0ID0gY20uY3VyT3AgJiYgY20uY3VyT3Auc2Nyb2xsTGVmdCAhPSBudWxsID8gY20uY3VyT3Auc2Nyb2xsTGVmdCA6IGRpc3BsYXkuc2Nyb2xsZXIuc2Nyb2xsTGVmdDtcbiAgICB2YXIgc2NyZWVudyA9IGRpc3BsYXkuc2Nyb2xsZXIuY2xpZW50V2lkdGggLSBzY3JvbGxlckN1dE9mZjtcbiAgICB4MSArPSBkaXNwbGF5Lmd1dHRlcnMub2Zmc2V0V2lkdGg7IHgyICs9IGRpc3BsYXkuZ3V0dGVycy5vZmZzZXRXaWR0aDtcbiAgICB2YXIgZ3V0dGVydyA9IGRpc3BsYXkuZ3V0dGVycy5vZmZzZXRXaWR0aDtcbiAgICB2YXIgYXRMZWZ0ID0geDEgPCBndXR0ZXJ3ICsgMTA7XG4gICAgaWYgKHgxIDwgc2NyZWVubGVmdCArIGd1dHRlcncgfHwgYXRMZWZ0KSB7XG4gICAgICBpZiAoYXRMZWZ0KSB4MSA9IDA7XG4gICAgICByZXN1bHQuc2Nyb2xsTGVmdCA9IE1hdGgubWF4KDAsIHgxIC0gMTAgLSBndXR0ZXJ3KTtcbiAgICB9IGVsc2UgaWYgKHgyID4gc2NyZWVudyArIHNjcmVlbmxlZnQgLSAzKSB7XG4gICAgICByZXN1bHQuc2Nyb2xsTGVmdCA9IHgyICsgMTAgLSBzY3JlZW53O1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLy8gU3RvcmUgYSByZWxhdGl2ZSBhZGp1c3RtZW50IHRvIHRoZSBzY3JvbGwgcG9zaXRpb24gaW4gdGhlIGN1cnJlbnRcbiAgLy8gb3BlcmF0aW9uICh0byBiZSBhcHBsaWVkIHdoZW4gdGhlIG9wZXJhdGlvbiBmaW5pc2hlcykuXG4gIGZ1bmN0aW9uIGFkZFRvU2Nyb2xsUG9zKGNtLCBsZWZ0LCB0b3ApIHtcbiAgICBpZiAobGVmdCAhPSBudWxsIHx8IHRvcCAhPSBudWxsKSByZXNvbHZlU2Nyb2xsVG9Qb3MoY20pO1xuICAgIGlmIChsZWZ0ICE9IG51bGwpXG4gICAgICBjbS5jdXJPcC5zY3JvbGxMZWZ0ID0gKGNtLmN1ck9wLnNjcm9sbExlZnQgPT0gbnVsbCA/IGNtLmRvYy5zY3JvbGxMZWZ0IDogY20uY3VyT3Auc2Nyb2xsTGVmdCkgKyBsZWZ0O1xuICAgIGlmICh0b3AgIT0gbnVsbClcbiAgICAgIGNtLmN1ck9wLnNjcm9sbFRvcCA9IChjbS5jdXJPcC5zY3JvbGxUb3AgPT0gbnVsbCA/IGNtLmRvYy5zY3JvbGxUb3AgOiBjbS5jdXJPcC5zY3JvbGxUb3ApICsgdG9wO1xuICB9XG5cbiAgLy8gTWFrZSBzdXJlIHRoYXQgYXQgdGhlIGVuZCBvZiB0aGUgb3BlcmF0aW9uIHRoZSBjdXJyZW50IGN1cnNvciBpc1xuICAvLyBzaG93bi5cbiAgZnVuY3Rpb24gZW5zdXJlQ3Vyc29yVmlzaWJsZShjbSkge1xuICAgIHJlc29sdmVTY3JvbGxUb1BvcyhjbSk7XG4gICAgdmFyIGN1ciA9IGNtLmdldEN1cnNvcigpLCBmcm9tID0gY3VyLCB0byA9IGN1cjtcbiAgICBpZiAoIWNtLm9wdGlvbnMubGluZVdyYXBwaW5nKSB7XG4gICAgICBmcm9tID0gY3VyLmNoID8gUG9zKGN1ci5saW5lLCBjdXIuY2ggLSAxKSA6IGN1cjtcbiAgICAgIHRvID0gUG9zKGN1ci5saW5lLCBjdXIuY2ggKyAxKTtcbiAgICB9XG4gICAgY20uY3VyT3Auc2Nyb2xsVG9Qb3MgPSB7ZnJvbTogZnJvbSwgdG86IHRvLCBtYXJnaW46IGNtLm9wdGlvbnMuY3Vyc29yU2Nyb2xsTWFyZ2luLCBpc0N1cnNvcjogdHJ1ZX07XG4gIH1cblxuICAvLyBXaGVuIGFuIG9wZXJhdGlvbiBoYXMgaXRzIHNjcm9sbFRvUG9zIHByb3BlcnR5IHNldCwgYW5kIGFub3RoZXJcbiAgLy8gc2Nyb2xsIGFjdGlvbiBpcyBhcHBsaWVkIGJlZm9yZSB0aGUgZW5kIG9mIHRoZSBvcGVyYXRpb24sIHRoaXNcbiAgLy8gJ3NpbXVsYXRlcycgc2Nyb2xsaW5nIHRoYXQgcG9zaXRpb24gaW50byB2aWV3IGluIGEgY2hlYXAgd2F5LCBzb1xuICAvLyB0aGF0IHRoZSBlZmZlY3Qgb2YgaW50ZXJtZWRpYXRlIHNjcm9sbCBjb21tYW5kcyBpcyBub3QgaWdub3JlZC5cbiAgZnVuY3Rpb24gcmVzb2x2ZVNjcm9sbFRvUG9zKGNtKSB7XG4gICAgdmFyIHJhbmdlID0gY20uY3VyT3Auc2Nyb2xsVG9Qb3M7XG4gICAgaWYgKHJhbmdlKSB7XG4gICAgICBjbS5jdXJPcC5zY3JvbGxUb1BvcyA9IG51bGw7XG4gICAgICB2YXIgZnJvbSA9IGVzdGltYXRlQ29vcmRzKGNtLCByYW5nZS5mcm9tKSwgdG8gPSBlc3RpbWF0ZUNvb3JkcyhjbSwgcmFuZ2UudG8pO1xuICAgICAgdmFyIHNQb3MgPSBjYWxjdWxhdGVTY3JvbGxQb3MoY20sIE1hdGgubWluKGZyb20ubGVmdCwgdG8ubGVmdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLm1pbihmcm9tLnRvcCwgdG8udG9wKSAtIHJhbmdlLm1hcmdpbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGgubWF4KGZyb20ucmlnaHQsIHRvLnJpZ2h0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGgubWF4KGZyb20uYm90dG9tLCB0by5ib3R0b20pICsgcmFuZ2UubWFyZ2luKTtcbiAgICAgIGNtLnNjcm9sbFRvKHNQb3Muc2Nyb2xsTGVmdCwgc1Bvcy5zY3JvbGxUb3ApO1xuICAgIH1cbiAgfVxuXG4gIC8vIEFQSSBVVElMSVRJRVNcblxuICAvLyBJbmRlbnQgdGhlIGdpdmVuIGxpbmUuIFRoZSBob3cgcGFyYW1ldGVyIGNhbiBiZSBcInNtYXJ0XCIsXG4gIC8vIFwiYWRkXCIvbnVsbCwgXCJzdWJ0cmFjdFwiLCBvciBcInByZXZcIi4gV2hlbiBhZ2dyZXNzaXZlIGlzIGZhbHNlXG4gIC8vICh0eXBpY2FsbHkgc2V0IHRvIHRydWUgZm9yIGZvcmNlZCBzaW5nbGUtbGluZSBpbmRlbnRzKSwgZW1wdHlcbiAgLy8gbGluZXMgYXJlIG5vdCBpbmRlbnRlZCwgYW5kIHBsYWNlcyB3aGVyZSB0aGUgbW9kZSByZXR1cm5zIFBhc3NcbiAgLy8gYXJlIGxlZnQgYWxvbmUuXG4gIGZ1bmN0aW9uIGluZGVudExpbmUoY20sIG4sIGhvdywgYWdncmVzc2l2ZSkge1xuICAgIHZhciBkb2MgPSBjbS5kb2MsIHN0YXRlO1xuICAgIGlmIChob3cgPT0gbnVsbCkgaG93ID0gXCJhZGRcIjtcbiAgICBpZiAoaG93ID09IFwic21hcnRcIikge1xuICAgICAgLy8gRmFsbCBiYWNrIHRvIFwicHJldlwiIHdoZW4gdGhlIG1vZGUgZG9lc24ndCBoYXZlIGFuIGluZGVudGF0aW9uXG4gICAgICAvLyBtZXRob2QuXG4gICAgICBpZiAoIWNtLmRvYy5tb2RlLmluZGVudCkgaG93ID0gXCJwcmV2XCI7XG4gICAgICBlbHNlIHN0YXRlID0gZ2V0U3RhdGVCZWZvcmUoY20sIG4pO1xuICAgIH1cblxuICAgIHZhciB0YWJTaXplID0gY20ub3B0aW9ucy50YWJTaXplO1xuICAgIHZhciBsaW5lID0gZ2V0TGluZShkb2MsIG4pLCBjdXJTcGFjZSA9IGNvdW50Q29sdW1uKGxpbmUudGV4dCwgbnVsbCwgdGFiU2l6ZSk7XG4gICAgaWYgKGxpbmUuc3RhdGVBZnRlcikgbGluZS5zdGF0ZUFmdGVyID0gbnVsbDtcbiAgICB2YXIgY3VyU3BhY2VTdHJpbmcgPSBsaW5lLnRleHQubWF0Y2goL15cXHMqLylbMF0sIGluZGVudGF0aW9uO1xuICAgIGlmICghYWdncmVzc2l2ZSAmJiAhL1xcUy8udGVzdChsaW5lLnRleHQpKSB7XG4gICAgICBpbmRlbnRhdGlvbiA9IDA7XG4gICAgICBob3cgPSBcIm5vdFwiO1xuICAgIH0gZWxzZSBpZiAoaG93ID09IFwic21hcnRcIikge1xuICAgICAgaW5kZW50YXRpb24gPSBjbS5kb2MubW9kZS5pbmRlbnQoc3RhdGUsIGxpbmUudGV4dC5zbGljZShjdXJTcGFjZVN0cmluZy5sZW5ndGgpLCBsaW5lLnRleHQpO1xuICAgICAgaWYgKGluZGVudGF0aW9uID09IFBhc3MpIHtcbiAgICAgICAgaWYgKCFhZ2dyZXNzaXZlKSByZXR1cm47XG4gICAgICAgIGhvdyA9IFwicHJldlwiO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaG93ID09IFwicHJldlwiKSB7XG4gICAgICBpZiAobiA+IGRvYy5maXJzdCkgaW5kZW50YXRpb24gPSBjb3VudENvbHVtbihnZXRMaW5lKGRvYywgbi0xKS50ZXh0LCBudWxsLCB0YWJTaXplKTtcbiAgICAgIGVsc2UgaW5kZW50YXRpb24gPSAwO1xuICAgIH0gZWxzZSBpZiAoaG93ID09IFwiYWRkXCIpIHtcbiAgICAgIGluZGVudGF0aW9uID0gY3VyU3BhY2UgKyBjbS5vcHRpb25zLmluZGVudFVuaXQ7XG4gICAgfSBlbHNlIGlmIChob3cgPT0gXCJzdWJ0cmFjdFwiKSB7XG4gICAgICBpbmRlbnRhdGlvbiA9IGN1clNwYWNlIC0gY20ub3B0aW9ucy5pbmRlbnRVbml0O1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGhvdyA9PSBcIm51bWJlclwiKSB7XG4gICAgICBpbmRlbnRhdGlvbiA9IGN1clNwYWNlICsgaG93O1xuICAgIH1cbiAgICBpbmRlbnRhdGlvbiA9IE1hdGgubWF4KDAsIGluZGVudGF0aW9uKTtcblxuICAgIHZhciBpbmRlbnRTdHJpbmcgPSBcIlwiLCBwb3MgPSAwO1xuICAgIGlmIChjbS5vcHRpb25zLmluZGVudFdpdGhUYWJzKVxuICAgICAgZm9yICh2YXIgaSA9IE1hdGguZmxvb3IoaW5kZW50YXRpb24gLyB0YWJTaXplKTsgaTsgLS1pKSB7cG9zICs9IHRhYlNpemU7IGluZGVudFN0cmluZyArPSBcIlxcdFwiO31cbiAgICBpZiAocG9zIDwgaW5kZW50YXRpb24pIGluZGVudFN0cmluZyArPSBzcGFjZVN0cihpbmRlbnRhdGlvbiAtIHBvcyk7XG5cbiAgICBpZiAoaW5kZW50U3RyaW5nICE9IGN1clNwYWNlU3RyaW5nKSB7XG4gICAgICByZXBsYWNlUmFuZ2UoY20uZG9jLCBpbmRlbnRTdHJpbmcsIFBvcyhuLCAwKSwgUG9zKG4sIGN1clNwYWNlU3RyaW5nLmxlbmd0aCksIFwiK2lucHV0XCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBFbnN1cmUgdGhhdCwgaWYgdGhlIGN1cnNvciB3YXMgaW4gdGhlIHdoaXRlc3BhY2UgYXQgdGhlIHN0YXJ0XG4gICAgICAvLyBvZiB0aGUgbGluZSwgaXQgaXMgbW92ZWQgdG8gdGhlIGVuZCBvZiB0aGF0IHNwYWNlLlxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkb2Muc2VsLnJhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcmFuZ2UgPSBkb2Muc2VsLnJhbmdlc1tpXTtcbiAgICAgICAgaWYgKHJhbmdlLmhlYWQubGluZSA9PSBuICYmIHJhbmdlLmhlYWQuY2ggPCBjdXJTcGFjZVN0cmluZy5sZW5ndGgpIHtcbiAgICAgICAgICB2YXIgcG9zID0gUG9zKG4sIGN1clNwYWNlU3RyaW5nLmxlbmd0aCk7XG4gICAgICAgICAgcmVwbGFjZU9uZVNlbGVjdGlvbihkb2MsIGksIG5ldyBSYW5nZShwb3MsIHBvcykpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGxpbmUuc3RhdGVBZnRlciA9IG51bGw7XG4gIH1cblxuICAvLyBVdGlsaXR5IGZvciBhcHBseWluZyBhIGNoYW5nZSB0byBhIGxpbmUgYnkgaGFuZGxlIG9yIG51bWJlcixcbiAgLy8gcmV0dXJuaW5nIHRoZSBudW1iZXIgYW5kIG9wdGlvbmFsbHkgcmVnaXN0ZXJpbmcgdGhlIGxpbmUgYXNcbiAgLy8gY2hhbmdlZC5cbiAgZnVuY3Rpb24gY2hhbmdlTGluZShjbSwgaGFuZGxlLCBjaGFuZ2VUeXBlLCBvcCkge1xuICAgIHZhciBubyA9IGhhbmRsZSwgbGluZSA9IGhhbmRsZSwgZG9jID0gY20uZG9jO1xuICAgIGlmICh0eXBlb2YgaGFuZGxlID09IFwibnVtYmVyXCIpIGxpbmUgPSBnZXRMaW5lKGRvYywgY2xpcExpbmUoZG9jLCBoYW5kbGUpKTtcbiAgICBlbHNlIG5vID0gbGluZU5vKGhhbmRsZSk7XG4gICAgaWYgKG5vID09IG51bGwpIHJldHVybiBudWxsO1xuICAgIGlmIChvcChsaW5lLCBubykpIHJlZ0xpbmVDaGFuZ2UoY20sIG5vLCBjaGFuZ2VUeXBlKTtcbiAgICByZXR1cm4gbGluZTtcbiAgfVxuXG4gIC8vIEhlbHBlciBmb3IgZGVsZXRpbmcgdGV4dCBuZWFyIHRoZSBzZWxlY3Rpb24ocyksIHVzZWQgdG8gaW1wbGVtZW50XG4gIC8vIGJhY2tzcGFjZSwgZGVsZXRlLCBhbmQgc2ltaWxhciBmdW5jdGlvbmFsaXR5LlxuICBmdW5jdGlvbiBkZWxldGVOZWFyU2VsZWN0aW9uKGNtLCBjb21wdXRlKSB7XG4gICAgdmFyIHJhbmdlcyA9IGNtLmRvYy5zZWwucmFuZ2VzLCBraWxsID0gW107XG4gICAgLy8gQnVpbGQgdXAgYSBzZXQgb2YgcmFuZ2VzIHRvIGtpbGwgZmlyc3QsIG1lcmdpbmcgb3ZlcmxhcHBpbmdcbiAgICAvLyByYW5nZXMuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB0b0tpbGwgPSBjb21wdXRlKHJhbmdlc1tpXSk7XG4gICAgICB3aGlsZSAoa2lsbC5sZW5ndGggJiYgY21wKHRvS2lsbC5mcm9tLCBsc3Qoa2lsbCkudG8pIDw9IDApIHtcbiAgICAgICAgdmFyIHJlcGxhY2VkID0ga2lsbC5wb3AoKTtcbiAgICAgICAgaWYgKGNtcChyZXBsYWNlZC5mcm9tLCB0b0tpbGwuZnJvbSkgPCAwKSB7XG4gICAgICAgICAgdG9LaWxsLmZyb20gPSByZXBsYWNlZC5mcm9tO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBraWxsLnB1c2godG9LaWxsKTtcbiAgICB9XG4gICAgLy8gTmV4dCwgcmVtb3ZlIHRob3NlIGFjdHVhbCByYW5nZXMuXG4gICAgcnVuSW5PcChjbSwgZnVuY3Rpb24oKSB7XG4gICAgICBmb3IgKHZhciBpID0ga2lsbC5sZW5ndGggLSAxOyBpID49IDA7IGktLSlcbiAgICAgICAgcmVwbGFjZVJhbmdlKGNtLmRvYywgXCJcIiwga2lsbFtpXS5mcm9tLCBraWxsW2ldLnRvLCBcIitkZWxldGVcIik7XG4gICAgICBlbnN1cmVDdXJzb3JWaXNpYmxlKGNtKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFVzZWQgZm9yIGhvcml6b250YWwgcmVsYXRpdmUgbW90aW9uLiBEaXIgaXMgLTEgb3IgMSAobGVmdCBvclxuICAvLyByaWdodCksIHVuaXQgY2FuIGJlIFwiY2hhclwiLCBcImNvbHVtblwiIChsaWtlIGNoYXIsIGJ1dCBkb2Vzbid0XG4gIC8vIGNyb3NzIGxpbmUgYm91bmRhcmllcyksIFwid29yZFwiIChhY3Jvc3MgbmV4dCB3b3JkKSwgb3IgXCJncm91cFwiICh0b1xuICAvLyB0aGUgc3RhcnQgb2YgbmV4dCBncm91cCBvZiB3b3JkIG9yIG5vbi13b3JkLW5vbi13aGl0ZXNwYWNlXG4gIC8vIGNoYXJzKS4gVGhlIHZpc3VhbGx5IHBhcmFtIGNvbnRyb2xzIHdoZXRoZXIsIGluIHJpZ2h0LXRvLWxlZnRcbiAgLy8gdGV4dCwgZGlyZWN0aW9uIDEgbWVhbnMgdG8gbW92ZSB0b3dhcmRzIHRoZSBuZXh0IGluZGV4IGluIHRoZVxuICAvLyBzdHJpbmcsIG9yIHRvd2FyZHMgdGhlIGNoYXJhY3RlciB0byB0aGUgcmlnaHQgb2YgdGhlIGN1cnJlbnRcbiAgLy8gcG9zaXRpb24uIFRoZSByZXN1bHRpbmcgcG9zaXRpb24gd2lsbCBoYXZlIGEgaGl0U2lkZT10cnVlXG4gIC8vIHByb3BlcnR5IGlmIGl0IHJlYWNoZWQgdGhlIGVuZCBvZiB0aGUgZG9jdW1lbnQuXG4gIGZ1bmN0aW9uIGZpbmRQb3NIKGRvYywgcG9zLCBkaXIsIHVuaXQsIHZpc3VhbGx5KSB7XG4gICAgdmFyIGxpbmUgPSBwb3MubGluZSwgY2ggPSBwb3MuY2gsIG9yaWdEaXIgPSBkaXI7XG4gICAgdmFyIGxpbmVPYmogPSBnZXRMaW5lKGRvYywgbGluZSk7XG4gICAgdmFyIHBvc3NpYmxlID0gdHJ1ZTtcbiAgICBmdW5jdGlvbiBmaW5kTmV4dExpbmUoKSB7XG4gICAgICB2YXIgbCA9IGxpbmUgKyBkaXI7XG4gICAgICBpZiAobCA8IGRvYy5maXJzdCB8fCBsID49IGRvYy5maXJzdCArIGRvYy5zaXplKSByZXR1cm4gKHBvc3NpYmxlID0gZmFsc2UpO1xuICAgICAgbGluZSA9IGw7XG4gICAgICByZXR1cm4gbGluZU9iaiA9IGdldExpbmUoZG9jLCBsKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gbW92ZU9uY2UoYm91bmRUb0xpbmUpIHtcbiAgICAgIHZhciBuZXh0ID0gKHZpc3VhbGx5ID8gbW92ZVZpc3VhbGx5IDogbW92ZUxvZ2ljYWxseSkobGluZU9iaiwgY2gsIGRpciwgdHJ1ZSk7XG4gICAgICBpZiAobmV4dCA9PSBudWxsKSB7XG4gICAgICAgIGlmICghYm91bmRUb0xpbmUgJiYgZmluZE5leHRMaW5lKCkpIHtcbiAgICAgICAgICBpZiAodmlzdWFsbHkpIGNoID0gKGRpciA8IDAgPyBsaW5lUmlnaHQgOiBsaW5lTGVmdCkobGluZU9iaik7XG4gICAgICAgICAgZWxzZSBjaCA9IGRpciA8IDAgPyBsaW5lT2JqLnRleHQubGVuZ3RoIDogMDtcbiAgICAgICAgfSBlbHNlIHJldHVybiAocG9zc2libGUgPSBmYWxzZSk7XG4gICAgICB9IGVsc2UgY2ggPSBuZXh0O1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKHVuaXQgPT0gXCJjaGFyXCIpIG1vdmVPbmNlKCk7XG4gICAgZWxzZSBpZiAodW5pdCA9PSBcImNvbHVtblwiKSBtb3ZlT25jZSh0cnVlKTtcbiAgICBlbHNlIGlmICh1bml0ID09IFwid29yZFwiIHx8IHVuaXQgPT0gXCJncm91cFwiKSB7XG4gICAgICB2YXIgc2F3VHlwZSA9IG51bGwsIGdyb3VwID0gdW5pdCA9PSBcImdyb3VwXCI7XG4gICAgICB2YXIgaGVscGVyID0gZG9jLmNtICYmIGRvYy5jbS5nZXRIZWxwZXIocG9zLCBcIndvcmRDaGFyc1wiKTtcbiAgICAgIGZvciAodmFyIGZpcnN0ID0gdHJ1ZTs7IGZpcnN0ID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKGRpciA8IDAgJiYgIW1vdmVPbmNlKCFmaXJzdCkpIGJyZWFrO1xuICAgICAgICB2YXIgY3VyID0gbGluZU9iai50ZXh0LmNoYXJBdChjaCkgfHwgXCJcXG5cIjtcbiAgICAgICAgdmFyIHR5cGUgPSBpc1dvcmRDaGFyKGN1ciwgaGVscGVyKSA/IFwid1wiXG4gICAgICAgICAgOiBncm91cCAmJiBjdXIgPT0gXCJcXG5cIiA/IFwiblwiXG4gICAgICAgICAgOiAhZ3JvdXAgfHwgL1xccy8udGVzdChjdXIpID8gbnVsbFxuICAgICAgICAgIDogXCJwXCI7XG4gICAgICAgIGlmIChncm91cCAmJiAhZmlyc3QgJiYgIXR5cGUpIHR5cGUgPSBcInNcIjtcbiAgICAgICAgaWYgKHNhd1R5cGUgJiYgc2F3VHlwZSAhPSB0eXBlKSB7XG4gICAgICAgICAgaWYgKGRpciA8IDApIHtkaXIgPSAxOyBtb3ZlT25jZSgpO31cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlKSBzYXdUeXBlID0gdHlwZTtcbiAgICAgICAgaWYgKGRpciA+IDAgJiYgIW1vdmVPbmNlKCFmaXJzdCkpIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICB2YXIgcmVzdWx0ID0gc2tpcEF0b21pYyhkb2MsIFBvcyhsaW5lLCBjaCksIG9yaWdEaXIsIHRydWUpO1xuICAgIGlmICghcG9zc2libGUpIHJlc3VsdC5oaXRTaWRlID0gdHJ1ZTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLy8gRm9yIHJlbGF0aXZlIHZlcnRpY2FsIG1vdmVtZW50LiBEaXIgbWF5IGJlIC0xIG9yIDEuIFVuaXQgY2FuIGJlXG4gIC8vIFwicGFnZVwiIG9yIFwibGluZVwiLiBUaGUgcmVzdWx0aW5nIHBvc2l0aW9uIHdpbGwgaGF2ZSBhIGhpdFNpZGU9dHJ1ZVxuICAvLyBwcm9wZXJ0eSBpZiBpdCByZWFjaGVkIHRoZSBlbmQgb2YgdGhlIGRvY3VtZW50LlxuICBmdW5jdGlvbiBmaW5kUG9zVihjbSwgcG9zLCBkaXIsIHVuaXQpIHtcbiAgICB2YXIgZG9jID0gY20uZG9jLCB4ID0gcG9zLmxlZnQsIHk7XG4gICAgaWYgKHVuaXQgPT0gXCJwYWdlXCIpIHtcbiAgICAgIHZhciBwYWdlU2l6ZSA9IE1hdGgubWluKGNtLmRpc3BsYXkud3JhcHBlci5jbGllbnRIZWlnaHQsIHdpbmRvdy5pbm5lckhlaWdodCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0KTtcbiAgICAgIHkgPSBwb3MudG9wICsgZGlyICogKHBhZ2VTaXplIC0gKGRpciA8IDAgPyAxLjUgOiAuNSkgKiB0ZXh0SGVpZ2h0KGNtLmRpc3BsYXkpKTtcbiAgICB9IGVsc2UgaWYgKHVuaXQgPT0gXCJsaW5lXCIpIHtcbiAgICAgIHkgPSBkaXIgPiAwID8gcG9zLmJvdHRvbSArIDMgOiBwb3MudG9wIC0gMztcbiAgICB9XG4gICAgZm9yICg7Oykge1xuICAgICAgdmFyIHRhcmdldCA9IGNvb3Jkc0NoYXIoY20sIHgsIHkpO1xuICAgICAgaWYgKCF0YXJnZXQub3V0c2lkZSkgYnJlYWs7XG4gICAgICBpZiAoZGlyIDwgMCA/IHkgPD0gMCA6IHkgPj0gZG9jLmhlaWdodCkgeyB0YXJnZXQuaGl0U2lkZSA9IHRydWU7IGJyZWFrOyB9XG4gICAgICB5ICs9IGRpciAqIDU7XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXQ7XG4gIH1cblxuICAvLyBGaW5kIHRoZSB3b3JkIGF0IHRoZSBnaXZlbiBwb3NpdGlvbiAoYXMgcmV0dXJuZWQgYnkgY29vcmRzQ2hhcikuXG4gIGZ1bmN0aW9uIGZpbmRXb3JkQXQoY20sIHBvcykge1xuICAgIHZhciBkb2MgPSBjbS5kb2MsIGxpbmUgPSBnZXRMaW5lKGRvYywgcG9zLmxpbmUpLnRleHQ7XG4gICAgdmFyIHN0YXJ0ID0gcG9zLmNoLCBlbmQgPSBwb3MuY2g7XG4gICAgaWYgKGxpbmUpIHtcbiAgICAgIHZhciBoZWxwZXIgPSBjbS5nZXRIZWxwZXIocG9zLCBcIndvcmRDaGFyc1wiKTtcbiAgICAgIGlmICgocG9zLnhSZWwgPCAwIHx8IGVuZCA9PSBsaW5lLmxlbmd0aCkgJiYgc3RhcnQpIC0tc3RhcnQ7IGVsc2UgKytlbmQ7XG4gICAgICB2YXIgc3RhcnRDaGFyID0gbGluZS5jaGFyQXQoc3RhcnQpO1xuICAgICAgdmFyIGNoZWNrID0gaXNXb3JkQ2hhcihzdGFydENoYXIsIGhlbHBlcilcbiAgICAgICAgPyBmdW5jdGlvbihjaCkgeyByZXR1cm4gaXNXb3JkQ2hhcihjaCwgaGVscGVyKTsgfVxuICAgICAgICA6IC9cXHMvLnRlc3Qoc3RhcnRDaGFyKSA/IGZ1bmN0aW9uKGNoKSB7cmV0dXJuIC9cXHMvLnRlc3QoY2gpO31cbiAgICAgICAgOiBmdW5jdGlvbihjaCkge3JldHVybiAhL1xccy8udGVzdChjaCkgJiYgIWlzV29yZENoYXIoY2gpO307XG4gICAgICB3aGlsZSAoc3RhcnQgPiAwICYmIGNoZWNrKGxpbmUuY2hhckF0KHN0YXJ0IC0gMSkpKSAtLXN0YXJ0O1xuICAgICAgd2hpbGUgKGVuZCA8IGxpbmUubGVuZ3RoICYmIGNoZWNrKGxpbmUuY2hhckF0KGVuZCkpKSArK2VuZDtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBSYW5nZShQb3MocG9zLmxpbmUsIHN0YXJ0KSwgUG9zKHBvcy5saW5lLCBlbmQpKTtcbiAgfVxuXG4gIC8vIEVESVRPUiBNRVRIT0RTXG5cbiAgLy8gVGhlIHB1YmxpY2x5IHZpc2libGUgQVBJLiBOb3RlIHRoYXQgbWV0aG9kT3AoZikgbWVhbnNcbiAgLy8gJ3dyYXAgZiBpbiBhbiBvcGVyYXRpb24sIHBlcmZvcm1lZCBvbiBpdHMgYHRoaXNgIHBhcmFtZXRlcicuXG5cbiAgLy8gVGhpcyBpcyBub3QgdGhlIGNvbXBsZXRlIHNldCBvZiBlZGl0b3IgbWV0aG9kcy4gTW9zdCBvZiB0aGVcbiAgLy8gbWV0aG9kcyBkZWZpbmVkIG9uIHRoZSBEb2MgdHlwZSBhcmUgYWxzbyBpbmplY3RlZCBpbnRvXG4gIC8vIENvZGVNaXJyb3IucHJvdG90eXBlLCBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgYW5kXG4gIC8vIGNvbnZlbmllbmNlLlxuXG4gIENvZGVNaXJyb3IucHJvdG90eXBlID0ge1xuICAgIGNvbnN0cnVjdG9yOiBDb2RlTWlycm9yLFxuICAgIGZvY3VzOiBmdW5jdGlvbigpe3dpbmRvdy5mb2N1cygpOyBmb2N1c0lucHV0KHRoaXMpOyBmYXN0UG9sbCh0aGlzKTt9LFxuXG4gICAgc2V0T3B0aW9uOiBmdW5jdGlvbihvcHRpb24sIHZhbHVlKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucywgb2xkID0gb3B0aW9uc1tvcHRpb25dO1xuICAgICAgaWYgKG9wdGlvbnNbb3B0aW9uXSA9PSB2YWx1ZSAmJiBvcHRpb24gIT0gXCJtb2RlXCIpIHJldHVybjtcbiAgICAgIG9wdGlvbnNbb3B0aW9uXSA9IHZhbHVlO1xuICAgICAgaWYgKG9wdGlvbkhhbmRsZXJzLmhhc093blByb3BlcnR5KG9wdGlvbikpXG4gICAgICAgIG9wZXJhdGlvbih0aGlzLCBvcHRpb25IYW5kbGVyc1tvcHRpb25dKSh0aGlzLCB2YWx1ZSwgb2xkKTtcbiAgICB9LFxuXG4gICAgZ2V0T3B0aW9uOiBmdW5jdGlvbihvcHRpb24pIHtyZXR1cm4gdGhpcy5vcHRpb25zW29wdGlvbl07fSxcbiAgICBnZXREb2M6IGZ1bmN0aW9uKCkge3JldHVybiB0aGlzLmRvYzt9LFxuXG4gICAgYWRkS2V5TWFwOiBmdW5jdGlvbihtYXAsIGJvdHRvbSkge1xuICAgICAgdGhpcy5zdGF0ZS5rZXlNYXBzW2JvdHRvbSA/IFwicHVzaFwiIDogXCJ1bnNoaWZ0XCJdKG1hcCk7XG4gICAgfSxcbiAgICByZW1vdmVLZXlNYXA6IGZ1bmN0aW9uKG1hcCkge1xuICAgICAgdmFyIG1hcHMgPSB0aGlzLnN0YXRlLmtleU1hcHM7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1hcHMubGVuZ3RoOyArK2kpXG4gICAgICAgIGlmIChtYXBzW2ldID09IG1hcCB8fCAodHlwZW9mIG1hcHNbaV0gIT0gXCJzdHJpbmdcIiAmJiBtYXBzW2ldLm5hbWUgPT0gbWFwKSkge1xuICAgICAgICAgIG1hcHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGFkZE92ZXJsYXk6IG1ldGhvZE9wKGZ1bmN0aW9uKHNwZWMsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBtb2RlID0gc3BlYy50b2tlbiA/IHNwZWMgOiBDb2RlTWlycm9yLmdldE1vZGUodGhpcy5vcHRpb25zLCBzcGVjKTtcbiAgICAgIGlmIChtb2RlLnN0YXJ0U3RhdGUpIHRocm93IG5ldyBFcnJvcihcIk92ZXJsYXlzIG1heSBub3QgYmUgc3RhdGVmdWwuXCIpO1xuICAgICAgdGhpcy5zdGF0ZS5vdmVybGF5cy5wdXNoKHttb2RlOiBtb2RlLCBtb2RlU3BlYzogc3BlYywgb3BhcXVlOiBvcHRpb25zICYmIG9wdGlvbnMub3BhcXVlfSk7XG4gICAgICB0aGlzLnN0YXRlLm1vZGVHZW4rKztcbiAgICAgIHJlZ0NoYW5nZSh0aGlzKTtcbiAgICB9KSxcbiAgICByZW1vdmVPdmVybGF5OiBtZXRob2RPcChmdW5jdGlvbihzcGVjKSB7XG4gICAgICB2YXIgb3ZlcmxheXMgPSB0aGlzLnN0YXRlLm92ZXJsYXlzO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvdmVybGF5cy5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgY3VyID0gb3ZlcmxheXNbaV0ubW9kZVNwZWM7XG4gICAgICAgIGlmIChjdXIgPT0gc3BlYyB8fCB0eXBlb2Ygc3BlYyA9PSBcInN0cmluZ1wiICYmIGN1ci5uYW1lID09IHNwZWMpIHtcbiAgICAgICAgICBvdmVybGF5cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgdGhpcy5zdGF0ZS5tb2RlR2VuKys7XG4gICAgICAgICAgcmVnQ2hhbmdlKHRoaXMpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pLFxuXG4gICAgaW5kZW50TGluZTogbWV0aG9kT3AoZnVuY3Rpb24obiwgZGlyLCBhZ2dyZXNzaXZlKSB7XG4gICAgICBpZiAodHlwZW9mIGRpciAhPSBcInN0cmluZ1wiICYmIHR5cGVvZiBkaXIgIT0gXCJudW1iZXJcIikge1xuICAgICAgICBpZiAoZGlyID09IG51bGwpIGRpciA9IHRoaXMub3B0aW9ucy5zbWFydEluZGVudCA/IFwic21hcnRcIiA6IFwicHJldlwiO1xuICAgICAgICBlbHNlIGRpciA9IGRpciA/IFwiYWRkXCIgOiBcInN1YnRyYWN0XCI7XG4gICAgICB9XG4gICAgICBpZiAoaXNMaW5lKHRoaXMuZG9jLCBuKSkgaW5kZW50TGluZSh0aGlzLCBuLCBkaXIsIGFnZ3Jlc3NpdmUpO1xuICAgIH0pLFxuICAgIGluZGVudFNlbGVjdGlvbjogbWV0aG9kT3AoZnVuY3Rpb24oaG93KSB7XG4gICAgICB2YXIgcmFuZ2VzID0gdGhpcy5kb2Muc2VsLnJhbmdlcywgZW5kID0gLTE7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcmFuZ2UgPSByYW5nZXNbaV07XG4gICAgICAgIGlmICghcmFuZ2UuZW1wdHkoKSkge1xuICAgICAgICAgIHZhciBzdGFydCA9IE1hdGgubWF4KGVuZCwgcmFuZ2UuZnJvbSgpLmxpbmUpO1xuICAgICAgICAgIHZhciB0byA9IHJhbmdlLnRvKCk7XG4gICAgICAgICAgZW5kID0gTWF0aC5taW4odGhpcy5sYXN0TGluZSgpLCB0by5saW5lIC0gKHRvLmNoID8gMCA6IDEpKSArIDE7XG4gICAgICAgICAgZm9yICh2YXIgaiA9IHN0YXJ0OyBqIDwgZW5kOyArK2opXG4gICAgICAgICAgICBpbmRlbnRMaW5lKHRoaXMsIGosIGhvdyk7XG4gICAgICAgIH0gZWxzZSBpZiAocmFuZ2UuaGVhZC5saW5lID4gZW5kKSB7XG4gICAgICAgICAgaW5kZW50TGluZSh0aGlzLCByYW5nZS5oZWFkLmxpbmUsIGhvdywgdHJ1ZSk7XG4gICAgICAgICAgZW5kID0gcmFuZ2UuaGVhZC5saW5lO1xuICAgICAgICAgIGlmIChpID09IHRoaXMuZG9jLnNlbC5wcmltSW5kZXgpIGVuc3VyZUN1cnNvclZpc2libGUodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KSxcblxuICAgIC8vIEZldGNoIHRoZSBwYXJzZXIgdG9rZW4gZm9yIGEgZ2l2ZW4gY2hhcmFjdGVyLiBVc2VmdWwgZm9yIGhhY2tzXG4gICAgLy8gdGhhdCB3YW50IHRvIGluc3BlY3QgdGhlIG1vZGUgc3RhdGUgKHNheSwgZm9yIGNvbXBsZXRpb24pLlxuICAgIGdldFRva2VuQXQ6IGZ1bmN0aW9uKHBvcywgcHJlY2lzZSkge1xuICAgICAgdmFyIGRvYyA9IHRoaXMuZG9jO1xuICAgICAgcG9zID0gY2xpcFBvcyhkb2MsIHBvcyk7XG4gICAgICB2YXIgc3RhdGUgPSBnZXRTdGF0ZUJlZm9yZSh0aGlzLCBwb3MubGluZSwgcHJlY2lzZSksIG1vZGUgPSB0aGlzLmRvYy5tb2RlO1xuICAgICAgdmFyIGxpbmUgPSBnZXRMaW5lKGRvYywgcG9zLmxpbmUpO1xuICAgICAgdmFyIHN0cmVhbSA9IG5ldyBTdHJpbmdTdHJlYW0obGluZS50ZXh0LCB0aGlzLm9wdGlvbnMudGFiU2l6ZSk7XG4gICAgICB3aGlsZSAoc3RyZWFtLnBvcyA8IHBvcy5jaCAmJiAhc3RyZWFtLmVvbCgpKSB7XG4gICAgICAgIHN0cmVhbS5zdGFydCA9IHN0cmVhbS5wb3M7XG4gICAgICAgIHZhciBzdHlsZSA9IHJlYWRUb2tlbihtb2RlLCBzdHJlYW0sIHN0YXRlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7c3RhcnQ6IHN0cmVhbS5zdGFydCxcbiAgICAgICAgICAgICAgZW5kOiBzdHJlYW0ucG9zLFxuICAgICAgICAgICAgICBzdHJpbmc6IHN0cmVhbS5jdXJyZW50KCksXG4gICAgICAgICAgICAgIHR5cGU6IHN0eWxlIHx8IG51bGwsXG4gICAgICAgICAgICAgIHN0YXRlOiBzdGF0ZX07XG4gICAgfSxcblxuICAgIGdldFRva2VuVHlwZUF0OiBmdW5jdGlvbihwb3MpIHtcbiAgICAgIHBvcyA9IGNsaXBQb3ModGhpcy5kb2MsIHBvcyk7XG4gICAgICB2YXIgc3R5bGVzID0gZ2V0TGluZVN0eWxlcyh0aGlzLCBnZXRMaW5lKHRoaXMuZG9jLCBwb3MubGluZSkpO1xuICAgICAgdmFyIGJlZm9yZSA9IDAsIGFmdGVyID0gKHN0eWxlcy5sZW5ndGggLSAxKSAvIDIsIGNoID0gcG9zLmNoO1xuICAgICAgdmFyIHR5cGU7XG4gICAgICBpZiAoY2ggPT0gMCkgdHlwZSA9IHN0eWxlc1syXTtcbiAgICAgIGVsc2UgZm9yICg7Oykge1xuICAgICAgICB2YXIgbWlkID0gKGJlZm9yZSArIGFmdGVyKSA+PiAxO1xuICAgICAgICBpZiAoKG1pZCA/IHN0eWxlc1ttaWQgKiAyIC0gMV0gOiAwKSA+PSBjaCkgYWZ0ZXIgPSBtaWQ7XG4gICAgICAgIGVsc2UgaWYgKHN0eWxlc1ttaWQgKiAyICsgMV0gPCBjaCkgYmVmb3JlID0gbWlkICsgMTtcbiAgICAgICAgZWxzZSB7IHR5cGUgPSBzdHlsZXNbbWlkICogMiArIDJdOyBicmVhazsgfVxuICAgICAgfVxuICAgICAgdmFyIGN1dCA9IHR5cGUgPyB0eXBlLmluZGV4T2YoXCJjbS1vdmVybGF5IFwiKSA6IC0xO1xuICAgICAgcmV0dXJuIGN1dCA8IDAgPyB0eXBlIDogY3V0ID09IDAgPyBudWxsIDogdHlwZS5zbGljZSgwLCBjdXQgLSAxKTtcbiAgICB9LFxuXG4gICAgZ2V0TW9kZUF0OiBmdW5jdGlvbihwb3MpIHtcbiAgICAgIHZhciBtb2RlID0gdGhpcy5kb2MubW9kZTtcbiAgICAgIGlmICghbW9kZS5pbm5lck1vZGUpIHJldHVybiBtb2RlO1xuICAgICAgcmV0dXJuIENvZGVNaXJyb3IuaW5uZXJNb2RlKG1vZGUsIHRoaXMuZ2V0VG9rZW5BdChwb3MpLnN0YXRlKS5tb2RlO1xuICAgIH0sXG5cbiAgICBnZXRIZWxwZXI6IGZ1bmN0aW9uKHBvcywgdHlwZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0SGVscGVycyhwb3MsIHR5cGUpWzBdO1xuICAgIH0sXG5cbiAgICBnZXRIZWxwZXJzOiBmdW5jdGlvbihwb3MsIHR5cGUpIHtcbiAgICAgIHZhciBmb3VuZCA9IFtdO1xuICAgICAgaWYgKCFoZWxwZXJzLmhhc093blByb3BlcnR5KHR5cGUpKSByZXR1cm4gaGVscGVycztcbiAgICAgIHZhciBoZWxwID0gaGVscGVyc1t0eXBlXSwgbW9kZSA9IHRoaXMuZ2V0TW9kZUF0KHBvcyk7XG4gICAgICBpZiAodHlwZW9mIG1vZGVbdHlwZV0gPT0gXCJzdHJpbmdcIikge1xuICAgICAgICBpZiAoaGVscFttb2RlW3R5cGVdXSkgZm91bmQucHVzaChoZWxwW21vZGVbdHlwZV1dKTtcbiAgICAgIH0gZWxzZSBpZiAobW9kZVt0eXBlXSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vZGVbdHlwZV0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgdmFsID0gaGVscFttb2RlW3R5cGVdW2ldXTtcbiAgICAgICAgICBpZiAodmFsKSBmb3VuZC5wdXNoKHZhbCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAobW9kZS5oZWxwZXJUeXBlICYmIGhlbHBbbW9kZS5oZWxwZXJUeXBlXSkge1xuICAgICAgICBmb3VuZC5wdXNoKGhlbHBbbW9kZS5oZWxwZXJUeXBlXSk7XG4gICAgICB9IGVsc2UgaWYgKGhlbHBbbW9kZS5uYW1lXSkge1xuICAgICAgICBmb3VuZC5wdXNoKGhlbHBbbW9kZS5uYW1lXSk7XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhlbHAuX2dsb2JhbC5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgY3VyID0gaGVscC5fZ2xvYmFsW2ldO1xuICAgICAgICBpZiAoY3VyLnByZWQobW9kZSwgdGhpcykgJiYgaW5kZXhPZihmb3VuZCwgY3VyLnZhbCkgPT0gLTEpXG4gICAgICAgICAgZm91bmQucHVzaChjdXIudmFsKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmb3VuZDtcbiAgICB9LFxuXG4gICAgZ2V0U3RhdGVBZnRlcjogZnVuY3Rpb24obGluZSwgcHJlY2lzZSkge1xuICAgICAgdmFyIGRvYyA9IHRoaXMuZG9jO1xuICAgICAgbGluZSA9IGNsaXBMaW5lKGRvYywgbGluZSA9PSBudWxsID8gZG9jLmZpcnN0ICsgZG9jLnNpemUgLSAxOiBsaW5lKTtcbiAgICAgIHJldHVybiBnZXRTdGF0ZUJlZm9yZSh0aGlzLCBsaW5lICsgMSwgcHJlY2lzZSk7XG4gICAgfSxcblxuICAgIGN1cnNvckNvb3JkczogZnVuY3Rpb24oc3RhcnQsIG1vZGUpIHtcbiAgICAgIHZhciBwb3MsIHJhbmdlID0gdGhpcy5kb2Muc2VsLnByaW1hcnkoKTtcbiAgICAgIGlmIChzdGFydCA9PSBudWxsKSBwb3MgPSByYW5nZS5oZWFkO1xuICAgICAgZWxzZSBpZiAodHlwZW9mIHN0YXJ0ID09IFwib2JqZWN0XCIpIHBvcyA9IGNsaXBQb3ModGhpcy5kb2MsIHN0YXJ0KTtcbiAgICAgIGVsc2UgcG9zID0gc3RhcnQgPyByYW5nZS5mcm9tKCkgOiByYW5nZS50bygpO1xuICAgICAgcmV0dXJuIGN1cnNvckNvb3Jkcyh0aGlzLCBwb3MsIG1vZGUgfHwgXCJwYWdlXCIpO1xuICAgIH0sXG5cbiAgICBjaGFyQ29vcmRzOiBmdW5jdGlvbihwb3MsIG1vZGUpIHtcbiAgICAgIHJldHVybiBjaGFyQ29vcmRzKHRoaXMsIGNsaXBQb3ModGhpcy5kb2MsIHBvcyksIG1vZGUgfHwgXCJwYWdlXCIpO1xuICAgIH0sXG5cbiAgICBjb29yZHNDaGFyOiBmdW5jdGlvbihjb29yZHMsIG1vZGUpIHtcbiAgICAgIGNvb3JkcyA9IGZyb21Db29yZFN5c3RlbSh0aGlzLCBjb29yZHMsIG1vZGUgfHwgXCJwYWdlXCIpO1xuICAgICAgcmV0dXJuIGNvb3Jkc0NoYXIodGhpcywgY29vcmRzLmxlZnQsIGNvb3Jkcy50b3ApO1xuICAgIH0sXG5cbiAgICBsaW5lQXRIZWlnaHQ6IGZ1bmN0aW9uKGhlaWdodCwgbW9kZSkge1xuICAgICAgaGVpZ2h0ID0gZnJvbUNvb3JkU3lzdGVtKHRoaXMsIHt0b3A6IGhlaWdodCwgbGVmdDogMH0sIG1vZGUgfHwgXCJwYWdlXCIpLnRvcDtcbiAgICAgIHJldHVybiBsaW5lQXRIZWlnaHQodGhpcy5kb2MsIGhlaWdodCArIHRoaXMuZGlzcGxheS52aWV3T2Zmc2V0KTtcbiAgICB9LFxuICAgIGhlaWdodEF0TGluZTogZnVuY3Rpb24obGluZSwgbW9kZSkge1xuICAgICAgdmFyIGVuZCA9IGZhbHNlLCBsYXN0ID0gdGhpcy5kb2MuZmlyc3QgKyB0aGlzLmRvYy5zaXplIC0gMTtcbiAgICAgIGlmIChsaW5lIDwgdGhpcy5kb2MuZmlyc3QpIGxpbmUgPSB0aGlzLmRvYy5maXJzdDtcbiAgICAgIGVsc2UgaWYgKGxpbmUgPiBsYXN0KSB7IGxpbmUgPSBsYXN0OyBlbmQgPSB0cnVlOyB9XG4gICAgICB2YXIgbGluZU9iaiA9IGdldExpbmUodGhpcy5kb2MsIGxpbmUpO1xuICAgICAgcmV0dXJuIGludG9Db29yZFN5c3RlbSh0aGlzLCBsaW5lT2JqLCB7dG9wOiAwLCBsZWZ0OiAwfSwgbW9kZSB8fCBcInBhZ2VcIikudG9wICtcbiAgICAgICAgKGVuZCA/IHRoaXMuZG9jLmhlaWdodCAtIGhlaWdodEF0TGluZShsaW5lT2JqKSA6IDApO1xuICAgIH0sXG5cbiAgICBkZWZhdWx0VGV4dEhlaWdodDogZnVuY3Rpb24oKSB7IHJldHVybiB0ZXh0SGVpZ2h0KHRoaXMuZGlzcGxheSk7IH0sXG4gICAgZGVmYXVsdENoYXJXaWR0aDogZnVuY3Rpb24oKSB7IHJldHVybiBjaGFyV2lkdGgodGhpcy5kaXNwbGF5KTsgfSxcblxuICAgIHNldEd1dHRlck1hcmtlcjogbWV0aG9kT3AoZnVuY3Rpb24obGluZSwgZ3V0dGVySUQsIHZhbHVlKSB7XG4gICAgICByZXR1cm4gY2hhbmdlTGluZSh0aGlzLCBsaW5lLCBcImd1dHRlclwiLCBmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgIHZhciBtYXJrZXJzID0gbGluZS5ndXR0ZXJNYXJrZXJzIHx8IChsaW5lLmd1dHRlck1hcmtlcnMgPSB7fSk7XG4gICAgICAgIG1hcmtlcnNbZ3V0dGVySURdID0gdmFsdWU7XG4gICAgICAgIGlmICghdmFsdWUgJiYgaXNFbXB0eShtYXJrZXJzKSkgbGluZS5ndXR0ZXJNYXJrZXJzID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9KTtcbiAgICB9KSxcblxuICAgIGNsZWFyR3V0dGVyOiBtZXRob2RPcChmdW5jdGlvbihndXR0ZXJJRCkge1xuICAgICAgdmFyIGNtID0gdGhpcywgZG9jID0gY20uZG9jLCBpID0gZG9jLmZpcnN0O1xuICAgICAgZG9jLml0ZXIoZnVuY3Rpb24obGluZSkge1xuICAgICAgICBpZiAobGluZS5ndXR0ZXJNYXJrZXJzICYmIGxpbmUuZ3V0dGVyTWFya2Vyc1tndXR0ZXJJRF0pIHtcbiAgICAgICAgICBsaW5lLmd1dHRlck1hcmtlcnNbZ3V0dGVySURdID0gbnVsbDtcbiAgICAgICAgICByZWdMaW5lQ2hhbmdlKGNtLCBpLCBcImd1dHRlclwiKTtcbiAgICAgICAgICBpZiAoaXNFbXB0eShsaW5lLmd1dHRlck1hcmtlcnMpKSBsaW5lLmd1dHRlck1hcmtlcnMgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgICsraTtcbiAgICAgIH0pO1xuICAgIH0pLFxuXG4gICAgYWRkTGluZUNsYXNzOiBtZXRob2RPcChmdW5jdGlvbihoYW5kbGUsIHdoZXJlLCBjbHMpIHtcbiAgICAgIHJldHVybiBjaGFuZ2VMaW5lKHRoaXMsIGhhbmRsZSwgXCJjbGFzc1wiLCBmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgIHZhciBwcm9wID0gd2hlcmUgPT0gXCJ0ZXh0XCIgPyBcInRleHRDbGFzc1wiIDogd2hlcmUgPT0gXCJiYWNrZ3JvdW5kXCIgPyBcImJnQ2xhc3NcIiA6IFwid3JhcENsYXNzXCI7XG4gICAgICAgIGlmICghbGluZVtwcm9wXSkgbGluZVtwcm9wXSA9IGNscztcbiAgICAgICAgZWxzZSBpZiAobmV3IFJlZ0V4cChcIig/Ol58XFxcXHMpXCIgKyBjbHMgKyBcIig/OiR8XFxcXHMpXCIpLnRlc3QobGluZVtwcm9wXSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgZWxzZSBsaW5lW3Byb3BdICs9IFwiIFwiICsgY2xzO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH0pLFxuXG4gICAgcmVtb3ZlTGluZUNsYXNzOiBtZXRob2RPcChmdW5jdGlvbihoYW5kbGUsIHdoZXJlLCBjbHMpIHtcbiAgICAgIHJldHVybiBjaGFuZ2VMaW5lKHRoaXMsIGhhbmRsZSwgXCJjbGFzc1wiLCBmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgIHZhciBwcm9wID0gd2hlcmUgPT0gXCJ0ZXh0XCIgPyBcInRleHRDbGFzc1wiIDogd2hlcmUgPT0gXCJiYWNrZ3JvdW5kXCIgPyBcImJnQ2xhc3NcIiA6IFwid3JhcENsYXNzXCI7XG4gICAgICAgIHZhciBjdXIgPSBsaW5lW3Byb3BdO1xuICAgICAgICBpZiAoIWN1cikgcmV0dXJuIGZhbHNlO1xuICAgICAgICBlbHNlIGlmIChjbHMgPT0gbnVsbCkgbGluZVtwcm9wXSA9IG51bGw7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHZhciBmb3VuZCA9IGN1ci5tYXRjaChuZXcgUmVnRXhwKFwiKD86XnxcXFxccyspXCIgKyBjbHMgKyBcIig/OiR8XFxcXHMrKVwiKSk7XG4gICAgICAgICAgaWYgKCFmb3VuZCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIHZhciBlbmQgPSBmb3VuZC5pbmRleCArIGZvdW5kWzBdLmxlbmd0aDtcbiAgICAgICAgICBsaW5lW3Byb3BdID0gY3VyLnNsaWNlKDAsIGZvdW5kLmluZGV4KSArICghZm91bmQuaW5kZXggfHwgZW5kID09IGN1ci5sZW5ndGggPyBcIlwiIDogXCIgXCIpICsgY3VyLnNsaWNlKGVuZCkgfHwgbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH0pLFxuXG4gICAgYWRkTGluZVdpZGdldDogbWV0aG9kT3AoZnVuY3Rpb24oaGFuZGxlLCBub2RlLCBvcHRpb25zKSB7XG4gICAgICByZXR1cm4gYWRkTGluZVdpZGdldCh0aGlzLCBoYW5kbGUsIG5vZGUsIG9wdGlvbnMpO1xuICAgIH0pLFxuXG4gICAgcmVtb3ZlTGluZVdpZGdldDogZnVuY3Rpb24od2lkZ2V0KSB7IHdpZGdldC5jbGVhcigpOyB9LFxuXG4gICAgbGluZUluZm86IGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIGlmICh0eXBlb2YgbGluZSA9PSBcIm51bWJlclwiKSB7XG4gICAgICAgIGlmICghaXNMaW5lKHRoaXMuZG9jLCBsaW5lKSkgcmV0dXJuIG51bGw7XG4gICAgICAgIHZhciBuID0gbGluZTtcbiAgICAgICAgbGluZSA9IGdldExpbmUodGhpcy5kb2MsIGxpbmUpO1xuICAgICAgICBpZiAoIWxpbmUpIHJldHVybiBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIG4gPSBsaW5lTm8obGluZSk7XG4gICAgICAgIGlmIChuID09IG51bGwpIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtsaW5lOiBuLCBoYW5kbGU6IGxpbmUsIHRleHQ6IGxpbmUudGV4dCwgZ3V0dGVyTWFya2VyczogbGluZS5ndXR0ZXJNYXJrZXJzLFxuICAgICAgICAgICAgICB0ZXh0Q2xhc3M6IGxpbmUudGV4dENsYXNzLCBiZ0NsYXNzOiBsaW5lLmJnQ2xhc3MsIHdyYXBDbGFzczogbGluZS53cmFwQ2xhc3MsXG4gICAgICAgICAgICAgIHdpZGdldHM6IGxpbmUud2lkZ2V0c307XG4gICAgfSxcblxuICAgIGdldFZpZXdwb3J0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHtmcm9tOiB0aGlzLmRpc3BsYXkudmlld0Zyb20sIHRvOiB0aGlzLmRpc3BsYXkudmlld1RvfTt9LFxuXG4gICAgYWRkV2lkZ2V0OiBmdW5jdGlvbihwb3MsIG5vZGUsIHNjcm9sbCwgdmVydCwgaG9yaXopIHtcbiAgICAgIHZhciBkaXNwbGF5ID0gdGhpcy5kaXNwbGF5O1xuICAgICAgcG9zID0gY3Vyc29yQ29vcmRzKHRoaXMsIGNsaXBQb3ModGhpcy5kb2MsIHBvcykpO1xuICAgICAgdmFyIHRvcCA9IHBvcy5ib3R0b20sIGxlZnQgPSBwb3MubGVmdDtcbiAgICAgIG5vZGUuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgICBkaXNwbGF5LnNpemVyLmFwcGVuZENoaWxkKG5vZGUpO1xuICAgICAgaWYgKHZlcnQgPT0gXCJvdmVyXCIpIHtcbiAgICAgICAgdG9wID0gcG9zLnRvcDtcbiAgICAgIH0gZWxzZSBpZiAodmVydCA9PSBcImFib3ZlXCIgfHwgdmVydCA9PSBcIm5lYXJcIikge1xuICAgICAgICB2YXIgdnNwYWNlID0gTWF0aC5tYXgoZGlzcGxheS53cmFwcGVyLmNsaWVudEhlaWdodCwgdGhpcy5kb2MuaGVpZ2h0KSxcbiAgICAgICAgaHNwYWNlID0gTWF0aC5tYXgoZGlzcGxheS5zaXplci5jbGllbnRXaWR0aCwgZGlzcGxheS5saW5lU3BhY2UuY2xpZW50V2lkdGgpO1xuICAgICAgICAvLyBEZWZhdWx0IHRvIHBvc2l0aW9uaW5nIGFib3ZlIChpZiBzcGVjaWZpZWQgYW5kIHBvc3NpYmxlKTsgb3RoZXJ3aXNlIGRlZmF1bHQgdG8gcG9zaXRpb25pbmcgYmVsb3dcbiAgICAgICAgaWYgKCh2ZXJ0ID09ICdhYm92ZScgfHwgcG9zLmJvdHRvbSArIG5vZGUub2Zmc2V0SGVpZ2h0ID4gdnNwYWNlKSAmJiBwb3MudG9wID4gbm9kZS5vZmZzZXRIZWlnaHQpXG4gICAgICAgICAgdG9wID0gcG9zLnRvcCAtIG5vZGUub2Zmc2V0SGVpZ2h0O1xuICAgICAgICBlbHNlIGlmIChwb3MuYm90dG9tICsgbm9kZS5vZmZzZXRIZWlnaHQgPD0gdnNwYWNlKVxuICAgICAgICAgIHRvcCA9IHBvcy5ib3R0b207XG4gICAgICAgIGlmIChsZWZ0ICsgbm9kZS5vZmZzZXRXaWR0aCA+IGhzcGFjZSlcbiAgICAgICAgICBsZWZ0ID0gaHNwYWNlIC0gbm9kZS5vZmZzZXRXaWR0aDtcbiAgICAgIH1cbiAgICAgIG5vZGUuc3R5bGUudG9wID0gdG9wICsgXCJweFwiO1xuICAgICAgbm9kZS5zdHlsZS5sZWZ0ID0gbm9kZS5zdHlsZS5yaWdodCA9IFwiXCI7XG4gICAgICBpZiAoaG9yaXogPT0gXCJyaWdodFwiKSB7XG4gICAgICAgIGxlZnQgPSBkaXNwbGF5LnNpemVyLmNsaWVudFdpZHRoIC0gbm9kZS5vZmZzZXRXaWR0aDtcbiAgICAgICAgbm9kZS5zdHlsZS5yaWdodCA9IFwiMHB4XCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaG9yaXogPT0gXCJsZWZ0XCIpIGxlZnQgPSAwO1xuICAgICAgICBlbHNlIGlmIChob3JpeiA9PSBcIm1pZGRsZVwiKSBsZWZ0ID0gKGRpc3BsYXkuc2l6ZXIuY2xpZW50V2lkdGggLSBub2RlLm9mZnNldFdpZHRoKSAvIDI7XG4gICAgICAgIG5vZGUuc3R5bGUubGVmdCA9IGxlZnQgKyBcInB4XCI7XG4gICAgICB9XG4gICAgICBpZiAoc2Nyb2xsKVxuICAgICAgICBzY3JvbGxJbnRvVmlldyh0aGlzLCBsZWZ0LCB0b3AsIGxlZnQgKyBub2RlLm9mZnNldFdpZHRoLCB0b3AgKyBub2RlLm9mZnNldEhlaWdodCk7XG4gICAgfSxcblxuICAgIHRyaWdnZXJPbktleURvd246IG1ldGhvZE9wKG9uS2V5RG93biksXG4gICAgdHJpZ2dlck9uS2V5UHJlc3M6IG1ldGhvZE9wKG9uS2V5UHJlc3MpLFxuICAgIHRyaWdnZXJPbktleVVwOiBtZXRob2RPcChvbktleVVwKSxcblxuICAgIGV4ZWNDb21tYW5kOiBmdW5jdGlvbihjbWQpIHtcbiAgICAgIGlmIChjb21tYW5kcy5oYXNPd25Qcm9wZXJ0eShjbWQpKVxuICAgICAgICByZXR1cm4gY29tbWFuZHNbY21kXSh0aGlzKTtcbiAgICB9LFxuXG4gICAgZmluZFBvc0g6IGZ1bmN0aW9uKGZyb20sIGFtb3VudCwgdW5pdCwgdmlzdWFsbHkpIHtcbiAgICAgIHZhciBkaXIgPSAxO1xuICAgICAgaWYgKGFtb3VudCA8IDApIHsgZGlyID0gLTE7IGFtb3VudCA9IC1hbW91bnQ7IH1cbiAgICAgIGZvciAodmFyIGkgPSAwLCBjdXIgPSBjbGlwUG9zKHRoaXMuZG9jLCBmcm9tKTsgaSA8IGFtb3VudDsgKytpKSB7XG4gICAgICAgIGN1ciA9IGZpbmRQb3NIKHRoaXMuZG9jLCBjdXIsIGRpciwgdW5pdCwgdmlzdWFsbHkpO1xuICAgICAgICBpZiAoY3VyLmhpdFNpZGUpIGJyZWFrO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGN1cjtcbiAgICB9LFxuXG4gICAgbW92ZUg6IG1ldGhvZE9wKGZ1bmN0aW9uKGRpciwgdW5pdCkge1xuICAgICAgdmFyIGNtID0gdGhpcztcbiAgICAgIGNtLmV4dGVuZFNlbGVjdGlvbnNCeShmdW5jdGlvbihyYW5nZSkge1xuICAgICAgICBpZiAoY20uZGlzcGxheS5zaGlmdCB8fCBjbS5kb2MuZXh0ZW5kIHx8IHJhbmdlLmVtcHR5KCkpXG4gICAgICAgICAgcmV0dXJuIGZpbmRQb3NIKGNtLmRvYywgcmFuZ2UuaGVhZCwgZGlyLCB1bml0LCBjbS5vcHRpb25zLnJ0bE1vdmVWaXN1YWxseSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gZGlyIDwgMCA/IHJhbmdlLmZyb20oKSA6IHJhbmdlLnRvKCk7XG4gICAgICB9LCBzZWxfbW92ZSk7XG4gICAgfSksXG5cbiAgICBkZWxldGVIOiBtZXRob2RPcChmdW5jdGlvbihkaXIsIHVuaXQpIHtcbiAgICAgIHZhciBzZWwgPSB0aGlzLmRvYy5zZWwsIGRvYyA9IHRoaXMuZG9jO1xuICAgICAgaWYgKHNlbC5zb21ldGhpbmdTZWxlY3RlZCgpKVxuICAgICAgICBkb2MucmVwbGFjZVNlbGVjdGlvbihcIlwiLCBudWxsLCBcIitkZWxldGVcIik7XG4gICAgICBlbHNlXG4gICAgICAgIGRlbGV0ZU5lYXJTZWxlY3Rpb24odGhpcywgZnVuY3Rpb24ocmFuZ2UpIHtcbiAgICAgICAgICB2YXIgb3RoZXIgPSBmaW5kUG9zSChkb2MsIHJhbmdlLmhlYWQsIGRpciwgdW5pdCwgZmFsc2UpO1xuICAgICAgICAgIHJldHVybiBkaXIgPCAwID8ge2Zyb206IG90aGVyLCB0bzogcmFuZ2UuaGVhZH0gOiB7ZnJvbTogcmFuZ2UuaGVhZCwgdG86IG90aGVyfTtcbiAgICAgICAgfSk7XG4gICAgfSksXG5cbiAgICBmaW5kUG9zVjogZnVuY3Rpb24oZnJvbSwgYW1vdW50LCB1bml0LCBnb2FsQ29sdW1uKSB7XG4gICAgICB2YXIgZGlyID0gMSwgeCA9IGdvYWxDb2x1bW47XG4gICAgICBpZiAoYW1vdW50IDwgMCkgeyBkaXIgPSAtMTsgYW1vdW50ID0gLWFtb3VudDsgfVxuICAgICAgZm9yICh2YXIgaSA9IDAsIGN1ciA9IGNsaXBQb3ModGhpcy5kb2MsIGZyb20pOyBpIDwgYW1vdW50OyArK2kpIHtcbiAgICAgICAgdmFyIGNvb3JkcyA9IGN1cnNvckNvb3Jkcyh0aGlzLCBjdXIsIFwiZGl2XCIpO1xuICAgICAgICBpZiAoeCA9PSBudWxsKSB4ID0gY29vcmRzLmxlZnQ7XG4gICAgICAgIGVsc2UgY29vcmRzLmxlZnQgPSB4O1xuICAgICAgICBjdXIgPSBmaW5kUG9zVih0aGlzLCBjb29yZHMsIGRpciwgdW5pdCk7XG4gICAgICAgIGlmIChjdXIuaGl0U2lkZSkgYnJlYWs7XG4gICAgICB9XG4gICAgICByZXR1cm4gY3VyO1xuICAgIH0sXG5cbiAgICBtb3ZlVjogbWV0aG9kT3AoZnVuY3Rpb24oZGlyLCB1bml0KSB7XG4gICAgICB2YXIgY20gPSB0aGlzLCBkb2MgPSB0aGlzLmRvYywgZ29hbHMgPSBbXTtcbiAgICAgIHZhciBjb2xsYXBzZSA9ICFjbS5kaXNwbGF5LnNoaWZ0ICYmICFkb2MuZXh0ZW5kICYmIGRvYy5zZWwuc29tZXRoaW5nU2VsZWN0ZWQoKTtcbiAgICAgIGRvYy5leHRlbmRTZWxlY3Rpb25zQnkoZnVuY3Rpb24ocmFuZ2UpIHtcbiAgICAgICAgaWYgKGNvbGxhcHNlKVxuICAgICAgICAgIHJldHVybiBkaXIgPCAwID8gcmFuZ2UuZnJvbSgpIDogcmFuZ2UudG8oKTtcbiAgICAgICAgdmFyIGhlYWRQb3MgPSBjdXJzb3JDb29yZHMoY20sIHJhbmdlLmhlYWQsIFwiZGl2XCIpO1xuICAgICAgICBpZiAocmFuZ2UuZ29hbENvbHVtbiAhPSBudWxsKSBoZWFkUG9zLmxlZnQgPSByYW5nZS5nb2FsQ29sdW1uO1xuICAgICAgICBnb2Fscy5wdXNoKGhlYWRQb3MubGVmdCk7XG4gICAgICAgIHZhciBwb3MgPSBmaW5kUG9zVihjbSwgaGVhZFBvcywgZGlyLCB1bml0KTtcbiAgICAgICAgaWYgKHVuaXQgPT0gXCJwYWdlXCIgJiYgcmFuZ2UgPT0gZG9jLnNlbC5wcmltYXJ5KCkpXG4gICAgICAgICAgYWRkVG9TY3JvbGxQb3MoY20sIG51bGwsIGNoYXJDb29yZHMoY20sIHBvcywgXCJkaXZcIikudG9wIC0gaGVhZFBvcy50b3ApO1xuICAgICAgICByZXR1cm4gcG9zO1xuICAgICAgfSwgc2VsX21vdmUpO1xuICAgICAgaWYgKGdvYWxzLmxlbmd0aCkgZm9yICh2YXIgaSA9IDA7IGkgPCBkb2Muc2VsLnJhbmdlcy5sZW5ndGg7IGkrKylcbiAgICAgICAgZG9jLnNlbC5yYW5nZXNbaV0uZ29hbENvbHVtbiA9IGdvYWxzW2ldO1xuICAgIH0pLFxuXG4gICAgdG9nZ2xlT3ZlcndyaXRlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKHZhbHVlICE9IG51bGwgJiYgdmFsdWUgPT0gdGhpcy5zdGF0ZS5vdmVyd3JpdGUpIHJldHVybjtcbiAgICAgIGlmICh0aGlzLnN0YXRlLm92ZXJ3cml0ZSA9ICF0aGlzLnN0YXRlLm92ZXJ3cml0ZSlcbiAgICAgICAgYWRkQ2xhc3ModGhpcy5kaXNwbGF5LmN1cnNvckRpdiwgXCJDb2RlTWlycm9yLW92ZXJ3cml0ZVwiKTtcbiAgICAgIGVsc2VcbiAgICAgICAgcm1DbGFzcyh0aGlzLmRpc3BsYXkuY3Vyc29yRGl2LCBcIkNvZGVNaXJyb3Itb3ZlcndyaXRlXCIpO1xuXG4gICAgICBzaWduYWwodGhpcywgXCJvdmVyd3JpdGVUb2dnbGVcIiwgdGhpcywgdGhpcy5zdGF0ZS5vdmVyd3JpdGUpO1xuICAgIH0sXG4gICAgaGFzRm9jdXM6IGZ1bmN0aW9uKCkgeyByZXR1cm4gYWN0aXZlRWx0KCkgPT0gdGhpcy5kaXNwbGF5LmlucHV0OyB9LFxuXG4gICAgc2Nyb2xsVG86IG1ldGhvZE9wKGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIGlmICh4ICE9IG51bGwgfHwgeSAhPSBudWxsKSByZXNvbHZlU2Nyb2xsVG9Qb3ModGhpcyk7XG4gICAgICBpZiAoeCAhPSBudWxsKSB0aGlzLmN1ck9wLnNjcm9sbExlZnQgPSB4O1xuICAgICAgaWYgKHkgIT0gbnVsbCkgdGhpcy5jdXJPcC5zY3JvbGxUb3AgPSB5O1xuICAgIH0pLFxuICAgIGdldFNjcm9sbEluZm86IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNjcm9sbGVyID0gdGhpcy5kaXNwbGF5LnNjcm9sbGVyLCBjbyA9IHNjcm9sbGVyQ3V0T2ZmO1xuICAgICAgcmV0dXJuIHtsZWZ0OiBzY3JvbGxlci5zY3JvbGxMZWZ0LCB0b3A6IHNjcm9sbGVyLnNjcm9sbFRvcCxcbiAgICAgICAgICAgICAgaGVpZ2h0OiBzY3JvbGxlci5zY3JvbGxIZWlnaHQgLSBjbywgd2lkdGg6IHNjcm9sbGVyLnNjcm9sbFdpZHRoIC0gY28sXG4gICAgICAgICAgICAgIGNsaWVudEhlaWdodDogc2Nyb2xsZXIuY2xpZW50SGVpZ2h0IC0gY28sIGNsaWVudFdpZHRoOiBzY3JvbGxlci5jbGllbnRXaWR0aCAtIGNvfTtcbiAgICB9LFxuXG4gICAgc2Nyb2xsSW50b1ZpZXc6IG1ldGhvZE9wKGZ1bmN0aW9uKHJhbmdlLCBtYXJnaW4pIHtcbiAgICAgIGlmIChyYW5nZSA9PSBudWxsKSB7XG4gICAgICAgIHJhbmdlID0ge2Zyb206IHRoaXMuZG9jLnNlbC5wcmltYXJ5KCkuaGVhZCwgdG86IG51bGx9O1xuICAgICAgICBpZiAobWFyZ2luID09IG51bGwpIG1hcmdpbiA9IHRoaXMub3B0aW9ucy5jdXJzb3JTY3JvbGxNYXJnaW47XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiByYW5nZSA9PSBcIm51bWJlclwiKSB7XG4gICAgICAgIHJhbmdlID0ge2Zyb206IFBvcyhyYW5nZSwgMCksIHRvOiBudWxsfTtcbiAgICAgIH0gZWxzZSBpZiAocmFuZ2UuZnJvbSA9PSBudWxsKSB7XG4gICAgICAgIHJhbmdlID0ge2Zyb206IHJhbmdlLCB0bzogbnVsbH07XG4gICAgICB9XG4gICAgICBpZiAoIXJhbmdlLnRvKSByYW5nZS50byA9IHJhbmdlLmZyb207XG4gICAgICByYW5nZS5tYXJnaW4gPSBtYXJnaW4gfHwgMDtcblxuICAgICAgaWYgKHJhbmdlLmZyb20ubGluZSAhPSBudWxsKSB7XG4gICAgICAgIHJlc29sdmVTY3JvbGxUb1Bvcyh0aGlzKTtcbiAgICAgICAgdGhpcy5jdXJPcC5zY3JvbGxUb1BvcyA9IHJhbmdlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHNQb3MgPSBjYWxjdWxhdGVTY3JvbGxQb3ModGhpcywgTWF0aC5taW4ocmFuZ2UuZnJvbS5sZWZ0LCByYW5nZS50by5sZWZ0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5taW4ocmFuZ2UuZnJvbS50b3AsIHJhbmdlLnRvLnRvcCkgLSByYW5nZS5tYXJnaW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGgubWF4KHJhbmdlLmZyb20ucmlnaHQsIHJhbmdlLnRvLnJpZ2h0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5tYXgocmFuZ2UuZnJvbS5ib3R0b20sIHJhbmdlLnRvLmJvdHRvbSkgKyByYW5nZS5tYXJnaW4pO1xuICAgICAgICB0aGlzLnNjcm9sbFRvKHNQb3Muc2Nyb2xsTGVmdCwgc1Bvcy5zY3JvbGxUb3ApO1xuICAgICAgfVxuICAgIH0pLFxuXG4gICAgc2V0U2l6ZTogbWV0aG9kT3AoZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuICAgICAgZnVuY3Rpb24gaW50ZXJwcmV0KHZhbCkge1xuICAgICAgICByZXR1cm4gdHlwZW9mIHZhbCA9PSBcIm51bWJlclwiIHx8IC9eXFxkKyQvLnRlc3QoU3RyaW5nKHZhbCkpID8gdmFsICsgXCJweFwiIDogdmFsO1xuICAgICAgfVxuICAgICAgaWYgKHdpZHRoICE9IG51bGwpIHRoaXMuZGlzcGxheS53cmFwcGVyLnN0eWxlLndpZHRoID0gaW50ZXJwcmV0KHdpZHRoKTtcbiAgICAgIGlmIChoZWlnaHQgIT0gbnVsbCkgdGhpcy5kaXNwbGF5LndyYXBwZXIuc3R5bGUuaGVpZ2h0ID0gaW50ZXJwcmV0KGhlaWdodCk7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmxpbmVXcmFwcGluZykgY2xlYXJMaW5lTWVhc3VyZW1lbnRDYWNoZSh0aGlzKTtcbiAgICAgIHRoaXMuY3VyT3AuZm9yY2VVcGRhdGUgPSB0cnVlO1xuICAgICAgc2lnbmFsKHRoaXMsIFwicmVmcmVzaFwiLCB0aGlzKTtcbiAgICB9KSxcblxuICAgIG9wZXJhdGlvbjogZnVuY3Rpb24oZil7cmV0dXJuIHJ1bkluT3AodGhpcywgZik7fSxcblxuICAgIHJlZnJlc2g6IG1ldGhvZE9wKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG9sZEhlaWdodCA9IHRoaXMuZGlzcGxheS5jYWNoZWRUZXh0SGVpZ2h0O1xuICAgICAgcmVnQ2hhbmdlKHRoaXMpO1xuICAgICAgdGhpcy5jdXJPcC5mb3JjZVVwZGF0ZSA9IHRydWU7XG4gICAgICBjbGVhckNhY2hlcyh0aGlzKTtcbiAgICAgIHRoaXMuc2Nyb2xsVG8odGhpcy5kb2Muc2Nyb2xsTGVmdCwgdGhpcy5kb2Muc2Nyb2xsVG9wKTtcbiAgICAgIHVwZGF0ZUd1dHRlclNwYWNlKHRoaXMpO1xuICAgICAgaWYgKG9sZEhlaWdodCA9PSBudWxsIHx8IE1hdGguYWJzKG9sZEhlaWdodCAtIHRleHRIZWlnaHQodGhpcy5kaXNwbGF5KSkgPiAuNSlcbiAgICAgICAgZXN0aW1hdGVMaW5lSGVpZ2h0cyh0aGlzKTtcbiAgICAgIHNpZ25hbCh0aGlzLCBcInJlZnJlc2hcIiwgdGhpcyk7XG4gICAgfSksXG5cbiAgICBzd2FwRG9jOiBtZXRob2RPcChmdW5jdGlvbihkb2MpIHtcbiAgICAgIHZhciBvbGQgPSB0aGlzLmRvYztcbiAgICAgIG9sZC5jbSA9IG51bGw7XG4gICAgICBhdHRhY2hEb2ModGhpcywgZG9jKTtcbiAgICAgIGNsZWFyQ2FjaGVzKHRoaXMpO1xuICAgICAgcmVzZXRJbnB1dCh0aGlzKTtcbiAgICAgIHRoaXMuc2Nyb2xsVG8oZG9jLnNjcm9sbExlZnQsIGRvYy5zY3JvbGxUb3ApO1xuICAgICAgc2lnbmFsTGF0ZXIodGhpcywgXCJzd2FwRG9jXCIsIHRoaXMsIG9sZCk7XG4gICAgICByZXR1cm4gb2xkO1xuICAgIH0pLFxuXG4gICAgZ2V0SW5wdXRGaWVsZDogZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5kaXNwbGF5LmlucHV0O30sXG4gICAgZ2V0V3JhcHBlckVsZW1lbnQ6IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZGlzcGxheS53cmFwcGVyO30sXG4gICAgZ2V0U2Nyb2xsZXJFbGVtZW50OiBmdW5jdGlvbigpe3JldHVybiB0aGlzLmRpc3BsYXkuc2Nyb2xsZXI7fSxcbiAgICBnZXRHdXR0ZXJFbGVtZW50OiBmdW5jdGlvbigpe3JldHVybiB0aGlzLmRpc3BsYXkuZ3V0dGVyczt9XG4gIH07XG4gIGV2ZW50TWl4aW4oQ29kZU1pcnJvcik7XG5cbiAgLy8gT1BUSU9OIERFRkFVTFRTXG5cbiAgLy8gVGhlIGRlZmF1bHQgY29uZmlndXJhdGlvbiBvcHRpb25zLlxuICB2YXIgZGVmYXVsdHMgPSBDb2RlTWlycm9yLmRlZmF1bHRzID0ge307XG4gIC8vIEZ1bmN0aW9ucyB0byBydW4gd2hlbiBvcHRpb25zIGFyZSBjaGFuZ2VkLlxuICB2YXIgb3B0aW9uSGFuZGxlcnMgPSBDb2RlTWlycm9yLm9wdGlvbkhhbmRsZXJzID0ge307XG5cbiAgZnVuY3Rpb24gb3B0aW9uKG5hbWUsIGRlZmx0LCBoYW5kbGUsIG5vdE9uSW5pdCkge1xuICAgIENvZGVNaXJyb3IuZGVmYXVsdHNbbmFtZV0gPSBkZWZsdDtcbiAgICBpZiAoaGFuZGxlKSBvcHRpb25IYW5kbGVyc1tuYW1lXSA9XG4gICAgICBub3RPbkluaXQgPyBmdW5jdGlvbihjbSwgdmFsLCBvbGQpIHtpZiAob2xkICE9IEluaXQpIGhhbmRsZShjbSwgdmFsLCBvbGQpO30gOiBoYW5kbGU7XG4gIH1cblxuICAvLyBQYXNzZWQgdG8gb3B0aW9uIGhhbmRsZXJzIHdoZW4gdGhlcmUgaXMgbm8gb2xkIHZhbHVlLlxuICB2YXIgSW5pdCA9IENvZGVNaXJyb3IuSW5pdCA9IHt0b1N0cmluZzogZnVuY3Rpb24oKXtyZXR1cm4gXCJDb2RlTWlycm9yLkluaXRcIjt9fTtcblxuICAvLyBUaGVzZSB0d28gYXJlLCBvbiBpbml0LCBjYWxsZWQgZnJvbSB0aGUgY29uc3RydWN0b3IgYmVjYXVzZSB0aGV5XG4gIC8vIGhhdmUgdG8gYmUgaW5pdGlhbGl6ZWQgYmVmb3JlIHRoZSBlZGl0b3IgY2FuIHN0YXJ0IGF0IGFsbC5cbiAgb3B0aW9uKFwidmFsdWVcIiwgXCJcIiwgZnVuY3Rpb24oY20sIHZhbCkge1xuICAgIGNtLnNldFZhbHVlKHZhbCk7XG4gIH0sIHRydWUpO1xuICBvcHRpb24oXCJtb2RlXCIsIG51bGwsIGZ1bmN0aW9uKGNtLCB2YWwpIHtcbiAgICBjbS5kb2MubW9kZU9wdGlvbiA9IHZhbDtcbiAgICBsb2FkTW9kZShjbSk7XG4gIH0sIHRydWUpO1xuXG4gIG9wdGlvbihcImluZGVudFVuaXRcIiwgMiwgbG9hZE1vZGUsIHRydWUpO1xuICBvcHRpb24oXCJpbmRlbnRXaXRoVGFic1wiLCBmYWxzZSk7XG4gIG9wdGlvbihcInNtYXJ0SW5kZW50XCIsIHRydWUpO1xuICBvcHRpb24oXCJ0YWJTaXplXCIsIDQsIGZ1bmN0aW9uKGNtKSB7XG4gICAgcmVzZXRNb2RlU3RhdGUoY20pO1xuICAgIGNsZWFyQ2FjaGVzKGNtKTtcbiAgICByZWdDaGFuZ2UoY20pO1xuICB9LCB0cnVlKTtcbiAgb3B0aW9uKFwic3BlY2lhbENoYXJzXCIsIC9bXFx0XFx1MDAwMC1cXHUwMDE5XFx1MDBhZFxcdTIwMGJcXHUyMDI4XFx1MjAyOVxcdWZlZmZdL2csIGZ1bmN0aW9uKGNtLCB2YWwpIHtcbiAgICBjbS5vcHRpb25zLnNwZWNpYWxDaGFycyA9IG5ldyBSZWdFeHAodmFsLnNvdXJjZSArICh2YWwudGVzdChcIlxcdFwiKSA/IFwiXCIgOiBcInxcXHRcIiksIFwiZ1wiKTtcbiAgICBjbS5yZWZyZXNoKCk7XG4gIH0sIHRydWUpO1xuICBvcHRpb24oXCJzcGVjaWFsQ2hhclBsYWNlaG9sZGVyXCIsIGRlZmF1bHRTcGVjaWFsQ2hhclBsYWNlaG9sZGVyLCBmdW5jdGlvbihjbSkge2NtLnJlZnJlc2goKTt9LCB0cnVlKTtcbiAgb3B0aW9uKFwiZWxlY3RyaWNDaGFyc1wiLCB0cnVlKTtcbiAgb3B0aW9uKFwicnRsTW92ZVZpc3VhbGx5XCIsICF3aW5kb3dzKTtcbiAgb3B0aW9uKFwid2hvbGVMaW5lVXBkYXRlQmVmb3JlXCIsIHRydWUpO1xuXG4gIG9wdGlvbihcInRoZW1lXCIsIFwiZGVmYXVsdFwiLCBmdW5jdGlvbihjbSkge1xuICAgIHRoZW1lQ2hhbmdlZChjbSk7XG4gICAgZ3V0dGVyc0NoYW5nZWQoY20pO1xuICB9LCB0cnVlKTtcbiAgb3B0aW9uKFwia2V5TWFwXCIsIFwiZGVmYXVsdFwiLCBrZXlNYXBDaGFuZ2VkKTtcbiAgb3B0aW9uKFwiZXh0cmFLZXlzXCIsIG51bGwpO1xuXG4gIG9wdGlvbihcImxpbmVXcmFwcGluZ1wiLCBmYWxzZSwgd3JhcHBpbmdDaGFuZ2VkLCB0cnVlKTtcbiAgb3B0aW9uKFwiZ3V0dGVyc1wiLCBbXSwgZnVuY3Rpb24oY20pIHtcbiAgICBzZXRHdXR0ZXJzRm9yTGluZU51bWJlcnMoY20ub3B0aW9ucyk7XG4gICAgZ3V0dGVyc0NoYW5nZWQoY20pO1xuICB9LCB0cnVlKTtcbiAgb3B0aW9uKFwiZml4ZWRHdXR0ZXJcIiwgdHJ1ZSwgZnVuY3Rpb24oY20sIHZhbCkge1xuICAgIGNtLmRpc3BsYXkuZ3V0dGVycy5zdHlsZS5sZWZ0ID0gdmFsID8gY29tcGVuc2F0ZUZvckhTY3JvbGwoY20uZGlzcGxheSkgKyBcInB4XCIgOiBcIjBcIjtcbiAgICBjbS5yZWZyZXNoKCk7XG4gIH0sIHRydWUpO1xuICBvcHRpb24oXCJjb3Zlckd1dHRlck5leHRUb1Njcm9sbGJhclwiLCBmYWxzZSwgdXBkYXRlU2Nyb2xsYmFycywgdHJ1ZSk7XG4gIG9wdGlvbihcImxpbmVOdW1iZXJzXCIsIGZhbHNlLCBmdW5jdGlvbihjbSkge1xuICAgIHNldEd1dHRlcnNGb3JMaW5lTnVtYmVycyhjbS5vcHRpb25zKTtcbiAgICBndXR0ZXJzQ2hhbmdlZChjbSk7XG4gIH0sIHRydWUpO1xuICBvcHRpb24oXCJmaXJzdExpbmVOdW1iZXJcIiwgMSwgZ3V0dGVyc0NoYW5nZWQsIHRydWUpO1xuICBvcHRpb24oXCJsaW5lTnVtYmVyRm9ybWF0dGVyXCIsIGZ1bmN0aW9uKGludGVnZXIpIHtyZXR1cm4gaW50ZWdlcjt9LCBndXR0ZXJzQ2hhbmdlZCwgdHJ1ZSk7XG4gIG9wdGlvbihcInNob3dDdXJzb3JXaGVuU2VsZWN0aW5nXCIsIGZhbHNlLCB1cGRhdGVTZWxlY3Rpb24sIHRydWUpO1xuXG4gIG9wdGlvbihcInJlc2V0U2VsZWN0aW9uT25Db250ZXh0TWVudVwiLCB0cnVlKTtcblxuICBvcHRpb24oXCJyZWFkT25seVwiLCBmYWxzZSwgZnVuY3Rpb24oY20sIHZhbCkge1xuICAgIGlmICh2YWwgPT0gXCJub2N1cnNvclwiKSB7XG4gICAgICBvbkJsdXIoY20pO1xuICAgICAgY20uZGlzcGxheS5pbnB1dC5ibHVyKCk7XG4gICAgICBjbS5kaXNwbGF5LmRpc2FibGVkID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY20uZGlzcGxheS5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgaWYgKCF2YWwpIHJlc2V0SW5wdXQoY20pO1xuICAgIH1cbiAgfSk7XG4gIG9wdGlvbihcImRpc2FibGVJbnB1dFwiLCBmYWxzZSwgZnVuY3Rpb24oY20sIHZhbCkge2lmICghdmFsKSByZXNldElucHV0KGNtKTt9LCB0cnVlKTtcbiAgb3B0aW9uKFwiZHJhZ0Ryb3BcIiwgdHJ1ZSk7XG5cbiAgb3B0aW9uKFwiY3Vyc29yQmxpbmtSYXRlXCIsIDUzMCk7XG4gIG9wdGlvbihcImN1cnNvclNjcm9sbE1hcmdpblwiLCAwKTtcbiAgb3B0aW9uKFwiY3Vyc29ySGVpZ2h0XCIsIDEpO1xuICBvcHRpb24oXCJ3b3JrVGltZVwiLCAxMDApO1xuICBvcHRpb24oXCJ3b3JrRGVsYXlcIiwgMTAwKTtcbiAgb3B0aW9uKFwiZmxhdHRlblNwYW5zXCIsIHRydWUsIHJlc2V0TW9kZVN0YXRlLCB0cnVlKTtcbiAgb3B0aW9uKFwiYWRkTW9kZUNsYXNzXCIsIGZhbHNlLCByZXNldE1vZGVTdGF0ZSwgdHJ1ZSk7XG4gIG9wdGlvbihcInBvbGxJbnRlcnZhbFwiLCAxMDApO1xuICBvcHRpb24oXCJ1bmRvRGVwdGhcIiwgMjAwLCBmdW5jdGlvbihjbSwgdmFsKXtjbS5kb2MuaGlzdG9yeS51bmRvRGVwdGggPSB2YWw7fSk7XG4gIG9wdGlvbihcImhpc3RvcnlFdmVudERlbGF5XCIsIDEyNTApO1xuICBvcHRpb24oXCJ2aWV3cG9ydE1hcmdpblwiLCAxMCwgZnVuY3Rpb24oY20pe2NtLnJlZnJlc2goKTt9LCB0cnVlKTtcbiAgb3B0aW9uKFwibWF4SGlnaGxpZ2h0TGVuZ3RoXCIsIDEwMDAwLCByZXNldE1vZGVTdGF0ZSwgdHJ1ZSk7XG4gIG9wdGlvbihcIm1vdmVJbnB1dFdpdGhDdXJzb3JcIiwgdHJ1ZSwgZnVuY3Rpb24oY20sIHZhbCkge1xuICAgIGlmICghdmFsKSBjbS5kaXNwbGF5LmlucHV0RGl2LnN0eWxlLnRvcCA9IGNtLmRpc3BsYXkuaW5wdXREaXYuc3R5bGUubGVmdCA9IDA7XG4gIH0pO1xuXG4gIG9wdGlvbihcInRhYmluZGV4XCIsIG51bGwsIGZ1bmN0aW9uKGNtLCB2YWwpIHtcbiAgICBjbS5kaXNwbGF5LmlucHV0LnRhYkluZGV4ID0gdmFsIHx8IFwiXCI7XG4gIH0pO1xuICBvcHRpb24oXCJhdXRvZm9jdXNcIiwgbnVsbCk7XG5cbiAgLy8gTU9ERSBERUZJTklUSU9OIEFORCBRVUVSWUlOR1xuXG4gIC8vIEtub3duIG1vZGVzLCBieSBuYW1lIGFuZCBieSBNSU1FXG4gIHZhciBtb2RlcyA9IENvZGVNaXJyb3IubW9kZXMgPSB7fSwgbWltZU1vZGVzID0gQ29kZU1pcnJvci5taW1lTW9kZXMgPSB7fTtcblxuICAvLyBFeHRyYSBhcmd1bWVudHMgYXJlIHN0b3JlZCBhcyB0aGUgbW9kZSdzIGRlcGVuZGVuY2llcywgd2hpY2ggaXNcbiAgLy8gdXNlZCBieSAobGVnYWN5KSBtZWNoYW5pc21zIGxpa2UgbG9hZG1vZGUuanMgdG8gYXV0b21hdGljYWxseVxuICAvLyBsb2FkIGEgbW9kZS4gKFByZWZlcnJlZCBtZWNoYW5pc20gaXMgdGhlIHJlcXVpcmUvZGVmaW5lIGNhbGxzLilcbiAgQ29kZU1pcnJvci5kZWZpbmVNb2RlID0gZnVuY3Rpb24obmFtZSwgbW9kZSkge1xuICAgIGlmICghQ29kZU1pcnJvci5kZWZhdWx0cy5tb2RlICYmIG5hbWUgIT0gXCJudWxsXCIpIENvZGVNaXJyb3IuZGVmYXVsdHMubW9kZSA9IG5hbWU7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAyKSB7XG4gICAgICBtb2RlLmRlcGVuZGVuY2llcyA9IFtdO1xuICAgICAgZm9yICh2YXIgaSA9IDI7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyArK2kpIG1vZGUuZGVwZW5kZW5jaWVzLnB1c2goYXJndW1lbnRzW2ldKTtcbiAgICB9XG4gICAgbW9kZXNbbmFtZV0gPSBtb2RlO1xuICB9O1xuXG4gIENvZGVNaXJyb3IuZGVmaW5lTUlNRSA9IGZ1bmN0aW9uKG1pbWUsIHNwZWMpIHtcbiAgICBtaW1lTW9kZXNbbWltZV0gPSBzcGVjO1xuICB9O1xuXG4gIC8vIEdpdmVuIGEgTUlNRSB0eXBlLCBhIHtuYW1lLCAuLi5vcHRpb25zfSBjb25maWcgb2JqZWN0LCBvciBhIG5hbWVcbiAgLy8gc3RyaW5nLCByZXR1cm4gYSBtb2RlIGNvbmZpZyBvYmplY3QuXG4gIENvZGVNaXJyb3IucmVzb2x2ZU1vZGUgPSBmdW5jdGlvbihzcGVjKSB7XG4gICAgaWYgKHR5cGVvZiBzcGVjID09IFwic3RyaW5nXCIgJiYgbWltZU1vZGVzLmhhc093blByb3BlcnR5KHNwZWMpKSB7XG4gICAgICBzcGVjID0gbWltZU1vZGVzW3NwZWNdO1xuICAgIH0gZWxzZSBpZiAoc3BlYyAmJiB0eXBlb2Ygc3BlYy5uYW1lID09IFwic3RyaW5nXCIgJiYgbWltZU1vZGVzLmhhc093blByb3BlcnR5KHNwZWMubmFtZSkpIHtcbiAgICAgIHZhciBmb3VuZCA9IG1pbWVNb2Rlc1tzcGVjLm5hbWVdO1xuICAgICAgaWYgKHR5cGVvZiBmb3VuZCA9PSBcInN0cmluZ1wiKSBmb3VuZCA9IHtuYW1lOiBmb3VuZH07XG4gICAgICBzcGVjID0gY3JlYXRlT2JqKGZvdW5kLCBzcGVjKTtcbiAgICAgIHNwZWMubmFtZSA9IGZvdW5kLm5hbWU7XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc3BlYyA9PSBcInN0cmluZ1wiICYmIC9eW1xcd1xcLV0rXFwvW1xcd1xcLV0rXFwreG1sJC8udGVzdChzcGVjKSkge1xuICAgICAgcmV0dXJuIENvZGVNaXJyb3IucmVzb2x2ZU1vZGUoXCJhcHBsaWNhdGlvbi94bWxcIik7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygc3BlYyA9PSBcInN0cmluZ1wiKSByZXR1cm4ge25hbWU6IHNwZWN9O1xuICAgIGVsc2UgcmV0dXJuIHNwZWMgfHwge25hbWU6IFwibnVsbFwifTtcbiAgfTtcblxuICAvLyBHaXZlbiBhIG1vZGUgc3BlYyAoYW55dGhpbmcgdGhhdCByZXNvbHZlTW9kZSBhY2NlcHRzKSwgZmluZCBhbmRcbiAgLy8gaW5pdGlhbGl6ZSBhbiBhY3R1YWwgbW9kZSBvYmplY3QuXG4gIENvZGVNaXJyb3IuZ2V0TW9kZSA9IGZ1bmN0aW9uKG9wdGlvbnMsIHNwZWMpIHtcbiAgICB2YXIgc3BlYyA9IENvZGVNaXJyb3IucmVzb2x2ZU1vZGUoc3BlYyk7XG4gICAgdmFyIG1mYWN0b3J5ID0gbW9kZXNbc3BlYy5uYW1lXTtcbiAgICBpZiAoIW1mYWN0b3J5KSByZXR1cm4gQ29kZU1pcnJvci5nZXRNb2RlKG9wdGlvbnMsIFwidGV4dC9wbGFpblwiKTtcbiAgICB2YXIgbW9kZU9iaiA9IG1mYWN0b3J5KG9wdGlvbnMsIHNwZWMpO1xuICAgIGlmIChtb2RlRXh0ZW5zaW9ucy5oYXNPd25Qcm9wZXJ0eShzcGVjLm5hbWUpKSB7XG4gICAgICB2YXIgZXh0cyA9IG1vZGVFeHRlbnNpb25zW3NwZWMubmFtZV07XG4gICAgICBmb3IgKHZhciBwcm9wIGluIGV4dHMpIHtcbiAgICAgICAgaWYgKCFleHRzLmhhc093blByb3BlcnR5KHByb3ApKSBjb250aW51ZTtcbiAgICAgICAgaWYgKG1vZGVPYmouaGFzT3duUHJvcGVydHkocHJvcCkpIG1vZGVPYmpbXCJfXCIgKyBwcm9wXSA9IG1vZGVPYmpbcHJvcF07XG4gICAgICAgIG1vZGVPYmpbcHJvcF0gPSBleHRzW3Byb3BdO1xuICAgICAgfVxuICAgIH1cbiAgICBtb2RlT2JqLm5hbWUgPSBzcGVjLm5hbWU7XG4gICAgaWYgKHNwZWMuaGVscGVyVHlwZSkgbW9kZU9iai5oZWxwZXJUeXBlID0gc3BlYy5oZWxwZXJUeXBlO1xuICAgIGlmIChzcGVjLm1vZGVQcm9wcykgZm9yICh2YXIgcHJvcCBpbiBzcGVjLm1vZGVQcm9wcylcbiAgICAgIG1vZGVPYmpbcHJvcF0gPSBzcGVjLm1vZGVQcm9wc1twcm9wXTtcblxuICAgIHJldHVybiBtb2RlT2JqO1xuICB9O1xuXG4gIC8vIE1pbmltYWwgZGVmYXVsdCBtb2RlLlxuICBDb2RlTWlycm9yLmRlZmluZU1vZGUoXCJudWxsXCIsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7dG9rZW46IGZ1bmN0aW9uKHN0cmVhbSkge3N0cmVhbS5za2lwVG9FbmQoKTt9fTtcbiAgfSk7XG4gIENvZGVNaXJyb3IuZGVmaW5lTUlNRShcInRleHQvcGxhaW5cIiwgXCJudWxsXCIpO1xuXG4gIC8vIFRoaXMgY2FuIGJlIHVzZWQgdG8gYXR0YWNoIHByb3BlcnRpZXMgdG8gbW9kZSBvYmplY3RzIGZyb21cbiAgLy8gb3V0c2lkZSB0aGUgYWN0dWFsIG1vZGUgZGVmaW5pdGlvbi5cbiAgdmFyIG1vZGVFeHRlbnNpb25zID0gQ29kZU1pcnJvci5tb2RlRXh0ZW5zaW9ucyA9IHt9O1xuICBDb2RlTWlycm9yLmV4dGVuZE1vZGUgPSBmdW5jdGlvbihtb2RlLCBwcm9wZXJ0aWVzKSB7XG4gICAgdmFyIGV4dHMgPSBtb2RlRXh0ZW5zaW9ucy5oYXNPd25Qcm9wZXJ0eShtb2RlKSA/IG1vZGVFeHRlbnNpb25zW21vZGVdIDogKG1vZGVFeHRlbnNpb25zW21vZGVdID0ge30pO1xuICAgIGNvcHlPYmoocHJvcGVydGllcywgZXh0cyk7XG4gIH07XG5cbiAgLy8gRVhURU5TSU9OU1xuXG4gIENvZGVNaXJyb3IuZGVmaW5lRXh0ZW5zaW9uID0gZnVuY3Rpb24obmFtZSwgZnVuYykge1xuICAgIENvZGVNaXJyb3IucHJvdG90eXBlW25hbWVdID0gZnVuYztcbiAgfTtcbiAgQ29kZU1pcnJvci5kZWZpbmVEb2NFeHRlbnNpb24gPSBmdW5jdGlvbihuYW1lLCBmdW5jKSB7XG4gICAgRG9jLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmM7XG4gIH07XG4gIENvZGVNaXJyb3IuZGVmaW5lT3B0aW9uID0gb3B0aW9uO1xuXG4gIHZhciBpbml0SG9va3MgPSBbXTtcbiAgQ29kZU1pcnJvci5kZWZpbmVJbml0SG9vayA9IGZ1bmN0aW9uKGYpIHtpbml0SG9va3MucHVzaChmKTt9O1xuXG4gIHZhciBoZWxwZXJzID0gQ29kZU1pcnJvci5oZWxwZXJzID0ge307XG4gIENvZGVNaXJyb3IucmVnaXN0ZXJIZWxwZXIgPSBmdW5jdGlvbih0eXBlLCBuYW1lLCB2YWx1ZSkge1xuICAgIGlmICghaGVscGVycy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkgaGVscGVyc1t0eXBlXSA9IENvZGVNaXJyb3JbdHlwZV0gPSB7X2dsb2JhbDogW119O1xuICAgIGhlbHBlcnNbdHlwZV1bbmFtZV0gPSB2YWx1ZTtcbiAgfTtcbiAgQ29kZU1pcnJvci5yZWdpc3Rlckdsb2JhbEhlbHBlciA9IGZ1bmN0aW9uKHR5cGUsIG5hbWUsIHByZWRpY2F0ZSwgdmFsdWUpIHtcbiAgICBDb2RlTWlycm9yLnJlZ2lzdGVySGVscGVyKHR5cGUsIG5hbWUsIHZhbHVlKTtcbiAgICBoZWxwZXJzW3R5cGVdLl9nbG9iYWwucHVzaCh7cHJlZDogcHJlZGljYXRlLCB2YWw6IHZhbHVlfSk7XG4gIH07XG5cbiAgLy8gTU9ERSBTVEFURSBIQU5ETElOR1xuXG4gIC8vIFV0aWxpdHkgZnVuY3Rpb25zIGZvciB3b3JraW5nIHdpdGggc3RhdGUuIEV4cG9ydGVkIGJlY2F1c2UgbmVzdGVkXG4gIC8vIG1vZGVzIG5lZWQgdG8gZG8gdGhpcyBmb3IgdGhlaXIgaW5uZXIgbW9kZXMuXG5cbiAgdmFyIGNvcHlTdGF0ZSA9IENvZGVNaXJyb3IuY29weVN0YXRlID0gZnVuY3Rpb24obW9kZSwgc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUgPT09IHRydWUpIHJldHVybiBzdGF0ZTtcbiAgICBpZiAobW9kZS5jb3B5U3RhdGUpIHJldHVybiBtb2RlLmNvcHlTdGF0ZShzdGF0ZSk7XG4gICAgdmFyIG5zdGF0ZSA9IHt9O1xuICAgIGZvciAodmFyIG4gaW4gc3RhdGUpIHtcbiAgICAgIHZhciB2YWwgPSBzdGF0ZVtuXTtcbiAgICAgIGlmICh2YWwgaW5zdGFuY2VvZiBBcnJheSkgdmFsID0gdmFsLmNvbmNhdChbXSk7XG4gICAgICBuc3RhdGVbbl0gPSB2YWw7XG4gICAgfVxuICAgIHJldHVybiBuc3RhdGU7XG4gIH07XG5cbiAgdmFyIHN0YXJ0U3RhdGUgPSBDb2RlTWlycm9yLnN0YXJ0U3RhdGUgPSBmdW5jdGlvbihtb2RlLCBhMSwgYTIpIHtcbiAgICByZXR1cm4gbW9kZS5zdGFydFN0YXRlID8gbW9kZS5zdGFydFN0YXRlKGExLCBhMikgOiB0cnVlO1xuICB9O1xuXG4gIC8vIEdpdmVuIGEgbW9kZSBhbmQgYSBzdGF0ZSAoZm9yIHRoYXQgbW9kZSksIGZpbmQgdGhlIGlubmVyIG1vZGUgYW5kXG4gIC8vIHN0YXRlIGF0IHRoZSBwb3NpdGlvbiB0aGF0IHRoZSBzdGF0ZSByZWZlcnMgdG8uXG4gIENvZGVNaXJyb3IuaW5uZXJNb2RlID0gZnVuY3Rpb24obW9kZSwgc3RhdGUpIHtcbiAgICB3aGlsZSAobW9kZS5pbm5lck1vZGUpIHtcbiAgICAgIHZhciBpbmZvID0gbW9kZS5pbm5lck1vZGUoc3RhdGUpO1xuICAgICAgaWYgKCFpbmZvIHx8IGluZm8ubW9kZSA9PSBtb2RlKSBicmVhaztcbiAgICAgIHN0YXRlID0gaW5mby5zdGF0ZTtcbiAgICAgIG1vZGUgPSBpbmZvLm1vZGU7XG4gICAgfVxuICAgIHJldHVybiBpbmZvIHx8IHttb2RlOiBtb2RlLCBzdGF0ZTogc3RhdGV9O1xuICB9O1xuXG4gIC8vIFNUQU5EQVJEIENPTU1BTkRTXG5cbiAgLy8gQ29tbWFuZHMgYXJlIHBhcmFtZXRlci1sZXNzIGFjdGlvbnMgdGhhdCBjYW4gYmUgcGVyZm9ybWVkIG9uIGFuXG4gIC8vIGVkaXRvciwgbW9zdGx5IHVzZWQgZm9yIGtleWJpbmRpbmdzLlxuICB2YXIgY29tbWFuZHMgPSBDb2RlTWlycm9yLmNvbW1hbmRzID0ge1xuICAgIHNlbGVjdEFsbDogZnVuY3Rpb24oY20pIHtjbS5zZXRTZWxlY3Rpb24oUG9zKGNtLmZpcnN0TGluZSgpLCAwKSwgUG9zKGNtLmxhc3RMaW5lKCkpLCBzZWxfZG9udFNjcm9sbCk7fSxcbiAgICBzaW5nbGVTZWxlY3Rpb246IGZ1bmN0aW9uKGNtKSB7XG4gICAgICBjbS5zZXRTZWxlY3Rpb24oY20uZ2V0Q3Vyc29yKFwiYW5jaG9yXCIpLCBjbS5nZXRDdXJzb3IoXCJoZWFkXCIpLCBzZWxfZG9udFNjcm9sbCk7XG4gICAgfSxcbiAgICBraWxsTGluZTogZnVuY3Rpb24oY20pIHtcbiAgICAgIGRlbGV0ZU5lYXJTZWxlY3Rpb24oY20sIGZ1bmN0aW9uKHJhbmdlKSB7XG4gICAgICAgIGlmIChyYW5nZS5lbXB0eSgpKSB7XG4gICAgICAgICAgdmFyIGxlbiA9IGdldExpbmUoY20uZG9jLCByYW5nZS5oZWFkLmxpbmUpLnRleHQubGVuZ3RoO1xuICAgICAgICAgIGlmIChyYW5nZS5oZWFkLmNoID09IGxlbiAmJiByYW5nZS5oZWFkLmxpbmUgPCBjbS5sYXN0TGluZSgpKVxuICAgICAgICAgICAgcmV0dXJuIHtmcm9tOiByYW5nZS5oZWFkLCB0bzogUG9zKHJhbmdlLmhlYWQubGluZSArIDEsIDApfTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4ge2Zyb206IHJhbmdlLmhlYWQsIHRvOiBQb3MocmFuZ2UuaGVhZC5saW5lLCBsZW4pfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4ge2Zyb206IHJhbmdlLmZyb20oKSwgdG86IHJhbmdlLnRvKCl9O1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGRlbGV0ZUxpbmU6IGZ1bmN0aW9uKGNtKSB7XG4gICAgICBkZWxldGVOZWFyU2VsZWN0aW9uKGNtLCBmdW5jdGlvbihyYW5nZSkge1xuICAgICAgICByZXR1cm4ge2Zyb206IFBvcyhyYW5nZS5mcm9tKCkubGluZSwgMCksXG4gICAgICAgICAgICAgICAgdG86IGNsaXBQb3MoY20uZG9jLCBQb3MocmFuZ2UudG8oKS5saW5lICsgMSwgMCkpfTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZGVsTGluZUxlZnQ6IGZ1bmN0aW9uKGNtKSB7XG4gICAgICBkZWxldGVOZWFyU2VsZWN0aW9uKGNtLCBmdW5jdGlvbihyYW5nZSkge1xuICAgICAgICByZXR1cm4ge2Zyb206IFBvcyhyYW5nZS5mcm9tKCkubGluZSwgMCksIHRvOiByYW5nZS5mcm9tKCl9O1xuICAgICAgfSk7XG4gICAgfSxcbiAgICB1bmRvOiBmdW5jdGlvbihjbSkge2NtLnVuZG8oKTt9LFxuICAgIHJlZG86IGZ1bmN0aW9uKGNtKSB7Y20ucmVkbygpO30sXG4gICAgdW5kb1NlbGVjdGlvbjogZnVuY3Rpb24oY20pIHtjbS51bmRvU2VsZWN0aW9uKCk7fSxcbiAgICByZWRvU2VsZWN0aW9uOiBmdW5jdGlvbihjbSkge2NtLnJlZG9TZWxlY3Rpb24oKTt9LFxuICAgIGdvRG9jU3RhcnQ6IGZ1bmN0aW9uKGNtKSB7Y20uZXh0ZW5kU2VsZWN0aW9uKFBvcyhjbS5maXJzdExpbmUoKSwgMCkpO30sXG4gICAgZ29Eb2NFbmQ6IGZ1bmN0aW9uKGNtKSB7Y20uZXh0ZW5kU2VsZWN0aW9uKFBvcyhjbS5sYXN0TGluZSgpKSk7fSxcbiAgICBnb0xpbmVTdGFydDogZnVuY3Rpb24oY20pIHtcbiAgICAgIGNtLmV4dGVuZFNlbGVjdGlvbnNCeShmdW5jdGlvbihyYW5nZSkgeyByZXR1cm4gbGluZVN0YXJ0KGNtLCByYW5nZS5oZWFkLmxpbmUpOyB9LCBzZWxfbW92ZSk7XG4gICAgfSxcbiAgICBnb0xpbmVTdGFydFNtYXJ0OiBmdW5jdGlvbihjbSkge1xuICAgICAgY20uZXh0ZW5kU2VsZWN0aW9uc0J5KGZ1bmN0aW9uKHJhbmdlKSB7XG4gICAgICAgIHZhciBzdGFydCA9IGxpbmVTdGFydChjbSwgcmFuZ2UuaGVhZC5saW5lKTtcbiAgICAgICAgdmFyIGxpbmUgPSBjbS5nZXRMaW5lSGFuZGxlKHN0YXJ0LmxpbmUpO1xuICAgICAgICB2YXIgb3JkZXIgPSBnZXRPcmRlcihsaW5lKTtcbiAgICAgICAgaWYgKCFvcmRlciB8fCBvcmRlclswXS5sZXZlbCA9PSAwKSB7XG4gICAgICAgICAgdmFyIGZpcnN0Tm9uV1MgPSBNYXRoLm1heCgwLCBsaW5lLnRleHQuc2VhcmNoKC9cXFMvKSk7XG4gICAgICAgICAgdmFyIGluV1MgPSByYW5nZS5oZWFkLmxpbmUgPT0gc3RhcnQubGluZSAmJiByYW5nZS5oZWFkLmNoIDw9IGZpcnN0Tm9uV1MgJiYgcmFuZ2UuaGVhZC5jaDtcbiAgICAgICAgICByZXR1cm4gUG9zKHN0YXJ0LmxpbmUsIGluV1MgPyAwIDogZmlyc3ROb25XUyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0YXJ0O1xuICAgICAgfSwgc2VsX21vdmUpO1xuICAgIH0sXG4gICAgZ29MaW5lRW5kOiBmdW5jdGlvbihjbSkge1xuICAgICAgY20uZXh0ZW5kU2VsZWN0aW9uc0J5KGZ1bmN0aW9uKHJhbmdlKSB7IHJldHVybiBsaW5lRW5kKGNtLCByYW5nZS5oZWFkLmxpbmUpOyB9LCBzZWxfbW92ZSk7XG4gICAgfSxcbiAgICBnb0xpbmVSaWdodDogZnVuY3Rpb24oY20pIHtcbiAgICAgIGNtLmV4dGVuZFNlbGVjdGlvbnNCeShmdW5jdGlvbihyYW5nZSkge1xuICAgICAgICB2YXIgdG9wID0gY20uY2hhckNvb3JkcyhyYW5nZS5oZWFkLCBcImRpdlwiKS50b3AgKyA1O1xuICAgICAgICByZXR1cm4gY20uY29vcmRzQ2hhcih7bGVmdDogY20uZGlzcGxheS5saW5lRGl2Lm9mZnNldFdpZHRoICsgMTAwLCB0b3A6IHRvcH0sIFwiZGl2XCIpO1xuICAgICAgfSwgc2VsX21vdmUpO1xuICAgIH0sXG4gICAgZ29MaW5lTGVmdDogZnVuY3Rpb24oY20pIHtcbiAgICAgIGNtLmV4dGVuZFNlbGVjdGlvbnNCeShmdW5jdGlvbihyYW5nZSkge1xuICAgICAgICB2YXIgdG9wID0gY20uY2hhckNvb3JkcyhyYW5nZS5oZWFkLCBcImRpdlwiKS50b3AgKyA1O1xuICAgICAgICByZXR1cm4gY20uY29vcmRzQ2hhcih7bGVmdDogMCwgdG9wOiB0b3B9LCBcImRpdlwiKTtcbiAgICAgIH0sIHNlbF9tb3ZlKTtcbiAgICB9LFxuICAgIGdvTGluZVVwOiBmdW5jdGlvbihjbSkge2NtLm1vdmVWKC0xLCBcImxpbmVcIik7fSxcbiAgICBnb0xpbmVEb3duOiBmdW5jdGlvbihjbSkge2NtLm1vdmVWKDEsIFwibGluZVwiKTt9LFxuICAgIGdvUGFnZVVwOiBmdW5jdGlvbihjbSkge2NtLm1vdmVWKC0xLCBcInBhZ2VcIik7fSxcbiAgICBnb1BhZ2VEb3duOiBmdW5jdGlvbihjbSkge2NtLm1vdmVWKDEsIFwicGFnZVwiKTt9LFxuICAgIGdvQ2hhckxlZnQ6IGZ1bmN0aW9uKGNtKSB7Y20ubW92ZUgoLTEsIFwiY2hhclwiKTt9LFxuICAgIGdvQ2hhclJpZ2h0OiBmdW5jdGlvbihjbSkge2NtLm1vdmVIKDEsIFwiY2hhclwiKTt9LFxuICAgIGdvQ29sdW1uTGVmdDogZnVuY3Rpb24oY20pIHtjbS5tb3ZlSCgtMSwgXCJjb2x1bW5cIik7fSxcbiAgICBnb0NvbHVtblJpZ2h0OiBmdW5jdGlvbihjbSkge2NtLm1vdmVIKDEsIFwiY29sdW1uXCIpO30sXG4gICAgZ29Xb3JkTGVmdDogZnVuY3Rpb24oY20pIHtjbS5tb3ZlSCgtMSwgXCJ3b3JkXCIpO30sXG4gICAgZ29Hcm91cFJpZ2h0OiBmdW5jdGlvbihjbSkge2NtLm1vdmVIKDEsIFwiZ3JvdXBcIik7fSxcbiAgICBnb0dyb3VwTGVmdDogZnVuY3Rpb24oY20pIHtjbS5tb3ZlSCgtMSwgXCJncm91cFwiKTt9LFxuICAgIGdvV29yZFJpZ2h0OiBmdW5jdGlvbihjbSkge2NtLm1vdmVIKDEsIFwid29yZFwiKTt9LFxuICAgIGRlbENoYXJCZWZvcmU6IGZ1bmN0aW9uKGNtKSB7Y20uZGVsZXRlSCgtMSwgXCJjaGFyXCIpO30sXG4gICAgZGVsQ2hhckFmdGVyOiBmdW5jdGlvbihjbSkge2NtLmRlbGV0ZUgoMSwgXCJjaGFyXCIpO30sXG4gICAgZGVsV29yZEJlZm9yZTogZnVuY3Rpb24oY20pIHtjbS5kZWxldGVIKC0xLCBcIndvcmRcIik7fSxcbiAgICBkZWxXb3JkQWZ0ZXI6IGZ1bmN0aW9uKGNtKSB7Y20uZGVsZXRlSCgxLCBcIndvcmRcIik7fSxcbiAgICBkZWxHcm91cEJlZm9yZTogZnVuY3Rpb24oY20pIHtjbS5kZWxldGVIKC0xLCBcImdyb3VwXCIpO30sXG4gICAgZGVsR3JvdXBBZnRlcjogZnVuY3Rpb24oY20pIHtjbS5kZWxldGVIKDEsIFwiZ3JvdXBcIik7fSxcbiAgICBpbmRlbnRBdXRvOiBmdW5jdGlvbihjbSkge2NtLmluZGVudFNlbGVjdGlvbihcInNtYXJ0XCIpO30sXG4gICAgaW5kZW50TW9yZTogZnVuY3Rpb24oY20pIHtjbS5pbmRlbnRTZWxlY3Rpb24oXCJhZGRcIik7fSxcbiAgICBpbmRlbnRMZXNzOiBmdW5jdGlvbihjbSkge2NtLmluZGVudFNlbGVjdGlvbihcInN1YnRyYWN0XCIpO30sXG4gICAgaW5zZXJ0VGFiOiBmdW5jdGlvbihjbSkge2NtLnJlcGxhY2VTZWxlY3Rpb24oXCJcXHRcIik7fSxcbiAgICBpbnNlcnRTb2Z0VGFiOiBmdW5jdGlvbihjbSkge1xuICAgICAgdmFyIHNwYWNlcyA9IFtdLCByYW5nZXMgPSBjbS5saXN0U2VsZWN0aW9ucygpLCB0YWJTaXplID0gY20ub3B0aW9ucy50YWJTaXplO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHBvcyA9IHJhbmdlc1tpXS5mcm9tKCk7XG4gICAgICAgIHZhciBjb2wgPSBjb3VudENvbHVtbihjbS5nZXRMaW5lKHBvcy5saW5lKSwgcG9zLmNoLCB0YWJTaXplKTtcbiAgICAgICAgc3BhY2VzLnB1c2gobmV3IEFycmF5KHRhYlNpemUgLSBjb2wgJSB0YWJTaXplICsgMSkuam9pbihcIiBcIikpO1xuICAgICAgfVxuICAgICAgY20ucmVwbGFjZVNlbGVjdGlvbnMoc3BhY2VzKTtcbiAgICB9LFxuICAgIGRlZmF1bHRUYWI6IGZ1bmN0aW9uKGNtKSB7XG4gICAgICBpZiAoY20uc29tZXRoaW5nU2VsZWN0ZWQoKSkgY20uaW5kZW50U2VsZWN0aW9uKFwiYWRkXCIpO1xuICAgICAgZWxzZSBjbS5leGVjQ29tbWFuZChcImluc2VydFRhYlwiKTtcbiAgICB9LFxuICAgIHRyYW5zcG9zZUNoYXJzOiBmdW5jdGlvbihjbSkge1xuICAgICAgcnVuSW5PcChjbSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByYW5nZXMgPSBjbS5saXN0U2VsZWN0aW9ucygpLCBuZXdTZWwgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgY3VyID0gcmFuZ2VzW2ldLmhlYWQsIGxpbmUgPSBnZXRMaW5lKGNtLmRvYywgY3VyLmxpbmUpLnRleHQ7XG4gICAgICAgICAgaWYgKGxpbmUpIHtcbiAgICAgICAgICAgIGlmIChjdXIuY2ggPT0gbGluZS5sZW5ndGgpIGN1ciA9IG5ldyBQb3MoY3VyLmxpbmUsIGN1ci5jaCAtIDEpO1xuICAgICAgICAgICAgaWYgKGN1ci5jaCA+IDApIHtcbiAgICAgICAgICAgICAgY3VyID0gbmV3IFBvcyhjdXIubGluZSwgY3VyLmNoICsgMSk7XG4gICAgICAgICAgICAgIGNtLnJlcGxhY2VSYW5nZShsaW5lLmNoYXJBdChjdXIuY2ggLSAxKSArIGxpbmUuY2hhckF0KGN1ci5jaCAtIDIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUG9zKGN1ci5saW5lLCBjdXIuY2ggLSAyKSwgY3VyLCBcIit0cmFuc3Bvc2VcIik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGN1ci5saW5lID4gY20uZG9jLmZpcnN0KSB7XG4gICAgICAgICAgICAgIHZhciBwcmV2ID0gZ2V0TGluZShjbS5kb2MsIGN1ci5saW5lIC0gMSkudGV4dDtcbiAgICAgICAgICAgICAgaWYgKHByZXYpXG4gICAgICAgICAgICAgICAgY20ucmVwbGFjZVJhbmdlKGxpbmUuY2hhckF0KDApICsgXCJcXG5cIiArIHByZXYuY2hhckF0KHByZXYubGVuZ3RoIC0gMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFBvcyhjdXIubGluZSAtIDEsIHByZXYubGVuZ3RoIC0gMSksIFBvcyhjdXIubGluZSwgMSksIFwiK3RyYW5zcG9zZVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgbmV3U2VsLnB1c2gobmV3IFJhbmdlKGN1ciwgY3VyKSk7XG4gICAgICAgIH1cbiAgICAgICAgY20uc2V0U2VsZWN0aW9ucyhuZXdTZWwpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBuZXdsaW5lQW5kSW5kZW50OiBmdW5jdGlvbihjbSkge1xuICAgICAgcnVuSW5PcChjbSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBsZW4gPSBjbS5saXN0U2VsZWN0aW9ucygpLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgIHZhciByYW5nZSA9IGNtLmxpc3RTZWxlY3Rpb25zKClbaV07XG4gICAgICAgICAgY20ucmVwbGFjZVJhbmdlKFwiXFxuXCIsIHJhbmdlLmFuY2hvciwgcmFuZ2UuaGVhZCwgXCIraW5wdXRcIik7XG4gICAgICAgICAgY20uaW5kZW50TGluZShyYW5nZS5mcm9tKCkubGluZSArIDEsIG51bGwsIHRydWUpO1xuICAgICAgICAgIGVuc3VyZUN1cnNvclZpc2libGUoY20pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHRvZ2dsZU92ZXJ3cml0ZTogZnVuY3Rpb24oY20pIHtjbS50b2dnbGVPdmVyd3JpdGUoKTt9XG4gIH07XG5cbiAgLy8gU1RBTkRBUkQgS0VZTUFQU1xuXG4gIHZhciBrZXlNYXAgPSBDb2RlTWlycm9yLmtleU1hcCA9IHt9O1xuICBrZXlNYXAuYmFzaWMgPSB7XG4gICAgXCJMZWZ0XCI6IFwiZ29DaGFyTGVmdFwiLCBcIlJpZ2h0XCI6IFwiZ29DaGFyUmlnaHRcIiwgXCJVcFwiOiBcImdvTGluZVVwXCIsIFwiRG93blwiOiBcImdvTGluZURvd25cIixcbiAgICBcIkVuZFwiOiBcImdvTGluZUVuZFwiLCBcIkhvbWVcIjogXCJnb0xpbmVTdGFydFNtYXJ0XCIsIFwiUGFnZVVwXCI6IFwiZ29QYWdlVXBcIiwgXCJQYWdlRG93blwiOiBcImdvUGFnZURvd25cIixcbiAgICBcIkRlbGV0ZVwiOiBcImRlbENoYXJBZnRlclwiLCBcIkJhY2tzcGFjZVwiOiBcImRlbENoYXJCZWZvcmVcIiwgXCJTaGlmdC1CYWNrc3BhY2VcIjogXCJkZWxDaGFyQmVmb3JlXCIsXG4gICAgXCJUYWJcIjogXCJkZWZhdWx0VGFiXCIsIFwiU2hpZnQtVGFiXCI6IFwiaW5kZW50QXV0b1wiLFxuICAgIFwiRW50ZXJcIjogXCJuZXdsaW5lQW5kSW5kZW50XCIsIFwiSW5zZXJ0XCI6IFwidG9nZ2xlT3ZlcndyaXRlXCIsXG4gICAgXCJFc2NcIjogXCJzaW5nbGVTZWxlY3Rpb25cIlxuICB9O1xuICAvLyBOb3RlIHRoYXQgdGhlIHNhdmUgYW5kIGZpbmQtcmVsYXRlZCBjb21tYW5kcyBhcmVuJ3QgZGVmaW5lZCBieVxuICAvLyBkZWZhdWx0LiBVc2VyIGNvZGUgb3IgYWRkb25zIGNhbiBkZWZpbmUgdGhlbS4gVW5rbm93biBjb21tYW5kc1xuICAvLyBhcmUgc2ltcGx5IGlnbm9yZWQuXG4gIGtleU1hcC5wY0RlZmF1bHQgPSB7XG4gICAgXCJDdHJsLUFcIjogXCJzZWxlY3RBbGxcIiwgXCJDdHJsLURcIjogXCJkZWxldGVMaW5lXCIsIFwiQ3RybC1aXCI6IFwidW5kb1wiLCBcIlNoaWZ0LUN0cmwtWlwiOiBcInJlZG9cIiwgXCJDdHJsLVlcIjogXCJyZWRvXCIsXG4gICAgXCJDdHJsLUhvbWVcIjogXCJnb0RvY1N0YXJ0XCIsIFwiQ3RybC1VcFwiOiBcImdvRG9jU3RhcnRcIiwgXCJDdHJsLUVuZFwiOiBcImdvRG9jRW5kXCIsIFwiQ3RybC1Eb3duXCI6IFwiZ29Eb2NFbmRcIixcbiAgICBcIkN0cmwtTGVmdFwiOiBcImdvR3JvdXBMZWZ0XCIsIFwiQ3RybC1SaWdodFwiOiBcImdvR3JvdXBSaWdodFwiLCBcIkFsdC1MZWZ0XCI6IFwiZ29MaW5lU3RhcnRcIiwgXCJBbHQtUmlnaHRcIjogXCJnb0xpbmVFbmRcIixcbiAgICBcIkN0cmwtQmFja3NwYWNlXCI6IFwiZGVsR3JvdXBCZWZvcmVcIiwgXCJDdHJsLURlbGV0ZVwiOiBcImRlbEdyb3VwQWZ0ZXJcIiwgXCJDdHJsLVNcIjogXCJzYXZlXCIsIFwiQ3RybC1GXCI6IFwiZmluZFwiLFxuICAgIFwiQ3RybC1HXCI6IFwiZmluZE5leHRcIiwgXCJTaGlmdC1DdHJsLUdcIjogXCJmaW5kUHJldlwiLCBcIlNoaWZ0LUN0cmwtRlwiOiBcInJlcGxhY2VcIiwgXCJTaGlmdC1DdHJsLVJcIjogXCJyZXBsYWNlQWxsXCIsXG4gICAgXCJDdHJsLVtcIjogXCJpbmRlbnRMZXNzXCIsIFwiQ3RybC1dXCI6IFwiaW5kZW50TW9yZVwiLFxuICAgIFwiQ3RybC1VXCI6IFwidW5kb1NlbGVjdGlvblwiLCBcIlNoaWZ0LUN0cmwtVVwiOiBcInJlZG9TZWxlY3Rpb25cIiwgXCJBbHQtVVwiOiBcInJlZG9TZWxlY3Rpb25cIixcbiAgICBmYWxsdGhyb3VnaDogXCJiYXNpY1wiXG4gIH07XG4gIGtleU1hcC5tYWNEZWZhdWx0ID0ge1xuICAgIFwiQ21kLUFcIjogXCJzZWxlY3RBbGxcIiwgXCJDbWQtRFwiOiBcImRlbGV0ZUxpbmVcIiwgXCJDbWQtWlwiOiBcInVuZG9cIiwgXCJTaGlmdC1DbWQtWlwiOiBcInJlZG9cIiwgXCJDbWQtWVwiOiBcInJlZG9cIixcbiAgICBcIkNtZC1VcFwiOiBcImdvRG9jU3RhcnRcIiwgXCJDbWQtRW5kXCI6IFwiZ29Eb2NFbmRcIiwgXCJDbWQtRG93blwiOiBcImdvRG9jRW5kXCIsIFwiQWx0LUxlZnRcIjogXCJnb0dyb3VwTGVmdFwiLFxuICAgIFwiQWx0LVJpZ2h0XCI6IFwiZ29Hcm91cFJpZ2h0XCIsIFwiQ21kLUxlZnRcIjogXCJnb0xpbmVTdGFydFwiLCBcIkNtZC1SaWdodFwiOiBcImdvTGluZUVuZFwiLCBcIkFsdC1CYWNrc3BhY2VcIjogXCJkZWxHcm91cEJlZm9yZVwiLFxuICAgIFwiQ3RybC1BbHQtQmFja3NwYWNlXCI6IFwiZGVsR3JvdXBBZnRlclwiLCBcIkFsdC1EZWxldGVcIjogXCJkZWxHcm91cEFmdGVyXCIsIFwiQ21kLVNcIjogXCJzYXZlXCIsIFwiQ21kLUZcIjogXCJmaW5kXCIsXG4gICAgXCJDbWQtR1wiOiBcImZpbmROZXh0XCIsIFwiU2hpZnQtQ21kLUdcIjogXCJmaW5kUHJldlwiLCBcIkNtZC1BbHQtRlwiOiBcInJlcGxhY2VcIiwgXCJTaGlmdC1DbWQtQWx0LUZcIjogXCJyZXBsYWNlQWxsXCIsXG4gICAgXCJDbWQtW1wiOiBcImluZGVudExlc3NcIiwgXCJDbWQtXVwiOiBcImluZGVudE1vcmVcIiwgXCJDbWQtQmFja3NwYWNlXCI6IFwiZGVsTGluZUxlZnRcIixcbiAgICBcIkNtZC1VXCI6IFwidW5kb1NlbGVjdGlvblwiLCBcIlNoaWZ0LUNtZC1VXCI6IFwicmVkb1NlbGVjdGlvblwiLFxuICAgIGZhbGx0aHJvdWdoOiBbXCJiYXNpY1wiLCBcImVtYWNzeVwiXVxuICB9O1xuICAvLyBWZXJ5IGJhc2ljIHJlYWRsaW5lL2VtYWNzLXN0eWxlIGJpbmRpbmdzLCB3aGljaCBhcmUgc3RhbmRhcmQgb24gTWFjLlxuICBrZXlNYXAuZW1hY3N5ID0ge1xuICAgIFwiQ3RybC1GXCI6IFwiZ29DaGFyUmlnaHRcIiwgXCJDdHJsLUJcIjogXCJnb0NoYXJMZWZ0XCIsIFwiQ3RybC1QXCI6IFwiZ29MaW5lVXBcIiwgXCJDdHJsLU5cIjogXCJnb0xpbmVEb3duXCIsXG4gICAgXCJBbHQtRlwiOiBcImdvV29yZFJpZ2h0XCIsIFwiQWx0LUJcIjogXCJnb1dvcmRMZWZ0XCIsIFwiQ3RybC1BXCI6IFwiZ29MaW5lU3RhcnRcIiwgXCJDdHJsLUVcIjogXCJnb0xpbmVFbmRcIixcbiAgICBcIkN0cmwtVlwiOiBcImdvUGFnZURvd25cIiwgXCJTaGlmdC1DdHJsLVZcIjogXCJnb1BhZ2VVcFwiLCBcIkN0cmwtRFwiOiBcImRlbENoYXJBZnRlclwiLCBcIkN0cmwtSFwiOiBcImRlbENoYXJCZWZvcmVcIixcbiAgICBcIkFsdC1EXCI6IFwiZGVsV29yZEFmdGVyXCIsIFwiQWx0LUJhY2tzcGFjZVwiOiBcImRlbFdvcmRCZWZvcmVcIiwgXCJDdHJsLUtcIjogXCJraWxsTGluZVwiLCBcIkN0cmwtVFwiOiBcInRyYW5zcG9zZUNoYXJzXCJcbiAgfTtcbiAga2V5TWFwW1wiZGVmYXVsdFwiXSA9IG1hYyA/IGtleU1hcC5tYWNEZWZhdWx0IDoga2V5TWFwLnBjRGVmYXVsdDtcblxuICAvLyBLRVlNQVAgRElTUEFUQ0hcblxuICBmdW5jdGlvbiBnZXRLZXlNYXAodmFsKSB7XG4gICAgaWYgKHR5cGVvZiB2YWwgPT0gXCJzdHJpbmdcIikgcmV0dXJuIGtleU1hcFt2YWxdO1xuICAgIGVsc2UgcmV0dXJuIHZhbDtcbiAgfVxuXG4gIC8vIEdpdmVuIGFuIGFycmF5IG9mIGtleW1hcHMgYW5kIGEga2V5IG5hbWUsIGNhbGwgaGFuZGxlIG9uIGFueVxuICAvLyBiaW5kaW5ncyBmb3VuZCwgdW50aWwgdGhhdCByZXR1cm5zIGEgdHJ1dGh5IHZhbHVlLCBhdCB3aGljaCBwb2ludFxuICAvLyB3ZSBjb25zaWRlciB0aGUga2V5IGhhbmRsZWQuIEltcGxlbWVudHMgdGhpbmdzIGxpa2UgYmluZGluZyBhIGtleVxuICAvLyB0byBmYWxzZSBzdG9wcGluZyBmdXJ0aGVyIGhhbmRsaW5nIGFuZCBrZXltYXAgZmFsbHRocm91Z2guXG4gIHZhciBsb29rdXBLZXkgPSBDb2RlTWlycm9yLmxvb2t1cEtleSA9IGZ1bmN0aW9uKG5hbWUsIG1hcHMsIGhhbmRsZSkge1xuICAgIGZ1bmN0aW9uIGxvb2t1cChtYXApIHtcbiAgICAgIG1hcCA9IGdldEtleU1hcChtYXApO1xuICAgICAgdmFyIGZvdW5kID0gbWFwW25hbWVdO1xuICAgICAgaWYgKGZvdW5kID09PSBmYWxzZSkgcmV0dXJuIFwic3RvcFwiO1xuICAgICAgaWYgKGZvdW5kICE9IG51bGwgJiYgaGFuZGxlKGZvdW5kKSkgcmV0dXJuIHRydWU7XG4gICAgICBpZiAobWFwLm5vZmFsbHRocm91Z2gpIHJldHVybiBcInN0b3BcIjtcblxuICAgICAgdmFyIGZhbGx0aHJvdWdoID0gbWFwLmZhbGx0aHJvdWdoO1xuICAgICAgaWYgKGZhbGx0aHJvdWdoID09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZmFsbHRocm91Z2gpICE9IFwiW29iamVjdCBBcnJheV1cIilcbiAgICAgICAgcmV0dXJuIGxvb2t1cChmYWxsdGhyb3VnaCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZhbGx0aHJvdWdoLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBkb25lID0gbG9va3VwKGZhbGx0aHJvdWdoW2ldKTtcbiAgICAgICAgaWYgKGRvbmUpIHJldHVybiBkb25lO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWFwcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGRvbmUgPSBsb29rdXAobWFwc1tpXSk7XG4gICAgICBpZiAoZG9uZSkgcmV0dXJuIGRvbmUgIT0gXCJzdG9wXCI7XG4gICAgfVxuICB9O1xuXG4gIC8vIE1vZGlmaWVyIGtleSBwcmVzc2VzIGRvbid0IGNvdW50IGFzICdyZWFsJyBrZXkgcHJlc3NlcyBmb3IgdGhlXG4gIC8vIHB1cnBvc2Ugb2Yga2V5bWFwIGZhbGx0aHJvdWdoLlxuICB2YXIgaXNNb2RpZmllcktleSA9IENvZGVNaXJyb3IuaXNNb2RpZmllcktleSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIG5hbWUgPSBrZXlOYW1lc1tldmVudC5rZXlDb2RlXTtcbiAgICByZXR1cm4gbmFtZSA9PSBcIkN0cmxcIiB8fCBuYW1lID09IFwiQWx0XCIgfHwgbmFtZSA9PSBcIlNoaWZ0XCIgfHwgbmFtZSA9PSBcIk1vZFwiO1xuICB9O1xuXG4gIC8vIExvb2sgdXAgdGhlIG5hbWUgb2YgYSBrZXkgYXMgaW5kaWNhdGVkIGJ5IGFuIGV2ZW50IG9iamVjdC5cbiAgdmFyIGtleU5hbWUgPSBDb2RlTWlycm9yLmtleU5hbWUgPSBmdW5jdGlvbihldmVudCwgbm9TaGlmdCkge1xuICAgIGlmIChwcmVzdG8gJiYgZXZlbnQua2V5Q29kZSA9PSAzNCAmJiBldmVudFtcImNoYXJcIl0pIHJldHVybiBmYWxzZTtcbiAgICB2YXIgbmFtZSA9IGtleU5hbWVzW2V2ZW50LmtleUNvZGVdO1xuICAgIGlmIChuYW1lID09IG51bGwgfHwgZXZlbnQuYWx0R3JhcGhLZXkpIHJldHVybiBmYWxzZTtcbiAgICBpZiAoZXZlbnQuYWx0S2V5KSBuYW1lID0gXCJBbHQtXCIgKyBuYW1lO1xuICAgIGlmIChmbGlwQ3RybENtZCA/IGV2ZW50Lm1ldGFLZXkgOiBldmVudC5jdHJsS2V5KSBuYW1lID0gXCJDdHJsLVwiICsgbmFtZTtcbiAgICBpZiAoZmxpcEN0cmxDbWQgPyBldmVudC5jdHJsS2V5IDogZXZlbnQubWV0YUtleSkgbmFtZSA9IFwiQ21kLVwiICsgbmFtZTtcbiAgICBpZiAoIW5vU2hpZnQgJiYgZXZlbnQuc2hpZnRLZXkpIG5hbWUgPSBcIlNoaWZ0LVwiICsgbmFtZTtcbiAgICByZXR1cm4gbmFtZTtcbiAgfTtcblxuICAvLyBGUk9NVEVYVEFSRUFcblxuICBDb2RlTWlycm9yLmZyb21UZXh0QXJlYSA9IGZ1bmN0aW9uKHRleHRhcmVhLCBvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSBvcHRpb25zID0ge307XG4gICAgb3B0aW9ucy52YWx1ZSA9IHRleHRhcmVhLnZhbHVlO1xuICAgIGlmICghb3B0aW9ucy50YWJpbmRleCAmJiB0ZXh0YXJlYS50YWJpbmRleClcbiAgICAgIG9wdGlvbnMudGFiaW5kZXggPSB0ZXh0YXJlYS50YWJpbmRleDtcbiAgICBpZiAoIW9wdGlvbnMucGxhY2Vob2xkZXIgJiYgdGV4dGFyZWEucGxhY2Vob2xkZXIpXG4gICAgICBvcHRpb25zLnBsYWNlaG9sZGVyID0gdGV4dGFyZWEucGxhY2Vob2xkZXI7XG4gICAgLy8gU2V0IGF1dG9mb2N1cyB0byB0cnVlIGlmIHRoaXMgdGV4dGFyZWEgaXMgZm9jdXNlZCwgb3IgaWYgaXQgaGFzXG4gICAgLy8gYXV0b2ZvY3VzIGFuZCBubyBvdGhlciBlbGVtZW50IGlzIGZvY3VzZWQuXG4gICAgaWYgKG9wdGlvbnMuYXV0b2ZvY3VzID09IG51bGwpIHtcbiAgICAgIHZhciBoYXNGb2N1cyA9IGFjdGl2ZUVsdCgpO1xuICAgICAgb3B0aW9ucy5hdXRvZm9jdXMgPSBoYXNGb2N1cyA9PSB0ZXh0YXJlYSB8fFxuICAgICAgICB0ZXh0YXJlYS5nZXRBdHRyaWJ1dGUoXCJhdXRvZm9jdXNcIikgIT0gbnVsbCAmJiBoYXNGb2N1cyA9PSBkb2N1bWVudC5ib2R5O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNhdmUoKSB7dGV4dGFyZWEudmFsdWUgPSBjbS5nZXRWYWx1ZSgpO31cbiAgICBpZiAodGV4dGFyZWEuZm9ybSkge1xuICAgICAgb24odGV4dGFyZWEuZm9ybSwgXCJzdWJtaXRcIiwgc2F2ZSk7XG4gICAgICAvLyBEZXBsb3JhYmxlIGhhY2sgdG8gbWFrZSB0aGUgc3VibWl0IG1ldGhvZCBkbyB0aGUgcmlnaHQgdGhpbmcuXG4gICAgICBpZiAoIW9wdGlvbnMubGVhdmVTdWJtaXRNZXRob2RBbG9uZSkge1xuICAgICAgICB2YXIgZm9ybSA9IHRleHRhcmVhLmZvcm0sIHJlYWxTdWJtaXQgPSBmb3JtLnN1Ym1pdDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2YXIgd3JhcHBlZFN1Ym1pdCA9IGZvcm0uc3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzYXZlKCk7XG4gICAgICAgICAgICBmb3JtLnN1Ym1pdCA9IHJlYWxTdWJtaXQ7XG4gICAgICAgICAgICBmb3JtLnN1Ym1pdCgpO1xuICAgICAgICAgICAgZm9ybS5zdWJtaXQgPSB3cmFwcGVkU3VibWl0O1xuICAgICAgICAgIH07XG4gICAgICAgIH0gY2F0Y2goZSkge31cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0ZXh0YXJlYS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgdmFyIGNtID0gQ29kZU1pcnJvcihmdW5jdGlvbihub2RlKSB7XG4gICAgICB0ZXh0YXJlYS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShub2RlLCB0ZXh0YXJlYS5uZXh0U2libGluZyk7XG4gICAgfSwgb3B0aW9ucyk7XG4gICAgY20uc2F2ZSA9IHNhdmU7XG4gICAgY20uZ2V0VGV4dEFyZWEgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRleHRhcmVhOyB9O1xuICAgIGNtLnRvVGV4dEFyZWEgPSBmdW5jdGlvbigpIHtcbiAgICAgIHNhdmUoKTtcbiAgICAgIHRleHRhcmVhLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoY20uZ2V0V3JhcHBlckVsZW1lbnQoKSk7XG4gICAgICB0ZXh0YXJlYS5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcbiAgICAgIGlmICh0ZXh0YXJlYS5mb3JtKSB7XG4gICAgICAgIG9mZih0ZXh0YXJlYS5mb3JtLCBcInN1Ym1pdFwiLCBzYXZlKTtcbiAgICAgICAgaWYgKHR5cGVvZiB0ZXh0YXJlYS5mb3JtLnN1Ym1pdCA9PSBcImZ1bmN0aW9uXCIpXG4gICAgICAgICAgdGV4dGFyZWEuZm9ybS5zdWJtaXQgPSByZWFsU3VibWl0O1xuICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIGNtO1xuICB9O1xuXG4gIC8vIFNUUklORyBTVFJFQU1cblxuICAvLyBGZWQgdG8gdGhlIG1vZGUgcGFyc2VycywgcHJvdmlkZXMgaGVscGVyIGZ1bmN0aW9ucyB0byBtYWtlXG4gIC8vIHBhcnNlcnMgbW9yZSBzdWNjaW5jdC5cblxuICB2YXIgU3RyaW5nU3RyZWFtID0gQ29kZU1pcnJvci5TdHJpbmdTdHJlYW0gPSBmdW5jdGlvbihzdHJpbmcsIHRhYlNpemUpIHtcbiAgICB0aGlzLnBvcyA9IHRoaXMuc3RhcnQgPSAwO1xuICAgIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xuICAgIHRoaXMudGFiU2l6ZSA9IHRhYlNpemUgfHwgODtcbiAgICB0aGlzLmxhc3RDb2x1bW5Qb3MgPSB0aGlzLmxhc3RDb2x1bW5WYWx1ZSA9IDA7XG4gICAgdGhpcy5saW5lU3RhcnQgPSAwO1xuICB9O1xuXG4gIFN0cmluZ1N0cmVhbS5wcm90b3R5cGUgPSB7XG4gICAgZW9sOiBmdW5jdGlvbigpIHtyZXR1cm4gdGhpcy5wb3MgPj0gdGhpcy5zdHJpbmcubGVuZ3RoO30sXG4gICAgc29sOiBmdW5jdGlvbigpIHtyZXR1cm4gdGhpcy5wb3MgPT0gdGhpcy5saW5lU3RhcnQ7fSxcbiAgICBwZWVrOiBmdW5jdGlvbigpIHtyZXR1cm4gdGhpcy5zdHJpbmcuY2hhckF0KHRoaXMucG9zKSB8fCB1bmRlZmluZWQ7fSxcbiAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnBvcyA8IHRoaXMuc3RyaW5nLmxlbmd0aClcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RyaW5nLmNoYXJBdCh0aGlzLnBvcysrKTtcbiAgICB9LFxuICAgIGVhdDogZnVuY3Rpb24obWF0Y2gpIHtcbiAgICAgIHZhciBjaCA9IHRoaXMuc3RyaW5nLmNoYXJBdCh0aGlzLnBvcyk7XG4gICAgICBpZiAodHlwZW9mIG1hdGNoID09IFwic3RyaW5nXCIpIHZhciBvayA9IGNoID09IG1hdGNoO1xuICAgICAgZWxzZSB2YXIgb2sgPSBjaCAmJiAobWF0Y2gudGVzdCA/IG1hdGNoLnRlc3QoY2gpIDogbWF0Y2goY2gpKTtcbiAgICAgIGlmIChvaykgeysrdGhpcy5wb3M7IHJldHVybiBjaDt9XG4gICAgfSxcbiAgICBlYXRXaGlsZTogZnVuY3Rpb24obWF0Y2gpIHtcbiAgICAgIHZhciBzdGFydCA9IHRoaXMucG9zO1xuICAgICAgd2hpbGUgKHRoaXMuZWF0KG1hdGNoKSl7fVxuICAgICAgcmV0dXJuIHRoaXMucG9zID4gc3RhcnQ7XG4gICAgfSxcbiAgICBlYXRTcGFjZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc3RhcnQgPSB0aGlzLnBvcztcbiAgICAgIHdoaWxlICgvW1xcc1xcdTAwYTBdLy50ZXN0KHRoaXMuc3RyaW5nLmNoYXJBdCh0aGlzLnBvcykpKSArK3RoaXMucG9zO1xuICAgICAgcmV0dXJuIHRoaXMucG9zID4gc3RhcnQ7XG4gICAgfSxcbiAgICBza2lwVG9FbmQ6IGZ1bmN0aW9uKCkge3RoaXMucG9zID0gdGhpcy5zdHJpbmcubGVuZ3RoO30sXG4gICAgc2tpcFRvOiBmdW5jdGlvbihjaCkge1xuICAgICAgdmFyIGZvdW5kID0gdGhpcy5zdHJpbmcuaW5kZXhPZihjaCwgdGhpcy5wb3MpO1xuICAgICAgaWYgKGZvdW5kID4gLTEpIHt0aGlzLnBvcyA9IGZvdW5kOyByZXR1cm4gdHJ1ZTt9XG4gICAgfSxcbiAgICBiYWNrVXA6IGZ1bmN0aW9uKG4pIHt0aGlzLnBvcyAtPSBuO30sXG4gICAgY29sdW1uOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLmxhc3RDb2x1bW5Qb3MgPCB0aGlzLnN0YXJ0KSB7XG4gICAgICAgIHRoaXMubGFzdENvbHVtblZhbHVlID0gY291bnRDb2x1bW4odGhpcy5zdHJpbmcsIHRoaXMuc3RhcnQsIHRoaXMudGFiU2l6ZSwgdGhpcy5sYXN0Q29sdW1uUG9zLCB0aGlzLmxhc3RDb2x1bW5WYWx1ZSk7XG4gICAgICAgIHRoaXMubGFzdENvbHVtblBvcyA9IHRoaXMuc3RhcnQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5sYXN0Q29sdW1uVmFsdWUgLSAodGhpcy5saW5lU3RhcnQgPyBjb3VudENvbHVtbih0aGlzLnN0cmluZywgdGhpcy5saW5lU3RhcnQsIHRoaXMudGFiU2l6ZSkgOiAwKTtcbiAgICB9LFxuICAgIGluZGVudGF0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBjb3VudENvbHVtbih0aGlzLnN0cmluZywgbnVsbCwgdGhpcy50YWJTaXplKSAtXG4gICAgICAgICh0aGlzLmxpbmVTdGFydCA/IGNvdW50Q29sdW1uKHRoaXMuc3RyaW5nLCB0aGlzLmxpbmVTdGFydCwgdGhpcy50YWJTaXplKSA6IDApO1xuICAgIH0sXG4gICAgbWF0Y2g6IGZ1bmN0aW9uKHBhdHRlcm4sIGNvbnN1bWUsIGNhc2VJbnNlbnNpdGl2ZSkge1xuICAgICAgaWYgKHR5cGVvZiBwYXR0ZXJuID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgdmFyIGNhc2VkID0gZnVuY3Rpb24oc3RyKSB7cmV0dXJuIGNhc2VJbnNlbnNpdGl2ZSA/IHN0ci50b0xvd2VyQ2FzZSgpIDogc3RyO307XG4gICAgICAgIHZhciBzdWJzdHIgPSB0aGlzLnN0cmluZy5zdWJzdHIodGhpcy5wb3MsIHBhdHRlcm4ubGVuZ3RoKTtcbiAgICAgICAgaWYgKGNhc2VkKHN1YnN0cikgPT0gY2FzZWQocGF0dGVybikpIHtcbiAgICAgICAgICBpZiAoY29uc3VtZSAhPT0gZmFsc2UpIHRoaXMucG9zICs9IHBhdHRlcm4ubGVuZ3RoO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbWF0Y2ggPSB0aGlzLnN0cmluZy5zbGljZSh0aGlzLnBvcykubWF0Y2gocGF0dGVybik7XG4gICAgICAgIGlmIChtYXRjaCAmJiBtYXRjaC5pbmRleCA+IDApIHJldHVybiBudWxsO1xuICAgICAgICBpZiAobWF0Y2ggJiYgY29uc3VtZSAhPT0gZmFsc2UpIHRoaXMucG9zICs9IG1hdGNoWzBdLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgfVxuICAgIH0sXG4gICAgY3VycmVudDogZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5zdHJpbmcuc2xpY2UodGhpcy5zdGFydCwgdGhpcy5wb3MpO30sXG4gICAgaGlkZUZpcnN0Q2hhcnM6IGZ1bmN0aW9uKG4sIGlubmVyKSB7XG4gICAgICB0aGlzLmxpbmVTdGFydCArPSBuO1xuICAgICAgdHJ5IHsgcmV0dXJuIGlubmVyKCk7IH1cbiAgICAgIGZpbmFsbHkgeyB0aGlzLmxpbmVTdGFydCAtPSBuOyB9XG4gICAgfVxuICB9O1xuXG4gIC8vIFRFWFRNQVJLRVJTXG5cbiAgLy8gQ3JlYXRlZCB3aXRoIG1hcmtUZXh0IGFuZCBzZXRCb29rbWFyayBtZXRob2RzLiBBIFRleHRNYXJrZXIgaXMgYVxuICAvLyBoYW5kbGUgdGhhdCBjYW4gYmUgdXNlZCB0byBjbGVhciBvciBmaW5kIGEgbWFya2VkIHBvc2l0aW9uIGluIHRoZVxuICAvLyBkb2N1bWVudC4gTGluZSBvYmplY3RzIGhvbGQgYXJyYXlzIChtYXJrZWRTcGFucykgY29udGFpbmluZ1xuICAvLyB7ZnJvbSwgdG8sIG1hcmtlcn0gb2JqZWN0IHBvaW50aW5nIHRvIHN1Y2ggbWFya2VyIG9iamVjdHMsIGFuZFxuICAvLyBpbmRpY2F0aW5nIHRoYXQgc3VjaCBhIG1hcmtlciBpcyBwcmVzZW50IG9uIHRoYXQgbGluZS4gTXVsdGlwbGVcbiAgLy8gbGluZXMgbWF5IHBvaW50IHRvIHRoZSBzYW1lIG1hcmtlciB3aGVuIGl0IHNwYW5zIGFjcm9zcyBsaW5lcy5cbiAgLy8gVGhlIHNwYW5zIHdpbGwgaGF2ZSBudWxsIGZvciB0aGVpciBmcm9tL3RvIHByb3BlcnRpZXMgd2hlbiB0aGVcbiAgLy8gbWFya2VyIGNvbnRpbnVlcyBiZXlvbmQgdGhlIHN0YXJ0L2VuZCBvZiB0aGUgbGluZS4gTWFya2VycyBoYXZlXG4gIC8vIGxpbmtzIGJhY2sgdG8gdGhlIGxpbmVzIHRoZXkgY3VycmVudGx5IHRvdWNoLlxuXG4gIHZhciBUZXh0TWFya2VyID0gQ29kZU1pcnJvci5UZXh0TWFya2VyID0gZnVuY3Rpb24oZG9jLCB0eXBlKSB7XG4gICAgdGhpcy5saW5lcyA9IFtdO1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5kb2MgPSBkb2M7XG4gIH07XG4gIGV2ZW50TWl4aW4oVGV4dE1hcmtlcik7XG5cbiAgLy8gQ2xlYXIgdGhlIG1hcmtlci5cbiAgVGV4dE1hcmtlci5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5leHBsaWNpdGx5Q2xlYXJlZCkgcmV0dXJuO1xuICAgIHZhciBjbSA9IHRoaXMuZG9jLmNtLCB3aXRoT3AgPSBjbSAmJiAhY20uY3VyT3A7XG4gICAgaWYgKHdpdGhPcCkgc3RhcnRPcGVyYXRpb24oY20pO1xuICAgIGlmIChoYXNIYW5kbGVyKHRoaXMsIFwiY2xlYXJcIikpIHtcbiAgICAgIHZhciBmb3VuZCA9IHRoaXMuZmluZCgpO1xuICAgICAgaWYgKGZvdW5kKSBzaWduYWxMYXRlcih0aGlzLCBcImNsZWFyXCIsIGZvdW5kLmZyb20sIGZvdW5kLnRvKTtcbiAgICB9XG4gICAgdmFyIG1pbiA9IG51bGwsIG1heCA9IG51bGw7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxpbmVzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgbGluZSA9IHRoaXMubGluZXNbaV07XG4gICAgICB2YXIgc3BhbiA9IGdldE1hcmtlZFNwYW5Gb3IobGluZS5tYXJrZWRTcGFucywgdGhpcyk7XG4gICAgICBpZiAoY20gJiYgIXRoaXMuY29sbGFwc2VkKSByZWdMaW5lQ2hhbmdlKGNtLCBsaW5lTm8obGluZSksIFwidGV4dFwiKTtcbiAgICAgIGVsc2UgaWYgKGNtKSB7XG4gICAgICAgIGlmIChzcGFuLnRvICE9IG51bGwpIG1heCA9IGxpbmVObyhsaW5lKTtcbiAgICAgICAgaWYgKHNwYW4uZnJvbSAhPSBudWxsKSBtaW4gPSBsaW5lTm8obGluZSk7XG4gICAgICB9XG4gICAgICBsaW5lLm1hcmtlZFNwYW5zID0gcmVtb3ZlTWFya2VkU3BhbihsaW5lLm1hcmtlZFNwYW5zLCBzcGFuKTtcbiAgICAgIGlmIChzcGFuLmZyb20gPT0gbnVsbCAmJiB0aGlzLmNvbGxhcHNlZCAmJiAhbGluZUlzSGlkZGVuKHRoaXMuZG9jLCBsaW5lKSAmJiBjbSlcbiAgICAgICAgdXBkYXRlTGluZUhlaWdodChsaW5lLCB0ZXh0SGVpZ2h0KGNtLmRpc3BsYXkpKTtcbiAgICB9XG4gICAgaWYgKGNtICYmIHRoaXMuY29sbGFwc2VkICYmICFjbS5vcHRpb25zLmxpbmVXcmFwcGluZykgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxpbmVzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgdmlzdWFsID0gdmlzdWFsTGluZSh0aGlzLmxpbmVzW2ldKSwgbGVuID0gbGluZUxlbmd0aCh2aXN1YWwpO1xuICAgICAgaWYgKGxlbiA+IGNtLmRpc3BsYXkubWF4TGluZUxlbmd0aCkge1xuICAgICAgICBjbS5kaXNwbGF5Lm1heExpbmUgPSB2aXN1YWw7XG4gICAgICAgIGNtLmRpc3BsYXkubWF4TGluZUxlbmd0aCA9IGxlbjtcbiAgICAgICAgY20uZGlzcGxheS5tYXhMaW5lQ2hhbmdlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG1pbiAhPSBudWxsICYmIGNtICYmIHRoaXMuY29sbGFwc2VkKSByZWdDaGFuZ2UoY20sIG1pbiwgbWF4ICsgMSk7XG4gICAgdGhpcy5saW5lcy5sZW5ndGggPSAwO1xuICAgIHRoaXMuZXhwbGljaXRseUNsZWFyZWQgPSB0cnVlO1xuICAgIGlmICh0aGlzLmF0b21pYyAmJiB0aGlzLmRvYy5jYW50RWRpdCkge1xuICAgICAgdGhpcy5kb2MuY2FudEVkaXQgPSBmYWxzZTtcbiAgICAgIGlmIChjbSkgcmVDaGVja1NlbGVjdGlvbihjbS5kb2MpO1xuICAgIH1cbiAgICBpZiAoY20pIHNpZ25hbExhdGVyKGNtLCBcIm1hcmtlckNsZWFyZWRcIiwgY20sIHRoaXMpO1xuICAgIGlmICh3aXRoT3ApIGVuZE9wZXJhdGlvbihjbSk7XG4gICAgaWYgKHRoaXMucGFyZW50KSB0aGlzLnBhcmVudC5jbGVhcigpO1xuICB9O1xuXG4gIC8vIEZpbmQgdGhlIHBvc2l0aW9uIG9mIHRoZSBtYXJrZXIgaW4gdGhlIGRvY3VtZW50LiBSZXR1cm5zIGEge2Zyb20sXG4gIC8vIHRvfSBvYmplY3QgYnkgZGVmYXVsdC4gU2lkZSBjYW4gYmUgcGFzc2VkIHRvIGdldCBhIHNwZWNpZmljIHNpZGVcbiAgLy8gLS0gMCAoYm90aCksIC0xIChsZWZ0KSwgb3IgMSAocmlnaHQpLiBXaGVuIGxpbmVPYmogaXMgdHJ1ZSwgdGhlXG4gIC8vIFBvcyBvYmplY3RzIHJldHVybmVkIGNvbnRhaW4gYSBsaW5lIG9iamVjdCwgcmF0aGVyIHRoYW4gYSBsaW5lXG4gIC8vIG51bWJlciAodXNlZCB0byBwcmV2ZW50IGxvb2tpbmcgdXAgdGhlIHNhbWUgbGluZSB0d2ljZSkuXG4gIFRleHRNYXJrZXIucHJvdG90eXBlLmZpbmQgPSBmdW5jdGlvbihzaWRlLCBsaW5lT2JqKSB7XG4gICAgaWYgKHNpZGUgPT0gbnVsbCAmJiB0aGlzLnR5cGUgPT0gXCJib29rbWFya1wiKSBzaWRlID0gMTtcbiAgICB2YXIgZnJvbSwgdG87XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxpbmVzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgbGluZSA9IHRoaXMubGluZXNbaV07XG4gICAgICB2YXIgc3BhbiA9IGdldE1hcmtlZFNwYW5Gb3IobGluZS5tYXJrZWRTcGFucywgdGhpcyk7XG4gICAgICBpZiAoc3Bhbi5mcm9tICE9IG51bGwpIHtcbiAgICAgICAgZnJvbSA9IFBvcyhsaW5lT2JqID8gbGluZSA6IGxpbmVObyhsaW5lKSwgc3Bhbi5mcm9tKTtcbiAgICAgICAgaWYgKHNpZGUgPT0gLTEpIHJldHVybiBmcm9tO1xuICAgICAgfVxuICAgICAgaWYgKHNwYW4udG8gIT0gbnVsbCkge1xuICAgICAgICB0byA9IFBvcyhsaW5lT2JqID8gbGluZSA6IGxpbmVObyhsaW5lKSwgc3Bhbi50byk7XG4gICAgICAgIGlmIChzaWRlID09IDEpIHJldHVybiB0bztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZyb20gJiYge2Zyb206IGZyb20sIHRvOiB0b307XG4gIH07XG5cbiAgLy8gU2lnbmFscyB0aGF0IHRoZSBtYXJrZXIncyB3aWRnZXQgY2hhbmdlZCwgYW5kIHN1cnJvdW5kaW5nIGxheW91dFxuICAvLyBzaG91bGQgYmUgcmVjb21wdXRlZC5cbiAgVGV4dE1hcmtlci5wcm90b3R5cGUuY2hhbmdlZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwb3MgPSB0aGlzLmZpbmQoLTEsIHRydWUpLCB3aWRnZXQgPSB0aGlzLCBjbSA9IHRoaXMuZG9jLmNtO1xuICAgIGlmICghcG9zIHx8ICFjbSkgcmV0dXJuO1xuICAgIHJ1bkluT3AoY20sIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGxpbmUgPSBwb3MubGluZSwgbGluZU4gPSBsaW5lTm8ocG9zLmxpbmUpO1xuICAgICAgdmFyIHZpZXcgPSBmaW5kVmlld0ZvckxpbmUoY20sIGxpbmVOKTtcbiAgICAgIGlmICh2aWV3KSB7XG4gICAgICAgIGNsZWFyTGluZU1lYXN1cmVtZW50Q2FjaGVGb3Iodmlldyk7XG4gICAgICAgIGNtLmN1ck9wLnNlbGVjdGlvbkNoYW5nZWQgPSBjbS5jdXJPcC5mb3JjZVVwZGF0ZSA9IHRydWU7XG4gICAgICB9XG4gICAgICBjbS5jdXJPcC51cGRhdGVNYXhMaW5lID0gdHJ1ZTtcbiAgICAgIGlmICghbGluZUlzSGlkZGVuKHdpZGdldC5kb2MsIGxpbmUpICYmIHdpZGdldC5oZWlnaHQgIT0gbnVsbCkge1xuICAgICAgICB2YXIgb2xkSGVpZ2h0ID0gd2lkZ2V0LmhlaWdodDtcbiAgICAgICAgd2lkZ2V0LmhlaWdodCA9IG51bGw7XG4gICAgICAgIHZhciBkSGVpZ2h0ID0gd2lkZ2V0SGVpZ2h0KHdpZGdldCkgLSBvbGRIZWlnaHQ7XG4gICAgICAgIGlmIChkSGVpZ2h0KVxuICAgICAgICAgIHVwZGF0ZUxpbmVIZWlnaHQobGluZSwgbGluZS5oZWlnaHQgKyBkSGVpZ2h0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBUZXh0TWFya2VyLnByb3RvdHlwZS5hdHRhY2hMaW5lID0gZnVuY3Rpb24obGluZSkge1xuICAgIGlmICghdGhpcy5saW5lcy5sZW5ndGggJiYgdGhpcy5kb2MuY20pIHtcbiAgICAgIHZhciBvcCA9IHRoaXMuZG9jLmNtLmN1ck9wO1xuICAgICAgaWYgKCFvcC5tYXliZUhpZGRlbk1hcmtlcnMgfHwgaW5kZXhPZihvcC5tYXliZUhpZGRlbk1hcmtlcnMsIHRoaXMpID09IC0xKVxuICAgICAgICAob3AubWF5YmVVbmhpZGRlbk1hcmtlcnMgfHwgKG9wLm1heWJlVW5oaWRkZW5NYXJrZXJzID0gW10pKS5wdXNoKHRoaXMpO1xuICAgIH1cbiAgICB0aGlzLmxpbmVzLnB1c2gobGluZSk7XG4gIH07XG4gIFRleHRNYXJrZXIucHJvdG90eXBlLmRldGFjaExpbmUgPSBmdW5jdGlvbihsaW5lKSB7XG4gICAgdGhpcy5saW5lcy5zcGxpY2UoaW5kZXhPZih0aGlzLmxpbmVzLCBsaW5lKSwgMSk7XG4gICAgaWYgKCF0aGlzLmxpbmVzLmxlbmd0aCAmJiB0aGlzLmRvYy5jbSkge1xuICAgICAgdmFyIG9wID0gdGhpcy5kb2MuY20uY3VyT3A7XG4gICAgICAob3AubWF5YmVIaWRkZW5NYXJrZXJzIHx8IChvcC5tYXliZUhpZGRlbk1hcmtlcnMgPSBbXSkpLnB1c2godGhpcyk7XG4gICAgfVxuICB9O1xuXG4gIC8vIENvbGxhcHNlZCBtYXJrZXJzIGhhdmUgdW5pcXVlIGlkcywgaW4gb3JkZXIgdG8gYmUgYWJsZSB0byBvcmRlclxuICAvLyB0aGVtLCB3aGljaCBpcyBuZWVkZWQgZm9yIHVuaXF1ZWx5IGRldGVybWluaW5nIGFuIG91dGVyIG1hcmtlclxuICAvLyB3aGVuIHRoZXkgb3ZlcmxhcCAodGhleSBtYXkgbmVzdCwgYnV0IG5vdCBwYXJ0aWFsbHkgb3ZlcmxhcCkuXG4gIHZhciBuZXh0TWFya2VySWQgPSAwO1xuXG4gIC8vIENyZWF0ZSBhIG1hcmtlciwgd2lyZSBpdCB1cCB0byB0aGUgcmlnaHQgbGluZXMsIGFuZFxuICBmdW5jdGlvbiBtYXJrVGV4dChkb2MsIGZyb20sIHRvLCBvcHRpb25zLCB0eXBlKSB7XG4gICAgLy8gU2hhcmVkIG1hcmtlcnMgKGFjcm9zcyBsaW5rZWQgZG9jdW1lbnRzKSBhcmUgaGFuZGxlZCBzZXBhcmF0ZWx5XG4gICAgLy8gKG1hcmtUZXh0U2hhcmVkIHdpbGwgY2FsbCBvdXQgdG8gdGhpcyBhZ2Fpbiwgb25jZSBwZXJcbiAgICAvLyBkb2N1bWVudCkuXG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5zaGFyZWQpIHJldHVybiBtYXJrVGV4dFNoYXJlZChkb2MsIGZyb20sIHRvLCBvcHRpb25zLCB0eXBlKTtcbiAgICAvLyBFbnN1cmUgd2UgYXJlIGluIGFuIG9wZXJhdGlvbi5cbiAgICBpZiAoZG9jLmNtICYmICFkb2MuY20uY3VyT3ApIHJldHVybiBvcGVyYXRpb24oZG9jLmNtLCBtYXJrVGV4dCkoZG9jLCBmcm9tLCB0bywgb3B0aW9ucywgdHlwZSk7XG5cbiAgICB2YXIgbWFya2VyID0gbmV3IFRleHRNYXJrZXIoZG9jLCB0eXBlKSwgZGlmZiA9IGNtcChmcm9tLCB0byk7XG4gICAgaWYgKG9wdGlvbnMpIGNvcHlPYmoob3B0aW9ucywgbWFya2VyLCBmYWxzZSk7XG4gICAgLy8gRG9uJ3QgY29ubmVjdCBlbXB0eSBtYXJrZXJzIHVubGVzcyBjbGVhcldoZW5FbXB0eSBpcyBmYWxzZVxuICAgIGlmIChkaWZmID4gMCB8fCBkaWZmID09IDAgJiYgbWFya2VyLmNsZWFyV2hlbkVtcHR5ICE9PSBmYWxzZSlcbiAgICAgIHJldHVybiBtYXJrZXI7XG4gICAgaWYgKG1hcmtlci5yZXBsYWNlZFdpdGgpIHtcbiAgICAgIC8vIFNob3dpbmcgdXAgYXMgYSB3aWRnZXQgaW1wbGllcyBjb2xsYXBzZWQgKHdpZGdldCByZXBsYWNlcyB0ZXh0KVxuICAgICAgbWFya2VyLmNvbGxhcHNlZCA9IHRydWU7XG4gICAgICBtYXJrZXIud2lkZ2V0Tm9kZSA9IGVsdChcInNwYW5cIiwgW21hcmtlci5yZXBsYWNlZFdpdGhdLCBcIkNvZGVNaXJyb3Itd2lkZ2V0XCIpO1xuICAgICAgaWYgKCFvcHRpb25zLmhhbmRsZU1vdXNlRXZlbnRzKSBtYXJrZXIud2lkZ2V0Tm9kZS5pZ25vcmVFdmVudHMgPSB0cnVlO1xuICAgICAgaWYgKG9wdGlvbnMuaW5zZXJ0TGVmdCkgbWFya2VyLndpZGdldE5vZGUuaW5zZXJ0TGVmdCA9IHRydWU7XG4gICAgfVxuICAgIGlmIChtYXJrZXIuY29sbGFwc2VkKSB7XG4gICAgICBpZiAoY29uZmxpY3RpbmdDb2xsYXBzZWRSYW5nZShkb2MsIGZyb20ubGluZSwgZnJvbSwgdG8sIG1hcmtlcikgfHxcbiAgICAgICAgICBmcm9tLmxpbmUgIT0gdG8ubGluZSAmJiBjb25mbGljdGluZ0NvbGxhcHNlZFJhbmdlKGRvYywgdG8ubGluZSwgZnJvbSwgdG8sIG1hcmtlcikpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkluc2VydGluZyBjb2xsYXBzZWQgbWFya2VyIHBhcnRpYWxseSBvdmVybGFwcGluZyBhbiBleGlzdGluZyBvbmVcIik7XG4gICAgICBzYXdDb2xsYXBzZWRTcGFucyA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKG1hcmtlci5hZGRUb0hpc3RvcnkpXG4gICAgICBhZGRDaGFuZ2VUb0hpc3RvcnkoZG9jLCB7ZnJvbTogZnJvbSwgdG86IHRvLCBvcmlnaW46IFwibWFya1RleHRcIn0sIGRvYy5zZWwsIE5hTik7XG5cbiAgICB2YXIgY3VyTGluZSA9IGZyb20ubGluZSwgY20gPSBkb2MuY20sIHVwZGF0ZU1heExpbmU7XG4gICAgZG9jLml0ZXIoY3VyTGluZSwgdG8ubGluZSArIDEsIGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIGlmIChjbSAmJiBtYXJrZXIuY29sbGFwc2VkICYmICFjbS5vcHRpb25zLmxpbmVXcmFwcGluZyAmJiB2aXN1YWxMaW5lKGxpbmUpID09IGNtLmRpc3BsYXkubWF4TGluZSlcbiAgICAgICAgdXBkYXRlTWF4TGluZSA9IHRydWU7XG4gICAgICBpZiAobWFya2VyLmNvbGxhcHNlZCAmJiBjdXJMaW5lICE9IGZyb20ubGluZSkgdXBkYXRlTGluZUhlaWdodChsaW5lLCAwKTtcbiAgICAgIGFkZE1hcmtlZFNwYW4obGluZSwgbmV3IE1hcmtlZFNwYW4obWFya2VyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJMaW5lID09IGZyb20ubGluZSA/IGZyb20uY2ggOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJMaW5lID09IHRvLmxpbmUgPyB0by5jaCA6IG51bGwpKTtcbiAgICAgICsrY3VyTGluZTtcbiAgICB9KTtcbiAgICAvLyBsaW5lSXNIaWRkZW4gZGVwZW5kcyBvbiB0aGUgcHJlc2VuY2Ugb2YgdGhlIHNwYW5zLCBzbyBuZWVkcyBhIHNlY29uZCBwYXNzXG4gICAgaWYgKG1hcmtlci5jb2xsYXBzZWQpIGRvYy5pdGVyKGZyb20ubGluZSwgdG8ubGluZSArIDEsIGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIGlmIChsaW5lSXNIaWRkZW4oZG9jLCBsaW5lKSkgdXBkYXRlTGluZUhlaWdodChsaW5lLCAwKTtcbiAgICB9KTtcblxuICAgIGlmIChtYXJrZXIuY2xlYXJPbkVudGVyKSBvbihtYXJrZXIsIFwiYmVmb3JlQ3Vyc29yRW50ZXJcIiwgZnVuY3Rpb24oKSB7IG1hcmtlci5jbGVhcigpOyB9KTtcblxuICAgIGlmIChtYXJrZXIucmVhZE9ubHkpIHtcbiAgICAgIHNhd1JlYWRPbmx5U3BhbnMgPSB0cnVlO1xuICAgICAgaWYgKGRvYy5oaXN0b3J5LmRvbmUubGVuZ3RoIHx8IGRvYy5oaXN0b3J5LnVuZG9uZS5sZW5ndGgpXG4gICAgICAgIGRvYy5jbGVhckhpc3RvcnkoKTtcbiAgICB9XG4gICAgaWYgKG1hcmtlci5jb2xsYXBzZWQpIHtcbiAgICAgIG1hcmtlci5pZCA9ICsrbmV4dE1hcmtlcklkO1xuICAgICAgbWFya2VyLmF0b21pYyA9IHRydWU7XG4gICAgfVxuICAgIGlmIChjbSkge1xuICAgICAgLy8gU3luYyBlZGl0b3Igc3RhdGVcbiAgICAgIGlmICh1cGRhdGVNYXhMaW5lKSBjbS5jdXJPcC51cGRhdGVNYXhMaW5lID0gdHJ1ZTtcbiAgICAgIGlmIChtYXJrZXIuY29sbGFwc2VkKVxuICAgICAgICByZWdDaGFuZ2UoY20sIGZyb20ubGluZSwgdG8ubGluZSArIDEpO1xuICAgICAgZWxzZSBpZiAobWFya2VyLmNsYXNzTmFtZSB8fCBtYXJrZXIudGl0bGUgfHwgbWFya2VyLnN0YXJ0U3R5bGUgfHwgbWFya2VyLmVuZFN0eWxlKVxuICAgICAgICBmb3IgKHZhciBpID0gZnJvbS5saW5lOyBpIDw9IHRvLmxpbmU7IGkrKykgcmVnTGluZUNoYW5nZShjbSwgaSwgXCJ0ZXh0XCIpO1xuICAgICAgaWYgKG1hcmtlci5hdG9taWMpIHJlQ2hlY2tTZWxlY3Rpb24oY20uZG9jKTtcbiAgICAgIHNpZ25hbExhdGVyKGNtLCBcIm1hcmtlckFkZGVkXCIsIGNtLCBtYXJrZXIpO1xuICAgIH1cbiAgICByZXR1cm4gbWFya2VyO1xuICB9XG5cbiAgLy8gU0hBUkVEIFRFWFRNQVJLRVJTXG5cbiAgLy8gQSBzaGFyZWQgbWFya2VyIHNwYW5zIG11bHRpcGxlIGxpbmtlZCBkb2N1bWVudHMuIEl0IGlzXG4gIC8vIGltcGxlbWVudGVkIGFzIGEgbWV0YS1tYXJrZXItb2JqZWN0IGNvbnRyb2xsaW5nIG11bHRpcGxlIG5vcm1hbFxuICAvLyBtYXJrZXJzLlxuICB2YXIgU2hhcmVkVGV4dE1hcmtlciA9IENvZGVNaXJyb3IuU2hhcmVkVGV4dE1hcmtlciA9IGZ1bmN0aW9uKG1hcmtlcnMsIHByaW1hcnkpIHtcbiAgICB0aGlzLm1hcmtlcnMgPSBtYXJrZXJzO1xuICAgIHRoaXMucHJpbWFyeSA9IHByaW1hcnk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXJrZXJzLmxlbmd0aDsgKytpKVxuICAgICAgbWFya2Vyc1tpXS5wYXJlbnQgPSB0aGlzO1xuICB9O1xuICBldmVudE1peGluKFNoYXJlZFRleHRNYXJrZXIpO1xuXG4gIFNoYXJlZFRleHRNYXJrZXIucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuZXhwbGljaXRseUNsZWFyZWQpIHJldHVybjtcbiAgICB0aGlzLmV4cGxpY2l0bHlDbGVhcmVkID0gdHJ1ZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubWFya2Vycy5sZW5ndGg7ICsraSlcbiAgICAgIHRoaXMubWFya2Vyc1tpXS5jbGVhcigpO1xuICAgIHNpZ25hbExhdGVyKHRoaXMsIFwiY2xlYXJcIik7XG4gIH07XG4gIFNoYXJlZFRleHRNYXJrZXIucHJvdG90eXBlLmZpbmQgPSBmdW5jdGlvbihzaWRlLCBsaW5lT2JqKSB7XG4gICAgcmV0dXJuIHRoaXMucHJpbWFyeS5maW5kKHNpZGUsIGxpbmVPYmopO1xuICB9O1xuXG4gIGZ1bmN0aW9uIG1hcmtUZXh0U2hhcmVkKGRvYywgZnJvbSwgdG8sIG9wdGlvbnMsIHR5cGUpIHtcbiAgICBvcHRpb25zID0gY29weU9iaihvcHRpb25zKTtcbiAgICBvcHRpb25zLnNoYXJlZCA9IGZhbHNlO1xuICAgIHZhciBtYXJrZXJzID0gW21hcmtUZXh0KGRvYywgZnJvbSwgdG8sIG9wdGlvbnMsIHR5cGUpXSwgcHJpbWFyeSA9IG1hcmtlcnNbMF07XG4gICAgdmFyIHdpZGdldCA9IG9wdGlvbnMud2lkZ2V0Tm9kZTtcbiAgICBsaW5rZWREb2NzKGRvYywgZnVuY3Rpb24oZG9jKSB7XG4gICAgICBpZiAod2lkZ2V0KSBvcHRpb25zLndpZGdldE5vZGUgPSB3aWRnZXQuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgbWFya2Vycy5wdXNoKG1hcmtUZXh0KGRvYywgY2xpcFBvcyhkb2MsIGZyb20pLCBjbGlwUG9zKGRvYywgdG8pLCBvcHRpb25zLCB0eXBlKSk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRvYy5saW5rZWQubGVuZ3RoOyArK2kpXG4gICAgICAgIGlmIChkb2MubGlua2VkW2ldLmlzUGFyZW50KSByZXR1cm47XG4gICAgICBwcmltYXJ5ID0gbHN0KG1hcmtlcnMpO1xuICAgIH0pO1xuICAgIHJldHVybiBuZXcgU2hhcmVkVGV4dE1hcmtlcihtYXJrZXJzLCBwcmltYXJ5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbmRTaGFyZWRNYXJrZXJzKGRvYykge1xuICAgIHJldHVybiBkb2MuZmluZE1hcmtzKFBvcyhkb2MuZmlyc3QsIDApLCBkb2MuY2xpcFBvcyhQb3MoZG9jLmxhc3RMaW5lKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihtKSB7IHJldHVybiBtLnBhcmVudDsgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBjb3B5U2hhcmVkTWFya2Vycyhkb2MsIG1hcmtlcnMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1hcmtlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBtYXJrZXIgPSBtYXJrZXJzW2ldLCBwb3MgPSBtYXJrZXIuZmluZCgpO1xuICAgICAgdmFyIG1Gcm9tID0gZG9jLmNsaXBQb3MocG9zLmZyb20pLCBtVG8gPSBkb2MuY2xpcFBvcyhwb3MudG8pO1xuICAgICAgaWYgKGNtcChtRnJvbSwgbVRvKSkge1xuICAgICAgICB2YXIgc3ViTWFyayA9IG1hcmtUZXh0KGRvYywgbUZyb20sIG1UbywgbWFya2VyLnByaW1hcnksIG1hcmtlci5wcmltYXJ5LnR5cGUpO1xuICAgICAgICBtYXJrZXIubWFya2Vycy5wdXNoKHN1Yk1hcmspO1xuICAgICAgICBzdWJNYXJrLnBhcmVudCA9IG1hcmtlcjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkZXRhY2hTaGFyZWRNYXJrZXJzKG1hcmtlcnMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1hcmtlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBtYXJrZXIgPSBtYXJrZXJzW2ldLCBsaW5rZWQgPSBbbWFya2VyLnByaW1hcnkuZG9jXTs7XG4gICAgICBsaW5rZWREb2NzKG1hcmtlci5wcmltYXJ5LmRvYywgZnVuY3Rpb24oZCkgeyBsaW5rZWQucHVzaChkKTsgfSk7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG1hcmtlci5tYXJrZXJzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHZhciBzdWJNYXJrZXIgPSBtYXJrZXIubWFya2Vyc1tqXTtcbiAgICAgICAgaWYgKGluZGV4T2YobGlua2VkLCBzdWJNYXJrZXIuZG9jKSA9PSAtMSkge1xuICAgICAgICAgIHN1Yk1hcmtlci5wYXJlbnQgPSBudWxsO1xuICAgICAgICAgIG1hcmtlci5tYXJrZXJzLnNwbGljZShqLS0sIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gVEVYVE1BUktFUiBTUEFOU1xuXG4gIGZ1bmN0aW9uIE1hcmtlZFNwYW4obWFya2VyLCBmcm9tLCB0bykge1xuICAgIHRoaXMubWFya2VyID0gbWFya2VyO1xuICAgIHRoaXMuZnJvbSA9IGZyb207IHRoaXMudG8gPSB0bztcbiAgfVxuXG4gIC8vIFNlYXJjaCBhbiBhcnJheSBvZiBzcGFucyBmb3IgYSBzcGFuIG1hdGNoaW5nIHRoZSBnaXZlbiBtYXJrZXIuXG4gIGZ1bmN0aW9uIGdldE1hcmtlZFNwYW5Gb3Ioc3BhbnMsIG1hcmtlcikge1xuICAgIGlmIChzcGFucykgZm9yICh2YXIgaSA9IDA7IGkgPCBzcGFucy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHNwYW4gPSBzcGFuc1tpXTtcbiAgICAgIGlmIChzcGFuLm1hcmtlciA9PSBtYXJrZXIpIHJldHVybiBzcGFuO1xuICAgIH1cbiAgfVxuICAvLyBSZW1vdmUgYSBzcGFuIGZyb20gYW4gYXJyYXksIHJldHVybmluZyB1bmRlZmluZWQgaWYgbm8gc3BhbnMgYXJlXG4gIC8vIGxlZnQgKHdlIGRvbid0IHN0b3JlIGFycmF5cyBmb3IgbGluZXMgd2l0aG91dCBzcGFucykuXG4gIGZ1bmN0aW9uIHJlbW92ZU1hcmtlZFNwYW4oc3BhbnMsIHNwYW4pIHtcbiAgICBmb3IgKHZhciByLCBpID0gMDsgaSA8IHNwYW5zLmxlbmd0aDsgKytpKVxuICAgICAgaWYgKHNwYW5zW2ldICE9IHNwYW4pIChyIHx8IChyID0gW10pKS5wdXNoKHNwYW5zW2ldKTtcbiAgICByZXR1cm4gcjtcbiAgfVxuICAvLyBBZGQgYSBzcGFuIHRvIGEgbGluZS5cbiAgZnVuY3Rpb24gYWRkTWFya2VkU3BhbihsaW5lLCBzcGFuKSB7XG4gICAgbGluZS5tYXJrZWRTcGFucyA9IGxpbmUubWFya2VkU3BhbnMgPyBsaW5lLm1hcmtlZFNwYW5zLmNvbmNhdChbc3Bhbl0pIDogW3NwYW5dO1xuICAgIHNwYW4ubWFya2VyLmF0dGFjaExpbmUobGluZSk7XG4gIH1cblxuICAvLyBVc2VkIGZvciB0aGUgYWxnb3JpdGhtIHRoYXQgYWRqdXN0cyBtYXJrZXJzIGZvciBhIGNoYW5nZSBpbiB0aGVcbiAgLy8gZG9jdW1lbnQuIFRoZXNlIGZ1bmN0aW9ucyBjdXQgYW4gYXJyYXkgb2Ygc3BhbnMgYXQgYSBnaXZlblxuICAvLyBjaGFyYWN0ZXIgcG9zaXRpb24sIHJldHVybmluZyBhbiBhcnJheSBvZiByZW1haW5pbmcgY2h1bmtzIChvclxuICAvLyB1bmRlZmluZWQgaWYgbm90aGluZyByZW1haW5zKS5cbiAgZnVuY3Rpb24gbWFya2VkU3BhbnNCZWZvcmUob2xkLCBzdGFydENoLCBpc0luc2VydCkge1xuICAgIGlmIChvbGQpIGZvciAodmFyIGkgPSAwLCBudzsgaSA8IG9sZC5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHNwYW4gPSBvbGRbaV0sIG1hcmtlciA9IHNwYW4ubWFya2VyO1xuICAgICAgdmFyIHN0YXJ0c0JlZm9yZSA9IHNwYW4uZnJvbSA9PSBudWxsIHx8IChtYXJrZXIuaW5jbHVzaXZlTGVmdCA/IHNwYW4uZnJvbSA8PSBzdGFydENoIDogc3Bhbi5mcm9tIDwgc3RhcnRDaCk7XG4gICAgICBpZiAoc3RhcnRzQmVmb3JlIHx8IHNwYW4uZnJvbSA9PSBzdGFydENoICYmIG1hcmtlci50eXBlID09IFwiYm9va21hcmtcIiAmJiAoIWlzSW5zZXJ0IHx8ICFzcGFuLm1hcmtlci5pbnNlcnRMZWZ0KSkge1xuICAgICAgICB2YXIgZW5kc0FmdGVyID0gc3Bhbi50byA9PSBudWxsIHx8IChtYXJrZXIuaW5jbHVzaXZlUmlnaHQgPyBzcGFuLnRvID49IHN0YXJ0Q2ggOiBzcGFuLnRvID4gc3RhcnRDaCk7XG4gICAgICAgIChudyB8fCAobncgPSBbXSkpLnB1c2gobmV3IE1hcmtlZFNwYW4obWFya2VyLCBzcGFuLmZyb20sIGVuZHNBZnRlciA/IG51bGwgOiBzcGFuLnRvKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudztcbiAgfVxuICBmdW5jdGlvbiBtYXJrZWRTcGFuc0FmdGVyKG9sZCwgZW5kQ2gsIGlzSW5zZXJ0KSB7XG4gICAgaWYgKG9sZCkgZm9yICh2YXIgaSA9IDAsIG53OyBpIDwgb2xkLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgc3BhbiA9IG9sZFtpXSwgbWFya2VyID0gc3Bhbi5tYXJrZXI7XG4gICAgICB2YXIgZW5kc0FmdGVyID0gc3Bhbi50byA9PSBudWxsIHx8IChtYXJrZXIuaW5jbHVzaXZlUmlnaHQgPyBzcGFuLnRvID49IGVuZENoIDogc3Bhbi50byA+IGVuZENoKTtcbiAgICAgIGlmIChlbmRzQWZ0ZXIgfHwgc3Bhbi5mcm9tID09IGVuZENoICYmIG1hcmtlci50eXBlID09IFwiYm9va21hcmtcIiAmJiAoIWlzSW5zZXJ0IHx8IHNwYW4ubWFya2VyLmluc2VydExlZnQpKSB7XG4gICAgICAgIHZhciBzdGFydHNCZWZvcmUgPSBzcGFuLmZyb20gPT0gbnVsbCB8fCAobWFya2VyLmluY2x1c2l2ZUxlZnQgPyBzcGFuLmZyb20gPD0gZW5kQ2ggOiBzcGFuLmZyb20gPCBlbmRDaCk7XG4gICAgICAgIChudyB8fCAobncgPSBbXSkpLnB1c2gobmV3IE1hcmtlZFNwYW4obWFya2VyLCBzdGFydHNCZWZvcmUgPyBudWxsIDogc3Bhbi5mcm9tIC0gZW5kQ2gsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3Bhbi50byA9PSBudWxsID8gbnVsbCA6IHNwYW4udG8gLSBlbmRDaCkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnc7XG4gIH1cblxuICAvLyBHaXZlbiBhIGNoYW5nZSBvYmplY3QsIGNvbXB1dGUgdGhlIG5ldyBzZXQgb2YgbWFya2VyIHNwYW5zIHRoYXRcbiAgLy8gY292ZXIgdGhlIGxpbmUgaW4gd2hpY2ggdGhlIGNoYW5nZSB0b29rIHBsYWNlLiBSZW1vdmVzIHNwYW5zXG4gIC8vIGVudGlyZWx5IHdpdGhpbiB0aGUgY2hhbmdlLCByZWNvbm5lY3RzIHNwYW5zIGJlbG9uZ2luZyB0byB0aGVcbiAgLy8gc2FtZSBtYXJrZXIgdGhhdCBhcHBlYXIgb24gYm90aCBzaWRlcyBvZiB0aGUgY2hhbmdlLCBhbmQgY3V0cyBvZmZcbiAgLy8gc3BhbnMgcGFydGlhbGx5IHdpdGhpbiB0aGUgY2hhbmdlLiBSZXR1cm5zIGFuIGFycmF5IG9mIHNwYW5cbiAgLy8gYXJyYXlzIHdpdGggb25lIGVsZW1lbnQgZm9yIGVhY2ggbGluZSBpbiAoYWZ0ZXIpIHRoZSBjaGFuZ2UuXG4gIGZ1bmN0aW9uIHN0cmV0Y2hTcGFuc092ZXJDaGFuZ2UoZG9jLCBjaGFuZ2UpIHtcbiAgICB2YXIgb2xkRmlyc3QgPSBpc0xpbmUoZG9jLCBjaGFuZ2UuZnJvbS5saW5lKSAmJiBnZXRMaW5lKGRvYywgY2hhbmdlLmZyb20ubGluZSkubWFya2VkU3BhbnM7XG4gICAgdmFyIG9sZExhc3QgPSBpc0xpbmUoZG9jLCBjaGFuZ2UudG8ubGluZSkgJiYgZ2V0TGluZShkb2MsIGNoYW5nZS50by5saW5lKS5tYXJrZWRTcGFucztcbiAgICBpZiAoIW9sZEZpcnN0ICYmICFvbGRMYXN0KSByZXR1cm4gbnVsbDtcblxuICAgIHZhciBzdGFydENoID0gY2hhbmdlLmZyb20uY2gsIGVuZENoID0gY2hhbmdlLnRvLmNoLCBpc0luc2VydCA9IGNtcChjaGFuZ2UuZnJvbSwgY2hhbmdlLnRvKSA9PSAwO1xuICAgIC8vIEdldCB0aGUgc3BhbnMgdGhhdCAnc3RpY2sgb3V0JyBvbiBib3RoIHNpZGVzXG4gICAgdmFyIGZpcnN0ID0gbWFya2VkU3BhbnNCZWZvcmUob2xkRmlyc3QsIHN0YXJ0Q2gsIGlzSW5zZXJ0KTtcbiAgICB2YXIgbGFzdCA9IG1hcmtlZFNwYW5zQWZ0ZXIob2xkTGFzdCwgZW5kQ2gsIGlzSW5zZXJ0KTtcblxuICAgIC8vIE5leHQsIG1lcmdlIHRob3NlIHR3byBlbmRzXG4gICAgdmFyIHNhbWVMaW5lID0gY2hhbmdlLnRleHQubGVuZ3RoID09IDEsIG9mZnNldCA9IGxzdChjaGFuZ2UudGV4dCkubGVuZ3RoICsgKHNhbWVMaW5lID8gc3RhcnRDaCA6IDApO1xuICAgIGlmIChmaXJzdCkge1xuICAgICAgLy8gRml4IHVwIC50byBwcm9wZXJ0aWVzIG9mIGZpcnN0XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpcnN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBzcGFuID0gZmlyc3RbaV07XG4gICAgICAgIGlmIChzcGFuLnRvID09IG51bGwpIHtcbiAgICAgICAgICB2YXIgZm91bmQgPSBnZXRNYXJrZWRTcGFuRm9yKGxhc3QsIHNwYW4ubWFya2VyKTtcbiAgICAgICAgICBpZiAoIWZvdW5kKSBzcGFuLnRvID0gc3RhcnRDaDtcbiAgICAgICAgICBlbHNlIGlmIChzYW1lTGluZSkgc3Bhbi50byA9IGZvdW5kLnRvID09IG51bGwgPyBudWxsIDogZm91bmQudG8gKyBvZmZzZXQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGxhc3QpIHtcbiAgICAgIC8vIEZpeCB1cCAuZnJvbSBpbiBsYXN0IChvciBtb3ZlIHRoZW0gaW50byBmaXJzdCBpbiBjYXNlIG9mIHNhbWVMaW5lKVxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBzcGFuID0gbGFzdFtpXTtcbiAgICAgICAgaWYgKHNwYW4udG8gIT0gbnVsbCkgc3Bhbi50byArPSBvZmZzZXQ7XG4gICAgICAgIGlmIChzcGFuLmZyb20gPT0gbnVsbCkge1xuICAgICAgICAgIHZhciBmb3VuZCA9IGdldE1hcmtlZFNwYW5Gb3IoZmlyc3QsIHNwYW4ubWFya2VyKTtcbiAgICAgICAgICBpZiAoIWZvdW5kKSB7XG4gICAgICAgICAgICBzcGFuLmZyb20gPSBvZmZzZXQ7XG4gICAgICAgICAgICBpZiAoc2FtZUxpbmUpIChmaXJzdCB8fCAoZmlyc3QgPSBbXSkpLnB1c2goc3Bhbik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNwYW4uZnJvbSArPSBvZmZzZXQ7XG4gICAgICAgICAgaWYgKHNhbWVMaW5lKSAoZmlyc3QgfHwgKGZpcnN0ID0gW10pKS5wdXNoKHNwYW4pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIC8vIE1ha2Ugc3VyZSB3ZSBkaWRuJ3QgY3JlYXRlIGFueSB6ZXJvLWxlbmd0aCBzcGFuc1xuICAgIGlmIChmaXJzdCkgZmlyc3QgPSBjbGVhckVtcHR5U3BhbnMoZmlyc3QpO1xuICAgIGlmIChsYXN0ICYmIGxhc3QgIT0gZmlyc3QpIGxhc3QgPSBjbGVhckVtcHR5U3BhbnMobGFzdCk7XG5cbiAgICB2YXIgbmV3TWFya2VycyA9IFtmaXJzdF07XG4gICAgaWYgKCFzYW1lTGluZSkge1xuICAgICAgLy8gRmlsbCBnYXAgd2l0aCB3aG9sZS1saW5lLXNwYW5zXG4gICAgICB2YXIgZ2FwID0gY2hhbmdlLnRleHQubGVuZ3RoIC0gMiwgZ2FwTWFya2VycztcbiAgICAgIGlmIChnYXAgPiAwICYmIGZpcnN0KVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpcnN0Lmxlbmd0aDsgKytpKVxuICAgICAgICAgIGlmIChmaXJzdFtpXS50byA9PSBudWxsKVxuICAgICAgICAgICAgKGdhcE1hcmtlcnMgfHwgKGdhcE1hcmtlcnMgPSBbXSkpLnB1c2gobmV3IE1hcmtlZFNwYW4oZmlyc3RbaV0ubWFya2VyLCBudWxsLCBudWxsKSk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdhcDsgKytpKVxuICAgICAgICBuZXdNYXJrZXJzLnB1c2goZ2FwTWFya2Vycyk7XG4gICAgICBuZXdNYXJrZXJzLnB1c2gobGFzdCk7XG4gICAgfVxuICAgIHJldHVybiBuZXdNYXJrZXJzO1xuICB9XG5cbiAgLy8gUmVtb3ZlIHNwYW5zIHRoYXQgYXJlIGVtcHR5IGFuZCBkb24ndCBoYXZlIGEgY2xlYXJXaGVuRW1wdHlcbiAgLy8gb3B0aW9uIG9mIGZhbHNlLlxuICBmdW5jdGlvbiBjbGVhckVtcHR5U3BhbnMoc3BhbnMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNwYW5zLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgc3BhbiA9IHNwYW5zW2ldO1xuICAgICAgaWYgKHNwYW4uZnJvbSAhPSBudWxsICYmIHNwYW4uZnJvbSA9PSBzcGFuLnRvICYmIHNwYW4ubWFya2VyLmNsZWFyV2hlbkVtcHR5ICE9PSBmYWxzZSlcbiAgICAgICAgc3BhbnMuc3BsaWNlKGktLSwgMSk7XG4gICAgfVxuICAgIGlmICghc3BhbnMubGVuZ3RoKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gc3BhbnM7XG4gIH1cblxuICAvLyBVc2VkIGZvciB1bi9yZS1kb2luZyBjaGFuZ2VzIGZyb20gdGhlIGhpc3RvcnkuIENvbWJpbmVzIHRoZVxuICAvLyByZXN1bHQgb2YgY29tcHV0aW5nIHRoZSBleGlzdGluZyBzcGFucyB3aXRoIHRoZSBzZXQgb2Ygc3BhbnMgdGhhdFxuICAvLyBleGlzdGVkIGluIHRoZSBoaXN0b3J5IChzbyB0aGF0IGRlbGV0aW5nIGFyb3VuZCBhIHNwYW4gYW5kIHRoZW5cbiAgLy8gdW5kb2luZyBicmluZ3MgYmFjayB0aGUgc3BhbikuXG4gIGZ1bmN0aW9uIG1lcmdlT2xkU3BhbnMoZG9jLCBjaGFuZ2UpIHtcbiAgICB2YXIgb2xkID0gZ2V0T2xkU3BhbnMoZG9jLCBjaGFuZ2UpO1xuICAgIHZhciBzdHJldGNoZWQgPSBzdHJldGNoU3BhbnNPdmVyQ2hhbmdlKGRvYywgY2hhbmdlKTtcbiAgICBpZiAoIW9sZCkgcmV0dXJuIHN0cmV0Y2hlZDtcbiAgICBpZiAoIXN0cmV0Y2hlZCkgcmV0dXJuIG9sZDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb2xkLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgb2xkQ3VyID0gb2xkW2ldLCBzdHJldGNoQ3VyID0gc3RyZXRjaGVkW2ldO1xuICAgICAgaWYgKG9sZEN1ciAmJiBzdHJldGNoQ3VyKSB7XG4gICAgICAgIHNwYW5zOiBmb3IgKHZhciBqID0gMDsgaiA8IHN0cmV0Y2hDdXIubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICB2YXIgc3BhbiA9IHN0cmV0Y2hDdXJbal07XG4gICAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBvbGRDdXIubGVuZ3RoOyArK2spXG4gICAgICAgICAgICBpZiAob2xkQ3VyW2tdLm1hcmtlciA9PSBzcGFuLm1hcmtlcikgY29udGludWUgc3BhbnM7XG4gICAgICAgICAgb2xkQ3VyLnB1c2goc3Bhbik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoc3RyZXRjaEN1cikge1xuICAgICAgICBvbGRbaV0gPSBzdHJldGNoQ3VyO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2xkO1xuICB9XG5cbiAgLy8gVXNlZCB0byAnY2xpcCcgb3V0IHJlYWRPbmx5IHJhbmdlcyB3aGVuIG1ha2luZyBhIGNoYW5nZS5cbiAgZnVuY3Rpb24gcmVtb3ZlUmVhZE9ubHlSYW5nZXMoZG9jLCBmcm9tLCB0bykge1xuICAgIHZhciBtYXJrZXJzID0gbnVsbDtcbiAgICBkb2MuaXRlcihmcm9tLmxpbmUsIHRvLmxpbmUgKyAxLCBmdW5jdGlvbihsaW5lKSB7XG4gICAgICBpZiAobGluZS5tYXJrZWRTcGFucykgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lLm1hcmtlZFNwYW5zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBtYXJrID0gbGluZS5tYXJrZWRTcGFuc1tpXS5tYXJrZXI7XG4gICAgICAgIGlmIChtYXJrLnJlYWRPbmx5ICYmICghbWFya2VycyB8fCBpbmRleE9mKG1hcmtlcnMsIG1hcmspID09IC0xKSlcbiAgICAgICAgICAobWFya2VycyB8fCAobWFya2VycyA9IFtdKSkucHVzaChtYXJrKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoIW1hcmtlcnMpIHJldHVybiBudWxsO1xuICAgIHZhciBwYXJ0cyA9IFt7ZnJvbTogZnJvbSwgdG86IHRvfV07XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXJrZXJzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgbWsgPSBtYXJrZXJzW2ldLCBtID0gbWsuZmluZCgwKTtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcGFydHMubGVuZ3RoOyArK2opIHtcbiAgICAgICAgdmFyIHAgPSBwYXJ0c1tqXTtcbiAgICAgICAgaWYgKGNtcChwLnRvLCBtLmZyb20pIDwgMCB8fCBjbXAocC5mcm9tLCBtLnRvKSA+IDApIGNvbnRpbnVlO1xuICAgICAgICB2YXIgbmV3UGFydHMgPSBbaiwgMV0sIGRmcm9tID0gY21wKHAuZnJvbSwgbS5mcm9tKSwgZHRvID0gY21wKHAudG8sIG0udG8pO1xuICAgICAgICBpZiAoZGZyb20gPCAwIHx8ICFtay5pbmNsdXNpdmVMZWZ0ICYmICFkZnJvbSlcbiAgICAgICAgICBuZXdQYXJ0cy5wdXNoKHtmcm9tOiBwLmZyb20sIHRvOiBtLmZyb219KTtcbiAgICAgICAgaWYgKGR0byA+IDAgfHwgIW1rLmluY2x1c2l2ZVJpZ2h0ICYmICFkdG8pXG4gICAgICAgICAgbmV3UGFydHMucHVzaCh7ZnJvbTogbS50bywgdG86IHAudG99KTtcbiAgICAgICAgcGFydHMuc3BsaWNlLmFwcGx5KHBhcnRzLCBuZXdQYXJ0cyk7XG4gICAgICAgIGogKz0gbmV3UGFydHMubGVuZ3RoIC0gMTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBhcnRzO1xuICB9XG5cbiAgLy8gQ29ubmVjdCBvciBkaXNjb25uZWN0IHNwYW5zIGZyb20gYSBsaW5lLlxuICBmdW5jdGlvbiBkZXRhY2hNYXJrZWRTcGFucyhsaW5lKSB7XG4gICAgdmFyIHNwYW5zID0gbGluZS5tYXJrZWRTcGFucztcbiAgICBpZiAoIXNwYW5zKSByZXR1cm47XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcGFucy5sZW5ndGg7ICsraSlcbiAgICAgIHNwYW5zW2ldLm1hcmtlci5kZXRhY2hMaW5lKGxpbmUpO1xuICAgIGxpbmUubWFya2VkU3BhbnMgPSBudWxsO1xuICB9XG4gIGZ1bmN0aW9uIGF0dGFjaE1hcmtlZFNwYW5zKGxpbmUsIHNwYW5zKSB7XG4gICAgaWYgKCFzcGFucykgcmV0dXJuO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3BhbnMubGVuZ3RoOyArK2kpXG4gICAgICBzcGFuc1tpXS5tYXJrZXIuYXR0YWNoTGluZShsaW5lKTtcbiAgICBsaW5lLm1hcmtlZFNwYW5zID0gc3BhbnM7XG4gIH1cblxuICAvLyBIZWxwZXJzIHVzZWQgd2hlbiBjb21wdXRpbmcgd2hpY2ggb3ZlcmxhcHBpbmcgY29sbGFwc2VkIHNwYW5cbiAgLy8gY291bnRzIGFzIHRoZSBsYXJnZXIgb25lLlxuICBmdW5jdGlvbiBleHRyYUxlZnQobWFya2VyKSB7IHJldHVybiBtYXJrZXIuaW5jbHVzaXZlTGVmdCA/IC0xIDogMDsgfVxuICBmdW5jdGlvbiBleHRyYVJpZ2h0KG1hcmtlcikgeyByZXR1cm4gbWFya2VyLmluY2x1c2l2ZVJpZ2h0ID8gMSA6IDA7IH1cblxuICAvLyBSZXR1cm5zIGEgbnVtYmVyIGluZGljYXRpbmcgd2hpY2ggb2YgdHdvIG92ZXJsYXBwaW5nIGNvbGxhcHNlZFxuICAvLyBzcGFucyBpcyBsYXJnZXIgKGFuZCB0aHVzIGluY2x1ZGVzIHRoZSBvdGhlcikuIEZhbGxzIGJhY2sgdG9cbiAgLy8gY29tcGFyaW5nIGlkcyB3aGVuIHRoZSBzcGFucyBjb3ZlciBleGFjdGx5IHRoZSBzYW1lIHJhbmdlLlxuICBmdW5jdGlvbiBjb21wYXJlQ29sbGFwc2VkTWFya2VycyhhLCBiKSB7XG4gICAgdmFyIGxlbkRpZmYgPSBhLmxpbmVzLmxlbmd0aCAtIGIubGluZXMubGVuZ3RoO1xuICAgIGlmIChsZW5EaWZmICE9IDApIHJldHVybiBsZW5EaWZmO1xuICAgIHZhciBhUG9zID0gYS5maW5kKCksIGJQb3MgPSBiLmZpbmQoKTtcbiAgICB2YXIgZnJvbUNtcCA9IGNtcChhUG9zLmZyb20sIGJQb3MuZnJvbSkgfHwgZXh0cmFMZWZ0KGEpIC0gZXh0cmFMZWZ0KGIpO1xuICAgIGlmIChmcm9tQ21wKSByZXR1cm4gLWZyb21DbXA7XG4gICAgdmFyIHRvQ21wID0gY21wKGFQb3MudG8sIGJQb3MudG8pIHx8IGV4dHJhUmlnaHQoYSkgLSBleHRyYVJpZ2h0KGIpO1xuICAgIGlmICh0b0NtcCkgcmV0dXJuIHRvQ21wO1xuICAgIHJldHVybiBiLmlkIC0gYS5pZDtcbiAgfVxuXG4gIC8vIEZpbmQgb3V0IHdoZXRoZXIgYSBsaW5lIGVuZHMgb3Igc3RhcnRzIGluIGEgY29sbGFwc2VkIHNwYW4uIElmXG4gIC8vIHNvLCByZXR1cm4gdGhlIG1hcmtlciBmb3IgdGhhdCBzcGFuLlxuICBmdW5jdGlvbiBjb2xsYXBzZWRTcGFuQXRTaWRlKGxpbmUsIHN0YXJ0KSB7XG4gICAgdmFyIHNwcyA9IHNhd0NvbGxhcHNlZFNwYW5zICYmIGxpbmUubWFya2VkU3BhbnMsIGZvdW5kO1xuICAgIGlmIChzcHMpIGZvciAodmFyIHNwLCBpID0gMDsgaSA8IHNwcy5sZW5ndGg7ICsraSkge1xuICAgICAgc3AgPSBzcHNbaV07XG4gICAgICBpZiAoc3AubWFya2VyLmNvbGxhcHNlZCAmJiAoc3RhcnQgPyBzcC5mcm9tIDogc3AudG8pID09IG51bGwgJiZcbiAgICAgICAgICAoIWZvdW5kIHx8IGNvbXBhcmVDb2xsYXBzZWRNYXJrZXJzKGZvdW5kLCBzcC5tYXJrZXIpIDwgMCkpXG4gICAgICAgIGZvdW5kID0gc3AubWFya2VyO1xuICAgIH1cbiAgICByZXR1cm4gZm91bmQ7XG4gIH1cbiAgZnVuY3Rpb24gY29sbGFwc2VkU3BhbkF0U3RhcnQobGluZSkgeyByZXR1cm4gY29sbGFwc2VkU3BhbkF0U2lkZShsaW5lLCB0cnVlKTsgfVxuICBmdW5jdGlvbiBjb2xsYXBzZWRTcGFuQXRFbmQobGluZSkgeyByZXR1cm4gY29sbGFwc2VkU3BhbkF0U2lkZShsaW5lLCBmYWxzZSk7IH1cblxuICAvLyBUZXN0IHdoZXRoZXIgdGhlcmUgZXhpc3RzIGEgY29sbGFwc2VkIHNwYW4gdGhhdCBwYXJ0aWFsbHlcbiAgLy8gb3ZlcmxhcHMgKGNvdmVycyB0aGUgc3RhcnQgb3IgZW5kLCBidXQgbm90IGJvdGgpIG9mIGEgbmV3IHNwYW4uXG4gIC8vIFN1Y2ggb3ZlcmxhcCBpcyBub3QgYWxsb3dlZC5cbiAgZnVuY3Rpb24gY29uZmxpY3RpbmdDb2xsYXBzZWRSYW5nZShkb2MsIGxpbmVObywgZnJvbSwgdG8sIG1hcmtlcikge1xuICAgIHZhciBsaW5lID0gZ2V0TGluZShkb2MsIGxpbmVObyk7XG4gICAgdmFyIHNwcyA9IHNhd0NvbGxhcHNlZFNwYW5zICYmIGxpbmUubWFya2VkU3BhbnM7XG4gICAgaWYgKHNwcykgZm9yICh2YXIgaSA9IDA7IGkgPCBzcHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBzcCA9IHNwc1tpXTtcbiAgICAgIGlmICghc3AubWFya2VyLmNvbGxhcHNlZCkgY29udGludWU7XG4gICAgICB2YXIgZm91bmQgPSBzcC5tYXJrZXIuZmluZCgwKTtcbiAgICAgIHZhciBmcm9tQ21wID0gY21wKGZvdW5kLmZyb20sIGZyb20pIHx8IGV4dHJhTGVmdChzcC5tYXJrZXIpIC0gZXh0cmFMZWZ0KG1hcmtlcik7XG4gICAgICB2YXIgdG9DbXAgPSBjbXAoZm91bmQudG8sIHRvKSB8fCBleHRyYVJpZ2h0KHNwLm1hcmtlcikgLSBleHRyYVJpZ2h0KG1hcmtlcik7XG4gICAgICBpZiAoZnJvbUNtcCA+PSAwICYmIHRvQ21wIDw9IDAgfHwgZnJvbUNtcCA8PSAwICYmIHRvQ21wID49IDApIGNvbnRpbnVlO1xuICAgICAgaWYgKGZyb21DbXAgPD0gMCAmJiAoY21wKGZvdW5kLnRvLCBmcm9tKSB8fCBleHRyYVJpZ2h0KHNwLm1hcmtlcikgLSBleHRyYUxlZnQobWFya2VyKSkgPiAwIHx8XG4gICAgICAgICAgZnJvbUNtcCA+PSAwICYmIChjbXAoZm91bmQuZnJvbSwgdG8pIHx8IGV4dHJhTGVmdChzcC5tYXJrZXIpIC0gZXh0cmFSaWdodChtYXJrZXIpKSA8IDApXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIC8vIEEgdmlzdWFsIGxpbmUgaXMgYSBsaW5lIGFzIGRyYXduIG9uIHRoZSBzY3JlZW4uIEZvbGRpbmcsIGZvclxuICAvLyBleGFtcGxlLCBjYW4gY2F1c2UgbXVsdGlwbGUgbG9naWNhbCBsaW5lcyB0byBhcHBlYXIgb24gdGhlIHNhbWVcbiAgLy8gdmlzdWFsIGxpbmUuIFRoaXMgZmluZHMgdGhlIHN0YXJ0IG9mIHRoZSB2aXN1YWwgbGluZSB0aGF0IHRoZVxuICAvLyBnaXZlbiBsaW5lIGlzIHBhcnQgb2YgKHVzdWFsbHkgdGhhdCBpcyB0aGUgbGluZSBpdHNlbGYpLlxuICBmdW5jdGlvbiB2aXN1YWxMaW5lKGxpbmUpIHtcbiAgICB2YXIgbWVyZ2VkO1xuICAgIHdoaWxlIChtZXJnZWQgPSBjb2xsYXBzZWRTcGFuQXRTdGFydChsaW5lKSlcbiAgICAgIGxpbmUgPSBtZXJnZWQuZmluZCgtMSwgdHJ1ZSkubGluZTtcbiAgICByZXR1cm4gbGluZTtcbiAgfVxuXG4gIC8vIFJldHVybnMgYW4gYXJyYXkgb2YgbG9naWNhbCBsaW5lcyB0aGF0IGNvbnRpbnVlIHRoZSB2aXN1YWwgbGluZVxuICAvLyBzdGFydGVkIGJ5IHRoZSBhcmd1bWVudCwgb3IgdW5kZWZpbmVkIGlmIHRoZXJlIGFyZSBubyBzdWNoIGxpbmVzLlxuICBmdW5jdGlvbiB2aXN1YWxMaW5lQ29udGludWVkKGxpbmUpIHtcbiAgICB2YXIgbWVyZ2VkLCBsaW5lcztcbiAgICB3aGlsZSAobWVyZ2VkID0gY29sbGFwc2VkU3BhbkF0RW5kKGxpbmUpKSB7XG4gICAgICBsaW5lID0gbWVyZ2VkLmZpbmQoMSwgdHJ1ZSkubGluZTtcbiAgICAgIChsaW5lcyB8fCAobGluZXMgPSBbXSkpLnB1c2gobGluZSk7XG4gICAgfVxuICAgIHJldHVybiBsaW5lcztcbiAgfVxuXG4gIC8vIEdldCB0aGUgbGluZSBudW1iZXIgb2YgdGhlIHN0YXJ0IG9mIHRoZSB2aXN1YWwgbGluZSB0aGF0IHRoZVxuICAvLyBnaXZlbiBsaW5lIG51bWJlciBpcyBwYXJ0IG9mLlxuICBmdW5jdGlvbiB2aXN1YWxMaW5lTm8oZG9jLCBsaW5lTikge1xuICAgIHZhciBsaW5lID0gZ2V0TGluZShkb2MsIGxpbmVOKSwgdmlzID0gdmlzdWFsTGluZShsaW5lKTtcbiAgICBpZiAobGluZSA9PSB2aXMpIHJldHVybiBsaW5lTjtcbiAgICByZXR1cm4gbGluZU5vKHZpcyk7XG4gIH1cbiAgLy8gR2V0IHRoZSBsaW5lIG51bWJlciBvZiB0aGUgc3RhcnQgb2YgdGhlIG5leHQgdmlzdWFsIGxpbmUgYWZ0ZXJcbiAgLy8gdGhlIGdpdmVuIGxpbmUuXG4gIGZ1bmN0aW9uIHZpc3VhbExpbmVFbmRObyhkb2MsIGxpbmVOKSB7XG4gICAgaWYgKGxpbmVOID4gZG9jLmxhc3RMaW5lKCkpIHJldHVybiBsaW5lTjtcbiAgICB2YXIgbGluZSA9IGdldExpbmUoZG9jLCBsaW5lTiksIG1lcmdlZDtcbiAgICBpZiAoIWxpbmVJc0hpZGRlbihkb2MsIGxpbmUpKSByZXR1cm4gbGluZU47XG4gICAgd2hpbGUgKG1lcmdlZCA9IGNvbGxhcHNlZFNwYW5BdEVuZChsaW5lKSlcbiAgICAgIGxpbmUgPSBtZXJnZWQuZmluZCgxLCB0cnVlKS5saW5lO1xuICAgIHJldHVybiBsaW5lTm8obGluZSkgKyAxO1xuICB9XG5cbiAgLy8gQ29tcHV0ZSB3aGV0aGVyIGEgbGluZSBpcyBoaWRkZW4uIExpbmVzIGNvdW50IGFzIGhpZGRlbiB3aGVuIHRoZXlcbiAgLy8gYXJlIHBhcnQgb2YgYSB2aXN1YWwgbGluZSB0aGF0IHN0YXJ0cyB3aXRoIGFub3RoZXIgbGluZSwgb3Igd2hlblxuICAvLyB0aGV5IGFyZSBlbnRpcmVseSBjb3ZlcmVkIGJ5IGNvbGxhcHNlZCwgbm9uLXdpZGdldCBzcGFuLlxuICBmdW5jdGlvbiBsaW5lSXNIaWRkZW4oZG9jLCBsaW5lKSB7XG4gICAgdmFyIHNwcyA9IHNhd0NvbGxhcHNlZFNwYW5zICYmIGxpbmUubWFya2VkU3BhbnM7XG4gICAgaWYgKHNwcykgZm9yICh2YXIgc3AsIGkgPSAwOyBpIDwgc3BzLmxlbmd0aDsgKytpKSB7XG4gICAgICBzcCA9IHNwc1tpXTtcbiAgICAgIGlmICghc3AubWFya2VyLmNvbGxhcHNlZCkgY29udGludWU7XG4gICAgICBpZiAoc3AuZnJvbSA9PSBudWxsKSByZXR1cm4gdHJ1ZTtcbiAgICAgIGlmIChzcC5tYXJrZXIud2lkZ2V0Tm9kZSkgY29udGludWU7XG4gICAgICBpZiAoc3AuZnJvbSA9PSAwICYmIHNwLm1hcmtlci5pbmNsdXNpdmVMZWZ0ICYmIGxpbmVJc0hpZGRlbklubmVyKGRvYywgbGluZSwgc3ApKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gbGluZUlzSGlkZGVuSW5uZXIoZG9jLCBsaW5lLCBzcGFuKSB7XG4gICAgaWYgKHNwYW4udG8gPT0gbnVsbCkge1xuICAgICAgdmFyIGVuZCA9IHNwYW4ubWFya2VyLmZpbmQoMSwgdHJ1ZSk7XG4gICAgICByZXR1cm4gbGluZUlzSGlkZGVuSW5uZXIoZG9jLCBlbmQubGluZSwgZ2V0TWFya2VkU3BhbkZvcihlbmQubGluZS5tYXJrZWRTcGFucywgc3Bhbi5tYXJrZXIpKTtcbiAgICB9XG4gICAgaWYgKHNwYW4ubWFya2VyLmluY2x1c2l2ZVJpZ2h0ICYmIHNwYW4udG8gPT0gbGluZS50ZXh0Lmxlbmd0aClcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGZvciAodmFyIHNwLCBpID0gMDsgaSA8IGxpbmUubWFya2VkU3BhbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHNwID0gbGluZS5tYXJrZWRTcGFuc1tpXTtcbiAgICAgIGlmIChzcC5tYXJrZXIuY29sbGFwc2VkICYmICFzcC5tYXJrZXIud2lkZ2V0Tm9kZSAmJiBzcC5mcm9tID09IHNwYW4udG8gJiZcbiAgICAgICAgICAoc3AudG8gPT0gbnVsbCB8fCBzcC50byAhPSBzcGFuLmZyb20pICYmXG4gICAgICAgICAgKHNwLm1hcmtlci5pbmNsdXNpdmVMZWZ0IHx8IHNwYW4ubWFya2VyLmluY2x1c2l2ZVJpZ2h0KSAmJlxuICAgICAgICAgIGxpbmVJc0hpZGRlbklubmVyKGRvYywgbGluZSwgc3ApKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvLyBMSU5FIFdJREdFVFNcblxuICAvLyBMaW5lIHdpZGdldHMgYXJlIGJsb2NrIGVsZW1lbnRzIGRpc3BsYXllZCBhYm92ZSBvciBiZWxvdyBhIGxpbmUuXG5cbiAgdmFyIExpbmVXaWRnZXQgPSBDb2RlTWlycm9yLkxpbmVXaWRnZXQgPSBmdW5jdGlvbihjbSwgbm9kZSwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zKSBmb3IgKHZhciBvcHQgaW4gb3B0aW9ucykgaWYgKG9wdGlvbnMuaGFzT3duUHJvcGVydHkob3B0KSlcbiAgICAgIHRoaXNbb3B0XSA9IG9wdGlvbnNbb3B0XTtcbiAgICB0aGlzLmNtID0gY207XG4gICAgdGhpcy5ub2RlID0gbm9kZTtcbiAgfTtcbiAgZXZlbnRNaXhpbihMaW5lV2lkZ2V0KTtcblxuICBmdW5jdGlvbiBhZGp1c3RTY3JvbGxXaGVuQWJvdmVWaXNpYmxlKGNtLCBsaW5lLCBkaWZmKSB7XG4gICAgaWYgKGhlaWdodEF0TGluZShsaW5lKSA8ICgoY20uY3VyT3AgJiYgY20uY3VyT3Auc2Nyb2xsVG9wKSB8fCBjbS5kb2Muc2Nyb2xsVG9wKSlcbiAgICAgIGFkZFRvU2Nyb2xsUG9zKGNtLCBudWxsLCBkaWZmKTtcbiAgfVxuXG4gIExpbmVXaWRnZXQucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNtID0gdGhpcy5jbSwgd3MgPSB0aGlzLmxpbmUud2lkZ2V0cywgbGluZSA9IHRoaXMubGluZSwgbm8gPSBsaW5lTm8obGluZSk7XG4gICAgaWYgKG5vID09IG51bGwgfHwgIXdzKSByZXR1cm47XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB3cy5sZW5ndGg7ICsraSkgaWYgKHdzW2ldID09IHRoaXMpIHdzLnNwbGljZShpLS0sIDEpO1xuICAgIGlmICghd3MubGVuZ3RoKSBsaW5lLndpZGdldHMgPSBudWxsO1xuICAgIHZhciBoZWlnaHQgPSB3aWRnZXRIZWlnaHQodGhpcyk7XG4gICAgcnVuSW5PcChjbSwgZnVuY3Rpb24oKSB7XG4gICAgICBhZGp1c3RTY3JvbGxXaGVuQWJvdmVWaXNpYmxlKGNtLCBsaW5lLCAtaGVpZ2h0KTtcbiAgICAgIHJlZ0xpbmVDaGFuZ2UoY20sIG5vLCBcIndpZGdldFwiKTtcbiAgICAgIHVwZGF0ZUxpbmVIZWlnaHQobGluZSwgTWF0aC5tYXgoMCwgbGluZS5oZWlnaHQgLSBoZWlnaHQpKTtcbiAgICB9KTtcbiAgfTtcbiAgTGluZVdpZGdldC5wcm90b3R5cGUuY2hhbmdlZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvbGRIID0gdGhpcy5oZWlnaHQsIGNtID0gdGhpcy5jbSwgbGluZSA9IHRoaXMubGluZTtcbiAgICB0aGlzLmhlaWdodCA9IG51bGw7XG4gICAgdmFyIGRpZmYgPSB3aWRnZXRIZWlnaHQodGhpcykgLSBvbGRIO1xuICAgIGlmICghZGlmZikgcmV0dXJuO1xuICAgIHJ1bkluT3AoY20sIGZ1bmN0aW9uKCkge1xuICAgICAgY20uY3VyT3AuZm9yY2VVcGRhdGUgPSB0cnVlO1xuICAgICAgYWRqdXN0U2Nyb2xsV2hlbkFib3ZlVmlzaWJsZShjbSwgbGluZSwgZGlmZik7XG4gICAgICB1cGRhdGVMaW5lSGVpZ2h0KGxpbmUsIGxpbmUuaGVpZ2h0ICsgZGlmZik7XG4gICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gd2lkZ2V0SGVpZ2h0KHdpZGdldCkge1xuICAgIGlmICh3aWRnZXQuaGVpZ2h0ICE9IG51bGwpIHJldHVybiB3aWRnZXQuaGVpZ2h0O1xuICAgIGlmICghY29udGFpbnMoZG9jdW1lbnQuYm9keSwgd2lkZ2V0Lm5vZGUpKVxuICAgICAgcmVtb3ZlQ2hpbGRyZW5BbmRBZGQod2lkZ2V0LmNtLmRpc3BsYXkubWVhc3VyZSwgZWx0KFwiZGl2XCIsIFt3aWRnZXQubm9kZV0sIG51bGwsIFwicG9zaXRpb246IHJlbGF0aXZlXCIpKTtcbiAgICByZXR1cm4gd2lkZ2V0LmhlaWdodCA9IHdpZGdldC5ub2RlLm9mZnNldEhlaWdodDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZExpbmVXaWRnZXQoY20sIGhhbmRsZSwgbm9kZSwgb3B0aW9ucykge1xuICAgIHZhciB3aWRnZXQgPSBuZXcgTGluZVdpZGdldChjbSwgbm9kZSwgb3B0aW9ucyk7XG4gICAgaWYgKHdpZGdldC5ub0hTY3JvbGwpIGNtLmRpc3BsYXkuYWxpZ25XaWRnZXRzID0gdHJ1ZTtcbiAgICBjaGFuZ2VMaW5lKGNtLCBoYW5kbGUsIFwid2lkZ2V0XCIsIGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIHZhciB3aWRnZXRzID0gbGluZS53aWRnZXRzIHx8IChsaW5lLndpZGdldHMgPSBbXSk7XG4gICAgICBpZiAod2lkZ2V0Lmluc2VydEF0ID09IG51bGwpIHdpZGdldHMucHVzaCh3aWRnZXQpO1xuICAgICAgZWxzZSB3aWRnZXRzLnNwbGljZShNYXRoLm1pbih3aWRnZXRzLmxlbmd0aCAtIDEsIE1hdGgubWF4KDAsIHdpZGdldC5pbnNlcnRBdCkpLCAwLCB3aWRnZXQpO1xuICAgICAgd2lkZ2V0LmxpbmUgPSBsaW5lO1xuICAgICAgaWYgKCFsaW5lSXNIaWRkZW4oY20uZG9jLCBsaW5lKSkge1xuICAgICAgICB2YXIgYWJvdmVWaXNpYmxlID0gaGVpZ2h0QXRMaW5lKGxpbmUpIDwgY20uZG9jLnNjcm9sbFRvcDtcbiAgICAgICAgdXBkYXRlTGluZUhlaWdodChsaW5lLCBsaW5lLmhlaWdodCArIHdpZGdldEhlaWdodCh3aWRnZXQpKTtcbiAgICAgICAgaWYgKGFib3ZlVmlzaWJsZSkgYWRkVG9TY3JvbGxQb3MoY20sIG51bGwsIHdpZGdldC5oZWlnaHQpO1xuICAgICAgICBjbS5jdXJPcC5mb3JjZVVwZGF0ZSA9IHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcbiAgICByZXR1cm4gd2lkZ2V0O1xuICB9XG5cbiAgLy8gTElORSBEQVRBIFNUUlVDVFVSRVxuXG4gIC8vIExpbmUgb2JqZWN0cy4gVGhlc2UgaG9sZCBzdGF0ZSByZWxhdGVkIHRvIGEgbGluZSwgaW5jbHVkaW5nXG4gIC8vIGhpZ2hsaWdodGluZyBpbmZvICh0aGUgc3R5bGVzIGFycmF5KS5cbiAgdmFyIExpbmUgPSBDb2RlTWlycm9yLkxpbmUgPSBmdW5jdGlvbih0ZXh0LCBtYXJrZWRTcGFucywgZXN0aW1hdGVIZWlnaHQpIHtcbiAgICB0aGlzLnRleHQgPSB0ZXh0O1xuICAgIGF0dGFjaE1hcmtlZFNwYW5zKHRoaXMsIG1hcmtlZFNwYW5zKTtcbiAgICB0aGlzLmhlaWdodCA9IGVzdGltYXRlSGVpZ2h0ID8gZXN0aW1hdGVIZWlnaHQodGhpcykgOiAxO1xuICB9O1xuICBldmVudE1peGluKExpbmUpO1xuICBMaW5lLnByb3RvdHlwZS5saW5lTm8gPSBmdW5jdGlvbigpIHsgcmV0dXJuIGxpbmVObyh0aGlzKTsgfTtcblxuICAvLyBDaGFuZ2UgdGhlIGNvbnRlbnQgKHRleHQsIG1hcmtlcnMpIG9mIGEgbGluZS4gQXV0b21hdGljYWxseVxuICAvLyBpbnZhbGlkYXRlcyBjYWNoZWQgaW5mb3JtYXRpb24gYW5kIHRyaWVzIHRvIHJlLWVzdGltYXRlIHRoZVxuICAvLyBsaW5lJ3MgaGVpZ2h0LlxuICBmdW5jdGlvbiB1cGRhdGVMaW5lKGxpbmUsIHRleHQsIG1hcmtlZFNwYW5zLCBlc3RpbWF0ZUhlaWdodCkge1xuICAgIGxpbmUudGV4dCA9IHRleHQ7XG4gICAgaWYgKGxpbmUuc3RhdGVBZnRlcikgbGluZS5zdGF0ZUFmdGVyID0gbnVsbDtcbiAgICBpZiAobGluZS5zdHlsZXMpIGxpbmUuc3R5bGVzID0gbnVsbDtcbiAgICBpZiAobGluZS5vcmRlciAhPSBudWxsKSBsaW5lLm9yZGVyID0gbnVsbDtcbiAgICBkZXRhY2hNYXJrZWRTcGFucyhsaW5lKTtcbiAgICBhdHRhY2hNYXJrZWRTcGFucyhsaW5lLCBtYXJrZWRTcGFucyk7XG4gICAgdmFyIGVzdEhlaWdodCA9IGVzdGltYXRlSGVpZ2h0ID8gZXN0aW1hdGVIZWlnaHQobGluZSkgOiAxO1xuICAgIGlmIChlc3RIZWlnaHQgIT0gbGluZS5oZWlnaHQpIHVwZGF0ZUxpbmVIZWlnaHQobGluZSwgZXN0SGVpZ2h0KTtcbiAgfVxuXG4gIC8vIERldGFjaCBhIGxpbmUgZnJvbSB0aGUgZG9jdW1lbnQgdHJlZSBhbmQgaXRzIG1hcmtlcnMuXG4gIGZ1bmN0aW9uIGNsZWFuVXBMaW5lKGxpbmUpIHtcbiAgICBsaW5lLnBhcmVudCA9IG51bGw7XG4gICAgZGV0YWNoTWFya2VkU3BhbnMobGluZSk7XG4gIH1cblxuICBmdW5jdGlvbiBleHRyYWN0TGluZUNsYXNzZXModHlwZSwgb3V0cHV0KSB7XG4gICAgaWYgKHR5cGUpIGZvciAoOzspIHtcbiAgICAgIHZhciBsaW5lQ2xhc3MgPSB0eXBlLm1hdGNoKC8oPzpefFxccyspbGluZS0oYmFja2dyb3VuZC0pPyhcXFMrKS8pO1xuICAgICAgaWYgKCFsaW5lQ2xhc3MpIGJyZWFrO1xuICAgICAgdHlwZSA9IHR5cGUuc2xpY2UoMCwgbGluZUNsYXNzLmluZGV4KSArIHR5cGUuc2xpY2UobGluZUNsYXNzLmluZGV4ICsgbGluZUNsYXNzWzBdLmxlbmd0aCk7XG4gICAgICB2YXIgcHJvcCA9IGxpbmVDbGFzc1sxXSA/IFwiYmdDbGFzc1wiIDogXCJ0ZXh0Q2xhc3NcIjtcbiAgICAgIGlmIChvdXRwdXRbcHJvcF0gPT0gbnVsbClcbiAgICAgICAgb3V0cHV0W3Byb3BdID0gbGluZUNsYXNzWzJdO1xuICAgICAgZWxzZSBpZiAoIShuZXcgUmVnRXhwKFwiKD86XnxcXHMpXCIgKyBsaW5lQ2xhc3NbMl0gKyBcIig/OiR8XFxzKVwiKSkudGVzdChvdXRwdXRbcHJvcF0pKVxuICAgICAgICBvdXRwdXRbcHJvcF0gKz0gXCIgXCIgKyBsaW5lQ2xhc3NbMl07XG4gICAgfVxuICAgIHJldHVybiB0eXBlO1xuICB9XG5cbiAgZnVuY3Rpb24gY2FsbEJsYW5rTGluZShtb2RlLCBzdGF0ZSkge1xuICAgIGlmIChtb2RlLmJsYW5rTGluZSkgcmV0dXJuIG1vZGUuYmxhbmtMaW5lKHN0YXRlKTtcbiAgICBpZiAoIW1vZGUuaW5uZXJNb2RlKSByZXR1cm47XG4gICAgdmFyIGlubmVyID0gQ29kZU1pcnJvci5pbm5lck1vZGUobW9kZSwgc3RhdGUpO1xuICAgIGlmIChpbm5lci5tb2RlLmJsYW5rTGluZSkgcmV0dXJuIGlubmVyLm1vZGUuYmxhbmtMaW5lKGlubmVyLnN0YXRlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRUb2tlbihtb2RlLCBzdHJlYW0sIHN0YXRlKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgICB2YXIgc3R5bGUgPSBtb2RlLnRva2VuKHN0cmVhbSwgc3RhdGUpO1xuICAgICAgaWYgKHN0cmVhbS5wb3MgPiBzdHJlYW0uc3RhcnQpIHJldHVybiBzdHlsZTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTW9kZSBcIiArIG1vZGUubmFtZSArIFwiIGZhaWxlZCB0byBhZHZhbmNlIHN0cmVhbS5cIik7XG4gIH1cblxuICAvLyBSdW4gdGhlIGdpdmVuIG1vZGUncyBwYXJzZXIgb3ZlciBhIGxpbmUsIGNhbGxpbmcgZiBmb3IgZWFjaCB0b2tlbi5cbiAgZnVuY3Rpb24gcnVuTW9kZShjbSwgdGV4dCwgbW9kZSwgc3RhdGUsIGYsIGxpbmVDbGFzc2VzLCBmb3JjZVRvRW5kKSB7XG4gICAgdmFyIGZsYXR0ZW5TcGFucyA9IG1vZGUuZmxhdHRlblNwYW5zO1xuICAgIGlmIChmbGF0dGVuU3BhbnMgPT0gbnVsbCkgZmxhdHRlblNwYW5zID0gY20ub3B0aW9ucy5mbGF0dGVuU3BhbnM7XG4gICAgdmFyIGN1clN0YXJ0ID0gMCwgY3VyU3R5bGUgPSBudWxsO1xuICAgIHZhciBzdHJlYW0gPSBuZXcgU3RyaW5nU3RyZWFtKHRleHQsIGNtLm9wdGlvbnMudGFiU2l6ZSksIHN0eWxlO1xuICAgIGlmICh0ZXh0ID09IFwiXCIpIGV4dHJhY3RMaW5lQ2xhc3NlcyhjYWxsQmxhbmtMaW5lKG1vZGUsIHN0YXRlKSwgbGluZUNsYXNzZXMpO1xuICAgIHdoaWxlICghc3RyZWFtLmVvbCgpKSB7XG4gICAgICBpZiAoc3RyZWFtLnBvcyA+IGNtLm9wdGlvbnMubWF4SGlnaGxpZ2h0TGVuZ3RoKSB7XG4gICAgICAgIGZsYXR0ZW5TcGFucyA9IGZhbHNlO1xuICAgICAgICBpZiAoZm9yY2VUb0VuZCkgcHJvY2Vzc0xpbmUoY20sIHRleHQsIHN0YXRlLCBzdHJlYW0ucG9zKTtcbiAgICAgICAgc3RyZWFtLnBvcyA9IHRleHQubGVuZ3RoO1xuICAgICAgICBzdHlsZSA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHlsZSA9IGV4dHJhY3RMaW5lQ2xhc3NlcyhyZWFkVG9rZW4obW9kZSwgc3RyZWFtLCBzdGF0ZSksIGxpbmVDbGFzc2VzKTtcbiAgICAgIH1cbiAgICAgIGlmIChjbS5vcHRpb25zLmFkZE1vZGVDbGFzcykge1xuICAgICAgICB2YXIgbU5hbWUgPSBDb2RlTWlycm9yLmlubmVyTW9kZShtb2RlLCBzdGF0ZSkubW9kZS5uYW1lO1xuICAgICAgICBpZiAobU5hbWUpIHN0eWxlID0gXCJtLVwiICsgKHN0eWxlID8gbU5hbWUgKyBcIiBcIiArIHN0eWxlIDogbU5hbWUpO1xuICAgICAgfVxuICAgICAgaWYgKCFmbGF0dGVuU3BhbnMgfHwgY3VyU3R5bGUgIT0gc3R5bGUpIHtcbiAgICAgICAgaWYgKGN1clN0YXJ0IDwgc3RyZWFtLnN0YXJ0KSBmKHN0cmVhbS5zdGFydCwgY3VyU3R5bGUpO1xuICAgICAgICBjdXJTdGFydCA9IHN0cmVhbS5zdGFydDsgY3VyU3R5bGUgPSBzdHlsZTtcbiAgICAgIH1cbiAgICAgIHN0cmVhbS5zdGFydCA9IHN0cmVhbS5wb3M7XG4gICAgfVxuICAgIHdoaWxlIChjdXJTdGFydCA8IHN0cmVhbS5wb3MpIHtcbiAgICAgIC8vIFdlYmtpdCBzZWVtcyB0byByZWZ1c2UgdG8gcmVuZGVyIHRleHQgbm9kZXMgbG9uZ2VyIHRoYW4gNTc0NDQgY2hhcmFjdGVyc1xuICAgICAgdmFyIHBvcyA9IE1hdGgubWluKHN0cmVhbS5wb3MsIGN1clN0YXJ0ICsgNTAwMDApO1xuICAgICAgZihwb3MsIGN1clN0eWxlKTtcbiAgICAgIGN1clN0YXJ0ID0gcG9zO1xuICAgIH1cbiAgfVxuXG4gIC8vIENvbXB1dGUgYSBzdHlsZSBhcnJheSAoYW4gYXJyYXkgc3RhcnRpbmcgd2l0aCBhIG1vZGUgZ2VuZXJhdGlvblxuICAvLyAtLSBmb3IgaW52YWxpZGF0aW9uIC0tIGZvbGxvd2VkIGJ5IHBhaXJzIG9mIGVuZCBwb3NpdGlvbnMgYW5kXG4gIC8vIHN0eWxlIHN0cmluZ3MpLCB3aGljaCBpcyB1c2VkIHRvIGhpZ2hsaWdodCB0aGUgdG9rZW5zIG9uIHRoZVxuICAvLyBsaW5lLlxuICBmdW5jdGlvbiBoaWdobGlnaHRMaW5lKGNtLCBsaW5lLCBzdGF0ZSwgZm9yY2VUb0VuZCkge1xuICAgIC8vIEEgc3R5bGVzIGFycmF5IGFsd2F5cyBzdGFydHMgd2l0aCBhIG51bWJlciBpZGVudGlmeWluZyB0aGVcbiAgICAvLyBtb2RlL292ZXJsYXlzIHRoYXQgaXQgaXMgYmFzZWQgb24gKGZvciBlYXN5IGludmFsaWRhdGlvbikuXG4gICAgdmFyIHN0ID0gW2NtLnN0YXRlLm1vZGVHZW5dLCBsaW5lQ2xhc3NlcyA9IHt9O1xuICAgIC8vIENvbXB1dGUgdGhlIGJhc2UgYXJyYXkgb2Ygc3R5bGVzXG4gICAgcnVuTW9kZShjbSwgbGluZS50ZXh0LCBjbS5kb2MubW9kZSwgc3RhdGUsIGZ1bmN0aW9uKGVuZCwgc3R5bGUpIHtcbiAgICAgIHN0LnB1c2goZW5kLCBzdHlsZSk7XG4gICAgfSwgbGluZUNsYXNzZXMsIGZvcmNlVG9FbmQpO1xuXG4gICAgLy8gUnVuIG92ZXJsYXlzLCBhZGp1c3Qgc3R5bGUgYXJyYXkuXG4gICAgZm9yICh2YXIgbyA9IDA7IG8gPCBjbS5zdGF0ZS5vdmVybGF5cy5sZW5ndGg7ICsrbykge1xuICAgICAgdmFyIG92ZXJsYXkgPSBjbS5zdGF0ZS5vdmVybGF5c1tvXSwgaSA9IDEsIGF0ID0gMDtcbiAgICAgIHJ1bk1vZGUoY20sIGxpbmUudGV4dCwgb3ZlcmxheS5tb2RlLCB0cnVlLCBmdW5jdGlvbihlbmQsIHN0eWxlKSB7XG4gICAgICAgIHZhciBzdGFydCA9IGk7XG4gICAgICAgIC8vIEVuc3VyZSB0aGVyZSdzIGEgdG9rZW4gZW5kIGF0IHRoZSBjdXJyZW50IHBvc2l0aW9uLCBhbmQgdGhhdCBpIHBvaW50cyBhdCBpdFxuICAgICAgICB3aGlsZSAoYXQgPCBlbmQpIHtcbiAgICAgICAgICB2YXIgaV9lbmQgPSBzdFtpXTtcbiAgICAgICAgICBpZiAoaV9lbmQgPiBlbmQpXG4gICAgICAgICAgICBzdC5zcGxpY2UoaSwgMSwgZW5kLCBzdFtpKzFdLCBpX2VuZCk7XG4gICAgICAgICAgaSArPSAyO1xuICAgICAgICAgIGF0ID0gTWF0aC5taW4oZW5kLCBpX2VuZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFzdHlsZSkgcmV0dXJuO1xuICAgICAgICBpZiAob3ZlcmxheS5vcGFxdWUpIHtcbiAgICAgICAgICBzdC5zcGxpY2Uoc3RhcnQsIGkgLSBzdGFydCwgZW5kLCBcImNtLW92ZXJsYXkgXCIgKyBzdHlsZSk7XG4gICAgICAgICAgaSA9IHN0YXJ0ICsgMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmb3IgKDsgc3RhcnQgPCBpOyBzdGFydCArPSAyKSB7XG4gICAgICAgICAgICB2YXIgY3VyID0gc3Rbc3RhcnQrMV07XG4gICAgICAgICAgICBzdFtzdGFydCsxXSA9IChjdXIgPyBjdXIgKyBcIiBcIiA6IFwiXCIpICsgXCJjbS1vdmVybGF5IFwiICsgc3R5bGU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LCBsaW5lQ2xhc3Nlcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtzdHlsZXM6IHN0LCBjbGFzc2VzOiBsaW5lQ2xhc3Nlcy5iZ0NsYXNzIHx8IGxpbmVDbGFzc2VzLnRleHRDbGFzcyA/IGxpbmVDbGFzc2VzIDogbnVsbH07XG4gIH1cblxuICBmdW5jdGlvbiBnZXRMaW5lU3R5bGVzKGNtLCBsaW5lKSB7XG4gICAgaWYgKCFsaW5lLnN0eWxlcyB8fCBsaW5lLnN0eWxlc1swXSAhPSBjbS5zdGF0ZS5tb2RlR2VuKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gaGlnaGxpZ2h0TGluZShjbSwgbGluZSwgbGluZS5zdGF0ZUFmdGVyID0gZ2V0U3RhdGVCZWZvcmUoY20sIGxpbmVObyhsaW5lKSkpO1xuICAgICAgbGluZS5zdHlsZXMgPSByZXN1bHQuc3R5bGVzO1xuICAgICAgaWYgKHJlc3VsdC5jbGFzc2VzKSBsaW5lLnN0eWxlQ2xhc3NlcyA9IHJlc3VsdC5jbGFzc2VzO1xuICAgICAgZWxzZSBpZiAobGluZS5zdHlsZUNsYXNzZXMpIGxpbmUuc3R5bGVDbGFzc2VzID0gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGxpbmUuc3R5bGVzO1xuICB9XG5cbiAgLy8gTGlnaHR3ZWlnaHQgZm9ybSBvZiBoaWdobGlnaHQgLS0gcHJvY2VlZCBvdmVyIHRoaXMgbGluZSBhbmRcbiAgLy8gdXBkYXRlIHN0YXRlLCBidXQgZG9uJ3Qgc2F2ZSBhIHN0eWxlIGFycmF5LiBVc2VkIGZvciBsaW5lcyB0aGF0XG4gIC8vIGFyZW4ndCBjdXJyZW50bHkgdmlzaWJsZS5cbiAgZnVuY3Rpb24gcHJvY2Vzc0xpbmUoY20sIHRleHQsIHN0YXRlLCBzdGFydEF0KSB7XG4gICAgdmFyIG1vZGUgPSBjbS5kb2MubW9kZTtcbiAgICB2YXIgc3RyZWFtID0gbmV3IFN0cmluZ1N0cmVhbSh0ZXh0LCBjbS5vcHRpb25zLnRhYlNpemUpO1xuICAgIHN0cmVhbS5zdGFydCA9IHN0cmVhbS5wb3MgPSBzdGFydEF0IHx8IDA7XG4gICAgaWYgKHRleHQgPT0gXCJcIikgY2FsbEJsYW5rTGluZShtb2RlLCBzdGF0ZSk7XG4gICAgd2hpbGUgKCFzdHJlYW0uZW9sKCkgJiYgc3RyZWFtLnBvcyA8PSBjbS5vcHRpb25zLm1heEhpZ2hsaWdodExlbmd0aCkge1xuICAgICAgcmVhZFRva2VuKG1vZGUsIHN0cmVhbSwgc3RhdGUpO1xuICAgICAgc3RyZWFtLnN0YXJ0ID0gc3RyZWFtLnBvcztcbiAgICB9XG4gIH1cblxuICAvLyBDb252ZXJ0IGEgc3R5bGUgYXMgcmV0dXJuZWQgYnkgYSBtb2RlIChlaXRoZXIgbnVsbCwgb3IgYSBzdHJpbmdcbiAgLy8gY29udGFpbmluZyBvbmUgb3IgbW9yZSBzdHlsZXMpIHRvIGEgQ1NTIHN0eWxlLiBUaGlzIGlzIGNhY2hlZCxcbiAgLy8gYW5kIGFsc28gbG9va3MgZm9yIGxpbmUtd2lkZSBzdHlsZXMuXG4gIHZhciBzdHlsZVRvQ2xhc3NDYWNoZSA9IHt9LCBzdHlsZVRvQ2xhc3NDYWNoZVdpdGhNb2RlID0ge307XG4gIGZ1bmN0aW9uIGludGVycHJldFRva2VuU3R5bGUoc3R5bGUsIG9wdGlvbnMpIHtcbiAgICBpZiAoIXN0eWxlIHx8IC9eXFxzKiQvLnRlc3Qoc3R5bGUpKSByZXR1cm4gbnVsbDtcbiAgICB2YXIgY2FjaGUgPSBvcHRpb25zLmFkZE1vZGVDbGFzcyA/IHN0eWxlVG9DbGFzc0NhY2hlV2l0aE1vZGUgOiBzdHlsZVRvQ2xhc3NDYWNoZTtcbiAgICByZXR1cm4gY2FjaGVbc3R5bGVdIHx8XG4gICAgICAoY2FjaGVbc3R5bGVdID0gc3R5bGUucmVwbGFjZSgvXFxTKy9nLCBcImNtLSQmXCIpKTtcbiAgfVxuXG4gIC8vIFJlbmRlciB0aGUgRE9NIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0ZXh0IG9mIGEgbGluZS4gQWxzbyBidWlsZHNcbiAgLy8gdXAgYSAnbGluZSBtYXAnLCB3aGljaCBwb2ludHMgYXQgdGhlIERPTSBub2RlcyB0aGF0IHJlcHJlc2VudFxuICAvLyBzcGVjaWZpYyBzdHJldGNoZXMgb2YgdGV4dCwgYW5kIGlzIHVzZWQgYnkgdGhlIG1lYXN1cmluZyBjb2RlLlxuICAvLyBUaGUgcmV0dXJuZWQgb2JqZWN0IGNvbnRhaW5zIHRoZSBET00gbm9kZSwgdGhpcyBtYXAsIGFuZFxuICAvLyBpbmZvcm1hdGlvbiBhYm91dCBsaW5lLXdpZGUgc3R5bGVzIHRoYXQgd2VyZSBzZXQgYnkgdGhlIG1vZGUuXG4gIGZ1bmN0aW9uIGJ1aWxkTGluZUNvbnRlbnQoY20sIGxpbmVWaWV3KSB7XG4gICAgLy8gVGhlIHBhZGRpbmctcmlnaHQgZm9yY2VzIHRoZSBlbGVtZW50IHRvIGhhdmUgYSAnYm9yZGVyJywgd2hpY2hcbiAgICAvLyBpcyBuZWVkZWQgb24gV2Via2l0IHRvIGJlIGFibGUgdG8gZ2V0IGxpbmUtbGV2ZWwgYm91bmRpbmdcbiAgICAvLyByZWN0YW5nbGVzIGZvciBpdCAoaW4gbWVhc3VyZUNoYXIpLlxuICAgIHZhciBjb250ZW50ID0gZWx0KFwic3BhblwiLCBudWxsLCBudWxsLCB3ZWJraXQgPyBcInBhZGRpbmctcmlnaHQ6IC4xcHhcIiA6IG51bGwpO1xuICAgIHZhciBidWlsZGVyID0ge3ByZTogZWx0KFwicHJlXCIsIFtjb250ZW50XSksIGNvbnRlbnQ6IGNvbnRlbnQsIGNvbDogMCwgcG9zOiAwLCBjbTogY219O1xuICAgIGxpbmVWaWV3Lm1lYXN1cmUgPSB7fTtcblxuICAgIC8vIEl0ZXJhdGUgb3ZlciB0aGUgbG9naWNhbCBsaW5lcyB0aGF0IG1ha2UgdXAgdGhpcyB2aXN1YWwgbGluZS5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8PSAobGluZVZpZXcucmVzdCA/IGxpbmVWaWV3LnJlc3QubGVuZ3RoIDogMCk7IGkrKykge1xuICAgICAgdmFyIGxpbmUgPSBpID8gbGluZVZpZXcucmVzdFtpIC0gMV0gOiBsaW5lVmlldy5saW5lLCBvcmRlcjtcbiAgICAgIGJ1aWxkZXIucG9zID0gMDtcbiAgICAgIGJ1aWxkZXIuYWRkVG9rZW4gPSBidWlsZFRva2VuO1xuICAgICAgLy8gT3B0aW9uYWxseSB3aXJlIGluIHNvbWUgaGFja3MgaW50byB0aGUgdG9rZW4tcmVuZGVyaW5nXG4gICAgICAvLyBhbGdvcml0aG0sIHRvIGRlYWwgd2l0aCBicm93c2VyIHF1aXJrcy5cbiAgICAgIGlmICgoaWUgfHwgd2Via2l0KSAmJiBjbS5nZXRPcHRpb24oXCJsaW5lV3JhcHBpbmdcIikpXG4gICAgICAgIGJ1aWxkZXIuYWRkVG9rZW4gPSBidWlsZFRva2VuU3BsaXRTcGFjZXMoYnVpbGRlci5hZGRUb2tlbik7XG4gICAgICBpZiAoaGFzQmFkQmlkaVJlY3RzKGNtLmRpc3BsYXkubWVhc3VyZSkgJiYgKG9yZGVyID0gZ2V0T3JkZXIobGluZSkpKVxuICAgICAgICBidWlsZGVyLmFkZFRva2VuID0gYnVpbGRUb2tlbkJhZEJpZGkoYnVpbGRlci5hZGRUb2tlbiwgb3JkZXIpO1xuICAgICAgYnVpbGRlci5tYXAgPSBbXTtcbiAgICAgIGluc2VydExpbmVDb250ZW50KGxpbmUsIGJ1aWxkZXIsIGdldExpbmVTdHlsZXMoY20sIGxpbmUpKTtcbiAgICAgIGlmIChsaW5lLnN0eWxlQ2xhc3Nlcykge1xuICAgICAgICBpZiAobGluZS5zdHlsZUNsYXNzZXMuYmdDbGFzcylcbiAgICAgICAgICBidWlsZGVyLmJnQ2xhc3MgPSBqb2luQ2xhc3NlcyhsaW5lLnN0eWxlQ2xhc3Nlcy5iZ0NsYXNzLCBidWlsZGVyLmJnQ2xhc3MgfHwgXCJcIik7XG4gICAgICAgIGlmIChsaW5lLnN0eWxlQ2xhc3Nlcy50ZXh0Q2xhc3MpXG4gICAgICAgICAgYnVpbGRlci50ZXh0Q2xhc3MgPSBqb2luQ2xhc3NlcyhsaW5lLnN0eWxlQ2xhc3Nlcy50ZXh0Q2xhc3MsIGJ1aWxkZXIudGV4dENsYXNzIHx8IFwiXCIpO1xuICAgICAgfVxuXG4gICAgICAvLyBFbnN1cmUgYXQgbGVhc3QgYSBzaW5nbGUgbm9kZSBpcyBwcmVzZW50LCBmb3IgbWVhc3VyaW5nLlxuICAgICAgaWYgKGJ1aWxkZXIubWFwLmxlbmd0aCA9PSAwKVxuICAgICAgICBidWlsZGVyLm1hcC5wdXNoKDAsIDAsIGJ1aWxkZXIuY29udGVudC5hcHBlbmRDaGlsZCh6ZXJvV2lkdGhFbGVtZW50KGNtLmRpc3BsYXkubWVhc3VyZSkpKTtcblxuICAgICAgLy8gU3RvcmUgdGhlIG1hcCBhbmQgYSBjYWNoZSBvYmplY3QgZm9yIHRoZSBjdXJyZW50IGxvZ2ljYWwgbGluZVxuICAgICAgaWYgKGkgPT0gMCkge1xuICAgICAgICBsaW5lVmlldy5tZWFzdXJlLm1hcCA9IGJ1aWxkZXIubWFwO1xuICAgICAgICBsaW5lVmlldy5tZWFzdXJlLmNhY2hlID0ge307XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAobGluZVZpZXcubWVhc3VyZS5tYXBzIHx8IChsaW5lVmlldy5tZWFzdXJlLm1hcHMgPSBbXSkpLnB1c2goYnVpbGRlci5tYXApO1xuICAgICAgICAobGluZVZpZXcubWVhc3VyZS5jYWNoZXMgfHwgKGxpbmVWaWV3Lm1lYXN1cmUuY2FjaGVzID0gW10pKS5wdXNoKHt9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzaWduYWwoY20sIFwicmVuZGVyTGluZVwiLCBjbSwgbGluZVZpZXcubGluZSwgYnVpbGRlci5wcmUpO1xuICAgIGlmIChidWlsZGVyLnByZS5jbGFzc05hbWUpXG4gICAgICBidWlsZGVyLnRleHRDbGFzcyA9IGpvaW5DbGFzc2VzKGJ1aWxkZXIucHJlLmNsYXNzTmFtZSwgYnVpbGRlci50ZXh0Q2xhc3MgfHwgXCJcIik7XG4gICAgcmV0dXJuIGJ1aWxkZXI7XG4gIH1cblxuICBmdW5jdGlvbiBkZWZhdWx0U3BlY2lhbENoYXJQbGFjZWhvbGRlcihjaCkge1xuICAgIHZhciB0b2tlbiA9IGVsdChcInNwYW5cIiwgXCJcXHUyMDIyXCIsIFwiY20taW52YWxpZGNoYXJcIik7XG4gICAgdG9rZW4udGl0bGUgPSBcIlxcXFx1XCIgKyBjaC5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KTtcbiAgICByZXR1cm4gdG9rZW47XG4gIH1cblxuICAvLyBCdWlsZCB1cCB0aGUgRE9NIHJlcHJlc2VudGF0aW9uIGZvciBhIHNpbmdsZSB0b2tlbiwgYW5kIGFkZCBpdCB0b1xuICAvLyB0aGUgbGluZSBtYXAuIFRha2VzIGNhcmUgdG8gcmVuZGVyIHNwZWNpYWwgY2hhcmFjdGVycyBzZXBhcmF0ZWx5LlxuICBmdW5jdGlvbiBidWlsZFRva2VuKGJ1aWxkZXIsIHRleHQsIHN0eWxlLCBzdGFydFN0eWxlLCBlbmRTdHlsZSwgdGl0bGUpIHtcbiAgICBpZiAoIXRleHQpIHJldHVybjtcbiAgICB2YXIgc3BlY2lhbCA9IGJ1aWxkZXIuY20ub3B0aW9ucy5zcGVjaWFsQ2hhcnMsIG11c3RXcmFwID0gZmFsc2U7XG4gICAgaWYgKCFzcGVjaWFsLnRlc3QodGV4dCkpIHtcbiAgICAgIGJ1aWxkZXIuY29sICs9IHRleHQubGVuZ3RoO1xuICAgICAgdmFyIGNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0KTtcbiAgICAgIGJ1aWxkZXIubWFwLnB1c2goYnVpbGRlci5wb3MsIGJ1aWxkZXIucG9zICsgdGV4dC5sZW5ndGgsIGNvbnRlbnQpO1xuICAgICAgaWYgKGllX3VwdG84KSBtdXN0V3JhcCA9IHRydWU7XG4gICAgICBidWlsZGVyLnBvcyArPSB0ZXh0Lmxlbmd0aDtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCksIHBvcyA9IDA7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBzcGVjaWFsLmxhc3RJbmRleCA9IHBvcztcbiAgICAgICAgdmFyIG0gPSBzcGVjaWFsLmV4ZWModGV4dCk7XG4gICAgICAgIHZhciBza2lwcGVkID0gbSA/IG0uaW5kZXggLSBwb3MgOiB0ZXh0Lmxlbmd0aCAtIHBvcztcbiAgICAgICAgaWYgKHNraXBwZWQpIHtcbiAgICAgICAgICB2YXIgdHh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dC5zbGljZShwb3MsIHBvcyArIHNraXBwZWQpKTtcbiAgICAgICAgICBpZiAoaWVfdXB0bzgpIGNvbnRlbnQuYXBwZW5kQ2hpbGQoZWx0KFwic3BhblwiLCBbdHh0XSkpO1xuICAgICAgICAgIGVsc2UgY29udGVudC5hcHBlbmRDaGlsZCh0eHQpO1xuICAgICAgICAgIGJ1aWxkZXIubWFwLnB1c2goYnVpbGRlci5wb3MsIGJ1aWxkZXIucG9zICsgc2tpcHBlZCwgdHh0KTtcbiAgICAgICAgICBidWlsZGVyLmNvbCArPSBza2lwcGVkO1xuICAgICAgICAgIGJ1aWxkZXIucG9zICs9IHNraXBwZWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFtKSBicmVhaztcbiAgICAgICAgcG9zICs9IHNraXBwZWQgKyAxO1xuICAgICAgICBpZiAobVswXSA9PSBcIlxcdFwiKSB7XG4gICAgICAgICAgdmFyIHRhYlNpemUgPSBidWlsZGVyLmNtLm9wdGlvbnMudGFiU2l6ZSwgdGFiV2lkdGggPSB0YWJTaXplIC0gYnVpbGRlci5jb2wgJSB0YWJTaXplO1xuICAgICAgICAgIHZhciB0eHQgPSBjb250ZW50LmFwcGVuZENoaWxkKGVsdChcInNwYW5cIiwgc3BhY2VTdHIodGFiV2lkdGgpLCBcImNtLXRhYlwiKSk7XG4gICAgICAgICAgYnVpbGRlci5jb2wgKz0gdGFiV2lkdGg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHR4dCA9IGJ1aWxkZXIuY20ub3B0aW9ucy5zcGVjaWFsQ2hhclBsYWNlaG9sZGVyKG1bMF0pO1xuICAgICAgICAgIGlmIChpZV91cHRvOCkgY29udGVudC5hcHBlbmRDaGlsZChlbHQoXCJzcGFuXCIsIFt0eHRdKSk7XG4gICAgICAgICAgZWxzZSBjb250ZW50LmFwcGVuZENoaWxkKHR4dCk7XG4gICAgICAgICAgYnVpbGRlci5jb2wgKz0gMTtcbiAgICAgICAgfVxuICAgICAgICBidWlsZGVyLm1hcC5wdXNoKGJ1aWxkZXIucG9zLCBidWlsZGVyLnBvcyArIDEsIHR4dCk7XG4gICAgICAgIGJ1aWxkZXIucG9zKys7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChzdHlsZSB8fCBzdGFydFN0eWxlIHx8IGVuZFN0eWxlIHx8IG11c3RXcmFwKSB7XG4gICAgICB2YXIgZnVsbFN0eWxlID0gc3R5bGUgfHwgXCJcIjtcbiAgICAgIGlmIChzdGFydFN0eWxlKSBmdWxsU3R5bGUgKz0gc3RhcnRTdHlsZTtcbiAgICAgIGlmIChlbmRTdHlsZSkgZnVsbFN0eWxlICs9IGVuZFN0eWxlO1xuICAgICAgdmFyIHRva2VuID0gZWx0KFwic3BhblwiLCBbY29udGVudF0sIGZ1bGxTdHlsZSk7XG4gICAgICBpZiAodGl0bGUpIHRva2VuLnRpdGxlID0gdGl0bGU7XG4gICAgICByZXR1cm4gYnVpbGRlci5jb250ZW50LmFwcGVuZENoaWxkKHRva2VuKTtcbiAgICB9XG4gICAgYnVpbGRlci5jb250ZW50LmFwcGVuZENoaWxkKGNvbnRlbnQpO1xuICB9XG5cbiAgZnVuY3Rpb24gYnVpbGRUb2tlblNwbGl0U3BhY2VzKGlubmVyKSB7XG4gICAgZnVuY3Rpb24gc3BsaXQob2xkKSB7XG4gICAgICB2YXIgb3V0ID0gXCIgXCI7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9sZC5sZW5ndGggLSAyOyArK2kpIG91dCArPSBpICUgMiA/IFwiIFwiIDogXCJcXHUwMGEwXCI7XG4gICAgICBvdXQgKz0gXCIgXCI7XG4gICAgICByZXR1cm4gb3V0O1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24oYnVpbGRlciwgdGV4dCwgc3R5bGUsIHN0YXJ0U3R5bGUsIGVuZFN0eWxlLCB0aXRsZSkge1xuICAgICAgaW5uZXIoYnVpbGRlciwgdGV4dC5yZXBsYWNlKC8gezMsfS9nLCBzcGxpdCksIHN0eWxlLCBzdGFydFN0eWxlLCBlbmRTdHlsZSwgdGl0bGUpO1xuICAgIH07XG4gIH1cblxuICAvLyBXb3JrIGFyb3VuZCBub25zZW5zZSBkaW1lbnNpb25zIGJlaW5nIHJlcG9ydGVkIGZvciBzdHJldGNoZXMgb2ZcbiAgLy8gcmlnaHQtdG8tbGVmdCB0ZXh0LlxuICBmdW5jdGlvbiBidWlsZFRva2VuQmFkQmlkaShpbm5lciwgb3JkZXIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oYnVpbGRlciwgdGV4dCwgc3R5bGUsIHN0YXJ0U3R5bGUsIGVuZFN0eWxlLCB0aXRsZSkge1xuICAgICAgc3R5bGUgPSBzdHlsZSA/IHN0eWxlICsgXCIgY20tZm9yY2UtYm9yZGVyXCIgOiBcImNtLWZvcmNlLWJvcmRlclwiO1xuICAgICAgdmFyIHN0YXJ0ID0gYnVpbGRlci5wb3MsIGVuZCA9IHN0YXJ0ICsgdGV4dC5sZW5ndGg7XG4gICAgICBmb3IgKDs7KSB7XG4gICAgICAgIC8vIEZpbmQgdGhlIHBhcnQgdGhhdCBvdmVybGFwcyB3aXRoIHRoZSBzdGFydCBvZiB0aGlzIHRleHRcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvcmRlci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBwYXJ0ID0gb3JkZXJbaV07XG4gICAgICAgICAgaWYgKHBhcnQudG8gPiBzdGFydCAmJiBwYXJ0LmZyb20gPD0gc3RhcnQpIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJ0LnRvID49IGVuZCkgcmV0dXJuIGlubmVyKGJ1aWxkZXIsIHRleHQsIHN0eWxlLCBzdGFydFN0eWxlLCBlbmRTdHlsZSwgdGl0bGUpO1xuICAgICAgICBpbm5lcihidWlsZGVyLCB0ZXh0LnNsaWNlKDAsIHBhcnQudG8gLSBzdGFydCksIHN0eWxlLCBzdGFydFN0eWxlLCBudWxsLCB0aXRsZSk7XG4gICAgICAgIHN0YXJ0U3R5bGUgPSBudWxsO1xuICAgICAgICB0ZXh0ID0gdGV4dC5zbGljZShwYXJ0LnRvIC0gc3RhcnQpO1xuICAgICAgICBzdGFydCA9IHBhcnQudG87XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJ1aWxkQ29sbGFwc2VkU3BhbihidWlsZGVyLCBzaXplLCBtYXJrZXIsIGlnbm9yZVdpZGdldCkge1xuICAgIHZhciB3aWRnZXQgPSAhaWdub3JlV2lkZ2V0ICYmIG1hcmtlci53aWRnZXROb2RlO1xuICAgIGlmICh3aWRnZXQpIHtcbiAgICAgIGJ1aWxkZXIubWFwLnB1c2goYnVpbGRlci5wb3MsIGJ1aWxkZXIucG9zICsgc2l6ZSwgd2lkZ2V0KTtcbiAgICAgIGJ1aWxkZXIuY29udGVudC5hcHBlbmRDaGlsZCh3aWRnZXQpO1xuICAgIH1cbiAgICBidWlsZGVyLnBvcyArPSBzaXplO1xuICB9XG5cbiAgLy8gT3V0cHV0cyBhIG51bWJlciBvZiBzcGFucyB0byBtYWtlIHVwIGEgbGluZSwgdGFraW5nIGhpZ2hsaWdodGluZ1xuICAvLyBhbmQgbWFya2VkIHRleHQgaW50byBhY2NvdW50LlxuICBmdW5jdGlvbiBpbnNlcnRMaW5lQ29udGVudChsaW5lLCBidWlsZGVyLCBzdHlsZXMpIHtcbiAgICB2YXIgc3BhbnMgPSBsaW5lLm1hcmtlZFNwYW5zLCBhbGxUZXh0ID0gbGluZS50ZXh0LCBhdCA9IDA7XG4gICAgaWYgKCFzcGFucykge1xuICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBzdHlsZXMubGVuZ3RoOyBpKz0yKVxuICAgICAgICBidWlsZGVyLmFkZFRva2VuKGJ1aWxkZXIsIGFsbFRleHQuc2xpY2UoYXQsIGF0ID0gc3R5bGVzW2ldKSwgaW50ZXJwcmV0VG9rZW5TdHlsZShzdHlsZXNbaSsxXSwgYnVpbGRlci5jbS5vcHRpb25zKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGxlbiA9IGFsbFRleHQubGVuZ3RoLCBwb3MgPSAwLCBpID0gMSwgdGV4dCA9IFwiXCIsIHN0eWxlO1xuICAgIHZhciBuZXh0Q2hhbmdlID0gMCwgc3BhblN0eWxlLCBzcGFuRW5kU3R5bGUsIHNwYW5TdGFydFN0eWxlLCB0aXRsZSwgY29sbGFwc2VkO1xuICAgIGZvciAoOzspIHtcbiAgICAgIGlmIChuZXh0Q2hhbmdlID09IHBvcykgeyAvLyBVcGRhdGUgY3VycmVudCBtYXJrZXIgc2V0XG4gICAgICAgIHNwYW5TdHlsZSA9IHNwYW5FbmRTdHlsZSA9IHNwYW5TdGFydFN0eWxlID0gdGl0bGUgPSBcIlwiO1xuICAgICAgICBjb2xsYXBzZWQgPSBudWxsOyBuZXh0Q2hhbmdlID0gSW5maW5pdHk7XG4gICAgICAgIHZhciBmb3VuZEJvb2ttYXJrcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHNwYW5zLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgdmFyIHNwID0gc3BhbnNbal0sIG0gPSBzcC5tYXJrZXI7XG4gICAgICAgICAgaWYgKHNwLmZyb20gPD0gcG9zICYmIChzcC50byA9PSBudWxsIHx8IHNwLnRvID4gcG9zKSkge1xuICAgICAgICAgICAgaWYgKHNwLnRvICE9IG51bGwgJiYgbmV4dENoYW5nZSA+IHNwLnRvKSB7IG5leHRDaGFuZ2UgPSBzcC50bzsgc3BhbkVuZFN0eWxlID0gXCJcIjsgfVxuICAgICAgICAgICAgaWYgKG0uY2xhc3NOYW1lKSBzcGFuU3R5bGUgKz0gXCIgXCIgKyBtLmNsYXNzTmFtZTtcbiAgICAgICAgICAgIGlmIChtLnN0YXJ0U3R5bGUgJiYgc3AuZnJvbSA9PSBwb3MpIHNwYW5TdGFydFN0eWxlICs9IFwiIFwiICsgbS5zdGFydFN0eWxlO1xuICAgICAgICAgICAgaWYgKG0uZW5kU3R5bGUgJiYgc3AudG8gPT0gbmV4dENoYW5nZSkgc3BhbkVuZFN0eWxlICs9IFwiIFwiICsgbS5lbmRTdHlsZTtcbiAgICAgICAgICAgIGlmIChtLnRpdGxlICYmICF0aXRsZSkgdGl0bGUgPSBtLnRpdGxlO1xuICAgICAgICAgICAgaWYgKG0uY29sbGFwc2VkICYmICghY29sbGFwc2VkIHx8IGNvbXBhcmVDb2xsYXBzZWRNYXJrZXJzKGNvbGxhcHNlZC5tYXJrZXIsIG0pIDwgMCkpXG4gICAgICAgICAgICAgIGNvbGxhcHNlZCA9IHNwO1xuICAgICAgICAgIH0gZWxzZSBpZiAoc3AuZnJvbSA+IHBvcyAmJiBuZXh0Q2hhbmdlID4gc3AuZnJvbSkge1xuICAgICAgICAgICAgbmV4dENoYW5nZSA9IHNwLmZyb207XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChtLnR5cGUgPT0gXCJib29rbWFya1wiICYmIHNwLmZyb20gPT0gcG9zICYmIG0ud2lkZ2V0Tm9kZSkgZm91bmRCb29rbWFya3MucHVzaChtKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29sbGFwc2VkICYmIChjb2xsYXBzZWQuZnJvbSB8fCAwKSA9PSBwb3MpIHtcbiAgICAgICAgICBidWlsZENvbGxhcHNlZFNwYW4oYnVpbGRlciwgKGNvbGxhcHNlZC50byA9PSBudWxsID8gbGVuICsgMSA6IGNvbGxhcHNlZC50bykgLSBwb3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZC5tYXJrZXIsIGNvbGxhcHNlZC5mcm9tID09IG51bGwpO1xuICAgICAgICAgIGlmIChjb2xsYXBzZWQudG8gPT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghY29sbGFwc2VkICYmIGZvdW5kQm9va21hcmtzLmxlbmd0aCkgZm9yICh2YXIgaiA9IDA7IGogPCBmb3VuZEJvb2ttYXJrcy5sZW5ndGg7ICsrailcbiAgICAgICAgICBidWlsZENvbGxhcHNlZFNwYW4oYnVpbGRlciwgMCwgZm91bmRCb29rbWFya3Nbal0pO1xuICAgICAgfVxuICAgICAgaWYgKHBvcyA+PSBsZW4pIGJyZWFrO1xuXG4gICAgICB2YXIgdXB0byA9IE1hdGgubWluKGxlbiwgbmV4dENoYW5nZSk7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBpZiAodGV4dCkge1xuICAgICAgICAgIHZhciBlbmQgPSBwb3MgKyB0ZXh0Lmxlbmd0aDtcbiAgICAgICAgICBpZiAoIWNvbGxhcHNlZCkge1xuICAgICAgICAgICAgdmFyIHRva2VuVGV4dCA9IGVuZCA+IHVwdG8gPyB0ZXh0LnNsaWNlKDAsIHVwdG8gLSBwb3MpIDogdGV4dDtcbiAgICAgICAgICAgIGJ1aWxkZXIuYWRkVG9rZW4oYnVpbGRlciwgdG9rZW5UZXh0LCBzdHlsZSA/IHN0eWxlICsgc3BhblN0eWxlIDogc3BhblN0eWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGFuU3RhcnRTdHlsZSwgcG9zICsgdG9rZW5UZXh0Lmxlbmd0aCA9PSBuZXh0Q2hhbmdlID8gc3BhbkVuZFN0eWxlIDogXCJcIiwgdGl0bGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZW5kID49IHVwdG8pIHt0ZXh0ID0gdGV4dC5zbGljZSh1cHRvIC0gcG9zKTsgcG9zID0gdXB0bzsgYnJlYWs7fVxuICAgICAgICAgIHBvcyA9IGVuZDtcbiAgICAgICAgICBzcGFuU3RhcnRTdHlsZSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgdGV4dCA9IGFsbFRleHQuc2xpY2UoYXQsIGF0ID0gc3R5bGVzW2krK10pO1xuICAgICAgICBzdHlsZSA9IGludGVycHJldFRva2VuU3R5bGUoc3R5bGVzW2krK10sIGJ1aWxkZXIuY20ub3B0aW9ucyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gRE9DVU1FTlQgREFUQSBTVFJVQ1RVUkVcblxuICAvLyBCeSBkZWZhdWx0LCB1cGRhdGVzIHRoYXQgc3RhcnQgYW5kIGVuZCBhdCB0aGUgYmVnaW5uaW5nIG9mIGEgbGluZVxuICAvLyBhcmUgdHJlYXRlZCBzcGVjaWFsbHksIGluIG9yZGVyIHRvIG1ha2UgdGhlIGFzc29jaWF0aW9uIG9mIGxpbmVcbiAgLy8gd2lkZ2V0cyBhbmQgbWFya2VyIGVsZW1lbnRzIHdpdGggdGhlIHRleHQgYmVoYXZlIG1vcmUgaW50dWl0aXZlLlxuICBmdW5jdGlvbiBpc1dob2xlTGluZVVwZGF0ZShkb2MsIGNoYW5nZSkge1xuICAgIHJldHVybiBjaGFuZ2UuZnJvbS5jaCA9PSAwICYmIGNoYW5nZS50by5jaCA9PSAwICYmIGxzdChjaGFuZ2UudGV4dCkgPT0gXCJcIiAmJlxuICAgICAgKCFkb2MuY20gfHwgZG9jLmNtLm9wdGlvbnMud2hvbGVMaW5lVXBkYXRlQmVmb3JlKTtcbiAgfVxuXG4gIC8vIFBlcmZvcm0gYSBjaGFuZ2Ugb24gdGhlIGRvY3VtZW50IGRhdGEgc3RydWN0dXJlLlxuICBmdW5jdGlvbiB1cGRhdGVEb2MoZG9jLCBjaGFuZ2UsIG1hcmtlZFNwYW5zLCBlc3RpbWF0ZUhlaWdodCkge1xuICAgIGZ1bmN0aW9uIHNwYW5zRm9yKG4pIHtyZXR1cm4gbWFya2VkU3BhbnMgPyBtYXJrZWRTcGFuc1tuXSA6IG51bGw7fVxuICAgIGZ1bmN0aW9uIHVwZGF0ZShsaW5lLCB0ZXh0LCBzcGFucykge1xuICAgICAgdXBkYXRlTGluZShsaW5lLCB0ZXh0LCBzcGFucywgZXN0aW1hdGVIZWlnaHQpO1xuICAgICAgc2lnbmFsTGF0ZXIobGluZSwgXCJjaGFuZ2VcIiwgbGluZSwgY2hhbmdlKTtcbiAgICB9XG5cbiAgICB2YXIgZnJvbSA9IGNoYW5nZS5mcm9tLCB0byA9IGNoYW5nZS50bywgdGV4dCA9IGNoYW5nZS50ZXh0O1xuICAgIHZhciBmaXJzdExpbmUgPSBnZXRMaW5lKGRvYywgZnJvbS5saW5lKSwgbGFzdExpbmUgPSBnZXRMaW5lKGRvYywgdG8ubGluZSk7XG4gICAgdmFyIGxhc3RUZXh0ID0gbHN0KHRleHQpLCBsYXN0U3BhbnMgPSBzcGFuc0Zvcih0ZXh0Lmxlbmd0aCAtIDEpLCBubGluZXMgPSB0by5saW5lIC0gZnJvbS5saW5lO1xuXG4gICAgLy8gQWRqdXN0IHRoZSBsaW5lIHN0cnVjdHVyZVxuICAgIGlmIChpc1dob2xlTGluZVVwZGF0ZShkb2MsIGNoYW5nZSkpIHtcbiAgICAgIC8vIFRoaXMgaXMgYSB3aG9sZS1saW5lIHJlcGxhY2UuIFRyZWF0ZWQgc3BlY2lhbGx5IHRvIG1ha2VcbiAgICAgIC8vIHN1cmUgbGluZSBvYmplY3RzIG1vdmUgdGhlIHdheSB0aGV5IGFyZSBzdXBwb3NlZCB0by5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBhZGRlZCA9IFtdOyBpIDwgdGV4dC5sZW5ndGggLSAxOyArK2kpXG4gICAgICAgIGFkZGVkLnB1c2gobmV3IExpbmUodGV4dFtpXSwgc3BhbnNGb3IoaSksIGVzdGltYXRlSGVpZ2h0KSk7XG4gICAgICB1cGRhdGUobGFzdExpbmUsIGxhc3RMaW5lLnRleHQsIGxhc3RTcGFucyk7XG4gICAgICBpZiAobmxpbmVzKSBkb2MucmVtb3ZlKGZyb20ubGluZSwgbmxpbmVzKTtcbiAgICAgIGlmIChhZGRlZC5sZW5ndGgpIGRvYy5pbnNlcnQoZnJvbS5saW5lLCBhZGRlZCk7XG4gICAgfSBlbHNlIGlmIChmaXJzdExpbmUgPT0gbGFzdExpbmUpIHtcbiAgICAgIGlmICh0ZXh0Lmxlbmd0aCA9PSAxKSB7XG4gICAgICAgIHVwZGF0ZShmaXJzdExpbmUsIGZpcnN0TGluZS50ZXh0LnNsaWNlKDAsIGZyb20uY2gpICsgbGFzdFRleHQgKyBmaXJzdExpbmUudGV4dC5zbGljZSh0by5jaCksIGxhc3RTcGFucyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKHZhciBhZGRlZCA9IFtdLCBpID0gMTsgaSA8IHRleHQubGVuZ3RoIC0gMTsgKytpKVxuICAgICAgICAgIGFkZGVkLnB1c2gobmV3IExpbmUodGV4dFtpXSwgc3BhbnNGb3IoaSksIGVzdGltYXRlSGVpZ2h0KSk7XG4gICAgICAgIGFkZGVkLnB1c2gobmV3IExpbmUobGFzdFRleHQgKyBmaXJzdExpbmUudGV4dC5zbGljZSh0by5jaCksIGxhc3RTcGFucywgZXN0aW1hdGVIZWlnaHQpKTtcbiAgICAgICAgdXBkYXRlKGZpcnN0TGluZSwgZmlyc3RMaW5lLnRleHQuc2xpY2UoMCwgZnJvbS5jaCkgKyB0ZXh0WzBdLCBzcGFuc0ZvcigwKSk7XG4gICAgICAgIGRvYy5pbnNlcnQoZnJvbS5saW5lICsgMSwgYWRkZWQpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGV4dC5sZW5ndGggPT0gMSkge1xuICAgICAgdXBkYXRlKGZpcnN0TGluZSwgZmlyc3RMaW5lLnRleHQuc2xpY2UoMCwgZnJvbS5jaCkgKyB0ZXh0WzBdICsgbGFzdExpbmUudGV4dC5zbGljZSh0by5jaCksIHNwYW5zRm9yKDApKTtcbiAgICAgIGRvYy5yZW1vdmUoZnJvbS5saW5lICsgMSwgbmxpbmVzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdXBkYXRlKGZpcnN0TGluZSwgZmlyc3RMaW5lLnRleHQuc2xpY2UoMCwgZnJvbS5jaCkgKyB0ZXh0WzBdLCBzcGFuc0ZvcigwKSk7XG4gICAgICB1cGRhdGUobGFzdExpbmUsIGxhc3RUZXh0ICsgbGFzdExpbmUudGV4dC5zbGljZSh0by5jaCksIGxhc3RTcGFucyk7XG4gICAgICBmb3IgKHZhciBpID0gMSwgYWRkZWQgPSBbXTsgaSA8IHRleHQubGVuZ3RoIC0gMTsgKytpKVxuICAgICAgICBhZGRlZC5wdXNoKG5ldyBMaW5lKHRleHRbaV0sIHNwYW5zRm9yKGkpLCBlc3RpbWF0ZUhlaWdodCkpO1xuICAgICAgaWYgKG5saW5lcyA+IDEpIGRvYy5yZW1vdmUoZnJvbS5saW5lICsgMSwgbmxpbmVzIC0gMSk7XG4gICAgICBkb2MuaW5zZXJ0KGZyb20ubGluZSArIDEsIGFkZGVkKTtcbiAgICB9XG5cbiAgICBzaWduYWxMYXRlcihkb2MsIFwiY2hhbmdlXCIsIGRvYywgY2hhbmdlKTtcbiAgfVxuXG4gIC8vIFRoZSBkb2N1bWVudCBpcyByZXByZXNlbnRlZCBhcyBhIEJUcmVlIGNvbnNpc3Rpbmcgb2YgbGVhdmVzLCB3aXRoXG4gIC8vIGNodW5rIG9mIGxpbmVzIGluIHRoZW0sIGFuZCBicmFuY2hlcywgd2l0aCB1cCB0byB0ZW4gbGVhdmVzIG9yXG4gIC8vIG90aGVyIGJyYW5jaCBub2RlcyBiZWxvdyB0aGVtLiBUaGUgdG9wIG5vZGUgaXMgYWx3YXlzIGEgYnJhbmNoXG4gIC8vIG5vZGUsIGFuZCBpcyB0aGUgZG9jdW1lbnQgb2JqZWN0IGl0c2VsZiAobWVhbmluZyBpdCBoYXNcbiAgLy8gYWRkaXRpb25hbCBtZXRob2RzIGFuZCBwcm9wZXJ0aWVzKS5cbiAgLy9cbiAgLy8gQWxsIG5vZGVzIGhhdmUgcGFyZW50IGxpbmtzLiBUaGUgdHJlZSBpcyB1c2VkIGJvdGggdG8gZ28gZnJvbVxuICAvLyBsaW5lIG51bWJlcnMgdG8gbGluZSBvYmplY3RzLCBhbmQgdG8gZ28gZnJvbSBvYmplY3RzIHRvIG51bWJlcnMuXG4gIC8vIEl0IGFsc28gaW5kZXhlcyBieSBoZWlnaHQsIGFuZCBpcyB1c2VkIHRvIGNvbnZlcnQgYmV0d2VlbiBoZWlnaHRcbiAgLy8gYW5kIGxpbmUgb2JqZWN0LCBhbmQgdG8gZmluZCB0aGUgdG90YWwgaGVpZ2h0IG9mIHRoZSBkb2N1bWVudC5cbiAgLy9cbiAgLy8gU2VlIGFsc28gaHR0cDovL21hcmlqbmhhdmVyYmVrZS5ubC9ibG9nL2NvZGVtaXJyb3ItbGluZS10cmVlLmh0bWxcblxuICBmdW5jdGlvbiBMZWFmQ2h1bmsobGluZXMpIHtcbiAgICB0aGlzLmxpbmVzID0gbGluZXM7XG4gICAgdGhpcy5wYXJlbnQgPSBudWxsO1xuICAgIGZvciAodmFyIGkgPSAwLCBoZWlnaHQgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIGxpbmVzW2ldLnBhcmVudCA9IHRoaXM7XG4gICAgICBoZWlnaHQgKz0gbGluZXNbaV0uaGVpZ2h0O1xuICAgIH1cbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgfVxuXG4gIExlYWZDaHVuay5wcm90b3R5cGUgPSB7XG4gICAgY2h1bmtTaXplOiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMubGluZXMubGVuZ3RoOyB9LFxuICAgIC8vIFJlbW92ZSB0aGUgbiBsaW5lcyBhdCBvZmZzZXQgJ2F0Jy5cbiAgICByZW1vdmVJbm5lcjogZnVuY3Rpb24oYXQsIG4pIHtcbiAgICAgIGZvciAodmFyIGkgPSBhdCwgZSA9IGF0ICsgbjsgaSA8IGU7ICsraSkge1xuICAgICAgICB2YXIgbGluZSA9IHRoaXMubGluZXNbaV07XG4gICAgICAgIHRoaXMuaGVpZ2h0IC09IGxpbmUuaGVpZ2h0O1xuICAgICAgICBjbGVhblVwTGluZShsaW5lKTtcbiAgICAgICAgc2lnbmFsTGF0ZXIobGluZSwgXCJkZWxldGVcIik7XG4gICAgICB9XG4gICAgICB0aGlzLmxpbmVzLnNwbGljZShhdCwgbik7XG4gICAgfSxcbiAgICAvLyBIZWxwZXIgdXNlZCB0byBjb2xsYXBzZSBhIHNtYWxsIGJyYW5jaCBpbnRvIGEgc2luZ2xlIGxlYWYuXG4gICAgY29sbGFwc2U6IGZ1bmN0aW9uKGxpbmVzKSB7XG4gICAgICBsaW5lcy5wdXNoLmFwcGx5KGxpbmVzLCB0aGlzLmxpbmVzKTtcbiAgICB9LFxuICAgIC8vIEluc2VydCB0aGUgZ2l2ZW4gYXJyYXkgb2YgbGluZXMgYXQgb2Zmc2V0ICdhdCcsIGNvdW50IHRoZW0gYXNcbiAgICAvLyBoYXZpbmcgdGhlIGdpdmVuIGhlaWdodC5cbiAgICBpbnNlcnRJbm5lcjogZnVuY3Rpb24oYXQsIGxpbmVzLCBoZWlnaHQpIHtcbiAgICAgIHRoaXMuaGVpZ2h0ICs9IGhlaWdodDtcbiAgICAgIHRoaXMubGluZXMgPSB0aGlzLmxpbmVzLnNsaWNlKDAsIGF0KS5jb25jYXQobGluZXMpLmNvbmNhdCh0aGlzLmxpbmVzLnNsaWNlKGF0KSk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgKytpKSBsaW5lc1tpXS5wYXJlbnQgPSB0aGlzO1xuICAgIH0sXG4gICAgLy8gVXNlZCB0byBpdGVyYXRlIG92ZXIgYSBwYXJ0IG9mIHRoZSB0cmVlLlxuICAgIGl0ZXJOOiBmdW5jdGlvbihhdCwgbiwgb3ApIHtcbiAgICAgIGZvciAodmFyIGUgPSBhdCArIG47IGF0IDwgZTsgKythdClcbiAgICAgICAgaWYgKG9wKHRoaXMubGluZXNbYXRdKSkgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIEJyYW5jaENodW5rKGNoaWxkcmVuKSB7XG4gICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgIHZhciBzaXplID0gMCwgaGVpZ2h0ID0gMDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgY2ggPSBjaGlsZHJlbltpXTtcbiAgICAgIHNpemUgKz0gY2guY2h1bmtTaXplKCk7IGhlaWdodCArPSBjaC5oZWlnaHQ7XG4gICAgICBjaC5wYXJlbnQgPSB0aGlzO1xuICAgIH1cbiAgICB0aGlzLnNpemUgPSBzaXplO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMucGFyZW50ID0gbnVsbDtcbiAgfVxuXG4gIEJyYW5jaENodW5rLnByb3RvdHlwZSA9IHtcbiAgICBjaHVua1NpemU6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5zaXplOyB9LFxuICAgIHJlbW92ZUlubmVyOiBmdW5jdGlvbihhdCwgbikge1xuICAgICAgdGhpcy5zaXplIC09IG47XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGNoaWxkID0gdGhpcy5jaGlsZHJlbltpXSwgc3ogPSBjaGlsZC5jaHVua1NpemUoKTtcbiAgICAgICAgaWYgKGF0IDwgc3opIHtcbiAgICAgICAgICB2YXIgcm0gPSBNYXRoLm1pbihuLCBzeiAtIGF0KSwgb2xkSGVpZ2h0ID0gY2hpbGQuaGVpZ2h0O1xuICAgICAgICAgIGNoaWxkLnJlbW92ZUlubmVyKGF0LCBybSk7XG4gICAgICAgICAgdGhpcy5oZWlnaHQgLT0gb2xkSGVpZ2h0IC0gY2hpbGQuaGVpZ2h0O1xuICAgICAgICAgIGlmIChzeiA9PSBybSkgeyB0aGlzLmNoaWxkcmVuLnNwbGljZShpLS0sIDEpOyBjaGlsZC5wYXJlbnQgPSBudWxsOyB9XG4gICAgICAgICAgaWYgKChuIC09IHJtKSA9PSAwKSBicmVhaztcbiAgICAgICAgICBhdCA9IDA7XG4gICAgICAgIH0gZWxzZSBhdCAtPSBzejtcbiAgICAgIH1cbiAgICAgIC8vIElmIHRoZSByZXN1bHQgaXMgc21hbGxlciB0aGFuIDI1IGxpbmVzLCBlbnN1cmUgdGhhdCBpdCBpcyBhXG4gICAgICAvLyBzaW5nbGUgbGVhZiBub2RlLlxuICAgICAgaWYgKHRoaXMuc2l6ZSAtIG4gPCAyNSAmJlxuICAgICAgICAgICh0aGlzLmNoaWxkcmVuLmxlbmd0aCA+IDEgfHwgISh0aGlzLmNoaWxkcmVuWzBdIGluc3RhbmNlb2YgTGVhZkNodW5rKSkpIHtcbiAgICAgICAgdmFyIGxpbmVzID0gW107XG4gICAgICAgIHRoaXMuY29sbGFwc2UobGluZXMpO1xuICAgICAgICB0aGlzLmNoaWxkcmVuID0gW25ldyBMZWFmQ2h1bmsobGluZXMpXTtcbiAgICAgICAgdGhpcy5jaGlsZHJlblswXS5wYXJlbnQgPSB0aGlzO1xuICAgICAgfVxuICAgIH0sXG4gICAgY29sbGFwc2U6IGZ1bmN0aW9uKGxpbmVzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHRoaXMuY2hpbGRyZW5baV0uY29sbGFwc2UobGluZXMpO1xuICAgIH0sXG4gICAgaW5zZXJ0SW5uZXI6IGZ1bmN0aW9uKGF0LCBsaW5lcywgaGVpZ2h0KSB7XG4gICAgICB0aGlzLnNpemUgKz0gbGluZXMubGVuZ3RoO1xuICAgICAgdGhpcy5oZWlnaHQgKz0gaGVpZ2h0O1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBjaGlsZCA9IHRoaXMuY2hpbGRyZW5baV0sIHN6ID0gY2hpbGQuY2h1bmtTaXplKCk7XG4gICAgICAgIGlmIChhdCA8PSBzeikge1xuICAgICAgICAgIGNoaWxkLmluc2VydElubmVyKGF0LCBsaW5lcywgaGVpZ2h0KTtcbiAgICAgICAgICBpZiAoY2hpbGQubGluZXMgJiYgY2hpbGQubGluZXMubGVuZ3RoID4gNTApIHtcbiAgICAgICAgICAgIHdoaWxlIChjaGlsZC5saW5lcy5sZW5ndGggPiA1MCkge1xuICAgICAgICAgICAgICB2YXIgc3BpbGxlZCA9IGNoaWxkLmxpbmVzLnNwbGljZShjaGlsZC5saW5lcy5sZW5ndGggLSAyNSwgMjUpO1xuICAgICAgICAgICAgICB2YXIgbmV3bGVhZiA9IG5ldyBMZWFmQ2h1bmsoc3BpbGxlZCk7XG4gICAgICAgICAgICAgIGNoaWxkLmhlaWdodCAtPSBuZXdsZWFmLmhlaWdodDtcbiAgICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5zcGxpY2UoaSArIDEsIDAsIG5ld2xlYWYpO1xuICAgICAgICAgICAgICBuZXdsZWFmLnBhcmVudCA9IHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1heWJlU3BpbGwoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgYXQgLT0gc3o7XG4gICAgICB9XG4gICAgfSxcbiAgICAvLyBXaGVuIGEgbm9kZSBoYXMgZ3Jvd24sIGNoZWNrIHdoZXRoZXIgaXQgc2hvdWxkIGJlIHNwbGl0LlxuICAgIG1heWJlU3BpbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuY2hpbGRyZW4ubGVuZ3RoIDw9IDEwKSByZXR1cm47XG4gICAgICB2YXIgbWUgPSB0aGlzO1xuICAgICAgZG8ge1xuICAgICAgICB2YXIgc3BpbGxlZCA9IG1lLmNoaWxkcmVuLnNwbGljZShtZS5jaGlsZHJlbi5sZW5ndGggLSA1LCA1KTtcbiAgICAgICAgdmFyIHNpYmxpbmcgPSBuZXcgQnJhbmNoQ2h1bmsoc3BpbGxlZCk7XG4gICAgICAgIGlmICghbWUucGFyZW50KSB7IC8vIEJlY29tZSB0aGUgcGFyZW50IG5vZGVcbiAgICAgICAgICB2YXIgY29weSA9IG5ldyBCcmFuY2hDaHVuayhtZS5jaGlsZHJlbik7XG4gICAgICAgICAgY29weS5wYXJlbnQgPSBtZTtcbiAgICAgICAgICBtZS5jaGlsZHJlbiA9IFtjb3B5LCBzaWJsaW5nXTtcbiAgICAgICAgICBtZSA9IGNvcHk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWUuc2l6ZSAtPSBzaWJsaW5nLnNpemU7XG4gICAgICAgICAgbWUuaGVpZ2h0IC09IHNpYmxpbmcuaGVpZ2h0O1xuICAgICAgICAgIHZhciBteUluZGV4ID0gaW5kZXhPZihtZS5wYXJlbnQuY2hpbGRyZW4sIG1lKTtcbiAgICAgICAgICBtZS5wYXJlbnQuY2hpbGRyZW4uc3BsaWNlKG15SW5kZXggKyAxLCAwLCBzaWJsaW5nKTtcbiAgICAgICAgfVxuICAgICAgICBzaWJsaW5nLnBhcmVudCA9IG1lLnBhcmVudDtcbiAgICAgIH0gd2hpbGUgKG1lLmNoaWxkcmVuLmxlbmd0aCA+IDEwKTtcbiAgICAgIG1lLnBhcmVudC5tYXliZVNwaWxsKCk7XG4gICAgfSxcbiAgICBpdGVyTjogZnVuY3Rpb24oYXQsIG4sIG9wKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGNoaWxkID0gdGhpcy5jaGlsZHJlbltpXSwgc3ogPSBjaGlsZC5jaHVua1NpemUoKTtcbiAgICAgICAgaWYgKGF0IDwgc3opIHtcbiAgICAgICAgICB2YXIgdXNlZCA9IE1hdGgubWluKG4sIHN6IC0gYXQpO1xuICAgICAgICAgIGlmIChjaGlsZC5pdGVyTihhdCwgdXNlZCwgb3ApKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICBpZiAoKG4gLT0gdXNlZCkgPT0gMCkgYnJlYWs7XG4gICAgICAgICAgYXQgPSAwO1xuICAgICAgICB9IGVsc2UgYXQgLT0gc3o7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHZhciBuZXh0RG9jSWQgPSAwO1xuICB2YXIgRG9jID0gQ29kZU1pcnJvci5Eb2MgPSBmdW5jdGlvbih0ZXh0LCBtb2RlLCBmaXJzdExpbmUpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgRG9jKSkgcmV0dXJuIG5ldyBEb2ModGV4dCwgbW9kZSwgZmlyc3RMaW5lKTtcbiAgICBpZiAoZmlyc3RMaW5lID09IG51bGwpIGZpcnN0TGluZSA9IDA7XG5cbiAgICBCcmFuY2hDaHVuay5jYWxsKHRoaXMsIFtuZXcgTGVhZkNodW5rKFtuZXcgTGluZShcIlwiLCBudWxsKV0pXSk7XG4gICAgdGhpcy5maXJzdCA9IGZpcnN0TGluZTtcbiAgICB0aGlzLnNjcm9sbFRvcCA9IHRoaXMuc2Nyb2xsTGVmdCA9IDA7XG4gICAgdGhpcy5jYW50RWRpdCA9IGZhbHNlO1xuICAgIHRoaXMuY2xlYW5HZW5lcmF0aW9uID0gMTtcbiAgICB0aGlzLmZyb250aWVyID0gZmlyc3RMaW5lO1xuICAgIHZhciBzdGFydCA9IFBvcyhmaXJzdExpbmUsIDApO1xuICAgIHRoaXMuc2VsID0gc2ltcGxlU2VsZWN0aW9uKHN0YXJ0KTtcbiAgICB0aGlzLmhpc3RvcnkgPSBuZXcgSGlzdG9yeShudWxsKTtcbiAgICB0aGlzLmlkID0gKytuZXh0RG9jSWQ7XG4gICAgdGhpcy5tb2RlT3B0aW9uID0gbW9kZTtcblxuICAgIGlmICh0eXBlb2YgdGV4dCA9PSBcInN0cmluZ1wiKSB0ZXh0ID0gc3BsaXRMaW5lcyh0ZXh0KTtcbiAgICB1cGRhdGVEb2ModGhpcywge2Zyb206IHN0YXJ0LCB0bzogc3RhcnQsIHRleHQ6IHRleHR9KTtcbiAgICBzZXRTZWxlY3Rpb24odGhpcywgc2ltcGxlU2VsZWN0aW9uKHN0YXJ0KSwgc2VsX2RvbnRTY3JvbGwpO1xuICB9O1xuXG4gIERvYy5wcm90b3R5cGUgPSBjcmVhdGVPYmooQnJhbmNoQ2h1bmsucHJvdG90eXBlLCB7XG4gICAgY29uc3RydWN0b3I6IERvYyxcbiAgICAvLyBJdGVyYXRlIG92ZXIgdGhlIGRvY3VtZW50LiBTdXBwb3J0cyB0d28gZm9ybXMgLS0gd2l0aCBvbmx5IG9uZVxuICAgIC8vIGFyZ3VtZW50LCBpdCBjYWxscyB0aGF0IGZvciBlYWNoIGxpbmUgaW4gdGhlIGRvY3VtZW50LiBXaXRoXG4gICAgLy8gdGhyZWUsIGl0IGl0ZXJhdGVzIG92ZXIgdGhlIHJhbmdlIGdpdmVuIGJ5IHRoZSBmaXJzdCB0d28gKHdpdGhcbiAgICAvLyB0aGUgc2Vjb25kIGJlaW5nIG5vbi1pbmNsdXNpdmUpLlxuICAgIGl0ZXI6IGZ1bmN0aW9uKGZyb20sIHRvLCBvcCkge1xuICAgICAgaWYgKG9wKSB0aGlzLml0ZXJOKGZyb20gLSB0aGlzLmZpcnN0LCB0byAtIGZyb20sIG9wKTtcbiAgICAgIGVsc2UgdGhpcy5pdGVyTih0aGlzLmZpcnN0LCB0aGlzLmZpcnN0ICsgdGhpcy5zaXplLCBmcm9tKTtcbiAgICB9LFxuXG4gICAgLy8gTm9uLXB1YmxpYyBpbnRlcmZhY2UgZm9yIGFkZGluZyBhbmQgcmVtb3ZpbmcgbGluZXMuXG4gICAgaW5zZXJ0OiBmdW5jdGlvbihhdCwgbGluZXMpIHtcbiAgICAgIHZhciBoZWlnaHQgPSAwO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7ICsraSkgaGVpZ2h0ICs9IGxpbmVzW2ldLmhlaWdodDtcbiAgICAgIHRoaXMuaW5zZXJ0SW5uZXIoYXQgLSB0aGlzLmZpcnN0LCBsaW5lcywgaGVpZ2h0KTtcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24oYXQsIG4pIHsgdGhpcy5yZW1vdmVJbm5lcihhdCAtIHRoaXMuZmlyc3QsIG4pOyB9LFxuXG4gICAgLy8gRnJvbSBoZXJlLCB0aGUgbWV0aG9kcyBhcmUgcGFydCBvZiB0aGUgcHVibGljIGludGVyZmFjZS4gTW9zdFxuICAgIC8vIGFyZSBhbHNvIGF2YWlsYWJsZSBmcm9tIENvZGVNaXJyb3IgKGVkaXRvcikgaW5zdGFuY2VzLlxuXG4gICAgZ2V0VmFsdWU6IGZ1bmN0aW9uKGxpbmVTZXApIHtcbiAgICAgIHZhciBsaW5lcyA9IGdldExpbmVzKHRoaXMsIHRoaXMuZmlyc3QsIHRoaXMuZmlyc3QgKyB0aGlzLnNpemUpO1xuICAgICAgaWYgKGxpbmVTZXAgPT09IGZhbHNlKSByZXR1cm4gbGluZXM7XG4gICAgICByZXR1cm4gbGluZXMuam9pbihsaW5lU2VwIHx8IFwiXFxuXCIpO1xuICAgIH0sXG4gICAgc2V0VmFsdWU6IGRvY01ldGhvZE9wKGZ1bmN0aW9uKGNvZGUpIHtcbiAgICAgIHZhciB0b3AgPSBQb3ModGhpcy5maXJzdCwgMCksIGxhc3QgPSB0aGlzLmZpcnN0ICsgdGhpcy5zaXplIC0gMTtcbiAgICAgIG1ha2VDaGFuZ2UodGhpcywge2Zyb206IHRvcCwgdG86IFBvcyhsYXN0LCBnZXRMaW5lKHRoaXMsIGxhc3QpLnRleHQubGVuZ3RoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IHNwbGl0TGluZXMoY29kZSksIG9yaWdpbjogXCJzZXRWYWx1ZVwifSwgdHJ1ZSk7XG4gICAgICBzZXRTZWxlY3Rpb24odGhpcywgc2ltcGxlU2VsZWN0aW9uKHRvcCkpO1xuICAgIH0pLFxuICAgIHJlcGxhY2VSYW5nZTogZnVuY3Rpb24oY29kZSwgZnJvbSwgdG8sIG9yaWdpbikge1xuICAgICAgZnJvbSA9IGNsaXBQb3ModGhpcywgZnJvbSk7XG4gICAgICB0byA9IHRvID8gY2xpcFBvcyh0aGlzLCB0bykgOiBmcm9tO1xuICAgICAgcmVwbGFjZVJhbmdlKHRoaXMsIGNvZGUsIGZyb20sIHRvLCBvcmlnaW4pO1xuICAgIH0sXG4gICAgZ2V0UmFuZ2U6IGZ1bmN0aW9uKGZyb20sIHRvLCBsaW5lU2VwKSB7XG4gICAgICB2YXIgbGluZXMgPSBnZXRCZXR3ZWVuKHRoaXMsIGNsaXBQb3ModGhpcywgZnJvbSksIGNsaXBQb3ModGhpcywgdG8pKTtcbiAgICAgIGlmIChsaW5lU2VwID09PSBmYWxzZSkgcmV0dXJuIGxpbmVzO1xuICAgICAgcmV0dXJuIGxpbmVzLmpvaW4obGluZVNlcCB8fCBcIlxcblwiKTtcbiAgICB9LFxuXG4gICAgZ2V0TGluZTogZnVuY3Rpb24obGluZSkge3ZhciBsID0gdGhpcy5nZXRMaW5lSGFuZGxlKGxpbmUpOyByZXR1cm4gbCAmJiBsLnRleHQ7fSxcblxuICAgIGdldExpbmVIYW5kbGU6IGZ1bmN0aW9uKGxpbmUpIHtpZiAoaXNMaW5lKHRoaXMsIGxpbmUpKSByZXR1cm4gZ2V0TGluZSh0aGlzLCBsaW5lKTt9LFxuICAgIGdldExpbmVOdW1iZXI6IGZ1bmN0aW9uKGxpbmUpIHtyZXR1cm4gbGluZU5vKGxpbmUpO30sXG5cbiAgICBnZXRMaW5lSGFuZGxlVmlzdWFsU3RhcnQ6IGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIGlmICh0eXBlb2YgbGluZSA9PSBcIm51bWJlclwiKSBsaW5lID0gZ2V0TGluZSh0aGlzLCBsaW5lKTtcbiAgICAgIHJldHVybiB2aXN1YWxMaW5lKGxpbmUpO1xuICAgIH0sXG5cbiAgICBsaW5lQ291bnQ6IGZ1bmN0aW9uKCkge3JldHVybiB0aGlzLnNpemU7fSxcbiAgICBmaXJzdExpbmU6IGZ1bmN0aW9uKCkge3JldHVybiB0aGlzLmZpcnN0O30sXG4gICAgbGFzdExpbmU6IGZ1bmN0aW9uKCkge3JldHVybiB0aGlzLmZpcnN0ICsgdGhpcy5zaXplIC0gMTt9LFxuXG4gICAgY2xpcFBvczogZnVuY3Rpb24ocG9zKSB7cmV0dXJuIGNsaXBQb3ModGhpcywgcG9zKTt9LFxuXG4gICAgZ2V0Q3Vyc29yOiBmdW5jdGlvbihzdGFydCkge1xuICAgICAgdmFyIHJhbmdlID0gdGhpcy5zZWwucHJpbWFyeSgpLCBwb3M7XG4gICAgICBpZiAoc3RhcnQgPT0gbnVsbCB8fCBzdGFydCA9PSBcImhlYWRcIikgcG9zID0gcmFuZ2UuaGVhZDtcbiAgICAgIGVsc2UgaWYgKHN0YXJ0ID09IFwiYW5jaG9yXCIpIHBvcyA9IHJhbmdlLmFuY2hvcjtcbiAgICAgIGVsc2UgaWYgKHN0YXJ0ID09IFwiZW5kXCIgfHwgc3RhcnQgPT0gXCJ0b1wiIHx8IHN0YXJ0ID09PSBmYWxzZSkgcG9zID0gcmFuZ2UudG8oKTtcbiAgICAgIGVsc2UgcG9zID0gcmFuZ2UuZnJvbSgpO1xuICAgICAgcmV0dXJuIHBvcztcbiAgICB9LFxuICAgIGxpc3RTZWxlY3Rpb25zOiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuc2VsLnJhbmdlczsgfSxcbiAgICBzb21ldGhpbmdTZWxlY3RlZDogZnVuY3Rpb24oKSB7cmV0dXJuIHRoaXMuc2VsLnNvbWV0aGluZ1NlbGVjdGVkKCk7fSxcblxuICAgIHNldEN1cnNvcjogZG9jTWV0aG9kT3AoZnVuY3Rpb24obGluZSwgY2gsIG9wdGlvbnMpIHtcbiAgICAgIHNldFNpbXBsZVNlbGVjdGlvbih0aGlzLCBjbGlwUG9zKHRoaXMsIHR5cGVvZiBsaW5lID09IFwibnVtYmVyXCIgPyBQb3MobGluZSwgY2ggfHwgMCkgOiBsaW5lKSwgbnVsbCwgb3B0aW9ucyk7XG4gICAgfSksXG4gICAgc2V0U2VsZWN0aW9uOiBkb2NNZXRob2RPcChmdW5jdGlvbihhbmNob3IsIGhlYWQsIG9wdGlvbnMpIHtcbiAgICAgIHNldFNpbXBsZVNlbGVjdGlvbih0aGlzLCBjbGlwUG9zKHRoaXMsIGFuY2hvciksIGNsaXBQb3ModGhpcywgaGVhZCB8fCBhbmNob3IpLCBvcHRpb25zKTtcbiAgICB9KSxcbiAgICBleHRlbmRTZWxlY3Rpb246IGRvY01ldGhvZE9wKGZ1bmN0aW9uKGhlYWQsIG90aGVyLCBvcHRpb25zKSB7XG4gICAgICBleHRlbmRTZWxlY3Rpb24odGhpcywgY2xpcFBvcyh0aGlzLCBoZWFkKSwgb3RoZXIgJiYgY2xpcFBvcyh0aGlzLCBvdGhlciksIG9wdGlvbnMpO1xuICAgIH0pLFxuICAgIGV4dGVuZFNlbGVjdGlvbnM6IGRvY01ldGhvZE9wKGZ1bmN0aW9uKGhlYWRzLCBvcHRpb25zKSB7XG4gICAgICBleHRlbmRTZWxlY3Rpb25zKHRoaXMsIGNsaXBQb3NBcnJheSh0aGlzLCBoZWFkcywgb3B0aW9ucykpO1xuICAgIH0pLFxuICAgIGV4dGVuZFNlbGVjdGlvbnNCeTogZG9jTWV0aG9kT3AoZnVuY3Rpb24oZiwgb3B0aW9ucykge1xuICAgICAgZXh0ZW5kU2VsZWN0aW9ucyh0aGlzLCBtYXAodGhpcy5zZWwucmFuZ2VzLCBmKSwgb3B0aW9ucyk7XG4gICAgfSksXG4gICAgc2V0U2VsZWN0aW9uczogZG9jTWV0aG9kT3AoZnVuY3Rpb24ocmFuZ2VzLCBwcmltYXJ5LCBvcHRpb25zKSB7XG4gICAgICBpZiAoIXJhbmdlcy5sZW5ndGgpIHJldHVybjtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBvdXQgPSBbXTsgaSA8IHJhbmdlcy5sZW5ndGg7IGkrKylcbiAgICAgICAgb3V0W2ldID0gbmV3IFJhbmdlKGNsaXBQb3ModGhpcywgcmFuZ2VzW2ldLmFuY2hvciksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBjbGlwUG9zKHRoaXMsIHJhbmdlc1tpXS5oZWFkKSk7XG4gICAgICBpZiAocHJpbWFyeSA9PSBudWxsKSBwcmltYXJ5ID0gTWF0aC5taW4ocmFuZ2VzLmxlbmd0aCAtIDEsIHRoaXMuc2VsLnByaW1JbmRleCk7XG4gICAgICBzZXRTZWxlY3Rpb24odGhpcywgbm9ybWFsaXplU2VsZWN0aW9uKG91dCwgcHJpbWFyeSksIG9wdGlvbnMpO1xuICAgIH0pLFxuICAgIGFkZFNlbGVjdGlvbjogZG9jTWV0aG9kT3AoZnVuY3Rpb24oYW5jaG9yLCBoZWFkLCBvcHRpb25zKSB7XG4gICAgICB2YXIgcmFuZ2VzID0gdGhpcy5zZWwucmFuZ2VzLnNsaWNlKDApO1xuICAgICAgcmFuZ2VzLnB1c2gobmV3IFJhbmdlKGNsaXBQb3ModGhpcywgYW5jaG9yKSwgY2xpcFBvcyh0aGlzLCBoZWFkIHx8IGFuY2hvcikpKTtcbiAgICAgIHNldFNlbGVjdGlvbih0aGlzLCBub3JtYWxpemVTZWxlY3Rpb24ocmFuZ2VzLCByYW5nZXMubGVuZ3RoIC0gMSksIG9wdGlvbnMpO1xuICAgIH0pLFxuXG4gICAgZ2V0U2VsZWN0aW9uOiBmdW5jdGlvbihsaW5lU2VwKSB7XG4gICAgICB2YXIgcmFuZ2VzID0gdGhpcy5zZWwucmFuZ2VzLCBsaW5lcztcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzZWwgPSBnZXRCZXR3ZWVuKHRoaXMsIHJhbmdlc1tpXS5mcm9tKCksIHJhbmdlc1tpXS50bygpKTtcbiAgICAgICAgbGluZXMgPSBsaW5lcyA/IGxpbmVzLmNvbmNhdChzZWwpIDogc2VsO1xuICAgICAgfVxuICAgICAgaWYgKGxpbmVTZXAgPT09IGZhbHNlKSByZXR1cm4gbGluZXM7XG4gICAgICBlbHNlIHJldHVybiBsaW5lcy5qb2luKGxpbmVTZXAgfHwgXCJcXG5cIik7XG4gICAgfSxcbiAgICBnZXRTZWxlY3Rpb25zOiBmdW5jdGlvbihsaW5lU2VwKSB7XG4gICAgICB2YXIgcGFydHMgPSBbXSwgcmFuZ2VzID0gdGhpcy5zZWwucmFuZ2VzO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHNlbCA9IGdldEJldHdlZW4odGhpcywgcmFuZ2VzW2ldLmZyb20oKSwgcmFuZ2VzW2ldLnRvKCkpO1xuICAgICAgICBpZiAobGluZVNlcCAhPT0gZmFsc2UpIHNlbCA9IHNlbC5qb2luKGxpbmVTZXAgfHwgXCJcXG5cIik7XG4gICAgICAgIHBhcnRzW2ldID0gc2VsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHBhcnRzO1xuICAgIH0sXG4gICAgcmVwbGFjZVNlbGVjdGlvbjogZnVuY3Rpb24oY29kZSwgY29sbGFwc2UsIG9yaWdpbikge1xuICAgICAgdmFyIGR1cCA9IFtdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnNlbC5yYW5nZXMubGVuZ3RoOyBpKyspXG4gICAgICAgIGR1cFtpXSA9IGNvZGU7XG4gICAgICB0aGlzLnJlcGxhY2VTZWxlY3Rpb25zKGR1cCwgY29sbGFwc2UsIG9yaWdpbiB8fCBcIitpbnB1dFwiKTtcbiAgICB9LFxuICAgIHJlcGxhY2VTZWxlY3Rpb25zOiBkb2NNZXRob2RPcChmdW5jdGlvbihjb2RlLCBjb2xsYXBzZSwgb3JpZ2luKSB7XG4gICAgICB2YXIgY2hhbmdlcyA9IFtdLCBzZWwgPSB0aGlzLnNlbDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsLnJhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcmFuZ2UgPSBzZWwucmFuZ2VzW2ldO1xuICAgICAgICBjaGFuZ2VzW2ldID0ge2Zyb206IHJhbmdlLmZyb20oKSwgdG86IHJhbmdlLnRvKCksIHRleHQ6IHNwbGl0TGluZXMoY29kZVtpXSksIG9yaWdpbjogb3JpZ2lufTtcbiAgICAgIH1cbiAgICAgIHZhciBuZXdTZWwgPSBjb2xsYXBzZSAmJiBjb2xsYXBzZSAhPSBcImVuZFwiICYmIGNvbXB1dGVSZXBsYWNlZFNlbCh0aGlzLCBjaGFuZ2VzLCBjb2xsYXBzZSk7XG4gICAgICBmb3IgKHZhciBpID0gY2hhbmdlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSlcbiAgICAgICAgbWFrZUNoYW5nZSh0aGlzLCBjaGFuZ2VzW2ldKTtcbiAgICAgIGlmIChuZXdTZWwpIHNldFNlbGVjdGlvblJlcGxhY2VIaXN0b3J5KHRoaXMsIG5ld1NlbCk7XG4gICAgICBlbHNlIGlmICh0aGlzLmNtKSBlbnN1cmVDdXJzb3JWaXNpYmxlKHRoaXMuY20pO1xuICAgIH0pLFxuICAgIHVuZG86IGRvY01ldGhvZE9wKGZ1bmN0aW9uKCkge21ha2VDaGFuZ2VGcm9tSGlzdG9yeSh0aGlzLCBcInVuZG9cIik7fSksXG4gICAgcmVkbzogZG9jTWV0aG9kT3AoZnVuY3Rpb24oKSB7bWFrZUNoYW5nZUZyb21IaXN0b3J5KHRoaXMsIFwicmVkb1wiKTt9KSxcbiAgICB1bmRvU2VsZWN0aW9uOiBkb2NNZXRob2RPcChmdW5jdGlvbigpIHttYWtlQ2hhbmdlRnJvbUhpc3RvcnkodGhpcywgXCJ1bmRvXCIsIHRydWUpO30pLFxuICAgIHJlZG9TZWxlY3Rpb246IGRvY01ldGhvZE9wKGZ1bmN0aW9uKCkge21ha2VDaGFuZ2VGcm9tSGlzdG9yeSh0aGlzLCBcInJlZG9cIiwgdHJ1ZSk7fSksXG5cbiAgICBzZXRFeHRlbmRpbmc6IGZ1bmN0aW9uKHZhbCkge3RoaXMuZXh0ZW5kID0gdmFsO30sXG4gICAgZ2V0RXh0ZW5kaW5nOiBmdW5jdGlvbigpIHtyZXR1cm4gdGhpcy5leHRlbmQ7fSxcblxuICAgIGhpc3RvcnlTaXplOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBoaXN0ID0gdGhpcy5oaXN0b3J5LCBkb25lID0gMCwgdW5kb25lID0gMDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGlzdC5kb25lLmxlbmd0aDsgaSsrKSBpZiAoIWhpc3QuZG9uZVtpXS5yYW5nZXMpICsrZG9uZTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGlzdC51bmRvbmUubGVuZ3RoOyBpKyspIGlmICghaGlzdC51bmRvbmVbaV0ucmFuZ2VzKSArK3VuZG9uZTtcbiAgICAgIHJldHVybiB7dW5kbzogZG9uZSwgcmVkbzogdW5kb25lfTtcbiAgICB9LFxuICAgIGNsZWFySGlzdG9yeTogZnVuY3Rpb24oKSB7dGhpcy5oaXN0b3J5ID0gbmV3IEhpc3RvcnkodGhpcy5oaXN0b3J5Lm1heEdlbmVyYXRpb24pO30sXG5cbiAgICBtYXJrQ2xlYW46IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5jbGVhbkdlbmVyYXRpb24gPSB0aGlzLmNoYW5nZUdlbmVyYXRpb24odHJ1ZSk7XG4gICAgfSxcbiAgICBjaGFuZ2VHZW5lcmF0aW9uOiBmdW5jdGlvbihmb3JjZVNwbGl0KSB7XG4gICAgICBpZiAoZm9yY2VTcGxpdClcbiAgICAgICAgdGhpcy5oaXN0b3J5Lmxhc3RPcCA9IHRoaXMuaGlzdG9yeS5sYXN0T3JpZ2luID0gbnVsbDtcbiAgICAgIHJldHVybiB0aGlzLmhpc3RvcnkuZ2VuZXJhdGlvbjtcbiAgICB9LFxuICAgIGlzQ2xlYW46IGZ1bmN0aW9uIChnZW4pIHtcbiAgICAgIHJldHVybiB0aGlzLmhpc3RvcnkuZ2VuZXJhdGlvbiA9PSAoZ2VuIHx8IHRoaXMuY2xlYW5HZW5lcmF0aW9uKTtcbiAgICB9LFxuXG4gICAgZ2V0SGlzdG9yeTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge2RvbmU6IGNvcHlIaXN0b3J5QXJyYXkodGhpcy5oaXN0b3J5LmRvbmUpLFxuICAgICAgICAgICAgICB1bmRvbmU6IGNvcHlIaXN0b3J5QXJyYXkodGhpcy5oaXN0b3J5LnVuZG9uZSl9O1xuICAgIH0sXG4gICAgc2V0SGlzdG9yeTogZnVuY3Rpb24oaGlzdERhdGEpIHtcbiAgICAgIHZhciBoaXN0ID0gdGhpcy5oaXN0b3J5ID0gbmV3IEhpc3RvcnkodGhpcy5oaXN0b3J5Lm1heEdlbmVyYXRpb24pO1xuICAgICAgaGlzdC5kb25lID0gY29weUhpc3RvcnlBcnJheShoaXN0RGF0YS5kb25lLnNsaWNlKDApLCBudWxsLCB0cnVlKTtcbiAgICAgIGhpc3QudW5kb25lID0gY29weUhpc3RvcnlBcnJheShoaXN0RGF0YS51bmRvbmUuc2xpY2UoMCksIG51bGwsIHRydWUpO1xuICAgIH0sXG5cbiAgICBtYXJrVGV4dDogZnVuY3Rpb24oZnJvbSwgdG8sIG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiBtYXJrVGV4dCh0aGlzLCBjbGlwUG9zKHRoaXMsIGZyb20pLCBjbGlwUG9zKHRoaXMsIHRvKSwgb3B0aW9ucywgXCJyYW5nZVwiKTtcbiAgICB9LFxuICAgIHNldEJvb2ttYXJrOiBmdW5jdGlvbihwb3MsIG9wdGlvbnMpIHtcbiAgICAgIHZhciByZWFsT3B0cyA9IHtyZXBsYWNlZFdpdGg6IG9wdGlvbnMgJiYgKG9wdGlvbnMubm9kZVR5cGUgPT0gbnVsbCA/IG9wdGlvbnMud2lkZ2V0IDogb3B0aW9ucyksXG4gICAgICAgICAgICAgICAgICAgICAgaW5zZXJ0TGVmdDogb3B0aW9ucyAmJiBvcHRpb25zLmluc2VydExlZnQsXG4gICAgICAgICAgICAgICAgICAgICAgY2xlYXJXaGVuRW1wdHk6IGZhbHNlLCBzaGFyZWQ6IG9wdGlvbnMgJiYgb3B0aW9ucy5zaGFyZWR9O1xuICAgICAgcG9zID0gY2xpcFBvcyh0aGlzLCBwb3MpO1xuICAgICAgcmV0dXJuIG1hcmtUZXh0KHRoaXMsIHBvcywgcG9zLCByZWFsT3B0cywgXCJib29rbWFya1wiKTtcbiAgICB9LFxuICAgIGZpbmRNYXJrc0F0OiBmdW5jdGlvbihwb3MpIHtcbiAgICAgIHBvcyA9IGNsaXBQb3ModGhpcywgcG9zKTtcbiAgICAgIHZhciBtYXJrZXJzID0gW10sIHNwYW5zID0gZ2V0TGluZSh0aGlzLCBwb3MubGluZSkubWFya2VkU3BhbnM7XG4gICAgICBpZiAoc3BhbnMpIGZvciAodmFyIGkgPSAwOyBpIDwgc3BhbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIHNwYW4gPSBzcGFuc1tpXTtcbiAgICAgICAgaWYgKChzcGFuLmZyb20gPT0gbnVsbCB8fCBzcGFuLmZyb20gPD0gcG9zLmNoKSAmJlxuICAgICAgICAgICAgKHNwYW4udG8gPT0gbnVsbCB8fCBzcGFuLnRvID49IHBvcy5jaCkpXG4gICAgICAgICAgbWFya2Vycy5wdXNoKHNwYW4ubWFya2VyLnBhcmVudCB8fCBzcGFuLm1hcmtlcik7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWFya2VycztcbiAgICB9LFxuICAgIGZpbmRNYXJrczogZnVuY3Rpb24oZnJvbSwgdG8sIGZpbHRlcikge1xuICAgICAgZnJvbSA9IGNsaXBQb3ModGhpcywgZnJvbSk7IHRvID0gY2xpcFBvcyh0aGlzLCB0byk7XG4gICAgICB2YXIgZm91bmQgPSBbXSwgbGluZU5vID0gZnJvbS5saW5lO1xuICAgICAgdGhpcy5pdGVyKGZyb20ubGluZSwgdG8ubGluZSArIDEsIGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgdmFyIHNwYW5zID0gbGluZS5tYXJrZWRTcGFucztcbiAgICAgICAgaWYgKHNwYW5zKSBmb3IgKHZhciBpID0gMDsgaSA8IHNwYW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIHNwYW4gPSBzcGFuc1tpXTtcbiAgICAgICAgICBpZiAoIShsaW5lTm8gPT0gZnJvbS5saW5lICYmIGZyb20uY2ggPiBzcGFuLnRvIHx8XG4gICAgICAgICAgICAgICAgc3Bhbi5mcm9tID09IG51bGwgJiYgbGluZU5vICE9IGZyb20ubGluZXx8XG4gICAgICAgICAgICAgICAgbGluZU5vID09IHRvLmxpbmUgJiYgc3Bhbi5mcm9tID4gdG8uY2gpICYmXG4gICAgICAgICAgICAgICghZmlsdGVyIHx8IGZpbHRlcihzcGFuLm1hcmtlcikpKVxuICAgICAgICAgICAgZm91bmQucHVzaChzcGFuLm1hcmtlci5wYXJlbnQgfHwgc3Bhbi5tYXJrZXIpO1xuICAgICAgICB9XG4gICAgICAgICsrbGluZU5vO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gZm91bmQ7XG4gICAgfSxcbiAgICBnZXRBbGxNYXJrczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbWFya2VycyA9IFtdO1xuICAgICAgdGhpcy5pdGVyKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgdmFyIHNwcyA9IGxpbmUubWFya2VkU3BhbnM7XG4gICAgICAgIGlmIChzcHMpIGZvciAodmFyIGkgPSAwOyBpIDwgc3BzLmxlbmd0aDsgKytpKVxuICAgICAgICAgIGlmIChzcHNbaV0uZnJvbSAhPSBudWxsKSBtYXJrZXJzLnB1c2goc3BzW2ldLm1hcmtlcik7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBtYXJrZXJzO1xuICAgIH0sXG5cbiAgICBwb3NGcm9tSW5kZXg6IGZ1bmN0aW9uKG9mZikge1xuICAgICAgdmFyIGNoLCBsaW5lTm8gPSB0aGlzLmZpcnN0O1xuICAgICAgdGhpcy5pdGVyKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgdmFyIHN6ID0gbGluZS50ZXh0Lmxlbmd0aCArIDE7XG4gICAgICAgIGlmIChzeiA+IG9mZikgeyBjaCA9IG9mZjsgcmV0dXJuIHRydWU7IH1cbiAgICAgICAgb2ZmIC09IHN6O1xuICAgICAgICArK2xpbmVObztcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGNsaXBQb3ModGhpcywgUG9zKGxpbmVObywgY2gpKTtcbiAgICB9LFxuICAgIGluZGV4RnJvbVBvczogZnVuY3Rpb24gKGNvb3Jkcykge1xuICAgICAgY29vcmRzID0gY2xpcFBvcyh0aGlzLCBjb29yZHMpO1xuICAgICAgdmFyIGluZGV4ID0gY29vcmRzLmNoO1xuICAgICAgaWYgKGNvb3Jkcy5saW5lIDwgdGhpcy5maXJzdCB8fCBjb29yZHMuY2ggPCAwKSByZXR1cm4gMDtcbiAgICAgIHRoaXMuaXRlcih0aGlzLmZpcnN0LCBjb29yZHMubGluZSwgZnVuY3Rpb24gKGxpbmUpIHtcbiAgICAgICAgaW5kZXggKz0gbGluZS50ZXh0Lmxlbmd0aCArIDE7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBpbmRleDtcbiAgICB9LFxuXG4gICAgY29weTogZnVuY3Rpb24oY29weUhpc3RvcnkpIHtcbiAgICAgIHZhciBkb2MgPSBuZXcgRG9jKGdldExpbmVzKHRoaXMsIHRoaXMuZmlyc3QsIHRoaXMuZmlyc3QgKyB0aGlzLnNpemUpLCB0aGlzLm1vZGVPcHRpb24sIHRoaXMuZmlyc3QpO1xuICAgICAgZG9jLnNjcm9sbFRvcCA9IHRoaXMuc2Nyb2xsVG9wOyBkb2Muc2Nyb2xsTGVmdCA9IHRoaXMuc2Nyb2xsTGVmdDtcbiAgICAgIGRvYy5zZWwgPSB0aGlzLnNlbDtcbiAgICAgIGRvYy5leHRlbmQgPSBmYWxzZTtcbiAgICAgIGlmIChjb3B5SGlzdG9yeSkge1xuICAgICAgICBkb2MuaGlzdG9yeS51bmRvRGVwdGggPSB0aGlzLmhpc3RvcnkudW5kb0RlcHRoO1xuICAgICAgICBkb2Muc2V0SGlzdG9yeSh0aGlzLmdldEhpc3RvcnkoKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZG9jO1xuICAgIH0sXG5cbiAgICBsaW5rZWREb2M6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIGlmICghb3B0aW9ucykgb3B0aW9ucyA9IHt9O1xuICAgICAgdmFyIGZyb20gPSB0aGlzLmZpcnN0LCB0byA9IHRoaXMuZmlyc3QgKyB0aGlzLnNpemU7XG4gICAgICBpZiAob3B0aW9ucy5mcm9tICE9IG51bGwgJiYgb3B0aW9ucy5mcm9tID4gZnJvbSkgZnJvbSA9IG9wdGlvbnMuZnJvbTtcbiAgICAgIGlmIChvcHRpb25zLnRvICE9IG51bGwgJiYgb3B0aW9ucy50byA8IHRvKSB0byA9IG9wdGlvbnMudG87XG4gICAgICB2YXIgY29weSA9IG5ldyBEb2MoZ2V0TGluZXModGhpcywgZnJvbSwgdG8pLCBvcHRpb25zLm1vZGUgfHwgdGhpcy5tb2RlT3B0aW9uLCBmcm9tKTtcbiAgICAgIGlmIChvcHRpb25zLnNoYXJlZEhpc3QpIGNvcHkuaGlzdG9yeSA9IHRoaXMuaGlzdG9yeTtcbiAgICAgICh0aGlzLmxpbmtlZCB8fCAodGhpcy5saW5rZWQgPSBbXSkpLnB1c2goe2RvYzogY29weSwgc2hhcmVkSGlzdDogb3B0aW9ucy5zaGFyZWRIaXN0fSk7XG4gICAgICBjb3B5LmxpbmtlZCA9IFt7ZG9jOiB0aGlzLCBpc1BhcmVudDogdHJ1ZSwgc2hhcmVkSGlzdDogb3B0aW9ucy5zaGFyZWRIaXN0fV07XG4gICAgICBjb3B5U2hhcmVkTWFya2Vycyhjb3B5LCBmaW5kU2hhcmVkTWFya2Vycyh0aGlzKSk7XG4gICAgICByZXR1cm4gY29weTtcbiAgICB9LFxuICAgIHVubGlua0RvYzogZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgIGlmIChvdGhlciBpbnN0YW5jZW9mIENvZGVNaXJyb3IpIG90aGVyID0gb3RoZXIuZG9jO1xuICAgICAgaWYgKHRoaXMubGlua2VkKSBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGlua2VkLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBsaW5rID0gdGhpcy5saW5rZWRbaV07XG4gICAgICAgIGlmIChsaW5rLmRvYyAhPSBvdGhlcikgY29udGludWU7XG4gICAgICAgIHRoaXMubGlua2VkLnNwbGljZShpLCAxKTtcbiAgICAgICAgb3RoZXIudW5saW5rRG9jKHRoaXMpO1xuICAgICAgICBkZXRhY2hTaGFyZWRNYXJrZXJzKGZpbmRTaGFyZWRNYXJrZXJzKHRoaXMpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICAvLyBJZiB0aGUgaGlzdG9yaWVzIHdlcmUgc2hhcmVkLCBzcGxpdCB0aGVtIGFnYWluXG4gICAgICBpZiAob3RoZXIuaGlzdG9yeSA9PSB0aGlzLmhpc3RvcnkpIHtcbiAgICAgICAgdmFyIHNwbGl0SWRzID0gW290aGVyLmlkXTtcbiAgICAgICAgbGlua2VkRG9jcyhvdGhlciwgZnVuY3Rpb24oZG9jKSB7c3BsaXRJZHMucHVzaChkb2MuaWQpO30sIHRydWUpO1xuICAgICAgICBvdGhlci5oaXN0b3J5ID0gbmV3IEhpc3RvcnkobnVsbCk7XG4gICAgICAgIG90aGVyLmhpc3RvcnkuZG9uZSA9IGNvcHlIaXN0b3J5QXJyYXkodGhpcy5oaXN0b3J5LmRvbmUsIHNwbGl0SWRzKTtcbiAgICAgICAgb3RoZXIuaGlzdG9yeS51bmRvbmUgPSBjb3B5SGlzdG9yeUFycmF5KHRoaXMuaGlzdG9yeS51bmRvbmUsIHNwbGl0SWRzKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGl0ZXJMaW5rZWREb2NzOiBmdW5jdGlvbihmKSB7bGlua2VkRG9jcyh0aGlzLCBmKTt9LFxuXG4gICAgZ2V0TW9kZTogZnVuY3Rpb24oKSB7cmV0dXJuIHRoaXMubW9kZTt9LFxuICAgIGdldEVkaXRvcjogZnVuY3Rpb24oKSB7cmV0dXJuIHRoaXMuY207fVxuICB9KTtcblxuICAvLyBQdWJsaWMgYWxpYXMuXG4gIERvYy5wcm90b3R5cGUuZWFjaExpbmUgPSBEb2MucHJvdG90eXBlLml0ZXI7XG5cbiAgLy8gU2V0IHVwIG1ldGhvZHMgb24gQ29kZU1pcnJvcidzIHByb3RvdHlwZSB0byByZWRpcmVjdCB0byB0aGUgZWRpdG9yJ3MgZG9jdW1lbnQuXG4gIHZhciBkb250RGVsZWdhdGUgPSBcIml0ZXIgaW5zZXJ0IHJlbW92ZSBjb3B5IGdldEVkaXRvclwiLnNwbGl0KFwiIFwiKTtcbiAgZm9yICh2YXIgcHJvcCBpbiBEb2MucHJvdG90eXBlKSBpZiAoRG9jLnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eShwcm9wKSAmJiBpbmRleE9mKGRvbnREZWxlZ2F0ZSwgcHJvcCkgPCAwKVxuICAgIENvZGVNaXJyb3IucHJvdG90eXBlW3Byb3BdID0gKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge3JldHVybiBtZXRob2QuYXBwbHkodGhpcy5kb2MsIGFyZ3VtZW50cyk7fTtcbiAgICB9KShEb2MucHJvdG90eXBlW3Byb3BdKTtcblxuICBldmVudE1peGluKERvYyk7XG5cbiAgLy8gQ2FsbCBmIGZvciBhbGwgbGlua2VkIGRvY3VtZW50cy5cbiAgZnVuY3Rpb24gbGlua2VkRG9jcyhkb2MsIGYsIHNoYXJlZEhpc3RPbmx5KSB7XG4gICAgZnVuY3Rpb24gcHJvcGFnYXRlKGRvYywgc2tpcCwgc2hhcmVkSGlzdCkge1xuICAgICAgaWYgKGRvYy5saW5rZWQpIGZvciAodmFyIGkgPSAwOyBpIDwgZG9jLmxpbmtlZC5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgcmVsID0gZG9jLmxpbmtlZFtpXTtcbiAgICAgICAgaWYgKHJlbC5kb2MgPT0gc2tpcCkgY29udGludWU7XG4gICAgICAgIHZhciBzaGFyZWQgPSBzaGFyZWRIaXN0ICYmIHJlbC5zaGFyZWRIaXN0O1xuICAgICAgICBpZiAoc2hhcmVkSGlzdE9ubHkgJiYgIXNoYXJlZCkgY29udGludWU7XG4gICAgICAgIGYocmVsLmRvYywgc2hhcmVkKTtcbiAgICAgICAgcHJvcGFnYXRlKHJlbC5kb2MsIGRvYywgc2hhcmVkKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcHJvcGFnYXRlKGRvYywgbnVsbCwgdHJ1ZSk7XG4gIH1cblxuICAvLyBBdHRhY2ggYSBkb2N1bWVudCB0byBhbiBlZGl0b3IuXG4gIGZ1bmN0aW9uIGF0dGFjaERvYyhjbSwgZG9jKSB7XG4gICAgaWYgKGRvYy5jbSkgdGhyb3cgbmV3IEVycm9yKFwiVGhpcyBkb2N1bWVudCBpcyBhbHJlYWR5IGluIHVzZS5cIik7XG4gICAgY20uZG9jID0gZG9jO1xuICAgIGRvYy5jbSA9IGNtO1xuICAgIGVzdGltYXRlTGluZUhlaWdodHMoY20pO1xuICAgIGxvYWRNb2RlKGNtKTtcbiAgICBpZiAoIWNtLm9wdGlvbnMubGluZVdyYXBwaW5nKSBmaW5kTWF4TGluZShjbSk7XG4gICAgY20ub3B0aW9ucy5tb2RlID0gZG9jLm1vZGVPcHRpb247XG4gICAgcmVnQ2hhbmdlKGNtKTtcbiAgfVxuXG4gIC8vIExJTkUgVVRJTElUSUVTXG5cbiAgLy8gRmluZCB0aGUgbGluZSBvYmplY3QgY29ycmVzcG9uZGluZyB0byB0aGUgZ2l2ZW4gbGluZSBudW1iZXIuXG4gIGZ1bmN0aW9uIGdldExpbmUoZG9jLCBuKSB7XG4gICAgbiAtPSBkb2MuZmlyc3Q7XG4gICAgaWYgKG4gPCAwIHx8IG4gPj0gZG9jLnNpemUpIHRocm93IG5ldyBFcnJvcihcIlRoZXJlIGlzIG5vIGxpbmUgXCIgKyAobiArIGRvYy5maXJzdCkgKyBcIiBpbiB0aGUgZG9jdW1lbnQuXCIpO1xuICAgIGZvciAodmFyIGNodW5rID0gZG9jOyAhY2h1bmsubGluZXM7KSB7XG4gICAgICBmb3IgKHZhciBpID0gMDs7ICsraSkge1xuICAgICAgICB2YXIgY2hpbGQgPSBjaHVuay5jaGlsZHJlbltpXSwgc3ogPSBjaGlsZC5jaHVua1NpemUoKTtcbiAgICAgICAgaWYgKG4gPCBzeikgeyBjaHVuayA9IGNoaWxkOyBicmVhazsgfVxuICAgICAgICBuIC09IHN6O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY2h1bmsubGluZXNbbl07XG4gIH1cblxuICAvLyBHZXQgdGhlIHBhcnQgb2YgYSBkb2N1bWVudCBiZXR3ZWVuIHR3byBwb3NpdGlvbnMsIGFzIGFuIGFycmF5IG9mXG4gIC8vIHN0cmluZ3MuXG4gIGZ1bmN0aW9uIGdldEJldHdlZW4oZG9jLCBzdGFydCwgZW5kKSB7XG4gICAgdmFyIG91dCA9IFtdLCBuID0gc3RhcnQubGluZTtcbiAgICBkb2MuaXRlcihzdGFydC5saW5lLCBlbmQubGluZSArIDEsIGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIHZhciB0ZXh0ID0gbGluZS50ZXh0O1xuICAgICAgaWYgKG4gPT0gZW5kLmxpbmUpIHRleHQgPSB0ZXh0LnNsaWNlKDAsIGVuZC5jaCk7XG4gICAgICBpZiAobiA9PSBzdGFydC5saW5lKSB0ZXh0ID0gdGV4dC5zbGljZShzdGFydC5jaCk7XG4gICAgICBvdXQucHVzaCh0ZXh0KTtcbiAgICAgICsrbjtcbiAgICB9KTtcbiAgICByZXR1cm4gb3V0O1xuICB9XG4gIC8vIEdldCB0aGUgbGluZXMgYmV0d2VlbiBmcm9tIGFuZCB0bywgYXMgYXJyYXkgb2Ygc3RyaW5ncy5cbiAgZnVuY3Rpb24gZ2V0TGluZXMoZG9jLCBmcm9tLCB0bykge1xuICAgIHZhciBvdXQgPSBbXTtcbiAgICBkb2MuaXRlcihmcm9tLCB0bywgZnVuY3Rpb24obGluZSkgeyBvdXQucHVzaChsaW5lLnRleHQpOyB9KTtcbiAgICByZXR1cm4gb3V0O1xuICB9XG5cbiAgLy8gVXBkYXRlIHRoZSBoZWlnaHQgb2YgYSBsaW5lLCBwcm9wYWdhdGluZyB0aGUgaGVpZ2h0IGNoYW5nZVxuICAvLyB1cHdhcmRzIHRvIHBhcmVudCBub2Rlcy5cbiAgZnVuY3Rpb24gdXBkYXRlTGluZUhlaWdodChsaW5lLCBoZWlnaHQpIHtcbiAgICB2YXIgZGlmZiA9IGhlaWdodCAtIGxpbmUuaGVpZ2h0O1xuICAgIGlmIChkaWZmKSBmb3IgKHZhciBuID0gbGluZTsgbjsgbiA9IG4ucGFyZW50KSBuLmhlaWdodCArPSBkaWZmO1xuICB9XG5cbiAgLy8gR2l2ZW4gYSBsaW5lIG9iamVjdCwgZmluZCBpdHMgbGluZSBudW1iZXIgYnkgd2Fsa2luZyB1cCB0aHJvdWdoXG4gIC8vIGl0cyBwYXJlbnQgbGlua3MuXG4gIGZ1bmN0aW9uIGxpbmVObyhsaW5lKSB7XG4gICAgaWYgKGxpbmUucGFyZW50ID09IG51bGwpIHJldHVybiBudWxsO1xuICAgIHZhciBjdXIgPSBsaW5lLnBhcmVudCwgbm8gPSBpbmRleE9mKGN1ci5saW5lcywgbGluZSk7XG4gICAgZm9yICh2YXIgY2h1bmsgPSBjdXIucGFyZW50OyBjaHVuazsgY3VyID0gY2h1bmssIGNodW5rID0gY2h1bmsucGFyZW50KSB7XG4gICAgICBmb3IgKHZhciBpID0gMDs7ICsraSkge1xuICAgICAgICBpZiAoY2h1bmsuY2hpbGRyZW5baV0gPT0gY3VyKSBicmVhaztcbiAgICAgICAgbm8gKz0gY2h1bmsuY2hpbGRyZW5baV0uY2h1bmtTaXplKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBubyArIGN1ci5maXJzdDtcbiAgfVxuXG4gIC8vIEZpbmQgdGhlIGxpbmUgYXQgdGhlIGdpdmVuIHZlcnRpY2FsIHBvc2l0aW9uLCB1c2luZyB0aGUgaGVpZ2h0XG4gIC8vIGluZm9ybWF0aW9uIGluIHRoZSBkb2N1bWVudCB0cmVlLlxuICBmdW5jdGlvbiBsaW5lQXRIZWlnaHQoY2h1bmssIGgpIHtcbiAgICB2YXIgbiA9IGNodW5rLmZpcnN0O1xuICAgIG91dGVyOiBkbyB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNodW5rLmNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBjaGlsZCA9IGNodW5rLmNoaWxkcmVuW2ldLCBjaCA9IGNoaWxkLmhlaWdodDtcbiAgICAgICAgaWYgKGggPCBjaCkgeyBjaHVuayA9IGNoaWxkOyBjb250aW51ZSBvdXRlcjsgfVxuICAgICAgICBoIC09IGNoO1xuICAgICAgICBuICs9IGNoaWxkLmNodW5rU2l6ZSgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG47XG4gICAgfSB3aGlsZSAoIWNodW5rLmxpbmVzKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNodW5rLmxpbmVzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgbGluZSA9IGNodW5rLmxpbmVzW2ldLCBsaCA9IGxpbmUuaGVpZ2h0O1xuICAgICAgaWYgKGggPCBsaCkgYnJlYWs7XG4gICAgICBoIC09IGxoO1xuICAgIH1cbiAgICByZXR1cm4gbiArIGk7XG4gIH1cblxuXG4gIC8vIEZpbmQgdGhlIGhlaWdodCBhYm92ZSB0aGUgZ2l2ZW4gbGluZS5cbiAgZnVuY3Rpb24gaGVpZ2h0QXRMaW5lKGxpbmVPYmopIHtcbiAgICBsaW5lT2JqID0gdmlzdWFsTGluZShsaW5lT2JqKTtcblxuICAgIHZhciBoID0gMCwgY2h1bmsgPSBsaW5lT2JqLnBhcmVudDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNodW5rLmxpbmVzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgbGluZSA9IGNodW5rLmxpbmVzW2ldO1xuICAgICAgaWYgKGxpbmUgPT0gbGluZU9iaikgYnJlYWs7XG4gICAgICBlbHNlIGggKz0gbGluZS5oZWlnaHQ7XG4gICAgfVxuICAgIGZvciAodmFyIHAgPSBjaHVuay5wYXJlbnQ7IHA7IGNodW5rID0gcCwgcCA9IGNodW5rLnBhcmVudCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwLmNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBjdXIgPSBwLmNoaWxkcmVuW2ldO1xuICAgICAgICBpZiAoY3VyID09IGNodW5rKSBicmVhaztcbiAgICAgICAgZWxzZSBoICs9IGN1ci5oZWlnaHQ7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBoO1xuICB9XG5cbiAgLy8gR2V0IHRoZSBiaWRpIG9yZGVyaW5nIGZvciB0aGUgZ2l2ZW4gbGluZSAoYW5kIGNhY2hlIGl0KS4gUmV0dXJuc1xuICAvLyBmYWxzZSBmb3IgbGluZXMgdGhhdCBhcmUgZnVsbHkgbGVmdC10by1yaWdodCwgYW5kIGFuIGFycmF5IG9mXG4gIC8vIEJpZGlTcGFuIG9iamVjdHMgb3RoZXJ3aXNlLlxuICBmdW5jdGlvbiBnZXRPcmRlcihsaW5lKSB7XG4gICAgdmFyIG9yZGVyID0gbGluZS5vcmRlcjtcbiAgICBpZiAob3JkZXIgPT0gbnVsbCkgb3JkZXIgPSBsaW5lLm9yZGVyID0gYmlkaU9yZGVyaW5nKGxpbmUudGV4dCk7XG4gICAgcmV0dXJuIG9yZGVyO1xuICB9XG5cbiAgLy8gSElTVE9SWVxuXG4gIGZ1bmN0aW9uIEhpc3Rvcnkoc3RhcnRHZW4pIHtcbiAgICAvLyBBcnJheXMgb2YgY2hhbmdlIGV2ZW50cyBhbmQgc2VsZWN0aW9ucy4gRG9pbmcgc29tZXRoaW5nIGFkZHMgYW5cbiAgICAvLyBldmVudCB0byBkb25lIGFuZCBjbGVhcnMgdW5kby4gVW5kb2luZyBtb3ZlcyBldmVudHMgZnJvbSBkb25lXG4gICAgLy8gdG8gdW5kb25lLCByZWRvaW5nIG1vdmVzIHRoZW0gaW4gdGhlIG90aGVyIGRpcmVjdGlvbi5cbiAgICB0aGlzLmRvbmUgPSBbXTsgdGhpcy51bmRvbmUgPSBbXTtcbiAgICB0aGlzLnVuZG9EZXB0aCA9IEluZmluaXR5O1xuICAgIC8vIFVzZWQgdG8gdHJhY2sgd2hlbiBjaGFuZ2VzIGNhbiBiZSBtZXJnZWQgaW50byBhIHNpbmdsZSB1bmRvXG4gICAgLy8gZXZlbnRcbiAgICB0aGlzLmxhc3RNb2RUaW1lID0gdGhpcy5sYXN0U2VsVGltZSA9IDA7XG4gICAgdGhpcy5sYXN0T3AgPSBudWxsO1xuICAgIHRoaXMubGFzdE9yaWdpbiA9IHRoaXMubGFzdFNlbE9yaWdpbiA9IG51bGw7XG4gICAgLy8gVXNlZCBieSB0aGUgaXNDbGVhbigpIG1ldGhvZFxuICAgIHRoaXMuZ2VuZXJhdGlvbiA9IHRoaXMubWF4R2VuZXJhdGlvbiA9IHN0YXJ0R2VuIHx8IDE7XG4gIH1cblxuICAvLyBDcmVhdGUgYSBoaXN0b3J5IGNoYW5nZSBldmVudCBmcm9tIGFuIHVwZGF0ZURvYy1zdHlsZSBjaGFuZ2VcbiAgLy8gb2JqZWN0LlxuICBmdW5jdGlvbiBoaXN0b3J5Q2hhbmdlRnJvbUNoYW5nZShkb2MsIGNoYW5nZSkge1xuICAgIHZhciBoaXN0Q2hhbmdlID0ge2Zyb206IGNvcHlQb3MoY2hhbmdlLmZyb20pLCB0bzogY2hhbmdlRW5kKGNoYW5nZSksIHRleHQ6IGdldEJldHdlZW4oZG9jLCBjaGFuZ2UuZnJvbSwgY2hhbmdlLnRvKX07XG4gICAgYXR0YWNoTG9jYWxTcGFucyhkb2MsIGhpc3RDaGFuZ2UsIGNoYW5nZS5mcm9tLmxpbmUsIGNoYW5nZS50by5saW5lICsgMSk7XG4gICAgbGlua2VkRG9jcyhkb2MsIGZ1bmN0aW9uKGRvYykge2F0dGFjaExvY2FsU3BhbnMoZG9jLCBoaXN0Q2hhbmdlLCBjaGFuZ2UuZnJvbS5saW5lLCBjaGFuZ2UudG8ubGluZSArIDEpO30sIHRydWUpO1xuICAgIHJldHVybiBoaXN0Q2hhbmdlO1xuICB9XG5cbiAgLy8gUG9wIGFsbCBzZWxlY3Rpb24gZXZlbnRzIG9mZiB0aGUgZW5kIG9mIGEgaGlzdG9yeSBhcnJheS4gU3RvcCBhdFxuICAvLyBhIGNoYW5nZSBldmVudC5cbiAgZnVuY3Rpb24gY2xlYXJTZWxlY3Rpb25FdmVudHMoYXJyYXkpIHtcbiAgICB3aGlsZSAoYXJyYXkubGVuZ3RoKSB7XG4gICAgICB2YXIgbGFzdCA9IGxzdChhcnJheSk7XG4gICAgICBpZiAobGFzdC5yYW5nZXMpIGFycmF5LnBvcCgpO1xuICAgICAgZWxzZSBicmVhaztcbiAgICB9XG4gIH1cblxuICAvLyBGaW5kIHRoZSB0b3AgY2hhbmdlIGV2ZW50IGluIHRoZSBoaXN0b3J5LiBQb3Agb2ZmIHNlbGVjdGlvblxuICAvLyBldmVudHMgdGhhdCBhcmUgaW4gdGhlIHdheS5cbiAgZnVuY3Rpb24gbGFzdENoYW5nZUV2ZW50KGhpc3QsIGZvcmNlKSB7XG4gICAgaWYgKGZvcmNlKSB7XG4gICAgICBjbGVhclNlbGVjdGlvbkV2ZW50cyhoaXN0LmRvbmUpO1xuICAgICAgcmV0dXJuIGxzdChoaXN0LmRvbmUpO1xuICAgIH0gZWxzZSBpZiAoaGlzdC5kb25lLmxlbmd0aCAmJiAhbHN0KGhpc3QuZG9uZSkucmFuZ2VzKSB7XG4gICAgICByZXR1cm4gbHN0KGhpc3QuZG9uZSk7XG4gICAgfSBlbHNlIGlmIChoaXN0LmRvbmUubGVuZ3RoID4gMSAmJiAhaGlzdC5kb25lW2hpc3QuZG9uZS5sZW5ndGggLSAyXS5yYW5nZXMpIHtcbiAgICAgIGhpc3QuZG9uZS5wb3AoKTtcbiAgICAgIHJldHVybiBsc3QoaGlzdC5kb25lKTtcbiAgICB9XG4gIH1cblxuICAvLyBSZWdpc3RlciBhIGNoYW5nZSBpbiB0aGUgaGlzdG9yeS4gTWVyZ2VzIGNoYW5nZXMgdGhhdCBhcmUgd2l0aGluXG4gIC8vIGEgc2luZ2xlIG9wZXJhdGlvbiwgb3JlIGFyZSBjbG9zZSB0b2dldGhlciB3aXRoIGFuIG9yaWdpbiB0aGF0XG4gIC8vIGFsbG93cyBtZXJnaW5nIChzdGFydGluZyB3aXRoIFwiK1wiKSBpbnRvIGEgc2luZ2xlIGV2ZW50LlxuICBmdW5jdGlvbiBhZGRDaGFuZ2VUb0hpc3RvcnkoZG9jLCBjaGFuZ2UsIHNlbEFmdGVyLCBvcElkKSB7XG4gICAgdmFyIGhpc3QgPSBkb2MuaGlzdG9yeTtcbiAgICBoaXN0LnVuZG9uZS5sZW5ndGggPSAwO1xuICAgIHZhciB0aW1lID0gK25ldyBEYXRlLCBjdXI7XG5cbiAgICBpZiAoKGhpc3QubGFzdE9wID09IG9wSWQgfHxcbiAgICAgICAgIGhpc3QubGFzdE9yaWdpbiA9PSBjaGFuZ2Uub3JpZ2luICYmIGNoYW5nZS5vcmlnaW4gJiZcbiAgICAgICAgICgoY2hhbmdlLm9yaWdpbi5jaGFyQXQoMCkgPT0gXCIrXCIgJiYgZG9jLmNtICYmIGhpc3QubGFzdE1vZFRpbWUgPiB0aW1lIC0gZG9jLmNtLm9wdGlvbnMuaGlzdG9yeUV2ZW50RGVsYXkpIHx8XG4gICAgICAgICAgY2hhbmdlLm9yaWdpbi5jaGFyQXQoMCkgPT0gXCIqXCIpKSAmJlxuICAgICAgICAoY3VyID0gbGFzdENoYW5nZUV2ZW50KGhpc3QsIGhpc3QubGFzdE9wID09IG9wSWQpKSkge1xuICAgICAgLy8gTWVyZ2UgdGhpcyBjaGFuZ2UgaW50byB0aGUgbGFzdCBldmVudFxuICAgICAgdmFyIGxhc3QgPSBsc3QoY3VyLmNoYW5nZXMpO1xuICAgICAgaWYgKGNtcChjaGFuZ2UuZnJvbSwgY2hhbmdlLnRvKSA9PSAwICYmIGNtcChjaGFuZ2UuZnJvbSwgbGFzdC50bykgPT0gMCkge1xuICAgICAgICAvLyBPcHRpbWl6ZWQgY2FzZSBmb3Igc2ltcGxlIGluc2VydGlvbiAtLSBkb24ndCB3YW50IHRvIGFkZFxuICAgICAgICAvLyBuZXcgY2hhbmdlc2V0cyBmb3IgZXZlcnkgY2hhcmFjdGVyIHR5cGVkXG4gICAgICAgIGxhc3QudG8gPSBjaGFuZ2VFbmQoY2hhbmdlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEFkZCBuZXcgc3ViLWV2ZW50XG4gICAgICAgIGN1ci5jaGFuZ2VzLnB1c2goaGlzdG9yeUNoYW5nZUZyb21DaGFuZ2UoZG9jLCBjaGFuZ2UpKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQ2FuIG5vdCBiZSBtZXJnZWQsIHN0YXJ0IGEgbmV3IGV2ZW50LlxuICAgICAgdmFyIGJlZm9yZSA9IGxzdChoaXN0LmRvbmUpO1xuICAgICAgaWYgKCFiZWZvcmUgfHwgIWJlZm9yZS5yYW5nZXMpXG4gICAgICAgIHB1c2hTZWxlY3Rpb25Ub0hpc3RvcnkoZG9jLnNlbCwgaGlzdC5kb25lKTtcbiAgICAgIGN1ciA9IHtjaGFuZ2VzOiBbaGlzdG9yeUNoYW5nZUZyb21DaGFuZ2UoZG9jLCBjaGFuZ2UpXSxcbiAgICAgICAgICAgICBnZW5lcmF0aW9uOiBoaXN0LmdlbmVyYXRpb259O1xuICAgICAgaGlzdC5kb25lLnB1c2goY3VyKTtcbiAgICAgIHdoaWxlIChoaXN0LmRvbmUubGVuZ3RoID4gaGlzdC51bmRvRGVwdGgpIHtcbiAgICAgICAgaGlzdC5kb25lLnNoaWZ0KCk7XG4gICAgICAgIGlmICghaGlzdC5kb25lWzBdLnJhbmdlcykgaGlzdC5kb25lLnNoaWZ0KCk7XG4gICAgICB9XG4gICAgfVxuICAgIGhpc3QuZG9uZS5wdXNoKHNlbEFmdGVyKTtcbiAgICBoaXN0LmdlbmVyYXRpb24gPSArK2hpc3QubWF4R2VuZXJhdGlvbjtcbiAgICBoaXN0Lmxhc3RNb2RUaW1lID0gaGlzdC5sYXN0U2VsVGltZSA9IHRpbWU7XG4gICAgaGlzdC5sYXN0T3AgPSBvcElkO1xuICAgIGhpc3QubGFzdE9yaWdpbiA9IGhpc3QubGFzdFNlbE9yaWdpbiA9IGNoYW5nZS5vcmlnaW47XG5cbiAgICBpZiAoIWxhc3QpIHNpZ25hbChkb2MsIFwiaGlzdG9yeUFkZGVkXCIpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2VsZWN0aW9uRXZlbnRDYW5CZU1lcmdlZChkb2MsIG9yaWdpbiwgcHJldiwgc2VsKSB7XG4gICAgdmFyIGNoID0gb3JpZ2luLmNoYXJBdCgwKTtcbiAgICByZXR1cm4gY2ggPT0gXCIqXCIgfHxcbiAgICAgIGNoID09IFwiK1wiICYmXG4gICAgICBwcmV2LnJhbmdlcy5sZW5ndGggPT0gc2VsLnJhbmdlcy5sZW5ndGggJiZcbiAgICAgIHByZXYuc29tZXRoaW5nU2VsZWN0ZWQoKSA9PSBzZWwuc29tZXRoaW5nU2VsZWN0ZWQoKSAmJlxuICAgICAgbmV3IERhdGUgLSBkb2MuaGlzdG9yeS5sYXN0U2VsVGltZSA8PSAoZG9jLmNtID8gZG9jLmNtLm9wdGlvbnMuaGlzdG9yeUV2ZW50RGVsYXkgOiA1MDApO1xuICB9XG5cbiAgLy8gQ2FsbGVkIHdoZW5ldmVyIHRoZSBzZWxlY3Rpb24gY2hhbmdlcywgc2V0cyB0aGUgbmV3IHNlbGVjdGlvbiBhc1xuICAvLyB0aGUgcGVuZGluZyBzZWxlY3Rpb24gaW4gdGhlIGhpc3RvcnksIGFuZCBwdXNoZXMgdGhlIG9sZCBwZW5kaW5nXG4gIC8vIHNlbGVjdGlvbiBpbnRvIHRoZSAnZG9uZScgYXJyYXkgd2hlbiBpdCB3YXMgc2lnbmlmaWNhbnRseVxuICAvLyBkaWZmZXJlbnQgKGluIG51bWJlciBvZiBzZWxlY3RlZCByYW5nZXMsIGVtcHRpbmVzcywgb3IgdGltZSkuXG4gIGZ1bmN0aW9uIGFkZFNlbGVjdGlvblRvSGlzdG9yeShkb2MsIHNlbCwgb3BJZCwgb3B0aW9ucykge1xuICAgIHZhciBoaXN0ID0gZG9jLmhpc3RvcnksIG9yaWdpbiA9IG9wdGlvbnMgJiYgb3B0aW9ucy5vcmlnaW47XG5cbiAgICAvLyBBIG5ldyBldmVudCBpcyBzdGFydGVkIHdoZW4gdGhlIHByZXZpb3VzIG9yaWdpbiBkb2VzIG5vdCBtYXRjaFxuICAgIC8vIHRoZSBjdXJyZW50LCBvciB0aGUgb3JpZ2lucyBkb24ndCBhbGxvdyBtYXRjaGluZy4gT3JpZ2luc1xuICAgIC8vIHN0YXJ0aW5nIHdpdGggKiBhcmUgYWx3YXlzIG1lcmdlZCwgdGhvc2Ugc3RhcnRpbmcgd2l0aCArIGFyZVxuICAgIC8vIG1lcmdlZCB3aGVuIHNpbWlsYXIgYW5kIGNsb3NlIHRvZ2V0aGVyIGluIHRpbWUuXG4gICAgaWYgKG9wSWQgPT0gaGlzdC5sYXN0T3AgfHxcbiAgICAgICAgKG9yaWdpbiAmJiBoaXN0Lmxhc3RTZWxPcmlnaW4gPT0gb3JpZ2luICYmXG4gICAgICAgICAoaGlzdC5sYXN0TW9kVGltZSA9PSBoaXN0Lmxhc3RTZWxUaW1lICYmIGhpc3QubGFzdE9yaWdpbiA9PSBvcmlnaW4gfHxcbiAgICAgICAgICBzZWxlY3Rpb25FdmVudENhbkJlTWVyZ2VkKGRvYywgb3JpZ2luLCBsc3QoaGlzdC5kb25lKSwgc2VsKSkpKVxuICAgICAgaGlzdC5kb25lW2hpc3QuZG9uZS5sZW5ndGggLSAxXSA9IHNlbDtcbiAgICBlbHNlXG4gICAgICBwdXNoU2VsZWN0aW9uVG9IaXN0b3J5KHNlbCwgaGlzdC5kb25lKTtcblxuICAgIGhpc3QubGFzdFNlbFRpbWUgPSArbmV3IERhdGU7XG4gICAgaGlzdC5sYXN0U2VsT3JpZ2luID0gb3JpZ2luO1xuICAgIGhpc3QubGFzdE9wID0gb3BJZDtcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmNsZWFyUmVkbyAhPT0gZmFsc2UpXG4gICAgICBjbGVhclNlbGVjdGlvbkV2ZW50cyhoaXN0LnVuZG9uZSk7XG4gIH1cblxuICBmdW5jdGlvbiBwdXNoU2VsZWN0aW9uVG9IaXN0b3J5KHNlbCwgZGVzdCkge1xuICAgIHZhciB0b3AgPSBsc3QoZGVzdCk7XG4gICAgaWYgKCEodG9wICYmIHRvcC5yYW5nZXMgJiYgdG9wLmVxdWFscyhzZWwpKSlcbiAgICAgIGRlc3QucHVzaChzZWwpO1xuICB9XG5cbiAgLy8gVXNlZCB0byBzdG9yZSBtYXJrZWQgc3BhbiBpbmZvcm1hdGlvbiBpbiB0aGUgaGlzdG9yeS5cbiAgZnVuY3Rpb24gYXR0YWNoTG9jYWxTcGFucyhkb2MsIGNoYW5nZSwgZnJvbSwgdG8pIHtcbiAgICB2YXIgZXhpc3RpbmcgPSBjaGFuZ2VbXCJzcGFuc19cIiArIGRvYy5pZF0sIG4gPSAwO1xuICAgIGRvYy5pdGVyKE1hdGgubWF4KGRvYy5maXJzdCwgZnJvbSksIE1hdGgubWluKGRvYy5maXJzdCArIGRvYy5zaXplLCB0byksIGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIGlmIChsaW5lLm1hcmtlZFNwYW5zKVxuICAgICAgICAoZXhpc3RpbmcgfHwgKGV4aXN0aW5nID0gY2hhbmdlW1wic3BhbnNfXCIgKyBkb2MuaWRdID0ge30pKVtuXSA9IGxpbmUubWFya2VkU3BhbnM7XG4gICAgICArK247XG4gICAgfSk7XG4gIH1cblxuICAvLyBXaGVuIHVuL3JlLWRvaW5nIHJlc3RvcmVzIHRleHQgY29udGFpbmluZyBtYXJrZWQgc3BhbnMsIHRob3NlXG4gIC8vIHRoYXQgaGF2ZSBiZWVuIGV4cGxpY2l0bHkgY2xlYXJlZCBzaG91bGQgbm90IGJlIHJlc3RvcmVkLlxuICBmdW5jdGlvbiByZW1vdmVDbGVhcmVkU3BhbnMoc3BhbnMpIHtcbiAgICBpZiAoIXNwYW5zKSByZXR1cm4gbnVsbDtcbiAgICBmb3IgKHZhciBpID0gMCwgb3V0OyBpIDwgc3BhbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmIChzcGFuc1tpXS5tYXJrZXIuZXhwbGljaXRseUNsZWFyZWQpIHsgaWYgKCFvdXQpIG91dCA9IHNwYW5zLnNsaWNlKDAsIGkpOyB9XG4gICAgICBlbHNlIGlmIChvdXQpIG91dC5wdXNoKHNwYW5zW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuICFvdXQgPyBzcGFucyA6IG91dC5sZW5ndGggPyBvdXQgOiBudWxsO1xuICB9XG5cbiAgLy8gUmV0cmlldmUgYW5kIGZpbHRlciB0aGUgb2xkIG1hcmtlZCBzcGFucyBzdG9yZWQgaW4gYSBjaGFuZ2UgZXZlbnQuXG4gIGZ1bmN0aW9uIGdldE9sZFNwYW5zKGRvYywgY2hhbmdlKSB7XG4gICAgdmFyIGZvdW5kID0gY2hhbmdlW1wic3BhbnNfXCIgKyBkb2MuaWRdO1xuICAgIGlmICghZm91bmQpIHJldHVybiBudWxsO1xuICAgIGZvciAodmFyIGkgPSAwLCBudyA9IFtdOyBpIDwgY2hhbmdlLnRleHQubGVuZ3RoOyArK2kpXG4gICAgICBudy5wdXNoKHJlbW92ZUNsZWFyZWRTcGFucyhmb3VuZFtpXSkpO1xuICAgIHJldHVybiBudztcbiAgfVxuXG4gIC8vIFVzZWQgYm90aCB0byBwcm92aWRlIGEgSlNPTi1zYWZlIG9iamVjdCBpbiAuZ2V0SGlzdG9yeSwgYW5kLCB3aGVuXG4gIC8vIGRldGFjaGluZyBhIGRvY3VtZW50LCB0byBzcGxpdCB0aGUgaGlzdG9yeSBpbiB0d29cbiAgZnVuY3Rpb24gY29weUhpc3RvcnlBcnJheShldmVudHMsIG5ld0dyb3VwLCBpbnN0YW50aWF0ZVNlbCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBjb3B5ID0gW107IGkgPCBldmVudHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBldmVudCA9IGV2ZW50c1tpXTtcbiAgICAgIGlmIChldmVudC5yYW5nZXMpIHtcbiAgICAgICAgY29weS5wdXNoKGluc3RhbnRpYXRlU2VsID8gU2VsZWN0aW9uLnByb3RvdHlwZS5kZWVwQ29weS5jYWxsKGV2ZW50KSA6IGV2ZW50KTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICB2YXIgY2hhbmdlcyA9IGV2ZW50LmNoYW5nZXMsIG5ld0NoYW5nZXMgPSBbXTtcbiAgICAgIGNvcHkucHVzaCh7Y2hhbmdlczogbmV3Q2hhbmdlc30pO1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBjaGFuZ2VzLmxlbmd0aDsgKytqKSB7XG4gICAgICAgIHZhciBjaGFuZ2UgPSBjaGFuZ2VzW2pdLCBtO1xuICAgICAgICBuZXdDaGFuZ2VzLnB1c2goe2Zyb206IGNoYW5nZS5mcm9tLCB0bzogY2hhbmdlLnRvLCB0ZXh0OiBjaGFuZ2UudGV4dH0pO1xuICAgICAgICBpZiAobmV3R3JvdXApIGZvciAodmFyIHByb3AgaW4gY2hhbmdlKSBpZiAobSA9IHByb3AubWF0Y2goL15zcGFuc18oXFxkKykkLykpIHtcbiAgICAgICAgICBpZiAoaW5kZXhPZihuZXdHcm91cCwgTnVtYmVyKG1bMV0pKSA+IC0xKSB7XG4gICAgICAgICAgICBsc3QobmV3Q2hhbmdlcylbcHJvcF0gPSBjaGFuZ2VbcHJvcF07XG4gICAgICAgICAgICBkZWxldGUgY2hhbmdlW3Byb3BdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY29weTtcbiAgfVxuXG4gIC8vIFJlYmFzaW5nL3Jlc2V0dGluZyBoaXN0b3J5IHRvIGRlYWwgd2l0aCBleHRlcm5hbGx5LXNvdXJjZWQgY2hhbmdlc1xuXG4gIGZ1bmN0aW9uIHJlYmFzZUhpc3RTZWxTaW5nbGUocG9zLCBmcm9tLCB0bywgZGlmZikge1xuICAgIGlmICh0byA8IHBvcy5saW5lKSB7XG4gICAgICBwb3MubGluZSArPSBkaWZmO1xuICAgIH0gZWxzZSBpZiAoZnJvbSA8IHBvcy5saW5lKSB7XG4gICAgICBwb3MubGluZSA9IGZyb207XG4gICAgICBwb3MuY2ggPSAwO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRyaWVzIHRvIHJlYmFzZSBhbiBhcnJheSBvZiBoaXN0b3J5IGV2ZW50cyBnaXZlbiBhIGNoYW5nZSBpbiB0aGVcbiAgLy8gZG9jdW1lbnQuIElmIHRoZSBjaGFuZ2UgdG91Y2hlcyB0aGUgc2FtZSBsaW5lcyBhcyB0aGUgZXZlbnQsIHRoZVxuICAvLyBldmVudCwgYW5kIGV2ZXJ5dGhpbmcgJ2JlaGluZCcgaXQsIGlzIGRpc2NhcmRlZC4gSWYgdGhlIGNoYW5nZSBpc1xuICAvLyBiZWZvcmUgdGhlIGV2ZW50LCB0aGUgZXZlbnQncyBwb3NpdGlvbnMgYXJlIHVwZGF0ZWQuIFVzZXMgYVxuICAvLyBjb3B5LW9uLXdyaXRlIHNjaGVtZSBmb3IgdGhlIHBvc2l0aW9ucywgdG8gYXZvaWQgaGF2aW5nIHRvXG4gIC8vIHJlYWxsb2NhdGUgdGhlbSBhbGwgb24gZXZlcnkgcmViYXNlLCBidXQgYWxzbyBhdm9pZCBwcm9ibGVtcyB3aXRoXG4gIC8vIHNoYXJlZCBwb3NpdGlvbiBvYmplY3RzIGJlaW5nIHVuc2FmZWx5IHVwZGF0ZWQuXG4gIGZ1bmN0aW9uIHJlYmFzZUhpc3RBcnJheShhcnJheSwgZnJvbSwgdG8sIGRpZmYpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgc3ViID0gYXJyYXlbaV0sIG9rID0gdHJ1ZTtcbiAgICAgIGlmIChzdWIucmFuZ2VzKSB7XG4gICAgICAgIGlmICghc3ViLmNvcGllZCkgeyBzdWIgPSBhcnJheVtpXSA9IHN1Yi5kZWVwQ29weSgpOyBzdWIuY29waWVkID0gdHJ1ZTsgfVxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHN1Yi5yYW5nZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICByZWJhc2VIaXN0U2VsU2luZ2xlKHN1Yi5yYW5nZXNbal0uYW5jaG9yLCBmcm9tLCB0bywgZGlmZik7XG4gICAgICAgICAgcmViYXNlSGlzdFNlbFNpbmdsZShzdWIucmFuZ2VzW2pdLmhlYWQsIGZyb20sIHRvLCBkaWZmKTtcbiAgICAgICAgfVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc3ViLmNoYW5nZXMubGVuZ3RoOyArK2opIHtcbiAgICAgICAgdmFyIGN1ciA9IHN1Yi5jaGFuZ2VzW2pdO1xuICAgICAgICBpZiAodG8gPCBjdXIuZnJvbS5saW5lKSB7XG4gICAgICAgICAgY3VyLmZyb20gPSBQb3MoY3VyLmZyb20ubGluZSArIGRpZmYsIGN1ci5mcm9tLmNoKTtcbiAgICAgICAgICBjdXIudG8gPSBQb3MoY3VyLnRvLmxpbmUgKyBkaWZmLCBjdXIudG8uY2gpO1xuICAgICAgICB9IGVsc2UgaWYgKGZyb20gPD0gY3VyLnRvLmxpbmUpIHtcbiAgICAgICAgICBvayA9IGZhbHNlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIW9rKSB7XG4gICAgICAgIGFycmF5LnNwbGljZSgwLCBpICsgMSk7XG4gICAgICAgIGkgPSAwO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYmFzZUhpc3QoaGlzdCwgY2hhbmdlKSB7XG4gICAgdmFyIGZyb20gPSBjaGFuZ2UuZnJvbS5saW5lLCB0byA9IGNoYW5nZS50by5saW5lLCBkaWZmID0gY2hhbmdlLnRleHQubGVuZ3RoIC0gKHRvIC0gZnJvbSkgLSAxO1xuICAgIHJlYmFzZUhpc3RBcnJheShoaXN0LmRvbmUsIGZyb20sIHRvLCBkaWZmKTtcbiAgICByZWJhc2VIaXN0QXJyYXkoaGlzdC51bmRvbmUsIGZyb20sIHRvLCBkaWZmKTtcbiAgfVxuXG4gIC8vIEVWRU5UIFVUSUxJVElFU1xuXG4gIC8vIER1ZSB0byB0aGUgZmFjdCB0aGF0IHdlIHN0aWxsIHN1cHBvcnQganVyYXNzaWMgSUUgdmVyc2lvbnMsIHNvbWVcbiAgLy8gY29tcGF0aWJpbGl0eSB3cmFwcGVycyBhcmUgbmVlZGVkLlxuXG4gIHZhciBlX3ByZXZlbnREZWZhdWx0ID0gQ29kZU1pcnJvci5lX3ByZXZlbnREZWZhdWx0ID0gZnVuY3Rpb24oZSkge1xuICAgIGlmIChlLnByZXZlbnREZWZhdWx0KSBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgZWxzZSBlLnJldHVyblZhbHVlID0gZmFsc2U7XG4gIH07XG4gIHZhciBlX3N0b3BQcm9wYWdhdGlvbiA9IENvZGVNaXJyb3IuZV9zdG9wUHJvcGFnYXRpb24gPSBmdW5jdGlvbihlKSB7XG4gICAgaWYgKGUuc3RvcFByb3BhZ2F0aW9uKSBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGVsc2UgZS5jYW5jZWxCdWJibGUgPSB0cnVlO1xuICB9O1xuICBmdW5jdGlvbiBlX2RlZmF1bHRQcmV2ZW50ZWQoZSkge1xuICAgIHJldHVybiBlLmRlZmF1bHRQcmV2ZW50ZWQgIT0gbnVsbCA/IGUuZGVmYXVsdFByZXZlbnRlZCA6IGUucmV0dXJuVmFsdWUgPT0gZmFsc2U7XG4gIH1cbiAgdmFyIGVfc3RvcCA9IENvZGVNaXJyb3IuZV9zdG9wID0gZnVuY3Rpb24oZSkge2VfcHJldmVudERlZmF1bHQoZSk7IGVfc3RvcFByb3BhZ2F0aW9uKGUpO307XG5cbiAgZnVuY3Rpb24gZV90YXJnZXQoZSkge3JldHVybiBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7fVxuICBmdW5jdGlvbiBlX2J1dHRvbihlKSB7XG4gICAgdmFyIGIgPSBlLndoaWNoO1xuICAgIGlmIChiID09IG51bGwpIHtcbiAgICAgIGlmIChlLmJ1dHRvbiAmIDEpIGIgPSAxO1xuICAgICAgZWxzZSBpZiAoZS5idXR0b24gJiAyKSBiID0gMztcbiAgICAgIGVsc2UgaWYgKGUuYnV0dG9uICYgNCkgYiA9IDI7XG4gICAgfVxuICAgIGlmIChtYWMgJiYgZS5jdHJsS2V5ICYmIGIgPT0gMSkgYiA9IDM7XG4gICAgcmV0dXJuIGI7XG4gIH1cblxuICAvLyBFVkVOVCBIQU5ETElOR1xuXG4gIC8vIExpZ2h0d2VpZ2h0IGV2ZW50IGZyYW1ld29yay4gb24vb2ZmIGFsc28gd29yayBvbiBET00gbm9kZXMsXG4gIC8vIHJlZ2lzdGVyaW5nIG5hdGl2ZSBET00gaGFuZGxlcnMuXG5cbiAgdmFyIG9uID0gQ29kZU1pcnJvci5vbiA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUsIGYpIHtcbiAgICBpZiAoZW1pdHRlci5hZGRFdmVudExpc3RlbmVyKVxuICAgICAgZW1pdHRlci5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGYsIGZhbHNlKTtcbiAgICBlbHNlIGlmIChlbWl0dGVyLmF0dGFjaEV2ZW50KVxuICAgICAgZW1pdHRlci5hdHRhY2hFdmVudChcIm9uXCIgKyB0eXBlLCBmKTtcbiAgICBlbHNlIHtcbiAgICAgIHZhciBtYXAgPSBlbWl0dGVyLl9oYW5kbGVycyB8fCAoZW1pdHRlci5faGFuZGxlcnMgPSB7fSk7XG4gICAgICB2YXIgYXJyID0gbWFwW3R5cGVdIHx8IChtYXBbdHlwZV0gPSBbXSk7XG4gICAgICBhcnIucHVzaChmKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIG9mZiA9IENvZGVNaXJyb3Iub2ZmID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSwgZikge1xuICAgIGlmIChlbWl0dGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIpXG4gICAgICBlbWl0dGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgZiwgZmFsc2UpO1xuICAgIGVsc2UgaWYgKGVtaXR0ZXIuZGV0YWNoRXZlbnQpXG4gICAgICBlbWl0dGVyLmRldGFjaEV2ZW50KFwib25cIiArIHR5cGUsIGYpO1xuICAgIGVsc2Uge1xuICAgICAgdmFyIGFyciA9IGVtaXR0ZXIuX2hhbmRsZXJzICYmIGVtaXR0ZXIuX2hhbmRsZXJzW3R5cGVdO1xuICAgICAgaWYgKCFhcnIpIHJldHVybjtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgKytpKVxuICAgICAgICBpZiAoYXJyW2ldID09IGYpIHsgYXJyLnNwbGljZShpLCAxKTsgYnJlYWs7IH1cbiAgICB9XG4gIH07XG5cbiAgdmFyIHNpZ25hbCA9IENvZGVNaXJyb3Iuc2lnbmFsID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSAvKiwgdmFsdWVzLi4uKi8pIHtcbiAgICB2YXIgYXJyID0gZW1pdHRlci5faGFuZGxlcnMgJiYgZW1pdHRlci5faGFuZGxlcnNbdHlwZV07XG4gICAgaWYgKCFhcnIpIHJldHVybjtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyArK2kpIGFycltpXS5hcHBseShudWxsLCBhcmdzKTtcbiAgfTtcblxuICAvLyBPZnRlbiwgd2Ugd2FudCB0byBzaWduYWwgZXZlbnRzIGF0IGEgcG9pbnQgd2hlcmUgd2UgYXJlIGluIHRoZVxuICAvLyBtaWRkbGUgb2Ygc29tZSB3b3JrLCBidXQgZG9uJ3Qgd2FudCB0aGUgaGFuZGxlciB0byBzdGFydCBjYWxsaW5nXG4gIC8vIG90aGVyIG1ldGhvZHMgb24gdGhlIGVkaXRvciwgd2hpY2ggbWlnaHQgYmUgaW4gYW4gaW5jb25zaXN0ZW50XG4gIC8vIHN0YXRlIG9yIHNpbXBseSBub3QgZXhwZWN0IGFueSBvdGhlciBldmVudHMgdG8gaGFwcGVuLlxuICAvLyBzaWduYWxMYXRlciBsb29rcyB3aGV0aGVyIHRoZXJlIGFyZSBhbnkgaGFuZGxlcnMsIGFuZCBzY2hlZHVsZXNcbiAgLy8gdGhlbSB0byBiZSBleGVjdXRlZCB3aGVuIHRoZSBsYXN0IG9wZXJhdGlvbiBlbmRzLCBvciwgaWYgbm9cbiAgLy8gb3BlcmF0aW9uIGlzIGFjdGl2ZSwgd2hlbiBhIHRpbWVvdXQgZmlyZXMuXG4gIHZhciBkZWxheWVkQ2FsbGJhY2tzLCBkZWxheWVkQ2FsbGJhY2tEZXB0aCA9IDA7XG4gIGZ1bmN0aW9uIHNpZ25hbExhdGVyKGVtaXR0ZXIsIHR5cGUgLyosIHZhbHVlcy4uLiovKSB7XG4gICAgdmFyIGFyciA9IGVtaXR0ZXIuX2hhbmRsZXJzICYmIGVtaXR0ZXIuX2hhbmRsZXJzW3R5cGVdO1xuICAgIGlmICghYXJyKSByZXR1cm47XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIGlmICghZGVsYXllZENhbGxiYWNrcykge1xuICAgICAgKytkZWxheWVkQ2FsbGJhY2tEZXB0aDtcbiAgICAgIGRlbGF5ZWRDYWxsYmFja3MgPSBbXTtcbiAgICAgIHNldFRpbWVvdXQoZmlyZURlbGF5ZWQsIDApO1xuICAgIH1cbiAgICBmdW5jdGlvbiBibmQoZikge3JldHVybiBmdW5jdGlvbigpe2YuYXBwbHkobnVsbCwgYXJncyk7fTt9O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgKytpKVxuICAgICAgZGVsYXllZENhbGxiYWNrcy5wdXNoKGJuZChhcnJbaV0pKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpcmVEZWxheWVkKCkge1xuICAgIC0tZGVsYXllZENhbGxiYWNrRGVwdGg7XG4gICAgdmFyIGRlbGF5ZWQgPSBkZWxheWVkQ2FsbGJhY2tzO1xuICAgIGRlbGF5ZWRDYWxsYmFja3MgPSBudWxsO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGVsYXllZC5sZW5ndGg7ICsraSkgZGVsYXllZFtpXSgpO1xuICB9XG5cbiAgLy8gVGhlIERPTSBldmVudHMgdGhhdCBDb2RlTWlycm9yIGhhbmRsZXMgY2FuIGJlIG92ZXJyaWRkZW4gYnlcbiAgLy8gcmVnaXN0ZXJpbmcgYSAobm9uLURPTSkgaGFuZGxlciBvbiB0aGUgZWRpdG9yIGZvciB0aGUgZXZlbnQgbmFtZSxcbiAgLy8gYW5kIHByZXZlbnREZWZhdWx0LWluZyB0aGUgZXZlbnQgaW4gdGhhdCBoYW5kbGVyLlxuICBmdW5jdGlvbiBzaWduYWxET01FdmVudChjbSwgZSwgb3ZlcnJpZGUpIHtcbiAgICBzaWduYWwoY20sIG92ZXJyaWRlIHx8IGUudHlwZSwgY20sIGUpO1xuICAgIHJldHVybiBlX2RlZmF1bHRQcmV2ZW50ZWQoZSkgfHwgZS5jb2RlbWlycm9ySWdub3JlO1xuICB9XG5cbiAgZnVuY3Rpb24gc2lnbmFsQ3Vyc29yQWN0aXZpdHkoY20pIHtcbiAgICB2YXIgYXJyID0gY20uX2hhbmRsZXJzICYmIGNtLl9oYW5kbGVycy5jdXJzb3JBY3Rpdml0eTtcbiAgICBpZiAoIWFycikgcmV0dXJuO1xuICAgIHZhciBzZXQgPSBjbS5jdXJPcC5jdXJzb3JBY3Rpdml0eUhhbmRsZXJzIHx8IChjbS5jdXJPcC5jdXJzb3JBY3Rpdml0eUhhbmRsZXJzID0gW10pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgKytpKSBpZiAoaW5kZXhPZihzZXQsIGFycltpXSkgPT0gLTEpXG4gICAgICBzZXQucHVzaChhcnJbaV0pO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFzSGFuZGxlcihlbWl0dGVyLCB0eXBlKSB7XG4gICAgdmFyIGFyciA9IGVtaXR0ZXIuX2hhbmRsZXJzICYmIGVtaXR0ZXIuX2hhbmRsZXJzW3R5cGVdO1xuICAgIHJldHVybiBhcnIgJiYgYXJyLmxlbmd0aCA+IDA7XG4gIH1cblxuICAvLyBBZGQgb24gYW5kIG9mZiBtZXRob2RzIHRvIGEgY29uc3RydWN0b3IncyBwcm90b3R5cGUsIHRvIG1ha2VcbiAgLy8gcmVnaXN0ZXJpbmcgZXZlbnRzIG9uIHN1Y2ggb2JqZWN0cyBtb3JlIGNvbnZlbmllbnQuXG4gIGZ1bmN0aW9uIGV2ZW50TWl4aW4oY3Rvcikge1xuICAgIGN0b3IucHJvdG90eXBlLm9uID0gZnVuY3Rpb24odHlwZSwgZikge29uKHRoaXMsIHR5cGUsIGYpO307XG4gICAgY3Rvci5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24odHlwZSwgZikge29mZih0aGlzLCB0eXBlLCBmKTt9O1xuICB9XG5cbiAgLy8gTUlTQyBVVElMSVRJRVNcblxuICAvLyBOdW1iZXIgb2YgcGl4ZWxzIGFkZGVkIHRvIHNjcm9sbGVyIGFuZCBzaXplciB0byBoaWRlIHNjcm9sbGJhclxuICB2YXIgc2Nyb2xsZXJDdXRPZmYgPSAzMDtcblxuICAvLyBSZXR1cm5lZCBvciB0aHJvd24gYnkgdmFyaW91cyBwcm90b2NvbHMgdG8gc2lnbmFsICdJJ20gbm90XG4gIC8vIGhhbmRsaW5nIHRoaXMnLlxuICB2YXIgUGFzcyA9IENvZGVNaXJyb3IuUGFzcyA9IHt0b1N0cmluZzogZnVuY3Rpb24oKXtyZXR1cm4gXCJDb2RlTWlycm9yLlBhc3NcIjt9fTtcblxuICAvLyBSZXVzZWQgb3B0aW9uIG9iamVjdHMgZm9yIHNldFNlbGVjdGlvbiAmIGZyaWVuZHNcbiAgdmFyIHNlbF9kb250U2Nyb2xsID0ge3Njcm9sbDogZmFsc2V9LCBzZWxfbW91c2UgPSB7b3JpZ2luOiBcIiptb3VzZVwifSwgc2VsX21vdmUgPSB7b3JpZ2luOiBcIittb3ZlXCJ9O1xuXG4gIGZ1bmN0aW9uIERlbGF5ZWQoKSB7dGhpcy5pZCA9IG51bGw7fVxuICBEZWxheWVkLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihtcywgZikge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLmlkKTtcbiAgICB0aGlzLmlkID0gc2V0VGltZW91dChmLCBtcyk7XG4gIH07XG5cbiAgLy8gQ291bnRzIHRoZSBjb2x1bW4gb2Zmc2V0IGluIGEgc3RyaW5nLCB0YWtpbmcgdGFicyBpbnRvIGFjY291bnQuXG4gIC8vIFVzZWQgbW9zdGx5IHRvIGZpbmQgaW5kZW50YXRpb24uXG4gIHZhciBjb3VudENvbHVtbiA9IENvZGVNaXJyb3IuY291bnRDb2x1bW4gPSBmdW5jdGlvbihzdHJpbmcsIGVuZCwgdGFiU2l6ZSwgc3RhcnRJbmRleCwgc3RhcnRWYWx1ZSkge1xuICAgIGlmIChlbmQgPT0gbnVsbCkge1xuICAgICAgZW5kID0gc3RyaW5nLnNlYXJjaCgvW15cXHNcXHUwMGEwXS8pO1xuICAgICAgaWYgKGVuZCA9PSAtMSkgZW5kID0gc3RyaW5nLmxlbmd0aDtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IHN0YXJ0SW5kZXggfHwgMCwgbiA9IHN0YXJ0VmFsdWUgfHwgMDs7KSB7XG4gICAgICB2YXIgbmV4dFRhYiA9IHN0cmluZy5pbmRleE9mKFwiXFx0XCIsIGkpO1xuICAgICAgaWYgKG5leHRUYWIgPCAwIHx8IG5leHRUYWIgPj0gZW5kKVxuICAgICAgICByZXR1cm4gbiArIChlbmQgLSBpKTtcbiAgICAgIG4gKz0gbmV4dFRhYiAtIGk7XG4gICAgICBuICs9IHRhYlNpemUgLSAobiAlIHRhYlNpemUpO1xuICAgICAgaSA9IG5leHRUYWIgKyAxO1xuICAgIH1cbiAgfTtcblxuICAvLyBUaGUgaW52ZXJzZSBvZiBjb3VudENvbHVtbiAtLSBmaW5kIHRoZSBvZmZzZXQgdGhhdCBjb3JyZXNwb25kcyB0b1xuICAvLyBhIHBhcnRpY3VsYXIgY29sdW1uLlxuICBmdW5jdGlvbiBmaW5kQ29sdW1uKHN0cmluZywgZ29hbCwgdGFiU2l6ZSkge1xuICAgIGZvciAodmFyIHBvcyA9IDAsIGNvbCA9IDA7Oykge1xuICAgICAgdmFyIG5leHRUYWIgPSBzdHJpbmcuaW5kZXhPZihcIlxcdFwiLCBwb3MpO1xuICAgICAgaWYgKG5leHRUYWIgPT0gLTEpIG5leHRUYWIgPSBzdHJpbmcubGVuZ3RoO1xuICAgICAgdmFyIHNraXBwZWQgPSBuZXh0VGFiIC0gcG9zO1xuICAgICAgaWYgKG5leHRUYWIgPT0gc3RyaW5nLmxlbmd0aCB8fCBjb2wgKyBza2lwcGVkID49IGdvYWwpXG4gICAgICAgIHJldHVybiBwb3MgKyBNYXRoLm1pbihza2lwcGVkLCBnb2FsIC0gY29sKTtcbiAgICAgIGNvbCArPSBuZXh0VGFiIC0gcG9zO1xuICAgICAgY29sICs9IHRhYlNpemUgLSAoY29sICUgdGFiU2l6ZSk7XG4gICAgICBwb3MgPSBuZXh0VGFiICsgMTtcbiAgICAgIGlmIChjb2wgPj0gZ29hbCkgcmV0dXJuIHBvcztcbiAgICB9XG4gIH1cblxuICB2YXIgc3BhY2VTdHJzID0gW1wiXCJdO1xuICBmdW5jdGlvbiBzcGFjZVN0cihuKSB7XG4gICAgd2hpbGUgKHNwYWNlU3Rycy5sZW5ndGggPD0gbilcbiAgICAgIHNwYWNlU3Rycy5wdXNoKGxzdChzcGFjZVN0cnMpICsgXCIgXCIpO1xuICAgIHJldHVybiBzcGFjZVN0cnNbbl07XG4gIH1cblxuICBmdW5jdGlvbiBsc3QoYXJyKSB7IHJldHVybiBhcnJbYXJyLmxlbmd0aC0xXTsgfVxuXG4gIHZhciBzZWxlY3RJbnB1dCA9IGZ1bmN0aW9uKG5vZGUpIHsgbm9kZS5zZWxlY3QoKTsgfTtcbiAgaWYgKGlvcykgLy8gTW9iaWxlIFNhZmFyaSBhcHBhcmVudGx5IGhhcyBhIGJ1ZyB3aGVyZSBzZWxlY3QoKSBpcyBicm9rZW4uXG4gICAgc2VsZWN0SW5wdXQgPSBmdW5jdGlvbihub2RlKSB7IG5vZGUuc2VsZWN0aW9uU3RhcnQgPSAwOyBub2RlLnNlbGVjdGlvbkVuZCA9IG5vZGUudmFsdWUubGVuZ3RoOyB9O1xuICBlbHNlIGlmIChpZSkgLy8gU3VwcHJlc3MgbXlzdGVyaW91cyBJRTEwIGVycm9yc1xuICAgIHNlbGVjdElucHV0ID0gZnVuY3Rpb24obm9kZSkgeyB0cnkgeyBub2RlLnNlbGVjdCgpOyB9IGNhdGNoKF9lKSB7fSB9O1xuXG4gIGZ1bmN0aW9uIGluZGV4T2YoYXJyYXksIGVsdCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyArK2kpXG4gICAgICBpZiAoYXJyYXlbaV0gPT0gZWx0KSByZXR1cm4gaTtcbiAgICByZXR1cm4gLTE7XG4gIH1cbiAgaWYgKFtdLmluZGV4T2YpIGluZGV4T2YgPSBmdW5jdGlvbihhcnJheSwgZWx0KSB7IHJldHVybiBhcnJheS5pbmRleE9mKGVsdCk7IH07XG4gIGZ1bmN0aW9uIG1hcChhcnJheSwgZikge1xuICAgIHZhciBvdXQgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSBvdXRbaV0gPSBmKGFycmF5W2ldLCBpKTtcbiAgICByZXR1cm4gb3V0O1xuICB9XG4gIGlmIChbXS5tYXApIG1hcCA9IGZ1bmN0aW9uKGFycmF5LCBmKSB7IHJldHVybiBhcnJheS5tYXAoZik7IH07XG5cbiAgZnVuY3Rpb24gY3JlYXRlT2JqKGJhc2UsIHByb3BzKSB7XG4gICAgdmFyIGluc3Q7XG4gICAgaWYgKE9iamVjdC5jcmVhdGUpIHtcbiAgICAgIGluc3QgPSBPYmplY3QuY3JlYXRlKGJhc2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgY3RvciA9IGZ1bmN0aW9uKCkge307XG4gICAgICBjdG9yLnByb3RvdHlwZSA9IGJhc2U7XG4gICAgICBpbnN0ID0gbmV3IGN0b3IoKTtcbiAgICB9XG4gICAgaWYgKHByb3BzKSBjb3B5T2JqKHByb3BzLCBpbnN0KTtcbiAgICByZXR1cm4gaW5zdDtcbiAgfTtcblxuICBmdW5jdGlvbiBjb3B5T2JqKG9iaiwgdGFyZ2V0LCBvdmVyd3JpdGUpIHtcbiAgICBpZiAoIXRhcmdldCkgdGFyZ2V0ID0ge307XG4gICAgZm9yICh2YXIgcHJvcCBpbiBvYmopXG4gICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KHByb3ApICYmIChvdmVyd3JpdGUgIT09IGZhbHNlIHx8ICF0YXJnZXQuaGFzT3duUHJvcGVydHkocHJvcCkpKVxuICAgICAgICB0YXJnZXRbcHJvcF0gPSBvYmpbcHJvcF07XG4gICAgcmV0dXJuIHRhcmdldDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJpbmQoZikge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gZi5hcHBseShudWxsLCBhcmdzKTt9O1xuICB9XG5cbiAgdmFyIG5vbkFTQ0lJU2luZ2xlQ2FzZVdvcmRDaGFyID0gL1tcXHUwMGRmXFx1MzA0MC1cXHUzMDlmXFx1MzBhMC1cXHUzMGZmXFx1MzQwMC1cXHU0ZGI1XFx1NGUwMC1cXHU5ZmNjXFx1YWMwMC1cXHVkN2FmXS87XG4gIHZhciBpc1dvcmRDaGFyQmFzaWMgPSBDb2RlTWlycm9yLmlzV29yZENoYXIgPSBmdW5jdGlvbihjaCkge1xuICAgIHJldHVybiAvXFx3Ly50ZXN0KGNoKSB8fCBjaCA+IFwiXFx4ODBcIiAmJlxuICAgICAgKGNoLnRvVXBwZXJDYXNlKCkgIT0gY2gudG9Mb3dlckNhc2UoKSB8fCBub25BU0NJSVNpbmdsZUNhc2VXb3JkQ2hhci50ZXN0KGNoKSk7XG4gIH07XG4gIGZ1bmN0aW9uIGlzV29yZENoYXIoY2gsIGhlbHBlcikge1xuICAgIGlmICghaGVscGVyKSByZXR1cm4gaXNXb3JkQ2hhckJhc2ljKGNoKTtcbiAgICBpZiAoaGVscGVyLnNvdXJjZS5pbmRleE9mKFwiXFxcXHdcIikgPiAtMSAmJiBpc1dvcmRDaGFyQmFzaWMoY2gpKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gaGVscGVyLnRlc3QoY2gpO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNFbXB0eShvYmopIHtcbiAgICBmb3IgKHZhciBuIGluIG9iaikgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShuKSAmJiBvYmpbbl0pIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIEV4dGVuZGluZyB1bmljb2RlIGNoYXJhY3RlcnMuIEEgc2VyaWVzIG9mIGEgbm9uLWV4dGVuZGluZyBjaGFyICtcbiAgLy8gYW55IG51bWJlciBvZiBleHRlbmRpbmcgY2hhcnMgaXMgdHJlYXRlZCBhcyBhIHNpbmdsZSB1bml0IGFzIGZhclxuICAvLyBhcyBlZGl0aW5nIGFuZCBtZWFzdXJpbmcgaXMgY29uY2VybmVkLiBUaGlzIGlzIG5vdCBmdWxseSBjb3JyZWN0LFxuICAvLyBzaW5jZSBzb21lIHNjcmlwdHMvZm9udHMvYnJvd3NlcnMgYWxzbyB0cmVhdCBvdGhlciBjb25maWd1cmF0aW9uc1xuICAvLyBvZiBjb2RlIHBvaW50cyBhcyBhIGdyb3VwLlxuICB2YXIgZXh0ZW5kaW5nQ2hhcnMgPSAvW1xcdTAzMDAtXFx1MDM2ZlxcdTA0ODMtXFx1MDQ4OVxcdTA1OTEtXFx1MDViZFxcdTA1YmZcXHUwNWMxXFx1MDVjMlxcdTA1YzRcXHUwNWM1XFx1MDVjN1xcdTA2MTAtXFx1MDYxYVxcdTA2NGItXFx1MDY1ZVxcdTA2NzBcXHUwNmQ2LVxcdTA2ZGNcXHUwNmRlLVxcdTA2ZTRcXHUwNmU3XFx1MDZlOFxcdTA2ZWEtXFx1MDZlZFxcdTA3MTFcXHUwNzMwLVxcdTA3NGFcXHUwN2E2LVxcdTA3YjBcXHUwN2ViLVxcdTA3ZjNcXHUwODE2LVxcdTA4MTlcXHUwODFiLVxcdTA4MjNcXHUwODI1LVxcdTA4MjdcXHUwODI5LVxcdTA4MmRcXHUwOTAwLVxcdTA5MDJcXHUwOTNjXFx1MDk0MS1cXHUwOTQ4XFx1MDk0ZFxcdTA5NTEtXFx1MDk1NVxcdTA5NjJcXHUwOTYzXFx1MDk4MVxcdTA5YmNcXHUwOWJlXFx1MDljMS1cXHUwOWM0XFx1MDljZFxcdTA5ZDdcXHUwOWUyXFx1MDllM1xcdTBhMDFcXHUwYTAyXFx1MGEzY1xcdTBhNDFcXHUwYTQyXFx1MGE0N1xcdTBhNDhcXHUwYTRiLVxcdTBhNGRcXHUwYTUxXFx1MGE3MFxcdTBhNzFcXHUwYTc1XFx1MGE4MVxcdTBhODJcXHUwYWJjXFx1MGFjMS1cXHUwYWM1XFx1MGFjN1xcdTBhYzhcXHUwYWNkXFx1MGFlMlxcdTBhZTNcXHUwYjAxXFx1MGIzY1xcdTBiM2VcXHUwYjNmXFx1MGI0MS1cXHUwYjQ0XFx1MGI0ZFxcdTBiNTZcXHUwYjU3XFx1MGI2MlxcdTBiNjNcXHUwYjgyXFx1MGJiZVxcdTBiYzBcXHUwYmNkXFx1MGJkN1xcdTBjM2UtXFx1MGM0MFxcdTBjNDYtXFx1MGM0OFxcdTBjNGEtXFx1MGM0ZFxcdTBjNTVcXHUwYzU2XFx1MGM2MlxcdTBjNjNcXHUwY2JjXFx1MGNiZlxcdTBjYzJcXHUwY2M2XFx1MGNjY1xcdTBjY2RcXHUwY2Q1XFx1MGNkNlxcdTBjZTJcXHUwY2UzXFx1MGQzZVxcdTBkNDEtXFx1MGQ0NFxcdTBkNGRcXHUwZDU3XFx1MGQ2MlxcdTBkNjNcXHUwZGNhXFx1MGRjZlxcdTBkZDItXFx1MGRkNFxcdTBkZDZcXHUwZGRmXFx1MGUzMVxcdTBlMzQtXFx1MGUzYVxcdTBlNDctXFx1MGU0ZVxcdTBlYjFcXHUwZWI0LVxcdTBlYjlcXHUwZWJiXFx1MGViY1xcdTBlYzgtXFx1MGVjZFxcdTBmMThcXHUwZjE5XFx1MGYzNVxcdTBmMzdcXHUwZjM5XFx1MGY3MS1cXHUwZjdlXFx1MGY4MC1cXHUwZjg0XFx1MGY4NlxcdTBmODdcXHUwZjkwLVxcdTBmOTdcXHUwZjk5LVxcdTBmYmNcXHUwZmM2XFx1MTAyZC1cXHUxMDMwXFx1MTAzMi1cXHUxMDM3XFx1MTAzOVxcdTEwM2FcXHUxMDNkXFx1MTAzZVxcdTEwNThcXHUxMDU5XFx1MTA1ZS1cXHUxMDYwXFx1MTA3MS1cXHUxMDc0XFx1MTA4MlxcdTEwODVcXHUxMDg2XFx1MTA4ZFxcdTEwOWRcXHUxMzVmXFx1MTcxMi1cXHUxNzE0XFx1MTczMi1cXHUxNzM0XFx1MTc1MlxcdTE3NTNcXHUxNzcyXFx1MTc3M1xcdTE3YjctXFx1MTdiZFxcdTE3YzZcXHUxN2M5LVxcdTE3ZDNcXHUxN2RkXFx1MTgwYi1cXHUxODBkXFx1MThhOVxcdTE5MjAtXFx1MTkyMlxcdTE5MjdcXHUxOTI4XFx1MTkzMlxcdTE5MzktXFx1MTkzYlxcdTFhMTdcXHUxYTE4XFx1MWE1NlxcdTFhNTgtXFx1MWE1ZVxcdTFhNjBcXHUxYTYyXFx1MWE2NS1cXHUxYTZjXFx1MWE3My1cXHUxYTdjXFx1MWE3ZlxcdTFiMDAtXFx1MWIwM1xcdTFiMzRcXHUxYjM2LVxcdTFiM2FcXHUxYjNjXFx1MWI0MlxcdTFiNmItXFx1MWI3M1xcdTFiODBcXHUxYjgxXFx1MWJhMi1cXHUxYmE1XFx1MWJhOFxcdTFiYTlcXHUxYzJjLVxcdTFjMzNcXHUxYzM2XFx1MWMzN1xcdTFjZDAtXFx1MWNkMlxcdTFjZDQtXFx1MWNlMFxcdTFjZTItXFx1MWNlOFxcdTFjZWRcXHUxZGMwLVxcdTFkZTZcXHUxZGZkLVxcdTFkZmZcXHUyMDBjXFx1MjAwZFxcdTIwZDAtXFx1MjBmMFxcdTJjZWYtXFx1MmNmMVxcdTJkZTAtXFx1MmRmZlxcdTMwMmEtXFx1MzAyZlxcdTMwOTlcXHUzMDlhXFx1YTY2Zi1cXHVhNjcyXFx1YTY3Y1xcdWE2N2RcXHVhNmYwXFx1YTZmMVxcdWE4MDJcXHVhODA2XFx1YTgwYlxcdWE4MjVcXHVhODI2XFx1YThjNFxcdWE4ZTAtXFx1YThmMVxcdWE5MjYtXFx1YTkyZFxcdWE5NDctXFx1YTk1MVxcdWE5ODAtXFx1YTk4MlxcdWE5YjNcXHVhOWI2LVxcdWE5YjlcXHVhOWJjXFx1YWEyOS1cXHVhYTJlXFx1YWEzMVxcdWFhMzJcXHVhYTM1XFx1YWEzNlxcdWFhNDNcXHVhYTRjXFx1YWFiMFxcdWFhYjItXFx1YWFiNFxcdWFhYjdcXHVhYWI4XFx1YWFiZVxcdWFhYmZcXHVhYWMxXFx1YWJlNVxcdWFiZThcXHVhYmVkXFx1ZGMwMC1cXHVkZmZmXFx1ZmIxZVxcdWZlMDAtXFx1ZmUwZlxcdWZlMjAtXFx1ZmUyNlxcdWZmOWVcXHVmZjlmXS87XG4gIGZ1bmN0aW9uIGlzRXh0ZW5kaW5nQ2hhcihjaCkgeyByZXR1cm4gY2guY2hhckNvZGVBdCgwKSA+PSA3NjggJiYgZXh0ZW5kaW5nQ2hhcnMudGVzdChjaCk7IH1cblxuICAvLyBET00gVVRJTElUSUVTXG5cbiAgZnVuY3Rpb24gZWx0KHRhZywgY29udGVudCwgY2xhc3NOYW1lLCBzdHlsZSkge1xuICAgIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xuICAgIGlmIChjbGFzc05hbWUpIGUuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xuICAgIGlmIChzdHlsZSkgZS5zdHlsZS5jc3NUZXh0ID0gc3R5bGU7XG4gICAgaWYgKHR5cGVvZiBjb250ZW50ID09IFwic3RyaW5nXCIpIGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY29udGVudCkpO1xuICAgIGVsc2UgaWYgKGNvbnRlbnQpIGZvciAodmFyIGkgPSAwOyBpIDwgY29udGVudC5sZW5ndGg7ICsraSkgZS5hcHBlbmRDaGlsZChjb250ZW50W2ldKTtcbiAgICByZXR1cm4gZTtcbiAgfVxuXG4gIHZhciByYW5nZTtcbiAgaWYgKGRvY3VtZW50LmNyZWF0ZVJhbmdlKSByYW5nZSA9IGZ1bmN0aW9uKG5vZGUsIHN0YXJ0LCBlbmQpIHtcbiAgICB2YXIgciA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgci5zZXRFbmQobm9kZSwgZW5kKTtcbiAgICByLnNldFN0YXJ0KG5vZGUsIHN0YXJ0KTtcbiAgICByZXR1cm4gcjtcbiAgfTtcbiAgZWxzZSByYW5nZSA9IGZ1bmN0aW9uKG5vZGUsIHN0YXJ0LCBlbmQpIHtcbiAgICB2YXIgciA9IGRvY3VtZW50LmJvZHkuY3JlYXRlVGV4dFJhbmdlKCk7XG4gICAgci5tb3ZlVG9FbGVtZW50VGV4dChub2RlLnBhcmVudE5vZGUpO1xuICAgIHIuY29sbGFwc2UodHJ1ZSk7XG4gICAgci5tb3ZlRW5kKFwiY2hhcmFjdGVyXCIsIGVuZCk7XG4gICAgci5tb3ZlU3RhcnQoXCJjaGFyYWN0ZXJcIiwgc3RhcnQpO1xuICAgIHJldHVybiByO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHJlbW92ZUNoaWxkcmVuKGUpIHtcbiAgICBmb3IgKHZhciBjb3VudCA9IGUuY2hpbGROb2Rlcy5sZW5ndGg7IGNvdW50ID4gMDsgLS1jb3VudClcbiAgICAgIGUucmVtb3ZlQ2hpbGQoZS5maXJzdENoaWxkKTtcbiAgICByZXR1cm4gZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZUNoaWxkcmVuQW5kQWRkKHBhcmVudCwgZSkge1xuICAgIHJldHVybiByZW1vdmVDaGlsZHJlbihwYXJlbnQpLmFwcGVuZENoaWxkKGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gY29udGFpbnMocGFyZW50LCBjaGlsZCkge1xuICAgIGlmIChwYXJlbnQuY29udGFpbnMpXG4gICAgICByZXR1cm4gcGFyZW50LmNvbnRhaW5zKGNoaWxkKTtcbiAgICB3aGlsZSAoY2hpbGQgPSBjaGlsZC5wYXJlbnROb2RlKVxuICAgICAgaWYgKGNoaWxkID09IHBhcmVudCkgcmV0dXJuIHRydWU7XG4gIH1cblxuICBmdW5jdGlvbiBhY3RpdmVFbHQoKSB7IHJldHVybiBkb2N1bWVudC5hY3RpdmVFbGVtZW50OyB9XG4gIC8vIE9sZGVyIHZlcnNpb25zIG9mIElFIHRocm93cyB1bnNwZWNpZmllZCBlcnJvciB3aGVuIHRvdWNoaW5nXG4gIC8vIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgaW4gc29tZSBjYXNlcyAoZHVyaW5nIGxvYWRpbmcsIGluIGlmcmFtZSlcbiAgaWYgKGllX3VwdG8xMCkgYWN0aXZlRWx0ID0gZnVuY3Rpb24oKSB7XG4gICAgdHJ5IHsgcmV0dXJuIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7IH1cbiAgICBjYXRjaChlKSB7IHJldHVybiBkb2N1bWVudC5ib2R5OyB9XG4gIH07XG5cbiAgZnVuY3Rpb24gY2xhc3NUZXN0KGNscykgeyByZXR1cm4gbmV3IFJlZ0V4cChcIlxcXFxiXCIgKyBjbHMgKyBcIlxcXFxiXFxcXHMqXCIpOyB9XG4gIGZ1bmN0aW9uIHJtQ2xhc3Mobm9kZSwgY2xzKSB7XG4gICAgdmFyIHRlc3QgPSBjbGFzc1Rlc3QoY2xzKTtcbiAgICBpZiAodGVzdC50ZXN0KG5vZGUuY2xhc3NOYW1lKSkgbm9kZS5jbGFzc05hbWUgPSBub2RlLmNsYXNzTmFtZS5yZXBsYWNlKHRlc3QsIFwiXCIpO1xuICB9XG4gIGZ1bmN0aW9uIGFkZENsYXNzKG5vZGUsIGNscykge1xuICAgIGlmICghY2xhc3NUZXN0KGNscykudGVzdChub2RlLmNsYXNzTmFtZSkpIG5vZGUuY2xhc3NOYW1lICs9IFwiIFwiICsgY2xzO1xuICB9XG4gIGZ1bmN0aW9uIGpvaW5DbGFzc2VzKGEsIGIpIHtcbiAgICB2YXIgYXMgPSBhLnNwbGl0KFwiIFwiKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFzLmxlbmd0aDsgaSsrKVxuICAgICAgaWYgKGFzW2ldICYmICFjbGFzc1Rlc3QoYXNbaV0pLnRlc3QoYikpIGIgKz0gXCIgXCIgKyBhc1tpXTtcbiAgICByZXR1cm4gYjtcbiAgfVxuXG4gIC8vIFdJTkRPVy1XSURFIEVWRU5UU1xuXG4gIC8vIFRoZXNlIG11c3QgYmUgaGFuZGxlZCBjYXJlZnVsbHksIGJlY2F1c2UgbmFpdmVseSByZWdpc3RlcmluZyBhXG4gIC8vIGhhbmRsZXIgZm9yIGVhY2ggZWRpdG9yIHdpbGwgY2F1c2UgdGhlIGVkaXRvcnMgdG8gbmV2ZXIgYmVcbiAgLy8gZ2FyYmFnZSBjb2xsZWN0ZWQuXG5cbiAgZnVuY3Rpb24gZm9yRWFjaENvZGVNaXJyb3IoZikge1xuICAgIGlmICghZG9jdW1lbnQuYm9keS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKSByZXR1cm47XG4gICAgdmFyIGJ5Q2xhc3MgPSBkb2N1bWVudC5ib2R5LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJDb2RlTWlycm9yXCIpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYnlDbGFzcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGNtID0gYnlDbGFzc1tpXS5Db2RlTWlycm9yO1xuICAgICAgaWYgKGNtKSBmKGNtKTtcbiAgICB9XG4gIH1cblxuICB2YXIgZ2xvYmFsc1JlZ2lzdGVyZWQgPSBmYWxzZTtcbiAgZnVuY3Rpb24gZW5zdXJlR2xvYmFsSGFuZGxlcnMoKSB7XG4gICAgaWYgKGdsb2JhbHNSZWdpc3RlcmVkKSByZXR1cm47XG4gICAgcmVnaXN0ZXJHbG9iYWxIYW5kbGVycygpO1xuICAgIGdsb2JhbHNSZWdpc3RlcmVkID0gdHJ1ZTtcbiAgfVxuICBmdW5jdGlvbiByZWdpc3Rlckdsb2JhbEhhbmRsZXJzKCkge1xuICAgIC8vIFdoZW4gdGhlIHdpbmRvdyByZXNpemVzLCB3ZSBuZWVkIHRvIHJlZnJlc2ggYWN0aXZlIGVkaXRvcnMuXG4gICAgdmFyIHJlc2l6ZVRpbWVyO1xuICAgIG9uKHdpbmRvdywgXCJyZXNpemVcIiwgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAocmVzaXplVGltZXIgPT0gbnVsbCkgcmVzaXplVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICByZXNpemVUaW1lciA9IG51bGw7XG4gICAgICAgIGtub3duU2Nyb2xsYmFyV2lkdGggPSBudWxsO1xuICAgICAgICBmb3JFYWNoQ29kZU1pcnJvcihvblJlc2l6ZSk7XG4gICAgICB9LCAxMDApO1xuICAgIH0pO1xuICAgIC8vIFdoZW4gdGhlIHdpbmRvdyBsb3NlcyBmb2N1cywgd2Ugd2FudCB0byBzaG93IHRoZSBlZGl0b3IgYXMgYmx1cnJlZFxuICAgIG9uKHdpbmRvdywgXCJibHVyXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgZm9yRWFjaENvZGVNaXJyb3Iob25CbHVyKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIEZFQVRVUkUgREVURUNUSU9OXG5cbiAgLy8gRGV0ZWN0IGRyYWctYW5kLWRyb3BcbiAgdmFyIGRyYWdBbmREcm9wID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gVGhlcmUgaXMgKnNvbWUqIGtpbmQgb2YgZHJhZy1hbmQtZHJvcCBzdXBwb3J0IGluIElFNi04LCBidXQgSVxuICAgIC8vIGNvdWxkbid0IGdldCBpdCB0byB3b3JrIHlldC5cbiAgICBpZiAoaWVfdXB0bzgpIHJldHVybiBmYWxzZTtcbiAgICB2YXIgZGl2ID0gZWx0KCdkaXYnKTtcbiAgICByZXR1cm4gXCJkcmFnZ2FibGVcIiBpbiBkaXYgfHwgXCJkcmFnRHJvcFwiIGluIGRpdjtcbiAgfSgpO1xuXG4gIHZhciBrbm93blNjcm9sbGJhcldpZHRoO1xuICBmdW5jdGlvbiBzY3JvbGxiYXJXaWR0aChtZWFzdXJlKSB7XG4gICAgaWYgKGtub3duU2Nyb2xsYmFyV2lkdGggIT0gbnVsbCkgcmV0dXJuIGtub3duU2Nyb2xsYmFyV2lkdGg7XG4gICAgdmFyIHRlc3QgPSBlbHQoXCJkaXZcIiwgbnVsbCwgbnVsbCwgXCJ3aWR0aDogNTBweDsgaGVpZ2h0OiA1MHB4OyBvdmVyZmxvdy14OiBzY3JvbGxcIik7XG4gICAgcmVtb3ZlQ2hpbGRyZW5BbmRBZGQobWVhc3VyZSwgdGVzdCk7XG4gICAgaWYgKHRlc3Qub2Zmc2V0V2lkdGgpXG4gICAgICBrbm93blNjcm9sbGJhcldpZHRoID0gdGVzdC5vZmZzZXRIZWlnaHQgLSB0ZXN0LmNsaWVudEhlaWdodDtcbiAgICByZXR1cm4ga25vd25TY3JvbGxiYXJXaWR0aCB8fCAwO1xuICB9XG5cbiAgdmFyIHp3c3BTdXBwb3J0ZWQ7XG4gIGZ1bmN0aW9uIHplcm9XaWR0aEVsZW1lbnQobWVhc3VyZSkge1xuICAgIGlmICh6d3NwU3VwcG9ydGVkID09IG51bGwpIHtcbiAgICAgIHZhciB0ZXN0ID0gZWx0KFwic3BhblwiLCBcIlxcdTIwMGJcIik7XG4gICAgICByZW1vdmVDaGlsZHJlbkFuZEFkZChtZWFzdXJlLCBlbHQoXCJzcGFuXCIsIFt0ZXN0LCBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcInhcIildKSk7XG4gICAgICBpZiAobWVhc3VyZS5maXJzdENoaWxkLm9mZnNldEhlaWdodCAhPSAwKVxuICAgICAgICB6d3NwU3VwcG9ydGVkID0gdGVzdC5vZmZzZXRXaWR0aCA8PSAxICYmIHRlc3Qub2Zmc2V0SGVpZ2h0ID4gMiAmJiAhaWVfdXB0bzc7XG4gICAgfVxuICAgIGlmICh6d3NwU3VwcG9ydGVkKSByZXR1cm4gZWx0KFwic3BhblwiLCBcIlxcdTIwMGJcIik7XG4gICAgZWxzZSByZXR1cm4gZWx0KFwic3BhblwiLCBcIlxcdTAwYTBcIiwgbnVsbCwgXCJkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IHdpZHRoOiAxcHg7IG1hcmdpbi1yaWdodDogLTFweFwiKTtcbiAgfVxuXG4gIC8vIEZlYXR1cmUtZGV0ZWN0IElFJ3MgY3J1bW15IGNsaWVudCByZWN0IHJlcG9ydGluZyBmb3IgYmlkaSB0ZXh0XG4gIHZhciBiYWRCaWRpUmVjdHM7XG4gIGZ1bmN0aW9uIGhhc0JhZEJpZGlSZWN0cyhtZWFzdXJlKSB7XG4gICAgaWYgKGJhZEJpZGlSZWN0cyAhPSBudWxsKSByZXR1cm4gYmFkQmlkaVJlY3RzO1xuICAgIHZhciB0eHQgPSByZW1vdmVDaGlsZHJlbkFuZEFkZChtZWFzdXJlLCBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIkFcXHUwNjJlQVwiKSk7XG4gICAgdmFyIHIwID0gcmFuZ2UodHh0LCAwLCAxKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBpZiAocjAubGVmdCA9PSByMC5yaWdodCkgcmV0dXJuIGZhbHNlO1xuICAgIHZhciByMSA9IHJhbmdlKHR4dCwgMSwgMikuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgcmV0dXJuIGJhZEJpZGlSZWN0cyA9IChyMS5yaWdodCAtIHIwLnJpZ2h0IDwgMyk7XG4gIH1cblxuICAvLyBTZWUgaWYgXCJcIi5zcGxpdCBpcyB0aGUgYnJva2VuIElFIHZlcnNpb24sIGlmIHNvLCBwcm92aWRlIGFuXG4gIC8vIGFsdGVybmF0aXZlIHdheSB0byBzcGxpdCBsaW5lcy5cbiAgdmFyIHNwbGl0TGluZXMgPSBDb2RlTWlycm9yLnNwbGl0TGluZXMgPSBcIlxcblxcbmJcIi5zcGxpdCgvXFxuLykubGVuZ3RoICE9IDMgPyBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICB2YXIgcG9zID0gMCwgcmVzdWx0ID0gW10sIGwgPSBzdHJpbmcubGVuZ3RoO1xuICAgIHdoaWxlIChwb3MgPD0gbCkge1xuICAgICAgdmFyIG5sID0gc3RyaW5nLmluZGV4T2YoXCJcXG5cIiwgcG9zKTtcbiAgICAgIGlmIChubCA9PSAtMSkgbmwgPSBzdHJpbmcubGVuZ3RoO1xuICAgICAgdmFyIGxpbmUgPSBzdHJpbmcuc2xpY2UocG9zLCBzdHJpbmcuY2hhckF0KG5sIC0gMSkgPT0gXCJcXHJcIiA/IG5sIC0gMSA6IG5sKTtcbiAgICAgIHZhciBydCA9IGxpbmUuaW5kZXhPZihcIlxcclwiKTtcbiAgICAgIGlmIChydCAhPSAtMSkge1xuICAgICAgICByZXN1bHQucHVzaChsaW5lLnNsaWNlKDAsIHJ0KSk7XG4gICAgICAgIHBvcyArPSBydCArIDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQucHVzaChsaW5lKTtcbiAgICAgICAgcG9zID0gbmwgKyAxO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9IDogZnVuY3Rpb24oc3RyaW5nKXtyZXR1cm4gc3RyaW5nLnNwbGl0KC9cXHJcXG4/fFxcbi8pO307XG5cbiAgdmFyIGhhc1NlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24gPyBmdW5jdGlvbih0ZSkge1xuICAgIHRyeSB7IHJldHVybiB0ZS5zZWxlY3Rpb25TdGFydCAhPSB0ZS5zZWxlY3Rpb25FbmQ7IH1cbiAgICBjYXRjaChlKSB7IHJldHVybiBmYWxzZTsgfVxuICB9IDogZnVuY3Rpb24odGUpIHtcbiAgICB0cnkge3ZhciByYW5nZSA9IHRlLm93bmVyRG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCk7fVxuICAgIGNhdGNoKGUpIHt9XG4gICAgaWYgKCFyYW5nZSB8fCByYW5nZS5wYXJlbnRFbGVtZW50KCkgIT0gdGUpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gcmFuZ2UuY29tcGFyZUVuZFBvaW50cyhcIlN0YXJ0VG9FbmRcIiwgcmFuZ2UpICE9IDA7XG4gIH07XG5cbiAgdmFyIGhhc0NvcHlFdmVudCA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgZSA9IGVsdChcImRpdlwiKTtcbiAgICBpZiAoXCJvbmNvcHlcIiBpbiBlKSByZXR1cm4gdHJ1ZTtcbiAgICBlLnNldEF0dHJpYnV0ZShcIm9uY29weVwiLCBcInJldHVybjtcIik7XG4gICAgcmV0dXJuIHR5cGVvZiBlLm9uY29weSA9PSBcImZ1bmN0aW9uXCI7XG4gIH0pKCk7XG5cbiAgLy8gS0VZIE5BTUVTXG5cbiAgdmFyIGtleU5hbWVzID0gezM6IFwiRW50ZXJcIiwgODogXCJCYWNrc3BhY2VcIiwgOTogXCJUYWJcIiwgMTM6IFwiRW50ZXJcIiwgMTY6IFwiU2hpZnRcIiwgMTc6IFwiQ3RybFwiLCAxODogXCJBbHRcIixcbiAgICAgICAgICAgICAgICAgIDE5OiBcIlBhdXNlXCIsIDIwOiBcIkNhcHNMb2NrXCIsIDI3OiBcIkVzY1wiLCAzMjogXCJTcGFjZVwiLCAzMzogXCJQYWdlVXBcIiwgMzQ6IFwiUGFnZURvd25cIiwgMzU6IFwiRW5kXCIsXG4gICAgICAgICAgICAgICAgICAzNjogXCJIb21lXCIsIDM3OiBcIkxlZnRcIiwgMzg6IFwiVXBcIiwgMzk6IFwiUmlnaHRcIiwgNDA6IFwiRG93blwiLCA0NDogXCJQcmludFNjcm5cIiwgNDU6IFwiSW5zZXJ0XCIsXG4gICAgICAgICAgICAgICAgICA0NjogXCJEZWxldGVcIiwgNTk6IFwiO1wiLCA2MTogXCI9XCIsIDkxOiBcIk1vZFwiLCA5MjogXCJNb2RcIiwgOTM6IFwiTW9kXCIsIDEwNzogXCI9XCIsIDEwOTogXCItXCIsIDEyNzogXCJEZWxldGVcIixcbiAgICAgICAgICAgICAgICAgIDE3MzogXCItXCIsIDE4NjogXCI7XCIsIDE4NzogXCI9XCIsIDE4ODogXCIsXCIsIDE4OTogXCItXCIsIDE5MDogXCIuXCIsIDE5MTogXCIvXCIsIDE5MjogXCJgXCIsIDIxOTogXCJbXCIsIDIyMDogXCJcXFxcXCIsXG4gICAgICAgICAgICAgICAgICAyMjE6IFwiXVwiLCAyMjI6IFwiJ1wiLCA2MzIzMjogXCJVcFwiLCA2MzIzMzogXCJEb3duXCIsIDYzMjM0OiBcIkxlZnRcIiwgNjMyMzU6IFwiUmlnaHRcIiwgNjMyNzI6IFwiRGVsZXRlXCIsXG4gICAgICAgICAgICAgICAgICA2MzI3MzogXCJIb21lXCIsIDYzMjc1OiBcIkVuZFwiLCA2MzI3NjogXCJQYWdlVXBcIiwgNjMyNzc6IFwiUGFnZURvd25cIiwgNjMzMDI6IFwiSW5zZXJ0XCJ9O1xuICBDb2RlTWlycm9yLmtleU5hbWVzID0ga2V5TmFtZXM7XG4gIChmdW5jdGlvbigpIHtcbiAgICAvLyBOdW1iZXIga2V5c1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTA7IGkrKykga2V5TmFtZXNbaSArIDQ4XSA9IGtleU5hbWVzW2kgKyA5Nl0gPSBTdHJpbmcoaSk7XG4gICAgLy8gQWxwaGFiZXRpYyBrZXlzXG4gICAgZm9yICh2YXIgaSA9IDY1OyBpIDw9IDkwOyBpKyspIGtleU5hbWVzW2ldID0gU3RyaW5nLmZyb21DaGFyQ29kZShpKTtcbiAgICAvLyBGdW5jdGlvbiBrZXlzXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gMTI7IGkrKykga2V5TmFtZXNbaSArIDExMV0gPSBrZXlOYW1lc1tpICsgNjMyMzVdID0gXCJGXCIgKyBpO1xuICB9KSgpO1xuXG4gIC8vIEJJREkgSEVMUEVSU1xuXG4gIGZ1bmN0aW9uIGl0ZXJhdGVCaWRpU2VjdGlvbnMob3JkZXIsIGZyb20sIHRvLCBmKSB7XG4gICAgaWYgKCFvcmRlcikgcmV0dXJuIGYoZnJvbSwgdG8sIFwibHRyXCIpO1xuICAgIHZhciBmb3VuZCA9IGZhbHNlO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb3JkZXIubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBwYXJ0ID0gb3JkZXJbaV07XG4gICAgICBpZiAocGFydC5mcm9tIDwgdG8gJiYgcGFydC50byA+IGZyb20gfHwgZnJvbSA9PSB0byAmJiBwYXJ0LnRvID09IGZyb20pIHtcbiAgICAgICAgZihNYXRoLm1heChwYXJ0LmZyb20sIGZyb20pLCBNYXRoLm1pbihwYXJ0LnRvLCB0byksIHBhcnQubGV2ZWwgPT0gMSA/IFwicnRsXCIgOiBcImx0clwiKTtcbiAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIWZvdW5kKSBmKGZyb20sIHRvLCBcImx0clwiKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJpZGlMZWZ0KHBhcnQpIHsgcmV0dXJuIHBhcnQubGV2ZWwgJSAyID8gcGFydC50byA6IHBhcnQuZnJvbTsgfVxuICBmdW5jdGlvbiBiaWRpUmlnaHQocGFydCkgeyByZXR1cm4gcGFydC5sZXZlbCAlIDIgPyBwYXJ0LmZyb20gOiBwYXJ0LnRvOyB9XG5cbiAgZnVuY3Rpb24gbGluZUxlZnQobGluZSkgeyB2YXIgb3JkZXIgPSBnZXRPcmRlcihsaW5lKTsgcmV0dXJuIG9yZGVyID8gYmlkaUxlZnQob3JkZXJbMF0pIDogMDsgfVxuICBmdW5jdGlvbiBsaW5lUmlnaHQobGluZSkge1xuICAgIHZhciBvcmRlciA9IGdldE9yZGVyKGxpbmUpO1xuICAgIGlmICghb3JkZXIpIHJldHVybiBsaW5lLnRleHQubGVuZ3RoO1xuICAgIHJldHVybiBiaWRpUmlnaHQobHN0KG9yZGVyKSk7XG4gIH1cblxuICBmdW5jdGlvbiBsaW5lU3RhcnQoY20sIGxpbmVOKSB7XG4gICAgdmFyIGxpbmUgPSBnZXRMaW5lKGNtLmRvYywgbGluZU4pO1xuICAgIHZhciB2aXN1YWwgPSB2aXN1YWxMaW5lKGxpbmUpO1xuICAgIGlmICh2aXN1YWwgIT0gbGluZSkgbGluZU4gPSBsaW5lTm8odmlzdWFsKTtcbiAgICB2YXIgb3JkZXIgPSBnZXRPcmRlcih2aXN1YWwpO1xuICAgIHZhciBjaCA9ICFvcmRlciA/IDAgOiBvcmRlclswXS5sZXZlbCAlIDIgPyBsaW5lUmlnaHQodmlzdWFsKSA6IGxpbmVMZWZ0KHZpc3VhbCk7XG4gICAgcmV0dXJuIFBvcyhsaW5lTiwgY2gpO1xuICB9XG4gIGZ1bmN0aW9uIGxpbmVFbmQoY20sIGxpbmVOKSB7XG4gICAgdmFyIG1lcmdlZCwgbGluZSA9IGdldExpbmUoY20uZG9jLCBsaW5lTik7XG4gICAgd2hpbGUgKG1lcmdlZCA9IGNvbGxhcHNlZFNwYW5BdEVuZChsaW5lKSkge1xuICAgICAgbGluZSA9IG1lcmdlZC5maW5kKDEsIHRydWUpLmxpbmU7XG4gICAgICBsaW5lTiA9IG51bGw7XG4gICAgfVxuICAgIHZhciBvcmRlciA9IGdldE9yZGVyKGxpbmUpO1xuICAgIHZhciBjaCA9ICFvcmRlciA/IGxpbmUudGV4dC5sZW5ndGggOiBvcmRlclswXS5sZXZlbCAlIDIgPyBsaW5lTGVmdChsaW5lKSA6IGxpbmVSaWdodChsaW5lKTtcbiAgICByZXR1cm4gUG9zKGxpbmVOID09IG51bGwgPyBsaW5lTm8obGluZSkgOiBsaW5lTiwgY2gpO1xuICB9XG5cbiAgZnVuY3Rpb24gY29tcGFyZUJpZGlMZXZlbChvcmRlciwgYSwgYikge1xuICAgIHZhciBsaW5lZGlyID0gb3JkZXJbMF0ubGV2ZWw7XG4gICAgaWYgKGEgPT0gbGluZWRpcikgcmV0dXJuIHRydWU7XG4gICAgaWYgKGIgPT0gbGluZWRpcikgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiBhIDwgYjtcbiAgfVxuICB2YXIgYmlkaU90aGVyO1xuICBmdW5jdGlvbiBnZXRCaWRpUGFydEF0KG9yZGVyLCBwb3MpIHtcbiAgICBiaWRpT3RoZXIgPSBudWxsO1xuICAgIGZvciAodmFyIGkgPSAwLCBmb3VuZDsgaSA8IG9yZGVyLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgY3VyID0gb3JkZXJbaV07XG4gICAgICBpZiAoY3VyLmZyb20gPCBwb3MgJiYgY3VyLnRvID4gcG9zKSByZXR1cm4gaTtcbiAgICAgIGlmICgoY3VyLmZyb20gPT0gcG9zIHx8IGN1ci50byA9PSBwb3MpKSB7XG4gICAgICAgIGlmIChmb3VuZCA9PSBudWxsKSB7XG4gICAgICAgICAgZm91bmQgPSBpO1xuICAgICAgICB9IGVsc2UgaWYgKGNvbXBhcmVCaWRpTGV2ZWwob3JkZXIsIGN1ci5sZXZlbCwgb3JkZXJbZm91bmRdLmxldmVsKSkge1xuICAgICAgICAgIGlmIChjdXIuZnJvbSAhPSBjdXIudG8pIGJpZGlPdGhlciA9IGZvdW5kO1xuICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChjdXIuZnJvbSAhPSBjdXIudG8pIGJpZGlPdGhlciA9IGk7XG4gICAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmb3VuZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1vdmVJbkxpbmUobGluZSwgcG9zLCBkaXIsIGJ5VW5pdCkge1xuICAgIGlmICghYnlVbml0KSByZXR1cm4gcG9zICsgZGlyO1xuICAgIGRvIHBvcyArPSBkaXI7XG4gICAgd2hpbGUgKHBvcyA+IDAgJiYgaXNFeHRlbmRpbmdDaGFyKGxpbmUudGV4dC5jaGFyQXQocG9zKSkpO1xuICAgIHJldHVybiBwb3M7XG4gIH1cblxuICAvLyBUaGlzIGlzIG5lZWRlZCBpbiBvcmRlciB0byBtb3ZlICd2aXN1YWxseScgdGhyb3VnaCBiaS1kaXJlY3Rpb25hbFxuICAvLyB0ZXh0IC0tIGkuZS4sIHByZXNzaW5nIGxlZnQgc2hvdWxkIG1ha2UgdGhlIGN1cnNvciBnbyBsZWZ0LCBldmVuXG4gIC8vIHdoZW4gaW4gUlRMIHRleHQuIFRoZSB0cmlja3kgcGFydCBpcyB0aGUgJ2p1bXBzJywgd2hlcmUgUlRMIGFuZFxuICAvLyBMVFIgdGV4dCB0b3VjaCBlYWNoIG90aGVyLiBUaGlzIG9mdGVuIHJlcXVpcmVzIHRoZSBjdXJzb3Igb2Zmc2V0XG4gIC8vIHRvIG1vdmUgbW9yZSB0aGFuIG9uZSB1bml0LCBpbiBvcmRlciB0byB2aXN1YWxseSBtb3ZlIG9uZSB1bml0LlxuICBmdW5jdGlvbiBtb3ZlVmlzdWFsbHkobGluZSwgc3RhcnQsIGRpciwgYnlVbml0KSB7XG4gICAgdmFyIGJpZGkgPSBnZXRPcmRlcihsaW5lKTtcbiAgICBpZiAoIWJpZGkpIHJldHVybiBtb3ZlTG9naWNhbGx5KGxpbmUsIHN0YXJ0LCBkaXIsIGJ5VW5pdCk7XG4gICAgdmFyIHBvcyA9IGdldEJpZGlQYXJ0QXQoYmlkaSwgc3RhcnQpLCBwYXJ0ID0gYmlkaVtwb3NdO1xuICAgIHZhciB0YXJnZXQgPSBtb3ZlSW5MaW5lKGxpbmUsIHN0YXJ0LCBwYXJ0LmxldmVsICUgMiA/IC1kaXIgOiBkaXIsIGJ5VW5pdCk7XG5cbiAgICBmb3IgKDs7KSB7XG4gICAgICBpZiAodGFyZ2V0ID4gcGFydC5mcm9tICYmIHRhcmdldCA8IHBhcnQudG8pIHJldHVybiB0YXJnZXQ7XG4gICAgICBpZiAodGFyZ2V0ID09IHBhcnQuZnJvbSB8fCB0YXJnZXQgPT0gcGFydC50bykge1xuICAgICAgICBpZiAoZ2V0QmlkaVBhcnRBdChiaWRpLCB0YXJnZXQpID09IHBvcykgcmV0dXJuIHRhcmdldDtcbiAgICAgICAgcGFydCA9IGJpZGlbcG9zICs9IGRpcl07XG4gICAgICAgIHJldHVybiAoZGlyID4gMCkgPT0gcGFydC5sZXZlbCAlIDIgPyBwYXJ0LnRvIDogcGFydC5mcm9tO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFydCA9IGJpZGlbcG9zICs9IGRpcl07XG4gICAgICAgIGlmICghcGFydCkgcmV0dXJuIG51bGw7XG4gICAgICAgIGlmICgoZGlyID4gMCkgPT0gcGFydC5sZXZlbCAlIDIpXG4gICAgICAgICAgdGFyZ2V0ID0gbW92ZUluTGluZShsaW5lLCBwYXJ0LnRvLCAtMSwgYnlVbml0KTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHRhcmdldCA9IG1vdmVJbkxpbmUobGluZSwgcGFydC5mcm9tLCAxLCBieVVuaXQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG1vdmVMb2dpY2FsbHkobGluZSwgc3RhcnQsIGRpciwgYnlVbml0KSB7XG4gICAgdmFyIHRhcmdldCA9IHN0YXJ0ICsgZGlyO1xuICAgIGlmIChieVVuaXQpIHdoaWxlICh0YXJnZXQgPiAwICYmIGlzRXh0ZW5kaW5nQ2hhcihsaW5lLnRleHQuY2hhckF0KHRhcmdldCkpKSB0YXJnZXQgKz0gZGlyO1xuICAgIHJldHVybiB0YXJnZXQgPCAwIHx8IHRhcmdldCA+IGxpbmUudGV4dC5sZW5ndGggPyBudWxsIDogdGFyZ2V0O1xuICB9XG5cbiAgLy8gQmlkaXJlY3Rpb25hbCBvcmRlcmluZyBhbGdvcml0aG1cbiAgLy8gU2VlIGh0dHA6Ly91bmljb2RlLm9yZy9yZXBvcnRzL3RyOS90cjktMTMuaHRtbCBmb3IgdGhlIGFsZ29yaXRobVxuICAvLyB0aGF0IHRoaXMgKHBhcnRpYWxseSkgaW1wbGVtZW50cy5cblxuICAvLyBPbmUtY2hhciBjb2RlcyB1c2VkIGZvciBjaGFyYWN0ZXIgdHlwZXM6XG4gIC8vIEwgKEwpOiAgIExlZnQtdG8tUmlnaHRcbiAgLy8gUiAoUik6ICAgUmlnaHQtdG8tTGVmdFxuICAvLyByIChBTCk6ICBSaWdodC10by1MZWZ0IEFyYWJpY1xuICAvLyAxIChFTik6ICBFdXJvcGVhbiBOdW1iZXJcbiAgLy8gKyAoRVMpOiAgRXVyb3BlYW4gTnVtYmVyIFNlcGFyYXRvclxuICAvLyAlIChFVCk6ICBFdXJvcGVhbiBOdW1iZXIgVGVybWluYXRvclxuICAvLyBuIChBTik6ICBBcmFiaWMgTnVtYmVyXG4gIC8vICwgKENTKTogIENvbW1vbiBOdW1iZXIgU2VwYXJhdG9yXG4gIC8vIG0gKE5TTSk6IE5vbi1TcGFjaW5nIE1hcmtcbiAgLy8gYiAoQk4pOiAgQm91bmRhcnkgTmV1dHJhbFxuICAvLyBzIChCKTogICBQYXJhZ3JhcGggU2VwYXJhdG9yXG4gIC8vIHQgKFMpOiAgIFNlZ21lbnQgU2VwYXJhdG9yXG4gIC8vIHcgKFdTKTogIFdoaXRlc3BhY2VcbiAgLy8gTiAoT04pOiAgT3RoZXIgTmV1dHJhbHNcblxuICAvLyBSZXR1cm5zIG51bGwgaWYgY2hhcmFjdGVycyBhcmUgb3JkZXJlZCBhcyB0aGV5IGFwcGVhclxuICAvLyAobGVmdC10by1yaWdodCksIG9yIGFuIGFycmF5IG9mIHNlY3Rpb25zICh7ZnJvbSwgdG8sIGxldmVsfVxuICAvLyBvYmplY3RzKSBpbiB0aGUgb3JkZXIgaW4gd2hpY2ggdGhleSBvY2N1ciB2aXN1YWxseS5cbiAgdmFyIGJpZGlPcmRlcmluZyA9IChmdW5jdGlvbigpIHtcbiAgICAvLyBDaGFyYWN0ZXIgdHlwZXMgZm9yIGNvZGVwb2ludHMgMCB0byAweGZmXG4gICAgdmFyIGxvd1R5cGVzID0gXCJiYmJiYmJiYmJ0c3R3c2JiYmJiYmJiYmJiYmJic3NzdHdOTiUlJU5OTk5OTixOLE4xMTExMTExMTExTk5OTk5OTkxMTExMTExMTExMTExMTExMTExMTExMTExMTk5OTk5OTExMTExMTExMTExMTExMTExMTExMTExMTExOTk5OYmJiYmJic2JiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiLE4lJSUlTk5OTkxOTk5OTiUlMTFOTE5OTjFMTk5OTk5MTExMTExMTExMTExMTExMTExMTExMTE5MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTlwiO1xuICAgIC8vIENoYXJhY3RlciB0eXBlcyBmb3IgY29kZXBvaW50cyAweDYwMCB0byAweDZmZlxuICAgIHZhciBhcmFiaWNUeXBlcyA9IFwicnJycnJycnJycnJyLHJOTm1tbW1tbXJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJybW1tbW1tbW1tbW1tbW1ycnJycnJybm5ubm5ubm5ubiVubnJycm1ycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycm1tbW1tbW1tbW1tbW1tbW1tbW1ObW1tbVwiO1xuICAgIGZ1bmN0aW9uIGNoYXJUeXBlKGNvZGUpIHtcbiAgICAgIGlmIChjb2RlIDw9IDB4ZjcpIHJldHVybiBsb3dUeXBlcy5jaGFyQXQoY29kZSk7XG4gICAgICBlbHNlIGlmICgweDU5MCA8PSBjb2RlICYmIGNvZGUgPD0gMHg1ZjQpIHJldHVybiBcIlJcIjtcbiAgICAgIGVsc2UgaWYgKDB4NjAwIDw9IGNvZGUgJiYgY29kZSA8PSAweDZlZCkgcmV0dXJuIGFyYWJpY1R5cGVzLmNoYXJBdChjb2RlIC0gMHg2MDApO1xuICAgICAgZWxzZSBpZiAoMHg2ZWUgPD0gY29kZSAmJiBjb2RlIDw9IDB4OGFjKSByZXR1cm4gXCJyXCI7XG4gICAgICBlbHNlIGlmICgweDIwMDAgPD0gY29kZSAmJiBjb2RlIDw9IDB4MjAwYikgcmV0dXJuIFwid1wiO1xuICAgICAgZWxzZSBpZiAoY29kZSA9PSAweDIwMGMpIHJldHVybiBcImJcIjtcbiAgICAgIGVsc2UgcmV0dXJuIFwiTFwiO1xuICAgIH1cblxuICAgIHZhciBiaWRpUkUgPSAvW1xcdTA1OTAtXFx1MDVmNFxcdTA2MDAtXFx1MDZmZlxcdTA3MDAtXFx1MDhhY10vO1xuICAgIHZhciBpc05ldXRyYWwgPSAvW3N0d05dLywgaXNTdHJvbmcgPSAvW0xScl0vLCBjb3VudHNBc0xlZnQgPSAvW0xiMW5dLywgY291bnRzQXNOdW0gPSAvWzFuXS87XG4gICAgLy8gQnJvd3NlcnMgc2VlbSB0byBhbHdheXMgdHJlYXQgdGhlIGJvdW5kYXJpZXMgb2YgYmxvY2sgZWxlbWVudHMgYXMgYmVpbmcgTC5cbiAgICB2YXIgb3V0ZXJUeXBlID0gXCJMXCI7XG5cbiAgICBmdW5jdGlvbiBCaWRpU3BhbihsZXZlbCwgZnJvbSwgdG8pIHtcbiAgICAgIHRoaXMubGV2ZWwgPSBsZXZlbDtcbiAgICAgIHRoaXMuZnJvbSA9IGZyb207IHRoaXMudG8gPSB0bztcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oc3RyKSB7XG4gICAgICBpZiAoIWJpZGlSRS50ZXN0KHN0cikpIHJldHVybiBmYWxzZTtcbiAgICAgIHZhciBsZW4gPSBzdHIubGVuZ3RoLCB0eXBlcyA9IFtdO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIHR5cGU7IGkgPCBsZW47ICsraSlcbiAgICAgICAgdHlwZXMucHVzaCh0eXBlID0gY2hhclR5cGUoc3RyLmNoYXJDb2RlQXQoaSkpKTtcblxuICAgICAgLy8gVzEuIEV4YW1pbmUgZWFjaCBub24tc3BhY2luZyBtYXJrIChOU00pIGluIHRoZSBsZXZlbCBydW4sIGFuZFxuICAgICAgLy8gY2hhbmdlIHRoZSB0eXBlIG9mIHRoZSBOU00gdG8gdGhlIHR5cGUgb2YgdGhlIHByZXZpb3VzXG4gICAgICAvLyBjaGFyYWN0ZXIuIElmIHRoZSBOU00gaXMgYXQgdGhlIHN0YXJ0IG9mIHRoZSBsZXZlbCBydW4sIGl0IHdpbGxcbiAgICAgIC8vIGdldCB0aGUgdHlwZSBvZiBzb3IuXG4gICAgICBmb3IgKHZhciBpID0gMCwgcHJldiA9IG91dGVyVHlwZTsgaSA8IGxlbjsgKytpKSB7XG4gICAgICAgIHZhciB0eXBlID0gdHlwZXNbaV07XG4gICAgICAgIGlmICh0eXBlID09IFwibVwiKSB0eXBlc1tpXSA9IHByZXY7XG4gICAgICAgIGVsc2UgcHJldiA9IHR5cGU7XG4gICAgICB9XG5cbiAgICAgIC8vIFcyLiBTZWFyY2ggYmFja3dhcmRzIGZyb20gZWFjaCBpbnN0YW5jZSBvZiBhIEV1cm9wZWFuIG51bWJlclxuICAgICAgLy8gdW50aWwgdGhlIGZpcnN0IHN0cm9uZyB0eXBlIChSLCBMLCBBTCwgb3Igc29yKSBpcyBmb3VuZC4gSWYgYW5cbiAgICAgIC8vIEFMIGlzIGZvdW5kLCBjaGFuZ2UgdGhlIHR5cGUgb2YgdGhlIEV1cm9wZWFuIG51bWJlciB0byBBcmFiaWNcbiAgICAgIC8vIG51bWJlci5cbiAgICAgIC8vIFczLiBDaGFuZ2UgYWxsIEFMcyB0byBSLlxuICAgICAgZm9yICh2YXIgaSA9IDAsIGN1ciA9IG91dGVyVHlwZTsgaSA8IGxlbjsgKytpKSB7XG4gICAgICAgIHZhciB0eXBlID0gdHlwZXNbaV07XG4gICAgICAgIGlmICh0eXBlID09IFwiMVwiICYmIGN1ciA9PSBcInJcIikgdHlwZXNbaV0gPSBcIm5cIjtcbiAgICAgICAgZWxzZSBpZiAoaXNTdHJvbmcudGVzdCh0eXBlKSkgeyBjdXIgPSB0eXBlOyBpZiAodHlwZSA9PSBcInJcIikgdHlwZXNbaV0gPSBcIlJcIjsgfVxuICAgICAgfVxuXG4gICAgICAvLyBXNC4gQSBzaW5nbGUgRXVyb3BlYW4gc2VwYXJhdG9yIGJldHdlZW4gdHdvIEV1cm9wZWFuIG51bWJlcnNcbiAgICAgIC8vIGNoYW5nZXMgdG8gYSBFdXJvcGVhbiBudW1iZXIuIEEgc2luZ2xlIGNvbW1vbiBzZXBhcmF0b3IgYmV0d2VlblxuICAgICAgLy8gdHdvIG51bWJlcnMgb2YgdGhlIHNhbWUgdHlwZSBjaGFuZ2VzIHRvIHRoYXQgdHlwZS5cbiAgICAgIGZvciAodmFyIGkgPSAxLCBwcmV2ID0gdHlwZXNbMF07IGkgPCBsZW4gLSAxOyArK2kpIHtcbiAgICAgICAgdmFyIHR5cGUgPSB0eXBlc1tpXTtcbiAgICAgICAgaWYgKHR5cGUgPT0gXCIrXCIgJiYgcHJldiA9PSBcIjFcIiAmJiB0eXBlc1tpKzFdID09IFwiMVwiKSB0eXBlc1tpXSA9IFwiMVwiO1xuICAgICAgICBlbHNlIGlmICh0eXBlID09IFwiLFwiICYmIHByZXYgPT0gdHlwZXNbaSsxXSAmJlxuICAgICAgICAgICAgICAgICAocHJldiA9PSBcIjFcIiB8fCBwcmV2ID09IFwiblwiKSkgdHlwZXNbaV0gPSBwcmV2O1xuICAgICAgICBwcmV2ID0gdHlwZTtcbiAgICAgIH1cblxuICAgICAgLy8gVzUuIEEgc2VxdWVuY2Ugb2YgRXVyb3BlYW4gdGVybWluYXRvcnMgYWRqYWNlbnQgdG8gRXVyb3BlYW5cbiAgICAgIC8vIG51bWJlcnMgY2hhbmdlcyB0byBhbGwgRXVyb3BlYW4gbnVtYmVycy5cbiAgICAgIC8vIFc2LiBPdGhlcndpc2UsIHNlcGFyYXRvcnMgYW5kIHRlcm1pbmF0b3JzIGNoYW5nZSB0byBPdGhlclxuICAgICAgLy8gTmV1dHJhbC5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgICAgdmFyIHR5cGUgPSB0eXBlc1tpXTtcbiAgICAgICAgaWYgKHR5cGUgPT0gXCIsXCIpIHR5cGVzW2ldID0gXCJOXCI7XG4gICAgICAgIGVsc2UgaWYgKHR5cGUgPT0gXCIlXCIpIHtcbiAgICAgICAgICBmb3IgKHZhciBlbmQgPSBpICsgMTsgZW5kIDwgbGVuICYmIHR5cGVzW2VuZF0gPT0gXCIlXCI7ICsrZW5kKSB7fVxuICAgICAgICAgIHZhciByZXBsYWNlID0gKGkgJiYgdHlwZXNbaS0xXSA9PSBcIiFcIikgfHwgKGVuZCA8IGxlbiAmJiB0eXBlc1tlbmRdID09IFwiMVwiKSA/IFwiMVwiIDogXCJOXCI7XG4gICAgICAgICAgZm9yICh2YXIgaiA9IGk7IGogPCBlbmQ7ICsraikgdHlwZXNbal0gPSByZXBsYWNlO1xuICAgICAgICAgIGkgPSBlbmQgLSAxO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFc3LiBTZWFyY2ggYmFja3dhcmRzIGZyb20gZWFjaCBpbnN0YW5jZSBvZiBhIEV1cm9wZWFuIG51bWJlclxuICAgICAgLy8gdW50aWwgdGhlIGZpcnN0IHN0cm9uZyB0eXBlIChSLCBMLCBvciBzb3IpIGlzIGZvdW5kLiBJZiBhbiBMIGlzXG4gICAgICAvLyBmb3VuZCwgdGhlbiBjaGFuZ2UgdGhlIHR5cGUgb2YgdGhlIEV1cm9wZWFuIG51bWJlciB0byBMLlxuICAgICAgZm9yICh2YXIgaSA9IDAsIGN1ciA9IG91dGVyVHlwZTsgaSA8IGxlbjsgKytpKSB7XG4gICAgICAgIHZhciB0eXBlID0gdHlwZXNbaV07XG4gICAgICAgIGlmIChjdXIgPT0gXCJMXCIgJiYgdHlwZSA9PSBcIjFcIikgdHlwZXNbaV0gPSBcIkxcIjtcbiAgICAgICAgZWxzZSBpZiAoaXNTdHJvbmcudGVzdCh0eXBlKSkgY3VyID0gdHlwZTtcbiAgICAgIH1cblxuICAgICAgLy8gTjEuIEEgc2VxdWVuY2Ugb2YgbmV1dHJhbHMgdGFrZXMgdGhlIGRpcmVjdGlvbiBvZiB0aGVcbiAgICAgIC8vIHN1cnJvdW5kaW5nIHN0cm9uZyB0ZXh0IGlmIHRoZSB0ZXh0IG9uIGJvdGggc2lkZXMgaGFzIHRoZSBzYW1lXG4gICAgICAvLyBkaXJlY3Rpb24uIEV1cm9wZWFuIGFuZCBBcmFiaWMgbnVtYmVycyBhY3QgYXMgaWYgdGhleSB3ZXJlIFIgaW5cbiAgICAgIC8vIHRlcm1zIG9mIHRoZWlyIGluZmx1ZW5jZSBvbiBuZXV0cmFscy4gU3RhcnQtb2YtbGV2ZWwtcnVuIChzb3IpXG4gICAgICAvLyBhbmQgZW5kLW9mLWxldmVsLXJ1biAoZW9yKSBhcmUgdXNlZCBhdCBsZXZlbCBydW4gYm91bmRhcmllcy5cbiAgICAgIC8vIE4yLiBBbnkgcmVtYWluaW5nIG5ldXRyYWxzIHRha2UgdGhlIGVtYmVkZGluZyBkaXJlY3Rpb24uXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICAgIGlmIChpc05ldXRyYWwudGVzdCh0eXBlc1tpXSkpIHtcbiAgICAgICAgICBmb3IgKHZhciBlbmQgPSBpICsgMTsgZW5kIDwgbGVuICYmIGlzTmV1dHJhbC50ZXN0KHR5cGVzW2VuZF0pOyArK2VuZCkge31cbiAgICAgICAgICB2YXIgYmVmb3JlID0gKGkgPyB0eXBlc1tpLTFdIDogb3V0ZXJUeXBlKSA9PSBcIkxcIjtcbiAgICAgICAgICB2YXIgYWZ0ZXIgPSAoZW5kIDwgbGVuID8gdHlwZXNbZW5kXSA6IG91dGVyVHlwZSkgPT0gXCJMXCI7XG4gICAgICAgICAgdmFyIHJlcGxhY2UgPSBiZWZvcmUgfHwgYWZ0ZXIgPyBcIkxcIiA6IFwiUlwiO1xuICAgICAgICAgIGZvciAodmFyIGogPSBpOyBqIDwgZW5kOyArK2opIHR5cGVzW2pdID0gcmVwbGFjZTtcbiAgICAgICAgICBpID0gZW5kIC0gMTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBIZXJlIHdlIGRlcGFydCBmcm9tIHRoZSBkb2N1bWVudGVkIGFsZ29yaXRobSwgaW4gb3JkZXIgdG8gYXZvaWRcbiAgICAgIC8vIGJ1aWxkaW5nIHVwIGFuIGFjdHVhbCBsZXZlbHMgYXJyYXkuIFNpbmNlIHRoZXJlIGFyZSBvbmx5IHRocmVlXG4gICAgICAvLyBsZXZlbHMgKDAsIDEsIDIpIGluIGFuIGltcGxlbWVudGF0aW9uIHRoYXQgZG9lc24ndCB0YWtlXG4gICAgICAvLyBleHBsaWNpdCBlbWJlZGRpbmcgaW50byBhY2NvdW50LCB3ZSBjYW4gYnVpbGQgdXAgdGhlIG9yZGVyIG9uXG4gICAgICAvLyB0aGUgZmx5LCB3aXRob3V0IGZvbGxvd2luZyB0aGUgbGV2ZWwtYmFzZWQgYWxnb3JpdGhtLlxuICAgICAgdmFyIG9yZGVyID0gW10sIG07XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjspIHtcbiAgICAgICAgaWYgKGNvdW50c0FzTGVmdC50ZXN0KHR5cGVzW2ldKSkge1xuICAgICAgICAgIHZhciBzdGFydCA9IGk7XG4gICAgICAgICAgZm9yICgrK2k7IGkgPCBsZW4gJiYgY291bnRzQXNMZWZ0LnRlc3QodHlwZXNbaV0pOyArK2kpIHt9XG4gICAgICAgICAgb3JkZXIucHVzaChuZXcgQmlkaVNwYW4oMCwgc3RhcnQsIGkpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgcG9zID0gaSwgYXQgPSBvcmRlci5sZW5ndGg7XG4gICAgICAgICAgZm9yICgrK2k7IGkgPCBsZW4gJiYgdHlwZXNbaV0gIT0gXCJMXCI7ICsraSkge31cbiAgICAgICAgICBmb3IgKHZhciBqID0gcG9zOyBqIDwgaTspIHtcbiAgICAgICAgICAgIGlmIChjb3VudHNBc051bS50ZXN0KHR5cGVzW2pdKSkge1xuICAgICAgICAgICAgICBpZiAocG9zIDwgaikgb3JkZXIuc3BsaWNlKGF0LCAwLCBuZXcgQmlkaVNwYW4oMSwgcG9zLCBqKSk7XG4gICAgICAgICAgICAgIHZhciBuc3RhcnQgPSBqO1xuICAgICAgICAgICAgICBmb3IgKCsrajsgaiA8IGkgJiYgY291bnRzQXNOdW0udGVzdCh0eXBlc1tqXSk7ICsraikge31cbiAgICAgICAgICAgICAgb3JkZXIuc3BsaWNlKGF0LCAwLCBuZXcgQmlkaVNwYW4oMiwgbnN0YXJ0LCBqKSk7XG4gICAgICAgICAgICAgIHBvcyA9IGo7XG4gICAgICAgICAgICB9IGVsc2UgKytqO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAocG9zIDwgaSkgb3JkZXIuc3BsaWNlKGF0LCAwLCBuZXcgQmlkaVNwYW4oMSwgcG9zLCBpKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChvcmRlclswXS5sZXZlbCA9PSAxICYmIChtID0gc3RyLm1hdGNoKC9eXFxzKy8pKSkge1xuICAgICAgICBvcmRlclswXS5mcm9tID0gbVswXS5sZW5ndGg7XG4gICAgICAgIG9yZGVyLnVuc2hpZnQobmV3IEJpZGlTcGFuKDAsIDAsIG1bMF0ubGVuZ3RoKSk7XG4gICAgICB9XG4gICAgICBpZiAobHN0KG9yZGVyKS5sZXZlbCA9PSAxICYmIChtID0gc3RyLm1hdGNoKC9cXHMrJC8pKSkge1xuICAgICAgICBsc3Qob3JkZXIpLnRvIC09IG1bMF0ubGVuZ3RoO1xuICAgICAgICBvcmRlci5wdXNoKG5ldyBCaWRpU3BhbigwLCBsZW4gLSBtWzBdLmxlbmd0aCwgbGVuKSk7XG4gICAgICB9XG4gICAgICBpZiAob3JkZXJbMF0ubGV2ZWwgIT0gbHN0KG9yZGVyKS5sZXZlbClcbiAgICAgICAgb3JkZXIucHVzaChuZXcgQmlkaVNwYW4ob3JkZXJbMF0ubGV2ZWwsIGxlbiwgbGVuKSk7XG5cbiAgICAgIHJldHVybiBvcmRlcjtcbiAgICB9O1xuICB9KSgpO1xuXG4gIC8vIFRIRSBFTkRcblxuICBDb2RlTWlycm9yLnZlcnNpb24gPSBcIjQuMi4wXCI7XG5cbiAgcmV0dXJuIENvZGVNaXJyb3I7XG59KTtcbiIsIi8vIENvZGVNaXJyb3IsIGNvcHlyaWdodCAoYykgYnkgTWFyaWpuIEhhdmVyYmVrZSBhbmQgb3RoZXJzXG4vLyBEaXN0cmlidXRlZCB1bmRlciBhbiBNSVQgbGljZW5zZTogaHR0cDovL2NvZGVtaXJyb3IubmV0L0xJQ0VOU0VcblxuLy8gVE9ETyBhY3R1YWxseSByZWNvZ25pemUgc3ludGF4IG9mIFR5cGVTY3JpcHQgY29uc3RydWN0c1xuXG4oZnVuY3Rpb24obW9kKSB7XG4gIGlmICh0eXBlb2YgZXhwb3J0cyA9PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUgPT0gXCJvYmplY3RcIikgLy8gQ29tbW9uSlNcbiAgICBtb2QocmVxdWlyZShcIi4uLy4uL2xpYi9jb2RlbWlycm9yXCIpKTtcbiAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkgLy8gQU1EXG4gICAgZGVmaW5lKFtcIi4uLy4uL2xpYi9jb2RlbWlycm9yXCJdLCBtb2QpO1xuICBlbHNlIC8vIFBsYWluIGJyb3dzZXIgZW52XG4gICAgbW9kKENvZGVNaXJyb3IpO1xufSkoZnVuY3Rpb24oQ29kZU1pcnJvcikge1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbkNvZGVNaXJyb3IuZGVmaW5lTW9kZShcImphdmFzY3JpcHRcIiwgZnVuY3Rpb24oY29uZmlnLCBwYXJzZXJDb25maWcpIHtcbiAgdmFyIGluZGVudFVuaXQgPSBjb25maWcuaW5kZW50VW5pdDtcbiAgdmFyIHN0YXRlbWVudEluZGVudCA9IHBhcnNlckNvbmZpZy5zdGF0ZW1lbnRJbmRlbnQ7XG4gIHZhciBqc29ubGRNb2RlID0gcGFyc2VyQ29uZmlnLmpzb25sZDtcbiAgdmFyIGpzb25Nb2RlID0gcGFyc2VyQ29uZmlnLmpzb24gfHwganNvbmxkTW9kZTtcbiAgdmFyIGlzVFMgPSBwYXJzZXJDb25maWcudHlwZXNjcmlwdDtcblxuICAvLyBUb2tlbml6ZXJcblxuICB2YXIga2V5d29yZHMgPSBmdW5jdGlvbigpe1xuICAgIGZ1bmN0aW9uIGt3KHR5cGUpIHtyZXR1cm4ge3R5cGU6IHR5cGUsIHN0eWxlOiBcImtleXdvcmRcIn07fVxuICAgIHZhciBBID0ga3coXCJrZXl3b3JkIGFcIiksIEIgPSBrdyhcImtleXdvcmQgYlwiKSwgQyA9IGt3KFwia2V5d29yZCBjXCIpO1xuICAgIHZhciBvcGVyYXRvciA9IGt3KFwib3BlcmF0b3JcIiksIGF0b20gPSB7dHlwZTogXCJhdG9tXCIsIHN0eWxlOiBcImF0b21cIn07XG5cbiAgICB2YXIganNLZXl3b3JkcyA9IHtcbiAgICAgIFwiaWZcIjoga3coXCJpZlwiKSwgXCJ3aGlsZVwiOiBBLCBcIndpdGhcIjogQSwgXCJlbHNlXCI6IEIsIFwiZG9cIjogQiwgXCJ0cnlcIjogQiwgXCJmaW5hbGx5XCI6IEIsXG4gICAgICBcInJldHVyblwiOiBDLCBcImJyZWFrXCI6IEMsIFwiY29udGludWVcIjogQywgXCJuZXdcIjogQywgXCJkZWxldGVcIjogQywgXCJ0aHJvd1wiOiBDLCBcImRlYnVnZ2VyXCI6IEMsXG4gICAgICBcInZhclwiOiBrdyhcInZhclwiKSwgXCJjb25zdFwiOiBrdyhcInZhclwiKSwgXCJsZXRcIjoga3coXCJ2YXJcIiksXG4gICAgICBcImZ1bmN0aW9uXCI6IGt3KFwiZnVuY3Rpb25cIiksIFwiY2F0Y2hcIjoga3coXCJjYXRjaFwiKSxcbiAgICAgIFwiZm9yXCI6IGt3KFwiZm9yXCIpLCBcInN3aXRjaFwiOiBrdyhcInN3aXRjaFwiKSwgXCJjYXNlXCI6IGt3KFwiY2FzZVwiKSwgXCJkZWZhdWx0XCI6IGt3KFwiZGVmYXVsdFwiKSxcbiAgICAgIFwiaW5cIjogb3BlcmF0b3IsIFwidHlwZW9mXCI6IG9wZXJhdG9yLCBcImluc3RhbmNlb2ZcIjogb3BlcmF0b3IsXG4gICAgICBcInRydWVcIjogYXRvbSwgXCJmYWxzZVwiOiBhdG9tLCBcIm51bGxcIjogYXRvbSwgXCJ1bmRlZmluZWRcIjogYXRvbSwgXCJOYU5cIjogYXRvbSwgXCJJbmZpbml0eVwiOiBhdG9tLFxuICAgICAgXCJ0aGlzXCI6IGt3KFwidGhpc1wiKSwgXCJtb2R1bGVcIjoga3coXCJtb2R1bGVcIiksIFwiY2xhc3NcIjoga3coXCJjbGFzc1wiKSwgXCJzdXBlclwiOiBrdyhcImF0b21cIiksXG4gICAgICBcInlpZWxkXCI6IEMsIFwiZXhwb3J0XCI6IGt3KFwiZXhwb3J0XCIpLCBcImltcG9ydFwiOiBrdyhcImltcG9ydFwiKSwgXCJleHRlbmRzXCI6IENcbiAgICB9O1xuXG4gICAgLy8gRXh0ZW5kIHRoZSAnbm9ybWFsJyBrZXl3b3JkcyB3aXRoIHRoZSBUeXBlU2NyaXB0IGxhbmd1YWdlIGV4dGVuc2lvbnNcbiAgICBpZiAoaXNUUykge1xuICAgICAgdmFyIHR5cGUgPSB7dHlwZTogXCJ2YXJpYWJsZVwiLCBzdHlsZTogXCJ2YXJpYWJsZS0zXCJ9O1xuICAgICAgdmFyIHRzS2V5d29yZHMgPSB7XG4gICAgICAgIC8vIG9iamVjdC1saWtlIHRoaW5nc1xuICAgICAgICBcImludGVyZmFjZVwiOiBrdyhcImludGVyZmFjZVwiKSxcbiAgICAgICAgXCJleHRlbmRzXCI6IGt3KFwiZXh0ZW5kc1wiKSxcbiAgICAgICAgXCJjb25zdHJ1Y3RvclwiOiBrdyhcImNvbnN0cnVjdG9yXCIpLFxuXG4gICAgICAgIC8vIHNjb3BlIG1vZGlmaWVyc1xuICAgICAgICBcInB1YmxpY1wiOiBrdyhcInB1YmxpY1wiKSxcbiAgICAgICAgXCJwcml2YXRlXCI6IGt3KFwicHJpdmF0ZVwiKSxcbiAgICAgICAgXCJwcm90ZWN0ZWRcIjoga3coXCJwcm90ZWN0ZWRcIiksXG4gICAgICAgIFwic3RhdGljXCI6IGt3KFwic3RhdGljXCIpLFxuXG4gICAgICAgIC8vIHR5cGVzXG4gICAgICAgIFwic3RyaW5nXCI6IHR5cGUsIFwibnVtYmVyXCI6IHR5cGUsIFwiYm9vbFwiOiB0eXBlLCBcImFueVwiOiB0eXBlXG4gICAgICB9O1xuXG4gICAgICBmb3IgKHZhciBhdHRyIGluIHRzS2V5d29yZHMpIHtcbiAgICAgICAganNLZXl3b3Jkc1thdHRyXSA9IHRzS2V5d29yZHNbYXR0cl07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGpzS2V5d29yZHM7XG4gIH0oKTtcblxuICB2YXIgaXNPcGVyYXRvckNoYXIgPSAvWytcXC0qJiU9PD4hP3x+Xl0vO1xuICB2YXIgaXNKc29ubGRLZXl3b3JkID0gL15AKGNvbnRleHR8aWR8dmFsdWV8bGFuZ3VhZ2V8dHlwZXxjb250YWluZXJ8bGlzdHxzZXR8cmV2ZXJzZXxpbmRleHxiYXNlfHZvY2FifGdyYXBoKVwiLztcblxuICBmdW5jdGlvbiByZWFkUmVnZXhwKHN0cmVhbSkge1xuICAgIHZhciBlc2NhcGVkID0gZmFsc2UsIG5leHQsIGluU2V0ID0gZmFsc2U7XG4gICAgd2hpbGUgKChuZXh0ID0gc3RyZWFtLm5leHQoKSkgIT0gbnVsbCkge1xuICAgICAgaWYgKCFlc2NhcGVkKSB7XG4gICAgICAgIGlmIChuZXh0ID09IFwiL1wiICYmICFpblNldCkgcmV0dXJuO1xuICAgICAgICBpZiAobmV4dCA9PSBcIltcIikgaW5TZXQgPSB0cnVlO1xuICAgICAgICBlbHNlIGlmIChpblNldCAmJiBuZXh0ID09IFwiXVwiKSBpblNldCA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgZXNjYXBlZCA9ICFlc2NhcGVkICYmIG5leHQgPT0gXCJcXFxcXCI7XG4gICAgfVxuICB9XG5cbiAgLy8gVXNlZCBhcyBzY3JhdGNoIHZhcmlhYmxlcyB0byBjb21tdW5pY2F0ZSBtdWx0aXBsZSB2YWx1ZXMgd2l0aG91dFxuICAvLyBjb25zaW5nIHVwIHRvbnMgb2Ygb2JqZWN0cy5cbiAgdmFyIHR5cGUsIGNvbnRlbnQ7XG4gIGZ1bmN0aW9uIHJldCh0cCwgc3R5bGUsIGNvbnQpIHtcbiAgICB0eXBlID0gdHA7IGNvbnRlbnQgPSBjb250O1xuICAgIHJldHVybiBzdHlsZTtcbiAgfVxuICBmdW5jdGlvbiB0b2tlbkJhc2Uoc3RyZWFtLCBzdGF0ZSkge1xuICAgIHZhciBjaCA9IHN0cmVhbS5uZXh0KCk7XG4gICAgaWYgKGNoID09ICdcIicgfHwgY2ggPT0gXCInXCIpIHtcbiAgICAgIHN0YXRlLnRva2VuaXplID0gdG9rZW5TdHJpbmcoY2gpO1xuICAgICAgcmV0dXJuIHN0YXRlLnRva2VuaXplKHN0cmVhbSwgc3RhdGUpO1xuICAgIH0gZWxzZSBpZiAoY2ggPT0gXCIuXCIgJiYgc3RyZWFtLm1hdGNoKC9eXFxkKyg/OltlRV1bK1xcLV0/XFxkKyk/LykpIHtcbiAgICAgIHJldHVybiByZXQoXCJudW1iZXJcIiwgXCJudW1iZXJcIik7XG4gICAgfSBlbHNlIGlmIChjaCA9PSBcIi5cIiAmJiBzdHJlYW0ubWF0Y2goXCIuLlwiKSkge1xuICAgICAgcmV0dXJuIHJldChcInNwcmVhZFwiLCBcIm1ldGFcIik7XG4gICAgfSBlbHNlIGlmICgvW1xcW1xcXXt9XFwoXFwpLDtcXDpcXC5dLy50ZXN0KGNoKSkge1xuICAgICAgcmV0dXJuIHJldChjaCk7XG4gICAgfSBlbHNlIGlmIChjaCA9PSBcIj1cIiAmJiBzdHJlYW0uZWF0KFwiPlwiKSkge1xuICAgICAgcmV0dXJuIHJldChcIj0+XCIsIFwib3BlcmF0b3JcIik7XG4gICAgfSBlbHNlIGlmIChjaCA9PSBcIjBcIiAmJiBzdHJlYW0uZWF0KC94L2kpKSB7XG4gICAgICBzdHJlYW0uZWF0V2hpbGUoL1tcXGRhLWZdL2kpO1xuICAgICAgcmV0dXJuIHJldChcIm51bWJlclwiLCBcIm51bWJlclwiKTtcbiAgICB9IGVsc2UgaWYgKC9cXGQvLnRlc3QoY2gpKSB7XG4gICAgICBzdHJlYW0ubWF0Y2goL15cXGQqKD86XFwuXFxkKik/KD86W2VFXVsrXFwtXT9cXGQrKT8vKTtcbiAgICAgIHJldHVybiByZXQoXCJudW1iZXJcIiwgXCJudW1iZXJcIik7XG4gICAgfSBlbHNlIGlmIChjaCA9PSBcIi9cIikge1xuICAgICAgaWYgKHN0cmVhbS5lYXQoXCIqXCIpKSB7XG4gICAgICAgIHN0YXRlLnRva2VuaXplID0gdG9rZW5Db21tZW50O1xuICAgICAgICByZXR1cm4gdG9rZW5Db21tZW50KHN0cmVhbSwgc3RhdGUpO1xuICAgICAgfSBlbHNlIGlmIChzdHJlYW0uZWF0KFwiL1wiKSkge1xuICAgICAgICBzdHJlYW0uc2tpcFRvRW5kKCk7XG4gICAgICAgIHJldHVybiByZXQoXCJjb21tZW50XCIsIFwiY29tbWVudFwiKTtcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUubGFzdFR5cGUgPT0gXCJvcGVyYXRvclwiIHx8IHN0YXRlLmxhc3RUeXBlID09IFwia2V5d29yZCBjXCIgfHxcbiAgICAgICAgICAgICAgIHN0YXRlLmxhc3RUeXBlID09IFwic29mXCIgfHwgL15bXFxbe31cXCgsOzpdJC8udGVzdChzdGF0ZS5sYXN0VHlwZSkpIHtcbiAgICAgICAgcmVhZFJlZ2V4cChzdHJlYW0pO1xuICAgICAgICBzdHJlYW0uZWF0V2hpbGUoL1tnaW15XS8pOyAvLyAneScgaXMgXCJzdGlja3lcIiBvcHRpb24gaW4gTW96aWxsYVxuICAgICAgICByZXR1cm4gcmV0KFwicmVnZXhwXCIsIFwic3RyaW5nLTJcIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHJlYW0uZWF0V2hpbGUoaXNPcGVyYXRvckNoYXIpO1xuICAgICAgICByZXR1cm4gcmV0KFwib3BlcmF0b3JcIiwgXCJvcGVyYXRvclwiLCBzdHJlYW0uY3VycmVudCgpKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGNoID09IFwiYFwiKSB7XG4gICAgICBzdGF0ZS50b2tlbml6ZSA9IHRva2VuUXVhc2k7XG4gICAgICByZXR1cm4gdG9rZW5RdWFzaShzdHJlYW0sIHN0YXRlKTtcbiAgICB9IGVsc2UgaWYgKGNoID09IFwiI1wiKSB7XG4gICAgICBzdHJlYW0uc2tpcFRvRW5kKCk7XG4gICAgICByZXR1cm4gcmV0KFwiZXJyb3JcIiwgXCJlcnJvclwiKTtcbiAgICB9IGVsc2UgaWYgKGlzT3BlcmF0b3JDaGFyLnRlc3QoY2gpKSB7XG4gICAgICBzdHJlYW0uZWF0V2hpbGUoaXNPcGVyYXRvckNoYXIpO1xuICAgICAgcmV0dXJuIHJldChcIm9wZXJhdG9yXCIsIFwib3BlcmF0b3JcIiwgc3RyZWFtLmN1cnJlbnQoKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0cmVhbS5lYXRXaGlsZSgvW1xcd1xcJF9dLyk7XG4gICAgICB2YXIgd29yZCA9IHN0cmVhbS5jdXJyZW50KCksIGtub3duID0ga2V5d29yZHMucHJvcGVydHlJc0VudW1lcmFibGUod29yZCkgJiYga2V5d29yZHNbd29yZF07XG4gICAgICByZXR1cm4gKGtub3duICYmIHN0YXRlLmxhc3RUeXBlICE9IFwiLlwiKSA/IHJldChrbm93bi50eXBlLCBrbm93bi5zdHlsZSwgd29yZCkgOlxuICAgICAgICAgICAgICAgICAgICAgcmV0KFwidmFyaWFibGVcIiwgXCJ2YXJpYWJsZVwiLCB3b3JkKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB0b2tlblN0cmluZyhxdW90ZSkge1xuICAgIHJldHVybiBmdW5jdGlvbihzdHJlYW0sIHN0YXRlKSB7XG4gICAgICB2YXIgZXNjYXBlZCA9IGZhbHNlLCBuZXh0O1xuICAgICAgaWYgKGpzb25sZE1vZGUgJiYgc3RyZWFtLnBlZWsoKSA9PSBcIkBcIiAmJiBzdHJlYW0ubWF0Y2goaXNKc29ubGRLZXl3b3JkKSl7XG4gICAgICAgIHN0YXRlLnRva2VuaXplID0gdG9rZW5CYXNlO1xuICAgICAgICByZXR1cm4gcmV0KFwianNvbmxkLWtleXdvcmRcIiwgXCJtZXRhXCIpO1xuICAgICAgfVxuICAgICAgd2hpbGUgKChuZXh0ID0gc3RyZWFtLm5leHQoKSkgIT0gbnVsbCkge1xuICAgICAgICBpZiAobmV4dCA9PSBxdW90ZSAmJiAhZXNjYXBlZCkgYnJlYWs7XG4gICAgICAgIGVzY2FwZWQgPSAhZXNjYXBlZCAmJiBuZXh0ID09IFwiXFxcXFwiO1xuICAgICAgfVxuICAgICAgaWYgKCFlc2NhcGVkKSBzdGF0ZS50b2tlbml6ZSA9IHRva2VuQmFzZTtcbiAgICAgIHJldHVybiByZXQoXCJzdHJpbmdcIiwgXCJzdHJpbmdcIik7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRva2VuQ29tbWVudChzdHJlYW0sIHN0YXRlKSB7XG4gICAgdmFyIG1heWJlRW5kID0gZmFsc2UsIGNoO1xuICAgIHdoaWxlIChjaCA9IHN0cmVhbS5uZXh0KCkpIHtcbiAgICAgIGlmIChjaCA9PSBcIi9cIiAmJiBtYXliZUVuZCkge1xuICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IHRva2VuQmFzZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBtYXliZUVuZCA9IChjaCA9PSBcIipcIik7XG4gICAgfVxuICAgIHJldHVybiByZXQoXCJjb21tZW50XCIsIFwiY29tbWVudFwiKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRva2VuUXVhc2koc3RyZWFtLCBzdGF0ZSkge1xuICAgIHZhciBlc2NhcGVkID0gZmFsc2UsIG5leHQ7XG4gICAgd2hpbGUgKChuZXh0ID0gc3RyZWFtLm5leHQoKSkgIT0gbnVsbCkge1xuICAgICAgaWYgKCFlc2NhcGVkICYmIChuZXh0ID09IFwiYFwiIHx8IG5leHQgPT0gXCIkXCIgJiYgc3RyZWFtLmVhdChcIntcIikpKSB7XG4gICAgICAgIHN0YXRlLnRva2VuaXplID0gdG9rZW5CYXNlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGVzY2FwZWQgPSAhZXNjYXBlZCAmJiBuZXh0ID09IFwiXFxcXFwiO1xuICAgIH1cbiAgICByZXR1cm4gcmV0KFwicXVhc2lcIiwgXCJzdHJpbmctMlwiLCBzdHJlYW0uY3VycmVudCgpKTtcbiAgfVxuXG4gIHZhciBicmFja2V0cyA9IFwiKFt7fV0pXCI7XG4gIC8vIFRoaXMgaXMgYSBjcnVkZSBsb29rYWhlYWQgdHJpY2sgdG8gdHJ5IGFuZCBub3RpY2UgdGhhdCB3ZSdyZVxuICAvLyBwYXJzaW5nIHRoZSBhcmd1bWVudCBwYXR0ZXJucyBmb3IgYSBmYXQtYXJyb3cgZnVuY3Rpb24gYmVmb3JlIHdlXG4gIC8vIGFjdHVhbGx5IGhpdCB0aGUgYXJyb3cgdG9rZW4uIEl0IG9ubHkgd29ya3MgaWYgdGhlIGFycm93IGlzIG9uXG4gIC8vIHRoZSBzYW1lIGxpbmUgYXMgdGhlIGFyZ3VtZW50cyBhbmQgdGhlcmUncyBubyBzdHJhbmdlIG5vaXNlXG4gIC8vIChjb21tZW50cykgaW4gYmV0d2Vlbi4gRmFsbGJhY2sgaXMgdG8gb25seSBub3RpY2Ugd2hlbiB3ZSBoaXQgdGhlXG4gIC8vIGFycm93LCBhbmQgbm90IGRlY2xhcmUgdGhlIGFyZ3VtZW50cyBhcyBsb2NhbHMgZm9yIHRoZSBhcnJvd1xuICAvLyBib2R5LlxuICBmdW5jdGlvbiBmaW5kRmF0QXJyb3coc3RyZWFtLCBzdGF0ZSkge1xuICAgIGlmIChzdGF0ZS5mYXRBcnJvd0F0KSBzdGF0ZS5mYXRBcnJvd0F0ID0gbnVsbDtcbiAgICB2YXIgYXJyb3cgPSBzdHJlYW0uc3RyaW5nLmluZGV4T2YoXCI9PlwiLCBzdHJlYW0uc3RhcnQpO1xuICAgIGlmIChhcnJvdyA8IDApIHJldHVybjtcblxuICAgIHZhciBkZXB0aCA9IDAsIHNhd1NvbWV0aGluZyA9IGZhbHNlO1xuICAgIGZvciAodmFyIHBvcyA9IGFycm93IC0gMTsgcG9zID49IDA7IC0tcG9zKSB7XG4gICAgICB2YXIgY2ggPSBzdHJlYW0uc3RyaW5nLmNoYXJBdChwb3MpO1xuICAgICAgdmFyIGJyYWNrZXQgPSBicmFja2V0cy5pbmRleE9mKGNoKTtcbiAgICAgIGlmIChicmFja2V0ID49IDAgJiYgYnJhY2tldCA8IDMpIHtcbiAgICAgICAgaWYgKCFkZXB0aCkgeyArK3BvczsgYnJlYWs7IH1cbiAgICAgICAgaWYgKC0tZGVwdGggPT0gMCkgYnJlYWs7XG4gICAgICB9IGVsc2UgaWYgKGJyYWNrZXQgPj0gMyAmJiBicmFja2V0IDwgNikge1xuICAgICAgICArK2RlcHRoO1xuICAgICAgfSBlbHNlIGlmICgvWyRcXHddLy50ZXN0KGNoKSkge1xuICAgICAgICBzYXdTb21ldGhpbmcgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChzYXdTb21ldGhpbmcgJiYgIWRlcHRoKSB7XG4gICAgICAgICsrcG9zO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHNhd1NvbWV0aGluZyAmJiAhZGVwdGgpIHN0YXRlLmZhdEFycm93QXQgPSBwb3M7XG4gIH1cblxuICAvLyBQYXJzZXJcblxuICB2YXIgYXRvbWljVHlwZXMgPSB7XCJhdG9tXCI6IHRydWUsIFwibnVtYmVyXCI6IHRydWUsIFwidmFyaWFibGVcIjogdHJ1ZSwgXCJzdHJpbmdcIjogdHJ1ZSwgXCJyZWdleHBcIjogdHJ1ZSwgXCJ0aGlzXCI6IHRydWUsIFwianNvbmxkLWtleXdvcmRcIjogdHJ1ZX07XG5cbiAgZnVuY3Rpb24gSlNMZXhpY2FsKGluZGVudGVkLCBjb2x1bW4sIHR5cGUsIGFsaWduLCBwcmV2LCBpbmZvKSB7XG4gICAgdGhpcy5pbmRlbnRlZCA9IGluZGVudGVkO1xuICAgIHRoaXMuY29sdW1uID0gY29sdW1uO1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5wcmV2ID0gcHJldjtcbiAgICB0aGlzLmluZm8gPSBpbmZvO1xuICAgIGlmIChhbGlnbiAhPSBudWxsKSB0aGlzLmFsaWduID0gYWxpZ247XG4gIH1cblxuICBmdW5jdGlvbiBpblNjb3BlKHN0YXRlLCB2YXJuYW1lKSB7XG4gICAgZm9yICh2YXIgdiA9IHN0YXRlLmxvY2FsVmFyczsgdjsgdiA9IHYubmV4dClcbiAgICAgIGlmICh2Lm5hbWUgPT0gdmFybmFtZSkgcmV0dXJuIHRydWU7XG4gICAgZm9yICh2YXIgY3ggPSBzdGF0ZS5jb250ZXh0OyBjeDsgY3ggPSBjeC5wcmV2KSB7XG4gICAgICBmb3IgKHZhciB2ID0gY3gudmFyczsgdjsgdiA9IHYubmV4dClcbiAgICAgICAgaWYgKHYubmFtZSA9PSB2YXJuYW1lKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUpTKHN0YXRlLCBzdHlsZSwgdHlwZSwgY29udGVudCwgc3RyZWFtKSB7XG4gICAgdmFyIGNjID0gc3RhdGUuY2M7XG4gICAgLy8gQ29tbXVuaWNhdGUgb3VyIGNvbnRleHQgdG8gdGhlIGNvbWJpbmF0b3JzLlxuICAgIC8vIChMZXNzIHdhc3RlZnVsIHRoYW4gY29uc2luZyB1cCBhIGh1bmRyZWQgY2xvc3VyZXMgb24gZXZlcnkgY2FsbC4pXG4gICAgY3guc3RhdGUgPSBzdGF0ZTsgY3guc3RyZWFtID0gc3RyZWFtOyBjeC5tYXJrZWQgPSBudWxsLCBjeC5jYyA9IGNjO1xuXG4gICAgaWYgKCFzdGF0ZS5sZXhpY2FsLmhhc093blByb3BlcnR5KFwiYWxpZ25cIikpXG4gICAgICBzdGF0ZS5sZXhpY2FsLmFsaWduID0gdHJ1ZTtcblxuICAgIHdoaWxlKHRydWUpIHtcbiAgICAgIHZhciBjb21iaW5hdG9yID0gY2MubGVuZ3RoID8gY2MucG9wKCkgOiBqc29uTW9kZSA/IGV4cHJlc3Npb24gOiBzdGF0ZW1lbnQ7XG4gICAgICBpZiAoY29tYmluYXRvcih0eXBlLCBjb250ZW50KSkge1xuICAgICAgICB3aGlsZShjYy5sZW5ndGggJiYgY2NbY2MubGVuZ3RoIC0gMV0ubGV4KVxuICAgICAgICAgIGNjLnBvcCgpKCk7XG4gICAgICAgIGlmIChjeC5tYXJrZWQpIHJldHVybiBjeC5tYXJrZWQ7XG4gICAgICAgIGlmICh0eXBlID09IFwidmFyaWFibGVcIiAmJiBpblNjb3BlKHN0YXRlLCBjb250ZW50KSkgcmV0dXJuIFwidmFyaWFibGUtMlwiO1xuICAgICAgICByZXR1cm4gc3R5bGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gQ29tYmluYXRvciB1dGlsc1xuXG4gIHZhciBjeCA9IHtzdGF0ZTogbnVsbCwgY29sdW1uOiBudWxsLCBtYXJrZWQ6IG51bGwsIGNjOiBudWxsfTtcbiAgZnVuY3Rpb24gcGFzcygpIHtcbiAgICBmb3IgKHZhciBpID0gYXJndW1lbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBjeC5jYy5wdXNoKGFyZ3VtZW50c1tpXSk7XG4gIH1cbiAgZnVuY3Rpb24gY29udCgpIHtcbiAgICBwYXNzLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgZnVuY3Rpb24gcmVnaXN0ZXIodmFybmFtZSkge1xuICAgIGZ1bmN0aW9uIGluTGlzdChsaXN0KSB7XG4gICAgICBmb3IgKHZhciB2ID0gbGlzdDsgdjsgdiA9IHYubmV4dClcbiAgICAgICAgaWYgKHYubmFtZSA9PSB2YXJuYW1lKSByZXR1cm4gdHJ1ZTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIHN0YXRlID0gY3guc3RhdGU7XG4gICAgaWYgKHN0YXRlLmNvbnRleHQpIHtcbiAgICAgIGN4Lm1hcmtlZCA9IFwiZGVmXCI7XG4gICAgICBpZiAoaW5MaXN0KHN0YXRlLmxvY2FsVmFycykpIHJldHVybjtcbiAgICAgIHN0YXRlLmxvY2FsVmFycyA9IHtuYW1lOiB2YXJuYW1lLCBuZXh0OiBzdGF0ZS5sb2NhbFZhcnN9O1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaW5MaXN0KHN0YXRlLmdsb2JhbFZhcnMpKSByZXR1cm47XG4gICAgICBpZiAocGFyc2VyQ29uZmlnLmdsb2JhbFZhcnMpXG4gICAgICAgIHN0YXRlLmdsb2JhbFZhcnMgPSB7bmFtZTogdmFybmFtZSwgbmV4dDogc3RhdGUuZ2xvYmFsVmFyc307XG4gICAgfVxuICB9XG5cbiAgLy8gQ29tYmluYXRvcnNcblxuICB2YXIgZGVmYXVsdFZhcnMgPSB7bmFtZTogXCJ0aGlzXCIsIG5leHQ6IHtuYW1lOiBcImFyZ3VtZW50c1wifX07XG4gIGZ1bmN0aW9uIHB1c2hjb250ZXh0KCkge1xuICAgIGN4LnN0YXRlLmNvbnRleHQgPSB7cHJldjogY3guc3RhdGUuY29udGV4dCwgdmFyczogY3guc3RhdGUubG9jYWxWYXJzfTtcbiAgICBjeC5zdGF0ZS5sb2NhbFZhcnMgPSBkZWZhdWx0VmFycztcbiAgfVxuICBmdW5jdGlvbiBwb3Bjb250ZXh0KCkge1xuICAgIGN4LnN0YXRlLmxvY2FsVmFycyA9IGN4LnN0YXRlLmNvbnRleHQudmFycztcbiAgICBjeC5zdGF0ZS5jb250ZXh0ID0gY3guc3RhdGUuY29udGV4dC5wcmV2O1xuICB9XG4gIGZ1bmN0aW9uIHB1c2hsZXgodHlwZSwgaW5mbykge1xuICAgIHZhciByZXN1bHQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzdGF0ZSA9IGN4LnN0YXRlLCBpbmRlbnQgPSBzdGF0ZS5pbmRlbnRlZDtcbiAgICAgIGlmIChzdGF0ZS5sZXhpY2FsLnR5cGUgPT0gXCJzdGF0XCIpIGluZGVudCA9IHN0YXRlLmxleGljYWwuaW5kZW50ZWQ7XG4gICAgICBzdGF0ZS5sZXhpY2FsID0gbmV3IEpTTGV4aWNhbChpbmRlbnQsIGN4LnN0cmVhbS5jb2x1bW4oKSwgdHlwZSwgbnVsbCwgc3RhdGUubGV4aWNhbCwgaW5mbyk7XG4gICAgfTtcbiAgICByZXN1bHQubGV4ID0gdHJ1ZTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIGZ1bmN0aW9uIHBvcGxleCgpIHtcbiAgICB2YXIgc3RhdGUgPSBjeC5zdGF0ZTtcbiAgICBpZiAoc3RhdGUubGV4aWNhbC5wcmV2KSB7XG4gICAgICBpZiAoc3RhdGUubGV4aWNhbC50eXBlID09IFwiKVwiKVxuICAgICAgICBzdGF0ZS5pbmRlbnRlZCA9IHN0YXRlLmxleGljYWwuaW5kZW50ZWQ7XG4gICAgICBzdGF0ZS5sZXhpY2FsID0gc3RhdGUubGV4aWNhbC5wcmV2O1xuICAgIH1cbiAgfVxuICBwb3BsZXgubGV4ID0gdHJ1ZTtcblxuICBmdW5jdGlvbiBleHBlY3Qod2FudGVkKSB7XG4gICAgZnVuY3Rpb24gZXhwKHR5cGUpIHtcbiAgICAgIGlmICh0eXBlID09IHdhbnRlZCkgcmV0dXJuIGNvbnQoKTtcbiAgICAgIGVsc2UgaWYgKHdhbnRlZCA9PSBcIjtcIikgcmV0dXJuIHBhc3MoKTtcbiAgICAgIGVsc2UgcmV0dXJuIGNvbnQoZXhwKTtcbiAgICB9O1xuICAgIHJldHVybiBleHA7XG4gIH1cblxuICBmdW5jdGlvbiBzdGF0ZW1lbnQodHlwZSwgdmFsdWUpIHtcbiAgICBpZiAodHlwZSA9PSBcInZhclwiKSByZXR1cm4gY29udChwdXNobGV4KFwidmFyZGVmXCIsIHZhbHVlLmxlbmd0aCksIHZhcmRlZiwgZXhwZWN0KFwiO1wiKSwgcG9wbGV4KTtcbiAgICBpZiAodHlwZSA9PSBcImtleXdvcmQgYVwiKSByZXR1cm4gY29udChwdXNobGV4KFwiZm9ybVwiKSwgZXhwcmVzc2lvbiwgc3RhdGVtZW50LCBwb3BsZXgpO1xuICAgIGlmICh0eXBlID09IFwia2V5d29yZCBiXCIpIHJldHVybiBjb250KHB1c2hsZXgoXCJmb3JtXCIpLCBzdGF0ZW1lbnQsIHBvcGxleCk7XG4gICAgaWYgKHR5cGUgPT0gXCJ7XCIpIHJldHVybiBjb250KHB1c2hsZXgoXCJ9XCIpLCBibG9jaywgcG9wbGV4KTtcbiAgICBpZiAodHlwZSA9PSBcIjtcIikgcmV0dXJuIGNvbnQoKTtcbiAgICBpZiAodHlwZSA9PSBcImlmXCIpIHtcbiAgICAgIGlmIChjeC5zdGF0ZS5sZXhpY2FsLmluZm8gPT0gXCJlbHNlXCIgJiYgY3guc3RhdGUuY2NbY3guc3RhdGUuY2MubGVuZ3RoIC0gMV0gPT0gcG9wbGV4KVxuICAgICAgICBjeC5zdGF0ZS5jYy5wb3AoKSgpO1xuICAgICAgcmV0dXJuIGNvbnQocHVzaGxleChcImZvcm1cIiksIGV4cHJlc3Npb24sIHN0YXRlbWVudCwgcG9wbGV4LCBtYXliZWVsc2UpO1xuICAgIH1cbiAgICBpZiAodHlwZSA9PSBcImZ1bmN0aW9uXCIpIHJldHVybiBjb250KGZ1bmN0aW9uZGVmKTtcbiAgICBpZiAodHlwZSA9PSBcImZvclwiKSByZXR1cm4gY29udChwdXNobGV4KFwiZm9ybVwiKSwgZm9yc3BlYywgc3RhdGVtZW50LCBwb3BsZXgpO1xuICAgIGlmICh0eXBlID09IFwidmFyaWFibGVcIikgcmV0dXJuIGNvbnQocHVzaGxleChcInN0YXRcIiksIG1heWJlbGFiZWwpO1xuICAgIGlmICh0eXBlID09IFwic3dpdGNoXCIpIHJldHVybiBjb250KHB1c2hsZXgoXCJmb3JtXCIpLCBleHByZXNzaW9uLCBwdXNobGV4KFwifVwiLCBcInN3aXRjaFwiKSwgZXhwZWN0KFwie1wiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2ssIHBvcGxleCwgcG9wbGV4KTtcbiAgICBpZiAodHlwZSA9PSBcImNhc2VcIikgcmV0dXJuIGNvbnQoZXhwcmVzc2lvbiwgZXhwZWN0KFwiOlwiKSk7XG4gICAgaWYgKHR5cGUgPT0gXCJkZWZhdWx0XCIpIHJldHVybiBjb250KGV4cGVjdChcIjpcIikpO1xuICAgIGlmICh0eXBlID09IFwiY2F0Y2hcIikgcmV0dXJuIGNvbnQocHVzaGxleChcImZvcm1cIiksIHB1c2hjb250ZXh0LCBleHBlY3QoXCIoXCIpLCBmdW5hcmcsIGV4cGVjdChcIilcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVtZW50LCBwb3BsZXgsIHBvcGNvbnRleHQpO1xuICAgIGlmICh0eXBlID09IFwibW9kdWxlXCIpIHJldHVybiBjb250KHB1c2hsZXgoXCJmb3JtXCIpLCBwdXNoY29udGV4dCwgYWZ0ZXJNb2R1bGUsIHBvcGNvbnRleHQsIHBvcGxleCk7XG4gICAgaWYgKHR5cGUgPT0gXCJjbGFzc1wiKSByZXR1cm4gY29udChwdXNobGV4KFwiZm9ybVwiKSwgY2xhc3NOYW1lLCBvYmpsaXQsIHBvcGxleCk7XG4gICAgaWYgKHR5cGUgPT0gXCJleHBvcnRcIikgcmV0dXJuIGNvbnQocHVzaGxleChcImZvcm1cIiksIGFmdGVyRXhwb3J0LCBwb3BsZXgpO1xuICAgIGlmICh0eXBlID09IFwiaW1wb3J0XCIpIHJldHVybiBjb250KHB1c2hsZXgoXCJmb3JtXCIpLCBhZnRlckltcG9ydCwgcG9wbGV4KTtcbiAgICByZXR1cm4gcGFzcyhwdXNobGV4KFwic3RhdFwiKSwgZXhwcmVzc2lvbiwgZXhwZWN0KFwiO1wiKSwgcG9wbGV4KTtcbiAgfVxuICBmdW5jdGlvbiBleHByZXNzaW9uKHR5cGUpIHtcbiAgICByZXR1cm4gZXhwcmVzc2lvbklubmVyKHR5cGUsIGZhbHNlKTtcbiAgfVxuICBmdW5jdGlvbiBleHByZXNzaW9uTm9Db21tYSh0eXBlKSB7XG4gICAgcmV0dXJuIGV4cHJlc3Npb25Jbm5lcih0eXBlLCB0cnVlKTtcbiAgfVxuICBmdW5jdGlvbiBleHByZXNzaW9uSW5uZXIodHlwZSwgbm9Db21tYSkge1xuICAgIGlmIChjeC5zdGF0ZS5mYXRBcnJvd0F0ID09IGN4LnN0cmVhbS5zdGFydCkge1xuICAgICAgdmFyIGJvZHkgPSBub0NvbW1hID8gYXJyb3dCb2R5Tm9Db21tYSA6IGFycm93Qm9keTtcbiAgICAgIGlmICh0eXBlID09IFwiKFwiKSByZXR1cm4gY29udChwdXNoY29udGV4dCwgcHVzaGxleChcIilcIiksIGNvbW1hc2VwKHBhdHRlcm4sIFwiKVwiKSwgcG9wbGV4LCBleHBlY3QoXCI9PlwiKSwgYm9keSwgcG9wY29udGV4dCk7XG4gICAgICBlbHNlIGlmICh0eXBlID09IFwidmFyaWFibGVcIikgcmV0dXJuIHBhc3MocHVzaGNvbnRleHQsIHBhdHRlcm4sIGV4cGVjdChcIj0+XCIpLCBib2R5LCBwb3Bjb250ZXh0KTtcbiAgICB9XG5cbiAgICB2YXIgbWF5YmVvcCA9IG5vQ29tbWEgPyBtYXliZW9wZXJhdG9yTm9Db21tYSA6IG1heWJlb3BlcmF0b3JDb21tYTtcbiAgICBpZiAoYXRvbWljVHlwZXMuaGFzT3duUHJvcGVydHkodHlwZSkpIHJldHVybiBjb250KG1heWJlb3ApO1xuICAgIGlmICh0eXBlID09IFwiZnVuY3Rpb25cIikgcmV0dXJuIGNvbnQoZnVuY3Rpb25kZWYsIG1heWJlb3ApO1xuICAgIGlmICh0eXBlID09IFwia2V5d29yZCBjXCIpIHJldHVybiBjb250KG5vQ29tbWEgPyBtYXliZWV4cHJlc3Npb25Ob0NvbW1hIDogbWF5YmVleHByZXNzaW9uKTtcbiAgICBpZiAodHlwZSA9PSBcIihcIikgcmV0dXJuIGNvbnQocHVzaGxleChcIilcIiksIG1heWJlZXhwcmVzc2lvbiwgY29tcHJlaGVuc2lvbiwgZXhwZWN0KFwiKVwiKSwgcG9wbGV4LCBtYXliZW9wKTtcbiAgICBpZiAodHlwZSA9PSBcIm9wZXJhdG9yXCIgfHwgdHlwZSA9PSBcInNwcmVhZFwiKSByZXR1cm4gY29udChub0NvbW1hID8gZXhwcmVzc2lvbk5vQ29tbWEgOiBleHByZXNzaW9uKTtcbiAgICBpZiAodHlwZSA9PSBcIltcIikgcmV0dXJuIGNvbnQocHVzaGxleChcIl1cIiksIGFycmF5TGl0ZXJhbCwgcG9wbGV4LCBtYXliZW9wKTtcbiAgICBpZiAodHlwZSA9PSBcIntcIikgcmV0dXJuIGNvbnRDb21tYXNlcChvYmpwcm9wLCBcIn1cIiwgbnVsbCwgbWF5YmVvcCk7XG4gICAgaWYgKHR5cGUgPT0gXCJxdWFzaVwiKSB7IHJldHVybiBwYXNzKHF1YXNpLCBtYXliZW9wKTsgfVxuICAgIHJldHVybiBjb250KCk7XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVleHByZXNzaW9uKHR5cGUpIHtcbiAgICBpZiAodHlwZS5tYXRjaCgvWztcXH1cXClcXF0sXS8pKSByZXR1cm4gcGFzcygpO1xuICAgIHJldHVybiBwYXNzKGV4cHJlc3Npb24pO1xuICB9XG4gIGZ1bmN0aW9uIG1heWJlZXhwcmVzc2lvbk5vQ29tbWEodHlwZSkge1xuICAgIGlmICh0eXBlLm1hdGNoKC9bO1xcfVxcKVxcXSxdLykpIHJldHVybiBwYXNzKCk7XG4gICAgcmV0dXJuIHBhc3MoZXhwcmVzc2lvbk5vQ29tbWEpO1xuICB9XG5cbiAgZnVuY3Rpb24gbWF5YmVvcGVyYXRvckNvbW1hKHR5cGUsIHZhbHVlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCIsXCIpIHJldHVybiBjb250KGV4cHJlc3Npb24pO1xuICAgIHJldHVybiBtYXliZW9wZXJhdG9yTm9Db21tYSh0eXBlLCB2YWx1ZSwgZmFsc2UpO1xuICB9XG4gIGZ1bmN0aW9uIG1heWJlb3BlcmF0b3JOb0NvbW1hKHR5cGUsIHZhbHVlLCBub0NvbW1hKSB7XG4gICAgdmFyIG1lID0gbm9Db21tYSA9PSBmYWxzZSA/IG1heWJlb3BlcmF0b3JDb21tYSA6IG1heWJlb3BlcmF0b3JOb0NvbW1hO1xuICAgIHZhciBleHByID0gbm9Db21tYSA9PSBmYWxzZSA/IGV4cHJlc3Npb24gOiBleHByZXNzaW9uTm9Db21tYTtcbiAgICBpZiAodmFsdWUgPT0gXCI9PlwiKSByZXR1cm4gY29udChwdXNoY29udGV4dCwgbm9Db21tYSA/IGFycm93Qm9keU5vQ29tbWEgOiBhcnJvd0JvZHksIHBvcGNvbnRleHQpO1xuICAgIGlmICh0eXBlID09IFwib3BlcmF0b3JcIikge1xuICAgICAgaWYgKC9cXCtcXCt8LS0vLnRlc3QodmFsdWUpKSByZXR1cm4gY29udChtZSk7XG4gICAgICBpZiAodmFsdWUgPT0gXCI/XCIpIHJldHVybiBjb250KGV4cHJlc3Npb24sIGV4cGVjdChcIjpcIiksIGV4cHIpO1xuICAgICAgcmV0dXJuIGNvbnQoZXhwcik7XG4gICAgfVxuICAgIGlmICh0eXBlID09IFwicXVhc2lcIikgeyByZXR1cm4gcGFzcyhxdWFzaSwgbWUpOyB9XG4gICAgaWYgKHR5cGUgPT0gXCI7XCIpIHJldHVybjtcbiAgICBpZiAodHlwZSA9PSBcIihcIikgcmV0dXJuIGNvbnRDb21tYXNlcChleHByZXNzaW9uTm9Db21tYSwgXCIpXCIsIFwiY2FsbFwiLCBtZSk7XG4gICAgaWYgKHR5cGUgPT0gXCIuXCIpIHJldHVybiBjb250KHByb3BlcnR5LCBtZSk7XG4gICAgaWYgKHR5cGUgPT0gXCJbXCIpIHJldHVybiBjb250KHB1c2hsZXgoXCJdXCIpLCBtYXliZWV4cHJlc3Npb24sIGV4cGVjdChcIl1cIiksIHBvcGxleCwgbWUpO1xuICB9XG4gIGZ1bmN0aW9uIHF1YXNpKHR5cGUsIHZhbHVlKSB7XG4gICAgaWYgKHR5cGUgIT0gXCJxdWFzaVwiKSByZXR1cm4gcGFzcygpO1xuICAgIGlmICh2YWx1ZS5zbGljZSh2YWx1ZS5sZW5ndGggLSAyKSAhPSBcIiR7XCIpIHJldHVybiBjb250KHF1YXNpKTtcbiAgICByZXR1cm4gY29udChleHByZXNzaW9uLCBjb250aW51ZVF1YXNpKTtcbiAgfVxuICBmdW5jdGlvbiBjb250aW51ZVF1YXNpKHR5cGUpIHtcbiAgICBpZiAodHlwZSA9PSBcIn1cIikge1xuICAgICAgY3gubWFya2VkID0gXCJzdHJpbmctMlwiO1xuICAgICAgY3guc3RhdGUudG9rZW5pemUgPSB0b2tlblF1YXNpO1xuICAgICAgcmV0dXJuIGNvbnQocXVhc2kpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBhcnJvd0JvZHkodHlwZSkge1xuICAgIGZpbmRGYXRBcnJvdyhjeC5zdHJlYW0sIGN4LnN0YXRlKTtcbiAgICBpZiAodHlwZSA9PSBcIntcIikgcmV0dXJuIHBhc3Moc3RhdGVtZW50KTtcbiAgICByZXR1cm4gcGFzcyhleHByZXNzaW9uKTtcbiAgfVxuICBmdW5jdGlvbiBhcnJvd0JvZHlOb0NvbW1hKHR5cGUpIHtcbiAgICBmaW5kRmF0QXJyb3coY3guc3RyZWFtLCBjeC5zdGF0ZSk7XG4gICAgaWYgKHR5cGUgPT0gXCJ7XCIpIHJldHVybiBwYXNzKHN0YXRlbWVudCk7XG4gICAgcmV0dXJuIHBhc3MoZXhwcmVzc2lvbk5vQ29tbWEpO1xuICB9XG4gIGZ1bmN0aW9uIG1heWJlbGFiZWwodHlwZSkge1xuICAgIGlmICh0eXBlID09IFwiOlwiKSByZXR1cm4gY29udChwb3BsZXgsIHN0YXRlbWVudCk7XG4gICAgcmV0dXJuIHBhc3MobWF5YmVvcGVyYXRvckNvbW1hLCBleHBlY3QoXCI7XCIpLCBwb3BsZXgpO1xuICB9XG4gIGZ1bmN0aW9uIHByb3BlcnR5KHR5cGUpIHtcbiAgICBpZiAodHlwZSA9PSBcInZhcmlhYmxlXCIpIHtjeC5tYXJrZWQgPSBcInByb3BlcnR5XCI7IHJldHVybiBjb250KCk7fVxuICB9XG4gIGZ1bmN0aW9uIG9ianByb3AodHlwZSwgdmFsdWUpIHtcbiAgICBpZiAodHlwZSA9PSBcInZhcmlhYmxlXCIpIHtcbiAgICAgIGN4Lm1hcmtlZCA9IFwicHJvcGVydHlcIjtcbiAgICAgIGlmICh2YWx1ZSA9PSBcImdldFwiIHx8IHZhbHVlID09IFwic2V0XCIpIHJldHVybiBjb250KGdldHRlclNldHRlcik7XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFwibnVtYmVyXCIgfHwgdHlwZSA9PSBcInN0cmluZ1wiKSB7XG4gICAgICBjeC5tYXJrZWQgPSBqc29ubGRNb2RlID8gXCJwcm9wZXJ0eVwiIDogKHR5cGUgKyBcIiBwcm9wZXJ0eVwiKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJbXCIpIHtcbiAgICAgIHJldHVybiBjb250KGV4cHJlc3Npb24sIGV4cGVjdChcIl1cIiksIGFmdGVycHJvcCk7XG4gICAgfVxuICAgIGlmIChhdG9taWNUeXBlcy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkgcmV0dXJuIGNvbnQoYWZ0ZXJwcm9wKTtcbiAgfVxuICBmdW5jdGlvbiBnZXR0ZXJTZXR0ZXIodHlwZSkge1xuICAgIGlmICh0eXBlICE9IFwidmFyaWFibGVcIikgcmV0dXJuIHBhc3MoYWZ0ZXJwcm9wKTtcbiAgICBjeC5tYXJrZWQgPSBcInByb3BlcnR5XCI7XG4gICAgcmV0dXJuIGNvbnQoZnVuY3Rpb25kZWYpO1xuICB9XG4gIGZ1bmN0aW9uIGFmdGVycHJvcCh0eXBlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCI6XCIpIHJldHVybiBjb250KGV4cHJlc3Npb25Ob0NvbW1hKTtcbiAgICBpZiAodHlwZSA9PSBcIihcIikgcmV0dXJuIHBhc3MoZnVuY3Rpb25kZWYpO1xuICB9XG4gIGZ1bmN0aW9uIGNvbW1hc2VwKHdoYXQsIGVuZCkge1xuICAgIGZ1bmN0aW9uIHByb2NlZWQodHlwZSkge1xuICAgICAgaWYgKHR5cGUgPT0gXCIsXCIpIHtcbiAgICAgICAgdmFyIGxleCA9IGN4LnN0YXRlLmxleGljYWw7XG4gICAgICAgIGlmIChsZXguaW5mbyA9PSBcImNhbGxcIikgbGV4LnBvcyA9IChsZXgucG9zIHx8IDApICsgMTtcbiAgICAgICAgcmV0dXJuIGNvbnQod2hhdCwgcHJvY2VlZCk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZSA9PSBlbmQpIHJldHVybiBjb250KCk7XG4gICAgICByZXR1cm4gY29udChleHBlY3QoZW5kKSk7XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbih0eXBlKSB7XG4gICAgICBpZiAodHlwZSA9PSBlbmQpIHJldHVybiBjb250KCk7XG4gICAgICByZXR1cm4gcGFzcyh3aGF0LCBwcm9jZWVkKTtcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIGNvbnRDb21tYXNlcCh3aGF0LCBlbmQsIGluZm8pIHtcbiAgICBmb3IgKHZhciBpID0gMzsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKylcbiAgICAgIGN4LmNjLnB1c2goYXJndW1lbnRzW2ldKTtcbiAgICByZXR1cm4gY29udChwdXNobGV4KGVuZCwgaW5mbyksIGNvbW1hc2VwKHdoYXQsIGVuZCksIHBvcGxleCk7XG4gIH1cbiAgZnVuY3Rpb24gYmxvY2sodHlwZSkge1xuICAgIGlmICh0eXBlID09IFwifVwiKSByZXR1cm4gY29udCgpO1xuICAgIHJldHVybiBwYXNzKHN0YXRlbWVudCwgYmxvY2spO1xuICB9XG4gIGZ1bmN0aW9uIG1heWJldHlwZSh0eXBlKSB7XG4gICAgaWYgKGlzVFMgJiYgdHlwZSA9PSBcIjpcIikgcmV0dXJuIGNvbnQodHlwZWRlZik7XG4gIH1cbiAgZnVuY3Rpb24gdHlwZWRlZih0eXBlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ2YXJpYWJsZVwiKXtjeC5tYXJrZWQgPSBcInZhcmlhYmxlLTNcIjsgcmV0dXJuIGNvbnQoKTt9XG4gIH1cbiAgZnVuY3Rpb24gdmFyZGVmKCkge1xuICAgIHJldHVybiBwYXNzKHBhdHRlcm4sIG1heWJldHlwZSwgbWF5YmVBc3NpZ24sIHZhcmRlZkNvbnQpO1xuICB9XG4gIGZ1bmN0aW9uIHBhdHRlcm4odHlwZSwgdmFsdWUpIHtcbiAgICBpZiAodHlwZSA9PSBcInZhcmlhYmxlXCIpIHsgcmVnaXN0ZXIodmFsdWUpOyByZXR1cm4gY29udCgpOyB9XG4gICAgaWYgKHR5cGUgPT0gXCJbXCIpIHJldHVybiBjb250Q29tbWFzZXAocGF0dGVybiwgXCJdXCIpO1xuICAgIGlmICh0eXBlID09IFwie1wiKSByZXR1cm4gY29udENvbW1hc2VwKHByb3BwYXR0ZXJuLCBcIn1cIik7XG4gIH1cbiAgZnVuY3Rpb24gcHJvcHBhdHRlcm4odHlwZSwgdmFsdWUpIHtcbiAgICBpZiAodHlwZSA9PSBcInZhcmlhYmxlXCIgJiYgIWN4LnN0cmVhbS5tYXRjaCgvXlxccyo6LywgZmFsc2UpKSB7XG4gICAgICByZWdpc3Rlcih2YWx1ZSk7XG4gICAgICByZXR1cm4gY29udChtYXliZUFzc2lnbik7XG4gICAgfVxuICAgIGlmICh0eXBlID09IFwidmFyaWFibGVcIikgY3gubWFya2VkID0gXCJwcm9wZXJ0eVwiO1xuICAgIHJldHVybiBjb250KGV4cGVjdChcIjpcIiksIHBhdHRlcm4sIG1heWJlQXNzaWduKTtcbiAgfVxuICBmdW5jdGlvbiBtYXliZUFzc2lnbihfdHlwZSwgdmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT0gXCI9XCIpIHJldHVybiBjb250KGV4cHJlc3Npb25Ob0NvbW1hKTtcbiAgfVxuICBmdW5jdGlvbiB2YXJkZWZDb250KHR5cGUpIHtcbiAgICBpZiAodHlwZSA9PSBcIixcIikgcmV0dXJuIGNvbnQodmFyZGVmKTtcbiAgfVxuICBmdW5jdGlvbiBtYXliZWVsc2UodHlwZSwgdmFsdWUpIHtcbiAgICBpZiAodHlwZSA9PSBcImtleXdvcmQgYlwiICYmIHZhbHVlID09IFwiZWxzZVwiKSByZXR1cm4gY29udChwdXNobGV4KFwiZm9ybVwiLCBcImVsc2VcIiksIHN0YXRlbWVudCwgcG9wbGV4KTtcbiAgfVxuICBmdW5jdGlvbiBmb3JzcGVjKHR5cGUpIHtcbiAgICBpZiAodHlwZSA9PSBcIihcIikgcmV0dXJuIGNvbnQocHVzaGxleChcIilcIiksIGZvcnNwZWMxLCBleHBlY3QoXCIpXCIpLCBwb3BsZXgpO1xuICB9XG4gIGZ1bmN0aW9uIGZvcnNwZWMxKHR5cGUpIHtcbiAgICBpZiAodHlwZSA9PSBcInZhclwiKSByZXR1cm4gY29udCh2YXJkZWYsIGV4cGVjdChcIjtcIiksIGZvcnNwZWMyKTtcbiAgICBpZiAodHlwZSA9PSBcIjtcIikgcmV0dXJuIGNvbnQoZm9yc3BlYzIpO1xuICAgIGlmICh0eXBlID09IFwidmFyaWFibGVcIikgcmV0dXJuIGNvbnQoZm9ybWF5YmVpbm9mKTtcbiAgICByZXR1cm4gcGFzcyhleHByZXNzaW9uLCBleHBlY3QoXCI7XCIpLCBmb3JzcGVjMik7XG4gIH1cbiAgZnVuY3Rpb24gZm9ybWF5YmVpbm9mKF90eXBlLCB2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PSBcImluXCIgfHwgdmFsdWUgPT0gXCJvZlwiKSB7IGN4Lm1hcmtlZCA9IFwia2V5d29yZFwiOyByZXR1cm4gY29udChleHByZXNzaW9uKTsgfVxuICAgIHJldHVybiBjb250KG1heWJlb3BlcmF0b3JDb21tYSwgZm9yc3BlYzIpO1xuICB9XG4gIGZ1bmN0aW9uIGZvcnNwZWMyKHR5cGUsIHZhbHVlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCI7XCIpIHJldHVybiBjb250KGZvcnNwZWMzKTtcbiAgICBpZiAodmFsdWUgPT0gXCJpblwiIHx8IHZhbHVlID09IFwib2ZcIikgeyBjeC5tYXJrZWQgPSBcImtleXdvcmRcIjsgcmV0dXJuIGNvbnQoZXhwcmVzc2lvbik7IH1cbiAgICByZXR1cm4gcGFzcyhleHByZXNzaW9uLCBleHBlY3QoXCI7XCIpLCBmb3JzcGVjMyk7XG4gIH1cbiAgZnVuY3Rpb24gZm9yc3BlYzModHlwZSkge1xuICAgIGlmICh0eXBlICE9IFwiKVwiKSBjb250KGV4cHJlc3Npb24pO1xuICB9XG4gIGZ1bmN0aW9uIGZ1bmN0aW9uZGVmKHR5cGUsIHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09IFwiKlwiKSB7Y3gubWFya2VkID0gXCJrZXl3b3JkXCI7IHJldHVybiBjb250KGZ1bmN0aW9uZGVmKTt9XG4gICAgaWYgKHR5cGUgPT0gXCJ2YXJpYWJsZVwiKSB7cmVnaXN0ZXIodmFsdWUpOyByZXR1cm4gY29udChmdW5jdGlvbmRlZik7fVxuICAgIGlmICh0eXBlID09IFwiKFwiKSByZXR1cm4gY29udChwdXNoY29udGV4dCwgcHVzaGxleChcIilcIiksIGNvbW1hc2VwKGZ1bmFyZywgXCIpXCIpLCBwb3BsZXgsIHN0YXRlbWVudCwgcG9wY29udGV4dCk7XG4gIH1cbiAgZnVuY3Rpb24gZnVuYXJnKHR5cGUpIHtcbiAgICBpZiAodHlwZSA9PSBcInNwcmVhZFwiKSByZXR1cm4gY29udChmdW5hcmcpO1xuICAgIHJldHVybiBwYXNzKHBhdHRlcm4sIG1heWJldHlwZSk7XG4gIH1cbiAgZnVuY3Rpb24gY2xhc3NOYW1lKHR5cGUsIHZhbHVlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ2YXJpYWJsZVwiKSB7cmVnaXN0ZXIodmFsdWUpOyByZXR1cm4gY29udChjbGFzc05hbWVBZnRlcik7fVxuICB9XG4gIGZ1bmN0aW9uIGNsYXNzTmFtZUFmdGVyKF90eXBlLCB2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PSBcImV4dGVuZHNcIikgcmV0dXJuIGNvbnQoZXhwcmVzc2lvbik7XG4gIH1cbiAgZnVuY3Rpb24gb2JqbGl0KHR5cGUpIHtcbiAgICBpZiAodHlwZSA9PSBcIntcIikgcmV0dXJuIGNvbnRDb21tYXNlcChvYmpwcm9wLCBcIn1cIik7XG4gIH1cbiAgZnVuY3Rpb24gYWZ0ZXJNb2R1bGUodHlwZSwgdmFsdWUpIHtcbiAgICBpZiAodHlwZSA9PSBcInN0cmluZ1wiKSByZXR1cm4gY29udChzdGF0ZW1lbnQpO1xuICAgIGlmICh0eXBlID09IFwidmFyaWFibGVcIikgeyByZWdpc3Rlcih2YWx1ZSk7IHJldHVybiBjb250KG1heWJlRnJvbSk7IH1cbiAgfVxuICBmdW5jdGlvbiBhZnRlckV4cG9ydChfdHlwZSwgdmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT0gXCIqXCIpIHsgY3gubWFya2VkID0gXCJrZXl3b3JkXCI7IHJldHVybiBjb250KG1heWJlRnJvbSwgZXhwZWN0KFwiO1wiKSk7IH1cbiAgICBpZiAodmFsdWUgPT0gXCJkZWZhdWx0XCIpIHsgY3gubWFya2VkID0gXCJrZXl3b3JkXCI7IHJldHVybiBjb250KGV4cHJlc3Npb24sIGV4cGVjdChcIjtcIikpOyB9XG4gICAgcmV0dXJuIHBhc3Moc3RhdGVtZW50KTtcbiAgfVxuICBmdW5jdGlvbiBhZnRlckltcG9ydCh0eXBlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJzdHJpbmdcIikgcmV0dXJuIGNvbnQoKTtcbiAgICByZXR1cm4gcGFzcyhpbXBvcnRTcGVjLCBtYXliZUZyb20pO1xuICB9XG4gIGZ1bmN0aW9uIGltcG9ydFNwZWModHlwZSwgdmFsdWUpIHtcbiAgICBpZiAodHlwZSA9PSBcIntcIikgcmV0dXJuIGNvbnRDb21tYXNlcChpbXBvcnRTcGVjLCBcIn1cIik7XG4gICAgaWYgKHR5cGUgPT0gXCJ2YXJpYWJsZVwiKSByZWdpc3Rlcih2YWx1ZSk7XG4gICAgcmV0dXJuIGNvbnQoKTtcbiAgfVxuICBmdW5jdGlvbiBtYXliZUZyb20oX3R5cGUsIHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09IFwiZnJvbVwiKSB7IGN4Lm1hcmtlZCA9IFwia2V5d29yZFwiOyByZXR1cm4gY29udChleHByZXNzaW9uKTsgfVxuICB9XG4gIGZ1bmN0aW9uIGFycmF5TGl0ZXJhbCh0eXBlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJdXCIpIHJldHVybiBjb250KCk7XG4gICAgcmV0dXJuIHBhc3MoZXhwcmVzc2lvbk5vQ29tbWEsIG1heWJlQXJyYXlDb21wcmVoZW5zaW9uKTtcbiAgfVxuICBmdW5jdGlvbiBtYXliZUFycmF5Q29tcHJlaGVuc2lvbih0eXBlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJmb3JcIikgcmV0dXJuIHBhc3MoY29tcHJlaGVuc2lvbiwgZXhwZWN0KFwiXVwiKSk7XG4gICAgaWYgKHR5cGUgPT0gXCIsXCIpIHJldHVybiBjb250KGNvbW1hc2VwKGV4cHJlc3Npb25Ob0NvbW1hLCBcIl1cIikpO1xuICAgIHJldHVybiBwYXNzKGNvbW1hc2VwKGV4cHJlc3Npb25Ob0NvbW1hLCBcIl1cIikpO1xuICB9XG4gIGZ1bmN0aW9uIGNvbXByZWhlbnNpb24odHlwZSkge1xuICAgIGlmICh0eXBlID09IFwiZm9yXCIpIHJldHVybiBjb250KGZvcnNwZWMsIGNvbXByZWhlbnNpb24pO1xuICAgIGlmICh0eXBlID09IFwiaWZcIikgcmV0dXJuIGNvbnQoZXhwcmVzc2lvbiwgY29tcHJlaGVuc2lvbik7XG4gIH1cblxuICAvLyBJbnRlcmZhY2VcblxuICByZXR1cm4ge1xuICAgIHN0YXJ0U3RhdGU6IGZ1bmN0aW9uKGJhc2Vjb2x1bW4pIHtcbiAgICAgIHZhciBzdGF0ZSA9IHtcbiAgICAgICAgdG9rZW5pemU6IHRva2VuQmFzZSxcbiAgICAgICAgbGFzdFR5cGU6IFwic29mXCIsXG4gICAgICAgIGNjOiBbXSxcbiAgICAgICAgbGV4aWNhbDogbmV3IEpTTGV4aWNhbCgoYmFzZWNvbHVtbiB8fCAwKSAtIGluZGVudFVuaXQsIDAsIFwiYmxvY2tcIiwgZmFsc2UpLFxuICAgICAgICBsb2NhbFZhcnM6IHBhcnNlckNvbmZpZy5sb2NhbFZhcnMsXG4gICAgICAgIGNvbnRleHQ6IHBhcnNlckNvbmZpZy5sb2NhbFZhcnMgJiYge3ZhcnM6IHBhcnNlckNvbmZpZy5sb2NhbFZhcnN9LFxuICAgICAgICBpbmRlbnRlZDogMFxuICAgICAgfTtcbiAgICAgIGlmIChwYXJzZXJDb25maWcuZ2xvYmFsVmFycyAmJiB0eXBlb2YgcGFyc2VyQ29uZmlnLmdsb2JhbFZhcnMgPT0gXCJvYmplY3RcIilcbiAgICAgICAgc3RhdGUuZ2xvYmFsVmFycyA9IHBhcnNlckNvbmZpZy5nbG9iYWxWYXJzO1xuICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH0sXG5cbiAgICB0b2tlbjogZnVuY3Rpb24oc3RyZWFtLCBzdGF0ZSkge1xuICAgICAgaWYgKHN0cmVhbS5zb2woKSkge1xuICAgICAgICBpZiAoIXN0YXRlLmxleGljYWwuaGFzT3duUHJvcGVydHkoXCJhbGlnblwiKSlcbiAgICAgICAgICBzdGF0ZS5sZXhpY2FsLmFsaWduID0gZmFsc2U7XG4gICAgICAgIHN0YXRlLmluZGVudGVkID0gc3RyZWFtLmluZGVudGF0aW9uKCk7XG4gICAgICAgIGZpbmRGYXRBcnJvdyhzdHJlYW0sIHN0YXRlKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdGF0ZS50b2tlbml6ZSAhPSB0b2tlbkNvbW1lbnQgJiYgc3RyZWFtLmVhdFNwYWNlKCkpIHJldHVybiBudWxsO1xuICAgICAgdmFyIHN0eWxlID0gc3RhdGUudG9rZW5pemUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgICBpZiAodHlwZSA9PSBcImNvbW1lbnRcIikgcmV0dXJuIHN0eWxlO1xuICAgICAgc3RhdGUubGFzdFR5cGUgPSB0eXBlID09IFwib3BlcmF0b3JcIiAmJiAoY29udGVudCA9PSBcIisrXCIgfHwgY29udGVudCA9PSBcIi0tXCIpID8gXCJpbmNkZWNcIiA6IHR5cGU7XG4gICAgICByZXR1cm4gcGFyc2VKUyhzdGF0ZSwgc3R5bGUsIHR5cGUsIGNvbnRlbnQsIHN0cmVhbSk7XG4gICAgfSxcblxuICAgIGluZGVudDogZnVuY3Rpb24oc3RhdGUsIHRleHRBZnRlcikge1xuICAgICAgaWYgKHN0YXRlLnRva2VuaXplID09IHRva2VuQ29tbWVudCkgcmV0dXJuIENvZGVNaXJyb3IuUGFzcztcbiAgICAgIGlmIChzdGF0ZS50b2tlbml6ZSAhPSB0b2tlbkJhc2UpIHJldHVybiAwO1xuICAgICAgdmFyIGZpcnN0Q2hhciA9IHRleHRBZnRlciAmJiB0ZXh0QWZ0ZXIuY2hhckF0KDApLCBsZXhpY2FsID0gc3RhdGUubGV4aWNhbDtcbiAgICAgIC8vIEtsdWRnZSB0byBwcmV2ZW50ICdtYXliZWxzZScgZnJvbSBibG9ja2luZyBsZXhpY2FsIHNjb3BlIHBvcHNcbiAgICAgIGlmICghL15cXHMqZWxzZVxcYi8udGVzdCh0ZXh0QWZ0ZXIpKSBmb3IgKHZhciBpID0gc3RhdGUuY2MubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGMgPSBzdGF0ZS5jY1tpXTtcbiAgICAgICAgaWYgKGMgPT0gcG9wbGV4KSBsZXhpY2FsID0gbGV4aWNhbC5wcmV2O1xuICAgICAgICBlbHNlIGlmIChjICE9IG1heWJlZWxzZSkgYnJlYWs7XG4gICAgICB9XG4gICAgICBpZiAobGV4aWNhbC50eXBlID09IFwic3RhdFwiICYmIGZpcnN0Q2hhciA9PSBcIn1cIikgbGV4aWNhbCA9IGxleGljYWwucHJldjtcbiAgICAgIGlmIChzdGF0ZW1lbnRJbmRlbnQgJiYgbGV4aWNhbC50eXBlID09IFwiKVwiICYmIGxleGljYWwucHJldi50eXBlID09IFwic3RhdFwiKVxuICAgICAgICBsZXhpY2FsID0gbGV4aWNhbC5wcmV2O1xuICAgICAgdmFyIHR5cGUgPSBsZXhpY2FsLnR5cGUsIGNsb3NpbmcgPSBmaXJzdENoYXIgPT0gdHlwZTtcblxuICAgICAgaWYgKHR5cGUgPT0gXCJ2YXJkZWZcIikgcmV0dXJuIGxleGljYWwuaW5kZW50ZWQgKyAoc3RhdGUubGFzdFR5cGUgPT0gXCJvcGVyYXRvclwiIHx8IHN0YXRlLmxhc3RUeXBlID09IFwiLFwiID8gbGV4aWNhbC5pbmZvICsgMSA6IDApO1xuICAgICAgZWxzZSBpZiAodHlwZSA9PSBcImZvcm1cIiAmJiBmaXJzdENoYXIgPT0gXCJ7XCIpIHJldHVybiBsZXhpY2FsLmluZGVudGVkO1xuICAgICAgZWxzZSBpZiAodHlwZSA9PSBcImZvcm1cIikgcmV0dXJuIGxleGljYWwuaW5kZW50ZWQgKyBpbmRlbnRVbml0O1xuICAgICAgZWxzZSBpZiAodHlwZSA9PSBcInN0YXRcIilcbiAgICAgICAgcmV0dXJuIGxleGljYWwuaW5kZW50ZWQgKyAoc3RhdGUubGFzdFR5cGUgPT0gXCJvcGVyYXRvclwiIHx8IHN0YXRlLmxhc3RUeXBlID09IFwiLFwiID8gc3RhdGVtZW50SW5kZW50IHx8IGluZGVudFVuaXQgOiAwKTtcbiAgICAgIGVsc2UgaWYgKGxleGljYWwuaW5mbyA9PSBcInN3aXRjaFwiICYmICFjbG9zaW5nICYmIHBhcnNlckNvbmZpZy5kb3VibGVJbmRlbnRTd2l0Y2ggIT0gZmFsc2UpXG4gICAgICAgIHJldHVybiBsZXhpY2FsLmluZGVudGVkICsgKC9eKD86Y2FzZXxkZWZhdWx0KVxcYi8udGVzdCh0ZXh0QWZ0ZXIpID8gaW5kZW50VW5pdCA6IDIgKiBpbmRlbnRVbml0KTtcbiAgICAgIGVsc2UgaWYgKGxleGljYWwuYWxpZ24pIHJldHVybiBsZXhpY2FsLmNvbHVtbiArIChjbG9zaW5nID8gMCA6IDEpO1xuICAgICAgZWxzZSByZXR1cm4gbGV4aWNhbC5pbmRlbnRlZCArIChjbG9zaW5nID8gMCA6IGluZGVudFVuaXQpO1xuICAgIH0sXG5cbiAgICBlbGVjdHJpY0NoYXJzOiBcIjp7fVwiLFxuICAgIGJsb2NrQ29tbWVudFN0YXJ0OiBqc29uTW9kZSA/IG51bGwgOiBcIi8qXCIsXG4gICAgYmxvY2tDb21tZW50RW5kOiBqc29uTW9kZSA/IG51bGwgOiBcIiovXCIsXG4gICAgbGluZUNvbW1lbnQ6IGpzb25Nb2RlID8gbnVsbCA6IFwiLy9cIixcbiAgICBmb2xkOiBcImJyYWNlXCIsXG5cbiAgICBoZWxwZXJUeXBlOiBqc29uTW9kZSA/IFwianNvblwiIDogXCJqYXZhc2NyaXB0XCIsXG4gICAganNvbmxkTW9kZToganNvbmxkTW9kZSxcbiAgICBqc29uTW9kZToganNvbk1vZGVcbiAgfTtcbn0pO1xuXG5Db2RlTWlycm9yLnJlZ2lzdGVySGVscGVyKFwid29yZENoYXJzXCIsIFwiamF2YXNjcmlwdFwiLCAvW1xcXFx3JF0vKTtcblxuQ29kZU1pcnJvci5kZWZpbmVNSU1FKFwidGV4dC9qYXZhc2NyaXB0XCIsIFwiamF2YXNjcmlwdFwiKTtcbkNvZGVNaXJyb3IuZGVmaW5lTUlNRShcInRleHQvZWNtYXNjcmlwdFwiLCBcImphdmFzY3JpcHRcIik7XG5Db2RlTWlycm9yLmRlZmluZU1JTUUoXCJhcHBsaWNhdGlvbi9qYXZhc2NyaXB0XCIsIFwiamF2YXNjcmlwdFwiKTtcbkNvZGVNaXJyb3IuZGVmaW5lTUlNRShcImFwcGxpY2F0aW9uL2VjbWFzY3JpcHRcIiwgXCJqYXZhc2NyaXB0XCIpO1xuQ29kZU1pcnJvci5kZWZpbmVNSU1FKFwiYXBwbGljYXRpb24vanNvblwiLCB7bmFtZTogXCJqYXZhc2NyaXB0XCIsIGpzb246IHRydWV9KTtcbkNvZGVNaXJyb3IuZGVmaW5lTUlNRShcImFwcGxpY2F0aW9uL3gtanNvblwiLCB7bmFtZTogXCJqYXZhc2NyaXB0XCIsIGpzb246IHRydWV9KTtcbkNvZGVNaXJyb3IuZGVmaW5lTUlNRShcImFwcGxpY2F0aW9uL2xkK2pzb25cIiwge25hbWU6IFwiamF2YXNjcmlwdFwiLCBqc29ubGQ6IHRydWV9KTtcbkNvZGVNaXJyb3IuZGVmaW5lTUlNRShcInRleHQvdHlwZXNjcmlwdFwiLCB7IG5hbWU6IFwiamF2YXNjcmlwdFwiLCB0eXBlc2NyaXB0OiB0cnVlIH0pO1xuQ29kZU1pcnJvci5kZWZpbmVNSU1FKFwiYXBwbGljYXRpb24vdHlwZXNjcmlwdFwiLCB7IG5hbWU6IFwiamF2YXNjcmlwdFwiLCB0eXBlc2NyaXB0OiB0cnVlIH0pO1xuXG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLypnbG9iYWxzIEhhbmRsZWJhcnM6IHRydWUgKi9cbnZhciBiYXNlID0gcmVxdWlyZShcIi4vaGFuZGxlYmFycy9iYXNlXCIpO1xuXG4vLyBFYWNoIG9mIHRoZXNlIGF1Z21lbnQgdGhlIEhhbmRsZWJhcnMgb2JqZWN0LiBObyBuZWVkIHRvIHNldHVwIGhlcmUuXG4vLyAoVGhpcyBpcyBkb25lIHRvIGVhc2lseSBzaGFyZSBjb2RlIGJldHdlZW4gY29tbW9uanMgYW5kIGJyb3dzZSBlbnZzKVxudmFyIFNhZmVTdHJpbmcgPSByZXF1aXJlKFwiLi9oYW5kbGViYXJzL3NhZmUtc3RyaW5nXCIpW1wiZGVmYXVsdFwiXTtcbnZhciBFeGNlcHRpb24gPSByZXF1aXJlKFwiLi9oYW5kbGViYXJzL2V4Y2VwdGlvblwiKVtcImRlZmF1bHRcIl07XG52YXIgVXRpbHMgPSByZXF1aXJlKFwiLi9oYW5kbGViYXJzL3V0aWxzXCIpO1xudmFyIHJ1bnRpbWUgPSByZXF1aXJlKFwiLi9oYW5kbGViYXJzL3J1bnRpbWVcIik7XG5cbi8vIEZvciBjb21wYXRpYmlsaXR5IGFuZCB1c2FnZSBvdXRzaWRlIG9mIG1vZHVsZSBzeXN0ZW1zLCBtYWtlIHRoZSBIYW5kbGViYXJzIG9iamVjdCBhIG5hbWVzcGFjZVxudmFyIGNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaGIgPSBuZXcgYmFzZS5IYW5kbGViYXJzRW52aXJvbm1lbnQoKTtcblxuICBVdGlscy5leHRlbmQoaGIsIGJhc2UpO1xuICBoYi5TYWZlU3RyaW5nID0gU2FmZVN0cmluZztcbiAgaGIuRXhjZXB0aW9uID0gRXhjZXB0aW9uO1xuICBoYi5VdGlscyA9IFV0aWxzO1xuXG4gIGhiLlZNID0gcnVudGltZTtcbiAgaGIudGVtcGxhdGUgPSBmdW5jdGlvbihzcGVjKSB7XG4gICAgcmV0dXJuIHJ1bnRpbWUudGVtcGxhdGUoc3BlYywgaGIpO1xuICB9O1xuXG4gIHJldHVybiBoYjtcbn07XG5cbnZhciBIYW5kbGViYXJzID0gY3JlYXRlKCk7XG5IYW5kbGViYXJzLmNyZWF0ZSA9IGNyZWF0ZTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBIYW5kbGViYXJzOyIsIlwidXNlIHN0cmljdFwiO1xudmFyIFV0aWxzID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XG52YXIgRXhjZXB0aW9uID0gcmVxdWlyZShcIi4vZXhjZXB0aW9uXCIpW1wiZGVmYXVsdFwiXTtcblxudmFyIFZFUlNJT04gPSBcIjEuMy4wXCI7XG5leHBvcnRzLlZFUlNJT04gPSBWRVJTSU9OO3ZhciBDT01QSUxFUl9SRVZJU0lPTiA9IDQ7XG5leHBvcnRzLkNPTVBJTEVSX1JFVklTSU9OID0gQ09NUElMRVJfUkVWSVNJT047XG52YXIgUkVWSVNJT05fQ0hBTkdFUyA9IHtcbiAgMTogJzw9IDEuMC5yYy4yJywgLy8gMS4wLnJjLjIgaXMgYWN0dWFsbHkgcmV2MiBidXQgZG9lc24ndCByZXBvcnQgaXRcbiAgMjogJz09IDEuMC4wLXJjLjMnLFxuICAzOiAnPT0gMS4wLjAtcmMuNCcsXG4gIDQ6ICc+PSAxLjAuMCdcbn07XG5leHBvcnRzLlJFVklTSU9OX0NIQU5HRVMgPSBSRVZJU0lPTl9DSEFOR0VTO1xudmFyIGlzQXJyYXkgPSBVdGlscy5pc0FycmF5LFxuICAgIGlzRnVuY3Rpb24gPSBVdGlscy5pc0Z1bmN0aW9uLFxuICAgIHRvU3RyaW5nID0gVXRpbHMudG9TdHJpbmcsXG4gICAgb2JqZWN0VHlwZSA9ICdbb2JqZWN0IE9iamVjdF0nO1xuXG5mdW5jdGlvbiBIYW5kbGViYXJzRW52aXJvbm1lbnQoaGVscGVycywgcGFydGlhbHMpIHtcbiAgdGhpcy5oZWxwZXJzID0gaGVscGVycyB8fCB7fTtcbiAgdGhpcy5wYXJ0aWFscyA9IHBhcnRpYWxzIHx8IHt9O1xuXG4gIHJlZ2lzdGVyRGVmYXVsdEhlbHBlcnModGhpcyk7XG59XG5cbmV4cG9ydHMuSGFuZGxlYmFyc0Vudmlyb25tZW50ID0gSGFuZGxlYmFyc0Vudmlyb25tZW50O0hhbmRsZWJhcnNFbnZpcm9ubWVudC5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBIYW5kbGViYXJzRW52aXJvbm1lbnQsXG5cbiAgbG9nZ2VyOiBsb2dnZXIsXG4gIGxvZzogbG9nLFxuXG4gIHJlZ2lzdGVySGVscGVyOiBmdW5jdGlvbihuYW1lLCBmbiwgaW52ZXJzZSkge1xuICAgIGlmICh0b1N0cmluZy5jYWxsKG5hbWUpID09PSBvYmplY3RUeXBlKSB7XG4gICAgICBpZiAoaW52ZXJzZSB8fCBmbikgeyB0aHJvdyBuZXcgRXhjZXB0aW9uKCdBcmcgbm90IHN1cHBvcnRlZCB3aXRoIG11bHRpcGxlIGhlbHBlcnMnKTsgfVxuICAgICAgVXRpbHMuZXh0ZW5kKHRoaXMuaGVscGVycywgbmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChpbnZlcnNlKSB7IGZuLm5vdCA9IGludmVyc2U7IH1cbiAgICAgIHRoaXMuaGVscGVyc1tuYW1lXSA9IGZuO1xuICAgIH1cbiAgfSxcblxuICByZWdpc3RlclBhcnRpYWw6IGZ1bmN0aW9uKG5hbWUsIHN0cikge1xuICAgIGlmICh0b1N0cmluZy5jYWxsKG5hbWUpID09PSBvYmplY3RUeXBlKSB7XG4gICAgICBVdGlscy5leHRlbmQodGhpcy5wYXJ0aWFscywgIG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnBhcnRpYWxzW25hbWVdID0gc3RyO1xuICAgIH1cbiAgfVxufTtcblxuZnVuY3Rpb24gcmVnaXN0ZXJEZWZhdWx0SGVscGVycyhpbnN0YW5jZSkge1xuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignaGVscGVyTWlzc2luZycsIGZ1bmN0aW9uKGFyZykge1xuICAgIGlmKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oXCJNaXNzaW5nIGhlbHBlcjogJ1wiICsgYXJnICsgXCInXCIpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2Jsb2NrSGVscGVyTWlzc2luZycsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICB2YXIgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZSB8fCBmdW5jdGlvbigpIHt9LCBmbiA9IG9wdGlvbnMuZm47XG5cbiAgICBpZiAoaXNGdW5jdGlvbihjb250ZXh0KSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgICBpZihjb250ZXh0ID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gZm4odGhpcyk7XG4gICAgfSBlbHNlIGlmKGNvbnRleHQgPT09IGZhbHNlIHx8IGNvbnRleHQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGludmVyc2UodGhpcyk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KGNvbnRleHQpKSB7XG4gICAgICBpZihjb250ZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIGluc3RhbmNlLmhlbHBlcnMuZWFjaChjb250ZXh0LCBvcHRpb25zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZm4oY29udGV4dCk7XG4gICAgfVxuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignZWFjaCcsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICB2YXIgZm4gPSBvcHRpb25zLmZuLCBpbnZlcnNlID0gb3B0aW9ucy5pbnZlcnNlO1xuICAgIHZhciBpID0gMCwgcmV0ID0gXCJcIiwgZGF0YTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKGNvbnRleHQpKSB7IGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7IH1cblxuICAgIGlmIChvcHRpb25zLmRhdGEpIHtcbiAgICAgIGRhdGEgPSBjcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICAgIH1cblxuICAgIGlmKGNvbnRleHQgJiYgdHlwZW9mIGNvbnRleHQgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAoaXNBcnJheShjb250ZXh0KSkge1xuICAgICAgICBmb3IodmFyIGogPSBjb250ZXh0Lmxlbmd0aDsgaTxqOyBpKyspIHtcbiAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgZGF0YS5pbmRleCA9IGk7XG4gICAgICAgICAgICBkYXRhLmZpcnN0ID0gKGkgPT09IDApO1xuICAgICAgICAgICAgZGF0YS5sYXN0ICA9IChpID09PSAoY29udGV4dC5sZW5ndGgtMSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXQgPSByZXQgKyBmbihjb250ZXh0W2ldLCB7IGRhdGE6IGRhdGEgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvcih2YXIga2V5IGluIGNvbnRleHQpIHtcbiAgICAgICAgICBpZihjb250ZXh0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgIGlmKGRhdGEpIHsgXG4gICAgICAgICAgICAgIGRhdGEua2V5ID0ga2V5OyBcbiAgICAgICAgICAgICAgZGF0YS5pbmRleCA9IGk7XG4gICAgICAgICAgICAgIGRhdGEuZmlyc3QgPSAoaSA9PT0gMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXQgPSByZXQgKyBmbihjb250ZXh0W2tleV0sIHtkYXRhOiBkYXRhfSk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoaSA9PT0gMCl7XG4gICAgICByZXQgPSBpbnZlcnNlKHRoaXMpO1xuICAgIH1cblxuICAgIHJldHVybiByZXQ7XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdpZicsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24oY29uZGl0aW9uYWwpKSB7IGNvbmRpdGlvbmFsID0gY29uZGl0aW9uYWwuY2FsbCh0aGlzKTsgfVxuXG4gICAgLy8gRGVmYXVsdCBiZWhhdmlvciBpcyB0byByZW5kZXIgdGhlIHBvc2l0aXZlIHBhdGggaWYgdGhlIHZhbHVlIGlzIHRydXRoeSBhbmQgbm90IGVtcHR5LlxuICAgIC8vIFRoZSBgaW5jbHVkZVplcm9gIG9wdGlvbiBtYXkgYmUgc2V0IHRvIHRyZWF0IHRoZSBjb25kdGlvbmFsIGFzIHB1cmVseSBub3QgZW1wdHkgYmFzZWQgb24gdGhlXG4gICAgLy8gYmVoYXZpb3Igb2YgaXNFbXB0eS4gRWZmZWN0aXZlbHkgdGhpcyBkZXRlcm1pbmVzIGlmIDAgaXMgaGFuZGxlZCBieSB0aGUgcG9zaXRpdmUgcGF0aCBvciBuZWdhdGl2ZS5cbiAgICBpZiAoKCFvcHRpb25zLmhhc2guaW5jbHVkZVplcm8gJiYgIWNvbmRpdGlvbmFsKSB8fCBVdGlscy5pc0VtcHR5KGNvbmRpdGlvbmFsKSkge1xuICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gICAgfVxuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcigndW5sZXNzJywgZnVuY3Rpb24oY29uZGl0aW9uYWwsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gaW5zdGFuY2UuaGVscGVyc1snaWYnXS5jYWxsKHRoaXMsIGNvbmRpdGlvbmFsLCB7Zm46IG9wdGlvbnMuaW52ZXJzZSwgaW52ZXJzZTogb3B0aW9ucy5mbiwgaGFzaDogb3B0aW9ucy5oYXNofSk7XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCd3aXRoJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgIGlmIChpc0Z1bmN0aW9uKGNvbnRleHQpKSB7IGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7IH1cblxuICAgIGlmICghVXRpbHMuaXNFbXB0eShjb250ZXh0KSkgcmV0dXJuIG9wdGlvbnMuZm4oY29udGV4dCk7XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdsb2cnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgdmFyIGxldmVsID0gb3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuZGF0YS5sZXZlbCAhPSBudWxsID8gcGFyc2VJbnQob3B0aW9ucy5kYXRhLmxldmVsLCAxMCkgOiAxO1xuICAgIGluc3RhbmNlLmxvZyhsZXZlbCwgY29udGV4dCk7XG4gIH0pO1xufVxuXG52YXIgbG9nZ2VyID0ge1xuICBtZXRob2RNYXA6IHsgMDogJ2RlYnVnJywgMTogJ2luZm8nLCAyOiAnd2FybicsIDM6ICdlcnJvcicgfSxcblxuICAvLyBTdGF0ZSBlbnVtXG4gIERFQlVHOiAwLFxuICBJTkZPOiAxLFxuICBXQVJOOiAyLFxuICBFUlJPUjogMyxcbiAgbGV2ZWw6IDMsXG5cbiAgLy8gY2FuIGJlIG92ZXJyaWRkZW4gaW4gdGhlIGhvc3QgZW52aXJvbm1lbnRcbiAgbG9nOiBmdW5jdGlvbihsZXZlbCwgb2JqKSB7XG4gICAgaWYgKGxvZ2dlci5sZXZlbCA8PSBsZXZlbCkge1xuICAgICAgdmFyIG1ldGhvZCA9IGxvZ2dlci5tZXRob2RNYXBbbGV2ZWxdO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiBjb25zb2xlW21ldGhvZF0pIHtcbiAgICAgICAgY29uc29sZVttZXRob2RdLmNhbGwoY29uc29sZSwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5leHBvcnRzLmxvZ2dlciA9IGxvZ2dlcjtcbmZ1bmN0aW9uIGxvZyhsZXZlbCwgb2JqKSB7IGxvZ2dlci5sb2cobGV2ZWwsIG9iaik7IH1cblxuZXhwb3J0cy5sb2cgPSBsb2c7dmFyIGNyZWF0ZUZyYW1lID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gIHZhciBvYmogPSB7fTtcbiAgVXRpbHMuZXh0ZW5kKG9iaiwgb2JqZWN0KTtcbiAgcmV0dXJuIG9iajtcbn07XG5leHBvcnRzLmNyZWF0ZUZyYW1lID0gY3JlYXRlRnJhbWU7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlcnJvclByb3BzID0gWydkZXNjcmlwdGlvbicsICdmaWxlTmFtZScsICdsaW5lTnVtYmVyJywgJ21lc3NhZ2UnLCAnbmFtZScsICdudW1iZXInLCAnc3RhY2snXTtcblxuZnVuY3Rpb24gRXhjZXB0aW9uKG1lc3NhZ2UsIG5vZGUpIHtcbiAgdmFyIGxpbmU7XG4gIGlmIChub2RlICYmIG5vZGUuZmlyc3RMaW5lKSB7XG4gICAgbGluZSA9IG5vZGUuZmlyc3RMaW5lO1xuXG4gICAgbWVzc2FnZSArPSAnIC0gJyArIGxpbmUgKyAnOicgKyBub2RlLmZpcnN0Q29sdW1uO1xuICB9XG5cbiAgdmFyIHRtcCA9IEVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIG1lc3NhZ2UpO1xuXG4gIC8vIFVuZm9ydHVuYXRlbHkgZXJyb3JzIGFyZSBub3QgZW51bWVyYWJsZSBpbiBDaHJvbWUgKGF0IGxlYXN0KSwgc28gYGZvciBwcm9wIGluIHRtcGAgZG9lc24ndCB3b3JrLlxuICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBlcnJvclByb3BzLmxlbmd0aDsgaWR4KyspIHtcbiAgICB0aGlzW2Vycm9yUHJvcHNbaWR4XV0gPSB0bXBbZXJyb3JQcm9wc1tpZHhdXTtcbiAgfVxuXG4gIGlmIChsaW5lKSB7XG4gICAgdGhpcy5saW5lTnVtYmVyID0gbGluZTtcbiAgICB0aGlzLmNvbHVtbiA9IG5vZGUuZmlyc3RDb2x1bW47XG4gIH1cbn1cblxuRXhjZXB0aW9uLnByb3RvdHlwZSA9IG5ldyBFcnJvcigpO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IEV4Y2VwdGlvbjsiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBVdGlscyA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpO1xudmFyIEV4Y2VwdGlvbiA9IHJlcXVpcmUoXCIuL2V4Y2VwdGlvblwiKVtcImRlZmF1bHRcIl07XG52YXIgQ09NUElMRVJfUkVWSVNJT04gPSByZXF1aXJlKFwiLi9iYXNlXCIpLkNPTVBJTEVSX1JFVklTSU9OO1xudmFyIFJFVklTSU9OX0NIQU5HRVMgPSByZXF1aXJlKFwiLi9iYXNlXCIpLlJFVklTSU9OX0NIQU5HRVM7XG5cbmZ1bmN0aW9uIGNoZWNrUmV2aXNpb24oY29tcGlsZXJJbmZvKSB7XG4gIHZhciBjb21waWxlclJldmlzaW9uID0gY29tcGlsZXJJbmZvICYmIGNvbXBpbGVySW5mb1swXSB8fCAxLFxuICAgICAgY3VycmVudFJldmlzaW9uID0gQ09NUElMRVJfUkVWSVNJT047XG5cbiAgaWYgKGNvbXBpbGVyUmV2aXNpb24gIT09IGN1cnJlbnRSZXZpc2lvbikge1xuICAgIGlmIChjb21waWxlclJldmlzaW9uIDwgY3VycmVudFJldmlzaW9uKSB7XG4gICAgICB2YXIgcnVudGltZVZlcnNpb25zID0gUkVWSVNJT05fQ0hBTkdFU1tjdXJyZW50UmV2aXNpb25dLFxuICAgICAgICAgIGNvbXBpbGVyVmVyc2lvbnMgPSBSRVZJU0lPTl9DSEFOR0VTW2NvbXBpbGVyUmV2aXNpb25dO1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbihcIlRlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGFuIG9sZGVyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuIFwiK1xuICAgICAgICAgICAgXCJQbGVhc2UgdXBkYXRlIHlvdXIgcHJlY29tcGlsZXIgdG8gYSBuZXdlciB2ZXJzaW9uIChcIitydW50aW1lVmVyc2lvbnMrXCIpIG9yIGRvd25ncmFkZSB5b3VyIHJ1bnRpbWUgdG8gYW4gb2xkZXIgdmVyc2lvbiAoXCIrY29tcGlsZXJWZXJzaW9ucytcIikuXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBVc2UgdGhlIGVtYmVkZGVkIHZlcnNpb24gaW5mbyBzaW5jZSB0aGUgcnVudGltZSBkb2Vzbid0IGtub3cgYWJvdXQgdGhpcyByZXZpc2lvbiB5ZXRcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oXCJUZW1wbGF0ZSB3YXMgcHJlY29tcGlsZWQgd2l0aCBhIG5ld2VyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuIFwiK1xuICAgICAgICAgICAgXCJQbGVhc2UgdXBkYXRlIHlvdXIgcnVudGltZSB0byBhIG5ld2VyIHZlcnNpb24gKFwiK2NvbXBpbGVySW5mb1sxXStcIikuXCIpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnRzLmNoZWNrUmV2aXNpb24gPSBjaGVja1JldmlzaW9uOy8vIFRPRE86IFJlbW92ZSB0aGlzIGxpbmUgYW5kIGJyZWFrIHVwIGNvbXBpbGVQYXJ0aWFsXG5cbmZ1bmN0aW9uIHRlbXBsYXRlKHRlbXBsYXRlU3BlYywgZW52KSB7XG4gIGlmICghZW52KSB7XG4gICAgdGhyb3cgbmV3IEV4Y2VwdGlvbihcIk5vIGVudmlyb25tZW50IHBhc3NlZCB0byB0ZW1wbGF0ZVwiKTtcbiAgfVxuXG4gIC8vIE5vdGU6IFVzaW5nIGVudi5WTSByZWZlcmVuY2VzIHJhdGhlciB0aGFuIGxvY2FsIHZhciByZWZlcmVuY2VzIHRocm91Z2hvdXQgdGhpcyBzZWN0aW9uIHRvIGFsbG93XG4gIC8vIGZvciBleHRlcm5hbCB1c2VycyB0byBvdmVycmlkZSB0aGVzZSBhcyBwc3VlZG8tc3VwcG9ydGVkIEFQSXMuXG4gIHZhciBpbnZva2VQYXJ0aWFsV3JhcHBlciA9IGZ1bmN0aW9uKHBhcnRpYWwsIG5hbWUsIGNvbnRleHQsIGhlbHBlcnMsIHBhcnRpYWxzLCBkYXRhKSB7XG4gICAgdmFyIHJlc3VsdCA9IGVudi5WTS5pbnZva2VQYXJ0aWFsLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKHJlc3VsdCAhPSBudWxsKSB7IHJldHVybiByZXN1bHQ7IH1cblxuICAgIGlmIChlbnYuY29tcGlsZSkge1xuICAgICAgdmFyIG9wdGlvbnMgPSB7IGhlbHBlcnM6IGhlbHBlcnMsIHBhcnRpYWxzOiBwYXJ0aWFscywgZGF0YTogZGF0YSB9O1xuICAgICAgcGFydGlhbHNbbmFtZV0gPSBlbnYuY29tcGlsZShwYXJ0aWFsLCB7IGRhdGE6IGRhdGEgIT09IHVuZGVmaW5lZCB9LCBlbnYpO1xuICAgICAgcmV0dXJuIHBhcnRpYWxzW25hbWVdKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKFwiVGhlIHBhcnRpYWwgXCIgKyBuYW1lICsgXCIgY291bGQgbm90IGJlIGNvbXBpbGVkIHdoZW4gcnVubmluZyBpbiBydW50aW1lLW9ubHkgbW9kZVwiKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gSnVzdCBhZGQgd2F0ZXJcbiAgdmFyIGNvbnRhaW5lciA9IHtcbiAgICBlc2NhcGVFeHByZXNzaW9uOiBVdGlscy5lc2NhcGVFeHByZXNzaW9uLFxuICAgIGludm9rZVBhcnRpYWw6IGludm9rZVBhcnRpYWxXcmFwcGVyLFxuICAgIHByb2dyYW1zOiBbXSxcbiAgICBwcm9ncmFtOiBmdW5jdGlvbihpLCBmbiwgZGF0YSkge1xuICAgICAgdmFyIHByb2dyYW1XcmFwcGVyID0gdGhpcy5wcm9ncmFtc1tpXTtcbiAgICAgIGlmKGRhdGEpIHtcbiAgICAgICAgcHJvZ3JhbVdyYXBwZXIgPSBwcm9ncmFtKGksIGZuLCBkYXRhKTtcbiAgICAgIH0gZWxzZSBpZiAoIXByb2dyYW1XcmFwcGVyKSB7XG4gICAgICAgIHByb2dyYW1XcmFwcGVyID0gdGhpcy5wcm9ncmFtc1tpXSA9IHByb2dyYW0oaSwgZm4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb2dyYW1XcmFwcGVyO1xuICAgIH0sXG4gICAgbWVyZ2U6IGZ1bmN0aW9uKHBhcmFtLCBjb21tb24pIHtcbiAgICAgIHZhciByZXQgPSBwYXJhbSB8fCBjb21tb247XG5cbiAgICAgIGlmIChwYXJhbSAmJiBjb21tb24gJiYgKHBhcmFtICE9PSBjb21tb24pKSB7XG4gICAgICAgIHJldCA9IHt9O1xuICAgICAgICBVdGlscy5leHRlbmQocmV0LCBjb21tb24pO1xuICAgICAgICBVdGlscy5leHRlbmQocmV0LCBwYXJhbSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH0sXG4gICAgcHJvZ3JhbVdpdGhEZXB0aDogZW52LlZNLnByb2dyYW1XaXRoRGVwdGgsXG4gICAgbm9vcDogZW52LlZNLm5vb3AsXG4gICAgY29tcGlsZXJJbmZvOiBudWxsXG4gIH07XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB2YXIgbmFtZXNwYWNlID0gb3B0aW9ucy5wYXJ0aWFsID8gb3B0aW9ucyA6IGVudixcbiAgICAgICAgaGVscGVycyxcbiAgICAgICAgcGFydGlhbHM7XG5cbiAgICBpZiAoIW9wdGlvbnMucGFydGlhbCkge1xuICAgICAgaGVscGVycyA9IG9wdGlvbnMuaGVscGVycztcbiAgICAgIHBhcnRpYWxzID0gb3B0aW9ucy5wYXJ0aWFscztcbiAgICB9XG4gICAgdmFyIHJlc3VsdCA9IHRlbXBsYXRlU3BlYy5jYWxsKFxuICAgICAgICAgIGNvbnRhaW5lcixcbiAgICAgICAgICBuYW1lc3BhY2UsIGNvbnRleHQsXG4gICAgICAgICAgaGVscGVycyxcbiAgICAgICAgICBwYXJ0aWFscyxcbiAgICAgICAgICBvcHRpb25zLmRhdGEpO1xuXG4gICAgaWYgKCFvcHRpb25zLnBhcnRpYWwpIHtcbiAgICAgIGVudi5WTS5jaGVja1JldmlzaW9uKGNvbnRhaW5lci5jb21waWxlckluZm8pO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59XG5cbmV4cG9ydHMudGVtcGxhdGUgPSB0ZW1wbGF0ZTtmdW5jdGlvbiBwcm9ncmFtV2l0aERlcHRoKGksIGZuLCBkYXRhIC8qLCAkZGVwdGggKi8pIHtcbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDMpO1xuXG4gIHZhciBwcm9nID0gZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIFtjb250ZXh0LCBvcHRpb25zLmRhdGEgfHwgZGF0YV0uY29uY2F0KGFyZ3MpKTtcbiAgfTtcbiAgcHJvZy5wcm9ncmFtID0gaTtcbiAgcHJvZy5kZXB0aCA9IGFyZ3MubGVuZ3RoO1xuICByZXR1cm4gcHJvZztcbn1cblxuZXhwb3J0cy5wcm9ncmFtV2l0aERlcHRoID0gcHJvZ3JhbVdpdGhEZXB0aDtmdW5jdGlvbiBwcm9ncmFtKGksIGZuLCBkYXRhKSB7XG4gIHZhciBwcm9nID0gZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgcmV0dXJuIGZuKGNvbnRleHQsIG9wdGlvbnMuZGF0YSB8fCBkYXRhKTtcbiAgfTtcbiAgcHJvZy5wcm9ncmFtID0gaTtcbiAgcHJvZy5kZXB0aCA9IDA7XG4gIHJldHVybiBwcm9nO1xufVxuXG5leHBvcnRzLnByb2dyYW0gPSBwcm9ncmFtO2Z1bmN0aW9uIGludm9rZVBhcnRpYWwocGFydGlhbCwgbmFtZSwgY29udGV4dCwgaGVscGVycywgcGFydGlhbHMsIGRhdGEpIHtcbiAgdmFyIG9wdGlvbnMgPSB7IHBhcnRpYWw6IHRydWUsIGhlbHBlcnM6IGhlbHBlcnMsIHBhcnRpYWxzOiBwYXJ0aWFscywgZGF0YTogZGF0YSB9O1xuXG4gIGlmKHBhcnRpYWwgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFeGNlcHRpb24oXCJUaGUgcGFydGlhbCBcIiArIG5hbWUgKyBcIiBjb3VsZCBub3QgYmUgZm91bmRcIik7XG4gIH0gZWxzZSBpZihwYXJ0aWFsIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICByZXR1cm4gcGFydGlhbChjb250ZXh0LCBvcHRpb25zKTtcbiAgfVxufVxuXG5leHBvcnRzLmludm9rZVBhcnRpYWwgPSBpbnZva2VQYXJ0aWFsO2Z1bmN0aW9uIG5vb3AoKSB7IHJldHVybiBcIlwiOyB9XG5cbmV4cG9ydHMubm9vcCA9IG5vb3A7IiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBCdWlsZCBvdXQgb3VyIGJhc2ljIFNhZmVTdHJpbmcgdHlwZVxuZnVuY3Rpb24gU2FmZVN0cmluZyhzdHJpbmcpIHtcbiAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG59XG5cblNhZmVTdHJpbmcucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBcIlwiICsgdGhpcy5zdHJpbmc7XG59O1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IFNhZmVTdHJpbmc7IiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKmpzaGludCAtVzAwNCAqL1xudmFyIFNhZmVTdHJpbmcgPSByZXF1aXJlKFwiLi9zYWZlLXN0cmluZ1wiKVtcImRlZmF1bHRcIl07XG5cbnZhciBlc2NhcGUgPSB7XG4gIFwiJlwiOiBcIiZhbXA7XCIsXG4gIFwiPFwiOiBcIiZsdDtcIixcbiAgXCI+XCI6IFwiJmd0O1wiLFxuICAnXCInOiBcIiZxdW90O1wiLFxuICBcIidcIjogXCImI3gyNztcIixcbiAgXCJgXCI6IFwiJiN4NjA7XCJcbn07XG5cbnZhciBiYWRDaGFycyA9IC9bJjw+XCInYF0vZztcbnZhciBwb3NzaWJsZSA9IC9bJjw+XCInYF0vO1xuXG5mdW5jdGlvbiBlc2NhcGVDaGFyKGNocikge1xuICByZXR1cm4gZXNjYXBlW2Nocl0gfHwgXCImYW1wO1wiO1xufVxuXG5mdW5jdGlvbiBleHRlbmQob2JqLCB2YWx1ZSkge1xuICBmb3IodmFyIGtleSBpbiB2YWx1ZSkge1xuICAgIGlmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwga2V5KSkge1xuICAgICAgb2JqW2tleV0gPSB2YWx1ZVtrZXldO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnRzLmV4dGVuZCA9IGV4dGVuZDt2YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuZXhwb3J0cy50b1N0cmluZyA9IHRvU3RyaW5nO1xuLy8gU291cmNlZCBmcm9tIGxvZGFzaFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2Jlc3RpZWpzL2xvZGFzaC9ibG9iL21hc3Rlci9MSUNFTlNFLnR4dFxudmFyIGlzRnVuY3Rpb24gPSBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nO1xufTtcbi8vIGZhbGxiYWNrIGZvciBvbGRlciB2ZXJzaW9ucyBvZiBDaHJvbWUgYW5kIFNhZmFyaVxuaWYgKGlzRnVuY3Rpb24oL3gvKSkge1xuICBpc0Z1bmN0aW9uID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nICYmIHRvU3RyaW5nLmNhbGwodmFsdWUpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xuICB9O1xufVxudmFyIGlzRnVuY3Rpb247XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JykgPyB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJyYXldJyA6IGZhbHNlO1xufTtcbmV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGVzY2FwZUV4cHJlc3Npb24oc3RyaW5nKSB7XG4gIC8vIGRvbid0IGVzY2FwZSBTYWZlU3RyaW5ncywgc2luY2UgdGhleSdyZSBhbHJlYWR5IHNhZmVcbiAgaWYgKHN0cmluZyBpbnN0YW5jZW9mIFNhZmVTdHJpbmcpIHtcbiAgICByZXR1cm4gc3RyaW5nLnRvU3RyaW5nKCk7XG4gIH0gZWxzZSBpZiAoIXN0cmluZyAmJiBzdHJpbmcgIT09IDApIHtcbiAgICByZXR1cm4gXCJcIjtcbiAgfVxuXG4gIC8vIEZvcmNlIGEgc3RyaW5nIGNvbnZlcnNpb24gYXMgdGhpcyB3aWxsIGJlIGRvbmUgYnkgdGhlIGFwcGVuZCByZWdhcmRsZXNzIGFuZFxuICAvLyB0aGUgcmVnZXggdGVzdCB3aWxsIGRvIHRoaXMgdHJhbnNwYXJlbnRseSBiZWhpbmQgdGhlIHNjZW5lcywgY2F1c2luZyBpc3N1ZXMgaWZcbiAgLy8gYW4gb2JqZWN0J3MgdG8gc3RyaW5nIGhhcyBlc2NhcGVkIGNoYXJhY3RlcnMgaW4gaXQuXG4gIHN0cmluZyA9IFwiXCIgKyBzdHJpbmc7XG5cbiAgaWYoIXBvc3NpYmxlLnRlc3Qoc3RyaW5nKSkgeyByZXR1cm4gc3RyaW5nOyB9XG4gIHJldHVybiBzdHJpbmcucmVwbGFjZShiYWRDaGFycywgZXNjYXBlQ2hhcik7XG59XG5cbmV4cG9ydHMuZXNjYXBlRXhwcmVzc2lvbiA9IGVzY2FwZUV4cHJlc3Npb247ZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSkge1xuICBpZiAoIXZhbHVlICYmIHZhbHVlICE9PSAwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSBpZiAoaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmV4cG9ydHMuaXNFbXB0eSA9IGlzRW1wdHk7IiwiLy8gQ3JlYXRlIGEgc2ltcGxlIHBhdGggYWxpYXMgdG8gYWxsb3cgYnJvd3NlcmlmeSB0byByZXNvbHZlXG4vLyB0aGUgcnVudGltZSBvbiBhIHN1cHBvcnRlZCBwYXRoLlxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Rpc3QvY2pzL2hhbmRsZWJhcnMucnVudGltZScpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiaGFuZGxlYmFycy9ydW50aW1lXCIpW1wiZGVmYXVsdFwiXTtcbiJdfQ==
