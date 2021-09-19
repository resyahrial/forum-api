const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler({ payload, params, auth }, h) {
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const addedComment = await addReplyUseCase.execute({
      ...payload,
      ...params,
      owner: auth.credentials.id,
    });

    return h
      .response({
        status: 'success',
        data: {
          addedComment,
        },
      })
      .code(201);
  }

  async deleteReplyHandler({ params, auth }, h) {
    const deleteReplyUseCase = this._container.getInstance(
      DeleteReplyUseCase.name
    );
    await deleteReplyUseCase.execute({
      ...params,
      owner: auth.credentials.id,
    });

    return { status: 'success' };
  }
}

module.exports = RepliesHandler;
