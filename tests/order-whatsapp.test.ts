import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseWhatsAppGroups, fetchWhatsAppGroups } from '../lib/openwa-groups';
import { orderWhatsAppMessage } from '../lib/order-message';
import type { OrderDTO } from '../types/order';

test('group picker excludes individual chats and deduplicates valid groups', () => {
  assert.deepEqual(parseWhatsAppGroups([{id: '123@g.us', name: 'Office'}, {id: {_serialized: '123@g.us'}, name: 'Office'}, {id: '966501234567@c.us', name: 'Private'}, {id: 'https://example.com', name: 'Invalid'}]), [{id: '123@g.us', name: 'Office'}]);
  assert.throws(() => parseWhatsAppGroups(false));
});
test('order messages include full request and use selected language', () => {
  const order: OrderDTO = {_id: 'test', customerName: 'Ali', customerPhone: '+966501234567', requestedCategory: 'land', requestedListingType: 'sale', notes: '600 m² in Riyadh', status: 'pending', createdAt: '', updatedAt: ''};
  const en = orderWhatsAppMessage(order, 'en'), ar = orderWhatsAppMessage(order, 'ar');
  assert.match(en, /Property request/); assert.match(ar, /طلب عقار/);
  for (const message of [en, ar]) { assert.match(message, /Ali/); assert.match(message, /600 m² in Riyadh/); assert.doesNotMatch(message, /localhost|undefined/); }
});

test('group loader uses implemented chats endpoint and returns only groups', async () => {
  const groups = await fetchWhatsAppGroups({url: 'https://office.example', key: 'test'}, async (url, options) => {
    assert.equal(url, 'https://office.example/api/chats/getAll');
    assert.equal(options?.cache, 'no-store');
    return Response.json({success: true, data: [{id: '123@g.us', name: 'Office'}, {id: '966500000000@c.us', name: 'Private customer'}]});
  });
  assert.deepEqual(groups, [{id: '123@g.us', name: 'Office'}]);
});
