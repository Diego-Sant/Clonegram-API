const {body} = require("express-validator")

function removeDiacritics(str) {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const userCreateValidation = () => {
    return [
        body("name").notEmpty().withMessage("O nome é obrigatório!").isLength({max: 25}).withMessage("O nome pode ter no máximo 25 caracteres!"),
        body("profileName").notEmpty().withMessage("O nome do usuário é obrigatório!").isLength({max: 16}).withMessage("O nome do usuário pode ter no máximo 15 caracteres!").custom((value) => {
            const nameWithoutDiacritics = removeDiacritics(value);
            if (!/^@?[A-Za-z0-9\s-]*$/.test(nameWithoutDiacritics)) {
                throw new Error("O nome do usuário não pode ter símbolos!");
            }
            if (value && value !== removeDiacritics(value)) {
                throw new Error("O nome do usuário não pode ter palavras acentuadas!");
            }
            return true;
        }),
        body("email").notEmpty().withMessage("O email é obrigatório!").isEmail().withMessage("Insira um email válido!"),
        body("password").notEmpty().withMessage("A senha é obrigatória!").isLength({min: 6}).withMessage("A senha precisa ter pelo menos 6 caracteres!"),
        body("confirmPassword").notEmpty().withMessage("A confirmação da senha é obrigatória!").custom((value, {req}) => {
            if (value != req.body.password) {
                throw new Error("As senhas não são iguais!");
            }
            return true;
        })
    ]
}

const loginValidation = () => {
    return [
        body("email").notEmpty().withMessage("O email é obrigatório!").isEmail().withMessage("Insira um email válido!"),
        body("password").notEmpty().withMessage("A senha é obrigatória!")
    ]
}

const userUpdateValidation = () => {
    return [
        body("name").isLength({ max: 25 }).withMessage("O nome pode ter no máximo 20 caracteres!"),
        body("profileName").isLength({ max: 16 }).withMessage("O nome pode ter no máximo 15 caracteres!"),
        body("bio").optional().isLength({ max: 160 }).withMessage("A bio pode ter no máximo 160 caracteres!"),
    ];
  };

module.exports = {userCreateValidation, loginValidation, userUpdateValidation}