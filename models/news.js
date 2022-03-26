const Sequelize = require('sequelize');

module.exports = class News extends Sequelize.Model{
    static init(sequelize) {
        return super.init({
            date: Sequelize.STRING,
            url: Sequelize.STRING,
            title: Sequelize.STRING,
            publishing_company: Sequelize.STRING,
            reporter: Sequelize.STRING,
            point: Sequelize.INTEGER,

        },{
            sequelize,
            timestamps: true,
            updatedAt: false,
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