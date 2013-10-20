module.exports = function (ast, scopeChain) {
    if (!scopeChain) scopeChain = {
        has: function () { return false; },
        lookup: function () { return void(0); }
    };
    var FAIL = {};
    
    var result = (function walk (node) {
        if (node.type === 'Literal') {
            return node.value;
        }
        else if (node.type === 'ArrayExpression') {
            var xs = [];
            for (var i = 0, l = node.elements.length; i < l; i++) {
                var x = walk(node.elements[i]);
                if (x === FAIL) return FAIL;
                xs.push(x);
            }
            return xs;
        }
        else if (node.type === 'ObjectExpression') {
            var obj = {};
            for (var i = 0; i < node.properties.length; i++) {
                var prop = node.properties[i];
                var value = prop.value === null
                    ? prop.value
                    : walk(prop.value)
                ;
                if (value === FAIL) return FAIL;
                obj[prop.key.value] = value;
            }
            return obj;
        }
        else if (node.type === 'BinaryExpression') {
            var l = walk(node.left);
            if (l === FAIL) return FAIL;
            var r = walk(node.right);
            if (r === FAIL) return FAIL;
            
            var op = node.operator;
            if (op === '+') return l + r;
            if (op === '-') return l - r;
            if (op === '*') return l * r;
            if (op === '/') return l / r;
            if (op === '%') return l % r;
            if (op === '<') return l < r;
            if (op === '<=') return l <= r;
            if (op === '>') return l > r;
            if (op === '>=') return l >= r;
            if (op === '|') return l | r;
            if (op === '&') return l & r;
            if (op === '^') return l ^ r;
            if (op === '&&') return l && r;
            if (op === '||') return l || r;
            
            return FAIL;
        }
        else if (node.type === 'Identifier') {
            if (scopeChain.has(node.name)) {
                return scopeChain.lookup(node.name)
            }

            else return FAIL;
        }
        else if (node.type === 'CallExpression') {
            var ctx = null
            var callee = walk(node.callee)
            if (node.callee.type == 'MemberExpression') {
                ctx = walk(node.callee.object)
            }
            if (callee) {
                var args = [];
                for (var i = 0, l = node.arguments.length; i < l; i++) {
                    var x = walk(node.arguments[i]);
                    if (x === FAIL) return FAIL;
                    args.push(x);
                }
                return callee.apply(ctx, args);
            }
            else return FAIL;
        }
        else if (node.type === 'MemberExpression') {
            var obj = walk(node.object);
            if (obj === FAIL) return FAIL;
            if (!obj) return obj;
            if (node.property.type === 'Identifier') {
                return obj[node.property.name];
            }
            var prop = walk(node.property);
            if (prop === FAIL) return FAIL;
            return obj[prop];
        }
        else return FAIL;
    })(ast);
    
    return result === FAIL ? undefined : result;
};
