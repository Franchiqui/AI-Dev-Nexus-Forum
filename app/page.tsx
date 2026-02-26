'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Folder,
  Edit,
  Layers,
  Filter,
  Tag,
  Share2,
  User,
  Grid3x3,
  List,
  Search,
  X,
  ChevronRight,
  Image as ImageIcon,
  Video,
  Music,
  File,
  Star,
  Clock,
  HardDrive,
  Sparkles,
  Sliders,
  Download,
  Trash2,
  Eye,
  MoreVertical,
  Plus,
  Check,
  Play,
  Pause,
  Volume2,
  Maximize2
} from 'lucide-react';
import Footer from '@/components/layout/footer';
import ImageEditor from '@/components/editor/ImageEditor';
import VideoEditor from '@/components/editor/VideoEditorClean';
import AudioEditor from '@/components/editor/AudioEditor';
import DocumentEditor from '@/components/editor/DocumentEditor';
import TextEditor from '@/components/editor/TextEditor';
import { Modal } from '@/components/ui/modal';
import { VideoEditState } from '@/types';

const DEFAULT_VIDEO_SRC = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const DEFAULT_AUDIO_SRC = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
const DEFAULT_IMAGE_SRC = (id: string) => `https://picsum.photos/seed/${id}/800/600`;

type MediaType = 'image' | 'video' | 'audio' | 'document';
type MediaFile = {
  id: string;
  name: string;
  type: MediaType;
  size: number;
  uploadedAt: Date;
  thumbnail?: string;
  tags: string[];
  fileObject?: File; // Para simular descargas
  editState?: unknown;
  lastEditedAt?: Date;
  textContent?: string;
};

type Project = {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  items: string[];
  createdAt: Date;
};

type WidgetType = 'recent' | 'projects' | 'storage' | 'suggestions';

interface Widget {
  id: WidgetType;
  title: string;
  icon: React.ReactNode;
}

const widgets: Widget[] = [
  { id: 'recent', title: 'Archivos Recientes', icon: <Clock className="w-5 h-5" /> },
  { id: 'projects', title: 'Proyectos Activos', icon: <Layers className="w-5 h-5" /> },
  { id: 'storage', title: 'Almacenamiento', icon: <HardDrive className="w-5 h-5" /> },
  { id: 'suggestions', title: 'Sugerencias', icon: <Sparkles className="w-5 h-5" /> },
];

