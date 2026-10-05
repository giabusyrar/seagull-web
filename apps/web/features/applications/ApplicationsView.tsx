'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Smartphone,
  Pencil,
  Trash2,
  CheckCircle2,
  Tag,
  Layers,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import {
  PageHeader,
  SearchFilterBar,
  DataTable,
  Modal,
  Input,
  SearchableSelect,
  ConfirmDialog,
  Button,
  InfoTooltip,
  type ColumnDef,
  type SelectOption,
} from '@gateway-experience/shared';
import { PipelineConfigModal } from './PipelineConfigModal';
import { deleteApplication, listApplications, saveApplication, type ApplicationItem } from './api';

export type { ApplicationItem };

const CHANNEL_TYPE_OPTIONS: SelectOption[] = [
  { value: 'Mobile Web DTC', label: 'Mobile Web DTC', description: 'Direct-to-Consumer Digital Questionnaire & Assessment' },
  { value: 'Kiosk / Hardware', label: 'Kiosk / Hardware Diagnostic', description: 'In-Store Physical Device Diagnostic Kiosk' },
  { value: 'Tablet / POS', label: 'Tablet / Beauty Advisor POS', description: 'BA Tablet Consultation & In-Clinic Portal' },
  { value: 'Mobile App', label: 'Native iOS & Android App', description: 'Omnichannel Native Mobile Applications' },
  { value: 'Integration Endpoint', label: 'Integration Endpoint / Headless', description: 'Headless API & Third-party Partner Endpoints' },
];

