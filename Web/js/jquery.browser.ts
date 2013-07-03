/**
 * Environment judge
 * Support browser: IE, Firefox, Chrome, Opera, Safari, Konqueror, Go
 * Support system: Windows, Linux, Android, Windows Phone, Windows CE, Xbox, Mac OS, IOS, Symbian, Solaris, BSD, j2me
 * jQuery plugin
 * @version    2.0.0
 * @example	var bro = new Util._TEnvironment();
 * @example	var bro = Util.getEnvironment();
 * @example	jQuery.environment;
 */

module Util {

    // 版本控制类
    export class TEnvVersionInfo{
        public version: string;

        constructor(str: string) {
            this.version = str;
        }

        public toString() {
            return this.version;
        }

        // 获取版本号
        public static GetVersion(strSrc: string, reg: RegExp, pos: number) {
            var res = strSrc.match(reg);
            if (res && res.length > pos)
                return new TEnvVersionInfo(res[pos]);
            return null;
        }

        private static __less_than_obj = {
            ok: function (l: number, r: number) { return l < r; },
            fail: function (l: number, r: number) { return l > r; },
            ret: function (lg: string[], rg: string[]) { return lg.length < rg.length; }
        };

        private static __equal_obj = {
            ok: function (l: number, r: number) { return false; },
            fail: function (l: number, r: number) { return l != r; },
            ret: function (lg: string[], rg: string[]) { return lg.length == rg.length; }
        };

        private static __less_equal_than_obj = {
            ok: function (l: number, r: number) { return l < r; },
            fail: function (l: number, r: number) { return l > r; },
            ret: function (lg: string[], rg: string[]) { return lg.length <= rg.length; }
        };

        public compare(right: TEnvVersionInfo, cmp_func) {
            var cpgl = this.version.split(".");
            var cpgr = right.version.split(".");
            for (var i = 0; i < cpgl.length && i < cpgr.length; ++i) {
                var _check = cmp_func.ok(cpgl[i], cpgr[i]);
                if (_check)
                    return true;
                _check = cmp_func.fail(cpgl[i], cpgr[i]);
                if (_check)
                    return false;
            }

            return cmp_func.ret;
        }

        public lessThan(right: TEnvVersionInfo) {
            return this.compare(right, TEnvVersionInfo.__less_than_obj);
        }

        public greaterThan(right: TEnvVersionInfo) {
            return right.lessThan(this);
        }

        public equal(right: TEnvVersionInfo) {
            return this.compare(right, TEnvVersionInfo.__equal_obj);
        }

        public lessEqualThan(right: TEnvVersionInfo) {
            return this.compare(right, TEnvVersionInfo.__less_equal_than_obj);
        }

        public greaterEqualThan(right: TEnvVersionInfo) {
            return right.lessEqualThan(this);
        }
    };

    // 系统检测接口
    export interface IEnvSystemInfo {
        getOSName: () => string;
        getOSKernel: () => string;
        getPlatform: () => string;
        getArchitecture: () => string;

        isMobile: () => bool;
    };

    export class TEnvOriData {
        public userAgent: string;
        public nav;
        public doc;
    };

    // 系统信息基类
    class TEnvSystemInfoBase {
        private strPlatform: string;
        private strArchitecture = "x86";

        public getOSName() {
            return "Unknown";
        }

        public getOSKernel() {
            return this.getOSName();
        }

        public getPlatform() {
            return this.strPlatform;
        }

        public getArchitecture() {
            return this.strArchitecture;
        }

        public isMobile() {
            return false;
        }

        constructor(ori: TEnvOriData) {
            this.strPlatform = ori.nav.platform || "Unknown";

            if (ori.userAgent.match(/ia64/i))
                this.strArchitecture = "ia64";
            else if (ori.userAgent.match(/win64|wow64|x64|x86_64/i))
                this.strArchitecture = "x86_64";

        }
    };

    // Windows系统信息
    class TEnvSystemWindowsInfo extends TEnvSystemInfoBase {
        private static __nt_kernel_name_map = {
            "6.3": "Microsoft Windows 8.1/Microsoft Windows RT 8.1/Windows Server 2012 R2",
            "6.2": "Microsoft Windows 8/Microsoft Windows RT/Windows Server 2012",
            "6.1": "Microsoft Windows 7/Windows Server 2008 R2",
            "6.0": "Microsoft Windows Vista/Windows Server 2008",
            "5.2": "Windows Server 2003",
            "5.1": "Microsoft Windows XP",
            "5.0": "Microsoft Windows 2000",
        };

        private strOSName = "Windows";
        private strOSKernel = "Windows";
        private strArchitecture =
            "x86";
        private bIsMobile = false;

        public getOSName() {
            return this.strOSName;
        }

        public getOSKernel() {
            return this.strOSKernel;
        }

        public getArchitecture() {
            return this.strArchitecture;
        }

        public isMobile() {
            return this.bIsMobile;
        }

        constructor(ori: TEnvOriData) {
            super(ori);

            this._init_branch(ori.userAgent);
        }

