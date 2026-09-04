// ============================================
// BORROWER COPILOT - FINANCIAL RULES ENGINE
// ============================================

// These rules are intentionally simple and explainable.
// They are not a lender's actual underwriting model.


// --------------------------------------------
// 1. FOIR LIMIT
// --------------------------------------------

// FOIR = (Existing EMIs + New EMI) / Monthly Income
//
// We use a base maximum FOIR of 50%.
//
// This is a judgement-based affordability assumption,
// not a guaranteed lender approval threshold.

const BASE_FOIR_LIMIT = 0.50;


// --------------------------------------------
// 2. EMI SAFETY BUFFER
// --------------------------------------------

// We don't recommend using the entire theoretical
// borrowing capacity.
//
// We apply a 10% safety buffer.

const SAFETY_BUFFER = 0.90;


// --------------------------------------------
// 3. DEFAULT TENURE
// --------------------------------------------

const DEFAULT_TENURE_YEARS = 5;


// --------------------------------------------
// 4. INTEREST RATE BANDS
// --------------------------------------------

// Illustrative product-level ranges.
// These are NOT lender quotes.

const RATE_BANDS = {
  "Personal Loan": {
    min: 10.5,
    max: 18.0,
  },

  "Home Loan": {
    min: 8.0,
    max: 10.5,
  },

  "Loan Against Property": {
    min: 9.0,
    max: 13.0,
  },

  "Gold Loan": {
    min: 9.0,
    max: 18.0,
  },

  "Two-wheeler Loan": {
    min: 9.0,
    max: 16.0,
  },

  "Business Loan": {
    min: 10.0,
    max: 20.0,
  },

  "Not sure": {
    min: 10.5,
    max: 18.0,
  },
};


// --------------------------------------------
// 5. MONTHLY EMI CALCULATOR
// --------------------------------------------

function calculateEMI(
  principal,
  annualRate,
  tenureYears
) {
  if (principal <= 0) {
    return 0;
  }

  const monthlyRate =
    annualRate / 12 / 100;

  const months =
    tenureYears * 12;

  // Handle zero-interest case safely.
  if (monthlyRate === 0) {
    return Math.round(
      principal / months
    );
  }

  const emi =
    (
      principal *
      monthlyRate *
      Math.pow(
        1 + monthlyRate,
        months
      )
    ) /
    (
      Math.pow(
        1 + monthlyRate,
        months
      ) - 1
    );

  return Math.round(emi);
}


// --------------------------------------------
// 6. MAXIMUM NEW EMI
// --------------------------------------------

function calculateMaxNewEMI(answers) {
  const income =
    Number(answers.monthlyIncome) || 0;

  const existingEMI =
    Number(answers.existingEMI) || 0;

  if (income <= 0) {
    return 0;
  }

  const maximumTotalEMI =
    income * BASE_FOIR_LIMIT;

  const theoreticalNewEMI =
    maximumTotalEMI -
    existingEMI;

  if (theoreticalNewEMI <= 0) {
    return 0;
  }

  return Math.round(
    theoreticalNewEMI *
    SAFETY_BUFFER
  );
}


// --------------------------------------------
// 7. SAFE BORROWING AMOUNT
// --------------------------------------------

