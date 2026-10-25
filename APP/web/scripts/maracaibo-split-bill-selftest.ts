import assert from "node:assert/strict";
import { allocateEqualShares, exampleRemainingCents, initialSplitDemo, SAMPLE_BILL, splitDemoReducer } from "../src/table-os/maracaibo/split-bill-demo";
import { resolveTablePayment, verifiedToastUrl } from "../src/table-os/table-payment";
import { getVenue, type TableOsVenue } from "../src/table-os/venue-config";

for (const total of [0, 1, 2, 3, 99, 100, 101, 8643, 999999, Number.MAX_SAFE_INTEGER]) {
  for (let guests = 1; guests <= 12; guests++) {
    const shares = allocateEqualShares(total, guests);
    assert.equal(shares.reduce((a, b) => a + b, 0), total);
    assert.equal(shares.length, guests);
    assert.ok(shares.every(Number.isSafeInteger));
    assert.ok(Math.max(...shares) - Math.min(...shares) <= 1);
    assert.deepEqual(shares, [...shares].sort((a,b) => b-a));
  }
}
assert.deepEqual(allocateEqualShares(8643, 4), [2161, 2161, 2161, 2160]);
for (const invalid of [-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => allocateEqualShares(invalid, 4), RangeError);
for (const invalid of [-1, 0, 1.5, 13, NaN, Infinity]) assert.throws(() => allocateEqualShares(100, invalid), RangeError);
assert.equal(SAMPLE_BILL.items.reduce<number>((sum,item) => sum+item.cents, SAMPLE_BILL.taxCents), SAMPLE_BILL.totalCents);
let state = splitDemoReducer(initialSplitDemo, {type:"select",selected:3});
state = splitDemoReducer(state, {type:"preview"});
assert.equal(exampleRemainingCents(state),6483);
assert.strictEqual(splitDemoReducer(state,{type:"preview"}),state, "Repeat preview cannot deduct another share");
for (const selected of [-1,4,1.5,NaN]) assert.strictEqual(splitDemoReducer(state,{type:"select",selected}),state);
for (const guests of [0,13,1.5,NaN]) assert.strictEqual(splitDemoReducer(state,{type:"guests",guests}),state);
assert.deepEqual(splitDemoReducer(state,{type:"guests",guests:2}),{guests:2,selected:0,previewed:false});
assert.deepEqual(splitDemoReducer(state,{type:"select",selected:1}),{guests:4,selected:1,previewed:false});
assert.strictEqual(splitDemoReducer(state,{type:"reset"}),initialSplitDemo);
assert.equal(exampleRemainingCents(initialSplitDemo),8643);
assert.equal(exampleRemainingCents(splitDemoReducer({guests:1,selected:0,previewed:false},{type:"preview"})),0);
assert.equal(exampleRemainingCents(splitDemoReducer(state,{type:"reset"})),8643);

const maracaibo = getVenue("maracaibo")!;
const testUrl = "https://www.toasttab.com/owner-verified-test-fixture?table=test-only";
const configured: TableOsVenue = {...maracaibo,reviewStatus:"APPROVED", ordering:{...maracaibo.ordering,tablePayment:{status:"OWNER_VERIFIED",tableUrls:{"1":testUrl}}}};
assert.equal(resolveTablePayment(maracaibo,"1"),null);
assert.equal(resolveTablePayment({...configured,reviewStatus:"OWNER_REVIEW_REQUIRED"},"1"),null);
assert.equal(resolveTablePayment({...configured,ordering:{...configured.ordering,tablePayment:{status:"OWNER_SETUP_REQUIRED",tableUrls:{"1":testUrl}}}},"1"),null);
assert.equal(resolveTablePayment({...configured,ordering:{...configured.ordering,tablePayment:undefined}},"1"),null);
assert.equal(resolveTablePayment({...configured,id:"other-client"},"1"),null);
assert.equal(resolveTablePayment(configured,"2"),null);
assert.equal(resolveTablePayment(configured,"toString"),null);
assert.equal(resolveTablePayment(configured,"1"),testUrl);
assert.equal(verifiedToastUrl(testUrl),testUrl);
for (const url of [null, undefined, 123, "", "javascript:alert(1)", "http://www.toasttab.com/table", "//www.toasttab.com/table", "https://toasttab.com.evil.test/table", "https://evil.test/table", "https://evil.toasttab.com/table", "https://www.toasttab.com./table", "https://user:pass@www.toasttab.com/table", "https://www.toasttab.com:8080/table", "https://www.toasttab.com/", "https://www.toasttab.com/local/order/maracaibo-bistro", "https://www.toasttab.com//evil.test", "https://www.toasttab.com/table#redirect", "https://www.toasttab.com/table?redirect=https://evil.test", "https://www.toasttab.com/table?URL=https://evil.test", "https://www.toasttab.com/table?return_url=https://evil.test", "https://www.toasttab.com/table%0a", "https://www.toasttab.com\\@evil.test/table", " https://www.toasttab.com/table"]) {
  assert.equal(verifiedToastUrl(url),null,`Reject unsafe/unreviewable URL: ${url}`);
  assert.equal(resolveTablePayment({...configured,ordering:{...configured.ordering,tablePayment:{status:"OWNER_VERIFIED",tableUrls:{"1":url as string}}}},"1"),null);
}
console.log("PASS: 120 cents allocation cases; invalid inputs, selected-share/reset/repeat preview and disabled/exact-table/HTTPS host gates.");
