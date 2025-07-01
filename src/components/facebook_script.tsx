'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

// Type declaration for Facebook SDK
declare global {
  interface Window {
    FB?: {
      XFBML: {
        parse: () => void;
      };
    };
    facebookConfig?: {
      appId: string;
      cookie: boolean;
      xfbml: boolean;
      version: string;
    };
  }
}

interface FacebookConfig {
  appId: string;
  cookie: boolean;
  xfbml: boolean;
  version: string;
}

export default function FacebookSDK() {
  const [fbConfig, setFbConfig] = useState<FacebookConfig | null>(null);
  const [configLoaded, setConfigLoaded] = useState(false);

  // Load Facebook configuration from public folder
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/config/facebook.js';
    script.onload = () => {
      if (window.facebookConfig) {
        setFbConfig(window.facebookConfig);
      } else {
        // Fallback configuration
        setFbConfig({
          appId: '1302645107676952',
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
      }
      setConfigLoaded(true);
    };
    script.onerror = () => {
      // Fallback configuration if config file fails to load
      setFbConfig({
        appId: '1302645107676952',
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
      setConfigLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src="/config/facebook.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  // Add useEffect to ensure FB.XFBML.parse() is called when the component mounts
  useEffect(() => {
    // If the SDK is already loaded, parse XFBML
    if (typeof window !== 'undefined' && window.FB) {
      window.FB.XFBML.parse();
    }
  }, []);

  // Don't render the Facebook SDK script until config is loaded
  if (!configLoaded || !fbConfig) {
    return null;
  }

  return (
    <Script
      id="facebook-sdk"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          // Store original callback if it exists
          var originalFbAsyncInit = window.fbAsyncInit || function(){};

          window.fbAsyncInit = function() {
            FB.init({
              appId      : '${fbConfig.appId}',
              cookie     : ${fbConfig.cookie},
              xfbml      : ${fbConfig.xfbml},
              version    : '${fbConfig.version}'
            });
              
            FB.AppEvents.logPageView();
            
            // Parse XFBML again to ensure Facebook Login Button works
            setTimeout(function() {
              FB.XFBML.parse();
            }, 500);
            
            // Set a flag to indicate the FB SDK is ready
            window.fbSDKReady = true;
            
            // Call original callback
            originalFbAsyncInit();
            
            // Dispatch custom event for components to know FB SDK is ready
            document.dispatchEvent(new Event('fb-sdk-ready'));
          };

          (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {return;}
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
          }(document, 'script', 'facebook-jssdk'));
        `,
      }}
    />
  );
}