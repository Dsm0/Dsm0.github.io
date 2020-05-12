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

function genShaderObjFromId(id){

  var canvas = document.getElementById(id);
  var gl = gengl(canvas);
  var program = gl.createProgram();

  var uniforms = [
      {
        name: "u_top",
        description: "position of canvas relative to top of screen",
        getLocation: function(){return gl.getUniformLocation(program, "u_top")},
        getValue: function(){return parseFloat(canvas.style.top)},
        type: "1f"
      }
  ]

  const shaderObjTest = {
    canvas: canvas,
    gl: gl,
    initalized: false,
    uniforms: uniforms,
    fragSource: document.getElementById("testFrag").innerText,
    vertSource: document.getElementById("vert1").innerText,
    program: program
    };
  return shaderObjTest;
}



function initWebGl(){

  shaderObjs = [genShaderObjFromId("canvas1")];

  initShaders(shaderObjs);

  function renderList() {
      shaderObjs.forEach(function (shaderObj, index) {
        render(shaderObj)
      });
      requestAnimationFrame(renderList);
  }

  requestAnimationFrame(renderList);
}

function initShaders(shaderObjs){

  shaderObjs.forEach(function (shaderObj, index) {
    initShader(shaderObj);
    console.log("loading shader numba: ", index);
  });

}

function render(shaderObj) {

  const gl = shaderObj.gl;
  const canvas = shaderObj.canvas;
  const program = shaderObj.program;

  shaderObj.uniforms.forEach(function (uniform, index) {
    if(uniform.type == "1f"){ /////probably not the best way to update different types of uniforms, but it'll do for now
      gl.uniform1f(uniform.getLocation(),uniform.getValue());
    }
  });

  gl.drawArrays(shaderObj.gl.TRIANGLES, 0, 6);

}

function initShader(shaderObj){

    console.log("initalizing webgl1");

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


      canvas.width = 200;
    canvas.height = 200;

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


