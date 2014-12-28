# 鸭子类型(duck typing)
## what
先来看看维基百科的解释：
鸭子类型（duck typing）是动态类型的一种风格。在这种风格中，一个对象有效的语义，不是由继承自特定的类或实现特定的接口，而是由当前方法和属性的集合决定。
在鸭子类型中，关注的不是对象的类型本身，而是它是如何使用的。

duck typing是为动态类型而生的，尽管很多静态语言或提供，或支持，或模拟duck typing，但那些都不能完完全全发挥duck typing思想的精髓。

在继续讲述duck typing之前，我先提一点duck typing的一个致命的，也是一直以来为人诟病的弱点：**它要求程序员在任何时候都必须很好地理解他/她正在编写的代码（引自维基百科）**，简单地说，duck typing代码维护性较差，因此它不适合大型程序，而对于前端页面来说，大部分的页面都不复杂（除了SPA），因此个人觉得duck typing的思想非常适合在javascript中应用，而实际上，前端代码中几乎处处可见duck typing的影子，但是duck typing真正的威力还没有完全发挥，这也是我为什么为javascript写这篇文章的原因。

## why
代码变多了，变复杂了怎么办？答案是模块化，它解决的一个核心问题就是**复用**。面向对象程序设计思想很大程度也是在解决这个问题。

duck typing的核心也是复用，它比oop更加灵活，因为他没有oop那么多禁锢，但是它牺牲地是代码可维护性，实际上，如果duck typing的思想和oop一样传播广泛，代码可读性会相对提高；另一方面，对于小程序而言，代码可维护性的问题相对并不那么重要。

如果适当地把duck typing思想应用到代码中，那么写出来的代码将会非常容易扩展，也很容易被复用。

## 抛弃类型，留下对象
duck typing思想的核心是对象，在duck typing的世界里不存在类型，对象想怎么用就怎么用。先看一下在js中，应用到duck typing思想最多的例子：
```javascript
function foo() {
    var args = Array.prototype.slice.call(arguments);
    //...
}
```
arguments不是Array类型，因此它没有slice方法，但是arguments对象满足了slice方法的一些条件：
1. 有一个length属性，它的值是数值
2. 通过0 ~ length索引这个对象都有值

因此，arguments可以应用于slice方法，于是我们也可以这样用：
```javascript
console.log(Array.prototype.slice.call({
	0: 'a',
	1: 'b',
	2: 'c',
	length: 3
}));    //['a', 'b', 'c']
```
> 如果应用的对象不完全满足这些条件，或者对象满足这些条件会产生副作用，那么最终的结果将会很怪异，而这肯定不是开发者所希望的。

再看一个例子：
```javascript
//解释什么是duck typing的程序例子
function checkDuck(d) {
	if (d.who() === "duck" && d.quack() === "gagaga...") {
		return "yes, you are a duck.";
	} else {
		return "sorry, you are not a duck that I want.";
	}
}

function Duck() {
	this.name = 'duck';
}
Duck.prototype = {
	constructor: Duck,
	quack: function() {
		return "gagaga...";
	},
	who: function() {
		return this.name;
	}
}
var d1 = new Duck();
console.log(checkDuck(d1);

var d2 = {
	name: 'duck',
	quack: function() {
		return "gagaga...";
	},
	who: function() {
		return this.name;
	}
}
console.log(checkDuck(d2));
```

