const mongoose = require("mongoose");
const {Schema} = mongoose;

const photoSchema = new Schema({
    image: String,
    title: String,
    body: String,
    likes: Array,
    comments: Array,
    userId: mongoose.ObjectId,
    userProfileName: String,
    userName: String,
}, {
    timestamps: true
})

const Photo = mongoose.model("Photo", photoSchema);
module.exports = Photo;