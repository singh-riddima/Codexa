import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const palette = ['#a855f7', '#d946ef', '#ec4899', '#38bdf8', '#34d399'];

export function ChartPanel({ title, description, type, data }: { title: string; description: string; type: 'area' | 'radar' | 'pie'; data: Array<Record<string, string | number>> }) {
  const completionValue = type === 'pie' ? Number(data[0]?.value ?? 0) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-[320px]">
        {type === 'area' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data as any}>
              <defs>
                <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,.45)" />
              <YAxis stroke="rgba(255,255,255,.45)" />
              <Tooltip contentStyle={{ background: 'rgba(10,10,18,.96)', border: '1px solid rgba(255,255,255,.08)' }} />
              <Area type="monotone" dataKey="solved" stroke="#d946ef" fill="url(#chartFill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : type === 'radar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data as any}>
              <PolarGrid stroke="rgba(255,255,255,.08)" />
              <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,.45)" />
              <Radar dataKey="value" stroke="#d946ef" fill="#a855f7" fillOpacity={0.34} />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
            <div className="relative h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data as any}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={58}
                    outerRadius={110}
                    paddingAngle={4}
                    stroke="rgba(255,255,255,.08)"
                    strokeWidth={2}
                  >
                    {(data as Array<Record<string, string | number>>).map((_, index) => (
                      <Cell key={index} fill={palette[index % palette.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'rgba(10,10,18,.96)', border: '1px solid rgba(255,255,255,.08)', color: '#ffffff' }}
                    itemStyle={{ color: '#ffffff' }}
                    labelStyle={{ color: '#ffffff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
      </CardContent>
    </Card>
  );
}