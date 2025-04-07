import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function PageDetection() {
  const location = useLocation();

  useEffect(() => {
    // Extract page name from path
    const pagePath = location.pathname;
    let pageName = '';

    if (pagePath.includes('campaign-results')) {
      pageName = 'campaign-results';
    } else if (pagePath.includes('campaign-builder')) {
      pageName = 'campaign-builder';
    } else if (pagePath.includes('/brand/')) {
      pageName = 'brand-dashboard';
    } else if (pagePath.includes('/influencer/')) {
      pageName = 'influencer-dashboard';
    }

    // Set data attribute on body
    if (pageName) {
      document.body.setAttribute('data-page', pageName);
    } else {
      document.body.removeAttribute('data-page');
    }

    return () => {
      document.body.removeAttribute('data-page');
    };
  }, [location]);

  return null;
}

export default PageDetection;
