class BMGameViewUtils {
  static loadImage(path) {
    const image = new Image();
    image.src = path;
    return new Promise((resolve, reject) => {
      image.addEventListener('load', () => resolve(image), false);
      image.addEventListener('error', reject, false);
    });
  }
}