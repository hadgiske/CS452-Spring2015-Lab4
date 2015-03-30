// Katie Hadgis - 3/29/15 - HW #4 - A water texture added to the model in HW #3
var canvas;
var gl;

var NumVertices  = 72;

var points = [];
var colors = [];
var normalsArray = [];


var lightPosition = vec4(0.0, 0.0, 1.0, 0.0 );

var lightAmbient = vec4(0.0, 0.2, 0.7, 1.0 );
var lightDiffuse = vec4( 0.0, 0.7, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialAmbient = vec4( 0.5, 0.7, 0.5, 1.0 );
var materialDiffuse = vec4( 0, 1.0, 0.3, 1.0);
var materialSpecular = vec4( 1.0, 1.0, 0.0, 1.0 );

var materialShininess = 50.0;

//current transformation matrix (4x4 homogeneous) 
var ctm;

//phong components
var ambientColor, diffuseColor, specularColor;

//position camera via lookAt (MV.js), translate, rotation
var modelView;

//defines view volume, selects camera lens
var projection;

var viewerPos;

var program;

//indicates which axis to rotate about on keypress
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

//init current axis to Y
var axis = 1;

// init obj rotation
var theta = [ 15, 0, 0 ];

// current frame's theta location in html file
var thetaLoc;

var flag = true;

function configureTexture( image ) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, 
         gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);
	
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
    colorCube();

	var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

	var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW )
	
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );	
//END OF BUFFERS

	 var image = document.getElementById("texImage");
 
    configureTexture( image );
	
    thetaLoc = gl.getUniformLocation(program, "theta"); 
    
	viewerPos = vec3(0.0, 0.0, 0.0);

// size of projection (xMin, xMax, yMin, yMax, zMin, zMax)
    projection = ortho(-1, 1, -1, 1, -100, 100);

//USING MV.JS    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
	
    //event listeners for buttons
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};
	document.onkeydown = function(e) {
		switch (e.keyCode) {
			case 37:
				//left - CCW y
				axis = yAxis;
				m = -1;
				break;
			case 38:
				//up - CCW x
				axis = xAxis;
				m = -1;
				break;
			case 39:
				//right - CW y
				axis = yAxis;
				m = 1;
				break;
			case 40:
				//down - CW x
				axis = xAxis;
				m = 1;
				break;
		}
	};

//USING MV.JS
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
       flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
       flatten(lightPosition) );
       
    gl.uniform1f(gl.getUniformLocation(program, "shininess"),materialShininess);
    
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),false, flatten(projection));    
    
    render();
}
function colorCube()
{
	// initialize points and their normals
	// quad initializes one primitive at a time
	//a,b,c; c,b,d;
    quad( 1,2,8,5 );
	quad( 6,5,8,2 );
	quad( 4,7,9,0 );
	quad( 3,0,9,7 );
	quad( 6,2,10,7 );
	quad( 10,2,3,7 );
	quad( 5,4,11,1 );
	quad( 0,1,11,4 );
	quad( 2,1,12,3 );
	quad( 0,3,12,1 );
	quad( 6,5,13,7 );
	quad( 4,7,13,5 );
}
function quad(a, b, c, d) //BAD - creates non-flat primitives
{
	//initialize each primitive
    var vertices = [
        [-0.2, 	-0.2,  	0.2, 	1.0 ], //0
        [-0.2,  0.2,  	0.2, 	1.0 ], //1
        [0.2,  	0.2,  	0.2, 	1.0 ], //2
        [0.2, 	-0.2,  	0.2, 	1.0 ], //3
        [-0.2, 	-0.2, 	-0.2, 	1.0 ], //4 
        [-0.2,  0.2, 	-0.2, 	1.0 ], //5 
        [0.2,	0.2, 	-0.2, 	1.0 ], //6 
        [0.2,	-0.2, 	-0.2, 	1.0 ], //7
		[0, 	1.0, 	0, 		1.0 ], //8 
		[0, 	-1.0, 	0, 		1.0 ], //9
		[1.0, 	0, 		0, 		1.0 ], //10
		[-1.0, 0, 		0, 		1.0 ], //11
		[0,		0,		1.0,	1.0 ], //12
		[0,		0,		-1.0,	1.0 ]  //13
    ];

	//calculate normal
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);
	
	//declare points and normals to be used in transformations
     points.push(vertices[a]); 
     normalsArray.push(normal); 
     points.push(vertices[b]); 
     normalsArray.push(normal); 
     points.push(vertices[c]); 
     normalsArray.push(normal);   
     points.push(vertices[a]);  
     normalsArray.push(normal); 
     points.push(vertices[c]); 
     normalsArray.push(normal); 
     points.push(vertices[d]); 
     normalsArray.push(normal);    
}
function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// increase theta of axis; then apply it to the shape
	if(flag) theta[axis] += 1.0;
    gl.uniform3fv(thetaLoc, theta);
    
	// 4x4 matrix (x,y,z,w)
	modelView = mat4();
	//rotate whichever axis is selected
    modelView = mult(modelView, rotate(theta[xAxis], [1, 0, 0] ));
    modelView = mult(modelView, rotate(theta[yAxis], [0, 1, 0] ));
    modelView = mult(modelView, rotate(theta[zAxis], [0, 0, 1] ));
    
	//flatten after transform
    gl.uniformMatrix4fv( gl.getUniformLocation(program,
            "modelViewMatrix"), false, flatten(modelView) );
	

    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    requestAnimFrame( render );
}
