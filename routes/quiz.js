//유저 정보 등등
const express = require('express');
const schedule = require('node-schedule');

const User = require('../models/user');
const Quiz = require('../models/quiz');
const Answer = require('../models/answer');
const DaillyCheck = require('../models/daillycheck');
const sequelize = require('sequelize');
const {getUid, checkDailly} = require('./middlewares');

const router = express.Router();

//퀴즈 출력(DB에 있는거 전부 다)
router.get('/start', getUid, checkDailly, async (req, res, next) => {
        //유저가 맞추지 않은 퀴즈만 5개 출력으로 바꿔야함
        const quiz = await Quiz.findAll({
            attributes:['id', 'quistion', 'point' ],
            include:{
                model: Answer,
                attributes:['id', 'content', 'ans_check']
            },
        });
        return res.json({state:'success', quiz: quiz});    
});



//퀴즈 정답처리
router.post('/end', getUid, checkDailly, async (req, res, next) => {
    const user = await User.findOne({where:{uid:req.uid}});
    if (user){
        // const quiz_result = [1];
        const {quiz_result} = req.body;

        await user.createDaillyCheck({userId:user.id});

        const endTime = new Date();
        endTime.setHours(24,0,0,0); //다음날 자정으로 시간 설정
        schedule.scheduleJob(endTime, async() => {
            await DaillyCheck.destroy({where:{userId:user.id}});
        });

        if (quiz_result.length){
            user.addQuiz(quiz_result);  //유저가 맞추었던 퀴즈 등록
            const quiz = await Quiz.findAll({attributes:['point'], where:{id:quiz_result}});
            let totalPoint = 0;
            quiz.forEach((point) => totalPoint+=point['point']);
            await user.update({point: sequelize.literal(`${user.point} + ${totalPoint}`)});
            return res.json({state:'success', point:eval(user.point.val)});
        }
        return res.json({state:'fail', point:user.point});
    }
    return res.status(400).json({state:'fail', message:'cant found user(wrong uid)'});
});
module.exports = router;
