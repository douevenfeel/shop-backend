const Router = require('express');
const router = new Router();

const authRouter = require('./authRouter');
const deviceRouter = require('./deviceRouter');

router.use('/auth', authRouter);
router.use('/device', deviceRouter);

module.exports = router;
