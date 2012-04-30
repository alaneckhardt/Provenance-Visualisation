<%@ page language="java"
	import="provenanceService.*,com.hp.hpl.jena.rdf.model.*,com.hp.hpl.jena.ontology.*,java.util.Iterator,java.util.*,java.net.*,java.text.SimpleDateFormat,java.util.ArrayList,java.io.*,java.net.*,java.util.Vector"
	contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1"%>

<!-- CSS Files -->
<link type="text/css"	href="/ProvenanceService/css/JsPlumb.css" rel="stylesheet" />
<link type="text/css"	href="/ProvenanceService/css/ForceDirected.css" rel="stylesheet" />
<link rel="stylesheet" type="text/css" href="./css/jquery.treeview.css" />
<!-- <link type="text/css"	href="./css/ui-lightness/jquery-ui-1.8.16.custom.css" rel="stylesheet" />-->

<!-- <script type="text/javascript"	src="/ProvenanceService/js/jquery-1.6.2.min.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/jquery.qtip-1.0.0-rc3.min.js"></script>-->
<script type="text/javascript"	src="/ProvenanceService/js/jquery.jsPlumb-1.3.3-all.js"></script>

<!-- Custom files -->
<script type="text/javascript"	src="/ProvenanceService/js/seedrandom.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/init.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/graphOperations.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/customJsPlumb.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/customJsPlumbSpring.js"></script>
<script type="text/javascript"  src="/ProvenanceService/js/jquery-ui-1.8.16.custom.min.js"></script>
<script type="text/javascript" src="/ProvenanceService/js/jquery.treeview.js"></script>

<!-- <script type="text/javascript" src="/ourspaces/javascript/top.js"></script> -->

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
	json = [];
	var provenanceEditable = <%=editable%>;
	var superclasses = new Object();
	var subclasses = new Object();
	
	jsPlumb.width = 495, jsPlumb.height = 165, jsPlumb.offsetX=1000, jsPlumb.offsetY=1000;
	jsPlumb.canvas = "infovis";
	<jsp:include page="js/edges.jsp"	flush="false">
		<jsp:param value="location" name="id"/>
		<jsp:param value="false" name="controls"/>
	</jsp:include>	
	<jsp:include page="getSuperclasses.jsp"	flush="false">
		<jsp:param value="http://openprovenance.org/ontology#Artifact" name="className"/>
	</jsp:include>	
	<jsp:include page="getSuperclasses.jsp"	flush="false">
		<jsp:param value="http://openprovenance.org/ontology#Agent" name="className"/>
	</jsp:include>	
	<jsp:include page="getSuperclasses.jsp"	flush="false">
		<jsp:param value="http://openprovenance.org/ontology#Process" name="className"/>
	</jsp:include>	


	
	
	function enlargeProvenance(){
		var newEl = $("<div>");
		newEl.attr("id","dialogProvenance");
		newEl.appendTo('body');
		//Pull the provenance to the dialog
		var content = $('#provenance<%=escId%>').detach();
		content.appendTo('#dialogProvenance');
		$("#center-container").css("width","100%");
		$("#center-container").css("height","95%");
		$( "#dialogProvenance" ).dialog({
			width: 946,
			height: 600,
			modal: true,
			open: function(event, ui) { 
				jsPlumb.width = $("#center-container").width()-115, 
				jsPlumb.height = $("#center-container").height()-40;
				layout();
			},
			//Push the provenance back to place.
			close: function(event, ui) { 	
				var content = $('#provenance<%=escId%>').detach();
				content.prependTo('#provenanceResource');
				$("#center-container").css("width","100%");
				$("#center-container").css("height","250px");
				jsPlumb.width = $("#center-container").width()-115;
				jsPlumb.height = $("#center-container").height()-40;
				content.css("z-index","1");
				$( "#dialogProvenance" ).remove();
				layout();

				//jsPlumb.width = $("#center-container").width()-30, 
				//jsPlumb.height = $("#center-container").height()-30;
			}
		});
	}
	
	$(document).ready(function() { 
		$("#center-container").css("width","100%");
		$("#center-container").css("height","250px");

		$("#provenance<%=escId%>").css("width","100%");
		$("#provenance<%=escId%>").css("height","100%");
		
		jsPlumb.width = $("#center-container").width()-115, 
		jsPlumb.height = $("#center-container").height()-40;
		loadProperties();
	
		   loadSuperclassesProcess();
		   loadSuperclassesArtifact();
		   loadSuperclassesAgent();
		   //Now fill the subclasses.
		   var x,y;
		   for(x in superclasses){
			   var subclass = x;
			   var xsuperclasses = superclasses[x];
			   for(y in superclasses){
				   var superclass = y;
				   if(subclasses[y] == null){
					   subclasses[y] = [];
				   }
				   subclasses[y].push(x);
			   }
		   }
		   
	//Load the resource and nearest neighbourhood.
		loadProvenance('<%=resource%>');
		});
	</script>
<div  style="float:left" id="provenance<%=escId%>">
	
	
	<div id="center-container">
		<!-- <div id="timeArrow" style="float: left;top: 165px;position: relative;opacity: 0.6;">
			<div id="arrowText" style="color: black;font-size: large;font-weight: bold;left: 200px;position: relative;top: 17px;width: 50px; z-index: 999;">Time</div>
			<div id="arrowBody" style="background-color: darkgrey;float: left;height: 6px;position: relative;top: 7px;width: 550px;"></div>
			<div id="arrowHead" style="border-bottom: 10px inset white;border-left: 20px inset white;border-top: 10px outset white;float: right;"></div>
		</div> -->
		<div id="infovis" class="infovis"></div>
	</div>
	
	<div style="background-color: #222222;float: left; width: 100%;">
							<a style="float:left" href="#" onclick="enlargeProvenance();return false;"><img src="/ourspaces/icons/001_38.png" style="border:0"></img></a>
							<a style="float:left" href="#" onclick="layout();return false;"><img src="/ourspaces/icons/001_39.png" style="border:0"></img></a>
						</div>
</div>
