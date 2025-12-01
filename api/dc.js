export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get client IP
    const clientIp = req.headers['x-forwarded-for'] || 
                    req.headers['x-real-ip'] || 
                    req.connection.remoteAddress;
    
    // Clean IP address
    const cleanIp = clientIp.replace('::ffff:', '').split(',')[0].trim();
    
    console.log('🌍 IP Check Request from:', cleanIp);
    
    // Get country using free IP API
    const countryData = await getCountryFromIP(cleanIp);
    const countryCode = countryData.country_code || 'Unknown';
    const countryName = countryData.country_name || 'Unknown';
    
    // Check if Pakistan
    const isPakistan = countryCode === 'PK';
    
    // Response structure (same as original)
    const response = {
      clientIp: cleanIp,
      [cleanIp]: {
        proxy: "no",  // You can add proxy detection if needed
        isocode: countryCode,
        country: countryName
      }
    };
    
    console.log(`📍 Location: ${countryName} (${countryCode})`);
    console.log(`📱 Recovery allowed: ${!isPakistan}`);
    
    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ IP Check Error:', error);
    
    // Fallback response on error
    return res.status(200).json({
      clientIp: '0.0.0.0',
      '0.0.0.0': {
        proxy: "no",
        isocode: "US", // Default to US on error
        country: "United States"
      }
    });
  }
}

// Function to get country from IP using free API
async function getCountryFromIP(ip) {
  try {
    // Using ipapi.co (free, no API key needed)
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    
    if (!response.ok) {
      throw new Error('IP API failed');
    }
    
    const data = await response.json();
    
    return {
      country_code: data.country_code,
      country_name: data.country_name
    };
    
  } catch (error) {
    console.error('Country detection error:', error);
    return { country_code: 'US', country_name: 'United States' };
  }
}
