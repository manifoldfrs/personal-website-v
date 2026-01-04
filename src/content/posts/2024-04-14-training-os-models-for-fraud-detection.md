---
layout: post
title: "Training Open Source Models for PII Detection"
date: 2024-04-14 15:23:07 -0800
categories:
  - Posts
  - Dev
---

## Overview

A couple months ago I gave a talk at [AICamp](https://www.aicamp.ai/) about training open source models for PII (Personally Identifiable Information) in NER (Named Entity Recognition). This doc explores the process of training such a model using synthetic data, focusing on specific technical decisions and optimizations made during the project. The intent here is purely educational.

### Model Selection and NER

[BERT (Bidirectional Encoder Representations from Transformers)](https://huggingface.co/google-bert/bert-base-uncased) is a transformer-based machine learning technique for natural language processing pre-training. For PII detection, BERT's deep understanding of context makes it an excellent choice, though alternatives like [RoBERTa](https://huggingface.co/docs/transformers/en/model_doc/roberta) or [DistilBERT](https://huggingface.co/distilbert/distilbert-base-uncased) may offer faster training times or reduced model sizes with comparable performance.

[NER](https://en.wikipedia.org/wiki/Named-entity_recognition) involves identifying textual segments that represent entities like names, dates, and identifiers and classifying them into predefined categories. For PII detection, models are trained in token classification to recognize sensitive data like names, phone numbers, and social security numbers, which are crucial for complying with data protection regulations.

### Synthetic Data Generation

Generating synthetic data involves creating realistic data that can be used for training, again the intent is purely educational here. For a production ready implementation I recommend a diverse set of real datasets.

```python
from faker import Faker
fake = Faker()

def generate_synthetic_data(num_samples):
    data = []
    for _ in range(num_samples):
        person = fake.name()
        ssn = fake.ssn()
        phone_number = fake.phone_number()
        # Create a structured object
        data.append({
            "text": f"My name is {person} and my SSN is {ssn}. Call me on {phone_number}.",
            "labels": [
                {"type": "PERSON", "start": 11, "end": 11+len(person)},
                {"type": "SSN", "start": 26+len(person), "end": 26+len(person)+len(ssn)},
                {"type": "PHONE_NUMBER", "start": 42+len(person)+len(ssn), "end": 42+len(person)+len(ssn)+len(phone_number)}
            ]
        })
    return data

synthetic_data = generate_synthetic_data(1000)
```

In this script, `Faker` is used to generate fake names, SSNs, and phone numbers, which are then structured into sentences mimicking natural language where such information might appear. Each entity is annotated with its start and end positions in the text, which is crucial for training NER models.

### Labeling and Tokenization

Proper labeling is crucial in NER because it directly affects the model’s ability to learn the correct associations between text features and entity labels. Incorrect labels can lead to poor model performance and misclassification of entities in deployment. Tokenization involves converting raw text into a format that is suitable for model training, typically by splitting the text into words or subwords. Label alignment is adjusting entity labels to match the tokenized output.

```python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')

def tokenize_and_align_labels(example):
    tokenized_inputs = tokenizer(example["text"], truncation=True, is_split_into_words=False)
    labels = ["O"] * len(tokenized_inputs['input_ids'])  # Initialize labels as 'O' (Outside)

    for entity in example['labels']:
        entity_type = entity['type']
        start_index = tokenized_inputs.char_to_token(entity['start'])
        end_index = tokenized_inputs.char_to_token(entity['end'] - 1)

        if start_index is not None and end_index is not None:
            labels[start_index] = f"B-{entity_type}"  # Begin entity
            for i in range(start_index + 1, end_index + 1):
                labels[i] = f"I-{entity_type}"  # Inside entity

    tokenized_inputs['labels'] = labels
    return tokenized_inputs

# Apply tokenization and label alignment
tokenized_data = [tokenize_and_align_labels(example) for example in synthetic_data]
```

In this code, we first tokenize the text using a BERT tokenizer, which breaks down the text into tokens that BERT can process. We then align our labels to these tokens, marking the start of each entity with a "B-" prefix and continuing with an "I-" prefix until the end of the entity. This alignment is essential for the model to learn from our labeled data effectively.

### Data Augmentation

```python
import nlpaug.augmenter.word as naw

augmenter = naw.SynonymAug(aug_src='wordnet')
def augment_data(data):
    return [augmenter.augment(item) for item in data]

augmented_texts = augment_data(training_texts)
```

Using `nlpaug`'s Synonym Augmenter introduces lexical diversity by replacing words with their synonyms, thereby helping the model generalize better to different ways the same information might be phrased.

### Model Configuration and Training

```python
from transformers import BertForTokenClassification, Trainer, TrainingArguments

model = BertForTokenClassification.from_pretrained('bert-base-uncased', num_labels=len(label_list))

training_args = TrainingArguments(
    output_dir='./models/',
    num_train_epochs=3,
    per_device_train_batch_size=16,
    learning_rate=2e-5,
    weight_decay=0.01
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=valid_dataset
)

trainer.train()
```

**Key Parameters Explained**:

- **num_train_epochs**: Set to 3 to balance between underfitting and overfitting. More epochs were found to lead to diminishing returns on validation accuracy.
- **per_device_train_batch_size**: Chosen as 16 based on GPU memory limitations and the trade-off between training speed and model stability.
- **learning_rate**: The learning rate of 2e-5 is typical for fine-tuning BERT models, providing a good compromise between training speed and convergence stability.
- **weight_decay**: Applied to prevent overfitting by penalizing large weights during optimization.

### GPU Utilization on RunPod

I decided to use a dedicated GPU cloud service like RunPod to run the training. RunPod makes it easy to spin up dedicated GPUs and CPUs for the purpose of model development. You can review their documentation [here](https://docs.runpod.io/).

### Inference testing

Depending on the length of your dataset the training time varies. I typically spin up 2 A6000s, and with a dataset of about 500K records it takes about 10-12 hours. But once you're done you can use a python script to evaluate your results:

```python
import json
import os

import numpy as np
from transformers import (
    AutoModelForTokenClassification,
    AutoTokenizer,
    TokenClassificationPipeline,
)

LOCAL_MODEL_PATH = os.getenv("LOCAL_MODEL_PATH")


class CustomEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.float32):
            return float(obj)
        return json.JSONEncoder.default(self, obj)


# Tokenizer
tokenizer = AutoTokenizer.from_pretrained(LOCAL_MODEL_PATH, local_files_only=False)

# Model Instantiation
model = AutoModelForTokenClassification.from_pretrained(
    LOCAL_MODEL_PATH, local_files_only=True
)

# Pipeline Instantiation
classifier = TokenClassificationPipeline(model=model, tokenizer=tokenizer)

# Assuming you have a way to input text in your Python environment, e.g., input() function
text = input("Please enter your text: ")
print(f"Input Text: {text}")


# Pipeline Execution
results = classifier(text)

print(results)
with open("results.json", "w") as f:
    json.dump(results, f, cls=CustomEncoder)

```

### Future Directions

Future improvements include exploring character-level augmentations to simulate typographical errors commonly seen in manually entered data and experimenting with adaptive learning rates to optimize convergence during training. In later iterations I've also implimented QAT (Quantization Aware Training) to allow the model to run faster during inference.
