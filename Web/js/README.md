OWenT’s Utils -- Web -- js
=============

### jquery.browser.js
简单环境检测函数 -- 支持作为jQuery插件

### showJson.js
显示JSON结构 -- web的js开发很方便啊，但是碰到iframe里的东西还是不方便看到变量的内容，所以就写了这么个看json内容的玩意，还可以当控制台输出用。

很简单,有需要以后开发新功能
#### 更新记录
+ 1.1 更新对不同类型着色
+ 1.2 如果载入了jQuery UI 则使用jQuery UI的Dialog打开，用于解决嵌套iframe时浏览器拦截问题
+ 1.3 解决Object循环引用时栈溢出问题，同时增加引用的指向锚点
