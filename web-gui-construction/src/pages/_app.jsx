/**
 * 🏗️ APP ROOT - Next.js Application Entry Point
 * ==============================================
 * 
 * Global configuration and layout wrapper for Construction Syndicate GUI
 */

import React from 'react';
import '../styles/globals.css';
import ConstructionLayout from '../components/shared/ConstructionLayout';

function ConstructionSyndicateApp({ Component, pageProps }) {
  return (
    <ConstructionLayout>
      <Component {...pageProps} />
    </ConstructionLayout>
  );
}

export default ConstructionSyndicateApp;

