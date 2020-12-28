class Grid {
  constructor (random, gridElement, templatesWrapperElement) {
    this.originalRandom = random.clone();
    this.random = random;
    this.gridElement = gridElement;
    this.templatesWrapperElement = templatesWrapperElement;
    this.dimensions = this.getDimensionsToFillElement();
    this.render();
    this.fillToActualDimensions = false;
  }
  
  getDimensionsToFillElement() {
    const rowTemplate = $("#row-template", this.templatesWrapperElement);
    const cellTemplate = $("#cell-template", this.templatesWrapperElement);
  
    const cellWidth = $(cellTemplate).width();
    const cellHeight = $(cellTemplate).height();
    const heightOffset = -1 * cellHeight * this.random.next();
    const widthOffset = -1 * cellWidth * this.random.next();
    const gridHeight = Math.ceil(($(this.gridElement).height() - heightOffset) / cellHeight);
    const gridWidth = Math.ceil(($(this.gridElement).width() - widthOffset) / cellWidth);
    
    return {
      heightOffset: heightOffset,
      widthOffset: widthOffset,
      gridHeight: gridHeight,
      gridWidth: gridWidth,
    };
  }
  
  randomize() {
    this.random = Random.create();
    this.originalRandom = this.random.clone();
    this.dimensions = this.getDimensionsToFillElement();
    this.render();
  }
  
  getState() {
    return {
      "random": this.originalRandom.serialize(),
      "dimensions": this.dimensions,
    };
  }
  
  setState(dict) {
    this.random = Random.createFromSerialized(dict["random"]);
    this.originalRandom = this.random.clone();
    if (this.fillToActualDimensions) {
      this.dimensions = this.getDimensionsToFillElement(); 
    } else {
      this.dimensions = dict["dimensions"];
    }
    this.render();
  }
  
  render() {
    Grid.constructGrid(this.random, this.dimensions, this.gridElement, this.templatesWrapperElement);
  }
  
  static constructGrid(random, dimensions, gridElement, templatesWrapperElement) {
    const grid = $(gridElement);
    const rowTemplate = $("#row-template", templatesWrapperElement);
    const cellTemplate = $("#cell-template", templatesWrapperElement);
    const cellTemplateRotated = $("#cell-template-rotated", templatesWrapperElement);
  
    const gridHeight = dimensions.gridHeight;
    const gridWidth = dimensions.gridWidth;

    $(grid).empty().css("top", dimensions.heightOffset).css("left", dimensions.widthOffset);
  
    const elements = {
      cells: [],
      centers: [],
      topCorners: [],
      bottomCorners: [],
      topgroups: [],
      cellgroups: [],
      botgroups: [],
      groupsInv: {},
      newRow: function() {
        this.cells.push([]);
        this.centers.push([]);
        this.topCorners.push([]);
        this.bottomCorners.push([]);
      },
      addCell: function(cell) {
        const row = this.cells.length - 1;
        this.cells[row].push(cell);
        this.centers[row].push($(".center", cell));
        this.topCorners[row].push($(".top-corner", cell));
        this.bottomCorners[row].push($(".bottom-corner", cell));
      },
      assignCellGroup: function(i, j, g){
        if (!this.cellgroups[i]){
          this.cellgroups[i] = [];
        }
        this.cellgroups[i][j] = g;
        this.groupsInv[g] = {"i": i, "j": j, "type": "center"};
      },
      assignTopGroup: function(i, j, g){
        if (!this.topgroups[i]){
          this.topgroups[i] = [];
        }
        this.topgroups[i][j] = g;
        this.groupsInv[g] = {"i": i, "j": j, "type": "top"};
      },
      assignBotGroup: function(i, j, g){
        if (!this.botgroups[i]){
          this.botgroups[i] = [];
        }
        this.botgroups[i][j] = g;
        this.groupsInv[g] = {"i": i, "j": j, "type": "bot"};
      },
      getGroupElement: function(g){
        const coords = this.groupsInv[g];
        if (coords.type == "bot"){
          return this.bottomCorners[coords.i][coords.j];
        } else if (coords.type == "center"){
          return this.centers[coords.i][coords.j];
        } else if (coords.type == "top"){
          return this.topCorners[coords.i][coords.j];
        } else {
          return "Incomplete Conditional";
        }
      }
    };
  
    const groups = {
      assignInitialgroups: function() {
        for (let i = 0; i < gridHeight; i++) {
          for (let j = 0; j < gridWidth; j++) {
            const base = ((i * gridWidth) + j) * 3;
            elements.assignCellGroup(i, j, base);
            elements.assignTopGroup(i, j, base + 1);
            elements.assignBotGroup(i, j, base + 2);
          }
        }
      },
      isRot: function(i, j) {
        return $(elements.cells[i][j]).attr("class").indexOf("rotated") >= 0;
      },
      getCellGroup: function(i, j) {
        return elements.cellgroups[i][j];
      },
      getTopGroup: function(i, j) {
        return elements.topgroups[i][j];
      },
      getBottomGroup: function(i, j) {
        return elements.botgroups[i][j];
      },
      getTouchingTop: function(i, j) {
        const result = [];
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
        const result = [];
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
        const result = [];
        const thisRot = this.isRot(i, j);
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
        const mapping = {};
        for (let i = 0; i < gridHeight; i++) {
          for (let j = 0; j < gridWidth; j++) {
            mapping[this.getCellGroup(i, j)] = this.getTouchingCell(i, j);
            mapping[this.getTopGroup(i, j)] = this.getTouchingTop(i, j);
            mapping[this.getBottomGroup(i, j)] = this.getTouchingBottom(i, j);
          }
        }
        return mapping;
      },
      getClosedgroups: function() {
        const mapping = this.getTouchingMapping();
        const closedgroups = [];
        const nonEmptyString = "-";
        const keysAssignedToExistingClosedGroup = {};
        for (let key in mapping) {
          if (keysAssignedToExistingClosedGroup[key]) {
            continue;
          }
          keysAssignedToExistingClosedGroup[key] = nonEmptyString;
          const newClosedGroup = {};
          newClosedGroup[key] = nonEmptyString;
          let keysNotYetExpanded = {};
          keysNotYetExpanded[key] = nonEmptyString;
          let counter = 0;
          while ((Object.keys(keysNotYetExpanded).length > 0)) {
            counter = counter + 1;
            const newKeysNotYetExpanded = {};
            for (let expandingKey in keysNotYetExpanded) {
              const keysAdjacentToExpandingKey = mapping[expandingKey];
              for (let i in keysAdjacentToExpandingKey) {
                const keyAdjacentToExpandingKey = keysAdjacentToExpandingKey[i];
                if (!newClosedGroup[keyAdjacentToExpandingKey]) {
                  newClosedGroup[keyAdjacentToExpandingKey] = nonEmptyString;
                  newKeysNotYetExpanded[keyAdjacentToExpandingKey] = nonEmptyString;
                  keysAssignedToExistingClosedGroup[keyAdjacentToExpandingKey] = nonEmptyString;
                }
              }
            }
            keysNotYetExpanded = newKeysNotYetExpanded;
          }
          closedgroups.push(newClosedGroup);
        }
        return closedgroups;
      }
    };
  
    const rowsToAddToGrid = [];
    for (let i = 0; i < gridHeight; i++) {
      const row = $(rowTemplate).clone();
      row.removeAttr("id");
      rowsToAddToGrid.push(row);
      elements.newRow();
      const cellsToAddToRow = [];
      for (let j = 0; j < gridWidth; j++) {
        let cell;
        if (random.next() > .5) {
          cell = $(cellTemplate).clone();
        } else {
          cell = $(cellTemplateRotated).clone();
        }
        cell.removeAttr("id");
        cellsToAddToRow.push(cell);
        elements.addCell(cell);
      }
      $(row).append(cellsToAddToRow);
    }
    $(grid).append(rowsToAddToGrid);

    groups.assignInitialgroups();
    const closedgroups = groups.getClosedgroups();
    for (let i in closedgroups) {
      const closedGroup = closedgroups[i];
      for (let j in closedGroup) {
        elements.getGroupElement(j).addClass("color-"+i);
      }
    }
  }
}
