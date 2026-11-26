SELECT
    t.id AS transaction_id,
    t.status,
    t.created_at,
    t.authorized_at,
    t.settled_at,
    CASE
        WHEN UPPER(t.status) = 'SETTLED' AND t.authorized_at IS NULL THEN 'SETTLED without authorized_at'
        WHEN UPPER(t.status) IN ('COMPLETED', 'AUTHORIZED', 'SETTLED') AND t.created_at IS NULL THEN 'Missing created_at'
        WHEN UPPER(t.status) = 'PENDING' AND (t.authorized_at IS NOT NULL OR t.settled_at IS NOT NULL) THEN 'PENDING has later timestamp'
        WHEN UPPER(t.status) IN ('COMPLETED', 'AUTHORIZED') AND t.settled_at IS NOT NULL THEN 'Pre-settled status has settled_at'
        WHEN UPPER(t.status) NOT IN ('PENDING', 'COMPLETED', 'AUTHORIZED', 'SETTLED', 'FAILED') THEN 'Unexpected status value'
        ELSE 'Status/timestamp mismatch'
    END AS progression_issue
FROM dbo.transactions t
WHERE
    (UPPER(t.status) = 'SETTLED' AND t.authorized_at IS NULL)
    OR (UPPER(t.status) IN ('COMPLETED', 'AUTHORIZED', 'SETTLED') AND t.created_at IS NULL)
    OR (UPPER(t.status) = 'PENDING' AND (t.authorized_at IS NOT NULL OR t.settled_at IS NOT NULL))
    OR (UPPER(t.status) IN ('COMPLETED', 'AUTHORIZED') AND t.settled_at IS NOT NULL)
    OR UPPER(t.status) NOT IN ('PENDING', 'COMPLETED', 'AUTHORIZED', 'SETTLED', 'FAILED')
ORDER BY
    t.id;