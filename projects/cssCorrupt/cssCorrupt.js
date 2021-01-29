                 javascript:(function(){
                     var elems = document.body.getElementsByTagName("*"), // all elements
                         swapNodeStyle = function(sourceNode, targetNode){
                             var style1 = window.getComputedStyle(sourceNode);
                             var style2 = window.getComputedStyle(targetNode);
                             Array.from(style1).map(function (key) {
                                 return targetNode.style.setProperty(key, style1.getPropertyValue(key), style1.getPropertyPriority(key));
                             });
                             Array.from(style2).map(function (key) {
                                 return sourceNode.style.setProperty(key, style2.getPropertyValue(key), style2.getPropertyPriority(key));
                             });
                         },
                         getOne = function() {
                             return elems[Math.floor(Math.random() * elems.length)]
                         }, // gets one random html element
                         corruptMe = function() {
                             var e = getOne(), //get first class of random element
                                 s = getOne(); // get another random element
                             swapNodeStyle(e,s);
                         };
                     setInterval(
                         corruptMe, 1);
                 })()
      gradually inserts my resume into the entire page
              javascript:(function(){
                  let page = document.createElement("iframe");
                  page.src = "http://localhost:4507/projects/cssCorrupt/cssCorruptTest.html";
                  page.style.cssText = `-ms-zoom: 1.0;-moz-transform: scale(1.0);-moz-transform-origin: 0 0;-o-transform: scale(1.0);-o-transform-origin: 0 0;-webkit-transform: scale(1.0);-webkit-transform-origin: 0 0;width:auto;height:auto;zoom:60%;`
                  var page_elems = document.body.getElementsByTagName("*"), // all elements
                      toPage = function(element){
                          if(element.tagName != "IFRAME"){
                              element.parentElement.replaceChild(page.cloneNode(),element);
                          }
                      },
                      getOne = function(elems) {
                          return elems[Math.floor(Math.random() * elems.length)]
                      }, // gets one random html element
                      corruptMe = function() {
                          toPage(getOne(page_elems))
                      };
                  setInterval(
                      corruptMe, 1000);
              })()
          }
