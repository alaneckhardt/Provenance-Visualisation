<%@page import="java.net.URLEncoder"%>
<%@page import="javax.swing.event.ListSelectionEvent"%>
<%@ page language="java" import="com.hp.hpl.jena.rdf.model.Model, java.util.Iterator,java.util.*,java.text.SimpleDateFormat,java.util.ArrayList,java.io.*,java.net.*,java.util.Vector,provenanceService.*" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
    <%
ParameterHelper parHelp = new ParameterHelper(request, session);

String resource = (String) parHelp.getParameter("resource","");
String editable = (String) parHelp.getParameter("editable","false");
%>


<link type="text/css" rel="stylesheet" media="all" href="/ourspaces/table.css" />
<link href="/ourspaces/jqueryFileTree.css" rel="stylesheet" type="text/css" media="screen" />
<!-- CSS Files -->
<link type="text/css"	href="/ProvenanceService/css/JsPlumb.css" rel="stylesheet" />
<link type="text/css"	href="/ProvenanceService/css/ForceDirected.css" rel="stylesheet" />
<link rel="stylesheet" type="text/css" href="./css/jquery.treeview.css" />
<!-- <link type="text/css"	href="./css/ui-lightness/jquery-ui-1.8.16.custom.css" rel="stylesheet" />-->
 <script type="text/javascript"	src="/ProvenanceService/js/jquery-1.6.2.min.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/jquery.qtip-1.0.0-rc3.min.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/jquery.jsPlumb-1.3.3-all.js"></script>

<!-- Custom files -->
<script type="text/javascript"	src="/ProvenanceService/js/seedrandom.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/init.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/graphOperations.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/customJsPlumb.js"></script>
<script type="text/javascript"	src="/ProvenanceService/js/customJsPlumbSpring.js"></script>
<script type="text/javascript"  src="/ProvenanceService/js/jquery-ui-1.8.16.custom.min.js"></script>
<script type="text/javascript" src="/ProvenanceService/js/jquery.treeview.js"></script>

<script type="text/javascript"  src="/ProvenanceService/js/provenanceEdit.js"></script>

<script>
artifactId = '<%=resource%>';
$(document).ready(function(){
	jsPlumb.canvas = "infovisEdit";
	initJsPlumb();
	initProvenance();
	provenanceInit = true;
	//Load the provenance of resource from request
	loadProvenance(resource);
	jsPlumb.width = 495, jsPlumb.height = 165, jsPlumb.offsetX=1000, jsPlumb.offsetY=1000;
	jsPlumb.width = $("#center-container").width()-115, 
	jsPlumb.height = $("#center-container").height()-40;
	//$("#filtering").draggable();
});
jsPlumb.canvas = "infovisEdit";
provenanceEditable = true;
var superclasses = new Object();
var subclasses = new Object();
var disabledTypes = [];
var json = [];
var resource = '<%=resource %>';

