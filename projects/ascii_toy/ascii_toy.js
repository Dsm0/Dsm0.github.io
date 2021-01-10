const ascii_input = document.getElementById("ascii");
const render = document.getElementById("render");
const toggle = document.getElementById("toggle");

const date = new Date();
const start = date.getMilliseconds();

let time = 0.1

const width  = 50 //159
const height = 20

let line_length = 0

let p = ("*".repeat(width-1) + "\n").repeat(height)

Array.prototype.replaceAt = function(index, replacement) {
    replacement ||= "";
    return this.subarray(0, index) + replacement + this.subarray(index + replacement.length);
}

String.prototype.replaceAt = function(index, replacement) {
    replacement ||= "";
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}


since_start = () => {
    return date.getMilliseconds() - start;
}

let index = 0
let text = ascii_input.value;
let ah = ""


update_render = () => {
    text = ascii_input.value;
    if(toggle.checked){
        if((index % width) == width-1 && index>0){
            render.innerText = render.innerText.replaceAt(index,"\n")
        } else {
            let ah = text[index % ascii_input.value.length];
            render.innerText = render.innerText.replaceAt(index,ah)
        }
        index = (index+1) % (width*height);
    }
}

let interval = setInterval(update_render,time);
