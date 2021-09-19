const NewReply = require('../../Domains/replies/entities/NewReply');
const AddedReply = require('../../Domains/replies/entities/AddedReply');

class AddReplyUseCase {
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
    const newReply = new NewReply(useCasePayload);
    const result = await this._replyRepository.addReply(newReply);
    return new AddedReply(result);
  }
}

module.exports = AddReplyUseCase;
