import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'PM Tool <onboarding@resend.dev>',
            to,
            subject,
            text,
            html: html || text,
        });

        if (error) {
            console.error('[EMAIL] Resend error:', error);
            return { success: false, error: error.message };
        }

        console.log('[EMAIL] Sent successfully:', data?.id);
        return { success: true, id: data?.id };

    } catch (err) {
        console.error('[EMAIL] Unexpected error:', err);
        return { success: false, error: 'Failed to send email' };
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
                    <h1 style="color: white; margin: 0; font-size: 24px;">
                        You're invited! 🎉
                    </h1>
                </div>

                <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
                    
                    <p style="color: #334155; font-size: 16px;">
                        You've been invited to join <strong>${orgName}</strong> on PM Tool.
                    </p>

                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                        <p style="margin: 0; color: #64748b; font-size: 14px;">Your role</p>
                        <p style="margin: 4px 0 0; color: #1e293b; font-size: 18px; font-weight: bold; text-transform: capitalize;">
                            ${role}
                        </p>
                    </div>

                    <a href="${signupUrl}" 
                       style="display: inline-block; background: #4f46e5; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 8px 0;">
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