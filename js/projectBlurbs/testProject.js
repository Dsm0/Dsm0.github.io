const shaderObjs = [{
    "canvasId": "canvas1",
    "title": "THIS IS THE TITLE",
    "blurb": "this is where the blurb would be",
    "uniformList": ["u_top"],
    "fragSource": "precision mediump float;\n  uniform float u_top;\n  void main() {\n      gl_FragColor = vec4(1. - u_top/1000.,1. - u_top/1000.,1. - u_top/1000.,1.);\n    }",
    "vertSource": "precision mediump float;\n  attribute vec2 a_position;\n  void main() {\n    gl_Position = vec4(a_position, 0, 1);\n  }",
    "width" : 200,
    "height" : 200
},
{
    "canvasId": "canvas2",
    "title": "THIS IS THE Other test",
    "blurb": "this is where the blurb would be",
    "uniformList": ["u_left"],
    "vertSource": "precision mediump float;\nattribute vec2 a_position;\nvoid main(){\ngl_Position = vec4(a_position, 0, 1);\n  }",
    "fragSource": "precision mediump float;\nuniform float u_left;\nvoid main(){\ngl_FragColor = vec4(u_left/1920.,u_left/1920.,u_left/1920.,1.);\n    }",
    "width" : 200,
    "height" : 200
}


]