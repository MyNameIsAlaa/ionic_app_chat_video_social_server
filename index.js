
var config = require("./config/config");
var app = require("express")();
var http = require('http').Server(app);
var ExpressPeerServer = require('peer').ExpressPeerServer;
var io = require('socket.io')(http);
var Mongose = require("mongoose");

var User_Router = require('./routes/users');
var Friends_Router = require('./routes/friends');

var Message = require('./db/models/messages');

var bodyParser = require("body-parser");
var User = require("./db/models/Uses");
var Friends = require("./db/models/friends");

var passport = require("passport");
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;




var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'NineVisions';
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findOne({_id: jwt_payload._id}).select("-password").exec(function(err, user) {
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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });

app.use('/api/user', User_Router);
app.use('/api/friends', Friends_Router);



var options = {
    debug: true
}

app.use('/peerjs', ExpressPeerServer(http, options));



io.on('connection', function (socket) {
    socket.on("id", (data)=>{
        if(! Mongose.Types.ObjectId.isValid(data.id)) return;
        User.findOne({_id: Mongose.Types.ObjectId(data.id)},(err, result)=>{
            if(err) return;
            if(! result) return;
            result.online = true;
            result.socket = socket.id;
            result.save((err)=>{
            });
            Message.find({to:Mongose.Types.ObjectId(data.id) }, (err, messages)=>{
                messages.forEach((msg)=>{
                    socket.to(socket.id).emit('incoming_message',{
                        from: msg.from,
                        message: msg.message,
                        username: msg.username
                    });
                    Message.findByIdAndRemove(msg._id).exec();
                });
            });
            Friends.find({Owner: Mongose.Types.ObjectId(data.id) }).populate({
                path: "Friend",
                match: { online: true }
            }).exec((err,friends)=>{
                friends.forEach(item => {
                    if(item.Friend) socket.to(item.Friend.socket).emit('friend_online', {id: data.id});
                });
            });
        });     
        // get all user friends who are online and emit to them he is online now!
    });
    
    socket.on('disconnect', (reason) => {
        User.findOne({socket: socket.id},(err, result)=>{
            if(err) return;
            if(! result) return;
            result.online = false;
            result.socket = '';
            result.save((err)=>{
            })
            Friends.find({Owner: Mongose.Types.ObjectId(result._id) }).populate({
                path: "Friend",
                match: { online: true }
            }).exec((err,friends)=>{
                friends.forEach(item => {
                    if(item.Friend) socket.to(item.Friend.socket).emit('friend_offline', {id: result._id});
                });
            });
        });
    });

    socket.on('private message', (data)=>{
          console.log(data);
           //data =  { from: ,to: , message: }
           if(! Mongose.Types.ObjectId.isValid(data.to)) return;
           User.findOne({_id:Mongose.Types.ObjectId(data.to)},(error, user)=>{
                 if(user.online){
                      // user is online send it socket.to(<socketid>).emit('hey', 'I just met you');
                        socket.to(user.socket).emit('incoming_message',{
                            from: data.from,
                            message: data.message,
                            username: data.username
                        });
                 }else{
                    // console.log("+++ reciever " + data.to + " is not online! +++");
                     var msg = new Message({
                        from: data.from,
                        to: data.to,
                        username:data.username,
                        message: data.message,
                    }).save();

                 }
           })
       });


 
});





var listener = http.listen(process.env.PORT || 8080,()=>{
  console.log('listening on port ' + listener.address().port);
});