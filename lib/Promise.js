(function (window) {

    const PENDING = 'pending'
    const RESOLVED = 'resolved'
    const REJECTED = 'rejected'

    function Promise(excutor) {

        const self = this
        self.status = PENDING
        self.data = undefined
        self.callbacks = []

        function resolve(value) {
            if (self.status !== PENDING) return
            self.status = RESOLVED
            self.data = value

            if (self.callbacks.length > 0) {
                setTimeout(() => {
                    self.callbacks.forEach(callbacksObj => {
                        callbacksObj.onResolved(value)
                    });
                });
            }

        }

        function reject(reason) {
            if (self.status !== PENDING) return
            self.status = REJECTED
            self.data = reason

            if (self.callbacks.length > 0) {
                setTimeout(() => {
                    self.callbacks.forEach(callbacksObj => {
                        callbacksObj.onRejected(self.data)
                    });
                });
            }
        }

        try {
            excutor(resolve, reject)
        } catch (error) {
            console.log('1111111');
            reject(error)
        }

    }

    /* 
     用来指定成功/失败回调函数的方法
         1). 如果当前promise是resolved, 异步执行成功的回调函数onResolved
         2). 如果当前promise是rejected, 异步执行成功的回调函数onRejected
         3). 如果当前promise是pending, 保存回调函数
     返回一个新的promise对象
         它的结果状态由onResolved或者onRejected执行的结果决定
         2.1). 抛出error ==> 变为rejected, 结果值为error
         2.2). 返回值不是promise   ==> 变为resolved, 结果值为返回值
         2.3). 返回值是promise    ===> 由这个promise的决定新的promise的结果(成功/失败)
     */
    Promise.prototype.then = (onResolved, onRejected) => {
        const self = this

        onRejected = typeof onRejected === 'function' ? onRejected : (reason) => { throw reason }
        onResolved = typeof onResolved === 'function' ? onResolved : value => value

        return new Promise((resolve, reject) => {

            function handle(callback) {
                try {
                    let result = callback(self.data)
                    if (!(result instanceof Promise)) {
                        resolve(result)
                    } else {
                        result.then(
                            value => { resolve(value) },
                            reason => { resolve(reason) }
                        )

                        // result.then(resolve,reject)
                    }
                } catch (error) {
                    reject(error)
                }

            }
            if (self.status === RESOLVED) {
                setTimeout(() => {
                    handle(onResolved)
                });

            } else if (self.status === REJECTED) {
                setTimeout(() => {
                    handle(onRejected)
                });
            } else {
                self.callbacks.push({
                    onResolved(value) {
                        handle(onResolved)
                    },
                    onRejected(value) {
                        handle(onRejected)
                    }
                })
            }

        })

    }

    Promise.prototype.catch = (onReject) => {

    }

    window.Promise = Promise


}(window))