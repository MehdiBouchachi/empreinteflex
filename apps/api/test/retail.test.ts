import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { assertPositiveItems,digest,safeMoney } from '../src/platform/utils';
test('idempotency digest stable',()=>assert.equal(digest('request'),digest('request')));
test('duplicated SKU rejected',()=>assert.throws(()=>assertPositiveItems([{variantId:'x',quantity:1},{variantId:'x',quantity:2}])));
test('unsafe amount rejected',()=>assert.throws(()=>safeMoney('9007199254740995')));
test('minor-unit integer accepted',()=>assert.equal(safeMoney('1000000'),1000000));