## 复用，想怎么用就怎么用
duck typing的核心方法是extend，通过这个方法可以非常方便地随心所欲地扩展/复制对象，正好jquery.extend满足这个目的，但是它默认是shallow clone，而我们需要deep clone，因此我们先把jquery.extend做一下替换，方便后面的例子使用：
```javascript
$.extend = (function(_f) {
	return function() {
		var _slice = Array.prototype.slice,
			_a = typeof arguments[0] === "boolean"
				? _slice.call(arguments)
				: [true].concat(_slice.call(arguments, 0));
		return _f.apply($, _a);
	}
})($.extend);
```
接着前面的例子，看下复用的例子：
```javascript
var c = {
    name: 'chicken',
    sayHello: function() {
        console.log('Hello, my name is', this.name);
        return this;
    }
};

var c1 = $.extend({}, c, d2);    //chicken wants to be a duck, new c and reuse d2
console.log(checkDuck(c1));  //yes, you are a duck.

var cd = $.extend({
    sayBye: function() { console.log('bye'); return this; }
}, c, d2);   //reuse c and d2
var dc = $.extend({
    sayBye: function() { console.log('bye'); return this; }
}, d2, c);   //reuse c and d2
console.log(checkDuck(cd));  //yes, you are a duck.
console.log(checkDuck(dc));  //sorry, you are not a duck that I want.
```
如果把例子中一次extend看成oop中的一次继承，都是reuse了功能，但是对象extend的方式明显比oop的继承声明来的简单方便，而且灵活。
最后的两个例子展示了多继承也是一件轻松解决的事，但是多继承遇到的重复基类的问题也是会发生的，可以看到，extend方式用后面覆盖前面的方式来决定重复基类的归属。

总而言之，在duck typing思想里，复用就是这么简单的事情，想怎么用就怎么用！

## 最最最核心关键——this
duck typing思想的核心是对象的思想，而使得duck对象可以流通，复用，扩展的关键是this，要想让某个方法可以作用到duck对象，它的处理必须是围绕着this来进行的。
> 有一个例外，就是方法可以围绕第一个参数来进行，了解c++ method是怎么实现的就知道了，在js称为科里化this(curry this)
> 另：反科里化this(reverse curry this)的概念其实就是duck typing

```javascript
function check(o) {
    o.sayHello();
}

var name = 'Jack';
var a = {
    sayHello: function() { console.log('Hello,', name); }
}; 
check($.extend({name: 'Peter'}, a));    //Hello, Jack

var b = {
    sayHello: function() { console.log('Hello,', this.name); }
}; 
check($.extend({name: 'Peter'}, b));    //Hello, Pter

//the example of curry this
Function.prototype.curryThis = function () {
	var f = this;
	return function () {
		var a = Array.prototype.slice.call(arguments);
		a.unshift(this);
		return f.apply(null, a);
	};
};

function sayHello(self) {
    console.log('Hello,', self.name);
    return self;
}

var c = {
    name: 'Jack',
    sayHello: sayHello.curryThis()
}, d = {
    name: 'Peter',
    sayHello: sayHello.curryThis()
}
check(c);  //Hello, Jack
check(d);  //Hello, Peter
```

## 综合与总结
在模块化开发的今天，怎么利用duck typing？下面来看一个综合性例子：
```javascript
//counter.js
var counter = (function() {
	var defaultOpt = { i: 1 };
	return {
		init: function(opts) {
			this.opts = $.extend({}, defaultOpt, opts);
			this.i = this.opts.i;
			return this;	//it has better to return this
		},
		add: function() {
			this.i++;
			return this;
		}
	}.init();	//init with the default datas, then it can be used immediately
})();

//a.js and b.js use the counter as a global/single object
//a.js
console.log(counter.add().i);	//2
//b.js
console.log(counter.add().i);	//3

//but c.js need another counter started from 5, then it can also use the counter
//c.js
console.log($.extend({}, counter).init({i: 5}).add().i);	//6
//it will not affect a.js and b.js
//a.js
console.log(counter.add().i);	//4

//d.js is allocated at the run time
//it need another counter started from the global counter's data 
//and with different behavior in the meantime
//d.js
var step2Counter = $.extend({}, counter, {
	add: function() {
		this.i += 2;
		return this;
	}
});
console.log(step2Counter.add().i);	//6
//it will not affect a.js and b.js too
//a.js
console.log(counter.add().i);	//5

//another counter module
//anotherCounter.js
var anotherCounter = (function() {
	return {
		init: function() { /*...*/ },
		add: function(step) {
			this.i += step
			return this;
		}
	};
})();
//d.js wants to reuse it
//d.js
//this is the example of reserve curry this
console.log(anotherCounter.add.call(step2Counter, 3).i);	//9
```
从上面的综合例子可以看到在duck typing的思想下，counter的使用变得非常灵活：
1. counter作为模块，被当作一个global对象（甚至是single对象，只要使用者遵守约定）使用
2. 当需要一个新的counter时，可以很轻松地'new'一个出来，初始化并使用
3. 扩展counter变得异常简单，甚至可以仅仅复用counter里的某个方法

