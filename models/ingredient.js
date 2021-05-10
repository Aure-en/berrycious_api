const mongoose = require('mongoose');

const { Schema } = mongoose;

const IngredientSchema = new Schema(
  {
    name: {
      type: String, required: true,
    },
  },
);

IngredientSchema.virtual('url').get(function () {
  return `/ingredients/${this._id}`;
});

module.exports = mongoose.model('Ingredient', IngredientSchema);
