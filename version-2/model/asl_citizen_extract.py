"""ASL Citizen → نقاط اليدين والجسم (للتدريب على كلمات لغة الإشارة الأمريكية).

يشتغل على جهازكم مباشرة على ملف ASL_Citizen.zip (بدون فك الضغط كله):
يقرأ ملفات التقسيم (train/val/test)، يختار مجموعة كلمات يومية، ويطلع من كل فيديو
نقاط MediaPipe Holistic (اليدين + أعلى الجسم). الناتج ملف صغير asl_citizen_landmarks.npz
ترسلونه للمشروع، والفيديوهات نفسها ما تطلع من جهازكم (شرط رخصة Microsoft).

    py -3.12 -m venv .venv-mp
    .venv-mp\\Scripts\\python -m pip install mediapipe==0.10.14 opencv-python numpy
    .venv-mp\\Scripts\\python asl_citizen_extract.py --zip D:\\ASL_Citizen.zip --words 100

يكمل من حيث وقف إذا انقطع (يحفظ كل فيديو في مجلد cache).

بدون تنزيل 42 جيجا: حطوا رابط التنزيل بدل مسار الملف، والسكربت ينزّل من الملف على الإنترنت
فهرس الملفات وفيديوهات الكلمات المختارة فقط (HTTP Range)، ويمسح كل فيديو بعد ما يطلع نقاطه:

    .venv-mp\\Scripts\\python asl_citizen_extract.py --zip "https://...ASL_Citizen.zip" --words 100
"""
import argparse
import csv
import io
import os
import re
import shutil
import sys
import tempfile
import time
import urllib.request
import zipfile
from collections import Counter, defaultdict
from concurrent.futures import ProcessPoolExecutor, as_completed

import numpy as np

FRAMES = 32  # كل فيديو يتحول لـ 32 لقطة بالتساوي
# نقاط الجسم: الأنف، الكتفين، المرفقين، الرسغين، الوركين
POSE_IDS = [0, 11, 12, 13, 14, 15, 16, 23, 24]
FEATURES = (len(POSE_IDS) + 21 + 21) * 3  # 153

# كلمات يومية مفيدة للمحادثة؛ اللي مو موجود في الداتا يتعوض بأكثر الكلمات تكرارًا
EVERYDAY = """
HELLO HI BYE GOODBYE THANKYOU PLEASE SORRY YES NO OK HELP NAME WHAT WHERE WHEN WHO WHY HOW
UNDERSTAND KNOW DONTKNOW LIKE WANT NEED HAVE GO COME EAT DRINK WATER FOOD BATHROOM TOILET
HOME SCHOOL WORK HOSPITAL DOCTOR NURSE SICK PAIN HURT MEDICINE EMERGENCY POLICE CALL PHONE
FAMILY MOTHER FATHER SISTER BROTHER FRIEND BABY CHILD MAN WOMAN DEAF HEARING SIGN LEARN
TEACHER STUDENT TIME TODAY TOMORROW YESTERDAY NOW LATER MORNING NIGHT DAY WEEK MONEY BUY
CAR BUS STOP WAIT AGAIN SLOW FAST GOOD BAD HAPPY SAD TIRED HUNGRY THIRSTY COLD HOT MORE
FINISH START OPEN CLOSE LOVE NICE MEET WELCOME FINE SEE LOOK WRITE READ
""".split()


