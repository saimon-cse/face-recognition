const MODEL_URL = '/models';
const API_BASE = '/api';

const DETECTOR_OPTIONS = new faceapi.TinyFaceDetectorOptions({
  inputSize: 416,
  scoreThreshold: 0.5
});

const state = {
  modelsLoaded: false,
  cameraReady: false,
  sessionActive: false,
  matcher: null,
  sessionRecognized: new Set(),
  sessionLabelMap: new Map(),
  loopHandle: null,
  courses: [],
  currentCourseId: null,
  students: [],
  attendance: []
};

const elements = {};

document.addEventListener('DOMContentLoaded', () => {
  cacheDom();
  registerHandlers();
  initializeApp().catch(error => {
    console.error(error);
    elements.modelStatus.textContent = 'Failed to initialise application.';
  });
});

async function initializeApp() {
  await loadCourses();
  await Promise.all([setupCamera(), loadModels()]);
}

function cacheDom() {
  elements.video = document.getElementById('video');
  elements.overlay = document.getElementById('overlay');
  elements.modelStatus = document.getElementById('model-status');
  elements.cameraStatus = document.getElementById('camera-status');
  elements.courseForm = document.getElementById('course-form');
  elements.newCourseName = document.getElementById('new-course-name');
  elements.courseSelect = document.getElementById('course-select');
  elements.studentForm = document.getElementById('student-form');
  elements.studentName = document.getElementById('student-name');
  elements.studentList = document.getElementById('student-list');
  elements.startAttendance = document.getElementById('start-attendance');
  elements.stopAttendance = document.getElementById('stop-attendance');
  elements.recognitionLog = document.getElementById('recognition-log');
  elements.attendanceTableBody = document.getElementById('attendance-table-body');
}

function registerHandlers() {
  elements.courseForm.addEventListener('submit', event => {
    event.preventDefault();
    handleAddCourse().catch(console.error);
  });

  elements.courseSelect.addEventListener('change', () => {
    const courseId = elements.courseSelect.value;
    if (state.sessionActive) {
      stopAttendanceSession();
    }
    selectCourse(courseId).catch(console.error);
  });

  elements.studentForm.addEventListener('submit', event => {
    event.preventDefault();
    handleEnrollStudent().catch(console.error);
  });

  elements.startAttendance.addEventListener('click', () => {
    startAttendanceSession().catch(console.error);
  });

  elements.stopAttendance.addEventListener('click', () => {
    stopAttendanceSession();
  });

  window.addEventListener('beforeunload', () => {
    stopAttendanceSession();
  });
}

async function loadCourses() {
  try {
    const response = await fetch(`${API_BASE}/courses`);
    if (!response.ok) {
      throw new Error('Failed to load courses.');
    }
    state.courses = await response.json();
    refreshCourseSelect();
  } catch (error) {
    console.error(error);
    alert('Could not load courses from the server.');
  }
}

async function selectCourse(courseIdValue) {
  const courseId = courseIdValue ? Number(courseIdValue) : null;
  state.currentCourseId = courseId;
  state.students = [];
  state.attendance = [];
  refreshStudentsList();
  renderAttendanceTable();

  if (!courseId) {
    return;
  }

  await Promise.all([loadStudents(courseId), loadAttendance(courseId)]);
}

async function loadStudents(courseId) {
  try {
    const response = await fetch(`${API_BASE}/courses/${courseId}/students`);
    if (!response.ok) {
      throw new Error('Failed to load students.');
    }
    state.students = await response.json();
    refreshStudentsList();
  } catch (error) {
    console.error(error);
    elements.studentList.innerHTML = '<li>Unable to load students.</li>';
  }
}

async function loadAttendance(courseId) {
  try {
    const response = await fetch(`${API_BASE}/courses/${courseId}/attendance`);
    if (!response.ok) {
      throw new Error('Failed to load attendance.');
    }
    state.attendance = await response.json();
    renderAttendanceTable();
  } catch (error) {
    console.error(error);
    elements.attendanceTableBody.innerHTML = '<tr><td colspan="3">Unable to load attendance log.</td></tr>';
  }
}

