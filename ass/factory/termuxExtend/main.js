/*
城夺触发自动生成工具
元信息：
    1.开源库主页：https://github.com/exgcdwu/Rusted-Warfare-map-editor-for-city-occupation-play-/blob/main
    2.UI说明：
        A.第一步：
        a.选择版本（下拉菜单）
        b.输入地图文件的地址（输入框；读取和保存）
        c.其他参数选择（下拉菜单）
    B.第二步：
        a.程序自动启动termux，弹出悬浮窗
        b.程序自动设置代码
        c.用户按回车即可
        d.获取终端输出的信息，判断下一步操作？（计划中）
    C.第三步？（计划中）：
        a.其他地图操作的代码辅助构造
*/

// 城夺触发自动生成工具的UI和逻辑
// XML布局定义
let cityOccupationView = (
    <frame h="*">
        <appbar h="auto" bg="{{themeColor.b}}">
            <toolbar id="toolbar" title="城夺触发自动生成工具" />
        </appbar>
        <vertical margin="16" layout_gravity="center" gravity="center">
            <input id="input_1" hint="地图文件读取路径" />
            <input id="input_2" hint="地图文件保存路径" />
            <checkbox id="cb_1" text="-r：选择进行id的重置" />
            <radiogroup id="ra">
                <radio id="ra_0" text="-d：删除决定去掉的标记宾语/info宾语" />
                <radio id="ra_1" text="-D：发布地图" checked="true" />
                <radio id="ra_2" text="--DeleteAll：取消使用该宾语格式" />
            </radiogroup>
            <checkbox id="cb_2" text="--resetid：将宾语ID重置为自然数列" />
            <checkbox id="cb_3" text="-v：显示运行信息" />
            <checkbox id="cb_4" text="-c：其他宾语也可以使用引用来获得参数" checked="true" />
            <button id="button_1" text="执行" />
        </vertical>
    </frame>
);

let paraArray = { // 参数数组，用于存储用户选择的参数
    "-r": false,
    "Delete": ["-d", "-D", "--DeleteAll", 1], // 数组中的第四个元素用于存储用户选择的索引
    "--resetid": false,
    "-v": false,
    "-c": true
};
let inin = false;

let cityScript = `
pkg install -y python
pkg install -y python-numpy
pkg install -y python-pillow
`;
let cityScript_ = `
pip install asteval
pip install rwmapeditor-exgcdwu --no-deps
`;
let storageScript = `
termux-setup-storage
`;
let storageScript_ = `y
`;
// 切换到定义的UI视图
changeToViewXML(cityOccupationView);
if (!dataBase.get("hasCity", false)) {
    let successStrings = [
        ['Setting up python', 'python is already the newest version'],
        ['Setting up python-numpy', 'python-numpy is already the newest version'],
        ['Setting up python-pillow', 'python-pillow is already the newest version']
    ];
    hnfo("下载python和依赖项");
    T.sendCommandAndConfirm(cityScript, successStrings, () => {
        let successStrings = [
            ['Successfully installed asteval', 'Requirement already satisfied: asteval'],
            ['Successfully installed rwmapeditor-exgcdwu', 'Requirement already satisfied: rwmapeditor-exgcdwu']
        ];
        hnfo("下载rwmapeditor-exgcdwu库和依赖项");
        T.sendCommandAndConfirm(cityScript_, successStrings, () => {
            hnfo("已完成初始化");
            dataBase.put("hasCity", true);
            hnfo("请返回到助手执行下一步操作");
        })
    })
} else {
    init();
}

function init() {
    hnfo("请求储存权限");
    let successStrings = [
        "content IS NOT going to be deleted."
    ]
    T.sendCommandAndConfirm(storageScript, successStrings, () => {
        let successStrings = [
            "Do you want to continue? (y/n) y"
        ]
        T.sendCommandAndConfirm(storageScript_, successStrings, () => {
            hnfo("请求储存权限成功");
            hnfo("请返回到助手执行下一步操作");
            inin = true
        })
    })
}
/*
        'Collecting asteval',
        'Collecting regex',
        'Collecting rwmapeditor-exgcdwu',
        'Storage is set up and can be accessed'*/
// 绑定按钮点击事件
ui.button_1.on("click", generateCommand);

// 绑定复选框和单选按钮的变更事件
ui.cb_1.on("check", (checked) => {
    paraArray["-r"] = checked;
});

ui.ra_0.on("check", (checked) => {
    if (checked) paraArray["Delete"][3] = 0;
});

ui.ra_1.on("check", (checked) => {
    if (checked) paraArray["Delete"][3] = 1;
});

ui.ra_2.on("check", (checked) => {
    if (checked) paraArray["Delete"][3] = 2;
});

ui.cb_2.on("check", (checked) => {
    paraArray["--resetid"] = checked;
});

ui.cb_3.on("check", (checked) => {
    paraArray["-v"] = checked;
});

ui.cb_4.on("check", (checked) => {
    paraArray["-c"] = checked;
});

// 生成命令的函数
function generateCommand() {
    // 这里应该实现生成命令的逻辑
    // 例如，构建一个命令字符串
    let command = [];

    // 根据paraArray中的值构建命令
    if (paraArray["-r"]) command.push("-r");

    // 添加删除相关的选项
    command.push(paraArray["Delete"][paraArray["Delete"][3]]);

    if (paraArray["--resetid"]) command.push("--resetid");
    if (paraArray["-v"]) command.push("-v");
    if (paraArray["-c"]) command.push("-c");

    // 获取输入框中的路径
    let readPath = ui.input_1.text();
    let savePath = ui.input_2.text();

    // 将命令数组转换为字符串
    let command_a = `triggerauto ${readPath} -o ${savePath}
    `,
        command_b = command.join(" ") != "" ? " " + command.join(" ") : "",
        finalCommand = command_a + command_b;

    // 调用termux类
    if (inin) {
        T.sendCommandAndConfirm(finalCommand);
    } else {
        init();
    }
}