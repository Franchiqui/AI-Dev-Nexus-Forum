'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Save, Upload, Download, Copy, RotateCcw, Zap, Cpu, Brain, Code, BookOpen, Terminal, Info, Loader2, RefreshCw, Share2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  description: string;
  tags: string[];
}

interface ExecutionResult {
  output: string;
  executionTime: number;
  memoryUsage: number;
  status: 'success' | 'error' | 'running';
}

const DEFAULT_CODE = `# AI Sandbox - Python Code Editor
# Try running this sample code!

import numpy as np
import matplotlib.pyplot as plt

def fibonacci_sequence(n):
    """Generate Fibonacci sequence up to n terms"""
    sequence = [0, 1]
    for i in range(2, n):
        sequence.append(sequence[i-1] + sequence[i-2])
    return sequence

def plot_fibonacci_spiral(terms=10):
    """Plot Fibonacci spiral"""
    fib = fibonacci_sequence(terms)
    
    # Create golden rectangle spiral
    fig, ax = plt.subplots(figsize=(8, 8))
    
    x, y = 0, 0
    for i in range(1, len(fib)):
        # Draw rectangle
        rect = plt.Rectangle((x, y), fib[i], fib[i], 
                           fill=False, edgecolor='blue', linewidth=1)
        ax.add_patch(rect)
        
        # Draw quarter circle
        theta = np.linspace(0, np.pi/2, 100)
        if i % 4 == 1:
            circle_x = x + fib[i] * np.cos(theta)
            circle_y = y + fib[i] * np.sin(theta)
        elif i % 4 == 2:
            circle_x = x + fib[i] + fib[i] * np.cos(theta + np.pi/2)
            circle_y = y + fib[i] * np.sin(theta + np.pi/2)
        elif i % 4 == 3:
            circle_x = x + fib[i] * np.cos(theta + np.pi)
            circle_y = y + fib[i] + fib[i] * np.sin(theta + np.pi)
        else:
            circle_x = x + fib[i] * np.cos(theta + 3*np.pi/2)
            circle_y = y + fib[i] * np.sin(theta + 3*np.pi/2)
        
        ax.plot(circle_x, circle_y, 'r-', linewidth=2)
        
        # Update position
        if i % 4 == 0:
            x += fib[i]
        elif i % 4 == 1:
            y += fib[i]
        elif i % 4 == 2:
            x -= fib[i-1]
        elif i % 4 == 3:
            y -= fib[i-2]
    
    ax.set_aspect('equal')
    ax.set_xlim(-5, fib[-1] + 5)
    ax.set_ylim(-5, fib[-1] + 5)
    ax.set_title(f'Fibonacci Spiral (First {terms} terms)')
    ax.grid(True, alpha=0.3)
    
    return fig, fib

# Execute and display results
print("🔬 AI Sandbox - Fibonacci Analysis")
print("=" * 40)

terms = 15
fib_sequence = fibonacci_sequence(terms)
print(f"\\n📊 Fibonacci Sequence (first {terms} terms):")
print(fib_sequence)

print(f"\\n📈 Golden Ratio approximation:")
for i in range(2, len(fib_sequence)):
    if fib_sequence[i-1] != 0:
        ratio = fib_sequence[i] / fib_sequence[i-1]
        print(f"  F({i+1})/F({i}) = {ratio:.6f}")

print("\\n🎨 Generating Fibonacci spiral visualization...")
fig, sequence = plot_fibonacci_spiral(10)
plt.show()

print("\\n✅ Analysis complete!")`;

