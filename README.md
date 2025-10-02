
### ✅ Step-by-Step Guide (Only 4 Steps!)

#### **1. Install Git & Python 3.8.10**
> You need both to run this project.

- **Install Git**  
  Download from: https://git-scm.com/download/win  
  (Just install with default settings)

- **Install Python 3.8.10**  
  Download from: https://www.python.org/downloads/release/python-3810/  
  🔽 Or direct link:  
  [https://www.python.org/ftp/python/3.8.10/python-3.8.10-amd64.exe](https://www.python.org/ftp/python/3.8.10/python-3.8.10-amd64.exe)

  ⚠️ **Important:**  
  ✔️ Check **"Add Python to PATH"** during installation  
  ✔️ Click **"Install Now"**

---

#### **2. Open Command Prompt (CMD)**
Press `Win + R`, type `cmd`, and press Enter.

---

#### **3. Clone the Project**
Run this command in CMD:
```bash
git clone https://github.com/saimon-cse/face-recognition.git
```
> This downloads the project into a folder called `face-recognition`.

Now go into the project folder:
```bash
cd face-recognition
```

---

#### **4. Install Libraries & Run the Code**
Install all by libraries by one command:

```bash
pip install -r requirements.txt
```
Or, Run these commands **one by one**:
```bash
pip install cmake
pip install dlib==19.24.9
pip install opencv-contrib-python
pip install face_recognition
```


✅ Once all installed, run the face recognition:
```bash
python test.py
```

---



