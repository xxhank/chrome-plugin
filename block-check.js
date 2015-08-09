if ($("body #checker").length == 0) {

    var checkerDiv = [
        "<div id='checker' class='popout checker-minimize'>"
        , "<button id='size-button' class='size-button-minimize'>-</button>"
        , "<div id='items'>"
        , "</div>"
        , "<div id='checker-toolbar'>"
        , "<a class='toolbar-item' id='prev-page'>上一页</a>"
        , "<a class='toolbar-item' id='next-page'>下一页</a>"
        , "<span id='reportCount'></span>"
        , "<span id='shieldCount'></span>"
        , "<span id='readedCount'></span>"
        , "<span id='threadCount'></span>"
        , "<button id='autocheck-button'>自动查水</button>"
        , "</div>"
        , "</div>"
    ].join(" ");

    $("body").append(checkerDiv);
}

$("#check-button").bind('click', function() {
    check();
});


var counter = {
    "reportCount": 0, /// 举报数量
    "shieldCount": 0, /// 屏蔽数量
    "readedCount": 0 /// 已阅数量
};

var today = new Date();
var countKey = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
defaultOptions[countKey] = "0,0,0";

var autoCheckMode = false;
var tabID = "";
if (typeof chrome.storage != undefined) {
    chrome.storage.sync.get(defaultOptions, function(items) {

        suffix = items.signature;

        var values = items[countKey].split(",");
        counter.reportCount = parseInt(values[0]);
        counter.shieldCount = parseInt(values[1]);
        counter.readedCount = parseInt(values[2]);

        chrome.runtime.sendMessage({
            action: "tab_id"
        }, function(response) {
            tabID = "tab_" + response.tabID;
            var autocheckObj = {};
            autocheckObj[tabID] = false;
            chrome.storage.local.get(autocheckObj, function(items) {
                autoCheckMode = items[tabID];
                check();
            });

        });
    });
}

var autoCheckThread = -1;
var lastTheadGap = 0;
var datas = [];

