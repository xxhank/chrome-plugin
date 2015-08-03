if ($("body #checker").length == 0) {

    var checkerDiv = [
        , "<div id='checker' class=`popout`>"
        , "<div id='items'>"
        , "</div>"
        , "<div id='checker-toolbar'>"
        , "<a class='toolbar-item' id='prev-page'>上一页</a>"
        , "<a class='toolbar-item' id='next-page'>下一页</a>"
        , "<span id='reportCount'></span>"
        , "<span id='shieldCount'></span>"
        , "<span id='readedCount'></span>"
        , "<span id='threadCount'></span>"
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

if (typeof chrome.storage != undefined) {
    chrome.storage.sync.get(defaultOptions, function(items) {

        suffix = items.signature;
        //reportCount = items.reportCount;
        //shieldCount = items.shieldCount;
        //readedCount = items.readedCount;
        var values = items[countKey].split(",");
        counter.reportCount = parseInt(values[0]);
        counter.shieldCount = parseInt(values[1]);
        counter.readedCount = parseInt(values[2]);


        check();
    })
}


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

    //var normalTopic = false;
    var datas = [];
    var autoCheckThread = -1;
    var needCheckNextPage = true;
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
        }



        var floorTitle = $(checkResult).text();
        floorTitle = floorTitle.replace(/\n.*/, "").replace(/\s+\(.*/, "").trim();

        if (checkedFloorNumber < replyNumber) {
            if (gap < 3) {
                autoCheckThread = idx;
            }
            if (gap > 3) {
                needCheckNextPage = false;
            }

            href = href + "?checked=" + checkedFloorNumber;
            datas.push([
                "<li id='report-list-" + idx + "'>"
                , "<a class='ref-content-thread' href='" + href + "'>"
                , floorTitle.substr(0, 20)
                , "</a>"
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
    if (datas.length == 0) {
        root.append("<li id='report-list-no'>本页不需要检查, 去下一页吧.</li>");
    } else {
        $("#threadCount", checker).text("主题数:" + datas.length);
    }

    if (autoCheckThread != -1) {
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
            refButtons[0].click();
        }, checker);
    } else {
        if (!needCheckNextPage) {
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
    }
}
