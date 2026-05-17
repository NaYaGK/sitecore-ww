/**
 * Mock data for LandingPageTable component.
 * Will be replaced by Sitecore datasource fields once wired up.
 */

export interface TableColumn {
  label: string;
}

export interface TableRow {
  icon: string;
  cells: string[];
}

export interface LandingPageTableMock {
  ariaLabel: string;
  columns: TableColumn[];
  rows: TableRow[];
}

export const landingPageTableMock: LandingPageTableMock = {
  ariaLabel:
    'Hidden features of multi-standard clothing and CWS Workwear Service',
  columns: [
    { label: 'Our hidden features' },
    { label: 'What it means' },
    { label: 'Why it matters to you' },
  ],
  rows: [
    {
      icon: '\u{1F6E1}\uFE0F',
      cells: [
        'Multi-standard certification',
        'PPE certified to multiple EN standards (flame, arc flash, chemicals)',
        'Ensures legal compliance and protects your workers across all hazards',
      ],
    },
    {
      icon: '\u{1F525}',
      cells: [
        'Flame-retardant materials',
        'Advanced fibers and finishes with flame-retardant properties',
        'Minimizes injury risk by preventing garment ignition',
      ],
    },
    {
      icon: '\u26A1',
      cells: [
        'Arc flash protection layers',
        'Multi-layer insulation protecting against electrical arc flash',
        'Protects workers from severe thermal injuries',
      ],
    },
    {
      icon: '\u{1F441}\uFE0F',
      cells: [
        'High-visibility elements',
        'Integrated reflective and fluorescent components',
        'Enhances worker visibility to prevent accidents',
      ],
    },
    {
      icon: '\u{1F938}',
      cells: [
        'Ergonomic fit & freedom of movement',
        'Tailored cuts, stretch zones, and female-specific designs',
        'Improves comfort and wearer compliance for better protection',
      ],
    },
    {
      icon: '\u{1F9FA}',
      cells: [
        'Certified industrial processing',
        'Standardized washing, drying, and repair \u2014 tested and documented',
        'Maintains PPE effectiveness and extends service life',
      ],
    },
    {
      icon: '\u{1F4AC}',
      cells: [
        'Expert PPE consulting',
        'Workplace hazard analysis and tailored PPE recommendations',
        'Ensures optimal protection aligned with your specific risks',
      ],
    },
    {
      icon: '\u{1F91D}',
      cells: [
        'Collaborative product development',
        'PPE co-created with real users and industry experts',
        'Delivers practical, safe, and comfortable solutions your teams accept',
      ],
    },
    {
      icon: '\u{1F4D6}',
      cells: [
        'Training and instruction',
        'On-site guidance on correct PPE use and combinations',
        'Reduces misuse and maximizes protection effectiveness',
      ],
    },
    {
      icon: '\u{1F4E6}',
      cells: [
        'All-round rental service',
        'Full service: delivery, collection, care, repair, and storage',
        'Simplifies PPE management and reduces your administrative burden',
      ],
    },
    {
      icon: '\u{1F4C4}',
      cells: [
        'Legal documentation & compliance',
        'Complete proof of protection, compliant with the latest regulatory standards',
        'Guarantees regulatory compliance and audit readiness',
      ],
    },
  ],
};
