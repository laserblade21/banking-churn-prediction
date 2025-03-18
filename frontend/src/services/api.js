// frontend/src/services/api.js
// Updated to use environment variables correctly

/**
 * API service for communicating with the churn prediction backend
 */
// Use environment variable if available, otherwise fall back to default
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Fetch dashboard summary data
 * @returns {Promise<Object>} Dashboard summary data
 */
export const fetchDashboardSummary = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/summary`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    
    // Return mock data for development/demo purposes
    return {
      totalCustomers: 1000,
      atRiskCount: 250,
      highRiskCount: 78,
      mediumRiskCount: 172,
      lowRiskCount: 750,
      averageChurnProbability: 0.18,
      valueAtRisk: 1250000,
      riskDistribution: [
        { name: "High Risk", value: 78, color: "#ef4444" },
        { name: "Medium Risk", value: 172, color: "#f59e0b" },
        { name: "Low Risk", value: 750, color: "#10b981" }
      ],
      riskFactors: [
        { name: "Inactive Period", value: 0.32 },
        { name: "Low Balance", value: 0.28 },
        { name: "Few Products", value: 0.21 },
        { name: "Service Calls", value: 0.15 },
        { name: "Age Group", value: 0.04 }
      ],
      monthlyTrend: [
        { month: "Jan", value: 0.15 },
        { month: "Feb", value: 0.14 },
        { month: "Mar", value: 0.16 },
        { month: "Apr", value: 0.17 },
        { month: "May", value: 0.19 },
        { month: "Jun", value: 0.18 }
      ]
    };
  }
};

/**
 * Fetch at-risk customers
 * @param {Object} options Options for filtering and pagination
 * @param {string} options.riskLevel Risk level filter ('high', 'medium', 'low', 'all')
 * @param {number} options.limit Maximum number of customers to return
 * @param {number} options.offset Pagination offset
 * @returns {Promise<Object>} Paginated list of at-risk customers
 */
export const fetchAtRiskCustomers = async ({ riskLevel = 'all', limit = 100, offset = 0 } = {}) => {
  try {
    const url = new URL(`${API_BASE_URL}/customers/at-risk`);
    url.searchParams.append('risk', riskLevel);
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('offset', offset.toString());
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching at-risk customers:', error);
    
    // Return mock data for development/demo purposes
    return {
      customers: [
        { customerId: 'CUST001', riskScore: 0.87, riskCategory: 'High', segment: 'Silver', clv: 4230 },
        { customerId: 'CUST002', riskScore: 0.83, riskCategory: 'High', segment: 'Gold', clv: 12500 },
        { customerId: 'CUST003', riskScore: 0.79, riskCategory: 'High', segment: 'Bronze', clv: 2100 },
        { customerId: 'CUST004', riskScore: 0.76, riskCategory: 'High', segment: 'Silver', clv: 5300 },
        { customerId: 'CUST005', riskScore: 0.75, riskCategory: 'High', segment: 'Gold', clv: 9800 },
        { customerId: 'CUST006', riskScore: 0.65, riskCategory: 'Medium', segment: 'Silver', clv: 4800 },
        { customerId: 'CUST007', riskScore: 0.62, riskCategory: 'Medium', segment: 'Bronze', clv: 3200 },
        { customerId: 'CUST008', riskScore: 0.58, riskCategory: 'Medium', segment: 'Gold', clv: 8500 },
        { customerId: 'CUST009', riskScore: 0.55, riskCategory: 'Medium', segment: 'Silver', clv: 5100 },
        { customerId: 'CUST010', riskScore: 0.52, riskCategory: 'Medium', segment: 'Bronze', clv: 2800 }
      ],
      total: 250,
      limit: 10,
      offset: 0
    };
  }
};

/**
 * Fetch customer details
 * @param {string} customerId Customer ID
 * @returns {Promise<Object>} Customer details
 */
export const fetchCustomerDetails = async (customerId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/customers/${customerId}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching customer ${customerId}:`, error);
    
    // Return mock data for development/demo purposes
    return {
      id: customerId,
      name: `Customer ${customerId}`,
      age: 42,
      segment: 'Silver',
      products: ['Checking', 'Savings', 'Credit Card'],
      customerSince: '2019-03-15',
      riskScore: 0.87,
      riskCategory: 'High',
      predictedChurn: true,
      riskFactors: [
        { factor: 'Months Inactive', value: 0.45, impact: 'High' },
        { factor: 'Balance Trend', value: 0.30, impact: 'Medium' },
        { factor: 'Product Usage', value: 0.15, impact: 'Low' },
        { factor: 'Support Calls', value: 0.10, impact: 'Low' }
      ],
      activityData: [
        { month: 'Jan', transactions: 15, balance: 4200 },
        { month: 'Feb', transactions: 12, balance: 3800 },
        { month: 'Mar', transactions: 8, balance: 3500 },
        { month: 'Apr', transactions: 5, balance: 3100 },
        { month: 'May', transactions: 3, balance: 2800 },
        { month: 'Jun', transactions: 2, balance: 2600 }
      ],
      recommendedActions: [
        { 
          action: 'Fee waiver - 6mo', 
          description: 'Waive monthly account fees for 6 months', 
          impact: 'High', 
          cost: 120,
          roi: 540
        },
        { 
          action: 'Savings rate boost', 
          description: 'Offer +0.5% on savings for 1 year', 
          impact: 'Medium', 
          cost: 85,
          roi: 320
        },
        { 
          action: 'Personal callback', 
          description: 'Schedule relationship manager call', 
          impact: 'High', 
          cost: 50,
          roi: 420
        }
      ]
    };
  }
};

/**
 * Predict churn for a new customer
 * @param {Object} customerData Customer data for prediction
 * @returns {Promise<Object>} Prediction results
 */
export const predictChurn = async (customerData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error predicting churn:', error);
    throw error;
  }
};

/**
 * Calculate ROI for a retention campaign
 * @param {Object} campaignData Campaign parameters
 * @returns {Promise<Object>} ROI calculation results
 */
export const calculateCampaignROI = async (campaignData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/campaigns/roi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(campaignData),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error calculating campaign ROI:', error);
    throw error;
  }
};

export default {
  fetchDashboardSummary,
  fetchAtRiskCustomers,
  fetchCustomerDetails,
  predictChurn,
  calculateCampaignROI
};