import { Provider, Type } from '@nestjs/common';
import { RULE_EVALUATORS, RuleEvaluator } from '../rule-evaluator';
import { MaxConsecutiveNightsEvaluator } from './max-consecutive-nights.evaluator';
import { MaxHoursPerWeekEvaluator } from './max-hours-per-week.evaluator';
import { MinRestBetweenShiftsEvaluator } from './min-rest-between-shifts.evaluator';
import { NoNightThenMorningEvaluator } from './no-night-then-morning.evaluator';
import { PregnantNoNightEvaluator } from './pregnant-no-night.evaluator';
import { Under18NoNightEvaluator } from './under18-no-night.evaluator';

/** Every evaluator class — register one here to add a new rule type. */
export const EVALUATOR_CLASSES: Type<RuleEvaluator>[] = [
  MaxHoursPerWeekEvaluator,
  MinRestBetweenShiftsEvaluator,
  NoNightThenMorningEvaluator,
  MaxConsecutiveNightsEvaluator,
  Under18NoNightEvaluator,
  PregnantNoNightEvaluator,
];

/** Providers: each evaluator + the aggregated RULE_EVALUATORS array token. */
export const evaluatorProviders: Provider[] = [
  ...EVALUATOR_CLASSES,
  {
    provide: RULE_EVALUATORS,
    inject: EVALUATOR_CLASSES,
    useFactory: (...evaluators: RuleEvaluator[]) => evaluators,
  },
];
