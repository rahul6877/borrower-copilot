# Borrower Copilot — Rules & Assumptions

## 1. Purpose

Borrower Copilot is a decision-support tool for borrowers in India. It estimates:

1. Whether the borrower should borrow, borrow less, or avoid borrowing.
2. A conservative safe borrowing amount.
3. An indicative lender capacity.
4. A fair interest-rate range.
5. A recommended maximum new EMI.
6. Tenure trade-offs.
7. A simple stress case.
8. An all-in borrowing cost and approximate APR.
9. A Negotiation Card for discussing loan pricing with lenders.

These outputs are estimates, not loan approvals, financial advice, or lender commitments.

---

## 2. Core affordability rules

| What                    |   Value | Why                                                                                                                        | Source       |
| ----------------------- | ------: | -------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Base FOIR limit         |     50% | Keeps total EMI burden below half of stated monthly income in the conservative model.                                      | My judgement |
| Safety buffer           |     90% | Applies an additional 10% reduction to the maximum calculated new EMI.                                                     | My judgement |
| Minimum income buffer   |     30% | Attempts to preserve at least 30% of monthly income after household expenses and existing EMIs before allowing a new loan. | My judgement |
| Default tenure          | 5 years | Provides a representative middle tenure for affordability calculations.                                                    | My judgement |
| Stress income reduction |     20% | Tests whether repayment remains manageable after a moderate income shock.                                                  | My judgement |

---

## 3. Safe borrowing amount

The conservative safe amount considers:

* Monthly income
* Existing monthly EMIs
* Household expenses
* Emergency savings
* A conservative FOIR limit
* A minimum income buffer
* The selected loan product's representative interest rate

The model does not assume that the maximum amount a lender might approve is automatically safe for the borrower.

### Emergency savings adjustment

| What                  |       Value | Why                                                                         | Source       |
| --------------------- | ----------: | --------------------------------------------------------------------------- | ------------ |
| Savings below 1 month |  80% factor | Very limited emergency reserves increase vulnerability to repayment shocks. | My judgement |
| Savings of 1–2 months |  90% factor | Some reserve exists, but the borrower remains exposed to income shocks.     | My judgement |
| Savings of 3+ months  | 100% factor | A larger reserve provides more repayment resilience.                        | My judgement |

Unknown savings are treated cautiously rather than as zero savings.

---

## 4. Indicative lender capacity

The application calculates:

**Indicative lender capacity = Conservative safe amount × 1.10**

The 10% uplift is only an illustrative comparison point. It is **not** a prediction of actual lender sanction.

### Why?

The purpose is to show the borrower that a lender's possible capacity and the borrower's conservative safe amount are not necessarily the same.

**Source: My judgement.**

---

## 5. Borrowing recommendation

The application can return three outcomes:

### Borrow

Used when the requested borrowing appears broadly consistent with the conservative affordability estimate and no major risk rule blocks borrowing.

### Borrow less

Used when:

* The requested amount is substantially above the conservative safe amount, or
* A business borrower's expected additional income is below the conservative EMI ceiling.

The model uses:

**Requested amount > Safe amount × 1.20**

as the threshold for a materially excessive request.

**Source: My judgement.**

### Don't borrow

Used when:

* Financial information is insufficient.
* Existing EMI burden exceeds the 50% FOIR limit.
* Household expenses and existing EMIs consume available income.
* Conservative safe borrowing capacity is zero.
* High-cost existing debt is combined with a recent missed payment.
* Significant outstanding debt is combined with high-cost debt or recent repayment problems.

These are safety-oriented rules rather than lender underwriting rules.

---

## 6. Business expected-income rule

For business borrowers, the application asks:

**"How much additional monthly income do you expect this loan to generate?"**

If expected additional income is below the conservative EMI ceiling, the recommendation can become:

**Borrow less**

### Why?

The application should not assume that projected business income will definitely materialize.

**Source: My judgement.**

---

## 7. Product rate bands

The following are illustrative product-level ranges used by the prototype:

| Loan type             | Minimum | Maximum | Source                                           |
| --------------------- | ------: | ------: | ------------------------------------------------ |
| Personal Loan         |   10.5% |     18% | My judgement — illustrative prototype assumption |
| Home Loan             |      8% |   10.5% | My judgement — illustrative prototype assumption |
| Loan Against Property |      9% |     13% | My judgement — illustrative prototype assumption |
| Gold Loan             |      9% |     18% | My judgement — illustrative prototype assumption |
| Two-wheeler Loan      |      9% |     16% | My judgement — illustrative prototype assumption |
| Business Loan         |     10% |     20% | My judgement — illustrative prototype assumption |
| Not sure              |   10.5% |     18% | My judgement — illustrative prototype assumption |

These are **not lender quotes** and should not be interpreted as guaranteed market offers.

