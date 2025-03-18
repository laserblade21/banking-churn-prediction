import React from 'react';

const KpiCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'percentage', 
  icon, 
  trend = 'neutral',
  timeRange = 'vs last month'
}) => {
  // Determine trend color and icon
  const trendConfig = {
    positive: {
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M12 7a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1h6a1 1 0 011 1v2zm-6 6a1 1 0 001 1h6a1 1 0 001-1v-2a1 1 0 00-1-1H7a1 1 0 00-1 1v2z" clipRule="evenodd" />
        </svg>
      )
    },
    negative: {
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M12 13a1 1 0 01-1 1H5a1 1 0 01-1-1v-2a1 1 0 011-1h6a1 1 0 011 1v2zm-6-6a1 1 0 001 1h6a1 1 0 001-1V5a1 1 0 00-1-1H7a1 1 0 00-1 1v2z" clipRule="evenodd" />
        </svg>
      )
    },
    neutral: {
      textColor: 'text-gray-600',
      bgColor: 'bg-gray-50',
      icon: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      )
    }
  };

  const { textColor, bgColor, icon: trendIcon } = trendConfig[trend];

  // Format the change value
  const formattedChange = changeType === 'percentage' 
    ? `${change > 0 ? '+' : ''}${change}%` 
    : change;

  return (
    <div className="dashboard-card bg-white rounded-lg shadow p-6 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <span className="text-gray-500 text-sm font-medium">{title}</span>
        {icon && (
          <div className="p-2 rounded-md bg-primary-50 text-primary-600">
            {icon}
          </div>
        )}
      </div>
      
      <div className="mt-1">
        <div className="text-2xl font-semibold text-gray-900">{value}</div>
        
        <div className="flex items-center mt-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${textColor} ${bgColor}`}>
            {trendIcon}
            <span className="ml-1">{formattedChange}</span>
          </span>
          <span className="text-gray-500 text-xs ml-2">{timeRange}</span>
        </div>
      </div>
    </div>
  );
};

export default KpiCard;