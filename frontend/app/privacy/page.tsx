export const metadata = {
  title: 'Politique de confidentialité - Reservia',
  description: 'Politique de confidentialité de la plateforme Reservia',
};

export default function PrivacyPage() {
  return (
    <main className="container-app section">
      <div className="card card-raised animate-fadeInUp">
        <h1 className="admin-users-title">Politique de confidentialité</h1>
        <p className="text-muted mt-4">
          Chez Reservia, nous respectons votre vie privée. Cette page décrit comment nous
          collectons, utilisons et protégeons vos informations. Ceci est un contenu de
          démonstration — remplacez-le par votre texte légal complet.
        </p>

        <section className="mt-6">
          <h2 className="text-lg font-semibold">1. Données collectées</h2>
          <p className="text-subtle mt-2">Types de données que nous pouvons collecter...</p>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold">2. Utilisation des données</h2>
          <p className="text-subtle mt-2">Comment nous utilisons les informations...</p>
        </section>
      </div>
    </main>
  );
}
