var mongoose = require('mongoose');

var Room = mongoose.model('Room', {
    name: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    password: {
        type: String,
        required: false,
        trim: true
    },
    owner: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    isPublic: {
        type: Boolean,
        required: false,
        default: true
    },
    id: {
        type: String,
        required: true,
        trim: true
    },
    userlist: {
        type: Array,
        default: []
    },
    speakers: {
        type: Array,
        default: []
    }
});

module.exports = {Room};