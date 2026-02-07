import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Analytics: React.FC = () => {
  // Mock Data
  const responseData = [
    { name: 'Mon', time: 5.2 },
    { name: 'Tue', time: 4.8 },
    { name: 'Wed', time: 6.1 },
    { name: 'Thu', time: 4.2 },
    { name: 'Fri', time: 3.9 },
    { name: 'Sat', time: 4.5 },
    { name: 'Sun', time: 4.1 },
  ];

  const typeData = [
    { name: 'Medical', value: 45 },
    { name: 'Fire', value: 15 },
    { name: 'Accident', value: 25 },
    { name: 'Security', value: 15 },
  ];

  const COLORS = ['#DC2626', '#F59E0B', '#3B82F6', '#10B981'];

  return (
    <div className="p-8 bg-beige-light h-full overflow-y-auto">
       <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Performance Analytics</h1>
          <p className="text-gray-600">Response times and incident breakdown for current week.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-beige-dark">
             <h3 className="text-gray-500 text-sm uppercase font-bold">Avg Response Time</h3>
             <p className="text-4xl font-bold text-gray-800 mt-2">4.2 <span className="text-sm font-normal text-gray-500">min</span></p>
             <span className="text-green-600 text-sm font-bold">↓ 12% vs last week</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-beige-dark">
             <h3 className="text-gray-500 text-sm uppercase font-bold">Total Incidents</h3>
             <p className="text-4xl font-bold text-gray-800 mt-2">142</p>
             <span className="text-red-600 text-sm font-bold">↑ 5% vs last week</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-beige-dark">
             <h3 className="text-gray-500 text-sm uppercase font-bold">Success Rate</h3>
             <p className="text-4xl font-bold text-gray-800 mt-2">98.5%</p>
             <span className="text-gray-400 text-sm">Stable</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-beige-dark">
             <h3 className="text-gray-500 text-sm uppercase font-bold">Active Teams</h3>
             <p className="text-4xl font-bold text-gray-800 mt-2">12/15</p>
             <span className="text-blue-600 text-sm font-bold">80% Utilization</span>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Response Time Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-beige-dark h-96">
             <h3 className="text-lg font-bold text-gray-800 mb-6">Response Time Trend (Minutes)</h3>
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={responseData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                   <XAxis dataKey="name" />
                   <YAxis />
                   <Tooltip />
                   <Line type="monotone" dataKey="time" stroke="#DC2626" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
             </ResponsiveContainer>
          </div>

          {/* Incident Types */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-beige-dark h-96">
             <h3 className="text-lg font-bold text-gray-800 mb-6">Incidents by Type</h3>
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                   <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                   >
                      {typeData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                   </Pie>
                   <Tooltip />
                   <Legend />
                </PieChart>
             </ResponsiveContainer>
          </div>
       </div>
    </div>
  );
};

export default Analytics;