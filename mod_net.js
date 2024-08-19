// 网络及其附属模块
function HTTPRequest(th, url, op1, op2) {
    threads.start(function() {
        let op = {
            method: "GET",
        };
        try {
            if (op1 == "b") {
                th.setAndNotify(http.request(url, op2 || op).body.bytes());
            } else if (op1 == "s") {
                th.setAndNotify(http.request(url, op2 || op).body.string());
            } else if (op1 == "j") {
                th.setAndNotify(JSON.parse(http.request(url, op2 || op).body.string()));
            } else if (op1) {
                th.setAndNotify(http.request(url, op1));
            } else {
                th.setAndNotify(http.request(url, op));
            }
        } catch (err) {
            toast("网络异常~");
            th.setAndNotify(false);
        } finally {
            return;
        }
    });
}

function updateFiles(pa) {
    threads.start(function() {
        let dir = "./update/",
            _dir = "./update/RustedWarfare-Development-Tools-main/",
            uri = "./update/RustedWarfare-Development-Tools-main.zip",
            th1 = threads.disposable(),
            boolNum = 0;
        HTTPRequest(th1, GitHubUrl, "b");
        c = th1.blockedGet();
        if (!c) return;
        files.createWithDirs(uri);
        files.writeBytes(uri, c);
        try {
            $zip.unzip(uri, dir);
        } catch (err) {
            log(err);
            toast(err)
        }
        let netVA = JSON.parse(files.read(_dir + "res/version.json")).va;
        verArray.forEach((num, index) => {
            if (num < netVA[index] || !files.exists("./ass")) {
                files.listDir(_dir, (name) => {
                    if (name == "License" || name == "README.md") return false;
                    let path = _dir + name;
                    if (files.isDir(path)) {
                        writeDirsFiles(path);
                    } else {
                        files.createWithDirs("./" + name);
                        files.write("./" + name, files.read(path));
                    }
                    return false;
                });
                toast("热更新成功，请重启应用");
                exit();
            }
        });
        pa ? toast("已经是最新版本了~") : {};
    });
}

function writeDirsFiles(pa) {
    files.listDir(pa, (name) => {
        let path = files.join(pa, name);
        if (files.isDir(path)) {
            writeDirsFiles(path);
        } else {
            files.createWithDirs("./" + path.slice(46));
            files.write("./" + path.slice(46), files.read(path));
        }
        return false;
    });
}

module.exports = {
    updateFiles,
};