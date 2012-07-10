/**
 * This is a class representing a node.
 */
function Node() {
		/**Uri of the edge*/
		this.id = null;
		/**Agent, Artifact or Process*/
		this.basicType = null;
		/**URI of the type*/
		this.fullType = null;
		/**Title of the node*/
		this.title = null;
		/**List of pairs {name,value}*/
		this.properties = [];
		/**List of edges*/
		this.adjacencies = [];
		
}
/**
 * This is a class representing an edge.
 */
function Edge() {
    	/**URI of the edge*/
		this.id = null;
	    /**URI of a node*/
	    this.to = null;
	    /**URI of a node*/
	    this.from = null;
	    /**URI of the type of the edge*/
	    this.type = null;
	    /**Text to display*/
	    this.typetext = null;
}

function EdgeType() {
	/**Uri of the edge*/
	this.idEdge = null;
	/**Name to display*/
    this.edge = null;
    /**Domain of the edge*/
    this.fromAllValuesFrom = 'http://openprovenance.org/ontology#Agent';
    /**Range of the edge*/
    this.toAllValuesFrom = 'http://openprovenance.org/ontology#Agent';
}
var server = '/ProvenanceService/';
var serverVisual = '/ProvenanceService/';
function ProvVisCore(provVis) {
	this.provVis = provVis;
	this.conf = {
		"linkAgent":function(node, dInfo){
			//get the person id
			$.get("/ourspaces/rest/person/"+provVis.core.getLocalName(node.id), function(data) {
				//Trim the data.
				data = data.replace(/^\s+|\s+$/g, '') ;
				var person =  eval('(' + data + ')');
				dInfo.html('<a href="/ourspaces/profile.jsp?id='+person.id+'"><img style="border:none;margin:0px;" src="/ProvenanceService/css/images/info.png"></a>');
				/*dInfo.click(function() {
					window.location.href = "./profile.jsp?id="+person.id;
				});*/
				
			});
		},
		"linkArtifact":function(node, dInfo){
			dInfo.html('<a href="/ourspaces/artifact_new.jsp?id='+escape(provVis.core.getLocalName(node.id))+'"><img style="border:none;margin:0px;" src="/ProvenanceService/css/images/info.png"></a>');
		
			/*dInfo.click(function() {
				window.location.href = "/ourspaces/artifact_new.jsp?id="+escape(ProvVisCore.getLocalName(node.id));
			});*/
		},
		"linkProcess":function(node, dInfo){
			if(node.id.substring(0, "http://openprovenance.org/ontology#".length)=="http://openprovenance.org/ontology#")
				dInfo.html('<a href="/ourspaces/artifact_new.jsp?id='+escape(provVis.core.getLocalName(node.id))+'"><img style="border:none;margin:0px;" src="/ProvenanceService/css/images/info.png"></a>');
			else
				dInfo.removeClass("info");
		},
	};	
	/**List of nodes*/
	this.graph = [];
	/**List of possible edge types*/
	this.edges = [];
	/**
	 * Returns the part of the URI without the namespace
	 * @param uri
	 * @returns
	 */
	this.getLocalName = function(uri){
		if(uri == null || uri == "")
			return "";
		if(uri.indexOf('#')>0)
			return uri.substring(uri.indexOf('#') + 1);
		else if(uri.indexOf('/')>0)
			return uri.substring(uri.indexOf('/') + 1);
		else
			return uri;
	};
	
	/**
	 * Returns the namespace part of the URI
	 * @param uri
	 * @returns
	 */
	this.getNamespace = function(uri){
		if(uri == null || uri == "")
			return "";
		if(uri.indexOf('#')>0)
			return uri.substring(0, uri.indexOf('#')-1);
		else if(uri.indexOf('/')>0)
			return uri.substring(0, uri.indexOf('/')-1);
	};
	this.initJsPlumb = function() {
		jsPlumb.reset();
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

		});

		// Panning support
		//jsPlumb.draggable($(".agent"));
		//jsPlumb.draggable($(".artifact"));
		//jsPlumb.draggable($(".process"));
		$(".artifact").draggable();

		if (document.getElementById(jsPlumb.canvas).addEventListener) {
			var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll"
					: "mousewheel"; // FF doesn't recognize mousewheel as of
									// FF3.x

			if (document.getElementById(jsPlumb.canvas).attachEvent) // if IE (and Opera depending on user setting)
				document.getElementById(jsPlumb.canvas).attachEvent(
						"on" + mousewheelevt, wheel);
			else if (document.getElementById(jsPlumb.canvas).addEventListener) // WC3 browsers
				document.getElementById(jsPlumb.canvas).addEventListener(
						mousewheelevt, provVis.graph.wheel, false);

			// window.addEventListener('DOMMouseScroll', wheel, false);
		}
		$("#" + jsPlumb.canvas).draggable({
			stop : function() {
				// Repaint correct position of the draggable endpoints.
				jsPlumb.repaintEverything();
			}
		});
	};

	this.findEdges = function(from, to, edgesIn) {
		var res = [];
		for ( var x in edgesIn) {
			var edge = edges[x];
			if (to == null
					&& (edge.fromAllValuesFrom == from || (superclasses[from] != null && $
							.inArray(edge.fromAllValuesFrom, superclasses[from]) != -1))) {
				res.push(edge);
			} else if (from == null
					&& (edge.toAllValuesFrom == to || (superclasses[to] != null && $
							.inArray(edge.toAllValuesFrom, superclasses[to]) != -1))) {
				res.push(edge);
			} else if (from != null
					&& to != null
					&& (edge.fromAllValuesFrom == from || (superclasses[from] != null && $
							.inArray(edge.fromAllValuesFrom, superclasses[from]) != -1))
					&& (edge.toAllValuesFrom == to || (superclasses[to] != null && $
							.inArray(edge.toAllValuesFrom, superclasses[to]) != -1))) {
				res.push(edge);
			}
		}
		return res;
	};

	/**
	 * Checks if the node exists on the canvas or not.
	 * 
	 * @param id
	 * @returns {Boolean}
	 */
	this.checkExists = function(id) {
		if ($("#" + this.getLocalName(id)).size() == 0)
			return false;
		return true;
	};

	this.checkExistsEdge = function(id, from, to) {
		// var con = jsPlumb.getConnections({ source:from, target:to});
		if ($("." + from + "." + to).size() == 0)
			return false;
		if ($("." + from + "." + to + "[data-id='" + id + "']").size() > 0)
			return true;
		$("." + from + "." + to).each(function(index, el) {
			if ($(el).attr("data-id") == id)
				return true;
		});
		return false;
		/*
		 * for(var x in con){ var c = con[x];
		 * if($(c.canvas).attr("data-id")==id) return true; } return false;
		 */
	};

	this.addEdge = function(edge, id) {
		var node2 = this.findNode(id);
		var found = false;
		for ( var z in node2.adjacencies) {
			var edge2 = node2.adjacencies[z];
			if (edge.id == edge2.id) {
				found == true;
				break;
			}
		}
		if (!found) {
			node2.adjacencies.push(edge);
		}
	};

	this.loadProvenance = function(res, sessionId) {
		//TODO - use prov service instead.
		var query = serverVisual + "getProvenance.jsp?entity=" + escape(res);
		if (typeof sessionId != 'undefined' && sessionId != null
				&& sessionId != "")
			query += "&sessionId=" + escape(sessionId);
		$.get(query, function(data) {
			// Trim the data.
			data = data.replace(/^\s+|\s+$/g, '');
			var graph = eval('(' + data + ')');
			// TODO - merge the edges!!!!
			for ( var x in graph) {
				var node = graph[x];
				provVis.core.addNode(node);
			}
			for (x in graph) {
				var node = graph[x];
				for ( var y in node.adjacencies) {
					var adj = node.adjacencies[y];
					provVis.core.addEdge(adj, adj.to);
					provVis.core.addEdge(adj, adj.from);
				}

				for ( var y in node.adjacencies) {
					var adj = node.adjacencies[y];
					provVis.graph.displayRelationship2(adj);
				}
			}
			provVis.graph.shrinkEdges();
			jsPlumb.repaintEverything();

			$('.info').hover(function() {
				$(this).css('cursor', 'pointer');
			}, function() {
				$(this).css('cursor', 'auto');
			});
			$('.trigger').hover(function() {
				$(this).css('cursor', 'pointer');
			}, function() {
				$(this).css('cursor', 'auto');
			});

			if(typeof initProvDisplay != 'undefined')
				initProvDisplay();
		});
	};

	/**
	 * Checks whether the given type is among required type and its subclasses
	 * @param type
	 * @param requiredType
	 */
	this.typesFit = function(type, requiredType){
		if(type == requiredType)
			return true;
		if(type == null ||  superclasses[type] == null ||  typeof superclasses[type] == 'undefined')
			return false;
		if($.inArray(requiredType, superclasses[type])==-1)
			return false;
		return true;
	};
	
	/* = functionshowEditing(){
		json = jsonBackup;
	}*/

	this.findNode = function(nodeId) {
		for ( var x in this.graph) {
			var node = this.graph[x];
			if (node.id == nodeId)
				return node;
		}
		return null;
	};
	/**
	 * Adds the given node to the graph.
	 * @param node
	 */
	this.addNode = function(node) {
		try {
			var node2 = this.findNode(node.id);
			//Append the new node to the list of nodes.
			if (node2 == null) {
				this.graph.push(node);
				var d = provVis.graph.createElement(node);
				if (d != null)
					provVis.graph.shrinkDiv(d, provVis.graph.zoomLevel / 10, jsPlumb.offsetX+ jsPlumb.width / 2, jsPlumb.offsetY + jsPlumb.height / 2);
			}
		} catch (err) {
			alert(err);
		}

	};
	/**
	 * Removes the given node from the graph.
	 * @param node
	 */
	this.removeNode = function(nodeId) {
		for ( var x in this.graph) {
			var node = this.graph[x];
			if (node.id == nodeId){
				this.graph[x] = new Object();
				provVis.comm.removeNode(nodeId);
				return;
			}
		}
	};
	/**
	 * Removes the given edge from the graph.
	 * @param node
	 */
	this.removeEdge = function(edgeId) {
		for ( var x in this.graph) {
			var node = this.graph[x];
			if (node.id == nodeId){
				this.graph[x] = new Object();
				provVis.comm.removeCausalRelationship(edgeId);
				return;
			}
		}
	};
	/**
	 * @param sessionId id of the session
	 */
	this.loadSession = function(sessionId) {
		var query = server + "ProvenanceService?action=getGraph&session="
				+ sessionId;
		$.get(query, function(data) {
			// Trim the data.
			data = data.replace(/^\s+|\s+$/g, '');
			var graph = eval('(' + data + ')');
			for (x in graph) {
				var node = graph[x];
				provVis.graph.createElement(node);
			}
			for (x in graph) {
				var node = graph[x];
				for (y in node.adjacencies) {
					var adj = node.adjacencies[y];
					provVis.graph.displayRelationship2(adj);
				}
			}
			provVis.layout.layout();
		});
	};  
	/**
	 * Test whether given node is visible or hidden.
	 * @param node
	 */
	this.testVisible = function(n){
    	if(typeof n.hidden != "undefined" &&n.hidden != null && n.hidden == true)
    		return false;
    	if(typeof provVis.edit.disabledTypes!= "undefined" && provVis.edit.disabledTypes.indexOf(n.fullType)!=-1)
    		return false;
    	return true;
    };
}