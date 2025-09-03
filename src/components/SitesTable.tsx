'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { sites } from '@/lib/sites';

export const SitesTable = ({ onSiteSelect, selectedSiteId }) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>MH ID</TableHead>
            <TableHead>MHM Level (in)</TableHead>
            <TableHead>Reference Level (in)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sites.map((site) => {
            const isSelected = selectedSiteId === site.id;

            return (
              <TableRow
                key={site.id}
                className={`cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-blue-50 hover:bg-blue-50 border-l-4 border-blue-500'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onSiteSelect(site)}
              >
                <TableCell
                  className={`font-medium ${isSelected ? 'text-blue-700' : ''}`}
                >
                  {site.mh_id}
                </TableCell>

                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">MHM Level</span>
                    <span className="text-xs text-gray-500">
                      Device ID: {site.mhm_id}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">Ref Level</span>
                    <span className="text-xs text-gray-500">
                      {site.ref_type}: {site.ref_id}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
