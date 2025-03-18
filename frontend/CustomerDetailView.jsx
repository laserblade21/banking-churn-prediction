// frontend/src/components/CustomerDetailView.jsx - Updated with React Router navigation
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';  // Import hooks
import { ArrowLeft } from 'lucide-react';
import { fetchCustomerDetails } from '../services/api';

// Import components
import CustomerRiskFactorsChart from './customers/CustomerRiskFactorsChart';
import CustomerActivityChart from './customers/CustomerActivityChart';
import RetentionActionsTable from './customers/RetentionActionsTable';
import LoadingSpinner from './common/LoadingSpinner';

const CustomerDetailView = () => {
  const { customerId } = useParams();  // Get customerId from URL parameter
  const navigate = useNavigate();      // Initialize navigation hook
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        setLoading(true);
        const data = await fetchCustomerDetails(customerId);
        setCustomerData(data);
        setLoading(false);
      } catch (err) {
        console.error(`Error loading customer ${customerId}:`, err);
        setError(`Failed to load customer data. Please try again later.`);
        setLoading(false);
      }
    };
    
    loadCustomerData();
  }, [customerId]);

  const handleBack = () => {
    navigate('/');  // Navigate back to the dashboard
  };
  
  // Show loading spinner while data is loading
  if (loading) {
    return <LoadingSpinner message={`Loading customer ${customerId}...`} />;
  }
  
  // Show error message if there's an error
  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <div className="flex items-center mb-3">
          <button onClick={handleBack} className="mr-3 p-1 rounded-full hover:bg-red-200">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <p className="font-medium">Error Loading Customer</p>
        </div>
        <p>{error}</p>
        <button 
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  // Make sure we have customer data
  if (!customerData) {
    return <LoadingSpinner message="Preparing customer data..." />;
  }
  
  // Get risk color based on category
  const getRiskColor = (category) => {
    switch (category) {
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
  
  // Format currency for display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={handleBack}  // Use the navigation function
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Customer Detail: {customerData.id}</h1>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Rest of the component remains the same... */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Customer Information Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
            {/* Customer info content... */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{customerData.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-medium">{customerData.age}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Segment</p>
                <p className="font-medium">{customerData.segment}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Customer Since</p>
                <p className="font-medium">{formatDate(customerData.customerSince)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Products</p>
                <p className="font-medium">{customerData.products.join(', ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Product Count</p>
                <p className="font-medium">{customerData.products.length}</p>
              </div>
            </div>
          </div>
          
          {/* Risk Score Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Churn Risk Assessment</h2>
            <div className="flex flex-col items-center">
              <div className="relative h-32 w-32 mb-4">
                <svg viewBox="0 0 36 36" className="h-32 w-32">
                  {/* Background circle */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#eee"
                    strokeWidth="3"
                  />
                  {/* Foreground circle */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={customerData.riskScore > 0.7 ? "#ef4444" : customerData.riskScore > 0.4 ? "#f59e0b" : "#10b981"}
                    strokeWidth="3"
                    strokeDasharray={`${customerData.riskScore * 100}, 100`}
                    strokeLinecap="round"
                  />
                  <text x="18" y="20.5" textAnchor="middle" fill="#333" fontSize="7">
                    {Math.round(customerData.riskScore * 100)}%
                  </text>
                </svg>
              </div>
              <div className="text-center">
                <p className={`text-lg font-semibold ${getRiskColor(customerData.riskCategory)}`}>
                  {customerData.riskCategory} Risk
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {customerData.riskCategory === 'High' 
                    ? "Immediate action recommended" 
                    : customerData.riskCategory === 'Medium' 
                      ? "Monitor closely" 
                      : "Regular engagement sufficient"}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Risk Factors Chart */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Risk Factors</h2>
          <CustomerRiskFactorsChart factors={customerData.riskFactors} />
        </div>
        
        {/* Account Activity Chart */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Account Activity</h2>
          <CustomerActivityChart activityData={customerData.activityData} />
        </div>
        
        {/* Remaining sections... */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recommended Retention Actions</h2>
          <RetentionActionsTable actions={customerData.recommendedActions} customerId={customerId} />
        </div>
      </main>
    </div>
  );
};

export default CustomerDetailView;