'use client';

import { Header } from './Header';
import LeafletMap from './LeafletMap';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <div className="flex-1 p-3 sm:p-6 space-y-6">
          <LeafletMap />
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-lg sm:text-xl">
                  Manhole Sites
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">TABLE</CardContent>
          </Card>
        </div>
      </div>
      Side Panel
    </div>
  );
}
