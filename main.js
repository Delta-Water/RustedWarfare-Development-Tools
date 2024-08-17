"ui";
/*
threads.start(function() {
    console.show();
});*/
try {
    coreScript = files.read("./mod_core.js");
    eval(coreScript);
} catch (err) {
    console.error(err);
}