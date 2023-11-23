const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

// user schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true,
    },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);