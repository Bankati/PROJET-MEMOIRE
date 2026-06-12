/**
 * URLs d’images en ligne (next/image + remotePatterns).
 * Inspirations visuelles type Monday.com / CRM : humains, tableaux, campus.
 */

const u = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const remoteImages = {
  teamwork: u('photo-1522071820081-009f0129c71c', 1400),
  meeting: u('photo-1552664730-d307ca884978', 1400),
  campus: u('photo-1541339907198-e08756dedf3f', 1400),
  workspace: u('photo-1497366216548-37526070297c', 1400),

  /** Portraits pour « Pour qui ? » */
  personas: {
    superAdmin: u('photo-1573496359142-b8d87734a5a2', 600),
    admin: u('photo-1560250097-0b93528c311a', 600),
    agent: u('photo-1573497019940-1c28c88b4f3e', 600),
    leadership: u('photo-1507003211169-0a1dd7228f2d', 600),
  },

  /** Section valeur / discours académique */
  valueProps: {
    standardize: u('photo-1551836022-d5d88e9218df', 800),
    friction: u('photo-1450101499163-c8848c66ca85', 800),
    kpiGovernance: u('photo-1460925895917-afdab827c52f', 800),
  },
} as const

export type RemoteImageKey = keyof typeof remoteImages
