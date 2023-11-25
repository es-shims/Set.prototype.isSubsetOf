'use strict';

var $Set = require('es-set/polyfill')();
var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var hasPropertyDescriptors = require('has-property-descriptors')();

module.exports = function (isSubsetOf, t) {
	t.test('throws on non-set receivers', function (st) {
		forEach(v.primitives.concat(v.objects), function (nonSet) {
			st['throws'](
				function () { isSubsetOf(nonSet, {}); },
				TypeError,
				debug(nonSet) + ' is not a Set'
			);
		});

		st.end();
	});

	t.test('non-Setlike `other`', function (st) {
		var set = new $Set([1, 2]);

		forEach(v.primitives, function (primitive) {
			st['throws'](
				function () { isSubsetOf(set, primitive); },
				TypeError,
				debug(primitive) + ' is not a Set-like'
			);
		});

		st.test('unable to get a Set Record', function (s2t) {
			forEach(v.objects, function (nonSetlike) {
				s2t['throws'](
					function () { isSubsetOf(set, nonSetlike); },
					TypeError,
					debug(nonSetlike) + ' is an Object, but is not Set-like'
				);
			});

			forEach([NaN, 'NaN'], function (nonNumber) {
				var nanSizedSetlike = {
					has: function () {},
					keys: function () {},
					size: nonNumber
				};
				s2t['throws'](
					function () { isSubsetOf(set, nanSizedSetlike); },
					TypeError,
					debug(nanSizedSetlike) + ' has a NaN `.size`'
				);
			});

			forEach(v.nonFunctions, function (nonFunction) {
				var badHas = {
					has: nonFunction,
					keys: function () {},
					size: 0
				};
				var badKeys = {
					has: function () {},
					keys: nonFunction,
					size: 0
				};

				s2t['throws'](
					function () { isSubsetOf(set, badHas); },
					TypeError,
					debug(badHas) + ' has a non-callable `.has`'
				);
				s2t['throws'](
					function () { isSubsetOf(set, badKeys); },
					TypeError,
					debug(badKeys) + ' has a non-callable `.keys`'
				);
			});

			s2t.end();
		});

		st.end();
	});

	t.test('test262: setlike with equal size', function (st) {
		var setLike = {
			arr: [42, 44, 45],
			size: 3,
			keys: function () {
				return this.arr[Symbol.iterator]();
			},
			has: function (key) {
				return this.arr.indexOf(key) !== -1;
			}
		};

		var firstSet = new $Set([42, 43, 45]);

		st.equal(isSubsetOf(firstSet, setLike), false);

		st.end();
	});

	t.test('test262: set method receiver is cleared', { skip: !hasPropertyDescriptors }, function (st) {
		var firstSet = new $Set([42, 43]);

		var otherSet = new $Set([42, 43, 47]);

		Object.defineProperty(otherSet, 'size', {
			get: function () {
				firstSet.clear();
				return 3;
			}
		});

		st.equal(isSubsetOf(firstSet, otherSet), true);

		st.end();
	});

	t.test('test262: set method after table transition in receiver', function (st) {
		var firstSet = new Set([42, 43, 44]);

		var setLike = {
			size: 5,
			keys: function () {
				return [1, 2, 3, 4, 5].keys();
			},
			has: function (key) {
				if (key === 42) {
					// Cause a table transition in the receiver.
					firstSet.clear();
				}
				// Return true so we keep iterating the transitioned receiver.
				return true;
			}
		};

		st.equal(firstSet.isSubsetOf(setLike), true);
		st.equal(firstSet.size, 0);

		st.end();
	});

	t.test('subsets', function (st) {
		var set1 = new $Set([1, 2, 3]);
		var set2 = new $Set([4, 5, 6]);
		var set3 = new $Set([1, 2, 3, 4, 5, 6]);

		st.equal(
			isSubsetOf(set1, set2),
			false,
			debug(set1) + ' is not a subset of ' + debug(set2)
		);
		st.equal(
			isSubsetOf(set2, set1),
			false,
			debug(set2) + ' is not a subset of ' + debug(set1)
		);
		st.equal(
			isSubsetOf(set1, set3),
			true,
			debug(set1) + ' is a subset of ' + debug(set3)
		);
		st.equal(
			isSubsetOf(set2, set3),
			true,
			debug(set2) + ' is a subset of ' + debug(set3)
		);

		st.end();
	});

	return t.comment('tests completed');
};
