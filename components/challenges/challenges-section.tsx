'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, Trophy, Clock, ChevronRight, Star, Target, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  participants: number;
  maxParticipants: number;
  deadline: Date;
  reward: string;
  progress: number;
  isFeatured: boolean;
  tags: string[];
}

const mockChallenges: Challenge[] = [
  {
    id: '1',
    title: 'Optimización de Modelo de Clasificación de Imágenes',
    description: 'Mejora la precisión de un modelo ResNet-50 para clasificación de imágenes médicas usando técnicas de fine-tuning y data augmentation.',
    difficulty: 'advanced',
    category: 'Computer Vision',
    participants: 45,
    maxParticipants: 100,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    reward: 'Premium GPU Credits + $500',
    progress: 65,
    isFeatured: true,
    tags: ['PyTorch', 'Medical AI', 'Transfer Learning']
  },
  {
    id: '2',
    title: 'Detección de Anomalías en Series Temporales',
    description: 'Desarrolla un modelo LSTM/Transformer para detectar anomalías en datos financieros en tiempo real.',
    difficulty: 'intermediate',
    category: 'Time Series',
    participants: 78,
    maxParticipants: 150,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    reward: 'Certificación + Mentorship',
    progress: 52,
    isFeatured: false,
    tags: ['TensorFlow', 'LSTM', 'Finance']
  },
  {
    id: '3',
    title: 'Chatbot Multilingüe con Contexto',
    description: 'Crea un chatbot que mantenga contexto en conversaciones y soporte 3 idiomas simultáneamente.',
    difficulty: 'intermediate',
    category: 'NLP',
    participants: 32,
    maxParticipants: 80,
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    reward: 'API Credits + Featured Spot',
    progress: 40,
    isFeatured: true,
    tags: ['Transformers', 'Multilingual', 'ChatGPT']
  },
  {
    id: '4',
    title: 'Reconocimiento de Gestos en Tiempo Real',
    description: 'Implementa un sistema de reconocimiento de gestos usando visión por computadora para control por gestos.',
    difficulty: 'beginner',
    category: 'Computer Vision',
    participants: 120,
    maxParticipants: 200,
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    reward: 'Hardware Kit',
    progress: 60,
    isFeatured: false,
    tags: ['OpenCV', 'Real-time', 'MediaPipe']
  },
  {
    id: '5',
    title: 'Generación de Código con IA',
    description: 'Desarrolla un modelo que genere código Python funcional a partir de descripciones en lenguaje natural.',
    difficulty: 'expert',
    category: 'Code Generation',
    participants: 18,
    maxParticipants: 50,
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    reward: 'Research Grant + Publication',
    progress: 25,
    isFeatured: true,
    tags: ['Codex', 'GPT', 'Python']
  }
];

const difficultyColors = {
  beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
  intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  advanced: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  expert: 'bg-red-500/20 text-red-400 border-red-500/30'
};

const categoryColors: Record<string, string> = {
  'Computer Vision': 'bg-blue-500/20 text-blue-400',
  'NLP': 'bg-purple-500/20 text-purple-400',
  'Time Series': 'bg-emerald-500/20 text-emerald-400',
  'Code Generation': 'bg-pink-500/20 text-pink-400'
};

