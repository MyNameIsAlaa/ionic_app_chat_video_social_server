var Router = require("express").Router();
var User = require("../db/models/Uses");
var Friend = require("../db/models/friends");

var Mongoose = require("mongoose");
var config = require("../config/config");
var passport = require("passport");
var JWT = require("jsonwebtoken");

var deepPopulate = require('mongoose-deep-populate')(Mongoose);

Mongoose.connect(config.mlab.URL,(error)=>{
  if(error) console.log(error);
});


Router.get('/', passport.authenticate('jwt', {session: false}), (req,res)=>{
  /*  Friend.find({Owner: Mongoose.Types.ObjectId(req.user._id)}).populate({
      path : 'Friend profile_pic',
      select: '-password',
      model: 'User'
    }).exec((error, friends)=>{
        if(error) return res.status(500).json({"error": error});
        let data = [];
        if(friends){
              friends.forEach(function(friend) {
               data.push(friend.Friend)
              });
            return res.status(200).json(data);
        }else{
          return res.status(200).json("none");
        }
    });
*/
    Friend.find({Owner: Mongoose.Types.ObjectId(req.user._id)}).deepPopulate('Friend Friend.profile_pic').select("-Friend.password").exec((error, friends)=>{
      if(error) return res.status(500).json({"error": error});
      let data = [];
      if(friends){
            friends.forEach(function(friend) {
             data.push(friend.Friend)
            });
          return res.status(200).json(data);
      }else{
        return res.status(200).json("none");
      }
    })
});



Router.post('/add', passport.authenticate('jwt', {session: false}), (req,res)=>{
   
      if(! req.body.userID){
        return res.status(500).json({"message":"USER ID IS REQUIRED"})
      }
      if(req.user._id == req.body.userID){
        return res.status(500).json({"message":"YOU CAN'T ADD YOUR ACCOUNT"})
      }

   Friend.findOne({Owner: req.user._id, Friend: req.body.userID}, (err, user)=>{
       if(err) return res.status(500).json({"message": "Error Searching for contact!"});
       if(user) return res.status(500).json({"message": "Friend already added!"});
       var NewFriend =  Friend({
          Owner: req.user._id,
          Friend: req.body.userID
        });
        NewFriend.save((error, result)=>{
         if(error) return res.status(500).json({"error": error});
         if(result) return res.status(200).json({"success": "Friend Added!"});
       });
   });
});


Router.delete('/delete', passport.authenticate('jwt', {session: false}), (req,res)=>{
   Friend.findOne({
       Owner: req.user._id,
       Friend: req.body.userID
   }).remove((error)=>{
      if(error) return res.status(500).json({"error": error});
      res.status(200).json({"success": "Friend deleted!"});
   });
 });
 


module.exports = Router;