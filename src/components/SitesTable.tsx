'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const SitesTable = ({ sites, onSiteSelect, selectedSiteId }) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Site ID</TableHead>
            <TableHead>Site Name</TableHead>
            <TableHead>MM Level (in)</TableHead>
            <TableHead>Reference Level (in)</TableHead>
            <TableHead>Alerts</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sites.map((site) => {
            const isSelected = selectedSiteId === site.siteId;

            return (
              <TableRow
                key={site.siteId}
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
                  {site.siteId}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {site.siteName}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {site.manholeMetrics.currentLevel}"
                    </span>
                    <span className="text-xs text-gray-500">
                      ID: {site.manholeMetrics.id}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {site.referenceLevel.currentLevel}"
                    </span>
                    <span className="text-xs text-gray-500">
                      {site.referenceLevel.type}: {site.referenceLevel.id}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {site.alerts.length > 0 ? (
                      site.alerts.map((alert) => (
                        <Badge
                          key={alert}
                          variant="destructive"
                          className="text-xs"
                        >
                          {alert}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">No alerts</span>
                    )}
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
