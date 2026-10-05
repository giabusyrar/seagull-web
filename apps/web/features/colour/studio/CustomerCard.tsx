'use client';

import React from 'react';
import { UserRound } from 'lucide-react';

/** The simulated customer: personal details only, no customer id (every run is a dry run). */
export interface StudioCustomer {
  fullName: string;
  email: string;
  phoneNumber: string;
  /** YYYY-MM-DD, as core's evaluate takes it; feeds the ageing score. */
  dateOfBirth: string;
}

export const EMPTY_CUSTOMER: StudioCustomer = { fullName: '', email: '', phoneNumber: '', dateOfBirth: '' };

/** The customer's details in the engines' field names; empty ones are left out. */
export function customerFields(c: StudioCustomer): Record<string, string> {
  const f: Record<string, string> = {
    full_name: c.fullName.trim(),
    email: c.email.trim(),
    phone_number: c.phoneNumber.trim(),
    date_of_birth: c.dateOfBirth,
  };
  return Object.fromEntries(Object.entries(f).filter(([, v]) => !!v));
}

const fieldCls =
  'h-9 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground outline-none focus:border-ring';

/**
 * Who the run is for, as in the simulator's Customer step. Personal details
 * only: the studio scores as a dry run, so core stores nothing and needs no
 * customer id. Kept in this browser between reloads.
 */
export function CustomerCard({ value, onChange }: { value: StudioCustomer; onChange: (c: StudioCustomer) => void }) {
  const input = (key: keyof StudioCustomer, label: string, type: string, autoComplete: string) => (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <input
        type={type}
        autoComplete={autoComplete}
        value={value[key]}
        onChange={(e) => onChange({ ...value, [key]: e.target.value })}
        className={fieldCls}
      />
    </label>
  );
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <UserRound className="h-3.5 w-3.5" />
          Pelanggan
        </span>
        <span className="text-[11px] text-emerald-700">Dry run: tidak ada yang disimpan</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {input('fullName', 'Nama', 'text', 'name')}
        {input('email', 'Email', 'email', 'email')}
        {input('phoneNumber', 'Telepon', 'tel', 'tel')}
        {input('dateOfBirth', 'Tanggal lahir', 'date', 'bday')}
      </div>
    </div>
  );
}
