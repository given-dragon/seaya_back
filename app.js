const express = require('express');
// const path = require('path');
const morgan = require('morgan');
// const cookieParser = require('cookie-parser');
// const session = require('express-session');
const dotenv = require('dotenv');

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
//sequelize
const {sequelize} = require('./models');

const {initializeApp, applicationDefault} = require('firebase-admin/app');

const app = express();

app.set('port', process.env.PORT || 8080);


initializeApp({
    credential: applicationDefault(),
});

sequelize.sync({ force: false })
    .then(() => {
        console.log('데이터베이스 연결 성공');
    })
    .catch((error) => {
        console.error(error);
    });

app.use(morgan('dev'));
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
// app.use(cookieParser(process.env.COOKIE_SECRET));
// app.use(session({
//     resave: false,
//     saveUninitialized: false,
//     secret: process.env.COOKIE_SECRET,
//     cookie: {
//         httpOnly: true,
//         secure: false,
//     },
// }));

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
    console.log(app.get('port'), 'port is waiting');
});