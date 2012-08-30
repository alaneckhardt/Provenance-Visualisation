<%@ page language="java"
	import="common.ParameterHelper,provenanceService.*,com.hp.hpl.jena.rdf.model.*,com.hp.hpl.jena.ontology.*,java.util.Iterator,java.util.*,java.net.*,java.text.SimpleDateFormat,java.util.ArrayList,java.io.*,java.net.*,java.util.Vector"
	contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1"%>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>Provenance Visualisation demo</title>
<link rel="stylesheet" type="text/css" href="/ourspaces/style.css" />
<link rel="stylesheet" type="text/css" href="/ourspaces/css/imageFrame.css"  />
<link rel="stylesheet" type="text/css" href="/ourspaces/facebox.css" media="screen" />
<link rel="stylesheet" type="text/css" href="/ourspaces/inettuts.css" />
<link rel="stylesheet" type="text/css" type="/ourspaces/text/css" href="/ourspaces/css/custom-theme/jquery-ui-1.8.12.custom.css"  />
<link rel="stylesheet" type="text/css" href="/ourspaces/skins/tango/skin.css" />
<link rel="stylesheet" type="text/css" href="/ourspaces/javascript/jquery.treeview.css" />
<link rel="stylesheet" type="text/css" href="/ourspaces/css/chat.css" media="all" />
<link rel="stylesheet" type="text/css" href="/ourspaces/css/screen.css" media="all" />

<link rel="stylesheet" type="text/css" href="/ourspaces/css/jquery.ui.ourSpacesTagging.css" media="all" />


<!--[if lte IE 7]>
<link type="text/css" rel="stylesheet" media="all" href="/ourspaces/css/screen_ie.css" />
<![endif]-->  


<script type="text/javascript" src="/ourspaces/javascript/jquery-1.6.2.min.js"></script> 
<script type="text/javascript" src="/ourspaces/javascript/jquery-ui-1.8.16.custom.min.js"></script>
<script type="text/javascript" src="/ourspaces/javascript/jquery.simpletip-1.3.1.min.js"></script>
<script type="text/javascript" src="/ourspaces/javascript/jquery.qtip-1.0.0-rc3.min.js"></script> 
<script type="text/javascript" src="/ourspaces/javascript/jquery.treeview.js"></script>



<!-- Autocomplete -->
<link rel="stylesheet" type="text/css" href="/ourspaces/css/autocomplete/autocomplete.css " media="all" />
    
    
<!-- CSS Files -->
<link type="text/css"	href="/ProvenanceService/css/JsPlumb.css" rel="stylesheet" />
<link type="text/css"	href="/ProvenanceService/css/ForceDirected.css" rel="stylesheet" />
<link rel="stylesheet" type="text/css" href="./css/jquery.treeview.css" />
<!-- Custom files -->

<script type="text/javascript"	src="/ProvenanceService/js/jquery.jsPlumb-1.3.3-all.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/seedrandom.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/init.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/ProvVisGraph.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/ProvVisComm.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/ProvVisLayout.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/ProvVisCore.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/ProvVisEdit.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/ProvVis.js"></script>

</head>
<body style="width:595px; margin: 0 auto;">
<h1>Demo for <a href="https://github.com/alaneckhardt/Provenance-Visualisation">provenance visualisation</a>
</h1>
<br/><br/>
<%
ParameterHelper parHelp = new ParameterHelper(request, session);

	String resource = (String) parHelp.getParameter("resource","");
	String editable = (String) parHelp.getParameter("editable","false");
	String escId;
	if(resource.contains("#"))
		escId = resource.substring(resource.indexOf("#")+1);
	else
		escId = resource.substring(resource.indexOf("/")+1);
