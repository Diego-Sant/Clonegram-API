const User = require("../models/User");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

const authGuard = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    // O token normalmente vem separado, com o "Bearer" "token", então ele ignora o bearer e o espaço
    const token = authHeader && authHeader.split(" ")[1];

    //Conferir se tem um token
    if(!token) return res.status(401).json({errors: ["Acesso negado!"]})

    // Conferir se o token é valido
    try {
        const verified = jwt.verify(token, jwtSecret);
    
        req.user = await User.findById(verified.id).select('-password');
    
        next();
    } catch (error) {
        res.status(401).json({ errors: [{ msg: 'Token inválido.' }] });
    }
}

module.exports = authGuard