import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SectionsMenu } from '../components/SectionsMenu';
import { index as styles } from './styles/index';

export default function WelcomeScreen() {
  return (
    <SafeAreaView  style={styles.screen} edges={['top']}>
      {/* декоративный фон */}
      <View style={styles.decorBlob1} pointerEvents="none" />
      <View style={styles.decorBlob2} pointerEvents="none" />
   

      <View
        style ={styles.page}
         
      >
        <View style={styles.headerCard}>
          <Text style={styles.title}>Добро пожаловать 👋</Text>
          <Text style={styles.subtitle}>Выбери раздел, с которым хочешь работать</Text>
        </View>

        <View style={styles.menuCard}>
          <Text style={styles.sectionTitle}>Разделы</Text>
          <SectionsMenu variant="entries" />
        </View>
      </View>
    </SafeAreaView>
  );
}