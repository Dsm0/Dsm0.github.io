var initWebGl = function(){
      console.log("initalizing webgl");
      var canvas = document.getElementById("canvas1");
      var gl = canvas.getContext("webgl");

      if(!gl){
          console.log("gl not supported by browser, trying experimental");
          gl = canvas.getContext("experimental-webgl");
      }

      if(!gl){
          console.log("no gl :(");
      }
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

    //   gl.clearColor(0.75,0.85,0.8,1.0);
      gl.clearColor(1,1,1,1.0);
    //   gl.clear(gl.COLOR_BUFFER_BUT | gl.DEPTH_BUFFER_BIT);

    var reader = new FileReader();

    reader.addEventListener("loadend", function(e) {
        console.log("files loaded");
    });

    var vertText = document.getElementById("vert1").innerText;
    var fragText = document.getElementById("testFrag").innerText;
    // console.log(fragText);


    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);


    gl.shaderSource(vertShader,vertText);
    gl.shaderSource(fragShader,fragText);

    gl.compileShader(vertShader);
    gl.compileShader(fragShader);

    program = gl.createProgram();
    
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);

    gl.linkProgram(program);	
    gl.useProgram(program);

    positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);


    var u_top = gl.getUniformLocation(program, "u_top");
    gl.uniform1f(u_top,canvas.style.top);

    // var timeLocation = gl.getUniformLocation(program, "u_time"); 
    // gl.uniform1f(timeLocation, seconds_elapsed()/1000.0);


    render(gl);

}


function render(gl) {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, 4 );
}

// function vertexShader(vertPosition,vertColor){
//     return {
//         fragColor: vertColor,
//         gl_positin: [vertPosition.x,vertPosition.y,0.0,0.0]
//     }
// }

