const Router = require('express');
const router = new Router();

const authRouter = require('./authRouter');
const userRouter = require('./userRouter');
const deviceRouter = require('./deviceRouter');
const basketRouter = require('./basketRouter');
const orderRouter = require('./orderRouter');
const userController = require('../controllers/userController');

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/device', deviceRouter);
router.use('/basket', basketRouter);
router.use('/order', orderRouter);
router.use('/', userController.createManager)

module.exports = router;
