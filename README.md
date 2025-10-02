
# Face Recognition Project

This project identifies a known face within an unknown image using Python.

**Repository:** [https://github.com/saimon-cse/face-recognition.git](https://github.com/saimon-cse/face-recognition.git)

## Getting Started
-----------------

Follow these simple steps to get the project running:

### 1. Install Prerequisites
--------------------------
*   **Install Git:** Download and install Git from [git-scm.com](https://git-scm.com/downloads).
*   **Install Python 3.8.10:** Download and install Python 3.8.10 from the [official Python website](https://www.python.org/downloads/release/python-3810/). Ensure Python is added to your system PATH during installation.

### 2. Clone the Project
----------------------
Open your terminal or command prompt and run the following command to download the project:
```bash
git clone https://github.com/saimon-cse/face-recognition.git
```

### 3. Install Dependencies
-------------------------
Navigate into the project directory and install the required Python libraries using pip:
```bash
cd face-recognition
pip install cmake
pip install dlib==19.24.9
pip install opencv-contrib-python
pip install face_recognition
```
*Note: The `face_recognition` library is crucial for this project.*

### 4. Prepare Images
-------------------
Place the following image files in the root directory of the project (`face-recognition/`):
*   `known.png` (The image of the face you want to recognize)
*   `unknown.JPG` (The image containing the face to be searched for)

### 5. Run the Project
--------------------
Execute the main Python script from your terminal:
```bash
python test.py
```

The script will process the images. If a match is found, a window will display the known face next to the detected face. If no match is found, it will print "No match found!" in the terminal.
```

**Key changes in this version:**

*   **Focus on User Steps:** Directly follows the sequence: Install Git/Python -> Clone -> Run.
*   **Concise Language:** Removes extra sections like structure, detailed how-it-works, contribution, etc.
*   **Clear Commands:** Provides the exact commands needed for each step.
*   **Dependency Installation:** Includes the library installation step as it's essential *after* cloning but *before* running.
*   **Image Requirement:** Mentions the need for `known.png` and `unknown.JPG`.

