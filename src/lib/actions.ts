
'use server';

import { z } from 'zod';

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

// --- Supabase functionalities are removed ---

export async function authenticate(
  redirectTo: string,
  prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  console.log("Authentication is disabled.");
  return { message: 'Authentication has been removed.', success: false };
}

export async function logout() {
  console.log("Authentication is disabled.");
}

export async function addClient(prevState: LoginState, formData: FormData): Promise<LoginState> {
  console.log("Client actions are disabled.");
  return { message: "Backend is disconnected.", success: false };
}

export async function deleteClient(id: string) {
  console.log("Client actions are disabled.");
  return { success: false, message: "Backend is disconnected." };
}

export async function getClients() {
  console.log("Client actions are disabled.");
  return { data: [], error: null };
}

export async function addProject(prevState: LoginState, formData: FormData): Promise<LoginState> {
  console.log("Project actions are disabled.");
  return { message: "Backend is disconnected.", success: false };
}

export async function deleteProject(id: string, imageUrl: string) {
  console.log("Project actions are disabled.");
  return { success: false, message: "Backend is disconnected." };
}

export async function getProjects() {
    console.log("Project actions are disabled.");
  return { data: [], error: null };
}

export async function addService(prevState: LoginState, formData: FormData): Promise<LoginState> {
  console.log("Service actions are disabled.");
  return { message: "Backend is disconnected.", success: false };
}

export async function deleteService(id: string) {
  console.log("Service actions are disabled.");
  return { success: false, message: "Backend is disconnected." };
}

export async function getServices() {
    console.log("Service actions are disabled.");
  return { data: [], error: null };
}

export async function addTeamMember(prevState: LoginState, formData: FormData): Promise<LoginState> {
  console.log("Team member actions are disabled.");
  return { message: "Backend is disconnected.", success: false };
}

export async function deleteTeamMember(id: string, imageUrl: string) {
  console.log("Team member actions are disabled.");
  return { success: false, message: "Backend is disconnected." };
}

export async function getTeamMembers() {
    console.log("Team member actions are disabled.");
  return { data: [], error: null };
}
