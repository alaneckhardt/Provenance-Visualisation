<%@ page language="java" import="provenanceService.*,com.hp.hpl.jena.ontology.*,java.util.Iterator,java.util.*,java.net.*,java.text.SimpleDateFormat,java.util.ArrayList,java.io.*,java.net.*,java.util.Vector" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<% 
ParameterHelper parHelp = new ParameterHelper(request, session);

	String includeFirst = (String)parHelp.getParameter("includeFirst",  "");
	String liClass = (String)parHelp.getParameter("liClass",  "");
	String liStyle = (String)parHelp.getParameter("liStyle",  "");
	String ulClass = (String)parHelp.getParameter("ulClass",  "");
	String ulStyle = (String)parHelp.getParameter("ulStyle",  "");
	String ulId = (String)parHelp.getParameter("ulId",  "");
	String onClick = (String)parHelp.getParameter("onClick",  "");
	String innerUlStyle = (String)parHelp.getParameter("innerUlStyle",  "padding-left:15px");
	String ontologies = (String)parHelp.getParameter("ontologies",  "general");
	String[] labels = ontologies.split("#");
	String className = (String)parHelp.getParameter("className",  "http://openprovenance.org/ontology#Process");
	
	Vector<String> subClasses = new Vector<String>();

	ProvenanceServiceImpl impl = ProvenanceService.getSingleton();
	if("true".equals(includeFirst)){
		subClasses.add(className);
	}
	else{
		subClasses.addAll(impl.getDataProvider().getSubclasses(className,true));	
	}
	
%>
<%!	//Function for recursive loading the ontology tree.
    // There is a lot of parameters, but unfortunatelly, the method doesn't see the jsp variables.
 public String loadTree(String content, String className, 
		 String liClass, String liStyle, String onClick, String ulClass, String ulStyle, String innerUlStyle, String[] labels){

	ProvenanceServiceImpl impl = ProvenanceService.getSingleton();
	Vector<String> subClasses = new Vector<String>();
	for(int i=0;i<labels.length;i++){
		subClasses.addAll(impl.getDataProvider().getSubclasses( className,true));
	}
	String classNameFull = className;
	className=className.substring(className.indexOf('#')+1);
	//Name of class
	/*if(subClasses.size() == 0){
		content += "<li style=\""+liStyle+"\" class=\""+liClass+"\" rel=\"resource\"><span style=\"float:left; margin-right:5px;\" class=\"ui-icon ui-icon-info\"></span><a href=\"#\" style=\"float:left;\" >" + className+"</a>";
	}
	else{ // start a new ul at the end of string.
		content += "<li style=\""+liStyle+"\" class=\""+liClass+" expandable\" rel=\"resource\"><span style=\"float:left; margin-right:5px;\" class=\"ui-icon ui-icon-info\"></span><a href=\"#\" style=\"float:left;\" >" + className + "</a><ul  style=\""+ulStyle+"\" class=\""+ulClass+"\">";		
	}*/
	content += "<li style=\""+liStyle+"\" class=\""+liClass+"\" data-class=\""+ classNameFull+"\" rel=\"resource\"><a href=\"#\" onClick=\""+onClick.replaceAll("#className", className)+"\" >" + className+"</a><br/>";
	
	if(subClasses.size() > 0){
		content += "<ul style=\""+innerUlStyle+"\">";
		//Adding all children
		for(String subClass : subClasses){
			content += loadTree("", subClass, liClass, liStyle, onClick, ulClass, ulStyle, innerUlStyle, labels);
		}
		// closing ul and li
		content += "</ul>";
	}
	content += "</li>";
	
	return content;
}
%>
		<ul id="<%=ulId%>" style="<%=ulStyle%>">
		<% 
				for(String subClass : subClasses){
					String content = loadTree("", subClass,  liClass, liStyle, onClick, ulClass, ulStyle, innerUlStyle,labels);%>
					<%=content %>
			<%} %>
		</ul>	