        private _init_branch(ua: string) {
            do {
                // NT核心
                if (ua.match(/windows nt/i)) {
                    var t_ver = TEnvVersionInfo.GetVersion(ua, /windows nt ([\d.]+)/i, 1);
                    this.strOSKernel = "Windows NT " + t_ver;

                    if (ua.match(/ia64/i))
                        this.strArchitecture = "ia64";
                    else if (ua.match(/win64|wow64|x64|x86_64/i))
                        this.strArchitecture = "x86_64";

                    if (this.strArchitecture == "ia64" && "5.2" == t_ver.toString())
                        this.strOSName = "Microsoft Windows XP/Windows Server 2003";
                    else if (TEnvSystemWindowsInfo.__nt_kernel_name_map[t_ver.toString()])
                        this.strOSName = TEnvSystemWindowsInfo.__nt_kernel_name_map[t_ver.toString()];
                    else
                        this.strOSName = "Windows NT Kernel " + t_ver.toString();

                    break;
                }

                // Window phone 7
                var t_ver = TEnvVersionInfo.GetVersion(ua, /windows phone os ([\d.]+)/i, 1);
                if (null !== t_ver) {
                    this.strOSName = "Microsoft Windows Phone " + t_ver.toString();
                    this.strArchitecture = "ARM";
                    this.bIsMobile = true;
                    break;
                }
                // Window phone 8+
                t_ver = TEnvVersionInfo.GetVersion(ua, /windows phone ([\d.]+)/i, 1);
                if (null !== t_ver) {
                    this.strOSName = "Microsoft Windows Phone " + t_ver.toString();
                    this.bIsMobile = true;
                    break;
                }

                // Windows CE
                if (ua.match(/windows ce/i)) {
                    this.strOSName = "Microsoft Windows CE/Windows Mobile";
                    this.strArchitecture = "ARM";
                    this.bIsMobile = true;
                    break;
                }

                if (ua.match(/windows 95/i)) {
                    this.strOSName = "Microsoft Windows 95";
                    break;
                }
                if (ua.match(/windows 98/i)) {
                    if (ua.match(/win 9x 4.90/i))
                        this.strOSName = "Microsoft Windows ME";
                    else
                        this.strOSName = "Microsoft Windows 98";

                    break;
                }

            } while (false);

            if (ua.match(/xbox/i)) {
                this.strOSName = "Microsoft XBox";
            }

            if (ua.match(/arm/i))
                this.strArchitecture = "ARM";
        }
    };


    // Linux系统信息
    class TEnvSystemLinuxInfo extends TEnvSystemInfoBase {
        private strOSName = "Linux";
        private strOSKernel = "Linux";
        private strArchitecture = "x86";
        private bIsMobile = false;

        public getOSName() {
            return this.strOSName;
        }

        public getOSKernel() {
            return this.strOSKernel;
        }

        public getArchitecture() {
            return this.strArchitecture;
        }

        public isMobile() {
            return this.bIsMobile;
        }

        constructor(ori: TEnvOriData) {
            super(ori);

            this._init_branch(ori.userAgent);
        }

        private _init_branch(ua: string) {
            do {
                if (ua.match(/android/i)) {
                    this.strArchitecture = "ARM"; /** Android 默认ARM架构 **/
                    this.strOSName = "Google Android";
                    var t_ver = TEnvVersionInfo.GetVersion(ua, /android ([\d.]+)/i, 1);
                    if (null !== t_ver)
                        this.strOSName += " " + t_ver.toString();
                    break;
                }

                var pub_linux_reg = [/Ubuntu/i, /Fedora/i, /RedHat/i, /Debian/i, /SUSE/i, /CentOS/i];
                for (var i = 0; i < pub_linux_reg.length; ++i) {
                    if (ua.match(pub_linux_reg[i])) {
                        this.strOSName = pub_linux_reg[i].source + " Linux";
                        break;
                    }
                }
            } while (false);

            if (ua.match(/mobile/i) || ua.match(/tablet/i))
                this.bIsMobile = true;

            do {
                if (ua.match(/x86_64/i)) {
                    this.strArchitecture = "x86_64";
                    break;
                }

                if (ua.match(/arm/i)) {
                    this.strArchitecture = "ARM";
                    break;
                }

            } while (false);
        }
    };

    // Mac和IOS系统信息
    class TEnvSystemMacIOSInfo extends TEnvSystemInfoBase {
        private strOSName = "Mac";
        private strOSKernel = "Mac";
        private strArchitecture = "x86";
        private bIsMobile = false;

        public getOSName() {
            return this.strOSName;
        }

        public getOSKernel() {
            return this.strOSKernel;
        }

        public getArchitecture() {
            return this.strArchitecture;
        }

        public isMobile() {
            return this.bIsMobile;
        }

        constructor(ori: TEnvOriData) {
            super(ori);

            this._init_branch(ori.userAgent);
        }

