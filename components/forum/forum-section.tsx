'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, ThumbsUp, Eye, Clock, Search, Filter, TrendingUp, Users, Zap, X, Tag, Hash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Modal } from '@/components/ui/modal';

export interface ForumThread {
  id: string;
  title: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  category: string;
  tags: string[];
  replies: number;
  likes: number;
  views: number;
  lastActivity: Date;
  isPinned: boolean;
  isSolved?: boolean;
  excerpt: string;
}

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  threadCount: number;
  color: string;
}

const ForumSection = () => {
  const [threads, setThreads] = useState < ForumThread[] > ([
    {
      id: '1',
      title: '¿Cómo optimizar el entrenamiento de Transformers con datasets grandes?',
      author: {
        name: 'Carlos ML',
        avatar: '/avatars/1.jpg',
        role: 'Senior ML Engineer'
      },
      category: 'Optimización',
      tags: ['Transformers', 'PyTorch', 'GPU', 'Optimización'],
      replies: 42,
      likes: 128,
      views: 1250,
      lastActivity: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      isPinned: true,
      isSolved: true,
      excerpt: 'Estoy trabajando con un dataset de 50GB y el entrenamiento está tomando demasiado tiempo. ¿Alguien tiene tips para optimizar el pipeline?'
    },
    {
      id: '2',
      title: 'Implementación de LoRA para fine-tuning eficiente',
      author: {
        name: 'Ana Torres',
        avatar: '/avatars/2.jpg',
        role: 'Research Scientist'
      },
      category: 'Fine-tuning',
      tags: ['LoRA', 'LLMs', 'Eficiencia', 'Research'],
      replies: 28,
      likes: 96,
      views: 890,
      lastActivity: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      isPinned: true,
      excerpt: 'Comparto mi implementación de LoRA para GPT-3 con reducción del 70% en memoria VRAM.'
    },
    {
      id: '3',
      title: 'Problema con gradient accumulation en mixed precision',
      author: {
        name: 'David Chen',
        avatar: '/avatars/3.jpg',
        role: 'ML Developer'
      },
      category: 'Problemas Técnicos',
      tags: ['PyTorch', 'Mixed Precision', 'Gradients', 'Debugging'],
      replies: 15,
      likes: 34,
      views: 450,
      lastActivity: new Date(Date.now() - 1000 * 60 * 240), // 4 hours ago
      isSolved: false,
      excerpt: 'Cuando uso gradient accumulation con AMP, los gradientes parecen no acumularse correctamente...',
      isPinned: false
    },
    {
      id: '4',
      title: 'Comparativa: TensorFlow vs PyTorch para producción 2024',
      author: {
        name: 'María López',
        avatar: '/avatars/4.jpg',
        role: 'MLOps Engineer'
      },
      category: 'Discusión',
      tags: ['TensorFlow', 'PyTorch', 'Producción', 'Comparativa'],
      replies: 67,
      likes: 210,
      views: 2100,
      lastActivity: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      isPinned: false,
      excerpt: 'Análisis detallado de ventajas y desventajas de ambos frameworks en entornos productivos.'
    },
    {
      id: '5',
      title: 'Tutorial: Deploy de modelos con ONNX Runtime y Triton',
      author: {
        name: 'Roberto AI',
        avatar: '/avatars/5.jpg',
        role: 'DevOps Specialist'
      },
      category: 'Tutoriales',
      tags: ['ONNX', 'Triton', 'Deployment', 'Inference'],
      replies: 23,
      likes: 89,
      views: 780,
      lastActivity: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
      isPinned: false,
      isSolved: true,
      excerpt: 'Guía paso a paso para servir modelos con latencias inferiores a 10ms.'
    }
  ]);

  const [categories] = useState < ForumCategory[] > ([
    {
      id: 'all',
      name: 'Todos',
      description: 'Todas las discusiones',
      icon: <MessageSquare className="h-4 w-4" />,
      threadCount: 175,
      color: 'bg-blue-500'
    },
    {
      id: 'optimization',
      name: 'Optimización',
      description: 'Performance y eficiencia',
      icon: <Zap className="h-4 w-4" />,
      threadCount: 42,
      color: 'bg-green-500'
    },
    {
      id: 'research',
      name: 'Research',
      description: 'Avances y papers',
      icon: <TrendingUp className="h-4 w-4" />,
      threadCount: 38,
      color: 'bg-purple-500'
    },
    {
      id: 'tutorials',
      name: 'Tutoriales',
      description: 'Guías y how-tos',
      icon: <Users className="h-4 w-4" />,
      threadCount: 56,
      color: 'bg-yellow-500'
    },
    {
      id: 'help',
      name: 'Ayuda',
      description: 'Soporte técnico',
      icon: <MessageSquare className="h-4 w-4" />,
      threadCount: 39,
      color: 'bg-red-500'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredThreads, setFilteredThreads] = useState < ForumThread[] > (threads);
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);
  const [newTopicData, setNewTopicData] = useState({
    title: '',
    category: 'Optimización',
    content: '',
    tags: [] as string[],
    currentTag: ''
  });

  useEffect(() => {
    let result = threads;

    if (selectedCategory !== 'all') {
      result = result.filter(thread =>
        thread.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(thread =>
        thread.title.toLowerCase().includes(query) ||
        thread.excerpt.toLowerCase().includes(query) ||
        thread.tags.some(tag => tag.toLowerCase().includes(query)) ||
        thread.author.name.toLowerCase().includes(query)
      );
    }

    setFilteredThreads(result);
  }, [searchQuery, selectedCategory, threads]);

  const formatTimeAgo = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  };

  const handleNewThread = () => {
    setIsNewTopicModalOpen(true);
  };

  const handleCreateTopic = () => {
    if (!newTopicData.title.trim() || !newTopicData.content.trim()) {
      alert('Por favor, completa el título y contenido del tema');
      return;
    }

    const newThread: ForumThread = {
      id: (threads.length + 1).toString(),
      title: newTopicData.title,
      author: {
        name: 'Usuario Actual',
        avatar: '/avatars/user.jpg',
        role: 'Miembro'
      },
      category: newTopicData.category,
      tags: newTopicData.tags,
      replies: 0,
      likes: 0,
      views: 0,
      lastActivity: new Date(),
      isPinned: false,
      isSolved: false,
      excerpt: newTopicData.content.substring(0, 150) + '...'
    };

    setThreads(prev => [newThread, ...prev]);
    setNewTopicData({
      title: '',
      category: 'Optimización',
      content: '',
      tags: [],
      currentTag: ''
    });
    setIsNewTopicModalOpen(false);
    alert('¡Tema creado exitosamente!');
  };

  const handleAddTag = () => {
    if (newTopicData.currentTag.trim() && !newTopicData.tags.includes(newTopicData.currentTag.trim())) {
      setNewTopicData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.currentTag.trim()],
        currentTag: ''
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewTopicData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleLikeThread = (threadId: string) => {
    setThreads(prev => prev.map(thread =>
      thread.id === threadId
        ? { ...thread, likes: thread.likes + 1 }
        : thread
    ));
  };

  return (
    <>
      <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-blue-400" />
                Foro de Discusión
              </CardTitle>
              <CardDescription className="text-gray-400">
                Únete a la conversación con desarrolladores de IA de todo el mundo
              </CardDescription>
            </div>
            <Button
              onClick={handleNewThread}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Nuevo Tema
            </Button>
          </div>
        </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Barra de búsqueda y filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar en discusiones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700"
              />
            </div>
            <Button variant="outline" className="border-gray-700">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>

          {/* Categorías */}
          <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
            <TabsList className="grid grid-cols-2 md:grid-cols-5 bg-gray-800">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="data-[state=active]:bg-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${category.color}`} />
                    {category.name}
                    <Badge variant="secondary" className="ml-1 bg-gray-700">
                      {category.threadCount}
                    </Badge>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-6">
              {/* Lista de hilos */}
              <div className="space-y-4">
                {filteredThreads.map((thread) => (
                  <Card
                    key={thread.id}
                    className={`border-gray-800 hover:border-gray-600 transition-colors ${thread.isPinned ? 'border-l-4 border-l-blue-500' : ''
                      }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Stats column */}
                        <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-2 min-w-[100px]">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-300">{thread.replies}</div>
                            <div className="text-sm text-gray-500">Respuestas</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-300">{thread.views}</div>
                            <div className="text-sm text-gray-500">Vistas</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLikeThread(thread.id)}
                            className="text-gray-400 hover:text-blue-400"
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {thread.likes}
                          </Button>
                        </div>

                        {/* Content column */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              {thread.isPinned && (
                                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                  Fijado
                                </Badge>
                              )}
                              {thread.isSolved && (
                                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                  Resuelto
                                </Badge>
                              )}
                              <h3 className="font-semibold text-lg hover:text-blue-400 cursor-pointer">
                                {thread.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(thread.lastActivity)}
                            </div>
                          </div>

                          <p className="text-gray-400 mb-4 line-clamp-2">
                            {thread.excerpt}
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={thread.author.avatar} />
                                <AvatarFallback>
                                  {thread.author.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-sm">
                                  {thread.author.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {thread.author.role}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="border-gray-700 text-gray-300">
                                {thread.category}
                              </Badge>
                              {thread.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="bg-gray-800 text-gray-400 hover:bg-gray-700"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

        </div>
      </CardContent>
    </Card>

    {/* Modal para crear nuevo tema */}
    <Modal
      isOpen={isNewTopicModalOpen}
      onClose={() => setIsNewTopicModalOpen(false)}
      title="Crear Nuevo Tema"
      description="Comparte tus ideas, preguntas o proyectos con la comunidad"
      size="lg"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Título del Tema *
          </label>
          <Input
            value={newTopicData.title}
            onChange={(e) => setNewTopicData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Ej: ¿Cómo optimizar modelos de transformers?"
            className="bg-gray-800 border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Categoría *
          </label>
          <Select
            value={newTopicData.category}
            onValueChange={(value) => setNewTopicData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700">
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="Optimización">Optimización</SelectItem>
              <SelectItem value="Fine-tuning">Fine-tuning</SelectItem>
              <SelectItem value="Problemas Técnicos">Problemas Técnicos</SelectItem>
              <SelectItem value="Discusión">Discusión</SelectItem>
              <SelectItem value="Tutoriales">Tutoriales</SelectItem>
              <SelectItem value="Research">Research</SelectItem>
              <SelectItem value="Ayuda">Ayuda</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Contenido *
          </label>
          <Textarea
            value={newTopicData.content}
            onChange={(e) => setNewTopicData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Describe tu tema en detalle..."
            className="min-h-[200px] bg-gray-800 border-gray-700"
            rows={6}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Etiquetas
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newTopicData.currentTag}
              onChange={(e) => setNewTopicData(prev => ({ ...prev, currentTag: e.target.value }))}
              placeholder="Ej: PyTorch, Transformers, GPU"
              className="flex-1 bg-gray-800 border-gray-700"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button
              type="button"
              onClick={handleAddTag}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Hash className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {newTopicData.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-gray-700 text-gray-300 flex items-center gap-1"
              >
                <Tag className="h-3 w-3" />
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => setIsNewTopicModalOpen(false)}
            className="border-gray-600"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreateTopic}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Crear Tema
          </Button>
        </div>
      </div>
    </Modal>
  </>
  );
};

export default ForumSection;