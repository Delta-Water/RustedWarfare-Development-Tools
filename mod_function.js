/*
功能：
    1.创建一个悬浮窗用于在termux上方悬停供用户交互
    2.提供若干个对话框供用户输入参数等
实现：
    1.原理：通过无障碍权限获取屏幕上的控件信息并操控和设置控件
    2.对于本工具：设置输入框中的内容为用户需要的代码，并获取termux返回的信息判断操作是否成功等
    3.补充：很明显，需要用户给予无障碍权限，可能会带来不够方便的使用体验
开发：
    开发者: DeltaWater
    联系方式: 3627371741@qq.com
    个人主页：https://github.com/Delta-Water
*/
// 导入需要的模块
// const app = require('app');
// const floaty = require('floaty');
// const dialogs = require('dialogs');
// const automator = require('automator');
// const ui = require('ui');
// Termux交互模块
function Termux() {
    this.isListening = false;

    this.launchTest = function() {
        if (!app.getAppName("com.termux")) {
            herror("未找到Termux");
            return false;
        }
        return true
    }

    // 启动Termux应用
    this.launch = function() {
        if (!app.launchPackage("com.termux")) {
            herror("无法启动Termux");
            return false;
        }
        return true
    }
    // 监听Termux的输出
    this.listenToCallBack = function(successStrings, callBack) {
        let text = "";
        let successID = [];
        let strings = "";
        let passString = Math.random().toString().slice(2, 8);
        successStrings.forEach((string) => {
            // if (Array.isArray(string) 
            strings += "\n" + string;
        });
        if (this.isListening) {
            this.isListening = false; // 停止监听
            clearInterval(this.listenInterval); // 清除定时器
            this.listenInterval = null;
            hnfo("开始新的监听");
        }
        this.listenInterval = setInterval(() => {
            let terminalView = id("terminal_view").findOnce();
            if (terminalView) {
                if (!this.isListening) {
                    hnfo("开始寻找标识：\n" + strings.trim() + passString);
                    this.isListening = true;
                }
                text += terminalView.getContentDescription();
                if (text.length > 999999) text = text.slice(-99999);
                let allSuccessStringsFound = successStrings.every((successString) => {
                    if (typeof successString === "string") {
                        successID.push(0);
                        return text.includes(successString);
                    } else if (Array.isArray(successString)) {
                        // 如果是数组，检查是否至少有一个字符串包含在 text 中
                        return successString.some((value) => {
                            if (text.includes(value)) {
                                successID.push(successString.indexOf(value));
                                return true
                            }
                        });
                    }
                    // 如果既不是字符串也不是数组，则返回 false
                    return false;
                });
                if (this.isListening && text.includes(passString) || allSuccessStringsFound) {
                    this.isListening = false; // 停止监听
                    clearInterval(this.listenInterval); // 清除定时器
                    this.listenInterval = null;
                    hnfo("所有标识已识别");
                    callBack(successID);
                }
            } else if (this.isListening) {
                herror("检测到离开termux\n请记得不定时切回以确认完成情况\n程序需要查看输出以确定执行结果");
                this.isListening = false;
            }
        }, 1000); // 每隔1秒检查一次
    }

    // 将Termux输入框的文本设置为命令，并开始监听终端输出
    this.sendCommandAndConfirm = function(command, successStrings, callBack) {
        // 确保Termux已经启动
        if (!this.launch()) return;

        // 尝试查找Termux输入框，最多尝试3次
        let attempts = 3;
        this.findInterval = setInterval(() => {
            let inputView = id("terminal_toolbar_text_input").findOnce();
            if (inputView) {
                clearInterval(this.findInterval); // 退出脚本后清除定时器
                this.findInterval = null;
                id("terminal_toolbar_view_pager").findOne().scrollForward();
                inputView.setText(command);
                inputView.click();
                hnfo("请点击发送/回车以执行");
                this.listenToCallBack(successStrings ? successStrings : [], callBack ? callBack : () => {})
            } else {
                // 如果没有找到输入框，减少尝试次数并重新设置定时器
                herror("未找到Termux输入框，尝试重新查找");
                attempts--;
                if (attempts === 0) {
                    clearInterval(this.findInterval); // 退出脚本后清除定时器
                    this.findInterval = null;
                    herror("未能找到Termux输入框，无法执行命令");
                    return false;
                }
            }
        }, 1000); // 每隔1秒检查一次
    }
}

// 悬浮窗控制类
function FloatingWindowControl(window, floatingView, functionView, moveableView) {
    this.window = window;
    this.floatingView = floatingView;
    this.functionView = functionView;
    this.moveableView = moveableView;
    this.touchDownX = 0;
    this.touchDownY = 0;
    this.windowX = 0;
    this.windowY = 0;
    this.isMini = false;
    this.isMoving = false;
    this.longClickTimeout = null;
    this.longClickThreshold = 500; // 长按阈值，单位毫秒

    this.init();
}