        private _init_branch(ua: string) {
            do {
                if (ua.match(/macintosh/i)) {
                    this.strOSName = "Apple Mac OS X";
                    break;
                } else {
                    this.strArchitecture = "ARM"; /** IOS 默认ARM架构 **/
                    this.strOSName = "Apple iOS";
                    break;
                }
            } while (false);

            if (ua.match(/mobile/i))
                this.bIsMobile = true;
  
            var _ver_str = ua.match(/(ppc mac os x|intel mac os x|cpu iphone os|cpu os) ([\d_]+)/i);
            if (_ver_str && _ver_str.length > 2) {
                var t_ver = new TEnvVersionInfo(_ver_str[2].replace(/_/g, "."));
                this.strOSName += " " + t_ver.toString();

                if (this.strOSName == "Apple Mac OS X") {
                    if (t_ver.greaterEqualThan(new TEnvVersionInfo("10.6")))
                        this.strArchitecture = "x86_64";
                    else if (ua.match(/ppc mac os x/i))
                        this.strArchitecture = "PowerPC";
                }
            }
            
            this.strOSKernel = "Apple Darwin";
        }
    };

    // 其他系统信息
    class TEnvSystemOtherInfo extends TEnvSystemInfoBase {
        private strOSName = "Unknown";
        private strOSKernel = "Unknown";
        private strArchitecture = "x86";
        private bIsMobile = false;

        public getOSName() {
            return this.strOSName;
        }

        public getOSKernel() {
            return this.strOSKernel;
        }

        public getArchitecture() {
            return this.strArchitecture;
        }

        public isMobile() {
            return this.bIsMobile;
        }

        constructor(ori: TEnvOriData) {
            super(ori);

            this._init_branch(ori.userAgent);
        }

        private _init_branch(ua: string) {
            do {
                if (ua.match(/blackberry/i)) {
                    this.strOSName = "BlackBerry OS";
                    this.strOSKernel = "RIM";
                    this.strArchitecture = "ARM";
                    this.bIsMobile = true;
                    break;
                }

                if (ua.match(/symbianos|symbos/i)) {
                    this.strOSName = "Nokia Symbian";
                    this.strOSKernel = "Nokia Symbian";
                    this.strArchitecture = "ARM";
                    this.bIsMobile = true;
                    break;
                }

                if (ua.match(/solaris|sunos/i)) {
                    this.strOSName = "Sun Solaris";
                    this.strOSKernel = "OpenSource Unix-Like";
                    break;
                }

                if (ua.match(/bsd/i)) {
                    this.strOSName = ua.match(/\w*bsd/i)[0];
                    this.strOSKernel = "BSD";
                    break;
                }

                if (ua.match(/j2me/i)) {
                    this.strOSName = "J2ME OS- java based environment";
                    this.strOSKernel = "J2ME";
                    this.strArchitecture = "Unknown";
                    this.bIsMobile = true;
                    break;
                }
            } while (false);
        }
    };

    // 浏览器检测接口
    export interface IEnvBrowserInfo {
        getBrowserName: () => string;
        getBrowserShortName: () => string;
        getBrowserVersion: () => TEnvVersionInfo;
        getBrowserKernelName: () => string;
        getBrowserKernelVersion: () => TEnvVersionInfo;
        getBrowserRenderMode: () => string;
        getBrowserArchitecture: () => string;

        getAdditional: () => string;
        isMobile: () => bool;
        isCompatMode: () => bool;
        isCookieEnabled: () => bool;
    };

    // 浏览器检测基类
    class TEnvBrowserInfoBase {
        private strRenderMode = "Unknown";
        private strBrowserArchitecture = "x86";
        private bIsCookieEnabled = false;
        private bIsMobile = false;

        public getBrowserName() {
            return "Unknown";
        }

        public getBrowserShortName() {
            return "Unknown";
        }

        public getBrowserVersion() {
            return new TEnvVersionInfo("0");
        }

        public getBrowserKernelName() {
            return "Unknown";
        }

        public getBrowserKernelVersion() {
            return new TEnvVersionInfo("0");
        }

        public getBrowserRenderMode() {
            return this.strRenderMode;
        }

        public getAdditional() {
            return "";
        }

        public getBrowserArchitecture() {
            return this.strBrowserArchitecture;
        }

        public isMobile() {
            return this.bIsMobile;
        }

        public isCompatMode() {
            return false;
        }

        public isCookieEnabled() {
            return this.bIsCookieEnabled;
        }

        constructor(ori: TEnvOriData, sysInfo: IEnvSystemInfo) {
            this.strRenderMode = ori.doc.compatMode || this.strRenderMode;
            this.bIsCookieEnabled = ori.nav.cookieEnabled || "Unknown";
            this.bIsMobile = sysInfo.isMobile();
            this.strBrowserArchitecture = sysInfo.getArchitecture() + "(System Arch)";
        }
    };


    // Opera浏览器检测类
    class TEnvBrowserOperaInfo extends TEnvBrowserInfoBase {
        private strBrowserName = "Opera";
        private strBrowserShortName = "Opera";
        private strBrowserKernelName = "Presto";
        private stBrowserVersion: TEnvVersionInfo;
        private stBrowserKernelVersion: TEnvVersionInfo;
        private bIsMobile = false;

        public getBrowserName() {
            return this.strBrowserName;
        }

