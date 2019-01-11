var Router = require("express").Router();
var User = require("../db/models/Uses");
var Post = require("../db/models/posts");
var FileDB = require("../db/models/files");
var fs = require("fs");
var path = require('path');

var Mongoose = require("mongoose");
var config = require("../config/config");
var passport = require("passport");
var JWT = require("jsonwebtoken");

Mongoose.connect(config.mlab.URL,(error)=>{
  if(error) console.log(error);
});


Router.get('/', passport.authenticate('jwt', {session: false}), (req,res)=>{
    UserID = req.user._id;
    Page = req.body.Page | 0;
    Limit = req.body.limit | 12;


   Post.find({Owner: Mongoose.Types.ObjectId(UserID)}).populate('files')
   .limit(Limit).skip(Page)
   .exec((error, Posts)=>{
    if(error) return res.status(500).json({"message": "error getting posts! "  + error});
    res.status(200).json(Posts);
    })
  
  });
  

Router.get('/:PostID', passport.authenticate('jwt', {session: false}), (req,res)=>{
    UserID = req.user._id;
    postID = req.params.PostID;
  
   Post.findOne({_id: Mongoose.Types.ObjectId(postID)}).populate('files')
   .exec((error, Post)=>{
    if(error) return res.status(500).json({"message": "error getting posts! "  + error});
    res.status(200).json(Post);
    });

});


Router.post('/new', passport.authenticate('jwt', {session: false}), (req,res)=>{
  UserID = req.user._id;
  
  if(!req.body.body){
    Post_Body = ""
  }else{
    Post_Body =  String(req.body.body).trim();
  }
 if(req.body.files){
    files_IDS = JSON.parse(req.body.files);
 }else{
    return res.status(500).json({"message": "You must have at least one file!" });
 }
  

  NewPost = Post({
   Owner: UserID,
   body: Post_Body,
   files: files_IDS
  }).save((err, post)=>{
    if(err) return res.status(500).json({"message": "error saving post: " + err });
    if(!post)  return res.status(500).json({"message": "Unable save post"});
      FileDB.update(
      {_id: { $in: files_IDS}}, 
      { $set: {"Post": Mongoose.Types.ObjectId(post._id) }},
      { multi: true }).exec();
      res.status(200).json(post);
  })

});



Router.post('/edit', passport.authenticate('jwt', {session: false}), (req,res)=>{
    UserID = req.user._id;
    PostID = req.body.postID;
    Post_Body = req.body.body;

    if(!req.body.body){
      Post_Body = ""
    }else{
      Post_Body =  String(req.body.body).trim();
    }
   if(req.body.PostID){
       PostID = req.body.postID;
   }else{
      return res.status(500).json({"message": "Post ID is required!" });
   }

    if(! Mongoose.Types.ObjectId.isValid(PostID)) return res.status(500).json({"message": "POST ID NOT VALID!"});
  
    Post.findOne({_id: Mongoose.Types.ObjectId(PostID), 
        Owner: Mongoose.Types.ObjectId(UserID)}).populate('files')
    .exec((error, Post)=>{
     if(error) return res.status(500).json({"message": "error getting post!" });
     if(!Post) return res.status(500).json({"message": "Post not found!"});
       Post.body = Post_Body;
       Post.save((err, post)=>{
        if(err) return res.status(500).json({"message": "error save post" });
        if(!post)  return res.status(500).json({"message": "Post not found!"});
        res.status(200).json(post);
      }) 
     });
});


Router.delete('/:postID', passport.authenticate('jwt', {session: false}), (req,res)=>{
    UserID = req.user._id;
    if(req.body.PostID){  PostID = req.body.postID; }else{
     return res.status(500).json({"message": "Post ID is required!" });
     }
    if(! Mongoose.Types.ObjectId.isValid(PostID)) return res.status(500).json({"message": "POST ID NOT VALID!"});
    Post.findOne({
        _id: Mongoose.Types.ObjectId(PostID),
        Owner: Mongoose.Types.ObjectId(UserID)
    }).populate('files').exec((error, mypost)=>{
       if(error) return res.status(500).json({"message": "error deleting post " });
       if(!mypost) return res.status(500).json({"message": "post not found!" });
       if(mypost.files){
          mypost.files.forEach(file => {
            FileDB.findByIdAndRemove(Mongoose.Types.ObjectId(file._id),(erx, filex)=>{
               fs.unlink(path.resolve(__dirname + '/../uploads/' + file.fileName))
            });
           });
       }
      mypost.remove();
      res.status(200).json({"message": "success!" });
    });

});



Router.post('/like', passport.authenticate('jwt', {session: false}), (req,res)=>{
    UserID = req.user._id;
    if(req.body.PostID){  PostID = req.body.postID; }else{
      return res.status(500).json({"message": "Post ID is required!" });
      }
    if(! Mongoose.Types.ObjectId.isValid(PostID)) return res.status(500).json({"message": "POST ID NOT VALID!"});


    Post.findOne({
        _id: Mongoose.Types.ObjectId(PostID),
    },(error, post)=>{
        if(error) return res.status(500).json({"message": "error like post " + error});
        post.likes.push(UserID);
        post.save((err, post)=>{
            if(err) return res.status(500).json({"message": "error like post " });
            if(!post)  return res.status(500).json({"message": "Post not found!"});
            res.status(200).json({"message": "success!"});
          })        
    });
  });
  

  Router.post('/unlike', passport.authenticate('jwt', {session: false}), (req,res)=>{
    UserID = req.user._id;
    PostID = req.body.PostID;
    if(! Mongoose.Types.ObjectId.isValid(PostID)) return res.status(500).json({"message": "POST ID NOT VALID!"});

    Post.findOne({
        _id: Mongoose.Types.ObjectId(PostID),
    },(error, post)=>{
        post.likes.pull(UserID);
        post.save((err, post)=>{
            if(err) return res.status(500).json({"message": "error unlike post " });
            if(!post)  return res.status(500).json({"message": "Post not found!"});
            res.status(200).json({"message": "success!"});
          })        
    });
  });

module.exports = Router;