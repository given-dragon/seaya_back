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
                as:'CptRequestUser',
                attributes:['id', 'name'],
            },{
                model:User,
                as:'CptAcceptuser',
                attributes:['id', 'name'],      
            }]
        });
        // console.log(user);
        if(user){
            //경쟁자 탐색
            let competitors = [];
            var acceptWaiting = user.getDataValue('CptRequestUser');    //내가 수락해야하는 요청(겨루기 신청한 사람의 정보)
            var requestWaiting = user.getDataValue('CptAcceptuser');    //내가 보낸 요청(받아야하는 사람의 정보)

            //요청, 응답 대기 리스트에서 이미 경쟁자가 된 상태만 다른 array로 이동            
            requestWaiting.forEach((user, index) => {                
                console.log(user);
                if (user.getDataValue('Competition').getDataValue('state'))                    
                    competitors.push(requestWaiting.splice(index,1)[0]);
            });
            acceptWaiting.forEach((user, index) => {   
                console.log(user);
                if (user.getDataValue('Competition').getDataValue('state'))
                    competitors.push(acceptWaiting.splice(index,1)[0]);                
            });
            
            return res.json({state: 'success', competitors: competitors, accept_waiting: acceptWaiting, request_waiting: requestWaiting});
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
            //친구인지 확인
            const friendCheck = await Friends.findOne({where:{state:true, acceptId:requestUser.id, requestId:req.params.id}});
            if(!friendCheck){
                return res.json({state:'false', message:`userId (${requestUser.id}) and (${req.params.id}) is not friend`});
            }
            //이미 요청이 온 경우
            const acceptCheck = await Competition.findOne({where:{acceptId:requestUser.id, requestId: req.params.id}});
            if(acceptCheck){
                acceptCheck.update({state:true});
                return res.send(acceptCheck);
            }
            await requestUser.addCptAcceptuser(parseInt(req.params.id));
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
        const user = await User.findOne({where: {uid: 'd1oJhQr4GMRci8YY7oHKk4U9vba2'}});
        if(user){
            const competition = await Competition.update({state: true, startTime: new Date()},{ 
                where : { acceptId: user.id, requestId: req.params.id },
            });
            return res.json({state:'success', result:competition});
        }
        return res.status(400).json({state:'fail', message:'cant found user(wrong uid)'});
    } catch (error) {
        console.error(error);
        next(error);
    }
});


module.exports = router;