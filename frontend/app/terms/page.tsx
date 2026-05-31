export const metadata = {
  title: 'Conditions Générales d\'Utilisation - Reservia',
  description: 'Conditions générales d\'utilisation de la plateforme Reservia',
};

export default function TermsPage() {
  return (
    <main className="container-app section">
      <div className="card card-raised animate-fadeInUp">
        <h1 className="admin-users-title">Conditions Générales d'Utilisation</h1>
        <p className="text-muted mt-4">
          Les présentes conditions définissent les règles d'utilisation du service Reservia.
          Ceci est un contenu de démonstration — remplacez-le par vos CGU complètes.
        </p>

        <section className="mt-6">
          <h2 className="text-lg font-semibold">1. Objet</h2>
          <p className="text-subtle mt-2">Description de l'objet du service...</p>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold">2. Responsabilités</h2>
          <p className="text-subtle mt-2">Règles et limitations...</p>
        </section>
      </div>
    </main>
  );
}
