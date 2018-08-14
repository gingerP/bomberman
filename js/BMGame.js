/** @class BMGame */
class BMGame {
  constructor(width = 10, height = 10) {
    this.borderWidth = 0.2;
    this.gamers = [];
    this.width = width;
    this.height = height;
    this.isCycleRunning = false;
    this.isConnected = false;
    this.connection = new BMConnection();
    this.settingsView = new BMSettingsView();
    this.gamePanelView = new BMGamePanelView(50, this.width, this.height);
    this.bindToSettingsView();
    this.bindToConnection();
    this.offerAction = '';
    this.offerActions = {
      CREATE: 'create',
      RECEIVE: 'receive'
    };
  }

  async init() {
    await this.gamePanelView.init();
    this.map = BMGameUtils.generateMap(this.width, this.height);
    this.gamePanelView.drawMap(this.map);
    const gamer = new BMGamer(this);
    await gamer.init();
    this.gamers.push(gamer);
  }

  bindToSettingsView() {
    this.settingsView.onCreateOffer(async () => {
      this.offerAction = this.offerActions.CREATE;
      const response = await this.connection.createOffer();
      this.settingsView.setLocalSdpForCreateOffer(response);
    });
    this.settingsView.onReceiveOffer(() => {
      this.offerAction = this.offerActions.RECEIVE;
    });
    this.settingsView.onSubmit(async () => {
      if (this.offerAction === this.offerActions.CREATE) {
        const answerBase64 = this.settingsView.getRemoteAnswerSdpForCreateOffer();
        await this.connection.submitOfferCreation(answerBase64);
      } else if (this.offerAction === this.offerActions.RECEIVE) {
        const offerBase64 = this.settingsView.getRemoteSdpForReceiveOffer();
        const response = await this.connection.submitOfferReceiving(offerBase64);
        this.settingsView.setLocalAnswerSdpForReceiveOffer(response);
      }
    });
  }

  bindToConnection() {
    this.connection.on('connection-opened', () => {
      this.isConnected = true;
      this.settingsView.setConnected();
    });
    this.connection.on('connection-closed', () => {
      this.isConnected = false;
      this.settingsView.setDisconnected();
    });
  }

  async runCycle() {
    this.isCycleRunning = true;
    while (this.isCycleRunning) {
      await BMUtils.runInTimeGap(() => {
        requestAnimationFrame(async () => {
          await Promise.all(this.gamers.map(gamer => gamer.updateTickState()));
          this.gamePanelView.clearBuffer();
          this.gamePanelView.drawBackground(this.gamePanelView.buffer);
          this.gamePanelView.drawMap(this.map, this.gamePanelView.buffer);
          for (const gamer of this.gamers) {
            gamer.view.render(this.gamePanelView.buffer, gamer.getState());
          }
          this.gamePanelView.drawBufferToCanvas();
        });
      }, 40);
    }
  }

  getSize() {
    return {
      width: this.width,
      height: this.height,
    };
  }

  getMap() {
    return this.map;
  }

  getBorderWidth() {
    return this.borderWidth;
  }

}
