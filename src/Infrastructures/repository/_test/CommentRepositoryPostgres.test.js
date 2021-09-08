const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');

const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  let mockOwner = '';
  let mockThreadId = '';
  beforeEach(async () => {
    // mock user
    await UsersTableTestHelper.addUser({});
    const users = await UsersTableTestHelper.findUsersById('user-123');
    mockOwner = users[0].id;

    // mock thread
    await ThreadsTableTestHelper.addThread({ owner: mockOwner });
    const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
    mockThreadId = threads[0].id;
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
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
      expect(addedComment).toStrictEqual(
        new AddedComment({
          ...newCommentPayload,
          id: 'comment-123',
        })
      );
    });
  });

  describe('verifyComment function', () => {
    it('should throw NotFoundError when comment not available', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        owner: mockOwner,
        threadId: mockThreadId,
      }); // memasukan user baru dengan username dicoding
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyComment({
          commentId: 'comment-456',
          owner: mockOwner,
        })
      ).rejects.toThrowError(NotFoundError);
    });

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
});
