var express = require('express');
var path = require('path');
var cors = require('cors');
var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');
var mongoose = require('./db/mongoose'); //Need to import it so it starts the connection

var {Song} = require('./models/song');
var {User} = require('./models/user');
var {Room} = require('./models/room');
var {Playlist} = require('./models/playlist');
var message = require('./utils/message'); //Wrapper for {message: 'something'}


var app = express();
const port = process.env.PORT || 3000;

var server = app.listen(port);

server.listen(port, () => {
    console.log(`Started up at port ${port}`);
});


app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile('index.html');
});


//Registering new user
app.post('/user', (req, res) => {
    var user = new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    });


    User.findOne({username: user.username}).then((doc) => {
        if (doc) {
            return res.status(400).send(message('Username is taken!'));
        }

        user.save().then((doc) => {
            res.send(message('User created'));
        }, (e) => {
            res.status(400).send(message('Couldn\'t save user'));
        });


    }, (e) => {
        console.log(e);
        res.status(400).send(message(e));
    });

});


//Logging user in
app.post('/login', (req, res) => {
    var user = new User({
        username: req.body.username,
        password: req.body.password
    });

    User.findOne({username: user.username, password: user.password}).then((doc) => {
        if (doc) {
            return res.send(message('Successful login!'));
        }

        res.status(400).send(message('Wrong username or password!'));

    }, (e) => {
        res.status(400).send(message(e));
    });

});

app.post('/room', (req, res) => {
    var room = new Room({
        id: req.body.id,
        name: req.body.name,
        password: req.body.password,
        owner: req.body.owner,
        isPublic: req.body.isPublic,
        speakers: req.body.owner
    });

    var playlist = new Playlist({
        id: req.body.id,
        songs: []
    });

    Room.findOne({owner: room.owner})
        .then((doc) => {
            if (doc) {
                return res.status(400).send(message('Owner already has a room!'));
            }

            Playlist.findOne({id: playlist.id}).then((doc) => {
                if (doc) {
                    return res.status(400).send(message('Room already exists'));
                }

                playlist.save().then((doc) => {

                    room.save().then((doc) => {
                        res.send(doc);
                    });

                }, (e) => {
                    res.status(400).send(message(e));
                });

            }, (e) => {
                res.status(400).send(message(e));
            });

        }, (e) => {
            res.status(400).send(message(e));
        }, (e) => {
            res.status(400).send(message(e));
        });

});


//Joining room
app.get('/room/:id', (req, res) => {
    Room.find({id: req.params.id}).then((doc) => {
        if(doc){
            return res.send(doc);
        }

    }, (e) => {
        res.status(400).send(message(e));
    });
});

//Delete room



