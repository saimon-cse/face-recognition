
# Face Recognition Project
==========================

A simple face recognition project using `face_recognition`, `OpenCV`, and `dlib` libraries. This project identifies a known face in an unknown group image and displays the matched face side-by-side with the known face.

**Project Repository:** [https://github.com/saimon-cse/face-recognition.git](https://github.com/saimon-cse/face-recognition.git)

**Table of Contents**
-----------------

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Project Structure](#project-structure)
4. [How it Works](#how-it-works)
5. [Running the Project](#running-the-project)
6. [Example Use Case](#example-use-case)
7. [Troubleshooting](#troubleshooting)
8. [Contribution](#contribution)
9. [License](#license)

**Prerequisites**
---------------

* Windows, macOS, or Linux operating system
* Basic knowledge of Python and pip package manager

**Installation**
------------

Follow these steps to set up the project environment:

### 1. Install PyCharm (Optional but Recommended)
---------------------------------------------

Download and install PyCharm Community Edition from the official website:
https://www.jetbrains.com/pycharm/download/?section=windows

PyCharm provides a great development environment, but you can use any IDE or text editor of your choice.

### 2. Install Python 3.8.10
-------------------------

Download and install Python 3.8.10 from the official Python website:
https://www.python.org/downloads/release/python-3810/

**Direct Download Link:** https://www.python.org/ftp/python/3.8.10/python-3.8.10-amd64.exe (for Windows 64-bit)

Make sure to add Python to your system's PATH environment variable during installation.

### 3. Install Required Libraries
------------------------------

Open a terminal or command prompt and run the following commands:
```bash
pip install cmake
pip install dlib==19.24.9
pip install opencv-contrib-python
pip install face_recognition
```
**Note:** `face_recognition` library is not installed in your provided step 3. I've added it here as it's essential for the project.

**Alternative:** If you prefer to install all dependencies at once, create a `requirements.txt` file in your project root with the following content:
```makefile
cmake
dlib==19.24.9
opencv-contrib-python
face_recognition
```
Then, run:
```bash
pip install -r requirements.txt
```
**4. Clone the Project Repository**
--------------------------------

Using Git, clone this repository to your local machine:
```bash
git clone https://github.com/saimon-cse/face-recognition.git
```
**Project Structure**
------------------

Here's an overview of the project structure:
```markdown
face-recognition/
├── known.png         # Known face image
├── unknown.JPG       # Unknown group image
├── test.py           # Main Python script
├── README.md         # This file
└── requirements.txt  # (Optional) Dependency file
```
**How it Works**
--------------

1. The `test.py` script loads a **known face image** (`known.png`) and encodes it using `face_recognition`.
2. It then loads an **unknown group image** (`unknown.JPG`) and detects all faces in it.
3. For each detected face, it checks if the face matches the known face encoding (with a tolerance of 0.5).
4. If a match is found, it crops the matched face and resizes both the known and matched faces to the same height.
5. Finally, it displays the known and matched faces side-by-side using `OpenCV`.

**Running the Project**
---------------------

1. Navigate to the project directory:
```bash
cd face-recognition
```
2. Ensure you have the `known.png` and `unknown.JPG` images in the project root. You can replace these with your own images.
3. Run the `test.py` script:
```bash
python test.py
```
4. If a match is found, a window will pop up displaying the known face alongside the matched face. Press any key to close the window.
5. If no match is found, you'll see the message "No match found!" in the terminal.

**Example Use Case**
-----------------

* **Known Face (`known.png`)**: A clear photo of a person's face (e.g., a passport photo).
* **Unknown Group Image (`unknown.JPG`)**: A photo containing multiple people, including the person from the known face image (e.g., a group selfie or a classroom photo).

**Troubleshooting**
----------------

* **dlib Installation Issues:** If `dlib` fails to install, ensure `cmake` is installed correctly. Refer to [dlib's official installation guide](http://dlib.net/compile.html) for platform-specific solutions.
* **Face Not Detected:** Make sure the images (`known.png` and `unknown.JPG`) are clear and well-lit. Adjust the `tolerance` value in `test.py` if needed (lower values = stricter matching).
* **ModuleNotFoundError:** Double-check that all dependencies are installed and you're using Python 3.8.10.

**Contribution**
------------

Feel free to fork this repository, submit issues, or send pull requests. Contributions are welcome!

**License**
-------

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

**Stay Updated**
--------------

This README is maintained in the [GitHub repository](https://github.com/saimon-cse/face-recognition.git). Pull the latest changes using:
```bash
git pull origin main
```
Happy Coding! 😊
```
Here's what I've added/changed:

1. **Detailed Installation Steps**: Broke down the installation process into clear steps.
2. **Project Structure**: Explained the folder structure for clarity.
3. **How it Works**: Simplified explanation of the logic behind `test.py`.
4. **Running the Project**: Step-by-step guide to executing the script.
5. **Example Use Case**: Practical scenario for better understanding.
6. **Troubleshooting**: Common issues and fixes.
7. **Contribution & License**: Standard sections for open-source projects.
8. **Stay Updated**: Reminder to pull changes from the repo.

**Next Steps:**

1. Add a `LICENSE` file (e.g., MIT License) to your GitHub repo.
2. Commit this `README.md` file to your repository:
   ```bash
git add README.md
git commit -m "Added complete README file"
git push origin main
```
3. Ensure `known.png` and `unknown.JPG` are in the repo root (or update paths in `test.py`).

Now, anyone cloning your repo will have a clear guide to run the project! 👍