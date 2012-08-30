<%@page import="java.net.URLEncoder"%>
<%@page import="javax.swing.event.ListSelectionEvent"%>
<%@ page language="java" import="com.hp.hpl.jena.rdf.model.Model, java.util.Iterator,java.util.*,java.text.SimpleDateFormat,java.util.ArrayList,java.io.*,java.net.*,java.util.Vector,provenanceService.*" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%
ParameterHelper parHelp = new ParameterHelper(request, session);

String resource = (String) parHelp.getParameter("resource","");
String editable = (String) parHelp.getParameter("editable","false");


String artifacts = provenanceService.Properties.getString("artifact");
String agents = provenanceService.Properties.getString("agent");
String processes = provenanceService.Properties.getString("process");
String edges = provenanceService.Properties.getString("edge");
%>
<!--  * @author Alan Eckhardt a.e@centrum.cz -->
<link type="text/css" rel="stylesheet" media="all" href="/ourspaces/table.css" />
<link href="/ourspaces/jqueryFileTree.css" rel="stylesheet" type="text/css" media="screen" />
<!-- CSS Files -->
<link type="text/css"	href="/ProvenanceService/css/JsPlumb.css" rel="stylesheet" />
<link type="text/css"	href="/ProvenanceService/css/ForceDirected.css" rel="stylesheet" />
<link rel="stylesheet" type="text/css" href="./css/jquery.treeview.css" />
 <link type="text/css"	href="./css/ui-lightness/jquery-ui-1.8.16.custom.css" rel="stylesheet" />

 <script type="text/javascript"	src="/ProvenanceService/js/jquery-1.6.2.min.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/jquery.qtip-1.0.0-rc3.min.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/jquery.jsPlumb-1.3.3-all.js"></script>

<!-- Custom files -->
<!--
<script type="text/javascript"	src="/ProvenanceService/js/seedrandom.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/init.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/graphOperations.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/customJsPlumb.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/customJsPlumbSpring.js"></script>

<script type="text/javascript"	src="/ProvenanceService/js/init.js"></script>-->
<script type="text/javascript"	src="/ProvenanceService/js/seedrandom.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/ProvVisGraph.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/ProvVisComm.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/ProvVisLayout.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/ProvVisCore.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/ProvVisEdit.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/ProvVis.js"></script>

<script type="text/javascript"  src="/ProvenanceService/js/jquery-ui-1.8.16.custom.min.js"></script>
<script type="text/javascript" src="/ProvenanceService/js/jquery.treeview.js"></script>

<script>
artifactId = '<%=resource%>';
$(document).ready(function(){
	provVis.jsPlumb.canvas = "infovisEdit";
	provVis.core.initJsPlumb();
	provVis.edit.initProvenance();
	provenanceInit = true;
	//Load the provenance of resource from request
	provVis.core.loadProvenance(resource);
	provVis.jsPlumb.width = 495, provVis.jsPlumb.height = 165, provVis.jsPlumb.offsetX=1000, provVis.jsPlumb.offsetY=1000;
	
	provVis.jsPlumb.width = $(".center-container").width()-115, 
	provVis.jsPlumb.height = $(".center-container").height()-40;
	//$("#filtering").draggable();
	//Hiding info button - no use going from editing to detail, losing work done.
	$(".shape .info").hide();
});
provVis.jsPlumb.canvas = "infovisEdit";
provVis.graph.provenanceEditable = false;
var superclasses = new Object();
var subclasses = new Object();
provVis.core.graph = [];
var resource = '<%=resource %>';


<jsp:include page="js/edges.jsp">
	<jsp:param value="location" name="id"/>
	<jsp:param value="false" name="controls"/>
</jsp:include>	

