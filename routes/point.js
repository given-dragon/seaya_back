const express = require('express');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const Competition = require('../models/competition');

exports.updateCptPoint = async function (userId, point, flag, t){
    if(flag){
        await Competition.update({ruPoint: sequelize.literal(`ruPoint + ${point}`)}, {where:{requestId:userId},transaction:t});
        await Competition.update({auPoint: sequelize.literal(`auPoint + ${point}`)}, {where:{acceptId:userId},transaction:t});
    }else{
        await Competition.update({ruPoint: sequelize.literal(`ruPoint - ${point}`)}, {where:{requestId:userId},transaction:t});
        await Competition.update({auPoint: sequelize.literal(`auPoint - ${point}`)}, {where:{acceptId:userId},transaction:t});
    }
}
