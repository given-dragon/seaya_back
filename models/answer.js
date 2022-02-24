const Sequelize = require('sequelize');

module.exports = class Answer extends Sequelize.Model{
    static init(sequelize) {
        return super.init({
            content: Sequelize.STRING(50),
            ans_check: Sequelize.BOOLEAN,

        },{
            sequelize,
            underscored: false,
            modelName: 'Answer',
            tableName: 'answers',
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db){
        db.Answer.belongsTo(db.Quiz);
    }
}