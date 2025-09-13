import { useState } from "react";
import { Link } from "react-router-dom";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { getDefaultLocale } from "@/lib/i18n";

const SERVICES = [
  { id: 'pay-house-tax', title: 'Pay House Tax Online' },
  { id: 'pay-water-tax', title: 'Pay Water Tax Online' },
  { id: 'birth-cert', title: 'Apply for Birth Certificate' },
  { id: 'death-cert', title: 'Apply for Death Certificate' },
  { id: 'lodge-complaint', title: 'Lodge a Complaint (Civic Issues)' },
  { id: 'track-complaint', title: 'Track Complaint Status' },
  { id: 'book-hall', title: 'Book Community Hall / Ground' },
  { id: 'apply-trade-license', title: 'Apply for Trade License' },
  { id: 'renew-trade-license', title: 'Renew Trade License' },
  { id: 'property-mutation', title: 'Property Mutation Request' },
  { id: 'solid-waste', title: 'Solid Waste Management (Garbage Pickup)' },
  { id: 'building-plan', title: 'Apply for Building Plan Approval' },
  { id: 'streetlight-repair', title: 'Request Streetlight Repair' },
  { id: 'marriage-cert', title: 'Apply for Marriage Certificate' },
  { id: 'ration-card', title: 'Apply for Ration Card' },
  { id: 'pay-parking', title: 'Pay Parking Fees Online' },
  { id: 'emergency-helpline', title: 'Emergency Helpline / Contact Municipal Officer' },
];

export default function Services() {
  const [locale, setLocale] = useLocalStorage<string>('locale', getDefaultLocale());
  const [query, setQuery] = useState('');
  const uid = typeof window !== 'undefined' ? localStorage.getItem('uid') : null;

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 grid grid-cols-3 items-center gap-4">
          <div />
          <h1 className="text-2xl font-bold text-center">Services</h1>
          <div className="flex items-center justify-end">
            {!uid && (
              <div className="flex items-center gap-2">
                <Link to="/" className="rounded-md border px-3 py-1.5 text-sm hover:bg-white/5">Login</Link>
                <Link to="/signup" className="rounded-md bg-primary px-3 py-1.5 text-sm text-white hover:opacity-90">Sign Up</Link>
              </div>
            )}
          </div>
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {SERVICES.map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="group block p-8 min-h-[88px] flex items-center justify-center text-center text-sm font-medium rounded-2xl bg-gradient-to-br from-blue-50 to-white/5 border border-blue-100 hover:scale-105 hover:shadow-lg transition-transform duration-300"
              aria-label={s.title}
            >
              <span className="text-sm text-foreground">{s.title}</span>
            </a>
          ))}

          <Link to="/" className="group block p-8 min-h-[88px] flex items-center justify-center text-center text-sm font-medium rounded-2xl bg-gradient-to-br from-blue-50 to-white/5 border border-blue-100 hover:scale-105 hover:shadow-lg transition-transform duration-300">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
