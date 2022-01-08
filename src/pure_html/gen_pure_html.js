var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function build() {
    return __awaiter(this, void 0, void 0, function* () {
        const doc = document, info = yield (yield fetch("/info.json")).json(), body = doc === null || doc === void 0 ? void 0 : doc.getElementById("body");
        doc && body
            ? body.insertAdjacentHTML("beforeend", `<div id="top"> 
                                              ${gen_html("", info)}
                                            </div>`)
            : {};
    });
}
const key2show = (key, index) => parseInt(key) === index ? "" : key;
function gen_html(html, obj) {
    let _html = "";
    Object.keys(obj).forEach((key, i) => {
        const val = obj[key], disp_key = key2show(key, i); // dk = displayed key
        switch (typeof val) {
            case "string":
                _html += `<a class="item ${disp_key}" 
                     ${disp_key === "link" ? `target="_blank" rel="noopener noreferrer" href=${val}` : ""}>
                    ${disp_key} - ${val}
                  </a>`;
                break;
            case "object":
                _html += `<div class="container">
                    <p class="title ${disp_key}">
                      ${disp_key}
                    </p>
                    <div class="${disp_key}">
                      ${gen_html(_html, val)}
                    </div>
                  </div>`;
                break;
        }
    });
    return _html;
}
