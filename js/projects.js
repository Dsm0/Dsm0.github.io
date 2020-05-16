const standardVert = "precision mediump float;\n attribute vec2 a_position;\nvoid main(){\ngl_Position = vec4(a_position, 0, 1);\n  }";

const blankFrag = "precision mediump float;\nvoid main(){gl_FragColor = vec4(1.0);\n }";

const frag1 = ` 
                #ifdef GL_ES
                precision mediump float;
                #endif

                #define PI 3.1415926535
                #define TWO_PI 6.2831853071

                uniform vec2 u_canvas_resolution;
                uniform float u_time;
                //uniform vec2 u_pos; 

                void main(){

                  vec2 st = gl_FragCoord.xy/u_canvas_resolution.xy;
                  st.x *= u_canvas_resolution.x/u_canvas_resolution.y;

                  vec3 color = vec3(0.0);
                  float d = 0.0;

                  vec2 pos = vec2(0.5)-st;
                  st = st*2. - 1.;

                  float spd = 2. + max(.2,fract(u_time));
                  float iterations = 1.;
                  int N = int(mod((4.*spd)*u_time,4.*spd))*1;

                  float a = atan(st.x,st.y)+PI;
                  float r = TWO_PI/float(N);

                  d = cos(floor(0.95+a/r)*r-a)*length(st);
                  float shape = smoothstep(.4,.405,d);

                  float alternater = step(iterations,mod(u_time,2.*iterations));

                  color = vec3(mix(shape,1.-shape,alternater));

                  gl_FragColor = vec4(color,1.0);
                }`;


const frag2 = `
               #ifdef GL_ES
               precision mediump float;
               #endif

               uniform vec2 u_pos ;

               void main(){
                 gl_FragColor = vec4(u_pos.x/1920.,u_pos.x/1920.,u_pos.x/1920.,1.);
               }`;


const shaderObjs= [{
    "canvasId": "canvas1",
    "title": "misc1",
    "blurb": "this is where the blurb would be",
    "uniformList": ["u_canvas_resolution","u_time"],
    "fragSource": frag1,
    "vertSource": standardVert,
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
    "title": "Eulerroom Equinox",
    "blurb": "this is where the blurb would be",
    "uniformList": ["u_pos"],
    "vertSource": standardVert,
    //"fragSource": frag2;
    "fragSource": blankFrag,
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
    "title": "Toplap15 stream",
    "blurb": "blurb3",
    "uniformList": ["u_pos"],
    "vertSource": standardVert,
    "fragSource": frag2,
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
