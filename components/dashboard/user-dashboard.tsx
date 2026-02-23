'use client';

import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Code, 
  MessageSquare, 
  Star, 
  Zap,
  ChevronRight,
  Calendar,
  Target,
  Play
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserStats {
  totalPosts: number;
  totalComments: number;
  modelsPublished: number;
  challengesCompleted: number;
  collaborations: number;
  reputation: number;
  streakDays: number;
}

interface RecentActivity {
  id: string;
  type: 'post' | 'comment' | 'model' | 'challenge' | 'collaboration';
  title: string;
  timestamp: Date;
  points: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
}

interface DashboardData {
  stats: UserStats;
  recentActivities: RecentActivity[];
  achievements: Achievement[];
  level: number;
  levelProgress: number;
  nextLevelPoints: number;
}

export const useUserDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    // Verificar si está autenticado con PocketBase
    if (!pb.authStore.isValid) {
      setDashboardData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Simulación de datos de dashboard
      const mockData: DashboardData = {
        stats: {
          totalPosts: 42,
          totalComments: 156,
          modelsPublished: 3,
          challengesCompleted: 7,
          collaborations: 2,
          reputation: 1245,
          streakDays: 14,
        },
        recentActivities: [
          {
            id: '1',
            type: 'post',
            title: 'Cómo optimizar modelos de transformers',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
            points: 50,
          },
          {
            id: '2',
            type: 'model',
            title: 'Publicaste un nuevo modelo: Sentiment Analysis v2',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
            points: 100,
          },
          {
            id: '3',
            type: 'challenge',
            title: 'Completaste el reto: Image Classification',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
            points: 200,
          },
          {
            id: '4',
            type: 'comment',
            title: 'Respondiste en: Problemas con fine-tuning',
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 días atrás
            points: 25,
          },
        ],
        achievements: [
          {
            id: '1',
            name: 'Primer Post',
            description: 'Publica tu primer post en el foro',
            icon: <MessageSquare className="h-4 w-4" />,
            unlocked: true,
          },
          {
            id: '2',
            name: 'Model Master',
            description: 'Publica 3 modelos en el Model Zoo',
            icon: <Code className="h-4 w-4" />,
            unlocked: true,
            progress: 100,
          },
          {
            id: '3',
            name: 'Challenge Champion',
            description: 'Completa 10 retos',
            icon: <Target className="h-4 w-4" />,
            unlocked: false,
            progress: 70,
          },
          {
            id: '4',
            name: 'Social Butterfly',
            description: 'Participa en 5 colaboraciones',
            icon: <Users className="h-4 w-4" />,
            unlocked: false,
            progress: 40,
          },
          {
            id: '5',
            name: 'Consistency King',
            description: 'Mantén una racha de 30 días',
            icon: <Calendar className="h-4 w-4" />,
            unlocked: false,
            progress: 47,
          },
        ],
        level: 5,
        levelProgress: 75,
        nextLevelPoints: 300,
      };

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));
      setDashboardData(mockData);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos del dashboard');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Escuchar cambios en la autenticación de PocketBase
  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      fetchDashboardData();
    });
    return unsubscribe;
  }, [fetchDashboardData]);

  const refreshDashboard = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'post':
        return <MessageSquare className="h-4 w-4" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'model':
        return <Code className="h-4 w-4" />;
      case 'challenge':
        return <Target className="h-4 w-4" />;
      case 'collaboration':
        return <Users className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'post':
        return 'text-blue-400';
      case 'comment':
        return 'text-green-400';
      case 'model':
        return 'text-purple-400';
      case 'challenge':
        return 'text-yellow-400';
      case 'collaboration':
        return 'text-pink-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `Hace ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours} h`;
    } else {
      return `Hace ${diffDays} d`;
    }
  };

  return {
    dashboardData,
    loading,
    error,
    refreshDashboard,
    getActivityIcon,
    getActivityColor,
    formatTimeAgo,
    isAuthenticated: pb.authStore.isValid,
    user: pb.authStore.model,
  };
};

