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

      canvas.width = 200;
      canvas.height = 200;
    //   gl.viewport(0,0,window.innerWidth,window.innerHeight)

    //   gl.clearColor(0.75,0.85,0.8,1.0);
    //   gl.clearColor(1,1,1,1.0);
    //   gl.clear(gl.COLOR_BUFFER_BUT | gl.DEPTH_BUFFER_BIT);

    var reader = new FileReader();

    reader.addEventListener("loadend", function(e) {
        console.log("files loaded");
    });

    // var vertText = document.getElementById("testVert").src;
    // var fragText = document.getElementById("testFrag").src;


    // var vertShader = gl.createShader(gl.VERTEX_SHADER);
    // var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

    // gl.shaderSource(vertShader,vertText);
    // gl.shaderSource(fragShader,fragText);

    // gl.compileShader(vertShader);
    // gl.compileShader(fragShader);

}

// function vertexShader(vertPosition,vertColor){
//     return {
//         fragColor: vertColor,
//         gl_positin: [vertPosition.x,vertPosition.y,0.0,0.0]
//     }
// }

