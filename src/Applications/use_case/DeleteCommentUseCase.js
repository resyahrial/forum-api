class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    await this._commentRepository.verifyComment(useCasePayload);
    await this._commentRepository.deleteComment(useCasePayload.commentId);
  }
}

module.exports = DeleteCommentUseCase;
