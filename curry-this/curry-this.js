//extend Function
Function.prototype.uncurryThis = function () {	
	var f = this;
	return function () {
		return f.call.apply(f, arguments)
	};
};

Function.prototype.curryThis = function () {
	var f = this;
	return function () {
		var a = Array.prototype.slice.call(arguments);
		a.unshift(this);
		return f.apply(null, a);
	};
};

//global function
function uncurryThis(f) {
	return function () {
		return f.call.apply(f, arguments)
	};
}

function curryThis(f) {
	return function () {
		var a = Array.prototype.slice.call(arguments);
		a.unshift(this);
		return f.apply(null, a);
	};
}
