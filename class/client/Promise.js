/**
  * Copyright (c) 2013 Ivo Wetzel.
  *
  * Permission is hereby granted, free of charge, to any person obtaining a copy
  * of this software and associated documentation files (the "Software"), to deal
  * in the Software without restriction, including without limitation the rights
  * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  * copies of the Software, and to permit persons to whom the Software is
  * furnished to do so, subject to the following conditions:
  *
  * The above copyright notice and this permission notice shall be included in
  * all copies or substantial portions of the Software.
  *
  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  * THE SOFTWARE.
  */
exports.Promise = function() {

    var args = Array.prototype.slice.call(arguments),
        argsCount = args.length,
        argsDone = 0,
        isParallel = false,
        promiseData = [],
        promiseState = -1,
        runTimeout,
        callbacks = [[], []];

    function done(mode) {

        if (promiseState === -1) {

            promiseState = mode;

            var list = callbacks[promiseState].slice();
            callbacks[promiseState].length = 0;
            for(var i = 0; i < list.length; i++) {
                list[i][0].apply(list[i][1] || null, promiseData);
            }

        }

    }

    function register(mode, callback, scope) {
        promiseState === mode ? callback.apply(scope || null, promiseData)
                              : callbacks[mode].push([callback, scope]);
    }

    var handle = {

        run: function() {

            runTimeout = setTimeout(function() {

                var cb;
                while((cb = args.shift())) {

                    cb.call(handle);

                    if (!isParallel) {
                        break;
                    }

                }

            }, 0);

            return handle;
        },

        parallel: function() {
            isParallel = true;
            return handle;
        },

        wait: function() {
            clearTimeout(runTimeout);
            return handle;
        },

        success: function(callback, scope) {
            register(0, callback, scope);
            return handle;
        },

        error: function(callback, scope) {
            register(1, callback, scope);
            return handle;
        },

        resolve: function(result) {

            promiseData.push(result);

            argsDone++;
            if (argsDone < argsCount) {
                handle.run();

            } else  {
                done(0, promiseData);
            }

            return handle;

        },

        reject: function(reason) {
            done(1, [reason]);
            return handle;
        }

    };

    return handle.run();

};

