'use client';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export function DepthChart({ site, data }) {
  const mhmData = data.mhmData?.timeSeries;
  const refData = data.data;

  // console.log('data:', data);
  

  return (
    <>
      <div>CHART HERE</div>
    </>
  );
}
