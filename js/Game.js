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
    const maps = await BMGameUtils.generateMaps(this.width, this.height, 1);
    this.map = maps.map;
    this.explosionsMap = maps.explosionsMap;
    this.destructible = maps.destructible;
    this.gamePanelView.drawBackground();
    this.gamePanelView.drawMap(this.map);
    const gamer = new BMGamer(this, {isLocal: true, color: GamerColors.WHITE});
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

        let bombIndex = this.bombs.length;
        while (bombIndex--) {
          const bomb = this.bombs[bombIndex];
          const state = bomb.updateTickState(this);
          this.increaseExplosionMapFromBombDirections(state.explosionsDelta);
          if (bomb.toBeDestroyed()) {
            this.bombs.splice(bombIndex, 1);
            this.decreaseExplosionMapFromBombDirections(state.explosions);
          }
        }

        let destructIndex = this.destructible.length;
        while (destructIndex--) {
          const destruct = this.destructible[destructIndex];
          destruct.updateTickState(this);
          if (destruct.toBeDestroyed()) {
            const {x, y} = destruct.getPosition();
            this.map[y][x] = BMMapPoints.FREE;
            this.destructible.splice(destructIndex, 1);
          }
        }

        let gamerIndex = this.gamers.length;
        while (gamerIndex--) {
          const gamer = this.gamers[gamerIndex];
          const state = await gamer.updateTickState({direction, isMoving, isSpacePressed});
          if (gamer.toBeDestroyed()) {
            this.gamers.splice(gamerIndex, 1);
          } else if (state.bomb) {
            this.bombs.push(state.bomb);
          }
        }

        this.gamePanelView.drawTick({
          gamers: this.gamers,
          bombs: this.bombs,
          destructible: this.destructible
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

  increaseExplosionMapFromBombDirections(explosions) {
    let index = explosions.length;
    while (index--) {
      const [y, x] = explosions[index];
      this.explosionsMap[y][x]++;
    }
  }

  decreaseExplosionMapFromBombDirections(explosions) {
    let index = explosions.length;
    while (index--) {
      const [y, x] = explosions[index];
      this.explosionsMap[y][x]--;
    }
  }
}
