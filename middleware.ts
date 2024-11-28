import { type NextRequest, NextResponse } from 'next/server';
const middleware = async (request: NextRequest) => { 
  const res = NextResponse.next();
  // Get the full URL
  const url = request.nextUrl;

  // Extract hash fragment (if applicable)
  const hashFragment = url.hash;

  console.log(request.nextUrl.toString());
  

  if (!hashFragment) {
    // If no hash is present, continue the request
    return res;
  }

  const searchParams = new URLSearchParams(hashFragment.substring(1)); // Remove leading '#'

  // Extract parameters
  const tgWebAppData = searchParams.get('tgWebAppData');
  const tgWebAppVersion = searchParams.get('tgWebAppVersion');
  // const tgWebAppPlatform = searchParams.get('tgWebAppPlatform');
  // const tgWebAppThemeParams = searchParams.get('tgWebAppThemeParams');
  // const tgWebAppDefaultColors = searchParams.get('tgWebAppDefaultColors');

   // Parse and decode tgWebAppData if present
   let parsedData = null;
   if (tgWebAppData) {
     try {
       const decodedData = decodeURIComponent(tgWebAppData);
       parsedData = JSON.parse(decodedData);
     } catch (error) {
       console.error('Error decoding tgWebAppData:', error);
     }
   }
 
   // Add parsed data to request headers for further use
   res.headers.set('X-TG-User', parsedData?.user?.id || '');
   res.headers.set('X-TG-Version', tgWebAppVersion || '');
  //  res.cookies.set('data')
  return res;
};

export default middleware;


export const config = {
  matcher: [
    '/',
    '/((?!logout|api|favicon|.+\\.[\\w]+$|_next).*)', // Exclude logout and keep other exclusions
  ],
};
