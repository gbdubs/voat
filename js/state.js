class StatefulProperty {
  constructor(identifier, getStateFunction, setStateFunction) {
    this.identifier = identifier;
    this.getStateFunction = getStateFunction;
    this.setStateFunction = setStateFunction;
  }
  
  static ofController(identifier, obj) {
    return new StatefulProperty(identifier, () => obj.getState(), (s) => obj.setState(s));
  }
}


class State {
  constructor(...sps) {
    this.getStateFns = {};
    this.setStateFns = {};
    for (let i in sps) {
      const sp = sps[i];
      this.getStateFns[sp.identifier] = sp.getStateFunction;
      this.setStateFns[sp.identifier] = sp.setStateFunction;
    }
  }
  
  static PAGE_STATE_LOCAL_STORAGE_IDENTIFIER = "page-state";
  static PAGE_STATE_URL_PARAMETER = "ps";
  
  loadFromUrl() {
    const search = window.location.search;
    if (search) {
      this.loadFromStringState(search.replace("\?"+State.PAGE_STATE_URL_PARAMETER+"=", ""));
      return true;
    }
    return false;
  }
  
  loadFromLocalStorage() {
    const stringState = window.localStorage[State.PAGE_STATE_LOCAL_STORAGE_IDENTIFIER];
    if (stringState) {
      console.log("loading from storage");
      this.loadFromStringState(stringState);
      return true;
    }
    return false;
  }
  
  saveToLocalStorage() {
    window.localStorage[State.PAGE_STATE_LOCAL_STORAGE_IDENTIFIER] = this.getStringState();
  }
  
  saveToUrl() {
    const location = window.location;
    const stringState = this.getStringState();
    const url = location.protocol + '//' + location.host + location.pathname + "?" + 
        State.PAGE_STATE_URL_PARAMETER + "=" + stringState;
    window.history.pushState(stringState, document.title, url);
  }
  
  loadFromStringState(state) {
    const stateDict = JSON.parse(decodeURIComponent(state));
    for (let identifier in stateDict) {
      if (this.setStateFns[identifier]) {
        this.setStateFns[identifier](stateDict[identifier]);
      }
    }
  }
  
  getStringState() {
    const stateDict = {};
    for (let identifier in this.setStateFns) {
      stateDict[identifier] = this.getStateFns[identifier]();
    }
    return encodeURIComponent(JSON.stringify(stateDict));
  }
}

