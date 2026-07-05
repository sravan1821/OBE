import { useAuth } from '../context/AuthContext';
import { Users, BookOpen, Award, CheckCircle } from 'lucide-react';

export default function HomeDashboard() {
  const { user, role } = useAuth();

  const stats = [
    { label: 'Total Students', value: '450', icon: Users, color: 'border-mic-blue', text: 'text-mic-blue' },
    { label: 'Subjects Mapped', value: '24', icon: BookOpen, color: 'border-mic-red', text: 'text-mic-red' },
    { label: 'CO Attainment', value: '78%', icon: Award, color: 'border-green-500', text: 'text-green-500' },
    { label: 'Verified Marks', value: '12', icon: CheckCircle, color: 'border-amber-500', text: 'text-amber-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-mic-navy tracking-tight">Welcome, {user?.name}</h1>
        <p className="text-slate-500 mt-1">Here is your {role} overview for the current semester.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-white p-6 rounded-lg border border-slate-200 shadow-sm border-t-4 ${stat.color} hover:shadow-md transition-shadow`}>
            <div className={`mb-3 ${stat.text}`}>
              <stat.icon size={28} />
            </div>
            <div className="text-3xl font-extrabold text-mic-navy mb-1">{stat.value}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-mic-navy">Recent Activity</h2>
          <button className="text-sm font-semibold text-mic-blue hover:text-blue-800">View All</button>
        </div>
        <div className="p-6">
          <div className="text-center py-10 text-slate-400">
            <p>React SPA is now fully wired up with React Router!</p>
            <p className="text-sm mt-2">More features coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
