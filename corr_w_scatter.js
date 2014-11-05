////////////////////////////////
//    DRAW SVG CONTAINERS    ///
////////////////////////////////

//draw SVG
var svg = d3.select("div#plot")
            .append("svg")
            .attr("height", h + pad.top + pad.bottom)
            .attr("width", w*2 + pad.left + pad.right + pad.middle);

//draw panel for correlation matrix
var corrPlot = svg.append("g")
                  .attr("id", "corrPlot")
                  .attr("transform", "translate(" + pad.left + "," + pad.top + ")");

//draw panel for scatter plot     
var scatPlot = svg.append("g")
                  .attr("id", "scatPlot")
                  .attr("transform", "translate(" + (pad.left + w + pad.middle) + "," + pad.top + ")")

//////////////////////////////////////////////////////
//    DRAW RECT'S AND INITIALIZE LABELS/BUTTONS    ///
//////////////////////////////////////////////////////

//add the boxes around the panels
var drawEnclosures = function() {
  corrPlot.append("rect")
          .attr("class","corr enclosure")
          .attr("height", h)
          .attr("width", w);

  scatPlot.append("rect")
          .attr("class","scat enclosure")
          .attr("height", h)
          .attr("width", w);
};

//initialize main title and labels in the correlation matrix
var initCorrLabels = function() {

  //append main title
  corrPlot.append("text")
          .text("Correlation matrix")
          .attr("class", "main title")
          .attr("x", w / 2)
          .attr("y", -25);

  //append column variable text
  corrPlot.append("text")
          .attr("class", "x corr label")
          .attr("y", h + pad.bottom * 0.2)
          .attr("text-anchor", "middle");

  //append row variable text
  corrPlot.append("text")
          .attr("class", "y corr label")
          .attr("x", -pad.left * 0.1)
          .attr("text-anchor", "end");

  //set position the shuffle order buttons
  d3.select("#shuffleCorr")
    .style("left", (pad.left + 10) + "px")
    .style("top", (pad.top + h + 40) + "px");

  d3.select("#shuffleDefault")
    .style("left", (pad.left + 10) + "px")
    .style("top", (pad.top + h + 60) + "px");
};

//initialize main and axis titles in the scatter plot
var initScatLabels = function() {

  //main title
  scatPlot.append("text")
          .text("Scatter plot")
          .attr("class", "main title")
          .attr("x", w / 2)
          .attr("y", -25);

  //x axis title
  scatPlot.append("text")
          .attr("id", "xTitle")
          .attr("class", "axes title")
          .attr("x", w / 2)
          .attr("y", h + 48);

  //y axis title
  scatPlot.append("text")
          .attr("id", "yTitle")
          .attr("class", "axes title")
          .attr("transform", "translate(" + (-63) + "," + (h/2) + ") rotate(270)");

  //SVG element for displaying instructions
  scatPlot.append("text")
          .text("Loading data, please wait...")
          .attr("class", "corr instruc")
          .attr("x",w/2)
          .attr("y",h/2)
          .attr("text-anchor","middle")
          .attr("dominant-baseline","middle");
};

//initialize scatter line and corresponding checkbox
var scatLine; //define globally
var initScatLine = function() {

  //SVG scatter line element
  scatLine = scatPlot.append("line")
                     .attr("id", "scatLine")
                     .attr("x1", scatInnerPad)
                     .attr("x2", w - scatInnerPad)
                     .attr("y1", h - scatInnerPad)
                     .attr("y2", scatInnerPad);

  //set position for the line checkbox label and enable an event handler
  d3.select("#showLineLabel")
    .style("left", (pad.left + 2*w + pad.middle - 110) + "px")
    .style("top", (pad.top + 12) + "px")
    .select("input")
    .on("change", function() {
      scatLine.classed("visible", this.checked);
      alert("Scatter line functionality not implemented yet.")
    });
};

//initialize instructions that will be displayed at the bottom of the page
var instrucs; //define as a global variable
var initInstrucs = function() {

  //append text for instructions
  instrucs = d3.select("#instrucs")
                .datum(instrucsDatum)
                .style("position","absolute")
                .style("width", w + "px")
                .attr("class", "corr instruc")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .checkUpdateInstrucs(0);
};

