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
(function(exports) {

    function trim(p) {
        return p.slice(+(p.substring(0, 1) === '/'), p.length - (p.substring(p.length - 1) === '/'));
    }

    function combinePath(one, two) {

        var a = trim(one).split('/'),
            b = trim(two).split('/');

        for(var i = 0, l = b.length; i < l; i++) {

            var t = b.shift();
            if (t === '..' ) {
                if (a[a.length - 1] !== '..') {
                    a.pop();
                }

            } else if (t === '.') {
                continue;

            } else {
                a.push(t);
            }

        }

        return a.join('/');

    }

    var moduleCache = {};
    function requireWithBase(parent, base) {

        parent = parent.replace(/\./g, '').replace(/^\//, '').replace(/\//g, '.');

        return function(name) {

            if (name.substring(0, 1) !== '.') {
                return window[name];
            }

            var mod = combinePath(base, name),
                path = '/' + combinePath(document.location.pathname, mod) + '.js';

            if (moduleCache.hasOwnProperty(path)) {
                console.info('[require ' + name + ' (cached) by ' + parent + ']');
                return moduleCache[path];

            } else {

                var req = new XMLHttpRequest();
                req.open('GET', path, false);
                req.send();

                var c = 'constructor',
                    module = {
                        exports: {}
                    };

                if (req.status !== 200) {
                    throw new Error('Cannot find module \'' + name + '\' required by ' + parent);

                } else {
                    console.info('[require ' + name + ' (initial) by ' + parent + ']');

                    var f = new c[c][c]('module', 'exports', 'require', req.responseText),
                        require = requireWithBase(mod, mod.split('/').slice(0, -1).join('/'));

                    f(module, module.exports, require);

                }

                moduleCache[path] = module.exports;

                return module.exports;

            }

        };

    }

    exports.require = requireWithBase('global', './class');

})(window);