function calculateSafeAmount(answers) {
  const income =
    Number(answers.monthlyIncome) || 0;

  const existingEMI =
    Number(answers.existingEMI) || 0;

  const expenses =
    Number(answers.householdExpenses) || 0;

  const emergencySavings =
    Number(answers.emergencySavings) || 0;

  if (income <= 0) {
    return 0;
  }


  // ------------------------------------------
  // STEP 1: FOIR capacity
  // ------------------------------------------

  const maximumTotalEMI =
    income *
    BASE_FOIR_LIMIT;

  const foirBasedNewEMI =
    maximumTotalEMI -
    existingEMI;

  if (foirBasedNewEMI <= 0) {
    return 0;
  }

  const safeEMIFromFOIR =
    foirBasedNewEMI *
    SAFETY_BUFFER;


  // ------------------------------------------
  // STEP 2: Household cash-flow capacity
  // ------------------------------------------

  const remainingAfterExpenses =
    income -
    expenses -
    existingEMI;

  if (remainingAfterExpenses <= 0) {
    return 0;
  }

  // Keep at least 30% of income available
  // after essential expenses and EMIs.

  const minimumMonthlyBuffer =
    income * 0.30;

  const cashFlowBasedNewEMI =
    remainingAfterExpenses -
    minimumMonthlyBuffer;

  if (cashFlowBasedNewEMI <= 0) {
    return 0;
  }


  // ------------------------------------------
  // STEP 3: Conservative EMI
  // ------------------------------------------

  let safeNewEMI =
    Math.min(
      safeEMIFromFOIR,
      cashFlowBasedNewEMI
    );


  // ------------------------------------------
  // STEP 4: Emergency savings
  // ------------------------------------------

  let savingsFactor = 1.0;

  if (emergencySavings < 1) {
    savingsFactor = 0.80;
  } else if (emergencySavings < 3) {
    savingsFactor = 0.90;
  } else {
    savingsFactor = 1.00;
  }

  safeNewEMI *=
    savingsFactor;


  // ------------------------------------------
  // STEP 5: Convert EMI to principal
  // ------------------------------------------

  const loanType =
    answers.loanType ||
    "Not sure";

  const rateBand =
    RATE_BANDS[loanType] ||
    RATE_BANDS["Not sure"];

  const assumedRate =
    (
      rateBand.min +
      rateBand.max
    ) / 2;

  const monthlyRate =
    assumedRate / 12 / 100;

  const months =
    DEFAULT_TENURE_YEARS * 12;

  let principal;

  if (monthlyRate === 0) {
    principal =
      safeNewEMI *
      months;
  } else {
    principal =
      safeNewEMI *
      (
        (
          Math.pow(
            1 + monthlyRate,
            months
          ) - 1
        ) /
        (
          monthlyRate *
          Math.pow(
            1 + monthlyRate,
            months
          )
        )
      );
  }

  return Math.round(
    principal
  );
}


// --------------------------------------------
// 8. INDICATIVE LENDER CAPACITY
// --------------------------------------------

function calculateLikelySanction(answers) {
  const safeAmount =
    calculateSafeAmount(answers);

  if (safeAmount <= 0) {
    return 0;
  }

  // This is NOT a guaranteed lender sanction.
  // It is an illustrative estimate before
  // lender-specific underwriting.

  return Math.round(
    safeAmount * 1.10
  );
}


// --------------------------------------------
// 9. FAIR INTEREST RATE
// --------------------------------------------

function calculateFairRate(answers) {
  const loanType =
    answers.loanType ||
    "Not sure";

  const band =
    RATE_BANDS[loanType] ||
    RATE_BANDS["Not sure"];

  let minRate =
    band.min;

  let maxRate =
    band.max;


  // ------------------------------------------
  // CREDIT SCORE
  // ------------------------------------------

  const creditScore =
    answers.creditScore;

  if (
    creditScore !== "unknown" &&
    creditScore !== undefined &&
    creditScore !== ""
  ) {
    const score =
      Number(creditScore);

    if (score >= 750) {
      minRate -= 1.0;
      maxRate -= 1.0;

    } else if (score >= 700) {
      minRate -= 0.5;
      maxRate -= 0.5;

    } else if (score < 650) {
      minRate += 1.5;
      maxRate += 1.5;
    }

  } else {
    // Unknown score means less evidence,
    // NOT a poor score.

    minRate -= 0.5;
    maxRate += 1.0;
  }


  // ------------------------------------------
  // INCOME STABILITY
  // ------------------------------------------

  if (
    answers.incomeStability ===
    "Highly unpredictable"
  ) {
    minRate += 1.0;
    maxRate += 1.0;
  }

  if (
    answers.incomeStability ===
    "Variable — varies by more than 25%"
  ) {
    minRate += 0.5;
    maxRate += 0.5;
  }


  // ------------------------------------------
  // MISSED PAYMENT
  // ------------------------------------------

  if (
    answers.missedPayment ===
      "Yes, once" ||
    answers.missedPayment ===
      "Yes, more than once"
  ) {
    minRate += 1.0;
    maxRate += 1.0;
  }


  // ------------------------------------------
  // EXISTING EMI BURDEN
  // ------------------------------------------

  const income =
    Number(answers.monthlyIncome) || 0;

  const existingEMI =
    Number(answers.existingEMI) || 0;

  if (income > 0) {
    const existingFOIR =
      existingEMI /
      income;

    if (existingFOIR > 0.40) {
      minRate += 1.0;
      maxRate += 1.0;

    } else if (existingFOIR > 0.25) {
      minRate += 0.5;
      maxRate += 0.5;
    }
  }


  // ------------------------------------------
  // OUTSTANDING DEBT
  // ------------------------------------------
  // Outstanding debt is treated as an additional
  // debt-burden signal. It does not mean the
  // borrower is automatically risky.

  const outstandingDebt =
    Number(
      answers.outstandingDebt
    ) || 0;

  if (
    income > 0 &&
    outstandingDebt > 0
  ) {
    const annualIncome =
      income * 12;

    const debtToAnnualIncome =
      outstandingDebt /
      annualIncome;

    // Debt above roughly 25% of annual
    // stated income widens pricing risk.
    if (
      debtToAnnualIncome > 0.25
    ) {
      minRate += 0.5;
      maxRate += 0.5;
    }

    // Higher outstanding debt gets
    // an additional adjustment.
    if (
      debtToAnnualIncome > 0.50
    ) {
      minRate += 0.5;
      maxRate += 0.5;
    }
  }


  // ------------------------------------------
  // SECURED COLLATERAL BENEFIT
  // ------------------------------------------

  const collateral =
    answers.collateral;

  const hasCollateral =
    collateral ===
      "Yes — property" ||
    collateral ===
      "Yes — gold" ||
    collateral ===
      "Yes — another eligible asset";

  const isBusinessBorrower =
    answers.incomeType ===
      "Self-employed" ||
    answers.loanPurpose ===
      "Business" ||
    answers.loanType ===
      "Business Loan";

  if (
    isBusinessBorrower &&
    hasCollateral
  ) {
    minRate -= 1.0;
    maxRate -= 1.0;
  }


  // ------------------------------------------
  // KEEP RANGE VALID
  // ------------------------------------------

  minRate =
    Math.max(
      1,
      minRate
    );

  maxRate =
    Math.max(
      minRate + 0.5,
      maxRate
    );

  return {
    min:
      Number(
        minRate.toFixed(1)
      ),

    max:
      Number(
        maxRate.toFixed(1)
      ),
  };
}


