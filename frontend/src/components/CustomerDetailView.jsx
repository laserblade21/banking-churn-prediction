import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit, UserPlus, MessageSquare, FileText, Clock, Activity, AlertTriangle } from 'lucide-react';
import CustomerRiskFactorsChart from './customers/CustomerRiskFactorsChart';
import CustomerActivityChart from './customers/CustomerActivityChart';
import RetentionActionsTable from './customers/RetentionActionsTable';
import LoadingSpinner from './common/LoadingSpinner';

const CustomerDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock customer data
        const mockCustomer = {
          id: parseInt(id),
          customerName: `Customer ${id}`,
          email: `customer${id}@example.com`,
          phone: `555-${(Math.floor(Math.random() * 900) + 100)}-${(Math.floor(Math.random() * 9000) + 1000)}`,
          address: '123 Main St, Anytown, AT 12345',
          accountValue: Math.floor(Math.random() * 15000) + 1000,
          riskScore: Math.floor(Math.random() * 100) + 1,
          lastActivity: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          segment: ['Retail', 'Business', 'Premium'][Math.floor(Math.random() * 3)],
          joinDate: new Date(Date.now() - Math.floor(Math.random() * 730) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          totalTransactions: Math.floor(Math.random() * 200) + 20,
          riskFactors: [
            { factor: 'Account Inactivity', score: Math.floor(Math.random() * 100) + 1 },
            { factor: 'Declining Balance', score: Math.floor(Math.random() * 100) + 1 },
            { factor: 'Competitive Offer', score: Math.floor(Math.random() * 100) + 1 },
            { factor: 'Service Complaints', score: Math.floor(Math.random() * 100) + 1 },
            { factor: 'Fee Sensitivity', score: Math.floor(Math.random() * 100) + 1 }
          ],
          activityHistory: Array.from({ length: 12 }, (_, i) => ({
            month: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toLocaleString('default', { month: 'short' }),
            transactions: Math.floor(Math.random() * 20) + 1,
            value: Math.floor(Math.random() * 5000) + 500
          })).reverse(),
          recentTransactions: Array.from({ length: 5 }, (_, i) => ({
            id: `txn-${i + 1}`,
            date: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            type: ['Deposit', 'Withdrawal', 'Transfer', 'Payment'][Math.floor(Math.random() * 4)],
            amount: Math.floor(Math.random() * 1000) + 50,
            status: ['Completed', 'Pending', 'Failed'][Math.floor(Math.random() * 3)]
          })),
          retentionActions: [
            { id: 1, action: 'Loyalty Bonus Offer', status: 'Completed', date: '2023-03-01', assignee: 'Marissa Jones' },
            { id: 2, action: 'Personal Check-in Call', status: 'Scheduled', date: '2023-03-15', assignee: 'John Smith' },
            { id: 3, action: 'Fee Waiver', status: 'Pending', date: '2023-03-20', assignee: 'Sarah Williams' }
          ],
          notes: [
            { id: 1, text: 'Customer called about account fees. Explained our policy and offered a one-time fee waiver.', author: 'Marissa Jones', date: '2023-03-01' },
            { id: 2, text: 'Noticed declining transaction volume. Flagged for retention team follow-up.', author: 'John Smith', date: '2023-02-15' }
          ]
        };
        
        setCustomer(mockCustomer);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };
    
    fetchCustomerData();
  }, [id]);
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };
  
  // Get risk level
  const getRiskLevel = (score) => {
    if (score >= 75) return { label: 'High', color: 'text-red-600', bgColor: 'bg-red-100' };
    if (score >= 50) return { label: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { label: 'Low', color: 'text-green-600', bgColor: 'bg-green-100' };
  };
  
  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <LoadingSpinner size="lg" text="Loading customer data..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-700 m-4">
        <p className="font-medium">Error loading customer data</p>
        <p className="mt-1">{error.message}</p>
      </div>
    );
  }
  
  const { label: riskLabel, color: riskColor, bgColor: riskBgColor } = getRiskLevel(customer.riskScore);
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Back button and actions */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/customers')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ChevronLeft size={16} className="mr-2" />
            Back to Customers
          </button>
          
          <div className="flex space-x-2">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <MessageSquare size={16} className="mr-2" />
              Contact
            </button>
            
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Edit size={16} className="mr-2" />
              Edit
            </button>
          </div>
        </div>
        
        {/* Customer Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <div className="bg-blue-500 text-white rounded-full h-16 w-16 flex items-center justify-center text-xl font-bold">
                {customer.customerName.split(' ').map(name => name[0]).join('')}
              </div>
              <div className="ml-5">
                <h1 className="text-2xl font-bold text-gray-900">{customer.customerName}</h1>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <p>Customer ID: {customer.id}</p>
                  <span className="mx-2">•</span>
                  <p>{customer.segment} Segment</p>
                  <span className="mx-2">•</span>
                  <p>Joined {customer.joinDate}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${riskBgColor} ${riskColor}`}>
                <AlertTriangle size={16} className="mr-1" />
                {riskLabel} Risk: {customer.riskScore}%
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              Overview
            </button>
            
            <button
              onClick={() => setActiveTab('activity')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'activity'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              Activity History
            </button>
            
            <button
              onClick={() => setActiveTab('retention')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'retention'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              Retention Plan
            </button>
            
            <button
              onClick={() => setActiveTab('notes')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'notes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              Notes
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Customer Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="mt-1">{customer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="mt-1">{customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="mt-1">{customer.address}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Summary</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Account Value</p>
                    <p className="mt-1 text-xl font-semibold">{formatCurrency(customer.accountValue)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Activity</p>
                    <p className="mt-1">{customer.lastActivity}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                    <p className="mt-1">{customer.totalTransactions}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Assessment</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Risk Score</p>
                    <div className="mt-1 flex items-center">
                      <span className={`text-xl font-semibold ${riskColor}`}>{customer.riskScore}%</span>
                      <span className={`ml-2 ${riskBgColor} ${riskColor} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
                        {riskLabel}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Risk Trend</p>
                    <p className="mt-1 text-yellow-600">Increasing (+3% in 30 days)</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Risk Factors Chart */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Risk Factors</h3>
              </div>
              <div className="p-6">
                <CustomerRiskFactorsChart data={customer.riskFactors} />
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
                <button 
                  onClick={() => setActiveTab('activity')}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customer.recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Activity History</h3>
              </div>
              <div className="p-6">
                <CustomerActivityChart data={customer.activityHistory} />
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customer.recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'retention' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Retention Plan</h3>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Retention Priority</p>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${riskBgColor} ${riskColor}`}>
                    {riskLabel}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  This customer has been identified as a {riskLabel.toLowerCase()} churn risk based on recent activity patterns and risk assessment. 
                  A personalized retention plan is being implemented.
                </p>
                
                <h4 className="text-md font-medium text-gray-900 mb-2">Recommended Actions</h4>
                <RetentionActionsTable actions={customer.retentionActions} />
                
                <div className="mt-6 flex justify-end">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <UserPlus size={16} className="mr-2" />
                    Add Action
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Customer Notes</h3>
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <FileText size={16} className="mr-2" />
                  Add Note
                </button>
              </div>
              
              <div className="space-y-4">
                {customer.notes.map((note) => (
                  <div key={note.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900">{note.author}</p>
                      <p className="text-sm text-gray-500">
                        <Clock size={14} className="inline mr-1" />
                        {note.date}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{note.text}</p>
                  </div>
                ))}
              </div>
              
              {customer.notes.length === 0 && (
                <div className="text-center py-10">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No notes</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new note.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetailView;