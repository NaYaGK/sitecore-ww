import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Infinity Call Tracking - placed before closing </head> per Infinity docs.
 * If using Facebook or Adobe integration, this script must be placed before those scripts.
 */
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(i,n,f,t,y,x,z) {
  y=i._its=function(){return y.queue.push(arguments)};y.version='2.0';y.queue=[];
  z=n.createElement(f);z.async=!0;z.src=t;
  x=n.getElementsByTagName(f)[0];x.parentNode.insertBefore(z,x);
})(window, document,'script','https://script.infinity-tracking.com/infinitytrack.js?i=15018');
window._its('init', '15018');
window._its('track');
`,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
