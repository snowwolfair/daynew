# @mashroomwolf/koishi-plugin-daynew

[![npm](https://img.shields.io/npm/v/@mashroomwolf/koishi-plugin-daynew?style=flat-square)](https://www.npmjs.com/package/@mashroomwolf/koishi-plugin-daynew)

一个暂时仅测试了 QQ onebot 机器人的每日新闻插件

# 食用方法

在发送信息配置中`添加项目`, 然后输入机器人所在群号即可

本项目注册了一个名为 `daily` 的命令，和定时任务发出的信息一样
若不需要该命令，请在`指令管理`中关闭

# 注意事项

- 必须服务：cron 会标橙色是正常现象， 显示`koishi-plugin-cron (已加载)`时即可使用
- 插件默认每天早上 9 点发送新闻
- 目前仅测试了 QQ onebot 机器人可用
- 如果新闻源未读取，请自行添加其他新闻源
