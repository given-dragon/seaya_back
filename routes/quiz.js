//유저 정보 등등
const express = require('express');

const User = require('../models/user');
const Quiz = require('../models/quiz');
const Answer = require('../models/answer');
const sequelize = require('sequelize');
const {getUid} = require('./middlewares');

const router = express.Router();

//퀴즈 출력(DB에 있는거 전부 다)
router.get('/', getUid, async (req, res, next) => {
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
router.post('/result', getUid, async (req, res, next) => {
    const user = await User.findOne({where:{uid:req.uid}});
    if (user){
        const quiz_result = [1, 2]; //const {quiz_result} = req.body;
        if (quiz_result){
            user.addQuiz(quiz_result);
            const quiz = await Quiz.findAll({attributes:['point'], where:{id:quiz_result}});
            let totalPoint = 0;
            quiz.forEach((point) => totalPoint+=point['point']);
            user.update({point: sequelize.literal(`${user.point} + ${totalPoint}`)});
            return res.json({state:'success', point:eval(user.point)});
        }
        return res.json({state})
    }
});
module.exports = router;

//미션 클리어 레큐 파람스 아이디 빼기