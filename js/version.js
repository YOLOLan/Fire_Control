/**
 * 版本管理文件，方便查找最新版本，最新版本写在最前面
 * download: 动态二维码下载APP地址
 * currentVersion: 显示当前版本
 * versionList：版本更新列表
 **/

var version = {
    download: 'http://demo.zhiyun360.com/appstore/XLab/FireControl/FireControl.apk',
    currentVersion: 'v2.1.190925',
    versionList: [
        {
            code: 'v2.1.190925',
            desc: '逻辑和细节优化，新增参数配置config.js文件'
        },
        {
            code: 'v2.0.190722',
            desc: '修复BUG，布局优化，新增版本管理version.js文件，生成二维下载APP功能'
        },
        {
            code: 'v1.0.190422',
            desc: '完成初版'
        }
    ]
};