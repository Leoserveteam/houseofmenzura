/* Icons drawn from the Figma vectors (icon/chevron-down, icon/upload, icon/close, icon/check), same frame, offset, stroke, caps and joins. */
const common = { fill: 'none', stroke: 'currentColor', 'aria-hidden': true } as const;

export const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" {...common} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="miter">
    <path d="M6 6L18 18M18 6L6 18" />
  </svg>
);

export const UploadIcon = () => (
  <svg className="drop-icon" width="20" height="20" viewBox="0 0 20 20" {...common} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13V4M10 4L6.5 7.5M10 4L13.5 7.5M4 13V15.5H16V13" />
  </svg>
);
