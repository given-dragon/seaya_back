const Sequelize = require('sequelize');

module.exports = class Campaign extends Sequelize.Model{
    static init(sequelize) {
        return super.init({
            url: Sequelize.STRING,
            title: Sequelize.STRING,
            info: Sequelize.STRING,
            point: Sequelize.INTEGER,
        },{
            sequelize,
            timestamps: true,
            updatedAt: false,
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