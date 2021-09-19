const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeUnlikeCommentUseCase = require('../LikeUnlikeCommentUseCase');

describe('LikeUnlikeCommentUseCase', () => {
  it('should throw error if use case payload not contain needed property', async () => {
    // Arrange
    const useCasePayload = {};
    const likeUnlikeCommentUseCase = new LikeUnlikeCommentUseCase({});

    // Action & Assert
    await expect(
      likeUnlikeCommentUseCase.execute(useCasePayload)
    ).rejects.toThrowError(
      'LIKE_UNLIKE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload not meet specification', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 123,
      userId: 'user-123',
    };
    const likeUnlikeCommentUseCase = new LikeUnlikeCommentUseCase({});

    // Action & Assert
    await expect(
      likeUnlikeCommentUseCase.execute(useCasePayload)
    ).rejects.toThrowError(
      'LIKE_UNLIKE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should throw error when commentId contain more than 50 character', async () => {
    // Arrange
    const useCasePayload = {
      commentId:
        'comment-comment-comment-comment-comment-comment-comment-comment-comment',
      userId: 'user-123',
    };
    const likeUnlikeCommentUseCase = new LikeUnlikeCommentUseCase({});

    // Action & Assert
    await expect(
      likeUnlikeCommentUseCase.execute(useCasePayload)
    ).rejects.toThrowError(
      'LIKE_UNLIKE_COMMENT_USE_CASE.COMMENT_ID_LIMIT_CHAR'
    );
  });

  it('should throw error when userId contain more than 50 character', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      userId:
        'user-user-user-user-user-user-user-user-user-user-user-user-user-user',
    };
    const likeUnlikeCommentUseCase = new LikeUnlikeCommentUseCase({});

    // Action & Assert
    await expect(
      likeUnlikeCommentUseCase.execute(useCasePayload)
    ).rejects.toThrowError('LIKE_UNLIKE_COMMENT_USE_CASE.USER_ID_LIMIT_CHAR');
  });

  it('should orchestrating the likeComment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      userId: 'user-123',
    };
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyLikeComment = jest.fn(() =>
      Promise.resolve(false)
    );
    mockCommentRepository.likeComment = jest.fn(() => Promise.resolve());
    mockCommentRepository.unlikeComment = jest.fn(() => Promise.resolve());

    const likeUnlikeCommentUseCase = new LikeUnlikeCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Act
    await likeUnlikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockCommentRepository.verifyLikeComment).toHaveBeenCalledWith(
      useCasePayload
    );
    expect(mockCommentRepository.likeComment).toHaveBeenCalledWith(
      useCasePayload
    );
    expect(mockCommentRepository.unlikeComment).toHaveBeenCalledTimes(0);
  });

  it('should orchestrating the unlikeComment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      userId: 'user-123',
    };
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyLikeComment = jest.fn(() =>
      Promise.resolve(true)
    );
    mockCommentRepository.likeComment = jest.fn(() => Promise.resolve());
    mockCommentRepository.unlikeComment = jest.fn(() => Promise.resolve());

    const likeUnlikeCommentUseCase = new LikeUnlikeCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Act
    await likeUnlikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockCommentRepository.verifyLikeComment).toHaveBeenCalledWith(
      useCasePayload
    );
    expect(mockCommentRepository.unlikeComment).toHaveBeenCalledWith(
      useCasePayload
    );
    expect(mockCommentRepository.likeComment).toHaveBeenCalledTimes(0);
  });
});
