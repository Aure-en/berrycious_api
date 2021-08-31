const request = require('supertest');
const { dbConnect, dbDisconnect } = require('../setup/mongoTesting');
const createUser = require('../setup/user');
const createIngredient = require('../setup/ingredient');
const createPost = require('../setup/post');
const app = require('../setup/app');

let user;

beforeAll(async () => {
  await dbConnect();
  user = await createUser();
});

afterAll(() => dbDisconnect());

describe('Ingredient creation', () => {
  test('Ingredients cannot be created by anonymous users', async () => {
    const res = await request(app)
      .post('/ingredients')
      .set({
        'Content-Type': 'application/json',
      })
      .send({ name: 'Ingredient' });
    expect(res.status).toBe(401); // Unauthorized
  });

  test('Ingredients can be created by authenticated users', async () => {
    const res = await request(app)
      .post('/ingredients')
      .set({
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'application/json',
      })
      .send({ name: 'Ingredient' });
    expect(res.body._id).toBeDefined();
    expect(res.body.name).toBe('Ingredient');
  });
});

describe('Ingredient update', () => {
  // Create ingredient
  let ingredient;
  beforeAll(async () => {
    ingredient = await createIngredient(user);
  });

  test('Ingredients cannot be updated by anonymous users', async () => {
    const res = await request(app)
      .put(`/ingredients/${ingredient._id}`)
      .set({
        'Content-Type': 'application/json',
      })
      .send({ name: 'Updated' });
    expect(res.status).toBe(401); // Unauthorized
  });

  test('Ingredients can be updated by authentified users', async () => {
    const res = await request(app)
      .put(`/ingredients/${ingredient._id}`)
      .set({
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'application/json',
      })
      .send({ name: 'Updated' });
    expect(res.body.name).toBe('Updated');
  });
});

describe('Ingredient deletion', () => {
  // Create ingredient
  let ingredient;
  beforeAll(async () => {
    ingredient = await createIngredient(user);
  });

  test('Ingredients cannot be deleted by anonymous users', async () => {
    const res = await request(app)
      .delete(`/ingredients/${ingredient._id}`);
    expect(res.status).toBe(401); // Unauthorized
  });

  test('Ingredients can be deleted by authenticated users', async () => {
    const res = await request(app)
      .delete(`/ingredients/${ingredient._id}`)
      .set({
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'application/json',
      });
    expect(res.body.success).toBeDefined();
  });
});

describe('List of ingredients can be displayed', () => {
  // Create ingredient
  let ingredient;
  beforeAll(async () => {
    ingredient = await createIngredient(user);
  });

  test('Display the list of ingredients', async () => {
    const res = await request(app).get('/ingredients');
    expect(res.body.find((elem) => elem._id === ingredient._id)).toBeDefined();
  });
});

describe('A specific ingredient can be sent', () => {
  // Create ingredient
  let ingredient;
  beforeAll(async () => {
    ingredient = await createIngredient(user);
  });

  test('Display one ingredient', async () => {
    const res = await request(app).get(`/ingredients/${ingredient.name}`);
    expect(res.body.name).toBe(ingredient.name);
  });
});

describe('All posts containing a specific ingredients can be sent', () => {
  let ingredient;
  beforeAll(async () => {
  // Create ingredient and post
    ingredient = await createIngredient(user);
    await createPost(user, ingredient);
  });

  test('List of posts containing a specific ingredient', async () => {
    const res = await request(app).get(`/ingredients/${ingredient._id}/posts`);
    expect(res.body.length).toBe(1);
  });
});
