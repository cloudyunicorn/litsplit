import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* Link to manifest.json */}
          <link rel="manifest" href="/manifest.json" />
          {/* Set theme color for the address bar on mobile browsers */}
          <meta name="theme-color" content="#ffffff" />
          {/* Optional: Apple Touch Icon (iOS) */}
          <link rel="apple-touch-icon" href="/images/icon-192x192.png" />
          {/* Add any other meta tags or icons as needed */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
