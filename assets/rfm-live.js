/* rfm-live.js - the RFM bench for learn-rfm-modeling-with-phoebe
 *
 * The same 4,000 real customers (a seeded sample of the public Olist dataset, see rfm-sample.js)
 * put through six ways of cutting R, F and M into segments. Every segment count, share and
 * revenue figure is computed here, in the browser, from those rows. Nothing is asserted.
 *
 * What is REAL: the customers, their recency, frequency and spend, every cut, every share,
 *   every "bought once" percentage, and the number of score codes each cut collapses together.
 * What is MODELLED, and labelled so on the widget: the campaign yield. It uses a stated
 *   response model (repeat buyers reactivate more, and respond more to a message, than one-time
 *   buyers) and a stated cost per message. Change either and the yield changes. The point the
 *   bench makes does not depend on the exact numbers: it depends on WHO is in the audience,
 *   and that part is measured.
 *
 * The cuts:
 *   mean       2x2x2 on the mean of each column (the classic eight-group taxonomy)
 *   median     2x2x2 on the median of each column
 *   klaviyo    Klaviyo's published rule: R by 180/365 days, F and M by rank terciles, six groups
 *   putler     rank quintiles, Putler's eleven-segment map
 *   threshold  business thresholds a merchant would actually write down
 *   sum        ANTI: one total score, R+F+M quintiles added, three bands
 */
