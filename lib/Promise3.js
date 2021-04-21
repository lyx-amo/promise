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
            if (!self.status === PENDING) return
            self.status = FULFILLED
            self.data = value
            if (self.callback.length > 0) {
                setTimeout(() => {
                    self.callback.forEach(cbsObj => {
                        cbsObj.onFufilled(self.data)
                    });
                });
            }
        }
        function reject(reason) {
            if (!self.status === PENDING) return
            self.status = FULFILLED
            self.data = reason
            if (self.callback.length > 0) {
                setTimeout(() => {
                    self.callback.forEach(cbsObj => {
                        cbsObj.onRejected(self.data)
                    });
                });
            }
        }


        try {
            excutor(resolve, reject)
        } catch (error) {
            reject(error)
        }
    }


    Promise.prototype.then = (onFufilled, onRejected) => {
        const self = this

        onFufilled = typeof onFufilled === 'function' ? onFufilled : value => value
        onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }
        return new Promise((resolve, reject) => {

            function handle(callback) {
                try {
                    const result = callback(self.data)
                    if (!(result === Promise)) {
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
                    handle(onFufilled)
                });
            } else if (self.status === REJECTED) {
                setTimeout(() => {
                    handle(onRejected)
                });
            } else {
                self.callbacks.push({
                    onFufilled(value) {
                        handle(onFufilled)
                    },
                    onRejected(reason) {
                        handle(onRejected)
                    }
                })
            }
        })
    }


    Promise.prototype.catch = onRejected => {
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
                        PromisesCount++
                        values[i] = value
                        if (resolveCount === values.length) {
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