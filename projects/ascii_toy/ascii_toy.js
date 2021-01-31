const ascii_input = document.getElementById("ascii");
const render = document.getElementById("render");
const toggle = document.getElementById("toggle");

const date = new Date();
const start = date.getMilliseconds();

let time = 0.1

const width  = 50 //159
const height = 20

let line_length = 0

Array.prototype.replaceAt = function(index, replacement) {
    replacement ||= "";
    return this.subarray(0, index) + replacement + this.subarray(index + replacement.length);
}

String.prototype.replaceAt = function(index, replacement) {
    replacement ||= "";
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

render.innerHTML = [...Array(width*height).keys()].map(i =>{return "<span id='span"+i+"'></span>"}).join("")

spans = document.getElementsByTagName("span")


function parse_char(ah){
    switch(ah){
    case "b":
        return "bold";
    case "i":
        return "italic";
    case "v":
        return "invert";
    case "c":
        return "cream";
    case "s":
        return "shadow";
    case "1":
        return "size1";
    case "2":
        return "size2";
    case "3":
        return "size3";
    case "4":
        return "size2";
    case "5":
        return "size5";
    case "6":
        return "size6";
    case "7":
        return "size7";
    case "8":
        return "size8";
    case "9":
        return "size9";
    case "r":
        return "border";
    default:
        return "";
    }
}


let index = 0
let char_index = 0
let text = ascii_input.value;
let ah = ""
let classes = new Set();
let newline = false

update_render = () => {
    text = ascii_input.value;
    text_len = text.length;
    if(text){
        if((index % width) == width-1 && index>0){
            spans[index].innerText = "\n"
        } else {
            let ah = text[char_index%text_len];
            if(c = parse_char(ah)) {
                classes.add(c);
            }
            if(ah === "\\"){
                classes.clear();
				ah = " ";
			}
            spans[index].className = Array.from(classes).join(' ');
            ah ||= " ";
            spans[index].innerText = ah;
            if(!c)
                classes.clear();
            char_index = (char_index+1) % text_len;
        }
        index = (index+1) % (width*height);
    }
}

let interval = setInterval(update_render,time);
