/**
* Basic flow chart to draw connections between nodes and lines.
* requires jQuery and jQuery UI.
*/
var FlowChart = function(jQueryLibraryObj){
  var _t = this;
  _t.jQueryLibraryObj = jQueryLibraryObj;
  _t.jQueryLibraryObj('body').append(_t.connectionsLayerTemplate);
  _t.jQueryLibraryObj('body').append(_t.nodesLayerTemplate);
};

FlowChart.prototype.jQueryLibraryObj = {};

FlowChart.prototype.connectionsLayerTemplate = "<svg id='connections-layer' class='layer'><svg>";
                                          
FlowChart.prototype.nodesLayerTemplate = "<div id='nodes-layer' class='layer'></div>";

FlowChart.prototype.nodeTemplates = {
  "simple-node": "simple node"
};

FlowChart.prototype.rootElementPosition = {left: 10, top: 10};

FlowChart.prototype.offsetForNextElement = 200;

FlowChart.prototype.nodeActionEndEffect = 'bounce';

FlowChart.prototype.addNodeActions = function(nodeObj, chartInstanceObj){
  nodeObj.click(function(){
    chartInstanceObj.addNode('simple-node', nodeObj);
  });
}

FlowChart.prototype.elementIndex = 0;

FlowChart.prototype.nextElementIndex = function(){
	this.elementIndex = this.elementIndex + 1;
	return this.elementIndex;
}

FlowChart.prototype.connections = {};

FlowChart.prototype.positionConnectionPoint = function(left, top, linePointType, lineObj, finishArrangement){
    var d = this.connections[lineObj.attr('id')].split(' ');
    if (linePointType === 'endpoint') {
      d[3] = left + ',' + top;
      if (finishArrangement) {
        d[2] = left + ',' + top;
      }
    }  
    if (linePointType === 'startpoint') {
      d[0] = 'M' + left + ',' + top;
      if (finishArrangement) {
        d[1] = 'C' + left + ',' + top;
      }
    }
	d = d.join(' ');
    lineObj.attr('d', d);
	this.connections[lineObj.attr('id')] = d;
}
  
FlowChart.prototype.positionConnectionLines = function(nodeObj, finishArrangement){
     var _t = this;
     var t = nodeObj;
     var left = t.offset().left + t.outerWidth() / 2;
     var top = t.offset().top + t.outerHeight() / 2;
      
     var linesRight = t.attr('startpoint-for');
     var linesLeft = t.attr('endpoint-for');
      
     if (linesRight) {
        linesRight = linesRight.split(',');
        for (var i = 0; i < linesRight.length; i++)
        {
          this.positionConnectionPoint(left, top, 'startpoint', _t.jQueryLibraryObj('#' + linesRight[i]), finishArrangement);
        }
     }
     if (linesLeft) {
        linesLeft = linesLeft.split(',');
        for (var i = 0; i < linesLeft.length; i++)
        {
          this.positionConnectionPoint(left, top, 'endpoint', _t.jQueryLibraryObj('#' + linesLeft[i]), finishArrangement);
        }
     }
}

FlowChart.prototype.addNode = function(nodeType, parentNode) {
  var _t = this;
  
  // add new node to nodes layer
  var nodesLayer = this.jQueryLibraryObj('#nodes-layer');
  var currentDate = new Date();
  var nodeId = "node-" + _t.nextElementIndex();
  var nodeClass = 'node ' + nodeType;
  var node = "<div id='" + nodeId + "' class='" + nodeClass + "'>" + this.nodeTemplates[nodeType] + "</div>";
  nodesLayer.append(node);
  node = this.jQueryLibraryObj('#' + nodeId);
  
  if (!parentNode){
    // position the created node element
    node.offset(_t.rootElementPosition);
  }else{
    // position the created node element
    node.offset({left: parentNode.offset().left + _t.offsetForNextElement, top: parentNode.offset().top});
    
    // add connection line and register it to start and end nodes
    _t.addConnectionBetween(parentNode, node);
  }
    
  // make node draggable
  node.draggable({
    drag: function(){
      _t.positionConnectionLines(_t.jQueryLibraryObj(this), false);
    },
    stop: function() {
      var t = _t.jQueryLibraryObj(this);
      _t.positionConnectionLines(t, true);
      _t.adjustLayersSize();
      if (_t.nodeActionEndEffect) {
          t.effect(_t.nodeActionEndEffect,{},500,function(){});
      }
    }
  });
  
  // make node droppable if we have drop action
  node.droppable({
    drop: function(event, ui){
      var targetNode = _t.jQueryLibraryObj(this);
      var droppedNode = ui.draggable;
      _t.addConnectionBetween(droppedNode, targetNode);
    }
  });

  // add other defined node actions
  _t.addNodeActions(node, _t);
    
  // adjust layers size to avoid scrolling out of viewport
  _t.adjustLayersSize();
  
  // nice appearing effect
  if (_t.nodeActionEndEffect) {
      node.effect(_t.nodeActionEndEffect, {}, 500, function(){});
  }
  
  return node;
}

