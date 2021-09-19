const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

const NewComment = require('../../../Domains/comments/entities/NewComment');

const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const LikesCommentTableTestHelper = require('../../../../tests/LikesCommentTableTestHelper');

const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  const mockOwner = 'user-123';
  const mockThreadId = 'thread-123';
  let username = '';
  beforeAll(async () => {
    // mock user
    await UsersTableTestHelper.addUser({});
    const users = await UsersTableTestHelper.findUsersById('user-123');
    username = users[0].username;

    // mock thread
    await ThreadsTableTestHelper.addThread({ owner: mockOwner });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await LikesCommentTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist comment and return added comment correctly', async () => {
      // arrange
      const newCommentPayload = {
        content: 'Comment content',
        threadId: mockThreadId,
        owner: mockOwner,
      };
      const newComment = new NewComment(newCommentPayload);
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      const addedComment = await commentRepositoryPostgres.addComment(
        newComment
      );

      const comments = await CommentsTableTestHelper.findCommentById(
        'comment-123'
      );
      expect(comments).toHaveLength(1);
      delete newCommentPayload.threadId;
      expect(addedComment).toStrictEqual({
        ...newCommentPayload,
        id: 'comment-123',
        thread_id: mockThreadId,
        is_delete: null,
        date: addedComment.date,
      });
    });
  });

  describe('verifyComment function', () => {
    it('should throw AuthorizationError when unauthorized user access the comment', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        owner: mockOwner,
        threadId: mockThreadId,
      }); // memasukan user baru dengan username dicoding
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyComment({
          commentId: 'comment-123',
          owner: 'user-456',
        })
      ).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw any error when available comment accessed by authorize user', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        owner: mockOwner,
        threadId: mockThreadId,
      });
      const correctPayload = {
        commentId: 'comment-123',
        owner: mockOwner,
      };
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyComment(correctPayload)
      ).resolves.not.toThrowError(NotFoundError);
      await expect(
        commentRepositoryPostgres.verifyComment(correctPayload)
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteComment function', () => {
    it('should soft delete comment', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        owner: mockOwner,
        threadId: mockThreadId,
      }); // memasukan user baru dengan username dicoding
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // action
      const deletedComment = await commentRepositoryPostgres.deleteComment(
        'comment-123'
      );
      const comments = await CommentsTableTestHelper.findCommentById(
        'comment-123'
      );

      // Assert
      expect(deletedComment).toEqual({
        id: 'comment-123',
        is_delete: true,
      });
      expect(comments).toHaveLength(1);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return comments correctly', async () => {
      // Arrange
      const newCommentPayload = {
        owner: mockOwner,
        threadId: mockThreadId,
        date: new Date().toLocaleString(),
        content: 'New Comment',
      };
      await CommentsTableTestHelper.addComment({ ...newCommentPayload });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // action
      const commentsFirstThread =
        await commentRepositoryPostgres.getCommentsByThreadId(mockThreadId);
      const commentsSecondThread =
        await commentRepositoryPostgres.getCommentsByThreadId('thread-456');

      // Assert
      expect(commentsFirstThread).toHaveLength(1);
      expect(commentsSecondThread).toHaveLength(0);
      delete newCommentPayload.threadId;
      expect(commentsFirstThread[0]).toStrictEqual({
        ...newCommentPayload,
        id: 'comment-123',
        username,
        thread_id: mockThreadId,
        is_delete: null,
        like_count: '0',
      });
    });
  });

  describe('verifyCommentAvailability function', () => {
    it('should throw NotFoundError when comment not available', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        owner: mockOwner,
        threadId: mockThreadId,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentAvailability('comment-456')
      ).rejects.toThrowError(NotFoundError);
    });

    it("should success return comment's owner", async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        owner: mockOwner,
        threadId: mockThreadId,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // action
      const comment = await commentRepositoryPostgres.verifyCommentAvailability(
        'comment-123'
      );

      // Assert
      expect(comment).toStrictEqual({ owner: mockOwner });
    });
  });

  describe('verifyLikeComment function', () => {
    it('should return like comment availability', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({});
      await LikesCommentTableTestHelper.addLikes({});
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const validLike = await commentRepositoryPostgres.verifyLikeComment({
        commentId: 'comment-123',
        userId: mockOwner,
      });
      const invalidLikeByComment =
        await commentRepositoryPostgres.verifyLikeComment({
          commentId: 'comment-456',
          userId: 'user-123',
        });
      const invalidLikeByUser =
        await commentRepositoryPostgres.verifyLikeComment({
          commentId: 'comment-123',
          userId: 'user-456',
        });

      // Action & Assert
      expect(validLike).toBeTruthy();
      expect(invalidLikeByComment).toBeFalsy();
      expect(invalidLikeByUser).toBeFalsy();
    });
  });

  describe('likeComment function', () => {
    it('should persist like comment and return added like comment correctly', async () => {
      // Arrange
      const payload = {
        commentId: 'comment-123',
        userId: mockOwner,
      };
      await CommentsTableTestHelper.addComment({});
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedLikeComment = await commentRepositoryPostgres.likeComment(
        payload
      );
      const likeComment = await LikesCommentTableTestHelper.findLikeCommentById(
        addedLikeComment.id
      );

      // Action & Assert
      expect(likeComment[0]).toStrictEqual({
        id: addedLikeComment.id,
        comment_id: payload.commentId,
        user_id: payload.userId,
      });
    });
  });

  describe('unlikeComment function', () => {
    it('should delete like comment', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({});
      await LikesCommentTableTestHelper.addLikes({});
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const unlikeComment = await commentRepositoryPostgres.unlikeComment({
        commentId: 'comment-123',
        userId: mockOwner,
      });
      const result = await LikesCommentTableTestHelper.findLikeCommentById(
        unlikeComment.id
      );

      // Action & Assert
      expect(result.length).toEqual(0);
    });
  });
});
