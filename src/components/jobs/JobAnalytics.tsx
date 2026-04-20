import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import type { JobApp } from '../../store/sovereign';
import { Target, TrendingUp, Zap, PieChart as PieIcon } from 'lucide-react';

interface JobAnalyticsProps {
  jobs: JobApp[];
}

export const JobAnalytics: React.FC<JobAnalyticsProps> = ({ jobs }) => {
  const funnelData = useMemo(() => {
    const counts = {
      RESEARCHING: jobs.filter(j => j.status === 'RESEARCHING').length,
      APPLIED: jobs.filter(j => j.status === 'APPLIED').length,
      INTERVIEWING: jobs.filter(j => j.status === 'INTERVIEWING').length,
      'PENDING OFFER': jobs.filter(j => j.status === 'PENDING OFFER').length,
      ACCEPTED: jobs.filter(j => j.status === 'ACCEPTED').length,
      REJECTED: jobs.filter(j => j.status === 'REJECTED').length,
    };

    return Object.entries(counts).map(([name, value]) => ({ 
      name: name.split(' ')[0], // Short name
      full: name,
      count: value 
    }));
  }, [jobs]);

  const stats = useMemo(() => {
    const total = jobs.length;
    const applied = jobs.filter(j => ['APPLIED', 'INTERVIEWING', 'PENDING OFFER', 'ACCEPTED', 'REJECTED'].includes(j.status)).length;
    const interviews = jobs.filter(j => ['INTERVIEWING', 'PENDING OFFER', 'ACCEPTED'].includes(j.status)).length;
    const conversion = applied > 0 ? (interviews / applied * 100).toFixed(1) : '0';

    return { total, applied, interviews, conversion };
  }, [jobs]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricBox label="Total Targets" value={stats.total} icon={Target} sub="In Pipeline" />
        <MetricBox label="Engagements" value={stats.applied} icon={Zap} sub="Sent Protocols" />
        <MetricBox label="Tactical Nexus" value={stats.interviews} icon={TrendingUp} sub="Active Interviews" />
        <MetricBox label="Conversion" value={`${stats.conversion}%`} icon={PieIcon} sub="Interface Rate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Funnel Chart */}
        <div className="lg:col-span-8 bg-white/[0.03] border border-white/10 rounded-[32px] p-8">
          <h3 className="font-mono text-[9px] tracking-[0.3em] text-white/40 uppercase font-black mb-8">Pipeline Intensity</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontFamily: 'monospace' }} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px', fontSize: '10px' }}
                  cursor={{ fill: 'white', opacity: 0.05 }}
                />
                <Bar 
                  dataKey="count" 
                  fill="white" 
                  fillOpacity={0.1} 
                  radius={[8, 8, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="lg:col-span-4 bg-white/[0.03] border border-white/10 rounded-[32px] p-8 flex flex-col">
          <h3 className="font-mono text-[9px] tracking-[0.3em] text-white/40 uppercase font-black mb-8">Status Distribution</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={funnelData.filter(d => d.count > 0)}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {funnelData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="white" opacity={0.1 + (index * 0.2)} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-3">
             {funnelData.map((d, _i) => (
               <div key={d.full} className="flex justify-between items-center text-[10px] font-mono">
                 <span className="text-white/40">{d.full}</span>
                 <span className="text-white font-bold">{d.count}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricBox = ({ label, value, sub, icon: Icon }: any) => (
  <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 transition-transform group-hover:scale-110">
      <Icon size={48} />
    </div>
    <span className="block font-mono text-[9px] text-white/30 uppercase tracking-widest mb-3">{label}</span>
    <div className="font-mono text-3xl font-black text-white mb-1 italic">{value}</div>
    <span className="font-mono text-[9px] text-white/20 uppercase">{sub}</span>
  </div>
);
