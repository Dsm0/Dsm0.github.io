const uniformDict = {
    "u_top": u_topGet,
    "u_left": u_leftGet
}

function genUniforms(shaderObj){
    const uniformList = shaderObj.uniformList;
    uniformList.forEach(function (uniformName, index) {
        // console.log("loading shader numba: ", index);
        if(uniformDict[uniformName] === undefined ){
            console.log("could not load uniform:",uniformName);
        } else {
            uniformDict[uniformName](shaderObj);
        }
  });
}


function u_topGet(shaderObj){
    const uniform = {
      name: "u_top",
      description: "position of canvas relative to top of screen",
      getLocation: function(){return shaderObj.gl.getUniformLocation(shaderObj.program, "u_top")},
      getValue: function(){return parseFloat(shaderObj.canvas.style.top)}, //these two functions are for debugging puroses more than anything
      type: "1f"
    }
    uniform.genValue = function(){shaderObj.gl.uniform1f(uniform.getLocation(),uniform.getValue())};
    shaderObj.uniforms.push(uniform);
}


function u_leftGet(shaderObj){
    const uniform = {
      name: "u_left",
      description: "position of canvas relative to left edge of screen",
      getLocation: function(){return shaderObj.gl.getUniformLocation(shaderObj.program, "u_left")},
      getValue: function(){return parseFloat(shaderObj.canvas.style.left)}, //these two functions are for debugging puroses more than anything
      type: "1f"
    }
    uniform.genValue = function(){shaderObj.gl.uniform1f(uniform.getLocation(),uniform.getValue())};
    shaderObj.uniforms.push(uniform);
}