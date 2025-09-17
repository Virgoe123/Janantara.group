

'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import * as LucideIcons from "lucide-react";
import { suggestServiceIcon } from '@/ai/flows/suggest-service-icon';
import { createClient as createAdminClient } from '@supabase/supabase-js';


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
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const AddProjectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  description: z.string().optional(),
  link: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  images: z.array(z.any())
    .refine((files) => files.length > 0, "At least one image is required.")
    .refine((files) => files.every((file) => file.size <= MAX_FILE_SIZE), `Max file size is 5MB.`)
    .refine((files) => files.every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type)), "Only .jpg, .jpeg, .png and .webp formats are supported.")
});


export async function addProject(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const images = formData.getAll('images') as File[];
  
  const validatedFields = AddProjectSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    link: formData.get('link'),
    images: images.filter(f => f.size > 0), // Filter out empty file inputs if any
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Validation failed.', success: false };
  }
  
  const { title, description, link, images: imageFiles } = validatedFields.data;

  const imageUrls: string[] = [];
  
  for (const image of imageFiles) {
    const imageFileName = `${Date.now()}-${image.name}`;
    const { error: uploadError } = await supabase.storage
      .from('project_images')
      .upload(imageFileName, image);

    if (uploadError) {
      // Cleanup uploaded files if one fails
      for (const url of imageUrls) {
          const fileName = url.split('/').pop()
          if(fileName) await supabase.storage.from('project_images').remove([fileName]);
      }
      return { message: `Storage Error: ${uploadError.message}`, success: false };
    }
    
    const { data: { publicUrl } } = supabase.storage.from('project_images').getPublicUrl(imageFileName);
    imageUrls.push(publicUrl);
  }

  const projectData = {
    title,
    description: description || null,
    link: link || null,
    image_urls: imageUrls,
  };

  const { error: dbError } = await supabase.from('projects').insert([projectData]);

  if (dbError) {
    // Cleanup storage if db insert fails
    for (const url of imageUrls) {
        const fileName = url.split('/').pop()
        if(fileName) await supabase.storage.from('project_images').remove([fileName]);
    }
    return { message: `Database Error: ${dbError.message}`, success: false };
  }

  revalidatePath('/cms/projects');
  revalidatePath('/#projects');
  return { message: 'Project added successfully.', success: true };
}

const UpdateProjectSchema = z.object({
  id: z.string(),
  title: z.string().min(2, "Title must be at least 2 characters."),
  description: z.string().optional(),
  link: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  existing_images: z.string().optional(),
  new_images: z.array(z.any()).optional()
    .refine((files) => !files || files.every((file) => file.size <= MAX_FILE_SIZE), `Max file size is 5MB.`)
    .refine((files) => !files || files.every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type)), "Only .jpg, .jpeg, .png and .webp formats are supported.")
});


export async function updateProject(prevState: LoginState, formData: FormData): Promise<LoginState> {
    const supabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const newImages = formData.getAll('new_images') as File[];
    const validatedFields = UpdateProjectSchema.safeParse({
        id: formData.get('id'),
        title: formData.get('title'),
        description: formData.get('description'),
        link: formData.get('link'),
        existing_images: formData.get('existing_images'),
        new_images: newImages.filter(f => f.size > 0),
    });

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors, message: 'Validation failed.', success: false };
    }

    const { id, title, description, link, existing_images, new_images } = validatedFields.data;

    let existingImageUrls = existing_images ? existing_images.split(',') : [];

    // Fetch the current project to see which images were removed
    const { data: currentProject, error: fetchError } = await supabase.from('projects').select('image_urls').eq('id', id).single();
    if(fetchError) {
        return { message: 'Failed to fetch current project data.', success: false };
    }

    const originalImageUrls = currentProject.image_urls || [];
    const imagesToDelete = originalImageUrls.filter(url => !existingImageUrls.includes(url));

    // Delete images from storage
    if (imagesToDelete.length > 0) {
        const fileNamesToDelete = imagesToDelete.map(url => url.split('/').pop()).filter(Boolean) as string[];
        const { error: storageError } = await supabase.storage.from('project_images').remove(fileNamesToDelete);
        if (storageError) {
            console.warn(`Could not delete some images from storage: ${storageError.message}`);
        }
    }
    
    // Upload new images
    const newImageUrls: string[] = [];
    if (new_images && new_images.length > 0) {
        for (const image of new_images) {
            const imageFileName = `${Date.now()}-${image.name}`;
            const { error: uploadError } = await supabase.storage.from('project_images').upload(imageFileName, image);

            if (uploadError) {
                // Potential cleanup of newly uploaded files if one fails
                return { message: `Storage Error: ${uploadError.message}`, success: false };
            }
            const { data: { publicUrl } } = supabase.storage.from('project_images').getPublicUrl(imageFileName);
            newImageUrls.push(publicUrl);
        }
    }

    const finalImageUrls = [...existingImageUrls, ...newImageUrls];

    const { error: dbError } = await supabase
        .from('projects')
        .update({
            title,
            description: description || null,
            link: link || null,
            image_urls: finalImageUrls,
        })
        .eq('id', id);

    if (dbError) {
        return { message: `Database Error: ${dbError.message}`, success: false };
    }

    revalidatePath('/cms/projects');
    revalidatePath('/#projects');
    return { message: 'Project updated successfully.', success: true };
}