function loadAllProvenance(){
	var query = serverVisual+"getAllProvenance.jsp";
		$.get(query, function(data) {
			//Trim the data.
			data = data.replace(/^\s+|\s+$/g, '') ;
			var graph =  eval('(' + data + ')');
			for(var x in graph){
				var node = graph[x];
				try{
					var node2 = findNode(node.id);
					//Append the new node to the list of nodes.
					if(node2 == null){
						json.push(node);
						var d = createElement(node);
						if(d!=null)
							shrinkDiv(d, zoomLevel/10, jsPlumb.offsetX+jsPlumb.width/2, jsPlumb.offsetY+jsPlumb.height/2);
					}
				}
				catch(err)
				  {
				  	alert(err);
				  }
			}
			for(x in graph){
				var node = graph[x];
				for(var y in node.adjacencies){
					var adj = node.adjacencies[y];
					addEdge(adj, adj.to);
					addEdge(adj, adj.from);
				}
				
				for(var y in node.adjacencies){
					var adj = node.adjacencies[y];		
					displayRelationship(adj.id,adj.type, adj.from, adj.to);
				}
			}
			shrinkEdges();
			jsPlumb.repaintEverything();

			$('.info').hover(function() {
				 $(this).css('cursor','pointer');
				 }, function() {
				 $(this).css('cursor','auto');
				});
			$('.trigger').hover(function() {
				 $(this).css('cursor','pointer');
				 }, function() {
				 $(this).css('cursor','auto');
				});
			
			//layout();
			initProvDiplay();	
		});
}
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


		
		//Init the graph
		/*$("#center-container").droppable({
			drop: function( event, ui ) {
				var title = ui.draggable.text();
				title = title.replace(/^\s+|\s+$/g, '');
				addExistingResource(ui.draggable.attr('id'), ui.draggable.attr('data-class'), title);
			}
		});*/
			</script>
			<div id="ProcessesDisableList" title="Processes List" style="display:none">
				<jsp:include page="getResourcesTypes.jsp" >
		              	<jsp:param value="http://openprovenance.org/ontology#Process" name="className"/>
		              	<jsp:param value="uncheck(this)" name="onClick"/>
		              	<jsp:param value="navigationType" name="ulId"/>	
		              	<jsp:param value="text-align:left" name="ulStyle"/>
		              	<jsp:param value="true" name="includeFirst"/>
		              	<jsp:param value="general#action" name="ontologies"/>
		     </jsp:include>
		  </div>
			<div id="ArtifactsDisableList" title="Artifacts List" style="display:none">
				<jsp:include page="getResourcesTypes.jsp" >
		              	<jsp:param value="http://openprovenance.org/ontology#Artifact" name="className"/>
		              	<jsp:param value="uncheck(this)" name="onClick"/>
		              	<jsp:param value="navigationType" name="ulId"/>	
		              	<jsp:param value="text-align:left" name="ulStyle"/>
		              	<jsp:param value="true" name="includeFirst"/>
		     </jsp:include>
		  </div>
			<div id="AgentsDisableList" title="Agents List" style="display:none">
				<jsp:include page="getResourcesTypes.jsp" >
		              	<jsp:param value="http://openprovenance.org/ontology#Agent" name="className"/>
		              	<jsp:param value="uncheck(this)" name="onClick"/>
		              	<jsp:param value="navigationType" name="ulId"/>	
		              	<jsp:param value="text-align:left" name="ulStyle"/>
		              	<jsp:param value="true" name="includeFirst"/>
		     </jsp:include>
		  </div>
			<div id="ProcessesList" title="Processes List" style="display:none">
			<ul>
			  <li><a style="float:left;" onclick="addProcess('http://openprovenance.org/ontology#Process');$('#ProcessesList').dialog('close');" href="#">Process</a><br></li></ul>
			  <jsp:include page="getResourcesTypes.jsp" >
		              	<jsp:param value="http://openprovenance.org/ontology#Process" name="className"/>
		              	<jsp:param value="addProcess('http://www.policygrid.org/provenance-generic.owl##className');$('#ProcessesList').dialog('close');" name="onClick"/>
		              	<jsp:param value="navigationType" name="ulId"/>	
		              	<jsp:param value="text-align:left" name="ulStyle"/>
		     </jsp:include>
		     </div>
			<div id="ArtifactsList" title="Artifacts List" style="display:none">
			<ul><li><a style="float:left;" onclick="addArtifact('http://openprovenance.org/ontology#Artifact');$('#ArtifactsList').dialog('close');" href="#">Artifact</a><br></li></ul>
		     <jsp:include page="getResourcesTypes.jsp" >
		              	<jsp:param value="http://openprovenance.org/ontology#Artifact" name="className"/>
		              	<jsp:param value="addArtifact('http://www.policygrid.org/provenance-generic.owl##className');$('#ArtifactsList').dialog('close');" name="onClick"/>
		              	<jsp:param value="navigationType" name="ulId"/>		              	
		     </jsp:include>
		     </div>
			 <div id="AgentsList" title="Agents List" style="display:none">
			 <ul><li><a style="float:left;" onclick="addAgent('http://openprovenance.org/ontology#Agent');$('#AgentsList').dialog('close');" href="#">Agent</a><br></li></ul>
		     <jsp:include page="getResourcesTypes.jsp" >
		              	<jsp:param value="http://openprovenance.org/ontology#Agent" name="className"/>
		              	<jsp:param value="addAgent('http://www.policygrid.org/provenance-generic.owl##className');$('#AgentsList').dialog('close');" name="onClick"/>
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
			<button id="loadAll"	onclick="loadAllProvenance();return false;">Load all provenance</button>
			<button id="startSession"	onclick="startSession(function(data){var data = data.replace(/^\s+|\s+$/g, ''); sessionId = data;provenanceEditable = true;});">Start session</button>
				<br><button id="endSession"	onclick="commit(sessionId, null);provenanceEditable = false;">Commit</button>
				<button id="endSession"	onclick="rollback(sessionId, null);provenanceEditable = false;">Rollback</button>
				<br><br>
			<h4>New Process</h4>
			<label for="-title">Title:</label> 
			<input id="-title" type="text" name="-title" style="width:150px"></input>
			<!-- <button id="addAgent" onclick="$('#AgentsList').dialog({modal: true});">Add agent</button>
				
				<button id="addArtifact" onclick="$('#ArtifactsList').dialog({modal: true});">Add artifact</button> -->
			<button id="addProcesses"	onclick="$('#ProcessesList').dialog({modal: true});">Add
				process</button>
			<br>
			<br>
			<div id="-id-list"></div>
	
				<div	style="position: relative; float: left; margin-bottom: 5px; width: 100%;">
					<form>
						<div>
							Search for existing resources<br> 
							<select name="classSelect" id="classSelect" style="width: 100px; float: left;">
								<option value="http://openprovenance.org/ontology#Artifact">Artifact</option>
								<option value="http://xmlns.com/foaf/0.1/Person">Person</option>
								<option value="http://openprovenance.org/ontology#Process">Process</option>
							</select> 
							<input type="text" name="tag"	style="width: 130px; border: 1px solid #666666; background-color: #e6e5e9;"	id="provenanceInputString" />
	
						</div>
					</form>
				</div>
			<a style="float:left" href="#" onclick="layout();return false;"><img src="/ourspaces/icons/001_39.png"></img></a><br>
			
			<a style="float:left" href="#" onclick="layoutSpring();resize();return false;"><img src="/ourspaces/icons/001_39.png"></img>Spring</a><br>
			
			<a style="float:left" href="#" onclick="hideSelected();return false;">Hide selected</a><br>
			<a style="float:left" href="#" onclick="showAll();return false;">Show all</a>
		</div>
	</div>
	<div id="filtering" style="float:left;width:85%; background-color: white;padding: 4px;border: 1px solid black;/*left: 210px;position: relative;top: 290px;z-index: 999;*/" class="widget color-orange">
		<div class="widget-head">
			<h3 class="style3">Filter by type</h3>
		</div>
		<div class="widget-content text" style="float: left;width: 100%;">
			<div id="edgesDisable"></div>
			<button id="hideProcesses" onclick="$('#ProcessesDisableList').dialog({modal: true});">Hide	processes</button><br>
			<button id="hideProcesses" onclick="$('#ArtifactsDisableList').dialog({modal: true});">Hide	artifacts</button><br>
			<button id="hideProcesses" onclick="$('#AgentsDisableList').dialog({modal: true});">Hide agents</button><br>
		</div>
	</div>	
	</div>
	
	<div id="center-wrapper" style="height:620px;float:left">
	<div id="center-container">
		<div id="infovisEdit" class="infovis"></div>
	
	</div>

			
	</div>
</div><br><!--</body></html>-->
