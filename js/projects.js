const standardVert = "precision mediump float;\n attribute vec2 a_position;\nvoid main(){\ngl_Position = vec4(a_position, 0, 1);\n  }";
const p5Vert = `precision mediump float;\nattribute vec3 aPosition;\nvoid main(){vec4 positionVec4 = vec4(aPosition,1.0); gl_Position = positionVec4;}`

const texturedVert = `
attribute vec4 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying highp vec2 vTextureCoord;

void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  vTextureCoord = aTextureCoord;
}
`;

const blankFrag = "precision mediump float;\nvoid main(){gl_FragColor = vec4(1.0);\n }";
const greyFrag = "precision mediump float;\nvoid main(){gl_FragColor = vec4(.25);\n }";

const oldfrag1 = ` 
                #ifdef GL_ES
                precision mediump float;
                #endif

                #define PI 3.1415926535
                #define TWO_PI 6.2831853071

                uniform vec2 u_canvas_resolution;
                uniform float u_time;
                //uniform vec2 u_pos; 

                
                vec2 rotate2D(vec2 _st, float _angle){
                    _st -= 0.5;
                    _st =  mat2(cos(_angle),-sin(_angle),
                                sin(_angle),cos(_angle)) * _st;
                    _st += 0.5;
                    return _st;
                }

                void main(){

                  vec2 st = gl_FragCoord.xy/u_canvas_resolution.xy;
                  st.x *= u_canvas_resolution.x/u_canvas_resolution.y;

                  vec3 color = vec3(0.0);
                  float d = 0.0;

                  vec2 pos = vec2(0.5)-st;
                  st = st*2. - 1.;

                  float spd = 0.5 + fract(u_time/2.);
                  float iterations = 1.;
                  int N = int(mod((4.*spd)*u_time,8.*spd));

                  float a = atan(st.x,st.y)+PI;
                  float r = TWO_PI/float(N);

                  d = cos(floor(0.95+a/r)*r-a)*length(st);
                  float shape = smoothstep(.4,.405,d);

                  float alternater = step(iterations,mod(u_time/2.,2.*iterations));

                  color = vec3(mix(shape,1.-shape,alternater));

                  gl_FragColor = vec4(color,1.0);
                }`
                ;


const texFrag = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_canvas_resolution;
uniform float u_time;

uniform sampler2D u_tex0;
uniform vec2 u_tex0Resolution;

varying highp vec2 vTextureCoord;
uniform sampler2D uSampler;

void main (void) {
    vec2 st = gl_FragCoord.xy/u_canvas_resolution.xy;
    float aspect = u_canvas_resolution.x/u_canvas_resolution.y;
    st.x *= aspect;

    vec3 color = vec3(0.0);
    color = vec3(st.x, st.y, (1.0+sin(u_time))*0.5);

    if ( u_tex0Resolution != vec2(0.0) ){
        float imgAspect = u_tex0Resolution.x/u_tex0Resolution.y;
        vec4 img = texture2D(uSampler,st*vec2(1.,imgAspect));
        color = mix(color,img.rgb,img.a);
    }

    gl_FragColor = vec4(color,1.0);
}
`

const vertLinesFrag = `

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_canvas_resolution;
uniform float   u_time;

float plot(vec2 st, float pct){
  return  smoothstep( pct-0.02, pct, st.y) -
          smoothstep( pct, pct+0.02, st.y);
}

float rand(float x){
	return fract(sin(x)*999999.0);
}

void main(void) {
    vec2 st = gl_FragCoord.xy/u_canvas_resolution.xy;
    float y = 0.0;
    float i = floor(st.x);
    float f = fract(st.x);
    float alternator = sin(u_time*2. + (st.x-0.5)*(20.));
    y = mix(rand(i), rand(i + f), smoothstep(0.,1.,f + alternator));
    vec3 color = vec3(y);
    float pct = plot(st,y);
    color = (1.0-pct)*color+pct*vec3(rand(st.x),rand(st.x)/1.5,0.0);
    gl_FragColor = vec4(color,1.0);
}
`


const frag2 = `
               #ifdef GL_ES
               precision mediump float;
               #endif

               uniform vec2 u_pos ;

               void main(){
                 gl_FragColor = vec4(u_pos.x/1920.,u_pos.x/1920.,u_pos.x/1920.,1.);
               }`;

const boxWiggleFrag = `
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

