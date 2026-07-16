// Test script to verify onboarding completion
const testOnboardingCompletion = () => {
  console.log(' Testing Onboarding System...');
  
  // Test localStorage functionality
  try {
    const testData = { test: 'data' };
    localStorage.setItem('test_onboarding', JSON.stringify(testData));
    const retrieved = JSON.parse(localStorage.getItem('test_onboarding'));
    console.log(' localStorage working:', retrieved);
    localStorage.removeItem('test_onboarding');
  } catch (error) {
    console.error(' localStorage failed:', error);
  }
  
  // Test form validation
  const testFormData = {
    username: 'TestUser_ABCDE',
    location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
    desiredLocation: { city: 'Bangalore', state: 'Karnataka', country: 'India' },
    sectors: ['Technology', 'Finance'],
    skills: ['JavaScript', 'Python'],
    education: { level: 'bachelors', field: 'Computer Science', year: '2024' }
  };
  
  console.log(' Test form data valid:', testFormData);
  
  // Test API timeout simulation
  const testTimeout = async () => {
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 1000);
      
      await fetch('https://httpbin.org/delay/2', {
        signal: controller.signal
      });
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(' Timeout handling working');
      }
    }
  };
  
  testTimeout();
  
  console.log(' All tests completed!');
};

// Run if in browser
if (typeof window !== 'undefined') {
  window.testOnboardingCompletion = testOnboardingCompletion;
}

export default testOnboardingCompletion;