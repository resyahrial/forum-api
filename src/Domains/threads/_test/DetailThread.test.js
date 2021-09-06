const DetailComment = require('../../comments/DetailComment');
const DetailThread = require('../DetailThread');

describe('DetailThread entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      title: 'New Thread',
    };

    expect(() => new DetailThread(payload)).toThrowError(
      'DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 12345,
      title: 'Title thread',
      body: 'Body thread',
      username: 'user1',
      date: '2021-08-08T07:22:33.555Z',
      comments: [],
    };

    // Action & Assert
    expect(() => new DetailThread(payload)).toThrowError(
      'DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should throw error when date cannot convert to proper date type', () => {
    // Arrange
    const payload = {
      id: 'thread-qwerty',
      title: 'Title thread',
      body: 'Body thread',
      username: 'user1',
      date: 'asd',
      comments: [],
    };

    // Action & Assert
    expect(() => new DetailThread(payload)).toThrowError(
      'DETAIL_THREAD.STRING_DATE_INVALID'
    );
  });

  it('should create DetailThread entities correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-qwerty',
      title: 'Title thread',
      body: 'Body thread',
      username: 'user1',
      date: '2021-08-08T07:22:33.555Z',
      comments: [
        {
          id: 'comment-qwerty',
          username: 'user2',
          content: 'Comment',
          date: '2021-08-08T07:22:33.555Z',
        },
      ],
    };

    // Action
    const detailThread = new DetailThread(payload);

    // Assert
    expect(detailThread).toBeInstanceOf(DetailThread);
    expect(detailThread.id).toEqual(payload.id);
    expect(detailThread.title).toEqual(payload.title);
    expect(detailThread.body).toEqual(payload.body);
    expect(detailThread.username).toEqual(payload.username);
    expect(detailThread.date).toEqual(payload.date);
    expect(detailThread.comments[0]).toBeInstanceOf(DetailComment);
  });
});
