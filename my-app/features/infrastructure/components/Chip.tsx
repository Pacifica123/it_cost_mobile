import { Text, View } from 'react-native';

import { useInfrastructureStyles } from '../styles';

export function Chip({
  text,
  tone = 'neutral',
}: {
  text: string;
  tone?: 'neutral' | 'blue' | 'green';
}) {
  const styles = useInfrastructureStyles();

  return (
    <View
      style={[
        styles.chip,
        tone === 'neutral' && styles.chipNeutral,
        tone === 'blue' && styles.chipBlue,
        tone === 'green' && styles.chipGreen,
      ]}
    >
      <Text style={styles.chipText} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}
