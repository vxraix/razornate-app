import { Resend } from "resend";
import twilio from "twilio";
import { prisma } from "./prisma";
import { format } from "date-fns";

// Initialize Resend (Email service)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Initialize Twilio (WhatsApp service)
const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@razornate.com";
const FROM_NAME = process.env.FROM_NAME || "Razornate";
const TWILIO_WHATSAPP_NUMBER =
  process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886"; // Twilio sandbox number

export interface AppointmentNotificationData {
  appointmentId: string;
  userName: string;
  userEmail: string;
  userPhone?: string | null;
  serviceName: string;
  appointmentDate: Date;
  appointmentTime: string;
  notes?: string | null;
  paymentReference?: string | null;
  amount?: number | null;
}

/**
 * Send email notification
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("Resend API key not configured. Email not sent.");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
    });

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send WhatsApp message
 */
export async function sendWhatsApp({
  to,
  message,
}: {
  to: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!twilioClient) {
    console.warn(
      "Twilio credentials not configured. WhatsApp message not sent."
    );
    return { success: false, error: "WhatsApp service not configured" };
  }

  // Format phone number (remove non-digits, add country code if needed)
  let phoneNumber = to.replace(/\D/g, "");

  // If phone doesn't start with country code, assume it's a local number
  // You may need to adjust this based on your country
  if (!phoneNumber.startsWith("1") && !phoneNumber.startsWith("597")) {
    // Add default country code if needed (adjust for your region)
    // For Suriname, country code is +597
    if (phoneNumber.length < 10) {
      phoneNumber = `597${phoneNumber}`;
    }
  }

  const whatsappTo = `whatsapp:+${phoneNumber}`;

  try {
    const messageResult = await twilioClient.messages.create({
      from: TWILIO_WHATSAPP_NUMBER,
      to: whatsappTo,
      body: message,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error sending WhatsApp message:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Log communication to database
 */
async function logCommunication({
  userId,
  type,
  subject,
  content,
  direction = "OUTBOUND",
}: {
  userId: string;
  type: "EMAIL" | "SMS" | "CALL" | "NOTE" | "MESSAGE" | "WHATSAPP";
  subject?: string;
  content: string;
  direction?: "INBOUND" | "OUTBOUND";
}) {
  try {
    await prisma.communicationLog.create({
      data: {
        userId,
        type,
        subject,
        content,
        direction,
      },
    });
  } catch (error) {
    console.error("Error logging communication:", error);
    // Don't throw - logging failure shouldn't break notification sending
  }
}

/**
 * Send appointment confirmation email
 */
export async function sendAppointmentConfirmationEmail(
  data: AppointmentNotificationData,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const formattedDate = format(data.appointmentDate, "EEEE, MMMM d, yyyy");
  const formattedTime = format(data.appointmentDate, "h:mm a");

  const subject = `Appointment Confirmed - ${data.serviceName}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Appointment Confirmed!</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Hi ${data.userName},
                    </p>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Your appointment has been confirmed! We're looking forward to seeing you.
                    </p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 20px 0;">
                      <tr>
                        <td style="padding: 10px 0;">
                          <strong style="color: #667eea;">Service:</strong>
                          <span style="color: #333333; margin-left: 10px;">${
                            data.serviceName
                          }</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <strong style="color: #667eea;">Date:</strong>
                          <span style="color: #333333; margin-left: 10px;">${formattedDate}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <strong style="color: #667eea;">Time:</strong>
                          <span style="color: #333333; margin-left: 10px;">${formattedTime}</span>
                        </td>
                      </tr>
                      ${
                        data.amount
                          ? `
                      <tr>
                        <td style="padding: 10px 0;">
                          <strong style="color: #667eea;">Amount:</strong>
                          <span style="color: #333333; margin-left: 10px;">$${data.amount.toFixed(
                            2
                          )}</span>
                        </td>
                      </tr>
                      `
                          : ""
                      }
                      ${
                        data.paymentReference
                          ? `
                      <tr>
                        <td style="padding: 10px 0;">
                          <strong style="color: #667eea;">Payment Reference:</strong>
                          <span style="color: #333333; margin-left: 10px;">${data.paymentReference}</span>
                        </td>
                      </tr>
                      `
                          : ""
                      }
                    </table>
                    
                    ${
                      data.notes
                        ? `
                    <p style="color: #333333; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                      <strong>Your notes:</strong> ${data.notes}
                    </p>
                    `
                        : ""
                    }
                    
                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                      If you need to reschedule or cancel, please contact us as soon as possible.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="color: #666666; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} Razornate. All rights reserved.
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

  const result = await sendEmail({
    to: data.userEmail,
    subject,
    html,
  });

  // Log communication
  if (result.success) {
    await logCommunication({
      userId,
      type: "EMAIL",
      subject,
      content: `Appointment confirmation sent for ${data.serviceName} on ${formattedDate} at ${formattedTime}`,
    });
  }

  return result;
}

/**
 * Send appointment reminder email
 */
export async function sendAppointmentReminderEmail(
  data: AppointmentNotificationData,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const formattedDate = format(data.appointmentDate, "EEEE, MMMM d, yyyy");
  const formattedTime = format(data.appointmentDate, "h:mm a");

  const subject = `Reminder: Your Appointment Tomorrow - ${data.serviceName}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Appointment Reminder</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Hi ${data.userName},
                    </p>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      This is a friendly reminder that you have an appointment scheduled with us:
                    </p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 20px 0;">
                      <tr>
                        <td style="padding: 10px 0;">
                          <strong style="color: #f5576c;">Service:</strong>
                          <span style="color: #333333; margin-left: 10px;">${
                            data.serviceName
                          }</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <strong style="color: #f5576c;">Date:</strong>
                          <span style="color: #333333; margin-left: 10px;">${formattedDate}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <strong style="color: #f5576c;">Time:</strong>
                          <span style="color: #333333; margin-left: 10px;">${formattedTime}</span>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                      We look forward to seeing you! If you need to reschedule, please contact us as soon as possible.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="color: #666666; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} Razornate. All rights reserved.
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

  const result = await sendEmail({
    to: data.userEmail,
    subject,
    html,
  });

  // Log communication
  if (result.success) {
    await logCommunication({
      userId,
      type: "EMAIL",
      subject,
      content: `Appointment reminder sent for ${data.serviceName} on ${formattedDate} at ${formattedTime}`,
    });
  }

  return result;
}

/**
 * Send appointment confirmation via WhatsApp
 */
export async function sendAppointmentConfirmationWhatsApp(
  data: AppointmentNotificationData,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!data.userPhone) {
    return { success: false, error: "No phone number provided" };
  }

  const formattedDate = format(data.appointmentDate, "EEEE, MMMM d, yyyy");
  const formattedTime = format(data.appointmentDate, "h:mm a");

  const message = `🎉 *Appointment Confirmed!*

Hi ${data.userName},

Your appointment has been confirmed!

*Service:* ${data.serviceName}
*Date:* ${formattedDate}
*Time:* ${formattedTime}
${data.amount ? `*Amount:* $${data.amount.toFixed(2)}` : ""}
${data.paymentReference ? `*Payment Reference:* ${data.paymentReference}` : ""}

${data.notes ? `*Your notes:* ${data.notes}` : ""}

We're looking forward to seeing you! If you need to reschedule or cancel, please contact us as soon as possible.

- Razornate Team`;

  const result = await sendWhatsApp({
    to: data.userPhone,
    message,
  });

  // Log communication
  if (result.success) {
    await logCommunication({
      userId,
      type: "WHATSAPP",
      content: `Appointment confirmation sent via WhatsApp for ${data.serviceName} on ${formattedDate} at ${formattedTime}`,
    });
  }

  return result;
}

/**
 * Send appointment reminder via WhatsApp
 */
export async function sendAppointmentReminderWhatsApp(
  data: AppointmentNotificationData,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!data.userPhone) {
    return { success: false, error: "No phone number provided" };
  }

  const formattedDate = format(data.appointmentDate, "EEEE, MMMM d, yyyy");
  const formattedTime = format(data.appointmentDate, "h:mm a");

  const message = `⏰ *Appointment Reminder*

Hi ${data.userName},

This is a friendly reminder that you have an appointment scheduled:

*Service:* ${data.serviceName}
*Date:* ${formattedDate}
*Time:* ${formattedTime}

We look forward to seeing you! If you need to reschedule, please contact us as soon as possible.

- Razornate Team`;

  const result = await sendWhatsApp({
    to: data.userPhone,
    message,
  });

  // Log communication
  if (result.success) {
    await logCommunication({
      userId,
      type: "WHATSAPP",
      content: `Appointment reminder sent via WhatsApp for ${data.serviceName} on ${formattedDate} at ${formattedTime}`,
    });
  }

  return result;
}

/**
 * Send both email and WhatsApp notifications (if configured)
 */
export async function sendAppointmentNotifications(
  data: AppointmentNotificationData,
  userId: string,
  types: ("email" | "whatsapp")[] = ["email", "whatsapp"]
): Promise<{
  email?: { success: boolean; error?: string };
  whatsapp?: { success: boolean; error?: string };
}> {
  const results: {
    email?: { success: boolean; error?: string };
    whatsapp?: { success: boolean; error?: string };
  } = {};

  if (types.includes("email")) {
    results.email = await sendAppointmentConfirmationEmail(data, userId);
  }

  if (types.includes("whatsapp") && data.userPhone) {
    results.whatsapp = await sendAppointmentConfirmationWhatsApp(data, userId);
  }

  return results;
}

/**
 * Send admin notification email when a new appointment is created
 */
export async function sendAdminAppointmentNotification(
  data: AppointmentNotificationData,
  adminEmail: string
): Promise<{ success: boolean; error?: string }> {
  const formattedDate = format(data.appointmentDate, "EEEE, MMMM d, yyyy");
  const formattedTime = format(data.appointmentDate, "h:mm a");

  const subject = `New Appointment Booking - ${data.serviceName}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">New Appointment Booking</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      A new appointment has been booked!
                    </p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 20px 0;">
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                          <strong style="color: #667eea;">Client Name:</strong>
                          <span style="color: #333333; margin-left: 10px;">${
                            data.userName
                          }</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                          <strong style="color: #667eea;">Client Email:</strong>
                          <span style="color: #333333; margin-left: 10px;">${
                            data.userEmail
                          }</span>
                        </td>
                      </tr>
                      ${
                        data.userPhone
                          ? `
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                          <strong style="color: #667eea;">Client Phone:</strong>
                          <span style="color: #333333; margin-left: 10px;">${data.userPhone}</span>
                        </td>
                      </tr>
                      `
                          : ""
                      }
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                          <strong style="color: #667eea;">Service:</strong>
                          <span style="color: #333333; margin-left: 10px;">${
                            data.serviceName
                          }</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                          <strong style="color: #667eea;">Date:</strong>
                          <span style="color: #333333; margin-left: 10px;">${formattedDate}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                          <strong style="color: #667eea;">Time:</strong>
                          <span style="color: #333333; margin-left: 10px;">${formattedTime}</span>
                        </td>
                      </tr>
                      ${
                        data.amount
                          ? `
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                          <strong style="color: #667eea;">Amount:</strong>
                          <span style="color: #333333; margin-left: 10px;">$${data.amount.toFixed(
                            2
                          )}</span>
                        </td>
                      </tr>
                      `
                          : ""
                      }
                      ${
                        data.paymentReference
                          ? `
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                          <strong style="color: #667eea;">Payment Reference:</strong>
                          <span style="color: #333333; margin-left: 10px;">${data.paymentReference}</span>
                        </td>
                      </tr>
                      `
                          : ""
                      }
                      <tr>
                        <td style="padding: 10px 0;">
                          <strong style="color: #667eea;">Appointment ID:</strong>
                          <span style="color: #333333; margin-left: 10px;">${
                            data.appointmentId
                          }</span>
                        </td>
                      </tr>
                    </table>
                    
                    ${
                      data.notes
                        ? `
                    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                      <strong style="color: #856404;">Client Notes:</strong>
                      <p style="color: #856404; margin: 10px 0 0 0; line-height: 1.6;">${data.notes}</p>
                    </div>
                    `
                        : ""
                    }
                    
                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                      Please review this appointment in your admin dashboard.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="color: #666666; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} Razornate. All rights reserved.
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

  const result = await sendEmail({
    to: adminEmail,
    subject,
    html,
  });

  return result;
}