> 顺便介绍一下duck typing的检测方式
```javascript
$.isLike = function(o, c) {
	return $.isFunction(c.isLike) && c.isLike(o);
};
//the counter is reject the type chkecking
console.log($.isLike(step2Counter, counter));	//false
//now add it
counter.isLike = function(o) {
	return typeof o.i === 'number' && $.isFunction(o.add);
};
console.log($.isLike(step2Counter, counter));	//true
```
实际上，这种检测并不可靠，因此一般不用，这里只做介绍

应用duck typing的关键小结：
1. 不要受类型概念的禁锢，万物皆对象，在javascript中本来就是万物皆对象的
2. 尽可能把变量和方法成为对象的属性
3. 处理围绕this进行

## duck typing 类型系统
最开始就提到过，duck typing的致命弱点是代码可读性，确实，oop先入为主，深入人心，导致在动态语言javascript中出现了许多oop类型系统，使用对象模拟类型，进而模拟继承。js也提供了类似概念的构造函数模式，并通过new语法来支持。
oop是非常优秀的思想，借助它的另外一个最大的好处就是代码可读性，当你看到var o = new Obj()时，就立刻会想到这是生成一个对象，不用任何注释。类型系统亦是如此。

那么，duck typing能不能学习一下呢？如何增强duck typing的代码可读性？个人得出的答案就是借助oop思想，基于duck typing思想构建oop类型系统，经过研究发现，这也并不复杂。最终得出的类型系统基础代码量也很少。

