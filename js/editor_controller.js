class Editor {
  constructor(guiWrapperElement, editorStylesElement, ...classEditors) {
    this.editorStylesElement = editorStylesElement;
    this.classEditors = classEditors;
    this.element = document.createElement("div");
    this.element.classList.add("gui");
    for (let i in this.classEditors) {
      this.element.appendChild(this.classEditors[i].createHtmlElement());
    }
    guiWrapperElement.empty().append(this.element);
  }
  
  static create() {
    return new Editor(
      $("#gui-wrapper"),
      $("#editor-styles"),
      new ClassEditor(
        "corner",
        ["a", "b", "aa", "bb"],
        new RangeStyleEditor("height", "%", 0, 200, 100, true),
        new RangeStyleEditor("width", "%", 0, 200, 100, true),
        new RangeStyleEditor("border-radius", "%", 0, 50, 50, true)
      ),
      new ClassEditor(
        "center",
        ["c", "cc"],
        new RangeStyleEditor("height", "%", 0, 200, 100, true),
        new RangeStyleEditor("width", "%", 0, 200, 100, true),
        new RangeStyleEditor("top", "%", -50, 150, 0, true),
        new RangeStyleEditor("left", "%", -50, 150, 0, true),
        new RangeStyleEditor("border-radius", "%", 0, 50, 0, false)
      ),
      new ClassEditor(
        "top-corner",
        ["a", "aa"],
        new RangeStyleEditor("top", "%",-100, 100, -50, true),
        new RangeStyleEditor("height","%", 0, 200, 100, false),
        new RangeStyleEditor("width", "%",0, 200, 100, false),
        new RangeStyleEditor("border-radius","%", 0, 50, 50, false),
      ),
      new ClassEditor(
        "bottom-corner",
        ["b", "bb"],
        new RangeStyleEditor("bottom", "%",-100, 100, -50, true),
        new RangeStyleEditor("height","%", 0, 200, 100, false),
        new RangeStyleEditor("width", "%",0, 200, 100, false),
        new RangeStyleEditor("border-radius","%", 0, 50, 50, false),
      ),
      new ClassEditor(
        "right-corner",
        ["aa", "b"],
        new RangeStyleEditor("right","%", -100, 100, -50, true),
        new RangeStyleEditor("height","%", 0, 200, 100, false),
        new RangeStyleEditor("width", "%",0, 200, 100, false),
        new RangeStyleEditor("border-radius","%", 0, 50, 50, false),
      ),
      new ClassEditor(
        "left-corner",
        ["a", "bb"],
        new RangeStyleEditor("left","%", -100, 100, -50, true),
        new RangeStyleEditor("height","%", 0, 200, 100, false),
        new RangeStyleEditor("width","%", 0, 200, 100, false),
        new RangeStyleEditor("border-radius","%", 0, 50, 50, false),
      ),
      new ClassEditor(
        "cell",
        [],
        new RangeStyleEditor("height", "rem", 0, 10, 5, true),
        new RangeStyleEditor("width", "rem", 0, 10, 5, true),
      ),
      new ClassEditor(
        "a",
        ["a"],
        new RangeStyleEditor("height","%", 0, 200, 100, false),
        new RangeStyleEditor("width", "%",0, 200, 100, false),
        new RangeStyleEditor("top","%", -100, 100, -50, false),
        new RangeStyleEditor("left","%", -100, 100, -50, false),
        new RangeStyleEditor("border-radius","%", 0, 50, 50, false),
      ),
      new ClassEditor(
        "b",
        ["b"],
        new RangeStyleEditor("height","%", 0, 200, 100, false),
        new RangeStyleEditor("width", "%",0, 200, 100, false),
        new RangeStyleEditor("bottom","%", -100, 100, -50, false),
        new RangeStyleEditor("right","%", -100, 100, -50, false),
        new RangeStyleEditor("border-radius","%", 0, 50, 50, false),
      ),
      new ClassEditor(
        "c",
        ["c"],
        new RangeStyleEditor("height","%", 0, 200, 100, false),
        new RangeStyleEditor("width", "%",0, 200, 100, false),
        new RangeStyleEditor("top","%", -100, 100, -50, false),
        new RangeStyleEditor("left","%", -100, 100, -50, false),
        new RangeStyleEditor("border-radius","%", 0, 50, 50, false),
      ),
      new ClassEditor(
        "aa",
        ["aa"],
        new RangeStyleEditor("height","%", 0, 200, 100, false),
        new RangeStyleEditor("width", "%",0, 200, 100, false),
        new RangeStyleEditor("top","%", -100, 100, -50, false),
        new RangeStyleEditor("right","%", -100, 100, -50, false),
        new RangeStyleEditor("border-radius","%", 0, 50, 50, false),
      ),
      new ClassEditor(
        "bb",
        ["bb"],
        new RangeStyleEditor("height","%", 0, 200, 100, false),
        new RangeStyleEditor("width", "%",0, 200, 100, false),
        new RangeStyleEditor("bottom","%", -100, 100, -50, false),
        new RangeStyleEditor("left","%", -100, 100, -50, false),
        new RangeStyleEditor("border-radius","%", 0, 50, 50, false),
      ),
      new ClassEditor(
        "cc",
        ["cc"],
        new RangeStyleEditor("height","%", 0, 200, 100, false),
        new RangeStyleEditor("width", "%",0, 200, 100, false),
        new RangeStyleEditor("top","%", -100, 100, -50, false),
        new RangeStyleEditor("left","%", -100, 100, -50, false),
        new RangeStyleEditor("border-radius","%", 0, 50, 50, false),
      ),
    );


  }
}

class EditorController {
  constructor(editor, onChange) {
    this.editor = editor;
    this.editorStyles = editor.editorStylesElement;
    this.classControllers = [];
    this.onChange = onChange;
    for (let i in this.editor.classEditors) {
      const classEditor = this.editor.classEditors[i];
      const classElement = $("[data-class-name=" + classEditor.className + "]", this.editor.element)  
      const classController = classEditor.createController(classElement, this);
      this.classControllers.push(classController);
    }
  }
  
  asCss() {
    let css = "";
    for (let i in this.classControllers) {
      const classController = this.classControllers[i];
      css += "\n\n" + classController.asCss();
    }
    return css.trim();
  }
  
  refreshCss() {
    const css = this.asCss();
    this.editorStyles.html(css);
    this.onChange();
  }
  
  randomize() {
    for (let i in this.classControllers) {
      this.classControllers[i].randomize();
    }
    this.refreshCss();
  }
  
  reset() {
    this.editorStyles.html("");
    for (let i in this.classControllers) {
      this.classControllers[i].reset();
    }
    this.refreshCss();
  }
  
  getState() {
    return {
      "css": this.asCss(),
    }
  }
  
  setState(dict) {
    let css = dict["css"];
    // TODO: where are these + signs coming from?!?
    css = css.replaceAll("+", " ");
    this.editorStyles.html(css);
    for (let i in this.classControllers) {
      this.classControllers[i].setInputsFromComputedStyles();
    }
  }
}