The final rate depends on the lender, borrower profile, product, collateral, location, documentation, credit history, loan amount and other underwriting factors.

---

## 8. Credit-score adjustments

The model uses the following adjustments:

| What          |                             Value | Why                                                                              | Source       |
| ------------- | --------------------------------: | -------------------------------------------------------------------------------- | ------------ |
| Score ≥ 750   |             -1.0 percentage point | Stronger credit evidence can support better pricing.                             | My judgement |
| Score 700–749 |             -0.5 percentage point | Good credit evidence can modestly improve pricing.                               | My judgement |
| Score < 650   |            +1.5 percentage points | Lower score is treated as additional pricing risk.                               | My judgement |
| Unknown score | -0.5 pp minimum / +1.0 pp maximum | Unknown is treated as uncertainty, not as a poor score. The range becomes wider. | My judgement |

The prototype intentionally avoids treating an unknown credit score as a score of 300 or otherwise assuming bad credit.

---

## 9. Income stability adjustments

| What                           |   Value | Why                                                         | Source       |
| ------------------------------ | ------: | ----------------------------------------------------------- | ------------ |
| Highly unpredictable income    | +1.0 pp | Greater income uncertainty increases repayment risk.        | My judgement |
| Income varies by more than 25% | +0.5 pp | Material income variation makes repayment less predictable. | My judgement |

The app adapts the questionnaire based on income type.

For example:

* Salaried borrowers receive an employment-tenure question.
* Self-employed or informal borrowers receive an income-stability question.
* Self-employed borrowers receive a business-tenure question.

---

## 10. Existing EMI burden

Existing EMI burden is measured using:

**Existing FOIR = Existing monthly EMI / Monthly income**

| Existing FOIR | Rate adjustment | Why                             | Source       |
| ------------- | --------------: | ------------------------------- | ------------ |
| > 40%         |         +1.0 pp | High existing repayment burden. | My judgement |
| > 25%         |         +0.5 pp | Moderate repayment burden.      | My judgement |

An existing EMI burden above the base 50% FOIR limit can independently result in a **Don't borrow** recommendation.

---

## 11. Outstanding existing debt

The application asks for the total amount still owed across existing loans.

Outstanding debt is used as an additional debt-burden signal.

The model compares outstanding debt with annual stated income:

**Debt-to-annual-income = Outstanding debt / (Monthly income × 12)**

| Debt-to-annual-income |    Rate adjustment | Why                                                            | Source       |
| --------------------- | -----------------: | -------------------------------------------------------------- | ------------ |
| > 25%                 |            +0.5 pp | Significant outstanding debt relative to stated annual income. | My judgement |
| > 50%                 | Additional +0.5 pp | Higher outstanding debt indicates greater financial exposure.  | My judgement |

The model does not treat outstanding debt as equivalent to monthly EMI.

---

## 12. Missed-payment adjustment

If the borrower reports a recent missed or delayed payment:

**+1.0 percentage point**

is applied to the estimated fair-rate range.

### Why?

Recent repayment problems provide evidence of increased repayment risk.

**Source: My judgement.**

A combination of:

* Existing debt above 30%
* A recent missed payment
* Significant outstanding debt

can result in a **Don't borrow** recommendation.

---

## 13. Collateral and secured-product routing

For business/self-employed borrowers:

| Collateral              | Suggested route                               |
| ----------------------- | --------------------------------------------- |
| Property                | Loan Against Property / secured business loan |
| Gold                    | Gold Loan / secured borrowing                 |
| Another eligible asset  | Secured business loan                         |
| No collateral / unknown | Selected loan type or unsecured route         |

### Why?

A borrower with eligible collateral may have access to a secured borrowing structure that differs materially from an unsecured business loan.

The application does **not** guarantee approval, valuation or a lower rate.

**Source: My judgement.**

---

## 14. Collateral pricing adjustment

For business borrowers with eligible collateral:

**-1.0 percentage point**

is applied to both ends of the fair-rate range.

### Why?

Secured borrowing may carry different pricing from comparable unsecured borrowing.

**Source: My judgement.**

This is an illustrative adjustment, not a lender-specific pricing rule.

---

## 15. Age and tenure

The prototype uses the following tenure options:

| Age      | Tenure options | Why                                          | Source       |
| -------- | -------------- | -------------------------------------------- | ------------ |
| Under 55 | 3, 5, 7 years  | Provides a broad comparison.                 | My judgement |
| 55–64    | 3, 5 years     | Keeps the illustrative tenure range shorter. | My judgement |
| 65+      | 3 years        | Uses a shorter illustrative horizon.         | My judgement |

These rules are **not lender eligibility rules**.

Actual lender age limits and maximum tenures vary by product and lender.

---

## 16. EMI calculation

The application uses the standard reducing-balance EMI formula:

**EMI = P × r × (1+r)^n / ((1+r)^n - 1)**

