
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
  errors?: {
    [key: string]: string[] | undefined;
  }
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

  revalidatePath(redirectTo);
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

export async function addClient(prevState: LoginState, formData: FormData) {
  const supabase = createClient();
  const validatedFields = ClientSchema.safeParse({
    name: formData.get('name'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add client.',
    };
  }
  
  const { error } = await supabase
    .from('clients')
    .insert({ name: validatedFields.data.name });

  if (error) {
    console.error('Supabase error:', error);
    return { message: 'Database Error: Failed to add client.' };
  }

  revalidatePath('/cms/clients');
  // Return a success state or redirect if you prefer form.reset() on client
  return { message: `Added client ${validatedFields.data.name}.` };
}


export async function getClients() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  return { data, error };
}


// Project Actions
const ProjectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  description: z.string().optional(),
  clientId: z.string().uuid("Invalid client ID.").optional().or(z.literal('none')).or(z.literal('')),
  image: z.instanceof(File).refine(file => file.size > 0, "Project image is required.").refine(file => file.size < 4 * 1024 * 1024, "Image must be less than 4MB."),
  link: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
});


export async function addProject(prevState: LoginState, formData: FormData) {
    const supabase = createClient();

    const validatedFields = ProjectSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        clientId: formData.get('clientId'),
        image: formData.get('image'),
        link: formData.get('link'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Failed to create project. Please check the fields.',
        };
    }

    const { title, description, clientId, image, link } = validatedFields.data;

    // 1. Upload image to Supabase Storage
    const imageFileName = `${crypto.randomUUID()}-${image.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project_images')
        .upload(imageFileName, image);

    if (uploadError) {
        console.error('Storage Error:', uploadError);
        return { message: 'Database Error: Failed to upload image.' };
    }

    // 2. Get public URL of the uploaded image
    const { data: urlData } = supabase.storage
        .from('project_images')
        .getPublicUrl(uploadData.path);

    const imageUrl = urlData.publicUrl;

    // 3. Insert project into the database
    const { error: insertError } = await supabase.from('projects').insert({
        title,
        description,
        client_id: clientId === 'none' || clientId === '' ? null : clientId,
        image_url: imageUrl,
        link: link || null,
    });

    if (insertError) {
        console.error('Insert Error:', insertError);
        // If insert fails, maybe delete the uploaded image? (optional)
        return { message: 'Database Error: Failed to save project.' };
    }

    revalidatePath('/cms/projects');
    revalidatePath('/#projects');
    return { message: `Successfully added project "${title}".` };
}

export async function getProjects() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*, clients(name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Get Projects Error:", error);
  }

  return { data, error };
}
