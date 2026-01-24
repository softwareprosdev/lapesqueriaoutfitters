import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Resend } from 'resend';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not defined');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    const { to, cc, bcc, subject, body } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, body' },
        { status: 400 }
      );
    }

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@lapesqueria.com',
      to: to.split(',').map((email: string) => email.trim()),
      ...(cc && { cc: cc.split(',').map((email: string) => email.trim()) }),
      ...(bcc && { bcc: bcc.split(',').map((email: string) => email.trim()) }),
      subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <!-- Header -->
              <div style="background: linear-gradient(to right, #0891b2, #14b8a6); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">La Pesqueria's Studio</h1>
                <p style="color: #e0f2fe; margin: 5px 0 0 0; font-size: 14px;">Ocean Conservation Platform</p>
              </div>

              <!-- Content -->
              <div style="padding: 40px 30px;">
                ${body.split('\n').map((paragraph: string) => {
                  // Convert basic markdown to HTML
                  const html = paragraph
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: #0891b2;">$1</a>');

                  if (html.startsWith('- ')) {
                    return `<li style="margin-bottom: 8px;">${html.substring(2)}</li>`;
                  }

                  return `<p style="color: #374151; line-height: 1.6; margin: 0 0 16px 0;">${html || '&nbsp;'}</p>`;
                }).join('')}
              </div>

              <!-- Footer -->
              <div style="background-color: #f3f4f6; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                  © ${new Date().getFullYear()} La Pesqueria's Studio • Ocean Conservation Platform
                </p>
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  💚 10% of every purchase supports sea turtle conservation
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);

      // Log failed email attempt
      await prisma.emailLog.create({
        data: {
          to,
          subject,
          template: 'ADMIN_CUSTOM',
          status: 'failed',
          error: error.message || 'Unknown error',
          provider: 'resend',
        },
      });

      return NextResponse.json(
        { error: 'Failed to send email: ' + error.message },
        { status: 500 }
      );
    }

    // Build HTML content for storage
    const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <!-- Header -->
              <div style="background: linear-gradient(to right, #0891b2, #14b8a6); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">La Pesqueria's Studio</h1>
                <p style="color: #e0f2fe; margin: 5px 0 0 0; font-size: 14px;">Ocean Conservation Platform</p>
              </div>

              <!-- Content -->
              <div style="padding: 40px 30px;">
                ${body.split('\n').map((paragraph: string) => {
                  // Convert basic markdown to HTML
                  const html = paragraph
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: #0891b2;">$1</a>');

                  if (html.startsWith('- ')) {
                    return `<li style="margin-bottom: 8px;">${html.substring(2)}</li>`;
                  }

                  return `<p style="color: #374151; line-height: 1.6; margin: 0 0 16px 0;">${html || '&nbsp;'}</p>`;
                }).join('')}
              </div>

              <!-- Footer -->
              <div style="background-color: #f3f4f6; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                  © ${new Date().getFullYear()} La Pesqueria's Studio • Ocean Conservation Platform
                </p>
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  💚 10% of every purchase supports sea turtle conservation
                </p>
              </div>
            </div>
          </body>
        </html>
      `;

    // Log successful email
    await prisma.emailLog.create({
      data: {
        to,
        subject,
        template: 'ADMIN_CUSTOM',
        status: 'sent',
        provider: 'resend',
        providerId: data?.id || null,
        htmlContent,
        sentAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      id: data?.id,
    });
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
