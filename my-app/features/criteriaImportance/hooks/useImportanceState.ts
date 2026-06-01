import { useMemo, useState } from 'react';

import { defaultBudgetingCase } from '../logic/defaultCase';
import { runImportancePipeline } from '../logic/pipeline';
import type { ImportanceReport } from '../types';

export function useImportanceState() {
  const [report, setReport] = useState<ImportanceReport | null>(() => runImportancePipeline(defaultBudgetingCase));
  const [showJson, setShowJson] = useState(false);
  const [error, setError] = useState('');

  const summary = useMemo(() => {
    if (!report) return null;
    return {
      criteriaCount: defaultBudgetingCase.criteria.length,
      alternativesCount: defaultBudgetingCase.alternatives.length,
      relationsCount: defaultBudgetingCase.relations.length,
      winnerName: report.winnerName,
    };
  }, [report]);

  const run = () => {
    try {
      setError('');
      setReport(runImportancePipeline(defaultBudgetingCase));
    } catch (e) {
      setError(String(e));
      setReport(null);
    }
  };

  return {
    caseData: defaultBudgetingCase,
    report,
    showJson,
    setShowJson,
    error,
    summary,
    run,
  };
}
