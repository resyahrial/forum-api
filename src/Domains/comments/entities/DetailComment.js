const DetailReply = require('../../replies/entities/DetailReply');

class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.username = payload.username;
    this.date = payload.date;
    this.content = payload?.is_delete
      ? '**komentar telah dihapus**'
      : payload.content;
    this.replies = payload?.replies?.map((reply) => new DetailReply(reply));
  }

  _verifyPayload(payload) {
    const { id, username, date, content, replies = [] } = payload;
    const is_delete = payload.is_delete || false;

    if (!id || !username || !date || !content) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' ||
      typeof username !== 'string' ||
      typeof date !== 'string' ||
      typeof content !== 'string' ||
      typeof is_delete !== 'boolean' ||
      !Array.isArray(replies)
    ) {
      throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (String(new Date(date)) === 'Invalid Date') {
      throw new Error('DETAIL_COMMENT.STRING_DATE_INVALID');
    }
  }
}

module.exports = DetailComment;
