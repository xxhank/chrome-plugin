// Saves options to chrome.storage
if (!chrome.storage) {
    chrome.storage = {
        sync: {
            get: function(keys, callback) {
                callback(keys);
            },
            set: function() {

            }
        }

    };
}
 
var maxReasonNumber = 0;
var reasons = [];
var reasonIDs = [];
//document.addEventListener('DOMContentLoaded', restore_options);
//document.getElementById('save').addEventListener('click', save_options);

$(document).ready(function() {

    (function() {
        // load 
        chrome.storage.sync.get({
            reasons: '[{"idx":0,"name":"纯拼音回复"},{"idx":1,"name":"万能回复"}]',
            signature: "~请熟读版规~督察blflower",
            maxReasonNumber: 2
        }, function(items) {
            maxReasonNumber = items["maxReasonNumber"];
            $("#signature").val(items["signature"]);
            var reasonsJSONString = items["reasons"];
            reasons = JSON.parse(reasonsJSONString);

            var reasonIDs = [];
            reasons.forEach(function(item) {
                var index = item["idx"];
                var name = item["name"];
                item["id"] = "reason-define-" + index;
                reasonIDs.push(item["id"]);
                addReason(index);
            });

            chrome.storage.sync.get(reasonIDs, function(items) {
                reasonIDs.forEach(function(reasonID, idx) {
                    var textareas = $("#reasons #" + reasonID + " textarea");
                    $(textareas[0]).val(reasons[idx].name);
                    $(textareas[1]).val(items[reasonID]);
                });

            });
        });
    })();

    function addReason(id, name, value) {
        var component = [
            '<div class="reason-define" id="reason-define-' + id + '" >'
            , '<div class="reason-name"><span>原因:</span><textarea></textarea></div>'
            , '<div class="reason-rule"><span>规则:</span><textarea></textarea></div>', '</div>'
        ].join(" ");
        $("#reasons").append(component);
    }

    $("#add-reason").bind("click", function() {
        addReason(maxReasonNumber);
        reasons.push({
            idx: maxReasonNumber
        });

        maxReasonNumber++;
    });

    $('#save').bind('click', function() {
        var data = {};
        var reasonNames = [];
        reasons.forEach(function(item, index, array) {
            var reasonID = "reason-define-" + item["idx"];
            var textareas = $("#reasons #" + reasonID + " textarea");
            var reasonName = $(textareas[0]).val();
            var reasonRunles = $(textareas[1]).val();
            reasonNames.push({
                idx: item["idx"],
                name: reasonName
            });

            var reasonData = {};
            reasonData[reasonID] = reasonRunles;
            chrome.storage.sync.set(reasonData, function() {

            });
        });

        data["reasons"] = JSON.stringify(reasonNames);
        data["signature"] = $("#signature").val();
        data["maxReasonNumber"] = maxReasonNumber;
        chrome.storage.sync.set(data, function() {
            alert(chrome.runtime.lastError?"出错啦":"已经保存");
        });
    });
});
