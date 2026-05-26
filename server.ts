import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

// Define maps for human-readable values in backend processing logs
const serviceMap: Record<string, string> = {
  "extraction": "Tooth & Wisdom Tooth Extraction",
  "filling": "Filling",
  "root-canal": "Root Canal Treatment",
  "crown-bridge": "Crown / Bridge / Complete Denture",
  "scaling": "Scaling",
  "polishing": "Polishing",
  "orthodontic": "Orthodontic Treatment",
  "smile-correction": "Smile Correction & Veneers",
  "general-dentistry": "General Dentistry",
  "pediatric": "Pediatric Dentistry",
  "implant": "Dental Implant",
  "minor-surgery": "Minor Surgery",
  "digital-xray": "Digital X-Ray"
};

const doctorMap: Record<string, string> = {
  "sushmita": "Dr. Sushmita Roy",
  "divya": "Dr. Divya Chadda Some",
  "arkojit": "Dr. Arkojit Goswami"
};

interface Booking {
  fullName: string;
  email: string;
  phone: string;
  serviceId: string;
  doctorId: string;
  date: string;
  timeSlot: string;
  message: string;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON request body parser
  app.use(express.json());

  // In-memory bookings database
  const bookings: Booking[] = [];

  // API endpoint: Get all logged bookings
  app.get("/api/bookings", (req, res) => {
    res.json({ count: bookings.length, bookings });
  });

  // API endpoint: Log booking and return custom WhatsApp redirect link
  app.post("/api/booking", (req, res) => {
    const { fullName, email, phone, serviceId, doctorId, date, timeSlot, message } = req.body;

    if (!fullName || !email || !phone || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newBooking: Booking = {
      fullName,
      email,
      phone,
      serviceId,
      doctorId,
      date,
      timeSlot,
      message: message || ""
    };
    bookings.push(newBooking);

    // Backend logging activity
    console.log("-----------------------------------------");
    console.log("💾 NEW BOOKING SAVED IN BACKEND RESOURCE:");
    console.log(`👤 Patient: ${fullName}`);
    console.log(`📧 Email: ${email}`);
    console.log(`📞 Phone: ${phone}`);
    console.log(`🩺 Service: ${serviceMap[serviceId] || serviceId}`);
    console.log(`👩‍⚕️ Practitioner: ${doctorMap[doctorId] || doctorId}`);
    console.log(`📅 Date & Time: ${date} at ${timeSlot}`);
    console.log(`💬 Note: ${message || "N/A"}`);
    console.log("-----------------------------------------");

    const serviceName = serviceMap[serviceId] || serviceId;
    const doctorName = doctorMap[doctorId] || doctorId;

    // Create a personalized patient intake report formatted for WhatsApp
    const whatsappMessage = `Hello Dr. Sushmita's Clinic,

I would like to book a dental appointment:
• Patient Name: ${fullName}
• Contact Phone: ${phone}
• Email Profile: ${email}
• Requested Service: ${serviceName}
• Preferred Doctor: ${doctorName}
• Selected Date: ${date}
• Selected Time Slot: ${timeSlot}
• Direct Intake Message: ${message || "N/A"}

Please confirm my appointment slot. Thank you!`;

    const rawWhatsappNumber = process.env.WHATSAPP_OWNER_NUMBER || "917384359142";
    // Sanitize phone number to contain only digits (remove spaces, +, dashes, etc.)
    const whatsappNumber = rawWhatsappNumber.replace(/[^0-9]/g, "");
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    res.json({
      success: true,
      message: "Booking successfully saved on backend database!",
      booking: newBooking,
      whatsappUrl
    });
  });

  // Integrate Vite middleware for development or serve custom static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
