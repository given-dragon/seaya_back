//미션 성공, 취소, 리스트출력
const express = require('express');
const sequelize = require('sequelize');
const {getUid} = require('./middlewares');
const User = require('../models/user');
const Mission = require('../models/mission');

const router = express.Router();

//미션 리스트 출력
router.get('/', getUid, async (req, res, next) => {
    //전체 미션 리스트
    const missions = await Mission.findAll({attributes:['id', 'title', 'info', 'point', 'createdAt']});

    //유저가 클리어한 미션 리스트
    const user = await User.findOne({where:{uid:req.uid}});
    let clearMissions = [];
    if(user) {
        clearMissions = await user.getMissions({attributes:['id']});        
        return res.json({missions: missions, clearMissions: clearMissions});
    }
    return res.status(400).json({state:'fail', message:'cant found user(wrong uid)'}); 
});

//유저가 클리어한 미션들을 가져와서 점수만 집계(필요한가?)
router.get('/point', getUid, async (req, res, next) => {
    const user = await User.findOne({where:{uid:req.uid}});
    let clearMissions = [];

    if(user) {
        clearMissions = await user.getMissions(
            { attributes:['point']}
        );
        console.log(clearMissions);
        //배열에 담긴 점수를 합해서 응답에 보냄

        return res.send(clearMissions);
    }
    return res.status(400).json({state:'fail', message:'cant found user(wrong uid)'});

});

//미션 클리어
router.post('/:id/clear', getUid, async (req, res, next) => {    
    try {
        const user = await User.findOne({where:{uid:req.uid}});
        //성공했던 미션인지 체크
        const isCleared = await user.getMissions({where:{id:req.params.id}});
        if(isCleared.length){   //성공헀다면 등록하지않음
            return res.status(411).json({state: 'fail', message:`missionId:${isCleared[0]['id']} is cleared mission`})
        }

        //미션성공 등록 시작
        const mission = await Mission.findOne({where:{id:req.params.id}});
        if(mission){
            //MissionCheck에 등록
            await user.addMission(parseInt(req.params.id));
            //유저 점수 갱신
            // user.update({point: `${user.point} + ${mission.point}`});
            user.update({point: sequelize.literal(`${user.point} + ${mission.point}`)});
            return res.json({state: 'success', point: eval(user.point.val)});
        }
        return res.status(410).json({state:'fail', message:'cant found mission'});
    } catch (error) {
        console.error(error);
        next(error);
    }
});
//미션 클리어 취소
router.post('/:id/cancle', getUid, async (req, res, next) => {    
    try {
        const user = await User.findOne({where:{uid:req.uid}});
        //성공한 미션인지 체크
        const isCleared = await user.getMissions({where:{id:req.params.id}});
        if(isCleared.length){   //성공한 기록이 있으면 삭제 시작
            const mission = await Mission.findOne({where:{id:req.params.id}});
            if(mission){
                //MissionCheck에 삭제
                await user.removeMission(parseInt(req.params.id));
                //유저 점수 갱신
                user.update({point: sequelize.literal(`${user.point} - ${mission.point}`)});
                console.log(user);
                return res.json({state: 'success', point: eval(user.point.val)});
            }
            return res.status(410).json({state:'fail', message:'cant found mission'});    
        }
        return res.status(412).json({state: 'fail', message:`missionId:${req.params.id} is not cleared mission`});        
    } catch (error) {
        console.error(error);
        next(error);
    }
});
module.exports = router;