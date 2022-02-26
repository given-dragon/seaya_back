const express = require('express');

const User = require('../models/user');
const News = require('../models/news');
const {getUid} = require('./middlewares');
const sequelize = require('sequelize');
const router = express.Router();

// router.post('/', async (req, res, next) => {
//     // const date = new Date().toString();
//     const news = await News.create({
//         date: '2022-02-27',
//         url: 'www.testNews.com',
//         title: 'test3 news title',
//         publishing_company: 'test3 news company',
//         reporter: 'test3 reporter',
//         point: 12,
//     });

//     return res.send(news);
// });

//뉴스의 기본정보(id, 제목, 등등)을 모두 보냄 -> 뉴스탭에 표시
router.get('/', async (req, res, next) => {

    News.findAll({attributes:['id', 'date', 'title', 'point']})
        .then((news) => {
            return res.json({state:'success', news:news});})
        .catch((error) => {
            console.error(error);
            return next(error);
        }); 
});

//뉴스의 본문을 요약해서 반환
router.get('/:newsId', async (req, res, next) => {
    // const user = await User.findOne({where:{uid:req.uid}});
    const newsUrl = await News.findOne({
        where:{id:req.params.newsId},
        attributes:['url'],
    });
    return res.json({message: 'return test news'});
    //머신러닝 코드 돌리고 요약된 내용 리턴
});
//뉴스를 다 읽으면 점수 부여
router.post('/:newsId', getUid, async (req, res, next) => {
    const user = await User.findOne({where:{uid:req.uid}});
    if (user) {
        News.findOne({where:{id:req.params.newsId}})
            .then(async (news) => {
                if(news==null) return res.json({status:'fail', message:'cant found news'});

                const read = await news.getUsers({where:{id:user.id}});
                if (!read.length){
                    await user.addNews(req.params.newsId);
                    await user.update({point: sequelize.literal(`${user.point} + ${news.point}`)});
                    return res.json({status:'success', point:eval(user.point)});
                }
                return res.json({status:'fail', message:'already read news'});
            })
            .catch((error) => {
                console.error(error);
                next(error);
            });
    }
});

module.exports = router;