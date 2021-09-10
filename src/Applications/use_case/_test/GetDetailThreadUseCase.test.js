const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the get detail thread action correctly', async () => {
    // Arrange
    const useCasePayload = 'thread-123';
    const currentDate = new Date();
    const detailThread = {
      id: useCasePayload,
      title: 'Title thread',
      body: 'Body Thread',
      date: new Date('September 10, 2021 10:00:00').toISOString(),
      username: 'username-user-123',
    };
    const detailFirstComment = {
      id: 'comment-123',
      username: 'username-user-123',
      date: new Date('September 10, 2021 11:00:00').toISOString(),
      content: 'Comment Content 1',
    };
    const detailSecondComment = {
      id: 'comment-456',
      username: 'username-user-456',
      date: new Date('September 10, 2021 12:00:00').toISOString(),
      content: 'Comment Content 2',
    };
    const comments = [
      new DetailComment(detailFirstComment),
      new DetailComment(detailSecondComment),
    ];
    const expectedDetailThread = new DetailThread({
      ...detailThread,
      comments,
    });

    // mock dependency
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(detailThread));
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve(comments));

    // use case instance
    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const resultDetailThread = await getDetailThreadUseCase.execute(
      useCasePayload
    );

    // Assert
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
      useCasePayload
    );
    expect(resultDetailThread).toStrictEqual(expectedDetailThread);
  });
});
