'use client';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Box, Typography } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';
import { CHART_NEON_COLORS } from '@/lib/theme/joyTheme';

interface ChartContainerProps {
  title?: string;
  children: React.ReactNode;
  height?: number | string;
}

export function NeonLineChart({
  data,
  lines,
  xAxisKey = 'name',
  height = 300,
}: {
  data: Record<string, unknown>[];
  lines: { dataKey: string; color: string; name: string }[];
  xAxisKey?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
        <XAxis
          dataKey={xAxisKey}
          stroke="#94A3B8"
          tick={{ fill: '#94A3B8', fontSize: 12 }}
        />
        <YAxis
          stroke="#94A3B8"
          tick={{ fill: '#94A3B8', fontSize: 12 }}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1E293B',
            border: '1px solid rgba(148,163,184,0.2)',
            borderRadius: '8px',
            color: '#F8FAFC',
          }}
          labelStyle={{ color: '#F8FAFC', marginBottom: '8px' }}
        />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value) => <span style={{ color: '#94A3B8' }}>{value}</span>}
        />
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            name={line.name}
            stroke={line.color}
            strokeWidth={2}
            dot={{ fill: line.color, strokeWidth: 2 }}
            activeDot={{ r: 6, fill: line.color }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function NeonAreaChart({
  data,
  areas,
  xAxisKey = 'name',
  height = 300,
}: {
  data: Record<string, unknown>[];
  areas: { dataKey: string; color: string; fill: string; name: string }[];
  xAxisKey?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          {areas.map((area) => (
            <linearGradient key={area.dataKey} id={`gradient-${area.dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={area.color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={area.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
        <XAxis
          dataKey={xAxisKey}
          stroke="#94A3B8"
          tick={{ fill: '#94A3B8', fontSize: 12 }}
        />
        <YAxis
          stroke="#94A3B8"
          tick={{ fill: '#94A3B8', fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1E293B',
            border: '1px solid rgba(148,163,184,0.2)',
            borderRadius: '8px',
            color: '#F8FAFC',
          }}
        />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value) => <span style={{ color: '#94A3B8' }}>{value}</span>}
        />
        {areas.map((area) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            name={area.name}
            stroke={area.color}
            fill={`url(#gradient-${area.dataKey})`}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function NeonBarChart({
  data,
  bars,
  xAxisKey = 'name',
  height = 300,
}: {
  data: Record<string, unknown>[];
  bars: { dataKey: string; color: string; name: string }[];
  xAxisKey?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
        <XAxis
          dataKey={xAxisKey}
          stroke="#94A3B8"
          tick={{ fill: '#94A3B8', fontSize: 12 }}
        />
        <YAxis
          stroke="#94A3B8"
          tick={{ fill: '#94A3B8', fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1E293B',
            border: '1px solid rgba(148,163,184,0.2)',
            borderRadius: '8px',
            color: '#F8FAFC',
          }}
        />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value) => <span style={{ color: '#94A3B8' }}>{value}</span>}
        />
        {bars.map((bar) => (
          <Bar key={bar.dataKey} dataKey={bar.dataKey} name={bar.name} fill={bar.color} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function NeonPieChart({
  data,
  dataKey = 'value',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  nameKey = 'name',
  height = 300,
}: {
  data: { name: string; value: number }[];
  dataKey?: string;
  nameKey?: string;
  height?: number;
}) {
  const colors = Object.values(CHART_NEON_COLORS).slice(0, data.length);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey={dataKey}
          label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
          labelLine={{ stroke: '#94A3B8' }}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#1E293B',
            border: '1px solid rgba(148,163,184,0.2)',
            borderRadius: '8px',
            color: '#F8FAFC',
          }}
        />
        <Legend
          formatter={(value) => <span style={{ color: '#94A3B8' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ChartContainer({ title, children, height = 300 }: ChartContainerProps) {
  const containerSx: SxProps = {
    backgroundColor: 'background.level1',
    borderRadius: '12px',
    border: '1px solid rgba(148,163,184,0.2)',
    p: 2.5,
  };

  return (
    // @ts-ignore - MUI sx union type is too complex for TS to represent here
    <Box sx={containerSx}>
      {title && (
        <Box sx={{ marginBottom: '16px' } as any}>
          <Box
            component="h3"
            // @ts-ignore
            sx={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            {title}
          </Box>
        </Box>
      )}
      <Box sx={{ height } as any}>{children}</Box>
    </Box>
  );
}

export { CHART_NEON_COLORS };
