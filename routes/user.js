//유저 정보 등등
const express = require('express');
const sequelize = require('sequelize');
const {getUid} = require('./middlewares');
const User = require('../models/user');


const router = express.Router();

// get user name, point, ranking
router.get('/data', getUid, async (req, res, next) => {
    try{
        const user = await User.findAll({
            attributes: [
                'uid', 'name', 'point',
                [sequelize.literal('(RANK() OVER (ORDER BY point DESC))'), 'rank']
            ],
        });
        
        if(user){
            const myRank = user.find(element => element['uid'] == req.uid);
            return res.json({state:'success', name:myRank.name, point:myRank.point, rank: myRank.getDataValue('rank')});
        }
        return res.status(400).json({state:'fail', message:'cant found user'});
    }catch(error) {
        console.error(error);
        next(error);
    }
});

//점수 갱싱...필요한가?
router.get('refreshpoint', getUid, async (req, res, next) => {
    const user = await User.findOne({where:{uid:req.uid}});
    let clearMissions = [];

    if(user) {
        clearMissions = await user.getMissions(
            { attributes:['point']}
        );
        
        return res.send(clearMissions);
    }
    return res.status(400).json({state:'fail', message:'cant found user(wrong uid)'});
});
module.exports = router;