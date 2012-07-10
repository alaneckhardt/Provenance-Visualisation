/**
 * 
 * @returns {ProvVisGraph}
 */
function ProvVisGraph(provVis) {
	this.provVis = provVis;
	this.zoomLevel = 10;
	this.provenanceEditable = false;
	this.hidden = false;
	this.switchVisibility = function() {
		if(this.hidden == false){
			this.hideType(".selected", "");
			this.hidden = true;
		}
		else{
			this.hidden = false;
			this.hideType(".selected", "checked");			
		}
	};
	this.hideSelected = function() {
		this.hideType(".selected", "");
	};
	this.showAll = function(){
		this.hideType(".selected", "checked");
	};
	
	this.hideType = function(selector, checked){
		$(selector).each(function(index) {
			if(checked != "checked"){
				// Hide the div
				$(this).hide();
				// Hide endpoints and edges
				var id = $(this).attr("id");
				$("."+id).hide();
				provVis.core.graph[$(this).attr("data-node")].hidden = true;
			}
			else{
				// Show the div
				$(this).show();
				// Show endpoints and edges
				var id = $(this).attr("id");
				$("."+id).show();
				provVis.core.graph[$(this).attr("data-node")].hidden = false;
				var c = jsPlumb.getConnections({source:id});  
				c = c.concat(jsPlumb.getConnections({target:id}));  
				for(var con in c){
					var connection = c[con];
					connection.repaint();
				}
			}
		});
	};
	/**
	 * Zooming on mouse wheel event.
	 * @param event
	 */
	this.wheel = function(event) {
		var delta = 0;
		if (!event) /* For IE. */
			event = window.event;
		if (event.wheelDelta) { /* IE/Opera. */
			delta = event.wheelDelta / 120;
		} else if (event.detail) {
			/** Mozilla case. */
			/**
			 * In Mozilla, sign of delta is different than in IE. Also, delta is
			 * multiple of 3.
			 */
			delta = -event.detail / 3;
		}
		/**
		 * If delta is nonzero, handle it. Basically, delta is now positive if
		 * wheel was scrolled up, and negative, if wheel was scrolled down.
		 */
		if (delta) {
			var multiple = 1.5;
			if (delta < 0)
				multiple = 1 / 1.5;
			var centerX = event.pageX - $("#" + jsPlumb.canvas).offset().left;
			var centerY = event.pageY - $("#" + jsPlumb.canvas).offset().top;
			// Limit the zooming.
			if ((provVis.graph.zoomLevel > 30 && multiple > 1)
					|| (provVis.graph.zoomLevel < 3 && multiple < 1))
				return;
			provVis.graph.zoomLevel *= multiple;

			provVis.graph.shrinkEdges();
			/*
			 * $('._jsPlumb_endpoint').each(function(index) {
			 * jsPlumb.repaint($(this));//Everything });
			 */

			$('.shape').each(function(index) {
				provVis.graph.shrinkDiv(this, multiple, centerX, centerY);
			});

			// Repaint correct position of the draggable endpoints.
			jsPlumb.repaintEverything();
		}
		/**
		 * Prevent default actions caused by mouse wheel. That might be ugly,
		 * but we handle scrolls somehow anyway, so don't bother here..
		 */
		if (event.preventDefault)
			event.preventDefault();
		event.returnValue = false;
	};

	/**
	 * Displays given node
	 * 
	 * @param id URI of the node
	 * @param title Title
	 * @param shape  Shape of the node
	 * @param opmType URI of the type.
	 */
	this.displayEntity = function(id, title, basicType, fullType) {
		var escId = provVis.core.getLocalName(id);
		var node = {
			"id" : id,
			"title" : title,
			"basicType" : basicType,
			"fullType" : fullType,
			"escId" : escId,
			"adjacencies" : []
		};
		this.addNode(node);
	};

	this.displayRelationship2 = function(adj) {

		var classes = "";
		for (var x in adj.properties) {
			var prop = adj.properties[x];
			if (prop.name == "class")
				classes += prop.value + " ";
		}
		this.displayRelationship(adj.id, adj.type, adj.from, adj.to, classes);
	};
	/**
	 * 
	 * @param id URI of the edge
	 * @param type  Type of the connection
	 * @param from URI of the source div
	 * @param to URI of the target div
	 */
	this.displayRelationship = function(id, type, from, to, classes) {
		// Trim the data.
		var idTrim = id.replace(/^\s+|\s+$/g, '');
		var typeVis = type.substring(type.indexOf('#') + 1);
		var escfrom = from.substring(from.indexOf('#') + 1);
		var escto = to.substring(to.indexOf('#') + 1);
		// Do not duplicate edges.
		if (provVis.core.checkExistsEdge(idTrim, escfrom, escto))
			return;

		var classes = "";
		if ($("#" + escfrom).hasClass("system")
				|| $("#" + escto).hasClass("system"))
			classes = "system";

		this.setClasses(classes + " " + escfrom + " " + escto + " _jsPlumb_overlay");
		// var fromJson = json[$("#"+escfrom).attr("data-node")];
		// fromJson.adjacencies.push({"from":,
		// "to":$("#"+escto).attr("data-node"), "title":title});
		var loc = 0.5;
		// Hack for allowing two names of edges above one another.
		if ("Used" == typeVis)
			loc = 0.4;
		// Switch the direction of the edge and make the label in active form
		/*
		 * if("WasGeneratedBy"===typeVis ||"WasControlledBy"===typeVis){ var tmp =
		 * escfrom; escfrom = escto; escto = tmp;
		 * if("WasGeneratedBy"===typeVis){ typeVis = "Generated"; } else
		 * if("WasControlledBy"===typeVis){ typeVis = "Controlled"; } }
		 */
		// anchor:"AutoDefault",
		var anchors = [ [ 0.5, 0, 0, -1 ], [ 1, 0.5, 1, 0 ], [ 0.5, 1, 0, 1 ], [ 0, 0.5, -1, 0 ] ];
		var text = typeVis;
		//if (typeof this.provenanceEditable != "undefined"	&& this.provenanceEditable == true) {
			text += " <span style=\"\" class=\"delete\"><a href=\"#\" onclick=\"removeEdge('" + idTrim + "','" + escfrom + "','" + escto + "');\">x</a></span>";
		/*} else {
			text += " <span style=\"\" class=\"delete disabled\"><a href=\"#\" onclick=\"removeEdge('"+ idTrim + "','"+ escfrom + "','"+ escto + "');\">x</a></span>";
		}*/
		var con = jsPlumb.connect({
			source : escfrom,
			target : escto,
			dynamicAnchors : anchors,
			connector : [ "Straight" ],// [ "Straight"], ["Flowchart"]
			overlays : [
					[ "Arrow", { width : 15,length : 15,location : 1, cssClass : "arrow"	} ],
					[ "Label",{	id : idTrim, label : text,
						cssClass : classes+ " label " + type.substring(type.indexOf('#') + 1),
						location : loc,
						labelStyle : {color : "black" }
					}]
			],
			endpoint : [ "Rectangle", {
				width : 5,
				height : 3,
				isSource : false,
				isTarget : false
			} ]
		});

		$(con.canvas).addClass(classes);
		$(con.canvas).attr("data-id", idTrim);
		$(con.canvas).attr("data-type", type);
		$(con.canvas).attr("data-typetext", typeVis);
	};

	/**
	 * Removes the node.
	 * 
	 * @param node
	 *            JSON object
	 */
	this.removeElement = function(nodeId) {
		var r = confirm("Really delete the node and all its connections?");
		if (r == true) {
			jsPlumb.removeAllEndpoints(provVis.core.getLocalName(nodeId));
			var e = $('#' + provVis.core.getLocalName(nodeId));
			// Set json to empty object
			provVis.core.removeNode(nodeId);
			// Delete the element from canvas
			e.remove();
			// TODO remove all connections
		}
	};

	/**
	 * Removes the connection.
	 * 
	 * @param id
	 *            URI of the edge
	 * @param sourceId
	 *            HTML-id of the source div
	 * @param targetId
	 *            HTML-id of the target div
	 */
	this.removeEdge = function(id, sourceId, targetId) {
		var r = confirm("Really delete the connection?");
		if (r == true) {
			provVis.core.removeEdge(id);
			// var c =
			// jsPlumb.getConnections({source:sourceId,target:targetId});
			jsPlumb.detach(sourceId, targetId);
		}
	};


	/**
	 * Shrinks the div with given multiplier
	 * 
	 * @param div
	 *            Div to shrink
	 * @param multiple
	 *            How many times to shrink
	 */
	this.shrinkDiv = function(div, multiple, centerX, centerY) {
		var x = $(div).css("left");
		var y = $(div).css("top");
		var w = $(div).width();
		// var h = $(div).height();
		// Strip the px at the end
		x = x.substring(0, x.length - 2);
		y = y.substring(0, y.length - 2);
		$(div).css("left", (x - centerX) * multiple + centerX);
		$(div).css("top", (y - centerY) * multiple + centerY);
		$(div).width(w * multiple);
		// $(div).height(h*multiple);

		// Change font size
		var currentFontSize = $(div).css('font-size');
		var currentFontSizeNum = parseFloat(currentFontSize, 10);
		var newFontSize = currentFontSizeNum * multiple;
		$(div).css('font-size', newFontSize);

		// Shrink the endpoint
		jsPlumb.Defaults.Endpoint = [ "Dot", {
			radius : this.zoomLevel
		}, {
			isSource : true,
			isTarget : true
		} ];
		var endpoint = jsPlumb.getEndpoint("end-" + $(div).attr("id"));
		w = $(endpoint.canvas).width();
		endpoint.setPaintStyle({
			radius : this.zoomLevel,
			fillStyle : "#aaa"
		});

		// Shrink the trigger icon
		w = $(div).children(".trigger").width();
		$(div).children(".trigger").width(w * multiple);
		$(div).children(".trigger").height(w * multiple);
		// Shrink the info icon
		w = $(div).children(".info").children("a").children("img").width();
		if (w > 0) {
			$(div).children(".info").children("a").children("img").width(w * multiple);
			$(div).children(".info").children("a").children("img").height(w * multiple);
		}
		// Shift the controls to the right
		$(div).children(".controls").css("left", $(div).width());
		$(div).children(".controls").css("top", "-" + $(div).height());

		// jsPlumb.repaint($(div));//Everything
		// jsPlumb.repaint(endpoint);//Everything
	};

	/**
	 * Shrinks the edge label with given multiplier
	 * 
	 * @param edge
	 *            Label to shrink
	 * @param multiple
	 *            How many times to shrink
	 */
	this.shrinkEdges = function() {
		// Change font size
		// var currentFontSize = $("._jsPlumb_overlay.label").css('font-size');
		// var currentFontSizeNum = parseFloat(currentFontSize, 10);
		var newFontSize = 14 * this.zoomLevel / 10;
		$("._jsPlumb_overlay.label").css('font-size', newFontSize);
	};



	this.getElementDiv = function(node) {
		var dInner = $('<div>');
		var dTrigger = $('<div>');
		var dIcon = $('<div>');
		var dInfo = $('<div>');
		dInner.attr("id", provVis.core.getLocalName(node.id));
		dInner.addClass(node.basicType);
		dInner.addClass("shape");
		for (var x in node.properties) {
			var prop = node.properties[x];
			if (prop.name == "class")
				dInner.addClass(prop.value);
		}

		dInner.css("z-index", "4");
		dInner.html("<p style=\"padding: 0.1em 0;\">" + node.title + "</p>");
		var w = jsPlumb.width, h = jsPlumb.height;
		var x = jsPlumb.offsetX + (0.1 * w)	+ Math.floor(Math.random() * (0.8 * w));
		var y = jsPlumb.offsetY + (0.1 * h)	+ Math.floor(Math.random() * (0.8 * h));
		dInner.css("top", y + 'px');
		dInner.css("left", x + 'px');

		// Popup for trigger.
		$(dTrigger).qtip({
			content : "Load the provenance around this node.",
			show : {delay : 1500},
			hide : {delay : 500,fixed : true},
			position : {adjust : {x : -10,y : -10}},
			style : {padding : '2px',tip : {color : 'black'}}
		});
		$(dTrigger).click(function() {
			provVis.core.loadProvenance(node.id, provVis.comm.sessionId);
			return false;
		});
		dTrigger.addClass("trigger");

		// Redirect to artifact space
		dInfo.addClass("info");

		// Adding details at the end - we need to call ajax, which results in
		// details being the last in the list.
		if (node.basicType == "Agent") {
			$(dInfo).qtip({
				content : "Show details about the agent.",
				show : {delay : 1500},
				hide : {delay : 500,fixed : true},
				position : {adjust : {x : -10,y : -10}},
				style : {padding : '2px',tip : {color : 'black'}}
			});
			provVis.core.conf.linkAgent(node, dInfo);
		}
		// Artifact
		else if (node.basicType == "Artifact") {
			$(dInfo).qtip({
				content : "Show details about the artifact.",
				show : {delay : 1500},
				hide : {delay : 500,fixed : true},
				position : {adjust : {x : -10,y : -10}},
				style : {padding : '2px',tip : {color : 'black'}}
			});
			provVis.core.conf.linkArtifact(node, dInfo);
		}
		// Process - do not show the link at all
		else {
			$(dInfo).qtip({
				content : "Show details about the process.",
				show : {delay : 1500},
				hide : {delay : 500,fixed : true},
				position : {adjust : {x : -10,y : -10}},
				style : {padding : '2px',tip : {color : 'black'}}
			});
			provVis.core.conf.linkProcess(node, dInfo);
		}
		dIcon.attr("rel", encodeURIComponent(node.id));
		dIcon.addClass('icon');
		// Do not allow provenance of Agents, there's too much
		if (node.basicType != "Agent") {
			dInner.append(dTrigger);
		}
		dInner.append(dIcon);
		dInner.append(dInfo);
		return dInner;
	};
	this.disable = function(edge, obj, type) {
		var escId = provVis.core.getLocalName(obj.id);
		$("#" + escId).droppable("destroy");
	};
	this.enable = function(edge, obj, type) {
		// enable dragging
		// var uuid = $("#"+obj.id).attr("data-endpoint");
		// var edgeName = edge.edge;
		var escId = provVis.core.getLocalName(obj.id);
		$("#" + escId + " p").droppable({
			scope : jsPlumb.Defaults.Scope,
			drop : function(event, ui) {
				// Create the new connection with the new
				// endpoint
				var id = -1, dataType;
				if (typeof $(this).attr("data-node") == "undefined"
						|| $(this).attr("data-node") == null) {
					id = $(this.parentNode).attr("data-node");
					dataType = $(this.parentNode).attr("data-fullType");
				} else {
					id = $(this).attr("data-node");
					dataType = $(this).attr("data-fullType");
				}
				selected2 = provVis.core.graph[id];
				var ed = provVis.core.findEdges(type, dataType, edges);
				if (ed.length > 1) {
					var form = $("<form>").attr("id","selectEdgeForm");
					var select = $("<select>").attr("id","selectEdge").css("width", "auto").css("display", "block").css("margin", "0 auto");
					for ( var z in ed) {
						var op = ed[z];
						select.append("<option style=\"padding:3px 10px 0 0;\" value=\""+ z + "\">"+ getLocalName(op.idEdge) + "</option>");
					}
					form.append(select);
					$(form).dialog({
						buttons : {
							"Ok" : function() {
								$(this).dialog("close");
							}
						},
						modal : true,
						title : "Choose the edge type",
						closeOnEscape : false,
						close : function() {
							var sel = $("#selectEdge").val();
							selectedEdge = ed[sel];
							provVis.comm.addCausalRelationship(selected1.id,selected2.id,selectedEdge.idEdge);
							form.remove();
						},
						focus : function() {
							$(".ui-dialog-titlebar-close").hide();
						}
					});
				} else {
					selectedEdge = ed[0];
					provVis.comm.addCausalRelationship(selected1.id,selected2.id, selectedEdge.idEdge);
				}
			}
		});
		$("#" + escId).addClass("hover");
		// Display the names of edges next to the node
		var txt = "";
		var edgesToDisplay = provVis.core.findEdges(type, $("#" + escId).attr("data-fullType"), edges);
		for ( var z in edgesToDisplay) {
			txt += edgesToDisplay[z].edge + ",";
		}
		// Strip the last ','
		txt = txt.substring(0, txt.length - 1);
		var div = $("<div>");
		div.addClass("labelDrag");
		div.css("margin-left", $("#" + escId).width() + "px");
		div.css("left", $("#" + escId).css("left"));
		div.css("top", $("#" + escId).css("top"));
		div.css("z-index", "1000");
		div.html(txt);
		$("#" + jsPlumb.canvas).append(div);

		// Set paint style of the endpoint of the node.
		var endpoint = jsPlumb.getEndpoint("end-" + escId);
		endpoint.setPaintStyle({
			fillStyle : "orange",
			outlineColor : "black",
			outlineWidth : 1,
			radius : this.zoomLevel
		});
		endpoint.paint();
	};
	/**
	 * Create a div representing the node.
	 * 
	 * @param node
	 *            JSON object.
	 * @returns the element div
	 */
	this.createElement = function(node) {
		// Do not duplicate nodes
		if (provVis.core.checkExists(node.id))
			return null;

		var d = this.getElementDiv(node);
		var escId = provVis.core.getLocalName(node.id);
		$("#" + jsPlumb.canvas).append(d);
		// Draggable endpoint.
		this.setClasses(escId + " _jsPlumb_endpoint");
		var endpoint = jsPlumb.addEndpoint(d, {
			anchor : "BottomCenter"
		}, {
			uuid : "end-" + escId,
			isSource : true,
			// We don't need drop - the elements are made droppable themselves
			// dynamically based on properties
			// isTarget:true,
			connector : "Straight",
			dragAllowedWhenFull : true,
			maxConnections : 20,
			// TODO check the edges
			dragOptions : {
				scope : jsPlumb.Defaults.Scope,
				start : function(e, ui) {
					// Repaint needed to address the problem with scrolling the
					// whole page and then dragging
					var cons = jsPlumb.getConnections();
					for ( var c in cons) {
						var con = cons[c];
						con.repaint();
					}
					selected1 = provVis.core.graph[$("#" + this.attributes.elid.value).attr("data-node")];
					var type = $("#" + this.attributes.elid.value).attr("data-fullType");
					var ed = provVis.core.findEdges(type, null, edges);
					for ( var x in ed) {
						var edge = ed[x];
						var range = edge.toAllValuesFrom;
						// TODO list all the nodes and check the range and the
						// type of the node.
						for ( var y in provVis.core.graph) {
							var obj = provVis.core.graph[y];
							// Skip the actual object
							if (obj == selected1)
								continue;

							if (provVis.core.testVisible(obj) && obj.fullType == range) {
								provVis.graph.enable(edge, obj, type);
							} else if (provVis.core.testVisible(obj)
									&& superclasses[obj.fullType] != null
									&& $.inArray(range,
											superclasses[obj.fullType]) != -1) {
								provVis.graph.enable(edge, obj, type);
							} else {
								provVis.graph.disable(edge, obj, type);
							}
						}
					}
				},
				stop : function(e, ui) {
					// Erase all stylings
					for ( var y in provVis.core.graph) {
						var obj = provVis.core.graph[y];
						var endpoint = jsPlumb.getEndpoint("end-" + provVis.core.getLocalName(obj.id));
						endpoint.setPaintStyle({
							fillStyle : "#aaa",
							radius : provVis.graph.zoomLevel
						});
						endpoint.paint();
						$("#" + provVis.core.getLocalName(obj.id)).removeClass("hover");
					}
					// Delete labels with edge names
					$(".labelDrag").remove();
				}
			}
		});
		// Make the endpoints for dragging more visible.
		$(endpoint.canvas).css("z-index", "5");

		var id = provVis.core.getLocalName(node.id), _d = jsPlumb.CurrentLibrary.getElementObject(d);
		jsPlumb.CurrentLibrary.setAttribute(_d, "id", id);
		jsPlumb.draggable(d);

		d.click(function() {
			d.toggleClass("selected");
			// TODO what to do onclick?
		});

		d.attr("data-basicType", node.basicType);
		d.attr("data-title", node.title);
		d.attr("data-id", node.id);
		d.attr("data-fullType", node.fullType);
		d.attr("data-node", provVis.core.graph.length - 1);

		// Hide it for the start - it will appear when hover above the element.
		// $(endpoint.canvas).hide();
		node.el = d;
		// If not editable, hide the editing things.
		if (this.provenanceEditable == false) {
			// Disable creating new connections.
			// $('._jsPlumb_endpoint').draggable("disable");
			$('._jsPlumb_endpoint').hide();
			// Hide "x" at the edge name.
			$('.delete').addClass("disabled");
		}
		// Shrink the div
		// shrinkDiv(d, zoomLevel/10, jsPlumb.offsetX+jsPlumb.width/2,
		// jsPlumb.offsetY+jsPlumb.height/2);
		return d;
	};

	/**
	 * Set class to all jsPlumb entities. Useful for showing the canvases back after they were hidden.
	 * 
	 * @param id
	 */
	this.setClasses = function(id) {
		jsPlumb.connectorClass = id;
		jsPlumb.endpointClass = id;
		jsPlumb.overlayClass = id;
	};

	/**
	 * Switches between editing and non-editing modes.
	 */
	this.checkEditing = function() {
		// If editable, show the editing things.
		if (this.provenanceEditable == true) {
			// Enable creating new connections.
			$('._jsPlumb_endpoint').show();
			jsPlumb.repaintEverything();
			// Show "x" at the edge name.
			$('.delete').removeClass("disabled");
			$("#"+jsPlumb.canvas).addClass("editable");
			// Enable controls on the left
			$('#endSessionCommit').removeAttr("disabled");
			$('#endSessionRollback').removeAttr("disabled");
			$('#-title').removeAttr("disabled");
			$('#addProcesses').removeAttr("disabled");
			$('#startSession').css("font-weight", "normal");
			$('#startSession').attr("disabled", "disabled");
		}
		// If not editable, hide the editing things.
		if (this.provenanceEditable == false) {
			// Disable creating new connections.
			$('._jsPlumb_endpoint').hide();
			jsPlumb.repaintEverything();
			// Hide "x" at the edge name.
			$('.delete').addClass("disabled");
			$("#"+jsPlumb.canvas).removeClass("editable");
			// Disable controls on the left
			$('#endSessionCommit').attr("disabled", "disabled");
			$('#endSessionRollback').attr("disabled", "disabled");
			$('#-title').attr("disabled", "disabled");
			$('#addProcesses').attr("disabled", "disabled");
			$('#startSession').css("font-weight", "bold");
			$('#startSession').removeAttr("disabled");
		}
	};
	

	/**
	 * Disable edges that do not correspond to current selection.
	 */
	this.disableEdges = function(){
		var cause = "", effect = "";
		if(selected1 != null)
			cause = selected1.data.$opmType;
		if(selected2 != null)
			effect = selected2.data.$opmType;
		var hidden = true;
		$("#-menu").show();
		$('#addCausalRelationship').removeAttr('disabled');

		for(x in edges){
			var e = edges[x];
			//Test if the required cause type is equal to the selected type or its super-type.
			//E.g. if a Process is required, selected can be DataCollection.
			if(provVis.core.typesFit(cause, e.fromAllValuesFrom)&&
					provVis.core.typesFit(effect, e.toAllValuesFrom)
			   ){
				$("#"+e.edge).removeAttr("disabled");
				$("#"+e.edge).show();
				$("#"+e.edge).select();
				$("#-menu").val(e.idEdge);
				hidden = false;
			}
			else{
				$("#"+e.edge).attr("disabled","disabled");
				$("#"+e.edge).hide();
			}
		}
		if(hidden){
			$("#-menu").hide();
			$("#addCausalRelationship").attr('disabled', 'disabled');		
		}
	};
}