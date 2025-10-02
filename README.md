# Face-Recognition Demo 🚀
A tiny, no-frills demo that shows how to detect a face in a group photo and check whether it matches a known person – then display the two faces side-by-side.

<p align="center">
  <img src="docs/demo.gif" width="700"/>
</p>

> ✨ Maintained & auto-updated – just clone the repo whenever you need the latest code.

---

## Table of Contents
1. Features  
2. Demo Preview  
3. Prerequisites  
4. Quick Start  
5. Detailed Setup (Windows)  
6. Run the Demo  
7. Project Structure  
8. Troubleshooting / FAQ  
9. Contributing & License  

---

## 1. Features
- One-file demo (`test.py`) built on top of the excellent [`face_recognition`](https://github.com/ageitgey/face_recognition) library.  
- Works offline – no cloud API needed.  
- Shows how to:  
  * load & encode a known face  
  * locate faces in a group photo  
  * compare encodings with a configurable tolerance  
  * crop & display the matched face next to the reference face  

---

## 2. Demo Preview
<img src="docs/side_by_side.png" width="600"/>

---

## 3. Prerequisites
| Tool | Tested Version | Notes |
|------|----------------|-------|
| Python | **3.8.10** | Other 3.8.x/3.9.x might work, but 3.8.10 is fool-proof. |
| pip | 21+ | Comes with Python installer. |
| CMake | 3.25+ | Required by `dlib`. |
| A C/C++ compiler | MSVC (Windows) / Xcode (macOS) / GCC (Linux) | Only for first install while `dlib` builds wheels. |
| (optional) PyCharm | 2023.x | Any IDE/Editor works – VS Code, Sublime, ... |

> macOS & Linux users usually already have a compiler tool-chain; on Windows you may need “Build Tools for Visual Studio”.

---

## 4. Quick Start (TL;DR)
```bash
# 0.  Clone the repository
git clone https://github.com/saimon-cse/face-recognition.git
cd face-recognition

# 1.  Create & activate a virtual environment (recommended)
python -m venv venv
# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 2.  Install the required Python packages
pip install -r requirements.txt   # preferred
# …or manually:
pip install cmake dlib==19.24.9 opencv-contrib-python face_recognition numpy

# 3.  Put your images in the project root
#     - known.png  : the reference face
#     - unknown.JPG: a group photo that MAY contain the person

# 4.  Run the demo
python test.py
```

If a match is found, a window pops up showing “Known vs Matched Face”.  
No match? You’ll get `No match found!` on the console.

---

## 5. Detailed Setup (WINDOWS Step-by-Step)
1. Install **PyCharm** (optional, but nice)  
   https://www.jetbrains.com/pycharm/download/?section=windows  

2. Install **Python 3.8.10** (x64)  
   • Download: https://www.python.org/ftp/python/3.8.10/python-3.8.10-amd64.exe  
   • Tick “Add Python to PATH” during setup!  

3. Install **CMake** ⟶ https://cmake.org/download/  
   (Add it to PATH when the installer asks.)  

4. Install **Build Tools for Visual Studio 17**  
   • Check “Desktop C++” workload.  
   • Mandatory for compiling `dlib` the first time.  

5. Open **PowerShell / CMD** and follow the Quick Start above.  

---

## 6. Run the Demo – What Happens?
1. `known.png` is loaded → encoding extracted.  
2. `unknown.JPG` is scanned → all faces encoded.  
3. We loop through every detected face:  
   • `face_recognition.compare_faces` with `tolerance=0.5`  
4. First positive match is cropped → displayed next to the known face.  
5. Press any key to close the OpenCV window.

Want stricter or looser matching? Play with the `tolerance` value (0 = identical twins, 1 = everyone).

---

## 7. Project Structure
```
face-recognition/
│
├─ test.py                 # ← the only script you really need
├─ requirements.txt        # exact Python deps
├─ known.png               # sample reference face (add your own)
├─ unknown.JPG             # sample group picture  (add your own)
│
├─ docs/                   # demo GIFs & images for README
└─ README.md               # this file
```

---

## 8. Troubleshooting / FAQ
| Problem | Fix |
|---------|-----|
| `cmake ... fatal error` while installing dlib | Make sure CMake is on PATH and a C++ compiler is installed. |
| Black screen / window instantly closes | Don’t run inside WSL without X-server; run on native Windows or Linux GUI. |
| Multiple faces detected but wrong one matched | Lower `tolerance` (e.g., 0.45) or pick a clearer `known.png`. |
| Need GPU acceleration | This demo is CPU-only; for CUDA & cuDNN build your own dlib/face_recognition wheels. |

---

## 9. Contributing & License
Pull requests & issues are welcome – let’s keep it simple and educational.  
Code licensed under the MIT License (see `LICENSE`).

Happy coding – and happy face-matching! 😄