async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    elements.cameraStatus.textContent = 'Camera API unavailable in this browser.';
    throw new Error('getUserMedia not supported');
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    elements.video.srcObject = stream;
    await new Promise(resolve => {
      elements.video.onloadedmetadata = () => resolve();
    });
    elements.cameraStatus.textContent = 'Camera ready';
    state.cameraReady = true;
  } catch (error) {
    console.error(error);
    elements.cameraStatus.textContent = 'Unable to access camera. Check permissions.';
  }
}

async function loadModels() {
  try {
    elements.modelStatus.textContent = 'Loading face recognition models...';
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    state.modelsLoaded = true;
    elements.modelStatus.textContent = 'Models loaded. You can start enrolling students.';
  } catch (error) {
    console.error(error);
    elements.modelStatus.textContent = 'Failed to load models. Verify /models files exist and reload.';
  }
}

async function handleAddCourse() {
  const name = elements.newCourseName.value.trim();
  if (!name) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create course.');
    }

    const payload = await response.json();
    await loadCourses();
    elements.newCourseName.value = '';
    elements.courseSelect.value = String(payload.course.id);
    await selectCourse(payload.course.id);
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

async function handleEnrollStudent() {
  if (!state.modelsLoaded) {
    alert('Models are still loading.');
    return;
  }
  if (!state.cameraReady) {
    alert('Camera is not ready.');
    return;
  }

  const courseId = state.currentCourseId;
  if (!courseId) {
    alert('Select a course first.');
    return;
  }

  const studentName = elements.studentName.value.trim();
  if (!studentName) {
    alert('Enter a student name.');
    return;
  }

  const detection = await captureSingleFace();
  if (!detection) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/courses/${courseId}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: studentName,
        descriptor: Array.from(detection.descriptor)
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to save student.');
    }

    elements.studentName.value = '';
    await loadStudents(courseId);
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

async function captureSingleFace() {
  elements.modelStatus.textContent = 'Capturing face... keep still.';
  const detections = await faceapi.detectAllFaces(elements.video, DETECTOR_OPTIONS)
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (!detections.length) {
    alert('No face detected. Ensure your face is well lit and retry.');
    elements.modelStatus.textContent = 'Models loaded. You can start enrolling students.';
    return null;
  }

  if (detections.length > 1) {
    alert('Multiple faces detected. Capture one student at a time.');
    elements.modelStatus.textContent = 'Models loaded. You can start enrolling students.';
    return null;
  }

  elements.modelStatus.textContent = 'Models loaded. Sample captured successfully.';
  return detections[0];
}

function refreshCourseSelect() {
  const options = ['<option value="">-- Create a course or choose one --</option>'];
  state.courses.forEach(course => {
    options.push(`<option value="${course.id}">${course.name}</option>`);
  });
  elements.courseSelect.innerHTML = options.join('');

  if (state.currentCourseId) {
    elements.courseSelect.value = String(state.currentCourseId);
  }
}

function refreshStudentsList() {
  if (!state.currentCourseId) {
    elements.studentList.innerHTML = '<li>Select a course to view students.</li>';
    return;
  }

  if (!state.students.length) {
    elements.studentList.innerHTML = '<li>No students enrolled yet.</li>';
    return;
  }

  const items = state.students.map(student => {
    const samples = student.descriptors ? student.descriptors.length : 0;
    return `<li>${student.name} - ${samples} sample(s)</li>`;
  });
  elements.studentList.innerHTML = items.join('');
}

async function startAttendanceSession() {
  if (!state.modelsLoaded || !state.cameraReady) {
    alert('Models or camera are not ready yet.');
    return;
  }
  if (state.sessionActive) {
    return;
  }

  const courseId = state.currentCourseId;
  if (!courseId) {
    alert('Select a course to start attendance.');
    return;
  }

  if (!state.students.length) {
    await loadStudents(courseId);
  }

  const studentsWithSamples = state.students.filter(student => student.descriptors && student.descriptors.length);
  if (!studentsWithSamples.length) {
    alert('Enroll at least one student with a face sample before starting attendance.');
    return;
  }

  const labeledDescriptors = studentsWithSamples.map(student => new faceapi.LabeledFaceDescriptors(
    String(student.id),
    student.descriptors.map(values => new Float32Array(values))
  ));

  state.matcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
  state.sessionActive = true;
  state.sessionRecognized.clear();
  state.sessionLabelMap = new Map(studentsWithSamples.map(student => [String(student.id), student.name]));
  elements.startAttendance.disabled = true;
  elements.stopAttendance.disabled = false;
  elements.recognitionLog.innerHTML = '';
  elements.modelStatus.textContent = `Attendance in progress for course #${courseId}.`;

  await runAttendanceLoop(courseId);
}

