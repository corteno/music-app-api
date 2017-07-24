var mongoose = require('mongoose');

mongoose.Promise = require('promise');
mongoose.connect('mongodb://test:test123@ds119533.mlab.com:19533/yt-list-test', {
    useMongoClient: true
});

module.exports = {mongoose};