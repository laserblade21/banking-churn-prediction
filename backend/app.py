from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os
import logging

os.makedirs('logs', exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/api.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('churn_api')

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}) 

model_path = 'models/churn_model_latest.pkl'
logger.info(f"Loading model from {model_path}")

try:
    model_info = joblib.load(model_path)
    model = model_info['model']
    preprocessing_pipeline = model_info['preprocessing_pipeline']
    threshold = model_info['threshold']
    feature_names = model_info.get('feature_names', [])
    
    logger.info(f"Model loaded successfully with threshold {threshold}")
except Exception as e:
    logger.error(f"Failed to load model: {str(e)}")
    model = None
    preprocessing_pipeline = None
    threshold = 0.5

try:
    risk_scores = pd.read_csv('data/customer_risk_scores.csv')
    logger.info(f"Loaded risk scores for {len(risk_scores)} customers")
except Exception as e:
    logger.error(f"Failed to load risk scores: {str(e)}")

    risk_scores = pd.DataFrame({
        'CustomerID': [f'CUST{i:03d}' for i in range(1, 11)],
        'ChurnProbability': np.random.uniform(0.1, 0.9, 10),
        'RiskCategory': ['High' if p > 0.7 else 'Medium' if p > 0.4 else 'Low' for p in np.random.uniform(0.1, 0.9, 10)],
        'PredictedChurn': [1 if p > 0.5 else 0 for p in np.random.uniform(0.1, 0.9, 10)]
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy' if model is not None else 'unhealthy',
        'model_loaded': model is not None
    })

