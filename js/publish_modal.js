class PublishModal {
  constructor(state) {
    this.state = state;
    this.element = $("#save-modal");
    this.init();
  }
  
  init() {
    const pm = this;
    $("#save-modal-cancel-btn").click(function() { pm.hide(); });
    $("#save-modal-save-btn").click(function() { pm.publish(); });
    this.hide();
  }

  hide() {
    this.element.addClass("hidden");
  }
  
  show() {
    this.element.removeClass("hidden");
  }
  
  publish() {
    const pm = this;
    const saveModalSaving = $("#save-modal-saving");
    saveModalSaving.removeClass("hidden");
    saveModalSaving.text("Saving...");
    $.post("https://us-west4-voat-app-0.cloudfunctions.net/voat-app-add", JSON.stringify({
        "Title": $("input[name=title]", pm.element).val(),
        "Creator": $("input[name=creator]", pm.element).val(),
        "Template": 0,
        "Payload": pm.state.getStringState(),
    }))
    .done(function(){
       saveModalSaving.text("Success!");
    })
    .fail(function(){
       saveModalSaving.text("Save Failed... try in a few minutes?");
    })
    .always(function(){
      window.setTimeout(function() {
        saveModalSaving.addClass("hidden");
        pm.hide();
      }, 1500);
    });
  }
}