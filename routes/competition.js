//친추, 겨루기 등등
const express = require('express');
const {getUid} = require('./middlewares');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const User = require('../models/user');
const Friends = require('../models/friend');
const Competition = require('../models/competition');

const schedule = require('node-schedule');

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
            var friendCheck = await Friends.findOne({where:{state:true, acceptId:requestUser.id, requestId:req.params.id}});
            friendCheck = (friendCheck==null) ? await Friends.findOne({where:{state:true, requestId:requestUser.id, acceptId:req.params.id}}) : friendCheck;
            
            if(friendCheck==null){
                return res.json({state:'false', message:`userId (${requestUser.id}) and (${req.params.id}) is not friend`});
            }
            //이미 요청이 온 경우
            const acceptCheck = await Competition.findOne({where:{acceptId:requestUser.id, requestId: req.params.id}});
            if(acceptCheck){
                acceptCheck.update({state:true, startAt: new Date()});
                return res.send(acceptCheck);
            }
            const duplicationCheck = await Competition.findOne({where:{acceptId:req.params.id, requestId: requestUser.id}});
            //끝나지 않은 겨루기 중복 체크
            if(duplicationCheck)                
                return res.json({state:'fail', message:'duplication cpt request'});
            
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
            // scheduleTime.setSeconds(scheduleTime.getSeconds() +5);
            const updateState = await Competition.update({state:true},{ 
                where : { acceptId: user.id, requestId: req.params.id },
            });
            console.log(updateState);
            if(updateState[0]){
                const scheduleTime = new Date();
                //set competition start time
                //다음날 자정으로 시간 설정
                scheduleTime.setHours(24,0,0,0);    
                schedule.scheduleJob(scheduleTime, async() => {
                    await Competition.update({startAt:scheduleTime},{ 
                        where : { acceptId: user.id, requestId: req.params.id },
                    });
                });

                //set competition end time
                //겨루기 종료를 위해 일주일 뒤로 시간 설정
                // scheduleTime.setDate(startAt.getDate()+7); 
                scheduleTime.setSeconds(scheduleTime.getSeconds() +100);
                schedule.scheduleJob(scheduleTime, async() => {
                    await Competition.destroy({where : { acceptId: user.id, requestId: req.params.id },});
                })
                return res.json({state:'success'});
            }
            return res.json({state:'fail', message:'competition accept fail'});
        }
        return res.status(400).json({state:'fail', message:'cant found user(wrong uid)'});
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;