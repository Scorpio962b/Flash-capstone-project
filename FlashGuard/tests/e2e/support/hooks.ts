import { AfterAll } from '@cucumber/cucumber';
import { closeDb } from './db';

AfterAll(async () => {
  await closeDb();
});