const DetailThread = require('../../Domains/threads/entities/DetailThread');

class GetDetailThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const thread = await this._threadRepository.getThreadById(useCasePayload);
    const comments = await this._commentRepository.getCommentsByThreadId(
      useCasePayload
    );
    return new DetailThread({
      ...thread,
      comments: comments.sort((a, b) => new Date(a.date) - new Date(b.date)),
    });
  }
}

module.exports = GetDetailThreadUseCase;
