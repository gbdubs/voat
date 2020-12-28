class ScopedStyleController {
  constructor(scope, styleElement) {
    this.scope = scope;
    this.styleElement = styleElement;
  }

  setState(state) {
    const css = state.css;
    // TODO: where are these + signs coming from?!?
    const withScope = this.scope + " " + css.replaceAll("\n\.", "\n" + this.scope + " .").replaceAll("+", " ");
    this.styleElement.html(withScope);
  }
}