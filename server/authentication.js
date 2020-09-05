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

function updateWebAccessPassword(webAccessPass) {
    webAccessPassword = webAccessPass;
    webAccessToken = crypto.randomBytes(32).toString("hex");
}

function updateAdminPassword(adminPass) {
    adminPassword = adminPass;
    adminToken = crypto.randomBytes(32).toString("hex");
}

function usernameFromHeader(authHeader) {
    return decodedAuthHeader(authHeader).split(":")[1];
}

function passwordFromHeader(authHeader) {
    return decodedAuthHeader(authHeader).split(":")[1];
}

function decodedAuthHeader(authHeader) {
    if(authHeader !== undefined) {
        let decoded = authHeader.split(" ")[1];
        decoded = Buffer.from(password, 'base64').toString('utf8');

        return decoded;
    } else {
        return ":";
    }
}

function checkWebAuthenticated(password, token) {
    return token === webAccessToken || token === adminToken ||
           password === webAccessPassword || password === adminPassword ||
           webAccessPassword === '';
}

function checkAdminAuthenticated(password, token) {
    return adminPassword !== '' && 
           (token === adminToken || password === adminPassword);
}

function getWebToken() {
    return webAccessToken;
}

function getAdminToken() {
    return adminToken;
}

exports.initialize = initialize;
exports.updateWebAccessPassword = updateWebAccessPassword;
exports.updateAdminPassword = updateAdminPassword;
exports.usernameFromHeader = usernameFromHeader;
exports.passwordFromHeader = passwordFromHeader;
exports.checkWebAuthenticated = checkWebAuthenticated;
exports.checkAdminAuthenticated = checkAdminAuthenticated;
exports.getWebToken = getWebToken;
exports.getAdminToken = getAdminToken;