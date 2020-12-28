function getStyleInPixels(element, styleName) {
  return parseFloat(getComputedStyle(element)[styleName].replace("px", ""))
}

class RangeStyleEditor {
  constructor(styleName, unit, min, max, initialValue, initiallyVisible) {
    this.styleName = styleName;
    this.min = min;
    this.max = max;
    this.initialValue = initialValue;
    this.initiallyVisible = initiallyVisible;
    this.step = (max - min) / 50.0;
    this.unit = unit;
  }
  
  createHtmlElement() {
    const id = Math.round(Math.random() * 100000000) + "";
  
    const result = document.createElement("div");
    result.classList.add("gui-style");
    result.classList.add("gui-style-range");
    result.setAttribute("data-style-name", this.styleName)
    
    const isEnabled = document.createElement("input");
    isEnabled.type = "checkbox";
    isEnabled.classList.add("gui-setting-is-enabled");
    isEnabled.checked = "true";
    result.appendChild(isEnabled);
    
    const label = document.createElement("label");
    label.for = id;
    label.textContent = this.styleName;
    result.appendChild(label);
    
    const colon = document.createElement("span");
    colon.textContent = ":";
    result.appendChild(colon);
    
    const boxInput = document.createElement("input");
    boxInput.classList.add("gui-style-range-box");
    boxInput.type = "number";
    boxInput.name = id;
    boxInput.placeholder = this.initialValue;
    boxInput.step = this.step;
    result.appendChild(boxInput);
    
    const unitSpan = document.createElement("span");
    unitSpan.textContent = this.unit;
    result.appendChild(unitSpan);
    
    const sliderInput = document.createElement("input");
    sliderInput.classList.add("gui-style-range-slider");
    sliderInput.type = "range";
    sliderInput.name = id + "-alt";
    sliderInput.placeholder = this.initialValue;
    sliderInput.min = this.min;
    sliderInput.max = this.max;
    sliderInput.step = this.step;
    result.appendChild(sliderInput);
    
    const deleteButton = document.createElement("div");
    deleteButton.classList.add("gui-setting-delete-btn");
    deleteButton.textContent = "x";
    result.appendChild(deleteButton);
    
    return result;
  }
  
  createController(element, classController) {
    return new RangeStyleEditorController(element, classController, this);
  }
}

class RangeStyleEditorController {
  constructor(element, classController, rangeStyleEditor) {
    this.styleEditorController = new StyleEditorController(element, classController, rangeStyleEditor.initiallyVisible);
    this.initiallyVisible = rangeStyleEditor.initiallyVisible;
    this.styleName = element.data("style-name");
    this.slider = $(".gui-style-range-slider", element);
    this.box = $(".gui-style-range-box", element);
    this.min = parseInt(this.slider[0].min);
    this.max = parseInt(this.slider[0].max);
    this.initialValue = parseInt(this.slider[0].placeholder);
    this.unit = rangeStyleEditor.unit;
    this.init();
  }

  init() {
    if (this.initiallyVisible) {
      this.box.val(this.initialValue);
      this.slider.val(this.initialValue);
    }
    const controller = this;
    this.slider.change(function() {
      controller.syncSliderToBox();
      controller.styleEditorController.classController.refreshCss();
    });
    controller.box.change(function() {
      controller.syncBoxToSlider();
      controller.styleEditorController.classController.refreshCss();
    });
  }
  
  syncSliderToBox() {
    this.slider.removeClass("disabled");
    this.box.val(this.slider.val());
  }
  
  syncBoxToSlider() {
    let val = parseInt(this.box.value);
    if (!val) {
      val = this.initialValue;
    }
    if (val < this.min) {
      this.slider.val(this.min);
      this.slider.addClass("disabled");
    } else if (val > this.max) {
      this.slider.val(this.max);
      this.slider.addClass("disabled");
    } else {
      this.slider.val(val);
      this.slider.removeClass("disabled");
    }
  }
  
  asCss() {
    let val = this.box.val();
    if (!val) {
      val = this.initialValue;
    }
    return this.styleName + ": " + this.box.val() + this.unit + ";";
  }
  
  isInEffect() {
    return this.styleEditorController.isInEffect();
  }
  
  setInputsFromComputedStyles(exampleElement) {
    let val;
    let rawStyle = getStyleInPixels(exampleElement, this.styleName);
    let numericStyle = parseFloat(rawStyle);
    if (this.unit === "%") {
      let relativeStyle;
      if (["top", "bottom", "height"].includes(this.styleName)) {
        relativeStyle = getStyleInPixels(exampleElement.parentElement, "height");
      } else if (["left", "right", "width"].includes(this.styleName)) {
        relativeStyle = getStyleInPixels(exampleElement.parentElement, "width");
      } else if (["border-radius"].includes(this.styleName)) {
        relativeStyle = 100;
      } else {
        throw "Unsupported Style: " + this.styleName
      }
      val = 100 * numericStyle / relativeStyle;
    } else if (this.unit === "rem") {
      val = numericStyle / getStyleInPixels(document.documentElement, "fontSize");
    } else if (this.unit === "") {
      // val is OK
    } else {
      throw "Undefined Unit Type: " + this.unit
    }
    if (val != this.initialValue) {
      this.slider.val(val);
      this.box.val(val);
    }
  }
  
  randomize() {
    const initialRange = this.max - this.min;
    const rangeProportion = 1;
    const kindaMin = this.min + ((1 - rangeProportion) / 2) * initialRange;
    const kindaRange = rangeProportion * initialRange;
    const val = kindaMin + Math.random() * kindaRange;    
    this.slider.val(val);
    this.box.val(val);
  }
  
  reset() {
    this.box.val(this.initialValue);
    this.slider.val(this.initialValue);
    if (this.initiallyVisible) {     
      this.styleEditorController.unhide();
    } else {
      this.styleEditorController.hidden = false;
      this.styleEditorController.hide();
    }
  }
}

