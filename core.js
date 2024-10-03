"ui";
dataBase = storages.create("aj.rw.ass@3627371741@qq.com");
//storages.remove("aj.rw.ass@3627371741@qq.com");
accTestBool = dataBase.get("accTestBool", false);

function getCurrentTimeStamp() {
    var now = new Date();
    var year = now.getFullYear();
    var month = (now.getMonth() + 1).toString().padStart(2, '0');
    var date = now.getDate().toString().padStart(2, '0');
    var hours = now.getHours().toString().padStart(2, '0');
    var minutes = now.getMinutes().toString().padStart(2, '0');
    var seconds = now.getSeconds().toString().padStart(2, '0');
    return year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
}

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
    assPath = "./ass/",
    vN = JSON.parse(files.read("./res/version.json")).vn, // 版本序号数组
    vN_ = JSON.parse(files.read("./res/version.json")).vn_, // 版本序号数组
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
    { // 其他模块
        Termux,
        FloatingWindowControl,
        changeToViewXML
    } = require("mod_function.js"),
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
T = new Termux();
interval = false;
backPressCount = 0; // 用于记录返回键点击次数的全局变量
var backPressTimer; // 用于存储返回键点击计时器的变量
currentPage = 0;
accBool = false;
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
toolsViewXML = (
    <vertical h="*">
        <appbar h="auto" bg="{{themeColor.b}}">
            <toolbar id="toolbar" title="铁锈开发助手"/>
        </appbar>
        <vertical h="*" >
            <list id="tools" h="*" paddingTop="8" >
                <card w="*" margin="16 8" cardCornerRadius="10" cardElevation="1" foreground="?selectableItemBackground">
                    <linear gravity="vertical" bg="{{themeColor.a}}">
                        <vertical padding="10 8" layout_weight="1">
                            <text text="{{n}}" textSize="16" textColor="black" gravity="left"/>
                            <text layout_weight="1" text="{{dI}}"/>
                        </vertical>
                    </linear>
                </card>
            </list>
        </vertical>
    </vertical>
);
settingXML = (
    <vertical>
        <toolbar id="toolbar" title="设置"/>
        <text text="- 权限 -" color="white" textSize="16" gravity="center" margin="10" />
        <vertical padding="10 8">
            <checkbox id="acc" text="启动时自检权限" checked="{{accTestBool}}"/>
            <text text="进入工具页面时自动检测无障碍权限授予情况；若没有授予则自动跳转到无障碍设置（若需要使用termux相关的功能则建议勾选）" />
            <text id="acc_text" color="white" margin="8" />
        </vertical>
    </vertical>
)
webViewXML = (
    <webview id="webView" w="*" h="*" />
);
// 创建悬浮窗UI
window = floaty.window(
    <vertical id="floatingView" w="*" >
        <horizontal>
            <img id="move" w="48" h="48" src="file://./res/logo.png" />
        </horizontal>
        <frame id="floatingFunctionView">
        </frame>
    </vertical>
);
functionWindow = (
    <card cardCornerRadius="10" cardElevation="1" foreground="?selectableItemBackground" w="auto" >
        <vertical>
            <vertical bg="#ffffff00">
                <text id="hint_info" text="" color="blue"/>
                <text id="hint_error" text="" color="red" />
            </vertical>
            <ScrollView id="scrollView" h="80" bg="#ffffff">
                <text id="hint" text="" color="black" />
            </ScrollView>
        </vertical>
    </card>
);
/*
            <vertical h="*">
                <list id="sources" spanCount="2" h="*">
                    <card w="*" margin="16 8" cardCornerRadius="10" cardElevation="1" foreground="?selectableItemBackground">
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
*/
/*
try {
    let uri = SDDir + "Documents/Trigger/.Log/",
        uri_ = uri + "/" + getCurrentTimeStamp() + ".txt";
    files.createWithDirs(uri_);
    console.setGlobalLogConfig({
        "file": uri_
    });
    let coreScript = files.read("./mod_core.js");
    eval(coreScript);
} catch (err) {
    console.error(err);
}
*/
let coreScript = files.read("./mod_main.js");
eval(coreScript);