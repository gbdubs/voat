class StyleEditorController {
  constructor(element, classController, initiallyVisible) {
    this.element = element;
    this.classController = classController;
    this.initiallyVisible = initiallyVisible;
    this.hiddenElement = $("[data-hidden-style=" + element.data("style-name") + "]", this.classController.element);
    this.hidden = true;
    this.enabled = false;
    this.overridden = false;
    this.wouldOverride = [];
    this.wouldBeOverridenBy = [];
    this.init();
  }
  
  init() {
    const styleEditorController = this;
    $(".gui-setting-delete-btn", this.element).click(function() {
      styleEditorController.hide();
    });
    $(this.hiddenElement).click(function() {
      styleEditorController.unhide();
    });
    $(".gui-setting-is-enabled", this.element).change(function() {
      if(this.checked) {
        styleEditorController.enable();
      } else {
        styleEditorController.disable();
      }
    });
    this.enable();
    if (this.initiallyVisible) {
      this.unhide();
    } else {
      this.hidden = false;
      this.hide();
    }
  }
  
  isInEffect() {
    return this.enabled && !this.overridden && !this.hidden;
  }
  
  evaluateOverriddenStatus() {
    for (let i in this.wouldBeOverridenBy) {
      const other = this.wouldBeOverridenBy[i];
      if (other.isInEffect()) {
        this.overriden = true;
        this.element.addClass("overridden");
        return;
      }
    }
    this.overriden = false;
    this.element.removeClass("overridden");
  }
  
  enable() {
    if (this.enabled) {
      return;
    }
    this.enabled = true;
    this.element.removeClass("disabled");
    for (let i in this.wouldOverride) {
      this.wouldOverride[i].evaluateOverriddenStatus();
    }
    this.refreshCss();
  }
  
  disable() {
    if (!this.enabled) {
      return;
    }
    this.enabled = false;
    this.element.addClass("disabled");
    for (let i in this.wouldOverride) {
      this.wouldOverride[i].evaluateOverriddenStatus();
    }
    this.refreshCss();
  }
  
  hide() {
    if (this.hidden) {
      return;
    }
    this.hidden = true;
    this.element.addClass("hidden");
    this.hiddenElement.removeClass("hidden");
    this.disable();
  }
  
  unhide() {
    if (!this.hidden) {
      return;
    }
    this.hidden = false;
    this.element.removeClass("hidden");
    this.hiddenElement.addClass("hidden");
    this.evaluateOverriddenStatus();
    this.enable();
  }
  
  refreshCss() {
    this.classController.refreshCss();
  }
}