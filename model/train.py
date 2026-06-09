import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

with open('data.pkl', 'rb') as f:
    dataset = pickle.load(f)

data = np.array(dataset['data'])
labels = np.array(dataset['labels'])

# Data Augmentation
augmented_data = []
augmented_labels = []

for i in range(len(data)):
    augmented_data.append(data[i])
    augmented_labels.append(labels[i])
    for _ in range(9):
        noise = np.random.normal(0, 0.01, data[i].shape)
        augmented_data.append(data[i] + noise)
        augmented_labels.append(labels[i])

augmented_data = np.array(augmented_data)
augmented_labels = np.array(augmented_labels)

print(f"عدد العينات بعد التضخيم: {len(augmented_data)}")

x_train, x_test, y_train, y_test = train_test_split(
    augmented_data, augmented_labels, test_size=0.2, random_state=42
)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(x_train, y_train)

y_pred = model.predict(x_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"دقة الموديل: {accuracy * 100:.2f}%")

with open('model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("✅ تم حفظ الموديل في model.pkl")