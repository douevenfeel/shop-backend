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

router.put('/update', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.update);
router.put('/category', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.updateCategoryTitle);
router.put('/category/info', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.updateInfo);

router.delete('/category', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.removeCategory);
router.delete('/category/info', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.removeInfo);

module.exports = router;
