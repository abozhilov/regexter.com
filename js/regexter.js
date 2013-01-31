var regexter = {};
(function () {
    var BASE_URL = 'http://regexter.com', 
        MAX_CHARS_LINE = 100,
        JSON_PARSE = typeof JSON != 'undefined' && typeof JSON.parse != 'undefined',
         
        MATCH_FOUND = '<span class="match">Match found</span>',
        MATCH_FAIL = '<span class="fail">Match failed</span>',
        BACKTRACK = '<span class="fail">backtrack</span>',
        TOO_MUCH_BACKTRACK = '<span class="fail">Too much backtracking</span>',
        UNEXPECTED_ERROR = '<span class="fail">Unexpected error</span>';
    
      
    var SUCCEED = 'SUCCEED',
        TIMEOUT = 'TIMEOUT',
        Z_WIDTH_TOKEN = {
            BRK  : 1,
            NBRK : 1,
            BOL  : 1,
            EOL  : 1
        };
    
    var HTML_ESCAPE_CHARS = {
        '<' : '&lt;',
        '>' : '&gt;',
        '&' : '&amp;',
        "'" : '&#39;',
        '"' : '&quot;'
    };
    
    var IS_LOCAL_STORAGE = typeof localStorage != 'undefined',
        REG_KEY = 'regexp',
        FLAGS_KEY = 'flags',
        DATA_KEY = 'data';
        
        
    var regexp, data,
        regErr, global, 
        ignoreCase, multiline,
        debugHolder, permalink;
        
    regexter.init = function () {
        regexp = document.getElementById('regex-field');
        data = document.getElementById('regex-data');
        regErr = document.getElementById('regex-error');
        global = document.getElementById('global-search');
        ignoreCase = document.getElementById('case-insensitive');
        multiline = document.getElementById('multiline-search');
        debugHolder = document.getElementById('debug-holder');
        permalink = document.getElementById('permalink');
        
        var hash = window.location.hash;
        if (hash) {
            var params = regexter.parseHash(hash);
            regexp.value = params.regexp; 
            regexter.setFlags(params.flags);
            data.value = params.data;
        }
        else if (IS_LOCAL_STORAGE) {
            var flags = localStorage.getItem(FLAGS_KEY);
            regexp.value = localStorage.getItem(REG_KEY);            
            if (flags) regexter.setFlags(flags);
            data.value = localStorage.getItem(DATA_KEY);
        }
        regexter.initEvents();                
        regexter.send({immediate: true});
    };
    
    regexter.initEvents = function () {
        var immediateSend = function (){regexter.send({immediate: true});},
            delayedSend = function(){regexter.send({immediate: false});};
            
        regexter.addEvent(ignoreCase, 'change', immediateSend);
        regexter.addEvent(global, 'change', immediateSend);
        regexter.addEvent(multiline, 'change', immediateSend);        
        regexter.addOnInput(regexp, delayedSend);
        regexter.addOnInput(data, delayedSend);
    };
    
    regexter.addEvent = function (elm, evt, callback) {
        if (typeof elm.addEventListener != 'undefined') {
            elm.addEventListener(evt, callback, false);    
        }
        else if (typeof elm.attachEvent != 'undefined') {
            elm.attachEvent('on' + evt,  callback); 
        }
        else {
            elm['on' + evt] = callback;    
        }
    };
    
    regexter.removeEvent = function (elm, evt, callback) {
        if (typeof elm.removeEventListener != 'undefined') {
            elm.removeEventListener(evt, callback, false);    
        }
        else if (typeof elm.attachEvent != 'undefined') {
            elm.detachEvent('on' + evt,  callback); 
        }
        else {
            elm['on' + evt] = null;    
        }
    };
    
    regexter.addOnInput = function (elm, callback) {
        regexter.addEvent(elm, 'input', function onInput() {
            regexter.removeEvent(elm, 'keyup', callback);
            regexter.removeEvent(elm, 'change', callback);
            regexter.removeEvent(elm, 'input', onInput);    
        });        
        regexter.addEvent(elm, 'input', callback);
        regexter.addEvent(elm, 'keyup', callback);
        regexter.addEvent(elm, 'change', callback);        
    };
    
    regexter.parseHash = function (hash) {
        var match = hash.match(/[#&][^=]+=[^&]*/g),
            map = {};
        if (match) {
            for (var i = match.length; i--;) {
                var part = match[i].split('=');
                map[part[0].slice(1)] = unescape(part[1]);
            }
        }
        return {
            regexp : map.regexp || '',
            flags  : map.flags  || '',
            data   : map.data   || ''
        };
    };
    
    regexter.setPermalink = function () {
        var link = BASE_URL + 
                  '#regexp=' + escape(regexp.value) +
                  '&flags=' + regexter.getFlags() + 
                  '&data=' + escape(data.value);
                  
        permalink.innerHTML = '<a href="' + link + '">' + link + '</a>';
    };
    
    regexter.getFlags = function () {
        return '' + (global.checked ? 'g' : '') +  (ignoreCase.checked ? 'i' : '') + (multiline.checked ? 'm' : '');
    };
    
    regexter.setFlags = function (flags) {
        if (flags.indexOf('g') > -1) {
            global.checked = true;
        }
        if (flags.indexOf('i') > -1) {
            ignoreCase.checked = true;
        }
        if (flags.indexOf('m') > -1) {
            multiline.checked = true;
        }                
    };
    
    var timer;
    regexter.send = function (params) {
        function processing() {
            var flags = regexter.getFlags(),
                regstr = '/' + regexp.value + '/' + flags;
                           
            try {
                new RegExp('\/' + regexp.value + '\/' + flags);
                regErr.innerHTML = '';
            } catch (e) {
                regErr.innerHTML = e;
                regexter.flush();
                return;
            }
            
            if (regexp.value.length && data.value.length) {
                regexter.getDebug(regstr, data.value);            
            }
            else {
                regexter.flush();
            }
            
            if (IS_LOCAL_STORAGE) {
                localStorage.setItem(REG_KEY, regexp.value);   
                localStorage.setItem(FLAGS_KEY, flags);
                localStorage.setItem(DATA_KEY, data.value);
            }
            regexter.setPermalink();
        };
        
        clearTimeout(timer);
        if (params.immediate) {
            processing();
            return;
        }
        timer = setTimeout(processing, 500);
    };
    
    regexter.showHide = function (sender, elmId) {
        var elm = document.getElementById(elmId);
        
        if (sender.className == 'hide') {
            sender.className = 'open';
            elm.style.display = 'block';
        }
        else {
            sender.className = 'hide';
            elm.style.display = 'none';
        }
        return false;
    };
    
    regexter.flush = function () {
        debugHolder.innerHTML = '<pre>Not available</pre>';
    };
    
    regexter.output = function(debug) {
        debugHolder.innerHTML = '<pre>' + debug + '</pre>';
    };
    
    regexter.escapeHTML = function (str) {
        return str.replace(/[<>&'"]/g, function (ch) {
            return HTML_ESCAPE_CHARS[ch];
        });
    };
    
    regexter.truncate = function (str) {
        if (str.length > MAX_CHARS_LINE) {
            str = '... ' + str.slice(-MAX_CHARS_LINE);
        }
        return str.replace(/[\n\r]/g, ' ');
    };
    
    regexter.highlightMatch = function (str, start) {
        var len = str.length,
            diff = len - MAX_CHARS_LINE,
            fStr = regexter.truncate(str);
        if (len > MAX_CHARS_LINE) {
            if (start < diff) {
                start = 0;
            }
            else {
                start -= diff - 4;
            }
        }
        
        return '<span class="processing">' + regexter.escapeHTML(fStr.slice(0, start)) + '</span>' +
               '<span class="match">' + regexter.escapeHTML(fStr.slice(start)) + '</span>';
    };
    
    regexter.getOffsets = function (str) {
        var match = /^OFFSETS:.+$/m.exec(str);
        if (match) {
            var arrStr = match[0].slice(8);
            if (JSON_PARSE) 
                return JSON.parse(arrStr);
            else
                return eval(arrStr);
        }
        return [];
    };
         
    regexter.getDebug = function (reg, data) {
        var xhr = typeof XMLHttpRequest != 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP'),
            post = 'reg=' + encodeURIComponent(reg) + '&data=' + encodeURIComponent(data);
        
        xhr.open('POST', 'processing.php', true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var response = xhr.responseText,
                        offsets = regexter.getOffsets(response);
                    regexter.output(parseDebug(response, data, offsets));
                }
                else if (xhr.status > 400) {
                    regexter.output(UNEXPECTED_ERROR);
                }
            }    
        }
        xhr.send(post);      
    };

    function parseDebug(dStr, data, offsets) {
        var reg = /index[^\n]+?result[^:]+: CHAR|index[^\n]+\n[^:]+: (?:BOL|EOL|BRK|NBRK|BACKREF|SUCCEED)|TIMEOUT/g,
            tokenReg = /CHAR|BOL|EOL|BRK|NBRK|SUCCEED|TIMEOUT|BACKREF/,
            res = dStr.match(reg),
            buffer = [],
            globalIdx = 0,
            offsetIdx = 0,
            line = 0,
            prevIdx, prevToken,
            matchPos;
            
        if (res) {
            for (var i = 0, len = res.length; i < len; i++) {
                var match = res[i],
                    token = tokenReg.exec(match),
                    idx = +/\d+/.exec(match),
                    ch = (/ch="(.)/.exec(match) || ['', ''])[1],
                    currStr = data.slice(globalIdx, idx) + ch;
                
                if (token == TIMEOUT) {
                    buffer.push('<span class="line-number">' + line + '</span>' + TOO_MUCH_BACKTRACK);
                    break;                    
                }
                
                if (!Z_WIDTH_TOKEN[prevToken] && prevToken != SUCCEED && idx <= prevIdx) {
                    buffer[buffer.length - 1] += BACKTRACK;    
                }
                
                if (token == SUCCEED) {
                    matchPos = offsets[offsetIdx];
                    if (matchPos) {
                        buffer[buffer.length - 1] = '<span class="line-number">' + line + '</span>' + regexter.highlightMatch(currStr, matchPos[0] - globalIdx, matchPos[1] - globalIdx) + ' < ' + MATCH_FOUND;                 
                    }
                    else {
                        buffer[buffer.length - 1] = '<span class="line-number">' + line + '</span>' + MATCH_FOUND;
                    }
                    globalIdx = idx;
                    offsetIdx++;                    
                }
                else {
                    line++;                    
                    buffer.push('<span class="line-number">' + line + '</span><span class="processing">' + regexter.escapeHTML(regexter.truncate(currStr)) + '</span>');                    
                }   
                prevToken = token;
                prevIdx = idx;
            }
            if (token != SUCCEED) {
                buffer.push('<span class="line-number">' + (++line) + '</span>' + MATCH_FAIL);    
            }
            return buffer.join('\n') +
                    '\n======================\n' +
                    'Total steps: ' + buffer.length;;
        }
        return dStr;
    }
})();

regexter.addEvent(window, 'load', regexter.init);