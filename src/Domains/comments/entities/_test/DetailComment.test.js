const DetailComment = require('../DetailComment');

describe('DetailComment entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      content: 'New Comment',
    };

    expect(() => new DetailComment(payload)).toThrowError(
      'DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 12345,
      username: 'user1',
      date: '2021-08-08T07:22:33.555Z',
      content: 'New Comment',
      replies: [],
      like_count: '0',
    };

    // Action & Assert
    expect(() => new DetailComment(payload)).toThrowError(
      'DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should throw error when date cannot convert to proper date type', () => {
    // Arrange
    const payload = {
      id: 'comment-qwerty',
      username: 'user1',
      date: 'asd',
      content: 'New Comment',
      replies: [],
      like_count: '0',
    };

    // Action & Assert
    expect(() => new DetailComment(payload)).toThrowError(
      'DETAIL_COMMENT.STRING_DATE_INVALID'
    );
  });

  it('should create DetailComment entities correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-qwerty',
      username: 'user1',
      date: '2021-08-08T07:22:33.555Z',
      content: 'New Comment',
      is_delete: false,
      replies: [],
      like_count: '0',
    };

    // Action
    const detailComment = new DetailComment(payload);

    // Assert
    expect(detailComment).toBeInstanceOf(DetailComment);
    expect(detailComment.id).toEqual(payload.id);
    expect(detailComment.username).toEqual(payload.username);
    expect(detailComment.date).toEqual(payload.date);
    expect(detailComment.content).toEqual(payload.content);
    expect(detailComment.likeCount).toEqual(+payload.like_count);
  });

  it('should replace content with template if comment was deleted', () => {
    // Arrange
    const payload = {
      id: 'comment-qwerty',
      username: 'user1',
      date: '2021-08-08T07:22:33.555Z',
      content: 'New Comment',
      is_delete: true,
      replies: [],
      like_count: '0',
    };

    // Action
    const detailComment = new DetailComment(payload);

    // Assert
    expect(detailComment.content).toEqual('**komentar telah dihapus**');
  });
});
