'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, Trophy, Clock, ChevronRight, Star, Target, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

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
    participants: 23,
    maxParticipants: 50,
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    reward: 'Cloud Credits + $300',
    progress: 40,
    isFeatured: false,
    tags: ['LSTM', 'Transformers', 'Finance']
  },
  {
    id: '3',
    title: 'Bot Conversacional Multilingüe',
    description: 'Crea un chatbot que pueda entender y responder en múltiples idiomas usando modelos de lenguaje grandes.',
    difficulty: 'expert',
    category: 'NLP',
    participants: 67,
    maxParticipants: 80,
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    reward: 'API Credits + $1000',
    progress: 80,
    isFeatured: true,
    tags: ['LLM', 'Translation', 'Chatbot']
  },
  {
    id: '4',
    title: 'Clasificación de Sentimientos en Redes Sociales',
    description: 'Analiza y clasifica el sentimiento de posts en redes sociales usando técnicas de NLP.',
    difficulty: 'beginner',
    category: 'NLP',
    participants: 89,
    maxParticipants: 150,
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    reward: 'Starter Credits + $100',
    progress: 25,
    isFeatured: false,
    tags: ['Sentiment Analysis', 'Social Media', 'NLP']
  },
  {
    id: '5',
    title: 'Generación de Arte con GANs',
    description: 'Implementa una GAN para generar arte abstracto y explora diferentes arquitecturas.',
    difficulty: 'intermediate',
    category: 'Computer Vision',
    participants: 34,
    maxParticipants: 60,
    deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    reward: 'GPU Credits + $400',
    progress: 55,
    isFeatured: false,
    tags: ['GANs', 'Art Generation', 'PyTorch']
  }
];