        public getBrowserShortName() {
            return this.strBrowserShortName;
        }

        public getBrowserVersion() {
            return this.stBrowserVersion;
        }

        public getBrowserKernelName() {
            return this.strBrowserKernelName;
        }

        public getBrowserKernelVersion() {
            return this.stBrowserKernelVersion;
        }

        public isMobile() {
            return this.bIsMobile;
        }

        constructor(ori: TEnvOriData, sysInfo: IEnvSystemInfo) {
            super(ori, sysInfo);
            this.bIsMobile = sysInfo.isMobile();

            this._init_branch(ori.userAgent, sysInfo);
        }

        private _init_branch(ua: string, sysInfo: IEnvSystemInfo) {
            do {
                if (ua.match(/opera mobi/i)) {
                    this.strBrowserName = "Opera Mobile";
                    this.bIsMobile = true;
                    break;
                }

                if (ua.match(/opera mini/i)) {
                    this.strBrowserName = "Opera Mini";
                    this.bIsMobile = true;
                    break;
                }

            } while (false);

            do {
                if (ua.match(/mozilla/i)) {
                    this.stBrowserVersion = this.stBrowserKernelVersion = TEnvVersionInfo.GetVersion(ua, /opera ([\w.]+)/i, 1);
                    break;
                }

                if (ua.match(/opera mini/i)) {
                    this.stBrowserVersion = TEnvVersionInfo.GetVersion(ua, /version\/([\w.]+)/i, 1);
                    this.stBrowserKernelVersion = TEnvVersionInfo.GetVersion(ua, /presto\/([\w.]+)/i, 1);
                    break;
                }

                this.stBrowserVersion = this.stBrowserKernelVersion = TEnvVersionInfo.GetVersion(ua, /version\/([\w.]+)/i, 1) || new TEnvVersionInfo("0");
            } while (false);
        }
    };


    // IE浏览器检测类
    class TEnvBrowserIEInfo extends TEnvBrowserInfoBase {
        private strBrowserName = "Internet Explorer";
        private strBrowserShortName = "IE";
        private strBrowserKernelName = "Trident";
        private strBrowserArchitecture = "x86";
        private stBrowserVersion: TEnvVersionInfo;
        private stBrowserKernelVersion: TEnvVersionInfo;
        private bIsMobile = false;
        private strAdditional = "";
        private bIsCompatMode = false;

        public getBrowserName() {
            return this.strBrowserName;
        }

        public getBrowserShortName() {
            return this.strBrowserShortName;
        }

        public getBrowserVersion() {
            return this.stBrowserVersion;
        }

        public getBrowserKernelName() {
            return this.strBrowserKernelName;
        }

        public getBrowserKernelVersion() {
            return this.stBrowserKernelVersion;
        }

        public getAdditional() {
            return this.strAdditional;
        }

        public getBrowserArchitecture() {
            return this.strBrowserArchitecture;
        }

        public isMobile() {
            return this.bIsMobile;
        }

        public isCompatMode() {
            return this.bIsCompatMode;
        }

        constructor(ori: TEnvOriData, sysInfo: IEnvSystemInfo) {
            super(ori, sysInfo);
            this.bIsMobile = sysInfo.isMobile();
            this.strBrowserArchitecture = super.getBrowserArchitecture();

            this._init_branch(ori.userAgent, sysInfo);

            // 覆盖浏览器架构信息
            if (ori.nav.cpuClass)
                this.strBrowserArchitecture = ori.nav.cpuClass;
        }

