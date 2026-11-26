SELECT
    t.id AS transaction_id,
    t.status,
    t.sender_account_id,
    t.recipient_account_id,
    t.amount,
    COUNT(l.id) AS ledger_entry_count,
    COALESCE(SUM(CASE WHEN UPPER(l.entry_type) = 'CREDIT' THEN l.amount ELSE 0 END), 0)
      - COALESCE(SUM(CASE WHEN UPPER(l.entry_type) = 'DEBIT' THEN l.amount ELSE 0 END), 0) AS net_ledger_delta
FROM dbo.transactions t
LEFT JOIN dbo.ledger_entries l
    ON l.transaction_id = t.id
WHERE
    UPPER(t.status) = 'FAILED'
GROUP BY
    t.id,
    t.status,
    t.sender_account_id,
    t.recipient_account_id,
    t.amount
HAVING
    COUNT(l.id) > 0
    OR (
        COALESCE(SUM(CASE WHEN UPPER(l.entry_type) = 'CREDIT' THEN l.amount ELSE 0 END), 0)
        - COALESCE(SUM(CASE WHEN UPPER(l.entry_type) = 'DEBIT' THEN l.amount ELSE 0 END), 0)
    ) <> 0
ORDER BY
    t.id;