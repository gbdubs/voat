$(function () {

	var grid = $(".grid");
	var rowTemplate = $(".row.hidden");
	var cellTemplate = $(".cell.hidden");
	
	var gridHeight = -1;
	var gridWidth = -1;
	
	var ELEMS = {
		cells: [],
		tops: [],
		bots: [],
		empty: function() {
		  this.cells = [];
		  this.tops = [];
		  this.bots = [];
		},
		newRow: function(){
		  this.cells.push([]);
		  this.tops.push([]);
		  this.bots.push([]);
		},
		addCell: function(cell){
	      var row = this.cells.length - 1;
	      this.cells[row].push(cell);
	      this.tops[row].push($("div:first-of-type", cell));
		  this.bots[row].push($("div:last-of-type", cell));
		}
	}
	
	function createGrid(){
		$(grid).empty().css("top", heightOffset).css("left", widthOffset);
		ELEMS.empty();
	
		var cellWidth = $(cellTemplate).width();
		var cellHeight = $(cellTemplate).height();
		
		var heightOffset = -1 * cellHeight * Math.random();
		var widthOffset =  -1 * cellWidth * Math.random();
		gridHeight = Math.ceil(($(window).height() - heightOffset) / cellHeight);
		gridWidth = Math.ceil(($(window).width() - widthOffset) / cellWidth);
		
		for (var i = 0; i < gridHeight; i++){
			var row = $(rowTemplate).clone().removeClass("hidden");
			ELEMS.newRow();
			for (var j = 0; j < gridWidth; j++){
				var cell = $(cellTemplate).clone().removeClass("hidden");
				if (Math.random() > .5) { cell.addClass("rot"); }
				$(row).append(cell);
				ELEMS.addCell(cell);
			}
			$(grid).append(row);
		}
	}
	
	var GROUPS = {
		assignInitialGroups: function(){
		  for (var i = 0; i < gridHeight; i++){
		    for (var j = 0; j < gridWidth; j++){
		      var base = ((i * gridWidth) + j) * 3;
		      $(ELEMS.cells[i][j]).attr("group", base);
		      $(ELEMS.tops[i][j]).attr("group", base + 1);
		      $(ELEMS.bots[i][j]).attr("group", base + 2);
		    }
		  }
		},
		isRot: function(i, j){
		  return $(ELEMS.cells[i][j]).attr("class").indexOf("rot") >= 0;
		},
		getCellGroup: function(i, j){
		  return $(ELEMS.cells[i][j]).attr("group");
		},
		getTopGroup: function(i, j){
		  return $(ELEMS.tops[i][j]).attr("group");
		},
	    getBottomGroup: function(i, j){
		  return $(ELEMS.bots[i][j]).attr("group");
		},
		getTouchingTop: function(i, j){
		  var result = [];
		  if (this.isRot(i, j)){
		    if (j < gridWidth - 1){		    
		      if (this.isRot(i, j+1)) { result.push(this.getCellGroup(i, j+1)); } 
		      else { result.push(this.getTopGroup(i, j+1)); }
		    }
		    if (i > 0){
		      if (this.isRot(i-1, j)) { result.push(this.getCellGroup(i-1, j)); } 
		      else { result.push(this.getBottomGroup(i-1, j)); }
		    }
		  } else {
		    if (j > 0){
		      if (this.isRot(i, j-1)) { result.push(this.getTopGroup(i, j-1)); } 
		      else { result.push(this.getCellGroup(i, j-1)); }
		    }
		    if (i > 0){
		      if (this.isRot(i-1, j)) { result.push(this.getBottomGroup(i-1, j)); } 
		      else { result.push(this.getCellGroup(i-1, j)); }
		    }
		  }
		  return result;
		},
		getTouchingBottom: function(i, j){
		  var result = [];
		  if (this.isRot(i, j)){
		    if (j > 0){		    
		      if (this.isRot(i, j-1)) { result.push(this.getCellGroup(i, j-1)); } 
		      else { result.push(this.getBottomGroup(i, j-1)); }
		    }
		    if (i < gridHeight - 1){
		      if (this.isRot(i+1, j)) { result.push(this.getCellGroup(i+1, j)); } 
		      else { result.push(this.getTopGroup(i+1, j)); }
		    }
		  } else {
		    if (j < gridWidth - 1){
		      if (this.isRot(i, j+1)) { result.push(this.getBottomGroup(i, j+1)); } 
		      else { result.push(this.getCellGroup(i, j+1)); }
		    }
		    if (i < gridHeight - 1){
		      if (this.isRot(i+1, j)) { result.push(this.getTopGroup(i+1, j)); } 
		      else { result.push(this.getCellGroup(i+1, j)); }
		    }
		  }
		  return result;
		},
		getTouchingCell: function(i, j){
		  var result = [];
		  var thisRot = this.isRot(i, j);
		  if (i > 0) {
			if (this.isRot(i-1, j) == thisRot){ result.push( this.getBottomGroup(i-1, j)); }
			else { result.push( this.getCellGroup(i-1, j)); }
		  }
		  if (i < gridHeight - 1){
		    if (this.isRot(i+1, j) == thisRot){ result.push( this.getTopGroup(i+1, j)); }
		    else { result.push( this.getCellGroup(i+1, j)); }
		  }
		  if (j > 0){
		    if (this.isRot(i, j-1) != thisRot){ result.push( this.getCellGroup(i, j-1)); }
		  	else {
		      if (thisRot){ result.push(this.getTopGroup(i, j-1));}
		      else { result.push(this.getBottomGroup(i, j-1)); }
		    }
		  }
		  if (j < gridWidth - 1){
		    if (this.isRot(i, j+1) != thisRot){ result.push( this.getCellGroup(i, j+1)); }
		  	else {
		      if (thisRot){ result.push(this.getBottomGroup(i, j+1));}
		      else { result.push(this.getTopGroup(i, j+1)); }
		    }
		  }
		  return result; 
		},	
		getTouchingMapping: function(){
		  var mapping = {};
		  for (var i = 0; i < gridHeight; i++){
		    for (var j = 0; j < gridWidth; j++){
		      mapping[this.getCellGroup(i, j)] = this.getTouchingCell(i, j);
		      mapping[this.getTopGroup(i, j)] = this.getTouchingTop(i, j);
		      mapping[this.getBottomGroup(i, j)] = this.getTouchingBottom(i, j);
		    }
		  }
		  return mapping;
		}	,
		getClosedGroups: function(mapping){
		  var closedGroups = [];
		  var processedKeys = {};
		  for (var key in mapping){
		    if (processedKeys[key]){
		      continue;
		    }
		    var closedGroup = {};
		    closedGroup[key] = "";
		    var lastSize = 0;
		    while (lastSize != Object.keys(closedGroup).length) {
		      lastSize = Object.keys(closedGroup).length;
		      for (var groupKey in closedGroup){
		        var newKeys = mapping[groupKey];
		        for (var k in newKeys){
		          closedGroup[newKeys[k]] = "something";
		        }
		      } 
		    }
		    closedGroups.push(closedGroup);
		    for (var k in closedGroup){
		      processedKeys[k] = "Something";
		    }
		  }
		  return closedGroups;
		},
		consolidateClosedGroups: function(closedGroups){
		  for (var i in closedGroups){
		    var closedGroup = closedGroups[i];
		    for (var j in closedGroup){
		      $("[group=" + j + "]").attr("finalgroup", i).attr("group");
		    }
		  }
		},
		assignGroupColors: function(numGroups) {
		  for (var i = 0; i < numGroups; i++){
		    $("[finalgroup=" + i + "]").css("background", COLORS.randomColor());
		  }
		},
		colorByGroup: function(){
		  this.assignInitialGroups();
		  console.log("assigned initials");
		  var closedGroups = this.getClosedGroups(this.getTouchingMapping());
		  this.consolidateClosedGroups(closedGroups);
		  this.assignGroupColors(closedGroups.length);
		}
	};
	
	var COLORS = {
		readColorBit: function(bit){
		  return parseInt($(".color-class-" + bit).text());
		}, 
		randomColor: function(){
	  	  var seed = Math.random();
	  	  return "rgb(" + this.bitFromSeed(seed, "r") + ", "
	  	    +  this.bitFromSeed(seed, "g") + ", "
	  	    + this.bitFromSeed(seed, "b") + ")";
	  	},
		bitFromSeed: function (seed, bit){
		  var a = this.readColorBit("1-" + bit);
		  var b = this.readColorBit("2-" + bit);
		  return Math.floor(seed * Math.abs(a - b) + Math.min(a, b));
		}
	};

	function render() {
		createGrid();
		GROUPS.colorByGroup();
	}
	
	render();
});