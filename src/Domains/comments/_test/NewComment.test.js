const NewComment = require('../NewComment');

describe('NewComment entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      title: 'New Comment',
    };

    expect(() => new NewComment(payload)).toThrowError(
      'NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 123456,
    };

    // Action & Assert
    expect(() => new NewComment(payload)).toThrowError(
      'NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create NewComment entities correctly', () => {
    // Arrange
    const payload = {
      content: 'I think you need gacha',
    };

    // Action
    const newComment = new NewComment(payload);

    // Assert
    expect(newComment).toBeInstanceOf(NewComment);
    expect(newComment.content).toEqual(payload.content);
  });
});