class HttpZipFile(io.RawIOBase):
    """ملف على الإنترنت نقرأه بأجزاء (HTTP Range) عشان zipfile يفتحه بدون تنزيله كامل."""

    BLOCK = 1 << 20  # 1MB

    def __init__(self, url):
        self.url, self.pos, self.blocks = url, 0, {}
        req = urllib.request.Request(url, headers={'Range': 'bytes=0-0'})
        with urllib.request.urlopen(req, timeout=60) as r:
            total = r.headers.get('Content-Range', '').rsplit('/', 1)[-1]
            if r.status != 206 or not total.isdigit():
                sys.exit("الخادم ما يدعم التنزيل الجزئي. نزّلوا الملف كامل أو جربوا رابط ثاني.")
        self.size = int(total)
        self.downloaded = 0

    def readable(self):
        return True

    def seekable(self):
        return True

    def tell(self):
        return self.pos

    def seek(self, offset, whence=0):
        self.pos = [offset, self.pos + offset, self.size + offset][whence]
        return self.pos

    def _get(self, start, end):
        for attempt in range(5):
            try:
                req = urllib.request.Request(self.url, headers={'Range': f'bytes={start}-{end}'})
                with urllib.request.urlopen(req, timeout=120) as r:
                    data = r.read()
                self.downloaded += len(data)
                return data
            except OSError:
                if attempt == 4:
                    raise
                time.sleep(2 ** attempt)

    def read(self, n=-1):
        if n is None or n < 0:
            n = self.size - self.pos
        n = min(n, self.size - self.pos)
        if n <= 0:
            return b''
        if n >= self.BLOCK:  # قطعة كبيرة (فيديو): نطلبها مرة وحدة
            data = self._get(self.pos, self.pos + n - 1)
        else:  # قراءات صغيرة (الفهرس): نخزن أجزاء 1MB
            out = bytearray()
            p = self.pos
            while len(out) < n:
                b = p // self.BLOCK
                if b not in self.blocks:
                    if len(self.blocks) > 64:
                        self.blocks.clear()
                    s = b * self.BLOCK
                    self.blocks[b] = self._get(s, min(s + self.BLOCK, self.size) - 1)
                chunk = self.blocks[b][p - b * self.BLOCK:]
                out += chunk[:n - len(out)]
                p += len(chunk)
            data = bytes(out)
        self.pos += len(data)
        return data

    def readinto(self, buf):
        data = self.read(len(buf))
        buf[:len(data)] = data
        return len(data)


def open_zip(src):
    if src.startswith(('http://', 'https://')):
        return zipfile.ZipFile(io.BufferedReader(HttpZipFile(src), buffer_size=1 << 16))
    return zipfile.ZipFile(src)


def norm(s):
    return re.sub(r'[^a-z0-9]', '', s.lower())


def find_col(header, *words):
    for i, h in enumerate(header):
        if any(w in h.lower() for w in words):
            return i
    sys.exit(f"ما لقيت عمود {words} في {header}")


def read_splits(zf):
    rows = []
    names = zf.namelist()
    for split in ('train', 'val', 'test'):
        path = next((n for n in names if re.search(rf'splits/{split}\.csv$', n)), None)
        if path is None:
            sys.exit(f"ما لقيت splits/{split}.csv داخل الملف")
        reader = csv.reader(io.TextIOWrapper(zf.open(path), encoding='utf-8-sig'))
        header = next(reader)
        c_user, c_video, c_gloss = (find_col(header, 'participant', 'user'),
                                    find_col(header, 'video'), find_col(header, 'gloss'))
        for r in reader:
            if r:
                rows.append({'split': split, 'user': r[c_user], 'video': r[c_video], 'gloss': r[c_gloss]})
    video_dir = os.path.dirname(os.path.dirname(path)) + '/videos/'
    return rows, video_dir


def choose_glosses(rows, n):
    counts = Counter(r['gloss'] for r in rows)
    by_norm = {norm(g): g for g in counts}
    chosen = [by_norm[norm(w)] for w in EVERYDAY if norm(w) in by_norm]
    chosen = list(dict.fromkeys(chosen))[:n]
    for g, _ in counts.most_common():
        if len(chosen) >= n:
            break
        if g not in chosen:
            chosen.append(g)
    return sorted(chosen)


def resample(seq):
    idx = np.linspace(0, len(seq) - 1, FRAMES).round().astype(int)
    return seq[idx]


