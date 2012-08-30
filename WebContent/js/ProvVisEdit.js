/**
 * 
 * @author Alan Eckhardt a.e@centrum.cz
 * @param provVis
 * @returns
 */function ProvVisEdit(provVis){
	this.provVis = provVis;
	this.disabledTypes = [];
	this.enableEditing = function(data){
		data = data.replace(/^\s+|\s+$/g, ''); 
		provVis.comm.sessionId = data;
		provVis.graph.provenanceEditable = true;
		provVis.graph.checkEditing();
	};
	this.disableEditing = function(data){
		
	};
		
	this.initProvenance = function() { 
	
		   loadProperties();
		   loadSuperclasses();
		   // Now fill the subclasses.
		   for(var x in superclasses){
			   var xsuperclasses = superclasses[x];
			   for(var y in xsuperclasses){
				   if(subclasses[y] == null){
					   subclasses[y] = [];
				   }
				   subclasses[y].push(x);
			   }
		   }	
			$("#ArtifactsList").hide();
			$("#AgentsList").hide();
			$("#ProcessesList").hide();
	
			$("#ProcessesDisableList").hide();
			$("#ArtifactsDisableList").hide();
			$("#AgentsDisableList").hide();
			
			$("#ArtifactsList").treeview({collapsed : true});
			$("#AgentsList").treeview({collapsed : true});
			$("#ProcessesList").treeview({collapsed : true});
	
			$("#ProcessesDisableList").treeview({collapsed : true});
			$("#ArtifactsDisableList").treeview({collapsed : true});
			$("#AgentsDisableList").treeview({collapsed : true});
			$("#EdgesDisableList").treeview({collapsed : false});
			
			$(".center-container").resizable({
				maxWidth: 945,
				resize: function(event, ui) {
					provVis.jsPlumb.width = ui.size.width-115, 
					provVis.jsPlumb.height = ui.size.height-40;
				}
			});
			
			// Check if closing non-commited window
	        $(window).bind('beforeunload', function(){
				if(provVis.graph.provenanceEditable == true){           
					var message =  '-- You have not commited your changes in provenance  ---' + 
			           '\n Do you really want to leave the page?';
		           return message;
				}
	           });
			
			// attach autocomplete
	        $('#provenanceInputString').autocomplete({  						  
	            // define callback to format results
	            source: function(req, add){  	
	            	var range = $("#classSelect").val();
				    if(range == null)
				    	range = "http://openprovenance.org/ontology#Artifact";   
	                // pass request to server
	                $.get("/ourspaces/search/quicksearch.jsp?type="+escape(range)+"&output=JSON", req, function(data) {
						// Trim the data.
						data = data.replace(/^\s+|\s+$/g, '') ;				
						var json =  eval('(' + data + ')');
	                    // create array for response objects
	                    var suggestions = [];  
	                    // process response
	                  	$.each(json, function(i, val){suggestions.push(val);});  
	                	// pass array to callback
	                	add(suggestions);  
	                });
	                
	        },  
	        create: function(e, ui) {  
				$('.ui-autocomplete.ui-menu ').css("z-index","2000");
	        },
	        open: function(event, ui) { 
				$('.ui-autocomplete.ui-menu ').css("z-index","2000");
			},
	        // define select handler
	        select: function(e, ui) {
			      // Add the resource to the graph
			      	var query = "/ProvenanceService/ProvenanceService?action=getNode&resource="+escape(ui.item.id);
			      	$.get(query, function(data) {
			      		// Trim the data.
			      		data = data.replace(/^\s+|\s+$/g, '') ;
			      		graph =  eval('(' + data + ')');
			      		for(x in graph){
			      			var node = graph[x];
			      			provVis.core.addNode(node);
			      		}
			      	});	              
	        },
	        close:function(e, ui) { 
			  	// Empty the edit box
			   	$('#provenanceInputString').val("");
	        }
	     });        
	
			// Add possibility to disable edges
	        $("#EdgesDisableList br").remove();
	        $("#EdgesDisableList li a").each(function(){
				var span = $("<span>");
				var el = $("<input>");
				el.attr("type","checkbox");
				el.attr("data-edge",x);
				el.attr("checked","checked");
				span.append(el);
				el.click(function() {
					if($(this).attr("checked")=="checked"){
						var edge = $(this).parent().parent().parent().attr("data-class");
						// Show canvas
						$('[data-type="'+edge+'"]').show();
						// Show div with label
						$('.'+edge.substring(edge.indexOf('#')+1)).show();
						$('#infovis :contains("'+ProvVisCore.getLocalName(edge)+'")').show();
						
					}
					else{
						var edge = $(this).parent().parent().parent().attr("data-class");
						// Hiding canvases
						$('[data-type="'+edge+'"]').hide();
						// Hiding labels of edges
						$('.'+edge.substring(edge.indexOf('#')+1)).hide();
						$('#infovis :contains("'+ProvVisCore.getLocalName(edge)+'")').hide();						
					}
			});
				
	        	$(this).append(span);
	        });
			
			// Add checkbox to ProcessDisable list	
			$("#ProcessesDisableList li,#ArtifactsDisableList li,#AgentsDisableList li ").each(function(index) {
				// Only one checkbox.
				if($(this).children("a").siblings("input").html() == null){
					var check = $("<input>");
					check.attr("type","checkbox");
					check.attr("checked","checked");
					check.click(function(){
						provVis.edit.uncheck(this);
					});					
				  // Append the checkbox just after the link.
					$(this).children("a").after(check);
				}
			});
			
		};
		
		
		
		this.uncheck = function(el){
			var ch = $(el).siblings('input'); 
			if(ch == null || $(ch).size() == 0)
				ch = $(el);
			if(ch.attr('checked')=='checked') {
				ch.removeAttr('checked');
			}
			else{
				ch.attr('checked','checked');
			}
			var type = $(ch).parent().attr("data-class");
			// Call the event explicitly.
		    var selector = '[data-fulltype="'+type+'"]';
			var checked = ch.attr("checked");
			provVis.graph.hideType(selector, checked);
			var index = this.disabledTypes.indexOf(type); 
			if(index==-1){
				// Add new disabled type.
				this.disabledTypes.push(type);
			}
			else{
				// Delete the type from the array.
				this.disabledTypes.splice(index,1);
			}
			// Do the same for children types.
			$(el).parent().children("ul").children().children("a").click();
		};
}