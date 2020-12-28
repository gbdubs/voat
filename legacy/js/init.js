$(function() {

  var gridHeight = -1;
  var gridWidth = -1;

  var ELEMS = {
    cells: [],
    tops: [],
    bots: [],
    topGroups: [],
    cellGroups: [],
    botGroups: [],
    groupsInv: {},
    empty: function() {
      this.cells = [];
      this.tops = [];
      this.bots = [];
    },
    newRow: function() {
      this.cells.push([]);
      this.tops.push([]);
      this.bots.push([]);
    },
    addCell: function(cell) {
      var row = this.cells.length - 1;
      this.cells[row].push(cell);
      this.tops[row].push($("div:first-of-type", cell));
      this.bots[row].push($("div:last-of-type", cell));
    },
    assignCellGroup: function(i, j, g){
      if (!this.cellGroups[i]){
        this.cellGroups[i] = [];
      }
      this.cellGroups[i][j] = g;
      this.groupsInv[g] = {"i": i, "j": j, "type": "cell"};
    },
    assignTopGroup: function(i, j, g){
      if (!this.topGroups[i]){
        this.topGroups[i] = [];
      }
      this.topGroups[i][j] = g;
      this.groupsInv[g] = {"i": i, "j": j, "type": "top"};
    },
    assignBotGroup: function(i, j, g){
      if (!this.botGroups[i]){
        this.botGroups[i] = [];
      }
      this.botGroups[i][j] = g;
      this.groupsInv[g] = {"i": i, "j": j, "type": "bot"};
    },
    getGroupElement: function(g){
      var coords = this.groupsInv[g];
      if (coords.type == "bot"){
        return this.bots[coords.i][coords.j];
      } else if (coords.type == "cell"){
        return this.cells[coords.i][coords.j];
      } else if (coords.type == "top"){
        return this.tops[coords.i][coords.j];
      } else {
        return "Incomplete Conditional";
      }
    }
  }

  function createGrid() {
  	var grid = $(".grid");
    var rowTemplate = $(".row.hidden");
    var cellTemplate = $(".cell.hidden.c");
    var cellTemplate = $(".cell.hidden.f");

    $(grid).empty().css("top", heightOffset).css("left", widthOffset);
    ELEMS.empty();

    var cellWidth = $(cellTemplate).width();
    var cellHeight = $(cellTemplate).height();

    var heightOffset = -1 * cellHeight * Math.random();
    var widthOffset = -1 * cellWidth * Math.random();
    gridHeight = Math.ceil(($(window).height() - heightOffset) / cellHeight);
    gridWidth = Math.ceil(($(window).width() - widthOffset) / cellWidth);
   
    var rowsToAddToGrid = [];
    for (var i = 0; i < gridHeight; i++) {
      var row = $(rowTemplate).clone().removeClass("hidden");
      rowsToAddToGrid.push(row);
      ELEMS.newRow();
      var cellsToAddToRow = [];
      for (var j = 0; j < gridWidth; j++) {
        var cell = $(cellTemplate).clone().removeClass("hidden");
        if (Math.random() > .5) {
          cell.addClass("rot");
        }
        cellsToAddToRow.push(cell);
        ELEMS.addCell(cell);
      }
      $(row).append(cellsToAddToRow);
    }
    $(grid).append(rowsToAddToGrid);
  }

  var GROUPS = {
    assignInitialGroups: function() {
      for (var i = 0; i < gridHeight; i++) {
        for (var j = 0; j < gridWidth; j++) {
          var base = ((i * gridWidth) + j) * 3;
          ELEMS.assignCellGroup(i, j, base);
          ELEMS.assignTopGroup(i, j, base + 1);
          ELEMS.assignBotGroup(i, j, base + 2);
        }
      }
    },
    isRot: function(i, j) {
      return $(ELEMS.cells[i][j]).attr("class").indexOf("rot") >= 0;
    },
    getCellGroup: function(i, j) {
      return ELEMS.cellGroups[i][j];
    },
    getTopGroup: function(i, j) {
      return ELEMS.topGroups[i][j];
    },
    getBottomGroup: function(i, j) {
      return ELEMS.botGroups[i][j];
    },
    getTouchingTop: function(i, j) {
      var result = [];
      if (this.isRot(i, j)) {
        if (j < gridWidth - 1) {
          if (this.isRot(i, j + 1)) {
            result.push(this.getCellGroup(i, j + 1));
          } else {
            result.push(this.getTopGroup(i, j + 1));
          }
        }
        if (i > 0) {
          if (this.isRot(i - 1, j)) {
            result.push(this.getCellGroup(i - 1, j));
          } else {
            result.push(this.getBottomGroup(i - 1, j));
          }
        }
      } else {
        if (j > 0) {
          if (this.isRot(i, j - 1)) {
            result.push(this.getTopGroup(i, j - 1));
          } else {
            result.push(this.getCellGroup(i, j - 1));
          }
        }
        if (i > 0) {
          if (this.isRot(i - 1, j)) {
            result.push(this.getBottomGroup(i - 1, j));
          } else {
            result.push(this.getCellGroup(i - 1, j));
          }
        }
      }
      result.sort();
      return result;
    },
    getTouchingBottom: function(i, j) {
      var result = [];
      if (this.isRot(i, j)) {
        if (j > 0) {
          if (this.isRot(i, j - 1)) {
            result.push(this.getCellGroup(i, j - 1));
          } else {
            result.push(this.getBottomGroup(i, j - 1));
          }
        }
        if (i < gridHeight - 1) {
          if (this.isRot(i + 1, j)) {
            result.push(this.getCellGroup(i + 1, j));
          } else {
            result.push(this.getTopGroup(i + 1, j));
          }
        }
      } else {
        if (j < gridWidth - 1) {
          if (this.isRot(i, j + 1)) {
            result.push(this.getBottomGroup(i, j + 1));
          } else {
            result.push(this.getCellGroup(i, j + 1));
          }
        }
        if (i < gridHeight - 1) {
          if (this.isRot(i + 1, j)) {
            result.push(this.getTopGroup(i + 1, j));
          } else {
            result.push(this.getCellGroup(i + 1, j));
          }
        }
      }
      result.sort();
      return result;
    },
    getTouchingCell: function(i, j) {
      var result = [];
      var thisRot = this.isRot(i, j);
      if (i > 0) {
        if (this.isRot(i - 1, j) == thisRot) {
          result.push(this.getBottomGroup(i - 1, j));
        } else {
          result.push(this.getCellGroup(i - 1, j));
        }
      }
      if (i < gridHeight - 1) {
        if (this.isRot(i + 1, j) == thisRot) {
          result.push(this.getTopGroup(i + 1, j));
        } else {
          result.push(this.getCellGroup(i + 1, j));
        }
      }
      if (j > 0) {
        if (this.isRot(i, j - 1) != thisRot) {
          result.push(this.getCellGroup(i, j - 1));
        } else {
          if (thisRot) {
            result.push(this.getTopGroup(i, j - 1));
          } else {
            result.push(this.getBottomGroup(i, j - 1));
          }
        }
      }
      if (j < gridWidth - 1) {
        if (this.isRot(i, j + 1) != thisRot) {
          result.push(this.getCellGroup(i, j + 1));
        } else {
          if (thisRot) {
            result.push(this.getBottomGroup(i, j + 1));
          } else {
            result.push(this.getTopGroup(i, j + 1));
          }
        }
      }
      result.sort();
      return result;
    },
    getTouchingMapping: function() {
      var mapping = {};
      for (var i = 0; i < gridHeight; i++) {
        for (var j = 0; j < gridWidth; j++) {
          mapping[this.getCellGroup(i, j)] = this.getTouchingCell(i, j);
          mapping[this.getTopGroup(i, j)] = this.getTouchingTop(i, j);
          mapping[this.getBottomGroup(i, j)] = this.getTouchingBottom(i, j);
        }
      }
      return mapping;
    },
    getClosedGroups: function(mapping) {
      var closedGroups = [];
      var nonEmptyString = "-";
      var keysAssignedToExistingClosedGroup = {};
      for (var key in mapping) {
        if (keysAssignedToExistingClosedGroup[key]) {
          continue;
        }
        keysAssignedToExistingClosedGroup[key] = nonEmptyString;
        var newClosedGroup = {};
        newClosedGroup[key] = nonEmptyString;
        var keysNotYetExpanded = {};
        keysNotYetExpanded[key] = nonEmptyString;
        var counter = 0;
        while ((Object.keys(keysNotYetExpanded).length > 0)) {
          counter = counter + 1;
          var newKeysNotYetExpanded = {};
          for (var expandingKey in keysNotYetExpanded) {
            var keysAdjacentToExpandingKey = mapping[expandingKey];
            for (var i in keysAdjacentToExpandingKey) {
              var keyAdjacentToExpandingKey = keysAdjacentToExpandingKey[i];
              if (!newClosedGroup[keyAdjacentToExpandingKey]) {
                newClosedGroup[keyAdjacentToExpandingKey] = nonEmptyString;
                newKeysNotYetExpanded[keyAdjacentToExpandingKey] = nonEmptyString;
                keysAssignedToExistingClosedGroup[keyAdjacentToExpandingKey] = nonEmptyString;
              }
            }
          }
          keysNotYetExpanded = newKeysNotYetExpanded;
        }
        closedGroups.push(newClosedGroup);
      }
      return closedGroups;
    },
    consolidateClosedGroups: function(closedGroups) {
      for (var i in closedGroups) {
        var closedGroup = closedGroups[i];
        for (var j in closedGroup) {
          ELEMS.getGroupElement(j).addClass("color-"+i);
        }
      }
    },
    assignGroupColors: function(numGroups) {
      var styles = "<style type='text/css'>";
      for (var i = 0; i < numGroups; i++) {
        styles = styles + "\n.color-"+i+" { background: "+COLORS.randomColor()+"}";
      }
      styles = styles + "</style>";
      $(styles).appendTo("head");
    },
    colorByGroup: function() {
      this.assignInitialGroups();
      var closedGroups = this.getClosedGroups(this.getTouchingMapping());
      this.consolidateClosedGroups(closedGroups);
      this.assignGroupColors(closedGroups.length);
    }
  };

  var COLORS = {
    bits: {"r": 0, "g": 1, "b": 2},
    color1: {},
    color2: {},  
    getColor1Bit: function(bit) {
      if (!this.color1[bit]){
        this.color1[bit] = parseInt($(".color-class-1").text().split(",")[this.bits[bit]]);
      }
      return this.color1[bit];
    },
    getColor2Bit: function(bit) {
      if (!this.color2[bit]){
        this.color2[bit] = parseInt($(".color-class-2").text().split(",")[this.bits[bit]]);
      }
      return this.color2[bit];
    },
    bitFromSeed: function(seed, bit) {
      var a = this.getColor1Bit(bit);
      var b = this.getColor2Bit(bit);
      return Math.floor(seed * Math.abs(a - b) + Math.min(a, b));
    },
    randomColor: function() {
      var seed = Math.random();
      return "rgb(" + this.bitFromSeed(seed, "r") + ", " +
        this.bitFromSeed(seed, "g") + ", " +
        this.bitFromSeed(seed, "b") + ")";
    },
  };

  function render() {
    createGrid();
    GROUPS.colorByGroup();
  }

  render();
});