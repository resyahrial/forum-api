const DetailReply = require('../DetailReply');

describe('DetailReply entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      content: 'New Reply',
    };

    expect(() => new DetailReply(payload)).toThrowError(
      'DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 12345,
      username: 'user1',
      date: '2021-08-08T07:22:33.555Z',
      content: 'New Reply',
    };

    // Action & Assert
    expect(() => new DetailReply(payload)).toThrowError(
      'DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should throw error when date cannot convert to proper date type', () => {
    // Arrange
    const payload = {
      id: 'reply-qwerty',
      username: 'user1',
      date: 'asd',
      content: 'New Reply',
    };

    // Action & Assert
    expect(() => new DetailReply(payload)).toThrowError(
      'DETAIL_REPLY.STRING_DATE_INVALID'
    );
  });

  it('should create DetailReply entities correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-qwerty',
      username: 'user1',
      date: '2021-08-08T07:22:33.555Z',
      content: 'New Reply',
      is_delete: false,
    };

    // Action
    const detailReply = new DetailReply(payload);

    // Assert
    expect(detailReply).toBeInstanceOf(DetailReply);
    expect(detailReply.id).toEqual(payload.id);
    expect(detailReply.username).toEqual(payload.username);
    expect(detailReply.date).toEqual(payload.date);
    expect(detailReply.content).toEqual(payload.content);
  });

  it('should replace content with template if comment was deleted', () => {
    // Arrange
    const payload = {
      id: 'reply-qwerty',
      username: 'user1',
      date: '2021-08-08T07:22:33.555Z',
      content: 'New Reply',
      is_delete: true,
    };

    // Action
    const detailReply = new DetailReply(payload);

    // Assert
    expect(detailReply.content).toEqual('**balasan telah dihapus**');
  });
});