FloatingWindowControl.prototype.init = function() { // initial start
    this.window.setPosition(0, 0);
    changeToViewXML(this.functionView, this.window.floatingFunctionView);

    // 设置触摸事件监听器
    this.moveableView.setOnTouchListener(new android.view.View.OnTouchListener(this.touchListener.bind(this)));
    this.window.scrollView.setOnTouchListener(new android.view.View.OnTouchListener(this.touchAndScrollListener.bind(this)));

    // 设置透明度
    this.window.move.setAlpha(0.5);
    this.window.floatingFunctionView.setAlpha(0.5);
    this.updateWindowSize(); // 更新大小数值
};

FloatingWindowControl.prototype.updateWindowSize = function() {
    ui.post(() => {
        this.windowWidth = this.floatingView.getWidth();
        this.windowHeight = this.floatingView.getHeight();
    })
};

FloatingWindowControl.prototype.touchAndScrollListener = function(view, event) {
    switch (event.getAction()) {
        case event.ACTION_DOWN:
            // 触摸时设置alpha为1
            this.window.floatingFunctionView.setAlpha(1);
            break;
        case event.ACTION_MOVE:
            // 滑动时保持alpha为1
            this.window.floatingFunctionView.setAlpha(1);
            break;
        case event.ACTION_UP:
            // this.window.floatingFunctionView.setAlpha(0.5);
            // break;
        case event.ACTION_CANCEL:
            // 松手或取消时恢复到初始透明度
            if (!this.popInterval_1 && !this.popInterval_2) {
                this.window.floatingFunctionView.setAlpha(0.5);
            }
            break;
    }
    // 返回true以允许事件继续传递给其他控件
    return false;
}

FloatingWindowControl.prototype.touchListener = function(view, event) {
    switch (event.getAction()) {
        case event.ACTION_DOWN:
            this.updateWindowSize();
            this.touchDownX = event.getRawX();
            this.touchDownY = event.getRawY();
            this.windowX = this.window.getX();
            this.windowY = this.window.getY();
            this.isMoving = false;
            this.startLongClickTimer();
            this.window.floatingFunctionView.setAlpha(1);
            break;
        case event.ACTION_MOVE:
            let dx = event.getRawX() - this.touchDownX;
            let dy = event.getRawY() - this.touchDownY;
            // 只有当移动距离超过阈值时才视为移动操作
            if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                this.isMoving = true;
                this.cancelLongClickTimer();
                // 计算新的位置，并进行边界检查
                let newX = Math.max(0, Math.min(this.windowX + dx, device.width - this.windowWidth));
                let newY = Math.max(0, Math.min(this.windowY + dy, device.height - this.windowHeight));
                this.window.setPosition(newX, newY);
            }
            break;
        case event.ACTION_UP:
            this.cancelLongClickTimer();
            if (!this.isMoving) {
                // this.toggleEdge();
            }
            this.toggleEdge();
            this.isMoving = false;
            if (!this.popInterval_1 && !this.popInterval_2) {
                this.window.floatingFunctionView.setAlpha(0.5);
            }
            break;
    }
    return true;
};

FloatingWindowControl.prototype.startLongClickTimer = function() {
    this.longClickTimeout = setTimeout(() => {
        this.onLongClick();
    }, this.longClickThreshold);
};

FloatingWindowControl.prototype.cancelLongClickTimer = function() {
    if (this.longClickTimeout) {
        clearTimeout(this.longClickTimeout);
        this.longClickTimeout = null;
    }
};

FloatingWindowControl.prototype.onLongClick = function() {
    this.updateWindowSize();
    // 长按切换形态
    if (this.isMini) {
        changeToViewXML(this.functionView, this.window.floatingFunctionView);
        this.window.hint.setText(dataBase.get("terminalText"));
        this.window.scrollView.setOnTouchListener(new android.view.View.OnTouchListener(this.touchAndScrollListener.bind(this)));
        ui.post(() => {
            var scrollViewHeight = this.window.scrollView.getHeight();
            var textHeight = this.window.hint.getHeight();

            var scrollPosition = textHeight - scrollViewHeight;

            if (scrollPosition > 0) {
                this.window.scrollView.scrollTo(0, scrollPosition);
            }
        });
        this.isMini = false;
        this.toggleEdge();
    } else {
        dataBase.put("terminalText", window.hint.getText());
        changeToViewXML(null, this.window.floatingFunctionView);
        this.isMini = true;
        this.toggleEdge();
    }
};

FloatingWindowControl.prototype.toggleEdge = function() {
    this.updateWindowSize();
    let toEdge = this.getMinimizePosition();
    this.animateWindow(toEdge);
};

FloatingWindowControl.prototype.getMinimizePosition = function() {
    // 计算最小化位置
    this.updateWindowSize();
    let edgeX = 0; // this.window.getX() + this.windowWidth / 2 < device.width / 2 ? 0 : device.width - this.windowWidth;
    return [edgeX, this.window.getY()];
};

