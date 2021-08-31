const request = require('supertest');
const { dbConnect, dbDisconnect } = require('../setup/mongoTesting');
const createUser = require('../setup/user');
const createMessage = require('../setup/message');
const app = require('../setup/app');

let user;

beforeAll(async () => {
  await dbConnect();
  user = await createUser();
});

afterAll(() => dbDisconnect());

describe('Message creation', () => {
  test('Messages must contain a name, email and message', async () => {
    const res = await request(app)
      .post('/messages')
      .set({
        'Content-Type': 'application/json',
      })
      .send({});
    expect(res.body.errors[0].msg).toBe('Name must be specified.');
    expect(res.body.errors[1].msg).toBe('Email must be specified.');
    expect(res.body.errors[2].msg).toBe('Message must be specified.');
  });

  test('Messages can be sent to the blog owner without an account', async () => {
    const res = await request(app)
      .post('/messages')
      .set({
        'Content-Type': 'application/json',
      })
      .send({
        name: 'Name',
        email: 'Email',
        message: 'Message',
      });

    const message = res.body;
    expect(message.name).toBe('Name');
    expect(message.email).toBe('Email');
    expect(message.message).toBe('Message');
  });
});

describe('Message deletion', () => {
  let message;
  beforeAll(async () => {
    // Create a message
    message = await createMessage();
  });

  test('Messages cannot be deleted by anonymous users', async () => {
    const res = await request(app).delete(`/messages/${message._id}`);
    expect(res.status).toBe(401);
  });

  test('Messages can be deleted by the blog owner', async () => {
    const res = await request(app)
      .delete(`/messages/${message._id}`)
      .set({
        Authorization: `Bearer ${user.token}`,
      });
    expect(res.body.success).toBeDefined();
  });
});

describe('Messages display', () => {
  let message;
  beforeAll(async () => {
    // Create a message
    message = await createMessage();
  });

  test('Anonymous users cannot read messages to blog owner', async () => {
    const res = await request(app).get('/messages');
    expect(res.status).toBe(401);
  });

  test('All messages can be displayed in a list', async () => {
    const res = await request(app)
      .get('/messages')
      .set({
        Authorization: `Bearer ${user.token}`,
      });
    expect(res.body.length).toBeGreaterThan(1);
  });

  test('A specific message can be displayed', async () => {
    const res = await request(app)
      .get(`/messages/${message._id}`)
      .set({
        Authorization: `Bearer ${user.token}`,
      });
    const messageDisplayed = res.body;
    expect(messageDisplayed.name).toBe('Name');
    expect(messageDisplayed.email).toBe('Email');
    expect(messageDisplayed.message).toBe('Message');
    expect(messageDisplayed._id).toBe(message._id);
  });
});
