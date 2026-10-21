/**
 * VCHUKI design tokens — "Quiet Luxury" dark.
 * Obsidian ground, bone-white type, champagne-gold accents,
 * Playfair Display for editorial headlines, Inter for everything you read or tap.
 */
export const colors = {
  bg: '#0B0A09', // obsidian
  surface: '#141210', // cards, sheets
  sand: '#1B1815', // image wells, chips, skeletons
  line: '#2A2621',
  ink: '#EDE6DA', // bone — primary text
  inkSoft: '#CFC6B8',
  muted: '#8F867A',
  faint: '#5F584F',
  accent: '#C9A96E', // champagne gold
  accentDeep: '#D9BE88', // gold for text on obsidian
  accentWash: '#211B12',
  night: '#17140F', // raised editorial panels
  nightText: '#EDE6DA',
  success: '#86BE98',
  successWash: '#13231A',
  warning: '#DDAA62',
  warningWash: '#2A2114',
  danger: '#E3806F',
  dangerWash: '#2C1714',
  white: '#FFFFFF',
  onInk: '#0B0A09', // text/icons on bone buttons
  onAccent: '#0B0A09', // text/icons on gold
  bar: 'rgba(11,10,9,0.96)', // sticky bars & tab bar
  glass: 'rgba(20,18,16,0.72)', // floating icon buttons over photos
  goldLine: 'rgba(201,169,110,0.28)',
} as const;

export const fonts = {
  display: 'PlayfairDisplay_500Medium',
  displayItalic: 'PlayfairDisplay_400Regular_Italic',
  displayBold: 'PlayfairDisplay_600SemiBold',
  body: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 40 } as const;
export const radius = { sm: 6, md: 10, lg: 16, xl: 24, pill: 999 } as const;
export const GUTTER = 20;
/** Bottom padding so scroll content clears the floating tab bar. */
export const TAB_SPACE = 104;

export const shadow = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  float: {
    shadowColor: '#2A1C10',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
} as const;