// --------------------------------------------
// 10. PRODUCT ROUTING
// --------------------------------------------

function getProductRecommendation(answers) {
  const collateral =
    answers.collateral;

  const isBusinessBorrower =
    answers.incomeType ===
      "Self-employed" ||
    answers.loanPurpose ===
      "Business" ||
    answers.loanType ===
      "Business Loan";


  // ------------------------------------------
  // PROPERTY
  // ------------------------------------------

  if (
    isBusinessBorrower &&
    collateral ===
      "Yes — property"
  ) {
    return {
      product:
        "Loan Against Property / secured business loan",

      reason:
        "You have indicated that property is available as collateral. A secured route may offer a more suitable borrowing structure and potentially lower pricing than an unsecured business loan, subject to lender valuation and eligibility.",
    };
  }


  // ------------------------------------------
  // GOLD
  // ------------------------------------------

  if (
    isBusinessBorrower &&
    collateral ===
      "Yes — gold"
  ) {
    return {
      product:
        "Gold Loan / secured borrowing",

      reason:
        "You have indicated that gold is available as collateral. A secured gold-based route may be worth comparing with an unsecured business loan, subject to lender terms and eligible gold value.",
    };
  }


  // ------------------------------------------
  // OTHER ASSET
  // ------------------------------------------

  if (
    isBusinessBorrower &&
    collateral ===
      "Yes — another eligible asset"
  ) {
    return {
      product:
        "Secured business loan",

      reason:
        "You have indicated that another eligible asset may be available as collateral. Compare secured business borrowing with an unsecured option because collateral can affect pricing and borrowing structure.",
    };
  }


  // ------------------------------------------
  // NO COLLATERAL
  // ------------------------------------------

  if (
    isBusinessBorrower &&
    (
      collateral === "No" ||
      collateral === "Not sure"
    )
  ) {
    return {
      product:
        answers.loanType ||
        "Unsecured borrowing",

      reason:
        "No usable collateral has been identified, so the assessment does not route you toward a secured product.",
    };
  }


  // ------------------------------------------
  // NORMAL LOAN
  // ------------------------------------------

  return {
    product:
      answers.loanType ||
      "Not sure",

    reason:
      "The suggested route is based on the loan type selected and the borrower information provided.",
  };
}


// --------------------------------------------
// 11. BORROW / BORROW LESS / DON'T BORROW
// --------------------------------------------

