// FormData polyfill for React Native 0.79+ compatibility
const FormData = require('react-native/Libraries/Network/FormData');

// Add the installFormDataPatch function that Expo expects
if (!FormData.installFormDataPatch) {
  FormData.installFormDataPatch = function() {
    // This is a no-op for React Native 0.79+ as FormData is already available
    console.log('FormData patch already installed in React Native 0.79+');
  };
}

module.exports = FormData;