function loadSuperclasses(){
<jsp:include page="getSuperclasses.jsp">
	<jsp:param value="<%=artifacts%>" name="className"/>
</jsp:include>	
<jsp:include page="getSuperclasses.jsp">
	<jsp:param value="<%=agents %>" name="className"/>
</jsp:include>	
<jsp:include page="getSuperclasses.jsp">
	<jsp:param value="<%=processes %>" name="className"/>
</jsp:include>	
}
</script>
			<div id="ProcessesDisableList" title="Processes List" style="display:none">
				<jsp:include page="getResourcesTypes.jsp" >
		              	<jsp:param value="<%=processes %>" name="className"/>
		              	<jsp:param value="provVis.edit.uncheck(this)" name="onClick"/>
		              	<jsp:param value="navigationType" name="ulId"/>	
		              	<jsp:param value="text-align:left" name="ulStyle"/>
		              	<jsp:param value="true" name="includeFirst"/>
		              	<jsp:param value="general#action" name="ontologies"/>
		     </jsp:include>
		  </div>
			<div id="ArtifactsDisableList" title="Artifacts List" style="display:none">
				<jsp:include page="getResourcesTypes.jsp" >
		              	<jsp:param value="<%=artifacts%>" name="className"/>
		              	<jsp:param value="provVis.edit.uncheck(this)" name="onClick"/>
		              	<jsp:param value="navigationType" name="ulId"/>	
		              	<jsp:param value="text-align:left" name="ulStyle"/>
		              	<jsp:param value="true" name="includeFirst"/>
		     </jsp:include>
		  </div>
			<div id="AgentsDisableList" title="Agents List" style="display:none">
				<jsp:include page="getResourcesTypes.jsp" >
		              	<jsp:param value="<%=agents %>" name="className"/>
		              	<jsp:param value="provVis.edit.uncheck(this)" name="onClick"/>
		              	<jsp:param value="navigationType" name="ulId"/>	
		              	<jsp:param value="text-align:left" name="ulStyle"/>
		              	<jsp:param value="true" name="includeFirst"/>
		     </jsp:include>
		  </div>
			<div id="ProcessesList" title="Processes List" style="display:none">
			<ul>
			  <li><a style="float:left;" onclick="provVis.comm.addProcess('<%=processes %>');$('#ProcessesList').dialog('close');" href="#">Process</a><br></li></ul>
			  <jsp:include page="getResourcesTypes.jsp" >
		              	<jsp:param value="<%=processes %>" name="className"/>
		              	<jsp:param value="provVis.comm.addProcess('http://www.policygrid.org/provenance-generic.owl##className');$('#ProcessesList').dialog('close');" name="onClick"/>
		              	<jsp:param value="navigationType" name="ulId"/>	
		              	<jsp:param value="text-align:left" name="ulStyle"/>
		     </jsp:include>
		     </div>
			<div id="ArtifactsList" title="Artifacts List" style="display:none">
			<ul><li><a style="float:left;" onclick="provVis.comm.addArtifact('<%=artifacts%>');$('#ArtifactsList').dialog('close');" href="#">Artifact</a><br></li></ul>
		     <jsp:include page="getResourcesTypes.jsp" >
		              	<jsp:param value="<%=artifacts%>" name="className"/>
		              	<jsp:param value="provVis.comm.addArtifact('http://www.policygrid.org/provenance-generic.owl##className');$('#ArtifactsList').dialog('close');" name="onClick"/>
		              	<jsp:param value="navigationType" name="ulId"/>		              	
		     </jsp:include>
		     </div>
			 <div id="AgentsList" title="Agents List" style="display:none">
			 <ul><li><a style="float:left;" onclick="provVis.comm.addAgent('<%=agents %>');$('#AgentsList').dialog('close');" href="#">Agent</a><br></li></ul>
		     <jsp:include page="getResourcesTypes.jsp" >
		              	<jsp:param value="<%=agents %>" name="className"/>
		              	<jsp:param value="provVis.comm.addAgent('http://www.policygrid.org/provenance-generic.owl##className');$('#AgentsList').dialog('close');" name="onClick"/>
		              	<jsp:param value="navigationType" name="ulId"/>		              	
		     </jsp:include>
		     </div>
<div id="columns" style="float:left; overflow:visible">

