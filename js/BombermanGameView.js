class BombermanGameView {
  constructor() {
    this.bindView();
    this.initEvents();
  }

  bindView() {
    this.remoteSdpView = document.querySelector('.remote-sdp-value');
    this.submitButton = document.querySelector('.handshake-submit');
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
    this.onSubmitHandler = callback;
  }

  onReceiveOffer(callback) {
    this.onReceiveOfferHandler = callback;
  }

  onCreateOffer(callback) {
    this.onCreateOfferHandler = callback;
  }

  initEvents() {
    this.receiveOffer.tab.addEventListener('click', async () => {
      BombermanViewUtils
        .addClass(this.receiveOffer.content, 'selected')
        .removeClass(this.createOffer.content, 'selected');
      if (typeof this.onReceiveOfferHandler === 'function') {
        await this.onReceiveOfferHandler();
      }
    });
    this.createOffer.tab.addEventListener('click', async () => {
      BombermanViewUtils
        .addClass(this.createOffer.content, 'selected')
        .removeClass(this.receiveOffer.content, 'selected');
      if (typeof this.onCreateOfferHandler === 'function') {
        await this.onCreateOfferHandler();
      }
    });
    this.submitButton.addEventListener('click', async () => {
      if (typeof this.onSubmitHandler === 'function') {
        await this.onSubmitHandler();
      }
    });
  }
}
