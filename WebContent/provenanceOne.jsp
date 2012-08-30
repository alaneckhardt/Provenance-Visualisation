<%@ page language="java"
	import="provenanceService.*,com.hp.hpl.jena.rdf.model.*,com.hp.hpl.jena.ontology.*,java.util.Iterator,java.util.*,java.net.*,java.text.SimpleDateFormat,java.util.ArrayList,java.io.*,java.net.*,java.util.Vector"
	contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1"%>
<!--  * @author Alan Eckhardt a.e@centrum.cz -->
<!-- CSS Files -->
<link type="text/css"	href="/ProvenanceService/css/JsPlumb.css" rel="stylesheet" />
<link type="text/css"	href="/ProvenanceService/css/ForceDirected.css" rel="stylesheet" />
<!-- <link type="text/css"	href="./css/ui-lightness/jquery-ui-1.8.16.custom.css" rel="stylesheet" />-->

<!-- <script type="text/javascript"	src="/ProvenanceService/js/jquery-1.6.2.min.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/jquery.qtip-1.0.0-rc3.min.js"></script>-->
<script type="text/javascript"	src="/ProvenanceService/js/jquery.jsPlumb-1.3.3-all.js"></script>

<!-- Custom files -->
<!--
<script type="text/javascript"	src="/ProvenanceService/js/seedrandom.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/init.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/graphOperations.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/customJsPlumb.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/customJsPlumbSpring.js"></script>
-->
<script type="text/javascript"	src="/ProvenanceService/js/seedrandom.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/ProvVisGraph.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/ProvVisComm.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/ProvVisLayout.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/ProvVisCore.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/ProvVisEdit.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/ProvVis.js"></script>


<script type="text/javascript"  src="/ProvenanceService/js/jquery-ui-1.8.16.custom.min.js"></script>

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
	

String artifacts = provenanceService.Properties.getString("artifact");
String agents = provenanceService.Properties.getString("agent");

String processes = provenanceService.Properties.getString("process");
%>
<script>

	var superclasses = new Object();
	var subclasses = new Object();

	<jsp:include page="js/edges.jsp"	flush="false">
		<jsp:param value="location" name="id"/>
		<jsp:param value="false" name="controls"/>
	</jsp:include>	

	function loadSuperclasses(){
	<jsp:include page="getSuperclasses.jsp"	flush="false">
		<jsp:param value="<%=artifacts%>" name="className"/>
	</jsp:include>	
	<jsp:include page="getSuperclasses.jsp"	flush="false">
		<jsp:param value="<%=agents %>" name="className"/>
	</jsp:include>	
	<jsp:include page="getSuperclasses.jsp"	flush="false">
		<jsp:param value="<%=processes %>" name="className"/>
	</jsp:include>	
	}

	
	
	function enlargeProvenance(){
		var newEl = $("<div>");
		newEl.attr("id","dialogProvenance");
		newEl.appendTo('body');
		//Pull the provenance to the dialog
		var content = $('#provenance<%=escId%>').detach();
		content.appendTo('#dialogProvenance');
		$(".center-container").css("width","100%");
		$(".center-container").css("height","95%");
		$( "#dialogProvenance" ).dialog({
			width: 946,
			height: 600,
			modal: true,
			open: function(event, ui) { 
				provVis<%=escId.replaceAll("-","")%>.jsPlumb.width = $(".center-container").width()-115, 
				provVis<%=escId.replaceAll("-","")%>.jsPlumb.height = $(".center-container").height()-40;
				layout();
			},
			//Push the provenance back to place.
			close: function(event, ui) { 	
				var content = $('#provenance<%=escId%>').detach();
				content.prependTo('#provenanceResource');
				$(".center-container").width($("#provenanceResource").width());
				var height = $("#provenanceResource").height()-34;
				$(".center-container").css("height",height+"px");
				//$(".center-container").css("width","100%");
				//$(".center-container").css("height","100%");
				provVis<%=escId.replaceAll("-","")%>.jsPlumb.width = $(".center-container").width()-25;
				provVis<%=escId.replaceAll("-","")%>.jsPlumb.height = $(".center-container").height()-40;
				content.css("z-index","1");
				$( "#dialogProvenance" ).remove();
				provVis<%=escId.replaceAll("-","")%>.layout.layout();

				//provVis<%=escId.replaceAll("-","")%>.jsPlumb.width = $(".center-container").width()-30, 
				//provVis<%=escId.replaceAll("-","")%>.jsPlumb.height = $(".center-container").height()-30;
			}
		});
	}
	
	$(document).ready(function() {		
		provVis<%=escId.replaceAll("-","")%> = provVis.getProvVis();
		provVis<%=escId.replaceAll("-","")%>.core.graph = [];
		provVis<%=escId.replaceAll("-","")%>.graph.provenanceEditable = <%=editable%>;
		provVis<%=escId.replaceAll("-","")%>.jsPlumb.width = 495, provVis<%=escId.replaceAll("-","")%>.jsPlumb.height = 165, provVis<%=escId.replaceAll("-","")%>.jsPlumb.offsetX=1000, provVis<%=escId.replaceAll("-","")%>.jsPlumb.offsetY=1000;
		provVis<%=escId.replaceAll("-","")%>.jsPlumb.canvas = "infovis<%=escId%>";
		$(".center-container").width($("#provenanceResource").width());
		var height = $("#provenanceResource").height()-34;/*-$("#controls").height()*/
		$(".center-container").height(height);
		//$("#provenance<%=escId%>").css("width","100%");
		//$("#provenance<%=escId%>").css("height","100%");
		
		provVis<%=escId.replaceAll("-","")%>.jsPlumb.width = $(".center-container").width()-25, 
		provVis<%=escId.replaceAll("-","")%>.jsPlumb.height = $(".center-container").height()-40;
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
		provVis<%=escId.replaceAll("-","")%>.core.loadProvenance('<%=resource%>');
		$(".center-container").width($("#provenanceResource").width());
		var height = $("#provenanceResource").height()-34;
		$(".center-container").css("height",height+"px");
		//$("#provenance<%=escId%>").css("width","100%");
		//$("#provenance<%=escId%>").css("height","100%");
		
		provVis<%=escId.replaceAll("-","")%>.jsPlumb.width = $(".center-container").width()-25, 
		provVis<%=escId.replaceAll("-","")%>.jsPlumb.height = $(".center-container").height()-40;
		provVis<%=escId.replaceAll("-","")%>.core.initJsPlumb();
		$("#infovis<%=escId%>").attr("provVisIndex", provVis<%=escId.replaceAll("-","")%>.index);
		});
	</script>
