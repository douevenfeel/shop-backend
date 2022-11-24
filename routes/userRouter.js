const Router = require('express');
const router = new Router();

const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoleMiddleware = require('../middlewares/checkRoleMiddleware');

router.get('/', authMiddleware, checkRoleMiddleware('MANAGER'), userController.getAll);

router.put('/role', authMiddleware, checkRoleMiddleware('MANAGER'), userController.updateRole);

module.exports = router;
