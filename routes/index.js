const Router = require('express');
const router = new Router();

const authRouter = require('./authRouter');
const deviceRouter = require('./deviceRouter');
const basketRouter = require('./basketRouter');
const orderRouter = require('./orderRouter');

router.use('/auth', authRouter);
router.use('/device', deviceRouter);
router.use('/basket', basketRouter);
router.use('/order', orderRouter);

module.exports = router;
