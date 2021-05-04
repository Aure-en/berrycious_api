const mongoose = require('mongoose');

const { Schema } = mongoose;

const PostSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    text: { type: String, required: true },
    images: [String],
    timestamp: { type: Date, required: true },
    published: { type: Boolean, required: true },
  },
);

PostSchema.virtual('url').get(() => `/posts/${post._id}`);

module.exports = mongoose.model('Post', PostSchema);
