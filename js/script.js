
var cur_scan_id;
var rtc_connect = 0;
var tem_mes, pm_mes;
$(function () {

    // getConnect();

    // 输入id key 确认按钮
    $("#idkeyInput").click(function () {
        config["id"] = $("#id").val();
        config["key"] = $("#key").val();
        config["server"] = $("#server").val();
        // 本地存储id、key和server
        storeStorage();
        if (!rtc_connect)
            getConnect();
        else
            rtc.disconnect();
    });
    //输入mac确认按钮
    $("#macInput").click(function () {
        if ($(this).text() == "确认") {
            $(this).text("取消").addClass("btn-danger");
            $("#Sensor_A").attr('disabled', true);
            $("#Sensor_B").attr('disabled', true);
            $("#Sensor_C").attr('disabled', true);
        } else {
            $(this).text("确认").removeClass("btn-danger");
            $("#Sensor_A").removeAttr('disabled');
            $("#Sensor_B").removeAttr('disabled');
            $("#Sensor_C").removeAttr('disabled');
        }
        config['Sensor_A'] = $('#Sensor_A').val();
        config['Sensor_B'] = $('#Sensor_B').val();
        config['Sensor_C'] = $('#Sensor_C').val();
        storeStorage();
        rtc.sendMessage(config['Sensor_A'], sensor.all);
        rtc.sendMessage(config['Sensor_B'], sensor.all);
        rtc.sendMessage(config['Sensor_C'], sensor.all);
    });
    function getConnect() {
        config["id"] = config["id"] ? config["id"] : $("#id").val();
        config["key"] = config["key"] ? config["key"] : $("#key").val();
        config["server"] = config["server"] ? config["server"] : $("#server").val();
        config["Sensor_A"] = config["Sensor_A"] ? config["Sensor_A"] : $("#Sensor_A").val();
        config["Sensor_B"] = config["Sensor_B"] ? config["Sensor_B"] : $("#Sensor_B").val();
        config["Sensor_C"] = config["Sensor_C"] ? config["Sensor_C"] : $("#Sensor_C").val();
        console.log(config);
        // 创建数据连接服务对象
        rtc = new WSNRTConnect(config["id"], config["key"]);
        rtc.setServerAddr(config["server"] + ":28080");
        rtc.connect();
        rtc_connect = false;

        // 连接成功回调函数
        rtc.onConnect = function () {
            $("#ConnectState").text("数据服务连接成功！");
            rtc_connect = 1;
            rtc.sendMessage(config.Sensor_A, sensor.all);
            rtc.sendMessage(config.Sensor_B, sensor.all);
            rtc.sendMessage(config.Sensor_C, sensor.all);
            message_show("数据服务连接成功！");
            $("#idkeyInput").text("断开").addClass("btn-danger");
            $("#id,#key,#server").attr('disabled', true)
        };

        // 数据服务掉线回调函数
        rtc.onConnectLost = function () {
            rtc_connect = 0;
            $("#ConnectState").text("数据服务连接掉线！");
            $("#idkeyInput").text("连接").removeClass("btn-danger");
            message_show("数据服务连接失败，检查网络或IDKEY");
            $(".online_Sensor_A").text("离线").css("color", "#e75d59");
            $(".online_Sensor_B").text("离线").css("color", "#e75d59");
            $(".online_Sensor_C").text("离线").css("color", "#e75d59");
            $("#id,#key,#server").removeAttr('disabled')
        };

        // 消息处理回调函数
        rtc.onmessageArrive = function (mac, dat) {
            //console.log(mac+" >>> "+dat);
            if (dat[0] == '{' && dat[dat.length - 1] == '}') {
                dat = dat.substr(1, dat.length - 2);
                var its = dat.split(',');
                for (var x in its) {
                    var t = its[x].split('=');
                    if (t.length != 2) continue;
                    if (config['Sensor_A'] == mac) {
                        $(".online_Sensor_A").text("在线").css("color", "#96ba5c");
                        if (t[0] == sensor.tem.tag) {
                            console.log(t[1]);
                            tem_mes = t[1];
                            thermometer("temp", "℃", "100%", "100%", "#e47e77", -20, 100, t[1]);
                            if (config["Sensor_B"] != "" && config.curMode == "auto-mode") {
                                // 温度超过较大值，开启警报
                                if (t[1] > config["Tem_cur_min"]) {
                                    //引发报警
                                    checkOnAlarm();
                                    message_show("阈值超限，警报开启！");
                                }
                                else if (t[1] < config["Tem_cur_min"] && pm_mes < config["Air_cur_min"]) {
                                    checkCloseAlarm();
                                }
                            }
                        }
                        if (t[0] == sensor.PM.tag) {
                            console.log(t[1]);
                            pm_mes = t[1];
                            thermometer("pm", "μg/m3", "100%", "100%", "#229", 0, 200, t[1]);
                            if (config["Sensor_B"] != "" && config.curMode == "auto-mode") {
                                // 空气质量超过较大值，开启警报
                                if (t[1] > config["Air_cur_min"]) {
                                    //引发报警
                                    checkOnAlarm();
                                    message_show("阈值超限，警报开启！");
                                }
                                else if (t[1] < config["Air_cur_min"] && tem_mes < config["Tem_cur_min"]) {
                                    checkCloseAlarm();
                                }
                            }
                        }
                    }
                    if (config['Sensor_B'] == mac) {
                        $(".online_Sensor_B").text("在线").css("color", "#96ba5c");
                        if (t[0] == sensor.switch.tag) {
                            console.log(t[1]);
                        }
                    }
                    if (config['Sensor_C'] == mac) {
                        $(".online_Sensor_C").text("在线").css("color", "#96ba5c");
                        if (t[0] == sensor.PM.tag && config["Sensor_C"] != "" && config.curMode == "auto-mode") {
                            console.log(t[1]);
                            if (t[1] == 1) {
                                $("#fireStatus").addClass("fire-on");
                                $("#fire-text").text("检测到火焰");
                                //引发报警
                                checkOnAlarm();
                            }
                            else if (t[1] == 0) {
                                $("#fireStatus").removeClass("fire-on");
                                $("#fire-text").text("正常");
                                if (tem_mes < config["Tem_cur_min"] && pm_mes < config["Air_cur_min"]) {
                                    checkCloseAlarm();
                                }
                            }
                            state.fire = t[1];
                        }
                    }
                }
            }
        }
    }
    var home = function () { }
    // 定义路由
    var routes = {
        '/home/main': home,
        '/set/IDKEY': home,
        '/set/MAC': home,
        '/set/about': home,
    };
    var router = Router(routes);
    router.configure({ on: checkDom });
    router.init();

    loadFirstPage();

    // 获取本地存储的id key server等
    get_localStorage();

    // 场景页面-控制器弹窗设置滑块
    $('#nstSliderS').nstSlider({
        "left_grip_selector": "#leftGripS",
        "value_bar_selector": "#barS",
        "value_changed_callback": function (cause, leftValue, rightValue) {
            var $container = $(this).parent(),
                g = 255 - 127 + leftValue,
                r = 255 - g,
                b = 0;
            $container.find('#leftLabelS').text(rightValue);
            $container.find('#rightLabelS').text(leftValue);
            $(this).find('#barS').css('background', 'rgb(' + [r, g, b].join(',') + ')');
            console.log("空气质量阈值更新：" + leftValue);
            config["Air_cur_min"] = leftValue;
            storeStorage();
        },
        // "user_mouseup_callback": function (leftValue) {

        //     console.log("PM阈值更新：" + leftValue);

        //     config["Air_cur_min"] = leftValue;
        //     storeStorage();
        //     rtc.sendMessage(config['Sensor_A'], sensor.PM.query);
        //     console.log("pm");
        // }
    });
    //温度阀值
    $('#nstSliderS2').nstSlider({
        "left_grip_selector": "#leftGripS2",
        "value_bar_selector": "#barS2",
        "value_changed_callback": function (cause, leftValue, rightValue) {
            var $container = $(this).parent(),
                g = 255 - 0 + leftValue,
                r = 255 - g,
                b = 0;
            $container.find('#leftLabelS2').text(rightValue);
            $container.find('#rightLabelS2').text(leftValue);
            $(this).find('#barS2').css('background', 'rgb(' + [r, g, b].join(',') + ')');
            console.log("温度阈值更新：" + leftValue);
            config["Tem_cur_min"] = leftValue;
            storeStorage();
        },
        // "user_mouseup_callback": function (vmax1) {

        //     console.log("阈值更新：" + vmax1);

        //     config["Tem_cur_min"] =vmax1;
        //     storeStorage();
        //     // rtc.sendMessage(config['Sensor_A'], sensor.tem.query);
        //     console.log("tem");
        // }
    });

    $('#nstSliderS').on("click touchend", function () {
        if (rtc_connect) {
            rtc.sendMessage(config['Sensor_A'], sensor.PM.query);
            console.log("pm");
        }
    })
    $('#nstSliderS2').on("click touchend", function () {
        if (rtc_connect) {
            rtc.sendMessage(config['Sensor_A'], sensor.tem.query);
            console.log("tem");
        }
    })

    // 模式切换
    $("#mode-switch input").on("click", function () {
        config["curMode"] = $(this).val();
        console.log("切换到：" + config["curMode"]);
        var isManualMode = config["curMode"] == "manual-mode";
        console.log(isManualMode);
        if (isManualMode) {
            $("#mode-txt-2").removeClass("hidden").siblings("span").addClass("hidden");
            $("#mode-text").addClass("mode-right");
            message_show("手动模式已开启")
            //关闭自动控制
            $('#nstSliderS').addClass('nst-disabled');
            $('#nstSliderS2').addClass('nst-disabled');
            $('#sprayStatus').attr("disabled", false);
            $('#alarmStatus').attr("disabled", false);

        }
        // 手动模式
        else {
            //打开自动控制
            $('#nstSliderS').removeClass('nst-disabled');
            $('#nstSliderS2').removeClass('nst-disabled');
            $('#sprayStatus').attr("disabled", true);
            $('#alarmStatus').attr("disabled", true);

            $("#mode-txt-1").removeClass("hidden").siblings("span").addClass("hidden");
            $("#mode-text").removeClass("mode-right");
            message_show("自动模式已开启")

        }
        storeStorage();
    });

    //灾情提示按钮
    $("#alarmStatus").on("click", function () {
        if (page.checkOnline() && page.checkMac("Sensor_B")) {
            var state = $(this).text() == "已开启", cmd;
            if (state) {
                $(this).text("已关闭");
                $("#alarmImg").attr('src', 'img/alarm.png');
                // config["alarm"] = false;
                cmd = sensor.switch.disasterClose;
            } else {
                $(this).text("已开启");
                $("#alarmImg").attr('src', 'img/alarm-on.png');
                // config["alarm"] = true;
                cmd = sensor.switch.disasterOpen;
            }
            console.log(cmd);
            rtc.sendMessage(config["Sensor_B"], cmd);
        }
    });

    //喷淋按钮
    $("#sprayStatus").on("click", function () {
        if (page.checkOnline() && page.checkMac("Sensor_B")) {
            var state = $(this).text() == "已开启", cmd;
            if (state) {
                cmd = sensor.switch.sprayClose;
                $("#sprayImg").attr('src', 'img/spray.png');
                $(this).text("已关闭");
            } else {
                cmd = sensor.switch.sprayOpen;
                $("#sprayImg").attr('src', 'img/spray-on.png');
                $(this).text("已开启");
            }
            console.log(cmd);
            rtc.sendMessage(config["Sensor_B"], cmd);
        }
    });

    var state = {
        "spray": false,
        "pm": false,
        "alarm": false
    }

    //关闭报警关闭灯
    function checkCloseAlarm() {
        $('#alarmStatus,#sprayStatus').text("已关闭");
        $("#alarmImg").attr('src', 'img/alarm.png');
        $("#sprayImg").attr('src', 'img/spray.png');
        rtc.sendMessage(config["Sensor_B"], sensor.switch.alarmClose);
    }
    //开启报警打开灯
    function checkOnAlarm() {
        $('#alarmStatus,#sprayStatus').text("已开启");
        $("#alarmImg").attr('src', 'img/alarm-on.png');
        $("#sprayImg").attr('src', 'img/spray-on.png');
        rtc.sendMessage(config["Sensor_B"], sensor.switch.alarmOpen);
    }
    // 定义二维码生成div
    var qrcode = new QRCode(document.getElementById("qrDiv"), {
        width: 200,
        height: 200
    });

    // 分享按钮
    $(".share").on("click", function () {
        var txt = "", title, input, obj;
        if (this.id == "idShare") {
            obj = {
                "id": $("#id").val(),
                "key": $("#key").val(),
                "server": $("#server").val(),
            }
            title = "IDKey";
            txt = JSON.stringify(obj);
        } else if (this.id == "macShare") {
            obj = {
                "Sensor_A": $("#Sensor_A").val(),
                "Sensor_B": $("#Sensor_B").val(),
                "Sensor_C": $("#Sensor_C").val(),
            }
            title = "MAC设置";
            txt = JSON.stringify(obj);
        }
        qrcode.makeCode(txt);
        $("#shareModalTitle").text(title)
    })
    // 扫描按钮
    $(".scan").on("click", function () {
        if (window.droid) {
            if (this.id == "id_scan") {
                cur_scan_id = this.id;
                window.droid.requestScanQR("scanQR");
            } else if (this.id == "mac_scan") {
                cur_scan_id = this.id;
                window.droid.requestScanQR("scanQR");
            }
        } else {
            message_show("扫描只在安卓系统下可用！");
        }
    })
    // 升级按钮
    $("#setUp").click(function () {
        message_show("当前已是最新版本");
    });

    //  查看升级日志
    $("#showUpdateTxt").on("click", function () {
        if ($(this).text() == "查看升级日志")
            $(this).text("收起升级日志");
        else
            $(this).text("查看升级日志");
    })

    //清除缓存
    $("#clear").click(function () {
        localStorage.removeItem("course_FireControl");
        alert("localStorage已清除!")
        window.location.reload();
    });

    //生成下载APP二维码
    var downloadUrl = version.download;
    new QRCode('qrDownload', {
        text: downloadUrl,
        width: 200,
        height: 200,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });

    //版本列表渲染
    $(".currentVersion").text(version.currentVersion);
    var versionData = version.versionList;
    var versionBox = document.querySelector('.version-list');
    versionBox.innerHTML = versionData.map((item) => {
        return `<dl>
                    <dt>${item.code}</dt>
                    <dd>${item.desc}</dd>
                </dl>`;
    }).join('');

});
var checkDom = function () {
    // 获取当前url字符串中#符号后面字符串
    var pageId = window.location.hash.slice(2);
    var parentPage = pageId.split("/")[0];
    console.log("pageid=" + pageId + "------parentPage=" + parentPage);
    // 隐藏所有右侧content，并显示当前content
    $(".content").hide().filter("#" + parentPage).show();
    // 隐藏所有主内容区box-shell ，并显示当前box-shell
    $(".main").hide().filter("#" + pageId.replace(/\//g, '\\/')).show();
    // 隐藏所有主内容区 ul，并显示当前ul
    $(".aside-nav").hide().filter("#" + parentPage + "UL").show();
    // 每次切换标签页时，把当前二级页面的href保存到一级导航的href中
    $("#" + parentPage + "Li").find("a").attr("href", "#/" + pageId);
    // 导航li高亮
    activeTopLi(parentPage);
    activeTopLi(pageId.split("/")[1]);
}
function activeTopLi(page) {
    $("#" + page + "Li").addClass("active").siblings("li").removeClass("active");
}

// 获取本地localStorage缓存数据
function get_localStorage() {
    if (localStorage.getItem("course_FireControl")) {
        config = JSON.parse(localStorage.getItem("course_FireControl"));
        for (var i in config) {
            if (config[i] != "") {
                // 读取当前模式
                if ($("#" + i)[0]) {
                    console.log("i=" + i + "----val=" + config[i] + "-------tagName=" + $("#" + i)[0].tagName);
                    if ($("#" + i)[0].tagName == "INPUT")
                        $("#" + i).val(config[i]);
                    else
                        $("#" + i).text(config[i]);
                }
            }
            if (config["Air_cur_min"] !== "") {
                console.log("读取阈值缓存：" + config["Air_cur_min"]);
                $("#nstSliderS").data("cur_min", config["Air_cur_min"])
            }
            if (config["Air_data-rang_max"] !== "") {
                $("#nstSliderS").attr("data-range_max", config["Air_data-rang_max"]);
            }
            if (config["Tem_cur_min"] !== "") {
                console.log("读取阈值缓存：" + config["Tem_cur_min"]);
                $("#nstSliderS2").data("cur_min", config["Tem_cur_min"])
            }
            if (config["Tem_data-rang_max"] !== "") {
                $("#nstSliderS2").attr("data-range_max", config["Tem_data-rang_max"]);
            }
            if (config["curMode"] == "manual-mode") { clickhand(); }
            else if (config["curMode"] == "auto-mode") { clickauto(); }
        }
    }
    else {
        get_config();
    }
}

function loadFirstPage() {
    var href = window.location.href;
    var newHref = href.substring(href.length, href.length - 4);
    if (newHref == "html") {
        window.location.href = window.location.href + "#/home/main";
    }
}

function storeStorage() {
    localStorage.setItem("course_FireControl", JSON.stringify(config));
}

var page = {
    checkOnline: function () {
        if (!rtc_connect) {
            message_show("暂未连接，请连接后重试！");
        }
        return rtc_connect;
    },
    checkMac: function (mac) {
        if (!config[mac]) {
            message_show("暂未获取到节点地址，请稍后重试！");
        }
        return config[mac];
    }
}

function get_config() {
    $("#id").val(config.id);
    $("#key").val(config.key);
    $("#server").val(config.server);
    $("#Sensor_A").val(config["Sensor_A"]);
    $("#Sensor_B").val(config["Sensor_B"]);
    $("#Sensor_C").val(config["Sensor_C"]);
    if (config["Air_cur_min"] !== "") {
        console.log("读取阈值缓存：" + config["Air_cur_min"]);
        $("#nstSliderS").data("cur_min", config["Air_cur_min"])
    }
    if (config["Air_data-rang_max"] !== "") {
        $("#nstSliderS").attr("data-range_max", config["Air_data-rang_max"]);
    }
    if (config["Tem_cur_min"] !== "") {
        console.log("读取阈值缓存：" + config["Tem_cur_min"]);
        $("#nstSliderS2").data("cur_min", config["Tem_cur_min"])
    }
    if (config["Tem_data-rang_max"] !== "") {
        $("#nstSliderS2").attr("data-range_max", config["Tem_data-rang_max"]);
    }
    if (config["curMode"] == "manual-mode") { clickhand(); }
    else if (config["curMode"] == "auto-mode") { clickauto(); }
}
function clickhand() {
    $("#mode-txt-2").removeClass("hidden").siblings("span").addClass("hidden");
    $("#mode-text").addClass("mode-right");
    message_show("手动模式已开启");
    //关闭自动控制
    $('#nstSliderS').addClass('nst-disabled');
    $('#nstSliderS2').addClass('nst-disabled');
    $('#sprayStatus').attr("disabled", false);
    $('#alarmStatus').attr("disabled", false);

    let arr = $("#mode-switch input");
    if (arr.length > 0) {
        for (let i = 0; i < arr.length; i++) {
            arr[i].checked = false;
            arr.eq(i).prop('checked', false);
        }
        arr[1].checked = true;
    }
}
function clickauto() {
    //打开自动控制
    $('#nstSliderS').removeClass('nst-disabled');
    $('#nstSliderS2').removeClass('nst-disabled');
    $('#sprayStatus').attr("disabled", true);
    $('#alarmStatus').attr("disabled", true);

    $("#mode-txt-1").removeClass("hidden").siblings("span").addClass("hidden");
    $("#mode-text").removeClass("mode-right");
    message_show("自动模式已开启");
    let arr = $("#mode-switch input");
    if (arr.length > 0) {
        for (let i = 0; i < arr.length; i++) {
            arr[i].checked = false;
            arr.eq(i).prop('checked', false);
        }
        arr[0].checked = true;
    }

}
function getback() {
    $("#backModal").modal("show");
}

function confirm_back() {
    window.droid.confirmBack();
}
// 扫描处理函数
function scanQR(scanData) {
    //将原来的二维码编码格式转换为json。注：原来的编码格式如：id:12345,key:12345,SERVER:12345
    var dataJson = {};
    if (scanData[0] != '{') {
        var data = scanData.split(',');
        for (var i = 0; i < data.length; i++) {
            var newdata = data[i].split(":");
            dataJson[newdata[0].toLocaleLowerCase()] = newdata[1];
        }
    } else {
        dataJson = JSON.parse(scanData);
    }
    console.log("dataJson=" + JSON.stringify(dataJson));
    if (cur_scan_id == "id_scan") {
        $("#id").val(dataJson['id']);
        $("#key").val(dataJson['key']);
        if (dataJson['server'] && dataJson['server'] != '') {
            $("#server").val(dataJson['server']);
        }
    }
    else if (cur_scan_id == "mac_scan") {
        var arr = scanData.split(",");
        for (var i = 0; i < arr.length; i++) {
            $(".MAC").find("input:eq(" + i + ")").val(arr[i]);
        }
    }
}

// 消息弹出框
var message_timer = null;
function message_show(t) {
    if (message_timer) {
        clearTimeout(message_timer);
    }
    message_timer = setTimeout(function () {
        $("#toast").hide();
    }, 3000);
    $("#toast_txt").text(t);
    //console.log(t);
    $("#toast").show();
}