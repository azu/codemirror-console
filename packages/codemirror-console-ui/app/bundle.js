(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// hbsfy compiled Handlebars template
var Handlebars = require('hbsfy/runtime');
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class=\"mirror-console-command\">\n    <button id=\"mirror-console-run-button\">実行</button>\n    <button id=\"mirror-console-clear-button\">クリア</button>\n</div>\n<div class=\"mirror-console-log\">\n</div>";
  });

},{"hbsfy/runtime":16}],2:[function(require,module,exports){
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
},{"./mirror-console-component.hbs":1,"codemirror-console":4}],3:[function(require,module,exports){
"use strict";
var component = require("./components/mirror-console-component");
var content = document.querySelector(".content");
component(content);
},{"./components/mirror-console-component":2}],4:[function(require,module,exports){
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
},{"codemirror":7,"codemirror/mode/javascript/javascript":8,"context-eval":5}],5:[function(require,module,exports){
if (!(typeof window !== "undefined" && window !== null)) {
  // Will do this dance so the require isn't parsed for browserify etc.
  var moduleName = './lib/context-node';
  module.exports = require(moduleName);
} else {
  module.exports = require('./lib/context-browser');
}

},{"./lib/context-browser":6}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{"../../lib/codemirror":7}],9:[function(require,module,exports){
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
},{"./handlebars/base":10,"./handlebars/exception":11,"./handlebars/runtime":12,"./handlebars/safe-string":13,"./handlebars/utils":14}],10:[function(require,module,exports){
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
},{"./exception":11,"./utils":14}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
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
},{"./base":10,"./exception":11,"./utils":14}],13:[function(require,module,exports){
"use strict";
// Build out our basic SafeString type
function SafeString(string) {
  this.string = string;
}

SafeString.prototype.toString = function() {
  return "" + this.string;
};

exports["default"] = SafeString;
},{}],14:[function(require,module,exports){
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
},{"./safe-string":13}],15:[function(require,module,exports){
// Create a simple path alias to allow browserify to resolve
// the runtime on a supported path.
module.exports = require('./dist/cjs/handlebars.runtime');

},{"./dist/cjs/handlebars.runtime":9}],16:[function(require,module,exports){
module.exports = require("handlebars/runtime")["default"];

},{"handlebars/runtime":15}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYXp1Ly5ub2RlYnJldy9ub2RlL3YwLjEwLjI4L2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9henUvRHJvcGJveC93b3Jrc3BhY2UvSmF2YVNjcmlwdC9jb2RlbWlycm9yLWNvbnNvbGUtdWkvY29tcG9uZW50cy9taXJyb3ItY29uc29sZS1jb21wb25lbnQuaGJzIiwiL1VzZXJzL2F6dS9Ecm9wYm94L3dvcmtzcGFjZS9KYXZhU2NyaXB0L2NvZGVtaXJyb3ItY29uc29sZS11aS9jb21wb25lbnRzL21pcnJvci1jb25zb2xlLWNvbXBvbmVudC5qcyIsIi9Vc2Vycy9henUvRHJvcGJveC93b3Jrc3BhY2UvSmF2YVNjcmlwdC9jb2RlbWlycm9yLWNvbnNvbGUtdWkvaW5kZXguanMiLCIvVXNlcnMvYXp1L0Ryb3Bib3gvd29ya3NwYWNlL0phdmFTY3JpcHQvY29kZW1pcnJvci1jb25zb2xlLXVpL25vZGVfbW9kdWxlcy9jb2RlbWlycm9yLWNvbnNvbGUvbGliL21pcnJvci1jb25zb2xlLmpzIiwiL1VzZXJzL2F6dS9Ecm9wYm94L3dvcmtzcGFjZS9KYXZhU2NyaXB0L2NvZGVtaXJyb3ItY29uc29sZS11aS9ub2RlX21vZHVsZXMvY29kZW1pcnJvci1jb25zb2xlL25vZGVfbW9kdWxlcy9jb250ZXh0LWV2YWwvaW5kZXguanMiLCIvVXNlcnMvYXp1L0Ryb3Bib3gvd29ya3NwYWNlL0phdmFTY3JpcHQvY29kZW1pcnJvci1jb25zb2xlLXVpL25vZGVfbW9kdWxlcy9jb2RlbWlycm9yLWNvbnNvbGUvbm9kZV9tb2R1bGVzL2NvbnRleHQtZXZhbC9saWIvY29udGV4dC1icm93c2VyLmpzIiwiL1VzZXJzL2F6dS9Ecm9wYm94L3dvcmtzcGFjZS9KYXZhU2NyaXB0L2NvZGVtaXJyb3ItY29uc29sZS11aS9ub2RlX21vZHVsZXMvY29kZW1pcnJvci9saWIvY29kZW1pcnJvci5qcyIsIi9Vc2Vycy9henUvRHJvcGJveC93b3Jrc3BhY2UvSmF2YVNjcmlwdC9jb2RlbWlycm9yLWNvbnNvbGUtdWkvbm9kZV9tb2R1bGVzL2NvZGVtaXJyb3IvbW9kZS9qYXZhc2NyaXB0L2phdmFzY3JpcHQuanMiLCIvVXNlcnMvYXp1L0Ryb3Bib3gvd29ya3NwYWNlL0phdmFTY3JpcHQvY29kZW1pcnJvci1jb25zb2xlLXVpL25vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMucnVudGltZS5qcyIsIi9Vc2Vycy9henUvRHJvcGJveC93b3Jrc3BhY2UvSmF2YVNjcmlwdC9jb2RlbWlycm9yLWNvbnNvbGUtdWkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvZGlzdC9janMvaGFuZGxlYmFycy9iYXNlLmpzIiwiL1VzZXJzL2F6dS9Ecm9wYm94L3dvcmtzcGFjZS9KYXZhU2NyaXB0L2NvZGVtaXJyb3ItY29uc29sZS11aS9ub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2V4Y2VwdGlvbi5qcyIsIi9Vc2Vycy9henUvRHJvcGJveC93b3Jrc3BhY2UvSmF2YVNjcmlwdC9jb2RlbWlycm9yLWNvbnNvbGUtdWkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvZGlzdC9janMvaGFuZGxlYmFycy9ydW50aW1lLmpzIiwiL1VzZXJzL2F6dS9Ecm9wYm94L3dvcmtzcGFjZS9KYXZhU2NyaXB0L2NvZGVtaXJyb3ItY29uc29sZS11aS9ub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3NhZmUtc3RyaW5nLmpzIiwiL1VzZXJzL2F6dS9Ecm9wYm94L3dvcmtzcGFjZS9KYXZhU2NyaXB0L2NvZGVtaXJyb3ItY29uc29sZS11aS9ub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3V0aWxzLmpzIiwiL1VzZXJzL2F6dS9Ecm9wYm94L3dvcmtzcGFjZS9KYXZhU2NyaXB0L2NvZGVtaXJyb3ItY29uc29sZS11aS9ub2RlX21vZHVsZXMvaGFuZGxlYmFycy9ydW50aW1lLmpzIiwiL1VzZXJzL2F6dS9Ecm9wYm94L3dvcmtzcGFjZS9KYXZhU2NyaXB0L2NvZGVtaXJyb3ItY29uc29sZS11aS9ub2RlX21vZHVsZXMvaGJzZnkvcnVudGltZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqN09BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25MQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnMgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwibWlycm9yLWNvbnNvbGUtY29tbWFuZFxcXCI+XFxuICAgIDxidXR0b24gaWQ9XFxcIm1pcnJvci1jb25zb2xlLXJ1bi1idXR0b25cXFwiPuWun+ihjDwvYnV0dG9uPlxcbiAgICA8YnV0dG9uIGlkPVxcXCJtaXJyb3ItY29uc29sZS1jbGVhci1idXR0b25cXFwiPuOCr+ODquOCojwvYnV0dG9uPlxcbjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcIm1pcnJvci1jb25zb2xlLWxvZ1xcXCI+XFxuPC9kaXY+XCI7XG4gIH0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgTWlycm9yQ29uc29sZSA9IHJlcXVpcmUoXCJjb2RlbWlycm9yLWNvbnNvbGVcIik7XG5mdW5jdGlvbiBjcmVhdGVDb25zb2xlKCkge1xuICAgIHZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoXCIuL21pcnJvci1jb25zb2xlLWNvbXBvbmVudC5oYnNcIik7XG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgZGl2LmlubmVySFRNTCA9IHRlbXBsYXRlKCk7XG4gICAgcmV0dXJuIGRpdjtcbn1cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICB2YXIgbWlycm9yID0gbmV3IE1pcnJvckNvbnNvbGU7XG4gICAgbWlycm9yLnNldFRleHQoZWxlbWVudC50ZXh0Q29udGVudCk7XG4gICAgdmFyIG5vZGUgPSBjcmVhdGVDb25zb2xlKCk7XG4gICAgdmFyIGNvbnNvbGVNb2NrID0ge1xuICAgICAgICBsb2c6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHZhciBsb2dBcmVhID0gbm9kZS5xdWVyeVNlbGVjdG9yKFwiLm1pcnJvci1jb25zb2xlLWxvZ1wiKTtcbiAgICAgICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgZGl2LmNsYXNzTmFtZSA9IFwibWlycm9yLWNvbnNvbGUtbG9nLXJvd1wiXG4gICAgICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYXJncy5qb2luKFwiLFwiKSkpO1xuICAgICAgICAgICAgbG9nQXJlYS5hcHBlbmRDaGlsZChkaXYpO1xuICAgICAgICB9XG4gICAgfVxuICAgIG1pcnJvci5zd2FwV2l0aEVsZW1lbnQoZWxlbWVudCk7XG4gICAgbWlycm9yLnRleHRhcmVhSG9sZGVyLmFwcGVuZENoaWxkKG5vZGUpO1xuICAgIG5vZGUucXVlcnlTZWxlY3RvcihcIiNtaXJyb3ItY29uc29sZS1ydW4tYnV0dG9uXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiBydW5KUygpIHtcbiAgICAgICAgbWlycm9yLnJ1bkluQ29udGV4dCh7IGNvbnNvbGU6IGNvbnNvbGVNb2NrIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIG5vZGUucXVlcnlTZWxlY3RvcihcIiNtaXJyb3ItY29uc29sZS1jbGVhci1idXR0b25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uIGNsZWFyTG9nKCkge1xuICAgICAgICB2YXIgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICAgICAgICByYW5nZS5zZWxlY3ROb2RlQ29udGVudHMobm9kZS5xdWVyeVNlbGVjdG9yKFwiLm1pcnJvci1jb25zb2xlLWxvZ1wiKSk7XG4gICAgICAgIHJhbmdlLmRlbGV0ZUNvbnRlbnRzKCk7XG4gICAgfSk7XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgY29tcG9uZW50ID0gcmVxdWlyZShcIi4vY29tcG9uZW50cy9taXJyb3ItY29uc29sZS1jb21wb25lbnRcIik7XG52YXIgY29udGVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKTtcbmNvbXBvbmVudChjb250ZW50KTsiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBFdmFsQ29udGV4dCA9IHJlcXVpcmUoXCJjb250ZXh0LWV2YWxcIik7XG52YXIgQ29kZU1pcnJvciA9IHJlcXVpcmUoXCJjb2RlbWlycm9yXCIpO1xucmVxdWlyZSgnY29kZW1pcnJvci9tb2RlL2phdmFzY3JpcHQvamF2YXNjcmlwdCcpO1xuZnVuY3Rpb24gTWlycm9yQ29uc29sZSgpIHtcbiAgICB0aGlzLmVkaXRvciA9IHRoaXMuY3JlYXRlRWRpdG9yKCk7XG59XG5NaXJyb3JDb25zb2xlLnByb3RvdHlwZS5jcmVhdGVFZGl0b3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy50ZXh0YXJlYUhvbGRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgdGhpcy50ZXh0YXJlYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0ZXh0YXJlYVwiKTtcbiAgICB0aGlzLnRleHRhcmVhSG9sZGVyLmFwcGVuZENoaWxkKHRoaXMudGV4dGFyZWEpO1xuICAgIHJldHVybiBDb2RlTWlycm9yLmZyb21UZXh0QXJlYSh0aGlzLnRleHRhcmVhKTtcbn1cbk1pcnJvckNvbnNvbGUucHJvdG90eXBlLnNldFRleHQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB0aGlzLmVkaXRvci5zZXRWYWx1ZSh2YWx1ZSk7XG59XG5NaXJyb3JDb25zb2xlLnByb3RvdHlwZS5nZXRUZXh0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLmdldFZhbHVlKCk7XG59XG5NaXJyb3JDb25zb2xlLnByb3RvdHlwZS5zd2FwV2l0aEVsZW1lbnQgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIHRoaXMub3JpZ2luYWxFbGVtZW5ldCA9IGVsZW1lbnQ7XG4gICAgZWxlbWVudC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZCh0aGlzLnRleHRhcmVhSG9sZGVyLCBlbGVtZW50KVxuICAgIHRoaXMuZWRpdG9yLnJlZnJlc2goKTtcbn1cbk1pcnJvckNvbnNvbGUucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGlmICh0aGlzLm9yaWdpbmFsRWxlbWVuZXQgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJIYXZlbid0IGBvcmlnaW5hbEVsZW1lbmV0YCA6IFlvdSBoYXZlIHRvIGNhbGwgI3N3YXBXaXRoRWxlbWVudCBiZWZvcmUgY2FsbCB0aGlzXCIpO1xuICAgIH1cbiAgICB0aGlzLnRleHRhcmVhSG9sZGVyLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHRoaXMub3JpZ2luYWxFbGVtZW5ldCwgdGhpcy50ZXh0YXJlYUhvbGRlcik7XG4gICAgdGhpcy5vcmlnaW5hbEVsZW1lbmV0ID0gbnVsbDtcbiAgICB0aGlzLnRleHRhcmVhID0gbnVsbDtcbiAgICB0aGlzLnRleHRhcmVhSG9sZGVyID0gbnVsbDtcbiAgICB0aGlzLmVkaXRvciA9IG51bGw7XG4gICAgaWYgKHRoaXMuZXZhbENvbnRleHQpIHtcbiAgICAgICAgdGhpcy5ldmFsQ29udGV4dC5kZXN0cm95KCk7XG4gICAgfVxuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG59XG5NaXJyb3JDb25zb2xlLnByb3RvdHlwZS5ydW5JbkNvbnRleHQgPSBmdW5jdGlvbiAoY29udGV4dCwgY2FsbGJhY2spIHtcbiAgICBpZiAodGhpcy5ldmFsQ29udGV4dCkge1xuICAgICAgICB0aGlzLmV2YWxDb250ZXh0LmRlc3Ryb3koKTtcbiAgICB9XG4gICAgdGhpcy5ldmFsQ29udGV4dCA9IG5ldyBFdmFsQ29udGV4dChjb250ZXh0LCB0aGlzLnRleHRhcmVhSG9sZGVyKTtcbiAgICB2YXIganNDb2RlID0gdGhpcy5lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICB2YXIgcmVzO1xuICAgIHRyeSB7XG4gICAgICAgIHJlcyA9IHRoaXMuZXZhbENvbnRleHQuZXZhbHVhdGUoanNDb2RlKTtcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjYWxsYmFjayhlcnJvciwgcmVzKTtcbiAgICB9XG5cbn1cbm1vZHVsZS5leHBvcnRzID0gTWlycm9yQ29uc29sZTsiLCJpZiAoISh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIHdpbmRvdyAhPT0gbnVsbCkpIHtcbiAgLy8gV2lsbCBkbyB0aGlzIGRhbmNlIHNvIHRoZSByZXF1aXJlIGlzbid0IHBhcnNlZCBmb3IgYnJvd3NlcmlmeSBldGMuXG4gIHZhciBtb2R1bGVOYW1lID0gJy4vbGliL2NvbnRleHQtbm9kZSc7XG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShtb2R1bGVOYW1lKTtcbn0gZWxzZSB7XG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvY29udGV4dC1icm93c2VyJyk7XG59XG4iLCJmdW5jdGlvbiBDb250ZXh0KHNhbmRib3gsIHBhcmVudEVsZW1lbnQpIHtcbiAgdGhpcy5pZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcbiAgdGhpcy5pZnJhbWUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgcGFyZW50RWxlbWVudCA9IHBhcmVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcbiAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmlmcmFtZSk7XG4gIHZhciB3aW4gPSB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93O1xuICBzYW5kYm94ID0gc2FuZGJveCB8fCB7fTtcbiAgT2JqZWN0LmtleXMoc2FuZGJveCkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgd2luW2tleV0gPSBzYW5kYm94W2tleV07XG4gIH0pO1xufVxuXG5Db250ZXh0LnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uIChjb2RlKSB7XG4gIHJldHVybiB0aGlzLmlmcmFtZS5jb250ZW50V2luZG93LmV2YWwoY29kZSk7XG59O1xuXG5Db250ZXh0LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5pZnJhbWUpIHtcbiAgICB0aGlzLmlmcmFtZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuaWZyYW1lKTtcbiAgICB0aGlzLmlmcmFtZSA9IG51bGw7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ29udGV4dDsiLCIvLyBDb2RlTWlycm9yLCBjb3B5cmlnaHQgKGMpIGJ5IE1hcmlqbiBIYXZlcmJla2UgYW5kIG90aGVyc1xuLy8gRGlzdHJpYnV0ZWQgdW5kZXIgYW4gTUlUIGxpY2Vuc2U6IGh0dHA6Ly9jb2RlbWlycm9yLm5ldC9MSUNFTlNFXG5cbi8vIFRoaXMgaXMgQ29kZU1pcnJvciAoaHR0cDovL2NvZGVtaXJyb3IubmV0KSwgYSBjb2RlIGVkaXRvclxuLy8gaW1wbGVtZW50ZWQgaW4gSmF2YVNjcmlwdCBvbiB0b3Agb2YgdGhlIGJyb3dzZXIncyBET00uXG4vL1xuLy8gWW91IGNhbiBmaW5kIHNvbWUgdGVjaG5pY2FsIGJhY2tncm91bmQgZm9yIHNvbWUgb2YgdGhlIGNvZGUgYmVsb3dcbi8vIGF0IGh0dHA6Ly9tYXJpam5oYXZlcmJla2UubmwvYmxvZy8jY20taW50ZXJuYWxzIC5cblxuKGZ1bmN0aW9uKG1vZCkge1xuICBpZiAodHlwZW9mIGV4cG9ydHMgPT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlID09IFwib2JqZWN0XCIpIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBtb2QoKTtcbiAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkgLy8gQU1EXG4gICAgcmV0dXJuIGRlZmluZShbXSwgbW9kKTtcbiAgZWxzZSAvLyBQbGFpbiBicm93c2VyIGVudlxuICAgIHRoaXMuQ29kZU1pcnJvciA9IG1vZCgpO1xufSkoZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIEJST1dTRVIgU05JRkZJTkdcblxuICAvLyBLbHVkZ2VzIGZvciBidWdzIGFuZCBiZWhhdmlvciBkaWZmZXJlbmNlcyB0aGF0IGNhbid0IGJlIGZlYXR1cmVcbiAgLy8gZGV0ZWN0ZWQgYXJlIGVuYWJsZWQgYmFzZWQgb24gdXNlckFnZW50IGV0YyBzbmlmZmluZy5cblxuICB2YXIgZ2Vja28gPSAvZ2Vja29cXC9cXGQvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICAvLyBpZV91cHRvTiBtZWFucyBJbnRlcm5ldCBFeHBsb3JlciB2ZXJzaW9uIE4gb3IgbG93ZXJcbiAgdmFyIGllX3VwdG8xMCA9IC9NU0lFIFxcZC8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgdmFyIGllX3VwdG83ID0gaWVfdXB0bzEwICYmIChkb2N1bWVudC5kb2N1bWVudE1vZGUgPT0gbnVsbCB8fCBkb2N1bWVudC5kb2N1bWVudE1vZGUgPCA4KTtcbiAgdmFyIGllX3VwdG84ID0gaWVfdXB0bzEwICYmIChkb2N1bWVudC5kb2N1bWVudE1vZGUgPT0gbnVsbCB8fCBkb2N1bWVudC5kb2N1bWVudE1vZGUgPCA5KTtcbiAgdmFyIGllX3VwdG85ID0gaWVfdXB0bzEwICYmIChkb2N1bWVudC5kb2N1bWVudE1vZGUgPT0gbnVsbCB8fCBkb2N1bWVudC5kb2N1bWVudE1vZGUgPCAxMCk7XG4gIHZhciBpZV8xMXVwID0gL1RyaWRlbnRcXC8oWzctOV18XFxkezIsfSlcXC4vLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gIHZhciBpZSA9IGllX3VwdG8xMCB8fCBpZV8xMXVwO1xuICB2YXIgd2Via2l0ID0gL1dlYktpdFxcLy8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgdmFyIHF0d2Via2l0ID0gd2Via2l0ICYmIC9RdFxcL1xcZCtcXC5cXGQrLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICB2YXIgY2hyb21lID0gL0Nocm9tZVxcLy8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgdmFyIHByZXN0byA9IC9PcGVyYVxcLy8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgdmFyIHNhZmFyaSA9IC9BcHBsZSBDb21wdXRlci8udGVzdChuYXZpZ2F0b3IudmVuZG9yKTtcbiAgdmFyIGtodG1sID0gL0tIVE1MXFwvLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICB2YXIgbWFjX2dlTW91bnRhaW5MaW9uID0gL01hYyBPUyBYIDFcXGRcXEQoWzgtOV18XFxkXFxkKVxcRC8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgdmFyIHBoYW50b20gPSAvUGhhbnRvbUpTLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuXG4gIHZhciBpb3MgPSAvQXBwbGVXZWJLaXQvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgJiYgL01vYmlsZVxcL1xcdysvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gIC8vIFRoaXMgaXMgd29lZnVsbHkgaW5jb21wbGV0ZS4gU3VnZ2VzdGlvbnMgZm9yIGFsdGVybmF0aXZlIG1ldGhvZHMgd2VsY29tZS5cbiAgdmFyIG1vYmlsZSA9IGlvcyB8fCAvQW5kcm9pZHx3ZWJPU3xCbGFja0JlcnJ5fE9wZXJhIE1pbml8T3BlcmEgTW9iaXxJRU1vYmlsZS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gIHZhciBtYWMgPSBpb3MgfHwgL01hYy8udGVzdChuYXZpZ2F0b3IucGxhdGZvcm0pO1xuICB2YXIgd2luZG93cyA9IC93aW4vaS50ZXN0KG5hdmlnYXRvci5wbGF0Zm9ybSk7XG5cbiAgdmFyIHByZXN0b192ZXJzaW9uID0gcHJlc3RvICYmIG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL1ZlcnNpb25cXC8oXFxkKlxcLlxcZCopLyk7XG4gIGlmIChwcmVzdG9fdmVyc2lvbikgcHJlc3RvX3ZlcnNpb24gPSBOdW1iZXIocHJlc3RvX3ZlcnNpb25bMV0pO1xuICBpZiAocHJlc3RvX3ZlcnNpb24gJiYgcHJlc3RvX3ZlcnNpb24gPj0gMTUpIHsgcHJlc3RvID0gZmFsc2U7IHdlYmtpdCA9IHRydWU7IH1cbiAgLy8gU29tZSBicm93c2VycyB1c2UgdGhlIHdyb25nIGV2ZW50IHByb3BlcnRpZXMgdG8gc2lnbmFsIGNtZC9jdHJsIG9uIE9TIFhcbiAgdmFyIGZsaXBDdHJsQ21kID0gbWFjICYmIChxdHdlYmtpdCB8fCBwcmVzdG8gJiYgKHByZXN0b192ZXJzaW9uID09IG51bGwgfHwgcHJlc3RvX3ZlcnNpb24gPCAxMi4xMSkpO1xuICB2YXIgY2FwdHVyZVJpZ2h0Q2xpY2sgPSBnZWNrbyB8fCAoaWUgJiYgIWllX3VwdG84KTtcblxuICAvLyBPcHRpbWl6ZSBzb21lIGNvZGUgd2hlbiB0aGVzZSBmZWF0dXJlcyBhcmUgbm90IHVzZWQuXG4gIHZhciBzYXdSZWFkT25seVNwYW5zID0gZmFsc2UsIHNhd0NvbGxhcHNlZFNwYW5zID0gZmFsc2U7XG5cbiAgLy8gRURJVE9SIENPTlNUUlVDVE9SXG5cbiAgLy8gQSBDb2RlTWlycm9yIGluc3RhbmNlIHJlcHJlc2VudHMgYW4gZWRpdG9yLiBUaGlzIGlzIHRoZSBvYmplY3RcbiAgLy8gdGhhdCB1c2VyIGNvZGUgaXMgdXN1YWxseSBkZWFsaW5nIHdpdGguXG5cbiAgZnVuY3Rpb24gQ29kZU1pcnJvcihwbGFjZSwgb3B0aW9ucykge1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBDb2RlTWlycm9yKSkgcmV0dXJuIG5ldyBDb2RlTWlycm9yKHBsYWNlLCBvcHRpb25zKTtcblxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIC8vIERldGVybWluZSBlZmZlY3RpdmUgb3B0aW9ucyBiYXNlZCBvbiBnaXZlbiB2YWx1ZXMgYW5kIGRlZmF1bHRzLlxuICAgIGNvcHlPYmooZGVmYXVsdHMsIG9wdGlvbnMsIGZhbHNlKTtcbiAgICBzZXRHdXR0ZXJzRm9yTGluZU51bWJlcnMob3B0aW9ucyk7XG5cbiAgICB2YXIgZG9jID0gb3B0aW9ucy52YWx1ZTtcbiAgICBpZiAodHlwZW9mIGRvYyA9PSBcInN0cmluZ1wiKSBkb2MgPSBuZXcgRG9jKGRvYywgb3B0aW9ucy5tb2RlKTtcbiAgICB0aGlzLmRvYyA9IGRvYztcblxuICAgIHZhciBkaXNwbGF5ID0gdGhpcy5kaXNwbGF5ID0gbmV3IERpc3BsYXkocGxhY2UsIGRvYyk7XG4gICAgZGlzcGxheS53cmFwcGVyLkNvZGVNaXJyb3IgPSB0aGlzO1xuICAgIHVwZGF0ZUd1dHRlcnModGhpcyk7XG4gICAgdGhlbWVDaGFuZ2VkKHRoaXMpO1xuICAgIGlmIChvcHRpb25zLmxpbmVXcmFwcGluZylcbiAgICAgIHRoaXMuZGlzcGxheS53cmFwcGVyLmNsYXNzTmFtZSArPSBcIiBDb2RlTWlycm9yLXdyYXBcIjtcbiAgICBpZiAob3B0aW9ucy5hdXRvZm9jdXMgJiYgIW1vYmlsZSkgZm9jdXNJbnB1dCh0aGlzKTtcblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBrZXlNYXBzOiBbXSwgIC8vIHN0b3JlcyBtYXBzIGFkZGVkIGJ5IGFkZEtleU1hcFxuICAgICAgb3ZlcmxheXM6IFtdLCAvLyBoaWdobGlnaHRpbmcgb3ZlcmxheXMsIGFzIGFkZGVkIGJ5IGFkZE92ZXJsYXlcbiAgICAgIG1vZGVHZW46IDAsICAgLy8gYnVtcGVkIHdoZW4gbW9kZS9vdmVybGF5IGNoYW5nZXMsIHVzZWQgdG8gaW52YWxpZGF0ZSBoaWdobGlnaHRpbmcgaW5mb1xuICAgICAgb3ZlcndyaXRlOiBmYWxzZSwgZm9jdXNlZDogZmFsc2UsXG4gICAgICBzdXBwcmVzc0VkaXRzOiBmYWxzZSwgLy8gdXNlZCB0byBkaXNhYmxlIGVkaXRpbmcgZHVyaW5nIGtleSBoYW5kbGVycyB3aGVuIGluIHJlYWRPbmx5IG1vZGVcbiAgICAgIHBhc3RlSW5jb21pbmc6IGZhbHNlLCBjdXRJbmNvbWluZzogZmFsc2UsIC8vIGhlbHAgcmVjb2duaXplIHBhc3RlL2N1dCBlZGl0cyBpbiByZWFkSW5wdXRcbiAgICAgIGRyYWdnaW5nVGV4dDogZmFsc2UsXG4gICAgICBoaWdobGlnaHQ6IG5ldyBEZWxheWVkKCkgLy8gc3RvcmVzIGhpZ2hsaWdodCB3b3JrZXIgdGltZW91dFxuICAgIH07XG5cbiAgICAvLyBPdmVycmlkZSBtYWdpYyB0ZXh0YXJlYSBjb250ZW50IHJlc3RvcmUgdGhhdCBJRSBzb21ldGltZXMgZG9lc1xuICAgIC8vIG9uIG91ciBoaWRkZW4gdGV4dGFyZWEgb24gcmVsb2FkXG4gICAgaWYgKGllX3VwdG8xMCkgc2V0VGltZW91dChiaW5kKHJlc2V0SW5wdXQsIHRoaXMsIHRydWUpLCAyMCk7XG5cbiAgICByZWdpc3RlckV2ZW50SGFuZGxlcnModGhpcyk7XG4gICAgZW5zdXJlR2xvYmFsSGFuZGxlcnMoKTtcblxuICAgIHZhciBjbSA9IHRoaXM7XG4gICAgcnVuSW5PcCh0aGlzLCBmdW5jdGlvbigpIHtcbiAgICAgIGNtLmN1ck9wLmZvcmNlVXBkYXRlID0gdHJ1ZTtcbiAgICAgIGF0dGFjaERvYyhjbSwgZG9jKTtcblxuICAgICAgaWYgKChvcHRpb25zLmF1dG9mb2N1cyAmJiAhbW9iaWxlKSB8fCBhY3RpdmVFbHQoKSA9PSBkaXNwbGF5LmlucHV0KVxuICAgICAgICBzZXRUaW1lb3V0KGJpbmQob25Gb2N1cywgY20pLCAyMCk7XG4gICAgICBlbHNlXG4gICAgICAgIG9uQmx1cihjbSk7XG5cbiAgICAgIGZvciAodmFyIG9wdCBpbiBvcHRpb25IYW5kbGVycykgaWYgKG9wdGlvbkhhbmRsZXJzLmhhc093blByb3BlcnR5KG9wdCkpXG4gICAgICAgIG9wdGlvbkhhbmRsZXJzW29wdF0oY20sIG9wdGlvbnNbb3B0XSwgSW5pdCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluaXRIb29rcy5sZW5ndGg7ICsraSkgaW5pdEhvb2tzW2ldKGNtKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIERJU1BMQVkgQ09OU1RSVUNUT1JcblxuICAvLyBUaGUgZGlzcGxheSBoYW5kbGVzIHRoZSBET00gaW50ZWdyYXRpb24sIGJvdGggZm9yIGlucHV0IHJlYWRpbmdcbiAgLy8gYW5kIGNvbnRlbnQgZHJhd2luZy4gSXQgaG9sZHMgcmVmZXJlbmNlcyB0byBET00gbm9kZXMgYW5kXG4gIC8vIGRpc3BsYXktcmVsYXRlZCBzdGF0ZS5cblxuICBmdW5jdGlvbiBEaXNwbGF5KHBsYWNlLCBkb2MpIHtcbiAgICB2YXIgZCA9IHRoaXM7XG5cbiAgICAvLyBUaGUgc2VtaWhpZGRlbiB0ZXh0YXJlYSB0aGF0IGlzIGZvY3VzZWQgd2hlbiB0aGUgZWRpdG9yIGlzXG4gICAgLy8gZm9jdXNlZCwgYW5kIHJlY2VpdmVzIGlucHV0LlxuICAgIHZhciBpbnB1dCA9IGQuaW5wdXQgPSBlbHQoXCJ0ZXh0YXJlYVwiLCBudWxsLCBudWxsLCBcInBvc2l0aW9uOiBhYnNvbHV0ZTsgcGFkZGluZzogMDsgd2lkdGg6IDFweDsgaGVpZ2h0OiAxZW07IG91dGxpbmU6IG5vbmVcIik7XG4gICAgLy8gVGhlIHRleHRhcmVhIGlzIGtlcHQgcG9zaXRpb25lZCBuZWFyIHRoZSBjdXJzb3IgdG8gcHJldmVudCB0aGVcbiAgICAvLyBmYWN0IHRoYXQgaXQnbGwgYmUgc2Nyb2xsZWQgaW50byB2aWV3IG9uIGlucHV0IGZyb20gc2Nyb2xsaW5nXG4gICAgLy8gb3VyIGZha2UgY3Vyc29yIG91dCBvZiB2aWV3LiBPbiB3ZWJraXQsIHdoZW4gd3JhcD1vZmYsIHBhc3RlIGlzXG4gICAgLy8gdmVyeSBzbG93LiBTbyBtYWtlIHRoZSBhcmVhIHdpZGUgaW5zdGVhZC5cbiAgICBpZiAod2Via2l0KSBpbnB1dC5zdHlsZS53aWR0aCA9IFwiMTAwMHB4XCI7XG4gICAgZWxzZSBpbnB1dC5zZXRBdHRyaWJ1dGUoXCJ3cmFwXCIsIFwib2ZmXCIpO1xuICAgIC8vIElmIGJvcmRlcjogMDsgLS0gaU9TIGZhaWxzIHRvIG9wZW4ga2V5Ym9hcmQgKGlzc3VlICMxMjg3KVxuICAgIGlmIChpb3MpIGlucHV0LnN0eWxlLmJvcmRlciA9IFwiMXB4IHNvbGlkIGJsYWNrXCI7XG4gICAgaW5wdXQuc2V0QXR0cmlidXRlKFwiYXV0b2NvcnJlY3RcIiwgXCJvZmZcIik7IGlucHV0LnNldEF0dHJpYnV0ZShcImF1dG9jYXBpdGFsaXplXCIsIFwib2ZmXCIpOyBpbnB1dC5zZXRBdHRyaWJ1dGUoXCJzcGVsbGNoZWNrXCIsIFwiZmFsc2VcIik7XG5cbiAgICAvLyBXcmFwcyBhbmQgaGlkZXMgaW5wdXQgdGV4dGFyZWFcbiAgICBkLmlucHV0RGl2ID0gZWx0KFwiZGl2XCIsIFtpbnB1dF0sIG51bGwsIFwib3ZlcmZsb3c6IGhpZGRlbjsgcG9zaXRpb246IHJlbGF0aXZlOyB3aWR0aDogM3B4OyBoZWlnaHQ6IDBweDtcIik7XG4gICAgLy8gVGhlIGZha2Ugc2Nyb2xsYmFyIGVsZW1lbnRzLlxuICAgIGQuc2Nyb2xsYmFySCA9IGVsdChcImRpdlwiLCBbZWx0KFwiZGl2XCIsIG51bGwsIG51bGwsIFwiaGVpZ2h0OiAxMDAlOyBtaW4taGVpZ2h0OiAxcHhcIildLCBcIkNvZGVNaXJyb3ItaHNjcm9sbGJhclwiKTtcbiAgICBkLnNjcm9sbGJhclYgPSBlbHQoXCJkaXZcIiwgW2VsdChcImRpdlwiLCBudWxsLCBudWxsLCBcIm1pbi13aWR0aDogMXB4XCIpXSwgXCJDb2RlTWlycm9yLXZzY3JvbGxiYXJcIik7XG4gICAgLy8gQ292ZXJzIGJvdHRvbS1yaWdodCBzcXVhcmUgd2hlbiBib3RoIHNjcm9sbGJhcnMgYXJlIHByZXNlbnQuXG4gICAgZC5zY3JvbGxiYXJGaWxsZXIgPSBlbHQoXCJkaXZcIiwgbnVsbCwgXCJDb2RlTWlycm9yLXNjcm9sbGJhci1maWxsZXJcIik7XG4gICAgLy8gQ292ZXJzIGJvdHRvbSBvZiBndXR0ZXIgd2hlbiBjb3Zlckd1dHRlck5leHRUb1Njcm9sbGJhciBpcyBvblxuICAgIC8vIGFuZCBoIHNjcm9sbGJhciBpcyBwcmVzZW50LlxuICAgIGQuZ3V0dGVyRmlsbGVyID0gZWx0KFwiZGl2XCIsIG51bGwsIFwiQ29kZU1pcnJvci1ndXR0ZXItZmlsbGVyXCIpO1xuICAgIC8vIFdpbGwgY29udGFpbiB0aGUgYWN0dWFsIGNvZGUsIHBvc2l0aW9uZWQgdG8gY292ZXIgdGhlIHZpZXdwb3J0LlxuICAgIGQubGluZURpdiA9IGVsdChcImRpdlwiLCBudWxsLCBcIkNvZGVNaXJyb3ItY29kZVwiKTtcbiAgICAvLyBFbGVtZW50cyBhcmUgYWRkZWQgdG8gdGhlc2UgdG8gcmVwcmVzZW50IHNlbGVjdGlvbiBhbmQgY3Vyc29ycy5cbiAgICBkLnNlbGVjdGlvbkRpdiA9IGVsdChcImRpdlwiLCBudWxsLCBudWxsLCBcInBvc2l0aW9uOiByZWxhdGl2ZTsgei1pbmRleDogMVwiKTtcbiAgICBkLmN1cnNvckRpdiA9IGVsdChcImRpdlwiLCBudWxsLCBcIkNvZGVNaXJyb3ItY3Vyc29yc1wiKTtcbiAgICAvLyBBIHZpc2liaWxpdHk6IGhpZGRlbiBlbGVtZW50IHVzZWQgdG8gZmluZCB0aGUgc2l6ZSBvZiB0aGluZ3MuXG4gICAgZC5tZWFzdXJlID0gZWx0KFwiZGl2XCIsIG51bGwsIFwiQ29kZU1pcnJvci1tZWFzdXJlXCIpO1xuICAgIC8vIFdoZW4gbGluZXMgb3V0c2lkZSBvZiB0aGUgdmlld3BvcnQgYXJlIG1lYXN1cmVkLCB0aGV5IGFyZSBkcmF3biBpbiB0aGlzLlxuICAgIGQubGluZU1lYXN1cmUgPSBlbHQoXCJkaXZcIiwgbnVsbCwgXCJDb2RlTWlycm9yLW1lYXN1cmVcIik7XG4gICAgLy8gV3JhcHMgZXZlcnl0aGluZyB0aGF0IG5lZWRzIHRvIGV4aXN0IGluc2lkZSB0aGUgdmVydGljYWxseS1wYWRkZWQgY29vcmRpbmF0ZSBzeXN0ZW1cbiAgICBkLmxpbmVTcGFjZSA9IGVsdChcImRpdlwiLCBbZC5tZWFzdXJlLCBkLmxpbmVNZWFzdXJlLCBkLnNlbGVjdGlvbkRpdiwgZC5jdXJzb3JEaXYsIGQubGluZURpdl0sXG4gICAgICAgICAgICAgICAgICAgICAgbnVsbCwgXCJwb3NpdGlvbjogcmVsYXRpdmU7IG91dGxpbmU6IG5vbmVcIik7XG4gICAgLy8gTW92ZWQgYXJvdW5kIGl0cyBwYXJlbnQgdG8gY292ZXIgdmlzaWJsZSB2aWV3LlxuICAgIGQubW92ZXIgPSBlbHQoXCJkaXZcIiwgW2VsdChcImRpdlwiLCBbZC5saW5lU3BhY2VdLCBcIkNvZGVNaXJyb3ItbGluZXNcIildLCBudWxsLCBcInBvc2l0aW9uOiByZWxhdGl2ZVwiKTtcbiAgICAvLyBTZXQgdG8gdGhlIGhlaWdodCBvZiB0aGUgZG9jdW1lbnQsIGFsbG93aW5nIHNjcm9sbGluZy5cbiAgICBkLnNpemVyID0gZWx0KFwiZGl2XCIsIFtkLm1vdmVyXSwgXCJDb2RlTWlycm9yLXNpemVyXCIpO1xuICAgIC8vIEJlaGF2aW9yIG9mIGVsdHMgd2l0aCBvdmVyZmxvdzogYXV0byBhbmQgcGFkZGluZyBpc1xuICAgIC8vIGluY29uc2lzdGVudCBhY3Jvc3MgYnJvd3NlcnMuIFRoaXMgaXMgdXNlZCB0byBlbnN1cmUgdGhlXG4gICAgLy8gc2Nyb2xsYWJsZSBhcmVhIGlzIGJpZyBlbm91Z2guXG4gICAgZC5oZWlnaHRGb3JjZXIgPSBlbHQoXCJkaXZcIiwgbnVsbCwgbnVsbCwgXCJwb3NpdGlvbjogYWJzb2x1dGU7IGhlaWdodDogXCIgKyBzY3JvbGxlckN1dE9mZiArIFwicHg7IHdpZHRoOiAxcHg7XCIpO1xuICAgIC8vIFdpbGwgY29udGFpbiB0aGUgZ3V0dGVycywgaWYgYW55LlxuICAgIGQuZ3V0dGVycyA9IGVsdChcImRpdlwiLCBudWxsLCBcIkNvZGVNaXJyb3ItZ3V0dGVyc1wiKTtcbiAgICBkLmxpbmVHdXR0ZXIgPSBudWxsO1xuICAgIC8vIEFjdHVhbCBzY3JvbGxhYmxlIGVsZW1lbnQuXG4gICAgZC5zY3JvbGxlciA9IGVsdChcImRpdlwiLCBbZC5zaXplciwgZC5oZWlnaHRGb3JjZXIsIGQuZ3V0dGVyc10sIFwiQ29kZU1pcnJvci1zY3JvbGxcIik7XG4gICAgZC5zY3JvbGxlci5zZXRBdHRyaWJ1dGUoXCJ0YWJJbmRleFwiLCBcIi0xXCIpO1xuICAgIC8vIFRoZSBlbGVtZW50IGluIHdoaWNoIHRoZSBlZGl0b3IgbGl2ZXMuXG4gICAgZC53cmFwcGVyID0gZWx0KFwiZGl2XCIsIFtkLmlucHV0RGl2LCBkLnNjcm9sbGJhckgsIGQuc2Nyb2xsYmFyVixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkLnNjcm9sbGJhckZpbGxlciwgZC5ndXR0ZXJGaWxsZXIsIGQuc2Nyb2xsZXJdLCBcIkNvZGVNaXJyb3JcIik7XG5cbiAgICAvLyBXb3JrIGFyb3VuZCBJRTcgei1pbmRleCBidWcgKG5vdCBwZXJmZWN0LCBoZW5jZSBJRTcgbm90IHJlYWxseSBiZWluZyBzdXBwb3J0ZWQpXG4gICAgaWYgKGllX3VwdG83KSB7IGQuZ3V0dGVycy5zdHlsZS56SW5kZXggPSAtMTsgZC5zY3JvbGxlci5zdHlsZS5wYWRkaW5nUmlnaHQgPSAwOyB9XG4gICAgLy8gTmVlZGVkIHRvIGhpZGUgYmlnIGJsdWUgYmxpbmtpbmcgY3Vyc29yIG9uIE1vYmlsZSBTYWZhcmlcbiAgICBpZiAoaW9zKSBpbnB1dC5zdHlsZS53aWR0aCA9IFwiMHB4XCI7XG4gICAgaWYgKCF3ZWJraXQpIGQuc2Nyb2xsZXIuZHJhZ2dhYmxlID0gdHJ1ZTtcbiAgICAvLyBOZWVkZWQgdG8gaGFuZGxlIFRhYiBrZXkgaW4gS0hUTUxcbiAgICBpZiAoa2h0bWwpIHsgZC5pbnB1dERpdi5zdHlsZS5oZWlnaHQgPSBcIjFweFwiOyBkLmlucHV0RGl2LnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiOyB9XG4gICAgLy8gTmVlZCB0byBzZXQgYSBtaW5pbXVtIHdpZHRoIHRvIHNlZSB0aGUgc2Nyb2xsYmFyIG9uIElFNyAoYnV0IG11c3Qgbm90IHNldCBpdCBvbiBJRTgpLlxuICAgIGlmIChpZV91cHRvNykgZC5zY3JvbGxiYXJILnN0eWxlLm1pbkhlaWdodCA9IGQuc2Nyb2xsYmFyVi5zdHlsZS5taW5XaWR0aCA9IFwiMThweFwiO1xuXG4gICAgaWYgKHBsYWNlLmFwcGVuZENoaWxkKSBwbGFjZS5hcHBlbmRDaGlsZChkLndyYXBwZXIpO1xuICAgIGVsc2UgcGxhY2UoZC53cmFwcGVyKTtcblxuICAgIC8vIEN1cnJlbnQgcmVuZGVyZWQgcmFuZ2UgKG1heSBiZSBiaWdnZXIgdGhhbiB0aGUgdmlldyB3aW5kb3cpLlxuICAgIGQudmlld0Zyb20gPSBkLnZpZXdUbyA9IGRvYy5maXJzdDtcbiAgICAvLyBJbmZvcm1hdGlvbiBhYm91dCB0aGUgcmVuZGVyZWQgbGluZXMuXG4gICAgZC52aWV3ID0gW107XG4gICAgLy8gSG9sZHMgaW5mbyBhYm91dCBhIHNpbmdsZSByZW5kZXJlZCBsaW5lIHdoZW4gaXQgd2FzIHJlbmRlcmVkXG4gICAgLy8gZm9yIG1lYXN1cmVtZW50LCB3aGlsZSBub3QgaW4gdmlldy5cbiAgICBkLmV4dGVybmFsTWVhc3VyZWQgPSBudWxsO1xuICAgIC8vIEVtcHR5IHNwYWNlIChpbiBwaXhlbHMpIGFib3ZlIHRoZSB2aWV3XG4gICAgZC52aWV3T2Zmc2V0ID0gMDtcbiAgICBkLmxhc3RTaXplQyA9IDA7XG4gICAgZC51cGRhdGVMaW5lTnVtYmVycyA9IG51bGw7XG5cbiAgICAvLyBVc2VkIHRvIG9ubHkgcmVzaXplIHRoZSBsaW5lIG51bWJlciBndXR0ZXIgd2hlbiBuZWNlc3NhcnkgKHdoZW5cbiAgICAvLyB0aGUgYW1vdW50IG9mIGxpbmVzIGNyb3NzZXMgYSBib3VuZGFyeSB0aGF0IG1ha2VzIGl0cyB3aWR0aCBjaGFuZ2UpXG4gICAgZC5saW5lTnVtV2lkdGggPSBkLmxpbmVOdW1Jbm5lcldpZHRoID0gZC5saW5lTnVtQ2hhcnMgPSBudWxsO1xuICAgIC8vIFNlZSByZWFkSW5wdXQgYW5kIHJlc2V0SW5wdXRcbiAgICBkLnByZXZJbnB1dCA9IFwiXCI7XG4gICAgLy8gU2V0IHRvIHRydWUgd2hlbiBhIG5vbi1ob3Jpem9udGFsLXNjcm9sbGluZyBsaW5lIHdpZGdldCBpc1xuICAgIC8vIGFkZGVkLiBBcyBhbiBvcHRpbWl6YXRpb24sIGxpbmUgd2lkZ2V0IGFsaWduaW5nIGlzIHNraXBwZWQgd2hlblxuICAgIC8vIHRoaXMgaXMgZmFsc2UuXG4gICAgZC5hbGlnbldpZGdldHMgPSBmYWxzZTtcbiAgICAvLyBGbGFnIHRoYXQgaW5kaWNhdGVzIHdoZXRoZXIgd2UgZXhwZWN0IGlucHV0IHRvIGFwcGVhciByZWFsIHNvb25cbiAgICAvLyBub3cgKGFmdGVyIHNvbWUgZXZlbnQgbGlrZSAna2V5cHJlc3MnIG9yICdpbnB1dCcpIGFuZCBhcmVcbiAgICAvLyBwb2xsaW5nIGludGVuc2l2ZWx5LlxuICAgIGQucG9sbGluZ0Zhc3QgPSBmYWxzZTtcbiAgICAvLyBTZWxmLXJlc2V0dGluZyB0aW1lb3V0IGZvciB0aGUgcG9sbGVyXG4gICAgZC5wb2xsID0gbmV3IERlbGF5ZWQoKTtcblxuICAgIGQuY2FjaGVkQ2hhcldpZHRoID0gZC5jYWNoZWRUZXh0SGVpZ2h0ID0gZC5jYWNoZWRQYWRkaW5nSCA9IG51bGw7XG5cbiAgICAvLyBUcmFja3Mgd2hlbiByZXNldElucHV0IGhhcyBwdW50ZWQgdG8ganVzdCBwdXR0aW5nIGEgc2hvcnRcbiAgICAvLyBzdHJpbmcgaW50byB0aGUgdGV4dGFyZWEgaW5zdGVhZCBvZiB0aGUgZnVsbCBzZWxlY3Rpb24uXG4gICAgZC5pbmFjY3VyYXRlU2VsZWN0aW9uID0gZmFsc2U7XG5cbiAgICAvLyBUcmFja3MgdGhlIG1heGltdW0gbGluZSBsZW5ndGggc28gdGhhdCB0aGUgaG9yaXpvbnRhbCBzY3JvbGxiYXJcbiAgICAvLyBjYW4gYmUga2VwdCBzdGF0aWMgd2hlbiBzY3JvbGxpbmcuXG4gICAgZC5tYXhMaW5lID0gbnVsbDtcbiAgICBkLm1heExpbmVMZW5ndGggPSAwO1xuICAgIGQubWF4TGluZUNoYW5nZWQgPSBmYWxzZTtcblxuICAgIC8vIFVzZWQgZm9yIG1lYXN1cmluZyB3aGVlbCBzY3JvbGxpbmcgZ3JhbnVsYXJpdHlcbiAgICBkLndoZWVsRFggPSBkLndoZWVsRFkgPSBkLndoZWVsU3RhcnRYID0gZC53aGVlbFN0YXJ0WSA9IG51bGw7XG5cbiAgICAvLyBUcnVlIHdoZW4gc2hpZnQgaXMgaGVsZCBkb3duLlxuICAgIGQuc2hpZnQgPSBmYWxzZTtcblxuICAgIC8vIFVzZWQgdG8gdHJhY2sgd2hldGhlciBhbnl0aGluZyBoYXBwZW5lZCBzaW5jZSB0aGUgY29udGV4dCBtZW51XG4gICAgLy8gd2FzIG9wZW5lZC5cbiAgICBkLnNlbEZvckNvbnRleHRNZW51ID0gbnVsbDtcbiAgfVxuXG4gIC8vIFNUQVRFIFVQREFURVNcblxuICAvLyBVc2VkIHRvIGdldCB0aGUgZWRpdG9yIGludG8gYSBjb25zaXN0ZW50IHN0YXRlIGFnYWluIHdoZW4gb3B0aW9ucyBjaGFuZ2UuXG5cbiAgZnVuY3Rpb24gbG9hZE1vZGUoY20pIHtcbiAgICBjbS5kb2MubW9kZSA9IENvZGVNaXJyb3IuZ2V0TW9kZShjbS5vcHRpb25zLCBjbS5kb2MubW9kZU9wdGlvbik7XG4gICAgcmVzZXRNb2RlU3RhdGUoY20pO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzZXRNb2RlU3RhdGUoY20pIHtcbiAgICBjbS5kb2MuaXRlcihmdW5jdGlvbihsaW5lKSB7XG4gICAgICBpZiAobGluZS5zdGF0ZUFmdGVyKSBsaW5lLnN0YXRlQWZ0ZXIgPSBudWxsO1xuICAgICAgaWYgKGxpbmUuc3R5bGVzKSBsaW5lLnN0eWxlcyA9IG51bGw7XG4gICAgfSk7XG4gICAgY20uZG9jLmZyb250aWVyID0gY20uZG9jLmZpcnN0O1xuICAgIHN0YXJ0V29ya2VyKGNtLCAxMDApO1xuICAgIGNtLnN0YXRlLm1vZGVHZW4rKztcbiAgICBpZiAoY20uY3VyT3ApIHJlZ0NoYW5nZShjbSk7XG4gIH1cblxuICBmdW5jdGlvbiB3cmFwcGluZ0NoYW5nZWQoY20pIHtcbiAgICBpZiAoY20ub3B0aW9ucy5saW5lV3JhcHBpbmcpIHtcbiAgICAgIGFkZENsYXNzKGNtLmRpc3BsYXkud3JhcHBlciwgXCJDb2RlTWlycm9yLXdyYXBcIik7XG4gICAgICBjbS5kaXNwbGF5LnNpemVyLnN0eWxlLm1pbldpZHRoID0gXCJcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgcm1DbGFzcyhjbS5kaXNwbGF5LndyYXBwZXIsIFwiQ29kZU1pcnJvci13cmFwXCIpO1xuICAgICAgZmluZE1heExpbmUoY20pO1xuICAgIH1cbiAgICBlc3RpbWF0ZUxpbmVIZWlnaHRzKGNtKTtcbiAgICByZWdDaGFuZ2UoY20pO1xuICAgIGNsZWFyQ2FjaGVzKGNtKTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dXBkYXRlU2Nyb2xsYmFycyhjbSk7fSwgMTAwKTtcbiAgfVxuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGVzdGltYXRlcyB0aGUgaGVpZ2h0IG9mIGEgbGluZSwgdG8gdXNlIGFzXG4gIC8vIGZpcnN0IGFwcHJveGltYXRpb24gdW50aWwgdGhlIGxpbmUgYmVjb21lcyB2aXNpYmxlIChhbmQgaXMgdGh1c1xuICAvLyBwcm9wZXJseSBtZWFzdXJhYmxlKS5cbiAgZnVuY3Rpb24gZXN0aW1hdGVIZWlnaHQoY20pIHtcbiAgICB2YXIgdGggPSB0ZXh0SGVpZ2h0KGNtLmRpc3BsYXkpLCB3cmFwcGluZyA9IGNtLm9wdGlvbnMubGluZVdyYXBwaW5nO1xuICAgIHZhciBwZXJMaW5lID0gd3JhcHBpbmcgJiYgTWF0aC5tYXgoNSwgY20uZGlzcGxheS5zY3JvbGxlci5jbGllbnRXaWR0aCAvIGNoYXJXaWR0aChjbS5kaXNwbGF5KSAtIDMpO1xuICAgIHJldHVybiBmdW5jdGlvbihsaW5lKSB7XG4gICAgICBpZiAobGluZUlzSGlkZGVuKGNtLmRvYywgbGluZSkpIHJldHVybiAwO1xuXG4gICAgICB2YXIgd2lkZ2V0c0hlaWdodCA9IDA7XG4gICAgICBpZiAobGluZS53aWRnZXRzKSBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmUud2lkZ2V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAobGluZS53aWRnZXRzW2ldLmhlaWdodCkgd2lkZ2V0c0hlaWdodCArPSBsaW5lLndpZGdldHNbaV0uaGVpZ2h0O1xuICAgICAgfVxuXG4gICAgICBpZiAod3JhcHBpbmcpXG4gICAgICAgIHJldHVybiB3aWRnZXRzSGVpZ2h0ICsgKE1hdGguY2VpbChsaW5lLnRleHQubGVuZ3RoIC8gcGVyTGluZSkgfHwgMSkgKiB0aDtcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIHdpZGdldHNIZWlnaHQgKyB0aDtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gZXN0aW1hdGVMaW5lSGVpZ2h0cyhjbSkge1xuICAgIHZhciBkb2MgPSBjbS5kb2MsIGVzdCA9IGVzdGltYXRlSGVpZ2h0KGNtKTtcbiAgICBkb2MuaXRlcihmdW5jdGlvbihsaW5lKSB7XG4gICAgICB2YXIgZXN0SGVpZ2h0ID0gZXN0KGxpbmUpO1xuICAgICAgaWYgKGVzdEhlaWdodCAhPSBsaW5lLmhlaWdodCkgdXBkYXRlTGluZUhlaWdodChsaW5lLCBlc3RIZWlnaHQpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24ga2V5TWFwQ2hhbmdlZChjbSkge1xuICAgIHZhciBtYXAgPSBrZXlNYXBbY20ub3B0aW9ucy5rZXlNYXBdLCBzdHlsZSA9IG1hcC5zdHlsZTtcbiAgICBjbS5kaXNwbGF5LndyYXBwZXIuY2xhc3NOYW1lID0gY20uZGlzcGxheS53cmFwcGVyLmNsYXNzTmFtZS5yZXBsYWNlKC9cXHMqY20ta2V5bWFwLVxcUysvZywgXCJcIikgK1xuICAgICAgKHN0eWxlID8gXCIgY20ta2V5bWFwLVwiICsgc3R5bGUgOiBcIlwiKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRoZW1lQ2hhbmdlZChjbSkge1xuICAgIGNtLmRpc3BsYXkud3JhcHBlci5jbGFzc05hbWUgPSBjbS5kaXNwbGF5LndyYXBwZXIuY2xhc3NOYW1lLnJlcGxhY2UoL1xccypjbS1zLVxcUysvZywgXCJcIikgK1xuICAgICAgY20ub3B0aW9ucy50aGVtZS5yZXBsYWNlKC8oXnxcXHMpXFxzKi9nLCBcIiBjbS1zLVwiKTtcbiAgICBjbGVhckNhY2hlcyhjbSk7XG4gIH1cblxuICBmdW5jdGlvbiBndXR0ZXJzQ2hhbmdlZChjbSkge1xuICAgIHVwZGF0ZUd1dHRlcnMoY20pO1xuICAgIHJlZ0NoYW5nZShjbSk7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpe2FsaWduSG9yaXpvbnRhbGx5KGNtKTt9LCAyMCk7XG4gIH1cblxuICAvLyBSZWJ1aWxkIHRoZSBndXR0ZXIgZWxlbWVudHMsIGVuc3VyZSB0aGUgbWFyZ2luIHRvIHRoZSBsZWZ0IG9mIHRoZVxuICAvLyBjb2RlIG1hdGNoZXMgdGhlaXIgd2lkdGguXG4gIGZ1bmN0aW9uIHVwZGF0ZUd1dHRlcnMoY20pIHtcbiAgICB2YXIgZ3V0dGVycyA9IGNtLmRpc3BsYXkuZ3V0dGVycywgc3BlY3MgPSBjbS5vcHRpb25zLmd1dHRlcnM7XG4gICAgcmVtb3ZlQ2hpbGRyZW4oZ3V0dGVycyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcGVjcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGd1dHRlckNsYXNzID0gc3BlY3NbaV07XG4gICAgICB2YXIgZ0VsdCA9IGd1dHRlcnMuYXBwZW5kQ2hpbGQoZWx0KFwiZGl2XCIsIG51bGwsIFwiQ29kZU1pcnJvci1ndXR0ZXIgXCIgKyBndXR0ZXJDbGFzcykpO1xuICAgICAgaWYgKGd1dHRlckNsYXNzID09IFwiQ29kZU1pcnJvci1saW5lbnVtYmVyc1wiKSB7XG4gICAgICAgIGNtLmRpc3BsYXkubGluZUd1dHRlciA9IGdFbHQ7XG4gICAgICAgIGdFbHQuc3R5bGUud2lkdGggPSAoY20uZGlzcGxheS5saW5lTnVtV2lkdGggfHwgMSkgKyBcInB4XCI7XG4gICAgICB9XG4gICAgfVxuICAgIGd1dHRlcnMuc3R5bGUuZGlzcGxheSA9IGkgPyBcIlwiIDogXCJub25lXCI7XG4gICAgdXBkYXRlR3V0dGVyU3BhY2UoY20pO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlR3V0dGVyU3BhY2UoY20pIHtcbiAgICB2YXIgd2lkdGggPSBjbS5kaXNwbGF5Lmd1dHRlcnMub2Zmc2V0V2lkdGg7XG4gICAgY20uZGlzcGxheS5zaXplci5zdHlsZS5tYXJnaW5MZWZ0ID0gd2lkdGggKyBcInB4XCI7XG4gICAgY20uZGlzcGxheS5zY3JvbGxiYXJILnN0eWxlLmxlZnQgPSBjbS5vcHRpb25zLmZpeGVkR3V0dGVyID8gd2lkdGggKyBcInB4XCIgOiAwO1xuICB9XG5cbiAgLy8gQ29tcHV0ZSB0aGUgY2hhcmFjdGVyIGxlbmd0aCBvZiBhIGxpbmUsIHRha2luZyBpbnRvIGFjY291bnRcbiAgLy8gY29sbGFwc2VkIHJhbmdlcyAoc2VlIG1hcmtUZXh0KSB0aGF0IG1pZ2h0IGhpZGUgcGFydHMsIGFuZCBqb2luXG4gIC8vIG90aGVyIGxpbmVzIG9udG8gaXQuXG4gIGZ1bmN0aW9uIGxpbmVMZW5ndGgobGluZSkge1xuICAgIGlmIChsaW5lLmhlaWdodCA9PSAwKSByZXR1cm4gMDtcbiAgICB2YXIgbGVuID0gbGluZS50ZXh0Lmxlbmd0aCwgbWVyZ2VkLCBjdXIgPSBsaW5lO1xuICAgIHdoaWxlIChtZXJnZWQgPSBjb2xsYXBzZWRTcGFuQXRTdGFydChjdXIpKSB7XG4gICAgICB2YXIgZm91bmQgPSBtZXJnZWQuZmluZCgwLCB0cnVlKTtcbiAgICAgIGN1ciA9IGZvdW5kLmZyb20ubGluZTtcbiAgICAgIGxlbiArPSBmb3VuZC5mcm9tLmNoIC0gZm91bmQudG8uY2g7XG4gICAgfVxuICAgIGN1ciA9IGxpbmU7XG4gICAgd2hpbGUgKG1lcmdlZCA9IGNvbGxhcHNlZFNwYW5BdEVuZChjdXIpKSB7XG4gICAgICB2YXIgZm91bmQgPSBtZXJnZWQuZmluZCgwLCB0cnVlKTtcbiAgICAgIGxlbiAtPSBjdXIudGV4dC5sZW5ndGggLSBmb3VuZC5mcm9tLmNoO1xuICAgICAgY3VyID0gZm91bmQudG8ubGluZTtcbiAgICAgIGxlbiArPSBjdXIudGV4dC5sZW5ndGggLSBmb3VuZC50by5jaDtcbiAgICB9XG4gICAgcmV0dXJuIGxlbjtcbiAgfVxuXG4gIC8vIEZpbmQgdGhlIGxvbmdlc3QgbGluZSBpbiB0aGUgZG9jdW1lbnQuXG4gIGZ1bmN0aW9uIGZpbmRNYXhMaW5lKGNtKSB7XG4gICAgdmFyIGQgPSBjbS5kaXNwbGF5LCBkb2MgPSBjbS5kb2M7XG4gICAgZC5tYXhMaW5lID0gZ2V0TGluZShkb2MsIGRvYy5maXJzdCk7XG4gICAgZC5tYXhMaW5lTGVuZ3RoID0gbGluZUxlbmd0aChkLm1heExpbmUpO1xuICAgIGQubWF4TGluZUNoYW5nZWQgPSB0cnVlO1xuICAgIGRvYy5pdGVyKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIHZhciBsZW4gPSBsaW5lTGVuZ3RoKGxpbmUpO1xuICAgICAgaWYgKGxlbiA+IGQubWF4TGluZUxlbmd0aCkge1xuICAgICAgICBkLm1heExpbmVMZW5ndGggPSBsZW47XG4gICAgICAgIGQubWF4TGluZSA9IGxpbmU7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvLyBNYWtlIHN1cmUgdGhlIGd1dHRlcnMgb3B0aW9ucyBjb250YWlucyB0aGUgZWxlbWVudFxuICAvLyBcIkNvZGVNaXJyb3ItbGluZW51bWJlcnNcIiB3aGVuIHRoZSBsaW5lTnVtYmVycyBvcHRpb24gaXMgdHJ1ZS5cbiAgZnVuY3Rpb24gc2V0R3V0dGVyc0ZvckxpbmVOdW1iZXJzKG9wdGlvbnMpIHtcbiAgICB2YXIgZm91bmQgPSBpbmRleE9mKG9wdGlvbnMuZ3V0dGVycywgXCJDb2RlTWlycm9yLWxpbmVudW1iZXJzXCIpO1xuICAgIGlmIChmb3VuZCA9PSAtMSAmJiBvcHRpb25zLmxpbmVOdW1iZXJzKSB7XG4gICAgICBvcHRpb25zLmd1dHRlcnMgPSBvcHRpb25zLmd1dHRlcnMuY29uY2F0KFtcIkNvZGVNaXJyb3ItbGluZW51bWJlcnNcIl0pO1xuICAgIH0gZWxzZSBpZiAoZm91bmQgPiAtMSAmJiAhb3B0aW9ucy5saW5lTnVtYmVycykge1xuICAgICAgb3B0aW9ucy5ndXR0ZXJzID0gb3B0aW9ucy5ndXR0ZXJzLnNsaWNlKDApO1xuICAgICAgb3B0aW9ucy5ndXR0ZXJzLnNwbGljZShmb3VuZCwgMSk7XG4gICAgfVxuICB9XG5cbiAgLy8gU0NST0xMQkFSU1xuXG4gIC8vIFByZXBhcmUgRE9NIHJlYWRzIG5lZWRlZCB0byB1cGRhdGUgdGhlIHNjcm9sbGJhcnMuIERvbmUgaW4gb25lXG4gIC8vIHNob3QgdG8gbWluaW1pemUgdXBkYXRlL21lYXN1cmUgcm91bmR0cmlwcy5cbiAgZnVuY3Rpb24gbWVhc3VyZUZvclNjcm9sbGJhcnMoY20pIHtcbiAgICB2YXIgc2Nyb2xsID0gY20uZGlzcGxheS5zY3JvbGxlcjtcbiAgICByZXR1cm4ge1xuICAgICAgY2xpZW50SGVpZ2h0OiBzY3JvbGwuY2xpZW50SGVpZ2h0LFxuICAgICAgYmFySGVpZ2h0OiBjbS5kaXNwbGF5LnNjcm9sbGJhclYuY2xpZW50SGVpZ2h0LFxuICAgICAgc2Nyb2xsV2lkdGg6IHNjcm9sbC5zY3JvbGxXaWR0aCwgY2xpZW50V2lkdGg6IHNjcm9sbC5jbGllbnRXaWR0aCxcbiAgICAgIGJhcldpZHRoOiBjbS5kaXNwbGF5LnNjcm9sbGJhckguY2xpZW50V2lkdGgsXG4gICAgICBkb2NIZWlnaHQ6IE1hdGgucm91bmQoY20uZG9jLmhlaWdodCArIHBhZGRpbmdWZXJ0KGNtLmRpc3BsYXkpKVxuICAgIH07XG4gIH1cblxuICAvLyBSZS1zeW5jaHJvbml6ZSB0aGUgZmFrZSBzY3JvbGxiYXJzIHdpdGggdGhlIGFjdHVhbCBzaXplIG9mIHRoZVxuICAvLyBjb250ZW50LlxuICBmdW5jdGlvbiB1cGRhdGVTY3JvbGxiYXJzKGNtLCBtZWFzdXJlKSB7XG4gICAgaWYgKCFtZWFzdXJlKSBtZWFzdXJlID0gbWVhc3VyZUZvclNjcm9sbGJhcnMoY20pO1xuICAgIHZhciBkID0gY20uZGlzcGxheTtcbiAgICB2YXIgc2Nyb2xsSGVpZ2h0ID0gbWVhc3VyZS5kb2NIZWlnaHQgKyBzY3JvbGxlckN1dE9mZjtcbiAgICB2YXIgbmVlZHNIID0gbWVhc3VyZS5zY3JvbGxXaWR0aCA+IG1lYXN1cmUuY2xpZW50V2lkdGg7XG4gICAgdmFyIG5lZWRzViA9IHNjcm9sbEhlaWdodCA+IG1lYXN1cmUuY2xpZW50SGVpZ2h0O1xuICAgIGlmIChuZWVkc1YpIHtcbiAgICAgIGQuc2Nyb2xsYmFyVi5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgZC5zY3JvbGxiYXJWLnN0eWxlLmJvdHRvbSA9IG5lZWRzSCA/IHNjcm9sbGJhcldpZHRoKGQubWVhc3VyZSkgKyBcInB4XCIgOiBcIjBcIjtcbiAgICAgIC8vIEEgYnVnIGluIElFOCBjYW4gY2F1c2UgdGhpcyB2YWx1ZSB0byBiZSBuZWdhdGl2ZSwgc28gZ3VhcmQgaXQuXG4gICAgICBkLnNjcm9sbGJhclYuZmlyc3RDaGlsZC5zdHlsZS5oZWlnaHQgPVxuICAgICAgICBNYXRoLm1heCgwLCBzY3JvbGxIZWlnaHQgLSBtZWFzdXJlLmNsaWVudEhlaWdodCArIChtZWFzdXJlLmJhckhlaWdodCB8fCBkLnNjcm9sbGJhclYuY2xpZW50SGVpZ2h0KSkgKyBcInB4XCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGQuc2Nyb2xsYmFyVi5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcbiAgICAgIGQuc2Nyb2xsYmFyVi5maXJzdENoaWxkLnN0eWxlLmhlaWdodCA9IFwiMFwiO1xuICAgIH1cbiAgICBpZiAobmVlZHNIKSB7XG4gICAgICBkLnNjcm9sbGJhckguc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgIGQuc2Nyb2xsYmFySC5zdHlsZS5yaWdodCA9IG5lZWRzViA/IHNjcm9sbGJhcldpZHRoKGQubWVhc3VyZSkgKyBcInB4XCIgOiBcIjBcIjtcbiAgICAgIGQuc2Nyb2xsYmFySC5maXJzdENoaWxkLnN0eWxlLndpZHRoID1cbiAgICAgICAgKG1lYXN1cmUuc2Nyb2xsV2lkdGggLSBtZWFzdXJlLmNsaWVudFdpZHRoICsgKG1lYXN1cmUuYmFyV2lkdGggfHwgZC5zY3JvbGxiYXJILmNsaWVudFdpZHRoKSkgKyBcInB4XCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGQuc2Nyb2xsYmFySC5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcbiAgICAgIGQuc2Nyb2xsYmFySC5maXJzdENoaWxkLnN0eWxlLndpZHRoID0gXCIwXCI7XG4gICAgfVxuICAgIGlmIChuZWVkc0ggJiYgbmVlZHNWKSB7XG4gICAgICBkLnNjcm9sbGJhckZpbGxlci5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgZC5zY3JvbGxiYXJGaWxsZXIuc3R5bGUuaGVpZ2h0ID0gZC5zY3JvbGxiYXJGaWxsZXIuc3R5bGUud2lkdGggPSBzY3JvbGxiYXJXaWR0aChkLm1lYXN1cmUpICsgXCJweFwiO1xuICAgIH0gZWxzZSBkLnNjcm9sbGJhckZpbGxlci5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcbiAgICBpZiAobmVlZHNIICYmIGNtLm9wdGlvbnMuY292ZXJHdXR0ZXJOZXh0VG9TY3JvbGxiYXIgJiYgY20ub3B0aW9ucy5maXhlZEd1dHRlcikge1xuICAgICAgZC5ndXR0ZXJGaWxsZXIuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgIGQuZ3V0dGVyRmlsbGVyLnN0eWxlLmhlaWdodCA9IHNjcm9sbGJhcldpZHRoKGQubWVhc3VyZSkgKyBcInB4XCI7XG4gICAgICBkLmd1dHRlckZpbGxlci5zdHlsZS53aWR0aCA9IGQuZ3V0dGVycy5vZmZzZXRXaWR0aCArIFwicHhcIjtcbiAgICB9IGVsc2UgZC5ndXR0ZXJGaWxsZXIuc3R5bGUuZGlzcGxheSA9IFwiXCI7XG5cbiAgICBpZiAoIWNtLnN0YXRlLmNoZWNrZWRPdmVybGF5U2Nyb2xsYmFyICYmIG1lYXN1cmUuY2xpZW50SGVpZ2h0ID4gMCkge1xuICAgICAgaWYgKHNjcm9sbGJhcldpZHRoKGQubWVhc3VyZSkgPT09IDApIHtcbiAgICAgICAgdmFyIHcgPSBtYWMgJiYgIW1hY19nZU1vdW50YWluTGlvbiA/IFwiMTJweFwiIDogXCIxOHB4XCI7XG4gICAgICAgIGQuc2Nyb2xsYmFyVi5zdHlsZS5taW5XaWR0aCA9IGQuc2Nyb2xsYmFySC5zdHlsZS5taW5IZWlnaHQgPSB3O1xuICAgICAgICB2YXIgYmFyTW91c2VEb3duID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgIGlmIChlX3RhcmdldChlKSAhPSBkLnNjcm9sbGJhclYgJiYgZV90YXJnZXQoZSkgIT0gZC5zY3JvbGxiYXJIKVxuICAgICAgICAgICAgb3BlcmF0aW9uKGNtLCBvbk1vdXNlRG93bikoZSk7XG4gICAgICAgIH07XG4gICAgICAgIG9uKGQuc2Nyb2xsYmFyViwgXCJtb3VzZWRvd25cIiwgYmFyTW91c2VEb3duKTtcbiAgICAgICAgb24oZC5zY3JvbGxiYXJILCBcIm1vdXNlZG93blwiLCBiYXJNb3VzZURvd24pO1xuICAgICAgfVxuICAgICAgY20uc3RhdGUuY2hlY2tlZE92ZXJsYXlTY3JvbGxiYXIgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIC8vIENvbXB1dGUgdGhlIGxpbmVzIHRoYXQgYXJlIHZpc2libGUgaW4gYSBnaXZlbiB2aWV3cG9ydCAoZGVmYXVsdHNcbiAgLy8gdGhlIHRoZSBjdXJyZW50IHNjcm9sbCBwb3NpdGlvbikuIHZpZXdQb3J0IG1heSBjb250YWluIHRvcCxcbiAgLy8gaGVpZ2h0LCBhbmQgZW5zdXJlIChzZWUgb3Auc2Nyb2xsVG9Qb3MpIHByb3BlcnRpZXMuXG4gIGZ1bmN0aW9uIHZpc2libGVMaW5lcyhkaXNwbGF5LCBkb2MsIHZpZXdQb3J0KSB7XG4gICAgdmFyIHRvcCA9IHZpZXdQb3J0ICYmIHZpZXdQb3J0LnRvcCAhPSBudWxsID8gTWF0aC5tYXgoMCwgdmlld1BvcnQudG9wKSA6IGRpc3BsYXkuc2Nyb2xsZXIuc2Nyb2xsVG9wO1xuICAgIHRvcCA9IE1hdGguZmxvb3IodG9wIC0gcGFkZGluZ1RvcChkaXNwbGF5KSk7XG4gICAgdmFyIGJvdHRvbSA9IHZpZXdQb3J0ICYmIHZpZXdQb3J0LmJvdHRvbSAhPSBudWxsID8gdmlld1BvcnQuYm90dG9tIDogdG9wICsgZGlzcGxheS53cmFwcGVyLmNsaWVudEhlaWdodDtcblxuICAgIHZhciBmcm9tID0gbGluZUF0SGVpZ2h0KGRvYywgdG9wKSwgdG8gPSBsaW5lQXRIZWlnaHQoZG9jLCBib3R0b20pO1xuICAgIC8vIEVuc3VyZSBpcyBhIHtmcm9tOiB7bGluZSwgY2h9LCB0bzoge2xpbmUsIGNofX0gb2JqZWN0LCBhbmRcbiAgICAvLyBmb3JjZXMgdGhvc2UgbGluZXMgaW50byB0aGUgdmlld3BvcnQgKGlmIHBvc3NpYmxlKS5cbiAgICBpZiAodmlld1BvcnQgJiYgdmlld1BvcnQuZW5zdXJlKSB7XG4gICAgICB2YXIgZW5zdXJlRnJvbSA9IHZpZXdQb3J0LmVuc3VyZS5mcm9tLmxpbmUsIGVuc3VyZVRvID0gdmlld1BvcnQuZW5zdXJlLnRvLmxpbmU7XG4gICAgICBpZiAoZW5zdXJlRnJvbSA8IGZyb20pXG4gICAgICAgIHJldHVybiB7ZnJvbTogZW5zdXJlRnJvbSxcbiAgICAgICAgICAgICAgICB0bzogbGluZUF0SGVpZ2h0KGRvYywgaGVpZ2h0QXRMaW5lKGdldExpbmUoZG9jLCBlbnN1cmVGcm9tKSkgKyBkaXNwbGF5LndyYXBwZXIuY2xpZW50SGVpZ2h0KX07XG4gICAgICBpZiAoTWF0aC5taW4oZW5zdXJlVG8sIGRvYy5sYXN0TGluZSgpKSA+PSB0bylcbiAgICAgICAgcmV0dXJuIHtmcm9tOiBsaW5lQXRIZWlnaHQoZG9jLCBoZWlnaHRBdExpbmUoZ2V0TGluZShkb2MsIGVuc3VyZVRvKSkgLSBkaXNwbGF5LndyYXBwZXIuY2xpZW50SGVpZ2h0KSxcbiAgICAgICAgICAgICAgICB0bzogZW5zdXJlVG99O1xuICAgIH1cbiAgICByZXR1cm4ge2Zyb206IGZyb20sIHRvOiBNYXRoLm1heCh0bywgZnJvbSArIDEpfTtcbiAgfVxuXG4gIC8vIExJTkUgTlVNQkVSU1xuXG4gIC8vIFJlLWFsaWduIGxpbmUgbnVtYmVycyBhbmQgZ3V0dGVyIG1hcmtzIHRvIGNvbXBlbnNhdGUgZm9yXG4gIC8vIGhvcml6b250YWwgc2Nyb2xsaW5nLlxuICBmdW5jdGlvbiBhbGlnbkhvcml6b250YWxseShjbSkge1xuICAgIHZhciBkaXNwbGF5ID0gY20uZGlzcGxheSwgdmlldyA9IGRpc3BsYXkudmlldztcbiAgICBpZiAoIWRpc3BsYXkuYWxpZ25XaWRnZXRzICYmICghZGlzcGxheS5ndXR0ZXJzLmZpcnN0Q2hpbGQgfHwgIWNtLm9wdGlvbnMuZml4ZWRHdXR0ZXIpKSByZXR1cm47XG4gICAgdmFyIGNvbXAgPSBjb21wZW5zYXRlRm9ySFNjcm9sbChkaXNwbGF5KSAtIGRpc3BsYXkuc2Nyb2xsZXIuc2Nyb2xsTGVmdCArIGNtLmRvYy5zY3JvbGxMZWZ0O1xuICAgIHZhciBndXR0ZXJXID0gZGlzcGxheS5ndXR0ZXJzLm9mZnNldFdpZHRoLCBsZWZ0ID0gY29tcCArIFwicHhcIjtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZpZXcubGVuZ3RoOyBpKyspIGlmICghdmlld1tpXS5oaWRkZW4pIHtcbiAgICAgIGlmIChjbS5vcHRpb25zLmZpeGVkR3V0dGVyICYmIHZpZXdbaV0uZ3V0dGVyKVxuICAgICAgICB2aWV3W2ldLmd1dHRlci5zdHlsZS5sZWZ0ID0gbGVmdDtcbiAgICAgIHZhciBhbGlnbiA9IHZpZXdbaV0uYWxpZ25hYmxlO1xuICAgICAgaWYgKGFsaWduKSBmb3IgKHZhciBqID0gMDsgaiA8IGFsaWduLmxlbmd0aDsgaisrKVxuICAgICAgICBhbGlnbltqXS5zdHlsZS5sZWZ0ID0gbGVmdDtcbiAgICB9XG4gICAgaWYgKGNtLm9wdGlvbnMuZml4ZWRHdXR0ZXIpXG4gICAgICBkaXNwbGF5Lmd1dHRlcnMuc3R5bGUubGVmdCA9IChjb21wICsgZ3V0dGVyVykgKyBcInB4XCI7XG4gIH1cblxuICAvLyBVc2VkIHRvIGVuc3VyZSB0aGF0IHRoZSBsaW5lIG51bWJlciBndXR0ZXIgaXMgc3RpbGwgdGhlIHJpZ2h0XG4gIC8vIHNpemUgZm9yIHRoZSBjdXJyZW50IGRvY3VtZW50IHNpemUuIFJldHVybnMgdHJ1ZSB3aGVuIGFuIHVwZGF0ZVxuICAvLyBpcyBuZWVkZWQuXG4gIGZ1bmN0aW9uIG1heWJlVXBkYXRlTGluZU51bWJlcldpZHRoKGNtKSB7XG4gICAgaWYgKCFjbS5vcHRpb25zLmxpbmVOdW1iZXJzKSByZXR1cm4gZmFsc2U7XG4gICAgdmFyIGRvYyA9IGNtLmRvYywgbGFzdCA9IGxpbmVOdW1iZXJGb3IoY20ub3B0aW9ucywgZG9jLmZpcnN0ICsgZG9jLnNpemUgLSAxKSwgZGlzcGxheSA9IGNtLmRpc3BsYXk7XG4gICAgaWYgKGxhc3QubGVuZ3RoICE9IGRpc3BsYXkubGluZU51bUNoYXJzKSB7XG4gICAgICB2YXIgdGVzdCA9IGRpc3BsYXkubWVhc3VyZS5hcHBlbmRDaGlsZChlbHQoXCJkaXZcIiwgW2VsdChcImRpdlwiLCBsYXN0KV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJDb2RlTWlycm9yLWxpbmVudW1iZXIgQ29kZU1pcnJvci1ndXR0ZXItZWx0XCIpKTtcbiAgICAgIHZhciBpbm5lclcgPSB0ZXN0LmZpcnN0Q2hpbGQub2Zmc2V0V2lkdGgsIHBhZGRpbmcgPSB0ZXN0Lm9mZnNldFdpZHRoIC0gaW5uZXJXO1xuICAgICAgZGlzcGxheS5saW5lR3V0dGVyLnN0eWxlLndpZHRoID0gXCJcIjtcbiAgICAgIGRpc3BsYXkubGluZU51bUlubmVyV2lkdGggPSBNYXRoLm1heChpbm5lclcsIGRpc3BsYXkubGluZUd1dHRlci5vZmZzZXRXaWR0aCAtIHBhZGRpbmcpO1xuICAgICAgZGlzcGxheS5saW5lTnVtV2lkdGggPSBkaXNwbGF5LmxpbmVOdW1Jbm5lcldpZHRoICsgcGFkZGluZztcbiAgICAgIGRpc3BsYXkubGluZU51bUNoYXJzID0gZGlzcGxheS5saW5lTnVtSW5uZXJXaWR0aCA/IGxhc3QubGVuZ3RoIDogLTE7XG4gICAgICBkaXNwbGF5LmxpbmVHdXR0ZXIuc3R5bGUud2lkdGggPSBkaXNwbGF5LmxpbmVOdW1XaWR0aCArIFwicHhcIjtcbiAgICAgIHVwZGF0ZUd1dHRlclNwYWNlKGNtKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBsaW5lTnVtYmVyRm9yKG9wdGlvbnMsIGkpIHtcbiAgICByZXR1cm4gU3RyaW5nKG9wdGlvbnMubGluZU51bWJlckZvcm1hdHRlcihpICsgb3B0aW9ucy5maXJzdExpbmVOdW1iZXIpKTtcbiAgfVxuXG4gIC8vIENvbXB1dGVzIGRpc3BsYXkuc2Nyb2xsZXIuc2Nyb2xsTGVmdCArIGRpc3BsYXkuZ3V0dGVycy5vZmZzZXRXaWR0aCxcbiAgLy8gYnV0IHVzaW5nIGdldEJvdW5kaW5nQ2xpZW50UmVjdCB0byBnZXQgYSBzdWItcGl4ZWwtYWNjdXJhdGVcbiAgLy8gcmVzdWx0LlxuICBmdW5jdGlvbiBjb21wZW5zYXRlRm9ySFNjcm9sbChkaXNwbGF5KSB7XG4gICAgcmV0dXJuIGRpc3BsYXkuc2Nyb2xsZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdCAtIGRpc3BsYXkuc2l6ZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcbiAgfVxuXG4gIC8vIERJU1BMQVkgRFJBV0lOR1xuXG4gIC8vIFVwZGF0ZXMgdGhlIGRpc3BsYXksIHNlbGVjdGlvbiwgYW5kIHNjcm9sbGJhcnMsIHVzaW5nIHRoZVxuICAvLyBpbmZvcm1hdGlvbiBpbiBkaXNwbGF5LnZpZXcgdG8gZmluZCBvdXQgd2hpY2ggbm9kZXMgYXJlIG5vIGxvbmdlclxuICAvLyB1cC10by1kYXRlLiBUcmllcyB0byBiYWlsIG91dCBlYXJseSB3aGVuIG5vIGNoYW5nZXMgYXJlIG5lZWRlZCxcbiAgLy8gdW5sZXNzIGZvcmNlZCBpcyB0cnVlLlxuICAvLyBSZXR1cm5zIHRydWUgaWYgYW4gYWN0dWFsIHVwZGF0ZSBoYXBwZW5lZCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICBmdW5jdGlvbiB1cGRhdGVEaXNwbGF5KGNtLCB2aWV3UG9ydCwgZm9yY2VkKSB7XG4gICAgdmFyIG9sZEZyb20gPSBjbS5kaXNwbGF5LnZpZXdGcm9tLCBvbGRUbyA9IGNtLmRpc3BsYXkudmlld1RvLCB1cGRhdGVkO1xuICAgIHZhciB2aXNpYmxlID0gdmlzaWJsZUxpbmVzKGNtLmRpc3BsYXksIGNtLmRvYywgdmlld1BvcnQpO1xuICAgIGZvciAodmFyIGZpcnN0ID0gdHJ1ZTs7IGZpcnN0ID0gZmFsc2UpIHtcbiAgICAgIHZhciBvbGRXaWR0aCA9IGNtLmRpc3BsYXkuc2Nyb2xsZXIuY2xpZW50V2lkdGg7XG4gICAgICBpZiAoIXVwZGF0ZURpc3BsYXlJbm5lcihjbSwgdmlzaWJsZSwgZm9yY2VkKSkgYnJlYWs7XG4gICAgICB1cGRhdGVkID0gdHJ1ZTtcblxuICAgICAgLy8gSWYgdGhlIG1heCBsaW5lIGNoYW5nZWQgc2luY2UgaXQgd2FzIGxhc3QgbWVhc3VyZWQsIG1lYXN1cmUgaXQsXG4gICAgICAvLyBhbmQgZW5zdXJlIHRoZSBkb2N1bWVudCdzIHdpZHRoIG1hdGNoZXMgaXQuXG4gICAgICBpZiAoY20uZGlzcGxheS5tYXhMaW5lQ2hhbmdlZCAmJiAhY20ub3B0aW9ucy5saW5lV3JhcHBpbmcpXG4gICAgICAgIGFkanVzdENvbnRlbnRXaWR0aChjbSk7XG5cbiAgICAgIHZhciBiYXJNZWFzdXJlID0gbWVhc3VyZUZvclNjcm9sbGJhcnMoY20pO1xuICAgICAgdXBkYXRlU2VsZWN0aW9uKGNtKTtcbiAgICAgIHNldERvY3VtZW50SGVpZ2h0KGNtLCBiYXJNZWFzdXJlKTtcbiAgICAgIHVwZGF0ZVNjcm9sbGJhcnMoY20sIGJhck1lYXN1cmUpO1xuICAgICAgaWYgKHdlYmtpdCAmJiBjbS5vcHRpb25zLmxpbmVXcmFwcGluZylcbiAgICAgICAgY2hlY2tGb3JXZWJraXRXaWR0aEJ1ZyhjbSwgYmFyTWVhc3VyZSk7IC8vIChJc3N1ZSAjMjQyMClcbiAgICAgIGlmIChmaXJzdCAmJiBjbS5vcHRpb25zLmxpbmVXcmFwcGluZyAmJiBvbGRXaWR0aCAhPSBjbS5kaXNwbGF5LnNjcm9sbGVyLmNsaWVudFdpZHRoKSB7XG4gICAgICAgIGZvcmNlZCA9IHRydWU7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgZm9yY2VkID0gZmFsc2U7XG5cbiAgICAgIC8vIENsaXAgZm9yY2VkIHZpZXdwb3J0IHRvIGFjdHVhbCBzY3JvbGxhYmxlIGFyZWEuXG4gICAgICBpZiAodmlld1BvcnQgJiYgdmlld1BvcnQudG9wICE9IG51bGwpXG4gICAgICAgIHZpZXdQb3J0ID0ge3RvcDogTWF0aC5taW4oYmFyTWVhc3VyZS5kb2NIZWlnaHQgLSBzY3JvbGxlckN1dE9mZiAtIGJhck1lYXN1cmUuY2xpZW50SGVpZ2h0LCB2aWV3UG9ydC50b3ApfTtcbiAgICAgIC8vIFVwZGF0ZWQgbGluZSBoZWlnaHRzIG1pZ2h0IHJlc3VsdCBpbiB0aGUgZHJhd24gYXJlYSBub3RcbiAgICAgIC8vIGFjdHVhbGx5IGNvdmVyaW5nIHRoZSB2aWV3cG9ydC4gS2VlcCBsb29waW5nIHVudGlsIGl0IGRvZXMuXG4gICAgICB2aXNpYmxlID0gdmlzaWJsZUxpbmVzKGNtLmRpc3BsYXksIGNtLmRvYywgdmlld1BvcnQpO1xuICAgICAgaWYgKHZpc2libGUuZnJvbSA+PSBjbS5kaXNwbGF5LnZpZXdGcm9tICYmIHZpc2libGUudG8gPD0gY20uZGlzcGxheS52aWV3VG8pXG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGNtLmRpc3BsYXkudXBkYXRlTGluZU51bWJlcnMgPSBudWxsO1xuICAgIGlmICh1cGRhdGVkKSB7XG4gICAgICBzaWduYWxMYXRlcihjbSwgXCJ1cGRhdGVcIiwgY20pO1xuICAgICAgaWYgKGNtLmRpc3BsYXkudmlld0Zyb20gIT0gb2xkRnJvbSB8fCBjbS5kaXNwbGF5LnZpZXdUbyAhPSBvbGRUbylcbiAgICAgICAgc2lnbmFsTGF0ZXIoY20sIFwidmlld3BvcnRDaGFuZ2VcIiwgY20sIGNtLmRpc3BsYXkudmlld0Zyb20sIGNtLmRpc3BsYXkudmlld1RvKTtcbiAgICB9XG4gICAgcmV0dXJuIHVwZGF0ZWQ7XG4gIH1cblxuICAvLyBEb2VzIHRoZSBhY3R1YWwgdXBkYXRpbmcgb2YgdGhlIGxpbmUgZGlzcGxheS4gQmFpbHMgb3V0XG4gIC8vIChyZXR1cm5pbmcgZmFsc2UpIHdoZW4gdGhlcmUgaXMgbm90aGluZyB0byBiZSBkb25lIGFuZCBmb3JjZWQgaXNcbiAgLy8gZmFsc2UuXG4gIGZ1bmN0aW9uIHVwZGF0ZURpc3BsYXlJbm5lcihjbSwgdmlzaWJsZSwgZm9yY2VkKSB7XG4gICAgdmFyIGRpc3BsYXkgPSBjbS5kaXNwbGF5LCBkb2MgPSBjbS5kb2M7XG4gICAgaWYgKCFkaXNwbGF5LndyYXBwZXIub2Zmc2V0V2lkdGgpIHtcbiAgICAgIHJlc2V0VmlldyhjbSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gQmFpbCBvdXQgaWYgdGhlIHZpc2libGUgYXJlYSBpcyBhbHJlYWR5IHJlbmRlcmVkIGFuZCBub3RoaW5nIGNoYW5nZWQuXG4gICAgaWYgKCFmb3JjZWQgJiYgdmlzaWJsZS5mcm9tID49IGRpc3BsYXkudmlld0Zyb20gJiYgdmlzaWJsZS50byA8PSBkaXNwbGF5LnZpZXdUbyAmJlxuICAgICAgICBjb3VudERpcnR5VmlldyhjbSkgPT0gMClcbiAgICAgIHJldHVybjtcblxuICAgIGlmIChtYXliZVVwZGF0ZUxpbmVOdW1iZXJXaWR0aChjbSkpXG4gICAgICByZXNldFZpZXcoY20pO1xuICAgIHZhciBkaW1zID0gZ2V0RGltZW5zaW9ucyhjbSk7XG5cbiAgICAvLyBDb21wdXRlIGEgc3VpdGFibGUgbmV3IHZpZXdwb3J0IChmcm9tICYgdG8pXG4gICAgdmFyIGVuZCA9IGRvYy5maXJzdCArIGRvYy5zaXplO1xuICAgIHZhciBmcm9tID0gTWF0aC5tYXgodmlzaWJsZS5mcm9tIC0gY20ub3B0aW9ucy52aWV3cG9ydE1hcmdpbiwgZG9jLmZpcnN0KTtcbiAgICB2YXIgdG8gPSBNYXRoLm1pbihlbmQsIHZpc2libGUudG8gKyBjbS5vcHRpb25zLnZpZXdwb3J0TWFyZ2luKTtcbiAgICBpZiAoZGlzcGxheS52aWV3RnJvbSA8IGZyb20gJiYgZnJvbSAtIGRpc3BsYXkudmlld0Zyb20gPCAyMCkgZnJvbSA9IE1hdGgubWF4KGRvYy5maXJzdCwgZGlzcGxheS52aWV3RnJvbSk7XG4gICAgaWYgKGRpc3BsYXkudmlld1RvID4gdG8gJiYgZGlzcGxheS52aWV3VG8gLSB0byA8IDIwKSB0byA9IE1hdGgubWluKGVuZCwgZGlzcGxheS52aWV3VG8pO1xuICAgIGlmIChzYXdDb2xsYXBzZWRTcGFucykge1xuICAgICAgZnJvbSA9IHZpc3VhbExpbmVObyhjbS5kb2MsIGZyb20pO1xuICAgICAgdG8gPSB2aXN1YWxMaW5lRW5kTm8oY20uZG9jLCB0byk7XG4gICAgfVxuXG4gICAgdmFyIGRpZmZlcmVudCA9IGZyb20gIT0gZGlzcGxheS52aWV3RnJvbSB8fCB0byAhPSBkaXNwbGF5LnZpZXdUbyB8fFxuICAgICAgZGlzcGxheS5sYXN0U2l6ZUMgIT0gZGlzcGxheS53cmFwcGVyLmNsaWVudEhlaWdodDtcbiAgICBhZGp1c3RWaWV3KGNtLCBmcm9tLCB0byk7XG5cbiAgICBkaXNwbGF5LnZpZXdPZmZzZXQgPSBoZWlnaHRBdExpbmUoZ2V0TGluZShjbS5kb2MsIGRpc3BsYXkudmlld0Zyb20pKTtcbiAgICAvLyBQb3NpdGlvbiB0aGUgbW92ZXIgZGl2IHRvIGFsaWduIHdpdGggdGhlIGN1cnJlbnQgc2Nyb2xsIHBvc2l0aW9uXG4gICAgY20uZGlzcGxheS5tb3Zlci5zdHlsZS50b3AgPSBkaXNwbGF5LnZpZXdPZmZzZXQgKyBcInB4XCI7XG5cbiAgICB2YXIgdG9VcGRhdGUgPSBjb3VudERpcnR5VmlldyhjbSk7XG4gICAgaWYgKCFkaWZmZXJlbnQgJiYgdG9VcGRhdGUgPT0gMCAmJiAhZm9yY2VkKSByZXR1cm47XG5cbiAgICAvLyBGb3IgYmlnIGNoYW5nZXMsIHdlIGhpZGUgdGhlIGVuY2xvc2luZyBlbGVtZW50IGR1cmluZyB0aGVcbiAgICAvLyB1cGRhdGUsIHNpbmNlIHRoYXQgc3BlZWRzIHVwIHRoZSBvcGVyYXRpb25zIG9uIG1vc3QgYnJvd3NlcnMuXG4gICAgdmFyIGZvY3VzZWQgPSBhY3RpdmVFbHQoKTtcbiAgICBpZiAodG9VcGRhdGUgPiA0KSBkaXNwbGF5LmxpbmVEaXYuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIHBhdGNoRGlzcGxheShjbSwgZGlzcGxheS51cGRhdGVMaW5lTnVtYmVycywgZGltcyk7XG4gICAgaWYgKHRvVXBkYXRlID4gNCkgZGlzcGxheS5saW5lRGl2LnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xuICAgIC8vIFRoZXJlIG1pZ2h0IGhhdmUgYmVlbiBhIHdpZGdldCB3aXRoIGEgZm9jdXNlZCBlbGVtZW50IHRoYXQgZ290XG4gICAgLy8gaGlkZGVuIG9yIHVwZGF0ZWQsIGlmIHNvIHJlLWZvY3VzIGl0LlxuICAgIGlmIChmb2N1c2VkICYmIGFjdGl2ZUVsdCgpICE9IGZvY3VzZWQgJiYgZm9jdXNlZC5vZmZzZXRIZWlnaHQpIGZvY3VzZWQuZm9jdXMoKTtcblxuICAgIC8vIFByZXZlbnQgc2VsZWN0aW9uIGFuZCBjdXJzb3JzIGZyb20gaW50ZXJmZXJpbmcgd2l0aCB0aGUgc2Nyb2xsXG4gICAgLy8gd2lkdGguXG4gICAgcmVtb3ZlQ2hpbGRyZW4oZGlzcGxheS5jdXJzb3JEaXYpO1xuICAgIHJlbW92ZUNoaWxkcmVuKGRpc3BsYXkuc2VsZWN0aW9uRGl2KTtcblxuICAgIGlmIChkaWZmZXJlbnQpIHtcbiAgICAgIGRpc3BsYXkubGFzdFNpemVDID0gZGlzcGxheS53cmFwcGVyLmNsaWVudEhlaWdodDtcbiAgICAgIHN0YXJ0V29ya2VyKGNtLCA0MDApO1xuICAgIH1cblxuICAgIHVwZGF0ZUhlaWdodHNJblZpZXdwb3J0KGNtKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRqdXN0Q29udGVudFdpZHRoKGNtKSB7XG4gICAgdmFyIGRpc3BsYXkgPSBjbS5kaXNwbGF5O1xuICAgIHZhciB3aWR0aCA9IG1lYXN1cmVDaGFyKGNtLCBkaXNwbGF5Lm1heExpbmUsIGRpc3BsYXkubWF4TGluZS50ZXh0Lmxlbmd0aCkubGVmdDtcbiAgICBkaXNwbGF5Lm1heExpbmVDaGFuZ2VkID0gZmFsc2U7XG4gICAgdmFyIG1pbldpZHRoID0gTWF0aC5tYXgoMCwgd2lkdGggKyAzKTtcbiAgICB2YXIgbWF4U2Nyb2xsTGVmdCA9IE1hdGgubWF4KDAsIGRpc3BsYXkuc2l6ZXIub2Zmc2V0TGVmdCArIG1pbldpZHRoICsgc2Nyb2xsZXJDdXRPZmYgLSBkaXNwbGF5LnNjcm9sbGVyLmNsaWVudFdpZHRoKTtcbiAgICBkaXNwbGF5LnNpemVyLnN0eWxlLm1pbldpZHRoID0gbWluV2lkdGggKyBcInB4XCI7XG4gICAgaWYgKG1heFNjcm9sbExlZnQgPCBjbS5kb2Muc2Nyb2xsTGVmdClcbiAgICAgIHNldFNjcm9sbExlZnQoY20sIE1hdGgubWluKGRpc3BsYXkuc2Nyb2xsZXIuc2Nyb2xsTGVmdCwgbWF4U2Nyb2xsTGVmdCksIHRydWUpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2V0RG9jdW1lbnRIZWlnaHQoY20sIG1lYXN1cmUpIHtcbiAgICBjbS5kaXNwbGF5LnNpemVyLnN0eWxlLm1pbkhlaWdodCA9IGNtLmRpc3BsYXkuaGVpZ2h0Rm9yY2VyLnN0eWxlLnRvcCA9IG1lYXN1cmUuZG9jSGVpZ2h0ICsgXCJweFwiO1xuICAgIGNtLmRpc3BsYXkuZ3V0dGVycy5zdHlsZS5oZWlnaHQgPSBNYXRoLm1heChtZWFzdXJlLmRvY0hlaWdodCwgbWVhc3VyZS5jbGllbnRIZWlnaHQgLSBzY3JvbGxlckN1dE9mZikgKyBcInB4XCI7XG4gIH1cblxuICBmdW5jdGlvbiBjaGVja0ZvcldlYmtpdFdpZHRoQnVnKGNtLCBtZWFzdXJlKSB7XG4gICAgLy8gV29yayBhcm91bmQgV2Via2l0IGJ1ZyB3aGVyZSBpdCBzb21ldGltZXMgcmVzZXJ2ZXMgc3BhY2UgZm9yIGFcbiAgICAvLyBub24tZXhpc3RpbmcgcGhhbnRvbSBzY3JvbGxiYXIgaW4gdGhlIHNjcm9sbGVyIChJc3N1ZSAjMjQyMClcbiAgICBpZiAoY20uZGlzcGxheS5zaXplci5vZmZzZXRXaWR0aCArIGNtLmRpc3BsYXkuZ3V0dGVycy5vZmZzZXRXaWR0aCA8IGNtLmRpc3BsYXkuc2Nyb2xsZXIuY2xpZW50V2lkdGggLSAxKSB7XG4gICAgICBjbS5kaXNwbGF5LnNpemVyLnN0eWxlLm1pbkhlaWdodCA9IGNtLmRpc3BsYXkuaGVpZ2h0Rm9yY2VyLnN0eWxlLnRvcCA9IFwiMHB4XCI7XG4gICAgICBjbS5kaXNwbGF5Lmd1dHRlcnMuc3R5bGUuaGVpZ2h0ID0gbWVhc3VyZS5kb2NIZWlnaHQgKyBcInB4XCI7XG4gICAgfVxuICB9XG5cbiAgLy8gUmVhZCB0aGUgYWN0dWFsIGhlaWdodHMgb2YgdGhlIHJlbmRlcmVkIGxpbmVzLCBhbmQgdXBkYXRlIHRoZWlyXG4gIC8vIHN0b3JlZCBoZWlnaHRzIHRvIG1hdGNoLlxuICBmdW5jdGlvbiB1cGRhdGVIZWlnaHRzSW5WaWV3cG9ydChjbSkge1xuICAgIHZhciBkaXNwbGF5ID0gY20uZGlzcGxheTtcbiAgICB2YXIgcHJldkJvdHRvbSA9IGRpc3BsYXkubGluZURpdi5vZmZzZXRUb3A7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkaXNwbGF5LnZpZXcubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBjdXIgPSBkaXNwbGF5LnZpZXdbaV0sIGhlaWdodDtcbiAgICAgIGlmIChjdXIuaGlkZGVuKSBjb250aW51ZTtcbiAgICAgIGlmIChpZV91cHRvNykge1xuICAgICAgICB2YXIgYm90ID0gY3VyLm5vZGUub2Zmc2V0VG9wICsgY3VyLm5vZGUub2Zmc2V0SGVpZ2h0O1xuICAgICAgICBoZWlnaHQgPSBib3QgLSBwcmV2Qm90dG9tO1xuICAgICAgICBwcmV2Qm90dG9tID0gYm90O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGJveCA9IGN1ci5ub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBoZWlnaHQgPSBib3guYm90dG9tIC0gYm94LnRvcDtcbiAgICAgIH1cbiAgICAgIHZhciBkaWZmID0gY3VyLmxpbmUuaGVpZ2h0IC0gaGVpZ2h0O1xuICAgICAgaWYgKGhlaWdodCA8IDIpIGhlaWdodCA9IHRleHRIZWlnaHQoZGlzcGxheSk7XG4gICAgICBpZiAoZGlmZiA+IC4wMDEgfHwgZGlmZiA8IC0uMDAxKSB7XG4gICAgICAgIHVwZGF0ZUxpbmVIZWlnaHQoY3VyLmxpbmUsIGhlaWdodCk7XG4gICAgICAgIHVwZGF0ZVdpZGdldEhlaWdodChjdXIubGluZSk7XG4gICAgICAgIGlmIChjdXIucmVzdCkgZm9yICh2YXIgaiA9IDA7IGogPCBjdXIucmVzdC5sZW5ndGg7IGorKylcbiAgICAgICAgICB1cGRhdGVXaWRnZXRIZWlnaHQoY3VyLnJlc3Rbal0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFJlYWQgYW5kIHN0b3JlIHRoZSBoZWlnaHQgb2YgbGluZSB3aWRnZXRzIGFzc29jaWF0ZWQgd2l0aCB0aGVcbiAgLy8gZ2l2ZW4gbGluZS5cbiAgZnVuY3Rpb24gdXBkYXRlV2lkZ2V0SGVpZ2h0KGxpbmUpIHtcbiAgICBpZiAobGluZS53aWRnZXRzKSBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmUud2lkZ2V0cy5sZW5ndGg7ICsraSlcbiAgICAgIGxpbmUud2lkZ2V0c1tpXS5oZWlnaHQgPSBsaW5lLndpZGdldHNbaV0ubm9kZS5vZmZzZXRIZWlnaHQ7XG4gIH1cblxuICAvLyBEbyBhIGJ1bGstcmVhZCBvZiB0aGUgRE9NIHBvc2l0aW9ucyBhbmQgc2l6ZXMgbmVlZGVkIHRvIGRyYXcgdGhlXG4gIC8vIHZpZXcsIHNvIHRoYXQgd2UgZG9uJ3QgaW50ZXJsZWF2ZSByZWFkaW5nIGFuZCB3cml0aW5nIHRvIHRoZSBET00uXG4gIGZ1bmN0aW9uIGdldERpbWVuc2lvbnMoY20pIHtcbiAgICB2YXIgZCA9IGNtLmRpc3BsYXksIGxlZnQgPSB7fSwgd2lkdGggPSB7fTtcbiAgICBmb3IgKHZhciBuID0gZC5ndXR0ZXJzLmZpcnN0Q2hpbGQsIGkgPSAwOyBuOyBuID0gbi5uZXh0U2libGluZywgKytpKSB7XG4gICAgICBsZWZ0W2NtLm9wdGlvbnMuZ3V0dGVyc1tpXV0gPSBuLm9mZnNldExlZnQ7XG4gICAgICB3aWR0aFtjbS5vcHRpb25zLmd1dHRlcnNbaV1dID0gbi5vZmZzZXRXaWR0aDtcbiAgICB9XG4gICAgcmV0dXJuIHtmaXhlZFBvczogY29tcGVuc2F0ZUZvckhTY3JvbGwoZCksXG4gICAgICAgICAgICBndXR0ZXJUb3RhbFdpZHRoOiBkLmd1dHRlcnMub2Zmc2V0V2lkdGgsXG4gICAgICAgICAgICBndXR0ZXJMZWZ0OiBsZWZ0LFxuICAgICAgICAgICAgZ3V0dGVyV2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgd3JhcHBlcldpZHRoOiBkLndyYXBwZXIuY2xpZW50V2lkdGh9O1xuICB9XG5cbiAgLy8gU3luYyB0aGUgYWN0dWFsIGRpc3BsYXkgRE9NIHN0cnVjdHVyZSB3aXRoIGRpc3BsYXkudmlldywgcmVtb3ZpbmdcbiAgLy8gbm9kZXMgZm9yIGxpbmVzIHRoYXQgYXJlIG5vIGxvbmdlciBpbiB2aWV3LCBhbmQgY3JlYXRpbmcgdGhlIG9uZXNcbiAgLy8gdGhhdCBhcmUgbm90IHRoZXJlIHlldCwgYW5kIHVwZGF0aW5nIHRoZSBvbmVzIHRoYXQgYXJlIG91dCBvZlxuICAvLyBkYXRlLlxuICBmdW5jdGlvbiBwYXRjaERpc3BsYXkoY20sIHVwZGF0ZU51bWJlcnNGcm9tLCBkaW1zKSB7XG4gICAgdmFyIGRpc3BsYXkgPSBjbS5kaXNwbGF5LCBsaW5lTnVtYmVycyA9IGNtLm9wdGlvbnMubGluZU51bWJlcnM7XG4gICAgdmFyIGNvbnRhaW5lciA9IGRpc3BsYXkubGluZURpdiwgY3VyID0gY29udGFpbmVyLmZpcnN0Q2hpbGQ7XG5cbiAgICBmdW5jdGlvbiBybShub2RlKSB7XG4gICAgICB2YXIgbmV4dCA9IG5vZGUubmV4dFNpYmxpbmc7XG4gICAgICAvLyBXb3JrcyBhcm91bmQgYSB0aHJvdy1zY3JvbGwgYnVnIGluIE9TIFggV2Via2l0XG4gICAgICBpZiAod2Via2l0ICYmIG1hYyAmJiBjbS5kaXNwbGF5LmN1cnJlbnRXaGVlbFRhcmdldCA9PSBub2RlKVxuICAgICAgICBub2RlLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgIGVsc2VcbiAgICAgICAgbm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgICAgcmV0dXJuIG5leHQ7XG4gICAgfVxuXG4gICAgdmFyIHZpZXcgPSBkaXNwbGF5LnZpZXcsIGxpbmVOID0gZGlzcGxheS52aWV3RnJvbTtcbiAgICAvLyBMb29wIG92ZXIgdGhlIGVsZW1lbnRzIGluIHRoZSB2aWV3LCBzeW5jaW5nIGN1ciAodGhlIERPTSBub2Rlc1xuICAgIC8vIGluIGRpc3BsYXkubGluZURpdikgd2l0aCB0aGUgdmlldyBhcyB3ZSBnby5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZpZXcubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBsaW5lVmlldyA9IHZpZXdbaV07XG4gICAgICBpZiAobGluZVZpZXcuaGlkZGVuKSB7XG4gICAgICB9IGVsc2UgaWYgKCFsaW5lVmlldy5ub2RlKSB7IC8vIE5vdCBkcmF3biB5ZXRcbiAgICAgICAgdmFyIG5vZGUgPSBidWlsZExpbmVFbGVtZW50KGNtLCBsaW5lVmlldywgbGluZU4sIGRpbXMpO1xuICAgICAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKG5vZGUsIGN1cik7XG4gICAgICB9IGVsc2UgeyAvLyBBbHJlYWR5IGRyYXduXG4gICAgICAgIHdoaWxlIChjdXIgIT0gbGluZVZpZXcubm9kZSkgY3VyID0gcm0oY3VyKTtcbiAgICAgICAgdmFyIHVwZGF0ZU51bWJlciA9IGxpbmVOdW1iZXJzICYmIHVwZGF0ZU51bWJlcnNGcm9tICE9IG51bGwgJiZcbiAgICAgICAgICB1cGRhdGVOdW1iZXJzRnJvbSA8PSBsaW5lTiAmJiBsaW5lVmlldy5saW5lTnVtYmVyO1xuICAgICAgICBpZiAobGluZVZpZXcuY2hhbmdlcykge1xuICAgICAgICAgIGlmIChpbmRleE9mKGxpbmVWaWV3LmNoYW5nZXMsIFwiZ3V0dGVyXCIpID4gLTEpIHVwZGF0ZU51bWJlciA9IGZhbHNlO1xuICAgICAgICAgIHVwZGF0ZUxpbmVGb3JDaGFuZ2VzKGNtLCBsaW5lVmlldywgbGluZU4sIGRpbXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cGRhdGVOdW1iZXIpIHtcbiAgICAgICAgICByZW1vdmVDaGlsZHJlbihsaW5lVmlldy5saW5lTnVtYmVyKTtcbiAgICAgICAgICBsaW5lVmlldy5saW5lTnVtYmVyLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGxpbmVOdW1iZXJGb3IoY20ub3B0aW9ucywgbGluZU4pKSk7XG4gICAgICAgIH1cbiAgICAgICAgY3VyID0gbGluZVZpZXcubm9kZS5uZXh0U2libGluZztcbiAgICAgIH1cbiAgICAgIGxpbmVOICs9IGxpbmVWaWV3LnNpemU7XG4gICAgfVxuICAgIHdoaWxlIChjdXIpIGN1ciA9IHJtKGN1cik7XG4gIH1cblxuICAvLyBXaGVuIGFuIGFzcGVjdCBvZiBhIGxpbmUgY2hhbmdlcywgYSBzdHJpbmcgaXMgYWRkZWQgdG9cbiAgLy8gbGluZVZpZXcuY2hhbmdlcy4gVGhpcyB1cGRhdGVzIHRoZSByZWxldmFudCBwYXJ0IG9mIHRoZSBsaW5lJ3NcbiAgLy8gRE9NIHN0cnVjdHVyZS5cbiAgZnVuY3Rpb24gdXBkYXRlTGluZUZvckNoYW5nZXMoY20sIGxpbmVWaWV3LCBsaW5lTiwgZGltcykge1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgbGluZVZpZXcuY2hhbmdlcy5sZW5ndGg7IGorKykge1xuICAgICAgdmFyIHR5cGUgPSBsaW5lVmlldy5jaGFuZ2VzW2pdO1xuICAgICAgaWYgKHR5cGUgPT0gXCJ0ZXh0XCIpIHVwZGF0ZUxpbmVUZXh0KGNtLCBsaW5lVmlldyk7XG4gICAgICBlbHNlIGlmICh0eXBlID09IFwiZ3V0dGVyXCIpIHVwZGF0ZUxpbmVHdXR0ZXIoY20sIGxpbmVWaWV3LCBsaW5lTiwgZGltcyk7XG4gICAgICBlbHNlIGlmICh0eXBlID09IFwiY2xhc3NcIikgdXBkYXRlTGluZUNsYXNzZXMobGluZVZpZXcpO1xuICAgICAgZWxzZSBpZiAodHlwZSA9PSBcIndpZGdldFwiKSB1cGRhdGVMaW5lV2lkZ2V0cyhsaW5lVmlldywgZGltcyk7XG4gICAgfVxuICAgIGxpbmVWaWV3LmNoYW5nZXMgPSBudWxsO1xuICB9XG5cbiAgLy8gTGluZXMgd2l0aCBndXR0ZXIgZWxlbWVudHMsIHdpZGdldHMgb3IgYSBiYWNrZ3JvdW5kIGNsYXNzIG5lZWQgdG9cbiAgLy8gYmUgd3JhcHBlZCwgYW5kIGhhdmUgdGhlIGV4dHJhIGVsZW1lbnRzIGFkZGVkIHRvIHRoZSB3cmFwcGVyIGRpdlxuICBmdW5jdGlvbiBlbnN1cmVMaW5lV3JhcHBlZChsaW5lVmlldykge1xuICAgIGlmIChsaW5lVmlldy5ub2RlID09IGxpbmVWaWV3LnRleHQpIHtcbiAgICAgIGxpbmVWaWV3Lm5vZGUgPSBlbHQoXCJkaXZcIiwgbnVsbCwgbnVsbCwgXCJwb3NpdGlvbjogcmVsYXRpdmVcIik7XG4gICAgICBpZiAobGluZVZpZXcudGV4dC5wYXJlbnROb2RlKVxuICAgICAgICBsaW5lVmlldy50ZXh0LnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGxpbmVWaWV3Lm5vZGUsIGxpbmVWaWV3LnRleHQpO1xuICAgICAgbGluZVZpZXcubm9kZS5hcHBlbmRDaGlsZChsaW5lVmlldy50ZXh0KTtcbiAgICAgIGlmIChpZV91cHRvNykgbGluZVZpZXcubm9kZS5zdHlsZS56SW5kZXggPSAyO1xuICAgIH1cbiAgICByZXR1cm4gbGluZVZpZXcubm9kZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUxpbmVCYWNrZ3JvdW5kKGxpbmVWaWV3KSB7XG4gICAgdmFyIGNscyA9IGxpbmVWaWV3LmJnQ2xhc3MgPyBsaW5lVmlldy5iZ0NsYXNzICsgXCIgXCIgKyAobGluZVZpZXcubGluZS5iZ0NsYXNzIHx8IFwiXCIpIDogbGluZVZpZXcubGluZS5iZ0NsYXNzO1xuICAgIGlmIChjbHMpIGNscyArPSBcIiBDb2RlTWlycm9yLWxpbmViYWNrZ3JvdW5kXCI7XG4gICAgaWYgKGxpbmVWaWV3LmJhY2tncm91bmQpIHtcbiAgICAgIGlmIChjbHMpIGxpbmVWaWV3LmJhY2tncm91bmQuY2xhc3NOYW1lID0gY2xzO1xuICAgICAgZWxzZSB7IGxpbmVWaWV3LmJhY2tncm91bmQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChsaW5lVmlldy5iYWNrZ3JvdW5kKTsgbGluZVZpZXcuYmFja2dyb3VuZCA9IG51bGw7IH1cbiAgICB9IGVsc2UgaWYgKGNscykge1xuICAgICAgdmFyIHdyYXAgPSBlbnN1cmVMaW5lV3JhcHBlZChsaW5lVmlldyk7XG4gICAgICBsaW5lVmlldy5iYWNrZ3JvdW5kID0gd3JhcC5pbnNlcnRCZWZvcmUoZWx0KFwiZGl2XCIsIG51bGwsIGNscyksIHdyYXAuZmlyc3RDaGlsZCk7XG4gICAgfVxuICB9XG5cbiAgLy8gV3JhcHBlciBhcm91bmQgYnVpbGRMaW5lQ29udGVudCB3aGljaCB3aWxsIHJldXNlIHRoZSBzdHJ1Y3R1cmVcbiAgLy8gaW4gZGlzcGxheS5leHRlcm5hbE1lYXN1cmVkIHdoZW4gcG9zc2libGUuXG4gIGZ1bmN0aW9uIGdldExpbmVDb250ZW50KGNtLCBsaW5lVmlldykge1xuICAgIHZhciBleHQgPSBjbS5kaXNwbGF5LmV4dGVybmFsTWVhc3VyZWQ7XG4gICAgaWYgKGV4dCAmJiBleHQubGluZSA9PSBsaW5lVmlldy5saW5lKSB7XG4gICAgICBjbS5kaXNwbGF5LmV4dGVybmFsTWVhc3VyZWQgPSBudWxsO1xuICAgICAgbGluZVZpZXcubWVhc3VyZSA9IGV4dC5tZWFzdXJlO1xuICAgICAgcmV0dXJuIGV4dC5idWlsdDtcbiAgICB9XG4gICAgcmV0dXJuIGJ1aWxkTGluZUNvbnRlbnQoY20sIGxpbmVWaWV3KTtcbiAgfVxuXG4gIC8vIFJlZHJhdyB0aGUgbGluZSdzIHRleHQuIEludGVyYWN0cyB3aXRoIHRoZSBiYWNrZ3JvdW5kIGFuZCB0ZXh0XG4gIC8vIGNsYXNzZXMgYmVjYXVzZSB0aGUgbW9kZSBtYXkgb3V0cHV0IHRva2VucyB0aGF0IGluZmx1ZW5jZSB0aGVzZVxuICAvLyBjbGFzc2VzLlxuICBmdW5jdGlvbiB1cGRhdGVMaW5lVGV4dChjbSwgbGluZVZpZXcpIHtcbiAgICB2YXIgY2xzID0gbGluZVZpZXcudGV4dC5jbGFzc05hbWU7XG4gICAgdmFyIGJ1aWx0ID0gZ2V0TGluZUNvbnRlbnQoY20sIGxpbmVWaWV3KTtcbiAgICBpZiAobGluZVZpZXcudGV4dCA9PSBsaW5lVmlldy5ub2RlKSBsaW5lVmlldy5ub2RlID0gYnVpbHQucHJlO1xuICAgIGxpbmVWaWV3LnRleHQucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoYnVpbHQucHJlLCBsaW5lVmlldy50ZXh0KTtcbiAgICBsaW5lVmlldy50ZXh0ID0gYnVpbHQucHJlO1xuICAgIGlmIChidWlsdC5iZ0NsYXNzICE9IGxpbmVWaWV3LmJnQ2xhc3MgfHwgYnVpbHQudGV4dENsYXNzICE9IGxpbmVWaWV3LnRleHRDbGFzcykge1xuICAgICAgbGluZVZpZXcuYmdDbGFzcyA9IGJ1aWx0LmJnQ2xhc3M7XG4gICAgICBsaW5lVmlldy50ZXh0Q2xhc3MgPSBidWlsdC50ZXh0Q2xhc3M7XG4gICAgICB1cGRhdGVMaW5lQ2xhc3NlcyhsaW5lVmlldyk7XG4gICAgfSBlbHNlIGlmIChjbHMpIHtcbiAgICAgIGxpbmVWaWV3LnRleHQuY2xhc3NOYW1lID0gY2xzO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUxpbmVDbGFzc2VzKGxpbmVWaWV3KSB7XG4gICAgdXBkYXRlTGluZUJhY2tncm91bmQobGluZVZpZXcpO1xuICAgIGlmIChsaW5lVmlldy5saW5lLndyYXBDbGFzcylcbiAgICAgIGVuc3VyZUxpbmVXcmFwcGVkKGxpbmVWaWV3KS5jbGFzc05hbWUgPSBsaW5lVmlldy5saW5lLndyYXBDbGFzcztcbiAgICBlbHNlIGlmIChsaW5lVmlldy5ub2RlICE9IGxpbmVWaWV3LnRleHQpXG4gICAgICBsaW5lVmlldy5ub2RlLmNsYXNzTmFtZSA9IFwiXCI7XG4gICAgdmFyIHRleHRDbGFzcyA9IGxpbmVWaWV3LnRleHRDbGFzcyA/IGxpbmVWaWV3LnRleHRDbGFzcyArIFwiIFwiICsgKGxpbmVWaWV3LmxpbmUudGV4dENsYXNzIHx8IFwiXCIpIDogbGluZVZpZXcubGluZS50ZXh0Q2xhc3M7XG4gICAgbGluZVZpZXcudGV4dC5jbGFzc05hbWUgPSB0ZXh0Q2xhc3MgfHwgXCJcIjtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUxpbmVHdXR0ZXIoY20sIGxpbmVWaWV3LCBsaW5lTiwgZGltcykge1xuICAgIGlmIChsaW5lVmlldy5ndXR0ZXIpIHtcbiAgICAgIGxpbmVWaWV3Lm5vZGUucmVtb3ZlQ2hpbGQobGluZVZpZXcuZ3V0dGVyKTtcbiAgICAgIGxpbmVWaWV3Lmd1dHRlciA9IG51bGw7XG4gICAgfVxuICAgIHZhciBtYXJrZXJzID0gbGluZVZpZXcubGluZS5ndXR0ZXJNYXJrZXJzO1xuICAgIGlmIChjbS5vcHRpb25zLmxpbmVOdW1iZXJzIHx8IG1hcmtlcnMpIHtcbiAgICAgIHZhciB3cmFwID0gZW5zdXJlTGluZVdyYXBwZWQobGluZVZpZXcpO1xuICAgICAgdmFyIGd1dHRlcldyYXAgPSBsaW5lVmlldy5ndXR0ZXIgPVxuICAgICAgICB3cmFwLmluc2VydEJlZm9yZShlbHQoXCJkaXZcIiwgbnVsbCwgXCJDb2RlTWlycm9yLWd1dHRlci13cmFwcGVyXCIsIFwicG9zaXRpb246IGFic29sdXRlOyBsZWZ0OiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoY20ub3B0aW9ucy5maXhlZEd1dHRlciA/IGRpbXMuZml4ZWRQb3MgOiAtZGltcy5ndXR0ZXJUb3RhbFdpZHRoKSArIFwicHhcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVWaWV3LnRleHQpO1xuICAgICAgaWYgKGNtLm9wdGlvbnMubGluZU51bWJlcnMgJiYgKCFtYXJrZXJzIHx8ICFtYXJrZXJzW1wiQ29kZU1pcnJvci1saW5lbnVtYmVyc1wiXSkpXG4gICAgICAgIGxpbmVWaWV3LmxpbmVOdW1iZXIgPSBndXR0ZXJXcmFwLmFwcGVuZENoaWxkKFxuICAgICAgICAgIGVsdChcImRpdlwiLCBsaW5lTnVtYmVyRm9yKGNtLm9wdGlvbnMsIGxpbmVOKSxcbiAgICAgICAgICAgICAgXCJDb2RlTWlycm9yLWxpbmVudW1iZXIgQ29kZU1pcnJvci1ndXR0ZXItZWx0XCIsXG4gICAgICAgICAgICAgIFwibGVmdDogXCIgKyBkaW1zLmd1dHRlckxlZnRbXCJDb2RlTWlycm9yLWxpbmVudW1iZXJzXCJdICsgXCJweDsgd2lkdGg6IFwiXG4gICAgICAgICAgICAgICsgY20uZGlzcGxheS5saW5lTnVtSW5uZXJXaWR0aCArIFwicHhcIikpO1xuICAgICAgaWYgKG1hcmtlcnMpIGZvciAodmFyIGsgPSAwOyBrIDwgY20ub3B0aW9ucy5ndXR0ZXJzLmxlbmd0aDsgKytrKSB7XG4gICAgICAgIHZhciBpZCA9IGNtLm9wdGlvbnMuZ3V0dGVyc1trXSwgZm91bmQgPSBtYXJrZXJzLmhhc093blByb3BlcnR5KGlkKSAmJiBtYXJrZXJzW2lkXTtcbiAgICAgICAgaWYgKGZvdW5kKVxuICAgICAgICAgIGd1dHRlcldyYXAuYXBwZW5kQ2hpbGQoZWx0KFwiZGl2XCIsIFtmb3VuZF0sIFwiQ29kZU1pcnJvci1ndXR0ZXItZWx0XCIsIFwibGVmdDogXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpbXMuZ3V0dGVyTGVmdFtpZF0gKyBcInB4OyB3aWR0aDogXCIgKyBkaW1zLmd1dHRlcldpZHRoW2lkXSArIFwicHhcIikpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUxpbmVXaWRnZXRzKGxpbmVWaWV3LCBkaW1zKSB7XG4gICAgaWYgKGxpbmVWaWV3LmFsaWduYWJsZSkgbGluZVZpZXcuYWxpZ25hYmxlID0gbnVsbDtcbiAgICBmb3IgKHZhciBub2RlID0gbGluZVZpZXcubm9kZS5maXJzdENoaWxkLCBuZXh0OyBub2RlOyBub2RlID0gbmV4dCkge1xuICAgICAgdmFyIG5leHQgPSBub2RlLm5leHRTaWJsaW5nO1xuICAgICAgaWYgKG5vZGUuY2xhc3NOYW1lID09IFwiQ29kZU1pcnJvci1saW5ld2lkZ2V0XCIpXG4gICAgICAgIGxpbmVWaWV3Lm5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgfVxuICAgIGluc2VydExpbmVXaWRnZXRzKGxpbmVWaWV3LCBkaW1zKTtcbiAgfVxuXG4gIC8vIEJ1aWxkIGEgbGluZSdzIERPTSByZXByZXNlbnRhdGlvbiBmcm9tIHNjcmF0Y2hcbiAgZnVuY3Rpb24gYnVpbGRMaW5lRWxlbWVudChjbSwgbGluZVZpZXcsIGxpbmVOLCBkaW1zKSB7XG4gICAgdmFyIGJ1aWx0ID0gZ2V0TGluZUNvbnRlbnQoY20sIGxpbmVWaWV3KTtcbiAgICBsaW5lVmlldy50ZXh0ID0gbGluZVZpZXcubm9kZSA9IGJ1aWx0LnByZTtcbiAgICBpZiAoYnVpbHQuYmdDbGFzcykgbGluZVZpZXcuYmdDbGFzcyA9IGJ1aWx0LmJnQ2xhc3M7XG4gICAgaWYgKGJ1aWx0LnRleHRDbGFzcykgbGluZVZpZXcudGV4dENsYXNzID0gYnVpbHQudGV4dENsYXNzO1xuXG4gICAgdXBkYXRlTGluZUNsYXNzZXMobGluZVZpZXcpO1xuICAgIHVwZGF0ZUxpbmVHdXR0ZXIoY20sIGxpbmVWaWV3LCBsaW5lTiwgZGltcyk7XG4gICAgaW5zZXJ0TGluZVdpZGdldHMobGluZVZpZXcsIGRpbXMpO1xuICAgIHJldHVybiBsaW5lVmlldy5ub2RlO1xuICB9XG5cbiAgLy8gQSBsaW5lVmlldyBtYXkgY29udGFpbiBtdWx0aXBsZSBsb2dpY2FsIGxpbmVzICh3aGVuIG1lcmdlZCBieVxuICAvLyBjb2xsYXBzZWQgc3BhbnMpLiBUaGUgd2lkZ2V0cyBmb3IgYWxsIG9mIHRoZW0gbmVlZCB0byBiZSBkcmF3bi5cbiAgZnVuY3Rpb24gaW5zZXJ0TGluZVdpZGdldHMobGluZVZpZXcsIGRpbXMpIHtcbiAgICBpbnNlcnRMaW5lV2lkZ2V0c0ZvcihsaW5lVmlldy5saW5lLCBsaW5lVmlldywgZGltcywgdHJ1ZSk7XG4gICAgaWYgKGxpbmVWaWV3LnJlc3QpIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZVZpZXcucmVzdC5sZW5ndGg7IGkrKylcbiAgICAgIGluc2VydExpbmVXaWRnZXRzRm9yKGxpbmVWaWV3LnJlc3RbaV0sIGxpbmVWaWV3LCBkaW1zLCBmYWxzZSk7XG4gIH1cblxuICBmdW5jdGlvbiBpbnNlcnRMaW5lV2lkZ2V0c0ZvcihsaW5lLCBsaW5lVmlldywgZGltcywgYWxsb3dBYm92ZSkge1xuICAgIGlmICghbGluZS53aWRnZXRzKSByZXR1cm47XG4gICAgdmFyIHdyYXAgPSBlbnN1cmVMaW5lV3JhcHBlZChsaW5lVmlldyk7XG4gICAgZm9yICh2YXIgaSA9IDAsIHdzID0gbGluZS53aWRnZXRzOyBpIDwgd3MubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciB3aWRnZXQgPSB3c1tpXSwgbm9kZSA9IGVsdChcImRpdlwiLCBbd2lkZ2V0Lm5vZGVdLCBcIkNvZGVNaXJyb3ItbGluZXdpZGdldFwiKTtcbiAgICAgIGlmICghd2lkZ2V0LmhhbmRsZU1vdXNlRXZlbnRzKSBub2RlLmlnbm9yZUV2ZW50cyA9IHRydWU7XG4gICAgICBwb3NpdGlvbkxpbmVXaWRnZXQod2lkZ2V0LCBub2RlLCBsaW5lVmlldywgZGltcyk7XG4gICAgICBpZiAoYWxsb3dBYm92ZSAmJiB3aWRnZXQuYWJvdmUpXG4gICAgICAgIHdyYXAuaW5zZXJ0QmVmb3JlKG5vZGUsIGxpbmVWaWV3Lmd1dHRlciB8fCBsaW5lVmlldy50ZXh0KTtcbiAgICAgIGVsc2VcbiAgICAgICAgd3JhcC5hcHBlbmRDaGlsZChub2RlKTtcbiAgICAgIHNpZ25hbExhdGVyKHdpZGdldCwgXCJyZWRyYXdcIik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcG9zaXRpb25MaW5lV2lkZ2V0KHdpZGdldCwgbm9kZSwgbGluZVZpZXcsIGRpbXMpIHtcbiAgICBpZiAod2lkZ2V0Lm5vSFNjcm9sbCkge1xuICAgICAgKGxpbmVWaWV3LmFsaWduYWJsZSB8fCAobGluZVZpZXcuYWxpZ25hYmxlID0gW10pKS5wdXNoKG5vZGUpO1xuICAgICAgdmFyIHdpZHRoID0gZGltcy53cmFwcGVyV2lkdGg7XG4gICAgICBub2RlLnN0eWxlLmxlZnQgPSBkaW1zLmZpeGVkUG9zICsgXCJweFwiO1xuICAgICAgaWYgKCF3aWRnZXQuY292ZXJHdXR0ZXIpIHtcbiAgICAgICAgd2lkdGggLT0gZGltcy5ndXR0ZXJUb3RhbFdpZHRoO1xuICAgICAgICBub2RlLnN0eWxlLnBhZGRpbmdMZWZ0ID0gZGltcy5ndXR0ZXJUb3RhbFdpZHRoICsgXCJweFwiO1xuICAgICAgfVxuICAgICAgbm9kZS5zdHlsZS53aWR0aCA9IHdpZHRoICsgXCJweFwiO1xuICAgIH1cbiAgICBpZiAod2lkZ2V0LmNvdmVyR3V0dGVyKSB7XG4gICAgICBub2RlLnN0eWxlLnpJbmRleCA9IDU7XG4gICAgICBub2RlLnN0eWxlLnBvc2l0aW9uID0gXCJyZWxhdGl2ZVwiO1xuICAgICAgaWYgKCF3aWRnZXQubm9IU2Nyb2xsKSBub2RlLnN0eWxlLm1hcmdpbkxlZnQgPSAtZGltcy5ndXR0ZXJUb3RhbFdpZHRoICsgXCJweFwiO1xuICAgIH1cbiAgfVxuXG4gIC8vIFBPU0lUSU9OIE9CSkVDVFxuXG4gIC8vIEEgUG9zIGluc3RhbmNlIHJlcHJlc2VudHMgYSBwb3NpdGlvbiB3aXRoaW4gdGhlIHRleHQuXG4gIHZhciBQb3MgPSBDb2RlTWlycm9yLlBvcyA9IGZ1bmN0aW9uKGxpbmUsIGNoKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFBvcykpIHJldHVybiBuZXcgUG9zKGxpbmUsIGNoKTtcbiAgICB0aGlzLmxpbmUgPSBsaW5lOyB0aGlzLmNoID0gY2g7XG4gIH07XG5cbiAgLy8gQ29tcGFyZSB0d28gcG9zaXRpb25zLCByZXR1cm4gMCBpZiB0aGV5IGFyZSB0aGUgc2FtZSwgYSBuZWdhdGl2ZVxuICAvLyBudW1iZXIgd2hlbiBhIGlzIGxlc3MsIGFuZCBhIHBvc2l0aXZlIG51bWJlciBvdGhlcndpc2UuXG4gIHZhciBjbXAgPSBDb2RlTWlycm9yLmNtcFBvcyA9IGZ1bmN0aW9uKGEsIGIpIHsgcmV0dXJuIGEubGluZSAtIGIubGluZSB8fCBhLmNoIC0gYi5jaDsgfTtcblxuICBmdW5jdGlvbiBjb3B5UG9zKHgpIHtyZXR1cm4gUG9zKHgubGluZSwgeC5jaCk7fVxuICBmdW5jdGlvbiBtYXhQb3MoYSwgYikgeyByZXR1cm4gY21wKGEsIGIpIDwgMCA/IGIgOiBhOyB9XG4gIGZ1bmN0aW9uIG1pblBvcyhhLCBiKSB7IHJldHVybiBjbXAoYSwgYikgPCAwID8gYSA6IGI7IH1cblxuICAvLyBTRUxFQ1RJT04gLyBDVVJTT1JcblxuICAvLyBTZWxlY3Rpb24gb2JqZWN0cyBhcmUgaW1tdXRhYmxlLiBBIG5ldyBvbmUgaXMgY3JlYXRlZCBldmVyeSB0aW1lXG4gIC8vIHRoZSBzZWxlY3Rpb24gY2hhbmdlcy4gQSBzZWxlY3Rpb24gaXMgb25lIG9yIG1vcmUgbm9uLW92ZXJsYXBwaW5nXG4gIC8vIChhbmQgbm9uLXRvdWNoaW5nKSByYW5nZXMsIHNvcnRlZCwgYW5kIGFuIGludGVnZXIgdGhhdCBpbmRpY2F0ZXNcbiAgLy8gd2hpY2ggb25lIGlzIHRoZSBwcmltYXJ5IHNlbGVjdGlvbiAodGhlIG9uZSB0aGF0J3Mgc2Nyb2xsZWQgaW50b1xuICAvLyB2aWV3LCB0aGF0IGdldEN1cnNvciByZXR1cm5zLCBldGMpLlxuICBmdW5jdGlvbiBTZWxlY3Rpb24ocmFuZ2VzLCBwcmltSW5kZXgpIHtcbiAgICB0aGlzLnJhbmdlcyA9IHJhbmdlcztcbiAgICB0aGlzLnByaW1JbmRleCA9IHByaW1JbmRleDtcbiAgfVxuXG4gIFNlbGVjdGlvbi5wcm90b3R5cGUgPSB7XG4gICAgcHJpbWFyeTogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLnJhbmdlc1t0aGlzLnByaW1JbmRleF07IH0sXG4gICAgZXF1YWxzOiBmdW5jdGlvbihvdGhlcikge1xuICAgICAgaWYgKG90aGVyID09IHRoaXMpIHJldHVybiB0cnVlO1xuICAgICAgaWYgKG90aGVyLnByaW1JbmRleCAhPSB0aGlzLnByaW1JbmRleCB8fCBvdGhlci5yYW5nZXMubGVuZ3RoICE9IHRoaXMucmFuZ2VzLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnJhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgaGVyZSA9IHRoaXMucmFuZ2VzW2ldLCB0aGVyZSA9IG90aGVyLnJhbmdlc1tpXTtcbiAgICAgICAgaWYgKGNtcChoZXJlLmFuY2hvciwgdGhlcmUuYW5jaG9yKSAhPSAwIHx8IGNtcChoZXJlLmhlYWQsIHRoZXJlLmhlYWQpICE9IDApIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgZGVlcENvcHk6IGZ1bmN0aW9uKCkge1xuICAgICAgZm9yICh2YXIgb3V0ID0gW10sIGkgPSAwOyBpIDwgdGhpcy5yYW5nZXMubGVuZ3RoOyBpKyspXG4gICAgICAgIG91dFtpXSA9IG5ldyBSYW5nZShjb3B5UG9zKHRoaXMucmFuZ2VzW2ldLmFuY2hvciksIGNvcHlQb3ModGhpcy5yYW5nZXNbaV0uaGVhZCkpO1xuICAgICAgcmV0dXJuIG5ldyBTZWxlY3Rpb24ob3V0LCB0aGlzLnByaW1JbmRleCk7XG4gICAgfSxcbiAgICBzb21ldGhpbmdTZWxlY3RlZDogZnVuY3Rpb24oKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucmFuZ2VzLmxlbmd0aDsgaSsrKVxuICAgICAgICBpZiAoIXRoaXMucmFuZ2VzW2ldLmVtcHR5KCkpIHJldHVybiB0cnVlO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG4gICAgY29udGFpbnM6IGZ1bmN0aW9uKHBvcywgZW5kKSB7XG4gICAgICBpZiAoIWVuZCkgZW5kID0gcG9zO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnJhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcmFuZ2UgPSB0aGlzLnJhbmdlc1tpXTtcbiAgICAgICAgaWYgKGNtcChlbmQsIHJhbmdlLmZyb20oKSkgPj0gMCAmJiBjbXAocG9zLCByYW5nZS50bygpKSA8PSAwKVxuICAgICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBSYW5nZShhbmNob3IsIGhlYWQpIHtcbiAgICB0aGlzLmFuY2hvciA9IGFuY2hvcjsgdGhpcy5oZWFkID0gaGVhZDtcbiAgfVxuXG4gIFJhbmdlLnByb3RvdHlwZSA9IHtcbiAgICBmcm9tOiBmdW5jdGlvbigpIHsgcmV0dXJuIG1pblBvcyh0aGlzLmFuY2hvciwgdGhpcy5oZWFkKTsgfSxcbiAgICB0bzogZnVuY3Rpb24oKSB7IHJldHVybiBtYXhQb3ModGhpcy5hbmNob3IsIHRoaXMuaGVhZCk7IH0sXG4gICAgZW1wdHk6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuaGVhZC5saW5lID09IHRoaXMuYW5jaG9yLmxpbmUgJiYgdGhpcy5oZWFkLmNoID09IHRoaXMuYW5jaG9yLmNoO1xuICAgIH1cbiAgfTtcblxuICAvLyBUYWtlIGFuIHVuc29ydGVkLCBwb3RlbnRpYWxseSBvdmVybGFwcGluZyBzZXQgb2YgcmFuZ2VzLCBhbmRcbiAgLy8gYnVpbGQgYSBzZWxlY3Rpb24gb3V0IG9mIGl0LiAnQ29uc3VtZXMnIHJhbmdlcyBhcnJheSAobW9kaWZ5aW5nXG4gIC8vIGl0KS5cbiAgZnVuY3Rpb24gbm9ybWFsaXplU2VsZWN0aW9uKHJhbmdlcywgcHJpbUluZGV4KSB7XG4gICAgdmFyIHByaW0gPSByYW5nZXNbcHJpbUluZGV4XTtcbiAgICByYW5nZXMuc29ydChmdW5jdGlvbihhLCBiKSB7IHJldHVybiBjbXAoYS5mcm9tKCksIGIuZnJvbSgpKTsgfSk7XG4gICAgcHJpbUluZGV4ID0gaW5kZXhPZihyYW5nZXMsIHByaW0pO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgcmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgY3VyID0gcmFuZ2VzW2ldLCBwcmV2ID0gcmFuZ2VzW2kgLSAxXTtcbiAgICAgIGlmIChjbXAocHJldi50bygpLCBjdXIuZnJvbSgpKSA+PSAwKSB7XG4gICAgICAgIHZhciBmcm9tID0gbWluUG9zKHByZXYuZnJvbSgpLCBjdXIuZnJvbSgpKSwgdG8gPSBtYXhQb3MocHJldi50bygpLCBjdXIudG8oKSk7XG4gICAgICAgIHZhciBpbnYgPSBwcmV2LmVtcHR5KCkgPyBjdXIuZnJvbSgpID09IGN1ci5oZWFkIDogcHJldi5mcm9tKCkgPT0gcHJldi5oZWFkO1xuICAgICAgICBpZiAoaSA8PSBwcmltSW5kZXgpIC0tcHJpbUluZGV4O1xuICAgICAgICByYW5nZXMuc3BsaWNlKC0taSwgMiwgbmV3IFJhbmdlKGludiA/IHRvIDogZnJvbSwgaW52ID8gZnJvbSA6IHRvKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgU2VsZWN0aW9uKHJhbmdlcywgcHJpbUluZGV4KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNpbXBsZVNlbGVjdGlvbihhbmNob3IsIGhlYWQpIHtcbiAgICByZXR1cm4gbmV3IFNlbGVjdGlvbihbbmV3IFJhbmdlKGFuY2hvciwgaGVhZCB8fCBhbmNob3IpXSwgMCk7XG4gIH1cblxuICAvLyBNb3N0IG9mIHRoZSBleHRlcm5hbCBBUEkgY2xpcHMgZ2l2ZW4gcG9zaXRpb25zIHRvIG1ha2Ugc3VyZSB0aGV5XG4gIC8vIGFjdHVhbGx5IGV4aXN0IHdpdGhpbiB0aGUgZG9jdW1lbnQuXG4gIGZ1bmN0aW9uIGNsaXBMaW5lKGRvYywgbikge3JldHVybiBNYXRoLm1heChkb2MuZmlyc3QsIE1hdGgubWluKG4sIGRvYy5maXJzdCArIGRvYy5zaXplIC0gMSkpO31cbiAgZnVuY3Rpb24gY2xpcFBvcyhkb2MsIHBvcykge1xuICAgIGlmIChwb3MubGluZSA8IGRvYy5maXJzdCkgcmV0dXJuIFBvcyhkb2MuZmlyc3QsIDApO1xuICAgIHZhciBsYXN0ID0gZG9jLmZpcnN0ICsgZG9jLnNpemUgLSAxO1xuICAgIGlmIChwb3MubGluZSA+IGxhc3QpIHJldHVybiBQb3MobGFzdCwgZ2V0TGluZShkb2MsIGxhc3QpLnRleHQubGVuZ3RoKTtcbiAgICByZXR1cm4gY2xpcFRvTGVuKHBvcywgZ2V0TGluZShkb2MsIHBvcy5saW5lKS50ZXh0Lmxlbmd0aCk7XG4gIH1cbiAgZnVuY3Rpb24gY2xpcFRvTGVuKHBvcywgbGluZWxlbikge1xuICAgIHZhciBjaCA9IHBvcy5jaDtcbiAgICBpZiAoY2ggPT0gbnVsbCB8fCBjaCA+IGxpbmVsZW4pIHJldHVybiBQb3MocG9zLmxpbmUsIGxpbmVsZW4pO1xuICAgIGVsc2UgaWYgKGNoIDwgMCkgcmV0dXJuIFBvcyhwb3MubGluZSwgMCk7XG4gICAgZWxzZSByZXR1cm4gcG9zO1xuICB9XG4gIGZ1bmN0aW9uIGlzTGluZShkb2MsIGwpIHtyZXR1cm4gbCA+PSBkb2MuZmlyc3QgJiYgbCA8IGRvYy5maXJzdCArIGRvYy5zaXplO31cbiAgZnVuY3Rpb24gY2xpcFBvc0FycmF5KGRvYywgYXJyYXkpIHtcbiAgICBmb3IgKHZhciBvdXQgPSBbXSwgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykgb3V0W2ldID0gY2xpcFBvcyhkb2MsIGFycmF5W2ldKTtcbiAgICByZXR1cm4gb3V0O1xuICB9XG5cbiAgLy8gU0VMRUNUSU9OIFVQREFURVNcblxuICAvLyBUaGUgJ3Njcm9sbCcgcGFyYW1ldGVyIGdpdmVuIHRvIG1hbnkgb2YgdGhlc2UgaW5kaWNhdGVkIHdoZXRoZXJcbiAgLy8gdGhlIG5ldyBjdXJzb3IgcG9zaXRpb24gc2hvdWxkIGJlIHNjcm9sbGVkIGludG8gdmlldyBhZnRlclxuICAvLyBtb2RpZnlpbmcgdGhlIHNlbGVjdGlvbi5cblxuICAvLyBJZiBzaGlmdCBpcyBoZWxkIG9yIHRoZSBleHRlbmQgZmxhZyBpcyBzZXQsIGV4dGVuZHMgYSByYW5nZSB0b1xuICAvLyBpbmNsdWRlIGEgZ2l2ZW4gcG9zaXRpb24gKGFuZCBvcHRpb25hbGx5IGEgc2Vjb25kIHBvc2l0aW9uKS5cbiAgLy8gT3RoZXJ3aXNlLCBzaW1wbHkgcmV0dXJucyB0aGUgcmFuZ2UgYmV0d2VlbiB0aGUgZ2l2ZW4gcG9zaXRpb25zLlxuICAvLyBVc2VkIGZvciBjdXJzb3IgbW90aW9uIGFuZCBzdWNoLlxuICBmdW5jdGlvbiBleHRlbmRSYW5nZShkb2MsIHJhbmdlLCBoZWFkLCBvdGhlcikge1xuICAgIGlmIChkb2MuY20gJiYgZG9jLmNtLmRpc3BsYXkuc2hpZnQgfHwgZG9jLmV4dGVuZCkge1xuICAgICAgdmFyIGFuY2hvciA9IHJhbmdlLmFuY2hvcjtcbiAgICAgIGlmIChvdGhlcikge1xuICAgICAgICB2YXIgcG9zQmVmb3JlID0gY21wKGhlYWQsIGFuY2hvcikgPCAwO1xuICAgICAgICBpZiAocG9zQmVmb3JlICE9IChjbXAob3RoZXIsIGFuY2hvcikgPCAwKSkge1xuICAgICAgICAgIGFuY2hvciA9IGhlYWQ7XG4gICAgICAgICAgaGVhZCA9IG90aGVyO1xuICAgICAgICB9IGVsc2UgaWYgKHBvc0JlZm9yZSAhPSAoY21wKGhlYWQsIG90aGVyKSA8IDApKSB7XG4gICAgICAgICAgaGVhZCA9IG90aGVyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFJhbmdlKGFuY2hvciwgaGVhZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgUmFuZ2Uob3RoZXIgfHwgaGVhZCwgaGVhZCk7XG4gICAgfVxuICB9XG5cbiAgLy8gRXh0ZW5kIHRoZSBwcmltYXJ5IHNlbGVjdGlvbiByYW5nZSwgZGlzY2FyZCB0aGUgcmVzdC5cbiAgZnVuY3Rpb24gZXh0ZW5kU2VsZWN0aW9uKGRvYywgaGVhZCwgb3RoZXIsIG9wdGlvbnMpIHtcbiAgICBzZXRTZWxlY3Rpb24oZG9jLCBuZXcgU2VsZWN0aW9uKFtleHRlbmRSYW5nZShkb2MsIGRvYy5zZWwucHJpbWFyeSgpLCBoZWFkLCBvdGhlcildLCAwKSwgb3B0aW9ucyk7XG4gIH1cblxuICAvLyBFeHRlbmQgYWxsIHNlbGVjdGlvbnMgKHBvcyBpcyBhbiBhcnJheSBvZiBzZWxlY3Rpb25zIHdpdGggbGVuZ3RoXG4gIC8vIGVxdWFsIHRoZSBudW1iZXIgb2Ygc2VsZWN0aW9ucylcbiAgZnVuY3Rpb24gZXh0ZW5kU2VsZWN0aW9ucyhkb2MsIGhlYWRzLCBvcHRpb25zKSB7XG4gICAgZm9yICh2YXIgb3V0ID0gW10sIGkgPSAwOyBpIDwgZG9jLnNlbC5yYW5nZXMubGVuZ3RoOyBpKyspXG4gICAgICBvdXRbaV0gPSBleHRlbmRSYW5nZShkb2MsIGRvYy5zZWwucmFuZ2VzW2ldLCBoZWFkc1tpXSwgbnVsbCk7XG4gICAgdmFyIG5ld1NlbCA9IG5vcm1hbGl6ZVNlbGVjdGlvbihvdXQsIGRvYy5zZWwucHJpbUluZGV4KTtcbiAgICBzZXRTZWxlY3Rpb24oZG9jLCBuZXdTZWwsIG9wdGlvbnMpO1xuICB9XG5cbiAgLy8gVXBkYXRlcyBhIHNpbmdsZSByYW5nZSBpbiB0aGUgc2VsZWN0aW9uLlxuICBmdW5jdGlvbiByZXBsYWNlT25lU2VsZWN0aW9uKGRvYywgaSwgcmFuZ2UsIG9wdGlvbnMpIHtcbiAgICB2YXIgcmFuZ2VzID0gZG9jLnNlbC5yYW5nZXMuc2xpY2UoMCk7XG4gICAgcmFuZ2VzW2ldID0gcmFuZ2U7XG4gICAgc2V0U2VsZWN0aW9uKGRvYywgbm9ybWFsaXplU2VsZWN0aW9uKHJhbmdlcywgZG9jLnNlbC5wcmltSW5kZXgpLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8vIFJlc2V0IHRoZSBzZWxlY3Rpb24gdG8gYSBzaW5nbGUgcmFuZ2UuXG4gIGZ1bmN0aW9uIHNldFNpbXBsZVNlbGVjdGlvbihkb2MsIGFuY2hvciwgaGVhZCwgb3B0aW9ucykge1xuICAgIHNldFNlbGVjdGlvbihkb2MsIHNpbXBsZVNlbGVjdGlvbihhbmNob3IsIGhlYWQpLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8vIEdpdmUgYmVmb3JlU2VsZWN0aW9uQ2hhbmdlIGhhbmRsZXJzIGEgY2hhbmdlIHRvIGluZmx1ZW5jZSBhXG4gIC8vIHNlbGVjdGlvbiB1cGRhdGUuXG4gIGZ1bmN0aW9uIGZpbHRlclNlbGVjdGlvbkNoYW5nZShkb2MsIHNlbCkge1xuICAgIHZhciBvYmogPSB7XG4gICAgICByYW5nZXM6IHNlbC5yYW5nZXMsXG4gICAgICB1cGRhdGU6IGZ1bmN0aW9uKHJhbmdlcykge1xuICAgICAgICB0aGlzLnJhbmdlcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJhbmdlcy5sZW5ndGg7IGkrKylcbiAgICAgICAgICB0aGlzLnJhbmdlc1tpXSA9IG5ldyBSYW5nZShjbGlwUG9zKGRvYywgcmFuZ2VzW2ldLmFuY2hvciksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpcFBvcyhkb2MsIHJhbmdlc1tpXS5oZWFkKSk7XG4gICAgICB9XG4gICAgfTtcbiAgICBzaWduYWwoZG9jLCBcImJlZm9yZVNlbGVjdGlvbkNoYW5nZVwiLCBkb2MsIG9iaik7XG4gICAgaWYgKGRvYy5jbSkgc2lnbmFsKGRvYy5jbSwgXCJiZWZvcmVTZWxlY3Rpb25DaGFuZ2VcIiwgZG9jLmNtLCBvYmopO1xuICAgIGlmIChvYmoucmFuZ2VzICE9IHNlbC5yYW5nZXMpIHJldHVybiBub3JtYWxpemVTZWxlY3Rpb24ob2JqLnJhbmdlcywgb2JqLnJhbmdlcy5sZW5ndGggLSAxKTtcbiAgICBlbHNlIHJldHVybiBzZWw7XG4gIH1cblxuICBmdW5jdGlvbiBzZXRTZWxlY3Rpb25SZXBsYWNlSGlzdG9yeShkb2MsIHNlbCwgb3B0aW9ucykge1xuICAgIHZhciBkb25lID0gZG9jLmhpc3RvcnkuZG9uZSwgbGFzdCA9IGxzdChkb25lKTtcbiAgICBpZiAobGFzdCAmJiBsYXN0LnJhbmdlcykge1xuICAgICAgZG9uZVtkb25lLmxlbmd0aCAtIDFdID0gc2VsO1xuICAgICAgc2V0U2VsZWN0aW9uTm9VbmRvKGRvYywgc2VsLCBvcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0U2VsZWN0aW9uKGRvYywgc2VsLCBvcHRpb25zKTtcbiAgICB9XG4gIH1cblxuICAvLyBTZXQgYSBuZXcgc2VsZWN0aW9uLlxuICBmdW5jdGlvbiBzZXRTZWxlY3Rpb24oZG9jLCBzZWwsIG9wdGlvbnMpIHtcbiAgICBzZXRTZWxlY3Rpb25Ob1VuZG8oZG9jLCBzZWwsIG9wdGlvbnMpO1xuICAgIGFkZFNlbGVjdGlvblRvSGlzdG9yeShkb2MsIGRvYy5zZWwsIGRvYy5jbSA/IGRvYy5jbS5jdXJPcC5pZCA6IE5hTiwgb3B0aW9ucyk7XG4gIH1cblxuICBmdW5jdGlvbiBzZXRTZWxlY3Rpb25Ob1VuZG8oZG9jLCBzZWwsIG9wdGlvbnMpIHtcbiAgICBpZiAoaGFzSGFuZGxlcihkb2MsIFwiYmVmb3JlU2VsZWN0aW9uQ2hhbmdlXCIpIHx8IGRvYy5jbSAmJiBoYXNIYW5kbGVyKGRvYy5jbSwgXCJiZWZvcmVTZWxlY3Rpb25DaGFuZ2VcIikpXG4gICAgICBzZWwgPSBmaWx0ZXJTZWxlY3Rpb25DaGFuZ2UoZG9jLCBzZWwpO1xuXG4gICAgdmFyIGJpYXMgPSBvcHRpb25zICYmIG9wdGlvbnMuYmlhcyB8fFxuICAgICAgKGNtcChzZWwucHJpbWFyeSgpLmhlYWQsIGRvYy5zZWwucHJpbWFyeSgpLmhlYWQpIDwgMCA/IC0xIDogMSk7XG4gICAgc2V0U2VsZWN0aW9uSW5uZXIoZG9jLCBza2lwQXRvbWljSW5TZWxlY3Rpb24oZG9jLCBzZWwsIGJpYXMsIHRydWUpKTtcblxuICAgIGlmICghKG9wdGlvbnMgJiYgb3B0aW9ucy5zY3JvbGwgPT09IGZhbHNlKSAmJiBkb2MuY20pXG4gICAgICBlbnN1cmVDdXJzb3JWaXNpYmxlKGRvYy5jbSk7XG4gIH1cblxuICBmdW5jdGlvbiBzZXRTZWxlY3Rpb25Jbm5lcihkb2MsIHNlbCkge1xuICAgIGlmIChzZWwuZXF1YWxzKGRvYy5zZWwpKSByZXR1cm47XG5cbiAgICBkb2Muc2VsID0gc2VsO1xuXG4gICAgaWYgKGRvYy5jbSkge1xuICAgICAgZG9jLmNtLmN1ck9wLnVwZGF0ZUlucHV0ID0gZG9jLmNtLmN1ck9wLnNlbGVjdGlvbkNoYW5nZWQgPSB0cnVlO1xuICAgICAgc2lnbmFsQ3Vyc29yQWN0aXZpdHkoZG9jLmNtKTtcbiAgICB9XG4gICAgc2lnbmFsTGF0ZXIoZG9jLCBcImN1cnNvckFjdGl2aXR5XCIsIGRvYyk7XG4gIH1cblxuICAvLyBWZXJpZnkgdGhhdCB0aGUgc2VsZWN0aW9uIGRvZXMgbm90IHBhcnRpYWxseSBzZWxlY3QgYW55IGF0b21pY1xuICAvLyBtYXJrZWQgcmFuZ2VzLlxuICBmdW5jdGlvbiByZUNoZWNrU2VsZWN0aW9uKGRvYykge1xuICAgIHNldFNlbGVjdGlvbklubmVyKGRvYywgc2tpcEF0b21pY0luU2VsZWN0aW9uKGRvYywgZG9jLnNlbCwgbnVsbCwgZmFsc2UpLCBzZWxfZG9udFNjcm9sbCk7XG4gIH1cblxuICAvLyBSZXR1cm4gYSBzZWxlY3Rpb24gdGhhdCBkb2VzIG5vdCBwYXJ0aWFsbHkgc2VsZWN0IGFueSBhdG9taWNcbiAgLy8gcmFuZ2VzLlxuICBmdW5jdGlvbiBza2lwQXRvbWljSW5TZWxlY3Rpb24oZG9jLCBzZWwsIGJpYXMsIG1heUNsZWFyKSB7XG4gICAgdmFyIG91dDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlbC5yYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciByYW5nZSA9IHNlbC5yYW5nZXNbaV07XG4gICAgICB2YXIgbmV3QW5jaG9yID0gc2tpcEF0b21pYyhkb2MsIHJhbmdlLmFuY2hvciwgYmlhcywgbWF5Q2xlYXIpO1xuICAgICAgdmFyIG5ld0hlYWQgPSBza2lwQXRvbWljKGRvYywgcmFuZ2UuaGVhZCwgYmlhcywgbWF5Q2xlYXIpO1xuICAgICAgaWYgKG91dCB8fCBuZXdBbmNob3IgIT0gcmFuZ2UuYW5jaG9yIHx8IG5ld0hlYWQgIT0gcmFuZ2UuaGVhZCkge1xuICAgICAgICBpZiAoIW91dCkgb3V0ID0gc2VsLnJhbmdlcy5zbGljZSgwLCBpKTtcbiAgICAgICAgb3V0W2ldID0gbmV3IFJhbmdlKG5ld0FuY2hvciwgbmV3SGVhZCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdXQgPyBub3JtYWxpemVTZWxlY3Rpb24ob3V0LCBzZWwucHJpbUluZGV4KSA6IHNlbDtcbiAgfVxuXG4gIC8vIEVuc3VyZSBhIGdpdmVuIHBvc2l0aW9uIGlzIG5vdCBpbnNpZGUgYW4gYXRvbWljIHJhbmdlLlxuICBmdW5jdGlvbiBza2lwQXRvbWljKGRvYywgcG9zLCBiaWFzLCBtYXlDbGVhcikge1xuICAgIHZhciBmbGlwcGVkID0gZmFsc2UsIGN1clBvcyA9IHBvcztcbiAgICB2YXIgZGlyID0gYmlhcyB8fCAxO1xuICAgIGRvYy5jYW50RWRpdCA9IGZhbHNlO1xuICAgIHNlYXJjaDogZm9yICg7Oykge1xuICAgICAgdmFyIGxpbmUgPSBnZXRMaW5lKGRvYywgY3VyUG9zLmxpbmUpO1xuICAgICAgaWYgKGxpbmUubWFya2VkU3BhbnMpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lLm1hcmtlZFNwYW5zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgdmFyIHNwID0gbGluZS5tYXJrZWRTcGFuc1tpXSwgbSA9IHNwLm1hcmtlcjtcbiAgICAgICAgICBpZiAoKHNwLmZyb20gPT0gbnVsbCB8fCAobS5pbmNsdXNpdmVMZWZ0ID8gc3AuZnJvbSA8PSBjdXJQb3MuY2ggOiBzcC5mcm9tIDwgY3VyUG9zLmNoKSkgJiZcbiAgICAgICAgICAgICAgKHNwLnRvID09IG51bGwgfHwgKG0uaW5jbHVzaXZlUmlnaHQgPyBzcC50byA+PSBjdXJQb3MuY2ggOiBzcC50byA+IGN1clBvcy5jaCkpKSB7XG4gICAgICAgICAgICBpZiAobWF5Q2xlYXIpIHtcbiAgICAgICAgICAgICAgc2lnbmFsKG0sIFwiYmVmb3JlQ3Vyc29yRW50ZXJcIik7XG4gICAgICAgICAgICAgIGlmIChtLmV4cGxpY2l0bHlDbGVhcmVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFsaW5lLm1hcmtlZFNwYW5zKSBicmVhaztcbiAgICAgICAgICAgICAgICBlbHNlIHstLWk7IGNvbnRpbnVlO31cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFtLmF0b21pYykgY29udGludWU7XG4gICAgICAgICAgICB2YXIgbmV3UG9zID0gbS5maW5kKGRpciA8IDAgPyAtMSA6IDEpO1xuICAgICAgICAgICAgaWYgKGNtcChuZXdQb3MsIGN1clBvcykgPT0gMCkge1xuICAgICAgICAgICAgICBuZXdQb3MuY2ggKz0gZGlyO1xuICAgICAgICAgICAgICBpZiAobmV3UG9zLmNoIDwgMCkge1xuICAgICAgICAgICAgICAgIGlmIChuZXdQb3MubGluZSA+IGRvYy5maXJzdCkgbmV3UG9zID0gY2xpcFBvcyhkb2MsIFBvcyhuZXdQb3MubGluZSAtIDEpKTtcbiAgICAgICAgICAgICAgICBlbHNlIG5ld1BvcyA9IG51bGw7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3UG9zLmNoID4gbGluZS50ZXh0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmIChuZXdQb3MubGluZSA8IGRvYy5maXJzdCArIGRvYy5zaXplIC0gMSkgbmV3UG9zID0gUG9zKG5ld1Bvcy5saW5lICsgMSwgMCk7XG4gICAgICAgICAgICAgICAgZWxzZSBuZXdQb3MgPSBudWxsO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmICghbmV3UG9zKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZsaXBwZWQpIHtcbiAgICAgICAgICAgICAgICAgIC8vIERyaXZlbiBpbiBhIGNvcm5lciAtLSBubyB2YWxpZCBjdXJzb3IgcG9zaXRpb24gZm91bmQgYXQgYWxsXG4gICAgICAgICAgICAgICAgICAvLyAtLSB0cnkgYWdhaW4gKndpdGgqIGNsZWFyaW5nLCBpZiB3ZSBkaWRuJ3QgYWxyZWFkeVxuICAgICAgICAgICAgICAgICAgaWYgKCFtYXlDbGVhcikgcmV0dXJuIHNraXBBdG9taWMoZG9jLCBwb3MsIGJpYXMsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgLy8gT3RoZXJ3aXNlLCB0dXJuIG9mZiBlZGl0aW5nIHVudGlsIGZ1cnRoZXIgbm90aWNlLCBhbmQgcmV0dXJuIHRoZSBzdGFydCBvZiB0aGUgZG9jXG4gICAgICAgICAgICAgICAgICBkb2MuY2FudEVkaXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFBvcyhkb2MuZmlyc3QsIDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmbGlwcGVkID0gdHJ1ZTsgbmV3UG9zID0gcG9zOyBkaXIgPSAtZGlyO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjdXJQb3MgPSBuZXdQb3M7XG4gICAgICAgICAgICBjb250aW51ZSBzZWFyY2g7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gY3VyUG9zO1xuICAgIH1cbiAgfVxuXG4gIC8vIFNFTEVDVElPTiBEUkFXSU5HXG5cbiAgLy8gUmVkcmF3IHRoZSBzZWxlY3Rpb24gYW5kL29yIGN1cnNvclxuICBmdW5jdGlvbiB1cGRhdGVTZWxlY3Rpb24oY20pIHtcbiAgICB2YXIgZGlzcGxheSA9IGNtLmRpc3BsYXksIGRvYyA9IGNtLmRvYztcbiAgICB2YXIgY3VyRnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgdmFyIHNlbEZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkb2Muc2VsLnJhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHJhbmdlID0gZG9jLnNlbC5yYW5nZXNbaV07XG4gICAgICB2YXIgY29sbGFwc2VkID0gcmFuZ2UuZW1wdHkoKTtcbiAgICAgIGlmIChjb2xsYXBzZWQgfHwgY20ub3B0aW9ucy5zaG93Q3Vyc29yV2hlblNlbGVjdGluZylcbiAgICAgICAgZHJhd1NlbGVjdGlvbkN1cnNvcihjbSwgcmFuZ2UsIGN1ckZyYWdtZW50KTtcbiAgICAgIGlmICghY29sbGFwc2VkKVxuICAgICAgICBkcmF3U2VsZWN0aW9uUmFuZ2UoY20sIHJhbmdlLCBzZWxGcmFnbWVudCk7XG4gICAgfVxuXG4gICAgLy8gTW92ZSB0aGUgaGlkZGVuIHRleHRhcmVhIG5lYXIgdGhlIGN1cnNvciB0byBwcmV2ZW50IHNjcm9sbGluZyBhcnRpZmFjdHNcbiAgICBpZiAoY20ub3B0aW9ucy5tb3ZlSW5wdXRXaXRoQ3Vyc29yKSB7XG4gICAgICB2YXIgaGVhZFBvcyA9IGN1cnNvckNvb3JkcyhjbSwgZG9jLnNlbC5wcmltYXJ5KCkuaGVhZCwgXCJkaXZcIik7XG4gICAgICB2YXIgd3JhcE9mZiA9IGRpc3BsYXkud3JhcHBlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSwgbGluZU9mZiA9IGRpc3BsYXkubGluZURpdi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIHZhciB0b3AgPSBNYXRoLm1heCgwLCBNYXRoLm1pbihkaXNwbGF5LndyYXBwZXIuY2xpZW50SGVpZ2h0IC0gMTAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhZFBvcy50b3AgKyBsaW5lT2ZmLnRvcCAtIHdyYXBPZmYudG9wKSk7XG4gICAgICB2YXIgbGVmdCA9IE1hdGgubWF4KDAsIE1hdGgubWluKGRpc3BsYXkud3JhcHBlci5jbGllbnRXaWR0aCAtIDEwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkUG9zLmxlZnQgKyBsaW5lT2ZmLmxlZnQgLSB3cmFwT2ZmLmxlZnQpKTtcbiAgICAgIGRpc3BsYXkuaW5wdXREaXYuc3R5bGUudG9wID0gdG9wICsgXCJweFwiO1xuICAgICAgZGlzcGxheS5pbnB1dERpdi5zdHlsZS5sZWZ0ID0gbGVmdCArIFwicHhcIjtcbiAgICB9XG5cbiAgICByZW1vdmVDaGlsZHJlbkFuZEFkZChkaXNwbGF5LmN1cnNvckRpdiwgY3VyRnJhZ21lbnQpO1xuICAgIHJlbW92ZUNoaWxkcmVuQW5kQWRkKGRpc3BsYXkuc2VsZWN0aW9uRGl2LCBzZWxGcmFnbWVudCk7XG4gIH1cblxuICAvLyBEcmF3cyBhIGN1cnNvciBmb3IgdGhlIGdpdmVuIHJhbmdlXG4gIGZ1bmN0aW9uIGRyYXdTZWxlY3Rpb25DdXJzb3IoY20sIHJhbmdlLCBvdXRwdXQpIHtcbiAgICB2YXIgcG9zID0gY3Vyc29yQ29vcmRzKGNtLCByYW5nZS5oZWFkLCBcImRpdlwiKTtcblxuICAgIHZhciBjdXJzb3IgPSBvdXRwdXQuYXBwZW5kQ2hpbGQoZWx0KFwiZGl2XCIsIFwiXFx1MDBhMFwiLCBcIkNvZGVNaXJyb3ItY3Vyc29yXCIpKTtcbiAgICBjdXJzb3Iuc3R5bGUubGVmdCA9IHBvcy5sZWZ0ICsgXCJweFwiO1xuICAgIGN1cnNvci5zdHlsZS50b3AgPSBwb3MudG9wICsgXCJweFwiO1xuICAgIGN1cnNvci5zdHlsZS5oZWlnaHQgPSBNYXRoLm1heCgwLCBwb3MuYm90dG9tIC0gcG9zLnRvcCkgKiBjbS5vcHRpb25zLmN1cnNvckhlaWdodCArIFwicHhcIjtcblxuICAgIGlmIChwb3Mub3RoZXIpIHtcbiAgICAgIC8vIFNlY29uZGFyeSBjdXJzb3IsIHNob3duIHdoZW4gb24gYSAnanVtcCcgaW4gYmktZGlyZWN0aW9uYWwgdGV4dFxuICAgICAgdmFyIG90aGVyQ3Vyc29yID0gb3V0cHV0LmFwcGVuZENoaWxkKGVsdChcImRpdlwiLCBcIlxcdTAwYTBcIiwgXCJDb2RlTWlycm9yLWN1cnNvciBDb2RlTWlycm9yLXNlY29uZGFyeWN1cnNvclwiKSk7XG4gICAgICBvdGhlckN1cnNvci5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcbiAgICAgIG90aGVyQ3Vyc29yLnN0eWxlLmxlZnQgPSBwb3Mub3RoZXIubGVmdCArIFwicHhcIjtcbiAgICAgIG90aGVyQ3Vyc29yLnN0eWxlLnRvcCA9IHBvcy5vdGhlci50b3AgKyBcInB4XCI7XG4gICAgICBvdGhlckN1cnNvci5zdHlsZS5oZWlnaHQgPSAocG9zLm90aGVyLmJvdHRvbSAtIHBvcy5vdGhlci50b3ApICogLjg1ICsgXCJweFwiO1xuICAgIH1cbiAgfVxuXG4gIC8vIERyYXdzIHRoZSBnaXZlbiByYW5nZSBhcyBhIGhpZ2hsaWdodGVkIHNlbGVjdGlvblxuICBmdW5jdGlvbiBkcmF3U2VsZWN0aW9uUmFuZ2UoY20sIHJhbmdlLCBvdXRwdXQpIHtcbiAgICB2YXIgZGlzcGxheSA9IGNtLmRpc3BsYXksIGRvYyA9IGNtLmRvYztcbiAgICB2YXIgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgdmFyIHBhZGRpbmcgPSBwYWRkaW5nSChjbS5kaXNwbGF5KSwgbGVmdFNpZGUgPSBwYWRkaW5nLmxlZnQsIHJpZ2h0U2lkZSA9IGRpc3BsYXkubGluZVNwYWNlLm9mZnNldFdpZHRoIC0gcGFkZGluZy5yaWdodDtcblxuICAgIGZ1bmN0aW9uIGFkZChsZWZ0LCB0b3AsIHdpZHRoLCBib3R0b20pIHtcbiAgICAgIGlmICh0b3AgPCAwKSB0b3AgPSAwO1xuICAgICAgdG9wID0gTWF0aC5yb3VuZCh0b3ApO1xuICAgICAgYm90dG9tID0gTWF0aC5yb3VuZChib3R0b20pO1xuICAgICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoZWx0KFwiZGl2XCIsIG51bGwsIFwiQ29kZU1pcnJvci1zZWxlY3RlZFwiLCBcInBvc2l0aW9uOiBhYnNvbHV0ZTsgbGVmdDogXCIgKyBsZWZ0ICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInB4OyB0b3A6IFwiICsgdG9wICsgXCJweDsgd2lkdGg6IFwiICsgKHdpZHRoID09IG51bGwgPyByaWdodFNpZGUgLSBsZWZ0IDogd2lkdGgpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInB4OyBoZWlnaHQ6IFwiICsgKGJvdHRvbSAtIHRvcCkgKyBcInB4XCIpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcmF3Rm9yTGluZShsaW5lLCBmcm9tQXJnLCB0b0FyZykge1xuICAgICAgdmFyIGxpbmVPYmogPSBnZXRMaW5lKGRvYywgbGluZSk7XG4gICAgICB2YXIgbGluZUxlbiA9IGxpbmVPYmoudGV4dC5sZW5ndGg7XG4gICAgICB2YXIgc3RhcnQsIGVuZDtcbiAgICAgIGZ1bmN0aW9uIGNvb3JkcyhjaCwgYmlhcykge1xuICAgICAgICByZXR1cm4gY2hhckNvb3JkcyhjbSwgUG9zKGxpbmUsIGNoKSwgXCJkaXZcIiwgbGluZU9iaiwgYmlhcyk7XG4gICAgICB9XG5cbiAgICAgIGl0ZXJhdGVCaWRpU2VjdGlvbnMoZ2V0T3JkZXIobGluZU9iaiksIGZyb21BcmcgfHwgMCwgdG9BcmcgPT0gbnVsbCA/IGxpbmVMZW4gOiB0b0FyZywgZnVuY3Rpb24oZnJvbSwgdG8sIGRpcikge1xuICAgICAgICB2YXIgbGVmdFBvcyA9IGNvb3Jkcyhmcm9tLCBcImxlZnRcIiksIHJpZ2h0UG9zLCBsZWZ0LCByaWdodDtcbiAgICAgICAgaWYgKGZyb20gPT0gdG8pIHtcbiAgICAgICAgICByaWdodFBvcyA9IGxlZnRQb3M7XG4gICAgICAgICAgbGVmdCA9IHJpZ2h0ID0gbGVmdFBvcy5sZWZ0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJpZ2h0UG9zID0gY29vcmRzKHRvIC0gMSwgXCJyaWdodFwiKTtcbiAgICAgICAgICBpZiAoZGlyID09IFwicnRsXCIpIHsgdmFyIHRtcCA9IGxlZnRQb3M7IGxlZnRQb3MgPSByaWdodFBvczsgcmlnaHRQb3MgPSB0bXA7IH1cbiAgICAgICAgICBsZWZ0ID0gbGVmdFBvcy5sZWZ0O1xuICAgICAgICAgIHJpZ2h0ID0gcmlnaHRQb3MucmlnaHQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZyb21BcmcgPT0gbnVsbCAmJiBmcm9tID09IDApIGxlZnQgPSBsZWZ0U2lkZTtcbiAgICAgICAgaWYgKHJpZ2h0UG9zLnRvcCAtIGxlZnRQb3MudG9wID4gMykgeyAvLyBEaWZmZXJlbnQgbGluZXMsIGRyYXcgdG9wIHBhcnRcbiAgICAgICAgICBhZGQobGVmdCwgbGVmdFBvcy50b3AsIG51bGwsIGxlZnRQb3MuYm90dG9tKTtcbiAgICAgICAgICBsZWZ0ID0gbGVmdFNpZGU7XG4gICAgICAgICAgaWYgKGxlZnRQb3MuYm90dG9tIDwgcmlnaHRQb3MudG9wKSBhZGQobGVmdCwgbGVmdFBvcy5ib3R0b20sIG51bGwsIHJpZ2h0UG9zLnRvcCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRvQXJnID09IG51bGwgJiYgdG8gPT0gbGluZUxlbikgcmlnaHQgPSByaWdodFNpZGU7XG4gICAgICAgIGlmICghc3RhcnQgfHwgbGVmdFBvcy50b3AgPCBzdGFydC50b3AgfHwgbGVmdFBvcy50b3AgPT0gc3RhcnQudG9wICYmIGxlZnRQb3MubGVmdCA8IHN0YXJ0LmxlZnQpXG4gICAgICAgICAgc3RhcnQgPSBsZWZ0UG9zO1xuICAgICAgICBpZiAoIWVuZCB8fCByaWdodFBvcy5ib3R0b20gPiBlbmQuYm90dG9tIHx8IHJpZ2h0UG9zLmJvdHRvbSA9PSBlbmQuYm90dG9tICYmIHJpZ2h0UG9zLnJpZ2h0ID4gZW5kLnJpZ2h0KVxuICAgICAgICAgIGVuZCA9IHJpZ2h0UG9zO1xuICAgICAgICBpZiAobGVmdCA8IGxlZnRTaWRlICsgMSkgbGVmdCA9IGxlZnRTaWRlO1xuICAgICAgICBhZGQobGVmdCwgcmlnaHRQb3MudG9wLCByaWdodCAtIGxlZnQsIHJpZ2h0UG9zLmJvdHRvbSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB7c3RhcnQ6IHN0YXJ0LCBlbmQ6IGVuZH07XG4gICAgfVxuXG4gICAgdmFyIHNGcm9tID0gcmFuZ2UuZnJvbSgpLCBzVG8gPSByYW5nZS50bygpO1xuICAgIGlmIChzRnJvbS5saW5lID09IHNUby5saW5lKSB7XG4gICAgICBkcmF3Rm9yTGluZShzRnJvbS5saW5lLCBzRnJvbS5jaCwgc1RvLmNoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGZyb21MaW5lID0gZ2V0TGluZShkb2MsIHNGcm9tLmxpbmUpLCB0b0xpbmUgPSBnZXRMaW5lKGRvYywgc1RvLmxpbmUpO1xuICAgICAgdmFyIHNpbmdsZVZMaW5lID0gdmlzdWFsTGluZShmcm9tTGluZSkgPT0gdmlzdWFsTGluZSh0b0xpbmUpO1xuICAgICAgdmFyIGxlZnRFbmQgPSBkcmF3Rm9yTGluZShzRnJvbS5saW5lLCBzRnJvbS5jaCwgc2luZ2xlVkxpbmUgPyBmcm9tTGluZS50ZXh0Lmxlbmd0aCArIDEgOiBudWxsKS5lbmQ7XG4gICAgICB2YXIgcmlnaHRTdGFydCA9IGRyYXdGb3JMaW5lKHNUby5saW5lLCBzaW5nbGVWTGluZSA/IDAgOiBudWxsLCBzVG8uY2gpLnN0YXJ0O1xuICAgICAgaWYgKHNpbmdsZVZMaW5lKSB7XG4gICAgICAgIGlmIChsZWZ0RW5kLnRvcCA8IHJpZ2h0U3RhcnQudG9wIC0gMikge1xuICAgICAgICAgIGFkZChsZWZ0RW5kLnJpZ2h0LCBsZWZ0RW5kLnRvcCwgbnVsbCwgbGVmdEVuZC5ib3R0b20pO1xuICAgICAgICAgIGFkZChsZWZ0U2lkZSwgcmlnaHRTdGFydC50b3AsIHJpZ2h0U3RhcnQubGVmdCwgcmlnaHRTdGFydC5ib3R0b20pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFkZChsZWZ0RW5kLnJpZ2h0LCBsZWZ0RW5kLnRvcCwgcmlnaHRTdGFydC5sZWZ0IC0gbGVmdEVuZC5yaWdodCwgbGVmdEVuZC5ib3R0b20pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAobGVmdEVuZC5ib3R0b20gPCByaWdodFN0YXJ0LnRvcClcbiAgICAgICAgYWRkKGxlZnRTaWRlLCBsZWZ0RW5kLmJvdHRvbSwgbnVsbCwgcmlnaHRTdGFydC50b3ApO1xuICAgIH1cblxuICAgIG91dHB1dC5hcHBlbmRDaGlsZChmcmFnbWVudCk7XG4gIH1cblxuICAvLyBDdXJzb3ItYmxpbmtpbmdcbiAgZnVuY3Rpb24gcmVzdGFydEJsaW5rKGNtKSB7XG4gICAgaWYgKCFjbS5zdGF0ZS5mb2N1c2VkKSByZXR1cm47XG4gICAgdmFyIGRpc3BsYXkgPSBjbS5kaXNwbGF5O1xuICAgIGNsZWFySW50ZXJ2YWwoZGlzcGxheS5ibGlua2VyKTtcbiAgICB2YXIgb24gPSB0cnVlO1xuICAgIGRpc3BsYXkuY3Vyc29yRGl2LnN0eWxlLnZpc2liaWxpdHkgPSBcIlwiO1xuICAgIGlmIChjbS5vcHRpb25zLmN1cnNvckJsaW5rUmF0ZSA+IDApXG4gICAgICBkaXNwbGF5LmJsaW5rZXIgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgICAgZGlzcGxheS5jdXJzb3JEaXYuc3R5bGUudmlzaWJpbGl0eSA9IChvbiA9ICFvbikgPyBcIlwiIDogXCJoaWRkZW5cIjtcbiAgICAgIH0sIGNtLm9wdGlvbnMuY3Vyc29yQmxpbmtSYXRlKTtcbiAgfVxuXG4gIC8vIEhJR0hMSUdIVCBXT1JLRVJcblxuICBmdW5jdGlvbiBzdGFydFdvcmtlcihjbSwgdGltZSkge1xuICAgIGlmIChjbS5kb2MubW9kZS5zdGFydFN0YXRlICYmIGNtLmRvYy5mcm9udGllciA8IGNtLmRpc3BsYXkudmlld1RvKVxuICAgICAgY20uc3RhdGUuaGlnaGxpZ2h0LnNldCh0aW1lLCBiaW5kKGhpZ2hsaWdodFdvcmtlciwgY20pKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhpZ2hsaWdodFdvcmtlcihjbSkge1xuICAgIHZhciBkb2MgPSBjbS5kb2M7XG4gICAgaWYgKGRvYy5mcm9udGllciA8IGRvYy5maXJzdCkgZG9jLmZyb250aWVyID0gZG9jLmZpcnN0O1xuICAgIGlmIChkb2MuZnJvbnRpZXIgPj0gY20uZGlzcGxheS52aWV3VG8pIHJldHVybjtcbiAgICB2YXIgZW5kID0gK25ldyBEYXRlICsgY20ub3B0aW9ucy53b3JrVGltZTtcbiAgICB2YXIgc3RhdGUgPSBjb3B5U3RhdGUoZG9jLm1vZGUsIGdldFN0YXRlQmVmb3JlKGNtLCBkb2MuZnJvbnRpZXIpKTtcblxuICAgIHJ1bkluT3AoY20sIGZ1bmN0aW9uKCkge1xuICAgIGRvYy5pdGVyKGRvYy5mcm9udGllciwgTWF0aC5taW4oZG9jLmZpcnN0ICsgZG9jLnNpemUsIGNtLmRpc3BsYXkudmlld1RvICsgNTAwKSwgZnVuY3Rpb24obGluZSkge1xuICAgICAgaWYgKGRvYy5mcm9udGllciA+PSBjbS5kaXNwbGF5LnZpZXdGcm9tKSB7IC8vIFZpc2libGVcbiAgICAgICAgdmFyIG9sZFN0eWxlcyA9IGxpbmUuc3R5bGVzO1xuICAgICAgICB2YXIgaGlnaGxpZ2h0ZWQgPSBoaWdobGlnaHRMaW5lKGNtLCBsaW5lLCBzdGF0ZSwgdHJ1ZSk7XG4gICAgICAgIGxpbmUuc3R5bGVzID0gaGlnaGxpZ2h0ZWQuc3R5bGVzO1xuICAgICAgICBpZiAoaGlnaGxpZ2h0ZWQuY2xhc3NlcykgbGluZS5zdHlsZUNsYXNzZXMgPSBoaWdobGlnaHRlZC5jbGFzc2VzO1xuICAgICAgICBlbHNlIGlmIChsaW5lLnN0eWxlQ2xhc3NlcykgbGluZS5zdHlsZUNsYXNzZXMgPSBudWxsO1xuICAgICAgICB2YXIgaXNjaGFuZ2UgPSAhb2xkU3R5bGVzIHx8IG9sZFN0eWxlcy5sZW5ndGggIT0gbGluZS5zdHlsZXMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgIWlzY2hhbmdlICYmIGkgPCBvbGRTdHlsZXMubGVuZ3RoOyArK2kpIGlzY2hhbmdlID0gb2xkU3R5bGVzW2ldICE9IGxpbmUuc3R5bGVzW2ldO1xuICAgICAgICBpZiAoaXNjaGFuZ2UpIHJlZ0xpbmVDaGFuZ2UoY20sIGRvYy5mcm9udGllciwgXCJ0ZXh0XCIpO1xuICAgICAgICBsaW5lLnN0YXRlQWZ0ZXIgPSBjb3B5U3RhdGUoZG9jLm1vZGUsIHN0YXRlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByb2Nlc3NMaW5lKGNtLCBsaW5lLnRleHQsIHN0YXRlKTtcbiAgICAgICAgbGluZS5zdGF0ZUFmdGVyID0gZG9jLmZyb250aWVyICUgNSA9PSAwID8gY29weVN0YXRlKGRvYy5tb2RlLCBzdGF0ZSkgOiBudWxsO1xuICAgICAgfVxuICAgICAgKytkb2MuZnJvbnRpZXI7XG4gICAgICBpZiAoK25ldyBEYXRlID4gZW5kKSB7XG4gICAgICAgIHN0YXJ0V29ya2VyKGNtLCBjbS5vcHRpb25zLndvcmtEZWxheSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gRmluZHMgdGhlIGxpbmUgdG8gc3RhcnQgd2l0aCB3aGVuIHN0YXJ0aW5nIGEgcGFyc2UuIFRyaWVzIHRvXG4gIC8vIGZpbmQgYSBsaW5lIHdpdGggYSBzdGF0ZUFmdGVyLCBzbyB0aGF0IGl0IGNhbiBzdGFydCB3aXRoIGFcbiAgLy8gdmFsaWQgc3RhdGUuIElmIHRoYXQgZmFpbHMsIGl0IHJldHVybnMgdGhlIGxpbmUgd2l0aCB0aGVcbiAgLy8gc21hbGxlc3QgaW5kZW50YXRpb24sIHdoaWNoIHRlbmRzIHRvIG5lZWQgdGhlIGxlYXN0IGNvbnRleHQgdG9cbiAgLy8gcGFyc2UgY29ycmVjdGx5LlxuICBmdW5jdGlvbiBmaW5kU3RhcnRMaW5lKGNtLCBuLCBwcmVjaXNlKSB7XG4gICAgdmFyIG1pbmluZGVudCwgbWlubGluZSwgZG9jID0gY20uZG9jO1xuICAgIHZhciBsaW0gPSBwcmVjaXNlID8gLTEgOiBuIC0gKGNtLmRvYy5tb2RlLmlubmVyTW9kZSA/IDEwMDAgOiAxMDApO1xuICAgIGZvciAodmFyIHNlYXJjaCA9IG47IHNlYXJjaCA+IGxpbTsgLS1zZWFyY2gpIHtcbiAgICAgIGlmIChzZWFyY2ggPD0gZG9jLmZpcnN0KSByZXR1cm4gZG9jLmZpcnN0O1xuICAgICAgdmFyIGxpbmUgPSBnZXRMaW5lKGRvYywgc2VhcmNoIC0gMSk7XG4gICAgICBpZiAobGluZS5zdGF0ZUFmdGVyICYmICghcHJlY2lzZSB8fCBzZWFyY2ggPD0gZG9jLmZyb250aWVyKSkgcmV0dXJuIHNlYXJjaDtcbiAgICAgIHZhciBpbmRlbnRlZCA9IGNvdW50Q29sdW1uKGxpbmUudGV4dCwgbnVsbCwgY20ub3B0aW9ucy50YWJTaXplKTtcbiAgICAgIGlmIChtaW5saW5lID09IG51bGwgfHwgbWluaW5kZW50ID4gaW5kZW50ZWQpIHtcbiAgICAgICAgbWlubGluZSA9IHNlYXJjaCAtIDE7XG4gICAgICAgIG1pbmluZGVudCA9IGluZGVudGVkO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWlubGluZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFN0YXRlQmVmb3JlKGNtLCBuLCBwcmVjaXNlKSB7XG4gICAgdmFyIGRvYyA9IGNtLmRvYywgZGlzcGxheSA9IGNtLmRpc3BsYXk7XG4gICAgaWYgKCFkb2MubW9kZS5zdGFydFN0YXRlKSByZXR1cm4gdHJ1ZTtcbiAgICB2YXIgcG9zID0gZmluZFN0YXJ0TGluZShjbSwgbiwgcHJlY2lzZSksIHN0YXRlID0gcG9zID4gZG9jLmZpcnN0ICYmIGdldExpbmUoZG9jLCBwb3MtMSkuc3RhdGVBZnRlcjtcbiAgICBpZiAoIXN0YXRlKSBzdGF0ZSA9IHN0YXJ0U3RhdGUoZG9jLm1vZGUpO1xuICAgIGVsc2Ugc3RhdGUgPSBjb3B5U3RhdGUoZG9jLm1vZGUsIHN0YXRlKTtcbiAgICBkb2MuaXRlcihwb3MsIG4sIGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIHByb2Nlc3NMaW5lKGNtLCBsaW5lLnRleHQsIHN0YXRlKTtcbiAgICAgIHZhciBzYXZlID0gcG9zID09IG4gLSAxIHx8IHBvcyAlIDUgPT0gMCB8fCBwb3MgPj0gZGlzcGxheS52aWV3RnJvbSAmJiBwb3MgPCBkaXNwbGF5LnZpZXdUbztcbiAgICAgIGxpbmUuc3RhdGVBZnRlciA9IHNhdmUgPyBjb3B5U3RhdGUoZG9jLm1vZGUsIHN0YXRlKSA6IG51bGw7XG4gICAgICArK3BvcztcbiAgICB9KTtcbiAgICBpZiAocHJlY2lzZSkgZG9jLmZyb250aWVyID0gcG9zO1xuICAgIHJldHVybiBzdGF0ZTtcbiAgfVxuXG4gIC8vIFBPU0lUSU9OIE1FQVNVUkVNRU5UXG5cbiAgZnVuY3Rpb24gcGFkZGluZ1RvcChkaXNwbGF5KSB7cmV0dXJuIGRpc3BsYXkubGluZVNwYWNlLm9mZnNldFRvcDt9XG4gIGZ1bmN0aW9uIHBhZGRpbmdWZXJ0KGRpc3BsYXkpIHtyZXR1cm4gZGlzcGxheS5tb3Zlci5vZmZzZXRIZWlnaHQgLSBkaXNwbGF5LmxpbmVTcGFjZS5vZmZzZXRIZWlnaHQ7fVxuICBmdW5jdGlvbiBwYWRkaW5nSChkaXNwbGF5KSB7XG4gICAgaWYgKGRpc3BsYXkuY2FjaGVkUGFkZGluZ0gpIHJldHVybiBkaXNwbGF5LmNhY2hlZFBhZGRpbmdIO1xuICAgIHZhciBlID0gcmVtb3ZlQ2hpbGRyZW5BbmRBZGQoZGlzcGxheS5tZWFzdXJlLCBlbHQoXCJwcmVcIiwgXCJ4XCIpKTtcbiAgICB2YXIgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSA/IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGUpIDogZS5jdXJyZW50U3R5bGU7XG4gICAgdmFyIGRhdGEgPSB7bGVmdDogcGFyc2VJbnQoc3R5bGUucGFkZGluZ0xlZnQpLCByaWdodDogcGFyc2VJbnQoc3R5bGUucGFkZGluZ1JpZ2h0KX07XG4gICAgaWYgKCFpc05hTihkYXRhLmxlZnQpICYmICFpc05hTihkYXRhLnJpZ2h0KSkgZGlzcGxheS5jYWNoZWRQYWRkaW5nSCA9IGRhdGE7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICAvLyBFbnN1cmUgdGhlIGxpbmVWaWV3LndyYXBwaW5nLmhlaWdodHMgYXJyYXkgaXMgcG9wdWxhdGVkLiBUaGlzIGlzXG4gIC8vIGFuIGFycmF5IG9mIGJvdHRvbSBvZmZzZXRzIGZvciB0aGUgbGluZXMgdGhhdCBtYWtlIHVwIGEgZHJhd25cbiAgLy8gbGluZS4gV2hlbiBsaW5lV3JhcHBpbmcgaXMgb24sIHRoZXJlIG1pZ2h0IGJlIG1vcmUgdGhhbiBvbmVcbiAgLy8gaGVpZ2h0LlxuICBmdW5jdGlvbiBlbnN1cmVMaW5lSGVpZ2h0cyhjbSwgbGluZVZpZXcsIHJlY3QpIHtcbiAgICB2YXIgd3JhcHBpbmcgPSBjbS5vcHRpb25zLmxpbmVXcmFwcGluZztcbiAgICB2YXIgY3VyV2lkdGggPSB3cmFwcGluZyAmJiBjbS5kaXNwbGF5LnNjcm9sbGVyLmNsaWVudFdpZHRoO1xuICAgIGlmICghbGluZVZpZXcubWVhc3VyZS5oZWlnaHRzIHx8IHdyYXBwaW5nICYmIGxpbmVWaWV3Lm1lYXN1cmUud2lkdGggIT0gY3VyV2lkdGgpIHtcbiAgICAgIHZhciBoZWlnaHRzID0gbGluZVZpZXcubWVhc3VyZS5oZWlnaHRzID0gW107XG4gICAgICBpZiAod3JhcHBpbmcpIHtcbiAgICAgICAgbGluZVZpZXcubWVhc3VyZS53aWR0aCA9IGN1cldpZHRoO1xuICAgICAgICB2YXIgcmVjdHMgPSBsaW5lVmlldy50ZXh0LmZpcnN0Q2hpbGQuZ2V0Q2xpZW50UmVjdHMoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWN0cy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgICB2YXIgY3VyID0gcmVjdHNbaV0sIG5leHQgPSByZWN0c1tpICsgMV07XG4gICAgICAgICAgaWYgKE1hdGguYWJzKGN1ci5ib3R0b20gLSBuZXh0LmJvdHRvbSkgPiAyKVxuICAgICAgICAgICAgaGVpZ2h0cy5wdXNoKChjdXIuYm90dG9tICsgbmV4dC50b3ApIC8gMiAtIHJlY3QudG9wKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaGVpZ2h0cy5wdXNoKHJlY3QuYm90dG9tIC0gcmVjdC50b3ApO1xuICAgIH1cbiAgfVxuXG4gIC8vIEZpbmQgYSBsaW5lIG1hcCAobWFwcGluZyBjaGFyYWN0ZXIgb2Zmc2V0cyB0byB0ZXh0IG5vZGVzKSBhbmQgYVxuICAvLyBtZWFzdXJlbWVudCBjYWNoZSBmb3IgdGhlIGdpdmVuIGxpbmUgbnVtYmVyLiAoQSBsaW5lIHZpZXcgbWlnaHRcbiAgLy8gY29udGFpbiBtdWx0aXBsZSBsaW5lcyB3aGVuIGNvbGxhcHNlZCByYW5nZXMgYXJlIHByZXNlbnQuKVxuICBmdW5jdGlvbiBtYXBGcm9tTGluZVZpZXcobGluZVZpZXcsIGxpbmUsIGxpbmVOKSB7XG4gICAgaWYgKGxpbmVWaWV3LmxpbmUgPT0gbGluZSlcbiAgICAgIHJldHVybiB7bWFwOiBsaW5lVmlldy5tZWFzdXJlLm1hcCwgY2FjaGU6IGxpbmVWaWV3Lm1lYXN1cmUuY2FjaGV9O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZVZpZXcucmVzdC5sZW5ndGg7IGkrKylcbiAgICAgIGlmIChsaW5lVmlldy5yZXN0W2ldID09IGxpbmUpXG4gICAgICAgIHJldHVybiB7bWFwOiBsaW5lVmlldy5tZWFzdXJlLm1hcHNbaV0sIGNhY2hlOiBsaW5lVmlldy5tZWFzdXJlLmNhY2hlc1tpXX07XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lVmlldy5yZXN0Lmxlbmd0aDsgaSsrKVxuICAgICAgaWYgKGxpbmVObyhsaW5lVmlldy5yZXN0W2ldKSA+IGxpbmVOKVxuICAgICAgICByZXR1cm4ge21hcDogbGluZVZpZXcubWVhc3VyZS5tYXBzW2ldLCBjYWNoZTogbGluZVZpZXcubWVhc3VyZS5jYWNoZXNbaV0sIGJlZm9yZTogdHJ1ZX07XG4gIH1cblxuICAvLyBSZW5kZXIgYSBsaW5lIGludG8gdGhlIGhpZGRlbiBub2RlIGRpc3BsYXkuZXh0ZXJuYWxNZWFzdXJlZC4gVXNlZFxuICAvLyB3aGVuIG1lYXN1cmVtZW50IGlzIG5lZWRlZCBmb3IgYSBsaW5lIHRoYXQncyBub3QgaW4gdGhlIHZpZXdwb3J0LlxuICBmdW5jdGlvbiB1cGRhdGVFeHRlcm5hbE1lYXN1cmVtZW50KGNtLCBsaW5lKSB7XG4gICAgbGluZSA9IHZpc3VhbExpbmUobGluZSk7XG4gICAgdmFyIGxpbmVOID0gbGluZU5vKGxpbmUpO1xuICAgIHZhciB2aWV3ID0gY20uZGlzcGxheS5leHRlcm5hbE1lYXN1cmVkID0gbmV3IExpbmVWaWV3KGNtLmRvYywgbGluZSwgbGluZU4pO1xuICAgIHZpZXcubGluZU4gPSBsaW5lTjtcbiAgICB2YXIgYnVpbHQgPSB2aWV3LmJ1aWx0ID0gYnVpbGRMaW5lQ29udGVudChjbSwgdmlldyk7XG4gICAgdmlldy50ZXh0ID0gYnVpbHQucHJlO1xuICAgIHJlbW92ZUNoaWxkcmVuQW5kQWRkKGNtLmRpc3BsYXkubGluZU1lYXN1cmUsIGJ1aWx0LnByZSk7XG4gICAgcmV0dXJuIHZpZXc7XG4gIH1cblxuICAvLyBHZXQgYSB7dG9wLCBib3R0b20sIGxlZnQsIHJpZ2h0fSBib3ggKGluIGxpbmUtbG9jYWwgY29vcmRpbmF0ZXMpXG4gIC8vIGZvciBhIGdpdmVuIGNoYXJhY3Rlci5cbiAgZnVuY3Rpb24gbWVhc3VyZUNoYXIoY20sIGxpbmUsIGNoLCBiaWFzKSB7XG4gICAgcmV0dXJuIG1lYXN1cmVDaGFyUHJlcGFyZWQoY20sIHByZXBhcmVNZWFzdXJlRm9yTGluZShjbSwgbGluZSksIGNoLCBiaWFzKTtcbiAgfVxuXG4gIC8vIEZpbmQgYSBsaW5lIHZpZXcgdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgZ2l2ZW4gbGluZSBudW1iZXIuXG4gIGZ1bmN0aW9uIGZpbmRWaWV3Rm9yTGluZShjbSwgbGluZU4pIHtcbiAgICBpZiAobGluZU4gPj0gY20uZGlzcGxheS52aWV3RnJvbSAmJiBsaW5lTiA8IGNtLmRpc3BsYXkudmlld1RvKVxuICAgICAgcmV0dXJuIGNtLmRpc3BsYXkudmlld1tmaW5kVmlld0luZGV4KGNtLCBsaW5lTildO1xuICAgIHZhciBleHQgPSBjbS5kaXNwbGF5LmV4dGVybmFsTWVhc3VyZWQ7XG4gICAgaWYgKGV4dCAmJiBsaW5lTiA+PSBleHQubGluZU4gJiYgbGluZU4gPCBleHQubGluZU4gKyBleHQuc2l6ZSlcbiAgICAgIHJldHVybiBleHQ7XG4gIH1cblxuICAvLyBNZWFzdXJlbWVudCBjYW4gYmUgc3BsaXQgaW4gdHdvIHN0ZXBzLCB0aGUgc2V0LXVwIHdvcmsgdGhhdFxuICAvLyBhcHBsaWVzIHRvIHRoZSB3aG9sZSBsaW5lLCBhbmQgdGhlIG1lYXN1cmVtZW50IG9mIHRoZSBhY3R1YWxcbiAgLy8gY2hhcmFjdGVyLiBGdW5jdGlvbnMgbGlrZSBjb29yZHNDaGFyLCB0aGF0IG5lZWQgdG8gZG8gYSBsb3Qgb2ZcbiAgLy8gbWVhc3VyZW1lbnRzIGluIGEgcm93LCBjYW4gdGh1cyBlbnN1cmUgdGhhdCB0aGUgc2V0LXVwIHdvcmsgaXNcbiAgLy8gb25seSBkb25lIG9uY2UuXG4gIGZ1bmN0aW9uIHByZXBhcmVNZWFzdXJlRm9yTGluZShjbSwgbGluZSkge1xuICAgIHZhciBsaW5lTiA9IGxpbmVObyhsaW5lKTtcbiAgICB2YXIgdmlldyA9IGZpbmRWaWV3Rm9yTGluZShjbSwgbGluZU4pO1xuICAgIGlmICh2aWV3ICYmICF2aWV3LnRleHQpXG4gICAgICB2aWV3ID0gbnVsbDtcbiAgICBlbHNlIGlmICh2aWV3ICYmIHZpZXcuY2hhbmdlcylcbiAgICAgIHVwZGF0ZUxpbmVGb3JDaGFuZ2VzKGNtLCB2aWV3LCBsaW5lTiwgZ2V0RGltZW5zaW9ucyhjbSkpO1xuICAgIGlmICghdmlldylcbiAgICAgIHZpZXcgPSB1cGRhdGVFeHRlcm5hbE1lYXN1cmVtZW50KGNtLCBsaW5lKTtcblxuICAgIHZhciBpbmZvID0gbWFwRnJvbUxpbmVWaWV3KHZpZXcsIGxpbmUsIGxpbmVOKTtcbiAgICByZXR1cm4ge1xuICAgICAgbGluZTogbGluZSwgdmlldzogdmlldywgcmVjdDogbnVsbCxcbiAgICAgIG1hcDogaW5mby5tYXAsIGNhY2hlOiBpbmZvLmNhY2hlLCBiZWZvcmU6IGluZm8uYmVmb3JlLFxuICAgICAgaGFzSGVpZ2h0czogZmFsc2VcbiAgICB9O1xuICB9XG5cbiAgLy8gR2l2ZW4gYSBwcmVwYXJlZCBtZWFzdXJlbWVudCBvYmplY3QsIG1lYXN1cmVzIHRoZSBwb3NpdGlvbiBvZiBhblxuICAvLyBhY3R1YWwgY2hhcmFjdGVyIChvciBmZXRjaGVzIGl0IGZyb20gdGhlIGNhY2hlKS5cbiAgZnVuY3Rpb24gbWVhc3VyZUNoYXJQcmVwYXJlZChjbSwgcHJlcGFyZWQsIGNoLCBiaWFzKSB7XG4gICAgaWYgKHByZXBhcmVkLmJlZm9yZSkgY2ggPSAtMTtcbiAgICB2YXIga2V5ID0gY2ggKyAoYmlhcyB8fCBcIlwiKSwgZm91bmQ7XG4gICAgaWYgKHByZXBhcmVkLmNhY2hlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIGZvdW5kID0gcHJlcGFyZWQuY2FjaGVba2V5XTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFwcmVwYXJlZC5yZWN0KVxuICAgICAgICBwcmVwYXJlZC5yZWN0ID0gcHJlcGFyZWQudmlldy50ZXh0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgaWYgKCFwcmVwYXJlZC5oYXNIZWlnaHRzKSB7XG4gICAgICAgIGVuc3VyZUxpbmVIZWlnaHRzKGNtLCBwcmVwYXJlZC52aWV3LCBwcmVwYXJlZC5yZWN0KTtcbiAgICAgICAgcHJlcGFyZWQuaGFzSGVpZ2h0cyA9IHRydWU7XG4gICAgICB9XG4gICAgICBmb3VuZCA9IG1lYXN1cmVDaGFySW5uZXIoY20sIHByZXBhcmVkLCBjaCwgYmlhcyk7XG4gICAgICBpZiAoIWZvdW5kLmJvZ3VzKSBwcmVwYXJlZC5jYWNoZVtrZXldID0gZm91bmQ7XG4gICAgfVxuICAgIHJldHVybiB7bGVmdDogZm91bmQubGVmdCwgcmlnaHQ6IGZvdW5kLnJpZ2h0LCB0b3A6IGZvdW5kLnRvcCwgYm90dG9tOiBmb3VuZC5ib3R0b219O1xuICB9XG5cbiAgdmFyIG51bGxSZWN0ID0ge2xlZnQ6IDAsIHJpZ2h0OiAwLCB0b3A6IDAsIGJvdHRvbTogMH07XG5cbiAgZnVuY3Rpb24gbWVhc3VyZUNoYXJJbm5lcihjbSwgcHJlcGFyZWQsIGNoLCBiaWFzKSB7XG4gICAgdmFyIG1hcCA9IHByZXBhcmVkLm1hcDtcblxuICAgIHZhciBub2RlLCBzdGFydCwgZW5kLCBjb2xsYXBzZTtcbiAgICAvLyBGaXJzdCwgc2VhcmNoIHRoZSBsaW5lIG1hcCBmb3IgdGhlIHRleHQgbm9kZSBjb3JyZXNwb25kaW5nIHRvLFxuICAgIC8vIG9yIGNsb3Nlc3QgdG8sIHRoZSB0YXJnZXQgY2hhcmFjdGVyLlxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWFwLmxlbmd0aDsgaSArPSAzKSB7XG4gICAgICB2YXIgbVN0YXJ0ID0gbWFwW2ldLCBtRW5kID0gbWFwW2kgKyAxXTtcbiAgICAgIGlmIChjaCA8IG1TdGFydCkge1xuICAgICAgICBzdGFydCA9IDA7IGVuZCA9IDE7XG4gICAgICAgIGNvbGxhcHNlID0gXCJsZWZ0XCI7XG4gICAgICB9IGVsc2UgaWYgKGNoIDwgbUVuZCkge1xuICAgICAgICBzdGFydCA9IGNoIC0gbVN0YXJ0O1xuICAgICAgICBlbmQgPSBzdGFydCArIDE7XG4gICAgICB9IGVsc2UgaWYgKGkgPT0gbWFwLmxlbmd0aCAtIDMgfHwgY2ggPT0gbUVuZCAmJiBtYXBbaSArIDNdID4gY2gpIHtcbiAgICAgICAgZW5kID0gbUVuZCAtIG1TdGFydDtcbiAgICAgICAgc3RhcnQgPSBlbmQgLSAxO1xuICAgICAgICBpZiAoY2ggPj0gbUVuZCkgY29sbGFwc2UgPSBcInJpZ2h0XCI7XG4gICAgICB9XG4gICAgICBpZiAoc3RhcnQgIT0gbnVsbCkge1xuICAgICAgICBub2RlID0gbWFwW2kgKyAyXTtcbiAgICAgICAgaWYgKG1TdGFydCA9PSBtRW5kICYmIGJpYXMgPT0gKG5vZGUuaW5zZXJ0TGVmdCA/IFwibGVmdFwiIDogXCJyaWdodFwiKSlcbiAgICAgICAgICBjb2xsYXBzZSA9IGJpYXM7XG4gICAgICAgIGlmIChiaWFzID09IFwibGVmdFwiICYmIHN0YXJ0ID09IDApXG4gICAgICAgICAgd2hpbGUgKGkgJiYgbWFwW2kgLSAyXSA9PSBtYXBbaSAtIDNdICYmIG1hcFtpIC0gMV0uaW5zZXJ0TGVmdCkge1xuICAgICAgICAgICAgbm9kZSA9IG1hcFsoaSAtPSAzKSArIDJdO1xuICAgICAgICAgICAgY29sbGFwc2UgPSBcImxlZnRcIjtcbiAgICAgICAgICB9XG4gICAgICAgIGlmIChiaWFzID09IFwicmlnaHRcIiAmJiBzdGFydCA9PSBtRW5kIC0gbVN0YXJ0KVxuICAgICAgICAgIHdoaWxlIChpIDwgbWFwLmxlbmd0aCAtIDMgJiYgbWFwW2kgKyAzXSA9PSBtYXBbaSArIDRdICYmICFtYXBbaSArIDVdLmluc2VydExlZnQpIHtcbiAgICAgICAgICAgIG5vZGUgPSBtYXBbKGkgKz0gMykgKyAyXTtcbiAgICAgICAgICAgIGNvbGxhcHNlID0gXCJyaWdodFwiO1xuICAgICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHJlY3Q7XG4gICAgaWYgKG5vZGUubm9kZVR5cGUgPT0gMykgeyAvLyBJZiBpdCBpcyBhIHRleHQgbm9kZSwgdXNlIGEgcmFuZ2UgdG8gcmV0cmlldmUgdGhlIGNvb3JkaW5hdGVzLlxuICAgICAgd2hpbGUgKHN0YXJ0ICYmIGlzRXh0ZW5kaW5nQ2hhcihwcmVwYXJlZC5saW5lLnRleHQuY2hhckF0KG1TdGFydCArIHN0YXJ0KSkpIC0tc3RhcnQ7XG4gICAgICB3aGlsZSAobVN0YXJ0ICsgZW5kIDwgbUVuZCAmJiBpc0V4dGVuZGluZ0NoYXIocHJlcGFyZWQubGluZS50ZXh0LmNoYXJBdChtU3RhcnQgKyBlbmQpKSkgKytlbmQ7XG4gICAgICBpZiAoaWVfdXB0bzggJiYgc3RhcnQgPT0gMCAmJiBlbmQgPT0gbUVuZCAtIG1TdGFydCkge1xuICAgICAgICByZWN0ID0gbm9kZS5wYXJlbnROb2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgfSBlbHNlIGlmIChpZSAmJiBjbS5vcHRpb25zLmxpbmVXcmFwcGluZykge1xuICAgICAgICB2YXIgcmVjdHMgPSByYW5nZShub2RlLCBzdGFydCwgZW5kKS5nZXRDbGllbnRSZWN0cygpO1xuICAgICAgICBpZiAocmVjdHMubGVuZ3RoKVxuICAgICAgICAgIHJlY3QgPSByZWN0c1tiaWFzID09IFwicmlnaHRcIiA/IHJlY3RzLmxlbmd0aCAtIDEgOiAwXTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJlY3QgPSBudWxsUmVjdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlY3QgPSByYW5nZShub2RlLCBzdGFydCwgZW5kKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSB8fCBudWxsUmVjdDtcbiAgICAgIH1cbiAgICB9IGVsc2UgeyAvLyBJZiBpdCBpcyBhIHdpZGdldCwgc2ltcGx5IGdldCB0aGUgYm94IGZvciB0aGUgd2hvbGUgd2lkZ2V0LlxuICAgICAgaWYgKHN0YXJ0ID4gMCkgY29sbGFwc2UgPSBiaWFzID0gXCJyaWdodFwiO1xuICAgICAgdmFyIHJlY3RzO1xuICAgICAgaWYgKGNtLm9wdGlvbnMubGluZVdyYXBwaW5nICYmIChyZWN0cyA9IG5vZGUuZ2V0Q2xpZW50UmVjdHMoKSkubGVuZ3RoID4gMSlcbiAgICAgICAgcmVjdCA9IHJlY3RzW2JpYXMgPT0gXCJyaWdodFwiID8gcmVjdHMubGVuZ3RoIC0gMSA6IDBdO1xuICAgICAgZWxzZVxuICAgICAgICByZWN0ID0gbm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICB9XG4gICAgaWYgKGllX3VwdG84ICYmICFzdGFydCAmJiAoIXJlY3QgfHwgIXJlY3QubGVmdCAmJiAhcmVjdC5yaWdodCkpIHtcbiAgICAgIHZhciByU3BhbiA9IG5vZGUucGFyZW50Tm9kZS5nZXRDbGllbnRSZWN0cygpWzBdO1xuICAgICAgaWYgKHJTcGFuKVxuICAgICAgICByZWN0ID0ge2xlZnQ6IHJTcGFuLmxlZnQsIHJpZ2h0OiByU3Bhbi5sZWZ0ICsgY2hhcldpZHRoKGNtLmRpc3BsYXkpLCB0b3A6IHJTcGFuLnRvcCwgYm90dG9tOiByU3Bhbi5ib3R0b219O1xuICAgICAgZWxzZVxuICAgICAgICByZWN0ID0gbnVsbFJlY3Q7XG4gICAgfVxuXG4gICAgdmFyIHRvcCwgYm90ID0gKHJlY3QuYm90dG9tICsgcmVjdC50b3ApIC8gMiAtIHByZXBhcmVkLnJlY3QudG9wO1xuICAgIHZhciBoZWlnaHRzID0gcHJlcGFyZWQudmlldy5tZWFzdXJlLmhlaWdodHM7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBoZWlnaHRzLmxlbmd0aCAtIDE7IGkrKylcbiAgICAgIGlmIChib3QgPCBoZWlnaHRzW2ldKSBicmVhaztcbiAgICB0b3AgPSBpID8gaGVpZ2h0c1tpIC0gMV0gOiAwOyBib3QgPSBoZWlnaHRzW2ldO1xuICAgIHZhciByZXN1bHQgPSB7bGVmdDogKGNvbGxhcHNlID09IFwicmlnaHRcIiA/IHJlY3QucmlnaHQgOiByZWN0LmxlZnQpIC0gcHJlcGFyZWQucmVjdC5sZWZ0LFxuICAgICAgICAgICAgICAgICAgcmlnaHQ6IChjb2xsYXBzZSA9PSBcImxlZnRcIiA/IHJlY3QubGVmdCA6IHJlY3QucmlnaHQpIC0gcHJlcGFyZWQucmVjdC5sZWZ0LFxuICAgICAgICAgICAgICAgICAgdG9wOiB0b3AsIGJvdHRvbTogYm90fTtcbiAgICBpZiAoIXJlY3QubGVmdCAmJiAhcmVjdC5yaWdodCkgcmVzdWx0LmJvZ3VzID0gdHJ1ZTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gY2xlYXJMaW5lTWVhc3VyZW1lbnRDYWNoZUZvcihsaW5lVmlldykge1xuICAgIGlmIChsaW5lVmlldy5tZWFzdXJlKSB7XG4gICAgICBsaW5lVmlldy5tZWFzdXJlLmNhY2hlID0ge307XG4gICAgICBsaW5lVmlldy5tZWFzdXJlLmhlaWdodHMgPSBudWxsO1xuICAgICAgaWYgKGxpbmVWaWV3LnJlc3QpIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZVZpZXcucmVzdC5sZW5ndGg7IGkrKylcbiAgICAgICAgbGluZVZpZXcubWVhc3VyZS5jYWNoZXNbaV0gPSB7fTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjbGVhckxpbmVNZWFzdXJlbWVudENhY2hlKGNtKSB7XG4gICAgY20uZGlzcGxheS5leHRlcm5hbE1lYXN1cmUgPSBudWxsO1xuICAgIHJlbW92ZUNoaWxkcmVuKGNtLmRpc3BsYXkubGluZU1lYXN1cmUpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY20uZGlzcGxheS52aWV3Lmxlbmd0aDsgaSsrKVxuICAgICAgY2xlYXJMaW5lTWVhc3VyZW1lbnRDYWNoZUZvcihjbS5kaXNwbGF5LnZpZXdbaV0pO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xlYXJDYWNoZXMoY20pIHtcbiAgICBjbGVhckxpbmVNZWFzdXJlbWVudENhY2hlKGNtKTtcbiAgICBjbS5kaXNwbGF5LmNhY2hlZENoYXJXaWR0aCA9IGNtLmRpc3BsYXkuY2FjaGVkVGV4dEhlaWdodCA9IGNtLmRpc3BsYXkuY2FjaGVkUGFkZGluZ0ggPSBudWxsO1xuICAgIGlmICghY20ub3B0aW9ucy5saW5lV3JhcHBpbmcpIGNtLmRpc3BsYXkubWF4TGluZUNoYW5nZWQgPSB0cnVlO1xuICAgIGNtLmRpc3BsYXkubGluZU51bUNoYXJzID0gbnVsbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhZ2VTY3JvbGxYKCkgeyByZXR1cm4gd2luZG93LnBhZ2VYT2Zmc2V0IHx8IChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keSkuc2Nyb2xsTGVmdDsgfVxuICBmdW5jdGlvbiBwYWdlU2Nyb2xsWSgpIHsgcmV0dXJuIHdpbmRvdy5wYWdlWU9mZnNldCB8fCAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IGRvY3VtZW50LmJvZHkpLnNjcm9sbFRvcDsgfVxuXG4gIC8vIENvbnZlcnRzIGEge3RvcCwgYm90dG9tLCBsZWZ0LCByaWdodH0gYm94IGZyb20gbGluZS1sb2NhbFxuICAvLyBjb29yZGluYXRlcyBpbnRvIGFub3RoZXIgY29vcmRpbmF0ZSBzeXN0ZW0uIENvbnRleHQgbWF5IGJlIG9uZSBvZlxuICAvLyBcImxpbmVcIiwgXCJkaXZcIiAoZGlzcGxheS5saW5lRGl2KSwgXCJsb2NhbFwiL251bGwgKGVkaXRvciksIG9yIFwicGFnZVwiLlxuICBmdW5jdGlvbiBpbnRvQ29vcmRTeXN0ZW0oY20sIGxpbmVPYmosIHJlY3QsIGNvbnRleHQpIHtcbiAgICBpZiAobGluZU9iai53aWRnZXRzKSBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVPYmoud2lkZ2V0cy5sZW5ndGg7ICsraSkgaWYgKGxpbmVPYmoud2lkZ2V0c1tpXS5hYm92ZSkge1xuICAgICAgdmFyIHNpemUgPSB3aWRnZXRIZWlnaHQobGluZU9iai53aWRnZXRzW2ldKTtcbiAgICAgIHJlY3QudG9wICs9IHNpemU7IHJlY3QuYm90dG9tICs9IHNpemU7XG4gICAgfVxuICAgIGlmIChjb250ZXh0ID09IFwibGluZVwiKSByZXR1cm4gcmVjdDtcbiAgICBpZiAoIWNvbnRleHQpIGNvbnRleHQgPSBcImxvY2FsXCI7XG4gICAgdmFyIHlPZmYgPSBoZWlnaHRBdExpbmUobGluZU9iaik7XG4gICAgaWYgKGNvbnRleHQgPT0gXCJsb2NhbFwiKSB5T2ZmICs9IHBhZGRpbmdUb3AoY20uZGlzcGxheSk7XG4gICAgZWxzZSB5T2ZmIC09IGNtLmRpc3BsYXkudmlld09mZnNldDtcbiAgICBpZiAoY29udGV4dCA9PSBcInBhZ2VcIiB8fCBjb250ZXh0ID09IFwid2luZG93XCIpIHtcbiAgICAgIHZhciBsT2ZmID0gY20uZGlzcGxheS5saW5lU3BhY2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICB5T2ZmICs9IGxPZmYudG9wICsgKGNvbnRleHQgPT0gXCJ3aW5kb3dcIiA/IDAgOiBwYWdlU2Nyb2xsWSgpKTtcbiAgICAgIHZhciB4T2ZmID0gbE9mZi5sZWZ0ICsgKGNvbnRleHQgPT0gXCJ3aW5kb3dcIiA/IDAgOiBwYWdlU2Nyb2xsWCgpKTtcbiAgICAgIHJlY3QubGVmdCArPSB4T2ZmOyByZWN0LnJpZ2h0ICs9IHhPZmY7XG4gICAgfVxuICAgIHJlY3QudG9wICs9IHlPZmY7IHJlY3QuYm90dG9tICs9IHlPZmY7XG4gICAgcmV0dXJuIHJlY3Q7XG4gIH1cblxuICAvLyBDb3ZlcnRzIGEgYm94IGZyb20gXCJkaXZcIiBjb29yZHMgdG8gYW5vdGhlciBjb29yZGluYXRlIHN5c3RlbS5cbiAgLy8gQ29udGV4dCBtYXkgYmUgXCJ3aW5kb3dcIiwgXCJwYWdlXCIsIFwiZGl2XCIsIG9yIFwibG9jYWxcIi9udWxsLlxuICBmdW5jdGlvbiBmcm9tQ29vcmRTeXN0ZW0oY20sIGNvb3JkcywgY29udGV4dCkge1xuICAgIGlmIChjb250ZXh0ID09IFwiZGl2XCIpIHJldHVybiBjb29yZHM7XG4gICAgdmFyIGxlZnQgPSBjb29yZHMubGVmdCwgdG9wID0gY29vcmRzLnRvcDtcbiAgICAvLyBGaXJzdCBtb3ZlIGludG8gXCJwYWdlXCIgY29vcmRpbmF0ZSBzeXN0ZW1cbiAgICBpZiAoY29udGV4dCA9PSBcInBhZ2VcIikge1xuICAgICAgbGVmdCAtPSBwYWdlU2Nyb2xsWCgpO1xuICAgICAgdG9wIC09IHBhZ2VTY3JvbGxZKCk7XG4gICAgfSBlbHNlIGlmIChjb250ZXh0ID09IFwibG9jYWxcIiB8fCAhY29udGV4dCkge1xuICAgICAgdmFyIGxvY2FsQm94ID0gY20uZGlzcGxheS5zaXplci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIGxlZnQgKz0gbG9jYWxCb3gubGVmdDtcbiAgICAgIHRvcCArPSBsb2NhbEJveC50b3A7XG4gICAgfVxuXG4gICAgdmFyIGxpbmVTcGFjZUJveCA9IGNtLmRpc3BsYXkubGluZVNwYWNlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHJldHVybiB7bGVmdDogbGVmdCAtIGxpbmVTcGFjZUJveC5sZWZ0LCB0b3A6IHRvcCAtIGxpbmVTcGFjZUJveC50b3B9O1xuICB9XG5cbiAgZnVuY3Rpb24gY2hhckNvb3JkcyhjbSwgcG9zLCBjb250ZXh0LCBsaW5lT2JqLCBiaWFzKSB7XG4gICAgaWYgKCFsaW5lT2JqKSBsaW5lT2JqID0gZ2V0TGluZShjbS5kb2MsIHBvcy5saW5lKTtcbiAgICByZXR1cm4gaW50b0Nvb3JkU3lzdGVtKGNtLCBsaW5lT2JqLCBtZWFzdXJlQ2hhcihjbSwgbGluZU9iaiwgcG9zLmNoLCBiaWFzKSwgY29udGV4dCk7XG4gIH1cblxuICAvLyBSZXR1cm5zIGEgYm94IGZvciBhIGdpdmVuIGN1cnNvciBwb3NpdGlvbiwgd2hpY2ggbWF5IGhhdmUgYW5cbiAgLy8gJ290aGVyJyBwcm9wZXJ0eSBjb250YWluaW5nIHRoZSBwb3NpdGlvbiBvZiB0aGUgc2Vjb25kYXJ5IGN1cnNvclxuICAvLyBvbiBhIGJpZGkgYm91bmRhcnkuXG4gIGZ1bmN0aW9uIGN1cnNvckNvb3JkcyhjbSwgcG9zLCBjb250ZXh0LCBsaW5lT2JqLCBwcmVwYXJlZE1lYXN1cmUpIHtcbiAgICBsaW5lT2JqID0gbGluZU9iaiB8fCBnZXRMaW5lKGNtLmRvYywgcG9zLmxpbmUpO1xuICAgIGlmICghcHJlcGFyZWRNZWFzdXJlKSBwcmVwYXJlZE1lYXN1cmUgPSBwcmVwYXJlTWVhc3VyZUZvckxpbmUoY20sIGxpbmVPYmopO1xuICAgIGZ1bmN0aW9uIGdldChjaCwgcmlnaHQpIHtcbiAgICAgIHZhciBtID0gbWVhc3VyZUNoYXJQcmVwYXJlZChjbSwgcHJlcGFyZWRNZWFzdXJlLCBjaCwgcmlnaHQgPyBcInJpZ2h0XCIgOiBcImxlZnRcIik7XG4gICAgICBpZiAocmlnaHQpIG0ubGVmdCA9IG0ucmlnaHQ7IGVsc2UgbS5yaWdodCA9IG0ubGVmdDtcbiAgICAgIHJldHVybiBpbnRvQ29vcmRTeXN0ZW0oY20sIGxpbmVPYmosIG0sIGNvbnRleHQpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBnZXRCaWRpKGNoLCBwYXJ0UG9zKSB7XG4gICAgICB2YXIgcGFydCA9IG9yZGVyW3BhcnRQb3NdLCByaWdodCA9IHBhcnQubGV2ZWwgJSAyO1xuICAgICAgaWYgKGNoID09IGJpZGlMZWZ0KHBhcnQpICYmIHBhcnRQb3MgJiYgcGFydC5sZXZlbCA8IG9yZGVyW3BhcnRQb3MgLSAxXS5sZXZlbCkge1xuICAgICAgICBwYXJ0ID0gb3JkZXJbLS1wYXJ0UG9zXTtcbiAgICAgICAgY2ggPSBiaWRpUmlnaHQocGFydCkgLSAocGFydC5sZXZlbCAlIDIgPyAwIDogMSk7XG4gICAgICAgIHJpZ2h0ID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAoY2ggPT0gYmlkaVJpZ2h0KHBhcnQpICYmIHBhcnRQb3MgPCBvcmRlci5sZW5ndGggLSAxICYmIHBhcnQubGV2ZWwgPCBvcmRlcltwYXJ0UG9zICsgMV0ubGV2ZWwpIHtcbiAgICAgICAgcGFydCA9IG9yZGVyWysrcGFydFBvc107XG4gICAgICAgIGNoID0gYmlkaUxlZnQocGFydCkgLSBwYXJ0LmxldmVsICUgMjtcbiAgICAgICAgcmlnaHQgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChyaWdodCAmJiBjaCA9PSBwYXJ0LnRvICYmIGNoID4gcGFydC5mcm9tKSByZXR1cm4gZ2V0KGNoIC0gMSk7XG4gICAgICByZXR1cm4gZ2V0KGNoLCByaWdodCk7XG4gICAgfVxuICAgIHZhciBvcmRlciA9IGdldE9yZGVyKGxpbmVPYmopLCBjaCA9IHBvcy5jaDtcbiAgICBpZiAoIW9yZGVyKSByZXR1cm4gZ2V0KGNoKTtcbiAgICB2YXIgcGFydFBvcyA9IGdldEJpZGlQYXJ0QXQob3JkZXIsIGNoKTtcbiAgICB2YXIgdmFsID0gZ2V0QmlkaShjaCwgcGFydFBvcyk7XG4gICAgaWYgKGJpZGlPdGhlciAhPSBudWxsKSB2YWwub3RoZXIgPSBnZXRCaWRpKGNoLCBiaWRpT3RoZXIpO1xuICAgIHJldHVybiB2YWw7XG4gIH1cblxuICAvLyBVc2VkIHRvIGNoZWFwbHkgZXN0aW1hdGUgdGhlIGNvb3JkaW5hdGVzIGZvciBhIHBvc2l0aW9uLiBVc2VkIGZvclxuICAvLyBpbnRlcm1lZGlhdGUgc2Nyb2xsIHVwZGF0ZXMuXG4gIGZ1bmN0aW9uIGVzdGltYXRlQ29vcmRzKGNtLCBwb3MpIHtcbiAgICB2YXIgbGVmdCA9IDAsIHBvcyA9IGNsaXBQb3MoY20uZG9jLCBwb3MpO1xuICAgIGlmICghY20ub3B0aW9ucy5saW5lV3JhcHBpbmcpIGxlZnQgPSBjaGFyV2lkdGgoY20uZGlzcGxheSkgKiBwb3MuY2g7XG4gICAgdmFyIGxpbmVPYmogPSBnZXRMaW5lKGNtLmRvYywgcG9zLmxpbmUpO1xuICAgIHZhciB0b3AgPSBoZWlnaHRBdExpbmUobGluZU9iaikgKyBwYWRkaW5nVG9wKGNtLmRpc3BsYXkpO1xuICAgIHJldHVybiB7bGVmdDogbGVmdCwgcmlnaHQ6IGxlZnQsIHRvcDogdG9wLCBib3R0b206IHRvcCArIGxpbmVPYmouaGVpZ2h0fTtcbiAgfVxuXG4gIC8vIFBvc2l0aW9ucyByZXR1cm5lZCBieSBjb29yZHNDaGFyIGNvbnRhaW4gc29tZSBleHRyYSBpbmZvcm1hdGlvbi5cbiAgLy8geFJlbCBpcyB0aGUgcmVsYXRpdmUgeCBwb3NpdGlvbiBvZiB0aGUgaW5wdXQgY29vcmRpbmF0ZXMgY29tcGFyZWRcbiAgLy8gdG8gdGhlIGZvdW5kIHBvc2l0aW9uIChzbyB4UmVsID4gMCBtZWFucyB0aGUgY29vcmRpbmF0ZXMgYXJlIHRvXG4gIC8vIHRoZSByaWdodCBvZiB0aGUgY2hhcmFjdGVyIHBvc2l0aW9uLCBmb3IgZXhhbXBsZSkuIFdoZW4gb3V0c2lkZVxuICAvLyBpcyB0cnVlLCB0aGF0IG1lYW5zIHRoZSBjb29yZGluYXRlcyBsaWUgb3V0c2lkZSB0aGUgbGluZSdzXG4gIC8vIHZlcnRpY2FsIHJhbmdlLlxuICBmdW5jdGlvbiBQb3NXaXRoSW5mbyhsaW5lLCBjaCwgb3V0c2lkZSwgeFJlbCkge1xuICAgIHZhciBwb3MgPSBQb3MobGluZSwgY2gpO1xuICAgIHBvcy54UmVsID0geFJlbDtcbiAgICBpZiAob3V0c2lkZSkgcG9zLm91dHNpZGUgPSB0cnVlO1xuICAgIHJldHVybiBwb3M7XG4gIH1cblxuICAvLyBDb21wdXRlIHRoZSBjaGFyYWN0ZXIgcG9zaXRpb24gY2xvc2VzdCB0byB0aGUgZ2l2ZW4gY29vcmRpbmF0ZXMuXG4gIC8vIElucHV0IG11c3QgYmUgbGluZVNwYWNlLWxvY2FsIChcImRpdlwiIGNvb3JkaW5hdGUgc3lzdGVtKS5cbiAgZnVuY3Rpb24gY29vcmRzQ2hhcihjbSwgeCwgeSkge1xuICAgIHZhciBkb2MgPSBjbS5kb2M7XG4gICAgeSArPSBjbS5kaXNwbGF5LnZpZXdPZmZzZXQ7XG4gICAgaWYgKHkgPCAwKSByZXR1cm4gUG9zV2l0aEluZm8oZG9jLmZpcnN0LCAwLCB0cnVlLCAtMSk7XG4gICAgdmFyIGxpbmVOID0gbGluZUF0SGVpZ2h0KGRvYywgeSksIGxhc3QgPSBkb2MuZmlyc3QgKyBkb2Muc2l6ZSAtIDE7XG4gICAgaWYgKGxpbmVOID4gbGFzdClcbiAgICAgIHJldHVybiBQb3NXaXRoSW5mbyhkb2MuZmlyc3QgKyBkb2Muc2l6ZSAtIDEsIGdldExpbmUoZG9jLCBsYXN0KS50ZXh0Lmxlbmd0aCwgdHJ1ZSwgMSk7XG4gICAgaWYgKHggPCAwKSB4ID0gMDtcblxuICAgIHZhciBsaW5lT2JqID0gZ2V0TGluZShkb2MsIGxpbmVOKTtcbiAgICBmb3IgKDs7KSB7XG4gICAgICB2YXIgZm91bmQgPSBjb29yZHNDaGFySW5uZXIoY20sIGxpbmVPYmosIGxpbmVOLCB4LCB5KTtcbiAgICAgIHZhciBtZXJnZWQgPSBjb2xsYXBzZWRTcGFuQXRFbmQobGluZU9iaik7XG4gICAgICB2YXIgbWVyZ2VkUG9zID0gbWVyZ2VkICYmIG1lcmdlZC5maW5kKDAsIHRydWUpO1xuICAgICAgaWYgKG1lcmdlZCAmJiAoZm91bmQuY2ggPiBtZXJnZWRQb3MuZnJvbS5jaCB8fCBmb3VuZC5jaCA9PSBtZXJnZWRQb3MuZnJvbS5jaCAmJiBmb3VuZC54UmVsID4gMCkpXG4gICAgICAgIGxpbmVOID0gbGluZU5vKGxpbmVPYmogPSBtZXJnZWRQb3MudG8ubGluZSk7XG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiBmb3VuZDtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjb29yZHNDaGFySW5uZXIoY20sIGxpbmVPYmosIGxpbmVObywgeCwgeSkge1xuICAgIHZhciBpbm5lck9mZiA9IHkgLSBoZWlnaHRBdExpbmUobGluZU9iaik7XG4gICAgdmFyIHdyb25nTGluZSA9IGZhbHNlLCBhZGp1c3QgPSAyICogY20uZGlzcGxheS53cmFwcGVyLmNsaWVudFdpZHRoO1xuICAgIHZhciBwcmVwYXJlZE1lYXN1cmUgPSBwcmVwYXJlTWVhc3VyZUZvckxpbmUoY20sIGxpbmVPYmopO1xuXG4gICAgZnVuY3Rpb24gZ2V0WChjaCkge1xuICAgICAgdmFyIHNwID0gY3Vyc29yQ29vcmRzKGNtLCBQb3MobGluZU5vLCBjaCksIFwibGluZVwiLCBsaW5lT2JqLCBwcmVwYXJlZE1lYXN1cmUpO1xuICAgICAgd3JvbmdMaW5lID0gdHJ1ZTtcbiAgICAgIGlmIChpbm5lck9mZiA+IHNwLmJvdHRvbSkgcmV0dXJuIHNwLmxlZnQgLSBhZGp1c3Q7XG4gICAgICBlbHNlIGlmIChpbm5lck9mZiA8IHNwLnRvcCkgcmV0dXJuIHNwLmxlZnQgKyBhZGp1c3Q7XG4gICAgICBlbHNlIHdyb25nTGluZSA9IGZhbHNlO1xuICAgICAgcmV0dXJuIHNwLmxlZnQ7XG4gICAgfVxuXG4gICAgdmFyIGJpZGkgPSBnZXRPcmRlcihsaW5lT2JqKSwgZGlzdCA9IGxpbmVPYmoudGV4dC5sZW5ndGg7XG4gICAgdmFyIGZyb20gPSBsaW5lTGVmdChsaW5lT2JqKSwgdG8gPSBsaW5lUmlnaHQobGluZU9iaik7XG4gICAgdmFyIGZyb21YID0gZ2V0WChmcm9tKSwgZnJvbU91dHNpZGUgPSB3cm9uZ0xpbmUsIHRvWCA9IGdldFgodG8pLCB0b091dHNpZGUgPSB3cm9uZ0xpbmU7XG5cbiAgICBpZiAoeCA+IHRvWCkgcmV0dXJuIFBvc1dpdGhJbmZvKGxpbmVObywgdG8sIHRvT3V0c2lkZSwgMSk7XG4gICAgLy8gRG8gYSBiaW5hcnkgc2VhcmNoIGJldHdlZW4gdGhlc2UgYm91bmRzLlxuICAgIGZvciAoOzspIHtcbiAgICAgIGlmIChiaWRpID8gdG8gPT0gZnJvbSB8fCB0byA9PSBtb3ZlVmlzdWFsbHkobGluZU9iaiwgZnJvbSwgMSkgOiB0byAtIGZyb20gPD0gMSkge1xuICAgICAgICB2YXIgY2ggPSB4IDwgZnJvbVggfHwgeCAtIGZyb21YIDw9IHRvWCAtIHggPyBmcm9tIDogdG87XG4gICAgICAgIHZhciB4RGlmZiA9IHggLSAoY2ggPT0gZnJvbSA/IGZyb21YIDogdG9YKTtcbiAgICAgICAgd2hpbGUgKGlzRXh0ZW5kaW5nQ2hhcihsaW5lT2JqLnRleHQuY2hhckF0KGNoKSkpICsrY2g7XG4gICAgICAgIHZhciBwb3MgPSBQb3NXaXRoSW5mbyhsaW5lTm8sIGNoLCBjaCA9PSBmcm9tID8gZnJvbU91dHNpZGUgOiB0b091dHNpZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4RGlmZiA8IC0xID8gLTEgOiB4RGlmZiA+IDEgPyAxIDogMCk7XG4gICAgICAgIHJldHVybiBwb3M7XG4gICAgICB9XG4gICAgICB2YXIgc3RlcCA9IE1hdGguY2VpbChkaXN0IC8gMiksIG1pZGRsZSA9IGZyb20gKyBzdGVwO1xuICAgICAgaWYgKGJpZGkpIHtcbiAgICAgICAgbWlkZGxlID0gZnJvbTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdGVwOyArK2kpIG1pZGRsZSA9IG1vdmVWaXN1YWxseShsaW5lT2JqLCBtaWRkbGUsIDEpO1xuICAgICAgfVxuICAgICAgdmFyIG1pZGRsZVggPSBnZXRYKG1pZGRsZSk7XG4gICAgICBpZiAobWlkZGxlWCA+IHgpIHt0byA9IG1pZGRsZTsgdG9YID0gbWlkZGxlWDsgaWYgKHRvT3V0c2lkZSA9IHdyb25nTGluZSkgdG9YICs9IDEwMDA7IGRpc3QgPSBzdGVwO31cbiAgICAgIGVsc2Uge2Zyb20gPSBtaWRkbGU7IGZyb21YID0gbWlkZGxlWDsgZnJvbU91dHNpZGUgPSB3cm9uZ0xpbmU7IGRpc3QgLT0gc3RlcDt9XG4gICAgfVxuICB9XG5cbiAgdmFyIG1lYXN1cmVUZXh0O1xuICAvLyBDb21wdXRlIHRoZSBkZWZhdWx0IHRleHQgaGVpZ2h0LlxuICBmdW5jdGlvbiB0ZXh0SGVpZ2h0KGRpc3BsYXkpIHtcbiAgICBpZiAoZGlzcGxheS5jYWNoZWRUZXh0SGVpZ2h0ICE9IG51bGwpIHJldHVybiBkaXNwbGF5LmNhY2hlZFRleHRIZWlnaHQ7XG4gICAgaWYgKG1lYXN1cmVUZXh0ID09IG51bGwpIHtcbiAgICAgIG1lYXN1cmVUZXh0ID0gZWx0KFwicHJlXCIpO1xuICAgICAgLy8gTWVhc3VyZSBhIGJ1bmNoIG9mIGxpbmVzLCBmb3IgYnJvd3NlcnMgdGhhdCBjb21wdXRlXG4gICAgICAvLyBmcmFjdGlvbmFsIGhlaWdodHMuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ5OyArK2kpIHtcbiAgICAgICAgbWVhc3VyZVRleHQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJ4XCIpKTtcbiAgICAgICAgbWVhc3VyZVRleHQuYXBwZW5kQ2hpbGQoZWx0KFwiYnJcIikpO1xuICAgICAgfVxuICAgICAgbWVhc3VyZVRleHQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJ4XCIpKTtcbiAgICB9XG4gICAgcmVtb3ZlQ2hpbGRyZW5BbmRBZGQoZGlzcGxheS5tZWFzdXJlLCBtZWFzdXJlVGV4dCk7XG4gICAgdmFyIGhlaWdodCA9IG1lYXN1cmVUZXh0Lm9mZnNldEhlaWdodCAvIDUwO1xuICAgIGlmIChoZWlnaHQgPiAzKSBkaXNwbGF5LmNhY2hlZFRleHRIZWlnaHQgPSBoZWlnaHQ7XG4gICAgcmVtb3ZlQ2hpbGRyZW4oZGlzcGxheS5tZWFzdXJlKTtcbiAgICByZXR1cm4gaGVpZ2h0IHx8IDE7XG4gIH1cblxuICAvLyBDb21wdXRlIHRoZSBkZWZhdWx0IGNoYXJhY3RlciB3aWR0aC5cbiAgZnVuY3Rpb24gY2hhcldpZHRoKGRpc3BsYXkpIHtcbiAgICBpZiAoZGlzcGxheS5jYWNoZWRDaGFyV2lkdGggIT0gbnVsbCkgcmV0dXJuIGRpc3BsYXkuY2FjaGVkQ2hhcldpZHRoO1xuICAgIHZhciBhbmNob3IgPSBlbHQoXCJzcGFuXCIsIFwieHh4eHh4eHh4eFwiKTtcbiAgICB2YXIgcHJlID0gZWx0KFwicHJlXCIsIFthbmNob3JdKTtcbiAgICByZW1vdmVDaGlsZHJlbkFuZEFkZChkaXNwbGF5Lm1lYXN1cmUsIHByZSk7XG4gICAgdmFyIHJlY3QgPSBhbmNob3IuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksIHdpZHRoID0gKHJlY3QucmlnaHQgLSByZWN0LmxlZnQpIC8gMTA7XG4gICAgaWYgKHdpZHRoID4gMikgZGlzcGxheS5jYWNoZWRDaGFyV2lkdGggPSB3aWR0aDtcbiAgICByZXR1cm4gd2lkdGggfHwgMTA7XG4gIH1cblxuICAvLyBPUEVSQVRJT05TXG5cbiAgLy8gT3BlcmF0aW9ucyBhcmUgdXNlZCB0byB3cmFwIGEgc2VyaWVzIG9mIGNoYW5nZXMgdG8gdGhlIGVkaXRvclxuICAvLyBzdGF0ZSBpbiBzdWNoIGEgd2F5IHRoYXQgZWFjaCBjaGFuZ2Ugd29uJ3QgaGF2ZSB0byB1cGRhdGUgdGhlXG4gIC8vIGN1cnNvciBhbmQgZGlzcGxheSAod2hpY2ggd291bGQgYmUgYXdrd2FyZCwgc2xvdywgYW5kXG4gIC8vIGVycm9yLXByb25lKS4gSW5zdGVhZCwgZGlzcGxheSB1cGRhdGVzIGFyZSBiYXRjaGVkIGFuZCB0aGVuIGFsbFxuICAvLyBjb21iaW5lZCBhbmQgZXhlY3V0ZWQgYXQgb25jZS5cblxuICB2YXIgbmV4dE9wSWQgPSAwO1xuICAvLyBTdGFydCBhIG5ldyBvcGVyYXRpb24uXG4gIGZ1bmN0aW9uIHN0YXJ0T3BlcmF0aW9uKGNtKSB7XG4gICAgY20uY3VyT3AgPSB7XG4gICAgICB2aWV3Q2hhbmdlZDogZmFsc2UsICAgICAgLy8gRmxhZyB0aGF0IGluZGljYXRlcyB0aGF0IGxpbmVzIG1pZ2h0IG5lZWQgdG8gYmUgcmVkcmF3blxuICAgICAgc3RhcnRIZWlnaHQ6IGNtLmRvYy5oZWlnaHQsIC8vIFVzZWQgdG8gZGV0ZWN0IG5lZWQgdG8gdXBkYXRlIHNjcm9sbGJhclxuICAgICAgZm9yY2VVcGRhdGU6IGZhbHNlLCAgICAgIC8vIFVzZWQgdG8gZm9yY2UgYSByZWRyYXdcbiAgICAgIHVwZGF0ZUlucHV0OiBudWxsLCAgICAgICAvLyBXaGV0aGVyIHRvIHJlc2V0IHRoZSBpbnB1dCB0ZXh0YXJlYVxuICAgICAgdHlwaW5nOiBmYWxzZSwgICAgICAgICAgIC8vIFdoZXRoZXIgdGhpcyByZXNldCBzaG91bGQgYmUgY2FyZWZ1bCB0byBsZWF2ZSBleGlzdGluZyB0ZXh0IChmb3IgY29tcG9zaXRpbmcpXG4gICAgICBjaGFuZ2VPYmpzOiBudWxsLCAgICAgICAgLy8gQWNjdW11bGF0ZWQgY2hhbmdlcywgZm9yIGZpcmluZyBjaGFuZ2UgZXZlbnRzXG4gICAgICBjdXJzb3JBY3Rpdml0eUhhbmRsZXJzOiBudWxsLCAvLyBTZXQgb2YgaGFuZGxlcnMgdG8gZmlyZSBjdXJzb3JBY3Rpdml0eSBvblxuICAgICAgc2VsZWN0aW9uQ2hhbmdlZDogZmFsc2UsIC8vIFdoZXRoZXIgdGhlIHNlbGVjdGlvbiBuZWVkcyB0byBiZSByZWRyYXduXG4gICAgICB1cGRhdGVNYXhMaW5lOiBmYWxzZSwgICAgLy8gU2V0IHdoZW4gdGhlIHdpZGVzdCBsaW5lIG5lZWRzIHRvIGJlIGRldGVybWluZWQgYW5ld1xuICAgICAgc2Nyb2xsTGVmdDogbnVsbCwgc2Nyb2xsVG9wOiBudWxsLCAvLyBJbnRlcm1lZGlhdGUgc2Nyb2xsIHBvc2l0aW9uLCBub3QgcHVzaGVkIHRvIERPTSB5ZXRcbiAgICAgIHNjcm9sbFRvUG9zOiBudWxsLCAgICAgICAvLyBVc2VkIHRvIHNjcm9sbCB0byBhIHNwZWNpZmljIHBvc2l0aW9uXG4gICAgICBpZDogKytuZXh0T3BJZCAgICAgICAgICAgLy8gVW5pcXVlIElEXG4gICAgfTtcbiAgICBpZiAoIWRlbGF5ZWRDYWxsYmFja0RlcHRoKyspIGRlbGF5ZWRDYWxsYmFja3MgPSBbXTtcbiAgfVxuXG4gIC8vIEZpbmlzaCBhbiBvcGVyYXRpb24sIHVwZGF0aW5nIHRoZSBkaXNwbGF5IGFuZCBzaWduYWxsaW5nIGRlbGF5ZWQgZXZlbnRzXG4gIGZ1bmN0aW9uIGVuZE9wZXJhdGlvbihjbSkge1xuICAgIHZhciBvcCA9IGNtLmN1ck9wLCBkb2MgPSBjbS5kb2MsIGRpc3BsYXkgPSBjbS5kaXNwbGF5O1xuICAgIGNtLmN1ck9wID0gbnVsbDtcblxuICAgIGlmIChvcC51cGRhdGVNYXhMaW5lKSBmaW5kTWF4TGluZShjbSk7XG5cbiAgICAvLyBJZiBpdCBsb29rcyBsaWtlIGFuIHVwZGF0ZSBtaWdodCBiZSBuZWVkZWQsIGNhbGwgdXBkYXRlRGlzcGxheVxuICAgIGlmIChvcC52aWV3Q2hhbmdlZCB8fCBvcC5mb3JjZVVwZGF0ZSB8fCBvcC5zY3JvbGxUb3AgIT0gbnVsbCB8fFxuICAgICAgICBvcC5zY3JvbGxUb1BvcyAmJiAob3Auc2Nyb2xsVG9Qb3MuZnJvbS5saW5lIDwgZGlzcGxheS52aWV3RnJvbSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgb3Auc2Nyb2xsVG9Qb3MudG8ubGluZSA+PSBkaXNwbGF5LnZpZXdUbykgfHxcbiAgICAgICAgZGlzcGxheS5tYXhMaW5lQ2hhbmdlZCAmJiBjbS5vcHRpb25zLmxpbmVXcmFwcGluZykge1xuICAgICAgdmFyIHVwZGF0ZWQgPSB1cGRhdGVEaXNwbGF5KGNtLCB7dG9wOiBvcC5zY3JvbGxUb3AsIGVuc3VyZTogb3Auc2Nyb2xsVG9Qb3N9LCBvcC5mb3JjZVVwZGF0ZSk7XG4gICAgICBpZiAoY20uZGlzcGxheS5zY3JvbGxlci5vZmZzZXRIZWlnaHQpIGNtLmRvYy5zY3JvbGxUb3AgPSBjbS5kaXNwbGF5LnNjcm9sbGVyLnNjcm9sbFRvcDtcbiAgICB9XG4gICAgLy8gSWYgbm8gdXBkYXRlIHdhcyBydW4sIGJ1dCB0aGUgc2VsZWN0aW9uIGNoYW5nZWQsIHJlZHJhdyB0aGF0LlxuICAgIGlmICghdXBkYXRlZCAmJiBvcC5zZWxlY3Rpb25DaGFuZ2VkKSB1cGRhdGVTZWxlY3Rpb24oY20pO1xuICAgIGlmICghdXBkYXRlZCAmJiBvcC5zdGFydEhlaWdodCAhPSBjbS5kb2MuaGVpZ2h0KSB1cGRhdGVTY3JvbGxiYXJzKGNtKTtcblxuICAgIC8vIEFib3J0IG1vdXNlIHdoZWVsIGRlbHRhIG1lYXN1cmVtZW50LCB3aGVuIHNjcm9sbGluZyBleHBsaWNpdGx5XG4gICAgaWYgKGRpc3BsYXkud2hlZWxTdGFydFggIT0gbnVsbCAmJiAob3Auc2Nyb2xsVG9wICE9IG51bGwgfHwgb3Auc2Nyb2xsTGVmdCAhPSBudWxsIHx8IG9wLnNjcm9sbFRvUG9zKSlcbiAgICAgIGRpc3BsYXkud2hlZWxTdGFydFggPSBkaXNwbGF5LndoZWVsU3RhcnRZID0gbnVsbDtcblxuICAgIC8vIFByb3BhZ2F0ZSB0aGUgc2Nyb2xsIHBvc2l0aW9uIHRvIHRoZSBhY3R1YWwgRE9NIHNjcm9sbGVyXG4gICAgaWYgKG9wLnNjcm9sbFRvcCAhPSBudWxsICYmIGRpc3BsYXkuc2Nyb2xsZXIuc2Nyb2xsVG9wICE9IG9wLnNjcm9sbFRvcCkge1xuICAgICAgdmFyIHRvcCA9IE1hdGgubWF4KDAsIE1hdGgubWluKGRpc3BsYXkuc2Nyb2xsZXIuc2Nyb2xsSGVpZ2h0IC0gZGlzcGxheS5zY3JvbGxlci5jbGllbnRIZWlnaHQsIG9wLnNjcm9sbFRvcCkpO1xuICAgICAgZGlzcGxheS5zY3JvbGxlci5zY3JvbGxUb3AgPSBkaXNwbGF5LnNjcm9sbGJhclYuc2Nyb2xsVG9wID0gZG9jLnNjcm9sbFRvcCA9IHRvcDtcbiAgICB9XG4gICAgaWYgKG9wLnNjcm9sbExlZnQgIT0gbnVsbCAmJiBkaXNwbGF5LnNjcm9sbGVyLnNjcm9sbExlZnQgIT0gb3Auc2Nyb2xsTGVmdCkge1xuICAgICAgdmFyIGxlZnQgPSBNYXRoLm1heCgwLCBNYXRoLm1pbihkaXNwbGF5LnNjcm9sbGVyLnNjcm9sbFdpZHRoIC0gZGlzcGxheS5zY3JvbGxlci5jbGllbnRXaWR0aCwgb3Auc2Nyb2xsTGVmdCkpO1xuICAgICAgZGlzcGxheS5zY3JvbGxlci5zY3JvbGxMZWZ0ID0gZGlzcGxheS5zY3JvbGxiYXJILnNjcm9sbExlZnQgPSBkb2Muc2Nyb2xsTGVmdCA9IGxlZnQ7XG4gICAgICBhbGlnbkhvcml6b250YWxseShjbSk7XG4gICAgfVxuICAgIC8vIElmIHdlIG5lZWQgdG8gc2Nyb2xsIGEgc3BlY2lmaWMgcG9zaXRpb24gaW50byB2aWV3LCBkbyBzby5cbiAgICBpZiAob3Auc2Nyb2xsVG9Qb3MpIHtcbiAgICAgIHZhciBjb29yZHMgPSBzY3JvbGxQb3NJbnRvVmlldyhjbSwgY2xpcFBvcyhjbS5kb2MsIG9wLnNjcm9sbFRvUG9zLmZyb20pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsaXBQb3MoY20uZG9jLCBvcC5zY3JvbGxUb1Bvcy50byksIG9wLnNjcm9sbFRvUG9zLm1hcmdpbik7XG4gICAgICBpZiAob3Auc2Nyb2xsVG9Qb3MuaXNDdXJzb3IgJiYgY20uc3RhdGUuZm9jdXNlZCkgbWF5YmVTY3JvbGxXaW5kb3coY20sIGNvb3Jkcyk7XG4gICAgfVxuXG4gICAgaWYgKG9wLnNlbGVjdGlvbkNoYW5nZWQpIHJlc3RhcnRCbGluayhjbSk7XG5cbiAgICBpZiAoY20uc3RhdGUuZm9jdXNlZCAmJiBvcC51cGRhdGVJbnB1dClcbiAgICAgIHJlc2V0SW5wdXQoY20sIG9wLnR5cGluZyk7XG5cbiAgICAvLyBGaXJlIGV2ZW50cyBmb3IgbWFya2VycyB0aGF0IGFyZSBoaWRkZW4vdW5pZGRlbiBieSBlZGl0aW5nIG9yXG4gICAgLy8gdW5kb2luZ1xuICAgIHZhciBoaWRkZW4gPSBvcC5tYXliZUhpZGRlbk1hcmtlcnMsIHVuaGlkZGVuID0gb3AubWF5YmVVbmhpZGRlbk1hcmtlcnM7XG4gICAgaWYgKGhpZGRlbikgZm9yICh2YXIgaSA9IDA7IGkgPCBoaWRkZW4ubGVuZ3RoOyArK2kpXG4gICAgICBpZiAoIWhpZGRlbltpXS5saW5lcy5sZW5ndGgpIHNpZ25hbChoaWRkZW5baV0sIFwiaGlkZVwiKTtcbiAgICBpZiAodW5oaWRkZW4pIGZvciAodmFyIGkgPSAwOyBpIDwgdW5oaWRkZW4ubGVuZ3RoOyArK2kpXG4gICAgICBpZiAodW5oaWRkZW5baV0ubGluZXMubGVuZ3RoKSBzaWduYWwodW5oaWRkZW5baV0sIFwidW5oaWRlXCIpO1xuXG4gICAgdmFyIGRlbGF5ZWQ7XG4gICAgaWYgKCEtLWRlbGF5ZWRDYWxsYmFja0RlcHRoKSB7XG4gICAgICBkZWxheWVkID0gZGVsYXllZENhbGxiYWNrcztcbiAgICAgIGRlbGF5ZWRDYWxsYmFja3MgPSBudWxsO1xuICAgIH1cbiAgICAvLyBGaXJlIGNoYW5nZSBldmVudHMsIGFuZCBkZWxheWVkIGV2ZW50IGhhbmRsZXJzXG4gICAgaWYgKG9wLmNoYW5nZU9ianMpXG4gICAgICBzaWduYWwoY20sIFwiY2hhbmdlc1wiLCBjbSwgb3AuY2hhbmdlT2Jqcyk7XG4gICAgaWYgKGRlbGF5ZWQpIGZvciAodmFyIGkgPSAwOyBpIDwgZGVsYXllZC5sZW5ndGg7ICsraSkgZGVsYXllZFtpXSgpO1xuICAgIGlmIChvcC5jdXJzb3JBY3Rpdml0eUhhbmRsZXJzKVxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvcC5jdXJzb3JBY3Rpdml0eUhhbmRsZXJzLmxlbmd0aDsgaSsrKVxuICAgICAgICBvcC5jdXJzb3JBY3Rpdml0eUhhbmRsZXJzW2ldKGNtKTtcbiAgfVxuXG4gIC8vIFJ1biB0aGUgZ2l2ZW4gZnVuY3Rpb24gaW4gYW4gb3BlcmF0aW9uXG4gIGZ1bmN0aW9uIHJ1bkluT3AoY20sIGYpIHtcbiAgICBpZiAoY20uY3VyT3ApIHJldHVybiBmKCk7XG4gICAgc3RhcnRPcGVyYXRpb24oY20pO1xuICAgIHRyeSB7IHJldHVybiBmKCk7IH1cbiAgICBmaW5hbGx5IHsgZW5kT3BlcmF0aW9uKGNtKTsgfVxuICB9XG4gIC8vIFdyYXBzIGEgZnVuY3Rpb24gaW4gYW4gb3BlcmF0aW9uLiBSZXR1cm5zIHRoZSB3cmFwcGVkIGZ1bmN0aW9uLlxuICBmdW5jdGlvbiBvcGVyYXRpb24oY20sIGYpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoY20uY3VyT3ApIHJldHVybiBmLmFwcGx5KGNtLCBhcmd1bWVudHMpO1xuICAgICAgc3RhcnRPcGVyYXRpb24oY20pO1xuICAgICAgdHJ5IHsgcmV0dXJuIGYuYXBwbHkoY20sIGFyZ3VtZW50cyk7IH1cbiAgICAgIGZpbmFsbHkgeyBlbmRPcGVyYXRpb24oY20pOyB9XG4gICAgfTtcbiAgfVxuICAvLyBVc2VkIHRvIGFkZCBtZXRob2RzIHRvIGVkaXRvciBhbmQgZG9jIGluc3RhbmNlcywgd3JhcHBpbmcgdGhlbSBpblxuICAvLyBvcGVyYXRpb25zLlxuICBmdW5jdGlvbiBtZXRob2RPcChmKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuY3VyT3ApIHJldHVybiBmLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBzdGFydE9wZXJhdGlvbih0aGlzKTtcbiAgICAgIHRyeSB7IHJldHVybiBmLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH1cbiAgICAgIGZpbmFsbHkgeyBlbmRPcGVyYXRpb24odGhpcyk7IH1cbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIGRvY01ldGhvZE9wKGYpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY20gPSB0aGlzLmNtO1xuICAgICAgaWYgKCFjbSB8fCBjbS5jdXJPcCkgcmV0dXJuIGYuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHN0YXJ0T3BlcmF0aW9uKGNtKTtcbiAgICAgIHRyeSB7IHJldHVybiBmLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH1cbiAgICAgIGZpbmFsbHkgeyBlbmRPcGVyYXRpb24oY20pOyB9XG4gICAgfTtcbiAgfVxuXG4gIC8vIFZJRVcgVFJBQ0tJTkdcblxuICAvLyBUaGVzZSBvYmplY3RzIGFyZSB1c2VkIHRvIHJlcHJlc2VudCB0aGUgdmlzaWJsZSAoY3VycmVudGx5IGRyYXduKVxuICAvLyBwYXJ0IG9mIHRoZSBkb2N1bWVudC4gQSBMaW5lVmlldyBtYXkgY29ycmVzcG9uZCB0byBtdWx0aXBsZVxuICAvLyBsb2dpY2FsIGxpbmVzLCBpZiB0aG9zZSBhcmUgY29ubmVjdGVkIGJ5IGNvbGxhcHNlZCByYW5nZXMuXG4gIGZ1bmN0aW9uIExpbmVWaWV3KGRvYywgbGluZSwgbGluZU4pIHtcbiAgICAvLyBUaGUgc3RhcnRpbmcgbGluZVxuICAgIHRoaXMubGluZSA9IGxpbmU7XG4gICAgLy8gQ29udGludWluZyBsaW5lcywgaWYgYW55XG4gICAgdGhpcy5yZXN0ID0gdmlzdWFsTGluZUNvbnRpbnVlZChsaW5lKTtcbiAgICAvLyBOdW1iZXIgb2YgbG9naWNhbCBsaW5lcyBpbiB0aGlzIHZpc3VhbCBsaW5lXG4gICAgdGhpcy5zaXplID0gdGhpcy5yZXN0ID8gbGluZU5vKGxzdCh0aGlzLnJlc3QpKSAtIGxpbmVOICsgMSA6IDE7XG4gICAgdGhpcy5ub2RlID0gdGhpcy50ZXh0ID0gbnVsbDtcbiAgICB0aGlzLmhpZGRlbiA9IGxpbmVJc0hpZGRlbihkb2MsIGxpbmUpO1xuICB9XG5cbiAgLy8gQ3JlYXRlIGEgcmFuZ2Ugb2YgTGluZVZpZXcgb2JqZWN0cyBmb3IgdGhlIGdpdmVuIGxpbmVzLlxuICBmdW5jdGlvbiBidWlsZFZpZXdBcnJheShjbSwgZnJvbSwgdG8pIHtcbiAgICB2YXIgYXJyYXkgPSBbXSwgbmV4dFBvcztcbiAgICBmb3IgKHZhciBwb3MgPSBmcm9tOyBwb3MgPCB0bzsgcG9zID0gbmV4dFBvcykge1xuICAgICAgdmFyIHZpZXcgPSBuZXcgTGluZVZpZXcoY20uZG9jLCBnZXRMaW5lKGNtLmRvYywgcG9zKSwgcG9zKTtcbiAgICAgIG5leHRQb3MgPSBwb3MgKyB2aWV3LnNpemU7XG4gICAgICBhcnJheS5wdXNoKHZpZXcpO1xuICAgIH1cbiAgICByZXR1cm4gYXJyYXk7XG4gIH1cblxuICAvLyBVcGRhdGVzIHRoZSBkaXNwbGF5LnZpZXcgZGF0YSBzdHJ1Y3R1cmUgZm9yIGEgZ2l2ZW4gY2hhbmdlIHRvIHRoZVxuICAvLyBkb2N1bWVudC4gRnJvbSBhbmQgdG8gYXJlIGluIHByZS1jaGFuZ2UgY29vcmRpbmF0ZXMuIExlbmRpZmYgaXNcbiAgLy8gdGhlIGFtb3VudCBvZiBsaW5lcyBhZGRlZCBvciBzdWJ0cmFjdGVkIGJ5IHRoZSBjaGFuZ2UuIFRoaXMgaXNcbiAgLy8gdXNlZCBmb3IgY2hhbmdlcyB0aGF0IHNwYW4gbXVsdGlwbGUgbGluZXMsIG9yIGNoYW5nZSB0aGUgd2F5XG4gIC8vIGxpbmVzIGFyZSBkaXZpZGVkIGludG8gdmlzdWFsIGxpbmVzLiByZWdMaW5lQ2hhbmdlIChiZWxvdylcbiAgLy8gcmVnaXN0ZXJzIHNpbmdsZS1saW5lIGNoYW5nZXMuXG4gIGZ1bmN0aW9uIHJlZ0NoYW5nZShjbSwgZnJvbSwgdG8sIGxlbmRpZmYpIHtcbiAgICBpZiAoZnJvbSA9PSBudWxsKSBmcm9tID0gY20uZG9jLmZpcnN0O1xuICAgIGlmICh0byA9PSBudWxsKSB0byA9IGNtLmRvYy5maXJzdCArIGNtLmRvYy5zaXplO1xuICAgIGlmICghbGVuZGlmZikgbGVuZGlmZiA9IDA7XG5cbiAgICB2YXIgZGlzcGxheSA9IGNtLmRpc3BsYXk7XG4gICAgaWYgKGxlbmRpZmYgJiYgdG8gPCBkaXNwbGF5LnZpZXdUbyAmJlxuICAgICAgICAoZGlzcGxheS51cGRhdGVMaW5lTnVtYmVycyA9PSBudWxsIHx8IGRpc3BsYXkudXBkYXRlTGluZU51bWJlcnMgPiBmcm9tKSlcbiAgICAgIGRpc3BsYXkudXBkYXRlTGluZU51bWJlcnMgPSBmcm9tO1xuXG4gICAgY20uY3VyT3Audmlld0NoYW5nZWQgPSB0cnVlO1xuXG4gICAgaWYgKGZyb20gPj0gZGlzcGxheS52aWV3VG8pIHsgLy8gQ2hhbmdlIGFmdGVyXG4gICAgICBpZiAoc2F3Q29sbGFwc2VkU3BhbnMgJiYgdmlzdWFsTGluZU5vKGNtLmRvYywgZnJvbSkgPCBkaXNwbGF5LnZpZXdUbylcbiAgICAgICAgcmVzZXRWaWV3KGNtKTtcbiAgICB9IGVsc2UgaWYgKHRvIDw9IGRpc3BsYXkudmlld0Zyb20pIHsgLy8gQ2hhbmdlIGJlZm9yZVxuICAgICAgaWYgKHNhd0NvbGxhcHNlZFNwYW5zICYmIHZpc3VhbExpbmVFbmRObyhjbS5kb2MsIHRvICsgbGVuZGlmZikgPiBkaXNwbGF5LnZpZXdGcm9tKSB7XG4gICAgICAgIHJlc2V0VmlldyhjbSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkaXNwbGF5LnZpZXdGcm9tICs9IGxlbmRpZmY7XG4gICAgICAgIGRpc3BsYXkudmlld1RvICs9IGxlbmRpZmY7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChmcm9tIDw9IGRpc3BsYXkudmlld0Zyb20gJiYgdG8gPj0gZGlzcGxheS52aWV3VG8pIHsgLy8gRnVsbCBvdmVybGFwXG4gICAgICByZXNldFZpZXcoY20pO1xuICAgIH0gZWxzZSBpZiAoZnJvbSA8PSBkaXNwbGF5LnZpZXdGcm9tKSB7IC8vIFRvcCBvdmVybGFwXG4gICAgICB2YXIgY3V0ID0gdmlld0N1dHRpbmdQb2ludChjbSwgdG8sIHRvICsgbGVuZGlmZiwgMSk7XG4gICAgICBpZiAoY3V0KSB7XG4gICAgICAgIGRpc3BsYXkudmlldyA9IGRpc3BsYXkudmlldy5zbGljZShjdXQuaW5kZXgpO1xuICAgICAgICBkaXNwbGF5LnZpZXdGcm9tID0gY3V0LmxpbmVOO1xuICAgICAgICBkaXNwbGF5LnZpZXdUbyArPSBsZW5kaWZmO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzZXRWaWV3KGNtKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRvID49IGRpc3BsYXkudmlld1RvKSB7IC8vIEJvdHRvbSBvdmVybGFwXG4gICAgICB2YXIgY3V0ID0gdmlld0N1dHRpbmdQb2ludChjbSwgZnJvbSwgZnJvbSwgLTEpO1xuICAgICAgaWYgKGN1dCkge1xuICAgICAgICBkaXNwbGF5LnZpZXcgPSBkaXNwbGF5LnZpZXcuc2xpY2UoMCwgY3V0LmluZGV4KTtcbiAgICAgICAgZGlzcGxheS52aWV3VG8gPSBjdXQubGluZU47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNldFZpZXcoY20pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7IC8vIEdhcCBpbiB0aGUgbWlkZGxlXG4gICAgICB2YXIgY3V0VG9wID0gdmlld0N1dHRpbmdQb2ludChjbSwgZnJvbSwgZnJvbSwgLTEpO1xuICAgICAgdmFyIGN1dEJvdCA9IHZpZXdDdXR0aW5nUG9pbnQoY20sIHRvLCB0byArIGxlbmRpZmYsIDEpO1xuICAgICAgaWYgKGN1dFRvcCAmJiBjdXRCb3QpIHtcbiAgICAgICAgZGlzcGxheS52aWV3ID0gZGlzcGxheS52aWV3LnNsaWNlKDAsIGN1dFRvcC5pbmRleClcbiAgICAgICAgICAuY29uY2F0KGJ1aWxkVmlld0FycmF5KGNtLCBjdXRUb3AubGluZU4sIGN1dEJvdC5saW5lTikpXG4gICAgICAgICAgLmNvbmNhdChkaXNwbGF5LnZpZXcuc2xpY2UoY3V0Qm90LmluZGV4KSk7XG4gICAgICAgIGRpc3BsYXkudmlld1RvICs9IGxlbmRpZmY7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNldFZpZXcoY20pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBleHQgPSBkaXNwbGF5LmV4dGVybmFsTWVhc3VyZWQ7XG4gICAgaWYgKGV4dCkge1xuICAgICAgaWYgKHRvIDwgZXh0LmxpbmVOKVxuICAgICAgICBleHQubGluZU4gKz0gbGVuZGlmZjtcbiAgICAgIGVsc2UgaWYgKGZyb20gPCBleHQubGluZU4gKyBleHQuc2l6ZSlcbiAgICAgICAgZGlzcGxheS5leHRlcm5hbE1lYXN1cmVkID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvLyBSZWdpc3RlciBhIGNoYW5nZSB0byBhIHNpbmdsZSBsaW5lLiBUeXBlIG11c3QgYmUgb25lIG9mIFwidGV4dFwiLFxuICAvLyBcImd1dHRlclwiLCBcImNsYXNzXCIsIFwid2lkZ2V0XCJcbiAgZnVuY3Rpb24gcmVnTGluZUNoYW5nZShjbSwgbGluZSwgdHlwZSkge1xuICAgIGNtLmN1ck9wLnZpZXdDaGFuZ2VkID0gdHJ1ZTtcbiAgICB2YXIgZGlzcGxheSA9IGNtLmRpc3BsYXksIGV4dCA9IGNtLmRpc3BsYXkuZXh0ZXJuYWxNZWFzdXJlZDtcbiAgICBpZiAoZXh0ICYmIGxpbmUgPj0gZXh0LmxpbmVOICYmIGxpbmUgPCBleHQubGluZU4gKyBleHQuc2l6ZSlcbiAgICAgIGRpc3BsYXkuZXh0ZXJuYWxNZWFzdXJlZCA9IG51bGw7XG5cbiAgICBpZiAobGluZSA8IGRpc3BsYXkudmlld0Zyb20gfHwgbGluZSA+PSBkaXNwbGF5LnZpZXdUbykgcmV0dXJuO1xuICAgIHZhciBsaW5lVmlldyA9IGRpc3BsYXkudmlld1tmaW5kVmlld0luZGV4KGNtLCBsaW5lKV07XG4gICAgaWYgKGxpbmVWaWV3Lm5vZGUgPT0gbnVsbCkgcmV0dXJuO1xuICAgIHZhciBhcnIgPSBsaW5lVmlldy5jaGFuZ2VzIHx8IChsaW5lVmlldy5jaGFuZ2VzID0gW10pO1xuICAgIGlmIChpbmRleE9mKGFyciwgdHlwZSkgPT0gLTEpIGFyci5wdXNoKHR5cGUpO1xuICB9XG5cbiAgLy8gQ2xlYXIgdGhlIHZpZXcuXG4gIGZ1bmN0aW9uIHJlc2V0VmlldyhjbSkge1xuICAgIGNtLmRpc3BsYXkudmlld0Zyb20gPSBjbS5kaXNwbGF5LnZpZXdUbyA9IGNtLmRvYy5maXJzdDtcbiAgICBjbS5kaXNwbGF5LnZpZXcgPSBbXTtcbiAgICBjbS5kaXNwbGF5LnZpZXdPZmZzZXQgPSAwO1xuICB9XG5cbiAgLy8gRmluZCB0aGUgdmlldyBlbGVtZW50IGNvcnJlc3BvbmRpbmcgdG8gYSBnaXZlbiBsaW5lLiBSZXR1cm4gbnVsbFxuICAvLyB3aGVuIHRoZSBsaW5lIGlzbid0IHZpc2libGUuXG4gIGZ1bmN0aW9uIGZpbmRWaWV3SW5kZXgoY20sIG4pIHtcbiAgICBpZiAobiA+PSBjbS5kaXNwbGF5LnZpZXdUbykgcmV0dXJuIG51bGw7XG4gICAgbiAtPSBjbS5kaXNwbGF5LnZpZXdGcm9tO1xuICAgIGlmIChuIDwgMCkgcmV0dXJuIG51bGw7XG4gICAgdmFyIHZpZXcgPSBjbS5kaXNwbGF5LnZpZXc7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2aWV3Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBuIC09IHZpZXdbaV0uc2l6ZTtcbiAgICAgIGlmIChuIDwgMCkgcmV0dXJuIGk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdmlld0N1dHRpbmdQb2ludChjbSwgb2xkTiwgbmV3TiwgZGlyKSB7XG4gICAgdmFyIGluZGV4ID0gZmluZFZpZXdJbmRleChjbSwgb2xkTiksIGRpZmYsIHZpZXcgPSBjbS5kaXNwbGF5LnZpZXc7XG4gICAgaWYgKCFzYXdDb2xsYXBzZWRTcGFucyB8fCBuZXdOID09IGNtLmRvYy5maXJzdCArIGNtLmRvYy5zaXplKVxuICAgICAgcmV0dXJuIHtpbmRleDogaW5kZXgsIGxpbmVOOiBuZXdOfTtcbiAgICBmb3IgKHZhciBpID0gMCwgbiA9IGNtLmRpc3BsYXkudmlld0Zyb207IGkgPCBpbmRleDsgaSsrKVxuICAgICAgbiArPSB2aWV3W2ldLnNpemU7XG4gICAgaWYgKG4gIT0gb2xkTikge1xuICAgICAgaWYgKGRpciA+IDApIHtcbiAgICAgICAgaWYgKGluZGV4ID09IHZpZXcubGVuZ3RoIC0gMSkgcmV0dXJuIG51bGw7XG4gICAgICAgIGRpZmYgPSAobiArIHZpZXdbaW5kZXhdLnNpemUpIC0gb2xkTjtcbiAgICAgICAgaW5kZXgrKztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRpZmYgPSBuIC0gb2xkTjtcbiAgICAgIH1cbiAgICAgIG9sZE4gKz0gZGlmZjsgbmV3TiArPSBkaWZmO1xuICAgIH1cbiAgICB3aGlsZSAodmlzdWFsTGluZU5vKGNtLmRvYywgbmV3TikgIT0gbmV3Tikge1xuICAgICAgaWYgKGluZGV4ID09IChkaXIgPCAwID8gMCA6IHZpZXcubGVuZ3RoIC0gMSkpIHJldHVybiBudWxsO1xuICAgICAgbmV3TiArPSBkaXIgKiB2aWV3W2luZGV4IC0gKGRpciA8IDAgPyAxIDogMCldLnNpemU7XG4gICAgICBpbmRleCArPSBkaXI7XG4gICAgfVxuICAgIHJldHVybiB7aW5kZXg6IGluZGV4LCBsaW5lTjogbmV3Tn07XG4gIH1cblxuICAvLyBGb3JjZSB0aGUgdmlldyB0byBjb3ZlciBhIGdpdmVuIHJhbmdlLCBhZGRpbmcgZW1wdHkgdmlldyBlbGVtZW50XG4gIC8vIG9yIGNsaXBwaW5nIG9mZiBleGlzdGluZyBvbmVzIGFzIG5lZWRlZC5cbiAgZnVuY3Rpb24gYWRqdXN0VmlldyhjbSwgZnJvbSwgdG8pIHtcbiAgICB2YXIgZGlzcGxheSA9IGNtLmRpc3BsYXksIHZpZXcgPSBkaXNwbGF5LnZpZXc7XG4gICAgaWYgKHZpZXcubGVuZ3RoID09IDAgfHwgZnJvbSA+PSBkaXNwbGF5LnZpZXdUbyB8fCB0byA8PSBkaXNwbGF5LnZpZXdGcm9tKSB7XG4gICAgICBkaXNwbGF5LnZpZXcgPSBidWlsZFZpZXdBcnJheShjbSwgZnJvbSwgdG8pO1xuICAgICAgZGlzcGxheS52aWV3RnJvbSA9IGZyb207XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChkaXNwbGF5LnZpZXdGcm9tID4gZnJvbSlcbiAgICAgICAgZGlzcGxheS52aWV3ID0gYnVpbGRWaWV3QXJyYXkoY20sIGZyb20sIGRpc3BsYXkudmlld0Zyb20pLmNvbmNhdChkaXNwbGF5LnZpZXcpO1xuICAgICAgZWxzZSBpZiAoZGlzcGxheS52aWV3RnJvbSA8IGZyb20pXG4gICAgICAgIGRpc3BsYXkudmlldyA9IGRpc3BsYXkudmlldy5zbGljZShmaW5kVmlld0luZGV4KGNtLCBmcm9tKSk7XG4gICAgICBkaXNwbGF5LnZpZXdGcm9tID0gZnJvbTtcbiAgICAgIGlmIChkaXNwbGF5LnZpZXdUbyA8IHRvKVxuICAgICAgICBkaXNwbGF5LnZpZXcgPSBkaXNwbGF5LnZpZXcuY29uY2F0KGJ1aWxkVmlld0FycmF5KGNtLCBkaXNwbGF5LnZpZXdUbywgdG8pKTtcbiAgICAgIGVsc2UgaWYgKGRpc3BsYXkudmlld1RvID4gdG8pXG4gICAgICAgIGRpc3BsYXkudmlldyA9IGRpc3BsYXkudmlldy5zbGljZSgwLCBmaW5kVmlld0luZGV4KGNtLCB0bykpO1xuICAgIH1cbiAgICBkaXNwbGF5LnZpZXdUbyA9IHRvO1xuICB9XG5cbiAgLy8gQ291bnQgdGhlIG51bWJlciBvZiBsaW5lcyBpbiB0aGUgdmlldyB3aG9zZSBET00gcmVwcmVzZW50YXRpb24gaXNcbiAgLy8gb3V0IG9mIGRhdGUgKG9yIG5vbmV4aXN0ZW50KS5cbiAgZnVuY3Rpb24gY291bnREaXJ0eVZpZXcoY20pIHtcbiAgICB2YXIgdmlldyA9IGNtLmRpc3BsYXkudmlldywgZGlydHkgPSAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmlldy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGxpbmVWaWV3ID0gdmlld1tpXTtcbiAgICAgIGlmICghbGluZVZpZXcuaGlkZGVuICYmICghbGluZVZpZXcubm9kZSB8fCBsaW5lVmlldy5jaGFuZ2VzKSkgKytkaXJ0eTtcbiAgICB9XG4gICAgcmV0dXJuIGRpcnR5O1xuICB9XG5cbiAgLy8gSU5QVVQgSEFORExJTkdcblxuICAvLyBQb2xsIGZvciBpbnB1dCBjaGFuZ2VzLCB1c2luZyB0aGUgbm9ybWFsIHJhdGUgb2YgcG9sbGluZy4gVGhpc1xuICAvLyBydW5zIGFzIGxvbmcgYXMgdGhlIGVkaXRvciBpcyBmb2N1c2VkLlxuICBmdW5jdGlvbiBzbG93UG9sbChjbSkge1xuICAgIGlmIChjbS5kaXNwbGF5LnBvbGxpbmdGYXN0KSByZXR1cm47XG4gICAgY20uZGlzcGxheS5wb2xsLnNldChjbS5vcHRpb25zLnBvbGxJbnRlcnZhbCwgZnVuY3Rpb24oKSB7XG4gICAgICByZWFkSW5wdXQoY20pO1xuICAgICAgaWYgKGNtLnN0YXRlLmZvY3VzZWQpIHNsb3dQb2xsKGNtKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFdoZW4gYW4gZXZlbnQgaGFzIGp1c3QgY29tZSBpbiB0aGF0IGlzIGxpa2VseSB0byBhZGQgb3IgY2hhbmdlXG4gIC8vIHNvbWV0aGluZyBpbiB0aGUgaW5wdXQgdGV4dGFyZWEsIHdlIHBvbGwgZmFzdGVyLCB0byBlbnN1cmUgdGhhdFxuICAvLyB0aGUgY2hhbmdlIGFwcGVhcnMgb24gdGhlIHNjcmVlbiBxdWlja2x5LlxuICBmdW5jdGlvbiBmYXN0UG9sbChjbSkge1xuICAgIHZhciBtaXNzZWQgPSBmYWxzZTtcbiAgICBjbS5kaXNwbGF5LnBvbGxpbmdGYXN0ID0gdHJ1ZTtcbiAgICBmdW5jdGlvbiBwKCkge1xuICAgICAgdmFyIGNoYW5nZWQgPSByZWFkSW5wdXQoY20pO1xuICAgICAgaWYgKCFjaGFuZ2VkICYmICFtaXNzZWQpIHttaXNzZWQgPSB0cnVlOyBjbS5kaXNwbGF5LnBvbGwuc2V0KDYwLCBwKTt9XG4gICAgICBlbHNlIHtjbS5kaXNwbGF5LnBvbGxpbmdGYXN0ID0gZmFsc2U7IHNsb3dQb2xsKGNtKTt9XG4gICAgfVxuICAgIGNtLmRpc3BsYXkucG9sbC5zZXQoMjAsIHApO1xuICB9XG5cbiAgLy8gUmVhZCBpbnB1dCBmcm9tIHRoZSB0ZXh0YXJlYSwgYW5kIHVwZGF0ZSB0aGUgZG9jdW1lbnQgdG8gbWF0Y2guXG4gIC8vIFdoZW4gc29tZXRoaW5nIGlzIHNlbGVjdGVkLCBpdCBpcyBwcmVzZW50IGluIHRoZSB0ZXh0YXJlYSwgYW5kXG4gIC8vIHNlbGVjdGVkICh1bmxlc3MgaXQgaXMgaHVnZSwgaW4gd2hpY2ggY2FzZSBhIHBsYWNlaG9sZGVyIGlzXG4gIC8vIHVzZWQpLiBXaGVuIG5vdGhpbmcgaXMgc2VsZWN0ZWQsIHRoZSBjdXJzb3Igc2l0cyBhZnRlciBwcmV2aW91c2x5XG4gIC8vIHNlZW4gdGV4dCAoY2FuIGJlIGVtcHR5KSwgd2hpY2ggaXMgc3RvcmVkIGluIHByZXZJbnB1dCAod2UgbXVzdFxuICAvLyBub3QgcmVzZXQgdGhlIHRleHRhcmVhIHdoZW4gdHlwaW5nLCBiZWNhdXNlIHRoYXQgYnJlYWtzIElNRSkuXG4gIGZ1bmN0aW9uIHJlYWRJbnB1dChjbSkge1xuICAgIHZhciBpbnB1dCA9IGNtLmRpc3BsYXkuaW5wdXQsIHByZXZJbnB1dCA9IGNtLmRpc3BsYXkucHJldklucHV0LCBkb2MgPSBjbS5kb2M7XG4gICAgLy8gU2luY2UgdGhpcyBpcyBjYWxsZWQgYSAqbG90KiwgdHJ5IHRvIGJhaWwgb3V0IGFzIGNoZWFwbHkgYXNcbiAgICAvLyBwb3NzaWJsZSB3aGVuIGl0IGlzIGNsZWFyIHRoYXQgbm90aGluZyBoYXBwZW5lZC4gaGFzU2VsZWN0aW9uXG4gICAgLy8gd2lsbCBiZSB0aGUgY2FzZSB3aGVuIHRoZXJlIGlzIGEgbG90IG9mIHRleHQgaW4gdGhlIHRleHRhcmVhLFxuICAgIC8vIGluIHdoaWNoIGNhc2UgcmVhZGluZyBpdHMgdmFsdWUgd291bGQgYmUgZXhwZW5zaXZlLlxuICAgIGlmICghY20uc3RhdGUuZm9jdXNlZCB8fCAoaGFzU2VsZWN0aW9uKGlucHV0KSAmJiAhcHJldklucHV0KSB8fCBpc1JlYWRPbmx5KGNtKSB8fCBjbS5vcHRpb25zLmRpc2FibGVJbnB1dClcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICAvLyBTZWUgcGFzdGUgaGFuZGxlciBmb3IgbW9yZSBvbiB0aGUgZmFrZWRMYXN0Q2hhciBrbHVkZ2VcbiAgICBpZiAoY20uc3RhdGUucGFzdGVJbmNvbWluZyAmJiBjbS5zdGF0ZS5mYWtlZExhc3RDaGFyKSB7XG4gICAgICBpbnB1dC52YWx1ZSA9IGlucHV0LnZhbHVlLnN1YnN0cmluZygwLCBpbnB1dC52YWx1ZS5sZW5ndGggLSAxKTtcbiAgICAgIGNtLnN0YXRlLmZha2VkTGFzdENoYXIgPSBmYWxzZTtcbiAgICB9XG4gICAgdmFyIHRleHQgPSBpbnB1dC52YWx1ZTtcbiAgICAvLyBJZiBub3RoaW5nIGNoYW5nZWQsIGJhaWwuXG4gICAgaWYgKHRleHQgPT0gcHJldklucHV0ICYmICFjbS5zb21ldGhpbmdTZWxlY3RlZCgpKSByZXR1cm4gZmFsc2U7XG4gICAgLy8gV29yayBhcm91bmQgbm9uc2Vuc2ljYWwgc2VsZWN0aW9uIHJlc2V0dGluZyBpbiBJRTkvMTBcbiAgICBpZiAoaWUgJiYgIWllX3VwdG84ICYmIGNtLmRpc3BsYXkuaW5wdXRIYXNTZWxlY3Rpb24gPT09IHRleHQpIHtcbiAgICAgIHJlc2V0SW5wdXQoY20pO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciB3aXRoT3AgPSAhY20uY3VyT3A7XG4gICAgaWYgKHdpdGhPcCkgc3RhcnRPcGVyYXRpb24oY20pO1xuICAgIGNtLmRpc3BsYXkuc2hpZnQgPSBmYWxzZTtcblxuICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQoMCkgPT0gMHgyMDBiICYmIGRvYy5zZWwgPT0gY20uZGlzcGxheS5zZWxGb3JDb250ZXh0TWVudSAmJiAhcHJldklucHV0KVxuICAgICAgcHJldklucHV0ID0gXCJcXHUyMDBiXCI7XG4gICAgLy8gRmluZCB0aGUgcGFydCBvZiB0aGUgaW5wdXQgdGhhdCBpcyBhY3R1YWxseSBuZXdcbiAgICB2YXIgc2FtZSA9IDAsIGwgPSBNYXRoLm1pbihwcmV2SW5wdXQubGVuZ3RoLCB0ZXh0Lmxlbmd0aCk7XG4gICAgd2hpbGUgKHNhbWUgPCBsICYmIHByZXZJbnB1dC5jaGFyQ29kZUF0KHNhbWUpID09IHRleHQuY2hhckNvZGVBdChzYW1lKSkgKytzYW1lO1xuICAgIHZhciBpbnNlcnRlZCA9IHRleHQuc2xpY2Uoc2FtZSksIHRleHRMaW5lcyA9IHNwbGl0TGluZXMoaW5zZXJ0ZWQpO1xuXG4gICAgLy8gV2hlbiBwYXNpbmcgTiBsaW5lcyBpbnRvIE4gc2VsZWN0aW9ucywgaW5zZXJ0IG9uZSBsaW5lIHBlciBzZWxlY3Rpb25cbiAgICB2YXIgbXVsdGlQYXN0ZSA9IGNtLnN0YXRlLnBhc3RlSW5jb21pbmcgJiYgdGV4dExpbmVzLmxlbmd0aCA+IDEgJiYgZG9jLnNlbC5yYW5nZXMubGVuZ3RoID09IHRleHRMaW5lcy5sZW5ndGg7XG5cbiAgICAvLyBOb3JtYWwgYmVoYXZpb3IgaXMgdG8gaW5zZXJ0IHRoZSBuZXcgdGV4dCBpbnRvIGV2ZXJ5IHNlbGVjdGlvblxuICAgIGZvciAodmFyIGkgPSBkb2Muc2VsLnJhbmdlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgdmFyIHJhbmdlID0gZG9jLnNlbC5yYW5nZXNbaV07XG4gICAgICB2YXIgZnJvbSA9IHJhbmdlLmZyb20oKSwgdG8gPSByYW5nZS50bygpO1xuICAgICAgLy8gSGFuZGxlIGRlbGV0aW9uXG4gICAgICBpZiAoc2FtZSA8IHByZXZJbnB1dC5sZW5ndGgpXG4gICAgICAgIGZyb20gPSBQb3MoZnJvbS5saW5lLCBmcm9tLmNoIC0gKHByZXZJbnB1dC5sZW5ndGggLSBzYW1lKSk7XG4gICAgICAvLyBIYW5kbGUgb3ZlcndyaXRlXG4gICAgICBlbHNlIGlmIChjbS5zdGF0ZS5vdmVyd3JpdGUgJiYgcmFuZ2UuZW1wdHkoKSAmJiAhY20uc3RhdGUucGFzdGVJbmNvbWluZylcbiAgICAgICAgdG8gPSBQb3ModG8ubGluZSwgTWF0aC5taW4oZ2V0TGluZShkb2MsIHRvLmxpbmUpLnRleHQubGVuZ3RoLCB0by5jaCArIGxzdCh0ZXh0TGluZXMpLmxlbmd0aCkpO1xuICAgICAgdmFyIHVwZGF0ZUlucHV0ID0gY20uY3VyT3AudXBkYXRlSW5wdXQ7XG4gICAgICB2YXIgY2hhbmdlRXZlbnQgPSB7ZnJvbTogZnJvbSwgdG86IHRvLCB0ZXh0OiBtdWx0aVBhc3RlID8gW3RleHRMaW5lc1tpXV0gOiB0ZXh0TGluZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luOiBjbS5zdGF0ZS5wYXN0ZUluY29taW5nID8gXCJwYXN0ZVwiIDogY20uc3RhdGUuY3V0SW5jb21pbmcgPyBcImN1dFwiIDogXCIraW5wdXRcIn07XG4gICAgICBtYWtlQ2hhbmdlKGNtLmRvYywgY2hhbmdlRXZlbnQpO1xuICAgICAgc2lnbmFsTGF0ZXIoY20sIFwiaW5wdXRSZWFkXCIsIGNtLCBjaGFuZ2VFdmVudCk7XG4gICAgICAvLyBXaGVuIGFuICdlbGVjdHJpYycgY2hhcmFjdGVyIGlzIGluc2VydGVkLCBpbW1lZGlhdGVseSB0cmlnZ2VyIGEgcmVpbmRlbnRcbiAgICAgIGlmIChpbnNlcnRlZCAmJiAhY20uc3RhdGUucGFzdGVJbmNvbWluZyAmJiBjbS5vcHRpb25zLmVsZWN0cmljQ2hhcnMgJiZcbiAgICAgICAgICBjbS5vcHRpb25zLnNtYXJ0SW5kZW50ICYmIHJhbmdlLmhlYWQuY2ggPCAxMDAgJiZcbiAgICAgICAgICAoIWkgfHwgZG9jLnNlbC5yYW5nZXNbaSAtIDFdLmhlYWQubGluZSAhPSByYW5nZS5oZWFkLmxpbmUpKSB7XG4gICAgICAgIHZhciBtb2RlID0gY20uZ2V0TW9kZUF0KHJhbmdlLmhlYWQpO1xuICAgICAgICBpZiAobW9kZS5lbGVjdHJpY0NoYXJzKSB7XG4gICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBtb2RlLmVsZWN0cmljQ2hhcnMubGVuZ3RoOyBqKyspXG4gICAgICAgICAgICBpZiAoaW5zZXJ0ZWQuaW5kZXhPZihtb2RlLmVsZWN0cmljQ2hhcnMuY2hhckF0KGopKSA+IC0xKSB7XG4gICAgICAgICAgICAgIGluZGVudExpbmUoY20sIHJhbmdlLmhlYWQubGluZSwgXCJzbWFydFwiKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAobW9kZS5lbGVjdHJpY0lucHV0KSB7XG4gICAgICAgICAgdmFyIGVuZCA9IGNoYW5nZUVuZChjaGFuZ2VFdmVudCk7XG4gICAgICAgICAgaWYgKG1vZGUuZWxlY3RyaWNJbnB1dC50ZXN0KGdldExpbmUoZG9jLCBlbmQubGluZSkudGV4dC5zbGljZSgwLCBlbmQuY2gpKSlcbiAgICAgICAgICAgIGluZGVudExpbmUoY20sIHJhbmdlLmhlYWQubGluZSwgXCJzbWFydFwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBlbnN1cmVDdXJzb3JWaXNpYmxlKGNtKTtcbiAgICBjbS5jdXJPcC51cGRhdGVJbnB1dCA9IHVwZGF0ZUlucHV0O1xuICAgIGNtLmN1ck9wLnR5cGluZyA9IHRydWU7XG5cbiAgICAvLyBEb24ndCBsZWF2ZSBsb25nIHRleHQgaW4gdGhlIHRleHRhcmVhLCBzaW5jZSBpdCBtYWtlcyBmdXJ0aGVyIHBvbGxpbmcgc2xvd1xuICAgIGlmICh0ZXh0Lmxlbmd0aCA+IDEwMDAgfHwgdGV4dC5pbmRleE9mKFwiXFxuXCIpID4gLTEpIGlucHV0LnZhbHVlID0gY20uZGlzcGxheS5wcmV2SW5wdXQgPSBcIlwiO1xuICAgIGVsc2UgY20uZGlzcGxheS5wcmV2SW5wdXQgPSB0ZXh0O1xuICAgIGlmICh3aXRoT3ApIGVuZE9wZXJhdGlvbihjbSk7XG4gICAgY20uc3RhdGUucGFzdGVJbmNvbWluZyA9IGNtLnN0YXRlLmN1dEluY29taW5nID0gZmFsc2U7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBSZXNldCB0aGUgaW5wdXQgdG8gY29ycmVzcG9uZCB0byB0aGUgc2VsZWN0aW9uIChvciB0byBiZSBlbXB0eSxcbiAgLy8gd2hlbiBub3QgdHlwaW5nIGFuZCBub3RoaW5nIGlzIHNlbGVjdGVkKVxuICBmdW5jdGlvbiByZXNldElucHV0KGNtLCB0eXBpbmcpIHtcbiAgICB2YXIgbWluaW1hbCwgc2VsZWN0ZWQsIGRvYyA9IGNtLmRvYztcbiAgICBpZiAoY20uc29tZXRoaW5nU2VsZWN0ZWQoKSkge1xuICAgICAgY20uZGlzcGxheS5wcmV2SW5wdXQgPSBcIlwiO1xuICAgICAgdmFyIHJhbmdlID0gZG9jLnNlbC5wcmltYXJ5KCk7XG4gICAgICBtaW5pbWFsID0gaGFzQ29weUV2ZW50ICYmXG4gICAgICAgIChyYW5nZS50bygpLmxpbmUgLSByYW5nZS5mcm9tKCkubGluZSA+IDEwMCB8fCAoc2VsZWN0ZWQgPSBjbS5nZXRTZWxlY3Rpb24oKSkubGVuZ3RoID4gMTAwMCk7XG4gICAgICB2YXIgY29udGVudCA9IG1pbmltYWwgPyBcIi1cIiA6IHNlbGVjdGVkIHx8IGNtLmdldFNlbGVjdGlvbigpO1xuICAgICAgY20uZGlzcGxheS5pbnB1dC52YWx1ZSA9IGNvbnRlbnQ7XG4gICAgICBpZiAoY20uc3RhdGUuZm9jdXNlZCkgc2VsZWN0SW5wdXQoY20uZGlzcGxheS5pbnB1dCk7XG4gICAgICBpZiAoaWUgJiYgIWllX3VwdG84KSBjbS5kaXNwbGF5LmlucHV0SGFzU2VsZWN0aW9uID0gY29udGVudDtcbiAgICB9IGVsc2UgaWYgKCF0eXBpbmcpIHtcbiAgICAgIGNtLmRpc3BsYXkucHJldklucHV0ID0gY20uZGlzcGxheS5pbnB1dC52YWx1ZSA9IFwiXCI7XG4gICAgICBpZiAoaWUgJiYgIWllX3VwdG84KSBjbS5kaXNwbGF5LmlucHV0SGFzU2VsZWN0aW9uID0gbnVsbDtcbiAgICB9XG4gICAgY20uZGlzcGxheS5pbmFjY3VyYXRlU2VsZWN0aW9uID0gbWluaW1hbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvY3VzSW5wdXQoY20pIHtcbiAgICBpZiAoY20ub3B0aW9ucy5yZWFkT25seSAhPSBcIm5vY3Vyc29yXCIgJiYgKCFtb2JpbGUgfHwgYWN0aXZlRWx0KCkgIT0gY20uZGlzcGxheS5pbnB1dCkpXG4gICAgICBjbS5kaXNwbGF5LmlucHV0LmZvY3VzKCk7XG4gIH1cblxuICBmdW5jdGlvbiBlbnN1cmVGb2N1cyhjbSkge1xuICAgIGlmICghY20uc3RhdGUuZm9jdXNlZCkgeyBmb2N1c0lucHV0KGNtKTsgb25Gb2N1cyhjbSk7IH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGlzUmVhZE9ubHkoY20pIHtcbiAgICByZXR1cm4gY20ub3B0aW9ucy5yZWFkT25seSB8fCBjbS5kb2MuY2FudEVkaXQ7XG4gIH1cblxuICAvLyBFVkVOVCBIQU5ETEVSU1xuXG4gIC8vIEF0dGFjaCB0aGUgbmVjZXNzYXJ5IGV2ZW50IGhhbmRsZXJzIHdoZW4gaW5pdGlhbGl6aW5nIHRoZSBlZGl0b3JcbiAgZnVuY3Rpb24gcmVnaXN0ZXJFdmVudEhhbmRsZXJzKGNtKSB7XG4gICAgdmFyIGQgPSBjbS5kaXNwbGF5O1xuICAgIG9uKGQuc2Nyb2xsZXIsIFwibW91c2Vkb3duXCIsIG9wZXJhdGlvbihjbSwgb25Nb3VzZURvd24pKTtcbiAgICAvLyBPbGRlciBJRSdzIHdpbGwgbm90IGZpcmUgYSBzZWNvbmQgbW91c2Vkb3duIGZvciBhIGRvdWJsZSBjbGlja1xuICAgIGlmIChpZV91cHRvMTApXG4gICAgICBvbihkLnNjcm9sbGVyLCBcImRibGNsaWNrXCIsIG9wZXJhdGlvbihjbSwgZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoc2lnbmFsRE9NRXZlbnQoY20sIGUpKSByZXR1cm47XG4gICAgICAgIHZhciBwb3MgPSBwb3NGcm9tTW91c2UoY20sIGUpO1xuICAgICAgICBpZiAoIXBvcyB8fCBjbGlja0luR3V0dGVyKGNtLCBlKSB8fCBldmVudEluV2lkZ2V0KGNtLmRpc3BsYXksIGUpKSByZXR1cm47XG4gICAgICAgIGVfcHJldmVudERlZmF1bHQoZSk7XG4gICAgICAgIHZhciB3b3JkID0gZmluZFdvcmRBdChjbSwgcG9zKTtcbiAgICAgICAgZXh0ZW5kU2VsZWN0aW9uKGNtLmRvYywgd29yZC5hbmNob3IsIHdvcmQuaGVhZCk7XG4gICAgICB9KSk7XG4gICAgZWxzZVxuICAgICAgb24oZC5zY3JvbGxlciwgXCJkYmxjbGlja1wiLCBmdW5jdGlvbihlKSB7IHNpZ25hbERPTUV2ZW50KGNtLCBlKSB8fCBlX3ByZXZlbnREZWZhdWx0KGUpOyB9KTtcbiAgICAvLyBQcmV2ZW50IG5vcm1hbCBzZWxlY3Rpb24gaW4gdGhlIGVkaXRvciAod2UgaGFuZGxlIG91ciBvd24pXG4gICAgb24oZC5saW5lU3BhY2UsIFwic2VsZWN0c3RhcnRcIiwgZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKCFldmVudEluV2lkZ2V0KGQsIGUpKSBlX3ByZXZlbnREZWZhdWx0KGUpO1xuICAgIH0pO1xuICAgIC8vIFNvbWUgYnJvd3NlcnMgZmlyZSBjb250ZXh0bWVudSAqYWZ0ZXIqIG9wZW5pbmcgdGhlIG1lbnUsIGF0XG4gICAgLy8gd2hpY2ggcG9pbnQgd2UgY2FuJ3QgbWVzcyB3aXRoIGl0IGFueW1vcmUuIENvbnRleHQgbWVudSBpc1xuICAgIC8vIGhhbmRsZWQgaW4gb25Nb3VzZURvd24gZm9yIHRoZXNlIGJyb3dzZXJzLlxuICAgIGlmICghY2FwdHVyZVJpZ2h0Q2xpY2spIG9uKGQuc2Nyb2xsZXIsIFwiY29udGV4dG1lbnVcIiwgZnVuY3Rpb24oZSkge29uQ29udGV4dE1lbnUoY20sIGUpO30pO1xuXG4gICAgLy8gU3luYyBzY3JvbGxpbmcgYmV0d2VlbiBmYWtlIHNjcm9sbGJhcnMgYW5kIHJlYWwgc2Nyb2xsYWJsZVxuICAgIC8vIGFyZWEsIGVuc3VyZSB2aWV3cG9ydCBpcyB1cGRhdGVkIHdoZW4gc2Nyb2xsaW5nLlxuICAgIG9uKGQuc2Nyb2xsZXIsIFwic2Nyb2xsXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGQuc2Nyb2xsZXIuY2xpZW50SGVpZ2h0KSB7XG4gICAgICAgIHNldFNjcm9sbFRvcChjbSwgZC5zY3JvbGxlci5zY3JvbGxUb3ApO1xuICAgICAgICBzZXRTY3JvbGxMZWZ0KGNtLCBkLnNjcm9sbGVyLnNjcm9sbExlZnQsIHRydWUpO1xuICAgICAgICBzaWduYWwoY20sIFwic2Nyb2xsXCIsIGNtKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBvbihkLnNjcm9sbGJhclYsIFwic2Nyb2xsXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGQuc2Nyb2xsZXIuY2xpZW50SGVpZ2h0KSBzZXRTY3JvbGxUb3AoY20sIGQuc2Nyb2xsYmFyVi5zY3JvbGxUb3ApO1xuICAgIH0pO1xuICAgIG9uKGQuc2Nyb2xsYmFySCwgXCJzY3JvbGxcIiwgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoZC5zY3JvbGxlci5jbGllbnRIZWlnaHQpIHNldFNjcm9sbExlZnQoY20sIGQuc2Nyb2xsYmFySC5zY3JvbGxMZWZ0KTtcbiAgICB9KTtcblxuICAgIC8vIExpc3RlbiB0byB3aGVlbCBldmVudHMgaW4gb3JkZXIgdG8gdHJ5IGFuZCB1cGRhdGUgdGhlIHZpZXdwb3J0IG9uIHRpbWUuXG4gICAgb24oZC5zY3JvbGxlciwgXCJtb3VzZXdoZWVsXCIsIGZ1bmN0aW9uKGUpe29uU2Nyb2xsV2hlZWwoY20sIGUpO30pO1xuICAgIG9uKGQuc2Nyb2xsZXIsIFwiRE9NTW91c2VTY3JvbGxcIiwgZnVuY3Rpb24oZSl7b25TY3JvbGxXaGVlbChjbSwgZSk7fSk7XG5cbiAgICAvLyBQcmV2ZW50IGNsaWNrcyBpbiB0aGUgc2Nyb2xsYmFycyBmcm9tIGtpbGxpbmcgZm9jdXNcbiAgICBmdW5jdGlvbiByZUZvY3VzKCkgeyBpZiAoY20uc3RhdGUuZm9jdXNlZCkgc2V0VGltZW91dChiaW5kKGZvY3VzSW5wdXQsIGNtKSwgMCk7IH1cbiAgICBvbihkLnNjcm9sbGJhckgsIFwibW91c2Vkb3duXCIsIHJlRm9jdXMpO1xuICAgIG9uKGQuc2Nyb2xsYmFyViwgXCJtb3VzZWRvd25cIiwgcmVGb2N1cyk7XG4gICAgLy8gUHJldmVudCB3cmFwcGVyIGZyb20gZXZlciBzY3JvbGxpbmdcbiAgICBvbihkLndyYXBwZXIsIFwic2Nyb2xsXCIsIGZ1bmN0aW9uKCkgeyBkLndyYXBwZXIuc2Nyb2xsVG9wID0gZC53cmFwcGVyLnNjcm9sbExlZnQgPSAwOyB9KTtcblxuICAgIG9uKGQuaW5wdXQsIFwia2V5dXBcIiwgb3BlcmF0aW9uKGNtLCBvbktleVVwKSk7XG4gICAgb24oZC5pbnB1dCwgXCJpbnB1dFwiLCBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChpZSAmJiAhaWVfdXB0bzggJiYgY20uZGlzcGxheS5pbnB1dEhhc1NlbGVjdGlvbikgY20uZGlzcGxheS5pbnB1dEhhc1NlbGVjdGlvbiA9IG51bGw7XG4gICAgICBmYXN0UG9sbChjbSk7XG4gICAgfSk7XG4gICAgb24oZC5pbnB1dCwgXCJrZXlkb3duXCIsIG9wZXJhdGlvbihjbSwgb25LZXlEb3duKSk7XG4gICAgb24oZC5pbnB1dCwgXCJrZXlwcmVzc1wiLCBvcGVyYXRpb24oY20sIG9uS2V5UHJlc3MpKTtcbiAgICBvbihkLmlucHV0LCBcImZvY3VzXCIsIGJpbmQob25Gb2N1cywgY20pKTtcbiAgICBvbihkLmlucHV0LCBcImJsdXJcIiwgYmluZChvbkJsdXIsIGNtKSk7XG5cbiAgICBmdW5jdGlvbiBkcmFnXyhlKSB7XG4gICAgICBpZiAoIXNpZ25hbERPTUV2ZW50KGNtLCBlKSkgZV9zdG9wKGUpO1xuICAgIH1cbiAgICBpZiAoY20ub3B0aW9ucy5kcmFnRHJvcCkge1xuICAgICAgb24oZC5zY3JvbGxlciwgXCJkcmFnc3RhcnRcIiwgZnVuY3Rpb24oZSl7b25EcmFnU3RhcnQoY20sIGUpO30pO1xuICAgICAgb24oZC5zY3JvbGxlciwgXCJkcmFnZW50ZXJcIiwgZHJhZ18pO1xuICAgICAgb24oZC5zY3JvbGxlciwgXCJkcmFnb3ZlclwiLCBkcmFnXyk7XG4gICAgICBvbihkLnNjcm9sbGVyLCBcImRyb3BcIiwgb3BlcmF0aW9uKGNtLCBvbkRyb3ApKTtcbiAgICB9XG4gICAgb24oZC5zY3JvbGxlciwgXCJwYXN0ZVwiLCBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAoZXZlbnRJbldpZGdldChkLCBlKSkgcmV0dXJuO1xuICAgICAgY20uc3RhdGUucGFzdGVJbmNvbWluZyA9IHRydWU7XG4gICAgICBmb2N1c0lucHV0KGNtKTtcbiAgICAgIGZhc3RQb2xsKGNtKTtcbiAgICB9KTtcbiAgICBvbihkLmlucHV0LCBcInBhc3RlXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgLy8gV29ya2Fyb3VuZCBmb3Igd2Via2l0IGJ1ZyBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9OTAyMDZcbiAgICAgIC8vIEFkZCBhIGNoYXIgdG8gdGhlIGVuZCBvZiB0ZXh0YXJlYSBiZWZvcmUgcGFzdGUgb2NjdXIgc28gdGhhdFxuICAgICAgLy8gc2VsZWN0aW9uIGRvZXNuJ3Qgc3BhbiB0byB0aGUgZW5kIG9mIHRleHRhcmVhLlxuICAgICAgaWYgKHdlYmtpdCAmJiAhY20uc3RhdGUuZmFrZWRMYXN0Q2hhciAmJiAhKG5ldyBEYXRlIC0gY20uc3RhdGUubGFzdE1pZGRsZURvd24gPCAyMDApKSB7XG4gICAgICAgIHZhciBzdGFydCA9IGQuaW5wdXQuc2VsZWN0aW9uU3RhcnQsIGVuZCA9IGQuaW5wdXQuc2VsZWN0aW9uRW5kO1xuICAgICAgICBkLmlucHV0LnZhbHVlICs9IFwiJFwiO1xuICAgICAgICBkLmlucHV0LnNlbGVjdGlvblN0YXJ0ID0gc3RhcnQ7XG4gICAgICAgIGQuaW5wdXQuc2VsZWN0aW9uRW5kID0gZW5kO1xuICAgICAgICBjbS5zdGF0ZS5mYWtlZExhc3RDaGFyID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGNtLnN0YXRlLnBhc3RlSW5jb21pbmcgPSB0cnVlO1xuICAgICAgZmFzdFBvbGwoY20pO1xuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gcHJlcGFyZUNvcHlDdXQoZSkge1xuICAgICAgaWYgKGNtLnNvbWV0aGluZ1NlbGVjdGVkKCkpIHtcbiAgICAgICAgaWYgKGQuaW5hY2N1cmF0ZVNlbGVjdGlvbikge1xuICAgICAgICAgIGQucHJldklucHV0ID0gXCJcIjtcbiAgICAgICAgICBkLmluYWNjdXJhdGVTZWxlY3Rpb24gPSBmYWxzZTtcbiAgICAgICAgICBkLmlucHV0LnZhbHVlID0gY20uZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgICAgc2VsZWN0SW5wdXQoZC5pbnB1dCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB0ZXh0ID0gXCJcIiwgcmFuZ2VzID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY20uZG9jLnNlbC5yYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgbGluZSA9IGNtLmRvYy5zZWwucmFuZ2VzW2ldLmhlYWQubGluZTtcbiAgICAgICAgICB2YXIgbGluZVJhbmdlID0ge2FuY2hvcjogUG9zKGxpbmUsIDApLCBoZWFkOiBQb3MobGluZSArIDEsIDApfTtcbiAgICAgICAgICByYW5nZXMucHVzaChsaW5lUmFuZ2UpO1xuICAgICAgICAgIHRleHQgKz0gY20uZ2V0UmFuZ2UobGluZVJhbmdlLmFuY2hvciwgbGluZVJhbmdlLmhlYWQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlLnR5cGUgPT0gXCJjdXRcIikge1xuICAgICAgICAgIGNtLnNldFNlbGVjdGlvbnMocmFuZ2VzLCBudWxsLCBzZWxfZG9udFNjcm9sbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZC5wcmV2SW5wdXQgPSBcIlwiO1xuICAgICAgICAgIGQuaW5wdXQudmFsdWUgPSB0ZXh0O1xuICAgICAgICAgIHNlbGVjdElucHV0KGQuaW5wdXQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZS50eXBlID09IFwiY3V0XCIpIGNtLnN0YXRlLmN1dEluY29taW5nID0gdHJ1ZTtcbiAgICB9XG4gICAgb24oZC5pbnB1dCwgXCJjdXRcIiwgcHJlcGFyZUNvcHlDdXQpO1xuICAgIG9uKGQuaW5wdXQsIFwiY29weVwiLCBwcmVwYXJlQ29weUN1dCk7XG5cbiAgICAvLyBOZWVkZWQgdG8gaGFuZGxlIFRhYiBrZXkgaW4gS0hUTUxcbiAgICBpZiAoa2h0bWwpIG9uKGQuc2l6ZXIsIFwibW91c2V1cFwiLCBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChhY3RpdmVFbHQoKSA9PSBkLmlucHV0KSBkLmlucHV0LmJsdXIoKTtcbiAgICAgIGZvY3VzSW5wdXQoY20pO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gQ2FsbGVkIHdoZW4gdGhlIHdpbmRvdyByZXNpemVzXG4gIGZ1bmN0aW9uIG9uUmVzaXplKGNtKSB7XG4gICAgLy8gTWlnaHQgYmUgYSB0ZXh0IHNjYWxpbmcgb3BlcmF0aW9uLCBjbGVhciBzaXplIGNhY2hlcy5cbiAgICB2YXIgZCA9IGNtLmRpc3BsYXk7XG4gICAgZC5jYWNoZWRDaGFyV2lkdGggPSBkLmNhY2hlZFRleHRIZWlnaHQgPSBkLmNhY2hlZFBhZGRpbmdIID0gbnVsbDtcbiAgICBjbS5zZXRTaXplKCk7XG4gIH1cblxuICAvLyBNT1VTRSBFVkVOVFNcblxuICAvLyBSZXR1cm4gdHJ1ZSB3aGVuIHRoZSBnaXZlbiBtb3VzZSBldmVudCBoYXBwZW5lZCBpbiBhIHdpZGdldFxuICBmdW5jdGlvbiBldmVudEluV2lkZ2V0KGRpc3BsYXksIGUpIHtcbiAgICBmb3IgKHZhciBuID0gZV90YXJnZXQoZSk7IG4gIT0gZGlzcGxheS53cmFwcGVyOyBuID0gbi5wYXJlbnROb2RlKSB7XG4gICAgICBpZiAoIW4gfHwgbi5pZ25vcmVFdmVudHMgfHwgbi5wYXJlbnROb2RlID09IGRpc3BsYXkuc2l6ZXIgJiYgbiAhPSBkaXNwbGF5Lm1vdmVyKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvLyBHaXZlbiBhIG1vdXNlIGV2ZW50LCBmaW5kIHRoZSBjb3JyZXNwb25kaW5nIHBvc2l0aW9uLiBJZiBsaWJlcmFsXG4gIC8vIGlzIGZhbHNlLCBpdCBjaGVja3Mgd2hldGhlciBhIGd1dHRlciBvciBzY3JvbGxiYXIgd2FzIGNsaWNrZWQsXG4gIC8vIGFuZCByZXR1cm5zIG51bGwgaWYgaXQgd2FzLiBmb3JSZWN0IGlzIHVzZWQgYnkgcmVjdGFuZ3VsYXJcbiAgLy8gc2VsZWN0aW9ucywgYW5kIHRyaWVzIHRvIGVzdGltYXRlIGEgY2hhcmFjdGVyIHBvc2l0aW9uIGV2ZW4gZm9yXG4gIC8vIGNvb3JkaW5hdGVzIGJleW9uZCB0aGUgcmlnaHQgb2YgdGhlIHRleHQuXG4gIGZ1bmN0aW9uIHBvc0Zyb21Nb3VzZShjbSwgZSwgbGliZXJhbCwgZm9yUmVjdCkge1xuICAgIHZhciBkaXNwbGF5ID0gY20uZGlzcGxheTtcbiAgICBpZiAoIWxpYmVyYWwpIHtcbiAgICAgIHZhciB0YXJnZXQgPSBlX3RhcmdldChlKTtcbiAgICAgIGlmICh0YXJnZXQgPT0gZGlzcGxheS5zY3JvbGxiYXJIIHx8IHRhcmdldCA9PSBkaXNwbGF5LnNjcm9sbGJhclYgfHxcbiAgICAgICAgICB0YXJnZXQgPT0gZGlzcGxheS5zY3JvbGxiYXJGaWxsZXIgfHwgdGFyZ2V0ID09IGRpc3BsYXkuZ3V0dGVyRmlsbGVyKSByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdmFyIHgsIHksIHNwYWNlID0gZGlzcGxheS5saW5lU3BhY2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgLy8gRmFpbHMgdW5wcmVkaWN0YWJseSBvbiBJRVs2N10gd2hlbiBtb3VzZSBpcyBkcmFnZ2VkIGFyb3VuZCBxdWlja2x5LlxuICAgIHRyeSB7IHggPSBlLmNsaWVudFggLSBzcGFjZS5sZWZ0OyB5ID0gZS5jbGllbnRZIC0gc3BhY2UudG9wOyB9XG4gICAgY2F0Y2ggKGUpIHsgcmV0dXJuIG51bGw7IH1cbiAgICB2YXIgY29vcmRzID0gY29vcmRzQ2hhcihjbSwgeCwgeSksIGxpbmU7XG4gICAgaWYgKGZvclJlY3QgJiYgY29vcmRzLnhSZWwgPT0gMSAmJiAobGluZSA9IGdldExpbmUoY20uZG9jLCBjb29yZHMubGluZSkudGV4dCkubGVuZ3RoID09IGNvb3Jkcy5jaCkge1xuICAgICAgdmFyIGNvbERpZmYgPSBjb3VudENvbHVtbihsaW5lLCBsaW5lLmxlbmd0aCwgY20ub3B0aW9ucy50YWJTaXplKSAtIGxpbmUubGVuZ3RoO1xuICAgICAgY29vcmRzID0gUG9zKGNvb3Jkcy5saW5lLCBNYXRoLm1heCgwLCBNYXRoLnJvdW5kKCh4IC0gcGFkZGluZ0goY20uZGlzcGxheSkubGVmdCkgLyBjaGFyV2lkdGgoY20uZGlzcGxheSkpIC0gY29sRGlmZikpO1xuICAgIH1cbiAgICByZXR1cm4gY29vcmRzO1xuICB9XG5cbiAgLy8gQSBtb3VzZSBkb3duIGNhbiBiZSBhIHNpbmdsZSBjbGljaywgZG91YmxlIGNsaWNrLCB0cmlwbGUgY2xpY2ssXG4gIC8vIHN0YXJ0IG9mIHNlbGVjdGlvbiBkcmFnLCBzdGFydCBvZiB0ZXh0IGRyYWcsIG5ldyBjdXJzb3JcbiAgLy8gKGN0cmwtY2xpY2spLCByZWN0YW5nbGUgZHJhZyAoYWx0LWRyYWcpLCBvciB4d2luXG4gIC8vIG1pZGRsZS1jbGljay1wYXN0ZS4gT3IgaXQgbWlnaHQgYmUgYSBjbGljayBvbiBzb21ldGhpbmcgd2Ugc2hvdWxkXG4gIC8vIG5vdCBpbnRlcmZlcmUgd2l0aCwgc3VjaCBhcyBhIHNjcm9sbGJhciBvciB3aWRnZXQuXG4gIGZ1bmN0aW9uIG9uTW91c2VEb3duKGUpIHtcbiAgICBpZiAoc2lnbmFsRE9NRXZlbnQodGhpcywgZSkpIHJldHVybjtcbiAgICB2YXIgY20gPSB0aGlzLCBkaXNwbGF5ID0gY20uZGlzcGxheTtcbiAgICBkaXNwbGF5LnNoaWZ0ID0gZS5zaGlmdEtleTtcblxuICAgIGlmIChldmVudEluV2lkZ2V0KGRpc3BsYXksIGUpKSB7XG4gICAgICBpZiAoIXdlYmtpdCkge1xuICAgICAgICAvLyBCcmllZmx5IHR1cm4gb2ZmIGRyYWdnYWJpbGl0eSwgdG8gYWxsb3cgd2lkZ2V0cyB0byBkb1xuICAgICAgICAvLyBub3JtYWwgZHJhZ2dpbmcgdGhpbmdzLlxuICAgICAgICBkaXNwbGF5LnNjcm9sbGVyLmRyYWdnYWJsZSA9IGZhbHNlO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZGlzcGxheS5zY3JvbGxlci5kcmFnZ2FibGUgPSB0cnVlO30sIDEwMCk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChjbGlja0luR3V0dGVyKGNtLCBlKSkgcmV0dXJuO1xuICAgIHZhciBzdGFydCA9IHBvc0Zyb21Nb3VzZShjbSwgZSk7XG4gICAgd2luZG93LmZvY3VzKCk7XG5cbiAgICBzd2l0Y2ggKGVfYnV0dG9uKGUpKSB7XG4gICAgY2FzZSAxOlxuICAgICAgaWYgKHN0YXJ0KVxuICAgICAgICBsZWZ0QnV0dG9uRG93bihjbSwgZSwgc3RhcnQpO1xuICAgICAgZWxzZSBpZiAoZV90YXJnZXQoZSkgPT0gZGlzcGxheS5zY3JvbGxlcilcbiAgICAgICAgZV9wcmV2ZW50RGVmYXVsdChlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMjpcbiAgICAgIGlmICh3ZWJraXQpIGNtLnN0YXRlLmxhc3RNaWRkbGVEb3duID0gK25ldyBEYXRlO1xuICAgICAgaWYgKHN0YXJ0KSBleHRlbmRTZWxlY3Rpb24oY20uZG9jLCBzdGFydCk7XG4gICAgICBzZXRUaW1lb3V0KGJpbmQoZm9jdXNJbnB1dCwgY20pLCAyMCk7XG4gICAgICBlX3ByZXZlbnREZWZhdWx0KGUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAzOlxuICAgICAgaWYgKGNhcHR1cmVSaWdodENsaWNrKSBvbkNvbnRleHRNZW51KGNtLCBlKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHZhciBsYXN0Q2xpY2ssIGxhc3REb3VibGVDbGljaztcbiAgZnVuY3Rpb24gbGVmdEJ1dHRvbkRvd24oY20sIGUsIHN0YXJ0KSB7XG4gICAgc2V0VGltZW91dChiaW5kKGVuc3VyZUZvY3VzLCBjbSksIDApO1xuXG4gICAgdmFyIG5vdyA9ICtuZXcgRGF0ZSwgdHlwZTtcbiAgICBpZiAobGFzdERvdWJsZUNsaWNrICYmIGxhc3REb3VibGVDbGljay50aW1lID4gbm93IC0gNDAwICYmIGNtcChsYXN0RG91YmxlQ2xpY2sucG9zLCBzdGFydCkgPT0gMCkge1xuICAgICAgdHlwZSA9IFwidHJpcGxlXCI7XG4gICAgfSBlbHNlIGlmIChsYXN0Q2xpY2sgJiYgbGFzdENsaWNrLnRpbWUgPiBub3cgLSA0MDAgJiYgY21wKGxhc3RDbGljay5wb3MsIHN0YXJ0KSA9PSAwKSB7XG4gICAgICB0eXBlID0gXCJkb3VibGVcIjtcbiAgICAgIGxhc3REb3VibGVDbGljayA9IHt0aW1lOiBub3csIHBvczogc3RhcnR9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0eXBlID0gXCJzaW5nbGVcIjtcbiAgICAgIGxhc3RDbGljayA9IHt0aW1lOiBub3csIHBvczogc3RhcnR9O1xuICAgIH1cblxuICAgIHZhciBzZWwgPSBjbS5kb2Muc2VsLCBtb2RpZmllciA9IG1hYyA/IGUubWV0YUtleSA6IGUuY3RybEtleTtcbiAgICBpZiAoY20ub3B0aW9ucy5kcmFnRHJvcCAmJiBkcmFnQW5kRHJvcCAmJiAhaXNSZWFkT25seShjbSkgJiZcbiAgICAgICAgdHlwZSA9PSBcInNpbmdsZVwiICYmIHNlbC5jb250YWlucyhzdGFydCkgPiAtMSAmJiBzZWwuc29tZXRoaW5nU2VsZWN0ZWQoKSlcbiAgICAgIGxlZnRCdXR0b25TdGFydERyYWcoY20sIGUsIHN0YXJ0LCBtb2RpZmllcik7XG4gICAgZWxzZVxuICAgICAgbGVmdEJ1dHRvblNlbGVjdChjbSwgZSwgc3RhcnQsIHR5cGUsIG1vZGlmaWVyKTtcbiAgfVxuXG4gIC8vIFN0YXJ0IGEgdGV4dCBkcmFnLiBXaGVuIGl0IGVuZHMsIHNlZSBpZiBhbnkgZHJhZ2dpbmcgYWN0dWFsbHlcbiAgLy8gaGFwcGVuLCBhbmQgdHJlYXQgYXMgYSBjbGljayBpZiBpdCBkaWRuJ3QuXG4gIGZ1bmN0aW9uIGxlZnRCdXR0b25TdGFydERyYWcoY20sIGUsIHN0YXJ0LCBtb2RpZmllcikge1xuICAgIHZhciBkaXNwbGF5ID0gY20uZGlzcGxheTtcbiAgICB2YXIgZHJhZ0VuZCA9IG9wZXJhdGlvbihjbSwgZnVuY3Rpb24oZTIpIHtcbiAgICAgIGlmICh3ZWJraXQpIGRpc3BsYXkuc2Nyb2xsZXIuZHJhZ2dhYmxlID0gZmFsc2U7XG4gICAgICBjbS5zdGF0ZS5kcmFnZ2luZ1RleHQgPSBmYWxzZTtcbiAgICAgIG9mZihkb2N1bWVudCwgXCJtb3VzZXVwXCIsIGRyYWdFbmQpO1xuICAgICAgb2ZmKGRpc3BsYXkuc2Nyb2xsZXIsIFwiZHJvcFwiLCBkcmFnRW5kKTtcbiAgICAgIGlmIChNYXRoLmFicyhlLmNsaWVudFggLSBlMi5jbGllbnRYKSArIE1hdGguYWJzKGUuY2xpZW50WSAtIGUyLmNsaWVudFkpIDwgMTApIHtcbiAgICAgICAgZV9wcmV2ZW50RGVmYXVsdChlMik7XG4gICAgICAgIGlmICghbW9kaWZpZXIpXG4gICAgICAgICAgZXh0ZW5kU2VsZWN0aW9uKGNtLmRvYywgc3RhcnQpO1xuICAgICAgICBmb2N1c0lucHV0KGNtKTtcbiAgICAgICAgLy8gV29yayBhcm91bmQgdW5leHBsYWluYWJsZSBmb2N1cyBwcm9ibGVtIGluIElFOSAoIzIxMjcpXG4gICAgICAgIGlmIChpZV91cHRvMTAgJiYgIWllX3VwdG84KVxuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7ZG9jdW1lbnQuYm9keS5mb2N1cygpOyBmb2N1c0lucHV0KGNtKTt9LCAyMCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgLy8gTGV0IHRoZSBkcmFnIGhhbmRsZXIgaGFuZGxlIHRoaXMuXG4gICAgaWYgKHdlYmtpdCkgZGlzcGxheS5zY3JvbGxlci5kcmFnZ2FibGUgPSB0cnVlO1xuICAgIGNtLnN0YXRlLmRyYWdnaW5nVGV4dCA9IGRyYWdFbmQ7XG4gICAgLy8gSUUncyBhcHByb2FjaCB0byBkcmFnZ2FibGVcbiAgICBpZiAoZGlzcGxheS5zY3JvbGxlci5kcmFnRHJvcCkgZGlzcGxheS5zY3JvbGxlci5kcmFnRHJvcCgpO1xuICAgIG9uKGRvY3VtZW50LCBcIm1vdXNldXBcIiwgZHJhZ0VuZCk7XG4gICAgb24oZGlzcGxheS5zY3JvbGxlciwgXCJkcm9wXCIsIGRyYWdFbmQpO1xuICB9XG5cbiAgLy8gTm9ybWFsIHNlbGVjdGlvbiwgYXMgb3Bwb3NlZCB0byB0ZXh0IGRyYWdnaW5nLlxuICBmdW5jdGlvbiBsZWZ0QnV0dG9uU2VsZWN0KGNtLCBlLCBzdGFydCwgdHlwZSwgYWRkTmV3KSB7XG4gICAgdmFyIGRpc3BsYXkgPSBjbS5kaXNwbGF5LCBkb2MgPSBjbS5kb2M7XG4gICAgZV9wcmV2ZW50RGVmYXVsdChlKTtcblxuICAgIHZhciBvdXJSYW5nZSwgb3VySW5kZXgsIHN0YXJ0U2VsID0gZG9jLnNlbDtcbiAgICBpZiAoYWRkTmV3ICYmICFlLnNoaWZ0S2V5KSB7XG4gICAgICBvdXJJbmRleCA9IGRvYy5zZWwuY29udGFpbnMoc3RhcnQpO1xuICAgICAgaWYgKG91ckluZGV4ID4gLTEpXG4gICAgICAgIG91clJhbmdlID0gZG9jLnNlbC5yYW5nZXNbb3VySW5kZXhdO1xuICAgICAgZWxzZVxuICAgICAgICBvdXJSYW5nZSA9IG5ldyBSYW5nZShzdGFydCwgc3RhcnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXJSYW5nZSA9IGRvYy5zZWwucHJpbWFyeSgpO1xuICAgIH1cblxuICAgIGlmIChlLmFsdEtleSkge1xuICAgICAgdHlwZSA9IFwicmVjdFwiO1xuICAgICAgaWYgKCFhZGROZXcpIG91clJhbmdlID0gbmV3IFJhbmdlKHN0YXJ0LCBzdGFydCk7XG4gICAgICBzdGFydCA9IHBvc0Zyb21Nb3VzZShjbSwgZSwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICBvdXJJbmRleCA9IC0xO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcImRvdWJsZVwiKSB7XG4gICAgICB2YXIgd29yZCA9IGZpbmRXb3JkQXQoY20sIHN0YXJ0KTtcbiAgICAgIGlmIChjbS5kaXNwbGF5LnNoaWZ0IHx8IGRvYy5leHRlbmQpXG4gICAgICAgIG91clJhbmdlID0gZXh0ZW5kUmFuZ2UoZG9jLCBvdXJSYW5nZSwgd29yZC5hbmNob3IsIHdvcmQuaGVhZCk7XG4gICAgICBlbHNlXG4gICAgICAgIG91clJhbmdlID0gd29yZDtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJ0cmlwbGVcIikge1xuICAgICAgdmFyIGxpbmUgPSBuZXcgUmFuZ2UoUG9zKHN0YXJ0LmxpbmUsIDApLCBjbGlwUG9zKGRvYywgUG9zKHN0YXJ0LmxpbmUgKyAxLCAwKSkpO1xuICAgICAgaWYgKGNtLmRpc3BsYXkuc2hpZnQgfHwgZG9jLmV4dGVuZClcbiAgICAgICAgb3VyUmFuZ2UgPSBleHRlbmRSYW5nZShkb2MsIG91clJhbmdlLCBsaW5lLmFuY2hvciwgbGluZS5oZWFkKTtcbiAgICAgIGVsc2VcbiAgICAgICAgb3VyUmFuZ2UgPSBsaW5lO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXJSYW5nZSA9IGV4dGVuZFJhbmdlKGRvYywgb3VyUmFuZ2UsIHN0YXJ0KTtcbiAgICB9XG5cbiAgICBpZiAoIWFkZE5ldykge1xuICAgICAgb3VySW5kZXggPSAwO1xuICAgICAgc2V0U2VsZWN0aW9uKGRvYywgbmV3IFNlbGVjdGlvbihbb3VyUmFuZ2VdLCAwKSwgc2VsX21vdXNlKTtcbiAgICAgIHN0YXJ0U2VsID0gZG9jLnNlbDtcbiAgICB9IGVsc2UgaWYgKG91ckluZGV4ID4gLTEpIHtcbiAgICAgIHJlcGxhY2VPbmVTZWxlY3Rpb24oZG9jLCBvdXJJbmRleCwgb3VyUmFuZ2UsIHNlbF9tb3VzZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91ckluZGV4ID0gZG9jLnNlbC5yYW5nZXMubGVuZ3RoO1xuICAgICAgc2V0U2VsZWN0aW9uKGRvYywgbm9ybWFsaXplU2VsZWN0aW9uKGRvYy5zZWwucmFuZ2VzLmNvbmNhdChbb3VyUmFuZ2VdKSwgb3VySW5kZXgpLFxuICAgICAgICAgICAgICAgICAgIHtzY3JvbGw6IGZhbHNlLCBvcmlnaW46IFwiKm1vdXNlXCJ9KTtcbiAgICB9XG5cbiAgICB2YXIgbGFzdFBvcyA9IHN0YXJ0O1xuICAgIGZ1bmN0aW9uIGV4dGVuZFRvKHBvcykge1xuICAgICAgaWYgKGNtcChsYXN0UG9zLCBwb3MpID09IDApIHJldHVybjtcbiAgICAgIGxhc3RQb3MgPSBwb3M7XG5cbiAgICAgIGlmICh0eXBlID09IFwicmVjdFwiKSB7XG4gICAgICAgIHZhciByYW5nZXMgPSBbXSwgdGFiU2l6ZSA9IGNtLm9wdGlvbnMudGFiU2l6ZTtcbiAgICAgICAgdmFyIHN0YXJ0Q29sID0gY291bnRDb2x1bW4oZ2V0TGluZShkb2MsIHN0YXJ0LmxpbmUpLnRleHQsIHN0YXJ0LmNoLCB0YWJTaXplKTtcbiAgICAgICAgdmFyIHBvc0NvbCA9IGNvdW50Q29sdW1uKGdldExpbmUoZG9jLCBwb3MubGluZSkudGV4dCwgcG9zLmNoLCB0YWJTaXplKTtcbiAgICAgICAgdmFyIGxlZnQgPSBNYXRoLm1pbihzdGFydENvbCwgcG9zQ29sKSwgcmlnaHQgPSBNYXRoLm1heChzdGFydENvbCwgcG9zQ29sKTtcbiAgICAgICAgZm9yICh2YXIgbGluZSA9IE1hdGgubWluKHN0YXJ0LmxpbmUsIHBvcy5saW5lKSwgZW5kID0gTWF0aC5taW4oY20ubGFzdExpbmUoKSwgTWF0aC5tYXgoc3RhcnQubGluZSwgcG9zLmxpbmUpKTtcbiAgICAgICAgICAgICBsaW5lIDw9IGVuZDsgbGluZSsrKSB7XG4gICAgICAgICAgdmFyIHRleHQgPSBnZXRMaW5lKGRvYywgbGluZSkudGV4dCwgbGVmdFBvcyA9IGZpbmRDb2x1bW4odGV4dCwgbGVmdCwgdGFiU2l6ZSk7XG4gICAgICAgICAgaWYgKGxlZnQgPT0gcmlnaHQpXG4gICAgICAgICAgICByYW5nZXMucHVzaChuZXcgUmFuZ2UoUG9zKGxpbmUsIGxlZnRQb3MpLCBQb3MobGluZSwgbGVmdFBvcykpKTtcbiAgICAgICAgICBlbHNlIGlmICh0ZXh0Lmxlbmd0aCA+IGxlZnRQb3MpXG4gICAgICAgICAgICByYW5nZXMucHVzaChuZXcgUmFuZ2UoUG9zKGxpbmUsIGxlZnRQb3MpLCBQb3MobGluZSwgZmluZENvbHVtbih0ZXh0LCByaWdodCwgdGFiU2l6ZSkpKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFyYW5nZXMubGVuZ3RoKSByYW5nZXMucHVzaChuZXcgUmFuZ2Uoc3RhcnQsIHN0YXJ0KSk7XG4gICAgICAgIHNldFNlbGVjdGlvbihkb2MsIG5vcm1hbGl6ZVNlbGVjdGlvbihzdGFydFNlbC5yYW5nZXMuc2xpY2UoMCwgb3VySW5kZXgpLmNvbmNhdChyYW5nZXMpLCBvdXJJbmRleCksXG4gICAgICAgICAgICAgICAgICAgICB7b3JpZ2luOiBcIiptb3VzZVwiLCBzY3JvbGw6IGZhbHNlfSk7XG4gICAgICAgIGNtLnNjcm9sbEludG9WaWV3KHBvcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgb2xkUmFuZ2UgPSBvdXJSYW5nZTtcbiAgICAgICAgdmFyIGFuY2hvciA9IG9sZFJhbmdlLmFuY2hvciwgaGVhZCA9IHBvcztcbiAgICAgICAgaWYgKHR5cGUgIT0gXCJzaW5nbGVcIikge1xuICAgICAgICAgIGlmICh0eXBlID09IFwiZG91YmxlXCIpXG4gICAgICAgICAgICB2YXIgcmFuZ2UgPSBmaW5kV29yZEF0KGNtLCBwb3MpO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHZhciByYW5nZSA9IG5ldyBSYW5nZShQb3MocG9zLmxpbmUsIDApLCBjbGlwUG9zKGRvYywgUG9zKHBvcy5saW5lICsgMSwgMCkpKTtcbiAgICAgICAgICBpZiAoY21wKHJhbmdlLmFuY2hvciwgYW5jaG9yKSA+IDApIHtcbiAgICAgICAgICAgIGhlYWQgPSByYW5nZS5oZWFkO1xuICAgICAgICAgICAgYW5jaG9yID0gbWluUG9zKG9sZFJhbmdlLmZyb20oKSwgcmFuZ2UuYW5jaG9yKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGVhZCA9IHJhbmdlLmFuY2hvcjtcbiAgICAgICAgICAgIGFuY2hvciA9IG1heFBvcyhvbGRSYW5nZS50bygpLCByYW5nZS5oZWFkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJhbmdlcyA9IHN0YXJ0U2VsLnJhbmdlcy5zbGljZSgwKTtcbiAgICAgICAgcmFuZ2VzW291ckluZGV4XSA9IG5ldyBSYW5nZShjbGlwUG9zKGRvYywgYW5jaG9yKSwgaGVhZCk7XG4gICAgICAgIHNldFNlbGVjdGlvbihkb2MsIG5vcm1hbGl6ZVNlbGVjdGlvbihyYW5nZXMsIG91ckluZGV4KSwgc2VsX21vdXNlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgZWRpdG9yU2l6ZSA9IGRpc3BsYXkud3JhcHBlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAvLyBVc2VkIHRvIGVuc3VyZSB0aW1lb3V0IHJlLXRyaWVzIGRvbid0IGZpcmUgd2hlbiBhbm90aGVyIGV4dGVuZFxuICAgIC8vIGhhcHBlbmVkIGluIHRoZSBtZWFudGltZSAoY2xlYXJUaW1lb3V0IGlzbid0IHJlbGlhYmxlIC0tIGF0XG4gICAgLy8gbGVhc3Qgb24gQ2hyb21lLCB0aGUgdGltZW91dHMgc3RpbGwgaGFwcGVuIGV2ZW4gd2hlbiBjbGVhcmVkLFxuICAgIC8vIGlmIHRoZSBjbGVhciBoYXBwZW5zIGFmdGVyIHRoZWlyIHNjaGVkdWxlZCBmaXJpbmcgdGltZSkuXG4gICAgdmFyIGNvdW50ZXIgPSAwO1xuXG4gICAgZnVuY3Rpb24gZXh0ZW5kKGUpIHtcbiAgICAgIHZhciBjdXJDb3VudCA9ICsrY291bnRlcjtcbiAgICAgIHZhciBjdXIgPSBwb3NGcm9tTW91c2UoY20sIGUsIHRydWUsIHR5cGUgPT0gXCJyZWN0XCIpO1xuICAgICAgaWYgKCFjdXIpIHJldHVybjtcbiAgICAgIGlmIChjbXAoY3VyLCBsYXN0UG9zKSAhPSAwKSB7XG4gICAgICAgIGVuc3VyZUZvY3VzKGNtKTtcbiAgICAgICAgZXh0ZW5kVG8oY3VyKTtcbiAgICAgICAgdmFyIHZpc2libGUgPSB2aXNpYmxlTGluZXMoZGlzcGxheSwgZG9jKTtcbiAgICAgICAgaWYgKGN1ci5saW5lID49IHZpc2libGUudG8gfHwgY3VyLmxpbmUgPCB2aXNpYmxlLmZyb20pXG4gICAgICAgICAgc2V0VGltZW91dChvcGVyYXRpb24oY20sIGZ1bmN0aW9uKCl7aWYgKGNvdW50ZXIgPT0gY3VyQ291bnQpIGV4dGVuZChlKTt9KSwgMTUwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBvdXRzaWRlID0gZS5jbGllbnRZIDwgZWRpdG9yU2l6ZS50b3AgPyAtMjAgOiBlLmNsaWVudFkgPiBlZGl0b3JTaXplLmJvdHRvbSA/IDIwIDogMDtcbiAgICAgICAgaWYgKG91dHNpZGUpIHNldFRpbWVvdXQob3BlcmF0aW9uKGNtLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoY291bnRlciAhPSBjdXJDb3VudCkgcmV0dXJuO1xuICAgICAgICAgIGRpc3BsYXkuc2Nyb2xsZXIuc2Nyb2xsVG9wICs9IG91dHNpZGU7XG4gICAgICAgICAgZXh0ZW5kKGUpO1xuICAgICAgICB9KSwgNTApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRvbmUoZSkge1xuICAgICAgY291bnRlciA9IEluZmluaXR5O1xuICAgICAgZV9wcmV2ZW50RGVmYXVsdChlKTtcbiAgICAgIGZvY3VzSW5wdXQoY20pO1xuICAgICAgb2ZmKGRvY3VtZW50LCBcIm1vdXNlbW92ZVwiLCBtb3ZlKTtcbiAgICAgIG9mZihkb2N1bWVudCwgXCJtb3VzZXVwXCIsIHVwKTtcbiAgICAgIGRvYy5oaXN0b3J5Lmxhc3RTZWxPcmlnaW4gPSBudWxsO1xuICAgIH1cblxuICAgIHZhciBtb3ZlID0gb3BlcmF0aW9uKGNtLCBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAoKGllICYmICFpZV91cHRvOSkgPyAgIWUuYnV0dG9ucyA6ICFlX2J1dHRvbihlKSkgZG9uZShlKTtcbiAgICAgIGVsc2UgZXh0ZW5kKGUpO1xuICAgIH0pO1xuICAgIHZhciB1cCA9IG9wZXJhdGlvbihjbSwgZG9uZSk7XG4gICAgb24oZG9jdW1lbnQsIFwibW91c2Vtb3ZlXCIsIG1vdmUpO1xuICAgIG9uKGRvY3VtZW50LCBcIm1vdXNldXBcIiwgdXApO1xuICB9XG5cbiAgLy8gRGV0ZXJtaW5lcyB3aGV0aGVyIGFuIGV2ZW50IGhhcHBlbmVkIGluIHRoZSBndXR0ZXIsIGFuZCBmaXJlcyB0aGVcbiAgLy8gaGFuZGxlcnMgZm9yIHRoZSBjb3JyZXNwb25kaW5nIGV2ZW50LlxuICBmdW5jdGlvbiBndXR0ZXJFdmVudChjbSwgZSwgdHlwZSwgcHJldmVudCwgc2lnbmFsZm4pIHtcbiAgICB0cnkgeyB2YXIgbVggPSBlLmNsaWVudFgsIG1ZID0gZS5jbGllbnRZOyB9XG4gICAgY2F0Y2goZSkgeyByZXR1cm4gZmFsc2U7IH1cbiAgICBpZiAobVggPj0gTWF0aC5mbG9vcihjbS5kaXNwbGF5Lmd1dHRlcnMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkucmlnaHQpKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKHByZXZlbnQpIGVfcHJldmVudERlZmF1bHQoZSk7XG5cbiAgICB2YXIgZGlzcGxheSA9IGNtLmRpc3BsYXk7XG4gICAgdmFyIGxpbmVCb3ggPSBkaXNwbGF5LmxpbmVEaXYuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICBpZiAobVkgPiBsaW5lQm94LmJvdHRvbSB8fCAhaGFzSGFuZGxlcihjbSwgdHlwZSkpIHJldHVybiBlX2RlZmF1bHRQcmV2ZW50ZWQoZSk7XG4gICAgbVkgLT0gbGluZUJveC50b3AgLSBkaXNwbGF5LnZpZXdPZmZzZXQ7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNtLm9wdGlvbnMuZ3V0dGVycy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGcgPSBkaXNwbGF5Lmd1dHRlcnMuY2hpbGROb2Rlc1tpXTtcbiAgICAgIGlmIChnICYmIGcuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkucmlnaHQgPj0gbVgpIHtcbiAgICAgICAgdmFyIGxpbmUgPSBsaW5lQXRIZWlnaHQoY20uZG9jLCBtWSk7XG4gICAgICAgIHZhciBndXR0ZXIgPSBjbS5vcHRpb25zLmd1dHRlcnNbaV07XG4gICAgICAgIHNpZ25hbGZuKGNtLCB0eXBlLCBjbSwgbGluZSwgZ3V0dGVyLCBlKTtcbiAgICAgICAgcmV0dXJuIGVfZGVmYXVsdFByZXZlbnRlZChlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjbGlja0luR3V0dGVyKGNtLCBlKSB7XG4gICAgcmV0dXJuIGd1dHRlckV2ZW50KGNtLCBlLCBcImd1dHRlckNsaWNrXCIsIHRydWUsIHNpZ25hbExhdGVyKTtcbiAgfVxuXG4gIC8vIEtsdWRnZSB0byB3b3JrIGFyb3VuZCBzdHJhbmdlIElFIGJlaGF2aW9yIHdoZXJlIGl0J2xsIHNvbWV0aW1lc1xuICAvLyByZS1maXJlIGEgc2VyaWVzIG9mIGRyYWctcmVsYXRlZCBldmVudHMgcmlnaHQgYWZ0ZXIgdGhlIGRyb3AgKCMxNTUxKVxuICB2YXIgbGFzdERyb3AgPSAwO1xuXG4gIGZ1bmN0aW9uIG9uRHJvcChlKSB7XG4gICAgdmFyIGNtID0gdGhpcztcbiAgICBpZiAoc2lnbmFsRE9NRXZlbnQoY20sIGUpIHx8IGV2ZW50SW5XaWRnZXQoY20uZGlzcGxheSwgZSkpXG4gICAgICByZXR1cm47XG4gICAgZV9wcmV2ZW50RGVmYXVsdChlKTtcbiAgICBpZiAoaWUpIGxhc3REcm9wID0gK25ldyBEYXRlO1xuICAgIHZhciBwb3MgPSBwb3NGcm9tTW91c2UoY20sIGUsIHRydWUpLCBmaWxlcyA9IGUuZGF0YVRyYW5zZmVyLmZpbGVzO1xuICAgIGlmICghcG9zIHx8IGlzUmVhZE9ubHkoY20pKSByZXR1cm47XG4gICAgLy8gTWlnaHQgYmUgYSBmaWxlIGRyb3AsIGluIHdoaWNoIGNhc2Ugd2Ugc2ltcGx5IGV4dHJhY3QgdGhlIHRleHRcbiAgICAvLyBhbmQgaW5zZXJ0IGl0LlxuICAgIGlmIChmaWxlcyAmJiBmaWxlcy5sZW5ndGggJiYgd2luZG93LkZpbGVSZWFkZXIgJiYgd2luZG93LkZpbGUpIHtcbiAgICAgIHZhciBuID0gZmlsZXMubGVuZ3RoLCB0ZXh0ID0gQXJyYXkobiksIHJlYWQgPSAwO1xuICAgICAgdmFyIGxvYWRGaWxlID0gZnVuY3Rpb24oZmlsZSwgaSkge1xuICAgICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXI7XG4gICAgICAgIHJlYWRlci5vbmxvYWQgPSBvcGVyYXRpb24oY20sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRleHRbaV0gPSByZWFkZXIucmVzdWx0O1xuICAgICAgICAgIGlmICgrK3JlYWQgPT0gbikge1xuICAgICAgICAgICAgcG9zID0gY2xpcFBvcyhjbS5kb2MsIHBvcyk7XG4gICAgICAgICAgICB2YXIgY2hhbmdlID0ge2Zyb206IHBvcywgdG86IHBvcywgdGV4dDogc3BsaXRMaW5lcyh0ZXh0LmpvaW4oXCJcXG5cIikpLCBvcmlnaW46IFwicGFzdGVcIn07XG4gICAgICAgICAgICBtYWtlQ2hhbmdlKGNtLmRvYywgY2hhbmdlKTtcbiAgICAgICAgICAgIHNldFNlbGVjdGlvblJlcGxhY2VIaXN0b3J5KGNtLmRvYywgc2ltcGxlU2VsZWN0aW9uKHBvcywgY2hhbmdlRW5kKGNoYW5nZSkpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZWFkZXIucmVhZEFzVGV4dChmaWxlKTtcbiAgICAgIH07XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47ICsraSkgbG9hZEZpbGUoZmlsZXNbaV0sIGkpO1xuICAgIH0gZWxzZSB7IC8vIE5vcm1hbCBkcm9wXG4gICAgICAvLyBEb24ndCBkbyBhIHJlcGxhY2UgaWYgdGhlIGRyb3AgaGFwcGVuZWQgaW5zaWRlIG9mIHRoZSBzZWxlY3RlZCB0ZXh0LlxuICAgICAgaWYgKGNtLnN0YXRlLmRyYWdnaW5nVGV4dCAmJiBjbS5kb2Muc2VsLmNvbnRhaW5zKHBvcykgPiAtMSkge1xuICAgICAgICBjbS5zdGF0ZS5kcmFnZ2luZ1RleHQoZSk7XG4gICAgICAgIC8vIEVuc3VyZSB0aGUgZWRpdG9yIGlzIHJlLWZvY3VzZWRcbiAgICAgICAgc2V0VGltZW91dChiaW5kKGZvY3VzSW5wdXQsIGNtKSwgMjApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgdGV4dCA9IGUuZGF0YVRyYW5zZmVyLmdldERhdGEoXCJUZXh0XCIpO1xuICAgICAgICBpZiAodGV4dCkge1xuICAgICAgICAgIGlmIChjbS5zdGF0ZS5kcmFnZ2luZ1RleHQgJiYgIShtYWMgPyBlLm1ldGFLZXkgOiBlLmN0cmxLZXkpKVxuICAgICAgICAgICAgdmFyIHNlbGVjdGVkID0gY20ubGlzdFNlbGVjdGlvbnMoKTtcbiAgICAgICAgICBzZXRTZWxlY3Rpb25Ob1VuZG8oY20uZG9jLCBzaW1wbGVTZWxlY3Rpb24ocG9zLCBwb3MpKTtcbiAgICAgICAgICBpZiAoc2VsZWN0ZWQpIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZWN0ZWQubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICByZXBsYWNlUmFuZ2UoY20uZG9jLCBcIlwiLCBzZWxlY3RlZFtpXS5hbmNob3IsIHNlbGVjdGVkW2ldLmhlYWQsIFwiZHJhZ1wiKTtcbiAgICAgICAgICBjbS5yZXBsYWNlU2VsZWN0aW9uKHRleHQsIFwiYXJvdW5kXCIsIFwicGFzdGVcIik7XG4gICAgICAgICAgZm9jdXNJbnB1dChjbSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNhdGNoKGUpe31cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBvbkRyYWdTdGFydChjbSwgZSkge1xuICAgIGlmIChpZSAmJiAoIWNtLnN0YXRlLmRyYWdnaW5nVGV4dCB8fCArbmV3IERhdGUgLSBsYXN0RHJvcCA8IDEwMCkpIHsgZV9zdG9wKGUpOyByZXR1cm47IH1cbiAgICBpZiAoc2lnbmFsRE9NRXZlbnQoY20sIGUpIHx8IGV2ZW50SW5XaWRnZXQoY20uZGlzcGxheSwgZSkpIHJldHVybjtcblxuICAgIGUuZGF0YVRyYW5zZmVyLnNldERhdGEoXCJUZXh0XCIsIGNtLmdldFNlbGVjdGlvbigpKTtcblxuICAgIC8vIFVzZSBkdW1teSBpbWFnZSBpbnN0ZWFkIG9mIGRlZmF1bHQgYnJvd3NlcnMgaW1hZ2UuXG4gICAgLy8gUmVjZW50IFNhZmFyaSAofjYuMC4yKSBoYXZlIGEgdGVuZGVuY3kgdG8gc2VnZmF1bHQgd2hlbiB0aGlzIGhhcHBlbnMsIHNvIHdlIGRvbid0IGRvIGl0IHRoZXJlLlxuICAgIGlmIChlLmRhdGFUcmFuc2Zlci5zZXREcmFnSW1hZ2UgJiYgIXNhZmFyaSkge1xuICAgICAgdmFyIGltZyA9IGVsdChcImltZ1wiLCBudWxsLCBudWxsLCBcInBvc2l0aW9uOiBmaXhlZDsgbGVmdDogMDsgdG9wOiAwO1wiKTtcbiAgICAgIGltZy5zcmMgPSBcImRhdGE6aW1hZ2UvZ2lmO2Jhc2U2NCxSMGxHT0RsaEFRQUJBQUFBQUNINUJBRUtBQUVBTEFBQUFBQUJBQUVBQUFJQ1RBRUFPdz09XCI7XG4gICAgICBpZiAocHJlc3RvKSB7XG4gICAgICAgIGltZy53aWR0aCA9IGltZy5oZWlnaHQgPSAxO1xuICAgICAgICBjbS5kaXNwbGF5LndyYXBwZXIuYXBwZW5kQ2hpbGQoaW1nKTtcbiAgICAgICAgLy8gRm9yY2UgYSByZWxheW91dCwgb3IgT3BlcmEgd29uJ3QgdXNlIG91ciBpbWFnZSBmb3Igc29tZSBvYnNjdXJlIHJlYXNvblxuICAgICAgICBpbWcuX3RvcCA9IGltZy5vZmZzZXRUb3A7XG4gICAgICB9XG4gICAgICBlLmRhdGFUcmFuc2Zlci5zZXREcmFnSW1hZ2UoaW1nLCAwLCAwKTtcbiAgICAgIGlmIChwcmVzdG8pIGltZy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGltZyk7XG4gICAgfVxuICB9XG5cbiAgLy8gU0NST0xMIEVWRU5UU1xuXG4gIC8vIFN5bmMgdGhlIHNjcm9sbGFibGUgYXJlYSBhbmQgc2Nyb2xsYmFycywgZW5zdXJlIHRoZSB2aWV3cG9ydFxuICAvLyBjb3ZlcnMgdGhlIHZpc2libGUgYXJlYS5cbiAgZnVuY3Rpb24gc2V0U2Nyb2xsVG9wKGNtLCB2YWwpIHtcbiAgICBpZiAoTWF0aC5hYnMoY20uZG9jLnNjcm9sbFRvcCAtIHZhbCkgPCAyKSByZXR1cm47XG4gICAgY20uZG9jLnNjcm9sbFRvcCA9IHZhbDtcbiAgICBpZiAoIWdlY2tvKSB1cGRhdGVEaXNwbGF5KGNtLCB7dG9wOiB2YWx9KTtcbiAgICBpZiAoY20uZGlzcGxheS5zY3JvbGxlci5zY3JvbGxUb3AgIT0gdmFsKSBjbS5kaXNwbGF5LnNjcm9sbGVyLnNjcm9sbFRvcCA9IHZhbDtcbiAgICBpZiAoY20uZGlzcGxheS5zY3JvbGxiYXJWLnNjcm9sbFRvcCAhPSB2YWwpIGNtLmRpc3BsYXkuc2Nyb2xsYmFyVi5zY3JvbGxUb3AgPSB2YWw7XG4gICAgaWYgKGdlY2tvKSB1cGRhdGVEaXNwbGF5KGNtKTtcbiAgICBzdGFydFdvcmtlcihjbSwgMTAwKTtcbiAgfVxuICAvLyBTeW5jIHNjcm9sbGVyIGFuZCBzY3JvbGxiYXIsIGVuc3VyZSB0aGUgZ3V0dGVyIGVsZW1lbnRzIGFyZVxuICAvLyBhbGlnbmVkLlxuICBmdW5jdGlvbiBzZXRTY3JvbGxMZWZ0KGNtLCB2YWwsIGlzU2Nyb2xsZXIpIHtcbiAgICBpZiAoaXNTY3JvbGxlciA/IHZhbCA9PSBjbS5kb2Muc2Nyb2xsTGVmdCA6IE1hdGguYWJzKGNtLmRvYy5zY3JvbGxMZWZ0IC0gdmFsKSA8IDIpIHJldHVybjtcbiAgICB2YWwgPSBNYXRoLm1pbih2YWwsIGNtLmRpc3BsYXkuc2Nyb2xsZXIuc2Nyb2xsV2lkdGggLSBjbS5kaXNwbGF5LnNjcm9sbGVyLmNsaWVudFdpZHRoKTtcbiAgICBjbS5kb2Muc2Nyb2xsTGVmdCA9IHZhbDtcbiAgICBhbGlnbkhvcml6b250YWxseShjbSk7XG4gICAgaWYgKGNtLmRpc3BsYXkuc2Nyb2xsZXIuc2Nyb2xsTGVmdCAhPSB2YWwpIGNtLmRpc3BsYXkuc2Nyb2xsZXIuc2Nyb2xsTGVmdCA9IHZhbDtcbiAgICBpZiAoY20uZGlzcGxheS5zY3JvbGxiYXJILnNjcm9sbExlZnQgIT0gdmFsKSBjbS5kaXNwbGF5LnNjcm9sbGJhckguc2Nyb2xsTGVmdCA9IHZhbDtcbiAgfVxuXG4gIC8vIFNpbmNlIHRoZSBkZWx0YSB2YWx1ZXMgcmVwb3J0ZWQgb24gbW91c2Ugd2hlZWwgZXZlbnRzIGFyZVxuICAvLyB1bnN0YW5kYXJkaXplZCBiZXR3ZWVuIGJyb3dzZXJzIGFuZCBldmVuIGJyb3dzZXIgdmVyc2lvbnMsIGFuZFxuICAvLyBnZW5lcmFsbHkgaG9ycmlibHkgdW5wcmVkaWN0YWJsZSwgdGhpcyBjb2RlIHN0YXJ0cyBieSBtZWFzdXJpbmdcbiAgLy8gdGhlIHNjcm9sbCBlZmZlY3QgdGhhdCB0aGUgZmlyc3QgZmV3IG1vdXNlIHdoZWVsIGV2ZW50cyBoYXZlLFxuICAvLyBhbmQsIGZyb20gdGhhdCwgZGV0ZWN0cyB0aGUgd2F5IGl0IGNhbiBjb252ZXJ0IGRlbHRhcyB0byBwaXhlbFxuICAvLyBvZmZzZXRzIGFmdGVyd2FyZHMuXG4gIC8vXG4gIC8vIFRoZSByZWFzb24gd2Ugd2FudCB0byBrbm93IHRoZSBhbW91bnQgYSB3aGVlbCBldmVudCB3aWxsIHNjcm9sbFxuICAvLyBpcyB0aGF0IGl0IGdpdmVzIHVzIGEgY2hhbmNlIHRvIHVwZGF0ZSB0aGUgZGlzcGxheSBiZWZvcmUgdGhlXG4gIC8vIGFjdHVhbCBzY3JvbGxpbmcgaGFwcGVucywgcmVkdWNpbmcgZmxpY2tlcmluZy5cblxuICB2YXIgd2hlZWxTYW1wbGVzID0gMCwgd2hlZWxQaXhlbHNQZXJVbml0ID0gbnVsbDtcbiAgLy8gRmlsbCBpbiBhIGJyb3dzZXItZGV0ZWN0ZWQgc3RhcnRpbmcgdmFsdWUgb24gYnJvd3NlcnMgd2hlcmUgd2VcbiAgLy8ga25vdyBvbmUuIFRoZXNlIGRvbid0IGhhdmUgdG8gYmUgYWNjdXJhdGUgLS0gdGhlIHJlc3VsdCBvZiB0aGVtXG4gIC8vIGJlaW5nIHdyb25nIHdvdWxkIGp1c3QgYmUgYSBzbGlnaHQgZmxpY2tlciBvbiB0aGUgZmlyc3Qgd2hlZWxcbiAgLy8gc2Nyb2xsIChpZiBpdCBpcyBsYXJnZSBlbm91Z2gpLlxuICBpZiAoaWUpIHdoZWVsUGl4ZWxzUGVyVW5pdCA9IC0uNTM7XG4gIGVsc2UgaWYgKGdlY2tvKSB3aGVlbFBpeGVsc1BlclVuaXQgPSAxNTtcbiAgZWxzZSBpZiAoY2hyb21lKSB3aGVlbFBpeGVsc1BlclVuaXQgPSAtLjc7XG4gIGVsc2UgaWYgKHNhZmFyaSkgd2hlZWxQaXhlbHNQZXJVbml0ID0gLTEvMztcblxuICBmdW5jdGlvbiBvblNjcm9sbFdoZWVsKGNtLCBlKSB7XG4gICAgdmFyIGR4ID0gZS53aGVlbERlbHRhWCwgZHkgPSBlLndoZWVsRGVsdGFZO1xuICAgIGlmIChkeCA9PSBudWxsICYmIGUuZGV0YWlsICYmIGUuYXhpcyA9PSBlLkhPUklaT05UQUxfQVhJUykgZHggPSBlLmRldGFpbDtcbiAgICBpZiAoZHkgPT0gbnVsbCAmJiBlLmRldGFpbCAmJiBlLmF4aXMgPT0gZS5WRVJUSUNBTF9BWElTKSBkeSA9IGUuZGV0YWlsO1xuICAgIGVsc2UgaWYgKGR5ID09IG51bGwpIGR5ID0gZS53aGVlbERlbHRhO1xuXG4gICAgdmFyIGRpc3BsYXkgPSBjbS5kaXNwbGF5LCBzY3JvbGwgPSBkaXNwbGF5LnNjcm9sbGVyO1xuICAgIC8vIFF1aXQgaWYgdGhlcmUncyBub3RoaW5nIHRvIHNjcm9sbCBoZXJlXG4gICAgaWYgKCEoZHggJiYgc2Nyb2xsLnNjcm9sbFdpZHRoID4gc2Nyb2xsLmNsaWVudFdpZHRoIHx8XG4gICAgICAgICAgZHkgJiYgc2Nyb2xsLnNjcm9sbEhlaWdodCA+IHNjcm9sbC5jbGllbnRIZWlnaHQpKSByZXR1cm47XG5cbiAgICAvLyBXZWJraXQgYnJvd3NlcnMgb24gT1MgWCBhYm9ydCBtb21lbnR1bSBzY3JvbGxzIHdoZW4gdGhlIHRhcmdldFxuICAgIC8vIG9mIHRoZSBzY3JvbGwgZXZlbnQgaXMgcmVtb3ZlZCBmcm9tIHRoZSBzY3JvbGxhYmxlIGVsZW1lbnQuXG4gICAgLy8gVGhpcyBoYWNrIChzZWUgcmVsYXRlZCBjb2RlIGluIHBhdGNoRGlzcGxheSkgbWFrZXMgc3VyZSB0aGVcbiAgICAvLyBlbGVtZW50IGlzIGtlcHQgYXJvdW5kLlxuICAgIGlmIChkeSAmJiBtYWMgJiYgd2Via2l0KSB7XG4gICAgICBvdXRlcjogZm9yICh2YXIgY3VyID0gZS50YXJnZXQsIHZpZXcgPSBkaXNwbGF5LnZpZXc7IGN1ciAhPSBzY3JvbGw7IGN1ciA9IGN1ci5wYXJlbnROb2RlKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmlldy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmICh2aWV3W2ldLm5vZGUgPT0gY3VyKSB7XG4gICAgICAgICAgICBjbS5kaXNwbGF5LmN1cnJlbnRXaGVlbFRhcmdldCA9IGN1cjtcbiAgICAgICAgICAgIGJyZWFrIG91dGVyO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE9uIHNvbWUgYnJvd3NlcnMsIGhvcml6b250YWwgc2Nyb2xsaW5nIHdpbGwgY2F1c2UgcmVkcmF3cyB0b1xuICAgIC8vIGhhcHBlbiBiZWZvcmUgdGhlIGd1dHRlciBoYXMgYmVlbiByZWFsaWduZWQsIGNhdXNpbmcgaXQgdG9cbiAgICAvLyB3cmlnZ2xlIGFyb3VuZCBpbiBhIG1vc3QgdW5zZWVtbHkgd2F5LiBXaGVuIHdlIGhhdmUgYW5cbiAgICAvLyBlc3RpbWF0ZWQgcGl4ZWxzL2RlbHRhIHZhbHVlLCB3ZSBqdXN0IGhhbmRsZSBob3Jpem9udGFsXG4gICAgLy8gc2Nyb2xsaW5nIGVudGlyZWx5IGhlcmUuIEl0J2xsIGJlIHNsaWdodGx5IG9mZiBmcm9tIG5hdGl2ZSwgYnV0XG4gICAgLy8gYmV0dGVyIHRoYW4gZ2xpdGNoaW5nIG91dC5cbiAgICBpZiAoZHggJiYgIWdlY2tvICYmICFwcmVzdG8gJiYgd2hlZWxQaXhlbHNQZXJVbml0ICE9IG51bGwpIHtcbiAgICAgIGlmIChkeSlcbiAgICAgICAgc2V0U2Nyb2xsVG9wKGNtLCBNYXRoLm1heCgwLCBNYXRoLm1pbihzY3JvbGwuc2Nyb2xsVG9wICsgZHkgKiB3aGVlbFBpeGVsc1BlclVuaXQsIHNjcm9sbC5zY3JvbGxIZWlnaHQgLSBzY3JvbGwuY2xpZW50SGVpZ2h0KSkpO1xuICAgICAgc2V0U2Nyb2xsTGVmdChjbSwgTWF0aC5tYXgoMCwgTWF0aC5taW4oc2Nyb2xsLnNjcm9sbExlZnQgKyBkeCAqIHdoZWVsUGl4ZWxzUGVyVW5pdCwgc2Nyb2xsLnNjcm9sbFdpZHRoIC0gc2Nyb2xsLmNsaWVudFdpZHRoKSkpO1xuICAgICAgZV9wcmV2ZW50RGVmYXVsdChlKTtcbiAgICAgIGRpc3BsYXkud2hlZWxTdGFydFggPSBudWxsOyAvLyBBYm9ydCBtZWFzdXJlbWVudCwgaWYgaW4gcHJvZ3Jlc3NcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyAnUHJvamVjdCcgdGhlIHZpc2libGUgdmlld3BvcnQgdG8gY292ZXIgdGhlIGFyZWEgdGhhdCBpcyBiZWluZ1xuICAgIC8vIHNjcm9sbGVkIGludG8gdmlldyAoaWYgd2Uga25vdyBlbm91Z2ggdG8gZXN0aW1hdGUgaXQpLlxuICAgIGlmIChkeSAmJiB3aGVlbFBpeGVsc1BlclVuaXQgIT0gbnVsbCkge1xuICAgICAgdmFyIHBpeGVscyA9IGR5ICogd2hlZWxQaXhlbHNQZXJVbml0O1xuICAgICAgdmFyIHRvcCA9IGNtLmRvYy5zY3JvbGxUb3AsIGJvdCA9IHRvcCArIGRpc3BsYXkud3JhcHBlci5jbGllbnRIZWlnaHQ7XG4gICAgICBpZiAocGl4ZWxzIDwgMCkgdG9wID0gTWF0aC5tYXgoMCwgdG9wICsgcGl4ZWxzIC0gNTApO1xuICAgICAgZWxzZSBib3QgPSBNYXRoLm1pbihjbS5kb2MuaGVpZ2h0LCBib3QgKyBwaXhlbHMgKyA1MCk7XG4gICAgICB1cGRhdGVEaXNwbGF5KGNtLCB7dG9wOiB0b3AsIGJvdHRvbTogYm90fSk7XG4gICAgfVxuXG4gICAgaWYgKHdoZWVsU2FtcGxlcyA8IDIwKSB7XG4gICAgICBpZiAoZGlzcGxheS53aGVlbFN0YXJ0WCA9PSBudWxsKSB7XG4gICAgICAgIGRpc3BsYXkud2hlZWxTdGFydFggPSBzY3JvbGwuc2Nyb2xsTGVmdDsgZGlzcGxheS53aGVlbFN0YXJ0WSA9IHNjcm9sbC5zY3JvbGxUb3A7XG4gICAgICAgIGRpc3BsYXkud2hlZWxEWCA9IGR4OyBkaXNwbGF5LndoZWVsRFkgPSBkeTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoZGlzcGxheS53aGVlbFN0YXJ0WCA9PSBudWxsKSByZXR1cm47XG4gICAgICAgICAgdmFyIG1vdmVkWCA9IHNjcm9sbC5zY3JvbGxMZWZ0IC0gZGlzcGxheS53aGVlbFN0YXJ0WDtcbiAgICAgICAgICB2YXIgbW92ZWRZID0gc2Nyb2xsLnNjcm9sbFRvcCAtIGRpc3BsYXkud2hlZWxTdGFydFk7XG4gICAgICAgICAgdmFyIHNhbXBsZSA9IChtb3ZlZFkgJiYgZGlzcGxheS53aGVlbERZICYmIG1vdmVkWSAvIGRpc3BsYXkud2hlZWxEWSkgfHxcbiAgICAgICAgICAgIChtb3ZlZFggJiYgZGlzcGxheS53aGVlbERYICYmIG1vdmVkWCAvIGRpc3BsYXkud2hlZWxEWCk7XG4gICAgICAgICAgZGlzcGxheS53aGVlbFN0YXJ0WCA9IGRpc3BsYXkud2hlZWxTdGFydFkgPSBudWxsO1xuICAgICAgICAgIGlmICghc2FtcGxlKSByZXR1cm47XG4gICAgICAgICAgd2hlZWxQaXhlbHNQZXJVbml0ID0gKHdoZWVsUGl4ZWxzUGVyVW5pdCAqIHdoZWVsU2FtcGxlcyArIHNhbXBsZSkgLyAod2hlZWxTYW1wbGVzICsgMSk7XG4gICAgICAgICAgKyt3aGVlbFNhbXBsZXM7XG4gICAgICAgIH0sIDIwMCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkaXNwbGF5LndoZWVsRFggKz0gZHg7IGRpc3BsYXkud2hlZWxEWSArPSBkeTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBLRVkgRVZFTlRTXG5cbiAgLy8gUnVuIGEgaGFuZGxlciB0aGF0IHdhcyBib3VuZCB0byBhIGtleS5cbiAgZnVuY3Rpb24gZG9IYW5kbGVCaW5kaW5nKGNtLCBib3VuZCwgZHJvcFNoaWZ0KSB7XG4gICAgaWYgKHR5cGVvZiBib3VuZCA9PSBcInN0cmluZ1wiKSB7XG4gICAgICBib3VuZCA9IGNvbW1hbmRzW2JvdW5kXTtcbiAgICAgIGlmICghYm91bmQpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gRW5zdXJlIHByZXZpb3VzIGlucHV0IGhhcyBiZWVuIHJlYWQsIHNvIHRoYXQgdGhlIGhhbmRsZXIgc2VlcyBhXG4gICAgLy8gY29uc2lzdGVudCB2aWV3IG9mIHRoZSBkb2N1bWVudFxuICAgIGlmIChjbS5kaXNwbGF5LnBvbGxpbmdGYXN0ICYmIHJlYWRJbnB1dChjbSkpIGNtLmRpc3BsYXkucG9sbGluZ0Zhc3QgPSBmYWxzZTtcbiAgICB2YXIgcHJldlNoaWZ0ID0gY20uZGlzcGxheS5zaGlmdCwgZG9uZSA9IGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICBpZiAoaXNSZWFkT25seShjbSkpIGNtLnN0YXRlLnN1cHByZXNzRWRpdHMgPSB0cnVlO1xuICAgICAgaWYgKGRyb3BTaGlmdCkgY20uZGlzcGxheS5zaGlmdCA9IGZhbHNlO1xuICAgICAgZG9uZSA9IGJvdW5kKGNtKSAhPSBQYXNzO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBjbS5kaXNwbGF5LnNoaWZ0ID0gcHJldlNoaWZ0O1xuICAgICAgY20uc3RhdGUuc3VwcHJlc3NFZGl0cyA9IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gZG9uZTtcbiAgfVxuXG4gIC8vIENvbGxlY3QgdGhlIGN1cnJlbnRseSBhY3RpdmUga2V5bWFwcy5cbiAgZnVuY3Rpb24gYWxsS2V5TWFwcyhjbSkge1xuICAgIHZhciBtYXBzID0gY20uc3RhdGUua2V5TWFwcy5zbGljZSgwKTtcbiAgICBpZiAoY20ub3B0aW9ucy5leHRyYUtleXMpIG1hcHMucHVzaChjbS5vcHRpb25zLmV4dHJhS2V5cyk7XG4gICAgbWFwcy5wdXNoKGNtLm9wdGlvbnMua2V5TWFwKTtcbiAgICByZXR1cm4gbWFwcztcbiAgfVxuXG4gIHZhciBtYXliZVRyYW5zaXRpb247XG4gIC8vIEhhbmRsZSBhIGtleSBmcm9tIHRoZSBrZXlkb3duIGV2ZW50LlxuICBmdW5jdGlvbiBoYW5kbGVLZXlCaW5kaW5nKGNtLCBlKSB7XG4gICAgLy8gSGFuZGxlIGF1dG9tYXRpYyBrZXltYXAgdHJhbnNpdGlvbnNcbiAgICB2YXIgc3RhcnRNYXAgPSBnZXRLZXlNYXAoY20ub3B0aW9ucy5rZXlNYXApLCBuZXh0ID0gc3RhcnRNYXAuYXV0bztcbiAgICBjbGVhclRpbWVvdXQobWF5YmVUcmFuc2l0aW9uKTtcbiAgICBpZiAobmV4dCAmJiAhaXNNb2RpZmllcktleShlKSkgbWF5YmVUcmFuc2l0aW9uID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIGlmIChnZXRLZXlNYXAoY20ub3B0aW9ucy5rZXlNYXApID09IHN0YXJ0TWFwKSB7XG4gICAgICAgIGNtLm9wdGlvbnMua2V5TWFwID0gKG5leHQuY2FsbCA/IG5leHQuY2FsbChudWxsLCBjbSkgOiBuZXh0KTtcbiAgICAgICAga2V5TWFwQ2hhbmdlZChjbSk7XG4gICAgICB9XG4gICAgfSwgNTApO1xuXG4gICAgdmFyIG5hbWUgPSBrZXlOYW1lKGUsIHRydWUpLCBoYW5kbGVkID0gZmFsc2U7XG4gICAgaWYgKCFuYW1lKSByZXR1cm4gZmFsc2U7XG4gICAgdmFyIGtleW1hcHMgPSBhbGxLZXlNYXBzKGNtKTtcblxuICAgIGlmIChlLnNoaWZ0S2V5KSB7XG4gICAgICAvLyBGaXJzdCB0cnkgdG8gcmVzb2x2ZSBmdWxsIG5hbWUgKGluY2x1ZGluZyAnU2hpZnQtJykuIEZhaWxpbmdcbiAgICAgIC8vIHRoYXQsIHNlZSBpZiB0aGVyZSBpcyBhIGN1cnNvci1tb3Rpb24gY29tbWFuZCAoc3RhcnRpbmcgd2l0aFxuICAgICAgLy8gJ2dvJykgYm91bmQgdG8gdGhlIGtleW5hbWUgd2l0aG91dCAnU2hpZnQtJy5cbiAgICAgIGhhbmRsZWQgPSBsb29rdXBLZXkoXCJTaGlmdC1cIiArIG5hbWUsIGtleW1hcHMsIGZ1bmN0aW9uKGIpIHtyZXR1cm4gZG9IYW5kbGVCaW5kaW5nKGNtLCBiLCB0cnVlKTt9KVxuICAgICAgICAgICAgIHx8IGxvb2t1cEtleShuYW1lLCBrZXltYXBzLCBmdW5jdGlvbihiKSB7XG4gICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGIgPT0gXCJzdHJpbmdcIiA/IC9eZ29bQS1aXS8udGVzdChiKSA6IGIubW90aW9uKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZG9IYW5kbGVCaW5kaW5nKGNtLCBiKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaGFuZGxlZCA9IGxvb2t1cEtleShuYW1lLCBrZXltYXBzLCBmdW5jdGlvbihiKSB7IHJldHVybiBkb0hhbmRsZUJpbmRpbmcoY20sIGIpOyB9KTtcbiAgICB9XG5cbiAgICBpZiAoaGFuZGxlZCkge1xuICAgICAgZV9wcmV2ZW50RGVmYXVsdChlKTtcbiAgICAgIHJlc3RhcnRCbGluayhjbSk7XG4gICAgICBzaWduYWxMYXRlcihjbSwgXCJrZXlIYW5kbGVkXCIsIGNtLCBuYW1lLCBlKTtcbiAgICB9XG4gICAgcmV0dXJuIGhhbmRsZWQ7XG4gIH1cblxuICAvLyBIYW5kbGUgYSBrZXkgZnJvbSB0aGUga2V5cHJlc3MgZXZlbnRcbiAgZnVuY3Rpb24gaGFuZGxlQ2hhckJpbmRpbmcoY20sIGUsIGNoKSB7XG4gICAgdmFyIGhhbmRsZWQgPSBsb29rdXBLZXkoXCInXCIgKyBjaCArIFwiJ1wiLCBhbGxLZXlNYXBzKGNtKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihiKSB7IHJldHVybiBkb0hhbmRsZUJpbmRpbmcoY20sIGIsIHRydWUpOyB9KTtcbiAgICBpZiAoaGFuZGxlZCkge1xuICAgICAgZV9wcmV2ZW50RGVmYXVsdChlKTtcbiAgICAgIHJlc3RhcnRCbGluayhjbSk7XG4gICAgICBzaWduYWxMYXRlcihjbSwgXCJrZXlIYW5kbGVkXCIsIGNtLCBcIidcIiArIGNoICsgXCInXCIsIGUpO1xuICAgIH1cbiAgICByZXR1cm4gaGFuZGxlZDtcbiAgfVxuXG4gIHZhciBsYXN0U3RvcHBlZEtleSA9IG51bGw7XG4gIGZ1bmN0aW9uIG9uS2V5RG93bihlKSB7XG4gICAgdmFyIGNtID0gdGhpcztcbiAgICBlbnN1cmVGb2N1cyhjbSk7XG4gICAgaWYgKHNpZ25hbERPTUV2ZW50KGNtLCBlKSkgcmV0dXJuO1xuICAgIC8vIElFIGRvZXMgc3RyYW5nZSB0aGluZ3Mgd2l0aCBlc2NhcGUuXG4gICAgaWYgKGllX3VwdG8xMCAmJiBlLmtleUNvZGUgPT0gMjcpIGUucmV0dXJuVmFsdWUgPSBmYWxzZTtcbiAgICB2YXIgY29kZSA9IGUua2V5Q29kZTtcbiAgICBjbS5kaXNwbGF5LnNoaWZ0ID0gY29kZSA9PSAxNiB8fCBlLnNoaWZ0S2V5O1xuICAgIHZhciBoYW5kbGVkID0gaGFuZGxlS2V5QmluZGluZyhjbSwgZSk7XG4gICAgaWYgKHByZXN0bykge1xuICAgICAgbGFzdFN0b3BwZWRLZXkgPSBoYW5kbGVkID8gY29kZSA6IG51bGw7XG4gICAgICAvLyBPcGVyYSBoYXMgbm8gY3V0IGV2ZW50Li4uIHdlIHRyeSB0byBhdCBsZWFzdCBjYXRjaCB0aGUga2V5IGNvbWJvXG4gICAgICBpZiAoIWhhbmRsZWQgJiYgY29kZSA9PSA4OCAmJiAhaGFzQ29weUV2ZW50ICYmIChtYWMgPyBlLm1ldGFLZXkgOiBlLmN0cmxLZXkpKVxuICAgICAgICBjbS5yZXBsYWNlU2VsZWN0aW9uKFwiXCIsIG51bGwsIFwiY3V0XCIpO1xuICAgIH1cblxuICAgIC8vIFR1cm4gbW91c2UgaW50byBjcm9zc2hhaXIgd2hlbiBBbHQgaXMgaGVsZCBvbiBNYWMuXG4gICAgaWYgKGNvZGUgPT0gMTggJiYgIS9cXGJDb2RlTWlycm9yLWNyb3NzaGFpclxcYi8udGVzdChjbS5kaXNwbGF5LmxpbmVEaXYuY2xhc3NOYW1lKSlcbiAgICAgIHNob3dDcm9zc0hhaXIoY20pO1xuICB9XG5cbiAgZnVuY3Rpb24gc2hvd0Nyb3NzSGFpcihjbSkge1xuICAgIHZhciBsaW5lRGl2ID0gY20uZGlzcGxheS5saW5lRGl2O1xuICAgIGFkZENsYXNzKGxpbmVEaXYsIFwiQ29kZU1pcnJvci1jcm9zc2hhaXJcIik7XG5cbiAgICBmdW5jdGlvbiB1cChlKSB7XG4gICAgICBpZiAoZS5rZXlDb2RlID09IDE4IHx8ICFlLmFsdEtleSkge1xuICAgICAgICBybUNsYXNzKGxpbmVEaXYsIFwiQ29kZU1pcnJvci1jcm9zc2hhaXJcIik7XG4gICAgICAgIG9mZihkb2N1bWVudCwgXCJrZXl1cFwiLCB1cCk7XG4gICAgICAgIG9mZihkb2N1bWVudCwgXCJtb3VzZW92ZXJcIiwgdXApO1xuICAgICAgfVxuICAgIH1cbiAgICBvbihkb2N1bWVudCwgXCJrZXl1cFwiLCB1cCk7XG4gICAgb24oZG9jdW1lbnQsIFwibW91c2VvdmVyXCIsIHVwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uS2V5VXAoZSkge1xuICAgIGlmIChzaWduYWxET01FdmVudCh0aGlzLCBlKSkgcmV0dXJuO1xuICAgIGlmIChlLmtleUNvZGUgPT0gMTYpIHRoaXMuZG9jLnNlbC5zaGlmdCA9IGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gb25LZXlQcmVzcyhlKSB7XG4gICAgdmFyIGNtID0gdGhpcztcbiAgICBpZiAoc2lnbmFsRE9NRXZlbnQoY20sIGUpKSByZXR1cm47XG4gICAgdmFyIGtleUNvZGUgPSBlLmtleUNvZGUsIGNoYXJDb2RlID0gZS5jaGFyQ29kZTtcbiAgICBpZiAocHJlc3RvICYmIGtleUNvZGUgPT0gbGFzdFN0b3BwZWRLZXkpIHtsYXN0U3RvcHBlZEtleSA9IG51bGw7IGVfcHJldmVudERlZmF1bHQoZSk7IHJldHVybjt9XG4gICAgaWYgKCgocHJlc3RvICYmICghZS53aGljaCB8fCBlLndoaWNoIDwgMTApKSB8fCBraHRtbCkgJiYgaGFuZGxlS2V5QmluZGluZyhjbSwgZSkpIHJldHVybjtcbiAgICB2YXIgY2ggPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGNoYXJDb2RlID09IG51bGwgPyBrZXlDb2RlIDogY2hhckNvZGUpO1xuICAgIGlmIChoYW5kbGVDaGFyQmluZGluZyhjbSwgZSwgY2gpKSByZXR1cm47XG4gICAgaWYgKGllICYmICFpZV91cHRvOCkgY20uZGlzcGxheS5pbnB1dEhhc1NlbGVjdGlvbiA9IG51bGw7XG4gICAgZmFzdFBvbGwoY20pO1xuICB9XG5cbiAgLy8gRk9DVVMvQkxVUiBFVkVOVFNcblxuICBmdW5jdGlvbiBvbkZvY3VzKGNtKSB7XG4gICAgaWYgKGNtLm9wdGlvbnMucmVhZE9ubHkgPT0gXCJub2N1cnNvclwiKSByZXR1cm47XG4gICAgaWYgKCFjbS5zdGF0ZS5mb2N1c2VkKSB7XG4gICAgICBzaWduYWwoY20sIFwiZm9jdXNcIiwgY20pO1xuICAgICAgY20uc3RhdGUuZm9jdXNlZCA9IHRydWU7XG4gICAgICBhZGRDbGFzcyhjbS5kaXNwbGF5LndyYXBwZXIsIFwiQ29kZU1pcnJvci1mb2N1c2VkXCIpO1xuICAgICAgLy8gVGhlIHByZXZJbnB1dCB0ZXN0IHByZXZlbnRzIHRoaXMgZnJvbSBmaXJpbmcgd2hlbiBhIGNvbnRleHRcbiAgICAgIC8vIG1lbnUgaXMgY2xvc2VkIChzaW5jZSB0aGUgcmVzZXRJbnB1dCB3b3VsZCBraWxsIHRoZVxuICAgICAgLy8gc2VsZWN0LWFsbCBkZXRlY3Rpb24gaGFjaylcbiAgICAgIGlmICghY20uY3VyT3AgJiYgY20uZGlzcGxheS5zZWxGb3JDb250ZXh0TWVudSAhPSBjbS5kb2Muc2VsKSB7XG4gICAgICAgIHJlc2V0SW5wdXQoY20pO1xuICAgICAgICBpZiAod2Via2l0KSBzZXRUaW1lb3V0KGJpbmQocmVzZXRJbnB1dCwgY20sIHRydWUpLCAwKTsgLy8gSXNzdWUgIzE3MzBcbiAgICAgIH1cbiAgICB9XG4gICAgc2xvd1BvbGwoY20pO1xuICAgIHJlc3RhcnRCbGluayhjbSk7XG4gIH1cbiAgZnVuY3Rpb24gb25CbHVyKGNtKSB7XG4gICAgaWYgKGNtLnN0YXRlLmZvY3VzZWQpIHtcbiAgICAgIHNpZ25hbChjbSwgXCJibHVyXCIsIGNtKTtcbiAgICAgIGNtLnN0YXRlLmZvY3VzZWQgPSBmYWxzZTtcbiAgICAgIHJtQ2xhc3MoY20uZGlzcGxheS53cmFwcGVyLCBcIkNvZGVNaXJyb3ItZm9jdXNlZFwiKTtcbiAgICB9XG4gICAgY2xlYXJJbnRlcnZhbChjbS5kaXNwbGF5LmJsaW5rZXIpO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7aWYgKCFjbS5zdGF0ZS5mb2N1c2VkKSBjbS5kaXNwbGF5LnNoaWZ0ID0gZmFsc2U7fSwgMTUwKTtcbiAgfVxuXG4gIC8vIENPTlRFWFQgTUVOVSBIQU5ETElOR1xuXG4gIC8vIFRvIG1ha2UgdGhlIGNvbnRleHQgbWVudSB3b3JrLCB3ZSBuZWVkIHRvIGJyaWVmbHkgdW5oaWRlIHRoZVxuICAvLyB0ZXh0YXJlYSAobWFraW5nIGl0IGFzIHVub2J0cnVzaXZlIGFzIHBvc3NpYmxlKSB0byBsZXQgdGhlXG4gIC8vIHJpZ2h0LWNsaWNrIHRha2UgZWZmZWN0IG9uIGl0LlxuICBmdW5jdGlvbiBvbkNvbnRleHRNZW51KGNtLCBlKSB7XG4gICAgaWYgKHNpZ25hbERPTUV2ZW50KGNtLCBlLCBcImNvbnRleHRtZW51XCIpKSByZXR1cm47XG4gICAgdmFyIGRpc3BsYXkgPSBjbS5kaXNwbGF5O1xuICAgIGlmIChldmVudEluV2lkZ2V0KGRpc3BsYXksIGUpIHx8IGNvbnRleHRNZW51SW5HdXR0ZXIoY20sIGUpKSByZXR1cm47XG5cbiAgICB2YXIgcG9zID0gcG9zRnJvbU1vdXNlKGNtLCBlKSwgc2Nyb2xsUG9zID0gZGlzcGxheS5zY3JvbGxlci5zY3JvbGxUb3A7XG4gICAgaWYgKCFwb3MgfHwgcHJlc3RvKSByZXR1cm47IC8vIE9wZXJhIGlzIGRpZmZpY3VsdC5cblxuICAgIC8vIFJlc2V0IHRoZSBjdXJyZW50IHRleHQgc2VsZWN0aW9uIG9ubHkgaWYgdGhlIGNsaWNrIGlzIGRvbmUgb3V0c2lkZSBvZiB0aGUgc2VsZWN0aW9uXG4gICAgLy8gYW5kICdyZXNldFNlbGVjdGlvbk9uQ29udGV4dE1lbnUnIG9wdGlvbiBpcyB0cnVlLlxuICAgIHZhciByZXNldCA9IGNtLm9wdGlvbnMucmVzZXRTZWxlY3Rpb25PbkNvbnRleHRNZW51O1xuICAgIGlmIChyZXNldCAmJiBjbS5kb2Muc2VsLmNvbnRhaW5zKHBvcykgPT0gLTEpXG4gICAgICBvcGVyYXRpb24oY20sIHNldFNlbGVjdGlvbikoY20uZG9jLCBzaW1wbGVTZWxlY3Rpb24ocG9zKSwgc2VsX2RvbnRTY3JvbGwpO1xuXG4gICAgdmFyIG9sZENTUyA9IGRpc3BsYXkuaW5wdXQuc3R5bGUuY3NzVGV4dDtcbiAgICBkaXNwbGF5LmlucHV0RGl2LnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuICAgIGRpc3BsYXkuaW5wdXQuc3R5bGUuY3NzVGV4dCA9IFwicG9zaXRpb246IGZpeGVkOyB3aWR0aDogMzBweDsgaGVpZ2h0OiAzMHB4OyB0b3A6IFwiICsgKGUuY2xpZW50WSAtIDUpICtcbiAgICAgIFwicHg7IGxlZnQ6IFwiICsgKGUuY2xpZW50WCAtIDUpICsgXCJweDsgei1pbmRleDogMTAwMDsgYmFja2dyb3VuZDogXCIgK1xuICAgICAgKGllID8gXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIC4wNSlcIiA6IFwidHJhbnNwYXJlbnRcIikgK1xuICAgICAgXCI7IG91dGxpbmU6IG5vbmU7IGJvcmRlci13aWR0aDogMDsgb3V0bGluZTogbm9uZTsgb3ZlcmZsb3c6IGhpZGRlbjsgb3BhY2l0eTogLjA1OyBmaWx0ZXI6IGFscGhhKG9wYWNpdHk9NSk7XCI7XG4gICAgZm9jdXNJbnB1dChjbSk7XG4gICAgcmVzZXRJbnB1dChjbSk7XG4gICAgLy8gQWRkcyBcIlNlbGVjdCBhbGxcIiB0byBjb250ZXh0IG1lbnUgaW4gRkZcbiAgICBpZiAoIWNtLnNvbWV0aGluZ1NlbGVjdGVkKCkpIGRpc3BsYXkuaW5wdXQudmFsdWUgPSBkaXNwbGF5LnByZXZJbnB1dCA9IFwiIFwiO1xuICAgIGRpc3BsYXkuc2VsRm9yQ29udGV4dE1lbnUgPSBjbS5kb2Muc2VsO1xuICAgIGNsZWFyVGltZW91dChkaXNwbGF5LmRldGVjdGluZ1NlbGVjdEFsbCk7XG5cbiAgICAvLyBTZWxlY3QtYWxsIHdpbGwgYmUgZ3JleWVkIG91dCBpZiB0aGVyZSdzIG5vdGhpbmcgdG8gc2VsZWN0LCBzb1xuICAgIC8vIHRoaXMgYWRkcyBhIHplcm8td2lkdGggc3BhY2Ugc28gdGhhdCB3ZSBjYW4gbGF0ZXIgY2hlY2sgd2hldGhlclxuICAgIC8vIGl0IGdvdCBzZWxlY3RlZC5cbiAgICBmdW5jdGlvbiBwcmVwYXJlU2VsZWN0QWxsSGFjaygpIHtcbiAgICAgIGlmIChkaXNwbGF5LmlucHV0LnNlbGVjdGlvblN0YXJ0ICE9IG51bGwpIHtcbiAgICAgICAgdmFyIHNlbGVjdGVkID0gY20uc29tZXRoaW5nU2VsZWN0ZWQoKTtcbiAgICAgICAgdmFyIGV4dHZhbCA9IGRpc3BsYXkuaW5wdXQudmFsdWUgPSBcIlxcdTIwMGJcIiArIChzZWxlY3RlZCA/IGRpc3BsYXkuaW5wdXQudmFsdWUgOiBcIlwiKTtcbiAgICAgICAgZGlzcGxheS5wcmV2SW5wdXQgPSBzZWxlY3RlZCA/IFwiXCIgOiBcIlxcdTIwMGJcIjtcbiAgICAgICAgZGlzcGxheS5pbnB1dC5zZWxlY3Rpb25TdGFydCA9IDE7IGRpc3BsYXkuaW5wdXQuc2VsZWN0aW9uRW5kID0gZXh0dmFsLmxlbmd0aDtcbiAgICAgICAgLy8gUmUtc2V0IHRoaXMsIGluIGNhc2Ugc29tZSBvdGhlciBoYW5kbGVyIHRvdWNoZWQgdGhlXG4gICAgICAgIC8vIHNlbGVjdGlvbiBpbiB0aGUgbWVhbnRpbWUuXG4gICAgICAgIGRpc3BsYXkuc2VsRm9yQ29udGV4dE1lbnUgPSBjbS5kb2Muc2VsO1xuICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiByZWhpZGUoKSB7XG4gICAgICBkaXNwbGF5LmlucHV0RGl2LnN0eWxlLnBvc2l0aW9uID0gXCJyZWxhdGl2ZVwiO1xuICAgICAgZGlzcGxheS5pbnB1dC5zdHlsZS5jc3NUZXh0ID0gb2xkQ1NTO1xuICAgICAgaWYgKGllX3VwdG84KSBkaXNwbGF5LnNjcm9sbGJhclYuc2Nyb2xsVG9wID0gZGlzcGxheS5zY3JvbGxlci5zY3JvbGxUb3AgPSBzY3JvbGxQb3M7XG4gICAgICBzbG93UG9sbChjbSk7XG5cbiAgICAgIC8vIFRyeSB0byBkZXRlY3QgdGhlIHVzZXIgY2hvb3Npbmcgc2VsZWN0LWFsbFxuICAgICAgaWYgKGRpc3BsYXkuaW5wdXQuc2VsZWN0aW9uU3RhcnQgIT0gbnVsbCkge1xuICAgICAgICBpZiAoIWllIHx8IGllX3VwdG84KSBwcmVwYXJlU2VsZWN0QWxsSGFjaygpO1xuICAgICAgICB2YXIgaSA9IDAsIHBvbGwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoZGlzcGxheS5zZWxGb3JDb250ZXh0TWVudSA9PSBjbS5kb2Muc2VsICYmIGRpc3BsYXkuaW5wdXQuc2VsZWN0aW9uU3RhcnQgPT0gMClcbiAgICAgICAgICAgIG9wZXJhdGlvbihjbSwgY29tbWFuZHMuc2VsZWN0QWxsKShjbSk7XG4gICAgICAgICAgZWxzZSBpZiAoaSsrIDwgMTApIGRpc3BsYXkuZGV0ZWN0aW5nU2VsZWN0QWxsID0gc2V0VGltZW91dChwb2xsLCA1MDApO1xuICAgICAgICAgIGVsc2UgcmVzZXRJbnB1dChjbSk7XG4gICAgICAgIH07XG4gICAgICAgIGRpc3BsYXkuZGV0ZWN0aW5nU2VsZWN0QWxsID0gc2V0VGltZW91dChwb2xsLCAyMDApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChpZSAmJiAhaWVfdXB0bzgpIHByZXBhcmVTZWxlY3RBbGxIYWNrKCk7XG4gICAgaWYgKGNhcHR1cmVSaWdodENsaWNrKSB7XG4gICAgICBlX3N0b3AoZSk7XG4gICAgICB2YXIgbW91c2V1cCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBvZmYod2luZG93LCBcIm1vdXNldXBcIiwgbW91c2V1cCk7XG4gICAgICAgIHNldFRpbWVvdXQocmVoaWRlLCAyMCk7XG4gICAgICB9O1xuICAgICAgb24od2luZG93LCBcIm1vdXNldXBcIiwgbW91c2V1cCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNldFRpbWVvdXQocmVoaWRlLCA1MCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY29udGV4dE1lbnVJbkd1dHRlcihjbSwgZSkge1xuICAgIGlmICghaGFzSGFuZGxlcihjbSwgXCJndXR0ZXJDb250ZXh0TWVudVwiKSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiBndXR0ZXJFdmVudChjbSwgZSwgXCJndXR0ZXJDb250ZXh0TWVudVwiLCBmYWxzZSwgc2lnbmFsKTtcbiAgfVxuXG4gIC8vIFVQREFUSU5HXG5cbiAgLy8gQ29tcHV0ZSB0aGUgcG9zaXRpb24gb2YgdGhlIGVuZCBvZiBhIGNoYW5nZSAoaXRzICd0bycgcHJvcGVydHlcbiAgLy8gcmVmZXJzIHRvIHRoZSBwcmUtY2hhbmdlIGVuZCkuXG4gIHZhciBjaGFuZ2VFbmQgPSBDb2RlTWlycm9yLmNoYW5nZUVuZCA9IGZ1bmN0aW9uKGNoYW5nZSkge1xuICAgIGlmICghY2hhbmdlLnRleHQpIHJldHVybiBjaGFuZ2UudG87XG4gICAgcmV0dXJuIFBvcyhjaGFuZ2UuZnJvbS5saW5lICsgY2hhbmdlLnRleHQubGVuZ3RoIC0gMSxcbiAgICAgICAgICAgICAgIGxzdChjaGFuZ2UudGV4dCkubGVuZ3RoICsgKGNoYW5nZS50ZXh0Lmxlbmd0aCA9PSAxID8gY2hhbmdlLmZyb20uY2ggOiAwKSk7XG4gIH07XG5cbiAgLy8gQWRqdXN0IGEgcG9zaXRpb24gdG8gcmVmZXIgdG8gdGhlIHBvc3QtY2hhbmdlIHBvc2l0aW9uIG9mIHRoZVxuICAvLyBzYW1lIHRleHQsIG9yIHRoZSBlbmQgb2YgdGhlIGNoYW5nZSBpZiB0aGUgY2hhbmdlIGNvdmVycyBpdC5cbiAgZnVuY3Rpb24gYWRqdXN0Rm9yQ2hhbmdlKHBvcywgY2hhbmdlKSB7XG4gICAgaWYgKGNtcChwb3MsIGNoYW5nZS5mcm9tKSA8IDApIHJldHVybiBwb3M7XG4gICAgaWYgKGNtcChwb3MsIGNoYW5nZS50bykgPD0gMCkgcmV0dXJuIGNoYW5nZUVuZChjaGFuZ2UpO1xuXG4gICAgdmFyIGxpbmUgPSBwb3MubGluZSArIGNoYW5nZS50ZXh0Lmxlbmd0aCAtIChjaGFuZ2UudG8ubGluZSAtIGNoYW5nZS5mcm9tLmxpbmUpIC0gMSwgY2ggPSBwb3MuY2g7XG4gICAgaWYgKHBvcy5saW5lID09IGNoYW5nZS50by5saW5lKSBjaCArPSBjaGFuZ2VFbmQoY2hhbmdlKS5jaCAtIGNoYW5nZS50by5jaDtcbiAgICByZXR1cm4gUG9zKGxpbmUsIGNoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbXB1dGVTZWxBZnRlckNoYW5nZShkb2MsIGNoYW5nZSkge1xuICAgIHZhciBvdXQgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRvYy5zZWwucmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcmFuZ2UgPSBkb2Muc2VsLnJhbmdlc1tpXTtcbiAgICAgIG91dC5wdXNoKG5ldyBSYW5nZShhZGp1c3RGb3JDaGFuZ2UocmFuZ2UuYW5jaG9yLCBjaGFuZ2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgIGFkanVzdEZvckNoYW5nZShyYW5nZS5oZWFkLCBjaGFuZ2UpKSk7XG4gICAgfVxuICAgIHJldHVybiBub3JtYWxpemVTZWxlY3Rpb24ob3V0LCBkb2Muc2VsLnByaW1JbmRleCk7XG4gIH1cblxuICBmdW5jdGlvbiBvZmZzZXRQb3MocG9zLCBvbGQsIG53KSB7XG4gICAgaWYgKHBvcy5saW5lID09IG9sZC5saW5lKVxuICAgICAgcmV0dXJuIFBvcyhudy5saW5lLCBwb3MuY2ggLSBvbGQuY2ggKyBudy5jaCk7XG4gICAgZWxzZVxuICAgICAgcmV0dXJuIFBvcyhudy5saW5lICsgKHBvcy5saW5lIC0gb2xkLmxpbmUpLCBwb3MuY2gpO1xuICB9XG5cbiAgLy8gVXNlZCBieSByZXBsYWNlU2VsZWN0aW9ucyB0byBhbGxvdyBtb3ZpbmcgdGhlIHNlbGVjdGlvbiB0byB0aGVcbiAgLy8gc3RhcnQgb3IgYXJvdW5kIHRoZSByZXBsYWNlZCB0ZXN0LiBIaW50IG1heSBiZSBcInN0YXJ0XCIgb3IgXCJhcm91bmRcIi5cbiAgZnVuY3Rpb24gY29tcHV0ZVJlcGxhY2VkU2VsKGRvYywgY2hhbmdlcywgaGludCkge1xuICAgIHZhciBvdXQgPSBbXTtcbiAgICB2YXIgb2xkUHJldiA9IFBvcyhkb2MuZmlyc3QsIDApLCBuZXdQcmV2ID0gb2xkUHJldjtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBjaGFuZ2UgPSBjaGFuZ2VzW2ldO1xuICAgICAgdmFyIGZyb20gPSBvZmZzZXRQb3MoY2hhbmdlLmZyb20sIG9sZFByZXYsIG5ld1ByZXYpO1xuICAgICAgdmFyIHRvID0gb2Zmc2V0UG9zKGNoYW5nZUVuZChjaGFuZ2UpLCBvbGRQcmV2LCBuZXdQcmV2KTtcbiAgICAgIG9sZFByZXYgPSBjaGFuZ2UudG87XG4gICAgICBuZXdQcmV2ID0gdG87XG4gICAgICBpZiAoaGludCA9PSBcImFyb3VuZFwiKSB7XG4gICAgICAgIHZhciByYW5nZSA9IGRvYy5zZWwucmFuZ2VzW2ldLCBpbnYgPSBjbXAocmFuZ2UuaGVhZCwgcmFuZ2UuYW5jaG9yKSA8IDA7XG4gICAgICAgIG91dFtpXSA9IG5ldyBSYW5nZShpbnYgPyB0byA6IGZyb20sIGludiA/IGZyb20gOiB0byk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdXRbaV0gPSBuZXcgUmFuZ2UoZnJvbSwgZnJvbSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgU2VsZWN0aW9uKG91dCwgZG9jLnNlbC5wcmltSW5kZXgpO1xuICB9XG5cbiAgLy8gQWxsb3cgXCJiZWZvcmVDaGFuZ2VcIiBldmVudCBoYW5kbGVycyB0byBpbmZsdWVuY2UgYSBjaGFuZ2VcbiAgZnVuY3Rpb24gZmlsdGVyQ2hhbmdlKGRvYywgY2hhbmdlLCB1cGRhdGUpIHtcbiAgICB2YXIgb2JqID0ge1xuICAgICAgY2FuY2VsZWQ6IGZhbHNlLFxuICAgICAgZnJvbTogY2hhbmdlLmZyb20sXG4gICAgICB0bzogY2hhbmdlLnRvLFxuICAgICAgdGV4dDogY2hhbmdlLnRleHQsXG4gICAgICBvcmlnaW46IGNoYW5nZS5vcmlnaW4sXG4gICAgICBjYW5jZWw6IGZ1bmN0aW9uKCkgeyB0aGlzLmNhbmNlbGVkID0gdHJ1ZTsgfVxuICAgIH07XG4gICAgaWYgKHVwZGF0ZSkgb2JqLnVwZGF0ZSA9IGZ1bmN0aW9uKGZyb20sIHRvLCB0ZXh0LCBvcmlnaW4pIHtcbiAgICAgIGlmIChmcm9tKSB0aGlzLmZyb20gPSBjbGlwUG9zKGRvYywgZnJvbSk7XG4gICAgICBpZiAodG8pIHRoaXMudG8gPSBjbGlwUG9zKGRvYywgdG8pO1xuICAgICAgaWYgKHRleHQpIHRoaXMudGV4dCA9IHRleHQ7XG4gICAgICBpZiAob3JpZ2luICE9PSB1bmRlZmluZWQpIHRoaXMub3JpZ2luID0gb3JpZ2luO1xuICAgIH07XG4gICAgc2lnbmFsKGRvYywgXCJiZWZvcmVDaGFuZ2VcIiwgZG9jLCBvYmopO1xuICAgIGlmIChkb2MuY20pIHNpZ25hbChkb2MuY20sIFwiYmVmb3JlQ2hhbmdlXCIsIGRvYy5jbSwgb2JqKTtcblxuICAgIGlmIChvYmouY2FuY2VsZWQpIHJldHVybiBudWxsO1xuICAgIHJldHVybiB7ZnJvbTogb2JqLmZyb20sIHRvOiBvYmoudG8sIHRleHQ6IG9iai50ZXh0LCBvcmlnaW46IG9iai5vcmlnaW59O1xuICB9XG5cbiAgLy8gQXBwbHkgYSBjaGFuZ2UgdG8gYSBkb2N1bWVudCwgYW5kIGFkZCBpdCB0byB0aGUgZG9jdW1lbnQnc1xuICAvLyBoaXN0b3J5LCBhbmQgcHJvcGFnYXRpbmcgaXQgdG8gYWxsIGxpbmtlZCBkb2N1bWVudHMuXG4gIGZ1bmN0aW9uIG1ha2VDaGFuZ2UoZG9jLCBjaGFuZ2UsIGlnbm9yZVJlYWRPbmx5KSB7XG4gICAgaWYgKGRvYy5jbSkge1xuICAgICAgaWYgKCFkb2MuY20uY3VyT3ApIHJldHVybiBvcGVyYXRpb24oZG9jLmNtLCBtYWtlQ2hhbmdlKShkb2MsIGNoYW5nZSwgaWdub3JlUmVhZE9ubHkpO1xuICAgICAgaWYgKGRvYy5jbS5zdGF0ZS5zdXBwcmVzc0VkaXRzKSByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGhhc0hhbmRsZXIoZG9jLCBcImJlZm9yZUNoYW5nZVwiKSB8fCBkb2MuY20gJiYgaGFzSGFuZGxlcihkb2MuY20sIFwiYmVmb3JlQ2hhbmdlXCIpKSB7XG4gICAgICBjaGFuZ2UgPSBmaWx0ZXJDaGFuZ2UoZG9jLCBjaGFuZ2UsIHRydWUpO1xuICAgICAgaWYgKCFjaGFuZ2UpIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBQb3NzaWJseSBzcGxpdCBvciBzdXBwcmVzcyB0aGUgdXBkYXRlIGJhc2VkIG9uIHRoZSBwcmVzZW5jZVxuICAgIC8vIG9mIHJlYWQtb25seSBzcGFucyBpbiBpdHMgcmFuZ2UuXG4gICAgdmFyIHNwbGl0ID0gc2F3UmVhZE9ubHlTcGFucyAmJiAhaWdub3JlUmVhZE9ubHkgJiYgcmVtb3ZlUmVhZE9ubHlSYW5nZXMoZG9jLCBjaGFuZ2UuZnJvbSwgY2hhbmdlLnRvKTtcbiAgICBpZiAoc3BsaXQpIHtcbiAgICAgIGZvciAodmFyIGkgPSBzcGxpdC5sZW5ndGggLSAxOyBpID49IDA7IC0taSlcbiAgICAgICAgbWFrZUNoYW5nZUlubmVyKGRvYywge2Zyb206IHNwbGl0W2ldLmZyb20sIHRvOiBzcGxpdFtpXS50bywgdGV4dDogaSA/IFtcIlwiXSA6IGNoYW5nZS50ZXh0fSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1ha2VDaGFuZ2VJbm5lcihkb2MsIGNoYW5nZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbWFrZUNoYW5nZUlubmVyKGRvYywgY2hhbmdlKSB7XG4gICAgaWYgKGNoYW5nZS50ZXh0Lmxlbmd0aCA9PSAxICYmIGNoYW5nZS50ZXh0WzBdID09IFwiXCIgJiYgY21wKGNoYW5nZS5mcm9tLCBjaGFuZ2UudG8pID09IDApIHJldHVybjtcbiAgICB2YXIgc2VsQWZ0ZXIgPSBjb21wdXRlU2VsQWZ0ZXJDaGFuZ2UoZG9jLCBjaGFuZ2UpO1xuICAgIGFkZENoYW5nZVRvSGlzdG9yeShkb2MsIGNoYW5nZSwgc2VsQWZ0ZXIsIGRvYy5jbSA/IGRvYy5jbS5jdXJPcC5pZCA6IE5hTik7XG5cbiAgICBtYWtlQ2hhbmdlU2luZ2xlRG9jKGRvYywgY2hhbmdlLCBzZWxBZnRlciwgc3RyZXRjaFNwYW5zT3ZlckNoYW5nZShkb2MsIGNoYW5nZSkpO1xuICAgIHZhciByZWJhc2VkID0gW107XG5cbiAgICBsaW5rZWREb2NzKGRvYywgZnVuY3Rpb24oZG9jLCBzaGFyZWRIaXN0KSB7XG4gICAgICBpZiAoIXNoYXJlZEhpc3QgJiYgaW5kZXhPZihyZWJhc2VkLCBkb2MuaGlzdG9yeSkgPT0gLTEpIHtcbiAgICAgICAgcmViYXNlSGlzdChkb2MuaGlzdG9yeSwgY2hhbmdlKTtcbiAgICAgICAgcmViYXNlZC5wdXNoKGRvYy5oaXN0b3J5KTtcbiAgICAgIH1cbiAgICAgIG1ha2VDaGFuZ2VTaW5nbGVEb2MoZG9jLCBjaGFuZ2UsIG51bGwsIHN0cmV0Y2hTcGFuc092ZXJDaGFuZ2UoZG9jLCBjaGFuZ2UpKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFJldmVydCBhIGNoYW5nZSBzdG9yZWQgaW4gYSBkb2N1bWVudCdzIGhpc3RvcnkuXG4gIGZ1bmN0aW9uIG1ha2VDaGFuZ2VGcm9tSGlzdG9yeShkb2MsIHR5cGUsIGFsbG93U2VsZWN0aW9uT25seSkge1xuICAgIGlmIChkb2MuY20gJiYgZG9jLmNtLnN0YXRlLnN1cHByZXNzRWRpdHMpIHJldHVybjtcblxuICAgIHZhciBoaXN0ID0gZG9jLmhpc3RvcnksIGV2ZW50LCBzZWxBZnRlciA9IGRvYy5zZWw7XG4gICAgdmFyIHNvdXJjZSA9IHR5cGUgPT0gXCJ1bmRvXCIgPyBoaXN0LmRvbmUgOiBoaXN0LnVuZG9uZSwgZGVzdCA9IHR5cGUgPT0gXCJ1bmRvXCIgPyBoaXN0LnVuZG9uZSA6IGhpc3QuZG9uZTtcblxuICAgIC8vIFZlcmlmeSB0aGF0IHRoZXJlIGlzIGEgdXNlYWJsZSBldmVudCAoc28gdGhhdCBjdHJsLXogd29uJ3RcbiAgICAvLyBuZWVkbGVzc2x5IGNsZWFyIHNlbGVjdGlvbiBldmVudHMpXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzb3VyY2UubGVuZ3RoOyBpKyspIHtcbiAgICAgIGV2ZW50ID0gc291cmNlW2ldO1xuICAgICAgaWYgKGFsbG93U2VsZWN0aW9uT25seSA/IGV2ZW50LnJhbmdlcyAmJiAhZXZlbnQuZXF1YWxzKGRvYy5zZWwpIDogIWV2ZW50LnJhbmdlcylcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGlmIChpID09IHNvdXJjZS5sZW5ndGgpIHJldHVybjtcbiAgICBoaXN0Lmxhc3RPcmlnaW4gPSBoaXN0Lmxhc3RTZWxPcmlnaW4gPSBudWxsO1xuXG4gICAgZm9yICg7Oykge1xuICAgICAgZXZlbnQgPSBzb3VyY2UucG9wKCk7XG4gICAgICBpZiAoZXZlbnQucmFuZ2VzKSB7XG4gICAgICAgIHB1c2hTZWxlY3Rpb25Ub0hpc3RvcnkoZXZlbnQsIGRlc3QpO1xuICAgICAgICBpZiAoYWxsb3dTZWxlY3Rpb25Pbmx5ICYmICFldmVudC5lcXVhbHMoZG9jLnNlbCkpIHtcbiAgICAgICAgICBzZXRTZWxlY3Rpb24oZG9jLCBldmVudCwge2NsZWFyUmVkbzogZmFsc2V9KTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2VsQWZ0ZXIgPSBldmVudDtcbiAgICAgIH1cbiAgICAgIGVsc2UgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gQnVpbGQgdXAgYSByZXZlcnNlIGNoYW5nZSBvYmplY3QgdG8gYWRkIHRvIHRoZSBvcHBvc2l0ZSBoaXN0b3J5XG4gICAgLy8gc3RhY2sgKHJlZG8gd2hlbiB1bmRvaW5nLCBhbmQgdmljZSB2ZXJzYSkuXG4gICAgdmFyIGFudGlDaGFuZ2VzID0gW107XG4gICAgcHVzaFNlbGVjdGlvblRvSGlzdG9yeShzZWxBZnRlciwgZGVzdCk7XG4gICAgZGVzdC5wdXNoKHtjaGFuZ2VzOiBhbnRpQ2hhbmdlcywgZ2VuZXJhdGlvbjogaGlzdC5nZW5lcmF0aW9ufSk7XG4gICAgaGlzdC5nZW5lcmF0aW9uID0gZXZlbnQuZ2VuZXJhdGlvbiB8fCArK2hpc3QubWF4R2VuZXJhdGlvbjtcblxuICAgIHZhciBmaWx0ZXIgPSBoYXNIYW5kbGVyKGRvYywgXCJiZWZvcmVDaGFuZ2VcIikgfHwgZG9jLmNtICYmIGhhc0hhbmRsZXIoZG9jLmNtLCBcImJlZm9yZUNoYW5nZVwiKTtcblxuICAgIGZvciAodmFyIGkgPSBldmVudC5jaGFuZ2VzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICB2YXIgY2hhbmdlID0gZXZlbnQuY2hhbmdlc1tpXTtcbiAgICAgIGNoYW5nZS5vcmlnaW4gPSB0eXBlO1xuICAgICAgaWYgKGZpbHRlciAmJiAhZmlsdGVyQ2hhbmdlKGRvYywgY2hhbmdlLCBmYWxzZSkpIHtcbiAgICAgICAgc291cmNlLmxlbmd0aCA9IDA7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgYW50aUNoYW5nZXMucHVzaChoaXN0b3J5Q2hhbmdlRnJvbUNoYW5nZShkb2MsIGNoYW5nZSkpO1xuXG4gICAgICB2YXIgYWZ0ZXIgPSBpID8gY29tcHV0ZVNlbEFmdGVyQ2hhbmdlKGRvYywgY2hhbmdlLCBudWxsKSA6IGxzdChzb3VyY2UpO1xuICAgICAgbWFrZUNoYW5nZVNpbmdsZURvYyhkb2MsIGNoYW5nZSwgYWZ0ZXIsIG1lcmdlT2xkU3BhbnMoZG9jLCBjaGFuZ2UpKTtcbiAgICAgIGlmICghaSAmJiBkb2MuY20pIGRvYy5jbS5zY3JvbGxJbnRvVmlldyhjaGFuZ2UpO1xuICAgICAgdmFyIHJlYmFzZWQgPSBbXTtcblxuICAgICAgLy8gUHJvcGFnYXRlIHRvIHRoZSBsaW5rZWQgZG9jdW1lbnRzXG4gICAgICBsaW5rZWREb2NzKGRvYywgZnVuY3Rpb24oZG9jLCBzaGFyZWRIaXN0KSB7XG4gICAgICAgIGlmICghc2hhcmVkSGlzdCAmJiBpbmRleE9mKHJlYmFzZWQsIGRvYy5oaXN0b3J5KSA9PSAtMSkge1xuICAgICAgICAgIHJlYmFzZUhpc3QoZG9jLmhpc3RvcnksIGNoYW5nZSk7XG4gICAgICAgICAgcmViYXNlZC5wdXNoKGRvYy5oaXN0b3J5KTtcbiAgICAgICAgfVxuICAgICAgICBtYWtlQ2hhbmdlU2luZ2xlRG9jKGRvYywgY2hhbmdlLCBudWxsLCBtZXJnZU9sZFNwYW5zKGRvYywgY2hhbmdlKSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBTdWItdmlld3MgbmVlZCB0aGVpciBsaW5lIG51bWJlcnMgc2hpZnRlZCB3aGVuIHRleHQgaXMgYWRkZWRcbiAgLy8gYWJvdmUgb3IgYmVsb3cgdGhlbSBpbiB0aGUgcGFyZW50IGRvY3VtZW50LlxuICBmdW5jdGlvbiBzaGlmdERvYyhkb2MsIGRpc3RhbmNlKSB7XG4gICAgaWYgKGRpc3RhbmNlID09IDApIHJldHVybjtcbiAgICBkb2MuZmlyc3QgKz0gZGlzdGFuY2U7XG4gICAgZG9jLnNlbCA9IG5ldyBTZWxlY3Rpb24obWFwKGRvYy5zZWwucmFuZ2VzLCBmdW5jdGlvbihyYW5nZSkge1xuICAgICAgcmV0dXJuIG5ldyBSYW5nZShQb3MocmFuZ2UuYW5jaG9yLmxpbmUgKyBkaXN0YW5jZSwgcmFuZ2UuYW5jaG9yLmNoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgUG9zKHJhbmdlLmhlYWQubGluZSArIGRpc3RhbmNlLCByYW5nZS5oZWFkLmNoKSk7XG4gICAgfSksIGRvYy5zZWwucHJpbUluZGV4KTtcbiAgICBpZiAoZG9jLmNtKSB7XG4gICAgICByZWdDaGFuZ2UoZG9jLmNtLCBkb2MuZmlyc3QsIGRvYy5maXJzdCAtIGRpc3RhbmNlLCBkaXN0YW5jZSk7XG4gICAgICBmb3IgKHZhciBkID0gZG9jLmNtLmRpc3BsYXksIGwgPSBkLnZpZXdGcm9tOyBsIDwgZC52aWV3VG87IGwrKylcbiAgICAgICAgcmVnTGluZUNoYW5nZShkb2MuY20sIGwsIFwiZ3V0dGVyXCIpO1xuICAgIH1cbiAgfVxuXG4gIC8vIE1vcmUgbG93ZXItbGV2ZWwgY2hhbmdlIGZ1bmN0aW9uLCBoYW5kbGluZyBvbmx5IGEgc2luZ2xlIGRvY3VtZW50XG4gIC8vIChub3QgbGlua2VkIG9uZXMpLlxuICBmdW5jdGlvbiBtYWtlQ2hhbmdlU2luZ2xlRG9jKGRvYywgY2hhbmdlLCBzZWxBZnRlciwgc3BhbnMpIHtcbiAgICBpZiAoZG9jLmNtICYmICFkb2MuY20uY3VyT3ApXG4gICAgICByZXR1cm4gb3BlcmF0aW9uKGRvYy5jbSwgbWFrZUNoYW5nZVNpbmdsZURvYykoZG9jLCBjaGFuZ2UsIHNlbEFmdGVyLCBzcGFucyk7XG5cbiAgICBpZiAoY2hhbmdlLnRvLmxpbmUgPCBkb2MuZmlyc3QpIHtcbiAgICAgIHNoaWZ0RG9jKGRvYywgY2hhbmdlLnRleHQubGVuZ3RoIC0gMSAtIChjaGFuZ2UudG8ubGluZSAtIGNoYW5nZS5mcm9tLmxpbmUpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGNoYW5nZS5mcm9tLmxpbmUgPiBkb2MubGFzdExpbmUoKSkgcmV0dXJuO1xuXG4gICAgLy8gQ2xpcCB0aGUgY2hhbmdlIHRvIHRoZSBzaXplIG9mIHRoaXMgZG9jXG4gICAgaWYgKGNoYW5nZS5mcm9tLmxpbmUgPCBkb2MuZmlyc3QpIHtcbiAgICAgIHZhciBzaGlmdCA9IGNoYW5nZS50ZXh0Lmxlbmd0aCAtIDEgLSAoZG9jLmZpcnN0IC0gY2hhbmdlLmZyb20ubGluZSk7XG4gICAgICBzaGlmdERvYyhkb2MsIHNoaWZ0KTtcbiAgICAgIGNoYW5nZSA9IHtmcm9tOiBQb3MoZG9jLmZpcnN0LCAwKSwgdG86IFBvcyhjaGFuZ2UudG8ubGluZSArIHNoaWZ0LCBjaGFuZ2UudG8uY2gpLFxuICAgICAgICAgICAgICAgIHRleHQ6IFtsc3QoY2hhbmdlLnRleHQpXSwgb3JpZ2luOiBjaGFuZ2Uub3JpZ2lufTtcbiAgICB9XG4gICAgdmFyIGxhc3QgPSBkb2MubGFzdExpbmUoKTtcbiAgICBpZiAoY2hhbmdlLnRvLmxpbmUgPiBsYXN0KSB7XG4gICAgICBjaGFuZ2UgPSB7ZnJvbTogY2hhbmdlLmZyb20sIHRvOiBQb3MobGFzdCwgZ2V0TGluZShkb2MsIGxhc3QpLnRleHQubGVuZ3RoKSxcbiAgICAgICAgICAgICAgICB0ZXh0OiBbY2hhbmdlLnRleHRbMF1dLCBvcmlnaW46IGNoYW5nZS5vcmlnaW59O1xuICAgIH1cblxuICAgIGNoYW5nZS5yZW1vdmVkID0gZ2V0QmV0d2Vlbihkb2MsIGNoYW5nZS5mcm9tLCBjaGFuZ2UudG8pO1xuXG4gICAgaWYgKCFzZWxBZnRlcikgc2VsQWZ0ZXIgPSBjb21wdXRlU2VsQWZ0ZXJDaGFuZ2UoZG9jLCBjaGFuZ2UsIG51bGwpO1xuICAgIGlmIChkb2MuY20pIG1ha2VDaGFuZ2VTaW5nbGVEb2NJbkVkaXRvcihkb2MuY20sIGNoYW5nZSwgc3BhbnMpO1xuICAgIGVsc2UgdXBkYXRlRG9jKGRvYywgY2hhbmdlLCBzcGFucyk7XG4gICAgc2V0U2VsZWN0aW9uTm9VbmRvKGRvYywgc2VsQWZ0ZXIsIHNlbF9kb250U2Nyb2xsKTtcbiAgfVxuXG4gIC8vIEhhbmRsZSB0aGUgaW50ZXJhY3Rpb24gb2YgYSBjaGFuZ2UgdG8gYSBkb2N1bWVudCB3aXRoIHRoZSBlZGl0b3JcbiAgLy8gdGhhdCB0aGlzIGRvY3VtZW50IGlzIHBhcnQgb2YuXG4gIGZ1bmN0aW9uIG1ha2VDaGFuZ2VTaW5nbGVEb2NJbkVkaXRvcihjbSwgY2hhbmdlLCBzcGFucykge1xuICAgIHZhciBkb2MgPSBjbS5kb2MsIGRpc3BsYXkgPSBjbS5kaXNwbGF5LCBmcm9tID0gY2hhbmdlLmZyb20sIHRvID0gY2hhbmdlLnRvO1xuXG4gICAgdmFyIHJlY29tcHV0ZU1heExlbmd0aCA9IGZhbHNlLCBjaGVja1dpZHRoU3RhcnQgPSBmcm9tLmxpbmU7XG4gICAgaWYgKCFjbS5vcHRpb25zLmxpbmVXcmFwcGluZykge1xuICAgICAgY2hlY2tXaWR0aFN0YXJ0ID0gbGluZU5vKHZpc3VhbExpbmUoZ2V0TGluZShkb2MsIGZyb20ubGluZSkpKTtcbiAgICAgIGRvYy5pdGVyKGNoZWNrV2lkdGhTdGFydCwgdG8ubGluZSArIDEsIGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgaWYgKGxpbmUgPT0gZGlzcGxheS5tYXhMaW5lKSB7XG4gICAgICAgICAgcmVjb21wdXRlTWF4TGVuZ3RoID0gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGRvYy5zZWwuY29udGFpbnMoY2hhbmdlLmZyb20sIGNoYW5nZS50bykgPiAtMSlcbiAgICAgIHNpZ25hbEN1cnNvckFjdGl2aXR5KGNtKTtcblxuICAgIHVwZGF0ZURvYyhkb2MsIGNoYW5nZSwgc3BhbnMsIGVzdGltYXRlSGVpZ2h0KGNtKSk7XG5cbiAgICBpZiAoIWNtLm9wdGlvbnMubGluZVdyYXBwaW5nKSB7XG4gICAgICBkb2MuaXRlcihjaGVja1dpZHRoU3RhcnQsIGZyb20ubGluZSArIGNoYW5nZS50ZXh0Lmxlbmd0aCwgZnVuY3Rpb24obGluZSkge1xuICAgICAgICB2YXIgbGVuID0gbGluZUxlbmd0aChsaW5lKTtcbiAgICAgICAgaWYgKGxlbiA+IGRpc3BsYXkubWF4TGluZUxlbmd0aCkge1xuICAgICAgICAgIGRpc3BsYXkubWF4TGluZSA9IGxpbmU7XG4gICAgICAgICAgZGlzcGxheS5tYXhMaW5lTGVuZ3RoID0gbGVuO1xuICAgICAgICAgIGRpc3BsYXkubWF4TGluZUNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgIHJlY29tcHV0ZU1heExlbmd0aCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmIChyZWNvbXB1dGVNYXhMZW5ndGgpIGNtLmN1ck9wLnVwZGF0ZU1heExpbmUgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIEFkanVzdCBmcm9udGllciwgc2NoZWR1bGUgd29ya2VyXG4gICAgZG9jLmZyb250aWVyID0gTWF0aC5taW4oZG9jLmZyb250aWVyLCBmcm9tLmxpbmUpO1xuICAgIHN0YXJ0V29ya2VyKGNtLCA0MDApO1xuXG4gICAgdmFyIGxlbmRpZmYgPSBjaGFuZ2UudGV4dC5sZW5ndGggLSAodG8ubGluZSAtIGZyb20ubGluZSkgLSAxO1xuICAgIC8vIFJlbWVtYmVyIHRoYXQgdGhlc2UgbGluZXMgY2hhbmdlZCwgZm9yIHVwZGF0aW5nIHRoZSBkaXNwbGF5XG4gICAgaWYgKGZyb20ubGluZSA9PSB0by5saW5lICYmIGNoYW5nZS50ZXh0Lmxlbmd0aCA9PSAxICYmICFpc1dob2xlTGluZVVwZGF0ZShjbS5kb2MsIGNoYW5nZSkpXG4gICAgICByZWdMaW5lQ2hhbmdlKGNtLCBmcm9tLmxpbmUsIFwidGV4dFwiKTtcbiAgICBlbHNlXG4gICAgICByZWdDaGFuZ2UoY20sIGZyb20ubGluZSwgdG8ubGluZSArIDEsIGxlbmRpZmYpO1xuXG4gICAgdmFyIGNoYW5nZXNIYW5kbGVyID0gaGFzSGFuZGxlcihjbSwgXCJjaGFuZ2VzXCIpLCBjaGFuZ2VIYW5kbGVyID0gaGFzSGFuZGxlcihjbSwgXCJjaGFuZ2VcIik7XG4gICAgaWYgKGNoYW5nZUhhbmRsZXIgfHwgY2hhbmdlc0hhbmRsZXIpIHtcbiAgICAgIHZhciBvYmogPSB7XG4gICAgICAgIGZyb206IGZyb20sIHRvOiB0byxcbiAgICAgICAgdGV4dDogY2hhbmdlLnRleHQsXG4gICAgICAgIHJlbW92ZWQ6IGNoYW5nZS5yZW1vdmVkLFxuICAgICAgICBvcmlnaW46IGNoYW5nZS5vcmlnaW5cbiAgICAgIH07XG4gICAgICBpZiAoY2hhbmdlSGFuZGxlcikgc2lnbmFsTGF0ZXIoY20sIFwiY2hhbmdlXCIsIGNtLCBvYmopO1xuICAgICAgaWYgKGNoYW5nZXNIYW5kbGVyKSAoY20uY3VyT3AuY2hhbmdlT2JqcyB8fCAoY20uY3VyT3AuY2hhbmdlT2JqcyA9IFtdKSkucHVzaChvYmopO1xuICAgIH1cbiAgICBjbS5kaXNwbGF5LnNlbEZvckNvbnRleHRNZW51ID0gbnVsbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlcGxhY2VSYW5nZShkb2MsIGNvZGUsIGZyb20sIHRvLCBvcmlnaW4pIHtcbiAgICBpZiAoIXRvKSB0byA9IGZyb207XG4gICAgaWYgKGNtcCh0bywgZnJvbSkgPCAwKSB7IHZhciB0bXAgPSB0bzsgdG8gPSBmcm9tOyBmcm9tID0gdG1wOyB9XG4gICAgaWYgKHR5cGVvZiBjb2RlID09IFwic3RyaW5nXCIpIGNvZGUgPSBzcGxpdExpbmVzKGNvZGUpO1xuICAgIG1ha2VDaGFuZ2UoZG9jLCB7ZnJvbTogZnJvbSwgdG86IHRvLCB0ZXh0OiBjb2RlLCBvcmlnaW46IG9yaWdpbn0pO1xuICB9XG5cbiAgLy8gU0NST0xMSU5HIFRISU5HUyBJTlRPIFZJRVdcblxuICAvLyBJZiBhbiBlZGl0b3Igc2l0cyBvbiB0aGUgdG9wIG9yIGJvdHRvbSBvZiB0aGUgd2luZG93LCBwYXJ0aWFsbHlcbiAgLy8gc2Nyb2xsZWQgb3V0IG9mIHZpZXcsIHRoaXMgZW5zdXJlcyB0aGF0IHRoZSBjdXJzb3IgaXMgdmlzaWJsZS5cbiAgZnVuY3Rpb24gbWF5YmVTY3JvbGxXaW5kb3coY20sIGNvb3Jkcykge1xuICAgIHZhciBkaXNwbGF5ID0gY20uZGlzcGxheSwgYm94ID0gZGlzcGxheS5zaXplci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSwgZG9TY3JvbGwgPSBudWxsO1xuICAgIGlmIChjb29yZHMudG9wICsgYm94LnRvcCA8IDApIGRvU2Nyb2xsID0gdHJ1ZTtcbiAgICBlbHNlIGlmIChjb29yZHMuYm90dG9tICsgYm94LnRvcCA+ICh3aW5kb3cuaW5uZXJIZWlnaHQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCkpIGRvU2Nyb2xsID0gZmFsc2U7XG4gICAgaWYgKGRvU2Nyb2xsICE9IG51bGwgJiYgIXBoYW50b20pIHtcbiAgICAgIHZhciBzY3JvbGxOb2RlID0gZWx0KFwiZGl2XCIsIFwiXFx1MjAwYlwiLCBudWxsLCBcInBvc2l0aW9uOiBhYnNvbHV0ZTsgdG9wOiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAoY29vcmRzLnRvcCAtIGRpc3BsYXkudmlld09mZnNldCAtIHBhZGRpbmdUb3AoY20uZGlzcGxheSkpICsgXCJweDsgaGVpZ2h0OiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAoY29vcmRzLmJvdHRvbSAtIGNvb3Jkcy50b3AgKyBzY3JvbGxlckN1dE9mZikgKyBcInB4OyBsZWZ0OiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBjb29yZHMubGVmdCArIFwicHg7IHdpZHRoOiAycHg7XCIpO1xuICAgICAgY20uZGlzcGxheS5saW5lU3BhY2UuYXBwZW5kQ2hpbGQoc2Nyb2xsTm9kZSk7XG4gICAgICBzY3JvbGxOb2RlLnNjcm9sbEludG9WaWV3KGRvU2Nyb2xsKTtcbiAgICAgIGNtLmRpc3BsYXkubGluZVNwYWNlLnJlbW92ZUNoaWxkKHNjcm9sbE5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFNjcm9sbCBhIGdpdmVuIHBvc2l0aW9uIGludG8gdmlldyAoaW1tZWRpYXRlbHkpLCB2ZXJpZnlpbmcgdGhhdFxuICAvLyBpdCBhY3R1YWxseSBiZWNhbWUgdmlzaWJsZSAoYXMgbGluZSBoZWlnaHRzIGFyZSBhY2N1cmF0ZWx5XG4gIC8vIG1lYXN1cmVkLCB0aGUgcG9zaXRpb24gb2Ygc29tZXRoaW5nIG1heSAnZHJpZnQnIGR1cmluZyBkcmF3aW5nKS5cbiAgZnVuY3Rpb24gc2Nyb2xsUG9zSW50b1ZpZXcoY20sIHBvcywgZW5kLCBtYXJnaW4pIHtcbiAgICBpZiAobWFyZ2luID09IG51bGwpIG1hcmdpbiA9IDA7XG4gICAgZm9yICg7Oykge1xuICAgICAgdmFyIGNoYW5nZWQgPSBmYWxzZSwgY29vcmRzID0gY3Vyc29yQ29vcmRzKGNtLCBwb3MpO1xuICAgICAgdmFyIGVuZENvb3JkcyA9ICFlbmQgfHwgZW5kID09IHBvcyA/IGNvb3JkcyA6IGN1cnNvckNvb3JkcyhjbSwgZW5kKTtcbiAgICAgIHZhciBzY3JvbGxQb3MgPSBjYWxjdWxhdGVTY3JvbGxQb3MoY20sIE1hdGgubWluKGNvb3Jkcy5sZWZ0LCBlbmRDb29yZHMubGVmdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGgubWluKGNvb3Jkcy50b3AsIGVuZENvb3Jkcy50b3ApIC0gbWFyZ2luLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLm1heChjb29yZHMubGVmdCwgZW5kQ29vcmRzLmxlZnQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLm1heChjb29yZHMuYm90dG9tLCBlbmRDb29yZHMuYm90dG9tKSArIG1hcmdpbik7XG4gICAgICB2YXIgc3RhcnRUb3AgPSBjbS5kb2Muc2Nyb2xsVG9wLCBzdGFydExlZnQgPSBjbS5kb2Muc2Nyb2xsTGVmdDtcbiAgICAgIGlmIChzY3JvbGxQb3Muc2Nyb2xsVG9wICE9IG51bGwpIHtcbiAgICAgICAgc2V0U2Nyb2xsVG9wKGNtLCBzY3JvbGxQb3Muc2Nyb2xsVG9wKTtcbiAgICAgICAgaWYgKE1hdGguYWJzKGNtLmRvYy5zY3JvbGxUb3AgLSBzdGFydFRvcCkgPiAxKSBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmIChzY3JvbGxQb3Muc2Nyb2xsTGVmdCAhPSBudWxsKSB7XG4gICAgICAgIHNldFNjcm9sbExlZnQoY20sIHNjcm9sbFBvcy5zY3JvbGxMZWZ0KTtcbiAgICAgICAgaWYgKE1hdGguYWJzKGNtLmRvYy5zY3JvbGxMZWZ0IC0gc3RhcnRMZWZ0KSA+IDEpIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKCFjaGFuZ2VkKSByZXR1cm4gY29vcmRzO1xuICAgIH1cbiAgfVxuXG4gIC8vIFNjcm9sbCBhIGdpdmVuIHNldCBvZiBjb29yZGluYXRlcyBpbnRvIHZpZXcgKGltbWVkaWF0ZWx5KS5cbiAgZnVuY3Rpb24gc2Nyb2xsSW50b1ZpZXcoY20sIHgxLCB5MSwgeDIsIHkyKSB7XG4gICAgdmFyIHNjcm9sbFBvcyA9IGNhbGN1bGF0ZVNjcm9sbFBvcyhjbSwgeDEsIHkxLCB4MiwgeTIpO1xuICAgIGlmIChzY3JvbGxQb3Muc2Nyb2xsVG9wICE9IG51bGwpIHNldFNjcm9sbFRvcChjbSwgc2Nyb2xsUG9zLnNjcm9sbFRvcCk7XG4gICAgaWYgKHNjcm9sbFBvcy5zY3JvbGxMZWZ0ICE9IG51bGwpIHNldFNjcm9sbExlZnQoY20sIHNjcm9sbFBvcy5zY3JvbGxMZWZ0KTtcbiAgfVxuXG4gIC8vIENhbGN1bGF0ZSBhIG5ldyBzY3JvbGwgcG9zaXRpb24gbmVlZGVkIHRvIHNjcm9sbCB0aGUgZ2l2ZW5cbiAgLy8gcmVjdGFuZ2xlIGludG8gdmlldy4gUmV0dXJucyBhbiBvYmplY3Qgd2l0aCBzY3JvbGxUb3AgYW5kXG4gIC8vIHNjcm9sbExlZnQgcHJvcGVydGllcy4gV2hlbiB0aGVzZSBhcmUgdW5kZWZpbmVkLCB0aGVcbiAgLy8gdmVydGljYWwvaG9yaXpvbnRhbCBwb3NpdGlvbiBkb2VzIG5vdCBuZWVkIHRvIGJlIGFkanVzdGVkLlxuICBmdW5jdGlvbiBjYWxjdWxhdGVTY3JvbGxQb3MoY20sIHgxLCB5MSwgeDIsIHkyKSB7XG4gICAgdmFyIGRpc3BsYXkgPSBjbS5kaXNwbGF5LCBzbmFwTWFyZ2luID0gdGV4dEhlaWdodChjbS5kaXNwbGF5KTtcbiAgICBpZiAoeTEgPCAwKSB5MSA9IDA7XG4gICAgdmFyIHNjcmVlbnRvcCA9IGNtLmN1ck9wICYmIGNtLmN1ck9wLnNjcm9sbFRvcCAhPSBudWxsID8gY20uY3VyT3Auc2Nyb2xsVG9wIDogZGlzcGxheS5zY3JvbGxlci5zY3JvbGxUb3A7XG4gICAgdmFyIHNjcmVlbiA9IGRpc3BsYXkuc2Nyb2xsZXIuY2xpZW50SGVpZ2h0IC0gc2Nyb2xsZXJDdXRPZmYsIHJlc3VsdCA9IHt9O1xuICAgIHZhciBkb2NCb3R0b20gPSBjbS5kb2MuaGVpZ2h0ICsgcGFkZGluZ1ZlcnQoZGlzcGxheSk7XG4gICAgdmFyIGF0VG9wID0geTEgPCBzbmFwTWFyZ2luLCBhdEJvdHRvbSA9IHkyID4gZG9jQm90dG9tIC0gc25hcE1hcmdpbjtcbiAgICBpZiAoeTEgPCBzY3JlZW50b3ApIHtcbiAgICAgIHJlc3VsdC5zY3JvbGxUb3AgPSBhdFRvcCA/IDAgOiB5MTtcbiAgICB9IGVsc2UgaWYgKHkyID4gc2NyZWVudG9wICsgc2NyZWVuKSB7XG4gICAgICB2YXIgbmV3VG9wID0gTWF0aC5taW4oeTEsIChhdEJvdHRvbSA/IGRvY0JvdHRvbSA6IHkyKSAtIHNjcmVlbik7XG4gICAgICBpZiAobmV3VG9wICE9IHNjcmVlbnRvcCkgcmVzdWx0LnNjcm9sbFRvcCA9IG5ld1RvcDtcbiAgICB9XG5cbiAgICB2YXIgc2NyZWVubGVmdCA9IGNtLmN1ck9wICYmIGNtLmN1ck9wLnNjcm9sbExlZnQgIT0gbnVsbCA/IGNtLmN1ck9wLnNjcm9sbExlZnQgOiBkaXNwbGF5LnNjcm9sbGVyLnNjcm9sbExlZnQ7XG4gICAgdmFyIHNjcmVlbncgPSBkaXNwbGF5LnNjcm9sbGVyLmNsaWVudFdpZHRoIC0gc2Nyb2xsZXJDdXRPZmY7XG4gICAgeDEgKz0gZGlzcGxheS5ndXR0ZXJzLm9mZnNldFdpZHRoOyB4MiArPSBkaXNwbGF5Lmd1dHRlcnMub2Zmc2V0V2lkdGg7XG4gICAgdmFyIGd1dHRlcncgPSBkaXNwbGF5Lmd1dHRlcnMub2Zmc2V0V2lkdGg7XG4gICAgdmFyIGF0TGVmdCA9IHgxIDwgZ3V0dGVydyArIDEwO1xuICAgIGlmICh4MSA8IHNjcmVlbmxlZnQgKyBndXR0ZXJ3IHx8IGF0TGVmdCkge1xuICAgICAgaWYgKGF0TGVmdCkgeDEgPSAwO1xuICAgICAgcmVzdWx0LnNjcm9sbExlZnQgPSBNYXRoLm1heCgwLCB4MSAtIDEwIC0gZ3V0dGVydyk7XG4gICAgfSBlbHNlIGlmICh4MiA+IHNjcmVlbncgKyBzY3JlZW5sZWZ0IC0gMykge1xuICAgICAgcmVzdWx0LnNjcm9sbExlZnQgPSB4MiArIDEwIC0gc2NyZWVudztcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8vIFN0b3JlIGEgcmVsYXRpdmUgYWRqdXN0bWVudCB0byB0aGUgc2Nyb2xsIHBvc2l0aW9uIGluIHRoZSBjdXJyZW50XG4gIC8vIG9wZXJhdGlvbiAodG8gYmUgYXBwbGllZCB3aGVuIHRoZSBvcGVyYXRpb24gZmluaXNoZXMpLlxuICBmdW5jdGlvbiBhZGRUb1Njcm9sbFBvcyhjbSwgbGVmdCwgdG9wKSB7XG4gICAgaWYgKGxlZnQgIT0gbnVsbCB8fCB0b3AgIT0gbnVsbCkgcmVzb2x2ZVNjcm9sbFRvUG9zKGNtKTtcbiAgICBpZiAobGVmdCAhPSBudWxsKVxuICAgICAgY20uY3VyT3Auc2Nyb2xsTGVmdCA9IChjbS5jdXJPcC5zY3JvbGxMZWZ0ID09IG51bGwgPyBjbS5kb2Muc2Nyb2xsTGVmdCA6IGNtLmN1ck9wLnNjcm9sbExlZnQpICsgbGVmdDtcbiAgICBpZiAodG9wICE9IG51bGwpXG4gICAgICBjbS5jdXJPcC5zY3JvbGxUb3AgPSAoY20uY3VyT3Auc2Nyb2xsVG9wID09IG51bGwgPyBjbS5kb2Muc2Nyb2xsVG9wIDogY20uY3VyT3Auc2Nyb2xsVG9wKSArIHRvcDtcbiAgfVxuXG4gIC8vIE1ha2Ugc3VyZSB0aGF0IGF0IHRoZSBlbmQgb2YgdGhlIG9wZXJhdGlvbiB0aGUgY3VycmVudCBjdXJzb3IgaXNcbiAgLy8gc2hvd24uXG4gIGZ1bmN0aW9uIGVuc3VyZUN1cnNvclZpc2libGUoY20pIHtcbiAgICByZXNvbHZlU2Nyb2xsVG9Qb3MoY20pO1xuICAgIHZhciBjdXIgPSBjbS5nZXRDdXJzb3IoKSwgZnJvbSA9IGN1ciwgdG8gPSBjdXI7XG4gICAgaWYgKCFjbS5vcHRpb25zLmxpbmVXcmFwcGluZykge1xuICAgICAgZnJvbSA9IGN1ci5jaCA/IFBvcyhjdXIubGluZSwgY3VyLmNoIC0gMSkgOiBjdXI7XG4gICAgICB0byA9IFBvcyhjdXIubGluZSwgY3VyLmNoICsgMSk7XG4gICAgfVxuICAgIGNtLmN1ck9wLnNjcm9sbFRvUG9zID0ge2Zyb206IGZyb20sIHRvOiB0bywgbWFyZ2luOiBjbS5vcHRpb25zLmN1cnNvclNjcm9sbE1hcmdpbiwgaXNDdXJzb3I6IHRydWV9O1xuICB9XG5cbiAgLy8gV2hlbiBhbiBvcGVyYXRpb24gaGFzIGl0cyBzY3JvbGxUb1BvcyBwcm9wZXJ0eSBzZXQsIGFuZCBhbm90aGVyXG4gIC8vIHNjcm9sbCBhY3Rpb24gaXMgYXBwbGllZCBiZWZvcmUgdGhlIGVuZCBvZiB0aGUgb3BlcmF0aW9uLCB0aGlzXG4gIC8vICdzaW11bGF0ZXMnIHNjcm9sbGluZyB0aGF0IHBvc2l0aW9uIGludG8gdmlldyBpbiBhIGNoZWFwIHdheSwgc29cbiAgLy8gdGhhdCB0aGUgZWZmZWN0IG9mIGludGVybWVkaWF0ZSBzY3JvbGwgY29tbWFuZHMgaXMgbm90IGlnbm9yZWQuXG4gIGZ1bmN0aW9uIHJlc29sdmVTY3JvbGxUb1BvcyhjbSkge1xuICAgIHZhciByYW5nZSA9IGNtLmN1ck9wLnNjcm9sbFRvUG9zO1xuICAgIGlmIChyYW5nZSkge1xuICAgICAgY20uY3VyT3Auc2Nyb2xsVG9Qb3MgPSBudWxsO1xuICAgICAgdmFyIGZyb20gPSBlc3RpbWF0ZUNvb3JkcyhjbSwgcmFuZ2UuZnJvbSksIHRvID0gZXN0aW1hdGVDb29yZHMoY20sIHJhbmdlLnRvKTtcbiAgICAgIHZhciBzUG9zID0gY2FsY3VsYXRlU2Nyb2xsUG9zKGNtLCBNYXRoLm1pbihmcm9tLmxlZnQsIHRvLmxlZnQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5taW4oZnJvbS50b3AsIHRvLnRvcCkgLSByYW5nZS5tYXJnaW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLm1heChmcm9tLnJpZ2h0LCB0by5yaWdodCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLm1heChmcm9tLmJvdHRvbSwgdG8uYm90dG9tKSArIHJhbmdlLm1hcmdpbik7XG4gICAgICBjbS5zY3JvbGxUbyhzUG9zLnNjcm9sbExlZnQsIHNQb3Muc2Nyb2xsVG9wKTtcbiAgICB9XG4gIH1cblxuICAvLyBBUEkgVVRJTElUSUVTXG5cbiAgLy8gSW5kZW50IHRoZSBnaXZlbiBsaW5lLiBUaGUgaG93IHBhcmFtZXRlciBjYW4gYmUgXCJzbWFydFwiLFxuICAvLyBcImFkZFwiL251bGwsIFwic3VidHJhY3RcIiwgb3IgXCJwcmV2XCIuIFdoZW4gYWdncmVzc2l2ZSBpcyBmYWxzZVxuICAvLyAodHlwaWNhbGx5IHNldCB0byB0cnVlIGZvciBmb3JjZWQgc2luZ2xlLWxpbmUgaW5kZW50cyksIGVtcHR5XG4gIC8vIGxpbmVzIGFyZSBub3QgaW5kZW50ZWQsIGFuZCBwbGFjZXMgd2hlcmUgdGhlIG1vZGUgcmV0dXJucyBQYXNzXG4gIC8vIGFyZSBsZWZ0IGFsb25lLlxuICBmdW5jdGlvbiBpbmRlbnRMaW5lKGNtLCBuLCBob3csIGFnZ3Jlc3NpdmUpIHtcbiAgICB2YXIgZG9jID0gY20uZG9jLCBzdGF0ZTtcbiAgICBpZiAoaG93ID09IG51bGwpIGhvdyA9IFwiYWRkXCI7XG4gICAgaWYgKGhvdyA9PSBcInNtYXJ0XCIpIHtcbiAgICAgIC8vIEZhbGwgYmFjayB0byBcInByZXZcIiB3aGVuIHRoZSBtb2RlIGRvZXNuJ3QgaGF2ZSBhbiBpbmRlbnRhdGlvblxuICAgICAgLy8gbWV0aG9kLlxuICAgICAgaWYgKCFjbS5kb2MubW9kZS5pbmRlbnQpIGhvdyA9IFwicHJldlwiO1xuICAgICAgZWxzZSBzdGF0ZSA9IGdldFN0YXRlQmVmb3JlKGNtLCBuKTtcbiAgICB9XG5cbiAgICB2YXIgdGFiU2l6ZSA9IGNtLm9wdGlvbnMudGFiU2l6ZTtcbiAgICB2YXIgbGluZSA9IGdldExpbmUoZG9jLCBuKSwgY3VyU3BhY2UgPSBjb3VudENvbHVtbihsaW5lLnRleHQsIG51bGwsIHRhYlNpemUpO1xuICAgIGlmIChsaW5lLnN0YXRlQWZ0ZXIpIGxpbmUuc3RhdGVBZnRlciA9IG51bGw7XG4gICAgdmFyIGN1clNwYWNlU3RyaW5nID0gbGluZS50ZXh0Lm1hdGNoKC9eXFxzKi8pWzBdLCBpbmRlbnRhdGlvbjtcbiAgICBpZiAoIWFnZ3Jlc3NpdmUgJiYgIS9cXFMvLnRlc3QobGluZS50ZXh0KSkge1xuICAgICAgaW5kZW50YXRpb24gPSAwO1xuICAgICAgaG93ID0gXCJub3RcIjtcbiAgICB9IGVsc2UgaWYgKGhvdyA9PSBcInNtYXJ0XCIpIHtcbiAgICAgIGluZGVudGF0aW9uID0gY20uZG9jLm1vZGUuaW5kZW50KHN0YXRlLCBsaW5lLnRleHQuc2xpY2UoY3VyU3BhY2VTdHJpbmcubGVuZ3RoKSwgbGluZS50ZXh0KTtcbiAgICAgIGlmIChpbmRlbnRhdGlvbiA9PSBQYXNzKSB7XG4gICAgICAgIGlmICghYWdncmVzc2l2ZSkgcmV0dXJuO1xuICAgICAgICBob3cgPSBcInByZXZcIjtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGhvdyA9PSBcInByZXZcIikge1xuICAgICAgaWYgKG4gPiBkb2MuZmlyc3QpIGluZGVudGF0aW9uID0gY291bnRDb2x1bW4oZ2V0TGluZShkb2MsIG4tMSkudGV4dCwgbnVsbCwgdGFiU2l6ZSk7XG4gICAgICBlbHNlIGluZGVudGF0aW9uID0gMDtcbiAgICB9IGVsc2UgaWYgKGhvdyA9PSBcImFkZFwiKSB7XG4gICAgICBpbmRlbnRhdGlvbiA9IGN1clNwYWNlICsgY20ub3B0aW9ucy5pbmRlbnRVbml0O1xuICAgIH0gZWxzZSBpZiAoaG93ID09IFwic3VidHJhY3RcIikge1xuICAgICAgaW5kZW50YXRpb24gPSBjdXJTcGFjZSAtIGNtLm9wdGlvbnMuaW5kZW50VW5pdDtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBob3cgPT0gXCJudW1iZXJcIikge1xuICAgICAgaW5kZW50YXRpb24gPSBjdXJTcGFjZSArIGhvdztcbiAgICB9XG4gICAgaW5kZW50YXRpb24gPSBNYXRoLm1heCgwLCBpbmRlbnRhdGlvbik7XG5cbiAgICB2YXIgaW5kZW50U3RyaW5nID0gXCJcIiwgcG9zID0gMDtcbiAgICBpZiAoY20ub3B0aW9ucy5pbmRlbnRXaXRoVGFicylcbiAgICAgIGZvciAodmFyIGkgPSBNYXRoLmZsb29yKGluZGVudGF0aW9uIC8gdGFiU2l6ZSk7IGk7IC0taSkge3BvcyArPSB0YWJTaXplOyBpbmRlbnRTdHJpbmcgKz0gXCJcXHRcIjt9XG4gICAgaWYgKHBvcyA8IGluZGVudGF0aW9uKSBpbmRlbnRTdHJpbmcgKz0gc3BhY2VTdHIoaW5kZW50YXRpb24gLSBwb3MpO1xuXG4gICAgaWYgKGluZGVudFN0cmluZyAhPSBjdXJTcGFjZVN0cmluZykge1xuICAgICAgcmVwbGFjZVJhbmdlKGNtLmRvYywgaW5kZW50U3RyaW5nLCBQb3MobiwgMCksIFBvcyhuLCBjdXJTcGFjZVN0cmluZy5sZW5ndGgpLCBcIitpbnB1dFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRW5zdXJlIHRoYXQsIGlmIHRoZSBjdXJzb3Igd2FzIGluIHRoZSB3aGl0ZXNwYWNlIGF0IHRoZSBzdGFydFxuICAgICAgLy8gb2YgdGhlIGxpbmUsIGl0IGlzIG1vdmVkIHRvIHRoZSBlbmQgb2YgdGhhdCBzcGFjZS5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZG9jLnNlbC5yYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHJhbmdlID0gZG9jLnNlbC5yYW5nZXNbaV07XG4gICAgICAgIGlmIChyYW5nZS5oZWFkLmxpbmUgPT0gbiAmJiByYW5nZS5oZWFkLmNoIDwgY3VyU3BhY2VTdHJpbmcubGVuZ3RoKSB7XG4gICAgICAgICAgdmFyIHBvcyA9IFBvcyhuLCBjdXJTcGFjZVN0cmluZy5sZW5ndGgpO1xuICAgICAgICAgIHJlcGxhY2VPbmVTZWxlY3Rpb24oZG9jLCBpLCBuZXcgUmFuZ2UocG9zLCBwb3MpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBsaW5lLnN0YXRlQWZ0ZXIgPSBudWxsO1xuICB9XG5cbiAgLy8gVXRpbGl0eSBmb3IgYXBwbHlpbmcgYSBjaGFuZ2UgdG8gYSBsaW5lIGJ5IGhhbmRsZSBvciBudW1iZXIsXG4gIC8vIHJldHVybmluZyB0aGUgbnVtYmVyIGFuZCBvcHRpb25hbGx5IHJlZ2lzdGVyaW5nIHRoZSBsaW5lIGFzXG4gIC8vIGNoYW5nZWQuXG4gIGZ1bmN0aW9uIGNoYW5nZUxpbmUoY20sIGhhbmRsZSwgY2hhbmdlVHlwZSwgb3ApIHtcbiAgICB2YXIgbm8gPSBoYW5kbGUsIGxpbmUgPSBoYW5kbGUsIGRvYyA9IGNtLmRvYztcbiAgICBpZiAodHlwZW9mIGhhbmRsZSA9PSBcIm51bWJlclwiKSBsaW5lID0gZ2V0TGluZShkb2MsIGNsaXBMaW5lKGRvYywgaGFuZGxlKSk7XG4gICAgZWxzZSBubyA9IGxpbmVObyhoYW5kbGUpO1xuICAgIGlmIChubyA9PSBudWxsKSByZXR1cm4gbnVsbDtcbiAgICBpZiAob3AobGluZSwgbm8pKSByZWdMaW5lQ2hhbmdlKGNtLCBubywgY2hhbmdlVHlwZSk7XG4gICAgcmV0dXJuIGxpbmU7XG4gIH1cblxuICAvLyBIZWxwZXIgZm9yIGRlbGV0aW5nIHRleHQgbmVhciB0aGUgc2VsZWN0aW9uKHMpLCB1c2VkIHRvIGltcGxlbWVudFxuICAvLyBiYWNrc3BhY2UsIGRlbGV0ZSwgYW5kIHNpbWlsYXIgZnVuY3Rpb25hbGl0eS5cbiAgZnVuY3Rpb24gZGVsZXRlTmVhclNlbGVjdGlvbihjbSwgY29tcHV0ZSkge1xuICAgIHZhciByYW5nZXMgPSBjbS5kb2Muc2VsLnJhbmdlcywga2lsbCA9IFtdO1xuICAgIC8vIEJ1aWxkIHVwIGEgc2V0IG9mIHJhbmdlcyB0byBraWxsIGZpcnN0LCBtZXJnaW5nIG92ZXJsYXBwaW5nXG4gICAgLy8gcmFuZ2VzLlxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgdG9LaWxsID0gY29tcHV0ZShyYW5nZXNbaV0pO1xuICAgICAgd2hpbGUgKGtpbGwubGVuZ3RoICYmIGNtcCh0b0tpbGwuZnJvbSwgbHN0KGtpbGwpLnRvKSA8PSAwKSB7XG4gICAgICAgIHZhciByZXBsYWNlZCA9IGtpbGwucG9wKCk7XG4gICAgICAgIGlmIChjbXAocmVwbGFjZWQuZnJvbSwgdG9LaWxsLmZyb20pIDwgMCkge1xuICAgICAgICAgIHRvS2lsbC5mcm9tID0gcmVwbGFjZWQuZnJvbTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAga2lsbC5wdXNoKHRvS2lsbCk7XG4gICAgfVxuICAgIC8vIE5leHQsIHJlbW92ZSB0aG9zZSBhY3R1YWwgcmFuZ2VzLlxuICAgIHJ1bkluT3AoY20sIGZ1bmN0aW9uKCkge1xuICAgICAgZm9yICh2YXIgaSA9IGtpbGwubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pXG4gICAgICAgIHJlcGxhY2VSYW5nZShjbS5kb2MsIFwiXCIsIGtpbGxbaV0uZnJvbSwga2lsbFtpXS50bywgXCIrZGVsZXRlXCIpO1xuICAgICAgZW5zdXJlQ3Vyc29yVmlzaWJsZShjbSk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBVc2VkIGZvciBob3Jpem9udGFsIHJlbGF0aXZlIG1vdGlvbi4gRGlyIGlzIC0xIG9yIDEgKGxlZnQgb3JcbiAgLy8gcmlnaHQpLCB1bml0IGNhbiBiZSBcImNoYXJcIiwgXCJjb2x1bW5cIiAobGlrZSBjaGFyLCBidXQgZG9lc24ndFxuICAvLyBjcm9zcyBsaW5lIGJvdW5kYXJpZXMpLCBcIndvcmRcIiAoYWNyb3NzIG5leHQgd29yZCksIG9yIFwiZ3JvdXBcIiAodG9cbiAgLy8gdGhlIHN0YXJ0IG9mIG5leHQgZ3JvdXAgb2Ygd29yZCBvciBub24td29yZC1ub24td2hpdGVzcGFjZVxuICAvLyBjaGFycykuIFRoZSB2aXN1YWxseSBwYXJhbSBjb250cm9scyB3aGV0aGVyLCBpbiByaWdodC10by1sZWZ0XG4gIC8vIHRleHQsIGRpcmVjdGlvbiAxIG1lYW5zIHRvIG1vdmUgdG93YXJkcyB0aGUgbmV4dCBpbmRleCBpbiB0aGVcbiAgLy8gc3RyaW5nLCBvciB0b3dhcmRzIHRoZSBjaGFyYWN0ZXIgdG8gdGhlIHJpZ2h0IG9mIHRoZSBjdXJyZW50XG4gIC8vIHBvc2l0aW9uLiBUaGUgcmVzdWx0aW5nIHBvc2l0aW9uIHdpbGwgaGF2ZSBhIGhpdFNpZGU9dHJ1ZVxuICAvLyBwcm9wZXJ0eSBpZiBpdCByZWFjaGVkIHRoZSBlbmQgb2YgdGhlIGRvY3VtZW50LlxuICBmdW5jdGlvbiBmaW5kUG9zSChkb2MsIHBvcywgZGlyLCB1bml0LCB2aXN1YWxseSkge1xuICAgIHZhciBsaW5lID0gcG9zLmxpbmUsIGNoID0gcG9zLmNoLCBvcmlnRGlyID0gZGlyO1xuICAgIHZhciBsaW5lT2JqID0gZ2V0TGluZShkb2MsIGxpbmUpO1xuICAgIHZhciBwb3NzaWJsZSA9IHRydWU7XG4gICAgZnVuY3Rpb24gZmluZE5leHRMaW5lKCkge1xuICAgICAgdmFyIGwgPSBsaW5lICsgZGlyO1xuICAgICAgaWYgKGwgPCBkb2MuZmlyc3QgfHwgbCA+PSBkb2MuZmlyc3QgKyBkb2Muc2l6ZSkgcmV0dXJuIChwb3NzaWJsZSA9IGZhbHNlKTtcbiAgICAgIGxpbmUgPSBsO1xuICAgICAgcmV0dXJuIGxpbmVPYmogPSBnZXRMaW5lKGRvYywgbCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIG1vdmVPbmNlKGJvdW5kVG9MaW5lKSB7XG4gICAgICB2YXIgbmV4dCA9ICh2aXN1YWxseSA/IG1vdmVWaXN1YWxseSA6IG1vdmVMb2dpY2FsbHkpKGxpbmVPYmosIGNoLCBkaXIsIHRydWUpO1xuICAgICAgaWYgKG5leHQgPT0gbnVsbCkge1xuICAgICAgICBpZiAoIWJvdW5kVG9MaW5lICYmIGZpbmROZXh0TGluZSgpKSB7XG4gICAgICAgICAgaWYgKHZpc3VhbGx5KSBjaCA9IChkaXIgPCAwID8gbGluZVJpZ2h0IDogbGluZUxlZnQpKGxpbmVPYmopO1xuICAgICAgICAgIGVsc2UgY2ggPSBkaXIgPCAwID8gbGluZU9iai50ZXh0Lmxlbmd0aCA6IDA7XG4gICAgICAgIH0gZWxzZSByZXR1cm4gKHBvc3NpYmxlID0gZmFsc2UpO1xuICAgICAgfSBlbHNlIGNoID0gbmV4dDtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmICh1bml0ID09IFwiY2hhclwiKSBtb3ZlT25jZSgpO1xuICAgIGVsc2UgaWYgKHVuaXQgPT0gXCJjb2x1bW5cIikgbW92ZU9uY2UodHJ1ZSk7XG4gICAgZWxzZSBpZiAodW5pdCA9PSBcIndvcmRcIiB8fCB1bml0ID09IFwiZ3JvdXBcIikge1xuICAgICAgdmFyIHNhd1R5cGUgPSBudWxsLCBncm91cCA9IHVuaXQgPT0gXCJncm91cFwiO1xuICAgICAgdmFyIGhlbHBlciA9IGRvYy5jbSAmJiBkb2MuY20uZ2V0SGVscGVyKHBvcywgXCJ3b3JkQ2hhcnNcIik7XG4gICAgICBmb3IgKHZhciBmaXJzdCA9IHRydWU7OyBmaXJzdCA9IGZhbHNlKSB7XG4gICAgICAgIGlmIChkaXIgPCAwICYmICFtb3ZlT25jZSghZmlyc3QpKSBicmVhaztcbiAgICAgICAgdmFyIGN1ciA9IGxpbmVPYmoudGV4dC5jaGFyQXQoY2gpIHx8IFwiXFxuXCI7XG4gICAgICAgIHZhciB0eXBlID0gaXNXb3JkQ2hhcihjdXIsIGhlbHBlcikgPyBcIndcIlxuICAgICAgICAgIDogZ3JvdXAgJiYgY3VyID09IFwiXFxuXCIgPyBcIm5cIlxuICAgICAgICAgIDogIWdyb3VwIHx8IC9cXHMvLnRlc3QoY3VyKSA/IG51bGxcbiAgICAgICAgICA6IFwicFwiO1xuICAgICAgICBpZiAoZ3JvdXAgJiYgIWZpcnN0ICYmICF0eXBlKSB0eXBlID0gXCJzXCI7XG4gICAgICAgIGlmIChzYXdUeXBlICYmIHNhd1R5cGUgIT0gdHlwZSkge1xuICAgICAgICAgIGlmIChkaXIgPCAwKSB7ZGlyID0gMTsgbW92ZU9uY2UoKTt9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZSkgc2F3VHlwZSA9IHR5cGU7XG4gICAgICAgIGlmIChkaXIgPiAwICYmICFtb3ZlT25jZSghZmlyc3QpKSBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIHJlc3VsdCA9IHNraXBBdG9taWMoZG9jLCBQb3MobGluZSwgY2gpLCBvcmlnRGlyLCB0cnVlKTtcbiAgICBpZiAoIXBvc3NpYmxlKSByZXN1bHQuaGl0U2lkZSA9IHRydWU7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8vIEZvciByZWxhdGl2ZSB2ZXJ0aWNhbCBtb3ZlbWVudC4gRGlyIG1heSBiZSAtMSBvciAxLiBVbml0IGNhbiBiZVxuICAvLyBcInBhZ2VcIiBvciBcImxpbmVcIi4gVGhlIHJlc3VsdGluZyBwb3NpdGlvbiB3aWxsIGhhdmUgYSBoaXRTaWRlPXRydWVcbiAgLy8gcHJvcGVydHkgaWYgaXQgcmVhY2hlZCB0aGUgZW5kIG9mIHRoZSBkb2N1bWVudC5cbiAgZnVuY3Rpb24gZmluZFBvc1YoY20sIHBvcywgZGlyLCB1bml0KSB7XG4gICAgdmFyIGRvYyA9IGNtLmRvYywgeCA9IHBvcy5sZWZ0LCB5O1xuICAgIGlmICh1bml0ID09IFwicGFnZVwiKSB7XG4gICAgICB2YXIgcGFnZVNpemUgPSBNYXRoLm1pbihjbS5kaXNwbGF5LndyYXBwZXIuY2xpZW50SGVpZ2h0LCB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCk7XG4gICAgICB5ID0gcG9zLnRvcCArIGRpciAqIChwYWdlU2l6ZSAtIChkaXIgPCAwID8gMS41IDogLjUpICogdGV4dEhlaWdodChjbS5kaXNwbGF5KSk7XG4gICAgfSBlbHNlIGlmICh1bml0ID09IFwibGluZVwiKSB7XG4gICAgICB5ID0gZGlyID4gMCA/IHBvcy5ib3R0b20gKyAzIDogcG9zLnRvcCAtIDM7XG4gICAgfVxuICAgIGZvciAoOzspIHtcbiAgICAgIHZhciB0YXJnZXQgPSBjb29yZHNDaGFyKGNtLCB4LCB5KTtcbiAgICAgIGlmICghdGFyZ2V0Lm91dHNpZGUpIGJyZWFrO1xuICAgICAgaWYgKGRpciA8IDAgPyB5IDw9IDAgOiB5ID49IGRvYy5oZWlnaHQpIHsgdGFyZ2V0LmhpdFNpZGUgPSB0cnVlOyBicmVhazsgfVxuICAgICAgeSArPSBkaXIgKiA1O1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9XG5cbiAgLy8gRmluZCB0aGUgd29yZCBhdCB0aGUgZ2l2ZW4gcG9zaXRpb24gKGFzIHJldHVybmVkIGJ5IGNvb3Jkc0NoYXIpLlxuICBmdW5jdGlvbiBmaW5kV29yZEF0KGNtLCBwb3MpIHtcbiAgICB2YXIgZG9jID0gY20uZG9jLCBsaW5lID0gZ2V0TGluZShkb2MsIHBvcy5saW5lKS50ZXh0O1xuICAgIHZhciBzdGFydCA9IHBvcy5jaCwgZW5kID0gcG9zLmNoO1xuICAgIGlmIChsaW5lKSB7XG4gICAgICB2YXIgaGVscGVyID0gY20uZ2V0SGVscGVyKHBvcywgXCJ3b3JkQ2hhcnNcIik7XG4gICAgICBpZiAoKHBvcy54UmVsIDwgMCB8fCBlbmQgPT0gbGluZS5sZW5ndGgpICYmIHN0YXJ0KSAtLXN0YXJ0OyBlbHNlICsrZW5kO1xuICAgICAgdmFyIHN0YXJ0Q2hhciA9IGxpbmUuY2hhckF0KHN0YXJ0KTtcbiAgICAgIHZhciBjaGVjayA9IGlzV29yZENoYXIoc3RhcnRDaGFyLCBoZWxwZXIpXG4gICAgICAgID8gZnVuY3Rpb24oY2gpIHsgcmV0dXJuIGlzV29yZENoYXIoY2gsIGhlbHBlcik7IH1cbiAgICAgICAgOiAvXFxzLy50ZXN0KHN0YXJ0Q2hhcikgPyBmdW5jdGlvbihjaCkge3JldHVybiAvXFxzLy50ZXN0KGNoKTt9XG4gICAgICAgIDogZnVuY3Rpb24oY2gpIHtyZXR1cm4gIS9cXHMvLnRlc3QoY2gpICYmICFpc1dvcmRDaGFyKGNoKTt9O1xuICAgICAgd2hpbGUgKHN0YXJ0ID4gMCAmJiBjaGVjayhsaW5lLmNoYXJBdChzdGFydCAtIDEpKSkgLS1zdGFydDtcbiAgICAgIHdoaWxlIChlbmQgPCBsaW5lLmxlbmd0aCAmJiBjaGVjayhsaW5lLmNoYXJBdChlbmQpKSkgKytlbmQ7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUmFuZ2UoUG9zKHBvcy5saW5lLCBzdGFydCksIFBvcyhwb3MubGluZSwgZW5kKSk7XG4gIH1cblxuICAvLyBFRElUT1IgTUVUSE9EU1xuXG4gIC8vIFRoZSBwdWJsaWNseSB2aXNpYmxlIEFQSS4gTm90ZSB0aGF0IG1ldGhvZE9wKGYpIG1lYW5zXG4gIC8vICd3cmFwIGYgaW4gYW4gb3BlcmF0aW9uLCBwZXJmb3JtZWQgb24gaXRzIGB0aGlzYCBwYXJhbWV0ZXInLlxuXG4gIC8vIFRoaXMgaXMgbm90IHRoZSBjb21wbGV0ZSBzZXQgb2YgZWRpdG9yIG1ldGhvZHMuIE1vc3Qgb2YgdGhlXG4gIC8vIG1ldGhvZHMgZGVmaW5lZCBvbiB0aGUgRG9jIHR5cGUgYXJlIGFsc28gaW5qZWN0ZWQgaW50b1xuICAvLyBDb2RlTWlycm9yLnByb3RvdHlwZSwgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5IGFuZFxuICAvLyBjb252ZW5pZW5jZS5cblxuICBDb2RlTWlycm9yLnByb3RvdHlwZSA9IHtcbiAgICBjb25zdHJ1Y3RvcjogQ29kZU1pcnJvcixcbiAgICBmb2N1czogZnVuY3Rpb24oKXt3aW5kb3cuZm9jdXMoKTsgZm9jdXNJbnB1dCh0aGlzKTsgZmFzdFBvbGwodGhpcyk7fSxcblxuICAgIHNldE9wdGlvbjogZnVuY3Rpb24ob3B0aW9uLCB2YWx1ZSkge1xuICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsIG9sZCA9IG9wdGlvbnNbb3B0aW9uXTtcbiAgICAgIGlmIChvcHRpb25zW29wdGlvbl0gPT0gdmFsdWUgJiYgb3B0aW9uICE9IFwibW9kZVwiKSByZXR1cm47XG4gICAgICBvcHRpb25zW29wdGlvbl0gPSB2YWx1ZTtcbiAgICAgIGlmIChvcHRpb25IYW5kbGVycy5oYXNPd25Qcm9wZXJ0eShvcHRpb24pKVxuICAgICAgICBvcGVyYXRpb24odGhpcywgb3B0aW9uSGFuZGxlcnNbb3B0aW9uXSkodGhpcywgdmFsdWUsIG9sZCk7XG4gICAgfSxcblxuICAgIGdldE9wdGlvbjogZnVuY3Rpb24ob3B0aW9uKSB7cmV0dXJuIHRoaXMub3B0aW9uc1tvcHRpb25dO30sXG4gICAgZ2V0RG9jOiBmdW5jdGlvbigpIHtyZXR1cm4gdGhpcy5kb2M7fSxcblxuICAgIGFkZEtleU1hcDogZnVuY3Rpb24obWFwLCBib3R0b20pIHtcbiAgICAgIHRoaXMuc3RhdGUua2V5TWFwc1tib3R0b20gPyBcInB1c2hcIiA6IFwidW5zaGlmdFwiXShtYXApO1xuICAgIH0sXG4gICAgcmVtb3ZlS2V5TWFwOiBmdW5jdGlvbihtYXApIHtcbiAgICAgIHZhciBtYXBzID0gdGhpcy5zdGF0ZS5rZXlNYXBzO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXBzLmxlbmd0aDsgKytpKVxuICAgICAgICBpZiAobWFwc1tpXSA9PSBtYXAgfHwgKHR5cGVvZiBtYXBzW2ldICE9IFwic3RyaW5nXCIgJiYgbWFwc1tpXS5uYW1lID09IG1hcCkpIHtcbiAgICAgICAgICBtYXBzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBhZGRPdmVybGF5OiBtZXRob2RPcChmdW5jdGlvbihzcGVjLCBvcHRpb25zKSB7XG4gICAgICB2YXIgbW9kZSA9IHNwZWMudG9rZW4gPyBzcGVjIDogQ29kZU1pcnJvci5nZXRNb2RlKHRoaXMub3B0aW9ucywgc3BlYyk7XG4gICAgICBpZiAobW9kZS5zdGFydFN0YXRlKSB0aHJvdyBuZXcgRXJyb3IoXCJPdmVybGF5cyBtYXkgbm90IGJlIHN0YXRlZnVsLlwiKTtcbiAgICAgIHRoaXMuc3RhdGUub3ZlcmxheXMucHVzaCh7bW9kZTogbW9kZSwgbW9kZVNwZWM6IHNwZWMsIG9wYXF1ZTogb3B0aW9ucyAmJiBvcHRpb25zLm9wYXF1ZX0pO1xuICAgICAgdGhpcy5zdGF0ZS5tb2RlR2VuKys7XG4gICAgICByZWdDaGFuZ2UodGhpcyk7XG4gICAgfSksXG4gICAgcmVtb3ZlT3ZlcmxheTogbWV0aG9kT3AoZnVuY3Rpb24oc3BlYykge1xuICAgICAgdmFyIG92ZXJsYXlzID0gdGhpcy5zdGF0ZS5vdmVybGF5cztcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb3ZlcmxheXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGN1ciA9IG92ZXJsYXlzW2ldLm1vZGVTcGVjO1xuICAgICAgICBpZiAoY3VyID09IHNwZWMgfHwgdHlwZW9mIHNwZWMgPT0gXCJzdHJpbmdcIiAmJiBjdXIubmFtZSA9PSBzcGVjKSB7XG4gICAgICAgICAgb3ZlcmxheXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgIHRoaXMuc3RhdGUubW9kZUdlbisrO1xuICAgICAgICAgIHJlZ0NoYW5nZSh0aGlzKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KSxcblxuICAgIGluZGVudExpbmU6IG1ldGhvZE9wKGZ1bmN0aW9uKG4sIGRpciwgYWdncmVzc2l2ZSkge1xuICAgICAgaWYgKHR5cGVvZiBkaXIgIT0gXCJzdHJpbmdcIiAmJiB0eXBlb2YgZGlyICE9IFwibnVtYmVyXCIpIHtcbiAgICAgICAgaWYgKGRpciA9PSBudWxsKSBkaXIgPSB0aGlzLm9wdGlvbnMuc21hcnRJbmRlbnQgPyBcInNtYXJ0XCIgOiBcInByZXZcIjtcbiAgICAgICAgZWxzZSBkaXIgPSBkaXIgPyBcImFkZFwiIDogXCJzdWJ0cmFjdFwiO1xuICAgICAgfVxuICAgICAgaWYgKGlzTGluZSh0aGlzLmRvYywgbikpIGluZGVudExpbmUodGhpcywgbiwgZGlyLCBhZ2dyZXNzaXZlKTtcbiAgICB9KSxcbiAgICBpbmRlbnRTZWxlY3Rpb246IG1ldGhvZE9wKGZ1bmN0aW9uKGhvdykge1xuICAgICAgdmFyIHJhbmdlcyA9IHRoaXMuZG9jLnNlbC5yYW5nZXMsIGVuZCA9IC0xO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHJhbmdlID0gcmFuZ2VzW2ldO1xuICAgICAgICBpZiAoIXJhbmdlLmVtcHR5KCkpIHtcbiAgICAgICAgICB2YXIgc3RhcnQgPSBNYXRoLm1heChlbmQsIHJhbmdlLmZyb20oKS5saW5lKTtcbiAgICAgICAgICB2YXIgdG8gPSByYW5nZS50bygpO1xuICAgICAgICAgIGVuZCA9IE1hdGgubWluKHRoaXMubGFzdExpbmUoKSwgdG8ubGluZSAtICh0by5jaCA/IDAgOiAxKSkgKyAxO1xuICAgICAgICAgIGZvciAodmFyIGogPSBzdGFydDsgaiA8IGVuZDsgKytqKVxuICAgICAgICAgICAgaW5kZW50TGluZSh0aGlzLCBqLCBob3cpO1xuICAgICAgICB9IGVsc2UgaWYgKHJhbmdlLmhlYWQubGluZSA+IGVuZCkge1xuICAgICAgICAgIGluZGVudExpbmUodGhpcywgcmFuZ2UuaGVhZC5saW5lLCBob3csIHRydWUpO1xuICAgICAgICAgIGVuZCA9IHJhbmdlLmhlYWQubGluZTtcbiAgICAgICAgICBpZiAoaSA9PSB0aGlzLmRvYy5zZWwucHJpbUluZGV4KSBlbnN1cmVDdXJzb3JWaXNpYmxlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSksXG5cbiAgICAvLyBGZXRjaCB0aGUgcGFyc2VyIHRva2VuIGZvciBhIGdpdmVuIGNoYXJhY3Rlci4gVXNlZnVsIGZvciBoYWNrc1xuICAgIC8vIHRoYXQgd2FudCB0byBpbnNwZWN0IHRoZSBtb2RlIHN0YXRlIChzYXksIGZvciBjb21wbGV0aW9uKS5cbiAgICBnZXRUb2tlbkF0OiBmdW5jdGlvbihwb3MsIHByZWNpc2UpIHtcbiAgICAgIHZhciBkb2MgPSB0aGlzLmRvYztcbiAgICAgIHBvcyA9IGNsaXBQb3MoZG9jLCBwb3MpO1xuICAgICAgdmFyIHN0YXRlID0gZ2V0U3RhdGVCZWZvcmUodGhpcywgcG9zLmxpbmUsIHByZWNpc2UpLCBtb2RlID0gdGhpcy5kb2MubW9kZTtcbiAgICAgIHZhciBsaW5lID0gZ2V0TGluZShkb2MsIHBvcy5saW5lKTtcbiAgICAgIHZhciBzdHJlYW0gPSBuZXcgU3RyaW5nU3RyZWFtKGxpbmUudGV4dCwgdGhpcy5vcHRpb25zLnRhYlNpemUpO1xuICAgICAgd2hpbGUgKHN0cmVhbS5wb3MgPCBwb3MuY2ggJiYgIXN0cmVhbS5lb2woKSkge1xuICAgICAgICBzdHJlYW0uc3RhcnQgPSBzdHJlYW0ucG9zO1xuICAgICAgICB2YXIgc3R5bGUgPSByZWFkVG9rZW4obW9kZSwgc3RyZWFtLCBzdGF0ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4ge3N0YXJ0OiBzdHJlYW0uc3RhcnQsXG4gICAgICAgICAgICAgIGVuZDogc3RyZWFtLnBvcyxcbiAgICAgICAgICAgICAgc3RyaW5nOiBzdHJlYW0uY3VycmVudCgpLFxuICAgICAgICAgICAgICB0eXBlOiBzdHlsZSB8fCBudWxsLFxuICAgICAgICAgICAgICBzdGF0ZTogc3RhdGV9O1xuICAgIH0sXG5cbiAgICBnZXRUb2tlblR5cGVBdDogZnVuY3Rpb24ocG9zKSB7XG4gICAgICBwb3MgPSBjbGlwUG9zKHRoaXMuZG9jLCBwb3MpO1xuICAgICAgdmFyIHN0eWxlcyA9IGdldExpbmVTdHlsZXModGhpcywgZ2V0TGluZSh0aGlzLmRvYywgcG9zLmxpbmUpKTtcbiAgICAgIHZhciBiZWZvcmUgPSAwLCBhZnRlciA9IChzdHlsZXMubGVuZ3RoIC0gMSkgLyAyLCBjaCA9IHBvcy5jaDtcbiAgICAgIHZhciB0eXBlO1xuICAgICAgaWYgKGNoID09IDApIHR5cGUgPSBzdHlsZXNbMl07XG4gICAgICBlbHNlIGZvciAoOzspIHtcbiAgICAgICAgdmFyIG1pZCA9IChiZWZvcmUgKyBhZnRlcikgPj4gMTtcbiAgICAgICAgaWYgKChtaWQgPyBzdHlsZXNbbWlkICogMiAtIDFdIDogMCkgPj0gY2gpIGFmdGVyID0gbWlkO1xuICAgICAgICBlbHNlIGlmIChzdHlsZXNbbWlkICogMiArIDFdIDwgY2gpIGJlZm9yZSA9IG1pZCArIDE7XG4gICAgICAgIGVsc2UgeyB0eXBlID0gc3R5bGVzW21pZCAqIDIgKyAyXTsgYnJlYWs7IH1cbiAgICAgIH1cbiAgICAgIHZhciBjdXQgPSB0eXBlID8gdHlwZS5pbmRleE9mKFwiY20tb3ZlcmxheSBcIikgOiAtMTtcbiAgICAgIHJldHVybiBjdXQgPCAwID8gdHlwZSA6IGN1dCA9PSAwID8gbnVsbCA6IHR5cGUuc2xpY2UoMCwgY3V0IC0gMSk7XG4gICAgfSxcblxuICAgIGdldE1vZGVBdDogZnVuY3Rpb24ocG9zKSB7XG4gICAgICB2YXIgbW9kZSA9IHRoaXMuZG9jLm1vZGU7XG4gICAgICBpZiAoIW1vZGUuaW5uZXJNb2RlKSByZXR1cm4gbW9kZTtcbiAgICAgIHJldHVybiBDb2RlTWlycm9yLmlubmVyTW9kZShtb2RlLCB0aGlzLmdldFRva2VuQXQocG9zKS5zdGF0ZSkubW9kZTtcbiAgICB9LFxuXG4gICAgZ2V0SGVscGVyOiBmdW5jdGlvbihwb3MsIHR5cGUpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEhlbHBlcnMocG9zLCB0eXBlKVswXTtcbiAgICB9LFxuXG4gICAgZ2V0SGVscGVyczogZnVuY3Rpb24ocG9zLCB0eXBlKSB7XG4gICAgICB2YXIgZm91bmQgPSBbXTtcbiAgICAgIGlmICghaGVscGVycy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkgcmV0dXJuIGhlbHBlcnM7XG4gICAgICB2YXIgaGVscCA9IGhlbHBlcnNbdHlwZV0sIG1vZGUgPSB0aGlzLmdldE1vZGVBdChwb3MpO1xuICAgICAgaWYgKHR5cGVvZiBtb2RlW3R5cGVdID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgaWYgKGhlbHBbbW9kZVt0eXBlXV0pIGZvdW5kLnB1c2goaGVscFttb2RlW3R5cGVdXSk7XG4gICAgICB9IGVsc2UgaWYgKG1vZGVbdHlwZV0pIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb2RlW3R5cGVdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIHZhbCA9IGhlbHBbbW9kZVt0eXBlXVtpXV07XG4gICAgICAgICAgaWYgKHZhbCkgZm91bmQucHVzaCh2YWwpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKG1vZGUuaGVscGVyVHlwZSAmJiBoZWxwW21vZGUuaGVscGVyVHlwZV0pIHtcbiAgICAgICAgZm91bmQucHVzaChoZWxwW21vZGUuaGVscGVyVHlwZV0pO1xuICAgICAgfSBlbHNlIGlmIChoZWxwW21vZGUubmFtZV0pIHtcbiAgICAgICAgZm91bmQucHVzaChoZWxwW21vZGUubmFtZV0pO1xuICAgICAgfVxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBoZWxwLl9nbG9iYWwubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGN1ciA9IGhlbHAuX2dsb2JhbFtpXTtcbiAgICAgICAgaWYgKGN1ci5wcmVkKG1vZGUsIHRoaXMpICYmIGluZGV4T2YoZm91bmQsIGN1ci52YWwpID09IC0xKVxuICAgICAgICAgIGZvdW5kLnB1c2goY3VyLnZhbCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZm91bmQ7XG4gICAgfSxcblxuICAgIGdldFN0YXRlQWZ0ZXI6IGZ1bmN0aW9uKGxpbmUsIHByZWNpc2UpIHtcbiAgICAgIHZhciBkb2MgPSB0aGlzLmRvYztcbiAgICAgIGxpbmUgPSBjbGlwTGluZShkb2MsIGxpbmUgPT0gbnVsbCA/IGRvYy5maXJzdCArIGRvYy5zaXplIC0gMTogbGluZSk7XG4gICAgICByZXR1cm4gZ2V0U3RhdGVCZWZvcmUodGhpcywgbGluZSArIDEsIHByZWNpc2UpO1xuICAgIH0sXG5cbiAgICBjdXJzb3JDb29yZHM6IGZ1bmN0aW9uKHN0YXJ0LCBtb2RlKSB7XG4gICAgICB2YXIgcG9zLCByYW5nZSA9IHRoaXMuZG9jLnNlbC5wcmltYXJ5KCk7XG4gICAgICBpZiAoc3RhcnQgPT0gbnVsbCkgcG9zID0gcmFuZ2UuaGVhZDtcbiAgICAgIGVsc2UgaWYgKHR5cGVvZiBzdGFydCA9PSBcIm9iamVjdFwiKSBwb3MgPSBjbGlwUG9zKHRoaXMuZG9jLCBzdGFydCk7XG4gICAgICBlbHNlIHBvcyA9IHN0YXJ0ID8gcmFuZ2UuZnJvbSgpIDogcmFuZ2UudG8oKTtcbiAgICAgIHJldHVybiBjdXJzb3JDb29yZHModGhpcywgcG9zLCBtb2RlIHx8IFwicGFnZVwiKTtcbiAgICB9LFxuXG4gICAgY2hhckNvb3JkczogZnVuY3Rpb24ocG9zLCBtb2RlKSB7XG4gICAgICByZXR1cm4gY2hhckNvb3Jkcyh0aGlzLCBjbGlwUG9zKHRoaXMuZG9jLCBwb3MpLCBtb2RlIHx8IFwicGFnZVwiKTtcbiAgICB9LFxuXG4gICAgY29vcmRzQ2hhcjogZnVuY3Rpb24oY29vcmRzLCBtb2RlKSB7XG4gICAgICBjb29yZHMgPSBmcm9tQ29vcmRTeXN0ZW0odGhpcywgY29vcmRzLCBtb2RlIHx8IFwicGFnZVwiKTtcbiAgICAgIHJldHVybiBjb29yZHNDaGFyKHRoaXMsIGNvb3Jkcy5sZWZ0LCBjb29yZHMudG9wKTtcbiAgICB9LFxuXG4gICAgbGluZUF0SGVpZ2h0OiBmdW5jdGlvbihoZWlnaHQsIG1vZGUpIHtcbiAgICAgIGhlaWdodCA9IGZyb21Db29yZFN5c3RlbSh0aGlzLCB7dG9wOiBoZWlnaHQsIGxlZnQ6IDB9LCBtb2RlIHx8IFwicGFnZVwiKS50b3A7XG4gICAgICByZXR1cm4gbGluZUF0SGVpZ2h0KHRoaXMuZG9jLCBoZWlnaHQgKyB0aGlzLmRpc3BsYXkudmlld09mZnNldCk7XG4gICAgfSxcbiAgICBoZWlnaHRBdExpbmU6IGZ1bmN0aW9uKGxpbmUsIG1vZGUpIHtcbiAgICAgIHZhciBlbmQgPSBmYWxzZSwgbGFzdCA9IHRoaXMuZG9jLmZpcnN0ICsgdGhpcy5kb2Muc2l6ZSAtIDE7XG4gICAgICBpZiAobGluZSA8IHRoaXMuZG9jLmZpcnN0KSBsaW5lID0gdGhpcy5kb2MuZmlyc3Q7XG4gICAgICBlbHNlIGlmIChsaW5lID4gbGFzdCkgeyBsaW5lID0gbGFzdDsgZW5kID0gdHJ1ZTsgfVxuICAgICAgdmFyIGxpbmVPYmogPSBnZXRMaW5lKHRoaXMuZG9jLCBsaW5lKTtcbiAgICAgIHJldHVybiBpbnRvQ29vcmRTeXN0ZW0odGhpcywgbGluZU9iaiwge3RvcDogMCwgbGVmdDogMH0sIG1vZGUgfHwgXCJwYWdlXCIpLnRvcCArXG4gICAgICAgIChlbmQgPyB0aGlzLmRvYy5oZWlnaHQgLSBoZWlnaHRBdExpbmUobGluZU9iaikgOiAwKTtcbiAgICB9LFxuXG4gICAgZGVmYXVsdFRleHRIZWlnaHQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGV4dEhlaWdodCh0aGlzLmRpc3BsYXkpOyB9LFxuICAgIGRlZmF1bHRDaGFyV2lkdGg6IGZ1bmN0aW9uKCkgeyByZXR1cm4gY2hhcldpZHRoKHRoaXMuZGlzcGxheSk7IH0sXG5cbiAgICBzZXRHdXR0ZXJNYXJrZXI6IG1ldGhvZE9wKGZ1bmN0aW9uKGxpbmUsIGd1dHRlcklELCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIGNoYW5nZUxpbmUodGhpcywgbGluZSwgXCJndXR0ZXJcIiwgZnVuY3Rpb24obGluZSkge1xuICAgICAgICB2YXIgbWFya2VycyA9IGxpbmUuZ3V0dGVyTWFya2VycyB8fCAobGluZS5ndXR0ZXJNYXJrZXJzID0ge30pO1xuICAgICAgICBtYXJrZXJzW2d1dHRlcklEXSA9IHZhbHVlO1xuICAgICAgICBpZiAoIXZhbHVlICYmIGlzRW1wdHkobWFya2VycykpIGxpbmUuZ3V0dGVyTWFya2VycyA9IG51bGw7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSk7XG4gICAgfSksXG5cbiAgICBjbGVhckd1dHRlcjogbWV0aG9kT3AoZnVuY3Rpb24oZ3V0dGVySUQpIHtcbiAgICAgIHZhciBjbSA9IHRoaXMsIGRvYyA9IGNtLmRvYywgaSA9IGRvYy5maXJzdDtcbiAgICAgIGRvYy5pdGVyKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgaWYgKGxpbmUuZ3V0dGVyTWFya2VycyAmJiBsaW5lLmd1dHRlck1hcmtlcnNbZ3V0dGVySURdKSB7XG4gICAgICAgICAgbGluZS5ndXR0ZXJNYXJrZXJzW2d1dHRlcklEXSA9IG51bGw7XG4gICAgICAgICAgcmVnTGluZUNoYW5nZShjbSwgaSwgXCJndXR0ZXJcIik7XG4gICAgICAgICAgaWYgKGlzRW1wdHkobGluZS5ndXR0ZXJNYXJrZXJzKSkgbGluZS5ndXR0ZXJNYXJrZXJzID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICArK2k7XG4gICAgICB9KTtcbiAgICB9KSxcblxuICAgIGFkZExpbmVDbGFzczogbWV0aG9kT3AoZnVuY3Rpb24oaGFuZGxlLCB3aGVyZSwgY2xzKSB7XG4gICAgICByZXR1cm4gY2hhbmdlTGluZSh0aGlzLCBoYW5kbGUsIFwiY2xhc3NcIiwgZnVuY3Rpb24obGluZSkge1xuICAgICAgICB2YXIgcHJvcCA9IHdoZXJlID09IFwidGV4dFwiID8gXCJ0ZXh0Q2xhc3NcIiA6IHdoZXJlID09IFwiYmFja2dyb3VuZFwiID8gXCJiZ0NsYXNzXCIgOiBcIndyYXBDbGFzc1wiO1xuICAgICAgICBpZiAoIWxpbmVbcHJvcF0pIGxpbmVbcHJvcF0gPSBjbHM7XG4gICAgICAgIGVsc2UgaWYgKG5ldyBSZWdFeHAoXCIoPzpefFxcXFxzKVwiICsgY2xzICsgXCIoPzokfFxcXFxzKVwiKS50ZXN0KGxpbmVbcHJvcF0pKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGVsc2UgbGluZVtwcm9wXSArPSBcIiBcIiArIGNscztcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9KTtcbiAgICB9KSxcblxuICAgIHJlbW92ZUxpbmVDbGFzczogbWV0aG9kT3AoZnVuY3Rpb24oaGFuZGxlLCB3aGVyZSwgY2xzKSB7XG4gICAgICByZXR1cm4gY2hhbmdlTGluZSh0aGlzLCBoYW5kbGUsIFwiY2xhc3NcIiwgZnVuY3Rpb24obGluZSkge1xuICAgICAgICB2YXIgcHJvcCA9IHdoZXJlID09IFwidGV4dFwiID8gXCJ0ZXh0Q2xhc3NcIiA6IHdoZXJlID09IFwiYmFja2dyb3VuZFwiID8gXCJiZ0NsYXNzXCIgOiBcIndyYXBDbGFzc1wiO1xuICAgICAgICB2YXIgY3VyID0gbGluZVtwcm9wXTtcbiAgICAgICAgaWYgKCFjdXIpIHJldHVybiBmYWxzZTtcbiAgICAgICAgZWxzZSBpZiAoY2xzID09IG51bGwpIGxpbmVbcHJvcF0gPSBudWxsO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB2YXIgZm91bmQgPSBjdXIubWF0Y2gobmV3IFJlZ0V4cChcIig/Ol58XFxcXHMrKVwiICsgY2xzICsgXCIoPzokfFxcXFxzKylcIikpO1xuICAgICAgICAgIGlmICghZm91bmQpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB2YXIgZW5kID0gZm91bmQuaW5kZXggKyBmb3VuZFswXS5sZW5ndGg7XG4gICAgICAgICAgbGluZVtwcm9wXSA9IGN1ci5zbGljZSgwLCBmb3VuZC5pbmRleCkgKyAoIWZvdW5kLmluZGV4IHx8IGVuZCA9PSBjdXIubGVuZ3RoID8gXCJcIiA6IFwiIFwiKSArIGN1ci5zbGljZShlbmQpIHx8IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9KTtcbiAgICB9KSxcblxuICAgIGFkZExpbmVXaWRnZXQ6IG1ldGhvZE9wKGZ1bmN0aW9uKGhhbmRsZSwgbm9kZSwgb3B0aW9ucykge1xuICAgICAgcmV0dXJuIGFkZExpbmVXaWRnZXQodGhpcywgaGFuZGxlLCBub2RlLCBvcHRpb25zKTtcbiAgICB9KSxcblxuICAgIHJlbW92ZUxpbmVXaWRnZXQ6IGZ1bmN0aW9uKHdpZGdldCkgeyB3aWRnZXQuY2xlYXIoKTsgfSxcblxuICAgIGxpbmVJbmZvOiBmdW5jdGlvbihsaW5lKSB7XG4gICAgICBpZiAodHlwZW9mIGxpbmUgPT0gXCJudW1iZXJcIikge1xuICAgICAgICBpZiAoIWlzTGluZSh0aGlzLmRvYywgbGluZSkpIHJldHVybiBudWxsO1xuICAgICAgICB2YXIgbiA9IGxpbmU7XG4gICAgICAgIGxpbmUgPSBnZXRMaW5lKHRoaXMuZG9jLCBsaW5lKTtcbiAgICAgICAgaWYgKCFsaW5lKSByZXR1cm4gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBuID0gbGluZU5vKGxpbmUpO1xuICAgICAgICBpZiAobiA9PSBudWxsKSByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7bGluZTogbiwgaGFuZGxlOiBsaW5lLCB0ZXh0OiBsaW5lLnRleHQsIGd1dHRlck1hcmtlcnM6IGxpbmUuZ3V0dGVyTWFya2VycyxcbiAgICAgICAgICAgICAgdGV4dENsYXNzOiBsaW5lLnRleHRDbGFzcywgYmdDbGFzczogbGluZS5iZ0NsYXNzLCB3cmFwQ2xhc3M6IGxpbmUud3JhcENsYXNzLFxuICAgICAgICAgICAgICB3aWRnZXRzOiBsaW5lLndpZGdldHN9O1xuICAgIH0sXG5cbiAgICBnZXRWaWV3cG9ydDogZnVuY3Rpb24oKSB7IHJldHVybiB7ZnJvbTogdGhpcy5kaXNwbGF5LnZpZXdGcm9tLCB0bzogdGhpcy5kaXNwbGF5LnZpZXdUb307fSxcblxuICAgIGFkZFdpZGdldDogZnVuY3Rpb24ocG9zLCBub2RlLCBzY3JvbGwsIHZlcnQsIGhvcml6KSB7XG4gICAgICB2YXIgZGlzcGxheSA9IHRoaXMuZGlzcGxheTtcbiAgICAgIHBvcyA9IGN1cnNvckNvb3Jkcyh0aGlzLCBjbGlwUG9zKHRoaXMuZG9jLCBwb3MpKTtcbiAgICAgIHZhciB0b3AgPSBwb3MuYm90dG9tLCBsZWZ0ID0gcG9zLmxlZnQ7XG4gICAgICBub2RlLnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuICAgICAgZGlzcGxheS5zaXplci5hcHBlbmRDaGlsZChub2RlKTtcbiAgICAgIGlmICh2ZXJ0ID09IFwib3ZlclwiKSB7XG4gICAgICAgIHRvcCA9IHBvcy50b3A7XG4gICAgICB9IGVsc2UgaWYgKHZlcnQgPT0gXCJhYm92ZVwiIHx8IHZlcnQgPT0gXCJuZWFyXCIpIHtcbiAgICAgICAgdmFyIHZzcGFjZSA9IE1hdGgubWF4KGRpc3BsYXkud3JhcHBlci5jbGllbnRIZWlnaHQsIHRoaXMuZG9jLmhlaWdodCksXG4gICAgICAgIGhzcGFjZSA9IE1hdGgubWF4KGRpc3BsYXkuc2l6ZXIuY2xpZW50V2lkdGgsIGRpc3BsYXkubGluZVNwYWNlLmNsaWVudFdpZHRoKTtcbiAgICAgICAgLy8gRGVmYXVsdCB0byBwb3NpdGlvbmluZyBhYm92ZSAoaWYgc3BlY2lmaWVkIGFuZCBwb3NzaWJsZSk7IG90aGVyd2lzZSBkZWZhdWx0IHRvIHBvc2l0aW9uaW5nIGJlbG93XG4gICAgICAgIGlmICgodmVydCA9PSAnYWJvdmUnIHx8IHBvcy5ib3R0b20gKyBub2RlLm9mZnNldEhlaWdodCA+IHZzcGFjZSkgJiYgcG9zLnRvcCA+IG5vZGUub2Zmc2V0SGVpZ2h0KVxuICAgICAgICAgIHRvcCA9IHBvcy50b3AgLSBub2RlLm9mZnNldEhlaWdodDtcbiAgICAgICAgZWxzZSBpZiAocG9zLmJvdHRvbSArIG5vZGUub2Zmc2V0SGVpZ2h0IDw9IHZzcGFjZSlcbiAgICAgICAgICB0b3AgPSBwb3MuYm90dG9tO1xuICAgICAgICBpZiAobGVmdCArIG5vZGUub2Zmc2V0V2lkdGggPiBoc3BhY2UpXG4gICAgICAgICAgbGVmdCA9IGhzcGFjZSAtIG5vZGUub2Zmc2V0V2lkdGg7XG4gICAgICB9XG4gICAgICBub2RlLnN0eWxlLnRvcCA9IHRvcCArIFwicHhcIjtcbiAgICAgIG5vZGUuc3R5bGUubGVmdCA9IG5vZGUuc3R5bGUucmlnaHQgPSBcIlwiO1xuICAgICAgaWYgKGhvcml6ID09IFwicmlnaHRcIikge1xuICAgICAgICBsZWZ0ID0gZGlzcGxheS5zaXplci5jbGllbnRXaWR0aCAtIG5vZGUub2Zmc2V0V2lkdGg7XG4gICAgICAgIG5vZGUuc3R5bGUucmlnaHQgPSBcIjBweFwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGhvcml6ID09IFwibGVmdFwiKSBsZWZ0ID0gMDtcbiAgICAgICAgZWxzZSBpZiAoaG9yaXogPT0gXCJtaWRkbGVcIikgbGVmdCA9IChkaXNwbGF5LnNpemVyLmNsaWVudFdpZHRoIC0gbm9kZS5vZmZzZXRXaWR0aCkgLyAyO1xuICAgICAgICBub2RlLnN0eWxlLmxlZnQgPSBsZWZ0ICsgXCJweFwiO1xuICAgICAgfVxuICAgICAgaWYgKHNjcm9sbClcbiAgICAgICAgc2Nyb2xsSW50b1ZpZXcodGhpcywgbGVmdCwgdG9wLCBsZWZ0ICsgbm9kZS5vZmZzZXRXaWR0aCwgdG9wICsgbm9kZS5vZmZzZXRIZWlnaHQpO1xuICAgIH0sXG5cbiAgICB0cmlnZ2VyT25LZXlEb3duOiBtZXRob2RPcChvbktleURvd24pLFxuICAgIHRyaWdnZXJPbktleVByZXNzOiBtZXRob2RPcChvbktleVByZXNzKSxcbiAgICB0cmlnZ2VyT25LZXlVcDogbWV0aG9kT3Aob25LZXlVcCksXG5cbiAgICBleGVjQ29tbWFuZDogZnVuY3Rpb24oY21kKSB7XG4gICAgICBpZiAoY29tbWFuZHMuaGFzT3duUHJvcGVydHkoY21kKSlcbiAgICAgICAgcmV0dXJuIGNvbW1hbmRzW2NtZF0odGhpcyk7XG4gICAgfSxcblxuICAgIGZpbmRQb3NIOiBmdW5jdGlvbihmcm9tLCBhbW91bnQsIHVuaXQsIHZpc3VhbGx5KSB7XG4gICAgICB2YXIgZGlyID0gMTtcbiAgICAgIGlmIChhbW91bnQgPCAwKSB7IGRpciA9IC0xOyBhbW91bnQgPSAtYW1vdW50OyB9XG4gICAgICBmb3IgKHZhciBpID0gMCwgY3VyID0gY2xpcFBvcyh0aGlzLmRvYywgZnJvbSk7IGkgPCBhbW91bnQ7ICsraSkge1xuICAgICAgICBjdXIgPSBmaW5kUG9zSCh0aGlzLmRvYywgY3VyLCBkaXIsIHVuaXQsIHZpc3VhbGx5KTtcbiAgICAgICAgaWYgKGN1ci5oaXRTaWRlKSBicmVhaztcbiAgICAgIH1cbiAgICAgIHJldHVybiBjdXI7XG4gICAgfSxcblxuICAgIG1vdmVIOiBtZXRob2RPcChmdW5jdGlvbihkaXIsIHVuaXQpIHtcbiAgICAgIHZhciBjbSA9IHRoaXM7XG4gICAgICBjbS5leHRlbmRTZWxlY3Rpb25zQnkoZnVuY3Rpb24ocmFuZ2UpIHtcbiAgICAgICAgaWYgKGNtLmRpc3BsYXkuc2hpZnQgfHwgY20uZG9jLmV4dGVuZCB8fCByYW5nZS5lbXB0eSgpKVxuICAgICAgICAgIHJldHVybiBmaW5kUG9zSChjbS5kb2MsIHJhbmdlLmhlYWQsIGRpciwgdW5pdCwgY20ub3B0aW9ucy5ydGxNb3ZlVmlzdWFsbHkpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0dXJuIGRpciA8IDAgPyByYW5nZS5mcm9tKCkgOiByYW5nZS50bygpO1xuICAgICAgfSwgc2VsX21vdmUpO1xuICAgIH0pLFxuXG4gICAgZGVsZXRlSDogbWV0aG9kT3AoZnVuY3Rpb24oZGlyLCB1bml0KSB7XG4gICAgICB2YXIgc2VsID0gdGhpcy5kb2Muc2VsLCBkb2MgPSB0aGlzLmRvYztcbiAgICAgIGlmIChzZWwuc29tZXRoaW5nU2VsZWN0ZWQoKSlcbiAgICAgICAgZG9jLnJlcGxhY2VTZWxlY3Rpb24oXCJcIiwgbnVsbCwgXCIrZGVsZXRlXCIpO1xuICAgICAgZWxzZVxuICAgICAgICBkZWxldGVOZWFyU2VsZWN0aW9uKHRoaXMsIGZ1bmN0aW9uKHJhbmdlKSB7XG4gICAgICAgICAgdmFyIG90aGVyID0gZmluZFBvc0goZG9jLCByYW5nZS5oZWFkLCBkaXIsIHVuaXQsIGZhbHNlKTtcbiAgICAgICAgICByZXR1cm4gZGlyIDwgMCA/IHtmcm9tOiBvdGhlciwgdG86IHJhbmdlLmhlYWR9IDoge2Zyb206IHJhbmdlLmhlYWQsIHRvOiBvdGhlcn07XG4gICAgICAgIH0pO1xuICAgIH0pLFxuXG4gICAgZmluZFBvc1Y6IGZ1bmN0aW9uKGZyb20sIGFtb3VudCwgdW5pdCwgZ29hbENvbHVtbikge1xuICAgICAgdmFyIGRpciA9IDEsIHggPSBnb2FsQ29sdW1uO1xuICAgICAgaWYgKGFtb3VudCA8IDApIHsgZGlyID0gLTE7IGFtb3VudCA9IC1hbW91bnQ7IH1cbiAgICAgIGZvciAodmFyIGkgPSAwLCBjdXIgPSBjbGlwUG9zKHRoaXMuZG9jLCBmcm9tKTsgaSA8IGFtb3VudDsgKytpKSB7XG4gICAgICAgIHZhciBjb29yZHMgPSBjdXJzb3JDb29yZHModGhpcywgY3VyLCBcImRpdlwiKTtcbiAgICAgICAgaWYgKHggPT0gbnVsbCkgeCA9IGNvb3Jkcy5sZWZ0O1xuICAgICAgICBlbHNlIGNvb3Jkcy5sZWZ0ID0geDtcbiAgICAgICAgY3VyID0gZmluZFBvc1YodGhpcywgY29vcmRzLCBkaXIsIHVuaXQpO1xuICAgICAgICBpZiAoY3VyLmhpdFNpZGUpIGJyZWFrO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGN1cjtcbiAgICB9LFxuXG4gICAgbW92ZVY6IG1ldGhvZE9wKGZ1bmN0aW9uKGRpciwgdW5pdCkge1xuICAgICAgdmFyIGNtID0gdGhpcywgZG9jID0gdGhpcy5kb2MsIGdvYWxzID0gW107XG4gICAgICB2YXIgY29sbGFwc2UgPSAhY20uZGlzcGxheS5zaGlmdCAmJiAhZG9jLmV4dGVuZCAmJiBkb2Muc2VsLnNvbWV0aGluZ1NlbGVjdGVkKCk7XG4gICAgICBkb2MuZXh0ZW5kU2VsZWN0aW9uc0J5KGZ1bmN0aW9uKHJhbmdlKSB7XG4gICAgICAgIGlmIChjb2xsYXBzZSlcbiAgICAgICAgICByZXR1cm4gZGlyIDwgMCA/IHJhbmdlLmZyb20oKSA6IHJhbmdlLnRvKCk7XG4gICAgICAgIHZhciBoZWFkUG9zID0gY3Vyc29yQ29vcmRzKGNtLCByYW5nZS5oZWFkLCBcImRpdlwiKTtcbiAgICAgICAgaWYgKHJhbmdlLmdvYWxDb2x1bW4gIT0gbnVsbCkgaGVhZFBvcy5sZWZ0ID0gcmFuZ2UuZ29hbENvbHVtbjtcbiAgICAgICAgZ29hbHMucHVzaChoZWFkUG9zLmxlZnQpO1xuICAgICAgICB2YXIgcG9zID0gZmluZFBvc1YoY20sIGhlYWRQb3MsIGRpciwgdW5pdCk7XG4gICAgICAgIGlmICh1bml0ID09IFwicGFnZVwiICYmIHJhbmdlID09IGRvYy5zZWwucHJpbWFyeSgpKVxuICAgICAgICAgIGFkZFRvU2Nyb2xsUG9zKGNtLCBudWxsLCBjaGFyQ29vcmRzKGNtLCBwb3MsIFwiZGl2XCIpLnRvcCAtIGhlYWRQb3MudG9wKTtcbiAgICAgICAgcmV0dXJuIHBvcztcbiAgICAgIH0sIHNlbF9tb3ZlKTtcbiAgICAgIGlmIChnb2Fscy5sZW5ndGgpIGZvciAodmFyIGkgPSAwOyBpIDwgZG9jLnNlbC5yYW5nZXMubGVuZ3RoOyBpKyspXG4gICAgICAgIGRvYy5zZWwucmFuZ2VzW2ldLmdvYWxDb2x1bW4gPSBnb2Fsc1tpXTtcbiAgICB9KSxcblxuICAgIHRvZ2dsZU92ZXJ3cml0ZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmICh2YWx1ZSAhPSBudWxsICYmIHZhbHVlID09IHRoaXMuc3RhdGUub3ZlcndyaXRlKSByZXR1cm47XG4gICAgICBpZiAodGhpcy5zdGF0ZS5vdmVyd3JpdGUgPSAhdGhpcy5zdGF0ZS5vdmVyd3JpdGUpXG4gICAgICAgIGFkZENsYXNzKHRoaXMuZGlzcGxheS5jdXJzb3JEaXYsIFwiQ29kZU1pcnJvci1vdmVyd3JpdGVcIik7XG4gICAgICBlbHNlXG4gICAgICAgIHJtQ2xhc3ModGhpcy5kaXNwbGF5LmN1cnNvckRpdiwgXCJDb2RlTWlycm9yLW92ZXJ3cml0ZVwiKTtcblxuICAgICAgc2lnbmFsKHRoaXMsIFwib3ZlcndyaXRlVG9nZ2xlXCIsIHRoaXMsIHRoaXMuc3RhdGUub3ZlcndyaXRlKTtcbiAgICB9LFxuICAgIGhhc0ZvY3VzOiBmdW5jdGlvbigpIHsgcmV0dXJuIGFjdGl2ZUVsdCgpID09IHRoaXMuZGlzcGxheS5pbnB1dDsgfSxcblxuICAgIHNjcm9sbFRvOiBtZXRob2RPcChmdW5jdGlvbih4LCB5KSB7XG4gICAgICBpZiAoeCAhPSBudWxsIHx8IHkgIT0gbnVsbCkgcmVzb2x2ZVNjcm9sbFRvUG9zKHRoaXMpO1xuICAgICAgaWYgKHggIT0gbnVsbCkgdGhpcy5jdXJPcC5zY3JvbGxMZWZ0ID0geDtcbiAgICAgIGlmICh5ICE9IG51bGwpIHRoaXMuY3VyT3Auc2Nyb2xsVG9wID0geTtcbiAgICB9KSxcbiAgICBnZXRTY3JvbGxJbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzY3JvbGxlciA9IHRoaXMuZGlzcGxheS5zY3JvbGxlciwgY28gPSBzY3JvbGxlckN1dE9mZjtcbiAgICAgIHJldHVybiB7bGVmdDogc2Nyb2xsZXIuc2Nyb2xsTGVmdCwgdG9wOiBzY3JvbGxlci5zY3JvbGxUb3AsXG4gICAgICAgICAgICAgIGhlaWdodDogc2Nyb2xsZXIuc2Nyb2xsSGVpZ2h0IC0gY28sIHdpZHRoOiBzY3JvbGxlci5zY3JvbGxXaWR0aCAtIGNvLFxuICAgICAgICAgICAgICBjbGllbnRIZWlnaHQ6IHNjcm9sbGVyLmNsaWVudEhlaWdodCAtIGNvLCBjbGllbnRXaWR0aDogc2Nyb2xsZXIuY2xpZW50V2lkdGggLSBjb307XG4gICAgfSxcblxuICAgIHNjcm9sbEludG9WaWV3OiBtZXRob2RPcChmdW5jdGlvbihyYW5nZSwgbWFyZ2luKSB7XG4gICAgICBpZiAocmFuZ2UgPT0gbnVsbCkge1xuICAgICAgICByYW5nZSA9IHtmcm9tOiB0aGlzLmRvYy5zZWwucHJpbWFyeSgpLmhlYWQsIHRvOiBudWxsfTtcbiAgICAgICAgaWYgKG1hcmdpbiA9PSBudWxsKSBtYXJnaW4gPSB0aGlzLm9wdGlvbnMuY3Vyc29yU2Nyb2xsTWFyZ2luO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgcmFuZ2UgPT0gXCJudW1iZXJcIikge1xuICAgICAgICByYW5nZSA9IHtmcm9tOiBQb3MocmFuZ2UsIDApLCB0bzogbnVsbH07XG4gICAgICB9IGVsc2UgaWYgKHJhbmdlLmZyb20gPT0gbnVsbCkge1xuICAgICAgICByYW5nZSA9IHtmcm9tOiByYW5nZSwgdG86IG51bGx9O1xuICAgICAgfVxuICAgICAgaWYgKCFyYW5nZS50bykgcmFuZ2UudG8gPSByYW5nZS5mcm9tO1xuICAgICAgcmFuZ2UubWFyZ2luID0gbWFyZ2luIHx8IDA7XG5cbiAgICAgIGlmIChyYW5nZS5mcm9tLmxpbmUgIT0gbnVsbCkge1xuICAgICAgICByZXNvbHZlU2Nyb2xsVG9Qb3ModGhpcyk7XG4gICAgICAgIHRoaXMuY3VyT3Auc2Nyb2xsVG9Qb3MgPSByYW5nZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBzUG9zID0gY2FsY3VsYXRlU2Nyb2xsUG9zKHRoaXMsIE1hdGgubWluKHJhbmdlLmZyb20ubGVmdCwgcmFuZ2UudG8ubGVmdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGgubWluKHJhbmdlLmZyb20udG9wLCByYW5nZS50by50b3ApIC0gcmFuZ2UubWFyZ2luLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLm1heChyYW5nZS5mcm9tLnJpZ2h0LCByYW5nZS50by5yaWdodCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGgubWF4KHJhbmdlLmZyb20uYm90dG9tLCByYW5nZS50by5ib3R0b20pICsgcmFuZ2UubWFyZ2luKTtcbiAgICAgICAgdGhpcy5zY3JvbGxUbyhzUG9zLnNjcm9sbExlZnQsIHNQb3Muc2Nyb2xsVG9wKTtcbiAgICAgIH1cbiAgICB9KSxcblxuICAgIHNldFNpemU6IG1ldGhvZE9wKGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgIGZ1bmN0aW9uIGludGVycHJldCh2YWwpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiB2YWwgPT0gXCJudW1iZXJcIiB8fCAvXlxcZCskLy50ZXN0KFN0cmluZyh2YWwpKSA/IHZhbCArIFwicHhcIiA6IHZhbDtcbiAgICAgIH1cbiAgICAgIGlmICh3aWR0aCAhPSBudWxsKSB0aGlzLmRpc3BsYXkud3JhcHBlci5zdHlsZS53aWR0aCA9IGludGVycHJldCh3aWR0aCk7XG4gICAgICBpZiAoaGVpZ2h0ICE9IG51bGwpIHRoaXMuZGlzcGxheS53cmFwcGVyLnN0eWxlLmhlaWdodCA9IGludGVycHJldChoZWlnaHQpO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5saW5lV3JhcHBpbmcpIGNsZWFyTGluZU1lYXN1cmVtZW50Q2FjaGUodGhpcyk7XG4gICAgICB0aGlzLmN1ck9wLmZvcmNlVXBkYXRlID0gdHJ1ZTtcbiAgICAgIHNpZ25hbCh0aGlzLCBcInJlZnJlc2hcIiwgdGhpcyk7XG4gICAgfSksXG5cbiAgICBvcGVyYXRpb246IGZ1bmN0aW9uKGYpe3JldHVybiBydW5Jbk9wKHRoaXMsIGYpO30sXG5cbiAgICByZWZyZXNoOiBtZXRob2RPcChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBvbGRIZWlnaHQgPSB0aGlzLmRpc3BsYXkuY2FjaGVkVGV4dEhlaWdodDtcbiAgICAgIHJlZ0NoYW5nZSh0aGlzKTtcbiAgICAgIHRoaXMuY3VyT3AuZm9yY2VVcGRhdGUgPSB0cnVlO1xuICAgICAgY2xlYXJDYWNoZXModGhpcyk7XG4gICAgICB0aGlzLnNjcm9sbFRvKHRoaXMuZG9jLnNjcm9sbExlZnQsIHRoaXMuZG9jLnNjcm9sbFRvcCk7XG4gICAgICB1cGRhdGVHdXR0ZXJTcGFjZSh0aGlzKTtcbiAgICAgIGlmIChvbGRIZWlnaHQgPT0gbnVsbCB8fCBNYXRoLmFicyhvbGRIZWlnaHQgLSB0ZXh0SGVpZ2h0KHRoaXMuZGlzcGxheSkpID4gLjUpXG4gICAgICAgIGVzdGltYXRlTGluZUhlaWdodHModGhpcyk7XG4gICAgICBzaWduYWwodGhpcywgXCJyZWZyZXNoXCIsIHRoaXMpO1xuICAgIH0pLFxuXG4gICAgc3dhcERvYzogbWV0aG9kT3AoZnVuY3Rpb24oZG9jKSB7XG4gICAgICB2YXIgb2xkID0gdGhpcy5kb2M7XG4gICAgICBvbGQuY20gPSBudWxsO1xuICAgICAgYXR0YWNoRG9jKHRoaXMsIGRvYyk7XG4gICAgICBjbGVhckNhY2hlcyh0aGlzKTtcbiAgICAgIHJlc2V0SW5wdXQodGhpcyk7XG4gICAgICB0aGlzLnNjcm9sbFRvKGRvYy5zY3JvbGxMZWZ0LCBkb2Muc2Nyb2xsVG9wKTtcbiAgICAgIHNpZ25hbExhdGVyKHRoaXMsIFwic3dhcERvY1wiLCB0aGlzLCBvbGQpO1xuICAgICAgcmV0dXJuIG9sZDtcbiAgICB9KSxcblxuICAgIGdldElucHV0RmllbGQ6IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZGlzcGxheS5pbnB1dDt9LFxuICAgIGdldFdyYXBwZXJFbGVtZW50OiBmdW5jdGlvbigpe3JldHVybiB0aGlzLmRpc3BsYXkud3JhcHBlcjt9LFxuICAgIGdldFNjcm9sbGVyRWxlbWVudDogZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5kaXNwbGF5LnNjcm9sbGVyO30sXG4gICAgZ2V0R3V0dGVyRWxlbWVudDogZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5kaXNwbGF5Lmd1dHRlcnM7fVxuICB9O1xuICBldmVudE1peGluKENvZGVNaXJyb3IpO1xuXG4gIC8vIE9QVElPTiBERUZBVUxUU1xuXG4gIC8vIFRoZSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gb3B0aW9ucy5cbiAgdmFyIGRlZmF1bHRzID0gQ29kZU1pcnJvci5kZWZhdWx0cyA9IHt9O1xuICAvLyBGdW5jdGlvbnMgdG8gcnVuIHdoZW4gb3B0aW9ucyBhcmUgY2hhbmdlZC5cbiAgdmFyIG9wdGlvbkhhbmRsZXJzID0gQ29kZU1pcnJvci5vcHRpb25IYW5kbGVycyA9IHt9O1xuXG4gIGZ1bmN0aW9uIG9wdGlvbihuYW1lLCBkZWZsdCwgaGFuZGxlLCBub3RPbkluaXQpIHtcbiAgICBDb2RlTWlycm9yLmRlZmF1bHRzW25hbWVdID0gZGVmbHQ7XG4gICAgaWYgKGhhbmRsZSkgb3B0aW9uSGFuZGxlcnNbbmFtZV0gPVxuICAgICAgbm90T25Jbml0ID8gZnVuY3Rpb24oY20sIHZhbCwgb2xkKSB7aWYgKG9sZCAhPSBJbml0KSBoYW5kbGUoY20sIHZhbCwgb2xkKTt9IDogaGFuZGxlO1xuICB9XG5cbiAgLy8gUGFzc2VkIHRvIG9wdGlvbiBoYW5kbGVycyB3aGVuIHRoZXJlIGlzIG5vIG9sZCB2YWx1ZS5cbiAgdmFyIEluaXQgPSBDb2RlTWlycm9yLkluaXQgPSB7dG9TdHJpbmc6IGZ1bmN0aW9uKCl7cmV0dXJuIFwiQ29kZU1pcnJvci5Jbml0XCI7fX07XG5cbiAgLy8gVGhlc2UgdHdvIGFyZSwgb24gaW5pdCwgY2FsbGVkIGZyb20gdGhlIGNvbnN0cnVjdG9yIGJlY2F1c2UgdGhleVxuICAvLyBoYXZlIHRvIGJlIGluaXRpYWxpemVkIGJlZm9yZSB0aGUgZWRpdG9yIGNhbiBzdGFydCBhdCBhbGwuXG4gIG9wdGlvbihcInZhbHVlXCIsIFwiXCIsIGZ1bmN0aW9uKGNtLCB2YWwpIHtcbiAgICBjbS5zZXRWYWx1ZSh2YWwpO1xuICB9LCB0cnVlKTtcbiAgb3B0aW9uKFwibW9kZVwiLCBudWxsLCBmdW5jdGlvbihjbSwgdmFsKSB7XG4gICAgY20uZG9jLm1vZGVPcHRpb24gPSB2YWw7XG4gICAgbG9hZE1vZGUoY20pO1xuICB9LCB0cnVlKTtcblxuICBvcHRpb24oXCJpbmRlbnRVbml0XCIsIDIsIGxvYWRNb2RlLCB0cnVlKTtcbiAgb3B0aW9uKFwiaW5kZW50V2l0aFRhYnNcIiwgZmFsc2UpO1xuICBvcHRpb24oXCJzbWFydEluZGVudFwiLCB0cnVlKTtcbiAgb3B0aW9uKFwidGFiU2l6ZVwiLCA0LCBmdW5jdGlvbihjbSkge1xuICAgIHJlc2V0TW9kZVN0YXRlKGNtKTtcbiAgICBjbGVhckNhY2hlcyhjbSk7XG4gICAgcmVnQ2hhbmdlKGNtKTtcbiAgfSwgdHJ1ZSk7XG4gIG9wdGlvbihcInNwZWNpYWxDaGFyc1wiLCAvW1xcdFxcdTAwMDAtXFx1MDAxOVxcdTAwYWRcXHUyMDBiXFx1MjAyOFxcdTIwMjlcXHVmZWZmXS9nLCBmdW5jdGlvbihjbSwgdmFsKSB7XG4gICAgY20ub3B0aW9ucy5zcGVjaWFsQ2hhcnMgPSBuZXcgUmVnRXhwKHZhbC5zb3VyY2UgKyAodmFsLnRlc3QoXCJcXHRcIikgPyBcIlwiIDogXCJ8XFx0XCIpLCBcImdcIik7XG4gICAgY20ucmVmcmVzaCgpO1xuICB9LCB0cnVlKTtcbiAgb3B0aW9uKFwic3BlY2lhbENoYXJQbGFjZWhvbGRlclwiLCBkZWZhdWx0U3BlY2lhbENoYXJQbGFjZWhvbGRlciwgZnVuY3Rpb24oY20pIHtjbS5yZWZyZXNoKCk7fSwgdHJ1ZSk7XG4gIG9wdGlvbihcImVsZWN0cmljQ2hhcnNcIiwgdHJ1ZSk7XG4gIG9wdGlvbihcInJ0bE1vdmVWaXN1YWxseVwiLCAhd2luZG93cyk7XG4gIG9wdGlvbihcIndob2xlTGluZVVwZGF0ZUJlZm9yZVwiLCB0cnVlKTtcblxuICBvcHRpb24oXCJ0aGVtZVwiLCBcImRlZmF1bHRcIiwgZnVuY3Rpb24oY20pIHtcbiAgICB0aGVtZUNoYW5nZWQoY20pO1xuICAgIGd1dHRlcnNDaGFuZ2VkKGNtKTtcbiAgfSwgdHJ1ZSk7XG4gIG9wdGlvbihcImtleU1hcFwiLCBcImRlZmF1bHRcIiwga2V5TWFwQ2hhbmdlZCk7XG4gIG9wdGlvbihcImV4dHJhS2V5c1wiLCBudWxsKTtcblxuICBvcHRpb24oXCJsaW5lV3JhcHBpbmdcIiwgZmFsc2UsIHdyYXBwaW5nQ2hhbmdlZCwgdHJ1ZSk7XG4gIG9wdGlvbihcImd1dHRlcnNcIiwgW10sIGZ1bmN0aW9uKGNtKSB7XG4gICAgc2V0R3V0dGVyc0ZvckxpbmVOdW1iZXJzKGNtLm9wdGlvbnMpO1xuICAgIGd1dHRlcnNDaGFuZ2VkKGNtKTtcbiAgfSwgdHJ1ZSk7XG4gIG9wdGlvbihcImZpeGVkR3V0dGVyXCIsIHRydWUsIGZ1bmN0aW9uKGNtLCB2YWwpIHtcbiAgICBjbS5kaXNwbGF5Lmd1dHRlcnMuc3R5bGUubGVmdCA9IHZhbCA/IGNvbXBlbnNhdGVGb3JIU2Nyb2xsKGNtLmRpc3BsYXkpICsgXCJweFwiIDogXCIwXCI7XG4gICAgY20ucmVmcmVzaCgpO1xuICB9LCB0cnVlKTtcbiAgb3B0aW9uKFwiY292ZXJHdXR0ZXJOZXh0VG9TY3JvbGxiYXJcIiwgZmFsc2UsIHVwZGF0ZVNjcm9sbGJhcnMsIHRydWUpO1xuICBvcHRpb24oXCJsaW5lTnVtYmVyc1wiLCBmYWxzZSwgZnVuY3Rpb24oY20pIHtcbiAgICBzZXRHdXR0ZXJzRm9yTGluZU51bWJlcnMoY20ub3B0aW9ucyk7XG4gICAgZ3V0dGVyc0NoYW5nZWQoY20pO1xuICB9LCB0cnVlKTtcbiAgb3B0aW9uKFwiZmlyc3RMaW5lTnVtYmVyXCIsIDEsIGd1dHRlcnNDaGFuZ2VkLCB0cnVlKTtcbiAgb3B0aW9uKFwibGluZU51bWJlckZvcm1hdHRlclwiLCBmdW5jdGlvbihpbnRlZ2VyKSB7cmV0dXJuIGludGVnZXI7fSwgZ3V0dGVyc0NoYW5nZWQsIHRydWUpO1xuICBvcHRpb24oXCJzaG93Q3Vyc29yV2hlblNlbGVjdGluZ1wiLCBmYWxzZSwgdXBkYXRlU2VsZWN0aW9uLCB0cnVlKTtcblxuICBvcHRpb24oXCJyZXNldFNlbGVjdGlvbk9uQ29udGV4dE1lbnVcIiwgdHJ1ZSk7XG5cbiAgb3B0aW9uKFwicmVhZE9ubHlcIiwgZmFsc2UsIGZ1bmN0aW9uKGNtLCB2YWwpIHtcbiAgICBpZiAodmFsID09IFwibm9jdXJzb3JcIikge1xuICAgICAgb25CbHVyKGNtKTtcbiAgICAgIGNtLmRpc3BsYXkuaW5wdXQuYmx1cigpO1xuICAgICAgY20uZGlzcGxheS5kaXNhYmxlZCA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNtLmRpc3BsYXkuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgIGlmICghdmFsKSByZXNldElucHV0KGNtKTtcbiAgICB9XG4gIH0pO1xuICBvcHRpb24oXCJkaXNhYmxlSW5wdXRcIiwgZmFsc2UsIGZ1bmN0aW9uKGNtLCB2YWwpIHtpZiAoIXZhbCkgcmVzZXRJbnB1dChjbSk7fSwgdHJ1ZSk7XG4gIG9wdGlvbihcImRyYWdEcm9wXCIsIHRydWUpO1xuXG4gIG9wdGlvbihcImN1cnNvckJsaW5rUmF0ZVwiLCA1MzApO1xuICBvcHRpb24oXCJjdXJzb3JTY3JvbGxNYXJnaW5cIiwgMCk7XG4gIG9wdGlvbihcImN1cnNvckhlaWdodFwiLCAxKTtcbiAgb3B0aW9uKFwid29ya1RpbWVcIiwgMTAwKTtcbiAgb3B0aW9uKFwid29ya0RlbGF5XCIsIDEwMCk7XG4gIG9wdGlvbihcImZsYXR0ZW5TcGFuc1wiLCB0cnVlLCByZXNldE1vZGVTdGF0ZSwgdHJ1ZSk7XG4gIG9wdGlvbihcImFkZE1vZGVDbGFzc1wiLCBmYWxzZSwgcmVzZXRNb2RlU3RhdGUsIHRydWUpO1xuICBvcHRpb24oXCJwb2xsSW50ZXJ2YWxcIiwgMTAwKTtcbiAgb3B0aW9uKFwidW5kb0RlcHRoXCIsIDIwMCwgZnVuY3Rpb24oY20sIHZhbCl7Y20uZG9jLmhpc3RvcnkudW5kb0RlcHRoID0gdmFsO30pO1xuICBvcHRpb24oXCJoaXN0b3J5RXZlbnREZWxheVwiLCAxMjUwKTtcbiAgb3B0aW9uKFwidmlld3BvcnRNYXJnaW5cIiwgMTAsIGZ1bmN0aW9uKGNtKXtjbS5yZWZyZXNoKCk7fSwgdHJ1ZSk7XG4gIG9wdGlvbihcIm1heEhpZ2hsaWdodExlbmd0aFwiLCAxMDAwMCwgcmVzZXRNb2RlU3RhdGUsIHRydWUpO1xuICBvcHRpb24oXCJtb3ZlSW5wdXRXaXRoQ3Vyc29yXCIsIHRydWUsIGZ1bmN0aW9uKGNtLCB2YWwpIHtcbiAgICBpZiAoIXZhbCkgY20uZGlzcGxheS5pbnB1dERpdi5zdHlsZS50b3AgPSBjbS5kaXNwbGF5LmlucHV0RGl2LnN0eWxlLmxlZnQgPSAwO1xuICB9KTtcblxuICBvcHRpb24oXCJ0YWJpbmRleFwiLCBudWxsLCBmdW5jdGlvbihjbSwgdmFsKSB7XG4gICAgY20uZGlzcGxheS5pbnB1dC50YWJJbmRleCA9IHZhbCB8fCBcIlwiO1xuICB9KTtcbiAgb3B0aW9uKFwiYXV0b2ZvY3VzXCIsIG51bGwpO1xuXG4gIC8vIE1PREUgREVGSU5JVElPTiBBTkQgUVVFUllJTkdcblxuICAvLyBLbm93biBtb2RlcywgYnkgbmFtZSBhbmQgYnkgTUlNRVxuICB2YXIgbW9kZXMgPSBDb2RlTWlycm9yLm1vZGVzID0ge30sIG1pbWVNb2RlcyA9IENvZGVNaXJyb3IubWltZU1vZGVzID0ge307XG5cbiAgLy8gRXh0cmEgYXJndW1lbnRzIGFyZSBzdG9yZWQgYXMgdGhlIG1vZGUncyBkZXBlbmRlbmNpZXMsIHdoaWNoIGlzXG4gIC8vIHVzZWQgYnkgKGxlZ2FjeSkgbWVjaGFuaXNtcyBsaWtlIGxvYWRtb2RlLmpzIHRvIGF1dG9tYXRpY2FsbHlcbiAgLy8gbG9hZCBhIG1vZGUuIChQcmVmZXJyZWQgbWVjaGFuaXNtIGlzIHRoZSByZXF1aXJlL2RlZmluZSBjYWxscy4pXG4gIENvZGVNaXJyb3IuZGVmaW5lTW9kZSA9IGZ1bmN0aW9uKG5hbWUsIG1vZGUpIHtcbiAgICBpZiAoIUNvZGVNaXJyb3IuZGVmYXVsdHMubW9kZSAmJiBuYW1lICE9IFwibnVsbFwiKSBDb2RlTWlycm9yLmRlZmF1bHRzLm1vZGUgPSBuYW1lO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMikge1xuICAgICAgbW9kZS5kZXBlbmRlbmNpZXMgPSBbXTtcbiAgICAgIGZvciAodmFyIGkgPSAyOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgKytpKSBtb2RlLmRlcGVuZGVuY2llcy5wdXNoKGFyZ3VtZW50c1tpXSk7XG4gICAgfVxuICAgIG1vZGVzW25hbWVdID0gbW9kZTtcbiAgfTtcblxuICBDb2RlTWlycm9yLmRlZmluZU1JTUUgPSBmdW5jdGlvbihtaW1lLCBzcGVjKSB7XG4gICAgbWltZU1vZGVzW21pbWVdID0gc3BlYztcbiAgfTtcblxuICAvLyBHaXZlbiBhIE1JTUUgdHlwZSwgYSB7bmFtZSwgLi4ub3B0aW9uc30gY29uZmlnIG9iamVjdCwgb3IgYSBuYW1lXG4gIC8vIHN0cmluZywgcmV0dXJuIGEgbW9kZSBjb25maWcgb2JqZWN0LlxuICBDb2RlTWlycm9yLnJlc29sdmVNb2RlID0gZnVuY3Rpb24oc3BlYykge1xuICAgIGlmICh0eXBlb2Ygc3BlYyA9PSBcInN0cmluZ1wiICYmIG1pbWVNb2Rlcy5oYXNPd25Qcm9wZXJ0eShzcGVjKSkge1xuICAgICAgc3BlYyA9IG1pbWVNb2Rlc1tzcGVjXTtcbiAgICB9IGVsc2UgaWYgKHNwZWMgJiYgdHlwZW9mIHNwZWMubmFtZSA9PSBcInN0cmluZ1wiICYmIG1pbWVNb2Rlcy5oYXNPd25Qcm9wZXJ0eShzcGVjLm5hbWUpKSB7XG4gICAgICB2YXIgZm91bmQgPSBtaW1lTW9kZXNbc3BlYy5uYW1lXTtcbiAgICAgIGlmICh0eXBlb2YgZm91bmQgPT0gXCJzdHJpbmdcIikgZm91bmQgPSB7bmFtZTogZm91bmR9O1xuICAgICAgc3BlYyA9IGNyZWF0ZU9iaihmb3VuZCwgc3BlYyk7XG4gICAgICBzcGVjLm5hbWUgPSBmb3VuZC5uYW1lO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHNwZWMgPT0gXCJzdHJpbmdcIiAmJiAvXltcXHdcXC1dK1xcL1tcXHdcXC1dK1xcK3htbCQvLnRlc3Qoc3BlYykpIHtcbiAgICAgIHJldHVybiBDb2RlTWlycm9yLnJlc29sdmVNb2RlKFwiYXBwbGljYXRpb24veG1sXCIpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHNwZWMgPT0gXCJzdHJpbmdcIikgcmV0dXJuIHtuYW1lOiBzcGVjfTtcbiAgICBlbHNlIHJldHVybiBzcGVjIHx8IHtuYW1lOiBcIm51bGxcIn07XG4gIH07XG5cbiAgLy8gR2l2ZW4gYSBtb2RlIHNwZWMgKGFueXRoaW5nIHRoYXQgcmVzb2x2ZU1vZGUgYWNjZXB0cyksIGZpbmQgYW5kXG4gIC8vIGluaXRpYWxpemUgYW4gYWN0dWFsIG1vZGUgb2JqZWN0LlxuICBDb2RlTWlycm9yLmdldE1vZGUgPSBmdW5jdGlvbihvcHRpb25zLCBzcGVjKSB7XG4gICAgdmFyIHNwZWMgPSBDb2RlTWlycm9yLnJlc29sdmVNb2RlKHNwZWMpO1xuICAgIHZhciBtZmFjdG9yeSA9IG1vZGVzW3NwZWMubmFtZV07XG4gICAgaWYgKCFtZmFjdG9yeSkgcmV0dXJuIENvZGVNaXJyb3IuZ2V0TW9kZShvcHRpb25zLCBcInRleHQvcGxhaW5cIik7XG4gICAgdmFyIG1vZGVPYmogPSBtZmFjdG9yeShvcHRpb25zLCBzcGVjKTtcbiAgICBpZiAobW9kZUV4dGVuc2lvbnMuaGFzT3duUHJvcGVydHkoc3BlYy5uYW1lKSkge1xuICAgICAgdmFyIGV4dHMgPSBtb2RlRXh0ZW5zaW9uc1tzcGVjLm5hbWVdO1xuICAgICAgZm9yICh2YXIgcHJvcCBpbiBleHRzKSB7XG4gICAgICAgIGlmICghZXh0cy5oYXNPd25Qcm9wZXJ0eShwcm9wKSkgY29udGludWU7XG4gICAgICAgIGlmIChtb2RlT2JqLmhhc093blByb3BlcnR5KHByb3ApKSBtb2RlT2JqW1wiX1wiICsgcHJvcF0gPSBtb2RlT2JqW3Byb3BdO1xuICAgICAgICBtb2RlT2JqW3Byb3BdID0gZXh0c1twcm9wXTtcbiAgICAgIH1cbiAgICB9XG4gICAgbW9kZU9iai5uYW1lID0gc3BlYy5uYW1lO1xuICAgIGlmIChzcGVjLmhlbHBlclR5cGUpIG1vZGVPYmouaGVscGVyVHlwZSA9IHNwZWMuaGVscGVyVHlwZTtcbiAgICBpZiAoc3BlYy5tb2RlUHJvcHMpIGZvciAodmFyIHByb3AgaW4gc3BlYy5tb2RlUHJvcHMpXG4gICAgICBtb2RlT2JqW3Byb3BdID0gc3BlYy5tb2RlUHJvcHNbcHJvcF07XG5cbiAgICByZXR1cm4gbW9kZU9iajtcbiAgfTtcblxuICAvLyBNaW5pbWFsIGRlZmF1bHQgbW9kZS5cbiAgQ29kZU1pcnJvci5kZWZpbmVNb2RlKFwibnVsbFwiLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge3Rva2VuOiBmdW5jdGlvbihzdHJlYW0pIHtzdHJlYW0uc2tpcFRvRW5kKCk7fX07XG4gIH0pO1xuICBDb2RlTWlycm9yLmRlZmluZU1JTUUoXCJ0ZXh0L3BsYWluXCIsIFwibnVsbFwiKTtcblxuICAvLyBUaGlzIGNhbiBiZSB1c2VkIHRvIGF0dGFjaCBwcm9wZXJ0aWVzIHRvIG1vZGUgb2JqZWN0cyBmcm9tXG4gIC8vIG91dHNpZGUgdGhlIGFjdHVhbCBtb2RlIGRlZmluaXRpb24uXG4gIHZhciBtb2RlRXh0ZW5zaW9ucyA9IENvZGVNaXJyb3IubW9kZUV4dGVuc2lvbnMgPSB7fTtcbiAgQ29kZU1pcnJvci5leHRlbmRNb2RlID0gZnVuY3Rpb24obW9kZSwgcHJvcGVydGllcykge1xuICAgIHZhciBleHRzID0gbW9kZUV4dGVuc2lvbnMuaGFzT3duUHJvcGVydHkobW9kZSkgPyBtb2RlRXh0ZW5zaW9uc1ttb2RlXSA6IChtb2RlRXh0ZW5zaW9uc1ttb2RlXSA9IHt9KTtcbiAgICBjb3B5T2JqKHByb3BlcnRpZXMsIGV4dHMpO1xuICB9O1xuXG4gIC8vIEVYVEVOU0lPTlNcblxuICBDb2RlTWlycm9yLmRlZmluZUV4dGVuc2lvbiA9IGZ1bmN0aW9uKG5hbWUsIGZ1bmMpIHtcbiAgICBDb2RlTWlycm9yLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmM7XG4gIH07XG4gIENvZGVNaXJyb3IuZGVmaW5lRG9jRXh0ZW5zaW9uID0gZnVuY3Rpb24obmFtZSwgZnVuYykge1xuICAgIERvYy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jO1xuICB9O1xuICBDb2RlTWlycm9yLmRlZmluZU9wdGlvbiA9IG9wdGlvbjtcblxuICB2YXIgaW5pdEhvb2tzID0gW107XG4gIENvZGVNaXJyb3IuZGVmaW5lSW5pdEhvb2sgPSBmdW5jdGlvbihmKSB7aW5pdEhvb2tzLnB1c2goZik7fTtcblxuICB2YXIgaGVscGVycyA9IENvZGVNaXJyb3IuaGVscGVycyA9IHt9O1xuICBDb2RlTWlycm9yLnJlZ2lzdGVySGVscGVyID0gZnVuY3Rpb24odHlwZSwgbmFtZSwgdmFsdWUpIHtcbiAgICBpZiAoIWhlbHBlcnMuaGFzT3duUHJvcGVydHkodHlwZSkpIGhlbHBlcnNbdHlwZV0gPSBDb2RlTWlycm9yW3R5cGVdID0ge19nbG9iYWw6IFtdfTtcbiAgICBoZWxwZXJzW3R5cGVdW25hbWVdID0gdmFsdWU7XG4gIH07XG4gIENvZGVNaXJyb3IucmVnaXN0ZXJHbG9iYWxIZWxwZXIgPSBmdW5jdGlvbih0eXBlLCBuYW1lLCBwcmVkaWNhdGUsIHZhbHVlKSB7XG4gICAgQ29kZU1pcnJvci5yZWdpc3RlckhlbHBlcih0eXBlLCBuYW1lLCB2YWx1ZSk7XG4gICAgaGVscGVyc1t0eXBlXS5fZ2xvYmFsLnB1c2goe3ByZWQ6IHByZWRpY2F0ZSwgdmFsOiB2YWx1ZX0pO1xuICB9O1xuXG4gIC8vIE1PREUgU1RBVEUgSEFORExJTkdcblxuICAvLyBVdGlsaXR5IGZ1bmN0aW9ucyBmb3Igd29ya2luZyB3aXRoIHN0YXRlLiBFeHBvcnRlZCBiZWNhdXNlIG5lc3RlZFxuICAvLyBtb2RlcyBuZWVkIHRvIGRvIHRoaXMgZm9yIHRoZWlyIGlubmVyIG1vZGVzLlxuXG4gIHZhciBjb3B5U3RhdGUgPSBDb2RlTWlycm9yLmNvcHlTdGF0ZSA9IGZ1bmN0aW9uKG1vZGUsIHN0YXRlKSB7XG4gICAgaWYgKHN0YXRlID09PSB0cnVlKSByZXR1cm4gc3RhdGU7XG4gICAgaWYgKG1vZGUuY29weVN0YXRlKSByZXR1cm4gbW9kZS5jb3B5U3RhdGUoc3RhdGUpO1xuICAgIHZhciBuc3RhdGUgPSB7fTtcbiAgICBmb3IgKHZhciBuIGluIHN0YXRlKSB7XG4gICAgICB2YXIgdmFsID0gc3RhdGVbbl07XG4gICAgICBpZiAodmFsIGluc3RhbmNlb2YgQXJyYXkpIHZhbCA9IHZhbC5jb25jYXQoW10pO1xuICAgICAgbnN0YXRlW25dID0gdmFsO1xuICAgIH1cbiAgICByZXR1cm4gbnN0YXRlO1xuICB9O1xuXG4gIHZhciBzdGFydFN0YXRlID0gQ29kZU1pcnJvci5zdGFydFN0YXRlID0gZnVuY3Rpb24obW9kZSwgYTEsIGEyKSB7XG4gICAgcmV0dXJuIG1vZGUuc3RhcnRTdGF0ZSA/IG1vZGUuc3RhcnRTdGF0ZShhMSwgYTIpIDogdHJ1ZTtcbiAgfTtcblxuICAvLyBHaXZlbiBhIG1vZGUgYW5kIGEgc3RhdGUgKGZvciB0aGF0IG1vZGUpLCBmaW5kIHRoZSBpbm5lciBtb2RlIGFuZFxuICAvLyBzdGF0ZSBhdCB0aGUgcG9zaXRpb24gdGhhdCB0aGUgc3RhdGUgcmVmZXJzIHRvLlxuICBDb2RlTWlycm9yLmlubmVyTW9kZSA9IGZ1bmN0aW9uKG1vZGUsIHN0YXRlKSB7XG4gICAgd2hpbGUgKG1vZGUuaW5uZXJNb2RlKSB7XG4gICAgICB2YXIgaW5mbyA9IG1vZGUuaW5uZXJNb2RlKHN0YXRlKTtcbiAgICAgIGlmICghaW5mbyB8fCBpbmZvLm1vZGUgPT0gbW9kZSkgYnJlYWs7XG4gICAgICBzdGF0ZSA9IGluZm8uc3RhdGU7XG4gICAgICBtb2RlID0gaW5mby5tb2RlO1xuICAgIH1cbiAgICByZXR1cm4gaW5mbyB8fCB7bW9kZTogbW9kZSwgc3RhdGU6IHN0YXRlfTtcbiAgfTtcblxuICAvLyBTVEFOREFSRCBDT01NQU5EU1xuXG4gIC8vIENvbW1hbmRzIGFyZSBwYXJhbWV0ZXItbGVzcyBhY3Rpb25zIHRoYXQgY2FuIGJlIHBlcmZvcm1lZCBvbiBhblxuICAvLyBlZGl0b3IsIG1vc3RseSB1c2VkIGZvciBrZXliaW5kaW5ncy5cbiAgdmFyIGNvbW1hbmRzID0gQ29kZU1pcnJvci5jb21tYW5kcyA9IHtcbiAgICBzZWxlY3RBbGw6IGZ1bmN0aW9uKGNtKSB7Y20uc2V0U2VsZWN0aW9uKFBvcyhjbS5maXJzdExpbmUoKSwgMCksIFBvcyhjbS5sYXN0TGluZSgpKSwgc2VsX2RvbnRTY3JvbGwpO30sXG4gICAgc2luZ2xlU2VsZWN0aW9uOiBmdW5jdGlvbihjbSkge1xuICAgICAgY20uc2V0U2VsZWN0aW9uKGNtLmdldEN1cnNvcihcImFuY2hvclwiKSwgY20uZ2V0Q3Vyc29yKFwiaGVhZFwiKSwgc2VsX2RvbnRTY3JvbGwpO1xuICAgIH0sXG4gICAga2lsbExpbmU6IGZ1bmN0aW9uKGNtKSB7XG4gICAgICBkZWxldGVOZWFyU2VsZWN0aW9uKGNtLCBmdW5jdGlvbihyYW5nZSkge1xuICAgICAgICBpZiAocmFuZ2UuZW1wdHkoKSkge1xuICAgICAgICAgIHZhciBsZW4gPSBnZXRMaW5lKGNtLmRvYywgcmFuZ2UuaGVhZC5saW5lKS50ZXh0Lmxlbmd0aDtcbiAgICAgICAgICBpZiAocmFuZ2UuaGVhZC5jaCA9PSBsZW4gJiYgcmFuZ2UuaGVhZC5saW5lIDwgY20ubGFzdExpbmUoKSlcbiAgICAgICAgICAgIHJldHVybiB7ZnJvbTogcmFuZ2UuaGVhZCwgdG86IFBvcyhyYW5nZS5oZWFkLmxpbmUgKyAxLCAwKX07XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIHtmcm9tOiByYW5nZS5oZWFkLCB0bzogUG9zKHJhbmdlLmhlYWQubGluZSwgbGVuKX07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHtmcm9tOiByYW5nZS5mcm9tKCksIHRvOiByYW5nZS50bygpfTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSxcbiAgICBkZWxldGVMaW5lOiBmdW5jdGlvbihjbSkge1xuICAgICAgZGVsZXRlTmVhclNlbGVjdGlvbihjbSwgZnVuY3Rpb24ocmFuZ2UpIHtcbiAgICAgICAgcmV0dXJuIHtmcm9tOiBQb3MocmFuZ2UuZnJvbSgpLmxpbmUsIDApLFxuICAgICAgICAgICAgICAgIHRvOiBjbGlwUG9zKGNtLmRvYywgUG9zKHJhbmdlLnRvKCkubGluZSArIDEsIDApKX07XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGRlbExpbmVMZWZ0OiBmdW5jdGlvbihjbSkge1xuICAgICAgZGVsZXRlTmVhclNlbGVjdGlvbihjbSwgZnVuY3Rpb24ocmFuZ2UpIHtcbiAgICAgICAgcmV0dXJuIHtmcm9tOiBQb3MocmFuZ2UuZnJvbSgpLmxpbmUsIDApLCB0bzogcmFuZ2UuZnJvbSgpfTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgdW5kbzogZnVuY3Rpb24oY20pIHtjbS51bmRvKCk7fSxcbiAgICByZWRvOiBmdW5jdGlvbihjbSkge2NtLnJlZG8oKTt9LFxuICAgIHVuZG9TZWxlY3Rpb246IGZ1bmN0aW9uKGNtKSB7Y20udW5kb1NlbGVjdGlvbigpO30sXG4gICAgcmVkb1NlbGVjdGlvbjogZnVuY3Rpb24oY20pIHtjbS5yZWRvU2VsZWN0aW9uKCk7fSxcbiAgICBnb0RvY1N0YXJ0OiBmdW5jdGlvbihjbSkge2NtLmV4dGVuZFNlbGVjdGlvbihQb3MoY20uZmlyc3RMaW5lKCksIDApKTt9LFxuICAgIGdvRG9jRW5kOiBmdW5jdGlvbihjbSkge2NtLmV4dGVuZFNlbGVjdGlvbihQb3MoY20ubGFzdExpbmUoKSkpO30sXG4gICAgZ29MaW5lU3RhcnQ6IGZ1bmN0aW9uKGNtKSB7XG4gICAgICBjbS5leHRlbmRTZWxlY3Rpb25zQnkoZnVuY3Rpb24ocmFuZ2UpIHsgcmV0dXJuIGxpbmVTdGFydChjbSwgcmFuZ2UuaGVhZC5saW5lKTsgfSwgc2VsX21vdmUpO1xuICAgIH0sXG4gICAgZ29MaW5lU3RhcnRTbWFydDogZnVuY3Rpb24oY20pIHtcbiAgICAgIGNtLmV4dGVuZFNlbGVjdGlvbnNCeShmdW5jdGlvbihyYW5nZSkge1xuICAgICAgICB2YXIgc3RhcnQgPSBsaW5lU3RhcnQoY20sIHJhbmdlLmhlYWQubGluZSk7XG4gICAgICAgIHZhciBsaW5lID0gY20uZ2V0TGluZUhhbmRsZShzdGFydC5saW5lKTtcbiAgICAgICAgdmFyIG9yZGVyID0gZ2V0T3JkZXIobGluZSk7XG4gICAgICAgIGlmICghb3JkZXIgfHwgb3JkZXJbMF0ubGV2ZWwgPT0gMCkge1xuICAgICAgICAgIHZhciBmaXJzdE5vbldTID0gTWF0aC5tYXgoMCwgbGluZS50ZXh0LnNlYXJjaCgvXFxTLykpO1xuICAgICAgICAgIHZhciBpbldTID0gcmFuZ2UuaGVhZC5saW5lID09IHN0YXJ0LmxpbmUgJiYgcmFuZ2UuaGVhZC5jaCA8PSBmaXJzdE5vbldTICYmIHJhbmdlLmhlYWQuY2g7XG4gICAgICAgICAgcmV0dXJuIFBvcyhzdGFydC5saW5lLCBpbldTID8gMCA6IGZpcnN0Tm9uV1MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdGFydDtcbiAgICAgIH0sIHNlbF9tb3ZlKTtcbiAgICB9LFxuICAgIGdvTGluZUVuZDogZnVuY3Rpb24oY20pIHtcbiAgICAgIGNtLmV4dGVuZFNlbGVjdGlvbnNCeShmdW5jdGlvbihyYW5nZSkgeyByZXR1cm4gbGluZUVuZChjbSwgcmFuZ2UuaGVhZC5saW5lKTsgfSwgc2VsX21vdmUpO1xuICAgIH0sXG4gICAgZ29MaW5lUmlnaHQ6IGZ1bmN0aW9uKGNtKSB7XG4gICAgICBjbS5leHRlbmRTZWxlY3Rpb25zQnkoZnVuY3Rpb24ocmFuZ2UpIHtcbiAgICAgICAgdmFyIHRvcCA9IGNtLmNoYXJDb29yZHMocmFuZ2UuaGVhZCwgXCJkaXZcIikudG9wICsgNTtcbiAgICAgICAgcmV0dXJuIGNtLmNvb3Jkc0NoYXIoe2xlZnQ6IGNtLmRpc3BsYXkubGluZURpdi5vZmZzZXRXaWR0aCArIDEwMCwgdG9wOiB0b3B9LCBcImRpdlwiKTtcbiAgICAgIH0sIHNlbF9tb3ZlKTtcbiAgICB9LFxuICAgIGdvTGluZUxlZnQ6IGZ1bmN0aW9uKGNtKSB7XG4gICAgICBjbS5leHRlbmRTZWxlY3Rpb25zQnkoZnVuY3Rpb24ocmFuZ2UpIHtcbiAgICAgICAgdmFyIHRvcCA9IGNtLmNoYXJDb29yZHMocmFuZ2UuaGVhZCwgXCJkaXZcIikudG9wICsgNTtcbiAgICAgICAgcmV0dXJuIGNtLmNvb3Jkc0NoYXIoe2xlZnQ6IDAsIHRvcDogdG9wfSwgXCJkaXZcIik7XG4gICAgICB9LCBzZWxfbW92ZSk7XG4gICAgfSxcbiAgICBnb0xpbmVVcDogZnVuY3Rpb24oY20pIHtjbS5tb3ZlVigtMSwgXCJsaW5lXCIpO30sXG4gICAgZ29MaW5lRG93bjogZnVuY3Rpb24oY20pIHtjbS5tb3ZlVigxLCBcImxpbmVcIik7fSxcbiAgICBnb1BhZ2VVcDogZnVuY3Rpb24oY20pIHtjbS5tb3ZlVigtMSwgXCJwYWdlXCIpO30sXG4gICAgZ29QYWdlRG93bjogZnVuY3Rpb24oY20pIHtjbS5tb3ZlVigxLCBcInBhZ2VcIik7fSxcbiAgICBnb0NoYXJMZWZ0OiBmdW5jdGlvbihjbSkge2NtLm1vdmVIKC0xLCBcImNoYXJcIik7fSxcbiAgICBnb0NoYXJSaWdodDogZnVuY3Rpb24oY20pIHtjbS5tb3ZlSCgxLCBcImNoYXJcIik7fSxcbiAgICBnb0NvbHVtbkxlZnQ6IGZ1bmN0aW9uKGNtKSB7Y20ubW92ZUgoLTEsIFwiY29sdW1uXCIpO30sXG4gICAgZ29Db2x1bW5SaWdodDogZnVuY3Rpb24oY20pIHtjbS5tb3ZlSCgxLCBcImNvbHVtblwiKTt9LFxuICAgIGdvV29yZExlZnQ6IGZ1bmN0aW9uKGNtKSB7Y20ubW92ZUgoLTEsIFwid29yZFwiKTt9LFxuICAgIGdvR3JvdXBSaWdodDogZnVuY3Rpb24oY20pIHtjbS5tb3ZlSCgxLCBcImdyb3VwXCIpO30sXG4gICAgZ29Hcm91cExlZnQ6IGZ1bmN0aW9uKGNtKSB7Y20ubW92ZUgoLTEsIFwiZ3JvdXBcIik7fSxcbiAgICBnb1dvcmRSaWdodDogZnVuY3Rpb24oY20pIHtjbS5tb3ZlSCgxLCBcIndvcmRcIik7fSxcbiAgICBkZWxDaGFyQmVmb3JlOiBmdW5jdGlvbihjbSkge2NtLmRlbGV0ZUgoLTEsIFwiY2hhclwiKTt9LFxuICAgIGRlbENoYXJBZnRlcjogZnVuY3Rpb24oY20pIHtjbS5kZWxldGVIKDEsIFwiY2hhclwiKTt9LFxuICAgIGRlbFdvcmRCZWZvcmU6IGZ1bmN0aW9uKGNtKSB7Y20uZGVsZXRlSCgtMSwgXCJ3b3JkXCIpO30sXG4gICAgZGVsV29yZEFmdGVyOiBmdW5jdGlvbihjbSkge2NtLmRlbGV0ZUgoMSwgXCJ3b3JkXCIpO30sXG4gICAgZGVsR3JvdXBCZWZvcmU6IGZ1bmN0aW9uKGNtKSB7Y20uZGVsZXRlSCgtMSwgXCJncm91cFwiKTt9LFxuICAgIGRlbEdyb3VwQWZ0ZXI6IGZ1bmN0aW9uKGNtKSB7Y20uZGVsZXRlSCgxLCBcImdyb3VwXCIpO30sXG4gICAgaW5kZW50QXV0bzogZnVuY3Rpb24oY20pIHtjbS5pbmRlbnRTZWxlY3Rpb24oXCJzbWFydFwiKTt9LFxuICAgIGluZGVudE1vcmU6IGZ1bmN0aW9uKGNtKSB7Y20uaW5kZW50U2VsZWN0aW9uKFwiYWRkXCIpO30sXG4gICAgaW5kZW50TGVzczogZnVuY3Rpb24oY20pIHtjbS5pbmRlbnRTZWxlY3Rpb24oXCJzdWJ0cmFjdFwiKTt9LFxuICAgIGluc2VydFRhYjogZnVuY3Rpb24oY20pIHtjbS5yZXBsYWNlU2VsZWN0aW9uKFwiXFx0XCIpO30sXG4gICAgaW5zZXJ0U29mdFRhYjogZnVuY3Rpb24oY20pIHtcbiAgICAgIHZhciBzcGFjZXMgPSBbXSwgcmFuZ2VzID0gY20ubGlzdFNlbGVjdGlvbnMoKSwgdGFiU2l6ZSA9IGNtLm9wdGlvbnMudGFiU2l6ZTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBwb3MgPSByYW5nZXNbaV0uZnJvbSgpO1xuICAgICAgICB2YXIgY29sID0gY291bnRDb2x1bW4oY20uZ2V0TGluZShwb3MubGluZSksIHBvcy5jaCwgdGFiU2l6ZSk7XG4gICAgICAgIHNwYWNlcy5wdXNoKG5ldyBBcnJheSh0YWJTaXplIC0gY29sICUgdGFiU2l6ZSArIDEpLmpvaW4oXCIgXCIpKTtcbiAgICAgIH1cbiAgICAgIGNtLnJlcGxhY2VTZWxlY3Rpb25zKHNwYWNlcyk7XG4gICAgfSxcbiAgICBkZWZhdWx0VGFiOiBmdW5jdGlvbihjbSkge1xuICAgICAgaWYgKGNtLnNvbWV0aGluZ1NlbGVjdGVkKCkpIGNtLmluZGVudFNlbGVjdGlvbihcImFkZFwiKTtcbiAgICAgIGVsc2UgY20uZXhlY0NvbW1hbmQoXCJpbnNlcnRUYWJcIik7XG4gICAgfSxcbiAgICB0cmFuc3Bvc2VDaGFyczogZnVuY3Rpb24oY20pIHtcbiAgICAgIHJ1bkluT3AoY20sIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmFuZ2VzID0gY20ubGlzdFNlbGVjdGlvbnMoKSwgbmV3U2VsID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIGN1ciA9IHJhbmdlc1tpXS5oZWFkLCBsaW5lID0gZ2V0TGluZShjbS5kb2MsIGN1ci5saW5lKS50ZXh0O1xuICAgICAgICAgIGlmIChsaW5lKSB7XG4gICAgICAgICAgICBpZiAoY3VyLmNoID09IGxpbmUubGVuZ3RoKSBjdXIgPSBuZXcgUG9zKGN1ci5saW5lLCBjdXIuY2ggLSAxKTtcbiAgICAgICAgICAgIGlmIChjdXIuY2ggPiAwKSB7XG4gICAgICAgICAgICAgIGN1ciA9IG5ldyBQb3MoY3VyLmxpbmUsIGN1ci5jaCArIDEpO1xuICAgICAgICAgICAgICBjbS5yZXBsYWNlUmFuZ2UobGluZS5jaGFyQXQoY3VyLmNoIC0gMSkgKyBsaW5lLmNoYXJBdChjdXIuY2ggLSAyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFBvcyhjdXIubGluZSwgY3VyLmNoIC0gMiksIGN1ciwgXCIrdHJhbnNwb3NlXCIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjdXIubGluZSA+IGNtLmRvYy5maXJzdCkge1xuICAgICAgICAgICAgICB2YXIgcHJldiA9IGdldExpbmUoY20uZG9jLCBjdXIubGluZSAtIDEpLnRleHQ7XG4gICAgICAgICAgICAgIGlmIChwcmV2KVxuICAgICAgICAgICAgICAgIGNtLnJlcGxhY2VSYW5nZShsaW5lLmNoYXJBdCgwKSArIFwiXFxuXCIgKyBwcmV2LmNoYXJBdChwcmV2Lmxlbmd0aCAtIDEpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBQb3MoY3VyLmxpbmUgLSAxLCBwcmV2Lmxlbmd0aCAtIDEpLCBQb3MoY3VyLmxpbmUsIDEpLCBcIit0cmFuc3Bvc2VcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIG5ld1NlbC5wdXNoKG5ldyBSYW5nZShjdXIsIGN1cikpO1xuICAgICAgICB9XG4gICAgICAgIGNtLnNldFNlbGVjdGlvbnMobmV3U2VsKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgbmV3bGluZUFuZEluZGVudDogZnVuY3Rpb24oY20pIHtcbiAgICAgIHJ1bkluT3AoY20sIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbGVuID0gY20ubGlzdFNlbGVjdGlvbnMoKS5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICB2YXIgcmFuZ2UgPSBjbS5saXN0U2VsZWN0aW9ucygpW2ldO1xuICAgICAgICAgIGNtLnJlcGxhY2VSYW5nZShcIlxcblwiLCByYW5nZS5hbmNob3IsIHJhbmdlLmhlYWQsIFwiK2lucHV0XCIpO1xuICAgICAgICAgIGNtLmluZGVudExpbmUocmFuZ2UuZnJvbSgpLmxpbmUgKyAxLCBudWxsLCB0cnVlKTtcbiAgICAgICAgICBlbnN1cmVDdXJzb3JWaXNpYmxlKGNtKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSxcbiAgICB0b2dnbGVPdmVyd3JpdGU6IGZ1bmN0aW9uKGNtKSB7Y20udG9nZ2xlT3ZlcndyaXRlKCk7fVxuICB9O1xuXG4gIC8vIFNUQU5EQVJEIEtFWU1BUFNcblxuICB2YXIga2V5TWFwID0gQ29kZU1pcnJvci5rZXlNYXAgPSB7fTtcbiAga2V5TWFwLmJhc2ljID0ge1xuICAgIFwiTGVmdFwiOiBcImdvQ2hhckxlZnRcIiwgXCJSaWdodFwiOiBcImdvQ2hhclJpZ2h0XCIsIFwiVXBcIjogXCJnb0xpbmVVcFwiLCBcIkRvd25cIjogXCJnb0xpbmVEb3duXCIsXG4gICAgXCJFbmRcIjogXCJnb0xpbmVFbmRcIiwgXCJIb21lXCI6IFwiZ29MaW5lU3RhcnRTbWFydFwiLCBcIlBhZ2VVcFwiOiBcImdvUGFnZVVwXCIsIFwiUGFnZURvd25cIjogXCJnb1BhZ2VEb3duXCIsXG4gICAgXCJEZWxldGVcIjogXCJkZWxDaGFyQWZ0ZXJcIiwgXCJCYWNrc3BhY2VcIjogXCJkZWxDaGFyQmVmb3JlXCIsIFwiU2hpZnQtQmFja3NwYWNlXCI6IFwiZGVsQ2hhckJlZm9yZVwiLFxuICAgIFwiVGFiXCI6IFwiZGVmYXVsdFRhYlwiLCBcIlNoaWZ0LVRhYlwiOiBcImluZGVudEF1dG9cIixcbiAgICBcIkVudGVyXCI6IFwibmV3bGluZUFuZEluZGVudFwiLCBcIkluc2VydFwiOiBcInRvZ2dsZU92ZXJ3cml0ZVwiLFxuICAgIFwiRXNjXCI6IFwic2luZ2xlU2VsZWN0aW9uXCJcbiAgfTtcbiAgLy8gTm90ZSB0aGF0IHRoZSBzYXZlIGFuZCBmaW5kLXJlbGF0ZWQgY29tbWFuZHMgYXJlbid0IGRlZmluZWQgYnlcbiAgLy8gZGVmYXVsdC4gVXNlciBjb2RlIG9yIGFkZG9ucyBjYW4gZGVmaW5lIHRoZW0uIFVua25vd24gY29tbWFuZHNcbiAgLy8gYXJlIHNpbXBseSBpZ25vcmVkLlxuICBrZXlNYXAucGNEZWZhdWx0ID0ge1xuICAgIFwiQ3RybC1BXCI6IFwic2VsZWN0QWxsXCIsIFwiQ3RybC1EXCI6IFwiZGVsZXRlTGluZVwiLCBcIkN0cmwtWlwiOiBcInVuZG9cIiwgXCJTaGlmdC1DdHJsLVpcIjogXCJyZWRvXCIsIFwiQ3RybC1ZXCI6IFwicmVkb1wiLFxuICAgIFwiQ3RybC1Ib21lXCI6IFwiZ29Eb2NTdGFydFwiLCBcIkN0cmwtVXBcIjogXCJnb0RvY1N0YXJ0XCIsIFwiQ3RybC1FbmRcIjogXCJnb0RvY0VuZFwiLCBcIkN0cmwtRG93blwiOiBcImdvRG9jRW5kXCIsXG4gICAgXCJDdHJsLUxlZnRcIjogXCJnb0dyb3VwTGVmdFwiLCBcIkN0cmwtUmlnaHRcIjogXCJnb0dyb3VwUmlnaHRcIiwgXCJBbHQtTGVmdFwiOiBcImdvTGluZVN0YXJ0XCIsIFwiQWx0LVJpZ2h0XCI6IFwiZ29MaW5lRW5kXCIsXG4gICAgXCJDdHJsLUJhY2tzcGFjZVwiOiBcImRlbEdyb3VwQmVmb3JlXCIsIFwiQ3RybC1EZWxldGVcIjogXCJkZWxHcm91cEFmdGVyXCIsIFwiQ3RybC1TXCI6IFwic2F2ZVwiLCBcIkN0cmwtRlwiOiBcImZpbmRcIixcbiAgICBcIkN0cmwtR1wiOiBcImZpbmROZXh0XCIsIFwiU2hpZnQtQ3RybC1HXCI6IFwiZmluZFByZXZcIiwgXCJTaGlmdC1DdHJsLUZcIjogXCJyZXBsYWNlXCIsIFwiU2hpZnQtQ3RybC1SXCI6IFwicmVwbGFjZUFsbFwiLFxuICAgIFwiQ3RybC1bXCI6IFwiaW5kZW50TGVzc1wiLCBcIkN0cmwtXVwiOiBcImluZGVudE1vcmVcIixcbiAgICBcIkN0cmwtVVwiOiBcInVuZG9TZWxlY3Rpb25cIiwgXCJTaGlmdC1DdHJsLVVcIjogXCJyZWRvU2VsZWN0aW9uXCIsIFwiQWx0LVVcIjogXCJyZWRvU2VsZWN0aW9uXCIsXG4gICAgZmFsbHRocm91Z2g6IFwiYmFzaWNcIlxuICB9O1xuICBrZXlNYXAubWFjRGVmYXVsdCA9IHtcbiAgICBcIkNtZC1BXCI6IFwic2VsZWN0QWxsXCIsIFwiQ21kLURcIjogXCJkZWxldGVMaW5lXCIsIFwiQ21kLVpcIjogXCJ1bmRvXCIsIFwiU2hpZnQtQ21kLVpcIjogXCJyZWRvXCIsIFwiQ21kLVlcIjogXCJyZWRvXCIsXG4gICAgXCJDbWQtVXBcIjogXCJnb0RvY1N0YXJ0XCIsIFwiQ21kLUVuZFwiOiBcImdvRG9jRW5kXCIsIFwiQ21kLURvd25cIjogXCJnb0RvY0VuZFwiLCBcIkFsdC1MZWZ0XCI6IFwiZ29Hcm91cExlZnRcIixcbiAgICBcIkFsdC1SaWdodFwiOiBcImdvR3JvdXBSaWdodFwiLCBcIkNtZC1MZWZ0XCI6IFwiZ29MaW5lU3RhcnRcIiwgXCJDbWQtUmlnaHRcIjogXCJnb0xpbmVFbmRcIiwgXCJBbHQtQmFja3NwYWNlXCI6IFwiZGVsR3JvdXBCZWZvcmVcIixcbiAgICBcIkN0cmwtQWx0LUJhY2tzcGFjZVwiOiBcImRlbEdyb3VwQWZ0ZXJcIiwgXCJBbHQtRGVsZXRlXCI6IFwiZGVsR3JvdXBBZnRlclwiLCBcIkNtZC1TXCI6IFwic2F2ZVwiLCBcIkNtZC1GXCI6IFwiZmluZFwiLFxuICAgIFwiQ21kLUdcIjogXCJmaW5kTmV4dFwiLCBcIlNoaWZ0LUNtZC1HXCI6IFwiZmluZFByZXZcIiwgXCJDbWQtQWx0LUZcIjogXCJyZXBsYWNlXCIsIFwiU2hpZnQtQ21kLUFsdC1GXCI6IFwicmVwbGFjZUFsbFwiLFxuICAgIFwiQ21kLVtcIjogXCJpbmRlbnRMZXNzXCIsIFwiQ21kLV1cIjogXCJpbmRlbnRNb3JlXCIsIFwiQ21kLUJhY2tzcGFjZVwiOiBcImRlbExpbmVMZWZ0XCIsXG4gICAgXCJDbWQtVVwiOiBcInVuZG9TZWxlY3Rpb25cIiwgXCJTaGlmdC1DbWQtVVwiOiBcInJlZG9TZWxlY3Rpb25cIixcbiAgICBmYWxsdGhyb3VnaDogW1wiYmFzaWNcIiwgXCJlbWFjc3lcIl1cbiAgfTtcbiAgLy8gVmVyeSBiYXNpYyByZWFkbGluZS9lbWFjcy1zdHlsZSBiaW5kaW5ncywgd2hpY2ggYXJlIHN0YW5kYXJkIG9uIE1hYy5cbiAga2V5TWFwLmVtYWNzeSA9IHtcbiAgICBcIkN0cmwtRlwiOiBcImdvQ2hhclJpZ2h0XCIsIFwiQ3RybC1CXCI6IFwiZ29DaGFyTGVmdFwiLCBcIkN0cmwtUFwiOiBcImdvTGluZVVwXCIsIFwiQ3RybC1OXCI6IFwiZ29MaW5lRG93blwiLFxuICAgIFwiQWx0LUZcIjogXCJnb1dvcmRSaWdodFwiLCBcIkFsdC1CXCI6IFwiZ29Xb3JkTGVmdFwiLCBcIkN0cmwtQVwiOiBcImdvTGluZVN0YXJ0XCIsIFwiQ3RybC1FXCI6IFwiZ29MaW5lRW5kXCIsXG4gICAgXCJDdHJsLVZcIjogXCJnb1BhZ2VEb3duXCIsIFwiU2hpZnQtQ3RybC1WXCI6IFwiZ29QYWdlVXBcIiwgXCJDdHJsLURcIjogXCJkZWxDaGFyQWZ0ZXJcIiwgXCJDdHJsLUhcIjogXCJkZWxDaGFyQmVmb3JlXCIsXG4gICAgXCJBbHQtRFwiOiBcImRlbFdvcmRBZnRlclwiLCBcIkFsdC1CYWNrc3BhY2VcIjogXCJkZWxXb3JkQmVmb3JlXCIsIFwiQ3RybC1LXCI6IFwia2lsbExpbmVcIiwgXCJDdHJsLVRcIjogXCJ0cmFuc3Bvc2VDaGFyc1wiXG4gIH07XG4gIGtleU1hcFtcImRlZmF1bHRcIl0gPSBtYWMgPyBrZXlNYXAubWFjRGVmYXVsdCA6IGtleU1hcC5wY0RlZmF1bHQ7XG5cbiAgLy8gS0VZTUFQIERJU1BBVENIXG5cbiAgZnVuY3Rpb24gZ2V0S2V5TWFwKHZhbCkge1xuICAgIGlmICh0eXBlb2YgdmFsID09IFwic3RyaW5nXCIpIHJldHVybiBrZXlNYXBbdmFsXTtcbiAgICBlbHNlIHJldHVybiB2YWw7XG4gIH1cblxuICAvLyBHaXZlbiBhbiBhcnJheSBvZiBrZXltYXBzIGFuZCBhIGtleSBuYW1lLCBjYWxsIGhhbmRsZSBvbiBhbnlcbiAgLy8gYmluZGluZ3MgZm91bmQsIHVudGlsIHRoYXQgcmV0dXJucyBhIHRydXRoeSB2YWx1ZSwgYXQgd2hpY2ggcG9pbnRcbiAgLy8gd2UgY29uc2lkZXIgdGhlIGtleSBoYW5kbGVkLiBJbXBsZW1lbnRzIHRoaW5ncyBsaWtlIGJpbmRpbmcgYSBrZXlcbiAgLy8gdG8gZmFsc2Ugc3RvcHBpbmcgZnVydGhlciBoYW5kbGluZyBhbmQga2V5bWFwIGZhbGx0aHJvdWdoLlxuICB2YXIgbG9va3VwS2V5ID0gQ29kZU1pcnJvci5sb29rdXBLZXkgPSBmdW5jdGlvbihuYW1lLCBtYXBzLCBoYW5kbGUpIHtcbiAgICBmdW5jdGlvbiBsb29rdXAobWFwKSB7XG4gICAgICBtYXAgPSBnZXRLZXlNYXAobWFwKTtcbiAgICAgIHZhciBmb3VuZCA9IG1hcFtuYW1lXTtcbiAgICAgIGlmIChmb3VuZCA9PT0gZmFsc2UpIHJldHVybiBcInN0b3BcIjtcbiAgICAgIGlmIChmb3VuZCAhPSBudWxsICYmIGhhbmRsZShmb3VuZCkpIHJldHVybiB0cnVlO1xuICAgICAgaWYgKG1hcC5ub2ZhbGx0aHJvdWdoKSByZXR1cm4gXCJzdG9wXCI7XG5cbiAgICAgIHZhciBmYWxsdGhyb3VnaCA9IG1hcC5mYWxsdGhyb3VnaDtcbiAgICAgIGlmIChmYWxsdGhyb3VnaCA9PSBudWxsKSByZXR1cm4gZmFsc2U7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGZhbGx0aHJvdWdoKSAhPSBcIltvYmplY3QgQXJyYXldXCIpXG4gICAgICAgIHJldHVybiBsb29rdXAoZmFsbHRocm91Z2gpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmYWxsdGhyb3VnaC5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgZG9uZSA9IGxvb2t1cChmYWxsdGhyb3VnaFtpXSk7XG4gICAgICAgIGlmIChkb25lKSByZXR1cm4gZG9uZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1hcHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBkb25lID0gbG9va3VwKG1hcHNbaV0pO1xuICAgICAgaWYgKGRvbmUpIHJldHVybiBkb25lICE9IFwic3RvcFwiO1xuICAgIH1cbiAgfTtcblxuICAvLyBNb2RpZmllciBrZXkgcHJlc3NlcyBkb24ndCBjb3VudCBhcyAncmVhbCcga2V5IHByZXNzZXMgZm9yIHRoZVxuICAvLyBwdXJwb3NlIG9mIGtleW1hcCBmYWxsdGhyb3VnaC5cbiAgdmFyIGlzTW9kaWZpZXJLZXkgPSBDb2RlTWlycm9yLmlzTW9kaWZpZXJLZXkgPSBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciBuYW1lID0ga2V5TmFtZXNbZXZlbnQua2V5Q29kZV07XG4gICAgcmV0dXJuIG5hbWUgPT0gXCJDdHJsXCIgfHwgbmFtZSA9PSBcIkFsdFwiIHx8IG5hbWUgPT0gXCJTaGlmdFwiIHx8IG5hbWUgPT0gXCJNb2RcIjtcbiAgfTtcblxuICAvLyBMb29rIHVwIHRoZSBuYW1lIG9mIGEga2V5IGFzIGluZGljYXRlZCBieSBhbiBldmVudCBvYmplY3QuXG4gIHZhciBrZXlOYW1lID0gQ29kZU1pcnJvci5rZXlOYW1lID0gZnVuY3Rpb24oZXZlbnQsIG5vU2hpZnQpIHtcbiAgICBpZiAocHJlc3RvICYmIGV2ZW50LmtleUNvZGUgPT0gMzQgJiYgZXZlbnRbXCJjaGFyXCJdKSByZXR1cm4gZmFsc2U7XG4gICAgdmFyIG5hbWUgPSBrZXlOYW1lc1tldmVudC5rZXlDb2RlXTtcbiAgICBpZiAobmFtZSA9PSBudWxsIHx8IGV2ZW50LmFsdEdyYXBoS2V5KSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKGV2ZW50LmFsdEtleSkgbmFtZSA9IFwiQWx0LVwiICsgbmFtZTtcbiAgICBpZiAoZmxpcEN0cmxDbWQgPyBldmVudC5tZXRhS2V5IDogZXZlbnQuY3RybEtleSkgbmFtZSA9IFwiQ3RybC1cIiArIG5hbWU7XG4gICAgaWYgKGZsaXBDdHJsQ21kID8gZXZlbnQuY3RybEtleSA6IGV2ZW50Lm1ldGFLZXkpIG5hbWUgPSBcIkNtZC1cIiArIG5hbWU7XG4gICAgaWYgKCFub1NoaWZ0ICYmIGV2ZW50LnNoaWZ0S2V5KSBuYW1lID0gXCJTaGlmdC1cIiArIG5hbWU7XG4gICAgcmV0dXJuIG5hbWU7XG4gIH07XG5cbiAgLy8gRlJPTVRFWFRBUkVBXG5cbiAgQ29kZU1pcnJvci5mcm9tVGV4dEFyZWEgPSBmdW5jdGlvbih0ZXh0YXJlYSwgb3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykgb3B0aW9ucyA9IHt9O1xuICAgIG9wdGlvbnMudmFsdWUgPSB0ZXh0YXJlYS52YWx1ZTtcbiAgICBpZiAoIW9wdGlvbnMudGFiaW5kZXggJiYgdGV4dGFyZWEudGFiaW5kZXgpXG4gICAgICBvcHRpb25zLnRhYmluZGV4ID0gdGV4dGFyZWEudGFiaW5kZXg7XG4gICAgaWYgKCFvcHRpb25zLnBsYWNlaG9sZGVyICYmIHRleHRhcmVhLnBsYWNlaG9sZGVyKVxuICAgICAgb3B0aW9ucy5wbGFjZWhvbGRlciA9IHRleHRhcmVhLnBsYWNlaG9sZGVyO1xuICAgIC8vIFNldCBhdXRvZm9jdXMgdG8gdHJ1ZSBpZiB0aGlzIHRleHRhcmVhIGlzIGZvY3VzZWQsIG9yIGlmIGl0IGhhc1xuICAgIC8vIGF1dG9mb2N1cyBhbmQgbm8gb3RoZXIgZWxlbWVudCBpcyBmb2N1c2VkLlxuICAgIGlmIChvcHRpb25zLmF1dG9mb2N1cyA9PSBudWxsKSB7XG4gICAgICB2YXIgaGFzRm9jdXMgPSBhY3RpdmVFbHQoKTtcbiAgICAgIG9wdGlvbnMuYXV0b2ZvY3VzID0gaGFzRm9jdXMgPT0gdGV4dGFyZWEgfHxcbiAgICAgICAgdGV4dGFyZWEuZ2V0QXR0cmlidXRlKFwiYXV0b2ZvY3VzXCIpICE9IG51bGwgJiYgaGFzRm9jdXMgPT0gZG9jdW1lbnQuYm9keTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzYXZlKCkge3RleHRhcmVhLnZhbHVlID0gY20uZ2V0VmFsdWUoKTt9XG4gICAgaWYgKHRleHRhcmVhLmZvcm0pIHtcbiAgICAgIG9uKHRleHRhcmVhLmZvcm0sIFwic3VibWl0XCIsIHNhdmUpO1xuICAgICAgLy8gRGVwbG9yYWJsZSBoYWNrIHRvIG1ha2UgdGhlIHN1Ym1pdCBtZXRob2QgZG8gdGhlIHJpZ2h0IHRoaW5nLlxuICAgICAgaWYgKCFvcHRpb25zLmxlYXZlU3VibWl0TWV0aG9kQWxvbmUpIHtcbiAgICAgICAgdmFyIGZvcm0gPSB0ZXh0YXJlYS5mb3JtLCByZWFsU3VibWl0ID0gZm9ybS5zdWJtaXQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdmFyIHdyYXBwZWRTdWJtaXQgPSBmb3JtLnN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2F2ZSgpO1xuICAgICAgICAgICAgZm9ybS5zdWJtaXQgPSByZWFsU3VibWl0O1xuICAgICAgICAgICAgZm9ybS5zdWJtaXQoKTtcbiAgICAgICAgICAgIGZvcm0uc3VibWl0ID0gd3JhcHBlZFN1Ym1pdDtcbiAgICAgICAgICB9O1xuICAgICAgICB9IGNhdGNoKGUpIHt9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGV4dGFyZWEuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIHZhciBjbSA9IENvZGVNaXJyb3IoZnVuY3Rpb24obm9kZSkge1xuICAgICAgdGV4dGFyZWEucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobm9kZSwgdGV4dGFyZWEubmV4dFNpYmxpbmcpO1xuICAgIH0sIG9wdGlvbnMpO1xuICAgIGNtLnNhdmUgPSBzYXZlO1xuICAgIGNtLmdldFRleHRBcmVhID0gZnVuY3Rpb24oKSB7IHJldHVybiB0ZXh0YXJlYTsgfTtcbiAgICBjbS50b1RleHRBcmVhID0gZnVuY3Rpb24oKSB7XG4gICAgICBzYXZlKCk7XG4gICAgICB0ZXh0YXJlYS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGNtLmdldFdyYXBwZXJFbGVtZW50KCkpO1xuICAgICAgdGV4dGFyZWEuc3R5bGUuZGlzcGxheSA9IFwiXCI7XG4gICAgICBpZiAodGV4dGFyZWEuZm9ybSkge1xuICAgICAgICBvZmYodGV4dGFyZWEuZm9ybSwgXCJzdWJtaXRcIiwgc2F2ZSk7XG4gICAgICAgIGlmICh0eXBlb2YgdGV4dGFyZWEuZm9ybS5zdWJtaXQgPT0gXCJmdW5jdGlvblwiKVxuICAgICAgICAgIHRleHRhcmVhLmZvcm0uc3VibWl0ID0gcmVhbFN1Ym1pdDtcbiAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBjbTtcbiAgfTtcblxuICAvLyBTVFJJTkcgU1RSRUFNXG5cbiAgLy8gRmVkIHRvIHRoZSBtb2RlIHBhcnNlcnMsIHByb3ZpZGVzIGhlbHBlciBmdW5jdGlvbnMgdG8gbWFrZVxuICAvLyBwYXJzZXJzIG1vcmUgc3VjY2luY3QuXG5cbiAgdmFyIFN0cmluZ1N0cmVhbSA9IENvZGVNaXJyb3IuU3RyaW5nU3RyZWFtID0gZnVuY3Rpb24oc3RyaW5nLCB0YWJTaXplKSB7XG4gICAgdGhpcy5wb3MgPSB0aGlzLnN0YXJ0ID0gMDtcbiAgICB0aGlzLnN0cmluZyA9IHN0cmluZztcbiAgICB0aGlzLnRhYlNpemUgPSB0YWJTaXplIHx8IDg7XG4gICAgdGhpcy5sYXN0Q29sdW1uUG9zID0gdGhpcy5sYXN0Q29sdW1uVmFsdWUgPSAwO1xuICAgIHRoaXMubGluZVN0YXJ0ID0gMDtcbiAgfTtcblxuICBTdHJpbmdTdHJlYW0ucHJvdG90eXBlID0ge1xuICAgIGVvbDogZnVuY3Rpb24oKSB7cmV0dXJuIHRoaXMucG9zID49IHRoaXMuc3RyaW5nLmxlbmd0aDt9LFxuICAgIHNvbDogZnVuY3Rpb24oKSB7cmV0dXJuIHRoaXMucG9zID09IHRoaXMubGluZVN0YXJ0O30sXG4gICAgcGVlazogZnVuY3Rpb24oKSB7cmV0dXJuIHRoaXMuc3RyaW5nLmNoYXJBdCh0aGlzLnBvcykgfHwgdW5kZWZpbmVkO30sXG4gICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5wb3MgPCB0aGlzLnN0cmluZy5sZW5ndGgpXG4gICAgICAgIHJldHVybiB0aGlzLnN0cmluZy5jaGFyQXQodGhpcy5wb3MrKyk7XG4gICAgfSxcbiAgICBlYXQ6IGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgICB2YXIgY2ggPSB0aGlzLnN0cmluZy5jaGFyQXQodGhpcy5wb3MpO1xuICAgICAgaWYgKHR5cGVvZiBtYXRjaCA9PSBcInN0cmluZ1wiKSB2YXIgb2sgPSBjaCA9PSBtYXRjaDtcbiAgICAgIGVsc2UgdmFyIG9rID0gY2ggJiYgKG1hdGNoLnRlc3QgPyBtYXRjaC50ZXN0KGNoKSA6IG1hdGNoKGNoKSk7XG4gICAgICBpZiAob2spIHsrK3RoaXMucG9zOyByZXR1cm4gY2g7fVxuICAgIH0sXG4gICAgZWF0V2hpbGU6IGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgICB2YXIgc3RhcnQgPSB0aGlzLnBvcztcbiAgICAgIHdoaWxlICh0aGlzLmVhdChtYXRjaCkpe31cbiAgICAgIHJldHVybiB0aGlzLnBvcyA+IHN0YXJ0O1xuICAgIH0sXG4gICAgZWF0U3BhY2U6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHN0YXJ0ID0gdGhpcy5wb3M7XG4gICAgICB3aGlsZSAoL1tcXHNcXHUwMGEwXS8udGVzdCh0aGlzLnN0cmluZy5jaGFyQXQodGhpcy5wb3MpKSkgKyt0aGlzLnBvcztcbiAgICAgIHJldHVybiB0aGlzLnBvcyA+IHN0YXJ0O1xuICAgIH0sXG4gICAgc2tpcFRvRW5kOiBmdW5jdGlvbigpIHt0aGlzLnBvcyA9IHRoaXMuc3RyaW5nLmxlbmd0aDt9LFxuICAgIHNraXBUbzogZnVuY3Rpb24oY2gpIHtcbiAgICAgIHZhciBmb3VuZCA9IHRoaXMuc3RyaW5nLmluZGV4T2YoY2gsIHRoaXMucG9zKTtcbiAgICAgIGlmIChmb3VuZCA+IC0xKSB7dGhpcy5wb3MgPSBmb3VuZDsgcmV0dXJuIHRydWU7fVxuICAgIH0sXG4gICAgYmFja1VwOiBmdW5jdGlvbihuKSB7dGhpcy5wb3MgLT0gbjt9LFxuICAgIGNvbHVtbjogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5sYXN0Q29sdW1uUG9zIDwgdGhpcy5zdGFydCkge1xuICAgICAgICB0aGlzLmxhc3RDb2x1bW5WYWx1ZSA9IGNvdW50Q29sdW1uKHRoaXMuc3RyaW5nLCB0aGlzLnN0YXJ0LCB0aGlzLnRhYlNpemUsIHRoaXMubGFzdENvbHVtblBvcywgdGhpcy5sYXN0Q29sdW1uVmFsdWUpO1xuICAgICAgICB0aGlzLmxhc3RDb2x1bW5Qb3MgPSB0aGlzLnN0YXJ0O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMubGFzdENvbHVtblZhbHVlIC0gKHRoaXMubGluZVN0YXJ0ID8gY291bnRDb2x1bW4odGhpcy5zdHJpbmcsIHRoaXMubGluZVN0YXJ0LCB0aGlzLnRhYlNpemUpIDogMCk7XG4gICAgfSxcbiAgICBpbmRlbnRhdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gY291bnRDb2x1bW4odGhpcy5zdHJpbmcsIG51bGwsIHRoaXMudGFiU2l6ZSkgLVxuICAgICAgICAodGhpcy5saW5lU3RhcnQgPyBjb3VudENvbHVtbih0aGlzLnN0cmluZywgdGhpcy5saW5lU3RhcnQsIHRoaXMudGFiU2l6ZSkgOiAwKTtcbiAgICB9LFxuICAgIG1hdGNoOiBmdW5jdGlvbihwYXR0ZXJuLCBjb25zdW1lLCBjYXNlSW5zZW5zaXRpdmUpIHtcbiAgICAgIGlmICh0eXBlb2YgcGF0dGVybiA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHZhciBjYXNlZCA9IGZ1bmN0aW9uKHN0cikge3JldHVybiBjYXNlSW5zZW5zaXRpdmUgPyBzdHIudG9Mb3dlckNhc2UoKSA6IHN0cjt9O1xuICAgICAgICB2YXIgc3Vic3RyID0gdGhpcy5zdHJpbmcuc3Vic3RyKHRoaXMucG9zLCBwYXR0ZXJuLmxlbmd0aCk7XG4gICAgICAgIGlmIChjYXNlZChzdWJzdHIpID09IGNhc2VkKHBhdHRlcm4pKSB7XG4gICAgICAgICAgaWYgKGNvbnN1bWUgIT09IGZhbHNlKSB0aGlzLnBvcyArPSBwYXR0ZXJuLmxlbmd0aDtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIG1hdGNoID0gdGhpcy5zdHJpbmcuc2xpY2UodGhpcy5wb3MpLm1hdGNoKHBhdHRlcm4pO1xuICAgICAgICBpZiAobWF0Y2ggJiYgbWF0Y2guaW5kZXggPiAwKSByZXR1cm4gbnVsbDtcbiAgICAgICAgaWYgKG1hdGNoICYmIGNvbnN1bWUgIT09IGZhbHNlKSB0aGlzLnBvcyArPSBtYXRjaFswXS5sZW5ndGg7XG4gICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgIH1cbiAgICB9LFxuICAgIGN1cnJlbnQ6IGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuc3RyaW5nLnNsaWNlKHRoaXMuc3RhcnQsIHRoaXMucG9zKTt9LFxuICAgIGhpZGVGaXJzdENoYXJzOiBmdW5jdGlvbihuLCBpbm5lcikge1xuICAgICAgdGhpcy5saW5lU3RhcnQgKz0gbjtcbiAgICAgIHRyeSB7IHJldHVybiBpbm5lcigpOyB9XG4gICAgICBmaW5hbGx5IHsgdGhpcy5saW5lU3RhcnQgLT0gbjsgfVxuICAgIH1cbiAgfTtcblxuICAvLyBURVhUTUFSS0VSU1xuXG4gIC8vIENyZWF0ZWQgd2l0aCBtYXJrVGV4dCBhbmQgc2V0Qm9va21hcmsgbWV0aG9kcy4gQSBUZXh0TWFya2VyIGlzIGFcbiAgLy8gaGFuZGxlIHRoYXQgY2FuIGJlIHVzZWQgdG8gY2xlYXIgb3IgZmluZCBhIG1hcmtlZCBwb3NpdGlvbiBpbiB0aGVcbiAgLy8gZG9jdW1lbnQuIExpbmUgb2JqZWN0cyBob2xkIGFycmF5cyAobWFya2VkU3BhbnMpIGNvbnRhaW5pbmdcbiAgLy8ge2Zyb20sIHRvLCBtYXJrZXJ9IG9iamVjdCBwb2ludGluZyB0byBzdWNoIG1hcmtlciBvYmplY3RzLCBhbmRcbiAgLy8gaW5kaWNhdGluZyB0aGF0IHN1Y2ggYSBtYXJrZXIgaXMgcHJlc2VudCBvbiB0aGF0IGxpbmUuIE11bHRpcGxlXG4gIC8vIGxpbmVzIG1heSBwb2ludCB0byB0aGUgc2FtZSBtYXJrZXIgd2hlbiBpdCBzcGFucyBhY3Jvc3MgbGluZXMuXG4gIC8vIFRoZSBzcGFucyB3aWxsIGhhdmUgbnVsbCBmb3IgdGhlaXIgZnJvbS90byBwcm9wZXJ0aWVzIHdoZW4gdGhlXG4gIC8vIG1hcmtlciBjb250aW51ZXMgYmV5b25kIHRoZSBzdGFydC9lbmQgb2YgdGhlIGxpbmUuIE1hcmtlcnMgaGF2ZVxuICAvLyBsaW5rcyBiYWNrIHRvIHRoZSBsaW5lcyB0aGV5IGN1cnJlbnRseSB0b3VjaC5cblxuICB2YXIgVGV4dE1hcmtlciA9IENvZGVNaXJyb3IuVGV4dE1hcmtlciA9IGZ1bmN0aW9uKGRvYywgdHlwZSkge1xuICAgIHRoaXMubGluZXMgPSBbXTtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMuZG9jID0gZG9jO1xuICB9O1xuICBldmVudE1peGluKFRleHRNYXJrZXIpO1xuXG4gIC8vIENsZWFyIHRoZSBtYXJrZXIuXG4gIFRleHRNYXJrZXIucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuZXhwbGljaXRseUNsZWFyZWQpIHJldHVybjtcbiAgICB2YXIgY20gPSB0aGlzLmRvYy5jbSwgd2l0aE9wID0gY20gJiYgIWNtLmN1ck9wO1xuICAgIGlmICh3aXRoT3ApIHN0YXJ0T3BlcmF0aW9uKGNtKTtcbiAgICBpZiAoaGFzSGFuZGxlcih0aGlzLCBcImNsZWFyXCIpKSB7XG4gICAgICB2YXIgZm91bmQgPSB0aGlzLmZpbmQoKTtcbiAgICAgIGlmIChmb3VuZCkgc2lnbmFsTGF0ZXIodGhpcywgXCJjbGVhclwiLCBmb3VuZC5mcm9tLCBmb3VuZC50byk7XG4gICAgfVxuICAgIHZhciBtaW4gPSBudWxsLCBtYXggPSBudWxsO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5saW5lcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGxpbmUgPSB0aGlzLmxpbmVzW2ldO1xuICAgICAgdmFyIHNwYW4gPSBnZXRNYXJrZWRTcGFuRm9yKGxpbmUubWFya2VkU3BhbnMsIHRoaXMpO1xuICAgICAgaWYgKGNtICYmICF0aGlzLmNvbGxhcHNlZCkgcmVnTGluZUNoYW5nZShjbSwgbGluZU5vKGxpbmUpLCBcInRleHRcIik7XG4gICAgICBlbHNlIGlmIChjbSkge1xuICAgICAgICBpZiAoc3Bhbi50byAhPSBudWxsKSBtYXggPSBsaW5lTm8obGluZSk7XG4gICAgICAgIGlmIChzcGFuLmZyb20gIT0gbnVsbCkgbWluID0gbGluZU5vKGxpbmUpO1xuICAgICAgfVxuICAgICAgbGluZS5tYXJrZWRTcGFucyA9IHJlbW92ZU1hcmtlZFNwYW4obGluZS5tYXJrZWRTcGFucywgc3Bhbik7XG4gICAgICBpZiAoc3Bhbi5mcm9tID09IG51bGwgJiYgdGhpcy5jb2xsYXBzZWQgJiYgIWxpbmVJc0hpZGRlbih0aGlzLmRvYywgbGluZSkgJiYgY20pXG4gICAgICAgIHVwZGF0ZUxpbmVIZWlnaHQobGluZSwgdGV4dEhlaWdodChjbS5kaXNwbGF5KSk7XG4gICAgfVxuICAgIGlmIChjbSAmJiB0aGlzLmNvbGxhcHNlZCAmJiAhY20ub3B0aW9ucy5saW5lV3JhcHBpbmcpIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5saW5lcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHZpc3VhbCA9IHZpc3VhbExpbmUodGhpcy5saW5lc1tpXSksIGxlbiA9IGxpbmVMZW5ndGgodmlzdWFsKTtcbiAgICAgIGlmIChsZW4gPiBjbS5kaXNwbGF5Lm1heExpbmVMZW5ndGgpIHtcbiAgICAgICAgY20uZGlzcGxheS5tYXhMaW5lID0gdmlzdWFsO1xuICAgICAgICBjbS5kaXNwbGF5Lm1heExpbmVMZW5ndGggPSBsZW47XG4gICAgICAgIGNtLmRpc3BsYXkubWF4TGluZUNoYW5nZWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChtaW4gIT0gbnVsbCAmJiBjbSAmJiB0aGlzLmNvbGxhcHNlZCkgcmVnQ2hhbmdlKGNtLCBtaW4sIG1heCArIDEpO1xuICAgIHRoaXMubGluZXMubGVuZ3RoID0gMDtcbiAgICB0aGlzLmV4cGxpY2l0bHlDbGVhcmVkID0gdHJ1ZTtcbiAgICBpZiAodGhpcy5hdG9taWMgJiYgdGhpcy5kb2MuY2FudEVkaXQpIHtcbiAgICAgIHRoaXMuZG9jLmNhbnRFZGl0ID0gZmFsc2U7XG4gICAgICBpZiAoY20pIHJlQ2hlY2tTZWxlY3Rpb24oY20uZG9jKTtcbiAgICB9XG4gICAgaWYgKGNtKSBzaWduYWxMYXRlcihjbSwgXCJtYXJrZXJDbGVhcmVkXCIsIGNtLCB0aGlzKTtcbiAgICBpZiAod2l0aE9wKSBlbmRPcGVyYXRpb24oY20pO1xuICAgIGlmICh0aGlzLnBhcmVudCkgdGhpcy5wYXJlbnQuY2xlYXIoKTtcbiAgfTtcblxuICAvLyBGaW5kIHRoZSBwb3NpdGlvbiBvZiB0aGUgbWFya2VyIGluIHRoZSBkb2N1bWVudC4gUmV0dXJucyBhIHtmcm9tLFxuICAvLyB0b30gb2JqZWN0IGJ5IGRlZmF1bHQuIFNpZGUgY2FuIGJlIHBhc3NlZCB0byBnZXQgYSBzcGVjaWZpYyBzaWRlXG4gIC8vIC0tIDAgKGJvdGgpLCAtMSAobGVmdCksIG9yIDEgKHJpZ2h0KS4gV2hlbiBsaW5lT2JqIGlzIHRydWUsIHRoZVxuICAvLyBQb3Mgb2JqZWN0cyByZXR1cm5lZCBjb250YWluIGEgbGluZSBvYmplY3QsIHJhdGhlciB0aGFuIGEgbGluZVxuICAvLyBudW1iZXIgKHVzZWQgdG8gcHJldmVudCBsb29raW5nIHVwIHRoZSBzYW1lIGxpbmUgdHdpY2UpLlxuICBUZXh0TWFya2VyLnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24oc2lkZSwgbGluZU9iaikge1xuICAgIGlmIChzaWRlID09IG51bGwgJiYgdGhpcy50eXBlID09IFwiYm9va21hcmtcIikgc2lkZSA9IDE7XG4gICAgdmFyIGZyb20sIHRvO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5saW5lcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGxpbmUgPSB0aGlzLmxpbmVzW2ldO1xuICAgICAgdmFyIHNwYW4gPSBnZXRNYXJrZWRTcGFuRm9yKGxpbmUubWFya2VkU3BhbnMsIHRoaXMpO1xuICAgICAgaWYgKHNwYW4uZnJvbSAhPSBudWxsKSB7XG4gICAgICAgIGZyb20gPSBQb3MobGluZU9iaiA/IGxpbmUgOiBsaW5lTm8obGluZSksIHNwYW4uZnJvbSk7XG4gICAgICAgIGlmIChzaWRlID09IC0xKSByZXR1cm4gZnJvbTtcbiAgICAgIH1cbiAgICAgIGlmIChzcGFuLnRvICE9IG51bGwpIHtcbiAgICAgICAgdG8gPSBQb3MobGluZU9iaiA/IGxpbmUgOiBsaW5lTm8obGluZSksIHNwYW4udG8pO1xuICAgICAgICBpZiAoc2lkZSA9PSAxKSByZXR1cm4gdG87XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmcm9tICYmIHtmcm9tOiBmcm9tLCB0bzogdG99O1xuICB9O1xuXG4gIC8vIFNpZ25hbHMgdGhhdCB0aGUgbWFya2VyJ3Mgd2lkZ2V0IGNoYW5nZWQsIGFuZCBzdXJyb3VuZGluZyBsYXlvdXRcbiAgLy8gc2hvdWxkIGJlIHJlY29tcHV0ZWQuXG4gIFRleHRNYXJrZXIucHJvdG90eXBlLmNoYW5nZWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcG9zID0gdGhpcy5maW5kKC0xLCB0cnVlKSwgd2lkZ2V0ID0gdGhpcywgY20gPSB0aGlzLmRvYy5jbTtcbiAgICBpZiAoIXBvcyB8fCAhY20pIHJldHVybjtcbiAgICBydW5Jbk9wKGNtLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBsaW5lID0gcG9zLmxpbmUsIGxpbmVOID0gbGluZU5vKHBvcy5saW5lKTtcbiAgICAgIHZhciB2aWV3ID0gZmluZFZpZXdGb3JMaW5lKGNtLCBsaW5lTik7XG4gICAgICBpZiAodmlldykge1xuICAgICAgICBjbGVhckxpbmVNZWFzdXJlbWVudENhY2hlRm9yKHZpZXcpO1xuICAgICAgICBjbS5jdXJPcC5zZWxlY3Rpb25DaGFuZ2VkID0gY20uY3VyT3AuZm9yY2VVcGRhdGUgPSB0cnVlO1xuICAgICAgfVxuICAgICAgY20uY3VyT3AudXBkYXRlTWF4TGluZSA9IHRydWU7XG4gICAgICBpZiAoIWxpbmVJc0hpZGRlbih3aWRnZXQuZG9jLCBsaW5lKSAmJiB3aWRnZXQuaGVpZ2h0ICE9IG51bGwpIHtcbiAgICAgICAgdmFyIG9sZEhlaWdodCA9IHdpZGdldC5oZWlnaHQ7XG4gICAgICAgIHdpZGdldC5oZWlnaHQgPSBudWxsO1xuICAgICAgICB2YXIgZEhlaWdodCA9IHdpZGdldEhlaWdodCh3aWRnZXQpIC0gb2xkSGVpZ2h0O1xuICAgICAgICBpZiAoZEhlaWdodClcbiAgICAgICAgICB1cGRhdGVMaW5lSGVpZ2h0KGxpbmUsIGxpbmUuaGVpZ2h0ICsgZEhlaWdodCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgVGV4dE1hcmtlci5wcm90b3R5cGUuYXR0YWNoTGluZSA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgICBpZiAoIXRoaXMubGluZXMubGVuZ3RoICYmIHRoaXMuZG9jLmNtKSB7XG4gICAgICB2YXIgb3AgPSB0aGlzLmRvYy5jbS5jdXJPcDtcbiAgICAgIGlmICghb3AubWF5YmVIaWRkZW5NYXJrZXJzIHx8IGluZGV4T2Yob3AubWF5YmVIaWRkZW5NYXJrZXJzLCB0aGlzKSA9PSAtMSlcbiAgICAgICAgKG9wLm1heWJlVW5oaWRkZW5NYXJrZXJzIHx8IChvcC5tYXliZVVuaGlkZGVuTWFya2VycyA9IFtdKSkucHVzaCh0aGlzKTtcbiAgICB9XG4gICAgdGhpcy5saW5lcy5wdXNoKGxpbmUpO1xuICB9O1xuICBUZXh0TWFya2VyLnByb3RvdHlwZS5kZXRhY2hMaW5lID0gZnVuY3Rpb24obGluZSkge1xuICAgIHRoaXMubGluZXMuc3BsaWNlKGluZGV4T2YodGhpcy5saW5lcywgbGluZSksIDEpO1xuICAgIGlmICghdGhpcy5saW5lcy5sZW5ndGggJiYgdGhpcy5kb2MuY20pIHtcbiAgICAgIHZhciBvcCA9IHRoaXMuZG9jLmNtLmN1ck9wO1xuICAgICAgKG9wLm1heWJlSGlkZGVuTWFya2VycyB8fCAob3AubWF5YmVIaWRkZW5NYXJrZXJzID0gW10pKS5wdXNoKHRoaXMpO1xuICAgIH1cbiAgfTtcblxuICAvLyBDb2xsYXBzZWQgbWFya2VycyBoYXZlIHVuaXF1ZSBpZHMsIGluIG9yZGVyIHRvIGJlIGFibGUgdG8gb3JkZXJcbiAgLy8gdGhlbSwgd2hpY2ggaXMgbmVlZGVkIGZvciB1bmlxdWVseSBkZXRlcm1pbmluZyBhbiBvdXRlciBtYXJrZXJcbiAgLy8gd2hlbiB0aGV5IG92ZXJsYXAgKHRoZXkgbWF5IG5lc3QsIGJ1dCBub3QgcGFydGlhbGx5IG92ZXJsYXApLlxuICB2YXIgbmV4dE1hcmtlcklkID0gMDtcblxuICAvLyBDcmVhdGUgYSBtYXJrZXIsIHdpcmUgaXQgdXAgdG8gdGhlIHJpZ2h0IGxpbmVzLCBhbmRcbiAgZnVuY3Rpb24gbWFya1RleHQoZG9jLCBmcm9tLCB0bywgb3B0aW9ucywgdHlwZSkge1xuICAgIC8vIFNoYXJlZCBtYXJrZXJzIChhY3Jvc3MgbGlua2VkIGRvY3VtZW50cykgYXJlIGhhbmRsZWQgc2VwYXJhdGVseVxuICAgIC8vIChtYXJrVGV4dFNoYXJlZCB3aWxsIGNhbGwgb3V0IHRvIHRoaXMgYWdhaW4sIG9uY2UgcGVyXG4gICAgLy8gZG9jdW1lbnQpLlxuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuc2hhcmVkKSByZXR1cm4gbWFya1RleHRTaGFyZWQoZG9jLCBmcm9tLCB0bywgb3B0aW9ucywgdHlwZSk7XG4gICAgLy8gRW5zdXJlIHdlIGFyZSBpbiBhbiBvcGVyYXRpb24uXG4gICAgaWYgKGRvYy5jbSAmJiAhZG9jLmNtLmN1ck9wKSByZXR1cm4gb3BlcmF0aW9uKGRvYy5jbSwgbWFya1RleHQpKGRvYywgZnJvbSwgdG8sIG9wdGlvbnMsIHR5cGUpO1xuXG4gICAgdmFyIG1hcmtlciA9IG5ldyBUZXh0TWFya2VyKGRvYywgdHlwZSksIGRpZmYgPSBjbXAoZnJvbSwgdG8pO1xuICAgIGlmIChvcHRpb25zKSBjb3B5T2JqKG9wdGlvbnMsIG1hcmtlciwgZmFsc2UpO1xuICAgIC8vIERvbid0IGNvbm5lY3QgZW1wdHkgbWFya2VycyB1bmxlc3MgY2xlYXJXaGVuRW1wdHkgaXMgZmFsc2VcbiAgICBpZiAoZGlmZiA+IDAgfHwgZGlmZiA9PSAwICYmIG1hcmtlci5jbGVhcldoZW5FbXB0eSAhPT0gZmFsc2UpXG4gICAgICByZXR1cm4gbWFya2VyO1xuICAgIGlmIChtYXJrZXIucmVwbGFjZWRXaXRoKSB7XG4gICAgICAvLyBTaG93aW5nIHVwIGFzIGEgd2lkZ2V0IGltcGxpZXMgY29sbGFwc2VkICh3aWRnZXQgcmVwbGFjZXMgdGV4dClcbiAgICAgIG1hcmtlci5jb2xsYXBzZWQgPSB0cnVlO1xuICAgICAgbWFya2VyLndpZGdldE5vZGUgPSBlbHQoXCJzcGFuXCIsIFttYXJrZXIucmVwbGFjZWRXaXRoXSwgXCJDb2RlTWlycm9yLXdpZGdldFwiKTtcbiAgICAgIGlmICghb3B0aW9ucy5oYW5kbGVNb3VzZUV2ZW50cykgbWFya2VyLndpZGdldE5vZGUuaWdub3JlRXZlbnRzID0gdHJ1ZTtcbiAgICAgIGlmIChvcHRpb25zLmluc2VydExlZnQpIG1hcmtlci53aWRnZXROb2RlLmluc2VydExlZnQgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAobWFya2VyLmNvbGxhcHNlZCkge1xuICAgICAgaWYgKGNvbmZsaWN0aW5nQ29sbGFwc2VkUmFuZ2UoZG9jLCBmcm9tLmxpbmUsIGZyb20sIHRvLCBtYXJrZXIpIHx8XG4gICAgICAgICAgZnJvbS5saW5lICE9IHRvLmxpbmUgJiYgY29uZmxpY3RpbmdDb2xsYXBzZWRSYW5nZShkb2MsIHRvLmxpbmUsIGZyb20sIHRvLCBtYXJrZXIpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnNlcnRpbmcgY29sbGFwc2VkIG1hcmtlciBwYXJ0aWFsbHkgb3ZlcmxhcHBpbmcgYW4gZXhpc3Rpbmcgb25lXCIpO1xuICAgICAgc2F3Q29sbGFwc2VkU3BhbnMgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChtYXJrZXIuYWRkVG9IaXN0b3J5KVxuICAgICAgYWRkQ2hhbmdlVG9IaXN0b3J5KGRvYywge2Zyb206IGZyb20sIHRvOiB0bywgb3JpZ2luOiBcIm1hcmtUZXh0XCJ9LCBkb2Muc2VsLCBOYU4pO1xuXG4gICAgdmFyIGN1ckxpbmUgPSBmcm9tLmxpbmUsIGNtID0gZG9jLmNtLCB1cGRhdGVNYXhMaW5lO1xuICAgIGRvYy5pdGVyKGN1ckxpbmUsIHRvLmxpbmUgKyAxLCBmdW5jdGlvbihsaW5lKSB7XG4gICAgICBpZiAoY20gJiYgbWFya2VyLmNvbGxhcHNlZCAmJiAhY20ub3B0aW9ucy5saW5lV3JhcHBpbmcgJiYgdmlzdWFsTGluZShsaW5lKSA9PSBjbS5kaXNwbGF5Lm1heExpbmUpXG4gICAgICAgIHVwZGF0ZU1heExpbmUgPSB0cnVlO1xuICAgICAgaWYgKG1hcmtlci5jb2xsYXBzZWQgJiYgY3VyTGluZSAhPSBmcm9tLmxpbmUpIHVwZGF0ZUxpbmVIZWlnaHQobGluZSwgMCk7XG4gICAgICBhZGRNYXJrZWRTcGFuKGxpbmUsIG5ldyBNYXJrZWRTcGFuKG1hcmtlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VyTGluZSA9PSBmcm9tLmxpbmUgPyBmcm9tLmNoIDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VyTGluZSA9PSB0by5saW5lID8gdG8uY2ggOiBudWxsKSk7XG4gICAgICArK2N1ckxpbmU7XG4gICAgfSk7XG4gICAgLy8gbGluZUlzSGlkZGVuIGRlcGVuZHMgb24gdGhlIHByZXNlbmNlIG9mIHRoZSBzcGFucywgc28gbmVlZHMgYSBzZWNvbmQgcGFzc1xuICAgIGlmIChtYXJrZXIuY29sbGFwc2VkKSBkb2MuaXRlcihmcm9tLmxpbmUsIHRvLmxpbmUgKyAxLCBmdW5jdGlvbihsaW5lKSB7XG4gICAgICBpZiAobGluZUlzSGlkZGVuKGRvYywgbGluZSkpIHVwZGF0ZUxpbmVIZWlnaHQobGluZSwgMCk7XG4gICAgfSk7XG5cbiAgICBpZiAobWFya2VyLmNsZWFyT25FbnRlcikgb24obWFya2VyLCBcImJlZm9yZUN1cnNvckVudGVyXCIsIGZ1bmN0aW9uKCkgeyBtYXJrZXIuY2xlYXIoKTsgfSk7XG5cbiAgICBpZiAobWFya2VyLnJlYWRPbmx5KSB7XG4gICAgICBzYXdSZWFkT25seVNwYW5zID0gdHJ1ZTtcbiAgICAgIGlmIChkb2MuaGlzdG9yeS5kb25lLmxlbmd0aCB8fCBkb2MuaGlzdG9yeS51bmRvbmUubGVuZ3RoKVxuICAgICAgICBkb2MuY2xlYXJIaXN0b3J5KCk7XG4gICAgfVxuICAgIGlmIChtYXJrZXIuY29sbGFwc2VkKSB7XG4gICAgICBtYXJrZXIuaWQgPSArK25leHRNYXJrZXJJZDtcbiAgICAgIG1hcmtlci5hdG9taWMgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoY20pIHtcbiAgICAgIC8vIFN5bmMgZWRpdG9yIHN0YXRlXG4gICAgICBpZiAodXBkYXRlTWF4TGluZSkgY20uY3VyT3AudXBkYXRlTWF4TGluZSA9IHRydWU7XG4gICAgICBpZiAobWFya2VyLmNvbGxhcHNlZClcbiAgICAgICAgcmVnQ2hhbmdlKGNtLCBmcm9tLmxpbmUsIHRvLmxpbmUgKyAxKTtcbiAgICAgIGVsc2UgaWYgKG1hcmtlci5jbGFzc05hbWUgfHwgbWFya2VyLnRpdGxlIHx8IG1hcmtlci5zdGFydFN0eWxlIHx8IG1hcmtlci5lbmRTdHlsZSlcbiAgICAgICAgZm9yICh2YXIgaSA9IGZyb20ubGluZTsgaSA8PSB0by5saW5lOyBpKyspIHJlZ0xpbmVDaGFuZ2UoY20sIGksIFwidGV4dFwiKTtcbiAgICAgIGlmIChtYXJrZXIuYXRvbWljKSByZUNoZWNrU2VsZWN0aW9uKGNtLmRvYyk7XG4gICAgICBzaWduYWxMYXRlcihjbSwgXCJtYXJrZXJBZGRlZFwiLCBjbSwgbWFya2VyKTtcbiAgICB9XG4gICAgcmV0dXJuIG1hcmtlcjtcbiAgfVxuXG4gIC8vIFNIQVJFRCBURVhUTUFSS0VSU1xuXG4gIC8vIEEgc2hhcmVkIG1hcmtlciBzcGFucyBtdWx0aXBsZSBsaW5rZWQgZG9jdW1lbnRzLiBJdCBpc1xuICAvLyBpbXBsZW1lbnRlZCBhcyBhIG1ldGEtbWFya2VyLW9iamVjdCBjb250cm9sbGluZyBtdWx0aXBsZSBub3JtYWxcbiAgLy8gbWFya2Vycy5cbiAgdmFyIFNoYXJlZFRleHRNYXJrZXIgPSBDb2RlTWlycm9yLlNoYXJlZFRleHRNYXJrZXIgPSBmdW5jdGlvbihtYXJrZXJzLCBwcmltYXJ5KSB7XG4gICAgdGhpcy5tYXJrZXJzID0gbWFya2VycztcbiAgICB0aGlzLnByaW1hcnkgPSBwcmltYXJ5O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWFya2Vycy5sZW5ndGg7ICsraSlcbiAgICAgIG1hcmtlcnNbaV0ucGFyZW50ID0gdGhpcztcbiAgfTtcbiAgZXZlbnRNaXhpbihTaGFyZWRUZXh0TWFya2VyKTtcblxuICBTaGFyZWRUZXh0TWFya2VyLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmV4cGxpY2l0bHlDbGVhcmVkKSByZXR1cm47XG4gICAgdGhpcy5leHBsaWNpdGx5Q2xlYXJlZCA9IHRydWU7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1hcmtlcnMubGVuZ3RoOyArK2kpXG4gICAgICB0aGlzLm1hcmtlcnNbaV0uY2xlYXIoKTtcbiAgICBzaWduYWxMYXRlcih0aGlzLCBcImNsZWFyXCIpO1xuICB9O1xuICBTaGFyZWRUZXh0TWFya2VyLnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24oc2lkZSwgbGluZU9iaikge1xuICAgIHJldHVybiB0aGlzLnByaW1hcnkuZmluZChzaWRlLCBsaW5lT2JqKTtcbiAgfTtcblxuICBmdW5jdGlvbiBtYXJrVGV4dFNoYXJlZChkb2MsIGZyb20sIHRvLCBvcHRpb25zLCB0eXBlKSB7XG4gICAgb3B0aW9ucyA9IGNvcHlPYmoob3B0aW9ucyk7XG4gICAgb3B0aW9ucy5zaGFyZWQgPSBmYWxzZTtcbiAgICB2YXIgbWFya2VycyA9IFttYXJrVGV4dChkb2MsIGZyb20sIHRvLCBvcHRpb25zLCB0eXBlKV0sIHByaW1hcnkgPSBtYXJrZXJzWzBdO1xuICAgIHZhciB3aWRnZXQgPSBvcHRpb25zLndpZGdldE5vZGU7XG4gICAgbGlua2VkRG9jcyhkb2MsIGZ1bmN0aW9uKGRvYykge1xuICAgICAgaWYgKHdpZGdldCkgb3B0aW9ucy53aWRnZXROb2RlID0gd2lkZ2V0LmNsb25lTm9kZSh0cnVlKTtcbiAgICAgIG1hcmtlcnMucHVzaChtYXJrVGV4dChkb2MsIGNsaXBQb3MoZG9jLCBmcm9tKSwgY2xpcFBvcyhkb2MsIHRvKSwgb3B0aW9ucywgdHlwZSkpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkb2MubGlua2VkLmxlbmd0aDsgKytpKVxuICAgICAgICBpZiAoZG9jLmxpbmtlZFtpXS5pc1BhcmVudCkgcmV0dXJuO1xuICAgICAgcHJpbWFyeSA9IGxzdChtYXJrZXJzKTtcbiAgICB9KTtcbiAgICByZXR1cm4gbmV3IFNoYXJlZFRleHRNYXJrZXIobWFya2VycywgcHJpbWFyeSk7XG4gIH1cblxuICBmdW5jdGlvbiBmaW5kU2hhcmVkTWFya2Vycyhkb2MpIHtcbiAgICByZXR1cm4gZG9jLmZpbmRNYXJrcyhQb3MoZG9jLmZpcnN0LCAwKSwgZG9jLmNsaXBQb3MoUG9zKGRvYy5sYXN0TGluZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24obSkgeyByZXR1cm4gbS5wYXJlbnQ7IH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gY29weVNoYXJlZE1hcmtlcnMoZG9jLCBtYXJrZXJzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXJrZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbWFya2VyID0gbWFya2Vyc1tpXSwgcG9zID0gbWFya2VyLmZpbmQoKTtcbiAgICAgIHZhciBtRnJvbSA9IGRvYy5jbGlwUG9zKHBvcy5mcm9tKSwgbVRvID0gZG9jLmNsaXBQb3MocG9zLnRvKTtcbiAgICAgIGlmIChjbXAobUZyb20sIG1UbykpIHtcbiAgICAgICAgdmFyIHN1Yk1hcmsgPSBtYXJrVGV4dChkb2MsIG1Gcm9tLCBtVG8sIG1hcmtlci5wcmltYXJ5LCBtYXJrZXIucHJpbWFyeS50eXBlKTtcbiAgICAgICAgbWFya2VyLm1hcmtlcnMucHVzaChzdWJNYXJrKTtcbiAgICAgICAgc3ViTWFyay5wYXJlbnQgPSBtYXJrZXI7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZGV0YWNoU2hhcmVkTWFya2VycyhtYXJrZXJzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXJrZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbWFya2VyID0gbWFya2Vyc1tpXSwgbGlua2VkID0gW21hcmtlci5wcmltYXJ5LmRvY107O1xuICAgICAgbGlua2VkRG9jcyhtYXJrZXIucHJpbWFyeS5kb2MsIGZ1bmN0aW9uKGQpIHsgbGlua2VkLnB1c2goZCk7IH0pO1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBtYXJrZXIubWFya2Vycy5sZW5ndGg7IGorKykge1xuICAgICAgICB2YXIgc3ViTWFya2VyID0gbWFya2VyLm1hcmtlcnNbal07XG4gICAgICAgIGlmIChpbmRleE9mKGxpbmtlZCwgc3ViTWFya2VyLmRvYykgPT0gLTEpIHtcbiAgICAgICAgICBzdWJNYXJrZXIucGFyZW50ID0gbnVsbDtcbiAgICAgICAgICBtYXJrZXIubWFya2Vycy5zcGxpY2Uoai0tLCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFRFWFRNQVJLRVIgU1BBTlNcblxuICBmdW5jdGlvbiBNYXJrZWRTcGFuKG1hcmtlciwgZnJvbSwgdG8pIHtcbiAgICB0aGlzLm1hcmtlciA9IG1hcmtlcjtcbiAgICB0aGlzLmZyb20gPSBmcm9tOyB0aGlzLnRvID0gdG87XG4gIH1cblxuICAvLyBTZWFyY2ggYW4gYXJyYXkgb2Ygc3BhbnMgZm9yIGEgc3BhbiBtYXRjaGluZyB0aGUgZ2l2ZW4gbWFya2VyLlxuICBmdW5jdGlvbiBnZXRNYXJrZWRTcGFuRm9yKHNwYW5zLCBtYXJrZXIpIHtcbiAgICBpZiAoc3BhbnMpIGZvciAodmFyIGkgPSAwOyBpIDwgc3BhbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBzcGFuID0gc3BhbnNbaV07XG4gICAgICBpZiAoc3Bhbi5tYXJrZXIgPT0gbWFya2VyKSByZXR1cm4gc3BhbjtcbiAgICB9XG4gIH1cbiAgLy8gUmVtb3ZlIGEgc3BhbiBmcm9tIGFuIGFycmF5LCByZXR1cm5pbmcgdW5kZWZpbmVkIGlmIG5vIHNwYW5zIGFyZVxuICAvLyBsZWZ0ICh3ZSBkb24ndCBzdG9yZSBhcnJheXMgZm9yIGxpbmVzIHdpdGhvdXQgc3BhbnMpLlxuICBmdW5jdGlvbiByZW1vdmVNYXJrZWRTcGFuKHNwYW5zLCBzcGFuKSB7XG4gICAgZm9yICh2YXIgciwgaSA9IDA7IGkgPCBzcGFucy5sZW5ndGg7ICsraSlcbiAgICAgIGlmIChzcGFuc1tpXSAhPSBzcGFuKSAociB8fCAociA9IFtdKSkucHVzaChzcGFuc1tpXSk7XG4gICAgcmV0dXJuIHI7XG4gIH1cbiAgLy8gQWRkIGEgc3BhbiB0byBhIGxpbmUuXG4gIGZ1bmN0aW9uIGFkZE1hcmtlZFNwYW4obGluZSwgc3Bhbikge1xuICAgIGxpbmUubWFya2VkU3BhbnMgPSBsaW5lLm1hcmtlZFNwYW5zID8gbGluZS5tYXJrZWRTcGFucy5jb25jYXQoW3NwYW5dKSA6IFtzcGFuXTtcbiAgICBzcGFuLm1hcmtlci5hdHRhY2hMaW5lKGxpbmUpO1xuICB9XG5cbiAgLy8gVXNlZCBmb3IgdGhlIGFsZ29yaXRobSB0aGF0IGFkanVzdHMgbWFya2VycyBmb3IgYSBjaGFuZ2UgaW4gdGhlXG4gIC8vIGRvY3VtZW50LiBUaGVzZSBmdW5jdGlvbnMgY3V0IGFuIGFycmF5IG9mIHNwYW5zIGF0IGEgZ2l2ZW5cbiAgLy8gY2hhcmFjdGVyIHBvc2l0aW9uLCByZXR1cm5pbmcgYW4gYXJyYXkgb2YgcmVtYWluaW5nIGNodW5rcyAob3JcbiAgLy8gdW5kZWZpbmVkIGlmIG5vdGhpbmcgcmVtYWlucykuXG4gIGZ1bmN0aW9uIG1hcmtlZFNwYW5zQmVmb3JlKG9sZCwgc3RhcnRDaCwgaXNJbnNlcnQpIHtcbiAgICBpZiAob2xkKSBmb3IgKHZhciBpID0gMCwgbnc7IGkgPCBvbGQubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBzcGFuID0gb2xkW2ldLCBtYXJrZXIgPSBzcGFuLm1hcmtlcjtcbiAgICAgIHZhciBzdGFydHNCZWZvcmUgPSBzcGFuLmZyb20gPT0gbnVsbCB8fCAobWFya2VyLmluY2x1c2l2ZUxlZnQgPyBzcGFuLmZyb20gPD0gc3RhcnRDaCA6IHNwYW4uZnJvbSA8IHN0YXJ0Q2gpO1xuICAgICAgaWYgKHN0YXJ0c0JlZm9yZSB8fCBzcGFuLmZyb20gPT0gc3RhcnRDaCAmJiBtYXJrZXIudHlwZSA9PSBcImJvb2ttYXJrXCIgJiYgKCFpc0luc2VydCB8fCAhc3Bhbi5tYXJrZXIuaW5zZXJ0TGVmdCkpIHtcbiAgICAgICAgdmFyIGVuZHNBZnRlciA9IHNwYW4udG8gPT0gbnVsbCB8fCAobWFya2VyLmluY2x1c2l2ZVJpZ2h0ID8gc3Bhbi50byA+PSBzdGFydENoIDogc3Bhbi50byA+IHN0YXJ0Q2gpO1xuICAgICAgICAobncgfHwgKG53ID0gW10pKS5wdXNoKG5ldyBNYXJrZWRTcGFuKG1hcmtlciwgc3Bhbi5mcm9tLCBlbmRzQWZ0ZXIgPyBudWxsIDogc3Bhbi50bykpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnc7XG4gIH1cbiAgZnVuY3Rpb24gbWFya2VkU3BhbnNBZnRlcihvbGQsIGVuZENoLCBpc0luc2VydCkge1xuICAgIGlmIChvbGQpIGZvciAodmFyIGkgPSAwLCBudzsgaSA8IG9sZC5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHNwYW4gPSBvbGRbaV0sIG1hcmtlciA9IHNwYW4ubWFya2VyO1xuICAgICAgdmFyIGVuZHNBZnRlciA9IHNwYW4udG8gPT0gbnVsbCB8fCAobWFya2VyLmluY2x1c2l2ZVJpZ2h0ID8gc3Bhbi50byA+PSBlbmRDaCA6IHNwYW4udG8gPiBlbmRDaCk7XG4gICAgICBpZiAoZW5kc0FmdGVyIHx8IHNwYW4uZnJvbSA9PSBlbmRDaCAmJiBtYXJrZXIudHlwZSA9PSBcImJvb2ttYXJrXCIgJiYgKCFpc0luc2VydCB8fCBzcGFuLm1hcmtlci5pbnNlcnRMZWZ0KSkge1xuICAgICAgICB2YXIgc3RhcnRzQmVmb3JlID0gc3Bhbi5mcm9tID09IG51bGwgfHwgKG1hcmtlci5pbmNsdXNpdmVMZWZ0ID8gc3Bhbi5mcm9tIDw9IGVuZENoIDogc3Bhbi5mcm9tIDwgZW5kQ2gpO1xuICAgICAgICAobncgfHwgKG53ID0gW10pKS5wdXNoKG5ldyBNYXJrZWRTcGFuKG1hcmtlciwgc3RhcnRzQmVmb3JlID8gbnVsbCA6IHNwYW4uZnJvbSAtIGVuZENoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwYW4udG8gPT0gbnVsbCA/IG51bGwgOiBzcGFuLnRvIC0gZW5kQ2gpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG53O1xuICB9XG5cbiAgLy8gR2l2ZW4gYSBjaGFuZ2Ugb2JqZWN0LCBjb21wdXRlIHRoZSBuZXcgc2V0IG9mIG1hcmtlciBzcGFucyB0aGF0XG4gIC8vIGNvdmVyIHRoZSBsaW5lIGluIHdoaWNoIHRoZSBjaGFuZ2UgdG9vayBwbGFjZS4gUmVtb3ZlcyBzcGFuc1xuICAvLyBlbnRpcmVseSB3aXRoaW4gdGhlIGNoYW5nZSwgcmVjb25uZWN0cyBzcGFucyBiZWxvbmdpbmcgdG8gdGhlXG4gIC8vIHNhbWUgbWFya2VyIHRoYXQgYXBwZWFyIG9uIGJvdGggc2lkZXMgb2YgdGhlIGNoYW5nZSwgYW5kIGN1dHMgb2ZmXG4gIC8vIHNwYW5zIHBhcnRpYWxseSB3aXRoaW4gdGhlIGNoYW5nZS4gUmV0dXJucyBhbiBhcnJheSBvZiBzcGFuXG4gIC8vIGFycmF5cyB3aXRoIG9uZSBlbGVtZW50IGZvciBlYWNoIGxpbmUgaW4gKGFmdGVyKSB0aGUgY2hhbmdlLlxuICBmdW5jdGlvbiBzdHJldGNoU3BhbnNPdmVyQ2hhbmdlKGRvYywgY2hhbmdlKSB7XG4gICAgdmFyIG9sZEZpcnN0ID0gaXNMaW5lKGRvYywgY2hhbmdlLmZyb20ubGluZSkgJiYgZ2V0TGluZShkb2MsIGNoYW5nZS5mcm9tLmxpbmUpLm1hcmtlZFNwYW5zO1xuICAgIHZhciBvbGRMYXN0ID0gaXNMaW5lKGRvYywgY2hhbmdlLnRvLmxpbmUpICYmIGdldExpbmUoZG9jLCBjaGFuZ2UudG8ubGluZSkubWFya2VkU3BhbnM7XG4gICAgaWYgKCFvbGRGaXJzdCAmJiAhb2xkTGFzdCkgcmV0dXJuIG51bGw7XG5cbiAgICB2YXIgc3RhcnRDaCA9IGNoYW5nZS5mcm9tLmNoLCBlbmRDaCA9IGNoYW5nZS50by5jaCwgaXNJbnNlcnQgPSBjbXAoY2hhbmdlLmZyb20sIGNoYW5nZS50bykgPT0gMDtcbiAgICAvLyBHZXQgdGhlIHNwYW5zIHRoYXQgJ3N0aWNrIG91dCcgb24gYm90aCBzaWRlc1xuICAgIHZhciBmaXJzdCA9IG1hcmtlZFNwYW5zQmVmb3JlKG9sZEZpcnN0LCBzdGFydENoLCBpc0luc2VydCk7XG4gICAgdmFyIGxhc3QgPSBtYXJrZWRTcGFuc0FmdGVyKG9sZExhc3QsIGVuZENoLCBpc0luc2VydCk7XG5cbiAgICAvLyBOZXh0LCBtZXJnZSB0aG9zZSB0d28gZW5kc1xuICAgIHZhciBzYW1lTGluZSA9IGNoYW5nZS50ZXh0Lmxlbmd0aCA9PSAxLCBvZmZzZXQgPSBsc3QoY2hhbmdlLnRleHQpLmxlbmd0aCArIChzYW1lTGluZSA/IHN0YXJ0Q2ggOiAwKTtcbiAgICBpZiAoZmlyc3QpIHtcbiAgICAgIC8vIEZpeCB1cCAudG8gcHJvcGVydGllcyBvZiBmaXJzdFxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaXJzdC5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgc3BhbiA9IGZpcnN0W2ldO1xuICAgICAgICBpZiAoc3Bhbi50byA9PSBudWxsKSB7XG4gICAgICAgICAgdmFyIGZvdW5kID0gZ2V0TWFya2VkU3BhbkZvcihsYXN0LCBzcGFuLm1hcmtlcik7XG4gICAgICAgICAgaWYgKCFmb3VuZCkgc3Bhbi50byA9IHN0YXJ0Q2g7XG4gICAgICAgICAgZWxzZSBpZiAoc2FtZUxpbmUpIHNwYW4udG8gPSBmb3VuZC50byA9PSBudWxsID8gbnVsbCA6IGZvdW5kLnRvICsgb2Zmc2V0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChsYXN0KSB7XG4gICAgICAvLyBGaXggdXAgLmZyb20gaW4gbGFzdCAob3IgbW92ZSB0aGVtIGludG8gZmlyc3QgaW4gY2FzZSBvZiBzYW1lTGluZSlcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdC5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgc3BhbiA9IGxhc3RbaV07XG4gICAgICAgIGlmIChzcGFuLnRvICE9IG51bGwpIHNwYW4udG8gKz0gb2Zmc2V0O1xuICAgICAgICBpZiAoc3Bhbi5mcm9tID09IG51bGwpIHtcbiAgICAgICAgICB2YXIgZm91bmQgPSBnZXRNYXJrZWRTcGFuRm9yKGZpcnN0LCBzcGFuLm1hcmtlcik7XG4gICAgICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICAgICAgc3Bhbi5mcm9tID0gb2Zmc2V0O1xuICAgICAgICAgICAgaWYgKHNhbWVMaW5lKSAoZmlyc3QgfHwgKGZpcnN0ID0gW10pKS5wdXNoKHNwYW4pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzcGFuLmZyb20gKz0gb2Zmc2V0O1xuICAgICAgICAgIGlmIChzYW1lTGluZSkgKGZpcnN0IHx8IChmaXJzdCA9IFtdKSkucHVzaChzcGFuKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICAvLyBNYWtlIHN1cmUgd2UgZGlkbid0IGNyZWF0ZSBhbnkgemVyby1sZW5ndGggc3BhbnNcbiAgICBpZiAoZmlyc3QpIGZpcnN0ID0gY2xlYXJFbXB0eVNwYW5zKGZpcnN0KTtcbiAgICBpZiAobGFzdCAmJiBsYXN0ICE9IGZpcnN0KSBsYXN0ID0gY2xlYXJFbXB0eVNwYW5zKGxhc3QpO1xuXG4gICAgdmFyIG5ld01hcmtlcnMgPSBbZmlyc3RdO1xuICAgIGlmICghc2FtZUxpbmUpIHtcbiAgICAgIC8vIEZpbGwgZ2FwIHdpdGggd2hvbGUtbGluZS1zcGFuc1xuICAgICAgdmFyIGdhcCA9IGNoYW5nZS50ZXh0Lmxlbmd0aCAtIDIsIGdhcE1hcmtlcnM7XG4gICAgICBpZiAoZ2FwID4gMCAmJiBmaXJzdClcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaXJzdC5sZW5ndGg7ICsraSlcbiAgICAgICAgICBpZiAoZmlyc3RbaV0udG8gPT0gbnVsbClcbiAgICAgICAgICAgIChnYXBNYXJrZXJzIHx8IChnYXBNYXJrZXJzID0gW10pKS5wdXNoKG5ldyBNYXJrZWRTcGFuKGZpcnN0W2ldLm1hcmtlciwgbnVsbCwgbnVsbCkpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnYXA7ICsraSlcbiAgICAgICAgbmV3TWFya2Vycy5wdXNoKGdhcE1hcmtlcnMpO1xuICAgICAgbmV3TWFya2Vycy5wdXNoKGxhc3QpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3TWFya2VycztcbiAgfVxuXG4gIC8vIFJlbW92ZSBzcGFucyB0aGF0IGFyZSBlbXB0eSBhbmQgZG9uJ3QgaGF2ZSBhIGNsZWFyV2hlbkVtcHR5XG4gIC8vIG9wdGlvbiBvZiBmYWxzZS5cbiAgZnVuY3Rpb24gY2xlYXJFbXB0eVNwYW5zKHNwYW5zKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcGFucy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHNwYW4gPSBzcGFuc1tpXTtcbiAgICAgIGlmIChzcGFuLmZyb20gIT0gbnVsbCAmJiBzcGFuLmZyb20gPT0gc3Bhbi50byAmJiBzcGFuLm1hcmtlci5jbGVhcldoZW5FbXB0eSAhPT0gZmFsc2UpXG4gICAgICAgIHNwYW5zLnNwbGljZShpLS0sIDEpO1xuICAgIH1cbiAgICBpZiAoIXNwYW5zLmxlbmd0aCkgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIHNwYW5zO1xuICB9XG5cbiAgLy8gVXNlZCBmb3IgdW4vcmUtZG9pbmcgY2hhbmdlcyBmcm9tIHRoZSBoaXN0b3J5LiBDb21iaW5lcyB0aGVcbiAgLy8gcmVzdWx0IG9mIGNvbXB1dGluZyB0aGUgZXhpc3Rpbmcgc3BhbnMgd2l0aCB0aGUgc2V0IG9mIHNwYW5zIHRoYXRcbiAgLy8gZXhpc3RlZCBpbiB0aGUgaGlzdG9yeSAoc28gdGhhdCBkZWxldGluZyBhcm91bmQgYSBzcGFuIGFuZCB0aGVuXG4gIC8vIHVuZG9pbmcgYnJpbmdzIGJhY2sgdGhlIHNwYW4pLlxuICBmdW5jdGlvbiBtZXJnZU9sZFNwYW5zKGRvYywgY2hhbmdlKSB7XG4gICAgdmFyIG9sZCA9IGdldE9sZFNwYW5zKGRvYywgY2hhbmdlKTtcbiAgICB2YXIgc3RyZXRjaGVkID0gc3RyZXRjaFNwYW5zT3ZlckNoYW5nZShkb2MsIGNoYW5nZSk7XG4gICAgaWYgKCFvbGQpIHJldHVybiBzdHJldGNoZWQ7XG4gICAgaWYgKCFzdHJldGNoZWQpIHJldHVybiBvbGQ7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9sZC5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIG9sZEN1ciA9IG9sZFtpXSwgc3RyZXRjaEN1ciA9IHN0cmV0Y2hlZFtpXTtcbiAgICAgIGlmIChvbGRDdXIgJiYgc3RyZXRjaEN1cikge1xuICAgICAgICBzcGFuczogZm9yICh2YXIgaiA9IDA7IGogPCBzdHJldGNoQ3VyLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgdmFyIHNwYW4gPSBzdHJldGNoQ3VyW2pdO1xuICAgICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgb2xkQ3VyLmxlbmd0aDsgKytrKVxuICAgICAgICAgICAgaWYgKG9sZEN1cltrXS5tYXJrZXIgPT0gc3Bhbi5tYXJrZXIpIGNvbnRpbnVlIHNwYW5zO1xuICAgICAgICAgIG9sZEN1ci5wdXNoKHNwYW4pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHN0cmV0Y2hDdXIpIHtcbiAgICAgICAgb2xkW2ldID0gc3RyZXRjaEN1cjtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9sZDtcbiAgfVxuXG4gIC8vIFVzZWQgdG8gJ2NsaXAnIG91dCByZWFkT25seSByYW5nZXMgd2hlbiBtYWtpbmcgYSBjaGFuZ2UuXG4gIGZ1bmN0aW9uIHJlbW92ZVJlYWRPbmx5UmFuZ2VzKGRvYywgZnJvbSwgdG8pIHtcbiAgICB2YXIgbWFya2VycyA9IG51bGw7XG4gICAgZG9jLml0ZXIoZnJvbS5saW5lLCB0by5saW5lICsgMSwgZnVuY3Rpb24obGluZSkge1xuICAgICAgaWYgKGxpbmUubWFya2VkU3BhbnMpIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZS5tYXJrZWRTcGFucy5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgbWFyayA9IGxpbmUubWFya2VkU3BhbnNbaV0ubWFya2VyO1xuICAgICAgICBpZiAobWFyay5yZWFkT25seSAmJiAoIW1hcmtlcnMgfHwgaW5kZXhPZihtYXJrZXJzLCBtYXJrKSA9PSAtMSkpXG4gICAgICAgICAgKG1hcmtlcnMgfHwgKG1hcmtlcnMgPSBbXSkpLnB1c2gobWFyayk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKCFtYXJrZXJzKSByZXR1cm4gbnVsbDtcbiAgICB2YXIgcGFydHMgPSBbe2Zyb206IGZyb20sIHRvOiB0b31dO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWFya2Vycy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIG1rID0gbWFya2Vyc1tpXSwgbSA9IG1rLmZpbmQoMCk7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHBhcnRzLmxlbmd0aDsgKytqKSB7XG4gICAgICAgIHZhciBwID0gcGFydHNbal07XG4gICAgICAgIGlmIChjbXAocC50bywgbS5mcm9tKSA8IDAgfHwgY21wKHAuZnJvbSwgbS50bykgPiAwKSBjb250aW51ZTtcbiAgICAgICAgdmFyIG5ld1BhcnRzID0gW2osIDFdLCBkZnJvbSA9IGNtcChwLmZyb20sIG0uZnJvbSksIGR0byA9IGNtcChwLnRvLCBtLnRvKTtcbiAgICAgICAgaWYgKGRmcm9tIDwgMCB8fCAhbWsuaW5jbHVzaXZlTGVmdCAmJiAhZGZyb20pXG4gICAgICAgICAgbmV3UGFydHMucHVzaCh7ZnJvbTogcC5mcm9tLCB0bzogbS5mcm9tfSk7XG4gICAgICAgIGlmIChkdG8gPiAwIHx8ICFtay5pbmNsdXNpdmVSaWdodCAmJiAhZHRvKVxuICAgICAgICAgIG5ld1BhcnRzLnB1c2goe2Zyb206IG0udG8sIHRvOiBwLnRvfSk7XG4gICAgICAgIHBhcnRzLnNwbGljZS5hcHBseShwYXJ0cywgbmV3UGFydHMpO1xuICAgICAgICBqICs9IG5ld1BhcnRzLmxlbmd0aCAtIDE7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwYXJ0cztcbiAgfVxuXG4gIC8vIENvbm5lY3Qgb3IgZGlzY29ubmVjdCBzcGFucyBmcm9tIGEgbGluZS5cbiAgZnVuY3Rpb24gZGV0YWNoTWFya2VkU3BhbnMobGluZSkge1xuICAgIHZhciBzcGFucyA9IGxpbmUubWFya2VkU3BhbnM7XG4gICAgaWYgKCFzcGFucykgcmV0dXJuO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3BhbnMubGVuZ3RoOyArK2kpXG4gICAgICBzcGFuc1tpXS5tYXJrZXIuZGV0YWNoTGluZShsaW5lKTtcbiAgICBsaW5lLm1hcmtlZFNwYW5zID0gbnVsbDtcbiAgfVxuICBmdW5jdGlvbiBhdHRhY2hNYXJrZWRTcGFucyhsaW5lLCBzcGFucykge1xuICAgIGlmICghc3BhbnMpIHJldHVybjtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNwYW5zLmxlbmd0aDsgKytpKVxuICAgICAgc3BhbnNbaV0ubWFya2VyLmF0dGFjaExpbmUobGluZSk7XG4gICAgbGluZS5tYXJrZWRTcGFucyA9IHNwYW5zO1xuICB9XG5cbiAgLy8gSGVscGVycyB1c2VkIHdoZW4gY29tcHV0aW5nIHdoaWNoIG92ZXJsYXBwaW5nIGNvbGxhcHNlZCBzcGFuXG4gIC8vIGNvdW50cyBhcyB0aGUgbGFyZ2VyIG9uZS5cbiAgZnVuY3Rpb24gZXh0cmFMZWZ0KG1hcmtlcikgeyByZXR1cm4gbWFya2VyLmluY2x1c2l2ZUxlZnQgPyAtMSA6IDA7IH1cbiAgZnVuY3Rpb24gZXh0cmFSaWdodChtYXJrZXIpIHsgcmV0dXJuIG1hcmtlci5pbmNsdXNpdmVSaWdodCA/IDEgOiAwOyB9XG5cbiAgLy8gUmV0dXJucyBhIG51bWJlciBpbmRpY2F0aW5nIHdoaWNoIG9mIHR3byBvdmVybGFwcGluZyBjb2xsYXBzZWRcbiAgLy8gc3BhbnMgaXMgbGFyZ2VyIChhbmQgdGh1cyBpbmNsdWRlcyB0aGUgb3RoZXIpLiBGYWxscyBiYWNrIHRvXG4gIC8vIGNvbXBhcmluZyBpZHMgd2hlbiB0aGUgc3BhbnMgY292ZXIgZXhhY3RseSB0aGUgc2FtZSByYW5nZS5cbiAgZnVuY3Rpb24gY29tcGFyZUNvbGxhcHNlZE1hcmtlcnMoYSwgYikge1xuICAgIHZhciBsZW5EaWZmID0gYS5saW5lcy5sZW5ndGggLSBiLmxpbmVzLmxlbmd0aDtcbiAgICBpZiAobGVuRGlmZiAhPSAwKSByZXR1cm4gbGVuRGlmZjtcbiAgICB2YXIgYVBvcyA9IGEuZmluZCgpLCBiUG9zID0gYi5maW5kKCk7XG4gICAgdmFyIGZyb21DbXAgPSBjbXAoYVBvcy5mcm9tLCBiUG9zLmZyb20pIHx8IGV4dHJhTGVmdChhKSAtIGV4dHJhTGVmdChiKTtcbiAgICBpZiAoZnJvbUNtcCkgcmV0dXJuIC1mcm9tQ21wO1xuICAgIHZhciB0b0NtcCA9IGNtcChhUG9zLnRvLCBiUG9zLnRvKSB8fCBleHRyYVJpZ2h0KGEpIC0gZXh0cmFSaWdodChiKTtcbiAgICBpZiAodG9DbXApIHJldHVybiB0b0NtcDtcbiAgICByZXR1cm4gYi5pZCAtIGEuaWQ7XG4gIH1cblxuICAvLyBGaW5kIG91dCB3aGV0aGVyIGEgbGluZSBlbmRzIG9yIHN0YXJ0cyBpbiBhIGNvbGxhcHNlZCBzcGFuLiBJZlxuICAvLyBzbywgcmV0dXJuIHRoZSBtYXJrZXIgZm9yIHRoYXQgc3Bhbi5cbiAgZnVuY3Rpb24gY29sbGFwc2VkU3BhbkF0U2lkZShsaW5lLCBzdGFydCkge1xuICAgIHZhciBzcHMgPSBzYXdDb2xsYXBzZWRTcGFucyAmJiBsaW5lLm1hcmtlZFNwYW5zLCBmb3VuZDtcbiAgICBpZiAoc3BzKSBmb3IgKHZhciBzcCwgaSA9IDA7IGkgPCBzcHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHNwID0gc3BzW2ldO1xuICAgICAgaWYgKHNwLm1hcmtlci5jb2xsYXBzZWQgJiYgKHN0YXJ0ID8gc3AuZnJvbSA6IHNwLnRvKSA9PSBudWxsICYmXG4gICAgICAgICAgKCFmb3VuZCB8fCBjb21wYXJlQ29sbGFwc2VkTWFya2Vycyhmb3VuZCwgc3AubWFya2VyKSA8IDApKVxuICAgICAgICBmb3VuZCA9IHNwLm1hcmtlcjtcbiAgICB9XG4gICAgcmV0dXJuIGZvdW5kO1xuICB9XG4gIGZ1bmN0aW9uIGNvbGxhcHNlZFNwYW5BdFN0YXJ0KGxpbmUpIHsgcmV0dXJuIGNvbGxhcHNlZFNwYW5BdFNpZGUobGluZSwgdHJ1ZSk7IH1cbiAgZnVuY3Rpb24gY29sbGFwc2VkU3BhbkF0RW5kKGxpbmUpIHsgcmV0dXJuIGNvbGxhcHNlZFNwYW5BdFNpZGUobGluZSwgZmFsc2UpOyB9XG5cbiAgLy8gVGVzdCB3aGV0aGVyIHRoZXJlIGV4aXN0cyBhIGNvbGxhcHNlZCBzcGFuIHRoYXQgcGFydGlhbGx5XG4gIC8vIG92ZXJsYXBzIChjb3ZlcnMgdGhlIHN0YXJ0IG9yIGVuZCwgYnV0IG5vdCBib3RoKSBvZiBhIG5ldyBzcGFuLlxuICAvLyBTdWNoIG92ZXJsYXAgaXMgbm90IGFsbG93ZWQuXG4gIGZ1bmN0aW9uIGNvbmZsaWN0aW5nQ29sbGFwc2VkUmFuZ2UoZG9jLCBsaW5lTm8sIGZyb20sIHRvLCBtYXJrZXIpIHtcbiAgICB2YXIgbGluZSA9IGdldExpbmUoZG9jLCBsaW5lTm8pO1xuICAgIHZhciBzcHMgPSBzYXdDb2xsYXBzZWRTcGFucyAmJiBsaW5lLm1hcmtlZFNwYW5zO1xuICAgIGlmIChzcHMpIGZvciAodmFyIGkgPSAwOyBpIDwgc3BzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgc3AgPSBzcHNbaV07XG4gICAgICBpZiAoIXNwLm1hcmtlci5jb2xsYXBzZWQpIGNvbnRpbnVlO1xuICAgICAgdmFyIGZvdW5kID0gc3AubWFya2VyLmZpbmQoMCk7XG4gICAgICB2YXIgZnJvbUNtcCA9IGNtcChmb3VuZC5mcm9tLCBmcm9tKSB8fCBleHRyYUxlZnQoc3AubWFya2VyKSAtIGV4dHJhTGVmdChtYXJrZXIpO1xuICAgICAgdmFyIHRvQ21wID0gY21wKGZvdW5kLnRvLCB0bykgfHwgZXh0cmFSaWdodChzcC5tYXJrZXIpIC0gZXh0cmFSaWdodChtYXJrZXIpO1xuICAgICAgaWYgKGZyb21DbXAgPj0gMCAmJiB0b0NtcCA8PSAwIHx8IGZyb21DbXAgPD0gMCAmJiB0b0NtcCA+PSAwKSBjb250aW51ZTtcbiAgICAgIGlmIChmcm9tQ21wIDw9IDAgJiYgKGNtcChmb3VuZC50bywgZnJvbSkgfHwgZXh0cmFSaWdodChzcC5tYXJrZXIpIC0gZXh0cmFMZWZ0KG1hcmtlcikpID4gMCB8fFxuICAgICAgICAgIGZyb21DbXAgPj0gMCAmJiAoY21wKGZvdW5kLmZyb20sIHRvKSB8fCBleHRyYUxlZnQoc3AubWFya2VyKSAtIGV4dHJhUmlnaHQobWFya2VyKSkgPCAwKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvLyBBIHZpc3VhbCBsaW5lIGlzIGEgbGluZSBhcyBkcmF3biBvbiB0aGUgc2NyZWVuLiBGb2xkaW5nLCBmb3JcbiAgLy8gZXhhbXBsZSwgY2FuIGNhdXNlIG11bHRpcGxlIGxvZ2ljYWwgbGluZXMgdG8gYXBwZWFyIG9uIHRoZSBzYW1lXG4gIC8vIHZpc3VhbCBsaW5lLiBUaGlzIGZpbmRzIHRoZSBzdGFydCBvZiB0aGUgdmlzdWFsIGxpbmUgdGhhdCB0aGVcbiAgLy8gZ2l2ZW4gbGluZSBpcyBwYXJ0IG9mICh1c3VhbGx5IHRoYXQgaXMgdGhlIGxpbmUgaXRzZWxmKS5cbiAgZnVuY3Rpb24gdmlzdWFsTGluZShsaW5lKSB7XG4gICAgdmFyIG1lcmdlZDtcbiAgICB3aGlsZSAobWVyZ2VkID0gY29sbGFwc2VkU3BhbkF0U3RhcnQobGluZSkpXG4gICAgICBsaW5lID0gbWVyZ2VkLmZpbmQoLTEsIHRydWUpLmxpbmU7XG4gICAgcmV0dXJuIGxpbmU7XG4gIH1cblxuICAvLyBSZXR1cm5zIGFuIGFycmF5IG9mIGxvZ2ljYWwgbGluZXMgdGhhdCBjb250aW51ZSB0aGUgdmlzdWFsIGxpbmVcbiAgLy8gc3RhcnRlZCBieSB0aGUgYXJndW1lbnQsIG9yIHVuZGVmaW5lZCBpZiB0aGVyZSBhcmUgbm8gc3VjaCBsaW5lcy5cbiAgZnVuY3Rpb24gdmlzdWFsTGluZUNvbnRpbnVlZChsaW5lKSB7XG4gICAgdmFyIG1lcmdlZCwgbGluZXM7XG4gICAgd2hpbGUgKG1lcmdlZCA9IGNvbGxhcHNlZFNwYW5BdEVuZChsaW5lKSkge1xuICAgICAgbGluZSA9IG1lcmdlZC5maW5kKDEsIHRydWUpLmxpbmU7XG4gICAgICAobGluZXMgfHwgKGxpbmVzID0gW10pKS5wdXNoKGxpbmUpO1xuICAgIH1cbiAgICByZXR1cm4gbGluZXM7XG4gIH1cblxuICAvLyBHZXQgdGhlIGxpbmUgbnVtYmVyIG9mIHRoZSBzdGFydCBvZiB0aGUgdmlzdWFsIGxpbmUgdGhhdCB0aGVcbiAgLy8gZ2l2ZW4gbGluZSBudW1iZXIgaXMgcGFydCBvZi5cbiAgZnVuY3Rpb24gdmlzdWFsTGluZU5vKGRvYywgbGluZU4pIHtcbiAgICB2YXIgbGluZSA9IGdldExpbmUoZG9jLCBsaW5lTiksIHZpcyA9IHZpc3VhbExpbmUobGluZSk7XG4gICAgaWYgKGxpbmUgPT0gdmlzKSByZXR1cm4gbGluZU47XG4gICAgcmV0dXJuIGxpbmVObyh2aXMpO1xuICB9XG4gIC8vIEdldCB0aGUgbGluZSBudW1iZXIgb2YgdGhlIHN0YXJ0IG9mIHRoZSBuZXh0IHZpc3VhbCBsaW5lIGFmdGVyXG4gIC8vIHRoZSBnaXZlbiBsaW5lLlxuICBmdW5jdGlvbiB2aXN1YWxMaW5lRW5kTm8oZG9jLCBsaW5lTikge1xuICAgIGlmIChsaW5lTiA+IGRvYy5sYXN0TGluZSgpKSByZXR1cm4gbGluZU47XG4gICAgdmFyIGxpbmUgPSBnZXRMaW5lKGRvYywgbGluZU4pLCBtZXJnZWQ7XG4gICAgaWYgKCFsaW5lSXNIaWRkZW4oZG9jLCBsaW5lKSkgcmV0dXJuIGxpbmVOO1xuICAgIHdoaWxlIChtZXJnZWQgPSBjb2xsYXBzZWRTcGFuQXRFbmQobGluZSkpXG4gICAgICBsaW5lID0gbWVyZ2VkLmZpbmQoMSwgdHJ1ZSkubGluZTtcbiAgICByZXR1cm4gbGluZU5vKGxpbmUpICsgMTtcbiAgfVxuXG4gIC8vIENvbXB1dGUgd2hldGhlciBhIGxpbmUgaXMgaGlkZGVuLiBMaW5lcyBjb3VudCBhcyBoaWRkZW4gd2hlbiB0aGV5XG4gIC8vIGFyZSBwYXJ0IG9mIGEgdmlzdWFsIGxpbmUgdGhhdCBzdGFydHMgd2l0aCBhbm90aGVyIGxpbmUsIG9yIHdoZW5cbiAgLy8gdGhleSBhcmUgZW50aXJlbHkgY292ZXJlZCBieSBjb2xsYXBzZWQsIG5vbi13aWRnZXQgc3Bhbi5cbiAgZnVuY3Rpb24gbGluZUlzSGlkZGVuKGRvYywgbGluZSkge1xuICAgIHZhciBzcHMgPSBzYXdDb2xsYXBzZWRTcGFucyAmJiBsaW5lLm1hcmtlZFNwYW5zO1xuICAgIGlmIChzcHMpIGZvciAodmFyIHNwLCBpID0gMDsgaSA8IHNwcy5sZW5ndGg7ICsraSkge1xuICAgICAgc3AgPSBzcHNbaV07XG4gICAgICBpZiAoIXNwLm1hcmtlci5jb2xsYXBzZWQpIGNvbnRpbnVlO1xuICAgICAgaWYgKHNwLmZyb20gPT0gbnVsbCkgcmV0dXJuIHRydWU7XG4gICAgICBpZiAoc3AubWFya2VyLndpZGdldE5vZGUpIGNvbnRpbnVlO1xuICAgICAgaWYgKHNwLmZyb20gPT0gMCAmJiBzcC5tYXJrZXIuaW5jbHVzaXZlTGVmdCAmJiBsaW5lSXNIaWRkZW5Jbm5lcihkb2MsIGxpbmUsIHNwKSlcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIGxpbmVJc0hpZGRlbklubmVyKGRvYywgbGluZSwgc3Bhbikge1xuICAgIGlmIChzcGFuLnRvID09IG51bGwpIHtcbiAgICAgIHZhciBlbmQgPSBzcGFuLm1hcmtlci5maW5kKDEsIHRydWUpO1xuICAgICAgcmV0dXJuIGxpbmVJc0hpZGRlbklubmVyKGRvYywgZW5kLmxpbmUsIGdldE1hcmtlZFNwYW5Gb3IoZW5kLmxpbmUubWFya2VkU3BhbnMsIHNwYW4ubWFya2VyKSk7XG4gICAgfVxuICAgIGlmIChzcGFuLm1hcmtlci5pbmNsdXNpdmVSaWdodCAmJiBzcGFuLnRvID09IGxpbmUudGV4dC5sZW5ndGgpXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBmb3IgKHZhciBzcCwgaSA9IDA7IGkgPCBsaW5lLm1hcmtlZFNwYW5zLmxlbmd0aDsgKytpKSB7XG4gICAgICBzcCA9IGxpbmUubWFya2VkU3BhbnNbaV07XG4gICAgICBpZiAoc3AubWFya2VyLmNvbGxhcHNlZCAmJiAhc3AubWFya2VyLndpZGdldE5vZGUgJiYgc3AuZnJvbSA9PSBzcGFuLnRvICYmXG4gICAgICAgICAgKHNwLnRvID09IG51bGwgfHwgc3AudG8gIT0gc3Bhbi5mcm9tKSAmJlxuICAgICAgICAgIChzcC5tYXJrZXIuaW5jbHVzaXZlTGVmdCB8fCBzcGFuLm1hcmtlci5pbmNsdXNpdmVSaWdodCkgJiZcbiAgICAgICAgICBsaW5lSXNIaWRkZW5Jbm5lcihkb2MsIGxpbmUsIHNwKSkgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgLy8gTElORSBXSURHRVRTXG5cbiAgLy8gTGluZSB3aWRnZXRzIGFyZSBibG9jayBlbGVtZW50cyBkaXNwbGF5ZWQgYWJvdmUgb3IgYmVsb3cgYSBsaW5lLlxuXG4gIHZhciBMaW5lV2lkZ2V0ID0gQ29kZU1pcnJvci5MaW5lV2lkZ2V0ID0gZnVuY3Rpb24oY20sIG5vZGUsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucykgZm9yICh2YXIgb3B0IGluIG9wdGlvbnMpIGlmIChvcHRpb25zLmhhc093blByb3BlcnR5KG9wdCkpXG4gICAgICB0aGlzW29wdF0gPSBvcHRpb25zW29wdF07XG4gICAgdGhpcy5jbSA9IGNtO1xuICAgIHRoaXMubm9kZSA9IG5vZGU7XG4gIH07XG4gIGV2ZW50TWl4aW4oTGluZVdpZGdldCk7XG5cbiAgZnVuY3Rpb24gYWRqdXN0U2Nyb2xsV2hlbkFib3ZlVmlzaWJsZShjbSwgbGluZSwgZGlmZikge1xuICAgIGlmIChoZWlnaHRBdExpbmUobGluZSkgPCAoKGNtLmN1ck9wICYmIGNtLmN1ck9wLnNjcm9sbFRvcCkgfHwgY20uZG9jLnNjcm9sbFRvcCkpXG4gICAgICBhZGRUb1Njcm9sbFBvcyhjbSwgbnVsbCwgZGlmZik7XG4gIH1cblxuICBMaW5lV2lkZ2V0LnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjbSA9IHRoaXMuY20sIHdzID0gdGhpcy5saW5lLndpZGdldHMsIGxpbmUgPSB0aGlzLmxpbmUsIG5vID0gbGluZU5vKGxpbmUpO1xuICAgIGlmIChubyA9PSBudWxsIHx8ICF3cykgcmV0dXJuO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgd3MubGVuZ3RoOyArK2kpIGlmICh3c1tpXSA9PSB0aGlzKSB3cy5zcGxpY2UoaS0tLCAxKTtcbiAgICBpZiAoIXdzLmxlbmd0aCkgbGluZS53aWRnZXRzID0gbnVsbDtcbiAgICB2YXIgaGVpZ2h0ID0gd2lkZ2V0SGVpZ2h0KHRoaXMpO1xuICAgIHJ1bkluT3AoY20sIGZ1bmN0aW9uKCkge1xuICAgICAgYWRqdXN0U2Nyb2xsV2hlbkFib3ZlVmlzaWJsZShjbSwgbGluZSwgLWhlaWdodCk7XG4gICAgICByZWdMaW5lQ2hhbmdlKGNtLCBubywgXCJ3aWRnZXRcIik7XG4gICAgICB1cGRhdGVMaW5lSGVpZ2h0KGxpbmUsIE1hdGgubWF4KDAsIGxpbmUuaGVpZ2h0IC0gaGVpZ2h0KSk7XG4gICAgfSk7XG4gIH07XG4gIExpbmVXaWRnZXQucHJvdG90eXBlLmNoYW5nZWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb2xkSCA9IHRoaXMuaGVpZ2h0LCBjbSA9IHRoaXMuY20sIGxpbmUgPSB0aGlzLmxpbmU7XG4gICAgdGhpcy5oZWlnaHQgPSBudWxsO1xuICAgIHZhciBkaWZmID0gd2lkZ2V0SGVpZ2h0KHRoaXMpIC0gb2xkSDtcbiAgICBpZiAoIWRpZmYpIHJldHVybjtcbiAgICBydW5Jbk9wKGNtLCBmdW5jdGlvbigpIHtcbiAgICAgIGNtLmN1ck9wLmZvcmNlVXBkYXRlID0gdHJ1ZTtcbiAgICAgIGFkanVzdFNjcm9sbFdoZW5BYm92ZVZpc2libGUoY20sIGxpbmUsIGRpZmYpO1xuICAgICAgdXBkYXRlTGluZUhlaWdodChsaW5lLCBsaW5lLmhlaWdodCArIGRpZmYpO1xuICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHdpZGdldEhlaWdodCh3aWRnZXQpIHtcbiAgICBpZiAod2lkZ2V0LmhlaWdodCAhPSBudWxsKSByZXR1cm4gd2lkZ2V0LmhlaWdodDtcbiAgICBpZiAoIWNvbnRhaW5zKGRvY3VtZW50LmJvZHksIHdpZGdldC5ub2RlKSlcbiAgICAgIHJlbW92ZUNoaWxkcmVuQW5kQWRkKHdpZGdldC5jbS5kaXNwbGF5Lm1lYXN1cmUsIGVsdChcImRpdlwiLCBbd2lkZ2V0Lm5vZGVdLCBudWxsLCBcInBvc2l0aW9uOiByZWxhdGl2ZVwiKSk7XG4gICAgcmV0dXJuIHdpZGdldC5oZWlnaHQgPSB3aWRnZXQubm9kZS5vZmZzZXRIZWlnaHQ7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRMaW5lV2lkZ2V0KGNtLCBoYW5kbGUsIG5vZGUsIG9wdGlvbnMpIHtcbiAgICB2YXIgd2lkZ2V0ID0gbmV3IExpbmVXaWRnZXQoY20sIG5vZGUsIG9wdGlvbnMpO1xuICAgIGlmICh3aWRnZXQubm9IU2Nyb2xsKSBjbS5kaXNwbGF5LmFsaWduV2lkZ2V0cyA9IHRydWU7XG4gICAgY2hhbmdlTGluZShjbSwgaGFuZGxlLCBcIndpZGdldFwiLCBmdW5jdGlvbihsaW5lKSB7XG4gICAgICB2YXIgd2lkZ2V0cyA9IGxpbmUud2lkZ2V0cyB8fCAobGluZS53aWRnZXRzID0gW10pO1xuICAgICAgaWYgKHdpZGdldC5pbnNlcnRBdCA9PSBudWxsKSB3aWRnZXRzLnB1c2god2lkZ2V0KTtcbiAgICAgIGVsc2Ugd2lkZ2V0cy5zcGxpY2UoTWF0aC5taW4od2lkZ2V0cy5sZW5ndGggLSAxLCBNYXRoLm1heCgwLCB3aWRnZXQuaW5zZXJ0QXQpKSwgMCwgd2lkZ2V0KTtcbiAgICAgIHdpZGdldC5saW5lID0gbGluZTtcbiAgICAgIGlmICghbGluZUlzSGlkZGVuKGNtLmRvYywgbGluZSkpIHtcbiAgICAgICAgdmFyIGFib3ZlVmlzaWJsZSA9IGhlaWdodEF0TGluZShsaW5lKSA8IGNtLmRvYy5zY3JvbGxUb3A7XG4gICAgICAgIHVwZGF0ZUxpbmVIZWlnaHQobGluZSwgbGluZS5oZWlnaHQgKyB3aWRnZXRIZWlnaHQod2lkZ2V0KSk7XG4gICAgICAgIGlmIChhYm92ZVZpc2libGUpIGFkZFRvU2Nyb2xsUG9zKGNtLCBudWxsLCB3aWRnZXQuaGVpZ2h0KTtcbiAgICAgICAgY20uY3VyT3AuZm9yY2VVcGRhdGUgPSB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gICAgcmV0dXJuIHdpZGdldDtcbiAgfVxuXG4gIC8vIExJTkUgREFUQSBTVFJVQ1RVUkVcblxuICAvLyBMaW5lIG9iamVjdHMuIFRoZXNlIGhvbGQgc3RhdGUgcmVsYXRlZCB0byBhIGxpbmUsIGluY2x1ZGluZ1xuICAvLyBoaWdobGlnaHRpbmcgaW5mbyAodGhlIHN0eWxlcyBhcnJheSkuXG4gIHZhciBMaW5lID0gQ29kZU1pcnJvci5MaW5lID0gZnVuY3Rpb24odGV4dCwgbWFya2VkU3BhbnMsIGVzdGltYXRlSGVpZ2h0KSB7XG4gICAgdGhpcy50ZXh0ID0gdGV4dDtcbiAgICBhdHRhY2hNYXJrZWRTcGFucyh0aGlzLCBtYXJrZWRTcGFucyk7XG4gICAgdGhpcy5oZWlnaHQgPSBlc3RpbWF0ZUhlaWdodCA/IGVzdGltYXRlSGVpZ2h0KHRoaXMpIDogMTtcbiAgfTtcbiAgZXZlbnRNaXhpbihMaW5lKTtcbiAgTGluZS5wcm90b3R5cGUubGluZU5vID0gZnVuY3Rpb24oKSB7IHJldHVybiBsaW5lTm8odGhpcyk7IH07XG5cbiAgLy8gQ2hhbmdlIHRoZSBjb250ZW50ICh0ZXh0LCBtYXJrZXJzKSBvZiBhIGxpbmUuIEF1dG9tYXRpY2FsbHlcbiAgLy8gaW52YWxpZGF0ZXMgY2FjaGVkIGluZm9ybWF0aW9uIGFuZCB0cmllcyB0byByZS1lc3RpbWF0ZSB0aGVcbiAgLy8gbGluZSdzIGhlaWdodC5cbiAgZnVuY3Rpb24gdXBkYXRlTGluZShsaW5lLCB0ZXh0LCBtYXJrZWRTcGFucywgZXN0aW1hdGVIZWlnaHQpIHtcbiAgICBsaW5lLnRleHQgPSB0ZXh0O1xuICAgIGlmIChsaW5lLnN0YXRlQWZ0ZXIpIGxpbmUuc3RhdGVBZnRlciA9IG51bGw7XG4gICAgaWYgKGxpbmUuc3R5bGVzKSBsaW5lLnN0eWxlcyA9IG51bGw7XG4gICAgaWYgKGxpbmUub3JkZXIgIT0gbnVsbCkgbGluZS5vcmRlciA9IG51bGw7XG4gICAgZGV0YWNoTWFya2VkU3BhbnMobGluZSk7XG4gICAgYXR0YWNoTWFya2VkU3BhbnMobGluZSwgbWFya2VkU3BhbnMpO1xuICAgIHZhciBlc3RIZWlnaHQgPSBlc3RpbWF0ZUhlaWdodCA/IGVzdGltYXRlSGVpZ2h0KGxpbmUpIDogMTtcbiAgICBpZiAoZXN0SGVpZ2h0ICE9IGxpbmUuaGVpZ2h0KSB1cGRhdGVMaW5lSGVpZ2h0KGxpbmUsIGVzdEhlaWdodCk7XG4gIH1cblxuICAvLyBEZXRhY2ggYSBsaW5lIGZyb20gdGhlIGRvY3VtZW50IHRyZWUgYW5kIGl0cyBtYXJrZXJzLlxuICBmdW5jdGlvbiBjbGVhblVwTGluZShsaW5lKSB7XG4gICAgbGluZS5wYXJlbnQgPSBudWxsO1xuICAgIGRldGFjaE1hcmtlZFNwYW5zKGxpbmUpO1xuICB9XG5cbiAgZnVuY3Rpb24gZXh0cmFjdExpbmVDbGFzc2VzKHR5cGUsIG91dHB1dCkge1xuICAgIGlmICh0eXBlKSBmb3IgKDs7KSB7XG4gICAgICB2YXIgbGluZUNsYXNzID0gdHlwZS5tYXRjaCgvKD86XnxcXHMrKWxpbmUtKGJhY2tncm91bmQtKT8oXFxTKykvKTtcbiAgICAgIGlmICghbGluZUNsYXNzKSBicmVhaztcbiAgICAgIHR5cGUgPSB0eXBlLnNsaWNlKDAsIGxpbmVDbGFzcy5pbmRleCkgKyB0eXBlLnNsaWNlKGxpbmVDbGFzcy5pbmRleCArIGxpbmVDbGFzc1swXS5sZW5ndGgpO1xuICAgICAgdmFyIHByb3AgPSBsaW5lQ2xhc3NbMV0gPyBcImJnQ2xhc3NcIiA6IFwidGV4dENsYXNzXCI7XG4gICAgICBpZiAob3V0cHV0W3Byb3BdID09IG51bGwpXG4gICAgICAgIG91dHB1dFtwcm9wXSA9IGxpbmVDbGFzc1syXTtcbiAgICAgIGVsc2UgaWYgKCEobmV3IFJlZ0V4cChcIig/Ol58XFxzKVwiICsgbGluZUNsYXNzWzJdICsgXCIoPzokfFxccylcIikpLnRlc3Qob3V0cHV0W3Byb3BdKSlcbiAgICAgICAgb3V0cHV0W3Byb3BdICs9IFwiIFwiICsgbGluZUNsYXNzWzJdO1xuICAgIH1cbiAgICByZXR1cm4gdHlwZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbGxCbGFua0xpbmUobW9kZSwgc3RhdGUpIHtcbiAgICBpZiAobW9kZS5ibGFua0xpbmUpIHJldHVybiBtb2RlLmJsYW5rTGluZShzdGF0ZSk7XG4gICAgaWYgKCFtb2RlLmlubmVyTW9kZSkgcmV0dXJuO1xuICAgIHZhciBpbm5lciA9IENvZGVNaXJyb3IuaW5uZXJNb2RlKG1vZGUsIHN0YXRlKTtcbiAgICBpZiAoaW5uZXIubW9kZS5ibGFua0xpbmUpIHJldHVybiBpbm5lci5tb2RlLmJsYW5rTGluZShpbm5lci5zdGF0ZSk7XG4gIH1cblxuICBmdW5jdGlvbiByZWFkVG9rZW4obW9kZSwgc3RyZWFtLCBzdGF0ZSkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgICAgdmFyIHN0eWxlID0gbW9kZS50b2tlbihzdHJlYW0sIHN0YXRlKTtcbiAgICAgIGlmIChzdHJlYW0ucG9zID4gc3RyZWFtLnN0YXJ0KSByZXR1cm4gc3R5bGU7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihcIk1vZGUgXCIgKyBtb2RlLm5hbWUgKyBcIiBmYWlsZWQgdG8gYWR2YW5jZSBzdHJlYW0uXCIpO1xuICB9XG5cbiAgLy8gUnVuIHRoZSBnaXZlbiBtb2RlJ3MgcGFyc2VyIG92ZXIgYSBsaW5lLCBjYWxsaW5nIGYgZm9yIGVhY2ggdG9rZW4uXG4gIGZ1bmN0aW9uIHJ1bk1vZGUoY20sIHRleHQsIG1vZGUsIHN0YXRlLCBmLCBsaW5lQ2xhc3NlcywgZm9yY2VUb0VuZCkge1xuICAgIHZhciBmbGF0dGVuU3BhbnMgPSBtb2RlLmZsYXR0ZW5TcGFucztcbiAgICBpZiAoZmxhdHRlblNwYW5zID09IG51bGwpIGZsYXR0ZW5TcGFucyA9IGNtLm9wdGlvbnMuZmxhdHRlblNwYW5zO1xuICAgIHZhciBjdXJTdGFydCA9IDAsIGN1clN0eWxlID0gbnVsbDtcbiAgICB2YXIgc3RyZWFtID0gbmV3IFN0cmluZ1N0cmVhbSh0ZXh0LCBjbS5vcHRpb25zLnRhYlNpemUpLCBzdHlsZTtcbiAgICBpZiAodGV4dCA9PSBcIlwiKSBleHRyYWN0TGluZUNsYXNzZXMoY2FsbEJsYW5rTGluZShtb2RlLCBzdGF0ZSksIGxpbmVDbGFzc2VzKTtcbiAgICB3aGlsZSAoIXN0cmVhbS5lb2woKSkge1xuICAgICAgaWYgKHN0cmVhbS5wb3MgPiBjbS5vcHRpb25zLm1heEhpZ2hsaWdodExlbmd0aCkge1xuICAgICAgICBmbGF0dGVuU3BhbnMgPSBmYWxzZTtcbiAgICAgICAgaWYgKGZvcmNlVG9FbmQpIHByb2Nlc3NMaW5lKGNtLCB0ZXh0LCBzdGF0ZSwgc3RyZWFtLnBvcyk7XG4gICAgICAgIHN0cmVhbS5wb3MgPSB0ZXh0Lmxlbmd0aDtcbiAgICAgICAgc3R5bGUgPSBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3R5bGUgPSBleHRyYWN0TGluZUNsYXNzZXMocmVhZFRva2VuKG1vZGUsIHN0cmVhbSwgc3RhdGUpLCBsaW5lQ2xhc3Nlcyk7XG4gICAgICB9XG4gICAgICBpZiAoY20ub3B0aW9ucy5hZGRNb2RlQ2xhc3MpIHtcbiAgICAgICAgdmFyIG1OYW1lID0gQ29kZU1pcnJvci5pbm5lck1vZGUobW9kZSwgc3RhdGUpLm1vZGUubmFtZTtcbiAgICAgICAgaWYgKG1OYW1lKSBzdHlsZSA9IFwibS1cIiArIChzdHlsZSA/IG1OYW1lICsgXCIgXCIgKyBzdHlsZSA6IG1OYW1lKTtcbiAgICAgIH1cbiAgICAgIGlmICghZmxhdHRlblNwYW5zIHx8IGN1clN0eWxlICE9IHN0eWxlKSB7XG4gICAgICAgIGlmIChjdXJTdGFydCA8IHN0cmVhbS5zdGFydCkgZihzdHJlYW0uc3RhcnQsIGN1clN0eWxlKTtcbiAgICAgICAgY3VyU3RhcnQgPSBzdHJlYW0uc3RhcnQ7IGN1clN0eWxlID0gc3R5bGU7XG4gICAgICB9XG4gICAgICBzdHJlYW0uc3RhcnQgPSBzdHJlYW0ucG9zO1xuICAgIH1cbiAgICB3aGlsZSAoY3VyU3RhcnQgPCBzdHJlYW0ucG9zKSB7XG4gICAgICAvLyBXZWJraXQgc2VlbXMgdG8gcmVmdXNlIHRvIHJlbmRlciB0ZXh0IG5vZGVzIGxvbmdlciB0aGFuIDU3NDQ0IGNoYXJhY3RlcnNcbiAgICAgIHZhciBwb3MgPSBNYXRoLm1pbihzdHJlYW0ucG9zLCBjdXJTdGFydCArIDUwMDAwKTtcbiAgICAgIGYocG9zLCBjdXJTdHlsZSk7XG4gICAgICBjdXJTdGFydCA9IHBvcztcbiAgICB9XG4gIH1cblxuICAvLyBDb21wdXRlIGEgc3R5bGUgYXJyYXkgKGFuIGFycmF5IHN0YXJ0aW5nIHdpdGggYSBtb2RlIGdlbmVyYXRpb25cbiAgLy8gLS0gZm9yIGludmFsaWRhdGlvbiAtLSBmb2xsb3dlZCBieSBwYWlycyBvZiBlbmQgcG9zaXRpb25zIGFuZFxuICAvLyBzdHlsZSBzdHJpbmdzKSwgd2hpY2ggaXMgdXNlZCB0byBoaWdobGlnaHQgdGhlIHRva2VucyBvbiB0aGVcbiAgLy8gbGluZS5cbiAgZnVuY3Rpb24gaGlnaGxpZ2h0TGluZShjbSwgbGluZSwgc3RhdGUsIGZvcmNlVG9FbmQpIHtcbiAgICAvLyBBIHN0eWxlcyBhcnJheSBhbHdheXMgc3RhcnRzIHdpdGggYSBudW1iZXIgaWRlbnRpZnlpbmcgdGhlXG4gICAgLy8gbW9kZS9vdmVybGF5cyB0aGF0IGl0IGlzIGJhc2VkIG9uIChmb3IgZWFzeSBpbnZhbGlkYXRpb24pLlxuICAgIHZhciBzdCA9IFtjbS5zdGF0ZS5tb2RlR2VuXSwgbGluZUNsYXNzZXMgPSB7fTtcbiAgICAvLyBDb21wdXRlIHRoZSBiYXNlIGFycmF5IG9mIHN0eWxlc1xuICAgIHJ1bk1vZGUoY20sIGxpbmUudGV4dCwgY20uZG9jLm1vZGUsIHN0YXRlLCBmdW5jdGlvbihlbmQsIHN0eWxlKSB7XG4gICAgICBzdC5wdXNoKGVuZCwgc3R5bGUpO1xuICAgIH0sIGxpbmVDbGFzc2VzLCBmb3JjZVRvRW5kKTtcblxuICAgIC8vIFJ1biBvdmVybGF5cywgYWRqdXN0IHN0eWxlIGFycmF5LlxuICAgIGZvciAodmFyIG8gPSAwOyBvIDwgY20uc3RhdGUub3ZlcmxheXMubGVuZ3RoOyArK28pIHtcbiAgICAgIHZhciBvdmVybGF5ID0gY20uc3RhdGUub3ZlcmxheXNbb10sIGkgPSAxLCBhdCA9IDA7XG4gICAgICBydW5Nb2RlKGNtLCBsaW5lLnRleHQsIG92ZXJsYXkubW9kZSwgdHJ1ZSwgZnVuY3Rpb24oZW5kLCBzdHlsZSkge1xuICAgICAgICB2YXIgc3RhcnQgPSBpO1xuICAgICAgICAvLyBFbnN1cmUgdGhlcmUncyBhIHRva2VuIGVuZCBhdCB0aGUgY3VycmVudCBwb3NpdGlvbiwgYW5kIHRoYXQgaSBwb2ludHMgYXQgaXRcbiAgICAgICAgd2hpbGUgKGF0IDwgZW5kKSB7XG4gICAgICAgICAgdmFyIGlfZW5kID0gc3RbaV07XG4gICAgICAgICAgaWYgKGlfZW5kID4gZW5kKVxuICAgICAgICAgICAgc3Quc3BsaWNlKGksIDEsIGVuZCwgc3RbaSsxXSwgaV9lbmQpO1xuICAgICAgICAgIGkgKz0gMjtcbiAgICAgICAgICBhdCA9IE1hdGgubWluKGVuZCwgaV9lbmQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghc3R5bGUpIHJldHVybjtcbiAgICAgICAgaWYgKG92ZXJsYXkub3BhcXVlKSB7XG4gICAgICAgICAgc3Quc3BsaWNlKHN0YXJ0LCBpIC0gc3RhcnQsIGVuZCwgXCJjbS1vdmVybGF5IFwiICsgc3R5bGUpO1xuICAgICAgICAgIGkgPSBzdGFydCArIDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZm9yICg7IHN0YXJ0IDwgaTsgc3RhcnQgKz0gMikge1xuICAgICAgICAgICAgdmFyIGN1ciA9IHN0W3N0YXJ0KzFdO1xuICAgICAgICAgICAgc3Rbc3RhcnQrMV0gPSAoY3VyID8gY3VyICsgXCIgXCIgOiBcIlwiKSArIFwiY20tb3ZlcmxheSBcIiArIHN0eWxlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSwgbGluZUNsYXNzZXMpO1xuICAgIH1cblxuICAgIHJldHVybiB7c3R5bGVzOiBzdCwgY2xhc3NlczogbGluZUNsYXNzZXMuYmdDbGFzcyB8fCBsaW5lQ2xhc3Nlcy50ZXh0Q2xhc3MgPyBsaW5lQ2xhc3NlcyA6IG51bGx9O1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TGluZVN0eWxlcyhjbSwgbGluZSkge1xuICAgIGlmICghbGluZS5zdHlsZXMgfHwgbGluZS5zdHlsZXNbMF0gIT0gY20uc3RhdGUubW9kZUdlbikge1xuICAgICAgdmFyIHJlc3VsdCA9IGhpZ2hsaWdodExpbmUoY20sIGxpbmUsIGxpbmUuc3RhdGVBZnRlciA9IGdldFN0YXRlQmVmb3JlKGNtLCBsaW5lTm8obGluZSkpKTtcbiAgICAgIGxpbmUuc3R5bGVzID0gcmVzdWx0LnN0eWxlcztcbiAgICAgIGlmIChyZXN1bHQuY2xhc3NlcykgbGluZS5zdHlsZUNsYXNzZXMgPSByZXN1bHQuY2xhc3NlcztcbiAgICAgIGVsc2UgaWYgKGxpbmUuc3R5bGVDbGFzc2VzKSBsaW5lLnN0eWxlQ2xhc3NlcyA9IG51bGw7XG4gICAgfVxuICAgIHJldHVybiBsaW5lLnN0eWxlcztcbiAgfVxuXG4gIC8vIExpZ2h0d2VpZ2h0IGZvcm0gb2YgaGlnaGxpZ2h0IC0tIHByb2NlZWQgb3ZlciB0aGlzIGxpbmUgYW5kXG4gIC8vIHVwZGF0ZSBzdGF0ZSwgYnV0IGRvbid0IHNhdmUgYSBzdHlsZSBhcnJheS4gVXNlZCBmb3IgbGluZXMgdGhhdFxuICAvLyBhcmVuJ3QgY3VycmVudGx5IHZpc2libGUuXG4gIGZ1bmN0aW9uIHByb2Nlc3NMaW5lKGNtLCB0ZXh0LCBzdGF0ZSwgc3RhcnRBdCkge1xuICAgIHZhciBtb2RlID0gY20uZG9jLm1vZGU7XG4gICAgdmFyIHN0cmVhbSA9IG5ldyBTdHJpbmdTdHJlYW0odGV4dCwgY20ub3B0aW9ucy50YWJTaXplKTtcbiAgICBzdHJlYW0uc3RhcnQgPSBzdHJlYW0ucG9zID0gc3RhcnRBdCB8fCAwO1xuICAgIGlmICh0ZXh0ID09IFwiXCIpIGNhbGxCbGFua0xpbmUobW9kZSwgc3RhdGUpO1xuICAgIHdoaWxlICghc3RyZWFtLmVvbCgpICYmIHN0cmVhbS5wb3MgPD0gY20ub3B0aW9ucy5tYXhIaWdobGlnaHRMZW5ndGgpIHtcbiAgICAgIHJlYWRUb2tlbihtb2RlLCBzdHJlYW0sIHN0YXRlKTtcbiAgICAgIHN0cmVhbS5zdGFydCA9IHN0cmVhbS5wb3M7XG4gICAgfVxuICB9XG5cbiAgLy8gQ29udmVydCBhIHN0eWxlIGFzIHJldHVybmVkIGJ5IGEgbW9kZSAoZWl0aGVyIG51bGwsIG9yIGEgc3RyaW5nXG4gIC8vIGNvbnRhaW5pbmcgb25lIG9yIG1vcmUgc3R5bGVzKSB0byBhIENTUyBzdHlsZS4gVGhpcyBpcyBjYWNoZWQsXG4gIC8vIGFuZCBhbHNvIGxvb2tzIGZvciBsaW5lLXdpZGUgc3R5bGVzLlxuICB2YXIgc3R5bGVUb0NsYXNzQ2FjaGUgPSB7fSwgc3R5bGVUb0NsYXNzQ2FjaGVXaXRoTW9kZSA9IHt9O1xuICBmdW5jdGlvbiBpbnRlcnByZXRUb2tlblN0eWxlKHN0eWxlLCBvcHRpb25zKSB7XG4gICAgaWYgKCFzdHlsZSB8fCAvXlxccyokLy50ZXN0KHN0eWxlKSkgcmV0dXJuIG51bGw7XG4gICAgdmFyIGNhY2hlID0gb3B0aW9ucy5hZGRNb2RlQ2xhc3MgPyBzdHlsZVRvQ2xhc3NDYWNoZVdpdGhNb2RlIDogc3R5bGVUb0NsYXNzQ2FjaGU7XG4gICAgcmV0dXJuIGNhY2hlW3N0eWxlXSB8fFxuICAgICAgKGNhY2hlW3N0eWxlXSA9IHN0eWxlLnJlcGxhY2UoL1xcUysvZywgXCJjbS0kJlwiKSk7XG4gIH1cblxuICAvLyBSZW5kZXIgdGhlIERPTSByZXByZXNlbnRhdGlvbiBvZiB0aGUgdGV4dCBvZiBhIGxpbmUuIEFsc28gYnVpbGRzXG4gIC8vIHVwIGEgJ2xpbmUgbWFwJywgd2hpY2ggcG9pbnRzIGF0IHRoZSBET00gbm9kZXMgdGhhdCByZXByZXNlbnRcbiAgLy8gc3BlY2lmaWMgc3RyZXRjaGVzIG9mIHRleHQsIGFuZCBpcyB1c2VkIGJ5IHRoZSBtZWFzdXJpbmcgY29kZS5cbiAgLy8gVGhlIHJldHVybmVkIG9iamVjdCBjb250YWlucyB0aGUgRE9NIG5vZGUsIHRoaXMgbWFwLCBhbmRcbiAgLy8gaW5mb3JtYXRpb24gYWJvdXQgbGluZS13aWRlIHN0eWxlcyB0aGF0IHdlcmUgc2V0IGJ5IHRoZSBtb2RlLlxuICBmdW5jdGlvbiBidWlsZExpbmVDb250ZW50KGNtLCBsaW5lVmlldykge1xuICAgIC8vIFRoZSBwYWRkaW5nLXJpZ2h0IGZvcmNlcyB0aGUgZWxlbWVudCB0byBoYXZlIGEgJ2JvcmRlcicsIHdoaWNoXG4gICAgLy8gaXMgbmVlZGVkIG9uIFdlYmtpdCB0byBiZSBhYmxlIHRvIGdldCBsaW5lLWxldmVsIGJvdW5kaW5nXG4gICAgLy8gcmVjdGFuZ2xlcyBmb3IgaXQgKGluIG1lYXN1cmVDaGFyKS5cbiAgICB2YXIgY29udGVudCA9IGVsdChcInNwYW5cIiwgbnVsbCwgbnVsbCwgd2Via2l0ID8gXCJwYWRkaW5nLXJpZ2h0OiAuMXB4XCIgOiBudWxsKTtcbiAgICB2YXIgYnVpbGRlciA9IHtwcmU6IGVsdChcInByZVwiLCBbY29udGVudF0pLCBjb250ZW50OiBjb250ZW50LCBjb2w6IDAsIHBvczogMCwgY206IGNtfTtcbiAgICBsaW5lVmlldy5tZWFzdXJlID0ge307XG5cbiAgICAvLyBJdGVyYXRlIG92ZXIgdGhlIGxvZ2ljYWwgbGluZXMgdGhhdCBtYWtlIHVwIHRoaXMgdmlzdWFsIGxpbmUuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gKGxpbmVWaWV3LnJlc3QgPyBsaW5lVmlldy5yZXN0Lmxlbmd0aCA6IDApOyBpKyspIHtcbiAgICAgIHZhciBsaW5lID0gaSA/IGxpbmVWaWV3LnJlc3RbaSAtIDFdIDogbGluZVZpZXcubGluZSwgb3JkZXI7XG4gICAgICBidWlsZGVyLnBvcyA9IDA7XG4gICAgICBidWlsZGVyLmFkZFRva2VuID0gYnVpbGRUb2tlbjtcbiAgICAgIC8vIE9wdGlvbmFsbHkgd2lyZSBpbiBzb21lIGhhY2tzIGludG8gdGhlIHRva2VuLXJlbmRlcmluZ1xuICAgICAgLy8gYWxnb3JpdGhtLCB0byBkZWFsIHdpdGggYnJvd3NlciBxdWlya3MuXG4gICAgICBpZiAoKGllIHx8IHdlYmtpdCkgJiYgY20uZ2V0T3B0aW9uKFwibGluZVdyYXBwaW5nXCIpKVxuICAgICAgICBidWlsZGVyLmFkZFRva2VuID0gYnVpbGRUb2tlblNwbGl0U3BhY2VzKGJ1aWxkZXIuYWRkVG9rZW4pO1xuICAgICAgaWYgKGhhc0JhZEJpZGlSZWN0cyhjbS5kaXNwbGF5Lm1lYXN1cmUpICYmIChvcmRlciA9IGdldE9yZGVyKGxpbmUpKSlcbiAgICAgICAgYnVpbGRlci5hZGRUb2tlbiA9IGJ1aWxkVG9rZW5CYWRCaWRpKGJ1aWxkZXIuYWRkVG9rZW4sIG9yZGVyKTtcbiAgICAgIGJ1aWxkZXIubWFwID0gW107XG4gICAgICBpbnNlcnRMaW5lQ29udGVudChsaW5lLCBidWlsZGVyLCBnZXRMaW5lU3R5bGVzKGNtLCBsaW5lKSk7XG4gICAgICBpZiAobGluZS5zdHlsZUNsYXNzZXMpIHtcbiAgICAgICAgaWYgKGxpbmUuc3R5bGVDbGFzc2VzLmJnQ2xhc3MpXG4gICAgICAgICAgYnVpbGRlci5iZ0NsYXNzID0gam9pbkNsYXNzZXMobGluZS5zdHlsZUNsYXNzZXMuYmdDbGFzcywgYnVpbGRlci5iZ0NsYXNzIHx8IFwiXCIpO1xuICAgICAgICBpZiAobGluZS5zdHlsZUNsYXNzZXMudGV4dENsYXNzKVxuICAgICAgICAgIGJ1aWxkZXIudGV4dENsYXNzID0gam9pbkNsYXNzZXMobGluZS5zdHlsZUNsYXNzZXMudGV4dENsYXNzLCBidWlsZGVyLnRleHRDbGFzcyB8fCBcIlwiKTtcbiAgICAgIH1cblxuICAgICAgLy8gRW5zdXJlIGF0IGxlYXN0IGEgc2luZ2xlIG5vZGUgaXMgcHJlc2VudCwgZm9yIG1lYXN1cmluZy5cbiAgICAgIGlmIChidWlsZGVyLm1hcC5sZW5ndGggPT0gMClcbiAgICAgICAgYnVpbGRlci5tYXAucHVzaCgwLCAwLCBidWlsZGVyLmNvbnRlbnQuYXBwZW5kQ2hpbGQoemVyb1dpZHRoRWxlbWVudChjbS5kaXNwbGF5Lm1lYXN1cmUpKSk7XG5cbiAgICAgIC8vIFN0b3JlIHRoZSBtYXAgYW5kIGEgY2FjaGUgb2JqZWN0IGZvciB0aGUgY3VycmVudCBsb2dpY2FsIGxpbmVcbiAgICAgIGlmIChpID09IDApIHtcbiAgICAgICAgbGluZVZpZXcubWVhc3VyZS5tYXAgPSBidWlsZGVyLm1hcDtcbiAgICAgICAgbGluZVZpZXcubWVhc3VyZS5jYWNoZSA9IHt9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgKGxpbmVWaWV3Lm1lYXN1cmUubWFwcyB8fCAobGluZVZpZXcubWVhc3VyZS5tYXBzID0gW10pKS5wdXNoKGJ1aWxkZXIubWFwKTtcbiAgICAgICAgKGxpbmVWaWV3Lm1lYXN1cmUuY2FjaGVzIHx8IChsaW5lVmlldy5tZWFzdXJlLmNhY2hlcyA9IFtdKSkucHVzaCh7fSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2lnbmFsKGNtLCBcInJlbmRlckxpbmVcIiwgY20sIGxpbmVWaWV3LmxpbmUsIGJ1aWxkZXIucHJlKTtcbiAgICBpZiAoYnVpbGRlci5wcmUuY2xhc3NOYW1lKVxuICAgICAgYnVpbGRlci50ZXh0Q2xhc3MgPSBqb2luQ2xhc3NlcyhidWlsZGVyLnByZS5jbGFzc05hbWUsIGJ1aWxkZXIudGV4dENsYXNzIHx8IFwiXCIpO1xuICAgIHJldHVybiBidWlsZGVyO1xuICB9XG5cbiAgZnVuY3Rpb24gZGVmYXVsdFNwZWNpYWxDaGFyUGxhY2Vob2xkZXIoY2gpIHtcbiAgICB2YXIgdG9rZW4gPSBlbHQoXCJzcGFuXCIsIFwiXFx1MjAyMlwiLCBcImNtLWludmFsaWRjaGFyXCIpO1xuICAgIHRva2VuLnRpdGxlID0gXCJcXFxcdVwiICsgY2guY2hhckNvZGVBdCgwKS50b1N0cmluZygxNik7XG4gICAgcmV0dXJuIHRva2VuO1xuICB9XG5cbiAgLy8gQnVpbGQgdXAgdGhlIERPTSByZXByZXNlbnRhdGlvbiBmb3IgYSBzaW5nbGUgdG9rZW4sIGFuZCBhZGQgaXQgdG9cbiAgLy8gdGhlIGxpbmUgbWFwLiBUYWtlcyBjYXJlIHRvIHJlbmRlciBzcGVjaWFsIGNoYXJhY3RlcnMgc2VwYXJhdGVseS5cbiAgZnVuY3Rpb24gYnVpbGRUb2tlbihidWlsZGVyLCB0ZXh0LCBzdHlsZSwgc3RhcnRTdHlsZSwgZW5kU3R5bGUsIHRpdGxlKSB7XG4gICAgaWYgKCF0ZXh0KSByZXR1cm47XG4gICAgdmFyIHNwZWNpYWwgPSBidWlsZGVyLmNtLm9wdGlvbnMuc3BlY2lhbENoYXJzLCBtdXN0V3JhcCA9IGZhbHNlO1xuICAgIGlmICghc3BlY2lhbC50ZXN0KHRleHQpKSB7XG4gICAgICBidWlsZGVyLmNvbCArPSB0ZXh0Lmxlbmd0aDtcbiAgICAgIHZhciBjb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dCk7XG4gICAgICBidWlsZGVyLm1hcC5wdXNoKGJ1aWxkZXIucG9zLCBidWlsZGVyLnBvcyArIHRleHQubGVuZ3RoLCBjb250ZW50KTtcbiAgICAgIGlmIChpZV91cHRvOCkgbXVzdFdyYXAgPSB0cnVlO1xuICAgICAgYnVpbGRlci5wb3MgKz0gdGV4dC5sZW5ndGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBjb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpLCBwb3MgPSAwO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgc3BlY2lhbC5sYXN0SW5kZXggPSBwb3M7XG4gICAgICAgIHZhciBtID0gc3BlY2lhbC5leGVjKHRleHQpO1xuICAgICAgICB2YXIgc2tpcHBlZCA9IG0gPyBtLmluZGV4IC0gcG9zIDogdGV4dC5sZW5ndGggLSBwb3M7XG4gICAgICAgIGlmIChza2lwcGVkKSB7XG4gICAgICAgICAgdmFyIHR4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHQuc2xpY2UocG9zLCBwb3MgKyBza2lwcGVkKSk7XG4gICAgICAgICAgaWYgKGllX3VwdG84KSBjb250ZW50LmFwcGVuZENoaWxkKGVsdChcInNwYW5cIiwgW3R4dF0pKTtcbiAgICAgICAgICBlbHNlIGNvbnRlbnQuYXBwZW5kQ2hpbGQodHh0KTtcbiAgICAgICAgICBidWlsZGVyLm1hcC5wdXNoKGJ1aWxkZXIucG9zLCBidWlsZGVyLnBvcyArIHNraXBwZWQsIHR4dCk7XG4gICAgICAgICAgYnVpbGRlci5jb2wgKz0gc2tpcHBlZDtcbiAgICAgICAgICBidWlsZGVyLnBvcyArPSBza2lwcGVkO1xuICAgICAgICB9XG4gICAgICAgIGlmICghbSkgYnJlYWs7XG4gICAgICAgIHBvcyArPSBza2lwcGVkICsgMTtcbiAgICAgICAgaWYgKG1bMF0gPT0gXCJcXHRcIikge1xuICAgICAgICAgIHZhciB0YWJTaXplID0gYnVpbGRlci5jbS5vcHRpb25zLnRhYlNpemUsIHRhYldpZHRoID0gdGFiU2l6ZSAtIGJ1aWxkZXIuY29sICUgdGFiU2l6ZTtcbiAgICAgICAgICB2YXIgdHh0ID0gY29udGVudC5hcHBlbmRDaGlsZChlbHQoXCJzcGFuXCIsIHNwYWNlU3RyKHRhYldpZHRoKSwgXCJjbS10YWJcIikpO1xuICAgICAgICAgIGJ1aWxkZXIuY29sICs9IHRhYldpZHRoO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciB0eHQgPSBidWlsZGVyLmNtLm9wdGlvbnMuc3BlY2lhbENoYXJQbGFjZWhvbGRlcihtWzBdKTtcbiAgICAgICAgICBpZiAoaWVfdXB0bzgpIGNvbnRlbnQuYXBwZW5kQ2hpbGQoZWx0KFwic3BhblwiLCBbdHh0XSkpO1xuICAgICAgICAgIGVsc2UgY29udGVudC5hcHBlbmRDaGlsZCh0eHQpO1xuICAgICAgICAgIGJ1aWxkZXIuY29sICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgYnVpbGRlci5tYXAucHVzaChidWlsZGVyLnBvcywgYnVpbGRlci5wb3MgKyAxLCB0eHQpO1xuICAgICAgICBidWlsZGVyLnBvcysrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoc3R5bGUgfHwgc3RhcnRTdHlsZSB8fCBlbmRTdHlsZSB8fCBtdXN0V3JhcCkge1xuICAgICAgdmFyIGZ1bGxTdHlsZSA9IHN0eWxlIHx8IFwiXCI7XG4gICAgICBpZiAoc3RhcnRTdHlsZSkgZnVsbFN0eWxlICs9IHN0YXJ0U3R5bGU7XG4gICAgICBpZiAoZW5kU3R5bGUpIGZ1bGxTdHlsZSArPSBlbmRTdHlsZTtcbiAgICAgIHZhciB0b2tlbiA9IGVsdChcInNwYW5cIiwgW2NvbnRlbnRdLCBmdWxsU3R5bGUpO1xuICAgICAgaWYgKHRpdGxlKSB0b2tlbi50aXRsZSA9IHRpdGxlO1xuICAgICAgcmV0dXJuIGJ1aWxkZXIuY29udGVudC5hcHBlbmRDaGlsZCh0b2tlbik7XG4gICAgfVxuICAgIGJ1aWxkZXIuY29udGVudC5hcHBlbmRDaGlsZChjb250ZW50KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJ1aWxkVG9rZW5TcGxpdFNwYWNlcyhpbm5lcikge1xuICAgIGZ1bmN0aW9uIHNwbGl0KG9sZCkge1xuICAgICAgdmFyIG91dCA9IFwiIFwiO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvbGQubGVuZ3RoIC0gMjsgKytpKSBvdXQgKz0gaSAlIDIgPyBcIiBcIiA6IFwiXFx1MDBhMFwiO1xuICAgICAgb3V0ICs9IFwiIFwiO1xuICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGJ1aWxkZXIsIHRleHQsIHN0eWxlLCBzdGFydFN0eWxlLCBlbmRTdHlsZSwgdGl0bGUpIHtcbiAgICAgIGlubmVyKGJ1aWxkZXIsIHRleHQucmVwbGFjZSgvIHszLH0vZywgc3BsaXQpLCBzdHlsZSwgc3RhcnRTdHlsZSwgZW5kU3R5bGUsIHRpdGxlKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gV29yayBhcm91bmQgbm9uc2Vuc2UgZGltZW5zaW9ucyBiZWluZyByZXBvcnRlZCBmb3Igc3RyZXRjaGVzIG9mXG4gIC8vIHJpZ2h0LXRvLWxlZnQgdGV4dC5cbiAgZnVuY3Rpb24gYnVpbGRUb2tlbkJhZEJpZGkoaW5uZXIsIG9yZGVyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGJ1aWxkZXIsIHRleHQsIHN0eWxlLCBzdGFydFN0eWxlLCBlbmRTdHlsZSwgdGl0bGUpIHtcbiAgICAgIHN0eWxlID0gc3R5bGUgPyBzdHlsZSArIFwiIGNtLWZvcmNlLWJvcmRlclwiIDogXCJjbS1mb3JjZS1ib3JkZXJcIjtcbiAgICAgIHZhciBzdGFydCA9IGJ1aWxkZXIucG9zLCBlbmQgPSBzdGFydCArIHRleHQubGVuZ3RoO1xuICAgICAgZm9yICg7Oykge1xuICAgICAgICAvLyBGaW5kIHRoZSBwYXJ0IHRoYXQgb3ZlcmxhcHMgd2l0aCB0aGUgc3RhcnQgb2YgdGhpcyB0ZXh0XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb3JkZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgcGFydCA9IG9yZGVyW2ldO1xuICAgICAgICAgIGlmIChwYXJ0LnRvID4gc3RhcnQgJiYgcGFydC5mcm9tIDw9IHN0YXJ0KSBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFydC50byA+PSBlbmQpIHJldHVybiBpbm5lcihidWlsZGVyLCB0ZXh0LCBzdHlsZSwgc3RhcnRTdHlsZSwgZW5kU3R5bGUsIHRpdGxlKTtcbiAgICAgICAgaW5uZXIoYnVpbGRlciwgdGV4dC5zbGljZSgwLCBwYXJ0LnRvIC0gc3RhcnQpLCBzdHlsZSwgc3RhcnRTdHlsZSwgbnVsbCwgdGl0bGUpO1xuICAgICAgICBzdGFydFN0eWxlID0gbnVsbDtcbiAgICAgICAgdGV4dCA9IHRleHQuc2xpY2UocGFydC50byAtIHN0YXJ0KTtcbiAgICAgICAgc3RhcnQgPSBwYXJ0LnRvO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBidWlsZENvbGxhcHNlZFNwYW4oYnVpbGRlciwgc2l6ZSwgbWFya2VyLCBpZ25vcmVXaWRnZXQpIHtcbiAgICB2YXIgd2lkZ2V0ID0gIWlnbm9yZVdpZGdldCAmJiBtYXJrZXIud2lkZ2V0Tm9kZTtcbiAgICBpZiAod2lkZ2V0KSB7XG4gICAgICBidWlsZGVyLm1hcC5wdXNoKGJ1aWxkZXIucG9zLCBidWlsZGVyLnBvcyArIHNpemUsIHdpZGdldCk7XG4gICAgICBidWlsZGVyLmNvbnRlbnQuYXBwZW5kQ2hpbGQod2lkZ2V0KTtcbiAgICB9XG4gICAgYnVpbGRlci5wb3MgKz0gc2l6ZTtcbiAgfVxuXG4gIC8vIE91dHB1dHMgYSBudW1iZXIgb2Ygc3BhbnMgdG8gbWFrZSB1cCBhIGxpbmUsIHRha2luZyBoaWdobGlnaHRpbmdcbiAgLy8gYW5kIG1hcmtlZCB0ZXh0IGludG8gYWNjb3VudC5cbiAgZnVuY3Rpb24gaW5zZXJ0TGluZUNvbnRlbnQobGluZSwgYnVpbGRlciwgc3R5bGVzKSB7XG4gICAgdmFyIHNwYW5zID0gbGluZS5tYXJrZWRTcGFucywgYWxsVGV4dCA9IGxpbmUudGV4dCwgYXQgPSAwO1xuICAgIGlmICghc3BhbnMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgc3R5bGVzLmxlbmd0aDsgaSs9MilcbiAgICAgICAgYnVpbGRlci5hZGRUb2tlbihidWlsZGVyLCBhbGxUZXh0LnNsaWNlKGF0LCBhdCA9IHN0eWxlc1tpXSksIGludGVycHJldFRva2VuU3R5bGUoc3R5bGVzW2krMV0sIGJ1aWxkZXIuY20ub3B0aW9ucykpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBsZW4gPSBhbGxUZXh0Lmxlbmd0aCwgcG9zID0gMCwgaSA9IDEsIHRleHQgPSBcIlwiLCBzdHlsZTtcbiAgICB2YXIgbmV4dENoYW5nZSA9IDAsIHNwYW5TdHlsZSwgc3BhbkVuZFN0eWxlLCBzcGFuU3RhcnRTdHlsZSwgdGl0bGUsIGNvbGxhcHNlZDtcbiAgICBmb3IgKDs7KSB7XG4gICAgICBpZiAobmV4dENoYW5nZSA9PSBwb3MpIHsgLy8gVXBkYXRlIGN1cnJlbnQgbWFya2VyIHNldFxuICAgICAgICBzcGFuU3R5bGUgPSBzcGFuRW5kU3R5bGUgPSBzcGFuU3RhcnRTdHlsZSA9IHRpdGxlID0gXCJcIjtcbiAgICAgICAgY29sbGFwc2VkID0gbnVsbDsgbmV4dENoYW5nZSA9IEluZmluaXR5O1xuICAgICAgICB2YXIgZm91bmRCb29rbWFya3MgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzcGFucy5sZW5ndGg7ICsraikge1xuICAgICAgICAgIHZhciBzcCA9IHNwYW5zW2pdLCBtID0gc3AubWFya2VyO1xuICAgICAgICAgIGlmIChzcC5mcm9tIDw9IHBvcyAmJiAoc3AudG8gPT0gbnVsbCB8fCBzcC50byA+IHBvcykpIHtcbiAgICAgICAgICAgIGlmIChzcC50byAhPSBudWxsICYmIG5leHRDaGFuZ2UgPiBzcC50bykgeyBuZXh0Q2hhbmdlID0gc3AudG87IHNwYW5FbmRTdHlsZSA9IFwiXCI7IH1cbiAgICAgICAgICAgIGlmIChtLmNsYXNzTmFtZSkgc3BhblN0eWxlICs9IFwiIFwiICsgbS5jbGFzc05hbWU7XG4gICAgICAgICAgICBpZiAobS5zdGFydFN0eWxlICYmIHNwLmZyb20gPT0gcG9zKSBzcGFuU3RhcnRTdHlsZSArPSBcIiBcIiArIG0uc3RhcnRTdHlsZTtcbiAgICAgICAgICAgIGlmIChtLmVuZFN0eWxlICYmIHNwLnRvID09IG5leHRDaGFuZ2UpIHNwYW5FbmRTdHlsZSArPSBcIiBcIiArIG0uZW5kU3R5bGU7XG4gICAgICAgICAgICBpZiAobS50aXRsZSAmJiAhdGl0bGUpIHRpdGxlID0gbS50aXRsZTtcbiAgICAgICAgICAgIGlmIChtLmNvbGxhcHNlZCAmJiAoIWNvbGxhcHNlZCB8fCBjb21wYXJlQ29sbGFwc2VkTWFya2Vycyhjb2xsYXBzZWQubWFya2VyLCBtKSA8IDApKVxuICAgICAgICAgICAgICBjb2xsYXBzZWQgPSBzcDtcbiAgICAgICAgICB9IGVsc2UgaWYgKHNwLmZyb20gPiBwb3MgJiYgbmV4dENoYW5nZSA+IHNwLmZyb20pIHtcbiAgICAgICAgICAgIG5leHRDaGFuZ2UgPSBzcC5mcm9tO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobS50eXBlID09IFwiYm9va21hcmtcIiAmJiBzcC5mcm9tID09IHBvcyAmJiBtLndpZGdldE5vZGUpIGZvdW5kQm9va21hcmtzLnB1c2gobSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbGxhcHNlZCAmJiAoY29sbGFwc2VkLmZyb20gfHwgMCkgPT0gcG9zKSB7XG4gICAgICAgICAgYnVpbGRDb2xsYXBzZWRTcGFuKGJ1aWxkZXIsIChjb2xsYXBzZWQudG8gPT0gbnVsbCA/IGxlbiArIDEgOiBjb2xsYXBzZWQudG8pIC0gcG9zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQubWFya2VyLCBjb2xsYXBzZWQuZnJvbSA9PSBudWxsKTtcbiAgICAgICAgICBpZiAoY29sbGFwc2VkLnRvID09IG51bGwpIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNvbGxhcHNlZCAmJiBmb3VuZEJvb2ttYXJrcy5sZW5ndGgpIGZvciAodmFyIGogPSAwOyBqIDwgZm91bmRCb29rbWFya3MubGVuZ3RoOyArK2opXG4gICAgICAgICAgYnVpbGRDb2xsYXBzZWRTcGFuKGJ1aWxkZXIsIDAsIGZvdW5kQm9va21hcmtzW2pdKTtcbiAgICAgIH1cbiAgICAgIGlmIChwb3MgPj0gbGVuKSBicmVhaztcblxuICAgICAgdmFyIHVwdG8gPSBNYXRoLm1pbihsZW4sIG5leHRDaGFuZ2UpO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgaWYgKHRleHQpIHtcbiAgICAgICAgICB2YXIgZW5kID0gcG9zICsgdGV4dC5sZW5ndGg7XG4gICAgICAgICAgaWYgKCFjb2xsYXBzZWQpIHtcbiAgICAgICAgICAgIHZhciB0b2tlblRleHQgPSBlbmQgPiB1cHRvID8gdGV4dC5zbGljZSgwLCB1cHRvIC0gcG9zKSA6IHRleHQ7XG4gICAgICAgICAgICBidWlsZGVyLmFkZFRva2VuKGJ1aWxkZXIsIHRva2VuVGV4dCwgc3R5bGUgPyBzdHlsZSArIHNwYW5TdHlsZSA6IHNwYW5TdHlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BhblN0YXJ0U3R5bGUsIHBvcyArIHRva2VuVGV4dC5sZW5ndGggPT0gbmV4dENoYW5nZSA/IHNwYW5FbmRTdHlsZSA6IFwiXCIsIHRpdGxlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGVuZCA+PSB1cHRvKSB7dGV4dCA9IHRleHQuc2xpY2UodXB0byAtIHBvcyk7IHBvcyA9IHVwdG87IGJyZWFrO31cbiAgICAgICAgICBwb3MgPSBlbmQ7XG4gICAgICAgICAgc3BhblN0YXJ0U3R5bGUgPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIHRleHQgPSBhbGxUZXh0LnNsaWNlKGF0LCBhdCA9IHN0eWxlc1tpKytdKTtcbiAgICAgICAgc3R5bGUgPSBpbnRlcnByZXRUb2tlblN0eWxlKHN0eWxlc1tpKytdLCBidWlsZGVyLmNtLm9wdGlvbnMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIERPQ1VNRU5UIERBVEEgU1RSVUNUVVJFXG5cbiAgLy8gQnkgZGVmYXVsdCwgdXBkYXRlcyB0aGF0IHN0YXJ0IGFuZCBlbmQgYXQgdGhlIGJlZ2lubmluZyBvZiBhIGxpbmVcbiAgLy8gYXJlIHRyZWF0ZWQgc3BlY2lhbGx5LCBpbiBvcmRlciB0byBtYWtlIHRoZSBhc3NvY2lhdGlvbiBvZiBsaW5lXG4gIC8vIHdpZGdldHMgYW5kIG1hcmtlciBlbGVtZW50cyB3aXRoIHRoZSB0ZXh0IGJlaGF2ZSBtb3JlIGludHVpdGl2ZS5cbiAgZnVuY3Rpb24gaXNXaG9sZUxpbmVVcGRhdGUoZG9jLCBjaGFuZ2UpIHtcbiAgICByZXR1cm4gY2hhbmdlLmZyb20uY2ggPT0gMCAmJiBjaGFuZ2UudG8uY2ggPT0gMCAmJiBsc3QoY2hhbmdlLnRleHQpID09IFwiXCIgJiZcbiAgICAgICghZG9jLmNtIHx8IGRvYy5jbS5vcHRpb25zLndob2xlTGluZVVwZGF0ZUJlZm9yZSk7XG4gIH1cblxuICAvLyBQZXJmb3JtIGEgY2hhbmdlIG9uIHRoZSBkb2N1bWVudCBkYXRhIHN0cnVjdHVyZS5cbiAgZnVuY3Rpb24gdXBkYXRlRG9jKGRvYywgY2hhbmdlLCBtYXJrZWRTcGFucywgZXN0aW1hdGVIZWlnaHQpIHtcbiAgICBmdW5jdGlvbiBzcGFuc0ZvcihuKSB7cmV0dXJuIG1hcmtlZFNwYW5zID8gbWFya2VkU3BhbnNbbl0gOiBudWxsO31cbiAgICBmdW5jdGlvbiB1cGRhdGUobGluZSwgdGV4dCwgc3BhbnMpIHtcbiAgICAgIHVwZGF0ZUxpbmUobGluZSwgdGV4dCwgc3BhbnMsIGVzdGltYXRlSGVpZ2h0KTtcbiAgICAgIHNpZ25hbExhdGVyKGxpbmUsIFwiY2hhbmdlXCIsIGxpbmUsIGNoYW5nZSk7XG4gICAgfVxuXG4gICAgdmFyIGZyb20gPSBjaGFuZ2UuZnJvbSwgdG8gPSBjaGFuZ2UudG8sIHRleHQgPSBjaGFuZ2UudGV4dDtcbiAgICB2YXIgZmlyc3RMaW5lID0gZ2V0TGluZShkb2MsIGZyb20ubGluZSksIGxhc3RMaW5lID0gZ2V0TGluZShkb2MsIHRvLmxpbmUpO1xuICAgIHZhciBsYXN0VGV4dCA9IGxzdCh0ZXh0KSwgbGFzdFNwYW5zID0gc3BhbnNGb3IodGV4dC5sZW5ndGggLSAxKSwgbmxpbmVzID0gdG8ubGluZSAtIGZyb20ubGluZTtcblxuICAgIC8vIEFkanVzdCB0aGUgbGluZSBzdHJ1Y3R1cmVcbiAgICBpZiAoaXNXaG9sZUxpbmVVcGRhdGUoZG9jLCBjaGFuZ2UpKSB7XG4gICAgICAvLyBUaGlzIGlzIGEgd2hvbGUtbGluZSByZXBsYWNlLiBUcmVhdGVkIHNwZWNpYWxseSB0byBtYWtlXG4gICAgICAvLyBzdXJlIGxpbmUgb2JqZWN0cyBtb3ZlIHRoZSB3YXkgdGhleSBhcmUgc3VwcG9zZWQgdG8uXG4gICAgICBmb3IgKHZhciBpID0gMCwgYWRkZWQgPSBbXTsgaSA8IHRleHQubGVuZ3RoIC0gMTsgKytpKVxuICAgICAgICBhZGRlZC5wdXNoKG5ldyBMaW5lKHRleHRbaV0sIHNwYW5zRm9yKGkpLCBlc3RpbWF0ZUhlaWdodCkpO1xuICAgICAgdXBkYXRlKGxhc3RMaW5lLCBsYXN0TGluZS50ZXh0LCBsYXN0U3BhbnMpO1xuICAgICAgaWYgKG5saW5lcykgZG9jLnJlbW92ZShmcm9tLmxpbmUsIG5saW5lcyk7XG4gICAgICBpZiAoYWRkZWQubGVuZ3RoKSBkb2MuaW5zZXJ0KGZyb20ubGluZSwgYWRkZWQpO1xuICAgIH0gZWxzZSBpZiAoZmlyc3RMaW5lID09IGxhc3RMaW5lKSB7XG4gICAgICBpZiAodGV4dC5sZW5ndGggPT0gMSkge1xuICAgICAgICB1cGRhdGUoZmlyc3RMaW5lLCBmaXJzdExpbmUudGV4dC5zbGljZSgwLCBmcm9tLmNoKSArIGxhc3RUZXh0ICsgZmlyc3RMaW5lLnRleHQuc2xpY2UodG8uY2gpLCBsYXN0U3BhbnMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yICh2YXIgYWRkZWQgPSBbXSwgaSA9IDE7IGkgPCB0ZXh0Lmxlbmd0aCAtIDE7ICsraSlcbiAgICAgICAgICBhZGRlZC5wdXNoKG5ldyBMaW5lKHRleHRbaV0sIHNwYW5zRm9yKGkpLCBlc3RpbWF0ZUhlaWdodCkpO1xuICAgICAgICBhZGRlZC5wdXNoKG5ldyBMaW5lKGxhc3RUZXh0ICsgZmlyc3RMaW5lLnRleHQuc2xpY2UodG8uY2gpLCBsYXN0U3BhbnMsIGVzdGltYXRlSGVpZ2h0KSk7XG4gICAgICAgIHVwZGF0ZShmaXJzdExpbmUsIGZpcnN0TGluZS50ZXh0LnNsaWNlKDAsIGZyb20uY2gpICsgdGV4dFswXSwgc3BhbnNGb3IoMCkpO1xuICAgICAgICBkb2MuaW5zZXJ0KGZyb20ubGluZSArIDEsIGFkZGVkKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRleHQubGVuZ3RoID09IDEpIHtcbiAgICAgIHVwZGF0ZShmaXJzdExpbmUsIGZpcnN0TGluZS50ZXh0LnNsaWNlKDAsIGZyb20uY2gpICsgdGV4dFswXSArIGxhc3RMaW5lLnRleHQuc2xpY2UodG8uY2gpLCBzcGFuc0ZvcigwKSk7XG4gICAgICBkb2MucmVtb3ZlKGZyb20ubGluZSArIDEsIG5saW5lcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVwZGF0ZShmaXJzdExpbmUsIGZpcnN0TGluZS50ZXh0LnNsaWNlKDAsIGZyb20uY2gpICsgdGV4dFswXSwgc3BhbnNGb3IoMCkpO1xuICAgICAgdXBkYXRlKGxhc3RMaW5lLCBsYXN0VGV4dCArIGxhc3RMaW5lLnRleHQuc2xpY2UodG8uY2gpLCBsYXN0U3BhbnMpO1xuICAgICAgZm9yICh2YXIgaSA9IDEsIGFkZGVkID0gW107IGkgPCB0ZXh0Lmxlbmd0aCAtIDE7ICsraSlcbiAgICAgICAgYWRkZWQucHVzaChuZXcgTGluZSh0ZXh0W2ldLCBzcGFuc0ZvcihpKSwgZXN0aW1hdGVIZWlnaHQpKTtcbiAgICAgIGlmIChubGluZXMgPiAxKSBkb2MucmVtb3ZlKGZyb20ubGluZSArIDEsIG5saW5lcyAtIDEpO1xuICAgICAgZG9jLmluc2VydChmcm9tLmxpbmUgKyAxLCBhZGRlZCk7XG4gICAgfVxuXG4gICAgc2lnbmFsTGF0ZXIoZG9jLCBcImNoYW5nZVwiLCBkb2MsIGNoYW5nZSk7XG4gIH1cblxuICAvLyBUaGUgZG9jdW1lbnQgaXMgcmVwcmVzZW50ZWQgYXMgYSBCVHJlZSBjb25zaXN0aW5nIG9mIGxlYXZlcywgd2l0aFxuICAvLyBjaHVuayBvZiBsaW5lcyBpbiB0aGVtLCBhbmQgYnJhbmNoZXMsIHdpdGggdXAgdG8gdGVuIGxlYXZlcyBvclxuICAvLyBvdGhlciBicmFuY2ggbm9kZXMgYmVsb3cgdGhlbS4gVGhlIHRvcCBub2RlIGlzIGFsd2F5cyBhIGJyYW5jaFxuICAvLyBub2RlLCBhbmQgaXMgdGhlIGRvY3VtZW50IG9iamVjdCBpdHNlbGYgKG1lYW5pbmcgaXQgaGFzXG4gIC8vIGFkZGl0aW9uYWwgbWV0aG9kcyBhbmQgcHJvcGVydGllcykuXG4gIC8vXG4gIC8vIEFsbCBub2RlcyBoYXZlIHBhcmVudCBsaW5rcy4gVGhlIHRyZWUgaXMgdXNlZCBib3RoIHRvIGdvIGZyb21cbiAgLy8gbGluZSBudW1iZXJzIHRvIGxpbmUgb2JqZWN0cywgYW5kIHRvIGdvIGZyb20gb2JqZWN0cyB0byBudW1iZXJzLlxuICAvLyBJdCBhbHNvIGluZGV4ZXMgYnkgaGVpZ2h0LCBhbmQgaXMgdXNlZCB0byBjb252ZXJ0IGJldHdlZW4gaGVpZ2h0XG4gIC8vIGFuZCBsaW5lIG9iamVjdCwgYW5kIHRvIGZpbmQgdGhlIHRvdGFsIGhlaWdodCBvZiB0aGUgZG9jdW1lbnQuXG4gIC8vXG4gIC8vIFNlZSBhbHNvIGh0dHA6Ly9tYXJpam5oYXZlcmJla2UubmwvYmxvZy9jb2RlbWlycm9yLWxpbmUtdHJlZS5odG1sXG5cbiAgZnVuY3Rpb24gTGVhZkNodW5rKGxpbmVzKSB7XG4gICAgdGhpcy5saW5lcyA9IGxpbmVzO1xuICAgIHRoaXMucGFyZW50ID0gbnVsbDtcbiAgICBmb3IgKHZhciBpID0gMCwgaGVpZ2h0ID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgKytpKSB7XG4gICAgICBsaW5lc1tpXS5wYXJlbnQgPSB0aGlzO1xuICAgICAgaGVpZ2h0ICs9IGxpbmVzW2ldLmhlaWdodDtcbiAgICB9XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gIH1cblxuICBMZWFmQ2h1bmsucHJvdG90eXBlID0ge1xuICAgIGNodW5rU2l6ZTogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmxpbmVzLmxlbmd0aDsgfSxcbiAgICAvLyBSZW1vdmUgdGhlIG4gbGluZXMgYXQgb2Zmc2V0ICdhdCcuXG4gICAgcmVtb3ZlSW5uZXI6IGZ1bmN0aW9uKGF0LCBuKSB7XG4gICAgICBmb3IgKHZhciBpID0gYXQsIGUgPSBhdCArIG47IGkgPCBlOyArK2kpIHtcbiAgICAgICAgdmFyIGxpbmUgPSB0aGlzLmxpbmVzW2ldO1xuICAgICAgICB0aGlzLmhlaWdodCAtPSBsaW5lLmhlaWdodDtcbiAgICAgICAgY2xlYW5VcExpbmUobGluZSk7XG4gICAgICAgIHNpZ25hbExhdGVyKGxpbmUsIFwiZGVsZXRlXCIpO1xuICAgICAgfVxuICAgICAgdGhpcy5saW5lcy5zcGxpY2UoYXQsIG4pO1xuICAgIH0sXG4gICAgLy8gSGVscGVyIHVzZWQgdG8gY29sbGFwc2UgYSBzbWFsbCBicmFuY2ggaW50byBhIHNpbmdsZSBsZWFmLlxuICAgIGNvbGxhcHNlOiBmdW5jdGlvbihsaW5lcykge1xuICAgICAgbGluZXMucHVzaC5hcHBseShsaW5lcywgdGhpcy5saW5lcyk7XG4gICAgfSxcbiAgICAvLyBJbnNlcnQgdGhlIGdpdmVuIGFycmF5IG9mIGxpbmVzIGF0IG9mZnNldCAnYXQnLCBjb3VudCB0aGVtIGFzXG4gICAgLy8gaGF2aW5nIHRoZSBnaXZlbiBoZWlnaHQuXG4gICAgaW5zZXJ0SW5uZXI6IGZ1bmN0aW9uKGF0LCBsaW5lcywgaGVpZ2h0KSB7XG4gICAgICB0aGlzLmhlaWdodCArPSBoZWlnaHQ7XG4gICAgICB0aGlzLmxpbmVzID0gdGhpcy5saW5lcy5zbGljZSgwLCBhdCkuY29uY2F0KGxpbmVzKS5jb25jYXQodGhpcy5saW5lcy5zbGljZShhdCkpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7ICsraSkgbGluZXNbaV0ucGFyZW50ID0gdGhpcztcbiAgICB9LFxuICAgIC8vIFVzZWQgdG8gaXRlcmF0ZSBvdmVyIGEgcGFydCBvZiB0aGUgdHJlZS5cbiAgICBpdGVyTjogZnVuY3Rpb24oYXQsIG4sIG9wKSB7XG4gICAgICBmb3IgKHZhciBlID0gYXQgKyBuOyBhdCA8IGU7ICsrYXQpXG4gICAgICAgIGlmIChvcCh0aGlzLmxpbmVzW2F0XSkpIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBCcmFuY2hDaHVuayhjaGlsZHJlbikge1xuICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgICB2YXIgc2l6ZSA9IDAsIGhlaWdodCA9IDA7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGNoID0gY2hpbGRyZW5baV07XG4gICAgICBzaXplICs9IGNoLmNodW5rU2l6ZSgpOyBoZWlnaHQgKz0gY2guaGVpZ2h0O1xuICAgICAgY2gucGFyZW50ID0gdGhpcztcbiAgICB9XG4gICAgdGhpcy5zaXplID0gc2l6ZTtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICB0aGlzLnBhcmVudCA9IG51bGw7XG4gIH1cblxuICBCcmFuY2hDaHVuay5wcm90b3R5cGUgPSB7XG4gICAgY2h1bmtTaXplOiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuc2l6ZTsgfSxcbiAgICByZW1vdmVJbm5lcjogZnVuY3Rpb24oYXQsIG4pIHtcbiAgICAgIHRoaXMuc2l6ZSAtPSBuO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBjaGlsZCA9IHRoaXMuY2hpbGRyZW5baV0sIHN6ID0gY2hpbGQuY2h1bmtTaXplKCk7XG4gICAgICAgIGlmIChhdCA8IHN6KSB7XG4gICAgICAgICAgdmFyIHJtID0gTWF0aC5taW4obiwgc3ogLSBhdCksIG9sZEhlaWdodCA9IGNoaWxkLmhlaWdodDtcbiAgICAgICAgICBjaGlsZC5yZW1vdmVJbm5lcihhdCwgcm0pO1xuICAgICAgICAgIHRoaXMuaGVpZ2h0IC09IG9sZEhlaWdodCAtIGNoaWxkLmhlaWdodDtcbiAgICAgICAgICBpZiAoc3ogPT0gcm0pIHsgdGhpcy5jaGlsZHJlbi5zcGxpY2UoaS0tLCAxKTsgY2hpbGQucGFyZW50ID0gbnVsbDsgfVxuICAgICAgICAgIGlmICgobiAtPSBybSkgPT0gMCkgYnJlYWs7XG4gICAgICAgICAgYXQgPSAwO1xuICAgICAgICB9IGVsc2UgYXQgLT0gc3o7XG4gICAgICB9XG4gICAgICAvLyBJZiB0aGUgcmVzdWx0IGlzIHNtYWxsZXIgdGhhbiAyNSBsaW5lcywgZW5zdXJlIHRoYXQgaXQgaXMgYVxuICAgICAgLy8gc2luZ2xlIGxlYWYgbm9kZS5cbiAgICAgIGlmICh0aGlzLnNpemUgLSBuIDwgMjUgJiZcbiAgICAgICAgICAodGhpcy5jaGlsZHJlbi5sZW5ndGggPiAxIHx8ICEodGhpcy5jaGlsZHJlblswXSBpbnN0YW5jZW9mIExlYWZDaHVuaykpKSB7XG4gICAgICAgIHZhciBsaW5lcyA9IFtdO1xuICAgICAgICB0aGlzLmNvbGxhcHNlKGxpbmVzKTtcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IFtuZXcgTGVhZkNodW5rKGxpbmVzKV07XG4gICAgICAgIHRoaXMuY2hpbGRyZW5bMF0ucGFyZW50ID0gdGhpcztcbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbGxhcHNlOiBmdW5jdGlvbihsaW5lcykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgKytpKSB0aGlzLmNoaWxkcmVuW2ldLmNvbGxhcHNlKGxpbmVzKTtcbiAgICB9LFxuICAgIGluc2VydElubmVyOiBmdW5jdGlvbihhdCwgbGluZXMsIGhlaWdodCkge1xuICAgICAgdGhpcy5zaXplICs9IGxpbmVzLmxlbmd0aDtcbiAgICAgIHRoaXMuaGVpZ2h0ICs9IGhlaWdodDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgY2hpbGQgPSB0aGlzLmNoaWxkcmVuW2ldLCBzeiA9IGNoaWxkLmNodW5rU2l6ZSgpO1xuICAgICAgICBpZiAoYXQgPD0gc3opIHtcbiAgICAgICAgICBjaGlsZC5pbnNlcnRJbm5lcihhdCwgbGluZXMsIGhlaWdodCk7XG4gICAgICAgICAgaWYgKGNoaWxkLmxpbmVzICYmIGNoaWxkLmxpbmVzLmxlbmd0aCA+IDUwKSB7XG4gICAgICAgICAgICB3aGlsZSAoY2hpbGQubGluZXMubGVuZ3RoID4gNTApIHtcbiAgICAgICAgICAgICAgdmFyIHNwaWxsZWQgPSBjaGlsZC5saW5lcy5zcGxpY2UoY2hpbGQubGluZXMubGVuZ3RoIC0gMjUsIDI1KTtcbiAgICAgICAgICAgICAgdmFyIG5ld2xlYWYgPSBuZXcgTGVhZkNodW5rKHNwaWxsZWQpO1xuICAgICAgICAgICAgICBjaGlsZC5oZWlnaHQgLT0gbmV3bGVhZi5oZWlnaHQ7XG4gICAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uc3BsaWNlKGkgKyAxLCAwLCBuZXdsZWFmKTtcbiAgICAgICAgICAgICAgbmV3bGVhZi5wYXJlbnQgPSB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tYXliZVNwaWxsKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGF0IC09IHN6O1xuICAgICAgfVxuICAgIH0sXG4gICAgLy8gV2hlbiBhIG5vZGUgaGFzIGdyb3duLCBjaGVjayB3aGV0aGVyIGl0IHNob3VsZCBiZSBzcGxpdC5cbiAgICBtYXliZVNwaWxsOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLmNoaWxkcmVuLmxlbmd0aCA8PSAxMCkgcmV0dXJuO1xuICAgICAgdmFyIG1lID0gdGhpcztcbiAgICAgIGRvIHtcbiAgICAgICAgdmFyIHNwaWxsZWQgPSBtZS5jaGlsZHJlbi5zcGxpY2UobWUuY2hpbGRyZW4ubGVuZ3RoIC0gNSwgNSk7XG4gICAgICAgIHZhciBzaWJsaW5nID0gbmV3IEJyYW5jaENodW5rKHNwaWxsZWQpO1xuICAgICAgICBpZiAoIW1lLnBhcmVudCkgeyAvLyBCZWNvbWUgdGhlIHBhcmVudCBub2RlXG4gICAgICAgICAgdmFyIGNvcHkgPSBuZXcgQnJhbmNoQ2h1bmsobWUuY2hpbGRyZW4pO1xuICAgICAgICAgIGNvcHkucGFyZW50ID0gbWU7XG4gICAgICAgICAgbWUuY2hpbGRyZW4gPSBbY29weSwgc2libGluZ107XG4gICAgICAgICAgbWUgPSBjb3B5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1lLnNpemUgLT0gc2libGluZy5zaXplO1xuICAgICAgICAgIG1lLmhlaWdodCAtPSBzaWJsaW5nLmhlaWdodDtcbiAgICAgICAgICB2YXIgbXlJbmRleCA9IGluZGV4T2YobWUucGFyZW50LmNoaWxkcmVuLCBtZSk7XG4gICAgICAgICAgbWUucGFyZW50LmNoaWxkcmVuLnNwbGljZShteUluZGV4ICsgMSwgMCwgc2libGluZyk7XG4gICAgICAgIH1cbiAgICAgICAgc2libGluZy5wYXJlbnQgPSBtZS5wYXJlbnQ7XG4gICAgICB9IHdoaWxlIChtZS5jaGlsZHJlbi5sZW5ndGggPiAxMCk7XG4gICAgICBtZS5wYXJlbnQubWF5YmVTcGlsbCgpO1xuICAgIH0sXG4gICAgaXRlck46IGZ1bmN0aW9uKGF0LCBuLCBvcCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBjaGlsZCA9IHRoaXMuY2hpbGRyZW5baV0sIHN6ID0gY2hpbGQuY2h1bmtTaXplKCk7XG4gICAgICAgIGlmIChhdCA8IHN6KSB7XG4gICAgICAgICAgdmFyIHVzZWQgPSBNYXRoLm1pbihuLCBzeiAtIGF0KTtcbiAgICAgICAgICBpZiAoY2hpbGQuaXRlck4oYXQsIHVzZWQsIG9wKSkgcmV0dXJuIHRydWU7XG4gICAgICAgICAgaWYgKChuIC09IHVzZWQpID09IDApIGJyZWFrO1xuICAgICAgICAgIGF0ID0gMDtcbiAgICAgICAgfSBlbHNlIGF0IC09IHN6O1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICB2YXIgbmV4dERvY0lkID0gMDtcbiAgdmFyIERvYyA9IENvZGVNaXJyb3IuRG9jID0gZnVuY3Rpb24odGV4dCwgbW9kZSwgZmlyc3RMaW5lKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIERvYykpIHJldHVybiBuZXcgRG9jKHRleHQsIG1vZGUsIGZpcnN0TGluZSk7XG4gICAgaWYgKGZpcnN0TGluZSA9PSBudWxsKSBmaXJzdExpbmUgPSAwO1xuXG4gICAgQnJhbmNoQ2h1bmsuY2FsbCh0aGlzLCBbbmV3IExlYWZDaHVuayhbbmV3IExpbmUoXCJcIiwgbnVsbCldKV0pO1xuICAgIHRoaXMuZmlyc3QgPSBmaXJzdExpbmU7XG4gICAgdGhpcy5zY3JvbGxUb3AgPSB0aGlzLnNjcm9sbExlZnQgPSAwO1xuICAgIHRoaXMuY2FudEVkaXQgPSBmYWxzZTtcbiAgICB0aGlzLmNsZWFuR2VuZXJhdGlvbiA9IDE7XG4gICAgdGhpcy5mcm9udGllciA9IGZpcnN0TGluZTtcbiAgICB2YXIgc3RhcnQgPSBQb3MoZmlyc3RMaW5lLCAwKTtcbiAgICB0aGlzLnNlbCA9IHNpbXBsZVNlbGVjdGlvbihzdGFydCk7XG4gICAgdGhpcy5oaXN0b3J5ID0gbmV3IEhpc3RvcnkobnVsbCk7XG4gICAgdGhpcy5pZCA9ICsrbmV4dERvY0lkO1xuICAgIHRoaXMubW9kZU9wdGlvbiA9IG1vZGU7XG5cbiAgICBpZiAodHlwZW9mIHRleHQgPT0gXCJzdHJpbmdcIikgdGV4dCA9IHNwbGl0TGluZXModGV4dCk7XG4gICAgdXBkYXRlRG9jKHRoaXMsIHtmcm9tOiBzdGFydCwgdG86IHN0YXJ0LCB0ZXh0OiB0ZXh0fSk7XG4gICAgc2V0U2VsZWN0aW9uKHRoaXMsIHNpbXBsZVNlbGVjdGlvbihzdGFydCksIHNlbF9kb250U2Nyb2xsKTtcbiAgfTtcblxuICBEb2MucHJvdG90eXBlID0gY3JlYXRlT2JqKEJyYW5jaENodW5rLnByb3RvdHlwZSwge1xuICAgIGNvbnN0cnVjdG9yOiBEb2MsXG4gICAgLy8gSXRlcmF0ZSBvdmVyIHRoZSBkb2N1bWVudC4gU3VwcG9ydHMgdHdvIGZvcm1zIC0tIHdpdGggb25seSBvbmVcbiAgICAvLyBhcmd1bWVudCwgaXQgY2FsbHMgdGhhdCBmb3IgZWFjaCBsaW5lIGluIHRoZSBkb2N1bWVudC4gV2l0aFxuICAgIC8vIHRocmVlLCBpdCBpdGVyYXRlcyBvdmVyIHRoZSByYW5nZSBnaXZlbiBieSB0aGUgZmlyc3QgdHdvICh3aXRoXG4gICAgLy8gdGhlIHNlY29uZCBiZWluZyBub24taW5jbHVzaXZlKS5cbiAgICBpdGVyOiBmdW5jdGlvbihmcm9tLCB0bywgb3ApIHtcbiAgICAgIGlmIChvcCkgdGhpcy5pdGVyTihmcm9tIC0gdGhpcy5maXJzdCwgdG8gLSBmcm9tLCBvcCk7XG4gICAgICBlbHNlIHRoaXMuaXRlck4odGhpcy5maXJzdCwgdGhpcy5maXJzdCArIHRoaXMuc2l6ZSwgZnJvbSk7XG4gICAgfSxcblxuICAgIC8vIE5vbi1wdWJsaWMgaW50ZXJmYWNlIGZvciBhZGRpbmcgYW5kIHJlbW92aW5nIGxpbmVzLlxuICAgIGluc2VydDogZnVuY3Rpb24oYXQsIGxpbmVzKSB7XG4gICAgICB2YXIgaGVpZ2h0ID0gMDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyArK2kpIGhlaWdodCArPSBsaW5lc1tpXS5oZWlnaHQ7XG4gICAgICB0aGlzLmluc2VydElubmVyKGF0IC0gdGhpcy5maXJzdCwgbGluZXMsIGhlaWdodCk7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uKGF0LCBuKSB7IHRoaXMucmVtb3ZlSW5uZXIoYXQgLSB0aGlzLmZpcnN0LCBuKTsgfSxcblxuICAgIC8vIEZyb20gaGVyZSwgdGhlIG1ldGhvZHMgYXJlIHBhcnQgb2YgdGhlIHB1YmxpYyBpbnRlcmZhY2UuIE1vc3RcbiAgICAvLyBhcmUgYWxzbyBhdmFpbGFibGUgZnJvbSBDb2RlTWlycm9yIChlZGl0b3IpIGluc3RhbmNlcy5cblxuICAgIGdldFZhbHVlOiBmdW5jdGlvbihsaW5lU2VwKSB7XG4gICAgICB2YXIgbGluZXMgPSBnZXRMaW5lcyh0aGlzLCB0aGlzLmZpcnN0LCB0aGlzLmZpcnN0ICsgdGhpcy5zaXplKTtcbiAgICAgIGlmIChsaW5lU2VwID09PSBmYWxzZSkgcmV0dXJuIGxpbmVzO1xuICAgICAgcmV0dXJuIGxpbmVzLmpvaW4obGluZVNlcCB8fCBcIlxcblwiKTtcbiAgICB9LFxuICAgIHNldFZhbHVlOiBkb2NNZXRob2RPcChmdW5jdGlvbihjb2RlKSB7XG4gICAgICB2YXIgdG9wID0gUG9zKHRoaXMuZmlyc3QsIDApLCBsYXN0ID0gdGhpcy5maXJzdCArIHRoaXMuc2l6ZSAtIDE7XG4gICAgICBtYWtlQ2hhbmdlKHRoaXMsIHtmcm9tOiB0b3AsIHRvOiBQb3MobGFzdCwgZ2V0TGluZSh0aGlzLCBsYXN0KS50ZXh0Lmxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBzcGxpdExpbmVzKGNvZGUpLCBvcmlnaW46IFwic2V0VmFsdWVcIn0sIHRydWUpO1xuICAgICAgc2V0U2VsZWN0aW9uKHRoaXMsIHNpbXBsZVNlbGVjdGlvbih0b3ApKTtcbiAgICB9KSxcbiAgICByZXBsYWNlUmFuZ2U6IGZ1bmN0aW9uKGNvZGUsIGZyb20sIHRvLCBvcmlnaW4pIHtcbiAgICAgIGZyb20gPSBjbGlwUG9zKHRoaXMsIGZyb20pO1xuICAgICAgdG8gPSB0byA/IGNsaXBQb3ModGhpcywgdG8pIDogZnJvbTtcbiAgICAgIHJlcGxhY2VSYW5nZSh0aGlzLCBjb2RlLCBmcm9tLCB0bywgb3JpZ2luKTtcbiAgICB9LFxuICAgIGdldFJhbmdlOiBmdW5jdGlvbihmcm9tLCB0bywgbGluZVNlcCkge1xuICAgICAgdmFyIGxpbmVzID0gZ2V0QmV0d2Vlbih0aGlzLCBjbGlwUG9zKHRoaXMsIGZyb20pLCBjbGlwUG9zKHRoaXMsIHRvKSk7XG4gICAgICBpZiAobGluZVNlcCA9PT0gZmFsc2UpIHJldHVybiBsaW5lcztcbiAgICAgIHJldHVybiBsaW5lcy5qb2luKGxpbmVTZXAgfHwgXCJcXG5cIik7XG4gICAgfSxcblxuICAgIGdldExpbmU6IGZ1bmN0aW9uKGxpbmUpIHt2YXIgbCA9IHRoaXMuZ2V0TGluZUhhbmRsZShsaW5lKTsgcmV0dXJuIGwgJiYgbC50ZXh0O30sXG5cbiAgICBnZXRMaW5lSGFuZGxlOiBmdW5jdGlvbihsaW5lKSB7aWYgKGlzTGluZSh0aGlzLCBsaW5lKSkgcmV0dXJuIGdldExpbmUodGhpcywgbGluZSk7fSxcbiAgICBnZXRMaW5lTnVtYmVyOiBmdW5jdGlvbihsaW5lKSB7cmV0dXJuIGxpbmVObyhsaW5lKTt9LFxuXG4gICAgZ2V0TGluZUhhbmRsZVZpc3VhbFN0YXJ0OiBmdW5jdGlvbihsaW5lKSB7XG4gICAgICBpZiAodHlwZW9mIGxpbmUgPT0gXCJudW1iZXJcIikgbGluZSA9IGdldExpbmUodGhpcywgbGluZSk7XG4gICAgICByZXR1cm4gdmlzdWFsTGluZShsaW5lKTtcbiAgICB9LFxuXG4gICAgbGluZUNvdW50OiBmdW5jdGlvbigpIHtyZXR1cm4gdGhpcy5zaXplO30sXG4gICAgZmlyc3RMaW5lOiBmdW5jdGlvbigpIHtyZXR1cm4gdGhpcy5maXJzdDt9LFxuICAgIGxhc3RMaW5lOiBmdW5jdGlvbigpIHtyZXR1cm4gdGhpcy5maXJzdCArIHRoaXMuc2l6ZSAtIDE7fSxcblxuICAgIGNsaXBQb3M6IGZ1bmN0aW9uKHBvcykge3JldHVybiBjbGlwUG9zKHRoaXMsIHBvcyk7fSxcblxuICAgIGdldEN1cnNvcjogZnVuY3Rpb24oc3RhcnQpIHtcbiAgICAgIHZhciByYW5nZSA9IHRoaXMuc2VsLnByaW1hcnkoKSwgcG9zO1xuICAgICAgaWYgKHN0YXJ0ID09IG51bGwgfHwgc3RhcnQgPT0gXCJoZWFkXCIpIHBvcyA9IHJhbmdlLmhlYWQ7XG4gICAgICBlbHNlIGlmIChzdGFydCA9PSBcImFuY2hvclwiKSBwb3MgPSByYW5nZS5hbmNob3I7XG4gICAgICBlbHNlIGlmIChzdGFydCA9PSBcImVuZFwiIHx8IHN0YXJ0ID09IFwidG9cIiB8fCBzdGFydCA9PT0gZmFsc2UpIHBvcyA9IHJhbmdlLnRvKCk7XG4gICAgICBlbHNlIHBvcyA9IHJhbmdlLmZyb20oKTtcbiAgICAgIHJldHVybiBwb3M7XG4gICAgfSxcbiAgICBsaXN0U2VsZWN0aW9uczogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLnNlbC5yYW5nZXM7IH0sXG4gICAgc29tZXRoaW5nU2VsZWN0ZWQ6IGZ1bmN0aW9uKCkge3JldHVybiB0aGlzLnNlbC5zb21ldGhpbmdTZWxlY3RlZCgpO30sXG5cbiAgICBzZXRDdXJzb3I6IGRvY01ldGhvZE9wKGZ1bmN0aW9uKGxpbmUsIGNoLCBvcHRpb25zKSB7XG4gICAgICBzZXRTaW1wbGVTZWxlY3Rpb24odGhpcywgY2xpcFBvcyh0aGlzLCB0eXBlb2YgbGluZSA9PSBcIm51bWJlclwiID8gUG9zKGxpbmUsIGNoIHx8IDApIDogbGluZSksIG51bGwsIG9wdGlvbnMpO1xuICAgIH0pLFxuICAgIHNldFNlbGVjdGlvbjogZG9jTWV0aG9kT3AoZnVuY3Rpb24oYW5jaG9yLCBoZWFkLCBvcHRpb25zKSB7XG4gICAgICBzZXRTaW1wbGVTZWxlY3Rpb24odGhpcywgY2xpcFBvcyh0aGlzLCBhbmNob3IpLCBjbGlwUG9zKHRoaXMsIGhlYWQgfHwgYW5jaG9yKSwgb3B0aW9ucyk7XG4gICAgfSksXG4gICAgZXh0ZW5kU2VsZWN0aW9uOiBkb2NNZXRob2RPcChmdW5jdGlvbihoZWFkLCBvdGhlciwgb3B0aW9ucykge1xuICAgICAgZXh0ZW5kU2VsZWN0aW9uKHRoaXMsIGNsaXBQb3ModGhpcywgaGVhZCksIG90aGVyICYmIGNsaXBQb3ModGhpcywgb3RoZXIpLCBvcHRpb25zKTtcbiAgICB9KSxcbiAgICBleHRlbmRTZWxlY3Rpb25zOiBkb2NNZXRob2RPcChmdW5jdGlvbihoZWFkcywgb3B0aW9ucykge1xuICAgICAgZXh0ZW5kU2VsZWN0aW9ucyh0aGlzLCBjbGlwUG9zQXJyYXkodGhpcywgaGVhZHMsIG9wdGlvbnMpKTtcbiAgICB9KSxcbiAgICBleHRlbmRTZWxlY3Rpb25zQnk6IGRvY01ldGhvZE9wKGZ1bmN0aW9uKGYsIG9wdGlvbnMpIHtcbiAgICAgIGV4dGVuZFNlbGVjdGlvbnModGhpcywgbWFwKHRoaXMuc2VsLnJhbmdlcywgZiksIG9wdGlvbnMpO1xuICAgIH0pLFxuICAgIHNldFNlbGVjdGlvbnM6IGRvY01ldGhvZE9wKGZ1bmN0aW9uKHJhbmdlcywgcHJpbWFyeSwgb3B0aW9ucykge1xuICAgICAgaWYgKCFyYW5nZXMubGVuZ3RoKSByZXR1cm47XG4gICAgICBmb3IgKHZhciBpID0gMCwgb3V0ID0gW107IGkgPCByYW5nZXMubGVuZ3RoOyBpKyspXG4gICAgICAgIG91dFtpXSA9IG5ldyBSYW5nZShjbGlwUG9zKHRoaXMsIHJhbmdlc1tpXS5hbmNob3IpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpcFBvcyh0aGlzLCByYW5nZXNbaV0uaGVhZCkpO1xuICAgICAgaWYgKHByaW1hcnkgPT0gbnVsbCkgcHJpbWFyeSA9IE1hdGgubWluKHJhbmdlcy5sZW5ndGggLSAxLCB0aGlzLnNlbC5wcmltSW5kZXgpO1xuICAgICAgc2V0U2VsZWN0aW9uKHRoaXMsIG5vcm1hbGl6ZVNlbGVjdGlvbihvdXQsIHByaW1hcnkpLCBvcHRpb25zKTtcbiAgICB9KSxcbiAgICBhZGRTZWxlY3Rpb246IGRvY01ldGhvZE9wKGZ1bmN0aW9uKGFuY2hvciwgaGVhZCwgb3B0aW9ucykge1xuICAgICAgdmFyIHJhbmdlcyA9IHRoaXMuc2VsLnJhbmdlcy5zbGljZSgwKTtcbiAgICAgIHJhbmdlcy5wdXNoKG5ldyBSYW5nZShjbGlwUG9zKHRoaXMsIGFuY2hvciksIGNsaXBQb3ModGhpcywgaGVhZCB8fCBhbmNob3IpKSk7XG4gICAgICBzZXRTZWxlY3Rpb24odGhpcywgbm9ybWFsaXplU2VsZWN0aW9uKHJhbmdlcywgcmFuZ2VzLmxlbmd0aCAtIDEpLCBvcHRpb25zKTtcbiAgICB9KSxcblxuICAgIGdldFNlbGVjdGlvbjogZnVuY3Rpb24obGluZVNlcCkge1xuICAgICAgdmFyIHJhbmdlcyA9IHRoaXMuc2VsLnJhbmdlcywgbGluZXM7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgc2VsID0gZ2V0QmV0d2Vlbih0aGlzLCByYW5nZXNbaV0uZnJvbSgpLCByYW5nZXNbaV0udG8oKSk7XG4gICAgICAgIGxpbmVzID0gbGluZXMgPyBsaW5lcy5jb25jYXQoc2VsKSA6IHNlbDtcbiAgICAgIH1cbiAgICAgIGlmIChsaW5lU2VwID09PSBmYWxzZSkgcmV0dXJuIGxpbmVzO1xuICAgICAgZWxzZSByZXR1cm4gbGluZXMuam9pbihsaW5lU2VwIHx8IFwiXFxuXCIpO1xuICAgIH0sXG4gICAgZ2V0U2VsZWN0aW9uczogZnVuY3Rpb24obGluZVNlcCkge1xuICAgICAgdmFyIHBhcnRzID0gW10sIHJhbmdlcyA9IHRoaXMuc2VsLnJhbmdlcztcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzZWwgPSBnZXRCZXR3ZWVuKHRoaXMsIHJhbmdlc1tpXS5mcm9tKCksIHJhbmdlc1tpXS50bygpKTtcbiAgICAgICAgaWYgKGxpbmVTZXAgIT09IGZhbHNlKSBzZWwgPSBzZWwuam9pbihsaW5lU2VwIHx8IFwiXFxuXCIpO1xuICAgICAgICBwYXJ0c1tpXSA9IHNlbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwYXJ0cztcbiAgICB9LFxuICAgIHJlcGxhY2VTZWxlY3Rpb246IGZ1bmN0aW9uKGNvZGUsIGNvbGxhcHNlLCBvcmlnaW4pIHtcbiAgICAgIHZhciBkdXAgPSBbXTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zZWwucmFuZ2VzLmxlbmd0aDsgaSsrKVxuICAgICAgICBkdXBbaV0gPSBjb2RlO1xuICAgICAgdGhpcy5yZXBsYWNlU2VsZWN0aW9ucyhkdXAsIGNvbGxhcHNlLCBvcmlnaW4gfHwgXCIraW5wdXRcIik7XG4gICAgfSxcbiAgICByZXBsYWNlU2VsZWN0aW9uczogZG9jTWV0aG9kT3AoZnVuY3Rpb24oY29kZSwgY29sbGFwc2UsIG9yaWdpbikge1xuICAgICAgdmFyIGNoYW5nZXMgPSBbXSwgc2VsID0gdGhpcy5zZWw7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlbC5yYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHJhbmdlID0gc2VsLnJhbmdlc1tpXTtcbiAgICAgICAgY2hhbmdlc1tpXSA9IHtmcm9tOiByYW5nZS5mcm9tKCksIHRvOiByYW5nZS50bygpLCB0ZXh0OiBzcGxpdExpbmVzKGNvZGVbaV0pLCBvcmlnaW46IG9yaWdpbn07XG4gICAgICB9XG4gICAgICB2YXIgbmV3U2VsID0gY29sbGFwc2UgJiYgY29sbGFwc2UgIT0gXCJlbmRcIiAmJiBjb21wdXRlUmVwbGFjZWRTZWwodGhpcywgY2hhbmdlcywgY29sbGFwc2UpO1xuICAgICAgZm9yICh2YXIgaSA9IGNoYW5nZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pXG4gICAgICAgIG1ha2VDaGFuZ2UodGhpcywgY2hhbmdlc1tpXSk7XG4gICAgICBpZiAobmV3U2VsKSBzZXRTZWxlY3Rpb25SZXBsYWNlSGlzdG9yeSh0aGlzLCBuZXdTZWwpO1xuICAgICAgZWxzZSBpZiAodGhpcy5jbSkgZW5zdXJlQ3Vyc29yVmlzaWJsZSh0aGlzLmNtKTtcbiAgICB9KSxcbiAgICB1bmRvOiBkb2NNZXRob2RPcChmdW5jdGlvbigpIHttYWtlQ2hhbmdlRnJvbUhpc3RvcnkodGhpcywgXCJ1bmRvXCIpO30pLFxuICAgIHJlZG86IGRvY01ldGhvZE9wKGZ1bmN0aW9uKCkge21ha2VDaGFuZ2VGcm9tSGlzdG9yeSh0aGlzLCBcInJlZG9cIik7fSksXG4gICAgdW5kb1NlbGVjdGlvbjogZG9jTWV0aG9kT3AoZnVuY3Rpb24oKSB7bWFrZUNoYW5nZUZyb21IaXN0b3J5KHRoaXMsIFwidW5kb1wiLCB0cnVlKTt9KSxcbiAgICByZWRvU2VsZWN0aW9uOiBkb2NNZXRob2RPcChmdW5jdGlvbigpIHttYWtlQ2hhbmdlRnJvbUhpc3RvcnkodGhpcywgXCJyZWRvXCIsIHRydWUpO30pLFxuXG4gICAgc2V0RXh0ZW5kaW5nOiBmdW5jdGlvbih2YWwpIHt0aGlzLmV4dGVuZCA9IHZhbDt9LFxuICAgIGdldEV4dGVuZGluZzogZnVuY3Rpb24oKSB7cmV0dXJuIHRoaXMuZXh0ZW5kO30sXG5cbiAgICBoaXN0b3J5U2l6ZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaGlzdCA9IHRoaXMuaGlzdG9yeSwgZG9uZSA9IDAsIHVuZG9uZSA9IDA7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhpc3QuZG9uZS5sZW5ndGg7IGkrKykgaWYgKCFoaXN0LmRvbmVbaV0ucmFuZ2VzKSArK2RvbmU7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhpc3QudW5kb25lLmxlbmd0aDsgaSsrKSBpZiAoIWhpc3QudW5kb25lW2ldLnJhbmdlcykgKyt1bmRvbmU7XG4gICAgICByZXR1cm4ge3VuZG86IGRvbmUsIHJlZG86IHVuZG9uZX07XG4gICAgfSxcbiAgICBjbGVhckhpc3Rvcnk6IGZ1bmN0aW9uKCkge3RoaXMuaGlzdG9yeSA9IG5ldyBIaXN0b3J5KHRoaXMuaGlzdG9yeS5tYXhHZW5lcmF0aW9uKTt9LFxuXG4gICAgbWFya0NsZWFuOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuY2xlYW5HZW5lcmF0aW9uID0gdGhpcy5jaGFuZ2VHZW5lcmF0aW9uKHRydWUpO1xuICAgIH0sXG4gICAgY2hhbmdlR2VuZXJhdGlvbjogZnVuY3Rpb24oZm9yY2VTcGxpdCkge1xuICAgICAgaWYgKGZvcmNlU3BsaXQpXG4gICAgICAgIHRoaXMuaGlzdG9yeS5sYXN0T3AgPSB0aGlzLmhpc3RvcnkubGFzdE9yaWdpbiA9IG51bGw7XG4gICAgICByZXR1cm4gdGhpcy5oaXN0b3J5LmdlbmVyYXRpb247XG4gICAgfSxcbiAgICBpc0NsZWFuOiBmdW5jdGlvbiAoZ2VuKSB7XG4gICAgICByZXR1cm4gdGhpcy5oaXN0b3J5LmdlbmVyYXRpb24gPT0gKGdlbiB8fCB0aGlzLmNsZWFuR2VuZXJhdGlvbik7XG4gICAgfSxcblxuICAgIGdldEhpc3Rvcnk6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtkb25lOiBjb3B5SGlzdG9yeUFycmF5KHRoaXMuaGlzdG9yeS5kb25lKSxcbiAgICAgICAgICAgICAgdW5kb25lOiBjb3B5SGlzdG9yeUFycmF5KHRoaXMuaGlzdG9yeS51bmRvbmUpfTtcbiAgICB9LFxuICAgIHNldEhpc3Rvcnk6IGZ1bmN0aW9uKGhpc3REYXRhKSB7XG4gICAgICB2YXIgaGlzdCA9IHRoaXMuaGlzdG9yeSA9IG5ldyBIaXN0b3J5KHRoaXMuaGlzdG9yeS5tYXhHZW5lcmF0aW9uKTtcbiAgICAgIGhpc3QuZG9uZSA9IGNvcHlIaXN0b3J5QXJyYXkoaGlzdERhdGEuZG9uZS5zbGljZSgwKSwgbnVsbCwgdHJ1ZSk7XG4gICAgICBoaXN0LnVuZG9uZSA9IGNvcHlIaXN0b3J5QXJyYXkoaGlzdERhdGEudW5kb25lLnNsaWNlKDApLCBudWxsLCB0cnVlKTtcbiAgICB9LFxuXG4gICAgbWFya1RleHQ6IGZ1bmN0aW9uKGZyb20sIHRvLCBvcHRpb25zKSB7XG4gICAgICByZXR1cm4gbWFya1RleHQodGhpcywgY2xpcFBvcyh0aGlzLCBmcm9tKSwgY2xpcFBvcyh0aGlzLCB0byksIG9wdGlvbnMsIFwicmFuZ2VcIik7XG4gICAgfSxcbiAgICBzZXRCb29rbWFyazogZnVuY3Rpb24ocG9zLCBvcHRpb25zKSB7XG4gICAgICB2YXIgcmVhbE9wdHMgPSB7cmVwbGFjZWRXaXRoOiBvcHRpb25zICYmIChvcHRpb25zLm5vZGVUeXBlID09IG51bGwgPyBvcHRpb25zLndpZGdldCA6IG9wdGlvbnMpLFxuICAgICAgICAgICAgICAgICAgICAgIGluc2VydExlZnQ6IG9wdGlvbnMgJiYgb3B0aW9ucy5pbnNlcnRMZWZ0LFxuICAgICAgICAgICAgICAgICAgICAgIGNsZWFyV2hlbkVtcHR5OiBmYWxzZSwgc2hhcmVkOiBvcHRpb25zICYmIG9wdGlvbnMuc2hhcmVkfTtcbiAgICAgIHBvcyA9IGNsaXBQb3ModGhpcywgcG9zKTtcbiAgICAgIHJldHVybiBtYXJrVGV4dCh0aGlzLCBwb3MsIHBvcywgcmVhbE9wdHMsIFwiYm9va21hcmtcIik7XG4gICAgfSxcbiAgICBmaW5kTWFya3NBdDogZnVuY3Rpb24ocG9zKSB7XG4gICAgICBwb3MgPSBjbGlwUG9zKHRoaXMsIHBvcyk7XG4gICAgICB2YXIgbWFya2VycyA9IFtdLCBzcGFucyA9IGdldExpbmUodGhpcywgcG9zLmxpbmUpLm1hcmtlZFNwYW5zO1xuICAgICAgaWYgKHNwYW5zKSBmb3IgKHZhciBpID0gMDsgaSA8IHNwYW5zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBzcGFuID0gc3BhbnNbaV07XG4gICAgICAgIGlmICgoc3Bhbi5mcm9tID09IG51bGwgfHwgc3Bhbi5mcm9tIDw9IHBvcy5jaCkgJiZcbiAgICAgICAgICAgIChzcGFuLnRvID09IG51bGwgfHwgc3Bhbi50byA+PSBwb3MuY2gpKVxuICAgICAgICAgIG1hcmtlcnMucHVzaChzcGFuLm1hcmtlci5wYXJlbnQgfHwgc3Bhbi5tYXJrZXIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1hcmtlcnM7XG4gICAgfSxcbiAgICBmaW5kTWFya3M6IGZ1bmN0aW9uKGZyb20sIHRvLCBmaWx0ZXIpIHtcbiAgICAgIGZyb20gPSBjbGlwUG9zKHRoaXMsIGZyb20pOyB0byA9IGNsaXBQb3ModGhpcywgdG8pO1xuICAgICAgdmFyIGZvdW5kID0gW10sIGxpbmVObyA9IGZyb20ubGluZTtcbiAgICAgIHRoaXMuaXRlcihmcm9tLmxpbmUsIHRvLmxpbmUgKyAxLCBmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgIHZhciBzcGFucyA9IGxpbmUubWFya2VkU3BhbnM7XG4gICAgICAgIGlmIChzcGFucykgZm9yICh2YXIgaSA9IDA7IGkgPCBzcGFucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBzcGFuID0gc3BhbnNbaV07XG4gICAgICAgICAgaWYgKCEobGluZU5vID09IGZyb20ubGluZSAmJiBmcm9tLmNoID4gc3Bhbi50byB8fFxuICAgICAgICAgICAgICAgIHNwYW4uZnJvbSA9PSBudWxsICYmIGxpbmVObyAhPSBmcm9tLmxpbmV8fFxuICAgICAgICAgICAgICAgIGxpbmVObyA9PSB0by5saW5lICYmIHNwYW4uZnJvbSA+IHRvLmNoKSAmJlxuICAgICAgICAgICAgICAoIWZpbHRlciB8fCBmaWx0ZXIoc3Bhbi5tYXJrZXIpKSlcbiAgICAgICAgICAgIGZvdW5kLnB1c2goc3Bhbi5tYXJrZXIucGFyZW50IHx8IHNwYW4ubWFya2VyKTtcbiAgICAgICAgfVxuICAgICAgICArK2xpbmVObztcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGZvdW5kO1xuICAgIH0sXG4gICAgZ2V0QWxsTWFya3M6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG1hcmtlcnMgPSBbXTtcbiAgICAgIHRoaXMuaXRlcihmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgIHZhciBzcHMgPSBsaW5lLm1hcmtlZFNwYW5zO1xuICAgICAgICBpZiAoc3BzKSBmb3IgKHZhciBpID0gMDsgaSA8IHNwcy5sZW5ndGg7ICsraSlcbiAgICAgICAgICBpZiAoc3BzW2ldLmZyb20gIT0gbnVsbCkgbWFya2Vycy5wdXNoKHNwc1tpXS5tYXJrZXIpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gbWFya2VycztcbiAgICB9LFxuXG4gICAgcG9zRnJvbUluZGV4OiBmdW5jdGlvbihvZmYpIHtcbiAgICAgIHZhciBjaCwgbGluZU5vID0gdGhpcy5maXJzdDtcbiAgICAgIHRoaXMuaXRlcihmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgIHZhciBzeiA9IGxpbmUudGV4dC5sZW5ndGggKyAxO1xuICAgICAgICBpZiAoc3ogPiBvZmYpIHsgY2ggPSBvZmY7IHJldHVybiB0cnVlOyB9XG4gICAgICAgIG9mZiAtPSBzejtcbiAgICAgICAgKytsaW5lTm87XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBjbGlwUG9zKHRoaXMsIFBvcyhsaW5lTm8sIGNoKSk7XG4gICAgfSxcbiAgICBpbmRleEZyb21Qb3M6IGZ1bmN0aW9uIChjb29yZHMpIHtcbiAgICAgIGNvb3JkcyA9IGNsaXBQb3ModGhpcywgY29vcmRzKTtcbiAgICAgIHZhciBpbmRleCA9IGNvb3Jkcy5jaDtcbiAgICAgIGlmIChjb29yZHMubGluZSA8IHRoaXMuZmlyc3QgfHwgY29vcmRzLmNoIDwgMCkgcmV0dXJuIDA7XG4gICAgICB0aGlzLml0ZXIodGhpcy5maXJzdCwgY29vcmRzLmxpbmUsIGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgICAgIGluZGV4ICs9IGxpbmUudGV4dC5sZW5ndGggKyAxO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gaW5kZXg7XG4gICAgfSxcblxuICAgIGNvcHk6IGZ1bmN0aW9uKGNvcHlIaXN0b3J5KSB7XG4gICAgICB2YXIgZG9jID0gbmV3IERvYyhnZXRMaW5lcyh0aGlzLCB0aGlzLmZpcnN0LCB0aGlzLmZpcnN0ICsgdGhpcy5zaXplKSwgdGhpcy5tb2RlT3B0aW9uLCB0aGlzLmZpcnN0KTtcbiAgICAgIGRvYy5zY3JvbGxUb3AgPSB0aGlzLnNjcm9sbFRvcDsgZG9jLnNjcm9sbExlZnQgPSB0aGlzLnNjcm9sbExlZnQ7XG4gICAgICBkb2Muc2VsID0gdGhpcy5zZWw7XG4gICAgICBkb2MuZXh0ZW5kID0gZmFsc2U7XG4gICAgICBpZiAoY29weUhpc3RvcnkpIHtcbiAgICAgICAgZG9jLmhpc3RvcnkudW5kb0RlcHRoID0gdGhpcy5oaXN0b3J5LnVuZG9EZXB0aDtcbiAgICAgICAgZG9jLnNldEhpc3RvcnkodGhpcy5nZXRIaXN0b3J5KCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRvYztcbiAgICB9LFxuXG4gICAgbGlua2VkRG9jOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICBpZiAoIW9wdGlvbnMpIG9wdGlvbnMgPSB7fTtcbiAgICAgIHZhciBmcm9tID0gdGhpcy5maXJzdCwgdG8gPSB0aGlzLmZpcnN0ICsgdGhpcy5zaXplO1xuICAgICAgaWYgKG9wdGlvbnMuZnJvbSAhPSBudWxsICYmIG9wdGlvbnMuZnJvbSA+IGZyb20pIGZyb20gPSBvcHRpb25zLmZyb207XG4gICAgICBpZiAob3B0aW9ucy50byAhPSBudWxsICYmIG9wdGlvbnMudG8gPCB0bykgdG8gPSBvcHRpb25zLnRvO1xuICAgICAgdmFyIGNvcHkgPSBuZXcgRG9jKGdldExpbmVzKHRoaXMsIGZyb20sIHRvKSwgb3B0aW9ucy5tb2RlIHx8IHRoaXMubW9kZU9wdGlvbiwgZnJvbSk7XG4gICAgICBpZiAob3B0aW9ucy5zaGFyZWRIaXN0KSBjb3B5Lmhpc3RvcnkgPSB0aGlzLmhpc3Rvcnk7XG4gICAgICAodGhpcy5saW5rZWQgfHwgKHRoaXMubGlua2VkID0gW10pKS5wdXNoKHtkb2M6IGNvcHksIHNoYXJlZEhpc3Q6IG9wdGlvbnMuc2hhcmVkSGlzdH0pO1xuICAgICAgY29weS5saW5rZWQgPSBbe2RvYzogdGhpcywgaXNQYXJlbnQ6IHRydWUsIHNoYXJlZEhpc3Q6IG9wdGlvbnMuc2hhcmVkSGlzdH1dO1xuICAgICAgY29weVNoYXJlZE1hcmtlcnMoY29weSwgZmluZFNoYXJlZE1hcmtlcnModGhpcykpO1xuICAgICAgcmV0dXJuIGNvcHk7XG4gICAgfSxcbiAgICB1bmxpbmtEb2M6IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICBpZiAob3RoZXIgaW5zdGFuY2VvZiBDb2RlTWlycm9yKSBvdGhlciA9IG90aGVyLmRvYztcbiAgICAgIGlmICh0aGlzLmxpbmtlZCkgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxpbmtlZC5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgbGluayA9IHRoaXMubGlua2VkW2ldO1xuICAgICAgICBpZiAobGluay5kb2MgIT0gb3RoZXIpIGNvbnRpbnVlO1xuICAgICAgICB0aGlzLmxpbmtlZC5zcGxpY2UoaSwgMSk7XG4gICAgICAgIG90aGVyLnVubGlua0RvYyh0aGlzKTtcbiAgICAgICAgZGV0YWNoU2hhcmVkTWFya2VycyhmaW5kU2hhcmVkTWFya2Vycyh0aGlzKSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgLy8gSWYgdGhlIGhpc3RvcmllcyB3ZXJlIHNoYXJlZCwgc3BsaXQgdGhlbSBhZ2FpblxuICAgICAgaWYgKG90aGVyLmhpc3RvcnkgPT0gdGhpcy5oaXN0b3J5KSB7XG4gICAgICAgIHZhciBzcGxpdElkcyA9IFtvdGhlci5pZF07XG4gICAgICAgIGxpbmtlZERvY3Mob3RoZXIsIGZ1bmN0aW9uKGRvYykge3NwbGl0SWRzLnB1c2goZG9jLmlkKTt9LCB0cnVlKTtcbiAgICAgICAgb3RoZXIuaGlzdG9yeSA9IG5ldyBIaXN0b3J5KG51bGwpO1xuICAgICAgICBvdGhlci5oaXN0b3J5LmRvbmUgPSBjb3B5SGlzdG9yeUFycmF5KHRoaXMuaGlzdG9yeS5kb25lLCBzcGxpdElkcyk7XG4gICAgICAgIG90aGVyLmhpc3RvcnkudW5kb25lID0gY29weUhpc3RvcnlBcnJheSh0aGlzLmhpc3RvcnkudW5kb25lLCBzcGxpdElkcyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBpdGVyTGlua2VkRG9jczogZnVuY3Rpb24oZikge2xpbmtlZERvY3ModGhpcywgZik7fSxcblxuICAgIGdldE1vZGU6IGZ1bmN0aW9uKCkge3JldHVybiB0aGlzLm1vZGU7fSxcbiAgICBnZXRFZGl0b3I6IGZ1bmN0aW9uKCkge3JldHVybiB0aGlzLmNtO31cbiAgfSk7XG5cbiAgLy8gUHVibGljIGFsaWFzLlxuICBEb2MucHJvdG90eXBlLmVhY2hMaW5lID0gRG9jLnByb3RvdHlwZS5pdGVyO1xuXG4gIC8vIFNldCB1cCBtZXRob2RzIG9uIENvZGVNaXJyb3IncyBwcm90b3R5cGUgdG8gcmVkaXJlY3QgdG8gdGhlIGVkaXRvcidzIGRvY3VtZW50LlxuICB2YXIgZG9udERlbGVnYXRlID0gXCJpdGVyIGluc2VydCByZW1vdmUgY29weSBnZXRFZGl0b3JcIi5zcGxpdChcIiBcIik7XG4gIGZvciAodmFyIHByb3AgaW4gRG9jLnByb3RvdHlwZSkgaWYgKERvYy5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkocHJvcCkgJiYgaW5kZXhPZihkb250RGVsZWdhdGUsIHByb3ApIDwgMClcbiAgICBDb2RlTWlycm9yLnByb3RvdHlwZVtwcm9wXSA9IChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtyZXR1cm4gbWV0aG9kLmFwcGx5KHRoaXMuZG9jLCBhcmd1bWVudHMpO307XG4gICAgfSkoRG9jLnByb3RvdHlwZVtwcm9wXSk7XG5cbiAgZXZlbnRNaXhpbihEb2MpO1xuXG4gIC8vIENhbGwgZiBmb3IgYWxsIGxpbmtlZCBkb2N1bWVudHMuXG4gIGZ1bmN0aW9uIGxpbmtlZERvY3MoZG9jLCBmLCBzaGFyZWRIaXN0T25seSkge1xuICAgIGZ1bmN0aW9uIHByb3BhZ2F0ZShkb2MsIHNraXAsIHNoYXJlZEhpc3QpIHtcbiAgICAgIGlmIChkb2MubGlua2VkKSBmb3IgKHZhciBpID0gMDsgaSA8IGRvYy5saW5rZWQubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIHJlbCA9IGRvYy5saW5rZWRbaV07XG4gICAgICAgIGlmIChyZWwuZG9jID09IHNraXApIGNvbnRpbnVlO1xuICAgICAgICB2YXIgc2hhcmVkID0gc2hhcmVkSGlzdCAmJiByZWwuc2hhcmVkSGlzdDtcbiAgICAgICAgaWYgKHNoYXJlZEhpc3RPbmx5ICYmICFzaGFyZWQpIGNvbnRpbnVlO1xuICAgICAgICBmKHJlbC5kb2MsIHNoYXJlZCk7XG4gICAgICAgIHByb3BhZ2F0ZShyZWwuZG9jLCBkb2MsIHNoYXJlZCk7XG4gICAgICB9XG4gICAgfVxuICAgIHByb3BhZ2F0ZShkb2MsIG51bGwsIHRydWUpO1xuICB9XG5cbiAgLy8gQXR0YWNoIGEgZG9jdW1lbnQgdG8gYW4gZWRpdG9yLlxuICBmdW5jdGlvbiBhdHRhY2hEb2MoY20sIGRvYykge1xuICAgIGlmIChkb2MuY20pIHRocm93IG5ldyBFcnJvcihcIlRoaXMgZG9jdW1lbnQgaXMgYWxyZWFkeSBpbiB1c2UuXCIpO1xuICAgIGNtLmRvYyA9IGRvYztcbiAgICBkb2MuY20gPSBjbTtcbiAgICBlc3RpbWF0ZUxpbmVIZWlnaHRzKGNtKTtcbiAgICBsb2FkTW9kZShjbSk7XG4gICAgaWYgKCFjbS5vcHRpb25zLmxpbmVXcmFwcGluZykgZmluZE1heExpbmUoY20pO1xuICAgIGNtLm9wdGlvbnMubW9kZSA9IGRvYy5tb2RlT3B0aW9uO1xuICAgIHJlZ0NoYW5nZShjbSk7XG4gIH1cblxuICAvLyBMSU5FIFVUSUxJVElFU1xuXG4gIC8vIEZpbmQgdGhlIGxpbmUgb2JqZWN0IGNvcnJlc3BvbmRpbmcgdG8gdGhlIGdpdmVuIGxpbmUgbnVtYmVyLlxuICBmdW5jdGlvbiBnZXRMaW5lKGRvYywgbikge1xuICAgIG4gLT0gZG9jLmZpcnN0O1xuICAgIGlmIChuIDwgMCB8fCBuID49IGRvYy5zaXplKSB0aHJvdyBuZXcgRXJyb3IoXCJUaGVyZSBpcyBubyBsaW5lIFwiICsgKG4gKyBkb2MuZmlyc3QpICsgXCIgaW4gdGhlIGRvY3VtZW50LlwiKTtcbiAgICBmb3IgKHZhciBjaHVuayA9IGRvYzsgIWNodW5rLmxpbmVzOykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7OyArK2kpIHtcbiAgICAgICAgdmFyIGNoaWxkID0gY2h1bmsuY2hpbGRyZW5baV0sIHN6ID0gY2hpbGQuY2h1bmtTaXplKCk7XG4gICAgICAgIGlmIChuIDwgc3opIHsgY2h1bmsgPSBjaGlsZDsgYnJlYWs7IH1cbiAgICAgICAgbiAtPSBzejtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNodW5rLmxpbmVzW25dO1xuICB9XG5cbiAgLy8gR2V0IHRoZSBwYXJ0IG9mIGEgZG9jdW1lbnQgYmV0d2VlbiB0d28gcG9zaXRpb25zLCBhcyBhbiBhcnJheSBvZlxuICAvLyBzdHJpbmdzLlxuICBmdW5jdGlvbiBnZXRCZXR3ZWVuKGRvYywgc3RhcnQsIGVuZCkge1xuICAgIHZhciBvdXQgPSBbXSwgbiA9IHN0YXJ0LmxpbmU7XG4gICAgZG9jLml0ZXIoc3RhcnQubGluZSwgZW5kLmxpbmUgKyAxLCBmdW5jdGlvbihsaW5lKSB7XG4gICAgICB2YXIgdGV4dCA9IGxpbmUudGV4dDtcbiAgICAgIGlmIChuID09IGVuZC5saW5lKSB0ZXh0ID0gdGV4dC5zbGljZSgwLCBlbmQuY2gpO1xuICAgICAgaWYgKG4gPT0gc3RhcnQubGluZSkgdGV4dCA9IHRleHQuc2xpY2Uoc3RhcnQuY2gpO1xuICAgICAgb3V0LnB1c2godGV4dCk7XG4gICAgICArK247XG4gICAgfSk7XG4gICAgcmV0dXJuIG91dDtcbiAgfVxuICAvLyBHZXQgdGhlIGxpbmVzIGJldHdlZW4gZnJvbSBhbmQgdG8sIGFzIGFycmF5IG9mIHN0cmluZ3MuXG4gIGZ1bmN0aW9uIGdldExpbmVzKGRvYywgZnJvbSwgdG8pIHtcbiAgICB2YXIgb3V0ID0gW107XG4gICAgZG9jLml0ZXIoZnJvbSwgdG8sIGZ1bmN0aW9uKGxpbmUpIHsgb3V0LnB1c2gobGluZS50ZXh0KTsgfSk7XG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIC8vIFVwZGF0ZSB0aGUgaGVpZ2h0IG9mIGEgbGluZSwgcHJvcGFnYXRpbmcgdGhlIGhlaWdodCBjaGFuZ2VcbiAgLy8gdXB3YXJkcyB0byBwYXJlbnQgbm9kZXMuXG4gIGZ1bmN0aW9uIHVwZGF0ZUxpbmVIZWlnaHQobGluZSwgaGVpZ2h0KSB7XG4gICAgdmFyIGRpZmYgPSBoZWlnaHQgLSBsaW5lLmhlaWdodDtcbiAgICBpZiAoZGlmZikgZm9yICh2YXIgbiA9IGxpbmU7IG47IG4gPSBuLnBhcmVudCkgbi5oZWlnaHQgKz0gZGlmZjtcbiAgfVxuXG4gIC8vIEdpdmVuIGEgbGluZSBvYmplY3QsIGZpbmQgaXRzIGxpbmUgbnVtYmVyIGJ5IHdhbGtpbmcgdXAgdGhyb3VnaFxuICAvLyBpdHMgcGFyZW50IGxpbmtzLlxuICBmdW5jdGlvbiBsaW5lTm8obGluZSkge1xuICAgIGlmIChsaW5lLnBhcmVudCA9PSBudWxsKSByZXR1cm4gbnVsbDtcbiAgICB2YXIgY3VyID0gbGluZS5wYXJlbnQsIG5vID0gaW5kZXhPZihjdXIubGluZXMsIGxpbmUpO1xuICAgIGZvciAodmFyIGNodW5rID0gY3VyLnBhcmVudDsgY2h1bms7IGN1ciA9IGNodW5rLCBjaHVuayA9IGNodW5rLnBhcmVudCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7OyArK2kpIHtcbiAgICAgICAgaWYgKGNodW5rLmNoaWxkcmVuW2ldID09IGN1cikgYnJlYWs7XG4gICAgICAgIG5vICs9IGNodW5rLmNoaWxkcmVuW2ldLmNodW5rU2l6ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbm8gKyBjdXIuZmlyc3Q7XG4gIH1cblxuICAvLyBGaW5kIHRoZSBsaW5lIGF0IHRoZSBnaXZlbiB2ZXJ0aWNhbCBwb3NpdGlvbiwgdXNpbmcgdGhlIGhlaWdodFxuICAvLyBpbmZvcm1hdGlvbiBpbiB0aGUgZG9jdW1lbnQgdHJlZS5cbiAgZnVuY3Rpb24gbGluZUF0SGVpZ2h0KGNodW5rLCBoKSB7XG4gICAgdmFyIG4gPSBjaHVuay5maXJzdDtcbiAgICBvdXRlcjogZG8ge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaHVuay5jaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgY2hpbGQgPSBjaHVuay5jaGlsZHJlbltpXSwgY2ggPSBjaGlsZC5oZWlnaHQ7XG4gICAgICAgIGlmIChoIDwgY2gpIHsgY2h1bmsgPSBjaGlsZDsgY29udGludWUgb3V0ZXI7IH1cbiAgICAgICAgaCAtPSBjaDtcbiAgICAgICAgbiArPSBjaGlsZC5jaHVua1NpemUoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuO1xuICAgIH0gd2hpbGUgKCFjaHVuay5saW5lcyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaHVuay5saW5lcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGxpbmUgPSBjaHVuay5saW5lc1tpXSwgbGggPSBsaW5lLmhlaWdodDtcbiAgICAgIGlmIChoIDwgbGgpIGJyZWFrO1xuICAgICAgaCAtPSBsaDtcbiAgICB9XG4gICAgcmV0dXJuIG4gKyBpO1xuICB9XG5cblxuICAvLyBGaW5kIHRoZSBoZWlnaHQgYWJvdmUgdGhlIGdpdmVuIGxpbmUuXG4gIGZ1bmN0aW9uIGhlaWdodEF0TGluZShsaW5lT2JqKSB7XG4gICAgbGluZU9iaiA9IHZpc3VhbExpbmUobGluZU9iaik7XG5cbiAgICB2YXIgaCA9IDAsIGNodW5rID0gbGluZU9iai5wYXJlbnQ7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaHVuay5saW5lcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGxpbmUgPSBjaHVuay5saW5lc1tpXTtcbiAgICAgIGlmIChsaW5lID09IGxpbmVPYmopIGJyZWFrO1xuICAgICAgZWxzZSBoICs9IGxpbmUuaGVpZ2h0O1xuICAgIH1cbiAgICBmb3IgKHZhciBwID0gY2h1bmsucGFyZW50OyBwOyBjaHVuayA9IHAsIHAgPSBjaHVuay5wYXJlbnQpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcC5jaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgY3VyID0gcC5jaGlsZHJlbltpXTtcbiAgICAgICAgaWYgKGN1ciA9PSBjaHVuaykgYnJlYWs7XG4gICAgICAgIGVsc2UgaCArPSBjdXIuaGVpZ2h0O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaDtcbiAgfVxuXG4gIC8vIEdldCB0aGUgYmlkaSBvcmRlcmluZyBmb3IgdGhlIGdpdmVuIGxpbmUgKGFuZCBjYWNoZSBpdCkuIFJldHVybnNcbiAgLy8gZmFsc2UgZm9yIGxpbmVzIHRoYXQgYXJlIGZ1bGx5IGxlZnQtdG8tcmlnaHQsIGFuZCBhbiBhcnJheSBvZlxuICAvLyBCaWRpU3BhbiBvYmplY3RzIG90aGVyd2lzZS5cbiAgZnVuY3Rpb24gZ2V0T3JkZXIobGluZSkge1xuICAgIHZhciBvcmRlciA9IGxpbmUub3JkZXI7XG4gICAgaWYgKG9yZGVyID09IG51bGwpIG9yZGVyID0gbGluZS5vcmRlciA9IGJpZGlPcmRlcmluZyhsaW5lLnRleHQpO1xuICAgIHJldHVybiBvcmRlcjtcbiAgfVxuXG4gIC8vIEhJU1RPUllcblxuICBmdW5jdGlvbiBIaXN0b3J5KHN0YXJ0R2VuKSB7XG4gICAgLy8gQXJyYXlzIG9mIGNoYW5nZSBldmVudHMgYW5kIHNlbGVjdGlvbnMuIERvaW5nIHNvbWV0aGluZyBhZGRzIGFuXG4gICAgLy8gZXZlbnQgdG8gZG9uZSBhbmQgY2xlYXJzIHVuZG8uIFVuZG9pbmcgbW92ZXMgZXZlbnRzIGZyb20gZG9uZVxuICAgIC8vIHRvIHVuZG9uZSwgcmVkb2luZyBtb3ZlcyB0aGVtIGluIHRoZSBvdGhlciBkaXJlY3Rpb24uXG4gICAgdGhpcy5kb25lID0gW107IHRoaXMudW5kb25lID0gW107XG4gICAgdGhpcy51bmRvRGVwdGggPSBJbmZpbml0eTtcbiAgICAvLyBVc2VkIHRvIHRyYWNrIHdoZW4gY2hhbmdlcyBjYW4gYmUgbWVyZ2VkIGludG8gYSBzaW5nbGUgdW5kb1xuICAgIC8vIGV2ZW50XG4gICAgdGhpcy5sYXN0TW9kVGltZSA9IHRoaXMubGFzdFNlbFRpbWUgPSAwO1xuICAgIHRoaXMubGFzdE9wID0gbnVsbDtcbiAgICB0aGlzLmxhc3RPcmlnaW4gPSB0aGlzLmxhc3RTZWxPcmlnaW4gPSBudWxsO1xuICAgIC8vIFVzZWQgYnkgdGhlIGlzQ2xlYW4oKSBtZXRob2RcbiAgICB0aGlzLmdlbmVyYXRpb24gPSB0aGlzLm1heEdlbmVyYXRpb24gPSBzdGFydEdlbiB8fCAxO1xuICB9XG5cbiAgLy8gQ3JlYXRlIGEgaGlzdG9yeSBjaGFuZ2UgZXZlbnQgZnJvbSBhbiB1cGRhdGVEb2Mtc3R5bGUgY2hhbmdlXG4gIC8vIG9iamVjdC5cbiAgZnVuY3Rpb24gaGlzdG9yeUNoYW5nZUZyb21DaGFuZ2UoZG9jLCBjaGFuZ2UpIHtcbiAgICB2YXIgaGlzdENoYW5nZSA9IHtmcm9tOiBjb3B5UG9zKGNoYW5nZS5mcm9tKSwgdG86IGNoYW5nZUVuZChjaGFuZ2UpLCB0ZXh0OiBnZXRCZXR3ZWVuKGRvYywgY2hhbmdlLmZyb20sIGNoYW5nZS50byl9O1xuICAgIGF0dGFjaExvY2FsU3BhbnMoZG9jLCBoaXN0Q2hhbmdlLCBjaGFuZ2UuZnJvbS5saW5lLCBjaGFuZ2UudG8ubGluZSArIDEpO1xuICAgIGxpbmtlZERvY3MoZG9jLCBmdW5jdGlvbihkb2MpIHthdHRhY2hMb2NhbFNwYW5zKGRvYywgaGlzdENoYW5nZSwgY2hhbmdlLmZyb20ubGluZSwgY2hhbmdlLnRvLmxpbmUgKyAxKTt9LCB0cnVlKTtcbiAgICByZXR1cm4gaGlzdENoYW5nZTtcbiAgfVxuXG4gIC8vIFBvcCBhbGwgc2VsZWN0aW9uIGV2ZW50cyBvZmYgdGhlIGVuZCBvZiBhIGhpc3RvcnkgYXJyYXkuIFN0b3AgYXRcbiAgLy8gYSBjaGFuZ2UgZXZlbnQuXG4gIGZ1bmN0aW9uIGNsZWFyU2VsZWN0aW9uRXZlbnRzKGFycmF5KSB7XG4gICAgd2hpbGUgKGFycmF5Lmxlbmd0aCkge1xuICAgICAgdmFyIGxhc3QgPSBsc3QoYXJyYXkpO1xuICAgICAgaWYgKGxhc3QucmFuZ2VzKSBhcnJheS5wb3AoKTtcbiAgICAgIGVsc2UgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLy8gRmluZCB0aGUgdG9wIGNoYW5nZSBldmVudCBpbiB0aGUgaGlzdG9yeS4gUG9wIG9mZiBzZWxlY3Rpb25cbiAgLy8gZXZlbnRzIHRoYXQgYXJlIGluIHRoZSB3YXkuXG4gIGZ1bmN0aW9uIGxhc3RDaGFuZ2VFdmVudChoaXN0LCBmb3JjZSkge1xuICAgIGlmIChmb3JjZSkge1xuICAgICAgY2xlYXJTZWxlY3Rpb25FdmVudHMoaGlzdC5kb25lKTtcbiAgICAgIHJldHVybiBsc3QoaGlzdC5kb25lKTtcbiAgICB9IGVsc2UgaWYgKGhpc3QuZG9uZS5sZW5ndGggJiYgIWxzdChoaXN0LmRvbmUpLnJhbmdlcykge1xuICAgICAgcmV0dXJuIGxzdChoaXN0LmRvbmUpO1xuICAgIH0gZWxzZSBpZiAoaGlzdC5kb25lLmxlbmd0aCA+IDEgJiYgIWhpc3QuZG9uZVtoaXN0LmRvbmUubGVuZ3RoIC0gMl0ucmFuZ2VzKSB7XG4gICAgICBoaXN0LmRvbmUucG9wKCk7XG4gICAgICByZXR1cm4gbHN0KGhpc3QuZG9uZSk7XG4gICAgfVxuICB9XG5cbiAgLy8gUmVnaXN0ZXIgYSBjaGFuZ2UgaW4gdGhlIGhpc3RvcnkuIE1lcmdlcyBjaGFuZ2VzIHRoYXQgYXJlIHdpdGhpblxuICAvLyBhIHNpbmdsZSBvcGVyYXRpb24sIG9yZSBhcmUgY2xvc2UgdG9nZXRoZXIgd2l0aCBhbiBvcmlnaW4gdGhhdFxuICAvLyBhbGxvd3MgbWVyZ2luZyAoc3RhcnRpbmcgd2l0aCBcIitcIikgaW50byBhIHNpbmdsZSBldmVudC5cbiAgZnVuY3Rpb24gYWRkQ2hhbmdlVG9IaXN0b3J5KGRvYywgY2hhbmdlLCBzZWxBZnRlciwgb3BJZCkge1xuICAgIHZhciBoaXN0ID0gZG9jLmhpc3Rvcnk7XG4gICAgaGlzdC51bmRvbmUubGVuZ3RoID0gMDtcbiAgICB2YXIgdGltZSA9ICtuZXcgRGF0ZSwgY3VyO1xuXG4gICAgaWYgKChoaXN0Lmxhc3RPcCA9PSBvcElkIHx8XG4gICAgICAgICBoaXN0Lmxhc3RPcmlnaW4gPT0gY2hhbmdlLm9yaWdpbiAmJiBjaGFuZ2Uub3JpZ2luICYmXG4gICAgICAgICAoKGNoYW5nZS5vcmlnaW4uY2hhckF0KDApID09IFwiK1wiICYmIGRvYy5jbSAmJiBoaXN0Lmxhc3RNb2RUaW1lID4gdGltZSAtIGRvYy5jbS5vcHRpb25zLmhpc3RvcnlFdmVudERlbGF5KSB8fFxuICAgICAgICAgIGNoYW5nZS5vcmlnaW4uY2hhckF0KDApID09IFwiKlwiKSkgJiZcbiAgICAgICAgKGN1ciA9IGxhc3RDaGFuZ2VFdmVudChoaXN0LCBoaXN0Lmxhc3RPcCA9PSBvcElkKSkpIHtcbiAgICAgIC8vIE1lcmdlIHRoaXMgY2hhbmdlIGludG8gdGhlIGxhc3QgZXZlbnRcbiAgICAgIHZhciBsYXN0ID0gbHN0KGN1ci5jaGFuZ2VzKTtcbiAgICAgIGlmIChjbXAoY2hhbmdlLmZyb20sIGNoYW5nZS50bykgPT0gMCAmJiBjbXAoY2hhbmdlLmZyb20sIGxhc3QudG8pID09IDApIHtcbiAgICAgICAgLy8gT3B0aW1pemVkIGNhc2UgZm9yIHNpbXBsZSBpbnNlcnRpb24gLS0gZG9uJ3Qgd2FudCB0byBhZGRcbiAgICAgICAgLy8gbmV3IGNoYW5nZXNldHMgZm9yIGV2ZXJ5IGNoYXJhY3RlciB0eXBlZFxuICAgICAgICBsYXN0LnRvID0gY2hhbmdlRW5kKGNoYW5nZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBZGQgbmV3IHN1Yi1ldmVudFxuICAgICAgICBjdXIuY2hhbmdlcy5wdXNoKGhpc3RvcnlDaGFuZ2VGcm9tQ2hhbmdlKGRvYywgY2hhbmdlKSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIENhbiBub3QgYmUgbWVyZ2VkLCBzdGFydCBhIG5ldyBldmVudC5cbiAgICAgIHZhciBiZWZvcmUgPSBsc3QoaGlzdC5kb25lKTtcbiAgICAgIGlmICghYmVmb3JlIHx8ICFiZWZvcmUucmFuZ2VzKVxuICAgICAgICBwdXNoU2VsZWN0aW9uVG9IaXN0b3J5KGRvYy5zZWwsIGhpc3QuZG9uZSk7XG4gICAgICBjdXIgPSB7Y2hhbmdlczogW2hpc3RvcnlDaGFuZ2VGcm9tQ2hhbmdlKGRvYywgY2hhbmdlKV0sXG4gICAgICAgICAgICAgZ2VuZXJhdGlvbjogaGlzdC5nZW5lcmF0aW9ufTtcbiAgICAgIGhpc3QuZG9uZS5wdXNoKGN1cik7XG4gICAgICB3aGlsZSAoaGlzdC5kb25lLmxlbmd0aCA+IGhpc3QudW5kb0RlcHRoKSB7XG4gICAgICAgIGhpc3QuZG9uZS5zaGlmdCgpO1xuICAgICAgICBpZiAoIWhpc3QuZG9uZVswXS5yYW5nZXMpIGhpc3QuZG9uZS5zaGlmdCgpO1xuICAgICAgfVxuICAgIH1cbiAgICBoaXN0LmRvbmUucHVzaChzZWxBZnRlcik7XG4gICAgaGlzdC5nZW5lcmF0aW9uID0gKytoaXN0Lm1heEdlbmVyYXRpb247XG4gICAgaGlzdC5sYXN0TW9kVGltZSA9IGhpc3QubGFzdFNlbFRpbWUgPSB0aW1lO1xuICAgIGhpc3QubGFzdE9wID0gb3BJZDtcbiAgICBoaXN0Lmxhc3RPcmlnaW4gPSBoaXN0Lmxhc3RTZWxPcmlnaW4gPSBjaGFuZ2Uub3JpZ2luO1xuXG4gICAgaWYgKCFsYXN0KSBzaWduYWwoZG9jLCBcImhpc3RvcnlBZGRlZFwiKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNlbGVjdGlvbkV2ZW50Q2FuQmVNZXJnZWQoZG9jLCBvcmlnaW4sIHByZXYsIHNlbCkge1xuICAgIHZhciBjaCA9IG9yaWdpbi5jaGFyQXQoMCk7XG4gICAgcmV0dXJuIGNoID09IFwiKlwiIHx8XG4gICAgICBjaCA9PSBcIitcIiAmJlxuICAgICAgcHJldi5yYW5nZXMubGVuZ3RoID09IHNlbC5yYW5nZXMubGVuZ3RoICYmXG4gICAgICBwcmV2LnNvbWV0aGluZ1NlbGVjdGVkKCkgPT0gc2VsLnNvbWV0aGluZ1NlbGVjdGVkKCkgJiZcbiAgICAgIG5ldyBEYXRlIC0gZG9jLmhpc3RvcnkubGFzdFNlbFRpbWUgPD0gKGRvYy5jbSA/IGRvYy5jbS5vcHRpb25zLmhpc3RvcnlFdmVudERlbGF5IDogNTAwKTtcbiAgfVxuXG4gIC8vIENhbGxlZCB3aGVuZXZlciB0aGUgc2VsZWN0aW9uIGNoYW5nZXMsIHNldHMgdGhlIG5ldyBzZWxlY3Rpb24gYXNcbiAgLy8gdGhlIHBlbmRpbmcgc2VsZWN0aW9uIGluIHRoZSBoaXN0b3J5LCBhbmQgcHVzaGVzIHRoZSBvbGQgcGVuZGluZ1xuICAvLyBzZWxlY3Rpb24gaW50byB0aGUgJ2RvbmUnIGFycmF5IHdoZW4gaXQgd2FzIHNpZ25pZmljYW50bHlcbiAgLy8gZGlmZmVyZW50IChpbiBudW1iZXIgb2Ygc2VsZWN0ZWQgcmFuZ2VzLCBlbXB0aW5lc3MsIG9yIHRpbWUpLlxuICBmdW5jdGlvbiBhZGRTZWxlY3Rpb25Ub0hpc3RvcnkoZG9jLCBzZWwsIG9wSWQsIG9wdGlvbnMpIHtcbiAgICB2YXIgaGlzdCA9IGRvYy5oaXN0b3J5LCBvcmlnaW4gPSBvcHRpb25zICYmIG9wdGlvbnMub3JpZ2luO1xuXG4gICAgLy8gQSBuZXcgZXZlbnQgaXMgc3RhcnRlZCB3aGVuIHRoZSBwcmV2aW91cyBvcmlnaW4gZG9lcyBub3QgbWF0Y2hcbiAgICAvLyB0aGUgY3VycmVudCwgb3IgdGhlIG9yaWdpbnMgZG9uJ3QgYWxsb3cgbWF0Y2hpbmcuIE9yaWdpbnNcbiAgICAvLyBzdGFydGluZyB3aXRoICogYXJlIGFsd2F5cyBtZXJnZWQsIHRob3NlIHN0YXJ0aW5nIHdpdGggKyBhcmVcbiAgICAvLyBtZXJnZWQgd2hlbiBzaW1pbGFyIGFuZCBjbG9zZSB0b2dldGhlciBpbiB0aW1lLlxuICAgIGlmIChvcElkID09IGhpc3QubGFzdE9wIHx8XG4gICAgICAgIChvcmlnaW4gJiYgaGlzdC5sYXN0U2VsT3JpZ2luID09IG9yaWdpbiAmJlxuICAgICAgICAgKGhpc3QubGFzdE1vZFRpbWUgPT0gaGlzdC5sYXN0U2VsVGltZSAmJiBoaXN0Lmxhc3RPcmlnaW4gPT0gb3JpZ2luIHx8XG4gICAgICAgICAgc2VsZWN0aW9uRXZlbnRDYW5CZU1lcmdlZChkb2MsIG9yaWdpbiwgbHN0KGhpc3QuZG9uZSksIHNlbCkpKSlcbiAgICAgIGhpc3QuZG9uZVtoaXN0LmRvbmUubGVuZ3RoIC0gMV0gPSBzZWw7XG4gICAgZWxzZVxuICAgICAgcHVzaFNlbGVjdGlvblRvSGlzdG9yeShzZWwsIGhpc3QuZG9uZSk7XG5cbiAgICBoaXN0Lmxhc3RTZWxUaW1lID0gK25ldyBEYXRlO1xuICAgIGhpc3QubGFzdFNlbE9yaWdpbiA9IG9yaWdpbjtcbiAgICBoaXN0Lmxhc3RPcCA9IG9wSWQ7XG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5jbGVhclJlZG8gIT09IGZhbHNlKVxuICAgICAgY2xlYXJTZWxlY3Rpb25FdmVudHMoaGlzdC51bmRvbmUpO1xuICB9XG5cbiAgZnVuY3Rpb24gcHVzaFNlbGVjdGlvblRvSGlzdG9yeShzZWwsIGRlc3QpIHtcbiAgICB2YXIgdG9wID0gbHN0KGRlc3QpO1xuICAgIGlmICghKHRvcCAmJiB0b3AucmFuZ2VzICYmIHRvcC5lcXVhbHMoc2VsKSkpXG4gICAgICBkZXN0LnB1c2goc2VsKTtcbiAgfVxuXG4gIC8vIFVzZWQgdG8gc3RvcmUgbWFya2VkIHNwYW4gaW5mb3JtYXRpb24gaW4gdGhlIGhpc3RvcnkuXG4gIGZ1bmN0aW9uIGF0dGFjaExvY2FsU3BhbnMoZG9jLCBjaGFuZ2UsIGZyb20sIHRvKSB7XG4gICAgdmFyIGV4aXN0aW5nID0gY2hhbmdlW1wic3BhbnNfXCIgKyBkb2MuaWRdLCBuID0gMDtcbiAgICBkb2MuaXRlcihNYXRoLm1heChkb2MuZmlyc3QsIGZyb20pLCBNYXRoLm1pbihkb2MuZmlyc3QgKyBkb2Muc2l6ZSwgdG8pLCBmdW5jdGlvbihsaW5lKSB7XG4gICAgICBpZiAobGluZS5tYXJrZWRTcGFucylcbiAgICAgICAgKGV4aXN0aW5nIHx8IChleGlzdGluZyA9IGNoYW5nZVtcInNwYW5zX1wiICsgZG9jLmlkXSA9IHt9KSlbbl0gPSBsaW5lLm1hcmtlZFNwYW5zO1xuICAgICAgKytuO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gV2hlbiB1bi9yZS1kb2luZyByZXN0b3JlcyB0ZXh0IGNvbnRhaW5pbmcgbWFya2VkIHNwYW5zLCB0aG9zZVxuICAvLyB0aGF0IGhhdmUgYmVlbiBleHBsaWNpdGx5IGNsZWFyZWQgc2hvdWxkIG5vdCBiZSByZXN0b3JlZC5cbiAgZnVuY3Rpb24gcmVtb3ZlQ2xlYXJlZFNwYW5zKHNwYW5zKSB7XG4gICAgaWYgKCFzcGFucykgcmV0dXJuIG51bGw7XG4gICAgZm9yICh2YXIgaSA9IDAsIG91dDsgaSA8IHNwYW5zLmxlbmd0aDsgKytpKSB7XG4gICAgICBpZiAoc3BhbnNbaV0ubWFya2VyLmV4cGxpY2l0bHlDbGVhcmVkKSB7IGlmICghb3V0KSBvdXQgPSBzcGFucy5zbGljZSgwLCBpKTsgfVxuICAgICAgZWxzZSBpZiAob3V0KSBvdXQucHVzaChzcGFuc1tpXSk7XG4gICAgfVxuICAgIHJldHVybiAhb3V0ID8gc3BhbnMgOiBvdXQubGVuZ3RoID8gb3V0IDogbnVsbDtcbiAgfVxuXG4gIC8vIFJldHJpZXZlIGFuZCBmaWx0ZXIgdGhlIG9sZCBtYXJrZWQgc3BhbnMgc3RvcmVkIGluIGEgY2hhbmdlIGV2ZW50LlxuICBmdW5jdGlvbiBnZXRPbGRTcGFucyhkb2MsIGNoYW5nZSkge1xuICAgIHZhciBmb3VuZCA9IGNoYW5nZVtcInNwYW5zX1wiICsgZG9jLmlkXTtcbiAgICBpZiAoIWZvdW5kKSByZXR1cm4gbnVsbDtcbiAgICBmb3IgKHZhciBpID0gMCwgbncgPSBbXTsgaSA8IGNoYW5nZS50ZXh0Lmxlbmd0aDsgKytpKVxuICAgICAgbncucHVzaChyZW1vdmVDbGVhcmVkU3BhbnMoZm91bmRbaV0pKTtcbiAgICByZXR1cm4gbnc7XG4gIH1cblxuICAvLyBVc2VkIGJvdGggdG8gcHJvdmlkZSBhIEpTT04tc2FmZSBvYmplY3QgaW4gLmdldEhpc3RvcnksIGFuZCwgd2hlblxuICAvLyBkZXRhY2hpbmcgYSBkb2N1bWVudCwgdG8gc3BsaXQgdGhlIGhpc3RvcnkgaW4gdHdvXG4gIGZ1bmN0aW9uIGNvcHlIaXN0b3J5QXJyYXkoZXZlbnRzLCBuZXdHcm91cCwgaW5zdGFudGlhdGVTZWwpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgY29weSA9IFtdOyBpIDwgZXZlbnRzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgZXZlbnQgPSBldmVudHNbaV07XG4gICAgICBpZiAoZXZlbnQucmFuZ2VzKSB7XG4gICAgICAgIGNvcHkucHVzaChpbnN0YW50aWF0ZVNlbCA/IFNlbGVjdGlvbi5wcm90b3R5cGUuZGVlcENvcHkuY2FsbChldmVudCkgOiBldmVudCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgdmFyIGNoYW5nZXMgPSBldmVudC5jaGFuZ2VzLCBuZXdDaGFuZ2VzID0gW107XG4gICAgICBjb3B5LnB1c2goe2NoYW5nZXM6IG5ld0NoYW5nZXN9KTtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgY2hhbmdlcy5sZW5ndGg7ICsraikge1xuICAgICAgICB2YXIgY2hhbmdlID0gY2hhbmdlc1tqXSwgbTtcbiAgICAgICAgbmV3Q2hhbmdlcy5wdXNoKHtmcm9tOiBjaGFuZ2UuZnJvbSwgdG86IGNoYW5nZS50bywgdGV4dDogY2hhbmdlLnRleHR9KTtcbiAgICAgICAgaWYgKG5ld0dyb3VwKSBmb3IgKHZhciBwcm9wIGluIGNoYW5nZSkgaWYgKG0gPSBwcm9wLm1hdGNoKC9ec3BhbnNfKFxcZCspJC8pKSB7XG4gICAgICAgICAgaWYgKGluZGV4T2YobmV3R3JvdXAsIE51bWJlcihtWzFdKSkgPiAtMSkge1xuICAgICAgICAgICAgbHN0KG5ld0NoYW5nZXMpW3Byb3BdID0gY2hhbmdlW3Byb3BdO1xuICAgICAgICAgICAgZGVsZXRlIGNoYW5nZVtwcm9wXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvcHk7XG4gIH1cblxuICAvLyBSZWJhc2luZy9yZXNldHRpbmcgaGlzdG9yeSB0byBkZWFsIHdpdGggZXh0ZXJuYWxseS1zb3VyY2VkIGNoYW5nZXNcblxuICBmdW5jdGlvbiByZWJhc2VIaXN0U2VsU2luZ2xlKHBvcywgZnJvbSwgdG8sIGRpZmYpIHtcbiAgICBpZiAodG8gPCBwb3MubGluZSkge1xuICAgICAgcG9zLmxpbmUgKz0gZGlmZjtcbiAgICB9IGVsc2UgaWYgKGZyb20gPCBwb3MubGluZSkge1xuICAgICAgcG9zLmxpbmUgPSBmcm9tO1xuICAgICAgcG9zLmNoID0gMDtcbiAgICB9XG4gIH1cblxuICAvLyBUcmllcyB0byByZWJhc2UgYW4gYXJyYXkgb2YgaGlzdG9yeSBldmVudHMgZ2l2ZW4gYSBjaGFuZ2UgaW4gdGhlXG4gIC8vIGRvY3VtZW50LiBJZiB0aGUgY2hhbmdlIHRvdWNoZXMgdGhlIHNhbWUgbGluZXMgYXMgdGhlIGV2ZW50LCB0aGVcbiAgLy8gZXZlbnQsIGFuZCBldmVyeXRoaW5nICdiZWhpbmQnIGl0LCBpcyBkaXNjYXJkZWQuIElmIHRoZSBjaGFuZ2UgaXNcbiAgLy8gYmVmb3JlIHRoZSBldmVudCwgdGhlIGV2ZW50J3MgcG9zaXRpb25zIGFyZSB1cGRhdGVkLiBVc2VzIGFcbiAgLy8gY29weS1vbi13cml0ZSBzY2hlbWUgZm9yIHRoZSBwb3NpdGlvbnMsIHRvIGF2b2lkIGhhdmluZyB0b1xuICAvLyByZWFsbG9jYXRlIHRoZW0gYWxsIG9uIGV2ZXJ5IHJlYmFzZSwgYnV0IGFsc28gYXZvaWQgcHJvYmxlbXMgd2l0aFxuICAvLyBzaGFyZWQgcG9zaXRpb24gb2JqZWN0cyBiZWluZyB1bnNhZmVseSB1cGRhdGVkLlxuICBmdW5jdGlvbiByZWJhc2VIaXN0QXJyYXkoYXJyYXksIGZyb20sIHRvLCBkaWZmKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHN1YiA9IGFycmF5W2ldLCBvayA9IHRydWU7XG4gICAgICBpZiAoc3ViLnJhbmdlcykge1xuICAgICAgICBpZiAoIXN1Yi5jb3BpZWQpIHsgc3ViID0gYXJyYXlbaV0gPSBzdWIuZGVlcENvcHkoKTsgc3ViLmNvcGllZCA9IHRydWU7IH1cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzdWIucmFuZ2VzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgcmViYXNlSGlzdFNlbFNpbmdsZShzdWIucmFuZ2VzW2pdLmFuY2hvciwgZnJvbSwgdG8sIGRpZmYpO1xuICAgICAgICAgIHJlYmFzZUhpc3RTZWxTaW5nbGUoc3ViLnJhbmdlc1tqXS5oZWFkLCBmcm9tLCB0bywgZGlmZik7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHN1Yi5jaGFuZ2VzLmxlbmd0aDsgKytqKSB7XG4gICAgICAgIHZhciBjdXIgPSBzdWIuY2hhbmdlc1tqXTtcbiAgICAgICAgaWYgKHRvIDwgY3VyLmZyb20ubGluZSkge1xuICAgICAgICAgIGN1ci5mcm9tID0gUG9zKGN1ci5mcm9tLmxpbmUgKyBkaWZmLCBjdXIuZnJvbS5jaCk7XG4gICAgICAgICAgY3VyLnRvID0gUG9zKGN1ci50by5saW5lICsgZGlmZiwgY3VyLnRvLmNoKTtcbiAgICAgICAgfSBlbHNlIGlmIChmcm9tIDw9IGN1ci50by5saW5lKSB7XG4gICAgICAgICAgb2sgPSBmYWxzZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFvaykge1xuICAgICAgICBhcnJheS5zcGxpY2UoMCwgaSArIDEpO1xuICAgICAgICBpID0gMDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZWJhc2VIaXN0KGhpc3QsIGNoYW5nZSkge1xuICAgIHZhciBmcm9tID0gY2hhbmdlLmZyb20ubGluZSwgdG8gPSBjaGFuZ2UudG8ubGluZSwgZGlmZiA9IGNoYW5nZS50ZXh0Lmxlbmd0aCAtICh0byAtIGZyb20pIC0gMTtcbiAgICByZWJhc2VIaXN0QXJyYXkoaGlzdC5kb25lLCBmcm9tLCB0bywgZGlmZik7XG4gICAgcmViYXNlSGlzdEFycmF5KGhpc3QudW5kb25lLCBmcm9tLCB0bywgZGlmZik7XG4gIH1cblxuICAvLyBFVkVOVCBVVElMSVRJRVNcblxuICAvLyBEdWUgdG8gdGhlIGZhY3QgdGhhdCB3ZSBzdGlsbCBzdXBwb3J0IGp1cmFzc2ljIElFIHZlcnNpb25zLCBzb21lXG4gIC8vIGNvbXBhdGliaWxpdHkgd3JhcHBlcnMgYXJlIG5lZWRlZC5cblxuICB2YXIgZV9wcmV2ZW50RGVmYXVsdCA9IENvZGVNaXJyb3IuZV9wcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAoZS5wcmV2ZW50RGVmYXVsdCkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGVsc2UgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICB9O1xuICB2YXIgZV9zdG9wUHJvcGFnYXRpb24gPSBDb2RlTWlycm9yLmVfc3RvcFByb3BhZ2F0aW9uID0gZnVuY3Rpb24oZSkge1xuICAgIGlmIChlLnN0b3BQcm9wYWdhdGlvbikgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBlbHNlIGUuY2FuY2VsQnViYmxlID0gdHJ1ZTtcbiAgfTtcbiAgZnVuY3Rpb24gZV9kZWZhdWx0UHJldmVudGVkKGUpIHtcbiAgICByZXR1cm4gZS5kZWZhdWx0UHJldmVudGVkICE9IG51bGwgPyBlLmRlZmF1bHRQcmV2ZW50ZWQgOiBlLnJldHVyblZhbHVlID09IGZhbHNlO1xuICB9XG4gIHZhciBlX3N0b3AgPSBDb2RlTWlycm9yLmVfc3RvcCA9IGZ1bmN0aW9uKGUpIHtlX3ByZXZlbnREZWZhdWx0KGUpOyBlX3N0b3BQcm9wYWdhdGlvbihlKTt9O1xuXG4gIGZ1bmN0aW9uIGVfdGFyZ2V0KGUpIHtyZXR1cm4gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O31cbiAgZnVuY3Rpb24gZV9idXR0b24oZSkge1xuICAgIHZhciBiID0gZS53aGljaDtcbiAgICBpZiAoYiA9PSBudWxsKSB7XG4gICAgICBpZiAoZS5idXR0b24gJiAxKSBiID0gMTtcbiAgICAgIGVsc2UgaWYgKGUuYnV0dG9uICYgMikgYiA9IDM7XG4gICAgICBlbHNlIGlmIChlLmJ1dHRvbiAmIDQpIGIgPSAyO1xuICAgIH1cbiAgICBpZiAobWFjICYmIGUuY3RybEtleSAmJiBiID09IDEpIGIgPSAzO1xuICAgIHJldHVybiBiO1xuICB9XG5cbiAgLy8gRVZFTlQgSEFORExJTkdcblxuICAvLyBMaWdodHdlaWdodCBldmVudCBmcmFtZXdvcmsuIG9uL29mZiBhbHNvIHdvcmsgb24gRE9NIG5vZGVzLFxuICAvLyByZWdpc3RlcmluZyBuYXRpdmUgRE9NIGhhbmRsZXJzLlxuXG4gIHZhciBvbiA9IENvZGVNaXJyb3Iub24gPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlLCBmKSB7XG4gICAgaWYgKGVtaXR0ZXIuYWRkRXZlbnRMaXN0ZW5lcilcbiAgICAgIGVtaXR0ZXIuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBmLCBmYWxzZSk7XG4gICAgZWxzZSBpZiAoZW1pdHRlci5hdHRhY2hFdmVudClcbiAgICAgIGVtaXR0ZXIuYXR0YWNoRXZlbnQoXCJvblwiICsgdHlwZSwgZik7XG4gICAgZWxzZSB7XG4gICAgICB2YXIgbWFwID0gZW1pdHRlci5faGFuZGxlcnMgfHwgKGVtaXR0ZXIuX2hhbmRsZXJzID0ge30pO1xuICAgICAgdmFyIGFyciA9IG1hcFt0eXBlXSB8fCAobWFwW3R5cGVdID0gW10pO1xuICAgICAgYXJyLnB1c2goZik7XG4gICAgfVxuICB9O1xuXG4gIHZhciBvZmYgPSBDb2RlTWlycm9yLm9mZiA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUsIGYpIHtcbiAgICBpZiAoZW1pdHRlci5yZW1vdmVFdmVudExpc3RlbmVyKVxuICAgICAgZW1pdHRlci5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGYsIGZhbHNlKTtcbiAgICBlbHNlIGlmIChlbWl0dGVyLmRldGFjaEV2ZW50KVxuICAgICAgZW1pdHRlci5kZXRhY2hFdmVudChcIm9uXCIgKyB0eXBlLCBmKTtcbiAgICBlbHNlIHtcbiAgICAgIHZhciBhcnIgPSBlbWl0dGVyLl9oYW5kbGVycyAmJiBlbWl0dGVyLl9oYW5kbGVyc1t0eXBlXTtcbiAgICAgIGlmICghYXJyKSByZXR1cm47XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7ICsraSlcbiAgICAgICAgaWYgKGFycltpXSA9PSBmKSB7IGFyci5zcGxpY2UoaSwgMSk7IGJyZWFrOyB9XG4gICAgfVxuICB9O1xuXG4gIHZhciBzaWduYWwgPSBDb2RlTWlycm9yLnNpZ25hbCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUgLyosIHZhbHVlcy4uLiovKSB7XG4gICAgdmFyIGFyciA9IGVtaXR0ZXIuX2hhbmRsZXJzICYmIGVtaXR0ZXIuX2hhbmRsZXJzW3R5cGVdO1xuICAgIGlmICghYXJyKSByZXR1cm47XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgKytpKSBhcnJbaV0uYXBwbHkobnVsbCwgYXJncyk7XG4gIH07XG5cbiAgLy8gT2Z0ZW4sIHdlIHdhbnQgdG8gc2lnbmFsIGV2ZW50cyBhdCBhIHBvaW50IHdoZXJlIHdlIGFyZSBpbiB0aGVcbiAgLy8gbWlkZGxlIG9mIHNvbWUgd29yaywgYnV0IGRvbid0IHdhbnQgdGhlIGhhbmRsZXIgdG8gc3RhcnQgY2FsbGluZ1xuICAvLyBvdGhlciBtZXRob2RzIG9uIHRoZSBlZGl0b3IsIHdoaWNoIG1pZ2h0IGJlIGluIGFuIGluY29uc2lzdGVudFxuICAvLyBzdGF0ZSBvciBzaW1wbHkgbm90IGV4cGVjdCBhbnkgb3RoZXIgZXZlbnRzIHRvIGhhcHBlbi5cbiAgLy8gc2lnbmFsTGF0ZXIgbG9va3Mgd2hldGhlciB0aGVyZSBhcmUgYW55IGhhbmRsZXJzLCBhbmQgc2NoZWR1bGVzXG4gIC8vIHRoZW0gdG8gYmUgZXhlY3V0ZWQgd2hlbiB0aGUgbGFzdCBvcGVyYXRpb24gZW5kcywgb3IsIGlmIG5vXG4gIC8vIG9wZXJhdGlvbiBpcyBhY3RpdmUsIHdoZW4gYSB0aW1lb3V0IGZpcmVzLlxuICB2YXIgZGVsYXllZENhbGxiYWNrcywgZGVsYXllZENhbGxiYWNrRGVwdGggPSAwO1xuICBmdW5jdGlvbiBzaWduYWxMYXRlcihlbWl0dGVyLCB0eXBlIC8qLCB2YWx1ZXMuLi4qLykge1xuICAgIHZhciBhcnIgPSBlbWl0dGVyLl9oYW5kbGVycyAmJiBlbWl0dGVyLl9oYW5kbGVyc1t0eXBlXTtcbiAgICBpZiAoIWFycikgcmV0dXJuO1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICBpZiAoIWRlbGF5ZWRDYWxsYmFja3MpIHtcbiAgICAgICsrZGVsYXllZENhbGxiYWNrRGVwdGg7XG4gICAgICBkZWxheWVkQ2FsbGJhY2tzID0gW107XG4gICAgICBzZXRUaW1lb3V0KGZpcmVEZWxheWVkLCAwKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gYm5kKGYpIHtyZXR1cm4gZnVuY3Rpb24oKXtmLmFwcGx5KG51bGwsIGFyZ3MpO307fTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7ICsraSlcbiAgICAgIGRlbGF5ZWRDYWxsYmFja3MucHVzaChibmQoYXJyW2ldKSk7XG4gIH1cblxuICBmdW5jdGlvbiBmaXJlRGVsYXllZCgpIHtcbiAgICAtLWRlbGF5ZWRDYWxsYmFja0RlcHRoO1xuICAgIHZhciBkZWxheWVkID0gZGVsYXllZENhbGxiYWNrcztcbiAgICBkZWxheWVkQ2FsbGJhY2tzID0gbnVsbDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRlbGF5ZWQubGVuZ3RoOyArK2kpIGRlbGF5ZWRbaV0oKTtcbiAgfVxuXG4gIC8vIFRoZSBET00gZXZlbnRzIHRoYXQgQ29kZU1pcnJvciBoYW5kbGVzIGNhbiBiZSBvdmVycmlkZGVuIGJ5XG4gIC8vIHJlZ2lzdGVyaW5nIGEgKG5vbi1ET00pIGhhbmRsZXIgb24gdGhlIGVkaXRvciBmb3IgdGhlIGV2ZW50IG5hbWUsXG4gIC8vIGFuZCBwcmV2ZW50RGVmYXVsdC1pbmcgdGhlIGV2ZW50IGluIHRoYXQgaGFuZGxlci5cbiAgZnVuY3Rpb24gc2lnbmFsRE9NRXZlbnQoY20sIGUsIG92ZXJyaWRlKSB7XG4gICAgc2lnbmFsKGNtLCBvdmVycmlkZSB8fCBlLnR5cGUsIGNtLCBlKTtcbiAgICByZXR1cm4gZV9kZWZhdWx0UHJldmVudGVkKGUpIHx8IGUuY29kZW1pcnJvcklnbm9yZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNpZ25hbEN1cnNvckFjdGl2aXR5KGNtKSB7XG4gICAgdmFyIGFyciA9IGNtLl9oYW5kbGVycyAmJiBjbS5faGFuZGxlcnMuY3Vyc29yQWN0aXZpdHk7XG4gICAgaWYgKCFhcnIpIHJldHVybjtcbiAgICB2YXIgc2V0ID0gY20uY3VyT3AuY3Vyc29yQWN0aXZpdHlIYW5kbGVycyB8fCAoY20uY3VyT3AuY3Vyc29yQWN0aXZpdHlIYW5kbGVycyA9IFtdKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7ICsraSkgaWYgKGluZGV4T2Yoc2V0LCBhcnJbaV0pID09IC0xKVxuICAgICAgc2V0LnB1c2goYXJyW2ldKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhc0hhbmRsZXIoZW1pdHRlciwgdHlwZSkge1xuICAgIHZhciBhcnIgPSBlbWl0dGVyLl9oYW5kbGVycyAmJiBlbWl0dGVyLl9oYW5kbGVyc1t0eXBlXTtcbiAgICByZXR1cm4gYXJyICYmIGFyci5sZW5ndGggPiAwO1xuICB9XG5cbiAgLy8gQWRkIG9uIGFuZCBvZmYgbWV0aG9kcyB0byBhIGNvbnN0cnVjdG9yJ3MgcHJvdG90eXBlLCB0byBtYWtlXG4gIC8vIHJlZ2lzdGVyaW5nIGV2ZW50cyBvbiBzdWNoIG9iamVjdHMgbW9yZSBjb252ZW5pZW50LlxuICBmdW5jdGlvbiBldmVudE1peGluKGN0b3IpIHtcbiAgICBjdG9yLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKHR5cGUsIGYpIHtvbih0aGlzLCB0eXBlLCBmKTt9O1xuICAgIGN0b3IucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uKHR5cGUsIGYpIHtvZmYodGhpcywgdHlwZSwgZik7fTtcbiAgfVxuXG4gIC8vIE1JU0MgVVRJTElUSUVTXG5cbiAgLy8gTnVtYmVyIG9mIHBpeGVscyBhZGRlZCB0byBzY3JvbGxlciBhbmQgc2l6ZXIgdG8gaGlkZSBzY3JvbGxiYXJcbiAgdmFyIHNjcm9sbGVyQ3V0T2ZmID0gMzA7XG5cbiAgLy8gUmV0dXJuZWQgb3IgdGhyb3duIGJ5IHZhcmlvdXMgcHJvdG9jb2xzIHRvIHNpZ25hbCAnSSdtIG5vdFxuICAvLyBoYW5kbGluZyB0aGlzJy5cbiAgdmFyIFBhc3MgPSBDb2RlTWlycm9yLlBhc3MgPSB7dG9TdHJpbmc6IGZ1bmN0aW9uKCl7cmV0dXJuIFwiQ29kZU1pcnJvci5QYXNzXCI7fX07XG5cbiAgLy8gUmV1c2VkIG9wdGlvbiBvYmplY3RzIGZvciBzZXRTZWxlY3Rpb24gJiBmcmllbmRzXG4gIHZhciBzZWxfZG9udFNjcm9sbCA9IHtzY3JvbGw6IGZhbHNlfSwgc2VsX21vdXNlID0ge29yaWdpbjogXCIqbW91c2VcIn0sIHNlbF9tb3ZlID0ge29yaWdpbjogXCIrbW92ZVwifTtcblxuICBmdW5jdGlvbiBEZWxheWVkKCkge3RoaXMuaWQgPSBudWxsO31cbiAgRGVsYXllZC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24obXMsIGYpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5pZCk7XG4gICAgdGhpcy5pZCA9IHNldFRpbWVvdXQoZiwgbXMpO1xuICB9O1xuXG4gIC8vIENvdW50cyB0aGUgY29sdW1uIG9mZnNldCBpbiBhIHN0cmluZywgdGFraW5nIHRhYnMgaW50byBhY2NvdW50LlxuICAvLyBVc2VkIG1vc3RseSB0byBmaW5kIGluZGVudGF0aW9uLlxuICB2YXIgY291bnRDb2x1bW4gPSBDb2RlTWlycm9yLmNvdW50Q29sdW1uID0gZnVuY3Rpb24oc3RyaW5nLCBlbmQsIHRhYlNpemUsIHN0YXJ0SW5kZXgsIHN0YXJ0VmFsdWUpIHtcbiAgICBpZiAoZW5kID09IG51bGwpIHtcbiAgICAgIGVuZCA9IHN0cmluZy5zZWFyY2goL1teXFxzXFx1MDBhMF0vKTtcbiAgICAgIGlmIChlbmQgPT0gLTEpIGVuZCA9IHN0cmluZy5sZW5ndGg7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSBzdGFydEluZGV4IHx8IDAsIG4gPSBzdGFydFZhbHVlIHx8IDA7Oykge1xuICAgICAgdmFyIG5leHRUYWIgPSBzdHJpbmcuaW5kZXhPZihcIlxcdFwiLCBpKTtcbiAgICAgIGlmIChuZXh0VGFiIDwgMCB8fCBuZXh0VGFiID49IGVuZClcbiAgICAgICAgcmV0dXJuIG4gKyAoZW5kIC0gaSk7XG4gICAgICBuICs9IG5leHRUYWIgLSBpO1xuICAgICAgbiArPSB0YWJTaXplIC0gKG4gJSB0YWJTaXplKTtcbiAgICAgIGkgPSBuZXh0VGFiICsgMTtcbiAgICB9XG4gIH07XG5cbiAgLy8gVGhlIGludmVyc2Ugb2YgY291bnRDb2x1bW4gLS0gZmluZCB0aGUgb2Zmc2V0IHRoYXQgY29ycmVzcG9uZHMgdG9cbiAgLy8gYSBwYXJ0aWN1bGFyIGNvbHVtbi5cbiAgZnVuY3Rpb24gZmluZENvbHVtbihzdHJpbmcsIGdvYWwsIHRhYlNpemUpIHtcbiAgICBmb3IgKHZhciBwb3MgPSAwLCBjb2wgPSAwOzspIHtcbiAgICAgIHZhciBuZXh0VGFiID0gc3RyaW5nLmluZGV4T2YoXCJcXHRcIiwgcG9zKTtcbiAgICAgIGlmIChuZXh0VGFiID09IC0xKSBuZXh0VGFiID0gc3RyaW5nLmxlbmd0aDtcbiAgICAgIHZhciBza2lwcGVkID0gbmV4dFRhYiAtIHBvcztcbiAgICAgIGlmIChuZXh0VGFiID09IHN0cmluZy5sZW5ndGggfHwgY29sICsgc2tpcHBlZCA+PSBnb2FsKVxuICAgICAgICByZXR1cm4gcG9zICsgTWF0aC5taW4oc2tpcHBlZCwgZ29hbCAtIGNvbCk7XG4gICAgICBjb2wgKz0gbmV4dFRhYiAtIHBvcztcbiAgICAgIGNvbCArPSB0YWJTaXplIC0gKGNvbCAlIHRhYlNpemUpO1xuICAgICAgcG9zID0gbmV4dFRhYiArIDE7XG4gICAgICBpZiAoY29sID49IGdvYWwpIHJldHVybiBwb3M7XG4gICAgfVxuICB9XG5cbiAgdmFyIHNwYWNlU3RycyA9IFtcIlwiXTtcbiAgZnVuY3Rpb24gc3BhY2VTdHIobikge1xuICAgIHdoaWxlIChzcGFjZVN0cnMubGVuZ3RoIDw9IG4pXG4gICAgICBzcGFjZVN0cnMucHVzaChsc3Qoc3BhY2VTdHJzKSArIFwiIFwiKTtcbiAgICByZXR1cm4gc3BhY2VTdHJzW25dO1xuICB9XG5cbiAgZnVuY3Rpb24gbHN0KGFycikgeyByZXR1cm4gYXJyW2Fyci5sZW5ndGgtMV07IH1cblxuICB2YXIgc2VsZWN0SW5wdXQgPSBmdW5jdGlvbihub2RlKSB7IG5vZGUuc2VsZWN0KCk7IH07XG4gIGlmIChpb3MpIC8vIE1vYmlsZSBTYWZhcmkgYXBwYXJlbnRseSBoYXMgYSBidWcgd2hlcmUgc2VsZWN0KCkgaXMgYnJva2VuLlxuICAgIHNlbGVjdElucHV0ID0gZnVuY3Rpb24obm9kZSkgeyBub2RlLnNlbGVjdGlvblN0YXJ0ID0gMDsgbm9kZS5zZWxlY3Rpb25FbmQgPSBub2RlLnZhbHVlLmxlbmd0aDsgfTtcbiAgZWxzZSBpZiAoaWUpIC8vIFN1cHByZXNzIG15c3RlcmlvdXMgSUUxMCBlcnJvcnNcbiAgICBzZWxlY3RJbnB1dCA9IGZ1bmN0aW9uKG5vZGUpIHsgdHJ5IHsgbm9kZS5zZWxlY3QoKTsgfSBjYXRjaChfZSkge30gfTtcblxuICBmdW5jdGlvbiBpbmRleE9mKGFycmF5LCBlbHQpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgKytpKVxuICAgICAgaWYgKGFycmF5W2ldID09IGVsdCkgcmV0dXJuIGk7XG4gICAgcmV0dXJuIC0xO1xuICB9XG4gIGlmIChbXS5pbmRleE9mKSBpbmRleE9mID0gZnVuY3Rpb24oYXJyYXksIGVsdCkgeyByZXR1cm4gYXJyYXkuaW5kZXhPZihlbHQpOyB9O1xuICBmdW5jdGlvbiBtYXAoYXJyYXksIGYpIHtcbiAgICB2YXIgb3V0ID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykgb3V0W2ldID0gZihhcnJheVtpXSwgaSk7XG4gICAgcmV0dXJuIG91dDtcbiAgfVxuICBpZiAoW10ubWFwKSBtYXAgPSBmdW5jdGlvbihhcnJheSwgZikgeyByZXR1cm4gYXJyYXkubWFwKGYpOyB9O1xuXG4gIGZ1bmN0aW9uIGNyZWF0ZU9iaihiYXNlLCBwcm9wcykge1xuICAgIHZhciBpbnN0O1xuICAgIGlmIChPYmplY3QuY3JlYXRlKSB7XG4gICAgICBpbnN0ID0gT2JqZWN0LmNyZWF0ZShiYXNlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGN0b3IgPSBmdW5jdGlvbigpIHt9O1xuICAgICAgY3Rvci5wcm90b3R5cGUgPSBiYXNlO1xuICAgICAgaW5zdCA9IG5ldyBjdG9yKCk7XG4gICAgfVxuICAgIGlmIChwcm9wcykgY29weU9iaihwcm9wcywgaW5zdCk7XG4gICAgcmV0dXJuIGluc3Q7XG4gIH07XG5cbiAgZnVuY3Rpb24gY29weU9iaihvYmosIHRhcmdldCwgb3ZlcndyaXRlKSB7XG4gICAgaWYgKCF0YXJnZXQpIHRhcmdldCA9IHt9O1xuICAgIGZvciAodmFyIHByb3AgaW4gb2JqKVxuICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKSAmJiAob3ZlcndyaXRlICE9PSBmYWxzZSB8fCAhdGFyZ2V0Lmhhc093blByb3BlcnR5KHByb3ApKSlcbiAgICAgICAgdGFyZ2V0W3Byb3BdID0gb2JqW3Byb3BdO1xuICAgIHJldHVybiB0YXJnZXQ7XG4gIH1cblxuICBmdW5jdGlvbiBiaW5kKGYpIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIGYuYXBwbHkobnVsbCwgYXJncyk7fTtcbiAgfVxuXG4gIHZhciBub25BU0NJSVNpbmdsZUNhc2VXb3JkQ2hhciA9IC9bXFx1MDBkZlxcdTMwNDAtXFx1MzA5ZlxcdTMwYTAtXFx1MzBmZlxcdTM0MDAtXFx1NGRiNVxcdTRlMDAtXFx1OWZjY1xcdWFjMDAtXFx1ZDdhZl0vO1xuICB2YXIgaXNXb3JkQ2hhckJhc2ljID0gQ29kZU1pcnJvci5pc1dvcmRDaGFyID0gZnVuY3Rpb24oY2gpIHtcbiAgICByZXR1cm4gL1xcdy8udGVzdChjaCkgfHwgY2ggPiBcIlxceDgwXCIgJiZcbiAgICAgIChjaC50b1VwcGVyQ2FzZSgpICE9IGNoLnRvTG93ZXJDYXNlKCkgfHwgbm9uQVNDSUlTaW5nbGVDYXNlV29yZENoYXIudGVzdChjaCkpO1xuICB9O1xuICBmdW5jdGlvbiBpc1dvcmRDaGFyKGNoLCBoZWxwZXIpIHtcbiAgICBpZiAoIWhlbHBlcikgcmV0dXJuIGlzV29yZENoYXJCYXNpYyhjaCk7XG4gICAgaWYgKGhlbHBlci5zb3VyY2UuaW5kZXhPZihcIlxcXFx3XCIpID4gLTEgJiYgaXNXb3JkQ2hhckJhc2ljKGNoKSkgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIGhlbHBlci50ZXN0KGNoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzRW1wdHkob2JqKSB7XG4gICAgZm9yICh2YXIgbiBpbiBvYmopIGlmIChvYmouaGFzT3duUHJvcGVydHkobikgJiYgb2JqW25dKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBFeHRlbmRpbmcgdW5pY29kZSBjaGFyYWN0ZXJzLiBBIHNlcmllcyBvZiBhIG5vbi1leHRlbmRpbmcgY2hhciArXG4gIC8vIGFueSBudW1iZXIgb2YgZXh0ZW5kaW5nIGNoYXJzIGlzIHRyZWF0ZWQgYXMgYSBzaW5nbGUgdW5pdCBhcyBmYXJcbiAgLy8gYXMgZWRpdGluZyBhbmQgbWVhc3VyaW5nIGlzIGNvbmNlcm5lZC4gVGhpcyBpcyBub3QgZnVsbHkgY29ycmVjdCxcbiAgLy8gc2luY2Ugc29tZSBzY3JpcHRzL2ZvbnRzL2Jyb3dzZXJzIGFsc28gdHJlYXQgb3RoZXIgY29uZmlndXJhdGlvbnNcbiAgLy8gb2YgY29kZSBwb2ludHMgYXMgYSBncm91cC5cbiAgdmFyIGV4dGVuZGluZ0NoYXJzID0gL1tcXHUwMzAwLVxcdTAzNmZcXHUwNDgzLVxcdTA0ODlcXHUwNTkxLVxcdTA1YmRcXHUwNWJmXFx1MDVjMVxcdTA1YzJcXHUwNWM0XFx1MDVjNVxcdTA1YzdcXHUwNjEwLVxcdTA2MWFcXHUwNjRiLVxcdTA2NWVcXHUwNjcwXFx1MDZkNi1cXHUwNmRjXFx1MDZkZS1cXHUwNmU0XFx1MDZlN1xcdTA2ZThcXHUwNmVhLVxcdTA2ZWRcXHUwNzExXFx1MDczMC1cXHUwNzRhXFx1MDdhNi1cXHUwN2IwXFx1MDdlYi1cXHUwN2YzXFx1MDgxNi1cXHUwODE5XFx1MDgxYi1cXHUwODIzXFx1MDgyNS1cXHUwODI3XFx1MDgyOS1cXHUwODJkXFx1MDkwMC1cXHUwOTAyXFx1MDkzY1xcdTA5NDEtXFx1MDk0OFxcdTA5NGRcXHUwOTUxLVxcdTA5NTVcXHUwOTYyXFx1MDk2M1xcdTA5ODFcXHUwOWJjXFx1MDliZVxcdTA5YzEtXFx1MDljNFxcdTA5Y2RcXHUwOWQ3XFx1MDllMlxcdTA5ZTNcXHUwYTAxXFx1MGEwMlxcdTBhM2NcXHUwYTQxXFx1MGE0MlxcdTBhNDdcXHUwYTQ4XFx1MGE0Yi1cXHUwYTRkXFx1MGE1MVxcdTBhNzBcXHUwYTcxXFx1MGE3NVxcdTBhODFcXHUwYTgyXFx1MGFiY1xcdTBhYzEtXFx1MGFjNVxcdTBhYzdcXHUwYWM4XFx1MGFjZFxcdTBhZTJcXHUwYWUzXFx1MGIwMVxcdTBiM2NcXHUwYjNlXFx1MGIzZlxcdTBiNDEtXFx1MGI0NFxcdTBiNGRcXHUwYjU2XFx1MGI1N1xcdTBiNjJcXHUwYjYzXFx1MGI4MlxcdTBiYmVcXHUwYmMwXFx1MGJjZFxcdTBiZDdcXHUwYzNlLVxcdTBjNDBcXHUwYzQ2LVxcdTBjNDhcXHUwYzRhLVxcdTBjNGRcXHUwYzU1XFx1MGM1NlxcdTBjNjJcXHUwYzYzXFx1MGNiY1xcdTBjYmZcXHUwY2MyXFx1MGNjNlxcdTBjY2NcXHUwY2NkXFx1MGNkNVxcdTBjZDZcXHUwY2UyXFx1MGNlM1xcdTBkM2VcXHUwZDQxLVxcdTBkNDRcXHUwZDRkXFx1MGQ1N1xcdTBkNjJcXHUwZDYzXFx1MGRjYVxcdTBkY2ZcXHUwZGQyLVxcdTBkZDRcXHUwZGQ2XFx1MGRkZlxcdTBlMzFcXHUwZTM0LVxcdTBlM2FcXHUwZTQ3LVxcdTBlNGVcXHUwZWIxXFx1MGViNC1cXHUwZWI5XFx1MGViYlxcdTBlYmNcXHUwZWM4LVxcdTBlY2RcXHUwZjE4XFx1MGYxOVxcdTBmMzVcXHUwZjM3XFx1MGYzOVxcdTBmNzEtXFx1MGY3ZVxcdTBmODAtXFx1MGY4NFxcdTBmODZcXHUwZjg3XFx1MGY5MC1cXHUwZjk3XFx1MGY5OS1cXHUwZmJjXFx1MGZjNlxcdTEwMmQtXFx1MTAzMFxcdTEwMzItXFx1MTAzN1xcdTEwMzlcXHUxMDNhXFx1MTAzZFxcdTEwM2VcXHUxMDU4XFx1MTA1OVxcdTEwNWUtXFx1MTA2MFxcdTEwNzEtXFx1MTA3NFxcdTEwODJcXHUxMDg1XFx1MTA4NlxcdTEwOGRcXHUxMDlkXFx1MTM1ZlxcdTE3MTItXFx1MTcxNFxcdTE3MzItXFx1MTczNFxcdTE3NTJcXHUxNzUzXFx1MTc3MlxcdTE3NzNcXHUxN2I3LVxcdTE3YmRcXHUxN2M2XFx1MTdjOS1cXHUxN2QzXFx1MTdkZFxcdTE4MGItXFx1MTgwZFxcdTE4YTlcXHUxOTIwLVxcdTE5MjJcXHUxOTI3XFx1MTkyOFxcdTE5MzJcXHUxOTM5LVxcdTE5M2JcXHUxYTE3XFx1MWExOFxcdTFhNTZcXHUxYTU4LVxcdTFhNWVcXHUxYTYwXFx1MWE2MlxcdTFhNjUtXFx1MWE2Y1xcdTFhNzMtXFx1MWE3Y1xcdTFhN2ZcXHUxYjAwLVxcdTFiMDNcXHUxYjM0XFx1MWIzNi1cXHUxYjNhXFx1MWIzY1xcdTFiNDJcXHUxYjZiLVxcdTFiNzNcXHUxYjgwXFx1MWI4MVxcdTFiYTItXFx1MWJhNVxcdTFiYThcXHUxYmE5XFx1MWMyYy1cXHUxYzMzXFx1MWMzNlxcdTFjMzdcXHUxY2QwLVxcdTFjZDJcXHUxY2Q0LVxcdTFjZTBcXHUxY2UyLVxcdTFjZThcXHUxY2VkXFx1MWRjMC1cXHUxZGU2XFx1MWRmZC1cXHUxZGZmXFx1MjAwY1xcdTIwMGRcXHUyMGQwLVxcdTIwZjBcXHUyY2VmLVxcdTJjZjFcXHUyZGUwLVxcdTJkZmZcXHUzMDJhLVxcdTMwMmZcXHUzMDk5XFx1MzA5YVxcdWE2NmYtXFx1YTY3MlxcdWE2N2NcXHVhNjdkXFx1YTZmMFxcdWE2ZjFcXHVhODAyXFx1YTgwNlxcdWE4MGJcXHVhODI1XFx1YTgyNlxcdWE4YzRcXHVhOGUwLVxcdWE4ZjFcXHVhOTI2LVxcdWE5MmRcXHVhOTQ3LVxcdWE5NTFcXHVhOTgwLVxcdWE5ODJcXHVhOWIzXFx1YTliNi1cXHVhOWI5XFx1YTliY1xcdWFhMjktXFx1YWEyZVxcdWFhMzFcXHVhYTMyXFx1YWEzNVxcdWFhMzZcXHVhYTQzXFx1YWE0Y1xcdWFhYjBcXHVhYWIyLVxcdWFhYjRcXHVhYWI3XFx1YWFiOFxcdWFhYmVcXHVhYWJmXFx1YWFjMVxcdWFiZTVcXHVhYmU4XFx1YWJlZFxcdWRjMDAtXFx1ZGZmZlxcdWZiMWVcXHVmZTAwLVxcdWZlMGZcXHVmZTIwLVxcdWZlMjZcXHVmZjllXFx1ZmY5Zl0vO1xuICBmdW5jdGlvbiBpc0V4dGVuZGluZ0NoYXIoY2gpIHsgcmV0dXJuIGNoLmNoYXJDb2RlQXQoMCkgPj0gNzY4ICYmIGV4dGVuZGluZ0NoYXJzLnRlc3QoY2gpOyB9XG5cbiAgLy8gRE9NIFVUSUxJVElFU1xuXG4gIGZ1bmN0aW9uIGVsdCh0YWcsIGNvbnRlbnQsIGNsYXNzTmFtZSwgc3R5bGUpIHtcbiAgICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKTtcbiAgICBpZiAoY2xhc3NOYW1lKSBlLmNsYXNzTmFtZSA9IGNsYXNzTmFtZTtcbiAgICBpZiAoc3R5bGUpIGUuc3R5bGUuY3NzVGV4dCA9IHN0eWxlO1xuICAgIGlmICh0eXBlb2YgY29udGVudCA9PSBcInN0cmluZ1wiKSBlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNvbnRlbnQpKTtcbiAgICBlbHNlIGlmIChjb250ZW50KSBmb3IgKHZhciBpID0gMDsgaSA8IGNvbnRlbnQubGVuZ3RoOyArK2kpIGUuYXBwZW5kQ2hpbGQoY29udGVudFtpXSk7XG4gICAgcmV0dXJuIGU7XG4gIH1cblxuICB2YXIgcmFuZ2U7XG4gIGlmIChkb2N1bWVudC5jcmVhdGVSYW5nZSkgcmFuZ2UgPSBmdW5jdGlvbihub2RlLCBzdGFydCwgZW5kKSB7XG4gICAgdmFyIHIgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICAgIHIuc2V0RW5kKG5vZGUsIGVuZCk7XG4gICAgci5zZXRTdGFydChub2RlLCBzdGFydCk7XG4gICAgcmV0dXJuIHI7XG4gIH07XG4gIGVsc2UgcmFuZ2UgPSBmdW5jdGlvbihub2RlLCBzdGFydCwgZW5kKSB7XG4gICAgdmFyIHIgPSBkb2N1bWVudC5ib2R5LmNyZWF0ZVRleHRSYW5nZSgpO1xuICAgIHIubW92ZVRvRWxlbWVudFRleHQobm9kZS5wYXJlbnROb2RlKTtcbiAgICByLmNvbGxhcHNlKHRydWUpO1xuICAgIHIubW92ZUVuZChcImNoYXJhY3RlclwiLCBlbmQpO1xuICAgIHIubW92ZVN0YXJ0KFwiY2hhcmFjdGVyXCIsIHN0YXJ0KTtcbiAgICByZXR1cm4gcjtcbiAgfTtcblxuICBmdW5jdGlvbiByZW1vdmVDaGlsZHJlbihlKSB7XG4gICAgZm9yICh2YXIgY291bnQgPSBlLmNoaWxkTm9kZXMubGVuZ3RoOyBjb3VudCA+IDA7IC0tY291bnQpXG4gICAgICBlLnJlbW92ZUNoaWxkKGUuZmlyc3RDaGlsZCk7XG4gICAgcmV0dXJuIGU7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVDaGlsZHJlbkFuZEFkZChwYXJlbnQsIGUpIHtcbiAgICByZXR1cm4gcmVtb3ZlQ2hpbGRyZW4ocGFyZW50KS5hcHBlbmRDaGlsZChlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbnRhaW5zKHBhcmVudCwgY2hpbGQpIHtcbiAgICBpZiAocGFyZW50LmNvbnRhaW5zKVxuICAgICAgcmV0dXJuIHBhcmVudC5jb250YWlucyhjaGlsZCk7XG4gICAgd2hpbGUgKGNoaWxkID0gY2hpbGQucGFyZW50Tm9kZSlcbiAgICAgIGlmIChjaGlsZCA9PSBwYXJlbnQpIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZnVuY3Rpb24gYWN0aXZlRWx0KCkgeyByZXR1cm4gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDsgfVxuICAvLyBPbGRlciB2ZXJzaW9ucyBvZiBJRSB0aHJvd3MgdW5zcGVjaWZpZWQgZXJyb3Igd2hlbiB0b3VjaGluZ1xuICAvLyBkb2N1bWVudC5hY3RpdmVFbGVtZW50IGluIHNvbWUgY2FzZXMgKGR1cmluZyBsb2FkaW5nLCBpbiBpZnJhbWUpXG4gIGlmIChpZV91cHRvMTApIGFjdGl2ZUVsdCA9IGZ1bmN0aW9uKCkge1xuICAgIHRyeSB7IHJldHVybiBkb2N1bWVudC5hY3RpdmVFbGVtZW50OyB9XG4gICAgY2F0Y2goZSkgeyByZXR1cm4gZG9jdW1lbnQuYm9keTsgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIGNsYXNzVGVzdChjbHMpIHsgcmV0dXJuIG5ldyBSZWdFeHAoXCJcXFxcYlwiICsgY2xzICsgXCJcXFxcYlxcXFxzKlwiKTsgfVxuICBmdW5jdGlvbiBybUNsYXNzKG5vZGUsIGNscykge1xuICAgIHZhciB0ZXN0ID0gY2xhc3NUZXN0KGNscyk7XG4gICAgaWYgKHRlc3QudGVzdChub2RlLmNsYXNzTmFtZSkpIG5vZGUuY2xhc3NOYW1lID0gbm9kZS5jbGFzc05hbWUucmVwbGFjZSh0ZXN0LCBcIlwiKTtcbiAgfVxuICBmdW5jdGlvbiBhZGRDbGFzcyhub2RlLCBjbHMpIHtcbiAgICBpZiAoIWNsYXNzVGVzdChjbHMpLnRlc3Qobm9kZS5jbGFzc05hbWUpKSBub2RlLmNsYXNzTmFtZSArPSBcIiBcIiArIGNscztcbiAgfVxuICBmdW5jdGlvbiBqb2luQ2xhc3NlcyhhLCBiKSB7XG4gICAgdmFyIGFzID0gYS5zcGxpdChcIiBcIik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcy5sZW5ndGg7IGkrKylcbiAgICAgIGlmIChhc1tpXSAmJiAhY2xhc3NUZXN0KGFzW2ldKS50ZXN0KGIpKSBiICs9IFwiIFwiICsgYXNbaV07XG4gICAgcmV0dXJuIGI7XG4gIH1cblxuICAvLyBXSU5ET1ctV0lERSBFVkVOVFNcblxuICAvLyBUaGVzZSBtdXN0IGJlIGhhbmRsZWQgY2FyZWZ1bGx5LCBiZWNhdXNlIG5haXZlbHkgcmVnaXN0ZXJpbmcgYVxuICAvLyBoYW5kbGVyIGZvciBlYWNoIGVkaXRvciB3aWxsIGNhdXNlIHRoZSBlZGl0b3JzIHRvIG5ldmVyIGJlXG4gIC8vIGdhcmJhZ2UgY29sbGVjdGVkLlxuXG4gIGZ1bmN0aW9uIGZvckVhY2hDb2RlTWlycm9yKGYpIHtcbiAgICBpZiAoIWRvY3VtZW50LmJvZHkuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSkgcmV0dXJuO1xuICAgIHZhciBieUNsYXNzID0gZG9jdW1lbnQuYm9keS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiQ29kZU1pcnJvclwiKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5Q2xhc3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBjbSA9IGJ5Q2xhc3NbaV0uQ29kZU1pcnJvcjtcbiAgICAgIGlmIChjbSkgZihjbSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGdsb2JhbHNSZWdpc3RlcmVkID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGVuc3VyZUdsb2JhbEhhbmRsZXJzKCkge1xuICAgIGlmIChnbG9iYWxzUmVnaXN0ZXJlZCkgcmV0dXJuO1xuICAgIHJlZ2lzdGVyR2xvYmFsSGFuZGxlcnMoKTtcbiAgICBnbG9iYWxzUmVnaXN0ZXJlZCA9IHRydWU7XG4gIH1cbiAgZnVuY3Rpb24gcmVnaXN0ZXJHbG9iYWxIYW5kbGVycygpIHtcbiAgICAvLyBXaGVuIHRoZSB3aW5kb3cgcmVzaXplcywgd2UgbmVlZCB0byByZWZyZXNoIGFjdGl2ZSBlZGl0b3JzLlxuICAgIHZhciByZXNpemVUaW1lcjtcbiAgICBvbih3aW5kb3csIFwicmVzaXplXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHJlc2l6ZVRpbWVyID09IG51bGwpIHJlc2l6ZVRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzaXplVGltZXIgPSBudWxsO1xuICAgICAgICBrbm93blNjcm9sbGJhcldpZHRoID0gbnVsbDtcbiAgICAgICAgZm9yRWFjaENvZGVNaXJyb3Iob25SZXNpemUpO1xuICAgICAgfSwgMTAwKTtcbiAgICB9KTtcbiAgICAvLyBXaGVuIHRoZSB3aW5kb3cgbG9zZXMgZm9jdXMsIHdlIHdhbnQgdG8gc2hvdyB0aGUgZWRpdG9yIGFzIGJsdXJyZWRcbiAgICBvbih3aW5kb3csIFwiYmx1clwiLCBmdW5jdGlvbigpIHtcbiAgICAgIGZvckVhY2hDb2RlTWlycm9yKG9uQmx1cik7XG4gICAgfSk7XG4gIH1cblxuICAvLyBGRUFUVVJFIERFVEVDVElPTlxuXG4gIC8vIERldGVjdCBkcmFnLWFuZC1kcm9wXG4gIHZhciBkcmFnQW5kRHJvcCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIFRoZXJlIGlzICpzb21lKiBraW5kIG9mIGRyYWctYW5kLWRyb3Agc3VwcG9ydCBpbiBJRTYtOCwgYnV0IElcbiAgICAvLyBjb3VsZG4ndCBnZXQgaXQgdG8gd29yayB5ZXQuXG4gICAgaWYgKGllX3VwdG84KSByZXR1cm4gZmFsc2U7XG4gICAgdmFyIGRpdiA9IGVsdCgnZGl2Jyk7XG4gICAgcmV0dXJuIFwiZHJhZ2dhYmxlXCIgaW4gZGl2IHx8IFwiZHJhZ0Ryb3BcIiBpbiBkaXY7XG4gIH0oKTtcblxuICB2YXIga25vd25TY3JvbGxiYXJXaWR0aDtcbiAgZnVuY3Rpb24gc2Nyb2xsYmFyV2lkdGgobWVhc3VyZSkge1xuICAgIGlmIChrbm93blNjcm9sbGJhcldpZHRoICE9IG51bGwpIHJldHVybiBrbm93blNjcm9sbGJhcldpZHRoO1xuICAgIHZhciB0ZXN0ID0gZWx0KFwiZGl2XCIsIG51bGwsIG51bGwsIFwid2lkdGg6IDUwcHg7IGhlaWdodDogNTBweDsgb3ZlcmZsb3cteDogc2Nyb2xsXCIpO1xuICAgIHJlbW92ZUNoaWxkcmVuQW5kQWRkKG1lYXN1cmUsIHRlc3QpO1xuICAgIGlmICh0ZXN0Lm9mZnNldFdpZHRoKVxuICAgICAga25vd25TY3JvbGxiYXJXaWR0aCA9IHRlc3Qub2Zmc2V0SGVpZ2h0IC0gdGVzdC5jbGllbnRIZWlnaHQ7XG4gICAgcmV0dXJuIGtub3duU2Nyb2xsYmFyV2lkdGggfHwgMDtcbiAgfVxuXG4gIHZhciB6d3NwU3VwcG9ydGVkO1xuICBmdW5jdGlvbiB6ZXJvV2lkdGhFbGVtZW50KG1lYXN1cmUpIHtcbiAgICBpZiAoendzcFN1cHBvcnRlZCA9PSBudWxsKSB7XG4gICAgICB2YXIgdGVzdCA9IGVsdChcInNwYW5cIiwgXCJcXHUyMDBiXCIpO1xuICAgICAgcmVtb3ZlQ2hpbGRyZW5BbmRBZGQobWVhc3VyZSwgZWx0KFwic3BhblwiLCBbdGVzdCwgZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJ4XCIpXSkpO1xuICAgICAgaWYgKG1lYXN1cmUuZmlyc3RDaGlsZC5vZmZzZXRIZWlnaHQgIT0gMClcbiAgICAgICAgendzcFN1cHBvcnRlZCA9IHRlc3Qub2Zmc2V0V2lkdGggPD0gMSAmJiB0ZXN0Lm9mZnNldEhlaWdodCA+IDIgJiYgIWllX3VwdG83O1xuICAgIH1cbiAgICBpZiAoendzcFN1cHBvcnRlZCkgcmV0dXJuIGVsdChcInNwYW5cIiwgXCJcXHUyMDBiXCIpO1xuICAgIGVsc2UgcmV0dXJuIGVsdChcInNwYW5cIiwgXCJcXHUwMGEwXCIsIG51bGwsIFwiZGlzcGxheTogaW5saW5lLWJsb2NrOyB3aWR0aDogMXB4OyBtYXJnaW4tcmlnaHQ6IC0xcHhcIik7XG4gIH1cblxuICAvLyBGZWF0dXJlLWRldGVjdCBJRSdzIGNydW1teSBjbGllbnQgcmVjdCByZXBvcnRpbmcgZm9yIGJpZGkgdGV4dFxuICB2YXIgYmFkQmlkaVJlY3RzO1xuICBmdW5jdGlvbiBoYXNCYWRCaWRpUmVjdHMobWVhc3VyZSkge1xuICAgIGlmIChiYWRCaWRpUmVjdHMgIT0gbnVsbCkgcmV0dXJuIGJhZEJpZGlSZWN0cztcbiAgICB2YXIgdHh0ID0gcmVtb3ZlQ2hpbGRyZW5BbmRBZGQobWVhc3VyZSwgZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJBXFx1MDYyZUFcIikpO1xuICAgIHZhciByMCA9IHJhbmdlKHR4dCwgMCwgMSkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgaWYgKHIwLmxlZnQgPT0gcjAucmlnaHQpIHJldHVybiBmYWxzZTtcbiAgICB2YXIgcjEgPSByYW5nZSh0eHQsIDEsIDIpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHJldHVybiBiYWRCaWRpUmVjdHMgPSAocjEucmlnaHQgLSByMC5yaWdodCA8IDMpO1xuICB9XG5cbiAgLy8gU2VlIGlmIFwiXCIuc3BsaXQgaXMgdGhlIGJyb2tlbiBJRSB2ZXJzaW9uLCBpZiBzbywgcHJvdmlkZSBhblxuICAvLyBhbHRlcm5hdGl2ZSB3YXkgdG8gc3BsaXQgbGluZXMuXG4gIHZhciBzcGxpdExpbmVzID0gQ29kZU1pcnJvci5zcGxpdExpbmVzID0gXCJcXG5cXG5iXCIuc3BsaXQoL1xcbi8pLmxlbmd0aCAhPSAzID8gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgdmFyIHBvcyA9IDAsIHJlc3VsdCA9IFtdLCBsID0gc3RyaW5nLmxlbmd0aDtcbiAgICB3aGlsZSAocG9zIDw9IGwpIHtcbiAgICAgIHZhciBubCA9IHN0cmluZy5pbmRleE9mKFwiXFxuXCIsIHBvcyk7XG4gICAgICBpZiAobmwgPT0gLTEpIG5sID0gc3RyaW5nLmxlbmd0aDtcbiAgICAgIHZhciBsaW5lID0gc3RyaW5nLnNsaWNlKHBvcywgc3RyaW5nLmNoYXJBdChubCAtIDEpID09IFwiXFxyXCIgPyBubCAtIDEgOiBubCk7XG4gICAgICB2YXIgcnQgPSBsaW5lLmluZGV4T2YoXCJcXHJcIik7XG4gICAgICBpZiAocnQgIT0gLTEpIHtcbiAgICAgICAgcmVzdWx0LnB1c2gobGluZS5zbGljZSgwLCBydCkpO1xuICAgICAgICBwb3MgKz0gcnQgKyAxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0LnB1c2gobGluZSk7XG4gICAgICAgIHBvcyA9IG5sICsgMTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSA6IGZ1bmN0aW9uKHN0cmluZyl7cmV0dXJuIHN0cmluZy5zcGxpdCgvXFxyXFxuP3xcXG4vKTt9O1xuXG4gIHZhciBoYXNTZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uID8gZnVuY3Rpb24odGUpIHtcbiAgICB0cnkgeyByZXR1cm4gdGUuc2VsZWN0aW9uU3RhcnQgIT0gdGUuc2VsZWN0aW9uRW5kOyB9XG4gICAgY2F0Y2goZSkgeyByZXR1cm4gZmFsc2U7IH1cbiAgfSA6IGZ1bmN0aW9uKHRlKSB7XG4gICAgdHJ5IHt2YXIgcmFuZ2UgPSB0ZS5vd25lckRvY3VtZW50LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSgpO31cbiAgICBjYXRjaChlKSB7fVxuICAgIGlmICghcmFuZ2UgfHwgcmFuZ2UucGFyZW50RWxlbWVudCgpICE9IHRlKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHJhbmdlLmNvbXBhcmVFbmRQb2ludHMoXCJTdGFydFRvRW5kXCIsIHJhbmdlKSAhPSAwO1xuICB9O1xuXG4gIHZhciBoYXNDb3B5RXZlbnQgPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGUgPSBlbHQoXCJkaXZcIik7XG4gICAgaWYgKFwib25jb3B5XCIgaW4gZSkgcmV0dXJuIHRydWU7XG4gICAgZS5zZXRBdHRyaWJ1dGUoXCJvbmNvcHlcIiwgXCJyZXR1cm47XCIpO1xuICAgIHJldHVybiB0eXBlb2YgZS5vbmNvcHkgPT0gXCJmdW5jdGlvblwiO1xuICB9KSgpO1xuXG4gIC8vIEtFWSBOQU1FU1xuXG4gIHZhciBrZXlOYW1lcyA9IHszOiBcIkVudGVyXCIsIDg6IFwiQmFja3NwYWNlXCIsIDk6IFwiVGFiXCIsIDEzOiBcIkVudGVyXCIsIDE2OiBcIlNoaWZ0XCIsIDE3OiBcIkN0cmxcIiwgMTg6IFwiQWx0XCIsXG4gICAgICAgICAgICAgICAgICAxOTogXCJQYXVzZVwiLCAyMDogXCJDYXBzTG9ja1wiLCAyNzogXCJFc2NcIiwgMzI6IFwiU3BhY2VcIiwgMzM6IFwiUGFnZVVwXCIsIDM0OiBcIlBhZ2VEb3duXCIsIDM1OiBcIkVuZFwiLFxuICAgICAgICAgICAgICAgICAgMzY6IFwiSG9tZVwiLCAzNzogXCJMZWZ0XCIsIDM4OiBcIlVwXCIsIDM5OiBcIlJpZ2h0XCIsIDQwOiBcIkRvd25cIiwgNDQ6IFwiUHJpbnRTY3JuXCIsIDQ1OiBcIkluc2VydFwiLFxuICAgICAgICAgICAgICAgICAgNDY6IFwiRGVsZXRlXCIsIDU5OiBcIjtcIiwgNjE6IFwiPVwiLCA5MTogXCJNb2RcIiwgOTI6IFwiTW9kXCIsIDkzOiBcIk1vZFwiLCAxMDc6IFwiPVwiLCAxMDk6IFwiLVwiLCAxMjc6IFwiRGVsZXRlXCIsXG4gICAgICAgICAgICAgICAgICAxNzM6IFwiLVwiLCAxODY6IFwiO1wiLCAxODc6IFwiPVwiLCAxODg6IFwiLFwiLCAxODk6IFwiLVwiLCAxOTA6IFwiLlwiLCAxOTE6IFwiL1wiLCAxOTI6IFwiYFwiLCAyMTk6IFwiW1wiLCAyMjA6IFwiXFxcXFwiLFxuICAgICAgICAgICAgICAgICAgMjIxOiBcIl1cIiwgMjIyOiBcIidcIiwgNjMyMzI6IFwiVXBcIiwgNjMyMzM6IFwiRG93blwiLCA2MzIzNDogXCJMZWZ0XCIsIDYzMjM1OiBcIlJpZ2h0XCIsIDYzMjcyOiBcIkRlbGV0ZVwiLFxuICAgICAgICAgICAgICAgICAgNjMyNzM6IFwiSG9tZVwiLCA2MzI3NTogXCJFbmRcIiwgNjMyNzY6IFwiUGFnZVVwXCIsIDYzMjc3OiBcIlBhZ2VEb3duXCIsIDYzMzAyOiBcIkluc2VydFwifTtcbiAgQ29kZU1pcnJvci5rZXlOYW1lcyA9IGtleU5hbWVzO1xuICAoZnVuY3Rpb24oKSB7XG4gICAgLy8gTnVtYmVyIGtleXNcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDEwOyBpKyspIGtleU5hbWVzW2kgKyA0OF0gPSBrZXlOYW1lc1tpICsgOTZdID0gU3RyaW5nKGkpO1xuICAgIC8vIEFscGhhYmV0aWMga2V5c1xuICAgIGZvciAodmFyIGkgPSA2NTsgaSA8PSA5MDsgaSsrKSBrZXlOYW1lc1tpXSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoaSk7XG4gICAgLy8gRnVuY3Rpb24ga2V5c1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IDEyOyBpKyspIGtleU5hbWVzW2kgKyAxMTFdID0ga2V5TmFtZXNbaSArIDYzMjM1XSA9IFwiRlwiICsgaTtcbiAgfSkoKTtcblxuICAvLyBCSURJIEhFTFBFUlNcblxuICBmdW5jdGlvbiBpdGVyYXRlQmlkaVNlY3Rpb25zKG9yZGVyLCBmcm9tLCB0bywgZikge1xuICAgIGlmICghb3JkZXIpIHJldHVybiBmKGZyb20sIHRvLCBcImx0clwiKTtcbiAgICB2YXIgZm91bmQgPSBmYWxzZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9yZGVyLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgcGFydCA9IG9yZGVyW2ldO1xuICAgICAgaWYgKHBhcnQuZnJvbSA8IHRvICYmIHBhcnQudG8gPiBmcm9tIHx8IGZyb20gPT0gdG8gJiYgcGFydC50byA9PSBmcm9tKSB7XG4gICAgICAgIGYoTWF0aC5tYXgocGFydC5mcm9tLCBmcm9tKSwgTWF0aC5taW4ocGFydC50bywgdG8pLCBwYXJ0LmxldmVsID09IDEgPyBcInJ0bFwiIDogXCJsdHJcIik7XG4gICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFmb3VuZCkgZihmcm9tLCB0bywgXCJsdHJcIik7XG4gIH1cblxuICBmdW5jdGlvbiBiaWRpTGVmdChwYXJ0KSB7IHJldHVybiBwYXJ0LmxldmVsICUgMiA/IHBhcnQudG8gOiBwYXJ0LmZyb207IH1cbiAgZnVuY3Rpb24gYmlkaVJpZ2h0KHBhcnQpIHsgcmV0dXJuIHBhcnQubGV2ZWwgJSAyID8gcGFydC5mcm9tIDogcGFydC50bzsgfVxuXG4gIGZ1bmN0aW9uIGxpbmVMZWZ0KGxpbmUpIHsgdmFyIG9yZGVyID0gZ2V0T3JkZXIobGluZSk7IHJldHVybiBvcmRlciA/IGJpZGlMZWZ0KG9yZGVyWzBdKSA6IDA7IH1cbiAgZnVuY3Rpb24gbGluZVJpZ2h0KGxpbmUpIHtcbiAgICB2YXIgb3JkZXIgPSBnZXRPcmRlcihsaW5lKTtcbiAgICBpZiAoIW9yZGVyKSByZXR1cm4gbGluZS50ZXh0Lmxlbmd0aDtcbiAgICByZXR1cm4gYmlkaVJpZ2h0KGxzdChvcmRlcikpO1xuICB9XG5cbiAgZnVuY3Rpb24gbGluZVN0YXJ0KGNtLCBsaW5lTikge1xuICAgIHZhciBsaW5lID0gZ2V0TGluZShjbS5kb2MsIGxpbmVOKTtcbiAgICB2YXIgdmlzdWFsID0gdmlzdWFsTGluZShsaW5lKTtcbiAgICBpZiAodmlzdWFsICE9IGxpbmUpIGxpbmVOID0gbGluZU5vKHZpc3VhbCk7XG4gICAgdmFyIG9yZGVyID0gZ2V0T3JkZXIodmlzdWFsKTtcbiAgICB2YXIgY2ggPSAhb3JkZXIgPyAwIDogb3JkZXJbMF0ubGV2ZWwgJSAyID8gbGluZVJpZ2h0KHZpc3VhbCkgOiBsaW5lTGVmdCh2aXN1YWwpO1xuICAgIHJldHVybiBQb3MobGluZU4sIGNoKTtcbiAgfVxuICBmdW5jdGlvbiBsaW5lRW5kKGNtLCBsaW5lTikge1xuICAgIHZhciBtZXJnZWQsIGxpbmUgPSBnZXRMaW5lKGNtLmRvYywgbGluZU4pO1xuICAgIHdoaWxlIChtZXJnZWQgPSBjb2xsYXBzZWRTcGFuQXRFbmQobGluZSkpIHtcbiAgICAgIGxpbmUgPSBtZXJnZWQuZmluZCgxLCB0cnVlKS5saW5lO1xuICAgICAgbGluZU4gPSBudWxsO1xuICAgIH1cbiAgICB2YXIgb3JkZXIgPSBnZXRPcmRlcihsaW5lKTtcbiAgICB2YXIgY2ggPSAhb3JkZXIgPyBsaW5lLnRleHQubGVuZ3RoIDogb3JkZXJbMF0ubGV2ZWwgJSAyID8gbGluZUxlZnQobGluZSkgOiBsaW5lUmlnaHQobGluZSk7XG4gICAgcmV0dXJuIFBvcyhsaW5lTiA9PSBudWxsID8gbGluZU5vKGxpbmUpIDogbGluZU4sIGNoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbXBhcmVCaWRpTGV2ZWwob3JkZXIsIGEsIGIpIHtcbiAgICB2YXIgbGluZWRpciA9IG9yZGVyWzBdLmxldmVsO1xuICAgIGlmIChhID09IGxpbmVkaXIpIHJldHVybiB0cnVlO1xuICAgIGlmIChiID09IGxpbmVkaXIpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gYSA8IGI7XG4gIH1cbiAgdmFyIGJpZGlPdGhlcjtcbiAgZnVuY3Rpb24gZ2V0QmlkaVBhcnRBdChvcmRlciwgcG9zKSB7XG4gICAgYmlkaU90aGVyID0gbnVsbDtcbiAgICBmb3IgKHZhciBpID0gMCwgZm91bmQ7IGkgPCBvcmRlci5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGN1ciA9IG9yZGVyW2ldO1xuICAgICAgaWYgKGN1ci5mcm9tIDwgcG9zICYmIGN1ci50byA+IHBvcykgcmV0dXJuIGk7XG4gICAgICBpZiAoKGN1ci5mcm9tID09IHBvcyB8fCBjdXIudG8gPT0gcG9zKSkge1xuICAgICAgICBpZiAoZm91bmQgPT0gbnVsbCkge1xuICAgICAgICAgIGZvdW5kID0gaTtcbiAgICAgICAgfSBlbHNlIGlmIChjb21wYXJlQmlkaUxldmVsKG9yZGVyLCBjdXIubGV2ZWwsIG9yZGVyW2ZvdW5kXS5sZXZlbCkpIHtcbiAgICAgICAgICBpZiAoY3VyLmZyb20gIT0gY3VyLnRvKSBiaWRpT3RoZXIgPSBmb3VuZDtcbiAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoY3VyLmZyb20gIT0gY3VyLnRvKSBiaWRpT3RoZXIgPSBpO1xuICAgICAgICAgIHJldHVybiBmb3VuZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZm91bmQ7XG4gIH1cblxuICBmdW5jdGlvbiBtb3ZlSW5MaW5lKGxpbmUsIHBvcywgZGlyLCBieVVuaXQpIHtcbiAgICBpZiAoIWJ5VW5pdCkgcmV0dXJuIHBvcyArIGRpcjtcbiAgICBkbyBwb3MgKz0gZGlyO1xuICAgIHdoaWxlIChwb3MgPiAwICYmIGlzRXh0ZW5kaW5nQ2hhcihsaW5lLnRleHQuY2hhckF0KHBvcykpKTtcbiAgICByZXR1cm4gcG9zO1xuICB9XG5cbiAgLy8gVGhpcyBpcyBuZWVkZWQgaW4gb3JkZXIgdG8gbW92ZSAndmlzdWFsbHknIHRocm91Z2ggYmktZGlyZWN0aW9uYWxcbiAgLy8gdGV4dCAtLSBpLmUuLCBwcmVzc2luZyBsZWZ0IHNob3VsZCBtYWtlIHRoZSBjdXJzb3IgZ28gbGVmdCwgZXZlblxuICAvLyB3aGVuIGluIFJUTCB0ZXh0LiBUaGUgdHJpY2t5IHBhcnQgaXMgdGhlICdqdW1wcycsIHdoZXJlIFJUTCBhbmRcbiAgLy8gTFRSIHRleHQgdG91Y2ggZWFjaCBvdGhlci4gVGhpcyBvZnRlbiByZXF1aXJlcyB0aGUgY3Vyc29yIG9mZnNldFxuICAvLyB0byBtb3ZlIG1vcmUgdGhhbiBvbmUgdW5pdCwgaW4gb3JkZXIgdG8gdmlzdWFsbHkgbW92ZSBvbmUgdW5pdC5cbiAgZnVuY3Rpb24gbW92ZVZpc3VhbGx5KGxpbmUsIHN0YXJ0LCBkaXIsIGJ5VW5pdCkge1xuICAgIHZhciBiaWRpID0gZ2V0T3JkZXIobGluZSk7XG4gICAgaWYgKCFiaWRpKSByZXR1cm4gbW92ZUxvZ2ljYWxseShsaW5lLCBzdGFydCwgZGlyLCBieVVuaXQpO1xuICAgIHZhciBwb3MgPSBnZXRCaWRpUGFydEF0KGJpZGksIHN0YXJ0KSwgcGFydCA9IGJpZGlbcG9zXTtcbiAgICB2YXIgdGFyZ2V0ID0gbW92ZUluTGluZShsaW5lLCBzdGFydCwgcGFydC5sZXZlbCAlIDIgPyAtZGlyIDogZGlyLCBieVVuaXQpO1xuXG4gICAgZm9yICg7Oykge1xuICAgICAgaWYgKHRhcmdldCA+IHBhcnQuZnJvbSAmJiB0YXJnZXQgPCBwYXJ0LnRvKSByZXR1cm4gdGFyZ2V0O1xuICAgICAgaWYgKHRhcmdldCA9PSBwYXJ0LmZyb20gfHwgdGFyZ2V0ID09IHBhcnQudG8pIHtcbiAgICAgICAgaWYgKGdldEJpZGlQYXJ0QXQoYmlkaSwgdGFyZ2V0KSA9PSBwb3MpIHJldHVybiB0YXJnZXQ7XG4gICAgICAgIHBhcnQgPSBiaWRpW3BvcyArPSBkaXJdO1xuICAgICAgICByZXR1cm4gKGRpciA+IDApID09IHBhcnQubGV2ZWwgJSAyID8gcGFydC50byA6IHBhcnQuZnJvbTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcnQgPSBiaWRpW3BvcyArPSBkaXJdO1xuICAgICAgICBpZiAoIXBhcnQpIHJldHVybiBudWxsO1xuICAgICAgICBpZiAoKGRpciA+IDApID09IHBhcnQubGV2ZWwgJSAyKVxuICAgICAgICAgIHRhcmdldCA9IG1vdmVJbkxpbmUobGluZSwgcGFydC50bywgLTEsIGJ5VW5pdCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICB0YXJnZXQgPSBtb3ZlSW5MaW5lKGxpbmUsIHBhcnQuZnJvbSwgMSwgYnlVbml0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBtb3ZlTG9naWNhbGx5KGxpbmUsIHN0YXJ0LCBkaXIsIGJ5VW5pdCkge1xuICAgIHZhciB0YXJnZXQgPSBzdGFydCArIGRpcjtcbiAgICBpZiAoYnlVbml0KSB3aGlsZSAodGFyZ2V0ID4gMCAmJiBpc0V4dGVuZGluZ0NoYXIobGluZS50ZXh0LmNoYXJBdCh0YXJnZXQpKSkgdGFyZ2V0ICs9IGRpcjtcbiAgICByZXR1cm4gdGFyZ2V0IDwgMCB8fCB0YXJnZXQgPiBsaW5lLnRleHQubGVuZ3RoID8gbnVsbCA6IHRhcmdldDtcbiAgfVxuXG4gIC8vIEJpZGlyZWN0aW9uYWwgb3JkZXJpbmcgYWxnb3JpdGhtXG4gIC8vIFNlZSBodHRwOi8vdW5pY29kZS5vcmcvcmVwb3J0cy90cjkvdHI5LTEzLmh0bWwgZm9yIHRoZSBhbGdvcml0aG1cbiAgLy8gdGhhdCB0aGlzIChwYXJ0aWFsbHkpIGltcGxlbWVudHMuXG5cbiAgLy8gT25lLWNoYXIgY29kZXMgdXNlZCBmb3IgY2hhcmFjdGVyIHR5cGVzOlxuICAvLyBMIChMKTogICBMZWZ0LXRvLVJpZ2h0XG4gIC8vIFIgKFIpOiAgIFJpZ2h0LXRvLUxlZnRcbiAgLy8gciAoQUwpOiAgUmlnaHQtdG8tTGVmdCBBcmFiaWNcbiAgLy8gMSAoRU4pOiAgRXVyb3BlYW4gTnVtYmVyXG4gIC8vICsgKEVTKTogIEV1cm9wZWFuIE51bWJlciBTZXBhcmF0b3JcbiAgLy8gJSAoRVQpOiAgRXVyb3BlYW4gTnVtYmVyIFRlcm1pbmF0b3JcbiAgLy8gbiAoQU4pOiAgQXJhYmljIE51bWJlclxuICAvLyAsIChDUyk6ICBDb21tb24gTnVtYmVyIFNlcGFyYXRvclxuICAvLyBtIChOU00pOiBOb24tU3BhY2luZyBNYXJrXG4gIC8vIGIgKEJOKTogIEJvdW5kYXJ5IE5ldXRyYWxcbiAgLy8gcyAoQik6ICAgUGFyYWdyYXBoIFNlcGFyYXRvclxuICAvLyB0IChTKTogICBTZWdtZW50IFNlcGFyYXRvclxuICAvLyB3IChXUyk6ICBXaGl0ZXNwYWNlXG4gIC8vIE4gKE9OKTogIE90aGVyIE5ldXRyYWxzXG5cbiAgLy8gUmV0dXJucyBudWxsIGlmIGNoYXJhY3RlcnMgYXJlIG9yZGVyZWQgYXMgdGhleSBhcHBlYXJcbiAgLy8gKGxlZnQtdG8tcmlnaHQpLCBvciBhbiBhcnJheSBvZiBzZWN0aW9ucyAoe2Zyb20sIHRvLCBsZXZlbH1cbiAgLy8gb2JqZWN0cykgaW4gdGhlIG9yZGVyIGluIHdoaWNoIHRoZXkgb2NjdXIgdmlzdWFsbHkuXG4gIHZhciBiaWRpT3JkZXJpbmcgPSAoZnVuY3Rpb24oKSB7XG4gICAgLy8gQ2hhcmFjdGVyIHR5cGVzIGZvciBjb2RlcG9pbnRzIDAgdG8gMHhmZlxuICAgIHZhciBsb3dUeXBlcyA9IFwiYmJiYmJiYmJidHN0d3NiYmJiYmJiYmJiYmJiYnNzc3R3Tk4lJSVOTk5OTk4sTixOMTExMTExMTExMU5OTk5OTk5MTExMTExMTExMTExMTExMTExMTExMTExMTE5OTk5OTkxMTExMTExMTExMTExMTExMTExMTExMTExMTk5OTmJiYmJiYnNiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYixOJSUlJU5OTk5MTk5OTk4lJTExTkxOTk4xTE5OTk5OTExMTExMTExMTExMTExMTExMTExMTExOTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTE5cIjtcbiAgICAvLyBDaGFyYWN0ZXIgdHlwZXMgZm9yIGNvZGVwb2ludHMgMHg2MDAgdG8gMHg2ZmZcbiAgICB2YXIgYXJhYmljVHlwZXMgPSBcInJycnJycnJycnJycixyTk5tbW1tbW1ycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycm1tbW1tbW1tbW1tbW1tcnJycnJycm5ubm5ubm5ubm4lbm5ycnJtcnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJtbW1tbW1tbW1tbW1tbW1tbW1tTm1tbW1cIjtcbiAgICBmdW5jdGlvbiBjaGFyVHlwZShjb2RlKSB7XG4gICAgICBpZiAoY29kZSA8PSAweGY3KSByZXR1cm4gbG93VHlwZXMuY2hhckF0KGNvZGUpO1xuICAgICAgZWxzZSBpZiAoMHg1OTAgPD0gY29kZSAmJiBjb2RlIDw9IDB4NWY0KSByZXR1cm4gXCJSXCI7XG4gICAgICBlbHNlIGlmICgweDYwMCA8PSBjb2RlICYmIGNvZGUgPD0gMHg2ZWQpIHJldHVybiBhcmFiaWNUeXBlcy5jaGFyQXQoY29kZSAtIDB4NjAwKTtcbiAgICAgIGVsc2UgaWYgKDB4NmVlIDw9IGNvZGUgJiYgY29kZSA8PSAweDhhYykgcmV0dXJuIFwiclwiO1xuICAgICAgZWxzZSBpZiAoMHgyMDAwIDw9IGNvZGUgJiYgY29kZSA8PSAweDIwMGIpIHJldHVybiBcIndcIjtcbiAgICAgIGVsc2UgaWYgKGNvZGUgPT0gMHgyMDBjKSByZXR1cm4gXCJiXCI7XG4gICAgICBlbHNlIHJldHVybiBcIkxcIjtcbiAgICB9XG5cbiAgICB2YXIgYmlkaVJFID0gL1tcXHUwNTkwLVxcdTA1ZjRcXHUwNjAwLVxcdTA2ZmZcXHUwNzAwLVxcdTA4YWNdLztcbiAgICB2YXIgaXNOZXV0cmFsID0gL1tzdHdOXS8sIGlzU3Ryb25nID0gL1tMUnJdLywgY291bnRzQXNMZWZ0ID0gL1tMYjFuXS8sIGNvdW50c0FzTnVtID0gL1sxbl0vO1xuICAgIC8vIEJyb3dzZXJzIHNlZW0gdG8gYWx3YXlzIHRyZWF0IHRoZSBib3VuZGFyaWVzIG9mIGJsb2NrIGVsZW1lbnRzIGFzIGJlaW5nIEwuXG4gICAgdmFyIG91dGVyVHlwZSA9IFwiTFwiO1xuXG4gICAgZnVuY3Rpb24gQmlkaVNwYW4obGV2ZWwsIGZyb20sIHRvKSB7XG4gICAgICB0aGlzLmxldmVsID0gbGV2ZWw7XG4gICAgICB0aGlzLmZyb20gPSBmcm9tOyB0aGlzLnRvID0gdG87XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cikge1xuICAgICAgaWYgKCFiaWRpUkUudGVzdChzdHIpKSByZXR1cm4gZmFsc2U7XG4gICAgICB2YXIgbGVuID0gc3RyLmxlbmd0aCwgdHlwZXMgPSBbXTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCB0eXBlOyBpIDwgbGVuOyArK2kpXG4gICAgICAgIHR5cGVzLnB1c2godHlwZSA9IGNoYXJUeXBlKHN0ci5jaGFyQ29kZUF0KGkpKSk7XG5cbiAgICAgIC8vIFcxLiBFeGFtaW5lIGVhY2ggbm9uLXNwYWNpbmcgbWFyayAoTlNNKSBpbiB0aGUgbGV2ZWwgcnVuLCBhbmRcbiAgICAgIC8vIGNoYW5nZSB0aGUgdHlwZSBvZiB0aGUgTlNNIHRvIHRoZSB0eXBlIG9mIHRoZSBwcmV2aW91c1xuICAgICAgLy8gY2hhcmFjdGVyLiBJZiB0aGUgTlNNIGlzIGF0IHRoZSBzdGFydCBvZiB0aGUgbGV2ZWwgcnVuLCBpdCB3aWxsXG4gICAgICAvLyBnZXQgdGhlIHR5cGUgb2Ygc29yLlxuICAgICAgZm9yICh2YXIgaSA9IDAsIHByZXYgPSBvdXRlclR5cGU7IGkgPCBsZW47ICsraSkge1xuICAgICAgICB2YXIgdHlwZSA9IHR5cGVzW2ldO1xuICAgICAgICBpZiAodHlwZSA9PSBcIm1cIikgdHlwZXNbaV0gPSBwcmV2O1xuICAgICAgICBlbHNlIHByZXYgPSB0eXBlO1xuICAgICAgfVxuXG4gICAgICAvLyBXMi4gU2VhcmNoIGJhY2t3YXJkcyBmcm9tIGVhY2ggaW5zdGFuY2Ugb2YgYSBFdXJvcGVhbiBudW1iZXJcbiAgICAgIC8vIHVudGlsIHRoZSBmaXJzdCBzdHJvbmcgdHlwZSAoUiwgTCwgQUwsIG9yIHNvcikgaXMgZm91bmQuIElmIGFuXG4gICAgICAvLyBBTCBpcyBmb3VuZCwgY2hhbmdlIHRoZSB0eXBlIG9mIHRoZSBFdXJvcGVhbiBudW1iZXIgdG8gQXJhYmljXG4gICAgICAvLyBudW1iZXIuXG4gICAgICAvLyBXMy4gQ2hhbmdlIGFsbCBBTHMgdG8gUi5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBjdXIgPSBvdXRlclR5cGU7IGkgPCBsZW47ICsraSkge1xuICAgICAgICB2YXIgdHlwZSA9IHR5cGVzW2ldO1xuICAgICAgICBpZiAodHlwZSA9PSBcIjFcIiAmJiBjdXIgPT0gXCJyXCIpIHR5cGVzW2ldID0gXCJuXCI7XG4gICAgICAgIGVsc2UgaWYgKGlzU3Ryb25nLnRlc3QodHlwZSkpIHsgY3VyID0gdHlwZTsgaWYgKHR5cGUgPT0gXCJyXCIpIHR5cGVzW2ldID0gXCJSXCI7IH1cbiAgICAgIH1cblxuICAgICAgLy8gVzQuIEEgc2luZ2xlIEV1cm9wZWFuIHNlcGFyYXRvciBiZXR3ZWVuIHR3byBFdXJvcGVhbiBudW1iZXJzXG4gICAgICAvLyBjaGFuZ2VzIHRvIGEgRXVyb3BlYW4gbnVtYmVyLiBBIHNpbmdsZSBjb21tb24gc2VwYXJhdG9yIGJldHdlZW5cbiAgICAgIC8vIHR3byBudW1iZXJzIG9mIHRoZSBzYW1lIHR5cGUgY2hhbmdlcyB0byB0aGF0IHR5cGUuXG4gICAgICBmb3IgKHZhciBpID0gMSwgcHJldiA9IHR5cGVzWzBdOyBpIDwgbGVuIC0gMTsgKytpKSB7XG4gICAgICAgIHZhciB0eXBlID0gdHlwZXNbaV07XG4gICAgICAgIGlmICh0eXBlID09IFwiK1wiICYmIHByZXYgPT0gXCIxXCIgJiYgdHlwZXNbaSsxXSA9PSBcIjFcIikgdHlwZXNbaV0gPSBcIjFcIjtcbiAgICAgICAgZWxzZSBpZiAodHlwZSA9PSBcIixcIiAmJiBwcmV2ID09IHR5cGVzW2krMV0gJiZcbiAgICAgICAgICAgICAgICAgKHByZXYgPT0gXCIxXCIgfHwgcHJldiA9PSBcIm5cIikpIHR5cGVzW2ldID0gcHJldjtcbiAgICAgICAgcHJldiA9IHR5cGU7XG4gICAgICB9XG5cbiAgICAgIC8vIFc1LiBBIHNlcXVlbmNlIG9mIEV1cm9wZWFuIHRlcm1pbmF0b3JzIGFkamFjZW50IHRvIEV1cm9wZWFuXG4gICAgICAvLyBudW1iZXJzIGNoYW5nZXMgdG8gYWxsIEV1cm9wZWFuIG51bWJlcnMuXG4gICAgICAvLyBXNi4gT3RoZXJ3aXNlLCBzZXBhcmF0b3JzIGFuZCB0ZXJtaW5hdG9ycyBjaGFuZ2UgdG8gT3RoZXJcbiAgICAgIC8vIE5ldXRyYWwuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICAgIHZhciB0eXBlID0gdHlwZXNbaV07XG4gICAgICAgIGlmICh0eXBlID09IFwiLFwiKSB0eXBlc1tpXSA9IFwiTlwiO1xuICAgICAgICBlbHNlIGlmICh0eXBlID09IFwiJVwiKSB7XG4gICAgICAgICAgZm9yICh2YXIgZW5kID0gaSArIDE7IGVuZCA8IGxlbiAmJiB0eXBlc1tlbmRdID09IFwiJVwiOyArK2VuZCkge31cbiAgICAgICAgICB2YXIgcmVwbGFjZSA9IChpICYmIHR5cGVzW2ktMV0gPT0gXCIhXCIpIHx8IChlbmQgPCBsZW4gJiYgdHlwZXNbZW5kXSA9PSBcIjFcIikgPyBcIjFcIiA6IFwiTlwiO1xuICAgICAgICAgIGZvciAodmFyIGogPSBpOyBqIDwgZW5kOyArK2opIHR5cGVzW2pdID0gcmVwbGFjZTtcbiAgICAgICAgICBpID0gZW5kIC0gMTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBXNy4gU2VhcmNoIGJhY2t3YXJkcyBmcm9tIGVhY2ggaW5zdGFuY2Ugb2YgYSBFdXJvcGVhbiBudW1iZXJcbiAgICAgIC8vIHVudGlsIHRoZSBmaXJzdCBzdHJvbmcgdHlwZSAoUiwgTCwgb3Igc29yKSBpcyBmb3VuZC4gSWYgYW4gTCBpc1xuICAgICAgLy8gZm91bmQsIHRoZW4gY2hhbmdlIHRoZSB0eXBlIG9mIHRoZSBFdXJvcGVhbiBudW1iZXIgdG8gTC5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBjdXIgPSBvdXRlclR5cGU7IGkgPCBsZW47ICsraSkge1xuICAgICAgICB2YXIgdHlwZSA9IHR5cGVzW2ldO1xuICAgICAgICBpZiAoY3VyID09IFwiTFwiICYmIHR5cGUgPT0gXCIxXCIpIHR5cGVzW2ldID0gXCJMXCI7XG4gICAgICAgIGVsc2UgaWYgKGlzU3Ryb25nLnRlc3QodHlwZSkpIGN1ciA9IHR5cGU7XG4gICAgICB9XG5cbiAgICAgIC8vIE4xLiBBIHNlcXVlbmNlIG9mIG5ldXRyYWxzIHRha2VzIHRoZSBkaXJlY3Rpb24gb2YgdGhlXG4gICAgICAvLyBzdXJyb3VuZGluZyBzdHJvbmcgdGV4dCBpZiB0aGUgdGV4dCBvbiBib3RoIHNpZGVzIGhhcyB0aGUgc2FtZVxuICAgICAgLy8gZGlyZWN0aW9uLiBFdXJvcGVhbiBhbmQgQXJhYmljIG51bWJlcnMgYWN0IGFzIGlmIHRoZXkgd2VyZSBSIGluXG4gICAgICAvLyB0ZXJtcyBvZiB0aGVpciBpbmZsdWVuY2Ugb24gbmV1dHJhbHMuIFN0YXJ0LW9mLWxldmVsLXJ1biAoc29yKVxuICAgICAgLy8gYW5kIGVuZC1vZi1sZXZlbC1ydW4gKGVvcikgYXJlIHVzZWQgYXQgbGV2ZWwgcnVuIGJvdW5kYXJpZXMuXG4gICAgICAvLyBOMi4gQW55IHJlbWFpbmluZyBuZXV0cmFscyB0YWtlIHRoZSBlbWJlZGRpbmcgZGlyZWN0aW9uLlxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgICAgICBpZiAoaXNOZXV0cmFsLnRlc3QodHlwZXNbaV0pKSB7XG4gICAgICAgICAgZm9yICh2YXIgZW5kID0gaSArIDE7IGVuZCA8IGxlbiAmJiBpc05ldXRyYWwudGVzdCh0eXBlc1tlbmRdKTsgKytlbmQpIHt9XG4gICAgICAgICAgdmFyIGJlZm9yZSA9IChpID8gdHlwZXNbaS0xXSA6IG91dGVyVHlwZSkgPT0gXCJMXCI7XG4gICAgICAgICAgdmFyIGFmdGVyID0gKGVuZCA8IGxlbiA/IHR5cGVzW2VuZF0gOiBvdXRlclR5cGUpID09IFwiTFwiO1xuICAgICAgICAgIHZhciByZXBsYWNlID0gYmVmb3JlIHx8IGFmdGVyID8gXCJMXCIgOiBcIlJcIjtcbiAgICAgICAgICBmb3IgKHZhciBqID0gaTsgaiA8IGVuZDsgKytqKSB0eXBlc1tqXSA9IHJlcGxhY2U7XG4gICAgICAgICAgaSA9IGVuZCAtIDE7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSGVyZSB3ZSBkZXBhcnQgZnJvbSB0aGUgZG9jdW1lbnRlZCBhbGdvcml0aG0sIGluIG9yZGVyIHRvIGF2b2lkXG4gICAgICAvLyBidWlsZGluZyB1cCBhbiBhY3R1YWwgbGV2ZWxzIGFycmF5LiBTaW5jZSB0aGVyZSBhcmUgb25seSB0aHJlZVxuICAgICAgLy8gbGV2ZWxzICgwLCAxLCAyKSBpbiBhbiBpbXBsZW1lbnRhdGlvbiB0aGF0IGRvZXNuJ3QgdGFrZVxuICAgICAgLy8gZXhwbGljaXQgZW1iZWRkaW5nIGludG8gYWNjb3VudCwgd2UgY2FuIGJ1aWxkIHVwIHRoZSBvcmRlciBvblxuICAgICAgLy8gdGhlIGZseSwgd2l0aG91dCBmb2xsb3dpbmcgdGhlIGxldmVsLWJhc2VkIGFsZ29yaXRobS5cbiAgICAgIHZhciBvcmRlciA9IFtdLCBtO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47KSB7XG4gICAgICAgIGlmIChjb3VudHNBc0xlZnQudGVzdCh0eXBlc1tpXSkpIHtcbiAgICAgICAgICB2YXIgc3RhcnQgPSBpO1xuICAgICAgICAgIGZvciAoKytpOyBpIDwgbGVuICYmIGNvdW50c0FzTGVmdC50ZXN0KHR5cGVzW2ldKTsgKytpKSB7fVxuICAgICAgICAgIG9yZGVyLnB1c2gobmV3IEJpZGlTcGFuKDAsIHN0YXJ0LCBpKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHBvcyA9IGksIGF0ID0gb3JkZXIubGVuZ3RoO1xuICAgICAgICAgIGZvciAoKytpOyBpIDwgbGVuICYmIHR5cGVzW2ldICE9IFwiTFwiOyArK2kpIHt9XG4gICAgICAgICAgZm9yICh2YXIgaiA9IHBvczsgaiA8IGk7KSB7XG4gICAgICAgICAgICBpZiAoY291bnRzQXNOdW0udGVzdCh0eXBlc1tqXSkpIHtcbiAgICAgICAgICAgICAgaWYgKHBvcyA8IGopIG9yZGVyLnNwbGljZShhdCwgMCwgbmV3IEJpZGlTcGFuKDEsIHBvcywgaikpO1xuICAgICAgICAgICAgICB2YXIgbnN0YXJ0ID0gajtcbiAgICAgICAgICAgICAgZm9yICgrK2o7IGogPCBpICYmIGNvdW50c0FzTnVtLnRlc3QodHlwZXNbal0pOyArK2opIHt9XG4gICAgICAgICAgICAgIG9yZGVyLnNwbGljZShhdCwgMCwgbmV3IEJpZGlTcGFuKDIsIG5zdGFydCwgaikpO1xuICAgICAgICAgICAgICBwb3MgPSBqO1xuICAgICAgICAgICAgfSBlbHNlICsrajtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHBvcyA8IGkpIG9yZGVyLnNwbGljZShhdCwgMCwgbmV3IEJpZGlTcGFuKDEsIHBvcywgaSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAob3JkZXJbMF0ubGV2ZWwgPT0gMSAmJiAobSA9IHN0ci5tYXRjaCgvXlxccysvKSkpIHtcbiAgICAgICAgb3JkZXJbMF0uZnJvbSA9IG1bMF0ubGVuZ3RoO1xuICAgICAgICBvcmRlci51bnNoaWZ0KG5ldyBCaWRpU3BhbigwLCAwLCBtWzBdLmxlbmd0aCkpO1xuICAgICAgfVxuICAgICAgaWYgKGxzdChvcmRlcikubGV2ZWwgPT0gMSAmJiAobSA9IHN0ci5tYXRjaCgvXFxzKyQvKSkpIHtcbiAgICAgICAgbHN0KG9yZGVyKS50byAtPSBtWzBdLmxlbmd0aDtcbiAgICAgICAgb3JkZXIucHVzaChuZXcgQmlkaVNwYW4oMCwgbGVuIC0gbVswXS5sZW5ndGgsIGxlbikpO1xuICAgICAgfVxuICAgICAgaWYgKG9yZGVyWzBdLmxldmVsICE9IGxzdChvcmRlcikubGV2ZWwpXG4gICAgICAgIG9yZGVyLnB1c2gobmV3IEJpZGlTcGFuKG9yZGVyWzBdLmxldmVsLCBsZW4sIGxlbikpO1xuXG4gICAgICByZXR1cm4gb3JkZXI7XG4gICAgfTtcbiAgfSkoKTtcblxuICAvLyBUSEUgRU5EXG5cbiAgQ29kZU1pcnJvci52ZXJzaW9uID0gXCI0LjIuMFwiO1xuXG4gIHJldHVybiBDb2RlTWlycm9yO1xufSk7XG4iLCIvLyBDb2RlTWlycm9yLCBjb3B5cmlnaHQgKGMpIGJ5IE1hcmlqbiBIYXZlcmJla2UgYW5kIG90aGVyc1xuLy8gRGlzdHJpYnV0ZWQgdW5kZXIgYW4gTUlUIGxpY2Vuc2U6IGh0dHA6Ly9jb2RlbWlycm9yLm5ldC9MSUNFTlNFXG5cbi8vIFRPRE8gYWN0dWFsbHkgcmVjb2duaXplIHN5bnRheCBvZiBUeXBlU2NyaXB0IGNvbnN0cnVjdHNcblxuKGZ1bmN0aW9uKG1vZCkge1xuICBpZiAodHlwZW9mIGV4cG9ydHMgPT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlID09IFwib2JqZWN0XCIpIC8vIENvbW1vbkpTXG4gICAgbW9kKHJlcXVpcmUoXCIuLi8uLi9saWIvY29kZW1pcnJvclwiKSk7XG4gIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIC8vIEFNRFxuICAgIGRlZmluZShbXCIuLi8uLi9saWIvY29kZW1pcnJvclwiXSwgbW9kKTtcbiAgZWxzZSAvLyBQbGFpbiBicm93c2VyIGVudlxuICAgIG1vZChDb2RlTWlycm9yKTtcbn0pKGZ1bmN0aW9uKENvZGVNaXJyb3IpIHtcblwidXNlIHN0cmljdFwiO1xuXG5Db2RlTWlycm9yLmRlZmluZU1vZGUoXCJqYXZhc2NyaXB0XCIsIGZ1bmN0aW9uKGNvbmZpZywgcGFyc2VyQ29uZmlnKSB7XG4gIHZhciBpbmRlbnRVbml0ID0gY29uZmlnLmluZGVudFVuaXQ7XG4gIHZhciBzdGF0ZW1lbnRJbmRlbnQgPSBwYXJzZXJDb25maWcuc3RhdGVtZW50SW5kZW50O1xuICB2YXIganNvbmxkTW9kZSA9IHBhcnNlckNvbmZpZy5qc29ubGQ7XG4gIHZhciBqc29uTW9kZSA9IHBhcnNlckNvbmZpZy5qc29uIHx8IGpzb25sZE1vZGU7XG4gIHZhciBpc1RTID0gcGFyc2VyQ29uZmlnLnR5cGVzY3JpcHQ7XG5cbiAgLy8gVG9rZW5pemVyXG5cbiAgdmFyIGtleXdvcmRzID0gZnVuY3Rpb24oKXtcbiAgICBmdW5jdGlvbiBrdyh0eXBlKSB7cmV0dXJuIHt0eXBlOiB0eXBlLCBzdHlsZTogXCJrZXl3b3JkXCJ9O31cbiAgICB2YXIgQSA9IGt3KFwia2V5d29yZCBhXCIpLCBCID0ga3coXCJrZXl3b3JkIGJcIiksIEMgPSBrdyhcImtleXdvcmQgY1wiKTtcbiAgICB2YXIgb3BlcmF0b3IgPSBrdyhcIm9wZXJhdG9yXCIpLCBhdG9tID0ge3R5cGU6IFwiYXRvbVwiLCBzdHlsZTogXCJhdG9tXCJ9O1xuXG4gICAgdmFyIGpzS2V5d29yZHMgPSB7XG4gICAgICBcImlmXCI6IGt3KFwiaWZcIiksIFwid2hpbGVcIjogQSwgXCJ3aXRoXCI6IEEsIFwiZWxzZVwiOiBCLCBcImRvXCI6IEIsIFwidHJ5XCI6IEIsIFwiZmluYWxseVwiOiBCLFxuICAgICAgXCJyZXR1cm5cIjogQywgXCJicmVha1wiOiBDLCBcImNvbnRpbnVlXCI6IEMsIFwibmV3XCI6IEMsIFwiZGVsZXRlXCI6IEMsIFwidGhyb3dcIjogQywgXCJkZWJ1Z2dlclwiOiBDLFxuICAgICAgXCJ2YXJcIjoga3coXCJ2YXJcIiksIFwiY29uc3RcIjoga3coXCJ2YXJcIiksIFwibGV0XCI6IGt3KFwidmFyXCIpLFxuICAgICAgXCJmdW5jdGlvblwiOiBrdyhcImZ1bmN0aW9uXCIpLCBcImNhdGNoXCI6IGt3KFwiY2F0Y2hcIiksXG4gICAgICBcImZvclwiOiBrdyhcImZvclwiKSwgXCJzd2l0Y2hcIjoga3coXCJzd2l0Y2hcIiksIFwiY2FzZVwiOiBrdyhcImNhc2VcIiksIFwiZGVmYXVsdFwiOiBrdyhcImRlZmF1bHRcIiksXG4gICAgICBcImluXCI6IG9wZXJhdG9yLCBcInR5cGVvZlwiOiBvcGVyYXRvciwgXCJpbnN0YW5jZW9mXCI6IG9wZXJhdG9yLFxuICAgICAgXCJ0cnVlXCI6IGF0b20sIFwiZmFsc2VcIjogYXRvbSwgXCJudWxsXCI6IGF0b20sIFwidW5kZWZpbmVkXCI6IGF0b20sIFwiTmFOXCI6IGF0b20sIFwiSW5maW5pdHlcIjogYXRvbSxcbiAgICAgIFwidGhpc1wiOiBrdyhcInRoaXNcIiksIFwibW9kdWxlXCI6IGt3KFwibW9kdWxlXCIpLCBcImNsYXNzXCI6IGt3KFwiY2xhc3NcIiksIFwic3VwZXJcIjoga3coXCJhdG9tXCIpLFxuICAgICAgXCJ5aWVsZFwiOiBDLCBcImV4cG9ydFwiOiBrdyhcImV4cG9ydFwiKSwgXCJpbXBvcnRcIjoga3coXCJpbXBvcnRcIiksIFwiZXh0ZW5kc1wiOiBDXG4gICAgfTtcblxuICAgIC8vIEV4dGVuZCB0aGUgJ25vcm1hbCcga2V5d29yZHMgd2l0aCB0aGUgVHlwZVNjcmlwdCBsYW5ndWFnZSBleHRlbnNpb25zXG4gICAgaWYgKGlzVFMpIHtcbiAgICAgIHZhciB0eXBlID0ge3R5cGU6IFwidmFyaWFibGVcIiwgc3R5bGU6IFwidmFyaWFibGUtM1wifTtcbiAgICAgIHZhciB0c0tleXdvcmRzID0ge1xuICAgICAgICAvLyBvYmplY3QtbGlrZSB0aGluZ3NcbiAgICAgICAgXCJpbnRlcmZhY2VcIjoga3coXCJpbnRlcmZhY2VcIiksXG4gICAgICAgIFwiZXh0ZW5kc1wiOiBrdyhcImV4dGVuZHNcIiksXG4gICAgICAgIFwiY29uc3RydWN0b3JcIjoga3coXCJjb25zdHJ1Y3RvclwiKSxcblxuICAgICAgICAvLyBzY29wZSBtb2RpZmllcnNcbiAgICAgICAgXCJwdWJsaWNcIjoga3coXCJwdWJsaWNcIiksXG4gICAgICAgIFwicHJpdmF0ZVwiOiBrdyhcInByaXZhdGVcIiksXG4gICAgICAgIFwicHJvdGVjdGVkXCI6IGt3KFwicHJvdGVjdGVkXCIpLFxuICAgICAgICBcInN0YXRpY1wiOiBrdyhcInN0YXRpY1wiKSxcblxuICAgICAgICAvLyB0eXBlc1xuICAgICAgICBcInN0cmluZ1wiOiB0eXBlLCBcIm51bWJlclwiOiB0eXBlLCBcImJvb2xcIjogdHlwZSwgXCJhbnlcIjogdHlwZVxuICAgICAgfTtcblxuICAgICAgZm9yICh2YXIgYXR0ciBpbiB0c0tleXdvcmRzKSB7XG4gICAgICAgIGpzS2V5d29yZHNbYXR0cl0gPSB0c0tleXdvcmRzW2F0dHJdO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBqc0tleXdvcmRzO1xuICB9KCk7XG5cbiAgdmFyIGlzT3BlcmF0b3JDaGFyID0gL1srXFwtKiYlPTw+IT98fl5dLztcbiAgdmFyIGlzSnNvbmxkS2V5d29yZCA9IC9eQChjb250ZXh0fGlkfHZhbHVlfGxhbmd1YWdlfHR5cGV8Y29udGFpbmVyfGxpc3R8c2V0fHJldmVyc2V8aW5kZXh8YmFzZXx2b2NhYnxncmFwaClcIi87XG5cbiAgZnVuY3Rpb24gcmVhZFJlZ2V4cChzdHJlYW0pIHtcbiAgICB2YXIgZXNjYXBlZCA9IGZhbHNlLCBuZXh0LCBpblNldCA9IGZhbHNlO1xuICAgIHdoaWxlICgobmV4dCA9IHN0cmVhbS5uZXh0KCkpICE9IG51bGwpIHtcbiAgICAgIGlmICghZXNjYXBlZCkge1xuICAgICAgICBpZiAobmV4dCA9PSBcIi9cIiAmJiAhaW5TZXQpIHJldHVybjtcbiAgICAgICAgaWYgKG5leHQgPT0gXCJbXCIpIGluU2V0ID0gdHJ1ZTtcbiAgICAgICAgZWxzZSBpZiAoaW5TZXQgJiYgbmV4dCA9PSBcIl1cIikgaW5TZXQgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGVzY2FwZWQgPSAhZXNjYXBlZCAmJiBuZXh0ID09IFwiXFxcXFwiO1xuICAgIH1cbiAgfVxuXG4gIC8vIFVzZWQgYXMgc2NyYXRjaCB2YXJpYWJsZXMgdG8gY29tbXVuaWNhdGUgbXVsdGlwbGUgdmFsdWVzIHdpdGhvdXRcbiAgLy8gY29uc2luZyB1cCB0b25zIG9mIG9iamVjdHMuXG4gIHZhciB0eXBlLCBjb250ZW50O1xuICBmdW5jdGlvbiByZXQodHAsIHN0eWxlLCBjb250KSB7XG4gICAgdHlwZSA9IHRwOyBjb250ZW50ID0gY29udDtcbiAgICByZXR1cm4gc3R5bGU7XG4gIH1cbiAgZnVuY3Rpb24gdG9rZW5CYXNlKHN0cmVhbSwgc3RhdGUpIHtcbiAgICB2YXIgY2ggPSBzdHJlYW0ubmV4dCgpO1xuICAgIGlmIChjaCA9PSAnXCInIHx8IGNoID09IFwiJ1wiKSB7XG4gICAgICBzdGF0ZS50b2tlbml6ZSA9IHRva2VuU3RyaW5nKGNoKTtcbiAgICAgIHJldHVybiBzdGF0ZS50b2tlbml6ZShzdHJlYW0sIHN0YXRlKTtcbiAgICB9IGVsc2UgaWYgKGNoID09IFwiLlwiICYmIHN0cmVhbS5tYXRjaCgvXlxcZCsoPzpbZUVdWytcXC1dP1xcZCspPy8pKSB7XG4gICAgICByZXR1cm4gcmV0KFwibnVtYmVyXCIsIFwibnVtYmVyXCIpO1xuICAgIH0gZWxzZSBpZiAoY2ggPT0gXCIuXCIgJiYgc3RyZWFtLm1hdGNoKFwiLi5cIikpIHtcbiAgICAgIHJldHVybiByZXQoXCJzcHJlYWRcIiwgXCJtZXRhXCIpO1xuICAgIH0gZWxzZSBpZiAoL1tcXFtcXF17fVxcKFxcKSw7XFw6XFwuXS8udGVzdChjaCkpIHtcbiAgICAgIHJldHVybiByZXQoY2gpO1xuICAgIH0gZWxzZSBpZiAoY2ggPT0gXCI9XCIgJiYgc3RyZWFtLmVhdChcIj5cIikpIHtcbiAgICAgIHJldHVybiByZXQoXCI9PlwiLCBcIm9wZXJhdG9yXCIpO1xuICAgIH0gZWxzZSBpZiAoY2ggPT0gXCIwXCIgJiYgc3RyZWFtLmVhdCgveC9pKSkge1xuICAgICAgc3RyZWFtLmVhdFdoaWxlKC9bXFxkYS1mXS9pKTtcbiAgICAgIHJldHVybiByZXQoXCJudW1iZXJcIiwgXCJudW1iZXJcIik7XG4gICAgfSBlbHNlIGlmICgvXFxkLy50ZXN0KGNoKSkge1xuICAgICAgc3RyZWFtLm1hdGNoKC9eXFxkKig/OlxcLlxcZCopPyg/OltlRV1bK1xcLV0/XFxkKyk/Lyk7XG4gICAgICByZXR1cm4gcmV0KFwibnVtYmVyXCIsIFwibnVtYmVyXCIpO1xuICAgIH0gZWxzZSBpZiAoY2ggPT0gXCIvXCIpIHtcbiAgICAgIGlmIChzdHJlYW0uZWF0KFwiKlwiKSkge1xuICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IHRva2VuQ29tbWVudDtcbiAgICAgICAgcmV0dXJuIHRva2VuQ29tbWVudChzdHJlYW0sIHN0YXRlKTtcbiAgICAgIH0gZWxzZSBpZiAoc3RyZWFtLmVhdChcIi9cIikpIHtcbiAgICAgICAgc3RyZWFtLnNraXBUb0VuZCgpO1xuICAgICAgICByZXR1cm4gcmV0KFwiY29tbWVudFwiLCBcImNvbW1lbnRcIik7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlLmxhc3RUeXBlID09IFwib3BlcmF0b3JcIiB8fCBzdGF0ZS5sYXN0VHlwZSA9PSBcImtleXdvcmQgY1wiIHx8XG4gICAgICAgICAgICAgICBzdGF0ZS5sYXN0VHlwZSA9PSBcInNvZlwiIHx8IC9eW1xcW3t9XFwoLDs6XSQvLnRlc3Qoc3RhdGUubGFzdFR5cGUpKSB7XG4gICAgICAgIHJlYWRSZWdleHAoc3RyZWFtKTtcbiAgICAgICAgc3RyZWFtLmVhdFdoaWxlKC9bZ2lteV0vKTsgLy8gJ3knIGlzIFwic3RpY2t5XCIgb3B0aW9uIGluIE1vemlsbGFcbiAgICAgICAgcmV0dXJuIHJldChcInJlZ2V4cFwiLCBcInN0cmluZy0yXCIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyZWFtLmVhdFdoaWxlKGlzT3BlcmF0b3JDaGFyKTtcbiAgICAgICAgcmV0dXJuIHJldChcIm9wZXJhdG9yXCIsIFwib3BlcmF0b3JcIiwgc3RyZWFtLmN1cnJlbnQoKSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjaCA9PSBcImBcIikge1xuICAgICAgc3RhdGUudG9rZW5pemUgPSB0b2tlblF1YXNpO1xuICAgICAgcmV0dXJuIHRva2VuUXVhc2koc3RyZWFtLCBzdGF0ZSk7XG4gICAgfSBlbHNlIGlmIChjaCA9PSBcIiNcIikge1xuICAgICAgc3RyZWFtLnNraXBUb0VuZCgpO1xuICAgICAgcmV0dXJuIHJldChcImVycm9yXCIsIFwiZXJyb3JcIik7XG4gICAgfSBlbHNlIGlmIChpc09wZXJhdG9yQ2hhci50ZXN0KGNoKSkge1xuICAgICAgc3RyZWFtLmVhdFdoaWxlKGlzT3BlcmF0b3JDaGFyKTtcbiAgICAgIHJldHVybiByZXQoXCJvcGVyYXRvclwiLCBcIm9wZXJhdG9yXCIsIHN0cmVhbS5jdXJyZW50KCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHJlYW0uZWF0V2hpbGUoL1tcXHdcXCRfXS8pO1xuICAgICAgdmFyIHdvcmQgPSBzdHJlYW0uY3VycmVudCgpLCBrbm93biA9IGtleXdvcmRzLnByb3BlcnR5SXNFbnVtZXJhYmxlKHdvcmQpICYmIGtleXdvcmRzW3dvcmRdO1xuICAgICAgcmV0dXJuIChrbm93biAmJiBzdGF0ZS5sYXN0VHlwZSAhPSBcIi5cIikgPyByZXQoa25vd24udHlwZSwga25vd24uc3R5bGUsIHdvcmQpIDpcbiAgICAgICAgICAgICAgICAgICAgIHJldChcInZhcmlhYmxlXCIsIFwidmFyaWFibGVcIiwgd29yZCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdG9rZW5TdHJpbmcocXVvdGUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3RyZWFtLCBzdGF0ZSkge1xuICAgICAgdmFyIGVzY2FwZWQgPSBmYWxzZSwgbmV4dDtcbiAgICAgIGlmIChqc29ubGRNb2RlICYmIHN0cmVhbS5wZWVrKCkgPT0gXCJAXCIgJiYgc3RyZWFtLm1hdGNoKGlzSnNvbmxkS2V5d29yZCkpe1xuICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IHRva2VuQmFzZTtcbiAgICAgICAgcmV0dXJuIHJldChcImpzb25sZC1rZXl3b3JkXCIsIFwibWV0YVwiKTtcbiAgICAgIH1cbiAgICAgIHdoaWxlICgobmV4dCA9IHN0cmVhbS5uZXh0KCkpICE9IG51bGwpIHtcbiAgICAgICAgaWYgKG5leHQgPT0gcXVvdGUgJiYgIWVzY2FwZWQpIGJyZWFrO1xuICAgICAgICBlc2NhcGVkID0gIWVzY2FwZWQgJiYgbmV4dCA9PSBcIlxcXFxcIjtcbiAgICAgIH1cbiAgICAgIGlmICghZXNjYXBlZCkgc3RhdGUudG9rZW5pemUgPSB0b2tlbkJhc2U7XG4gICAgICByZXR1cm4gcmV0KFwic3RyaW5nXCIsIFwic3RyaW5nXCIpO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiB0b2tlbkNvbW1lbnQoc3RyZWFtLCBzdGF0ZSkge1xuICAgIHZhciBtYXliZUVuZCA9IGZhbHNlLCBjaDtcbiAgICB3aGlsZSAoY2ggPSBzdHJlYW0ubmV4dCgpKSB7XG4gICAgICBpZiAoY2ggPT0gXCIvXCIgJiYgbWF5YmVFbmQpIHtcbiAgICAgICAgc3RhdGUudG9rZW5pemUgPSB0b2tlbkJhc2U7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgbWF5YmVFbmQgPSAoY2ggPT0gXCIqXCIpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0KFwiY29tbWVudFwiLCBcImNvbW1lbnRcIik7XG4gIH1cblxuICBmdW5jdGlvbiB0b2tlblF1YXNpKHN0cmVhbSwgc3RhdGUpIHtcbiAgICB2YXIgZXNjYXBlZCA9IGZhbHNlLCBuZXh0O1xuICAgIHdoaWxlICgobmV4dCA9IHN0cmVhbS5uZXh0KCkpICE9IG51bGwpIHtcbiAgICAgIGlmICghZXNjYXBlZCAmJiAobmV4dCA9PSBcImBcIiB8fCBuZXh0ID09IFwiJFwiICYmIHN0cmVhbS5lYXQoXCJ7XCIpKSkge1xuICAgICAgICBzdGF0ZS50b2tlbml6ZSA9IHRva2VuQmFzZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBlc2NhcGVkID0gIWVzY2FwZWQgJiYgbmV4dCA9PSBcIlxcXFxcIjtcbiAgICB9XG4gICAgcmV0dXJuIHJldChcInF1YXNpXCIsIFwic3RyaW5nLTJcIiwgc3RyZWFtLmN1cnJlbnQoKSk7XG4gIH1cblxuICB2YXIgYnJhY2tldHMgPSBcIihbe31dKVwiO1xuICAvLyBUaGlzIGlzIGEgY3J1ZGUgbG9va2FoZWFkIHRyaWNrIHRvIHRyeSBhbmQgbm90aWNlIHRoYXQgd2UncmVcbiAgLy8gcGFyc2luZyB0aGUgYXJndW1lbnQgcGF0dGVybnMgZm9yIGEgZmF0LWFycm93IGZ1bmN0aW9uIGJlZm9yZSB3ZVxuICAvLyBhY3R1YWxseSBoaXQgdGhlIGFycm93IHRva2VuLiBJdCBvbmx5IHdvcmtzIGlmIHRoZSBhcnJvdyBpcyBvblxuICAvLyB0aGUgc2FtZSBsaW5lIGFzIHRoZSBhcmd1bWVudHMgYW5kIHRoZXJlJ3Mgbm8gc3RyYW5nZSBub2lzZVxuICAvLyAoY29tbWVudHMpIGluIGJldHdlZW4uIEZhbGxiYWNrIGlzIHRvIG9ubHkgbm90aWNlIHdoZW4gd2UgaGl0IHRoZVxuICAvLyBhcnJvdywgYW5kIG5vdCBkZWNsYXJlIHRoZSBhcmd1bWVudHMgYXMgbG9jYWxzIGZvciB0aGUgYXJyb3dcbiAgLy8gYm9keS5cbiAgZnVuY3Rpb24gZmluZEZhdEFycm93KHN0cmVhbSwgc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUuZmF0QXJyb3dBdCkgc3RhdGUuZmF0QXJyb3dBdCA9IG51bGw7XG4gICAgdmFyIGFycm93ID0gc3RyZWFtLnN0cmluZy5pbmRleE9mKFwiPT5cIiwgc3RyZWFtLnN0YXJ0KTtcbiAgICBpZiAoYXJyb3cgPCAwKSByZXR1cm47XG5cbiAgICB2YXIgZGVwdGggPSAwLCBzYXdTb21ldGhpbmcgPSBmYWxzZTtcbiAgICBmb3IgKHZhciBwb3MgPSBhcnJvdyAtIDE7IHBvcyA+PSAwOyAtLXBvcykge1xuICAgICAgdmFyIGNoID0gc3RyZWFtLnN0cmluZy5jaGFyQXQocG9zKTtcbiAgICAgIHZhciBicmFja2V0ID0gYnJhY2tldHMuaW5kZXhPZihjaCk7XG4gICAgICBpZiAoYnJhY2tldCA+PSAwICYmIGJyYWNrZXQgPCAzKSB7XG4gICAgICAgIGlmICghZGVwdGgpIHsgKytwb3M7IGJyZWFrOyB9XG4gICAgICAgIGlmICgtLWRlcHRoID09IDApIGJyZWFrO1xuICAgICAgfSBlbHNlIGlmIChicmFja2V0ID49IDMgJiYgYnJhY2tldCA8IDYpIHtcbiAgICAgICAgKytkZXB0aDtcbiAgICAgIH0gZWxzZSBpZiAoL1skXFx3XS8udGVzdChjaCkpIHtcbiAgICAgICAgc2F3U29tZXRoaW5nID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAoc2F3U29tZXRoaW5nICYmICFkZXB0aCkge1xuICAgICAgICArK3BvcztcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChzYXdTb21ldGhpbmcgJiYgIWRlcHRoKSBzdGF0ZS5mYXRBcnJvd0F0ID0gcG9zO1xuICB9XG5cbiAgLy8gUGFyc2VyXG5cbiAgdmFyIGF0b21pY1R5cGVzID0ge1wiYXRvbVwiOiB0cnVlLCBcIm51bWJlclwiOiB0cnVlLCBcInZhcmlhYmxlXCI6IHRydWUsIFwic3RyaW5nXCI6IHRydWUsIFwicmVnZXhwXCI6IHRydWUsIFwidGhpc1wiOiB0cnVlLCBcImpzb25sZC1rZXl3b3JkXCI6IHRydWV9O1xuXG4gIGZ1bmN0aW9uIEpTTGV4aWNhbChpbmRlbnRlZCwgY29sdW1uLCB0eXBlLCBhbGlnbiwgcHJldiwgaW5mbykge1xuICAgIHRoaXMuaW5kZW50ZWQgPSBpbmRlbnRlZDtcbiAgICB0aGlzLmNvbHVtbiA9IGNvbHVtbjtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMucHJldiA9IHByZXY7XG4gICAgdGhpcy5pbmZvID0gaW5mbztcbiAgICBpZiAoYWxpZ24gIT0gbnVsbCkgdGhpcy5hbGlnbiA9IGFsaWduO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5TY29wZShzdGF0ZSwgdmFybmFtZSkge1xuICAgIGZvciAodmFyIHYgPSBzdGF0ZS5sb2NhbFZhcnM7IHY7IHYgPSB2Lm5leHQpXG4gICAgICBpZiAodi5uYW1lID09IHZhcm5hbWUpIHJldHVybiB0cnVlO1xuICAgIGZvciAodmFyIGN4ID0gc3RhdGUuY29udGV4dDsgY3g7IGN4ID0gY3gucHJldikge1xuICAgICAgZm9yICh2YXIgdiA9IGN4LnZhcnM7IHY7IHYgPSB2Lm5leHQpXG4gICAgICAgIGlmICh2Lm5hbWUgPT0gdmFybmFtZSkgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VKUyhzdGF0ZSwgc3R5bGUsIHR5cGUsIGNvbnRlbnQsIHN0cmVhbSkge1xuICAgIHZhciBjYyA9IHN0YXRlLmNjO1xuICAgIC8vIENvbW11bmljYXRlIG91ciBjb250ZXh0IHRvIHRoZSBjb21iaW5hdG9ycy5cbiAgICAvLyAoTGVzcyB3YXN0ZWZ1bCB0aGFuIGNvbnNpbmcgdXAgYSBodW5kcmVkIGNsb3N1cmVzIG9uIGV2ZXJ5IGNhbGwuKVxuICAgIGN4LnN0YXRlID0gc3RhdGU7IGN4LnN0cmVhbSA9IHN0cmVhbTsgY3gubWFya2VkID0gbnVsbCwgY3guY2MgPSBjYztcblxuICAgIGlmICghc3RhdGUubGV4aWNhbC5oYXNPd25Qcm9wZXJ0eShcImFsaWduXCIpKVxuICAgICAgc3RhdGUubGV4aWNhbC5hbGlnbiA9IHRydWU7XG5cbiAgICB3aGlsZSh0cnVlKSB7XG4gICAgICB2YXIgY29tYmluYXRvciA9IGNjLmxlbmd0aCA/IGNjLnBvcCgpIDoganNvbk1vZGUgPyBleHByZXNzaW9uIDogc3RhdGVtZW50O1xuICAgICAgaWYgKGNvbWJpbmF0b3IodHlwZSwgY29udGVudCkpIHtcbiAgICAgICAgd2hpbGUoY2MubGVuZ3RoICYmIGNjW2NjLmxlbmd0aCAtIDFdLmxleClcbiAgICAgICAgICBjYy5wb3AoKSgpO1xuICAgICAgICBpZiAoY3gubWFya2VkKSByZXR1cm4gY3gubWFya2VkO1xuICAgICAgICBpZiAodHlwZSA9PSBcInZhcmlhYmxlXCIgJiYgaW5TY29wZShzdGF0ZSwgY29udGVudCkpIHJldHVybiBcInZhcmlhYmxlLTJcIjtcbiAgICAgICAgcmV0dXJuIHN0eWxlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIENvbWJpbmF0b3IgdXRpbHNcblxuICB2YXIgY3ggPSB7c3RhdGU6IG51bGwsIGNvbHVtbjogbnVsbCwgbWFya2VkOiBudWxsLCBjYzogbnVsbH07XG4gIGZ1bmN0aW9uIHBhc3MoKSB7XG4gICAgZm9yICh2YXIgaSA9IGFyZ3VtZW50cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgY3guY2MucHVzaChhcmd1bWVudHNbaV0pO1xuICB9XG4gIGZ1bmN0aW9uIGNvbnQoKSB7XG4gICAgcGFzcy5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGZ1bmN0aW9uIHJlZ2lzdGVyKHZhcm5hbWUpIHtcbiAgICBmdW5jdGlvbiBpbkxpc3QobGlzdCkge1xuICAgICAgZm9yICh2YXIgdiA9IGxpc3Q7IHY7IHYgPSB2Lm5leHQpXG4gICAgICAgIGlmICh2Lm5hbWUgPT0gdmFybmFtZSkgcmV0dXJuIHRydWU7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciBzdGF0ZSA9IGN4LnN0YXRlO1xuICAgIGlmIChzdGF0ZS5jb250ZXh0KSB7XG4gICAgICBjeC5tYXJrZWQgPSBcImRlZlwiO1xuICAgICAgaWYgKGluTGlzdChzdGF0ZS5sb2NhbFZhcnMpKSByZXR1cm47XG4gICAgICBzdGF0ZS5sb2NhbFZhcnMgPSB7bmFtZTogdmFybmFtZSwgbmV4dDogc3RhdGUubG9jYWxWYXJzfTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGluTGlzdChzdGF0ZS5nbG9iYWxWYXJzKSkgcmV0dXJuO1xuICAgICAgaWYgKHBhcnNlckNvbmZpZy5nbG9iYWxWYXJzKVxuICAgICAgICBzdGF0ZS5nbG9iYWxWYXJzID0ge25hbWU6IHZhcm5hbWUsIG5leHQ6IHN0YXRlLmdsb2JhbFZhcnN9O1xuICAgIH1cbiAgfVxuXG4gIC8vIENvbWJpbmF0b3JzXG5cbiAgdmFyIGRlZmF1bHRWYXJzID0ge25hbWU6IFwidGhpc1wiLCBuZXh0OiB7bmFtZTogXCJhcmd1bWVudHNcIn19O1xuICBmdW5jdGlvbiBwdXNoY29udGV4dCgpIHtcbiAgICBjeC5zdGF0ZS5jb250ZXh0ID0ge3ByZXY6IGN4LnN0YXRlLmNvbnRleHQsIHZhcnM6IGN4LnN0YXRlLmxvY2FsVmFyc307XG4gICAgY3guc3RhdGUubG9jYWxWYXJzID0gZGVmYXVsdFZhcnM7XG4gIH1cbiAgZnVuY3Rpb24gcG9wY29udGV4dCgpIHtcbiAgICBjeC5zdGF0ZS5sb2NhbFZhcnMgPSBjeC5zdGF0ZS5jb250ZXh0LnZhcnM7XG4gICAgY3guc3RhdGUuY29udGV4dCA9IGN4LnN0YXRlLmNvbnRleHQucHJldjtcbiAgfVxuICBmdW5jdGlvbiBwdXNobGV4KHR5cGUsIGluZm8pIHtcbiAgICB2YXIgcmVzdWx0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc3RhdGUgPSBjeC5zdGF0ZSwgaW5kZW50ID0gc3RhdGUuaW5kZW50ZWQ7XG4gICAgICBpZiAoc3RhdGUubGV4aWNhbC50eXBlID09IFwic3RhdFwiKSBpbmRlbnQgPSBzdGF0ZS5sZXhpY2FsLmluZGVudGVkO1xuICAgICAgc3RhdGUubGV4aWNhbCA9IG5ldyBKU0xleGljYWwoaW5kZW50LCBjeC5zdHJlYW0uY29sdW1uKCksIHR5cGUsIG51bGwsIHN0YXRlLmxleGljYWwsIGluZm8pO1xuICAgIH07XG4gICAgcmVzdWx0LmxleCA9IHRydWU7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICBmdW5jdGlvbiBwb3BsZXgoKSB7XG4gICAgdmFyIHN0YXRlID0gY3guc3RhdGU7XG4gICAgaWYgKHN0YXRlLmxleGljYWwucHJldikge1xuICAgICAgaWYgKHN0YXRlLmxleGljYWwudHlwZSA9PSBcIilcIilcbiAgICAgICAgc3RhdGUuaW5kZW50ZWQgPSBzdGF0ZS5sZXhpY2FsLmluZGVudGVkO1xuICAgICAgc3RhdGUubGV4aWNhbCA9IHN0YXRlLmxleGljYWwucHJldjtcbiAgICB9XG4gIH1cbiAgcG9wbGV4LmxleCA9IHRydWU7XG5cbiAgZnVuY3Rpb24gZXhwZWN0KHdhbnRlZCkge1xuICAgIGZ1bmN0aW9uIGV4cCh0eXBlKSB7XG4gICAgICBpZiAodHlwZSA9PSB3YW50ZWQpIHJldHVybiBjb250KCk7XG4gICAgICBlbHNlIGlmICh3YW50ZWQgPT0gXCI7XCIpIHJldHVybiBwYXNzKCk7XG4gICAgICBlbHNlIHJldHVybiBjb250KGV4cCk7XG4gICAgfTtcbiAgICByZXR1cm4gZXhwO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RhdGVtZW50KHR5cGUsIHZhbHVlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ2YXJcIikgcmV0dXJuIGNvbnQocHVzaGxleChcInZhcmRlZlwiLCB2YWx1ZS5sZW5ndGgpLCB2YXJkZWYsIGV4cGVjdChcIjtcIiksIHBvcGxleCk7XG4gICAgaWYgKHR5cGUgPT0gXCJrZXl3b3JkIGFcIikgcmV0dXJuIGNvbnQocHVzaGxleChcImZvcm1cIiksIGV4cHJlc3Npb24sIHN0YXRlbWVudCwgcG9wbGV4KTtcbiAgICBpZiAodHlwZSA9PSBcImtleXdvcmQgYlwiKSByZXR1cm4gY29udChwdXNobGV4KFwiZm9ybVwiKSwgc3RhdGVtZW50LCBwb3BsZXgpO1xuICAgIGlmICh0eXBlID09IFwie1wiKSByZXR1cm4gY29udChwdXNobGV4KFwifVwiKSwgYmxvY2ssIHBvcGxleCk7XG4gICAgaWYgKHR5cGUgPT0gXCI7XCIpIHJldHVybiBjb250KCk7XG4gICAgaWYgKHR5cGUgPT0gXCJpZlwiKSB7XG4gICAgICBpZiAoY3guc3RhdGUubGV4aWNhbC5pbmZvID09IFwiZWxzZVwiICYmIGN4LnN0YXRlLmNjW2N4LnN0YXRlLmNjLmxlbmd0aCAtIDFdID09IHBvcGxleClcbiAgICAgICAgY3guc3RhdGUuY2MucG9wKCkoKTtcbiAgICAgIHJldHVybiBjb250KHB1c2hsZXgoXCJmb3JtXCIpLCBleHByZXNzaW9uLCBzdGF0ZW1lbnQsIHBvcGxleCwgbWF5YmVlbHNlKTtcbiAgICB9XG4gICAgaWYgKHR5cGUgPT0gXCJmdW5jdGlvblwiKSByZXR1cm4gY29udChmdW5jdGlvbmRlZik7XG4gICAgaWYgKHR5cGUgPT0gXCJmb3JcIikgcmV0dXJuIGNvbnQocHVzaGxleChcImZvcm1cIiksIGZvcnNwZWMsIHN0YXRlbWVudCwgcG9wbGV4KTtcbiAgICBpZiAodHlwZSA9PSBcInZhcmlhYmxlXCIpIHJldHVybiBjb250KHB1c2hsZXgoXCJzdGF0XCIpLCBtYXliZWxhYmVsKTtcbiAgICBpZiAodHlwZSA9PSBcInN3aXRjaFwiKSByZXR1cm4gY29udChwdXNobGV4KFwiZm9ybVwiKSwgZXhwcmVzc2lvbiwgcHVzaGxleChcIn1cIiwgXCJzd2l0Y2hcIiksIGV4cGVjdChcIntcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrLCBwb3BsZXgsIHBvcGxleCk7XG4gICAgaWYgKHR5cGUgPT0gXCJjYXNlXCIpIHJldHVybiBjb250KGV4cHJlc3Npb24sIGV4cGVjdChcIjpcIikpO1xuICAgIGlmICh0eXBlID09IFwiZGVmYXVsdFwiKSByZXR1cm4gY29udChleHBlY3QoXCI6XCIpKTtcbiAgICBpZiAodHlwZSA9PSBcImNhdGNoXCIpIHJldHVybiBjb250KHB1c2hsZXgoXCJmb3JtXCIpLCBwdXNoY29udGV4dCwgZXhwZWN0KFwiKFwiKSwgZnVuYXJnLCBleHBlY3QoXCIpXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlbWVudCwgcG9wbGV4LCBwb3Bjb250ZXh0KTtcbiAgICBpZiAodHlwZSA9PSBcIm1vZHVsZVwiKSByZXR1cm4gY29udChwdXNobGV4KFwiZm9ybVwiKSwgcHVzaGNvbnRleHQsIGFmdGVyTW9kdWxlLCBwb3Bjb250ZXh0LCBwb3BsZXgpO1xuICAgIGlmICh0eXBlID09IFwiY2xhc3NcIikgcmV0dXJuIGNvbnQocHVzaGxleChcImZvcm1cIiksIGNsYXNzTmFtZSwgb2JqbGl0LCBwb3BsZXgpO1xuICAgIGlmICh0eXBlID09IFwiZXhwb3J0XCIpIHJldHVybiBjb250KHB1c2hsZXgoXCJmb3JtXCIpLCBhZnRlckV4cG9ydCwgcG9wbGV4KTtcbiAgICBpZiAodHlwZSA9PSBcImltcG9ydFwiKSByZXR1cm4gY29udChwdXNobGV4KFwiZm9ybVwiKSwgYWZ0ZXJJbXBvcnQsIHBvcGxleCk7XG4gICAgcmV0dXJuIHBhc3MocHVzaGxleChcInN0YXRcIiksIGV4cHJlc3Npb24sIGV4cGVjdChcIjtcIiksIHBvcGxleCk7XG4gIH1cbiAgZnVuY3Rpb24gZXhwcmVzc2lvbih0eXBlKSB7XG4gICAgcmV0dXJuIGV4cHJlc3Npb25Jbm5lcih0eXBlLCBmYWxzZSk7XG4gIH1cbiAgZnVuY3Rpb24gZXhwcmVzc2lvbk5vQ29tbWEodHlwZSkge1xuICAgIHJldHVybiBleHByZXNzaW9uSW5uZXIodHlwZSwgdHJ1ZSk7XG4gIH1cbiAgZnVuY3Rpb24gZXhwcmVzc2lvbklubmVyKHR5cGUsIG5vQ29tbWEpIHtcbiAgICBpZiAoY3guc3RhdGUuZmF0QXJyb3dBdCA9PSBjeC5zdHJlYW0uc3RhcnQpIHtcbiAgICAgIHZhciBib2R5ID0gbm9Db21tYSA/IGFycm93Qm9keU5vQ29tbWEgOiBhcnJvd0JvZHk7XG4gICAgICBpZiAodHlwZSA9PSBcIihcIikgcmV0dXJuIGNvbnQocHVzaGNvbnRleHQsIHB1c2hsZXgoXCIpXCIpLCBjb21tYXNlcChwYXR0ZXJuLCBcIilcIiksIHBvcGxleCwgZXhwZWN0KFwiPT5cIiksIGJvZHksIHBvcGNvbnRleHQpO1xuICAgICAgZWxzZSBpZiAodHlwZSA9PSBcInZhcmlhYmxlXCIpIHJldHVybiBwYXNzKHB1c2hjb250ZXh0LCBwYXR0ZXJuLCBleHBlY3QoXCI9PlwiKSwgYm9keSwgcG9wY29udGV4dCk7XG4gICAgfVxuXG4gICAgdmFyIG1heWJlb3AgPSBub0NvbW1hID8gbWF5YmVvcGVyYXRvck5vQ29tbWEgOiBtYXliZW9wZXJhdG9yQ29tbWE7XG4gICAgaWYgKGF0b21pY1R5cGVzLmhhc093blByb3BlcnR5KHR5cGUpKSByZXR1cm4gY29udChtYXliZW9wKTtcbiAgICBpZiAodHlwZSA9PSBcImZ1bmN0aW9uXCIpIHJldHVybiBjb250KGZ1bmN0aW9uZGVmLCBtYXliZW9wKTtcbiAgICBpZiAodHlwZSA9PSBcImtleXdvcmQgY1wiKSByZXR1cm4gY29udChub0NvbW1hID8gbWF5YmVleHByZXNzaW9uTm9Db21tYSA6IG1heWJlZXhwcmVzc2lvbik7XG4gICAgaWYgKHR5cGUgPT0gXCIoXCIpIHJldHVybiBjb250KHB1c2hsZXgoXCIpXCIpLCBtYXliZWV4cHJlc3Npb24sIGNvbXByZWhlbnNpb24sIGV4cGVjdChcIilcIiksIHBvcGxleCwgbWF5YmVvcCk7XG4gICAgaWYgKHR5cGUgPT0gXCJvcGVyYXRvclwiIHx8IHR5cGUgPT0gXCJzcHJlYWRcIikgcmV0dXJuIGNvbnQobm9Db21tYSA/IGV4cHJlc3Npb25Ob0NvbW1hIDogZXhwcmVzc2lvbik7XG4gICAgaWYgKHR5cGUgPT0gXCJbXCIpIHJldHVybiBjb250KHB1c2hsZXgoXCJdXCIpLCBhcnJheUxpdGVyYWwsIHBvcGxleCwgbWF5YmVvcCk7XG4gICAgaWYgKHR5cGUgPT0gXCJ7XCIpIHJldHVybiBjb250Q29tbWFzZXAob2JqcHJvcCwgXCJ9XCIsIG51bGwsIG1heWJlb3ApO1xuICAgIGlmICh0eXBlID09IFwicXVhc2lcIikgeyByZXR1cm4gcGFzcyhxdWFzaSwgbWF5YmVvcCk7IH1cbiAgICByZXR1cm4gY29udCgpO1xuICB9XG4gIGZ1bmN0aW9uIG1heWJlZXhwcmVzc2lvbih0eXBlKSB7XG4gICAgaWYgKHR5cGUubWF0Y2goL1s7XFx9XFwpXFxdLF0vKSkgcmV0dXJuIHBhc3MoKTtcbiAgICByZXR1cm4gcGFzcyhleHByZXNzaW9uKTtcbiAgfVxuICBmdW5jdGlvbiBtYXliZWV4cHJlc3Npb25Ob0NvbW1hKHR5cGUpIHtcbiAgICBpZiAodHlwZS5tYXRjaCgvWztcXH1cXClcXF0sXS8pKSByZXR1cm4gcGFzcygpO1xuICAgIHJldHVybiBwYXNzKGV4cHJlc3Npb25Ob0NvbW1hKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1heWJlb3BlcmF0b3JDb21tYSh0eXBlLCB2YWx1ZSkge1xuICAgIGlmICh0eXBlID09IFwiLFwiKSByZXR1cm4gY29udChleHByZXNzaW9uKTtcbiAgICByZXR1cm4gbWF5YmVvcGVyYXRvck5vQ29tbWEodHlwZSwgdmFsdWUsIGZhbHNlKTtcbiAgfVxuICBmdW5jdGlvbiBtYXliZW9wZXJhdG9yTm9Db21tYSh0eXBlLCB2YWx1ZSwgbm9Db21tYSkge1xuICAgIHZhciBtZSA9IG5vQ29tbWEgPT0gZmFsc2UgPyBtYXliZW9wZXJhdG9yQ29tbWEgOiBtYXliZW9wZXJhdG9yTm9Db21tYTtcbiAgICB2YXIgZXhwciA9IG5vQ29tbWEgPT0gZmFsc2UgPyBleHByZXNzaW9uIDogZXhwcmVzc2lvbk5vQ29tbWE7XG4gICAgaWYgKHZhbHVlID09IFwiPT5cIikgcmV0dXJuIGNvbnQocHVzaGNvbnRleHQsIG5vQ29tbWEgPyBhcnJvd0JvZHlOb0NvbW1hIDogYXJyb3dCb2R5LCBwb3Bjb250ZXh0KTtcbiAgICBpZiAodHlwZSA9PSBcIm9wZXJhdG9yXCIpIHtcbiAgICAgIGlmICgvXFwrXFwrfC0tLy50ZXN0KHZhbHVlKSkgcmV0dXJuIGNvbnQobWUpO1xuICAgICAgaWYgKHZhbHVlID09IFwiP1wiKSByZXR1cm4gY29udChleHByZXNzaW9uLCBleHBlY3QoXCI6XCIpLCBleHByKTtcbiAgICAgIHJldHVybiBjb250KGV4cHIpO1xuICAgIH1cbiAgICBpZiAodHlwZSA9PSBcInF1YXNpXCIpIHsgcmV0dXJuIHBhc3MocXVhc2ksIG1lKTsgfVxuICAgIGlmICh0eXBlID09IFwiO1wiKSByZXR1cm47XG4gICAgaWYgKHR5cGUgPT0gXCIoXCIpIHJldHVybiBjb250Q29tbWFzZXAoZXhwcmVzc2lvbk5vQ29tbWEsIFwiKVwiLCBcImNhbGxcIiwgbWUpO1xuICAgIGlmICh0eXBlID09IFwiLlwiKSByZXR1cm4gY29udChwcm9wZXJ0eSwgbWUpO1xuICAgIGlmICh0eXBlID09IFwiW1wiKSByZXR1cm4gY29udChwdXNobGV4KFwiXVwiKSwgbWF5YmVleHByZXNzaW9uLCBleHBlY3QoXCJdXCIpLCBwb3BsZXgsIG1lKTtcbiAgfVxuICBmdW5jdGlvbiBxdWFzaSh0eXBlLCB2YWx1ZSkge1xuICAgIGlmICh0eXBlICE9IFwicXVhc2lcIikgcmV0dXJuIHBhc3MoKTtcbiAgICBpZiAodmFsdWUuc2xpY2UodmFsdWUubGVuZ3RoIC0gMikgIT0gXCIke1wiKSByZXR1cm4gY29udChxdWFzaSk7XG4gICAgcmV0dXJuIGNvbnQoZXhwcmVzc2lvbiwgY29udGludWVRdWFzaSk7XG4gIH1cbiAgZnVuY3Rpb24gY29udGludWVRdWFzaSh0eXBlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ9XCIpIHtcbiAgICAgIGN4Lm1hcmtlZCA9IFwic3RyaW5nLTJcIjtcbiAgICAgIGN4LnN0YXRlLnRva2VuaXplID0gdG9rZW5RdWFzaTtcbiAgICAgIHJldHVybiBjb250KHF1YXNpKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gYXJyb3dCb2R5KHR5cGUpIHtcbiAgICBmaW5kRmF0QXJyb3coY3guc3RyZWFtLCBjeC5zdGF0ZSk7XG4gICAgaWYgKHR5cGUgPT0gXCJ7XCIpIHJldHVybiBwYXNzKHN0YXRlbWVudCk7XG4gICAgcmV0dXJuIHBhc3MoZXhwcmVzc2lvbik7XG4gIH1cbiAgZnVuY3Rpb24gYXJyb3dCb2R5Tm9Db21tYSh0eXBlKSB7XG4gICAgZmluZEZhdEFycm93KGN4LnN0cmVhbSwgY3guc3RhdGUpO1xuICAgIGlmICh0eXBlID09IFwie1wiKSByZXR1cm4gcGFzcyhzdGF0ZW1lbnQpO1xuICAgIHJldHVybiBwYXNzKGV4cHJlc3Npb25Ob0NvbW1hKTtcbiAgfVxuICBmdW5jdGlvbiBtYXliZWxhYmVsKHR5cGUpIHtcbiAgICBpZiAodHlwZSA9PSBcIjpcIikgcmV0dXJuIGNvbnQocG9wbGV4LCBzdGF0ZW1lbnQpO1xuICAgIHJldHVybiBwYXNzKG1heWJlb3BlcmF0b3JDb21tYSwgZXhwZWN0KFwiO1wiKSwgcG9wbGV4KTtcbiAgfVxuICBmdW5jdGlvbiBwcm9wZXJ0eSh0eXBlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ2YXJpYWJsZVwiKSB7Y3gubWFya2VkID0gXCJwcm9wZXJ0eVwiOyByZXR1cm4gY29udCgpO31cbiAgfVxuICBmdW5jdGlvbiBvYmpwcm9wKHR5cGUsIHZhbHVlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ2YXJpYWJsZVwiKSB7XG4gICAgICBjeC5tYXJrZWQgPSBcInByb3BlcnR5XCI7XG4gICAgICBpZiAodmFsdWUgPT0gXCJnZXRcIiB8fCB2YWx1ZSA9PSBcInNldFwiKSByZXR1cm4gY29udChnZXR0ZXJTZXR0ZXIpO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcIm51bWJlclwiIHx8IHR5cGUgPT0gXCJzdHJpbmdcIikge1xuICAgICAgY3gubWFya2VkID0ganNvbmxkTW9kZSA/IFwicHJvcGVydHlcIiA6ICh0eXBlICsgXCIgcHJvcGVydHlcIik7XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFwiW1wiKSB7XG4gICAgICByZXR1cm4gY29udChleHByZXNzaW9uLCBleHBlY3QoXCJdXCIpLCBhZnRlcnByb3ApO1xuICAgIH1cbiAgICBpZiAoYXRvbWljVHlwZXMuaGFzT3duUHJvcGVydHkodHlwZSkpIHJldHVybiBjb250KGFmdGVycHJvcCk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0dGVyU2V0dGVyKHR5cGUpIHtcbiAgICBpZiAodHlwZSAhPSBcInZhcmlhYmxlXCIpIHJldHVybiBwYXNzKGFmdGVycHJvcCk7XG4gICAgY3gubWFya2VkID0gXCJwcm9wZXJ0eVwiO1xuICAgIHJldHVybiBjb250KGZ1bmN0aW9uZGVmKTtcbiAgfVxuICBmdW5jdGlvbiBhZnRlcnByb3AodHlwZSkge1xuICAgIGlmICh0eXBlID09IFwiOlwiKSByZXR1cm4gY29udChleHByZXNzaW9uTm9Db21tYSk7XG4gICAgaWYgKHR5cGUgPT0gXCIoXCIpIHJldHVybiBwYXNzKGZ1bmN0aW9uZGVmKTtcbiAgfVxuICBmdW5jdGlvbiBjb21tYXNlcCh3aGF0LCBlbmQpIHtcbiAgICBmdW5jdGlvbiBwcm9jZWVkKHR5cGUpIHtcbiAgICAgIGlmICh0eXBlID09IFwiLFwiKSB7XG4gICAgICAgIHZhciBsZXggPSBjeC5zdGF0ZS5sZXhpY2FsO1xuICAgICAgICBpZiAobGV4LmluZm8gPT0gXCJjYWxsXCIpIGxleC5wb3MgPSAobGV4LnBvcyB8fCAwKSArIDE7XG4gICAgICAgIHJldHVybiBjb250KHdoYXQsIHByb2NlZWQpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGUgPT0gZW5kKSByZXR1cm4gY29udCgpO1xuICAgICAgcmV0dXJuIGNvbnQoZXhwZWN0KGVuZCkpO1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24odHlwZSkge1xuICAgICAgaWYgKHR5cGUgPT0gZW5kKSByZXR1cm4gY29udCgpO1xuICAgICAgcmV0dXJuIHBhc3Mod2hhdCwgcHJvY2VlZCk7XG4gICAgfTtcbiAgfVxuICBmdW5jdGlvbiBjb250Q29tbWFzZXAod2hhdCwgZW5kLCBpbmZvKSB7XG4gICAgZm9yICh2YXIgaSA9IDM7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXG4gICAgICBjeC5jYy5wdXNoKGFyZ3VtZW50c1tpXSk7XG4gICAgcmV0dXJuIGNvbnQocHVzaGxleChlbmQsIGluZm8pLCBjb21tYXNlcCh3aGF0LCBlbmQpLCBwb3BsZXgpO1xuICB9XG4gIGZ1bmN0aW9uIGJsb2NrKHR5cGUpIHtcbiAgICBpZiAodHlwZSA9PSBcIn1cIikgcmV0dXJuIGNvbnQoKTtcbiAgICByZXR1cm4gcGFzcyhzdGF0ZW1lbnQsIGJsb2NrKTtcbiAgfVxuICBmdW5jdGlvbiBtYXliZXR5cGUodHlwZSkge1xuICAgIGlmIChpc1RTICYmIHR5cGUgPT0gXCI6XCIpIHJldHVybiBjb250KHR5cGVkZWYpO1xuICB9XG4gIGZ1bmN0aW9uIHR5cGVkZWYodHlwZSkge1xuICAgIGlmICh0eXBlID09IFwidmFyaWFibGVcIil7Y3gubWFya2VkID0gXCJ2YXJpYWJsZS0zXCI7IHJldHVybiBjb250KCk7fVxuICB9XG4gIGZ1bmN0aW9uIHZhcmRlZigpIHtcbiAgICByZXR1cm4gcGFzcyhwYXR0ZXJuLCBtYXliZXR5cGUsIG1heWJlQXNzaWduLCB2YXJkZWZDb250KTtcbiAgfVxuICBmdW5jdGlvbiBwYXR0ZXJuKHR5cGUsIHZhbHVlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ2YXJpYWJsZVwiKSB7IHJlZ2lzdGVyKHZhbHVlKTsgcmV0dXJuIGNvbnQoKTsgfVxuICAgIGlmICh0eXBlID09IFwiW1wiKSByZXR1cm4gY29udENvbW1hc2VwKHBhdHRlcm4sIFwiXVwiKTtcbiAgICBpZiAodHlwZSA9PSBcIntcIikgcmV0dXJuIGNvbnRDb21tYXNlcChwcm9wcGF0dGVybiwgXCJ9XCIpO1xuICB9XG4gIGZ1bmN0aW9uIHByb3BwYXR0ZXJuKHR5cGUsIHZhbHVlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ2YXJpYWJsZVwiICYmICFjeC5zdHJlYW0ubWF0Y2goL15cXHMqOi8sIGZhbHNlKSkge1xuICAgICAgcmVnaXN0ZXIodmFsdWUpO1xuICAgICAgcmV0dXJuIGNvbnQobWF5YmVBc3NpZ24pO1xuICAgIH1cbiAgICBpZiAodHlwZSA9PSBcInZhcmlhYmxlXCIpIGN4Lm1hcmtlZCA9IFwicHJvcGVydHlcIjtcbiAgICByZXR1cm4gY29udChleHBlY3QoXCI6XCIpLCBwYXR0ZXJuLCBtYXliZUFzc2lnbik7XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVBc3NpZ24oX3R5cGUsIHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09IFwiPVwiKSByZXR1cm4gY29udChleHByZXNzaW9uTm9Db21tYSk7XG4gIH1cbiAgZnVuY3Rpb24gdmFyZGVmQ29udCh0eXBlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCIsXCIpIHJldHVybiBjb250KHZhcmRlZik7XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVlbHNlKHR5cGUsIHZhbHVlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJrZXl3b3JkIGJcIiAmJiB2YWx1ZSA9PSBcImVsc2VcIikgcmV0dXJuIGNvbnQocHVzaGxleChcImZvcm1cIiwgXCJlbHNlXCIpLCBzdGF0ZW1lbnQsIHBvcGxleCk7XG4gIH1cbiAgZnVuY3Rpb24gZm9yc3BlYyh0eXBlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCIoXCIpIHJldHVybiBjb250KHB1c2hsZXgoXCIpXCIpLCBmb3JzcGVjMSwgZXhwZWN0KFwiKVwiKSwgcG9wbGV4KTtcbiAgfVxuICBmdW5jdGlvbiBmb3JzcGVjMSh0eXBlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ2YXJcIikgcmV0dXJuIGNvbnQodmFyZGVmLCBleHBlY3QoXCI7XCIpLCBmb3JzcGVjMik7XG4gICAgaWYgKHR5cGUgPT0gXCI7XCIpIHJldHVybiBjb250KGZvcnNwZWMyKTtcbiAgICBpZiAodHlwZSA9PSBcInZhcmlhYmxlXCIpIHJldHVybiBjb250KGZvcm1heWJlaW5vZik7XG4gICAgcmV0dXJuIHBhc3MoZXhwcmVzc2lvbiwgZXhwZWN0KFwiO1wiKSwgZm9yc3BlYzIpO1xuICB9XG4gIGZ1bmN0aW9uIGZvcm1heWJlaW5vZihfdHlwZSwgdmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT0gXCJpblwiIHx8IHZhbHVlID09IFwib2ZcIikgeyBjeC5tYXJrZWQgPSBcImtleXdvcmRcIjsgcmV0dXJuIGNvbnQoZXhwcmVzc2lvbik7IH1cbiAgICByZXR1cm4gY29udChtYXliZW9wZXJhdG9yQ29tbWEsIGZvcnNwZWMyKTtcbiAgfVxuICBmdW5jdGlvbiBmb3JzcGVjMih0eXBlLCB2YWx1ZSkge1xuICAgIGlmICh0eXBlID09IFwiO1wiKSByZXR1cm4gY29udChmb3JzcGVjMyk7XG4gICAgaWYgKHZhbHVlID09IFwiaW5cIiB8fCB2YWx1ZSA9PSBcIm9mXCIpIHsgY3gubWFya2VkID0gXCJrZXl3b3JkXCI7IHJldHVybiBjb250KGV4cHJlc3Npb24pOyB9XG4gICAgcmV0dXJuIHBhc3MoZXhwcmVzc2lvbiwgZXhwZWN0KFwiO1wiKSwgZm9yc3BlYzMpO1xuICB9XG4gIGZ1bmN0aW9uIGZvcnNwZWMzKHR5cGUpIHtcbiAgICBpZiAodHlwZSAhPSBcIilcIikgY29udChleHByZXNzaW9uKTtcbiAgfVxuICBmdW5jdGlvbiBmdW5jdGlvbmRlZih0eXBlLCB2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PSBcIipcIikge2N4Lm1hcmtlZCA9IFwia2V5d29yZFwiOyByZXR1cm4gY29udChmdW5jdGlvbmRlZik7fVxuICAgIGlmICh0eXBlID09IFwidmFyaWFibGVcIikge3JlZ2lzdGVyKHZhbHVlKTsgcmV0dXJuIGNvbnQoZnVuY3Rpb25kZWYpO31cbiAgICBpZiAodHlwZSA9PSBcIihcIikgcmV0dXJuIGNvbnQocHVzaGNvbnRleHQsIHB1c2hsZXgoXCIpXCIpLCBjb21tYXNlcChmdW5hcmcsIFwiKVwiKSwgcG9wbGV4LCBzdGF0ZW1lbnQsIHBvcGNvbnRleHQpO1xuICB9XG4gIGZ1bmN0aW9uIGZ1bmFyZyh0eXBlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJzcHJlYWRcIikgcmV0dXJuIGNvbnQoZnVuYXJnKTtcbiAgICByZXR1cm4gcGFzcyhwYXR0ZXJuLCBtYXliZXR5cGUpO1xuICB9XG4gIGZ1bmN0aW9uIGNsYXNzTmFtZSh0eXBlLCB2YWx1ZSkge1xuICAgIGlmICh0eXBlID09IFwidmFyaWFibGVcIikge3JlZ2lzdGVyKHZhbHVlKTsgcmV0dXJuIGNvbnQoY2xhc3NOYW1lQWZ0ZXIpO31cbiAgfVxuICBmdW5jdGlvbiBjbGFzc05hbWVBZnRlcihfdHlwZSwgdmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT0gXCJleHRlbmRzXCIpIHJldHVybiBjb250KGV4cHJlc3Npb24pO1xuICB9XG4gIGZ1bmN0aW9uIG9iamxpdCh0eXBlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ7XCIpIHJldHVybiBjb250Q29tbWFzZXAob2JqcHJvcCwgXCJ9XCIpO1xuICB9XG4gIGZ1bmN0aW9uIGFmdGVyTW9kdWxlKHR5cGUsIHZhbHVlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJzdHJpbmdcIikgcmV0dXJuIGNvbnQoc3RhdGVtZW50KTtcbiAgICBpZiAodHlwZSA9PSBcInZhcmlhYmxlXCIpIHsgcmVnaXN0ZXIodmFsdWUpOyByZXR1cm4gY29udChtYXliZUZyb20pOyB9XG4gIH1cbiAgZnVuY3Rpb24gYWZ0ZXJFeHBvcnQoX3R5cGUsIHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09IFwiKlwiKSB7IGN4Lm1hcmtlZCA9IFwia2V5d29yZFwiOyByZXR1cm4gY29udChtYXliZUZyb20sIGV4cGVjdChcIjtcIikpOyB9XG4gICAgaWYgKHZhbHVlID09IFwiZGVmYXVsdFwiKSB7IGN4Lm1hcmtlZCA9IFwia2V5d29yZFwiOyByZXR1cm4gY29udChleHByZXNzaW9uLCBleHBlY3QoXCI7XCIpKTsgfVxuICAgIHJldHVybiBwYXNzKHN0YXRlbWVudCk7XG4gIH1cbiAgZnVuY3Rpb24gYWZ0ZXJJbXBvcnQodHlwZSkge1xuICAgIGlmICh0eXBlID09IFwic3RyaW5nXCIpIHJldHVybiBjb250KCk7XG4gICAgcmV0dXJuIHBhc3MoaW1wb3J0U3BlYywgbWF5YmVGcm9tKTtcbiAgfVxuICBmdW5jdGlvbiBpbXBvcnRTcGVjKHR5cGUsIHZhbHVlKSB7XG4gICAgaWYgKHR5cGUgPT0gXCJ7XCIpIHJldHVybiBjb250Q29tbWFzZXAoaW1wb3J0U3BlYywgXCJ9XCIpO1xuICAgIGlmICh0eXBlID09IFwidmFyaWFibGVcIikgcmVnaXN0ZXIodmFsdWUpO1xuICAgIHJldHVybiBjb250KCk7XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVGcm9tKF90eXBlLCB2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PSBcImZyb21cIikgeyBjeC5tYXJrZWQgPSBcImtleXdvcmRcIjsgcmV0dXJuIGNvbnQoZXhwcmVzc2lvbik7IH1cbiAgfVxuICBmdW5jdGlvbiBhcnJheUxpdGVyYWwodHlwZSkge1xuICAgIGlmICh0eXBlID09IFwiXVwiKSByZXR1cm4gY29udCgpO1xuICAgIHJldHVybiBwYXNzKGV4cHJlc3Npb25Ob0NvbW1hLCBtYXliZUFycmF5Q29tcHJlaGVuc2lvbik7XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVBcnJheUNvbXByZWhlbnNpb24odHlwZSkge1xuICAgIGlmICh0eXBlID09IFwiZm9yXCIpIHJldHVybiBwYXNzKGNvbXByZWhlbnNpb24sIGV4cGVjdChcIl1cIikpO1xuICAgIGlmICh0eXBlID09IFwiLFwiKSByZXR1cm4gY29udChjb21tYXNlcChleHByZXNzaW9uTm9Db21tYSwgXCJdXCIpKTtcbiAgICByZXR1cm4gcGFzcyhjb21tYXNlcChleHByZXNzaW9uTm9Db21tYSwgXCJdXCIpKTtcbiAgfVxuICBmdW5jdGlvbiBjb21wcmVoZW5zaW9uKHR5cGUpIHtcbiAgICBpZiAodHlwZSA9PSBcImZvclwiKSByZXR1cm4gY29udChmb3JzcGVjLCBjb21wcmVoZW5zaW9uKTtcbiAgICBpZiAodHlwZSA9PSBcImlmXCIpIHJldHVybiBjb250KGV4cHJlc3Npb24sIGNvbXByZWhlbnNpb24pO1xuICB9XG5cbiAgLy8gSW50ZXJmYWNlXG5cbiAgcmV0dXJuIHtcbiAgICBzdGFydFN0YXRlOiBmdW5jdGlvbihiYXNlY29sdW1uKSB7XG4gICAgICB2YXIgc3RhdGUgPSB7XG4gICAgICAgIHRva2VuaXplOiB0b2tlbkJhc2UsXG4gICAgICAgIGxhc3RUeXBlOiBcInNvZlwiLFxuICAgICAgICBjYzogW10sXG4gICAgICAgIGxleGljYWw6IG5ldyBKU0xleGljYWwoKGJhc2Vjb2x1bW4gfHwgMCkgLSBpbmRlbnRVbml0LCAwLCBcImJsb2NrXCIsIGZhbHNlKSxcbiAgICAgICAgbG9jYWxWYXJzOiBwYXJzZXJDb25maWcubG9jYWxWYXJzLFxuICAgICAgICBjb250ZXh0OiBwYXJzZXJDb25maWcubG9jYWxWYXJzICYmIHt2YXJzOiBwYXJzZXJDb25maWcubG9jYWxWYXJzfSxcbiAgICAgICAgaW5kZW50ZWQ6IDBcbiAgICAgIH07XG4gICAgICBpZiAocGFyc2VyQ29uZmlnLmdsb2JhbFZhcnMgJiYgdHlwZW9mIHBhcnNlckNvbmZpZy5nbG9iYWxWYXJzID09IFwib2JqZWN0XCIpXG4gICAgICAgIHN0YXRlLmdsb2JhbFZhcnMgPSBwYXJzZXJDb25maWcuZ2xvYmFsVmFycztcbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9LFxuXG4gICAgdG9rZW46IGZ1bmN0aW9uKHN0cmVhbSwgc3RhdGUpIHtcbiAgICAgIGlmIChzdHJlYW0uc29sKCkpIHtcbiAgICAgICAgaWYgKCFzdGF0ZS5sZXhpY2FsLmhhc093blByb3BlcnR5KFwiYWxpZ25cIikpXG4gICAgICAgICAgc3RhdGUubGV4aWNhbC5hbGlnbiA9IGZhbHNlO1xuICAgICAgICBzdGF0ZS5pbmRlbnRlZCA9IHN0cmVhbS5pbmRlbnRhdGlvbigpO1xuICAgICAgICBmaW5kRmF0QXJyb3coc3RyZWFtLCBzdGF0ZSk7XG4gICAgICB9XG4gICAgICBpZiAoc3RhdGUudG9rZW5pemUgIT0gdG9rZW5Db21tZW50ICYmIHN0cmVhbS5lYXRTcGFjZSgpKSByZXR1cm4gbnVsbDtcbiAgICAgIHZhciBzdHlsZSA9IHN0YXRlLnRva2VuaXplKHN0cmVhbSwgc3RhdGUpO1xuICAgICAgaWYgKHR5cGUgPT0gXCJjb21tZW50XCIpIHJldHVybiBzdHlsZTtcbiAgICAgIHN0YXRlLmxhc3RUeXBlID0gdHlwZSA9PSBcIm9wZXJhdG9yXCIgJiYgKGNvbnRlbnQgPT0gXCIrK1wiIHx8IGNvbnRlbnQgPT0gXCItLVwiKSA/IFwiaW5jZGVjXCIgOiB0eXBlO1xuICAgICAgcmV0dXJuIHBhcnNlSlMoc3RhdGUsIHN0eWxlLCB0eXBlLCBjb250ZW50LCBzdHJlYW0pO1xuICAgIH0sXG5cbiAgICBpbmRlbnQ6IGZ1bmN0aW9uKHN0YXRlLCB0ZXh0QWZ0ZXIpIHtcbiAgICAgIGlmIChzdGF0ZS50b2tlbml6ZSA9PSB0b2tlbkNvbW1lbnQpIHJldHVybiBDb2RlTWlycm9yLlBhc3M7XG4gICAgICBpZiAoc3RhdGUudG9rZW5pemUgIT0gdG9rZW5CYXNlKSByZXR1cm4gMDtcbiAgICAgIHZhciBmaXJzdENoYXIgPSB0ZXh0QWZ0ZXIgJiYgdGV4dEFmdGVyLmNoYXJBdCgwKSwgbGV4aWNhbCA9IHN0YXRlLmxleGljYWw7XG4gICAgICAvLyBLbHVkZ2UgdG8gcHJldmVudCAnbWF5YmVsc2UnIGZyb20gYmxvY2tpbmcgbGV4aWNhbCBzY29wZSBwb3BzXG4gICAgICBpZiAoIS9eXFxzKmVsc2VcXGIvLnRlc3QodGV4dEFmdGVyKSkgZm9yICh2YXIgaSA9IHN0YXRlLmNjLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBjID0gc3RhdGUuY2NbaV07XG4gICAgICAgIGlmIChjID09IHBvcGxleCkgbGV4aWNhbCA9IGxleGljYWwucHJldjtcbiAgICAgICAgZWxzZSBpZiAoYyAhPSBtYXliZWVsc2UpIGJyZWFrO1xuICAgICAgfVxuICAgICAgaWYgKGxleGljYWwudHlwZSA9PSBcInN0YXRcIiAmJiBmaXJzdENoYXIgPT0gXCJ9XCIpIGxleGljYWwgPSBsZXhpY2FsLnByZXY7XG4gICAgICBpZiAoc3RhdGVtZW50SW5kZW50ICYmIGxleGljYWwudHlwZSA9PSBcIilcIiAmJiBsZXhpY2FsLnByZXYudHlwZSA9PSBcInN0YXRcIilcbiAgICAgICAgbGV4aWNhbCA9IGxleGljYWwucHJldjtcbiAgICAgIHZhciB0eXBlID0gbGV4aWNhbC50eXBlLCBjbG9zaW5nID0gZmlyc3RDaGFyID09IHR5cGU7XG5cbiAgICAgIGlmICh0eXBlID09IFwidmFyZGVmXCIpIHJldHVybiBsZXhpY2FsLmluZGVudGVkICsgKHN0YXRlLmxhc3RUeXBlID09IFwib3BlcmF0b3JcIiB8fCBzdGF0ZS5sYXN0VHlwZSA9PSBcIixcIiA/IGxleGljYWwuaW5mbyArIDEgOiAwKTtcbiAgICAgIGVsc2UgaWYgKHR5cGUgPT0gXCJmb3JtXCIgJiYgZmlyc3RDaGFyID09IFwie1wiKSByZXR1cm4gbGV4aWNhbC5pbmRlbnRlZDtcbiAgICAgIGVsc2UgaWYgKHR5cGUgPT0gXCJmb3JtXCIpIHJldHVybiBsZXhpY2FsLmluZGVudGVkICsgaW5kZW50VW5pdDtcbiAgICAgIGVsc2UgaWYgKHR5cGUgPT0gXCJzdGF0XCIpXG4gICAgICAgIHJldHVybiBsZXhpY2FsLmluZGVudGVkICsgKHN0YXRlLmxhc3RUeXBlID09IFwib3BlcmF0b3JcIiB8fCBzdGF0ZS5sYXN0VHlwZSA9PSBcIixcIiA/IHN0YXRlbWVudEluZGVudCB8fCBpbmRlbnRVbml0IDogMCk7XG4gICAgICBlbHNlIGlmIChsZXhpY2FsLmluZm8gPT0gXCJzd2l0Y2hcIiAmJiAhY2xvc2luZyAmJiBwYXJzZXJDb25maWcuZG91YmxlSW5kZW50U3dpdGNoICE9IGZhbHNlKVxuICAgICAgICByZXR1cm4gbGV4aWNhbC5pbmRlbnRlZCArICgvXig/OmNhc2V8ZGVmYXVsdClcXGIvLnRlc3QodGV4dEFmdGVyKSA/IGluZGVudFVuaXQgOiAyICogaW5kZW50VW5pdCk7XG4gICAgICBlbHNlIGlmIChsZXhpY2FsLmFsaWduKSByZXR1cm4gbGV4aWNhbC5jb2x1bW4gKyAoY2xvc2luZyA/IDAgOiAxKTtcbiAgICAgIGVsc2UgcmV0dXJuIGxleGljYWwuaW5kZW50ZWQgKyAoY2xvc2luZyA/IDAgOiBpbmRlbnRVbml0KTtcbiAgICB9LFxuXG4gICAgZWxlY3RyaWNDaGFyczogXCI6e31cIixcbiAgICBibG9ja0NvbW1lbnRTdGFydDoganNvbk1vZGUgPyBudWxsIDogXCIvKlwiLFxuICAgIGJsb2NrQ29tbWVudEVuZDoganNvbk1vZGUgPyBudWxsIDogXCIqL1wiLFxuICAgIGxpbmVDb21tZW50OiBqc29uTW9kZSA/IG51bGwgOiBcIi8vXCIsXG4gICAgZm9sZDogXCJicmFjZVwiLFxuXG4gICAgaGVscGVyVHlwZToganNvbk1vZGUgPyBcImpzb25cIiA6IFwiamF2YXNjcmlwdFwiLFxuICAgIGpzb25sZE1vZGU6IGpzb25sZE1vZGUsXG4gICAganNvbk1vZGU6IGpzb25Nb2RlXG4gIH07XG59KTtcblxuQ29kZU1pcnJvci5yZWdpc3RlckhlbHBlcihcIndvcmRDaGFyc1wiLCBcImphdmFzY3JpcHRcIiwgL1tcXFxcdyRdLyk7XG5cbkNvZGVNaXJyb3IuZGVmaW5lTUlNRShcInRleHQvamF2YXNjcmlwdFwiLCBcImphdmFzY3JpcHRcIik7XG5Db2RlTWlycm9yLmRlZmluZU1JTUUoXCJ0ZXh0L2VjbWFzY3JpcHRcIiwgXCJqYXZhc2NyaXB0XCIpO1xuQ29kZU1pcnJvci5kZWZpbmVNSU1FKFwiYXBwbGljYXRpb24vamF2YXNjcmlwdFwiLCBcImphdmFzY3JpcHRcIik7XG5Db2RlTWlycm9yLmRlZmluZU1JTUUoXCJhcHBsaWNhdGlvbi9lY21hc2NyaXB0XCIsIFwiamF2YXNjcmlwdFwiKTtcbkNvZGVNaXJyb3IuZGVmaW5lTUlNRShcImFwcGxpY2F0aW9uL2pzb25cIiwge25hbWU6IFwiamF2YXNjcmlwdFwiLCBqc29uOiB0cnVlfSk7XG5Db2RlTWlycm9yLmRlZmluZU1JTUUoXCJhcHBsaWNhdGlvbi94LWpzb25cIiwge25hbWU6IFwiamF2YXNjcmlwdFwiLCBqc29uOiB0cnVlfSk7XG5Db2RlTWlycm9yLmRlZmluZU1JTUUoXCJhcHBsaWNhdGlvbi9sZCtqc29uXCIsIHtuYW1lOiBcImphdmFzY3JpcHRcIiwganNvbmxkOiB0cnVlfSk7XG5Db2RlTWlycm9yLmRlZmluZU1JTUUoXCJ0ZXh0L3R5cGVzY3JpcHRcIiwgeyBuYW1lOiBcImphdmFzY3JpcHRcIiwgdHlwZXNjcmlwdDogdHJ1ZSB9KTtcbkNvZGVNaXJyb3IuZGVmaW5lTUlNRShcImFwcGxpY2F0aW9uL3R5cGVzY3JpcHRcIiwgeyBuYW1lOiBcImphdmFzY3JpcHRcIiwgdHlwZXNjcmlwdDogdHJ1ZSB9KTtcblxufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qZ2xvYmFscyBIYW5kbGViYXJzOiB0cnVlICovXG52YXIgYmFzZSA9IHJlcXVpcmUoXCIuL2hhbmRsZWJhcnMvYmFzZVwiKTtcblxuLy8gRWFjaCBvZiB0aGVzZSBhdWdtZW50IHRoZSBIYW5kbGViYXJzIG9iamVjdC4gTm8gbmVlZCB0byBzZXR1cCBoZXJlLlxuLy8gKFRoaXMgaXMgZG9uZSB0byBlYXNpbHkgc2hhcmUgY29kZSBiZXR3ZWVuIGNvbW1vbmpzIGFuZCBicm93c2UgZW52cylcbnZhciBTYWZlU3RyaW5nID0gcmVxdWlyZShcIi4vaGFuZGxlYmFycy9zYWZlLXN0cmluZ1wiKVtcImRlZmF1bHRcIl07XG52YXIgRXhjZXB0aW9uID0gcmVxdWlyZShcIi4vaGFuZGxlYmFycy9leGNlcHRpb25cIilbXCJkZWZhdWx0XCJdO1xudmFyIFV0aWxzID0gcmVxdWlyZShcIi4vaGFuZGxlYmFycy91dGlsc1wiKTtcbnZhciBydW50aW1lID0gcmVxdWlyZShcIi4vaGFuZGxlYmFycy9ydW50aW1lXCIpO1xuXG4vLyBGb3IgY29tcGF0aWJpbGl0eSBhbmQgdXNhZ2Ugb3V0c2lkZSBvZiBtb2R1bGUgc3lzdGVtcywgbWFrZSB0aGUgSGFuZGxlYmFycyBvYmplY3QgYSBuYW1lc3BhY2VcbnZhciBjcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGhiID0gbmV3IGJhc2UuSGFuZGxlYmFyc0Vudmlyb25tZW50KCk7XG5cbiAgVXRpbHMuZXh0ZW5kKGhiLCBiYXNlKTtcbiAgaGIuU2FmZVN0cmluZyA9IFNhZmVTdHJpbmc7XG4gIGhiLkV4Y2VwdGlvbiA9IEV4Y2VwdGlvbjtcbiAgaGIuVXRpbHMgPSBVdGlscztcblxuICBoYi5WTSA9IHJ1bnRpbWU7XG4gIGhiLnRlbXBsYXRlID0gZnVuY3Rpb24oc3BlYykge1xuICAgIHJldHVybiBydW50aW1lLnRlbXBsYXRlKHNwZWMsIGhiKTtcbiAgfTtcblxuICByZXR1cm4gaGI7XG59O1xuXG52YXIgSGFuZGxlYmFycyA9IGNyZWF0ZSgpO1xuSGFuZGxlYmFycy5jcmVhdGUgPSBjcmVhdGU7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gSGFuZGxlYmFyczsiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBVdGlscyA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpO1xudmFyIEV4Y2VwdGlvbiA9IHJlcXVpcmUoXCIuL2V4Y2VwdGlvblwiKVtcImRlZmF1bHRcIl07XG5cbnZhciBWRVJTSU9OID0gXCIxLjMuMFwiO1xuZXhwb3J0cy5WRVJTSU9OID0gVkVSU0lPTjt2YXIgQ09NUElMRVJfUkVWSVNJT04gPSA0O1xuZXhwb3J0cy5DT01QSUxFUl9SRVZJU0lPTiA9IENPTVBJTEVSX1JFVklTSU9OO1xudmFyIFJFVklTSU9OX0NIQU5HRVMgPSB7XG4gIDE6ICc8PSAxLjAucmMuMicsIC8vIDEuMC5yYy4yIGlzIGFjdHVhbGx5IHJldjIgYnV0IGRvZXNuJ3QgcmVwb3J0IGl0XG4gIDI6ICc9PSAxLjAuMC1yYy4zJyxcbiAgMzogJz09IDEuMC4wLXJjLjQnLFxuICA0OiAnPj0gMS4wLjAnXG59O1xuZXhwb3J0cy5SRVZJU0lPTl9DSEFOR0VTID0gUkVWSVNJT05fQ0hBTkdFUztcbnZhciBpc0FycmF5ID0gVXRpbHMuaXNBcnJheSxcbiAgICBpc0Z1bmN0aW9uID0gVXRpbHMuaXNGdW5jdGlvbixcbiAgICB0b1N0cmluZyA9IFV0aWxzLnRvU3RyaW5nLFxuICAgIG9iamVjdFR5cGUgPSAnW29iamVjdCBPYmplY3RdJztcblxuZnVuY3Rpb24gSGFuZGxlYmFyc0Vudmlyb25tZW50KGhlbHBlcnMsIHBhcnRpYWxzKSB7XG4gIHRoaXMuaGVscGVycyA9IGhlbHBlcnMgfHwge307XG4gIHRoaXMucGFydGlhbHMgPSBwYXJ0aWFscyB8fCB7fTtcblxuICByZWdpc3RlckRlZmF1bHRIZWxwZXJzKHRoaXMpO1xufVxuXG5leHBvcnRzLkhhbmRsZWJhcnNFbnZpcm9ubWVudCA9IEhhbmRsZWJhcnNFbnZpcm9ubWVudDtIYW5kbGViYXJzRW52aXJvbm1lbnQucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogSGFuZGxlYmFyc0Vudmlyb25tZW50LFxuXG4gIGxvZ2dlcjogbG9nZ2VyLFxuICBsb2c6IGxvZyxcblxuICByZWdpc3RlckhlbHBlcjogZnVuY3Rpb24obmFtZSwgZm4sIGludmVyc2UpIHtcbiAgICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgICAgaWYgKGludmVyc2UgfHwgZm4pIHsgdGhyb3cgbmV3IEV4Y2VwdGlvbignQXJnIG5vdCBzdXBwb3J0ZWQgd2l0aCBtdWx0aXBsZSBoZWxwZXJzJyk7IH1cbiAgICAgIFV0aWxzLmV4dGVuZCh0aGlzLmhlbHBlcnMsIG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaW52ZXJzZSkgeyBmbi5ub3QgPSBpbnZlcnNlOyB9XG4gICAgICB0aGlzLmhlbHBlcnNbbmFtZV0gPSBmbjtcbiAgICB9XG4gIH0sXG5cbiAgcmVnaXN0ZXJQYXJ0aWFsOiBmdW5jdGlvbihuYW1lLCBzdHIpIHtcbiAgICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgICAgVXRpbHMuZXh0ZW5kKHRoaXMucGFydGlhbHMsICBuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wYXJ0aWFsc1tuYW1lXSA9IHN0cjtcbiAgICB9XG4gIH1cbn07XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyRGVmYXVsdEhlbHBlcnMoaW5zdGFuY2UpIHtcbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbihhcmcpIHtcbiAgICBpZihhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKFwiTWlzc2luZyBoZWxwZXI6ICdcIiArIGFyZyArIFwiJ1wiKTtcbiAgICB9XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdibG9ja0hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgdmFyIGludmVyc2UgPSBvcHRpb25zLmludmVyc2UgfHwgZnVuY3Rpb24oKSB7fSwgZm4gPSBvcHRpb25zLmZuO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oY29udGV4dCkpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gICAgaWYoY29udGV4dCA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIGZuKHRoaXMpO1xuICAgIH0gZWxzZSBpZihjb250ZXh0ID09PSBmYWxzZSB8fCBjb250ZXh0ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheShjb250ZXh0KSkge1xuICAgICAgaWYoY29udGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiBpbnN0YW5jZS5oZWxwZXJzLmVhY2goY29udGV4dCwgb3B0aW9ucyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZuKGNvbnRleHQpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2VhY2gnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgdmFyIGZuID0gb3B0aW9ucy5mbiwgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZTtcbiAgICB2YXIgaSA9IDAsIHJldCA9IFwiXCIsIGRhdGE7XG5cbiAgICBpZiAoaXNGdW5jdGlvbihjb250ZXh0KSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgICBpZiAob3B0aW9ucy5kYXRhKSB7XG4gICAgICBkYXRhID0gY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgICB9XG5cbiAgICBpZihjb250ZXh0ICYmIHR5cGVvZiBjb250ZXh0ID09PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKGlzQXJyYXkoY29udGV4dCkpIHtcbiAgICAgICAgZm9yKHZhciBqID0gY29udGV4dC5sZW5ndGg7IGk8ajsgaSsrKSB7XG4gICAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgIGRhdGEuaW5kZXggPSBpO1xuICAgICAgICAgICAgZGF0YS5maXJzdCA9IChpID09PSAwKTtcbiAgICAgICAgICAgIGRhdGEubGFzdCAgPSAoaSA9PT0gKGNvbnRleHQubGVuZ3RoLTEpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0ID0gcmV0ICsgZm4oY29udGV4dFtpXSwgeyBkYXRhOiBkYXRhIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3IodmFyIGtleSBpbiBjb250ZXh0KSB7XG4gICAgICAgICAgaWYoY29udGV4dC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICBpZihkYXRhKSB7IFxuICAgICAgICAgICAgICBkYXRhLmtleSA9IGtleTsgXG4gICAgICAgICAgICAgIGRhdGEuaW5kZXggPSBpO1xuICAgICAgICAgICAgICBkYXRhLmZpcnN0ID0gKGkgPT09IDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0ID0gcmV0ICsgZm4oY29udGV4dFtrZXldLCB7ZGF0YTogZGF0YX0pO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmKGkgPT09IDApe1xuICAgICAgcmV0ID0gaW52ZXJzZSh0aGlzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0O1xuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignaWYnLCBmdW5jdGlvbihjb25kaXRpb25hbCwgb3B0aW9ucykge1xuICAgIGlmIChpc0Z1bmN0aW9uKGNvbmRpdGlvbmFsKSkgeyBjb25kaXRpb25hbCA9IGNvbmRpdGlvbmFsLmNhbGwodGhpcyk7IH1cblxuICAgIC8vIERlZmF1bHQgYmVoYXZpb3IgaXMgdG8gcmVuZGVyIHRoZSBwb3NpdGl2ZSBwYXRoIGlmIHRoZSB2YWx1ZSBpcyB0cnV0aHkgYW5kIG5vdCBlbXB0eS5cbiAgICAvLyBUaGUgYGluY2x1ZGVaZXJvYCBvcHRpb24gbWF5IGJlIHNldCB0byB0cmVhdCB0aGUgY29uZHRpb25hbCBhcyBwdXJlbHkgbm90IGVtcHR5IGJhc2VkIG9uIHRoZVxuICAgIC8vIGJlaGF2aW9yIG9mIGlzRW1wdHkuIEVmZmVjdGl2ZWx5IHRoaXMgZGV0ZXJtaW5lcyBpZiAwIGlzIGhhbmRsZWQgYnkgdGhlIHBvc2l0aXZlIHBhdGggb3IgbmVnYXRpdmUuXG4gICAgaWYgKCghb3B0aW9ucy5oYXNoLmluY2x1ZGVaZXJvICYmICFjb25kaXRpb25hbCkgfHwgVXRpbHMuaXNFbXB0eShjb25kaXRpb25hbCkpIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ3VubGVzcycsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIGluc3RhbmNlLmhlbHBlcnNbJ2lmJ10uY2FsbCh0aGlzLCBjb25kaXRpb25hbCwge2ZuOiBvcHRpb25zLmludmVyc2UsIGludmVyc2U6IG9wdGlvbnMuZm4sIGhhc2g6IG9wdGlvbnMuaGFzaH0pO1xuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignd2l0aCcsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBpZiAoaXNGdW5jdGlvbihjb250ZXh0KSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgICBpZiAoIVV0aWxzLmlzRW1wdHkoY29udGV4dCkpIHJldHVybiBvcHRpb25zLmZuKGNvbnRleHQpO1xuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignbG9nJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgIHZhciBsZXZlbCA9IG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmRhdGEubGV2ZWwgIT0gbnVsbCA/IHBhcnNlSW50KG9wdGlvbnMuZGF0YS5sZXZlbCwgMTApIDogMTtcbiAgICBpbnN0YW5jZS5sb2cobGV2ZWwsIGNvbnRleHQpO1xuICB9KTtcbn1cblxudmFyIGxvZ2dlciA9IHtcbiAgbWV0aG9kTWFwOiB7IDA6ICdkZWJ1ZycsIDE6ICdpbmZvJywgMjogJ3dhcm4nLCAzOiAnZXJyb3InIH0sXG5cbiAgLy8gU3RhdGUgZW51bVxuICBERUJVRzogMCxcbiAgSU5GTzogMSxcbiAgV0FSTjogMixcbiAgRVJST1I6IDMsXG4gIGxldmVsOiAzLFxuXG4gIC8vIGNhbiBiZSBvdmVycmlkZGVuIGluIHRoZSBob3N0IGVudmlyb25tZW50XG4gIGxvZzogZnVuY3Rpb24obGV2ZWwsIG9iaikge1xuICAgIGlmIChsb2dnZXIubGV2ZWwgPD0gbGV2ZWwpIHtcbiAgICAgIHZhciBtZXRob2QgPSBsb2dnZXIubWV0aG9kTWFwW2xldmVsXTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgY29uc29sZVttZXRob2RdKSB7XG4gICAgICAgIGNvbnNvbGVbbWV0aG9kXS5jYWxsKGNvbnNvbGUsIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuZXhwb3J0cy5sb2dnZXIgPSBsb2dnZXI7XG5mdW5jdGlvbiBsb2cobGV2ZWwsIG9iaikgeyBsb2dnZXIubG9nKGxldmVsLCBvYmopOyB9XG5cbmV4cG9ydHMubG9nID0gbG9nO3ZhciBjcmVhdGVGcmFtZSA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICB2YXIgb2JqID0ge307XG4gIFV0aWxzLmV4dGVuZChvYmosIG9iamVjdCk7XG4gIHJldHVybiBvYmo7XG59O1xuZXhwb3J0cy5jcmVhdGVGcmFtZSA9IGNyZWF0ZUZyYW1lOyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgZXJyb3JQcm9wcyA9IFsnZGVzY3JpcHRpb24nLCAnZmlsZU5hbWUnLCAnbGluZU51bWJlcicsICdtZXNzYWdlJywgJ25hbWUnLCAnbnVtYmVyJywgJ3N0YWNrJ107XG5cbmZ1bmN0aW9uIEV4Y2VwdGlvbihtZXNzYWdlLCBub2RlKSB7XG4gIHZhciBsaW5lO1xuICBpZiAobm9kZSAmJiBub2RlLmZpcnN0TGluZSkge1xuICAgIGxpbmUgPSBub2RlLmZpcnN0TGluZTtcblxuICAgIG1lc3NhZ2UgKz0gJyAtICcgKyBsaW5lICsgJzonICsgbm9kZS5maXJzdENvbHVtbjtcbiAgfVxuXG4gIHZhciB0bXAgPSBFcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IuY2FsbCh0aGlzLCBtZXNzYWdlKTtcblxuICAvLyBVbmZvcnR1bmF0ZWx5IGVycm9ycyBhcmUgbm90IGVudW1lcmFibGUgaW4gQ2hyb21lIChhdCBsZWFzdCksIHNvIGBmb3IgcHJvcCBpbiB0bXBgIGRvZXNuJ3Qgd29yay5cbiAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgZXJyb3JQcm9wcy5sZW5ndGg7IGlkeCsrKSB7XG4gICAgdGhpc1tlcnJvclByb3BzW2lkeF1dID0gdG1wW2Vycm9yUHJvcHNbaWR4XV07XG4gIH1cblxuICBpZiAobGluZSkge1xuICAgIHRoaXMubGluZU51bWJlciA9IGxpbmU7XG4gICAgdGhpcy5jb2x1bW4gPSBub2RlLmZpcnN0Q29sdW1uO1xuICB9XG59XG5cbkV4Y2VwdGlvbi5wcm90b3R5cGUgPSBuZXcgRXJyb3IoKTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBFeGNlcHRpb247IiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgVXRpbHMgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcbnZhciBFeGNlcHRpb24gPSByZXF1aXJlKFwiLi9leGNlcHRpb25cIilbXCJkZWZhdWx0XCJdO1xudmFyIENPTVBJTEVSX1JFVklTSU9OID0gcmVxdWlyZShcIi4vYmFzZVwiKS5DT01QSUxFUl9SRVZJU0lPTjtcbnZhciBSRVZJU0lPTl9DSEFOR0VTID0gcmVxdWlyZShcIi4vYmFzZVwiKS5SRVZJU0lPTl9DSEFOR0VTO1xuXG5mdW5jdGlvbiBjaGVja1JldmlzaW9uKGNvbXBpbGVySW5mbykge1xuICB2YXIgY29tcGlsZXJSZXZpc2lvbiA9IGNvbXBpbGVySW5mbyAmJiBjb21waWxlckluZm9bMF0gfHwgMSxcbiAgICAgIGN1cnJlbnRSZXZpc2lvbiA9IENPTVBJTEVSX1JFVklTSU9OO1xuXG4gIGlmIChjb21waWxlclJldmlzaW9uICE9PSBjdXJyZW50UmV2aXNpb24pIHtcbiAgICBpZiAoY29tcGlsZXJSZXZpc2lvbiA8IGN1cnJlbnRSZXZpc2lvbikge1xuICAgICAgdmFyIHJ1bnRpbWVWZXJzaW9ucyA9IFJFVklTSU9OX0NIQU5HRVNbY3VycmVudFJldmlzaW9uXSxcbiAgICAgICAgICBjb21waWxlclZlcnNpb25zID0gUkVWSVNJT05fQ0hBTkdFU1tjb21waWxlclJldmlzaW9uXTtcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oXCJUZW1wbGF0ZSB3YXMgcHJlY29tcGlsZWQgd2l0aCBhbiBvbGRlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiBcIitcbiAgICAgICAgICAgIFwiUGxlYXNlIHVwZGF0ZSB5b3VyIHByZWNvbXBpbGVyIHRvIGEgbmV3ZXIgdmVyc2lvbiAoXCIrcnVudGltZVZlcnNpb25zK1wiKSBvciBkb3duZ3JhZGUgeW91ciBydW50aW1lIHRvIGFuIG9sZGVyIHZlcnNpb24gKFwiK2NvbXBpbGVyVmVyc2lvbnMrXCIpLlwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVXNlIHRoZSBlbWJlZGRlZCB2ZXJzaW9uIGluZm8gc2luY2UgdGhlIHJ1bnRpbWUgZG9lc24ndCBrbm93IGFib3V0IHRoaXMgcmV2aXNpb24geWV0XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKFwiVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYSBuZXdlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiBcIitcbiAgICAgICAgICAgIFwiUGxlYXNlIHVwZGF0ZSB5b3VyIHJ1bnRpbWUgdG8gYSBuZXdlciB2ZXJzaW9uIChcIitjb21waWxlckluZm9bMV0rXCIpLlwiKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0cy5jaGVja1JldmlzaW9uID0gY2hlY2tSZXZpc2lvbjsvLyBUT0RPOiBSZW1vdmUgdGhpcyBsaW5lIGFuZCBicmVhayB1cCBjb21waWxlUGFydGlhbFxuXG5mdW5jdGlvbiB0ZW1wbGF0ZSh0ZW1wbGF0ZVNwZWMsIGVudikge1xuICBpZiAoIWVudikge1xuICAgIHRocm93IG5ldyBFeGNlcHRpb24oXCJObyBlbnZpcm9ubWVudCBwYXNzZWQgdG8gdGVtcGxhdGVcIik7XG4gIH1cblxuICAvLyBOb3RlOiBVc2luZyBlbnYuVk0gcmVmZXJlbmNlcyByYXRoZXIgdGhhbiBsb2NhbCB2YXIgcmVmZXJlbmNlcyB0aHJvdWdob3V0IHRoaXMgc2VjdGlvbiB0byBhbGxvd1xuICAvLyBmb3IgZXh0ZXJuYWwgdXNlcnMgdG8gb3ZlcnJpZGUgdGhlc2UgYXMgcHN1ZWRvLXN1cHBvcnRlZCBBUElzLlxuICB2YXIgaW52b2tlUGFydGlhbFdyYXBwZXIgPSBmdW5jdGlvbihwYXJ0aWFsLCBuYW1lLCBjb250ZXh0LCBoZWxwZXJzLCBwYXJ0aWFscywgZGF0YSkge1xuICAgIHZhciByZXN1bHQgPSBlbnYuVk0uaW52b2tlUGFydGlhbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmIChyZXN1bHQgIT0gbnVsbCkgeyByZXR1cm4gcmVzdWx0OyB9XG5cbiAgICBpZiAoZW52LmNvbXBpbGUpIHtcbiAgICAgIHZhciBvcHRpb25zID0geyBoZWxwZXJzOiBoZWxwZXJzLCBwYXJ0aWFsczogcGFydGlhbHMsIGRhdGE6IGRhdGEgfTtcbiAgICAgIHBhcnRpYWxzW25hbWVdID0gZW52LmNvbXBpbGUocGFydGlhbCwgeyBkYXRhOiBkYXRhICE9PSB1bmRlZmluZWQgfSwgZW52KTtcbiAgICAgIHJldHVybiBwYXJ0aWFsc1tuYW1lXShjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbihcIlRoZSBwYXJ0aWFsIFwiICsgbmFtZSArIFwiIGNvdWxkIG5vdCBiZSBjb21waWxlZCB3aGVuIHJ1bm5pbmcgaW4gcnVudGltZS1vbmx5IG1vZGVcIik7XG4gICAgfVxuICB9O1xuXG4gIC8vIEp1c3QgYWRkIHdhdGVyXG4gIHZhciBjb250YWluZXIgPSB7XG4gICAgZXNjYXBlRXhwcmVzc2lvbjogVXRpbHMuZXNjYXBlRXhwcmVzc2lvbixcbiAgICBpbnZva2VQYXJ0aWFsOiBpbnZva2VQYXJ0aWFsV3JhcHBlcixcbiAgICBwcm9ncmFtczogW10sXG4gICAgcHJvZ3JhbTogZnVuY3Rpb24oaSwgZm4sIGRhdGEpIHtcbiAgICAgIHZhciBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV07XG4gICAgICBpZihkYXRhKSB7XG4gICAgICAgIHByb2dyYW1XcmFwcGVyID0gcHJvZ3JhbShpLCBmbiwgZGF0YSk7XG4gICAgICB9IGVsc2UgaWYgKCFwcm9ncmFtV3JhcHBlcikge1xuICAgICAgICBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV0gPSBwcm9ncmFtKGksIGZuKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9ncmFtV3JhcHBlcjtcbiAgICB9LFxuICAgIG1lcmdlOiBmdW5jdGlvbihwYXJhbSwgY29tbW9uKSB7XG4gICAgICB2YXIgcmV0ID0gcGFyYW0gfHwgY29tbW9uO1xuXG4gICAgICBpZiAocGFyYW0gJiYgY29tbW9uICYmIChwYXJhbSAhPT0gY29tbW9uKSkge1xuICAgICAgICByZXQgPSB7fTtcbiAgICAgICAgVXRpbHMuZXh0ZW5kKHJldCwgY29tbW9uKTtcbiAgICAgICAgVXRpbHMuZXh0ZW5kKHJldCwgcGFyYW0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJldDtcbiAgICB9LFxuICAgIHByb2dyYW1XaXRoRGVwdGg6IGVudi5WTS5wcm9ncmFtV2l0aERlcHRoLFxuICAgIG5vb3A6IGVudi5WTS5ub29wLFxuICAgIGNvbXBpbGVySW5mbzogbnVsbFxuICB9O1xuXG4gIHJldHVybiBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdmFyIG5hbWVzcGFjZSA9IG9wdGlvbnMucGFydGlhbCA/IG9wdGlvbnMgOiBlbnYsXG4gICAgICAgIGhlbHBlcnMsXG4gICAgICAgIHBhcnRpYWxzO1xuXG4gICAgaWYgKCFvcHRpb25zLnBhcnRpYWwpIHtcbiAgICAgIGhlbHBlcnMgPSBvcHRpb25zLmhlbHBlcnM7XG4gICAgICBwYXJ0aWFscyA9IG9wdGlvbnMucGFydGlhbHM7XG4gICAgfVxuICAgIHZhciByZXN1bHQgPSB0ZW1wbGF0ZVNwZWMuY2FsbChcbiAgICAgICAgICBjb250YWluZXIsXG4gICAgICAgICAgbmFtZXNwYWNlLCBjb250ZXh0LFxuICAgICAgICAgIGhlbHBlcnMsXG4gICAgICAgICAgcGFydGlhbHMsXG4gICAgICAgICAgb3B0aW9ucy5kYXRhKTtcblxuICAgIGlmICghb3B0aW9ucy5wYXJ0aWFsKSB7XG4gICAgICBlbnYuVk0uY2hlY2tSZXZpc2lvbihjb250YWluZXIuY29tcGlsZXJJbmZvKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufVxuXG5leHBvcnRzLnRlbXBsYXRlID0gdGVtcGxhdGU7ZnVuY3Rpb24gcHJvZ3JhbVdpdGhEZXB0aChpLCBmbiwgZGF0YSAvKiwgJGRlcHRoICovKSB7XG4gIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAzKTtcblxuICB2YXIgcHJvZyA9IGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBbY29udGV4dCwgb3B0aW9ucy5kYXRhIHx8IGRhdGFdLmNvbmNhdChhcmdzKSk7XG4gIH07XG4gIHByb2cucHJvZ3JhbSA9IGk7XG4gIHByb2cuZGVwdGggPSBhcmdzLmxlbmd0aDtcbiAgcmV0dXJuIHByb2c7XG59XG5cbmV4cG9ydHMucHJvZ3JhbVdpdGhEZXB0aCA9IHByb2dyYW1XaXRoRGVwdGg7ZnVuY3Rpb24gcHJvZ3JhbShpLCBmbiwgZGF0YSkge1xuICB2YXIgcHJvZyA9IGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHJldHVybiBmbihjb250ZXh0LCBvcHRpb25zLmRhdGEgfHwgZGF0YSk7XG4gIH07XG4gIHByb2cucHJvZ3JhbSA9IGk7XG4gIHByb2cuZGVwdGggPSAwO1xuICByZXR1cm4gcHJvZztcbn1cblxuZXhwb3J0cy5wcm9ncmFtID0gcHJvZ3JhbTtmdW5jdGlvbiBpbnZva2VQYXJ0aWFsKHBhcnRpYWwsIG5hbWUsIGNvbnRleHQsIGhlbHBlcnMsIHBhcnRpYWxzLCBkYXRhKSB7XG4gIHZhciBvcHRpb25zID0geyBwYXJ0aWFsOiB0cnVlLCBoZWxwZXJzOiBoZWxwZXJzLCBwYXJ0aWFsczogcGFydGlhbHMsIGRhdGE6IGRhdGEgfTtcblxuICBpZihwYXJ0aWFsID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKFwiVGhlIHBhcnRpYWwgXCIgKyBuYW1lICsgXCIgY291bGQgbm90IGJlIGZvdW5kXCIpO1xuICB9IGVsc2UgaWYocGFydGlhbCBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgcmV0dXJuIHBhcnRpYWwoY29udGV4dCwgb3B0aW9ucyk7XG4gIH1cbn1cblxuZXhwb3J0cy5pbnZva2VQYXJ0aWFsID0gaW52b2tlUGFydGlhbDtmdW5jdGlvbiBub29wKCkgeyByZXR1cm4gXCJcIjsgfVxuXG5leHBvcnRzLm5vb3AgPSBub29wOyIsIlwidXNlIHN0cmljdFwiO1xuLy8gQnVpbGQgb3V0IG91ciBiYXNpYyBTYWZlU3RyaW5nIHR5cGVcbmZ1bmN0aW9uIFNhZmVTdHJpbmcoc3RyaW5nKSB7XG4gIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xufVxuXG5TYWZlU3RyaW5nLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gXCJcIiArIHRoaXMuc3RyaW5nO1xufTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBTYWZlU3RyaW5nOyIsIlwidXNlIHN0cmljdFwiO1xuLypqc2hpbnQgLVcwMDQgKi9cbnZhciBTYWZlU3RyaW5nID0gcmVxdWlyZShcIi4vc2FmZS1zdHJpbmdcIilbXCJkZWZhdWx0XCJdO1xuXG52YXIgZXNjYXBlID0ge1xuICBcIiZcIjogXCImYW1wO1wiLFxuICBcIjxcIjogXCImbHQ7XCIsXG4gIFwiPlwiOiBcIiZndDtcIixcbiAgJ1wiJzogXCImcXVvdDtcIixcbiAgXCInXCI6IFwiJiN4Mjc7XCIsXG4gIFwiYFwiOiBcIiYjeDYwO1wiXG59O1xuXG52YXIgYmFkQ2hhcnMgPSAvWyY8PlwiJ2BdL2c7XG52YXIgcG9zc2libGUgPSAvWyY8PlwiJ2BdLztcblxuZnVuY3Rpb24gZXNjYXBlQ2hhcihjaHIpIHtcbiAgcmV0dXJuIGVzY2FwZVtjaHJdIHx8IFwiJmFtcDtcIjtcbn1cblxuZnVuY3Rpb24gZXh0ZW5kKG9iaiwgdmFsdWUpIHtcbiAgZm9yKHZhciBrZXkgaW4gdmFsdWUpIHtcbiAgICBpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIGtleSkpIHtcbiAgICAgIG9ialtrZXldID0gdmFsdWVba2V5XTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0cy5leHRlbmQgPSBleHRlbmQ7dmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbmV4cG9ydHMudG9TdHJpbmcgPSB0b1N0cmluZztcbi8vIFNvdXJjZWQgZnJvbSBsb2Rhc2hcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9iZXN0aWVqcy9sb2Rhc2gvYmxvYi9tYXN0ZXIvTElDRU5TRS50eHRcbnZhciBpc0Z1bmN0aW9uID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJztcbn07XG4vLyBmYWxsYmFjayBmb3Igb2xkZXIgdmVyc2lvbnMgb2YgQ2hyb21lIGFuZCBTYWZhcmlcbmlmIChpc0Z1bmN0aW9uKC94LykpIHtcbiAgaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbiAgfTtcbn1cbnZhciBpc0Z1bmN0aW9uO1xuZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpID8gdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEFycmF5XScgOiBmYWxzZTtcbn07XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBlc2NhcGVFeHByZXNzaW9uKHN0cmluZykge1xuICAvLyBkb24ndCBlc2NhcGUgU2FmZVN0cmluZ3MsIHNpbmNlIHRoZXkncmUgYWxyZWFkeSBzYWZlXG4gIGlmIChzdHJpbmcgaW5zdGFuY2VvZiBTYWZlU3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy50b1N0cmluZygpO1xuICB9IGVsc2UgaWYgKCFzdHJpbmcgJiYgc3RyaW5nICE9PSAwKSB7XG4gICAgcmV0dXJuIFwiXCI7XG4gIH1cblxuICAvLyBGb3JjZSBhIHN0cmluZyBjb252ZXJzaW9uIGFzIHRoaXMgd2lsbCBiZSBkb25lIGJ5IHRoZSBhcHBlbmQgcmVnYXJkbGVzcyBhbmRcbiAgLy8gdGhlIHJlZ2V4IHRlc3Qgd2lsbCBkbyB0aGlzIHRyYW5zcGFyZW50bHkgYmVoaW5kIHRoZSBzY2VuZXMsIGNhdXNpbmcgaXNzdWVzIGlmXG4gIC8vIGFuIG9iamVjdCdzIHRvIHN0cmluZyBoYXMgZXNjYXBlZCBjaGFyYWN0ZXJzIGluIGl0LlxuICBzdHJpbmcgPSBcIlwiICsgc3RyaW5nO1xuXG4gIGlmKCFwb3NzaWJsZS50ZXN0KHN0cmluZykpIHsgcmV0dXJuIHN0cmluZzsgfVxuICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoYmFkQ2hhcnMsIGVzY2FwZUNoYXIpO1xufVxuXG5leHBvcnRzLmVzY2FwZUV4cHJlc3Npb24gPSBlc2NhcGVFeHByZXNzaW9uO2Z1bmN0aW9uIGlzRW1wdHkodmFsdWUpIHtcbiAgaWYgKCF2YWx1ZSAmJiB2YWx1ZSAhPT0gMCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5leHBvcnRzLmlzRW1wdHkgPSBpc0VtcHR5OyIsIi8vIENyZWF0ZSBhIHNpbXBsZSBwYXRoIGFsaWFzIHRvIGFsbG93IGJyb3dzZXJpZnkgdG8gcmVzb2x2ZVxuLy8gdGhlIHJ1bnRpbWUgb24gYSBzdXBwb3J0ZWQgcGF0aC5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9kaXN0L2Nqcy9oYW5kbGViYXJzLnJ1bnRpbWUnKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImhhbmRsZWJhcnMvcnVudGltZVwiKVtcImRlZmF1bHRcIl07XG4iXX0=