const UserDashboard = () => {
  const router = useRouter();
  const {
    dashboardData,
    loading,
    error,
    refreshDashboard,
    getActivityIcon,
    getActivityColor,
    formatTimeAgo,
    isAuthenticated,
    user,
  } = useUserDashboard();

  if (!isAuthenticated) {
    return (
      <Card className="border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-gray-100">Dashboard</CardTitle>
          <CardDescription className="text-gray-400">
            Inicia sesión para ver tu dashboard personalizado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 mb-4">
              Conéctate para acceder a tu progreso, estadísticas y logros
            </p>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              onClick={() => router.push('/auth/login')}
            >
              Iniciar Sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !dashboardData) {
    return (
      <Card className="border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-gray-100">Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-400 mb-4">Error al cargar el dashboard</div>
            <Button onClick={refreshDashboard} variant="outline" className="border-gray-600">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { stats, recentActivities, achievements, level, levelProgress, nextLevelPoints } = dashboardData;
  
  // Calculate total points from recent activities
  const totalPoints = recentActivities.reduce((sum, activity) => sum + activity.points, 0);
  const globalRank = 42; // Mock ranking data

  return (
    <Card className="border-gray-700 bg-gray-900/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gray-100">Tu Dashboard</CardTitle>
            <CardDescription className="text-gray-400">
              Bienvenido de nuevo, {user?.name || 'Usuario'}
            </CardDescription>
          </div>
          <Avatar>
            <AvatarImage src={user?.image || ''} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="text-gray-100 font-medium">Nivel {level}</span>
            </div>
            <span className="text-sm text-gray-400">
              {levelProgress}% • {nextLevelPoints} pts para el siguiente nivel
            </span>
          </div>
          <Progress value={levelProgress} className="h-2 bg-gray-700" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <div className="flex items-center space-x-2 mb-1">
              <MessageSquare className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-400">Posts</span>
            </div>
            <div className="text-2xl font-bold text-gray-100">{stats.totalPosts}</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <div className="flex items-center space-x-2 mb-1">
              <Code className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-400">Modelos</span>
            </div>
            <div className="text-2xl font-bold text-gray-100">{stats.modelsPublished}</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <div className="flex items-center space-x-2 mb-1">
              <Target className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-400">Retos</span>
            </div>
            <div className="text-2xl font-bold text-gray-100">{stats.challengesCompleted}</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <div className="flex items-center space-x-2 mb-1">
              <Zap className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-400">Racha</span>
            </div>
            <div className="text-2xl font-bold text-gray-100">{stats.streakDays} días</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-100 font-medium">Actividad Reciente</h3>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-100">
              Ver todo <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full bg-gray-800 ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>

<div>
                    <p className="text-sm text-gray-100">{activity.title}</p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                </div>
                {activity.points > 0 && (
                  <Badge variant="secondary" className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-blue-300">
                    +{activity.points} pts
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-gray-100 font-medium mb-3">Acciones Rápidas</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="border-gray-700 bg-gray-800/50 hover:bg-gray-800 text-gray-100 justify-start"
              onClick={() => router.push('/sandbox')}
            >
              <Play className="h-4 w-4 mr-2" />
              Sandbox
            </Button>
            <Button 
              variant="outline" 
              className="border-gray-700 bg-gray-800/50 hover:bg-gray-800 text-gray-100 justify-start"
              onClick={() => router.push('/challenges')}
            >
              <Target className="h-4 w-4 mr-2" />
              Retos
            </Button>
            <Button 
              variant="outline" 
              className="border-gray-700 bg-gray-800/50 hover:bg-gray-800 text-gray-100 justify-start"
              onClick={() => router.push('/model-zoo')}
            >
              <Code className="h-4 w-4 mr-2" />
              Model Zoo
            </Button>
            <Button 
              variant="outline" 
              className="border-gray-700 bg-gray-800/50 hover:bg-gray-800 text-gray-100 justify-start"
              onClick={() => router.push('/networking')}
            >
              <Users className="h-4 w-4 mr-2" />
              Networking
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-gray-800 pt-6">
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Puntos Totales</span>
            <span className="text-lg font-bold text-gray-100">{totalPoints} pts</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Ranking Global</span>
            <div className="flex items-center">
              <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="text-gray-100 font-medium">#{globalRank}</span>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default UserDashboard;
