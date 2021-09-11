const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(newThread) {
    const { title, body, owner } = newThread;
    const id = `thread-${this._idGenerator()}`;
    const threadDate = new Date().toISOString();

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING *',
      values: [id, title, body, threadDate, owner],
    };

    const result = await this._pool.query(query);

    return new AddedThread({ ...result.rows[0] });
  }

  async getThreadById(threadId) {
    const query = {
      text: `
        SELECT threads.*, users.username
        FROM threads 
        LEFT JOIN users ON threads.owner = users.id
        WHERE threads.id = $1
      `,
      values: [threadId],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Thread tidak ditemukan');
    }
    console.log(rows[0]);
    return rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;
