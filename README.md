[SimpleFlowchart](http://mmazo.de/flowchart/) - Simple flow chart library
======================================================================================

About
--------------------------------------

This is a small JavaScript library with single purpose - draw some nodes and connect
them with lines. You can use this library to create your own flow charts or create
other similar graphics. Nodes and connection lines can be styled with CSS. Node content
can be whatever you want - simple div, image or SVG. 

The library is depends on jQuery and jQuery UI (drag and drop and effects). 

Current library version is actually just a result of playing around with SVG. The code base
must be improved and refactored. In nearest future I want to move from DOM-based data storage
and rewrite the code in TypeScript.


How to use
----------

The code is really small. Do not hesitate to check the source code to explore the actions.
Feel free to extend and adjust the code to your needs. Check out the example chart.

Currently, you can add and delete nodes and connect them with lines (connections).

Default actions include:

* Drag nodes around (lines are adjusted automatically)
* Drop node on other node to connect them

You can configure your own node actions. 
Current example shows additional functionality:

* Add child node by clicking on the node.
* Delete node by making right mouse click on it (context menu).


Contact
----------

If you have any questions, please feel free to ask on the
[Michail Mazo] (http://mmazo.de) or email: michail.mazo@gmail.com.
