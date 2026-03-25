const {signUp,Login,Logout,updateStreak,getStreak} = require('../controllers/UserController');
const {userVerfication} = require('../middlewares/AuthMiddleware');
const router = require("express").Router();

router.post('/',userVerfication);
router.post('/signup',signUp);
router.post('/login',Login);
router.post('/logout',Logout);
router.post('/streak/update',updateStreak);
router.get('/streak',getStreak);

module.exports = router;