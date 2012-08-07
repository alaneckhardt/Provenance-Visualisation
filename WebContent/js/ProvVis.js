	//Set the seed of the random function
	var seed = 123546;
	var selected1 = null, selected2 = null;
	var selectedEdge;
	Math.seedrandom(seed);
	//Add handling of the ctrl key
		ctrlKey = false;
		shiftKey = false;
		metaKey = false;
		$(document).bind('keyup keydown', function(e){ctrlKey = e.ctrlKey;} );
		$(document).bind('keyup keydown', function(e){shiftKey = e.shiftKey;} );
		$(document).bind('keyup keydown', function(e){metaKey = e.metaKey;} );
	//var server = 'http://mrt.esc.abdn.ac.uk:8080/ProvenanceService/';
	//var serverVisual = 'http://mrt.esc.abdn.ac.uk:8080/ourspaces/testProvenance/';

		
function ProvVis() {
	/*jsPlumb.reset();
	jsPlumb.ready(function() {
		jsPlumb.Defaults.PaintStyle = {
				lineWidth : 4,
				strokeStyle : "#aaa"
			};
			jsPlumb.Defaults.Endpoint = [ "Dot", {
				radius : 10
			}, {
				isSource : true,
				isTarget : true
			} ];
			jsPlumb.Defaults.MaxConnections = 10;
			jsPlumb.Defaults.Container = $("#" + jsPlumb.canvas);
	});*/
	this.index = -1;
	this.array = [];
	this.graph = new ProvVisGraph(this);
	this.core = new ProvVisCore(this);
	this.comm = new ProvVisComm(this);
	this.layout = new ProvVisLayout(this);	
	this.edit = new ProvVisEdit(this);	
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
	this.getProvVis = function(){
		var p = new ProvVis();
		p.index = this.array.length;
		this.array.push(p);
		return p;
	}
}
provVis = new ProvVis();