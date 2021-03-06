<?php
    define('MAX_BYTECODE_STEPS', max(pow(strlen($_POST['data']), 2) * 2, 100));
    define('JS_CODE', preg_replace('/[\r\n]/' , '', "
        setRegExpTimeOutSteps(" . MAX_BYTECODE_STEPS . "); 
        setRegExpDebugMode(1); 
        var offset = [];
        var str = ('%s').replace(%s, function(match) {
            var start = arguments[arguments.length - 2];
            offset.push([start, start + match.length]);
            return '';
        });
        print('OFFSETS:' + JSON.stringify(offset));
    "));
    define('REG_LITERAL', '/^\/(?:\[(?:\x5C.|[^\x5C\]])*\]|\x5C.|[^\x5C\[\/])+\/[gim]*$/');
    define('BESEN', './bin/besen');
    
    $patterns = array(
        'bslash'    => '/\\\\/',     
        'linefeeds' => '/[\n\r]/',       
        'dquote'    => '/"/',
        'squote'    => '/\'/'    
    );
    $replace = array (
        'bslash'    => '\\x5C',
        'linefeeds' => '\\x0A',                
        'dquote'    => '\\x22',
        'squote'    => '\\x27',
    );
    
    if (preg_match(REG_LITERAL, $_POST['reg'])) {
        $reg = addslashes($_POST['reg']);
        $str = preg_replace($patterns, $replace, $_POST['data']);
        $js = escapeshellarg(sprintf(JS_CODE, $str, $reg));
        exec("echo $js | " . BESEN, $arr);
        echo implode("\n", $arr);    
    }
    else {
        echo 'Invalid RegExp';
    }
?>
