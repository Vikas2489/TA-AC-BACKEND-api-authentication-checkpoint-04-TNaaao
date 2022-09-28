var express = require('express');
var router = express.Router();
var auth = require("../middleware/auth");
const Question = require('../models/Question');
var User = require("../models/User");

router.use(auth.verifyToken);

/* GET user according to username. */
router.get('/profile/:username', async function(req, res, next) {
    let username = req.params.username;
    try {
        let user = await User.findOne({ username });
        if (user) {
            return res.status(200).json({ user: user.getUserFormat() });
        } else if (!user) {
            return res.status(404).json({ error: `did not found any user with this username ${username}` });
        }
    } catch (error) {
        return next(error);
    }
});

// update the user
router.put("/profile/:username", async(req, res, next) => {
    let userId = req.user.userId;
    let username = req.params.username;
    try {
        let user = await User.findOne({ username });
        if (user) {
            if (user.id == userId) {
                let updatedUser = await User.findByIdAndUpdate(user.id, req.body, { new: true });
                return res.status(200).json({ user: updatedUser.getUserFormat() });
            } else {
                return res.status(422).json({ error: "You can't update others profile" });
            }
        } else if (!user) {
            return res.status(422).json({ error: `there is no user of such name ${username}` });
        }
    } catch (error) {
        return next(error);
    }

});

// get all tags
router.get("/tags", async(req, res, next) => {
    try {
        let alltags = await Question.distinct('tags');
        return res.status(200).json({ tags: alltags });
    } catch (error) {
        return next(error);
    }

});

// tracking all users
router.get("/admin/allusers", async(req, res, next) => {
    try {
        let user = await User.findById(req.user.userId);
        if (user.isAdmin) {
            var allUsers = await User.find({});
            return res.status(200).json({ allUsers: allUsers.map(user => user.getUserFormat()) });
        } else {
            return res.status(422).json({ err: 'You are not admin' });
        }
    } catch (error) {
        return next(error);
    }
});

// tracking all questions
router.get("/admin/allquestions", async(req, res, next) => {
    try {
        let user = await User.findById(req.user.userId);
        if (user.isAdmin) {
            var allQuestion = await Question.find({}).populate('author');
            return res.status(200).json({ allQuestion: allQuestion.map(question => question.toJSONformat()) });
        } else {
            return res.status(422).json({ err: 'You are not admin' });
        }
    } catch (error) {
        return next(error);
    }
});

module.exports = router;