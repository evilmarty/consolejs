console.js
==========
A javascript console for where you need one.

Usage
-----
To create a new console just pass in the element to be the container, or the id of the element.
```javascript
var console = new Console('elementId');
```
You can _optionally_ pass in the scope of the console as the second argument. Defaults to *window*.
```javascript
var scope = {}; // scope of the console
var console = new Console('elementId', scope);
```
If a console has already been instantiated for an element and you want to get a reference to it, you can just call ```Console``` with the element to return a reference. The second argument changes the scope for the console. *Note* if the element does not contain a console a new console will be instantiated.</p>
```javascript
new Console('elementId');
var console = Console('elementId');```

Commands
--------
#### log(object_, ..._)
> Display the object/s in the console.
#### info(object_, ..._)
> Same as *log* but logs it under _info_.
#### warn(object_, ..._)
> Same as *log* but logs it under _warn_.
#### error(object_, ..._)
> Same as *log* but logs it under _error_.
### clear()
Clears the output of the console.

Download / Fork
---------------
Visit the [GitHub repository](http://github.com/evilmarty/consolejs) to download the latest version. You are welcome to also fork the repo and do with as you wish. If you fix an issue please send a pull request and share the love <3

Installation
------------
*console.js* has no dependencies, so simply include the javascript file in your html:
```html
<script type="text/javascript" src="console.js"></script>
```
And don't forget to include the stylesheet unless you want to provide your own?
```html
<link rel="stylesheet" href="console.css" type="text/css" charset="utf-8">
```

A word if I may...
------------------
The day I decided to make *console.js* I discovered, by coincidence, Joss Crowcroft's [js sandbox console](http://josscrowcroft.github.com/javascript-sandbox-console). What I didn't like about it and why I continued with my own was that the dependencies were just too big for something so small. I wanted something independent and self-contained. No beef with Joss' console, he did a great job and, I think, is a great example of using [Backbone](http://documentcloud.github.com/backbone) for those who are learning. I would like to thank Webkit, for which I borrowed the look and feel to use in my rendition.

TODO
----
* More testing (especially IE *shudder*)
* Improve object inspection
* Profit???

Copyright (C) 2011 by Marty Zalega. MIT License