let termuxScript = `pkg update -y
`;
let termuxScript_1 = `pkg upgrade -y
`;
let termuxScript_2 = `Y
`; // UI初始化
ui.layout(main); // 显示视图
// 悬浮窗
F = new FloatingWindowControl(window, window.floatingView, functionWindow, window.move);

function hnfo(string, time) {
    let time = time ? time : 2000;
    if (F.isMini) {
        F.onLongClick();
        hnfo(string, time);
        return
    }
    string_ = string.length > 15 ? string.slice(0, 15) + "···" : string;
    window.hint_info.setText(window.hint_info.getText() == "" ? "提示：" + string_ : window.hint_info.getText() + "\n" + string_);
    hint(1, "提示：" + string, time);
}

function herror(string, time) {
    let time = time ? time : 2000;
    if (F.isMini) {
        F.onLongClick();
        herror(string, time);
        return
    }
    string_ = string.length > 15 ? string.slice(0, 15) + "···" : string;
    window.hint_error.setText(window.hint_error.getText() == "" ? "报错：" + string_ : window.hint_error.getText() + "\n" + string_);
    hint(2, "报错：" + string, time);
}

function hint(mod, string, delay) {
    if (F.isMini) {
        F.onLongClick();
        hint(string);
        return;
    }

    // 获取当前时间戳和要添加的文本
    var currentTimeStamp = getCurrentTimeStamp();
    var textToSet = window.hint.getText() + "\n" + currentTimeStamp + "/\n" + string;
    // 设置文本
    window.hint.setText(textToSet);
    // 使用post方法在UI线程中排队滚动操作
    ui.post(() => {
        // 获取ScrollView和内部文本视图的高度
        var scrollViewHeight = window.scrollView.getHeight();
        var textHeight = window.hint.getHeight();

        // 计算需要滚动到的位置
        var scrollPosition = textHeight - scrollViewHeight;

        // 使用scrollTo方法滚动到最底部
        if (scrollPosition > 0) {
            window.scrollView.scrollTo(0, scrollPosition);
        }
    });

    F.twinkle(mod, delay);
}
hint(1, "欢迎使用本助手！");
ui.viewpager.currentItem = 1; //跳转到1号子页面
ui.viewpager.overScrollMode = View.OVER_SCROLL_NEVER; //删除滑动到底的阴影
ui.sideViewList.setDataSource(sideViewList);
ui.viewpager.setPageTransformer(true, new MyPageTransform()); //设置viewpager切换动画
function MyPageTransform() {
    var mDp30 = dp2px(30);
    var mRadius = 0;
    var pageWidth;
    this.transformPage = (function(view, position) {
        pageWidth = view.getWidth();
        if (position < -1) {
            view.setAlpha(0);
        } else if (position <= 0) {
            view.setTranslationX(pageWidth * position);
        } else if (position <= 1) {
            view.setTranslationX((pageWidth * 0.6) * -position);
            view.setScaleX(1 - (0.2 * position));
            view.setScaleY(1 - (0.2 * position));
            if (mRadius != parseInt(mDp30 * position)) { //圆角切换
                ui.card.attr("cardCornerRadius", (mRadius = parseInt(mDp30 * position)) + "px");
                ui.card.attr("cardElevation", (mRadius = parseInt(mDp30 * position * 0.5)) + "px");
            };
            if (position == 1) { // 当位于左侧页面时
                currentPage = -1; // 更新当前页面状态
                ui.sideViewList.attr("w", parseInt(pageWidth * 0.5) + "px");
            };
        } else {
            view.setAlpha(0);
        }
    });
};
loadTools(0);

