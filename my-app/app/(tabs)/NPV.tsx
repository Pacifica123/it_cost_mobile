import { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function NPVScreen() {
  const [investment, setInvestment] = useState('1000');
  const [cashflows, setCashflows] = useState('10,20,30,40,100,500,1000');
  const [rate, setRate] = useState('0.1');
  const [results, setResults] = useState<any[]>([]);
  const [npvValues, setNpvValues] = useState<number[]>([]);

  const calculateNPV = () => {
    const I = Number(investment);
    const r = Number(rate);
    const flows = cashflows.split(',').map(Number);

    let cumulative = -I;
    let table: any[] = [];
    let graphData: number[] = [];

    table.push({
      year: 1,
      cft: -I,
      pv: -I,
      npv: cumulative,
    });

    graphData.push(cumulative);

    flows.forEach((cf, index) => {
      const year = index + 2;
      const disc = 1 / Math.pow(1 + r, index + 1);
      const pv = cf * disc;
      cumulative += pv;

      table.push({
        year,
        cft: cf,
        pv: pv.toFixed(2),
        npv: cumulative.toFixed(2),
      });

      graphData.push(Number(cumulative.toFixed(2)));
    });

    setResults(table);
    setNpvValues(graphData);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.wrapper}>
        
        <View style={styles.left}>
          <Text style={styles.title}>Расчет NPV</Text>

          <Text>Начальные инвестиции (I):</Text>
          <TextInput
            style={styles.input}
            value={investment}
            onChangeText={setInvestment}
            keyboardType="numeric"
          />

          <Text>Денежные потоки (через запятую):</Text>
          <TextInput
            style={styles.input}
            value={cashflows}
            onChangeText={setCashflows}
          />

          <Text>Ставка дисконтирования (r):</Text>
          <TextInput
            style={styles.input}
            value={rate}
            onChangeText={setRate}
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.button} onPress={calculateNPV}>
            <Text style={styles.buttonText}>Рассчитать NPV</Text>
          </TouchableOpacity>

           <Text style={styles.title}>График NPV</Text>

          {npvValues.length > 0 && (
            <LineChart
              data={{
                labels: npvValues.map((_, i) => `${i + 1}`),
                datasets: [{ data: npvValues }]
              }}
              width={screenWidth * 0.8}
              height={300}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                labelColor: () => '#000',
              }}
              bezier
              style={{ marginVertical: 8, borderRadius: 10 }}
            />
          )}

          {/* Таблица */}

{/* Таблица NPV */}
{results.length > 0 && (
  <View style={styles.table}>
    {/* Заголовок таблицы */}
    <View style={[styles.row, styles.headerRow]}>
      <Text style={[styles.cell, styles.headerCell]}>Год</Text>
      <Text style={[styles.cell, styles.headerCell]}>CF</Text>
      <Text style={[styles.cell, styles.headerCell]}>PV</Text>
      <Text style={[styles.cell, styles.headerCell]}>NPV</Text>
    </View>

    {/* Данные */}
    {results.map((row, index) => (
      <View key={index} style={styles.row}>
        <Text style={styles.cell}>{row.year}</Text>
        <Text style={styles.cell}>{row.cft}</Text>
        <Text style={styles.cell}>{row.pv}</Text>
        <Text style={styles.cell}>{row.npv}</Text>
      </View>
    ))}
  </View>
)}


        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  wrapper: {
    flexDirection: 'row',
    padding: 20,
  },
  left: {
    flex: 1,
    marginRight: 10,
  },
  right: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    textAlign:'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#16a34a',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
 
  table: {
  marginTop: 10,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 5,
  overflow: 'hidden',
},
headerRow: {
  backgroundColor: '#16a34a',
},
headerCell: {
  color: '#fff',
  fontWeight: 'bold',
},
row: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  padding: 8,
  borderBottomWidth: 1,
   backgroundColor: '#fff',
},
cell: {
  flex: 1,
  textAlign: 'center',
  fontSize: 12,
},

});
