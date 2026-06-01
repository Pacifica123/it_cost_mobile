import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SectionsMenu } from '../components/SectionsMenu';
import { AppCard } from '../shared/ui/AppCard';
import { styles } from '../features/home/styles';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.decorBlob1} pointerEvents="none" />
      <View style={styles.decorBlob2} pointerEvents="none" />

      <View style={styles.page}>
        <AppCard style={styles.headerCard}>
          <Text style={styles.title}>Добро пожаловать 👋</Text>
          <Text style={styles.subtitle}>Выбери раздел, с которым хочешь работать</Text>
        </AppCard>

        <AppCard style={styles.menuCard}>
          <Text style={styles.sectionTitle}>Разделы</Text>
          <SectionsMenu variant="entries" />
        </AppCard>
      </View>
    </SafeAreaView>
  );
}
