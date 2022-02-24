//유저 정보 등등
const express = require('express');

const User = require('../models/user');
const sequelize = require('sequelize');
const {getUid} = require('./middlewares');

const router = express.Router();

router.get('refreshpoint', getUid, async (req, res, next) => {
    const missionPoint = Mission
});
module.exports = router;