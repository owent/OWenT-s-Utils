window.Util = window.Util || {};

/**
 * Environment judge
 * Support browser: IE, Firefox, Chrome, Opera, Safari, Konqueror, Go
 * jQuery plugin
 * @version	1.6.1
 * @since	1.1
 * @example	var bro = new Util._TEnvironment();
 * @example	var bro = Util.getEnvironment();
 * @example	jQuery.environment;
 */
Util._TEnvironment = function () {
	// default names
	this._browserName = "Unknown";
	this._browserVersion = "Unknown";
	this._browserShort = "Unknown";
	this._addtional = "";
	this._OSName = "Unknown";
	this._kbrow = "Unknown";
	this._kos = "0.0";
	this._kver = "Unknown";
	this._platos = "32-Bit Edition";
	this._platbr = "32-Bit Edition";
	this._ismobileos = false;
	this._ismobilebr = false;
	this._cookieEnabled;
	this._platform = navigator.platform || undefined;
	this._userAgent;
	this._fakeopera = false;
	this._compatMode = document.compatMode? document.compatMode: "Unknown";
	this._isCompatMode = false;

	//---------
	var _this = this;

	this.toString = function () {
		var t = _this._browserName;
		if (_this._browserVersion != "Unknown")
			t += " " + _this._browserVersion;
		if (_this._platbr == "64-Bit Edition")
			t += " " + _this._platbr;
		if (_this._addtional != "")
			t += _this._addtional;
		if (_this._OSName != "Unknown")
			t += " on " + _this._OSName;
		if (_this._platos == "64-Bit Edition" && _this._kos != "Apple Darwin")
			t += " " + _this._platos;
		return t;
	};

	this.capture = function () {
		var ua = navigator.userAgent.toLowerCase();
		if (_this._kbrow == "Microsoft Trident by IE") {
			if (ua.match(/.net clr 2.0/))
				_this._dotnet2_0 = true;
			if (ua.match(/.net clr 3.0/))
				_this._dotnet3_0 = true;
			if (ua.match(/.net clr 3.5/))
				_this._dotnet3_5 = true;
			if (ua.match(/.net4.0c/)) {
				if (ua.match(/.net4.0e/))
					_this._dotnet4_0full = true;
				_this._dotnet4_0client = true;
			}
			try {
				var t = new ActiveXObject("AgControl.AgControl");
				_this._silverlight = true;
			} catch (e) {
			}
		} else {
			if (navigator.plugins["Silverlight Plug-In"]) {
				_this._silverlight = true;
			}
		}
		if (_this._silverlight) {
			if (_this.canRunSilverlight("5.0"))
				_this._silverlight5_0 = true;
			if (_this.canRunSilverlight("4.0"))
				_this._silverlight4_0 = true;
			if (_this.canRunSilverlight("3.0"))
				_this._silverlight3_0 = true;
			if (_this.canRunSilverlight("2.0"))
				_this._silverlight2_0 = true;
		}
	};

	this.canRunSilverlight = function (d) {
		if (!_this._silverlight)
			return false;
		var c = false, a = null;
		try {
			var b = null;
			var v = window.navigator.userAgent;
			if (_this._kbrow == "Microsoft Trident by IE") {
				b = new ActiveXObject("AgControl.AgControl");
			}
			else {
				a = document.createElement("div");
				document.body.appendChild(a);
				if (_this._kbrow == "Apple WebKit(KHTML based)")
					a.innerHTML = '<embed type="application/x-silverlight" />';
				else
					a.innerHTML = '<object type="application/x-silverlight"  data="data:," />';
				b = a.childNodes[0];
			}
			if (b.IsVersionSupported(d))
				c = true;
			b = null;
		} catch (e) {
			c = false;
		}
		try {
			if (a)
				document.body.removeChild(a);
		} catch (e) {
			a.innerHTML = "";
		}
		return c;
	}


	//init
	var init = (function () {
		//Copy
		_this._userAgent = navigator.userAgent;
		_this._cookieEnabled = navigator.cookieEnabled;
		var ua = _this._userAgent.toLowerCase();

		//OS
		if (ua.match(/windows/)) {
			if (ua.match(/windows ce/)) {
				_this._OSName = "Microsoft Windows CE/Windows Mobile";
				_this._ismobileos = true;
			} else if (ua.match(/windows 95/)) {
				_this._OSName = "Microsoft Windows 95";
			} else if (ua.match(/windows 98/)) {
				if (ua.match(/win 9x 4.90/))
					_this._OSName = "Microsoft Windows ME";
				else
					_this._OSName = "Microsoft Windows 98";
			} else if (ua.match(/windows phone os/)) {
				try {
					var t_ver = ua.match(/windows phone os ([\d.]+)/)[1];
					_this._OSName = "Microsoft Windows Phone " + t_ver;
				} catch (e) {
					_this._OSName = "Microsoft Windows Phone";
				}
				_this._ismobileos = true;
			} else if (ua.match(/windows nt/)) {
				try {
					var t_ver = ua.match(/windows nt ([\d.]+)/)[1];
					var is64 = false;
					if (ua.match(/win64|wow64|x64|ia64/)) {
						is64 = true;
						_this._platos = "64-Bit Edition";
					}
					if (t_ver == "6.2") {
						_this._OSName = "Microsoft Windows 8";
					} else if (t_ver == "6.1") {
						_this._OSName = "Microsoft Windows 7/Windows Server 2008 R2";
					} else if (t_ver == "6.0") {
						_this._OSName = "Microsoft Windows Vista/Windows Server 2008";
					} else if (t_ver == "5.2") {
						if (is64)
							_this._OSName = "Microsoft Windows XP/Windows Server 2003";
						else
							_this._OSName = "Microsoft Windows Server 2003";
					} else if (t_ver == "5.1") {
						_this._OSName = "Microsoft Windows XP";
					} else if (t_ver == "5.0") {
						_this._OSName = "Microsoft Windows 2000";
					} else {
						_this._OSName = "Microsoft Windows NT";
					}
				} catch (e) {
					_this._OSName = "Microsoft Windows NT";
				}
			} else
				_this._OSName = "Microsoft Windows";
			_this._kos = "Microsoft Windows";
		} else if (ua.match(/linux/)) {
			if (ua.match(/android/)) {
				try {
					var t_ver = ua.match(/android ([\d.]+)/)[1];
					_this._OSName = "Google Android " + t_ver;
				} catch (e) {
					_this._OSName = "Google Android";
				}
				_this._ismobileos = true;
			} else if (ua.match(/ubuntu|fedora|redhat|debian|suse/)) {
				var strs = ['Ubuntu', 'Fedora', 'RedHat', 'Debian', 'SUSE'];
				var tmp = "Unknown";
				for (var i = 0; i < strs.length; i++) {
					if (ua.match(strs[i].toLowerCase())) {
						tmp = strs[i];
						break;
					}
				}
				tmp += " Linux";
				_this._OSName = tmp;
			}
			else
				_this._OSName = "Linux";
			if (ua.match(/x86_64/))
				_this._platos = "64-Bit Edition";
			_this._kos = "OpenSource Linux";
		} else if (ua.match(/macintosh|iphone|ipad|ipod/)) {
			if (ua.match(/macintosh/)) {
				_this._OSName = "Apple Mac OS X";
			} else {
				_this._OSName = "Apple iOS";
				_this._ismobileos = true;
			}
			try {
				var t_ver = ua.match(/(ppc mac os x|intel mac os x|cpu iphone os|cpu os) ([\d_]+)/)[2];
				t_ver = t_ver.replace(/_/g, ".");
				_this._OSName += " " + t_ver;
			} catch (e) {
			}
			if (_this._OSName.match(/Apple Mac OS X 10.(6|7)/)) {
				_this._platos = "64-Bit Edition";
			}
			_this._kos = "Apple Darwin";
		} else if (ua.match(/blackberry/)) {
			_this._OSName = "BlackBerry OS";
			_this._kos = "RIM";
			_this._ismobileos = true;
		} else if (ua.match(/symbianos|symbos/)) {
			_this._OSName = "Nokia Symbian";
			_this._kos = "Nokia Symbian";
			_this._ismobileos = true;
		} else if (ua.match(/solaris|sunos/)) {
			_this._OSName = "Sun Solaris";
			_this._kos = "OpenSource Unix-Like";
		} else if (ua.match(/bsd/)) {
			if (ua.match(/freebsd|openbsd/))
				_this._OSName = _this._userAgent.match(/freebsd|openbsd/i)[1] + " OS";
			else
				_this._OSName = "BSD";
			_this._kos = "OpenSource Unix-Like";
		} else if (ua.match(/j2me/)) {
			_this._OSName = "J2ME OS- java based environment";
			_this._ismobileos = true;
		}

		//Browser
		if (_this._ismobileos)
			_this._ismobilebr = true;

		//Opera
		if (ua.match(/opera|pesto/)) {
			_this._browserShort = "Opera";
			_this._browserName = "Opera ";
			//Opera Mobile
			if (ua.indexOf("opera mobi") != -1) {
				_this._browserName = "Opera Mobile ";
				_this._ismobilebr = true;
			}
			//Opera Mini
			if (ua.indexOf("opera mini") != -1) {
				_this._browserName = "Opera Mini ";
				_this._ismobilebr = true;
			}
			if (ua.match(/mozilla/)) {
				_this._browserVersion = ua.match(/opera ([\w.]+)/)[1];
				_this._fakeopera = true;
			} else {
				_this._browserVersion = ua.match(/version\/([\w.]+)/)[1];
				_this._kver = ua.match(/presto\/([\w.]+)/)[1];
			}
			_this._kbrow = "OpenSource Presto";
		}

		//Trident(Microsoft Internet Explorer Based)
		else if (ua.match(/msie|trident/)) {

			//The World
			if (ua.match(/theworld/)) {
				_this._browserShort = "TheWorld";
				_this._browserName = "TheWorld Browser";
				_this._browserVersion = "";
				_this._addtional = " with Microsoft Internet Explorer " + ua.match(/msie ([\w.]+)/)[1] + " kernel";
			}
			//Tencent Traveler
			else if (ua.match(/tencenttraveler/)) {
				_this._browserShort = "Traveler";
				_this._browserName = "Tencent Traveler ";
				_this._browserVersion = ua.match(/tencenttraveler ([\w.]+)/)[1];
				_this._addtional = " with Microsoft Internet Explorer " + ua.match(/msie ([\w.]+)/)[1] + " kernel";
			}
			//Maxthon
			else if (ua.match(/maxthon/)) {
				_this._browserShort = "Maxthon";
				_this._browserName = "Maxthon ";
				if (ua.match(/maxthon(\/| )([\w.]+)/)) {
					_this._browserVersion = ua.match(/maxthon(\/| )([\w.]+)/)[1];
				} else {
					_this._browserVersion = "1.0";
				}
				_this._addtional = " with Microsoft Internet Explorer " + ua.match(/msie ([\w.]+)/)[1] + " kernel";
			}
			//Avant
			else if (ua.match(/avant/)) {
				_this._browserShort = "avant";
				_this._browserName = "avant Browser ";
				_this._addtional = " with Microsoft Internet Explorer " + ua.match(/msie ([\w.]+)/)[1] + " kernel";
			}
			//360SE
			else if (ua.match(/360se/)) {
				_this._browserShort = "360SE";
				_this._browserName = "Qihoo 360 Safe Browser ";
				_this._addtional = " with Microsoft Internet Explorer " + ua.match(/msie ([\w.]+)/)[1] + " kernel";
			}
			//Sogou
			else if (ua.match(/se ([\d.]+)/)) {
				_this._browserShort = "Sogou";
				_this._browserName = "Sohu Sogou ";
				_this._browserVersion = ua.match(/se ([\w.]+)/)[1];
				_this._addtional = " with Microsoft Internet Explorer " + ua.match(/msie ([\w.]+)/)[1] + " kernel";
			}

			//Microsoft Internet Explorer && Internet Explorer Mobile
			else {
				_this._browserShort = "IE";
				_this._browserName = "Microsoft Internet Explorer ";
				var check_ver = ua.match(/msie ([\w.]+)/);
				if (check_ver && check_ver.length > 1)
					_this._browserVersion = check_ver[1];
				else
					_this._browserVersion = ua.match(/trident\/([\w.]+)/)[1] + "(内核)[已知IE 11的内核版本为7]" ;
				
				if (_this._platos == "64-Bit Edition") {
					if (ua.match(/win64|x64|ia64/)) {
						_this._platbr = "64-Bit Edition"
					}
				}
				if (ua.match(/iemobile/)) {
					_this._ismobilebr = true;
				}
			}

			_this._kbrow = "Microsoft Trident by IE";
			var check_kernel_ver = ua.match(/trident\/([\w.]+)/);
			if (check_kernel_ver)
				_this._kver = check_kernel_ver[1];
			else
				_this._kver = "Unknown";
				
			if (parseInt(_this._kver) == 7 && ua.match(/trident/))
				_this._isCompatMode = true;
		}

		//KHTML(KDE Konqueror)
		else if (ua.match(/konqueror|khtml|safari|applewebkit/)) {
			//Webkit(Apple Safari)
			if (ua.match(/safari|applewebkit/)) {
				//Tencent Traveler
				if (ua.match(/tencenttraveler/)) {
					_this._browserShort = "Traveler";
					_this._browserName = "Tencent Traveler ";
					_this._browserVersion = ua.match(/tencenttraveler ([\w.]+)/)[1];
					_this._addtional = " with Apple Safari kernel";
				}
				//Maxthon
				else if (ua.match(/maxthon/)) {
					_this._browserShort = "Maxthon";
					_this._browserName = "Maxthon ";
					if (ua.match(/maxthon(\/| )([\w.]+)/)) {
						_this._browserVersion = ua.match(/maxthon(\/| )([\w.]+)/)[1];
					} else {
						_this._browserVersion = "1.0";
					}
					_this._addtional = " with Apple Safari kernel";
				}
				//360SE
				else if (ua.match(/360se/)) {
					_this._browserShort = "360SE";
					_this._browserName = "Qihoo 360 Safe Browser ";
					_this._addtional = " with Apple Safari kernel";
				}
				//Sogou
				else if (ua.match(/se ([\d.]+)/)) {
					_this._browserShort = "Sogou";
					_this._browserName = "Sohu Sogou ";
					_this._browserVersion = ua.match(/se ([\w.]+)/)[1];
					_this._addtional = " with Apple Safari kernel";
				}
				//BrowserNG
				else if (ua.match(/browserng/)) {
					_this._browserShort = "BrowNG";
					_this._browserName = "Nokia BrowserNG ";
					_this._browserVersion = ua.match(/browserng\/([\w.]+)/)[1];
					_this._addtional = " with Apple Safari kernel";
					_this._ismobilebr = true;
				}
				//Google Chrome && Chrome Lite
				else if (ua.match(/chrome|chromium|android/)) {
					//Chrome Plus
					if (ua.match(/chromeplus/)) {
						_this._browserShort = "Chrome Plus";
						_this._browserName = "Chrome Plus ";
						_this._browserVersion = ua.match(/chromeplus\/([\w.]+)/)[1];
						_this._addtional = " with Google Chrome kernel";
					} else {
						//Google Chrome && Chrome Lite
						_this._browserShort = "Chrome";
						_this._browserName = "Google Chrome ";
						if (ua.match(/android/) && ua.match(/version\/([\w.]+)/)) {
							_this._browserName = "Google Chrome Lite ";
							_this._browserVersion = ua.match(/version\/([\w.]+)/)[1];
							_this._ismobilebr = true;
						} else if (ua.match(/chrome/)) {
							_this._browserVersion = ua.match(/chrome\/([\w.]+)/)[1];
						} else {
							_this._browserVersion = ua.match(/chromium\/([\w.]+)/)[1];
						}
					}
				}

				//Apple Safari
				else {
					_this._browserShort = "Safari";
					_this._browserName = "Apple Safari ";
					_this._browserVersion = ua.match(/version\/([\w.]+)/)[1];
					if (_this._platos == "64-Bit Edition") {
						_this._platbr = "64-Bit Edition"
					}
				}
				_this._kbrow = "Apple WebKit(KHTML based)";
				_this._kver = ua.match(/applewebkit\/([\w.]+)/)[1];
			} else {
				//Konqueror
				_this._browserShort = "Konqueror";
				_this._browserName = "KDE Konqueror ";
				_this._browserVersion = ua.match(/konqueror\/([\w.]+)/)[1];
				_this._kbrow = "OpenSource KHTML";
				_this._kver = ua.match(/khtml\/([\w.]+)/)[1];
			}
		}

		//Mozilla FireFox
		else if (ua.match(/firefox|gecko/)) {
			_this._browserShort = "FF";
			_this._browserName = "Mozilla FireFox ";
			_this._browserVersion = ua.match(/firefox\/([\w.]+)/)[1];
			_this._kbrow = "OpenSource Gecko";
			_this._kver = ua.match(/gecko\/([\w.]+)/)[1];
		}

		//Go Browser
		else if (ua.match(/gobrowser/)) {
			_this._browserShort = "GoBrow";
			_this._browserName = "Nokia Go Browser ";
			_this._browserVersion = ua.match(/gobrowser\/([\w.]+)/)[1];
			_this._ismobilebr = true;
		}

		_this.capture();
	})();
};

/**
 * Get the information of current environment.
 * @package Util
 * @return The information of current environment.
 * @example	var bro = Util.getEnvironment();
 * @version	1.6.1
 * @since	1.1
 */
Util.getEnvironment = function(){ return new Util._TEnvironment(); };

try{ if(jQuery) jQuery.extend({ environment: Util.getEnvironment() }); } catch (e) {}
