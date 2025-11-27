try {
  require('./src/app');
  console.log('App loaded successfully');
} catch (e) {
  console.error('Error loading app:', e);
}
