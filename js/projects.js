const standardVert = "precision mediump float;\n attribute vec2 a_position;\nvoid main(){\ngl_Position = vec4(a_position, 0, 1);\n  }";
// const p5Vert = `precision mediump float;\nattribute vec3 aPosition;\nvoid main(){vec4 positionVec4 = vec4(aPosition,1.0); gl_Position = positionVec4;}`

const p5Vert = `
// our vertex data
attribute vec3 aPosition;
attribute vec2 aTexCoord;

// lets get texcoords just for fun! 
varying vec2 vTexCoord;

void main() {
  // copy the texcoords
  vTexCoord = aTexCoord;

  // copy the position data into a vec4, using 1.0 as the w component
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;

  // send the vertex information on to the fragment shader
  gl_Position = positionVec4;
}
`


const blankFrag = "precision mediump float;\nvoid main(){gl_FragColor = vec4(1.0);\n }";
const greyFrag = "precision mediump float;\nvoid main(){gl_FragColor = vec4(.25);\n }";
const testFrag = "precision mediump float;\nuniform vec2 u_canvas_resolution;\nvoid main(){vec2 st = gl_FragCoord.xy/u_canvas_resolution.xy;gl_FragColor = vec4(st.x,st.y,0.,1.);\n }";

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
  return  smoothstep( pct-0.5, pct, st.y) -
          smoothstep( pct, pct+0.5, st.y);
}

float rand(float x){
	return fract(sin(x)*999999.0);
}

float square(vec2 st, float size){

    vec2 bl = step(vec2(size),st);
    float pct = bl.x * bl.y;
    vec2 tr = step(vec2(size),1.0-st);
    pct *= tr.x * tr.y;

    return pct;
}

void pR(inout vec2 p, float a) {
    p -= vec2(0.5);
    p = cos(radians(a))*p + sin(radians(a))*vec2(p.y, -p.x);
    p += vec2(0.5);
}

float star(vec2 st_, vec2 sizes){
    vec2 st = st_;

    float s1 = square(st,sizes.x);
    pR(st,45.);
    float s2 = square(st,sizes.y);

    return s1 + s2;
}


void main(void) {
    vec2 st = gl_FragCoord.xy/u_canvas_resolution.xy;
    float y = 0.0;

    float speed = u_time*0.25;

    float i = fract(mix(st.x,st.y,distance(st,vec2(0.0,0.))));
    float f = fract(mix(st.x,st.y,distance(st,vec2(0.5,0.5))));
    float alternator = tan(speed*2. + ( square(st,(mod(speed/4.,1.)) )  -0.5)*(20.));

    y = mix(rand(i), rand(i + f), smoothstep(0.,1.,f + alternator));
    y += cos(alternator)/2.;
    vec3 color = vec3(y);
    float pct = plot(st,y);

    color = (1.0-pct)*color+pct*vec3(rand(st.x),rand(st.x)/1.5,0.0);
    color *= 1. - step(star(st,vec2(0.3,alternator/2.)),0.5);

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

float doubleCircleSigmoid (float x, float a){
    float min_param_a = 0.0;
    float max_param_a = 1.0;
    a = max(min_param_a, min(max_param_a, a)); 
  
    float y = 0.;
    if (x <= a){
      y = a - sqrt(a*a - x*x);
    } else {
      y = a + sqrt(sqrt(1.-a) - sqrt(x-1.));
    }
    return y;
  }

void main(void){
    vec2 st = gl_FragCoord.xy/u_canvas_resolution.xy;
    vec3 color = vec3(0.0);
    
    st = rotate2D(st,PI*.25/2.);

    st.y +=  ((u_time/9.));
    st = tile(st,1.5);
    st = mix(tan(st),atan(st),pow(st.y,2.));
    st = rotate2D(st,PI*.25);
    
    color = vec3(box(st,vec2(0.7 + 0.01*noise(u_time))+noise(gl_FragCoord.x*20./gl_FragCoord.y + u_time*10.)/20.,0.01));
    st.y *= 0.5;
    color -= vec3(box(st,vec2(0.5 + 0.1*noise(u_time))+noise(gl_FragCoord.y*20./gl_FragCoord.x + u_time*10.)/20.,0.01));

    gl_FragColor = vec4(color,1.0);
}

`


// with help from  
// https://github.com/aferriss/p5jsShaderExamples/blob/gh-pages/4_image-effects/4-7_displacement-map/effect.frag 
var testTextureFrag = `
precision mediump float;

uniform sampler2D tex1;
uniform vec2 u_texResolution;
uniform vec2 u_canvas_resolution;

void main() {

  vec2 uv = gl_FragCoord.xy/u_canvas_resolution.xy;
  uv = 1.0 - uv;

  float imgAspect = u_texResolution.x/u_texResolution.y;
  vec4 img = texture2D(tex1,uv*vec2(1.,imgAspect));

  gl_FragColor = img;
}
`
var kirb1Frag = `
precision mediump float;

uniform sampler2D tex1;
uniform vec2 u_texResolution;
uniform vec2 u_canvas_resolution;
uniform float u_time;

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}



