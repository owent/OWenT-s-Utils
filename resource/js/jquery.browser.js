var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Util;
(function (Util) {
    var TEnvVersionInfo = (function () {
        function TEnvVersionInfo(str) {
            this.version = str;
        }
        TEnvVersionInfo.prototype.toString = function () {
            return this.version;
        };
        TEnvVersionInfo.GetVersion = function GetVersion(strSrc, reg, pos) {
            var res = strSrc.match(reg);
            if(res && res.length > pos) {
                return new TEnvVersionInfo(res[pos]);
            }
            return null;
        };
        TEnvVersionInfo.__less_than_obj = {
            ok: function (l, r) {
                return l < r;
            },
            fail: function (l, r) {
                return l > r;
            },
            ret: function (lg, rg) {
                return lg.length < rg.length;
            }
        };
        TEnvVersionInfo.__equal_obj = {
            ok: function (l, r) {
                return false;
            },
            fail: function (l, r) {
                return l != r;
            },
            ret: function (lg, rg) {
                return lg.length == rg.length;
            }
        };
        TEnvVersionInfo.__less_equal_than_obj = {
            ok: function (l, r) {
                return l < r;
            },
            fail: function (l, r) {
                return l > r;
            },
            ret: function (lg, rg) {
                return lg.length <= rg.length;
            }
        };
        TEnvVersionInfo.prototype.compare = function (right, cmp_func) {
            var cpgl = this.version.split(".");
            var cpgr = right.version.split(".");
            for(var i = 0; i < cpgl.length && i < cpgr.length; ++i) {
                var _check = cmp_func.ok(cpgl[i], cpgr[i]);
                if(_check) {
                    return true;
                }
                _check = cmp_func.fail(cpgl[i], cpgr[i]);
                if(_check) {
                    return false;
                }
            }
            return cmp_func.ret;
        };
        TEnvVersionInfo.prototype.lessThan = function (right) {
            return this.compare(right, TEnvVersionInfo.__less_than_obj);
        };
        TEnvVersionInfo.prototype.greaterThan = function (right) {
            return right.lessThan(this);
        };
        TEnvVersionInfo.prototype.equal = function (right) {
            return this.compare(right, TEnvVersionInfo.__equal_obj);
        };
        TEnvVersionInfo.prototype.lessEqualThan = function (right) {
            return this.compare(right, TEnvVersionInfo.__less_equal_than_obj);
        };
        TEnvVersionInfo.prototype.greaterEqualThan = function (right) {
            return right.lessEqualThan(this);
        };
        return TEnvVersionInfo;
    })();
    Util.TEnvVersionInfo = TEnvVersionInfo;    
    ;
    ;
    var TEnvOriData = (function () {
        function TEnvOriData() { }
        return TEnvOriData;
    })();
    Util.TEnvOriData = TEnvOriData;    
    ;
    var TEnvSystemInfoBase = (function () {
        function TEnvSystemInfoBase(ori) {
            this.strPlatform = ori.nav.platform || "Unknown";
        }
        TEnvSystemInfoBase.prototype.getOSName = function () {
            return "Unknown";
        };
        TEnvSystemInfoBase.prototype.getOSKernel = function () {
            return this.getOSName();
        };
        TEnvSystemInfoBase.prototype.getPlatform = function () {
            return this.strPlatform;
        };
        TEnvSystemInfoBase.prototype.getArchitecture = function () {
            return "x86";
        };
        TEnvSystemInfoBase.prototype.isMobile = function () {
            return false;
        };
        return TEnvSystemInfoBase;
    })();    
    ;
    var TEnvSystemWindowsInfo = (function (_super) {
        __extends(TEnvSystemWindowsInfo, _super);
        function TEnvSystemWindowsInfo(ori) {
                _super.call(this, ori);
            this.strOSName = "Windows";
            this.strOSKernel = "Windows";
            this.strArchitecture = "x86";
            this.bIsMobile = false;
            this._init_branch(ori.userAgent);
        }
        TEnvSystemWindowsInfo.__nt_kernel_name_map = {
            "6.3": "Microsoft Windows 8.1/Microsoft Windows RT 8.1/Windows Server 2012 R2",
            "6.2": "Microsoft Windows 8/Microsoft Windows RT/Windows Server 2012",
            "6.1": "Microsoft Windows 7/Windows Server 2008 R2",
            "6.0": "Microsoft Windows Vista/Windows Server 2008",
            "5.2": "Windows Server 2003",
            "5.1": "Microsoft Windows XP",
            "5.0": "Microsoft Windows 2000"
        };
        TEnvSystemWindowsInfo.prototype.getOSName = function () {
            return this.strOSName;
        };
        TEnvSystemWindowsInfo.prototype.getOSKernel = function () {
            return this.strOSKernel;
        };
        TEnvSystemWindowsInfo.prototype.getArchitecture = function () {
            return this.strArchitecture;
        };
        TEnvSystemWindowsInfo.prototype.isMobile = function () {
            return this.bIsMobile;
        };
        TEnvSystemWindowsInfo.prototype._init_branch = function (ua) {
            do {
                if(ua.match(/windows nt/i)) {
                    var t_ver = TEnvVersionInfo.GetVersion(ua, /windows nt ([\d.]+)/i, 1);
                    this.strOSKernel = "Windows NT " + t_ver;
                    if(ua.match(/ia64/i)) {
                        this.strArchitecture = "ia64";
                    } else if(ua.match(/win64|wow64|x64|x86_64/i)) {
                        this.strArchitecture = "x86_64";
                    }
                    if(this.strArchitecture == "ia64" && "5.2" == t_ver.toString()) {
                        this.strOSName = "Microsoft Windows XP/Windows Server 2003";
                    } else if(TEnvSystemWindowsInfo.__nt_kernel_name_map[t_ver.toString()]) {
                        this.strOSName = TEnvSystemWindowsInfo.__nt_kernel_name_map[t_ver.toString()];
                    } else {
                        this.strOSName = "Windows NT Kernel " + t_ver.toString();
                    }
                    break;
                }
                var t_ver = TEnvVersionInfo.GetVersion(ua, /windows phone os ([\d.]+)/i, 1);
                if(null !== t_ver) {
                    this.strOSName = "Microsoft Windows Phone " + t_ver.toString();
                    this.strArchitecture = "ARM";
                    this.bIsMobile = true;
                    break;
                }
                t_ver = TEnvVersionInfo.GetVersion(ua, /windows phone ([\d.]+)/i, 1);
                if(null !== t_ver) {
                    this.strOSName = "Microsoft Windows Phone " + t_ver.toString();
                    this.bIsMobile = true;
                    break;
                }
                if(ua.match(/windows ce/i)) {
                    this.strOSName = "Microsoft Windows CE/Windows Mobile";
                    this.strArchitecture = "ARM";
                    this.bIsMobile = true;
                    break;
                }
                if(ua.match(/windows 95/i)) {
                    this.strOSName = "Microsoft Windows 95";
                    break;
                }
                if(ua.match(/windows 98/i)) {
                    if(ua.match(/win 9x 4.90/i)) {
                        this.strOSName = "Microsoft Windows ME";
                    } else {
                        this.strOSName = "Microsoft Windows 98";
                    }
                    break;
                }
            }while(false);
            if(ua.match(/xbox/i)) {
                this.strOSName = "Microsoft XBox";
            }
            if(ua.match(/arm/i)) {
                this.strArchitecture = "ARM";
            }
        };
        return TEnvSystemWindowsInfo;
    })(TEnvSystemInfoBase);    
    ;
    var TEnvSystemLinuxInfo = (function (_super) {
        __extends(TEnvSystemLinuxInfo, _super);
        function TEnvSystemLinuxInfo(ori) {
                _super.call(this, ori);
            this.strOSName = "Linux";
            this.strOSKernel = "Linux";
            this.strArchitecture = "x86";
            this.bIsMobile = false;
            this._init_branch(ori.userAgent);
        }
        TEnvSystemLinuxInfo.prototype.getOSName = function () {
            return this.strOSName;
        };
        TEnvSystemLinuxInfo.prototype.getOSKernel = function () {
            return this.strOSKernel;
        };
        TEnvSystemLinuxInfo.prototype.getArchitecture = function () {
            return this.strArchitecture;
        };
        TEnvSystemLinuxInfo.prototype.isMobile = function () {
            return this.bIsMobile;
        };
        TEnvSystemLinuxInfo.prototype._init_branch = function (ua) {
            do {
                if(ua.match(/android/i)) {
                    this.strArchitecture = "ARM";
                    this.strOSName = "Google Android";
                    var t_ver = TEnvVersionInfo.GetVersion(ua, /android ([\d.]+)/i, 1);
                    if(null !== t_ver) {
                        this.strOSName += " " + t_ver.toString();
                    }
                    break;
                }
                var pub_linux_reg = [
                    /Ubuntu/i, 
                    /Fedora/i, 
                    /RedHat/i, 
                    /Debian/i, 
                    /SUSE/i, 
                    /CentOS/i
                ];
                for(var i = 0; i < pub_linux_reg.length; ++i) {
                    if(ua.match(pub_linux_reg[i])) {
                        this.strOSName = pub_linux_reg[i].source + " Linux";
                        break;
                    }
                }
            }while(false);
            if(ua.match(/mobile/i) || ua.match(/tablet/i)) {
                this.bIsMobile = true;
            }
            do {
                if(ua.match(/x86_64/i)) {
                    this.strArchitecture = "x86_64";
                    break;
                }
                if(ua.match(/arm/i)) {
                    this.strArchitecture = "ARM";
                    break;
                }
            }while(false);
        };
        return TEnvSystemLinuxInfo;
    })(TEnvSystemInfoBase);    
    ;
    var TEnvSystemMacIOSInfo = (function (_super) {
        __extends(TEnvSystemMacIOSInfo, _super);
        function TEnvSystemMacIOSInfo(ori) {
                _super.call(this, ori);
            this.strOSName = "Mac";
            this.strOSKernel = "Mac";
            this.strArchitecture = "x86";
            this.bIsMobile = false;
            this._init_branch(ori.userAgent);
        }
        TEnvSystemMacIOSInfo.prototype.getOSName = function () {
            return this.strOSName;
        };
        TEnvSystemMacIOSInfo.prototype.getOSKernel = function () {
            return this.strOSKernel;
        };
        TEnvSystemMacIOSInfo.prototype.getArchitecture = function () {
            return this.strArchitecture;
        };
        TEnvSystemMacIOSInfo.prototype.isMobile = function () {
            return this.bIsMobile;
        };
        TEnvSystemMacIOSInfo.prototype._init_branch = function (ua) {
            do {
                if(ua.match(/macintosh/i)) {
                    this.strOSName = "Apple Mac OS X";
                    break;
                } else {
                    this.strArchitecture = "ARM";
                    this.strOSName = "Apple iOS";
                    break;
                }
            }while(false);
            if(ua.match(/mobile/i)) {
                this.bIsMobile = true;
            }
            var _ver_str = ua.match(/(ppc mac os x|intel mac os x|cpu iphone os|cpu os) ([\d_]+)/i);
            if(_ver_str && _ver_str.length > 2) {
                var t_ver = new TEnvVersionInfo(_ver_str[2].replace(/_/g, "."));
                this.strOSName += " " + t_ver.toString();
                if(this.strOSName == "Apple Mac OS X") {
                    if(t_ver.greaterEqualThan(new TEnvVersionInfo("10.6"))) {
                        this.strArchitecture = "x86_64";
                    } else if(ua.match(/ppc mac os x/i)) {
                        this.strArchitecture = "PowerPC";
                    }
                }
            }
            this.strOSKernel = "Apple Darwin";
        };
        return TEnvSystemMacIOSInfo;
    })(TEnvSystemInfoBase);    
    ;
    var TEnvSystemOtherInfo = (function (_super) {
        __extends(TEnvSystemOtherInfo, _super);
        function TEnvSystemOtherInfo(ori) {
                _super.call(this, ori);
            this.strOSName = "Unknown";
            this.strOSKernel = "Unknown";
            this.strArchitecture = "x86";
            this.bIsMobile = false;
            this._init_branch(ori.userAgent);
        }
        TEnvSystemOtherInfo.prototype.getOSName = function () {
            return this.strOSName;
        };
        TEnvSystemOtherInfo.prototype.getOSKernel = function () {
            return this.strOSKernel;
        };
        TEnvSystemOtherInfo.prototype.getArchitecture = function () {
            return this.strArchitecture;
        };
        TEnvSystemOtherInfo.prototype.isMobile = function () {
            return this.bIsMobile;
        };
        TEnvSystemOtherInfo.prototype._init_branch = function (ua) {
            do {
                if(ua.match(/blackberry/i)) {
                    this.strOSName = "BlackBerry OS";
                    this.strOSKernel = "RIM";
                    this.strArchitecture = "ARM";
                    this.bIsMobile = true;
                    break;
                }
                if(ua.match(/symbianos|symbos/i)) {
                    this.strOSName = "Nokia Symbian";
                    this.strOSKernel = "Nokia Symbian";
                    this.strArchitecture = "ARM";
                    this.bIsMobile = true;
                    break;
                }
                if(ua.match(/solaris|sunos/i)) {
                    this.strOSName = "Sun Solaris";
                    this.strOSKernel = "OpenSource Unix-Like";
                    break;
                }
                if(ua.match(/bsd/i)) {
                    this.strOSName = ua.match(/\w*bsd/i)[0];
                    this.strOSKernel = "BSD";
                    break;
                }
                if(ua.match(/j2me/i)) {
                    this.strOSName = "J2ME OS- java based environment";
                    this.strOSKernel = "J2ME";
                    this.strArchitecture = "Unknown";
                    this.bIsMobile = true;
                    break;
                }
            }while(false);
        };
        return TEnvSystemOtherInfo;
    })(TEnvSystemInfoBase);    
    ;
    ;
    var TEnvBrowserInfoBase = (function () {
        function TEnvBrowserInfoBase(ori, sysInfo) {
            this.strRenderMode = "Unknown";
            this.strBrowserArchitecture = "x86";
            this.bIsCookieEnabled = false;
            this.bIsMobile = false;
            this.strRenderMode = ori.doc.compatMode || this.strRenderMode;
            this.strBrowserArchitecture = sysInfo.getArchitecture();
            this.bIsCookieEnabled = ori.nav.cookieEnabled || "Unknown";
            this.bIsMobile = sysInfo.isMobile();
        }
        TEnvBrowserInfoBase.prototype.getBrowserName = function () {
            return "Unknown";
        };
        TEnvBrowserInfoBase.prototype.getBrowserShortName = function () {
            return "Unknown";
        };
        TEnvBrowserInfoBase.prototype.getBrowserVersion = function () {
            return new TEnvVersionInfo("0");
        };
        TEnvBrowserInfoBase.prototype.getBrowserKernelName = function () {
            return "Unknown";
        };
        TEnvBrowserInfoBase.prototype.getBrowserKernelVersion = function () {
            return new TEnvVersionInfo("0");
        };
        TEnvBrowserInfoBase.prototype.getBrowserRenderMode = function () {
            return this.strRenderMode;
        };
        TEnvBrowserInfoBase.prototype.getAdditional = function () {
            return "";
        };
        TEnvBrowserInfoBase.prototype.getBrowserArchitecture = function () {
            return this.strBrowserArchitecture;
        };
        TEnvBrowserInfoBase.prototype.isMobile = function () {
            return this.bIsMobile;
        };
        TEnvBrowserInfoBase.prototype.isCompatMode = function () {
            return false;
        };
        TEnvBrowserInfoBase.prototype.isCookieEnabled = function () {
            return this.bIsCookieEnabled;
        };
        return TEnvBrowserInfoBase;
    })();    
    ;
    var TEnvBrowserOperaInfo = (function (_super) {
        __extends(TEnvBrowserOperaInfo, _super);
        function TEnvBrowserOperaInfo(ori, sysInfo) {
                _super.call(this, ori, sysInfo);
            this.strBrowserName = "Opera";
            this.strBrowserShortName = "Opera";
            this.strBrowserKernelName = "Presto";
            this.bIsMobile = false;
            this.bIsMobile = sysInfo.isMobile();
            this._init_branch(ori.userAgent, sysInfo);
        }
        TEnvBrowserOperaInfo.prototype.getBrowserName = function () {
            return this.strBrowserName;
        };
        TEnvBrowserOperaInfo.prototype.getBrowserShortName = function () {
            return this.strBrowserShortName;
        };
        TEnvBrowserOperaInfo.prototype.getBrowserVersion = function () {
            return this.stBrowserVersion;
        };
        TEnvBrowserOperaInfo.prototype.getBrowserKernelName = function () {
            return this.strBrowserKernelName;
        };
        TEnvBrowserOperaInfo.prototype.getBrowserKernelVersion = function () {
            return this.stBrowserKernelVersion;
        };
        TEnvBrowserOperaInfo.prototype.isMobile = function () {
            return this.bIsMobile;
        };
        TEnvBrowserOperaInfo.prototype._init_branch = function (ua, sysInfo) {
            do {
                if(ua.match(/opera mobi/i)) {
                    this.strBrowserName = "Opera Mobile";
                    this.bIsMobile = true;
                    break;
                }
                if(ua.match(/opera mini/i)) {
                    this.strBrowserName = "Opera Mini";
                    this.bIsMobile = true;
                    break;
                }
            }while(false);
            do {
                if(ua.match(/mozilla/i)) {
                    this.stBrowserVersion = this.stBrowserKernelVersion = TEnvVersionInfo.GetVersion(ua, /opera ([\w.]+)/i, 1);
                    break;
                }
                if(ua.match(/opera mini/i)) {
                    this.stBrowserVersion = TEnvVersionInfo.GetVersion(ua, /version\/([\w.]+)/i, 1);
                    this.stBrowserKernelVersion = TEnvVersionInfo.GetVersion(ua, /presto\/([\w.]+)/i, 1);
                    break;
                }
                this.stBrowserVersion = this.stBrowserKernelVersion = TEnvVersionInfo.GetVersion(ua, /version\/([\w.]+)/i, 1) || new TEnvVersionInfo("0");
            }while(false);
        };
        return TEnvBrowserOperaInfo;
    })(TEnvBrowserInfoBase);    
    ;
    var TEnvBrowserIEInfo = (function (_super) {
        __extends(TEnvBrowserIEInfo, _super);
        function TEnvBrowserIEInfo(ori, sysInfo) {
                _super.call(this, ori, sysInfo);
            this.strBrowserName = "Internet Explorer";
            this.strBrowserShortName = "IE";
            this.strBrowserKernelName = "Trident";
            this.strBrowserArchitecture = "x86";
            this.bIsMobile = false;
            this.strAdditional = "";
            this.bIsCompatMode = false;
            this.bIsMobile = sysInfo.isMobile();
            this._init_branch(ori.userAgent, sysInfo);
            if(ori.nav.cpuClass) {
                this.strBrowserArchitecture = ori.nav.cpuClass;
            }
        }
        TEnvBrowserIEInfo.prototype.getBrowserName = function () {
            return this.strBrowserName;
        };
        TEnvBrowserIEInfo.prototype.getBrowserShortName = function () {
            return this.strBrowserShortName;
        };
        TEnvBrowserIEInfo.prototype.getBrowserVersion = function () {
            return this.stBrowserVersion;
        };
        TEnvBrowserIEInfo.prototype.getBrowserKernelName = function () {
            return this.strBrowserKernelName;
        };
        TEnvBrowserIEInfo.prototype.getBrowserKernelVersion = function () {
            return this.stBrowserKernelVersion;
        };
        TEnvBrowserIEInfo.prototype.getAdditional = function () {
            return this.strAdditional;
        };
        TEnvBrowserIEInfo.prototype.getBrowserArchitecture = function () {
            return this.strBrowserArchitecture;
        };
        TEnvBrowserIEInfo.prototype.isMobile = function () {
            return this.bIsMobile;
        };
        TEnvBrowserIEInfo.prototype.isCompatMode = function () {
            return this.bIsCompatMode;
        };
        TEnvBrowserIEInfo.prototype._init_branch = function (ua, sysInfo) {
            var _checked_ie_version = TEnvVersionInfo.GetVersion(ua, /msie ([\w.]+)/i, 1);
            if(null === _checked_ie_version) {
                _checked_ie_version = TEnvVersionInfo.GetVersion(ua, /rv:([\w.]+)/i, 1);
            }
            if(null === _checked_ie_version) {
                this.stBrowserVersion = new TEnvVersionInfo("");
            }
            this.stBrowserVersion = _checked_ie_version;
            this.stBrowserKernelVersion = TEnvVersionInfo.GetVersion(ua, /trident\/([\w.]+)/i, 1);
            if(null == this.stBrowserKernelVersion) {
                this.stBrowserKernelVersion = new TEnvVersionInfo("Unkown");
            }
            do {
                if(ua.match(/theworld/i)) {
                    this.strBrowserName = "TheWorld Browser";
                    this.strBrowserShortName = "TheWorld";
                    this.strAdditional = " with Microsoft Internet Explorer " + _checked_ie_version.toString();
                    break;
                }
                if(ua.match(/qqbrowser/i)) {
                    this.strBrowserName = "Tencent QQBrowser";
                    this.strBrowserShortName = "QQBrowser";
                    this.stBrowserVersion = TEnvVersionInfo.GetVersion(ua, /qqbrowser ([\w.]+)/i, 1) || new TEnvVersionInfo("");
                    this.strAdditional = " with Microsoft Internet Explorer " + _checked_ie_version.toString();
                    break;
                }
                if(ua.match(/tencenttraveler/i)) {
                    this.strBrowserName = "Tencent Traveler";
                    this.strBrowserShortName = "Traveler";
                    this.stBrowserVersion = TEnvVersionInfo.GetVersion(ua, /tencenttraveler ([\w.]+)/i, 1) || new TEnvVersionInfo("");
                    this.strAdditional = " with Microsoft Internet Explorer " + _checked_ie_version.toString();
                    break;
                }
                if(ua.match(/maxthon/i)) {
                    this.strBrowserName = "Maxthon";
                    this.strBrowserShortName = "Maxthon";
                    this.stBrowserVersion = TEnvVersionInfo.GetVersion(ua, /maxthon(\/| )([\w.]+)/i, 1) || new TEnvVersionInfo("1.0");
                    this.strAdditional = " with Microsoft Internet Explorer " + _checked_ie_version.toString();
                    break;
                }
                if(ua.match(/avant/i)) {
                    this.strBrowserName = "Avant Browser";
                    this.strBrowserShortName = "Avant";
                    this.strAdditional = " with Microsoft Internet Explorer " + _checked_ie_version.toString();
                    break;
                }
                if(ua.match(/360se/i)) {
                    this.strBrowserName = "Qihoo 360 Safe Browser";
                    this.strBrowserShortName = "360SE";
                    this.strAdditional = " with Microsoft Internet Explorer " + _checked_ie_version.toString();
                    break;
                }
                if(ua.match(/se ([\d.]+)/i)) {
                    this.strBrowserName = "Sohu Sogou";
                    this.strBrowserShortName = "Sogou";
                    this.stBrowserVersion = TEnvVersionInfo.GetVersion(ua, /se ([\w.]+)/i, 1) || new TEnvVersionInfo("1.0");
                    this.strAdditional = " with Microsoft Internet Explorer " + _checked_ie_version.toString();
                    break;
                }
            }while(false);
            if(ua.match(/ia64/i)) {
                this.strBrowserArchitecture = "IA64";
            } else if(ua.match(/win64|x64|x86_64/i)) {
                this.strBrowserArchitecture = "x86_64";
            }
            if(ua.match(/iemobile/i)) {
                this.bIsMobile = true;
            }
            if(parseInt(_checked_ie_version.toString()) == 7 && this.stBrowserKernelVersion.greaterEqualThan(new TEnvVersionInfo("4"))) {
                this.bIsCompatMode = true;
            }
        };
        return TEnvBrowserIEInfo;
    })(TEnvBrowserInfoBase);    
    ;
    var TEnvBrowserWebkitInfo = (function (_super) {
        __extends(TEnvBrowserWebkitInfo, _super);
        function TEnvBrowserWebkitInfo(ori, sysInfo) {
                _super.call(this, ori, sysInfo);
            this.strBrowserName = "Apple Safari";
            this.strBrowserShortName = "Safari";
            this.strBrowserKernelName = "Webkit";
            this.bIsMobile = false;
            this.strAdditional = "";
            this.bIsMobile = sysInfo.isMobile();
            this._init_branch(ori.userAgent, sysInfo);
        }
        TEnvBrowserWebkitInfo.prototype.getBrowserName = function () {
            return this.strBrowserName;
        };
        TEnvBrowserWebkitInfo.prototype.getBrowserShortName = function () {
            return this.strBrowserShortName;
        };
        TEnvBrowserWebkitInfo.prototype.getBrowserVersion = function () {
            return this.stBrowserVersion;
        };
        TEnvBrowserWebkitInfo.prototype.getBrowserKernelName = function () {
            return this.strBrowserKernelName;
        };
        TEnvBrowserWebkitInfo.prototype.getBrowserKernelVersion = function () {
            return this.stBrowserKernelVersion;
        };
        TEnvBrowserWebkitInfo.prototype.getAdditional = function () {
            return this.strAdditional;
        };
        TEnvBrowserWebkitInfo.prototype.isMobile = function () {
            return this.bIsMobile;
        };
        TEnvBrowserWebkitInfo.prototype._init_branch = function (ua, sysInfo) {
            var _checked_webkit_version = TEnvVersionInfo.GetVersion(ua, /version\/([\w.]+)/i, 1);
            this.stBrowserVersion = _checked_webkit_version || new TEnvVersionInfo("");
            this.stBrowserKernelVersion = TEnvVersionInfo.GetVersion(ua, /(applewebkit|Safari)\/([\w.]+)/i, 2);
            if(null == this.stBrowserKernelVersion) {
                this.stBrowserKernelVersion = _checked_webkit_version;
            }
            var kernel_name = "Apple Safari";
            if(ua.match(/chrome|chromium/i)) {
                this.strBrowserName = "Google Chrome";
                this.strBrowserShortName = "Chrome";
                kernel_name = "Google " + ua.match(/chrome|chromium/i)[0];
                _checked_webkit_version = TEnvVersionInfo.GetVersion(ua, /chrome\/([\w.]+)/i, 1) || TEnvVersionInfo.GetVersion(ua, /chromium\/([\w.]+)/i, 1) || _checked_webkit_version;
                this.stBrowserVersion = _checked_webkit_version;
            }
            do {
                if(ua.match(/tencenttraveler/i)) {
                    this.strBrowserName = "Tencent Traveler";
                    this.strBrowserShortName = "Traveler";
                    this.stBrowserVersion = TEnvVersionInfo.GetVersion(ua, /tencenttraveler ([\w.]+)/i, 1) || _checked_webkit_version;
                    this.strAdditional = " with " + kernel_name + " " + _checked_webkit_version.toString();
                    break;
                }
                if(ua.match(/maxthon/i)) {
                    this.strBrowserName = "Maxthon";
                    this.strBrowserShortName = "Maxthon";
                    this.stBrowserVersion = TEnvVersionInfo.GetVersion(ua, /maxthon(\/| )([\w.]+)/i, 1) || new TEnvVersionInfo("1.0");
                    this.strAdditional = " with " + kernel_name + " " + _checked_webkit_version.toString();
                    break;
                }
                if(ua.match(/360se/i)) {
                    this.strBrowserName = "Qihoo 360 Safe Browser";
                    this.strBrowserShortName = "360SE";
                    this.strAdditional = " with " + kernel_name + " " + _checked_webkit_version.toString();
                    break;
                }
                if(ua.match(/se ([\d.]+)/i)) {
                    this.strBrowserName = "Sohu Sogou";
                    this.strBrowserShortName = "Sogou";
                    this.stBrowserVersion = TEnvVersionInfo.GetVersion(ua, /se ([\w.]+)/i, 1) || _checked_webkit_version;
                    this.strAdditional = " with " + kernel_name + " " + _checked_webkit_version.toString();
                    break;
                }
                if(ua.match(/browserng/i)) {
                    this.strBrowserName = "Nokia BrowserNG";
                    this.strBrowserShortName = "BrowNG";
                    this.stBrowserVersion = TEnvVersionInfo.GetVersion(ua, /browserng\/([\w.]+)/i, 1) || _checked_webkit_version;
                    this.strAdditional = " with " + kernel_name + " " + _checked_webkit_version.toString();
                    break;
                }
                if(ua.match(/chromeplus/i)) {
                    this.strBrowserName = "Tencent Chrome Plus";
                    this.strBrowserShortName = "Chrome Plus";
                    this.stBrowserVersion = TEnvVersionInfo.GetVersion(ua, /chromeplus\/([\w.]+)/i, 1) || _checked_webkit_version;
                    this.strAdditional = " with " + kernel_name + " " + _checked_webkit_version.toString();
                    break;
                }
                if(ua.match(/android/i) && ua.match(/version\/([\w.]+)/i)) {
                    this.strBrowserName = "Google Chrome Lite";
                    this.strBrowserShortName = "Chrome Lite";
                    this.bIsMobile = true;
                    break;
                }
            }while(false);
        };
        return TEnvBrowserWebkitInfo;
    })(TEnvBrowserInfoBase);    
    ;
    var TEnvBrowserFirefoxInfo = (function (_super) {
        __extends(TEnvBrowserFirefoxInfo, _super);
        function TEnvBrowserFirefoxInfo(ori, sysInfo) {
                _super.call(this, ori, sysInfo);
            this.strBrowserName = "Mozilla FireFox";
            this.strBrowserShortName = "FF";
            this.strBrowserKernelName = "Gecko";
            this.bIsMobile = false;
            this.strAdditional = "";
            this.bIsMobile = sysInfo.isMobile();
            this._init_branch(ori.userAgent, sysInfo);
        }
        TEnvBrowserFirefoxInfo.prototype.getBrowserName = function () {
            return this.strBrowserName;
        };
        TEnvBrowserFirefoxInfo.prototype.getBrowserShortName = function () {
            return this.strBrowserShortName;
        };
        TEnvBrowserFirefoxInfo.prototype.getBrowserVersion = function () {
            return this.stBrowserVersion;
        };
        TEnvBrowserFirefoxInfo.prototype.getBrowserKernelName = function () {
            return this.strBrowserKernelName;
        };
        TEnvBrowserFirefoxInfo.prototype.getBrowserKernelVersion = function () {
            return this.stBrowserKernelVersion;
        };
        TEnvBrowserFirefoxInfo.prototype.getAdditional = function () {
            return this.strAdditional;
        };
        TEnvBrowserFirefoxInfo.prototype.isMobile = function () {
            return this.bIsMobile;
        };
        TEnvBrowserFirefoxInfo.prototype._init_branch = function (ua, sysInfo) {
            var _checked_ff_version = TEnvVersionInfo.GetVersion(ua, /firefox\/([\w.]+)/i, 1) || TEnvVersionInfo.GetVersion(ua, /rv:([\w.]+)/i, 1);
            this.stBrowserVersion = _checked_ff_version || new TEnvVersionInfo("");
            this.stBrowserKernelVersion = TEnvVersionInfo.GetVersion(ua, /gecko\/([\w.]+)/i, 1);
            if(null == this.stBrowserKernelVersion) {
                this.stBrowserKernelVersion = _checked_ff_version;
            }
        };
        return TEnvBrowserFirefoxInfo;
    })(TEnvBrowserInfoBase);    
    ;
    var TEnvBrowserOtherInfo = (function (_super) {
        __extends(TEnvBrowserOtherInfo, _super);
        function TEnvBrowserOtherInfo(ori, sysInfo) {
                _super.call(this, ori, sysInfo);
            this.strBrowserName = "Unknown";
            this.strBrowserShortName = "Unknown";
            this.strBrowserKernelName = "Unknown";
            this.bIsMobile = false;
            this.strAdditional = "";
            this.bIsMobile = sysInfo.isMobile();
            this._init_branch(ori.userAgent, sysInfo);
        }
        TEnvBrowserOtherInfo.prototype.getBrowserName = function () {
            return this.strBrowserName;
        };
        TEnvBrowserOtherInfo.prototype.getBrowserShortName = function () {
            return this.strBrowserShortName;
        };
        TEnvBrowserOtherInfo.prototype.getBrowserVersion = function () {
            return this.stBrowserVersion;
        };
        TEnvBrowserOtherInfo.prototype.getBrowserKernelName = function () {
            return this.strBrowserKernelName;
        };
        TEnvBrowserOtherInfo.prototype.getBrowserKernelVersion = function () {
            return this.stBrowserKernelVersion;
        };
        TEnvBrowserOtherInfo.prototype.getAdditional = function () {
            return this.strAdditional;
        };
        TEnvBrowserOtherInfo.prototype.isMobile = function () {
            return this.bIsMobile;
        };
        TEnvBrowserOtherInfo.prototype._init_branch = function (ua, sysInfo) {
            var _checked_other_version = new TEnvVersionInfo("0");
            this.stBrowserVersion = this.stBrowserKernelVersion = _checked_other_version;
            do {
                if(ua.match(/konqueror|khtml/i)) {
                    this.strBrowserName = "KDE Konqueror";
                    this.strBrowserShortName = "Konqueror";
                    this.stBrowserVersion = TEnvVersionInfo.GetVersion(ua, /konqueror\/([\w.]+)/i, 1) || _checked_other_version;
                    this.strBrowserKernelName = "KHTML";
                    this.stBrowserKernelVersion = TEnvVersionInfo.GetVersion(ua, /khtml\/([\w.]+)/i, 1) || _checked_other_version;
                    break;
                }
                if(ua.match(/gobrowser/i)) {
                    this.strBrowserName = "Nokia Go Browser";
                    this.strBrowserShortName = "GoBrow";
                    this.stBrowserKernelVersion = this.stBrowserVersion = TEnvVersionInfo.GetVersion(ua, /gobrowser\/([\w.]+)/i, 1) || new TEnvVersionInfo("0.0");
                    break;
                }
            }while(false);
        };
        return TEnvBrowserOtherInfo;
    })(TEnvBrowserInfoBase);    
    ;
    ;
    var TEnvPluginInfo = (function () {
        function TEnvPluginInfo(obj) {
            this.stPluginName = obj.name || obj.filename || "";
            if(obj.version) {
                this.stVersion = new TEnvVersionInfo(obj.version);
            } else {
                var des = obj.description || this.stPluginName;
                var t_ver = des.match(/[\d.]+/i);
                if(t_ver) {
                    this.stVersion = new TEnvVersionInfo(t_ver[0]);
                } else {
                    this.stVersion = new TEnvVersionInfo("Unknown");
                }
            }
        }
        TEnvPluginInfo.prototype.getPluginName = function () {
            return this.stPluginName;
        };
        TEnvPluginInfo.prototype.getPluginVersion = function () {
            return this.stVersion;
        };
        return TEnvPluginInfo;
    })();
    Util.TEnvPluginInfo = TEnvPluginInfo;    
    ;
    var TEnvPluginIEDotNetInfo = (function () {
        function TEnvPluginIEDotNetInfo(ua, dotnet_reg, pname) {
            this.stPluginName = "";
            this.stVersion = new TEnvVersionInfo("");
            if(ua.match(dotnet_reg)) {
                this.stPluginName = pname;
                var t_ver = ua.match(dotnet_reg)[0].match(/\d[\d.]+/i);
                this.stVersion = new TEnvVersionInfo(t_ver ? t_ver[0] : "");
            }
        }
        TEnvPluginIEDotNetInfo.prototype.getPluginName = function () {
            return this.stPluginName;
        };
        TEnvPluginIEDotNetInfo.prototype.getPluginVersion = function () {
            return this.stVersion;
        };
        return TEnvPluginIEDotNetInfo;
    })();    
    ;
    var TEnvPluginIESilverlightInfo = (function () {
        function TEnvPluginIESilverlightInfo(ver) {
            this.stPluginName = "Silverlight";
            this.stVersion = ver;
        }
        TEnvPluginIESilverlightInfo.prototype.getPluginName = function () {
            return this.stPluginName;
        };
        TEnvPluginIESilverlightInfo.prototype.getPluginVersion = function () {
            return this.stVersion;
        };
        return TEnvPluginIESilverlightInfo;
    })();    
    ;
    var TEnvironment = (function () {
        function TEnvironment() {
            this.PluginInfo = {
            };
            this.OriData = new TEnvOriData();
            this._init_ori_data(this.OriData);
            if(this.OriData.userAgent.match(/windows/i)) {
                this.SysInfo = new TEnvSystemWindowsInfo(this.OriData);
            } else if(this.OriData.userAgent.match(/linux|android/i)) {
                this.SysInfo = new TEnvSystemLinuxInfo(this.OriData);
            } else if(this.OriData.userAgent.match(/macintosh|iphone|ipad|ipod/i)) {
                this.SysInfo = new TEnvSystemMacIOSInfo(this.OriData);
            } else {
                this.SysInfo = new TEnvSystemOtherInfo(this.OriData);
            }
            if(this.OriData.userAgent.match(/opera|pesto/i)) {
                this.BrowserInfo = new TEnvBrowserOperaInfo(this.OriData, this.SysInfo);
            } else if(this.OriData.userAgent.match(/msie|trident/i)) {
                this.BrowserInfo = new TEnvBrowserIEInfo(this.OriData, this.SysInfo);
            } else if(this.OriData.userAgent.match(/safari|applewebkit/i)) {
                this.BrowserInfo = new TEnvBrowserWebkitInfo(this.OriData, this.SysInfo);
            } else if(this.OriData.userAgent.match(/firefox|gecko/i)) {
                this.BrowserInfo = new TEnvBrowserFirefoxInfo(this.OriData, this.SysInfo);
            } else {
                this.BrowserInfo = new TEnvBrowserOtherInfo(this.OriData, this.SysInfo);
            }
            if(this.OriData.nav.plugins) {
                try  {
                    for(var i = 0; i < this.OriData.nav.plugins.length; ++i) {
                        var t_plugin = new TEnvPluginInfo(this.OriData.nav.plugins[i]);
                        if(t_plugin.getPluginName() == "") {
                            continue;
                        }
                        var pname = t_plugin.getPluginName();
                        if(this.PluginInfo[pname]) {
                            if("Unknown" != t_plugin.getPluginVersion().toString()) {
                                this.PluginInfo[pname] = t_plugin;
                            }
                            continue;
                        }
                        this.PluginInfo[pname] = t_plugin;
                    }
                } catch (e) {
                }
            }
            if("Trident" == this.BrowserInfo.getBrowserKernelName()) {
                try  {
                    var dot_net_arr = [
                        {
                            reg: /.net clr 2.0/i,
                            pname: ".Net 2.0"
                        }, 
                        {
                            reg: /.net clr 3.0/i,
                            pname: ".Net 3.0"
                        }, 
                        {
                            reg: /.net clr 3.5/i,
                            pname: ".Net 3.5"
                        }, 
                        {
                            reg: /.net4.0c/i,
                            pname: ".Net 4.0 Client"
                        }, 
                        {
                            reg: /.net4.0e/i,
                            pname: ".Net 4.0 Full"
                        }
                    ];
                    for(var i = 0; i < dot_net_arr.length; ++i) {
                        var tdn_plugin = new TEnvPluginIEDotNetInfo(this.OriData.userAgent, dot_net_arr[i].reg, dot_net_arr[i].pname);
                        if("" == tdn_plugin.getPluginName()) {
                            continue;
                        }
                        this.PluginInfo[dot_net_arr[i].pname] = tdn_plugin;
                    }
                    var silver_start_ver = 2;
                    var silverlight_activex = new ActiveXObject("AgControl.AgControl");
                    while(true) {
                        if(false == silverlight_activex.IsVersionSupported(silver_start_ver + ".0")) {
                            break;
                        }
                        ++silver_start_ver;
                    }
                    if(silver_start_ver > 2) {
                        --silver_start_ver;
                        this.PluginInfo["Silverlight"] = new TEnvPluginIESilverlightInfo(new TEnvVersionInfo(silver_start_ver));
                    }
                } catch (e) {
                }
            }
        }
        TEnvironment.prototype._init_ori_data = function (obj) {
            obj.doc = document || {
            };
            obj.nav = navigator || {
                userAgent: ""
            };
            obj.userAgent = obj.nav.userAgent || "";
        };
        TEnvironment.prototype.getOriInfo = function () {
            return this.OriData;
        };
        TEnvironment.prototype.getSysInfo = function () {
            return this.SysInfo;
        };
        TEnvironment.prototype.getBrowserInfo = function () {
            return this.BrowserInfo;
        };
        TEnvironment.prototype.getPluginsInfo = function () {
            return this.PluginInfo;
        };
        TEnvironment.prototype.toString = function () {
            return this.getBrowserInfo().getBrowserName() + " " + this.getBrowserInfo().getBrowserVersion() + " " + this.getBrowserInfo().getAdditional() + " on " + this.getSysInfo().getOSName() + " ";
            this.getSysInfo().getArchitecture();
        };
        return TEnvironment;
    })();
    Util.TEnvironment = TEnvironment;    
    ;
    function getEnvironment() {
        return new TEnvironment();
    }
    Util.getEnvironment = getEnvironment;
    ;
    (function () {
        try  {
            if(jQuery) {
                jQuery.extend({
                    environment: getEnvironment()
                });
            }
        } catch (e) {
        }
    })();
})(Util || (Util = {}));
