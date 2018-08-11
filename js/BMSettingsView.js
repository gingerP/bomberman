class BMSettingsView extends BMObservable {
  constructor() {
    super();
    this.bindView();
    this.initEvents();
  }

  bindView() {
    this.remoteSdpView = document.querySelector('.remote-sdp-value');
    this.submitButton = document.querySelector('.handshake-submit');
    this.connection = {
      status: document.querySelector('.game-connection-status'),
      content: document.querySelector('.game-connection-content')
    };
    this.receiveOffer = {
      tab: document.querySelector('input.receive-offer-button'),
      content: document.querySelector('.handshake-receive-offer-container'),
      remoteSdp: document.querySelector('.handshake-receive-offer-container .remote-sdp-value'),
      localAnswerSdp: document.querySelector('.handshake-receive-offer-container .local-sdp-value')
    };
    this.createOffer = {
      tab: document.querySelector('input.create-offer-button'),
      content: document.querySelector('.handshake-create-offer-container'),
      localSdp: document.querySelector('.handshake-create-offer-container .local-sdp-value'),
      remoteAnswerSdp: document.querySelector('.handshake-create-offer-container .remote-sdp-value')
    };
  }

  setConnected() {
    this.connection.status.innerText = 'Connected';
    BMViewUtils.addClass('connected', this.connection.status);
  }

  setDisconnected() {
    this.connection.status.innerText = 'Disconnected';
    BMViewUtils.removeClass('connected', this.connection.status);
  }

  setLocalSdpForCreateOffer(localSdp) {
    this.createOffer.localSdp.innerText = localSdp;
  }

  getRemoteAnswerSdpForCreateOffer() {
    return this.createOffer.remoteAnswerSdp.value;
  }

  getRemoteSdpForReceiveOffer() {
    return this.receiveOffer.remoteSdp.value;
  }

  setLocalAnswerSdpForReceiveOffer(localSdp) {
    this.receiveOffer.localAnswerSdp.innerText = localSdp;
  }

  getRemoteSdp() {
    return this.remoteSdpView.value;
  }

  onSubmit(callback) {
    this.on('submit-connection', callback);
  }

  onReceiveOffer(callback) {
    this.on('receive-offer', callback);
  }

  onCreateOffer(callback) {
    this.on('create-offer', callback);
  }

  initEvents() {
    this.receiveOffer.tab.addEventListener('click', async () => {
      BMViewUtils
        .addClass('selected', this.receiveOffer.content)
        .removeClass('selected', this.createOffer.content);
      await this.emit('receive-offer');
    });
    this.createOffer.tab.addEventListener('click', async () => {
      BMViewUtils
        .addClass('selected', this.createOffer.content)
        .removeClass('selected', this.receiveOffer.content);
      await this.emit('create-offer');
    });
    this.submitButton.addEventListener('click', async () => {
      await this.emit('submit-connection');
    });
    this.connection.status.addEventListener('click', async (event) => {
      if (BMViewUtils.isHidden(this.connection.content)) {
        BMViewUtils.show(this.connection.content);
      } else {
        BMViewUtils.hide(this.connection.content);
      }
      event.preventDefault();
    });
  }
}
