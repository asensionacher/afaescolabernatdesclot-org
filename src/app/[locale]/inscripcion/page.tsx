import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

const FORM_URL = 'https://forms.gle/nqmeTwBiCQkpMFe7A';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Inscripció | AFA Bernat Desclot',
    robots: { index: false, follow: false },
  };
}

export default function RegistrationPage(): never {
  redirect(FORM_URL);
}
