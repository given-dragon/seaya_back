//유저 정보 등등
const express = require('express');
// const sequelize = require('sequelize');
const {getUid} = require('./middlewares');
const User = require('../models/user');
const logger = require('../logger');
const {sequelize} = require('../models');
const router = express.Router();

// get user name, point, ranking
router.get('/data', getUid, async (req, res, next) => {
    try{
        const myData = await User.findOne({
            where:{uid:req.uid}, 
            attributes:[
                'id','name','point',
            ]
        });
        
        const query = `SELECT 1 + COUNT(*) AS 'rank' FROM users WHERE point > (SELECT point FROM users WHERE uid = '${req.uid}')`        
        const query2 = `SELECT COUNT(*) AS count FROM users`;
        const [myRank, userCount] = await Promise.all([
            sequelize.query(query, {
                type:sequelize.QueryTypes.SELECT
            }),
            sequelize.query(query2, {
                type:sequelize.QueryTypes.SELECT
            })
        ]);
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
                percentile: (myRank[0].rank/userCount[0].count*100).toFixed(2),
                mission_point:mPoint,
                quiz_point:qPoint,
                news_point:nPoint,
                campaign_point:cPoint
            });
        }
        return res.status(400).json({state:'fail', message:'cant found user'});
    }catch(error) {
        logger.error(error);
        next(error);
    }
});

//점수 갱싱...필요한가?
router.get('/refreshpoint', getUid, async (req, res, next) => {
    const user = await User.findOne({where:{uid:req.uid}});
    let clearMissions = [];
    logger.info(user);
    if(user) {
        clearMissions = await user.getMissions(
            { attributes:['point']}
        );
        return res.send(clearMissions);
    }
    return res.status(400).json({state:'fail', message:'cant found user(wrong uid)'});
});
module.exports = router;