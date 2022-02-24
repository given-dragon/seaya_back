const express = require('express');
const admin = require('firebase-admin');
//jwt나 firebase 로그인 상태 점검

exports.isLoggedIn = async (req, res, next) => {  
    return next(); 
}

exports.isNotLoggedIn = async (req, res, next) => {    
    return next();    
}

// 앱에서 토큰을 받아 firebase에서 uid를 가져온다.
exports.getUid = async (req, res, next) => {
    await admin.auth()
        .verifyIdToken(req.headers['authorization'])
        .then((decodedToken) => {            
            // console.log(decodedToken.uid);
            const uid = decodedToken.uid;
            req.uid = uid;    
            console.log(req.uid);
        })
        .catch((error) => {
            console.error(error);
            next(error);
        });
    
    return next();
}