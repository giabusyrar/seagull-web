'use client';

import React, { useState } from 'react';
import { UserPlus, Check, Send } from 'lucide-react';
import { Modal, Input, Button, SearchableSelect, type SelectOption } from '@gateway-experience/shared';

const ROLE_OPTIONS: SelectOption[] = [
  { value: 'Editor', label: 'Editor (Can edit requests and collections)' },
  { value: 'Viewer', label: 'Viewer (Read-only access)' },
  { value: 'Admin', label: 'Admin (Full workspace permissions)' },
];

export interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Editor');
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setIsSubmitting(false);
      setEmail('');
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title="Invite Team Members"
      icon={<UserPlus className="h-4 w-4 text-primary" />}
      isLoading={isSubmitting}
      loadingText="Sending Invitation..."
    >
      {sent ? (
        <div className="p-6 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Check className="h-5 w-5" />
          </div>
          <h4 className="font-bold text-foreground text-sm">Invitation Sent!</h4>
          <p className="text-muted-foreground text-xs">An email invitation has been sent to {email}.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-muted-foreground font-medium text-xs">Email Address</label>
            <Input
              type="email"
              placeholder="colleague@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-muted-foreground font-medium text-xs">Role Permission</label>
            <SearchableSelect
              value={role}
              onChange={setRole}
              options={ROLE_OPTIONS}
              placeholder="Select role..."
            />
          </div>

          <div className="pt-2 flex justify-end border-t border-border">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              leftIcon={<Send className="h-3 w-3" />}
            >
              Send Invite
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