const difficultyColors = {
  'beginner': 'bg-green-500/20 text-green-400',
  'intermediate': 'bg-yellow-500/20 text-yellow-400',
  'advanced': 'bg-orange-500/20 text-orange-400',
  'expert': 'bg-red-500/20 text-red-400',
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
    deadline: '',
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

  const handleCreateChallenge = () => {
    if (!newChallenge.title.trim() || !newChallenge.description.trim()) {
      alert('Por favor, completa el título y descripción del reto');
      return;
    }

    const newChallengeObj: Challenge = {
      id: Date.now().toString(),
      title: newChallenge.title,
      description: newChallenge.description,
      difficulty: newChallenge.difficulty,
      category: newChallenge.category || 'General',
      participants: 0,
      maxParticipants: newChallenge.maxParticipants,
      deadline: new Date(newChallenge.deadline),
      reward: newChallenge.reward,
      progress: 0,
      isFeatured: false,
      tags: newChallenge.tags
    };

    setChallenges([newChallengeObj, ...challenges]);
    setNewChallenge({
      title: '',
      description: '',
      difficulty: 'beginner',
      category: '',
      maxParticipants: 50,
      deadline: '',
      reward: '',
      tags: [],
      currentTag: ''
    });
    setIsCreateModalOpen(false);
    alert('¡Reto creado exitosamente!');
  };

  const handleAddTag = () => {
    if (newChallenge.currentTag.trim() && !newChallenge.tags.includes(newChallenge.currentTag.trim())) {
      setNewChallenge(prev => ({
        ...prev,
        tags: [...prev.tags, prev.currentTag.trim()],
        currentTag: ''
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewChallenge(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
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
              <CardTitle className="text-2xl font-bold">Retos de IA</CardTitle>
              <CardDescription className="text-gray-400">
                Participa en desafíos de IA y gana recompensas
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Crear Nuevo Reto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "transition-all duration-200",
                  selectedCategory === category
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "border-gray-600 text-gray-300 hover:bg-gray-800"
                )}
              >
                {category === 'all' ? 'Todos' : category}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredChallenges.map((challenge) => (
              <Card
                key={challenge.id}
                className={cn(
                  "bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-all duration-200 cursor-pointer group",
                  challenge.isFeatured && "ring-2 ring-yellow-500/20"
                )}
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Left side - Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3">
                            {getDifficultyIcon(challenge.difficulty)}
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-xs",
                                difficultyColors[challenge.difficulty]
                              )}
                            >
                              {challenge.difficulty}
                            </Badge>
                            {challenge.isFeatured && (
                              <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                Destacado
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-xl leading-tight group-hover:text-blue-400 transition-colors mb-2">
                            {challenge.title}
                          </CardTitle>
                          <CardDescription className="text-gray-400 line-clamp-2">
                            {challenge.description}
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {challenge.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs bg-gray-700/50 text-gray-300"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Right side - Meta info and actions */}
                    <div className="lg:w-80 lg:flex-shrink-0 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                            <Users className="w-4 h-4" />
                            <span className="text-sm">Participantes</span>
                          </div>
                          <div className="font-semibold text-white">
                            {challenge.participants}/{challenge.maxParticipants}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">Tiempo</span>
                          </div>
                          <div className="font-semibold text-white">
                            {formatTimeRemaining(challenge.deadline)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="border-gray-600 text-gray-300">
                          {challenge.category}
                        </Badge>
                        <span className="text-green-400 font-medium">{challenge.reward}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Progreso</span>
                          <span>{challenge.progress}%</span>
                        </div>
                        <Progress value={challenge.progress} className="h-2" />
                      </div>

                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        Participar
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredChallenges.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 mx-auto text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                No hay retos en esta categoría
              </h3>
              <p className="text-gray-500">
                Sé el primero en crear un reto para esta categoría
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para crear nuevo reto */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nuevo Reto"
        description="Comparte tu reto con la comunidad de IA"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Título del Reto
            </Label>
            <Input
              id="title"
              value={newChallenge.title}
              onChange={(e) => setNewChallenge(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ej: Optimización de modelo de lenguaje"
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Descripción
            </Label>
            <Textarea
              id="description"
              value={newChallenge.description}
              onChange={(e) => setNewChallenge(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe los objetivos y requisitos del reto..."
              rows={3}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="difficulty" className="block text-sm font-medium text-gray-300 mb-2">
                Dificultad
              </Label>
              <Select
                value={newChallenge.difficulty}
                onValueChange={(value: 'beginner' | 'intermediate' | 'advanced' | 'expert') =>
                  setNewChallenge(prev => ({ ...prev, difficulty: value }))
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="beginner">Principiante</SelectItem>
                  <SelectItem value="intermediate">Intermedio</SelectItem>
                  <SelectItem value="advanced">Avanzado</SelectItem>
                  <SelectItem value="expert">Experto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                Categoría
              </Label>
              <Input
                id="category"
                value={newChallenge.category}
                onChange={(e) => setNewChallenge(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Ej: Computer Vision"
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-300 mb-2">
                Participantes Máximos
              </Label>
              <Input
                id="maxParticipants"
                type="number"
                value={newChallenge.maxParticipants}
                onChange={(e) => setNewChallenge(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 50 }))}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            <div>
              <Label htmlFor="deadline" className="block text-sm font-medium text-gray-300 mb-2">
                Fecha Límite
              </Label>
              <Input
                id="deadline"
                type="date"
                value={newChallenge.deadline}
                onChange={(e) => setNewChallenge(prev => ({ ...prev, deadline: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="reward" className="block text-sm font-medium text-gray-300 mb-2">
              Recompensa
            </Label>
            <Input
              id="reward"
              value={newChallenge.reward}
              onChange={(e) => setNewChallenge(prev => ({ ...prev, reward: e.target.value }))}
              placeholder="Ej: $500 + GPU Credits"
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          <div>
            <Label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
              Etiquetas
            </Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={newChallenge.currentTag}
                onChange={(e) => setNewChallenge(prev => ({ ...prev, currentTag: e.target.value }))}
                placeholder="Añadir etiqueta..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Añadir
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
              onClick={() => setIsCreateModalOpen(false)}
              className="border-gray-600"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateChallenge}
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

