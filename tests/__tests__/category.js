const request = require('supertest');
const { dbConnect, dbDisconnect } = require('../setup/mongoTesting');
const createUser = require('../setup/user');
const createCategory = require('../setup/category');
const createPost = require('../setup/post');
const app = require('../setup/app');

let user;

beforeAll(async () => {
  await dbConnect();
  user = await createUser();
});

afterAll(() => dbDisconnect());

describe('Category creation', () => {
  test('Categories cannot be created by anonymous users', async () => {
    const res = await request(app)
      .post('/categories')
      .set({
        'Content-Type': 'application/json',
      })
      .send({ name: 'Category' });
    expect(res.status).toBe(401); // Unauthorized
  });

  test('Categories can be created by authenticated users', async () => {
    const res = await request(app)
      .post('/categories')
      .set({
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'application/json',
      })
      .send({ name: 'Category' });
    expect(res.body._id).toBeDefined();
    expect(res.body.name).toBe('Category');
  });
});

describe('Category update', () => {
  // Create category
  let category;
  beforeAll(async () => {
    category = await createCategory(user, 'CategoryToUpdate');
  });

  test('Categories cannot be updated by anonymous users', async () => {
    const res = await request(app)
      .put(`/categories/${category._id}`)
      .set({
        'Content-Type': 'application/json',
      })
      .send({ name: 'Updated' });
    expect(res.status).toBe(401); // Unauthorized
  });

  test('Categories can be updated by authentified users', async () => {
    const res = await request(app)
      .put(`/categories/${category._id}`)
      .set({
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'application/json',
      })
      .send({ name: 'Updated' });
    expect(res.body.name).toBe('Updated');
  });
});

describe('Category deletion', () => {
  // Create category
  let category;
  beforeAll(async () => {
    category = await createCategory(user, 'CategoryToDelete');
  });

  test('Categories cannot be deleted by anonymous users', async () => {
    const res = await request(app)
      .delete(`/categories/${category._id}`);
    expect(res.status).toBe(401); // Unauthorized
  });

  test('Categories can be deleted by authenticated users', async () => {
    const res = await request(app)
      .delete(`/categories/${category._id}`)
      .set({
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'application/json',
      });
    expect(res.body.success).toBeDefined();
  });
});

describe('List of categories can be displayed', () => {
  // Create category
  let category;
  beforeAll(async () => {
    category = await createCategory(user, 'CategoryToDisplay');
  });

  test('Display the list of categories', async () => {
    const res = await request(app).get('/categories');
    expect(res.body.find((elem) => elem._id === category._id)).toBeDefined();
  });
});

describe('A specific category can be sent', () => {
  // Create category
  let category;
  beforeAll(async () => {
    category = await createCategory(user, 'SpecificCategoryToDisplay');
  });

  test('Display one category', async () => {
    const res = await request(app).get(`/categories/${category.name}`);
    expect(res.body.name).toBe(category.name);
  });
});

describe('All posts containing a specific categories can be sent', () => {
  let category;
  beforeAll(async () => {
  // Create category and post
    category = await createCategory(user, 'CategoryWithPostsToDisplay');
    await createPost(user, { category });
  });

  test('List of posts containing a specific category', async () => {
    const res = await request(app).get(`/categories/${category._id}/posts`);
    expect(res.body.length).toBe(1);
  });
});