//run the functions just created
drawEnclosures();
initCorrLabels();
initScatLabels();
initScatLine();
initInstrucs();

//////////////////////////////////
//    INITIALIZE THE SCALES    ///
//////////////////////////////////

//initialize scales for correlation matrix
var corrScales = {
  x: d3.scale.ordinal().rangeBands([w-corrInnerPad, corrInnerPad]),
  z: d3.scale.linear().domain([-1, 0, 1]).range(["darkslateblue", "white", "crimson"])
};

//initialize scales for scatter plot
var scatScales = {
  //note that the x scatter plot scale can either be...
  //    ordinal: for cells on the diagonal of correlation matrix
  //    numeric: for cells off the diagonal
  xOrd:  d3.scale.ordinal().rangeBands( [scatInnerPad, w - scatInnerPad] ).domain(groups),
  xNum:  d3.scale.linear().range(       [scatInnerPad, w - scatInnerPad] ),
  y:     d3.scale.linear().range(       [h - scatInnerPad, scatInnerPad] )
};

//initialize the x scale as numeric
scatScales.x = scatScales.xNum;

///////////////////////////////////////////
//    INITIALIZE THE AXES AND BRUSHES   ///
///////////////////////////////////////////

//initialize axes for scatter plot
var scatAxes = {
  x:    d3.svg.axis().scale(scatScales.x)
              .ticks(5).outerTickSize(0).innerTickSize(8),
  y:    d3.svg.axis().scale(scatScales.y)
              .ticks(5).outerTickSize(0).innerTickSize(8).orient("left")
};

//draw the axes for scatter plot but make invisible for now
scatPlot.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + h + ")")
        .call(scatAxes.x)
        .style("visibility","hidden");
scatPlot.append("g")
        .attr("class", "y axis")
        .call(scatAxes.y)
        .style("visibility","hidden");

//create a brush for the scatter plot
var brush = d3.svg.brush().x(scatScales.x).y(scatScales.y);
//scatPlot.call(brush); //wait to draw brushing until user 
                        //has reached appropriate instructions

////////////////////////////////////////////////////
//    DEFINE HELPER FUNCTIONS FOR ADDING DATA.   ///
//    THESE FUNCTIONS ARE ONLY RUN ONCE WHEN     ///
//    THE DATA ARE LOADED                        ///
////////////////////////////////////////////////////

//used for creating a matrix of correlations
//that will be bound as data to the cells in the DOM 
var corrFormat = function(matrix, vars) {
  
  //iterate through each row and cell in matrix
  matrix.forEach(function(row, i) {
    row.forEach(function(cell, j) {
      
      //change each cell to... -> {value: __, rowVar: __, colVar: __}
      //these cell objects will be bound to the SVG cell elements
      matrix[i][j] = {
        rowVar: vars[i],
        colVar: vars[j],
        value: cell
      };
    });
  });
  return matrix;
};

//used for drawing cells in the correlation matrix
var drawCells = function(data, scales) {

  //append group SVG elements representing rows containing cells
  var rows = corrPlot.selectAll(".row")
                     .data(data)
                     .enter()
                     .append("g")
                     .attr("class", "row")
                     .attr("transform", function(d, i) { 
                        //this will adjust y-position of the row group
                        return "translate(0," + scales.x( d[0].rowVar ) + ")"; 
                     });

  //append rect SVG elements representing the cells
  var cells = rows.selectAll(".cell")
                  .data(function(d) {return d;})
                  .enter()
                  .append("rect")
                  .attr("class", "cell")
                  .attr("x", function(d) { return scales.x( d.colVar ); })
                  .attr("width", scales.x.rangeBand())
                  .attr("height", scales.x.rangeBand())
                  .attr("fill", function(d) {return scales.z( d.value );})
                  .attr("stroke-width", 2);   
};

//used for updating the correlation matrix with data
var updateCorr = function(data, scales) {

  corrScales.x.domain(data.var);    //update the scale based on the number of variables
  corrFormat(data.corr, data.var);  //create data and scales for correlation matrix
  drawCells(data.corr, corrScales); //draw the correlation matrix cells
  instrucs.checkUpdateInstrucs(1);  //update instructions
}

