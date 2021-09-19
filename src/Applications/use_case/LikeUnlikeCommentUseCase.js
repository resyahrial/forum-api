class LikeUnlikeCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    await this._threadRepository.getThreadById(useCasePayload.threadId);
    const isLiked = await this._commentRepository.verifyLikeComment(
      useCasePayload
    );
    if (isLiked) {
      await this._commentRepository.unlikeComment(useCasePayload);
    } else {
      await this._commentRepository.likeComment(useCasePayload);
    }
  }

  _validatePayload(payload) {
    const { commentId, userId } = payload;
    if (!commentId || !userId) {
      throw new Error(
        'LIKE_UNLIKE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY'
      );
    }

    if (typeof commentId !== 'string' || typeof userId !== 'string') {
      throw new Error(
        'LIKE_UNLIKE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION'
      );
    }

    if (commentId.length > 50) {
      throw new Error('LIKE_UNLIKE_COMMENT_USE_CASE.COMMENT_ID_LIMIT_CHAR');
    }

    if (userId.length > 50) {
      throw new Error('LIKE_UNLIKE_COMMENT_USE_CASE.USER_ID_LIMIT_CHAR');
    }
  }
}

module.exports = LikeUnlikeCommentUseCase;