function calculateBorrowDecision(answers) {
  const income =
    Number(answers.monthlyIncome) || 0;

  const amountWanted =
    Number(answers.amountWanted) || 0;

  const existingEMI =
    Number(answers.existingEMI) || 0;

  const expenses =
    Number(answers.householdExpenses) || 0;

  const highestLoanRate =
    answers.highestLoanRate;

  const missedPayment =
    answers.missedPayment;

  const outstandingDebt =
    Number(
      answers.outstandingDebt
    ) || 0;


  if (
    income <= 0 ||
    amountWanted <= 0
  ) {
    return {
      decision:
        "Don't borrow",

      reason:
        "There is not enough financial information to establish an affordable borrowing level.",
    };
  }


  const safeAmount =
    calculateSafeAmount(answers);


  // ------------------------------------------
  // Requested amount substantially above
  // conservative amount
  // ------------------------------------------

  if (
    safeAmount > 0 &&
    amountWanted >
      safeAmount * 1.20
  ) {
    return {
      decision:
        "Borrow less",

      reason:
        "The amount requested is substantially above the conservative amount that appears affordable from your current income and EMI burden.",
    };
  }


  // ------------------------------------------
  // Existing EMI exceeds FOIR
  // ------------------------------------------

  if (
    existingEMI >
    income *
      BASE_FOIR_LIMIT
  ) {
    return {
      decision:
        "Don't borrow",

      reason:
        "Your existing EMI burden is already high relative to your monthly income.",
    };
  }


  // ------------------------------------------
  // Expenses consume available income
  // ------------------------------------------

  const remainingIncome =
    income -
    expenses -
    existingEMI;

  if (
    remainingIncome <= 0
  ) {
    return {
      decision:
        "Don't borrow",

      reason:
        "Your stated household expenses and existing EMIs already consume your available monthly income.",
    };
  }


  // ------------------------------------------
  // No conservative capacity
  // ------------------------------------------

  if (
    safeAmount <= 0
  ) {
    return {
      decision:
        "Don't borrow",

      reason:
        "The current information does not support a positive conservative borrowing capacity.",
    };
  }


  // ------------------------------------------
  // High-cost existing debt + delay
  // ------------------------------------------

  if (
    highestLoanRate ===
      "Above 30%" &&
    (
      missedPayment ===
        "Yes, once" ||
      missedPayment ===
        "Yes, more than once"
    )
  ) {
    return {
      decision:
        "Don't borrow",

      reason:
        "You already have very high-cost debt and a recent delayed payment. Taking on additional borrowing could increase repayment stress. Consider reducing or restructuring existing high-cost debt first.",
    };
  }


  // ------------------------------------------
  // OUTSTANDING DEBT + REPAYMENT STRESS
  // ------------------------------------------

  if (
    outstandingDebt > 0 &&
    income > 0
  ) {
    const monthlyIncome =
      income;

    const debtToMonthlyIncome =
      outstandingDebt /
      monthlyIncome;

    const hasRecentMissedPayment =
      missedPayment ===
        "Yes, once" ||
      missedPayment ===
        "Yes, more than once";

    const hasHighCostDebt =
      highestLoanRate ===
      "Above 30%";

    // If outstanding debt is more than
    // one month of income and repayment
    // history or pricing is already risky,
    // avoid adding another loan.
    if (
      debtToMonthlyIncome > 1 &&
      (
        hasRecentMissedPayment ||
        hasHighCostDebt
      )
    ) {
      return {
        decision:
          "Don't borrow",

        reason:
          "Your outstanding debt is significant relative to your monthly income, and your existing repayment profile shows additional stress. Consider reducing existing debt before taking on another loan.",
      };
    }
  }


  // ------------------------------------------
  // BUSINESS EXPECTED-INCOME CHECK
  // ------------------------------------------

  const isBusinessBorrower =
    answers.loanPurpose ===
      "Business" ||
    answers.loanType ===
      "Business Loan";

  if (isBusinessBorrower) {
    const expectedIncome =
      Number(
        answers.expectedIncome
      ) || 0;

    const proposedEMI =
      calculateEMICeiling(
        answers
      );

    if (
      expectedIncome > 0 &&
      proposedEMI > 0 &&
      expectedIncome <
        proposedEMI
    ) {
      return {
        decision:
          "Borrow less",

        reason:
          "The additional monthly income you expect from the loan is below the conservative EMI ceiling. Consider borrowing less so repayment does not depend too heavily on optimistic future income.",
      };
    }
  }


  // ------------------------------------------
  // OTHERWISE BORROW
  // ------------------------------------------

  return {
    decision:
      "Borrow",

    reason:
      "The requested borrowing appears broadly consistent with the conservative affordability estimate based on your income and existing EMI burden.",
  };
}

