import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RiskFactorsChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-center h-64">
        <p className="text-gray-500">No risk factor data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-medium text-gray-700">Top Churn Risk Factors</h2>
      <div className="mt-2" style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 'dataMax']} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
            <YAxis dataKey="name" type="category" />
            <Tooltip formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Impact']} />
            <Bar dataKey="value" fill="#3b82f6" barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RiskFactorsChart;