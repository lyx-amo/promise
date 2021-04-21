(function (window) {
    const PENDING = 'pending'
    const FULFILLED = 'fulfilled'
    const REJECTED = 'rejected'

    function Promise(excutor) {
        const self = this
        self.status = PENDING
        self.data = undefined
        self.callbacks = []

        function resolve(value) {
            if (self.status !== PENDING) return
            self.status = FULFILLED
            self.data = value

            if (self.callbacks.length > 0) {
                setTimeout(() => {
                    self.callbacks.forEach(cbsObj => {
                        cbsObj.onFulfilled(self.data)
                    })
                });
            }
        }
        function reject(reason) {
            if (self.status !== PENDING) return
            self.status = REJECTED
            self.data = reason

            if (self.callbacks.length > 0) {
                setTimeout(() => {
                    self.callbacks.forEach(cbsObj => {
                        cbsObj.onRejected(self.data)
                    })
                });
            }
        }
        //如果在excutor 执行器中抛出异常，使用try...catch 捕获错误执行失败的回调
        try {
            excutor(resolve, reject)
        } catch (error) {
            reject(error)
        }
    }

    /*
        如果当前Promise是fulfilled状态，异步执行成功的回调函数onFulfilled
        如果当前Promise是rejected状态，异步执行失败的回调函数onRejected
        如果当前Promise是pending状态，保存回调函数
    
        返回一个新的Promise 
        它的状态由onFulfilled或onRjected决定
        1、抛出error ==>变为rejected 结果为error
        2、返回值不是Promise ==> 变为fulfilled 结果为返回值
        3、返回值是Promise ==>  由返回的Promise的结果决定新的Promise的结果(成功/失败)
    */

    Promise.prototype.then = (onFulfilled, onRejected) => {
        const self = this
        //如果用户只传入了成功的回调，失败的回调需要指定一个默认值，将失败的原因继续向下传递，成功同理
        onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value

        return new Promise((resolve, reject) => {

            function handle(callback) {
                try {
                    const result = callback(self.data)
                    if (!(result instanceof Promise)) {
                        resolve(self.data)
                    } else {
                        result.then(resolve, reject)
                    }
                } catch (error) {
                    reject(error)
                }
            }

            if (self.status === FULFILLED) {
                setTimeout(() => {
                    handle(onFulfilled)
                });
            } else if (self.status === REJECTED) {
                setTimeout(() => {
                    handle(onRejected)
                });
            } else {
                self.callbacks.push({
                    onFulfilled(value) {
                        handle(onFulfilled)
                    },
                    onRejected(reason) {
                        handle(onRejected)
                    }
                })
            }

        })
    }


    Promise.prototype.catch = (onRejected) => {
        return this.then(undefined, onRejected)
    }


    Promise.resolve = value => {
        return new Promise((resolve, reject) => {
            if (value instanceof Promise) {
                value.then(resolve, reject)
            } else {
                resolve(value)
            }
        })
    }

    Promise.reject = reason => {
        return new Promise((resolve, reject) => {
            reject(reason)
        })
    }

    Promise.all = Promises => {
        return new Promise((resolve, reject) => {
            const resolveCount = 0
            const values = new Array(Promises.length)
            Promises.forEach((p, i) => {
                p.then(
                    value => {
                        resolveCount++
                        values[i] = value
                        if (resolveCount === Promises.length) {
                            resolve(values)
                        }
                    },
                    reason => {
                        reject(reason)
                    }
                )
            })
        })
    }

    Promise.race = Promises => {
        return new Promise((resolve, reject) => {
            Promises.forEach(p => {
                p.then(resolve, reject)
            })
        })
    }
    window.Promise = Promise
}(window))