const DetailComment = require('../comments/DetailComment');

class DetailThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, title, body, date, username, comments = [] } = payload;
    this.id = id;
    this.title = title;
    this.body = body;
    this.date = date;
    this.username = username;
    this.comments = comments.map((comment) => new DetailComment(comment));
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
