class _Promise {
    constructor(cb) {
        if (!(cb && {}.toString.call(cb) == '[object Function]')) {
            throw new TypeError(`Promise resolver ${cb} is not a function`);
        }
        this.functionChain = [];
        process.nextTick(() => {
            try {
                cb(this.resolve, this.reject);
            } catch (err) {
                this.reject(err);
            }
        });
    }
    resolve = (data) => {
        const successHandlerIndex = this.functionChain.findIndex((e) => e.type === 'success');
        if (successHandlerIndex < 0) {
            return;
        }
        this.handle(successHandlerIndex, data);
    };
    reject = (error) => {
        const errorHandlerIndex = this.functionChain.findIndex((e) => e.type === 'error');
        if (errorHandlerIndex < 0) {
            return console.log(
                `UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch().`
            );
        }
        this.handle(errorHandlerIndex, error);
    };
    handle(handlerIndex, value) {
        const handler = this.functionChain[handlerIndex].func;
        this.functionChain = this.functionChain.slice(handlerIndex + 1);
        try {
            const returnedValue = handler(value);
            if (returnedValue instanceof _Promise) {
                returnedValue.setFunctionChain(this.functionChain);
                return;
            }
            this.resolve(returnedValue);
        } catch (error) {
            this.reject(error);
        }
    }
    then(successCallback) {
        this.functionChain.push({ type: 'success', func: successCallback });
        return this;
    }
    catch(errorCallback) {
        this.functionChain.push({ type: 'error', func: errorCallback });
        return this;
    }
    setFunctionChain(functionChain) {
        this.functionChain = functionChain;
    }
}

module.exports = _Promise;
