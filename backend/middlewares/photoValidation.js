const {body} = require("express-validator")

const photoInsertValidation = () => {
    return [
        body("title").optional().isLength({max: 30}).withMessage("O título pode ter no máximo 30 caracteres!"),
        body("body").optional().isLength({max: 280}).withMessage("O máximo de caracteres é 280!"),
        body("image").optional().custom((value, {req}) => {
            if (!req.body.title && !value) {
                throw new Error("Pelo menos um dos campos (imagem ou título) deve ser preenchido!");
            }
            if (value && !req.file.mimetype.match(/image\/(png|webp|svg\+xml|jpeg)/)) {
                throw new Error("Envie apenas arquivos png, webp, svg, jpg ou jpeg!");
            }
            return true;
        })
    ]
}

const photoUpdateValidation = () => {
    return [
        body("title").optional().isLength({max: 30}).withMessage("O título pode ter no máximo 30 caracteres!"),
        body("body").optional().isLength({max: 280}).withMessage("O máximo de caracteres é 280!"),
        (req, res, next) => {
            const {title, body} = req.body;
            if (!title && !body) {
              return res.status(400).json({message: "Pelo menos um dos campos deve ser preenchido!"});
            }
            next();
        }
    ]
}

const commentValidation  = () => {
    return [
        body("comment").notEmpty().withMessage("O comentário é obrigatório!").isLength({max: 280}).withMessage("O máximo de caracteres é 280!"),
    ]
}

module.exports = {
    photoInsertValidation,
    photoUpdateValidation,
    commentValidation
}