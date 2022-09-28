const Router = require('express');
const router = new Router();

const userController = require('../controllers/userController');

router.get('/', userController.getAll);

router.put('/:id/role', userController.updateRole);

module.exports = router;
