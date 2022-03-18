const admin = require('firebase-admin');
const User = require('../models/user');
const logger = require('../logger');

// 앱에서 토큰을 받아 firebase에서 uid를 가져온다.
exports.getUid = async (req, res, next) => {
    try{
        await admin.auth()
            .verifyIdToken(req.headers['authorization'])
            .then((decodedToken) => {            
                // logger.info(decodedToken.uid);
                const uid = decodedToken.uid;
                req.uid = uid;
            })
            .catch((error) => {
                logger.error(error);
                next(error);
            });
    }catch(error){
        logger.error(error)
        next(error);
    }
    
    return next();
}

exports.checkDailly = async (req, res, next) => {
    const user = await User.findOne({where:{uid:req.uid}});
    const daillyCheck = await user.getDaillyCheck({where:{userId:user.id}});
    if(daillyCheck==null){
        return next();
    }
    return res.status(421).json({state:'fail', message:'user already solve quiz'});
}
