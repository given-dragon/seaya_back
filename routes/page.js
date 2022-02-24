const express = require('express');
const {getUid} = require('./middlewares');
const router = express.Router();

router.get('/', getUid, (req, res, next) => {
    return res.json({ response : 'pageRouter-get' });
});

router.post('/', (req, res, next) => {
    // console.log(req.body);
    return res.json({ response : 'pageRouter-post' });
});
module.exports = router;