Where:

* P = principal
* r = monthly interest rate
* n = number of monthly payments

Annual percentage rates are converted to monthly rates before the calculation.

If principal is zero, EMI is zero.

---

## 17. Tenure trade-off

The application compares 3-, 5- and 7-year options when permitted by the age rule.

For the same principal:

* Shorter tenure → higher monthly EMI and lower total interest.
* Longer tenure → lower monthly EMI and higher total interest.

The purpose is to help borrowers understand that reducing EMI by extending tenure can increase total borrowing cost.

---

## 18. All-in borrowing cost

The prototype uses an illustrative:

**Processing fee = 2% of requested principal**

The application calculates:

* Representative interest rate
* Processing fee
* Estimated EMI
* Estimated total interest
* Estimated total borrowing cost
* Approximate APR

### Important limitation

The 2% processing fee is an illustrative assumption and is **not a lender quote**.

Actual APR/all-in cost can also depend on other charges, taxes, insurance, documentation fees, late-payment charges and lender-specific terms.

---

## 19. Approximate APR

The application estimates APR by considering the processing fee as a reduction in the amount received by the borrower.

This is intended to demonstrate why:

**APR / all-in cost can be higher than the headline interest rate.**

It is an approximation for the prototype and should not be represented as an official lender-issued APR or Key Facts Statement.

---

## 20. Stress test

The application reduces stated monthly income by:

**20%**

It then calculates stressed FOIR using:

**(Existing EMI + recommended new EMI) / stressed monthly income**

### Why?

The stress case demonstrates how repayment affordability can change if income temporarily falls.

**Source: My judgement.**

---

## 21. Confidence

Confidence is based on how much useful borrower information is known.

Signals include:

* Known credit score
* Income stability information
* Employment/business tenure
* Emergency savings

The confidence levels are:

* **High**
* **Medium**
* **Low**

Unknown information should generally widen uncertainty rather than automatically making the borrower appear risky.

---

## 22. Adaptive questions

The application uses conditional questions so different borrowers do not receive exactly the same questionnaire.

Examples:

### Salaried borrower

May receive:

* Current employer tenure

### Self-employed borrower

May receive:

* Income stability
* Business tenure
* Collateral availability

### Borrower with existing EMIs

May receive:

* Recent missed/delayed payment
* Outstanding debt
* Highest existing loan rate

### Business borrower

May receive:

* Expected additional monthly income
* Collateral availability

Each adaptive question is intended to change an output such as:

* Recommendation
* Safe amount
* Fair-rate range
* Product route
* Confidence
* Stress/affordability assessment

---

## 23. Persona assumptions

### Priya

The prototype uses:

* Age: 29
* Salaried software engineer
* Monthly net income: ₹1,10,000
* Existing EMI: ₹14,000
* Household expense/rent input: ₹28,000
* Credit score: 780
* Emergency savings: 3+ months
* Employer tenure: 5 years
* Personal loan request: ₹8,00,000

The persona does not provide the exact existing loan interest rate, so any value entered for that adaptive question is an explicit test assumption.

---

### Ravi

The prototype uses:

* Age: 42
* Self-employed kirana owner
* Monthly income input: ₹60,000
* Existing EMI: ₹0
* Household expenses: ₹35,000
* Credit score: Unknown
* Emergency savings: 1–2 months
* Variable/seasonal income
* Business tenure: 14 years
* Property collateral: No
* Expected additional monthly income: ₹20,000
* Business loan request: ₹15,00,000

₹60,000 is used as a midpoint of the stated ₹40,000–₹80,000 income range for the prototype.

---

### Anita

The prototype uses:

* Age: 35
* Informal delivery rider + home tailoring
* Monthly income input: ₹28,000
* Existing EMI: ₹0
* Household expenses: ₹22,000
* Credit score: Unknown
* Emergency savings: Less than 1 month
* Variable/seasonal income
* Recent missed payment: Yes, once
* Outstanding debt: ₹35,000
* Highest existing loan rate: Above 30%
* Two-wheeler loan request: ₹1,50,000

₹28,000 is used as a midpoint of the stated ₹26,000–₹30,000 monthly income range.

---

## 24. Important limitations

Borrower Copilot does not:

* Pull credit-bureau data.
* Verify income.
* Verify expenses.
* Verify collateral ownership or valuation.
* Guarantee lender approval.
* Guarantee a rate.
* Guarantee that projected business income will occur.
* Store personal borrower information.
* Replace lender underwriting.
* Provide regulated financial advice.

All outputs should therefore be presented as **decision-support estimates**.

---

## 25. Design principle

The product intentionally separates:

**What a lender might approve**

from

**What the borrower can conservatively afford.**

The borrower should use the **conservative safe amount and recommended EMI ceiling as the primary reference**, rather than treating indicative lender capacity as an approval promise.
