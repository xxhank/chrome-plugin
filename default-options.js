var defaultOptions = {
    reasons: '[{"idx":0,"name":"5分钟之内连回数贴~恶意刷贴"},{"idx":1,"name":"纯拼音回复"},{"idx":2,"name":"回复没有表达任何主题意义"},{"idx":3,"name":"回复恶意灌水"},{"idx":4,"name":"回复纯表情"},{"idx":5,"name":"万能回复"}]',
    signature: "~请熟读版规~督察blflower",
    maxReasonNumber: 6,
    reportCount: 0,
    readedCount: 0,
    shieldCount: 0
};

var defaultOptionRules = {
    "reason-define-0": "",
    "reason-define-1": "^[a-zA-Z0-9!@#$%\^&*()_\+\s\t@]+$",
    "reason-define-2": "",
    "reason-define-3": "\n(.{1})\1+\n(.{2}).*\1+\n(.{3}).*\1+\n顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶\n1111111111111111111111111111111111\nDDDDDDDDDDDDDDDDDDDDDDD\n如果您提交过一次失败了，可以用”恢复数据”来恢复帖子内容dasfsdasfasfafsf3dsaf2dfasffsfafassdfaf\n的法萨芬书的飞洒的份的手法的收复失\n@#￥%@#@#%@#￥%@#@￥%￥%\n顶！！！！！！！！！！！！！！！！\n一直潜水，基本上不回贴，后来发现这样很傻很多比我注册晚的人等级都比我高。于是我就把这段文字保存在记事本里每看一贴就复制粘贴一次。",
    "reason-define-4": "^\s*$",
    "reason-define-5": "回复下看看\n回复看一看\n支持\n谢谢楼主\n谢谢分享\n支持支持\n很好不错\n不错不错\n很好看\n女的不错\n片子不错\n非常漂亮\n赞一个\n很漂亮\n顶楼主\n赞楼主\n楼主辛苦了\n先回复后下载\n我喜欢\n男的很猛啊\n的确很爽\n一定很爽\n纯支持\n真给力啊\n太模糊了吧\n佩服.*学习\n身材真棒!\n绝对是好片\n一定爽歪歪了\n看不到脸啊\n哇给力啊\n太诱人了\n是不是真的哦\n好，顶贴\n很刺激啊\n重口味啊\n口活不错\n期待你们有新的作品\n实在是太棒了\n这个我喜欢\n绝对经典额\n发帖辛苦支持一下"
}
