/*
 * duck typing
 * 2014/12/23 by long
 *
 * the duck typing system based on jquery
 * using the duck idea to setup a typing system
 * the typing system has two base function: inherit and new
 *
 * you can find examples in the test/test.html
 *
 */

$.DTExtend = function() {
	return $.extend.apply($, [true].concat(Array.prototype.slice.call(arguments, 0)));
};

$.DTInherit = function(_child) {
	var _p = [], a;
	for(var i = 1, len = arguments.length; i < len; ++i) {
		_p.push(arguments[i]);
	}

	a = [{}].concat(_p);
	a.push(_child);
	return $.extend(false, $.DTExtend.apply($, a), {__PERANT__: _p});
};

$.DTNewObject = function(_class, opts) {
	var o = $.extend(false, $.DTExtend({init:function(){return this;}}, _class), {__PERANT__: [_class]});
	o = o.init(opts) || o;
	return o;
};

$.DTIsInstanceOf = function(_o, _c) {	//use BFS to search the _c
	var arr = [_o], t;
	while(t = arr.pop()) {
		if (!t.__PERANT__) continue;
		for (var i = t.__PERANT__.length - 1; i >= 0; --i) {
			if (_c === t.__PERANT__[i]) {
				return true;
			}
			arr.push(t.__PERANT__[i]);
		}
	}
	return false;
};

$.DTIsLike = function(o, c) {
	return $.isFunction(c.isLike) && c.isLike(o)
};
