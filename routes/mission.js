//미션 성공, 취소, 리스트출력
const express = require('express');
const {sequelize} = require('../models');
// const {Sequelize} = require('sequelize');
// const Op = sequelize.Op;
const {getUid} = require('./middlewares');
const {updateCptPoint} = require('../function');
const User = require('../models/user');
const Mission = require('../models/mission');
const logger = require('../logger');
const router = express.Router();

router.get('/add', async (req, res, next) => {
    const {title, info, point} = req.body;
    const temp = await Mission.create({title:title, info:info, point:point});
    return res.send(temp);
});
//미션 리스트 출력
router.get('/', getUid, async (req, res, next) => {
    //유저가 클리어한 미션 리스트
    const user = await User.findOne({where:{uid:req.uid}});
    
    if(user) {      
        let clearMissions = await user.getMissions({attributes:['id']});
        clearMissions.forEach((element, index) => {
            clearMissions[index] = element.id;
        });
        if(!clearMissions.length) clearMissions.push(0);
        const missions = await Mission.findAll({
            raw:true,
            attributes:[
                'id', 'title', 'info', 'point', 'createdAt',                
                [sequelize.literal(`CASE WHEN id IN (${clearMissions}) THEN ${true} ELSE ${false} END`), 'isClear']
            ]
        });
        return res.json({missions: missions});
    }
    return res.status(400).json({state:'fail', message:'cant found user(wrong uid)'}); 
});


//미션 클리어
router.post('/:msId/clear', getUid, async (req, res, next) => {    
    try {
        const user = await User.findOne({where:{uid:req.uid}});

        //성공했던 미션인지 체크
        const isCleared = await user.getMissions({where:{id:req.params.msId},attributes:['id']});
        if(isCleared.length){   //성공헀다면 등록하지않음
            return res.status(411).json({state: 'fail', message:`missionId:${isCleared[0]['id']} is cleared mission`})
        }

        //미션성공 등록 시작
        const mission = await Mission.findOne({where:{id:req.params.msId}});
        if(mission){
            const t = await sequelize.transaction();
            try {
                await Promise.all([
                    //MissionCheck에 등록
                    user.addMission(req.params.msId,{transaction:t}),
                    //유저 점수 갱신
                    user.update({point: sequelize.literal(`${user.point} + ${mission.point}`)},{transaction:t}),
                    updateCptPoint(user.id, mission.point, true, t)
                ]);                
                await t.commit();
            } catch (error) {
                logger.error(error);
                await t.rollback();
            }
            return res.json({state: 'success', point: eval(user.point.val)});            
        }
        return res.status(410).json({state:'fail', message:'cant found mission'});
    } catch (error) {
        logger.error(error);
        next(error);
    }
});
//미션 클리어 취소
router.post('/:msId/cancle', getUid, async (req, res, next) => {    
    try {
        const user = await User.findOne({where:{uid:req.uid}});
        //성공한 미션인지 체크
        const mission = await user.getMissions({where:{id:req.params.msId}});
        if(mission.length){   //성공한 기록이 있으면 삭제 시작
            const t = await sequelize.transaction();
            try{
                await Promise.all([
                    //MissionCheck에 삭제
                    user.removeMission(
                        req.params.msId,
                        {transaction:t}
                    ),
                    //유저 점수 갱신
                    user.update({point: sequelize.literal(`${user.point} - ${mission[0].point}`)},{transaction:t}),
                    updateCptPoint(user.id, mission[0].point, false, t)
                ]);
                
                await t.commit();                
            }catch(error){
                logger.info('mission cancle transaction rollback');
                logger.error(error);
                await t.rollback();
            }
            return res.json({state: 'success', point: eval(user.point.val)});  
        }
        return res.status(412).json({state: 'fail', message:`missionId:${user.id} is not cleared mission`});        
    } catch (error) {
        logger.error(error);
        next(error);
    }
});
module.exports = router;