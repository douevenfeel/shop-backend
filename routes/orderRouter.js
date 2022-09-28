const Router = require('express');
const router = new Router();

const orderController = require('../controllers/orderController');

router.get('/', orderController.getAllAdmin);

router.get('/:id', orderController.getOne);
router.get('/user/:userId', orderController.getAll);

router.post('/:id', orderController.create);

router.put('/:id/cancel', orderController.cancel);
router.put('/:id/delivery', orderController.delivery);
router.put('/:id/hide', orderController.hide);

module.exports = router;
