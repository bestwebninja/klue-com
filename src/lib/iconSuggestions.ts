import {
  Home, Building, PartyPopper, HeartPulse, Truck, PawPrint, Briefcase, Code, Scale, GraduationCap,
  Wrench, Zap, Droplet, Hammer, PaintBucket, Sofa, Thermometer, Waves, SquareStack, Wind,
  Shield, Lock, ClipboardCheck, HardHat, TreePine, Bug, Key, Camera, Palette,
  Music, Cake, Utensils, Wine, Gift, Flower2, Car, Bus, Package, Dog, Cat, Fish, Stethoscope,
  Dumbbell, Scissors, Heart, Brain, PersonStanding, Users, Calculator, FileText, Phone, Printer, Search,
  Globe, Server, Database, Smartphone, Monitor, Megaphone, PenTool, Languages, BookOpen, Trophy,
  Gavel, FileCheck, UserCheck, Building2, Warehouse, Sparkles, ChefHat, Mic, Gamepad2, Laptop,
  Settings, Lightbulb, CircuitBoard, Layers, Grid3X3, LayoutGrid
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Map of icon names to components
export const iconComponents: Record<string, LucideIcon> = {
  'home': Home,
  'building': Building,
  'building-2': Building2,
  'party-popper': PartyPopper,
  'heart-pulse': HeartPulse,
  'truck': Truck,
  'paw-print': PawPrint,
  'briefcase': Briefcase,
  'code': Code,
  'scale': Scale,
  'graduation-cap': GraduationCap,
  'wrench': Wrench,
  'zap': Zap,
  'droplet': Droplet,
  'hammer': Hammer,
  'paint-bucket': PaintBucket,
  'sofa': Sofa,
  'thermometer': Thermometer,
  'roof': Home,
  'waves': Waves,
  'square-stack': SquareStack,
  'wind': Wind,
  'floor-plan': LayoutGrid,
  'shield': Shield,
  'lock': Lock,
  'clipboard-check': ClipboardCheck,
  'hard-hat': HardHat,
  'brick': Grid3X3,
  'trees': TreePine,
  'bug': Bug,
  'key': Key,
  'camera': Camera,
  'palette': Palette,
  'music': Music,
  'cake': Cake,
  'utensils': Utensils,
  'wine': Wine,
  'gift': Gift,
  'flower': Flower2,
  'car': Car,
  'bus': Bus,
  'package': Package,
  'dog': Dog,
  'cat': Cat,
  'fish': Fish,
  'stethoscope': Stethoscope,
  'dumbbell': Dumbbell,
  'scissors': Scissors,
  'heart': Heart,
  'brain': Brain,
  'yoga': PersonStanding,
  'users': Users,
  'calculator': Calculator,
  'file-text': FileText,
  'phone': Phone,
  'printer': Printer,
  'search': Search,
  'globe': Globe,
  'server': Server,
  'database': Database,
  'smartphone': Smartphone,
  'monitor': Monitor,
  'megaphone': Megaphone,
  'pen-tool': PenTool,
  'languages': Languages,
  'book-open': BookOpen,
  'trophy': Trophy,
  'gavel': Gavel,
  'file-check': FileCheck,
  'user-check': UserCheck,
  'warehouse': Warehouse,
  'sparkles': Sparkles,
  'chef-hat': ChefHat,
  'mic': Mic,
  'gamepad': Gamepad2,
  'laptop': Laptop,
  'settings': Settings,
  'lightbulb': Lightbulb,
  'circuit-board': CircuitBoard,
  'layers': Layers,
};

// Keywords to icon mapping for suggestions
const keywordIconMap: Record<string, string> = {
  // Home & Renovation
  'home': 'home',
  'house': 'home',
  'residential': 'home',
  'diy': 'wrench',
  'renovation': 'hard-hat',
  'handyman': 'wrench',
  'electrician': 'zap',
  'plumber': 'droplet',
  'plumbing': 'droplet',
  'carpenter': 'hammer',
  'carpentry': 'hammer',
  'window': 'square-stack',
  'door': 'square-stack',
  'painter': 'paint-bucket',
  'painting': 'paint-bucket',
  'interior': 'sofa',
  'designer': 'palette',
  'design': 'palette',
  'heating': 'thermometer',
  'gas': 'thermometer',
  'roofing': 'roof',
  'roof': 'roof',
  'pool': 'waves',
  'swimming': 'waves',
  'tiling': 'square-stack',
  'paving': 'brick',
  'airconditioning': 'wind',
  'air conditioning': 'wind',
  'flooring': 'floor-plan',
  'blacksmith': 'hammer',
  'drain': 'droplet',
  'bricklayer': 'brick',
  'builder': 'hard-hat',
  'plasterer': 'paint-bucket',
  'renderer': 'paint-bucket',
  'garden': 'trees',
  'landscaping': 'trees',
  'pest': 'bug',
  'pest control': 'bug',
  'locksmith': 'key',
  'security': 'shield',
  'architecture': 'building',
  'planning': 'clipboard-check',
  'project management': 'clipboard-check',
  'appliance': 'settings',

  // Commercial
  'commercial': 'building',
  'shopfitting': 'building-2',
  'maintenance': 'wrench',
  'cleaning': 'sparkles',

  // Events & Catering
  'events': 'party-popper',
  'event': 'party-popper',
  'catering': 'utensils',
  'wedding': 'heart',
  'dj': 'music',
  'music': 'music',
  'photography': 'camera',
  'photographer': 'camera',
  'videography': 'camera',
  'florist': 'flower',
  'flowers': 'flower',
  'cake': 'cake',
  'pastry': 'cake',
  'bartending': 'wine',
  'chef': 'chef-hat',
  'entertainment': 'mic',
  'magician': 'sparkles',
  'clown': 'party-popper',

  // Health & Fitness
  'health': 'heart-pulse',
  'fitness': 'dumbbell',
  'personal trainer': 'dumbbell',
  'trainer': 'dumbbell',
  'gym': 'dumbbell',
  'physiotherapy': 'stethoscope',
  'massage': 'heart',
  'therapy': 'brain',
  'counseling': 'brain',
  'nutrition': 'heart-pulse',
  'yoga': 'yoga',
  'pilates': 'yoga',
  'beauty': 'scissors',
  'salon': 'scissors',
  'hair': 'scissors',

  // Moving & Transport
  'moving': 'truck',
  'transport': 'truck',
  'movers': 'truck',
  'courier': 'package',
  'delivery': 'package',
  'car': 'car',
  'vehicle': 'car',
  'breakdown': 'car',
  'limousine': 'car',
  'chauffeur': 'car',
  'bus': 'bus',

  // Pets
  'pets': 'paw-print',
  'pet': 'paw-print',
  'dog': 'dog',
  'cat': 'cat',
  'grooming': 'scissors',
  'veterinary': 'stethoscope',
  'animal': 'paw-print',
  'aquarium': 'fish',

  // Business Services
  'business': 'briefcase',
  'accounting': 'calculator',
  'tax': 'calculator',
  'consulting': 'briefcase',
  'payroll': 'calculator',
  'recruiting': 'users',
  'resume': 'file-text',
  'public relations': 'megaphone',
  'pr': 'megaphone',
  'investigation': 'search',

  // IT Services
  'it': 'code',
  'technology': 'code',
  'web': 'globe',
  'website': 'globe',
  'software': 'code',
  'development': 'code',
  'computer': 'laptop',
  'repair': 'wrench',
  'network': 'server',
  'data': 'database',
  'mobile': 'smartphone',
  'app': 'smartphone',
  'graphic': 'pen-tool',
  'logo': 'pen-tool',
  'marketing': 'megaphone',
  'seo': 'search',
  'social media': 'globe',
  'hosting': 'server',
  'animation': 'monitor',

  // Legal Services
  'legal': 'scale',
  'law': 'scale',
  'lawyer': 'scale',
  'attorney': 'scale',
  'solicitor': 'scale',
  'divorce': 'file-check',
  'family law': 'users',
  'criminal': 'gavel',
  'estate': 'file-text',
  'immigration': 'globe',
  'contract': 'file-check',
  'notary': 'file-check',
  'mediation': 'users',

  // Lessons
  'lessons': 'graduation-cap',
  'education': 'graduation-cap',
  'tutoring': 'book-open',
  'language': 'languages',
  'sports': 'trophy',
  'academic': 'book-open',
  'dance': 'music',

  // Agriculture
  'agriculture': 'trees',
  'farming': 'trees',
};

/**
 * Suggests an icon based on category name
 */
export function suggestIcon(categoryName: string): string {
  const nameLower = categoryName.toLowerCase();
  
  // Check for exact matches first
  for (const [keyword, icon] of Object.entries(keywordIconMap)) {
    if (nameLower === keyword) {
      return icon;
    }
  }
  
  // Check for partial matches
  for (const [keyword, icon] of Object.entries(keywordIconMap)) {
    if (nameLower.includes(keyword) || keyword.includes(nameLower)) {
      return icon;
    }
  }
  
  // Default icons based on broad categories
  if (nameLower.includes('service')) return 'briefcase';
  
  return 'layers'; // Default fallback
}

/**
 * Get all available icon names
 */
export function getAvailableIcons(): string[] {
  return Object.keys(iconComponents).sort();
}

/**
 * Get icon component by name
 */
export function getIconComponent(iconName: string | null): LucideIcon {
  if (!iconName) return Layers;
  return iconComponents[iconName] || Layers;
}

// Main category icon suggestions for header/navigation
export const mainCategoryIcons: Record<string, string> = {
  'Home DIY and Renovation': 'home',
  'Commercial Renovations and Services': 'building',
  'Events and Catering': 'party-popper',
  'Health and Fitness': 'heart-pulse',
  'Agriculture': 'trees',
  'Moving and Transport': 'truck',
  'Pets Services': 'paw-print',
  'Business Services': 'briefcase',
  'IT Services': 'code',
  'Legal Services': 'scale',
  'Lessons': 'graduation-cap',
};
