var standardVert = "precision mediump float;\n attribute vec2 a_position;\nvoid main(){\ngl_Position = vec4(a_position, 0, 1);\n  }";
// const p5Vert = `precision mediump float;\nattribute vec3 aPosition;\nvoid main(){vec4 positionVec4 = vec4(aPosition,1.0); gl_Position = positionVec4;}`
var p5Vert = "\n// our vertex data\nattribute vec3 aPosition;\nattribute vec2 aTexCoord;\n\n// lets get texcoords just for fun! \nvarying vec2 vTexCoord;\n\nvoid main() {\n  // copy the texcoords\n  vTexCoord = aTexCoord;\n\n  // copy the position data into a vec4, using 1.0 as the w component\n  vec4 positionVec4 = vec4(aPosition, 1.0);\n  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;\n\n  // send the vertex information on to the fragment shader\n  gl_Position = positionVec4;\n}\n";
var blankFrag = "precision mediump float;\nvoid main(){gl_FragColor = vec4(1.0);\n }";
var greyFrag = "precision mediump float;\nvoid main(){gl_FragColor = vec4(.25);\n }";
var testFrag = "precision mediump float;\nuniform vec2 u_canvas_resolution;\nvoid main(){vec2 st = gl_FragCoord.xy/u_canvas_resolution.xy;gl_FragColor = vec4(st.x,st.y,0.,1.);\n }";
var oldfrag1 = " \n                #ifdef GL_ES\n                precision mediump float;\n                #endif\n\n                #define PI 3.1415926535\n                #define TWO_PI 6.2831853071\n\n                uniform vec2 u_canvas_resolution;\n                uniform float u_time;\n                //uniform vec2 u_pos; \n\n                \n                vec2 rotate2D(vec2 _st, float _angle){\n                    _st -= 0.5;\n                    _st =  mat2(cos(_angle),-sin(_angle),\n                                sin(_angle),cos(_angle)) * _st;\n                    _st += 0.5;\n                    return _st;\n                }\n\n                void main(){\n\n                  vec2 st = gl_FragCoord.xy/u_canvas_resolution.xy;\n                  st.x *= u_canvas_resolution.x/u_canvas_resolution.y;\n\n                  vec3 color = vec3(0.0);\n                  float d = 0.0;\n\n                  vec2 pos = vec2(0.5)-st;\n                  st = st*2. - 1.;\n\n                  float spd = 0.5 + fract(u_time/2.);\n                  float iterations = 1.;\n                  int N = int(mod((4.*spd)*u_time,8.*spd));\n\n                  float a = atan(st.x,st.y)+PI;\n                  float r = TWO_PI/float(N);\n\n                  d = cos(floor(0.95+a/r)*r-a)*length(st);\n                  float shape = smoothstep(.4,.405,d);\n\n                  float alternater = step(iterations,mod(u_time/2.,2.*iterations));\n\n                  color = vec3(mix(shape,1.-shape,alternater));\n\n                  gl_FragColor = vec4(color,1.0);\n                }";
var texFrag = "\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nuniform vec2 u_canvas_resolution;\nuniform float u_time;\n\nuniform sampler2D u_tex0;\nuniform vec2 u_tex0Resolution;\n\nvarying highp vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nvoid main (void) {\n    vec2 st = gl_FragCoord.xy/u_canvas_resolution.xy;\n    float aspect = u_canvas_resolution.x/u_canvas_resolution.y;\n    st.x *= aspect;\n\n    vec3 color = vec3(0.0);\n    color = vec3(st.x, st.y, (1.0+sin(u_time))*0.5);\n\n    if ( u_tex0Resolution != vec2(0.0) ){\n        float imgAspect = u_tex0Resolution.x/u_tex0Resolution.y;\n        vec4 img = texture2D(uSampler,st*vec2(1.,imgAspect));\n        color = mix(color,img.rgb,img.a);\n    }\n\n    gl_FragColor = vec4(color,1.0);\n}\n";
var vertLinesFrag = "\n\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nuniform vec2 u_canvas_resolution;\nuniform float   u_time;\n\nfloat plot(vec2 st, float pct){\n  return  smoothstep( pct-0.5, pct, st.y) -\n          smoothstep( pct, pct+0.5, st.y);\n}\n\nfloat rand(float x){\n\treturn fract(sin(x)*999999.0);\n}\n\nfloat square(vec2 st, float size){\n\n    vec2 bl = step(vec2(size),st);\n    float pct = bl.x * bl.y;\n    vec2 tr = step(vec2(size),1.0-st);\n    pct *= tr.x * tr.y;\n\n    return pct;\n}\n\nvoid pR(inout vec2 p, float a) {\n    p -= vec2(0.5);\n    p = cos(radians(a))*p + sin(radians(a))*vec2(p.y, -p.x);\n    p += vec2(0.5);\n}\n\nfloat star(vec2 st_, vec2 sizes){\n    vec2 st = st_;\n\n    float s1 = square(st,sizes.x);\n    pR(st,45.);\n    float s2 = square(st,sizes.y);\n\n    return s1 + s2;\n}\n\n\nvoid main(void) {\n    vec2 st = gl_FragCoord.xy/u_canvas_resolution.xy;\n    float y = 0.0;\n\n    float speed = u_time*0.25;\n\n    float i = fract(mix(st.x,st.y,distance(st,vec2(0.0,0.))));\n    float f = fract(mix(st.x,st.y,distance(st,vec2(0.5,0.5))));\n    float alternator = tan(speed*2. + ( square(st,(mod(speed/4.,1.)) )  -0.5)*(20.));\n\n    y = mix(rand(i), rand(i + f), smoothstep(0.,1.,f + alternator));\n    y += cos(alternator)/2.;\n    vec3 color = vec3(y);\n    float pct = plot(st,y);\n\n    color = (1.0-pct)*color+pct*vec3(rand(st.x),rand(st.x)/1.5,0.0);\n    color *= 1. - step(star(st,vec2(0.3,alternator/2.)),0.5);\n\n    gl_FragColor = vec4(color,1.0);\n}\n";
var frag2 = "\n               #ifdef GL_ES\n               precision mediump float;\n               #endif\n\n               uniform vec2 u_pos ;\n\n               void main(){\n                 gl_FragColor = vec4(u_pos.x/1920.,u_pos.x/1920.,u_pos.x/1920.,1.);\n               }";
var boxWiggleFrag = "\n#ifdef GL_ES\nprecision mediump float;\n#endif\nuniform vec2 u_canvas_resolution;\nuniform float u_time;\n#define PI 3.14159265358979323846\n\nvec2 rotate2D(vec2 _st, float _angle){\n    _st -= 0.5;\n    _st =  mat2(cos(_angle),-sin(_angle),\n                sin(_angle),cos(_angle)) * _st;\n    // _st += fract(u_time)*2. - .5;\n    _st += 0.5;\n    return _st;\n}\n\nvec2 tile(vec2 _st, float _zoom){\n    _st *= _zoom;\n    return fract(_st);\n}\n\nfloat box(vec2 _st, vec2 _size, float _smoothEdges){\n    _size = vec2(0.5)-_size*0.5;\n    vec2 aa = vec2(_smoothEdges*0.5);\n    vec2 uv = smoothstep(_size,_size+aa,_st);\n    uv *= smoothstep(_size,_size+aa,vec2(1.0)-_st);\n    return uv.x*uv.y;\n}\n\nfloat rand(float n){return fract(sin(n) * 43758.5453123);}\n\nfloat noise(float p){\n\tfloat fl = floor(p);\n  \tfloat fc = fract(p);\n\treturn mix(rand(fl), rand(fl + 1.0), fc);\n}\n\nfloat doubleCircleSigmoid (float x, float a){\n    float min_param_a = 0.0;\n    float max_param_a = 1.0;\n    a = max(min_param_a, min(max_param_a, a)); \n  \n    float y = 0.;\n    if (x <= a){\n      y = a - sqrt(a*a - x*x);\n    } else {\n      y = a + sqrt(sqrt(1.-a) - sqrt(x-1.));\n    }\n    return y;\n  }\n\nvoid main(void){\n    vec2 st = gl_FragCoord.xy/u_canvas_resolution.xy;\n    vec3 color = vec3(0.0);\n    \n    st = rotate2D(st,PI*.25/2.);\n\n    st.y +=  ((u_time/9.));\n    st = tile(st,1.5);\n    st = mix(tan(st),atan(st),pow(st.y,2.));\n    st = rotate2D(st,PI*.25);\n    \n    color = vec3(box(st,vec2(0.7 + 0.01*noise(u_time))+noise(gl_FragCoord.x*20./gl_FragCoord.y + u_time*10.)/20.,0.01));\n    st.y *= 0.5;\n    color -= vec3(box(st,vec2(0.5 + 0.1*noise(u_time))+noise(gl_FragCoord.y*20./gl_FragCoord.x + u_time*10.)/20.,0.01));\n\n    gl_FragColor = vec4(color,1.0);\n}\n\n";
// with help from
// https://github.com/aferriss/p5jsShaderExamples/blob/gh-pages/4_image-effects/4-7_displacement-map/effect.frag
var testTextureFrag = "\nprecision mediump float;\n\nuniform sampler2D tex1;\nuniform vec2 u_texResolution;\nuniform vec2 u_canvas_resolution;\n\nvoid main() {\n\n  vec2 uv = gl_FragCoord.xy/u_canvas_resolution.xy;\n  uv = 1.0 - uv;\n\n  float imgAspect = u_texResolution.x/u_texResolution.y;\n  vec4 img = texture2D(tex1,uv*vec2(1.,imgAspect));\n\n  gl_FragColor = img;\n}\n";
var kirb1Frag = "\nprecision mediump float;\n\nuniform sampler2D tex1;\nuniform vec2 u_texResolution;\nuniform vec2 u_canvas_resolution;\nuniform float u_time;\n\nvec3 rgb2hsv(vec3 c)\n{\n    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);\n    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));\n    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));\n\n    float d = q.x - min(q.w, q.y);\n    float e = 1.0e-10;\n    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);\n}\n\n\n\nvoid main() {\n\n  vec2 st = gl_FragCoord.xy/u_canvas_resolution.xy;\n  st = 1.0 - st;\n\n  float imgAspect = u_texResolution.x/u_texResolution.y;\n\n  float radius = 0.001 + u_time/3200.;\n  float dist = distance(vec2(0.91,0.08),st);\n\n  float pixValue = 32.;\n\n  if(mod(abs(dist - radius),.25) > 0.15){\n      pixValue = 120. + 40.*fract(radius);\n  }\n\n  st = floor(st*pixValue)/pixValue;\n\n  st.x = 1.0 - st.x;\n  vec4 img = texture2D(tex1,st*vec2(1.,imgAspect));\n\n  if(img.a != 1.0){\n      img = vec4(0.,0.,0.,1.);\n  }\n\n  gl_FragColor = img;\n}\n";
var kirb1 = function (p) {
    var img, texShader;
    p.preload = function () {
        img = p.loadImage("assets/kirb.jpeg");
    };
    p.setup = function () {
        p.canvas = p.createCanvas(200, 200, p.WEBGL);
        p.canvas.parent("p5Shader1");
        texShader = p.createShader(p5Vert, kirb1Frag);
        p.shader(texShader);
        texShader.setUniform("u_texResolution", [img.width, img.height]);
        texShader.setUniform("u_canvas_resolution", [200, 200]);
        texShader.setUniform("tex1", img);
        p.noStroke();
    };
    p.draw = function () {
        p.background("black");
        texShader.setUniform("u_time", p.millis());
        p.quad(-1, -1, 1, -1, 1, 1, -1, 1);
    };
};
var boxWiggle = function (p) {
    var boxWiggle;
    p.setup = function () {
        p.canvas = p.createCanvas(200, 200, p.WEBGL);
        p.canvas.parent("p5Shader2");
        boxWiggle = p.createShader(p5Vert, boxWiggleFrag);
        p.shader(boxWiggle);
        boxWiggle.setUniform("u_canvas_resolution", [200, 200]);
        p.noStroke();
    };
    p.draw = function () {
        boxWiggle.setUniform("u_time", p.millis() / 800);
        p.quad(-1, -1, 1, -1, 1, 1, -1, 1);
    };
};
var vertLines = function (p) {
    var vertLines;
    p.setup = function () {
        p.canvas = p.createCanvas(200, 200, p.WEBGL);
        p.canvas.parent("p5Shader3");
        vertLines = p.createShader(p5Vert, vertLinesFrag);
        p.shader(vertLines);
        vertLines.setUniform("u_canvas_resolution", [200, 200]);
        p.noStroke();
    };
    p.draw = function () {
        vertLines.setUniform("u_time", p.millis() / 800);
        p.quad(-1, -1, 1, -1, 1, 1, -1, 1);
    };
};
var boxes2 = function (p) {
    p.setup = function () {
        p.canvas = p.createCanvas(200, 200, p.WEBGL);
        p.canvas.parent("p52");
        p.frameRate(48);
        p.canvas.background("black");
    };
    p.draw = function () {
        p.background("black");
        p.push();
        for (var i = 0; i < 10; i = i + 1) {
            p.push();
            p.rotateX(20 + i + Math.floor(p.frameCount / 8));
            p.color(255, 255, 255);
            p.box(20 * i, 2, 90 + i, 2, 3);
            p.pop();
        }
        p.pop();
        // was cross-compiled so looks like shit
    };
};
var triangles2 = function (p) {
    p.setup = function () {
        p.canvas = p.createCanvas(200, 200, p.WEBGL);
        p.canvas.parent("p53");
        p.canvas.background("black");
        p.frameRate(12);
        p.noStroke();
    };
    p.draw = function () {
        // p.setBa();
        p.background("black");
        for (var i = 0; i < Math.floor(Math.min(p.frameCount, 20)); i = i + 1) {
            p.rotateY((p.frameCount * 1) / (5 + i));
            p.rotateX((p.frameCount * 1) / (5 + i));
            p.triangle(20 + 2 * i, 20, 20 + i, 40 + i, 40, 40 + 3 * i);
            p.rotateX(i * 20);
            p.translate(0, i * 2 + i, 0);
            p.translate(0, -1 * (2 * i), 0);
        }
    };
};
var boxstar = function (p) {
    p.setup = function () {
        p.canvas = p.createCanvas(200, 200, p.WEBGL);
        p.canvas.parent("p51");
        p.canvas.background("black");
        p.frameRate(36);
        p.stroke(255, 255, 255);
        p.blendMode(p.SCREEN);
    };
    p.draw = function () {
        p.background("black");
        function sign(x) {
            return x > 0 ? 1 : x < 0 ? -1 : 0;
        }
        for (var i = 1; i < Math.floor(p.frameCount / 5) % 8; i = i + 1) {
            p.fill(255 - i * 10, 165 - i * 5, 0);
            p.rotateX(i * sign(((p.frameCount / 5) % 16) - 8));
            p.rotateY(i * sign(((p.frameCount / 5) % 16) - 8));
            p.rotateZ(i * sign(((p.frameCount / 5) % 16) - 8));
            p.box(30 + i * 2, (Math.floor(p.frameCount / 100) % 30) * (i + -1 * 1), 30 * i, i, undefined);
            p.box((Math.floor(p.frameCount / 50) % 30) * (i + -1 * 1), 30 * i, 30, i, undefined);
            p.box(30 * i, 20, 20, i, undefined);
            p.box(30, 30, (Math.floor(p.frameCount / 100) % 30) * (i + -1 * 1), i, undefined);
        }
    };
};
var p5Shader1 = kirb1;
var p5Shader2 = boxWiggle;
var p5Shader3 = vertLines;
var p51sketch = boxstar;
var p52sketch = boxes2;
var p53sketch = triangles2;
var p5Objs = [
    {
        title: "textureTest",
        divId: "p5Shader1",
        blurb: "made with glsl",
        sketch: p5Shader1,
    },
    {
        title: "boxWiggle",
        divId: "p5Shader2",
        blurb: "made with glsl",
        sketch: p5Shader2,
    },
    {
        title: "glslTest",
        divId: "p5Shader3",
        blurb: "made with glsl",
        sketch: p5Shader3,
    },
    {
        title: "P5hs",
        divId: "p51",
        blurb: "made in P5hs: my port of the creative-coding library p5.js to haskell (compiled to javascript)",
        sketch: p51sketch,
    },
    {
        title: "P5hs",
        divId: "p52",
        blurb: "made in P5hs: my port of the creative-coding library p5.js to haskell (compiled to javascript)",
        sketch: p52sketch,
    },
    {
        title: "P5hs",
        divId: "p53",
        blurb: "made in P5hs: my port of the creative-coding library p5.js to haskell (compiled to javascript)",
        sketch: p53sketch,
    },
];
