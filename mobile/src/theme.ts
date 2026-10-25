/**
 * VCHUKI design tokens — light linen, matching vchuki.com (app/globals.css :root).
 * Warm off-white ground, near-black type, gold accent; heritage-brown "night" panels
 * for editorial blocks (bundles, VIP, Studio, toasts) exactly like the website.
 * Playfair Display for editorial headlines, Inter for everything you read or tap.
 */
export const colors = {
  bg: '#FAF8F5', // --background
  surface: '#FDFDFC', // cards, sheets (--popover)
  sand: '#EDE9E3', // image wells, chips, skeletons (--secondary)
  line: '#E2DCD5', // --border
  ink: '#1D1916', // --foreground — primary text
  inkSoft: '#322D29', // --secondary-foreground
  muted: '#7C716A', // --muted-foreground
  faint: '#A49D98',
  accent: '#BE8637', // --accent (gold)
  accentDeep: '#8B5C23', // gold for text on light ground
  accentWash: '#F5EDE0',
  night: '#493527', // --heritage — dark editorial panels
  nightText: '#F5E6D3',
  success: '#2F7D4F',
  successWash: '#E6F2EA',
  warning: '#A86A12',
  warningWash: '#FBF1DE',
  danger: '#D93636', // --destructive
  dangerWash: '#FDECEA',
  white: '#FFFFFF',
  onInk: '#FAF8F5', // text/icons on dark ink buttons
  onAccent: '#FDFDFC', // --accent-foreground
  bar: 'rgba(250,248,245,0.96)', // sticky bars & tab bar
  glass: 'rgba(253,253,252,0.82)', // floating icon buttons over photos
  goldLine: 'rgba(190,134,55,0.3)',
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
    shadowColor: '#2A1C10',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  float: {
    shadowColor: '#2A1C10',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
} as const;