function acceTest() {
    threads.start(() => {
        auto.waitFor();
        ui.post(() => {
            accBool = true;
            ui.acc_text.setText("无障碍权限：授予");
        });
    });
}
ui.acc_text.on("click", () => {
    acceTest();
})
ui.emitter.on("back_pressed", (e) => {
    if (currentPage == 11) { // 如果当前页面是讨论页面
        if (ui.webView.canGoBack()) { // 如果webView可以返回
            ui.webView.goBack(); // 执行返回操作
        } else {
            // 如果webView不能返回，则返回至上一个页面
            ui.viewpager.currentItem = 0; //跳转到1号子页面
            currentPage = -1; // 更新当前页面状态
        }
    } else {
        if (currentPage == 2) {
            // loadTools("sS");
        } else
        if (currentPage == 1) {
            loadTools(0);
        } else
        if (currentPage == 0) {
            backPressCount++;
            if (backPressCount == 1) {
                toast("再按一次退出应用");
                backPressTimer = setTimeout(() => {
                    // 如果在提示后用户没有再次点击返回键，则重置点击次数
                    backPressCount = 0;
                }, 3000); // 设置3000毫秒的超时时间，即3秒
            }

            // 如果点击次数为2，则退出应用
            if (backPressCount == 2) {
                clearTimeout(backPressTimer); // 清除计时器
                exit(); // 调用退出应用的函数
            }
        } else {
            ui.viewpager.currentItem = 1;
            loadTools(0);
        }
    }
    e.consumed = true;
});

function loadTools(pa, pa2) {
    if (pa == 0) { // 加载本地工具和工具源
        if (accTestBool) {
            acceTest();
        }

        let sourcesArray = [];
        let toolsArray = [];
        files.listDir(assPath).forEach((fileName) => {
            let _path = assPath + fileName + "/";
            let info = JSON.parse(files.read(_path + "info.json"));
            sourcesArray.push({
                "p": _path,
                "n": info.name,
                "sI": info.simpleIntroduction,
                "dI": info.detailedIntroduction,
                "v": info.version
            });
            files.listDir(_path).forEach((fileName) => {
                let __path = _path + fileName + "/";
                if (files.isDir(__path)) {
                    let info = JSON.parse(files.read(__path + "info.json"));
                    toolsArray.push({
                        "p": __path,
                        "n": info.name,
                        "dI": info.detailedIntroduction,
                        "t": info.termux == true ? true : false
                    })
                }
            });
        })
        changeToViewXML(toolsViewXML);
        currentPage = 0;
        /*
        activity.setSupportActionBar(ui.toolbar);
        ui.toolsViewPager.setTitles(["工具", "仓库"]);
        ui.tabs.setupWithViewPager(ui.toolsViewPager);
        ui.sources.setDataSource(sourcesArray);
        */
        ui.tools.setDataSource(toolsArray);

        ui.tools.on("item_click", (item) => {
            if (item.t) {
                if (!T.launchTest()) return
                if (accBool != true) {
                    herror("请先行点击检测（授予）无障碍");
                    return
                }
                if (!dataBase.get("initTermuxBool", false)) {
                    hnfo("你尚未进行初始化");
                    let successStrings = [
                        ["Run 'apt list --upgradable' to see", "All packages are up to date."],
                    ];
                    hnfo("获取pkg更新信息", 4000);
                    T.sendCommandAndConfirm(termuxScript, successStrings, (id) => {
                        if (id[0] == 1) {
                            hnfo("无需更新");
                            hnfo("已完成初始化");
                            dataBase.put("initTermuxBool", true);
                            hnfo("请返回到助手执行下一步操作");
                            return
                        }
                        hnfo("即将执行pkg包更新指令，更新过程可能耗时长，请耐心等待，在下载中可以切后台去其他应用放松一下");
                        let successStrings = [
                            ["*** sources.list (Y/I/N/O/D/Z) [default=N] ?", "to remove and", ]
                        ];
                        T.sendCommandAndConfirm(termuxScript_1, successStrings, (id) => {
                            if (id[0] != 0) {
                                hnfo("完成更新");
                                hnfo("已完成初始化");
                                dataBase.put("initTermuxBool", true);
                                hnfo("请返回到助手执行下一步操作");
                                return
                            }
                            let successStrings = [
                                "*** sources.list (Y/I/N/O/D/Z) [default=N] ?Y"
                            ];
                            T.sendCommandAndConfirm(termuxScript_2, successStrings, () => {
                                hnfo("完成更新");
                                hnfo("已完成初始化");
                                dataBase.put("initTermuxBool", true);
                                hnfo("请返回到助手执行下一步操作");
                            });
                        })
                    })
                    return
                }
            }
            toolScript = files.read(item.p + "main.js");
            eval(toolScript);
            currentPage = 1;
        });
    } else if (pa == "sS") { //searchSource
    } else if (pa == "sT") { //searchTools
    }
}

