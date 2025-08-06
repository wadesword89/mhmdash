'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from './ui/badge';
export function SiteTable({ site, onSiteSelect }) {
  return (
    <div className="hidden sm:block overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Site ID</TableHead>
            <TableHead>Site Location</TableHead>
            <TableHead>MHM Level (in)</TableHead>
            <TableHead>Reference Level (in)</TableHead>
            <TableHead>Alerts</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
         {/* Add Content */}
        </TableBody>
      </Table>
    </div>
  );
}
