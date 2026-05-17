'use client';

import React from 'react';

interface ScrollIndicatorProps {
  className?: string;
  width?: number;
  height?: number;
}

export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
  className = '',
  width = 100,
  height = 100,
}) => {
  return (
    <div className={className} style={{ width: `${width}px`, height: `${height}px` }}>
      <style jsx>{`
        @keyframes chevronAnimation {
          0%,
          100% {
            opacity: 0;
          }
          25% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.5;
          }
          75% {
            opacity: 1;
          }
        }

        @keyframes chevronAnimationDelayed {
          0%,
          100% {
            opacity: 0;
          }
          75% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.5;
          }
          25% {
            opacity: 1;
          }
        }

        .chevron-first {
          animation: chevronAnimationDelayed 2s ease-in-out infinite;
        }

        .chevron-second {
          animation: chevronAnimation 2s ease-in-out infinite;
        }
      `}</style>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        width={width}
        height={height}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <clipPath id="scroll-indicator-clip">
            <rect width="100" height="100" x="0" y="0" />
          </clipPath>
        </defs>
        <g clipPath="url(#scroll-indicator-clip)">
          {/* First Chevron - Animated */}
          <g
            transform="matrix(0.9737399816513062,0,0,1,210.52688598632812,-329.881103515625)"
            className="chevron-first"
          >
            <g opacity="1" transform="matrix(0.9433799982070923,0,0,1,0,0)">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                fillOpacity="0"
                stroke="rgb(0,0,0)"
                strokeOpacity="1"
                strokeWidth="4"
                d="M-185.6439971923828,367.8999938964844 C-185.6439971923828,367.8999938964844 -174.6909942626953,375.3999938964844 -174.6909942626953,375.3999938964844 C-174.6909942626953,375.3999938964844 -163.8560028076172,367.8999938964844 -163.8560028076172,367.8999938964844"
              />
            </g>
          </g>

          {/* Second Chevron - Animated */}
          <g
            transform="matrix(0.9737399816513062,0,0,1,210.52688598632812,-317.2330017089844)"
            className="chevron-second"
          >
            <g opacity="1" transform="matrix(0.9433799982070923,0,0,1,0,0)">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                fillOpacity="0"
                stroke="rgb(0,0,0)"
                strokeOpacity="1"
                strokeWidth="4"
                d="M-185.6439971923828,367.8999938964844 C-185.6439971923828,367.8999938964844 -174.6909942626953,375.3999938964844 -174.6909942626953,375.3999938964844 C-174.6909942626953,375.3999938964844 -163.8560028076172,367.8999938964844 -163.8560028076172,367.8999938964844"
              />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};

export default ScrollIndicator;
