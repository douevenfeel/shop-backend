const Router = require('express');
const router = new Router();

const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoleMiddleware = require('../middlewares/checkRoleMiddleware');

router.get('/', authMiddleware, checkRoleMiddleware('ADMIN'), userController.getAll);

router.put('/role', authMiddleware, checkRoleMiddleware('ADMIN'), userController.updateRole);

module.exports = router;
