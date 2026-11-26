import { byText } from '../../support/MobileActions';

export class HistoryScreen {
  get title() { return byText('History'); }
  get pendingChip() { return byText('Pending'); }
}