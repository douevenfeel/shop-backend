const Router = require('express');
const router = new Router();

const basketController = require('../controllers/basketController');

router.get('/:userId', basketController.getBasket);

router.post('/', basketController.addDevice);

router.put('/:userId', basketController.changeCount);
router.put('/:userId/selected', basketController.changeSelected);

router.delete('/:userId', basketController.remove);

module.exports = router;
