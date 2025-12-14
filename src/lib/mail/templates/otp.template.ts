export const otpTemplate = ({
  title,
  message,
  code,
  footer,
}: {
  title: string;
  message: string;
  code: string;
  footer: string;
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OTP Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; line-height: 1.6; color: #333;">
  <div role="article" aria-roledescription="email" lang="en" style="background-color: #f8f9fa; padding: 20px;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 20px 0;">
          <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); overflow: hidden; border: 1px solid #e9ecef;">
            
            <!-- Header with Logo/Brand -->
            <tr>
              <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 40px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: 600; letter-spacing: 1px;">
                  ${title}
                </h1>
              </td>
            </tr>

            <!-- Main Content -->
            <tr>
              <td style="padding: 40px;">
                
                <!-- Greeting/Message -->
                <p style="font-size: 16px; color: #495057; margin: 0 0 24px 0; text-align: center;">
                  ${message}
                </p>

                <!-- OTP Box -->
                <div style="text-align:center; margin:32px 0;">
                  <p style="margin:0 0 12px 0; font-size:15px; color:#6b7280;">Your One-Time Code</p>
                  <div style="display:inline-block; padding:16px 28px; font-size:26px; letter-spacing:6px; font-weight:700; color:#111827; background:#f9fafb; border:1px dashed #c7d2fe; border-radius:10px;">
                    ${code}
                  </div>
                  <p style="margin-top:14px; font-size:13px; color:#9ca3af;">This code will expire shortly</p>
                </div>

                <!-- Security Tip -->
                <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 16px; margin: 24px 0;">
                  <p style="font-size: 14px; color: #856404; margin: 0; text-align: center; font-weight: 500;">
                    🔒 For your security, never share this code with anyone. We will never ask for it.
                  </p>
                </div>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f8f9fa; padding: 20px 40px; text-align: center; border-top: 1px solid #e9ecef;">
                <p style="font-size: 14px; color: #6c757d; margin: 0 0 4px 0; line-height: 1.5;">
                  If you didn't request this code, please ignore this email.
                </p>
                <p style="font-size: 13px; color: #79828aff; margin: 0; line-height: 1.4;">
                  ${footer}
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;