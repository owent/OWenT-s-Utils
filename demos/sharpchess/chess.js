var myBody;
var data = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
var dataBtn = [['', '', ''], ['', '', ''], ['', '', '']];
var AISelecter;
var OriAIWin = 0;
var GodAIWin = 0;
var PlayerWinOri = 0;
var PlayerWinGod = 0
var NoneWin = 0;
var GameOver = false;
var recorder = document.createElement("div");
function init() {
    if (window.addEventListener) {
        var attach = function (el, ev, handler) {
            el.addEventListener(ev, handler, false);
        }
    } else if (window.attachEvent) {
        var attach = function (el, ev, handler) {
            el.attachEvent('on' + ev, handler);
        }
    } else {
        var attach = function (el, ev, handler) {
            ev['on' + ev] = handler;
        }
    }

    var tmpDiv = document.createElement("div");
    var tmpAuthor = document.createElement("div");
    tmpAuthor.innerHTML = "2010年1月7日更新<br />●增强浏览器兼容（IE6,IE7）<br />●增加统计功能<br />●最新版已经找不到了，这个纯当留念";
    var tmpBtnReplay = document.createElement("input");
    AISelecter = document.createElement("select");
    var tmpaisopn1 = document.createElement("option");
    tmpaisopn1.innerHTML = "攻击型AI";
    var tmpaisopn2 = document.createElement("option");
    tmpaisopn2.innerHTML = "防御型AI";
    AISelecter.appendChild(tmpaisopn1);
    AISelecter.appendChild(tmpaisopn2);
    tmpBtnReplay.setAttribute("type", "button");
    tmpBtnReplay.value = "新游戏(玩家先手)";
    attach(tmpBtnReplay, "click", function () { play(0); });
    var tmpBtnReplay2 = document.createElement("input");
    tmpBtnReplay2.setAttribute("type", "button");
    tmpBtnReplay2.value = "新游戏(电脑先手)";
    attach(tmpBtnReplay2, "click", function () { play(1); });

    tmpDiv.setAttribute("align", "center");
    myBody = document.getElementsByTagName("body").item(0);
    var tmpC1 = document.createElement("h1");
    tmpC1.innerHTML = "一个简单的#棋智能,你能赢吗?";
    var tmpC2 = document.createElement("table");
    for (var i = 0; i < 3; i++) {
        var tmpRow = tmpC2.insertRow(tmpC2.rows.length);
        for (var j = 0; j < 3; j++) {
            var tmpCell = tmpRow.insertCell(tmpRow.cells.length);
            var tmpClBtn = document.createElement("input");
            tmpClBtn.value = i + ":" + j;
            tmpClBtn.setAttribute("type", "button");
            attach(tmpClBtn, "click", function(ev){
				for(var tmpi = 0 ; tmpi < 3 ; tmpi ++)
					for(var tmpj = 0 ; tmpj < 3 ; tmpj ++)
						if(dataBtn[tmpi][tmpj] == this)
							OnBtnClick(tmpi, tmpj);
            });
            dataBtn[i][j] = tmpClBtn;
            tmpCell.appendChild(tmpClBtn);
        }
    }
    tmpDiv.appendChild(tmpC1);
	tmpDiv.appendChild(recorder);
    tmpDiv.appendChild(tmpBtnReplay);
    tmpDiv.appendChild(tmpBtnReplay2);
    tmpDiv.appendChild(AISelecter);
    tmpDiv.appendChild(tmpC2);
    myBody.appendChild(tmpDiv);
	myBody.appendChild(tmpAuthor);
    show();
	formatRecord();
}
function formatRecord() {
    recorder.innerHTML = "攻击型AI胜利次数：" 
		+ GodAIWin + "&nbsp;&nbsp;&nbsp;&nbsp;防御型AI胜利次数："
		+ OriAIWin + "<br />玩家胜利次数(对手为攻击型AI)："
		+ PlayerWinGod + "&nbsp;&nbsp;&nbsp;&nbsp;玩家胜利次数(对手为防御型AI)："
		+ PlayerWinOri + "<br />平局次数："
		+ NoneWin;
}
function reloadD() {
	GameOver = false;
    for (var i = 0; i < 3; i++)
        for (var j = 0; j < 3; j++)
        data[i][j] = 0;
    show();
}
function pauseGame() {
    for (var i = 0; i < 3; i++)
        for (var j = 0; j < 3; j++)
        dataBtn[i][j].disabled = "disabled";
}
function show() {
    for (var i = 0; i < 3; i++)
        for (var j = 0; j < 3; j++)
        if (data[i][j] == 0) {
        dataBtn[i][j].value = "";
        dataBtn[i][j].removeAttribute("disabled");
        dataBtn[i][j].className = "commonChess";
    }
    else if (data[i][j] == 1) {
        dataBtn[i][j].value = "●";
        dataBtn[i][j].disabled = "disabled";
        dataBtn[i][j].className = "myChess";
    }
    else if (data[i][j] == 2) {
        dataBtn[i][j].value = "□";
        dataBtn[i][j].disabled = "disabled";
        dataBtn[i][j].className = "computerChess";
    }
}
function OnBtnClick(r, c) {
    if (data[r][c] == 2) {
        alert("这个位置已经被电脑走掉了,请选择其他位置");
        return;
    }
    else if (data[r][c] == 1) {
        alert("这个位置已经被你走掉了,请选择其他位置");
        return;
    }
    else if (data[r][c] == 0) {
        data[r][c] = 1;
        show();
        checkSul();
        computerTurn();
    }
}
function getVectory() {
    var i, j;
    var gisover = false;
    var win = 0;
    for (i = 0; i < 3; i++) {
        var isover = true;
        for (j = 1; j < 3; j++) {
            if (data[i][j] != data[i][j - 1] || data[i][j] <= 0) {
                isover = false;
                if (data[i][j - 1] > 0 && data[i][j] > 0) { win--; break; }
            }
        }
        if (isover) {
            gisover = isover;
            win = data[i][0];
            return win;
        }
        isover = true;
        for (j = 1; j < 3; j++) {
            if (data[j][i] != data[j - 1][i] || data[j][i] <= 0) {
                isover = false;
                if (data[j - 1][i] > 0 && data[j][i] > 0) { win--; break; }
            }
        }
        if (isover) {
            gisover = isover;
            win = data[0][i];
            return win;
        }
    }

    if (!gisover) {
        var isover = true;
        for (j = 1; j < 3; j++) if (data[j][j] != data[j - 1][j - 1] || data[j][j] <= 0) {
            isover = false;
            if (data[j - 1][j - 1] > 0 && data[j][j] > 0) { win--; break; };
        }
        if (isover) { gisover = isover; win = data[0][0]; return win; }
    }
    if (!gisover) {
        var isover = true;
        for (j = 1; j < 3; j++) if (data[j][2 - j] != data[j - 1][3 - j] || data[j][2 - j] <= 0) {
            isover = false;
            if (data[j - 1][3 - j] > 0 && data[j][2 - j] > 0) { win--; break; }
        }
        if (isover) { gisover = isover; win = data[0][2]; return win; }
    }
    return win;
}
function checkSul() {
	if(GameOver)
		return;
    var win = getVectory();
    if (win == 1){
        alert("恭喜你,你赢了"), pauseGame();
        if (AISelecter.value == "攻击型AI")
			PlayerWinGod ++;
		else
			PlayerWinOri ++;
		GameOver = true;
	}
    else if (win == 2){
        alert("很遗憾,你输了\n再来一盘吧"), pauseGame();
        if (AISelecter.value == "攻击型AI")
			GodAIWin ++;
		else
			OriAIWin ++;
		GameOver = true;
	}
    else if (win <= -8){
        alert("平局了"), pauseGame();
		NoneWin ++;
		GameOver = true;
	};
	formatRecord();
}
function play(id) { reloadD(); if (id == 1) computerTurn(); }

