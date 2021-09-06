const AddedComment = require('../AddedComment');

describe('AddedComment entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      title: 'New Comment',
    };

    expect(() => new AddedComment(payload)).toThrowError(
      'ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      title: 'New Comment',
      id: 12345,
      owner: 'owner',
    };

    // Action & Assert
    expect(() => new AddedComment(payload)).toThrowError(
      'ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create AddedComment entities correctly', () => {
    // Arrange
    const payload = {
      content: 'New Comment',
      id: 'content-qwerty',
      owner: 'user-qwerty',
    };

    // Action
    const addedComment = new AddedComment(payload);

    // Assert
    expect(addedComment).toBeInstanceOf(AddedComment);
    expect(addedComment.content).toEqual(payload.content);
    expect(addedComment.id).toEqual(payload.id);
    expect(addedComment.owner).toEqual(payload.owner);
  });
});
