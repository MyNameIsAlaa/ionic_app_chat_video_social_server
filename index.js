
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




var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'NineVisions';
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findOne({id: jwt_payload.sub}).select("-password").exec(function(err, user) {
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

//var dataA = [], dataB = [];


io.on('connection', function (socket) {
    socket.on("id", (data)=>{
        //dataA[socket.id] = data.id;
        //dataB[data.id] = socket.id;
        if(! Mongose.Types.ObjectId.isValid(data.id)) return;
        User.findOne({_id: Mongose.Types.ObjectId(data.id)},(err, result)=>{
            if(err) return;
            if(! result) return;
            result.online = true;
            result.socket = socket.id;
            result.save((err)=>{
            })
        })
    });
    
    socket.on('disconnect', (reason) => {
        User.findOne({socket: socket.id},(err, result)=>{
            if(err) return;
            if(! result) return;
            result.online = false;
            result.socket = '';
            result.save((err)=>{
            })
        })
    });

    socket.on('private message', (data)=>{


           //data =  { from: ,to: , message: }
           if(! Mongose.Types.ObjectId.isValid(data.to)) return;
           User.findOne({_id:Mongose.Types.ObjectId(data.to)},(error, user)=>{
                 if(user.online){
                      // user is online send it   socket.to(<socketid>).emit('hey', 'I just met you');
                        socket.to(user.socket).emit('incoming_message',{
                            from: data.from,
                            message: data.message 
                        });
                 }else{
                     //user not online save to offline message
                 }
           })
   

       console.log(Object.keys(dataA).length); //online users count
    });


});





var listener = http.listen(process.env.PORT || 8080,()=>{
  console.log('listening on port ' + listener.address().port);
});