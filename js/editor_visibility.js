class EditorVisibility {  
  constructor(editorWrapper, minimizeButton) {
    this.editorWrapper = editorWrapper;
    this.minimizeButton = minimizeButton;
    this.shown = true;
  }
  
  static MINIMIZED_CLASS = "minimized";
  static MINIMIZED_CTA_TEXT = "Edit";
  static MAXIMIZED_CTA_TEXT = "Minimize";
  
  toggle() {
    if (this.shown) {
      this.hide();
    } else {
      this.show();
    }
  }
  
  show() {
    this.shown = true;
    this.editorWrapper.removeClass(EditorVisibility.MINIMIZED_CLASS);
    this.minimizeButton.text(EditorVisibility.MAXIMIZED_CTA_TEXT);
  }
  
  hide() {
    this.shown = false;
    this.editorWrapper.addClass(EditorVisibility.MINIMIZED_CLASS);
    this.minimizeButton.text(EditorVisibility.MINIMIZED_CTA_TEXT);
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