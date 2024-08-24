importClass(android.view.View);
importClass(android.webkit.WebViewClient);
ui.statusBarColor(colors.TRANSPARENT);
const resources = context.getResources(),
    statusBarHeight = resources.getDimensionPixelSize(resources.getIdentifier('status_bar_height', 'dimen', 'android')),
    scale = resources.getDisplayMetrics().density,
    dp2px = dp => {
        return Math.floor(dp * scale + 0.5);
    },
    px2dp = px => {
        return Math.floor(px / scale + 0.5);
    };

function SystemUiVisibility(ve) {
    var option = View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | (ve ? View.SYSTEM_UI_FLAG_LAYOUT_STABLE : View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
    activity.getWindow().getDecorView().setSystemUiVisibility(option);
};
SystemUiVisibility(false);
/* 初始化部分 */

// 元数据
const uDT = "功能开发中，敬请期待！",
    GitHubUrl = "https://codeload.github.com/Delta-Water/RustedWarfare-Development-Tools/zip/refs/heads/main", //GitHub项目压缩包url
    SDDir = files.getSdcardPath() + "/",
    tooPath = "./ass/",
    verArray = JSON.parse(files.read("./res/version.json")).va, // 版本序号数组
    attArray = ["name", "type", "id", "x", "y", "width", "height"], // 数组：[必要的7个属性名称]
    attObj = { // 对象：{必要的7个属性名称, ""}
        "name": "",
        "type": "",
        "id": "",
        "x": "",
        "y": "",
        "width": "",
        "height": ""
    },
    sideViewList = [{
        title: "工具",
        icon: "@drawable/ic_dashboard_black_48dp",
        color: "#ffffff",
    }, {
        title: "社区",
        icon: "@drawable/ic_question_answer_black_48dp",
        color: "#ffffff",
    }, {
        title: "设置",
        icon: "@drawable/ic_settings_applications_black_48dp",
        color: "#ffffff",
    }, {
        title: "关于",
        icon: "@drawable/ic_info_black_48dp",
        color: "#ffffff",
    }],
    { // 网络模块
        updateFiles
    } = require("mod_net.js");
updateFiles(); // 联网检测并更新
// 普通全局变量
var themeColor = { // 绿色系
    "a": "#DCEDC8",
    "b": "#AED581",
    "c": "#43A047",
};
backPressCount = 0; // 用于记录返回键点击次数的全局变量
var backPressTimer; // 用于存储返回键点击计时器的变量
currentPage = 0;
main = ( // 定义视图XML
    <viewpager id="viewpager" bg="{{themeColor.c}}">
        <vertical id="sideView" gravity="center">
            <list id="sideViewList" layout_gravity="left">
                <horizontal bg="?selectableItemBackground" w="*">
                    <img w="50" h="50" padding="16" src="{{this.icon}}" tint="{{color}}"/>
                    <text id="t"textColor="{{color}}" textSize="16sp" text="{{this.title}}" layout_gravity="center"/>
                </horizontal>
            </list>
        </vertical>
        <card id="card">
            <frame bg="{{themeColor.b}}" paddingTop="{{statusBarHeight}}px">
                <vertical h="*" id="container">
                </vertical>
            </frame>
        </card>
    </viewpager>
);
sourcesViewXML = (
    <vertical h="*">
        <toolbar id="toolbar" title="铁锈开发助手" h="auto"/>
        <text text="工具源：" padding ="16 5"/>
        <list id="sources" spanCount="2" h="*">
            <card w="*" margin="16 5" cardCornerRadius="10" cardElevation="1" foreground="?selectableItemBackground">
                <linear gravity="vertical" bg="{{themeColor.a}}">
                    <vertical padding="10 8" layout_weight="1">
                        <text text="{{n}}" textSize="16" textColor="black" gravity="left"/>
                        <horizontal w="*">
                            <text layout_weight="1" text="{{sI}}"/>
                            <text gravity="right" text="{{v}}"/>
                        </horizontal>
                    </vertical>
                </linear>
            </card>
        </list>
    </vertical>
);
toolsViewXML = (
    <vertical h="*">
        <text text="工具：" padding ="16 5"/>
        <list id="tools" spanCount="2" h="*">
            <card w="*" margin="16 5" cardCornerRadius="10" cardElevation="1" foreground="?selectableItemBackground">
                <linear gravity="vertical" bg="{{themeColor.a}}">
                    <vertical padding="10 8" layout_weight="1">
                        <text text="{{n}}" textSize="16" textColor="black" gravity="left"/>
                        <text layout_weight="1" text="{{dI}}"/>
                    </vertical>
                </linear>
            </card>
        </list>
    </vertical>
);
webViewXML = (
    <webview id="webView" w="*" h="*" />
);
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
// UI初始化
ui.layout(main); // 显示视图
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
loadTools("sS");

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
            loadTools("sS");
        } else
        if (currentPage == 1) {
            loadTools("sS");
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
            ui.viewpager.currentItem = 1; //跳转到1号子页面
            loadTools("sS");
        }
    }
    e.consumed = true;
});

