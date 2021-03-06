const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(newReply) {
    const { content, commentId, owner } = newReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5) RETURNING *',
      values: [id, content, date, owner, commentId],
    };

    const { rows } = await this._pool.query(query);

    return rows[0];
  }

  async verifyReply({ replyId, owner }) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Balasan tidak ditemukan');
    }

    const isUserAuthorize = rows[0].owner === owner;
    if (!isUserAuthorize) {
      throw new AuthorizationError('Anda tidak berhak atas balasan ini');
    }
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = true WHERE id = $1 RETURNING id, is_delete',
      values: [replyId],
    };

    const { rows } = await this._pool.query(query);

    return rows[0];
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `
        SELECT replies.*, users.username
        FROM replies 
        LEFT JOIN users ON replies.owner = users.id
        WHERE comment_id = $1
        ORDER BY replies.date
      `,
      values: [commentId],
    };

    const { rows } = await this._pool.query(query);

    return rows;
  }
}

module.exports = ReplyRepositoryPostgres;
