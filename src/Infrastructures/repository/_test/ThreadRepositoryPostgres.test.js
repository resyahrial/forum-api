const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

const NewThread = require('../../../Domains/threads/entities/NewThread');

const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  let mockOwner = '';
  let mockUsername = '';
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({});
    const users = await UsersTableTestHelper.findUsersById('user-123');
    mockOwner = users[0].id;
    mockUsername = users[0].username;
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist thread and return added thread correctly', async () => {
      // arrange
      const newThreadPayload = {
        title: 'Thread title',
        body: 'Thread body',
        owner: mockOwner,
      };
      const newThread = new NewThread(newThreadPayload);
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      const addedThread = await threadRepositoryPostgres.addThread(newThread);
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');

      expect(threads).toHaveLength(1);
      expect(addedThread).toStrictEqual({
        ...newThreadPayload,
        id: 'thread-123',
        date: addedThread.date,
      });
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        threadRepositoryPostgres.getThreadById('thread-456')
      ).rejects.toThrowError(NotFoundError);
    });

    it('should return detail thread correctly', async () => {
      // Arrange
      const mockThreadPayload = {
        id: 'thread-123',
        title: 'Thread title',
        body: 'Thread body',
        date: new Date().toISOString(),
        owner: mockOwner,
      };
      await ThreadsTableTestHelper.addThread(mockThreadPayload);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepositoryPostgres.getThreadById(
        mockThreadPayload.id
      );

      // Assert
      expect(thread).toEqual({ ...mockThreadPayload, username: mockUsername });
    });
  });
});
