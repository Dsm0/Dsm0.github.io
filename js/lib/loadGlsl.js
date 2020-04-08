// function readTextFile(file){
//   fetch(window.location.href + file)
//     .then(response => response.text())
//     .then((data) => {
//       console.log(data)
//     })
// }

// function getGlsl(filename){
//   document.getElementById
// }


// function readTextFile(file)
// {
//     var rawFile = new XMLHttpRequest();
//     rawFile.open("GET", file, false);
//     rawFile.onreadystatechange = function ()
//     {
//         if(rawFile.readyState === 4)
//         {
//             if(rawFile.status === 200 || rawFile.status == 0)
//             {
//                 var allText = rawFile.responseText;
//                 alert(allText);
//             }
//         }
//     }
//     rawFile.send(null);
// }

// // fetches the document for the given embedding_element
// function getText(embedding_element)
// {
// 	if (embedding_element.contentDocument) 
// 	{
// 		return embedding_element.contentDocument;
// 	} 
// 	else 
// 	{
// 		var subdoc = null;
// 		try {
// 			subdoc = embedding_element.src;
// 		} catch(e) {console.log(e)}
// 		return subdoc;
// 	}
// }

// {
//   var elms = document.querySelectorAll(".emb");
//   for (var i = 0; i < elms.length; i++)
//   {
//     var subdoc = getText(elms[i]);
//     if (subdoc)
//       subdoc.getElementsByTagName("PRE")[0].setAttribute("display", "hidden");
//   }
// }

// thank you so much https://stackoverflow.com/a/7410711


// function readSingleFile(file) {
//   if (!file) {
//     return;
//   }
//   var reader = new FileReader();
//   reader.onload = function(e) {
//     var contents = e.target.result;
//     displayContents(contents);
//   };
//   return reader.readAsText(file);
// }

// function readSingleFile(file){
//   fetch('http://localhost/glsl/fragShaders/test.frag')
//   .then(response => response.text())
//   .then((data) => {
//     console.log(data)
//   })
// }

// utils = {};

// utils.allShaders = {};
// utils.SHADER_TYPE_FRAGMENT = "x-shader/x-fragment";
// utils.SHADER_TYPE_VERTEX = "x-shader/x-vertex";

// utils.addShaderProg = function (gl, vertex, fragment) {

//     utils.loadShader(vertex, utils.SHADER_TYPE_VERTEX);
//     utils.loadShader(fragment, utils.SHADER_TYPE_FRAGMENT);

//     var vertexShader = utils.getShader(gl, vertex);
//     var fragmentShader = utils.getShader(gl, fragment);

//     var prog = gl.createProgram();
//     gl.attachShader(prog, vertexShader);
//     gl.attachShader(prog, fragmentShader);
//     gl.linkProgram(prog);

//     if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {alert("Could not initialise main shaders");}

//     return prog;
// };

// utils.loadShader = function(file, type) {
//     var cache, shader;

//     $.ajax({
//         async: false, // need to wait... todo: deferred?
//         url: "shaders/" + file, //todo: use global config for shaders folder?
//         success: function(result) {
//            cache = {script: result, type: type};
//         }
//     });

//     // store in global cache
//     uilts.allShaders[file] = cache;
// };

// utils.getShader = function (gl, id) {

//     //get the shader object from our main.shaders repository
//     var shaderObj = utils.allShaders[id];
//     var shaderScript = shaderObj.script;
//     var shaderType = shaderObj.type;

//     //create the right shader
//     var shader;
//     if (shaderType == "x-shader/x-fragment") {
//         shader = gl.createShader(gl.FRAGMENT_SHADER);
//     } else if (shaderType == "x-shader/x-vertex") {
//         shader = gl.createShader(gl.VERTEX_SHADER);
//     } else {
//         return null;
//     }

//     //wire up the shader and compile
//     gl.shaderSource(shader, shaderScript);
//     gl.compileShader(shader);

//     //if things didn't go so well alert
//     if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
//         alert(gl.getShaderInfoLog(shader));
//         return null;
//     }

//     //return the shader reference
//     return shader;

// };//end:getShader