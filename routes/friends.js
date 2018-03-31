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
    Friend.find({Owner:Mongoose.Types.ObjectId(req.user._id)}).populate("Friend", "-password").exec((error, friends)=>{
        if(error) return res.status(500).json({"error": error});
        if(friends) return res.status(200).json({"success": friends});
    })
});


Router.post('/add', passport.authenticate('jwt', {session: false}), (req,res)=>{
   //get friend id
   //add it db for loggedin user
  var NewFriend =  Friend({
      Owner: req.user._id,
      Friend: req.body.userID
   });

   NewFriend.save((error, result)=>{
     if(error) return res.status(500).json({"error": error});
     if(result) return res.status(200).json({"success": "Friend Added!"});
   });

});


Router.post('/delete', passport.authenticate('jwt', {session: false}), (req,res)=>{
    //get friend id
    //add it db for loggedin user
   Friend.findOne({
       Ownser: req.user._id,
       Friend: req.body.userID
   }).remove((error)=>{
      if(error) return res.status(500).json({"error": error});
      res.status(200).json({"success": "Friend deleted!"});
   });
 
 });
 


module.exports = Router;