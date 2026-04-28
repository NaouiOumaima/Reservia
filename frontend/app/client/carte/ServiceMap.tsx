'use client';

import dynamic from 'next/dynamic';

const LeafletMapComponent = dynamic(() => import('./LeafletMapComponent'), {
  ssr: false,
  loading: () => (
    <div className="service-map-loading">
      <div className="spinner" />
      <p>Chargement de la carte…</p>
    </div>
  ),
});

export default function ServiceMap(props: any) {
  return <LeafletMapComponent {...props} />;
}