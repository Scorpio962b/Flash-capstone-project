SELECT
    t.id AS transaction_id,
    t.sender_account_id,
    t.recipient_account_id,
    t.amount AS expected_amount,
    COUNT(CASE WHEN UPPER(l.entry_type) = 'DEBIT' THEN 1 END) AS debit_count,
    COUNT(CASE WHEN UPPER(l.entry_type) = 'CREDIT' THEN 1 END) AS credit_count,
    COUNT(CASE
        WHEN UPPER(l.entry_type) = 'CREDIT' AND l.account_id = t.recipient_account_id
        THEN 1
    END) AS recipient_credit_count,
    COALESCE(SUM(CASE
        WHEN UPPER(l.entry_type) = 'CREDIT' AND l.account_id = t.recipient_account_id
        THEN l.amount ELSE 0
    END), 0) AS recipient_credited_amount
FROM dbo.transactions t
LEFT JOIN dbo.ledger_entries l
    ON l.transaction_id = t.id
WHERE
    UPPER(t.status) IN ('COMPLETED', 'AUTHORIZED', 'SETTLED')
GROUP BY
    t.id,
    t.sender_account_id,
    t.recipient_account_id,
    t.amount
HAVING
    COUNT(CASE WHEN UPPER(l.entry_type) = 'DEBIT' THEN 1 END) < 1
    OR COUNT(CASE WHEN UPPER(l.entry_type) = 'CREDIT' THEN 1 END) < 1
    OR COUNT(CASE
        WHEN UPPER(l.entry_type) = 'CREDIT' AND l.account_id = t.recipient_account_id
        THEN 1
    END) = 0
    OR COALESCE(SUM(CASE
        WHEN UPPER(l.entry_type) = 'CREDIT' AND l.account_id = t.recipient_account_id
        THEN l.amount ELSE 0
    END), 0) <> t.amount
ORDER BY
    t.id;