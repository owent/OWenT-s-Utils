
var sgame_config = {
    btn_height: 44,
    width: 640
};

var sgame_loop = {
    3: [
        '机会只有一次哦，真的要放弃？',
        '这样真的好吗？',
        '再考虑一下呗？男神诶！',
        '再确认一次，真的真的要放弃？',
        '再给你一次机会吧，任然放弃吗？',
    ]
};

var sgame_progress = {
    1: {
        pic: "sgame/640.jpg",
        btn_height: 88,
        btn: {
            305: 2,
            405: "alert('谁说可以读档的？');",
            506: "alert('要退出直接关浏览器呗，不然你告诉我怎退出？');"
        }
    },
    2: {
        pic: "sgame/641.jpg",
        btn: 3
    },
    3 : {
        pic: "sgame/642.jpg",
        btn: {
            694: 4,
            740: "for(var s = 0; confirm(sgame_loop[3][s]); s = (s + 1) % sgame_loop[3].length );"
        }
    },
    4: {
        pic: "sgame/643.jpg",
        btn: {
            782: 5,
            826: 6
        }
    },
    5: {
        pic: "sgame/647.jpg",
        btn: 9
    },
    6: {
        pic: "sgame/644.jpg",
        btn: {
            782: 7,
            826: 8
        }
    },
    7: {
        pic: "sgame/645.jpg",
        btn: 8
    },
    8: {
        pic: "sgame/646.jpg",
        btn: 1
    },
    9: {
        pic: "sgame/648.jpg",
        btn: 11
    },
    11: {
        pic: "sgame/649.jpg",
        btn: {
            782: 14,
            826: 12
        }
    },
    12: {
        pic: "sgame/650.jpg",
        btn: 13
    },
    13: {
        pic: "sgame/651.jpg",
        btn: 1
    },
    14: {
        pic: "sgame/652.jpg",
        btn: 15
    },
    15: {
        pic: "sgame/653.jpg",
        btn: 16
    },
    16: {
        pic: "sgame/654.jpg",
        btn: {
            868: 17,
            912: "alert('老爷爷: 剧情设定，你必须扶我？');"
        }
    },
    17: {
        pic: "sgame/655.jpg",
        btn: 18
    },
    18: {
        pic: "sgame/656.jpg",
        btn: 19
    },
    19: {
        pic: "sgame/657.jpg",
        btn: 20
    },
    20: {
        pic: "sgame/658.jpg",
        btn: {
            826: 21,
            870: "alert('安慰中...zzz。似乎没什么效果。');"
        }
    },
    21: {
        pic: "sgame/659.jpg",
        btn: 22
    },
    22: {
        pic: "sgame/660.jpg",
        btn: 23
    },
    23: {
        pic: "sgame/661.jpg",
        btn: 24
    },
    24: {
        pic: "sgame/662.jpg",
        btn: {
            1070: 25,
            1114: 26
        }
    },
    25: {
        pic: "sgame/663.jpg",
        btn: 1
    },
    26: {
        pic: "sgame/664.jpg",
        btn: 27
    },
    27: {
        pic: "sgame/665.jpg",
        btn: 1
    }
};

function goto(i) {
    if (!sgame_progress[i]) {
        alert("出错啦： 该选想目标不存在！");
        return;
    }

    var stage = sgame_progress[i];
    var img_dom = document.getElementById('pics');
    var btns_dom = document.getElementById('btns');
    var notice_dom = document.getElementById('notice');
    img_dom.setAttribute('src', stage.pic);

    var btn_height = stage.btn_height || sgame_config.btn_height;
    var full_width = stage.width || sgame_config.width;

    if ('number' == typeof (stage.btn)) {
        btns_dom.innerHTML = '';
        btns_dom.innerHTML = '<area shape="rect" coords="0,0,' + full_width + ',1920" href="javascript:goto(' + stage.btn + ');" alt="点击继续"/>';
        notice_dom.innerHTML = "点击图片的任意位置继续";
    } else {
        btns_dom.innerHTML = '';
        for (var j in stage.btn) {
            var btn_data = stage.btn[j];
            if ('number' == typeof (btn_data)) {
                btns_dom.innerHTML += '<area shape="rect" coords="0,' + j + ',' + full_width + ',' + (parseInt(j) + btn_height) + '" href="javascript:goto(' + btn_data + ');" alt="点击选这个"/>';
            } else {
                btns_dom.innerHTML += '<area shape="rect" coords="0,' + j + ',' + full_width + ',' + (parseInt(j) + btn_height) + '" href="javascript:' +
                    btn_data.replace(/\\/g, "\\\\").replace(/"/g, "\\\"") +
                    ';" alt="点击选这个"/>';
            }
        }
        notice_dom.innerHTML = "直接点击文字就可以了哦";
    }
}