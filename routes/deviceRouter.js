const Router = require('express');
const router = new Router();

const deviceController = require('../controllers/deviceController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoleMiddleware = require('../middlewares/checkRoleMiddleware');

router.get('/', deviceController.getAll);
router.get('/:id', deviceController.getOne);

router.post('/', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.create);
router.post('/category', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.createCategory);
router.post('/category/info', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.createInfo);

router.put('/available', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.updateAvailable);
router.put('/update-price', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.updatePrice);
router.put('/update-discount', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.updateDiscount);
router.put('/remove-discount', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.removeDiscount);
router.put('/category', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.updateCategoryTitle);

router.delete('/', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.remove);
router.delete('/category', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.removeCategory);
router.delete('/category/info', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.removeInfo);

module.exports = router;
