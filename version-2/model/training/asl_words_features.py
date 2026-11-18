"""تجهيز نقاط ASL Citizen: نفس الدالة تُستخدم في التدريب وفي api.py عشان ما يختلفون."""
import numpy as np

FRAMES = 32
POSE_IDS = [0, 11, 12, 13, 14, 15, 16, 23, 24]
N_POSE = len(POSE_IDS)
FEATURES = (N_POSE + 42) * 3
L_SHOULDER, R_SHOULDER = 1, 2  # مكانهم داخل POSE_IDS (11 و 12)


def normalize_sequence(seq):
    """seq: (FRAMES, FEATURES) بإحداثيات الصورة. يرجعها نسبة لمنتصف الكتفين وعرضهم."""
    pts = seq.reshape(len(seq), -1, 3).astype(np.float32)
    present = np.abs(pts).sum(axis=2) > 0
    shoulders = pts[:, [L_SHOULDER, R_SHOULDER]]
    ok = present[:, L_SHOULDER] & present[:, R_SHOULDER]
    if ok.any():
        center = shoulders[ok].mean(axis=(0, 1))
        width = np.linalg.norm(shoulders[ok, 0, :2] - shoulders[ok, 1, :2], axis=1).mean()
    else:  # ما فيه كتفين: نعتمد على النقاط الموجودة
        center = pts[present].mean(axis=0) if present.any() else np.zeros(3, np.float32)
        width = 0.3
    out = (pts - center) / max(width, 1e-3)
    out[~present] = 0
    return out.reshape(len(seq), -1)


def mirror_sequence(seq):
    """مرآة: نعكس x ونبدل اليد اليمنى باليسرى (ونقاط الجسم اليمين باليسار)."""
    pts = seq.reshape(len(seq), -1, 3).copy()
    present = np.abs(pts).sum(axis=2) > 0
    pts[..., 0] *= -1
    pose = pts[:, :N_POSE].copy()
    for a, b in [(1, 2), (3, 4), (5, 6), (7, 8)]:  # كتف، مرفق، رسغ، ورك
        pose[:, [a, b]] = pose[:, [b, a]]
    right, left = pts[:, N_POSE:N_POSE + 21].copy(), pts[:, N_POSE + 21:].copy()
    pts[:, :N_POSE], pts[:, N_POSE:N_POSE + 21], pts[:, N_POSE + 21:] = pose, left, right
    swapped = present.copy()
    swapped[:, N_POSE:N_POSE + 21], swapped[:, N_POSE + 21:] = present[:, N_POSE + 21:], present[:, N_POSE:N_POSE + 21]
    pose_present = present[:, :N_POSE].copy()
    for a, b in [(1, 2), (3, 4), (5, 6), (7, 8)]:
        pose_present[:, [a, b]] = pose_present[:, [b, a]]
    swapped[:, :N_POSE] = pose_present
    pts[~swapped] = 0
    return pts.reshape(len(seq), -1).astype(np.float32)
