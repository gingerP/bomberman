class BMViewUtils {
  static addClass(className, element) {
    const classes = element.className.split(' ');
    if (classes.indexOf(className) === -1) {
      element.className += ` ${className}`;
    }
    return this;
  }

  static removeClass(className, element) {
    element.className = element.className
      .replace(new RegExp(`\\b${className}\\b`, 'g'), '')
      .replace(/\s{2,}/g, ' ');
    return this;
  }

  static hide(element) {
    this.addClass('bm-hidden', element);
    return this;
  }

  static show(element) {
    this.removeClass('bm-hidden', element);
    return this;
  }

  static isHidden(element) {
    return this.hasClass('bm-hidden', element);
  }

  static hasClass(className, element) {
    return ` ${element.className} `.indexOf(` ${className} `) > -1;
  }
}
