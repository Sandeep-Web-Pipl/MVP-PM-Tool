/**
 * Email utility placeholder.
 * 
 * In a real production app, integrate an email service like Resend, SendGrid, or Postmark here.
 */

interface SendEmailParams {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
    console.log(`[EMAIL-MOCK] Sending email to: ${to}`);
    console.log(`[EMAIL-MOCK] Subject: ${subject}`);
    console.log(`[EMAIL-MOCK] Text Content: ${text}`);
    
    // TODO: Implement actual email provider integration
    // Example (Resend):
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({ from: 'onboarding@resend.dev', to, subject, text, html });
    
    return { success: true };
}

export async function sendInvitationEmail(email: string, orgName: string, role: string) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const signupUrl = `${appUrl}/signup?email=${encodeURIComponent(email)}`;
    
    return sendEmail({
        to: email,
        subject: `You've been invited to join ${orgName}`,
        text: `You've been invited to join ${orgName} as a ${role}. Sign up here: ${signupUrl}`,
        html: `
            <h1>Team Invitation</h1>
            <p>You've been invited to join <strong>${orgName}</strong> on PM Tool.</p>
            <p>Role: ${role}</p>
            <p><a href="${signupUrl}">Click here to sign up and join the team</a></p>
        `
    });
}
