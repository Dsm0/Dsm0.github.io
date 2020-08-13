async function build() {
  const doc = document
      , info = await (await fetch("/info.json")).json()
      , body = doc?.getElementById("body")
  doc && body 
    ? body.insertAdjacentHTML("beforeend", `<div id="top"> 
                                              ${gen_html("", info)}
                                            </div>`) 
    : {} 
}

const key2show = (key: string, index: number) => parseInt(key) === index ? "" : key

function gen_html(html, obj: object) {
  let _html = ""
  Object.keys(obj).forEach((key: string, i: number) => {
    const val = obj[key], disp_key = key2show(key, i) // dk = displayed key
    switch (typeof val) {
      case "string":
        _html += `<a class="item ${disp_key}" 
                     ${disp_key === "link" ? `href=${val}` : ""}">
                    ${disp_key} - ${val}
                  </a>`
        break
      case "object":
        _html += `<div class="container">
                    <p class="title ${disp_key}">
                      ${disp_key}
                    </p>
                    <div class="${disp_key}">
                      ${gen_html(_html, val)}
                    </div>
                  </div>`
        break
    }
  })
  return _html
}
