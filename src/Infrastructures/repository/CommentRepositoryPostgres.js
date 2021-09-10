const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const DetailComment = require('../../Domains/comments/entities/DetailComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(newComment) {
    const { content, threadId, owner } = newComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING *',
      values: [id, content, date, owner, threadId],
    };

    const { rows } = await this._pool.query(query);

    return new AddedComment({ ...rows[0] });
  }

  async verifyComment({ commentId, owner }) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [commentId],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Comment tidak ditemukan');
    }

    const isUserAuthorize = rows[0].owner === owner;
    if (!isUserAuthorize) {
      throw new AuthorizationError('Anda tidak berhak atas comment ini');
    }
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1 RETURNING id, is_delete',
      values: [commentId],
    };

    const { rows } = await this._pool.query(query);

    return rows[0];
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `
        SELECT comments.*, users.username
        FROM comments 
        LEFT JOIN users ON comments.owner = users.id
        WHERE thread_id = $1
      `,
      values: [threadId],
    };

    const { rows } = await this._pool.query(query);

    return rows.map((row) => new DetailComment(row));
  }
}

module.exports = CommentRepositoryPostgres;
