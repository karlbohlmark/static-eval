var test = require('tape');
var evaluate = require('../');
var parse = require('esprima').parse;

function ScopeChain (objs) {
    this.scopes = objs
}

ScopeChain.prototype.lookup = function (name) {
    for(var i =0; i<this.scopes.length; i++) {
	if (name in this.scopes[i]) {
	    return this.scopes[i][name];
	}
    }
}

ScopeChain.prototype.has = function (name) {
    for(var i =0; i<this.scopes.length; i++) {
	if (name in this.scopes[i]) {
	    return true;
	}
    }
    return false;
}

ScopeChain.prototype.host = function (name) {
    for(var i =0; i<this.scopes.length; i++) {
	if (name in this.scopes[i]) {
	    return this.scopes[i];
	}
    }
}

test('resolved', function (t) {
    t.plan(1);
    
    var src = '[1,2,3+4*10+n,foo(3+5),obj[""+"x"].y]';
    var ast = parse(src).body[0].expression;
    var res = evaluate(ast, new ScopeChain([{
        n: 6,
        foo: function (x) { return x * 100 },
        obj: { x: { y: 555 } }
    }]));
    t.deepEqual(res, [ 1, 2, 49, 800, 555 ]);
});

test('unresolved', function (t) {
    t.plan(1);
    
    var src = '[1,2,3+4*10*z+n,foo(3+5),obj[""+"x"].y]';
    var ast = parse(src).body[0].expression;
    var res = evaluate(ast, new ScopeChain([{
        n: 6,
        foo: function (x) { return x * 100 },
        obj: { x: { y: 555 } }
    }]));
    t.equal(res, undefined);
});

test('boolean', function (t) {
    t.plan(1);
    
    var src = '[ 1===2+3-16/4, [2]==2, [2]!==2, [2]!==[2] ]';
    var ast = parse(src).body[0].expression;
    t.deepEqual(evaluate(ast), [ true, true, true, true ]);
});
