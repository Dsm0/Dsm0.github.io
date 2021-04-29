const url = "/projects/scrot_viewer/scrot_paths.txt"
const body = document.getElementById('body')

// console.log(scrot_paths);

const setimg = (path) => {
    // console.log("setimg: " + path)
    document.getElementById('preview').src = path
}

const make_folders = (folder) => {
    let maybe_folder, input, label;

    let ah = folder.children.map(child => {
        switch (child.type) {
            case "folder":
                return `
            <li>
            <input type='checkbox' id='${child.name}_input'/>
            <label for=${child.name}_input>- ${child.name}</label>
            <ul>${make_folders(child)}</ul>
            </li>
            `
                break;

            case "file":
                return `<li><a target='_blank' href='${child.path}' onmouseover="setimg('${child.path}')">- ${child.name}</a></li>`
                break;

            default:
                console.log("???")
                break;
        }
    }

    )

    return ah.join('')
}

const init = () => {
    body.insertAdjacentHTML("beforeend", `<div id="top" class="css-treeview"> 
                                              ${make_folders(scrot_paths)}
                                            </div>`)
}