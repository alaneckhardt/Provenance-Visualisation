<%@ page language="java" import="provenanceService.ParameterHelper,provenanceService.*, com.hp.hpl.jena.ontology.*,java.util.Iterator,java.util.*,java.net.*,java.text.SimpleDateFormat,java.util.ArrayList,java.io.*,java.net.*,java.util.Vector" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<% 
ParameterHelper parHelp = new ParameterHelper(request, session);

	String className = (String)parHelp.getParameter("className",  "http://openprovenance.org/ontology#Process");	
%>
function loadSuperclasses<%=Utility.getLocalName(className) %>(){
	<%
	//Get all subclasses
	Vector<String> subClasses = ProvenanceService.getDataProvider().getSubclasses( className);
	//Writing all superclasses of all subclasses of given class (e.g. of JournalPaper, when given Artifact)
	for(int i=0;i<subClasses.size();i++){
		String subClass = subClasses.get(i);

		//Get all superclasses of the subclass (Paper, Artifact, Node,...)
		Vector<String> superClasses = ProvenanceService.getDataProvider().getSuperclasses( subClass);
%>
		superclasses['<%=subClass%>']= [];
		<%
		//Write them out.
	for(int j=0;j<superClasses.size();j++){
					String superClass = superClasses.get(j);
					if(superClass == null || superClass.length() == 0)
						continue;
					%>superclasses['<%=subClass%>'].push('<%=superClass%>');<%
	}
		
		Vector<String> subClassesTemp = ProvenanceService.getDataProvider().getSubclasses( subClass);
		for(int j=0;j<subClassesTemp.size();j++){
			String s = subClassesTemp.get(j);
			if(s.equals(className) || superClasses.contains(s) || subClasses.contains(s))
				continue;
			subClasses.add(s);
		}
	}
%>
}