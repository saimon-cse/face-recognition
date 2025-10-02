import face_recognition
import cv2
import numpy as np

# Load the known image and encode it
known_image = face_recognition.load_image_file("known.png")
known_encoding = face_recognition.face_encodings(known_image)[0]

# Convert known image for OpenCV display
known_face_cv2 = cv2.cvtColor(known_image, cv2.COLOR_RGB2BGR)

# Load the unknown (group) image
unknown_image = face_recognition.load_image_file("unknown.JPG")
unknown_locations = face_recognition.face_locations(unknown_image)
unknown_encodings = face_recognition.face_encodings(unknown_image, unknown_locations)

# Convert to OpenCV format
unknown_image_cv2 = cv2.cvtColor(unknown_image, cv2.COLOR_RGB2BGR)

matched_face = None

for (top, right, bottom, left), face_encoding in zip(unknown_locations, unknown_encodings):
    results = face_recognition.compare_faces([known_encoding], face_encoding, tolerance=0.5)

    if results[0]:
        # Crop the matched face
        matched_face = unknown_image_cv2[top:bottom, left:right]
        break  # Stop after first match

if matched_face is not None:
    # Resize both faces to the same height for side-by-side view
    height = 200
    known_resized = cv2.resize(known_face_cv2, (int(known_face_cv2.shape[1] * height / known_face_cv2.shape[0]), height))
    matched_resized = cv2.resize(matched_face, (int(matched_face.shape[1] * height / matched_face.shape[0]), height))

    # Concatenate side by side
    combined = np.hstack((known_resized, matched_resized))

    cv2.imshow("Known vs Matched Face", combined)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
else:
    print("No match found!")