export async function deleteProject(id: string, imageUrls: string[]) {
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase.from('projects').delete().eq('id', id);

  if (error) {
    return { success: false, message: `Database Error: ${error.message}` };
  }

  if (imageUrls && imageUrls.length > 0) {
    const fileNames = imageUrls.map(url => url.split('/').pop()).filter(Boolean) as string[];
    if (fileNames.length > 0) {
        const { error: storageError } = await supabase.storage.from('project_images').remove(fileNames);
         if (storageError) {
            console.warn(`Could not delete images from storage: ${storageError.message}`);
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
        image_urls,
        link,
        created_at
      `)
      .order('created_at', { ascending: false });
}

// Service Actions
const ServiceSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  icon: z.string().optional(),
});

export async function addService(prevState: LoginState, formData: FormData): Promise<LoginState> {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const validatedFields = ServiceSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
    });

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors, message: 'Validation failed.', success: false };
    }

    // Suggest an icon using AI
    let iconName = 'Wrench'; // Default icon
    try {
        const iconSuggestion = await suggestServiceIcon({ serviceTitle: validatedFields.data.title });
        iconName = iconSuggestion.iconName;
    } catch (aiError) {
        console.error("AI icon suggestion failed:", aiError);
        // Proceed with default icon, don't block the user
    }

    const serviceData = {
        ...validatedFields.data,
        icon: iconName,
    };

    const { error } = await supabase.from('services').insert([serviceData]);

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

// Testimonial Actions
const TestimonialSchema = z.object({
  name: z.string().min(2, "Name is required."),
  title: z.string().optional(),
  quote: z.string().min(10, "Quote must be at least 10 characters."),
  rating: z.coerce.number().int().min(1, "Rating is required. Please select at least one star.").max(5),
  avatar: z.any().optional(),
  is_published: z.boolean().default(false),
});

export async function addTestimonial(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const fromCms = formData.get('from_cms') === 'true';

  const validatedFields = TestimonialSchema.safeParse({
    name: formData.get('name'),
    title: formData.get('title'),
    quote: formData.get('quote'),
    rating: formData.get('rating'),
    avatar: formData.get('avatar'),
    is_published: fromCms,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check the form for errors.',
      success: false,
    };
  }

  const { name, quote, rating, avatar, is_published } = validatedFields.data;
  const title = validatedFields.data.title || "User";
  let avatar_url: string | null = null;

  // Handle optional avatar upload
  if (avatar && avatar.size > 0) {
    const avatarFileName = `${Date.now()}-${avatar.name}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(avatarFileName, avatar);

    if (uploadError) {
      return { message: `Storage Error: ${uploadError.message}`, success: false };
    }
    
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(avatarFileName);
    avatar_url = publicUrl;
  }

  const testimonialData = { 
      name, 
      title, 
      quote, 
      rating, 
      avatar_url,
      is_published,
  };

  const { error: dbError } = await supabase.from('testimonials').insert([testimonialData]);

  if (dbError) {
    if (avatar_url) {
      const fileName = avatar_url.split('/').pop();
      if (fileName) {
        await supabase.storage.from('avatars').remove([fileName]);
      }
    }
    return { message: `Database Error: ${dbError.message}`, success: false };
  }

  revalidatePath('/cms/testimonials');
  revalidatePath('/#testimonials');

  const successMessage = fromCms 
    ? 'Testimonial added successfully.'
    : 'Thank you! Your review has been submitted for approval.';
  
  return { message: successMessage, success: true };
}

const UpdateTestimonialSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Name is required."),
  title: z.string().min(2, "Title/company is required."),
  quote: z.string().min(10, "Quote must be at least 10 characters."),
  rating: z.coerce.number().int().min(1).max(5),
});

export async function updateTestimonial(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const validatedFields = UpdateTestimonialSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    title: formData.get('title'),
    quote: formData.get('quote'),
    rating: formData.get('rating'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed.',
      success: false,
    };
  }

  const { id, ...dataToUpdate } = validatedFields.data;

  const { error } = await supabase
    .from('testimonials')
    .update(dataToUpdate)
    .eq('id', id);

  if (error) {
    return { message: `Database Error: ${error.message}`, success: false };
  }

  revalidatePath('/cms/testimonials');
  revalidatePath('/#testimonials');
  return { message: 'Testimonial updated successfully.', success: true };
}


export async function deleteTestimonial(id: string, avatarUrl: string | null) {
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase.from('testimonials').delete().eq('id', id);

  if (error) {
    return { success: false, message: `Database Error: ${error.message}` };
  }

  if (avatarUrl) {
    const fileName = avatarUrl.split('/').pop();
    if(fileName) {
        const { error: storageError } = await supabase.storage.from('avatars').remove([`${fileName}`]);
         if (storageError) {
            console.warn(`Could not delete avatar from storage: ${storageError.message}`);
         }
    }
  }

  revalidatePath('/cms/testimonials');
  revalidatePath('/#testimonials');
  return { success: true, message: "Testimonial deleted successfully." };
}

export async function getTestimonials() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    return supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });
}

export async function toggleTestimonialStatus(id: string, currentState: boolean) {
    const supabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
        .from('testimonials')
        .update({ is_published: !currentState })
        .eq('id', id);

    if (error) {
        return { success: false, message: `Database Error: ${error.message}` };
    }

    revalidatePath('/cms/testimonials');
    revalidatePath('/#testimonials');
    const message = !currentState ? "Testimonial published." : "Testimonial unpublished.";
    return { success: true, message };
}
    

    
