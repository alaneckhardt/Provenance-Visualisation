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
	var server = '/ProvenanceService/';
	var serverVisual = '/ProvenanceService/';
	var process_counter = 0;
	var agent_counter = 0;
	var artifacts_counter = 0;
	var edges_counter = 0;
	var process;
	var sessionId = '0';
	var provConf = {
			"linkAgent":function(node, dInfo){
				//get the person id
				$.get("/ourspaces/rest/person/"+getSimpleId(node.id), function(data) {
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
				dInfo.html('<a href="/ourspaces/artifact_new.jsp?id='+escape(getSimpleId(node.id))+'"><img style="border:none;margin:0px;" src="/ProvenanceService/css/images/info.png"></a>');
			
				/*dInfo.click(function() {
					window.location.href = "/ourspaces/artifact_new.jsp?id="+escape(getSimpleId(node.id));
				});*/
			},
			"linkProcess":function(node, dInfo){
				if(node.id.substring(0, "http://openprovenance.org/ontology#".length)=="http://openprovenance.org/ontology#")
					dInfo.html('<a href="/ourspaces/artifact_new.jsp?id='+escape(getSimpleId(node.id))+'"><img style="border:none;margin:0px;" src="/ProvenanceService/css/images/info.png"></a>');
				else
					dInfo.removeClass("info");
			},
	};	
	/**
	 * Returns the part of the URI without the namespace
	 * @param uri
	 * @returns
	 */
	function getLocalName(uri){
		if(uri == null || uri == "")
			return "";
		if(uri.indexOf('#')>0)
			return uri.substring(uri.indexOf('#')+1);
		else if(uri.indexOf('/')>0)
			return uri.substring(uri.lastIndexOf('/')+1);
		else
			return uri;
	}
	
	/**
	 * Returns the namespace part of the URI
	 * @param uri
	 * @returns
	 */
	function getNamespace(uri){
		if(uri == null || uri == "")
			return "";
		if(uri.indexOf('#')>0)
			return uri.substring(0, uri.indexOf('#')-1);
		else if(uri.indexOf('/')>0)
			return uri.substring(0, uri.indexOf('/')-1);
	}
	//function initProvDiplay(){
		
	//}
	function init(){
		$.getScript("./js/edges.jsp", function(data, textStatus){
				   loadProperties();
				   for(x in edges){
					   edge = edges[x];
					   $("#-menu").append('<option id="'+edge.edge+'" value="'+edge.idEdge+'" selected>'+edge.edge+'</option>');
				   }
		});
		$.getScript("./getSuperclasses.jsp?className=http://openprovenance.org/ontology%23Artifact", function(data, textStatus){
			   loadSuperclassesArtifact();
				$.getScript("./getSuperclasses.jsp?className=http://openprovenance.org/ontology%23Agent", function(data, textStatus){
					   loadSuperclassesAgent();
						$.getScript("./getSuperclasses.jsp?className=http://openprovenance.org/ontology%23Process", function(data, textStatus){
							   loadSuperclassesProcess();
							   //Now fill the subclasses.
							   for(var x in superclasses){
								   var xsuperclasses = superclasses[x];
								   for(var y in xsuperclasses){
									   if(subclasses[y] == null){
										   subclasses[y] = [];
									   }
									   subclasses[y].push(x);
								   }
							   }
						});
				});
		});
		

	}
	

	function typesFit(type, requiredType){
		if(type == requiredType)
			return true;
		if(type == null ||  superclasses[type] == null ||  typeof superclasses[type] == 'undefined')
			return false;
		if($.inArray(requiredType, superclasses[type])==-1)
			return false;
		return true;
	}
	/**
	 * Disable edges that do not correspond to current selection.
	 */
	function disableEdges(){
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
			if(typesFit(cause, e.fromAllValuesFrom)&&
					typesFit(effect, e.toAllValuesFrom)
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
	}

		 