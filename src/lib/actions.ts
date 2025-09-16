
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

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
  },
  success?: boolean;
};

export async function authenticate(
  redirectTo: string,
  prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const validatedFields = LoginSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.flatten().fieldErrors;
    const firstError = errorMessages.email?.[0] ?? errorMessages.password?.[0] ?? 'Invalid fields. Failed to login.';
    return {
      message: firstError,
      success: false,
    };
  }

  const { email, password } = validatedFields.data;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Supabase Auth Error:', error.message);
    return { message: 'Invalid credentials. Please try again.', success: false };
  }

  revalidatePath(redirectTo);
  return redirect(redirectTo);
}

export async function logout() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  await supabase.auth.signOut();
  redirect('/');
}

// Client Actions
const ClientSchema = z.object({
  name: z.string().min(2, "Client name must be at least 2 characters."),
});

export async function addClient(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const validatedFields = ClientSchema.safeParse({
    name: formData.get('name'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add client.',
      success: false,
    };
  }
  
  const { error } = await supabase
    .from('clients')
    .insert({ name: validatedFields.data.name });

  if (error) {
    console.error('Supabase error:', error);
    return { message: 'Database Error: Failed to add client.', success: false };
  }

  revalidatePath('/cms/clients');
  return { message: `Added client ${validatedFields.data.name}.`, success: true };
}

export async function deleteClient(id: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.from('clients').delete().match({ id });

  if (error) {
    console.error('Delete Client Error:', error);
    return { success: false, message: 'Database Error: Failed to delete client.' };
  }

  revalidatePath('/cms/clients');
  return { success: true, message: 'Client deleted successfully.' };
}


export async function getClients(cookieStore?: ReturnType<typeof cookies>) {
  const supabase = createClient(cookieStore ?? cookies());
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


export async function addProject(prevState: LoginState, formData: FormData): Promise<LoginState> {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

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
            success: false,
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
        return { message: 'Database Error: Failed to upload image.', success: false };
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
        return { message: 'Database Error: Failed to save project.', success: false };
    }

    revalidatePath('/cms/projects');
    revalidatePath('/#projects');
    return { message: `Successfully added project "${title}".`, success: true };
}

export async function deleteProject(id: string, imageUrl: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. Delete image from storage
  if (imageUrl) {
    const fileName = imageUrl.split('/').pop();
    if (fileName) {
      const { error: storageError } = await supabase.storage.from('project_images').remove([fileName]);
      if (storageError) {
        console.error('Storage Delete Error:', storageError);
        return { success: false, message: 'Failed to delete project image.' };
      }
    }
  }

  // 2. Delete project from database
  const { error: dbError } = await supabase.from('projects').delete().match({ id });
  if (dbError) {
    console.error('DB Delete Error:', dbError);
    return { success: false, message: 'Database Error: Failed to delete project.' };
  }

  revalidatePath('/cms/projects');
  revalidatePath('/#projects');
  return { success: true, message: 'Project deleted successfully.' };
}


export async function getProjects(cookieStore: ReturnType<typeof cookies>) {
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from('projects')
    .select('*, clients(name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Get Projects Error:", error);
  }

  return { data, error };
}

// Service Actions
const ServiceSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  icon: z.string().min(2, "Icon name is required."),
});

export async function addService(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const validatedFields = ServiceSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    icon: formData.get('icon'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add service.',
      success: false,
    };
  }

  const { title, description, icon } = validatedFields.data;

  const { error } = await supabase.from('services').insert({
    title,
    description,
    icon,
  });

  if (error) {
    console.error('Supabase error:', error);
    return { message: 'Database Error: Failed to add service.', success: false };
  }

  revalidatePath('/cms/services');
  revalidatePath('/#services');
  return { message: `Added service "${title}".`, success: true };
}

export async function deleteService(id: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.from('services').delete().match({ id });

  if (error) {
    console.error('Delete Service Error:', error);
    return { success: false, message: 'Database Error: Failed to delete service.' };
  }

  revalidatePath('/cms/services');
  revalidatePath('/#services');
  return { success: true, message: 'Service deleted successfully.' };
}


export async function getServices(cookieStore: ReturnType<typeof cookies>) {
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: false });

  return { data, error };
}

// Team Member Actions
const TeamMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  role: z.string().min(2, "Role must be at least 2 characters."),
  image: z.instanceof(File).refine(file => file.size > 0, "Image is required.").refine(file => file.size < 4 * 1024 * 1024, "Image must be less than 4MB."),
});

export async function addTeamMember(prevState: LoginState, formData: FormData): Promise<LoginState> {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const validatedFields = TeamMemberSchema.safeParse({
        name: formData.get('name'),
        role: formData.get('role'),
        image: formData.get('image'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Failed to add team member. Please check the fields.',
            success: false,
        };
    }

    const { name, role, image } = validatedFields.data;

    // 1. Upload image to Supabase Storage
    const imageFileName = `${crypto.randomUUID()}-${image.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('team_images')
        .upload(imageFileName, image);

    if (uploadError) {
        console.error('Storage Error:', uploadError);
        return { message: 'Database Error: Failed to upload image.', success: false };
    }

    // 2. Get public URL of the uploaded image
    const { data: urlData } = supabase.storage
        .from('team_images')
        .getPublicUrl(uploadData.path);

    const imageUrl = urlData.publicUrl;

    // 3. Insert team member into the database
    const { error: insertError } = await supabase.from('team_members').insert({
        name,
        role,
        image_url: imageUrl,
    });

    if (insertError) {
        console.error('Insert Error:', insertError);
        return { message: 'Database Error: Failed to save team member.', success: false };
    }

    revalidatePath('/cms/team');
    revalidatePath('/#about');
    return { message: `Successfully added team member "${name}".`, success: true };
}

export async function deleteTeamMember(id: string, imageUrl: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  if (imageUrl) {
    const fileName = imageUrl.split('/').pop();
    if (fileName) {
      const { error: storageError } = await supabase.storage.from('team_images').remove([fileName]);
      if (storageError) {
        console.error('Storage Delete Error:', storageError);
        return { success: false, message: 'Failed to delete member image.' };
      }
    }
  }

  const { error: dbError } = await supabase.from('team_members').delete().match({ id });
  if (dbError) {
    console.error('DB Delete Error:', dbError);
    return { success: false, message: 'Database Error: Failed to delete team member.' };
  }

  revalidatePath('/cms/team');
  revalidatePath('/#about');
  return { success: true, message: 'Team member deleted successfully.' };
}


export async function getTeamMembers(cookieStore: ReturnType<typeof cookies>) {
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Get Team Members Error:", error);
  }

  return { data, error };
}
