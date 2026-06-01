import { Text } from 'react-native';

import { AppCard } from '../../../shared/ui/AppCard';
import { styles } from '../styles';

export function ReportAssumptionsCard(props: {
  periodicMultiplier: number;
  electricityMultiplier: number;
}) {
  const { periodicMultiplier, electricityMultiplier } = props;

  return (
    <AppCard style={styles.card}>
      <Text style={styles.cardTitle}>Принятые допущения</Text>
      <Text style={styles.assumptionText}>
        Периодические операционные расходы интерпретируются как месячные и для годового итога
        умножаются на {periodicMultiplier}. Электроэнергия также считается месячной и для
        годового итога умножается на {electricityMultiplier}.
      </Text>
    </AppCard>
  );
}
