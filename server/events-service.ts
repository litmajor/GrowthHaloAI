
import { storage } from './storage';

export interface Event {
  id: string;
  title: string;
  description: string;
  eventType: 'workshop' | 'retreat' | 'webinar' | 'circle_gathering';
  facilitatorId: string;
  facilitatorName: string;
  startDate: Date;
  endDate: Date;
  location: string; // Virtual or physical address
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  tags: string[];
  requirements?: string[];
  materials?: string[];
  approved: boolean;
  createdAt: Date;
}

export interface EventRegistration {
  id: string;
  userId: string;
  eventId: string;
  registrationDate: Date;
  paymentStatus: 'pending' | 'completed' | 'failed';
  specialRequests?: string;
}

export class EventsService {
  async createEvent(facilitatorId: string, eventData: Partial<Event>): Promise<Event> {
    try {
      const event: Event = {
        id: Date.now().toString(),
        title: eventData.title || '',
        description: eventData.description || '',
        eventType: eventData.eventType || 'workshop',
        facilitatorId,
        facilitatorName: eventData.facilitatorName || 'Unknown Facilitator',
        startDate: eventData.startDate || new Date(),
        endDate: eventData.endDate || new Date(),
        location: eventData.location || 'Virtual',
        maxParticipants: eventData.maxParticipants || 20,
        currentParticipants: 0,
        price: eventData.price || 0,
        tags: eventData.tags || [],
        requirements: eventData.requirements || [],
        materials: eventData.materials || [],
        approved: false, // Requires approval
        createdAt: new Date()
      };

      await storage.execute(`
        INSERT INTO events (id, title, description, event_type, facilitator_id, facilitator_name, 
                           start_date, end_date, location, max_participants, price, tags, approved)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [event.id, event.title, event.description, event.eventType, event.facilitatorId,
          event.facilitatorName, event.startDate, event.endDate, event.location,
          event.maxParticipants, event.price, JSON.stringify(event.tags), event.approved]);

      return event;
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error('Failed to create event');
    }
  }

  async getUpcomingEvents(filters: {
    eventType?: string;
    location?: string;
    priceRange?: [number, number];
    tags?: string[];
  } = {}): Promise<Event[]> {
    try {
      // Mock events for development
      return [
        {
          id: '1',
          title: 'Growth Halo Retreat: Renewal Phase',
          description: 'A 3-day intensive retreat focused on the renewal phase of growth',
          eventType: 'retreat',
          facilitatorId: 'facilitator-1',
          facilitatorName: 'Dr. Sarah Chen',
          startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000),
          location: 'Mountain View Retreat Center, CA',
          maxParticipants: 25,
          currentParticipants: 12,
          price: 899,
          tags: ['renewal', 'retreat', 'mindfulness'],
          requirements: ['Basic Growth Halo understanding'],
          materials: ['Journal', 'Comfortable clothing'],
          approved: true,
          createdAt: new Date()
        },
        {
          id: '2',
          title: 'Virtual Values Compass Workshop',
          description: 'Interactive workshop to discover and align with your core values',
          eventType: 'workshop',
          facilitatorId: 'facilitator-2',
          facilitatorName: 'Michael Torres',
          startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
          location: 'Virtual (Zoom)',
          maxParticipants: 50,
          currentParticipants: 28,
          price: 49,
          tags: ['values', 'workshop', 'virtual'],
          requirements: [],
          materials: ['Workbook (provided)', 'Pen/pencil'],
          approved: true,
          createdAt: new Date()
        }
      ];
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      return [];
    }
  }

  async registerForEvent(userId: string, eventId: string, specialRequests?: string): Promise<boolean> {
    try {
      const event = await this.getEventById(eventId);
      if (!event) throw new Error('Event not found');
      if (event.currentParticipants >= event.maxParticipants) {
        throw new Error('Event is full');
      }

      const registration: EventRegistration = {
        id: Date.now().toString(),
        userId,
        eventId,
        registrationDate: new Date(),
        paymentStatus: event.price > 0 ? 'pending' : 'completed',
        specialRequests
      };

      await storage.execute(`
        INSERT INTO event_registrations (id, user_id, event_id, registration_date, payment_status, special_requests)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [registration.id, registration.userId, registration.eventId, 
          registration.registrationDate, registration.paymentStatus, registration.specialRequests]);

      // Update participant count
      await storage.execute(`
        UPDATE events SET current_participants = current_participants + 1 WHERE id = $1
      `, [eventId]);

      return true;
    } catch (error) {
      console.error('Error registering for event:', error);
      return false;
    }
  }

  async getEventById(eventId: string): Promise<Event | null> {
    try {
      const result = await storage.get(`
        SELECT * FROM events WHERE id = $1 AND approved = true
      `, [eventId]);

      if (!result) return null;

      return {
        id: result.id,
        title: result.title,
        description: result.description,
        eventType: result.event_type,
        facilitatorId: result.facilitator_id,
        facilitatorName: result.facilitator_name,
        startDate: new Date(result.start_date),
        endDate: new Date(result.end_date),
        location: result.location,
        maxParticipants: result.max_participants,
        currentParticipants: result.current_participants || 0,
        price: result.price,
        tags: JSON.parse(result.tags || '[]'),
        requirements: JSON.parse(result.requirements || '[]'),
        materials: JSON.parse(result.materials || '[]'),
        approved: result.approved,
        createdAt: new Date(result.created_at)
      };
    } catch (error) {
      console.error('Error getting event by ID:', error);
      return null;
    }
  }

  async getUserRegistrations(userId: string): Promise<Event[]> {
    try {
      // Mock user registrations for development
      return [];
    } catch (error) {
      console.error('Error getting user registrations:', error);
      return [];
    }
  }
}

export const eventsService = new EventsService();
