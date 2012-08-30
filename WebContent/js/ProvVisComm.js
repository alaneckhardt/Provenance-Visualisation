/**
 * Class performing communication with provenance service.
 * @author Alan Eckhardt a.e@centrum.cz
 */
function ProvVisComm(provVis) {
	this.provVis = provVis;
	this.sessionId;
	this.process_counter = 0;
	this.agent_counter = 0;
	this.artifacts_counter = 0;
	/**
	 * 
	 * @param data URI of the process
	 * @param title Title of the process
	 * @param className Type of the process
	 */
	this.displayProcess = function(data, title, className) {
		if (title == null)
			title = "Process " + this.process_counter;
		//Trim the data.
		data = data.replace(/^\s+|\s+$/g, '');
		if (data.lastIndexOf('Error', 0) === 0)
			return;
		provVis.graph.displayEntity(data, title, "Process", className);
		this.process_counter++;
	};

	/**
	 * 
	 * @param data URI of the agent
	 * @param title Title of the agent
	 * @param className Type of the agent
	 */
	this.displayAgent = function(data, title, className) {
		if (title == null)
			title = "Agent " + this.agent_counter;
		//Trim the data.
		data = data.replace(/^\s+|\s+$/g, '');
		if (data.lastIndexOf('Error', 0) === 0)
			return;
		provVis.graph.displayEntity(data, title, "Agent", className);
		this.agent_counter++;
	};

	/**
	 * @param data URI of the artifact
	 * @param title Title of the artifact
	 * @param className Type of the artifact
	 */
	this.displayArtifact = function(data, title, className) {
		if (title == null)
			title = "Artifact " + this.artifacts_counter;
		//Trim the data.
		data = data.replace(/^\s+|\s+$/g, '');
		if (data.lastIndexOf('Error', 0) === 0)
			return;
		provVis.graph.displayEntity(data, title, "Artifact", className);
		this.artifacts_counter++;
	};

	/**
	 * Displays new relationship - the required data are taken from selected nodes and selected type of property.
	 * @param data URI of the new relationship.
	 */
	this.displayNewCausalRelationship = function(data) {
		//Trim the data.
		data = data.replace(/^\s+|\s+$/g, '');
		if (data.lastIndexOf('Error', 0) === 0)
			return;
		provVis.graph.displayRelationship(data, selectedEdge.idEdge, selected1.id, selected2.id);
	};

	/**
	 * Creates new session
	 * @param event  = functionto handle new session id
	 * 
	 */
	this.startSession = function(event) {
		var query = server + 'ProvenanceService?action=startSession';
		$.get(query, event);
	};

	/**
	 * Rollbacks given session
	 * @param session
	 * @param event
	 * 
	 */
	this.rollback = function(session, event) {
		var query = server + 'ProvenanceService?action=rollback&session='+ escape(session);
		$.get(query, event);
	};
	/**
	 * Commits given session
	 * @param session
	 * @param event
	 */
	this.commit = function(session, event) {
		var query = server + 'ProvenanceService?action=commit&session='+ escape(session);
		$.get(query, event);
	};

	this.addTitle = function(uri, title){
		if(typeof title != 'undefined' && title != null){
			query = server + 'ProvenanceService?action=addTitle&session='+ escape(this.sessionId) + '&resource=' + escape(uri) + '&title='+ escape(title);
			$.get(query, function(data) {
			});
		}		
	};
	/**
	 * 
	 * @param className Type of the node
	 */
	this.addNode = function(className, title) {
		var query = server + 'ProvenanceService?action=addNode&session='+ escape(this.sessionId) + "&type=" + escape(className);
		var uri = "";
		jQuery.ajaxSetup({async : false});
		$.get(query, function(data) {
			//Trim the data.
			data = data.replace(/^\s+|\s+$/g, '');
			provVis.comm.displayProcess(data, title, className);
			uri = data;
		});
		addTitle(uri, title);
		jQuery.ajaxSetup({async : true});
	};
	
	/**
	 * 
	 * @param className Type of the process
	 */
	this.addProcess = function(className) {
		var title = $("#-title").val();
		//If type is specified, add node instead.
		if (className != null && className != "") {
			return this.addNode(className, title);			
		}
		var query = server + 'ProvenanceService?action=addProcess&session='+ escape(this.sessionId);
		var uri = "";
		jQuery.ajaxSetup({async : false});
		$.get(query, function(data) {
			//Trim the data.
			data = data.replace(/^\s+|\s+$/g, '');
			provVis.comm.displayProcess(data, title, className);
			uri = data;
		});
		addTitle(uri, title);
		jQuery.ajaxSetup({async : true});
	};

	/**
	 * 
	 * @param className Type of the agent
	 */
	this.addAgent = function(className) {
		var title = $("#-title").val();
		var query = server + 'ProvenanceService?action=addAgent&session='+ escape(this.sessionId);
		if (className != null && className != "") {
			query += "&type=" + escape(className);
		}
		var uri = "";
		jQuery.ajaxSetup({async : false});
		$.get(query, function(data) {
			//Trim the data.
			data = data.replace(/^\s+|\s+$/g, '');
			provVis.comm.displayAgent(data, title, className);
			uri = data;
		});
		addTitle(uri, title);
		jQuery.ajaxSetup({async : true});
	};

	/**
	 * 
	 * @param className Type of the artifact
	 */
	this.addArtifact = function(className) {
		var title = $("#-title").val();
		var query = server + 'ProvenanceService?action=addArtifact&session='+ escape(this.sessionId);
		var uri = "";
		jQuery.ajaxSetup({async : false});
		if (className != null && className != "") {
			query += "&type=" + escape(className);
		}
		$.get(query, function(data) {
			//Trim the data.
			data = data.replace(/^\s+|\s+$/g, '');
			provVis.comm.displayArtifact(data, title, className);
			uri = data;
		});
		addTitle(uri, title);
		jQuery.ajaxSetup({async : true});
	};

	/**
	 * 
	 * @param uri URI of the resource
	 * @param className Type of the resource
	 * @param title Title of the resource
	 */
	this.addExistingResource = function(uri, className, title) {
		var query = server
				+ 'ProvenanceService?action=addExistingResource&session='+ escape(this.sessionId) + '&resource=' + escape(uri) + '&type='+ escape(className);
		if (title != null && title != "") {
			query += "&title=" + escape(title);
		}
		$.get(query, function(data) {
			query = server + 'ProvenanceService?action=getShape&type='+ escape(className);
			$.get(query, function(data) {
				provVis.graph.displayEntity(uri, title, data, className);
			});
		});
	};

	/**
	 * Adds causal relationship. The values are taken from UI.
	 * 
	 * @param from The start of the edge
	 * @param to The end of the edge
	 * @param relation The type of the relationship
	 */
	this.addCausalRelationship = function(from, to, relation) {
		//var cause = selected1.id;
		//var effect = selected2.id;
		//var relation = $("#-menu").val();
		/*if($("#-menu").is(':hidden')){
			alert("No relation selected");
			return;			
		}*/
		if (relation == null || relation == "" || relation == "x") {
			alert("No relation selected");
			return;
		}

		var query = server
				+ "ProvenanceService?action=addCausalRelationship&session="+ escape(this.sessionId) + "&from=" + escape(from) + "&to="+ escape(to) + "&relation=" + escape(relation);
		$.get(query, provVis.comm.displayNewCausalRelationship);
	};

	/**
	 * Adds session to the service.
	 */
	this.addSession = function() {
		var query = server + "ProvenanceService?action=startSession";
		$.get(query, function(data) {
			//Trim the data.
			data = data.replace(/^\s+|\s+$/g, '');
			this.sessionId = data;
		});

	};

	/**
	 * 
	 * @param relation URI of the relation.
	 */
	this.removeCausalRelationship = function(relation) {
		var query = server
				+ "ProvenanceService?action=removeCausalRelationShip&session="
				+ escape(this.sessionId) + "&relation=" + escape(relation);
		$.get(query, function(data) {
			//Trim the data.
			data = data.replace(/^\s+|\s+$/g, '');
		});
	};

	/**
	 * @param node URI of the node.
	 */
	this.removeNode = function(node) {
		var query = server + "ProvenanceService?action=removeNode&session="
				+ escape(this.sessionId) + "&node=" + escape(node);
		$.get(query, function(data) {
			//Trim the data.
			data = data.replace(/^\s+|\s+$/g, '');
		});
	};
};
