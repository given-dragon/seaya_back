//유저 정보 등등
const express = require('express');
const sequelize = require('sequelize');
const {getUid} = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

// get user name, point, ranking
router.get('/data', getUid, async (req, res, next) => {
    try{
        const myData = await User.findAll({
            attributes: [
                'id', 'uid', 'name', 'point',
                [sequelize.literal('(RANK() OVER (ORDER BY point DESC))'), 'rank']
            ],
        }).then((users) => {
            return users.find(element => element['uid'] == req.uid);
        });
        
        if(myData){
            let mPoint=0, qPoint=0, nPoint=0, cPoint=0;
            const [mission, quiz, news, campaign] = await Promise.all([
                myData.getMissions({attributes:['point']}),
                myData.getQuizzes({attributes:['point']}),                
                myData.getNews({attributes:['point']}),
                myData.getCampaigns({attributes:['point']}),
            ]);
            mission.forEach((e) => {mPoint+=e.getDataValue('point');});
            quiz.forEach((e) => {qPoint+=e.getDataValue('point');});
            news.forEach((e) => {nPoint+=e.getDataValue('point');});
            campaign.forEach((e) => {cPoint+=e.getDataValue('point');});
            return res.json({
                state:'success', 
                name:myData.name, 
                total_point:myData.point, 
                rank: myData.getDataValue('rank'),
                mission_point:mPoint,
                quiz_point:qPoint,
                news_point:nPoint,
                campaign_point:cPoint
            });
        }
        return res.status(400).json({state:'fail', message:'cant found user'});
    }catch(error) {
        console.error(error);
        next(error);
    }
});

//점수 갱싱...필요한가?
router.get('/refreshpoint', getUid, async (req, res, next) => {
    const user = await User.findOne({where:{uid:req.uid}});
    let clearMissions = [];
    console.log(user);
    if(user) {
        clearMissions = await user.getMissions(
            { attributes:['point']}
        );
        return res.send(clearMissions);
    }
    return res.status(400).json({state:'fail', message:'cant found user(wrong uid)'});
});
module.exports = router;