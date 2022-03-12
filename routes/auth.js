const express = require('express');
const {getUid } = require('./middlewares');
const logger = require('../logger');
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
                logger.info(`${exUser.name} is not new user`);
                return res.status(401).json({ state : 'fail', message:`${exUser.name} is not new user`});
            } else {
                logger.info(`${name} is new user`);
                const newUser = await User.create({
                    name,
                    uid,
                    point: 0,
                });
                logger.info(newUser);
                return res.json({ state : 'success', message:'welcome'});
            }
        }
        return res.status(400).json({state:'fail', message : "empty uid in body" });
    } catch (error) {
        logger.error(error);
        return next(error);
    }
});


//로그인 시 데이터베이스 확인
router.post('/login', getUid, async (req, res, next) => {
    try{
        const {uid} = req;
        if (uid !== ''){
            const exUser = await User.findOne({ where: {uid: uid} });
            logger.info(exUser);
            // 유저 데이터베이스가 있으면 true 반환
            if (exUser) {
                logger.info(`login user: ${exUser.name}`);
                return res.json({state:'success', existDB : 'true' });
            } else {
                logger.info(`${exUser} is not our user`);
                return res.status(400).json({state:'false', message:`${exUser} is not our user`});
            }
        }
        return res.status(400).json({state:'fail', message : "empty uid in body" });
    } catch(error) {
        logger.error(error);
        return next(error);
    }    
});


module.exports = router;