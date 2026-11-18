"""يرسم نتائج benchmark.py للبوستر: results/*.png و results/table.md"""
import json

import matplotlib
import numpy as np

matplotlib.use('Agg')
import matplotlib.pyplot as plt  # noqa: E402

OUT = 'results'
BLUE, ORANGE, GRAY = '#2a78d6', '#eb6834', '#b9b8b1'
INK, INK2, SURFACE = '#0b0b0b', '#52514e', '#fcfcfb'
plt.rcParams.update({
    'font.size': 12, 'axes.edgecolor': INK2, 'axes.labelcolor': INK2, 'xtick.color': INK2,
    'ytick.color': INK2, 'axes.spines.top': False, 'axes.spines.right': False,
    'figure.facecolor': SURFACE, 'axes.facecolor': SURFACE, 'savefig.dpi': 200,
})

summary = json.load(open(f'{OUT}/summary.json', encoding='utf-8'))
rows = sorted(summary.items(), key=lambda kv: kv[1]['accuracy'])
names = [r['name'] for _, r in rows]
acc = np.array([r['accuracy'] for _, r in rows]) * 100
f1 = np.array([r['f1_macro'] for _, r in rows]) * 100
ours = ['ours' in n for n in names]

# 1) الدقة وF1 لكل موديل
fig, ax = plt.subplots(figsize=(9, 0.75 * len(rows) + 1.2))
y = np.arange(len(rows))
ax.barh(y + 0.19, acc, height=0.36, color=BLUE, label='Accuracy', edgecolor=SURFACE, linewidth=2)
ax.barh(y - 0.19, f1, height=0.36, color=ORANGE, label='Macro F1', edgecolor=SURFACE, linewidth=2)
for i, (a, f) in enumerate(zip(acc, f1)):
    ax.text(a + 0.5, i + 0.19, f'{a:.1f}%', va='center', color=INK, fontsize=10)
    ax.text(f + 0.5, i - 0.19, f'{f:.1f}%', va='center', color=INK2, fontsize=10)
ax.set_yticks(y, names)
for label, mine in zip(ax.get_yticklabels(), ours):
    label.set_fontweight('bold' if mine else 'normal')
ax.set_xlim(0, 108)
ax.set_xlabel('% on 10,810 held-out ArASL test images')
ax.grid(axis='x', color='#e4e3df', linewidth=0.8)
ax.set_axisbelow(True)
ax.legend(loc='lower right', frameon=False)
ax.set_title('Arabic sign letters: accuracy by model', loc='left', color=INK, fontweight='bold')
fig.tight_layout()
fig.savefig(f'{OUT}/accuracy.png')

# 2) الدقة مقابل زمن الاستجابة (لوغاريتمي)
fig, ax = plt.subplots(figsize=(8, 5))
for (_, r), mine in zip(rows, ours):
    ax.scatter(r['latency_ms'], r['accuracy'] * 100, s=90, color=BLUE if mine else GRAY,
               edgecolor=SURFACE, linewidth=2, zorder=3)
    ax.annotate(r['name'], (r['latency_ms'], r['accuracy'] * 100), textcoords='offset points',
                xytext=(8, -4), color=INK if mine else INK2, fontsize=10,
                fontweight='bold' if mine else 'normal')
ax.set_xscale('log')
ax.set_xlabel('Latency per image on CPU (ms, log scale)')
ax.set_ylabel('Accuracy (%)')
ax.grid(color='#e4e3df', linewidth=0.8)
ax.set_axisbelow(True)
ax.set_title('Accuracy vs speed (up and left is better)', loc='left', color=INK, fontweight='bold')
fig.tight_layout()
fig.savefig(f'{OUT}/accuracy_vs_latency.png')

# 3) مصفوفة الالتباس لأفضل موديل
best_key, best = max(summary.items(), key=lambda kv: kv[1]['accuracy'])
cm = np.load(f'{OUT}/{best_key}_confusion.npy').astype(float)
cm = cm / cm.sum(axis=1, keepdims=True) * 100
import os as _os, sys as _sys
_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))  # labels.py في مجلد model
from labels import ARASL_LABELS  # noqa: E402
latin = sorted(ARASL_LABELS)
fig, ax = plt.subplots(figsize=(10, 9))
im = ax.imshow(cm, cmap='Blues', vmin=0, vmax=100)
ax.set_xticks(range(len(latin)), latin, rotation=90, fontsize=8)
ax.set_yticks(range(len(latin)), latin, fontsize=8)
ax.set_xlabel('Predicted letter')
ax.set_ylabel('True letter')
fig.colorbar(im, ax=ax, fraction=0.046, label='% of true letter')
ax.set_title(f'Confusion matrix: {best["name"]}', loc='left', color=INK, fontweight='bold')
fig.tight_layout()
fig.savefig(f'{OUT}/confusion_best.png')

# 4) جدول
lines = ['| Model | Accuracy | Precision | Recall | Macro F1 | Top-3 | Latency (ms) | Size (MB) | Params | Train (min) |',
         '|---|---|---|---|---|---|---|---|---|---|']
for _, r in reversed(rows):
    lines.append(f"| {r['name']} | {r['accuracy']*100:.2f}% | {r['precision_macro']*100:.2f}% | "
                 f"{r['recall_macro']*100:.2f}% | {r['f1_macro']*100:.2f}% | {r['top3_accuracy']*100:.2f}% | "
                 f"{r['latency_ms']:.1f} | {r['size_mb']:.1f} | {r['params']:,} | {r['train_time_min']:.1f} |")
open(f'{OUT}/table.md', 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
print('\n'.join(lines))
