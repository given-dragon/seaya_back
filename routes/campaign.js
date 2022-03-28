const express = require('express');

const User = require('../models/user');
const Campaign = require('../models/campaign');
const logger = require('../logger');
const {getUid} = require('./middlewares');
const {updateCptPoint2} = require('../function');
const sequelize = require('sequelize');
const router = express.Router();
router.get('/add', async (req, res, next) => {
    
    const url = 'https://cloud.greensk.greenpeace.org/petitions-ocean-sanctuaries2?_ga=2.1410545.1546264524.1647701980-24342909.1645769692';
    var title = 'test title';
    var info = 'test info';
    const point = 10;
    for (var i=1; i< 11; i++){
        var num = i.toString();
        var temp_t = title + num;
        var temp_i = info + num;
        await Campaign.create({url, title:temp_t, info:temp_i, point});
    }
    
    return res.send('end');
});
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
                    await updateCptPoint2(user.id, campaign.point, true);
                    return res.json({status:'success', point:eval(user.point.val)});
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