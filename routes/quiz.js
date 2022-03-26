//유저 정보 등등
const express = require('express');
const logger = require('../logger');
const {User, Quiz, Answer, sequelize} = require('../models');
const {Op} = require('sequelize');
const {getUid, checkDailly} = require('./middlewares');
const {updateCptPoint} = require('../function');

const router = express.Router();

router.get('/ans/add', async (req, res, next) => {
    const Answer = require('../models/answer');
    var cont = 'test content ';
    var answer = false;
    for (var i=1; i< 5; i++){
        var num = i.toString();
        var temp_c = cont + num;
        var temp_a = answer;
        if(i==1){
            var temp_a = !answer;
        }
        await Answer.create({content:temp_c, ans_check:temp_a, QuizId:11});
    }
    
    return res.send('end');
});
router.get('/add', async (req, res, next) => {
    const {question, point} = req.body;
    const temp = await Quiz.create({question:question, point:point});
    return res.send(temp);
});
//퀴즈 출력
router.get('/start', getUid, checkDailly, async (req, res, next) => {
        const user = await User.findOne({
            where:{uid:req.uid}, 
            include:{
                model:Quiz,
                attributes:['id']
            }
        });
        if(user){
            let solvedQuizId = await user.getDataValue('Quizzes')
            solvedQuizId.forEach((element, index) => {
                solvedQuizId[index] = element.getDataValue('id');
            });
            //유저가 맞추지 않은 퀴즈만 FindAll
            var quiz = await Quiz.findAll({
                where:{id:{[Op.not]:solvedQuizId}},
                attributes:['id', 'question', 'point' ],
                include:{
                    model: Answer,
                    attributes:['id', 'content', 'ans_check']
                },
            });
            if(!quiz.length) return res.status(420).json({state:'fail', message:'quiz db is empty'});
            if(quiz.length > 5){
                logger.info('start get rand quiz');
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
    if (user){
        const {quiz_result} = req.body;
        const t = await sequelize.transaction();
        try {            
            await user.createDaillyCheck({userId:user.id},{transaction:t});  

            if (quiz_result.length){
                await user.addQuiz(quiz_result,{transaction:t});  //유저가 맞추었던 퀴즈 등록
                const quiz = await Quiz.findAll({attributes:['point'], where:{id:quiz_result}});
                let totalPoint = 0;
                quiz.forEach((point) => totalPoint+=point['point']);
                await user.update({point: sequelize.literal(`${user.point} + ${totalPoint}`)},{transaction:t});
                await updateCptPoint(user.id, totalPoint, true, t);
                await t.commit();
                return res.json({state:'success', point:eval(user.point.val)});
            }
            await t.commit();
            return res.status(422).json({state:'fail', point:user.point, message:'all the quizzes are wrong'});
            
        } catch (error) {
            logger.error(error);
            await t.rollback();
            next(error);
        }
    }
    return res.status(400).json({state:'fail', message:'cant found user(wrong uid)'});
});
module.exports = router;
