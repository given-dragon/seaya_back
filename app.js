const express = require('express');
const morgan = require('morgan');
const schedule = require('node-schedule');
const dotenv = require('dotenv');
const helmet = require('helmet');
const hpp = require('hpp');
const logger = require('./logger');
dotenv.config();

//Router
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const friendRouter = require('./routes/friend');
const missionRouter = require('./routes/mission');
const quizRouter = require('./routes/quiz');
const newsRouter = require('./routes/news');
const campaignRouter = require('./routes/campaign');
const cptRouter = require('./routes/competition');
const {cptRefresh} = require('./function');

//sequelize
const {sequelize} = require('./models');

const {initializeApp, applicationDefault} = require('firebase-admin/app');


const app = express();


//매일 자정에 미션체크 초기화(v)
//데일리 체크도 초기화(v)
//혹시나 삭제되지 않은 겨루기가 있는지 확인(v)
schedule.scheduleJob('0 0 0 * * *', async () => {
    await cptRefresh();
    logger.info('mission check reset');
    await sequelize.query('DELETE FROM MissionCheck');
    await sequelize.query('DELETE FROM DaillyCheck');    
    logger.info('mission check end');    
});



app.set('port', process.env.PORT || 8080);

initializeApp({
    credential: applicationDefault(),
});

sequelize.sync({ force: false })
    .then(() => {
        logger.info(process.env.NODE_ENV);
        logger.info('데이터베이스 연결 성공');
    })
    .catch((error) => {
        logger.error(error);
    });


if(process.env.NODE_ENV === 'production'){
    logger.info('production mod');
    app.use(morgan('combined'));
    app.use(helmet({contentSecurityPolicy: false}));
    app.use(hpp());
}else{
    app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/friend', friendRouter);
app.use('/mission', missionRouter);
app.use('/quiz', quizRouter);
app.use('/news', newsRouter);
app.use('/campaign', campaignRouter);
app.use('/cpt', cptRouter);

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} can't found router`);
    error.status = 404;
    return next(error);
});

app.use((error, req, res, next) => {
    res.locals.message = error.message;
    res.locals.err = process.env.NODE_ENV !== 'production' ? error : {};
    res.status(error.status || 500);
    return res.json({error : error});
});

app.listen(app.get('port'), () => {
    logger.info(app.get('port'), 'port is waiting');
});