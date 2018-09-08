/** @class BMGame */
class BMGame extends BMObservable {
  constructor(width = 10, height = 10) {
    super();
    this.id = `game-${BMUtils.randomString(20)}`;
    this.borderWidth = 0.0;
    this.gamers = [];
    this.gamersConnectionsMap = {}; // {connectionId: gamerId, ...}
    this.bombs = [];
    this.tickBombs = [];
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
     game: this.serialize()
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
        this.gameStartedAt = Date.now();
        await this.send(RemoteEvents.GAME_DATA, {
          slaveGamerId,
          game: this.serialize()
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
          this.masterGameStartedAt = game.gameStartedAt;
          this.gameStartedAt = Date.now();
        } else if (this.connection.isMaster()) {

        }
      } else {
        console.error('Invalid game data.');
      }
    });
    this.on(RemoteEvents.GAME_STATE, async (state) => {
      if (state.gamers && state.gamers.length) {
        for (const gamerJson of state.gamers) {
          const {id} = gamerJson;
          for (const gamer of this.gamers) {
            if (gamer.getId() === id) {
              gamer.deserializeState(gamerJson.state);
            }
          }
        }
      }
      if (state.newBombs && state.newBombs.length) {
        for (const bombJson of state.newBombs) {
          this.bombs.push(await BMBomb.deserialize(bombJson));
        }
      }
    });
  }

  async runCycle() {
    this.isCycleRunning = true;
    while (this.isCycleRunning) {
      await BMUtils.runInTimeGap(async () => {
        this.tickBombs = [];
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
            this.tickBombs.push(state.bomb);
            this.bombs.push(state.bomb);
          }
        }

        this.gamePanelView.drawTick({
          gamers: this.gamers,
          bombs: this.bombs,
          destructible: this.destructible
        });
        await this.shareGameState();
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
    if (!eventName) {
      throw new Error('eventName not defined!');
    }
    await this.connection.send({
      event: eventName,
      data: message
    });
  }

  async shareGameState() {
    const stateChanges = this.getStateChanges();
    if (stateChanges) {
      await this.connection.send({
        event: RemoteEvents.GAME_STATE,
        data: stateChanges
      });
    }
  }

  getStateChanges() {
    const changes = {
      gamers: this.gamers.filter(gamer => gamer.isLocal() && gamer.hasChanges()).map(gamer => gamer.serialize()),
      newBombs: this.tickBombs.map(bomb => bomb.serialize())
    };
    return changes.gamers.length || changes.newBombs.length ? changes : null;
  }

  serialize() {
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
      gameStartedAt: this.gameStartedAt,
      gamers: this.gamers.map(gamer => gamer.serialize()),
      bombs: this.bombs.map(bomb => bomb.serialize()),
      destructible: this.destructible.map(destruct => destruct.serialize()),
      map: mapJson,
      width: this.width,
      height: this.height,
      __class: this.constructor.name
    };
  }
}
