const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  const mockUserId = 'user-123';
  const mockThreadId = 'thread-123';
  const mockCommentId = 'comment-123';
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
    await CommentsTableTestHelper.addComment({
      id: mockCommentId,
      owner: mockUserId,
    });
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    const getPostRoute = (threadId, commentId, payload) => ({
      method: 'POST',
      url: `/threads/${threadId}/comments/${commentId}/replies`,
      payload,
    });

    it('should response 201 and persisted reply', async () => {
      // Arrange
      const requestPayload = {
        content: 'Reply Content',
      };

      // Action
      const response = await createInjectServer(
        getPostRoute(mockThreadId, mockCommentId, requestPayload)
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      console.log(responseJson);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'Thread title',
      };

      // Action
      const response = await createInjectServer(
        getPostRoute(mockThreadId, mockCommentId, requestPayload)
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada'
      );
    });

    it('should response 404 when thread not found or not valid', async () => {
      // Arrange
      const requestPayload = {
        content: 'Reply Content',
      };

      // Action
      const response = await createInjectServer(
        getPostRoute('thread-456', mockCommentId, requestPayload)
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should response 404 when comment not found or not valid', async () => {
      // Arrange
      const requestPayload = {
        content: 'Reply Content',
      };

      // Action
      const response = await createInjectServer(
        getPostRoute(mockThreadId, 'comment-456', requestPayload)
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Comment tidak ditemukan');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    const getDeleteRoute = (threadId, commentId, replyId) => ({
      method: 'DELETE',
      url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
    });

    it('should response 200 and delete comment succesfully', async () => {
      // Arrange
      const mockReplyId = 'reply-123';
      await RepliesTableTestHelper.addReply({
        id: mockReplyId,
        owner: mockUserId,
        commentId: mockCommentId,
      });

      // Action
      const response = await createInjectServer(
        getDeleteRoute(mockThreadId, mockCommentId, mockReplyId)
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 404 when reply not found', async () => {
      // Arrange
      const mockReplyId = 'reply-123';
      await RepliesTableTestHelper.addReply({
        id: mockReplyId,
        owner: mockUserId,
        commentId: mockCommentId,
      });

      // Action
      const response = await createInjectServer(
        getDeleteRoute(mockThreadId, mockCommentId, 'reply-456')
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Balasan tidak ditemukan');
    });

    it('should response 403 when unauthorize user try to use this endpoint', async () => {
      // Arrange
      const mockReplyId = 'reply-123';
      await RepliesTableTestHelper.addReply({
        id: mockReplyId,
        owner: mockUserId,
        commentId: mockCommentId,
      });

      // Action
      const response = await createInjectServer(
        getDeleteRoute(mockThreadId, mockCommentId, mockReplyId),
        'user-456'
      );

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'Anda tidak berhak atas balasan ini'
      );
    });
  });
});
