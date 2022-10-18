var requirejs, require, define;
!function(global, setTimeout) {
    var req, s, head, baseElement, dataMain, src, interactiveScript, currentlyAddingScript, mainScript, subPath, version = "2.3.4", commentRegExp = /\/\*[\s\S]*?\*\/|([^:"'=]|^)\/\/.*$/gm, cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g, jsSuffixRegExp = /\.js$/, currDirRegExp = /^\.\//, op = Object.prototype, ostring = op.toString, hasOwn = op.hasOwnProperty, isBrowser = !("undefined" == typeof window || "undefined" == typeof navigator || !window.document), isWebWorker = !isBrowser && "undefined" != typeof importScripts, readyRegExp = isBrowser && "PLAYSTATION 3" === navigator.platform ? /^complete$/ : /^(complete|loaded)$/, defContextName = "_", isOpera = "undefined" != typeof opera && "[object Opera]" === opera.toString(), contexts = {}, cfg = {}, globalDefQueue = [], useInteractive = !1;
    function commentReplace(e, t) {
        return t || ""
    }
    function isFunction(e) {
        return "[object Function]" === ostring.call(e)
    }
    function isArray(e) {
        return "[object Array]" === ostring.call(e)
    }
    function each(e, t) {
        var i;
        if (e)
            for (i = 0; i < e.length && (!e[i] || !t(e[i], i, e)); i += 1)
                ;
    }
    function eachReverse(e, t) {
        var i;
        if (e)
            for (i = e.length - 1; i > -1 && (!e[i] || !t(e[i], i, e)); i -= 1)
                ;
    }
    function hasProp(e, t) {
        return hasOwn.call(e, t)
    }
    function getOwn(e, t) {
        return hasProp(e, t) && e[t]
    }
    function eachProp(e, t) {
        var i;
        for (i in e)
            if (hasProp(e, i) && t(e[i], i))
                break
    }
    function mixin(e, t, i, r) {
        return t && eachProp(t, function(t, n) {
            !i && hasProp(e, n) || (!r || "object" != typeof t || !t || isArray(t) || isFunction(t) || t instanceof RegExp ? e[n] = t : (e[n] || (e[n] = {}),
            mixin(e[n], t, i, r)))
        }),
        e
    }
    function bind(e, t) {
        return function() {
            return t.apply(e, arguments)
        }
    }
    function scripts() {
        return document.getElementsByTagName("script")
    }
    function defaultOnError(e) {
        throw e
    }
    function getGlobal(e) {
        if (!e)
            return e;
        var t = global;
        return each(e.split("."), function(e) {
            t = t[e]
        }),
        t
    }
    function makeError(e, t, i, r) {
        var n = new Error(t + "\nhttp://requirejs.org/docs/errors.html#" + e);
        return n.requireType = e,
        n.requireModules = r,
        i && (n.originalError = i),
        n
    }
    if (void 0 === define) {
        if (void 0 !== requirejs) {
            if (isFunction(requirejs))
                return;
            cfg = requirejs,
            requirejs = void 0
        }
        void 0 === require || isFunction(require) || (cfg = require,
        require = void 0),
        req = requirejs = function(e, t, i, r) {
            var n, o, a = defContextName;
            return isArray(e) || "string" == typeof e || (o = e,
            isArray(t) ? (e = t,
            t = i,
            i = r) : e = []),
            o && o.context && (a = o.context),
            (n = getOwn(contexts, a)) || (n = contexts[a] = req.s.newContext(a)),
            o && n.configure(o),
            n.require(e, t, i)
        }
        ,
        req.config = function(e) {
            return req(e)
        }
        ,
        req.nextTick = void 0 !== setTimeout ? function(e) {
            setTimeout(e, 4)
        }
        : function(e) {
            e()
        }
        ,
        require || (require = req),
        req.version = version,
        req.requirejs_pending_count = 0,
        req.jsExtRegExp = /^\/|:|\?|\.js$/,
        req.isBrowser = isBrowser,
        s = req.s = {
            contexts: contexts,
            newContext: newContext
        },
        req({}),
        each(["toUrl", "undef", "defined", "specified"], function(e) {
            req[e] = function() {
                var t = contexts[defContextName];
                return t.require[e].apply(t, arguments)
            }
        }),
        isBrowser && (head = s.head = document.getElementsByTagName("head")[0],
        baseElement = document.getElementsByTagName("base")[0],
        baseElement && (head = s.head = baseElement.parentNode)),
        req.onError = defaultOnError,
        req.createNode = function(e, t, i) {
            var r = e.xhtml ? document.createElementNS("http://www.w3.org/1999/xhtml", "html:script") : document.createElement("script");
            return r.type = e.scriptType || "text/javascript",
            r.charset = "utf-8",
            r.async = !0,
            r
        }
        ,
        req.load = function(e, t, i) {
            var r, n = e && e.config || {};
            if (isBrowser)
                return (r = req.createNode(n, t, i)).setAttribute("data-requirecontext", e.contextName),
                r.setAttribute("data-requiremodule", t),
                !r.attachEvent || r.attachEvent.toString && r.attachEvent.toString().indexOf("[native code") < 0 || isOpera ? (r.addEventListener("load", e.onScriptLoad, !1),
                r.addEventListener("error", e.onScriptError, !1)) : (useInteractive = !0,
                r.attachEvent("onreadystatechange", e.onScriptLoad)),
                r.src = i,
                n.onNodeCreated && n.onNodeCreated(r, n, t, i),
                currentlyAddingScript = r,
                baseElement ? head.insertBefore(r, baseElement) : head.appendChild(r),
                currentlyAddingScript = null,
                r;
            if (isWebWorker)
                try {
                    setTimeout(function() {}, 0),
                    importScripts(i),
                    e.completeLoad(t)
                } catch (o) {
                    e.onError(makeError("importscripts", "importScripts failed for " + t + " at " + i, o, [t]))
                }
        }
        ,
        isBrowser && !cfg.skipDataMain && eachReverse(scripts(), function(e) {
            if (head || (head = e.parentNode),
            dataMain = e.getAttribute("data-main"))
                return mainScript = dataMain,
                cfg.baseUrl || -1 !== mainScript.indexOf("!") || (src = mainScript.split("/"),
                mainScript = src.pop(),
                subPath = src.length ? src.join("/") + "/" : "./",
                cfg.baseUrl = subPath),
                mainScript = mainScript.replace(jsSuffixRegExp, ""),
                req.jsExtRegExp.test(mainScript) && (mainScript = dataMain),
                cfg.deps = cfg.deps ? cfg.deps.concat(mainScript) : [mainScript],
                !0
        }),
        define = function(e, t, i) {
            var r, n;
            "string" != typeof e && (i = t,
            t = e,
            e = null),
            isArray(t) || (i = t,
            t = null),
            !t && isFunction(i) && (t = [],
            i.length && (i.toString().replace(commentRegExp, commentReplace).replace(cjsRequireRegExp, function(e, i) {
                t.push(i)
            }),
            t = (1 === i.length ? ["require"] : ["require", "exports", "module"]).concat(t))),
            useInteractive && (r = currentlyAddingScript || getInteractiveScript()) && (e || (e = r.getAttribute("data-requiremodule")),
            n = contexts[r.getAttribute("data-requirecontext")]),
            n ? (n.defQueue.push([e, t, i]),
            n.defQueueMap[e] = !0) : globalDefQueue.push([e, t, i])
        }
        ,
        define.amd = {
            jQuery: !0
        },
        req.exec = function(text) {
            return eval(text)
        }
        ,
        req(cfg)
    }
    function newContext(e) {
        var t, i, r, n, o, a = {
            waitSeconds: 7,
            baseUrl: "./",
            paths: {},
            bundles: {},
            pkgs: {},
            shim: {},
            config: {}
        }, s = {}, u = {}, c = {}, d = [], p = {}, f = {}, l = {}, h = 1, m = 1;
        function g(e, t, i) {
            var r, n, o, s, u, c, d, p, f, l, h = t && t.split("/"), m = a.map, g = m && m["*"];
            if (e && (c = (e = e.split("/")).length - 1,
            a.nodeIdCompat && jsSuffixRegExp.test(e[c]) && (e[c] = e[c].replace(jsSuffixRegExp, "")),
            "." === e[0].charAt(0) && h && (e = h.slice(0, h.length - 1).concat(e)),
            function(e) {
                var t, i;
                for (t = 0; t < e.length; t++)
                    if ("." === (i = e[t]))
                        e.splice(t, 1),
                        t -= 1;
                    else if (".." === i) {
                        if (0 === t || 1 === t && ".." === e[2] || ".." === e[t - 1])
                            continue;
                        t > 0 && (e.splice(t - 1, 2),
                        t -= 2)
                    }
            }(e),
            e = e.join("/")),
            i && m && (h || g)) {
                e: for (o = (n = e.split("/")).length; o > 0; o -= 1) {
                    if (u = n.slice(0, o).join("/"),
                    h)
                        for (s = h.length; s > 0; s -= 1)
                            if ((r = getOwn(m, h.slice(0, s).join("/"))) && (r = getOwn(r, u))) {
                                d = r,
                                p = o;
                                break e
                            }
                    !f && g && getOwn(g, u) && (f = getOwn(g, u),
                    l = o)
                }
                !d && f && (d = f,
                p = l),
                d && (n.splice(0, p, d),
                e = n.join("/"))
            }
            return getOwn(a.pkgs, e) || e
        }
        function v(e) {
            isBrowser && each(scripts(), function(t) {
                if (t.getAttribute("data-requiremodule") === e && t.getAttribute("data-requirecontext") === r.contextName)
                    return t.parentNode.removeChild(t),
                    !0
            })
        }
        function x(e) {
            var t = getOwn(a.paths, e);
            if (t && isArray(t) && t.length > 1)
                return t.shift(),
                r.require.undef(e),
                r.makeRequire(null, {
                    skipMap: !0
                })([e]),
                !0
        }
        function b(e) {
            var t, i = e ? e.indexOf("!") : -1;
            return i > -1 && (t = e.substring(0, i),
            e = e.substring(i + 1, e.length)),
            [t, e]
        }
        function q(e, t, i, n) {
            var o, a, s, u, c = null, d = t ? t.name : null, f = e, l = !0, v = "";
            return e || (l = !1,
            e = "_@r" + (h += 1)),
            c = (u = b(e))[0],
            e = u[1],
            c && (c = g(c, d, n),
            a = getOwn(p, c)),
            e && (c ? v = i ? e : a && a.normalize ? a.normalize(e, function(e) {
                return g(e, d, n)
            }) : -1 === e.indexOf("!") ? g(e, d, n) : e : (c = (u = b(v = g(e, d, n)))[0],
            v = u[1],
            i = !0,
            o = r.nameToUrl(v))),
            {
                prefix: c,
                name: v,
                parentMap: t,
                unnormalized: !!(s = !c || a || i ? "" : "_unnormalized" + (m += 1)),
                url: o,
                originalName: f,
                isDefine: l,
                id: (c ? c + "!" + v : v) + s
            }
        }
        function E(e) {
            var t = e.id
              , i = getOwn(s, t);
            return i || (i = s[t] = new r.Module(e)),
            i
        }
        function w(e, t, i) {
            var r = e.id
              , n = getOwn(s, r);
            !hasProp(p, r) || n && !n.defineEmitComplete ? (n = E(e)).error && "error" === t ? i(n.error) : n.on(t, i) : "defined" === t && i(p[r])
        }
        function y(e, t) {
            var i = e.requireModules
              , r = !1;
            t ? t(e) : (each(i, function(t) {
                var i = getOwn(s, t);
                i && (i.error = e,
                i.events.error && (r = !0,
                i.emit("error", e)))
            }),
            r || req.onError(e))
        }
        function S() {
            globalDefQueue.length && (each(globalDefQueue, function(e) {
                var t = e[0];
                "string" == typeof t && (r.defQueueMap[t] = !0),
                d.push(e)
            }),
            globalDefQueue = [])
        }
        function k(e) {
            delete s[e],
            delete u[e]
        }
        function M() {
            var e, i, n = 1e3 * a.waitSeconds, c = n && r.startTime + n < (new Date).getTime(), d = [], f = [], l = !1, h = !0;
            if (!t) {
                if (t = !0,
                eachProp(u, function(e) {
                    var t = e.map
                      , r = t.id;
                    if (e.enabled && (t.isDefine || f.push(e),
                    !e.error))
                        if (!e.inited && c)
                            x(r) ? (i = !0,
                            l = !0) : (d.push(r),
                            v(r));
                        else if (!e.inited && e.fetched && t.isDefine && (l = !0,
                        !t.prefix))
                            return h = !1
                }),
                c && d.length)
                    return (e = makeError("timeout", "Load timeout for modules: " + d, null, d)).contextName = r.contextName,
                    y(e);
                h && each(f, function(e) {
                    !function e(t, i, r) {
                        var n = t.map.id;
                        t.error ? t.emit("error", t.error) : (i[n] = !0,
                        each(t.depMaps, function(n, o) {
                            var a = n.id
                              , u = getOwn(s, a);
                            !u || t.depMatched[o] || r[a] || (getOwn(i, a) ? (t.defineDep(o, p[a]),
                            t.check()) : e(u, i, r))
                        }),
                        r[n] = !0)
                    }(e, {}, {})
                }),
                c && !i || !l || !isBrowser && !isWebWorker || o || (o = setTimeout(function() {
                    o = 0,
                    M()
                }, 50)),
                t = !1
            }
        }
        function O(e) {
            hasProp(p, e[0]) || E(q(e[0], null, !0)).init(e[1], e[2])
        }
        function j(e, t, i, r) {
            e.detachEvent && !isOpera ? r && e.detachEvent(r, t) : e.removeEventListener(i, t, !1)
        }
        function P(e) {
            var t = e.currentTarget || e.srcElement;
            return j(t, r.onScriptLoad, "load", "onreadystatechange"),
            j(t, r.onScriptError, "error"),
            {
                node: t,
                id: t && t.getAttribute("data-requiremodule")
            }
        }
        function R() {
            var e;
            for (S(); d.length; ) {
                if (null === (e = d.shift())[0])
                    return y(makeError("mismatch", "Mismatched anonymous define() module: " + e[e.length - 1]));
                O(e)
            }
            r.defQueueMap = {}
        }
        return n = {
            require: function(e) {
                return e.require ? e.require : e.require = r.makeRequire(e.map)
            },
            exports: function(e) {
                if (e.usingExports = !0,
                e.map.isDefine)
                    return e.exports ? p[e.map.id] = e.exports : e.exports = p[e.map.id] = {}
            },
            module: function(e) {
                return e.module ? e.module : e.module = {
                    id: e.map.id,
                    uri: e.map.url,
                    config: function() {
                        return getOwn(a.config, e.map.id) || {}
                    },
                    exports: e.exports || (e.exports = {})
                }
            }
        },
        (i = function(e) {
            this.events = getOwn(c, e.id) || {},
            this.map = e,
            this.shim = getOwn(a.shim, e.id),
            this.depExports = [],
            this.depMaps = [],
            this.depMatched = [],
            this.pluginMaps = {},
            this.depCount = 0
        }
        ).prototype = {
            init: function(e, t, i, r) {
                r = r || {},
                this.inited || (this.factory = t,
                i ? this.on("error", i) : this.events.error && (i = bind(this, function(e) {
                    this.emit("error", e)
                })),
                this.depMaps = e && e.slice(0),
                this.errback = i,
                this.inited = !0,
                this.ignore = r.ignore,
                r.enabled || this.enabled ? this.enable() : this.check())
            },
            defineDep: function(e, t) {
                this.depMatched[e] || (this.depMatched[e] = !0,
                this.depCount -= 1,
                this.depExports[e] = t)
            },
            fetch: function() {
                if (!this.fetched) {
                    this.fetched = !0,
                    r.startTime = (new Date).getTime();
                    var e = this.map;
                    if (!this.shim)
                        return e.prefix ? this.callPlugin() : this.load();
                    r.makeRequire(this.map, {
                        enableBuildCallback: !0
                    })(this.shim.deps || [], bind(this, function() {
                        return e.prefix ? this.callPlugin() : this.load()
                    }))
                }
            },
            load: function() {
                var e = this.map.url;
                f[e] || (f[e] = !0,
                r.load(this.map.id, e))
            },
            check: function() {
                if (this.enabled && !this.enabling) {
                    var e, t, i = this.map.id, n = this.depExports, o = this.exports, a = this.factory;
                    if (this.inited) {
                        if (this.error)
                            this.emit("error", this.error);
                        else if (!this.defining) {
                            if (this.defining = !0,
                            this.depCount < 1 && !this.defined) {
                                if (isFunction(a)) {
                                    if (this.events.error && this.map.isDefine || req.onError !== defaultOnError)
                                        try {
                                            o = r.execCb(i, a, n, o)
                                        } catch (u) {
                                            e = u,
                                            console.error(e)
                                        }
                                    else
                                        o = r.execCb(i, a, n, o);
                                    if (this.map.isDefine && void 0 === o && ((t = this.module) ? o = t.exports : this.usingExports && (o = this.exports)),
                                    e)
                                        return e.requireMap = this.map,
                                        e.requireModules = this.map.isDefine ? [this.map.id] : null,
                                        e.requireType = this.map.isDefine ? "define" : "require",
                                        y(this.error = e)
                                } else
                                    o = a;
                                if (this.exports = o,
                                this.map.isDefine && !this.ignore && (p[i] = o,
                                req.onResourceLoad)) {
                                    var s = [];
                                    each(this.depMaps, function(e) {
                                        s.push(e.normalizedMap || e)
                                    }),
                                    req.onResourceLoad(r, this.map, s)
                                }
                                k(i),
                                this.defined = !0
                            }
                            this.defining = !1,
                            this.defined && !this.defineEmitted && (this.defineEmitted = !0,
                            this.emit("defined", this.exports),
                            this.defineEmitComplete = !0)
                        }
                    } else
                        hasProp(r.defQueueMap, i) || this.fetch()
                }
            },
            callPlugin: function() {
                var e = this.map
                  , t = e.id
                  , i = q(e.prefix);
                this.depMaps.push(i),
                w(i, "defined", bind(this, function(i) {
                    var n, o, u, c = getOwn(l, this.map.id), d = this.map.name, p = this.map.parentMap ? this.map.parentMap.name : null, f = r.makeRequire(e.parentMap, {
                        enableBuildCallback: !0
                    });
                    return this.map.unnormalized ? (i.normalize && (d = i.normalize(d, function(e) {
                        return g(e, p, !0)
                    }) || ""),
                    w(o = q(e.prefix + "!" + d, this.map.parentMap, !0), "defined", bind(this, function(e) {
                        this.map.normalizedMap = o,
                        this.init([], function() {
                            return e
                        }, null, {
                            enabled: !0,
                            ignore: !0
                        })
                    })),
                    void ((u = getOwn(s, o.id)) && (this.depMaps.push(o),
                    this.events.error && u.on("error", bind(this, function(e) {
                        this.emit("error", e)
                    })),
                    u.enable()))) : c ? (this.map.url = r.nameToUrl(c),
                    void this.load()) : ((n = bind(this, function(e) {
                        this.init([], function() {
                            return e
                        }, null, {
                            enabled: !0
                        })
                    })).error = bind(this, function(e) {
                        this.inited = !0,
                        this.error = e,
                        e.requireModules = [t],
                        eachProp(s, function(e) {
                            0 === e.map.id.indexOf(t + "_unnormalized") && k(e.map.id)
                        }),
                        y(e)
                    }),
                    n.fromText = bind(this, function(i, o) {
                        var s = e.name
                          , u = q(s)
                          , c = useInteractive;
                        o && (i = o),
                        c && (useInteractive = !1),
                        E(u),
                        hasProp(a.config, t) && (a.config[s] = a.config[t]);
                        try {
                            req.exec(i)
                        } catch (d) {
                            return y(makeError("fromtexteval", "fromText eval for " + t + " failed: " + d, d, [t]))
                        }
                        c && (useInteractive = !0),
                        this.depMaps.push(u),
                        r.completeLoad(s),
                        f([s], n)
                    }),
                    void i.load(e.name, f, n, a))
                })),
                r.enable(i, this),
                this.pluginMaps[i.id] = i
            },
            enable: function() {
                u[this.map.id] = this,
                this.enabled = !0,
                this.enabling = !0,
                each(this.depMaps, bind(this, function(e, t) {
                    var i, o, a;
                    if ("string" == typeof e) {
                        if (e = q(e, this.map.isDefine ? this.map : this.map.parentMap, !1, !this.skipMap),
                        this.depMaps[t] = e,
                        a = getOwn(n, e.id))
                            return void (this.depExports[t] = a(this));
                        this.depCount += 1,
                        w(e, "defined", bind(this, function(e) {
                            this.undefed || (this.defineDep(t, e),
                            this.check())
                        })),
                        this.errback ? w(e, "error", bind(this, this.errback)) : this.events.error && w(e, "error", bind(this, function(e) {
                            this.emit("error", e)
                        }))
                    }
                    i = e.id,
                    o = s[i],
                    hasProp(n, i) || !o || o.enabled || r.enable(e, this)
                })),
                eachProp(this.pluginMaps, bind(this, function(e) {
                    var t = getOwn(s, e.id);
                    t && !t.enabled && r.enable(e, this)
                })),
                this.enabling = !1,
                this.check()
            },
            on: function(e, t) {
                var i = this.events[e];
                i || (i = this.events[e] = []),
                i.push(t)
            },
            emit: function(e, t) {
                each(this.events[e], function(e) {
                    e(t)
                }),
                "error" === e && delete this.events[e]
            }
        },
        (r = {
            config: a,
            contextName: e,
            registry: s,
            defined: p,
            urlFetched: f,
            defQueue: d,
            defQueueMap: {},
            Module: i,
            makeModuleMap: q,
            nextTick: req.nextTick,
            onError: y,
            configure: function(e) {
                if (e.baseUrl && "/" !== e.baseUrl.charAt(e.baseUrl.length - 1) && (e.baseUrl += "/"),
                "string" == typeof e.urlArgs) {
                    var t = e.urlArgs;
                    e.urlArgs = function(e, i) {
                        return (-1 === i.indexOf("?") ? "?" : "&") + t
                    }
                }
                var i = a.shim
                  , n = {
                    paths: !0,
                    bundles: !0,
                    config: !0,
                    map: !0
                };
                eachProp(e, function(e, t) {
                    n[t] ? (a[t] || (a[t] = {}),
                    mixin(a[t], e, !0, !0)) : a[t] = e
                }),
                e.bundles && eachProp(e.bundles, function(e, t) {
                    each(e, function(e) {
                        e !== t && (l[e] = t)
                    })
                }),
                e.shim && (eachProp(e.shim, function(e, t) {
                    isArray(e) && (e = {
                        deps: e
                    }),
                    !e.exports && !e.init || e.exportsFn || (e.exportsFn = r.makeShimExports(e)),
                    i[t] = e
                }),
                a.shim = i),
                e.packages && each(e.packages, function(e) {
                    var t;
                    t = (e = "string" == typeof e ? {
                        name: e
                    } : e).name,
                    e.location && (a.paths[t] = e.location),
                    a.pkgs[t] = e.name + "/" + (e.main || "main").replace(currDirRegExp, "").replace(jsSuffixRegExp, "")
                }),
                eachProp(s, function(e, t) {
                    e.inited || e.map.unnormalized || (e.map = q(t, null, !0))
                }),
                (e.deps || e.callback) && r.require(e.deps || [], e.callback)
            },
            makeShimExports: function(e) {
                return function() {
                    var t;
                    return e.init && (t = e.init.apply(global, arguments)),
                    t || e.exports && getGlobal(e.exports)
                }
            },
            makeRequire: function(t, i) {
                function o(a, u, c) {
                    var d, f;
                    return i.enableBuildCallback && u && isFunction(u) && (u.__requireJsBuild = !0),
                    "string" == typeof a ? isFunction(u) ? y(makeError("requireargs", "Invalid require call"), c) : t && hasProp(n, a) ? n[a](s[t.id]) : req.get ? req.get(r, a, t, o) : (d = q(a, t, !1, !0).id,
                    hasProp(p, d) ? p[d] : y(makeError("notloaded", 'Module name "' + d + '" has not been loaded yet for context: ' + e + (t ? "" : ". Use require([])")))) : (req.requirejs_pending_count++,
                    R(),
                    r.nextTick(function() {
                        R(),
                        (f = E(q(null, t))).skipMap = i.skipMap,
                        f.init(a, function() {
                            u && u.apply(this, arguments),
                            req.requirejs_pending_count--
                        }, function() {
                            c && c.apply(this, arguments),
                            req.requirejs_pending_count--
                        }, {
                            enabled: !0
                        }),
                        M()
                    }),
                    o)
                }
                return i = i || {},
                mixin(o, {
                    context: this,
                    isBrowser: isBrowser,
                    toUrl: function(e) {
                        var i, n = e.lastIndexOf("."), o = e.split("/")[0];
                        return -1 !== n && (!("." === o || ".." === o) || n > 1) && (i = e.substring(n, e.length),
                        e = e.substring(0, n)),
                        r.nameToUrl(g(e, t && t.id, !0), i, !0)
                    },
                    defined: function(e) {
                        return hasProp(p, q(e, t, !1, !0).id)
                    },
                    specified: function(e) {
                        return e = q(e, t, !1, !0).id,
                        hasProp(p, e) || hasProp(s, e)
                    }
                }),
                t || (o.undef = function(e) {
                    S();
                    var i = q(e, t, !0)
                      , n = getOwn(s, e);
                    n.undefed = !0,
                    v(e),
                    delete p[e],
                    delete f[i.url],
                    delete c[e],
                    eachReverse(d, function(t, i) {
                        t[0] === e && d.splice(i, 1)
                    }),
                    delete r.defQueueMap[e],
                    n && (n.events.defined && (c[e] = n.events),
                    k(e))
                }
                ),
                o
            },
            enable: function(e) {
                getOwn(s, e.id) && E(e).enable()
            },
            completeLoad: function(e) {
                var t, i, n, o = getOwn(a.shim, e) || {}, u = o.exports;
                for (S(); d.length; ) {
                    if (null === (i = d.shift())[0]) {
                        if (i[0] = e,
                        t)
                            break;
                        t = !0
                    } else
                        i[0] === e && (t = !0);
                    O(i)
                }
                if (r.defQueueMap = {},
                n = getOwn(s, e),
                !t && !hasProp(p, e) && n && !n.inited) {
                    if (!(!a.enforceDefine || u && getGlobal(u)))
                        return x(e) ? void 0 : y(makeError("nodefine", "No define call for " + e, null, [e]));
                    O([e, o.deps || [], o.exportsFn])
                }
                M()
            },
            nameToUrl: function(e, t, i) {
                var n, o, s, u, c, d, p = getOwn(a.pkgs, e);
                if (p && (e = p),
                d = getOwn(l, e))
                    return r.nameToUrl(d, t, i);
                if (n = a.paths,
                req.jsExtRegExp.test(e) && void 0 === n[e])
                    u = e + (t || "");
                else {
                    for (s = (o = e.split("/")).length; s > 0; s -= 1)
                        if (c = getOwn(n, o.slice(0, s).join("/"))) {
                            isArray(c) && (c = c[0]),
                            o.splice(0, s, c);
                            break
                        }
                    u = o.join("/"),
                    u = ("/" === (u += t || (/^data\:|^blob\:|\?/.test(u) || i ? "" : ".js")).charAt(0) || u.match(/^[\w\+\.\-]+:/) ? "" : a.baseUrl) + u
                }
                return u = a.urlArgs && !/^blob\:/.test(u) ? u + a.urlArgs(e, u) : u,
                a.urlPrefix && (u = a.urlPrefix(u) || u),
                u
            },
            load: function(e, t) {
                req.load(r, e, t)
            },
            execCb: function(e, t, i, r) {
                return t.apply(r, i)
            },
            onScriptLoad: function(e) {
                if ("load" === e.type || readyRegExp.test((e.currentTarget || e.srcElement).readyState)) {
                    interactiveScript = null;
                    var t = P(e);
                    r.completeLoad(t.id)
                }
            },
            onScriptError: function(e) {
                var t = P(e);
                if (!x(t.id)) {
                    var i = [];
                    return eachProp(s, function(e, r) {
                        0 !== r.indexOf("_@r") && each(e.depMaps, function(e) {
                            if (e.id === t.id)
                                return i.push(r),
                                !0
                        })
                    }),
                    y(makeError("scripterror", 'Script error for "' + t.id + (i.length ? '", needed by: ' + i.join(", ") : '"'), e, [t.id]))
                }
            }
        }).require = r.makeRequire(),
        r
    }
    function getInteractiveScript() {
        return interactiveScript && "interactive" === interactiveScript.readyState ? interactiveScript : (eachReverse(scripts(), function(e) {
            if ("interactive" === e.readyState)
                return interactiveScript = e
        }),
        interactiveScript)
    }
}(this, "undefined" == typeof setTimeout ? void 0 : setTimeout);

define("sys/hash", ["require", "exports"], function(t, e) {
    "use strict";
    Object.defineProperty(e, "__esModule", {
        value: !0
    }),
    e.genkey = e.sha1_base64 = e.sha1_json = e.sha1 = e.MessageDigestSHA1 = e.MessageDigest = e.md5 = void 0,
    e.md5 = function(t) {
        let e, s, r, i, n, h, u, o, f, a, d, g, l, c, p, b, D, S, y, B, C, x, A, H, M, m, w, I = function(t, e) {
            return t << e | t >>> 32 - e
        }, j = function(t, e) {
            let s, r, i, n, h;
            return i = 2147483648 & t,
            h = 2147483648 & e,
            s = (1073741823 & t) + (1073741823 & e),
            (r = 1073741824 & t) & (n = 1073741824 & e) ? 2147483648 ^ s ^ i ^ h : r | n ? 1073741824 & s ? 3221225472 ^ s ^ i ^ h : 1073741824 ^ s ^ i ^ h : s ^ i ^ h
        }, L = function(t, e, s, r, i, n, h) {
            return t = j(t, j(j(function(t, e, s) {
                return t & e | ~t & s
            }(e, s, r), i), h)),
            j(I(t, n), e)
        }, O = function(t, e, s, r, i, n, h) {
            return t = j(t, j(j(function(t, e, s) {
                return t & s | e & ~s
            }(e, s, r), i), h)),
            j(I(t, n), e)
        }, U = function(t, e, s, r, i, n, h) {
            return t = j(t, j(j(function(t, e, s) {
                return t ^ e ^ s
            }(e, s, r), i), h)),
            j(I(t, n), e)
        }, _ = function(t, e, s, r, i, n, h) {
            return t = j(t, j(j(function(t, e, s) {
                return e ^ (t | ~s)
            }(e, s, r), i), h)),
            j(I(t, n), e)
        }, k = function(t) {
            let e, s, r, i;
            for (e = "",
            s = "",
            i = 0; i <= 3; )
                e += (s = "0" + (r = t >>> 8 * i & 255).toString(16)).substr(s.length - 2, 2),
                i++;
            return e
        };
        for (w = [],
        n = 7,
        h = 12,
        u = 17,
        o = 22,
        f = 5,
        a = 9,
        d = 14,
        g = 20,
        l = 4,
        c = 11,
        p = 16,
        b = 23,
        D = 6,
        S = 10,
        y = 15,
        B = 21,
        w = function(t) {
            let e, s, r, i, n, h, u, o;
            for (i = 16 * (1 + (h = ((n = (r = t.length) + 8) - n % 64) / 64)),
            u = Array(i - 1),
            s = 0,
            e = 0; e < r; )
                s = e % 4 * 8,
                u[o = (e - e % 4) / 4] = u[o] | t.charCodeAt(e) << s,
                e++;
            return s = e % 4 * 8,
            u[o = (e - e % 4) / 4] = u[o] | 128 << s,
            u[i - 2] = r << 3,
            u[i - 1] = r >>> 29,
            u
        }(t = function(t) {
            let e, s, r;
            for (t = t.replace(/\r\n/g, "\n"),
            r = "",
            s = 0; s < t.length; )
                (e = t.charCodeAt(s)) < 128 ? r += String.fromCharCode(e) : e > 127 && e < 2048 ? (r += String.fromCharCode(e >> 6 | 192),
                r += String.fromCharCode(63 & e | 128)) : (r += String.fromCharCode(e >> 12 | 224),
                r += String.fromCharCode(e >> 6 & 63 | 128),
                r += String.fromCharCode(63 & e | 128)),
                s++;
            return r
        }(t)),
        C = 1732584193,
        x = 4023233417,
        A = 2562383102,
        H = 271733878,
        M = 0; M < w.length; )
            e = C,
            s = x,
            r = A,
            i = H,
            C = L(C, x, A, H, w[M + 0], 7, 3614090360),
            H = L(H, C, x, A, w[M + 1], 12, 3905402710),
            A = L(A, H, C, x, w[M + 2], 17, 606105819),
            x = L(x, A, H, C, w[M + 3], 22, 3250441966),
            C = L(C, x, A, H, w[M + 4], 7, 4118548399),
            H = L(H, C, x, A, w[M + 5], 12, 1200080426),
            A = L(A, H, C, x, w[M + 6], 17, 2821735955),
            x = L(x, A, H, C, w[M + 7], 22, 4249261313),
            C = L(C, x, A, H, w[M + 8], 7, 1770035416),
            H = L(H, C, x, A, w[M + 9], 12, 2336552879),
            A = L(A, H, C, x, w[M + 10], 17, 4294925233),
            x = L(x, A, H, C, w[M + 11], 22, 2304563134),
            C = L(C, x, A, H, w[M + 12], 7, 1804603682),
            H = L(H, C, x, A, w[M + 13], 12, 4254626195),
            A = L(A, H, C, x, w[M + 14], 17, 2792965006),
            C = O(C, x = L(x, A, H, C, w[M + 15], 22, 1236535329), A, H, w[M + 1], 5, 4129170786),
            H = O(H, C, x, A, w[M + 6], 9, 3225465664),
            A = O(A, H, C, x, w[M + 11], 14, 643717713),
            x = O(x, A, H, C, w[M + 0], 20, 3921069994),
            C = O(C, x, A, H, w[M + 5], 5, 3593408605),
            H = O(H, C, x, A, w[M + 10], 9, 38016083),
            A = O(A, H, C, x, w[M + 15], 14, 3634488961),
            x = O(x, A, H, C, w[M + 4], 20, 3889429448),
            C = O(C, x, A, H, w[M + 9], 5, 568446438),
            H = O(H, C, x, A, w[M + 14], 9, 3275163606),
            A = O(A, H, C, x, w[M + 3], 14, 4107603335),
            x = O(x, A, H, C, w[M + 8], 20, 1163531501),
            C = O(C, x, A, H, w[M + 13], 5, 2850285829),
            H = O(H, C, x, A, w[M + 2], 9, 4243563512),
            A = O(A, H, C, x, w[M + 7], 14, 1735328473),
            C = U(C, x = O(x, A, H, C, w[M + 12], 20, 2368359562), A, H, w[M + 5], 4, 4294588738),
            H = U(H, C, x, A, w[M + 8], 11, 2272392833),
            A = U(A, H, C, x, w[M + 11], 16, 1839030562),
            x = U(x, A, H, C, w[M + 14], 23, 4259657740),
            C = U(C, x, A, H, w[M + 1], 4, 2763975236),
            H = U(H, C, x, A, w[M + 4], 11, 1272893353),
            A = U(A, H, C, x, w[M + 7], 16, 4139469664),
            x = U(x, A, H, C, w[M + 10], 23, 3200236656),
            C = U(C, x, A, H, w[M + 13], 4, 681279174),
            H = U(H, C, x, A, w[M + 0], 11, 3936430074),
            A = U(A, H, C, x, w[M + 3], 16, 3572445317),
            x = U(x, A, H, C, w[M + 6], 23, 76029189),
            C = U(C, x, A, H, w[M + 9], 4, 3654602809),
            H = U(H, C, x, A, w[M + 12], 11, 3873151461),
            A = U(A, H, C, x, w[M + 15], 16, 530742520),
            C = _(C, x = U(x, A, H, C, w[M + 2], 23, 3299628645), A, H, w[M + 0], 6, 4096336452),
            H = _(H, C, x, A, w[M + 7], 10, 1126891415),
            A = _(A, H, C, x, w[M + 14], 15, 2878612391),
            x = _(x, A, H, C, w[M + 5], 21, 4237533241),
            C = _(C, x, A, H, w[M + 12], 6, 1700485571),
            H = _(H, C, x, A, w[M + 3], 10, 2399980690),
            A = _(A, H, C, x, w[M + 10], 15, 4293915773),
            x = _(x, A, H, C, w[M + 1], 21, 2240044497),
            C = _(C, x, A, H, w[M + 8], 6, 1873313359),
            H = _(H, C, x, A, w[M + 15], 10, 4264355552),
            A = _(A, H, C, x, w[M + 6], 15, 2734768916),
            x = _(x, A, H, C, w[M + 13], 21, 1309151649),
            C = _(C, x, A, H, w[M + 4], 6, 4149444226),
            H = _(H, C, x, A, w[M + 11], 10, 3174756917),
            A = _(A, H, C, x, w[M + 2], 15, 718787259),
            x = _(x, A, H, C, w[M + 9], 21, 3951481745),
            C = j(C, e),
            x = j(x, s),
            A = j(A, r),
            H = j(H, i),
            M += 16;
        return (m = k(C) + k(x) + k(A) + k(H)).toLowerCase()
    }
    ;
    class MessageDigest {
        constructor() {}
        updateByte(t) {
            this.bufIndex === this.bufLen && (this.processBuffer(),
            this.bufIndex = 0),
            this.buf8[this.bufIndex++] = t
        }
        updateCharCode(t) {
            let e = this.buf8
              , s = this.bufIndex
              , r = this.bufLen;
            s === r && (this.processBuffer(),
            s = 0),
            t < 128 ? e[s++] = t : t > 127 && t < 2048 ? (e[s++] = t >> 6 | 192,
            s === r && (this.processBuffer(),
            s = 0),
            e[s++] = 63 & t | 128) : (e[s++] = t >> 12 | 224,
            s === r && (this.processBuffer(),
            s = 0),
            e[s++] = t >> 6 & 63 | 128,
            s === r && (this.processBuffer(),
            s = 0),
            e[s++] = 63 & t | 128),
            this.bufIndex = s
        }
        updateString(t) {
            for (let e = 0, s = t.length; e < s; e++)
                this.updateCharCode(t.charCodeAt(e))
        }
        updateObject(t, e=!1) {
            if (null == t)
                return this.updateString("null");
            let s = typeof t;
            if ("string" === s)
                return this.updateByte(34),
                this.updateString(t),
                void this.updateByte(34);
            if ("number" === s)
                return this.updateString(t.toString());
            if ("boolean" === s)
                return this.updateString(t ? "true" : "false");
            if (Array.isArray(t)) {
                this.updateByte(91);
                for (let e = 0, s = t.length; e < s; e++)
                    this.updateObject(t[e]),
                    e !== s - 1 && this.updateByte(44);
                this.updateByte(93)
            } else {
                if ("object" !== s)
                    throw new Error("unsupported: " + t);
                {
                    if (t instanceof Date)
                        return this.updateString(t.getTime().toString());
                    this.updateByte(123);
                    let s = Object.keys(t);
                    s.sort();
                    let r = 0;
                    for (let i = 0, n = s.length; i < n; i++) {
                        let n = s[i]
                          , h = t[n];
                        e && null == h || (r++ > 0 && this.updateByte(44),
                        this.updateByte(34),
                        this.updateString(n),
                        this.updateByte(34),
                        this.updateByte(58),
                        this.updateObject(h, e))
                    }
                    this.updateByte(125)
                }
            }
        }
        reset() {
            this.bufIndex = 0,
            this.totalLen = 0,
            this.ended = !1
        }
        toBase64() {
            return btoa(String.fromCharCode(...this.digest()))
        }
        toShortKey() {
            return this.toHex().substring(0, 16) + this.totalLen.toString(16)
        }
    }
    e.MessageDigest = MessageDigest;
    class MessageDigestSHA1 extends MessageDigest {
        constructor() {
            super(),
            this.buf = new ArrayBuffer(this.bufLen = 64),
            this.buf8 = new Uint8Array(this.buf),
            this.W = new Int32Array(80),
            this.digest8 = new Uint8Array(20),
            this.reset()
        }
        reset() {
            super.reset(),
            this.D0 = 1732584193,
            this.D1 = 4023233417,
            this.D2 = 2562383102,
            this.D3 = 271733878,
            this.D4 = 3285377520,
            this.hexHashStr = null
        }
        processBuffer() {
            let t, e, s, r, i, n, h, u = this.D0, o = this.D1, f = this.D2, a = this.D3, d = this.D4, g = this.buf8, l = this.W;
            for (e = u,
            s = o,
            r = f,
            i = a,
            n = d,
            t = 0; t < 16; t++)
                h = (e << 5 | e >>> 27) + (s & r | ~s & i) + n + (h = l[t] = g[4 * t] << 24 | g[4 * t + 1] << 16 | g[4 * t + 2] << 8 | g[4 * t + 3]) + 1518500249 & 4294967295,
                n = i,
                i = r,
                r = s << 30 | s >>> 2,
                s = e,
                e = h;
            for (t = 16; t <= 19; t++)
                h = l[t - 3] ^ l[t - 8] ^ l[t - 14] ^ l[t - 16],
                h = (e << 5 | e >>> 27) + (s & r | ~s & i) + n + (h = l[t] = h << 1 | h >>> 31) + 1518500249 & 4294967295,
                n = i,
                i = r,
                r = s << 30 | s >>> 2,
                s = e,
                e = h;
            for (t = 20; t <= 39; t++)
                h = l[t - 3] ^ l[t - 8] ^ l[t - 14] ^ l[t - 16],
                h = (e << 5 | e >>> 27) + (s ^ r ^ i) + n + (h = l[t] = h << 1 | h >>> 31) + 1859775393 & 4294967295,
                n = i,
                i = r,
                r = s << 30 | s >>> 2,
                s = e,
                e = h;
            for (t = 40; t <= 59; t++)
                h = l[t - 3] ^ l[t - 8] ^ l[t - 14] ^ l[t - 16],
                h = (e << 5 | e >>> 27) + (s & r | s & i | r & i) + n + (h = l[t] = h << 1 | h >>> 31) + 2400959708 & 4294967295,
                n = i,
                i = r,
                r = s << 30 | s >>> 2,
                s = e,
                e = h;
            for (t = 60; t <= 79; t++)
                h = l[t - 3] ^ l[t - 8] ^ l[t - 14] ^ l[t - 16],
                h = (e << 5 | e >>> 27) + (s ^ r ^ i) + n + (h = l[t] = h << 1 | h >>> 31) + 3395469782 & 4294967295,
                n = i,
                i = r,
                r = s << 30 | s >>> 2,
                s = e,
                e = h;
            this.D0 = u + e & 4294967295,
            this.D1 = o + s & 4294967295,
            this.D2 = f + r & 4294967295,
            this.D3 = a + i & 4294967295,
            this.D4 = d + n & 4294967295,
            this.totalLen += this.bufLen
        }
        endUpdate() {
            if (this.ended)
                return;
            this.bufIndex === this.bufLen && (this.processBuffer(),
            this.bufIndex = 0);
            let t = this.bufIndex;
            this.totalLen += t;
            let e = this.totalLen
              , r = this.buf8;
            if (r[t++] = 128,
            t > 56) {
                for (; t < 64; )
                    r[t++] = 0;
                this.processBuffer(),
                t = this.bufIndex = 0
            }
            for (; 56 !== t; )
                r[t++] = 0;
            let i = e >>> 29;
            r[t++] = i >> 24 & 255,
            r[t++] = i >> 16 & 255,
            r[t++] = i >> 8 & 255,
            r[t++] = 255 & i,
            i = e << 3 & 4294967295,
            r[t++] = i >> 24 & 255,
            r[t++] = i >> 16 & 255,
            r[t++] = i >> 8 & 255,
            r[t++] = 255 & i,
            this.processBuffer(),
            this.bufIndex = 0,
            this.ended = !0;
            let n = this.digest8;
            s(this.D0, n, 0),
            s(this.D1, n, 4),
            s(this.D2, n, 8),
            s(this.D3, n, 12),
            s(this.D4, n, 16)
        }
        digest() {
            return this.endUpdate(),
            this.digest8
        }
        toHex() {
            if (null === this.hexHashStr) {
                this.endUpdate();
                let t = this.hexcds || (this.hexcds = new Uint8Array(40))
                  , e = this.digest8;
                for (let s = 0, r = e.length; s < r; s++) {
                    let r = e[s]
                      , i = r >>> 4 & 15;
                    t[2 * s] = (i < 10 ? 48 : 87) + i,
                    i = 15 & r,
                    t[2 * s + 1] = (i < 10 ? 48 : 87) + i
                }
                return this.hexHashStr = String.fromCharCode.apply(null, t)
            }
        }
        getAlgorithm() {
            return "sha1"
        }
    }
    function s(t, e, s) {
        for (let r = 3; r >= 0; r--)
            e[s + 3 - r] = t >>> 8 * r & 255
    }
    let r;
    e.MessageDigestSHA1 = MessageDigestSHA1,
    e.sha1 = function(t) {
        let e = r || (r = new MessageDigestSHA1);
        return e.reset(),
        e.updateString(t),
        e.toHex()
    }
    ,
    e.sha1_json = function(t, e=!1) {
        let s = r || (r = new MessageDigestSHA1);
        return s.reset(),
        s.updateObject(t, e),
        s.toHex()
    }
    ,
    e.sha1_base64 = function(t, e=!1) {
        let s = r || (r = new MessageDigestSHA1);
        return s.reset(),
        s.updateObject(t, e),
        s.toBase64()
    }
    ,
    e.genkey = function(t, e=!1) {
        let s = r || (r = new MessageDigestSHA1);
        return s.reset(),
        s.updateObject(t, e),
        s.toShortKey()
    }
});

var __createBinding = this && this.__createBinding || (Object.create ? function(e, t, n, r) {
    void 0 === r && (r = n),
    Object.defineProperty(e, r, {
        enumerable: !0,
        get: function() {
            return t[n]
        }
    })
}
: function(e, t, n, r) {
    void 0 === r && (r = n),
    e[r] = t[n]
}
)
  , __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function(e, t) {
    Object.defineProperty(e, "default", {
        enumerable: !0,
        value: t
    })
}
: function(e, t) {
    e.default = t
}
)
  , __importStar = this && this.__importStar || function(e) {
    if (e && e.__esModule)
        return e;
    var t = {};
    if (null != e)
        for (var n in e)
            "default" !== n && Object.hasOwnProperty.call(e, n) && __createBinding(t, e, n);
    return __setModuleDefault(t, e),
    t
}
;
define("sys/sys", ["require", "exports", "sys/sys-polyfill", "sys/kvparser", "sys/lz-string"], function(e, t, n, r, o) {
    "use strict";
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.loadWXJSSDK = t.getWechatJSSDKConfigInfo = t.isCrossDomainUrl = t.prefixCdnDomain = t.gotoLoginPage = t.gotoHome = t.quoteExpField = t.getEffectStyleName = t.parseConditionStyleRange = t.getTestCaseSheetResult = t.normalizeTestStyleInfo = t.normalizeTestStyleProperty = t.deleteCssRules = t.THEME_STYLE_SELECTOR_CONCAT_CHAR = t.ajaxUploadFile = t.uploadFile = t.blobToBase64 = t.getFullUrl = t.hasHostname = t.parseJSON = t.getErrorDetail = t.makeDialogStyleRules = t.isUnicode = t.maskString = t.makeMenuStyleRules = t.calcStringMatching = t.renderString = t.isHTMLString = t.isJsonString = t.getCalendarData = t.parseHTMLLength = t.isElementFocused = t.isElementEditable = t.createImageDescPlaceholder = t.FontDataProvider = t.getFontFamilyDataProvider = t.deleteConsoleLevel = t.setConsoleLevel = t.showNoPermissionPage = t.enhanceHtml2canvas = t.MobileScrollFix = t.MOBILE_FLOAT_COUNT = t.getAllShortUrlInfos = t.resolveShortUrl = t.getShortUrlParamNames = t.HistoryRouter = t.getCurrentPortal = t.getCurrentMobileApp = t.showSignPanel = t.showMobileSelectPanel = t.isCtrlKey = t.getMarked = t.findChildNode = t.getClipBoardData = t.createClipBoardDataDom = t.applyMixins = t.getFileType = t.CaseInsensitiveMap = t.getParentDir = t.getBaseName = t.resolvePath = t.resolvePathOrUrl = t.resolvePathToUrl = t.relativePath = t.disposeAnimationEffect = t.resizeAnimationEffect = t.setAnimationEffect = t.updateCssRule = t.renderDomWatermark = t.setAlignStyle = t.setMarginStyle = t.setTextShadowStyle = t.setShadowStyle = t.setBorderRadiusStyle = t.setPaddingStyle = t.setFontStyle = t.setBorderStyle = t.getBorderCssValue = t.setIconStyle = t.setFillStyle = t.setColorStyle = t.setCssFilterStyle = t.getColorType = t.getDefaultStyleConvertor = t.SysDefaultStyleConvertor = t.THEME_COLOR_NAMES = t.MAIN_THEME_GRADIENTCOLORS = t.MAIN_THEME_COLORS = t.getThemeColor = t.getQuillHtmlSync = t.getQuillHtml = t.hex2Dec = t.rgba2color = t.parseRgba = t.color2Rgba = t.darken = t.lighten = t.dec2Hex = t.isRgb = t.isRgba = t.isColor = t.UndoManager = t.getFriendlyDuration = t.getFriendlyDateExpire = t.formatDateFriendly = t.formatDate = t.getAbsoluteText = t.makeRelativeText = t.getRelativeText = t.getTimeText = t.isRelativeDate = t.parseAnchorDate = t.parseStringToDate = t.ANCHORS = t.MEASURESMAP = t.getLunarDay = t.getTendays = t.getHalfyear = t.getQuarter = t.getWeekStartDate = t.getWeekNum = t.isPrevMonthWeek = t.getWeekIndex = t.getWeekMonth = t.parseDate = t._parseStrDate = t.parseStrDate = t.mixin = t.hideWaiting = t.showWaiting = t.waitingContext = t.cancelWaitingIcon = t.showWaitingIcon = t.waitingIcons = t.getImplClass = t.createZIndex = t.forbidSelectAndDrag = t.returnFalse = t.setInputCursor = t.getHtmlText = t.getSzDataFromClipboard = t.getTextFromClipboard = t.getHtmlFromClipboard = t.copyToClipboard = t.setSelection = t.getCopyDom = t.getColNameByIndex = t.getColIndexByName = t.getCellName = t.getCellRowColByName = t.parseFloatDef = t.decodeBase64 = t.encodeBase64 = t.css = t.makeBoxShadowStyleRules = t.makeBorderRadiusStyleRules = t.makeBorderStyleRules = t.setGlobalColorTheme = t.getCustomStyleManager = t.CustomStyleManager = t.getSelectText = t.selectDomText = t.getSizeStyle = t.clearDelayOnceTimer = t.formatSize = t.compareStr = t.execScript = t.arraysEqual = t.deepEqual = t.isEmpty = t.inferDateFormat = t.isNumeric = t.downloadFileInBrowser = t.downloadFile = t.xml = t.addUrlParameters = t.addUrlParameter = t.setUrlParameter = t.getUrlParameter = t.wildcard2Regex = t.formatHtml = t.uuidBase64 = t.uuid = t.parseUrl = t.encodeUrlInfo = t.getUrlParameters = t.getUrl = t.getUrlPath = t.parseBool = t.showNetworkOrScriptError = t.importWithLogin = t.REQUIREJS_PATHCONFIG = t.isPlainObject = t.deepAssign = t.deleteUndefined = t.clone = t.assign = t.getJsonConf = t.rc_task = t.ServiceTaskPromise = t.awaitRemoteSignal = t.cancelTimerv = t.timerv = t.rc1 = t.rc_get = t.rc = t.wget = t.waitAjax = t.abortAllAjax = t.ajax = t.encodeURIJSON = t.getCookie = t.printPendingXHRs = t.ajaxCfg = t.parseError = t.showErrorPage = t.showError = t.alertError = t.throwInfo = t.throwWarning = t.throwError = t.subMessages = t.message = t.setI18nMessages = t.loadCustomI18nMessage = t.loadI18nMessages = t.LOCALEMSG = t.setLocale = t.getMetaSettingInfo = t.getProductInfo = t.getProductVersion = t.getWarBuildnum = t.isProductEnv = t.ctxIf = t.cssimg = t.ctximg = t.ctx = t.getMetaValue = t.waitIframeRender = t.tryWait = t.waitAnimationFrame = t.waitRender = t.wait = t.isDomReady = t.isInt = t.printAnimationFramePendingInfo = t.cancelAnimationFrame = t.requestAnimationFrame = t.animationFramePendingInfo = t.animationFramePending = t.resetSysBrowserInfo = t.mockMobilePad = t.mockMobilePhone = t.isES5Browser = t.browser = t.parseUserAgent = t.getLang = t.setIcon = t.showMobileMessage = t.showSuccessMessage = t.showErrorMessage = t.showWarningMessage = t.showWaitingMessage = t.hideMessage = t.showMessage = t.showProgressDialog = t.showMessageBox = t.getLastMessageBoxShowTime = t.waitAnimations = t.waitAnimation = t.showListDialog = t.showTreeDialog = t.showShareDialog = t.showMobileInfoDialog = t.showMobileConfirmDialog = t.showInfoDialog = t.showAlertDialog = t.showInputDialog = t.showConfirmDialog = t.showToolTip = t.showManual = t.showErrorCodeManual = t.disposeMenu = t.showMenu = t.showDialog = t.onNeedLoginError = t.handle401 = t.showFormDialog = t.disposeComponents = t.EventListenerManager = t.Drag = t.getDragSZObjectFromEvent = t.getSZObjectFromEvent = t.getSZObjectFromDom = t.traverseChildElements = t.ComponentItem = t.getScrollBarHeight = t.getScrollBarWidth = t.getScrollBarSize = t.isDomVisible = t.dispatchResizeEvent = t.getWindowId = t.getBrowserLanguage = t.isBrowserLanguageZh_cn = t.refreshHTMLI18N = t.ready = t.domReady = t.MacScrollBar = t.ContainerComponent = t.Component = t.validateInputComponent = t.SZClipboard = t.DROPACTION = t.dragContext = t.getDragCursor = t.getDragSignDom = t.getDragItemDom = t.getWheelDeltaPixel = t.stopSmoothScroll = t.scrollRectIntoView = t.smoothScroll = t.isLogEnabled = t.enableDebugDispose = t.COMPONENTS_ALIVE = t.COMPONENTS_COUNT_DISPOSED = t.COMPONENTS_COUNT_CREATED = t.DEBUG_DISPOSE = t.PREVIEW_DELAY = t.szArrowMap = t.DEF_ITEM_DATA_CONF = t.LZString = void 0,
    Object.defineProperty(t, "browser", {
        enumerable: !0,
        get: function() {
            return n.browser
        }
    }),
    Object.defineProperty(t, "parseUserAgent", {
        enumerable: !0,
        get: function() {
            return n.parseUserAgent
        }
    }),
    Object.defineProperty(t, "LZString", {
        enumerable: !0,
        get: function() {
            return o.LZString
        }
    }),
    t.DEF_ITEM_DATA_CONF = {
        idField: "id",
        visibleField: "visible",
        disabledField: "disabled",
        valueField: "value",
        captionField: "caption",
        htmlField: "html",
        descField: "desc",
        iconField: "icon",
        iconFamilyField: "fontFamily",
        checkedField: "checked",
        selectedField: "selected",
        childrenField: "items",
        isLeafField: "leaf",
        hasChildrenField: "parent",
        classNameField: "className",
        groupIDField: "groupId",
        titleField: "title",
        imageField: "image",
        decorateIconField: "decorateIcon",
        decorateIconDescField: "decorateIconDesc",
        dataCountField: "dataCount",
        descsField: "descs"
    };
    const s = []
      , i = window.SZ || (window.SZ = {});
    i.rc = ye,
    i.rc_get = be,
    i.ajax = fe,
    i.encodeBase64 = Ge,
    i.decodeBase64 = Je,
    t.szArrowMap = new Map;
    let l, a, c, d = [];
    t.PREVIEW_DELAY = 200;
    t.DEBUG_DISPOSE = !n.browser.nodejs && window.location.pathname.endsWith(".qunit") && "false" !== window.localStorage.getItem("sz-qunit-cfg-debugdispose"),
    t.COMPONENTS_COUNT_CREATED = 0,
    t.COMPONENTS_COUNT_DISPOSED = 0,
    t.DEBUG_DISPOSE && (t.COMPONENTS_ALIVE = new Map,
    window.self === window.top && !window.location.pathname.endsWith(".qunit") && alert("WARNING: DEBUG_DISPOSE ENABLED!!")),
    t.enableDebugDispose = function(e=!0) {
        t.DEBUG_DISPOSE = e,
        e ? (t.COMPONENTS_COUNT_CREATED = 0,
        t.COMPONENTS_COUNT_DISPOSED = 0,
        t.COMPONENTS_ALIVE = new Map) : t.COMPONENTS_ALIVE = null
    }
    ;
    let u = !n.browser.nodejs && Fe(":log") || !1;
    function h(e) {
        const t = e.domScrollContainer
          , n = t;
        if (!t)
            return Promise.resolve();
        let r = e.scrollLeft || 0
          , o = e.scrollTop || 0
          , s = Math.abs(r)
          , i = Math.abs(o);
        if (null != n.scrollAnimationFrameId && (n.scrollAnimationFrameId = void 0),
        !s && !i)
            return Promise.resolve();
        let l = t.scrollLeft
          , a = t.scrollTop
          , c = e.animationTime || 100
          , d = e.onscroll
          , u = null;
        return new Promise(e=>{
            let h = m=>{
                if (null == n.scrollAnimationFrameId)
                    return e();
                null == u && (u = m);
                let g = Math.min(m - u, c)
                  , p = g * s / c
                  , f = g * i / c;
                r && (t.scrollLeft = r < 0 ? l - p < 0 ? 0 : l - p : l + p),
                o && (t.scrollTop = o < 0 ? a - f < 0 ? 0 : a - f : a + f),
                d && d(t, g, c),
                g < c ? n.scrollAnimationFrameId = B(h) : (n.scrollAnimationFrameId = void 0,
                e())
            }
            ;
            n.scrollAnimationFrameId = B(h)
        }
        )
    }
    function m(e) {
        const t = e.deltaMode;
        let[n,r] = [e.deltaX, e.deltaY];
        if (t !== WheelEvent.DOM_DELTA_PIXEL) {
            const o = e.target;
            let s;
            t === WheelEvent.DOM_DELTA_LINE ? s = 100 / 3 * window.devicePixelRatio : t === WheelEvent.DOM_DELTA_PAGE && (s = o && o.offsetHeight),
            s && (n *= s,
            r *= s)
        }
        return {
            deltaX: n,
            deltaY: r
        }
    }
    function g(e) {
        return e ? `sz-dragcursor-${n.browser.mac ? "mac" : "win"}-${e}` : ""
    }
    "string" == typeof u && (u = "true" === u || u.split(",")),
    t.isLogEnabled = function(e) {
        return null == e ? !!u : "boolean" == typeof u ? u : Array.isArray(u) ? null != u.find(t=>t === e) : u === e
    }
    ,
    t.smoothScroll = h,
    t.scrollRectIntoView = function(e) {
        const t = e.domScrollContainer
          , n = !1 !== (null == e ? void 0 : e.scrollIntoCenter)
          , r = !1 === (null == e ? void 0 : e.scrollIfNeeded)
          , o = e.rect
          , s = o.top
          , i = void 0 === o.height ? o.bottom : o.top + o.height
          , l = i - s
          , a = t.heightNoPadding
          , c = t.scrollTop
          , d = a + c;
        let u, m;
        return n ? (r || s < c || i > d) && (u = s - (a - l) / 2) : r ? u = s : s < c ? u = s : i > d && (u = i - a),
        void 0 !== u && ((null == e ? void 0 : e.smoothScroll) ? m = h({
            domScrollContainer: t,
            scrollTop: u - c,
            animationTime: e.smoothScrollTime || 100
        }) : t.scrollTop = u),
        m || Promise.resolve()
    }
    ,
    t.stopSmoothScroll = function(e) {
        return h({
            domScrollContainer: e
        })
    }
    ,
    t.getWheelDeltaPixel = m,
    t.getDragItemDom = function(e) {
        const t = document;
        a || (a = t.createElement("div")),
        a.className = "sz-dragitem",
        a.style.display = "",
        a.removeAllChildren(),
        a.style.zIndex = ht() + 1e3;
        let n = e.className;
        n && a.classList.add(e.className),
        e.colorTheme && a.classList.add(e.colorTheme);
        let r = a
          , o = e.count || 1;
        if (o > 1) {
            (r = a.appendChild(t.createElement("div"))).className = "sz-dragitem-innerpdom";
            let e = r.appendChild(t.createElement("div"));
            e.className = "sz-dragitem-multiple",
            e.textContent = o > 99 ? "99+" : o.toString(),
            n && (r.classList.add(n),
            e.classList.add(n))
        }
        let s = e.content;
        if (null == s && (s = ""),
        s instanceof HTMLElement)
            r.appendChild(s);
        else if ("string" == typeof s)
            if (!e.isHtml && s && s.indexOf("/") >= 0)
                ;
            else if (!1 !== e.showIcon) {
                let n = r.appendChild(t.createElement("span"));
                n.className = "sz-dragitem-icon";
                let o = r.appendChild(t.createElement("span"));
                o.className = "sz-dragitem-text",
                F(n, e.icon),
                e.isHtml ? o.innerHTML = s : o.textContent = s
            } else
                e.isHtml ? r.innerHTML = s : r.textContent = s,
                r.classList.add("sz-dragitem-text");
        return a.parentNode != t.body && t.body.appendChild(a),
        a
    }
    ,
    t.getDragSignDom = function(e, t) {
        const n = document;
        return c || (c = n.createElement("div")),
        c.style.zIndex = ht(),
        c.className = "sz-dragline",
        c.style.width = "",
        c.style.height = "",
        e && c.classList.add(e),
        t && c.classList.add(t),
        c
    }
    ,
    t.getDragCursor = g,
    t.dragContext = {
        draging: !1,
        srcComponent: null,
        dataTransfer: null,
        dataTransferKind: null,
        srcDom: null,
        domTop: null,
        domLeft: null,
        clientX: null,
        clientY: null,
        mousedownEvent: null,
        mousemoveEvent: null,
        domOver: null,
        szobjectOver: null,
        domFeedback: null,
        cursor: null
    },
    t.DROPACTION = {
        APPENDCHILD: "appendChild",
        INSERTBEFORE: "insertBefore",
        INSERTAFTER: "insertAfter",
        REPLACE: "replace",
        DISABLED: !1
    };
    t.SZClipboard = class SZClipboard {
        constructor(e) {
            this.dataProvider = e.dataProvider;
            let t = this.domKeyEventListener = e.domKeyEventListener;
            this.handler_copy = this.doCopy.bind(this, !1),
            this.handler_cut = this.doCopy.bind(this, !0),
            this.handler_paste = this.doPaste.bind(this),
            t.addEventListener("copy", this.handler_copy),
            t.addEventListener("cut", this.handler_cut),
            t.addEventListener("paste", this.handler_paste)
        }
        dispose() {
            let e = this.domKeyEventListener;
            e && (e.removeEventListener("copy", this.handler_copy),
            e.removeEventListener("cut", this.handler_cut),
            e.removeEventListener("paste", this.handler_paste)),
            this.domKeyEventListener = null
        }
        doCopy(e, t) {
            let n = this.dataProvider.getCopyData(t, e);
            !0 !== n && (!1 === n ? (t.stopPropagation(),
            t.preventDefault()) : (lt({
                target: n,
                event: t,
                isRestore: !1,
                isCut: e
            }),
            t.stopPropagation(),
            t.preventDefault()))
        }
        doPaste(e) {
            !0 !== this.dataProvider.doPasteData(e) && (e.stopPropagation(),
            e.preventDefault())
        }
    }
    ,
    t.validateInputComponent = function(e) {
        const t = e.value
          , n = !!e.required
          , r = e.validateRegexpOrFunc;
        let o = void 0
          , s = !0
          , i = ze(t);
        if (n && i)
            s = !1,
            o = null != e.emptyErrorMessage ? e.emptyErrorMessage || "" : ie("sys.validateInputComponent.emptyerror");
        else if (!i) {
            if ("string" == typeof r || r instanceof RegExp)
                s = new RegExp(r).test(t);
            else if (null != r) {
                let e = r(t);
                "boolean" == typeof e ? s = e : null != e && (s = e.result,
                o = e.errorMessage)
            }
            s || o || (o = e.errorMessage || "")
        }
        return {
            result: s,
            errorMessage: o
        }
    }
    ;
    class Component {
        constructor(e={}) {
            if (t.DEBUG_DISPOSE) {
                !1 === e.traceDispose && (this.__component_trace_dispose = !1),
                this.__component_create_stacktrace = new Error("need dispose").stack;
                let n = this.__component_sn = t.COMPONENTS_COUNT_CREATED++;
                t.COMPONENTS_ALIVE.set(n, this)
            }
            this._init_default(e),
            this._init(e),
            this._init_data(e);
            let n = this.domParent || e.domParent;
            n && this.setDomParent(n)
        }
        _init_default(e) {
            this.domBase = null,
            this.domParent = null,
            this.id = void 0 !== e.id ? e.id : null,
            this.domBaseClassName = this.constructor.name.toLowerCase() + "-base",
            this.visible = void 0 === e.visible || e.visible,
            this.enabled = void 0 === e.enabled || e.enabled,
            this.baseFloating = !!e.baseFloating,
            this.onshow = e.onshow || null,
            this.onhide = e.onhide || null,
            this.layoutTheme = e.layoutTheme || "",
            this.colorTheme = e.colorTheme || "",
            this.customStyle = e.customStyle ? e.customStyle.slice() : [],
            this.keyPrefix = e.keyPrefix || null,
            this.wantTab = !!e.wantTab,
            this.className = e.className
        }
        _init(e) {
            return this._createDomBase(e)
        }
        dispose() {
            let e = this.domBase;
            if (e) {
                if (t.DEBUG_DISPOSE) {
                    t.COMPONENTS_COUNT_DISPOSED++;
                    let e = this.__component_sn;
                    e && t.COMPONENTS_ALIVE.delete(e)
                }
                this.wantTab && document.activeElement === e && this.setDomParentFocus(e),
                this.domBase = null,
                e.szobject = null,
                e.remove()
            }
            for (let t in this)
                this.hasOwnProperty(t) && (this[t] = null)
        }
        isDisposed() {
            return !this.domBase
        }
        _init_data(e) {}
        _createDomBase(e, t="div") {
            let r = e.domBase;
            r ? (this.domBase = r,
            this.domParent = r.parentNode || null) : (r = this.domBase = document.createElement(t || "div"),
            n.browser.mobile && r.classList.add("mobile")),
            r.szobject = this,
            this.id && !e.dontSetDomId && (r.id = this.id);
            let o = r.classList;
            o.add(this.domBaseClassName),
            this.layoutTheme && o.add(this.layoutTheme);
            const s = this.colorTheme;
            Ze().createColorThemeStyle(s, this.constructor),
            s && o.add(s);
            let i, l = this.customStyle;
            return l && l.length && (i = Ze()) && l.forEach(e=>{
                o.add(e),
                i.createComponentStyle(this.constructor, e)
            }
            ),
            this.doResize && o.add("want-resizeevent"),
            e.className && o.add(e.className),
            e.cssText && (r.style.cssText = e.cssText),
            !this.visible && (r.style.display = "none"),
            this.enabled ? this.wantTab && (r.tabIndex = 0) : (r.setAttribute("disabled", "true"),
            r.classList.add("sz-disabled")),
            r
        }
        isSupportReInit() {
            return this.constructor.prototype.hasOwnProperty("_reInit")
        }
        setDomParentFocus(e) {
            let t = v(e.parentNode, (e,t)=>{
                return t.wantTab && e.tabIndex > -1
            }
            );
            t && t.getDomBase().focus()
        }
        setDomParent(e, t) {
            let n = this.domBase;
            this.domParent = e,
            n && (e ? (n.parentNode !== e || t && t.previousSibling !== n || !t && n.nextSibling) && (t ? e.insertBefore(n, t) : e.appendChild(n),
            this.requestDoResize()) : n.remove())
        }
        requestDoResize(e=!1) {
            this.visible && t.dispatchResizeEvent(this.domBase, e)
        }
        getDomParent() {
            return this.domParent
        }
        getParentComponent() {
            let e = this.domBase;
            return e && e.parentElement && e.parentElement.szobject || null
        }
        getDomBase() {
            return this.domBase
        }
        focus() {
            this.domBase && this.domBase.focus()
        }
        safeFocus() {
            let e = this.domBase;
            if (e)
                if (e.offsetParent)
                    try {
                        this.focus()
                    } catch (t) {
                        console.log(t)
                    }
                else
                    V().then(()=>{
                        this.domBase && this.domBase.offsetParent && this.focus()
                    }
                    ).catch(e=>{
                        console.log(e)
                    }
                    )
        }
        setVisible(e) {
            this.setDisplay(e)
        }
        isVisible() {
            return this.visible
        }
        setDisplay(e) {
            if (e = !!e,
            this.visible !== e) {
                let t = e ? this.onshow : this.onhide;
                if (!1 === (t && t({
                    component: this
                }, this)))
                    return;
                this.visible = e;
                let n = this.domBase;
                if (n)
                    if (e) {
                        this.doBeforeShow && this.doBeforeShow();
                        let e = n.sz_odisplay;
                        n.style.display = void 0 !== e && "none" !== e ? e : "",
                        this.incZIndex(),
                        this.requestDoResize()
                    } else
                        this.doBeforeHide && this.doBeforeHide(),
                        n.sz_odisplay = n.style.display,
                        n.style.display = "none",
                        this.wantTab && document.activeElement === n && this.setDomParentFocus(n)
            }
        }
        isDisplay() {
            return !(!this.domParent || !this.isVisible()) && (this.domBase && S(this.domBase))
        }
        setVisibility(e) {
            if (e = !!e,
            this.visible !== e) {
                let t = e ? this.onshow : this.onhide;
                t && t({
                    component: this
                }, this),
                this.visible = e;
                let n = this.domBase;
                if (n) {
                    let t = n.style;
                    t.visibility = e ? "visible" : "hidden",
                    e ? "none" === t.display && (t.display = "") : (t.left = "-9999px",
                    t.top = "-9999px"),
                    e && this.incZIndex()
                }
            }
        }
        incZIndex() {
            this.baseFloating && (this.domBase.style.zIndex = ht())
        }
        setEnabled(e) {
            if (e = !!e,
            this.enabled !== e) {
                this.enabled = e;
                let t = this.domBase;
                t && (e ? (t.removeAttribute("disabled"),
                t.classList.remove("sz-disabled"),
                this.wantTab && t.setAttribute("tabindex", "0")) : (t.setAttribute("disabled", "true"),
                t.classList.add("sz-disabled"),
                this.wantTab && document.activeElement === t && this.setDomParentFocus(t),
                this.wantTab && t.removeAttribute("tabindex")))
            }
        }
        isEnabled() {
            return this.enabled
        }
        static makeStyleRules(e, t, n) {
            return null
        }
        traverseChildComponents(e, t, n=this.domBase) {
            if (n && 1 === n.nodeType && n.hasChildNodes()) {
                let r = n.childNodes;
                if (r && r.length)
                    for (let n = 0, o = r.length; n < o; n++) {
                        let o = r[n];
                        if (1 === o.nodeType) {
                            let n = o.szobject;
                            n && n instanceof Component ? !1 !== e(n) && t && n.traverseChildComponents(e, t) : this.traverseChildComponents(e, t, o)
                        }
                    }
            }
        }
        getLayoutTheme() {
            return this.layoutTheme
        }
        setLayoutTheme(e, t=!1) {
            let n = this.layoutTheme;
            if (e !== this.layoutTheme) {
                let r = this.domBase;
                if (r) {
                    let o = r.classList;
                    n && o.remove(n),
                    e && o.add(e),
                    t && this.traverseChildComponents(n=>n.setLayoutTheme(e, t))
                }
                this.layoutTheme = e
            }
        }
        setColorTheme(e) {
            const t = this.colorTheme;
            if (t !== e) {
                const n = this.domBase;
                this.colorTheme = e;
                let r = Ze();
                if (r.createColorThemeStyle(e, this.constructor),
                n) {
                    if (e && this.id) {
                        let t = r.getColorThemeInfo(e)
                          , n = t && t[this.id];
                        n && n.layoutTheme && this.setLayoutTheme(n.layoutTheme)
                    }
                    t && n.classList.remove(t),
                    e && n.classList.add(e),
                    this.traverseChildComponents(t=>t.setColorTheme(e))
                }
            }
        }
        setCustomStyle(e, t, n=!1) {
            let r = this.customStyle
              , o = "string" == typeof e ? [e] : xe(e);
            r && r.length && r.forEach(e=>{
                o && o.includes(e) ? o.remove(e) : this.removeCustomStyle(e, n)
            }
            ),
            o && o.length && o.forEach(e=>{
                this.addCustomStyle(e, t, n)
            }
            )
        }
        getDropdownCustomStyle(e) {
            const t = Ze()
              , n = t.getCompStyleInfoMap(null, this.constructor.name);
            return (e instanceof Array ? e : null == e ? [] : [e]).map(e=>{
                if (!e)
                    return;
                const r = n.get(e);
                let o = {}
                  , s = !1;
                e += "-dropdown";
                for (const t in r) {
                    const e = r[t];
                    e instanceof Object && e.fontSize && (o[t] = {
                        fontSize: e.fontSize
                    },
                    s = !0)
                }
                return s && t.createComponentStyle(this.constructor, e, o),
                e
            }
            )
        }
        addCustomStyle(e, t, n=!1) {
            let r = this.customStyle;
            if (!r.includes(e)) {
                let o = this.domBase;
                if (o) {
                    let r = o.classList;
                    e && r.add(e),
                    n && this.traverseChildComponents(r=>r.addCustomStyle(e, t, n))
                }
                r.push(e)
            }
            if (t = !!t) {
                Ze().createComponentStyle(this.constructor, e)
            }
        }
        replaceCustomStyle(e, t, n, r=!1) {
            t && e !== t && (this.addCustomStyle(t, n, r),
            this.removeCustomStyle(e, r))
        }
        removeCustomStyle(e, t=!1) {
            let n = this.customStyle;
            if (e && n.includes(e)) {
                let r = this.domBase;
                if (r) {
                    r.classList.remove(e),
                    t && this.traverseChildComponents(n=>n.removeCustomStyle(e, t))
                }
                n.remove(e)
            }
        }
        setClassName(e) {
            if (!this.domBase)
                return;
            if (e === this.className || e === this.layoutTheme && e)
                return;
            let t = this.domBase.classList;
            this.className ? e ? t.replace(this.className, e) : t.remove(this.className) : e && t.add(e),
            this.className = e
        }
        showFloat(e) {
            const n = e.limitInWidow || "unlimited";
            let r = e.direction || "bottom"
              , o = !1;
            if (this.domBase.parentNode && this.isVisible()) {
                if (e.toggleVisible)
                    return Promise.resolve(this.hideFloat());
                "limitSize" === n && this.floatShowDirection && (o = !0,
                r = this.floatShowDirection)
            }
            let i = document.body;
            if (void 0 === e.autoHide || !!e.autoHide) {
                if (0 === s.length) {
                    let e = t=>{
                        let n = t.type
                          , r = t.target || t.srcElement;
                        if ("keydown" !== n || 27 === t.keyCode) {
                            if ("mousedown" === n || "scroll" === n) {
                                let e = [];
                                for (; s.length; ) {
                                    let o = s.pop()
                                      , i = o.floatShowAnchor
                                      , l = i instanceof Element && i
                                      , a = i instanceof Event ? i.target : i
                                      , c = e=>{
                                        if ("mousedown" !== n)
                                            return !1;
                                        let t = r.closest(".dialog-disablepanel");
                                        if (!t) {
                                            let e = v(r, (e,t)=>t.baseFloating);
                                            e && (t = e.domBase)
                                        }
                                        return e && t && parseInt(t.style.zIndex) > parseInt(e.style.zIndex)
                                    }
                                    ;
                                    if (o && c(o.domBase))
                                        return s.push(o),
                                        !1;
                                    if (!o || "mousedown" !== n || o.domBase && o.domBase.contains(r) || delete o.domFocusBeforeShowFloat,
                                    o && "mousedown" === n && (o.domBase && o.domBase.contains(r) || l && l.contains(r)))
                                        return s.pushAll(e),
                                        s.push(o),
                                        !1;
                                    if (o && "scroll" === n && (o.domBase && o.domBase.contains(r) || !a || !r.contains(a)))
                                        return s.pushAll(e),
                                        s.push(o),
                                        !1;
                                    o && !o.hideFloat(t) && o.isVisible() && e.push(o)
                                }
                                s.pushAll(e)
                            } else {
                                let e = s.pop();
                                for (; (!e || !e.isVisible()) && s.length; )
                                    e = s.pop();
                                if (e) {
                                    !e.hideFloat(t) && e.isVisible() ? s.push(e) : (t.preventDefault(),
                                    t.stopPropagation(),
                                    t.stopImmediatePropagation())
                                }
                            }
                            0 === s.length && (i.removeEventListener("keydown", e, !0),
                            i.removeEventListener("mousedown", e, !0),
                            document.removeEventListener("scroll", e, !0))
                        }
                    }
                    ;
                    i.addEventListener("keydown", e, !0),
                    i.addEventListener("mousedown", e, !0),
                    document.addEventListener("scroll", e, !0)
                }
                s.push(this)
            }
            this.domFocusBeforeShowFloat = (void 0 === e.autoRestoreFocus || e.autoRestoreFocus) && document.activeElement,
            this.baseFloating = !0;
            let l = e.showAt
              , a = this.domBase
              , c = a.style;
            o || "limitSize" !== n || (c.maxWidth = "",
            c.maxHeight = ""),
            "absolute" !== c.position && "absolute" !== getComputedStyle(a).position && (c.position = "absolute"),
            void 0 === a.oldVisibility && (a.oldVisibility = c.visibility);
            let u = this.isVisible();
            u && a.parentNode || (c.left = c.top = "-9999px",
            c.right = c.bottom = "",
            c.visibility = "hidden"),
            a.parentNode || this.setDomParent(i);
            let h = a.classList;
            h.contains("sz-basefloat") || h.add("sz-basefloat"),
            this.setVisible(!0),
            "" === c.zIndex && this.incZIndex();
            let m, g, f = ()=>{
                let t;
                if (l)
                    if (l instanceof Component && (l = l.getDomBase()),
                    l instanceof Element) {
                        let n = l.classList;
                        this.floatShowAnchor = l,
                        !1 === e.addShowAtActiveClass || n.contains("sz-showat-active") || n.add("sz-showat-active");
                        let r = l.getBoundingClientRect();
                        t = {
                            tTop: r.top,
                            bTop: r.bottom,
                            lLeft: r.left,
                            rLeft: r.right
                        }
                    } else if (l instanceof Event) {
                        let e = l.pageY
                          , n = l.pageX;
                        this.floatShowAnchor = l,
                        t = {
                            tTop: e,
                            lLeft: n,
                            bTop: e,
                            rLeft: n
                        }
                    } else
                        t = {
                            tTop: l.top,
                            bTop: l.bottom,
                            lLeft: l.left,
                            rLeft: l.right
                        };
                else {
                    let n = e.bounds
                      , r = n.left;
                    null == r && (r = m - n.right);
                    let o = n.top;
                    null == o && (o = g - n.bottom),
                    t = {
                        lLeft: r,
                        rLeft: r,
                        tTop: o,
                        bTop: o
                    }
                }
                let n = e.offsetX;
                n && (t.lLeft += n,
                t.rLeft += n);
                let r = e.offsetY;
                return r && (t.tTop += r,
                t.bTop += r),
                t
            }
            , y = ()=>{
                m = document.documentElement.clientWidth,
                g = document.documentElement.clientHeight,
                o && "limitSize" === n && (c.maxWidth = "",
                c.maxHeight = "");
                let s, l, h, y = f(), b = document.documentElement.scrollLeft, w = document.documentElement.scrollTop, S = a.offsetWidth, C = a.offsetHeight, v = null, x = null, E = null, M = null, T = e.showArrow, D = void 0 === e.crossXY || !!e.crossXY, P = T ? 18 : 0, I = T ? 9 : 0, _ = e=>{
                    if (!o && !e && k.push(g - y.bTop),
                    e || g - y.bTop >= C + I + 10)
                        return r = "bottom",
                        E = y.bTop + I,
                        !0
                }
                , $ = e=>{
                    if (!o && !e && k.push(y.tTop),
                    e || y.tTop >= C + I + 10)
                        return r = "top",
                        M = g - y.tTop + I,
                        !0
                }
                , L = e=>{
                    if (!o && !e && k.push(m - y.rLeft),
                    e || m - y.rLeft >= S + I + 10)
                        return r = "right",
                        v = y.rLeft + I,
                        !0
                }
                , A = e=>{
                    if (!o && !e && k.push(y.lLeft),
                    e || y.lLeft >= S + I + 10)
                        return r = "left",
                        x = m - y.lLeft + I,
                        !0
                }
                , k = [];
                switch (r) {
                default:
                case "bottom":
                    s = [_, $, L, A];
                    break;
                case "top":
                    s = [$, _, L, A];
                    break;
                case "right":
                    s = [L, A, _, $];
                    break;
                case "left":
                    s = [A, L, _, $]
                }
                o ? s[0](!0) : (!D && (s = s.slice(0, 2)),
                s.some(e=>e()) || (!o && k[1] > k[0] ? s[1] : s[0])(!0),
                this.floatShowDirection = r);
                let O = !1
                  , R = !1;
                switch ("top" == r || "bottom" == r ? (h = (y.lLeft + y.rLeft - P) / 2,
                (l = T ? (y.lLeft + y.rLeft - S) / 2 : y.lLeft) + S > m - 10 ? (h <= m - P - 10 || (h = (y.rLeft > m - 10 ? m - 10 : y.rLeft) - P),
                x = 10,
                O = !0) : l < 10 ? (h >= 10 || (h = y.lLeft < 10 ? 10 : y.lLeft),
                v = 10) : v = l) : (h = (y.tTop + y.bTop - P) / 2,
                (l = T ? (y.tTop + y.bTop - C) / 2 : y.tTop) + C > g - 10 ? (h <= g - P - 10 || (h = (y.bTop > g - 10 ? g - 10 : y.bTop) - P),
                M = 10 - w,
                R = !0) : l < 10 ? (h >= 10 || (h = y.tTop < 10 ? 10 : y.tTop),
                E = 10 + w) : E = l + w),
                c.left = null == v ? "" : `${v + b}px`,
                c.right = null == x ? "" : `${x - b}px`,
                c.top = null == E ? "" : `${E + w}px`,
                c.bottom = null == M ? "" : `${M - w}px`,
                n) {
                case "limitSize":
                    c.maxWidth = null == v ? `${m - 10 - x}px` : `${m - 10 - v}px`,
                    c.maxHeight = null == E ? `${g - 10 - M}px` : `${g - 10 - E}px`;
                    break;
                case "changePosition":
                    null == v ? c.right = `${Math.min(x, m - 10 - S)}px` : c.left = `${Math.min(v, m - 10 - S)}px`,
                    null == E ? c.bottom = `${Math.min(M, g - 10 - C)}px` : c.top = `${Math.min(E, g - 10 - C)}px`
                }
                if (T) {
                    let e, n = t.szArrowMap.get(this);
                    n || (d.length ? n = d.pop() : (n = i.appendChild(document.createElement("div"))).appendChild(document.createElement("div")),
                    t.szArrowMap.set(this, n)),
                    e = n.firstChild;
                    let o = n.style;
                    o.display = "",
                    o.position = "absolute",
                    o.left = o.right = "",
                    o.top = o.bottom = "",
                    o.zIndex = ht();
                    let s = ()=>{
                        R ? o.bottom = g - h - w - P + "px" : o.top = h + w + "px"
                    }
                      , l = ()=>{
                        O ? o.right = m - h - b - P + "px" : o.left = h + b + "px"
                    }
                    ;
                    switch (r) {
                    case "top":
                        o.top = y.tTop + w - I + "px",
                        l(),
                        n.className = "sz-arrow-b",
                        e.className = "sz-arrowinner-b";
                        break;
                    case "left":
                        s(),
                        o.left = y.lLeft + b - I + "px",
                        n.className = "sz-arrow-r",
                        e.className = "sz-arrowinner-r";
                        break;
                    case "right":
                        s(),
                        o.left = y.rLeft + b + "px",
                        n.className = "sz-arrow-l",
                        e.className = "sz-arrowinner-l";
                        break;
                    case "bottom":
                        o.top = y.bTop + w + "px",
                        l(),
                        n.className = "sz-arrow-t",
                        e.className = "sz-arrowinner-t"
                    }
                    let a = this.customStyle
                      , c = n.classList;
                    a && a.length && a.forEach(e=>{
                        c.add(e),
                        Ze().createComponentStyle(p, e)
                    }
                    );
                    let u = this.colorTheme;
                    if (u) {
                        c.add(u),
                        Ze().createColorThemeStyle(u, p)
                    }
                }
                c.visibility = a.oldVisibility,
                a.oldVisibility = void 0,
                !u && this.requestDoResize()
            }
            ;
            return V().then(()=>this.waitRender && this.waitRender()).then(()=>{
                if (this.isVisible())
                    return y(),
                    this
            }
            )
        }
        hideFloat(e) {
            this.setVisible(!1);
            let n = t.szArrowMap.get(this);
            n && "none" !== n.style.display && (n.style.display = "none",
            d.push(n),
            t.szArrowMap.delete(this));
            let r = this.floatShowAnchor;
            r instanceof Element && r.classList.remove("sz-showat-active"),
            this.floatShowAnchor = void 0,
            this.floatShowDirection = void 0;
            const o = this.domFocusBeforeShowFloat;
            return o && Y(0).then(()=>{
                o.focus(),
                delete this.domFocusBeforeShowFloat
            }
            ),
            s.remove(this),
            !0
        }
        cmd(e, t, n) {
            let r = t || {}
              , o = r.data
              , s = e.cmd || n && n.data && n.data.cmd || o && o.cmd || n && n.id || r.id || o && o.id;
            if (s) {
                let o, i = s.indexOf(" ");
                i > 0 && (o = s.substring(i + 1),
                s = s.substring(0, i)),
                e.cmd = s;
                let l = this["cmd_" + s] || this[s] || this.cmd_fallback;
                if (l && "function" == typeof l)
                    return void 0 === o && s.startsWith("set") && (n && n.getValue ? o = n.getValue() : r.getValue && (o = r.getValue())),
                    void 0 !== o ? l.call(this, o) : l.call(this, e, t, n)
            }
        }
        notifyParentResize() {
            let e = this.domParent && v(this.domParent, (e,t)=>{
                if (t.doChildResize)
                    return !0
            }
            );
            e && e.doChildResize(this)
        }
        getContentBoundingSize() {
            let e = this.domBase;
            return {
                width: e.scrollWidth,
                height: e.scrollHeight
            }
        }
        _reInit(e) {
            this.onshow = e.onshow || null,
            this.onhide = e.onhide || null,
            this.keyPrefix = e.keyPrefix || null,
            this.setLayoutTheme(e.layoutTheme),
            this.setColorTheme(e.colorTheme),
            this.setClassName(e.className),
            this.setCustomStyle(e.customStyle || []),
            this.setVisible(void 0 === e.visible || e.visible),
            this.wantTab = !!e.wantTab,
            this.setEnabled(void 0 === e.enabled || e.enabled)
        }
    }
    t.Component = Component;
    const p = {
        name: "szArrow",
        makeStyleRules: (e,t)=>{
            let n = e.dropdown || e.common
              , r = n.backgroundColor || ""
              , o = n.lineColor || "";
            return [`.${t}.sz-arrow-b {\n\t\t\t\tborder-top-color: ${o};\n\t\t\t}`, `.${t}.sz-arrow-b>.sz-arrowinner-b {\n\t\t\t\tborder-top-color: ${r};\n\t\t\t}`, `.${t}.sz-arrow-r {\n\t\t\t\tborder-left-color: ${o};\n\t\t\t}`, `.${t}.sz-arrow-r>.sz-arrowinner-r {\n\t\t\t\tborder-left-color: ${r};\n\t\t\t}`, `.${t}.sz-arrow-l {\n\t\t\t\tborder-right-color: ${o};\n\t\t\t}`, `.${t}.sz-arrow-l>.sz-arrowinner-l {\n\t\t\t\tborder-right-color: ${r};\n\t\t\t}`, `.${t}.sz-arrow-t {\n\t\t\t\tborder-bottom-color: ${o};\n\t\t\t}`, `.${t}.sz-arrow-t>.sz-arrowinner-t {\n\t\t\t\tborder-bottom-color: ${r};\n\t\t\t}`]
        }
    };
    t.ContainerComponent = class ContainerComponent extends Component {
        constructor(e) {
            super(e)
        }
        _init_default(e) {
            super._init_default(e),
            this.scrollBubbleEnabled = void 0 !== e.scrollBubbleEnabled && e.scrollBubbleEnabled;
            let t = this.keyPrefix
              , n = this.id;
            this.placeholder = e.placeholder || t && ie(`${t}${n ? "." + n : ""}.placeholder`, null),
            e.autoPlaceholder && (this.autoPlaceholder = !0),
            this.pullToRefreshEnabled = e.pullToRefreshEnabled
        }
        _init(e) {
            return super._init(e)
        }
        _init_scrollbar(t) {
            return this.domScrollContainer || console.warn("带滚动条的容器控件不能没有domScrollContainer，请开发人员尽快修复。"),
            n.browser.mobile ? (this.mobileScrollFix || (this.mobileScrollFix = new MobileScrollFix(this.domScrollContainer || this.domBase)),
            this.domScrollContainer && this.pullToRefreshEnabled && "function" == typeof this.refresh && new Promise((t,n)=>{
                e(["commons/mobile/basic"], t, n)
            }
            ).then(__importStar).then(e=>{
                this.touchEasy = new e.TouchEasy({
                    domBase: this.domBase,
                    domScrollContainer: this.domScrollContainer,
                    pullToRefreshEnabled: !0,
                    onpulltorefresh: ()=>Promise.resolve(this.refresh())
                })
            }
            ),
            null) : this.macScrollBar = MacScrollBar.create({
                domBase: this.domBase,
                scrollBubbleEnabled: this.scrollBubbleEnabled,
                domScrollContainer: this.domScrollContainer,
                overflowX: t.overflowX,
                overflowY: t.overflowY,
                overflow: t.overflow
            })
        }
        _updateScrollBar(e, t) {
            let n = this.state;
            n && (this.domScrollContainer.scrollLeft = n.scrollLeft,
            this.domScrollContainer.scrollTop = n.scrollTop,
            this.state = null);
            let r = this.macScrollBar;
            r && (t ? r.updateScrollBar(e) : r.requestUpdateScrollBar(e))
        }
        smoothScroll(e) {
            const t = this.domScrollContainer || this.domBase;
            let n = ()=>{
                let e = this.macScrollBar;
                e && e.domScrollBarV && "hidden" !== e.overflowY && e.domScrollBarH && "hidden" !== e.overflowX && (e.scrollLeft = t.scrollLeft,
                e.scrollTop = t.scrollTop,
                e.updateScrollBar(!0))
            }
            ;
            return h(Object.assign({}, e, {
                domScrollContainer: e.domScrollContainer || t,
                onscroll: e.onscroll ? function(...e) {
                    !this.domScrollContainer && n(),
                    e.onscroll.apply(null, e)
                }
                : !this.domScrollContainer && n
            }))
        }
        stopSmoothScroll(e) {
            return this.smoothScroll({
                domScrollContainer: e
            })
        }
        startScroll(e) {
            let t = this.macScrollBar
              , n = e.scrollLeft || 0
              , r = e.scrollTop || 0
              , o = e.offset || 6
              , s = ()=>setTimeout(()=>{
                let {top: i, left: l} = function() {
                    let e = 0 === n ? t.scrollLeft : Math.max(0, Math.min(t.scrollLeft + (n > 0 ? o : -o), t.scrollWidth - t.clientWidth));
                    return {
                        top: 0 === r ? t.scrollTop : Math.max(0, Math.min(t.scrollTop + (r > 0 ? o : -o), t.scrollHeight - t.clientHeight)),
                        left: e
                    }
                }();
                if (t.scrollTop !== i || t.scrollLeft !== l) {
                    e.callback && e.callback();
                    let t = this.domScrollContainer || this.domBase;
                    0 !== n && (t.scrollLeft = l),
                    0 !== r && (t.scrollTop = i),
                    this.scrollTimer = s()
                } else
                    e.scrollEndCallback && e.scrollEndCallback()
            }
            );
            !this.scrollTimer && (this.scrollTimer = s())
        }
        stopScroll() {
            this.scrollTimer && clearTimeout(this.scrollTimer),
            this.scrollTimer = void 0
        }
        getScrollBar() {
            return this.macScrollBar
        }
        getScrollContainer() {
            return this.domScrollContainer
        }
        dispose() {
            var e, t;
            this.domBase && this.macScrollBar && (this.macScrollBar.dispose(),
            this.macScrollBar = null),
            null === (e = this.mobileScrollFix) || void 0 === e || e.dispose(),
            null === (t = this.touchEasy) || void 0 === t || t.dispose(),
            super.dispose()
        }
        doResize() {
            let e = this.state;
            e && (this.domScrollContainer.scrollLeft = e.scrollLeft,
            this.domScrollContainer.scrollTop = e.scrollTop,
            this.state = null),
            this.macScrollBar && this.macScrollBar.requestUpdateScrollBar()
        }
        doChildResize(e) {
            let t = this.state;
            t && (this.domScrollContainer.scrollLeft = t.scrollLeft,
            this.domScrollContainer.scrollTop = t.scrollTop,
            this.state = null),
            this.macScrollBar && this.macScrollBar.requestUpdateScrollBar(),
            this.notifyParentResize()
        }
        saveState() {
            if (null != this.state)
                return this.state;
            let e = this.macScrollBar;
            return e ? {
                scrollLeft: e.scrollLeft,
                scrollTop: e.scrollTop
            } : void 0
        }
        restoreState(e) {
            e && (this.domBase.offsetParent && this.domScrollContainer ? (this.domScrollContainer.scrollLeft = e.scrollLeft,
            this.domScrollContainer.scrollTop = e.scrollTop,
            this.state = null) : this.state = e)
        }
        getContentBoundingSize() {
            let e = this.domScrollContainer || this.domBase;
            return {
                width: e.scrollWidth,
                height: e.scrollHeight
            }
        }
        isEmpty() {
            return !1
        }
        getDataReadyState() {
            return null
        }
        createPlaceholderDom(e) {
            let t = this.domPlaceholder;
            return t || ((t = this.domPlaceholder = document.createElement("div")).className = "common-placeholder",
            (e || this.domBase).appendChild(t)),
            t
        }
        showPlaceholder(e, t) {
            let n = this.isEmpty()
              , r = this.domPlaceholder;
            if (!n || !1 === e)
                return void (this.placeholderVisible && r && (r.style.display = "none"));
            let o = this.getPlaceholder(t);
            o ? (r || (r = this.createPlaceholderDom()),
            this.placeholderVisible = !0,
            this.renderPlaceholder(o),
            r.style.display = "") : this.placeholderVisible && r && (r.style.display = "none")
        }
        getPlaceholder(e) {
            let t = this.placeholder;
            return t ? "string" == typeof t || t instanceof HTMLElement ? t : (void 0 === e && (e = this.getDataReadyState()),
            "function" == typeof t ? t(this, e) : e ? void 0 !== (t = t[e]) ? t : this.autoPlaceholder && this.getDefaultPlaceholder(e) : null) : this.autoPlaceholder ? this.getDefaultPlaceholder(e) : null
        }
        getDefaultPlaceholder(e) {
            if (void 0 === e && (e = this.getDataReadyState()),
            e) {
                let t = this;
                switch (e) {
                case "loading":
                    return ie("commons.placeholder.loading");
                case "nosearchresult":
                    return ie("commons.placeholder.nosearchresult", t.getCurrentFindKeyword && t.getCurrentFindKeyword());
                case "searching":
                    return ie("commons.placeholder.searching", t.getCurrentFindKeyword && t.getCurrentFindKeyword());
                case "nodata":
                    return ie("commons.placeholder.nodata")
                }
            }
        }
        setPlaceholder(e) {
            this.placeholder !== e && (this.placeholder = e,
            this.renderPlaceholder(e))
        }
        renderPlaceholder(e) {
            let t = this.domPlaceholder;
            e ? t && ("string" == typeof e ? xn(t, e) : (t.removeAllChildren(),
            t.appendChild(e))) : (t && t.removeAllChildren(),
            this.showPlaceholder(!1))
        }
    }
    ;
    class MacScrollBar {
        constructor(e) {
            this.scrollHorizontal = !1,
            this.overflowOverlay = !0,
            this.needUpdateScrollBar = !1,
            this.scrollWidth = null,
            this.scrollHeight = null,
            this.scrollLeft = null,
            this.scrollTop = null,
            this.clientHeight = null,
            this.clientWidth = null,
            this.barBackClientWidth = null,
            this.barBackClientHeight = null,
            this.scrollContainerHeight = null;
            const t = this.domBase = e.domBase;
            this.domScrollContainer = e.domScrollContainer || e.domBase,
            this.scrollHorizontal = e.scrollHorizontal || !1,
            this.scrollBubbleEnabled = void 0 !== e.scrollBubbleEnabled && e.scrollBubbleEnabled,
            this.visible = !1,
            this.coverMaskEnabled = !0,
            this.handler_mouseover = this.doMouseOver.bind(this),
            this.handler_mouseout = this.doMouseOut.bind(this),
            this.handler_wheel = this.doWheel.bind(this),
            this.handler_scroll = this.doScroll.bind(this),
            t.addEventListener("mouseover", this.handler_mouseover),
            t.addEventListener("mouseout", this.handler_mouseout),
            t.addEventListener("wheel", this.handler_wheel, {
                passive: !1
            }),
            this.domScrollContainer.addEventListener("scroll", this.handler_scroll),
            this._init_scrollbar(e)
        }
        static create(e) {
            return new MacScrollBar(e)
        }
        _init_scrollbar(e) {
            let t = this.domScrollContainer
              , n = e.overflowX || e.overflow
              , r = e.overflowY || e.overflow;
            if (t.offsetParent) {
                if (!r && !n) {
                    let e = getComputedStyle(t)
                      , o = e=>"auto" === e || "scroll" === e ? "auto" : "hidden";
                    n = o(e.overflowX),
                    r = o(e.overflowY)
                }
                this.setOverflowY(r || "auto"),
                this.setOverflowX(n || "hidden"),
                t.style.overflow = "hidden",
                this.requestUpdateScrollBar()
            } else
                this.overflowX = n,
                this.overflowY = r,
                (r || n) && (t.style.overflow = "hidden")
        }
        dispose() {
            const e = this.domBase
              , t = this.domScrollBarH
              , n = this.domScrollBarV;
            e.removeEventListener("wheel", this.handler_wheel),
            e.removeEventListener("mouseover", this.handler_mouseover),
            e.removeEventListener("mouseout", this.handler_mouseout),
            t && t.sz_hide_timmer && clearTimeout(t.sz_hide_timmer),
            n && n.sz_hide_timmer && clearTimeout(n.sz_hide_timmer),
            this.domScrollContainer.removeEventListener("scroll", this.handler_scroll),
            this.scrollBarHDragger && this.scrollBarHDragger.dispose()
        }
        setOverflow(e) {
            this.setOverflowX(e),
            this.setOverflowY(e)
        }
        setOverflowX(e) {
            const t = document;
            if (this.domScrollBackH && this.overflowX === e)
                return;
            if (this.overflowX = e,
            "hidden" === e)
                return void (this.domScrollBackH && (this.domScrollBackH.style.display = "none"));
            if (this.domScrollBarH)
                return void this.updateScrollBar();
            let n = this.domBase
              , r = this.domScrollContainer
              , o = this.domScrollBarH = t.createElement("div");
            o.classList.add("sz-scrollbarh"),
            o.classList.toggle("sz-scrollbar-visible", this.visible),
            "scrolling" === this.overflowX && o.classList.add("sz-scrollbarhide");
            let s = this.domScrollBackH = t.createElement("div");
            s.classList.add("sz-scrollbackh"),
            s.style.display = "none",
            s.style.zIndex = ht(),
            s.appendChild(o),
            this.scrollBarHDragger = new Drag({
                dom: o,
                startOffset: 0,
                coverMaskEnabled: this.coverMaskEnabled,
                component: {
                    doDragMove: (e,t)=>{
                        let n = t.domLeft + (e.clientX - t.clientX)
                          , i = s.widthNoPadding;
                        if (n < 0)
                            n = 0;
                        else {
                            let e = i - o.offsetWidth;
                            n > e && (n = e)
                        }
                        r.scrollLeft = (r.scrollWidth - r.clientWidth) / (i - o.offsetWidth) * n
                    }
                    ,
                    doDragEnd: (e,t)=>{
                        const n = e.target;
                        this.domScrollContainer.contains(n) || this.setVisible(!1)
                    }
                }
            }),
            n.appendChild(s)
        }
        setOverflowY(e) {
            const t = document;
            if (this.domScrollBackV && this.overflowY === e)
                return;
            if (this.overflowY = e,
            "hidden" === e)
                return void (this.domScrollBackV && (this.domScrollBackV.style.display = "none"));
            if (this.domScrollBarV)
                return void this.updateScrollBar();
            let n = this.domBase
              , r = this.domScrollContainer
              , o = this.domScrollBarV = t.createElement("div");
            o.classList.add("sz-scrollbarv"),
            o.classList.toggle("sz-scrollbar-visible", this.visible),
            "scrolling" === this.overflowY && o.classList.add("sz-scrollbarhide");
            let s = this.domScrollBackV = t.createElement("div");
            s.classList.add("sz-scrollbackv"),
            s.style.display = "none",
            s.style.zIndex = ht(),
            s.appendChild(o),
            this.scrollBarVDragger = new Drag({
                dom: o,
                startOffset: 0,
                coverMaskEnabled: this.coverMaskEnabled,
                component: {
                    doDragMove: (e,t)=>{
                        let n = t.domTop + (e.clientY - t.clientY)
                          , i = s.heightNoPadding;
                        if (n < 0)
                            n = 0;
                        else {
                            let e = i - o.offsetHeight;
                            n > e && (n = e)
                        }
                        r.scrollTop = (r.scrollHeight - r.clientHeight) / (i - o.offsetHeight) * n
                    }
                    ,
                    doDragEnd: (e,t)=>{
                        const n = e.target;
                        this.domScrollContainer.contains(n) || this.setVisible(!1)
                    }
                }
            }),
            n.appendChild(s)
        }
        requestUpdateScrollBar(e) {
            this.needUpdateScrollBar || (this.needUpdateScrollBar = !0,
            V().then(()=>this.updateScrollBar(e)))
        }
        updateScrollBar(e=!1) {
            this.needUpdateScrollBar = !1;
            let t = this.domBase
              , n = this.domScrollContainer;
            if (!n)
                return;
            ("hidden" !== this.overflowX && !this.domScrollBarH || "hidden" !== this.overflowY && !this.domScrollBarV) && this._init_scrollbar({
                domBase: this.domBase,
                overflowX: this.overflowX,
                overflowY: this.overflowY
            });
            let r, o, s, i, l, a, c = this.domScrollBarV, d = this.domScrollBarH, u = c && "hidden" !== this.overflowY, h = d && "hidden" !== this.overflowX;
            if (u || h) {
                if (e)
                    l = this.scrollLeft || 0,
                    a = this.scrollTop || 0,
                    r = this.scrollWidth,
                    o = this.scrollHeight,
                    s = this.clientHeight,
                    i = this.clientWidth;
                else {
                    if (t === n) {
                        if (u) {
                            let e = this.domScrollBackV.style;
                            e.top = e.bottom = e.right = "0px"
                        }
                        if (h) {
                            let e = this.domScrollBackH.style;
                            e.left = e.right = e.bottom = "0px"
                        }
                    }
                    l = this.scrollLeft = n.scrollLeft,
                    a = this.scrollTop = n.scrollTop,
                    r = this.scrollWidth = n.scrollWidth,
                    o = this.scrollHeight = n.scrollHeight,
                    s = this.clientHeight = n.clientHeight,
                    i = this.clientWidth = n.clientWidth
                }
                if (u) {
                    let r = this.domScrollBackV
                      , i = r.style;
                    if (s >= o)
                        "none" !== i.display && (i.display = "none");
                    else {
                        "" !== i.display && (i.display = "");
                        let d = e ? this.barBackClientHeight : this.barBackClientHeight = r.heightNoPadding
                          , u = d * s / o
                          , h = Math.min(d, 20);
                        h > u && (u += Math.pow(h - u, 1 / 1.05)),
                        e || (c.style.height = u + "px"),
                        c.style.top = (d - u) / (o - s) * a + "px",
                        t === n && (i.top = a + "px",
                        i.bottom = -a + "px",
                        i.right = -l + "px")
                    }
                }
                if (h) {
                    let o = this.domScrollBackH
                      , s = o.style;
                    if (i >= r)
                        "none" !== s.display && (s.display = "none");
                    else {
                        "" !== s.display && (s.display = "");
                        let c = e ? this.barBackClientWidth : this.barBackClientWidth = o.widthNoPadding
                          , u = c * i / r
                          , h = Math.min(c, 20);
                        h > u && (u += Math.pow(h - u, 1 / 1.05)),
                        d.style.width = u + "px",
                        d.style.left = (c - u) / (r - i) * l + "px",
                        t === n && (s.left = l + "px",
                        s.right = -l + "px",
                        s.bottom = -a + "px")
                    }
                }
            }
        }
        doMouseOver(e) {
            const t = e.relatedTarget;
            t && this.domBase.contains(t) || this.setVisible(!0)
        }
        doMouseOut(e) {
            const t = e.relatedTarget;
            t && this.domBase.contains(t) || this.domScrollBarH && this.domScrollBarH.classList.contains("draging") || this.domScrollBarV && this.domScrollBarV.classList.contains("draging") || this.setVisible(!1)
        }
        doScroll(e) {
            let t = this.domScrollContainer
              , n = this.scrollLeft
              , r = this.scrollTop;
            this.scrollLeft = t.scrollLeft,
            this.scrollTop = t.scrollTop,
            this.updateScrollBar(!0),
            !this.scrollBubbleEnabled && (this.scrollLeft - n != 0 && this.clientWidth !== this.scrollWidth || this.scrollTop - r != 0 && this.clientHeight !== this.scrollHeight) && (e.stopPropagation(),
            e.preventDefault())
        }
        doWheel(e) {
            let t = this.domScrollContainer
              , {deltaX: n, deltaY: r} = m(e);
            e.shiftKey && (n = 0 !== n ? n : r,
            r = 0);
            let o = this.overflowY
              , s = this.overflowX;
            this.scrollHorizontal && 0 != r && 0 == n && (n = r);
            let i = !1;
            if (0 !== r && "hidden" !== o) {
                let e = null !== this.scrollTop ? this.scrollTop : this.scrollTop = t.scrollTop
                  , n = null !== this.clientHeight ? this.clientHeight : this.clientHeight = t.clientHeight
                  , s = null !== this.scrollHeight ? this.scrollHeight : this.scrollHeight = t.scrollHeight;
                0 === e && r < 0 || e + n === s && r > 0 || ((e += r) < 0 && (e = 0),
                e > s - n && (e = s - n),
                t.scrollTop = e,
                i = !0,
                "scrolling" === o && this._showScrollingBar(this.domScrollBarV))
            }
            if (0 !== n && "hidden" !== s) {
                let e = null !== this.scrollLeft ? this.scrollLeft : this.scrollLeft = t.scrollLeft
                  , r = null !== this.clientWidth ? this.clientWidth : this.clientWidth = t.clientWidth
                  , o = null !== this.scrollWidth ? this.scrollWidth : this.scrollWidth = t.scrollWidth;
                0 === e && n < 0 || e + r === o && n > 0 || ((e += n) < 0 && (e = 0),
                e > o - r && (e = o - r),
                t.scrollLeft = e,
                i = !0,
                "scrolling" === s && this._showScrollingBar(this.domScrollBarH))
            }
            !i && this.scrollBubbleEnabled || !(0 !== n && this.clientWidth !== this.scrollWidth || 0 !== r && this.clientHeight !== this.scrollHeight) || (e.stopPropagation(),
            e.preventDefault())
        }
        _showScrollingBar(e) {
            e && (e.classList.remove("sz-scrollbarhide"),
            e.sz_hide_timmer && clearTimeout(e.sz_hide_timmer),
            e.sz_hide_timmer = setTimeout(()=>{
                e.classList.add("sz-scrollbarhide"),
                e.sz_hide_timmer = 0
            }
            , 1e3))
        }
        setVisible(e) {
            e = !!e,
            this.visible !== e && (this.visible = e,
            this.domScrollBarH && this.domScrollBarH.classList.toggle("sz-scrollbar-visible", e),
            this.domScrollBarV && this.domScrollBarV.classList.toggle("sz-scrollbar-visible", e))
        }
        setCoverMaskEnabled(e) {
            e = this.coverMaskEnabled = !!e,
            this.scrollBarHDragger && (this.scrollBarHDragger.coverMaskEnabled = e),
            this.scrollBarHDragger && (this.scrollBarVDragger.coverMaskEnabled = e)
        }
    }
    function f() {
        return "zh_CN" === y()
    }
    function y() {
        let e;
        if (n.browser.nodejs) {
            let t = global.env || global.process.env;
            e = t.LC_ALL || t.LC_MESSAGES || t.LANG || t.LANGUAGE
        } else {
            let t = re()
              , n = Te(t["sys.i18n.useBrowserLanguage"])
              , r = t["sys.i18n.defaultLang"];
            e = !n && r && "auto" !== r ? r : navigator.language || navigator.browserLanguage
        }
        if (!e || "zh" === e || -1 !== e.indexOf("zh-") || -1 !== e.indexOf("zh_"))
            return "zh_CN";
        let t = e.indexOf("-");
        return t > 0 && (e = e.substring(0, t) + "_" + e.substring(t + 1).toUpperCase()),
        "en_US" === e || -1 !== e.indexOf("en-") || -1 !== e.indexOf("en_") ? "en" : e
    }
    let b, w;
    function S(e) {
        return !(!e.offsetParent && e !== document.body)
    }
    function C() {
        if (null == w) {
            let e = document.createElement("div");
            e.style.visibility = "hidden",
            e.style.width = "100px",
            e.style.msOverflowStyle = "scrollbar",
            document.body.appendChild(e);
            let t = e.offsetWidth;
            e.style.overflow = "scroll";
            let n = document.createElement("div");
            n.style.width = "100%",
            e.appendChild(n);
            let r = n.offsetWidth;
            e.parentNode.removeChild(e),
            w = {
                width: t - r,
                height: t - r
            }
        }
        return w
    }
    t.MacScrollBar = MacScrollBar,
    t.domReady = function() {
        let e, t;
        return function() {
            if (H())
                return Promise.resolve();
            const n = document;
            return t || (t = new Promise(r=>{
                n.addEventListener("DOMContentLoaded", e = function() {
                    n.removeEventListener("DOMContentLoaded", e),
                    e = null,
                    t = null,
                    r()
                }
                )
            }
            )),
            t
        }
    }(),
    t.ready = function(r) {
        let o, s = [n.browser.nodejs ? null : t.domReady()];
        if (t.LOCALEMSG.locale ? s.push(Promise.resolve()) : (o = y(),
        s.push(new Promise((t,n)=>{
            e(["i18n/" + o], t, n)
        }
        ).then(__importStar).catch(t=>(!n.browser.nodejs && console.warn(`加载 ${o} 失败，尝试加载 en...`, t),
        o = "en",
        new Promise((t,n)=>{
            e(["i18n/" + o], t, n)
        }
        ).then(__importStar))))),
        r) {
            let t = Array.isArray(r) ? r : [r];
            for (let n = 0; n < t.length; n++) {
                let r = t[n];
                if ("." === r.charAt(0)) {
                    let e = location.pathname;
                    e = e.substring(0, e.lastIndexOf("/")),
                    (r = un(e, r)).endsWith(".css") || r.endsWith(".js") || (r += ".js")
                }
                s.push(new Promise((t,n)=>{
                    e([r], t, n)
                }
                ).then(__importStar))
            }
        }
        return Promise.all(s).then(e=>(o && se(o, e[1].messages),
        Array.isArray(r) ? e.slice(2) : e[2]))
    }
    ,
    t.refreshHTMLI18N = function() {
        let e = document.getElementsByTagName("title")[0];
        if (e) {
            let t = e.getAttribute("i18n-key");
            t && ie(t) && (document.title = ie(t))
        }
        let t = document.body.querySelectorAll("[i18n-key]");
        for (let n = 0, r = t.length; n < r; n++) {
            let e = t[n]
              , r = ie(e.getAttribute("i18n-key"));
            r && (r.match(/^<\w+>.+<\/\w+>$/gm) ? e.innerHTML = r : e.textContent = r)
        }
    }
    ,
    t.isBrowserLanguageZh_cn = f,
    t.getBrowserLanguage = y,
    t.getWindowId = function() {
        return b || (b = Re())
    }
    ,
    t.dispatchResizeEvent = function() {
        if (n.browser.nodejs)
            return;
        let e = []
          , r = null
          , o = ()=>d(document.body)
          , i = ()=>{
            window.removeEventListener("resize", o),
            window.removeEventListener("unload", i),
            e = []
        }
        ;
        function l(e, t) {
            return e !== t && e.contains(t)
        }
        function a(e) {
            let t = e.szobject;
            if (!t) {
                if (!S(e))
                    return;
                let n = e.childElementCount;
                if (0 === n)
                    return;
                1 === n && (t = (e = e.firstElementChild).szobject)
            }
            if (t) {
                if (!t.isDisplay())
                    return;
                if (t.doResize) {
                    let e = t.doResize();
                    return void (e && e.length && e.forEach(a))
                }
            }
            if (!e.childElementCount || 1 !== e.nodeType)
                return;
            let n = e.getElementsByClassName("want-resizeevent")
              , r = e.classList.contains("want-resizeevent");
            if (!(n && n.length || r))
                return;
            let o = Array.from(n)
              , s = r ? e : o.shift();
            for (; s; ) {
                if ((t = s.szobject) && null != t.doResize && t.isDisplay()) {
                    let e = t.doResize();
                    o = null != e && e.length ? o.filter(t=>!l(s, t) || !!e.find(e=>e.contains(t))) : o.filter(e=>!l(s, e))
                }
                s = o.shift()
            }
        }
        function c() {
            if (r = null,
            !e.length)
                return;
            let t = [];
            e.forEach(n=>{
                e.find(e=>l(e, n)) || t.includes(n) || t.push(n)
            }
            ),
            e.length = 0,
            t.forEach(a),
            !n.browser.mobile && t.includes(document.body) && s.forEach(e=>e.hideFloat())
        }
        function d(t, n=!1) {
            t && (!e.includes(t) && e.push(t),
            n ? (r && N(r),
            c()) : r || (r = B(c)))
        }
        return t.domReady().then(()=>{
            window.addEventListener("resize", o),
            window.addEventListener("unload", i)
        }
        ),
        d
    }(),
    t.isDomVisible = S,
    t.getScrollBarSize = C,
    t.getScrollBarWidth = function() {
        return C().width
    }
    ,
    t.getScrollBarHeight = function() {
        return C().height
    }
    ;
    function v(e, t) {
        let n = e.szobject;
        if (n && (!t || t(e, n)))
            return n;
        let r = 0
          , o = document.body;
        for (e = e.parentNode; e && e !== o && r++ < 1e3; ) {
            if ((n = e.szobject) && (!t || t(e, n)))
                return n;
            e = e.parentNode
        }
        return null
    }
    function x(e, t) {
        return v(e.target || e.srcElement, t)
    }
    function E(e) {
        return x(e, (e,t)=>t && t.dragger)
    }
    t.ComponentItem = class ComponentItem {
    }
    ,
    t.traverseChildElements = function e(t, n, r=!0) {
        if (t && 1 === t.nodeType && t.hasChildNodes()) {
            let o = t.childNodes;
            if (o && o.length)
                for (let t = 0, s = o.length; t < s; t++) {
                    let s = o[t]
                      , i = n(s);
                    if (!1 !== i) {
                        if (void 0 !== i)
                            return i;
                        r && 1 === s.nodeType && s.hasChildNodes() && e(s, n, r)
                    }
                }
        }
    }
    ,
    t.getSZObjectFromDom = v,
    t.getSZObjectFromEvent = x,
    t.getDragSZObjectFromEvent = E;
    class Drag {
        constructor(e) {
            this.startOffset = 2,
            this.listenMousedown = !0,
            this.coverMaskEnabled = !1,
            this.coverMaskEventEnabled = !0,
            this.justDraged = !1;
            let t = this.dom = e.dom;
            this.ondragstart = e.ondragstart,
            this.startOffset = null == e.startOffset ? 2 : e.startOffset,
            this.coverMaskEnabled = !!e.coverMaskEnabled,
            this.coverMaskEventEnabled = void 0 === e.coverMaskEventEnabled || !!e.coverMaskEventEnabled,
            this.component = e.component,
            this.dragChecked = !1,
            this.onmousedown_handler = this.doMouseDown.bind(this),
            this.onmousemove_handler = this.doMouseMove.bind(this),
            this.onmouseup_handler = this.doMouseUp.bind(this),
            this.onselectstart_handler = (e=>e.preventDefault()),
            (this.listenMousedown = null == e.listenMousedown || !!e.listenMousedown) && t.addEventListener("mousedown", this.onmousedown_handler)
        }
        dispose() {
            let e = this.dom;
            e && (this.dom = null,
            this.listenMousedown && e.removeEventListener("mousedown", this.onmousedown_handler))
        }
        releaseContext(e) {
            document.removeEventListener("mousemove", this.onmousemove_handler, !0),
            document.removeEventListener("mouseup", this.onmouseup_handler, !0),
            n.browser.safari && document.removeEventListener("selectstart", this.onselectstart_handler, !0),
            document.isReadDrag = !1;
            let r = this.component;
            t.dragContext.draging && r && r.doDragEnd && r.doDragEnd(e, t.dragContext),
            t.dragContext.domOver && t.dragContext.cursor && t.dragContext.domOver.classList.remove(t.dragContext.cursor),
            t.dragContext.domOver = void 0,
            t.dragContext.cursor = "";
            let o = t.dragContext.srcDom;
            o && (o.removeEventListener("losecapture", this.onmouseup_handler, !0),
            o.classList.remove("draging")),
            t.dragContext.mousedownEvent && t.dragContext.mousedownEvent.target instanceof Element && t.dragContext.mousedownEvent.target.classList.remove("sz-dragstart"),
            document.releaseCapture && document.releaseCapture(),
            t.dragContext.domFeedback && t.dragContext.domFeedback.remove(),
            this.dragChecked = !1,
            Object.getOwnPropertyNames(t.dragContext).forEach(e=>delete t.dragContext[e]),
            this.removeCover()
        }
        appendCover() {
            if (!this.coverMaskEnabled)
                return;
            l ? l.style.display = "block" : ((l = document.createElement("div")).classList.add("drag-cover"),
            document.body.appendChild(l));
            let e = t.dragContext.cursor;
            void 0 !== e && (l.style.cursor = e)
        }
        removeCover() {
            this.coverMaskEnabled && l && (l.style.display = "none",
            l.style.cursor = "")
        }
        doMouseDown(e) {
            if (this.justDraged = !1,
            t.dragContext.draging) {
                let n = t.dragContext.dragszobjectOver;
                return n && n.doDrop && n.doDrop(e, t.dragContext),
                void this.releaseContext(e)
            }
            if (2 === e.button)
                return;
            let r = this.component
              , o = t.dragContext.srcComponent;
            if (t.dragContext.srcComponent = r,
            r && r.doDragMouseDown && !1 === r.doDragMouseDown(e, t.dragContext))
                return void (t.dragContext.srcComponent = o);
            t.dragContext.mousedownEvent = e,
            t.dragContext.clientY = e.clientY,
            t.dragContext.clientX = e.clientX;
            let s = t.dragContext.srcDom || (t.dragContext.srcDom = e.target || e.srcElement);
            t.dragContext.domTop = parseFloat(s.style.top) || 0,
            t.dragContext.domLeft = parseFloat(s.style.left) || 0,
            this.checkStartdrag(e),
            document.isReadDrag || (document.addEventListener("mousemove", this.onmousemove_handler, !0),
            document.addEventListener("mouseup", this.onmouseup_handler, !0),
            n.browser.safari && document.addEventListener("selectstart", this.onselectstart_handler, !0),
            document.isReadDrag = !0),
            o && (t.dragContext.srcComponent = o),
            s.addEventListener("losecapture", this.onmouseup_handler, !0),
            n.browser.firefox && e.target instanceof Element && e.target.classList.add("sz-dragstart")
        }
        doMouseMove(e) {
            if (!t.dragContext.draging && !this.dragChecked && this.checkStartdrag(e),
            t.dragContext.draging) {
                const n = t.dragContext.cursor || "";
                t.dragContext.cursor = void 0,
                t.dragContext.dropAction = void 0,
                t.dragContext.mousemoveEvent = e;
                let r = t.dragContext.domFeedback;
                r && (r.style.transform = `translate(${e.clientX - t.dragContext.clientX}px, ${e.clientY - t.dragContext.clientY}px)`);
                let o = this.component
                  , s = e.target
                  , i = t.dragContext.domOver;
                if (t.dragContext.domOver = s,
                o && o.doDragMove && o.doDragMove(e, t.dragContext),
                i !== t.dragContext.domOver) {
                    let n = x(e);
                    t.dragContext.szobjectOver !== n && (t.dragContext.szobjectOver = n);
                    let r = E(e);
                    if (t.dragContext.dragszobjectOver != r) {
                        let n = t.dragContext.dragszobjectOver;
                        t.dragContext.dragszobjectOver = r,
                        n && n.doDragLeave && n.doDragLeave(e, t.dragContext)
                    }
                }
                let a = t.dragContext.dragszobjectOver;
                if (a && a.doDragOver) {
                    let n = t.dragContext.cursor;
                    if (t.dragContext.cursor = void 0,
                    a.doDragOver(e, t.dragContext),
                    null == t.dragContext.cursor)
                        switch (t.dragContext.cursor = n,
                        t.dragContext.dropAction) {
                        case t.DROPACTION.REPLACE:
                        case null:
                        case void 0:
                            t.dragContext.cursor = "";
                            break;
                        case t.DROPACTION.DISABLED:
                            t.dragContext.cursor = g("nodrop");
                            break;
                        case t.DROPACTION.APPENDCHILD:
                        case t.DROPACTION.INSERTAFTER:
                        case t.DROPACTION.INSERTBEFORE:
                            a !== o && (t.dragContext.cursor = g("add"))
                        }
                }
                const c = e.target
                  , d = t.dragContext.cursor || "";
                i === c && n === d || (i && n && i.classList.remove(n),
                c && d && c.classList.add(d),
                t.dragContext.cursor = d,
                t.dragContext.domOver = c),
                l && (l.style.cursor = t.dragContext.cursor || ""),
                e.stopPropagation(),
                e.preventDefault()
            }
        }
        doMouseUp(e) {
            let n, r = this.component;
            try {
                if (r && r.doDragMouseUp && r.doDragMouseUp(e, t.dragContext),
                t.dragContext.draging) {
                    let r = t.dragContext.dragszobjectOver;
                    n = r && r.doDrop && r.doDrop(e, t.dragContext),
                    e.stopPropagation(),
                    e.preventDefault()
                }
            } finally {
                if (n instanceof Promise)
                    return void n.then(()=>this.releaseContext(e));
                this.releaseContext(e)
            }
        }
        checkStartdrag(e) {
            let n = this.startOffset
              , r = this.component
              , o = t.dragContext.mousedownEvent;
            if (Math.abs(e.clientX - o.clientX) >= n || Math.abs(e.clientY - o.clientY) >= n) {
                if (r && r.doDragStart && (this.dragChecked = !0,
                !1 === r.doDragStart(t.dragContext.mousedownEvent, t.dragContext)))
                    return;
                t.dragContext.draging = !0,
                this.appendCover(),
                window.getSelection().removeAllRanges(),
                this.justDraged = !0,
                t.dragContext.srcDom.classList.add("draging");
                let n = t.dragContext.domFeedback;
                if (n) {
                    const r = n.getBoundingClientRect()
                      , o = t.dragContext.srcDom.getBoundingClientRect();
                    n.style.left = e.clientX - Math.max(0, Math.min(r.width, e.clientX - o.left)) + "px",
                    n.style.top = e.clientY - Math.max(0, Math.min(r.height, e.clientY - o.top)) + "px"
                }
                e.stopPropagation()
            }
        }
    }
    t.Drag = Drag;
    class EventListenerManager {
        constructor(e, t) {
            if (this.owner = e,
            this.listenersMap = new Map,
            this.asyncFires = new Map,
            this.channelId = t,
            t && !n.browser.mobile && !n.browser.nodejs && "function" == typeof BroadcastChannel) {
                (this.channel = new BroadcastChannel(t)).onmessage = (e=>{
                    let t = e.data;
                    t.contextPath === G() && this.innerFire(t.event, t.data, !1, !0)
                }
                )
            }
            n.browser.wxapp && t && window.addEventListener("storage", e=>{
                if (e.storageArea !== localStorage || e.key !== EventListenerManager.STORAGEKEY || !e.newValue)
                    return;
                let t = JSON.parse(e.newValue);
                t.channelId === this.channelId && (this.innerFire(t.event, t.data, !1, !0),
                localStorage.removeItem(EventListenerManager.STORAGEKEY))
            }
            )
        }
        on(e, t) {
            let n = this.listenersMap.get(e);
            !n && this.listenersMap.set(e, n = []),
            n.length > 50 && console.warn(`too many listeners(${n.length})!`, new Error),
            n.includes(t) && console.warn(`listener already exists: (${t})!`, new Error),
            n.push(t)
        }
        one(e, t) {
            let n = this.listenersMap.get(e);
            !n && this.listenersMap.set(e, n = []),
            n.length = 0,
            n.push(t)
        }
        off(e, t) {
            let n = this.listenersMap.get(e);
            n && (t ? n.remove(t) : n.length = 0)
        }
        dispose() {
            this.clear(),
            this.closeChannel()
        }
        closeChannel() {
            this.channel && this.channel.close(),
            this.channel = null
        }
        clear() {
            this.listenersMap.clear(),
            this.asyncFires.clear();
            let e = this.asyncFireHandle;
            e && (this.asyncFireHandle = null,
            N(e))
        }
        fire(e, t, n) {
            this.innerFire(e, t, n)
        }
        innerFire(e, t, r, o=!1) {
            var s;
            if (r && (null === (s = this.channel) || void 0 === s || s.postMessage({
                event: e,
                data: t,
                contextPath: G()
            }),
            n.browser.wxapp && this.channelId)) {
                let n = {
                    channelId: this.channelId,
                    event: e,
                    data: t
                };
                localStorage.setItem(EventListenerManager.STORAGEKEY, JSON.stringify(n))
            }
            let i = this.listenersMap.get(e);
            if (i && i.length) {
                let n;
                for (let r of i)
                    if (!1 === (n = r(t, e, this.owner, o)))
                        return n;
                return n
            }
        }
        fireAsync(e, t, n) {
            let r = this.asyncFires
              , o = r.get(e);
            !o && r.set(e, o = []),
            o.distinctPush(t),
            this.asyncFireHandle || (this.asyncFireHandle = B(()=>{
                this.asyncFireHandle = null;
                try {
                    r.forEach((e,t)=>{
                        for (let r of e)
                            this.fire(t, r, n)
                    }
                    )
                } finally {
                    r.clear()
                }
            }
            ))
        }
    }
    function M(e) {
        return e.startsWith("/") && (e = e.substring(1)),
        window.open(G("/manual/" + e), "SuccSoftManual"),
        !1
    }
    function T(t) {
        return n.browser.mobile ? new Promise((t,n)=>{
            e(["../commons/mobile/basic"], t, n)
        }
        ).then(__importStar).then(e=>e.showMobileAlertDialog(t)) : new Promise((t,n)=>{
            e(["../commons/dialog"], t, n)
        }
        ).then(__importStar).then(e=>e.showAlertDialog(t))
    }
    function D(e) {
        return !e.buttons && (e.buttons = ["cancel", "ok"]),
        P(e)
    }
    function P(t) {
        return new Promise((t,n)=>{
            e(["../commons/mobile/basic"], t, n)
        }
        ).then(__importStar).then(e=>e.showMobileInfoDialog(t))
    }
    t.EventListenerManager = EventListenerManager,
    EventListenerManager.STORAGEKEY = "succ_miniprogram_message",
    t.disposeComponents = function e(t=document.body) {
        if (!t || 1 !== t.nodeType)
            return;
        let n = t.szobject;
        if (n && n.dispose)
            n.dispose();
        else if (t.tagName && "IFRAME" === t.tagName.toUpperCase())
            try {
                t.contentWindow.eval("require('sys/sys').disposeComponents(document.body)")
            } catch (r) {
                console.error(r)
            }
        else
            t.hasChildNodes() && Array.from(t.childNodes).forEach(e)
    }
    ,
    t.showFormDialog = function(t) {
        return new Promise((t,n)=>{
            e(["../commons/dialog"], t, n)
        }
        ).then(__importStar).then(e=>e.showFormDialog(t))
    }
    ,
    t.handle401 = function(t={}) {
        return new Promise((t,n)=>{
            e(["sys/sys-error"], t, n)
        }
        ).then(__importStar).then(e=>e.handle401(t))
    }
    ,
    t.onNeedLoginError = function(t={}) {
        return new Promise((t,n)=>{
            e(["sys/sys-error"], t, n)
        }
        ).then(__importStar).then(e=>e.onNeedLoginError(t))
    }
    ,
    t.showDialog = function(t) {
        return new Promise((t,n)=>{
            e(["../commons/dialog"], t, n)
        }
        ).then(__importStar).then(e=>e.showDialog(t))
    }
    ,
    t.showMenu = function(t) {
        return new Promise((t,n)=>{
            e(["../commons/menu"], t, n)
        }
        ).then(__importStar).then(e=>e.showMenu(t))
    }
    ,
    t.disposeMenu = function(t) {
        return new Promise((t,n)=>{
            e(["../commons/menu"], t, n)
        }
        ).then(__importStar).then(e=>e.disposeMenu(t))
    }
    ,
    t.showErrorCodeManual = function(e) {
        let t = ie(e + ".manURL", null);
        return t ? M(t) : (window.open(G("/errorCodeManual/" + e), "SuccSoftManual"),
        !1)
    }
    ,
    t.showManual = M,
    window.showManual = M,
    t.showToolTip = function(t) {
        return new Promise((t,n)=>{
            e(["../commons/tooltip"], t, n)
        }
        ).then(__importStar).then(e=>e.showToolTip(t))
    }
    ,
    t.showConfirmDialog = function(t) {
        return n.browser.mobile ? D(t) : new Promise((t,n)=>{
            e(["../commons/dialog"], t, n)
        }
        ).then(__importStar).then(e=>e.showConfirmDialog(t))
    }
    ,
    t.showInputDialog = function(t) {
        return n.browser.mobile ? new Promise((t,n)=>{
            e(["../commons/mobile/basic"], t, n)
        }
        ).then(__importStar).then(e=>e.showMobileInputDialog(t)) : new Promise((t,n)=>{
            e(["../commons/dialog"], t, n)
        }
        ).then(__importStar).then(e=>e.showInputDialog(t))
    }
    ,
    t.showAlertDialog = T,
    t.showInfoDialog = function(e) {
        return n.browser.mobile ? P({
            message: e,
            buttons: ["ok"]
        }) : T({
            icon: "dialog-info-icon",
            title: ie("commons.dialog.title.info"),
            html: e,
            buttons: ["close"]
        })
    }
    ,
    t.showMobileConfirmDialog = D,
    t.showMobileInfoDialog = P,
    t.showShareDialog = function(t) {
        return new Promise((t,n)=>{
            e(["../co/co"], t, n)
        }
        ).then(__importStar).then(e=>e.showShareDialog(t))
    }
    ,
    t.showTreeDialog = function(t) {
        return new Promise((t,n)=>{
            e(["../commons/dialog"], t, n)
        }
        ).then(__importStar).then(e=>e.showTreeDialog(t))
    }
    ,
    t.showListDialog = function(t) {
        return new Promise((t,n)=>{
            e(["../commons/dialog"], t, n)
        }
        ).then(__importStar).then(e=>e.showListDialog(t))
    }
    ,
    t.waitAnimation = function(e, t=500, n) {
        return new Promise(r=>{
            let o, s = t=>{
                t && t.propertyName !== n && t.animationName !== n || (clearTimeout(o),
                e.removeEventListener("transitionend", s),
                e.removeEventListener("animationend", s),
                r())
            }
            ;
            o = setTimeout(s, t),
            e.addEventListener("transitionend", s),
            e.addEventListener("animationend", s)
        }
        )
    }
    ,
    t.waitAnimations = function e(t) {
        if (!t || !t.length)
            return Promise.resolve();
        let n = [];
        return t.forEach(t=>{
            if ("function" == typeof t.getAnimations)
                n.push(e(t.getAnimations()));
            else {
                let e = t;
                n.push(new Promise((t,n)=>{
                    e.onfinish = t,
                    e.oncancel = n
                }
                ))
            }
        }
        ),
        Promise.all(n)
    }
    ;
    let I, _ = 0;
    function $(t) {
        _ = (new Date).getTime();
        let r = t.content;
        if (n.browser.mobile && "string" == typeof r) {
            let e = t.type;
            return R({
                text: ie(r),
                icon: e && "icon-mobile-" + e,
                hideTime: t.hideTime
            })
        }
        return new Promise((t,n)=>{
            e(["../commons/basic"], t, n)
        }
        ).then(__importStar).then(e=>e.showMessageBox(t))
    }
    function L(e) {
        return $({
            content: e
        })
    }
    function A(e, t) {
        return $({
            content: e,
            hideTime: t,
            type: "warning"
        })
    }
    function k(e, t) {
        return !t && (t = 0),
        $({
            content: e,
            hideTime: t,
            type: "error"
        })
    }
    function O(e, t) {
        return $({
            content: e,
            hideTime: t,
            type: "success"
        })
    }
    function R(t) {
        return new Promise((t,n)=>{
            e(["../commons/mobile/basic"], t, n)
        }
        ).then(__importStar).then(e=>e.showMobileToast(t))
    }
    function F(e, t, n, r, o) {
        if (!e)
            return;
        let s = e.szicon
          , i = null
          , l = null
          , a = null
          , c = null
          , d = null;
        if ("string" == typeof t ? t.indexOf("/") >= 0 ? l = t : i = t : t && (a = t.code,
        d = t.fontSize,
        c = t.color,
        l = r && r.convertIcon(t.image, c) || t.image),
        !n && (t === s || s && (a && a === s.code || l && s.image === l) && d === s.fontSize && c === s.color))
            return;
        let u = e.classList
          , h = e.style;
        "string" == typeof s ? s.indexOf("/") >= 0 ? !l && (h.backgroundImage = "") : s && u.remove(s) : s && s.code ? (h.fontSize = "",
        h.color = "",
        h.background = "",
        h.webkitBackgroundClip = "",
        e.textContent = "",
        h.fontFamily = "") : s && s.image && !l && (h.backgroundImage = "",
        h.backgroundSize = "",
        h.backgroundPosition = "",
        h.backgroundRepeat = "",
        h.width = "",
        h.height = "",
        h.display = "",
        h.fontSize = ""),
        i ? u.add(i) : (a && "none" !== a || l) && (a && (e.textContent = String.fromCodePoint(`0xe${a}`)),
        ln(h, {
            code: a,
            image: l,
            color: c,
            fontSize: d
        }, r, o),
        "default" === c && (h.color = "")),
        e.szicon = t
    }
    function B(e) {
        t.animationFramePending++;
        let n = window.requestAnimationFrame(r=>{
            t.animationFramePendingInfo.delete(n),
            t.animationFramePending--,
            e(r)
        }
        );
        return t.animationFramePendingInfo.size > 1e3 && (console.error("requestAnimationFrame连续调用大于1000次且都未完成回调."),
        j(),
        t.animationFramePendingInfo.clear()),
        t.animationFramePendingInfo.set(n, {
            handle: n,
            stack: (new Error).stack,
            time: Date.now()
        }),
        n
    }
    function N(e) {
        e && (t.animationFramePending--,
        t.animationFramePendingInfo.delete(e),
        window.cancelAnimationFrame(e))
    }
    function j() {
        if (t.animationFramePendingInfo.size) {
            let e = 0;
            t.animationFramePendingInfo.forEach(t=>{
                e++ < 10 && console.error("animationFramePending:" + (Date.now() - t.time), t.stack)
            }
            )
        }
    }
    function H() {
        let e = document.readyState;
        return "complete" === e || "interactive" === e
    }
    t.getLastMessageBoxShowTime = function() {
        return _
    }
    ,
    t.showMessageBox = $,
    t.showProgressDialog = function(t) {
        return n.browser.mobile ? new Promise((t,n)=>{
            e(["../commons/mobile/basic"], t, n)
        }
        ).then(__importStar).then(e=>e.showMobileProgressDialog(t)) : new Promise((t,n)=>{
            e(["../commons/progress"], t, n)
        }
        ).then(__importStar).then(e=>e.showProgressDialog(t))
    }
    ,
    t.showMessage = L,
    t.hideMessage = function() {
        return new Promise((t,n)=>{
            e(["../commons/basic"], t, n)
        }
        ).then(__importStar).then(e=>e.hideMessageBox())
    }
    ,
    t.showWaitingMessage = function(e, t) {
        return $({
            content: e,
            type: "waiting",
            hideTime: t || 0
        })
    }
    ,
    t.showWarningMessage = A,
    t.showErrorMessage = k,
    t.showSuccessMessage = O,
    t.showMobileMessage = R,
    t.setIcon = F,
    t.getLang = function() {
        return window.navigator.language
    }
    ,
    t.isES5Browser = n.browser.msie,
    t.mockMobilePhone = function(e) {
        I = {
            mobile: n.browser.mobile,
            phone: n.browser.phone,
            android: n.browser.android,
            ios: n.browser.ios
        },
        n.browser.mobile = n.browser.phone = !0,
        e ? n.browser.android = !0 : n.browser.ios = !0
    }
    ,
    t.mockMobilePad = function(e) {
        I = {
            mobile: n.browser.mobile,
            pad: n.browser.pad,
            android: n.browser.android,
            ios: n.browser.ios
        },
        n.browser.mobile = n.browser.pad = !0,
        e ? n.browser.android = !0 : n.browser.ios = !0
    }
    ,
    t.resetSysBrowserInfo = function() {
        I && (n.browser.mobile = I.mobile,
        void 0 !== I.phone && (n.browser.phone = I.phone),
        void 0 !== I.pad && (n.browser.pad = I.pad),
        void 0 !== I.ios && (n.browser.ios = I.ios),
        void 0 !== I.android && (n.browser.android = I.android),
        I = void 0,
        n.browser.mobile || document.body.classList.remove("mobilescrollfix"))
    }
    ,
    window.requestAnimationFrame || (window.requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function(e) {
        return window.setTimeout(e, 16)
    }
    ,
    window.cancelAnimationFrame = window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || function(e) {
        window.clearTimeout(e)
    }
    ),
    t.animationFramePending = 0,
    t.animationFramePendingInfo = new Map,
    t.requestAnimationFrame = B,
    t.cancelAnimationFrame = N,
    t.printAnimationFramePendingInfo = j,
    t.isInt = Number.isInteger,
    t.isDomReady = H;
    let z, U, W, q;
    function Y(e, t) {
        return new Promise(function(n) {
            0,
            setTimeout(()=>{
                0,
                n(t)
            }
            , e)
        }
        )
    }
    function V(e) {
        return new Promise(function(t, n) {
            B(()=>{
                t(e)
            }
            )
        }
        )
    }
    function X(e, n=1e4, r) {
        let o = e();
        if (o && !(o instanceof Promise))
            return Promise.resolve(o);
        let s = Date.now()
          , i = s + n
          , l = !1;
        r = null == r ? 50 : r;
        let a = new Error("timeout")
          , c = (n,o,d)=>{
            let u = Date.now() - s;
            !l && u > 3e4 && (console.error(`tryWait() The wait has exceeded 30 seconds，ajax_pending_count=${t.ajaxCfg.ajax_pending_count}, requirejs_pending_count=${requirejs.requirejs_pending_count}, animationFramePending=${t.animationFramePending}`, a),
            l = !0),
            this.waitRender(null, d, 60).then(V, V).then(e).then(e=>{
                e ? n(e) : Date.now() > i ? o(a) : c(n, o, r)
            }
            )
        }
        ;
        return Promise.resolve(o).then(e=>e || new Promise((e,t)=>{
            c(e, t, r)
        }
        ))
    }
    function Z(e) {
        let t = document.getElementsByTagName("meta");
        for (let n = 0, r = t.length; n < r; n++) {
            let r = t[n];
            if (r.getAttribute("name") === e)
                return r.getAttribute("content")
        }
        return null
    }
    function G(e) {
        if (void 0 === U) {
            if (n.browser.nodejs)
                U = global.SUCC_CONTEXT_PATH;
            else {
                let e = document.getElementsByTagName("meta");
                for (let t = 0, n = e.length; t < n; t++) {
                    let n = e[t];
                    if ("succ-context-path" === n.getAttribute("name")) {
                        U = n.getAttribute("content");
                        break
                    }
                }
                if (void 0 === U) {
                    const e = "/dist/sys/sys-all.js";
                    let t = document.getElementsByTagName("script")
                      , n = location.protocol + "//" + location.host;
                    for (let r = 0, o = t.length; r < o; r++) {
                        const o = t[r].src;
                        if (o.includes(e)) {
                            let t = document.createElement("a");
                            t.href = o;
                            let r = t.protocol + "//" + t.host;
                            r !== n && (z = r),
                            U = t.pathname.substring(0, t.pathname.indexOf(e));
                            break
                        }
                    }
                }
            }
            null == U && (U = ""),
            null == z && (z = "")
        }
        return e ? kn(e) ? e : z + U + ("/" === e.charAt(0) ? e : "/" + e) : z + U
    }
    function J(e) {
        return e ? e.startsWith("data:") ? e : An(e = Q(e = e.replace("/static-file/", "/dist/"))) : e
    }
    function K(e) {
        return e ? e.startsWith("url(") ? e : 'url("' + J(e) + '")' : ""
    }
    function Q(e) {
        return e && e.startsWith("/") ? G(e) : e
    }
    function ee() {
        return ne().isProductEnv
    }
    function te() {
        return ne().buildNumber
    }
    function ne() {
        let e = W;
        return void 0 === e && (e = W = n.browser.nodejs ? {} : JSON.parse(Z("succ-product-info") || "{}")),
        e
    }
    function re() {
        let e = q;
        return void 0 === e && (e = q = n.browser.nodejs ? {} : JSON.parse(Z("succ-settings") || "{}")),
        e
    }
    function oe(e) {
        t.assign(t.LOCALEMSG.locale, e)
    }
    function se(e, n) {
        t.LOCALEMSG.lang = e,
        t.LOCALEMSG[e] = n,
        t.LOCALEMSG.locale = n
    }
    function ie(e, r, o, ...s) {
        let i = t.LOCALEMSG.locale;
        if (i) {
            let t = i[e];
            if (t) {
                if (null != r && t && t.indexOf("{") >= 0) {
                    let e = arguments;
                    return t.replace(/(\${0,1})\{([^{}]+)\}/g, function(t, n, o) {
                        let s, i = o.charCodeAt(0) - 48;
                        return null != (s = i >= 0 && i <= 9 ? Array.isArray(r) ? r[i] : e[i + 1] : o.endsWith("()") ? r[o.substring(0, o.length - 2)].call(r) : r[o]) ? s : t
                    })
                }
                return t
            }
        } else
            !n.browser.nodejs && console.error("国际化信息还没加载完成，不应该调用message函数", new Error);
        return "string" == typeof r ? r : void 0 !== o ? o.toString() : null === r ? null : e
    }
    function le(e) {
        "string" == typeof e && (e = {
            message: e
        });
        const t = e.message || e.errorCode;
        switch (e.type) {
        case "error":
        default:
            throw e instanceof Error ? e : Object.assign(new Error(""), e);
        case "warning":
            A(t);
            break;
        case "info":
            L(t)
        }
    }
    function ae(e, t) {
        console.error("显示异常对话框出现异常，原异常是："),
        console.error(e),
        console.error("新出现的异常是："),
        console.error(t),
        alert(e + "\n显示异常信息出错，详情请查看控制台！")
    }
    function ce(t) {
        var r;
        try {
            bt();
            let s = "string" == typeof t ? new Error(t) : t
              , l = s.message
              , a = s.errorCode;
            if (a && !l && (l = s.message = ie(a, s.properties)),
            "abort" === l || "cancel" === l)
                return;
            let c = null === (r = i.events) || void 0 === r ? void 0 : r.onShowError;
            if (c && !1 === c(s))
                return;
            if ("info" === s.errorType)
                return k(s.message || ie("sys.error.errorOccured"), 3e3);
            let d = re()["sys.basic.errorDialogStyle"];
            if ("quietly" === s.errorDialogStyle || "quietly" === d)
                return s.isNetworkFail || s.isRequireJsScriptError ? A(ie("sys.error.networkFailMessage.quietly", 3e3)) : A(ie("sys.error.showAcceptably"), 3e3);
            if (s.isNetworkFail || s.isRequireJsScriptError)
                return Me(s);
            n.browser.mobile ? new Promise((t,n)=>{
                e(["../commons/mobile/basic"], t, n)
            }
            ).then(__importStar).then(e=>e.showMobileErrorDialog(s)).catch(e=>ae(s, e)) : new Promise((t,n)=>{
                e(["../sys/sys-error"], t, n)
            }
            ).then(__importStar).then(e=>{
                e.ErrorDialog.getInstance().show(s)
            }
            ).catch(e=>ae(s, e))
        } catch (o) {
            ae(t, o)
        }
    }
    function de(e) {
        if (!e)
            return null;
        let t = e.indexOf("===SUCC=ERROR=INFO=START===");
        if (t >= 0 && (e = e.substring(t + 27)),
        e && e.includes("<html ") && e.includes("</html>"))
            return {
                message: e.substringBetween("<title>", "</title>"),
                causeMessage: e
            };
        e.startsWith("{") || (e = Je(e));
        let n = JSON.parse(e);
        return "ERROR" === (null == n ? void 0 : n.state) && n.error && (Object.assign(n, Mn(Je(n.error))),
        delete n.error),
        n
    }
    function ue(e) {
        window._current_error = e,
        ce(e)
    }
    t.wait = Y,
    t.waitRender = function(e, n=1, r=3e5) {
        let o = Date.now()
          , s = 0
          , i = new Error("waitRender timeout:" + r)
          , l = !1;
        return new Promise(function(a, c) {
            let d = (e,t=0)=>{
                let n = document.visibilityState
                  , r = Date.now();
                window.requestAnimationFrame(()=>{
                    "hidden" === n && Date.now() - r > 1e3 && (s += Date.now() - r - 1e3),
                    setTimeout(e, 1 + t)
                }
                )
            }
              , u = ()=>0 === t.ajaxCfg.ajax_pending_count && !requirejs.requirejs_pending_count && 0 === t.animationFramePending
              , h = ()=>{
                if (u())
                    return void d(()=>{
                        u() ? a(e) : h()
                    }
                    , n);
                let m = Date.now() - o;
                !l && m - s > 3e4 && (console.error(`waitRender() 已等待超过30s了，ajax_pending_count=${t.ajaxCfg.ajax_pending_count}, requirejs_pending_count=${requirejs.requirejs_pending_count}, animationFramePending=${t.animationFramePending}`, i),
                t.ajaxCfg.ajax_pending_count && me(),
                t.animationFramePending && j(),
                l = !0),
                r ? m - s < r ? d(h) : c(i) : d(h)
            }
            ;
            d(h)
        }
        )
    }
    ,
    t.waitAnimationFrame = V,
    t.tryWait = X,
    t.waitIframeRender = function(e, t=1e4, n) {
        return new Promise(function(r, o) {
            let s = e.id;
            ze(s) && (e.id = s = Re()),
            window[s] = function() {
                window[s] = null,
                e.onload = null,
                X(()=>e.contentWindow.document.title || null, t, n).then(()=>r(e.contentWindow))
            }
            ,
            e.onload = function() {
                setTimeout(()=>{
                    e.contentWindow.eval(`\n\t\t\t\tlet sz = require('sys/sys');//sys已经被require过了，可以直接这样，见 https://stackoverflow.com/questions/13225245/require-js-synchronous\n\t\t\t\tsz.waitRender(null,200).then(function(){\n\t\t\t\t\tparent.eval('window["${s}"]()');\n\t\t\t\t})`)
                }
                , 100)
            }
        }
        )
    }
    ,
    t.getMetaValue = Z,
    t.ctx = G,
    t.ctximg = J,
    t.cssimg = K,
    t.ctxIf = Q,
    t.isProductEnv = ee,
    t.getWarBuildnum = te,
    t.getProductVersion = function() {
        return ne().version
    }
    ,
    t.getProductInfo = ne,
    t.getMetaSettingInfo = re,
    t.setLocale = function(e) {}
    ,
    t.LOCALEMSG = {
        locale: null,
        lang: null
    },
    t.loadI18nMessages = oe,
    t.loadCustomI18nMessage = function(e) {
        let n = e[t.LOCALEMSG.lang];
        n && oe(n)
    }
    ,
    t.setI18nMessages = se,
    t.message = ie,
    t.subMessages = function(e) {
        return function(t) {
            return ie(e + "." + t)
        }
    }
    ,
    t.throwError = le,
    t.throwWarning = function(e) {
        "string" == typeof e && (e = {
            message: e
        }),
        le(e = Object.assign({}, e, {
            type: "warning"
        }))
    }
    ,
    t.throwInfo = function(e) {
        "string" == typeof e && (e = {
            message: e
        }),
        le(e = Object.assign({}, e, {
            type: "info"
        }))
    }
    ,
    t.alertError = ae,
    t.showError = ce,
    t.showErrorPage = function(t) {
        return new Promise((t,n)=>{
            e(["../sys/sys-error"], t, n)
        }
        ).then(__importStar).then(e=>(new e.ErrorPage).show(t)).catch(e=>le(e))
    }
    ,
    t.parseError = de,
    window.onerror = function(e, t, n, r, o) {
        "ResizeObserver loop limit exceeded" !== e && ue(o || new Error(e))
    }
    ;
    let he = window.promise_error_handler = (e=>{
        const t = e.reason;
        t instanceof Error && ("timeout" === t.requireType ? t.isNetworkFail = !0 : "scripterror" === t.requireType && (t.isRequireJsScriptError = !0)),
        t && ue(t)
    }
    );
    function me() {
        t.ajaxCfg.all_pending_xhr.forEach(e=>console.error("pending_xhr: %s,", e._url, e._stack))
    }
    function ge(e) {
        let t = [];
        for (let n in e)
            if (e.hasOwnProperty(n)) {
                let r = e[n];
                null != r && ("object" == typeof r && (r = JSON.stringify(r)),
                t.push(n + "=" + encodeURIComponent(r)))
            }
        return t.length > 0 ? t.join("&") : null
    }
    !n.browser.nodejs && window.addEventListener("unhandledrejection", he),
    t.ajaxCfg = {
        all_pending_xhr: [],
        ajax_total_count: 0,
        ajax_pending_count: 0,
        ajax_default_async: !0,
        latency: 0,
        keepAjaxArgs: !1,
        allAjaxArgs: [],
        keepAjaxResult: !1,
        allAjaxResults: [],
        success: null,
        error: null,
        xhr: function() {
            return new XMLHttpRequest
        }
    },
    t.printPendingXHRs = me,
    !n.browser.nodejs && Te(Fe(":keepAjaxArgs")) && (t.ajaxCfg.keepAjaxArgs = !0,
    t.ajaxCfg.keepAjaxResult = !0,
    window.ajaxCfg = t.ajaxCfg),
    t.getCookie = function(e) {
        function t(e) {
            return e.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent)
        }
        let n = {}
          , r = document.cookie ? document.cookie.split("; ") : []
          , o = 0;
        for (; o < r.length; o++) {
            let i = r[o].split("=")
              , l = i.slice(1).join("=");
            '"' === l.charAt(0) && (l = l.slice(1, -1));
            try {
                let r = t(i[0]);
                if (l = t(l),
                n[r] = l,
                e === r)
                    break
            } catch (s) {}
        }
        return e ? n[e] : n
    }
    ,
    t.encodeURIJSON = ge;
    const pe = "multipart/form-data";
    function fe(r) {
        let s = "string" == typeof r ? {
            url: r
        } : r;
        t.ajaxCfg.keepAjaxArgs && (t.ajaxCfg.allAjaxArgs || (t.ajaxCfg.allAjaxArgs = [])).push(s);
        let i, l, a = new Error, c = !(n.browser.nodejs || void 0 !== s.autoLogin && !s.autoLogin), d = void 0 === s.autoShowLoginDialog || !!s.autoShowLoginDialog, u = new Promise(function(e, t) {
            i = e,
            l = t
        }
        ), h = re();
        const m = h && h["security.protection.encryptAjaxData"]
          , g = "application/x-www-form-urlencoded";
        let p = s.contentType === pe;
        let f = p ? null : s.contentType || g
          , y = s.xhr && s.xhr() || t.ajaxCfg.xhr();
        let b = s.method && s.method.toUpperCase() || s.data && "POST" || "GET"
          , w = void 0 === s.async ? t.ajaxCfg.ajax_default_async : !!s.async
          , S = function(e, t) {
            return e ? "string" == typeof e ? e : p ? e : f === g || "GET" == t ? ge(e) : JSON.stringify(e) : null
        }(s.data, b)
          , C = s.url;
        if (y._url = C,
        y._stack = a.stack,
        null == C)
            throw new Error("The 'url' parameter can't be null.");
        let v = s.dataType;
        function x() {
            y.open(b, C, w),
            S && f && y.setRequestHeader("Content-type", f);
            let e = s.headers;
            if (e)
                for (let t in e)
                    e.hasOwnProperty(t) && y.setRequestHeader(t, e[t]);
            if (kn(C) || (e && e["X-Requested-With"] || y.setRequestHeader("X-Requested-With", "XMLHttpRequest"),
            m && y.setRequestHeader("X-Encrypt-Request", "true"),
            c || y.setRequestHeader("X-Cookie-Login", "false")),
            !1 !== w) {
                let e = t.ajaxCfg.all_pending_xhr;
                e.length > 1e3 && (me(),
                e.length = 0),
                e.push(y),
                v && (y.responseType = v),
                y.timeout = s.timeout || 18e5
            }
            t.ajaxCfg.ajax_total_count++,
            t.ajaxCfg.ajax_pending_count++,
            y.send(S)
        }
        function E(e, n) {
            t.ajaxCfg.ajax_pending_count--,
            t.ajaxCfg.all_pending_xhr.remove(e),
            s.complete && s.complete(e, n)
        }
        function M(r, o, i) {
            if (E(r, o),
            "abort" === o)
                return;
            if (s.error && !1 === s.error(r, o, i) || t.ajaxCfg.error && !1 === t.ajaxCfg.error(r, o, i))
                return;
            let c;
            i instanceof Error ? c = i : (c = a).errorThrown = i,
            c.xhr = r,
            c.httpStatus = r.status,
            c.textStatus = o;
            let u = t=>{
                let n = t.detailInfo
                  , r = Promise.resolve();
                if (n) {
                    let t, o;
                    for (const e in n)
                        if (n.hasOwnProperty(e) && "SQL" === e.toLocaleUpperCase()) {
                            t = n[e],
                            o = e;
                            break
                        }
                    t && (r = new Promise((t,n)=>{
                        e(["commons/beautify"], t, n)
                    }
                    ).then(__importStar).then(e=>{
                        let r = (new e.BeautifyCode).sql(t);
                        delete n[o],
                        n.SQL = r
                    }
                    ).catch(e=>{
                        console.error(`格式化SQL出错\n${e}`)
                    }
                    ))
                }
                return r.then(()=>{
                    l && l(t)
                }
                )
            }
            ;
            if (401 === r.status && !n.browser.nodejs && d)
                return new Promise((t,n)=>{
                    e(["../sys/sys-error"], t, n)
                }
                ).then(__importStar).then(e=>{
                    Object.assign(c, de(r.responseText));
                    let t = c.properties;
                    return e.onNeedLoginError({
                        error: c,
                        onsuccess: ()=>x(),
                        oncancel: ()=>u(c),
                        loginTime: t && t.loginTime,
                        loginIpAddress: t && t.loginIpAddress
                    })
                }
                ).catch(e=>ae(c, e));
            if ("timeout" === o)
                return c.isNetworkFail = !0,
                c.fn = x,
                ce(c);
            let h = ()=>{
                let t = r.responseURL && r.responseURL.substring((location.protocol + "//" + location.host).length);
                c.detailInfo || (c.detailInfo = {});
                let n = c.detailInfo;
                if (n.requestURL = C,
                t && !n.responseURL && t !== C && (n.responseURL = t),
                "POST" === b && (n.requestBody = S),
                404 === r.status)
                    !c.message && !c.errorCode && (c.errorCode = "err.http.404"),
                    c.location || (c.location = {
                        resPath: t
                    });
                else if (400 === r.status) {
                    let e = (c.message || "").trim();
                    if (e.startsWith("<!doctype html>") && e.endsWith("</html>")) {
                        let t = /<title>(.+)<\/title>/gm.exec(e);
                        if (t && t[1] && (c.message = t[1]),
                        (t = /<body>(.+)<\/body>/gm.exec(e)) && t[1]) {
                            let e = document.createElement("div");
                            e.innerHTML = t[1],
                            (c.detailInfo || (c.detailInfo = [])).push(e.innerText)
                        }
                    }
                } else if (403 === r.status)
                    return new Promise((t,n)=>{
                        e(["sys/sys-error"], t, n)
                    }
                    ).then(__importStar).then(e=>{
                        e.onPermissionError(c).then(e=>{
                            !1 !== e && u(c)
                        }
                        )
                    }
                    );
                u(c)
            }
              , m = e=>{
                ze(e) || (e && Object.assign(c, de(e)),
                c.message || (c.message = c.errorCode && ie(c.errorCode, c.properties) || c.className || c.textStatus))
            }
            ;
            try {
                let e = r.dataType;
                if (e || (e = r.getResponseHeader("Content-Type")) && (e = -1 === e.indexOf("/json") ? "text" : "json"),
                "json" === e) {
                    if ("blob" === s.dataType) {
                        let e = new FileReader;
                        return e.readAsText(r.response, "utf-8"),
                        void (e.onload = function() {
                            let t = e.result;
                            m(t),
                            h()
                        }
                        )
                    }
                    m(r.responseText)
                } else {
                    let e = r.responseText;
                    if (e) {
                        (c.detailInfo || (c.detailInfo = [])).push(e),
                        c.detailVisible = !0
                    }
                }
            } catch (g) {
                console.error(g)
            }
            h()
        }
        if ("html" === v && (v = "text"),
        C = Q(C),
        "GET" === b && (S && (C = C + (C.lastIndexOf("?") >= 0 ? "&" : "?") + S,
        S = null),
        C = !1 === s.cache ? C + (C.lastIndexOf("?") >= 0 ? "&" : "?") + "_=" + Math.round(1e12 * Math.random()) + Math.round(1e12 * Math.random()) : An(C)),
        z && (y.withCredentials = !0),
        y.onload = function() {
            let e = y.status;
            if (e >= 200 && e < 300 || 304 === e) {
                let e, r = v || y.responseType;
                if (!r) {
                    let e = y.getResponseHeader("Content-Type");
                    e ? -1 !== e.indexOf("/json") ? r = "json" : -1 !== e.indexOf("/xml") ? r = "xml" : -1 !== e.indexOf("text") && (r = "text") : r = "text"
                }
                switch (r) {
                case "json":
                    if (!(e = y.response) || "string" == typeof e)
                        try {
                            e = (e = e || y.responseText) ? JSON.parse(e) : null
                        } catch (n) {
                            return void M(y, "parsererror", n)
                        }
                    break;
                case "xml":
                    (e = y.responseXML) || (e = y.responseText) && (e = t.xml.loadStr(e));
                    break;
                case "text":
                    e = y.responseText;
                    break;
                default:
                    e = y.response || y.responseText
                }
                !function(e, n, r) {
                    E(r, n),
                    s.success && s.success(e, n, r),
                    i && i(e),
                    t.ajaxCfg.success && t.ajaxCfg.success(e, n, r),
                    t.ajaxCfg.keepAjaxResult && (t.ajaxCfg.allAjaxResults || (t.ajaxCfg.allAjaxResults = [])).push(e)
                }(e, y.statusText, y)
            } else
                M(y, y.statusText)
        }
        ,
        y.ontimeout = function(e) {
            M(y, "timeout", e)
        }
        ,
        y.onabort = function() {
            M(y, "abort")
        }
        ,
        y.onerror = function() {
            let e = new Error(ie("err.server.connect.fail"));
            e.isNetworkFail = !0,
            M(y, "ERR_CONNECTION_FAILED", e)
        }
        ,
        s.onprogress && (y.upload.onprogress = function(e) {
            s.onprogress(y, e)
        }
        ),
        s.ajaxTag && (y.ajaxTag = s.ajaxTag),
        !m || "POST" != b || C.startsWith("http://") || C.startsWith("https://"))
            x();
        else {
            let e = u;
            "string" == typeof S && (S = o.LZString.compressToBase64(S)),
            x(),
            u = e
        }
        return t.ajaxCfg.latency && (u = u.then(e=>Y(t.ajaxCfg.latency, e))),
        u
    }
    function ye(e) {
        return fe(Object.assign({
            contentType: "application/json"
        }, e))
    }
    function be(e, t, n) {
        return ye({
            url: e,
            method: "GET",
            dataType: n,
            data: t
        })
    }
    t.ajax = fe,
    t.abortAllAjax = function(e) {
        let n = t.ajaxCfg.all_pending_xhr
          , r = n.length
          , o = 0;
        if (r > 0) {
            for (let t = r - 1; t >= 0; t--) {
                let r = n[t];
                e && e != r.ajaxTag || (r.abort(),
                o++)
            }
            n.length = 0
        }
        return o
    }
    ,
    t.waitAjax = function(e) {
        let n = Date.now();
        return new Promise(function(r, o) {
            setTimeout(function s() {
                0 !== t.ajaxCfg.ajax_pending_count || requirejs.requirejs_pending_count ? !e || Date.now() - n < e ? setTimeout(s, 30) : o() : r()
            }, 1)
        }
        )
    }
    ,
    t.wget = function(e, t) {
        return fe({
            url: e,
            data: t
        })
    }
    ,
    t.rc = ye,
    t.rc_get = be;
    const we = {};
    t.rc1 = function(e, t, n) {
        let r = we
          , o = "string" == typeof e ? {
            url: e
        } : e;
        o.contentType = "application/json",
        n || (n = "api://" + o.url);
        let s = r[n];
        return s || (r[n] = fe(o).then(e=>(delete r[n],
        t ? t(e) : e)).catch(e=>{
            throw delete r[n],
            e
        }
        ))
    }
    ;
    const Se = {};
    t.timerv = function(e) {
        const t = Se
          , n = e.bindComponent
          , r = e.id;
        if (r && t[r]) {
            if (e.throwExists)
                throw new Error("timer " + r + " already exists!");
            return t[r]
        }
        let o, s, i = !1, l = (t=e.interval)=>{
            o = window.setTimeout(function() {
                o = 0,
                i || (s = window.requestAnimationFrame(a))
            }, "number" == typeof t ? t : t())
        }
        , a = ()=>{
            if (!i) {
                if (s = 0,
                !n || n.isDisplay())
                    return Promise.resolve(e.action()).catch(t=>{
                        if (t.xhr && 503 == t.xhr.status)
                            console.warn(t.message, t);
                        else {
                            if ("continue" !== e.errorMode)
                                throw t;
                            k(t.message, 5e3)
                        }
                    }
                    ).then(n=>{
                        !1 === n || i || e.interval <= 0 ? r && delete t[r] : l()
                    }
                    );
                l()
            }
        }
        ;
        l(e.delay || 0);
        let c = {
            cancel: ()=>{
                r && delete t[r],
                s && N(s),
                o && clearTimeout(o),
                i = !0
            }
        };
        return r && (t[r] = c),
        c
    }
    ,
    t.cancelTimerv = function(e) {
        var t;
        null === (t = Se[e]) || void 0 === t || t.cancel()
    }
    ,
    t.awaitRemoteSignal = function(e, t) {
        return null
    }
    ;
    class ServiceTaskPromise extends Promise {
        constructor(e) {
            super(()=>{}
            ),
            this.args = e;
            let n = e.url
              , r = e.uuid;
            if (this.taskId = r,
            this.taskNode = e.taskNode,
            this.queryLog = null == e.queryLog || e.queryLog,
            this.logIndex = 0,
            this.promiseChain = [],
            this.listeners = [],
            this.addProgressChangeListener(e.onprogresschange),
            n) {
                this.startTime = Date.now(),
                this.maxHttpHoldTime = e.maxHttpHoldTime,
                this.taskDesc = e.desc,
                this.xhr = e.xhr || new XMLHttpRequest,
                this.xhr._rcPromise = this;
                let r = ()=>{
                    let r = e=>(e = Be(":rcuuid", this.taskId, e),
                    e = Be(":rcdesc", this.taskDesc, e),
                    this.maxHttpHoldTime && (e = Be(":rctimeout", this.maxHttpHoldTime, e)),
                    e)
                      , o = {
                        contentType: "application/json",
                        url: n,
                        data: e.data,
                        xhr: ()=>this.xhr,
                        error: e.error
                    };
                    return e.beforePromise ? e.beforePromise.then(e=>(t.assign(o, e.ajaxArgs),
                    o.url = r(o.url),
                    {
                        ajaxArgs: o,
                        otherArgs: e.otherArgs
                    })) : (o.url = r(o.url),
                    Promise.resolve({
                        ajaxArgs: o
                    }))
                }
                ;
                this.innerPromise = r().then(t=>e.afterProcess ? fe(t.ajaxArgs).then(n=>e.afterProcess(n, t)) : fe(t.ajaxArgs)),
                this.innerPromise.then(e=>{
                    this.setResult(e)
                }
                , e=>{
                    this.setError(e)
                }
                ),
                this.taskId && this.startPoll1(1e3)
            } else {
                if (!r)
                    throw new Error("url和uuid必须至少传递一个");
                this.taskHttpDisconnected = !0,
                !1 !== e.startPoll && this.startPoll1(0)
            }
        }
        setResult(e, t) {
            if (this.xhr && 202 === this.xhr.status && !this.taskHttpDisconnected)
                return this.taskHttpDisconnected = !0,
                this.stopPoll(),
                void this.startPoll1(0);
            this.isCompleted() || (this.result = void 0 === e ? null : e,
            t ? this.doProgressChange(t) : this.result && "DONE" === this.result.state ? this.doProgressChange(this.result) : this.doProgressChange({
                state: "DONE"
            }),
            this.promiseChain && this.promiseChain.forEach(e=>{
                e.onfulfilled(this.result)
            }
            ),
            this.clear())
        }
        setError(e, t) {
            if (this.isCompleted())
                return;
            "string" == typeof e && (e = JSON.parse(Je(e))),
            this.error = e;
            let n = e;
            n && n.error && (n = n.error);
            let r = !1;
            if (!t) {
                let n = null == e ? void 0 : e.httpStatus;
                if (499 === n)
                    t = {
                        state: "CANCEL",
                        error: e
                    },
                    r = !0;
                else {
                    if (504 === n)
                        return this.taskHttpDisconnected = !0,
                        void this.disconnectTaskHttpConnection();
                    t = {
                        state: "ERROR",
                        error: e
                    }
                }
            }
            this.doProgressChange(t),
            this.promiseChain && !r && this.promiseChain.forEach(e=>{
                e.onrejected(n)
            }
            ),
            this.clear()
        }
        disconnectTaskHttpConnection() {
            return ye({
                url: "/api/tasks/services/disconnectTaskHttpConnection",
                data: {
                    taskId: this.taskId,
                    taskNode: this.taskNode
                }
            })
        }
        clear() {
            this.timer && clearTimeout(this.timer),
            this.timer = null,
            this.promiseChain = null,
            this.listeners.length = 0
        }
        startPoll1(e) {
            let t = ()=>(null == this.interval ? this.interval = 100 : 100 == this.interval ? this.interval = 500 : this.interval >= 505 && this.interval < 2e3 ? this.interval += 500 : this.interval += 1,
            this.interval)
              , n = ()=>{
                if (this.isCompleted())
                    return;
                let e = ()=>this.maxHttpHoldTime > 0 && Date.now() - this.startTime > this.maxHttpHoldTime;
                this.taskHttpDisconnected || this.listeners.length > 0 ? ye({
                    url: "/api/tasks/services/getTaskInfo",
                    data: {
                        taskId: this.taskId,
                        taskNode: this.taskNode,
                        logIndex: this.queryLog ? this.logIndex : -1
                    }
                }).then(e=>{
                    if (!e || this.result)
                        return;
                    if (this.logIndex = null != e.logIndex ? e.logIndex : 0,
                    this.loadPollInfo = e,
                    void 0 === this.startTime && (this.startTime = e.startTime,
                    this.taskDesc = e.desc),
                    this.isCompleted())
                        return;
                    let r = e.state;
                    if ("ERROR" != r) {
                        if ("WAITING" == r || "RUNNING" == r)
                            return this.doProgressChange(e),
                            void (this.timer = setTimeout(n, t()));
                        if ("DONE" == r)
                            return e.noResult ? void this.setResult(null, e) : void (this.taskHttpDisconnected && ye({
                                url: "/api/tasks/services/getTaskResult",
                                data: {
                                    taskId: this.taskId
                                }
                            }).then(t=>{
                                this.setResult(t, e)
                            }
                            , e=>{
                                this.setError(e)
                            }
                            ));
                        if ("CANCEL" != r)
                            throw new Error("unknown state " + JSON.stringify(e));
                        this.doProgressChange(e)
                    } else
                        this.setError(e.error, e)
                }
                , r=>{
                    if (r && 404 == r.httpStatus) {
                        if (this.taskHttpDisconnected || this.isCompleted())
                            return;
                        if (this.innerPromise && !this.loadPollInfo && !e())
                            return void (this.timer = setTimeout(n, t()));
                        return (null != this.innerPromise ? Promise.race([this.innerPromise, Y(1e4)]) : Y(1e3)).then(()=>{
                            this.isCompleted() || this.setError(r)
                        }
                        )
                    }
                    this.setError(r)
                }
                ) : this.timer = setTimeout(n, t())
            }
            ;
            this.timer = setTimeout(n, e)
        }
        getLogIndex() {
            return this.logIndex
        }
        stopPoll() {
            this.timer && clearTimeout(this.timer),
            this.timer = null
        }
        startPoll() {
            this.logIndex = 0,
            this.startPoll1(0)
        }
        getTaskId() {
            return this.taskId
        }
        getState() {
            return this.state
        }
        then(e, t) {
            let n = this.error ? this.error.error || this.error : null;
            if (null != n)
                try {
                    if (t) {
                        let e = t(n);
                        return Promise.resolve(e)
                    }
                    return Promise.reject(n)
                } catch (o) {
                    return Promise.reject(o)
                }
            let r = this.result;
            if (void 0 !== r)
                try {
                    return r = e ? e(r) : r,
                    Promise.resolve(r)
                } catch (o) {
                    return Promise.reject(o)
                }
            return new Promise((n,r)=>{
                this.promiseChain && this.promiseChain.push({
                    onfulfilled: t=>{
                        try {
                            t = e ? e(t) : t,
                            n(t)
                        } catch (o) {
                            r(o)
                        }
                    }
                    ,
                    onrejected: e=>{
                        try {
                            if (t) {
                                let r = t(e);
                                n(r)
                            } else
                                r(e)
                        } catch (o) {
                            r(o)
                        }
                    }
                })
            }
            )
        }
        isCompleted() {
            let e = this.state;
            return "CANCEL" === e || "DONE" === e || "ERROR" === e
        }
        cancel(e) {
            let t = this.taskId;
            if (!this.isCompleted())
                return this.doProgressChange({
                    state: "CANCEL"
                }),
                this.clear(),
                this.xhr && this.xhr.abort(),
                t ? ye({
                    url: "/api/tasks/services/cancelTask",
                    data: {
                        taskId: t,
                        waitCancel: e
                    }
                }) : void 0
        }
        addProgressChangeListener(e) {
            e && this.listeners.push(e)
        }
        doProgressChange(e) {
            if (!this.isCompleted()) {
                this.state = e.state;
                for (const t of this.listeners)
                    t(e)
            }
        }
    }
    t.ServiceTaskPromise = ServiceTaskPromise,
    t.rc_task = function(e) {
        if (!e.url && e.uuid) {
            let n = t.ajaxCfg.all_pending_xhr;
            for (let t = n.length - 1; t >= 0; t--) {
                let r = n[t]._rcPromise;
                if (r && r.taskId === e.uuid)
                    return r
            }
        }
        return new ServiceTaskPromise(e)
    }
    ;
    let Ce, ve = {};
    function xe(e) {
        let t, n = typeof e;
        if (null == e || "string" === n || "boolean" === n || "number" === n)
            return e;
        if (e instanceof Array) {
            t = [];
            for (let n = 0, r = e.length; n < r; n++)
                t[n] = xe(e[n]);
            return t
        }
        if (Ee(e)) {
            t = {};
            for (let n in e)
                if (e.hasOwnProperty(n)) {
                    let r = e[n];
                    t[n] = xe(r)
                }
            return t
        }
        return e
    }
    function Ee(e) {
        return !!e && (("object" != typeof e || 1 !== e.nodeType || "string" != typeof e.nodeName) && !(e.constructor && !e.hasOwnProperty("constructor") && !e.constructor.prototype.hasOwnProperty("isPrototypeOf")))
    }
    function Me(e) {
        let t = !!e.fn
          , r = e.isRequireJsScriptError
          , o = e.requireModules;
        if (Ce)
            Ce.dialog.style.display = "block";
        else {
            let r = (Ce = {}).dialog = document.createElement("div")
              , o = Ce.titleDom = document.createElement("div")
              , s = Ce.messageDom = document.createElement("div")
              , i = Ce.btn = document.createElement("span")
              , l = Ce.btn2 = document.createElement("span");
            o.className = "errordialog-network-title",
            s.className = "errordialog-network-message",
            i.className = "errordialog-network-retry",
            i.addEventListener("click", function() {
                r.style.display = "none",
                t ? e.fn() : location.reload()
            }),
            l.className = "errordialog-network-close",
            l.innerText = ie("sys.error.close"),
            l.addEventListener("click", function() {
                r.style.display = "none"
            }),
            r.id = "dialog-network-fail",
            r.className = "errordialog-network",
            n.browser.mobile && r.classList.add("mobile"),
            r.appendChild(o),
            r.appendChild(s),
            r.appendChild(i),
            r.appendChild(l),
            document.body.appendChild(r)
        }
        Ce.titleDom.textContent = ie(`sys.error.${r ? "scriptError" : "networkFail"}`),
        Ce.messageDom.textContent = r ? ie("sys.error.scriptErrorMessage", !ze(o) && o.join(", ")) : ie("sys.error.networkFailMessage"),
        Ce.btn.textContent = ie(`sys.error.${t ? "retry" : "reload"}`)
    }
    function Te(e, t=!1) {
        if ("boolean" == typeof e)
            return e;
        if (e && "string" == typeof e) {
            if ("true" === (e = e.toLowerCase()) || "t" === e || "1" === e)
                return !0;
            if ("false" === e || "f" === e || "0" === e)
                return !1
        }
        return "number" == typeof e ? !(0 == e) : !!t
    }
    function De(e) {
        let t = G();
        if (!e)
            return e = decodeURI(window.location.pathname),
            "/" === t ? e : e.substring(t.length);
        let n = e.match(/^(\w+:\/\/)/)
          , r = n && n.length
          , o = e.indexOf("/", r ? n[0].length : 0);
        if (-1 == o)
            return e;
        let s = e.indexOf("?")
          , i = e.indexOf("#")
          , l = e.substring(o, Math.min(-1 == s ? e.length : s, -1 == i ? e.length : i));
        return r && (l = l.substring(t.length, l.length)),
        l.startsWith("/") || (l = "/" + l),
        l
    }
    function Pe(e=window) {
        let t = G()
          , n = e.location
          , r = n.pathname
          , o = r.lastIndexOf(";jsessionid=");
        -1 !== o && (r = r.substr(0, o));
        let s = n.search || "";
        return decodeURI("/" === t ? r : r.substring(t.length) || "/") + s
    }
    function Ie(e) {
        e || (e = window.location.href);
        let t = e.indexOf("?");
        if (-1 === t)
            return {};
        let n = e.substr(t + 1)
          , r = n.indexOf("#");
        r >= 0 && (n = n.substr(0, r));
        let o = new URLSearchParams(n)
          , s = {};
        return o.forEach((e,t)=>{
            null == s[t] && (s[t] = e)
        }
        ),
        s
    }
    function _e(e, t) {
        let n = {
            path: De(e),
            params: Ie(e)
        };
        return t && (n.event = t),
        n
    }
    t.getJsonConf = function(e) {
        let t = ve[e];
        return t ? Promise.resolve(xe(t)) : fe({
            url: e,
            method: "GET",
            cache: !0,
            dataType: "json",
            success: function(t) {
                ve[e] = xe(t)
            }
        })
    }
    ,
    t.assign = Object.assign,
    t.clone = xe,
    t.deleteUndefined = function(e, t) {
        let n = !1 !== (null == t ? void 0 : t.recursively)
          , r = (e,o=0)=>{
            if (o >= 30 || "object" != typeof e || ze(e))
                return;
            let s = Object.keys(e);
            for (const i of s) {
                let s = e[i];
                void 0 === s || (null == t ? void 0 : t.deleteNull) && null === s ? delete e[i] : null != s && (n && r(s, o + 1),
                Array.isArray(s) && 0 == s.length ? (null == t ? void 0 : t.deleteEmtpyArray) && delete e[i] : "object" != typeof s || 0 != Object.keys(s).length || (null == t ? void 0 : t.deleteEmptyObject) && delete e[i])
            }
        }
        ;
        return r(e),
        e
    }
    ,
    t.deepAssign = function e(t={}, ...n) {
        let r, o, s, i, l, a = 0, c = n.length;
        e: for (; a < c; a++)
            if (null != (r = n[a])) {
                if (Array.isArray(r)) {
                    for (let e = 0, n = r.length; e < n; e++)
                        t[e] = r[e];
                    continue e
                }
                t: for (s in r)
                    if (i = t[s],
                    t !== (l = r[s]))
                        if (l)
                            if (Array.isArray(l)) {
                                for (let e = a + 1; e < c; e++)
                                    if (void 0 !== (o = n[e])[s])
                                        continue t;
                                t[s] = xe(l)
                            } else
                                Ee(l) && !Ee(i) ? t[s] = xe(l) : Ee(l) ? t[s] = e(i || {}, l) : t[s] = l;
                        else
                            void 0 !== l && (t[s] = l)
            }
        return t
    }
    ,
    t.isPlainObject = Ee,
    t.REQUIREJS_PATHCONFIG = {
        jquery: ["sys/jquery/dist/jquery.min"],
        vue: ["sys/vue/dist/vue.min"],
        localforage: ["sys/localforage.min"],
        d3: ["commons/d3/dist/d3"],
        three: ["commons/three/build/three.min"],
        "stats.js": ["commons/three/build/stats.min"],
        "dat.gui": ["commons/dat.gui/build/dat.gui.min"],
        "vis-network": ["commons/vis-network/dist/vis-network.min"],
        mxgraph: ["commons/mxgraph/mxClient.min"],
        cytoscape: ["commons/cytoscape/dist/cytoscape.umd"],
        less: ["commons/less/dist/less.min"],
        html2canvas: ["commons/html2canvas/dist/html2canvas.min"],
        vs: ["commons/monaco/min/vs"],
        leaflet: ["commons/leaflet/dist/leaflet"],
        marked: ["commons/marked/marked.min"],
        hammerjs: ["commons/hammerjs/hammer.min"],
        "file-saver": ["commons/file-saver/dist/FileSaver.min"],
        jspdf: ["commons/jspdf/dist/jspdf.min"],
        "pdfjs-dist/build/pdf": ["commons/pdfjs-dist/build/pdf.min"],
        "pdfjs-dist/web/pdf_viewer": ["commons/pdfjs-dist/web/pdf_viewer"],
        rbush: ["gismap/rbush/rbush.min"],
        canvg: ["commons/canvg/dist/browser/canvg.min"],
        rgbcolor: ["commons/rgbcolor/index"],
        "stackblur-canvas": ["commons/stackblur-canvas/dist/stackblur.min"],
        quilljs: ["commons/quill/dist/quill.min"],
        "commons/tinymce/tinymce": ["commons/tinymce/tinymce-all"],
        "commons/hls/hls": ["commons/hls/hls.min"],
        "commons/barcode/barcode": ["commons/barcode/barcode-all"]
    },
    !n.browser.nodejs && requirejs.config({
        baseUrl: G("/dist/"),
        waitSeconds: 60,
        paths: t.REQUIREJS_PATHCONFIG,
        shim: {
            jspdf: {
                deps: ["commons/jspdf/dist/jspdf.node.min"]
            },
            "pdfjs-dist/web/pdf_viewer": {
                deps: ["css!commons/pdfjs-dist/web/pdf_viewer.css"]
            },
            canvg: {
                deps: ["rgbcolor", "stackblur-canvas"]
            },
            "mapbox-gl": {
                deps: ["css!commons/mapbox-gl/dist/mapbox-gl.css"]
            },
            quilljs: {
                deps: ["css!commons/quill/dist/quill.core.css"]
            },
            "dat.gui": {
                deps: ["css!commons/dat.gui/build/dat.gui.css"]
            }
        },
        map: {
            "*": {
                "monaco-editor": "vs/editor/editor.main"
            }
        },
        bundles: {
            "sys/sys-all": ["sys/sys", "sys/sys-color", "sys/sys-date", "types", "sys/lz-string"],
            "metadata/syssettings/syssettings-all": ["metadata/syssettings/syssettings", "metadata/syssettings/syssettings-appearance", "metadata/syssettings/syssettings-sysinfo", "metadata/syssettings/syssettings-console", "metadata/syssettings/syssettings-i18n", "metadata/syssettings/syssettings-jvmthreadstack", "metadata/syssettings/syssettings-license", "metadata/syssettings/syssettings-log", "metadata/syssettings/syssettings-loginPage", "metadata/syssettings/syssettings-homePage", "metadata/syssettings/syssettings-maintenance", "metadata/syssettings/syssettings-opensignin", "metadata/syssettings/syssettings-securityConf", "metadata/syssettings/syssettings-sysackup", "metadata/syssettings/syssettings-syscache", "metadata/syssettings/syssettings-cluster", "metadata/syssettings/syssettings-trustedapps", "metadata/syssettings/syssettings-wework", "metadata/syssettings/syssettings-sso", "metadata/syssettings/syssettings-remote-services"],
            "dw/dwapi-all": ["dw/dwapi", "dw/dwdps"],
            "dw/dwbuilder-all": ["dw/dwbuilder", "dw/dataflow/nodeimpl"],
            "dw/dwtable-all": ["dw/dwtable", "dw/dataflow/nodeeditor", "dw/dataflow/dataflow"],
            "metadata/metadata-all": ["metadata/metadata", "metadata/metadata-script-api", "metadata/gisapi"],
            "commons/richtext/richtext-all": ["commons/richtext/richtext"],
            "commons/codebox/codebox-all": ["commons/codebox/codebox"],
            "commons/echarts/echarts-all": ["echarts", "commons/echarts/echarts-ext", "commons/echarts/echarts-leaflet", "echarts-wordcloud"],
            "commons/mapboxgl/mapboxgl-all": ["mapbox-gl", "commons/echarts/mapboxgl-leaflet", "turf"],
            "commons/exp/exp-all": ["commons/exp/expeval", "commons/exp/expcompiler", "commons/exp/exped"],
            "commons/basic-all": ["commons/basic", "commons/date"],
            "commons/mobile/basic-all": ["commons/mobile/basic", "commons/mobile/filterbar", "commons/mobile/mgrid", "commons/mobile/mlist", "commons/mobile/selector", "commons/mobile/settingslist", "commons/mobile/napi"],
            "commons/mobile/signpanel-all": ["signature_pad", "commons/mobile/signpanel"],
            "ana/ana-all": ["ana/anabasic", "ana/builder", "ana/anabrowser", "ana/calculator", "ana/compiler", "ana/datamgr"],
            "ana/rpt/rpt-all": ["ana/rpt/report", "ana/rpt/reportbuilder", "ana/rpt/reportcalculator", "ana/rpt/reportconfig", "ana/rpt/reportcompiler", "ana/rpt/reportdatamgr", "ana/rpt/components/inputs", "ana/rpt/components/media"],
            "ana/dashboard/dashboard-all": ["ana/dashboard/dashboard", "ana/dashboard/dashboardbuilder", "ana/dashboard/dashboardconfig", "ana/dashboard/dashboardcalculator", "ana/dashboard/dashboardcompiler", "ana/dashboard/dashboarddatamgr", "ana/dashboard/components/embed", "ana/dashboard/components/inputs", "ana/dashboard/components/layout", "ana/dashboard/components/gismap", "ana/dashboard/components/others", "ana/dashboard/components/tables", "ana/dashboard/components/charts", "ana/dashboard/components/databar", "ana/dashboard/components/iconbar", "ana/dashboard/components/shape", "ana/dashboard/components/timeline", "ana/dashboard/components/echartsutil"],
            "app/superpage/superpage-all": ["app/superpage/superpage", "app/superpage/superpagebuilder", "app/superpage/superpageconfig", "app/superpage/superpagecalculator", "app/superpage/superpagecompiler", "app/superpage/superpagedatamgr", "app/superpage/components/embed", "app/superpage/components/inputs", "app/superpage/components/layout", "app/superpage/components/navigations", "app/superpage/components/others", "app/superpage/components/tables"],
            "app/app-all": ["app/miniapp", "app/mobilepage", "app/templatepage"],
            "app/appdsn-all": ["app/miniappdsn", "app/datadsn", "app/scriptdsn", "app/templatepagedsn", "app/settingsdsn"],
            "fapp/fapp-builder-all": ["fapp/fappconfig", "fapp/fappbuilder"],
            "fapp/fapp-datamgr-all": ["fapp/form/fappdatamgr", "fapp/form/fappdatapackage", "fapp/form/fappcalculator"],
            "fapp/fapp-browse-all": ["fapp/browser/fappbrowsedatamgr", "fapp/browser/fappbrowser", "fapp/browser/fappbrowserdesktop", "fapp/browser/fappbrowsermobile", "fapp/browser/fappbrowser-api", "fapp/browser/fappviewlets"],
            "fapp/fapp-dsn-all": ["fapp/dsn/fappdsn", "fapp/dsn/fappdsn-ext"],
            "fapp/fapp-fill-all": ["fapp/fappbasic", "fapp/components/fapp-inputs", "fapp/components/fapp-layouts", "fapp/components/fapp-others", "fapp/form/fappdataeditor", "fapp/form/fappdataeditordesktop", "fapp/form/fappdataeditormobile"],
            "commons/table-all": ["commons/table-extra", "commons/table", "commons/extable", "commons/dtable", "commons/olaptable", "commons/olaptable2"],
            "office/word/activeDoc-all": ["office/word/activeDoc"]
        },
        urlArgs: function(e, t) {
            if (t.startsWith("//") || t.includes("://"))
                return "";
            let n = G();
            if (n && (t = t.substring(n.length)),
            t.startsWith("/dist/")) {
                if (ee()) {
                    if (t.indexOf("?") < 0)
                        return "?v=" + te();
                    if (!Fe("v", t))
                        return "&v=" + te()
                }
                return ""
            }
            if (-1 === t.indexOf("?") && !t.startsWith("/api/")) {
                let e = "";
                t.endsWith(".js") || t.endsWith(".css") || t.endsWith(".json") || (e = ".js");
                let n = window.SUCC_META_REPOSITORY;
                if (n) {
                    let r = t.startsWith("/extension/") ? n.getExtensionsEtagVersion() : n.getFileEtagVersion(t);
                    if (r)
                        return `${e}?v=${r}`
                }
                return e
            }
            return ""
        },
        urlPrefix: e=>An(e)
    }),
    t.importWithLogin = function(t) {
        return new Promise((n,r)=>{
            e([t], n, r)
        }
        ).then(__importStar).then(r=>{
            let o = r.SVR_ERROR_INFO;
            if (!o)
                return r;
            if (requirejs.undef(t),
            "err.login.notlogin" === o.errorCode && !n.browser.nodejs)
                return new Promise((t,n)=>{
                    e(["../sys/sys-error"], t, n)
                }
                ).then(__importStar).then(n=>new Promise((r,s)=>{
                    n.DeFault401Handler.getInstance().handle({
                        onsuccess: ()=>{
                            new Promise((n,r)=>{
                                e([t], n, r)
                            }
                            ).then(__importStar).then(r, e=>{
                                requirejs.undef(t),
                                s(e)
                            }
                            )
                        }
                        ,
                        oncancel: ()=>{
                            throw o
                        }
                    })
                }
                ));
            throw o
        }
        )
    }
    ,
    t.showNetworkOrScriptError = Me,
    t.parseBool = Te,
    t.getUrlPath = De,
    t.getUrl = Pe,
    t.getUrlParameters = Ie,
    t.encodeUrlInfo = function(e) {
        let t;
        t = "string" == typeof e ? e : Ne(e.params, e.path || "");
        return t
    }
    ,
    t.parseUrl = _e;
    let $e, Le, Ae = null;
    function ke(e) {
        const t = function() {
            if (!Ae) {
                Ae = new Array(256);
                for (let e = 0; e < 256; ++e)
                    Ae[e] = (e + 256).toString(16).substr(1)
            }
            return Ae
        }();
        return e.map(e=>t[e]).join("")
    }
    function Oe() {
        let e = new Array(16);
        for (let t, n = 0; n < 16; n++)
            0 == (3 & n) && (t = 4294967296 * Math.random()),
            e[n] = t >>> ((3 & n) << 3) & 255;
        return e[6] = 15 & e[6] | 64,
        e[8] = 63 & e[8] | 128,
        e
    }
    function Re() {
        return ke(Oe())
    }
    function Fe(e, t) {
        "string" != typeof t && (t = window.location.search);
        let n = t.indexOf("?");
        -1 != n && (t = t.substring(n + 1));
        let r = t.indexOf("#");
        return r >= 0 && (t = t.substr(0, r)),
        new URLSearchParams(t).get(e) || ""
    }
    function Be(e, t, n, r=!0) {
        return Ne({
            [e]: t
        }, n, r)
    }
    function Ne(e, t, n=!0) {
        let o;
        t || (o = location.pathname,
        t = location.search);
        let s = t.indexOf("?");
        -1 != s ? (o = t.substring(0, s),
        t = t.substring(s + 1)) : (o = t,
        t = "");
        let i = new URLSearchParams(t);
        for (let a in e) {
            let t = e[a];
            null == t || Array.isArray(t) && !t.length || ("object" != typeof t && "function" != typeof t || t.valueOf && (t = t.valueOf()),
            Array.isArray(t) ? t = r.formatMultiValue(t, ",") : "object" == typeof t ? t = JSON.stringify(t) : t += "",
            n ? i.set(a, t) : i.has(a) || i.set(a, t))
        }
        let l = i.toString().replaceAll("%3A", ":");
        return "" != l && (o += "?"),
        o + l
    }
    function je(e) {
        if (!e)
            return;
        let t = function() {
            if ($e)
                return document.body.appendChild($e),
                $e;
            {
                let e = document.createElement("iframe");
                return e.setAttribute("id", "_download_hi_"),
                e.setAttribute("name", "_download_hi_"),
                e.style.display = "none",
                document.body.appendChild(e),
                $e = e,
                e
            }
        };
        if ("string" == typeof e) {
            if (n.browser.ios)
                window.open(J(e));
            else {
                t().src = J(e)
            }
            return
        }
        let r = 1 === e.nodeType ? e : e.target || e.srcElement;
        r && 1 === r.nodeType && (r.target || (r.target = "_download_hi_"),
        t())
    }
    function He(e) {
        let t = typeof e;
        return ("number" === t || "string" === t) && !isNaN(e - parseFloat(e))
    }
    function ze(e) {
        if (null == e || "" === e)
            return !0;
        let t = typeof e;
        if ("number" === t)
            return !!isNaN(e);
        if ("boolean" === t)
            return !1;
        if ("object" === t) {
            if (Array.isArray(e) && !e.length)
                return !0;
            for (let t in e)
                return !1;
            return !0
        }
        return !1
    }
    function Ue(e, t, n=10) {
        if (e === t)
            return !0;
        if (n-- <= 0)
            return !1;
        if (Ee(e)) {
            if (!Ee(t))
                return !1;
            for (let r in e)
                if (!Ue(e[r], t[r], n))
                    return !1;
            for (let r in t)
                if (!Ue(e[r], t[r], n))
                    return !1;
            return !0
        }
        if (Array.isArray(e)) {
            if (!Array.isArray(t) || e.length != t.length)
                return !1;
            for (let r = 0, o = e.length; r < o; r++)
                if (!Ue(e[r], t[r], n))
                    return !1;
            return !0
        }
        return !1
    }
    t.uuid = Re,
    t.uuidBase64 = function() {
        return window.btoa(String.fromCharCode.apply(null, Oe()))
    }
    ,
    t.formatHtml = function(e) {
        return ze(e) ? "" : (e += "") ? e.replace(/\&/g, "&amp;").replace(/\>/g, "&gt;").replace(/\</g, "&lt;").replace(/\"/g, "&quot;").replace(/ /g, "&nbsp;").replace(/	/g, "&nbsp;&nbsp;&nbsp;&nbsp;").replace(/\r\n/g, "<br/>").replace(/\n/g, "<br/>").replace(/\r/g, "<br/>") : null
    }
    ,
    t.wildcard2Regex = function(e) {
        let t = []
          , n = e;
        for (let r = 0, o = n.length; r < o; r++) {
            let e = n.charAt(r);
            switch (e) {
            case "*":
                t.push(".*");
                break;
            case "?":
                t.push(".");
                break;
            case "(":
            case ")":
            case "[":
            case "]":
            case "$":
            case "^":
            case ".":
            case "{":
            case "}":
            case "|":
            case "\\":
                t.push("\\"),
                t.push(e);
                break;
            default:
                t.push(e)
            }
        }
        return t.join("")
    }
    ,
    t.getUrlParameter = Fe,
    t.setUrlParameter = function(e, t, n) {
        return Be(e, t, n, !0)
    }
    ,
    t.addUrlParameter = Be,
    t.addUrlParameters = Ne,
    t.xml = {
        createDoc: function(e, t, n) {
            let r;
            return r = document.implementation && document.implementation.createDocument ? document.implementation.createDocument(e, t, n) : new ActiveXObject("Microsoft.XMLDOM")
        },
        toStr: function(e) {
            let t = e.xml;
            if (t)
                return t;
            let r = null;
            return n.browser.msie && 11 === n.browser.version && (r = e.getAttribute("xmlns")),
            t = (new XMLSerializer).serializeToString(e),
            null != r && (t = t.replace('xmlns="' + r + '"', "")),
            t
        },
        loadStr: function(e) {
            let t;
            try {
                (t = new ActiveXObject("Microsoft.XMLDOM")).async = "false",
                t.loadXML(e)
            } catch (n) {
                try {
                    t = (new DOMParser).parseFromString(e, "text/xml")
                } catch (n) {
                    alert(n.message)
                }
            }
            return t
        },
        formatXml: function(e) {
            if (!e)
                return e;
            e = "string" == typeof e ? e : e.toStr(e);
            let t = []
              , n = /(>)(<)(\/*)/g;
            e = e.replace(n, "$1\n$2$3"),
            n = /(<)(\S*?)([^>]*>)(\s*?)(<\/\2>)/g,
            e = e.replace(n, "$1$2$3$5");
            let r = 0
              , o = ["", "\t", "\t\t", "\t\t\t"]
              , s = function(e) {
                let t = o[e];
                return void 0 === t && (o[e] = t = "\t" + s(e - 1)),
                t
            };
            return e.split(/[\r\n]+/).forEach(function(e) {
                let n = 0;
                (e = e.replace(/^\s*/, "")).match(/.+<\/\w[^>]*>$/) ? n = 0 : e.match(/^<\/\w/) ? 0 != r && (r -= 1) : n = e.match(/^<\w[^>]*[^\/]>.*$/) ? 1 : 0,
                t.push(s(r) + e),
                r += n
            }),
            t.join("\n")
        }
    },
    t.downloadFile = function(t, r) {
        n.browser.mobile ? new Promise((t,n)=>{
            e(["commons/mobile/napi"], t, n)
        }
        ).then(__importStar).then(e=>{
            e.napi.downloadFile(t, r)
        }
        ) : je(t)
    }
    ,
    t.downloadFileInBrowser = je,
    t.isNumeric = He,
    t.inferDateFormat = function(e) {
        if (e)
            return /^[0-9]{4}((0[1-9])|(1[0-2]))((0[1-9])|((1|2)[0-9])|(3[0-1]))(\.0+)?$/.test(e) ? "yyyyMMdd" : /^[0-9]{4}((0[1-9])|(1[0-2]))(\.0+)?$/.test(e) ? "yyyyMM" : /^[0-9]{4}(\.0+)?$/.test(e) ? "yyyy" : /^\d+(\.0+)?$/.test(e) ? +e > 10413763200 ? "milliseconds" : "seconds" : /^[0-9]{4}[0-9]{1,2}[0-9]{1,2} [0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}$/.test(e) ? "yyyyMMdd HH:mm:ss" : /^[0-9]{4}[0-9]{1,2}[0-9]{1,2} [0-9]{1,2}:[0-9]{1,2}$/.test(e) ? "yyyyMMdd HH:mm" : /^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}$/.test(e) ? "yyyy-MM-dd" : /^[0-9]{4}\/[0-9]{1,2}\/[0-9]{1,2}$/.test(e) ? "yyyy/MM/dd" : /^[0-9]{4}[0-9]{2}--$/.test(e) ? "yyyyMM--" : /^[0-9]{4}-[0-9]{2}$/.test(e) ? "yyyy-MM" : /^[0-9]{4}----$/.test(e) ? "yyyy----" : /^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2} [0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}$/.test(e) ? "yyyy-MM-dd HH:mm:ss" : /^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2} [0-9]{1,2}:[0-9]{1,2}$/.test(e) ? "yyyy-MM-dd HH:mm" : /^[0-9]{4}\/[0-9]{1,2}\/[0-9]{1,2} [0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}$/.test(e) ? "yyyy/MM/dd HH:mm:ss" : /^[0-9]{4}\/[0-9]{1,2}\/[0-9]{1,2} [0-9]{1,2}:[0-9]{1,2}$/.test(e) ? "yyyy/MM/dd HH:mm" : /^[0-9]{2}-[0-9]{1,2}-[0-9]{1,2} [0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}$/.test(e) ? "yy-MM-dd HH:mm:ss" : /^[0-9]{2}-[0-9]{1,2}-[0-9]{1,2} [0-9]{1,2}:[0-9]{1,2}$/.test(e) ? "yy-MM-dd HH:mm" : /^[0-9]{2}\/[0-9]{1,2}\/[0-9]{1,2} [0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}$/.test(e) ? "yy/MM/dd HH:mm:ss" : /^[0-9]{2}\/[0-9]{1,2}\/[0-9]{1,2} [0-9]{1,2}:[0-9]{1,2}$/.test(e) ? "yy/MM/dd HH:mm" : /^[a-zA-Z]{3} [a-zA-Z]{3} [0-9]{1,2} [0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2} (\\+|-)[0-9]{4} [0-9]{4}$/.test(e) ? "EEE MMM dd HH:mm:ss Z yyyy" : /^[a-zA-Z]{3} [a-zA-Z]{3} [0-9]{1,2} [0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2} [0-9]{4}$/.test(e) ? "EEE MMM dd HH:mm:ss yyyy" : /^[0-9]{4}年[0-9]{1,2}月[0-9]{1,2}日$/.test(e) ? "yyyy年MM月dd日" : /^[0-9]{4}年[0-9]{1,2}月[0-9]{1,2}日 [0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}$/.test(e) ? "yyyy年MM月dd日 HH:mm:ss" : /^[0-9]{1,2}\/[a-zA-Z]{3}\/[0-9]{2} [0-9]{1,2}:[0-9]{1,2} (am|AM|pm|PM)$/.test(e) ? "dd/MMM/yy hh:mm a" : /^[0-9]{1,2}\/[a-zA-Z]{3}\/[0-9]{2} [0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2} (am|AM|pm|PM)$/.test(e) ? "dd/MMM/yy hh:mm:ss a" : /^[0-9]{1,2}-[a-zA-Z]{3}-[0-9]{2} [0-9]{1,2}:[0-9]{1,2} (am|AM|pm|PM)$/.test(e) ? "dd-MMM-yy hh:mm a" : /^[0-9]{1,2}-[a-zA-Z]{3}-[0-9]{2} [0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2} (am|AM|pm|PM)$/.test(e) ? "dd-MMM-yy hh:mm:ss a" : /^[0-9]{1,2}\/[a-zA-Z]{3}\/[0-9]{4} [0-9]{1,2}:[0-9]{1,2} (am|AM|pm|PM)$/.test(e) ? "dd/MMM/yyyy hh:mm a" : /^[0-9]{1,2}\/[a-zA-Z]{3}\/[0-9]{4} [0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2} (am|AM|pm|PM)$/.test(e) ? "dd/MMM/yyyy hh:mm:ss a" : /^[0-9]{1,2}-[a-zA-Z]{3}-[0-9]{4} [0-9]{1,2}:[0-9]{1,2} (am|AM|pm|PM)$/.test(e) ? "dd-MMM-yyyy hh:mm a" : /^[0-9]{1,2}-[a-zA-Z]{3}-[0-9]{4} [0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2} (am|AM|pm|PM)$/.test(e) ? "dd-MMM-yyyy hh:mm:ss a" : /^[0-9]{1,2}:[0-9]{1,2}(:[0-9]{1,2})?$/.test(e) ? "hh:mm:ss" : null;
        return null
    }
    ,
    t.isEmpty = ze,
    t.deepEqual = Ue,
    t.arraysEqual = function(e, t) {
        if (e === t)
            return !0;
        if (null == e || null == t)
            return !1;
        if (e.length !== t.length)
            return !1;
        for (let n = 0; n < e.length; ++n)
            if (e[n] !== t[n])
                return !1;
        return !0
    }
    ,
    t.execScript = function(e) {
        if (e && (e.script && (e = e.script),
        e))
            return "function" == typeof e ? e() : "string" == typeof e ? new Function(e)() : void 0
    }
    ,
    t.compareStr = function(e, t) {
        return "string" != typeof e || "string" != typeof t ? e - t : (!Le && (Le = new Intl.Collator(f() ? "zh-CN" : "en")),
        Le.compare(e, t))
    }
    ;
    const We = 1024
      , qe = 1024 * We
      , Ye = 1024 * qe;
    t.formatSize = function(e, t) {
        if (e >= Ye) {
            let n = e / qe
              , r = Math.floor(n / We);
            return (n = t ? 0 : Math.floor(n % We / We * 100)) > 0 ? r + "." + n + "GB" : r + "GB"
        }
        if (e >= qe) {
            let n = e / We
              , r = Math.floor(n / We);
            return (n = t ? 0 : Math.floor(n % We / We * 100)) > 0 ? r + "." + n + "MB" : r + "MB"
        }
        if (e >= We) {
            let n = Math.floor(e / We)
              , r = t ? 0 : Math.floor(e % We / We * 100);
            return r > 0 ? n + "." + r + "KB" : n + "KB"
        }
        return e % 1024 + "B"
    }
    ,
    t.clearDelayOnceTimer = function(e) {
        e && e._delayOnceTimer && window.clearTimeout(e._delayOnceTimer)
    }
    ,
    t.getSizeStyle = function(e) {
        return null == e ? null : "number" == typeof e ? e + "px" : /^\d+(\.\d+)?$/.test(e) ? e + "px" : /^\d+(\.\d+)?(%|px)?$/.test(e) ? e : null
    }
    ,
    t.selectDomText = function(e, t) {
        if (!e)
            return;
        let n = (t = t || window).getSelection()
          , r = t.document.createRange();
        n && r && e.firstChild && e.lastChild && (r.setStartBefore(e.firstChild),
        r.setEndAfter(e.lastChild),
        n.removeAllRanges(),
        n.addRange(r))
    }
    ,
    t.getSelectText = function(e) {
        let t = (e = e || window).document;
        return e.getSelection ? e.getSelection().toString() : t.selection ? t.selection.createRange().text : ""
    }
    ;
    const Ve = "*";
    class CustomStyleManager {
        constructor() {
            this.conditionStyleIndexMap = new Map,
            this.conClassNameMap = new Map,
            this.styleInfoMap = new Map,
            this.componentNameStyleMap = new Map,
            this.colorThemeMap = new Map,
            this.compCustomStyleMap = new Map,
            this.getColorThemeStyleSheet(),
            this.getDefaultStyleSheet(),
            this.getThemeStyleSheet(),
            this.getCustomStyleSheet(),
            this.getHighWeightCustomStyleSheet(),
            this.getConditionStyleSheet()
        }
        clear() {
            this.conditionStyleIndexMap.clear(),
            this.conClassNameMap.clear(),
            this.styleInfoMap.clear(),
            this.componentNameStyleMap.clear(),
            this.compCustomStyleMap.clear(),
            this.deleteAllSelector()
        }
        addCustomStyle(e, t) {
            this.styleInfoMap.has(e) || this.styleInfoMap.set(e, t)
        }
        createComponentStyle(e, t, n, r, o) {
            let s = e.name
              , i = n && n.theme || Ve;
            if (t && !this.isComponentStyleExists(i, s, t) && (n ? this.addCustomStyle(t, n) : n = this.styleInfoMap.get(t),
            n)) {
                this.getCompStyleInfoMap(i, s).set(t, n);
                let l = e.makeStyleRules(n, t, r || rn());
                if (l) {
                    let e = (o = o || this.getCustomStyleSheet()).cssRules.length;
                    l.forEach(t=>{
                        "string" == typeof t ? t && this.insertRule(t, e++, o) : cn(t.selector, t.style, null, o)
                    }
                    )
                }
            }
        }
        getComponentCustomStyle(e) {
            return this.compCustomStyleMap.get(e)
        }
        addColorTheme(e, t) {
            this.colorThemeMap.has(e) || this.colorThemeMap.set(e, {
                info: t,
                componentClassMap: new Map
            })
        }
        getColorThemeInfo(e) {
            let t = this.colorThemeMap.get(e);
            return t && t.info
        }
        createColorThemeStyle(e, t, n) {
            if (!e)
                return;
            let r = this.colorThemeMap.get(e);
            if (r && !r.componentClassMap.get(t.name)) {
                r.componentClassMap.set(t.name, !0);
                let o = t.makeStyleRules(r.info, `${e}.${e}`, n || rn());
                if (o) {
                    const e = this.getColorThemeStyleSheet();
                    let t = e.cssRules.length;
                    o.forEach(n=>{
                        "string" == typeof n ? n && this.insertRule(n, t++, e) : cn(n.selector, n.style, null, e)
                    }
                    )
                }
            }
        }
        isComponentStyleExists(e, t, n) {
            let r = this.componentNameStyleMap;
            if (!t || !n || !r)
                return null;
            e = e || Ve;
            let o = r.get(e)
              , s = o && o.get(t);
            return !(!s || !s.get(n))
        }
        insertRule(e, t, n) {
            try {
                let o = n || this.getCustomStyleSheet();
                return t = null == t ? 0 : t,
                o.insertRule(e, t),
                t
            } catch (r) {
                console.error(ie("sys.error.insertRule", e))
            }
        }
        deleteSelector(e) {
            if (!e)
                return null;
            let t = this.getCustomStyleSheet()
              , n = t.cssRules;
            for (let r = 0, o = n.length; r < o; r++) {
                if (n[r].selectorText === e)
                    return t.deleteRule(r),
                    r
            }
            return null
        }
        deleteAllSelector() {
            let e = e=>{
                for (let t = 0, n = e.cssRules.length; t < n; t++)
                    e.deleteRule(0)
            }
            ;
            e(this.getDefaultStyleSheet()),
            e(this.getThemeStyleSheet()),
            e(this.getCustomStyleSheet()),
            e(this.getConditionStyleSheet()),
            e(this.getHighWeightCustomStyleSheet())
        }
        updateSelector(e, t) {
            if (!e || !t)
                return null;
            let n = this.getCustomStyleSheet().cssRules;
            for (let r = 0, o = n.length; r < o; r++) {
                let o = n[r];
                if (o.selectorText === e)
                    return o.style = t,
                    r
            }
            return this.insertSelector(e, t)
        }
        insertSelector(e, t, n) {
            if (!e || !t)
                return null;
            let r = this.getCustomStyleSheet()
              , o = r.cssRules;
            return n = void 0 !== n ? n : o.length,
            r.insertRule(`${e}{}`, n),
            o[n].style = t,
            n
        }
        getStyleByIndex(e) {
            let t = this.getCustomStyleSheet().cssRules;
            return void 0 === e || e > t.length - 1 ? null : t[e]
        }
        getCompStyleInfoMap(e, t) {
            let n = this.componentNameStyleMap.get(e || Ve);
            n || (n = new Map,
            this.componentNameStyleMap.set(e, n));
            let r = n.get(t);
            return r || (r = new Map,
            n.set(t, r)),
            r
        }
        getDefaultStyleSheet() {
            if (n.browser.nodejs)
                return;
            const e = document;
            let t = this.defaultStyleSheet;
            if (!t) {
                let n = e.head.appendChild(e.createElement("style"));
                n.id = "defaultStyle",
                t = this.defaultStyleSheet = n.sheet
            }
            return t
        }
        getThemeStyleSheet() {
            if (n.browser.nodejs)
                return;
            const e = document;
            let t = this.themeStyleSheet;
            if (!t) {
                let n = e.head.appendChild(e.createElement("style"));
                n.id = "themeStyle",
                t = this.themeStyleSheet = n.sheet
            }
            return t
        }
        getCustomStyleSheet() {
            if (n.browser.nodejs)
                return;
            const e = document;
            let t = this.customStyleSheet;
            if (!t) {
                let n = e.head.appendChild(e.createElement("style"));
                n.id = "customStyle",
                t = this.customStyleSheet = n.sheet
            }
            return t
        }
        getHighWeightCustomStyleSheet() {
            if (n.browser.nodejs)
                return;
            const e = document;
            let t = this.highWeightCustomStyleSheet;
            if (!t) {
                let n = e.head.appendChild(e.createElement("style"));
                n.id = "highWeightcustomStyle",
                t = this.highWeightCustomStyleSheet = n.sheet
            }
            return t
        }
        getConditionStyleSheet() {
            if (n.browser.nodejs)
                return;
            const e = document;
            let t = this.conditionStyleSheet;
            if (!t) {
                let n = e.head.appendChild(e.createElement("style"));
                n.id = "conditionStyle",
                t = this.conditionStyleSheet = n.sheet
            }
            return t
        }
        clearConditionStyleSheetById(e, t) {
            let n = this.getConditionStyleSheet()
              , r = this.conClassNameMap.get(e);
            r && r.forEach(e=>Pn(n, e, t)),
            Pn(n, `s${e}`, t)
        }
        clearConditionStyleIndexMap() {
            this.conditionStyleIndexMap.clear()
        }
        getColorThemeStyleSheet() {
            if (n.browser.nodejs)
                return;
            const e = document;
            let t = this.colorThemeStyleSheet;
            if (!t) {
                let n = e.head.appendChild(e.createElement("style"));
                n.id = "colorThemeStyle",
                t = this.colorThemeStyleSheet = n.sheet
            }
            return t
        }
        getConditionStyleClassName(e) {
            let t = this.conditionStyleIndexMap
              , n = this.conClassNameMap
              , r = [];
            e.forEach(e=>{
                let n = t.get(e);
                void 0 === n && (n = t.size + 1,
                t.set(e, n)),
                r.push(n)
            }
            );
            let o = "cs" + r.join("_");
            return e.forEach(e=>{
                let t = n.get(e);
                t || (t = new Set,
                n.set(e, t)),
                t.add(o)
            }
            ),
            o
        }
    }
    let Xe;
    function Ze() {
        return Xe || (Xe = new CustomStyleManager)
    }
    function Ge(e) {
        return n.browser.nodejs ? Buffer.from(e).toString("base64") : btoa(encodeURIComponent(e).replace(/%([0-9A-F]{2})/g, function(e, t) {
            return String.fromCharCode(parseInt("0x" + t))
        }))
    }
    function Je(e) {
        return n.browser.nodejs ? Buffer.from(e, "base64").toString() : decodeURIComponent(atob(e).split("").map(function(e) {
            return "%" + ("00" + e.charCodeAt(0).toString(16)).slice(-2)
        }).join(""))
    }
    t.CustomStyleManager = CustomStyleManager,
    t.getCustomStyleManager = Ze,
    t.setGlobalColorTheme = function e(t, n=document.body) {
        if (!n || 1 !== n.nodeType)
            return;
        let r = n.szobject;
        r ? r.setColorTheme(t) : n.hasChildNodes() && Array.from(n.childNodes).forEach(n=>e(t, n))
    }
    ,
    t.makeBorderStyleRules = function(e) {
        const t = e.border;
        let n;
        return n = "string" == typeof t ? t ? `border: ${t};` : "" : t ? t.all ? `border: ${t.all};` : `\n\t\t\t\tborder-top: ${t.top || "none"};\n\t\t\t\tborder-right: ${t.right || "none"};\n\t\t\t\tborder-bottom: ${t.bottom || "none"};\n\t\t\t\tborder-left: ${t.left || "none"};\n\t\t\t` : ""
    }
    ,
    t.makeBorderRadiusStyleRules = function(e) {
        const t = e.border;
        let n, r = e.borderRadius;
        if ("string" != typeof t && t && !t.all) {
            const e = t.top || "none"
              , n = t.right || "none"
              , o = t.bottom || "none"
              , s = t.left || "none";
            r = Object.assign({}, r),
            ("none" === e || "none" === s) && (r.topLeft = 0),
            ("none" === e || "none" === n) && (r.topRight = 0),
            ("none" === o || "none" === n) && (r.bottomRight = 0),
            ("none" === o || "none" === s) && (r.bottomLeft = 0)
        }
        if (r) {
            let e = [];
            null != r.topLeft && e.push(`border-top-left-radius: ${r.topLeft}px;`),
            null != r.topRight && e.push(`border-top-right-radius: ${r.topRight}px;`),
            null != r.bottomRight && e.push(`border-bottom-right-radius: ${r.bottomRight}px;`),
            null != r.bottomLeft && e.push(`border-bottom-left-radius: ${r.bottomLeft}px;`),
            n = e.join("\n")
        } else
            n = "";
        return n
    }
    ,
    t.makeBoxShadowStyleRules = function(e, t=e.activeBackgroundColor) {
        const n = e.border;
        if ("string" != typeof n && n && !n.all) {
            const e = n.top || "none"
              , t = n.right || "none"
              , r = n.bottom || "none"
              , o = n.left || "none";
            if ("none" === e || "none" === t || "none" === r || "none" === o)
                return "box-shadow: none;"
        }
        return t ? `box-shadow: 0 0 2px 1px ${Jt(t, .6)};` : ""
    }
    ,
    t.css = function() {
        let e = 0
          , t = {};
        return {
            getClass: e=>t[e],
            createClass: (n,r,o)=>{
                if (!n)
                    throw new Error("need classNameSuffix");
                let s = JSON.stringify(r)
                  , i = t[s];
                if (i)
                    return i;
                let l = document.styleSheets[0];
                i = "ucrt-" + e++ + "-" + n;
                let a = l.insertRule("." + i + (o ? ":" + o : "") + "{" + (r.cssText || "") + "}", 0)
                  , c = l.cssRules[a].style;
                for (let e in r)
                    if ("cssText" !== e) {
                        let t = r[e];
                        "backgroundImage" === e && (t = K(t)),
                        c[e] = t
                    }
                return t[s] = i,
                i
            }
        }
    }(),
    t.encodeBase64 = Ge,
    t.decodeBase64 = Je,
    t.parseFloatDef = function(e, t) {
        if (!e)
            return void 0 === t ? 0 : t;
        let n = parseFloat(e);
        return isNaN(n) ? void 0 === t ? 0 : t : n
    }
    ,
    t.getCellRowColByName = function(e) {
        if (!e)
            return null;
        let t = e.length;
        if (t > 9 || t < 2 || e.charCodeAt(t - 1) > 57)
            return null;
        let n = 0
          , r = -1
          , o = e.charCodeAt(n);
        for (; o >= 65 && o <= 90 || o >= 97 && o <= 122; )
            r = 26 * (r + 1) + (o >= 97 ? o - 97 : o - 65),
            o = e.charCodeAt(++n);
        let s = 0;
        for (o = e.charCodeAt(n); o >= 48 && o <= 57; )
            s = 10 * s + (o - 48),
            o = e.charCodeAt(++n);
        return {
            row: s - 1,
            col: r
        }
    }
    ;
    const Ke = []
      , Qe = [];
    function et(e) {
        if (e <= 500) {
            let t = Ke[e];
            return t || (Ke[e] = tt(e))
        }
        return tt(e)
    }
    function tt(e) {
        if (e <= 25)
            return String.fromCharCode(65 + e);
        if (e <= 650)
            return String.fromCharCode(65 + (Math.floor(e / 26) - 1) % 26) + String.fromCharCode(65 + e % 26);
        let t = "";
        do {
            t = String.fromCharCode(65 + e % 26) + t,
            e = Math.floor(e / 26) - 1
        } while (e > -1);
        return t
    }
    function nt(e) {
        if (e)
            return st || ((st = document.createElement("textarea")).style.cssText = "position: absolute; left: -1000px; top: -1000px; width: 1px; height: 1px"),
            st.value = "",
            st;
        ot || ((ot = document.createElement("div")).style.cssText = "position: absolute; left: -1000px; top: -1000px; width: 1px; height: 1px",
        ot.contentEditable = "true"),
        ot.removeAllChildren();
        let t = document.createElement("div");
        return t.innerHTML = "&nbsp",
        ot.appendChild(t),
        ot
    }
    function rt(e) {
        let t = window.getSelection();
        t.removeAllRanges();
        let n = document.createRange();
        n.selectNode(e),
        t.addRange(n)
    }
    let ot, st, it;
    function lt(e) {
        let t, r, o, s = e.target, i = e.event, l = e.messageStr, a = e.isRestore, c = e.isCut, d = void 0 === e.showMessage || e.showMessage, u = document.activeElement, h = document.getSelection().anchorNode;
        l = l || ie(c ? "sys.clipboard.cut.success" : "sys.clipboard.copy.success"),
        "string" == typeof s ? (t = !0,
        r = s) : (t = !1,
        o = Array.isArray(s) ? s : [s]);
        let m = window.clipboardData;
        if (m) {
            if (!t) {
                let e = new RegExp(String.fromCharCode(160),"g");
                o.forEach(t=>{
                    r += t.outerHTML.replace(e, " ")
                }
                )
            }
            return !!m.setData("Text", r) && (d && O(l),
            h && rt(h),
            !0)
        }
        if (i) {
            let e = i.clipboardData;
            if (t)
                e.setData("text/plain", r);
            else {
                let t, n = [], r = [];
                o.forEach(e=>{
                    t || e.id !== hn ? (r.push(e.outerHTML),
                    n.push(ct(e))) : t = e
                }
                ),
                r.splice(0, 0, "<html><head></head>", t ? t.outerHTML : null, "<body>\x3c!--StartFragment--\x3e"),
                r.push("\x3c!--EndFragment--\x3e</body></html>"),
                e.setData("text/html", r.join("")),
                e.setData("text/plain", n.join(""))
            }
            return d && O(l),
            void i.preventDefault()
        }
        let g = ()=>{
            let e = nt(t)
              , s = document.body;
            s.appendChild(e),
            t ? e.value = r : o.forEach(t=>e.appendChild(t.cloneNode())),
            t ? n.browser.ios ? e.setSelectionRange(0, r.length) : e.select() : rt(e);
            let i = document.execCommand("copy", !0);
            return s.removeChild(e),
            i && d && O(l),
            a && (u && u.focus(),
            h && rt(h)),
            i
        }
        ;
        if ("string" != typeof s || !navigator.clipboard)
            return g();
        navigator.clipboard.writeText(s).then(()=>{
            d && O(l)
        }
        ).catch(()=>{
            g()
        }
        )
    }
    function at(e) {
        let t, r, o = window.clipboardData;
        if (t = o ? o.getData("Text") : (o = e.clipboardData).getData("text/html"),
        n.browser.mac) {
            let e = t.indexOf(">");
            r = t.substr(e + 1)
        } else
            r = t;
        it || (it = document.createElement("div")),
        it.innerHTML = r;
        let s = [];
        return it.childNodes.forEach(e=>{
            1 === e.nodeType && s.push(e)
        }
        ),
        s
    }
    function ct(e) {
        let t = e=>{
            var t;
            let n = e.rows
              , r = []
              , o = (e,t,n)=>{
                let o = e.rowSpan || 1
                  , s = e.colSpan || 1
                  , i = e.textContent;
                if (t.push(i),
                1 !== o || 1 !== s)
                    for (let l = 0; l < o; l++) {
                        null == (t = r[l]) && (r[n + l] = t = []);
                        for (let e = 0; e < s; e++)
                            0 === l && 0 === e || t.push(null)
                    }
            }
            ;
            for (let s = 0, i = n.length; s < i; s++) {
                let e = n[s].cells
                  , i = r[s];
                null == i && (r[s] = i = []);
                for (let n = 0, r = null !== (t = null == e ? void 0 : e.length) && void 0 !== t ? t : 0; n < r; n++) {
                    o(e[n], i, s)
                }
            }
            return r.map(e=>e.join("\t")).join("\r\n")
        }
          , n = e.tagName;
        if ("SCRIPT" === n && e.id === hn)
            return null;
        if ("TABLE" === n)
            return t(e);
        if ("HTML" !== n)
            return e.textContent;
        {
            let n = gn(e, e=>"BODY" === (null == e ? void 0 : e.tagName));
            if (n) {
                let e = n.childNodes;
                if (1 === e.length && "TABLE" === e[0].tagName) {
                    return t(e[0])
                }
                return n.textContent
            }
        }
        return null
    }
    function dt() {
        return !1
    }
    t.getCellName = function(e, t) {
        if (e < 500 && t < 100) {
            let n = Qe[100 * e + t];
            return n || (Qe[100 * e + t] = et(t) + (e + 1))
        }
        return et(t) + (e + 1)
    }
    ,
    t.getColIndexByName = function(e) {
        let t = 0
          , n = -1
          , r = e.charCodeAt(t);
        for (; r >= 65 && r <= 90 || r >= 97 && r <= 122; )
            n = 26 * (n + 1) + (r >= 97 ? r - 97 : r - 65),
            r = e.charCodeAt(++t);
        return n
    }
    ,
    t.getColNameByIndex = et,
    t.getCopyDom = nt,
    t.setSelection = rt,
    t.copyToClipboard = lt,
    t.getHtmlFromClipboard = at,
    t.getTextFromClipboard = function(e) {
        let t = window.clipboardData;
        return t ? t.getData("Text") : (t = e.clipboardData).getData("text/plain")
    }
    ,
    t.getSzDataFromClipboard = function(e) {
        return mn(at(e))
    }
    ,
    t.getHtmlText = ct,
    t.setInputCursor = function(e, t, n) {
        e.selectionStart = t,
        e.selectionEnd = void 0 === n ? t : n
    }
    ,
    t.returnFalse = dt,
    t.forbidSelectAndDrag = function(e, t) {
        t ? (e.addEventListener("selectstart", dt),
        e.addEventListener("dragstart", dt),
        e.style && (e.style.userSelect = "none")) : (e.removeEventListener("selectstart", dt),
        e.removeEventListener("dragstart", dt),
        e.style && (e.style.userSelect = ""))
    }
    ;
    let ut = 1e4;
    function ht() {
        return (++ut).toString()
    }
    t.createZIndex = ht,
    t.getImplClass = function(t) {
        let n = t.depends
          , r = t.implClass;
        if ("string" == typeof r && n)
            return new Promise((t,r)=>{
                e([Q(n)], t, r)
            }
            ).then(__importStar).then(e=>e[r]);
        if (r)
            return Promise.resolve(r);
        throw new Error("找不到实现类：" + JSON.stringify(t))
    }
    ,
    t.waitingIcons = [];
    const mt = "waiting-icon"
      , gt = "waiting-ring";
    let pt;
    function ft(e) {
        const n = e && t.waitingIcons.find(t=>t.target === e);
        n && (n.timer && clearTimeout(n.timer),
        e.classList.remove(mt),
        n.timer = null,
        n.waitingPromise = null,
        n.target = null,
        n.ring && n.ring.setDomParent())
    }
    t.showWaitingIcon = function({target: n, promise: r=null, delay: o=200, layoutTheme: s="waiting-icon-default", colorTheme: i, throwOnError: l=!0}) {
        if (!(n instanceof Element))
            return;
        let a = t.waitingIcons.find(e=>e.target === n);
        const c = ()=>{
            r === a.waitingPromise && ft(n)
        }
        ;
        a ? (a.timer && clearTimeout(a.timer),
        a.timer = null) : (a = t.waitingIcons.find(e=>null == e.target)) ? (a.target = n,
        a.cycles++) : (t.waitingIcons.length > 100 && (console.warn("waitingIcons.length > 100"),
        t.waitingIcons.forEach(e=>{
            ft(e.target),
            e.ring && e.ring.dispose()
        }
        ),
        t.waitingIcons.length = 0),
        a = {
            target: n,
            sn: t.waitingIcons.length,
            cycles: 0
        },
        t.waitingIcons.push(a));
        const d = ()=>{
            if (a.target !== n)
                return;
            a.timer = null;
            let t = a.ring;
            if (null == i) {
                const e = v(n, (e,t)=>t instanceof Component);
                i = (null == e ? void 0 : e.colorTheme) || ""
            } else
                i = i || "";
            if (t)
                return t.setLayoutTheme(s),
                t.setColorTheme(i),
                n.classList.add(mt),
                void t.setDomParent(n);
            Promise.resolve(pt || new Promise((t,n)=>{
                e(["../commons/basic"], t, n)
            }
            ).then(__importStar).then(e=>pt = e.ProgressRing)).then(()=>{
                (t = a.ring) || (t = a.ring = new pt({
                    className: gt,
                    value: -1,
                    layoutTheme: s,
                    colorTheme: i
                })),
                a.target === n && (n.classList.add(mt),
                t.setDomParent(n))
            }
            )
        }
        ;
        a.waitingPromise = r,
        r && r.then(c, e=>{
            if (a.waitingPromise === r && l)
                throw c(),
                e
        }
        ),
        a.ring && a.ring.getDomParent() === n || (a.delay = o,
        o ? a.timer = setTimeout(d, o) : d())
    }
    ,
    t.cancelWaitingIcon = ft,
    t.waitingContext = {
        waitingDom: null,
        timer: null,
        waitingPromise: null,
        waitingTarget: null,
        mask: null
    };
    const yt = "waiting-target-active";
    function bt(r) {
        if (n.browser.mobile)
            return clearTimeout(t.waitingContext.timer),
            t.waitingContext.waitingPromise = null,
            void new Promise((t,n)=>{
                e(["../commons/mobile/basic"], t, n)
            }
            ).then(__importStar).then(e=>e.hideMobileWaiting());
        clearTimeout(t.waitingContext.timer),
        t.waitingContext.waitingPromise = null,
        t.waitingContext.waitingTarget = null;
        let o = t.waitingContext.waitingDom
          , s = t.waitingContext.mask;
        o && o.parentNode && o.parentNode.removeChild(o),
        s && s.parentNode && s.parentNode.removeChild(s),
        r || (r = t.waitingContext.waitingTarget),
        r && r.classList.remove(yt)
    }
    t.showWaiting = function(r, o, s, {layoutTheme: i="waiting-default", colorTheme: l, desc: a="", throwOnError: c=!0, delay: d=400}={}) {
        if (n.browser.mobile && (clearTimeout(t.waitingContext.timer),
        t.waitingContext.waitingPromise !== r)) {
            t.waitingContext.waitingPromise = r;
            let n = new Promise((t,n)=>{
                e(["../commons/mobile/basic"], t, n)
            }
            ).then(__importStar)
              , i = ()=>{
                t.waitingContext.waitingPromise === r && (clearTimeout(t.waitingContext.timer),
                t.waitingContext.waitingPromise = null)
            }
            ;
            return t.waitingContext.timer = setTimeout(()=>{
                t.waitingContext.waitingPromise === r && n.then(e=>e.showMobileWaiting({
                    hideTime: r,
                    covered: s,
                    coveredTarget: o
                }))
            }
            , d),
            r && r.then(e=>(i(),
            e), e=>{
                if (i(),
                c)
                    throw e;
                console.error(e)
            }
            )
        }
        null == s && (s = !1);
        const u = document;
        let {waitingDom: h, waitingTarget: m, waitingPromise: g, timer: p} = t.waitingContext;
        if (o && null == l) {
            const e = v(o, (e,t)=>t instanceof Component);
            l = (null == e ? void 0 : e.colorTheme) || ""
        } else
            l = l || "";
        if (h || ((h = t.waitingContext.waitingDom = document.createElement("div")).className = "waiting-ring",
        new Promise((t,n)=>{
            e(["../commons/basic"], t, n)
        }
        ).then(__importStar).then(e=>new e.ProgressRing({
            domParent: h,
            value: -1,
            layoutTheme: i,
            colorTheme: l,
            desc: a
        }))),
        !o && (o = u.body),
        o != m) {
            const e = s && ht()
              , n = s && ht();
            clearTimeout(p),
            t.waitingContext.waitingTarget = o,
            t.waitingContext.timer = setTimeout(()=>{
                let r = t.waitingContext.mask;
                s ? (r || ((r = t.waitingContext.mask = document.createElement("div")).className = "waiting-mask"),
                r.style.zIndex = e || ht(),
                o.appendChild(r)) : r && r.parentNode && r.parentNode.removeChild(r),
                h.style.zIndex = n || ht();
                const c = h.firstChild;
                if (c) {
                    let e = c.szobject;
                    e.setLayoutTheme(i),
                    e.setColorTheme(l),
                    e.setProgressRingDesc(a)
                }
                o.appendChild(h);
                const d = u.querySelector("." + yt);
                d && d.classList.remove(yt),
                o.classList.add(yt)
            }
            , d)
        }
        if (g !== r) {
            t.waitingContext.waitingPromise = r;
            const e = ()=>{
                if (t.waitingContext.waitingPromise === r) {
                    clearTimeout(t.waitingContext.timer),
                    t.waitingContext.waitingPromise = null,
                    t.waitingContext.waitingTarget = null,
                    h && h.parentNode && h.parentNode.removeChild(h);
                    let e = t.waitingContext.mask;
                    e && e.parentNode && e.parentNode.removeChild(e),
                    o.classList.remove(yt)
                }
            }
            ;
            return r && r.then(t=>(e(),
            t), t=>{
                if (e(),
                c)
                    throw t;
                console.error(t)
            }
            )
        }
        return r
    }
    ,
    t.hideWaiting = bt,
    t.mixin = function e(t, n, r=!0) {
        return Ee(t) ? (Ee(n) && Object.keys(n).forEach(o=>{
            o in t ? r && (Ee(t[o]) && Ee(n[o]) ? e(t[o], n[o], r) : t[o] = n[o]) : t[o] = n[o]
        }
        ),
        t) : n
    }
    ;
    let wt = String.prototype;
    wt.equalsIgnoreCase = function(e) {
        if (null == e)
            return !1;
        let t, n, r = this.toString(), o = r.length;
        if (o !== e.length)
            return !1;
        if (r === e)
            return !0;
        for (let s = 0; s < o; s++)
            if ((t = r.charCodeAt(s)) !== (n = e.charCodeAt(s)))
                if (t >= 65 && t <= 90) {
                    if (t !== n - 32)
                        return !1
                } else {
                    if (!(t >= 97 && n <= 122))
                        return !1;
                    if (t !== n + 32)
                        return !1
                }
        return !0
    }
    ,
    wt.trim = function() {
        let e = 0
          , t = this.toString()
          , n = t.length - 1;
        for (; e <= n && t.charCodeAt(e) < 33; )
            ++e;
        for (; n > e && t.charCodeAt(n) < 33; )
            --n;
        return 0 === e && n === t.length - 1 ? t : t.substr(e, n - e + 1)
    }
    ,
    wt.trimChars = function(e) {
        let t = 0;
        for (; -1 != e.indexOf(this.charAt(t)) && t < this.length; )
            t++;
        let n = this.length - 1;
        for (; -1 != e.indexOf(this.charAt(n)) && n >= 0; )
            n--;
        return t < n + 1 ? this.substring(t, n + 1) : ""
    }
    ,
    wt.getlen_bytes = function(e) {
        if (1 === e)
            return this.length;
        let t, n = this, r = n.length, o = 0;
        for (let s = 0; s < r; s++)
            (t = n.charCodeAt(s)) <= 127 ? o++ : o += e;
        return o
    }
    ,
    wt.substring_bytes = function(e, t, n) {
        let r = this.toString();
        if (1 === n)
            return r.substring(e, t);
        let o, s, i, l = 0;
        for (o = e,
        i = r.length; o < i; o++)
            if ((s = r.charCodeAt(o)) <= 127 ? l++ : l += n,
            l > t)
                return r.substring(e, o - e);
        return r
    }
    ,
    wt.maxbyteslength = function(e, t) {
        let n = this.toString();
        return -1 === e ? n : 1 === t ? n.substring(0, e) : n.substring_bytes(0, e, t)
    }
    ,
    wt.isBlank = function() {
        let e = this.toString();
        for (let t = 0, n = e.length; t < n; t++)
            if (e.charCodeAt(t) >= 33)
                return !1;
        return !0
    }
    ,
    wt.isNotBlank = function() {
        let e = this.toString();
        for (let t = 0, n = e.length; t < n; t++)
            if (e.charCodeAt(t) >= 33)
                return !0;
        return !1
    }
    ,
    wt.clean = function() {
        return this.replace(/[\r\n\t\f]/g, "").trim()
    }
    ,
    wt.compress = function() {
        return this.replace(/\s+/gi, "")
    }
    ,
    wt.escapeSelector = function() {
        let e = "#.[]()&,+*~':\"!^$=<>|/;@?{}`".replace(/(.)/g, "\\$1")
          , t = new RegExp("([" + e + "])","g")
          , n = this.replace(t, "\\$1");
        return -1 != n.indexOf("\r") && (n = n.replaceAll("\r", "\\r")),
        -1 != n.indexOf("\n") && (n = n.replaceAll("\n", "\\n")),
        n
    }
    ,
    wt.escapeRegExp = function() {
        return this.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
    }
    ,
    wt.countChar = function(e) {
        return "string" == typeof e && e.length || "number" == typeof e ? this.split(e).length - 1 : 0
    }
    ,
    wt.replaceAll = function(e, t) {
        return -1 === this.indexOf(e) ? this : this.split(e).join(t)
    }
    ,
    wt.toArray = function() {
        return this.split("")
    }
    ,
    wt.escapeHTML = function() {
        return this.replace(/\&/g, "&amp;").replace(/\>/g, "&gt;").replace(/\</g, "&lt;").replace(/\"/g, "&quot;").replace(/ /g, "&nbsp;")
    }
    ,
    wt.substringBefore = function(e) {
        let t = this.indexOf(e);
        return -1 === t ? this : this.substring(0, t)
    }
    ,
    wt.substringBetween = function(e, t) {
        let n = this.indexOf(e);
        if (-1 === n)
            return null;
        n += e.length;
        let r = this.indexOf(t, n);
        return -1 === r ? null : this.substring(n, r)
    }
    ,
    String.prototype.padStart = function(e, t=" ") {
        return e >>= 0,
        t = String(void 0 !== t ? t : " "),
        this.length > e ? String(this) : ((e -= this.length) > t.length && (t += t.repeat(e / t.length)),
        t.slice(0, e) + String(this))
    }
    ,
    String.prototype.padEnd = function(e, t=" ") {
        return e >>= 0,
        t = String(void 0 !== t ? t : ""),
        this.length > e ? String(this) : ((e -= this.length) > t.length && (t += t.repeat(e / t.length)),
        String(this) + t.slice(0, e))
    }
    ;
    let St = Array.prototype;
    if (St.pushAll = function(e) {
        if (!e)
            return this;
        if (!Array.isArray(e))
            return this.push(e),
            this;
        for (let t = 0, n = e.length; t < n; t++)
            this.push(e[t]);
        return this
    }
    ,
    St.distinctPushAll = function(e) {
        for (let t = 0, n = e && e.length; t < n; t++) {
            let n = e[t];
            this.includes(n) || this.push(n)
        }
        return this
    }
    ,
    St.distinctPush = function(e) {
        return this.includes(e) || this.push(e),
        this
    }
    ,
    St.equals = function(e) {
        return this.length === e.length && this.every((t,n)=>t === e[n])
    }
    ,
    St.distinct = function() {
        let e, t = [];
        for (let n = 0, r = this.length; n < r; n++)
            e = this[n],
            -1 === t.indexOf(e) && t.push(e);
        return t
    }
    ,
    St.remove = function(e) {
        if ("number" == typeof e)
            return this.splice(e, 1)[0];
        let t = this.indexOf(e);
        for (; -1 != t; )
            this.splice(t, 1),
            t = this.indexOf(e);
        return e
    }
    ,
    St.removeAll = function(e) {
        for (let t = 0, n = e.length; t < n; t++)
            this.remove(e[t])
    }
    ,
    St.sum = function() {
        let e = 0;
        for (let t = 0, n = this.length; t < n; t++)
            e += this[t] || 0;
        return e
    }
    ,
    St.insertArray = function(e, t) {
        if (!t || 0 === t.length)
            return this;
        if (t.length <= 32768)
            return this.splice(e, 0, ...t);
        for (let n = 0, r = t.length; n < r; n += 32768)
            this.splice(e + n, 0, ...t.slice(n, n + 32768));
        return this
    }
    ,
    window.DOMTokenList) {
        let e = DOMTokenList.prototype;
        e.replace || (e.replace = function(e, t) {
            let n = arguments.length;
            if (n < 2)
                throw TypeError("Failed to execute 'replace' on 'DOMTokenList': 2 arguments required, but only " + n + " present.");
            let r = /[\11\12\14\15\40]/
              , o = e=>{
                if ("" === e)
                    throw new DOMException("Failed to execute 'replace' on 'DOMTokenList': The token provided must not be empty.");
                if ("string" == typeof e && -1 !== e.search(r))
                    throw new DOMException("Failed to execute 'replace' on 'DOMTokenList': The token provided ('" + e + "') contains HTML space characters, which are not valid in tokens.")
            }
            ;
            return o(e),
            o(t),
            !!this.contains(e) && (this.remove(e),
            this.add(t),
            !0)
        }
        )
    }
    let Ct = Function.prototype;
    Ct.delayOnce = function(e, ...t) {
        let n, r, o;
        "number" == typeof e ? (n = this,
        o = e,
        r = t) : (n = e,
        o = t[0] || 0,
        r = t.slice(1)),
        n && n._delayOnceTimer && window.clearTimeout(n._delayOnceTimer);
        let s = window.setTimeout(()=>(n && (n._delayOnceTimer = null),
        this.apply(n, r)), o);
        return n && (n._delayOnceTimer = s),
        s
    }
    ,
    Ct.delay = function(e, ...t) {
        let n, r, o;
        return "number" == typeof e ? (n = this,
        o = e,
        r = t) : (n = e,
        o = t[0] || 0,
        r = t.slice(1)),
        window.setTimeout(()=>this.apply(n, r), o)
    }
    ;
    const vt = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      , xt = /(\d{1,2})(:|：)(\d{1,2})(?:(:|：)(\d{1,2})((\s|\.|\:\：)(\d*))?)?/
      , Et = [/[0-9]{2,4}(-|\/|\.|\s|年)[0-9]{1,2}(-|\/|\.|\s|月)[0-9]{1,2}(日)*/, /[0-9]{8}/, /[0-9]{2,4}(-|\/|\.|\s|年)[0-9]{1,2}(-|\/|\.|\s|月)*/, /[0-9]{6}(-|0)*/, /[0-9]{4}(-|0|年)*/, /[0-9]{2}-[a-zA-Z]{3}-[0-9]{2,4}/, /([0-9]{4})\s*年\s*([0-9]{1,2})\s*月\s*([0-9]{1,2})/, /[0-9]{14}/];
    let Mt, Tt = 0, Dt = {
        NONE: "none",
        YEAR: "year",
        DATE: "date",
        MONTH: "month",
        QUARTER: "quarter",
        TIME: "time",
        AUTOGROW: "autogrow"
    };
    function Pt(e, t, n) {
        if (void 0 === Mt || Tt++ > 1e4) {
            Mt = {};
            for (let e in Dt)
                Mt[Dt[e]] = {}
        }
        if (n && Dt[n.toUpperCase()] || (n = Dt.NONE),
        null == e || "" === e)
            return t ? Pt(t, null, n) : null;
        if (e instanceof Date)
            return e;
        if (null == e || "" === e)
            return t || null;
        if (e && (e = e.toString()),
        7 === e.length && "current" === e.toLowerCase() || 3 === e.length && "now" === e.toLowerCase())
            return new Date;
        let r = Mt[n][e];
        if (r && (0 === r.time || r.date.getTime() === r.time))
            return void 0 === r.date ? t || null : new Date(r.date.valueOf());
        let o = It(e, n);
        return void 0 === o ? (Mt[n][e] = {
            time: 0
        },
        t || null) : (Mt[n][e] = {
            time: o.getTime(),
            date: o
        },
        o)
    }
    function It(e, t) {
        let n = (e,t,n,r)=>Dt.AUTOGROW !== r && (t < 1 || t > 12 || n > ((e,t)=>{
            if (t < 1 || t > 12)
                return;
            return 2 === t ? 28 + (e % 4 == 0 && e % 100 != 0 || e % 400 == 0 ? 1 : 0) : 31 - (t - 1) % 7 % 2
        }
        )(e, t))
          , r = (e,t)=>{
            let n = e.match(t);
            return n && n.length > 0 && n[0] === e
        }
          , o = e=>{
            let t = parseInt(e, 10);
            return t >= 100 ? t : t < 20 ? t + 2e3 : t + 1900
        }
          , s = e=>Math.max(parseInt(e, 10), 1)
          , i = e=>Math.max(parseInt(e, 10), 1);
        if (null != e && (e = e.valueOf()),
        !e)
            return;
        if (null !== (e = (e += "").replace(/(\s){2,}/, " ")) && e.length > 2 && e.charAt(0) === e.charAt(e.length - 1) && "'\"#".indexOf(e.charAt(0)) >= 0 && (e = e.substring(1, e.length - 1)),
        null === e || " " === e || e.length < 2 || e.length > 28)
            return;
        let l = new Date;
        l.setMonth(0),
        l.setDate(1),
        l.setHours(0),
        l.setMinutes(0),
        l.setSeconds(0),
        l.setMilliseconds(0);
        let a = e.indexOf(":") - 3;
        if (a >= -2) {
            let t = e.substring(a + 1).trim()
              , n = t ? t.match(xt) : null;
            if (n) {
                if (((e,t)=>(t.setHours(parseInt(e[1])),
                t.setMinutes(parseInt(e[3])),
                e[5] && t.setSeconds(parseInt(e[5])),
                e[8] && t.setMilliseconds(parseInt(e[8])),
                t))(n, l),
                0 === a || -1 === a || -2 === a)
                    return l;
                e = e.substring(0, a + 1).trim()
            }
        }
        if (r(e, Et[0])) {
            let r = e.split(/-|\/|\.|\s|年|月|日/)
              , a = o(r[0])
              , c = s(r[1])
              , d = i(r[2]);
            if (n(a, c, d, t))
                return;
            return l.setFullYear(a),
            l.setMonth(c - 1),
            l.setDate(d),
            l
        }
        if (r(e, Et[2])) {
            let t = e.split(/-|\/|\.|\s|年|月/)
              , n = o(t[0])
              , r = s(t[1]);
            if (r < 1 || r > 12)
                return;
            return l.setFullYear(n),
            l.setMonth(r - 1),
            l
        }
        if (r(e, Et[3])) {
            let n = o(e.substring(0, 4));
            l.setFullYear(n);
            let r = s(e.substring(4, 6));
            return r > (t === Dt.DATE ? 10 : 12) ? (l.setMonth(parseInt((r / 10 - 1).toString())),
            l.setDate(r % 10)) : l.setMonth(r - 1),
            l
        }
        if (r(e, Et[7])) {
            let r = o(e.substring(0, 4))
              , a = s(e.substring(4, 6))
              , c = i(e.substring(6, 8));
            if (n(r, a, c, t))
                return;
            return l.setFullYear(r),
            l.setMonth(a - 1),
            l.setDate(c),
            l.setHours(parseInt(e.substring(8, 10), 10)),
            l.setMinutes(parseInt(e.substring(10, 12), 10)),
            l.setSeconds(parseInt(e.substring(12, 14), 10)),
            l
        }
        if (r(e, Et[1])) {
            let r = o(e.substring(0, 4))
              , a = s(e.substring(4, 6))
              , c = i(e.substring(6, 8));
            if (n(r, a, c, t))
                return;
            return l.setFullYear(r),
            l.setMonth(a - 1),
            l.setDate(c),
            l
        }
        if (r(e, Et[4]))
            return l.setFullYear(o(e.substring(0, 4))),
            l;
        if (r(e, Et[5])) {
            let r = (e=>{
                for (let t = 0; t < vt.length; t++)
                    if (vt[t] === e.toString())
                        return t + 1;
                return 1
            }
            )(e.substring(3, 6))
              , s = o(e.substring(7))
              , a = i(e.substring(0, 2));
            if (n(s, r, a, t))
                return;
            return l.setFullYear(s),
            l.setMonth(r - 1),
            l.setDate(a),
            l
        }
        if (5 === e.length && r(e, /[0-9]{5}/)) {
            let n = o(e.substring(0, 4))
              , r = parseInt(e.charAt(4));
            return r = t !== Dt.MONTH && r > 0 && r < 5 ? 3 * (r - 1) + 1 : Math.max(r, 1),
            l.setFullYear(n),
            l.setMonth(r - 1),
            l
        }
        if (7 === e.length && r(e, /[0-9]{7}/)) {
            let r = o(e.substring(0, 4))
              , s = parseInt(e.charAt(4))
              , a = i(e.substring(5, 7))
              , c = n(r, s, a, t)
              , d = parseInt((10 * s + a / 10).toString())
              , u = a % 10;
            if (c === n(r, d, u, t))
                return;
            return l.setFullYear(r),
            c ? (l.setMonth(d - 1),
            l.setDate(u)) : (l.setMonth(s - 1),
            l.setDate(a)),
            l
        }
    }
    function _t(e, t) {
        if (!e)
            return null == t ? null : t;
        if (e instanceof Date)
            return e;
        if ("number" == typeof e) {
            if (!(e >= 1900 && e <= 2099 || e >= 190001 && e <= 209912 || e >= 19e6 && e <= 99991231))
                return new Date(e);
            e += ""
        }
        return "string" == typeof e ? Pt(e, t) : null == t ? null : t
    }
    function $t(e, t=1) {
        e.getDate(),
        new Date(e.getFullYear(),e.getMonth(),1).getDay();
        let n = e.getMonth();
        return At(e, t) ? 0 === n ? 11 : n - 1 : n
    }
    function Lt(e, t=1) {
        let n = e.getDate()
          , r = new Date(e.getFullYear(),e.getMonth(),1).getDay()
          , o = (r > t ? 7 : 0) - r + t + 1;
        return n < o ? kt(e.getFullYear(), e.getMonth() - 1, t) : Math.ceil((n - o + 1) / 7)
    }
    function At(e, t=1) {
        if (!e)
            return !1;
        let n = e.getDate()
          , r = new Date(e.getFullYear(),e.getMonth(),1).getDay();
        return n < (r > t ? 7 : 0) - r + t + 1
    }
    function kt(e, t, n=1) {
        let r = new Date(e,t,1).getDay()
          , o = (r > n ? 7 : 0) - r + n + 1
          , s = new Date(e,t + 1,0).getDate();
        return Math.ceil((s - o + 1) / 7)
    }
    function Ot(e) {
        return Math.floor((e + 3) / 3)
    }
    function Rt(e) {
        return Math.floor((e + 6) / 6)
    }
    function Ft(e) {
        return e <= 10 ? 1 : e > 20 ? 3 : 2
    }
    function Bt(e, t, n) {
        let r = (e=>{
            let t = new Date
              , n = t.getFullYear()
              , r = t.getMonth()
              , o = t.getDate()
              , s = t.getDay();
            return "startOfWeek" === e ? t = new Date(n,r,o - s + 1) : "endOfWeek" === e ? t = new Date(n,r,o - s + 7) : "startOfMonth" === e ? t = new Date(n,r,1) : "endOfMonth" === e ? t = new Date(n,r + 1,0) : "startOfYear" === e ? t = new Date(n,0,1) : "endOfYear" === e && (t = new Date(n + 1,0,0)),
            t
        }
        )(e);
        if (t && n) {
            let e = r.getFullYear()
              , o = r.getMonth()
              , s = r.getDate();
            "year" === n || "y" === n ? r.setFullYear(e + t) : "quarter" === n || "q" === n ? r.setMonth(o + 3 * t) : "month" === n || "m" === n ? r.setMonth(o + t) : "week" === n || "w" === n ? r.setDate(s + 7 * t) : "day" !== n && "d" !== n || r.setDate(s + t)
        }
        return r
    }
    function Nt(e, t, n) {
        let r, o, s, i;
        return r = 0 !== t && "today" === e ? "" : ie("commons.date." + e),
        0 === t ? (o = "",
        s = "",
        i = "") : (o = Math.abs(t),
        s = ie("commons.date." + n),
        i = ie(t > 0 ? "commons.date.after" : "commons.date.before")),
        r + o + s + i
    }
    function jt(e, t, n) {
        !n && (n = {});
        let r = e=>(e > 9 ? e : "0" + e).toString()
          , o = e.getFullYear()
          , s = e.getMonth();
        return t.includes("w") && (0 === s && At(e, n.startDay) && o--,
        s = $t(e, n.startDay)),
        t.replace(/y+|b+|q+|M+|t+|w+|d+|h+|H+|m+|s+|S+/gm, t=>{
            switch (t) {
            case "yy":
                return String(o).substr(2);
            case "yyyy":
                return o.toString();
            case "b":
                return Math.floor((s + 6) / 6).toString();
            case "bb":
                return "0" + Math.floor((s + 6) / 6);
            case "q":
                return Math.floor((s + 3) / 3).toString();
            case "qq":
                return "0" + Math.floor((s + 3) / 3);
            case "M":
                return (s + 1).toString();
            case "MM":
                return r(s + 1);
            case "t":
                return e.getDate() <= 10 ? "1" : e.getDate() > 20 ? "3" : "2";
            case "tt":
                return e.getDate() <= 10 ? "01" : e.getDate() > 20 ? "03" : "02";
            case "w":
                return Lt(e, n.startDay).toString();
            case "ww":
                return "0" + Lt(e, n.startDay);
            case "d":
                return e.getDate().toString();
            case "dd":
                return r(e.getDate());
            case "h":
                return (e.getHours() % 12 || 12).toString();
            case "hh":
                return r(e.getHours() % 12 || 12);
            case "H":
                return e.getHours().toString();
            case "HH":
                return r(e.getHours());
            case "m":
                return e.getMinutes().toString();
            case "mm":
                return r(e.getMinutes());
            case "s":
                return e.getSeconds().toString();
            case "ss":
                return r(e.getSeconds());
            case "SSS":
                {
                    let t = e.getMilliseconds();
                    return (t > 99 ? t : t > 9 ? "0" + t : "00" + t).toString()
                }
            default:
                return t.substr(1, t.length - 2)
            }
        }
        )
    }
    t.parseStrDate = Pt,
    t._parseStrDate = It,
    t.parseDate = _t,
    t.getWeekMonth = $t,
    t.getWeekIndex = Lt,
    t.isPrevMonthWeek = At,
    t.getWeekNum = kt,
    t.getWeekStartDate = function(e, t, n, r=1) {
        let o = new Date(e,t,1).getDay();
        return 7 * n - o + r + 1 + (o > r ? 7 : 0)
    }
    ,
    t.getQuarter = Ot,
    t.getHalfyear = Rt,
    t.getTendays = Ft,
    t.getLunarDay = function(e, t, n) {
        let r = ie("commons.date.lunarDay").split(",")
          , o = ie("commons.date.lunarDays").split(",");
        o.push(" ");
        let s = ie("commons.date.lunarMonth").split(",");
        s.unshift(" ");
        let i = ie("commons.date.lunarHoliday").split(",")
          , l = ie("commons.date.holiday").split(",")
          , a = [19416, 19168, 42352, 21717, 53856, 55632, 91476, 22176, 39632, 21970, 19168, 42422, 42192, 53840, 119381, 46400, 54944, 44450, 38320, 84343, 18800, 42160, 46261, 27216, 27968, 109396, 11104, 38256, 21234, 18800, 25958, 54432, 59984, 28309, 23248, 11104, 100067, 37600, 116951, 51536, 54432, 120998, 46416, 22176, 107956, 9680, 37584, 53938, 43344, 46423, 27808, 46416, 86869, 19872, 42416, 83315, 21168, 43432, 59728, 27296, 44710, 43856, 19296, 43748, 42352, 21088, 62051, 55632, 23383, 22176, 38608, 19925, 19152, 42192, 54484, 53840, 54616, 46400, 46752, 103846, 38320, 18864, 43380, 42160, 45690, 27216, 27968, 44870, 43872, 38256, 19189, 18800, 25776, 29859, 59984, 27480, 21952, 43872, 38613, 37600, 51552, 55636, 54432, 55888, 30034, 22176, 43959, 9680, 37584, 51893, 43344, 46240, 47780, 44368, 21977, 19360, 42416, 86390, 21168, 43312, 31060, 27296, 44368, 23378, 19296, 42726, 42208, 53856, 60005, 54576, 23200, 30371, 38608, 19415, 19152, 42192, 118966, 53840, 54560, 56645, 46496, 22224, 21938, 18864, 42359, 42160, 43600, 111189, 27936, 44448, 84835]
          , c = e=>{
            let t, n = 348;
            for (t = 32768; t > 8; t >>= 1)
                n += a[e - 1900] & t ? 1 : 0;
            return n + d(e)
        }
          , d = e=>u(e) ? 65536 & a[e - 1900] ? 30 : 29 : 0
          , u = e=>15 & a[e - 1900]
          , h = (e,t)=>a[e - 1900] & 65536 >> t ? 30 : 29
          , m = (e=>{
            let t = e;
            for (let r = 0; r < t.length; r++)
                t[r] - 0 <= 9 && (t[r] = `0${t[r]}`);
            let n = `${t[1]}${t[2]}`
              , l = ""
              , a = "";
            for (let r = 0; r < i.length; r++) {
                let e = i[r].split(" ");
                if (n == e[0]) {
                    a = e[1];
                    break
                }
            }
            return n = "",
            0 === parseInt(`${t[1]}`.substr(0, 1)) ? n += `${s[parseInt(`${t[1]}`.substr(1, 1))]}${ie("commons.date.month")}` : n += `${s[parseInt(t[1])]}${ie("commons.date.month")}`,
            (l = `${o[parseInt(`${t[2]}`.substr(0, 1))]}${r[parseInt(`${t[2]}`.substr(1, 1))]}`) == `${r[0]}${r[0]}` && (l = `${o[0]}${r[0]}`),
            l == `${o[0]}${r[1]}` && (l = ""),
            {
                month: n,
                day: l,
                holiday: a
            }
        }
        )((e=>{
            let t, n = 0, r = 0, o = (Date.UTC(e.getFullYear(), e.getMonth(), e.getDate()) - Date.UTC(1900, 0, 31)) / 864e5;
            for (t = 1900; t < 2050 && o > 0; t++)
                o -= r = c(t);
            o < 0 && (o += r,
            t--);
            let s = t;
            n = u(t);
            let i = !1;
            for (t = 1; t < 13 && o > 0; t++)
                n > 0 && t == n + 1 && 0 == i ? (--t,
                i = !0,
                r = d(s)) : r = h(s, t),
                1 == i && t == n + 1 && (i = !1),
                o -= r;
            return 0 == o && n > 0 && t == n + 1 && (i ? i = !1 : (i = !0,
            --t)),
            o < 0 && (o += r,
            --t),
            [s, t, o + 1]
        }
        )(new Date(e,t - 1,n)))
          , g = `${t <= 9 ? "0" : ""}${t}${n <= 9 ? "0" : ""}${n}`;
        for (let p = 0; p < l.length; p++) {
            let e = l[p].split(" ");
            if (g == e[0]) {
                m.holiday = e[1];
                break
            }
        }
        return m
    }
    ,
    t.MEASURESMAP = {
        y: "year",
        q: "quarter",
        m: "month",
        w: "week",
        d: "day"
    },
    t.ANCHORS = ["today", "startOfWeek", "endOfWeek", "startOfMonth", "endOfMonth", "startOfYear", "endOfYear"],
    t.parseStringToDate = function(e) {
        let t = e.indexOf("+")
          , n = e.indexOf("-");
        if (-1 === t && -1 === n)
            return Bt(e);
        let r = -1 === t ? n : t
          , o = e.substring(0, r)
          , s = e.substr(-1, 1);
        return Bt(o, parseInt(e.substring(r)), s)
    }
    ,
    t.parseAnchorDate = Bt,
    t.isRelativeDate = function(e) {
        let n = t.ANCHORS;
        for (let t = 0, r = n.length; t < r; t++)
            if (-1 !== e.indexOf(n[t]))
                return !0;
        return !1
    }
    ,
    t.getTimeText = function(e, t) {
        if (ze(e))
            return e;
        let n = _t(e, null);
        if (!n) {
            let t = parseInt(e);
            return ze(t) ? e : t + ie("commons.date.hour")
        }
        return "hour" === t ? n.getHours() + ie("commons.date.hour") : "minute" === t ? n.getHours() + ie("commons.date.hour") + n.getMinutes() + ie("commons.date.minute") : "time" === t ? n.getHours() + ie("commons.date.hour") + n.getMinutes() + ie("commons.date.minute") + n.getSeconds() + ie("commons.date.second") : void 0
    }
    ,
    t.getRelativeText = function(e) {
        if ("string" != typeof e)
            return;
        let n, r = t.ANCHORS.find(t=>e.indexOf(t) > -1) || "today", o = parseInt(e.replace(/[^0-9+-]/gi, "")) || 0;
        if (0 === o)
            n = "day";
        else {
            let r = e.charAt(e.length - 1);
            r = r.toLowerCase(),
            n = t.MEASURESMAP[r] || "day"
        }
        return Nt(r, o, n)
    }
    ,
    t.makeRelativeText = Nt,
    t.getAbsoluteText = function(e, t, n) {
        if (!e)
            return "";
        let r = _t(e, null);
        if (!r)
            return "string" == typeof e ? e : He(e) ? "" + e : "";
        if ("year" === t)
            return jt(r, `yyyy${ie("commons.date.year")}`);
        if ("month" === t)
            return jt(r, `yyyy${ie("commons.date.year")}M${ie("commons.date.month")}`);
        if ("date" === t)
            return jt(r, `yyyy${ie("commons.date.year")}M${ie("commons.date.month")}d${ie("commons.date.date")}`);
        if ("datetime" === t)
            return jt(r, `yyyy${ie("commons.date.year")}M${ie("commons.date.month")}d${ie("commons.date.date")} H${ie("commons.date.hour")}m${ie("commons.date.minute")}s${ie("commons.date.second")}`);
        if ("time" === t)
            return jt(r, `H${ie("commons.date.hour")}m${ie("commons.date.minute")}s${ie("commons.date.second")}`);
        if ("week" === t) {
            let e = jt(r, "yyyy-M-w", n).split("-");
            return e[0] + ie("commons.date.year") + e[1] + ie("commons.date.month") + ie("commons.date.weeknum", e[2])
        }
        if ("tendays" === t) {
            let e = ie("commons.date.tendays").split(",")
              , t = Ft(r.getDate());
            return r.getFullYear() + ie("commons.date.year") + (r.getMonth() + 1) + ie("commons.date.month") + e[t - 1]
        }
        if ("quarter" === t) {
            let e = ie("commons.date.quarters").split(",")
              , t = Ot(r.getMonth());
            return r.getFullYear() + ie("commons.date.year") + e[t - 1]
        }
        if ("halfyear" === t) {
            let e = ie("commons.date.halfyears").split(",")
              , t = Rt(r.getMonth());
            return r.getFullYear() + ie("commons.date.year") + e[t - 1]
        }
    }
    ,
    t.formatDate = jt,
    t.formatDateFriendly = function(e, t) {
        let n, r = new Date, o = (r.getTime() - e.getTime()) / 1e3, s = e.getDate(), i = r.getDate(), l = e.getHours(), a = e.getMinutes();
        if (t) {
            let t = e.getSeconds();
            n = `${l < 10 ? "0" + l : l}:${a < 10 ? "0" + a : a}:${t < 10 ? "0" + t : t}`
        } else
            n = `${l < 10 ? "0" + l : l}:${a < 10 ? "0" + a : a}`;
        if (o < 86401 && o > -86401 && s === i)
            return ie("sys.date.today", n);
        if (o < 259201 && o > -259201) {
            r.setDate(i + 2);
            let e = r.getDate();
            if (e === s)
                return ie("sys.date.aftertomorrow", n);
            if (r.setDate(e - 1),
            (e = r.getDate()) === s)
                return ie("sys.date.tomorrow", n);
            if (r.setDate(e - 2),
            (e = r.getDate()) === s)
                return ie("sys.date.yesterday", n);
            if (r.setDate(e - 1),
            (e = r.getDate()) === s)
                return ie("sys.date.beforeyesterday", n)
        }
        r = new Date;
        let c = e.getFullYear()
          , d = ie(`sys.date.month.${e.getMonth()}`)
          , u = s < 10 ? "0" + s : s;
        return r.getFullYear() === c ? ie("sys.date.thisyear", c, d, u, n) : ie("sys.date.standard", c, d, u, n)
    }
    ;
    const Ht = [{
        ratio: 1e3,
        id: "second"
    }, {
        ratio: 60,
        id: "minute"
    }, {
        ratio: 60,
        id: "hour"
    }, {
        ratio: 24,
        id: "day"
    }, {
        ratio: 30,
        id: "month"
    }, {
        ratio: 12,
        id: "year"
    }];
    function zt(e) {
        if ("number" != typeof e || e < 0)
            return "";
        let t = "";
        const n = Ht;
        for (let r = 0, o = n.length; r < o; r++)
            if (e = Math.round(e / n[r].ratio),
            r === o - 1 || e < n[r + 1].ratio) {
                t = ie("sys.getFriendlyDuration." + n[r].id, e);
                break
            }
        return t
    }
    if (t.getFriendlyDateExpire = function(e, t) {
        let n, r = ("number" == typeof e ? e : null != e ? e.getTime() : 0) - (new Date).getTime();
        return n = r > 0 ? zt(r) : void 0 === t ? ie("sys.getFriendlyDateExpire.expired") : t
    }
    ,
    t.getFriendlyDuration = zt,
    !n.browser.nodejs) {
        let e = HTMLElement.prototype;
        Object.defineProperty(e, "outerBounds", {
            get: function() {
                let e = getComputedStyle(this);
                return {
                    height: this.offsetHeight + (parseFloat(e.marginTop) || 0) + (parseFloat(e.marginBottom) || 0),
                    width: this.offsetWidth + (parseFloat(e.marginLeft) || 0) + (parseFloat(e.marginRight) || 0)
                }
            }
        }),
        Object.defineProperty(e, "outerHeight", {
            get: function() {
                let e = getComputedStyle(this);
                return this.offsetHeight + (parseFloat(e.marginTop) || 0) + (parseFloat(e.marginBottom) || 0)
            }
        }),
        Object.defineProperty(e, "outerWidth", {
            get: function() {
                let e = getComputedStyle(this);
                return this.offsetWidth + (parseFloat(e.marginLeft) || 0) + (parseFloat(e.marginRight) || 0)
            }
        }),
        Object.defineProperty(e, "heightNoPadding", {
            get: function() {
                let e = getComputedStyle(this);
                return this.clientHeight - (parseFloat(e.paddingTop) || 0) - (parseFloat(e.paddingBottom) || 0)
            }
        }),
        Object.defineProperty(e, "widthNoPadding", {
            get: function() {
                let e = getComputedStyle(this);
                return this.clientWidth - (parseFloat(e.paddingLeft) || 0) - (parseFloat(e.paddingRight) || 0)
            }
        }),
        e.toggleAttribute = function(e, t) {
            return void 0 !== t && (t = !!t),
            null !== this.getAttribute(e) ? !!t || (this.removeAttribute(e),
            !1) : !1 !== t && (this.setAttribute(e, ""),
            !0)
        }
        ;
        let t = SVGElement.prototype;
        Object.defineProperty(t, "outerBounds", {
            get: function() {
                let e = getComputedStyle(this)
                  , t = this.getBoundingClientRect()
                  , n = t.height
                  , r = t.width;
                return {
                    height: n + (parseFloat(e.marginTop) || 0) + (parseFloat(e.marginBottom) || 0),
                    width: r + (parseFloat(e.marginLeft) || 0) + (parseFloat(e.marginRight) || 0)
                }
            }
        })
    }
    t.UndoManager = class UndoManager {
        constructor(e) {
            this.undoItems = [],
            this.redoItems = [],
            this.modified = !1,
            this.previewing = !1,
            this.batching = !1,
            this.pushedPreviewItem = !1,
            this.pushedBatchItem = !1,
            this.saveMark = 0,
            this.batch = 0,
            this.onchange = e && e.onchange,
            this.onrestore = e && e.onrestore,
            this.onbeforechange = e && e.onbeforechange,
            this.onmodified = e && e.onmodified,
            this.onendbatch = e && e.onendbatch
        }
        isRestoring() {
            let e = this.undoType;
            return 1 === e || 2 === e
        }
        getUndoType() {
            return this.undoType
        }
        beginUpdate(e) {
            this.batch++,
            this.currentItem || (this.undoType = e,
            this.currentItem = {})
        }
        endUpdate(e) {
            let t = this.currentItem
              , n = this.undoItems;
            if (1 === this.batch && this.onbeforechange && (this.rechangUndoItem || (this.rechangUndoItem = !0,
            this.onbeforechange(t)),
            this.rechangUndoItem = !1,
            t = this.currentItem),
            !(--this.batch > 0))
                if (this.batch < 0 && le(ie("err.ana.undo.notfound.beginUpdate")),
                this.isCurrentItemEmpty())
                    this.currentItem = null;
                else {
                    if (1 === this.undoType)
                        !this.previewing && this.redoItems.push(t);
                    else if (2 === this.undoType)
                        n.push(t);
                    else if (this.redoItems.length = 0,
                    this.batching)
                        this.pushedBatchItem ? this.mergeBatchItem(t) : (n.push(t),
                        this.pushedBatchItem = !0);
                    else {
                        let e = !this.previewing || !this.pushedPreviewItem;
                        !this.needMergeCurrentItem() && e ? (this.previewing && (this.pushedPreviewItem = !0),
                        n.push(t)) : this.mergePreviewItem(t)
                    }
                    this.currentItem = null,
                    e && this.clear(),
                    this.onchange && this.onchange(t)
                }
        }
        isSameOperate(e, t) {
            let n = Object.keys(e);
            if (n.length !== Object.keys(t).length)
                return !1;
            for (const r of n)
                if ("ov" !== r && !Ue(e[r], t[r]))
                    return !1;
            return !0
        }
        mergePreviewItem(e) {
            let t = this.undoItems
              , n = t.length - 1
              , r = t[n]
              , o = e.items
              , s = r.items;
            if (ze(o) && (o = [e]),
            ze(s) && (s = [r]),
            o.forEach(e=>{
                let t = !1;
                for (const n of s)
                    if (this.isSameOperate(e, n)) {
                        t = !0;
                        break
                    }
                t || s.push(e)
            }
            ),
            1 === s.length)
                t[n] = s[0];
            else {
                let e = {};
                void 0 !== r.sel && (e.sel = r.sel),
                null != r.mergeUndo && (e.mergeUndo = r.mergeUndo),
                e.items = s,
                t[n] = e
            }
        }
        mergeBatchItem(e) {
            let t = this.undoItems
              , n = t.length - 1
              , r = t[n]
              , o = r.items;
            ze(o) ? t[n] = {
                items: [r, e]
            } : o.push(e)
        }
        beginPreview() {
            this.previewing = !0
        }
        endPreview(e) {
            if (this.pushedPreviewItem) {
                if (e)
                    this.undo(),
                    this.previewing = !1;
                else {
                    let e = this.undoItems.length
                      , t = this.undoItems[e - 1];
                    this.previewing = !1,
                    this.onchange && this.onchange(t, !0)
                }
                this.pushedPreviewItem = !1
            } else
                this.previewing = !1
        }
        isPreviewing() {
            return this.previewing
        }
        beginBatch() {
            this.batching = !0
        }
        endBatch(e) {
            e && this.pushedBatchItem && this.undo(),
            this.batching = !1,
            this.pushedBatchItem = !1,
            this.onendbatch && this.onendbatch(e)
        }
        isBatching() {
            return this.batching
        }
        needMergeCurrentItem() {
            let e = this.undoItems.length;
            if (0 === e)
                return !1;
            let t = this.getCurrentItem();
            if (!t.mergeUndo)
                return !1;
            let n = this.undoItems[e - 1]
              , r = Object.keys(n);
            if (r.length !== Object.keys(t).length)
                return !1;
            for (const o of r) {
                if ("ov" === o)
                    continue;
                let e = t[o]
                  , r = n[o];
                if ("items" === o) {
                    if (!Array.isArray(e) || !Array.isArray(r))
                        return !1;
                    let t = e.length;
                    if (t !== r.length)
                        return !1;
                    for (let n = 0; n < t; n++) {
                        const t = e[n]
                          , o = r[n];
                        if (!this.isSameOperate(t, o))
                            return !1
                    }
                } else if (!Ue(e, r))
                    return !1
            }
            return !0
        }
        undo() {
            let e = this.undoItems.pop();
            this.restore(e, 1)
        }
        redo() {
            let e = this.redoItems.pop();
            this.restore(e, 2)
        }
        getCurrentItem() {
            return this.currentItem
        }
        getUndoItems() {
            return this.undoItems
        }
        getRedoItems() {
            return this.redoItems
        }
        restore(e, t) {
            if (e) {
                this.beginUpdate(t);
                try {
                    this.onrestore(e)
                } finally {
                    this.endUpdate()
                }
            }
        }
        push(e) {
            let t = this.currentItem;
            if (e && t) {
                if (this.isCurrentItemEmpty()) {
                    let n = t.sel;
                    this.currentItem = e,
                    n && (this.currentItem.sel = n)
                } else {
                    t.mergeUndo && !e.mergeUndo && (t.mergeUndo = !1);
                    let n = t.items;
                    if (ze(n)) {
                        let n = t.sel;
                        delete t.sel,
                        this.currentItem = {
                            items: [t, e]
                        },
                        void 0 !== n && (this.currentItem.sel = n),
                        t.mergeUndo && !0 === e.mergeUndo && (this.currentItem.mergeUndo = !0)
                    } else
                        n.push(e)
                }
                let n = this.undoType
                  , r = this.undoItems.length
                  , o = this.saveMark;
                this.setModified(!(1 === n && o === r || 2 === n && o === r + 1))
            }
        }
        pop() {
            let e = this.undoItems.pop();
            return this.setModified(this.saveMark !== this.undoItems.length),
            e
        }
        canUndo() {
            return this.undoItems && this.undoItems.length > 0
        }
        canRedo() {
            return this.redoItems && this.redoItems.length > 0
        }
        setModified(e) {
            var t;
            e = !!e,
            this.modified !== e && (this.modified = e,
            null === (t = this.onmodified) || void 0 === t || t.call(this, e))
        }
        isModified() {
            return this.modified
        }
        save() {
            this.setModified(!1),
            this.saveMark = this.undoItems.length
        }
        load(e, t) {
            this.clear(),
            this.undoItems.pushAll(e),
            this.redoItems.pushAll(t),
            this.setModified(this.saveMark !== e.length)
        }
        clear() {
            this.undoItems.length = 0,
            this.redoItems.length = 0,
            this.setModified(!1),
            this.saveMark = 0,
            this.batch = 0
        }
        getBatch() {
            return this.batch
        }
        isCurrentItemEmpty() {
            let e = this.currentItem;
            if (!e || ze(e))
                return !0;
            let t = Object.keys(e);
            return 1 === t.length && "sel" === t[0]
        }
    }
    ;
    const Ut = /(^transparent|#[0-9a-fA-F]{3}$|#[0-9a-fA-F]{6}$)/gi
      , Wt = /(^rgba\()(([0-9|\.])+(,\s*){1}){2,3}(([0-9|\.])+){1}\)$/gi
      , qt = /(^rgb\()(([0-9|\.])+(,\s*){1}){2}(([0-9|\.])+){1}\)$/gi;
    function Yt(e) {
        return Ut.lastIndex = 0,
        Ut.test(e)
    }
    function Vt(e) {
        return Wt.lastIndex = 0,
        Wt.test(e)
    }
    function Xt(e) {
        return qt.lastIndex = 0,
        qt.test(e)
    }
    function Zt(e) {
        return (e = Math.round(e)) < 16 ? "0" + e.toString(16).toUpperCase() : e.toString(16).toUpperCase()
    }
    function Gt(e, t) {
        if (!He(t) || t > 1 || t < -1 || !Yt(e))
            return e;
        if ("transparent" === e.toLowerCase())
            return e;
        let n = e.substring(1);
        if (3 === n.length) {
            let e = n.charAt(0)
              , t = n.charAt(1)
              , r = n.charAt(2);
            n = [e, e, t, t, r, r].join("")
        }
        let r = ["#"];
        for (let o = 0; o < 3; o++) {
            let e = parseInt(n.substr(2 * o, 2), 16)
              , s = Math.round(Math.min(Math.max(0, e + e * t), 255)).toString(16);
            r.push(("00" + s).substr(s.length))
        }
        return r.join("")
    }
    function Jt(e, t) {
        if (!e)
            return "";
        if (He(t) || (t = 1),
        Vt(e) || Xt(e)) {
            let n = Qt(e);
            return n ? "rgba(" + n.r + "," + n.g + "," + n.b + "," + t + ")" : ""
        }
        if (e.startsWith("#")) {
            if (3 === (e = e.substring(1)).length) {
                let t = e.charAt(0)
                  , n = e.charAt(1)
                  , r = e.charAt(2);
                e = [t, t, n, n, r, r].join("")
            }
            return "rgba(" + en(e.substring(0, 2)) + "," + en(e.substring(2, 4)) + "," + en(e.substring(4, 6)) + "," + t + ")"
        }
        return ""
    }
    t.isColor = Yt,
    t.isRgba = Vt,
    t.isRgb = Xt,
    t.dec2Hex = Zt,
    t.lighten = Gt,
    t.darken = function(e, t) {
        return Gt(e, -t)
    }
    ,
    t.color2Rgba = Jt;
    const Kt = /[0-9|\.|,]+/;
    function Qt(e) {
        if (!e)
            return null;
        if (Xt(e = e.replaceAll(" ", ""))) {
            Kt.lastIndex = 0;
            let t = (Kt.exec(e)[0] || "").split(",");
            return {
                r: t[0],
                g: t[1],
                b: t[2]
            }
        }
        if (Vt(e)) {
            Kt.lastIndex = 0;
            let t = (Kt.exec(e)[0] || "").split(",");
            return {
                r: t[0],
                g: t[1],
                b: t[2],
                a: t[3]
            }
        }
        return null
    }
    function en(e) {
        return parseInt(e, 16)
    }
    function tn(e, n, r) {
        if (!e || 0 === e.length)
            return "";
        if (n = n || {},
        "string" == typeof e) {
            let t = []
              , n = e.split("\n");
            for (let e = 0, r = n.length; e < r; e++) {
                let o = n[e];
                if (o) {
                    let e = 0
                      , n = 0
                      , r = 0;
                    for (; -1 != (n = o.indexOf("${", n)) && -1 != (r = o.indexOf("}", n + 2)); )
                        t.push(o.substring(e, n)),
                        t.push("<span>" + o.substring(n, r + 1) + "</span>"),
                        e = n = r + 1;
                    t.push(0 != r ? o.substring(r + 1) : o)
                }
                e !== r - 1 && t.push("<br>")
            }
            return t.join("")
        }
        let o = (e,t,r)=>{
            let o = [];
            if (r = r ? ' style="' + r + '"' : "",
            t && o.push('<a href="' + G(t.escapeHTML()) + '"' + r + ">"),
            "string" == typeof e || e.text) {
                let t = "string" == typeof e ? e : e.text;
                o.push(r ? "<span" + r + ">" + t.escapeHTML() + "</span>" : t)
            } else if (e.image)
                o.push('<img src="' + J(e.image.escapeHTML()) + '"' + r + "/>");
            else if (e.atuser) {
                let t = e.atuser
                  , s = n && n.users ? n.users.find(e=>e.value === t) : null;
                o.push('<span class="sz-atuser"' + r + ">@" + ((s ? s.caption : null) || t).escapeHTML() + "</span>")
            } else if (e.imageMacro) {
                let t = e.imageMacro
                  , n = t.value
                  , r = t.width || 300
                  , s = t.height || 300;
                n && o.push('<img src="' + J(n.escapeHTML()) + '" width="' + r + 'px" height="' + s + 'px"/>')
            } else if (e.macro) {
                let t = e.macro;
                t = "string" == typeof t ? t.escapeHTML() : t.toString(),
                o.push("<span" + r + ">" + t + "</span>")
            } else
                e.video && e.video.url && o.push('<video controls="controls" src="' + G(e.video.url.escapeHTML()) + '"/>');
            return t && o.push("</a>"),
            o.join("")
        }
          , s = (e,t)=>{
            if (ze(e))
                return;
            let r = n.colorDataProvider;
            for (let o in e) {
                let s = e[o];
                if (null == s)
                    continue;
                switch (o) {
                case "family":
                    s = ["font-family", s];
                    break;
                case "bold":
                    s = !0 === s ? ["font-weight", "bold"] : null;
                    break;
                case "italic":
                    s = !0 === s ? ["font-style", "italic"] : null;
                    break;
                case "underline":
                    s = !0 === s ? ["text-decoration", "underline"] : null;
                    break;
                case "lineThrough":
                    s = !0 === s ? ["text-decoration", "line-through"] : null;
                    break;
                case "color":
                    s = ["color", r ? r.getStyleConvertor().convertColor(s) : s];
                    break;
                case "size":
                    s = ["font-size", n ? `${!n.em && n.scale ? n.scale * s / (n.commonFontSize ? n.commonFontSize : 1) : s / (n.commonFontSize ? n.commonFontSize : 1)}${n.em ? "em" : "px"}` : `${s}px`];
                    break;
                case "background":
                    s = ["background-color", r ? r.getStyleConvertor().convertColor(s.value) : s];
                    break;
                case "textAlign":
                    s = ["text-align", s];
                    break;
                case "lineHeight":
                    s = ["line-height", n && n.scale ? n.scale * s : s];
                    break;
                case "textHeader":
                case "textList":
                case "textIndent":
                    break;
                default:
                    s = null
                }
                if (null == s)
                    continue;
                let i = t.get(s[0]);
                t.set(s[0], i ? i + " " + s[1] : s[1])
            }
        }
          , i = e=>{
            if (ze(e))
                return "";
            let t = new Map;
            s(e, t),
            s(e.font, t);
            let n = [];
            return t.forEach((e,t)=>n.push([t, e])),
            n.map(e=>e.join(":")).join(";")
        }
          , l = []
          , a = 0
          , c = e=>{
            let t = i(e)
              , n = e && e.textHeader ? "h" + e.textHeader : "p";
            l.splice(a, 0, "<" + n + (t ? ' style="' + t + '"' : "") + ">"),
            l.length - 1 === a && l.push("<br>"),
            l.push("</" + n + ">"),
            a = l.length
        }
        ;
        let d = !1;
        for (let u = 0, h = e.length; u < h; u++) {
            let n = e[u]
              , s = n.text
              , a = n.style;
            if (null != r && null == (a && a.lineHeight) && ((a = t.assign({}, a)).lineHeight = r),
            u == h - 1) {
                let e = xe(n);
                delete e.style,
                s && 0 != s.length ? s += "\n" : !ze(a) && ze(e) ? s = "\n" : d = !0
            }
            let m = i(a)
              , g = a ? a.link : null
              , p = u < h - 1 ? e[u + 1] : null
              , f = !p || "\n" !== p.text && ["text", "image", "macro", "imageMacro", "atuser", "video"].find(e=>null != p[e]) ? null : p.style || {};
            if (f && u++,
            !s || -1 === s.indexOf("\n")) {
                l.push(o(n, g, m)),
                f && c(f);
                continue
            }
            let y = s.split("\n");
            for (let e = 0, t = y.length; e < t; e++)
                e != t - 1 ? (y[e] && l.push(o(y[e], g, m)),
                c()) : f ? (y[e] && l.push(o(y[e], g, m)),
                c(f)) : y[e] && l.push(o(y[e], g, m))
        }
        return d && c(),
        l.join("")
    }
    t.parseRgba = Qt,
    t.rgba2color = function(e) {
        if (!e || "#" == e.charAt(0))
            return e;
        let t = Qt(e);
        return null == t ? e : "0" == t.a ? "transparent" : "#" + Zt(parseFloat(t.r)) + Zt(parseFloat(t.g)) + Zt(parseFloat(t.b))
    }
    ,
    t.hex2Dec = en,
    t.getQuillHtml = function(e, t) {
        if (!e || 0 === e.length)
            return Promise.resolve("");
        if ("string" == typeof e)
            return Promise.resolve(tn(e));
        let n = [];
        for (let r = 0, o = e.length; r < o; r++) {
            let t = e[r];
            t && t.atuser && n.push(t.atuser)
        }
        return t ? t.userDataProvider && n.length ? t.userDataProvider.findItemsByValues(n).then(n=>Promise.resolve(tn(e, {
            colorDataProvider: t.colorDataProvider,
            users: n,
            scale: t.scale,
            em: t.em,
            commonFontSize: t.commonFontSize
        }))) : Promise.resolve(tn(e, t)) : Promise.resolve(tn(e))
    }
    ,
    t.getQuillHtmlSync = tn,
    t.getThemeColor = function(e, n) {
        if (!e || ze(n))
            return e || "";
        let r = t.THEME_COLOR_NAMES.findIndex(t=>t === e);
        return -1 !== r ? n[r] : e
    }
    ,
    t.MAIN_THEME_COLORS = ["bg1", "font", "bg2", "color1", "color2", "color3", "color4", "color5", "color6", "color7"],
    t.MAIN_THEME_GRADIENTCOLORS = ["gradientColor1", "gradientColor2", "gradientColor3", "gradientColor4", "gradientColor5", "gradientColor6", "gradientColor7", "gradientColor8", "gradientColor9", "gradientColor10"],
    t.THEME_COLOR_NAMES = [];
    for (let Bn = 0, Nn = t.MAIN_THEME_COLORS.length; Bn < Nn; Bn++) {
        let e = t.MAIN_THEME_COLORS[Bn];
        t.THEME_COLOR_NAMES[Bn] = e;
        for (let n = 0, r = 5; n < r; n++)
            t.THEME_COLOR_NAMES[(n + 1) * Nn + Bn] = e + "@" + n
    }
    class SysDefaultStyleConvertor {
        convertColor(e) {
            return e
        }
        convertZoomSize(e) {
            return e
        }
        convertImage(e) {
            return e
        }
        convertIcon(e) {
            return e
        }
        convertCssZoomSize(e) {
            return `${e}px`
        }
    }
    let nn;
    function rn() {
        return nn || (nn = new SysDefaultStyleConvertor)
    }
    function on(e) {
        return e && ("string" == typeof e && t.MAIN_THEME_GRADIENTCOLORS.find(t=>t === e) || "object" == typeof e && ("linearGradients" === e.type || "radialGradients" === e.type)) ? "gradient" : "color"
    }
    function sn(e, t, n) {
        let r = e;
        if (ze(r.borderImage) || "none" === r.borderImageSource || Object.assign(r, {
            borderImage: "none",
            borderWidth: "initial",
            borderStyle: "none",
            borderColor: ""
        }),
        !t)
            return r.background = "",
            e;
        let o = function(e) {
            let t = Number(100 * e).toFixed(2);
            return t += "%"
        }
          , s = e=>e ? "string" == typeof e ? e : Jt(e.color, e.opacity / 100) : ""
          , i = t.type
          , l = t.value;
        switch (i) {
        case "none":
        case "animationEffect":
            r.background = "none",
            r.borderImage = "none";
            break;
        case "color":
            r.borderImage = "none",
            r.background = s(n ? n.convertColor(l) : l);
            break;
        case "gradient":
            {
                r.borderImage = "none";
                let e = n ? n.convertColor(l) : l
                  , t = e.type
                  , i = e.value
                  , a = "";
                for (let r = 0, l = i.length; r < l; r++) {
                    let e = i[r]
                      , t = n ? e[0] : s(e[0])
                      , c = o(e[1]);
                    a += r === l - 1 ? `${t} ${c}` : `${t} ${c}, `
                }
                switch (t) {
                case "linearGradients":
                    {
                        let t = e.deg;
                        r.background = `linear-gradient(${t}deg, ${a})`;
                        break
                    }
                case "radialGradients":
                    r.background = `radial-gradient(circle, ${a})`
                }
                break
            }
        case "picture":
            {
                r.borderImage = "none";
                let t = l
                  , o = t.type
                  , s = n ? n.convertImage(t.image) : t.image;
                if (!s)
                    return r.background = "none",
                    e;
                let i = K(s)
                  , a = t.width
                  , c = parseFloat(a)
                  , d = parseFloat(t.height)
                  , u = t.zoom / 100
                  , h = a && a.endsWith && a.endsWith("em")
                  , m = c && d ? `/${u * c}${h ? "em" : "px"} ${u * d}${h ? "em" : "px"}` : "";
                switch (o) {
                case "original":
                    {
                        let e = `${"left" === t.align ? "left" : "right" === t.align ? "right" : "center"} ${"top" === t.vAlign ? "top" : "bottom" === t.vAlign ? "bottom" : "center"}`;
                        r.background = `${i} no-repeat ${e}${m}`;
                        break
                    }
                case "stretch":
                    r.background = `${i} no-repeat center/100% 100%`;
                    break;
                case "cover":
                    r.background = `${i} no-repeat center/cover`;
                    break;
                case "contain":
                    r.background = `${i} no-repeat center/contain`;
                    break;
                case "clip":
                    {
                        let e = t.top
                          , n = t.right
                          , o = t.bottom
                          , s = t.left;
                        r.background = "none",
                        r.borderImage = `${i} fill ${e} ${n} ${o} ${s}`,
                        r.borderWidth = `${e}px ${n}px ${o}px ${s}px`,
                        r.borderStyle = "solid",
                        r.borderColor = "transparent";
                        break
                    }
                case "repeat":
                    switch (t.repeatType) {
                    case "repeat":
                        r.background = `${i} repeat left top${m}`;
                        break;
                    case "repeat-x":
                        r.background = `${i} repeat-x left top${m}`;
                        break;
                    case "repeat-y":
                        r.background = `${i} repeat-y left top${m}`
                    }
                    break
                }
                break
            }
        }
        return e
    }
    function ln(e, t, r, o) {
        let s = e;
        if (!t)
            return e;
        let i = t.fontSize;
        if (t.code) {
            s.fontFamily = "szfont";
            let e = t.color;
            if (e)
                if ("gradient" === on(e))
                    n.browser.firefox || n.browser.msie ? s.color = "#000000" : (sn(s, {
                        type: "gradient",
                        value: e
                    }, r),
                    s.color = "transparent",
                    s.webkitBackgroundClip = "text");
                else {
                    let t = e;
                    s.color = r ? r.convertColor(t) : "string" == typeof t ? t : Jt(t.color, null == t.opacity ? 1 : t.opacity / 100)
                }
            s.fontSize = r ? r.convertCssZoomSize(i) : `${i}px`
        } else
            s.fontSize = "inherit",
            s.backgroundImage = K(r && r.convertIcon(t.image, t.color) || t.image),
            s.display = "inline-block",
            s.backgroundPosition = "center",
            s.backgroundRepeat = "no-repeat",
            s.backgroundSize = o || "contain",
            s.width = r ? r.convertCssZoomSize(i) : `${i}px`,
            s.height = r ? r.convertCssZoomSize(i) : `${i}px`,
            s.verticalAlign = "text-bottom";
        return e
    }
    function an(e, t) {
        if (!e)
            return "";
        if ("none" === e.type)
            return "none";
        let n = `${e.type} ${t ? t.convertColor(e.color) : e.color}`;
        return null == e.width ? n : `${e.width}px ${n}`
    }
    function cn(e, t, n, r, o) {
        let s = n;
        if (t)
            if (s)
                Object.assign(s.style, t);
            else {
                r.insertRule ? r.insertRule(`${e}{}`, o ? 0 : r.cssRules.length) : r.addRule(`${e}`, null, o ? 0 : r.cssRules.length);
                let n = r.cssRules;
                s = n[o ? 0 : r.cssRules.length - 1],
                Object.assign(s.style, t),
                s.styleMap && 0 === s.styleMap.size && (r.deleteRule(n.length - 1),
                s = null)
            }
        else if (s) {
            let e = (e,t)=>{
                let n;
                for (let r = 0, o = e.length; r < o; r++)
                    if (e[r].selectorText === t.selectorText) {
                        n = r;
                        break
                    }
                return n
            }
            ;
            r.deleteRule(e(r.cssRules, s)),
            s = null
        }
        return s
    }
    function dn(e) {
        if (null == e)
            return;
        let t = e.animationeffect;
        t && (e.effect_times = (e.effect_times || 0) + 1,
        t.dispose(),
        e.animationeffect = null)
    }
    function un(...e) {
        let t, n = "", r = !1;
        for (let i = e.length - 1; i >= 0 && !r; i--)
            null != (t = e[i]) && 0 !== t.length && (n = t + "/" + n,
            r = "/" === t[0]);
        let o = n.split("/")
          , s = [];
        for (let i = 0; i < o.length; i++)
            null != (t = o[i]) && 0 !== t.length && "." !== t && (".." === t ? s.pop() : s.push(t));
        return (r ? "/" : "") + s.join("/")
    }
    t.SysDefaultStyleConvertor = SysDefaultStyleConvertor,
    t.getDefaultStyleConvertor = rn,
    t.getColorType = on,
    t.setCssFilterStyle = function(e, t, n) {
        let r, o = e;
        return t && "none" !== t ? ("string" == typeof t ? !(r = n && n.convertCssFilter && n.convertCssFilter(t)) && (r = {
            brightness: 1,
            contrast: 1,
            grayscale: 0,
            hueRotate: 0,
            invert: 0,
            saturate: 1,
            sepia: 0
        }) : r = t,
        o.filter = `brightness(${100 * r.brightness}%) contrast(${100 * r.contrast}%) grayscale(${100 * r.grayscale}%) hue-rotate(${r.hueRotate}deg) \n\tinvert(${100 * r.invert}%) saturate(${100 * r.saturate}%) sepia(${100 * r.sepia}%)`,
        e) : (o.filter = "none",
        e)
    }
    ,
    t.setColorStyle = function(e, t, n) {
        return e.background = "",
        t ? (sn(e, {
            type: on(t),
            value: t
        }, n),
        e) : e
    }
    ,
    t.setFillStyle = sn,
    t.setIconStyle = ln,
    t.getBorderCssValue = an,
    t.setBorderStyle = function(e, t, n) {
        let r = e;
        if (!t)
            return r.border = "",
            e;
        let o = t.all
          , s = o && an(o, n);
        return r.borderTop = s || an(t.top, n),
        r.borderRight = s || an(t.right, n),
        r.borderBottom = s || an(t.bottom, n),
        r.borderLeft = s || an(t.left, n),
        e
    }
    ,
    t.setFontStyle = function(e, t, r=!1, o) {
        let s, i = e;
        if (!t)
            return i.font = "",
            i.textDecoration = "",
            i.color = "",
            i.background = "",
            i.webkitBackgroundClip = "",
            e;
        t.family && (i.fontFamily = t.family),
        null != t.bold && (i.fontWeight = t.bold ? "bold" : "normal"),
        null != t.italic && (i.fontStyle = t.italic ? "italic" : "normal"),
        s = t.underline && t.lineThrough ? "underline line-through" : t.underline ? "underline" : t.lineThrough ? "line-through" : "",
        i.textDecoration = s;
        let l = t.color;
        if (l)
            if ("gradient" === on(l))
                n.browser.firefox || n.browser.msie ? i.color = "#000000" : (sn(i, {
                    type: "gradient",
                    value: l
                }, o),
                i.color = "transparent",
                i.webkitBackgroundClip = "text");
            else {
                let e = l;
                i.color = o ? o.convertColor(e) : "string" == typeof e ? e : Jt(e.color, e.opacity / 100)
            }
        let a = t.size;
        return a && (i.fontSize = o && o.convertCssZoomSize(a) || `${a}px`),
        e
    }
    ,
    t.setPaddingStyle = function(e, t, n) {
        let r = e;
        if (!t)
            return r.padding = "",
            e;
        let o = t.all
          , s = e=>n ? n.convertCssZoomSize(e) : `${e}px`;
        return r.padding = null != o ? `${s(o)}` : `${s(t.top)} ${s(t.right)} ${s(t.bottom)} ${s(t.left)}`,
        e
    }
    ,
    t.setBorderRadiusStyle = function(e, t, n, r) {
        let o = e;
        if (!t)
            return o.borderRadius = "",
            e;
        let s = parseInt(r);
        if (null != r && "custom" !== r && "number" == typeof (s = parseInt(r)))
            return o.borderRadius = n ? n.convertCssZoomSize(s) : `${s}px`,
            e;
        let i = t.all
          , l = e=>n ? n.convertCssZoomSize(e) : `${e}px`;
        return o.borderRadius = null != i ? `${l(i)}` : `${l(t.topLeft)} ${l(t.topRight)} ${l(t.bottomRight)} ${l(t.bottomLeft)}`,
        e
    }
    ,
    t.setShadowStyle = function(e, t, n, r) {
        let o = e;
        if (!t && !r)
            return o.boxShadow = "",
            e;
        let s = e=>{
            if (!e)
                return "";
            let t = e.color
              , r = "inset" === e.type;
            return t && "none" !== t ? `${r ? "inset " : ""}${e.x}px ${e.y}px ${e.blur}px ${e.spread}px ${n ? n.convertColor(e.color) : e.color}` : ""
        }
          , i = s(t)
          , l = s(r);
        return o.boxShadow = i || l ? `${i}${i && l ? "," : ""}${l}` : "",
        e
    }
    ,
    t.setTextShadowStyle = function(e, t, n) {
        let r = e;
        if (!t)
            return r.textShadow = "",
            e;
        let o = t.color;
        return r.textShadow = o && "none" !== o ? `${t.x}px ${t.y}px ${t.blur}px ${n ? n.convertColor(t.color) : t.color}` : "",
        e
    }
    ,
    t.setMarginStyle = function(e, t, n) {
        let r = e;
        if (!t)
            return r.margin = "",
            e;
        let o = t.all
          , s = e=>n ? n.convertCssZoomSize(e) : `${e}px`;
        return r.margin = null != o ? `${s(o)}` : `${s(t.top)} ${s(t.right)} ${s(t.bottom)} ${s(t.left)}`,
        e
    }
    ,
    t.setAlignStyle = function(e, t, n) {
        let r = e;
        return t || n ? (r.justifyContent = t ? "center" === t ? "center" : "right" === t ? "flex-end" : "flex-start" : "",
        r.alignItems = n ? "top" === n ? "flex-start" : "bottom" === n ? "flex-end" : "center" : "",
        r.verticalAlign = n || "",
        r.display = "flex",
        "distributed" === t ? (r.textAlign = "justify",
        r.textAlignLast = "justify") : "justify" === t ? (r.textAlign = "justify",
        r.textAlignLast = "") : (r.textAlign = t || "",
        r.textAlignLast = ""),
        e) : (r.display = "",
        r.alignItems = "",
        r.justifyContent = "",
        r.textAlign = "",
        r.textAlignLast = "",
        e)
    }
    ,
    t.renderDomWatermark = function(e, t, n) {
        let r = t.watermarkType || "txt"
          , o = e.style;
        e.classList.toggle("watermark", !0);
        let s, i = t.watermarkRotate || 0, l = !1;
        if ("txt" === r) {
            o.backgroundImage = function(e, t) {
                let n = t.font
                  , r = n.size
                  , o = n.color
                  , s = n.family;
                return `url("${"data:image/svg+xml," + `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg" style = "transform:rotate(${t.rotate}deg)">\n\t<text x="50%" y="50%" font-size="${r}" fill = "${o}" fill-opacity = "1" font-family = "${s}"\n\t text-anchor="middle" dominant-baseline="middle">${e}</text></svg>`.trim().replace(/\n/g, "").replace(/"/g, "'").replace(/%/g, "%25").replace(/#/g, "%23").replace(/{/g, "%7B").replace(/}/g, "%7D").replace(/</g, "%3C").replace(/>/g, "%3E")}")`
            }(t.watermarkTxt, {
                font: {
                    size: t.watermarkFontSize || 20,
                    family: t.watermarkFontFamily,
                    color: n.convertColor(t.watermarkFontColor || "#D2D2D2")
                },
                rotate: i
            });
            let e = l = !!t.watermarkRepeat;
            o.backgroundRepeat = e ? "repeat" : "no-repeat"
        } else {
            sn(o, {
                type: "picture",
                value: t.watermarkImg
            }, n);
            let e = t.watermarkImg;
            "repeat" === (null == e ? void 0 : e.type) && (l = !0),
            Object.assign(o, {
                transform: `rotate(${i}deg)`
            })
        }
        switch (t.watermarkPosition) {
        case "leftTop":
            s = "left top";
            break;
        case "rightTop":
            s = "right top";
            break;
        case "leftBottom":
            s = "left bottom";
            break;
        case "rightBottom":
            s = "right bottom";
            break;
        default:
            s = "center"
        }
        o.backgroundPosition = s,
        o.transformOrigin = l ? "" : s,
        e.classList.toggle("mark-repeat", l),
        e.classList.toggle("erosion", !!t.erosion)
    }
    ,
    t.updateCssRule = cn,
    t.setAnimationEffect = function(t) {
        if (null == t)
            return Promise.resolve();
        let n = t.name
          , r = t.dom;
        if (r.effect_times = (r.effect_times || 0) + 1,
        null == r || ze(n))
            return dn(r),
            Promise.resolve();
        let o = r.animationeffect;
        if (o && o.getName() === n)
            return o.render(t);
        let s = t.implClass || "default";
        if ("string" == typeof s) {
            let n = t.depends;
            if (!n)
                throw new Error("depends is null!");
            const o = r.effect_times;
            return new Promise((t,r)=>{
                e([Q(n)], t, r)
            }
            ).then(__importStar).then(e=>{
                r.effect_times === o && (dn(r),
                (r.animationeffect = new e[s]).render(t))
            }
            )
        }
        dn(r),
        (r.animationeffect = new s).render(t)
    }
    ,
    t.resizeAnimationEffect = function(e) {
        if (null == e)
            return;
        let t = e.animationeffect;
        t && t.resize()
    }
    ,
    t.disposeAnimationEffect = dn,
    t.relativePath = function(e, t) {
        let n = "/" === e ? [""] : e.split("/")
          , r = "/" === t ? [""] : t.split("/")
          , o = n.length
          , s = r.length
          , i = Math.min(o, s)
          , l = i;
        for (let d = 0; d < i; d++)
            if (n[d] !== r[d]) {
                l = d;
                break
            }
        if (0 == l)
            return t;
        let a = [];
        for (let d = l; d < o; d++)
            a.push("..");
        let c = a.concat(r.slice(l)).join("/");
        return c.endsWith("..") ? c + "/" : c
    }
    ,
    t.resolvePathToUrl = function(e, t) {
        let n = window.location.origin;
        return null == n || "" == n ? n : e.startsWith("//") ? window.location.protocol + e : e.startsWith("/") ? n + e : e.match(/^(\S+:\/\/)/) ? e : n + G(un(t || "", e))
    }
    ,
    t.resolvePathOrUrl = function(e, t) {
        return null == e || "" == e ? "/" : e.startsWith("//") ? window.location.protocol + e : e.match(/^(\S+:\/\/)/) ? e : e.startsWith("/") ? e : un(t || "", e)
    }
    ,
    t.resolvePath = un,
    t.getBaseName = function(e) {
        if (!e)
            return;
        let t = e.lastIndexOf(".")
          , n = e.lastIndexOf("/");
        return e.substring(n + 1, t > 0 && t > n ? t : e.length)
    }
    ,
    t.getParentDir = function(e) {
        if (!e)
            return;
        let t = e.lastIndexOf("/");
        return t < 0 ? void 0 : e.substring(0, t)
    }
    ;
    t.CaseInsensitiveMap = class CaseInsensitiveMap extends Map {
        constructor(e) {
            if (super(),
            e)
                for (const [t,n] of e)
                    this.set(t, n);
            return this
        }
        set(e, t) {
            return Map.prototype.set.call(this, this.toUpper(e), t)
        }
        delete(e) {
            return Map.prototype.delete.call(this, this.toUpper(e))
        }
        get(e) {
            return Map.prototype.get.call(this, this.toUpper(e))
        }
        has(e) {
            return Map.prototype.has.call(this, this.toUpper(e))
        }
        toUpper(e) {
            return "string" == typeof e && (e = e.toUpperCase()),
            e
        }
    }
    ,
    t.getFileType = function(e) {
        let t = e.lastIndexOf(".");
        return t < e.lastIndexOf("/") ? "" : -1 !== t ? e.substring(t + 1) : ""
    }
    ,
    t.applyMixins = function(e, t) {
        t.forEach(t=>{
            let n = e.prototype;
            Object.getOwnPropertyNames(t.prototype).forEach(r=>{
                "constructor" !== r && void 0 === n[r] && Object.defineProperty(e.prototype, r, Object.getOwnPropertyDescriptor(t.prototype, r))
            }
            )
        }
        )
    }
    ;
    const hn = "szcopydata";
    function mn(e) {
        let t = {
            html: e,
            data: null
        }
          , n = null == e ? void 0 : e.find(e=>(e=>(null == e ? void 0 : e.id) === hn)(e));
        if (!n)
            return t;
        let r = n.textContent;
        if (null == r || "" === r)
            return t;
        try {
            t.data = JSON.parse(r)
        } catch (o) {
            console.warn("getClipBoardData error:" + o)
        }
        return t
    }
    function gn(e, t) {
        var n;
        let r = e.childNodes;
        for (let o = 0, s = null !== (n = null == r ? void 0 : r.length) && void 0 !== n ? n : 0; o < s; o++) {
            let e = r[o];
            if (t(e))
                return e
        }
        return null
    }
    let pn;
    function fn() {
        let e = document.getElementsByClassName("mobileframepagemanager-base");
        return e && e.length ? 1 === e.length ? e[0].szobject : Array.from(e).find(e=>S(e)).szobject : null
    }
    t.createClipBoardDataDom = function(e) {
        if (!e)
            return null;
        let t = document.createElement("script");
        return t.type = "application/json",
        t.id = hn,
        t.textContent = JSON.stringify(e),
        t
    }
    ,
    t.getClipBoardData = mn,
    t.findChildNode = gn,
    t.getMarked = function(t, n) {
        return pn && !n ? Promise.resolve(pn) : new Promise((t,n)=>{
            e(["marked"], t, n)
        }
        ).then(__importStar).then(e=>{
            let r;
            return n ? t ? r = t : (r = t = new e.Renderer,
            n(r)) : r = new e.Renderer,
            e.setOptions({
                renderer: r
            }),
            pn = e.default
        }
        )
    }
    ,
    t.isCtrlKey = function(e) {
        return e.ctrlKey || n.browser.mac && e.metaKey
    }
    ,
    t.showMobileSelectPanel = function(t) {
        return new Promise((t,n)=>{
            e(["../commons/mobile/basic"], t, n)
        }
        ).then(__importStar).then(e=>e.showMobileSelectPanel(t))
    }
    ,
    t.showSignPanel = function(t) {
        return new Promise((t,n)=>{
            e(["../commons/mobile/basic"], t, n)
        }
        ).then(__importStar).then(e=>e.showSignPanel(t))
    }
    ,
    t.getCurrentMobileApp = fn,
    t.getCurrentPortal = function() {
        let e = document.getElementsByClassName("basetemplatepage");
        return e && e.length ? 1 === e.length ? e[0].szobject : Array.from(e).find(e=>S(e)).szobject : null
    }
    ;
    class HistoryRouter {
        constructor(e) {
            this.historys = [{
                url: Pe(),
                title: document.title
            }],
            this.currentIndex = 0,
            this.popstateHandler = this.doPopstate.bind(this),
            this.enableHistory(e.historyEnabled),
            this.onpopstate = e.onpopstate,
            window.historyRouter = this
        }
        static setForwardUrl(e) {
            HistoryRouter.forwardUrlMap || (HistoryRouter.forwardUrlMap = {}),
            HistoryRouter.forwardUrlMap[e] = Pe()
        }
        static setShortUrls(e) {
            ze(e) ? HistoryRouter.shortUrlInfos = null : HistoryRouter.shortUrlInfos = e.map(e=>{
                let n = decodeURI(e.originUrl)
                  , r = t.assign({}, e, {
                    originUrl: n
                })
                  , o = r.shortUrl;
                if (HistoryRouter.regExp.test(o)) {
                    let e = o.match(HistoryRouter.regExp);
                    r.shortUrlParamskeys = e.map(e=>{
                        return e.substring(1, e.length - 1).split(":")[0]
                    }
                    )
                }
                if (!HistoryRouter.regExp.test(n))
                    return r;
                r.originRegexp = RegExp(n.replace(/[*+?.]/g, "\\$&").replace(HistoryRouter.regExp, "([^/?&]+)"));
                let s = n.match(HistoryRouter.regExp);
                return r.originParamsKeys = s.map(e=>e.substring(1, e.length - 1)),
                r
            }
            )
        }
        static replaceUrl(e) {
            let t = HistoryRouter.shortUrlInfos
              , n = HistoryRouter.forwardUrlMap;
            if (!t && !n)
                return e;
            if (t) {
                let n = decodeURI(e);
                for (const e of t) {
                    let t = e.shortUrl;
                    if (e.originUrl === n)
                        return t;
                    if (!e.originRegexp)
                        continue;
                    let r = n.match(e.originRegexp);
                    if (r && r.length && r[0] === n)
                        return r.shift(),
                        e.originParamsKeys.forEach((e,n)=>{
                            let o = `{${e}}`;
                            t = t.includes(o) ? t.replace(o, r[n]) : t.replace(new RegExp(`{${e}:[^{}]+}`), r[n])
                        }
                        ),
                        t
                }
            }
            if (n)
                for (let r of Object.keys(n)) {
                    if (r === e)
                        return n[r];
                    let t = De(r);
                    if (De(e) === t)
                        return e.replace(t, De(n[r]))
                }
            return e
        }
        dispose() {
            window.removeEventListener("popstate", this.popstateHandler)
        }
        push(e, t) {
            let n = this.historys
              , r = this.currentIndex;
            n.splice(r + 1, n.length - r - 1, {
                url: t,
                title: e
            }),
            this.currentIndex++,
            this.historyEnabled && (t = HistoryRouter.replaceUrl(t),
            history.pushState(this.currentIndex, e, Q(t)),
            e && (document.title = e))
        }
        replace(e, t) {
            let n = this.historys
              , r = this.currentIndex;
            n.splice(r, 1, {
                url: t,
                title: e
            }),
            this.historyEnabled && (t = HistoryRouter.replaceUrl(t),
            history.replaceState(r, e, G(t)),
            e && (document.title = e))
        }
        back() {
            if (0 === this.currentIndex)
                return;
            if (this.historyEnabled)
                return void history.back();
            if (_e(this.getCurrentUrl()).params[t.MOBILE_FLOAT_COUNT])
                return this.currentIndex--,
                void yn();
            let e = this.getCurrentUrl()
              , n = this.getCurrentTitle();
            this.currentIndex--,
            Promise.resolve(this.onpopstate && this.onpopstate({
                isBack: !0,
                url: this.getCurrentUrl(),
                preUrl: e
            })).then(t=>{
                !1 === t && this.push(n, e)
            }
            )
        }
        backQuietly() {
            if (0 === this.currentIndex)
                return;
            this.currentIndex--,
            this.preventEvent = !0,
            this.historyEnabled && history.back();
            let e = this.getCurrentTitle();
            e && (document.title = e)
        }
        forward() {
            if (this.currentIndex === this.historys.length - 1)
                return;
            if (this.historyEnabled)
                return void history.forward();
            let e = this.getCurrentUrl();
            this.currentIndex++,
            Promise.resolve(this.onpopstate && this.onpopstate({
                isBack: !1,
                url: this.getCurrentUrl(),
                preUrl: e
            })).then(e=>{
                !1 === e && this.backQuietly()
            }
            )
        }
        go(e) {
            if (!e)
                return;
            if (1 === e)
                return this.forward();
            if (-1 === e)
                return this.back();
            let t = this.currentIndex + e;
            if (t >= this.historys.length || t < 0)
                return;
            if (this.historyEnabled)
                return void history.go(e);
            let n = this.getCurrentUrl();
            this.currentIndex = t,
            this.onpopstate && this.onpopstate({
                isBack: e < 0,
                url: this.getCurrentUrl(),
                preUrl: n
            })
        }
        enableHistory(e) {
            this.historyEnabled !== e && (this.historyEnabled = e,
            e ? window.addEventListener("popstate", this.popstateHandler) : window.removeEventListener("popstate", this.popstateHandler))
        }
        doPopstate(e) {
            if (this.preventEvent)
                return void (this.preventEvent = !1);
            if (null == e.state || e.state === HistoryRouter.ANDROID_WXJSSDK_STATE)
                return;
            let r = e.state
              , o = this.currentIndex;
            if (r === o)
                return;
            if (n.browser.ios) {
                let e = document.activeElement;
                e && e.blur && e.blur()
            }
            let s = o > r;
            if (s && _e(this.getCurrentUrl()).params[t.MOBILE_FLOAT_COUNT] && (this.currentIndex = r,
            yn(),
            r === o - 1))
                return;
            let i = this.getCurrentUrl();
            this.currentIndex = r,
            Promise.resolve(this.onpopstate && this.onpopstate({
                srcEvent: e,
                isBack: s,
                preUrl: i,
                url: this.getCurrentUrl()
            })).then(e=>{
                !1 === e && Y(20).then(()=>s ? this.push(null, i) : this.backQuietly())
            }
            )
        }
        canBack() {
            return this.currentIndex > 0
        }
        getCurrentUrl() {
            let e = this.historys;
            return this.currentIndex >= e.length ? Pe() : e[this.currentIndex].url
        }
        getCurrentTitle() {
            return this.historys[this.currentIndex].title
        }
        reset() {
            this.historys = [{
                url: Pe(),
                title: document.title
            }],
            this.currentIndex = 0
        }
        getLength() {
            return this.historys.length
        }
        getCurrentIndex() {
            return this.currentIndex
        }
    }
    function yn() {
        let e = e=>{
            let t = document.getElementsByClassName(e);
            return Array.from(t).sort((e,t)=>e.style.zIndex > t.style.zIndex ? -1 : 0).find(e=>"none" !== e.style.display)
        }
          , t = e("dialog-base");
        if (t)
            return void t.szobject.doClose();
        let n = e("mobile-floatpanel");
        if (n)
            return void n.szobject.hide();
        let r = e("gallerymobile-base");
        r && r.szobject.close()
    }
    t.HistoryRouter = HistoryRouter,
    HistoryRouter.ANDROID_WXJSSDK_STATE = "ANDROID_WXJSSDK_STATE",
    HistoryRouter.regExp = /\{[^{}]+\}/g,
    t.getShortUrlParamNames = function(e) {
        var t, n;
        return null === (n = null === (t = HistoryRouter.shortUrlInfos) || void 0 === t ? void 0 : t.find(t=>t.id === e)) || void 0 === n ? void 0 : n.shortUrlParamskeys
    }
    ,
    t.resolveShortUrl = function(e, t) {
        var n;
        let r = null === (n = HistoryRouter.shortUrlInfos) || void 0 === n ? void 0 : n.find(t=>t.id === e);
        return r ? r.shortUrl.replace(HistoryRouter.regExp, e=>{
            let n = e.substring(1, e.length - 1);
            return n = n.split(":")[0],
            t[n] || e
        }
        ) : null
    }
    ,
    t.getAllShortUrlInfos = function() {
        return HistoryRouter.shortUrlInfos
    }
    ,
    t.MOBILE_FLOAT_COUNT = ":mobile-float-count";
    const bn = e=>{
        let t = document.activeElement;
        t && t !== document.body && (t.contains(e.target) || t.blur && t.blur())
    }
    ;
    class MobileScrollFix {
        constructor(e) {
            if (e) {
                if (n.browser.ios) {
                    let e = document.body;
                    e.style.cursor = "pointer",
                    e.addEventListener("click", bn)
                }
                this.container = e,
                this.touchstartHandler = this.doTouchStart.bind(this),
                this.touchmoveHandler = this.doTouchMove.bind(this),
                this.focusoutHandler = this.doFocusout.bind(this),
                this.focusinHandler = this.doFocusin.bind(this),
                n.browser.ios && n.browser.weixin && (e.addEventListener("focusin", this.focusinHandler),
                e.addEventListener("focusout", this.focusoutHandler)),
                e.style.webkitOverflowScrolling = "touch",
                e.style.overflow = "auto"
            }
        }
        dispose() {
            let e = this.container;
            e && (e.removeEventListener("touchstart", this.touchstartHandler),
            e.removeEventListener("touchmove", this.touchmoveHandler),
            e.removeEventListener("focusout", this.focusoutHandler),
            e.removeEventListener("focusin", this.focusinHandler),
            this.container = this.touchstartHandler = this.touchmoveHandler = this.focusoutHandler = this.focusinHandler = null)
        }
        doTouchStart(e) {
            let t = this.container
              , n = t.scrollTop;
            this.allowUp = n > 0,
            this.allowDown = n < t.scrollHeight - t.clientHeight,
            this.slideBeginY = e.targetTouches[0].pageY
        }
        doTouchMove(e) {
            let t = e.targetTouches[0].pageY
              , n = t > this.slideBeginY
              , r = t < this.slideBeginY;
            (n && this.allowUp || r && this.allowDown) && e.stopPropagation(),
            this.slideBeginY = t;
            let o = this.container
              , s = o.scrollTop;
            this.allowUp = s > 0,
            this.allowDown = s < o.scrollHeight - o.clientHeight
        }
        doFocusin(e) {
            this.blurScrollTimer && Cn(e.target) && clearTimeout(this.blurScrollTimer)
        }
        doFocusout(e) {
            Cn(e.target) && (this.blurScrollTimer = setTimeout(()=>{
                this.blurScrollTimer = null,
                window.scroll(0, 0)
            }
            , 100))
        }
    }
    let wn, Sn;
    t.MobileScrollFix = MobileScrollFix,
    t.enhanceHtml2canvas = function(n, r) {
        return (()=>{
            let e = n.ownerDocument;
            if (!e)
                return;
            let t = e.getElementById("_download_hi_");
            t && t.parentNode.removeChild(t)
        }
        )(),
        new Promise((t,n)=>{
            e(["html2canvas"], t, n)
        }
        ).then(__importStar).then(e=>{
            let o = {}
              , s = [];
            return function t(n) {
                let r = n.children;
                for (let e = 0, o = r.length; e < o; e++)
                    t(r.item(e));
                !function(t) {
                    let n = getComputedStyle(t)
                      , r = t.getBoundingClientRect()
                      , i = r.width
                      , l = r.height
                      , a = n.borderImageSource
                      , c = n.background
                      , d = `${c}*${n.borderImage}*${i}*${l}`;
                    if (null == o[d] && "none" != a) {
                        function u(t) {
                            let n = document.createElement("div");
                            n.className = "enhanceHtml2canvas-bg";
                            let r = n.style;
                            return r.position = "absolute",
                            r.left = "-9999px",
                            r.top = "-9999px",
                            r.width = `${i}px`,
                            r.height = `${l}px`,
                            r.background = t,
                            document.body.appendChild(n),
                            e.default(n, {
                                scale: 1,
                                backgroundColor: "rgba(0,0,0,0)"
                            }).then(e=>(document.body.removeChild(n),
                            e))
                        }
                        s.push(new Promise(e=>{
                            let t = new Image;
                            t.style.left = "-9999px",
                            t.style.top = "-9999px",
                            t.onload = function() {
                                e(t)
                            }
                            ,
                            t.onabort = t.onerror = function() {
                                e(null)
                            }
                            ,
                            a.startsWith("url") ? t.src = a.substring(5, a.length - 2) : u(a).then(e=>{
                                t.src = `${e.toDataURL("image/png")}`
                            }
                            )
                        }
                        ).then(e=>{
                            if (!e)
                                return;
                            let t = n.borderImageSlice
                              , r = n.borderImageWidth
                              , s = n.borderImageOutset
                              , a = n.borderImageRepeat
                              , h = e.width
                              , m = e.height
                              , g = parseFloat(n.borderTopWidth)
                              , p = parseFloat(n.borderRightWidth)
                              , f = parseFloat(n.borderBottomWidth)
                              , y = parseFloat(n.borderLeftWidth)
                              , b = t.endsWith("fill")
                              , w = (b ? t.substr(0, t.length > 4 ? t.length - 5 : t.length - 4) : t).split(" ")
                              , S = w[0] || "100%"
                              , C = w[1] || w[0] || "100%"
                              , v = w[2] || w[0] || "100%"
                              , x = w[3] || w[1] || w[0] || "100%"
                              , E = S.endsWith("%") ? parseFloat(S.substr(0, S.length - 1)) / 100 * m : parseFloat(S)
                              , M = C.endsWith("%") ? parseFloat(C.substr(0, C.length - 1)) / 100 * h : parseFloat(C)
                              , T = v.endsWith("%") ? parseFloat(v.substr(0, v.length - 1)) / 100 * m : parseFloat(v)
                              , D = x.endsWith("%") ? parseFloat(x.substr(0, x.length - 1)) / 100 * h : parseFloat(x)
                              , P = h - D - M;
                            P < 0 && (P = 0);
                            let I = m - E - T;
                            I < 0 && (I = 0);
                            let _ = D
                              , $ = h - M
                              , L = D
                              , A = P
                              , k = M
                              , O = E
                              , R = m - T
                              , F = E
                              , B = I
                              , N = T
                              , j = r.split(" ")
                              , H = "auto"
                              , z = j[0] || H
                              , U = j[1] || j[0] || H
                              , W = j[2] || j[0] || H
                              , q = j[3] || j[1] || j[0] || H
                              , Y = z === H ? E : z.endsWith("%") ? parseFloat(z.substr(0, z.length - 1)) / 100 * m : parseFloat(z) * g
                              , V = U === H ? M : U.endsWith("%") ? parseFloat(U.substr(0, U.length - 1)) / 100 * h : parseFloat(U) * p
                              , X = W === H ? T : W.endsWith("%") ? parseFloat(W.substr(0, W.length - 1)) / 100 * m : parseFloat(W) * f
                              , Z = q === H ? D : q.endsWith("%") ? parseFloat(q.substr(0, q.length - 1)) / 100 * h : parseFloat(q) * y
                              , G = i - V - Z
                              , J = l - Y - X
                              , K = s.split(" ")
                              , Q = K[0] || "0"
                              , ee = K[1] || K[0] || "0"
                              , te = K[2] || K[0] || "0"
                              , ne = K[3] || K[1] || K[0] || "0"
                              , re = Q.endsWith("px") ? parseFloat(Q.substr(0, Q.length - 2)) : parseFloat(Q) * g
                              , oe = ee.endsWith("px") ? parseFloat(ee.substr(0, ee.length - 2)) : parseFloat(ee) * p
                              , se = te.endsWith("px") ? parseFloat(te.substr(0, te.length - 2)) : parseFloat(te) * f
                              , ie = ne.endsWith("px") ? parseFloat(ne.substr(0, ne.length - 2)) : parseFloat(ne) * y
                              , le = -ie
                              , ae = Z - ie
                              , ce = i + oe - V
                              , de = Z
                              , ue = G + ie + oe
                              , he = V
                              , me = -re
                              , ge = Y - re
                              , pe = l + se - X
                              , fe = Y
                              , ye = J + re + se
                              , be = X
                              , we = document.createElement("canvas");
                            we.className = "enhanceHtml2canvas-canvas",
                            we.style.position = "absolute",
                            we.style.left = "-9999px",
                            we.style.top = "-9999px",
                            document.body.appendChild(we);
                            let Se = we.getContext("2d");
                            Se.clearRect(-ie, -re, i + ie + oe, l + re + se),
                            we.width === i && we.height === l || (we.width = i,
                            we.height = l);
                            let Ce = "none" === c ? Promise.resolve() : u(c).then(e=>{
                                let t = e.getContext("2d").getImageData(0, 0, i, l);
                                Se.putImageData(t, 0, 0)
                            }
                            )
                              , ve = (e,t,n,r,o,s,i,l,a)=>{
                                0 !== r && 0 !== o && 0 !== l && 0 !== a && Se.drawImage(e, t, n, r, o, s, i, l, a)
                            }
                            ;
                            return Ce.then(()=>{
                                if ("repeat" === a) {
                                    let t = A * fe / F
                                      , n = Math.floor(ue / t)
                                      , r = (ue - n) / 2;
                                    ve(e, _, 0, A, F, ae + r - t, me, t, fe);
                                    for (let m = 0; m <= n; m++)
                                        ve(e, _, 0, A, F, ae + r + m * t, me, t, fe);
                                    let o = A * be / N
                                      , s = Math.floor(ue / o)
                                      , i = (ue - s) / 2;
                                    ve(e, _, R, A, N, ae + i - o, pe, o, be);
                                    for (let m = 0; m <= s; m++)
                                        ve(e, _, R, A, N, ae + i + m * o, pe, o, be);
                                    let l = B * de / L
                                      , a = Math.floor(ye / l)
                                      , c = (ye - a) / 2;
                                    ve(e, 0, O, L, B, le + c - l, ge, de, l);
                                    for (let m = 0; m <= a; m++)
                                        ve(e, 0, O, L, B, le + c + m * l, ge, de, l);
                                    let d = B * he / k
                                      , u = Math.floor(ye / d)
                                      , h = (ye - u) / 2;
                                    ve(e, $, O, k, B, ce + h - d, ge, he, d);
                                    for (let m = 0; m <= u; m++)
                                        ve(e, $, O, k, B, ce + h + m * d, ge, he, d)
                                } else if ("round" === a) {
                                    let t = Math.ceil(ue / (A * fe / F))
                                      , n = ue / t;
                                    for (let c = 0; c < t; c++)
                                        ve(e, _, 0, A, F, ae + c * n, me, n, fe);
                                    let r = Math.ceil(ue / (A * be / N))
                                      , o = ue / r;
                                    for (let c = 0; c < r; c++)
                                        ve(e, _, R, A, N, ae + c * o, pe, o, be);
                                    let s = Math.ceil(ye / (B * de / L))
                                      , i = ye / s;
                                    for (let c = 0; c < s; c++)
                                        ve(e, 0, O, L, B, le, ge + c * i, de, i);
                                    let l = Math.ceil(ye / (B * he / k))
                                      , a = ye / l;
                                    for (let c = 0; c < l; c++)
                                        ve(e, $, O, k, B, ce, ge + c * a, he, a)
                                } else
                                    ve(e, _, 0, A, F, ae, me, ue, fe),
                                    ve(e, 0, O, L, B, le, ge, de, ye),
                                    ve(e, $, O, k, B, ce, ge, he, ye),
                                    ve(e, _, R, A, N, ae, pe, ue, be);
                                ve(e, 0, 0, L, F, le, me, de, fe),
                                ve(e, $, 0, k, F, ce, me, he, fe),
                                ve(e, 0, R, L, N, le, pe, de, be),
                                ve(e, $, R, k, N, ce, pe, he, be),
                                b && A > 0 && B > 0 && ue > 0 && ye > 0 && ve(e, _, O, A, B, ae, ge, ue, ye),
                                o[d] = `url(${we.toDataURL("image/png")})`,
                                document.body.removeChild(we)
                            }
                            )
                        }
                        ))
                    }
                }(n)
            }(n),
            Promise.all(s).then(()=>{
                let s = t.assign({
                    scale: 1,
                    scrollX: -window.scrollX,
                    scrollY: -window.scrollY
                }, r, {
                    onclone: e=>{
                        if (function e(t) {
                            let n = t.children
                              , r = n ? n.length : 0;
                            for (let o = 0; o < r; o++)
                                e(n.item(o));
                            if (1 === t.nodeType) {
                                let e = getComputedStyle(t)
                                  , n = t.style;
                                if ("none" !== e.borderImageSource) {
                                    let r = t.getBoundingClientRect()
                                      , s = `${e.background}*${e.borderImage}*${r.width}*${r.height}`
                                      , i = o[s];
                                    i && (n.background = i,
                                    n.backgroundSize = "100%"),
                                    n.borderImage = "none",
                                    n.border = "none"
                                }
                            }
                        }(e),
                        r && r.onclone)
                            return r.onclone(e)
                    }
                });
                return e.default(n, s)
            }
            )
        }
        )
    }
    ,
    t.showNoPermissionPage = function(t=document.body) {
        return new Promise((t,n)=>{
            e(["sys/sys-error"], t, n)
        }
        ).then(__importStar).then(e=>(!wn || wn.isDisposed() ? wn = new e.NoPermissionPage({
            traceDispose: !1,
            domParent: t
        }) : wn.setDomParent(t),
        wn))
    }
    ,
    t.setConsoleLevel = function(e, t) {
        let n = {
            list: e
        };
        return t && (n.clusterName = t),
        ye({
            url: "/api/settings/services/setConsoleLevel",
            data: n
        })
    }
    ,
    t.deleteConsoleLevel = function(e, t) {
        let n = {
            package: e
        };
        return t && (n.clusterName = t),
        ye({
            url: "/api/settings/services/deleteConsoleLevel",
            data: n
        })
    }
    ,
    t.getFontFamilyDataProvider = function() {
        return Sn || (Sn = new FontDataProvider)
    }
    ;
    class FontDataProvider {
        ensureLoadedData() {
            return this.data ? Promise.resolve(this.data) : this.requestLoadData().then(()=>this.data || (this.data = []))
        }
        requestLoadData() {
            return null != this.loadDataPromise ? this.loadDataPromise : this.loadDataPromise = new Promise((t,n)=>{
                e(["../metadata/metadata"], t, n)
            }
            ).then(__importStar).then(e=>e.getMetaRepository().getExtensionContributes("font").then(e=>{
                let t = JSON.parse(ie("sz.font.family"));
                e && e.forEach(e=>{
                    let n = e.font;
                    t.push({
                        value: n,
                        caption: n,
                        isExtension: !0
                    })
                }
                ),
                this.loadDataPromise = null,
                this.data = t
            }
            ).catch(e=>(this.loadDataPromise = null,
            Promise.reject(e))))
        }
        fetchData(e) {
            return this.ensureLoadedData().then(()=>{
                let t = this.data
                  , n = e && e.fetchCount
                  , r = e ? e.startIndex : 0;
                return Promise.resolve(t && t.slice(r, n ? r + n : void 0))
            }
            )
        }
        searchData({keyword: e, ignoreCase: t=!1, fetchCount: n=null}) {
            let r = []
              , o = t && e && e.toUpperCase()
              , s = n=>t ? n.toUpperCase().includes(o) : n.includes(e);
            return this.ensureLoadedData().then(()=>((e=>e && e.forEach(e=>{
                let t = e.value
                  , n = e.caption;
                (t && s(t.toString()) || n && s(n)) && r.push(e)
            }
            ))(this.data),
            Promise.resolve(null == n ? r : r.slice(0, n))))
        }
        getDataCount() {
            return this.ensureLoadedData().then(()=>Promise.resolve(this.data.length))
        }
        getParentPaths(e) {
            return Promise.resolve(null)
        }
        findItemsByValues(e) {
            return this.ensureLoadedData().then(()=>{
                let t = [];
                return this.data.some(n=>(n=>{
                    if (e.includes(n.value) && (t.push(n),
                    t.length >= e.length))
                        return !0
                }
                )(n)),
                Promise.resolve(t)
            }
            )
        }
    }
    function Cn(e) {
        let t = e.tagName;
        return "INPUT" === t && !0 !== e.readOnly || "TEXTAREA" === t && !0 !== e.readOnly || "true" === e.contentEditable
    }
    function vn(e) {
        return 60 === e.charCodeAt(0) && 62 === e.charCodeAt(e.length - 1) && /^<[a-z]+.+<\/[a-z]+>$/gim.test(e)
    }
    function xn(e, t) {
        vn(t) ? e.innerHTML = t : e.textContent = t
    }
    t.FontDataProvider = FontDataProvider,
    t.createImageDescPlaceholder = function(e, t, n) {
        let r = e;
        return `<div class="common-placeholder-image"></div><div class="common-placeholder-desc">${n || r.getDefaultPlaceholder && r.getDefaultPlaceholder()}</div>`
    }
    ,
    t.isElementEditable = Cn,
    t.isElementFocused = function(e) {
        let t = e
          , n = t.tagName;
        return null != t.tabIndex || "INPUT" === n || "TEXTAREA" === n || "true" === t.contentEditable
    }
    ,
    t.parseHTMLLength = function(e, t="px") {
        if (null == e)
            return null;
        if ("number" == typeof e)
            return {
                unit: t,
                length: e + t,
                value: e
            };
        let n = 0;
        for (let r = e.length; n < r; n++) {
            let t = e.charCodeAt(n);
            if ((t < 48 || t > 57) && 46 !== t)
                return {
                    unit: e.substring(n),
                    length: e,
                    value: parseFloat(e.substring(0, n))
                }
        }
        return {
            unit: t,
            length: e + t,
            value: parseFloat(e)
        }
    }
    ,
    t.getCalendarData = function(e, t) {
        let n = "";
        return e && (n = `start=${e}`),
        t && (n && (n += "&"),
        n += `end=${t}`),
        be(n ? `/api/sys/services/getCalendarData?${n}` : "/api/sys/services/getCalendarData")
    }
    ,
    t.isJsonString = function(e) {
        try {
            if ("object" == typeof JSON.parse(e))
                return !0
        } catch (t) {}
        return !1
    }
    ,
    t.isHTMLString = vn,
    t.renderString = xn,
    t.calcStringMatching = function(e, t) {
        let n = e.indexOf(t);
        if (-1 === n)
            return 0;
        let r = e.length;
        return Math.trunc(50 * (1 - Math.min(20, n) / 20) + 50 * (1 - (r - t.length) / r))
    }
    ,
    t.makeMenuStyleRules = function(e, t) {
        const n = e.menu || e.dropdown || e.common
          , r = "number" == typeof n.fontSize ? `${n.fontSize}px` : n.fontSize || ""
          , o = n.foregroundColor || ""
          , s = n.foregroundColor2 || o
          , i = n.backgroundColor || ""
          , l = n.lineColor || ""
          , a = n.hoverBackgroundColor || ""
          , c = n.hoverForegroundColor || ""
          , d = n.hoverForegroundColor2 || ""
          , u = n.highlightBackgroundColor || ""
          , h = n.highlightForegroundColor || ""
          , m = n.highlightForegroundColor2 || h
          , g = n.height || "";
        let p = `.${t}.menu-base`
          , f = parseInt(r) / 12
          , y = [`${p} {\n\t\t\t\tfont-family: ${n.fontFamily || ""};\n\t\t\t\tborder: ${n.border || ""};\n\t\t\t\tbackground-color: ${i};\n\t\t\t\tcolor: ${o};\n\t\t\t}`, `${p}>.menu-content>.menuitem>.menuitem-icon:before{\n\t\t\t\tcolor: ${s};\n\t\t\t}`, `${p}>.menu-content>.menuitem>.menuitem-icon {\n\t\t\tcolor: ${s};\n\t\t}`, `${p}>.menu-content>.menuitem-focus{\n\t\t\t\tbackground-color: ${a};\n\t\t\t\tcolor: ${c};\n\t\t\t}`, `${p}>.menu-content>.menuitem-selected{\n\t\t\t\tbackground-color: ${u};\n\t\t\t\tcolor: ${h};\n\t\t\t}`, `${p}>.menu-content>.menuitem-selected>.menuitem-icon:before{\n\t\t\t\tcolor: ${m};\n\t\t\t}`, `${p}>.menu-content>.menuitem-selected>.menuitem-icon {\n\t\t\tcolor: ${m};\n\t\t}`, `${p}>.menu-content>.menuitem:hover {\n\t\t\t\tbackground-color: ${a};\n\t\t\t\tcolor: ${c};\n\t\t\t}`, `${p}>.menu-content>.menuitem:hover>.menuitem-icon {\n\t\t\tcolor: ${d};\n\t\t}`, `${p}>.menu-content>.menuitem:hover>.menuitem-icon:before {\n\t\t\tcolor: ${d};\n\t\t}`, `${p}>.menu-content>.menuitem-focus>.menuitem-icon:before {\n\t\t\tcolor: ${d};\n\t\t}`, `${p}>.menu-content>.menuitem-focus>.menuitem-icon {\n\t\t\tcolor: ${d};\n\t\t}`, `${p}>.menu-content>.menuitem-selected:hover{\n\t\t\t\tbackground-color: ${u};\n\t\t\t\tcolor: ${h};\n\t\t\t}`, `${p}>.menu-content>.menuitem-split {\n\t\t\t\tborder-color: ${l};\n\t\t\t}`, `${p}>.menu-content>.menuitem-group {\n\t\t\t\tcolor: ${o && Jt(o, .3)};\n\t\t\t}`, `${p}>.menu-content>.menuitem-groupborder {\n\t\t\t\tborder-color: ${l};\n\t\t\t}`, `${p}>.menu-content>.menuitem-group:hover {\n\t\t\t\tbackground: none;\n\t\t\t}`, `${p}>.menu-content>.menuitem>.menuitem-desc-message {\n\t\t\t\tcolor: ${o};\n\t\t\t}`, `${p}>.menu-content>.menuitem>.menuitem-desc {\n\t\t\t\tcolor: ${o && Jt(o, .5)};\n\t\t\t}`];
        return (r || g) && y.pushAll([`${p} {\n\t\t\t\tpadding: ${5 * f}px 0;\n\t\t\t\tborder-radius: ${2 * f}px;\n\t\t\t\tfont-size: ${12 * f}px;\n\t\t\t}`, `${p}>.menu-content>.menuitem {\n\t\t\t\tmin-width: ${140 * f}px;\n\t\t\t\tpadding: 0 ${12 * f}px 0 ${12 * f}px;\n\t\t\t\theight: ${g || 32 * f + "px"};\n\t\t\t\tline-height: ${g || 32 * f + "px"};\n\t\t\t}`, `${p}>.menu-content>.menuitem>.menuitem-icon {\n\t\t\t\twidth: ${18 * f}px;\n\t\t\t\theight: ${18 * f}px;\n\t\t\t\tline-height: ${18 * f}px;\n\t\t\t\tmargin-right: ${8 * f}px;\n\t\t\t\tbackground-size: ${18 * f}px ${18 * f}px;\n\t\t\t}`, `${p}>.menu-check>.menuitem {\n\t\t\t\tpadding-left: ${24 * f}px;\n\t\t\t}`, `${p}>.menu-check>.menugroupitem {\n\t\t\t\tpadding-left: ${28 * f}px;\n\t\t\t}`, `${p}>.menu-hasarrow>.menuitem{\n\t\t\t\tmin-width: ${75 * f}px;\n\t\t\t}`, `${p}>.menu-check.menu-hasarrow>.menuitem {\n\t\t\t\tpadding: 0 ${24 * f}px;\n\t\t\t}`, `${p}>.menu-content>.menuitem>.menuitem-icon::before {\n\t\t\t\tmargin-right: ${8 * f}px;\n\t\t\t\tfont-size: ${16 * f}px;\n\t\t\t}`, `${p}>.menu-content>.menuitem-haschild {\n\t\t\t\tpadding-right: ${26 * f}px;\n\t\t\t}`, `${p}>.menu-content>.menuitem-haschild.menugroupitem {\n\t\t\t\tpadding-right: ${30 * f}px;\n\t\t\t}`, `${p}>.menu-content>.menuitem-haschild::after {\n\t\t\t\tright: ${0 * f}px;\n\t\t\t\tline-height: ${g || 32 * f + "px"};\n\t\t\t\tfont-size: ${14 * f}px;\n\t\t\t}`, `${p}>.menu-content>.menuitem>.menuitem-caption {\n\t\t\t\tmax-width: ${200 * f}px;\n\t\t\t}`, `${p}>.menu-content>.menuitem-split {\n\t\t\t\theight: 2px;\n\t\t\t\tmargin: ${4 * f}px 0;\n\t\t\t}`, `${p}>.menu-content>.menuitem-group {\n\t\t\t\tpadding-left: ${12 * f}px;\n\t\t\t\tpadding-top: ${5 * f}px;\n\t\t\t\tpadding-bottom: ${5 * f}px;\n\t\t\t}`, `${p}>.menu-content>.menuitem-groupborder {\n\t\t\t\tmargin-top: ${5 * f}px;\n\t\t\t}`, `${p}>.menu-content>.menuitem-group-nocaption {\n\t\t\t\tpadding-bottom: ${0 * f}px;\n\t\t\t\tmargin-top: ${5 * f}px;\n\t\t\t}`, `${p}>.menu-content>.menuitem>.menuitem-desc-message {\n\t\t\t\tpadding-left: ${20 * f}px;\n\t\t\t\tmax-width: ${150 * f}px;\n\t\t\t}`, `${p}>.menu-content>.menuitem>.menuitem-checkicon {\n\t\t\t\tleft: ${6 * f}px;\n\t\t\t\tline-height: ${g || 32 * f + "px"};\n\t\t\t}`, `${p}>.menu-content>.menuitem>.menuitem-checkicon::before {\n\t\t\t\tfont-size: ${12 * f}px;\n\t\t\t}`, `${p}>.menu-content>.menuitem:not(.menuitem-haschild).waiting-icon>.menuitem-caption {\n\t\t\t\tpadding-left: ${28 * f}px;\n\t\t\t}`, `${p}>.menu-content>.menuitem-load.waiting-ring {\n\t\t\t\tleft: ${20 * f}px;\n\t\t\t\twidth: ${16 * f}px;\n\t\t\t\theight: ${16 * f}px;\n\t\t\t\tfont-size: ${16 * f}px;\n\t\t\t}`, `${p}.small {\n\t\t\t\tpadding: ${3 * f}px 0;\n\t\t\t}`, `${p}.small>.menu-content>.menuitem {\n\t\t\t\theight: ${g || 26 * f + "px"};\n\t\t\t\tline-height: ${g || 16 * f + "px"};\n\t\t\t}`, `${p}.small>.menu-content>.menuitem>.menuitem-icon {\n\t\t\t\twidth: ${16 * f}px;\n\t\t\t\theight: ${16 * f}px;\n\t\t\t\tline-height: ${16 * f}px;\n\t\t\t}`, `${p}.small>.menu-content>.menuitem-split {\n\t\t\t\theight: 2px;\n\t\t\t\tmargin: ${2 * f}px 0;\n\t\t\t}`, `${p}.small>.menu-content>.menuitem-group {\n\t\t\t\tpadding: ${3 * f}px 0 ${3 * f}px ${12 * f}px;\n\t\t\t}`, `${p}.small>.menu-content>.menuitem-groupborder {\n\t\t\t\tmargin-top: ${3 * f}px;\n\t\t\t}`, `${p}.small>.menu-content>.menuitem-group-nocaption {\n\t\t\t\tmargin-top: ${3 * f}px;\n\t\t\t}`, `${p}.small>.menu-content>.menuitem>.menuitem-checkicon,\n\t\t\t${p}.small.menu-base>.menu-content>.menuitem-haschild::after {\n\t\t\t\tline-height: ${g || 26 * f + "px"};\n\t\t\t}`]),
        y
    }
    ,
    t.maskString = function(e, t) {
        if (!t || !t.enable || !e)
            return e;
        if ("function" === t.maskType)
            return t.maskFunction ? t.maskFunction(e, t) : e;
        if ("regex" === t.maskType) {
            let n = t.maskRegex;
            return n && t.replace ? ("string" == typeof n && (n = RegExp(n)),
            e.replace(n, t.replace)) : e
        }
        let n = e.length
          , {maskChar: r, keepStartCount: o, keepEndCount: s} = t;
        o + s >= n && (s = 0,
        o < n || (o = 0));
        let i = o > 0 ? e.substring(0, Math.min(o, n)) : ""
          , l = s > 0 && n > o ? e.substring(Math.max(n - s, o), n) : ""
          , a = n - (o > 0 ? o : 0) - (s > 0 ? s : 0);
        return i + (a > 0 ? new Array(a + 1).join(r || "*") : "") + l
    }
    ,
    t.isUnicode = function(e) {
        for (let t = 0, n = e.length; t < n; t++)
            if (e.charCodeAt(t) > 255)
                return !0;
        return !1
    }
    ,
    t.makeDialogStyleRules = function(e, t) {
        const n = e.dialog || e.common
          , r = n.foregroundColor || "";
        let o = `.${t}.dialog-base`;
        return [`${o}>.dialog-footer,\n\t\t\t${o}>.dialog-header,\n\t\t\t${o} {\n\t\t\t\tbackground-color: ${n.backgroundColor || ""};\n\t\t\t\tcolor: ${r};\n\t\t\t}`, `${o}>.dialog-header>.dialog-tools>.dialog-max:before,\n\t\t\t${o}>.dialog-header>.dialog-tools>.dialog-close:before {\n\t\t\t\tcolor: ${r && Jt(r, .5)};\n\t\t\t}`, `${o}>.dialog-container>.dialog-alert-title {\n\t\t\t\tcolor: ${r};\n\t\t\t}`, `${o}>.dialog-container>.dialog-alsert-icon {\n\t\t\t\tcolor: ${n.warningForegroundColor || ""};\n\t\t\t}`, `${o}>.dialog-container>.dialog-info-icon {\n\t\t\t\tcolor: ${n.infoForegroundColor || ""};\n\t\t\t}`, `${o}>.dialog-container>.dialog-content {\n\t\t\t\tbackground-color: transparent;\n\t\t\t}`]
    }
    ;
    const En = new Set(["responseURL", "requestURL", "requestBody"]);
    function Mn(e) {
        if (!e)
            return null;
        if (e.startsWith("{") && e.endsWith("}") || e.startsWith("[") && e.endsWith("]"))
            try {
                return JSON.parse(e)
            } catch (t) {
                return null
            }
        return null
    }
    function Tn(e) {
        return new RegExp("((.*//)|^)(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]).)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9]).*").test(e)
    }
    function Dn(e) {
        let n = new FormData;
        return n.append("file", e.file),
        n.append("maxsize", "" + (e.maxSize || 0)),
        n.append("genmd5", "" + !!e.genMd5),
        null != e.fileName && n.append("filename", e.fileName),
        fe(t.assign({}, e, {
            url: e.url || "/api/fileupload/services/upload",
            contentType: pe,
            data: n
        }))
    }
    function Pn(e, n, r) {
        let o = Ze().componentNameStyleMap.get(r)
          , s = `.${n}`;
        o && o.forEach(e=>{
            let r = Array.from(e.keys());
            for (const o of r)
                if (o === n)
                    e.delete(o);
                else {
                    let n = o.indexOf(s)
                      , r = o[n + s.length];
                    n > 0 && t.THEME_STYLE_SELECTOR_CONCAT_CHAR.includes(r) && e.delete(o)
                }
        }
        );
        let i = e.cssRules
          , l = `.${r} .${n}`;
        for (let a = i.length - 1; a >= 0; a--) {
            let n = i[a].selectorText;
            if (n === l && e.deleteRule(a),
            n.startsWith(l)) {
                let r = n.charAt(l.length);
                -1 !== t.THEME_STYLE_SELECTOR_CONCAT_CHAR.indexOf(r) && e.deleteRule(a)
            }
        }
    }
    function In(e, t) {
        if (null == e || "" == e)
            return e;
        if ("number" == typeof e)
            return Math.round(e);
        if ("string" == typeof e) {
            if (e.indexOf(" ") > 0)
                e = e.split(" ").map(e=>In(e)).join(" ");
            else if (e.endsWith("px")) {
                e = e.substr(0, e.length - 2),
                e = Math.round(parseFloat(e)) + "px"
            } else if (e.endsWith("em")) {
                e = e.substr(0, e.length - 2),
                e = Math.round(parseFloat(e)) + "em"
            } else if (e.endsWith("%")) {
                e = e.substr(0, e.length - 1),
                e = Math.round(parseFloat(e)) + "%"
            } else {
                if ("line-height" === t)
                    return Math.round(parseFloat(e));
                "transform" === t && 0 === e.indexOf("scale(") && (e = "scale(" + Math.round(parseFloat(e.substr("scale(".length, e.length - 1))) + ")")
            }
            return e
        }
        if (Array.isArray(e))
            return e.map(e=>In(e));
        if ("object" == typeof e)
            for (const n in e) {
                const t = e[n];
                e[n] = In(t)
            }
        return e
    }
    function _n(e) {
        let t = ["height", "min-height", "min-width", "max-height", "max-width", "minHeight", "minWidth", "maxHeight", "maxWidth", "width", "line-height", "lineHeight", "font-size", "fontSize", "border-radius", "borderRadius", "flex-basis", "flexBasis", "padding", "padding-left", "padding-right", "padding-top", "padding-bottom", "margin", "margin-left", "margin-right", "margin-top", "margin-bottom", "border", "transform"];
        if ("string" == typeof e) {
            if (null == e || "" == e)
                return e;
            let n = e.split(";");
            return n.map((e,r)=>{
                let o, s = e.split(": "), i = s[0].trim(), l = s[1];
                return o = t.indexOf(i) >= 0 && "" !== l ? `${0 === r || r === n.length - 1 ? "" : " "}${i}: ${In(l, i)}` : e
            }
            ).join(";")
        }
        {
            let n = t=>{
                let n = e[t];
                null != n && "" != n && (e[t] = In(n, t))
            }
            ;
            return t.forEach(e=>n(e)),
            e
        }
    }
    t.getErrorDetail = function(e) {
        let t = "";
        if (t += `${"message:".padEnd(16, " ")}${e.message}\r\n`,
        e.errorCode) {
            let n = e.errorCode + ".desc"
              , r = ie(n, e.properties);
            r && n !== r && (t += `${"desc:".padEnd(16, " ")}${r}\r\n`)
        }
        let n = e.requireModules;
        ze(n) || (t += `${"requireModules:".padEnd(16, " ")}${n.join(", ")}\r\n`);
        let r = e.properties
          , o = (e,n)=>{
            let r = n
              , o = e=>{
                let t = e.split("\n")
                  , n = t[0] + "\n";
                for (let r = 1; r < t.length; r++)
                    n += " ".repeat(16) + t[r] + "\n";
                return n
            }
            ;
            "object" == typeof n ? r = o(JSON.stringify(n, null, "\t")) : "string" == typeof n && n.includes("\n") && (r = o(r)),
            t += `${e.padEnd(16, " ")}${r}\r\n`
        }
          , s = (e,t,n)=>{
            e && o(t, n || e)
        }
        ;
        if (s(e.causeMessage, "causeMessage:"),
        s(e.hintMessage, "hintMessage:"),
        s(e.errorCode, "errorCode:"),
        r)
            for (let a in r)
                r.hasOwnProperty(a) && o(a + ":", r[a]);
        let i = e=>e ? "string" == typeof e ? e : [e.resPath, e.componentId || e.componentCaption, e.propertyId || e.propertyCaption].filter(e=>!!e).join(" > ") : "";
        if (e.location) {
            const t = i(e.location);
            t && (o("location:", t),
            "string" != typeof e.location && s(e.location.propertyValue, "propertyValue:"))
        }
        if (e.refResources && 0 != e.refResources.length) {
            s(e.refResources[0], "refResources:", i(e.refResources[0]));
            for (let t = 1; t < e.refResources.length; t++)
                s(e.refResources[t], "", i(e.refResources[t]))
        }
        t += "\r\n",
        t += "===================================================================================\r\n",
        s(e.user, "User:"),
        s(e.os, "OS:"),
        s(e.browserName, "BrowserName:"),
        s(e.referer, "Referer:"),
        s(e.userAgent, "UserAgent:"),
        s(e.className, "className:"),
        s(e.httpStatus, "httpStatus:");
        let l = e.detailInfo;
        if (l) {
            if (l.requestURL && s(l.requestURL, "requestURL:"),
            l.requestBody) {
                let e = l.requestBody;
                s(e, "requestBody:", Mn(e) || e)
            }
            l.responseURL && s(l.responseURL, "responseURL:");
            for (const e in l)
                l.hasOwnProperty(e) && !En.has(e) && o(e + ":", l[e]);
            t += "\r\n"
        }
        return (e.stackTrace || e.stack) && (t += "===================================================================================\r\n",
        t += (e.stackTrace || e.stack.replaceAll(location.protocol + "//" + location.host, "")) + "\r\n\r\n"),
        t
    }
    ,
    t.parseJSON = Mn,
    t.hasHostname = Tn,
    t.getFullUrl = function(e, t) {
        return e.startsWith("http://") || e.startsWith("https://") ? e : e.startsWith("/") && !e.startsWith("//") ? e : Tn(e) ? e.startsWith("//") ? location.protocol + e : location.protocol + "//" + e : t ? un(t, e) : e
    }
    ,
    t.blobToBase64 = function(e) {
        return new Promise((t,n)=>{
            let r = new FileReader;
            r.onload = (()=>{
                t(r.result)
            }
            ),
            r.onerror = (e=>{
                n(e)
            }
            ),
            r.readAsDataURL(e)
        }
        )
    }
    ,
    t.uploadFile = function(e) {
        return new Promise((t,n)=>Dn({
            url: null,
            file: e,
            maxSize: 20971520,
            success: (e,n,r)=>{
                t(e)
            }
        }))
    }
    ,
    t.ajaxUploadFile = Dn,
    t.THEME_STYLE_SELECTOR_CONCAT_CHAR = ["-", "_", ">", " ", ".", ":"],
    t.deleteCssRules = Pn,
    t.normalizeTestStyleProperty = In,
    t.normalizeTestStyleInfo = _n,
    t.getTestCaseSheetResult = function() {
        let e = e=>{
            let t = []
              , n = e.cssRules;
            for (let r = 0, o = n.length; r < o; r++) {
                let e = n[r].cssText
                  , o = e.indexOf("{ ")
                  , s = _n(e.substr(o + 2, e.length - o - 4));
                e = e.substr(0, o + 2) + s + " }",
                t.push(e)
            }
            return {
                id: e.ownerNode.id,
                cssRules: t.sort()
            }
        }
          , t = []
          , n = Ze();
        return t.push(e(n.getDefaultStyleSheet())),
        t.push(e(n.getThemeStyleSheet())),
        t.push(e(n.getCustomStyleSheet())),
        t
    }
    ,
    t.parseConditionStyleRange = function(e) {
        let t = {
            cells: [],
            rows: [],
            cols: [],
            sections: []
        };
        return e.split(",").forEach(e=>{
            if (-1 !== e.indexOf(":")) {
                let n = e.split(":")
                  , r = n[0]
                  , o = n[1]
                  , s = new RegExp(/^[0-9]+$/)
                  , i = new RegExp(/^[a-zA-Z]+$/);
                i.test(r) && i.test(o) ? r === o ? t.cols.push(r) : t.cols.push(`${r}:${o}`) : s.test(r) && s.test(o) ? r === o ? t.rows.push(r) : t.rows.push(`${r}:${o}`) : t.sections.push(`${r}:${o}`)
            } else
                t.cells.push(e)
        }
        ),
        t
    }
    ,
    t.getEffectStyleName = function(e) {
        return ie(`commons.effectstyle.${e}`)
    }
    ,
    t.quoteExpField = function(e) {
        let t = 0
          , n = 0;
        for (; -1 != (t = e.indexOf("]", t)) && n < 100; )
            e = e.substring(0, t) + "]]" + e.substring(t + 1),
            t += 2,
            n++;
        return "[" + e + "]"
    }
    ,
    t.gotoHome = function() {
        let e = fn();
        e ? e.backToHome() : window.location.replace(G("/"))
    }
    ,
    t.gotoLoginPage = function(e) {
        let t = window.wx;
        t && n.browser.wxapp ? t.miniProgram.reLaunch({
            url: "/pages/index/index?logout=true"
        }) : window.my && n.browser.alipayapp ? my.reLaunch({
            url: "/pages/index/index?logout=true"
        }) : window.location.replace(G("/login"))
    }
    ;
    const $n = ["/api/extension/services/getInstalled.json", "/api/extension/services/icons.json", "/api/meta/services/getCompileInfoContent/", "/api/app/services/getAppInfo/", "/api/meta/services/getThemeInfo/", "/api/meta/theme/queryThemes", "/api/meta/services/getFileThumbnail/", "/api/attachment/", "/api/dw/services/dataRoles/"]
      , Ln = ["/api/meta/services/getFileInfo/", "/api/meta/services/getFileContent/"];
    function An(e) {
        if (!e.startsWith("/") || e.startsWith("//"))
            return e;
        if (!function(e) {
            var t;
            let n = re()["sys.basic.cdnDomain"];
            if (ze(n))
                return !1;
            if (n === location.host)
                return !1;
            let r = G();
            r && e.startsWith(r) && (e = e.substring(r.length));
            let o = null === (t = i.events) || void 0 === t ? void 0 : t.onCheckNeedCDN;
            if (o) {
                let t = o(e);
                if ("boolean" == typeof t)
                    return t
            }
            let s = De(e);
            return !(!(s.startsWith("/dist/") || s.startsWith("/login/") || s.startsWith("/extension/")) && (Ln.some(e=>s.startsWith(e)) || !(s.endsWith(".js") || s.endsWith(".css") || s.endsWith(".png") || s.endsWith(".jpg")) && !$n.some(e=>s.startsWith(e))))
        }(e))
            return e;
        return e = `//${re()["sys.basic.cdnDomain"]}${e}`
    }
    function kn(e) {
        return e.startsWith("http://") || e.startsWith("https://") || e.startsWith("//")
    }
    function On(e, t) {
        return be("/api/auth/getWechatJSSDKConfig?url=" + encodeURIComponent(e) + "&refreshTicket=" + t)
    }
    let Rn;
    t.prefixCdnDomain = An,
    t.isCrossDomainUrl = kn,
    t.getWechatJSSDKConfigInfo = On,
    t.loadWXJSSDK = function() {
        if (window.__wxjs_config_ready)
            return Promise.resolve();
        if (Rn)
            return Rn.then().catch(e=>{}
            );
        let t = window.__wxjs_signature_url = location.origin + location.pathname + location.search;
        return (Rn = On(t, !1).then(n=>new Promise((t,n)=>{
            e(["//res.wx.qq.com/open/js/jweixin-1.6.0.js"], t, n)
        }
        ).then(__importStar).then(e=>{
            window.wx || (window.wx = e);
            let r = navigator.userAgent;
            if (!r || !r.includes("wxworklocal"))
                return new Promise((e,r)=>{
                    let o = 0
                      , s = ()=>{
                        o++;
                        let i = setTimeout(()=>{
                            e()
                        }
                        , 2e3);
                        wx.config({
                            debug: !1,
                            appId: n.appId,
                            timestamp: n.timestamp,
                            nonceStr: n.nonceStr,
                            signature: n.signature,
                            jsApiList: Fn
                        });
                        let l = !1;
                        wx.error(e=>{
                            l = !0,
                            clearTimeout(i);
                            let a = e.errMsg;
                            switch (a) {
                            case "config:invalid url domain":
                                return void r(a + ": 请检查公众号中是否正确配置了js接口安全域名");
                            case "config:invalid signature":
                                if (o > 1)
                                    break;
                                return void On(t, !0).then(e=>{
                                    n = e,
                                    s()
                                }
                                )
                            }
                            let c = new Error(a);
                            c.properties = {
                                signature_url: t,
                                currentUrl: location.href,
                                appId: n.appId,
                                timestamp: n.timestamp,
                                nonceStr: n.nonceStr,
                                signature: n.signature
                            },
                            r(c)
                        }
                        ),
                        wx.ready(()=>{
                            Y(200).then(()=>{
                                l || (clearTimeout(i),
                                window.__wxjs_config_ready = !0,
                                e())
                            }
                            )
                        }
                        )
                    }
                    ;
                    s()
                }
                )
        }
        ))).catch(e=>{
            throw e
        }
        ),
        Rn
    }
    ;
    const Fn = ["updateAppMessageShareData", "updateTimelineShareData", "onMenuShareQQ", "onMenuShareAppMessage", "chooseImage", "previewImage", "uploadImage", "downloadImage", "getLocalImgData", "scanQRCode", "getLocation", "openLocation"]
});

define("css", [], function() {
    var e = document.getElementsByTagName("head")[0]
      , t = window.szbrowser
      , n = !1
      , r = !0;
    t.msie && t.version <= 9 ? n = !0 : (t.chrome || t.safari || "WebkitAppearance"in document.documentElement.style) && (r = !1);
    var o, s, c, l = {}, a = function() {
        o = document.createElement("style"),
        e.appendChild(o),
        s = o.styleSheet || o.sheet
    }, i = 0, u = [], f = function(e) {
        s.addImport(e),
        o.onload = function() {
            d()
        }
        ,
        31 == ++i && (a(),
        i = 0)
    }, d = function() {
        c();
        var e = u.shift();
        e ? (c = e[1],
        f(e[0])) : c = null
    };
    return l.normalize = function(e, t) {
        return ".css" == e.substr(e.length - 4, 4) && (e = e.substr(0, e.length - 4)),
        t(e)
    }
    ,
    l.load = function(t, l, i, d) {
        t && -1 === t.indexOf(".css?v=") && (t += ".css");
        let m = l.toUrl(t)
          , h = l.context && l.context.urlFetched;
        if (!h || h[m])
            return i();
        h[m] = !0,
        (n ? function(e, t) {
            if (s && s.addImport || a(),
            s && s.addImport)
                c ? u.push([e, t]) : (f(e),
                c = t);
            else {
                o.textContent = '@import "' + e + '";';
                var n = setInterval(function() {
                    try {
                        o.sheet.cssRules,
                        clearInterval(n),
                        t()
                    } catch (e) {}
                }, 10)
            }
        }
        : function(t, n) {
            var o = document.createElement("link");
            if (o.type = "text/css",
            o.rel = "stylesheet",
            r)
                o.onload = function() {
                    o.onload = function() {}
                    ,
                    setTimeout(n, 7)
                }
                ;
            else
                var s = setInterval(function() {
                    for (var e = document.styleSheets, t = 0, r = e.length; t < r; t++) {
                        var c = e[t];
                        if (c.href == o.href) {
                            let e = !0;
                            try {
                                c.cssRules
                            } catch (l) {
                                l instanceof DOMException && "InvalidAccessError" == l.name && (e = !1)
                            }
                            if (e)
                                return clearInterval(s),
                                n()
                        }
                    }
                }, 10);
            o.href = t,
            e.insertBefore(o, document.getElementById("colorThemeStyle"))
        }
        )(m, i)
    }
    ,
    l
});

define("sys/sys-polyfill", ["require", "exports"], function(e, t) {
    "use strict";
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.browser = t.parseUserAgent = void 0;
    const o = "undefined" == typeof window && !!global;
    function i(e, t) {
        let i = {
            mobile: !1,
            phone: !1,
            mac: !1,
            pad: !1,
            ios: !1,
            android: !1,
            name: "Unidentified",
            version: 0,
            webkit: !1,
            msie: !1,
            edge: !1,
            chrome: !1,
            safari: !1,
            firefox: !1,
            opera: !1,
            weixin: !1,
            wxwork: !1,
            wxapp: !1,
            qqbrowser: !1,
            qq: !1,
            tim: !1,
            alipay: !1,
            alipayapp: !1,
            supportSVG: !0,
            supportPassive: !1,
            nodejs: o
        };
        if (e.includes("Android") ? (i.android = !0,
        i.pad = e.includes("PAD") || e.includes("CPN") || e.includes("Tablet") || e.includes("SM-T"),
        i.phone = !i.pad) : /(Mac\sOS)/.test(e) && (i.pad = e.includes("iPad"),
        i.phone = e.includes("iPhone"),
        i.ios = i.pad || i.phone,
        i.phone && (i.version = parseInt(/OS (\d+)/.exec(e)[1])),
        i.mac = !i.ios,
        i.webkit = e.includes("AppleWebKit")),
        i.mobile = i.phone || i.pad,
        i.mobile ? (i.weixin = e.includes("MicroMessenger"),
        i.wxwork = i.weixin && e.includes("wxwork"),
        i.wxapp = i.weixin && e.includes("miniProgram"),
        i.qq = e.includes("QQ/"),
        i.tim = i.qq && e.includes("TIM/"),
        i.qqbrowser = !i.qq && !i.weixin && e.includes("MQQBrowser/"),
        i.alipay = e.includes("AlipayClient"),
        i.alipayapp = i.alipay && e.includes("MiniProgram")) : i.qqbrowser = e.includes("QQBrowser/"),
        e.includes("Chrome"))
            i.version = parseFloat(/Chrome\/(\d+\.\d+)/.exec(e)[1]),
            i.chrome = !0,
            i.name = "chrome",
            i.webkit = !0,
            i.supportPassive = !0;
        else if (i.mobile || !e.includes("MSIE") && !e.includes("Trident"))
            if (e.includes("Edge"))
                i.version = parseInt(/Edge\/(\d+)/.exec(e)[1]),
                i.edge = !0,
                i.name = "edge",
                i.webkit = e.includes("AppleWebKit");
            else if (e.includes("Safari")) {
                let t = /Version\/(\d+\.\d+)/.exec(e);
                t && (i.version = parseFloat(t[1])),
                i.safari = !0,
                i.name = "safari",
                i.webkit = !0
            } else if (e.includes("Gecko") && e.includes("Firefox")) {
                let t = /Firefox\/(\d+\.\d+)/.exec(e);
                t && (i.version = parseFloat(t[1])),
                i.firefox = !0,
                i.name = "firefox",
                i.supportPassive = !0
            } else
                (e.includes("Opera") || e.includes(" OPR")) && ("Opera" == navigator.appName ? i.version = parseFloat(navigator.appVersion) : i.version = parseFloat(/(Opera|OPR)[\/ ](\d+.\d+)/.exec(e)[2]),
                i.opera = !0,
                i.name = "opera",
                i.webkit = e.includes("AppleWebKit"));
        else
            i.version = e.includes("Trident/7.0") ? 11 : parseFloat(/(MSIE |rv:)(\d+\.\d+)/.exec(e)[2]),
            i.msie = !0,
            i.name = "msie",
            i.supportSVG = !i.msie || !(i.msie && i.version < 8);
        return e.includes("Windows NT 5.") ? i.os = "winxp" : e.includes("Windows NT 6.") ? i.os = "win7" : e.includes("Windows NT 10.") ? i.os = "win10" : i.mac && (i.os = "mac"),
        i
    }
    o && (global.window = global),
    t.parseUserAgent = i,
    t.browser = window.szbrowser = o ? i("") : i(window.navigator.userAgent, document.documentMode);
    const r = t.browser.version
      , n = t.browser.msie
      , s = (t.browser.edge,
    t.browser.chrome)
      , l = t.browser.safari
      , a = t.browser.firefox
      , d = t.browser.opera;
    if (!o && !NodeList.prototype.forEach && (NodeList.prototype.forEach = Array.prototype.forEach),
    !o && (Element.prototype.removeAllChildren = function() {
        let e = this
          , t = e.childNodes.length;
        for (; t--; )
            e.removeChild(e.lastChild)
    }
    ),
    !o && window.Symbol) {
        const e = Symbol.iterator;
        !NodeList.prototype[e] && (NodeList.prototype[e] = Array.prototype[e]),
        !HTMLCollection.prototype[e] && (HTMLCollection.prototype[e] = Array.prototype[e])
    }
    if (!o && !Element.prototype.getAttributeNames && (Element.prototype.getAttributeNames = function() {
        const e = this;
        let t = [];
        if (e.hasAttributes()) {
            let o = e.attributes;
            t.length = o.length;
            for (let e = 0, i = o.length; e < i; e++) {
                const i = o.item(e);
                t[e] = i.name
            }
        }
        return t
    }
    ),
    o || Element.prototype.scrollIntoViewIfNeeded || (Element.prototype.scrollIntoViewIfNeeded = function(e) {
        let t = e=>e.scrollTop || e.scrollHeight > e.clientHeight ? e : e.parentNode !== e.ownerDocument ? t(e.parentNode) : null;
        e = 0 === arguments.length || !!e;
        let o = window.getComputedStyle(this, null)
          , i = t(this) || this.parentNode
          , r = window.getComputedStyle(i, null)
          , {offsetLeft: n, offsetTop: s} = ((e,t)=>{
            let o = 0
              , i = 0
              , r = e;
            do {
                o += r.offsetLeft || 0,
                i += r.offsetTop || 0,
                r = r.parentNode
            } while (r && t && r !== t);
            return {
                offsetLeft: o,
                offsetTop: i
            }
        }
        )(this, i)
          , l = parseInt(o.borderBottomWidth)
          , a = parseInt(o.borderRightWidth)
          , d = parseInt(r.getPropertyValue("border-top-width"))
          , p = parseInt(r.getPropertyValue("border-left-width"))
          , c = s - i.offsetTop < i.scrollTop
          , u = s - i.offsetTop + this.clientHeight + l - d > i.scrollTop + i.clientHeight
          , f = n - i.offsetLeft < i.scrollLeft
          , w = n - i.offsetLeft + this.clientWidth + a - p > i.scrollLeft + i.clientWidth
          , h = c && !u;
        (c || u) && e && (i.scrollTop = s - i.offsetTop - i.clientHeight / 2 - d + (this.offsetHeight || this.clientHeight) / 2),
        (f || w) && e && (i.scrollLeft = n - i.offsetLeft - i.clientWidth / 2 - p + (this.offsetWidth || this.clientWidth) / 2),
        (c || u || f || w) && !e && this.scrollIntoView(h)
    }
    ),
    s && r < 51 || a && r < 23 || n && r < 10 || d && r < 38 || l) {
        let e = {
            18: "Alt",
            164: "Alt",
            165: "Alt",
            20: "CapsLock",
            17: "Control",
            162: "Control",
            163: "Control",
            91: "Meta",
            92: "Meta",
            144: "NumLock",
            145: "ScrollLock",
            16: "Shift",
            160: "Shift",
            161: "Shift",
            13: "Enter",
            9: "Tab",
            32: " ",
            40: "ArrowDown",
            37: "ArrowLeft",
            39: "ArrowRight",
            38: "ArrowUp",
            35: "End",
            36: "Home",
            34: "PageDown",
            33: "PageUp",
            8: "Backspace",
            12: "Clear",
            254: "Clear",
            247: "CrSel",
            46: "Delete",
            249: "EraseEof",
            248: "ExSel",
            45: "Insert",
            30: "Accept",
            240: "Attn",
            93: "ContextMenu",
            27: "Escape",
            43: "Execute",
            241: "Finish",
            47: "Help",
            19: "Pause",
            250: "Play",
            41: "Select",
            44: "PrintScreen",
            95: "Standby",
            28: "Convert",
            24: "FinalMode",
            31: "ModeChange",
            29: "NonConvert",
            229: "Process",
            21: "HangulMode",
            25: "HanjaMode",
            23: "JunjaMode",
            243: "Hankaku",
            242: "Hiragana",
            246: "KanaMode",
            245: "Romaji",
            244: "Zenkaku",
            112: "F1",
            113: "F2",
            114: "F3",
            115: "F4",
            116: "F5",
            117: "F6",
            118: "F7",
            119: "F8",
            120: "F9",
            121: "F10",
            122: "F11",
            123: "F12",
            124: "F13",
            125: "F14",
            126: "F15",
            127: "F16",
            128: "F17",
            129: "F18",
            130: "F19",
            131: "F20",
            179: "MediaPlayPause",
            178: "MediaStop",
            176: "MediaTrackNext",
            177: "MediaTrackPrevious",
            174: "AudioVolumeDown",
            173: "AudioVolumeMute",
            175: "AudioVolumeUp",
            251: "ZoomToggle",
            180: "LaunchMail",
            181: "LaunchMediaPlayer",
            182: "LaunchApplication1",
            183: "LaunchApplication2",
            166: "BrowserBack",
            171: "BrowserFavorites",
            167: "BrowserForward",
            172: "BrowserHome",
            168: "BrowserRefresh",
            170: "BrowserSearch",
            169: "BrowserStop",
            110: "Decimal",
            106: "Multiply",
            107: "Add",
            111: "Divide",
            109: "Subtract",
            108: "Separator",
            96: "0",
            97: "1",
            98: "2",
            99: "3",
            100: "4",
            101: "5",
            102: "6",
            103: "7",
            104: "8",
            105: "9",
            48: "0",
            49: "1",
            50: "2",
            51: "3",
            52: "4",
            53: "5",
            54: "6",
            55: "7",
            56: "8",
            57: "9",
            65: "a",
            66: "b",
            67: "c",
            68: "d",
            69: "e",
            70: "f",
            71: "g",
            72: "h",
            73: "i",
            74: "j",
            75: "k",
            76: "l",
            77: "m",
            78: "n",
            79: "o",
            80: "p",
            81: "q",
            82: "r",
            83: "s",
            84: "t",
            85: "u",
            86: "v",
            87: "w",
            88: "x",
            89: "y",
            90: "z",
            186: ";",
            187: "=",
            188: ",",
            189: "-",
            190: ".",
            191: "/",
            192: "`",
            219: "[",
            220: "\\",
            221: "]",
            222: "'"
        }
          , t = {
            48: ")",
            49: "!",
            50: "@",
            51: "#",
            52: "$",
            53: "%",
            54: "^",
            55: "&",
            56: "*",
            57: "(",
            65: "A",
            66: "B",
            67: "C",
            68: "D",
            69: "E",
            70: "F",
            71: "G",
            72: "H",
            73: "I",
            74: "J",
            75: "K",
            76: "L",
            77: "M",
            78: "N",
            79: "O",
            80: "P",
            81: "Q",
            82: "R",
            83: "S",
            84: "T",
            85: "U",
            86: "V",
            87: "W",
            88: "X",
            89: "Y",
            90: "Z",
            186: ":",
            187: "+",
            188: "<",
            189: "_",
            190: ">",
            191: "?",
            192: "~",
            219: "{",
            220: "|",
            221: "}",
            222: '"'
        };
        Object.defineProperty(KeyboardEvent.prototype, "key", {
            get: function() {
                let o = this.keyCode;
                return this.shiftKey ? t[o] || e[o] : e[o] || "Unidentified"
            }
        })
    }
    if (a && (r >= 48 && (Object.defineProperty(MouseEvent.prototype, "fromElement", {
        get: function() {
            return "mouseover" === this.type || "mouseenter" === this.type ? this.relatedTarget : this.target
        }
    }),
    Object.defineProperty(MouseEvent.prototype, "toElement", {
        get: function() {
            return "mouseover" === this.type || "mouseenter" === this.type ? this.target : this.relatedTarget
        }
    })),
    Object.defineProperty(MouseEvent.prototype, "srcElement", {
        get: function() {
            return this.target
        }
    }),
    Object.defineProperty(CSSStyleSheet.prototype, "rules", {
        get: function() {
            return this.cssRules
        }
    })),
    !Promise.allSettled && (Promise.allSettled = function(e) {
        return new Promise(function(t) {
            let o = 0
              , i = e.length
              , r = new Array(i);
            function n(e, n) {
                r[e] = n,
                ++o == i && t(r)
            }
            for (let s = 0; s < i; s++)
                Promise.resolve(e[s]).then(e=>n(s, e), e=>n(s, e))
        }
        )
    }
    ),
    !Promise.prototype.finally && (Promise.prototype.finally = function(e) {
        return this.then(e, e)
    }
    ),
    !Promise.prototype.catch && (Promise.prototype.catch = function(e) {
        return this.then(null, e)
    }
    ),
    !window.globalThis)
        if ("undefined" != typeof self)
            window.globalThis = self;
        else if ("undefined" != typeof window)
            window.globalThis = window;
        else {
            if ("undefined" == typeof global)
                throw new Error("unable to locate global object");
            window.globalThis = global
        }
    n && document.body.createTextRange && (Selection.prototype.removeAllRanges = function() {
        let e = document.body.createTextRange();
        e.collapse(),
        e.select()
    }
    ),
    t.browser.mobile && (!window.isTakeOverBackByWeb && (window.isTakeOverBackByWeb = function() {}
    ),
    !window.TuberTranslater && (window.TuberTranslater = {
        transTo: function() {}
    }),
    !window.hackLocationFailed && (window.hackLocationFailed = function() {}
    )),
    o || HTMLCanvasElement.prototype.toBlob || Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
        value: (e,t,o)=>{
            let i = atob(this.toDataURL(t, o).split(",")[1])
              , r = i.length
              , n = new Uint8Array(r);
            for (let s = 0; s < r; s++)
                n[s] = i.charCodeAt(s);
            e(new Blob([n],{
                type: t || "image/png"
            }))
        }
    })
});

define("sys/kvparser", ["require", "exports"], function(s, e) {
    "use strict";
    Object.defineProperty(e, "__esModule", {
        value: !0
    }),
    e.parseMultiValue = e.formatMultiValue = e.parseKeyValuePairs = e.parseEnumValue = e.KeyValuePairParser = void 0;
    class KeyValuePairParser {
        constructor(s) {
            let e = s && s.sep || "\n"
              , t = this.eq = s && s.eq || "=";
            this.sep = e = "\n" === e ? "\n\r" : e,
            this.ignoreBlank = !0,
            1 === t.length ? (this.eqcode = t.charCodeAt(0),
            this.iseq = this.iseq1) : (this.eqcodes = this._str_codes(t),
            this.iseq = this.iseq2),
            1 === e.length ? (this.sepcode = e.charCodeAt(0),
            this.issep = this.issep1) : (this.sepcodes = this._str_codes(e),
            this.issep = this.issep2)
        }
        static create(s) {
            return new KeyValuePairParser(s)
        }
        _str_codes(s) {
            let e = s.length
              , t = new Array(e);
            for (let r = 0; r < e; r++)
                t[r] = s.charCodeAt(r);
            return t
        }
        setIgnoreBlank(s) {
            this.ignoreBlank = s
        }
        needEncode(s) {
            let e;
            for (let t = 0, r = s.length; t < r; t++)
                if (e = s.charCodeAt(t),
                this.isWhitespace(e) || 13 === e || 10 === e || 39 === e || 34 === e || this.iseq(e) || this.issep(e))
                    return !0;
            return !1
        }
        iseq1(s) {
            return this.eqcode === s
        }
        issep1(s) {
            return this.sepcode === s
        }
        iseq2(s) {
            return this.eqcodes.indexOf(s) >= 0
        }
        issep2(s) {
            return this.sepcodes.indexOf(s) >= 0
        }
        formatMap(s, e) {
            return this.sb = [],
            this.formatMap2(s, this.sb, e),
            this.sb.join("")
        }
        formatMap2(s, e, t) {
            if (!s)
                return;
            let r = [];
            for (let i in s)
                i && r.push([i, s[i]]);
            return t && r.sort(function(s, e) {
                return s < e ? -1 : s == e ? 0 : 1
            }),
            this.formatEnumArray2(r, e)
        }
        formatEnumArray(s) {
            return this.sb = [],
            this.formatEnumArray2(s, this.sb),
            this.sb.join("")
        }
        formatEnumArray2(s, e) {
            if (!s)
                return;
            let t, r = this.sep.charAt(0), i = this.eq.charAt(0);
            for (let h = 0; h < s.length; h++)
                t = s[h],
                h > 0 && e.push(r),
                this.escape(t[0], e),
                e.push(i),
                this.escape(null == t[1] ? "" : t[1], e)
        }
        formatArray(s) {
            let e = this.sb = [];
            return this.format(s, e, !1),
            e.join("")
        }
        format(s, e, t) {
            if (!s)
                return;
            let r, i = this.sep.charAt(0);
            for (let h = 0, a = s.length; h < a; h++)
                null == (r = s[h]) && (r = ""),
                t && "" === r || (h > 0 && e.push(i),
                this.escape(r, e))
        }
        escape(s, e) {
            if (!this.needEncode(s))
                return void e.push(s);
            let t;
            e.push('"');
            for (let r = 0, i = s.length; r < i; r++)
                switch (t = s.charAt(r)) {
                case "\r":
                    e.push("\\"),
                    e.push("r");
                    break;
                case "\n":
                    e.push("\\"),
                    e.push("n");
                    break;
                case "\t":
                    e.push("\\"),
                    e.push("t");
                    break;
                case '"':
                case "\\":
                    e.push("\\"),
                    e.push(t);
                    break;
                default:
                    e.push(t)
                }
            e.push('"')
        }
        split(s) {
            this.parse(s);
            let e, t = [];
            for (; this.hasNext(); )
                e = this.nextValue(),
                t.push(e);
            return t
        }
        hasNext() {
            if (!this.ignoreBlank)
                return this.p < this.slen || !(this.p !== this.slen || !this.issep(this.str.charCodeAt(this.p - 1)));
            let s;
            for (; this.p < this.slen && (s = this.str.charCodeAt(this.p),
            this.isWhitespace(s) || this.issep(s) || this.iseq(s)); )
                this.p++;
            return this.p < this.slen
        }
        isWhitespace(s) {
            return (32 === s || 9 === s) && this.ignoreBlank
        }
        nextKey() {
            return this.nextString(this.eq)
        }
        nextValue() {
            if (this.ignoreBlank) {
                let s = this.skipBlank(this.p);
                if (s > this.p && s < this.slen && this.issep(this.str.charCodeAt(s - 1)))
                    return "";
                this.p = s
            }
            return this.nextString(this.sep)
        }
        nextString(s) {
            let e = this.ignoreBlank ? this.skipBlank(this.p) : this.p
              , t = this.slen;
            if (e >= t)
                return this.p = t + 1,
                "";
            let r = this.str
              , i = 1 === s.length ? s.charCodeAt(0) : 0
              , h = 0
              , a = r.charCodeAt(e);
            34 !== a && 39 !== a || (h = a,
            e++);
            let n = e
              , u = e;
            for (; e < t; ) {
                if (92 === (a = r.charCodeAt(e))) {
                    if (e >= t)
                        break;
                    switch (this.sb ? u == n && (this.sb = []) : this.sb = [],
                    e > u && this.sb.push(r.substring(u, e)),
                    a = r.charCodeAt(++e),
                    u = e + 1,
                    a) {
                    case 92:
                        this.sb.push("\\");
                        break;
                    case 114:
                        this.sb.push("\r");
                        break;
                    case 110:
                        this.sb.push("\n");
                        break;
                    case 116:
                        this.sb.push("\t");
                        break;
                    default:
                        this.sb.push(r.charAt(e))
                    }
                } else if (0 === h) {
                    if (0 === i ? s.indexOf(r.charAt(e)) >= 0 : i === a)
                        return this.p = e + 1,
                        this.subastr(n, u, this.skipBlankBack(e - 1) + 1)
                } else if (a === h) {
                    let i = this.skipBlank(e + 1);
                    if (i >= t || s.indexOf(r.charAt(i)) >= 0 || i > e + 1 && this.isWhitespace(s.charCodeAt(0)))
                        return i < t && s.indexOf(r.charAt(i)) >= 0 && i++,
                        this.p = i,
                        this.subastr(n, u, e);
                    e = i
                }
                e++
            }
            return this.p = e + 1,
            this.subastr(n, u, e)
        }
        subastr(s, e, t) {
            return s === e ? this.str.substring(s, t) : (this.sb.push(this.str.substring(e, t)),
            this.sb.join(""))
        }
        skipBlank(s) {
            if (!this.ignoreBlank)
                return s;
            let e = this.str
              , t = this.slen;
            for (; s < t && this.isWhitespace(e.charCodeAt(s)); )
                s++;
            return s
        }
        skipBlankBack(s) {
            if (!this.ignoreBlank)
                return s;
            let e = this.str;
            for (; s > 0 && s < this.slen && this.isWhitespace(e.charCodeAt(s)); )
                s--;
            return s
        }
        parse(s, e, t) {
            this.str = s,
            this.slen = t || s.length,
            this.p = this.skipBlank(e || 0)
        }
        toMap(s, e) {
            if (e || (e = {}),
            !s)
                return e;
            let t, r;
            for (this.parse(s); this.hasNext(); )
                t = this.nextKey(),
                r = this.nextValue(),
                e[t] = r;
            return e
        }
        toList(s, e) {
            if (e || (e = []),
            !s)
                return e;
            this.parse(s);
            let t, r, i, h = this.eq + this.sep;
            for (; this.hasNext(); )
                t = this.nextString(h),
                i = (r = this.skipBlankBack(this.p - 1)) >= this.slen || r > 0 && r < this.slen && this.issep(s.charCodeAt(r)) ? t : this.nextString(h),
                e.push([t, i]);
            return e
        }
        toFixArray(s, e) {
            this.parse(s);
            let t = this.sep;
            for (let r = 0, i = e.length; r < i; r++)
                e[r] = this.nextString(t);
            return e
        }
    }
    e.KeyValuePairParser = KeyValuePairParser,
    KeyValuePairParser.KVP_SEPS = ";\n\r,&|",
    KeyValuePairParser.KVP_EQS = ":=",
    e.parseEnumValue = function(s, e, t) {
        return s ? KeyValuePairParser.create({
            sep: e || KeyValuePairParser.KVP_SEPS,
            eq: t || KeyValuePairParser.KVP_EQS
        }).toList(s) : []
    }
    ,
    e.parseKeyValuePairs = function(s, e, t) {
        return s ? KeyValuePairParser.create({
            sep: e || KeyValuePairParser.KVP_SEPS,
            eq: t || KeyValuePairParser.KVP_EQS
        }).toMap(s) : {}
    }
    ,
    e.formatMultiValue = function(s, e) {
        return s ? KeyValuePairParser.create({
            sep: e || KeyValuePairParser.KVP_SEPS
        }).formatArray(s) : ""
    }
    ,
    e.parseMultiValue = function(s, e) {
        return s ? Array.isArray(s) ? s : KeyValuePairParser.create({
            sep: e || KeyValuePairParser.KVP_SEPS
        }).split(s) : []
    }
});

define("sys/sys-color", ["require", "exports", "sys/sys"], function(r, o, g) {
    "use strict";
    Object.defineProperty(o, "__esModule", {
        value: !0
    }),
    o.getShadowCssText = o.getStepColors = o.compareFillInfo = o.comparePictureFillInfo = o.compareColorInfo = o.compareGradientInfo = o.compareSliderValue = o.getGradientCss = o.getFill = o.gradientValueClone = o.colorBrightness = o.generateShades = o.rgba2rgb = o.str2rgba = o.color2rgba = o.rgb2hsl = o.hsl2rgb = o.rgb2hex = o.hex2rgb = o.getPopularColorArray = o.DefaultStyleConvertor = o.DefaultColorDataProvider = o.MAIN_COLORS = void 0,
    o.MAIN_COLORS = ["#FFFFFF", "#000000", "#F5F6FA", "#5AAFFF", "#55C08C", "#F8A921", "#FFDD39", "#F96858", "#F694C3", "#A19FEE"];
    o.DefaultColorDataProvider = class DefaultColorDataProvider {
        setExtraColors(r) {
            this.extraColors = r
        }
        getThemeColors() {
            return e()
        }
        getGradientColors() {
            return []
        }
        getImages() {
            return []
        }
        getStyleConvertor() {
            return this.convertor ? this.convertor : this.convertor = new DefaultStyleConvertor
        }
        getExtraColors() {
            return this.extraColors
        }
        isUseDefault() {
            return !0
        }
    }
    ;
    class DefaultStyleConvertor {
        convertColor(r) {
            if (!r)
                return null;
            let o = r=>{
                let o = "string" == typeof r ? r : r.color;
                if ("none" === o)
                    return "transparent";
                let a = e()
                  , l = g.THEME_COLOR_NAMES.findIndex(r=>r === o);
                if (-1 !== l && (o = a[l]),
                "string" == typeof r)
                    return o;
                let n = r.opacity;
                return null == n || 100 === n ? o : g.color2Rgba(o, n / 100)
            }
            ;
            if ("object" == typeof r && ("linearGradients" === r.type || "radialGradients" === r.type)) {
                return r.value.forEach(r=>{
                    let g = r[0];
                    r[0] = o(g)
                }
                ),
                r
            }
            return o(r)
        }
        convertZoomSize(r) {
            return r
        }
        convertImage(r) {
            return r
        }
        convertIcon(r) {
            return r
        }
        convertCssZoomSize(r) {
            return `${r}px`
        }
    }
    o.DefaultStyleConvertor = DefaultStyleConvertor;
    let a = [];
    function e() {
        if (g.isEmpty(a))
            for (let r = 0, g = o.MAIN_COLORS.length; r < g; r++) {
                let e = o.MAIN_COLORS[r];
                a[r] = e;
                let l = b(e);
                for (let o = 0, n = l.length; o < n; o++)
                    a[(o + 1) * g + r] = l[o]
            }
        return a
    }
    function l(r) {
        return r.startsWith("#") && (r = r.substring(1)),
        {
            r: g.hex2Dec(r.substring(0, 2)),
            g: g.hex2Dec(r.substring(2, 4)),
            b: g.hex2Dec(r.substring(4))
        }
    }
    function n(r) {
        return "#" + g.dec2Hex(r.r) + g.dec2Hex(r.g) + g.dec2Hex(r.b)
    }
    function t(r) {
        let o = NaN
          , a = NaN
          , e = NaN
          , l = NaN;
        if (r.startsWith("#") && 7 == r.length && (o = g.hex2Dec(r.substring(1, 3)),
        a = g.hex2Dec(r.substring(3, 5)),
        e = g.hex2Dec(r.substring(5, 7))),
        (r.startsWith("rgb(") || r.startsWith("rgba(")) && ([o,a,e,l] = r.substring(r.indexOf("(") + 1, r.indexOf(")")).split(",").map(r=>parseFloat(r))),
        isNaN(o) || isNaN(a) || isNaN(e))
            throw new Error("Not a valid color value !");
        return isNaN(l) ? {
            r: o,
            g: a,
            b: e,
            a: 100
        } : {
            r: o,
            g: a,
            b: e,
            a: 100 * l
        }
    }
    function u(r, o) {
        return r
    }
    function b(r, o) {
        let g = Math.floor(10.5)
          , a = 100 / Math.ceil(10.5)
          , e = a * g;
        void 0 === o && (o = 5);
        let t = []
          , b = []
          , d = l(r)
          , c = function(r) {
            return Math.round((299 * r.r + 587 * r.g + 114 * r.b) / 1e3)
        };
        for (let l = 0; l < 21; l++) {
            let r = i(d, e - l * a);
            r = u(r),
            b.push(c(r)),
            t.push(n(r))
        }
        if (21 === o)
            return t;
        let C = c(d)
          , f = Math.abs(b[b.length - 1] - b[0]) / 20
          , h = Math.abs(C - b[0]);
        if (C - b[0] == 0 || h < f)
            return t.slice(g + 1, g + o + 1);
        let k = Math.abs(b[b.length - 1] - C);
        if (b[b.length - 1] - C == 0 || k < f)
            return t.slice(g - o, g);
        let s = Math.round(o / ((h + k) / h))
          , p = o - s
          , v = []
          , B = 1;
        for (let l = g; l >= 0 && B <= s; l--) {
            let r = b[l];
            Math.abs(C - r) > B * f && (v.splice(0, 0, t[l]),
            B++)
        }
        let F = 1;
        for (let l = g + 1; l < 21 && F <= p; l++) {
            let r = b[l];
            Math.abs(r - C) > F * f && (v.push(t[l]),
            F++)
        }
        return v
    }
    function i(r, o) {
        return r = o < 0 ? {
            r: r.r - Math.floor(r.r / 100 * -o),
            g: r.g - Math.floor(r.g / 100 * -o),
            b: r.b - Math.floor(r.b / 100 * -o)
        } : {
            r: Math.floor((255 - r.r) / 100 * o) + r.r,
            g: Math.floor((255 - r.g) / 100 * o) + r.g,
            b: Math.floor((255 - r.b) / 100 * o) + r.b
        }
    }
    function d(r, o) {
        let a, e = o ? o.convertColor(r) : r, l = e.type, n = e.value, t = "";
        for (let u = 0, b = n.length; u < b; u++) {
            let r = n[u]
              , a = r[0]
              , e = o ? a : a && "string" != typeof a ? g.color2Rgba(a.color, a.opacity / 100) : a
              , l = `${Number(100 * r[1]).toFixed(2)}%`;
            t += u === b - 1 ? `${e} ${l}` : `${e} ${l}, `
        }
        switch (l) {
        case "linearGradients":
            a = `linear-gradient(${e.deg}deg, ${t})`;
            break;
        case "radialGradients":
            a = `radial-gradient(circle, ${t})`
        }
        return a
    }
    function c(r, o) {
        return !r && !o || !(!r || !o) && r.every((r,g)=>f(r[0], o[g][0]) && r[1] == o[g][1])
    }
    function C(r, o) {
        if (!r && !o)
            return !0;
        if (!r || !o)
            return !1;
        let g = typeof r;
        return g === typeof o && ("string" === g ? r === o : "object" == typeof r && "object" == typeof o ? r.type === o.type && r.deg === o.deg && c(r.value, o.value) : void 0)
    }
    function f(r, o) {
        if (!r && !o)
            return !0;
        if (!r || !o)
            return !1;
        let g = typeof r;
        if (g !== typeof o)
            return !1;
        if ("string" === g)
            return r === o;
        let a = r
          , e = o;
        if (a.type && !e.type || !a.type && e.type)
            return !1;
        if (!a.type) {
            let g = r
              , a = o;
            return g.color == a.color && g.opacity == a.opacity
        }
        return C(a, e)
    }
    function h(r, o) {
        if (!r && !o)
            return !0;
        if (!r || !o)
            return !1;
        let g = r
          , a = o;
        for (let e in g)
            if (g[e] != a[e])
                return !1;
        return !0
    }
    o.getPopularColorArray = e,
    o.hex2rgb = l,
    o.rgb2hex = n,
    o.hsl2rgb = function(r, o, g) {
        let a, e, l;
        if (0 == o)
            a = e = l = g;
        else {
            let n = function(r, o, g) {
                return g < 0 && (g += 1),
                g > 1 && (g -= 1),
                g < 1 / 6 ? r + 6 * (o - r) * g : g < .5 ? o : g < 2 / 3 ? r + (o - r) * (2 / 3 - g) * 6 : r
            }
              , t = g < .5 ? g * (1 + o) : g + o - g * o
              , u = 2 * g - t;
            a = n(u, t, r + 1 / 3),
            e = n(u, t, r),
            l = n(u, t, r - 1 / 3)
        }
        return [Math.round(255 * a), Math.round(255 * e), Math.round(255 * l)]
    }
    ,
    o.rgb2hsl = function(r, o, g) {
        r /= 255,
        o /= 255,
        g /= 255;
        let a, e, l = Math.max(r, o, g), n = Math.min(r, o, g), t = (l + n) / 2;
        if (l == n)
            a = e = 0;
        else {
            let u = l - n;
            switch (e = t > .5 ? u / (2 - l - n) : u / (l + n),
            l) {
            case r:
                a = (o - g) / u + (o < g ? 6 : 0);
                break;
            case o:
                a = (g - r) / u + 2;
                break;
            case g:
                a = (r - o) / u + 4
            }
            a /= 6
        }
        return [a, e, t]
    }
    ,
    o.color2rgba = function(r) {
        return "string" == typeof r ? t(r) : {
            r: g.hex2Dec(r.color.substring(1, 3)),
            g: g.hex2Dec(r.color.substring(3, 5)),
            b: g.hex2Dec(r.color.substring(5)),
            a: r.opacity
        }
    }
    ,
    o.str2rgba = t,
    o.rgba2rgb = function(r, o="rgb(255, 255, 255)") {
        if (!r || !g.isRgba(r))
            return r;
        let a = g.parseRgba(r)
          , e = parseFloat(a.r)
          , l = parseFloat(a.g)
          , n = parseFloat(a.b)
          , t = parseFloat(a.a)
          , u = g.parseRgba(o)
          , b = parseFloat(u.r)
          , i = parseFloat(u.g)
          , d = parseFloat(u.b)
          , c = 1 - t;
        return "#" + g.dec2Hex(c * b + t * e) + g.dec2Hex(c * i + t * l) + g.dec2Hex(c * d + t * n)
    }
    ,
    o.generateShades = b,
    o.colorBrightness = i,
    o.gradientValueClone = function(r) {
        let o = [];
        for (let g = 0, a = r.length; g < a; g++) {
            let a = r[g]
              , e = a[0];
            o.push(["string" == typeof e ? e : Object.assign({}, e), a[1]])
        }
        return o
    }
    ,
    o.getFill = function(r, o) {
        if (!r)
            return "";
        let a, e = r.type, l = r.value;
        switch (e) {
        case "none":
            a = "background: none;";
            break;
        case "color":
            {
                let r = l;
                a = `background-color: ${o ? o.convertColor(r) : r && "string" != typeof r ? g.color2Rgba(r.color, r.opacity / 100) : r};`;
                break
            }
        case "gradient":
            a = `background: ${d(l, o)};`;
            break;
        case "picture":
            {
                let r = l
                  , e = r.type
                  , n = o ? o.convertImage(r.image) : r.image;
                if (!n)
                    return "";
                let t = `background-image: ${g.cssimg(n)};background-position: center;background-repeat: no-repeat;`;
                switch (e) {
                case "original":
                    a = t;
                    break;
                case "stretch":
                    a = `${t}background-size: 100% 100%;`;
                    break;
                case "cover":
                    a = `${t}background-size: cover;`;
                    break;
                case "contain":
                    a = `${t}background-size: contain;`;
                    break;
                case "clip":
                    {
                        let o = r.top
                          , e = r.right
                          , l = r.bottom
                          , t = r.left;
                        a = `border-image: ${g.cssimg(n)} fill ${o} ${e} ${l} ${t};border-width: ${o}px ${e}px ${l}px ${t}px;border-style:solid;`;
                        break
                    }
                case "repeat":
                    {
                        let o = r.repeatType;
                        !o && (o = "repeat");
                        let e = `background-image: ${g.cssimg(n)};background-position: left top;`;
                        switch (o) {
                        case "repeat":
                            a = `${e}background-repeat: repeat;`;
                            break;
                        case "repeat-x":
                            a = `${e}background-repeat: repeat-x;`;
                            break;
                        case "repeat-y":
                            a = `${e}background-repeat: repeat-y;`
                        }
                        break
                    }
                }
                break
            }
        case "animationEffect":
            {
                let r = l && l.image;
                a = r ? `background-image: ${g.cssimg(r)};background-position: center;background-repeat: no-repeat;background-size: cover;` : "background:none;";
                break
            }
        }
        return a
    }
    ,
    o.getGradientCss = d,
    o.compareSliderValue = c,
    o.compareGradientInfo = C,
    o.compareColorInfo = f,
    o.comparePictureFillInfo = h,
    o.compareFillInfo = function(r, o) {
        if (!r && !o)
            return !0;
        if (!r || !o)
            return !1;
        let g = r.type;
        if (g != o.type)
            return !1;
        if ("none" === g || "auto" === g)
            return !0;
        let a = r.value
          , e = o.value;
        return "picture" === g ? h(a, e) : f(a, e)
    }
    ,
    o.getStepColors = function(r, o, g, a) {
        let e = r=>4 === r.length ? r.substr(1).split("").map(r=>17 * parseInt(r, 16)) : [r.substr(1, 2), r.substr(3, 2), r.substr(5, 2)].map(r=>parseInt(r, 16))
          , l = r=>1 === r.length ? `0${r}` : r
          , n = []
          , t = [];
        a = a || 1;
        let u = function(r) {
            return Math.pow(r / 255, a)
        }
          , b = e(r).map(u)
          , i = e(o).map(u);
        for (let d = 0; d < g; d++) {
            let r = d / (g - 1)
              , o = 1 - r;
            for (let g = 0; g < 3; g++)
                t[g] = l(Math.round(255 * Math.pow(b[g] * o + i[g] * r, 1 / a)).toString(16));
            n.push(`#${t.join("")}`)
        }
        return n
    }
    ,
    o.getShadowCssText = function(r, o, g) {
        let a = "none"
          , e = o ? o.convertColor(r.color) : r.color;
        if ("none" !== r.type) {
            let o = "outset" === r.type ? "" : r.type;
            a = g ? `${2 * r.x}px ${2 * r.y}px ${2 * r.blur}px ${2 * r.spread}px ${e} ${o}` : `${r.x}px ${r.y}px ${r.blur}px ${r.spread}px ${e} ${o}`
        }
        return a
    }
    ;
    const k = {
        blue: {
            common: {
                backgroundColor: "#142B62",
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                foregroundColor2: "rgba(255, 255, 255, 0.45)",
                lineColor: "rgba(255, 255, 255, 0.12)",
                highlightBackgroundColor: "rgba(25, 125, 238, 0.3)",
                hoverHightlightBackgroundColor: "rgba(25, 125, 238, 0.3)",
                hoverBackgroundColor: "rgba(25, 125, 238, 0.1)",
                activeBackgroundColor: "rgb(25, 125, 238)"
            },
            dialog: {
                backgroundColor: "#06367B",
                foregroundColor: "rgba(255, 255, 255, 0.85)"
            },
            dropdown: {
                backgroundColor: "#06367B",
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                foregroundColor2: "rgba(255, 255, 255, 0.45)",
                hoverBackgroundColor: "rgba(25, 125, 238, 0.1)",
                highlightBackgroundColor: "rgba(25, 125, 238, 0.3)",
                activeBackgroundColor: "rgb(25, 125, 238)",
                lineColor: "rgba(255, 255, 255, 0.12)",
                hoverHightlightBackgroundColor: "rgba(25, 125, 238, 0.3)",
                hoverHightlightForegroundColor: "#fff"
            },
            input: {
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                foregroundColor2: "rgba(255, 255, 255, 0.45)",
                activeBackgroundColor: "rgb(25, 125, 238)",
                lineColor: "rgba(255, 255, 255, 0.08)"
            },
            button: {
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                lineColor: "rgba(255, 255, 255, 0.12)",
                activeBackgroundColor: "rgb(25, 125, 238)",
                activeForegroundColor: "rgba(255, 255, 255, 0.85)"
            },
            tabbar: {
                backgroundColor: "transparent",
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                highlightForegroundColor: "#fff",
                lineColor: "rgb(25, 125, 238)"
            },
            paginator: {
                backgroundColor: "#fff",
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                lineColor: "rgba(255, 255, 255, 0.08)",
                activeBackgroundColor: "rgba(25, 125, 238)"
            },
            link: {
                backgroundColor: "#142B62",
                highlightForegroundColor: "rgb(25, 125, 238)"
            }
        },
        darkBlue: {
            common: {
                backgroundColor: "#1C2E45",
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                foregroundColor2: "rgba(255, 255, 255, 0.45)",
                lineColor: "rgba(255, 255, 255, 0.05)",
                hoverBackgroundColor: "rgba(25, 125, 238, 0.1)",
                highlightBackgroundColor: "rgba(25, 125, 238, 0.3)",
                hoverHightlightBackgroundColor: "rgba(25, 125, 238, 0.3)",
                activeBackgroundColor: "rgb(25, 125, 238)"
            },
            dialog: {
                backgroundColor: "#223956",
                foregroundColor: "rgba(255, 255, 255, 0.85)"
            },
            dropdown: {
                backgroundColor: "#202B3E",
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                foregroundColor2: "rgba(255, 255, 255, 0.45)",
                hoverBackgroundColor: "rgba(0, 0, 0, 0.3)",
                highlightBackgroundColor: "rgba(25, 125, 238, 0.3)",
                activeBackgroundColor: "rgb(25, 125, 238)",
                lineColor: "rgba(255, 255, 255, 0.12)",
                hoverHightlightBackgroundColor: "rgba(25, 125, 238, 0.3)",
                hoverHightlightForegroundColor: "#fff"
            },
            input: {
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                foregroundColor2: "rgba(255, 255, 255, 0.45)",
                activeBackgroundColor: "rgb(25, 125, 238)",
                lineColor: "rgba(255, 255, 255, 0.08)"
            },
            button: {
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                activeBackgroundColor: "rgb(25, 125, 238)",
                activeForegroundColor: "rgba(255, 255, 255, 0.85)",
                lineColor: "rgba(255, 255, 255, 0.12)"
            },
            tabbar: {
                backgroundColor: "transparent",
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                highlightForegroundColor: "#fff",
                lineColor: "rgb(25, 125, 238)"
            },
            paginator: {
                backgroundColor: "#fff",
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                activeBackgroundColor: "rgb(25, 125, 238)",
                lineColor: "rgba(255, 255, 255, 0.08)"
            },
            link: {
                backgroundColor: "#223956",
                highlightForegroundColor: "rgb(25, 125, 238)"
            }
        },
        defaultLight: {
            common: {
                backgroundColor: "#fff",
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                foregroundColor2: "rgba(0, 0, 0, 0.3)",
                lineColor: "rgba(0, 0, 0, 0.18)",
                hoverBackgroundColor: "rgba(90, 174, 255, 0.1)",
                highlightBackgroundColor: "rgba(90, 174, 255, 0.2)",
                hoverHightlightBackgroundColor: "rgba(90, 174, 255, 0.2)",
                activeBackgroundColor: "rgb(90, 174, 255)"
            },
            dropdown: {
                backgroundColor: "#fff",
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                foregroundColor2: "rgba(0, 0, 0, 0.3)",
                lineColor: "rgba(0, 0, 0, 0.18)",
                hoverBackgroundColor: "rgba(90, 174, 255, 0.1)",
                highlightBackgroundColor: "rgba(90, 174, 255, 0.2)",
                hoverHightlightBackgroundColor: "rgba(90, 174, 255, 0.2)",
                activeBackgroundColor: "rgb(90, 174, 255)"
            },
            input: {
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                foregroundColor2: "rgba(0, 0, 0, 0.3)",
                backgroundColor: "rgba(0, 0, 0, 0)",
                activeBackgroundColor: "rgb(90, 174, 255)",
                lineColor: "rgba(0, 0, 0, 0.18)"
            },
            button: {
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                activeBackgroundColor: "rgb(90, 174, 255)",
                activeForegroundColor: "#fff",
                lineColor: "rgba(0, 0, 0, 0.18)"
            },
            tabbar: {
                backgroundColor: "transparent",
                highlightBackgroundColor: "#fff",
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                lineColor: "rgb(90, 175, 255)"
            },
            paginator: {
                backgroundColor: "#fff",
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                activeBackgroundColor: "rgb(90, 174, 255)",
                lineColor: "rgba(0, 0, 0, 0.18)"
            },
            link: {
                backgroundColor: "#fff",
                highlightForegroundColor: "rgb(90, 174, 255)"
            }
        },
        green: {
            common: {
                backgroundColor: "#fff",
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                foregroundColor2: "rgba(0, 0, 0, 0.3)",
                lineColor: "rgba(0, 0, 0, 0.18)",
                hoverBackgroundColor: "rgba(52, 177, 154, 0.1)",
                highlightBackgroundColor: "rgba(52, 177, 154, 0.2)",
                hoverHightlightBackgroundColor: "rgba(52, 177, 154, 0.2)",
                activeBackgroundColor: "rgb(52, 177, 154)"
            },
            dropdown: {
                backgroundColor: "#fff",
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                foregroundColor2: "rgba(0, 0, 0, 0.3)",
                lineColor: "rgba(0, 0, 0, 0.18)",
                hoverBackgroundColor: "rgba(52, 177, 154, 0.1)",
                highlightBackgroundColor: "rgba(52, 177, 154, 0.2)",
                hoverHightlightBackgroundColor: "rgba(52, 177, 154, 0.2)",
                activeBackgroundColor: "rgb(52, 177, 154)",
                activeForegroundColor: "rgb(52, 177, 154)"
            },
            input: {
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                foregroundColor2: "rgba(0, 0, 0, 0.3)",
                backgroundColor: "rgba(0, 0, 0, 0)",
                activeBackgroundColor: "rgb(52, 177, 154)",
                lineColor: "rgba(0, 0, 0, 0.18)"
            },
            button: {
                activeBackgroundColor: "rgb(52, 177, 154)",
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                activeForegroundColor: "#fff",
                lineColor: "rgba(0, 0, 0, 0.18)"
            },
            tabbar: {
                backgroundColor: "transparent",
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                lineColor: "rgb(52, 177, 154)",
                activeBackgroundColor: "rgb(52, 177, 154)"
            },
            paginator: {
                backgroundColor: "#fff",
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                activeBackgroundColor: "rgb(52, 177, 154)",
                lineColor: "rgba(0, 0, 0, 0.18)"
            },
            link: {
                backgroundColor: "#fff",
                highlightForegroundColor: "rgb(52, 177, 154)"
            }
        },
        greyblue: {
            common: {
                backgroundColor: "#fff",
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                foregroundColor2: "rgba(0, 0, 0, 0.3)",
                lineColor: "rgba(0, 0, 0, 0.18)",
                hoverBackgroundColor: "rgba(90, 174, 255, 0.1)",
                highlightBackgroundColor: "rgba(90, 174, 255, 0.2)",
                hoverHightlightBackgroundColor: "rgba(90, 174, 255, 0.2)",
                activeBackgroundColor: "rgb(90, 174, 255)"
            },
            menu: {
                backgroundColor: "#fff",
                foregroundColor: "#3A415D",
                foregroundColor2: "rgb(139, 144, 164)",
                lineColor: "rgba(0, 0, 0, 0.18)",
                hoverBackgroundColor: "rgb(235, 242, 255)",
                hoverForegroundColor: "#1D1D1D",
                hoverForegroundColor2: "rgb(87, 110, 169)",
                highlightBackgroundColor: "rgb(235, 242, 255)",
                highlightForegroundColor: "rgb(118, 144, 212)",
                hoverHightlightBackgroundColor: "rgba(65, 148, 255, 0.2)",
                activeBackgroundColor: "rgb(65, 148, 255)"
            },
            dropdown: {
                backgroundColor: "#fff",
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                foregroundColor2: "rgba(0, 0, 0, 0.3)",
                lineColor: "rgba(0, 0, 0, 0.18)",
                hoverBackgroundColor: "rgba(90, 174, 255, 0.1)",
                highlightBackgroundColor: "rgba(90, 174, 255, 0.2)",
                hoverHightlightBackgroundColor: "rgba(90, 174, 255, 0.2)",
                activeBackgroundColor: "rgb(90, 174, 255)"
            },
            input: {
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                foregroundColor2: "rgba(0, 0, 0, 0.3)",
                backgroundColor: "rgba(0, 0, 0, 0)",
                activeBackgroundColor: "rgb(90, 174, 255)",
                lineColor: "rgba(0, 0, 0, 0.18)"
            },
            button: {
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                activeBackgroundColor: "rgb(90, 174, 255)",
                activeForegroundColor: "#fff",
                lineColor: "rgba(0, 0, 0, 0.18)"
            },
            tabbar: {
                backgroundColor: "transparent",
                highlightBackgroundColor: "#fff",
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                lineColor: "rgb(90, 175, 255)"
            },
            paginator: {
                backgroundColor: "#fff",
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                activeBackgroundColor: "rgb(90, 174, 255)",
                lineColor: "rgba(0, 0, 0, 0.18)"
            },
            link: {
                backgroundColor: "#fff",
                highlightForegroundColor: "rgb(90, 174, 255)"
            }
        },
        nightelves: {
            common: {
                backgroundColor: "#232e61",
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                foregroundColor2: "rgba(255, 255, 255, 0.45)",
                lineColor: "rgba(255, 255, 255, 0.12)",
                hoverBackgroundColor: "rgba(65, 148, 255, 0.1)",
                highlightBackgroundColor: "rgba(65, 148, 255, 0.3)",
                hoverHightlightBackgroundColor: "rgba(65, 148, 255, 0.3)",
                activeBackgroundColor: "rgb(65, 148, 255)"
            },
            dialog: {
                backgroundColor: "#232F61",
                foregroundColor: "rgba(255, 255, 255, 0.85)"
            },
            dropdown: {
                backgroundColor: "#232F61",
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                foregroundColor2: "rgba(255, 255, 255, 0.45)",
                lineColor: "rgba(255, 255, 255, 0.12)",
                hoverBackgroundColor: "rgba(65, 148, 255, 0.1)",
                highlightBackgroundColor: "rgba(65, 148, 255, 0.3)",
                hoverHightlightBackgroundColor: "rgba(65, 148, 255, 0.3)",
                activeBackgroundColor: "rgb(65, 148, 255)"
            },
            input: {
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                foregroundColor2: "rgba(255, 255, 255, 0.45)",
                activeBackgroundColor: "rgb(65, 148, 255)",
                lineColor: "rgba(255, 255, 255, 0.08)"
            },
            button: {
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                activeBackgroundColor: "rgb(65, 148, 255)",
                activeForegroundColor: "#rgba(255, 255, 255, 0.85)",
                lineColor: "rgba(255, 255, 255, 0.12)"
            },
            tabbar: {
                backgroundColor: "transparent",
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                highlightForegroundColor: "#fff",
                lineColor: "rgb(65, 148, 255)"
            },
            paginator: {
                backgroundColor: "#fff",
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                activeBackgroundColor: "rgb(65, 148, 255)",
                lineColor: "rgba(255, 255, 255, 0.12)"
            },
            link: {
                backgroundColor: "#232e61",
                highlightForegroundColor: "rgb(65, 148, 255)"
            }
        },
        oceanKingdom: {
            common: {
                backgroundColor: "#fff",
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                foregroundColor2: "rgba(0, 0, 0, 0.3)",
                lineColor: "rgba(0, 0, 0, 0.18)",
                hoverBackgroundColor: "rgba(65, 148, 255, 0.1)",
                highlightBackgroundColor: "rgba(65, 148, 255, 0.2)",
                hoverHightlightBackgroundColor: "rgba(65, 148, 255, 0.2)",
                activeBackgroundColor: "rgb(65, 148, 255)"
            },
            menu: {
                backgroundColor: "#fff",
                foregroundColor: "#636B74",
                foregroundColor2: "rgb(139, 150, 161)",
                lineColor: "rgba(0, 0, 0, 0.18)",
                hoverBackgroundColor: "rgba(190, 229, 255, 0.38)",
                hoverForegroundColor: "rgb(27, 151, 249)",
                hoverForegroundColor2: "rgb(27, 151, 249)",
                highlightBackgroundColor: "rgba(190, 229, 255, 0.38)",
                hoverHightlightBackgroundColor: "rgba(65, 148, 255, 0.2)",
                activeBackgroundColor: "rgb(65, 148, 255)"
            },
            dropdown: {
                backgroundColor: "#fff",
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                foregroundColor2: "rgba(0, 0, 0, 0.3)",
                lineColor: "rgba(0, 0, 0, 0.18)",
                hoverBackgroundColor: "rgba(65, 148, 255, 0.1)",
                highlightBackgroundColor: "rgba(65, 148, 255, 0.2)",
                hoverHightlightBackgroundColor: "rgba(65, 148, 255, 0.2)",
                activeBackgroundColor: "rgb(65, 148, 255)"
            },
            input: {
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                foregroundColor2: "rgba(0, 0, 0, 0.3)",
                backgroundColor: "rgba(0, 0, 0, 0)",
                activeBackgroundColor: "rgb(65, 148, 255)",
                lineColor: "rgba(0, 0, 0, 0.18)"
            },
            button: {
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                activeBackgroundColor: "rgb(65, 148, 255)",
                activeForegroundColor: "#fff",
                lineColor: "rgba(0, 0, 0, 0.18)"
            },
            tabbar: {
                backgroundColor: "transparent",
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                lineColor: "rgb(65, 148, 255)"
            },
            paginator: {
                backgroundColor: "#fff",
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                activeBackgroundColor: "rgb(65, 148, 255)",
                lineColor: "rgba(0, 0, 0, 0.18)"
            },
            link: {
                backgroundColor: "#fff",
                highlightForegroundColor: "rgb(65, 148, 255)"
            }
        },
        purpleWave: {
            common: {
                backgroundColor: "rgb(20, 26, 96)",
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                foregroundColor2: "rgba(255, 255, 255, 0.45)",
                lineColor: "rgba(255, 255, 255, 0.12)",
                hoverBackgroundColor: "rgba(138,129,255, 0.1)",
                highlightBackgroundColor: "rgba(138,129,255, 0.3)",
                hoverHightlightBackgroundColor: "rgba(138,129,255, 0.3)",
                activeBackgroundColor: "rgb(138,129,255)"
            },
            dialog: {
                backgroundColor: "#11205F",
                foregroundColor: "rgba(255, 255, 255, 0.85)"
            },
            dropdown: {
                backgroundColor: "#11205F",
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                foregroundColor2: "rgba(255, 255, 255, 0.45)",
                lineColor: "rgba(255, 255, 255, 0.12)",
                hoverBackgroundColor: "rgba(138,129,255, 0.1)",
                highlightBackgroundColor: "rgba(138,129,255, 0.3)",
                hoverHightlightBackgroundColor: "rgba(138,129,255, 0.3)",
                activeBackgroundColor: "rgb(138,129,255)"
            },
            input: {
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                foregroundColor2: "rgba(255, 255, 255, 0.45)",
                activeBackgroundColor: "rgb(138,129,255)",
                lineColor: "rgba(255, 255, 255, 0.08)"
            },
            button: {
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                activeBackgroundColor: "rgb(138,129,255)",
                activeForegroundColor: "rgba(255, 255, 255, 0.85)",
                lineColor: "rgba(255, 255, 255, 0.12)"
            },
            tabbar: {
                backgroundColor: "transparent",
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                highlightForegroundColor: "#fff",
                lineColor: "rgb(138,129,255)"
            },
            paginator: {
                backgroundColor: "#fff",
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                activeBackgroundColor: "rgb(138,129,255)",
                lineColor: "rgba(255, 255, 255, 0.08)"
            },
            link: {
                backgroundColor: "rgb(20, 26, 96)",
                highlightForegroundColor: "rgb(138,129,255)"
            }
        },
        yinshua: {
            common: {
                backgroundColor: "#fff",
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                foregroundColor2: "rgba(0, 0, 0, 0.3)",
                lineColor: "rgba(0, 0, 0, 0.18)",
                highlightBackgroundColor: "rgba(198, 93, 85, 0.2)",
                hoverHightlightBackgroundColor: "rgba(198, 93, 85, 0.2)",
                hoverBackgroundColor: "rgba(198, 93, 85, 0.1)",
                activeBackgroundColor: "rgb(198, 93, 85)"
            },
            dialog: {
                backgroundColor: "#fff",
                foregroundColor: "rgba(0, 0, 0, 0.85)"
            },
            dropdown: {
                backgroundColor: "#fff",
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                foregroundColor2: "rgba(0, 0, 0, 0.3)",
                lineColor: "rgba(0, 0, 0, 0.18)",
                hoverBackgroundColor: "rgba(198, 93, 85, 0.1)",
                highlightBackgroundColor: "rgba(198, 93, 85, 0.2)",
                hoverHightlightBackgroundColor: "rgba(198, 93, 85, 0.2)",
                activeBackgroundColor: "rgb(198, 93, 85)",
                activeForegroundColor: "rgb(198, 93, 85)"
            },
            input: {
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                foregroundColor2: "rgba(0, 0, 0, 0.3)",
                backgroundColor: "rgba(0, 0, 0, 0)",
                activeBackgroundColor: "rgb(198, 93, 85)",
                lineColor: "rgba(0, 0, 0, 0.18)"
            },
            button: {
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                activeBackgroundColor: "rgb(198, 93, 85)",
                activeForegroundColor: "#fff",
                lineColor: "rgba(0, 0, 0, 0.18)"
            },
            tabbar: {
                backgroundColor: "transparent",
                highlightBackgroundColor: "#fff",
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                lineColor: "rgb(198, 93, 85)",
                activeBackgroundColor: "rgb(198, 93, 85)"
            },
            paginator: {
                backgroundColor: "#fff",
                foregroundColor: "rgba(0, 0, 0, 0.85)",
                activeBackgroundColor: "rgb(198, 93, 85)",
                lineColor: "rgba(0, 0, 0, 0.18)"
            },
            link: {
                backgroundColor: "#fff",
                highlightForegroundColor: "rgb(198, 93, 85)"
            }
        },
        golden: {
            common: {
                backgroundColor: "#191D29",
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                foregroundColor2: "rgba(255, 255, 255, 0.45)",
                lineColor: "rgba(255, 255, 255, 0.12)",
                highlightBackgroundColor: "rgba(193, 184, 118, 0.3)",
                hoverHightlightBackgroundColor: "rgba(193, 184, 118, 0.3)",
                hoverBackgroundColor: "rgba(193, 184, 118, 0.1)",
                activeBackgroundColor: "rgb(193, 184, 118)"
            },
            dialog: {
                backgroundColor: "#262A35",
                foregroundColor: "rgba(255, 255, 255, 0.85)"
            },
            dropdown: {
                backgroundColor: "#0B0F19",
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                foregroundColor2: "rgba(255, 255, 255, 0.45)",
                hoverBackgroundColor: "rgba(193, 184, 118, 0.1)",
                highlightBackgroundColor: "rgba(193, 184, 118, 0.3)",
                activeBackgroundColor: "rgb(193, 184, 118)",
                lineColor: "rgba(255, 255, 255, 0.12)",
                hoverHightlightBackgroundColor: "rgba(193, 184, 118, 0.3)",
                hoverHightlightForegroundColor: "#fff",
                activeForegroundColor: "rgb(193, 184, 118)"
            },
            input: {
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                foregroundColor2: "rgba(255, 255, 255, 0.45)",
                activeBackgroundColor: "rgb(193, 184, 118)",
                lineColor: "rgba(255, 255, 255, 0.08)"
            },
            button: {
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                lineColor: "rgba(255, 255, 255, 0.12)",
                activeBackgroundColor: "rgb(193, 184, 118)",
                activeForegroundColor: "rgba(255, 255, 255, 0.85)"
            },
            tabbar: {
                backgroundColor: "transparent",
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                highlightForegroundColor: "#fff",
                lineColor: "rgb(193, 184, 118)",
                activeBackgroundColor: "rgb(193, 184, 118)"
            },
            paginator: {
                backgroundColor: "#191D29",
                foregroundColor: "rgba(255, 255, 255, 0.85)",
                lineColor: "rgba(255, 255, 255, 0.08)",
                activeBackgroundColor: "rgba(193, 184, 118)"
            },
            link: {
                backgroundColor: "#191D29",
                highlightForegroundColor: "rgb(193, 184, 118)"
            }
        }
    };
    for (let s in k) {
        let r = k[s];
        g.getCustomStyleManager().addColorTheme(s, r)
    }
});

define("sys/lz-string", ["require", "exports"], function(r, o) {
    "use strict";
    Object.defineProperty(o, "__esModule", {
        value: !0
    }),
    o.LZString = void 0;
    const n = String.fromCharCode
      , t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
      , e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$"
      , i = {};
    function s(r, o) {
        if (!i[r]) {
            i[r] = {};
            for (var n = 0; n < r.length; n++)
                i[r][r.charAt(n)] = n
        }
        return i[r][o]
    }
    o.LZString = {
        compressToBase64: function(r) {
            if (null == r)
                return "";
            var n = o.LZString._compress(r, 6, function(r) {
                return t.charAt(r)
            });
            switch (n.length % 4) {
            default:
            case 0:
                return n;
            case 1:
                return n + "===";
            case 2:
                return n + "==";
            case 3:
                return n + "="
            }
        },
        decompressFromBase64: function(r) {
            return null == r ? "" : "" == r ? null : o.LZString._decompress(r.length, 32, function(o) {
                return s(t, r.charAt(o))
            })
        },
        compressToUTF16: function(r) {
            return null == r ? "" : o.LZString._compress(r, 15, function(r) {
                return n(r + 32)
            }) + " "
        },
        decompressFromUTF16: function(r) {
            return null == r ? "" : "" == r ? null : o.LZString._decompress(r.length, 16384, function(o) {
                return r.charCodeAt(o) - 32
            })
        },
        compressToUint8Array: function(r) {
            for (var n = o.LZString.compress(r), t = new Uint8Array(2 * n.length), e = 0, i = n.length; e < i; e++) {
                var s = n.charCodeAt(e);
                t[2 * e] = s >>> 8,
                t[2 * e + 1] = s % 256
            }
            return t
        },
        decompressFromUint8Array: function(r) {
            if (null == r)
                return o.LZString.decompress(r);
            for (var t = new Array(r.length / 2), e = 0, i = t.length; e < i; e++)
                t[e] = 256 * r[2 * e] + r[2 * e + 1];
            var s = [];
            return t.forEach(function(r) {
                s.push(n(r))
            }),
            o.LZString.decompress(s.join(""))
        },
        compressToEncodedURIComponent: function(r) {
            return null == r ? "" : o.LZString._compress(r, 6, function(r) {
                return e.charAt(r)
            })
        },
        decompressFromEncodedURIComponent: function(r) {
            return null == r ? "" : "" == r ? null : (r = r.replace(/ /g, "+"),
            o.LZString._decompress(r.length, 32, function(o) {
                return s(e, r.charAt(o))
            }))
        },
        compress: function(r) {
            return o.LZString._compress(r, 16, function(r) {
                return n(r)
            })
        },
        _compress: function(r, o, n) {
            if (null == r)
                return "";
            var t, e, i, s = {}, p = {}, c = "", u = "", a = "", l = 2, f = 3, h = 2, d = [], m = 0, g = 0;
            for (i = 0; i < r.length; i += 1)
                if (c = r.charAt(i),
                Object.prototype.hasOwnProperty.call(s, c) || (s[c] = f++,
                p[c] = !0),
                u = a + c,
                Object.prototype.hasOwnProperty.call(s, u))
                    a = u;
                else {
                    if (Object.prototype.hasOwnProperty.call(p, a)) {
                        if (a.charCodeAt(0) < 256) {
                            for (t = 0; t < h; t++)
                                m <<= 1,
                                g == o - 1 ? (g = 0,
                                d.push(n(m)),
                                m = 0) : g++;
                            for (e = a.charCodeAt(0),
                            t = 0; t < 8; t++)
                                m = m << 1 | 1 & e,
                                g == o - 1 ? (g = 0,
                                d.push(n(m)),
                                m = 0) : g++,
                                e >>= 1
                        } else {
                            for (e = 1,
                            t = 0; t < h; t++)
                                m = m << 1 | e,
                                g == o - 1 ? (g = 0,
                                d.push(n(m)),
                                m = 0) : g++,
                                e = 0;
                            for (e = a.charCodeAt(0),
                            t = 0; t < 16; t++)
                                m = m << 1 | 1 & e,
                                g == o - 1 ? (g = 0,
                                d.push(n(m)),
                                m = 0) : g++,
                                e >>= 1
                        }
                        0 == --l && (l = Math.pow(2, h),
                        h++),
                        delete p[a]
                    } else
                        for (e = s[a],
                        t = 0; t < h; t++)
                            m = m << 1 | 1 & e,
                            g == o - 1 ? (g = 0,
                            d.push(n(m)),
                            m = 0) : g++,
                            e >>= 1;
                    0 == --l && (l = Math.pow(2, h),
                    h++),
                    s[u] = f++,
                    a = String(c)
                }
            if ("" !== a) {
                if (Object.prototype.hasOwnProperty.call(p, a)) {
                    if (a.charCodeAt(0) < 256) {
                        for (t = 0; t < h; t++)
                            m <<= 1,
                            g == o - 1 ? (g = 0,
                            d.push(n(m)),
                            m = 0) : g++;
                        for (e = a.charCodeAt(0),
                        t = 0; t < 8; t++)
                            m = m << 1 | 1 & e,
                            g == o - 1 ? (g = 0,
                            d.push(n(m)),
                            m = 0) : g++,
                            e >>= 1
                    } else {
                        for (e = 1,
                        t = 0; t < h; t++)
                            m = m << 1 | e,
                            g == o - 1 ? (g = 0,
                            d.push(n(m)),
                            m = 0) : g++,
                            e = 0;
                        for (e = a.charCodeAt(0),
                        t = 0; t < 16; t++)
                            m = m << 1 | 1 & e,
                            g == o - 1 ? (g = 0,
                            d.push(n(m)),
                            m = 0) : g++,
                            e >>= 1
                    }
                    0 == --l && (l = Math.pow(2, h),
                    h++),
                    delete p[a]
                } else
                    for (e = s[a],
                    t = 0; t < h; t++)
                        m = m << 1 | 1 & e,
                        g == o - 1 ? (g = 0,
                        d.push(n(m)),
                        m = 0) : g++,
                        e >>= 1;
                0 == --l && (l = Math.pow(2, h),
                h++)
            }
            for (e = 2,
            t = 0; t < h; t++)
                m = m << 1 | 1 & e,
                g == o - 1 ? (g = 0,
                d.push(n(m)),
                m = 0) : g++,
                e >>= 1;
            for (; ; ) {
                if (m <<= 1,
                g == o - 1) {
                    d.push(n(m));
                    break
                }
                g++
            }
            return d.join("")
        },
        decompress: function(r) {
            return null == r ? "" : "" == r ? null : o.LZString._decompress(r.length, 32768, function(o) {
                return r.charCodeAt(o)
            })
        },
        _decompress: function(r, o, t) {
            var e, i, s, p, c, u, a, l = [], f = 4, h = 4, d = 3, m = "", g = [], v = {
                val: t(0),
                position: o,
                index: 1
            };
            for (e = 0; e < 3; e += 1)
                l[e] = e;
            for (s = 0,
            c = Math.pow(2, 2),
            u = 1; u != c; )
                p = v.val & v.position,
                v.position >>= 1,
                0 == v.position && (v.position = o,
                v.val = t(v.index++)),
                s |= (p > 0 ? 1 : 0) * u,
                u <<= 1;
            switch (s) {
            case 0:
                for (s = 0,
                c = Math.pow(2, 8),
                u = 1; u != c; )
                    p = v.val & v.position,
                    v.position >>= 1,
                    0 == v.position && (v.position = o,
                    v.val = t(v.index++)),
                    s |= (p > 0 ? 1 : 0) * u,
                    u <<= 1;
                a = n(s);
                break;
            case 1:
                for (s = 0,
                c = Math.pow(2, 16),
                u = 1; u != c; )
                    p = v.val & v.position,
                    v.position >>= 1,
                    0 == v.position && (v.position = o,
                    v.val = t(v.index++)),
                    s |= (p > 0 ? 1 : 0) * u,
                    u <<= 1;
                a = n(s);
                break;
            case 2:
                return ""
            }
            for (l[3] = a,
            i = a,
            g.push(a); ; ) {
                if (v.index > r)
                    return "";
                for (s = 0,
                c = Math.pow(2, d),
                u = 1; u != c; )
                    p = v.val & v.position,
                    v.position >>= 1,
                    0 == v.position && (v.position = o,
                    v.val = t(v.index++)),
                    s |= (p > 0 ? 1 : 0) * u,
                    u <<= 1;
                switch (a = s) {
                case 0:
                    for (s = 0,
                    c = Math.pow(2, 8),
                    u = 1; u != c; )
                        p = v.val & v.position,
                        v.position >>= 1,
                        0 == v.position && (v.position = o,
                        v.val = t(v.index++)),
                        s |= (p > 0 ? 1 : 0) * u,
                        u <<= 1;
                    l[h++] = n(s),
                    a = h - 1,
                    f--;
                    break;
                case 1:
                    for (s = 0,
                    c = Math.pow(2, 16),
                    u = 1; u != c; )
                        p = v.val & v.position,
                        v.position >>= 1,
                        0 == v.position && (v.position = o,
                        v.val = t(v.index++)),
                        s |= (p > 0 ? 1 : 0) * u,
                        u <<= 1;
                    l[h++] = n(s),
                    a = h - 1,
                    f--;
                    break;
                case 2:
                    return g.join("")
                }
                if (0 == f && (f = Math.pow(2, d),
                d++),
                l[a])
                    m = l[a];
                else {
                    if (a !== h)
                        return null;
                    m = i + i.charAt(0)
                }
                g.push(m),
                l[h++] = i + m.charAt(0),
                i = m,
                0 == --f && (f = Math.pow(2, d),
                d++)
            }
        }
    }
});

//# sourceMappingURL=sys-all.js.map
