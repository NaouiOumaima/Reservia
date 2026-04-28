'use client';

import { useEffect, useState } from 'react';
import { servicesApi, CreateServiceData } from '@/lib/api/services';
import { ServicesIcon, RestaurantIcon, HotelIcon, SpaIcon, DumbbellIcon, LipstickIcon, StarIcon } from '@/components/ui/Icons';

export default function ProviderServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<CreateServiceData>({
    name: '', category: 'restaurant', description: '', basePrice: 0, duration: 60,
    location: { coordinates: [10.1815, 36.8065], address: '', city: '', governorate: '' }
  });

  const loadServices = async () => {
    try {
      const data = await servicesApi.getByProvider();
      setServices(data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadServices(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await servicesApi.update(editing._id, form);
      } else {
        await servicesApi.create(form);
      }
      setShowForm(false);
      setEditing(null);
      loadServices();
    } catch (error) { console.error(error); }
  };

  const toggleActive = async (service: any) => {
    await servicesApi.toggleActive(service._id);
    loadServices();
  };

  const deleteService = async (id: string) => {
    if (confirm('Supprimer ce service ?')) {
      await servicesApi.delete(id);
      loadServices();
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'restaurant': return <RestaurantIcon className="w-5 h-5" />;
      case 'hotel': return <HotelIcon className="w-5 h-5" />;
      case 'spa': return <SpaIcon className="w-5 h-5" />;
      case 'gym': return <DumbbellIcon className="w-5 h-5" />;
      case 'salon': return <LipstickIcon className="w-5 h-5" />;
      default: return <ServicesIcon className="w-5 h-5" />;
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="spinner" /></div>;

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div><h1 className="text-2xl font-bold">Mes Services</h1><p className="text-muted">Gérez vos services</p></div>
          <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', category: 'restaurant', description: '', basePrice: 0, duration: 60, location: { coordinates: [10.1815, 36.8065], address: '', city: '', governorate: '' } }); }} className="btn btn-primary">+ Ajouter</button>
        </div>

        {(showForm || editing) && (
          <div className="card mb-8">
            <h3 className="text-lg font-semibold mb-4">{editing ? 'Modifier' : 'Ajouter'} un service</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nom" className="input" required />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
                <option value="restaurant">Restaurant</option><option value="hotel">Hôtel</option><option value="spa">Spa</option><option value="gym">Salle de sport</option><option value="salon">Salon</option>
              </select>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input md:col-span-2" rows={3} placeholder="Description" required />
              <input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: +e.target.value })} placeholder="Prix (DT)" className="input" required />
              <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: +e.target.value })} placeholder="Durée (min)" className="input" required />
              <input type="text" value={form.location.address} onChange={(e) => setForm({ ...form, location: { ...form.location, address: e.target.value } })} placeholder="Adresse" className="input md:col-span-2" required />
              <div className="md:col-span-2 flex justify-end gap-4">
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn btn-ghost">Annuler</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Mettre à jour' : 'Créer'}</button>
              </div>
            </form>
          </div>
        )}

        {services.length === 0 ? (
          <div className="card text-center py-12"><ServicesIcon className="w-16 h-16 text-muted mx-auto mb-4" /><h3 className="text-xl font-semibold mb-2">Aucun service</h3><button onClick={() => setShowForm(true)} className="btn btn-primary">Ajouter un service</button></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => (
              <div key={service._id} className="card overflow-hidden p-0">
                <div className="h-40 bg-gray-200 relative">
                  {service.images?.[0] && <img src={service.images[0]} alt={service.name} className="w-full h-full object-cover" />}
                  <span className={`absolute top-2 left-2 badge ${service.isActive ? 'badge-success' : 'badge-error'}`}>{service.isActive ? 'Actif' : 'Inactif'}</span>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1 text-muted text-sm">{getCategoryIcon(service.category)}{service.category}</div>
                    <div className="flex gap-2"><button onClick={() => toggleActive(service)} className="text-primary text-sm">{service.isActive ? 'Désactiver' : 'Activer'}</button><button onClick={() => deleteService(service._id)} className="text-error text-sm">Supprimer</button></div>
                  </div>
                  <h3 className="font-semibold mt-2">{service.name}</h3>
                  <p className="text-sm text-muted">{service.location.city}, {service.location.governorate}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-primary font-bold">{service.basePrice} DT</span>
                    <button onClick={() => { setEditing(service); setForm({ ...service, location: service.location }); setShowForm(true); }} className="text-primary text-sm">Modifier</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}