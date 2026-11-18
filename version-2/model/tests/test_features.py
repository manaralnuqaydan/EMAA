"""نفس دالة التجهيز تُستخدم في التدريب وفي الـ API، فنتأكد من خصائصها."""
import numpy as np

from asl_words_features import FEATURES, FRAMES, N_POSE, mirror_sequence, normalize_sequence


def random_seq(seed=0):
    seq = np.random.default_rng(seed).random((FRAMES, FEATURES)).astype(np.float32)
    seq[:, (N_POSE + 21) * 3:] = 0  # يد يسرى غير موجودة
    return seq


def test_normalize_centers_shoulders_and_keeps_missing_zero():
    out = normalize_sequence(random_seq()).reshape(FRAMES, -1, 3)
    mid = out[:, [1, 2]].mean(axis=(0, 1))
    assert np.allclose(mid, 0, atol=1e-4)
    assert np.all(out[:, N_POSE + 21:] == 0)


def test_normalize_is_scale_invariant():
    seq = random_seq(2)
    assert np.allclose(normalize_sequence(seq), normalize_sequence(seq * 2), atol=1e-4)


def test_mirror_twice_is_identity_and_swaps_hands():
    seq = random_seq(3)
    once = mirror_sequence(seq).reshape(FRAMES, -1, 3)
    assert np.all(once[:, N_POSE:N_POSE + 21] == 0)  # اليمنى صارت فاضية
    assert np.any(once[:, N_POSE + 21:] != 0)
    assert np.allclose(mirror_sequence(mirror_sequence(seq)), seq)
