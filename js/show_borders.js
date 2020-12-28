class ShowBorders {
  static SHOW_BORDERS_CLASS = "show-borders";
  
  constructor(element) {
    this.element = element;
    this.shown = false;
  }
  
  toggle() {
    if (this.shown) {
      this.hide();
    } else {
      this.show();
    }
  }
  
  show() {
    this.shown = true;
    this.element.addClass(ShowBorders.SHOW_BORDERS_CLASS);
  }
  
  hide() {
    this.shown = false;
    this.element.removeClass(ShowBorders.SHOW_BORDERS_CLASS);
  }
  
  getState() {
    return this.shown;
  }
  
  setState(state) {
    if (state) {
      this.show();
    } else {
      this.hide();
    }
  }
}