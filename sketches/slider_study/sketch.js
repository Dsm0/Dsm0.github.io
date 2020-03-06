
const main_slider_div = document.getElementById("sliders")

const sl_min = 0
const sl_max = 100
const body = document.body;
const sliders = document.getElementById("sliders");

// console.log(sl_min, sl_max)

// https://stackoverflow.com/a/10624656
function percentwidth(elem) {
  var pa = elem.offsetParent || elem;
  return parseFloat(((elem.offsetWidth / pa.offsetWidth) * 100).toFixed(2));
}



body.onkeydown = (e) => {
  switch (e.key) {
    case " ":
      resetSliders()
      break;

    default:
      break;

  }

}


const effects = [
  (x, sl, w) => { sl.value = x },
  (x, sl, w) => { sl.value = 100 - x },

  (x, sl, w) => { sl.value = x < 50 ? Math.abs((((x / 8.05) ** 2.1405)) * Math.sin(((x - 4.405) / (4.082)))) : x },

  (x, sl, w) => {
    sl.value = x
    sl.style.transform = `scaleX(${((x) / 50) ** 7})`
  },

  (x, sl, w) => { sl.value = x; sl.style.transform = `scaleY(${((x) / 50) ** 7})` },

  (x, sl, w) => { sl.value = x; sl.style.transform = `scaleY(${((x - 50) / 50) ** 2})` },

  (x, sl, w) => {
    if (x < 50) {
      sl.value = x;
      sl.style.width = w + '%';
    } else {
      sl.value = 50; // + ((x-50)/50)*45;
      c_w = parseFloat(sl.style.width)
      console.log(c_w)
      sl.style.width = (c_w + ((x - 50) / 50)) + '%'
    }
  },

  (x, sl, w) => {
    sliders.style.left = parseFloat(x) + "%"
  },

]

function initalizeSliders() {
  for (var i = 0; i < effects.length; i++) {

    let ctrl_slider = document.createElement("input");
    let cool_slider = document.createElement("input");
    let slider_div = document.createElement("div");


    ctrl_slider.type = 'range'
    ctrl_slider.min = '1'
    ctrl_slider.max = '100'
    ctrl_slider.value= 50
    ctrl_slider.class = 'ctrl_slider'

    let func = effects[i]
    let w = percentwidth(cool_slider)


    cool_slider.type = 'range'
    cool_slider.min = '1'
    cool_slider.max = '100'
    cool_slider.value= 50
    cool_slider.class = 'cool_slider'
    cool_slider.disabled = true

    slider_div.appendChild(ctrl_slider)
    slider_div.appendChild(cool_slider)

    ctrl_slider.oninput = function (input) {
      x = input.target.value
      func(x, cool_slider, w)
    }

    func(50, cool_slider, w)

    main_slider_div.appendChild(slider_div)

  }
}



function resetSliders() {
  for (var i = 0; i < ctrl_sliders.length; i++) {

    const func = effects[i]

    ctrl_sliders[i].value = 50
    cool_sliders[i].value = 50

    func(50, cool_slider, w)

  }
}

initalizeSliders()

const ctrl_sliders = document.getElementsByClassName('ctrl_slider');
const cool_sliders = document.getElementsByClassName('cool_slider');

resetSliders()