const AddedReply = require('../AddedReply');

describe('AddedReply entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      title: 'New Reply',
    };

    expect(() => new AddedReply(payload)).toThrowError(
      'ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 'New Reply',
      id: 12345,
      owner: 'owner',
    };

    // Action & Assert
    expect(() => new AddedReply(payload)).toThrowError(
      'ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create AddedReply entities correctly', () => {
    // Arrange
    const payload = {
      content: 'New Reply',
      id: 'content-qwerty',
      owner: 'user-qwerty',
    };

    // Action
    const addedReply = new AddedReply(payload);

    // Assert
    expect(addedReply).toBeInstanceOf(AddedReply);
    expect(addedReply.content).toEqual(payload.content);
    expect(addedReply.id).toEqual(payload.id);
    expect(addedReply.owner).toEqual(payload.owner);
  });
});
