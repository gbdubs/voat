class Library {
  constructor() {
    this.cursorStr = "";
    this.isCurrentlyFetching = false;
    this.libraryEntries = $("#library-entries");
    this.init();
  }
  
  init() {
    const library = this;
    $(window).scroll(function () { library.getMoreEntriesIfWindowIsntFilled(); });
    library.getMoreEntriesIfWindowIsntFilled();
  }
  
  getMoreEntriesIfWindowIsntFilled () {
    const library = this;
    if ($(window).height() - window.innerHeight - $(window).scrollTop() < 500) {
      if (!this.fetching) {
        this.fetching = true;
        const payload = JSON.stringify({
          "CursorStr": library.cursorStr
        });
        $.ajax({
          method: "POST",
          url: "https://us-west3-voat-app-0.cloudfunctions.net/voat-app-list", 
          body: payload,
          data: payload,
          success: function(data) { library.appendToLibraryFromResponse(data) },
        });
      }
    }
  }
  
  appendToLibraryFromResponse (data) {
    this.fetching = false;
    const parsed = JSON.parse(data);
    this.cursorStr = parsed.CursorStr;
    const patterns = parsed.Patterns;
    for (let i in patterns) {
      const creator = patterns[i].Creator;
      const template = patterns[i].Template;
      const title = patterns[i].Title;
      const statePayload = JSON.parse(data).Patterns[i].Payload;
      
      const id = "le" + Math.round(Math.random() * 1000000);
      const element = $("#library-entry-template").clone().attr("id", id).removeClass("hidden");
      $(".title", element).text(title);
      $(".creator", element).text(creator);
      $(".editor-link", element).attr("href", "../editor?ps=" + statePayload);
      this.libraryEntries.append(element);
      
      const scope = "#" + id;
      
      const gridController = new Grid(Random.create(), $(".library-entry-grid", element), $("#grid-templates"));
      gridController.fillToActualDimensions = true;
      const state = new State(
        StatefulProperty.ofController("Grid", gridController),
        StatefulProperty.ofController("Colors", new ColorPallete(scope, $(".color-styles", element))),
        StatefulProperty.ofController("Editor", new ScopedStyleController(scope, $(".editor-styles", element))),
      );
      state.loadFromStringState(statePayload);
    }
    this.getMoreEntriesIfWindowIsntFilled();
  }
}