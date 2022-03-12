const express = require('express');

const User = require('../models/user');
const Campaign = require('../models/campaign');
const logger = require('../logger');
const {getUid} = require('./middlewares');
const sequelize = require('sequelize');
const router = express.Router();

// router.post('/', async (req, res, next) => {
//     const campaign = await Campaign.create({        
//         url: 'www.testcampaign.com',
//         title: 'test2 campaign title',
//         info: 'test2 info',
//         point: 21,
//     });

//     return res.send(campaign);
// });

router.get('/', async (req, res, next) => {

    Campaign.findAll()
        .then((campaign) => {
            return res.json({state:'success', campaign:campaign});})
        .catch((error) => {
            logger.error(error);
            return next(error);
        }); 
});

//뉴스를 다 읽으면 점수 부여
router.post('/:cpnId', getUid, async (req, res, next) => {
    const user = await User.findOne({where:{uid:req.uid}});
    if (user) {
        Campaign.findOne({where:{id:req.params.cpnId}})
            .then(async (campaign) => {
                if(campaign==null) return res.status(440).json({status:'fail', message:'cant found campaign'});

                const read = await campaign.getUsers({where:{id:user.id}});
                if (!read.length){
                    await user.addCampaign(req.params.cpnId);
                    await user.update({point: sequelize.literal(`${user.point} + ${campaign.point}`)});
                    return res.json({status:'success', point:eval(user.point)});
                }
                return res.status(441).json({status:'fail', message:'already read campaign'});
            })
            .catch((error) => {
                logger.error(error);
                next(error);
            });
    }
});

module.exports = router;