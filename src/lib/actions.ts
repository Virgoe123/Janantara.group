
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

const fileSchema = z.any()
  .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
  .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), "Only .jpg, .jpeg, .png and .webp formats are supported.");

const AddProjectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  description: z.string().optional(),
  link: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  thumbnail: z.any()
    .refine(file => file?.size > 0, "Thumbnail image is required.")
    .refine(file => file?.size <= MAX_FILE_SIZE, 'Max file size is 5MB.')
    .refine(file => ACCEPTED_IMAGE_TYPES.includes(file?.type), 'Only .jpg, .jpeg, .png, and .webp formats are supported.'),
  images: z.array(z.any()).optional(),
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
    thumbnail: formData.get('thumbnail'),
    images: images.filter(f => f.size > 0),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Validation failed.', success: false };
  }
  
  const { title, description, link, thumbnail, images: imageFiles } = validatedFields.data;
  let thumbnailUrl: string | null = null;
  const galleryImageUrls: string[] = [];
  
  try {
    // Upload thumbnail
    const thumbFileName = `${Date.now()}-thumb-${thumbnail.name}`;
    const { error: thumbUploadError } = await supabase.storage.from('project_images').upload(thumbFileName, thumbnail);
    if (thumbUploadError) throw new Error(`Thumbnail upload error: ${thumbUploadError.message}`);
    thumbnailUrl = supabase.storage.from('project_images').getPublicUrl(thumbFileName).data.publicUrl;

    // Upload gallery images
    if (imageFiles) {
        for (const image of imageFiles) {
            const imageFileName = `${Date.now()}-gallery-${image.name}`;
            const { error: imageUploadError } = await supabase.storage.from('project_images').upload(imageFileName, image);
            if (imageUploadError) throw new Error(`Gallery image upload error: ${imageUploadError.message}`);
            galleryImageUrls.push(supabase.storage.from('project_images').getPublicUrl(imageFileName).data.publicUrl);
        }
    }

  } catch (error: any) {
     // Cleanup on failure
     if(thumbnailUrl) await supabase.storage.from('project_images').remove([thumbnailUrl.split('/').pop()!]);
     if(galleryImageUrls.length > 0) await supabase.storage.from('project_images').remove(galleryImageUrls.map(url => url.split('/').pop()!));
     return { message: error.message, success: false };
  }


  const projectData = {
    title,
    description: description || null,
    link: link || null,
    thumbnail_url: thumbnailUrl,
    image_urls: galleryImageUrls.length > 0 ? galleryImageUrls : null,
  };

  const { error: dbError } = await supabase.from('projects').insert([projectData]);

  if (dbError) {
    // Cleanup storage if db insert fails
     if(thumbnailUrl) await supabase.storage.from('project_images').remove([thumbnailUrl.split('/').pop()!]);
     if(galleryImageUrls.length > 0) await supabase.storage.from('project_images').remove(galleryImageUrls.map(url => url.split('/').pop()!));
    return { message: `Database Error: ${dbError.message}`, success: false };
  }

  revalidatePath('/cms/projects');
  revalidatePath('/#projects');
  revalidatePath('/');
  return { message: 'Project added successfully.', success: true };
}

const UpdateProjectSchema = z.object({
  id: z.string(),
  title: z.string().min(2, "Title must be at least 2 characters."),
  description: z.string().optional(),
  link: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  existing_gallery_images: z.string().optional(),
  new_thumbnail: z.any().optional(),
  new_gallery_images: z.array(z.any()).optional()
});


