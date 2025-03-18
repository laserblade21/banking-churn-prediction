import React, { useState } from 'react';
import { Bell, CreditCard, Lock, User, UserPlus, Database, Sliders } from 'lucide-react';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>
        
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-64 mb-6 md:mb-0">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                  activeTab === 'profile'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <User 
                  size={20} 
                  className={`mr-3 flex-shrink-0 ${
                    activeTab === 'profile' ? 'text-blue-600' : 'text-gray-400'
                  }`} 
                />
                Profile
              </button>
              
              <button
                onClick={() => setActiveTab('account')}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                  activeTab === 'account'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <CreditCard 
                  size={20} 
                  className={`mr-3 flex-shrink-0 ${
                    activeTab === 'account' ? 'text-blue-600' : 'text-gray-400'
                  }`} 
                />
                Account
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                  activeTab === 'security'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Lock 
                  size={20} 
                  className={`mr-3 flex-shrink-0 ${
                    activeTab === 'security' ? 'text-blue-600' : 'text-gray-400'
                  }`} 
                />
                Security
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                  activeTab === 'notifications'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Bell 
                  size={20} 
                  className={`mr-3 flex-shrink-0 ${
                    activeTab === 'notifications' ? 'text-blue-600' : 'text-gray-400'
                  }`} 
                />
                Notifications
              </button>
              
              <button
                onClick={() => setActiveTab('team')}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                  activeTab === 'team'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <UserPlus 
                  size={20} 
                  className={`mr-3 flex-shrink-0 ${
                    activeTab === 'team' ? 'text-blue-600' : 'text-gray-400'
                  }`} 
                />
                Team
              </button>
              
              <button
                onClick={() => setActiveTab('data')}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                  activeTab === 'data'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Database 
                  size={20} 
                  className={`mr-3 flex-shrink-0 ${
                    activeTab === 'data' ? 'text-blue-600' : 'text-gray-400'
                  }`} 
                />
                Data Management
              </button>
              
              <button
                onClick={() => setActiveTab('model')}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                  activeTab === 'model'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Sliders 
                  size={20} 
                  className={`mr-3 flex-shrink-0 ${
                    activeTab === 'model' ? 'text-blue-600' : 'text-gray-400'
                  }`} 
                />
                Model Configuration
              </button>
            </nav>
          </div>
          
          {/* Content */}
          <div className="md:ml-6 md:flex-1">
            <div className="bg-white shadow rounded-lg">
              {activeTab === 'profile' && (
                <div>
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">User Profile</h3>
                  </div>
                  <div className="p-6">
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                            First name
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="first-name"
                              id="first-name"
                              autoComplete="given-name"
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              defaultValue="John"
                            />
                          </div>
                        </div>
                        
                        <div className="sm:col-span-3">
                          <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                            Last name
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="last-name"
                              id="last-name"
                              autoComplete="family-name"
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              defaultValue="Doe"
                            />
                          </div>
                        </div>
                        
                        <div className="sm:col-span-4">
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email address
                          </label>
                          <div className="mt-1">
                            <input
                              id="email"
                              name="email"
                              type="email"
                              autoComplete="email"
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              defaultValue="john.doe@example.com"
                            />
                          </div>
                        </div>
                        
                        <div className="sm:col-span-3">
                          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                            Role
                          </label>
                          <div className="mt-1">
                            <select
                              id="role"
                              name="role"
                              autoComplete="role"
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              defaultValue="admin"
                            >
                              <option value="admin">Administrator</option>
                              <option value="manager">Manager</option>
                              <option value="analyst">Data Analyst</option>
                              <option value="user">Regular User</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              {activeTab === 'model' && (
                <div>
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Model Configuration</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-base font-medium text-gray-900 mb-4">Churn Prediction Settings</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="risk-threshold" className="block text-sm font-medium text-gray-700 mb-1">
                              Risk Threshold (%)
                            </label>
                            <div className="flex items-center">
                              <input
                                type="range"
                                id="risk-threshold"
                                name="risk-threshold"
                                min="0"
                                max="100"
                                step="1"
                                defaultValue="50"
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <span className="ml-2 text-sm text-gray-500">50%</span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              Customers with a risk score above this threshold will be flagged as high risk.
                            </p>
                          </div>
                          
                          <div>
                            <label htmlFor="prediction-window" className="block text-sm font-medium text-gray-700 mb-1">
                              Prediction Window (days)
                            </label>
                            <select
                              id="prediction-window"
                              name="prediction-window"
                              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                              defaultValue="30"
                            >
                              <option value="7">7 days</option>
                              <option value="14">14 days</option>
                              <option value="30">30 days</option>
                              <option value="60">60 days</option>
                              <option value="90">90 days</option>
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                              The time frame for predicting customer churn risk.
                            </p>
                          </div>
                          
                          <div className="relative flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="auto-update"
                                name="auto-update"
                                type="checkbox"
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                defaultChecked
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="auto-update" className="font-medium text-gray-700">
                                Automatic Model Retraining
                              </label>
                              <p className="text-gray-500">Automatically retrain the model with new data every week.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-base font-medium text-gray-900 mb-4">Feature Importance</h4>
                        
                        <div className="space-y-4">
                          {[
                            { name: 'Account Activity', value: 85 },
                            { name: 'Balance Trends', value: 72 },
                            { name: 'Transaction Frequency', value: 68 },
                            { name: 'Customer Support Interactions', value: 54 },
                            { name: 'Product Usage', value: 42 }
                          ].map((feature) => (
                            <div key={feature.name}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-700">{feature.name}</span>
                                <span className="text-sm text-gray-500">{feature.value}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${feature.value}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Reset to Defaults
                        </button>
                        <button
                          type="button"
                          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'data' && (
                <div>
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Data Management</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-base font-medium text-gray-900 mb-4">Data Sources</h4>
                        
                        <div className="bg-gray-50 p-4 rounded-md">
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <h5 className="text-sm font-medium text-gray-900">Customer Database</h5>
                              <p className="text-xs text-gray-500">Last synced: 2 hours ago</p>
                            </div>
                            <button
                              type="button"
                              className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Sync Now
                            </button>
                          </div>
                          
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <h5 className="text-sm font-medium text-gray-900">Transaction History</h5>
                              <p className="text-xs text-gray-500">Last synced: 3 hours ago</p>
                            </div>
                            <button
                              type="button"
                              className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Sync Now
                            </button>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div>
                              <h5 className="text-sm font-medium text-gray-900">Customer Support Tickets</h5>
                              <p className="text-xs text-gray-500">Last synced: 1 day ago</p>
                            </div>
                            <button
                              type="button"
                              className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Sync Now
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-base font-medium text-gray-900 mb-4">Import / Export</h4>
                        
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="p-4 border border-gray-300 rounded-md">
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Import Data</h5>
                            <p className="text-xs text-gray-500 mb-4">
                              Upload CSV files to import customer or transaction data.
                            </p>
                            <label className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                              <span>Select Files</span>
                              <input type="file" className="hidden" multiple />
                            </label>
                          </div>
                          
                          <div className="p-4 border border-gray-300 rounded-md">
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Export Data</h5>
                            <p className="text-xs text-gray-500 mb-4">
                              Download data as CSV for analysis or backup.
                            </p>
                            <button
                              type="button"
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Export Data
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;