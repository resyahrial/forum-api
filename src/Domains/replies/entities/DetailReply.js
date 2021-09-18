class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.username = payload.username;
    this.date = payload.date;
    this.content = payload?.is_delete
      ? '**balasan telah dihapus**'
      : payload.content;
  }

  _verifyPayload(payload) {
    const { id, username, date, content } = payload;
    const is_delete = payload.is_delete || false;

    if (!id || !username || !date || !content) {
      throw new Error('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' ||
      typeof username !== 'string' ||
      typeof date !== 'string' ||
      typeof content !== 'string' ||
      typeof is_delete !== 'boolean'
    ) {
      throw new Error('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (String(new Date(date)) === 'Invalid Date') {
      throw new Error('DETAIL_REPLY.STRING_DATE_INVALID');
    }
  }
}

module.exports = DetailComment;
