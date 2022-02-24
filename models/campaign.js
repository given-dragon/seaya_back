const Sequelize = require('sequelize');

module.exports = class Campaign extends Sequelize.Model{
    static init(sequelize) {
        return super.init({
            url: Sequelize.STRING,
            title: Sequelize.STRING(20),
            info: Sequelize.STRING,
            point: Sequelize.INTEGER,
        },{
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Campaign',
            tableName: 'campaigns',
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        db.Campaign.belongsToMany(db.User, {through: 'CampaignChek'});
    }
}