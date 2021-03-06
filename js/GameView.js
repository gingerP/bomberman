class BMGamePanelView extends BMObservable {

  constructor(cellSize = 50, width = 10, height = 10) {
    super();
    this.usingBuffer = true;
    this.animation = null;
    this.mapRenderTimes = 0;
    this.cellSize = cellSize;
    this.width = width * cellSize;
    this.height = height * cellSize;
    this.movements = [
      {code: 'left', keyboard: 37},
      {code: 'top', keyboard: 38},
      {code: 'right', keyboard: 39},
      {code: 'bottom', keyboard: 40}
    ];
    this.acceptableKeyboardCodes = [32, 37, 38, 39, 40];
    this.movementKeyboardCodes = [37, 38, 39, 40];

    this.currentKeybordCode = null;
    this.currentMovementKeyboardCode = null;
    this.pressedKeybordCodes = [];
    this.pressedMovementKeybordCodes = [];

    this.layers = [
      'background',
      'borders',
      'gamers',
      'animations'
    ];
    this.bindView();
    this.bindKeyBoard();
    this.bufferCanvas = document.createElement('canvas');
    this.bufferContext = this.bufferCanvas.getContext('2d');
    this.fpsView = document.querySelector('.fps');
    this.apply();
    this.showFps = BMUtils.throttle((fps) => {
      this.fpsView.innerText = `FPS ${fps}`;
    }, 100);
  }

  apply() {
    this.setSize(this.width, this.height, this.canvas);
    this.setSize(this.width, this.height, this.bufferCanvas);
    this.setSize(this.width, this.height, this.mapCanvas);
    this.setSize(this.width, this.height, this.bgCanvas);
  }

  async init() {
    await this.loadResources();
  }

  bindView() {
    this.mapCanvas = document.getElementById('game-panel-map');
    this.bgCanvas = document.getElementById('game-panel-background');
    this.canvas = document.getElementById('game-panel');
    if (this.canvas.getContext) {
      this.context = this.canvas.getContext('2d');
      this.bgContext = this.bgCanvas.getContext('2d');
      this.mapContext = this.mapCanvas.getContext('2d');
    } else {
      throw new Error('Canvas not supported.');
    }
  }

  bindKeyBoard() {

    document.body.addEventListener('keydown', async (event) => {
      if (this.acceptableKeyboardCodes.includes(event.keyCode)) {

        if (!this.pressedKeybordCodes.includes(event.keyCode)) {
          this.pressedKeybordCodes.push(event.keyCode);
        }

        if (this.movementKeyboardCodes.includes(event.keyCode)) {
          if (!this.pressedMovementKeybordCodes.includes(event.keyCode)) {
            this.pressedMovementKeybordCodes.push(event.keyCode);
          }
          this.currentMovementKeyboardCode = event.keyCode;
        }

        this.currentKeybordCode = event.keyCode;
      }
    }, false);

    document.body.addEventListener('keyup', async (event) => {
      if (this.acceptableKeyboardCodes.includes(event.keyCode)) {

        const pressedIndex = this.pressedKeybordCodes.indexOf(event.keyCode);
        if (pressedIndex >= 0) {
          this.pressedKeybordCodes.splice(pressedIndex, 1);
        }
        if (this.currentKeybordCode === event.keyCode && this.pressedKeybordCodes.length === 1) {
          [this.currentKeybordCode] = this.pressedKeybordCodes;
        } else if (this.currentKeybordCode === event.keyCode) {
          this.currentKeybordCode = null;
        }

        if (this.movementKeyboardCodes.includes(event.keyCode)) {
          const movementIndex = this.pressedMovementKeybordCodes.indexOf(event.keyCode);
          if (movementIndex >= 0) {
            this.pressedMovementKeybordCodes.splice(movementIndex, 1);
          }

          const len = this.pressedMovementKeybordCodes.length;
          if (len) {
            this.currentMovementKeyboardCode = this.pressedMovementKeybordCodes[len - 1];
          } else {
            this.currentMovementKeyboardCode = null;
          }

        }
      }
    }, false);

  }

  setSize(width, height, canvas) {
    canvas.setAttribute('width', `${this.width}px`);
    canvas.setAttribute('height', `${this.height}px`);
  }

  async loadResources() {
    this.images = {
      wall: null,
      background: null
    };
    [this.images.background, this.images.wall] = await Promise.all([
      GameViewStorage.loadImage('images/background_01.png'),
      GameViewStorage.loadImage('images/bricks_01.png')
    ]);
  }

  drawTick(state) {
    const animate = (time) => {
      if (this.previousAnimateTime) {
        this.showFps(Math.round(1000 / (time - this.previousAnimateTime)));
      }
      this.previousAnimateTime = time;
      if (this.animation !== null) {
        cancelAnimationFrame(this.animation);
        this.animation = null;
      }

      if (this.usingBuffer) {
        this.bufferContext.clearRect(0, 0, this.width, this.height);
        this.context.clearRect(0, 0, this.width, this.height);

        for (const destruct of state.destructible) {
          destruct.view.render(this.bufferContext, destruct.getState(), time);
        }
        for (const bomb of state.bombs) {
          bomb.view.render(this.bufferContext, bomb.getState(), time);
        }
        for (const gamer of state.gamers) {
          gamer.view.render(this.bufferContext, gamer.getState(), time);
        }

        this.drawBufferToCanvas();
      } else {

        for (const bomb of state.bombs) {
          bomb.view.clearPreviousFrame(this.context);
        }
        for (const gamer of state.gamers) {
          gamer.view.clearPreviousFrame(this.context);
        }

        for (const bomb of state.bombs) {
          bomb.view.render(this.context, bomb.getState(), time);
        }
        for (const gamer of state.gamers) {
          gamer.view.render(this.context, gamer.getState(), time);
        }
      }
    };
    this.animation = requestAnimationFrame(animate);
  }

  drawBufferToCanvas() {
    this.context.drawImage(this.bufferCanvas, 0, 0);
  }

  drawContextToBuffer(context, params) {
    const {x, y} = params;
    this.bufferContext.drawImage(context, x, y);
  }

  drawBackground() {
    this.bgContext.fillStyle = this.bgContext.createPattern(this.images.background, 'repeat');
    this.bgContext.fillRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
  }

  drawMap(mapParams) {
    for (let y = 0; y < mapParams.length; y++) {
      const row = mapParams[y];
      for (let x = 0; x < row.length; x++) {
        switch (row[x]) {
          case BMMapPoints.WALL:
            this.bgContext.drawImage(this.images.wall, x * this.cellSize, y * this.cellSize);
            break;
          default:
        }
      }
    }
  }

  isMovementKeysPressed() {
    return Boolean(this.currentMovementKeyboardCode);
  }

  isSpacePressed() {
    return Boolean(this.pressedKeybordCodes.includes(BMKeyboard.SPACE));
  }

  getCurrentDirection() {
    if (this.currentMovementKeyboardCode) {
      const movement = this._getMovementByKeyboard(this.currentMovementKeyboardCode);
      return movement ? movement.code : null;
    }
    return null;
  }

  _getMovementByKeyboard(keyboard) {
    for (const movement of this.movements) {
      if (movement.keyboard === keyboard) {
        return movement;
      }
    }
    return null;
  }
}
