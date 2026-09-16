'use client';

import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { Modal, ChipMultiSelect, FACIAL_ZONES, type ChipOption } from '@gateway-experience/shared';

export const FACIAL_ZONE_OPTIONS: ChipOption[] = FACIAL_ZONES.map((zone) => ({ value: zone.code, label: zone.label }));

interface ApplicableZonesModalProps {
  isOpen: boolean;
  onClose: () => void;
  capability: string | null;
  initialZones: string[];
  onSave: (capability: string, zones: string[]) => Promise<{ success: boolean; error?: string }>;
}

export const ApplicableZonesModal: React.FC<ApplicableZonesModalProps> = ({
  isOpen,
  onClose,
  capability,
  initialZones,
  onSave,
}) => {
  const [zones, setZones] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setZones(initialZones);
      setError(null);
    }
  }, [isOpen, initialZones]);

  const handleSubmit = async () => {
    if (!capability) return;
    setIsSubmitting(true);
    setError(null);
    const res = await onSave(capability, zones);
    setIsSubmitting(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to update applicable zones');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={capability ? `Applicable Zones — ${capability}` : 'Applicable Zones'}
      icon={<MapPin className="h-4 w-4 text-cyan-400" />}
      primaryActionLabel={isSubmitting ? 'Saving...' : 'Save Zones'}
      onPrimaryAction={handleSubmit}
      isPrimaryLoading={isSubmitting}
      isPrimaryDisabled={isSubmitting}
      isLoading={isSubmitting}
      loadingText="Saving Zones..."
    >
      <div className="space-y-3">
        <p className="text-[11px] text-muted-foreground">
          The model only scores the facial zones selected here. Leave everything unselected to score all zones.
        </p>
        <ChipMultiSelect
          label="Facial Zones"
          tone="cyan"
          options={FACIAL_ZONE_OPTIONS}
          value={zones}
          onChange={(next) => setZones(next)}
        />
        {error && <p className="text-[11px] text-rose-600">{error}</p>}
      </div>
    </Modal>
  );
};
