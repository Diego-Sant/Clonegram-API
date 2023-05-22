const express = require("express")
const router = express.Router()

// Controller
const {insertPhoto, deletePhoto, getAllPhotos, getUserPhotos, getPhotoById, updatePhoto, likePhoto, commentPhoto, searchPhotos } = require("../controllers/PhotoController")

// Middlewares
const {photoInsertValidation, photoUpdateValidation, commentValidation} = require("../middlewares/photoValidation");
const authGuard = require("../middlewares/authGuard");
const validate = require("../middlewares/handleValidation");
const { imageUpload } = require("../middlewares/imageUpload");

// Rotas
router.post("/", authGuard, imageUpload.single("image"), photoInsertValidation(), validate, insertPhoto);
router.delete("/:id", authGuard, deletePhoto);
router.get("/", authGuard, getAllPhotos);

// A ordem importou nessa situação pois a url poderia entender que o usuario é um ID
router.get("/usuario/:id", authGuard, getUserPhotos);
router.get("/pesquisar", authGuard, searchPhotos)
router.get("/:id", authGuard, getPhotoById);

router.put("/:id", authGuard, photoUpdateValidation(), validate, updatePhoto);
router.put("/curtida/:id", authGuard, likePhoto);
router.put("/comentario/:id", authGuard, commentValidation(), validate, commentPhoto)



module.exports = router;