(function (root) {
  "use strict";

  /* ---------- the response model, stated once ---------- */
  var MODEL = {
    organicSingle: 0.010,   // a lapsed one-time buyer reorders within 90 days without contact
    organicRepeat: 0.040,   // a lapsed repeat buyer does
    liftSingle: 1.15,       // a message multiplies that probability by this for one-time buyers
    liftRepeat: 1.50,       // and by this for repeat buyers
    costPerMessage: 0.30,   // BRL, an SMS-class cost
    holdout: 0.10           // share of the audience deliberately NOT messaged
  };

  /* ---------- helpers ---------- */
  function mean(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return a.length ? s / a.length : 0; }
  function median(a) {
    var b = a.slice().sort(function (x, y) { return x - y; });
    var m = b.length >> 1;
    return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2;
  }
  function pct(x) { return (x * 100).toFixed(2) + "%"; }
  function pct1(x) { return (x * 100).toFixed(1) + "%"; }
  function money(x) { return "R$ " + x.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

  /* rank into q equal bins, ties broken by original order (pandas rank method="first").
   * This is the tie rule every "fix the duplicate edges" recipe quietly relies on, and the
   * bench measures what it does to identical customers. labels[0] goes to the lowest values. */
  function rankBins(vals, q, labels) {
    var idx = vals.map(function (v, i) { return i; });
    idx.sort(function (a, b) { return vals[a] - vals[b] || a - b; });
    var out = new Array(vals.length);
    for (var k = 0; k < idx.length; k++) {
      var bin = Math.min(q - 1, Math.floor(k * q / idx.length));
      out[idx[k]] = labels[bin];
    }
    return out;
  }

  /* ---------- the cuts ---------- */

  var EIGHT = {
    "111": { name: "High value",         tag: "recent, frequent, big spend" },
    "101": { name: "Key develop",        tag: "recent, once, big spend" },
    "011": { name: "Key win-back",       tag: "gone quiet, frequent, big spend" },
    "001": { name: "Key potential",      tag: "gone quiet, once, big spend" },
    "110": { name: "General potential",  tag: "recent, frequent, small spend" },
    "100": { name: "General develop",    tag: "recent, once, small spend" },
    "010": { name: "General retain",     tag: "gone quiet, frequent, small spend" },
    "000": { name: "Low value",          tag: "gone quiet, once, small spend" }
  };

  function cutTwoByTwo(d, centre) {
    var cR = centre(d.R), cF = centre(d.F), cM = centre(d.M);
    var seg = new Array(d.n);
    for (var i = 0; i < d.n; i++) {
      var r = d.R[i] < cR ? "1" : "0";   /* recency reversed: fewer days is better */
      var f = d.F[i] > cF ? "1" : "0";
      var m = d.M[i] > cM ? "1" : "0";
      seg[i] = r + f + m;
    }
    return { seg: seg, names: function (c) { return EIGHT[c].name + " (" + c + ")"; },
             top: ["111"], winback: ["011"],
             centres: { R: cR, F: cF, M: cM } };
  }

  var KLAVIYO = {
    Champions: ["333", "332", "323"],
    Loyal: ["321", "322", "331", "232", "233"],
    Recent: ["312", "313", "311", "222", "223"],
    "Needs attention": ["213", "221", "123", "132", "133"],
    "At risk": ["231", "212", "122", "131", "211"],
    Inactive: ["111", "112", "113", "121"]
  };
  function cutKlaviyo(d) {
    var inv = {};
    Object.keys(KLAVIYO).forEach(function (k) { KLAVIYO[k].forEach(function (c) { inv[c] = k; }); });
    var Fk = rankBins(d.F, 3, [1, 2, 3]), Mk = rankBins(d.M, 3, [1, 2, 3]);
    var seg = new Array(d.n), codes = new Array(d.n);
    for (var i = 0; i < d.n; i++) {
      var Rk = d.R[i] <= 180 ? 3 : (d.R[i] <= 365 ? 2 : 1);
      var c = "" + Rk + Fk[i] + Mk[i];
      codes[i] = c;
      seg[i] = inv[c] || "Unmapped";
    }
    return { seg: seg, codes: codes, names: function (s) { return s; },
             top: ["Champions"], winback: ["Needs attention"] };
  }

  function putlerName(R, FM) {
    if (R >= 4 && FM >= 4) return "Champions";
    if (R >= 2 && FM >= 3) return "Loyal";
    if (R >= 3 && FM <= 3) return "Potential loyalist";
    if (R >= 4 && FM <= 1) return "New";
    if (R >= 3 && FM <= 1) return "Promising";
    if ((R === 2 || R === 3) && (FM === 2 || FM === 3)) return "Needs attention";
    if ((R === 2 || R === 3) && FM <= 2) return "About to sleep";
    if (R <= 2 && FM >= 2) return "At risk";
    if (R <= 1 && FM >= 4) return "Can't lose";
    if ((R === 1 || R === 2) && (FM === 1 || FM === 2)) return "Hibernating";
    return "Lost";
  }
  function quintiles(d) {
    return { Rq: rankBins(d.R, 5, [5, 4, 3, 2, 1]),
             Fq: rankBins(d.F, 5, [1, 2, 3, 4, 5]),
             Mq: rankBins(d.M, 5, [1, 2, 3, 4, 5]) };
  }
  function cutPutler(d) {
    var q = quintiles(d);
    var seg = new Array(d.n), codes = new Array(d.n);
    for (var i = 0; i < d.n; i++) {
      var FM = Math.round((q.Fq[i] + q.Mq[i]) / 2);
      seg[i] = putlerName(q.Rq[i], FM);
      codes[i] = "" + q.Rq[i] + q.Fq[i] + q.Mq[i];
    }
    return { seg: seg, codes: codes, names: function (s) { return s; },
             top: ["Champions"], winback: ["At risk", "Can't lose"], q: q };
  }

  /* The tutorial route: rank each column into fifths (1-5), then collapse a score above 3 to 1
   * and 3 or below to 0, and read the three bits as the same eight groups. A rank split at the
   * top two fifths of each axis, so it inherits the row-order scoring of a tied column. */
  function cutCollapse(d) {
    var q = quintiles(d);
    var seg = new Array(d.n), codes = new Array(d.n);
    for (var i = 0; i < d.n; i++) {
      seg[i] = (q.Rq[i] > 3 ? "1" : "0") + (q.Fq[i] > 3 ? "1" : "0") + (q.Mq[i] > 3 ? "1" : "0");
      codes[i] = "" + q.Rq[i] + q.Fq[i] + q.Mq[i];
    }
    return { seg: seg, codes: codes, names: function (c) { return EIGHT[c].name + " (" + c + ")"; },
             top: ["111"], winback: ["011"], q: q };
  }

  function cutThreshold(d) {
    var medM = median(d.M);
    var seg = new Array(d.n);
    for (var i = 0; i < d.n; i++) {
      var rec = d.R[i] <= 90 ? "recent" : (d.R[i] <= 365 ? "cooling" : "lapsed");
      var rep = d.F[i] >= 2;
      var big = d.M[i] >= medM;
      if (rec === "lapsed") seg[i] = rep ? "Lapsed repeat" : "Lapsed single";
      else if (rec === "cooling") seg[i] = rep ? "Cooling repeat" : "Cooling single";
      else seg[i] = rep ? "Recent repeat" : (big ? "Recent single, big basket" : "Recent single, small basket");
    }
    return { seg: seg, names: function (s) { return s; },
             top: ["Recent repeat"], winback: ["Lapsed repeat"], medM: medM };
  }

  function cutSum(d) {
    var q = quintiles(d);
    var seg = new Array(d.n), codes = new Array(d.n);
    for (var i = 0; i < d.n; i++) {
      var s = q.Rq[i] + q.Fq[i] + q.Mq[i];
      seg[i] = s >= 13 ? "Top band (13-15)" : (s >= 8 ? "Middle band (8-12)" : "Bottom band (3-7)");
      codes[i] = "" + q.Rq[i] + q.Fq[i] + q.Mq[i];
    }
    return { seg: seg, codes: codes, names: function (s) { return s; },
             top: ["Top band (13-15)"], winback: ["Middle band (8-12)"] };
  }

  var PRESETS = [
    { id: "mean", label: "Mean split, eight groups",
      note: "Above or below the average on each of R, F and M. The classic 2x2x2 taxonomy.",
      cut: function (d) { return cutTwoByTwo(d, mean); } },
    { id: "median", label: "Median split, eight groups",
      note: "Same eight groups, but the knife sits at the median. Half the customers are 'high' on each axis by construction.",
      cut: function (d) { return cutTwoByTwo(d, median); } },
    { id: "collapse", label: "Fifths, then collapse to eight",
      note: "Rank each column into fifths, call a score above 3 'high', read the bits as the same eight groups. The route most tutorials take.",
      cut: cutCollapse },
    { id: "klaviyo", label: "Klaviyo's rule, six groups",
      note: "Recency by calendar (180 and 365 days), frequency and spend by rank terciles. Thresholds as published in Klaviyo's help centre.",
      cut: cutKlaviyo },
    { id: "putler", label: "Quintiles into Putler's eleven",
      note: "Rank each column into fifths, then Putler's published eleven-segment map. The default in most tutorials.",
      cut: cutPutler },
    { id: "threshold", label: "Thresholds a merchant would write down",
      note: "Recent under 90 days, cooling under a year, lapsed after. Once, twice, three or more. Above or below the median basket.",
      cut: cutThreshold },
    { id: "sum", label: "One total score, R + F + M",
      note: "Add the three quintile scores into one number from 3 to 15 and band it. The tempting simplification.",
      cut: cutSum, anti: true }
  ];

  /* ---------- evaluation ---------- */

  function prepare(sample) {
    var n = sample.R.length, M = new Array(n);
    for (var i = 0; i < n; i++) M[i] = sample.Mc[i] / 100;
    return { n: n, R: sample.R, F: sample.F, M: M, snapshot: sample.snapshot };
  }

  function evaluate(d, preset) {
    var c = preset.cut(d);
    var totalRev = 0, i;
    for (i = 0; i < d.n; i++) totalRev += d.M[i];

    var groups = {};
    for (i = 0; i < d.n; i++) {
      var g = groups[c.seg[i]] || (groups[c.seg[i]] = { key: c.seg[i], n: 0, rev: 0, repeat: 0, codes: {} });
      g.n++; g.rev += d.M[i]; if (d.F[i] > 1) g.repeat++;
      if (c.codes) g.codes[c.codes[i]] = true;
    }
    var rows = Object.keys(groups).map(function (k) {
      var g = groups[k];
      return { key: k, name: c.names(k), n: g.n, share: g.n / d.n, revShare: g.rev / totalRev,
               repeatShare: g.repeat / g.n, onceShare: 1 - g.repeat / g.n,
               codes: Object.keys(g.codes).length,
               isTop: c.top.indexOf(k) >= 0, isWinback: c.winback.indexOf(k) >= 0 };
    }).sort(function (a, b) { return b.n - a.n; });

    function agg(keys) {
      var n = 0, rev = 0, rep = 0, codes = {};
      for (var j = 0; j < d.n; j++) {
        if (keys.indexOf(c.seg[j]) < 0) continue;
        n++; rev += d.M[j]; if (d.F[j] > 1) rep++;
        if (c.codes) codes[c.codes[j]] = true;
      }
      return { n: n, share: n / d.n, revShare: rev / totalRev, repeatShare: n ? rep / n : 0,
               onceShare: n ? 1 - rep / n : 0, codes: Object.keys(codes).length };
    }
    var top = agg(c.top), wb = agg(c.winback);

    /* the modelled campaign: message everyone in the win-back audience, hold out 10% */
    var treated = 0, incOrders = 0, incRev = 0;
    for (i = 0; i < d.n; i++) {
      if (c.winback.indexOf(c.seg[i]) < 0) continue;
      var rep = d.F[i] > 1;
      var organic = rep ? MODEL.organicRepeat : MODEL.organicSingle;
      var lift = rep ? MODEL.liftRepeat : MODEL.liftSingle;
      var aov = d.M[i] / d.F[i];
      var t = 1 - MODEL.holdout;            /* expected share of this customer that is messaged */
      treated += t;
      incOrders += t * (organic * lift - organic);
      incRev += t * (organic * lift - organic) * aov;
    }
    var cost = treated * MODEL.costPerMessage;
    var net = incRev - cost;

    return {
      preset: preset, cut: c, rows: rows, groups: rows.length, totalRev: totalRev,
      top: top, winback: wb,
      campaign: { messaged: Math.round(treated), heldOut: Math.round(wb.n * MODEL.holdout),
                  incOrders: incOrders, incRev: incRev, cost: cost, net: net,
                  perMessage: treated ? net / treated : 0 }
    };
  }

  function evaluateAll(sample) {
    var d = prepare(sample), out = {};
    PRESETS.forEach(function (p) { out[p.id] = evaluate(d, p); });
    return out;
  }

  /* ---------- UI ---------- */

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function metric(label, value, unit, kind) {
    return '<div class="mb-metric"><span class="mb-mlabel">' + esc(label) + "</span>" +
      '<span class="mb-mvalue">' + esc(value) + "</span>" +
      '<span class="mb-munit">' + esc(unit) + "</span>" +
      '<span class="mb-mkind is-' + kind + '">' + kind + "</span></div>";
  }

  function grade(r) {
    var p = r.preset;
    if (p.anti) {
      return ["bad", "One number hides " + r.winback.codes + " different score codes inside the win-back band, and " +
        pct1(r.winback.onceShare) + " of that audience bought exactly once"];
    }
    if (r.top.onceShare > 0.5) {
      return ["bad", pct1(r.top.onceShare) + " of the customers this cut calls its best bought exactly once. " +
        "The rank tie-break gave identical one-time buyers different scores"];
    }
    if (r.winback.repeatShare >= 0.99) {
      return ["good", "Every customer in the win-back audience is a proven repeat buyer. Small audience, dense with the people a win-back is for"];
    }
    return ["ok", pct1(r.top.onceShare) + " of the top group bought once; win-back audience is " +
      pct1(r.winback.repeatShare) + " repeat buyers"];
  }

  var rootEl, readout, table, current = "mean", results = null, btns = {}, data = null;

  function render() {
    var r = results[current];
    var g = grade(r);
    var cp = r.campaign;
    readout.innerHTML =
      '<div class="mb-verdict is-' + g[0] + '">' + esc(g[1]) +
        ' <span class="mb-mkind is-measured">measured</span></div>' +
      '<div class="mb-metrics">' +
        metric("Segments produced", r.groups, "non-empty groups", "measured") +
        metric("Top group", pct(r.top.share), "of customers, holding " + pct1(r.top.revShare) + " of revenue", "measured") +
        metric("Top group who bought once", pct1(r.top.onceShare), "exactly one delivered order", "measured") +
        metric("Win-back audience", r.winback.n, "customers, " + pct1(r.winback.repeatShare) + " repeat buyers", "measured") +
        metric("Net yield per message", "R$ " + cp.perMessage.toFixed(2), "after a 10% holdout and R$ 0.30 a message", "modelled") +
        metric("Net incremental revenue", money(cp.net), cp.incOrders.toFixed(1) + " extra orders expected", "modelled") +
      "</div>";

    var rows = r.rows.map(function (x) {
      var flag = x.isTop ? '<span class="mb-mkind is-measured">top</span>'
        : x.isWinback ? '<span class="mb-mkind is-heuristic">win-back</span>' : "";
      return "<tr><th>" + esc(x.name) + (x.codes ? "<em>" + x.codes + " score code" + (x.codes === 1 ? "" : "s") + "</em>" : "") + "</th>" +
        "<td>" + x.n + "</td><td>" + pct(x.share) + "</td><td>" + pct(x.revShare) + "</td>" +
        "<td>" + pct1(x.onceShare) + "</td><td>" + flag + "</td></tr>";
    }).join("");
    table.innerHTML =
      '<table class="dt-table"><thead><tr><th>Segment</th><th>Customers</th><th>Share</th>' +
      "<th>Revenue</th><th>Bought once</th><th></th></tr></thead><tbody>" + rows + "</tbody></table>" +
      '<p class="mb-hint">Segments, shares and revenue are computed from ' + data.n + " real customers. " +
      "The two yield figures use the response model printed under the bench: change it and they change; " +
      "who is in the audience does not.</p>";
  }

  function setPreset(id) {
    current = id;
    Object.keys(btns).forEach(function (k) {
      btns[k].classList.toggle("is-on", k === id);
      var i = btns[k].querySelector("input");
      if (i) i.checked = (k === id);
    });
    render();
  }

  function buildUI() {
    var panel = document.createElement("div");
    panel.className = "mb-presets";
    PRESETS.forEach(function (p) {
      var lab = document.createElement("label");
      lab.className = "mb-preset" + (p.anti ? " is-anti" : "");
      lab.innerHTML = '<input type="radio" name="rfm-p" value="' + p.id + '">' +
        '<span class="mb-pname">' + esc(p.label) +
        (p.anti ? ' <em class="mb-anti">simpler, and blind</em>' : "") + "</span>" +
        '<span class="mb-pnote">' + esc(p.note) + "</span>";
      panel.appendChild(lab);
      btns[p.id] = lab;
      lab.querySelector("input").addEventListener("change", function () { setPreset(p.id); });
    });

    var hint = document.createElement("p");
    hint.className = "mb-hint";
    hint.textContent = data.n + " real customers from the public Olist dataset, snapshot " + data.snapshot +
      ": days since last delivered order, delivered orders, total payments in BRL. " +
      "Response model for the two modelled figures: a lapsed one-time buyer reorders on their own 1.0% of the time and a message lifts that by 15%; " +
      "a lapsed repeat buyer reorders 4.0% of the time and a message lifts that by 50%; each message costs R$ 0.30; one in ten of the audience is held out and never messaged. " +
      "Those five numbers are assumptions and the widget says so. Everything else is counted.";

    readout = document.createElement("div"); readout.className = "mb-readout";
    table = document.createElement("div"); table.className = "dt-tablewrap";
    rootEl.appendChild(panel); rootEl.appendChild(hint); rootEl.appendChild(readout); rootEl.appendChild(table);
    setPreset("mean");
  }

  function init() {
    rootEl = document.getElementById("rfm-bench");
    if (!rootEl || !root.RFM_SAMPLE) return;
    data = prepare(root.RFM_SAMPLE);
    results = {};
    PRESETS.forEach(function (p) { results[p.id] = evaluate(data, p); });
    buildUI();
    root.RFM_LIVE = {
      presets: PRESETS.map(function (p) { return p.id; }),
      show: setPreset,
      results: results,
      model: MODEL,
      get current() { return current; }
    };
  }

  var api = { PRESETS: PRESETS, MODEL: MODEL, prepare: prepare, evaluate: evaluate, evaluateAll: evaluateAll, rankBins: rankBins };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})(typeof window !== "undefined" ? window : this);
