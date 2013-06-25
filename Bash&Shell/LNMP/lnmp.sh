#!/bin/sh
 
WORKING_DIR="$PWD";
 
ARCH_FLAG=$(getconf LONG_BIT);
PHP_CONF_FILE_PATH=/etc/php.ini
PHP_CONF_DIR_PATH=/etc/php.d
PHP_FPM_CONF_FILE_PATH=/etc/php-fpm.d/www.conf
 
# 安装扩展软件源
rpm -ivh http://nginx.org/packages/centos/6/noarch/RPMS/nginx-release-centos-6-0.el6.ngx.noarch.rpm
if [ "$ARCH_FLAG" == "64" ]; then
    rpm -ivh http://packages.sw.be/rpmforge-release/rpmforge-release-0.5.2-2.el6.rf.x86_64.rpm
else
    rpm -ivh http://packages.sw.be/rpmforge-release/rpmforge-release-0.5.2-2.el6.rf.i686.rpm
fi
rpm --import http://apt.sw.be/RPM-GPG-KEY.dag.txt
rpm -K rpmforge-release-0.5.2-2.el6.rf.*.rpm  # 这里会报一个错，无视之
 
yum install -y nginx
chkconfig nginx on
yum install -y autoconf zlib zlib-devel libpng libpng-devel freetype freetype-devel sendmail mysql-server mysql memcached procmail php php-adodb php-bcmath php-cli php-common php-devel php-enchant php-fpm php-gd php-imap php-intl php-jpgraph php-ldap php-mbstring php-mcrypt php-mysql php-odbc php-pdo php-pear php-pear-db php-pecl-apc php-pecl-mailparse php-pecl-memcache php-pecl-session_mysql php-pgsql php-process php-pspell php-recode php-soap php-tidy php-xcache php-xml php-xmlrpc
chkconfig httpd off
 
cp $PHP_CONF_FILE_PATH $PHP_CONF_FILE_PATH.bak
 
# 替换PHP配置
sed -i 's#output_buffering = Off#output_buffering = On#' $PHP_CONF_FILE_PATH
sed -i 's/memory_limit = 128M/memory_limit = 300M/g' $PHP_CONF_FILE_PATH
sed -i 's/post_max_size = 8M/post_max_size = 50M/g' $PHP_CONF_FILE_PATH
sed -i 's/upload_max_filesize = 2M/upload_max_filesize = 50M/g' $PHP_CONF_FILE_PATH
sed -i 's/;date.timezone =/date.timezone = PRC/g' $PHP_CONF_FILE_PATH
sed -i 's/short_open_tag = Off/short_open_tag = On/g' $PHP_CONF_FILE_PATH
sed -i 's/; cgi.fix_pathinfo=1/cgi.fix_pathinfo=0/g' $PHP_CONF_FILE_PATH
sed -i 's/; cgi.fix_pathinfo=0/cgi.fix_pathinfo=0/g' $PHP_CONF_FILE_PATH
sed -i 's/max_execution_time = 30/max_execution_time = 300/g' $PHP_CONF_FILE_PATH
sed -i 's/disable_functions =.*/disable_functions = proc_open,proc_get_status,ini_alter,ini_alter,ini_restore,pfsockopen,popepassthru,stream_socket_server,fsocket/g' $PHP_CONF_FILE_PATH
 
# 替换PHP-FPM配置
groupadd users
useradd -s /sbin/nologin -g nginx users
usermod -g users nginx
sed -i 's/user = apache/user = nginx/g' $PHP_FPM_CONF_FILE_PATH
sed -i 's/group = apache/group = users/g' $PHP_FPM_CONF_FILE_PATH
sed -i 's/;php_admin_value\[memory_limit\] = 128M/php_admin_value\[memory_limit\] = 300M/g' $PHP_FPM_CONF_FILE_PATH
 
 
# 安装加速器 eaccelerator
wget -c https://github.com/eaccelerator/eaccelerator/tarball/master -O eaccelerator.tar.gz
tar -zxvf eaccelerator.tar.gz
mv eaccelerator-eaccelerator-* eaccelerator
cd eaccelerator
phpize
./configure --enable-eaccelerator=shared --with-php-config=$(which php-config)
make && make test && make install
 
mkdir -p /tmp/eaccelerator
echo "
[eaccelerator]
extension=\"$(php-config --extension-dir)/eaccelerator.so\"
eaccelerator.shm_size=\"32\"
eaccelerator.cache_dir=\"/tmp/eaccelerator\"
eaccelerator.enable=\"1\"
eaccelerator.optimizer=\"1\"
eaccelerator.check_mtime=\"1\"
eaccelerator.debug=\"0\"
eaccelerator.filter=\"\"
eaccelerator.shm_max=\"0\"
eaccelerator.shm_ttl=\"0\"
eaccelerator.shm_prune_period=\"0\"
eaccelerator.shm_only=\"0\"
eaccelerator.compress=\"1\"
eaccelerator.compress_level=\"9\"
" >> $PHP_CONF_DIR_PATH/eaccelerator.ini
 
cd "$WORKING_DIR"
 
