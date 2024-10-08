import pandas as pd
import json

# Load the dataset
csv_file = 'Dataset.csv'
df = pd.read_csv(csv_file)

# Filter the dataset for Australia and 2020
df_filtered = df[(df['country'] == 'Australia') & (df['year'] == 2020)]

# Load the typed JSON structure
sample_json = {
    "year": 2020,
    "country": "Australia",
    "total": 0,  # This will be calculated
    "children": [
        {
            "cause": "Certain infectious and parasitic diseases",
            "total": 0,
            "children": [
                {"cause": "Tuberculosis", "total": 0},
                {"cause": "HIV-AIDS", "total": 0},
                {"cause": "Certain infectious and parasitic diseases-Unspecified", "total": 0}
            ]
        },
        {
            "cause": "Neoplasm",
            "total": 0,
            "children": [
                {
                    "cause": "Malignant neoplasms",
                    "total": 0,
                    "children": [
                        {"cause": "Malignant neoplasms of trachea, bronchus, lung", "total": 0},
                        {"cause": "Malignant neoplasms of colon, rectum and anus", "total": 0},
                        {"cause": "Malignant neoplasms of stomach", "total": 0},
                        {"cause": "Malignant neoplasms of pancreas", "total": 0},
                        {"cause": "Malignant neoplasms of liver", "total": 0},
                        {"cause": "Hodgkin's disease", "total": 0},
                        {"cause": "Leukemia", "total": 0},
                        {"cause": "Malignant neoplasms of bladder", "total": 0},
                        {"cause": "Malignant melanoma of skin", "total": 0},
                        {"cause": "Malignant neoplasms-Unspecified", "total": 0}
                    ]
                },
                {"cause": "Neoplasms-Unspecified", "total": 0}
            ]
        },
        {"cause": "Diseases of the blood and blood-forming organs", "total": 0},
        {
            "cause": "Endocrine, nutritional and metabolic diseases",
            "total": 0,
            "children": [
                {"cause": "Diabetes mellitus", "total": 0},
                {"cause": "Endocrine, nutritional and metabolic diseases-Unspecified", "total": 0}
            ]
        },
        {
            "cause": "Mental and behavioural disorders",
            "total": 0,
            "children": [
                {"cause": "Dementia", "total": 0},
                {"cause": "Mental and behavioural disorders-Unspecified", "total": 0}
            ]
        },
        {
            "cause": "Diseases of the nervous system",
            "total": 0,
            "children": [
                {"cause": "Parkinson's disease", "total": 0},
                {"cause": "Alzheimer's disease", "total": 0},
                {"cause": "Diseases of the nervous system-Unspecified", "total": 0}
            ]
        },
        {
            "cause": "Diseases of the respiratory system",
            "total": 0,
            "children": [
                {"cause": "Influenza", "total": 0},
                {"cause": "Pneumonia", "total": 0},
                {"cause": "Chronic obstructive pulmonary diseases", "total": 0},
                {"cause": "Asthma", "total": 0},
                {"cause": "Diseases of the respiratory system-Unspecified", "total": 0}
            ]
        },
        {
            "cause": "Diseases of the circulatory system",
            "total": 0,
            "children": [
                {
                    "cause": "Ischaemic heart disease",
                    "total": 0,
                    "children": [
                        {"cause": "Acute myocardial infarction", "total": 0},
                        {"cause": "Ischaemic heart disease-Unspecified", "total": 0}
                    ]
                },
                {"cause": "Cerebrovascular diseases", "total": 0},
                {"cause": "Diseases of the circulatory system-Unspecified", "total": 0}
            ]
        },
        {
            "cause": "Diseases of the digestive system",
            "total": 0,
            "children": [
                {"cause": "Peptic ulcer", "total": 0},
                {"cause": "Chronic liver diseases and cirrhosis", "total": 0},
                {"cause": "Diseases of the digestive system-Unspecified", "total": 0}
            ]
        },
        {"cause": "Diseases of the skin and subcutaneous tissue", "total": 0},
        {"cause": "Diseases of the musculoskeletal system and connective tissue", "total": 0},
        {"cause": "Diseases of the genitourinary system", "total": 0},
        {"cause": "Certain conditions originating in the perinatal period", "total": 0},
        {"cause": "Congenital malformations, deformations and chromosomal abnormalities", "total": 0},
        {"cause": "Symptoms, signs, ill-defined causes", "total": 0},
        {
            "cause": "External causes of morbidity and mortality",
            "total": 0,
            "children": [
                {
                    "cause": "Accidents",
                    "total": 0,
                    "children": [
                        {"cause": "Transport accidents", "total": 0},
                        {"cause": "Accidental falls", "total": 0},
                        {"cause": "Accidental poisoning", "total": 0}
                    ]
                },
                {"cause": "Intentional self-harm", "total": 0},
                {"cause": "Assault", "total": 0},
                {"cause": "External causes of morbidity and mortality-Unspecified", "total": 0}
            ]
        },
        {"cause": "Codes for special purposes: COVID-19", "total": 0}
    ]
}

# Fill in the totals from the CSV data
# with a recursive function
def fill_totals(node, df):
    # Base case: if the node has no children
    if 'children' in node:
        # Recursively fill in the totals for the children
        for child in node['children']:
            fill_totals(child, df)
        # Calculate the total for the current node
        node['total'] = sum(child['total'] for child in node['children'])
    else:
        # If the node has no children, fill in the total from the CSV data
        cause = node['cause']
        # Find the total for the cause in the filtered dataset
        total = df[df['cause'] == cause]['total'].sum()
        # Fill in the total for the node
        node['total'] = total if not pd.isna(total) else 0

fill_totals(sample_json, df_filtered)

# Calculate the total for the root node
sample_json['total'] = sum(child['total'] for child in sample_json['children'])

# Output the JSON to a file
with open('output.json', 'w') as json_file:
    json.dump(sample_json, json_file, indent=4)