const Photo = require("../models/Photo")
const mongoose = require("mongoose");
const User = require("../models/User");

// Apagar imagem do repositório
const fs = require('fs');
const path = require("path");

const diacritics = require('diacritics')

// Adicionar a foto com um usuário relacionado
const insertPhoto = async (req, res) => {
    let {title, body} = req.body;
    let image = null;

    if (req.file) {
        image = req.file.filename;
    }

    const reqUser = req.user
    const user = await User.findById(reqUser._id);

    title = diacritics.remove(title);
    body = diacritics.remove(body);

    // Criar foto
    const newPhoto = await Photo.create({
        image,
        title,
        body,
        userId: user._id,
        userName: user.name,
        userProfileName: user.profileName,
    });

    res.status(201).json(newPhoto)
};


//Remover foto do MongoDB
const deletePhoto = async (req, res) => {
    const {id} = req.params
    const reqUser = req.user
    
    try {
        const photo = await Photo.findById(mongoose.Types.ObjectId.createFromHexString(id))

        // Excluir a foto do repositório
        if (photo.image) {
            const imagePath = path.join(__dirname, "../uploads/photos", photo.image);
            fs.unlink(imagePath, (err) => {
              if (err) {
                console.error("Erro ao excluir a foto:", err);
              }
            });
        }

        // Checar se a postagem existe
        if(!photo) {
            res.status(404).json({errors: ["Postagem não encontrada!"]})
            return;
        }

        // Checar se a postagem pertence ao usuário
        if(!photo.userId.equals(reqUser._id)) {
            res.status(422).json({errors: ["A postagem que está tentando apagar não é sua!"]})
            return
        }

        // Apagar a postagem
        await Photo.findByIdAndDelete(photo._id)

        // Avisar o programador
        res.status(200).json({id: photo._id, message: "Foto excluída com sucesso!"})
    } catch (error) {
        res.status(404).json({errors: ["Postagem não encontrada!"]})
        return;
    }
}

// Pegar todas as postagens
const getAllPhotos = async (req, res) => {
    const photos = await Photo.find({}).sort([["createdAt", -1]]).exec()

    if (photos.length === 0) {
        return res.status(200).json({message: "Ainda não há nenhuma postagem!"})
    }

    return res.status(200).json(photos);
}

// Pegar as postagens do usuário
const getUserPhotos = async (req, res) => {
    const {id} = req.params
    const photos = await Photo.find({userId: id}).sort([["createdAt", -1]]).exec()

    if (photos.length === 0) {
        return res.status(200).json({message: "O usuário ainda não postou!"})
    }

    return res.status(200).json(photos);
}

// Pegar postagem por ID
const getPhotoById = async (req, res) => {
    const {id} = req.params
    try {
        const photo = await Photo.findById(mongoose.Types.ObjectId.createFromHexString(id))

        // Checar se postagem existe
        if(!photo) {
            res.status(404).json({errors: ["Postagem não encontrada!"]})
            return
        }
    
        res.status(200).json(photo);
    } catch (error) {
        res.status(404).json({errors: ["Postagem não encontrada!"]})
        return;
    }

}

// Atualizar uma postagem
const updatePhoto = async (req, res) => {
    const {id} = req.params
    const {title, body} = req.body

    const reqUser = req.user
    const photo = await Photo.findById(id)

    // Checar se postagem existe
    if(!photo) {
        res.status(404).json({errors: ["Postagem não encontrada!"]})
        return
    }

    // Checar se a postagem pertence ao usuário
    if(!photo.userId.equals(reqUser._id)) {
        res.status(422).json({errors: ["A postagem que está tentando editar não é sua!"]})
        return
    }

    if(title) {
        photo.title = title
    }

    if(body) {
        photo.body = body
    }

    await photo.save()

    res.status(200).json({photo, message: "Postagem atualizada com sucesso!"})
}

// Curtir a postagem
const likePhoto = async(req, res) => {
    const {id} = req.params

    const reqUser = req.user
    const photo = await Photo.findById(id)

    // Checar se postagem existe
    if(!photo) {
        res.status(404).json({errors: ["Postagem não encontrada!"]})
        return
    }

    // Checar se o usuário já curtiu a postagem
    const likedIndex = photo.likes.findIndex(userId => userId.equals(reqUser._id))

    // Caso já tenha curtido, ao clicar novamente irá retirar o like
    if(likedIndex !== -1) {
        photo.likes.splice(likedIndex, 1)
        await photo.save()
        res.status(200).json({photoId: id, userId: reqUser._id})
        return
    }

    // Colocar o like do usuário na Array de likes
    photo.likes.push(reqUser._id)

    await photo.save()

    res.status(200).json({photoId: id, userId: reqUser._id})
}

// Comentários
const commentPhoto = async(req, res) => {
    const {id} = req.params
    const {comment} = req.body

    const reqUser = req.user

    const user = await User.findById(reqUser)
    const photo = await Photo.findById(id);

    // Checar se postagem existe
    if(!photo) {
        res.status(404).json({errors: ["Postagem não encontrada!"]})
        return
    }

    // Colocar na Array de comentários
    const userComment = {
        comment,
        userName: user.name,
        userProfileName: user.profileName,
        userImage: user.profileImage,
        userId: user._id
    }

    photo.comments.push(userComment);

    await photo.save();

    res.status(200).json({comment: userComment, message: "O comentário foi adicionado com sucesso!"})
}

const searchPhotos = async(req, res) => {
    const {q} = req.query

    // Fazer a busca ignorando maiúsculas e minúsculas além dos acentos
    // $or é usado quando é para procurar mais de duas coisas, no caso title ou body
    // "i" é usado para procurar a mesma palavra seja em letra maiúscula ou minúscula
    const photos = await Photo.find({ $or: [{ title: { $regex: q, $options: "i" } }, { body: { $regex: q, $options: "i" } }] }, null, { diacriticSensitive: true }).exec();

    res.status(200).json(photos);
}

module.exports = {
    insertPhoto,
    deletePhoto,
    getAllPhotos,
    getUserPhotos,
    getPhotoById,
    updatePhoto,
    likePhoto,
    commentPhoto,
    searchPhotos
}