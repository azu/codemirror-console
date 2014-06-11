"use strict";
var attachToElement = require("./components/mirror-console-component");
var content = document.querySelector(".content");
attachToElement(content, content.textContent);
attachToElement.setUserContext({
    secret: "hi mi tsu"
});