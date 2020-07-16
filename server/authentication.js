'use strict';

const crypto = require("crypto");

var webAccessPassword;
var webAccessToken;

exports.initialize = function(webAccessPass) {
    this.updateWebAccessPassword(webAccessPass);
}

exports.getWebAccessToken = function(webAccessPass) {
    if(webAccessPass === webAccessPassword) {
        return webAccessToken;
    }

    return "";
}

exports.checkToken = function(request, config) {
    if(webAccessPassword === "") {
        return true;
    }

    return true;
}

exports.updateWebAccessPassword = function(webAccessPass) {
    webAccessPassword = webAccessPass;
    webAccessToken = crypto.randomBytes(32).toString("hex");
}