const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../Domains/comments/CommentRepository');

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

    return rows[0];
  }

  async verifyComment({ commentId, owner }) {
    const comment = await this.verifyCommentAvailability(commentId);

    const isUserAuthorize = comment.owner === owner;
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
        SELECT comments.*, users.username, COUNT(comment_likes.comment_id) as like_count
        FROM comments
        LEFT JOIN users ON comments.owner = users.id
        LEFT JOIN comment_likes ON comments.id = comment_likes.comment_id
        WHERE comments.thread_id = $1
        GROUP BY comment_likes.comment_id, comments.id, users.username
        ORDER BY comments.date
        `,
      values: [threadId],
    };

    const { rows } = await this._pool.query(query);

    return rows;
  }

  async verifyCommentAvailability(commentId) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [commentId],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Comment tidak ditemukan');
    }

    return rows[0];
  }

  async verifyLikeComment({ commentId, userId }) {
    const query = {
      text: 'SELECT id FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    const { rowCount } = await this._pool.query(query);

    return !!rowCount;
  }

  async likeComment({ commentId, userId }) {
    const id = `comment-like-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO comment_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, commentId, userId],
    };

    const { rows } = await this._pool.query(query);

    return rows[0];
  }

  async unlikeComment({ commentId, userId }) {
    const query = {
      text: 'DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2 RETURNING id',
      values: [commentId, userId],
    };

    const { rows } = await this._pool.query(query);

    return rows[0];
  }
}

module.exports = CommentRepositoryPostgres;
