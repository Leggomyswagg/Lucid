import assert from 'node:assert/strict';
import { test } from 'node:test';
import { detectionHistoryCsv, readSavedDetections } from '../src/lib/history-export.ts';

test('CSV quotes all fields and preserves embedded commas, quotes and newlines', () => {
  const csv = detectionHistoryCsv([{
    title: 'A "quoted",\nmultiline title', media_type: 'image',
    source_platform: 'A,B', ai_confidence: 42, ai_model_detected: 'Model "A"',
    is_ai_generated: true, scanned_at: '2026-10-13T00:00:00Z',
  }]);
  assert.ok(csv.includes('"A ""quoted"",\nmultiline title","image","A,B","42%","Model ""A""","AI Generated","2026-10-13T00:00:00.000Z"'));
});

test('CSV neutralizes spreadsheet formulas and tolerates an invalid timestamp', () => {
  const csv = detectionHistoryCsv([{
    title: '=SUM(1,1)', media_type: 'audio', source_platform: '\t@formula',
    ai_confidence: 0, ai_model_detected: undefined, is_ai_generated: false, scanned_at: 'invalid',
  }]);
  assert.ok(csv.includes('"\'=SUM(1,1)"'));
  assert.ok(csv.includes('"\'\t@formula"'));
  assert.ok(csv.endsWith('"Authentic",""'));
});

test('bookmarks use the selected account key and ignore corrupt storage', () => {
  const storage = { getItem: key => ({ alice: '["one",12,"two"]', bob: '["three"]', corrupt: '{' }[key] ?? null) };
  assert.deepEqual([...readSavedDetections(storage, 'alice')], ['one', 'two']);
  assert.deepEqual([...readSavedDetections(storage, 'bob')], ['three']);
  assert.equal(readSavedDetections(storage, 'corrupt').size, 0);
  assert.equal(readSavedDetections({ getItem: () => { throw new Error('blocked'); } }, 'alice').size, 0);
});
