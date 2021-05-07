const mongoose = require('mongoose');

const { Schema } = mongoose;

const CommentSchema = new Schema(
  {
    username: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Comment' },
    children: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    account: { type: Schema.Types.ObjectId, ref: 'User' },
  },
);

CommentSchema.virtual('url').get(function () {
  return `/posts/${this.post._id}/comments/${this._id}`;
});

module.exports = mongoose.model('Comment', CommentSchema);
