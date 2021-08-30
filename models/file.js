const mongoose = require('mongoose');

const { Schema } = mongoose;

const FileSchema = new Schema({
  name: String,
  data: Buffer, // Full image
  contentType: String,
  size: Number,
  thumbnail: Buffer, // Small thumbnail
});

FileSchema.virtual('url').get(function () {
  return `/files/${this._id}`;
});

module.exports = mongoose.model('File', FileSchema);
