const DetailThread = require('../../Domains/threads/entities/DetailThread');

class GetDetailThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const thread = await this._threadRepository.getThreadById(useCasePayload);
    const comments = await this._commentRepository.getCommentsByThreadId(
      useCasePayload
    );
    const replies = await Promise.all(
      comments.map(({ id }) => this._replyRepository.getRepliesByCommentId(id))
    );

    return new DetailThread({
      ...thread,
      comments: comments.map((comment, index) => ({
        ...comment,
        replies: replies[index],
      })),
    });
  }
}

module.exports = GetDetailThreadUseCase;
