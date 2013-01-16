var regexter = {};
(function () {
    var DEBUG_HOLDER = 'debug-holder',
         MAX_CHARS_LINE = 100,
         SUCCEED = 'SUCCEED',
         TIMEOUT = 'TIMEOUT',
         
         MATCH_FOUND = '<span class="match">Match found</span>',
         MATCH_FAIL = '<span class="fail">Match failed</span>',
         BACKTRACK = '<span class="fail">backtrack</span>',
         TOO_MUCH_BACKTRACK = '<span class="fail">Too much backtracking</span>',
         UNEXPECTED_ERROR = '<span class="fail">Unexpected error</span>';
    
    var HTML_ESCAPE_CHARS = {
        '<' : '&lt;',
        '>' : '&gt;',
        '&' : '&amp;',
        "'" : '&quot;',
        '"' : '&#039;'
    };
    
    var timer;
    regexter.send = function (params) {
        function processing() {
            var regexp = document.getElementById('regex-field'),
                data = document.getElementById('regex-data'),
                err = document.getElementById('regex-error'),
                g = document.getElementById('global-search'),
                i = document.getElementById('case-insensitive'),
                m = document.getElementById('multiline-search'),
                flags = '' + (g.checked ? 'g' : '') +  (i.checked ? 'i' : '') + (m.checked ? 'm' : ''),
                regstr = '/' + regexp.value + '/' + flags;
                           
            try {
                new RegExp('\/' + regexp.value + '\/' + flags);
                err.innerHTML = '';
            } catch (e) {
                err.innerHTML = e;
                regexter.flush();
                return;
            }
            
            if (regexp.value.length && data.value.length) {
                regexter.getDebug(regstr, data.value);            
            }
            else {
                regexter.flush();
            }     
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
        var debugHolder = document.getElementById(DEBUG_HOLDER);
        debugHolder.innerHTML = '<pre>Not available</pre>';
    };
    
    regexter.output = function(debug) {
        var debugHolder = document.getElementById(DEBUG_HOLDER);
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
        return str.replace(/[\n\r]/g, '');
    };
    
         
    regexter.getDebug = function (reg, data) {
        var xhr = typeof XMLHttpRequest != 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP'),
            post = 'reg=' + encodeURIComponent(reg) + '&data=' + encodeURIComponent(data);
        
        xhr.open('POST', 'processing.php', true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    regexter.output(parseDebug(xhr.responseText, data));
                }
                else if (xhr.status > 400) {
                    regexter.output(UNEXPECTED_ERROR);
                }
            }    
        }
        xhr.send(post);      
    };
    
    function parseMatch(data) {
    
    }

    function parseDebug(dStr, data) {
        var reg = /index=[^\n]+?result=[^\n]+|index=[^\n]+[^:]+: (?:BRK|NBRK|SUCCEED)|TIMEOUT/g,
             rows = dStr.match(reg),           
             buffer = [],
             globalStart = 0,
             cStr = '',
             prevIdx, succeed;
        if (rows) {      
            for (var i = 0, line = 1, len = rows.length; i < len; i++, line++) {
                var match = rows[i];
                    idx = +(/\d+/.exec(match) || [])[0],
                    ch = (/ch="(.)/.exec(match) || ['', ''])[1];
                
                if (match == TIMEOUT) {
                    buffer.push('<span class="line-number">' + line + '</span>' + TOO_MUCH_BACKTRACK);
                    break;
                }                
                                    
                if (!succeed && idx <= prevIdx) {
                    buffer[buffer.length - 1] += BACKTRACK;
                    cStr = data.slice(globalStart, idx);
                }
                
                cStr += ch;
                succeed = match.slice(-7) == SUCCEED;                
                if (succeed) {                    
                    buffer.push('<span class="line-number">' + line + '</span>' + MATCH_FOUND);
                    globalStart = idx;
                    cStr = '';
                }
                else {
                    prevIdx = idx;
                    buffer.push('<span class="line-number">' + line + '</span><span class="processing">' + regexter.escapeHTML(regexter.truncate(cStr)) + '</span>');
                }                
            }
            if (!succeed) buffer.push('<span class="line-number">' + line + '</span>' + MATCH_FAIL);
 
            return buffer.join('\n') +
                    '\n======================\n' +
                    'Total steps: ' + buffer.length;           
        }
        
        return dStr;
    }
})();