def extract(args):
    video_path, cache_file = args
    import cv2
    import mediapipe as mp

    cap = cv2.VideoCapture(video_path)
    frames = []
    with mp.solutions.holistic.Holistic(static_image_mode=False, model_complexity=1,
                                        min_detection_confidence=0.5) as holistic:
        while True:
            ok, img = cap.read()
            if not ok:
                break
            res = holistic.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
            f = np.zeros((len(POSE_IDS) + 42, 3), np.float32)
            if res.pose_landmarks:
                lm = res.pose_landmarks.landmark
                f[:len(POSE_IDS)] = [[lm[i].x, lm[i].y, lm[i].z] for i in POSE_IDS]
            # right_hand/left_hand في MediaPipe من منظور الشخص نفسه
            for k, hand in enumerate([res.right_hand_landmarks, res.left_hand_landmarks]):
                if hand:
                    s = len(POSE_IDS) + 21 * k
                    f[s:s + 21] = [[p.x, p.y, p.z] for p in hand.landmark]
            frames.append(f)
    cap.release()
    os.remove(video_path)  # الفيديو ما يبقى على الجهاز بعد ما نطلع نقاطه
    seq = np.array(frames)
    if not len(seq):
        np.save(cache_file, np.zeros((0, FEATURES), np.float32))
        return cache_file, 0
    # نقص البداية والنهاية اللي ما فيها يد
    has_hand = np.abs(seq[:, len(POSE_IDS):]).sum(axis=(1, 2)) > 0
    if has_hand.any():
        first, last = np.argmax(has_hand), len(has_hand) - np.argmax(has_hand[::-1])
        seq = seq[first:last]
    out = resample(seq).reshape(FRAMES, -1)
    np.save(cache_file, out.astype(np.float32))
    return cache_file, int(has_hand.sum())


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--zip', required=True, help='ASL_Citizen.zip')
    p.add_argument('--words', type=int, default=100)
    p.add_argument('--workers', type=int, default=max(1, (os.cpu_count() or 2) - 1))
    p.add_argument('--cache', default='asl_citizen_cache')
    p.add_argument('--out', default='asl_citizen_landmarks.npz')
    p.add_argument('--limit', type=int, default=0, help='للتجربة: عدد فيديوهات محدود')
    a = p.parse_args()

    zf = open_zip(a.zip)
    rows, video_dir = read_splits(zf)
    members = set(zf.namelist())
    glosses = choose_glosses(rows, a.words)
    rows = [r for r in rows if r['gloss'] in glosses]
    if a.limit:
        rows = rows[:a.limit]
    print(f"{len(glosses)} كلمة، {len(rows)} فيديو، "
          f"{len({r['user'] for r in rows})} شخص")

    os.makedirs(a.cache, exist_ok=True)
    jobs = []
    for r in rows:
        member = video_dir + r['video']
        if member not in members:
            member = next((m for m in members if m.endswith('/' + r['video'])), None)
        if member is None:
            print(f"⚠️ الفيديو مو موجود: {r['video']}")
            continue
        r['cache'] = os.path.join(a.cache, norm(r['video']) + '.npy')
        if not os.path.exists(r['cache']):
            jobs.append((member, r['cache']))

    print(f"باقي {len(jobs)} فيديو يحتاج استخراج")
    tmp = tempfile.mkdtemp(prefix='aslc_')
    done, pending = 0, set()
    with ProcessPoolExecutor(a.workers) as pool:
        for member, cache_file in jobs:
            # نطلع الفيديو (أو ننزله) واحد واحد، وما نخلي أكثر من workers×3 فيديو على الجهاز
            path = os.path.join(tmp, os.path.basename(cache_file) + os.path.splitext(member)[1])
            with zf.open(member) as src, open(path, 'wb') as dst:
                dst.write(src.read())
            pending.add(pool.submit(extract, (path, cache_file)))
            while len(pending) >= a.workers * 3:
                finished = next(as_completed(pending))
                pending.discard(finished)
                finished.result()
                done += 1
                if done % 25 == 0:
                    print(f"✅ {done}/{len(jobs)}", flush=True)
        for fut in as_completed(pending):
            fut.result()
            done += 1
    print(f"✅ {done}/{len(jobs)}", flush=True)
    raw = getattr(getattr(zf.fp, 'raw', None), 'downloaded', None)
    if raw is not None:
        print(f"نزّلنا {raw / 1e9:.2f} GB فقط من الملف")
    zf.close()
    shutil.rmtree(tmp, ignore_errors=True)

    xs, ys, splits, users, frames_with_hands = [], [], [], [], defaultdict(int)
    for r in rows:
        if 'cache' not in r or not os.path.exists(r['cache']):
            continue
        seq = np.load(r['cache'])
        if seq.shape != (FRAMES, FEATURES):
            frames_with_hands['empty'] += 1
            continue
        xs.append(seq)
        ys.append(glosses.index(r['gloss']))
        splits.append(r['split'])
        users.append(r['user'])
    np.savez_compressed(a.out, x=np.array(xs, np.float16), y=np.array(ys), split=np.array(splits),
                        user=np.array(users), classes=np.array(glosses), pose_ids=np.array(POSE_IDS))
    print(f"✅ {a.out}: {len(xs)} فيديو (تخطينا {frames_with_hands['empty']} بدون نقاط). "
          f"الحجم {os.path.getsize(a.out) / 1e6:.1f} MB — أرسلوه للمشروع.")


if __name__ == '__main__':
    main()
