var d = new Date();
var initalTime = d.getTime() / 1000;
var uniformDict = {
    //"u_top": u_topGet,
    //"u_left": u_leftGet,
    u_pos: u_pagePositionGet,
    u_window_resolution: u_window_resolutionGet,
    u_canvas_resolution: u_canvas_resolutionGet,
    u_time: u_timeGet,
};
function genUniforms(shaderObj) {
    var uniformList = shaderObj.uniformList;
    uniformList.forEach(function (uniformName, index) {
        if (uniformDict[uniformName] === undefined) {
            console.log("could not load uniform:", uniformName);
        }
        else {
            uniformDict[uniformName](shaderObj);
        }
    });
}
//function u_topGet(shaderObj){
//const uniform = {
//name: "u_top",
//description: "position of canvas relative to top of screen",
//getLocation: function(){return shaderObj.gl.getUniformLocation(shaderObj.program, "u_top")},
//getValue: function(){return parseFloat(shaderObj.canvas.style.top)}, //these two functions are for debugging puroses more than anything
//type: "1f"
//}
//uniform.genValue = function(){shaderObj.gl.uniform1f(uniform.getLocation(),uniform.getValue())};
//shaderObj.uniforms.push(uniform);
//}
//function u_leftGet(shaderObj){
//const uniform = {
//name: "u_left",
//description: "position of canvas relative to left edge of screen",
//getLocation: function(){return shaderObj.gl.getUniformLocation(shaderObj.program, "u_left")},
//getValue: function(){return parseFloat(shaderObj.canvas.style.left)}, //these two functions are for debugging puroses more than anything
//type: "1f"
//}
//uniform.genValue = function(){shaderObj.gl.uniform1f(uniform.getLocation(),uniform.getValue())};
//shaderObj.uniforms.push(uniform);
//}
function u_pagePositionGet(shaderObj) {
    var uniform = {
        name: "u_pos",
        description: "position of canvas relative to inner screen width and height",
        getLocation: function () {
            return shaderObj.gl.getUniformLocation(shaderObj.program, "u_pos");
        },
        getValue: function () {
            return [
                parseFloat(shaderObj.canvas.style.left),
                parseFloat(shaderObj.canvas.style.top),
            ];
        },
        type: "2f",
        genValue: function () {
            var pos = uniform.getValue();
            shaderObj.gl.uniform2f(uniform.getLocation(), pos[0], pos[1]);
        },
    };
    shaderObj.uniforms.push(uniform);
}
function u_window_resolutionGet(shaderObj) {
    var uniform = {
        name: "u_window_resolution",
        description: "width and height of the window resolution",
        getLocation: function () {
            return shaderObj.gl.getUniformLocation(shaderObj.program, "u_window_resolution");
        },
        getValue: function () {
            return window.innerWidth, window.innerHeight;
            // return parseFloat(window.innerWidth), parseFloat(window.innerHeight);
        },
        type: "1f",
        genValue: function () {
            var values = uniform.getValue();
            shaderObj.gl.uniform2f(uniform.getLocation(), values[0], values[1]);
        },
        shaderObj: undefined,
    };
    uniform.shaderObj.uniforms.push(uniform);
}
function u_canvas_resolutionGet(shaderObj) {
    var uniform = {
        name: "u_canvas_resolution",
        description: "width and height of the canvas being rendered",
        getLocation: function () {
            return shaderObj.gl.getUniformLocation(shaderObj.program, "u_canvas_resolution");
        },
        getValue: function () {
            return [shaderObj.width, shaderObj.height];
        },
        type: "1f",
        genValue: function () {
            var values = uniform.getValue();
            shaderObj.gl.uniform2f(uniform.getLocation(), values[0], values[1]);
        },
        shaderObj: undefined,
    };
    shaderObj.uniforms.push(uniform);
}
function u_timeGet(shaderObj) {
    var uniform = {
        name: "u_time",
        description: "changes with time",
        getLocation: function () {
            return shaderObj.gl.getUniformLocation(shaderObj.program, "u_time");
        },
        getValue: function () {
            var curTime = Date.now() / 1000 - initalTime;
            return curTime;
        },
        type: "1f",
        genValue: function () {
            return shaderObj.gl.uniform1f(uniform.getLocation(), uniform.getValue());
        },
        shaderObj: undefined,
    };
    uniform.shaderObj.uniforms.push(uniform);
}