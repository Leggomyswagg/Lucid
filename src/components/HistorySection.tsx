import React, { useState, useMemo, useEffect } from 'react';
import { useDetection } from '@/contexts/DetectionContext';
import { useAuth } from '@/contexts/AuthContext';
import { detectionHistoryCsv, readSavedDetections } from '@/lib/history-export';
import {
  History, Search, Filter, Calendar, SlidersHorizontal, Download,
  ChevronDown, Image, Video, Music, AlertTriangle, CheckCircle2,
  ArrowUpDown, Bookmark, BookmarkCheck, Trash2
} from 'lucide-react';

const HistorySection: React.FC = () => {
  const { detections, setSelectedDetection } = useDetection();
  const { user } = useAuth();
  const savedKey = `lucid:saved-detections:${user?.id ?? 'anonymous'}`;
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaFilter, setMediaFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confidenceRange, setConfidenceRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState<'date' | 'confidence'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [savedState, setSavedState] = useState(() => ({ key: savedKey, ids: new Set<string>() }));
  const savedItems = useMemo(() => savedState.key === savedKey ? savedState.ids : new Set<string>(), [savedState, savedKey]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  useEffect(() => {
    try {
      setSavedState({ key: savedKey, ids: readSavedDetections(localStorage, savedKey) });
    } catch {
      setSavedState({ key: savedKey, ids: new Set() });
    }
  }, [savedKey]);

  const filteredDetections = useMemo(() => {
    let filtered = [...detections];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.source_platform.toLowerCase().includes(q) ||
        d.ai_model_detected?.toLowerCase().includes(q)
      );
    }

    if (mediaFilter !== 'all') {
      filtered = filtered.filter(d => d.media_type === mediaFilter);
    }

    if (statusFilter === 'ai') {
      filtered = filtered.filter(d => d.is_ai_generated);
    } else if (statusFilter === 'authentic') {
      filtered = filtered.filter(d => !d.is_ai_generated);
    }

    filtered = filtered.filter(d =>
      d.ai_confidence >= confidenceRange[0] && d.ai_confidence <= confidenceRange[1]
    );

    if (showSavedOnly) {
      filtered = filtered.filter(d => savedItems.has(d.id));
    }

    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc'
          ? new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime()
          : new Date(a.scanned_at).getTime() - new Date(b.scanned_at).getTime();
      }
      return sortOrder === 'desc' ? b.ai_confidence - a.ai_confidence : a.ai_confidence - b.ai_confidence;
    });

    return filtered;
  }, [detections, searchQuery, mediaFilter, statusFilter, confidenceRange, sortBy, sortOrder, showSavedOnly, savedItems]);

  const toggleSaved = (id: string) => {
    const next = new Set(savedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSavedState({ key: savedKey, ids: next });
    try { localStorage.setItem(savedKey, JSON.stringify([...next])); } catch { /* session-only if storage is unavailable */ }
  };

  const exportHistory = () => {
    const blob = new Blob([detectionHistoryCsv(filteredDetections)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `detection-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <History className="w-7 h-7 text-cyan-400" />
            Detection History
          </h2>
          <p className="text-gray-400 text-sm mt-1">{filteredDetections.length} of {detections.length} detections</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              showSavedOnly ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            Saved ({savedItems.size})
          </button>
          <button
            onClick={exportHistory}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-lg text-sm font-medium hover:bg-cyan-500/20 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-700/50 mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search history..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Media type filter */}
            <select
              value={mediaFilter}
              onChange={e => setMediaFilter(e.target.value)}
              className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
            >
              <option value="all">All Media</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
            >
              <option value="all">All Status</option>
              <option value="ai">AI Generated</option>
              <option value="authentic">Authentic</option>
            </select>

            {/* Sort */}
            <button
              onClick={() => {
                if (sortBy === 'date') {
                  setSortBy('confidence');
                } else {
                  setSortBy('date');
                }
              }}
              className="flex items-center gap-2 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm hover:bg-gray-700 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortBy === 'date' ? 'By Date' : 'By Confidence'}
            </button>

            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm hover:bg-gray-700 transition-colors"
            >
              {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
            </button>
          </div>
        </div>

        {/* Confidence Range */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400 whitespace-nowrap">Confidence:</span>
          <div className="flex-1 flex items-center gap-3">
            <span className="text-xs text-gray-500 w-8">{confidenceRange[0]}%</span>
            <input
              type="range"
              min={0}
              max={100}
              value={confidenceRange[0]}
              onChange={e => setConfidenceRange([parseInt(e.target.value), confidenceRange[1]])}
              className="flex-1 accent-cyan-500 h-1"
            />
            <input
              type="range"
              min={0}
              max={100}
              value={confidenceRange[1]}
              onChange={e => setConfidenceRange([confidenceRange[0], parseInt(e.target.value)])}
              className="flex-1 accent-cyan-500 h-1"
            />
            <span className="text-xs text-gray-500 w-8">{confidenceRange[1]}%</span>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="space-y-2">
        {filteredDetections.map(d => (
          <div key={d.id} className="flex items-center gap-3 p-4 rounded-xl bg-gray-900/80 border border-gray-700/50 hover:border-cyan-500/20 transition-all group">
            {/* Thumbnail */}
            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
              {d.thumbnail_url ? (
                <img src={d.thumbnail_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {d.media_type === 'video' ? <Video className="w-5 h-5 text-gray-600" /> :
                   d.media_type === 'audio' ? <Music className="w-5 h-5 text-gray-600" /> :
                   <Image className="w-5 h-5 text-gray-600" />}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0" onClick={() => setSelectedDetection(d)}>
              <div className="text-sm text-white font-medium truncate cursor-pointer hover:text-cyan-400 transition-colors">
                {d.title}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  {d.media_type === 'video' ? <Video className="w-3 h-3" /> :
                   d.media_type === 'audio' ? <Music className="w-3 h-3" /> :
                   <Image className="w-3 h-3" />}
                  {d.media_type}
                </span>
                <span>{d.source_platform}</span>
                <span>{new Date(d.scanned_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Model */}
            <div className="hidden md:block text-xs text-gray-400 w-32 truncate">
              {d.ai_model_detected !== 'N/A - Authentic' ? d.ai_model_detected : '-'}
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              {d.is_ai_generated ? (
                <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/10 text-red-400 text-xs font-medium">
                  <AlertTriangle className="w-3 h-3" /> AI
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-xs font-medium">
                  <CheckCircle2 className="w-3 h-3" /> OK
                </span>
              )}
            </div>

            {/* Confidence */}
            <div className={`text-lg font-bold w-16 text-right ${
              d.ai_confidence > 80 ? 'text-red-400' : d.ai_confidence > 50 ? 'text-orange-400' : d.ai_confidence > 25 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {d.ai_confidence}%
            </div>

            {/* Save button */}
            <button
              onClick={(e) => { e.stopPropagation(); toggleSaved(d.id); }}
              aria-label={savedItems.has(d.id) ? `Unsave ${d.title}` : `Save ${d.title}`}
              aria-pressed={savedItems.has(d.id)}
              className={`p-2 rounded-lg transition-colors ${
                savedItems.has(d.id) ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-600 hover:text-yellow-400 hover:bg-yellow-500/10'
              }`}
            >
              {savedItems.has(d.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>
        ))}
      </div>

      {filteredDetections.length === 0 && (
        <div className="text-center py-16">
          <History className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No detections match your filters</p>
        </div>
      )}
    </section>
  );
};

export default HistorySection;
