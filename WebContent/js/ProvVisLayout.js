/**
 * Class for layouting the graph.
 * The Force layout based on D3 framework: http://d3js.org/
 * @param provVis
 * @author Alan Eckhardt
 * @returns
 */
function ProvVisLayout(provVis) {
	this.provVis = provVis;
	//These settings work well
//  this.iterations = 50;
//  this.maxRepulsiveForceDistance = 200;
//  this.r = 4000;
//  this.a = 95;
//  this.c = 0.02;
//  this.w1 = 0.01;
//  this.w2 = 1000000;
//  this.maxVertexMovement = 10;  

//TODO - maybe set these parameters automatically based on the size of the graph.
  this.iterations = 50.0;
  this.maxRepulsiveForceDistance = 200.0;
  this.r = 4000.0;
  this.a = 198.0;
  this.c = 0.02;
  this.w1 = 0.01;
  this.w2 = 1000000.0;
  this.maxVertexMovement = 60.0;  


 // this.provVis.jsPlumb.width = 540, this.provVis.jsPlumb.height = 530, this.provVis.jsPlumb.offsetX=1200, this.provVis.jsPlumb.offsetY=1020;

  
	this.layoutPrepare = function() {
      for (var i in provVis.core.graph) {
          var node = provVis.core.graph[i];
          /*if(node.layoutPosX == null)
          	node.layoutPosX = Math.random()*1.0;
          else{*/
          	node.layoutPosX = $("#"+provVis.core.getLocalName(node.id)).position().left;
         // }
          	
         /* if(node.layoutPosY == null)
          	node.layoutPosY = Math.random()*1.0;
          else{*/
          	node.layoutPosY = $("#"+provVis.core.getLocalName(node.id)).position().top;
         // }
          node.layoutForceX = 0;
          node.layoutForceY = 0;
      }
  };
  
	this.layoutRepulsive = function(node1, node2, weight) {
      if (typeof node1 == 'undefined' || typeof node2 == 'undefined')
          return;
      var dx = node2.layoutPosX - node1.layoutPosX;
      var dy = node2.layoutPosY - node1.layoutPosY;
      var d2 = dx * dx + dy * dy;
      if(d2 < 0.01) {
          dx = 0.1 * Math.random() + 0.1;
          dy = 0.1 * Math.random() + 0.1;
          d2 = dx * dx + dy * dy;
      }
      var d = Math.sqrt(d2);
      if(d < this.maxRepulsiveForceDistance) {
          var repulsiveForce = weight * weight / d;
          node2.layoutForceX += repulsiveForce * dx / d;
          node2.layoutForceY += repulsiveForce * dy / d;
          node1.layoutForceX -= repulsiveForce * dx / d;
          node1.layoutForceY -= repulsiveForce * dy / d;
      }
  };

  this.layoutAttractive = function(node1, node2, weight) {
  	//"from":escfrom, "to":escto, "title":name
  	
      
      var dx = node2.layoutPosX - node1.layoutPosX;
      var dy = node2.layoutPosY - node1.layoutPosY;
      var d2 = dx * dx + dy * dy;
      if(d2 < 0.01) {
          dx = 0.1 * Math.random() + 0.1;
          dy = 0.1 * Math.random() + 0.1;
          d2 = dx * dx + dy * dy;
      }
      var d = Math.sqrt(d2);
      if(d > this.maxRepulsiveForceDistance) {
          d = this.maxRepulsiveForceDistance;
          d2 = d * d;
      }
      var attractiveForce = this.a*(1+Math.sin(Math.PI/2*d/this.maxRepulsiveForceDistance-Math.PI/2));// - this.a * this.a) / this.a;
      if(weight == undefined) weight = 1;
      attractiveForce *= Math.log(weight+1) * 0.5 + 1;
      
      node2.layoutForceX -= attractiveForce * dx / d;
      node2.layoutForceY -= attractiveForce * dy / d;
      node1.layoutForceX += attractiveForce * dx / d;
      node1.layoutForceY += attractiveForce * dy / d;
  };
  
	this.layoutIteration = function(){
      // Forces on nodes due to node-node repulsions
      var prev = new Array();
      for(var c in provVis.core.graph) {
          var node1 = provVis.core.graph[c];
          if(!provVis.core.testVisible(node1))
          	continue;
          for (var d in prev) {
              var node2 = provVis.core.graph[prev[d]];
              if(!provVis.core.testVisible(node2))
              	continue;
              this.layoutRepulsive(node1, node2, this.r);
              this.layoutAttractive(node1, node2, this.w1);
          }
          prev.push(c);
      }
      
      // Forces on nodes due to edge attractions
      for(var c in provVis.core.graph) {
          if(!provVis.core.testVisible(provVis.core.graph[c]))
          	continue;
	        for (var i = 0; i <  provVis.core.graph[c].adjacencies.length; i++) {
	            var edge = provVis.core.graph[c].adjacencies[i];

	            var node1 = provVis.core.graph[$("#"+provVis.core.getLocalName(edge.from)).attr("data-node")];
	            var node2 = provVis.core.graph[$("#"+provVis.core.getLocalName(edge.to)).attr("data-node")];
	            this.layoutAttractive(node1, node2, this.w2);  
              this.layoutRepulsive(node1, node2, this.r/5.0);           
	        }
      }
      
      // Move by the given force
      for (var i in provVis.core.graph) {
          var node = provVis.core.graph[i];
          if(!provVis.core.testVisible(node))
          	continue;
          var xmove = this.c * node.layoutForceX;
          var ymove = this.c * node.layoutForceY;

          var max = this.maxVertexMovement;
          if(xmove > max) xmove = max;
          if(xmove < -max) xmove = -max;
          if(ymove > max) ymove = max;
          if(ymove < -max) ymove = -max;
          
          node.layoutPosX += xmove;
          node.layoutPosY += ymove;
          node.layoutForceX = 0;
          node.layoutForceY = 0;
      }
  };
	this.layoutSpring = function(){
  	this.layoutPrepare();
	    for (var i = 0; i < this.iterations; i++) {
	        this.layoutIteration();
	    }

	};
	

  this.layoutTimestamp = function() {
  	function getTimestamp(node){
  		for (var j=0;j<node.properties.length;j++){
              var prop = node.properties[j];
          	if("http://www.policygrid.org/ourspacesVRE.owl#timestamp"!=prop.name)
          		continue;
              return 1.0*prop.value;
          }
  		return null;
  	}    	
  	function getIndex(nodeId, copy){
          for (var i=0;i<copy.length;i++) {
              var node2 = copy[i];
              if(nodeId == node2.id)
              	return i;
          }
          return -1;
  	}    	
  	function getOtherIndex(edge, copy, nodeId){
          //var index1 = $("#"+provVis.core.getLocalName(edge.from)).attr("data-node");
          //var index2 = $("#"+provVis.core.getLocalName(edge.to)).attr("data-node");
  		if(nodeId == edge.from)
  			return getIndex(edge.to, copy);
  		else
  			return getIndex(edge.from, copy);
  	}
  	Math.seedrandom(seed);
      var i = 0;
      var copy = [];
      for (i in provVis.core.graph) {
          var node = provVis.core.graph[i];
          if(!provVis.core.testVisible(node))
          	continue;
          node.layoutPosX = 0;
         // node.layoutPosY = 0;
          copy.push(node);
      }
      copy.sort(function (a,b) { 
      	var t1,t2;
      	t1 = getTimestamp(a);
      	t2 = getTimestamp(b);        	
      	return t1-t2; }
      ); 
      //Set all y to 0
      for (i=0;i<copy.length;i++) {
          var node = copy[i];
          node.layoutPosY = 0;//Math.random();
      }
      var lastT=-1, lastIndex=-1, counter = 0, maxY = 0, countNulls = 0;
      //Sort according to the timestamp
      for (i=0;i<copy.length;i++) {
          var node = copy[i];
          //Check the edge to previous nodes
          //TODO - finish it
          //Offset the nodes connected to this one
          /*node.adjacencies.sort( this.function (a,b) { 
		            var index1 = getOtherIndex(a, i);
		            var index2 = getOtherIndex(b, i);
		            var node1 = provVis.core.graph[index1];
		            var node2 = provVis.core.graph[index2];
		            var i1 = getIndex(node1, copy);
		            var i2 = getIndex(node2, copy);
	            	return i1-i2; 
          }); 
	        for (var j = 0; j <  node.adjacencies.length; j++) {
	            var edge = node.adjacencies[j];
	            var index = getOtherIndex(edge, i);
	            var node2 = provVis.core.graph[index];
	            //Offset the node a little bit up
	            node2.layoutPosY = node.layoutPosY + j*10;
	        }*/
          var t = getTimestamp(node);
          if(t == null || node.basicType == "Agent"){
          	countNulls++;
          }
          else if(lastT==t){
          	//Artifacts on the top, processes on the bottom
          	if(node.basicType == "Artifact" && copy[i-1].basicType == "Process"){
          		copy[i-1].layoutPosY = 1+counter;
          	}
          	else{
              	node.layoutPosY = 1+counter;            		
          	}
          	if(maxY < 1+counter)
          		maxY = 1+counter;
          	node.layoutPosX = lastIndex;
          	counter++;
          } 
          else{
          	lastIndex++;
          	node.layoutPosX = lastIndex;
          	lastT = t;
          	counter = 0;
          }
      }
      //Position those without timestamp
      // 1) Find the average position of the end of the edges
      for (var i=0;i<copy.length;i++) {
          var node = copy[i];
          var t = getTimestamp(node);
          if(t == null || node.basicType == "Agent"){
          	var avgX = 0, divider = 0;
  	        for (var j = 0; j <  node.adjacencies.length; j++) {
  	            var edge = node.adjacencies[j];
  	            var index = getOtherIndex(edge, copy, node.id);
  	            
  	            if(index == -1 || !provVis.core.testVisible(copy[index]))
  	            	continue;
  	            avgX+=copy[index].layoutPosX;
  	            divider++;
  	        }
  	        avgX /= divider;
          	node.layoutPosX = avgX;
          	node.layoutPosY = maxY+1;
          }
      }

      copy.sort(function(a,b) { 
      	var t1,t2;
      	t1 = a.layoutPosX;
      	t2 = b.layoutPosX;        	
      	return t1>t2; }
      ); 
      
      //2) Split nodes with same x position
      var lastX = 0;
      for (var i=0;i<copy.length;i++) {
          var node = copy[i];
          var t = getTimestamp(node);
          if(t == null || node.basicType == "Agent"){
          	lastX++;
      		node.layoutPosX = lastX*lastIndex/countNulls;     	
          }
      }
      /*
      for (i=0;i<copy.length;i++) {
          var node = copy[i];
          var t = getTimestamp(node);
          if(t == null || node.basicType == "Agent"){
          	node.layoutPosY = maxY*1.5;
          	node.layoutPosX = (lastIndex+2) / 2 - (countNulls-tmp-1);
          	tmp++;
          	
          }
      }*/
      /*for (i in provVis.core.graph) {
          var node = provVis.core.graph[i];
          if(!provVis.core.testVisible(node))
          	continue;
          if(node.layoutPosX == 0)
          	node.layoutPosX=minX;
      }*/
      
     /* var counter = 0;
      for (i in provVis.core.graph) {
          var node = provVis.core.graph[i];
          if(!provVis.core.testVisible(node))
          	continue;
          node.layoutPosX = counter;
          node.layoutPosY = 0;//Math.random();
          counter++;
      }*/
  };
  this.layoutOrder = function() {
      for (i in provVis.core.graph) {
          var node = provVis.core.graph[i];
          if(!provVis.core.testVisible(node))
          	continue;
          node.layoutPosX = 0;
          node.layoutPosY = 0;
      }
      //Sort according to the adjacencies.length
      var i = 0;
      for (i=0;i<provVis.core.graph.length;i++) {
      	var found = false;
          var node1 = provVis.core.graph[i];
          if(!provVis.core.testVisible(node1))
          	continue;
          for (var j in provVis.core.graph) {
              var node2 = provVis.core.graph[j];
              if(!provVis.core.testVisible(node2))
              	continue;
              if(node2.adjacencies.length<node1.adjacencies.length){
              	provVis.core.graph[i] = node2;
              	provVis.core.graph[j] = node1;
              	found = true;
              	break;
              }
          }
          if(found)
          	i--;
      }
      var counter = 0;
      for (i in provVis.core.graph) {
          var node = provVis.core.graph[i];
          if(!provVis.core.testVisible(node))
          	continue;
          node.layoutPosX = counter;
          node.layoutPosY = Math.random();
          counter++;
      }
  };
  
  this.resize = function(){
      var minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;

		$("#"+this.provVis.jsPlumb.canvas).css("left",-this.provVis.jsPlumb.offsetX+"px");
		$("#"+this.provVis.jsPlumb.canvas).css("top",-this.provVis.jsPlumb.offsetY+"px");
		//this.provVis.jsPlumb.height = $("#"+this.provVis.jsPlumb.canvas).height();
		//this.provVis.jsPlumb.width = $("#"+this.provVis.jsPlumb.canvas).width();
		
      for (i in provVis.core.graph) {
          if(!provVis.core.testVisible(provVis.core.graph[i]))
          	continue;
          var x = provVis.core.graph[i].layoutPosX;
          var y = provVis.core.graph[i].layoutPosY;
          
          if(x > maxx) maxx = x;
          if(x < minx) minx = x;
          if(y > maxy) maxy = y;
          if(y < miny) miny = y;
      }
      for(var c in provVis.core.graph) {
          var node = provVis.core.graph[c];
          if(!provVis.core.testVisible(node))
          	continue;
          var d = $("#"+provVis.core.getLocalName(node.id));
          if(maxy==miny)
            d.css("top",(this.provVis.jsPlumb.offsetY+this.provVis.jsPlumb.height*(1)/(2)) + 'px');
          else
          	d.css("top",(this.provVis.jsPlumb.offsetY+this.provVis.jsPlumb.height*(node.layoutPosY-miny)/(maxy-miny)) + 'px');
          if(maxx==minx)
          	d.css("left", (this.provVis.jsPlumb.offsetX+(this.provVis.jsPlumb.width-100)*(1)/(3)) + 'px');
          else
          	d.css("left", (this.provVis.jsPlumb.offsetX+(this.provVis.jsPlumb.width-100)*(node.layoutPosX-minx)/(maxx-minx)) + 'px');		
      }
		this.provVis.jsPlumb.repaintEverything();//Everything
  };
	/**
	 * Layout the graph
	 */
	this.layout = function(){   
		//layoutSpring();
		//layoutOrder();
		this.layoutTimestamp();
		this.resize();
	};
	
	this.provVis = provVis;
	this.f;
	alpha = 0;
	this.multiple = 3;
	
	this.layoutForce = function() {	
		timer_interval = 0;
		this.f = new force();
		this.f.nodes(provVis.core.graph);
		var links = [];
		for ( var x in provVis.core.graph) {
			var o = provVis.core.graph[x];
			//o.call(f.drag);
	        var d = $("#"+provVis.core.getLocalName(o.id));
			o.layoutPosY = d.css("top");
			//Get rid of the "px"
			o.layoutPosY = 1*o.layoutPosY.substring(0,o.layoutPosY.length-2)/this.multiple;
			
			o.layoutPosX = d.css("left");
			//Get rid of the "px"
			o.layoutPosX = 1*o.layoutPosX.substring(0,o.layoutPosX.length-2)/this.multiple;
			links = links.concat(o.adjacencies);
		}
		this.f.links(links);
		this.f.start();
		// layoutOrder();
		// layoutTimestamp();
		//resize();
	}
		
	function functor (v) {
		return typeof v === "function" ? v : function() {
			return v;
		};
	}
	
	// A rudimentary force layout using Gauss-Seidel.
	
	function getIndex(url) {
		for ( var x in provVis.core.graph) {
			if (provVis.core.graph[x].id == url)
				return x;
		}
		return null;
	}
	
	force = function() {
		var force = {}, size = [ 1, 1 ], drag = false, friction = .9, linkDistance = 20, linkStrength = 1, charge = -30, gravity = .1, theta = .8, interval, nodes = [], links = [], distances = [], strengths = [], charges  = [];
	
		function repulse(node) {
			return function(quad, x1, y1, x2, y2) {
				if (quad.point !== node) {
					var dx = quad.cx - node.layoutPosX, dy = quad.cy
							- node.layoutPosY, dn = 1 / Math
							.sqrt(dx * dx + dy * dy);
					/* Barnes-Hut criterion. */
					if ((x2 - x1) * dn < theta) {
						var k = quad.charge * dn * dn;
						node.px -= dx * k;
						node.py -= dy * k;
						return true;
					}
					if (quad.point && isFinite(dn)) {
						var k = quad.pointCharge * dn * dn;
						node.px -= dx * k;
						node.py -= dy * k;
					}
				}
				return !quad.charge;
			};
		}
		function tick() {
			if(alpha<0.05)
				return false;
			var n = nodes.length, m = links.length, q, i, // current index
			o, // current object
			s, // current source
			t, // current target
			l, // current distance
			k, // current force
			x, // x-distance
			y; // y-distance
			// gauss-seidel relaxation for links
			for (i = 0; i < m; ++i) {
				o = links[i];
				s = o.fromNode;
				t = o.toNode;
				x = t.layoutPosX - s.layoutPosX;
				y = t.layoutPosY - s.layoutPosY;
				if (l = (x * x + y * y)) {
					l = alpha * strengths[i] * ((l = Math.sqrt(l)) - distances[i])
							/ l;
					x *= l;
					y *= l;
					t.layoutPosX -= x * (k = s.weight / (t.weight + s.weight));
					t.layoutPosY -= y * k;
					s.layoutPosX += x * (k = 1 - k);
					s.layoutPosY += y * k;
				}
			}
			// apply gravity forces
			if (k = alpha * gravity) {
				x = size[0] / 2;
				y = size[1] / 2;
				i = -1;
				if (k)
					while (++i < n) {
						o = nodes[i];
						o.layoutPosX += (x - o.layoutPosX) * k;
						o.layoutPosY += (y - o.layoutPosY) * k;
					}
			}
			// position verlet integration
			i = -1;
			while (++i < n) {
				o = nodes[i];
				if (o.fixed) {
					o.layoutPosX = o.px;
					o.layoutPosY = o.py;
				} else {
					o.layoutPosX -= (o.px - (o.px = o.layoutPosX)) * friction;
					o.layoutPosY -= (o.py - (o.py = o.layoutPosY)) * friction;
				}
			}
			// simulated annealing, basically
			return (alpha *= .90) < .005;
		}
		force.nodes = function(x) {
			if (!arguments.length)
				return nodes;
			nodes = x;
			return force;
		};
		force.links = function(x) {
			if (!arguments.length)
				return links;
			links = x;
			return force;
		};
		force.size = function(x) {
			if (!arguments.length)
				return size;
			size = x;
			return force;
		};
		force.linkDistance = function(x) {
			if (!arguments.length)
				return linkDistance;
			linkDistance = functor(x);
			return force;
		};
		// For backwards-compatibility.
		force.distance = force.linkDistance;
		force.linkStrength = function(x) {
			if (!arguments.length)
				return linkStrength;
			linkStrength = functor(x);
			return force;
		};
		force.friction = function(x) {
			if (!arguments.length)
				return friction;
			friction = x;
			return force;
		};
		force.charge = function(x) {
			if (!arguments.length)
				return charge;
			charge = typeof x === "function" ? x : +x;
			return force;
		};
		force.gravity = function(x) {
			if (!arguments.length)
				return gravity;
			gravity = x;
			return force;
		};
		force.theta = function(x) {
			if (!arguments.length)
				return theta;
			theta = x;
			return force;
		};
		force.start = function() {
			var i, j, n = nodes.length, m = links.length, w = size[0], h = size[1], neighbors = [], o;
			for (i = 0; i < n; ++i) {
				(o = nodes[i]).index = i;
				o.weight = 0;
			}
			distances = [];
			strengths = [];
			for (i = 0; i < m; ++i) {
				o = links[i];
				o.fromNode = nodes[getIndex(o.from)];
				o.toNode = nodes[getIndex(o.to)];
				distances[i] = linkDistance.call(this, o, i);
				strengths[i] = linkStrength.call(this, o, i);
				++o.fromNode.weight;
				++o.toNode.weight;
			}
			for (i = 0; i < n; ++i) {
				o = nodes[i];
				if (isNaN(o.layoutPosX))
					o.layoutPosX = position("x", w);
				if (isNaN(o.layoutPosY))
					o.layoutPosY = position("y", h);
				if (isNaN(o.px))
					o.px = o.layoutPosX;
				if (isNaN(o.py))
					o.py = o.layoutPosY;
			}
			charges = [];
			if (typeof charge === "function") {
				for (i = 0; i < n; ++i) {
					charges[i] = +charge.call(this, nodes[i], i);
				}
			} else {
				for (i = 0; i < n; ++i) {
					charges[i] = charge;
				}
			}
			// initialize node position based on first neighbor
			function position(dimension, size) {
				var neighbors = neighbor(i), j = -1, m = neighbors.length, x;
				while (++j < m)
					if (!isNaN(x = neighbors[j][dimension]))
						return x;
				return Math.random() * size;
			}
			// initialize neighbors lazily
			function neighbor() {
				if (!neighbors) {
					neighbors = [];
					for (j = 0; j < n; ++j) {
						neighbors[j] = [];
					}
					for (j = 0; j < m; ++j) {
						var o = links[j];
						neighbors[o.fromNode.index].push(o.toNode);
						neighbors[o.toNode.index].push(o.fromNode);
					}
				}
				return neighbors[i];
			}
			return force.resume();
		};
		force.resume = function() {
			alpha = .1;
			for(var i = 0;i<100;i++)
				tick();		
			return force;
		};
	};
}
