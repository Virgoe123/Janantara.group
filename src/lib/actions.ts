
'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import * as LucideIcons from "lucide-react";

export async function submitContactForm(data: { name: string; email: string; message:string }) {
  try {
    console.log('Contact form submitted:', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: 'Thank you for your message! We will get back to you soon.' };
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

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
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { message: error.message, success: false };
  }
  
  redirect(redirectTo);
}

export async function logout() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  await supabase.auth.signOut();
  redirect('/admin/login');
}

// Client Actions
const ClientSchema = z.object({
  name: z.string().min(2, 'Client name must be at least 2 characters.'),
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
      message: 'Validation failed.',
      success: false,
    };
  }
  
  const { data, error } = await supabase.from('clients').insert([validatedFields.data]).select();

  if (error) {
    return { message: error.message, success: false };
  }

  revalidatePath('/cms/clients');
  return { message: 'Client added successfully.', success: true };
}

export async function deleteClient(id: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('clients').delete().eq('id', id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath('/cms/clients');
  return { success: true, message: "Client deleted successfully." };
}

export async function getClients() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  return supabase.from('clients').select('id, name, created_at').order('created_at', { ascending: false });
}

// Project Actions
const ProjectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  description: z.string().optional(),
  link: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  clientId: z.string().optional(),
  image: z
    .any()
    .refine((file) => file?.size > 0, "Project image is required.")
    .refine((file) => file?.size <= 5000000, `Max file size is 5MB.`)
});


export async function addProject(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const validatedFields = ProjectSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    link: formData.get('link'),
    clientId: formData.get('clientId'),
    image: formData.get('image'),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Validation failed.', success: false };
  }
  
  const { title, description, link, clientId, image } = validatedFields.data;

  // Upload image
  const imageFileName = `${Date.now()}-${image.name}`;
  const { data: imageData, error: imageError } = await supabase.storage
    .from('project_images')
    .upload(`${imageFileName}`, image);

  if (imageError) {
    return { message: `Storage Error: ${imageError.message}`, success: false };
  }

  const { data: { publicUrl } } = supabase.storage.from('project_images').getPublicUrl(`${imageFileName}`);
  
  const projectData: any = {
    title,
    description: description || null,
    link: link || null,
    image_url: publicUrl,
    client_id: clientId === '' || clientId === 'no-client' ? null : clientId
  };

  const { error: dbError } = await supabase.from('projects').insert([projectData]);

  if (dbError) {
     await supabase.storage.from('project_images').remove([`${imageFileName}`]);
    return { message: `Database Error: ${dbError.message}`, success: false };
  }

  revalidatePath('/cms/projects');
  revalidatePath('/#projects');
  return { message: 'Project added successfully.', success: true };
}

export async function deleteProject(id: string, imageUrl: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('projects').delete().eq('id', id);

  if (error) {
    return { success: false, message: `Database Error: ${error.message}` };
  }

  if (imageUrl) {
    const fileName = imageUrl.split('/').pop();
    if(fileName) {
        const { error: storageError } = await supabase.storage.from('project_images').remove([`${fileName}`]);
         if (storageError) {
            console.warn(`Could not delete image from storage: ${storageError.message}`);
         }
    }
  }

  revalidatePath('/cms/projects');
  revalidatePath('/#projects');
  return { success: true, message: "Project deleted successfully." };
}

export async function getProjects() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    return supabase
      .from('projects')
      .select(`
        id,
        title,
        description,
        image_url,
        link,
        created_at,
        clients ( name )
      `)
      .order('created_at', { ascending: false });
}

// Service Actions
const iconNames = Object.keys(LucideIcons) as (keyof typeof LucideIcons)[];
const ServiceSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  icon: z.string().refine((val) => iconNames.includes(val as any), {
    message: "Invalid icon name. Must be a valid Lucide-React icon name.",
  }),
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
        return { errors: validatedFields.error.flatten().fieldErrors, message: 'Validation failed.', success: false };
    }

    const { error } = await supabase.from('services').insert([validatedFields.data]);

    if (error) {
        return { message: `Database Error: ${error.message}`, success: false };
    }

    revalidatePath('/cms/services');
    revalidatePath('/#services');
    return { message: 'Service added successfully.', success: true };
}

export async function deleteService(id: string) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { error } = await supabase.from('services').delete().eq('id', id);

    if (error) {
        return { success: false, message: `Database Error: ${error.message}` };
    }

    revalidatePath('/cms/services');
    revalidatePath('/#services');
    return { success: true, message: 'Service deleted successfully.' };
}

export async function getServices() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    return supabase.from('services').select('*').order('created_at', { ascending: false });
}

// Team Member Actions
const TeamMemberSchema = z.object({
    name: z.string().min(2, "Name is required"),
    role: z.string().min(2, "Role is required"),
    image: z.any()
        .refine((file) => file?.size > 0, "Image is required.")
        .refine((file) => file?.size <= 2000000, `Max file size is 2MB.`),
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
        return { errors: validatedFields.error.flatten().fieldErrors, message: 'Validation failed.', success: false };
    }
    
    const { name, role, image } = validatedFields.data;

    const imageFileName = `${Date.now()}-${image.name}`;
    const { error: imageError } = await supabase.storage.from('team_images').upload(`${imageFileName}`, image);

    if (imageError) {
        return { message: `Storage Error: ${imageError.message}`, success: false };
    }

    const { data: { publicUrl } } = supabase.storage.from('team_images').getPublicUrl(`${imageFileName}`);
    
    const { error: dbError } = await supabase.from('team_members').insert([{ name, role, image_url: publicUrl }]);

    if (dbError) {
        await supabase.storage.from('team_images').remove([`${imageFileName}`]);
        return { message: `Database Error: ${dbError.message}`, success: false };
    }
    
    revalidatePath('/cms/team');
    revalidatePath('/#about');
    return { message: 'Team member added successfully.', success: true };
}

export async function deleteTeamMember(id: string, imageUrl: string) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.from('team_members').delete().eq('id', id);

    if (error) {
        return { success: false, message: `Database Error: ${error.message}` };
    }

    if (imageUrl) {
        const fileName = imageUrl.split('/').pop();
        if(fileName) {
            const { error: storageError } = await supabase.storage.from('team_images').remove([`${fileName}`]);
            if (storageError) {
                console.warn(`Could not delete image from storage: ${storageError.message}`);
            }
        }
    }

    revalidatePath('/cms/team');
    revalidatePath('/#about');
    return { success: true, message: 'Team member deleted successfully.' };
}

export async function getTeamMembers() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    return supabase.from('team_members').select('*').order('created_at', { ascending: false });
}
