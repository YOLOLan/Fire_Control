//id key等参数配置文件：修改后请点击版本日志后的清除localStorage按钮

var config = {
    'id': '1234567890',
    'key': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'server': 'api.zhiyun360.com',
    'Sensor_A': '00:00:00:00:00:00:00:00',
    'Sensor_B': '00:00:00:00:00:00:00:00',
    'Sensor_C': '00:00:00:00:00:00:00:00',
    'curMode': "manual-mode",                                   //手动模式，另一个是自动模式(auto-mode)
    'Air_cur_min':100,                                          //空气滑块值
    'Air_data-rang_max':200,                                    //空气阈值最大值
    'Tem_cur_min':50,                                           //温度滑块值
    'Tem_data-rang_max':100,                                    //温度阈值最大值
}
var sensor = {
    tem: {                                                      //温度
        tag: "A0",
        query: "{A0=?}",
    },
    PM: {                                                       //空气质量
        tag: "A3",
        query: "{A3=?}",
    },
    switch: {                                                   //开关
        tag: "D1",
        query: "{D1=?}",
        disasterOpen: "{OD1=1,OD1=8,D1=?}",                     //灾情提示开
        disasterClose: "{CD1=1,CD1=8,D1=?}",                    //灾情提示关
        sprayOpen: "{OD1=64,D1=?}",                             //喷淋提示开
        sprayClose: "{CD1=64,D1=?}",                            //喷淋提示关
        alarmOpen: "{OD1=1,OD1=8,OD1=64,D1=?}",                 //报警灯提示开
        alarmClose: "{CD1=1,CD1=8,CD1=64,D1=?}",                //报警灯提示关
    },
    all: "{A0=?,A3=?,D1=?}",                                    //查询所有传感器状态
}