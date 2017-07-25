var express = require('express');
var path = require('path');
var cors = require('cors');
var https = require('https');
var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');
var mongoose = require('./db/mongoose'); //Need to import it so it starts the connection
var bcrypt = require('bcryptjs');

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
    //var encryptedPass =

    var user = new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    });
    var asd = bcrypt.hash(req.body.password, 5, (err, pass) => {
        return pass;
    });
    console.log(asd);


    User.findOne({username: user.username}).then((doc) => {
        if (doc) {
            return res.status(400).send(message('Username is taken!'));
        }

        user.save().then((doc) => {
            console.log(md5(doc.password));
            res.send(message('User created'));
        }, (e) => {
            console.log(e);
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
app.post('/room/:id', (req, res) => {
    Room.findOne({id: req.params.id}).then((doc) => {
        if (doc) {
            if (doc.password === req.body.password) {
                doc.password = '';
                return res.send(doc);
            } else if (doc.password === "") {
                return res.send(doc);
            } else {
                return res.status(400).send(message('Invalid Password'));
            }
        }

        return res.status(400).send(message('No such room exist'));

    }, (e) => {
        res.status(400).send(message('No such room exists'));
    });
});

//Get all rooms
app.get('/rooms', (req, res) => {
    Room.find().sort('-date').then((rooms) => {
        res.send(rooms);

    }, (e) => {
        res.status(400).send(message(e));
    });
});

//Delete room
app.delete('/room/:id', (req, res) => {
    Room.findOneAndRemove({id: req.params.id})
        .then((doc) => {
            Playlist.findOneAndRemove({id: req.params.id})
                .then((doc) => {
                    if (doc !== null) {
                        res.send(message(`Room with ID: '${doc.id}' and playlist deleted`));
                    } else {
                        res.send(message('No such room!'))
                    }

                }, (e) => {
                    res.status(400).send(message(e));
                });

        }, (e) => {
            res.status(400).send(message(e));
        });
});



