import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge, CalibrationBadge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';

export const UiKit: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 pb-24">
      <div>
        <h1 className="text-3xl font-bold mb-2">Civic Steel UI Kit</h1>
        <p className="text-[var(--text-secondary)]">Component primitive showcases for METACITY.</p>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4 border-b border-[var(--border-subtle)] pb-2">Buttons</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 border-b border-[var(--border-subtle)] pb-2">Inputs</h2>
        <div className="max-w-sm space-y-4">
          <Input label="Standard Input" placeholder="Type here..." />
          <Input label="Error State" error="This field is required" defaultValue="Invalid value" />
          <Input label="Disabled Input" disabled placeholder="Cannot edit" />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 border-b border-[var(--border-subtle)] pb-2">Badges</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <Badge>Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="info">Info</Badge>
        </div>
        <div className="flex flex-wrap gap-4">
          <CalibrationBadge status="calibrated" />
          <CalibrationBadge status="partially_calibrated" />
          <CalibrationBadge status="synthetic_uncalibrated" />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 border-b border-[var(--border-subtle)] pb-2">Table</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Run ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Avg Travel Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-mono">run_a1b2c3</TableCell>
              <TableCell><Badge variant="success">Completed</Badge></TableCell>
              <TableCell>12.4 min</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono">run_x9y8z7</TableCell>
              <TableCell><Badge variant="warning">Running</Badge></TableCell>
              <TableCell>--</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 border-b border-[var(--border-subtle)] pb-2">Modal</h2>
        <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title="Delete Project"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => setIsModalOpen(false)}>Delete</Button>
            </>
          }
        >
          <p>Are you sure you want to delete this project? This action cannot be undone.</p>
        </Modal>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 border-b border-[var(--border-subtle)] pb-2">Skeleton</h2>
        <div className="space-y-2 max-w-md">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-20 w-full mt-4" />
        </div>
      </section>
    </div>
  );
};
