const NewReply = require('../NewReply');

describe('NewReply entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      title: 'New Reply',
    };

    expect(() => new NewReply(payload)).toThrowError(
      'NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 123456,
      commentId: 'comment-qwerty',
      owner: 'user-qwerty',
    };

    // Action & Assert
    expect(() => new NewReply(payload)).toThrowError(
      'NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create NewReply entities correctly', () => {
    // Arrange
    const payload = {
      content: 'I think you need gacha',
      commentId: 'comment-qwerty',
      owner: 'user-qwerty',
    };

    // Action
    const newReply = new NewReply(payload);

    // Assert
    expect(newReply).toBeInstanceOf(NewReply);
    expect(newReply.content).toEqual(payload.content);
    expect(newReply.commentId).toEqual(payload.commentId);
    expect(newReply.owner).toEqual(payload.owner);
  });
});
