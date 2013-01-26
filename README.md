Regexter v.0.7.1
================
http://regexter.com

Description
-----------

Testing of the regular expression is important, but profiling, optimization and proper understanding are critical. In the modern regex flavours is pretty easy to create regex which turns in infinite. Exactly like infinite loops in high level languages, regular expression could be infinite.
Most important about runaway expressions is that their behaviour depend on the input string. For different input data it could find matches but it could be turn in infinite.  

Regexter helps profiling the JavaScript regexps. It shows the steps needed by the engine to find match or steps needed for successful fail. If you write expression with runaway backtracking you will have "Too much backtracking" output in the debug. You must not use such an expression in the production code. Change the expression to one which successful fail or find matches. 

The other goal of the regexter is the developers to have better understanding of the regular expressions in general and how they work internally. 

Also the comprehensive debug will help regexp exprerts to write more optimized regexps. 

How it works? 
-------------

It is build on the top of [BESEN](http://code.google.com/p/besen/) JavaScript engine. The [BESEN](http://code.google.com/p/besen/) provides comprehensive core dump of the regexp matching. The client JavaScript turns the debug in human readable format.

Credits
-------
* [Benjamin Rosseaux aka Bero](http://www.rosseaux.net/) the [BESEN](http://code.google.com/p/besen/)  author.
* [RegexBuddy](http://www.regexbuddy.com/) - excellent tool by Jan Goyvaerts.
* [Regular-Expressions.info](http://www.regular-expressions.info/) - Regular Expression tutorials by Jan Goyvaerts.
* [Steven Levithan](http://blog.stevenlevithan.com/) - for his excellent posts about regexp performance and how the engine works internally. 

License 
-------
**LGPL v.3**  

Author
------
Asen Bozhilov 