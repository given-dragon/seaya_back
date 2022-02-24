const Sequelize = require('sequelize');

module.exports = class Mission extends Sequelize.Model{
    static init(sequelize) {
        return super.init({
            date: Sequelize.STRING(10), //삭제해야함
            title: Sequelize.STRING(20),
            info: Sequelize.STRING,
            point: Sequelize.INTEGER,

        },{
            sequelize,
            timestamps: true,
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