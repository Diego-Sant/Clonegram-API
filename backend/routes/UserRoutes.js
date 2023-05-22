const express = require("express")
const router = express.Router()
 
// Controller
const { register, login, getCurrentUser, update, getUserById } = require("../controllers/UserController")

// Middleware
const validate = require("../middlewares/handleValidation");
const {userCreateValidation, loginValidation, userUpdateValidation} = require("../middlewares/userValidation");
const authGuard = require("../middlewares/authGuard");
const { imageUpload } = require("../middlewares/imageUpload");

// Rotas
router.post("/registrar", userCreateValidation(), validate, register);
router.post("/login", loginValidation(), validate, login);
router.get("/perfil", authGuard, getCurrentUser);
router.put("/", authGuard, validate, userUpdateValidation(), imageUpload.single("profileImage"), update);
router.get("/:id", getUserById); // Por não ter o validate, é uma rota pública

module.exports = router