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

            setTimeout(() => {
                self.callbacks.forEach(cbsObj => {
                    cbsObj.onResolved(self.data)
                });
            }, 0);
        }

        function reject(reason) {
            if (self.status !== PENDING) return
            self.status = REJECTED
            self.data = reason

            setTimeout(() => {
                self.callbacks.forEach(cbsObj => {
                    cbsObj.onRejected(self.data)
                });
            }, 0);
        }

        try {
            excutor(resolve, reject)
        } catch (error) {
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

    Promise.prototype.then((onResolved, onRejected) => {
        const self = this

        onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };
        onResolved = typeof onResolved === 'function' ? onResolved : value => value;


        return new Promise((resolve, reject) => {

            function handle(callback) {
                try {
                    const result = callback(self.data)
                    if (!(result instanceof Promise)) {
                        resolve(result)
                    } else {
                        result.then(resolve, reject)
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
            } else {//pending
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
    })

    Promise.prototype.catch = (onRejected) => {
        return this.then(undefined, onRejected)
    }


    Promise.resolve = (value) => {
        return new Promise((resolve, reject) => {
            if (value instanceof Promise) {
                value.then(resolve, reject)
            } else {
                resolve(value)
            }
        })
    }


    Promise.reject = (reason) => {
        return new Promise((resolve, reject) => {
            reject(reason)
        })
    }

    //计数实现
    Promise.all = (Promises) => {
        let resolveCount = 0
        let values = new Array(Promises.length)
        return new Promise((resolve, reject) => {
            Promises.forEach((p, index) => {
                p.then(
                    value => {
                        resolveCount++
                        values[index] = value
                        if (resolveCount.length === Promises.length) {
                            resolve(values)
                        }
                    },
                    reason => reject(reason)
                )
            })
        })
    }

    Promise.race = (Promises) => {
        return new Promise((resolve, reject) => {
            Promises.forEach(p => {
                p.then(resolve, reject)
            })
        })
    }

    window.Promise = Promise
}(window))