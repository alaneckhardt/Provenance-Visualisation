<%@ page language="java" import="provenanceService.*,com.hp.hpl.jena.rdf.model.*, com.hp.hpl.jena.ontology.*,java.util.Iterator,java.util.*,java.net.*,java.text.SimpleDateFormat,java.util.ArrayList,java.io.*,java.net.*,java.util.Vector" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<% 
	Graph g = RDFProvider.getAllProvenance();
	Graph g2 = new Graph();
	for(int i=0;i<g.size();i++){
		Node n = g.get(i);
		if(n.getTitle() == null)
			n.setTitle(Utility.getLocalName(n.getId()));
	}
	// Limit the graph to 100 nodes
	/*for(;100<g.size();){
		g.getNodes().remove(g.size()-1);
	}*/
	
	
	for(int i=0;i<g.size() && g2.size() < 10;i++){
		Node n = g.get(i);
		g2.addNode(n);
		for(int j=0;j<n.getAdjacencies().size();j++){
			Edge e = n.getAdjacencies().get(j);
			g2.addEdge(e);
		}
	}
	for(int i=0;i< g2.size() ;i++){
		Node n = g2.get(i);
		for(int j=0;j<n.getAdjacencies().size();j++){
			Edge e = n.getAdjacencies().get(j);
			if(g2.getNode(e.getFrom().getId()) == null || g2.getNode(e.getTo().getId()) == null){
				n.getAdjacencies().remove(j);
				j--;
			}
		}
	}
	String json = ProvenanceService.graphToJSONString(g2);
%>
<%=json %>