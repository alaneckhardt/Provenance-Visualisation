<%@ page language="java" import="provenanceService.*,com.hp.hpl.jena.rdf.model.*, com.hp.hpl.jena.ontology.*,java.util.Iterator,java.util.*,java.net.*,java.text.SimpleDateFormat,java.util.ArrayList,java.io.*,java.net.*,java.util.Vector" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<% 

ParameterHelper parHelp = new ParameterHelper(request, session);


	String sessionId = (String)parHelp.getParameter("sessionId",  "");	
	String entityId = (String)parHelp.getParameter("entity",  "");	
	Graph g = ProvenanceService.getSingleton().getProvenance(entityId, sessionId);	
	/*for(int i=0;i<g.size();i++){
		Node n = g.get(i);
		if(!"Agent".equals(n.getBasicType()))
			n.setTitle(rdf.getResourceTitle(n.getId()));
		if(n.getId().startsWith("http://www.policygrid.org/ourspacesVRE.owl#")){
			n.addProperty("class","system");
		}
		for(Edge e : n.getAdjacencies()){
			if(e.getId().startsWith("http://www.policygrid.org/ourspacesVRE.owl#")){
				e.addProperty("class","system");
			}
		}
		
	}*/
	String json = ProvenanceService.graphToJSONString(g);
%>
<%=json %>