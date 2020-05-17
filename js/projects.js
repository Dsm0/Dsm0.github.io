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

const frag3 = `
//modified version of shader from chapter 9 of thebookofshaders
#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 u_canvas_resolution;
uniform float u_time;
#define PI 3.14159265358979323846

vec2 rotate2D(vec2 _st, float _angle){
    _st -= 0.5;
    _st =  mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle)) * _st;
    // _st += fract(u_time)*2. - .5;
    _st += 0.5;
    return _st;
}

vec2 tile(vec2 _st, float _zoom){
    _st *= _zoom;
    return fract(_st);
}

float box(vec2 _st, vec2 _size, float _smoothEdges){
    _size = vec2(0.5)-_size*0.5;
    vec2 aa = vec2(_smoothEdges*0.5);
    vec2 uv = smoothstep(_size,_size+aa,_st);
    uv *= smoothstep(_size,_size+aa,vec2(1.0)-_st);
    return uv.x*uv.y;
}
float rand(float n){return fract(sin(n) * 43758.5453123);}

float noise(float p){
	float fl = floor(p);
  	float fc = fract(p);
	return mix(rand(fl), rand(fl + 1.0), fc);
}

void main(void){
    vec2 st = gl_FragCoord.xy/u_canvas_resolution.xy;
    vec3 color = vec3(0.0);
    
    st = rotate2D(st,PI*.25/2.) + u_time/9.;

    st = tile(st,3.);
    st = rotate2D(st,PI*.25);
    
    color = vec3(box(st,vec2(0.7 + 0.01*noise(u_time))+noise(gl_FragCoord.x*20./gl_FragCoord.y + u_time*20.)/20.,0.01));

    gl_FragColor = vec4(color,1.0);
}

`


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
    "fragSource": frag2,
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
    "uniformList": ["u_time","u_canvas_resolution"],
    "vertSource": standardVert,
    "fragSource": frag3,
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
