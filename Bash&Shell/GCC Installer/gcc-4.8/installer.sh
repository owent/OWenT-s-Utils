#!/bin/sh
 
# ======================================= 配置 ======================================= 
PREFIX_DIR=/usr/local/gcc-4.8.0
 
# ======================= 非交叉编译 ======================= 
BUILD_TARGET_CONF_OPTION=""
BUILD_OTHER_CONF_OPTION=""
 
# ======================= 交叉编译配置示例 ======================= 
# BUILD_TARGET_CONF_OPTION="--target=arm-linux --enable-multilib --enable-interwork --disable-shared"
# BUILD_OTHER_CONF_OPTION="--disable-shared"
  
# ======================================= 检测 ======================================= 
 
# ======================= 检测完后等待时间 ======================= 
CHECK_INFO_SLEEP=3
 
# ======================= 安装目录初始化 ======================= 
if [ $# -gt 0 ]; then
    PREFIX_DIR=$1
fi
 
mkdir -p "$PREFIX_DIR"
PREFIX_DIR="$( cd "$PREFIX_DIR" && pwd )";
 
# ======================= 转到脚本目录 ======================= 
WORKING_DIR="$PWD";
 
# ======================= 如果是64位系统且没安装32位的开发包，则编译要gcc加上 --disable-multilib 参数, 不生成32位库 ======================= 
SYS_LONG_BIT=$(getconf LONG_BIT)
GCC_OPT_DISABLE_MULTILIB=""
if [ $SYS_LONG_BIT == "64" ]; then
    GCC_OPT_DISABLE_MULTILIB="--disable-multilib"
    GCC_OPT_DISABLE_MULTILIB_DEV_LIBS=($(whereis librt))
    if [ ${#GCC_OPT_DISABLE_MULTILIB_DEV_LIBS[@]} -lt 2 ]; then
        echo -e "\\033[31;1mglibc-devel is required.\\033[39;49;0m"
        exit -1
    fi
    for FILE_PATH in ${GCC_OPT_DISABLE_MULTILIB_DEV_LIBS[@]}; do
        if [ ${FILE_PATH:0:9} == "/usr/lib/" ]; then
            echo -e "\\033[32;1mnotice: librt x86_64 found multilib enabled.\\033[39;49;0m"
            GCC_OPT_DISABLE_MULTILIB=""
        fi
    done
    GCC_OPT_DISABLE_MULTILIB_DEV_LIBS=""
    if [ "$GCC_OPT_DISABLE_MULTILIB" == "--disable-multilib" ]; then
        echo -e "\\033[32;1mwarning: --disable-multilib is added when build gcc.\\033[39;49;0m"
        let CHECK_INFO_SLEEP=$CHECK_INFO_SLEEP+1
    fi
fi
 
# ======================= 如果强制开启，则开启 ======================= 
if [ ! -z "$GCC_OPT_DISABLE_MULTILIB" ]; then
    for opt in $BUILD_TARGET_CONF_OPTION ; do
        if [ "$opt" == "--enable-multilib" ]; then
            echo -e "\\033[32;1mwarning: librt not found in [*]/lib64 but --enable-multilib enabled in GCC_OPT_DISABLE_MULTILIB.\\033[39;49;0m"
            GCC_OPT_DISABLE_MULTILIB="";
            break;
        fi
        echo $f; 
    done
fi
 
# ======================= 检测CPU数量，编译线程数不能大于CPU数量的2倍，否则可能出问题 ======================= 
BUILD_THREAD_OPT=8;
BUILD_CPU_NUMBER=$(cat /proc/cpuinfo | grep -c "^processor[[:space:]]*:[[:space:]]*[0-9]*");
let BUILD_THREAD_OPT=$BUILD_CPU_NUMBER*2;
if [ $BUILD_THREAD_OPT -gt 8 ]; then
    BUILD_THREAD_OPT=8;
fi
BUILD_THREAD_OPT="-j$BUILD_THREAD_OPT";
echo -e "\\033[32;1mnotice: $BUILD_CPU_NUMBER cpu(s) detected. use $BUILD_THREAD_OPT for multi-thread compile."
 
# ======================= 统一的包检查和下载函数 ======================= 
function check_and_download(){
    PKG_NAME="$1";
    PKG_MATCH_EXPR="$2";
    PKG_URL="$3";
     
    PKG_VAR_VAL=$(ls -d $PKG_MATCH_EXPR);
    if [ ! -z "$PKG_VAR_VAL" ]; then
        echo "$PKG_VAR_VAL"
        return 0;
    fi
     
    if [ -z "$PKG_URL" ]; then
        echo -e "\\033[31;1m$PKG_NAME not found.\\033[39;49;0m" 
        exit -1;
    fi
     
    wget -c "$PKG_URL";
    PKG_VAR_VAL=$(ls -d $PKG_MATCH_EXPR);
     
    if [ -z "$PKG_VAR_VAL" ]; then
        echo -e "\\033[31;1m$PKG_NAME not found.\\033[39;49;0m" 
        exit -1;
    fi
     
    echo "$PKG_VAR_VAL";
}
 
# ======================================= 搞起 ======================================= 
echo -e "\\033[31;1mcheck complete.\\033[39;49;0m"
 
# ======================= 准备环境, 把库和二进制目录导入，否则编译会找不到库或文件 ======================= 
export LD_LIBRARY_PATH=$PREFIX_DIR/lib:$PREFIX_DIR/lib64:$LD_LIBRARY_PATH
export PATH=$PREFIX_DIR/bin:$PATH
 
echo -e "\\033[32;1mnotice: reset env LD_LIBRARY_PATH=$LD_LIBRARY_PATH\\033[39;49;0m";
echo -e "\\033[32;1mnotice: reset env PATH=$PATH\\033[39;49;0m";
 
echo "WORKING_DIR = $WORKING_DIR"
echo "PREFIX_DIR = $PREFIX_DIR"
echo "BUILD_TARGET_CONF_OPTION = $BUILD_TARGET_CONF_OPTION"
echo "BUILD_OTHER_CONF_OPTION = $BUILD_OTHER_CONF_OPTION"
echo "CHECK_INFO_SLEEP = $CHECK_INFO_SLEEP"
echo "BUILD_CPU_NUMBER = $BUILD_CPU_NUMBER"
echo "BUILD_THREAD_OPT = $BUILD_THREAD_OPT"
echo "GCC_OPT_DISABLE_MULTILIB = $GCC_OPT_DISABLE_MULTILIB"
echo "SYS_LONG_BIT = $SYS_LONG_BIT"
 
echo -e "\\033[32;1mnotice: now, sleep for $CHECK_INFO_SLEEP seconds.\\033[39;49;0m"; 
sleep $CHECK_INFO_SLEEP
  
# ======================= 关闭交换分区，否则就爽死了 ======================= 
swapoff -a
 
# install gmp
GMP_PKG=$(check_and_download "gmp" "gmp-*.tar.bz2" "ftp://ftp.gmplib.org/pub/gmp/gmp-5.1.1.tar.bz2" );
if [ $? -ne 0 ]; then
    echo -e "$GMP_PKG"
    exit -1;
fi
tar -jxvf $GMP_PKG
GMP_DIR=$(ls -d gmp-* | grep -v \.tar\.bz2)
cd $GMP_DIR
CPPFLAGS=-fexceptions ./configure --prefix=$PREFIX_DIR --enable-cxx --enable-assert $BUILD_OTHER_CONF_OPTION
make $BUILD_THREAD_OPT && make check && make install
cd "$WORKING_DIR"
   
# install mpfr
MPFR_PKG=$(check_and_download "mpfr" "mpfr-*.tar.bz2" "http://www.mpfr.org/mpfr-current/mpfr-3.1.2.tar.bz2" );
if [ $? -ne 0 ]; then
    echo -e "$MPFR_PKG"
    exit -1;
fi
tar -jxvf $MPFR_PKG
MPFR_DIR=$(ls -d mpfr-* | grep -v \.tar\.bz2)
cd $MPFR_DIR
./configure --prefix=$PREFIX_DIR --with-gmp=$PREFIX_DIR --enable-assert $BUILD_OTHER_CONF_OPTION
make $BUILD_THREAD_OPT && make install
cd "$WORKING_DIR"
   
# install mpc
MPC_PKG=$(check_and_download "mpc" "mpc-*.tar.gz" "http://www.multiprecision.org/mpc/download/mpc-1.0.1.tar.gz" );
if [ $? -ne 0 ]; then
    echo -e "$MPC_PKG"
    exit -1;
fi
tar -zxvf $MPC_PKG
MPC_DIR=$(ls -d mpc-* | grep -v \.tar\.gz)
cd $MPC_DIR
./configure --prefix=$PREFIX_DIR --with-gmp=$PREFIX_DIR --with-mpfr=$PREFIX_DIR $BUILD_OTHER_CONF_OPTION
make $BUILD_THREAD_OPT && make install
cd "$WORKING_DIR"
  
# install isl
ISL_PKG=$(check_and_download "isl-0.11" "isl-*.tar.bz2" "ftp://gcc.gnu.org/pub/gcc/infrastructure/isl-0.11.1.tar.bz2" );
if [ $? -ne 0 ]; then
    echo -e "$ISL_PKG"
    exit -1;
fi
tar -jxvf $ISL_PKG
ISL_DIR=$(ls -d isl-* | grep -v \.tar\.bz2)
cd $ISL_DIR
./configure --prefix=$PREFIX_DIR --with-gmp-prefix=$PREFIX_DIR $BUILD_OTHER_CONF_OPTION
make $BUILD_THREAD_OPT && make install
cd "$WORKING_DIR"
  
# install cloog
CLOOG_PKG=$(check_and_download "cloog-0.18" "cloog-0.*.tar.gz" "ftp://gcc.gnu.org/pub/gcc/infrastructure/cloog-0.18.0.tar.gz" );
if [ $? -ne 0 ]; then
    echo -e "$CLOOG_PKG"
    exit -1;
fi
tar -zxvf $CLOOG_PKG
CLOOG_DIR=$(ls -d cloog-0.* | grep -v \.tar\.gz)
cd $CLOOG_DIR
./configure --prefix=$PREFIX_DIR --with-gmp=system --with-gmp-prefix=$PREFIX_DIR --with-bits=gmp --with-isl=$PREFIX_DIR $BUILD_OTHER_CONF_OPTION
make $BUILD_THREAD_OPT && make check && make install
cd "$WORKING_DIR"
   
# ======================= install gcc ======================= 
# ======================= 解决检测ISL有时候会失效的问题 ======================= 
cd $ISL_DIR
make install
cd "$WORKING_DIR"
 
# ======================= gcc包 ======================= 
GCC_PKG=$(check_and_download "gcc" "gcc-*.tar.bz2" "ftp://gcc.gnu.org/pub/gcc/releases/gcc-4.8.0/gcc-4.8.0.tar.bz2" );
if [ $? -ne 0 ]; then
    echo -e "$GCC_PKG"
    exit -1;
fi
tar -jxvf $GCC_PKG
GCC_DIR=$(ls -d gcc-* | grep -v \.tar\.bz2)
mkdir objdir
cd objdir
# ======================= 这一行的最后一个参数请注意，如果要支持其他语言要安装依赖库并打开对该语言的支持 ======================= 
GCC_CONF_OPTION_ALL="--prefix=$PREFIX_DIR --with-gmp=$PREFIX_DIR --with-mpc=$PREFIX_DIR --with-mpfr=$PREFIX_DIR --with-isl=$PREFIX_DIR --with-cloog=$PREFIX_DIR --enable-bootstrap --enable-build-with-cxx --enable-cloog-backend=isl --disable-libjava-multilib --enable-checking=release $GCC_OPT_DISABLE_MULTILIB $BUILD_TARGET_CONF_OPTION";
../$GCC_DIR/configure $GCC_CONF_OPTION_ALL
make $BUILD_THREAD_OPT && make install
cd "$WORKING_DIR"
 
ls $PREFIX_DIR/bin/*gcc
if [ $? -ne 0 ]; then
    echo -e "\\033[31;1mError: build gcc failed.\\033[39;49;0m";
    exit -1;
fi
 
# ======================= 建立cc软链接 ======================= 
ln -s $PREFIX_DIR/bin/gcc $PREFIX_DIR/bin/cc
 
CHECK_PPL_PATH="$(whereis libppl.so.* | awk '{print $2;}')";
# ##### [以下两个组件依赖PPL库， 由于新版GCC已经去除对PPL的依赖，并且下面两个不是必须项，所以如果没有就跳过] #####
if [ -z "$CHECK_PPL_PATH" ]; then
    echo -e "\\033[32;1mwarning: ppl not found, skip build [binutils] and [gdb].\\033[39;49;0m"
else
    # ======================= install binutils(链接器,汇编器 等) ======================= 
    BINUTILS_PKG=$(check_and_download "binutils" "binutils-*.tar.bz2" "http://ftp.gnu.org/gnu/binutils/binutils-2.23.2.tar.bz2" );
    if [ $? -ne 0 ]; then
        echo -e "$BINUTILS_PKG"
        exit -1;
    fi
    tar -jxvf $BINUTILS_PKG
    BINUTILS_DIR=$(ls -d binutils-* | grep -v \.tar\.bz2)
    cd $BINUTILS_DIR
    ./configure --prefix=$PREFIX_DIR --with-gmp=$PREFIX_DIR --with-mpc=$PREFIX_DIR --with-mpfr=$PREFIX_DIR --enable-build-with-cxx $BUILD_TARGET_CONF_OPTION
    make $BUILD_THREAD_OPT && make check && make install
    cd "$WORKING_DIR"
 
    # ======================= install gdb(调试器) [依赖PPL库, libtermcap库] ======================= 
    CHECK_TERMCAP_PATH="$(whereis libtermcap | awk '{print $2;}')";
    if [ -z "$CHECK_TERMCAP_PATH" ]; then
        echo -e "\\033[32;1mwarning: libtermcap not found, skip build [gdb].\\033[39;49;0m"
    else
        GDB_PKG=$(check_and_download "gdb" "gdb-*.tar.bz2" "http://ftp.gnu.org/gnu/gdb/gdb-7.5.1.tar.bz2" );
        if [ $? -ne 0 ]; then
            echo -e "$GDB_PKG"
            exit -1;
        fi
        tar -jxvf $GDB_PKG
        GDB_DIR=$(ls -d gdb-* | grep -v \.tar\.bz2)
        cd $GDB_DIR
        ./configure --prefix=$PREFIX_DIR --with-gmp=$PREFIX_DIR --with-mpc=$PREFIX_DIR --with-mpfr=$PREFIX_DIR --enable-build-with-cxx $BUILD_TARGET_CONF_OPTION
        make $BUILD_THREAD_OPT && make install
        cd "$WORKING_DIR"
    fi
fi
 
 
# 应该就编译完啦
# 64位系统内，如果编译java支持的话可能在gmp上会有问题，可以用这个选项关闭java支持 --enable-languages=c,c++,objc,obj-c++,fortran,ada
# 再把$PREFIX_DIR/bin放到PATH
# $PREFIX_DIR/lib （如果是64位机器还有$PREFIX_DIR/lib64）[另外还有$PREFIX_DIR/libexec我也不知道要不要加，反正我加了]放到LD_LIBRARY_PATH或者/etc/ld.so.conf里
# 再执行ldconfig就可以用新的gcc啦  
 
echo -e "\\033[33;1mAddition, run the cmds below to add environment var(s).\\033[39;49;0m"
echo -e "\\033[31;1mexport PATH=$PREFIX_DIR/bin:$PATH\\033[39;49;0m"
echo -e "\\033[31;1mexport LD_LIBRARY_PATH=$PREFIX_DIR/lib:$PREFIX_DIR/libexec:$LD_LIBRARY_PATH\\033[39;49;0m"
echo -e "\\033[31;1mexport LD_LIBRARY_PATH=$PREFIX_DIR/lib64:$LD_LIBRARY_PATH # run this if in a x86_64 arch.\\033[39;49;0m"
echo -e "\tor you can add $PREFIX_DIR/lib, $PREFIX_DIR/lib64 (if in x86_64) and $PREFIX_DIR/libexec to file [/etc/ld.so.conf] and then run [ldconfig]"
echo -e "\\033[33;1mBuild Gnu Compile Collection done.\\033[39;49;0m"
