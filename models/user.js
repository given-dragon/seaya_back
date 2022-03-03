const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {
    static init (sequelize) {        
        return super.init({
            uid: {
                unique: true,
                allowNull: false,
                type: Sequelize.STRING(36),
            },
            name: {
                allowNull: false,
                type: Sequelize.STRING(15),                        
            },
            point: {
                allowNull: false,
                type: Sequelize.INTEGER,
            }
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'User',
            tableName: 'users',
            paranoid: true,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        // set user-user Friend relationship
        // Friend
        db.User.belongsToMany(db.User, {
            foreignKey: 'requestId',
            as: 'AcceptUser',
            through: db.Friend,
        });
        db.User.belongsToMany(db.User, {
            foreignKey: 'acceptId',
            as: 'RequestUser',
            through: db.Friend,
        });
        //Competition
        db.User.belongsToMany(db.User, {
            foreignKey: 'requestId',
            as: 'CptAcceptuser',
            through: {
                model: db.Competition,
                unique:false,
            }
        });
        db.User.belongsToMany(db.User, {
            foreignKey: 'acceptId',
            unique:false,
            as: 'CptRequestUser',
            through: {
                model: db.Competition,
                unique:false,
            }
        })

        //set user-mission relationship
        db.User.belongsToMany(db.Mission, {
            through: 'MissionCheck',
        });

        //set user-quiz relationship
        db.User.belongsToMany(db.Quiz, {
            through: 'QuizCheck',
        });
        db.User.hasOne(db.DaillyCheck);

        //set user-campaign relationship
        db.User.belongsToMany(db.Campaign, {
            through: 'CampaignChek',
        });

        //set user-news relationship
        db.User.belongsToMany(db.News, {
            through: 'NewsCheck',
        });

    }
}