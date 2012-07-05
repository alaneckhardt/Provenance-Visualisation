<%@ page language="java" import="provenanceService.*, com.hp.hpl.jena.rdf.model.*, com.hp.hpl.jena.ontology.*,java.util.Iterator,java.util.*,java.net.*,java.text.SimpleDateFormat,java.util.ArrayList,java.io.*,java.net.*,java.util.Vector" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
	

	function loadProperties(){
		var edge;
		//Reset the restrictions for empty array.
		edges = [];
    edge = new Edge(); edge.idEdge = 'http://openprovenance.org/ontology#WasControlledBy'; 
    edge.edge = 'WasControlledBy'; edge.fromAllValuesFrom = 'http://openprovenance.org/ontology#Agent'; 
    edge.toAllValuesFrom = 'http://openprovenance.org/ontology#Process'; 
    edges[0] = edge; edge = new Edge(); edge.idEdge = 'http://openprovenance.org/ontology#WasTriggeredBy'; edge.edge = 'WasTriggeredBy'; edge.fromAllValuesFrom = 'http://openprovenance.org/ontology#Process'; edge.toAllValuesFrom = 'http://openprovenance.org/ontology#Process'; edges[1] = edge; edge = new Edge(); edge.idEdge = 'http://openprovenance.org/ontology#Used'; edge.edge = 'Used'; edge.fromAllValuesFrom = 'http://openprovenance.org/ontology#Artifact'; edge.toAllValuesFrom = 'http://openprovenance.org/ontology#Process'; edges[2] = edge; edge = new Edge(); edge.idEdge = 'http://openprovenance.org/ontology#WasGeneratedBy'; edge.edge = 'WasGeneratedBy'; edge.fromAllValuesFrom = 'http://openprovenance.org/ontology#Process'; edge.toAllValuesFrom = 'http://openprovenance.org/ontology#Artifact'; edges[3] = edge; edge = new Edge(); edge.idEdge = 'http://openprovenance.org/ontology#WasDerivedFrom'; edge.edge = 'WasDerivedFrom'; 
    edge.fromAllValuesFrom = 'http://openprovenance.org/ontology#Artifact'; edge.toAllValuesFrom = 'http://openprovenance.org/ontology#Artifact'; edges[4] = edge; 
		<% 
		//TODO - load edges from database 
		// TODO - fix the ontology so that it contains the OPM directly 
			int count = 0;	
			Vector<String> subclasses = ProvenanceService.getDataProvider().getSubclasses("http://openprovenance.org/ontology#Edge");
			for(int i = 0;i<subclasses.size();i++){
				String c = subclasses.get(i);
				//Adding subclasses of this edge.
				subclasses.addAll(ProvenanceService.getDataProvider().getSubclasses( c));
				Iterator<Restriction> it = ProvenanceService.getDataProvider().getRestrictionsOnClass(c);
				
				String fromAllValuesFrom = "";
				String toAllValuesFrom = "";
				while (it.hasNext()) {
					Restriction rest = it.next();			
					if(rest.isAllValuesFromRestriction()){
						Resource r = rest.asAllValuesFromRestriction().getAllValuesFrom();
						Property p = rest.getOnProperty();
						if(p.getLocalName().equals("cause"))
							fromAllValuesFrom = r.getURI();
						else if(p.getLocalName().equals("effect"))
							toAllValuesFrom = r.getURI();
					}//End if
					
				}//End while
				%>
					edge = new Edge();	
					edge.idEdge = '<%=c %>';
				    edge.edge = '<%=c.substring(c.indexOf('#')+1) %>';
				    edge.fromAllValuesFrom = '<%=fromAllValuesFrom %>';
				    edge.toAllValuesFrom = '<%=toAllValuesFrom %>';			    
					edges[<%=count%>] = edge;
									
				<%
				
				count++; }//End for	
	%>
	}