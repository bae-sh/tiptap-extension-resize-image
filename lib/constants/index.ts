export const CONSTANTS = {
  MOBILE_BREAKPOINT: 768,
  ICON_SIZE: '24px',
  CONTROLLER_HEIGHT: '25px',
  DOT_SIZE: {
    MOBILE: 16,
    DESKTOP: 9,
  },
  DOT_POSITION: {
    MOBILE: '-8px',
    DESKTOP: '-4px',
  },
  COLORS: {
    BORDER: '#6C6C6C',
    BACKGROUND: 'rgba(255, 255, 255, 1)',
  },
  // Inlined Material Symbols Outlined alignment icons (20px) as base64 data URLs.
  // Avoids runtime fetch from fonts.gstatic.com so the extension works under
  // strict CSP (img-src 'self'), in offline/blocked networks, and without
  // leaking the user's IP/Referer to a third-party CDN on every editor session.
  ICONS: {
    LEFT: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgLTk2MCA5NjAgOTYwIiB3aWR0aD0iMjAiPjxwYXRoIGQ9Ik0xNDQtMTQ0di03Mmg2NzJ2NzJIMTQ0Wm0wLTE1MHYtNzJoNDgwdjcySDE0NFptMC0xNTB2LTcyaDY3MnY3MkgxNDRabTAtMTUwdi03Mmg0ODB2NzJIMTQ0Wm0wLTE1MHYtNzJoNjcydjcySDE0NFoiLz48L3N2Zz4=',
    CENTER:
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgLTk2MCA5NjAgOTYwIiB3aWR0aD0iMjAiPjxwYXRoIGQ9Ik0xNDQtMTQ0di03Mmg2NzJ2NzJIMTQ0Wm0xNDQtMTUwdi03MmgzODR2NzJIMjg4Wk0xNDQtNDQ0di03Mmg2NzJ2NzJIMTQ0Wm0xNDQtMTUwdi03MmgzODR2NzJIMjg4Wk0xNDQtNzQ0di03Mmg2NzJ2NzJIMTQ0WiIvPjwvc3ZnPg==',
    RIGHT:
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgLTk2MCA5NjAgOTYwIiB3aWR0aD0iMjAiPjxwYXRoIGQ9Ik0xNDQtNzQ0di03Mmg2NzJ2NzJIMTQ0Wm0xOTIgMTUwdi03Mmg0ODB2NzJIMzM2Wk0xNDQtNDQ0di03Mmg2NzJ2NzJIMTQ0Wm0xOTIgMTUwdi03Mmg0ODB2NzJIMzM2Wk0xNDQtMTQ0di03Mmg2NzJ2NzJIMTQ0WiIvPjwvc3ZnPg==',
  },
} as const;
