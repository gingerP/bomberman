class BMGamePanelView extends BMObservable {

  constructor(cellSize = 50, width = 10, height = 10) {
    super();
    this.mapRenderTimes = 0;
    this.cellSize = cellSize;
    this.width = width;
    this.height = height;
    this.acceptableDirections = Object.values(BMGamePanelView.Directions);
    this.currentDirection = null;
    this.pressedDirections = [];
    this.layers = [
      'background',
      'borders',
      'gamers',
      'animations'
    ];
    this.bindView();
    this.bindKeyBoard();
    this.setSize(this.width, this.height, this.canvas);
    this.bufferCanvas = document.createElement('canvas');
    this.buffer = this.bufferCanvas.getContext('2d');
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
      if (!this.pressedDirections.includes(event.keyCode)) {
        this.pressedDirections.push(event.keyCode);
      }
      if (this.acceptableDirections.includes(event.keyCode)) {
        this.currentDirection = event.keyCode;
        return;
      }
      this.currentDirection = null;
    }, false);
    document.body.addEventListener('keyup', async (event) => {
      const index = this.pressedDirections.indexOf(event.keyCode);
      if (index >= 0) {
        this.pressedDirections.splice(index);
      }
      if (this.currentDirection === event.keyCode && this.pressedDirections.length === 1) {
        [this.currentDirection] = this.pressedDirections;
      } else if (this.currentDirection === event.keyCode) {
        this.currentDirection = null;
      }
    }, false);
  }

  setSize(width, height, canvas) {
    this.width = width;
    this.height = height;
    canvas.setAttribute('width', `${this.width * this.cellSize}px`);
    canvas.setAttribute('height', `${this.height * this.cellSize}px`);
  }

  async loadResources() {
    const newImage = (path) => {
      const image = new Image();
      image.src = path;
      return image;
    };
    this.images = {
      background: newImage('/images/background_01.png'),
      wall: newImage('/images/bricks_01.png'),
      destructible: newImage('/images/wood_01.png')
    };

    return Promise.all(
      [
        BMGamePanelView.loadResource(this.images.background),
        BMGamePanelView.loadResource(this.images.destructible),
        BMGamePanelView.loadResource(this.images.wall)
      ]
    );
  }

  static async loadResource(image) {
    return new Promise((resolve, reject) => {
      image.addEventListener('load', resolve, false);
      image.addEventListener('error', reject, false);
    });
  }

  clearBuffer() {
    this.buffer.clearRect(0, 0, this.width, this.height);
  }

  drawBufferToCanvas() {
    this.context.drawImage(this.bufferCanvas, 0, 0);
  }

  drawContextToBuffer(context, params) {
    const {x, y} = params;
    this.buffer.drawImage(context, x, y);
  }

  drawBackground() {
    this.bgContext.fillStyle = this.bgContext.createPattern(this.images.background, 'repeat');
    this.bgContext.fillRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
  }

  drawMap(mapParams, context = this.mapContext, force = false) {
    this.mapRenderTimes++;
    for (let y = 0; y < mapParams.length; y++) {
      const row = mapParams[y];
      for (let x = 0; x < row.length; x++) {
        switch (row[x]) {
          case BMGameUtils.POINTS_TYPE_WALL:
            if (this.mapRenderTimes === 1 || force) {
              this.bgContext.drawImage(this.images.wall, x * this.cellSize, y * this.cellSize);
            }
            break;
          case BMGameUtils.POINTS_TYPE_DESTRUCTIBLE:
            context.drawImage(this.images.destructible, x * this.cellSize, y * this.cellSize);
            break;
          default:
        }
      }
    }
  }

  getCurrentDirection() {
    return this.currentDirection;
  }

  static get Directions() {
    return {
      LEFT: 37,
      RIGHT: 39,
      TOP: 38,
      BOTTOM: 40,
      SPACE: 32
    };
  }
}