<div  style="float:left; width: 100%; height: 100%;" id="provenance<%=escId%>">
	
	
	<div class="center-container">
		<!-- <div id="timeArrow" style="float: left;top: 165px;position: relative;opacity: 0.6;">
			<div id="arrowText" style="color: black;font-size: large;font-weight: bold;left: 200px;position: relative;top: 17px;width: 50px; z-index: 999;">Time</div>
			<div id="arrowBody" style="background-color: darkgrey;float: left;height: 6px;position: relative;top: 7px;width: 550px;"></div>
			<div id="arrowHead" style="border-bottom: 10px inset white;border-left: 20px inset white;border-top: 10px outset white;float: right;"></div>
		</div> -->
		<div id="infovis<%=escId%>"  class="infovis"></div>
	</div>
	
	<div class="controls" style="background-color: #222222;float: left; width: 100%;">
							<a style="float:left" title="Show provenance in a larger window" href="#" onclick="enlargeProvenance();return false;"><img src="/ourspaces/icons/001_38.png" style="border:0;margin:5px;"></img></a>
							<a style="float:left" title="Layout according to time" href="#" onclick="provVis<%=escId.replaceAll("-","")%>.layout.layout();return false;"><img src="/ourspaces/icons/001_60.png" style="border:0;margin:5px;"></img></a>
							<a style="float:left" title="Dynamic layout" href="#" onclick="provVis<%=escId.replaceAll("-","")%>.layout.layoutSpring();provVis<%=escId.replaceAll("-","")%>.layout.resize();return false;"><img src="/ourspaces/icons/001_61.png" style="border:0;margin:5px;"></img></a>
							<a style="float:left" title="Hide/Show selected nodes" href="#" onclick="provVis<%=escId.replaceAll("-","")%>.graph.switchVisibility();if($(this).children('img').attr('src')=='/ourspaces/icons/001_04.png') {$(this).children('img').attr('src','/ourspaces/icons/001_03.png');return false;} else {$(this).children('img').attr('src','/ourspaces/icons/001_04.png');return false;}"><img src="/ourspaces/icons/001_04.png" style="border:0;margin:5px;"></img></a>
						</div>
</div>
