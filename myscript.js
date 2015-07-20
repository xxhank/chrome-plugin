if ($("body #checker").length == 0) {

    var checkerDiv = [
        "<div id='checker' class=`popout`>", "<div id='checker-toolbar'>", "<a class='toolbar-item' id='prev-page'>上一页</a>", "<a  class='toolbar-item' id='next-page'>下一页</a>", "<a  class='toolbar-item' id='prev-topic'>上一主题</a>", "<a  class='toolbar-item' id='next-topic'>下一主题</a>", "<span id='reportCount'></span>", "</div>", "<div id='items'>", "</div>", "</div>"
    ].join(" ");

    $("body").append(checkerDiv);
}

var decodeArea = undefined;

function reportFloor(floor) {
    alert("floor" + floor);
}

function decodeEntities(input) {
    if (!decodeArea) {
        decodeArea = document.createElement('textarea');
        decodeArea.style.height = 0;
    }

    decodeArea.innerHTML = input;
    return decodeArea.value;
}

var floorDatas = [];

var suffix = "~请熟读版规~督察blflower";
var options = [];
var timerID;
var reportCount = 0;

if (typeof chrome.storage != undefined) {
    chrome.storage.sync.get(defaultOptions, function(items) {

        suffix = items.signature;
        reportCount = items.reportCount;

        var reasonsJSONString = items["reasons"];
        options = JSON.parse(reasonsJSONString);

        var reasonIDs = [];
        options.forEach(function(item) {
            var index = item["idx"];
            var name = item["name"];
            reasonIDs.push("reason-define-" + index);
        });
        var reasonIDsObject = {};

        reasonIDs.forEach(function(reasonID) {
            reasonIDsObject[reasonID] = defaultOptionRules[reasonID] || "";
        });

        chrome.storage.sync.get(reasonIDsObject, function(items) {
            reasonIDs.forEach(function(reasonID, idx) {
                options[idx].rules = items[reasonID].split("\n");
            });
            check_water();
        });
    });
}

if (!Array.prototype.findIndex) {
    Array.prototype.findIndex = function(predicate) {
        if (this == null) {
            throw new TypeError('Array.prototype.findIndex called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;

        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return i;
            }
        }
        return -1;
    };
}

var hasNextPage = false;

