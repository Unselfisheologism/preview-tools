import type React from 'react';

interface CurvedEdgeProps {
  corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size: number;
  stroke?: string;
  strokeWidth?: number;
}

const CurvedEdge: React.FC<CurvedEdgeProps> = ({
  corner,
  size,
  stroke = 'black',
  strokeWidth = 2,
}) => {
  let pathD = '';
  const s = size; // size is used as the radius and extent of the curve

  // Paths are defined for a local SVG viewport of size x size
  // The control point for Q (quadratic Bezier) is the corner point.
  switch (corner) {
    case 'top-left':
      pathD = `M0,${s} Q0,0 ${s},0`; // Start on Y-axis, curve to X-axis
      break;
    case 'top-right':
      pathD = `M0,0 Q${s},0 ${s},${s}`; // Start on X-axis, curve to Y-axis
      break;
    case 'bottom-left':
      pathD = `M${s},${s} Q0,${s} 0,0`; // Start on Y-axis (at s), curve to X-axis (at 0) - wait this is wrong
                                      // Should be: Start X=0,Y=0 curve to X=s,Y=s for its local coord if SVG is at bottom-left of parent
      pathD = `M0,0 Q0,${s} ${s},${s}`; // Start on Y-axis (at 0), curve to X-axis (at s)
      break;
    case 'bottom-right':
      pathD = `M${s},0 Q0,0 0,${s}`; // This is wrong.
                                      // Should be: Start X=s,Y=s curve to X=0,Y=0 if SVG is at bottom-right
      pathD = `M${s},${s} Q${s},0 0,0`; // Start on X axis (at s), curve to Y axis (at 0)
      break;
  }
  
  // Corrected paths for a size x size SVG viewport
  // Each path describes one quarter of a circle outline within its quadrant
  switch (corner) {
    case 'top-left': // Curve in top-left quadrant of the SVG
      pathD = `M0,${s} Q0,0 ${s},0`;
      break;
    case 'top-right': // Curve in top-right quadrant of the SVG
      pathD = `M0,0 Q${s},0 ${s},${s}`;
      break;
    case 'bottom-left': // Curve in bottom-left quadrant of the SVG
      pathD = `M${s},0 Q0,0 0,${s}`;
      break;
    case 'bottom-right': // Curve in bottom-right quadrant of the SVG
       pathD = `M${s},${s} Q${s},0 0,0`;
      break;
  }


  const wrapperStyles: React.CSSProperties = {
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    pointerEvents: 'none', // Ensure edges don't interfere with interactions
  };

  if (corner === 'top-left') {
    wrapperStyles.top = '0px';
    wrapperStyles.left = '0px';
  } else if (corner === 'top-right') {
    wrapperStyles.top = '0px';
    wrapperStyles.right = '0px';
  } else if (corner === 'bottom-left') {
    wrapperStyles.bottom = '0px';
    wrapperStyles.left = '0px';
  } else if (corner === 'bottom-right') {
    wrapperStyles.bottom = '0px';
    wrapperStyles.right = '0px';
  }

  return (
    <div style={wrapperStyles}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={pathD} stroke={stroke} strokeWidth={strokeWidth} />
      </svg>
    </div>
  );
};

export default CurvedEdge;
