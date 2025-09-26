
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, Star, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

interface Event {
  id: string;
  title: string;
  description: string;
  type: 'retreat' | 'workshop' | 'webinar' | 'circle';
  date: string;
  time: string;
  location: string;
  facilitator: string;
  capacity: number;
  enrolled: number;
  price: number;
  phase: 'expansion' | 'contraction' | 'renewal' | 'all';
  level: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  tags: string[];
  featured: boolean;
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Digital Detox & Inner Renewal Retreat',
    description: 'A 3-day immersive experience focusing on disconnecting from digital overwhelm and reconnecting with your authentic self through the Growth Halo philosophy.',
    type: 'retreat',
    date: '2024-02-15',
    time: '09:00',
    location: 'Mountain Vista Retreat Center, Colorado',
    facilitator: 'Sarah Chen',
    capacity: 20,
    enrolled: 15,
    price: 450,
    phase: 'renewal',
    level: 'beginner',
    rating: 4.9,
    tags: ['mindfulness', 'digital wellness', 'nature'],
    featured: true
  },
  {
    id: '2',
    title: 'Expansion Phase Mastery Workshop',
    description: 'Learn to navigate periods of rapid growth and expansion while maintaining balance and authenticity.',
    type: 'workshop',
    date: '2024-02-08',
    time: '18:00',
    location: 'Virtual',
    facilitator: 'Marcus Rivera',
    capacity: 50,
    enrolled: 32,
    price: 75,
    phase: 'expansion',
    level: 'intermediate',
    rating: 4.7,
    tags: ['growth', 'career', 'leadership'],
    featured: false
  },
  {
    id: '3',
    title: 'Values Compass Deep Dive',
    description: 'An intensive session to discover and align with your core values using the Growth Halo Values Compass methodology.',
    type: 'webinar',
    date: '2024-02-12',
    time: '19:30',
    location: 'Virtual',
    facilitator: 'Dr. Amira Hassan',
    capacity: 100,
    enrolled: 78,
    price: 25,
    phase: 'all',
    level: 'beginner',
    rating: 4.8,
    tags: ['values', 'purpose', 'clarity'],
    featured: true
  },
  {
    id: '4',
    title: 'Contraction as Sacred Pause Circle',
    description: 'A supportive circle for those in contraction phases, focusing on integration, rest, and inner wisdom.',
    type: 'circle',
    date: '2024-02-10',
    time: '15:00',
    location: 'Community Center, Portland',
    facilitator: 'Elena Volkov',
    capacity: 12,
    enrolled: 8,
    price: 0,
    phase: 'contraction',
    level: 'beginner',
    rating: 5.0,
    tags: ['support', 'community', 'integration'],
    featured: false
  }
];

export default function EventsPage() {
  const [events] = useState<Event[]>(mockEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPhase, setFilterPhase] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('upcoming');

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesPhase = filterPhase === 'all' || event.phase === filterPhase || event.phase === 'all';
    
    return matchesSearch && matchesType && matchesPhase;
  });

  const featuredEvents = filteredEvents.filter(event => event.featured);
  const upcomingEvents = filteredEvents.filter(event => !event.featured);

  const EventCard = ({ event }: { event: Event }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
              <CardDescription className="mt-2">{event.facilitator}</CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className="text-xs">
                {event.type}
              </Badge>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium">{event.rating}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {event.description}
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>{event.enrolled}/{event.capacity} enrolled</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {event.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-lg font-semibold">
              {event.price === 0 ? 'Free' : `$${event.price}`}
            </div>
            <Button 
              size="sm"
              disabled={event.enrolled >= event.capacity}
            >
              {event.enrolled >= event.capacity ? 'Full' : 'Register'}
            </Button>
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
          <h1 className="text-4xl font-bold mb-4">Events & Retreats</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform together through immersive experiences designed around the Growth Halo philosophy
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="retreat">Retreats</SelectItem>
                    <SelectItem value="workshop">Workshops</SelectItem>
                    <SelectItem value="webinar">Webinars</SelectItem>
                    <SelectItem value="circle">Circles</SelectItem>
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
                }}>
                  <Filter className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Events Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
          </TabsList>

          <TabsContent value="featured">
            {featuredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Featured Events</h3>
                  <p className="text-muted-foreground">Check back soon for featured events</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="upcoming">
            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Events Found</h3>
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
