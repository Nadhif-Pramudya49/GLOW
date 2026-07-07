const CONFIG = {
  API_BASE_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api' 
    : window.location.origin + '/api'
};
