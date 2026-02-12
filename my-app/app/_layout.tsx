// import { Tabs } from 'expo-router';
//
// export default function TabsLayout() {
//   return (
//     <Tabs>
//       <Tabs.Screen name="(tabs)/index" options={{ title: 'Каталог' }} />
//       <Tabs.Screen name="(tabs)/export" options={{ title: 'Итого' }} />
//       <Tabs.Screen name="(tabs)/test" options={{ title: 'Другое' }} />
//       <Tabs.Screen  name="(tabs)/capital_expenditures"   options={{ href: null,  title: 'Капитальные затраты' }}/>
//       <Tabs.Screen  name="operating_expenses"   options={{ href: null,  title: 'Операционные затраты' }}/>
//       <Tabs.Screen  name="(tabs)/NPV"   options={{ href: null,  title: 'NPV-анализ' }}/>
//     </Tabs>
//   );
//
// }

import { Tabs } from 'expo-router';
import { DataProvider } from './data/DataContext';

export default function TabsLayout() {
  return (
    <DataProvider>
    <Tabs>
    <Tabs.Screen name="(tabs)/index" options={{ title: 'Каталог' }} />
    <Tabs.Screen name="(tabs)/export" options={{ title: 'Итого' }} />
    <Tabs.Screen name="(tabs)/test" options={{ title: 'Другое' }} />
    <Tabs.Screen  name="(tabs)/capital_expenditures"   options={{ href: null,  title: 'Капитальные затраты' }}/>
    <Tabs.Screen  name="(tabs)/operating_expenses"   options={{ href: null,  title: 'Операционные затраты' }}/>
    <Tabs.Screen  name="(tabs)/NPV"   options={{ href: null,  title: 'NPV-анализ' }}/>
    </Tabs>
    </DataProvider>
  );
}
