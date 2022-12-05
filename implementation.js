'use strict';

var GetIntrinsic = require('get-intrinsic');

var $TypeError = GetIntrinsic('%TypeError%');

var $Set = require('es-set/polyfill')();

var isNativeSet = typeof Set === 'function' && $Set === Set;

var Call = require('es-abstract/2022/Call');
var ToBoolean = require('es-abstract/2022/ToBoolean');

var gOPD = require('es-abstract/helpers/getOwnPropertyDescriptor');

var GetSetRecord = require('./aos/GetSetRecord');

var isSet = require('is-set');

var callBind = isNativeSet || require('call-bind'); // eslint-disable-line global-require
var callBound = isNativeSet && require('call-bind/callBound'); // eslint-disable-line global-require

var $setForEach = isNativeSet ? callBound('Set.prototype.forEach') : callBind($Set.prototype.forEach);
var $setSize = isNativeSet ? callBound('Set.prototype.size') : gOPD ? callBind(gOPD($Set.prototype, 'size').get) : function setSize(set) {
	var count = 0;
	$setForEach(set, function () {
		count += 1;
	});
	return count;
};

module.exports = function isSubsetOf(other) {
	var O = this; // step 1

	// RequireInternalSlot(O, [[SetData]]); // step 2
	if (!isSet(O) && !(O instanceof $Set)) {
		throw new $TypeError('Method Set.prototype.isSubsetOf called on incompatible receiver ' + O);
	}

	var otherRec = GetSetRecord(other); // step 3

	var thisSize = $setSize(O); // step 4

	if (thisSize > otherRec['[[Size]]']) {
		return false; // step 5
	}
	// 6. For each element e of O.[[SetData]], do
	try {
		$setForEach(O, function (e) {
			var inOther = ToBoolean(Call(otherRec['[[Has]]'], otherRec['[[Set]]'], [e])); // step 6.a
			if (!inOther) {
				// eslint-disable-next-line no-throw-literal
				throw false; // step 6.b, kinda
			}
		});
	} catch (e) {
		if (e === false) {
			return false; // step 6.b, the rest
		}
		throw e;
	}
	return true; // step 7
};
