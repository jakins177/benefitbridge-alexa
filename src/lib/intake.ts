/** Purpose: Normalize fictional intake without logging answers. Input: step/text; output: answer or clarification. */
import type { IntakeStep } from './types';
export function normalizeAnswer(step: IntakeStep, input: string): string {
 const text = input.trim().toLowerCase().replaceAll('’', "'");
 if (!text || text.length > 500) throw new Error('Enter a short sample answer.');
 if (step === 'complete') throw new Error('This intake is already complete.');
 if (step === 'crisis') {
  if (['lost-job','i lost my job yesterday','i lost my job','i was laid off','laid off'].includes(text)) return 'lost-job';
  if (['income-loss','my income decreased','i lost income'].includes(text)) return 'income-loss';
  throw new Error('Choose job loss or reduced income to begin this Kansas demo.');
 }
 if (step === 'household') {
  const words = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
  const value = text.split(' ').map(w => words.includes(w) ? String(words.indexOf(w)) : w).join(' ');
  const matches = value.match(/[0-9]+/g);
  if (!matches || matches.length !== 1 || /[-.+]/.test(value) || Number(matches[0]) < 1 || Number(matches[0]) > 20) throw new Error('Enter one household total from 1 to 20, including yourself.');
  return String(Number(matches[0]));
 }
 if (step === 'income') {
  if (['zero','none','no income'].includes(text)) return '0';
  const cleaned = text.replace(/^(about|around) +/, '').replace(/ *(dollars)? *(per month|a month|monthly|this month)?$/, '').trim();
  const number = cleaned.startsWith('$') ? cleaned.slice(1) : cleaned;
  if (!/^(?:[0-9]+|[0-9]{1,3}(?:,[0-9]{3})+)$/.test(number)) throw new Error('Enter monthly gross income as whole dollars, such as 1200. No weekly amounts, decimals, or ranges.');
  const amount = Number(number.replaceAll(',', ''));
  if (amount > 1000000) throw new Error('Enter a sample amount from 0 to 1,000,000.');
  return String(amount);
 }
 if (['no','nope','none','not at all',"i don't","we don't",'no coverage','i have no coverage','we have no coverage',"i don't have coverage",'not everyone','not everyone has coverage', "no, we don't have coverage"].includes(text)) return 'no';
 if (['yes','yeah','yep','i do','we do','everyone has coverage','i pay the energy bill'].includes(text)) return 'yes';
 throw new Error("Please answer yes or no. I won't guess from an uncertain response.");
}
