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

FlowChart.prototype.addOrUpdateConnectionInConnectionsObject = function(connId, startNodeId, endNodeId, connD){
	this.connections[connId] = {
		start: startNodeId,
		end: endNodeId,
		d: connD
	};
};

FlowChart.prototype.deleteConnectionFromConnectionsObject = function(connId){
	delete this.connections[connId];
};

FlowChart.prototype.getConnectionFromConnectionsObject = function(connId){
	return this.connections[connId];
};

FlowChart.prototype.nodes = {};

FlowChart.prototype.addOrUpdateNodeInNodesObject = function(nodeId, nodeType, nodeContent, nodeLeftPos, nodeTopPos, startpointFor, endpointFor){
	this.nodes[nodeId] = {
		type: nodeType, 
		content: nodeContent, 
		left: nodeLeftPos, 
		top: nodeTopPos, 
		startFor: startpointFor, 
		endFor: endpointFor
	};
};

FlowChart.prototype.deleteNodeFromNodesObject = function(nodeId){
	delete this.nodes[nodeId];
};

FlowChart.prototype.getNodeFromNodesObject = function(nodeId){
	return this.nodes[nodeId];
};

FlowChart.prototype.positionConnectionPoint = function(left, top, linePointType, lineObj, finishArrangement){
    var d = this.getConnectionFromConnectionsObject(lineObj.attr('id')).d.split(' ');
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
	this.connections[lineObj.attr('id')].d = d;
}
  
FlowChart.prototype.positionConnectionLines = function(nodeObj, finishArrangement){
     var _t = this;
     var t = nodeObj;
     var left = t.offset().left + t.outerWidth() / 2;
     var top = t.offset().top + t.outerHeight() / 2;
      
     var linesRight = _t.nodes[t.attr('id')].startFor;
     var linesLeft = _t.nodes[t.attr('id')].endFor;
      
        for (var i = 0; i < linesRight.length; i++)
        {
          this.positionConnectionPoint(left, top, 'startpoint', _t.jQueryLibraryObj('#' + linesRight[i]), finishArrangement);
        }
     

        for (var i = 0; i < linesLeft.length; i++)
        {
          this.positionConnectionPoint(left, top, 'endpoint', _t.jQueryLibraryObj('#' + linesLeft[i]), finishArrangement);
        }
}

FlowChart.prototype.addNode = function(nodeType, parentNode) {
  var _t = this;
  
  // add new node to nodes layer
  var nodesLayer = this.jQueryLibraryObj('#nodes-layer');
  var nodeId = "node-" + _t.nextElementIndex();
  var nodeClass = 'node ' + nodeType;
  var node = "<div id='" + nodeId + "' class='" + nodeClass + "'>" + this.nodeTemplates[nodeType] + "</div>";
  nodesLayer.append(node);
  node = this.jQueryLibraryObj('#' + nodeId);
  
  _t.addOrUpdateNodeInNodesObject(nodeId, nodeType, _t.nodeTemplates[nodeType], 0, 0, [], []);
  
  if (!parentNode){
    // position the created node element
    node.offset(_t.rootElementPosition);
	_t.nodes[nodeId].left = _t.rootElementPosition.left;
	_t.nodes[nodeId].top = _t.rootElementPosition.top;
  }else{
    // position the created node element
    node.offset({left: parentNode.offset().left + _t.offsetForNextElement, top: parentNode.offset().top});
	
	_t.nodes[nodeId].left = parentNode.offset().left + _t.offsetForNextElement;
	_t.nodes[nodeId].top = parentNode.offset().top;
    
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
	  _t.nodes[t.attr('id')].left = t.offset().left;
	  _t.nodes[t.attr('id')].top = t.offset().top;
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
  var nodeObj = _t.getNodeFromNodesObject(nodeId);
  var linesRight = nodeObj.startFor;
  var linesLeft = nodeObj.endFor;   
  node.remove();
  _t.deleteNodeFromNodesObject(nodeId);
  
    for (var i = 0; i < linesRight.length; i++) {
      _t.deleteConnection(linesRight[i]);
    }

    for (var i = 0; i < linesLeft.length; i++) {
      _t.deleteConnection(linesLeft[i]);
    }
}

FlowChart.prototype.deleteConnection = function(connectionId){
  var conn = this.jQueryLibraryObj('#' + connectionId);
  var connObj = this.getConnectionFromConnectionsObject(connectionId);
  var startNode = this.nodes[connObj.start];
  var endNode = this.nodes[connObj.end];
  if(startNode){
    var linesRight = startNode.startFor;
    var index = linesRight.indexOf(connectionId);
    linesRight.splice(index,1);
    this.nodes[connObj.start].startFor = linesRight;
  }
  if(endNode){
    var linesLeft = endNode.endFor;
    var index = linesLeft.indexOf(connectionId);
    linesLeft.splice(index,1);
    this.nodes[connObj.end].endFor = linesLeft;
  }
  this.deleteConnectionFromConnectionsObject(connectionId);
  conn.remove();
}

FlowChart.prototype.addConnectionBetween = function(startNode, endNode){
    var _t = this;

    // add connection line and register it to start and end nodes
    var conId = this.addConnection(startNode, endNode);

    var startpointFor = this.nodes[startNode.attr('id')].startFor;
    startpointFor.push(conId);
    this.nodes[startNode.attr('id')].startFor = startpointFor;

    var endpointFor = this.nodes[endNode.attr('id')].endFor;
    endpointFor.push(conId);
    this.nodes[endNode.attr('id')].endFor = endpointFor;

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
  
  conLayer[0].appendChild(newpath);
	 	 	 			 			 							 	
  this.addOrUpdateConnectionInConnectionsObject("line-" + this.elementIndex, startNode.attr('id'), endNode.attr('id'), conCoordinates);
   
  return "line-" + this.elementIndex;
}

FlowChart.prototype.adjustLayersSize = function() {
  this.jQueryLibraryObj('.layer').width(this.jQueryLibraryObj(document).width())
                                 .height(this.jQueryLibraryObj(document).height());
}

FlowChart.prototype.exportChart = function(){
	var nodes = this.nodes;
	var conns = this.connections;
	var chartJSON = {
		nodes: [],
		connections: []
	};
	
	for (var node in nodes) {
     if (nodes.hasOwnProperty(node)) {
       var nodeObj = nodes[node];
	   nodeObj.id = node;
	   chartJSON.nodes.push(nodeObj);
     }
    }
	
	for (var conn in conns) {
     if (conns.hasOwnProperty(conn)) {
       var connObj = {
		   start: conns[conn].start,
		   end: conns[conn].end
	   };
	   chartJSON.connections.push(connObj);
     }
    }
	
	return chartJSON;
}