// const shaderObjs= [{
//     "canvasId": "canvas1",
//     "title": "misc1",
//     "blurb": "made in glsl",
//     "uniformList": ["u_canvas_resolution","u_time"],
//     "fragSource": frag1,
//     "vertSource": standardVert,
//     // "imageUrl": "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fih0.redbubble.net%2Fimage.539992994.4999%2Fflat%2C800x800%2C075%2Cf.u2.jpg&f=1&nofb=1",
//     "width" : 200,
//     "height" : 200
// }
// ,{
//     "canvasId": "canvas2",
//     "title": "Toplap 15",
//     "blurb": "made in glsl",
//     "uniformList": ["u_time","u_canvas_resolution"],
//     "vertSource": standardVert,
//     "fragSource": frag3,
//     "width" : 200,
//     "height" : 200
// }
// ]

const shaderObjs = [];


// var testShader = function(p){
//     p.setup = function(){
//         p.canvas = p.createCanvas(200,200,p.WEBGL);
//         p.canvas.parent("p5Shader1");
//         grey = p.createShader(p5Vert,greyFrag);
//         p.shader(grey);
//         p.noStroke();
//     }
//     p.draw = function(){
//         // grey.setUniform("u_time",p.time());
//         p.quad(-1, -1, 1, -1, 1, 1, -1, 1);
//     }
// }


var boxWiggle = function(p){
    p.setup = function(){
        p.canvas = p.createCanvas(200,200,p.WEBGL);
        p.canvas.parent("p5Shader2");
        boxWiggle = p.createShader(p5Vert,boxWiggleFrag);
        p.shader(boxWiggle);
        boxWiggle.setUniform("u_canvas_resolution",[200,200]);
        p.noStroke();
    }
    p.draw = function(){
        boxWiggle.setUniform("u_time",p.millis()/800);
        p.quad(-1, -1, 1, -1, 1, 1, -1, 1);
    }
}


var vertLines = function(p){
    p.setup = function(){
        p.canvas = p.createCanvas(200,200,p.WEBGL);
        p.canvas.parent("p5Shader3");
        vertLines = p.createShader(p5Vert,vertLinesFrag);
        p.shader(vertLines);
        vertLines.setUniform("u_canvas_resolution",[200,200]);
        p.noStroke();
    }
    p.draw = function(){
        vertLines.setUniform("u_time",p.millis()/800);
        p.quad(-1, -1, 1, -1, 1, 1, -1, 1);
    }
}


var boxes2 = function(p){
    p.setup = function(){
        p.canvas = p.createCanvas(200,200,p.WEBGL);
        p.canvas.parent("p52");
        p.frameRate(48);
        p.canvas.background('black');
    }
    p.draw = function(){
        p.background("black");
        p.push();
        for( var i = 0;(i < 10) ; i = i + 1)
            { p.push();
              p.rotateX(((20 + i) + (Math.floor((p.frameCount / 8))))); 
              p.color(255,255,255);
              p.box((20 * i),2,90 + i,2,3); p.pop()};
        p.pop();
        // was cross-compiled so looks like shit 
    }
}

var triangles2 = function(p){
    p.setup = function(){
        p.canvas = p.createCanvas(200,200,p.WEBGL);
        p.canvas.parent("p53");
        p.canvas.background('black');
        p.frameRate(12);
        p.noStroke()
    }

    p.draw = function(){
        // p.setBa();
        p.background("black");
        for(var i = 0;(i < ((Math.floor(Math.min(p.frameCount,20))))) ; i = i + 1){
            p.rotateY((p.frameCount* 1 / (5 + i)));
            p.rotateX((p.frameCount* 1 / (5 + i)));
            p.triangle((20 + (2 * i)),20,20+i,(40 + i),40,(40 + (3 * i)));
            p.rotateX((i * 20));
            p.translate(0,(i * 2) + i,0);
            p.translate(0,(-1 * (2 * i)),0);
        }
    }
}

// var p5Shader1 = testShader;
var p5Shader2 = boxWiggle;
var p5Shader3 = vertLines;

// var p51 = circlesTest1;
var p52 = boxes2;
var p53 = triangles2;

const p5Objs = [
    {
        "title":"boxWiggle",
        "divId": "p5Shader2",
        "blurb":`made with glsl`,
        "sketch": p5Shader2
    },
    {
        "title":"glslTest",
        "divId": "p5Shader3",
        "blurb":`made with glsl`,
        "sketch": p5Shader3
    },
    {
        "title":"P5hs",
        "divId": "p52",
        "blurb":`made in P5hs: my port of the creative-coding library p5.js to haskell (compiled to javascript)`,
        "sketch": p52 
    },
    {
        "title":"P5hs",
        "divId": "p53",
        "blurb":`a port of the creative-coding library p5.js 
                   from javascript to haskell`,
        "sketch": p53 
    },

]