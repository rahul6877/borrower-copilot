# Borrower Copilot

A simple, explainable financial decision-support tool for Indian borrowers.

Borrower Copilot helps a borrower answer four questions:

1. Should I borrow at all?
2. How much can I safely borrow?
3. What interest rate is reasonable for my profile?
4. What EMI should I agree to?

It also generates a one-page **Negotiation Card** that the borrower can use when comparing lender offers.

---

## How to Run

### Requirements

* Node.js 18+
* npm
* A modern web browser

### Installation

Open a terminal in the project folder and run:

```bash
npm install
```

### Start the application

```bash
npm run dev
```

Then open the local URL shown in the terminal, usually:

```text
http://localhost:5173/
```

No backend, database, login, or external API is required.

---

## What the Application Does

### 1. Borrowing Recommendation

The application recommends one of:

* **Borrow**
* **Borrow less**
* **Don't borrow**

The recommendation is based on affordability, existing EMI burden, household expenses, repayment stress, and other borrower information.

---

### 2. Safe Borrowing Amount

The application shows two separate amounts:

* **Safe amount** — the primary borrower-focused reference.
* **Indicative lender capacity** — an illustrative estimate that is not a guaranteed sanction.

The safe amount considers:

* Monthly income
* Existing EMIs
* Household expenses
* Emergency savings
* A conservative affordability buffer
* Indicative product interest rates
* Loan tenure

---

### 3. Fair Interest Rate

The application produces a rate **band**, rather than pretending to know the exact lender rate.

The band considers factors such as:

* Credit score
* Income stability
* Existing EMI burden
* Outstanding debt
* Recent missed payments
* Whether collateral is available
* Selected loan product

The rate ranges used in the prototype are clearly documented in `RULES.md`.

---

### 4. EMI Ceiling

The application calculates a conservative monthly EMI ceiling.

The borrower should use this as a planning limit rather than treating the maximum amount a lender offers as the amount they should borrow.

---

### 5. Tenure Trade-off

The application compares different loan tenures.

A shorter tenure generally means:

* Higher monthly EMI
* Lower total interest

A longer tenure generally means:

* Lower monthly EMI
* Higher total interest

The application shows these trade-offs numerically.

---

### 6. All-in Cost and APR

The application provides an illustrative loan example showing:

* Representative interest rate
* Processing fee
* Monthly EMI
* Total interest
* Total cost
* Approximate APR

This is intended to encourage borrowers to compare the complete cost of borrowing rather than only the advertised interest rate.

---

### 7. Stress Case

The application tests a **20% reduction in monthly income**.

It then shows the resulting stressed FOIR so the borrower can understand how repayment could look under financial pressure.

---

### 8. Negotiation Card

The Negotiation Card summarizes:

* Fair rate range
* Safe borrowing amount
* EMI ceiling
* Reasons supporting the rate range
* Questions to ask the lender

The card is designed to be useful when comparing or negotiating an actual loan offer.

---

## Adaptive Questions

The application starts with a small set of core questions and asks additional questions only when relevant.

Examples:

* Salaried borrowers are asked about current employer tenure.
* Self-employed borrowers are asked about business tenure and income stability.
* Borrowers with existing EMIs are asked about repayment history and existing debt.
* Business borrowers are asked about expected additional income.
* Business borrowers with potential collateral are asked about the type of collateral.

The goal is to avoid asking every borrower the same long questionnaire.

---

## Core Design Principles

### Borrower affordability ≠ lender eligibility

A lender may approve an amount that is higher than what is financially comfortable for the borrower.

Therefore:

> **Safe amount and EMI ceiling are the primary borrower-focused references.**

The indicative lender capacity is shown separately and is explicitly described as illustrative.

### Unknown information is not treated as bad information

For example, an unknown credit score does not automatically mean a poor credit score.

Instead, uncertainty results in wider or more cautious estimates.

### Explainability

Every major output is accompanied by an explanation of why the number or recommendation was produced.

The detailed rules, thresholds, assumptions, and their rationale are documented in:

`RULES.md`

---

## Persona Testing

The application was tested using three borrower personas.

### Priya

* 29 years old
* Salaried software engineer
* Monthly income: ₹1,10,000
* Existing EMI: ₹14,000
* Household expenses: ₹28,000
* Credit score: 780
* Emergency savings: 3+ months
* Wants ₹8 lakh personal loan for a wedding

Expected outcome:

**Borrow**

---

### Ravi

* 42 years old
* Self-employed kirana business owner
* Monthly income assumption: ₹60,000 midpoint
* Existing EMI: ₹0
* Household expenses: ₹35,000
* Credit score: unknown
* Emergency savings: 1–2 months
* Highly variable income
* Business tenure: 14 years
* Wants ₹15 lakh business loan
* Expected additional monthly income: ₹20,000
* Collateral assumption used in the documented test: no usable collateral

Expected outcome:

**Borrow less**

---

### Anita

* 35 years old
* Informal delivery rider and home tailor
* Monthly income assumption: ₹28,000 midpoint
* Existing EMI: ₹0
* Household expenses: ₹22,000
* Credit score: unknown
* Emergency savings: less than 1 month
* Highly variable income
* Recent missed payment
* Outstanding debt: ₹35,000
* Existing high-cost debt above 30%
* Wants ₹1.5 lakh for an electric two-wheeler

Expected outcome:

**Don't borrow**

---

## Important Limitations

This is a prototype decision-support tool, not a lender underwriting system.

It does not:

* Pull a credit bureau report
* Verify income
* Verify expenses
* Verify documents
* Guarantee loan approval
* Guarantee a lender's interest rate
* Guarantee a lender's sanction amount
* Store personal borrower data
* Replace professional financial advice

The rate bands, FOIR thresholds, safety buffers, processing fee assumption, and other financial assumptions are documented as prototype assumptions in `RULES.md`.

Actual lender pricing and eligibility can vary significantly.

---

## Project Structure

```text
borrower-copilot/
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── rules.js
│   └── ...
├── RULES.md
├── README.md
├── package.json
└── ...
```

---

## Technology

* React
* Vite
* JavaScript
* CSS

The financial decision logic is separated into `src/rules.js` so that the assumptions can be reviewed independently from the user interface.

---

## Future Improvements

If more development time were available, the next improvements would be:

1. Add more product-specific pricing assumptions with stronger source documentation.
2. Improve secured-vs-unsecured product comparison.
3. Add lender-offer comparison functionality.
4. Allow borrowers to enter an actual lender quote and compare it against the Negotiation Card.
5. Add more detailed repayment-stress scenarios.
6. Improve accessibility and mobile interaction.
7. Add automated unit tests for the financial rules.
8. Add clearer visual indicators for uncertainty and confidence.

---

## Disclaimer

Borrower Copilot provides illustrative financial estimates based on user-provided information and prototype assumptions.

It is not a lender, financial institution, credit bureau, or financial advisor.

Actual loan eligibility, pricing, fees, APR, and sanction amount depend on the lender's underwriting policies and verified borrower information.
