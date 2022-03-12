const express = require('express');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const Competition = require('./models/competition');
const logger = require('../logger');

exports.updateCptPoint = async function (userId, point, flag, t){
    if(flag){
        await Competition.update({ruPoint: sequelize.literal(`ruPoint + ${point}`)}, {where:{requestId:userId, endAt:null, startAt:{[Op.not]:null}},transaction:t});
        await Competition.update({auPoint: sequelize.literal(`auPoint + ${point}`)}, {where:{acceptId:userId, endAt:null, startAt:{[Op.not]:null}},transaction:t});
    }else{
        await Competition.update({ruPoint: sequelize.literal(`ruPoint - ${point}`)}, {where:{requestId:userId, endAt:null, startAt:{[Op.not]:null}},transaction:t});
        await Competition.update({auPoint: sequelize.literal(`auPoint - ${point}`)}, {where:{acceptId:userId, endAt:null, startAt:{[Op.not]:null}},transaction:t});
    }
}

exports.cptRefresh = async () => {
    const weekAgo  = new Date();
    logger.info('cpt refrest start');
    logger.info(`refresh Time: ${weekAgo}`);

    try{
        //수락했지만 저장이 안된 요청들 모두 수락
        await Competition.update({startAt:weekAgo},{where : {state:1, startAt:null}});
        weekAgo.setDate(weekAgo.getDate()-7);
        logger.info(`refresh Time - week: ${weekAgo}`);
        //일주일이 지난 겨루기 내역 모두 삭제
        await Competition.destroy({
            where: {
                startAt:{[Op.lte]:weekAgo}
            }
        });
        logger.info('cpt refrest end');
    } catch(error){
        logger.info('cpt refrest error');
        logger.error(error);
    }
}