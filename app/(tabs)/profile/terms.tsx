import React from 'react';
import LegalContentPage, { ContentItem } from '@/components/profile/LegalContentPage';

const content: ContentItem[] = [
  {
    type: 'paragraph',
    text: "This is a placeholder for your Terms of Use. It's crucial to replace this with your actual terms before releasing your app. These terms govern your use of NetWorthTrackr.",
  },
  {
    type: 'subheader',
    text: '1. Acceptance of Terms',
  },
  {
    type: 'paragraph',
    text: 'By accessing or using our service, you agree to be bound by these terms. If you disagree with any part of the terms, then you may not access the service.',
  },
  {
    type: 'subheader',
    text: '2. User Accounts',
  },
  {
    type: 'paragraph',
    text: 'When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.',
  },
];

const TermsOfUseScreen = () => {
  return (
    <LegalContentPage
      title="Terms of Use"
      lastUpdated={new Date().toLocaleDateString()}
      content={content}
    />
  );
};

export default TermsOfUseScreen;