function testFill(func1, func2) {
    for (var i = 0; i < 3; ++i) {
        for (var j = 0; j < 3; ++j) {
            if (data[i][j] != 0)
                continue;
            data[i][j] = 2;
            if (func2)
                func2.apply(this, [i, j]);
            data[i][j] = 1;
            if (func1)
                func1.apply(this, [i, j]);
            data[i][j] = 0;
        }
    }
}

function findDiagonal1() {
    var c1 = 0, c2 = 0, cp1, cp2;
    var dia = [8, -4, 6, -4, -4, -4, 2, -4, 0];
    for (var i = 0; i < 3; ++i)
        for (var j = 0; j < 3; j++)
            if (data[i][j] == 1)
                ++c1, cp1 = i * 3 + j;
            else if (data[i][j] == 2)
                ++c2, cp2 = i * 3 + j;
    
    return [c1, c2, (c1 == 1) ? [parseInt(dia[cp1] / 3), dia[cp1] % 3] : null, (c2 == 1) ? [parseInt(dia[cp2] / 3), dia[cp2] % 3] : null];
}

function findWillWin(v) {
    for (var i = 0; i < 3; ++i) {
        for (var j = 0; j < 3; j++) {
            if (data[i][j] != 0)
                continue;
            data[i][j] = v;
            if (getVectory() == v) {
                data[i][j] = 0;
                return [i, j];
            }
            data[i][j] = 0;
        }
    }

    return null;
}

