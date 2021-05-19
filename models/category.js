const mongoose = require('mongoose');

const { Schema } = mongoose;

const CategorySchema = new Schema(
  {
    name: {
      type: String, required: true,
    },
    description: String,
  },
);

CategorySchema.virtual('url').get(function () {
  return `/categories/${this._id}`;
});

module.exports = mongoose.model('Category', CategorySchema);
