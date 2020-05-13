const shaderObjs = [{
    "canvasId": "canvas1",
    "title": "THIS IS THE TITLE",
    "blurb": "this is where the blurb would be",
    "uniformList": ["u_top"],
    "fragSource": "precision mediump float;\n  uniform float u_top;\n  void main() {\n      gl_FragColor = vec4(1. - u_top/1000.,1. - u_top/1000.,1. - u_top/1000.,1.);\n    }",
    "vertSource": "precision mediump float;\n  attribute vec2 a_position;\n  void main() {\n    gl_Position = vec4(a_position, 0, 1);\n  }",
    "width" : 200,
    "height" : 200
}]