%>
<script>
	provVis.core.graph = [];
	provVis.graph.provenanceEditable = false;	
	provVis.jsPlumb.width = 495, provVis.jsPlumb.height = 165, provVis.jsPlumb.offsetX=700, provVis.jsPlumb.offsetY=700;
	provVis.jsPlumb.canvas = "infovis";
	
	/**
	 * Logs given things into database. 
	 * @param table name of the table, where the things should be inserted.
	 * @param insert comma separated list of values. The string will be inserted as such into SQL INSERT statement.
	 */
	function log(table, insert){
		$.ajax({
	        type: "post",
	        cache: false,
	        url: "/ourspaces/LoggerSearch",
	        data: {table:table, insert:insert}
	    });
	}
	function initProvDisplay(){
		function getNodeTimestamp(node){
			for (var j=0;j<node.properties.length;j++){
		        var prop = node.properties[j];
		    	if("http://www.policygrid.org/ourspacesVRE.owl#timestamp"!=prop.name)
		    		continue;
		        return 1.0*prop.value;
		    }
			return null;
		}    	
		//Emphasize main artifact
		$("#"+provVis.core.getLocalName(artifactId)).addClass("focused");//css("border","3px solid black").css("opacity","1");
		//$("#"+getLocalName(artifactId)+" p").css("font-weight","bold");    
		//Do the nlg for icons.
		$(".icon").each(function(){
			var item=this;
			//Check if the NLG is already bound

			if(typeof $(this).data("events") != "undefined"
				&& typeof $(this).data("events").mouseover != "undefined"
				&& $(this).data("events").mouseover.length >= 1){
				for(var x in $(this).data("events").mouseover){
					if($(this).data("events").mouseover[x].namespace.substring(0,4)=="qtip")
						return;
				}
			}
			   $(this).qtip({
		  	    content: {
			      url: '/ourspaces/LiberRestServlet', 
			      data: { resourceID: $(this).attr("rel") },
			      method: 'get'
			   },
			   hide: {
		           fixed: true // Make it fixed so it can be hovered over
		        },
		       position: { adjust: { x: -10, y: -10 } },
			   style: {
		           padding: '10px', // Give it some extra padding
		           //name: 'cream',
		           tip: { color: 'black' } 
		        }
			});
		});

		$(".shape").unbind('click.log');
		$(".shape").bind('click.log', function(){
			if(typeof clickedGraph == 'undefined'){
				clickedGraph = true;
				log('log_graphVis(userid,resid, page, actiontype)',userID+',\''+$(this).attr("data-id")+'\',\''+document.URL+'\',\'click\'');
			}
			return true;
		});
		$(".shape .trigger").unbind('click.log');
		$(".shape .trigger").bind('click.log', function(){
			log('log_graphVis(userid,resid, page, actiontype)',userID+',\''+$(this.parentNode).attr("data-id")+'\',\''+document.URL+'\',\'expand\'');		
			return true;
		});
		$(".shape .info").unbind('click.log');
		$(".shape .info").bind('click.log', function(){
			log('log_graphVis(userid,resid, page, actiontype)',userID+',\''+$(this.parentNode).attr("data-id")+'\',\''+document.URL+'\',\'info\'');		
			return true;
		});
		
		
		$(".shape").draggable({
			start: function(event, ui) { 
					if(typeof draggedGraph == 'undefined'){
						draggedGraph = true;
						log('log_graphVis(userid,resid, page, actiontype)',userID+',\''+$(this).attr("data-id")+'\',\''+document.URL+'\',\'drag\'');
					}
					return true;
			   }
		});
		$(".center-container").hover(function(){
			if(typeof logShow == 'undefined'){
				logShow = true;
				log('log_graphVis(userid,resid, page, actiontype)',userID+',\'\',\''+document.URL+'\',\'demo\'');
			}		
		});
	}
	artifactId = 'http://openprovenance.org/ontology#a6949315-c161-4978-bdf0-46e29e528997';
	userID = -17<%=(int)session.hashCode()/1000%>;
	</script>
	<div style="border: 1px solid black;float: left;margin: 0 auto;">
		<jsp:include page="../testProvenance/provenanceOne.jsp" flush="false">
			<jsp:param value="http://openprovenance.org/ontology#a6949315-c161-4978-bdf0-46e29e528997" name="resource"/>
			<jsp:param value="false" name="editable"/>
		</jsp:include>
	</div>	
</body>
</html>