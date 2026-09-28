// Named imports only — keeps lucide tree-shakeable.
import {
  BookOpen,
  Camera,
  CodeXml,
  Compass,
  Dumbbell,
  Gamepad2,
  GraduationCap,
  Heart,
  Layers,
  LayoutGrid,
  Mail,
  MapPin,
  MessageCircle,
  Monitor,
  Music,
  PenTool,
  School,
  Sparkles,
  Zap,
} from 'lucide-react'

export const ICONS = {
  education: GraduationCap,
  skills: Sparkles,
  interests: Heart,
  mail: Mail,
  location: MapPin,
  school: School,
  zap: Zap,
  message: MessageCircle,
  layers: Layers,
  monitor: Monitor,
  grid: LayoutGrid,
  pen: PenTool,
  code: CodeXml,
  // Options for interests — swap freely in data/content.ts
  compass: Compass,
  music: Music,
  camera: Camera,
  game: Gamepad2,
  book: BookOpen,
  dumbbell: Dumbbell,
} as const

export type IconKey = keyof typeof ICONS

// One size and stroke width for the whole site.
export const ICON_SIZE = 16
export const ICON_STROKE = 1.75
