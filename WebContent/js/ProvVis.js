function ProvVis() {
	this.graph = new ProvVisGraph(this);
	this.core = new ProvVisCore(this);
	this.comm = new ProvVisComm(this);
	this.layout = new ProvVisLayout(this);	
	this.edit = new ProvVisEdit(this);	
}
provVis = new ProvVis();