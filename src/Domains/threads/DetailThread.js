const DetailComment = require('../comments/DetailComment');

class DetailThread {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.title = payload.title;
    this.body = payload.body;
    this.date = payload.date;
    this.username = payload.username;
    this.comments = payload.comments.map(
      (comment) => new DetailComment(comment)
    );
  }

  _verifyPayload(payload) {
    const { id, title, body, date, username, comments = [] } = payload;

    if (!id || !title || !body || !username || !date) {
      throw new Error('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' ||
      typeof title !== 'string' ||
      typeof body !== 'string' ||
      typeof username !== 'string' ||
      typeof date !== 'string' ||
      !Array.isArray(comments)
    ) {
      throw new Error('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (String(new Date(date)) === 'Invalid Date') {
      throw new Error('DETAIL_THREAD.STRING_DATE_INVALID');
    }
  }
}

module.exports = DetailThread;
