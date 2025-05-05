const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    avatar: {
        type: String,
        default: 'https://www.gravatar.com/avatar/?d=mp'
    },
    nativeLanguage: {
        type: String,
        default: "",
      },
      bio: {
        type: String,
        default: "",
      },
      learningLanguage: {
        type: String,
        default: "",
      },
      location: {
        type: String,
        default: "",
      },
      isOnboarded: {
        type: Boolean,
        default: false,
      },
      friends: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      ],
}, { timestamps: true });

module.exports = mongoose.model('user', UserSchema);