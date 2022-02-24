const Sequelize = require('sequelize');

module.exports = class Friend extends Sequelize.Model {
    static init (sequelize) {
        return super.init({
            //친구 상태를 표시하는 state만 생성(추후에 유저 모델과 관계를 가지며 request_user, accept_user생성)
            state: {
                defaultValue: false,
                type: Sequelize.BOOLEAN
            }
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Firend',
            tableName: 'friends',
            createdAt: false,
            updatedAt: false,
            deletedAt: false,
        });
    }
}