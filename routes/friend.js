//친추, 겨루기 등등
const express = require('express');
const {getUid} = require('./middlewares');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const User = require('../models/user');
const Friends = require('../models/friend');


const router = express.Router();

//유저 검색(이름 검색)
router.get('/:keyword/search', async (req, res, next) => {
    try{
        const searchResult =  await User.findAll({where: { name:req.params.keyword }});
        if (searchResult) {
            return res.json({state: 'success', result: searchResult});
        }
        return res.json({state: 'fail', message:`cant found user ${req.params.keyword}`});
        
    }catch(error) {
        console.error(error);
        next(error);
    }
});
//친구신청
router.post('/:id/request', getUid, async (req, res, next) => {
    try{
        const requestUser = await User.findOne({where: { uid: req.uid}});
        if(requestUser){
            const acceptCheck = await Friends.findOne({where:{acceptId:requestUser.id, requestId: req.params.id}});
            if(acceptCheck){    //이미 요청이 와있는경우
                acceptCheck.update({state:1});
                return res.send(acceptCheck);
            }
            await requestUser.addAcceptUser(parseInt(req.params.id));
            return res.json({state:'success', result: req.params.id});
        } else {
            return res.status(400).json({state:'fail', message:'cant found user(wrong uid)'});
        }
    } catch(error) {
        console.error(error);
        next(error);
    }
});
//친구 수락
router.post('/:id/accept', getUid, async (req, res, next) => {
    try {
        const user = await User.findOne({where: {uid: req.uid}});
        const friend = await Friends.update({state: 1},{ 
            where : { acceptId: user.id, requestId: req.params.id },
        });
        return res.json({state:'success', result:friend});
    } catch (error) {
        console.error(error);
        next(error);
    }
});
//친구 목록, 수락 대기중
router.get('/show', getUid, async (req, res, next) => {
    try {
        const user = await User.findOne({where: {uid: req.uid}});
        if(user){
            //친구 탐색
            var friends = await Friends.findAll({ 
                where : {
                    state: 1,
                    [Op.or]: [
                        {requestId: user.id}, 
                        {acceptId: user.id}
                    ]
                }
            });
            friends = friends.map(e => {
                return e['dataValues']['requestId'] ==user.id ? 
                    e['dataValues']['acceptId'] : e['dataValues']['requestId'];
            });            
            friends = friends.length ?
                await User.findAll({where: {id:{[Op.or]:friends}}}) : [];

            //신청받은 친구요청 탐색
            var acpt_wat = await Friends.findAll({ 
                attributes: ['requestId'],
                where : { acceptId: user.id, state:0 },
            })
            acpt_wat = acpt_wat.map(e => {
                return e['dataValues']['requestId'];
            });
            acpt_wat =  acpt_wat.length ?  
                await User.findAll({where: {id:{[Op.or]:acpt_wat}}}) : [];

            //신청한 친구요청 탐색
            var rqst_wat = await Friends.findAll({ 
                attributes: ['acceptId'],
                where : { requestId: user.id, state:0 },
            });
            rqst_wat = rqst_wat.map(e => {
                return e['dataValues']['acceptId'];
            });
            rqst_wat = rqst_wat.length ? 
                await User.findAll({where: {id:{[Op.or]:rqst_wat}}}) : [];
            return res.json({state: 'success', friends: friends, accept_waiting: acpt_wat, request_waiting: rqst_wat});
        }
        return res.status(400).json({state:'fail', message:'cant found user(wrong uid)'});
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;