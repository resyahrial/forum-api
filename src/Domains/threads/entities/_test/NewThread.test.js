const NewThread = require('../NewThread');

describe('NewThread entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      title: 'New Thread',
    };

    expect(() => new NewThread(payload)).toThrowError(
      'NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      title: 'New Thread',
      body: 12345,
      owner: 'user-qwerty',
    };

    // Action & Assert
    expect(() => new NewThread(payload)).toThrowError(
      'NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create NewThread entities correctly', () => {
    // Arrange
    const payload = {
      title: 'New Thread',
      body: 'How can I get gold armor?',
      owner: 'user-qwerty',
    };

    // Action
    const newThread = new NewThread(payload);

    // Assert
    expect(newThread).toBeInstanceOf(NewThread);
    expect(newThread.title).toEqual(payload.title);
    expect(newThread.body).toEqual(payload.body);
    expect(newThread.owner).toEqual(payload.owner);
  });
});
