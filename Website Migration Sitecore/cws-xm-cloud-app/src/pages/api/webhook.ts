import type { NextApiRequest, NextApiResponse } from 'next';

type WebhookResponse = {
  isSuccessful: boolean;
  responseContent?: string;
  error?: {
    code: string;
    message: string;
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<WebhookResponse>) {
  // Only allow POST requests, otherwise redirect to same page
  if (req.method !== 'POST') {
    const referer = req.headers.referer || '/';
    return res.redirect(302, referer);
  }

  try {
    // Extract form data from request body
    const formData = req.body;

    // TODO: Add your form processing logic here
    // Examples:
    // - Send email notification
    // - Save to database
    // - Forward to external API
    // - Integrate with CRM

    // For now, return success
    return res.status(200).json({
      isSuccessful: true,
      responseContent: JSON.stringify({
        message: 'Form submitted successfully',
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('Webhook error:', error);

    return res.status(500).json({
      isSuccessful: false,
      error: {
        code: '500',
        message: error instanceof Error ? error.message : 'Internal server error',
      },
    });
  }
}
