import { useMutation } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-expo';

import { useSupabase } from './useSupabase';
import { useToast } from './providers/ToastProvider';

interface FeedbackPayload {
  type: string;
  subject: string;
  body: string;
}

export const useSubmitFeedback = () => {
  const supabase = useSupabase();
  const { showToast } = useToast();
  const { user } = useUser();

  return useMutation({
    mutationFn: async (feedback: FeedbackPayload) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.from('feedback').insert({
        // The user_id now comes from the authenticated Clerk user
        user_id: user.id,
        type: feedback.type,
        subject: feedback.subject,
        body: feedback.body,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      showToast('Feedback Sent!', 'success', { text: 'Thank you for helping us improve!' });
    },
    onError: (error: any) => {
      let errorMessage = error.message || 'Could not send feedback. Please try again.';
      if (error.message && error.message.includes('violates row-level security policy')) {
        errorMessage = 'You have reached the daily feedback limit. Please try again tomorrow.';
      }
      showToast('Submission Failed', 'error', { text: errorMessage });
    },
  });
};