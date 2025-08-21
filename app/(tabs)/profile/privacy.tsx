import React from 'react';
import LegalContentPage, { ContentItem } from '@/components/profile/LegalContentPage';

const content: ContentItem[] = [
  {
    type: 'paragraph',
    text: "This is a placeholder for your Privacy Policy. It's crucial to replace this with your actual policy before releasing your app. A privacy policy is a legal document that discloses some or all of the ways a party gathers, uses, discloses, and manages a customer or client's data.",
  },
  {
    type: 'subheader',
    text: '1. Information We Collect',
  },
  {
    type: 'paragraph',
    text: 'We collect information you provide directly to us, such as when you create an account (email, name). We also collect financial data you input into the app (account names, balances). All financial data is encrypted and only accessible by you.',
  },
  {
    type: 'subheader',
    text: '2. How We Use Your Information',
  },
  {
    type: 'paragraph',
    text: 'We use the information we collect to operate, maintain, and provide you with the features and functionality of the app, as well as to communicate with you, such as to send you service-related emails.',
  },
];

const PrivacyPolicyScreen = () => {
  return (
    <LegalContentPage
      title="Privacy Policy"
      lastUpdated={new Date().toLocaleDateString()}
      content={content}
    />
  );
};

export default PrivacyPolicyScreen;