import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'personalized_learning.settings')
django.setup()

from learning.models import Subject, Topic, ContentVersion
from django.utils.text import slugify

SUBJECTS = {
    "Deep Learning": [
        "Introduction to Neural Networks", "Perceptrons and Multilayer Perceptrons", 
        "Activation Functions", "Forward and Backward Propagation", 
        "Loss Functions and Optimization Algorithms", "Convolutional Neural Networks (CNNs)",
        "Image Classification with CNNs", "Object Detection and Segmentation",
        "Recurrent Neural Networks (RNNs)", "Long Short-Term Memory (LSTMs)",
        "Gated Recurrent Units (GRUs)", "Sequence to Sequence Models",
        "Attention Mechanisms", "Transformers and Self-Attention",
        "Autoencoders and Dimensionality Reduction", "Generative Adversarial Networks (GANs)",
        "Transfer Learning in DL", "Regularization Techniques (Dropout, L2)",
        "Hyperparameter Tuning in Deep Learning", "Deploying Deep Learning Models"
    ],
    "Advance Machine Learning": [
        "Data Preprocessing and Feature Engineering", "Handling Missing Data and Outliers",
        "Model Evaluation Metrics (Accuracy, Precision, Recall, F1)", "Cross-Validation Techniques",
        "Ensemble Learning: Bagging and Random Forests", "Ensemble Learning: Boosting (AdaBoost, XGBoost)",
        "Support Vector Machines (SVMs)", "Kernel Methods in SVM",
        "K-Nearest Neighbors (KNN) in Practice", "Decision Trees and Rule-Based Models",
        "Logistic Regression for Classification", "Clustering: K-Means and Hierarchical",
        "Dimensionality Reduction: PCA and t-SNE", "Anomaly Detection Techniques",
        "Recommendation Systems (Collaborative Filtering)", "Time Series Forecasting with ML",
        "Natural Language Processing (NLP) Basics", "Text Classification and Sentiment Analysis",
        "Model Interpretability (SHAP, LIME)", "MLOps and Model Lifecycle Management"
    ],
    "Web Development": [
        "Introduction to Web Architecture (Client-Server)", "HTML5 Semantic Elements and Structure",
        "CSS3 Styling, Flexbox, and Grid", "Responsive Web Design and Media Queries",
        "JavaScript Fundamentals (ES6+)", "DOM Manipulation and Event Handling",
        "Asynchronous JavaScript (Promises, async/await)", "Fetch API and RESTful Services",
        "Frontend Frameworks: Introduction to React", "State Management in React (Hooks)",
        "Routing in Single Page Applications (SPAs)", "Backend Basics: Node.js and Express",
        "Creating REST APIs with Express", "Authentication and Authorization (JWT)",
        "Database Integration (SQL vs NoSQL)", "Working with MongoDB and Mongoose",
        "Web Security Basics (XSS, CSRF, CORS)", "Web Performance Optimization",
        "Version Control with Git and GitHub", "Deployment and Hosting (Vercel, Heroku, AWS)"
    ],
    "Big Data Analytics": [
        "Introduction to Big Data (5 Vs)", "Hadoop Ecosystem Overview",
        "Hadoop Distributed File System (HDFS)", "MapReduce Programming Model",
        "Introduction to Apache Spark", "Spark RDDs, DataFrames, and Datasets",
        "Spark SQL for Data Analysis", "Real-time Streaming with Spark Streaming",
        "NoSQL Databases for Big Data (HBase, Cassandra)", "Data Warehousing with Apache Hive",
        "Data Ingestion with Apache Kafka", "Data Integration with Apache Sqoop and Flume",
        "Graph Processing with GraphX", "Machine Learning on Big Data (MLlib)",
        "Data Lake Architecture vs Data Warehouse", "Cloud Computing for Big Data (AWS/GCP/Azure)",
        "Big Data Security and Privacy", "Data Governance and Quality Management",
        "Data Visualization for Big Data", "Case Studies: Big Data in E-commerce and Healthcare"
    ],
    "Consumer Behaviour": [
        "Introduction to Consumer Behaviour", "The Consumer Decision-Making Process",
        "Needs, Motivation, and Involvement", "Consumer Perception and Sensory Marketing",
        "Learning and Memory in Consumers", "Consumer Attitudes and Attitude Change",
        "Personality, Self-Concept, and Lifestyle", "The Influence of Culture on Consumer Behaviour",
        "Subcultures and Demographic Influences", "Social Class and Social Status",
        "Reference Groups and Word-of-Mouth", "Family Influences and Household Decision Making",
        "Situational Influences on Buying Behaviour", "Consumer Information Processing",
        "Post-Purchase Behaviour and Satisfaction", "Brand Loyalty and Customer Retention",
        "Digital Consumer Behaviour and E-commerce", "The Psychology of Pricing",
        "Consumer Behaviour and Marketing Strategy", "Ethics and Consumer Protection"
    ]
}

