// var file = "/projects/scrot_viewer/scrot_paths.txt"
// var reader = new FileReader();
// reader.onload = function(progressEvent){
//   // Entire file
//   console.log(this.result);
//   // By lines
//   var lines = this.result.split('\n');

// };
// reader.readAsDataURL(file);

const url = "/projects/scrot_viewer/scrot_paths.txt"
const tst = document.getElementById('tst')

console.log(scrot_paths);

/*
fetch(url)
    .then(r => r.text())
    .then(t => {

        let lines = t.split('\n');
        let folder, maybe_folder,input,label,folder_name;
        lines.forEach(line => {
            switch (line.split('.').pop()) {
                // cases:
                case "png":
                case "jpg":
                    let a = document.createElement("a");
                    a.href= folder + "/" + line
                    console.log("a?", a.href);
                    document.getElementById(folder + "_ul").appendChild(a);
                    break;

                // ends w/ .png or .jpg (file)

                // starts w/ ./ (new folder)
                default:
                    maybe_folder = line.split(':')[0]
                    console.log("folder?", maybe_folder);
                    if (maybe_folder != "" && maybe_folder[0]!= ".") {
                        folder = maybe_folder
                        li = document.createElement("li")
                        li.id = folder + "_li";
                        input = document.createElement("input")
                        input.type = "checkbox"
                        input.id = folder + "_input";
                        label = document.createElement("label")
                        label.for = folder
                        ul = document.createElement("ul")
                        ul.id = folder + "_ul"
                        li.appendChild(input);
                        li.appendChild(label);
                        li.appendChild(ul);
                        tst.appendChild(li);
                    }
                    // console.log("folder?", folder);
                    // doesn't start with ./ (nested folder) (could probably ignore)
                    // blank line (folder end)
                    break;
            }
        })
    }
    )
*/