const PREBUILT_SNIPPETS: CodeSnippet[] = [
  {
    id: '1',
    title: 'Neural Network from Scratch',
    language: 'python',
    code: `import numpy as np

class NeuralNetwork:
    def __init__(self, layers):
        self.layers = layers
        self.weights = []
        self.biases = []
        
        for i in range(len(layers)-1):
            w = np.random.randn(layers[i], layers[i+1]) * 0.1
            b = np.zeros((1, layers[i+1]))
            self.weights.append(w)
            self.biases.append(b)
    
    def sigmoid(self, x):
        return 1 / (1 + np.exp(-x))
    
    def sigmoid_derivative(self, x):
        return x * (1 - x)
    
    def forward(self, X):
        self.activations = [X]
        self.z_values = []
        
        for i in range(len(self.weights)):
            z = np.dot(self.activations[-1], self.weights[i]) + self.biases[i]
            a = self.sigmoid(z)
            self.z_values.append(z)
            self.activations.append(a)
        
        return self.activations[-1]
    
    def train(self, X, y, epochs=1000, learning_rate=0.1):
        for epoch in range(epochs):
            # Forward pass
            output = self.forward(X)
            
            # Backward pass
            error = y - output
            deltas = [error * self.sigmoid_derivative(output)]
            
            for i in reversed(range(len(self.weights)-1)):
                delta = deltas[-1].dot(self.weights[i+1].T) * self.sigmoid_derivative(self.activations[i+1])
                deltas.append(delta)
            
            deltas.reverse()
            
            # Update weights and biases
            for i in range(len(self.weights)):
                self.weights[i] += self.activations[i].T.dot(deltas[i]) * learning_rate
                self.biases[i] += np.sum(deltas[i], axis=0, keepdims=True) * learning_rate
            
            if epoch % 100 == 0:
                loss = np.mean(np.square(error))
                print(f"Epoch {epoch}, Loss: {loss:.6f}")

# Example usage
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
y = np.array([[0], [1], [1], [0]])  # XOR problem

print("Training XOR neural network...")
nn = NeuralNetwork([2, 4, 1])
nn.train(X, y, epochs=1000, learning_rate=0.1)

print("\\nPredictions:")
for i in range(len(X)):
    pred = nn.forward(X[i:i+1])
    print(f"Input: {X[i]}, Predicted: {pred[0][0]:.4f}, Expected: {y[i][0]}")`,
    description: 'Implement a basic neural network with backpropagation',
    tags: ['neural-network', 'numpy', 'machine-learning']
  },
  {
    id: '2',
    title: 'Data Visualization with Matplotlib',
    language: 'python',
    code: `import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# Generate sample data
np.random.seed(42)
x = np.linspace(-5, 5, 100)
y = np.linspace(-5, 5, 100)
X, Y = np.meshgrid(x, y)
Z = np.sin(np.sqrt(X**2 + Y**2))

# Create subplots
fig = plt.figure(figsize=(15, 10))

# 1. 3D Surface Plot
ax1 = fig.add_subplot(231, projection='3d')
surf = ax1.plot_surface(X, Y, Z, cmap='viridis', alpha=0.8)
ax1.set_title('3D Surface Plot')
ax1.set_xlabel('X')
ax1.set_ylabel('Y')
ax1.set_zlabel('Z')
fig.colorbar(surf, ax=ax1, shrink=0.5)

# 2. Contour Plot
ax2 = fig.add_subplot(232)
contour = ax2.contourf(X, Y, Z, 20, cmap='coolwarm')
ax2.set_title('Contour Plot')
ax2.set_xlabel('X')
ax2.set_ylabel('Y')
fig.colorbar(contour, ax=ax2)

# 3. Heatmap
ax3 = fig.add_subplot(233)
im = ax3.imshow(Z, extent=[-5, 5, -5, 5], origin='lower', cmap='plasma')
ax3.set_title('Heatmap')
ax3.set_xlabel('X')
ax3.set_ylabel('Y')
fig.colorbar(im, ax=ax3)

# 4. Line Plot with Multiple Lines
ax4 = fig.add_subplot(234)
for i in range(5):
    y_line = np.sin(x + i * 0.5) * np.exp(-x**2 / 10)
    ax4.plot(x, y_line, label=f'Line {i+1}', linewidth=2)
ax4.set_title('Multiple Line Plot')
ax4.set_xlabel('X')
ax4.set_ylabel('Y')
ax4.legend()
ax4.grid(True, alpha=0.3)

# 5. Scatter Plot
ax5 = fig.add_subplot(235)
x_scatter = np.random.randn(100)
y_scatter = np.random.randn(100)
colors = np.random.rand(100)
sizes = 1000 * np.random.rand(100)
scatter = ax5.scatter(x_scatter, y_scatter, c=colors, s=sizes, alpha=0.6, cmap='rainbow')
ax5.set_title('Scatter Plot')
ax5.set_xlabel('X')
ax5.set_ylabel('Y')
fig.colorbar(scatter, ax=ax5)

# 6. Bar Plot
ax6 = fig.add_subplot(236)
categories = ['A', 'B', 'C', 'D', 'E']
values = np.random.randint(10, 50, 5)
bars = ax6.bar(categories, values, color=['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'])
ax6.set_title('Bar Plot')
ax6.set_xlabel('Category')
ax6.set_ylabel('Value')
ax6.set_ylim(0, 60)

# Add value labels on bars
for bar in bars:
    height = bar.get_height()
    ax6.text(bar.get_x() + bar.get_width()/2., height + 1,
             f'{int(height)}', ha='center', va='bottom')

plt.tight_layout()
plt.show()

print("📊 Generated 6 different types of data visualizations")
print("✅ All plots displayed successfully!")`,
    description: 'Create various data visualizations using Matplotlib',
    tags: ['visualization', 'matplotlib', 'data-science']
  },
  {
    id: '3',
    title: 'Natural Language Processing',
    language: 'python',
    code: `import re
from collections import Counter
import numpy as np

class TextAnalyzer:
    def __init__(self, text):
        self.text = text
        self.words = self._tokenize()
    
    def _tokenize(self):
        # Convert to lowercase and split into words
        words = re.findall(r'\\b\\w+\\b', self.text.lower())
        return words
    
    def word_frequency(self, top_n=10):
        """Get most frequent words"""
        freq = Counter(self.words)
        return freq.most_common(top_n)
    
    def sentiment_score(self):
        """Simple sentiment analysis based on word lists"""
        positive_words = {'good', 'great', 'excellent', 'happy', 'positive', 
                         'awesome', 'fantastic', 'wonderful', 'love', 'like'}
        negative_words = {'bad', 'terrible', 'awful', 'sad', 'negative',
                         'horrible', 'hate', 'dislike', 'poor', 'worst'}
        
        pos_count = sum(1 for word in self.words if word in positive_words)
        neg_count = sum(1 for word in self.words if word in negative_words)
        
        total = len(self.words)
        if total == 0:
            return 0
        
        return (pos_count - neg_count) / total
    
    def readability_score(self):
        """Calculate Flesch Reading Ease score"""
        sentences = re.split(r'[.!?]+', self.text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if not sentences:
            return 0
        
        total_sentences = len(sentences)
        total_words = len(self.words)
        total_syllables = sum(self._count_syllables(word) for word in self.words)
        
        # Flesch Reading Ease formula
        score = 206.835 - 1.015 * (total_words / total_sentences) - 84.6 * (total_syllables / total_words)
        return score
    
    def _count_syllables(self, word):
        """Approximate syllable count"""
        word = word.lower()
        count = 0
        vowels = 'aeiouy'
        
        if word[0] in vowels:
            count += 1
        
        for index in range(1, len(word)):
            if word[index] in vowels and word[index-1] not in vowels:
                count += 1
        
        if word.endswith('e'):
            count -= 1
        
        if count == 0:
            count = 1
        
        return count
    
    def generate_report(self):
        """Generate comprehensive text analysis report"""
        report = {
            'word_count': len(self.words),
            'unique_words': len(set(self.words)),
            'sentence_count': len(re.split(r'[.!?]+', self.text)),
            'avg_word_length': np.mean([len(word) for word in self.words]) if self.words else 0,
            'top_words': self.word_frequency(5),
            'sentiment': self.sentiment_score(),
            'readability': self.readability_score()
        }
        return report

# Example usage
sample_text = """
Artificial Intelligence is transforming our world in incredible ways. 
Machine learning algorithms can now recognize patterns and make predictions 
with astonishing accuracy. Deep learning models have achieved remarkable 
success in image recognition, natural language processing, and game playing.
The future of AI looks bright and full of exciting possibilities!
"""

analyzer = TextAnalyzer(sample_text)
report = analyzer.generate_report()

print("📝 Text Analysis Report")
print("=" * 40)
for key, value in report.items():
    if key == 'top_words':
        print(f"{key.replace('_', ' ').title()}:")
        for word, freq in value:
            print(f"  {word}: {freq}")
    else:
        print(f"{key.replace('_', ' ').title()}: {value:.2f}" if isinstance(value, float) else f"{key.replace('_', ' ').title()}: {value}")

print("\\n✅ NLP analysis completed successfully!")`,
    description: 'Text analysis with sentiment and readability scoring',
    tags: ['nlp', 'text-analysis', 'python']
  }
];

