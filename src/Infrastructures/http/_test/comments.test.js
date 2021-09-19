const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesCommentTableTestHelper = require('../../../../tests/LikesCommentTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments endpoint', () => {
  const mockUserId = 'user-123';
  const mockThreadId = 'thread-123';
  const createInjectServer = async (route = {}, authId = mockUserId) => {
    const server = await createServer(container);

    return server.inject({
      ...route,
      auth: {
        strategy: 'forum_api_jwt',
        credentials: {
          id: authId,
        },
      },
    });
  };

  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: mockUserId });
    await ThreadsTableTestHelper.addThread({
      id: mockThreadId,
      owner: mockUserId,
    });
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await LikesCommentTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    const getPostRoute = (threadId, payload) => ({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload,
    });

    it('should response 201 and persisted comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'Comment Content',
      };

      // Action
      const response = await createInjectServer(
        getPostRoute(mockThreadId, requestPayload)
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'Thread title',
      };

      // Action
      const response = await createInjectServer(
        getPostRoute(mockThreadId, requestPayload)
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada'
      );
    });

    it('should response 404 when thread not found or not valid', async () => {
      // Arrange
      const requestPayload = {
        content: 'Comment Content',
      };

      // Action
      const response = await createInjectServer(
        getPostRoute('thread-456', requestPayload)
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    const getDeleteRoute = (threadId, commentId) => ({
      method: 'DELETE',
      url: `/threads/${threadId}/comments/${commentId}`,
    });

    it('should response 200 and delete comment succesfully', async () => {
      // Arrange
      const mockCommentId = 'comment-123';
      await CommentsTableTestHelper.addComment({
        id: mockCommentId,
        owner: mockUserId,
        threadId: mockThreadId,
      });

      // Action
      const response = await createInjectServer(
        getDeleteRoute(mockThreadId, mockCommentId)
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 404 when comment not found', async () => {
      // Arrange
      const mockCommentId = 'comment-123';
      await CommentsTableTestHelper.addComment({
        id: mockCommentId,
        owner: mockUserId,
        threadId: mockThreadId,
      });

      // Action
      const response = await createInjectServer(
        getDeleteRoute(mockThreadId, 'comment-456')
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Comment tidak ditemukan');
    });

    it('should response 403 when unauthorize user try to use this endpoint', async () => {
      // Arrange
      const mockCommentId = 'comment-123';
      await CommentsTableTestHelper.addComment({
        id: mockCommentId,
        owner: mockUserId,
        threadId: mockThreadId,
      });

      // Action
      const response = await createInjectServer(
        getDeleteRoute(mockThreadId, mockCommentId),
        'user-456'
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'Anda tidak berhak atas comment ini'
      );
    });
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    const getPutRoute = (threadId, commentId) => ({
      method: 'PUT',
      url: `/threads/${threadId}/comments/${commentId}/likes`,
    });

    it('should response 200 and like comment succesfully', async () => {
      // Arrange
      const mockCommentId = 'comment-123';
      await CommentsTableTestHelper.addComment({
        id: mockCommentId,
        owner: mockUserId,
        threadId: mockThreadId,
      });

      // Action
      const response = await createInjectServer(
        getPutRoute(mockThreadId, mockCommentId)
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 200 and unlike comment succesfully', async () => {
      // Arrange
      const mockCommentId = 'comment-123';
      await CommentsTableTestHelper.addComment({
        id: mockCommentId,
        owner: mockUserId,
        threadId: mockThreadId,
      });
      await LikesCommentTableTestHelper.addLikes({});

      // Action
      const response = await createInjectServer(
        getPutRoute(mockThreadId, mockCommentId)
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const mockCommentId = 'comment-123';
      await CommentsTableTestHelper.addComment({
        id: mockCommentId,
        owner: mockUserId,
        threadId: mockThreadId,
      });

      // Action
      const response = await createInjectServer(
        getPutRoute('thread-456', mockCommentId)
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should response 404 when comment not found', async () => {
      // Arrange
      const mockCommentId = 'comment-123';
      await CommentsTableTestHelper.addComment({
        id: mockCommentId,
        owner: mockUserId,
        threadId: mockThreadId,
      });

      // Action
      const response = await createInjectServer(
        getPutRoute(mockThreadId, 'comment-456')
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Comment tidak ditemukan');
    });
  });
});
