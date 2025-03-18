// frontend/src/components/customers/CustomerActivityChart.jsx
import React, { useState } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CustomerActivityChart = ({ activityData }) => {
  const [showTransactions, setShowTransactions] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  
  if (!activityData || activityData.length === 0) {
    return (
      <div className="flex items-center justify-center h-56 bg-gray-50 rounded">
        <p className="text-gray-500">No activity data available</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-end mb-4 space-x-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-indigo-600"
            checked={showTransactions}
            onChange={() => setShowTransactions(!showTransactions)}
          />
          <span className="ml-2 text-sm text-gray-700">Transactions</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-indigo-600"
            checked={showBalance}
            onChange={() => setShowBalance(!showBalance)}
          />
          <span className="ml-2 text-sm text-gray-700">Balance</span>
        </label>
      </div>
      
      <div style={{ height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={activityData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis 
              yAxisId="left" 
              orientation="left" 
              stroke="#3b82f6" 
              label={{ value: 'Transactions', angle: -90, position: 'insideLeft' }} 
              hide={!showTransactions}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="#10b981"
              label={{ value: 'Balance ($)', angle: -90, position: 'insideRight' }} 
              hide={!showBalance}
            />
            <Tooltip />
            <Legend />
            {showTransactions && (
              <Bar 
                yAxisId="left" 
                dataKey="transactions" 
                name="Transactions" 
                fill="#3b82f6" 
                barSize={20}
                radius={[4, 4, 0, 0]} 
              />
            )}
            {showBalance && (
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="balance" 
                name="Balance" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CustomerActivityChart;