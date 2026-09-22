// All site content lives here. Edit this file to update the site.
// `icon` fields are keys of the ICONS registry in src/icons.ts.

export const profile = {
  name: 'Petar Volic',
  title: 'Multimedia Design Student',
  location: 'Aarhus, Denmark',
  email: 'jeg.er.peter.work@gmail.com',
  linkedin: 'https://www.linkedin.com/in/petar-volic',
  availability: 'Looking for an internship.',
  about:
    'Multimedia Design student at Business Academy Aarhus, focused on front-end and back-end development. Looking for an internship where I can gain practical experience and continue growing as a web developer.',
  photo: {
    // Rendered at 96px; 2x and 3x variants are generated in public/images/.
    base: 'images/profile',
    width: 96,
    alt: 'Portrait of Petar Volic, Multimedia Design student based in Aarhus, Denmark',
  },
}

export const hero = {
  prefix: 'Designing for',
  words: ['Startups', 'Brands', 'Products', 'You'],
}

export const education = [
  {
    degree: 'Multimedia Design',
    school: 'Business Academy Aarhus',
    dates: '2025 – Present',
    icon: 'school',
  },
  {
    degree: 'Electrical Technician',
    school: 'School of Electrical Engineering Zagreb',
    dates: '2022 – 2024',
    icon: 'zap',
  },
  {
    degree: 'Electromechanic',
    school: 'School of Electrical Engineering Zagreb',
    dates: '2019 – 2022',
    icon: 'zap',
  },
]

export type SkillGroup = {
  title: string
  icon: string
  items?: string[]
  subgroups?: { title: string; icon: string; items: string[] }[]
}

export const skills: SkillGroup[] = [
  {
    title: 'Soft skills',
    icon: 'message',
    items: ['Adaptability', 'Problem solving', 'Transparency'],
  },
  {
    title: 'Practical skills',
    icon: 'layers',
    items: [
      'Wireframing',
      'Prototyping',
      'User research',
      'User flows',
      'Usability testing',
      'Responsive design',
    ],
  },
  {
    title: 'Digital skills',
    icon: 'monitor',
    subgroups: [
      { title: 'Basic', icon: 'grid', items: ['Microsoft Office', 'Notion', 'WordPress', 'Shopify'] },
      { title: 'Design', icon: 'pen', items: ['Figma', 'Canva', 'Framer'] },
      {
        title: 'Coding',
        icon: 'code',
        items: ['HTML5', 'JavaScript', 'Tailwind CSS', 'React', 'Git', 'SQL', 'Python'],
      },
    ],
  },
]

// TODO: replace each label/description with a real interest.
// Swap `icon` for any key in src/icons.ts (compass, music, camera, game, book, dumbbell).
export const interests = [
  { label: 'TODO: add interest', desc: 'TODO: one short line about it.', icon: 'compass' },
  { label: 'TODO: add interest', desc: 'TODO: one short line about it.', icon: 'music' },
  { label: 'TODO: add interest', desc: 'TODO: one short line about it.', icon: 'camera' },
  { label: 'TODO: add interest', desc: 'TODO: one short line about it.', icon: 'game' },
]

export const socials = [
  { label: 'Email', href: `mailto:${profile.email}`, icon: 'mail' },
  { label: 'LinkedIn', href: profile.linkedin, icon: 'linkedin' },
]

// TODO: add projects. Set `image` to a path in public/images/ (e.g. 'images/projects/foo.webp')
// and the card swaps from the placeholder to the photo automatically.
export const projects = [
  { id: '01', areaClass: 'wc-p1', title: 'TODO: add project', category: 'TODO', desc: 'TODO: add project description.', image: '' },
  { id: '02', areaClass: 'wc-p2', title: 'TODO: add project', category: 'TODO', desc: 'TODO: add project description.', image: '' },
  { id: '03', areaClass: 'wc-p3', title: 'TODO: add project', category: 'TODO', desc: 'TODO: add project description.', image: '' },
  { id: '04', areaClass: 'wc-p4', title: 'TODO: add project', category: 'TODO', desc: 'TODO: add project description.', image: '' },
  { id: '05', areaClass: 'wc-p5', title: 'TODO: add project', category: 'TODO', desc: 'TODO: add project description.', image: '' },
  { id: '06', areaClass: 'wc-p6', title: 'TODO: add project', category: 'TODO', desc: 'TODO: add project description.', image: '' },
]

export const contact = {
  eyebrow: 'GET IN TOUCH',
  heading: "Let's turn concepts into stunning work.",
  cta: { label: 'Connect on LinkedIn', href: profile.linkedin },
}

export const footer = {
  copyright: `© ${profile.name} ${new Date().getFullYear()} | All Rights Reserved`,
}
