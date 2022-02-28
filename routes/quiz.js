//유저 정보 등등
const express = require('express');
const schedule = require('node-schedule');

// const User = require('../models/user');
// const Quiz = require('../models/quiz');
// const Answer = require('../models/answer');
// const DaillyCheck = require('../models/daillycheck');
// const sequelize = require('sequelize');
const {User, Quiz, Answer, DaillyCheck, sequelize} = require('../models');
const {Op} = require('sequelize');
const {getUid, checkDailly} = require('./middlewares');

const router = express.Router();


//퀴즈 출력(DB에 있는거 전부 다)
router.get('/start', getUid, checkDailly, async (req, res, next) => {
        const user = await User.findOne({
            where:{uid:req.uid}, 
            include:{
                model:Quiz,
                attributes:['id']
            }
        });
        if(user){
            let solvedQuizId = user.getDataValue('Quizzes')
            solvedQuizId.forEach((element, index) => {
                solvedQuizId[index] = element.getDataValue('id');
            });
            //유저가 맞추지 않은 퀴즈만 FindAll
            var quiz = await Quiz.findAll({
                where:{id:{[Op.not]:solvedQuizId}},
                attributes:['id', 'quistion', 'point' ],
                include:{
                    model: Answer,
                    attributes:['id', 'content', 'ans_check']
                },
            });
            if(quiz.length > 5){
                console.log('start get rand quiz');
                var randQuiz = [];
                while(randQuiz.length < 5)
                    randQuiz.push(quiz.splice(Math.floor(Math.random()*quiz.length),1)[0])                
                return res.json({state:'success', quiz: randQuiz});
            }
            return res.json({state:'success', quiz: quiz});
        }
        return res.status(400).json({state:'fail', message:'cant found user(wrong uid)'});
});



//퀴즈 정답처리
router.post('/end', getUid, checkDailly, async (req, res, next) => {
    const user = await User.findOne({where:{uid:req.uid}});
    console.log(user);
    if (user){
        // const quiz_result = [1];
        const {quiz_result} = req.body;
        const t = await sequelize.transaction();
        try {            
            await user.createDaillyCheck({userId:user.id},{transaction:t});            

            const endTime = new Date();
            // endTime.setHours(24,0,0,0); //다음날 자정으로 시간 설정
            endTime.setSeconds(endTime.getSeconds() +5);
            schedule.scheduleJob(endTime, async() => {
                console.log('dailly quiz check delete');
                await DaillyCheck.destroy({where:{userId:user.id}});
            });

            if (quiz_result.length){
                await user.addQuiz(quiz_result,{transaction:t});  //유저가 맞추었던 퀴즈 등록
                const quiz = await Quiz.findAll({attributes:['point'], where:{id:quiz_result}});
                let totalPoint = 0;
                quiz.forEach((point) => totalPoint+=point['point']);
                await user.update({point: sequelize.literal(`${user.point} + ${totalPoint}`)},{transaction:t});
                await t.commit();
                return res.json({state:'success', point:eval(user.point.val)});
            }
            await t.commit();
            return res.json({state:'fail', point:user.point});
            
        } catch (error) {
            console.error(error);
            await t.rollback();
            next(error);
        }
    }
    return res.status(400).json({state:'fail', message:'cant found user(wrong uid)'});
});
module.exports = router;
