var mongoose = require('mongoose');

var Song = mongoose.model('Song', {
    title: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    id: {
        type: String,
        required: true,
        minlength: 1
    },
    duration: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    }
});

module.exports = {Song};