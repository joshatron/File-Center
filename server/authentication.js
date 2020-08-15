'use strict';

const crypto = require("crypto");

var webAccessPassword;
var webAccessToken;

var adminPassword;
var adminToken;

exports.initialize = function(webAccessPass, adminPass) {
    this.updateWebAccessPassword(webAccessPass);
    this.updateAdminPassword(adminPass);
}

exports.getWebAccessToken = function(webAccessPass) {
    if(webAccessPass === webAccessPassword) {
        return webAccessToken;
    }

    return "";
}

exports.getAdminToken = function(adminPass) {
    if(adminPass === adminPassword) {
        return adminToken;
    }

    return "";
}

exports.checkAuthorized = function(request) {
    let path = request.baseUrl;

    if(path.startsWith('/api/web') && webAccessPassword !== '') {
        return request.cookies['auth'] === adminToken || 
               request.cookies['auth'] === webAccessToken;
    } else if(path.startsWith('/api/admin')) {
        return adminPassword !== "" && request.cookies['auth'] === adminToken;
    }

    return true;
}

exports.checkWebAuthenticated = function(request) {
    return webAccessPassword === "" ||
           request.cookies['auth'] === adminToken || 
           request.cookies['auth'] === webAccessToken;
}

exports.checkAdminAuthenticated = function(request) {
    return request.cookies['auth'] === adminToken;
}

exports.updateWebAccessPassword = function(webAccessPass) {
    webAccessPassword = webAccessPass;
    webAccessToken = crypto.randomBytes(32).toString("hex");
}

exports.updateAdminPassword = function(adminPass) {
    adminPassword = adminPass;
    adminToken = crypto.randomBytes(32).toString("hex");
}