// --------------------------------------------
// 12. EMI CEILING
// --------------------------------------------

function calculateEMICeiling(answers) {
  return calculateMaxNewEMI(
    answers
  );
}


// --------------------------------------------
// 13. STRESS CASE
// --------------------------------------------

function calculateStressCase(answers) {
  const income =
    Number(answers.monthlyIncome) || 0;

  const existingEMI =
    Number(answers.existingEMI) || 0;

  const proposedEMI =
    calculateEMICeiling(
      answers
    );

  const stressedIncome =
    income * 0.80;

  if (
    stressedIncome <= 0
  ) {
    return {
      incomeDrop: 20,
      stressedIncome: 0,
      stressedFOIR: 0,
    };
  }

  const stressedFOIR =
    (
      (
        existingEMI +
        proposedEMI
      ) /
      stressedIncome
    ) *
    100;

  return {
    incomeDrop: 20,

    stressedIncome:
      Math.round(
        stressedIncome
      ),

    stressedFOIR:
      Number(
        stressedFOIR.toFixed(1)
      ),
  };
}


// --------------------------------------------
// 14. CONFIDENCE LEVEL
// --------------------------------------------

function calculateConfidence(answers) {
  let score = 0;


  // ------------------------------------------
  // Credit score
  // ------------------------------------------

  if (
    answers.creditScore !==
      "unknown" &&
    answers.creditScore !==
      undefined &&
    answers.creditScore !== ""
  ) {
    score += 2;
  }


  // ------------------------------------------
  // Income stability
  // ------------------------------------------

  if (
    answers.incomeStability ===
      "Very stable — usually within ±10%"
  ) {
    score += 2;

  } else if (
    answers.incomeStability ===
      "Somewhat stable — varies by 10–25%"
  ) {
    score += 1;
  }


  // ------------------------------------------
  // Employment tenure
  // ------------------------------------------

  if (
    answers.employmentTenure ===
      "More than 5 years"
  ) {
    score += 2;

  } else if (
    answers.employmentTenure ===
      "3–5 years"
  ) {
    score += 1;
  }


  // ------------------------------------------
  // Business tenure
  // ------------------------------------------

  if (
    answers.businessTenure ===
      "More than 10 years"
  ) {
    score += 2;

  } else if (
    answers.businessTenure ===
      "5–10 years"
  ) {
    score += 1;
  }


  // ------------------------------------------
  // Emergency savings
  // ------------------------------------------

  const savings =
    Number(
      answers.emergencySavings
    ) || 0;

  if (
    savings >= 3
  ) {
    score += 2;

  } else if (
    savings >= 1
  ) {
    score += 1;
  }


  // ------------------------------------------
  // Confidence result
  // ------------------------------------------

  if (score >= 6) {
    return {
      level: "High",

      reason:
        "The assessment is supported by several useful borrower details, including credit information, income stability or tenure, and emergency savings.",
    };
  }

  if (score >= 3) {
    return {
      level: "Medium",

      reason:
        "The assessment has some useful borrower information, but one or more important factors are uncertain.",
    };
  }

  return {
    level: "Low",

    reason:
      "Several important borrower details are uncertain, so the estimated ranges should be treated cautiously.",
  };
}


// --------------------------------------------
// 15. AGE-AWARE TENURE OPTIONS
// --------------------------------------------

// We use age only to avoid presenting long
// repayment periods that may be less practical
// for older borrowers.
//
// This is a judgement-based product-design rule,
// not a lender eligibility rule.
//
// Age < 55  -> 3, 5, 7 years
// Age 55-64 -> 3, 5 years
// Age 65+   -> 3 years

function getAvailableTenures(answers) {
  const age =
    Number(answers.age) || 0;

  if (
    age >= 65
  ) {
    return [3];
  }

  if (
    age >= 55
  ) {
    return [3, 5];
  }

  return [3, 5, 7];
}


// --------------------------------------------
// 16. TENURE TRADE-OFF
// --------------------------------------------

