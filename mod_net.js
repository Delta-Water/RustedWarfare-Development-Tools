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
            _dir = "./update/batchTriggerGenerationTool-main/",
            uri = "./update/batchTriggerGenerationTool-main.zip",
            th1 = threads.disposable();
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
            if (num < netVA[index]) {
                files.listDir(_dir, (name) => {
                    if (name == "License") return false;
                    if (files.isDir(_dir + name)) {
                        files.listDir(_dir + name).forEach((_name) => {
                            files.write("./" + name + "/" + _name, files.read(_dir + name + "/" + _name));
                        })
                    } else {
                        files.write("./" + name, files.read(_dir + name));
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

module.exports = {
    updateFiles,
};