# 安装加速器 Zend Guard Loader
ZEND_GUARD_LOADER="http://downloads.zend.com/guard/5.5.0/ZendGuardLoader-php-5.3-linux-glibc23-i386.tar.gz";
if [ "$ARCH_FLAG" == "64" ]; then
    ZEND_GUARD_LOADER="http://downloads.zend.com/guard/5.5.0/ZendGuardLoader-php-5.3-linux-glibc23-x86_64.tar.gz";
fi
wget -c $ZEND_GUARD_LOADER
ZEND_GUARD_NAME=$(ls ZendGuardLoader-php-5.3-linux-glibc23-*.tar.gz);
tar -zxvf $ZEND_GUARD_NAME
rm -rf $ZEND_GUARD_NAME
mv -f ZendGuardLoader-php-5.3-linux-glibc23-*/php-5.3.*/ZendGuardLoader.so $(php-config --extension-dir)
 
echo "
[Zend.loader]
zend_loader.enable=1
zend_loader.disable_licensing=1
zend_loader.obfuscation_level_support=3
zend_loader.license_path=
zend_extension=$(php-config --extension-dir)/ZendGuardLoader.so
" > $PHP_CONF_DIR_PATH/zendloader.ini
 
# 复制通用配置文件
NGINX_CONF_PATH="/etc/nginx"
echo '
location / {
if (-f $request_filename/index.html){
                rewrite (.*) $1/index.html break;
        }
if (-f $request_filename/index.php){
                rewrite (.*) $1/index.php;
        }
if (!-f $request_filename){
                rewrite (.*) /index.php;
        }
}
' > "$NGINX_CONF_PATH/wordpress.conf"
 
echo '
location / {
            rewrite ^(.*)-htm-(.*)$ $1.php?$2 last;
            rewrite ^(.*)/simple/([a-z0-9\_]+\.html)$ $1/simple/index.php?$2 last;
        }
'  > "$NGINX_CONF_PATH/phpwind.conf"
 
echo '
location / {
            rewrite ^/archiver/((fid|tid)-[\w\-]+\.html)$ /archiver/index.php?$1 last;
            rewrite ^/forum-([0-9]+)-([0-9]+)\.html$ /forumdisplay.php?fid=$1&page=$2 last;
            rewrite ^/thread-([0-9]+)-([0-9]+)-([0-9]+)\.html$ /viewthread.php?tid=$1&extra=page%3D$3&page=$2 last;
            rewrite ^/space-(username|uid)-(.+)\.html$ /space.php?$1=$2 last;
            rewrite ^/tag-(.+)\.html$ /tag.php?name=$1 last;
        }
'  > "$NGINX_CONF_PATH/discuz.conf"
 
echo '
rewrite ^([^\.]*)/topic-(.+)\.html$ $1/portal.php?mod=topic&topic=$2 last;
rewrite ^([^\.]*)/article-([0-9]+)-([0-9]+)\.html$ $1/portal.php?mod=view&aid=$2&page=$3 last;
rewrite ^([^\.]*)/forum-(\w+)-([0-9]+)\.html$ $1/forum.php?mod=forumdisplay&fid=$2&page=$3 last;
rewrite ^([^\.]*)/thread-([0-9]+)-([0-9]+)-([0-9]+)\.html$ $1/forum.php?mod=viewthread&tid=$2&extra=page%3D$4&page=$3 last;
rewrite ^([^\.]*)/group-([0-9]+)-([0-9]+)\.html$ $1/forum.php?mod=group&fid=$2&page=$3 last;
rewrite ^([^\.]*)/space-(username|uid)-(.+)\.html$ $1/home.php?mod=space&$2=$3 last;
rewrite ^([^\.]*)/([a-z]+)-(.+)\.html$ $1/$2.php?rewrite=$3 last;
if (!-e $request_filename) {
        return 404;
}
'  > "$NGINX_CONF_PATH/discuzx.conf"
 
# iptables 管理
/sbin/iptables -I INPUT -p tcp --dport 80 -j ACCEPT
/sbin/iptables-save
 
# 自启动
chkconfig --level 345 php-fpm on
chkconfig --level 345 nginx on
chkconfig --level 345 mysqld on
 
# 配置修正（修复几个默认配置）
sed -i 's/extension=module.so/extension=mcrypt.so/g' $PHP_CONF_DIR_PATH/mcrypt.ini
 
# ===========================  以下为手动处理  ===========================
# 加速器XCache、APC和eaccelerator只能启用一个
# $PHP_CONF_DIR_PATH/xcache.ini 和 $PHP_CONF_DIR_PATH/apc.ini内最多只注释一个
sed -i 's/extension = apc.so/;extension = apc.so/g' $PHP_CONF_DIR_PATH/apc.ini
sed -i "s#extension=\"$(php-config --extension-dir)/eaccelerator.so\"#;extension=\"$(php-config --extension-dir)/eaccelerator.so\"#g" $PHP_CONF_DIR_PATH/eaccelerator.ini
# sed -i "s#zend_extension = $(php-config --extension-dir)/xcache.so#;zend_extension = $(php-config --extension-dir)/xcache.so#g" $PHP_CONF_DIR_PATH/xcache.ini
 
# 注意xcache的管理端安装在/var/www/html/xcache内
# 如果要给xcache的管理端设置密码，请修改 $PHP_CONF_DIR_PATH/xcache.ini( 即 /etc/php.d/xcache.ini ) 文件
 
# 重启 服务
service nginx restart
service php-fpm restart
service mysqld restart
