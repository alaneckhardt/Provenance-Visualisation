	//Set the seed of the random function
	var seed = 123546;
	var selected1 = null, selected2 = null;
	var selectedEdge;
	Math.seedrandom(seed);
	
/**
 * Class for provenance visualisation. 
 * @returns
 */
function ProvVis() {
	/**Index of the instance in the array of the parent.*/
	this.index = -1;
	/**Array of children instances, in case there is more than one graph on a page.*/
	this.array = [];
	/**Class handling the visualisation of graph.*/	
	this.graph = new ProvVisGraph(this);
	/**Core function of provvis.*/
	this.core = new ProvVisCore(this);
	/**Communication with the Provenance Service at the server-side.*/
	this.comm = new ProvVisComm(this);
	/**Layout of the graph.*/
	this.layout = new ProvVisLayout(this);	
	/**Functions for editing the provenance.*/
	this.edit = new ProvVisEdit(this);	
	/**Class for connecting the nodes.*/
	this.jsPlumb = jsPlumb.getInstance();
	this.jsPlumb.reset();
	this.jsPlumb.Defaults.PaintStyle = {
				lineWidth : 4,
				strokeStyle : "#aaa"
	};
	this.jsPlumb.Defaults.Endpoint = [ "Dot", {
				radius : 10
			}, {
				isSource : true,
				isTarget : true
	} ];
	this.jsPlumb.Defaults.MaxConnections = 10;
	this.jsPlumb.Defaults.Container = $("#" + this.jsPlumb.canvas);
	/**Creates an instance of ProvVis and adds it to the array.*/
	this.getProvVis = function(){
		var p = new ProvVis();
		p.index = this.array.length;
		this.array.push(p);
		return p;
	};
}
/**Main instance of visualisation. If there is more graphs on one page, the array in this instance will contain all the ProvVis instances in the array field. */
provVis = new ProvVis();