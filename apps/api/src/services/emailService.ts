export interface SendTurnEmailOptions {
  to: string;
  username: string;
  matchId: string;
  gameTitle?: string;
  opponentUsername?: string;
  playMode?: string;
}

export interface EmailServiceResult {
  success: boolean;
  provider: string;
  messageId?: string;
  error?: string;
}

export function generateTurnEmailHtml(options: SendTurnEmailOptions): { subject: string; html: string; text: string } {
  const { username, matchId, gameTitle = 'Kingdoms', opponentUsername, playMode = 'ASYNC' } = options;
  const baseUrl = (process.env.APP_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const matchUrl = `${baseUrl}/matches/${matchId}`;

  const subject = `It's your turn in ${gameTitle}! 🎲`;

  const opponentInfo = opponentUsername ? ` vs <strong>${opponentUsername}</strong>` : '';

  const text = `Hello ${username},\n\nIt is now your turn to make a move in your ${playMode} match of ${gameTitle}! ${opponentUsername ? `(vs ${opponentUsername})` : ''}\n\nPlay your turn now: ${matchUrl}\n\nHappy gaming,\nThe BoardGameTime Team`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #1e293b; border-radius: 16px; border: 1px solid rgba(245, 158, 11, 0.25); overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center; background: linear-gradient(180deg, rgba(245, 158, 11, 0.15) 0%, rgba(30, 41, 59, 0) 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; background-color: rgba(245, 158, 11, 0.2); border-radius: 12px; font-size: 24px; margin-bottom: 12px;">
                🎲
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #f59e0b; letter-spacing: -0.02em;">
                BoardGameTime
              </h1>
              <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;">
                Turn Notification
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #f8fafc;">
                It's your turn, ${username}!
              </h2>
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                Your presence is requested in your <strong>${gameTitle}</strong> (${playMode.toLowerCase()}) match${opponentInfo}. Your opponent has made their move and the board is waiting for you!
              </p>

              <!-- Match Details Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.08); margin-bottom: 28px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Game Details</div>
                    <div style="font-size: 14px; color: #f8fafc; font-weight: 600;">Title: <span style="color: #fbbf24;">${gameTitle}</span></div>
                    <div style="font-size: 14px; color: #f8fafc; margin-top: 4px;">Mode: <span style="color: #38bdf8;">${playMode}</span></div>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 6px; font-family: monospace;">Match ID: ${matchId}</div>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${matchUrl}" style="display: inline-block; padding: 14px 32px; background-color: #f59e0b; color: #0f172a; text-decoration: none; font-size: 16px; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);">
                      Play Your Turn Now &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0f172a; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                You received this email because game turn reminders are enabled for your account.<br>
                You can manage notification settings in your <a href="${baseUrl}/settings" style="color: #f59e0b; text-decoration: none;">Account Settings</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return { subject, html, text };
}

export async function sendTurnEmail(options: SendTurnEmailOptions): Promise<EmailServiceResult> {
  const provider = (process.env.EMAIL_PROVIDER || 'console').toLowerCase();
  const fromEmail = process.env.EMAIL_FROM || 'BoardGameTime <notifications@boardgameti.me>';
  const { subject, html, text } = generateTurnEmailHtml(options);

  if (provider === 'sendgrid') {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.warn('[EmailService] SENDGRID_API_KEY is missing. Falling back to console logger.');
      return logConsoleEmail(options, subject, text);
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: options.to, name: options.username }],
              subject,
            },
          ],
          from: parseEmailAddress(fromEmail),
          content: [
            { type: 'text/plain', value: text },
            { type: 'text/html', value: html },
          ],
        }),
      });

      if (response.ok || response.status === 202) {
        return {
          success: true,
          provider: 'sendgrid',
          messageId: response.headers.get('x-message-id') || `sg-${Date.now()}`,
        };
      } else {
        const errorText = await response.text();
        console.error('[EmailService] SendGrid API error:', response.status, errorText);
        return {
          success: false,
          provider: 'sendgrid',
          error: `SendGrid returned status ${response.status}: ${errorText}`,
        };
      }
    } catch (err: any) {
      console.error('[EmailService] SendGrid network error:', err);
      return {
        success: false,
        provider: 'sendgrid',
        error: err.message || 'SendGrid network failure',
      };
    }
  }

  if (provider === 'resend') {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('[EmailService] RESEND_API_KEY is missing. Falling back to console logger.');
      return logConsoleEmail(options, subject, text);
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [options.to],
          subject,
          html,
          text,
        }),
      });

      const resData = (await response.json()) as any;
      if (response.ok) {
        return {
          success: true,
          provider: 'resend',
          messageId: resData.id,
        };
      } else {
        console.error('[EmailService] Resend API error:', resData);
        return {
          success: false,
          provider: 'resend',
          error: resData.message || 'Resend error',
        };
      }
    } catch (err: any) {
      console.error('[EmailService] Resend network error:', err);
      return {
        success: false,
        provider: 'resend',
        error: err.message || 'Resend network failure',
      };
    }
  }

  // Default: Console Logger provider (local dev / test mode)
  return logConsoleEmail(options, subject, text);
}

function logConsoleEmail(options: SendTurnEmailOptions, subject: string, text: string): EmailServiceResult {
  console.log('====================================================');
  console.log(`[EmailService LOG] Sending email to: ${options.to} (${options.username})`);
  console.log(`[EmailService LOG] Subject: ${subject}`);
  console.log(`[EmailService LOG] Content:\n${text}`);
  console.log('====================================================');

  return {
    success: true,
    provider: 'console',
    messageId: `console-${Date.now()}`,
  };
}

function parseEmailAddress(emailStr: string): { email: string; name?: string } {
  const match = emailStr.match(/^(.*)<(.*)>$/);
  if (match) {
    return {
      name: match[1].trim(),
      email: match[2].trim(),
    };
  }
  return { email: emailStr.trim() };
}
