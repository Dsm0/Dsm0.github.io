// const shaderObjTest = 

function gengl(canvas){
  gl = canvas.getContext("webgl");
  if(!gl){
    console.log("gl not supported by browser, trying experimental");
      gl = canvas.getContext("experimental-webgl");
    }
  if(!gl){
    console.log("no gl :(");
  }
  return gl;
}

function setCanvasProperties(shaderObj,canv){
  var attrs = shaderObj.positionData;
  // console.log(attrs);
  if(attrs  === undefined){
    console.log("error: position data for canvas", canv.id, "undefined ");
  } else {
    for (var attrName in attrs) {
      canv.setAttribute(attrName,attrs[attrName]);
      // console.log(attrName + " : " + attrs[attrName]);
    }
  }
}


function genShaderObjFromId(shaderObj){

  var canvas = document.getElementById(shaderObj.canvasId);
  var gl = gengl(canvas);
  var program = gl.createProgram();

  const fragSource = shaderObj.fragSource;
  const vertSource = shaderObj.vertSource;

  setCanvasProperties(shaderObj,canvas);


  shaderObj.canvas = canvas;
  shaderObj.gl = gl;
  shaderObj.fragSource = fragSource;
  shaderObj.vertSource = vertSource;
  shaderObj.program = program;
  shaderObj.uniforms = [];

  genUniforms(shaderObj);

  return shaderObj;
}

function initWebGl(){
  
  var loadedShaderObjs = shaderObjs.map(genShaderObjFromId)
  

  initShaders(loadedShaderObjs);

  function renderList() {
      loadedShaderObjs.forEach(function (shaderObj, index) {
        render(shaderObj)
      });
      requestAnimationFrame(renderList);
  }

  requestAnimationFrame(renderList);
}

function initShaders(shaderObjs){

  shaderObjs.forEach(function (shaderObj, index) {
    initShader(shaderObj);
    // console.log("loading shader numba: ", index);
  });

}

function render(shaderObj) {

  const gl = shaderObj.gl;
  const canvas = shaderObj.canvas;
  const program = shaderObj.program;

  shaderObj.uniforms.forEach(function (uniform, index) {
    uniform.genValue();
  });

  gl.drawArrays(shaderObj.gl.TRIANGLES, 0, 6);

}

function initShader(shaderObj){

    // console.log("initalizing shader ",shaderObj.title);

    const gl = shaderObj.gl;
    const canvas = shaderObj.canvas;
    const program = shaderObj.program;

    const vertSource = shaderObj.vertSource;
    const fragSource = shaderObj.fragSource

    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER, 
      new Float32Array([
        -1.0, -1.0, 
         1.0, -1.0, 
        -1.0,  1.0, 
        -1.0,  1.0, 
         1.0, -1.0, 
         1.0,  1.0]), 
      gl.STATIC_DRAW
    );

    canvas.width = shaderObj.width;
    canvas.height = shaderObj.height;

    gl.viewport(0,0,window.innerWidth,window.innerHeight)

    gl.clearColor(1,1,1,1.0);

    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertShader,vertSource);
    gl.shaderSource(fragShader,fragSource);

    gl.compileShader(vertShader);
    gl.compileShader(fragShader);

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);

    gl.linkProgram(program);	
    gl.useProgram(program);

    positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    shaderObj.initalized = true;
}
