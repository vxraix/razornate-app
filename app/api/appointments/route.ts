import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  sendAppointmentNotifications,
  sendAdminAppointmentNotification,
} from "@/lib/notifications";
import { format } from "date-fns";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        service: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(appointments);
  } catch (error: any) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { serviceId, date, notes } = body;

    if (!serviceId || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Check for conflicts
    const appointmentDate = new Date(date);
    const endTime = new Date(
      appointmentDate.getTime() + service.duration * 60000
    );

    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        date: {
          gte: appointmentDate,
          lt: endTime,
        },
        status: {
          not: "CANCELLED",
        },
      },
    });

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: "Time slot is already booked" },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: session.user.id,
        serviceId,
        date: appointmentDate,
        notes,
        status: "PENDING",
        // Create payment record with bank transfer as default for Suriname
        payment: {
          create: {
            amount: service.price,
            method: "BANK_TRANSFER",
            status: "UNPAID",
            paymentReference: `APT-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)
              .toUpperCase()}`,
          },
        },
      },
      include: {
        service: true,
        payment: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Send notification emails/WhatsApp (non-blocking - don't fail appointment creation if notification fails)
    try {
      const notificationTypes: ("email" | "whatsapp")[] = [];
      if (process.env.RESEND_API_KEY) notificationTypes.push("email");
      if (process.env.TWILIO_ACCOUNT_SID && appointment.user.phone) {
        notificationTypes.push("whatsapp");
      }

      if (notificationTypes.length > 0 && appointment.user.email) {
        await sendAppointmentNotifications(
          {
            appointmentId: appointment.id,
            userName: appointment.user.name || "Valued Customer",
            userEmail: appointment.user.email,
            userPhone: appointment.user.phone,
            serviceName: service.name,
            appointmentDate: appointment.date,
            appointmentTime: format(appointment.date, "h:mm a"),
            notes: appointment.notes,
            paymentReference: appointment.payment?.paymentReference || null,
            amount: appointment.payment?.amount || null,
          },
          session.user.id,
          notificationTypes
        );
      }

      // Send admin notification email
      if (process.env.RESEND_API_KEY) {
        await sendAdminAppointmentNotification(
          {
            appointmentId: appointment.id,
            userName: appointment.user.name || "Valued Customer",
            userEmail: appointment.user.email,
            userPhone: appointment.user.phone,
            serviceName: service.name,
            appointmentDate: appointment.date,
            appointmentTime: format(appointment.date, "h:mm a"),
            notes: appointment.notes,
            paymentReference: appointment.payment?.paymentReference || null,
            amount: appointment.payment?.amount || null,
          },
          "nathanwijnaldum1@gmail.com"
        );
      }
    } catch (notificationError) {
      // Log error but don't fail the appointment creation
      console.error(
        "Error sending appointment notifications:",
        notificationError
      );
    }

    return NextResponse.json(appointment, { status: 201 });
  } catch (error: any) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create appointment" },
      { status: 500 }
    );
  }
}
