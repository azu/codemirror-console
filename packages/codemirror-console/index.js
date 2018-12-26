/**
 * Created by azu on 2014/06/10.
 * LICENSE : MIT
 */
"use strict";
var MirrorConsole = require("./lib/mirror-console");
var content = document.querySelector(".content");
var editor = new MirrorConsole();
editor.setText(content.textContent);
editor.swapWithElement(content);

document.getElementById("eval").addEventListener("click", function () {
    var consoleMock = {
        log: function (arg) {
            function line(text) {
                var div = document.createElement("div");
                div.appendChild(document.createTextNode(text));
                return div;
            }

            document.getElementById("output").appendChild(line(arg));
        }
    }
    editor.runInContext({ console: consoleMock },function (error, result) {
        if (error) {
            console.error(error);
        }
    });
});