FloatingWindowControl.prototype.animateWindow = function(position) {
    let toX = position[0];
    let toY = position[1];
    let fromX = this.window.getX();
    let fromY = this.window.getY();
    let steps = 10;
    let stepX = (toX - fromX) / steps;
    let stepY = (toY - fromY) / steps;
    // 定义动画步骤的执行函数
    let step = (i) => {
        if (i < steps) {
            let currentX = fromX + stepX * i;
            let currentY = fromY + stepY * i;
            this.window.setPosition(currentX, currentY);
            setTimeout(() => step(i + 1), 10);
        } else {
            this.window.setPosition(toX, toY);
        }
    };
    step(0);
};
/*
FloatingWindowControl.prototype.twinkle = function() {
    let i = 0;
    // 清除任何现有的动画定时器
    if (this.twinkleInterval) clearInterval(this.twinkleInterval);
    this.twinkleInterval = setInterval(() => {
        // 获取当前alpha值
        const currentAlpha = this.window.move.alpha;
        // 设置目标alpha值
        const targetAlpha = currentAlpha === 1 ? 0.5 : 1;
        this.window.move.setAlpha(targetAlpha);
        i++
        // 检查动画是否完成
        if (i > 2 && currentAlpha == 1) {
            clearInterval(this.twinkleInterval);
            window.hint_info.setText("");
            window.hint_error.setText("");
        }
    }, 800);
}
*/

FloatingWindowControl.prototype.twinkle = function(mod, time) {
    let time = time ? time : 2000;
    this.window.floatingFunctionView.setAlpha(1);
    if (mod == 1 && !this.popInterval_1) {
        this.popInterval_1 = setInterval(() => {
            if (this.isMini) {
                clearInterval(this.popInterval_1);
                return;
            }
            let text = window.hint_info.getText();
            if (text === "") {
                clearInterval(this.popInterval_1);
                this.popInterval_1 = null;
                if (!this.popInterval_1 && !this.popInterval_2) {
                    this.window.floatingFunctionView.setAlpha(0.5);
                }
                return;
            }
            ui.post(() => {
                this.window.floatingFunctionView.setAlpha(1);
                window.hint_info.setText(text.slice(1));
            })
        }, 100)
    } else if (mod == 2 && !this.popInterval_2) {
        this.popInterval_2 = setInterval(() => {
            if (this.isMini) {
                clearInterval(this.popInterval_2);
                return;
            }
            let text = window.hint_error.getText();
            if (text === "") {
                clearInterval(this.popInterval_2);
                this.popInterval_2 = null;
                if (!this.popInterval_1 && !this.popInterval_2) {
                    this.window.floatingFunctionView.setAlpha(0.5);
                }
                return;
            }
            ui.post(() => {
                this.window.floatingFunctionView.setAlpha(1);
                window.hint_error.setText(text.slice(1));
            })
        }, 100)
    }
}

function changeToViewXML(newViewXML, oldView) {
    if (!newViewXML) {
        oldView.removeAllViews();
        return;
    }
    let newView = ui.inflate(newViewXML, ui.container); // 渲染并存储了一个视图
    if (!oldView) {
        ui.container.removeAllViews();
        ui.container.addView(newView);
    } else {
        oldView.removeAllViews();
        oldView.addView(newView);
    }
}

// 导出模块
module.exports = {
    Termux,
    FloatingWindowControl,
    changeToViewXML,
};

/*
// 弃之不用的termux intent调用
function termuxExecute() {
    // 能够定义全部可选参数的执行器
    this.execute = function(command, options) {
        options = options || {};
        let arguments = options.arguments || [],
            workingDirectory = options.workingDirectory || "./",
            environment = options.environment || {},
            useTerminal = options.useTerminal || false,
            timeout = options.timeout || 10000,
            errorMessage = options.errorMessage || "",
            successMessage = options.successMessage || "",
            resultMessage = options.resultMessage || "",
            isDetached = options.isDetached || false,
            redirectStdin = options.redirectStdin || false,
            redirectStdout = options.redirectStdout || false,
            redirectStderr = options.redirectStderr || false;
        // 创建Intent对象
        app.sendBroadcast({
            action: "com.termux.service_termsu.Execute", // Termux的执行命令的Action
            extras: {
                command: command, // 要执行的命令
                arguments: arguments, // 命令的参数数组
                workingDirectory: workingDirectory, // 工作目录
                environment: environment, // 环境变量
                useTerminal: useTerminal, // 使用Termux的终端
                timeout: timeout, // 命令的超时时间（毫秒）
                errorMessage: errorMessage,
                successMessage: successMessage,
                resultMessage: resultMessage,
                isDetached: isDetached, // 是否将命令作为独立进程执行
                redirectStdin: redirectStdin, // 是否将标准输入重定向到命令
                redirectStdout: redirectStdout, // 是否将标准输出重定向到命令
                redirectStderr: redirectStderr, // 是否将标准错误重定向到命令
            }
        });
    }
}

termux = new termuxExecute();
command = "echo 'Hello from Termux via Auto.js' > /storage/emulated/0/Documents/test.txt";
termux.execute(command, options);
*/