ui.acc.on("check", (checked) => {
    if (checked) {
        dataBase.put("accTestBool", true)
    } else {
        dataBase.put("accTestBool", false)
    }
})
/*
// 创建一个JavaScript函数，用于隐藏不需要的元素
var hideUnwantedContent = `

`;*/
ui.sideViewList.on("item_click", (item, index) => {
    if (index == 0) {
        loadTools(0);
        ui.viewpager.currentItem = 1; //跳转到1号子页面
    } else if (index == 1) {
        currentPage = 11;

        changeToViewXML(webViewXML);
        // webViewExtend(ui.webView);
        ui.viewpager.currentItem = 1; //跳转到1号子页面
        ui.webView.loadUrl("https://github.com/Delta-Water/RustedWarfare-Development-Tools/discussions");
        var webSettings = ui.webView.getSettings();
        webSettings.setJavaScriptEnabled(true); // 启用JavaScript
        webSettings.setAllowFileAccess(true); // 允许访问文件
        webSettings.setAllowContentAccess(true); // 允许内容访问
        webSettings.setDomStorageEnabled(true); // 启用DOM存储API
        // ui.webView.loadUrl("https://github.com/Delta-Water/RustedWarfare-Development-Tools/discussions");
    } else if (index == 3) {
        dialogs.build({
                title: "关于",
                content: '开发者：DeltaWater\n自动热更新已开启\n版本号：' + vN_ + "\n欢迎有一定代码基础者加入开发\n欢迎分享本工具，持续完善中",
                positive: "分享",
                neutral: "检测更新",
                negative: "GitHub"
            })
            .on("positive", () => {
                setClip("https://wwp.lanzoup.com/iF14E25ateub");
                toast("已复制下载链接");
            })
            .on("neutral", () => {
                updateFiles(true);
            })
            .on("negative", () => {
                app.openUrl("https://github.com/Delta-Water/RustedWarfare-Development-Tools");
            })
            .show();
    }
})

// 暂时弃用代码
/*
function webViewExtend(webView) {
    webView.webViewClient = new JavaAdapter(android.webkit.WebViewClient, {
        shouldOverrideUrlLoading: function(view, url) {
            view.loadUrl(url);
            return true;
        },
        onReceivedError: function(view, errorCode, description, failingUrl) {
            // 处理错误
        },
        doUpdateVisitedHistory: function(view, url, isReload) {
            // 更新历史记录
        },
        onFormResubmission: function(view, dontResend, resend) {
            // 处理表单重新提交
        },
        onReceivedSslError: function(view, handler, error) {
            // 处理SSL错误
        },
        onScaleChanged: function(view, oldScale, newScale) {
            // 缩放变化
        },
        onUnhandledKeyEvent: function(view, event) {
            // 处理未处理的关键事件
        },
        onPageFinished: function(view, url) {
            // 页面加载完成
            // 将JavaScript函数作为参数传递给WebView的loadUrl方法
            ui.webView.loadUrl("javascript:(function(){" + hideUnwantedContent + "})()"); 
        },
        onPageStarted: function(view, url, favicon) {
            // 页面开始加载
        }, 

// 为悬浮窗和ScrollView设置触摸事件监听器
floatingView.setOnTouchListener(new android.view.View.OnTouchListener(onTouch));
scrollView.setOnTouchListener(new android.view.View.OnTouchListener(onTouch));

// 为ScrollView内的按钮设置点击事件监听器
mainWindow.button1.on("click", function() {
    // 这里是按钮1点击事件的处理逻辑
    toast("按钮1被点击");
});
mainWindow.button2.on("click", function() {
    // 这里是按钮2点击事件的处理逻辑
    toast("按钮2被点击");
});

// 设置悬浮窗的位置
mainWindow.setPosition(0, 0);
 
        onReceivedHttpAuthRequest: function(view, handler, host, realm) {
            // 接收HTTP身份验证请求
        },
        shouldOverrideKeyEvent: function(view, event) {
            // 是否覆盖关键事件
        },
        onUnhandledInputEvent: function(view, event) {
            // 处理未处理的输入事件
        },
        onReceivedLoginRequest: function(view, realm, account, args) {
            // 接收登录请求
        }
    });
}*/