SELECT
    t.id AS transaction_id,
    t.amount AS transaction_amount,
    COALESCE(SUM(CASE WHEN UPPER(l.entry_type) = 'DEBIT'  THEN l.amount ELSE 0 END), 0) AS total_debit,
    COALESCE(SUM(CASE WHEN UPPER(l.entry_type) = 'CREDIT' THEN l.amount ELSE 0 END), 0) AS total_credit,
    ABS(
        COALESCE(SUM(CASE WHEN UPPER(l.entry_type) = 'DEBIT'  THEN l.amount ELSE 0 END), 0)
      - COALESCE(SUM(CASE WHEN UPPER(l.entry_type) = 'CREDIT' THEN l.amount ELSE 0 END), 0)
    ) AS debit_credit_diff
FROM dbo.transactions t
LEFT JOIN dbo.ledger_entries l
    ON l.transaction_id = t.id
GROUP BY
    t.id,
    t.amount
HAVING
    t.amount <> COALESCE(SUM(CASE WHEN UPPER(l.entry_type) = 'DEBIT'  THEN l.amount ELSE 0 END), 0)
    OR t.amount <> COALESCE(SUM(CASE WHEN UPPER(l.entry_type) = 'CREDIT' THEN l.amount ELSE 0 END), 0)
    OR COALESCE(SUM(CASE WHEN UPPER(l.entry_type) = 'DEBIT'  THEN l.amount ELSE 0 END), 0)
       <> COALESCE(SUM(CASE WHEN UPPER(l.entry_type) = 'CREDIT' THEN l.amount ELSE 0 END), 0)
ORDER BY
    t.id;