function changeToViewXML(newViewXML) {
    newView = ui.inflate(newViewXML, ui.container); // 渲染并存储了一个视图
    ui.container.removeAllViews();
    ui.container.addView(newView);
}

function loadTools(pa, pa2) {
    if (pa == "sS") { //searchSource
        let sourcesArray = [];
        files.listDir(tooPath).forEach((fileName) => {
            let _path = tooPath + fileName + "/";
            let info = JSON.parse(files.read(_path + "information.json"));
            sourcesArray.push({
                "p": _path,
                "n": info.name,
                "sI": info.simpleIntroduction,
                "dI": info.detailedIntroduction,
                "v": info.version
            });
        })
        changeToViewXML(sourcesViewXML);
        currentPage = 0;
        ui.sources.setDataSource(sourcesArray);
        ui.sources.on("item_click", (item) => {
            loadTools("sT", item.p);
        });
    } else if (pa == "sT") { //searchTools
        let toolsArray = [];
        files.listDir(pa2).forEach((fileName) => {
            let _path = pa2 + fileName + "/";
            if (files.isDir(_path)) {
                let info = JSON.parse(files.read(_path + "information.json"));
                toolsArray.push({
                    "p": _path,
                    "n": info.name,
                    "dI": info.detailedIntroduction,
                })
            }
        });
        changeToViewXML(toolsViewXML);
        currentPage = 1;
        ui.tools.setDataSource(toolsArray);
        ui.tools.on("item_click", (item) => {
            toolScript = files.read(item.p + "main.js");
            eval(toolScript);
            currentPage = 2;
        });
    }
} 
// 创建一个JavaScript函数，用于隐藏不需要的元素
var hideUnwantedContent = `

`;

ui.sideViewList.on("item_click", (item, index) => {
    if (index == 0) {
        loadTools("sS");
        ui.viewpager.currentItem = 1; //跳转到1号子页面
    } else if (index == 1) {
        currentPage = 11;
        changeToViewXML(webViewXML);
        // webViewExtend(ui.webView);
        ui.viewpager.currentItem = 1; //跳转到1号子页面
        ui.webView.loadUrl("https://github.com/Delta-Water/RustedWarfare-Development-Tools/discussions");
    } else if (index == 3) {
        dialogs.build({
                title: "关于",
                content: '开发者：DeltaWater\n自动热更新已开启\n版本号：' + verArray[0] + '.' + verArray[1] + '.' + verArray[2] + '.' + verArray[3] + "\n欢迎有一定代码基础者加入开发\n欢迎分享本工具，持续完善中",
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
                app.openUrl("https://github.com/Delta-Water/batchTriggerGenerationTool");
            })
            .show();
    }
})