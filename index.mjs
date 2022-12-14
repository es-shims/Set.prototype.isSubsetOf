import callBind from 'call-bind';
import RequireObjectCoercible from 'es-abstract/2022/RequireObjectCoercible.js';

import getPolyfill from 'set.prototype.issubsetof/polyfill';

const bound = callBind(getPolyfill());

export default function isSubsetOf(set, other) {
	RequireObjectCoercible(set);
	return bound(set, other);
}

export { default as getPolyfill } from 'set.prototype.issubsetof/polyfill';
export { default as implementation } from 'set.prototype.issubsetof/implementation';
export { default as shim } from 'set.prototype.issubsetof/shim';