def generate_content(topic_name, subject_name, style_type):
    if style_type == 'theory':
        return (
            f"**The Theoretical Foundation of {topic_name}**\n\n"
            f"{topic_name} is a fundamental concept within the field of {subject_name}. "
            f"It involves the theoretical principles and structured methodologies required to understand "
            f"how systems operate at a foundational level.\n\n"
            f"Key principles include:\n"
            f"• Foundational definitions and terminology.\n"
            f"• Mathematical or structural models governing behavior.\n"
            f"• Historical context and theoretical evolution.\n\n"
            f"Mastering the theory of {topic_name} is essential before moving on to practical implementation."
        )
    elif style_type == 'analogy':
        return (
            f"**Real-World Analogy for {topic_name}**\n\n"
            f"Think of {topic_name} like organizing a massive library.\n\n"
            f"Just as a library needs a structured catalog system to help you find a specific book quickly, "
            f"{topic_name} in {subject_name} provides the necessary structure to process information efficiently.\n\n"
            f"• The **Books** represent your raw data or inputs.\n"
            f"• The **Librarian** represents the core algorithm or engine.\n"
            f"• The **Catalog** represents the structural framework.\n\n"
            f"Once you see this parallel, understanding {topic_name} becomes much more intuitive!"
        )
    elif style_type == 'logic':
        return (
            f"**Step-by-Step Logic of {topic_name}**\n\n"
            f"Understanding the logic of {topic_name} requires breaking it down into a systematic algorithm:\n\n"
            f"**Step 1: Initialization**\n"
            f"Define the starting state, input parameters, and environment variables.\n\n"
            f"**Step 2: Processing Engine**\n"
            f"Apply the core transformation rules specific to {topic_name}. This is where the heavy lifting occurs.\n\n"
            f"**Step 3: Validation & Output**\n"
            f"Check the results against expected constraints and output the final transformed state.\n\n"
            f"Following these logical steps ensures a robust implementation in any {subject_name} scenario."
        )
    elif style_type == 'diagram':
        return (
            f"**Visualizing {topic_name}**\n\n"
            f"While we can't draw a live diagram here, visualize the architecture of {topic_name} as follows:\n\n"
            f"```text\n"
            f"[ Input Data/State ]\n"
            f"        │\n"
            f"        ▼\n"
            f"┌──────────────────────┐\n"
            f"│  Core Process Block  │ ◄── (Rules & Configurations)\n"
            f"└──────────────────────┘\n"
            f"        │\n"
            f"        ▼\n"
            f"[ Optimized Output ]\n"
            f"```\n\n"
            f"This mental model of a pipeline is the easiest way to visualize how data flows through {topic_name}."
        )
    elif style_type == 'example':
        return (
            f"**Practical Example: Implementing {topic_name}**\n\n"
            f"Let's look at a concrete, practical scenario for {topic_name}.\n\n"
            f"**Scenario:** You are tasked with building a modern application in the context of {subject_name}.\n\n"
            f"**The Problem:** The system is inefficient and lacks structure.\n\n"
            f"**The Solution:** By applying {topic_name}, we can restructure the workflow.\n\n"
            f"• First, we identify the bottleneck.\n"
            f"• Second, we apply the {topic_name} methodology to streamline the process.\n"
            f"• Finally, we measure the performance gain.\n\n"
            f"This is how industry professionals utilize {topic_name} every day!"
        )

def run():
    print("Starting 6th Semester Data Science DB population...")
    for subject_name, topics in SUBJECTS.items():
        # Create Subject
        subject, created = Subject.objects.get_or_create(
            name=subject_name,
            defaults={'slug': slugify(subject_name), 'description': f'A comprehensive course on {subject_name}.'}
        )
        if created:
            print(f"Created Subject: {subject_name}")
        
        # Create Topics and Content
        for index, topic_name in enumerate(topics):
            topic, t_created = Topic.objects.get_or_create(
                subject=subject,
                title=topic_name,
                defaults={
                    'slug': slugify(topic_name),
                    'order': index + 1,
                    'description': f'Learn the fundamentals of {topic_name}.'
                }
            )
            
            # If topic was just created, add the 5 content versions
            if t_created:
                styles = ['theory', 'analogy', 'logic', 'diagram', 'example']
                for style in styles:
                    content_text = generate_content(topic_name, subject_name, style)
                    ContentVersion.objects.create(
                        topic=topic,
                        style_type=style,
                        title=f"{topic_name} — {style.capitalize()} View",
                        content=content_text
                    )
        print(f"  -> Added {len(topics)} topics with content for {subject_name}")

    print("\nDatabase population complete! Added 5 subjects, 100 topics, and 500 content versions.")

if __name__ == '__main__':
    run()
