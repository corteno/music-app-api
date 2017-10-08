let express = require('express');
let path = require('path');
let cors = require('cors');
let https = require('https');
let bodyParser = require('body-parser');
let {ObjectID} = require('mongodb');
let mongoose = require('./db/mongoose'); //Need to import it so it starts the connection
let bcrypt = require('bcryptjs');

let {Song} = require('./models/song');
let {User} = require('./models/user');
let {Room} = require('./models/room');
let {Playlist} = require('./models/playlist');
let message = require('./utils/message'); //Wrapper for {message: 'something'}


let app = express();
const port = process.env.PORT || 3000;

let server = app.listen(port);

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

    let user = new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    });

    bcrypt.hash(req.body.password, 5).then((hash) => {
        user.password = hash;
    });


    User.findOne({username: user.username}).then((doc) => {
        if (doc) {
            return res.status(400).send(message('Username is taken!'));
        }


        user.save().then((doc) => {
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
    let user = new User({
        username: req.body.username,
        password: req.body.password
    });
    console.log(user);


    User.findOne({username: user.username}).then((doc) => {
        if (doc) {

            bcrypt.compare(user.password, doc.password, (err, result) => {

                result
                    ? res.send(message('Successful login!'))
                    : res.status(400).send(message('Wrong username or password!'))

            });

            /*return res.send(message('Successful login!'));*/
        } else {
            return res.status(400).send(message('Wrong username or password!'));
        }

    }, (e) => {
        res.status(400).send(message(e));
    });

});

//Create room
app.post('/room', (req, res) => {
    let room = new Room({
        id: req.body.id,
        name: req.body.name,
        password: req.body.password,
        owner: req.body.owner,
        isPublic: req.body.isPublic,
        speakers: req.body.owner
    });

    Room.findOne({owner: room.owner})
        .then((doc) => {
            if (doc) {
                console.log('asd');
                return res.status(400).send(message('Owner already has a room!'));
            } else {
                room.save().then((doc) => {
                    res.send(doc);
                });
            }

        }, (e) => {
            console.log(e);
            res.status(400).send(message(e));
        });

});


//Joining room
app.post('/room/:id', (req, res) => {
    Room.findOne({id: req.params.id}).then((doc) => {
        if (doc) {
            if (doc.password === req.body.password) {
                doc.password = '';
                console.log(doc);
                return res.send(doc);
            } else if (doc.password === "") {
                console.log(doc);
                return res.send(doc);
            } else {
                return res.status(400).send(message('Invalid Password'));
            }

        } else {
            res.status(400).send(message('No such room exists'));
        }


    }, (e) => {
        res.status(400).send(message('No such room exists'));
    });
});

//Get all rooms
app.get('/rooms', (req, res) => {
    Room.find().sort('-date').then((doc) => {
        res.send(doc);
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

//Get playlist of room with ID
app.get('/playlist/:id', (req, res) => {
    Room.findOne({id: req.params.id}).then((doc) => {
        if (doc) {
            return res.send(doc.playlist);
        }
    });
});

//Add a song to a playlist
app.post('/song/:id', (req, res) => {
    let song = new Song({
        title: req.body.title,
        id: req.body.id,
        duration: req.body.duration,
        thumbnail: req.body.thumbnail
    });

    Room.findOne({id: req.params.id})
        .then((doc) => {
            if (doc) {
                Room.findOneAndUpdate({_id: doc._id}, {$push: {playlist: song}}, {new: true})
                    .then((doc) => {
                        if (doc) {
                            return res.send(doc.playlist);
                        }
                    });


            } else {
                return res.status(400).send(message('No such room!'));
            }


        });

    //song.save().then((doc) =>{})
});



