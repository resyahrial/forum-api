class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.getThreadById(useCasePayload.threadId);
    await this._commentRepository.verifyComment(useCasePayload);
    await this._commentRepository.deleteComment(useCasePayload.commentId);
  }
}

module.exports = DeleteCommentUseCase;
