"use server"

import { z } from "zod"
import { Resend } from "resend"

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
})

const resend = new Resend(process.env.RESEND_API_KEY)

export type ContactState = {
  status: "idle" | "success" | "error"
  error?: string
  values?: { name: string; email: string; message: string }
}

export async function submitContactForm(
  _prevState: ContactState,
  formData: FormData
): Promise<ContactState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  }

  const result = contactSchema.safeParse(values)

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    const firstError = Object.values(errors)[0]?.[0]
    return { status: "error", error: firstError || "Invalid form data", values }
  }

  const { name, email, message } = result.data

  try {
    // Without a Resend API key we accept the submission but cannot deliver it.
    if (!process.env.RESEND_API_KEY) {
      console.log("Contact form submission received (no Resend API key configured)")
      return { status: "success" }
    }

    await resend.emails.send({
      from: "Contact Form <contact@hbb.dev>",
      to: "faris@duck.com",
      subject: `New message from ${name}`,
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `,
      replyTo: email,
    })

    return { status: "success" }
  } catch (error) {
    console.error("Failed to send email:", error)
    return { status: "error", error: "Failed to send message. Please try again later.", values }
  }
}