function checkWillWin(v, t, f) {
    var r = findWillWin(v);
    if (r)
        data[r[0]][r[1]] = t;
    f.apply(this, []);
    if (r)
        data[r[0]][r[1]] = 0;
}

function computerTurn() {
    var score = [[2, 0, 2], [0, 1, 0], [2, 0, 2]];

    // 直接胜利、直接堵截
    testFill(function (x, y) {
        if (getVectory() == 1)
            score[x][y] += 32767;
    }, function (x, y) {
        if (getVectory() == 2)
            score[x][y] += 65536;
    });

    // 一次预测胜利、一次预测堵截
    testFill(function (x, y) {
        if (getVectory() == 1)
            return;

        //checkWillWin(1, 2, function () {
            testFill(function () {
                if (getVectory() == 1)
                    score[x][y] += 1024;
            }, null);
        //});
    }, function (x, y) {
        if (getVectory() == 2)
            return;

        //checkWillWin(2, 1, function () {
            testFill(null, function () {
                if (getVectory() == 2)
                    score[x][y] += 4096;
            });
        //});
    });

    // 两次预测胜利、两次预测堵截
    testFill(function (x, y) {
        if (getVectory() == 1)
            return;

        checkWillWin(1, 2, function () {
            testFill(function () {
                if (getVectory() == 1)
                    return;

                checkWillWin(1, 2, function () {
                    testFill(function () {
                        if (getVectory() == 1)
                            score[x][y] += 4;
                    }, null);
                });
            }, null);
        });

    }, function (x, y) {
        if (getVectory() == 2)
            return;

        checkWillWin(2, 1, function () {
            testFill(null, function () {
                if (getVectory() == 2)
                    return;

                checkWillWin(2, 1, function () {
                    testFill(null, function () {
                        if (getVectory() == 2)
                            score[x][y] += 16;
                    });
                });
                
            });
        });
    });
    
    // 特殊防御策略
    var dia_info = findDiagonal1();
    if (dia_info[2] !== null && dia_info[2][0] >= 0 && dia_info[1] == 0)
        score[1][1] += 1024;
    if (dia_info[0] == 2 && dia_info[1] == 1) {
        if ((data[0][0] == 1 && data[2][2] == 1) ||
            (data[0][2] == 1 && data[2][0] == 1)) {
            score[0][1] += 2048;
            score[2][1] += 2048;
            score[1][0] += 2048;
            score[1][2] += 2048;
        }
    }

    // 攻击型AI特殊攻击策略
    if (AISelecter.value == "攻击型AI") {
        if (dia_info[0] == 1 && dia_info[1] == 1 && data[1][1] == 1)
            score[dia_info[3][0]][dia_info[3][1]] += 4096 + 2048;
    }

    // 随机选分数最大的
    var max_score = 0, max_pos = [];
    for (var i = 0; i < 3; ++i)
        for (var j = 0; j < 3; ++j)
            if (data[i][j] == 0)
                max_score = Math.max(max_score, score[i][j]);

    for (var i = 0; i < 3; ++i)
        for (var j = 0; j < 3; ++j)
            if (max_score == score[i][j] && data[i][j] == 0)
                max_pos.push([i, j]);

    max_score = parseInt(Math.random() * 10000 * max_pos.length) % max_pos.length;
    data[max_pos[max_score][0]][max_pos[max_score][1]] = 2;

    show(); checkSul();
}