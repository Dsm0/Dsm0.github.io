var initWebGl = function(){
      console.log("initalizing webgl");
      var canvas = document.getElementById("canvas");
      var gl = canvas.getContext("webgl");

      if(!gl){
          console.log("gl not supported by browser, trying experimental");
          gl = canvas.getContext("experimental-webgl");
      }

      if(!gl){
          console.log("no gl :(");
      }

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    //   gl.viewport(0,0,window.innerWidth,window.innerHeight)

      gl.clearColor(0.75,0.85,0.8,1.0);
    //   gl.clear(gl.COLOR_BUFFER_BUT | gl.DEPTH_BUFFER_BIT);

    //   canvas.style.order = -2;

}

function vertexShader(vertPosition,vertColor){
    return {
        fragColor: vertColor,
        gl_positin: [vertPosition.x,vertPosition.y,0.0,0.0]
    }
}

