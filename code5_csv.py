import face_recognition
import cv2
import numpy as np
import os
import csv

# -------------------------------
# Step 1: Load all known people
# -------------------------------
known_encodings = []
known_names = []

known_faces_dir = "known_people"   # Folder with known faces
group_photos_dir = "group_photos"  # Folder with group photos
output_dir = "matched_faces"       # Where to save results
os.makedirs(output_dir, exist_ok=True)

for filename in os.listdir(known_faces_dir):
    if filename.lower().endswith((".jpg", ".png", ".jpeg")):
        path = os.path.join(known_faces_dir, filename)
        image = face_recognition.load_image_file(path)
        encodings = face_recognition.face_encodings(image)
        if len(encodings) > 0:
            known_encodings.append(encodings[0])
            known_names.append(os.path.splitext(filename)[0])

print(f"Loaded {len(known_encodings)} known people.")

# -------------------------------
# Step 2: Prepare CSV report
# -------------------------------
report_file = os.path.join(output_dir, "report.csv")
with open(report_file, mode="w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["Group Photo", "Person", "Saved Face Path"])  # Header

    # -------------------------------
    # Step 3: Process each group photo
    # -------------------------------
    for group_file in os.listdir(group_photos_dir):
        if not group_file.lower().endswith((".jpg", ".png", ".jpeg")):
            continue

        group_path = os.path.join(group_photos_dir, group_file)
        print(f"\nProcessing: {group_file}")

        group_image = face_recognition.load_image_file(group_path)
        group_locations = face_recognition.face_locations(group_image)
        group_encodings = face_recognition.face_encodings(group_image, group_locations)

        group_image_cv2 = cv2.cvtColor(group_image, cv2.COLOR_RGB2BGR)

        # Make output subfolder for this photo
        photo_name = os.path.splitext(group_file)[0]
        photo_output_dir = os.path.join(output_dir, photo_name)
        os.makedirs(photo_output_dir, exist_ok=True)

        for i, (top, right, bottom, left) in enumerate(group_locations):
            face_encoding = group_encodings[i]
            matches = face_recognition.compare_faces(known_encodings, face_encoding, tolerance=0.5)
            name = "Unknown"

            if True in matches:
                match_index = matches.index(True)
                name = known_names[match_index]

                # Crop the matched face
                face_crop = group_image_cv2[top:bottom, left:right]

                # Save cropped face
                save_path = os.path.join(photo_output_dir, f"{name}_{i}.jpg")
                cv2.imwrite(save_path, face_crop)
                print(f"  → Saved: {save_path}")

                # Write to CSV
                writer.writerow([group_file, name, save_path])

            # Draw bounding box and label on group photo
            cv2.rectangle(group_image_cv2, (left, top), (right, bottom), (0, 255, 0), 2)
            cv2.putText(group_image_cv2, name, (left, top - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        # Save the group photo with labels
        labeled_path = os.path.join(photo_output_dir, f"{photo_name}_labeled.jpg")
        cv2.imwrite(labeled_path, group_image_cv2)
        print(f"  → Labeled group photo saved: {labeled_path}")
