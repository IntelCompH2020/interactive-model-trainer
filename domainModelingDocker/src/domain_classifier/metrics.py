"""
A collection of methods for the evaluation of classifiers.

@author: J. Cid-Sueiro, A. Gallardo-Antolin
"""

import logging
import numpy as np

# Some libraries required for evaluation
# from sklearn.metrics import precision_recall_fscore_support
# from sklearn.metrics import average_precision_score, precision_recall_curve
from sklearn.metrics import confusion_matrix, roc_curve, RocCurveDisplay, auc
import matplotlib.pyplot as plt


def binary_metrics(preds, labels, sampling_probs=None):
    """
    Compute performance metrics based on binary labels and binary predictions
    only

    Parameters
    ----------
    preds : np.array
        Binary predictions
    labels : np.array
        True class labels
    sampling_probs : np.array
        Sampling probabilities. It is used to compute performance metrics
        as weighted averages

    Returns
    -------
    eval_scores: dict
        A dictionary of evaluation metrics.
    """

    eps = 1e-50

    # Compute weights
    w = None
    if sampling_probs is not None:
        w = 1 / (sampling_probs + eps)

        # Normalize weights. This is not required, but useful to interpret
        # tn, fp, fn and tp values as "no. of effective samples"
        w = w / np.sum(w) * len(w)

    # Metrics computation at s_min threshold
    tn, fp, fn, tp = confusion_matrix(labels, preds, sample_weight=w).ravel()
    tpr = (tp + eps) / (tp + fn + 2 * eps)
    fpr = (fp + eps) / (fp + tn + 2 * eps)
    acc = (tp + tn + eps) / (tp + tn + fp + fn + 2 * eps)
    bal_acc = 0.5 * (tpr + 1 - fpr)

    # Dictionary with the evaluation results
    # Note that results are stored as standard float or int, because the
    # dictionary might be saved into a yaml file, and numpy formats are not
    # properly saved.
    m = {'size': len(labels),
         'n_labels_0': int(np.sum(labels == 0)),
         'n_labels_1': int(np.sum(labels == 1)),
         'n_preds_0': int(np.sum(preds == 0)),
         'n_preds_1': int(np.sum(preds == 1)),
         'tn': int(tn),
         'fp': int(fp),
         'fn': int(fn),
         'tp': int(tp),
         'acc': float(acc),
         'bal_acc': float(bal_acc),
         'tpr': float(tpr),
         'fpr': float(fpr)}

    return m


def print_metrics(m, roc=None, title="", data="", print_unweighted=True):
    """
    Pretty-prints the given metrics

    Parameters
    ----------
    m : dict
        Dictionary of metrics (produced by the binary_metrics() method)
    roc : dict or None, optional (default=None)
        A dictionary of score-based metrics. It is used to print AUC.
    data : str, optional (default="")
        Identifier of the dataset used to compute the metrics. It is used
        to compose the text title
    print_unweighted : boolean (default=True)
        If True, unweighted metrics are printed in addition to the weighted
        metrics
    """

    if m is None:
        logging.warning(
            f"-- -- There are no predictions for the {data} samples")
        return

    # Maximum string lentgh to be printed
    w = len(str(m['size']))

    # Print header
    title2 = f"-- -- Binary metrics based on {data.upper()} data"
    print(f"")
    print("=" * max(len(title), len(title2)))
    print(f"-- -- {title}")
    print(title2)
    print(f"")

    print(f".. .. Sample size: {m['size']:{w}}")
    print(f".. .. Class proportions:")
    print(f".. .. .. Labels 0:      {m['n_labels_0']:{w}}")
    print(f".. .. .. Labels 1:      {m['n_labels_1']:{w}}")
    print(f".. .. .. Predictions 0: {m['n_preds_0']:{w}}")
    print(f".. .. .. Predictions 1: {m['n_preds_1']:{w}}")
    print(f"")
    print(f".. .. Hits:")
    print(f".. .. .. TP: {m['tp']:{w}},    TPR: {m['tpr']:.5f}")
    print(f".. .. .. TN: {m['tn']:{w}},    TNR: {1 - m['fpr']:.5f}")
    print(f".. .. Errors:")
    print(f".. .. .. FP: {m['fp']:{w}},    FPR: {m['fpr']:.5f}")
    print(f".. .. .. FN: {m['fn']:{w}},    FNR: {1 - m['tpr']:.5f}")
    print(f".. .. Standard metrics:")
    print(f".. .. .. Accuracy: {m['acc']:.5f}")
    print(f".. .. .. Balanced accuracy: {m['bal_acc']:.5f}")

    # Print AUC if available:
    if roc is not None and 'auc' in roc:
        print(f".. .. Score-based metrics:")
        print(f".. .. .. AUC: {roc['auc']:.5f}")
    print("-" * max(len(title), len(title2)))
    print("")

    if print_unweighted and ('unweighted' in m):

        mu = m['unweighted']
        print('Unweighted metrics:')
        print(f".. .. Hits:")
        print(f".. .. .. TP: {mu['tp']:{w}},    TPR: {mu['tpr']:.5f}")
        print(f".. .. .. TN: {mu['tn']:{w}},    TNR: {1 - mu['fpr']:.5f}")
        print(f".. .. Errors:")
        print(f".. .. .. FP: {mu['fp']:{w}},    FPR: {mu['fpr']:.5f}")
        print(f".. .. .. FN: {mu['fn']:{w}},    FNR: {1 - mu['tpr']:.5f}")
        print(f".. .. Standard metrics:")
        print(f".. .. .. Accuracy: {mu['acc']:.5f}")
        print(f".. .. .. Balanced accuracy: {mu['bal_acc']:.5f}")

        # Print AUC if available:
        if roc is not None and 'auc' in roc and 'unweighted' in roc:
            print(f".. .. Score-based metrics:")
            print(f".. .. .. AUC: {roc['unweighted']['auc']:.5f}")
        print("-" * max(len(title), len(title2)))
        print("")

    return


