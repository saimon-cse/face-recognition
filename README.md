

# Face Recognition Project  
🔍 *Find a known face in a group photo*

**GitHub Repo:** [https://github.com/saimon-cse/face-recognition.git](https://github.com/saimon-cse/face-recognition.git)

---

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
Run these commands **one by one**:
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

### 🖼️ What Happens Next?

- If a match is found:  
  A window will pop up showing **your known face (left)** and **the matched face (right)**.  
  Press any key to close the window.

- If **no match**:  
  You'll see this in CMD:  
  ```
  No match found!
  ```

> ✅ Make sure:
> - `known.png` = clear photo of one person
> - `unknown.JPG` = group photo (with that person in it)
> - Both files are in the same folder as `test.py`

---

### 🔄 Want to Update Later?
If you want to get the latest version of the code (after updates), just run:
```bash
git pull origin main
```
Then run `python test.py` again.

---

### ❓ Having Issues?

| Problem | Solution |
|-------|---------|
| `'pip' is not recognized` | Reinstall Python and **check "Add to PATH"** |
| `dlib` install fails | Try running CMD as **Administrator** |
| No window appears / no match | Check if `known.png` and `unknown.JPG` are correct and visible |
| `ModuleNotFoundError` | Make sure you ran all `pip install` commands |

---

### 💬 Need Help?
Open an issue here:  
👉 [https://github.com/saimon-cse/face-recognition/issues](https://github.com/saimon-cse/face-recognition/issues)

---

📌 **That’s it! Just 4 steps. No IDE needed. Just CMD, Git, and Python.**  
Happy recognizing! 😊

---

> ✅ **Tip:** You can replace `known.png` and `unknown.JPG` with your own photos anytime.  
> Just keep the filenames the same, or edit them in `test.py`.

---

🔁 **Keep Updated:**  
This project is maintained on GitHub. Always do `git pull` before running to get the latest version.

```bash
git pull origin main
python test.py
```

---

✅ **You're all set!**  
No PyCharm required. No extra tools. Just follow the steps and run it.

---

### 📂 Project Files (What's in the folder?)
After cloning, you’ll see:
```
face-recognition/
├── known.png         ← Put your known face here
├── unknown.JPG       ← Put your group photo here
├── test.py           ← The main code (don't change unless needed)
└── README.md         ← This file
```

> 🔐 All code and images are in the repo. Nothing else to download.

---

🚀 **Now go run it!**
```bash
python test.py
```

Let the face hunt begin! 🎯

--- 

> Maintained by: [saimon-cse](https://github.com/saimon-cse)  
> Repo: [https://github.com/saimon-cse/face-recognition](https://github.com/saimon-cse/face-recognition)

---

### ✅ Summary (Quick Run)
```bash
# Step 1: Install Git + Python 3.8.10 (with PATH)

# Step 2: Open CMD
git clone https://github.com/saimon-cse/face-recognition.git
cd face-recognition

# Step 3: Install dependencies
pip install cmake dlib==19.24.9 opencv-contrib-python face_recognition

# Step 4: Run it!
python test.py
```

🎉 Done! You're running face recognition in under 5 minutes.

---

This version is:
- **Extremely simple**
- **No IDE required**
- **No technical jargon**
- **Just copy-paste commands**
- **Perfect for non-coders or beginners**

Just copy this into your `README.md` on GitHub — and anyone can run it in minutes. ✅