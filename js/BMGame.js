class BMGame {
  constructor() {
    this.isConnected = false;
    this.connection = new BMConnection();
    this.view = new BMGameView();
    this.bindToSettingsView();
    this.bindToConnection();
    this.offerAction = '';
    this.offerActions = {
      CREATE: 'create',
      RECEIVE: 'receive'
    };
  }

  bindToSettingsView() {
    this.view.onCreateOffer(async () => {
      this.offerAction = this.offerActions.CREATE;
      const response = await this.connection.createOffer();
      this.view.setLocalSdpForCreateOffer(response);
    });
    this.view.onReceiveOffer(() => {
      this.offerAction = this.offerActions.RECEIVE;
    });
    this.view.onSubmit(async () => {
      if (this.offerAction === this.offerActions.CREATE) {
        const answerBase64 = this.view.getRemoteAnswerSdpForCreateOffer();
        await this.connection.submitOfferCreation(answerBase64);
      } else if (this.offerAction === this.offerActions.RECEIVE) {
        const offerBase64 = this.view.getRemoteSdpForReceiveOffer();
        const response = await this.connection.submitOfferReceiving(offerBase64);
        this.view.setLocalAnswerSdpForReceiveOffer(response);
      }
    });
  }

  bindToConnection() {
    this.connection.on('connection-opened', () => {
      this.isConnected = true;
      this.view.setConnected();
    });
    this.connection.on('connection-closed', () => {
      this.isConnected = false;
      this.view.setDisconnected();
    });
  }
}
