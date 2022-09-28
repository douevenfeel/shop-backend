const Router = require('express');
const router = new Router();

const basketController = require('../controllers/basketController');

router.get('/:basketId', basketController.getBasket);

router.post('/', basketController.addDevice);

router.put('/:basketId', basketController.changeCount);
router.put('/:basketId/selected', basketController.changeSelected);

router.delete('/:basketId', basketController.remove);

module.exports = router;
