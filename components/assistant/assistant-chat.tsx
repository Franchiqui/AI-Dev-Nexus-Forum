'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Sparkles, Loader2, ThumbsUp, ThumbsDown, Copy, RefreshCw, Trash2, History, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@radix-ui/react-slider';
import { toast } from 'sonner';
import { Modal } from '../ui/modal';

type MessageType = 'text' | 'system';
type MessageStatus = 'sending' | 'sent' | 'error';

interface ExtendedChatMessage {
  id: string;
  roomId: string;
  senderId?: string;
  sender?: any;
  content: string;
  type: MessageType;
  metadata?: any;
  createdAt: Date;
  status?: MessageStatus;
  likes?: number;
  dislikes?: number;
  isHelpful?: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon: React.ReactNode;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: '1',
    label: 'Explicar código',
    prompt: '¿Puedes explicar este fragmento de código de machine learning?',
    icon: <Sparkles className="h-4 w-4" />
  },
  {
    id: '2',
    label: 'Optimizar modelo',
    prompt: '¿Cómo puedo optimizar este modelo de deep learning?',
    icon: <Sparkles className="h-4 w-4" />
  },
  {
    id: '3',
    label: 'Debug error',
    prompt: 'Estoy teniendo este error en TensorFlow, ¿puedes ayudarme?',
    icon: <Sparkles className="h-4 w-4" />
  },
  {
    id: '4',
    label: 'Mejores prácticas',
    prompt: '¿Cuáles son las mejores prácticas para deployment de modelos?',
    icon: <Sparkles className="h-4 w-4" />
  }
];

const INITIAL_MESSAGES: ExtendedChatMessage[] = [
  {
    id: '1',
    content: '¡Hola! Soy tu asistente de IA para desarrollo. ¿En qué puedo ayudarte hoy? Puedo explicar conceptos, revisar código, sugerir optimizaciones y más.',
    type: 'system',
    createdAt: new Date(Date.now() - 3600000),
    roomId: 'assistant-chat',
    status: 'sent',
    likes: 24,
    dislikes: 2,
    isHelpful: true
  },
  {
    id: '2',
    content: '¿Cómo implemento un transformer desde cero en PyTorch?',
    type: 'text',
    createdAt: new Date(Date.now() - 1800000),
    roomId: 'assistant-chat',
    status: 'sent'
  },
  {
    id: '3',
    content: 'Para implementar un transformer en PyTorch, necesitas:\n\n1. **Multi-Head Attention**: Implementa el mecanismo de atención con múltiples cabezas.\n2. **Positional Encoding**: Añade información posicional a los embeddings.\n3. **Feed Forward Networks**: Capas lineales con activación ReLU.\n4. **Encoder/Decoder Blocks**: Combina atención y FFN con residual connections.\n\n¿Te gustaría que profundice en algún componente específico?',
    type: 'text',
    createdAt: new Date(Date.now() - 1200000),
    roomId: 'assistant-chat',
    status: 'sent',
    likes: 18,
    dislikes: 1,
    isHelpful: true
  }
];

