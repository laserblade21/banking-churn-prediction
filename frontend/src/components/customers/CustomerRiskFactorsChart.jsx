// frontend/src/components/customers/CustomerRiskFactorsChart.jsx
import React from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomerRiskFactorsChart = ({ factors }) => {
  if (!factors || factors.length === 0) {
    return (
      <div className="flex items-center justify-center h-56 bg-gray-50 rounded">
        <p className="text-gray-500">No risk factor data available</p>
      </div>
    );
  }

  // Process factors to include impact color
  const processedFactors = factors.map(factor => {
    let impactColor = '#3b82f6';
    if (factor.impact === 'High') impactColor = '#ef4444';
    else if (factor.impact === 'Medium') impactColor = '#f59e0b';
    else if (factor.impact === 'Low') impactColor = '#10b981';
    
    return {
      ...factor,
      impactColor
    };
  });

  return (
    <div style={{ height: 250 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={processedFactors}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
          <YAxis dataKey="factor" type="category" />
          <Tooltip 
            formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Contribution']}
            labelFormatter={(value) => `Factor: ${value}`}
          />
          <Bar 
            dataKey="value" 
            barSize={20} 
            radius={[0, 4, 4, 0]}
          >
            {processedFactors.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.impactColor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomerRiskFactorsChart;