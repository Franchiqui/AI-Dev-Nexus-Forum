'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Star, Download, Eye, Code, Filter, TrendingUp, Users, Calendar, Play, BookOpen } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Modal } from '@/components/ui/modal';

export interface Model {
  id: string;
  name: string;
  description: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  framework: 'TensorFlow' | 'PyTorch' | 'JAX' | 'ONNX' | 'Other';
  task: 'Classification' | 'Segmentation' | 'Generation' | 'Detection' | 'Regression' | 'Reinforcement Learning';
  stars: number;
  downloads: number;
  views: number;
  lastUpdated: string;
  tags: string[];
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  performance: number; // 0-100 score
  codeAvailable: boolean;
  pretrained: boolean;
}

const mockModels: Model[] = [
  {
    id: '1',
    name: 'Vision Transformer (ViT-Base)',
    description: 'Vision Transformer model pre-trained on ImageNet-21k with 86M parameters. State-of-the-art for image classification tasks.',
    author: {
      name: 'Alex Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      role: 'Research Scientist'
    },
    framework: 'PyTorch',
    task: 'Classification',
    stars: 2450,
    downloads: 18420,
    views: 45230,
    lastUpdated: '2024-01-15',
    tags: ['computer-vision', 'transformer', 'imagenet', 'attention'],
    complexity: 'Intermediate',
    performance: 92,
    codeAvailable: true,
    pretrained: true
  },
  {
    id: '2',
    name: 'Stable Diffusion v2.1',
    description: 'Latest version of Stable Diffusion for text-to-image generation with improved prompt understanding.',
    author: {
      name: 'Stability AI',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Stability',
      role: 'Organization'
    },
    framework: 'PyTorch',
    task: 'Generation',
    stars: 18900,
    downloads: 125000,
    views: 289000,
    lastUpdated: '2024-01-10',
    tags: ['generative-ai', 'diffusion', 'text-to-image', 'creative'],
    complexity: 'Advanced',
    performance: 88,
    codeAvailable: true,
    pretrained: true
  },
  {
    id: '3',
    name: 'YOLOv8 Nano',
    description: 'Ultralytics YOLOv8 nano version optimized for edge devices with real-time object detection capabilities.',
    author: {
      name: 'Ultralytics',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ultralytics',
      role: 'Organization'
    },
    framework: 'PyTorch',
    task: 'Detection',
    stars: 8500,
    downloads: 67200,
    views: 156000,
    lastUpdated: '2024-01-20',
    tags: ['object-detection', 'real-time', 'edge-computing', 'computer-vision'],
    complexity: 'Beginner',
    performance: 85,
    codeAvailable: true,
    pretrained: true
  },
  {
    id: '4',
    name: 'BERT Multilingual',
    description: 'BERT model pre-trained on 104 languages for multilingual natural language understanding tasks.',
    author: {
      name: 'Google Research',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Google',
      role: 'Research Team'
    },
    framework: 'TensorFlow',
    task: 'Classification',
    stars: 12300,
    downloads: 89000,
    views: 210000,
    lastUpdated: '2024-01-05',
    tags: ['nlp', 'multilingual', 'transformer', 'bert'],
    complexity: 'Intermediate',
    performance: 90,
    codeAvailable: true,
    pretrained: true
  },
  {
    id: '5',
    name: 'PPO LunarLander',
    description: 'Proximal Policy Optimization implementation for LunarLander-v2 environment with stable training.',
    author: {
      name: 'Maria Rodriguez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      role: 'ML Engineer'
    },
    framework: 'PyTorch',
    task: 'Reinforcement Learning',
    stars: 850,
    downloads: 4200,
    views: 12500,
    lastUpdated: '2024-01-18',
    tags: ['reinforcement-learning', 'gym', 'ppo', 'control'],
    complexity: 'Advanced',
    performance: 78,
    codeAvailable: true,
    pretrained: true
  },
  {
    id: '6',
    name: 'U-Net Medical',
    description: 'U-Net architecture specialized for medical image segmentation with pre-trained weights on medical datasets.',
    author: {
      name: 'MedAI Research',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MedAI',
      role: 'Research Group'
    },
    framework: 'TensorFlow',
    task: 'Segmentation',
    stars: 3200,
    downloads: 15600,
    views: 38900,
    lastUpdated: '2024-01-12',
    tags: ['medical-ai', 'segmentation', 'healthcare', 'u-net'],
    complexity: 'Intermediate',
    performance: 87,
    codeAvailable: true,
    pretrained: true
  }
];

