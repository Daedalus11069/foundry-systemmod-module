const hmr = document.createElement("script");
hmr.src = "/modules/systemmod/@vite/client";
hmr.type = "module";
document.head.prepend(hmr);

const lib = document.createElement("script");
lib.src = "/modules/systemmod/src/systemmod.js";
lib.type = "module";
document.head.appendChild(lib);
