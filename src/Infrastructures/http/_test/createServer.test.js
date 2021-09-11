const Jwt = require('@hapi/jwt');

const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const JwtTokenManager = require('../../security/JwtTokenManager');
const container = require('../../container');

describe('HTTP server', () => {
  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    pool.end();
  });

  it('should response 404 when request unregistered route', async () => {
    // Arrange
    const server = await createServer({});

    // Action
    const response = await server.inject({
      method: 'GET',
      url: '/unregisteredRoute',
    });

    // Assert
    expect(response.statusCode).toEqual(404);
  });

  it('should handle server error correctly', async () => {
    // Arrange
    const requestPayload = {
      username: 'dicoding',
      fullname: 'Dicoding Indonesia',
      password: 'super_secret',
    };
    const server = await createServer({}); // fake injection

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/users',
      payload: requestPayload,
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(500);
    expect(responseJson.status).toEqual('error');
    expect(responseJson.message).toEqual('terjadi kegagalan pada server kami');
  });

  it('should verify access token correctly', async () => {
    // Arrange
    // mock user
    const mockUserId = 'user-123';
    await UsersTableTestHelper.addUser({ id: mockUserId });

    // mock jwt service
    const jwtTokenManager = new JwtTokenManager(Jwt.token);
    const accessToken = await jwtTokenManager.createAccessToken({
      id: mockUserId,
    });
    const requestPayload = {
      title: 'Thread title',
      body: 'Thread body',
    };

    const server = await createServer(container);

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: requestPayload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    expect(response.statusCode).toEqual(201);
  });
});