const frameworks = ['All', 'TensorFlow', 'PyTorch', 'JAX', 'ONNX', 'Other'];
const tasks = ['All', 'Classification', 'Segmentation', 'Generation', 'Detection', 'Regression', 'Reinforcement Learning'];
const complexities = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const ModelZoo: React.FC = () => {
  const [models, setModels] = useState<Model[]>(mockModels);
  const [filteredModels, setFilteredModels] = useState<Model[]>(mockModels);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('All');
  const [selectedTask, setSelectedTask] = useState('All');
  const [selectedComplexity, setSelectedComplexity] = useState('All');
  const [sortBy, setSortBy] = useState<'stars' | 'downloads' | 'views' | 'performance'>('stars');
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

  useEffect(() => {
    let result = [...models];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(model =>
        model.name.toLowerCase().includes(query) ||
        model.description.toLowerCase().includes(query) ||
        model.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply framework filter
    if (selectedFramework !== 'All') {
      result = result.filter(model => model.framework === selectedFramework);
    }

    // Apply task filter
    if (selectedTask !== 'All') {
      result = result.filter(model => model.task === selectedTask);
    }

    // Apply complexity filter
    if (selectedComplexity !== 'All') {
      result = result.filter(model => model.complexity === selectedComplexity);
    }

    // Apply sorting
    result.sort((a, b) => b[sortBy] - a[sortBy]);

    setFilteredModels(result);
  }, [searchQuery, selectedFramework, selectedTask, selectedComplexity, sortBy, models]);

  const handleModelAction = (modelId: string, action: 'star' | 'download' | 'view') => {
    setModels(prev => prev.map(model => {
      if (model.id === modelId) {
        switch (action) {
          case 'star':
            return { ...model, stars: model.stars + 1 };
          case 'download':
            return { ...model, downloads: model.downloads + 1 };
          case 'view':
            return { ...model, views: model.views + 1 };
        }
      }
      return model;
    }));
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  function handleModelSelect(model: Model): void {
    throw new Error('Function not implemented.');
  }

  function handleStarModel(id: string): void {
    throw new Error('Function not implemented.');
  }

  
  return (
    <Card className="border-gray-700 bg-gray-900/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Code className="h-6 w-6 text-blue-400" />
              Model Zoo
            </CardTitle>
            <CardDescription className="text-gray-400">
              Explore, test, and deploy pre-trained AI models from the community
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-blue-500 text-blue-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              {models.length} Models
            </Badge>
            <Button variant="outline" size="sm" className="border-gray-600">
              <Code className="h-4 w-4 mr-2" />
              Submit Model
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters and Search */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search models by name, description, or tags..."
                className="pl-10 bg-gray-800 border-gray-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="stars">Most Stars</SelectItem>
                <SelectItem value="downloads">Most Downloads</SelectItem>
                <SelectItem value="views">Most Views</SelectItem>
                <SelectItem value="performance">Best Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Filter by:</span>
            </div>
            <Select value={selectedFramework} onValueChange={setSelectedFramework}>
              <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700">
                <SelectValue placeholder="Framework" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {frameworks.map(framework => (
                  <SelectItem key={framework} value={framework}>{framework}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTask} onValueChange={setSelectedTask}>
              <SelectTrigger className="w-[160px] bg-gray-800 border-gray-700">
                <SelectValue placeholder="Task" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {tasks.map(task => (
                  <SelectItem key={task} value={task}>{task}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedComplexity} onValueChange={setSelectedComplexity}>
              <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700">
                <SelectValue placeholder="Complexity" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {complexities.map(complexity => (
                  <SelectItem key={complexity} value={complexity}>{complexity}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(selectedFramework !== 'All' || selectedTask !== 'All' || selectedComplexity !== 'All') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedFramework('All');
                  setSelectedTask('All');
                  setSelectedComplexity('All');
                }}
                className="text-gray-400 hover:text-white"
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredModels.map((model) => (
            <Card key={model.id} className="border-gray-700 bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1

">
                    <h3 className="font-semibold text-lg text-white">{model.name}</h3>
                    <p className="text-sm text-gray-400 truncate">{model.author.name}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm">{model.stars}</span>
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{model.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" className="bg-blue-900/30 text-blue-300 border-blue-800">
                    {model.framework}
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-900/30 text-purple-300 border-purple-800">
                    {model.task}
                  </Badge>
                  <Badge variant="secondary" className="bg-green-900/30 text-green-300 border-green-800">
                    {model.complexity}
                  </Badge>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-400">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      <span>{model.downloads.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{model.views.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 hover:bg-gray-700"
                      onClick={() => handleModelSelect(model)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Try
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 hover:bg-gray-700"
                      onClick={() => handleStarModel(model.id)}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Star
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredModels.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No models found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Model Details Modal */}
        <Modal
          isOpen={!!selectedModel}
          onClose={() => setSelectedModel(null)}
          title={selectedModel?.name}
          description={selectedModel ? `By ${selectedModel.author.name} • ${selectedModel.framework} • ${selectedModel.task}` : ''}
          size="xl"
          className="bg-gray-900 border-gray-700 text-white"
        >
          {selectedModel && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-gray-300">{selectedModel.description}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Architecture</h4>
                    <p className="text-gray-300">{(selectedModel as any).architecture || 'N/A'}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Performance Metrics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries((selectedModel as any).metrics || {}).map(([key, value]) => (
                        <div key={key} className="bg-gray-800/50 rounded-lg p-3">
                          <div className="text-sm text-gray-400 capitalize">{key}</div>
                          <div className="text-lg font-semibold">{String(value)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-medium mb-3">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        <Download className="h-4 w-4 mr-2" />
                        Download Model
                      </Button>
                      <Button variant="outline" className="w-full border-gray-600 hover:bg-gray-800">
                        <Code className="h-4 w-4 mr-2" />
                        View Code
                      </Button>
                      <Button variant="outline" className="w-full border-gray-600 hover:bg-gray-800">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Documentation
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-medium mb-3">Model Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Parameters</span>
                        <span>{(selectedModel as any).parameters?.toLocaleString() || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Size</span>
                        <span>{(selectedModel as any).size || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last Updated</span>
                        <span>{selectedModel.lastUpdated}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">License</span>
                        <span>{(selectedModel as any).license || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-medium mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedModel.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-gray-700/50 text-gray-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setSelectedModel(null)} className="border-gray-600">
                  Close
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Play className="h-4 w-4 mr-2" />
                  Run in Sandbox
                </Button>
              </div>
            </>
          )}
        </Modal>
      </CardContent>
    </Card>
  );
}

export default ModelZoo;
