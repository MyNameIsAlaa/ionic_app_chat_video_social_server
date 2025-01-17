var express = require("express");
var app = express();
var http = require('http').Server(app);
var ExpressPeerServer = require('peer').ExpressPeerServer;
var io = require('socket.io')(http);
const RTCMultiConnectionServer = require('rtcmulticonnection-server');

var Mongoose = require("mongoose");
var User_Router = require('./routes/users');
var Friends_Router = require('./routes/friends');
var Files_Router = require('./routes/files');
var Posts_Router = require('./routes/posts');
var Comments_Router = require('./routes/comments');
var Message = require('./db/models/messages');

var bodyParser = require("body-parser");
var User = require("./db/models/Uses");
var Friends = require("./db/models/friends");

var passport = require("passport");
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const CORS = require('cors');
const Config = require('./config');



var admin = require("firebase-admin");

var serviceAccount = require("./firebase/chatapp-17m-firebase-adminsdk-fzoem-473903246d.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://chatapp-17m.firebaseio.com"
});




Mongoose.connect(Config.MongoDB.URL, { useNewUrlParser: true }, (error) => {
    if (error) console.log(error);
});



var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = Config.JWT.secretOrKey;
passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
    User.findOne({ _id: jwt_payload._id }).select("-password").exec(function (err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    });
}));

app.use(CORS());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'))
app.use('/api/user', User_Router);
app.use('/api/friends', Friends_Router);
app.use('/api/files', Files_Router);
app.use('/api/posts', Posts_Router);
app.use('/api/comments', Comments_Router);
app.use('*', (req, res) => {
    res.send("Your request is not found in this sevrer!.");
})


//app.use('/peerjs', ExpressPeerServer(http, { debug: true }));

io.on('connection', function (socket) {

    RTCMultiConnectionServer.addSocket(socket);

    socket.on("id", (data) => {

        if (!Mongoose.Types.ObjectId.isValid(data.id)) return;
        User.findOne({ _id: Mongoose.Types.ObjectId(data.id) }, (err, result) => {
            if (err) return;
            if (!result) return;
            result.online = true;
            result.socket = socket.id;
            result.save((err) => {
            });
            Friends.find({ Owner: Mongoose.Types.ObjectId(data.id) }).populate({
                path: "Friend",
                match: { online: true }
            }).exec((err, friends) => {
                friends.forEach(item => {
                    if (item.Friend) socket.to(item.Friend.socket).emit('friend_online', { id: data.id });
                });
            });
            Message.find({ to: Mongoose.Types.ObjectId(data.id) }, (err, messages) => {
                if (err) return;
                var bulk = [];
                if (!messages) return;
                messages.forEach((msg) => {

                    bulk.push({
                        from: msg.from,
                        message: msg.message,
                        username: msg.username,
                        first_name: msg.first_name,
                        last_name: msg.last_name,
                    });

                    Message.findByIdAndRemove(msg._id).exec();

                });
                socket.emit('bulk_incoming_message', bulk);

            });
        });

    });

    socket.on('disconnect', (reason) => {
        User.findOne({ socket: socket.id }, (err, result) => {
            if (err) return;
            if (!result) return;
            result.online = false;
            result.socket = '';
            result.save((err) => {
            })
            Friends.find({ Owner: Mongoose.Types.ObjectId(result._id) }).populate({
                path: "Friend",
                match: { online: true }
            }).exec((err, friends) => {
                friends.forEach(item => {
                    if (item.Friend) socket.to(item.Friend.socket).emit('friend_offline', { id: result._id });
                });
            });
        });
    });

    socket.on('private message', (data) => {
        //data =  { from: ,to: , message: }
        if (!Mongoose.Types.ObjectId.isValid(data.to)) return;
        User.findOne({ _id: Mongoose.Types.ObjectId(data.to) }, (error, user) => {

            var message = { notification: { title: data.username, body: data.message }, topic: data.to };
            admin.messaging().send(message).then((response) => { }).catch((error) => { console.log('Error sending GCM notification:', error); });

            let userOnline = user.online;

            User.findOne({ _id: Mongoose.Types.ObjectId(data.from) }, (eror, sender) => {

                if (userOnline) {
                    // user is ONLINE send it socket.to(<socketid>).emit();
                    socket.to(user.socket).emit('incoming_message', {
                        from: data.from,
                        message: data.message,
                        username: sender.username,
                        first_name: sender.first_name,
                        last_name: sender.last_name,
                    });
                } else {
                    // user is OFFLINE save msg to db
                    var msg = new Message({
                        from: data.from,
                        to: data.to,
                        username: sender.username,
                        message: data.message,
                        first_name: sender.first_name,
                        last_name: sender.last_name,
                    }).save();

                }


            })

        })
    });

    socket.on('videocall_call', (data) => {
        console.log(data)
        User.findOne({ _id: Mongoose.Types.ObjectId(data.to) }, (error, user) => {
            socket.to(user.socket).emit('videocall_call', {
                from: data.from,
                username: data.username,
                channel: data.channel
            });
        });
    });

    socket.on('videocall_answer', (data) => {
        User.findOne({ _id: Mongoose.Types.ObjectId(data.to) }, (error, user) => {
            socket.to(user.socket).emit('videocall_answer', {
                from: data.from,
                username: data.username,
                channel: data.channel
            });
        });
    });

    socket.on('cancel_videocall_call', (data) => {
        User.findOne({ _id: Mongoose.Types.ObjectId(data.to) }, (error, user) => {
            socket.to(user.socket).emit('cancel_videocall_call', {
                from: data.from,
                username: data.username,
                channel: data.channel
            });
        });
    });

});





var listener = http.listen(Config.http.port, () => {
    console.log('listening on port ' + listener.address().port);
});