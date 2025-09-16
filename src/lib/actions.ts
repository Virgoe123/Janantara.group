
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';
import { revalidatePath } from 'next/cache';

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

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/');
}

// Client Actions
const ClientSchema = z.object({
  name: z.string().min(2, "Client name must be at least 2 characters."),
});

export async function addClient(formData: FormData) {
  const supabase = createClient();
  const validatedFields = ClientSchema.safeParse({
    name: formData.get('name'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { error } = await supabase
    .from('clients')
    .insert({ name: validatedFields.data.name });

  if (error) {
    console.error('Supabase error:', error);
    return { error: 'Failed to add client.' };
  }

  revalidatePath('/cms/clients');
  redirect('/cms/clients');
}

export async function getClients() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  return { data, error };
}
