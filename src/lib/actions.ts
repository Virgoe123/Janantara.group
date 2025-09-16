'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

export async function submitContactForm(data: { name: string; email: string; message:string }) {
  try {
    // In a real application, you would send an email, save to a database, etc.
    console.log('Contact form submitted:', data);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, message: 'Thank you for your message! We will get back to you soon.' };
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export type LoginState = {
  errors?: {
    email?: string[];
    password?: string[];
  };
  message?: string | null;
};

export async function authenticate(
  prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  
  const validatedFields = LoginSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Failed to login.',
    };
  }

  const { email, password } = validatedFields.data;

  if (!db) {
    return { message: 'Database is not configured. Please check your environment variables.' };
  }

  try {
    const user = await db.query('SELECT * FROM "users" WHERE email = $1', [email]);
    
    if (!user.rows.length) {
      return { message: 'Invalid credentials.' };
    }
    
    // IMPORTANT: In a real app, you MUST hash and compare passwords.
    // This is a simplified example.
    const isPasswordCorrect = password === user.rows[0].password;

    if (!isPasswordCorrect) {
      return { message: 'Invalid credentials.' };
    }
    
    // If login is successful, you would typically create a session here
    // For now, we'll just log it.
    console.log('Login successful for:', email);

  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'A database error occurred.' };
  }

  // Redirect to an admin dashboard on successful login
  redirect('/admin/dashboard');
}
