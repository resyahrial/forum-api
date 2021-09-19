const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the get detail thread action correctly', async () => {
    // Arrange
    const useCasePayload = 'thread-123';
    const detailThread = {
      id: useCasePayload,
      title: 'Title thread',
      body: 'Body Thread',
      date: new Date('September 10, 2021 10:00:00').toISOString(),
      username: 'username-user-123',
    };
    const comments = [
      {
        id: 'comment-123',
        username: 'username-user-123',
        date: new Date('September 10, 2021 11:00:00').toISOString(),
        content: 'Comment Content 1',
      },
      {
        id: 'comment-456',
        username: 'username-user-456',
        date: new Date('September 10, 2021 12:00:00').toISOString(),
        content: 'Comment Content 2',
      },
    ];
    const replies = [
      {
        id: 'reply-123',
        username: 'username-user-456',
        date: new Date('September 13, 2021 11:00:00').toISOString(),
        content: 'Reply Comment Content 1',
      },
    ];
    const expectedDetailThread = new DetailThread({
      ...detailThread,
      comments: comments.map(
        (comment, index) =>
          new DetailComment({
            ...comment,
            replies: !index
              ? replies.map((reply) => new DetailReply(reply))
              : [],
          })
      ),
    });

    // mock dependency
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadById = jest.fn(() =>
      Promise.resolve(detailThread)
    );
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getCommentsByThreadId = jest.fn(() =>
      Promise.resolve(comments)
    );
    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.getRepliesByCommentId = jest.fn((id) =>
      Promise.resolve(id === 'comment-123' ? replies : [])
    );

    // use case instance
    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
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
    comments.forEach((comment) => {
      expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith(
        comment.id
      );
    });
    expect(resultDetailThread).toStrictEqual(expectedDetailThread);
  });
});
