import { Platform, StyleSheet } from 'react-native';

export const index = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },

  // декоративные "пятна" на фоне
  decorBlob1: {
    position: 'absolute',
    top: -120,
    left: -90,
    width: 280,
    height: 280,
    borderRadius: 999,
    backgroundColor: 'rgba(99,102,241,0.22)',
  },
  decorBlob2: {
    position: 'absolute',
    top: 60,
    right: -140,
    width: 340,
    height: 340,
    borderRadius: 999,
    backgroundColor: 'rgba(34,197,94,0.16)',
  },

  page: {
    flexGrow: 1,
    width: '100%',
    alignSelf: 'center',
    maxWidth: 900,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    gap: 12,
  },

  headerCard: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.06)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 2 },
      default: {},
    }),
  },

  title: {
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
    color: '#111827',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(17,24,39,0.7)',
  },

  menuCard: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 22,
    padding: 12,
    
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.06)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 1 },
      default: {},
    }),
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: 'rgba(17,24,39,0.65)',
    paddingHorizontal: 6,
    paddingVertical: 8,
  },

  // список меню
  menuList: {
    paddingHorizontal: 4,
    paddingBottom: 6,
    paddingTop:10,
    gap: 10,
  },

  menuItem: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  menuItemPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.92,
  },

  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 10,
  },

  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(17,24,39,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
    color: '#111827',
  },
  
});