/** @class BMGame */
class BMGame extends BMObservable {
  constructor(width = 10, height = 10) {
    super();
    this.id = `game-${BMUtils.randomString(20)}`;
    this.borderWidth = 0.0;
    this.gamers = [];
    this.gamersConnectionsMap = {}; // {connectionId: gamerId, ...}
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
    this.bindToRemoteEvents();
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
    const gamer = new BMGamer(this, {local: true, color: GamerColors.WHITE});
    await gamer.init();
    this.gamers.push(gamer);
  }

  getId() {
    return this.id;
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
    const allRemoteEvents = Object.values(RemoteEvents);
    this.connection.on('connection-opened', () => {
      this.isConnected = true;
      this.settingsView.setConnected();
      this.emit(RemoteEvents.CONNECTION_ESTABLISHED);
    });
    this.connection.on('connection-closed', () => {
      this.isConnected = false;
      this.settingsView.setDisconnected();
    });
    this.connection.on('message-received', async (message) => {
      if (!message || !message.event) {
        console.warn(`Invalid message received: ${JSON.stringify(message)}`);
        return;
      }
      if (allRemoteEvents.includes(message.event)) {
        await this.emit(message.event, message.data || {});
        return;
      }
      console.warn(`Invalid remove event: '${message.event}'`);
    });
  }

  bindToRemoteEvents() {

/*    setTimeout(async () => {
      let slaveGamerId = this.gamersConnectionsMap[this.connection.id];
      if (!slaveGamerId) {
        const slave = new BMGamer(this, {
          isLocal: false,
          color: this.getFreeGamerColor(),
          position: this.getFreeGamerPosition()
        });
        await slave.init();
        this.gamers.push(slave);
        slaveGamerId = slave.getId();
        this.gamersConnectionsMap[this.connection.getId()] = slaveGamerId;
      }
      const data = {
        slaveGamerId,
        game: this.toJson()
      };

      for (const gamer of data.game.gamers) {
        gamer.local = gamer.id === slaveGamerId;
      }
      await this.deserialize(data.game);

    }, 2000);*/

    this.on(RemoteEvents.CONNECTION_ESTABLISHED, async () => {
      if (this.connection.isMaster()) {
        let slaveGamerId = this.gamersConnectionsMap[this.connection.id];
        if (!slaveGamerId) {
          const slave = new BMGamer(this, {
            isLocal: false,
            color: this.getFreeGamerColor(),
            position: this.getFreeGamerPosition()
          });
          await slave.init();
          this.gamers.push(slave);
          slaveGamerId = slave.getId();
          this.gamersConnectionsMap[this.connection.getId()] = slaveGamerId;
        }
        await this.send(RemoteEvents.GAME_DATA, {
          slaveGamerId,
          game: this.toJson()
        });
      }
    });
    this.on(RemoteEvents.GAME_DATA, async ({slaveGamerId, game}) => {
      if (BMGameUtils.isClass(game, BMGame.name)) {
        if (this.connection.isSlave()) {
          for (const gamer of game.gamers) {
            gamer.local = gamer.id === slaveGamerId;
          }
          await this.deserialize(game);
        } else if (this.connection.isMaster()) {

        }
      }
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
          let state = {};
          if (gamer.isLocal()) {
            state = await gamer.updateTickState({direction, isMoving, isSpacePressed});
          } else {
            state = gamer.getState();
          }
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

  getFreeGamerColor() {
    // TODO mock
    return GamerColors.RED;
  }

  getFreeGamerPosition() {
    // TODO mock
    return {
      x: this.width - 1.5,
      y: this.height - 1.5
    };
  }

  getLocalGamer() {
    for (const gamer of this.gamers) {
      if (gamer.isLocal()) {
        return gamer;
      }
    }
    return null;
  }

  getGamerById(id) {
    for (const gamer of this.gamers) {
      if (gamer.getId() === id) {
        return gamer;
      }
    }
    return null;
  }

  async deserialize(game) {
    this.id = game.id;
    this.gamers = [];
    this.bombs = [];
    this.destructible = [];
    this.map = game.map;

    for (const gamerData of game.gamers) {
      const gamer = await BMGamer.deserialize(this, gamerData);
      this.gamers.push(gamer);
    }

    for (const bombData of game.bombs) {
      const bomb = await BMBomb.deserialize(bombData);
      this.bombs.push(bomb);
    }

    for (const destructData of game.destructible) {
      const destruct = await Destructible.deserialize(destructData);
      this.destructible.push(destruct);
      const {x, y} = destruct.getPosition();
      this.map[y][x] = destruct;
    }

    this.gamePanelView.drawBackground();
    this.gamePanelView.drawMap(this.map);
  }

  async send(eventName, message) {
    await this.connection.send({
      event: eventName,
      data: message
    });
  }

  toJson() {
    const mapJson = [];
    for (let y = 0; y < this.map.length; y++) {
      const row = this.map[y];
      mapJson[y] = [];
      for (let x = 0; x < row.length; x++) {
        if (row[x] instanceof Destructible) {
          mapJson[y][x] = '';
        } else {
          mapJson[y][x] = row[x];
        }
      }
    }

    return {
      id: this.id,
      gamers: this.gamers.map(gamer => gamer.toJson()),
      bombs: this.bombs.map(bomb => bomb.toJson()),
      destructible: this.destructible.map(destruct => destruct.toJson()),
      map: mapJson,
      width: this.width,
      height: this.height,
      __class: this.constructor.name
    };
  }
}
