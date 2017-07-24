var mongoose = require('mongoose');


var Playlist = mongoose.model('Playlist', {
    id: {
        type: String,
        required: true
    },
    songs: {
        type: Array
    }
});

module.exports = {Playlist};