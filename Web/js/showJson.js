/** 
 * Show json in a new page.(For debug)
 *
 * Licensed under the MIT licenses.
 * @version 1.3
 * @author OWenT
 * @link http://www.owent.net
 * @history 
 *      2012.12.27 
 *          1. 改进JSON内对象循环引用时的导致的栈溢出问题
 *          2. 引入层级路径
 *          3. 引入锚点
 */
  
 /**
  * Object转为字符串
  * @param {Object} json Object对象 
  * @param {Number} tab 缩进数量
  * @param {Object} rules 应用规则
  * @param {String} path 当前路径
  * @return 生成的HTML
  */
function json2String(json, tab, rules, path) {
    var tabStr = "", singleTab = "&nbsp;&nbsp;&nbsp;&nbsp;", isClear = false;
    var txt = "";
     
    if (!rules) {
        rules = {
            id: "__json2string_process" + (new Date).getTime().toString() + (json2String.baseIndex ++),
            objs: []
        };
        isClear = true;
    }
     
    tab = tab || 1;
    if (!path) {
        path = "{ROOT}";
        txt += "<a name=\"" + rules.id + "." + path + "\"> </a>";
    }
     
    for (var i = 0; i < tab; i ++) {
        tabStr += singleTab;
    }
     
    if (!json && json !== 0) {
        txt += '<span style="color: Red;">null</span>';
    } else if (typeof(json) == "object") {
        var prefix = '<span style="color: DarkGray; font-weight: bolder;">{</span>', suffix = '<span style="color: DarkGray; font-weight: bolder;">}</span>';
        try {       
            if (toString.call(json).match(/array/i)) {
                prefix = '<span style="color: Orange;">[</span>';
                suffix = '<span style="color: Orange;">]</span>';
            }
        } catch(e) {
            // hoho ...
        }
         
        if (json[rules.id]) {
            txt += prefix + "此处引用 <a style=\"text-decoration: underline; color: Blue;\" href=\"#" + rules.id + "." + json[rules.id] + "\" target=\"_self\" title=\"跳转到引用 " + json[rules.id] + "\" >" + 
                json[rules.id] + "</a>" + suffix;
            return txt;
        }
        json[rules.id] = path;
        rules.objs.push(json);
         
        txt += prefix + "<br />\r\n";
        var first = true;
        for (var key in json) {
            if (key == rules.id)
                continue;
                 
            if (first)
                first = false;
            else
                txt += ",<br />\r\n";
            txt += tabStr + "<a name=\"" + rules.id + "." + path + "." + key + "\"> </a>" + "<strong>" + 
                key + "</strong> : " +    json2String(json[key], tab + 1, rules, path + "." + key);
        }
        txt += "<br />\r\n" + tabStr.substr(0, tabStr.length - singleTab.length) + suffix;
    } else if (typeof(json) == "string") {
        txt += '<span style="color: Green;">"' + json + '"</span>';
    } else if (typeof(json) == "number") {
        txt += '<span style="color: Blue;">' + json + '</span>';
    } else if (typeof(json) == "function") {
        txt += '<span style="color: Purple;">' + json + '</span>';
    } else {
        txt += json.toString();
    }
     
    if (isClear) {
        for (var i = 0; i < rules.objs.length; ++ i) {
            delete rules.objs[i][rules.id];
        }
        rules.objs = [];
    }
     
    return txt;
}
  
function showJson(json, title, windowName, dlg_opt) {
    json2String.baseIndex = json2String.baseIndex || 0;
     
    title = title || "Json viewer";
    windowName = windowName || "result" + (new Date()).toGMTString();
    if (window.jQuery && jQuery.fn && jQuery.fn.dialog) {
        $("<div></div>").append(json2String(json)).css({
            "text-align": "left"
        }).dialog($.extend({
            "modal": false,
            "title": title,
            "width": 640,
            "height": 480,
            "buttons": {
                "关闭": function() {
                    $( this ).dialog( "close" );
                }
            }
        }, dlg_opt));
    } else {
        var wnd = window.open("about:blank", "_blank", "height=600, width=800, toolbar=no, menubar=no, resizable=yes, location=no, status=no", true);
        if (!wnd)
            alert("窗口被拦截！");
        wnd.document.write("<!DOCTYPE html><html><head><title>" + title + "</title></head><body>" + json2String(json) + "</body></html>");
    }
    return wnd;
}
