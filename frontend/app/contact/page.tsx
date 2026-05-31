export const metadata = {
  title: 'Contact - Reservia',
  description: 'Page de contact pour la plateforme Reservia',
};

import ContactForm from './ContactForm';

export default function ContactPage() {
  return (
    <main className="container-app section">
      <div className="card card-raised animate-fadeInUp">
        <h1 className="admin-users-title">Contact</h1>
        <p className="text-muted mt-4">Pour toute question, écrivez-nous à <a className="text-primary" href="mailto:contact@reservia.example">contact@reservia.example</a> ou utilisez le formulaire ci-dessous.</p>

        <ContactForm />
      </div>
    </main>
  );
}
