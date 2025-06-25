'use client';

import Script from 'next/script';
import { useEffect } from 'react';

// Type declaration for Facebook SDK
declare global {
  interface Window {
    FB?: {
      XFBML: {
        parse: () => void;
      };
    };
  }
}

export default function FacebookSDK() {
  // Add useEffect to ensure FB.XFBML.parse() is called when the component mounts
  useEffect(() => {
    // If the SDK is already loaded, parse XFBML
    if (typeof window !== 'undefined' && window.FB) {
      window.FB.XFBML.parse();
    }
  }, []);

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
              appId      : '636208599311670',
              cookie     : true,
              xfbml      : true,
              version    : 'v18.0'
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