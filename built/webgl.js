function gengl(canvas) {
    var gl = canvas.getContext("experimental-webgl");
    if (!gl) {
        console.log("no gl :(");
    }
    return gl;
}
function genShaderObjFromId(shaderObj) {
    var canvas = document.getElementById(shaderObj.canvasId);
    var gl = gengl(canvas);
    var program = gl.createProgram();
    var fragSource = shaderObj.fragSource;
    var vertSource = shaderObj.vertSource;
    shaderObj.canvas = canvas;
    shaderObj.gl = gl;
    shaderObj.fragSource = fragSource;
    shaderObj.vertSource = vertSource;
    shaderObj.program = program;
    shaderObj.uniforms = [];
    genUniforms(shaderObj);
    return shaderObj;
}
// function initP5(p5Obj) {
//   var div = document.getElementById(p5Obj.divId);
//   div.setAttribute("data-blurb", p5Obj.blurb);
//   return new p5(p5Obj.sketch);
// }
function initWebGl() {
    // var loadedShaderObjs = shaderObjs.map(genShaderObjFromId);
    var loadedP5s = p5Objs.map(initP5);
    // rest in pieces
    // initShaders(loadedShaderObjs);
    // function renderList() {
    //     loadedShaderObjs.forEach(function (shaderObj, index) {
    //       render(shaderObj)
    //     });
    //     requestAnimationFrame(renderList);
    // }
    // requestAnimationFrame(renderList);
}
function initShaders(shaderObjs) {
    shaderObjs.forEach(function (shaderObj, index) {
        initShader(shaderObj);
    });
}
function render(shaderObj) {
    var gl = shaderObj.gl;
    var canvas = shaderObj.canvas;
    var program = shaderObj.program;
    shaderObj.uniforms.forEach(function (uniform, index) {
        uniform.genValue();
    });
    gl.drawArrays(shaderObj.gl.TRIANGLES, 0, 6);
}
function initShader(shaderObj) {
    var gl = shaderObj.gl;
    var canvas = shaderObj.canvas;
    var program = shaderObj.program;
    var vertSource = shaderObj.vertSource;
    var fragSource = shaderObj.fragSource;
    // console.log(fragSource);
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1.0,
        -1.0,
        1.0,
        -1.0,
        -1.0,
        1.0,
        -1.0,
        1.0,
        1.0,
        -1.0,
        1.0,
        1.0,
    ]), gl.STATIC_DRAW);
    canvas.name = shaderObj.title;
    canvas.innerHTML = shaderObj.blurb;
    canvas.width = shaderObj.width;
    canvas.height = shaderObj.height;
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    gl.clearColor(1, 1, 1, 1.0);
    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertShader, vertSource);
    gl.shaderSource(fragShader, fragSource);
    if (shaderObj.imageUrl !== undefined) {
        loadTexture(gl, shaderObj.imageUrl);
    }
    gl.compileShader(vertShader);
    gl.compileShader(fragShader);
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    var positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    shaderObj.initalized = true;
}
// courtesy of https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url) {
    var texture = gl.createTexture();
    var ext = gl.getExtension("WEBGL_compressed_texture_etc1");
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Because images have to be download over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    var level = 0;
    var internalFormat = gl.RGBA;
    var width = 1;
    var height = 1;
    var border = 0;
    var srcFormat = gl.RGBA;
    var srcType = gl.UNSIGNED_BYTE;
    var pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);
    var image = new Image();
    image.onload = function () {
        // gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.compressedTexImage2D(gl.TEXTURE_2D, 0, ext.COMPRESSED_RGB_ETC1_WEBGL, 200, 200, 0, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
        // WebGL1 has different requirements for power of 2 images
        // vs non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        // No, it's not a power of 2. Turn off mips and set
        // wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    };
    image.src = url;
    return texture;
}