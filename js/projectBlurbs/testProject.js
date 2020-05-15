const shaderObjs= [{
    "canvasId": "canvas1",
    "title": "THIS IS THE TITLE",
    "blurb": "this is where the blurb would be",
    "uniformList": ["u_top"],
    "fragSource": "precision mediump float;\n  uniform float u_top;\n  void main() {\n      gl_FragColor = vec4(1. - u_top/1000.,1. - u_top/1000.,1. - u_top/1000.,1.);\n    }",
    "vertSource": "precision mediump float;\n  attribute vec2 a_position;\n  void main() {\n    gl_Position = vec4(a_position, 0, 1);\n  }",
    "width" : 200,
    "height" : 200,
    "positionData":{
        "data-pivotX" :"75%",
        "data-pivotY" :"35%",
        "data-xfactor":2.5,
        "data-yfactor":1,
        "data-staticX":"75%",
        "data-staticY":"25%"
    }
},
{
    "canvasId": "canvas2",
    "title": "THIS IS THE Other test",
    "blurb": "this is where the blurb would be",
    "uniformList": ["u_left"],
    "vertSource": "precision mediump float;\nattribute vec2 a_position;\nvoid main(){\ngl_Position = vec4(a_position, 0, 1);\n  }",
    "fragSource": "precision mediump float;\nuniform float u_left;\nvoid main(){\ngl_FragColor = vec4(u_left/1920.,u_left/1920.,u_left/1920.,1.);\n    }",
    "width" : 200,
    "height" : 200,
    "positionData":{
        "data-pivotX" :"75%",
        "data-pivotY" :"50%",
        "data-xfactor":2.5,
        "data-yfactor":1,
        "data-staticX":"75%",
        "data-staticY":"50%"
    }
},
{
    "canvasId": "canvas3",
    "title": "third",
    "blurb": "blurb3",
    "uniformList": [],
    "vertSource": "precision mediump float;\nattribute vec2 a_position;\nvoid main(){\ngl_Position = vec4(a_position, 0, 1);\n  }",
    "fragSource": "precision mediump float;\nvoid main(){gl_FragColor = vec4(1.0);\n }",
    "width" : 200,
    "height" : 200,
    "positionData":{
        "data-pivotX" :"75%",
        "data-pivotY" :"65%",
        "data-xfactor":2.5,
        "data-yfactor":1,
        "data-staticX":"75%",
        "data-staticY":"75%"
    }

}
]