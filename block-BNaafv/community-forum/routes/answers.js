var express = require('express');
var router = express.Router();
var User = require("../models/User");
var Answer = require("../models/Answer");
var auth = require("../middleware/auth");
var Question = require("../models/Question");
const { isValidObjectId } = require('mongoose');
var Comment = require("../models/Comments");

// updating  answer
router.put("/:answerId", async(req, res, next) => {
    let answerId = req.params.answerId;
    if (isValidObjectId(answerId)) {
        let answer = await Answer.findById(answerId);
        if (answer.author == req.user.userId) {
            let updatedAnswer = await Answer.findByIdAndUpdate(answerId, req.body, { new: true }).populate('author');
            return res.status(200).json({ updatedAnswer: updatedAnswer.toJSON() });
        } else {
            return res.status(200).json({ err: "You cannot edit/delete answers of others" });
        }
    } else {
        return res.status(400).json({ error: `no answer found with id ${answerId}` });
    }
})

// deleting answer
router.delete("/:answerId", async(req, res, next) => {
    let answerId = req.params.answerId;
    if (isValidObjectId(answerId)) {
        let answer = await Answer.findById(answerId);
        if (answer.author == req.user.userId) {
            let deletedAnswer = await Answer.findByIdAndDelete(answerId, { new: true }).populate('author');
            let updatedQuestion = await Question.findByIdAndUpdate(deletedAnswer.questionId, { $pull: { answers: answerId } });
            return res.status(200).json({ deletedAnswer: deletedAnswer.toJSON() });
        } else {
            return res.status(200).json({ err: "You cannot edit/delete answers of others" });
        }
    } else {
        return res.status(400).json({ error: `no answer found with id ${answerId}` });
    }
})

// upvote answers
router.put("/:answerId/upvote", async(req, res, next) => {
    let answerId = req.params.answerId;
    try {
        if (isValidObjectId(answerId)) {
            let updatedAnswer = await (await Answer.findByIdAndUpdate(answerId, { $inc: { upvote: 1 } }, { new: true })).populate('author');
            return res.status(200).json({ updatedAnswer: updatedAnswer.toJSON() });
        } else {
            return res.status(400).json({ err: 'did not found answer to upvote' });
        }
    } catch (err) {
        return next(err);
    }
});

// add commments
router.post("/:answerId/comments", async(req, res, next) => {
    let answerId = req.params.answerId;
    let currentLoggedInUserId = req.user.userId;
    if (isValidObjectId(answerId)) {
        try {
            req.body.userId = currentLoggedInUserId;
            let comment = await Comment.create(req.body);
            let updatedAnswer = await (await Answer.findByIdAndUpdate(answerId, { $push: { comments: comment.id } }, { new: true })).populate('author');
            return res.status(200).json({ updatedAnswer: updatedAnswer.toJSON() });
        } catch (err) {
            return next(err);
        }
    } else {
        return res.status(400).json({ err: 'question not found to add comment' });
    }
});

module.exports = router;