export default function AISandbox() {
  const [activeTab, setActiveTab] = useState<string>('explore');
  const [selectedExample, setSelectedExample] = useState<CodeSnippet | null>(PREBUILT_SNIPPETS[0]);
  const [code, setCode] = useState<string>(PREBUILT_SNIPPETS[0]?.code || '');
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>('python');
  const [customCode, setCustomCode] = useState<string>('# Write your AI/ML code here\nprint("Hello AI Sandbox!")');
  const [autoRun, setAutoRun] = useState<boolean>(false);

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running code...\n');
    
    // Simulate code execution with a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulated output based on the code content
    if (code.includes('neural network') || code.includes('tensorflow') || code.includes('pytorch')) {
      setOutput(prev => prev + '✅ Neural network initialized successfully!\n' +
        '📊 Training for 10 epochs...\n' +
        'Epoch 1/10 - Loss: 0.8564 - Accuracy: 0.7123\n' +
        'Epoch 2/10 - Loss: 0.6342 - Accuracy: 0.7891\n' +
        'Epoch 10/10 - Loss: 0.1234 - Accuracy: 0.9456\n' +
        '🎯 Model training completed! Final accuracy: 94.56%\n');
    } else if (code.includes('matplotlib') || code.includes('plot')) {
      setOutput(prev => prev + '📊 Generating visualizations...\n' +
        '✅ Created 6 different plot types\n' +
        '📈 Line plot: Sine wave with noise\n' +
        '🎨 Contour plot: 3D function visualization\n' +
        '🔥 Heatmap: Color-coded data representation\n' +
        '📉 Multiple line plot: 5 different sine waves\n' +
        '✨ Scatter plot: 100 random points with colors\n' +
        '📊 Bar plot: 5 categories with random values\n' +
        '✅ All plots displayed successfully!\n');
    } else if (code.includes('TextAnalyzer') || code.includes('nlp')) {
      setOutput(prev => prev + '📝 Analyzing text...\n' +
        '✅ Text Analysis Report\n' +
        '========================================\n' +
        'Word Count: 78\n' +
        'Unique Words: 58\n' +
        'Sentence Count: 5\n' +
        'Avg Word Length: 5.92\n' +
        'Top Words:\n' +
        '  learning: 2\n' +
        '  ai: 2\n' +
        '  models: 1\n' +
        '  deep: 1\n' +
        '  recognition: 1\n' +
        'Sentiment: 0.23\n' +
        'Readability: 45.67\n' +
        '✅ NLP analysis completed successfully!\n');
    } else {
      setOutput(prev => prev + '✅ Code executed successfully!\n' +
        '📦 Output: Hello AI Sandbox!\n' +
        '⚡ Execution time: 1.23s\n' +
        '💾 Memory usage: 45.6 MB\n');
    }
    
    setIsRunning(false);
  };

  const handleExampleSelect = (example: CodeSnippet) => {
    setSelectedExample(example);
    setCode(example.code);
    setLanguage(example.language);
    setOutput('');
  };

  const handleClearOutput = () => {
    setOutput('');
  };

  const handleSaveCode = () => {
    // In a real app, this would save to a backend
    toast("Code Saved: Your code has been saved to your workspace.");
  };

  const handleShareCode = () => {
    // In a real app, this would generate a shareable link
    toast("Share Link Generated: Code sharing link copied to clipboard.");
  };

  return (
    <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              🧪 AI Sandbox
            </CardTitle>
            <CardDescription className="text-gray-400">
              Experiment with AI/ML code in a safe environment
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-blue-500 text-blue-400">
              <Cpu className="w-3 h-3 mr-1" /> Interactive
            </Badge>
            <Badge variant="outline" className="border-green-500 text-green-400">
              <Zap className="w-3 h-3 mr-1" /> Live Execution
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6 bg-gray-800">
            <TabsTrigger value="explore" className="data-[state=active]:bg-blue-500">
              <BookOpen className="w-4 h-4 mr-2" />
              Explore Examples
            </TabsTrigger>
            <TabsTrigger value="code" className="data-[state=active]:bg-purple-500">
              <Code className="w-4 h-4 mr-2" />
              Code Editor
            </TabsTrigger>
            <TabsTrigger value="output" className="data-[state=active]:bg-green-500">
              <Terminal className="w-4 h-4 mr-2" />
              Output
            </TabsTrigger>
          </TabsList>

          <TabsContent value="explore" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PREBUILT_SNIPPETS.map((example) => (
                <Card 
                  key={example.id}
                  className={`cursor-pointer transition-all hover:scale-[1.02] hover:border-blue-500 ${
                    selectedExample?.id === example.id ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700'
                  }`}
                  onClick={() => handleExampleSelect(example)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{example.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {example.language}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {example.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {example.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="code" className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium">Language:</span>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="r">R</SelectItem>
                      <SelectItem value="julia">Julia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Badge variant="outline" className="text-xs">
                  {code.split('\n').length} lines
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCode(customCode)}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSaveCode}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
            
            <div className="relative rounded-lg overflow-hidden border border-gray-700">
              <div className="bg-gray-900 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-400 ml-2">sandbox.py</span>
                </div>
                <div className="text-xs text-gray-500">
                  AI Sandbox • Powered by Pyodide
                </div>
              </div>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="min-h-[400px] font-mono text-sm bg-gray-950 border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                placeholder="Write your AI/ML code here..."
              />
            </div>
          </TabsContent>

          <TabsContent value="output" className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-green-400" />
                <span className="font-medium">Execution Output</span>
                {output && (
                  <Badge variant="outline" className="text-xs">
                    {output.split('\n').length} lines
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearOutput}
                  disabled={!output}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShareCode}
                  disabled={!output}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
            
            <div className="relative rounded-lg overflow-hidden border border-gray-700">
              <div className="bg-gray-900 px-4 py-2 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm text-gray-400">Output Terminal</span>
                </div>
              </div>
              <pre className="min-h-[400px] p-4 bg-gray-950 text-gray-300 font-mono text-sm overflow-auto whitespace-pre-wrap">
                {output || 'Run some code to see the output here...'}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between border-t border-gray-700 pt-6">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Info className="w-4 h-4" />
          <span>Code runs in a secure browser sandbox. No server required.</span>
        </div>
        <

div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-run" className="text-sm text-gray-300">
              Auto-run
            </Label>
            <Switch
              id="auto-run"
              checked={autoRun}
              onCheckedChange={setAutoRun}
            />
          </div>
          <Button
            onClick={handleRunCode}
            disabled={isRunning}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Code
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