function check() {
    /// 显示统计数据
    $("#reportCount", checker).text("举报:" + counter.reportCount);
    $("#shieldCount", checker).text("屏蔽:" + counter.shieldCount);
    $("#readedCount", checker).text("已阅:" + counter.readedCount);

    $("#items", checker).html("<ul></ul>");
    var root = $("#items>ul", checker);

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
    } else {
        $("#next-page", checker).addClass("disable");
    }

    $("#size-button", checker).bind('click', function() {
        if ($(checker).hasClass('checker-normal')) {
            $(checker).removeClass('checker-normal');
            $(checker).addClass('checker-minimize');

            $(this).removeClass('size-button-normal');
            $(this).addClass('size-button-minimize');
        } else {
            $(checker).removeClass('checker-minimize');
            $(checker).addClass('checker-normal');

            $(this).removeClass('size-button-minimize');
            $(this).addClass('size-button-normal');
        }
    });
    //var normalTopic = false;

    $("#main tr.tr3, #main tr.tr2").each(function(idx, element) {
        var trText = $(element).text();
        if (trText == "普通主题") {
            //normalTopic = true;
            datas = [];
        }

        var tds = $("td", element);

        /// 检查已阅信息
        var link = tds[1];
        var checkResult = $("a.subject", link);
        var checkResultFont = $("span.w font", checkResult);
        if (!checkResultFont || checkResultFont.length == 0) {
            checkResultFont = $("span.w font", link);
        }
        var checkText = $(checkResultFont).text();
        var checkedFloorNumber = 0;
        if (checkText != "") {
            var matchs = checkText.match(/阅至 (\d+)楼/);
            if (matchs && matchs.length > 1)
                checkedFloorNumber = parseInt(matchs[1]);
        }

        var href = $(checkResult).attr("href");
        var pageIndex = Math.floor((checkedFloorNumber + 1) / 10);
        if (pageIndex > 0) {
            pageIndex += 1;
            href = href.replace(".html", "-page-" + pageIndex + ".html");
        }

        /// 检查回复信息
        var reply = tds[3];
        var replyText = $(reply).text();
        var replyNumber = 0;
        var replyMatchs = replyText.match(/(\d+)\/(\d+)/);
        if (replyMatchs && replyMatchs.length > 1)
            replyNumber = parseInt(replyMatchs[1]);

        /// 检查最后回复时间
        var lastReplyTime = tds[4];
        var lastReplyTimeText = $("span", lastReplyTime).text();
        var gapText = "未知";
        if (lastReplyTimeText) {
            var end = Date.now();
            var begin = new Date(lastReplyTimeText);
            var gap = Math.floor((end - begin) / (24 * 60 * 60 * 1000));
            gapText = gap + "天前";
            if (gap == 0) {
                gapText = "今天";
            } else if (gap == 1) {
                gapText = "昨天";
            } else if (gap == 0) {
                gapText = "前天";
            }

            lastTheadGap = gap;
        }

        var floorTitle = $(checkResult).text();
        floorTitle = floorTitle.replace(/\n.*/, "").replace(/\s+\(.*/, "").trim();
        if (floorTitle.match(/公告/) || floorTitle.match(/宣传帖/)) {
            return;
        }
        if (checkedFloorNumber < replyNumber) {
            if (gap >= 0) {
                autoCheckThread = idx;
            }

            href = href + "?checked=" + checkedFloorNumber + "&autocheck=" + autoCheckMode;
            datas.push([
                "<li id='report-list-" + idx + "'>"
                , "<a class='ref-content-thread' href='" + href + "'>"
                , floorTitle.substr(0, 20), "</a>"
                , '<span class="ref-days">' + gapText + '</span>'
                , '<a id="ref-button-thread-' + idx + '" class="ref-button-thread" href="' + href + '">'
                , checkedFloorNumber + '/' + replyNumber + '</a>'
                , '</li>'
            ].join(" "));
        }
    });

    datas.forEach(function(item) {
        root.append(item);
    });

    $('#autocheck-button').text(autoCheckMode ? "暂停" : "自动查水");
    $('#autocheck-button').bind('click', function() {
        autoCheckMode = !autoCheckMode;
        var autocheckObj = {};
        autocheckObj[tabID] = autoCheckMode;
        chrome.storage.local.set(autocheckObj, function() {
            if (autoCheckMode) {
                autoCheck();
            }
        });

        $(this).text(autoCheckMode ? "暂停" : "自动查水");

    });

    if (autoCheckMode) {
        autoCheck();
    }

    function autoCheck() {
        if (datas.length == 0) {
            root.append("<li id='report-list-no'>本页不需要检查, 去下一页吧.</li>");

            if (!autoCheckMode) {
                return;
            }

            if (lastTheadGap > 30) {
                autoCheckMode = !autoCheckMode;
                var autocheckObj = {};
                autocheckObj[tabID] = autoCheckMode;
                chrome.storage.local.set(autocheckObj, function() {});
                $('#autocheck-button').text(autoCheckMode ? "暂停" : "自动查水");
                return;
            }
            new Timer().run(function(element) {
                var refButtons = $("#next-page");
                if (!refButtons || refButtons.length == 0) {
                    return false;
                }
                return true;
            }, checker, 500).next(function(element) {
                var refButtons = $("#next-page");
                refButtons[0].click();
            }, checker);

        } else {
            $("#threadCount", checker).text("主题数:" + datas.length);

            if (!autoCheckMode) {
                return;
            }

            new Timer().run(function(element) {
                var selector = '#ref-button-thread-' + autoCheckThread;
                var refButtons = $(selector);
                if (!refButtons || refButtons.length == 0) {
                    return false;
                }
                return true;
            }, checker, 500).next(function(element) {
                var selector = '#ref-button-thread-' + autoCheckThread;
                var refButtons = $(selector);
                if (refButtons.length > 0) {
                    refButtons[0].click();
                } else {
                    var refButtons = $("#next-page");
                    refButtons[0].click();
                }
            }, checker);
        }
    }
}
