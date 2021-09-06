const AddedThread = require('../AddedThread');

describe('AddedThread entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      title: 'New Thread',
    };

    expect(() => new AddedThread(payload)).toThrowError(
      'ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      title: 'New Thread',
      id: 12345,
      owner: 'owner',
    };

    // Action & Assert
    expect(() => new AddedThread(payload)).toThrowError(
      'ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create AddedThread entities correctly', () => {
    // Arrange
    const payload = {
      title: 'New Thread',
      id: 'thread-qwerty',
      owner: 'user-qwerty',
    };

    // Action
    const addedThread = new AddedThread(payload);

    // Assert
    expect(addedThread).toBeInstanceOf(AddedThread);
    expect(addedThread.title).toEqual(payload.title);
    expect(addedThread.id).toEqual(payload.id);
    expect(addedThread.owner).toEqual(payload.owner);
  });
});