function check_water() {
    floorDatas = [];

    var checker = $("#checker");
    $("#reportCount", checker).text("已举报:" + reportCount);

    var topics = $("#main .t3 span.pages>a");

    $("#prev-topic", checker).attr("href", $(topics[0]).attr("href"));
    $("#next-topic", checker).attr("href", $(topics[1]).attr("href"));

    var currentPage = $("#main .t3 span.fl b")[0];
    var prevPage = $(currentPage).prev()[0];
    if (prevPage != undefined && $(prevPage).text() != "«") {
        $("#prev-page", checker)
            .attr("href", $(prevPage).attr("href"));
    } else {
        $("#prev-page", checker).addClass("disable");
    }

    var nextPage = $(currentPage).next()[0];
    if (nextPage != undefined && $(nextPage).text() != "»") {
        $("#next-page", checker)
            .attr("href", $(nextPage).attr("href"));
        hasNextPage = true;
    } else {
        $("#next-page", checker).addClass("disable");
    }

    $("#items", checker).html("<ul></ul>");
    var root = $("#items>ul", checker);
    var optionStings = [];
    options.forEach(function(item) {
        optionStings.push(item["name"]);
    });
    var reason = "<select class='ref-reason' name='reason'><option>" + optionStings.join("</option><option>") + "</option></select>";
    var idx = 0;

    $("#main .t5").each(function(index, element) {
        var numberElement = $("a[title*='复制此楼地址']", element);
        var number = numberElement.text();
        if (number == "楼主") {
            return;
        }

        var time = numberElement.parent().next().attr("title");

        var date = new Date(time);
        var now = Date.now();
        var elapsed = now - date;
        var onMonth = 30 * 24 * 60 * 60 * 1000;
        if (elapsed > onMonth) {
            root.append("<p>超过有效查水时间<p>");
            return;
        }

        var content = $("div[id^='read_']", element).text();
        content = content.trim();

        if (content == "该主题已被管理员屏蔽!" || content == "用户被禁言,该主题自动屏蔽!") {
            // return;
        }

        var selected = 1;
        var checkContent = decodeEntities(content.trim());
        checkContent = checkContent.trim();

        selected = 1 + options.findIndex(function(option, index, array) {
            var rules = option["rules"];
            if (!rules) {
                return false;
            };

            return -1 != (rules.findIndex(function(rule) {
                if (!rule) {
                    return false
                };
                var regexp = new RegExp(rule);
                return checkContent.match(regexp);
            }));
        });


        if (checkContent.match(/^\s*$/)) {
            content = "<纯表情>";
        }

        var orignReportButton = $('a[title="举报此帖"]', element);
        var key = orignReportButton.attr("onclick").match(/(tid=[^']*)/)[1];
        var orginSheildButton = $('a[title="屏蔽单帖"]', element);
        var readedButton = $('a[title="标记版主已阅"]', element);

        floorDatas.push({
            "number": number,
            "storage-key": key
        });

        var floorIndex = idx;
        var onclick = orignReportButton.attr("onclick");
        var refContent = content.substring(0, 20);
        reportButton = "<a class='ref-button' onclick=\"" + onclick + "\" id='report-button-" + floorIndex + "'>举报</a>";

        var levelInfo = $("div.user-pic", element).next().text();
        levelInfo = levelInfo.replace("\n", "")
            //'级别: Level 0'
            // 级别: VIP荣誉会员
            // 

        var level = 0; //vip
        var levelMatchs = levelInfo.match(/(级别: VIP荣誉会员)/);

        if (levelMatchs && levelMatchs.length > 1) {
            level = 999;
        } else {
            levelMatchs = levelInfo.match(/级别: (Level)? (\d+)/);
            if (levelMatchs && levelMatchs.length > 1) {
                level = levelMatchs[2];
            }
        }
        root.append(
            "<li id='report-list-" + idx + "'>" + "<div class='ref-content'>" + number + " " + refContent + "</div>" + reason + reportButton
            ///
            + '<a class="ref-button-shield" id="' + orginSheildButton.attr("id") + '" href="' + orginSheildButton.attr("href") + '" onclick="' + orginSheildButton.attr("onclick") + '" levelData="' + level + '">屏蔽</a>'

            ///
            + '<a class="ref-button-readed disable" id="' + readedButton.attr("id") + '" href="' + readedButton.attr("href") + '" onclick="' + readedButton.attr("onclick") + '" levelData="' + level + '">已阅</a>' + "</li>"
        );
        $("li:last option:nth-child(" + selected + ")", root).attr("selected", "selected");
        idx++;
    });

    addReportButton(root);
    addShielfButton(root);
}

function triggerSubmit(reporterReasonArea) {

    setTimeout(function() {
        if (reporterReasonArea.text() != "") {
            $("#pw_box .btn").trigger('click');
            console.log("submit now")
        } else {
            triggerSubmit(reporterReasonArea);
        }
    }, 100);
}

var shieldTimerID = 0;

function addShielfButton(root) {
    setTimeout(function() {
        var refButtons = $(".ref-button-shield", root);
        if (!refButtons || refButtons.length == 0) {
            addReportButton(root);
            return;
        }

        if (!hasNextPage) {
            var lastReadedButton = $(".ref-button-readed", root).last();
            lastReadedButton.removeClass('disable');
        }
        refButtons.bind('click', function() {
            var sender = $(this);
            var level = parseInt(sender.attr("levelData"));
            var retryTimes = 0;
            clearInterval(shieldTimerID);
            shieldTimerID = setInterval(function() {
                var trs = $("#box_container tr");
                if (trs && trs.length == 5) {
                    closeTimer();
                } else {
                    if (retryTimes++ > 30) {
                        closeTimer()
                        alert("请刷新页面重试");
                    }
                    return;
                }

                if ($("#box_container").text().match(/520: Web server is returning an unknown error/)) {

                    return;
                }

                setTimeout(function() {
                    $("#pw_box").css({
                        "position": "fixed",
                        "z-index": "4999",
                        "top": "auto"
                    });

                    $("#pw_box").css("bottom", function() {
                        return $("#checker").height() + 100 + 30;
                    });

                    var notifyBox = $("#box_container tr")[3]
                    var notifyOptions = $("input", notifyBox)
                    var textAreaBox = $("#box_container tr")[4];
                    var textArea = $("textarea", textAreaBox);
                    var submitButton = $("#box_container ul input");


                    // VIP 不发送短消息通知
                    if (level == 999) {
                        $(notifyOptions[1]).click();
                    }

                    textArea.text("亲！请勿恶意灌水，精彩回复有奖哦。");
                    triggerSubmit(textArea);

                }, 100);



            }, 1000, "");
            closeTimer = function() {
                clearInterval(shieldTimerID);
            };
        });
    }, 1);
}

function addReportButton(root) {
    setTimeout(function() {
        var refButtons = $(".ref-button", root);
        if (!refButtons || refButtons.length == 0) {
            addReportButton(root);
            return;
        }
        var keys = [];
        floorDatas.forEach(function(floorData, index, array) {
            keys.push(floorData["storage-key"]);
        });

        chrome.storage.local.get(keys, function(items) {

            floorDatas.forEach(function(floorData, index, array) {
                //keys.push(floorData["storage-key"]);
                var value = items[floorData["storage-key"]];
                if (value) {
                    $("#report-button-" + index, root).text("已举报");
                } else {
                    $("#report-button-" + index, root).text("举报");
                }
            });


        });

        refButtons.bind('click', function() {
            var sender = $(this);
            var reporterKey = sender.attr("onclick").match(/(tid=[^']*)/)[1];
            var buttonID = sender.attr("id").replace("report-button-", "");
            buttonID = parseInt(buttonID);

            listItem = $("#report-list-" + buttonID);
            var reasonItem = $("select :selected", listItem);
            console.log("count:" + reasonItem.length);
            var reason = reasonItem.text();
            var floorData = floorDatas[buttonID];

            var reportStatusReportStart = 0
            var reportStatusReporting = 1;
            var reportStatusReportSuccess = 2;
            var reportStatusReportFailed = 3;


            var reportStatus = reportStatusReportStart;
            var retryTimes = 0;
            clearInterval(timerID);
            timerID = setInterval(function(reporterKey) {

                if ($("#box_container").text().match(/520: Web server is returning an unknown error/)) {
                    closeTimer();
                    return;
                }
                var matchObj = null;
                $("#box_container div div").each(function(idx, obj) {
                    if ($(obj).text().match(/该内容已经有人举报过/)) {
                        reportStatus = reportStatusReportFailed;
                        matchObj = obj;
                    }
                });

                $("#box_container div div").each(function(idx, obj) {
                    if ($(obj).text().match(/举报成功/)) {
                        reportStatus = reportStatusReportSuccess;
                        matchObj = obj;
                    }
                });

                if (reportStatus == reportStatusReportFailed) {
                    closeTimer()

                    var data = {};
                    data[reporterKey] = "already reported";
                    chrome.storage.local.set(data, function() {

                    });
                    sender.text("已举报");

                    $("input", $(matchObj).parent().next()).trigger("click");


                } else if (reportStatus == reportStatusReportSuccess) {
                    closeTimer()
                    var data = {};
                    data[reporterKey] = "reported success";

                    chrome.storage.local.set(data, function() {
                        console.log(chrome.runtime.lastError);
                    });
                    reportCount++;

                    $("#reportCount", checker).text("已举报:" + reportCount);
                    chrome.storage.sync.set({
                        "reportCount": reportCount
                    });
                    sender.text("举报成功");
                    $("input", $(matchObj).parent().next()).trigger("click");

                } else if (reportStatus == reportStatusReportStart) {
                    var reporterReasonArea = $("#reason");
                    if (reporterReasonArea.length == 1) {
                        reportStatus = reportStatusReporting;
                        sender.text("举报中");
                        $("#pw_box").css({
                            "position": "fixed",
                            "z-index": "4999",
                            "top": "auto"
                        });

                        $("#pw_box").css("bottom", function() {
                            return $("#checker").height() + 100 + 30;
                        });

                        reporterReasonArea.text(floorData.number + reason + suffix);

                        triggerSubmit(reporterReasonArea);

                        retryTimes = 0;
                        //closeTimer()
                    }
                } else {

                }

                if (retryTimes++ > 30) {
                    closeTimer()
                }
            }, 1000 / 2, reporterKey);

            closeTimer = function() {
                clearInterval(timerID);
            };
        });

    }, 1);
}
//check_water();