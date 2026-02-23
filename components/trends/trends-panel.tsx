'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, ExternalLink, Calendar, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrendItem {
  id: string;
  title: string;
  description: string;
  category: string;
  trendDirection: 'up' | 'down' | 'stable';
  changePercentage: number;
  discussionCount: number;
  contributors: number;
  lastUpdated: string;
  tags: string[];
  isHot: boolean;
}

const mockTrends: TrendItem[] = [
  {
    id: '1',
    title: 'Transformers Multimodales',
    description: 'Modelos que procesan texto, imagen y audio simultáneamente',
    category: 'Arquitecturas',
    trendDirection: 'up',
    changePercentage: 42,
    discussionCount: 156,
    contributors: 89,
    lastUpdated: '2024-01-15',
    tags: ['NLP', 'Vision', 'Audio'],
    isHot: true
  },
  {
    id: '2',
    title: 'Fine-tuning Efficiente',
    description: 'Técnicas de adaptación con menos parámetros y datos',
    category: 'Optimización',
    trendDirection: 'up',
    changePercentage: 28,
    discussionCount: 98,
    contributors: 45,
    lastUpdated: '2024-01-14',
    tags: ['LoRA', 'QLoRA', 'PEFT'],
    isHot: true
  },
  {
    id: '3',
    title: 'Agentes Autónomos',
    description: 'Sistemas que planifican y ejecutan tareas complejas',
    category: 'Aplicaciones',
    trendDirection: 'up',
    changePercentage: 35,
    discussionCount: 203,
    contributors: 112,
    lastUpdated: '2024-01-13',
    tags: ['AutoGPT', 'BabyAGI', 'ToolUse'],
    isHot: true
  },
  {
    id: '4',
    title: 'Quantización 4-bit',
    description: 'Reducción de precisión para inferencia eficiente',
    category: 'Optimización',
    trendDirection: 'stable',
    changePercentage: 5,
    discussionCount: 76,
    contributors: 34,
    lastUpdated: '2024-01-12',
    tags: ['GPTQ', 'AWQ', 'BitsAndBytes'],
    isHot: false
  },
  {
    id: '5',
    title: 'RAG Avanzado',
    description: 'Retrieval-Augmented Generation con múltiples fuentes',
    category: 'Técnicas',
    trendDirection: 'up',
    changePercentage: 31,
    discussionCount: 134,
    contributors: 67,
    lastUpdated: '2024-01-11',
    tags: ['VectorDB', 'HybridSearch', 'ReRanking'],
    isHot: true
  }
];

const categoryColors: Record<string, string> = {
  'Arquitecturas': 'bg-blue-500/20 text-blue-400',
  'Optimización': 'bg-green-500/20 text-green-400',
  'Aplicaciones': 'bg-purple-500/20 text-purple-400',
  'Técnicas': 'bg-yellow-500/20 text-yellow-400',
  'Herramientas': 'bg-red-500/20 text-red-400'
};

const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
  switch (direction) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-green-400" />;
    case 'down':
      return <TrendingDown className="h-4 w-4 text-red-400" />;
    case 'stable':
      return <Minus className="h-4 w-4 text-yellow-400" />;
  }
};

export default function TrendsPanel() {
  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Tendencias en IA
            </CardTitle>
            <CardDescription className="text-gray-400">
              Temas más discutidos en la comunidad
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-blue-500 text-blue-400">
            En vivo
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockTrends.map((trend) => (
            <div
              key={trend.id}
              className="group p-4 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:bg-gray-800/30"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-100 group-hover:text-blue-300 transition-colors">
                      {trend.title}
                    </h3>
                    {trend.isHot && (
                      <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">
                        <Zap className="h-3 w-3 mr-1" />
                        Hot
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{trend.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className={categoryColors[trend.category]}>
                      {trend.category}
                    </Badge>
                    {trend.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="border-gray-600 text-gray-400">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{trend.contributors} contribuidores</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{trend.lastUpdated}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-1">
                        {getTrendIcon(trend.trendDirection)}
                        <span className={trend.trendDirection === 'up' ? 'text-green-400' : 
                                       trend.trendDirection === 'down' ? 'text-red-400' : 'text-yellow-400'}>
                          {trend.changePercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-100">{trend.discussionCount}</div>
                    <div className="text-xs text-gray-500">discusiones</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-gray-400 hover:text-blue-400"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Actualizado hace 5 minutos
            </div>
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:text-gray-100">
              Ver todas las tendencias
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
