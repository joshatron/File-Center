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

function passwordFromHeader(authHeader) {
    if(authHeader !== undefined) {
        let password = authHeader.split(" ")[1];
        password = Buffer.from(password, 'base64').toString('utf8');
        password = password.split(":")[1];

        return password;
    } else {
        return "";
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
exports.passwordFromHeader = passwordFromHeader;
exports.checkWebAuthenticated = checkWebAuthenticated;
exports.checkAdminAuthenticated = checkAdminAuthenticated;
exports.getWebToken = getWebToken;
exports.getAdminToken = getAdminToken;