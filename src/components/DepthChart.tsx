'use client';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export function DepthChart({ data }) {
  const mhmData = data.mhmData?.timeSeries || [];
  // const prismData = data.prismData[0]

  console.log('data:', data);
  console.log('mhmData:', mhmData);
  // console.log('prismData:', prismData);

  return (
    <>
      <div>CHART HERE</div>
    </>
  );
}
