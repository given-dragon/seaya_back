const Sequelize = require('sequelize');

module.exports = class News extends Sequelize.Model{
    static init(sequelize) {
        return super.init({
            date: Sequelize.STRING(20),
            url: Sequelize.STRING,
            title: Sequelize.STRING(20),
            publishing_company: Sequelize.STRING(30),
            reporter: Sequelize.STRING(20),
            point: Sequelize.INTEGER,

        },{
            sequelize,
            timestamps: true,
            deletedAt: false,
            underscored: false,
            modelName: 'News',
            tableName: 'news',
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }


    static associate(db) {
        db.News.belongsToMany(db.User, {
            through: 'NewsCheck',
        });
    }
}