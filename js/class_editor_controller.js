const CLASS_EDITOR_CONSTANTS = {
  CLASSES: {
    WRAPPER: "gui-class",
    COLLAPSED: "collapsed",
    TITLE: "gui-class-title",
    HIDDEN_STYLE: "gui-class-hidden-style",
    HIDDEN_STYLES: "gui-class-hidden-styles",
  }, 
  DATA: {
    CLASS_NAME: "data-class-name",
    STYLE_NAME: "data-style-name",
    HIDDEN_STYLE: "data-hidden-style"
  }
}

class ClassEditor {
  constructor(className, exampleElementClasses, ...styleEditors) {
    this.className = className;
    this.exampleElementClasses = exampleElementClasses;
    this.styleEditors = styleEditors;
  }
  
  createHtmlElement() {
    const result = document.createElement("div");
    result.classList.add(CLASS_EDITOR_CONSTANTS.CLASSES.WRAPPER);
    result.setAttribute(CLASS_EDITOR_CONSTANTS.DATA.CLASS_NAME, this.className);
    
    const title = document.createElement("h3");
    title.classList.add(CLASS_EDITOR_CONSTANTS.CLASSES.TITLE);
    title.textContent = "." + this.className;
    for (let i in this.exampleElementClasses) {
      const exampleElementClass = this.exampleElementClasses[i];
      const chip = document.createElement("span");
      chip.classList.add("chip");
      chip.classList.add(exampleElementClass);
      title.appendChild(chip);
    }
    result.appendChild(title);
    
    const allStyles = [];
    for (let i in this.styleEditors) {
      result.appendChild(this.styleEditors[i].createHtmlElement());
      allStyles.push(this.styleEditors[i].styleName);
    }
    
    const hiddenStyles = document.createElement("div");
    hiddenStyles.classList.add(CLASS_EDITOR_CONSTANTS.CLASSES.HIDDEN_STYLES);
    for (let i in allStyles) {
      const hiddenStyle = document.createElement("div");
      hiddenStyle.classList.add(CLASS_EDITOR_CONSTANTS.CLASSES.HIDDEN_STYLE);
      hiddenStyle.setAttribute(CLASS_EDITOR_CONSTANTS.DATA.HIDDEN_STYLE, allStyles[i]);
      hiddenStyle.textContent = allStyles[i];
      hiddenStyles.appendChild(hiddenStyle);
    }
    result.appendChild(hiddenStyles);
    
    return result;
  }
  
  createController(element, editorController) {
    const classController =  new ClassEditorController(this, element, editorController);
    for (let i in this.styleEditors) {
      const styleEditor = this.styleEditors[i];
      const styleElement = $("["+CLASS_EDITOR_CONSTANTS.DATA.STYLE_NAME+"=" + styleEditor.styleName + "]", element);        
      const styleController = styleEditor.createController(styleElement, classController);
      classController.styleControllers.push(styleController);
    }
    return classController;
  }
}

class ClassEditorController {
  constructor(classEditor, element, editorController) {
    this.editorController = editorController;
    this.classEditor = classEditor;
    this.element = element;
    this.isCollapsed = false;
    this.styleControllers = [];
    this.init();
  }
  init() {
    const controller = this;
    $("." + CLASS_EDITOR_CONSTANTS.CLASSES.TITLE, this.element).click(function() {
      controller.toggleCollapse();
    });
    this.hide();
  }
  toggleCollapse() {
    if (this.isCollapsed) {
      this.show();
    } else {
      this.hide();
    }
  }
  hide() {
    if (this.isCollapsed) {
      return;
    }
    this.isCollapsed = true;
    this.element.addClass(CLASS_EDITOR_CONSTANTS.CLASSES.COLLAPSED);
  }
  show() {
    if (!this.isCollapsed) {
      return;
    }
    this.isCollapsed = false;
    this.element.removeClass(CLASS_EDITOR_CONSTANTS.CLASSES.COLLAPSED);
  }
  asCss() {
    let css = "." + this.classEditor.className + " {"
    for (let i in this.styleControllers) {
      const styleController = this.styleControllers[i];
      if (styleController.isInEffect()) {
        css += "\n  " + styleController.asCss();   
      }
    }
    css += "\n}";
    return css;
  }
  setInputsFromComputedStyles() {
    const exampleElement = $(".grid ." + this.classEditor.className)[0];
    for (let i in this.styleControllers) {
      this.styleControllers[i].setInputsFromComputedStyles(exampleElement);
    }
  }
  refreshCss() {
    this.editorController.refreshCss();
  }
  randomize() {
    if (this.classEditor.className === "cell") {
      return;
    }
    for (let i in this.styleControllers) {
      this.styleControllers[i].randomize();
    }
  }
  reset() {
    for (let i in this.styleControllers) {
      this.styleControllers[i].reset();
    }
  }
}