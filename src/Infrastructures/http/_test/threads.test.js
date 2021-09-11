const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  const mockUserId = 'user-123';
  const createInjectServer = async (route = {}, isAuth = false) => {
    const server = await createServer(container);
    const injectionObject = route;

    if (isAuth) {
      injectionObject.auth = {
        strategy: 'forum_api_jwt',
        credentials: {
          id: mockUserId,
        },
      };
    }

    const response = await server.inject(injectionObject);

    return response;
  };

  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: mockUserId });
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    const getPostRoute = (payload) => ({
      method: 'POST',
      url: '/threads',
      payload,
    });

    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'Thread title',
        body: 'Thread body',
      };

      // Action
      const response = await createInjectServer(
        getPostRoute(requestPayload),
        true
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'Thread title',
      };

      // Action
      const response = await createInjectServer(
        getPostRoute(requestPayload),
        true
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada'
      );
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: 'Thread title',
        body: 12312312,
      };

      // Action
      const response = await createInjectServer(
        getPostRoute(requestPayload),
        true
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat thread baru karena tipe data tidak sesuai'
      );
    });
  });

  describe('when GET /threads/{threadId}', () => {
    const getGetDetailRoute = (threadId) => ({
      method: 'GET',
      url: `/threads/${threadId}`,
    });

    it('should response 200 and return detail thread correctly', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({ owner: mockUserId });

      // Action
      const response = await createInjectServer(
        getGetDetailRoute('thread-123')
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({ owner: mockUserId });

      // Action
      const response = await createInjectServer(
        getGetDetailRoute('thread-1456')
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });
  });
});
