import { View } from 'react-native';

import { ParamsPanel } from './ParamsPanel';
import { ResultsPanel } from './ResultsPanel';
import { styles } from '../styles';

export function ElectricityFooter({
  paramsOpen,
  setParamsOpen,
  hoursPerDay,
  workDaysPerMonth,
  pricePerKwh,
  setHoursPerDay,
  setWorkDaysPerMonth,
  setPricePerKwh,
  resetParams,
  resultsOpen,
  setResultsOpen,
  result,
}: {
  paramsOpen: boolean;
  setParamsOpen: (value: boolean) => void;
  hoursPerDay: string;
  workDaysPerMonth: string;
  pricePerKwh: string;
  setHoursPerDay: (value: string) => void;
  setWorkDaysPerMonth: (value: string) => void;
  setPricePerKwh: (value: string) => void;
  resetParams: () => void;
  resultsOpen: boolean;
  setResultsOpen: (value: boolean) => void;
  result: {
    totalKwh: number;
    totalRub: number;
    activeCount: number;
    totalUnits: number;
    installedPowerW: number;
    dayKwh: number;
    dayRub: number;
  };
}) {
  return (
    <View style={styles.form}>
      <ParamsPanel
        paramsOpen={paramsOpen}
        setParamsOpen={setParamsOpen}
        hoursPerDay={hoursPerDay}
        workDaysPerMonth={workDaysPerMonth}
        pricePerKwh={pricePerKwh}
        setHoursPerDay={setHoursPerDay}
        setWorkDaysPerMonth={setWorkDaysPerMonth}
        setPricePerKwh={setPricePerKwh}
        resetParams={resetParams}
      />

      <ResultsPanel
        resultsOpen={resultsOpen}
        setResultsOpen={setResultsOpen}
        result={result}
      />
    </View>
  );
}
