<?php
    define('MAX_BYTECODE_STEPS', max(pow(strlen($_POST['data']), 2) * 2, 100));
    define('JS_CODE', "setRegExpTimeOutSteps(" . MAX_BYTECODE_STEPS . "); setRegExpDebugMode(1); ('%s').match(%s);");
    define('REG_LITERAL', '/^\/(?:\[(?:\x5C.|[^\x5C\]])*\]|\x5C.|[^\x5C\[\/])+\/[gim]*$/');
    define('BESEN', './bin/besen');
    
    if (preg_match(REG_LITERAL, $_POST['reg'])) {
        $reg = $_POST['reg'];
        $str = preg_replace('/[\n\r]/', "'+'\\x0A", addslashes($_POST['data']));
        $js = escapeshellarg(sprintf(JS_CODE, $str, $reg));
        exec("echo $js | " . BESEN, $arr);
        echo implode("\n", $arr);    
    }
    else {
        echo 'Invalid RegExp';
    }
?>
