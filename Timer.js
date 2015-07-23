 function Timer(maxRetry) {
     this._maxRetry = maxRetry || 30;

     if (Timer._initialized) {
         return;
     }

     Timer._initialized = true;
     Timer.prototype.run = function(produce, param, interval, runImmediately) {
         setTimeout(function(timer) {
             timer.do(produce, param, interval, runImmediately);
         }, 100, this);
         return this;
     };
     Timer.prototype.do = function(produce, param, interval, runImmediately) {
         if (runImmediately) {
             if (produce(param)) {
                 return;
             }
         }

         var retryTimes = 0;
         (function wrapper(timer, maxRetry) {
             setTimeout(function(timer, maxRetry) {
                 if (!produce(param) && ++retryTimes < maxRetry) {
                     wrapper(notify, maxRetry);
                 } else {
                     timer.notifyNext();
                 }
             }, interval || 1000, timer, maxRetry);
         })(this, this._maxRetry || 30);
     };
     Timer.prototype.next = function(produce, param) {
         this._nextProduce = produce;
         this._nextParam = param;
     };
     Timer.prototype.notifyNext = function() {
         if (this._nextProduce) {
             this._nextProduce(this._nextParam);
         }
     };
 };
