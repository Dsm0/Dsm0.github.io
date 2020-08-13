var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const doc_ = document;
function build() {
    return __awaiter(this, void 0, void 0, function* () {
        const info_json = yield (yield fetch("/info.json")).json();
        const body = doc_ === null || doc_ === void 0 ? void 0 : doc_.getElementById("body");
        if (doc_ && body) {
            body.insertAdjacentHTML("beforeend", `<div id="top"> ${gen_html("", info_json)}</div>`);
        }
    });
}
let depth = 0;
const key2show = (key, index) => parseInt(key) === index ? "" : key;
function gen_html(html, o) {
    let _html = "", isObj = false;
    Object.keys(o).forEach((k, i) => {
        const val = o[k], dk = key2show(k, i); // dk = displayed key
        switch (typeof val) {
            case "string":
                _html += `
        <a class="item ${dk}" ${dk === "link" ? `href=${val}` : ""}">${dk} - ${val}</a>`;
                break;
            case "object":
                _html += `<div class="container">
        <p class="title ${dk}">${dk}</p>
           <div class="${dk}">${gen_html(_html, val)}</div>
           </div>`;
                break;
        }
    });
    return _html;
}