void main() {

  vec2 st = gl_FragCoord.xy/u_canvas_resolution.xy;
  st = 1.0 - st;

  float imgAspect = u_texResolution.x/u_texResolution.y;

  float radius = 0.001 + u_time/3200.;
  float dist = distance(vec2(0.91,0.08),st);

  float pixValue = 32.;

  if(mod(abs(dist - radius),.25) > 0.15){
      pixValue = 120. + 40.*fract(radius);
  }

  st = floor(st*pixValue)/pixValue;

  vec4 img = texture2D(tex1,st*vec2(1.,imgAspect));

  if(img.a != 1.0){
      img = vec4(0.,0.,0.,1.);
  }

  gl_FragColor = img;
}
`

var kirb1 = function(p){
    p.preload = function(){
        img = p.loadImage("http://r74n.com/stickers/images/kirb.png");
    }

    p.setup = function(){
        p.canvas = p.createCanvas(200,200,p.WEBGL);
        p.canvas.parent("p5Shader1");
        texShader = p.createShader(p5Vert,kirb1Frag);
        p.shader(texShader);
        texShader.setUniform("u_texResolution",[img.width,img.height]);
        texShader.setUniform("u_canvas_resolution",[200,200]);
        texShader.setUniform("tex1",img);
        p.noStroke();
    }
    p.draw = function(){
        p.background("black");
        texShader.setUniform("u_time",p.millis());
        p.quad(-1, -1, 1, -1, 1, 1, -1, 1);
    }
}

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


var boxstar = function(p){

    p.setup = function(){
        p.canvas = p.createCanvas(200,200,p.WEBGL);
        p.canvas.parent("p51");
        p.canvas.background('black');
        p.frameRate(36);
        p.stroke(255,255,255);
        p.blendMode(p.SCREEN);
    }

    p.draw = function(){
        p.background("black");
        for(var i = 1;(i < ((Math.floor((p.frameCount / 5))) % 8)) ; i = i + 1){
            p.fill(255 - i*10,165 - i*5,0);
            p.rotateX(i * (Math.sign((p.frameCount / 5) % 16  - 8)));
            p.rotateY(i * (Math.sign((p.frameCount / 5) % 16 - 8)));
            p.rotateZ(i * (Math.sign((p.frameCount / 5) % 16 - 8)));
            p.box((30 + (i * 2)),(((Math.floor((p.frameCount / 100))) % 30) * (i + (-1 * 1))),(30 * i),i,undefined);
            p.box((((Math.floor((p.frameCount / 50))) % 30) * (i + (-1 * 1))),(30 * i),30,i,undefined);
            p.box((30 * i),20,20,i,undefined);
            p.box(30,30,(((Math.floor((p.frameCount / 100))) % 30) * (i + (-1 * 1))),i,undefined);
        }
    }
}

var p5Shader1 = kirb1;
var p5Shader2 = boxWiggle;
var p5Shader3 = vertLines;

var p51 = boxstar;
var p52 = boxes2;
var p53 = triangles2;

const p5Objs = [
    {
        "title":"textureTest",
        "divId": "p5Shader1",
        "blurb":`made with glsl`,
        "sketch": p5Shader1
    },
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
        "divId": "p51",
        "blurb":`made in P5hs: my port of the creative-coding library p5.js to haskell (compiled to javascript)`,
        "sketch": p51 
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
        "blurb":`made in P5hs: my port of the creative-coding library p5.js to haskell (compiled to javascript)`,
        "sketch": p53 
    },

]