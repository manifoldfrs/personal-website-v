"use server"

import { z } from "zod"
import { Resend } from "resend"

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
})

const resend = new Resend(process.env.RESEND_API_KEY)

export async function submitContactForm(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  }

  const result = contactSchema.safeParse(rawData)

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    const firstError = Object.values(errors)[0]?.[0]
    return { success: false, error: firstError || "Invalid form data" }
  }

  const { name, email, message } = result.data

  try {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.log("Contact form submission (no Resend API key configured):")
      console.log({ name, email, message })
      return { success: true }
    }

    await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
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

    return { success: true }
  } catch (error) {
    console.error("Failed to send email:", error)
    return { success: false, error: "Failed to send message. Please try again later." }
  }
}
