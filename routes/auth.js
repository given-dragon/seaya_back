const express = require('express');
const { isLoggedIn, isNotLoggedIn, getUid } = require('./middlewares');

const User = require('../models/user');

const router = express.Router();

// 앱에서 회원가입 후 데이터베이스 생성
router.post('/join', getUid, async (req, res, next) => {
    try {
        const { name } = req.body;
        const uid = req.uid;
        if (uid !== ''){
            const exUser = await User.findOne({ where: {uid: uid} });
            // 유저 데이터베이스가 없으면 db생성
            if (exUser) {
                console.log(`${exUser.name} is not new user`);
                return res.status(400).json({ createDB : 'fail', name : name, uid: uid});
            } else {
                console.log(`${name} is new user`);
                const newUser = await User.create({
                    name,
                    uid,
                    point: 0,
                });
                console.log(newUser);
                return res.json({ createDB : 'success', name : name, uid: uid});
            }
        }
        return res.status(400).json({ error : "empty uid in body" });
    } catch (error) {
        console.error(error);
        return next(error);
    }
});


//로그인 시 데이터베이스 확인
router.post('/login', getUid, async (req, res, next) => {
    try{
        const {uid} = req;
        if (uid !== ''){
            const exUser = await User.findOne({ where: {uid: uid} });
            console.log(exUser);
            // 유저 데이터베이스가 있으면 true 반환
            if (exUser) {
                console.log(`login user: ${exUser.name}`);
                return res.json({ existDB : 'true' });
            } else {
                console.log(`${exUser} is not new user`);
                return res.status(400).json({ existDB : 'false' });
            }
        }
        return res.status(400).json({ error : "empty uid in body" });
    } catch(error) {
        console.error(error);
        return next(error);
    }    
});


module.exports = router;