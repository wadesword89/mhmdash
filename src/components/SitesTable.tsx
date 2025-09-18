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
            <TableHead className="font-bold">MH ID</TableHead>
            <TableHead className="font-bold">MHM ID </TableHead>
            <TableHead className="font-bold">Reference ID</TableHead>
            <TableHead className="font-bold">Reference Source</TableHead>
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
                    ? 'bg-blue-50 hover:bg-blue-50 border-l-4 border-b-0 border-blue-500'
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
                    <span className="font-medium">{site.mhm_id}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{site.ref_id}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{site.ref_source} </span>
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