        private _init_branch(ua: string, sysInfo: IEnvSystemInfo) {
            // 检测浏览器版本
            var _checked_ie_version = TEnvVersionInfo.GetVersion(ua, /msie ([\w.]+)/i, 1);
            if (null === _checked_ie_version)
                _checked_ie_version = TEnvVersionInfo.GetVersion(ua, /rv:([\w.]+)/i, 1);
            if (null === _checked_ie_version)
                this.stBrowserVersion = new TEnvVersionInfo("");
            this.stBrowserVersion = _checked_ie_version;

            // 检测内核版本
            this.stBrowserKernelVersion = TEnvVersionInfo.GetVersion(ua, /trident\/([\w.]+)/i, 1);
            if (null == this.stBrowserKernelVersion)
                this.stBrowserKernelVersion = new TEnvVersionInfo("Unkown");

            do {
                //The World
                if (ua.match(/theworld/i)) {
                    this.strBrowserName = "TheWorld Browser";
                    this.strBrowserShortName = "TheWorld";
                    this.strAdditional = " with Microsoft Internet Explorer " + _checked_ie_version.toString();
                    break;
                }

                //Tencent QQBrowser
                if (ua.match(/qqbrowser/i)) {
                    this.strBrowserName = "Tencent QQBrowser";
                    this.strBrowserShortName = "QQBrowser";
                    this.stBrowserVersion = TEnvVersionInfo.GetVersion(ua, /qqbrowser ([\w.]+)/i, 1) || new TEnvVersionInfo("");
                    this.strAdditional = " with Microsoft Internet Explorer " + _checked_ie_version.toString();
                    break;
                }

                //Tencent Traveler
                if (ua.match(/tencenttraveler/i)) {
                    this.strBrowserName = "Tencent Traveler";
                    this.strBrowserShortName = "Traveler";
                    this.stBrowserVersion = TEnvVersionInfo.GetVersion(ua, /tencenttraveler ([\w.]+)/i, 1) || new TEnvVersionInfo("");
                    this.strAdditional = " with Microsoft Internet Explorer " + _checked_ie_version.toString();
                    break;
                }

                //Maxthon
                if (ua.match(/maxthon/i)) {
                    this.strBrowserName = "Maxthon";
                    this.strBrowserShortName = "Maxthon";
                    this.stBrowserVersion = TEnvVersionInfo.GetVersion(ua, /maxthon(\/| )([\w.]+)/i, 1) || new TEnvVersionInfo("1.0");
                    this.strAdditional = " with Microsoft Internet Explorer " + _checked_ie_version.toString();
                    break;
                }

                //Avant
                if (ua.match(/avant/i)) {
                    this.strBrowserName = "Avant Browser";
                    this.strBrowserShortName = "Avant";
                    this.strAdditional = " with Microsoft Internet Explorer " + _checked_ie_version.toString();
                    break;
                }

                //360SE
                if (ua.match(/360se/i)) {
                    this.strBrowserName = "Qihoo 360 Safe Browser";
                    this.strBrowserShortName = "360SE";
                    this.strAdditional = " with Microsoft Internet Explorer " + _checked_ie_version.toString();
                    break;
                }

                //Sogou
                if (ua.match(/se ([\d.]+)/i)) {
                    this.strBrowserName = "Sohu Sogou";
                    this.strBrowserShortName = "Sogou";
                    this.stBrowserVersion = TEnvVersionInfo.GetVersion(ua, /se ([\w.]+)/i, 1) || new TEnvVersionInfo("1.0");
                    this.strAdditional = " with Microsoft Internet Explorer " + _checked_ie_version.toString();
                    break;
                }

                // Microsoft Internet Explorer && Internet Explorer Mobile

            } while (false);

            if (ua.match(/ia64/i))
                this.strBrowserArchitecture = "IA64";
            else if (ua.match(/win64|x64|x86_64/i))
                this.strBrowserArchitecture = "x86_64";

            if (ua.match(/iemobile/i))
                this.bIsMobile = true;

            // 检测兼容性视图
            if (parseInt(_checked_ie_version.toString()) == 7 &&
                this.stBrowserKernelVersion.greaterEqualThan(new TEnvVersionInfo("4"))
            ) {
                this.bIsCompatMode = true;
            }
        }
    };


    // Webkit浏览器检测类
    class TEnvBrowserWebkitInfo extends TEnvBrowserInfoBase {
        private strBrowserName = "Apple Safari";
        private strBrowserShortName = "Safari";
        private strBrowserKernelName = "Webkit";
        private stBrowserVersion: TEnvVersionInfo;
        private stBrowserKernelVersion: TEnvVersionInfo;
        private bIsMobile = false;
        private strAdditional = "";

        public getBrowserName() {
            return this.strBrowserName;
        }

        public getBrowserShortName() {
            return this.strBrowserShortName;
        }

        public getBrowserVersion() {
            return this.stBrowserVersion;
        }

        public getBrowserKernelName() {
            return this.strBrowserKernelName;
        }

        public getBrowserKernelVersion() {
            return this.stBrowserKernelVersion;
        }

        public getAdditional() {
            return this.strAdditional;
        }

        public isMobile() {
            return this.bIsMobile;
        }

        constructor(ori: TEnvOriData, sysInfo: IEnvSystemInfo) {
            super(ori, sysInfo);
            this.bIsMobile = sysInfo.isMobile();

            this._init_branch(ori.userAgent, sysInfo);
        }