def score_based_metrics(scores, labels, sampling_probs=None):
    """
    Computes score-based metrics

    Parameters
    ----------
    scores : np.array
        Score values
    labels : np.array
        Target values
    sampling_probs : np.array
        Sampling probabilities. It is used to compute performance metrics
        as weighted averages

    Returns
    -------
    eval_scores: dict
        A dictionary of evaluation metrics.
    """

    eps = 1e-50

    # Compute weights
    w = None
    if sampling_probs is not None:
        w = 1 / (sampling_probs + eps)

    # ##############################
    # Metrics based on the ROC curve

    # ROC curve
    fpr_roc, tpr_roc, thresholds = roc_curve(labels, scores, sample_weight=w)

    # Compute class priors, FP and TP.
    if w is None:
        w_ = np.ones(labels.shape)
    else:
        w_ = w

    P1 = sum(w_ * labels) / sum(w_)
    P0 = 1 - P1
    fn = P1 * (1 - tpr_roc)
    fp = P0 * fpr_roc

    # Some critical points:
    # 1. FPR = FNR (= 1-TPR)
    i = np.argmin(np.abs(fpr_roc + tpr_roc - 1))
    Q1 = {'tpr': tpr_roc[i],
          'fpr': fpr_roc[i],
          'th': thresholds[i]}

    # 2. FP = FN (= 1 - TP)
    i = np.argmin(np.abs(fp - fn))
    Q2 = {'tpr': tpr_roc[i],
          'fpr': fpr_roc[i],
          'th': thresholds[i]}

    # Dictionary with the evaluation results
    tpr_roc_float = [float(k) for k in tpr_roc]
    fpr_roc_float = [float(k) for k in fpr_roc]

    # Float values are used because np.float is not nice for yaml files
    m = {'tpr_roc': tpr_roc_float,
         'fpr_roc': fpr_roc_float,
         'auc': float(auc(fpr_roc_float, tpr_roc_float)),
         'fpr=fnr': Q1,
         'fp=fn': Q2,
         }

    # #############################
    # Metrics based on the PR curve

    # ROC curve
    precission, recall, thresholds = roc_curve(labels, scores, sample_weight=w)

    # Some critical points:
    # 1. FPR = FNR (= 1-TPR)
    i = np.argmin(np.abs(fpr_roc + tpr_roc - 1))
    Q1 = {'tpr': tpr_roc[i],
          'fpr': fpr_roc[i],
          'th': thresholds[i]}

    # 2. FP = FN (= 1 - TP)
    i = np.argmin(np.abs(fp - fn))
    Q2 = {'tpr': tpr_roc[i],
          'fpr': fpr_roc[i],
          'th': thresholds[i]}

    # Dictionary with the evaluation results
    tpr_roc_float = [float(k) for k in tpr_roc]
    fpr_roc_float = [float(k) for k in fpr_roc]

    return m


def plot_score_based_metrics(scores, labels):

    RocCurveDisplay.from_predictions(
        labels, scores, sample_weight=None, drop_intermediate=True,
        pos_label=None, name=None, ax=None)

    plt.show(block=False)

    return
