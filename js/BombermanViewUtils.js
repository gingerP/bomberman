class BombermanViewUtils {
  static addClass(element, className) {
    const classes = element.className.split(' ');
    if (classes.indexOf(className) === -1) {
      element.className += ` ${className}`;
    }
    return this;
  }

  static removeClass(element, className) {
    element.className = element.className
      .replace(new RegExp(`\\b${className}\\b`, 'g'), '')
      .replace(/\s{2,}/g, ' ');
    return this;
  }
}