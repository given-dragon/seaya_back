//친추, 겨루기 등등
const express = require('express');
const {getUid} = require('./middlewares');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const User = require('../models/user');
const Friends = require('../models/friend');
const Competition = require('../models/competition');

const router = express.Router();

//겨루기 목록 출력(진행중, 신청대기, 수락대기)
router.get('/', getUid, async (req, res, next) => {
    try {
        const user = await User.findOne({
            attributes:[],
            where: {uid: req.uid}, 
            include:[{
                model:User,
                as:'RequestUser',
                attributes:['id', 'name', 'point'],
            },{
                model:User,
                as:'AcceptUser',
                attributes:['id', 'name', 'point'],      
            }]
        });
        if(user){
            //친구 탐색
            let friends = [];
            var acceptWaiting = user.getDataValue('RequestUser');
            var requestWaiting = user.getDataValue('AcceptUser');

            //요청, 응답 대기 리스트에서 이미 친구가 된 상태만 다른 array로 이동
            requestWaiting.forEach((user, index) => {                
                if (user.getDataValue('Firend').getDataValue('state'))                    
                    friends.push(requestWaiting.splice(index,1)[0]);
            });
            acceptWaiting.forEach((user, index) => {                
                delete requestWaiting[index]['Firend'];
                if (user.getDataValue('Firend').getDataValue('state'))
                    friends.push(acceptWaiting.splice(index,1)[0]);                
            });
            return res.json({state: 'success', friends: friends, accept_waiting: acceptWaiting, request_waiting: requestWaiting});
        }
        return res.status(400).json({state:'fail', message:'cant found user(wrong uid)'});
    } catch (error) {
        console.error(error);
        next(error);
    }
});


//겨루기 신청
router.post('/:id/request', getUid, async (req, res, next) => {
    try{
        const requestUser = await User.findOne({where: {uid: req.uid}});
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
//겨루기 수락
router.post('/:id/accept', getUid, async (req, res, next) => {
    try {
        const user = await User.findOne({where: {uid: req.uid}});
        if(user){
            const friend = await Friends.update({state: 1},{ 
                where : { acceptId: user.id, requestId: req.params.id },
            });
            return res.json({state:'success', result:friend});
        }
        return res.status(400).json({state:'fail', message:'cant found user(wrong uid)'});
    } catch (error) {
        console.error(error);
        next(error);
    }
});


module.exports = router;