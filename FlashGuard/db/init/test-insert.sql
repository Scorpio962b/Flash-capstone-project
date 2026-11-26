BEGIN TRANSACTION;

INSERT INTO dbo.accounts
    (email, full_name, password_hash, balance, is_active)
VALUES
    ('seed-test@example.invalid', 'Seed Test', 'offline-demo', 0, 1);

SELECT @@ROWCOUNT AS InsertedRows;

ROLLBACK TRANSACTION;