//used for initializing points on the scatter plot
var initPoints = function(points) {

  //draw the points, bind data to them, but don't show them yet
  scatPlot.append("g").attr("id", "scatPoints")
          .selectAll("empty")
          .data(points)
          .enter()
          .append("circle")
          .attr("class", "points")
          .attr("r", radius)
          .attr("visibility", "hidden")
          .attr("stroke", "black")
          .attr("stroke-width", 1)
          .style("fill", function(d) {return colors[d.group];});
};

////////////////////////////////////////////////////
//    DEFINE HELPER FUNCTIONS FOR ADDING DATA.   ///
//    THESE FUNCTIONS ARE RUN EVERY TIME THE     ///
//    A RELEVANT EVENT HANDLER IS TRIGGERED      ///
////////////////////////////////////////////////////

//used for updating labels in the correlation matrix
var updateCorrLabels = function(pos, name) {

  //update column variable text
  corrPlot.select(".x.corr.label")
          .attr("x", pos.x)
          .text(name.x);

  //update row variable text
  corrPlot.select(".y.corr.label")
          .attr("y", pos.y)
          .text(name.y);

  //show the tooltip by turning changing "display"
  tooltip = d3.select("#corrTooltip")
              .style("display", "block")
              .style("left", (pos.x + pad.left + 16) + "px")
              .style("top",  (pos.y + pad.top  - 23) + "px");

  //change tooltip text
  tooltip.select(".value")
         .transition().duration(scatTransTime)
         //.text(d3.format(".2f")(name.z));

         //probably overly complicated, but I wanted to learn how to make tweens
         .tween("text", function() {
           var oldVal = d3.select(this).text();
           var newVal = name.z;
           var interpol = d3.interpolate(oldVal, newVal);
           return function(t) {
             this.textContent = d3.format(".2f")(interpol(t));
           };
         });
};

//used for updating the variable order for the SVG cells
var updateCells = function(scales) {

  //reset the text labels before transitioning
  d3.select("#corrTooltip").style("display", "none");
  d3.selectAll("text.corr.label").text("");

  //variables below are used for other calculations
  var nVar = scales.x.domain().length;
  var cellWidth = scales.x.rangeBand();

  //transition options
  var tLength = 500;                        //time to move an element
  var tDelayStep = 20;                      //delay in between two elements
  var rowColDelay = nVar*tDelayStep + 200;  //delay between moving the rows and columns

  //first move the rows, then the columns
  corrPlot.transition().duration(tLength)
          .selectAll(".row")
          //stagger delay based on final row position
          .delay(function(d) { return tDelayStep * (scales.x(d[0].rowVar)/cellWidth); })
          .attr("transform", function(d, i) { 
            return "translate(0," + scales.x( d[0].rowVar ) + ")"; 
          })

          .selectAll(".cell")
          //stagger delay based on final column position
          .delay(function(d) { return rowColDelay + tDelayStep * (scales.x(d.colVar)/cellWidth); })
          .attr("x", function(d) { return scales.x( d.colVar ); });
};

//used for updating the scales for the scatter plot
var updateScatScales = function(limits, vars) {

  //update the numeric x and y scales with the appropriate domains
  scatScales.xNum.domain( limits[vars.x] );
  scatScales.y.domain(    limits[vars.y] );

  //update x scale pointer (on-diagonal = ordinal, off-diagonal = numeric)
  var diag = (vars.x == vars.y);
  scatScales.x = diag ? scatScales.xOrd : scatScales.xNum;

  //update x axis's pointer to the x scale
  scatAxes.x.scale(scatScales.x);
};

