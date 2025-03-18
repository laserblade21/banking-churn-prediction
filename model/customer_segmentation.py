import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt
import seaborn as sns
from backend.utils.logging_utils import model_logger

class CustomerSegmentation:
    def __init__(self, n_clusters=4):
        self.n_clusters = n_clusters
        self.kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        self.scaler = StandardScaler()
        self.pca = PCA(n_components=2)  # For visualization
        model_logger.info(f"Initialized CustomerSegmentation with {n_clusters} clusters")
    
    def fit(self, customer_data):
        """
        Fit the segmentation model on customer data
        
        Args:
            customer_data (DataFrame): Customer data with features for segmentation
        """
        # Select relevant features for segmentation
        features = [
            'age', 'income', 'account_age_months', 'balance', 'num_products',
            'credit_score', 'transaction_count_12m'
        ]
        
        # Get available features (in case some are missing)
        available_features = [f for f in features if f in customer_data.columns]
        
        # Scale the data
        X = self.scaler.fit_transform(customer_data[available_features])
        
        # Fit the clustering model
        self.kmeans.fit(X)
        model_logger.info(f"Fitted segmentation model on {len(customer_data)} customers")
        
        return self
    
    def predict(self, customer_data):
        """
        Predict segments for customer data
        
        Args:
            customer_data (DataFrame): Customer data to segment
            
        Returns:
            numpy array: Segment labels for each customer
        """
        # Select relevant features for segmentation
        features = [
            'age', 'income', 'account_age_months', 'balance', 'num_products',
            'credit_score', 'transaction_count_12m'
        ]
        
        # Get available features (in case some are missing)
        available_features = [f for f in features if f in customer_data.columns]
        
        # Scale the data
        X = self.scaler.transform(customer_data[available_features])
        
        # Predict segments
        segments = self.kmeans.predict(X)
        
        return segments
    
    def get_segment_profiles(self, customer_data):
        """
        Get profiles of each segment
        
        Args:
            customer_data (DataFrame): Original customer data with segments
            
        Returns:
            DataFrame: Segment profiles with average values for key metrics
        """
        # Add segments to the data
        data_with_segments = customer_data.copy()
        data_with_segments['segment'] = self.predict(customer_data)
        
        # Calculate segment profiles
        segment_profiles = data_with_segments.groupby('segment').agg({
            'age': 'mean',
            'income': 'mean',
            'account_age_months': 'mean',
            'balance': 'mean',
            'num_products': 'mean',
            'credit_score': 'mean',
            'transaction_count_12m': 'mean',
            'churn_probability': 'mean',
            'customer_id': 'count'
        }).reset_index()
        
        # Rename the count column
        segment_profiles = segment_profiles.rename(columns={'customer_id': 'customer_count'})
        
        # Add segment descriptions
        segment_profiles['description'] = segment_profiles.apply(self._generate_segment_description, axis=1)
        
        return segment_profiles
    
    def _generate_segment_description(self, segment_row):
        """Generate a description for a segment based on its profile"""
        descriptions = [
            f"Segment {segment_row['segment']}: ",
        ]
        
        # Age-based description
        if segment_row['age'] < 30:
            descriptions.append("Young customers ")
        elif segment_row['age'] < 50:
            descriptions.append("Middle-aged customers ")
        else:
            descriptions.append("Senior customers ")
        
        # Value-based description
        if segment_row['balance'] > 50000 or segment_row['income'] > 100000:
            descriptions.append("with high value ")
        elif segment_row['balance'] < 5000 and segment_row['income'] < 50000:
            descriptions.append("with low value ")
        
        # Activity-based description
        if segment_row['transaction_count_12m'] > 100:
            descriptions.append("who are highly active ")
        elif segment_row['transaction_count_12m'] < 30:
            descriptions.append("who are inactive ")
        
        # Product-based description
        if segment_row['num_products'] >= 3:
            descriptions.append("with multiple products ")
        elif segment_row['num_products'] <= 1:
            descriptions.append("with single product ")
        
        # Churn risk description
        if segment_row['churn_probability'] > 0.5:
            descriptions.append("at high risk of churning")
        elif segment_row['churn_probability'] < 0.2:
            descriptions.append("with high loyalty")
        
        return ''.join(descriptions).strip()
    
    def visualize_segments(self, customer_data, save_path=None):
        """
        Create visualization of customer segments
        
        Args:
            customer_data (DataFrame): Customer data
            save_path (str, optional): Path to save the visualization
            
        Returns:
            matplotlib figure: Segment visualization
        """
        # Select relevant features for segmentation
        features = [
            'age', 'income', 'account_age_months', 'balance', 'num_products',
            'credit_score', 'transaction_count_12m'
        ]
        
        # Get available features (in case some are missing)
        available_features = [f for f in features if f in customer_data.columns]
        
        # Scale the data
        X = self.scaler.transform(customer_data[available_features])
        
        # Apply PCA for visualization
        X_pca = self.pca.fit_transform(X)
        
        # Get cluster assignments
        clusters = self.predict(customer_data)
        
        # Create visualization
        plt.figure(figsize=(10, 8))
        sns.scatterplot(x=X_pca[:, 0], y=X_pca[:, 1], hue=clusters, palette='viridis')
        plt.title('Customer Segments Visualization')
        plt.xlabel('Principal Component 1')
        plt.ylabel('Principal Component 2')
        
        # Add cluster centers
        centers_pca = self.pca.transform(self.kmeans.cluster_centers_)
        plt.scatter(centers_pca[:, 0], centers_pca[:, 1], s=100, c='red', marker='X')
        
        if save_path:
            plt.savefig(save_path)
            model_logger.info(f"Saved segment visualization to {save_path}")
        
        return plt.gcf()