function calculateTenureTradeOff(answers) {
  const amountToCompare =
    Number(
      answers.amountWanted
    ) || 0;

  if (
    amountToCompare <= 0
  ) {
    return [];
  }

  const fairRate =
    calculateFairRate(
      answers
    );

  const annualRate =
    (
      fairRate.min +
      fairRate.max
    ) / 2;

  const tenures =
    getAvailableTenures(
      answers
    );

  return tenures.map(
    (years) => {
      const emi =
        calculateEMI(
          amountToCompare,
          annualRate,
          years
        );

      const months =
        years * 12;

      const totalPayment =
        emi * months;

      const totalInterest =
        totalPayment -
        amountToCompare;

      return {
        years,

        emi,

        totalInterest:
          Math.max(
            0,
            Math.round(
              totalInterest
            )
          ),
      };
    }
  );
}


// --------------------------------------------
// 17. APR / ALL-IN COST
// --------------------------------------------

// Illustrative processing fee assumption:
// 2% of loan amount.
//
// This is NOT a lender quote.

const PROCESSING_FEE_RATE = 0.02;


function calculateAllInCost(answers) {
  const amount =
    Number(
      answers.amountWanted
    ) || 0;

  if (
    amount <= 0
  ) {
    return {
      loanAmount: 0,
      representativeRate: 0,
      processingFee: 0,
      emi: 0,
      tenureYears:
        DEFAULT_TENURE_YEARS,
      totalInterest: 0,
      totalCost: 0,
      approximateAPR: 0,
    };
  }


  const fairRate =
    calculateFairRate(
      answers
    );

  const representativeRate =
    (
      fairRate.min +
      fairRate.max
    ) / 2;

  const tenureYears =
    DEFAULT_TENURE_YEARS;

  const processingFee =
    amount *
    PROCESSING_FEE_RATE;

  const emi =
    calculateEMI(
      amount,
      representativeRate,
      tenureYears
    );

  const numberOfPayments =
    tenureYears * 12;

  const totalRepayment =
    emi *
    numberOfPayments;

  const totalInterest =
    totalRepayment -
    amount;

  const netDisbursedAmount =
    amount -
    processingFee;


  // ------------------------------------------
  // Approximate APR
  // ------------------------------------------

  let low = 0;
  let high = 100;

  for (
    let i = 0;
    i < 100;
    i++
  ) {
    const annualRate =
      (
        low +
        high
      ) / 2;

    const monthlyRate =
      annualRate /
      12 /
      100;

    let presentValue = 0;

    for (
      let month = 1;
      month <= numberOfPayments;
      month++
    ) {
      presentValue +=
        emi /
        Math.pow(
          1 + monthlyRate,
          month
        );
    }

    if (
      presentValue >
      netDisbursedAmount
    ) {
      low =
        annualRate;
    } else {
      high =
        annualRate;
    }
  }

  const approximateAPR =
    (
      low +
      high
    ) / 2;

  const totalCost =
    totalInterest +
    processingFee;

  return {
    loanAmount:
      Math.round(
        amount
      ),

    representativeRate:
      Number(
        representativeRate.toFixed(
          1
        )
      ),

    processingFee:
      Math.round(
        processingFee
      ),

    emi:
      Math.round(
        emi
      ),

    tenureYears,

    totalInterest:
      Math.round(
        totalInterest
      ),

    totalCost:
      Math.round(
        totalCost
      ),

    approximateAPR:
      Number(
        approximateAPR.toFixed(
          2
        )
      ),
  };
}


// --------------------------------------------
// 18. NEGOTIATION CARD
// --------------------------------------------