        private _init_branch(ua: string, sysInfo: IEnvSystemInfo) {
            // 检测浏览器版本
            var _checked_webkit_version = TEnvVersionInfo.GetVersion(ua, /version\/([\w.]+)/i, 1);
            this.stBrowserVersion = _checked_webkit_version || new TEnvVersionInfo("");

            // 检测内核版本
            this.stBrowserKernelVersion = TEnvVersionInfo.GetVersion(ua, /(applewebkit|Safari)\/([\w.]+)/i, 2);
            if (null == this.stBrowserKernelVersion)
                this.stBrowserKernelVersion = _checked_webkit_version;

            // 检测Chrome
            var kernel_name = "Apple Safari";
            if (ua.match(/chrome|chromium/i)) {
                this.strBrowserName = "Google Chrome";
                this.strBrowserShortName = "Chrome";
                kernel_name = "Google " + ua.match(/chrome|chromium/i)[0];
                _checked_webkit_version = TEnvVersionInfo.GetVersion(ua, /chrome\/([\w.]+)/i, 1) ||
                    TEnvVersionInfo.GetVersion(ua, /chromium\/([\w.]+)/i, 1) ||
                    _checked_webkit_version;

                this.stBrowserVersion = _checked_webkit_version;
            }

            do {
                //Tencent Traveler
                if (ua.match(/tencenttraveler/i)) {
                    this.strBrowserName = "Tencent Traveler";
                    this.strBrowserShortName = "Traveler";
                    this.stBrowserVersion = TEnvVersionInfo.GetVersion(ua, /tencenttraveler ([\w.]+)/i, 1) || _checked_webkit_version;
                    this.strAdditional = " with " + kernel_name + " " + _checked_webkit_version.toString();
                    break;
                }

                //Maxthon
                if (ua.match(/maxthon/i)) {
                    this.strBrowserName = "Maxthon";
                    this.strBrowserShortName = "Maxthon";
                    this.stBrowserVersion = TEnvVersionInfo.GetVersion(ua, /maxthon(\/| )([\w.]+)/i, 1) || new TEnvVersionInfo("1.0");
                    this.strAdditional = " with " + kernel_name + " " + _checked_webkit_version.toString();
                    break;
                }

                //360SE
                if (ua.match(/360se/i)) {
                    this.strBrowserName = "Qihoo 360 Safe Browser";
                    this.strBrowserShortName = "360SE";
                    this.strAdditional = " with " + kernel_name + " " + _checked_webkit_version.toString();
                    break;
                }

                //Sogou
                if (ua.match(/se ([\d.]+)/i)) {
                    this.strBrowserName = "Sohu Sogou";
                    this.strBrowserShortName = "Sogou";
                    this.stBrowserVersion = TEnvVersionInfo.GetVersion(ua, /se ([\w.]+)/i, 1) || _checked_webkit_version;
                    this.strAdditional = " with " + kernel_name + " " + _checked_webkit_version.toString();
                    break;
                }

                //BrowserNG
                if (ua.match(/browserng/i)) {
                    this.strBrowserName = "Nokia BrowserNG";
                    this.strBrowserShortName = "BrowNG";
                    this.stBrowserVersion = TEnvVersionInfo.GetVersion(ua, /browserng\/([\w.]+)/i, 1) || _checked_webkit_version;
                    this.strAdditional = " with " + kernel_name + " " + _checked_webkit_version.toString();
                    break;
                }

                //Chrome Plus
                if (ua.match(/chromeplus/i)) {
                    this.strBrowserName = "Tencent Chrome Plus";
                    this.strBrowserShortName = "Chrome Plus";
                    this.stBrowserVersion = TEnvVersionInfo.GetVersion(ua, /chromeplus\/([\w.]+)/i, 1) || _checked_webkit_version;
                    this.strAdditional = " with " + kernel_name + " " + _checked_webkit_version.toString();
                    break;
                }

                //Chrome Lite
                if (ua.match(/android/i) && ua.match(/version\/([\w.]+)/i)) {
                    this.strBrowserName = "Google Android Browser";
                    this.strBrowserShortName = "Android Browser";
                    this.bIsMobile = true;
                    break;
                }

                // 其他的是Safari浏览器
            } while (false);
        }
    };


    // Firefox浏览器检测类
    class TEnvBrowserFirefoxInfo extends TEnvBrowserInfoBase {
        private strBrowserName = "Mozilla FireFox";
        private strBrowserShortName = "FF";
        private strBrowserKernelName = "Gecko";
        private stBrowserVersion: TEnvVersionInfo;
        private stBrowserKernelVersion: TEnvVersionInfo;
        private bIsMobile = false;
        private strAdditional = "";

        public getBrowserName() {
            return this.strBrowserName;
        }

        public getBrowserShortName() {
            return this.strBrowserShortName;
        }

        public getBrowserVersion() {
            return this.stBrowserVersion;
        }

        public getBrowserKernelName() {
            return this.strBrowserKernelName;
        }

        public getBrowserKernelVersion() {
            return this.stBrowserKernelVersion;
        }

        public getAdditional() {
            return this.strAdditional;
        }

        public isMobile() {
            return this.bIsMobile;
        }

        constructor(ori: TEnvOriData, sysInfo: IEnvSystemInfo) {
            super(ori, sysInfo);
            this.bIsMobile = sysInfo.isMobile();

            this._init_branch(ori.userAgent, sysInfo);
        }

        private _init_branch(ua: string, sysInfo: IEnvSystemInfo) {
            // 检测浏览器版本
            var _checked_ff_version =
                TEnvVersionInfo.GetVersion(ua, /firefox\/([\w.]+)/i, 1) ||
                TEnvVersionInfo.GetVersion(ua, /rv:([\w.]+)/i, 1);
            this.stBrowserVersion = _checked_ff_version || new TEnvVersionInfo("");

            // 检测内核版本
            this.stBrowserKernelVersion = TEnvVersionInfo.GetVersion(ua, /gecko\/([\w.]+)/i, 1);
            if (null == this.stBrowserKernelVersion)
                this.stBrowserKernelVersion = _checked_ff_version;
        }
    };

