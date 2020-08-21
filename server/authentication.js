'use strict';

const crypto = require("crypto");

var webAccessPassword;
var webAccessToken;

var adminPassword;
var adminToken;

function initialize(webAccessPass, adminPass) {
    this.updateWebAccessPassword(webAccessPass);
    this.updateAdminPassword(adminPass);
}

function getWebAccessToken(webAccessPass) {
    if(isWebAuthenticated(webAccessPass)) {
        return webAccessToken;
    }

    return "";
}

function isWebAuthenticated(webPass) {
    return webAccessPassword === webPass;
}

function getAdminToken(adminPass) {
    if(isAdminAuthenticated(adminPass)) {
        return adminToken;
    }

    return "";
}

function isAdminAuthenticated(adminPass) {
    return adminPassword === adminPass;
}

function checkAuthorized(request) {
    let path = request.baseUrl;
    let password = request.header("Authorization");
    if(password === undefined) {
        password = "";
    } else {
        password = password.split(" ")[1];
        password = Buffer.from(password, 'base64').toString('utf8');
        password = password.split(":")[1];
    }

    if(path.startsWith('/api/web') && webAccessPassword !== '') {
        return request.cookies['auth'] === adminToken || 
               request.cookies['auth'] === webAccessToken ||
               isWebAuthenticated(password) || isAdminAuthenticated(password);
    } else if(path.startsWith('/api/admin')) {
        return adminPassword !== "" && 
        (request.cookies['auth'] === adminToken || isAdminAuthenticated(password));
    }

    return true;
}

function checkWebAuthenticated(request) {
    return webAccessPassword === "" ||
           request.cookies['auth'] === adminToken || 
           request.cookies['auth'] === webAccessToken;
}

function checkAdminAuthenticated(request) {
    return request.cookies['auth'] === adminToken;
}

function updateWebAccessPassword(webAccessPass) {
    webAccessPassword = webAccessPass;
    webAccessToken = crypto.randomBytes(32).toString("hex");
}

function updateAdminPassword(adminPass) {
    adminPassword = adminPass;
    adminToken = crypto.randomBytes(32).toString("hex");
}

exports.initialize = initialize;
exports.getWebAccessToken = getWebAccessToken;
exports.getAdminToken = getAdminToken;
exports.checkAuthorized = checkAuthorized;
exports.checkWebAuthenticated = checkWebAuthenticated;
exports.checkAdminAuthenticated = checkAdminAuthenticated;
exports.updateWebAccessPassword = updateWebAccessPassword;
exports.updateAdminPassword = updateAdminPassword;