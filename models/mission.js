const Sequelize = require('sequelize');

module.exports = class Mission extends Sequelize.Model{
    static init(sequelize) {
        return super.init({
            title: Sequelize.STRING,
            info: Sequelize.STRING(2000),
            point: Sequelize.INTEGER,

        },{
            sequelize,
            timestamps: true,
            updatedAt: false,
            deletedAt: false,
            underscored: false,
            modelName: 'Mission',
            tableName: 'missions',
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db){
        db.Mission.belongsToMany(db.User, {
            through: 'MissionCheck',
        })
    }
}