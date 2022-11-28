const Router = require('express');
const router = new Router();

const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoleMiddleware = require('../middlewares/checkRoleMiddleware');

router.get('/', authMiddleware, checkRoleMiddleware('MANAGER'), orderController.getAllManager);
router.put('/status', authMiddleware, checkRoleMiddleware('MANAGER'), orderController.deliveryStatusManager);

router.get('/all', authMiddleware, orderController.getAll);
router.get('/:id', authMiddleware, orderController.getOne);

router.post('/', authMiddleware, orderController.create);

router.put('/cancel', authMiddleware, orderController.cancel);
router.put('/delivery', authMiddleware, checkRoleMiddleware('MANAGER'), orderController.delivery);
router.put('/hide', authMiddleware, orderController.hide);

module.exports = router;
