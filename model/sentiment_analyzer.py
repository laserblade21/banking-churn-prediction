import pandas as pd
import numpy as np
import re
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from backend.utils.logging_utils import model_logger

# Download NLTK resources
nltk.download('vader_lexicon')
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

class FeedbackSentimentAnalyzer:
    def __init__(self):
        self.sia = SentimentIntensityAnalyzer()
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        
        # Add banking-specific terms to improve sentiment analysis
        self.sia.lexicon.update({
            'fee': -2.0,
            'fees': -2.0,
            'charge': -1.5,
            'charges': -1.5,
            'overcharge': -3.0,
            'expensive': -2.0,
            'error': -2.0,
            'mistake': -2.0,
            'issue': -1.5,
            'problem': -1.5,
            'wait': -1.0,
            'waiting': -1.5,
            'delay': -1.5,
            'slow': -1.5,
            'difficult': -1.5,
            'complicated': -2.0,
            'confusing': -1.5,
            'helpful': 2.0,
            'easy': 2.0,
            'simple': 1.5,
            'quick': 2.0,
            'fast': 2.0,
            'convenient': 2.0,
            'recommend': 2.0,
            'happy': 2.0,
            'satisfied': 2.0,
            'great': 2.5,
            'excellent': 3.0,
            'amazing': 3.0,
            'terrible': -3.0,
            'horrible': -3.0,
            'worst': -3.0,
            'avoid': -2.0,
            'never': -1.0,
            'leaving': -2.0,
            'switching': -2.0,
            'cancel': -2.0,
            'closing': -2.0,
            'account': 0.0,  # Neutral
        })
        
        model_logger.info("Initialized FeedbackSentimentAnalyzer")
    
    def preprocess_text(self, text):
        """
        Preprocess text for sentiment analysis
        
        Args:
            text (str): Raw feedback text
            
        Returns:
            str: Preprocessed text
        """
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters and numbers
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        # Tokenize
        tokens = word_tokenize(text)
        
        # Remove stopwords and lemmatize
        tokens = [self.lemmatizer.lemmatize(token) for token in tokens if token not in self.stop_words]
        
        # Join back to string
        preprocessed_text = ' '.join(tokens)
        
        return preprocessed_text
    
    def analyze_sentiment(self, text):
        """
        Analyze sentiment of a piece of feedback
        
        Args:
            text (str): Customer feedback text
            
        Returns:
            dict: Sentiment scores and label
        """
        # Preprocess text
        preprocessed_text = self.preprocess_text(text)
        
        # Get sentiment scores
        sentiment_scores = self.sia.polarity_scores(preprocessed_text)
        
        # Determine sentiment label
        compound_score = sentiment_scores['compound']
        if compound_score >= 0.05:
            sentiment_label = 'positive'
        elif compound_score <= -0.05:
            sentiment_label = 'negative'
        else:
            sentiment_label = 'neutral'
        
        # Create result dictionary
        result = {
            'text': text,
            'preprocessed_text': preprocessed_text,
            'compound_score': compound_score,
            'positive_score': sentiment_scores['pos'],
            'negative_score': sentiment_scores['neg'],
            'neutral_score': sentiment_scores['neu'],
            'sentiment_label': sentiment_label
        }
        
        return result
    
    def batch_analyze(self, feedback_df, text_column='feedback_text'):
        """
        Analyze sentiment for a batch of feedback
        
        Args:
            feedback_df (DataFrame): DataFrame containing feedback
            text_column (str): Column name containing the feedback text
            
        Returns:
            DataFrame: Original DataFrame with sentiment analysis columns added
        """
        # Create a copy of the input DataFrame
        result_df = feedback_df.copy()
        
        # Apply sentiment analysis to each row
        sentiment_results = result_df[text_column].apply(self.analyze_sentiment)
        
        # Extract results
        result_df['sentiment_compound'] = sentiment_results.apply(lambda x: x['compound_score'])
        result_df['sentiment_positive'] = sentiment_results.apply(lambda x: x['positive_score'])
        result_df['sentiment_negative'] = sentiment_results.apply(lambda x: x['negative_score'])
        result_df['sentiment_neutral'] = sentiment_results.apply(lambda x: x['neutral_score'])
        result_df['sentiment_label'] = sentiment_results.apply(lambda x: x['sentiment_label'])
        
        model_logger.info(f"Analyzed sentiment for {len(result_df)} feedback entries")
        
        return result_df
    
    def extract_churn_signals(self, feedback_df, text_column='feedback_text'):
        """
        Extract churn signals from feedback
        
        Args:
            feedback_df (DataFrame): DataFrame containing feedback
            text_column (str): Column name containing the feedback text
            
        Returns:
            DataFrame: DataFrame with churn signal columns
        """
        # Create a copy of the input DataFrame
        result_df = feedback_df.copy()
        
        # Define churn signal keywords
        churn_keywords = {
            'cancellation': ['cancel', 'cancelling', 'cancellation', 'terminate', 'close account'],
            'competitor': ['switch', 'switching', 'moved to', 'another bank', 'competitor', 'better rate'],
            'dissatisfaction': ['unhappy', 'dissatisfied', 'disappointed', 'frustrated', 'not satisfied'],
            'fees': ['high fees', 'expensive', 'too costly', 'charge too much', 'hidden fees'],
            'service': ['poor service', 'bad service', 'rude', 'unhelpful', 'unresponsive']
        }
        
        # Function to check for keywords in text
        def check_keywords(text, keywords):
            text = text.lower()
            return any(keyword in text for keyword in keywords)
        
        # Add columns for each churn signal category
        for category, keywords in churn_keywords.items():
            column_name = f'churn_signal_{category}'
            result_df[column_name] = result_df[text_column].apply(
                lambda text: check_keywords(text, keywords)
            )
        
        # Calculate overall churn signal strength (0-1 scale)
        result_df['churn_signal_strength'] = result_df[[f'churn_signal_{category}' for category in churn_keywords.keys()]].sum(axis=1) / len(churn_keywords)
        
        # Combine with sentiment for overall churn risk from feedback
        # Scale compound sentiment from [-1,1] to [0,1]
        sentiment_factor = (1 - (result_df['sentiment_compound'] + 1) / 2)
        
        # Combine sentiment and explicit churn signals
        result_df['feedback_churn_risk'] = 0.7 * sentiment_factor + 0.3 * result_df['churn_signal_strength']
        
        model_logger.info(f"Extracted churn signals from {len(result_df)} feedback entries")
        
        return result_df