export const ApplicationsView: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter State
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<ApplicationItem | null>(null);
  const [pipelineModalApp, setPipelineModalApp] = useState<ApplicationItem | null>(null);

  // Form State
  const [formKey, setFormKey] = useState('');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formChannelType, setFormChannelType] = useState('Mobile Web DTC');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirm Dialog State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    appKey: string;
    appName: string;
  }>({
    isOpen: false,
    appKey: '',
    appName: '',
  });

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const list = await listApplications();
      if (list) setApplications(list);
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const openAddModal = () => {
    setEditingApp(null);
    setFormKey('');
    setFormName('');
    setFormDescription('');
    setFormChannelType('Mobile Web DTC');
    setIsModalOpen(true);
  };

  const openEditModal = (app: ApplicationItem) => {
    setEditingApp(app);
    setFormKey(app.key);
    setFormName(app.name);
    setFormDescription(app.description || '');
    setFormChannelType(app.channelType || 'Mobile Web DTC');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formKey.trim() || !formName.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        key: formKey.trim().toLowerCase(),
        name: formName.trim(),
        description: formDescription.trim(),
        channelType: formChannelType,
      };

      if (await saveApplication(payload, !!editingApp)) {
        setIsModalOpen(false);
        fetchApplications();
      }
    } catch (err) {
      console.error('Failed to save application', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.appKey) return;
    try {
      if (await deleteApplication(deleteConfirm.appKey)) {
        setDeleteConfirm({ isOpen: false, appKey: '', appName: '' });
        fetchApplications();
      }
    } catch (err) {
      console.error('Failed to delete application', err);
    }
  };

  // Dynamic unique channel filter options
  const filterOptions: SelectOption[] = useMemo(() => {
    const rawTypes = Array.from(new Set(applications.map((a) => a.channelType).filter(Boolean))) as string[];
    const list: SelectOption[] = [
      { value: 'all', label: `All Channel Types (${applications.length})` },
    ];
    rawTypes.forEach((t) => {
      list.push({ value: t, label: t });
    });
    return list;
  }, [applications]);

  const filtered = applications.filter((app) => {
    if (selectedChannelFilter !== 'all' && app.channelType !== selectedChannelFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.key.toLowerCase().includes(q) ||
      app.name.toLowerCase().includes(q) ||
      (app.description && app.description.toLowerCase().includes(q)) ||
      (app.channelType && app.channelType.toLowerCase().includes(q))
    );
  });

  const activeFilterCount = selectedChannelFilter !== 'all' ? 1 : 0;

  const customFilterContent = (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="text-xs font-bold text-foreground uppercase tracking-wider">Application Filters</span>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={() => setSelectedChannelFilter('all')}
            className="text-[10px] text-primary hover:underline cursor-pointer"
          >
            Reset All
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
          <Layers className="h-3 w-3 text-primary" />
          <span>Channel Category</span>
        </label>
        <SearchableSelect
          value={selectedChannelFilter}
          onChange={setSelectedChannelFilter}
          options={filterOptions}
          placeholder="Filter by channel type..."
          searchPlaceholder="Search category..."
        />
      </div>
    </div>
  );

  const columns: ColumnDef<ApplicationItem>[] = [
    {
      key: 'key',
      header: 'Channel Identifier',
      render: (app) => (
        <span className="font-mono text-xs font-bold text-primary bg-beak/10 border border-beak/30 px-2 py-1 rounded">
          {app.key}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Application Name & Description',
      render: (app) => (
        <div className="space-y-0.5">
          <h4 className="font-bold text-foreground text-xs">{app.name}</h4>
          {app.description && (
            <p className="text-[11px] text-muted-foreground line-clamp-1">{app.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'channelType',
      header: 'Channel Category',
      render: (app) => (
        <span className="bg-secondary border border-border text-foreground font-medium text-[11px] px-2 py-0.5 rounded">
          {app.channelType || 'Mobile DTC'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: () => (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
          <CheckCircle2 className="h-3 w-3" /> ACTIVE
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (app) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="xs"
            onClick={() => setPipelineModalApp(app)}
            leftIcon={<SlidersHorizontal className="h-3 w-3 text-primary" />}
            title="Configure Assessment Pipeline"
          >
            Pipeline
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={() => openEditModal(app)}
            leftIcon={<Pencil className="h-3 w-3 text-primary" />}
            title="Edit Application"
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setDeleteConfirm({ isOpen: true, appKey: app.key, appName: app.name })}
            title="Delete Application"
            className="hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 min-w-0 h-full overflow-y-auto bg-background text-foreground font-sans flex flex-col select-none">
      {/* Unified PageHeader */}
      <PageHeader
        icon={<Smartphone className="h-5 w-5 text-primary" />}
        breadcrumbs={[
          { label: 'Workbench', href: '/' },
          { label: 'Master Data' },
          { label: 'Applications & Channels' },
        ]}
        title="Applications & Channels"
      />

      {/* Main Body */}
      <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto">
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search application key, name, channel type..."
          actionLabel="New Application"
          onAction={openAddModal}
          customFilterContent={customFilterContent}
          activeFilterCount={activeFilterCount}
          onRefresh={fetchApplications}
          isLoading={loading}
        />

        <DataTable
          columns={columns}
          data={filtered}
          keyExtractor={(app) => app.key}
          isLoading={loading}
          emptyMessage={
            searchQuery
              ? 'No applications match your search query.'
              : 'No applications or channels have been registered yet.'
          }
        />
      </main>

      {/* Modal: New / Edit Application */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingApp ? `Edit Application (${editingApp.name})` : 'Register New Application / Channel'}
        subtitle="Manage master application and channel endpoints used across Vision, Score, and Matching."
        icon={<Smartphone className="h-5 w-5 text-primary" />}
        size="lg"
        primaryActionLabel={isSubmitting ? 'Saving...' : editingApp ? 'Update Application' : 'Register Application'}
        onPrimaryAction={handleSave}
        isPrimaryLoading={isSubmitting}
        isPrimaryDisabled={isSubmitting || !formKey.trim() || !formName.trim()}
        isLoading={isSubmitting}
        loadingText="Saving Application..."
      >
        <div className="space-y-4 py-1">
          {/* Key */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-primary" />
                <span>Application Key</span>
              </label>
              <InfoTooltip content="Unique identifier for this application or channel." label="About Application Key" iconClassName="h-3 w-3" />
            </div>
            <Input
              type="text"
              required
              disabled={!!editingApp}
              placeholder="e.g. app_smart_mirror, app_kiosk_bali..."
              value={formKey}
              onChange={(e) => setFormKey(e.target.value)}
              className="font-mono text-xs font-semibold"
            />
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-primary" />
              <span>Application / Channel Display Name</span>
            </label>
            <Input
              type="text"
              required
              placeholder="e.g. Smart Mirror Station, Retail Kiosk..."
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="text-xs font-semibold"
            />
          </div>

          {/* Channel Type */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span>Channel Category</span>
            </label>
            <SearchableSelect
              value={formChannelType}
              onChange={setFormChannelType}
              options={CHANNEL_TYPE_OPTIONS}
              placeholder="Select channel category..."
              searchPlaceholder="Search category..."
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span>Description & Clinical Scope</span>
            </label>
            <textarea
              rows={3}
              placeholder="Describe channel usage context, physical devices, or customer touchpoint..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring transition resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* Pipeline Config Modal */}
      {pipelineModalApp && (
        <PipelineConfigModal
          isOpen={!!pipelineModalApp}
          onClose={() => setPipelineModalApp(null)}
          applicationId={pipelineModalApp.key}
          applicationName={pipelineModalApp.name}
          onSuccess={fetchApplications}
        />
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Application"
        message={`Are you sure you want to delete application "${deleteConfirm.appName}" (${deleteConfirm.appKey})?`}
        onConfirm={handleDelete}
        onClose={() => setDeleteConfirm({ isOpen: false, appKey: '', appName: '' })}
      />
    </div>
  );
};
