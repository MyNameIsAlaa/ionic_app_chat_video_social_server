
var config = require("./config/config");
var app = require("express")();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Mongose = require("mongoose");

var User_Router = require('./routes/users');
var Friends_Router = require('./routes/friends');

var bodyParser = require("body-parser");
var User = require("./db/models/Uses");
var passport = require("passport");
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;


var OnlineUsers = [];


var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'NineVisions';
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findOne({id: jwt_payload.sub}, function(err, user) {
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

app.use('/api/user', User_Router);
app.use('/api/friends', Friends_Router);


io.on('connection', function (socket) {

    socket.on("connect", (data)=>{
        OnlineUsers.push({
            sid: socket.id,
            uid: data.id
        });
    });

});



var listener = http.listen(process.env.PORT || 8080,()=>{
  console.log('listening on port ' + listener.address().port);
});