const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetDetailThreadUseCase = require('../../../../Applications/use_case/GetDetailThreadUseCase');

class ThreadHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadHandler = this.getThreadHandler.bind(this);
  }

  async postThreadHandler({ payload, auth }, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute({
      ...payload,
      owner: auth.credentials.id,
    });
    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getThreadHandler({ params }, h) {
    const getDetailThreadUseCase = this._container.getInstance(
      GetDetailThreadUseCase.name
    );
    const thread = await getDetailThreadUseCase.execute(params.threadId);

    const response = h
      .response({
        status: 'success',
        data: {
          thread,
        },
      })
      .code(200);
    return response;
  }
}

module.exports = ThreadHandler;
