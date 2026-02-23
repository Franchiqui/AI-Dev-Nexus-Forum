'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Users, MessageSquare, Calendar, MapPin, Filter, UserPlus, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface UserProfile {
  id: string;
  name: string;
  role: string;
  avatar: string;
  location: string;
  skills: string[];
  online: boolean;
  lastActive: string;
  mutualConnections: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'virtual' | 'in-person';
  attendees: number;
  maxAttendees: number;
  location?: string;
  link?: string;
}

interface ConnectionRequest {
  id: string;
  fromUser: Omit<UserProfile, 'mutualConnections'>;
  message: string;
  timestamp: string;
}

export default function NetworkingSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('people');
  const [users, setUsers] = useState<UserProfile[]>([
    {
      id: '1',
      name: 'Alex Chen',
      role: 'ML Engineer @ Google',
      avatar: '/avatars/alex.jpg',
      location: 'San Francisco, CA',
      skills: ['TensorFlow', 'PyTorch', 'Computer Vision'],
      online: true,
      lastActive: 'Just now',
      mutualConnections: 5
    },
    {
      id: '2',
      name: 'Maria Rodriguez',
      role: 'AI Researcher @ OpenAI',
      avatar: '/avatars/maria.jpg',
      location: 'Remote',
      skills: ['NLP', 'Transformers', 'RL'],
      online: false,
      lastActive: '2 hours ago',
      mutualConnections: 3
    },
    {
      id: '3',
      name: 'David Kim',
      role: 'Data Scientist @ Netflix',
      avatar: '/avatars/david.jpg',
      location: 'New York, NY',
      skills: ['Recommendation Systems', 'Big Data', 'Python'],
      online: true,
      lastActive: 'Just now',
      mutualConnections: 8
    },
    {
      id: '4',
      name: 'Sarah Johnson',
      role: 'AI Product Manager @ Microsoft',
      avatar: '/avatars/sarah.jpg',
      location: 'Seattle, WA',
      skills: ['Product Strategy', 'MLOps', 'Team Leadership'],
      online: true,
      lastActive: '30 min ago',
      mutualConnections: 2
    },
    {
      id: '5',
      name: 'James Wilson',
      role: 'Deep Learning Specialist',
      avatar: '/avatars/james.jpg',
      location: 'Austin, TX',
      skills: ['Neural Networks', 'GANs', 'CUDA'],
      online: false,
      lastActive: '1 day ago',
      mutualConnections: 4
    }
  ]);

  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'AI Ethics Roundtable',
      description: 'Discussion on ethical AI development and deployment',
      date: '2024-01-15',
      time: '14:00 PST',
      type: 'virtual',
      attendees: 45,
      maxAttendees: 100,
      link: 'https://meet.google.com/abc-defg-hij'
    },
    {
      id: '2',
      title: 'MLOps Workshop',
      description: 'Hands-on workshop on ML pipeline deployment',
      date: '2024-01-20',
      time: '10:00 EST',
      type: 'in-person',
      attendees: 28,
      maxAttendees: 50,
      location: 'San Francisco Tech Hub'
    },
    {
      id: '3',
      title: 'Startup Pitch Night',
      description: 'AI startups pitch to investors and peers',
      date: '2024-01-25',
      time: '18:00 GMT',
      type: 'virtual',
      attendees: 120,
      maxAttendees: 200,
      link: 'https://zoom.us/j/123456789'
    }
  ]);

  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([
    {
      id: '1',
      fromUser: {
        id: '6',
        name: 'Lisa Wang',
        role: 'AI Research Scientist',
        avatar: '/avatars/lisa.jpg',
        location: 'Boston, MA',
        skills: ['Reinforcement Learning', 'Robotics'],
        online: true,
        lastActive: 'Just now'
      },
      message: 'Interested in collaborating on your RL project',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      fromUser: {
        id: '7',
        name: 'Michael Brown',
        role: 'ML Infrastructure Engineer',
        avatar: '/avatars/michael.jpg',
        location: 'Remote',
        skills: ['Kubernetes', 'Docker', 'AWS'],
        online: false,
        lastActive: '5 hours ago'
      },
      message: 'Loved your recent article on MLOps best practices',
      timestamp: '1 day ago'
    }
  ]);

  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>(users);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(events);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
      setFilteredEvents(events);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query) ||
      user.skills.some(skill => skill.toLowerCase().includes(query)) ||
      user.location.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);

    const filteredEvts = events.filter(event =>
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      event.type.toLowerCase().includes(query)
    );
    setFilteredEvents(filteredEvts);
  }, [searchQuery, users, events]);

  const handleConnect = (userId: string) => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, online: true } : user
    ));
  };

  const handleIgnoreRequest = (requestId: string) => {
    setConnectionRequests(prev => prev.filter(req => req.id !== requestId));
  };

  const handleAcceptRequest = (requestId: string) => {
    const request = connectionRequests.find(req => req.id === requestId);
    if (request) {
      const newUser: UserProfile = {
        ...request.fromUser,
        mutualConnections: 1,
        online: request.fromUser.online
      };
      setUsers(prev => [...prev, newUser]);
      handleIgnoreRequest(requestId);
    }
  };

  const handleJoinEvent = (eventId: string) => {
    setEvents(prev => prev.map(event =>
      event.id === eventId && event.attendees < event.maxAttendees
        ? { ...event, attendees: event.attendees + 1 }
        : event
    ));
  };

  return (
    <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              Networking
            </CardTitle>
            <CardDescription>
              Conecta con profesionales de IA y participa en eventos
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-800">
            {users.filter(u => u.online).length} en línea
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar personas, eventos o habilidades..."
              className="pl-10 bg-gray-800/50 border-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 bg-gray-800/50">
              <TabsTrigger value="people" className="data-[state=active]:bg-gray-700">
                Personas
              </TabsTrigger>
              <TabsTrigger value="events" className="data-[state=active]:bg-gray-700">
                Eventos
              </TabsTrigger>
              <TabsTrigger value="requests" className="data-[state=active]:bg-gray-700">
                Solicitudes
                {connectionRequests.length > 0 && (
                  <Badge className="ml-2 bg-blue-500">{connectionRequests.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="people" className="space-y-4 mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          {user.online && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{user.name}</h4>
                            {user.online && (
                              <Badge variant="outline" className="text-xs bg-green-900/20 text-green-400 border-green-800">
                                En línea
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">{user.role}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="h-3 w-3" />
                            <span className="text-xs text-gray-500">{user.location}</span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-blue-400">{user.mutualConnections} conexiones en común</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {user.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs bg-gray-700/50">
                                {skill}
                              </Badge>
                            ))}
                            {user.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{user.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleConnect(user.id)}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Conectar
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="events" className="space-y-4 mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {filteredEvents.map((event) => (
                    <Card key={event.id} className="bg-gray-800/30 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold mb-2">{event.title}</h4>
                            <p className="text-sm text-gray-400 mb-3">{event.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span>{event.date} • {event.time}</span>
                              </div>
                              <Badge variant={event.type === 'virtual' ? 'outline' : 'default'}
                                className={event.type === 'virtual' 
                                  ? 'bg-purple-900/20 text-purple-400 border-purple-800' 
                                  : 'bg-green-900/20 text-green-400 border-green-800'
                                }
                              >
                                {event.type === 'virtual' ? 'Virtual' : 'Presencial'}
                              </Badge>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                                <MapPin className="h-4 w-4" />
                                {event.location}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className="bg-blue-900/20 text-blue-400 border-blue-800">
                              {event.attendees} participantes
                            </Badge>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <Calendar className="h-4 w-4 mr-2" />
                              Asistir
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="requests" className="space-y-4 mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {connectionRequests.map((request) => (
                    <Card key={request.id} className="bg-gray-800/30 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarImage src={request.fromUser.avatar} alt={request.fromUser.name} />
                            <AvatarFallback>{request.fromUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">{request.fromUser.name}</h4>
                                <p className="text-sm text-gray-400">{request.fromUser.role}</p>
                              </div>
                              <span className="text-xs text-gray-500">{request.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-300 mb-3">{request.message}</p>
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleAcceptRequest(request.id)}>
                                Aceptar
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleIgnoreRequest(request.id)}>
                                Ignorar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
