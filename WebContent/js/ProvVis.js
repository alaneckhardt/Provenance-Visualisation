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
	this.graph = new ProvVisGraph(this);
	this.core = new ProvVisCore(this);
	this.comm = new ProvVisComm(this);
	this.layout = new ProvVisLayout(this);	
	this.edit = new ProvVisEdit(this);	
}
provVis = new ProvVis();