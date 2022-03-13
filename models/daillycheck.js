const Sequelize = require('sequelize');

module.exports = class DaillyCheck extends Sequelize.Model{
    static init(sequelize) {
        return super.init({
        },{
            sequelize,
            timestamps: true,
            updatedAt: false,
            deletedAt: false,
            underscored: false,
            modelName: 'DaillyCheck',
            tableName: 'DaillyCheck',
        });
    }

    static associate(db){
        db.DaillyCheck.belongsTo(db.User);
    }
}