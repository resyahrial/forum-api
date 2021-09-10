const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      owner: 'user-123',
    };

    // mock dependency
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest.fn().mockImplementation(() => {
      Promise.resolve({ id: useCasePayload.commentId, is_delete: true });
    });

    // use case instance
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockCommentRepository.verifyComment).toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.deleteComment).toBeCalledWith(
      useCasePayload.commentId
    );
  });
});
