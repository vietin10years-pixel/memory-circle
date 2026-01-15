
export type View = 'onboarding' | 'timeline' | 'people' | 'capture' | 'insights' | 'profile' | 'detail' | 'person-detail' | 'add-person' | 'map-explorer';

export interface Person {
  id: string;
  name: string;
  role: string;
  memoriesCount: number;
  imageUrl: string;
  bio?: string;
}

export interface Memory {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  mood: string;
  content: string;
  imageUrl: string;
  audioUrl?: string;
  audioDuration?: number;
  peopleIds: string[];
  isHighlight?: boolean;
  coordinates?: { lat: number; lng: number };
  unlockDate?: string;
  isCapsule?: boolean;
}

export interface MoodData {
  day: string;
  value: number;
}
