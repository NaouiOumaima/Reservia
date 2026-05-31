'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  return (
    <>
      {!sent ? (
        <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <div>
            <label className="label">Votre nom</label>
            <input className="input" type="text" required />
          </div>
          <div>
            <label className="label">Votre email</label>
            <input className="input" type="email" required />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea className="input" rows={5} required />
          </div>
          <div>
            <button className="btn btn-primary" type="submit">Envoyer le message</button>
          </div>
        </form>
      ) : (
        <div className="alert alert-success mt-6">Merci ! Votre message a été envoyé.</div>
      )}
    </>
  );
}
