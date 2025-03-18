import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, TrendingDown, DollarSign, ExternalLink } from 'lucide-react';
import KpiCard from './dashboard/KpiCard';
import RiskDistributionChart from './dashboard/RiskDistributionChart';
import ChurnTrendChart from './dashboard/ChurnTrendChart';
import LoadingSpinner from './common/LoadingSpinner';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, you would fetch data from your API
        // For now, we'll simulate a delay and use mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data
        const mockData = {
          totalCustomers: 12345,
          churnRate: 3.2,
          atRiskCustomers: 247,
          avgCustomerValue: 1432,
          riskDistribution: [
            { name: 'Low Risk', value: 65 },
            { name: 'Medium Risk', value: 23 },
            { name: 'High Risk', value: 12 }
          ],
          churnTrend: [
            { month: 'Jan', churnRate: 2.8 },
            { month: 'Feb', churnRate: 3.1 },
            { month: 'Mar', churnRate: 3.5 },
            { month: 'Apr', churnRate: 3.2 },
            { month: 'May', churnRate: 2.9 },
            { month: 'Jun', churnRate: 3.2 }
          ],
          highRiskCustomers: [
            {
              id: 1,
              customerName: 'John Smith',
              riskScore: 89,
              accountValue: 5750,
              lastActivity: '2023-03-10'
            },
            {
              id: 2,
              customerName: 'Sarah Johnson',
              riskScore: 84,
              accountValue: 12350,
              lastActivity: '2023-03-15'
            },
            {
              id: 3,
              customerName: 'Michael Brown',
              riskScore: 78,
              accountValue: 8200,
              lastActivity: '2023-03-08'
            },
            {
              id: 4,
              customerName: 'Emily Davis',
              riskScore: 76,
              accountValue: 15400,
              lastActivity: '2023-03-12'
            },
            {
              id: 5,
              customerName: 'Robert Wilson',
              riskScore: 75,
              accountValue: 9800,
              lastActivity: '2023-03-05'
            }
          ]
        };
        
        setData(mockData);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange]);
  
  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <LoadingSpinner size="lg" text="Loading dashboard data..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-700 m-4">
        <p className="font-medium">Error loading dashboard data</p>
        <p className="mt-1">{error.message}</p>
      </div>
    );
  }
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };
  
  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US').format(date);
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Export Report
            </button>
          </div>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard 
            title="Total Customers" 
            value={data.totalCustomers.toLocaleString()}
            change={2.5}
            trend="positive"
            icon={<Users size={20} />}
          />
          
          <KpiCard 
            title="Churn Rate" 
            value={`${data.churnRate}%`}
            change={-0.8}
            trend="positive"
            icon={<TrendingDown size={20} />}
          />
          
          <KpiCard 
            title="At-Risk Customers" 
            value={data.atRiskCustomers.toLocaleString()}
            change={12}
            trend="negative"
            icon={<Users size={20} />}
          />
          
          <KpiCard 
            title="Avg. Customer Value" 
            value={formatCurrency(data.avgCustomerValue)}
            change={3.7}
            trend="positive"
            icon={<DollarSign size={20} />}
          />
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Risk Distribution</h3>
            </div>
            <div className="p-6">
              <RiskDistributionChart data={data.riskDistribution} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Monthly Churn Trend</h3>
            </div>
            <div className="p-6">
              <ChurnTrendChart data={data.churnTrend} />
            </div>
          </div>
        </div>
        
        {/* High Risk Customers */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">High Risk Customers</h3>
            <Link to="/customers" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
              View All 
              <ExternalLink size={14} className="ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.highRiskCustomers.slice(0, 5).map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{customer.customerName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-medium text-red-600">
                          {customer.riskScore}%
                        </span>
                        <div className="ml-2 w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-red-500"
                            style={{ width: `${customer.riskScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatCurrency(customer.accountValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(customer.lastActivity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link 
                        to={`/customers/${customer.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <ExternalLink size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <Link 
              to="/customers"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all customers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;