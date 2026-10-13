import type { Detection } from '../contexts/DetectionContext';

function csvCell(value: string | number): string {
  let text = String(value);
  // Spreadsheet applications can execute formula-like values from CSV cells.
  if (/^[\s\p{Cc}]*[=+@-]/u.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function detectionHistoryCsv(detections: Detection[]): string {
  const rows: (string | number)[][] = [
    ['Title', 'Media Type', 'Platform', 'AI Confidence', 'AI Model', 'Status', 'Scanned At'],
    ...detections.map(d => [
      d.title, d.media_type, d.source_platform, `${d.ai_confidence}%`,
      d.ai_model_detected ?? '', d.is_ai_generated ? 'AI Generated' : 'Authentic',
      Number.isNaN(Date.parse(d.scanned_at)) ? '' : new Date(d.scanned_at).toISOString(),
    ]),
  ];
  return rows.map(row => row.map(csvCell).join(',')).join('\r\n');
}

export function readSavedDetections(storage: Pick<Storage, 'getItem'>, key: string): Set<string> {
  try {
    const value: unknown = JSON.parse(storage.getItem(key) ?? '[]');
    return new Set(Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []);
  } catch {
    return new Set();
  }
}
