
const ctrl_sliders = document.getElementsByClassName('ctrl_slider');
const cool_sliders = document.getElementsByClassName('cool_slider');

const sl_min = ctrl_sliders[0].min;
const sl_max = ctrl_sliders[0].max;
const body = document.body;

console.log(sl_min,sl_max)

// https://stackoverflow.com/a/10624656
function percentwidth(elem){
    var pa= elem.offsetParent || elem;
    return parseFloat(((elem.offsetWidth/pa.offsetWidth)*100).toFixed(2));
}

const effects = [
  (x,sl,w) => {sl.setAttribute('value',x)},
  (x,sl,w) => {sl.setAttribute('value',100 - x)},

  (x,sl,w) => {sl.setAttribute('value',x < 50 ? Math.abs((((x/8.05)**2.1405)) * Math.sin(((x-4.405)/(4.082)))) : x) },

  // TODO: give this an animation where the scroll-dot bounces like it's a ball if its 
  // (x,sl) => {sl.setAttribute('value',x < 50 ?  : x) },

  (x,sl,w) => {
    sl.style.transform = `scaleX(${((x)/50)**7})`
  },

  (x,sl,w) => { sl.value = x; sl.style.transform = `scaleY(${((x)/50)**7})` },

  (x,sl,w) => { sl.value = x; sl.style.transform = `scaleY(${((x-50)/50)**2})` },

  (x,sl,w) => {
    if (x < 50) {
      sl.value = x;
      sl.style.width = w + '%';
    } else {
      sl.value = 50; // + ((x-50)/50)*45;
      c_w = parseFloat(sl.style.width)
      console.log(c_w)
      sl.style.width = (cw + ((x-50)/50)) + '%'
    }
    console.log(w)
  },

  (x,sl,w) => {
    document.body.style.x = x
  },

]

for(var i=0; i < ctrl_sliders.length; i++) {
  console.log(i)

  const ctrl_slider = ctrl_sliders[i]
  const cool_slider = cool_sliders[i]
  cool_slider.disabled = true

  const func = effects[i]

  const w = percentwidth(cool_slider)

  ctrl_sliders[i].oninput = function(input) {
    x = input.target.value
    func(x,cool_slider,w)
  } 

  func(50,cool_slider,w)

}