function createNegotiationCard(
  answers
) {
  const fairRate =
    calculateFairRate(
      answers
    );

  const reasons = [];

  // ------------------------------------------
  // Credit profile
  // ------------------------------------------

  const creditScore =
    Number(
      answers.creditScore
    );

  if (
    !Number.isNaN(creditScore) &&
    creditScore >= 750
  ) {
    reasons.push(
      `Your credit score of ${creditScore} is in a strong range, which supports negotiating toward the lower end of the band.`
    );

  } else if (
    !Number.isNaN(creditScore) &&
    creditScore >= 700
  ) {
    reasons.push(
      `Your credit score of ${creditScore} is in a good range, which supports some rate negotiation.`
    );

  } else if (
    answers.creditScore ===
      "unknown" ||
    answers.creditScore ===
      undefined ||
    answers.creditScore === ""
  ) {
    reasons.push(
      "Your credit score is unknown, so the rate range is kept wider rather than assuming a poor score."
    );

  } else {
    reasons.push(
      `Your credit score of ${creditScore} provides less support for negotiating toward the lowest end of the range.`
    );
  }


  // ------------------------------------------
  // Income / repayment profile
  // ------------------------------------------

  if (
    answers.incomeType ===
    "Salaried"
  ) {
    if (
      answers.employmentTenure ===
      "More than 5 years"
    ) {
      reasons.push(
        "Your long current-employer tenure provides additional evidence of income continuity."
      );
    } else {
      reasons.push(
        "Your income is salaried, but employment tenure is not strong enough here to justify the narrowest possible pricing range."
      );
    }

  } else if (
    answers.incomeStability ===
    "Very stable — usually within ±10%"
  ) {
    reasons.push(
      "Your income has been relatively stable, supporting stronger repayment confidence."
    );

  } else if (
    answers.incomeStability ===
      "Variable — varies by more than 25%" ||
    answers.incomeStability ===
      "Highly unpredictable"
  ) {
    reasons.push(
      "Your income variability increases repayment uncertainty, which can reduce the case for the lowest rate."
    );

  } else {
    reasons.push(
      "Income stability is an important pricing factor, but the available information does not establish a highly stable profile."
    );
  }


  // ------------------------------------------
  // Existing EMI burden
  // ------------------------------------------

  const income =
    Number(
      answers.monthlyIncome
    ) || 0;

  const existingEMI =
    Number(
      answers.existingEMI
    ) || 0;

  if (
    income > 0
  ) {
    const existingFOIR =
      existingEMI /
      income;

    if (
      existingFOIR <= 0.25
    ) {
      reasons.push(
        "Your existing EMI burden is below 25% of monthly income, which supports a stronger affordability profile."
      );

    } else if (
      existingFOIR <= 0.40
    ) {
      reasons.push(
        "Your existing EMI burden is moderate relative to monthly income, so affordability is considered but not treated as a major pricing advantage."
      );

    } else {
      reasons.push(
        "Your existing EMI burden is relatively high compared with income, which can weaken the case for the lowest rate."
      );
    }
  }


  // ------------------------------------------
  // Product / collateral
  // ------------------------------------------

  if (
    answers.collateral ===
      "Yes — property"
  ) {
    reasons.push(
      "Property collateral creates a potential secured borrowing route, which may support lower pricing than comparable unsecured borrowing."
    );

  } else if (
    answers.collateral ===
      "Yes — gold"
  ) {
    reasons.push(
      "Gold collateral creates a potential secured borrowing route, which may support different pricing from unsecured borrowing."
    );

  } else if (
    answers.collateral ===
      "Yes — another eligible asset"
  ) {
    reasons.push(
      "Eligible collateral may provide a secured borrowing route and potentially improve pricing."
    );

  } else {
    reasons.push(
      `The selected ${answers.loanType || "loan"} product is priced using its illustrative product-level range.`
    );
  }


  return {
    fairRateMin:
      fairRate.min,

    fairRateMax:
      fairRate.max,

    message:
      `Your estimated fair rate is ${fairRate.min}%–${fairRate.max}%. Use this band as a negotiation reference and ask the lender to explain any materially higher quote.`,

    reasons,
  };
}


// --------------------------------------------
// 19. MAIN FUNCTION
// --------------------------------------------

export function calculateBorrowerResults(
  answers
) {
  const borrowDecision =
    calculateBorrowDecision(
      answers
    );

  const safeAmount =
    calculateSafeAmount(
      answers
    );

  const likelySanction =
    calculateLikelySanction(
      answers
    );

  const productRecommendation =
    getProductRecommendation(
      answers
    );

  const fairRate =
    calculateFairRate(
      answers
    );

  const emiCeiling =
    calculateEMICeiling(
      answers
    );

  const tenureTradeOff =
    calculateTenureTradeOff(
      answers
    );

  const confidence =
    calculateConfidence(
      answers
    );

  const stressCase =
    calculateStressCase(
      answers
    );

  const allInCost =
    calculateAllInCost(
      answers
    );

  const negotiationCard =
    createNegotiationCard(
      answers
    );

  return {
    borrowDecision,
    safeAmount,
    likelySanction,
    productRecommendation,
    fairRate,
    emiCeiling,
    tenureTradeOff,
    confidence,
    stressCase,
    allInCost,
    negotiationCard,
  };
}