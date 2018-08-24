/** @class BMGame */
class BMGame {
  constructor(width = 10, height = 10) {
    this.borderWidth = 0.0;
    this.gamers = [];
    this.bombs = [];
    this.map = [];
    this.explosionsMap = [];
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
    const maps = BMGameUtils.generateMaps(this.width, this.height, 1);
    this.map = maps.map;
    this.explosionsMap = maps.explosionsMap;
    this.gamePanelView.drawBackground();
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
      await BMUtils.runInTimeGap(async () => {
        const direction = this.gamePanelView.getCurrentDirection();
        const isMoving = this.gamePanelView.isMovementKeysPressed();
        const isSpacePressed = this.gamePanelView.isSpacePressed();

        let index = this.bombs.length;
        while (index--) {
          const bomb = this.bombs[index];
          const state = bomb.updateTickState(this);
          if (state.justExploded) {
            const {x, y} = bomb.getPosition();
            this.increaseExplosionMapFromBombDirections(x, y, state.directionsForExplosion);
          }
          if (bomb.toBeDestroyed()) {
            this.bombs.splice(index, 1);
            const {x, y} = bomb.getPosition();
            this.decreaseExplosionMapFromBombDirections(x, y, state.directionsForExplosion);
          }
        }

        for (const gamer of this.gamers) {
          const state = await gamer.updateTickState({direction, isMoving, isSpacePressed});
          if (state.bomb) {
            this.bombs.push(state.bomb);
          }
        }

        this.gamePanelView.drawTick({
          gamers: this.gamers,
          bombs: this.bombs
        });
      }, 30);
    }
  }

  getSize() {
    return {
      width: this.width,
      height: this.height,
    };
  }

  getExplosionsMap() {
    return this.explosionsMap;
  }

  getMap() {
    return this.map;
  }

  getBombs() {
    return this.bombs;
  }

  getBorderWidth() {
    return this.borderWidth;
  }

  getView() {
    return this.gamePanelView;
  }

  increaseExplosionMapFromBombDirections(x, y, directions) {
    const {top, right, bottom, left} = directions;
    this.explosionsMap[y - 1][x] += Boolean(top);
    this.explosionsMap[y][x + 1] += Boolean(right);
    this.explosionsMap[y + 1][x] += Boolean(bottom);
    this.explosionsMap[y][x - 1] += Boolean(left);
  }

  decreaseExplosionMapFromBombDirections(x, y, directions) {
    const {top, right, bottom, left} = directions;
    this.explosionsMap[y - 1][x] -= Boolean(top);
    this.explosionsMap[y][x + 1] -= Boolean(right);
    this.explosionsMap[y + 1][x] -= Boolean(bottom);
    this.explosionsMap[y][x - 1] -= Boolean(left);
  }

}