    // 其他浏览器检测类
    class TEnvBrowserOtherInfo extends TEnvBrowserInfoBase {
        private strBrowserName = "Unknown";
        private strBrowserShortName = "Unknown";
        private strBrowserKernelName = "Unknown";
        private stBrowserVersion: TEnvVersionInfo;
        private stBrowserKernelVersion: TEnvVersionInfo;
        private bIsMobile = false;
        private strAdditional = "";

        public getBrowserName() {
            return this.strBrowserName;
        }

        public getBrowserShortName() {
            return this.strBrowserShortName;
        }

        public getBrowserVersion() {
            return this.stBrowserVersion;
        }

        public getBrowserKernelName() {
            return this.strBrowserKernelName;
        }

        public getBrowserKernelVersion() {
            return this.stBrowserKernelVersion;
        }

        public getAdditional() {
            return this.strAdditional;
        }

        public isMobile() {
            return this.bIsMobile;
        }

        constructor(ori: TEnvOriData, sysInfo: IEnvSystemInfo) {
            super(ori, sysInfo);
            this.bIsMobile = sysInfo.isMobile();

            this._init_branch(ori.userAgent, sysInfo);
        }

        private _init_branch(ua: string, sysInfo: IEnvSystemInfo) {
            // 检测浏览器版本
            var _checked_other_version = new TEnvVersionInfo("0");
            this.stBrowserVersion = this.stBrowserKernelVersion = _checked_other_version;

            do {
                //Konqueror
                if (ua.match(/konqueror|khtml/i)) {
                    this.strBrowserName = "KDE Konqueror";
                    this.strBrowserShortName = "Konqueror";
                    this.stBrowserVersion = TEnvVersionInfo.GetVersion(ua, /konqueror\/([\w.]+)/i, 1) || _checked_other_version;
                    this.strBrowserKernelName = "KHTML";
                    this.stBrowserKernelVersion = TEnvVersionInfo.GetVersion(ua, /khtml\/([\w.]+)/i, 1) || _checked_other_version;
                    break;
                }

                //Go Browser
                if (ua.match(/gobrowser/i)) {
                    this.strBrowserName = "Nokia Go Browser";
                    this.strBrowserShortName = "GoBrow";
                    this.stBrowserKernelVersion = this.stBrowserVersion = TEnvVersionInfo.GetVersion(ua, /gobrowser\/([\w.]+)/i, 1) || new TEnvVersionInfo("0.0");
                    break;
                }

                // 其他的是占不支持的浏览器
            } while (false);
        }
    };

    // 插件信息接口
    interface IEnvPluginInfo {
        getPluginName: () => string;
        getPluginVersion: () => TEnvVersionInfo;
    };

    // 插件信息
    export class TEnvPluginInfo {
        private stVersion: TEnvVersionInfo;
        private stPluginName: string;

        constructor(obj: any) {
            this.stPluginName = obj.name || obj.filename || "";

            if (obj.version) {
                this.stVersion = new TEnvVersionInfo(obj.version);
            } else {
                var reg_exp = /\d([\d. ]|(\w[\d]+))+/gi;
                var t_ver = ((obj.description) ? obj.description.match(reg_exp) : false)
                    || this.stPluginName.match(reg_exp);
                if (t_ver)
                    this.stVersion = new TEnvVersionInfo(t_ver[t_ver.length - 1]);
                else
                    this.stVersion = new TEnvVersionInfo("");
            }
        }

        public getPluginName() {
            return this.stPluginName;
        }

        public getPluginVersion() {
            return this.stVersion;
        }
    };

    // IE下.Net插件信息
    class TEnvPluginIEDotNetInfo {
        private stVersion: TEnvVersionInfo;
        private stPluginName: string;

        constructor(ua: string, dotnet_reg, pname: string) {
            this.stPluginName = "";
            this.stVersion = new TEnvVersionInfo("");

            if (ua.match(dotnet_reg)) {
                this.stPluginName = pname;
                var t_ver = ua.match(dotnet_reg)[0].match(/\d[\d.]+/i);
                this.stVersion = new TEnvVersionInfo(t_ver?t_ver[0]: "");
            }
        }

        public getPluginName() {
            return this.stPluginName;
        }

        public getPluginVersion() {
            return this.stVersion;
        }
    };

    // IE下Silverlight插件信息
    class TEnvPluginIESilverlightInfo {
        private stVersion: TEnvVersionInfo;
        private stPluginName = "Silverlight";

        constructor(ver: TEnvVersionInfo) {
            this.stVersion = ver;
        }

        public getPluginName() {
            return this.stPluginName;
        }

        public getPluginVersion() {
            return this.stVersion;
        }
    };

    export class TEnvironment {

        // 原始数据
        private OriData: TEnvOriData;

        // 浏览器信息
        private BrowserInfo: IEnvBrowserInfo;

        // 系统信息
        private SysInfo: IEnvSystemInfo;

        // 插件信息
        private PluginInfo = {};

        // 初始化原始信息
        private _init_ori_data(obj: any) {
            obj.doc = document || {};
            obj.nav = navigator || { userAgent: "" };
            obj.userAgent = obj.nav.userAgent || "";
        };

