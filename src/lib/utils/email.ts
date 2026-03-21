import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({
    region: process.env.AWS_SES_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID || process.env.AWS_IAM_USER_KEY || '',
        secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY || process.env.AWS_IAM_USER_SECRET || '',
    },
});

const MAIL_FROM = process.env.MAIL_FROM || 'noreply@webpipl.com';

interface SendEmailParams {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
    try {
        const command = new SendEmailCommand({
            Source: `PM Tool <${MAIL_FROM}>`,
            Destination: {
                ToAddresses: [to],
            },
            Message: {
                Subject: {
                    Data: subject,
                    Charset: 'UTF-8',
                },
                Body: {
                    Text: {
                        Data: text,
                        Charset: 'UTF-8',
                    },
                    Html: {
                        Data: html || text,
                        Charset: 'UTF-8',
                    },
                },
            },
        });

        const result = await sesClient.send(command);
        console.log('[EMAIL] Sent successfully via AWS SES:', result.MessageId);
        return { success: true, id: result.MessageId };

    } catch (err: any) {
        console.error('[EMAIL] AWS SES error:', err.message || err);
        return { success: false, error: err.message || 'Failed to send email' };
    }
}

export async function sendInvitationEmail(
    email: string,
    orgName: string,
    role: string
) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const signupUrl = `${appUrl}/signup?email=${encodeURIComponent(email)}`;

    return sendEmail({
        to: email,
        subject: `You've been invited to join ${orgName}`,
        text: `You've been invited to join ${orgName} as a ${role}. Sign up here: ${signupUrl}`,
        html: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #4f46e5; padding: 24px; border-radius: 12px 12px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">You're invited! 🎉</h1>
                </div>
                <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
                    <p style="color: #334155; font-size: 16px;">
                        You've been invited to join <strong>${orgName}</strong> on PM Tool.
                    </p>
                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                        <p style="margin: 0; color: #64748b; font-size: 14px;">Invited email</p>
                        <p style="margin: 4px 0 0; color: #1e293b; font-size: 16px; font-weight: bold;">${email}</p>
                        <p style="margin: 8px 0 0; color: #64748b; font-size: 14px;">Role</p>
                        <p style="margin: 4px 0 0; color: #1e293b; font-size: 18px; font-weight: bold; text-transform: capitalize;">${role}</p>
                    </div>
                    <a href="${signupUrl}" 
                       style="display: inline-block; background: #4f46e5; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                        Accept Invitation
                    </a>
                    <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">
                        Or copy this link: ${signupUrl}
                    </p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                        If you weren't expecting this invitation, you can safely ignore this email.
                    </p>
                </div>
            </body>
            </html>
        `
    });
}