//used for updating SVG elements in the scatter plot
var updateScatSVG = function(vars) {

  //helper functions for returning the x and y positions
  var getX = function(d) {return scatScales.x( d[vars.x] ); };
  var getY = function(d) {return scatScales.y( d[vars.y] ); };

  //if the current cell is on the diagonal, show
  //ordinal values on the x axis instead
  var diag = (vars.x==vars.y)
  if (diag) {
    vars.x = "group";
    var bandW = scatScales.xOrd.rangeBand();              //bandwidth of the ordinal categories
    getX = function(d) {return scatScales.x( d[vars.x] )  //start of the range band
                          + 0.5*bandW                     //align center with text labels
                          + 0.5*bandW*(Math.random()-.5); //add random disturbances
                        };
  }

  //update the data points
  scatPlot.selectAll(".points")
          .transition()
          .duration(scatTransTime)
          .ease("linear")
          .attr("cx", getX)
          .attr("cy", getY)
          .attr("visibility", "visible");

  //make the scatter line checkbox visible
  //d3.select("#showLineLabel").style("display", "block");

  //update the axis text
  scatPlot.select("#xTitle").text(vars.x);
  scatPlot.select("#yTitle").text(vars.y);

  //update the axes
  scatPlot.select(".x.axis")
          .transition()
          .duration(scatTransTime)
          .style("visibility","visible")
          .call(scatAxes.x);
  scatPlot.select(".y.axis")
          .transition()
          .duration(scatTransTime)
          .style("visibility","visible")
          .call(scatAxes.y);
};

/////////////////////////////////////////////
//    WHEN THE DATA FINISHES LOADING,     ///
//    DO THE FOLLOWING...                 ///
/////////////////////////////////////////////

var corrCurrentClick;

