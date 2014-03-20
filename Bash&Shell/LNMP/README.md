Lnmp yum 安装脚本 (for CentOS)
======
详情见: [Lnmp yum 安装脚本 (for CentOS)](http://www.owent.net/?p=740)
脚本执行完后**有几个需要注意的地方**


## 配置建议

脚本执行完后，有几个配置建议<br />
	
1. 建议**php-fpm运行方式改为类似 unix:/var/run/php-fpm.sock** 这样，而不是绑定IP和端口，据说可以减少内存消耗和网络开销。修改方法为，*php-fpm.conf*或*php-fpm.d/www.conf* 内的**listen**设置改成 */var/run/php-fpm.sock* 然后 nginx内网站的server内*fastcgi_pass*节点改为*fastcgi_pass unix:/var/run/php-fpm.sock;*(其他sock路劲类似)
	
2. 建议**nginx.conf**内的**event**节点增加*use epoll;*选项，即为
	```nginx
	events {
	    use epoll;
	    worker_connections 51200;
	}
	```
3. 建议 server include的cgi通用配置（默认是*fastcgi_params*）中添加以下选项
	```nginx
	fastcgi_connect_timeout 300;
	fastcgi_send_timeout 300;
	fastcgi_read_timeout 300;
	fastcgi_buffer_size 128k;
	fastcgi_buffers 4 256k;
	fastcgi_busy_buffers_size 256k;
	fastcgi_temp_file_write_size 256k;
	fastcgi_intercept_errors on;
	fastcgi_param  SCRIPT_FILENAME    $document_root$fastcgi_script_name;
	# 并且server节点内的 fastcgi_param SCRIPT_FILENAME使用上诉文件的配置
	
	```
4. 建议**nginx.conf**内的http节点增加以下配置，开启*gzip*压缩
	```nginx
	gzip on;
	gzip_min_length  1k;
	gzip_buffers     4 16k;
	gzip_http_version 1.0;
	gzip_comp_level 2;
	gzip_types       text/plain text/css application/x-javascript text/xml application/xml application/xml+rss text/javascript;
	gzip_vary on; 
	
	```
5. 建议**/etc/php-fpm.conf**内配置*sendmail*选项</b></font>
	```php
	php_admin_value[sendmail_path] = /usr/sbin/sendmail -t -i -f admin@owent.net
	```
6. 根据服务器具体情况配置**/etc/php-fpm.d/*.conf**的的参数
	```php
	pm.max_children = 10
	pm.start_servers = 2
	pm.min_spare_servers = 3
	pm.max_spare_servers = 5
	;pm.max_requests = 500
	php_admin_value[memory_limit] = 300M
	// 以上是我的配置
	```
7. 建议修改php,nginx,php-fpm,nginx 内 server所有***日志***文件位置
