// frontend/src/components/customers/RetentionActionsTable.jsx
import React, { useState } from 'react';

const RetentionActionsTable = ({ actions, customerId }) => {
  const [appliedActions, setAppliedActions] = useState([]);
  const [isApplying, setIsApplying] = useState(false);
  
  if (!actions || actions.length === 0) {
    return (
      <div className="flex items-center justify-center h-56 bg-gray-50 rounded">
        <p className="text-gray-500">No recommended actions available</p>
      </div>
    );
  }

  const handleApplyAction = (actionIndex) => {
    // In a real application, you would call an API to apply the action
    setIsApplying(true);
    
    // Simulate API call
    setTimeout(() => {
      setAppliedActions([...appliedActions, actionIndex]);
      setIsApplying(false);
    }, 1000);
  };
  
  const getImpactColor = (impact) => {
    switch (impact) {
      case 'High':
        return 'text-red-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Impact
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cost
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ROI
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Apply
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {actions.map((action, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {action.action}
                </div>
                <div className="text-sm text-gray-500">
                  {action.description}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`text-sm font-medium ${getImpactColor(action.impact)}`}>
                  {action.impact}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${action.cost}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                {action.roi ? `${action.roi}%` : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {appliedActions.includes(index) ? (
                  <span className="text-green-600">Applied ✓</span>
                ) : (
                  <button
                    onClick={() => handleApplyAction(index)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-3 rounded-md text-sm disabled:opacity-50"
                    disabled={isApplying}
                  >
                    {isApplying ? 'Applying...' : 'Apply Action'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RetentionActionsTable;