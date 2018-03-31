var Router = require("express").Router();
var User = require("../db/models/Uses");
var Friend = require("../db/models/friends");

var Mongoose = require("mongoose");
var config = require("../config/config");
var passport = require("passport");
var JWT = require("jsonwebtoken");

Mongoose.connect(config.mlab.URL,(error)=>{
  if(error) console.log(error);
});


Router.get('/', passport.authenticate('jwt', {session: false}), (req,res)=>{
  res.send(req.user);
 });

 
Router.get('/:userID', passport.authenticate('jwt', { session: false }), (req,res)=>{
   if(req.params.userID){
     if(! Mongoose.Types.ObjectId.isValid(req.params.userID)) return res.status(500).json({"error": "USER ID NOT VALID!"});
     var id = Mongoose.Types.ObjectId(req.params.userID)
      User.findOne({_id: id}).select("-password").exec((error, user)=>{
        if(error) return res.status(500).json({"error": error});
        if(!user)  return res.status(500).json({"error": "USER NOT FOUND!"});
        res.status(200).json({"user": user});
       });
    }else{
      res.status(500).json({"error": "USER ID IS REQUIRED!"});
    }
});


Router.post('/signup', (req,res)=>{

newData = {};

if(req.body.username){
newData.username = req.body.username;
}
if(req.body.email){
newData.email = req.body.email;
}
if(req.body.password){
newData.password = req.body.password;
}

var newUser = new User(newData);
 newUser.save((error, user)=>{
  if(error)  return res.status(500).json({"error": error});
  if(!user)  return res.status(500).json({"error": "USER NOT FOUND!"});
  res.status(200).json(user);
 });
 
});



Router.post('/login', (req, res)=>{

  PostData = {};

  if(! req.body.username){
    res.status(500).json({"error":"USERNAME IS REQUIRED"})
  }
  if(! req.body.password){
    res.status(500).json({"error": "PASSWORD IS REQUIRED"});
  }

  User.findOne({
    username: req.body.username,
    password: req.body.password
  }).select("-passsword").exec((error, user)=>{
    if(error) return res.status(500).json({"error":error});
    if(! user) return res.status(500).json({"error":"USER NOT FOUND"});
    res.status(200).json({
       "token": JWT.sign({_id: user._id}, "NineVisions"), 
       "user": user
      });
  });

});


module.exports = Router;