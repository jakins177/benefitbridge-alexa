/** Purpose: Regression tests for ambiguous fictional answers and privacy-safe routing. */
import { describe, expect, it } from 'vitest';
import { normalizeAnswer } from './intake';
import { applyAnswer, createCase } from './case';
describe('strict intake', () => {
 it.each(['-100','1200.50','1,2','1200 per week','1200 or 1500','1000001'])('rejects ambiguous income %s', value => expect(() => normalizeAnswer('income', value)).toThrow());
 it.each(['0','21','2 or 3','-3','2.5'])('rejects ambiguous household %s', value => expect(() => normalizeAnswer('household', value)).toThrow());
 it('understands words and negation without reversing coverage', () => {
  expect(normalizeAnswer('household','There are three people')).toBe('3');
  expect(normalizeAnswer('coverage',"I don't have coverage")).toBe('no');
  expect(() => normalizeAnswer('coverage','maybe yes, maybe no')).toThrow();
  expect(normalizeAnswer('income','zero')).toBe('0');
 });
 it('does not equate income reduction with job loss', () => expect(applyAnswer(createCase(),'income-loss').profile.lostJob).toBe(false));
 it('uses unpredictable case identifiers', () => { const a=createCase(), b=createCase(); expect(a.id).not.toBe(b.id); expect(a.id.length).toBe(39); });
});