<div id="left-container">
	<div  style="float:left;background-color: white;padding: 4px;border: 1px solid black;" class="widget color-orange">
		<div class="widget-head">
			<h3 class="style3">Controls</h3>
		</div>
		<div class="widget-content text" style="float: left; width: 100%;">
			<button id="startSession" style="font-weight:bold"	onclick="provVis.comm.startSession(provVis.edit.enableEditing);">Start session</button>
				<br><button disabled="disabled" id="endSessionCommit"	onclick="provVis.comm.commit(provVis.comm.sessionId, function(data){var data = data.replace(/^\s+|\s+$/g, ''); if(data != 'ok') alert(data); else alert('Commit successful.');});provVis.graph.provenanceEditable = false;provVis.graph.checkEditing();">Commit</button>
				<button disabled="disabled" id="endSessionRollback"	onclick="provVis.comm.rollback(provVis.comm.sessionId, function(data){var data = data.replace(/^\s+|\s+$/g, '');if(data != 'ok') alert(data); else alert('Rollback successful.');});provVis.graph.provenanceEditable = false;provVis.graph.checkEditing();window.location.reload();">Rollback</button>
				<br><br>
			<h4>New Process</h4>
			<label for="-title">Title:</label> 
			<input id="-title" disabled="disabled" type="text" name="-title" style="width:150px"></input>
			<!-- <button id="addAgent" onclick="$('#AgentsList').dialog({modal: true});">Add agent</button>
				
				<button id="addArtifact" onclick="$('#ArtifactsList').dialog({modal: true});">Add artifact</button> -->
			<button id="addProcesses"	onclick="$('#ProcessesList').dialog({modal: true});" disabled="disabled">Add
				process</button>
			<br>
			<br>
			<div id="-id-list"></div>
	
				<div	style="position: relative; float: left; margin-bottom: 5px; width: 100%;">
					<form>
						<div>
							Search for existing resources<br> 
							<select name="classSelect" id="classSelect" style="width: 100px; float: left;">
								<option value="<%=artifacts%>">Artifact</option>
								<option value="<%=agents %>">Person</option>
								<option value="<%=processes %>">Process</option>
							</select> 
							<input type="text" class="resourceInput" name="tag"	style="width: 130px; border: 1px solid #666666; background-color: #e6e5e9;"	id="provenanceInputString" />
	
						</div>
					</form>
				</div>
			<a style="float:left" title="Layout according to time" href="#" onclick="provVis.layout.layout();return false;"><img src="/ourspaces/icons/001_60.png" style="border:0;margin:5px;"></img></a>
			<a style="float:left" title="Dynamic layout" href="#" onclick="provVis.layout.layoutSpring();provVis.layout.resize();return false;"><img src="/ourspaces/icons/001_61.png" style="border:0;margin:5px;"></img></a>
			<a style="float:left" title="Hide/Show selected nodes" href="#" onclick="provVis.graph.switchVisibility();if($(this).children('img').attr('src')=='/ourspaces/icons/001_04.png') {$(this).children('img').attr('src','/ourspaces/icons/001_03.png');return false;} else {$(this).children('img').attr('src','/ourspaces/icons/001_04.png');return false;}"><img src="/ourspaces/icons/001_04.png" style="border:0;margin:5px;"></img></a>
						
		</div>
	</div>
	<div id="filtering" style="float:left;background-color: white;padding: 4px;border: 1px solid black;/*left: 210px;position: relative;top: 290px;z-index: 999;*/" class="widget color-orange">
		<div class="widget-head">
			<h3 class="style3">Filter by type</h3>
		</div>
		<div class="widget-content text" style="float: left;width: 100%;">					
		  <div class="hideList" id="EdgesDisableList" title="Edges List" style="display:block;overflow-x: scroll;padding-left:0px;">
				<jsp:include page="getResourcesTypes.jsp" >
		              	<jsp:param value="<%=edges %>" name="className"/>
		              	<jsp:param value="provVis.edit.uncheck(this)" name="onClick"/>
		              	<jsp:param value="navigationType" name="ulId"/>	
		              	<jsp:param value="text-align:left;padding-left:0px;" name="ulStyle"/>
		              	<jsp:param value="true" name="includeFirst"/>
		     </jsp:include>
		  </div>
		
			<div id="edgesDisable"></div>
			<button id="hideProcesses" onclick="$('#ProcessesDisableList').dialog({modal: true});">Hide	processes</button><br>
			<button id="hideProcesses" onclick="$('#ArtifactsDisableList').dialog({modal: true});">Hide	artifacts</button><br>
			<button id="hideProcesses" onclick="$('#AgentsDisableList').dialog({modal: true});">Hide agents</button><br>
		</div>
	</div>	
	</div>
	
	<div id="center-wrapper" style="height:620px;font-size:12px;float:left">
	<div class="center-container">
		<div id="infovisEdit" class="infovis"></div>
	
	</div>

			
	</div>
</div><br><!--</body></html>-->
