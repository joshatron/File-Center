'use strict';

var webAccessPassword;
var adminPassword;

function initialize(webAccessPass, adminPass) {
    this.updateWebAccessPassword(webAccessPass);
    this.updateAdminPassword(adminPass);
}

function updateWebAccessPassword(webAccessPass) {
    webAccessPassword = webAccessPass;
}

function updateAdminPassword(adminPass) {
    adminPassword = adminPass;
}

function usernameFromHeader(authHeader) {
    return decodedAuthHeader(authHeader).split(":")[0];
}

function passwordFromHeader(authHeader) {
    return decodedAuthHeader(authHeader).split(":")[1];
}

function decodedAuthHeader(authHeader) {
    if(authHeader !== undefined) {
        let decoded = authHeader.split(" ")[1];
        decoded = Buffer.from(decoded, 'base64').toString('utf8');

        return decoded;
    } else {
        return ":";
    }
}

function checkWebAuthenticated(request) {
    let password = passwordFromHeader(request.header("Authorization"));
    return request.session.user === 'web' || request.session.user === 'admin' ||
           password === webAccessPassword || (adminPassword !== '' && password === adminPassword) ||
           webAccessPassword === '';
}

function checkAdminAuthenticated(request) {
    let password = passwordFromHeader(request.header("Authorization"));
    return adminPassword !== '' && (request.session.user === 'admin' || password === adminPassword);
}


exports.initialize = initialize;
exports.updateWebAccessPassword = updateWebAccessPassword;
exports.updateAdminPassword = updateAdminPassword;
exports.usernameFromHeader = usernameFromHeader;
exports.passwordFromHeader = passwordFromHeader;
exports.checkWebAuthenticated = checkWebAuthenticated;
exports.checkAdminAuthenticated = checkAdminAuthenticated;