@app.route('/api/dashboard/summary', methods=['GET'])
def dashboard_summary():
    """Get summary statistics for the dashboard"""
    if risk_scores.empty:
        return jsonify({
            'error': 'No risk score data available'
        }), 404
    
    try:
      
        risk_distribution = risk_scores['RiskCategory'].value_counts().to_dict()
        
        total_customers = len(risk_scores)
        avg_churn_probability = float(risk_scores['ChurnProbability'].mean())
        
       
        avg_customer_value = 5000
        value_at_risk = sum(risk_scores['ChurnProbability'] * avg_customer_value)
        
    
        risk_factors = [
            {"name": "Inactive Period", "value": 0.32},
            {"name": "Low Balance", "value": 0.28},
            {"name": "Few Products", "value": 0.21},
            {"name": "Service Calls", "value": 0.15},
            {"name": "Age Group", "value": 0.04}
        ]
        
    
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
        trend_values = [0.15, 0.14, 0.16, 0.17, 0.19, 0.18]
        monthly_trend = [{"month": m, "value": v} for m, v in zip(months, trend_values)]
        
        high_risk = len(risk_scores[risk_scores['RiskCategory'] == 'High'])
        medium_risk = len(risk_scores[risk_scores['RiskCategory'] == 'Medium'])
        low_risk = len(risk_scores[risk_scores['RiskCategory'] == 'Low'])
        
        return jsonify({
            'totalCustomers': total_customers,
            'atRiskCount': high_risk + medium_risk,
            'highRiskCount': high_risk,
            'mediumRiskCount': medium_risk,
            'lowRiskCount': low_risk,
            'averageChurnProbability': avg_churn_probability,
            'valueAtRisk': value_at_risk,
            'riskDistribution': [
                {"name": "High Risk", "value": high_risk, "color": "#ef4444"},
                {"name": "Medium Risk", "value": medium_risk, "color": "#f59e0b"},
                {"name": "Low Risk", "value": low_risk, "color": "#10b981"}
            ],
            'riskFactors': risk_factors,
            'monthlyTrend': monthly_trend
        })
    except Exception as e:
        logger.error(f"Error generating dashboard summary: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/customers/at-risk', methods=['GET'])
def at_risk_customers():
    """Get the list of at-risk customers"""
    if risk_scores.empty:
        return jsonify({
            'error': 'No risk score data available'
        }), 404
    
    try:
     
        risk_level = request.args.get('risk', 'all')
        limit = min(int(request.args.get('limit', 100)), 1000)
        offset = int(request.args.get('offset', 0))
        

        if risk_level == 'high':
            filtered = risk_scores[risk_scores['RiskCategory'] == 'High']
        elif risk_level == 'medium':
            filtered = risk_scores[risk_scores['RiskCategory'] == 'Medium']
        elif risk_level == 'low':
            filtered = risk_scores[risk_scores['RiskCategory'] == 'Low']
        else:
            filtered = risk_scores
        
      
        sorted_scores = filtered.sort_values('ChurnProbability', ascending=False)
        
        # Apply pagination
        paginated = sorted_scores.iloc[offset:offset+limit]
        
        # Convert to list of dictionaries
        customer_list = []
        for _, row in paginated.iterrows():
            # In a real system, you'd join with customer info from a database
            customer_list.append({
                'customerId': row['CustomerID'],
                'riskScore': float(row['ChurnProbability']),
                'riskCategory': row['RiskCategory'],
                'predictedChurn': bool(row['PredictedChurn']),
                # Add additional customer information here
                'segment': 'Standard',  # This would come from your customer data
                'clv': 5000 + np.random.normal(0, 1000)  # Example value
            })
        
        return jsonify({
            'customers': customer_list,
            'total': len(filtered),
            'limit': limit,
            'offset': offset
        })
    except Exception as e:
        logger.error(f"Error fetching at-risk customers: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/customers/<customer_id>', methods=['GET'])
def customer_detail(customer_id):
    """Get detailed information for a specific customer"""
    if risk_scores.empty:
        return jsonify({
            'error': 'No risk score data available'
        }), 404
    
    try:
        # Find the customer
        customer = risk_scores[risk_scores['CustomerID'] == customer_id]
        if len(customer) == 0:
            return jsonify({
                'error': f'Customer {customer_id} not found'
            }), 404
        
        # Get the customer's risk data
        risk_data = customer.iloc[0]
        
        # In a real system, you'd join with customer info from a database
        # Here we're generating example data
        customer_detail = {
            'id': customer_id,
            'name': f"Customer {customer_id}",
            'age': np.random.randint(18, 80),
            'segment': 'Standard',
            'products': ['Checking', 'Savings', 'Credit Card'],
            'customerSince': f"2018-{np.random.randint(1, 13):02d}-{np.random.randint(1, 29):02d}",
            'riskScore': float(risk_data['ChurnProbability']),
            'riskCategory': risk_data['RiskCategory'],
            'predictedChurn': bool(risk_data['PredictedChurn']),
            'riskFactors': [
                {'factor': 'Months Inactive', 'value': 0.45, 'impact': 'High'},
                {'factor': 'Balance Trend', 'value': 0.30, 'impact': 'Medium'},
                {'factor': 'Product Usage', 'value': 0.15, 'impact': 'Low'},
                {'factor': 'Support Calls', 'value': 0.10, 'impact': 'Low'}
            ],
            'activityData': [
                {'month': 'Jan', 'transactions': 15, 'balance': 4200},
                {'month': 'Feb', 'transactions': 12, 'balance': 3800},
                {'month': 'Mar', 'transactions': 8, 'balance': 3500},
                {'month': 'Apr', 'transactions': 5, 'balance': 3100},
                {'month': 'May', 'transactions': 3, 'balance': 2800},
                {'month': 'Jun', 'transactions': 2, 'balance': 2600}
            ],
            'recommendedActions': [
                {
                    'action': 'Fee waiver - 6mo',
                    'description': 'Waive monthly account fees for 6 months',
                    'impact': 'High',
                    'cost': 120,
                    'roi': 540
                },
                {
                    'action': 'Savings rate boost',
                    'description': 'Offer +0.5% on savings for 1 year',
                    'impact': 'Medium',
                    'cost': 85,
                    'roi': 320
                },
                {
                    'action': 'Personal callback',
                    'description': 'Schedule relationship manager call',
                    'impact': 'High',
                    'cost': 50,
                    'roi': 420
                }
            ]
        }
        
        return jsonify(customer_detail)
    except Exception as e:
        logger.error(f"Error fetching customer details: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/predict', methods=['POST'])
def predict():
    """Predict churn for a new customer"""
    if not model or not preprocessing_pipeline:
        return jsonify({"error": "Model not loaded properly"}), 500
    try:
        # Get the data from the request
        input_data = request.get_json()  # Expecting JSON data
        # Convert the input data to a DataFrame
        input_df = pd.DataFrame([input_data])
        
        # Ensure the input data matches the expected features (optional)
        if len(feature_names) > 0 and set(input_df.columns) != set(feature_names):
            logger.warning(f"Feature mismatch: Expected {feature_names}, but got {input_df.columns.tolist()}")
        
        # Preprocess the input data
        processed_data = preprocessing_pipeline.transform(input_df)
        # Make prediction
        prediction = model.predict(processed_data)
        prediction_prob = model.predict_proba(processed_data)[:, 1]  # Assuming binary classification
        # Classify based on the threshold
        prediction_class = (prediction_prob >= threshold).astype(int)
        
        # Determine risk category
        if prediction_prob[0] < 0.3:
            risk_category = 'Low'
        elif prediction_prob[0] < 0.7:
            risk_category = 'Medium'
        else:
            risk_category = 'High'
        
        # Simplified CLV calculation
        avg_customer_value = 5000  # Average customer lifetime value in dollars
        value_at_risk = prediction_prob[0] * avg_customer_value
        
        # Generate recommended actions based on risk
        recommended_actions = []
        if risk_category == 'High':
            recommended_actions.append({
                'action': 'Personal callback',
                'description': 'Schedule relationship manager call',
                'impact': 'High',
                'cost': 50
            })
            recommended_actions.append({
                'action': 'Fee waiver - 6mo',
                'description': 'Waive monthly account fees for 6 months',
                'impact': 'High',
                'cost': 120
            })
        elif risk_category == 'Medium':
            recommended_actions.append({
                'action': 'Targeted offer',
                'description': 'Send email with special savings rate',
                'impact': 'Medium',
                'cost': 30
            })
        
        # Return the result
        return jsonify({
            "prediction": prediction_class.tolist(),
            "probability": prediction_prob.tolist(),
            "riskCategory": risk_category,
            "customerValue": avg_customer_value,
            "valueAtRisk": float(value_at_risk),
            "recommendedActions": recommended_actions
        })
    except Exception as e:
        logger.error(f"Error during prediction: {str(e)}")
        return jsonify({"error": f"Failed to make prediction: {str(e)}"}), 500

@app.route('/api/campaigns/roi', methods=['POST'])
def campaign_roi():
    """Calculate ROI for a retention campaign"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided'
            }), 400
        
        # Extract parameters
        target_segment = data.get('targetSegment', 'high')
        num_customers = data.get('numCustomers', 100)
        avg_customer_value = data.get('avgCustomerValue', 5000)
        campaign_cost = data.get('campaignCost', 5000)
        estimated_effectiveness = data.get('estimatedEffectiveness', 30) / 100
        
        # Get churn rates based on segment
        churn_rate = 0.75 if target_segment == 'high' else 0.35 if target_segment == 'medium' else 0.1
        
        # Calculate expected losses without campaign
        expected_loss = num_customers * churn_rate * avg_customer_value
        
        # Calculate expected savings with campaign
        customers_retained = num_customers * (churn_rate * estimated_effectiveness)
        value_saved = customers_retained * avg_customer_value
        
        # Calculate ROI
        net_return = value_saved - campaign_cost
        roi = (net_return / campaign_cost) * 100 if campaign_cost > 0 else 0
        
        result = {
            'expectedLoss': expected_loss,
            'customersRetained': customers_retained,
            'valueSaved': value_saved,
            'netReturn': net_return,
            'roi': roi
        }
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"ROI calculation error: {str(e)}")
        return jsonify({'error': f'ROI calculation failed: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)