        constructor() {
            this.OriData = new TEnvOriData();
            this._init_ori_data(this.OriData);

            // 构造系统信息
            if (this.OriData.userAgent.match(/windows/i))
                this.SysInfo = new TEnvSystemWindowsInfo(this.OriData);
            else if (this.OriData.userAgent.match(/linux|android/i))
                this.SysInfo = new TEnvSystemLinuxInfo(this.OriData);
            else if (this.OriData.userAgent.match(/macintosh|iphone|ipad|ipod/i))
                this.SysInfo = new TEnvSystemMacIOSInfo(this.OriData);
            else
                this.SysInfo = new TEnvSystemOtherInfo(this.OriData);

            // 构造浏览器信息
            if (this.OriData.userAgent.match(/opera|pesto/i))
                this.BrowserInfo = new TEnvBrowserOperaInfo(this.OriData, this.SysInfo);
            else if (this.OriData.userAgent.match(/msie|trident/i))
                this.BrowserInfo = new TEnvBrowserIEInfo(this.OriData, this.SysInfo);
            else if (this.OriData.userAgent.match(/safari|applewebkit/i))
                this.BrowserInfo = new TEnvBrowserWebkitInfo(this.OriData, this.SysInfo);
            else if (this.OriData.userAgent.match(/firefox|gecko/i))
                this.BrowserInfo = new TEnvBrowserFirefoxInfo(this.OriData, this.SysInfo);
            else
                this.BrowserInfo = new TEnvBrowserOtherInfo(this.OriData, this.SysInfo);

            // 构造插件信息
            if (this.OriData.nav.plugins) {
                try{
                    for (var i = 0; i < this.OriData.nav.plugins.length; ++i) {
                        var t_plugin = new TEnvPluginInfo(this.OriData.nav.plugins[i]);
                        if (t_plugin.getPluginName() == "")
                            continue;
                        var pname = t_plugin.getPluginName().toLowerCase();
                        if (this.PluginInfo[pname]) {
                            if (t_plugin.getPluginVersion().toString())
                                this.PluginInfo[pname] = t_plugin;
                            continue;
                        }

                        this.PluginInfo[pname] = t_plugin;
                    }
                }catch(e) {
                }
            }
            // 特殊插件 -- IE下 .Net 和 Silverlight 运行时
            if ("Trident" == this.BrowserInfo.getBrowserKernelName()) {
                try {
                    // DotNet
                    var dot_net_arr = [
                        { reg: /.net clr 2.0/i, pname: ".Net 2.0" },
                        { reg: /.net clr 3.0/i, pname: ".Net 3.0" },
                        { reg: /.net clr 3.5/i, pname: ".Net 3.5" },
                        { reg: /.net4.0c/i, pname: ".Net 4.0 Client" },
                        { reg: /.net4.0e/i, pname: ".Net 4.0 Full" }
                    ];

                    for (var i = 0; i < dot_net_arr.length; ++i) {
                        var tdn_plugin = new TEnvPluginIEDotNetInfo(this.OriData.userAgent, dot_net_arr[i].reg, dot_net_arr[i].pname);
                        if ("" == tdn_plugin.getPluginName())
                            continue;
                        this.PluginInfo[dot_net_arr[i].pname.toLowerCase()] = tdn_plugin;
                    }

                    // Sillverlight
                    var silver_start_ver = 2;
                    var silverlight_activex = new ActiveXObject("AgControl.AgControl");
                    while (true) {
                        if (false == silverlight_activex.IsVersionSupported(silver_start_ver + ".0"))
                            break;
                        ++silver_start_ver;
                    }
                    if (silver_start_ver > 2) {
                        --silver_start_ver;
                        var silver_start_ver_s = 0;
                        while (silverlight_activex.IsVersionSupported(silver_start_ver + "." + silver_start_ver_s))
                            ++silver_start_ver_s;
                        --silver_start_ver_s;
                        this.PluginInfo["silverlight"] = new TEnvPluginIESilverlightInfo(new TEnvVersionInfo(silver_start_ver + "." + silver_start_ver_s));
                    }
                } catch (e) {
                }
            }

            // 结束

        }

        public getOriInfo() {
            return this.OriData;
        }

        public getSysInfo() {
            return this.SysInfo;
        }

        public getBrowserInfo() {
            return this.BrowserInfo;
        }

        public getPluginsInfo() {
            return this.PluginInfo;
        }

        public toString() {
            return this.getBrowserInfo().getBrowserName() + " " +
                this.getBrowserInfo().getBrowserVersion() + " " +
                this.getBrowserInfo().getAdditional() + " on " +
                this.getSysInfo().getOSName() + " "
                this.getSysInfo().getArchitecture()
        }
    };


    /**
     * Get the information of current environment.
     * @package Util
     * @return The information of current environment.
     * @example	var bro = Util.getEnvironment();
     * @version	2.0.0
     * @since	2.0.0
     */
    export function getEnvironment() {
        return new TEnvironment();
    };

    declare var jQuery;
    (function () {
        try {
            if (jQuery) jQuery.extend({
                environment: getEnvironment()
            });
        } catch (e) { }
    })();
}