async function runAttendanceLoop(courseId) {
  if (!state.sessionActive) {
    return;
  }

  const { videoWidth, videoHeight } = elements.video;
  elements.overlay.width = videoWidth;
  elements.overlay.height = videoHeight;
  const displaySize = { width: videoWidth, height: videoHeight };

  const ctx = elements.overlay.getContext('2d');
  ctx.clearRect(0, 0, displaySize.width, displaySize.height);

  const detections = await faceapi
    .detectAllFaces(elements.video, DETECTOR_OPTIONS)
    .withFaceLandmarks()
    .withFaceDescriptors();
  const resized = faceapi.resizeResults(detections, displaySize);

  resized.forEach((res, index) => {
    const match = state.matcher.findBestMatch(detections[index].descriptor);
    const box = res.detection.box;
    const label = match.label === 'unknown'
      ? 'Unknown'
      : state.sessionLabelMap.get(match.label) || 'Unknown';
    drawBox(ctx, box, label, match.label === 'unknown');

    if (match.label !== 'unknown') {
      handleAttendanceHit(courseId, match.label).catch(console.error);
    }
  });

  state.loopHandle = requestAnimationFrame(() => {
    runAttendanceLoop(courseId).catch(console.error);
  });
}

function drawBox(ctx, box, label, isUnknown) {
  ctx.lineWidth = 3;
  ctx.strokeStyle = isUnknown ? '#ff5f5f' : '#2fb452';
  ctx.fillStyle = isUnknown ? 'rgba(255, 95, 95, 0.2)' : 'rgba(47, 180, 82, 0.25)';
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.width, box.height);
  ctx.stroke();
  ctx.fill();

  ctx.font = '16px "Segoe UI", sans-serif';
  const padding = 6;
  const textWidth = ctx.measureText(label).width;
  const boxHeight = 24;
  let textY = box.y - boxHeight;
  if (textY < 0) {
    textY = box.y + box.height + 4;
  }

  ctx.fillStyle = isUnknown ? '#ff5f5f' : '#2b74ff';
  ctx.fillRect(box.x, textY, textWidth + padding * 2, boxHeight);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(label, box.x + padding, textY + boxHeight - 8);
}

async function handleAttendanceHit(courseId, studentLabel) {
  if (state.sessionRecognized.has(studentLabel)) {
    return;
  }

  state.sessionRecognized.add(studentLabel);
  const studentName = state.sessionLabelMap.get(studentLabel) || 'Unknown';
  appendRecognitionLog(studentName);

  try {
    const response = await fetch(`${API_BASE}/courses/${courseId}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: Number(studentLabel),
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to log attendance.');
    }
  } catch (error) {
    console.error(error);
  }
}

function appendRecognitionLog(name) {
  const item = document.createElement('li');
  item.textContent = `${name} - ${new Date().toLocaleTimeString()}`;
  elements.recognitionLog.prepend(item);
}

function stopAttendanceSession() {
  if (!state.sessionActive) {
    return;
  }

  state.sessionActive = false;
  elements.startAttendance.disabled = false;
  elements.stopAttendance.disabled = true;
  elements.modelStatus.textContent = 'Attendance session stopped.';
  state.sessionLabelMap = new Map();
  if (state.loopHandle) {
    cancelAnimationFrame(state.loopHandle);
    state.loopHandle = null;
  }

  if (state.currentCourseId) {
    loadAttendance(state.currentCourseId).catch(console.error);
  }
}

function renderAttendanceTable() {
  if (!state.currentCourseId) {
    elements.attendanceTableBody.innerHTML = '<tr><td colspan="3">Select a course to view attendance.</td></tr>';
    return;
  }

  if (!state.attendance.length) {
    elements.attendanceTableBody.innerHTML = '<tr><td colspan="3">No attendance records yet.</td></tr>';
    return;
  }

  const rows = state.attendance.map(event => {
    const time = new Date(event.recordedAt).toLocaleString();
    return `<tr><td>${event.studentName}</td><td>${event.courseName}</td><td>${time}</td></tr>`;
  });
  elements.attendanceTableBody.innerHTML = rows.join('');
}
