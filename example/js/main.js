/**
* Add functionality to page. This ist for testing only.
*/
$(document).ready(function(){
	
  // create the flowchart instance
  var chart = new FlowChart($);
  
  // add your node templates in a key-value format
  // where key is the name and css class of the node and value is the content
  chart.nodeTemplates = {
    "simple-node": "<div></div>",
    "expression-node": "<svg width='100' height='50'><rect x='2' y='2' rx='10' ry='10' width='90' height='40' /></svg>",
    "decision-node": "<svg width='60' height='60'><polygon points='30,5 55,30 30,55 5,30' /></svg>"
  };

  // set the root element position coordinates
  chart.rootElementPosition = {left: 5, top: 5};

  // set offset between parent and child node
  // nodes are always added from left to right horizontally
  chart.offsetForNextElement = 150;

  // set the effect for node action end, like node creation or movement
  chart.nodeActionEndEffect = 'bounce';

  // add nodes actions
  chart.addNodeActions = function(nodeObj, chartInstanceObj){
    nodeObj.click(function(){
      chartInstanceObj.addNode('simple-node', nodeObj);
    });
    nodeObj.on('contextmenu', function(event){
      chartInstanceObj.deleteNode(nodeObj.attr('id'));
      return false;
    });
  };
  
  // generate some simple flowchart
  var rootNode = chart.addNode('decision-node',null);
  var node01 = chart.addNode('expression-node',rootNode);
  var node02 = chart.addNode('simple-node',node01);
  var node03 = chart.addNode('decision-node',node02);
  var connection01 = chart.addConnectionBetween(node03,node01);
  
});
