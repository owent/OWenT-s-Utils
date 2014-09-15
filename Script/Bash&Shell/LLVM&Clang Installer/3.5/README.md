Linux 编译安装 LLVM + Clang 3.5
======

LLVM和Clang工具链的生成配置文件写得比较搓，所以略微麻烦，另外这个脚本没有经过多环境测试，不保证在其他Linux发行版里正常使用。


编译安装 LLVM + Clang 3.5 
### 准备环境及依赖项

1. Python
2. **python-devel/python-dev**
2. **swig**
3. **libeditor/libeditor-devel/libeditor-dev**
4. *gtest, gtest-devel/gtest-dev(lld依赖项)*
4. GCC 4.7 or higher

### 我编译的环境
#### 系统：
CentOS 6.2 & CentOS 7.0

#### 系统库：
详情参见 [llvm官网](http://llvm.org/)

#### 编译的依赖库：
+ libc++ 3.5.0
+ libc++abi 3.5.0


#### 默认编译目标：
+ llvm 3.5.0
+ clang 3.5.0
+ lldb 3.5.0

#### 注：
+ (所有的库都会被安装在**$PREFEX_DIR**里)

#### 额外建议：
+ 如果增加编译组件，比如已装有gtest要编译lld，使用命令***./install.sh +lld*** 

#### History:
+ 2014-09-12     Created
+ 2014-09-15     Tested under CentOS 7.0


#### 参考文献
1. [llvm官网](http://llvm.org/)
2. [Linux下编译clang、libcxx及其相关库——C++11环境搭建](http://www.cnblogs.com/soaliap/archive/2012/07/23/2605278.html)
3. [linux下编译clang, libc++, libc++abi，以及第二遍自举编译 ](http://blog.csdn.net/heartszhang/article/details/17652461)
