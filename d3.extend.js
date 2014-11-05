//////////////////////////////
//    EXTEND D3 LIBRARY    ///
//////////////////////////////

//helper function for moving elements to the front
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};
d3.transition.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

//helper function for fluidly changing instructions
d3.selection.prototype.updateInstrucs = function() {

  //next set of instructions
  var instruc = this.datum().shift();  

  //return immediately if there's no transition
  if (!instruc.trans) return this.text(instruc.text)
                                 .style(instruc.pos)
                                 .style(instruc.style);

  //otherwise, fade out current instructions, and fade in new ones
  return this.transition()
               .duration(instruc.fadeOut)
               .style("opacity", 0)       
             .transition()
               .duration(instruc.fadeIn)
               .text(instruc.text)
               .style("opacity", 1) 
               .style(instruc.pos)
               .style(instruc.style);
};


//updates instructions if the previous instruction was completed
//if instructions are updated, it also runs the callback function
d3.selection.prototype.checkUpdateInstrucs = function(stepID, callback) {

  //next set of instructions
  var next = this.datum()[0];

  //if the instructions just ended, run the callback function
  //and remove the instructions HTML div from the DOM
  if (stepID === "end") {
    if (!(typeof(callback) === "undefined")) callback();
    return this.remove();
  }

  //if there are no instructions, then don't do anything
  if (typeof(next) === "undefined") return this;

  //if the previous instruction was completed, call 
  //callback function and update instructions
  if (next.prevStep === stepID) {
    if (!(typeof(callback) === "undefined")) callback();
    return this.updateInstrucs(); 
  }

  //otherwise, don't do anything
  return this;
}