FlowChart.prototype.deleteNode = function(nodeId){
  var _t = this;
  var node = _t.jQueryLibraryObj('#' + nodeId);
  var linesRight = node.attr('startpoint-for');
  var linesLeft = node.attr('endpoint-for');   
  node.remove();
  if (linesRight) {
    linesRight = linesRight.split(',');
    for (var i = 0; i < linesRight.length; i++) {
      _t.deleteConnection(linesRight[i]);
    }
  }
  if (linesLeft) {
    linesLeft = linesLeft.split(',');
    for (var i = 0; i < linesLeft.length; i++) {
      _t.deleteConnection(linesLeft[i]);
    }
  }
}

FlowChart.prototype.deleteConnection = function(connectionId){
  var conn = this.jQueryLibraryObj('#' + connectionId);
  var startNode = this.jQueryLibraryObj('#' + conn.attr('data-startnode'));
  var endNode = this.jQueryLibraryObj('#' + conn.attr('data-endnode'));
  if(startNode.length === 1){
    var linesRight = startNode.attr('startpoint-for').split(',');
    var index = linesRight.indexOf(connectionId);
    linesRight.splice(index,1);
    linesRight = linesRight.join(',');
    startNode.attr('startpoint-for', linesRight);
  }
  if(endNode.length === 1){
    var linesLeft = endNode.attr('endpoint-for').split(',');
    var index = linesLeft.indexOf(connectionId);
    linesLeft.splice(index,1);
    linesLeft = linesLeft.join(',');
    endNode.attr('endpoint-for', linesLeft);
  }
  conn.remove();
}

FlowChart.prototype.addConnectionBetween = function(startNode, endNode){
    var _t = this;

    // add connection line and register it to start and end nodes
    var conId = this.addConnection(startNode, endNode);

    var startpointFor = startNode.attr('startpoint-for');
    if (!startpointFor) {
        startpointFor = [];
    } else {
        startpointFor = startpointFor.split(',');
    }
    startpointFor.push(conId)
    startpointFor = startpointFor.join(',');
    startNode.attr('startpoint-for', startpointFor);

    var endpointFor = endNode.attr('endpoint-for');
    if (!endpointFor) {
        endpointFor = [];
    } else {
        endpointFor = endpointFor.split(',');
    }
    endpointFor.push(conId);
    endpointFor.join(',');
    endNode.attr('endpoint-for', endpointFor);

    // reposition connection lines
    _t.positionConnectionLines(startNode, true);
    _t.positionConnectionLines(endNode, true);
}

FlowChart.prototype.addConnection = function(startNode, endNode) {
  var conLayer = this.jQueryLibraryObj('#connections-layer');
  var currentDate = new Date();
  var startNodePos = startNode.offset();
  var endNodePos = endNode.offset();
  var conCoordinates = "M" + startNodePos.left + "," + startNodePos.top + 
                       " C" + startNodePos.left + "," + startNodePos.top + 
                       " " + endNodePos.left + "," + endNodePos.top + 
                       " " + endNodePos.left + "," + endNodePos.top;
  var newpath = document.createElementNS("http://www.w3.org/2000/svg","path");
  newpath.setAttributeNS(null, "id", "line-" + this.nextElementIndex() );  
  newpath.setAttributeNS(null, "d", conCoordinates);
  newpath.setAttributeNS(null, "data-startnode", startNode.attr('id'));
  newpath.setAttributeNS(null, "data-endnode", endNode.attr('id'));  
  
  conLayer[0].appendChild(newpath);
	 	 	 			 			 							 
	this.connections["line-" + this.elementIndex] = conCoordinates;
   
  return "line-" + this.elementIndex;
}

FlowChart.prototype.adjustLayersSize = function() {
  this.jQueryLibraryObj('.layer').width(this.jQueryLibraryObj(document).width())
                                 .height(this.jQueryLibraryObj(document).height());
}
