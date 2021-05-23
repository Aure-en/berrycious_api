const mongoose = require('mongoose');

const { Schema } = mongoose;

const MessageSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, required: true },
  },
);

MessageSchema.virtual('url').get(function () {
  return `/messages/${this._id}`;
});

module.exports = mongoose.model('Category', MessageSchema);
