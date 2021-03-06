const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    // mock dependency
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve());
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyComment = jest.fn(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest.fn(() => {
      Promise.resolve({ id: useCasePayload.commentId, is_delete: true });
    });

    // use case instance
    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.getThreadById).toBeCalledWith(
      useCasePayload.threadId
    );
    expect(mockCommentRepository.verifyComment).toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.deleteComment).toBeCalledWith(
      useCasePayload.commentId
    );
  });
});