//the second arugment (a function) will be run
//once d3.json finishes loading data
d3.json(jsonFile, function (data) {

  ////////////////////////////////////////////
  //    USE DATA TO UPDATE BOTH GRAPHICS   ///
  ////////////////////////////////////////////

  updateCorr(data);        //updates the scales and draws the cells
  initPoints(data.points); //binds data to scatter points
  scatPlot.select(".instruc").remove(); //remove loading data text

  //////////////////////////////////////////////
  //  ADD CORRELATION MATRIX EVENT HANDLERS  ///
  //////////////////////////////////////////////

  //helper for higlighting a correlation matrix cell
  var vars; //define currently selected vars globally
  var highlightCell = function() {

    //get position and variable names of cell selected
    var d = this.datum();
    vars = { x: d.colVar, y: d.rowVar, z: d.value};
    var pos  = { x: corrScales.x(d.colVar), y: corrScales.x(d.rowVar)           };

    //update graphical elements
    //NOTE: the CSS file adjusts the box around the cell
    updateCorrLabels(pos, vars);              //update correlation label text
    updateScatScales(data.minMax, vars);      //update scatter plot scales
    updateScatSVG(vars);                      //update scatter plot points and axes
 
    //make brushing extent invisible
    scatPlot.select(".extent")                
            .attr("width", 0)
            .attr("height", 0);
  };

  //handler for leaving a correlation matrix cell
  var corrOutEvent = function() {
    //reset the text labels
    d3.select("#corrTooltip").style("display", "none");
    d3.selectAll("text.corr.label").text("");

    //if something has been clicked then highlight that cell
    if (corrCurrentClick) { corrCurrentClick.call(highlightCell); } 
  };

  //handler for hovering over a cell
  var hoverCell = function () {

    //update instructions if necessary
    instrucs.checkUpdateInstrucs(2);
    instrucs.checkUpdateInstrucs(6, function() {
      instrucs.text("");
      //make the shuffle variables button visible
      d3.select("#shuffleCorr")
        .style("visibility", "visible")
        .style("opacity", 0)
        .transition().duration(3000)
        .style("opacity", 1);
    });

    //highlight current cell
    d3.select(this).call(highlightCell);
  };

  //handler for clicking a correlation matrix cell (change class membership)
  var clickCell = function(d) {

    //update instructions if necessary
    instrucs.checkUpdateInstrucs(3);
            
    //change classes of clicked cell (see also the CSS)
    corrPlot.selectAll(".cell").classed("clicked", false);
    corrCurrentClick = d3.select(this).classed("clicked", true);
  };

  //handler for the shuffle variable order button
  var shuffleOrder = function() {

    //update instructions if necessary
    instrucs.checkUpdateInstrucs("end", instrucEnd);

    //update the correlation matrix
    corrScales.x.domain(d3.shuffle(data.var.slice(0)));          //change the scale
    updateCells(corrScales);                                     //update the cells
    d3.select("#shuffleDefault").style("visibility", "visible"); //show the reset button 
  };

  //handler for the shuffle variable reset button
  var shuffleReset = function() {
    corrScales.x.domain(data.var);
    updateCells(corrScales);
    d3.select("#shuffleDefault").style("visibility", "hidden");
  };

  //add the event listeners
  corrPlot.selectAll(".cell")
          .on("mouseover", hoverCell)
          .on("mouseout",  corrOutEvent)
          .on("click",     clickCell);
  d3.select("#shuffleCorr").on("click",    shuffleOrder);
  d3.select("#shuffleDefault").on("click", shuffleReset);

  ////////////////////////////////////////
  //  ADD SCATTER PLOT EVENT HANDLERS  ///
  ////////////////////////////////////////

  //highlight the currently selected point
  var highlightPoint = function() {

    //change the colors of all the points
    scatPlot.selectAll(".points").style("fill", "grey")

    //point and position of current selection 
    var d = this.datum();
    var pos  = { x: +this.attr("cx"), y: +this.attr("cy") };

    //enlarge the radius and change the color
    this.moveToFront()
        .attr("r", highlightRadius);
  };

  //handler for hovering over a scatter point
  var scatOverEvent = function() {

    //update instructions if necessary
    instrucs.checkUpdateInstrucs(4, function() {

      //enable brushing, but hide the extent for now
      scatPlot.call(brush);
      scatPlot.selectAll(".extent")
              .attr("width", 0)
              .attr("height", 0);

      //also make the data points are in front
      scatPlot.select("#scatPoints")
              .moveToFront();
    });

    //highlight the current point
    var point = d3.select(this);
    point.call(highlightPoint);

    //display the tooltip
    var id = point.datum().id;
    var pos  = { x: +point.attr("cx"), y: +point.attr("cy") };
    d3.select("#scatTooltip")
      .style("display", "block")
      .style("left", (pos.x + pad.left + w + pad.middle + 16) + "px")
      .style("top",  (pos.y + pad.top - 28)  + "px")
      .select(".value")
      .text(id);
  };

  //handler for leaving a scatter point (restore radius, hide tooltip)
  var scatOutEvent = function() {

    //hide tooltip
    d3.select("#scatTooltip")
      .style("display", "none");

    //reset attributes of current data point
    var point = d3.select(this);
    point.attr("r", radius);
    if (point.classed("insideBrush")) point.attr("r", brushRadius);

    //reset colors of other data points
    scatPlot.selectAll(".points")
            .style("fill", function(d) {return colors[d.group];});
  };

  //add event handlers to the data points
  scatPlot.selectAll(".points")
          .on("mouseover", scatOverEvent)
          .on("mouseout", scatOutEvent);

  ///////////////////////////////////////////////////
  //  ADD SCATTER PLOT - BRUSHING EVENT HANDLERS  ///
  ///////////////////////////////////////////////////

  //If the brush is moved, update classes of the data points
  function brushmove() {
              
    //helper function for whether a point is outside the brush
    var outBrush = function(d) {
      var e = brush.extent();   //current extent of the brush
      return e[0][0] > d[vars.x] || d[vars.x] > e[1][0]
          || e[0][1] > d[vars.y] || d[vars.y] > e[1][1];
    };
    var inBrush = function(d) {return !outBrush(d);};

    //update classes of data points
    //NOTE: the CSS will control the color of these classes
    scatPlot.selectAll(".points")  
            .classed("outsideBrush", outBrush)
            .classed("insideBrush",  inBrush);

    //update sizes of the points
    scatPlot.selectAll(".points.outsideBrush")
            .attr("r", radius);
    scatPlot.selectAll(".points.insideBrush")
            .moveToFront()
            .attr("r", brushRadius); 
  };

  // If no points are inside after the brushend event, 
  // reset scatter points' classes and sizes, and hide the extent.
  function brushend() {
    var insideBrush = scatPlot.selectAll(".points.insideBrush");
    if (insideBrush.empty()) {
      scatPlot.selectAll(".points")
              .classed("outsideBrush", false)
              .classed("insideBrush", false)
              .attr("r", radius);
      scatPlot.select(".extent")                
              .attr("width", 0)
              .attr("height", 0);
    } else {
      //update instructions if necessary
      instrucs.checkUpdateInstrucs(5);
    }
  };

  //add event handlers to the brush
  brush.on("brush", brushmove)
       .on("brushend", brushend);
});