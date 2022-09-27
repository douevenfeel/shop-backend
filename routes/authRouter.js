const Router = require('express');
const router = new Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');

router.post(
    '/signup',
    body('email').isEmail().withMessage('incorrect email'),
    body('password').isLength({ min: 6, max: 16 }).withMessage('min length 6 symbols'),
    body('firstName').isLength({ min: 3, max: 20 }).withMessage('min length 3 symbols'),
    body('lastName').isLength({ min: 3, max: 20 }).withMessage('min length 3 symbols'),
    authController.signup
);
router.post('/signin', authController.signin);
router.post('/logout', authController.logout);
router.get('/refresh', authController.refresh);

module.exports = router;
