'use server';

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
