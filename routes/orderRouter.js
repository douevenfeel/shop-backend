const Router = require('express');
const router = new Router();

const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoleMiddleware = require('../middlewares/checkRoleMiddleware');

router.get('/', authMiddleware, checkRoleMiddleware('ADMIN'), orderController.getAllAdmin);

router.get('/all', authMiddleware, orderController.getAll);
router.get('/:id', authMiddleware, orderController.getOne);

router.post('/', authMiddleware, orderController.create);

router.put('/cancel', authMiddleware, orderController.cancel);
router.put('/delivery', authMiddleware, checkRoleMiddleware('ADMIN'), orderController.delivery);
router.put('/hide', authMiddleware, orderController.hide);

module.exports = router;
