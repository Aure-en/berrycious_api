const mongoose = require('mongoose');

const { Schema } = mongoose;

const CommentSchema = new Schema(
  {
    author: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  },
);

CommentSchema.virtual('url').get(function () {
  return `/posts/${this.post._id}/comments/${this._id}`;
});

module.exports = mongoose.model('Comment', CommentSchema);
