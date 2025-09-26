
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Video, Headphones, FileText, Search, Filter, Clock, Star, Download, Play, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'audio' | 'practice' | 'course';
  phase: 'expansion' | 'contraction' | 'renewal' | 'all';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  author: string;
  rating: number;
  views: number;
  tags: string[];
  featured: boolean;
  progress?: number; // For user progress
  locked: boolean;
  premium: boolean;
  thumbnail?: string;
  createdAt: string;
}

const mockContent: ContentItem[] = [
  {
    id: '1',
    title: 'The Art of Sacred Pause: Embracing Contraction',
    description: 'Learn to honor the natural rhythm of contraction as a necessary part of authentic growth. This foundational article explores how to work with rather than against these essential phases.',
    type: 'article',
    phase: 'contraction',
    level: 'beginner',
    duration: '12 min read',
    author: 'Elena Volkov',
    rating: 4.8,
    views: 2341,
    tags: ['mindfulness', 'rest', 'integration'],
    featured: true,
    locked: false,
    premium: false,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Expansion Without Burnout: Sustainable Growth Practices',
    description: 'A comprehensive video series on navigating periods of rapid expansion while maintaining your authentic center and avoiding overwhelm.',
    type: 'video',
    phase: 'expansion',
    level: 'intermediate',
    duration: '45 min',
    author: 'Marcus Rivera',
    rating: 4.9,
    views: 1876,
    tags: ['growth', 'energy management', 'leadership'],
    featured: true,
    progress: 60,
    locked: false,
    premium: true,
    createdAt: '2024-01-20'
  },
  {
    id: '3',
    title: 'Guided Values Compass Meditation',
    description: 'A 20-minute guided meditation to help you connect with your core values and find clarity in decision-making.',
    type: 'audio',
    phase: 'all',
    level: 'beginner',
    duration: '20 min',
    author: 'Dr. Amira Hassan',
    rating: 4.7,
    views: 3521,
    tags: ['values', 'meditation', 'clarity'],
    featured: false,
    locked: false,
    premium: false,
    createdAt: '2024-01-10'
  },
  {
    id: '4',
    title: 'Renewal Rituals: Creating Sacred Transitions',
    description: 'Practical exercises and rituals for moving through renewal phases with intention and grace.',
    type: 'practice',
    phase: 'renewal',
    level: 'intermediate',
    duration: '30 min practice',
    author: 'Sarah Chen',
    rating: 4.6,
    views: 987,
    tags: ['rituals', 'transition', 'ceremony'],
    featured: false,
    locked: false,
    premium: false,
    createdAt: '2024-01-25'
  },
  {
    id: '5',
    title: 'The Complete Growth Halo Journey',
    description: 'A comprehensive 8-week course covering all aspects of the Growth Halo philosophy with practical applications.',
    type: 'course',
    phase: 'all',
    level: 'beginner',
    duration: '8 weeks',
    author: 'Growth Halo Team',
    rating: 4.9,
    views: 542,
    tags: ['comprehensive', 'philosophy', 'transformation'],
    featured: true,
    progress: 25,
    locked: false,
    premium: true,
    createdAt: '2024-01-01'
  }
];

export default function ContentPage() {
  const [content] = useState<ContentItem[]>(mockContent);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPhase, setFilterPhase] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesPhase = filterPhase === 'all' || item.phase === filterPhase || item.phase === 'all';
    const matchesLevel = filterLevel === 'all' || item.level === filterLevel;
    
    return matchesSearch && matchesType && matchesPhase && matchesLevel;
  });

  const getTabContent = () => {
    switch (activeTab) {
      case 'featured':
        return filteredContent.filter(item => item.featured);
      case 'my-content':
        return filteredContent.filter(item => item.progress !== undefined);
      case 'premium':
        return filteredContent.filter(item => item.premium);
      default:
        return filteredContent;
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Headphones className="w-4 h-4" />;
      case 'practice': return <Play className="w-4 h-4" />;
      case 'course': return <Book className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'expansion': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'contraction': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'renewal': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const ContentCard = ({ item }: { item: ContentItem }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow group">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getContentIcon(item.type)}
                <Badge variant="outline" className="text-xs">
                  {item.type}
                </Badge>
                <Badge className={`text-xs ${getPhaseColor(item.phase)}`}>
                  {item.phase}
                </Badge>
                {item.premium && (
                  <Badge variant="secondary" className="text-xs">
                    Premium
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {item.title}
              </CardTitle>
              <CardDescription className="mt-2">
                By {item.author}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium">{item.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="w-3 h-3" />
                <span>{item.views.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {item.description}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{item.duration}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {item.level}
            </Badge>
          </div>

          {/* Progress bar if user has started this content */}
          {item.progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{item.progress}%</span>
              </div>
              <Progress value={item.progress} className="h-2" />
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              {new Date(item.createdAt).toLocaleDateString()}
            </div>
            <div className="flex gap-2">
              {item.type === 'article' && (
                <Button size="sm" variant="outline">
                  <Eye className="w-3 h-3 mr-1" />
                  Read
                </Button>
              )}
              {(item.type === 'video' || item.type === 'audio') && (
                <Button size="sm" variant="outline">
                  <Play className="w-3 h-3 mr-1" />
                  Play
                </Button>
              )}
              {item.type === 'practice' && (
                <Button size="sm" variant="outline">
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              )}
              {item.type === 'course' && (
                <Button size="sm">
                  {item.progress !== undefined ? 'Continue' : 'Start Course'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Content Library</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover articles, videos, practices, and courses designed to support your Growth Halo journey
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Content Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="article">Articles</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="practice">Practices</SelectItem>
                    <SelectItem value="course">Courses</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPhase} onValueChange={setFilterPhase}>
                  <SelectTrigger>
                    <SelectValue placeholder="Growth Phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Phases</SelectItem>
                    <SelectItem value="expansion">Expansion</SelectItem>
                    <SelectItem value="contraction">Contraction</SelectItem>
                    <SelectItem value="renewal">Renewal</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterPhase('all');
                  setFilterLevel('all');
                }}>
                  <Filter className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="all">All Content</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="my-content">My Content</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {getTabContent().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getTabContent().map((item) => (
                  <ContentCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Book className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Content Found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filters</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
