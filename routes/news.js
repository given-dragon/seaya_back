const express = require('express');

const User = require('../models/user');
const News = require('../models/news');
const logger = require('../logger');
const {getUid} = require('./middlewares');
const sequelize = require('sequelize');
const router = express.Router();

const pythonShell = require('python-shell');

//뉴스의 기본정보(id, 제목, 등등)을 모두 보냄 -> 뉴스탭에 표시
router.get('/', getUid, async (req, res, next) => {
    //읽었던 뉴스 아이디 검색
    const readNewsId = 
        await User.findOne({where:{uid:req.uid}})
            .then(async (user) => {                
                let newsId = [];
                (await user.getNews({raw:true, attributes:['id']})).forEach(element => {
                    newsId.push(element['id']);
                });
                
                return newsId.length == 0 ? 0 : newsId;
            })
            .catch((error) => {
                logger.error(error);
                return next(error);
            });
    
    
    News.findAll({attributes:[
            'id', 'date', 'title', 'point',
            //isRead 값 추가(읽었던 뉴스면 true, 아니면 false)
            [sequelize.literal(`CASE WHEN id IN (${readNewsId}) THEN ${true} ELSE ${false} END`), 'isRead']
        ]})
        .then((news) => {
            return res.json({state:'success', news:news});
        })
        .catch((error) => {
            logger.error(error);
            return next(error);
        }); 
});

//뉴스의 본문을 요약해서 반환
router.get('/:newsId', async (req, res, next) => {
    const newsUrl = await News.findOne({
        raw:true,
        where:{id:req.params.newsId},
        attributes:['url'],
    });

    //DB에 뉴스가 있는지 확인
    if(newsUrl){
        //set option for run python script
        const options = {
            mode:'text',
            pythonPath:'',
            pythonOptions:['-u'],
            scriptPath:'./',
            args:[newsUrl['url']]
        };
        //run python script
        pythonShell.PythonShell.run('ML-main/main.py', options, function(error, result){
            if(error){
                logger.error(error);
                return next(error);
            }
            return res.json({state:'success', summarized_text: result[0], url:newsUrl['url']});
        });
    }else{
        return res.status(430).json({state:'fail', message:`cant find news newsId:${req.params.newsId}`});
    }
    
    
    //머신러닝 코드 돌리고 요약된 내용 리턴
});

//뉴스를 다 읽으면 점수 부여
router.post('/:newsId', getUid, async (req, res, next) => {
    const user = await User.findOne({where:{uid:req.uid}});
    if (user) {
        News.findOne({where:{id:req.params.newsId}})
            .then(async (news) => {
                if(news==null) return res.status(430).json({status:'fail', message:'cant found news'});

                const read = await news.getUsers({where:{id:user.id}});
                if (!read.length){
                    await user.addNews(req.params.newsId);
                    await user.update({point: sequelize.literal(`${user.point} + ${news.point}`)});
                    return res.json({status:'success', point:eval(user.point.val)});
                }
                return res.status(431).json({status:'fail', message:'already read news'});
            })
            .catch((error) => {
                logger.error(error);
                next(error);
            });
    }
});

module.exports = router;