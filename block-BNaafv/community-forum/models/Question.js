var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var User = require("./User");
var Answer = require("./Answer");
var slugger = require("slugger");
var Comment = require("./Comments");

var questionSchema = new Schema({
    title: { type: String, required: true, unique: true },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    slug: { type: String },
    description: { type: String },
    tags: [String],
    answers: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
    upvote: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
}, { timestamps: true });

questionSchema.pre('save', async function(next) {
    if (this.title && this.isModified('title')) {
        this.slug = slugger(this.title);
        next();
    }
});

questionSchema.methods.toJSONformat = function() {
    return {
        id: this.id,
        title: this.title,
        tags: this.tags,
        description: this.description,
        slug: this.slug,
        author: {
            id: this.author.id,
            username: this.author.username
        },
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    }
}

module.exports = mongoose.model('Question', questionSchema);