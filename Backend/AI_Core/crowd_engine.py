from flask import Flask, jsonify, Response, request
import cv2
import numpy as np
import threading
import time
import os
import json
import uuid

# Use relative paths from Backend/AI_Core
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "..", "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

import logging

app = Flask(__name__)

# Disable Flask request logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

# Config
def load_config():
    cfg_path = os.path.join(BASE_DIR, 'config.json')
    if os.path.exists(cfg_path):
        with open(cfg_path, 'r') as f:
            return json.load(f)
    return {
        "camera_settings": {"camera_index": 0, "width": 640, "height": 480},
        "detection_settings": {"model_path": "haarcascade_frontalface_default.xml", "grid_size": {"rows": 3, "cols": 3}},
        "zone_thresholds": {"low": 3, "medium": 6, "high": 10}
    }

config = load_config()

# Global AI State - Switch to Haar Cascade for Face Only & Performance
# We use the built-in OpenCV path if possible, or fallback to local
face_cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
if not os.path.exists(face_cascade_path):
    # Fallback to a local path if the system path is weird (though cv2.data usually works)
    face_cascade_path = os.path.join(BASE_DIR, 'haarcascade_frontalface_default.xml')

face_cascade = cv2.CascadeClassifier(face_cascade_path)

cap = None
current_zone_data = {"total": 0, "zones": []}
latest_frame = None
is_running = False
camera_thread = None
lock = threading.Lock()

def camera_worker():
    global cap, latest_frame, current_zone_data, is_running
    print("🎥 Camera Worker Started (Face Detection Mode)")
    
    while is_running:
        if cap is None or not cap.isOpened():
            time.sleep(0.5)
            continue
            
        success, frame = cap.read()
        if not success or frame is None:
            time.sleep(0.01)
            continue

        # Resize for performance and consistency
        small_frame = cv2.resize(frame, (640, 480))
        gray = cv2.cvtColor(small_frame, cv2.COLOR_BGR2GRAY)
        
        # Face Detection
        try:
            # detectMultiScale is much faster than YOLO on CPU
            faces = face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30)
            )
            
            count = 0
            for (x, y, w, h) in faces:
                cv2.rectangle(small_frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                count += 1
            
            # Update data
            with lock:
                current_zone_data["total"] = count
                
                # Update sub-zones (simplified 3x3 grid simulation)
                rows, cols = 3, 3
                new_zones = []
                # Distribute count for zones visualization
                avg_per_zone = count // (rows * cols)
                remainder = count % (rows * cols)
                
                for r in range(rows):
                    for c in range(cols):
                        z_count = avg_per_zone + (1 if (r*cols + c) < remainder else 0)
                        level = "Low" if z_count < 3 else "Medium" if z_count < 7 else "High"
                        new_zones.append({"id": f"Z{r*cols + c + 1}", "count": z_count, "level": level})
                
                current_zone_data["zones"] = new_zones
                
                cv2.putText(small_frame, f"Faces Detected: {count}", (10, 30), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                _, buffer = cv2.imencode('.jpg', small_frame)
                latest_frame = buffer.tobytes()
        except Exception as e:
            print(f"AI Worker Error: {e}")
            
        # Reduced sleep time for smoother 30fps-ish feel. 
        # Processing is fast so we don't need much sleep.
        time.sleep(0.005)

def generate_frames():
    global latest_frame, is_running
    while is_running:
        if latest_frame is None:
            time.sleep(0.05)
            continue
        yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + latest_frame + b'\r\n')
        
        # 30 FPS target = ~0.033s. 
        time.sleep(0.033)

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/status')
def get_status():
    return jsonify({
        "camera_active": is_running, 
        "total": current_zone_data["total"],
        "status": "online"
    })

@app.route('/api/start')
def start_camera():
    global cap, is_running, camera_thread
    if not is_running:
        print("🚀 AI CORE: Manual activation signal received.")
        print("🔍 Searching for active camera sensors...")
        for idx in range(5):
            try:
                print(f"📡 Probing Camera Index {idx}...")
                test_cap = cv2.VideoCapture(idx, cv2.CAP_DSHOW) # CAP_DSHOW often faster on Windows
                if test_cap.isOpened():
                    ret, frame = test_cap.read()
                    if ret and frame is not None:
                        print(f"✅ FOUND: Camera sensor verified at index {idx}")
                        cap = test_cap
                        is_running = True
                        camera_thread = threading.Thread(target=camera_worker, daemon=True)
                        camera_thread.start()
                        print("📡 AI Worker Thread initialized and running.")
                        return jsonify({"status": "started", "index": idx})
                    else:
                        print(f"❌ FAIL: Sensor {idx} exists but refused to stream. Releasing.")
                    test_cap.release()
            except Exception as e:
                print(f"⚠️ Error probing index {idx}: {e}")
        
        print("❌ CRITICAL: No functional camera sensors found in the system.")
        return jsonify({"status": "error", "message": "No functional camera sensor detected. Please check connections."}), 500
    return jsonify({"status": "already_running"})

@app.route('/api/stop')
def stop_camera():
    global cap, is_running
    is_running = False
    if cap:
        cap.release()
    return jsonify({"status": "stopped"})

@app.route('/api/zones')
def get_zones():
    return jsonify(current_zone_data)

# Video Upload Logic
upload_sessions = {}
@app.route('/api/upload-video', methods=['POST'])
def api_upload_video():
    file = request.files.get('video')
    if not file: return jsonify({"error": "No file"}), 400
    token = uuid.uuid4().hex
    save_path = os.path.join(UPLOADS_DIR, f"{token}_{file.filename}")
    file.save(save_path)
    upload_sessions[token] = {"path": save_path, "total": 0}
    return jsonify({"status": "success", "session_token": token})

@app.route('/uploaded_feed/<token>')
def uploaded_feed(token):
    def process_upload(t):
        sess = upload_sessions.get(t)
        if not sess: return
        vcap = cv2.VideoCapture(sess['path'])
        while vcap.isOpened():
            ret, frame = vcap.read()
            if not ret: break
            frame = cv2.resize(frame, (640, 480))
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Face Detection
            faces = face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(30, 30))
            count = len(faces)
            sess['total'] = count
            
            for (x, y, w, h) in faces:
                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            
            cv2.putText(frame, f"Analysis: {count}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
            _, buf = cv2.imencode('.jpg', frame)
            yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + buf.tobytes() + b'\r\n')
            time.sleep(0.033) # Smooth playback
        vcap.release()
    return Response(process_upload(token), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/upload_zones/<token>')
def get_upload_zones(token):
    sess = upload_sessions.get(token)
    return jsonify({"total": sess['total'], "zones": []}) if sess else jsonify({"total": 0})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5773, threaded=True)
