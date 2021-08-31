const request = require('supertest');
const app = require('./app');

const createIngredient = async (user) => {
  const res = await request(app)
    .post('/ingredients')
    .set({
      Authorization: `Bearer ${user.token}`,
      'Content-Type': 'application/json',
    })
    .send({ name: 'Ingredient' });
  return res.body;
};

module.exports = createIngredient;