export default function AssistantChat() {
  const [messages, setMessages] = useState < ExtendedChatMessage[] > (INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [modelConfig, setModelConfig] = useState({
    apiUrl: '',
    apiKey: '',
    modelName: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 1000
  });
  const scrollAreaRef = useRef < HTMLDivElement > (null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const inputRef = useRef < HTMLTextAreaElement > (null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleToggleHistory = () => {
    // TODO: Implement history toggle
    console.log('Toggle history');
  };

  const handleExportChat = () => {
    // TODO: Implement chat export
    console.log('Export chat');
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ExtendedChatMessage = {
      id: Date.now().toString(),
      content: input,
      type: 'text',
      createdAt: new Date(),
      roomId: 'assistant-chat',
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    // Simulate API call
    setTimeout(() => {
      const assistantMessage: ExtendedChatMessage = {
        id: (Date.now() + 1).toString(),
        content: generateResponse(input),
        type: 'text',
        createdAt: new Date(),
        roomId: 'assistant-chat',
        status: 'sent',
        likes: 0,
        dislikes: 0
      };

      setMessages(prev =>
        prev.map(msg =>
          msg.id === userMessage.id
            ? { ...msg, status: 'sent' as const }
            : msg
        ).concat(assistantMessage)
      );
      setIsLoading(false);
      setIsTyping(false);
    }, 1500);
  };

  const handleSendMessage = handleSend;

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  const handleLike = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? {
            ...msg,
            likes: (msg.likes || 0) + 1,
            isHelpful: true
          }
          : msg
      )
    );
  };

  const handleDislike = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? {
            ...msg,
            dislikes: (msg.dislikes || 0) + 1,
            isHelpful: false
          }
          : msg
      )
    );
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        content: '¡Hola! Soy tu asistente de IA para desarrollo. ¿En qué puedo ayudarte hoy? Puedo explicar conceptos, revisar código, sugerir optimizaciones y más.',
        type: 'system',
        createdAt: new Date(),
        roomId: 'assistant-chat',
        status: 'sent',
        likes: 0,
        dislikes: 0
      }
    ]);
  };

  const generateResponse = (userInput: string): string => {
    const inputLower = userInput.toLowerCase();

    if (inputLower.includes('transformer') || inputLower.includes('attention')) {
      return `Los transformers revolucionaron el NLP con el mecanismo de atención. Algunos puntos clave:

• **Self-Attention**: Permite que cada token atienda a todos los demás tokens en la secuencia.
• **Scaled Dot-Product Attention**: Atención escalada para estabilidad numérica.
• **Multi-Head Attention**: Múltiples cabezas de atención aprenden diferentes representaciones.
• **Positional Encoding**: Embeddings sinusoidales o aprendidas para información posicional.

¿Te interesa ver una implementación práctica o entender algún concepto específico?`;
    }

    if (inputLower.includes('pytorch') || inputLower.includes('tensorflow')) {
      return `Comparativa PyTorch vs TensorFlow:

**PyTorch**:
• Dinámico (eager execution por defecto)
• Más popular en investigación
• API más "pythonica"
• Debugging más sencillo

**TensorFlow**:
• Estático (graph mode) pero ahora con eager
• Mejor para producción
• TensorFlow Serving integrado
• TensorBoard excelente para visualización

¿Para qué tipo de proyecto necesitas elegir?`;
    }

    if (inputLower.includes('optimizar') || inputLower.includes('rendimiento')) {
      return `Para optimizar modelos de ML:

1. **Pruning**: Eliminar pesos menos importantes
2. **Quantization**: Reducir precisión (FP32 → FP16/INT8)
3. **Knowledge Distillation**: Modelo pequeño aprende de uno grande
4. **Architecture Search**: Encontrar arquitecturas eficientes
5. **Gradient Checkpointing**: Trade-off memoria/tiempo

¿Qué tipo de modelo y hardware estás usando?`;
    }

    if (inputLower.includes('error') || inputLower.includes('debug')) {
      return `Para debugging de modelos de IA:

1. **Verifica shapes**: Usa .shape en PyTorch o .shape en TF
2. **Gradient checking**: torch.autograd.gradcheck
3. **Overfitting pequeño dataset**: Si no overfittea, hay bug
4. **Visualiza activaciones**: TensorBoard o wandb
5. **Check NaN/Inf**: torch.isnan() o tf.debugging.check_numerics

¿Puedes compartir el error específico o el código?`;
    }

    return `Entiendo que preguntas sobre: "${userInput}"

Como asistente especializado en desarrollo de IA, puedo ayudarte con:

• Explicaciones de conceptos de ML/DL
• Revisión y optimización de código
• Solución de errores comunes
• Mejores prácticas de deployment
• Comparativas entre frameworks
• Arquitecturas de modelos

¿Puedes proporcionar más detalles o código específico para ayudarte mejor?`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageTime = formatTime;

  return (
    <>
      <Card className="border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 border border-blue-500/20">
                <AvatarFallback className="bg-blue-900/30 text-blue-400">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">Asistente IA</CardTitle>
                <CardDescription className="text-gray-400">
                  Asistente especializado en desarrollo de IA
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="border-green-500/30 text-green-400">
              En línea
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          {/* Quick Actions */}
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">Acciones rápidas:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map(action => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  className="text-xs border-gray-700 hover:border-blue-500/50 hover:bg-blue-500/10"
                  onClick={() => handleQuickAction(action.prompt)}
                >
                  {action.icon}
                  <span className="ml-1">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <ScrollArea
            ref={scrollAreaRef}
            className="h-[400px] rounded-lg border border-gray-800 p-4"
          >
            <div className="space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.type === 'text' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  <Avatar className={cn(
                    'h-8 w-8',
                    message.type === 'text'
                      ? 'border border-blue-500/20'
                      : 'border border-purple-500/20'
                  )}>
                    <AvatarFallback className={cn(
                      message.type === 'text'
                        ? 'bg-blue-900/30 text-blue-400'
                        : 'bg-purple-900/30 text-purple-400'
                    )}>
                      {message.type === 'text' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div className={cn(
                    'flex-1 space-y-1',
                    message.type === 'text' ? 'items-end' : 'items-start'
                  )}>
                    <div className={cn(
                      'rounded-2xl px-4 py-2 max-w-[85%]',
                      message.type === 'text'
                        ? 'bg-blue-500/20 text-blue-100 border border-blue-500/30'
                        : 'bg-gray-800/70 text-gray-100 border border-gray-700'
                    )}>
                      <p className="whitespace-pre-wrap">{message.content}</p>

                      {message.type !== 'text' && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-700/50">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs hover:bg-gray-700"
                            onClick={() => handleLike(message.id)}
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            {message.likes || 0}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs hover:bg-gray-700"
                            onClick={() => handleDislike(message.id)}
                          >
                            <ThumbsDown className="h-3 w-3 mr-1" />
                            {message.dislikes || 0}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs hover:bg-gray-700"
                            onClick={() => handleCopy(message.content)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copiar
                          </Button>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                      {formatMessageTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 border border-purple-500/20">
                    <AvatarFallback className="bg-purple-900/30 text-purple-400">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="rounded-2xl px-4 py-2 max-w-[85%] bg-gray-800/70 text-gray-100 border border-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></div>
                          <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        <span className="text-sm text-gray-400">El asistente está pensando...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-700 hover:border-blue-500/50 hover:bg-blue-500/10"
                onClick={handleClearChat}
                disabled={messages.length === 0 || isLoading}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Limpiar
              </Button>

              <div className="flex-1 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-700 hover:border-blue-500/50 hover:bg-blue-500/10"
                  onClick={handleToggleHistory}
                >
                  <History className="h-4 w-4 mr-1" />
                  Historial
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-700 hover:border-blue-500/50 hover:bg-blue-500/10"
                  onClick={handleExportChat}
                  disabled={messages.length === 0}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Exportar
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu pregunta sobre IA, desarrollo, modelos..."
                className="min-h-[80px] resize-none border-gray-700 bg-gray-900/50 focus:border-blue-500/50 focus:ring-blue-500/20"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="self-end bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>En línea</span>
                </div>
                <span>{messages.length} mensajes</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-400 hover:text-gray-300"
                  onClick={() => setIsConfigModalOpen(true)}
                >
                  Configurar Modelo
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                <span>Powered by AI-Dev Nexus</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>,

      {/* Modal de configuración del modelo */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        title="Configurar Modelo de IA"
        description="Conecta tu asistente con un modelo real mediante API"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="api-url">URL de la API *</Label>
            <Input
              id="api-url"
              value={modelConfig.apiUrl}
              onChange={(e) => setModelConfig(prev => ({ ...prev, apiUrl: e.target.value }))}
              placeholder="https://api.openai.com/v1/chat/completions"
              className="mt-1 bg-gray-800 border-gray-700"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL del endpoint de la API (OpenAI, Anthropic, Ollama, etc.)
            </p>
          </div>

          <div>
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              value={modelConfig.apiKey}
              onChange={(e) => setModelConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="sk-..."
              className="mt-1 bg-gray-800 border-gray-700"
            />
            <p className="text-xs text-gray-500 mt-1">
              Tu clave API (se almacena localmente en el navegador)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="model-name">Nombre del Modelo</Label>
              <Input
                id="model-name"
                value={modelConfig.modelName}
                onChange={(e) => setModelConfig(prev => ({ ...prev, modelName: e.target.value }))}
                placeholder="gpt-3.5-turbo"
                className="mt-1 bg-gray-800 border-gray-700"
              />
            </div>

            <div>
              <Label htmlFor="temperature">Temperatura: {modelConfig.temperature}</Label>
              <Slider
                id="temperature"
                min={0}
                max={2}
                step={0.1}
                value={[modelConfig.temperature]}
                onValueChange={(value) => setModelConfig(prev => ({ ...prev, temperature: value[0] }))}
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="max-tokens">Tokens Máximos</Label>
            <Input
              id="max-tokens"
              type="number"
              value={modelConfig.maxTokens}
              onChange={(e) => setModelConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 1000 }))}
              className="mt-1 bg-gray-800 border-gray-700"
              min="1"
              max="8000"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsConfigModalOpen(false)}
              className="border-gray-600"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (!modelConfig.apiUrl.trim()) {
                  alert('Por favor, ingresa la URL de la API');
                  return;
                }
                setIsConfigModalOpen(false);
                toast.success('Configuración guardada correctamente');
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Guardar Configuración
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

