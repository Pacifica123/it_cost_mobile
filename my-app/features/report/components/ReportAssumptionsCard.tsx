import { Text } from 'react-native';

import { useThemePalette } from '../../../shared/theme';
import { AppCard } from '../../../shared/ui/AppCard';
import { useReportStyles } from '../styles';

export function ReportAssumptionsCard(props: {
  periodicMultiplier: number;
  electricityMultiplier: number;
}) {
  const styles = useReportStyles();

  const palette = useThemePalette();
  const { periodicMultiplier, electricityMultiplier } = props;

  return (
    <AppCard style={styles.card}>
      <Text style={[styles.cardTitle, { color: palette.text }]}>Принятые допущения</Text>
      <Text style={[styles.assumptionText, { color: palette.textSoft }]}> 
        Периодические операционные расходы интерпретируются как месячные и для годового итога
        умножаются на {periodicMultiplier}. Электроэнергия также считается месячной и для
        годового итога умножается на {electricityMultiplier}.
      </Text>
    </AppCard>
  );
}
