const doc_ = document;

async function build() {
  const info_json = await (await fetch("/info.json")).json();

  const body = doc_?.getElementById("body");

  if (doc_ && body) {
    body.insertAdjacentHTML(
      "beforeend",
      `<div id="top"> ${gen_html("", info_json)}</div>`
    );
  }
}

let depth = 0;

const key2show = (key: string, index: number) =>
  parseInt(key) === index ? "" : key;

function gen_html(html, o: object) {
  let _html = "",
    isObj = false;
  Object.keys(o).forEach((k: string, i: number) => {
    const val = o[k],
      dk = key2show(k, i); // dk = displayed key
    switch (typeof val) {
      case "string":
        _html += `
        <a class="item ${dk}" ${
          dk === "link" ? `href=${val}` : ""
        }">${dk} - ${val}</a>`;
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
