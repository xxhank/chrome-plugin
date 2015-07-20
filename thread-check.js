if ($("body #checker").length == 0) {

    var checkerDiv = [
        "<div id='checker' class=`popout`>", "<div id='checker-toolbar'>", "<a class='toolbar-item' id='prev-page'>上一页</a>", "<a  class='toolbar-item' id='next-page'>下一页</a>", "<span id='reportCount'></span>", "</div>", "<div id='items'>", "</div>", "</div>"
    ].join(" ");

    $("body").append(checkerDiv);
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

$("#check-button").bind('click', function() {
    check();
});
check();

function check() {
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

        var floorTitle = $(checkResult).text();
        floorTitle = floorTitle.replace(/\n.*/, "").replace(/\s+\(.*/, "").trim();

        if (checkedFloorNumber < replyNumber) {
            href = href + "?checked=" + checkedFloorNumber;
            datas.push([
                "<li id='report-list-" + idx + "'>"
                , "<a class='ref-content-thread' href='"+href+"'>"
                , floorTitle.substr(0,20)
                , "</a>"
                , '<a class="ref-button-thread" href="' + href + '">' + checkedFloorNumber + '/' + replyNumber + '</a>', '</li>'
            ].join(" "));
        }
    });

    datas.forEach(function(item) {
        root.append(item);
    });
}
