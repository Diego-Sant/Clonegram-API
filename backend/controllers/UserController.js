const User = require("../models/User")
 
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const mongoose = require('mongoose');
 
const jwtSecret = process.env.JWT_SECRET

// Gerar token do usuário
const generateToken = (id) => {
    return jwt.sign({ id }, jwtSecret, {
        expiresIn: '7d',
    })
}
 
// Registrar usuário e logar
const register = async (req, res) => {
    try {
    const {name, profileName, email, password} = req.body

    // Conferir se o usuário existe
    const user = await User.findOne({email});
    const profileUser = await User.findOne({ profileName });

    if (user) {
        res.status(422).json({errors: ["Email já está sendo utilizado!"]})
        return
    }
    if (profileUser) {
        res.status(422).json({ errors: ["Nome do usuário já está sendo utilizado!"] });
        return
    }

    // Gerar hash de senha
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    // Criar usuário
    const newUser = await User.create({
        name,
        profileName,
        email,
        password: passwordHash
    });

    // Conferir se o usuário foi criado com sucesso
    if (!newUser) {
        res.status(422).json({ errors: ['Houve um erro, por favor tente mais tarde.'] });
        return
    }

    res.status(201).json({
        _id: newUser._id,
        token: generateToken(newUser._id)
    });
    }
    catch (error) {
        res.status(500).json({ errors: ['Houve um erro, por favor tente mais tarde.'] });
        return
    }
}

// Logar usuário
const login = async (req, res) => {
    const {email, password} = req.body

    const user = await User.findOne({email});

    // Checar se usuário existe
    if(!user) {
        res.status(404).json({errors: ["Usuário não encontrado!"]})
        return
    }

    // Checar se a senha bate
    if(!(await bcrypt.compare(password, user.password))) {
        res.status(422).json({errors: ["Senha inválida!"]})
        return
    }

    //Retornar token do usuário
    res.status(201).json({
        _id: user._id,
        profileImage: user.profileImage,
        token: generateToken(user._id)
    });
}

// Pegar o usuário já logado
const getCurrentUser = async(req, res) => {
    const user = req.user

    res.status(200).json(user);
}

// Atualizar o perfil do usuário
const update = async (req, res) => {
    const {name, profileName, password, confirmPassword, bio} = req.body

    let profileImage = null

    if(req.file) {
        profileImage = req.file.filename;
    }

    // Como a ID do MongoDB parece um Token, precisou converter para um tipo de ObjectId e retirar o password
    const reqUser = req.user
    const user = await User.findById(new mongoose.Types.ObjectId(reqUser._id)).select("-password");

    if(name) {
        if (name.length > 25) {
            return res.status(400).json({errors: ["O nome não pode ter mais de 25 caracteres!"]});
        }
        user.name = name;
    }

    // Conferir se o profileName já existe
    const profileUser = await User.findOne({ profileName });

    // Permitir que o usuário se for identificado como dono do @ pode enviar o próprio profileName sem erros
    if (profileUser && profileUser._id.toString() !== user._id.toString()) {
        res.status(422).json({ errors: ["Nome do usuário já está sendo utilizado!"] });
        return;
    }

    // Não permitir acentos
    const removeDiacritics = (str) => {
        if (!str) return '';
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    if (profileName) {
        if (profileName.length > 16) {
          return res.status(400).json({errors: ["O nome do usuário não pode ter mais de 15 caracteres!"]});
        }

        const nameWithoutDiacritics = removeDiacritics(profileName);
        if (profileName !== nameWithoutDiacritics) {
          return res.status(400).json({ errors: ["O nome do usuário não pode ter palavras acentuadas!"] });
        }
      
        // Permitir que o @ seja iniciado no início da frase sem colidir com a proibição de símbolos
        if (!/^@?[A-Za-z0-9\s-]*$/.test(profileName.replace(/^@/, ""))) {
          return res.status(400).json({ errors: ["O nome do usuário não pode ter símbolos!"] });
        }

        user.profileName = profileName;
    }

    if(profileImage) {
        user.profileImage = profileImage
    }

    // Permitir que a bio seja enviada completamente vazia
    if (typeof bio !== 'undefined' && bio !== null) {
     if (bio.length > 170) {
        return res.status(400).json({ errors: ["A bio não pode ter mais de 160 caracteres!"] });
    }
    user.bio = bio;
    } else {
        user.bio = '';
    }

    if (password) {
        // Gerar hash de senha quando atualizado
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        if (password.length < 6) {
            return res.status(400).json({ errors: ["A senha deve ter no mínimo 6 caracteres!"] });
        }
    
        if (confirmPassword !== password) {
            return res.status(400).json({ errors: ["As senhas não são iguais!"] });
        }

        user.password = passwordHash;
    }

    // Salvar no banco
    await user.save();

    // Mostrar os campos alterados
    res.status(200).json(user);
}

const getUserById = async (req, res) => {
    const {id} = req.params;

    try {
        const user = await User.findById(mongoose.Types.ObjectId.createFromHexString(id)).select("-password");
    
        // Checar se o usuário existe
        if (!user) {
            res.status(404).json({ errors: ["Usuário não encontrado!"] });
            return;
          }
      
          // Mostrar o usuário pesquisado
          res.status(200).json(user);
    }
    catch (error) {
        res.status(404).json({ errors: ["Usuário não encontrado!"] });
        return;
    }

}
 
module.exports = {
    register,
    login,
    getCurrentUser,
    update,
    getUserById,
}