下面给出推演的过程：
```javascript
//the base
var module1 = (function () {
	//static variable, or class variable
	var index = 0;	//declaration and initialization

	//private variable
	var youCanNotChangeMe = 'hahaha...';

	return {
		my_index: 0,	//object property, and you can set the default value
		init: function(opts) {	//constructor, just the agreement as like the all modules and component for our projects
			this.opts = $.extend({}, opts);
			this.my_index = this.opts.index||1;	//can just init the object variable
			return this;
		},
		addMyIndex: function(step) {	//object method
			this.my_index += step || 1;
			return this;
		},
		//static method, or class method
		addIndex: function(step) {
			index += step || 1;
			return this;
		},
		getIndex: function() {
			return index;
		}
	};
})();

var m1 = $.extend({}, module1).init(),
	m2 = $.extend({}, module1).init();
m1.addMyIndex();
m1.addIndex();
m2.addMyIndex(2);
m2.addIndex();

console.log(m1.my_index);		//2
console.log(m1.getIndex());		//2
console.log(m2.my_index);		//3
console.log(m2.getIndex());		//2

//inherit
var Person = (function() {
	return {
		name: '',
		init: function(opts) {	//mark1
			this.opts = $.extend({}, opts);
			this.name = this.opts.name;
			return this;
		},
		sayHello: function() {
			console.log("Hello, I'm", this.name + ".");
			return this;
		}
	};
})();

var Student = (function() {		//inherited from Person
	return $.extend({}, Person, {	//mark2
		sayHello: function() {
			console.log("Hello, I'm", this.name + ", I'm a student.");
			return this;
		},
		doingWhat: function() {
			console.log("I'm learning");
			return this;
		}
	});
})();

var Programer = (function() {	//inherited from Person
	return $.extend({}, Person, {
		sayHello: function() {
			Person.sayHello.apply(this, arguments);		//call the ancestor's method
			console.log("I'm a programer.");
			return this;
		}
	});
})();

var WorkingStudent = (function() {
	return $.extend({}, Student, Programer);	//multiple inheritance
})();

//instantiation
var s = $.extend({}, Student).init({name: 'Jack'}).sayHello(),		//mark3
	p = $.extend({}, Programer).init({name: 'lqlongli'}).sayHello(),
	w = $.extend({}, WorkingStudent).init({name: 'Peter'}).sayHello().doingWhat();

```
类似众多系统，init是初始化方法，也是构造函数。可以看到上面的继承和new方式都非常奇怪，接下来对这些地方进行封装
```javascript
//new
$.newObject = function(_class, opts) {	//add the __PERANT__
	var o = $.extend(false, $.extend({init:function(){return this;}}, _class), {__PERANT__: [_class]});
	o = o.init(opts) || o;
	return o;
};

//inherit
$.inherit = function(_child) {	//add the __PARENT__ 
	var _p = [], a;
	for(var i = 1, len = arguments.length; i < len; ++i) {
		_p.push(arguments[i]);
	}

	a = [{}].concat(_p);
	a.push(_child);
	return $.extend(false, $.extend.apply($, a), {__PERANT__: _p});
};

Student = (function() {		//inherited from Person
	return $.inherit({
		sayHello: function() {
			console.log("Hello, I'm", this.name + ", I'm a student.");
			return this;
		},
		doingWhat: function() {
			console.log("I'm learning");
			return this;
		}
	}, Person);
})();

Programer = (function() {	//inherited from Person
	return $.inherit({		//Person.extend({...});
		sayHello: function() {
			Person.sayHello.apply(this, arguments);		//call the ancestor's method
			console.log("I'm a programer.");
			return this;
		}
	}, Person);
})();

WorkingStudent = (function() {
	return $.inherit({}, Student, Programer);	//multiple inheritance
})();

//instantiation
var s2 = $.newObject(Student, {name: 'Jack'}).sayHello(),	//new Student({name: 'Jack'}).sayHello()
	p2 = $.newObject(Programer, {name: 'lqlongli'}).sayHello(),
	w2 = $.newObject(WorkingStudent, {name: 'Peter'}).sayHello().doingWhat();

//check method	
$.isInstanceOf = function(_o, _c) {	//use BFS to search the _c
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

console.log($.isInstanceOf(w2, WorkingStudent));	//true
console.log($.isInstanceOf(w2, Student));			//true
console.log($.isInstanceOf(w2, Person));			//true
```
可以看到，让duck typing构造的代码有oop风格只需要3个核心函数：newObject，inherit，isInstanceOf（这个可有可无，附加的代码也可以不要，这样代码会更加精简）

> 基于duck typing的类型系统比基于原型链的类型系统调用方法更快，占用的内存也可能更少

模块作为全局对象，可以看作是一个单例，但是它并没有限制复制，所以在动态语言中还真没有真正意义上的单例。
如果按照duck typing的思想构建模块，则让模块可以生成多个实例的能力不需要用到类型系统。

duck typing的核心就是让对象到处可用，到处可复用，到处可扩展，但是当我们需要单例的时候怎么办？下面给出一个单例模式的例子供参考：
```javascript
//single pattern
var Single = (function() {
	var isInit = false;
	var obj = {
		index: 0,
		init: function(opts) {
			if (isInit) return obj;
			this.opts = $.extend({}, opts);
			this.index = this.opts.index;
			isInit = true;
			return obj = this;
		},
		getInstance: function(opts) {	//er, I know you like this way and you can do it, but it doesn't match the duck idea
			return this.init(opts);
		},
		addIndex: function(step) {
			this.index += step || 1;
			return this;
		},
		getIndex: function() {
			return this.index;
		} 
	};
	return obj;
	//if the initialization is not open, you can:
	//return obj.init({});
})();

var single1 = $.newObject(Single, {index: 1}).addIndex(),
	single2 = $.newObject(Single, {index: 3}).addIndex();

console.log(single1.getIndex());	//3
console.log(single2.getIndex());	//3, not 4
console.log(Single.getInstance().getIndex());	//3
console.log(single1 === single2);	//true
```
