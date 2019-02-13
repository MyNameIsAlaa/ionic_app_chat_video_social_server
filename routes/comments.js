var Router = require("express").Router();
var User = require("../db/models/Uses");
var Post = require("../db/models/posts");
var Comment = require("../db/models/comments");
var path = require('path');
var Mongoose = require("mongoose");
var passport = require("passport");
var JWT = require("jsonwebtoken");


Router.get('/:PostID', passport.authenticate('jwt', { session: false }), (req, res) => {
  PostID = req.params.PostID;
  Page = req.body.page | -10;
  Limit = req.body.limit | 20;

  Post.find({ _id: Mongoose.Types.ObjectId(PostID) })
    .select('comments').slice(Page, Limit)
    .exec((err, comments) => {
      if (err) return res.status(500).json({ "message": "Error gettings comment!" });
      res.status(500).json(comments);
    });

});

Router.post('/edit', passport.authenticate('jwt', { session: false }), (req, res) => {
  CommentID = req.body.CommentID;
  UserID = req.user._id;
  Comment_Text = req.body.comment;
  Post.find({ 'comments._id': Mongoose.Types.ObjectId(CommentID) })
    .exec((err, com) => {
      if (err) return res.status(500).json({ "message": "Error gettiupdatingng comment!" });
      com.Comment = Comment_Text;
      com.save((err, comm) => {
        if (err) return res.status(500).json({ "message": "Error saveing comment!" });
        res.status(500).json({ "message": "comment saved!" });
      });
    });

});

Router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {

  PostID = req.body.PostID;
  UserID = req.user._id;
  Comment_Text = req.body.comment;

  Post.findOne({ _id: Mongoose.Types.ObjectId(PostID) }, (err, post) => {
    post.comments.push({
      User: UserID,
      Comment: Comment_Text
    });
    post.save((err, com) => {
      if (err) return res.status(500).json({ "message": "Error saveing comment!" });
      res.status(500).json({ "message": "comment saved!" });
    });
  });


});



Router.delete('/:CommentID', passport.authenticate('jwt', { session: false }), (req, res) => {
  CommentID = req.params.CommentID;
  Post.findOneAndUpdate(
    { 'comments._id': Mongoose.Types.ObjectId(CommentID) },
    { $pull: { comments: { _id: Mongoose.Types.ObjectId(CommentID) } } },
    function (err, post) {
      if (err) return res.status(500).json({ "message": "Error deleting comment!" });
      res.status(200).json({ "message": "comment deleted!" });
    });
});


module.exports = Router;