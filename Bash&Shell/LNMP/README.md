Lnmp yum 安装脚本 (for CentOS)
======
详情见: [Lnmp yum 安装脚本 (for CentOS)](http://www.owent.net/?p=740)
<p>
    脚本执行完后<span style="font-size:x-large;"><strong><span style="color:#800000;">有几个需要注意的地方</span></strong></span>
</p>
<ol>
<li>
		加速器<strong>XCache、APC和eaccelerator只能启用一个</strong>，必须关掉其他的
	</li>
<li>
		<strong>如果使用XCache</strong>，则XCache必须是<strong>第一个zend_extension</strong>(即在Zend Guide Loader之前载入)
	</li>
<li>
		建议<strong>php-fpm运行方式改为类似 unix:/var/run/php-fpm.sock</strong> 这样，而不是绑定IP和端口，据说可以减少内存消耗和网络开销。修改方法为，php-fpm.conf或php-fpm.d/www.conf 内的listen设置改成 /var/run/php-fpm.sock 然后 nginx内网站的server内fastcgi_pass节点改为fastcgi_pass &nbsp; unix:/var/run/php-fpm.sock;(其他sock路劲类似)
	</li>
</ol>
<p>
	<span style="color:#800000;"><strong><span style="font-size:x-large;">配置建议​</span></strong></span><br />
	脚本执行完后，有几个配置建议<br />
	<span style="color:#000080;"><span style="font-size:large;"><strong>一. 建议nginx.conf内的event节点增加&nbsp;use epoll; 选项，即为</strong></span></span>
</p>
<p style="margin-left: 40px;">
	<span style="color:#696969;"><span style="font-size:large;"><strong>events {<br />
	&nbsp;&nbsp; &nbsp;use epoll;<br />
	&nbsp;&nbsp; &nbsp;worker_connections 51200;<br />
	}</strong></span></span>
</p>
<p>
	<span style="color:#000080;"><span style="font-size:large;"><strong>二.&nbsp;建议 server include的cgi通用配置（默认是fastcgi_params）中添加以下选项</strong></span></span>
</p>
<p style="margin-left: 40px;">
	<span style="color:#696969;"><span style="font-size:large;"><strong>fastcgi_connect_timeout 300;<br />
	fastcgi_send_timeout 300;<br />
	fastcgi_read_timeout 300;<br />
	fastcgi_buffer_size 128k;<br />
	fastcgi_buffers 4 256k;<br />
	fastcgi_busy_buffers_size 256k;<br />
	fastcgi_temp_file_write_size 256k;<br />
	fastcgi_intercept_errors on;<br />
	fastcgi_param &nbsp;SCRIPT_FILENAME &nbsp; &nbsp;$document_root$fastcgi_script_name;</strong></span></span><br />
	<strong style="font-size: large; color: rgb(0, 0, 128); line-height: 1.6em;">并且server节点内的 fastcgi_param SCRIPT_FILENAME使用上诉文件的配置</strong>
</p>
<p>
	<font color="#000080" size="4"><b>三. 建议nginx.conf内的http节点增加以下配置，开启gzip压缩</b></font>
</p>
<p style="margin-left: 40px;">
	<span style="color:#696969;"><span style="font-size:large;">gzip on;<br />
	gzip_min_length &nbsp;1k;<br />
	gzip_buffers &nbsp; &nbsp; 4 16k;<br />
	gzip_http_version 1.0;<br />
	gzip_comp_level 2;<br />
	gzip_types &nbsp; &nbsp; &nbsp; text/plain text/css application/x-javascript text/xml application/xml application/xml+rss text/javascript;<br />
	gzip_vary on;</span></span>
</p>
<p>
	<font color="#000080" size="4"><b>​四. 建议/etc/php-fpm.conf内配置sendmail选项</b></font>
</p>
<p style="margin-left: 40px;">
	<span style="color:#696969;"><span style="font-size:large;">php_admin_value[sendmail_path] = /usr/sbin/sendmail -t -i -f admin@owent.net</span></span>
</p>
<p>
	<font color="#000080" size="4"><b>五. 根据服务器具体情况配置/etc/php-fpm.d/*.conf的的参数</b></font>
</p>
<p style="margin-left: 40px;">
	<span style="color:#696969;"><font size="4"><b>pm.max_children = 10<br />
	pm.start_servers = 2<br />
	pm.min_spare_servers = 3<br />
	pm.max_spare_servers = 5<br />
	;pm.max_requests = 500<br />
	php_admin_value[memory_limit] = 300M</b></font></span><br />
	<font color="#000080" size="4"><b>以上是我的配置，以及建议修改php,nginx,php-fpm,nginx 内 server所有日志文件位置</b></font>
</p>
