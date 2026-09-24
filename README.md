<!-- learn-with-phoebe hub banner -->
> ### 📚 Part of [**Learn with Phoebe**](https://phoebefu6.github.io/learn-with-phoebe/)
> The shelf of free, hands-on courses on AI, data, and the craft around them. **[Browse every course ↗](https://phoebefu6.github.io/learn-with-phoebe/)**
<!-- /learn-with-phoebe hub banner -->

# Learn RFM Modeling with Phoebe

Six 45-minute sessions on recency, frequency and monetary value as a decision system: where the
knife goes, what each cut does to a real skewed customer base, which dimension to swap or add
when most people on a platform never buy, how to turn a segment into an action and prove the
action worked, and how to keep the model alive. Python build-alongs on real public data.

**Live site:** https://phoebefu6.github.io/learn-rfm-modeling-with-phoebe/

| # | Session | Signature thing |
|---|---|---|
| 1 | Three numbers and a snapshot date | One customer becomes three numbers; the eight-group taxonomy as a mechanism |
| 2 | The cut decides the segment | Mean, median, tercile, quintile and threshold on the same skewed pile |
| 3 | The RFM bench | Seven cuts on 4,000 real customers, every share counted in the browser |
| 4 | Beyond purchase | Engagement, live-room loyalty and referral as dimensions, on Taobao, Douyin and Pinduoduo |
| 5 | From segment to action, and proving it | The action table per group, and the holdout that tells a lift from a coincidence |
| 6 | Keep it alive | Cadence, drift, the one-page RFM spec, and when to hand off to CLV or clustering |

The bench in session 3 (`assets/rfm-live.js`) holds a seeded sample of 4,000 real customers from
the public Olist marketplace dataset and puts them through seven ways of cutting R, F and M. On a
base where 97% of customers bought exactly once, two vendor default maps name 13 to 16 percent of
customers Champions, and nine in ten of those Champions bought once. The mean-split top group is
1 percent of customers and none of them bought once. Same people, different knife.

Every segment count, share and revenue figure is computed from the rows. The two campaign-yield
figures use a response model the widget prints in full and labels as modelled.

Data: Brazilian E-Commerce Public Dataset by Olist (Kaggle, CC BY-NC-SA 4.0).

by Phoebe Fu
