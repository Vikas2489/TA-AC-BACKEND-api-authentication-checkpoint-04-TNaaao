var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var User = require("./User");
var Question = require("./Question");
var Comment = require("./Comments");

var answerSchema = new Schema({
    text: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    upvote: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
}, { timestamps: true });

answerSchema.methods.toJSON = function() {
    return {
        id: this.id,
        text: this.text,
        questionId: this.questionId,
        author: {
            id: this.author.id,
            username: this.author.username
        },
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    }
}



module.exports = mongoose.model("Answer", answerSchema);