export async function updateProject(prevState: LoginState, formData: FormData): Promise<LoginState> {
    const supabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const newGalleryImages = formData.getAll('new_gallery_images') as File[];
    const validatedFields = UpdateProjectSchema.safeParse({
        id: formData.get('id'),
        title: formData.get('title'),
        description: formData.get('description'),
        link: formData.get('link'),
        existing_gallery_images: formData.get('existing_gallery_images'),
        new_thumbnail: formData.get('new_thumbnail'),
        new_gallery_images: newGalleryImages.filter(f => f.size > 0),
    });

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors, message: 'Validation failed.', success: false };
    }

    const { id, title, description, link, existing_gallery_images, new_thumbnail, new_gallery_images } = validatedFields.data;

    const { data: currentProject, error: fetchError } = await supabase.from('projects').select('thumbnail_url, image_urls').eq('id', id).single();
    if(fetchError) {
        return { message: 'Failed to fetch current project data.', success: false };
    }

    let finalThumbnailUrl = currentProject.thumbnail_url;
    let existingGalleryUrls = existing_gallery_images ? existing_gallery_images.split(',').filter(Boolean) : [];

    try {
        // Handle thumbnail update
        if (new_thumbnail && new_thumbnail.size > 0) {
            // Delete old thumbnail if it exists
            if (currentProject.thumbnail_url) {
                const oldThumbName = currentProject.thumbnail_url.split('/').pop();
                if(oldThumbName) await supabase.storage.from('project_images').remove([oldThumbName]);
            }
            // Upload new thumbnail
            const thumbFileName = `${Date.now()}-thumb-${new_thumbnail.name}`;
            const { error: thumbUploadError } = await supabase.storage.from('project_images').upload(thumbFileName, new_thumbnail);
            if (thumbUploadError) throw new Error(`Thumbnail upload error: ${thumbUploadError.message}`);
            finalThumbnailUrl = supabase.storage.from('project_images').getPublicUrl(thumbFileName).data.publicUrl;
        }

        // Handle gallery image deletions
        const originalGalleryUrls = currentProject.image_urls || [];
        const imagesToDelete = originalGalleryUrls.filter(url => !existingGalleryUrls.includes(url));
        if (imagesToDelete.length > 0) {
            const fileNamesToDelete = imagesToDelete.map(url => url.split('/').pop()).filter(Boolean) as string[];
            await supabase.storage.from('project_images').remove(fileNamesToDelete);
        }

        // Handle new gallery image uploads
        const newImageUrls: string[] = [];
        if (new_gallery_images && new_gallery_images.length > 0) {
            for (const image of new_gallery_images) {
                const imageFileName = `${Date.now()}-gallery-${image.name}`;
                const { error: uploadError } = await supabase.storage.from('project_images').upload(imageFileName, image);
                if (uploadError) throw new Error(`Storage Error: ${uploadError.message}`);
                newImageUrls.push(supabase.storage.from('project_images').getPublicUrl(imageFileName).data.publicUrl);
            }
        }
        
        const finalGalleryUrls = [...existingGalleryUrls, ...newImageUrls];

        const { error: dbError } = await supabase
            .from('projects')
            .update({
                title,
                description: description || null,
                link: link || null,
                thumbnail_url: finalThumbnailUrl,
                image_urls: finalGalleryUrls.length > 0 ? finalGalleryUrls : null,
            })
            .eq('id', id);

        if (dbError) throw new Error(`Database Error: ${dbError.message}`);

    } catch (error: any) {
        return { message: error.message, success: false };
    }
    
    revalidatePath('/cms/projects');
    revalidatePath('/#projects');
    revalidatePath('/');
    return { message: 'Project updated successfully.', success: true };
}


export async function deleteProject(id: string) {
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: project, error: fetchError } = await supabase.from('projects').select('thumbnail_url, image_urls').eq('id', id).single();

  if (fetchError) {
      return { success: false, message: `Could not fetch project to delete images: ${fetchError.message}` };
  }

  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) {
    return { success: false, message: `Database Error: ${error.message}` };
  }

  const imagesToDelete: string[] = [];
  if (project.thumbnail_url) {
      imagesToDelete.push(project.thumbnail_url);
  }
  if (project.image_urls && project.image_urls.length > 0) {
      imagesToDelete.push(...project.image_urls);
  }
  
  if (imagesToDelete.length > 0) {
    const fileNames = imagesToDelete.map(url => url.split('/').pop()).filter(Boolean) as string[];
    if (fileNames.length > 0) {
        const { error: storageError } = await supabase.storage.from('project_images').remove(fileNames);
         if (storageError) {
            console.warn(`Could not delete some images from storage: ${storageError.message}`);
         }
    }
  }

  revalidatePath('/cms/projects');
  revalidatePath('/#projects');
  revalidatePath('/');
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
        thumbnail_url,
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
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check the form for errors.',
      success: false,
    };
  }

  const { name, quote, rating, avatar } = validatedFields.data;
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
      is_published: fromCms,
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

  const validatedFields = UpdateTestimonialSchema.safeParse(Object.fromEntries(formData.entries()));

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
    
// Contact Settings Actions
const ContactSettingsSchema = z.object({
    whatsapp: z.string().regex(/^\d+$/, { message: "Must be only digits" }).optional().or(z.literal('')),
    email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal('')),
    instagram: z.string().optional(),
});

export async function getContactSettings() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    return supabase.from('contact_settings').select('key, value');
}

export async function updateContactSettings(prevState: LoginState, formData: FormData): Promise<LoginState> {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const validatedFields = ContactSettingsSchema.safeParse({
        whatsapp: formData.get('whatsapp'),
        email: formData.get('email'),
        instagram: formData.get('instagram'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation failed.',
            success: false,
        };
    }

    const settingsToUpdate = Object.entries(validatedFields.data)
        .map(([key, value]) => ({ key, value: value || '' }));

    const { error } = await supabase.from('contact_settings').upsert(settingsToUpdate, { onConflict: 'key' });

    if (error) {
        return { message: `Database Error: ${error.message}`, success: false };
    }

    revalidatePath('/cms/contact');
    revalidatePath('/#contact');
    return { message: 'Contact settings updated successfully.', success: true };
}
