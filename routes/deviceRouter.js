const Router = require('express');
const router = new Router();

const deviceController = require('../controllers/deviceController');

router.get('/', deviceController.getAll);
router.get('/:id', deviceController.getOne);

router.post('/', deviceController.create);

router.put('/:id/available', deviceController.updateAvailable);
router.put('/:id/update-price', deviceController.updatePrice);
router.put('/:id/add-discount', deviceController.addDiscount);
router.put('/:id/update-discount', deviceController.updateDiscount);
router.put('/:id/remove-discount', deviceController.removeDiscount);

router.delete('/:id', deviceController.remove);

module.exports = router;
