import face_recognition
import cv2
import numpy as np
import os

# -------------------------------
# Step 1: Load all known people
# -------------------------------
known_encodings = []
known_names = []

# Folder with known faces (each file is one person)
known_faces_dir = "known_people"   # put images in this folder
output_dir = "matched_faces"       # folder to save matched results
os.makedirs(output_dir, exist_ok=True)

for filename in os.listdir(known_faces_dir):
    if filename.endswith((".jpg", ".png", ".jpeg")):
        path = os.path.join(known_faces_dir, filename)
        image = face_recognition.load_image_file(path)
        encodings = face_recognition.face_encodings(image)
        if len(encodings) > 0:
            known_encodings.append(encodings[0])
            known_names.append(os.path.splitext(filename)[0])

print(f"Loaded {len(known_encodings)} known people.")

# -------------------------------
# Step 2: Load the group photo
# -------------------------------
group_image = face_recognition.load_image_file("group.jpg")
group_locations = face_recognition.face_locations(group_image)
group_encodings = face_recognition.face_encodings(group_image, group_locations)

group_image_cv2 = cv2.cvtColor(group_image, cv2.COLOR_RGB2BGR)

# -------------------------------
# Step 3: Compare each face in group with known faces
# -------------------------------
matched_faces = []

for i, (top, right, bottom, left) in enumerate(group_locations):
    face_encoding = group_encodings[i]
    matches = face_recognition.compare_faces(known_encodings, face_encoding, tolerance=0.5)
    name = "Unknown"

    if True in matches:
        match_index = matches.index(True)
        name = known_names[match_index]

        # Crop the matched face
        face_crop = group_image_cv2[top:bottom, left:right]
        matched_faces.append((name, face_crop))

        # Save the matched face
        save_path = os.path.join(output_dir, f"{name}_{i}.jpg")
        cv2.imwrite(save_path, face_crop)
        print(f"Saved: {save_path}")

    # Draw rectangle + name on the group photo
    cv2.rectangle(group_image_cv2, (left, top), (right, bottom), (0, 255, 0), 2)
    cv2.putText(group_image_cv2, name, (left, top - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

# -------------------------------
# Step 4: Show results
# -------------------------------
cv2.imshow("Group with Matches", group_image_cv2)

# Show all matched faces side by side
if matched_faces:
    resized_faces = []
    height = 150
    for name, face in matched_faces:
        face_resized = cv2.resize(face, (int(face.shape[1] * height / face.shape[0]), height))
        # Add label space
        face_with_label = cv2.copyMakeBorder(face_resized, 20, 0, 0, 0, cv2.BORDER_CONSTANT, value=[255,255,255])
        cv2.putText(face_with_label, name, (5,15), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,0,0), 1)
        resized_faces.append(face_with_label)

    combined = np.hstack(resized_faces)
    cv2.imshow("Matched Faces", combined)
else:
    print("No known faces found in the group photo!")

cv2.waitKey(0)
cv2.destroyAllWindows()
