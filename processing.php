<?php
    define('JS_CODE', "setRegExpDebugMode(1); '%s'.match(%s);");
    define('REG_LITERAL', '/^\/(?:\[(?:\x5C.|[^\x5C\]])*\]|\x5C.|[^\x5C\[\/])+\/[gim]*$/');
    define('BESEN', './bin/besen');
    
    if (preg_match(REG_LITERAL, $_POST['reg'])) {
        $reg = addslashes(
               addslashes(
                    $_POST['reg']
               ));
        $str = addslashes(
               addslashes(
                    str_replace(array("\r\n","\r", "\n"), '\n', $_POST['data'])
               ));
        $js = sprintf(JS_CODE, $str, $reg);
        exec("echo \"$js\" | " . BESEN, $arr);
        echo implode("\n", $arr);    
    }
    else {
        echo 'Invalid input';
    }
?>
