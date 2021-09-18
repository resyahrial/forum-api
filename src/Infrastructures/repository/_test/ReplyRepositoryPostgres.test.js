const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');

const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepositoryPostgres', () => {
  let mockOwner = '';
  let mockThreadId = '';
  let username = '';
  beforeEach(async () => {
    // mock user
    await UsersTableTestHelper.addUser({});
    const users = await UsersTableTestHelper.findUsersById('user-123');
    mockOwner = users[0].id;
    username = users[0].username;

    // mock thread
    await ThreadsTableTestHelper.addThread({ owner: mockOwner });
    const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
    mockThreadId = threads[0].id;
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist reply and return added reply correctly', async () => {
      // arrange
      const newReplyPayload = {
        content: 'Reply content',
        threadId: mockThreadId,
        owner: mockOwner,
      };
      const newReply = new NewReply(newReplyPayload);
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      const addedReply = await replyRepositoryPostgres.addReply(newReply);

      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies).toHaveLength(1);
      expect(addedReply).toStrictEqual(
        new AddedReply({
          ...newReplyPayload,
          id: 'reply-123',
        })
      );
    });
  });

  describe('verifyReply function', () => {
    it('should throw NotFoundError when reply not available', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        owner: mockOwner,
        threadId: mockThreadId,
      }); // memasukan user baru dengan username dicoding
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReply({
          replyId: 'reply-456',
          owner: mockOwner,
        })
      ).rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when unauthorized user access the reply', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        owner: mockOwner,
        threadId: mockThreadId,
      }); // memasukan user baru dengan username dicoding
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReply({
          replyId: 'reply-123',
          owner: 'user-456',
        })
      ).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw any error when available reply accessed by authorize user', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        owner: mockOwner,
        threadId: mockThreadId,
      });
      const correctPayload = {
        replyId: 'reply-123',
        owner: mockOwner,
      };
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReply(correctPayload)
      ).resolves.not.toThrowError(NotFoundError);
      await expect(
        replyRepositoryPostgres.verifyReply(correctPayload)
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteReply function', () => {
    it('should soft delete reply', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        owner: mockOwner,
        threadId: mockThreadId,
      }); // memasukan user baru dengan username dicoding
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // action
      const deletedReply = await replyRepositoryPostgres.deleteReply(
        'reply-123'
      );
      const replies = await RepliesTableTestHelper.findReplyById('reply-123');

      // Assert
      expect(deletedReply).toEqual({
        id: 'reply-123',
        is_delete: true,
      });
      expect(replies).toHaveLength(1);
    });
  });

  describe('getRepliesByThreadId function', () => {
    it('should return replies correctly', async () => {
      // Arrange
      const newReplyPayload = {
        owner: mockOwner,
        threadId: mockThreadId,
        date: new Date().toLocaleString(),
        content: 'New Reply',
      };
      await RepliesTableTestHelper.addReply({ ...newReplyPayload });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // action
      const repliesFirstThread =
        await replyRepositoryPostgres.getRepliesByThreadId(mockThreadId);
      const repliesSecondThread =
        await replyRepositoryPostgres.getRepliesByThreadId('thread-456');

      // Assert
      expect(repliesFirstThread).toHaveLength(1);
      expect(repliesFirstThread[0]).toStrictEqual(
        new DetailReply({
          id: 'reply-123',
          username,
          date: newReplyPayload.date,
          content: newReplyPayload.content,
        })
      );
      expect(repliesSecondThread).toHaveLength(0);
    });
  });
});
