// Named imports only — keeps lucide tree-shakeable.
import {
  ArrowUpRight,
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
  Link,
  Mail,
  MapPin,
  MessageCircle,
  Monitor,
  Music,
  PenTool,
  School,
  Sparkles,
  User,
  Zap,
} from 'lucide-react'

export const ICONS = {
  about: User,
  education: GraduationCap,
  skills: Sparkles,
  interests: Heart,
  works: LayoutGrid,
  contact: Mail,
  mail: Mail,
  linkedin: Link,
  location: MapPin,
  arrow: ArrowUpRight,
  school: School,
  zap: Zap,
  message: MessageCircle,
  layers: Layers,
  monitor: Monitor,
  grid: LayoutGrid,
  pen: PenTool,
  code: CodeXml,
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
