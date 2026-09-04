import { useState } from "react";
import "./App.css";
import { calculateBorrowerResults } from "./rules";

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);

  // --------------------------------------------------
  // 10 MUST QUESTIONS
  // --------------------------------------------------

  const mustQuestions = [
    {
      id: "loanPurpose",
      question: "What is the main purpose of the loan?",
      type: "select",
      options: [
        "Home purchase",
        "Education",
        "Medical",
        "Wedding",
        "Vehicle",
        "Business",
        "Debt consolidation",
        "Personal / Other",
      ],
    },

    {
      id: "loanType",
      question: "What type of loan are you considering?",
      type: "select",
      options: [
        "Personal Loan",
        "Home Loan",
        "Loan Against Property",
        "Gold Loan",
        "Two-wheeler Loan",
        "Business Loan",
        "Not sure",
      ],
    },

    {
      id: "amountWanted",
      question: "How much do you want to borrow?",
      type: "number",
      placeholder: "Enter amount in ₹",
    },

    {
      id: "monthlyIncome",
      question: "What is your net monthly income?",
      type: "number",
      placeholder: "Enter monthly income in ₹",
    },

    {
      id: "incomeType",
      question: "What is your primary income source?",
      type: "select",
      options: [
        "Salaried",
        "Self-employed",
        "Informal income",
        "Mixed income",
      ],
    },

    {
      id: "existingEMI",
      question:
        "How much do you currently pay toward EMIs each month?",
      type: "number",
      placeholder: "Enter current monthly EMIs in ₹",
    },

    {
      id: "householdExpenses",
      question:
        "What are your average monthly household expenses?",
      type: "number",
      placeholder: "Enter monthly expenses in ₹",
    },

    {
      id: "age",
      question: "What is your age?",
      type: "number",
      placeholder: "Enter your age",
    },

    {
      id: "creditScore",
      question: "What is your credit score, if known?",
      type: "creditScore",
      placeholder: "Example: 780",
    },

    {
      id: "emergencySavings",
      question:
        "How many months of essential expenses can your savings cover?",
      type: "number",
      placeholder: "Example: 3",
    },
  ];

  // --------------------------------------------------
  // ADAPTIVE QUESTIONS
  // --------------------------------------------------

  const getAdaptiveQuestions = () => {
    const adaptiveQuestions = [];

    // ----------------------------------------------
    // Income stability
    // ----------------------------------------------

    if (
      answers.incomeType === "Self-employed" ||
      answers.incomeType === "Informal income" ||
      answers.incomeType === "Mixed income"
    ) {
      adaptiveQuestions.push({
        id: "incomeStability",
        question:
          "How stable has your monthly income been over the last 12 months?",
        type: "select",
        options: [
          "Very stable — usually within ±10%",
          "Somewhat stable — varies by 10–25%",
          "Variable — varies by more than 25%",
          "Highly unpredictable",
        ],
      });
    }

    // ----------------------------------------------
    // Salaried employment tenure
    // ----------------------------------------------

    if (answers.incomeType === "Salaried") {
      adaptiveQuestions.push({
        id: "employmentTenure",
        question:
          "How long have you been with your current employer?",
        type: "select",
        options: [
          "Less than 6 months",
          "6–12 months",
          "1–3 years",
          "3–5 years",
          "More than 5 years",
        ],
      });
    }

    // ----------------------------------------------
    // Self-employed business tenure
    // ----------------------------------------------

    if (answers.incomeType === "Self-employed") {
      adaptiveQuestions.push({
        id: "businessTenure",
        question:
          "How long have you been running your current business?",
        type: "select",
        options: [
          "Less than 1 year",
          "1–3 years",
          "3–5 years",
          "5–10 years",
          "More than 10 years",
        ],
      });
    }

    // ----------------------------------------------
    // Existing EMI questions
    // ----------------------------------------------

    if (Number(answers.existingEMI) > 0) {
      adaptiveQuestions.push({
        id: "missedPayment",
        question:
          "Have you missed or delayed any loan or credit-card payment in the last 12 months?",
        type: "select",
        options: [
          "No",
          "Yes, once",
          "Yes, more than once",
          "Not sure",
        ],
      });

      adaptiveQuestions.push({
        id: "outstandingDebt",
        question:
          "How much do you currently owe across your existing loans?",
        type: "number",
        placeholder: "Enter outstanding debt in ₹",
      });

      adaptiveQuestions.push({
        id: "highestLoanRate",
        question:
          "What is the approximate interest rate on your most expensive existing loan?",
        type: "select",
        options: [
          "Below 12%",
          "12%–20%",
          "20%–30%",
          "Above 30%",
          "I don't know",
        ],
      });
    }

    // ----------------------------------------------
    // Collateral / secured borrowing
    // ----------------------------------------------

    if (
      answers.incomeType === "Self-employed" ||
      answers.loanPurpose === "Business" ||
      answers.loanType === "Business Loan"
    ) {
      adaptiveQuestions.push({
        id: "collateral",
        question:
          "Do you have an asset you could consider offering as collateral?",
        type: "select",
        options: [
          "Yes — property",
          "Yes — gold",
          "Yes — another eligible asset",
          "No",
          "Not sure",
        ],
      });
    }

    // ----------------------------------------------
    // Business borrowing
    // ----------------------------------------------

    if (
      answers.loanPurpose === "Business" ||
      answers.loanType === "Business Loan"
    ) {
      adaptiveQuestions.push({
        id: "expectedIncome",
        question:
          "How much additional monthly income do you realistically expect this loan to generate?",
        type: "number",
        placeholder:
          "Enter expected additional monthly income in ₹",
      });
    }

    return adaptiveQuestions;
  };

  const adaptiveQuestions = getAdaptiveQuestions();

  // Combine must + adaptive questions
  const allQuestions = [
    ...mustQuestions,
    ...adaptiveQuestions,
  ];

  const question = allQuestions[currentQuestion];

  // --------------------------------------------------
  // HANDLE ANSWER
  // --------------------------------------------------

  const handleAnswer = (value) => {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [question.id]: value,
    }));

    setError("");
  };

  // --------------------------------------------------
  // VALIDATION
  // --------------------------------------------------

  const validateAnswer = () => {
    const answer = answers[question.id];

    // ----------------------------------------------
    // Credit score
    // ----------------------------------------------

    if (question.type === "creditScore") {
      if (answer === "unknown") {
        return true;
      }

      if (!answer) {
        setError(
          "Please enter your credit score or select 'I don't know'."
        );
        return false;
      }

      const score = Number(answer);

      if (score < 300 || score > 900) {
        setError(
          "Credit score should be between 300 and 900."
        );
        return false;
      }

      return true;
    }

    // ----------------------------------------------
    // Select
    // ----------------------------------------------

    if (question.type === "select") {
      if (!answer) {
        setError(
          "Please select an option to continue."
        );
        return false;
      }

      return true;
    }

    // ----------------------------------------------
    // Number
    // ----------------------------------------------

    if (question.type === "number") {
      if (
        answer === "" ||
        answer === undefined ||
        answer === null
      ) {
        setError(
          "Please enter a value to continue."
        );
        return false;
      }

      const value = Number(answer);

      if (Number.isNaN(value)) {
        setError(
          "Please enter a valid number."
        );
        return false;
      }

      if (value < 0) {
        setError(
          "Please enter a value greater than or equal to 0."
        );
        return false;
      }

      // Age validation
      if (question.id === "age") {
        if (value < 18 || value > 100) {
          setError(
            "Please enter an age between 18 and 100."
          );
          return false;
        }
      }

      return true;
    }

    return true;
  };

  // --------------------------------------------------
  // NEXT
  // --------------------------------------------------

  const handleNext = () => {
    if (!validateAnswer()) {
      return;
    }

    if (currentQuestion < allQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setError("");
    } else {
      console.log(
        "Borrower answers:",
        answers
      );

      const borrowerResults =
        calculateBorrowerResults(answers);

      console.log(
        "Borrower results:",
        borrowerResults
      );

      setResults(borrowerResults);
    }
  };

  // --------------------------------------------------
  // BACK
  // --------------------------------------------------

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setError("");
    }
  };

  // --------------------------------------------------
  // RESET
  // --------------------------------------------------

  const handleStartAgain = () => {
    setResults(null);
    setAnswers({});
    setCurrentQuestion(0);
    setError("");
  };

  // --------------------------------------------------
  // PROGRESS
  // --------------------------------------------------

  const progress =
    ((currentQuestion + 1) /
      allQuestions.length) *
    100;

  // --------------------------------------------------
  // RESULTS SCREEN
  // --------------------------------------------------

  if (results) {
    return (
      <div className="app">
        <div className="container">

          <header className="header">
            <div className="logo">
              Borrower Copilot
            </div>

            <p className="tagline">
              Your borrowing assessment
            </p>
          </header>

          <main className="question-card">

            {/* BORROWING RECOMMENDATION */}

<div className="question-number">
  YOUR RECOMMENDATION
</div>

<h1>
  {results.borrowDecision.decision}
</h1>

{/* CONFIDENCE */}

<div className="confidence-box">

  <h3>
    Confidence: {results.confidence.level}
  </h3>

  <p>
    {results.confidence.reason}
  </p>

  <hr />

  <h4>
    What does this mean?
  </h4>

  <p className="helper-text">
    Confidence reflects how much useful information was
    available to assess your borrowing situation. It does
    not mean that a lender will definitely approve or reject
    your application.
  </p>

  {results.confidence.level === "High" ? (

    <p className="helper-text">
      Your assessment has relatively strong supporting
      information. The recommendation is still an estimate
      and should be compared with the lender's actual offer.
    </p>

  ) : results.confidence.level === "Medium" ? (

    <p className="helper-text">
      Some important information is available, but there are
      still uncertainties. Treat the estimated amounts and
      rate range as a wider planning reference rather than
      an exact eligibility result.
    </p>

  ) : (

    <p className="helper-text">
      Important information is missing or uncertain. The
      assessment therefore uses wider assumptions and should
      be treated as a cautious planning estimate. Do not
      interpret it as a guaranteed eligibility decision.
    </p>

  )}

</div>

<div
  className={
    results.borrowDecision.decision === "Don't borrow"
      ? "result-warning"
      : results.borrowDecision.decision === "Borrow less"
      ? "result-info"
      : "result-highlight"
  }
>
  <strong>
    {results.borrowDecision.decision === "Don't borrow"
      ? "Recommendation: wait before taking a new loan."
      : results.borrowDecision.decision === "Borrow less"
      ? "Recommendation: reduce the loan amount."
      : "Recommendation: borrowing appears affordable under the current assumptions."}
  </strong>

  <p>
    {results.borrowDecision.reason}
  </p>
</div>

<p className="helper-text">
  {results.borrowDecision.decision === "Don't borrow"
    ? "Do not treat lender eligibility as a target. Focus on improving affordability and repayment stability before taking on another loan."
    : results.borrowDecision.decision === "Borrow less"
    ? "Use the safe amount as your main reference and reduce the requested amount until the repayment fits your recommended EMI capacity."
    : "If you proceed, keep the EMI within your recommended ceiling and compare the complete APR and fees before accepting an offer."}
</p>

<hr />

            

{/* ---------------------------------- */}
{/* SAFE AMOUNT */}
{/* ---------------------------------- */}

<h2>
  How much can you safely borrow?
</h2>

<div className="amount-card">

  <h3>
    ₹{results.safeAmount.toLocaleString("en-IN")}
  </h3>

  <p className="helper-text">
    <strong>
      Use this as your primary borrowing reference.
    </strong>
  </p>

  <p>
    This conservative estimate considers your income,
    existing EMIs, household expenses, emergency
    savings, and a safety buffer. It is designed to
    leave room for essential expenses and unexpected
    financial pressure.
  </p>

  <hr />

  <h3>
    Indicative lender capacity
  </h3>

  <p>
    ₹{results.likelySanction.toLocaleString("en-IN")}
  </p>

  <p className="helper-text">
    This is an illustrative estimate of what a lender
    might potentially consider under a less conservative
    assumption. It is <strong>not a guaranteed sanction</strong>.
  </p>

  <hr />

  <h3>
    Which amount should you use?
  </h3>

  <p>
    <strong>
      Use the safe amount as your main reference.
    </strong>{" "}
    The lender capacity is shown only to help you
    understand that a lender may consider a higher
    amount than what is financially comfortable for you.
  </p>

</div>

<hr />

            {/* ---------------------------------- */}
{/* PRODUCT ROUTE */}
{/* ---------------------------------- */}

<h2>
  Product route
</h2>

<p>
  <strong>
    Suggested route:
  </strong>{" "}
  {results.productRecommendation.product}
</p>

{results.borrowDecision.decision === "Don't borrow" ? (
  <p className="helper-text">
    This route matches the purpose and loan type you selected, but it
    <strong> does not override the borrowing recommendation above</strong>.
    Based on your current affordability and repayment profile, taking a new
    loan is not recommended right now.
  </p>
) : results.borrowDecision.decision === "Borrow less" ? (
  <p className="helper-text">
    This route may be suitable if you proceed after reducing the requested
    amount to a level that fits your conservative affordability estimate.
  </p>
) : (
  <p className="helper-text">
    The suggested route is based on the loan type selected and the borrower
    information provided.
  </p>
)}

<hr />

            {/* ---------------------------------- */}
{/* FAIR RATE */}
{/* ---------------------------------- */}

<h2>
  Fair interest rate
</h2>

<div className="rate-card">

  <h3>
    {results.fairRate.min}% –{" "}
    {results.fairRate.max}%
  </h3>

  <p>
    <strong>
      Estimated fair rate range
    </strong>
  </p>

  <p className="helper-text">
    This is a borrower-specific reference range,
    not a guaranteed lender offer.
  </p>

  <hr />

  <h4>
    How this range is calculated
  </h4>

  <p>
    The range starts with an illustrative rate band
    for your selected loan product and is then adjusted
    using the information you provided.
  </p>

  <ul>
    <li>
      <strong>Credit score:</strong> A stronger known
      score can support a lower rate, while an unknown
      score keeps the range wider because there is less
      evidence.
    </li>

    <li>
      <strong>Income stability:</strong> More predictable
      income generally supports a narrower and potentially
      lower risk range.
    </li>

    <li>
      <strong>Existing EMI burden:</strong> Higher existing
      repayment obligations increase affordability risk.
    </li>

    <li>
      <strong>Repayment history:</strong> Recent missed or
      delayed payments can increase the estimated rate.
    </li>

    <li>
      <strong>Collateral:</strong> Where a secured route is
      appropriate, collateral can reduce lender risk and
      may support a lower rate.
    </li>
  </ul>

  <p className="helper-text">
    <strong>
      Important:
    </strong>{" "}
    Compare the lender's complete APR and all applicable
    fees, not just the advertised interest rate.
  </p>

</div>

<hr />

            {/* ---------------------------------- */}
{/* EMI CEILING */}
{/* ---------------------------------- */}

<h2>
  What EMI should you agree to?
</h2>

<div className="emi-card">

  <h3>
    ₹{results.emiCeiling.toLocaleString("en-IN")}
    {" / month"}
  </h3>

  <p>
    <strong>
      Recommended maximum new EMI
    </strong>
  </p>

  <p className="helper-text">
    This is the maximum additional monthly repayment
    we recommend based on the information you provided.
  </p>

  <hr />

  <h4>
    Why this EMI?
  </h4>

  <p>
    We start with a conservative affordability limit
    based on your monthly income and existing EMIs.
    We then apply a safety buffer so that you are not
    using all of your available repayment capacity.
  </p>

  <p>
    Your essential household expenses are also considered
    when estimating whether the remaining income can
    comfortably support a new loan.
  </p>

  <p className="helper-text">
    <strong>
      Important:
    </strong>{" "}
    This is a safety-oriented borrower limit, not a
    lender eligibility limit. A lender may approve a
    higher EMI, but that does not necessarily mean the
    payment is comfortable or financially safe for you.
  </p>

</div>

<hr />

            {/* ---------------------------------- */}
            {/* TENURE TRADE-OFF */}
            {/* ---------------------------------- */}

            <div className="result-section">

              <h2>
                Tenure trade-off
              </h2>

              <p className="helper-text">
                For the same{" "}
                <strong>requested amount</strong>,
                a shorter tenure means a higher EMI but
                less total interest. A longer tenure lowers
                the EMI but increases the total interest paid.
              </p>

              {results.tenureTradeOff &&
              results.tenureTradeOff.length > 0 ? (
                <>
                  <div className="tenure-table">

                    <div className="tenure-row tenure-header">
                      <span>
                        Tenure
                      </span>

                      <span>
                        Monthly EMI
                      </span>

                      <span>
                        Total Interest
                      </span>
                    </div>

                    {results.tenureTradeOff.map(
                      (option) => (
                        <div
                          className="tenure-row"
                          key={option.years}
                        >
                          <span>
                            {option.years} years
                          </span>

                          <span>
                            ₹
                            {option.emi.toLocaleString(
                              "en-IN"
                            )}
                          </span>

                          <span>
                            ₹
                            {option.totalInterest.toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>
                      )
                    )}

                  </div>

                  {/* ---------------------------------- */}
                  {/* ALL OPTIONS EXCEED EMI CEILING */}
                  {/* ---------------------------------- */}

                  {results.tenureTradeOff.every(
                    (option) =>
                      option.emi >
                      results.emiCeiling
                  ) && (
                    <div className="result-warning">

                      <strong>
                        The requested amount is above
                        your recommended EMI capacity.
                      </strong>

                      <p>
                        Even the longest available
                        tenure produces an EMI above
                        your recommended maximum of ₹
                        {results.emiCeiling.toLocaleString(
                          "en-IN"
                        )}
                        . Consider reducing the loan
                        amount rather than extending
                        the tenure further.
                      </p>

                    </div>
                  )}

                  {/* ---------------------------------- */}
                  {/* SOME OPTIONS FIT EMI CEILING */}
                  {/* ---------------------------------- */}

                  {results.tenureTradeOff.some(
                    (option) =>
                      option.emi <=
                      results.emiCeiling
                  ) &&
                    results.tenureTradeOff.some(
                      (option) =>
                        option.emi >
                        results.emiCeiling
                    ) && (
                      <div className="result-info">

                        <strong>
                          Tenure can change the
                          monthly burden.
                        </strong>

                        <p>
                          Some tenure options fit
                          within your recommended
                          EMI ceiling while shorter
                          options exceed it. Choose
                          the shortest tenure you can
                          comfortably afford.
                        </p>

                      </div>
                    )}

                </>
              ) : (
                <p className="helper-text">
                  A tenure comparison is not shown
                  because the requested amount is ₹0.
                </p>
              )}

            </div>

            <hr />

            {/* ALL-IN COST */}

<h2>
  What will this loan really cost?
</h2>

<div className="cost-card">

  <h3>
    Approximate APR: {results.allInCost.approximateAPR}%
  </h3>

  <p className="helper-text">
    APR is a better comparison measure than the interest
    rate alone because it also considers the processing fee.
  </p>

  <hr />

  <h4>
    Representative loan example
  </h4>

  <p>
    <strong>Interest rate:</strong>{" "}
    {results.allInCost.representativeRate}%
  </p>

  <p>
    <strong>Processing fee:</strong>{" "}
    ₹{results.allInCost.processingFee.toLocaleString("en-IN")}
  </p>

  <p>
    <strong>Monthly EMI:</strong>{" "}
    ₹{results.allInCost.emi.toLocaleString("en-IN")}
  </p>

  <p>
    <strong>Total interest:</strong>{" "}
    ₹{results.allInCost.totalInterest.toLocaleString("en-IN")}
  </p>

  <p>
    <strong>Total cost including fee:</strong>{" "}
    ₹{results.allInCost.totalCost.toLocaleString("en-IN")}
  </p>

  <hr />

  <h4>
    Why this matters
  </h4>

  <p className="helper-text">
    A lender may advertise a low interest rate while charging
    additional fees. Compare the complete APR, processing fee,
    insurance or other mandatory charges, and total repayment
    before accepting a loan.
  </p>

  <p className="helper-text">
    <strong>Important:</strong>{" "}
    This is an illustrative calculation based on the assumptions
    in this assessment. The lender's final APR and fee schedule
    may be different.
  </p>

</div>

<hr />

            {/* ---------------------------------- */}
{/* STRESS CASE */}
{/* ---------------------------------- */}

<h2>
  What if your income falls?
</h2>

<div className="stress-card">

  <h3>
    {results.stressCase.incomeDrop}% income reduction
  </h3>

  <p>
    If your monthly income falls by{" "}
    <strong>
      {results.stressCase.incomeDrop}%
    </strong>
    , your estimated monthly income would become{" "}
    <strong>
      ₹
      {results.stressCase.stressedIncome.toLocaleString(
        "en-IN"
      )}
    </strong>
    .
  </p>

  <hr />

  <h4>
    Estimated repayment burden
  </h4>

  <p>
    Your stressed FOIR would be approximately{" "}
    <strong>
      {results.stressCase.stressedFOIR}%
    </strong>
    .
  </p>

  <p>
    FOIR represents the share of your monthly income
    going toward existing and proposed loan repayments.
    A higher stressed FOIR means less income remains
    available for your other needs.
  </p>

  <hr />

  <h4>
    Why do we test this?
  </h4>

  <p className="helper-text">
    A loan that looks affordable when income is stable
    can become difficult to manage if income temporarily
    falls. This test checks how your repayment burden
    behaves under a{" "}
    <strong>
      20% income reduction
    </strong>
    .
  </p>

  <p className="helper-text">
    <strong>
      How to use this result:
    </strong>{" "}
    If the stressed repayment burden becomes high,
    consider borrowing less, choosing a more affordable
    EMI, or waiting until your financial buffer improves.
  </p>

</div>

<hr />

            {/* NEGOTIATION CARD */}

<h2>
  Negotiation Card
</h2>

<div className="negotiation-card">

  <h3>
    Your borrower reference
  </h3>

  <p>
    <strong>Fair interest rate:</strong>{" "}
    {results.negotiationCard.fairRateMin}%
    {" – "}
    {results.negotiationCard.fairRateMax}%
  </p>

  <p>
    <strong>Recommended maximum EMI:</strong>{" "}
    ₹{results.emiCeiling.toLocaleString("en-IN")}
    {" / month"}
  </p>

  <p>
    <strong>Safe borrowing amount:</strong>{" "}
    ₹{results.safeAmount.toLocaleString("en-IN")}
  </p>

  <hr />

  <h4>
    Why this range?
  </h4>

  <ul>
    {results.negotiationCard.reasons.map(
      (reason, index) => (
        <li key={index}>
          {reason}
        </li>
      )
    )}
  </ul>

  <hr />

  <h4>
    What to ask the lender
  </h4>

  <ul>
    <li>
      Ask for the complete APR, not just the advertised
      interest rate.
    </li>

    <li>
      Ask for the processing fee and every mandatory
      additional charge.
    </li>

    <li>
      Ask why the offered rate differs from your estimated
      fair-rate range.
    </li>

    <li>
      Confirm the EMI, tenure and total repayment amount
      before accepting the loan.
    </li>
  </ul>

  <hr />

  {results.borrowDecision.decision === "Don't borrow" ? (

    <div className="result-warning">

      <strong>
        Current priority: do not negotiate for a new loan.
      </strong>

      <p>
        Your current assessment does not support taking on
        another borrowing obligation. Focus first on reducing
        existing high-cost debt and improving repayment
        stability.
      </p>

    </div>

  ) : results.borrowDecision.decision === "Borrow less" ? (

    <div className="result-info">

      <strong>
        Current priority: negotiate the amount first.
      </strong>

      <p>
        Your requested amount is above your conservative
        affordability estimate. If you proceed, negotiate a
        lower principal amount before focusing on the interest
        rate.
      </p>

    </div>

  ) : (

    <div className="result-info">

      <strong>
        Negotiation tip
      </strong>

      <p>
        Use this card as a reference when comparing lender
        offers. A rate within the estimated range is not
        automatically the best offer; compare APR, fees,
        tenure, EMI and total repayment together.
      </p>

    </div>

  )}

</div>

<hr />

            {/* ---------------------------------- */}
            {/* START AGAIN */}
            {/* ---------------------------------- */}

            <button
              className="next-button"
              onClick={handleStartAgain}
            >
              Start Again
            </button>

          </main>

        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // QUESTIONNAIRE SCREEN
  // --------------------------------------------------

  return (
    <div className="app">
      <div className="container">

        {/* Header */}

        <header className="header">

          <div className="logo">
            Borrower Copilot
          </div>

          <p className="tagline">
            Make smarter borrowing decisions.
          </p>

        </header>

        {/* Progress */}

        <div className="progress-section">

          <div className="progress-info">

            <span>
              Question {currentQuestion + 1} of{" "}
              {allQuestions.length}
            </span>

            <span>
              {Math.round(progress)}%
            </span>

          </div>

          <div className="progress-bar">

            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
              }}
            ></div>

          </div>

        </div>

        {/* Question Card */}

        <main className="question-card">

          <div className="question-number">

            {currentQuestion <
            mustQuestions.length
              ? `MUST QUESTION ${
                  currentQuestion + 1
                }`
              : "PERSONALIZED QUESTION"}

          </div>

          <h1>
            {question.question}
          </h1>

          <p className="helper-text">
            Your answer helps us understand what
            borrowing may be affordable for you.
          </p>

          {/* SELECT */}

          {question.type === "select" && (
            <select
              className="input"
              value={
                answers[question.id] || ""
              }
              onChange={(e) =>
                handleAnswer(e.target.value)
              }
            >

              <option value="">
                Select an option
              </option>

              {question.options.map(
                (option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                )
              )}

            </select>
          )}

          {/* NUMBER */}

          {question.type === "number" && (
            <input
              className="input"
              type="number"
              min="0"
              value={
                answers[question.id] || ""
              }
              onChange={(e) =>
                handleAnswer(e.target.value)
              }
              placeholder={
                question.placeholder
              }
            />
          )}

          {/* CREDIT SCORE */}

          {question.type === "creditScore" && (
            <div className="credit-section">

              <input
                className="input"
                type="number"
                min="300"
                max="900"
                value={
                  answers[question.id] ===
                  "unknown"
                    ? ""
                    : answers[question.id] || ""
                }
                onChange={(e) =>
                  handleAnswer(e.target.value)
                }
                placeholder={
                  question.placeholder
                }
                disabled={
                  answers[question.id] ===
                  "unknown"
                }
              />

              <button
                type="button"
                className="unknown-button"
                onClick={() =>
                  handleAnswer("unknown")
                }
              >
                {answers[question.id] ===
                "unknown"
                  ? "Credit score marked as unknown"
                  : "I don't know my credit score"}
              </button>

            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="error-message">
              ⚠ {error}
            </div>
          )}

          {/* NAVIGATION */}

          <div className="navigation">

            <button
              className="back-button"
              onClick={handleBack}
              disabled={
                currentQuestion === 0
              }
            >
              ← Back
            </button>

            <button
              className="next-button"
              onClick={handleNext}
            >
              {currentQuestion ===
              allQuestions.length - 1
                ? "See Results →"
                : "Next →"}
            </button>

          </div>

        </main>

        {/* Footer */}

        <footer>
          <p>
            Your answers are used only to provide
            this recommendation.
          </p>
        </footer>

      </div>
    </div>
  );
}

export default App;