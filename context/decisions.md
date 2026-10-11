# VCHUKI — Decision Log

> Read by every agent, and by `/vchuki-ceo` first.
>
> Two jobs. It stops agents re-litigating settled questions, and it stops you
> re-deciding the same thing every three weeks having forgotten why you chose.
>
> Add a row when you decide something that would be expensive to reverse.
> Add a row when you consciously decide *not* to do something — that is half the value.

---

## Decisions made

| Date | Decision | Why | Revisit when |
|---|---|---|---|
| | | | |

**Format that works:**

```
2026-08-04 | Prepaid gets 5% off, COD does not
           | Prepaid order worth ~₹61 more (RTO 2% vs 26%); discount costs ₹40; net +₹21
           | Revisit if prepaid share passes 60% or COGS changes
```

---

## Consciously not doing

The tempting things you have decided to skip, and why. Without this you will
rediscover each one every month.

| Date | Not doing | Why | Revisit when |
|---|---|---|---|
| | | | |

---

## This week's one thing

A solo founder does one thing per week, not six. `/vchuki-ceo` sets this.

**Week of:** 2026-08-05

**Priority:** Clear the order backlog. All 5 orders ever placed (oldest from 2026-07-07) are still `paymentStatus: pending` / `shippingStatus: pending` — nothing has ever been confirmed or dispatched. No payment webhook exists; confirmation is manual-only by design (see `app/api/orders/route.ts`) and it isn't happening.

**Done looks like:** Every one of the 5 orders is either confirmed+dispatched or refunded/cancelled with the customer told why. A same-day rule exists for future orders (check the admin panel every morning, or build the Razorpay webhook).

**Owner:** `/vchuki-ops` for the backlog and the daily habit; `/vchuki-dev` if the webhook gets built instead.

---

## Previous weeks

| Week | Priority | Finished? | What actually happened |
|---|---|---|---|
| | | | |

The last column is the honest one. If priorities keep not finishing, they are too
big — that is a signal about scoping, not about effort.

---

## Standing constraints

Facts every agent should treat as fixed unless you change them here.

- One person, no employees. Hours are the binding constraint, not ideas.
- Jodhpur-based. Production is local and small-batch.
- No paid ad budget until contribution margin per order is confirmed positive.
- Nothing ships COD without confirmation once the dispatch gate is built.
- Fabric composition is stated honestly everywhere, including where it costs a sale.
