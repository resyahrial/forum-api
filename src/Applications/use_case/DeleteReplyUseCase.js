class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.getThreadById(useCasePayload.threadId);
    await this._commentRepository.verifyCommentAvailability(
      useCasePayload.commentId
    );
    await this._replyRepository.verifyReply(useCasePayload);
    await this._replyRepository.deleteReply(useCasePayload.replyId);
  }
}

module.exports = DeleteReplyUseCase;
