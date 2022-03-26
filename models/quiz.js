const Sequelize = require('sequelize');

module.exports = class Quiz extends Sequelize.Model{
    static init(sequelize) {
        return super.init({
            question: Sequelize.STRING,
            point: Sequelize.INTEGER,

        },{
            sequelize,
            timestamps: true,
            updatedAt: false,
            deletedAt: false,
            underscored: false,
            modelName: 'Quiz',
            tableName: 'quizes',
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db){
        db.Quiz.hasMany(db.Answer, )   
        db.Quiz.belongsToMany(db.User, {
            through: 'QuizCheck',
        });
    }
}