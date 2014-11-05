////////////////////
//    OPTIONS    ///
////////////////////

//where is the data
jsonFile = "dataNew.json";

//dimension of SVG
var h = 450;
var w = h;
var pad = {left: 70, top: 60, right: 5, bottom: 105, middle: 120 };
var corrInnerPad = 1;
var scatInnerPad = 10;
var radius = 5;
var highlightRadius = 9
var brushRadius = 7;

//Hack to make this example display correctly in an iframe on bl.ocks.org
d3.select(self.frameElement).style("width", (w*2 + pad.left + pad.right + pad.middle + 75) + "px");
d3.select(self.frameElement).style("height", (h + pad.top + pad.bottom + 20) + "px");

//groups and colors for scatter plot
var groups = ["group1", "group2", "group3"];
var colors = {  
                "group1": "crimson", 
                "group2": "green", 
                "group3": "darkslateblue"
              };
/*var colors = {  
                "group1": "rgb(50%, 0%, 0%)", 
                "group2": "rgb(0%, 50%, 0%)", 
                "group3": "rgb(0%, 0%, 50%)"
              };*/
//var colors = [d3.rgb(150, 150, 150)];

//other graphic controls
var scatTransTime = 300;  //time for transitions in the scatter plot

//specify instructions that will be displayed at the bottom of the page
var pos0 = { left: (pad.left)                  + "px",   top: (pad.top + h/2)    + "px" };
var pos1 = { left: (pad.left)                  + "px",   top: (pad.top + h + 40) + "px" };
var pos2 = { left: (pad.left + w + pad.middle) + "px",   top: (pad.top + h + 80) + "px" };
var pos3 = { left: (pad.left)                  + "px",   top: (pad.top + h + 22) + "px" };
var pos4 = { left: (pad.left+50)               + "px",   top: (pad.top + h + 40) + "px" };
var style0 = {color: "black"};
var style1 = {color: "black", "font-size": "40px"};
var instrucsDatum = [
  {prevStep: 0, text: "Loading data, please wait...", trans: false,  delay: 0,     fadeOut: 0,    fadeIn: 0,     style: style0,  pos: pos0},
  {prevStep: 1, text: "Hover above to begin",         trans: false,  delay: 0,     fadeOut: 0,    fadeIn: 0,     style: style1,  pos: pos1},
  {prevStep: 2, text: "Click to focus on a cell",     trans: true,   delay: 0,     fadeOut: 500,  fadeIn: 2000,  style: style1,  pos: pos1},
  {prevStep: 3, text: "Hover above",                  trans: true,   delay: 0,     fadeOut: 500,  fadeIn: 2000,  style: style1,  pos: pos2},
  {prevStep: 4, text: "Hold and drag the mouse",      trans: true,   delay: 0,     fadeOut: 500,  fadeIn: 2000,  style: style1,  pos: pos2},
  {prevStep: 5, text: "Hover above to see more",      trans: true,   delay: 0,     fadeOut: 500,  fadeIn: 2000,  style: style1,  pos: pos1},
  {prevStep: 6, text: "<- Click",                     trans: true,   delay: 0,     fadeOut: 500,  fadeIn: 2000,  style: style1,  pos: pos3}
];


//function that will create a message when the instructions finish
var instrucEnd = function(y) {
  corrPlot.append("text")
          .text("Good job")
          .style("font-size", 40)
          .style("opacity", 0)
          .attr("x", w/2)
          .attr("y", h + 62)
        .transition()
          .delay(4000)
          .duration(2000)
          .style("opacity", 1)
        .transition()
          .duration(500)
          .style("opacity", 0)
        .remove();
};