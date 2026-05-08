export interface PollData {
  question: string;
  options: string[];
  expiresAt?: Date;
  isMultiple: boolean;
}
