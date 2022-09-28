var express = require('express');
var router = express.Router();
var User = require("../models/User");
var Answer = require("../models/Answer");
var auth = require("../middleware/auth");
var Question = require("../models/Question");
const { isValidObjectId } = require('mongoose');
const slugger = require('slugger');
var Comment = require("../models/Comments")

router.use(auth.verifyToken);

// create question
router.post("/", async(req, res, next) => {
    let userId = req.user.userId;
    req.body.author = userId;
    try {
        let question = await (await Question.create(req.body)).populate('author');
        return res.status(200).json({ question: question.toJSONformat() });
    } catch (error) {
        return next(error);
    }
});

// get all questions
router.get("/", async(req, res, next) => {
    try {
        let allQuestions = await Question.find({}).populate("author");
        return res.status(200).json({
            questionArray: allQuestions.map(function(q) {
                return q.toJSONformat();
            })
        })
    } catch (err) {
        return next(err);
    }
});

// update question
router.put('/:questionId', async(req, res, next) => {
    let questionId = req.params.questionId;
    try {
        if (isValidObjectId(questionId)) {
            let question = await Question.findById(questionId);
            if (question.author == req.user.userId) {
                if (req.body.title) {
                    req.body.slug = slugger(req.body.title);
                }
                let updatedQuestion = await (await Question.findByIdAndUpdate(questionId, req.body, { new: true })).populate('author');
                return res.status(200).json({ updatedOne: updatedQuestion.toJSONformat() });
            } else {
                return res.status(200).json({ err: "You cannot edit/delete questions of others" });
            }
        } else {
            return res.status(400).json({ err: "invalid question id" });
        }
    } catch (error) {
        return next(error);
    }
});

// delete question
router.delete("/:slug", async(req, res, next) => {
    let slug = req.params.slug;
    try {
        let question = await Question.findOne({ slug });
        if (question) {
            if (question.author == req.user.userId) {
                let deletedQuestion = await Question.findByIdAndDelete(question.id, { new: true }).populate('author');
                let deletedAnswer = await Answer.deleteMany({ answers: deletedQuestion.answers });
                console.log(deletedAnswer, "deleted Answers");
                return res.status(200).json({ deletedOne: deletedQuestion.toJSONformat() });
            } else {
                return res.status(200).json({ err: "You cannot edit/delete questions of others" });
            }
        } else {
            return res.status(400).json({ err: "no question found!" });
        }
    } catch (error) {
        return next(error);
    }
});

// creating answers
router.post("/:questionId/answers", async(req, res, next) => {
    let questionId = req.params.questionId;
    try {
        if (isValidObjectId(questionId)) {
            req.body.questionId = questionId;
            req.body.author = req.user.userId;
            let answer = await (await Answer.create(req.body)).populate('author');
            let updatedQuestion = await Question.findByIdAndUpdate(questionId, { $push: { answers: answer.id } });
            return res.status(400).json({ answer: answer.toJSON() });
        } else {
            return res.status(400).json({ error: `no question found with id ${questionId}` });
        }
    } catch (error) {
        return next(error);
    }
});

// listing answers of a specific question
router.get("/:questionId/answers", async(req, res, next) => {
    let questionId = req.params.questionId;
    try {
        if (isValidObjectId(questionId)) {
            // ask it from sir how to do it, why it was returning the promise

            // let question = await Question.findById(questionId).populate('answers').exec();
            // let q = question.answers.map(async function(ans) {
            //     return await ans.populate('author');
            // });
            // console.log(q);
            let answersArr = await Answer.find({ questionId }).populate('author');
            return res.status(200).json({ answers: answersArr.map(a => a.toJSON()) });
        } else {
            return res.status(400).json({ error: `no question found with id ${questionId}` });
        }
    } catch (error) {
        return next(error);
    }
});

// upvote questions
router.put("/:questionId/upvote", async(req, res, next) => {
    let questionId = req.params.questionId;
    try {
        if (isValidObjectId(questionId)) {
            let updatedQuestion = await (await Question.findByIdAndUpdate(questionId, { $inc: { upvote: 1 } }, { new: true })).populate('author');
            return res.status(200).json({ updatedQuestion: updatedQuestion.toJSONformat() });
        } else {
            return res.status(400).json({ err: 'did not found question to upvote' });
        }
    } catch (err) {
        return next(err);
    }
});

// add commments
router.post("/:questionId/comments", async(req, res, next) => {
    let questionId = req.params.questionId;
    let currentLoggedInUserId = req.user.userId;
    if (isValidObjectId(questionId)) {
        try {
            req.body.userId = currentLoggedInUserId;
            let comment = await Comment.create(req.body);
            let updatedQuestion = await (await Question.findByIdAndUpdate(questionId, { $push: { comments: comment.id } }, { new: true })).populate('author');
            return res.status(200).json({ updatedQuestion: updatedQuestion.toJSONformat() });
        } catch (err) {
            return next(err);
        }
    } else {
        return res.status(400).json({ err: 'question not found to add comment' });
    }
});


module.exports = router;