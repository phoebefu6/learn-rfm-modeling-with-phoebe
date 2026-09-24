#!/usr/bin/env python3
"""Rebuild every Olist number quoted in learn-rfm-modeling-with-phoebe, and the bench sample.

Internal build script. Not linked from any audience-facing page.

Usage
-----
  python3 materials/build-olist-rfm.py <dir-with-olist-csvs> [--write-sample]

The directory must hold the Kaggle CSVs: olist_orders_dataset.csv, olist_customers_dataset.csv,
olist_order_payments_dataset.csv (Brazilian E-Commerce Public Dataset by Olist, CC BY-NC-SA 4.0).

Decisions, stated once (session 1 teaches all six):
  person id   customer_unique_id
  orders      delivered only
  spend       sum of payment_value per order (the payments table)
  monetary    total spend, not average basket
  window      all time
  snapshot    2018-09-01, the first day after the last complete month

--write-sample regenerates assets/rfm-sample.js with numpy.random.default_rng(20180901),
4,000 rows. The bench (assets/rfm-live.js) reads that file; the node check below must agree with
this script to the row before any page quotes a bench number:

  cd assets && node -e 'global.window={};require("./rfm-sample.js");
    const L=require("./rfm-live.js");const r=L.evaluateAll(window.RFM_SAMPLE);
    for (const k in r) console.log(k, r[k].top.share, r[k].top.onceShare, r[k].winback.n)'
"""
import json
import os
import sys

import numpy as np
import pandas as pd

SNAPSHOT = pd.Timestamp("2018-09-01")
SEED = 20180901
SAMPLE_N = 4000


def build(d):
    o = pd.read_csv(os.path.join(d, "olist_orders_dataset.csv"), parse_dates=["order_purchase_timestamp"])
    c = pd.read_csv(os.path.join(d, "olist_customers_dataset.csv"))
    p = pd.read_csv(os.path.join(d, "olist_order_payments_dataset.csv"))

    monthly = o.groupby(o.order_purchase_timestamp.dt.to_period("M")).order_status.agg(
        n="size", delivered=lambda s: (s == "delivered").mean())
    print("last six months (the ragged edge):")
    print(monthly.tail(6).round(3))

    dd = o[o.order_status == "delivered"].merge(c[["customer_id", "customer_unique_id"]], on="customer_id")
    paid = p.groupby("order_id").payment_value.sum().rename("amount")
    dd = dd.merge(paid, left_on="order_id", right_index=True, how="left")
    dd = dd[dd.order_purchase_timestamp < SNAPSHOT]

    rfm = dd.groupby("customer_unique_id").agg(
        last=("order_purchase_timestamp", "max"), F=("order_id", "nunique"), M=("amount", "sum"))
    rfm["R"] = (SNAPSHOT - rfm["last"]).dt.days
    return rfm


def report(rfm):
    n = len(rfm)
    print(f"\ncustomers {n}")
    print(f"share F==1 {(rfm.F == 1).mean():.4f}   repeat buyers {(rfm.F > 1).sum()} "
          f"holding {rfm[rfm.F > 1].M.sum() / rfm.M.sum():.4f} of revenue")
    print(f"M mean {rfm.M.mean():.2f} median {rfm.M.median():.2f} share above mean {(rfm.M > rfm.M.mean()).mean():.4f}")
    print(f"F mean {rfm.F.mean():.4f} share above mean {(rfm.F > rfm.F.mean()).mean():.4f}")
    print(f"R mean {rfm.R.mean():.1f} median {rfm.R.median():.0f} share below mean {(rfm.R < rfm.R.mean()).mean():.4f}")

    hi = lambda s, rev=False: ((s < s.mean()) if rev else (s > s.mean())).astype(int)
    code = hi(rfm.R, True).astype(str) + hi(rfm.F).astype(str) + hi(rfm.M).astype(str)
    g = rfm.groupby(code).agg(n=("F", "size"), rev=("M", "sum"))
    g["n_pct"] = (g.n / n * 100).round(2)
    g["rev_pct"] = (g.rev / rfm.M.sum() * 100).round(2)
    print("\nmean-split eight groups:")
    print(g.sort_values("n", ascending=False))

    try:
        pd.qcut(rfm.F, 5)
    except ValueError as e:
        print("\npd.qcut(F, 5):", str(e)[:60])
    Fq = pd.qcut(rfm.F.rank(method="first"), 5, labels=[1, 2, 3, 4, 5]).astype(int)
    print("\nF==1 customers by rank-quintile score:")
    print(Fq[rfm.F == 1].value_counts().sort_index().to_dict())


def write_sample(rfm, out):
    rng = np.random.default_rng(SEED)
    idx = np.sort(rng.choice(len(rfm), SAMPLE_N, replace=False))
    s = rfm.iloc[idx]
    js = ("/* rfm-sample.js - 4,000 real customers sampled (seed 20180901) from the public Olist dataset.\n"
          " * One row per customer_unique_id, delivered orders only, snapshot 2018-09-01.\n"
          " * R = days since last order, F = delivered orders, Mc = total payments in cents (BRL).\n"
          " * Source: Brazilian E-Commerce Public Dataset by Olist (CC BY-NC-SA 4.0), Kaggle. */\n"
          "window.RFM_SAMPLE = {\n"
          f'  snapshot: "{SNAPSHOT.date()}", n: {len(s)}, currency: "BRL",\n'
          f"  R: {json.dumps(s.R.astype(int).tolist())},\n"
          f"  F: {json.dumps(s.F.astype(int).tolist())},\n"
          f"  Mc: {json.dumps([int(round(x * 100)) for x in s.M])}\n"
          "};\n")
    with open(out, "w") as f:
        f.write(js)
    print(f"\nwrote {out} ({len(js)} bytes); sample share F==1 {(s.F == 1).mean():.4f}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    rfm = build(sys.argv[1])
    report(rfm)
    if "--write-sample" in sys.argv:
        here = os.path.dirname(os.path.abspath(__file__))
        write_sample(rfm, os.path.join(here, "..", "assets", "rfm-sample.js"))