export default function NexusMediaStudio() {
  const [activeTab, setActiveTab] = useState < 'dashboard' | 'files' | 'editor' | 'projects' | 'effects' | 'metadata' | 'share' | 'profile' > ('dashboard');
  const [mediaFiles, setMediaFiles] = useState < MediaFile[] > ([]);
  const [selectedFiles, setSelectedFiles] = useState < Set < string >> (new Set());
  const [viewMode, setViewMode] = useState < 'grid' | 'list' > ('grid');
  const [filterType, setFilterType] = useState < MediaType | 'all' > ('all');
  const [isDragging, setIsDragging] = useState(false);
  const [widgetLayout, setWidgetLayout] = useState < WidgetType[] > (['recent', 'projects', 'storage', 'suggestions']);
  const [isEditing, setIsEditing] = useState(false);
  const [previewFile, setPreviewFile] = useState < MediaFile | null > (null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorFile, setEditorFile] = useState < MediaFile | null > (null);
  const [editorUrl, setEditorUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [textPreviewContent, setTextPreviewContent] = useState('');
  const [isTextPreviewLoading, setIsTextPreviewLoading] = useState(false);
  const [textEditorContent, setTextEditorContent] = useState('');
  const [isTextEditorLoading, setIsTextEditorLoading] = useState(false);
  const audioRef = useRef < HTMLAudioElement > (null);
  const videoRef = useRef < HTMLVideoElement > (null);

  const fileInputRef = useRef < HTMLInputElement > (null);
  const dragCounter = useRef(0);

  const resolveMediaUrl = (file: MediaFile) => {
    return file.fileObject
      ? URL.createObjectURL(file.fileObject)
      : file.thumbnail ||
      (file.type === 'video' ? DEFAULT_VIDEO_SRC :
        file.type === 'audio' ? DEFAULT_AUDIO_SRC :
          DEFAULT_IMAGE_SRC(file.id));
  };

  const applyEditorChanges = (editState: unknown) => {
    if (!editorFile) return;
    const editedAt = new Date();

    setMediaFiles(prev => prev.map(file =>
      file.id === editorFile.id ? { ...file, editState, lastEditedAt: editedAt } : file
    ));

    setPreviewFile(prev => prev && prev.id === editorFile.id ? { ...prev, editState, lastEditedAt: editedAt } : prev);
    
    // No cerrar el editor automáticamente, solo guardar los cambios
    // closeEditor();
  };

  const saveTextEditorContent = (content: string) => {
    handleEditorTextSave(content);
  };

  const filteredMediaFiles = useMemo(
    () => mediaFiles.filter(file => filterType === 'all' || file.type === filterType),
    [mediaFiles, filterType]
  );

  const recentFiles = useMemo(
    () => mediaFiles.slice(0, 5),
    [mediaFiles]
  );

  const handleFileUpload = useCallback((files: FileList) => {
    const newFiles: MediaFile[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: getFileType(file.type),
      size: file.size,
      uploadedAt: new Date(),
      tags: [],
      fileObject: file,
      // Para demostración, generamos una URL de previsualización inmediata
      thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) :
        file.type.startsWith('video/') ? URL.createObjectURL(file) :
          file.type.startsWith('audio/') ? URL.createObjectURL(file) :
            undefined
    }));
    setMediaFiles(prev => [...newFiles, ...prev]);
  }, []);

  const getFileType = (mimeType: string): MediaType => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const isTextDocument = (file?: MediaFile | null) => {
    if (!file) return false;
    const mimeType = file.fileObject?.type || '';
    const textMimeTypes = ['application/json', 'application/xml'];
    if (mimeType.startsWith('text/') || textMimeTypes.includes(mimeType)) {
      return true;
    }

    const textExtensions = ['.txt', '.md', '.json', '.csv', '.xml', '.html', '.css', '.js'];
    const lowerName = file.name.toLowerCase();
    return textExtensions.some(ext => lowerName.endsWith(ext));
  };

  const fetchFileTextContent = async (file: MediaFile) => {
    if (file.textContent) return file.textContent;
    if (file.fileObject) {
      return file.fileObject.text();
    }

    const mediaUrl = resolveMediaUrl(file);
    const response = await fetch(mediaUrl);
    if (!response.ok) {
      throw new Error('No se pudo cargar el contenido');
    }
    return response.text();
  };

  const updateTextContentForFile = (fileId: string, content: string) => {
    const editedAt = new Date();

    setMediaFiles(prev => prev.map(file =>
      file.id === fileId ? { ...file, textContent: content, lastEditedAt: editedAt } : file
    ));

    setPreviewFile(prev => prev && prev.id === fileId ? { ...prev, textContent: content, lastEditedAt: editedAt } : prev);
    setEditorFile(prev => prev && prev.id === fileId ? { ...prev, textContent: content, lastEditedAt: editedAt } : prev);

    if (previewFile?.id === fileId) {
      setTextPreviewContent(content);
    }
    if (editorFile?.id === fileId) {
      setTextEditorContent(content);
    }
  };

  const handlePreviewTextSave = (content: string) => {
    if (!previewFile) return;
    updateTextContentForFile(previewFile.id, content);
  };

  const handleEditorTextSave = (content: string) => {
    if (!editorFile) return;
    updateTextContentForFile(editorFile.id, content);
    setIsEditorOpen(false);
  };

  useEffect(() => {
    if (!previewFile) {
      return;
    }

    // Construir una URL estable para el recurso seleccionado
    const mediaUrl = resolveMediaUrl(previewFile);

    setPreviewUrl(mediaUrl);

    if (previewFile.fileObject) {
      return () => URL.revokeObjectURL(mediaUrl);
    }
  }, [previewFile]);

  useEffect(() => {
    if (!editorFile) return;
    const mediaUrl = resolveMediaUrl(editorFile);
    setEditorUrl(mediaUrl);

    if (editorFile.fileObject) {
      return () => URL.revokeObjectURL(mediaUrl);
    }
  }, [editorFile]);

  useEffect(() => {
    if (previewFile && isTextDocument(previewFile)) {
      setIsTextPreviewLoading(true);
      fetchFileTextContent(previewFile)
        .then(content => {
          setTextPreviewContent(content);
          setMediaFiles(prev => prev.map(file => file.id === previewFile.id ? { ...file, textContent: content } : file));
        })
        .catch(err => console.error('Error cargando texto:', err))
        .finally(() => setIsTextPreviewLoading(false));
    } else {
      setTextPreviewContent('');
    }
  }, [previewFile]);

  useEffect(() => {
    if (editorFile && isTextDocument(editorFile)) {
      setIsTextEditorLoading(true);
      fetchFileTextContent(editorFile)
        .then(content => {
          setTextEditorContent(content);
          setMediaFiles(prev => prev.map(file => file.id === editorFile.id ? { ...file, textContent: content } : file));
        })
        .catch(err => console.error('Error cargando texto para editor:', err))
        .finally(() => setIsTextEditorLoading(false));
    } else {
      setTextEditorContent('');
    }
  }, [editorFile]);

  const openEditor = () => {
    if (!previewFile) return;
    setEditorFile(previewFile);
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditorFile(null);
    setEditorUrl('');
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  }, [handleFileUpload]);

  const toggleFileSelection = useCallback((fileId: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(fileId)) {
        next.delete(fileId);
      } else {
        next.add(fileId);
      }
      return next;
    });
  }, []);

  const handleWidgetClick = useCallback((widgetId: WidgetType) => {
    switch (widgetId) {
      case 'recent': setActiveTab('files'); break;
      case 'projects': setActiveTab('projects'); break;
      case 'storage': setActiveTab('profile'); break;
      case 'suggestions': setActiveTab('effects'); break;
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        if (activeTab === 'files') {
          setSelectedFiles(new Set(mediaFiles.map(f => f.id)));
        }
      }
      if (e.key === 'Escape') {
        setSelectedFiles(new Set());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, mediaFiles]);

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)]" />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-2">Nexus Media Studio</h1>
          <p className="text-purple-200 text-lg">Crea, organiza y comparte tu universo multimedia.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {widgetLayout.map(widgetId => {
          const widget = widgets.find(w => w.id === widgetId);
          if (!widget) return null;

          return (
            <motion.div
              key={widget.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleWidgetClick(widget.id)}
              className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 cursor-pointer hover:border-purple-400/50 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  {widget.icon}
                </div>
                <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="font-semibold text-white mb-2">{widget.title}</h3>
              <p className="text-sm text-gray-300">
                {widget.id === 'recent' && `${mediaFiles.length} archivos`}
                {widget.id === 'projects' && '3 proyectos activos'}
                {widget.id === 'storage' && '2.4 GB / 10 GB'}
                {widget.id === 'suggestions' && 'Nuevos efectos disponibles'}
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-gray-900/50 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Actividad Reciente</h2>
        <div className="space-y-3">
          {recentFiles.map(file => (
            <div 
              key={file.id} 
              className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg cursor-pointer"
              onClick={() => {
                setPreviewFile(file);
                setActiveTab('files');
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-800 rounded">
                  {file.type === 'image' && <ImageIcon className="w-4 h-4" />}
                  {file.type === 'video' && <Video className="w-4 h-4" />}
                  {file.type === 'audio' && <Music className="w-4 h-4" />}
                  {file.type === 'document' && <File className="w-4 h-4" />}
                </div>
                <span className="text-gray-300">{file.name}</span>
              </div>
              <div className="text-right text-sm text-gray-400">
                <div>{file.uploadedAt.toLocaleDateString()}</div>
                {file.lastEditedAt && (
                  <div className="text-[11px] text-purple-300">Editado: {formatDateTime(file.lastEditedAt)}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFileManager = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Explorador Multimedia</h2>
          <p className="text-gray-400">Gestiona tus imágenes, videos y archivos de audio</p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Subir Archivos</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
          />

          <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-700' : ''}`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-700' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'image', 'video', 'audio', 'document'] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-full transition-colors ${filterType === type
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
          >
            {type === 'all' ? 'Todos' :
              type === 'image' ? 'Imágenes' :
                type === 'video' ? 'Videos' :
                  type === 'audio' ? 'Audio' : 'Documentos'}
          </button>
        ))}
      </div>

      {isDragging && (
        <div
          className="fixed inset-0 border-2 border-dashed border-purple-500 bg-purple-500/10 z-50 flex items-center justify-center"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="text-center p-8 bg-gray-900/90 backdrop-blur-sm rounded-xl">
            <Upload className="w-12 h-12 mx-auto mb-4 text-purple-400" />
            <p className="text-xl text-white">Suelta tus archivos aquí</p>
          </div>
        </div>
      )}

      {selectedFiles.size > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
          <span className="text-white">{selectedFiles.size} archivo(s) seleccionado(s)</span>
          <div className="flex space-x-2">
            <button
              onClick={handleDeleteFiles}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded flex items-center space-x-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar</span>
            </button>
            <button
              onClick={handleDownloadFiles}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center space-x-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Descargar</span>
            </button>
          </div>
        </div>
      )}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredMediaFiles
            .map(file => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => toggleFileSelection(file.id)}
                onDoubleClick={() => {
                  setPreviewFile(file);
                }}
                className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${selectedFiles.has(file.id)
                  ? 'border-purple-500 ring-2 ring-purple-500/30'
                  : 'border-gray-700 hover:border-gray-500'
                  }`}
              >
                <div className="aspect-square bg-gray-800 flex items-center justify-center">
                  {file.type === 'image' && (
                    <ImageIcon className="w-12 h-12 text-gray-600" />
                  )}
                  {file.type === 'video' && (
                    <Video className="w-12 h-12 text-gray-600" />
                  )}
                  {file.type === 'audio' && (
                    <Music className="w-12 h-12 text-gray-600" />
                  )}
                  {file.type === 'document' && (
                    <File className="w-12 h-12 text-gray-600" />
                  )}
                </div>

                {selectedFiles.has(file.id) && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className="p-3 bg-gray-900/90 backdrop-blur-sm">
                  <p className="text-sm font-medium text-white truncate">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  {file.lastEditedAt && (
                    <p className="text-[11px] text-purple-300 mt-1">
                      Editado: {formatDateTime(file.lastEditedAt)}
                    </p>
                  )}
                </div>

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <button
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewFile(file);
                    }}
                  >
                    <Eye className="w-4 h-4 text-white" />
                  </button>
                  <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm">
                    <Edit className="w-4 h-4 text-white" />
                  </button>
                </div>
              </motion.div>
            ))}
        </div>
      ) : (
        <div className="bg-gray-900/50 rounded-xl overflow-hidden">
          {mediaFiles
            .filter(file => filterType === 'all' || file.type === filterType)
            .map(file => (
              <div
                key={file.id}
                onClick={() => toggleFileSelection(file.id)}
                onDoubleClick={() => {
                  setIsEditing(true);
                  setActiveTab('editor');
                }}
                className={`flex items-center justify-between p-4 border-b border-gray-800 last:border-b-0 hover:bg-white/5 cursor-pointer ${selectedFiles.has(file.id) ? 'bg-purple-500/10' : ''
                  }`}
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className={`p-3 rounded-lg ${file.type === 'image' ? 'bg-blue-500/20' :
                    file.type === 'video' ? 'bg-red-500/20' :
                      file.type === 'audio' ? 'bg-green-500/20' : 'bg-yellow-500/20'
                    }`}>
                    {file.type === 'image' && <ImageIcon className="w-5 h-5" />}
                    {file.type === 'video' && <Video className="w-5 h-5" />}
                    {file.type === 'audio' && <Music className="w-5 h-5" />}
                    {file.type === 'document' && <File className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white truncate">{file.name}</p>
                    <p className="text-sm text-gray-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.uploadedAt.toLocaleDateString()}
                      {file.lastEditedAt && ` • Editado ${formatDateTime(file.lastEditedAt)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedFiles.has(file.id) && (
                    <Check className="w-5 h-5 text-purple-400" />
                  )}
                  <button className="p-2 hover:bg-gray-700 rounded">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );

  const handleClosePreview = () => {
    setPreviewFile(null);
    setPreviewUrl('');
    setIsPlaying(false);
    setAudioProgress(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleAudioPlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      const duration = audioRef.current.duration || 0;
      const progress = duration > 0 ? (audioRef.current.currentTime / duration) * 100 : 0;
      setAudioProgress(progress);
    }
  };

  const handleAudioLoaded = () => {
    if (audioRef.current) {
      const dur = audioRef.current.duration;
      setAudioDuration(Number.isFinite(dur) ? dur : 0);
    }
  };

  const handleAudioSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = (value / 100) * audioRef.current.duration;
      setAudioProgress(value);
    }
  };

  const handleDeleteFiles = () => {
    if (selectedFiles.size === 0) return;

    setMediaFiles(prev => prev.filter(file => !selectedFiles.has(file.id)));
    setSelectedFiles(new Set());
  };

  const downloadMediaFile = async (file: MediaFile) => {
    // Prioridad: objeto local -> thumbnail/blob -> fallback remota
    const href = file.thumbnail && file.thumbnail.startsWith('blob:')
      ? file.thumbnail
      : file.fileObject
        ? URL.createObjectURL(file.fileObject)
        : (file.type === 'video' ? DEFAULT_VIDEO_SRC :
          file.type === 'audio' ? DEFAULT_AUDIO_SRC :
            DEFAULT_IMAGE_SRC(file.id));

    const revokeLater = file.fileObject ? href : null;

    const link = document.createElement('a');
    link.href = href;
    link.download = file.name || 'archivo';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (revokeLater) {
      // Dar tiempo a que el navegador inicie la descarga
      setTimeout(() => URL.revokeObjectURL(revokeLater), 1000);
    }
  };

  const handleDownloadFiles = async () => {
    if (selectedFiles.size === 0) return;

    const filesToDownload = mediaFiles.filter(file => selectedFiles.has(file.id));
    await Promise.all(filesToDownload.map(downloadMediaFile));

    // Limpiar selección después de la descarga
    setSelectedFiles(new Set());
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatDateTime = (date?: Date) => {
    if (!date) return '';
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'files':
        return renderFileManager();
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">En desarrollo</h2>
              <p className="text-gray-400">Esta sección estará disponible pronto.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <header className="border-b border-gray-800">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg" />
                <span className="text-xl font-bold">Nexus</span>
              </div>

              <nav className="hidden md:flex items-center space-x-6">
                {['dashboard', 'files', 'projects', 'editor', 'effects', 'metadata', 'share', 'profile'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`capitalize transition-colors ${activeTab === tab ? 'text-purple-400' : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    {tab === 'dashboard' ? 'Inicio' :
                      tab === 'files' ? 'Archivos' :
                        tab === 'projects' ? 'Proyectos' :
                          tab === 'editor' ? 'Editor' :
                            tab === 'effects' ? 'Efectos' :
                              tab === 'metadata' ? 'Metadatos' :
                                tab === 'share' ? 'Compartir' : 'Perfil'}
                  </button>
                ))}
              </nav>

              <div className="flex items-center space-x-4">
                <button className="p-2 hover:bg-gray-800 rounded-lg">
                  <Search className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-800 rounded-lg">
                  <User className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          {renderContent()}
        </main>

        {/* Modal de vista previa */}
        <AnimatePresence>
          {previewFile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={previewFile?.type === 'document' ? (e) => e.stopPropagation() : handleClosePreview}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className={`relative bg-gray-900 text-white rounded-2xl border border-gray-700 ${
                  previewFile?.type === 'document'
                    ? 'w-full max-w-7xl'
                    : previewFile?.type === 'video'
                      ? 'w-auto max-w-none'
                      : 'w-full max-w-6xl'
                }`}
                style={{
                  resize: 'both',
                  overflow: 'hidden',
                  maxHeight: '90vh',
                  minHeight: '300px',
                  minWidth: previewFile?.type === 'document' ? '900px' : '600px'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                  <div>
                    <h3 className="text-xl font-bold text-white">{previewFile.name}</h3>
                    <p className="text-sm text-gray-400">
                      {previewFile.type === 'image' ? 'Imagen' :
                        previewFile.type === 'video' ? 'Video' :
                          previewFile.type === 'audio' ? 'Audio' : 'Documento'} •
                      {(previewFile.size / (1024 * 1024)).toFixed(2)} MB
                      {previewFile.lastEditedAt && ` • Editado ${formatDateTime(previewFile.lastEditedAt)}`}
                    </p>
                  </div>
                  <button
                    onClick={handleClosePreview}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                <div className="p-6 overflow-hidden max-h-[80vh]">
                  {previewFile.type === 'image' && (
                    <div className="flex items-center justify-center">
                      <img
                        src={previewUrl || DEFAULT_IMAGE_SRC(previewFile.id)}
                        alt={previewFile.name}
                        className="max-w-full max-h-[60vh] object-contain rounded-lg"
                      />
                    </div>
                  )}

                  {previewFile.type === 'video' && (
                    <div className="space-y-4">
                      <video
                        ref={videoRef}
                        src={previewUrl || DEFAULT_VIDEO_SRC}
                        controls
                        autoPlay
                        preload="auto"
                        playsInline
                        muted
                        className="w-full rounded-lg"
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onLoadedMetadata={() => {
                          // Intentar reproducir automáticamente cuando el video esté listo
                          if (videoRef.current) {
                            // Asegurar que el video esté listo para reproducir
                            videoRef.current.muted = true;
                            videoRef.current.play().catch(e => {
                              console.warn('Reproducción automática fallida:', e);
                              // Si falla, mostrar controles para que el usuario pueda reproducir manualmente
                            });
                          }
                        }}
                        onCanPlayThrough={() => {
                          // El video está completamente cargado y listo para reproducir
                          console.log('Video listo para reproducir');
                        }}
                      />
                      <div className="flex items-center justify-between text-white">
                        <button
                          onClick={() => videoRef.current?.requestFullscreen()}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Maximize2 className="w-4 h-4" />
                          Pantalla completa
                        </button>
                      </div>
                    </div>
                  )}

                  {previewFile.type === 'audio' && (
                    <div className="space-y-6 p-8">
                      <div className="flex items-center justify-center">
                        <div className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
                          <Music className="w-24 h-24 text-white" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-white">
                          <span>{formatTime((audioProgress / 100) * audioDuration)}</span>
                          <span>{formatTime(audioDuration)}</span>
                        </div>

                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={audioProgress}
                          onChange={handleAudioSeek}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                        />

                        <div className="flex items-center justify-center gap-6">
                          <button
                            onClick={handleAudioPlayPause}
                            className="p-4 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors"
                          >
                            {isPlaying ? (
                              <Pause className="w-8 h-8 text-white" />
                            ) : (
                              <Play className="w-8 h-8 text-white" />
                            )}
                          </button>
                          <div className="flex items-center gap-2 text-white">
                            <Volume2 className="w-5 h-5" />
                            <span>Reproduciendo audio</span>
                          </div>
                        </div>
                      </div>

                      <audio
                        ref={audioRef}
                        src={previewUrl || DEFAULT_AUDIO_SRC}
                        onTimeUpdate={handleAudioTimeUpdate}
                        onLoadedMetadata={handleAudioLoaded}
                        onEnded={() => setIsPlaying(false)}
                        className="hidden"
                      />
                    </div>
                  )}

                  {(previewFile.type === 'document' || isTextDocument(previewFile)) && (
                    isTextDocument(previewFile) ? (
                      <div className="border border-gray-700 rounded-lg overflow-hidden h-[70vh] flex flex-col">
                        <TextEditor
                          className="flex-1 h-full"
                          initialContent={textPreviewContent}
                          filename={previewFile.name}
                          onSave={handlePreviewTextSave}
                        />
                      </div>
                    ) : (
                      <div className="border border-gray-700 rounded-lg overflow-hidden">
                        <iframe
                          src={previewUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'}
                          className="w-full h-[60vh] min-h-[200px]"
                          title="Document Viewer"
                        />
                        <div className="mt-4 text-center text-white">
                        <p>Vista previa del documento. Para editar, usa el editor.</p>
                      </div>
                    </div>
                    )
                  )}
                </div>

                <div className="p-4 border-t border-gray-800 flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Subido el {previewFile.uploadedAt.toLocaleDateString()}
                    {previewFile.lastEditedAt && ` • Editado ${formatDateTime(previewFile.lastEditedAt)}`}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setPreviewFile(previewFile);
                        openEditor();
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white"
                    >
                      <Edit className="w-4 h-4 inline mr-2" />
                      Editar
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Modal
          isOpen={isEditorOpen && !!editorFile}
          onClose={closeEditor}
          title={editorFile ? `Editar ${editorFile.name}` : 'Editor'}
          size="full"
          resizable={editorFile?.type === 'document' || editorFile?.type === 'video'}
          containerClassName="mx-8"
        >
          {editorFile && editorFile.type === 'image' && editorUrl && (
            <ImageEditor
              imageUrl={editorUrl}
              onSave={applyEditorChanges}
              onCancel={closeEditor}
            />
          )}

          {editorFile && editorFile.type === 'video' && editorUrl && (
            <div className="resizable h-[70vh]">
              <VideoEditor
                videoUrl={editorUrl}
                initialEditState={editorFile.editState as VideoEditState}
                onSave={applyEditorChanges}
                onCancel={closeEditor}
              />
            </div>
          )}

          {editorFile && editorFile.type === 'audio' && editorUrl && (
            <AudioEditor
              audioUrl={editorUrl}
              onSave={applyEditorChanges}
              onCancel={closeEditor}
            />
          )}

          {editorFile && (editorFile.type === 'document' || isTextDocument(editorFile)) && editorUrl && (
            isTextDocument(editorFile) ? (
              <div className="h-[70vh] flex flex-col">
                <TextEditor
                  className="flex-1 h-full"
                  initialContent={textEditorContent}
                  filename={editorFile.name}
                  onSave={handleEditorTextSave}
                />
              </div>
            ) : (
              <DocumentEditor
                documentUrl={editorUrl}
                onClose={closeEditor}
              />
            )
          )}
        </Modal>

        <Footer />
      </div>
    </>
  );
}