export default function ChallengesSection() {
  const [challenges, setChallenges] = useState < Challenge[] > ([]);
  const [selectedCategory, setSelectedCategory] = useState < string > ('all');
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced' | 'expert',
    category: '',
    maxParticipants: 50,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    reward: '',
    tags: [] as string[],
    currentTag: ''
  });

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setChallenges(mockChallenges);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const categories = ['all', ...Array.from(new Set(mockChallenges.map(c => c.category)))];

  const filteredChallenges = selectedCategory === 'all'
    ? challenges
    : challenges.filter(challenge => challenge.category === selectedCategory);

  const formatTimeRemaining = (deadline: Date) => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Finalizando';
  };

  const getDifficultyIcon = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return <Star className="w-4 h-4" />;
      case 'intermediate': return <Target className="w-4 h-4" />;
      case 'advanced': return <Trophy className="w-4 h-4" />;
      case 'expert': return <Trophy className="w-4 h-4 fill-current" />;
    }
  };

  if (loading) {
    return (
      <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Retos de IA</CardTitle>
          <CardDescription>Cargando retos disponibles...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-800/50 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Retos de IA
              </CardTitle>
              <CardDescription>
                Participa en retos colaborativos y gana premios
              </CardDescription>
            </div>
            <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
              Ver todos los retos
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Filtros de categoría */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map(category => (
              <Button
                key={category}
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-full",
                  selectedCategory === category
                    ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                    : "text-gray-400 hover:text-gray-300 hover:bg-gray-800"
                )}
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? 'Todos' : category}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {filteredChallenges.map(challenge => (
              <div
                key={challenge.id}
                className={cn(
                  "group relative p-6 rounded-xl border transition-all duration-300 hover:border-gray-600 hover:shadow-xl",
                  challenge.isFeatured
                    ? "bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-yellow-500/30"
                    : "bg-gray-900/30 border-gray-800"
                )}
              >
                {challenge.isFeatured && (
                  <div className="absolute -top-2 -right-2">
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      <Star className="w-3 h-3 mr-1" />
                      Destacado
                    </Badge>
                  </div>
                )}

                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                          {challenge.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                          {challenge.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <Badge className={difficultyColors[challenge.difficulty]}>
                        <span className="flex items-center gap-1">
                          {getDifficultyIcon(challenge.difficulty)}
                          {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                        </span>
                      </Badge>

                      <Badge className={categoryColors[challenge.category] || "bg-gray-700 text-gray-300"}>
                        {challenge.category}
                      </Badge>

                      {challenge.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-gray-400 border-gray-700">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Users className="w-4 h-4" />
                            <span>{challenge.participants}/{challenge.maxParticipants}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>{formatTimeRemaining(challenge.deadline)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-yellow-400">
                            <Trophy className="w-4 h-4" />
                            <span>{challenge.reward}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Progreso del reto</span>
                          <span className="text-blue-400">{challenge.progress}%</span>
                        </div>
                        <Progress value={challenge.progress} className="h-2 bg-gray-800" />
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-48 flex flex-col gap-3">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Unirse al Reto
                    </Button>
                    <Button variant="outline" className="w-full border-gray-700 hover:bg-gray-800">
                      Ver Detalles
                    </Button>
                    <div className="text-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Finaliza: {challenge.deadline.toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredChallenges.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No hay retos en esta categoría
              </h3>
              <p className="text-gray-500">
                Prueba con otra categoría o crea tu propio reto
              </p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-400">
                <span className="text-blue-400 font-semibold">{challenges.length}</span> retos activos •
                <span className="text-green-400 font-semibold mx-2">
                  {challenges.reduce((acc, c) => acc + c.participants, 0)}
                </span>
                participantes totales
              </div>
              <Button
                variant="outline"
                className="border-gray-700 hover:bg-gray-800"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Crear Nuevo Reto
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>,

      {/* Modal para crear nuevo reto */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nuevo Reto"
        description="Completa los detalles para crear un nuevo reto de IA"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="challenge-title">Título del Reto *</Label>
            <Input
              id="challenge-title"
              value={newChallenge.title}
              onChange={(e) => setNewChallenge(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ej: Optimización de Modelo de Clasificación de Imágenes"
              className="mt-1 bg-gray-800 border-gray-700"
            />
          </div>

          <div>
            <Label htmlFor="challenge-description">Descripción *</Label>
            <Textarea
              id="challenge-description"
              value={newChallenge.description}
              onChange={(e) => setNewChallenge(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe el reto en detalle, incluyendo objetivos y requisitos..."
              className="mt-1 min-h-[100px] bg-gray-800 border-gray-700"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="challenge-difficulty">Dificultad *</Label>
              <Select
                value={newChallenge.difficulty}
                onValueChange={(value: 'beginner' | 'intermediate' | 'advanced' | 'expert') =>
                  setNewChallenge(prev => ({ ...prev, difficulty: value }))
                }
              >
                <SelectTrigger className="mt-1 bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Selecciona dificultad" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="beginner">Principiante</SelectItem>
                  <SelectItem value="intermediate">Intermedio</SelectItem>
                  <SelectItem value="advanced">Avanzado</SelectItem>
                  <SelectItem value="expert">Experto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="challenge-category">Categoría *</Label>
              <Input
                id="challenge-category"
                value={newChallenge.category}
                onChange={(e) => setNewChallenge(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Ej: Computer Vision, NLP, Time Series"
                className="mt-1 bg-gray-800 border-gray-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="challenge-participants">Participantes Máximos</Label>
              <Input
                id="challenge-participants"
                type="number"
                value={newChallenge.maxParticipants}
                onChange={(e) => setNewChallenge(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 50 }))}
                className="mt-1 bg-gray-800 border-gray-700"
                min="1"
                max="1000"
              />
            </div>

            <div>
              <Label htmlFor="challenge-deadline">Fecha Límite</Label>
              <Input
                id="challenge-deadline"
                type="date"
                value={new Date(newChallenge.deadline).toISOString().split('T')[0]}
                onChange={(e) => setNewChallenge(prev => ({
                  ...prev,
                  deadline: new Date(e.target.value)
                }))}
                className="mt-1 bg-gray-800 border-gray-700"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="challenge-reward">Recompensa</Label>
            <Input
              id="challenge-reward"
              value={newChallenge.reward}
              onChange={(e) => setNewChallenge(prev => ({ ...prev, reward: e.target.value }))}
              placeholder="Ej: Premium GPU Credits + $500, Certificación, Hardware Kit"
              className="mt-1 bg-gray-800 border-gray-700"
            />
          </div>

          <div>
            <Label htmlFor="challenge-tags">Etiquetas</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="challenge-tags"
                value={newChallenge.currentTag}
                onChange={(e) => setNewChallenge(prev => ({ ...prev, currentTag: e.target.value }))}
                placeholder="Añade etiquetas (PyTorch, TensorFlow, etc.)"
                className="flex-1 bg-gray-800 border-gray-700"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newChallenge.currentTag.trim()) {
                    e.preventDefault();
                    if (!newChallenge.tags.includes(newChallenge.currentTag.trim())) {
                      setNewChallenge(prev => ({
                        ...prev,
                        tags: [...prev.tags, prev.currentTag.trim()],
                        currentTag: ''
                      }));
                    }
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => {
                  if (newChallenge.currentTag.trim() && !newChallenge.tags.includes(newChallenge.currentTag.trim())) {
                    setNewChallenge(prev => ({
                      ...prev,
                      tags: [...prev.tags, prev.currentTag.trim()],
                      currentTag: ''
                    }));
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {newChallenge.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-gray-700 text-gray-300 flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => {
                      setNewChallenge(prev => ({
                        ...prev,
                        tags: prev.tags.filter(t => t !== tag)
                      }));
                    }}
                    className="ml-1 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="border-gray-600"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                // Validar campos requeridos
                if (!newChallenge.title.trim() || !newChallenge.description.trim() || !newChallenge.category.trim()) {
                  alert('Por favor, completa los campos obligatorios: Título, Descripción y Categoría');
                  return;
                }

                // Crear nuevo reto
                const newChallengeObj: Challenge = {
                  id: (challenges.length + 1).toString(),
                  title: newChallenge.title,
                  description: newChallenge.description,
                  difficulty: newChallenge.difficulty,
                  category: newChallenge.category,
                  participants: 0,
                  maxParticipants: newChallenge.maxParticipants,
                  deadline: newChallenge.deadline,
                  reward: newChallenge.reward,
                  progress: 0,
                  isFeatured: false,
                  tags: newChallenge.tags
                };

                setChallenges(prev => [newChallengeObj, ...prev]);

                // Resetear formulario
                setNewChallenge({
                  title: '',
                  description: '',
                  difficulty: 'beginner',
                  category: '',
                  maxParticipants: 50,
                  deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                  reward: '',
                  tags: [],
                  currentTag: ''
                });

                setIsCreateModalOpen(false);
                alert('¡Reto creado exitosamente!');
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Crear Reto
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}