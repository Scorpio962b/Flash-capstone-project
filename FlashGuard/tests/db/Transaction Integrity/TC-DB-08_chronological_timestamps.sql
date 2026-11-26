SELECT
    t.id AS transaction_id,
    t.created_at AS tx_created_at,
    t.authorized_at AS tx_authorized_at,
    t.settled_at AS tx_settled_at,
    MIN(l.created_at) AS earliest_ledger_at,
    MAX(l.created_at) AS latest_ledger_at
FROM dbo.transactions t
LEFT JOIN dbo.ledger_entries l
    ON l.transaction_id = t.id
GROUP BY
    t.id,
    t.created_at,
    t.authorized_at,
    t.settled_at
HAVING
    (t.authorized_at IS NOT NULL AND t.authorized_at < t.created_at)
    OR (t.settled_at IS NOT NULL AND t.settled_at < t.created_at)
    OR (t.settled_at IS NOT NULL AND t.authorized_at IS NOT NULL AND t.settled_at < t.authorized_at)
    OR (MIN(l.created_at) IS NOT NULL AND MIN(l.created_at) < t.created_at)
ORDER BY
    t.id;