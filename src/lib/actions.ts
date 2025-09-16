
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';

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
  message?: string | null;
};

export async function authenticate(
  redirectTo: string,
  prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  
  const validatedFields = LoginSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.flatten().fieldErrors;
    const firstError = errorMessages.email?.[0] ?? errorMessages.password?.[0] ?? 'Invalid fields. Failed to login.';
    return {
      message: firstError,
    };
  }

  const { email, password } = validatedFields.data;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Supabase Auth Error:', error.message);
    return { message: 'Invalid credentials. Please try again.' };
  }

  return redirect(redirectTo);
}
