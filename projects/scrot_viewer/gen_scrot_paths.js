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
fetch(url)
    .then(r => r.text())
    .then(t => {

        let lines = t.split('\n');
        let folder;
        lines.forEach(line => {
            switch (line.split('.').pop()) {
                // cases:
                case "png":
                case "jpg":
                    let img = document.createElement("img");
                    img.src = folder + "/" + line
                    console.log(img.src);
                    document.getElementById('tst').appendChild(img);
                    break;

                // ends w/ .png or .jpg (file)

                // starts w/ ./ (new folder)
                default:
                    folder = line.split(':')[0]
                    console.log("folder?", folder);
                    // doesn't start with ./ (nested folder) (could probably ignore)
                    // blank line (folder end)
                    break;
            }
        })
    }
    )


