const {Sequelize} = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];
const User = require('./user');
const Friend = require('./friend');
const News = require('./news');
const Campaign = require('./campaign');
const Mission = require('./mission');
const Quiz = require('./quiz');
const Answer = require('./answer');
const DaillyCheck = require('./daillycheck');
const Competition = require('./competition');

const db = {};
const sequelize = new Sequelize(
  config.database, config.username, config.password, config,
);

db.sequelize = sequelize;

db.User = User;
db.Friend = Friend;
db.News = News;
db.Campaign = Campaign;
db.Mission = Mission;
db.Quiz = Quiz;
db.DaillyCheck = DaillyCheck;
db.Answer = Answer;
db.Competition = Competition;

User.init(sequelize);
Friend.init(sequelize);
News.init(sequelize);
Campaign.init(sequelize);
Mission.init(sequelize);
Quiz.init(sequelize);
DaillyCheck.init(sequelize);
Answer.init(sequelize);
Competition.init(sequelize);

User.associate(db);
Mission.associate(db);
Quiz.associate(db);
DaillyCheck.associate(db);
News.associate(db);
Campaign.associate(db);
Answer.associate(db);

module.exports = db;